"use server"

import { getEmbedding } from "./generateEmbeddings";
import { scrape } from "./scrape";
import { createClient } from "@/utils/supabase/server";
import { ActionResponse, ContentType, Page, PageSection } from "./types";
import { revalidatePath } from "next/cache";
import { PostgrestError } from "@supabase/supabase-js";
import { auth } from '@clerk/nextjs/server'
import { getChecksum } from "./helper";
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

export const checkDuplicate = async (content: string, type: ContentType): Promise<{isDuplicate: boolean, error: string | null, checksum: string | null}> => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    const checksum = getChecksum(content);

    const { data: existingPage, error: existingPageError } = await supabase
    .from("pages")
    .select()
    .eq("user_id", userId)
    .eq("type", type)
    .eq("checksum", checksum)

    if(existingPageError) throw existingPageError

    return {
      isDuplicate: existingPage.length > 0,
      error: null,
      checksum
    };
  } catch (error) {
    console.error("Error checking for duplicates: ", error);
    return {
      isDuplicate: false,
      error: "Failed to check for duplicates",
      checksum: null
    };
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
    const { data: pageId, error: addPageError } = await supabase.rpc("add_page", { 
      user_id_input: userId,
      name_input: title,
      page_content: markdown, 
      page_section_data_input: embeddings,
      type_input: "website",
      path_input: url,
      checksum_input: checksum
    })
    .returns<number>();

    if(addPageError) throw addPageError

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

export const saveLink = async (url: string): Promise<ActionResponse<Page | null>> => {
  console.log("[saveLink] Starting for URL:", url);
  const supabase = await createClient();
  const { userId } = await auth();
  console.log("[saveLink] Authenticated user:", userId);

  try {
    // 1. Quick title fetch — only downloads <head>, aborts after
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

    // 2. Duplicate check by URL (fast)
    console.log("[saveLink] Checking for duplicates...");
    const { data: existing, error: dupError } = await supabase
      .from("pages")
      .select("id")
      .eq("user_id", userId)
      .eq("path", url)
      .eq("type", "website")
      .limit(1);

    if (dupError) throw dupError;

    if (existing && existing.length > 0) {
      console.log("[saveLink] Duplicate found, aborting");
      return { data: null, error: "duplicate" };
    }
    console.log("[saveLink] No duplicate found");

    // 3. Insert minimal row with status = 'indexing'
    console.log("[saveLink] Inserting page row...");
    const { data: page, error: insertError } = await supabase
      .from("pages")
      .insert({
        user_id: userId,
        name: title,
        path: url,
        type: "website",
        status: "indexing",
        content: null,
        checksum: "",
      })
      .select()
      .single();

    if (insertError) throw insertError;
    console.log("[saveLink] Page inserted with id:", page.id);

    // 4. Schedule background indexing — runs AFTER the response is sent
    console.log("[saveLink] Scheduling background indexing via after()");
    after(async () => {
      console.log("[saveLink:after] Background callback started for page:", page.id);
      await indexPage(page.id, url);
      console.log("[saveLink:after] Background callback completed for page:", page.id);
    });

    revalidateLibrary();

    // 5. Return immediately — client shows title + favicon
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

const indexPage = async (pageId: number, url: string) => {
  console.log("[indexPage] Starting background indexing for page:", pageId, "url:", url);
  const supabase = await createClient();

  try {
    // 1. Full scrape
    console.log("[indexPage] Scraping full content...");
    const { title, markdown } = await scrape(url);
    console.log("[indexPage] Scrape complete — title:", title, "markdown length:", markdown.length);
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
      user_id_input: userId,
      name_input: title,
      page_content: note,
      page_section_data_input: embeddings,
      type_input: "note",
      path_input: null,
      checksum_input: checksum
    })
    .returns<number>();

    if (addPageError) throw addPageError

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

    const { data: pages, error } = await supabase
    .from("pages")
    .select()
    .eq("user_id", userId)
    .in("type", page_type)
    .order("created_at", { ascending: false })

    if (error) throw error

    return pages as Page[]
  } catch (error) {
    console.error(error);
    return []
  }
}

export const deletePage = async (pageId: string): Promise<ActionResponse<Page | null>> => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    const { data, error } = await supabase
    .from("pages")
    .delete()
    .eq("user_id", userId)
    .eq("id", pageId)
    .select()

    if (error) throw error
    
    revalidateLibrary();
    
    return {
      data: (data as Page[])[0],
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

export const fetchPage = async (pageId: string): Promise<ActionResponse<{name: string, content: string, created_at: string} | null>> => {
  const supabase = await createClient();
  const { userId } = await auth()

  try {
    const { data, error } = await supabase
    .from("pages")
    .select("name, content, created_at")
    .eq("user_id", userId)
    .eq("id", pageId)

    if (error) throw error

    return {
      data: (data as {name: string, content: string, created_at: string}[])[0],
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