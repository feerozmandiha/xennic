import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IEvidenceChainService } from '../../domain/interfaces/evidence-chain.interface.js';
import type { EvidenceChain } from '../../domain/types/rag.types.js';

@Injectable()
export class EvidenceChainService implements IEvidenceChainService {
  private readonly logger = new Logger(EvidenceChainService.name);

  create(params: {
    traceId: string;
    question: string;
    retrievedChunks: EvidenceChain['retrievedChunks'];
    rankingScores: EvidenceChain['rankingScores'];
    selectedEvidence: EvidenceChain['selectedEvidence'];
    reasoningReferences: string[];
    generatedAnswer: string;
    citations: EvidenceChain['citations'];
    finalConfidence: number;
    timestamps: EvidenceChain['timestamps'];
  }): EvidenceChain {
    const chain: EvidenceChain = {
      traceId: params.traceId,
      question: params.question,
      retrievedChunks: params.retrievedChunks,
      rankingScores: params.rankingScores,
      selectedEvidence: params.selectedEvidence,
      reasoningReferences: params.reasoningReferences,
      generatedAnswer: params.generatedAnswer,
      citations: params.citations,
      finalConfidence: params.finalConfidence,
      timestamps: params.timestamps,
    };

    this.logger.debug(`Evidence chain created: ${params.traceId}`);
    return chain;
  }

  verifyChain(chain: EvidenceChain): boolean {
    if (!chain.traceId || !chain.question) return false;
    if (!chain.retrievedChunks.length) return false;
    if (!chain.selectedEvidence.length) return false;
    if (!chain.generatedAnswer) return false;
    if (!chain.citations.length) return false;

    const hasValidCitations = chain.citations.every((c) => {
      const hasStatement = !!c.statement;
      const hasEvidence = !!c.evidence.documentXid;
      const hasConfidence = typeof c.confidence === 'number' && c.confidence >= 0 && c.confidence <= 1;
      return hasStatement && hasEvidence && hasConfidence;
    });

    if (!hasValidCitations) return false;

    const timestampsValid =
      chain.timestamps.retrieval > 0 &&
      chain.timestamps.ranking > 0 &&
      chain.timestamps.contextBuilding > 0 &&
      chain.timestamps.generation > 0 &&
      chain.timestamps.validation > 0;

    return timestampsValid;
  }

  getTraceId(): string {
    return randomUUID();
  }
}
