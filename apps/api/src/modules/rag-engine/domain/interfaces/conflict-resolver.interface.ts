import type {
  RetrievalChunk,
  ConflictResolution,
} from '../types/rag.types.js';

export interface IConflictResolver {
  resolve(conflictingChunks: RetrievalChunk[], claim: string): Promise<ConflictResolution>;
  getPriorityScore(source: RetrievalChunk): number;
  explainPriority(chunk: RetrievalChunk): string;
}
