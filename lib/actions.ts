"use server"

import { getEmbedding } from "./generateEmbeddings";
import { scrape } from "./scrape";
import { createClient } from "@/utils/supabase/server";
import { ActionResponse, ContentType, Page, PageSection } from "./types";
import { revalidatePath } from "next/cache";
import { PostgrestError } from "@supabase/supabase-js";
import { auth } from '@clerk/nextjs/server'
import { getChecksum, normalizeUrl } from "./helper";
import splitter from "./splitter";
import { FeatureExtractionOutput } from "@huggingface/inference";
import { after } from "next/server";
import fetchMeta from "fetch-meta-tags";

const revalidateLibrary = () => {
  revalidatePath('/dashboard/library');
}

export const scrapeUrl = async (url: string): Promise<{success: boolean, data: {title: string, markdown: string} | null}> => {
  try {
    const {title, markdown} = await scrape(url);
    return {
      success: true,
      data: {
        title,
        markdown
      }
    };
  } catch (error) {
    console.error("Error scraping URL: ", error);

    return {
      success: false,
      data: null
    }
  }
}


export const generateTextEmbedding = async (text: string) => {
  try {
    const textChunks = await splitter.splitText(text);

    const processedData = await Promise.all(
      textChunks.map(async (chunk) => {
        const response = await getEmbedding(chunk);

        return {
          content: chunk,
          embedding: response
        }
      })
    );

    return processedData;
  } catch (error) {
    console.error("Error generating embeddings: ", error);
    return [];
  }
}

export const saveWebsite = async (markdown: string, title: string, url: string, checksum: string, embeddings: { content: string, embedding: FeatureExtractionOutput }[]): Promise<ActionResponse<Page | null>> => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    const normalized = normalizeUrl(url);

    // 1. Check if page exists globally by URL
    const { data: existing, error: lookupError } = await supabase
      .from("pages")
      .select("id, checksum")
      .eq("path", normalized)
      .eq("type", "website")
      .limit(1);

    if (lookupError) throw lookupError;

    let pageId: number;

    if (existing && existing.length > 0) {
      pageId = existing[0].id;

      // Check if user is already linked
      const { data: link } = await supabase
        .from("user_pages")
        .select("id")
        .eq("user_id", userId)
        .eq("page_id", pageId)
        .limit(1);

      if (link && link.length > 0) {
        return { data: null, error: "duplicate" };
      }

      // Link user to existing page
      const { error: linkError } = await supabase
        .from("user_pages")
        .insert({ user_id: userId, page_id: pageId });

      if (linkError) throw linkError;

      // If content changed, update page + re-embed
      if (existing[0].checksum !== checksum) {
        // Delete old sections and re-insert
        await supabase.from("page_sections").delete().eq("page_id", pageId);

        const { error: sectionsError } = await supabase.rpc("add_page_sections", {
          page_id_input: pageId,
          page_section_data_input: embeddings,
        });
        if (sectionsError) throw sectionsError;

        const { error: updateError } = await supabase
          .from("pages")
          .update({ name: title, content: markdown, checksum, status: "ready" })
          .eq("id", pageId);
        if (updateError) throw updateError;
      }
    } else {
      // 2. Create new page + link
      const { data: newPageId, error: addPageError } = await supabase.rpc("add_page", {
        name_input: title,
        page_content: markdown,
        page_section_data_input: embeddings,
        type_input: "website",
        path_input: normalized,
        checksum_input: checksum
      }).returns<number>();

      if (addPageError) throw addPageError;
      pageId = newPageId as number;

      const { error: linkError } = await supabase
        .from("user_pages")
        .insert({ user_id: userId, page_id: pageId });
      if (linkError) throw linkError;
    }

    // Fetch the page to return
    const { data: page, error: getPageError } = await supabase
      .from("pages")
      .select()
      .eq("id", pageId)
      .returns<Page[]>();

    if (getPageError) throw getPageError;

    revalidateLibrary();

    return {
      data: page[0],
      error: null
    }
  } catch (error) {
    console.error(error);

    return {
      data: null,
      error: typeof error === "string" ? error : (error as PostgrestError).message
    }
  }
}

export const saveLink = async (url: string): Promise<ActionResponse<Page | null>> => {
  console.log("[saveLink] Starting for URL:", url);
  const supabase = await createClient();
  const { userId } = await auth();
  console.log("[saveLink] Authenticated user:", userId);

  try {
    const normalized = normalizeUrl(url);

    // 1. Quick title fetch
    console.log("[saveLink] Fetching metadata...");
    let title: string;
    try {
      const meta = await fetchMeta(url);
      title = meta?.title || new URL(url).hostname;
      console.log("[saveLink] Metadata fetched — title:", title);
    } catch (metaError) {
      title = new URL(url).hostname;
      console.log("[saveLink] Metadata fetch failed, using hostname:", title, metaError);
    }

    // 2. Global duplicate check by URL
    console.log("[saveLink] Checking for existing page...");
    const { data: existing, error: lookupError } = await supabase
      .from("pages")
      .select("id, status")
      .eq("path", normalized)
      .eq("type", "website")
      .limit(1);

    if (lookupError) throw lookupError;

    if (existing && existing.length > 0) {
      const existingPage = existing[0];

      // Check if current user is already linked
      const { data: link } = await supabase
        .from("user_pages")
        .select("id")
        .eq("user_id", userId)
        .eq("page_id", existingPage.id)
        .limit(1);

      if (link && link.length > 0) {
        console.log("[saveLink] User already linked to this page, returning duplicate");
        return { data: null, error: "duplicate" };
      }

      // Link user to existing page
      console.log("[saveLink] Linking user to existing page:", existingPage.id);
      const { error: linkError } = await supabase
        .from("user_pages")
        .insert({ user_id: userId, page_id: existingPage.id });
      if (linkError) throw linkError;

      // Handle re-indexing based on status
      if (existingPage.status === "ready") {
        // Re-scrape in background to check for content changes
        console.log("[saveLink] Page is ready, scheduling freshness check");
        after(async () => {
          await reindexIfStale(existingPage.id, url);
        });
      } else if (existingPage.status === "failed") {
        // Retry indexing
        console.log("[saveLink] Page previously failed, retrying indexing");
        after(async () => {
          await indexPage(existingPage.id, url);
        });
      }
      // If 'indexing', do nothing — already in progress

      // Fetch full page to return
      const { data: page, error: fetchError } = await supabase
        .from("pages")
        .select()
        .eq("id", existingPage.id)
        .single();

      if (fetchError) throw fetchError;

      revalidateLibrary();
      return { data: page as Page, error: null };
    }

    // 3. No existing page — create new one
    console.log("[saveLink] Inserting new page...");
    const { data: page, error: insertError } = await supabase
      .from("pages")
      .insert({
        name: title,
        path: normalized,
        type: "website",
        status: "indexing",
        content: null,
        checksum: "",
      })
      .select()
      .single();

    if (insertError) throw insertError;
    console.log("[saveLink] Page inserted with id:", page.id);

    // Link user
    const { error: linkError } = await supabase
      .from("user_pages")
      .insert({ user_id: userId, page_id: page.id });
    if (linkError) throw linkError;

    // 4. Schedule background indexing
    console.log("[saveLink] Scheduling background indexing via after()");
    after(async () => {
      console.log("[saveLink:after] Background callback started for page:", page.id);
      await indexPage(page.id, url);
      console.log("[saveLink:after] Background callback completed for page:", page.id);
    });

    revalidateLibrary();

    console.log("[saveLink] Returning response to client");
    return { data: page as Page, error: null };
  } catch (error) {
    console.error("[saveLink] Error:", error);
    return {
      data: null,
      error: typeof error === "string" ? error : (error as PostgrestError).message,
    };
  }
};

const reindexIfStale = async (pageId: number, url: string) => {
  console.log("[reindexIfStale] Checking freshness for page:", pageId);
  const supabase = await createClient();

  try {
    // Scrape current content
    const { title, markdown, author } = await scrape(url);
    const newChecksum = getChecksum(markdown);

    // Compare with stored checksum
    const { data: page } = await supabase
      .from("pages")
      .select("checksum")
      .eq("id", pageId)
      .single();

    if (page?.checksum === newChecksum) {
      console.log("[reindexIfStale] Content unchanged, skipping re-index");
      return;
    }

    console.log("[reindexIfStale] Content changed, re-indexing page:", pageId);

    // Mark as indexing
    await supabase.from("pages").update({ status: "indexing" }).eq("id", pageId);

    // Chunk + embed
    const textChunks = await splitter.splitText(markdown);
    const embeddings = await Promise.all(
      textChunks.map(async (chunk) => {
        const embedding = await getEmbedding(chunk);
        return { content: chunk, embedding };
      })
    );

    // Delete old sections and insert new ones
    await supabase.from("page_sections").delete().eq("page_id", pageId);

    const { error: sectionsError } = await supabase.rpc("add_page_sections", {
      page_id_input: pageId,
      page_section_data_input: embeddings,
    });
    if (sectionsError) throw sectionsError;

    // Update page
    const { error: updateError } = await supabase
      .from("pages")
      .update({
        name: title,
        content: markdown,
        checksum: newChecksum,
        status: "ready",
        author,
      })
      .eq("id", pageId);

    if (updateError) throw updateError;
    console.log("[reindexIfStale] Page", pageId, "re-indexed successfully");

    revalidateLibrary();
  } catch (error) {
    console.error("[reindexIfStale] Failed for page:", pageId, error);
    await supabase.from("pages").update({ status: "failed" }).eq("id", pageId);
  }
};

const indexPage = async (pageId: number, url: string) => {
  console.log("[indexPage] Starting background indexing for page:", pageId, "url:", url);
  const supabase = await createClient();

  try {
    // 1. Full scrape
    console.log("[indexPage] Scraping full content...");
    const { title, markdown, author } = await scrape(url);
    console.log("[indexPage] Scrape complete — title:", title, "markdown length:", markdown.length, "author:", author);
    const checksum = getChecksum(markdown);
    console.log("[indexPage] Checksum:", checksum);

    // 2. Chunk + embed
    console.log("[indexPage] Splitting text into chunks...");
    const textChunks = await splitter.splitText(markdown);
    console.log("[indexPage] Created", textChunks.length, "chunks");

    console.log("[indexPage] Generating embeddings...");
    const embeddings = await Promise.all(
      textChunks.map(async (chunk, i) => {
        const embedding = await getEmbedding(chunk);
        console.log(`[indexPage] Embedded chunk ${i + 1}/${textChunks.length}`);
        return { content: chunk, embedding };
      })
    );
    console.log("[indexPage] All embeddings generated");

    // 3. Insert page sections
    console.log("[indexPage] Inserting page sections...");
    const { error: sectionsError } = await supabase.rpc("add_page_sections", {
      page_id_input: pageId,
      page_section_data_input: embeddings,
    });

    if (sectionsError) throw sectionsError;
    console.log("[indexPage] Page sections inserted");

    // 4. Update page with content + status = 'ready'
    console.log("[indexPage] Updating page status to 'ready'...");
    const { error: updateError } = await supabase
      .from("pages")
      .update({
        name: title,
        content: markdown,
        checksum,
        status: "ready",
        author,
      })
      .eq("id", pageId);

    if (updateError) throw updateError;
    console.log("[indexPage] Page", pageId, "is now ready");

    revalidateLibrary();
  } catch (error) {
    console.error("[indexPage] Background indexing failed for page:", pageId, error);

    // Mark as failed so the client can show an error state
    await supabase
      .from("pages")
      .update({ status: "failed" })
      .eq("id", pageId);
    console.log("[indexPage] Page", pageId, "marked as failed");
  }
};

export const saveNote = async (title: string, note: string, checksum: string, embeddings: { content: string, embedding: FeatureExtractionOutput }[]): Promise<ActionResponse<Page | null>> => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    console.log("Saving the data to the database");

    const { data: pageId, error: addPageError } = await supabase.rpc("add_page", {
      name_input: title,
      page_content: note,
      page_section_data_input: embeddings,
      type_input: "note",
      path_input: null,
      checksum_input: checksum
    })
    .returns<number>();

    if (addPageError) throw addPageError

    // Link user to the new note
    const { error: linkError } = await supabase
      .from("user_pages")
      .insert({ user_id: userId, page_id: pageId });
    if (linkError) throw linkError;

    console.log("Embeddings Data added to the database");

    const { data: page, error: getPageError } = await supabase
    .from("pages")
    .select()
    .eq("id", pageId)
    .returns<Page[]>();

    if (getPageError) throw getPageError
    revalidateLibrary();

    return {
      data: page[0],
      error: null
    }
  } catch (error) {
    console.error(error);

    return {
      data: null,
      error: typeof error === "string" ? error : (error as PostgrestError).message
    }
  }
}

export const searchQuery = async (query: string, page_type: "all" | "website" | "note") => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    console.log("Get Vectors for the search query")
    const embeddings = await getEmbedding(query);

    console.log("Searching for similar embeddings in the database");

    const { data, error } = await supabase.rpc("get_matched_pages", {
      user_id_input: userId,
      query_embedding: embeddings,
      match_limit: 5,
      ...(page_type !== "all" ? { type_input: page_type } : {})
    })

    if(error) throw error

    return data as Page[]

  } catch (error) {
    console.error(error);
    return []
  }
}

export const searchPageSections = async (query: string, page_type: "all" | "website" | "note") => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    console.log("Get Vectors for the search query")
    const embeddings = await getEmbedding(query);

    console.log("Searching for similar embeddings in the database");

    const { data, error } = await supabase.rpc("get_matched_page_sections", {
      user_id_input: userId,
      query_embedding: embeddings,
      match_limit: 5,
      ...(page_type !== "all" ? { type_input: page_type } : {})
    })

    if (error || !data) throw error

    return (data as PageSection[]).map(({ section_content, similarity }) => ({
      content: section_content,
      similarity
    }))
  } catch (error) {
    console.error("Error in searchPageSections: ", error);
  }
}

export const fetchPages = async (type: ContentType) => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    const page_type = type === "all" ? ["website", "note"] : [type];

    const { data, error } = await supabase
      .from("user_pages")
      .select("is_read, note, page:pages(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Flatten: merge junction fields into each page
    const pages = (data as any[] ?? [])
      .filter((row) => row.page !== null)
      .filter((row) => page_type.includes(row.page.type))
      .map((row) => ({
        ...row.page,
        is_read: row.is_read,
        note: row.note,
      }));

    return pages as Page[];
  } catch (error) {
    console.error(error);
    return []
  }
}

export const toggleReadStatus = async (pageId: string, isRead: boolean) => {
  const supabase = await createClient();
  const { userId } = await auth();

  const { error } = await supabase
    .from("user_pages")
    .update({ is_read: isRead })
    .eq("page_id", pageId)
    .eq("user_id", userId);

  if (error) throw new Error("Failed to update read status");

  revalidatePath("/library");
}

export const deletePage = async (pageId: string): Promise<ActionResponse<Page | null>> => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    // 1. Remove the user's link
    const { error: unlinkError } = await supabase
      .from("user_pages")
      .delete()
      .eq("user_id", userId)
      .eq("page_id", pageId);

    if (unlinkError) throw unlinkError;

    // 2. Check if any other users still reference this page
    const { count, error: countError } = await supabase
      .from("user_pages")
      .select("id", { count: "exact", head: true })
      .eq("page_id", pageId);

    if (countError) throw countError;

    // 3. If no references remain, delete the page itself (cascades to page_sections)
    if (count === 0) {
      const { error: deleteError } = await supabase
        .from("pages")
        .delete()
        .eq("id", pageId);

      if (deleteError) throw deleteError;
    }

    revalidateLibrary();

    return {
      data: null,
      error: null
    }
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: typeof error === "string" ? error : (error as PostgrestError).message
    }
  }
}

export const fetchPage = async (pageId: string): Promise<ActionResponse<{name: string, content: string, created_at: string, author: string | null} | null>> => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    // Verify user has access via user_pages
    const { data: link, error: linkError } = await supabase
      .from("user_pages")
      .select("id")
      .eq("user_id", userId)
      .eq("page_id", pageId)
      .limit(1);

    if (linkError) throw linkError;
    if (!link || link.length === 0) {
      return { data: null, error: "Not found" };
    }

    const { data, error } = await supabase
      .from("pages")
      .select("name, content, created_at, author")
      .eq("id", pageId);

    if (error) throw error

    return {
      data: (data as {name: string, content: string, created_at: string, author: string | null}[])[0],
      error: null
    }
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: typeof error === "string" ? error : (error as PostgrestError).message
    }
  }
}

export const updatePageNote = async (pageId: string, note: string | null) => {
  const supabase = await createClient();
  const { userId } = await auth();

  const { error } = await supabase
    .from("user_pages")
    .update({
      note,
      note_updated_at: new Date().toISOString(),
    })
    .eq("page_id", pageId)
    .eq("user_id", userId);

  if (error) throw new Error("Failed to update note");

  revalidateLibrary();
}
