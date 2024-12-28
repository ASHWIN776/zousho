export interface Page {
  id: string;
  name: string;
  path: string
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
