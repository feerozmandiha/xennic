import type {
  RagQuery,
  RetrievalChunk,
  Citation,
  EvidenceChain,
} from '../types/rag.types.js';

export interface IEvidenceChainService {
  create(params: {
    traceId: string;
    question: string;
    retrievedChunks: RetrievalChunk[];
    rankingScores: Record<string, number>;
    selectedEvidence: RetrievalChunk[];
    reasoningReferences: string[];
    generatedAnswer: string;
    citations: Citation[];
    finalConfidence: number;
    timestamps: {
      retrieval: number;
      ranking: number;
      contextBuilding: number;
      generation: number;
      validation: number;
    };
  }): EvidenceChain;
  verifyChain(chain: EvidenceChain): boolean;
  getTraceId(): string;
}
