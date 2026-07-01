import type {
  RetrievalChunk,
  RagContext,
  ContextNode,
  TierLevel,
} from '../types/rag.types.js';

export interface IContextBuilder {
  build(chunks: RetrievalChunk[], maxTokens?: number): Promise<RagContext>;
  prioritizeByTier(chunks: RetrievalChunk[]): ContextNode[];
  deduplicate(nodes: ContextNode[]): ContextNode[];
  estimateTokens(text: string): number;
  getTierLevel(tier: string): TierLevel;
}
