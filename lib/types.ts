export type ContentType = "all" | "website" | "note";

export type PageStatus = "indexing" | "ready" | "failed";

export interface Page {
  id: string;
  name: string;
  path: string;
  max_similarity: number | null;
  created_at: string;
  type: ContentType;
  status: PageStatus;
  is_read: boolean;
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

export interface ActionResponse<T>{
  data: T;
  error: string | null;
}

export interface PageSection {
  page_id: number,
  section_id: number,
  section_content: string,
  similarity: number
}
