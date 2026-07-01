import type {
  Citation,
  RetrievalChunk,
} from '../types/rag.types.js';

export interface ICitationEngine {
  generateCitations(
    statements: string[],
    evidence: RetrievalChunk[],
  ): Promise<Citation[]>;
  validateCitation(citation: Citation): boolean;
  buildCitationChain(citations: Citation[]): string[][];
}
