export interface SearchOptions {
  types?: string[];
  limit?: number;
  offset?: number;
  minScore?: number;
  filters?: Record<string, unknown>;
}

export interface Citation {
  sourceDocumentName: string;
  chunkTextExcerpt: string;
  pageReference: string | null;
  relevanceScore: number;
}

export interface SearchResultItem {
  chunkId: string;
  documentId: string;
  documentName: string;
  excerpt: string;
  score: number;
  confidence: number;
  metadata: Record<string, unknown>;
  sourceType: string;
  citation: Citation;
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  query: string;
  took: number;
}
