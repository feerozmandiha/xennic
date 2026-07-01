export type ChunkType = 'text' | 'heading' | 'table' | 'formula';

export interface DocumentChunk {
  chunkId: string;
  docId: string;
  workspaceId: string;
  content: string;
  heading?: string;
  chunkType: ChunkType;
  index: number;
  metadata: {
    headings?: string[];
    tables?: string[];
    formulas?: string[];
    crossReferences?: string[];
    pageNumber?: number;
  };
  tokenCount?: number;
}

export interface EmbeddingResult {
  chunkId: string;
  embedding: number[];
  dimensions: number;
}

export interface SearchResult {
  chunkId: string;
  score: number;
  payload: Record<string, unknown>;
}

export interface QdrantFilter {
  should?: QdrantFilter[];
  must?: QdrantFilter[];
  must_not?: QdrantFilter[];
  key?: string;
  match?: { value: string };
  range?: { gte?: number; lte?: number; gt?: number; lt?: number };
}
