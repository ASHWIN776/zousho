"use server"

import { generateTextEmbedding, getEmbedding } from "./generateEmbeddings";
import { scrape } from "./scrape";
import { createClient } from "@/utils/supabase/server";
import { ActionResponse, ContentType, Page } from "./types";
import { revalidatePath } from "next/cache";
import { PostgrestError } from "@supabase/supabase-js";

const revalidateLibrary = () => {
  revalidatePath('/dashboard/library');
}

export const saveUrl = async (url: string): Promise<ActionResponse<Page | null>> => {
  const supabase = await createClient();

  try {
    console.log("Scraping URL: ", url);
    const {title, markdown} = await scrape(url);
    console.log("Scraped URL: ", title);

    console.log("Generating embeddings for the markdown");

    const allEmbeddings = await generateTextEmbedding(markdown);

    console.log("Embeddings generated");

    console.log("Saving the data to the database");

    const { data: pageId, error: addPageError } = await supabase.rpc("add_page", { 
      name_input: title,
      page_content: markdown, 
      page_section_data_input: allEmbeddings,
      type_input: "website",
      path_input: url
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

export const saveNote = async (title: string, note: string): Promise<ActionResponse<Page | null>> => {
  const supabase = await createClient();

  try {
    console.log("Generating embeddings for the notes");

    // Generate embeddings for the title and note
    const allEmbeddings = await generateTextEmbedding(`#${title} ${note}`);
    console.log("Embeddings generated");
    console.log("Saving the data to the database");

    const { data: pageId, error: addPageError } = await supabase.rpc("add_page", {
      name_input: title,
      page_content: note,
      page_section_data_input: allEmbeddings,
      type_input: "note",
      path_input: null
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

  try {
    console.log("Get Vectors for the search query")
    const embeddings = await getEmbedding(query);

    console.log("Searching for similar embeddings in the database");

    const { data, error } = await supabase.rpc("get_matched_pages", {
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

  try {
    console.log("Get Vectors for the search query")
    const embeddings = await getEmbedding(query);

    console.log("Searching for similar embeddings in the database");

    const { data, error } = await supabase.rpc("get_matched_page_sections", {
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

  try {
    const page_type = type === "all" ? ["website", "note"] : [type];

    const { data: pages, error } = await supabase
    .from("pages")
    .select()
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