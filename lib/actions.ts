"use server"

import { generateTextEmbedding, getEmbedding } from "./generateEmbeddings";
import { scrape } from "./scrape";
import { createClient } from "@/utils/supabase/server";

export const saveUrl = async (url: string) => {
  const supabase = await createClient();

  try {
    console.log("Scraping URL: ", url);
    const {title, markdown} = await scrape(url);
    console.log("Scraped URL: ", title);

    console.log("Generating embeddings for the markdown");

    const allEmbeddings = await generateTextEmbedding(markdown);

    console.log("Embeddings generated");

    console.log("Saving the data to the database");

    const { error} = await supabase.rpc("add_page", { 
      name_input: title, 
      page_section_data_input: allEmbeddings,
      type_input: "website",
      path_input: url, 
    })

    if(error) throw error

    console.log("Embeddings Data added to the database");
  } catch (error) {
    console.error(error);
  }
}

export const saveNote = async (title: string, note: string) => {
  const supabase = await createClient();

  try {
    console.log("Generating embeddings for the notes");

    // Generate embeddings for the title and note
    const allEmbeddings = await generateTextEmbedding(`#${title} ${note}`);
    console.log("Embeddings generated");
    console.log("Saving the data to the database");

    const { error } = await supabase.rpc("add_page", {
      name_input: title,
      page_section_data_input: allEmbeddings,
      type_input: "note",
      path_input: null
    })

    if (error) throw error

    console.log("Embeddings Data added to the database");
  } catch (error) {
    console.error(error);
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
    }).returns<{name: string, path: string, max_similarity: number}[]>();

    if(error) throw error

    return data
    
  } catch (error) {
    console.error(error);
  }
}