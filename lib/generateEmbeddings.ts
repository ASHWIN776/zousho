import { HfInference } from '@huggingface/inference'
import { TokenTextSplitter } from "langchain/text_splitter";

const hf = new HfInference(process.env.HF_TOKEN)
const splitter = new TokenTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100
});

export const getEmbedding = async (text: string) => {
  return hf.featureExtraction({
    model: "Snowflake/snowflake-arctic-embed-l",
    inputs: text,
  });
}

export const generateMarkdownEmbedding = async (markdown: string) => {
  const textChunks = await splitter.splitText(markdown);

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
}