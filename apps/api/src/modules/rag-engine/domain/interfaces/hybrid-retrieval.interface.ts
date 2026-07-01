import type {
  RagQuery,
  RetrievalChunk,
} from '../types/rag.types.js';

export interface RetrievalOptions {
  denseWeight?: number;
  sparseWeight?: number;
  rrfK?: number;
  topK?: number;
}

export interface IHybridRetrievalService {
  retrieve(query: RagQuery, options?: RetrievalOptions): Promise<RetrievalChunk[]>;
  denseSearch(query: RagQuery, options?: RetrievalOptions): Promise<RetrievalChunk[]>;
  sparseSearch(query: RagQuery, options?: RetrievalOptions): Promise<RetrievalChunk[]>;
  fuseResults(
    dense: RetrievalChunk[],
    sparse: RetrievalChunk[],
    options?: RetrievalOptions,
  ): RetrievalChunk[];
}
