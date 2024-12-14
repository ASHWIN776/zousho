export interface Page {
  id: string;
  name: string;
  path: string
}

export interface ResultType {
  name: string;
  path: string;
  max_similarity: number;
}
