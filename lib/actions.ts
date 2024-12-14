"use server"

import { revalidatePath } from "next/cache";
import { generateMarkdownEmbedding, getEmbedding } from "./generateEmbeddings";
import { scrape } from "./scrape";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const saveUrl = async (url: string) => {
  const supabase = await createClient();

  try {
    console.log("Scraping URL: ", url);
    const {title, markdown} = await scrape(url);
    console.log("Scraped URL: ", title);
    console.log("Generating embeddings for the markdown");
    const allEmbeddings = await generateMarkdownEmbedding(markdown);
    console.log("Embeddings generated");

    console.log("Saving the data to the database");

    // Save the embeddings to supabase
    const { data: pageData, error } = await supabase
    .from("pages")
    .insert({
      name: title,
      path: url,
    })
    .select()

    if(error) throw error

    console.log("Page Data", pageData);

    const embeddings = allEmbeddings.map((embedding, index) => ({
      page_id: pageData[0].id,
      content: embedding.content,
      embedding: embedding.embedding,
    }));

    // Save the embeddings to supabase
    const { error: embeddingsError } = await supabase.from("page_sections").insert(embeddings)

    if(embeddingsError) throw embeddingsError

    console.log("Embeddings Data added to the database");
  } catch (error) {
    console.error(error);
  }
}

export const searchQuery = async (query: string) => {
  const supabase = await createClient();

  try {
    console.log("Get Vectors for the search query")
    const embeddings = await getEmbedding(query);

    console.log("Searching for similar embeddings in the database");

    const { data, error } = await supabase.rpc("get_matched_pages", {
      query_embedding: embeddings,
      match_limit: 5
    }).returns<{name: string, path: string, max_similarity: number}[]>();

    if(error) throw error

    return data
    
  } catch (error) {
    console.error(error);
  }
}