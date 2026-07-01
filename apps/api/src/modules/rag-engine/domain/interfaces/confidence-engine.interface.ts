import type {
  RetrievalChunk,
  Citation,
  ConfidenceScore,
} from '../types/rag.types.js';

export interface IConfidenceEngine {
  calculate(
    evidence: RetrievalChunk[],
    citations: Citation[],
    retrievalScores: number[],
  ): Promise<ConfidenceScore>;
  calculateAuthorityScore(chunks: RetrievalChunk[]): number;
  calculateEvidenceCoverage(citations: Citation[], expectedCount: number): number;
  calculateAgreement(chunks: RetrievalChunk[]): number;
  calculateChunkQuality(chunks: RetrievalChunk[]): number;
  calculateRetrievalScore(scores: number[]): number;
  calculateVersionStatusScore(chunks: RetrievalChunk[]): number;
}
