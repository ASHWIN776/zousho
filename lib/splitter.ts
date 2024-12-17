import { TokenTextSplitter } from "langchain/text_splitter";

const splitter = new TokenTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100
});

export default splitter;