import { HfInference } from '@huggingface/inference'
import splitter from './splitter';

const hf = new HfInference(process.env.HF_TOKEN)

export const getEmbedding = async (text: string) => {
  return hf.featureExtraction({
    model: "Snowflake/snowflake-arctic-embed-l",
    inputs: text,
  });
}

export const generateTextEmbedding = async (text: string) => {
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
}