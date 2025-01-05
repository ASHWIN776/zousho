export type ContentType = "all" | "website" | "note";

export interface Page {
  id: string;
  name: string;
  path: string;
  max_similarity: number | number;
}

export interface ResultType {
  id: number;
  name: string;
  path: string;
  max_similarity: number;
}

export interface NoteContext {
  content: string;
  similarity: number;
}
