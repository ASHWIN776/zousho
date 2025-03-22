"use server"

import { getEmbedding } from "./generateEmbeddings";
import { scrape } from "./scrape";
import { createClient } from "@/utils/supabase/server";
import { ActionResponse, ContentType, Page } from "./types";
import { revalidatePath } from "next/cache";
import { PostgrestError } from "@supabase/supabase-js";
import { auth } from '@clerk/nextjs/server'
import { getChecksum } from "./helper";
import splitter from "./splitter";
import { FeatureExtractionOutput } from "@huggingface/inference";

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
    }).returns<Page[]>();

    if(error) throw error

    return data
    
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
    }).returns<{
      page_id: number,
      section_id: number,
      section_content: string,
      similarity: number
    }[]>();

    if (error) throw error

    return data.map(({ section_content, similarity }) => ({
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
    .returns<Page[]>();

    if (error) throw error

    return pages
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
    .returns<Page[]>();

    if (error) throw error
    
    revalidateLibrary();
    
    return {
      data: data[0],
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