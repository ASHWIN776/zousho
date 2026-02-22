import { InferenceClient } from '@huggingface/inference'

const hf = new InferenceClient(process.env.HF_TOKEN)

export const getEmbedding = async (text: string) => {
  return hf.featureExtraction({
    model: "Snowflake/snowflake-arctic-embed-l",
    inputs: text,
  });
}