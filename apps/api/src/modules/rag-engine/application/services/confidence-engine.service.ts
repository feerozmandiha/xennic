import { Injectable } from '@nestjs/common';
import type { IConfidenceEngine } from '../../domain/interfaces/confidence-engine.interface.js';
import type { RetrievalChunk, Citation, ConfidenceScore } from '../../domain/types/rag.types.js';

@Injectable()
export class ConfidenceEngine implements IConfidenceEngine {
  async calculate(
    evidence: RetrievalChunk[],
    citations: Citation[],
    retrievalScores: number[],
  ): Promise<ConfidenceScore> {
    if (!evidence.length && !citations.length && !retrievalScores.length) {
      return {
        overall: 0,
        factors: { authorityScore: 0, evidenceCoverage: 0, agreement: 0, chunkQuality: 0, retrievalScore: 0, versionStatus: 0 },
      };
    }
    const authorityScore = this.calculateAuthorityScore(evidence);
    const expectedCount = Math.max(evidence.length, 1);
    const evidenceCoverage = this.calculateEvidenceCoverage(citations, expectedCount);
    const agreement = this.calculateAgreement(evidence);
    const chunkQuality = this.calculateChunkQuality(evidence);
    const retrievalScore = this.calculateRetrievalScore(retrievalScores);
    const versionStatusScore = this.calculateVersionStatusScore(evidence);

    const overall = (
      authorityScore * 0.25 +
      evidenceCoverage * 0.2 +
      agreement * 0.15 +
      chunkQuality * 0.15 +
      retrievalScore * 0.15 +
      versionStatusScore * 0.1
    );

    return {
      overall: Math.round(overall * 100) / 100,
      factors: {
        authorityScore,
        evidenceCoverage,
        agreement,
        chunkQuality,
        retrievalScore,
        versionStatus: versionStatusScore,
      },
    };
  }

  calculateAuthorityScore(chunks: RetrievalChunk[]): number {
    if (!chunks.length) return 0;
    const avg = chunks.reduce((sum, c) => sum + c.metadata.authorityScore, 0) / chunks.length;
    return Math.round(avg * 100) / 100;
  }

  calculateEvidenceCoverage(citations: Citation[], expectedCount: number): number {
    if (!expectedCount) return 0;
    return Math.min(citations.length / expectedCount, 1);
  }

  calculateAgreement(chunks: RetrievalChunk[]): number {
    if (chunks.length <= 1) return 1;
    const tiers = chunks.map((c) => c.metadata.tier);
    const uniqueTiers = new Set(tiers);
    return uniqueTiers.size === 1 ? 1 : 0.7;
  }

  calculateChunkQuality(chunks: RetrievalChunk[]): number {
    if (!chunks.length) return 0;
    const scores = chunks.map((c) => Math.min(c.score / 2, 1));
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round(avg * 100) / 100;
  }

  calculateRetrievalScore(scores: number[]): number {
    if (!scores.length) return 0;
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round(Math.min(avg, 1) * 100) / 100;
  }

  calculateVersionStatusScore(chunks: RetrievalChunk[]): number {
    if (!chunks.length) return 0;
    const statusScores: Record<string, number> = {
      active: 1,
      superseded: 0.3,
      deprecated: 0.1,
      withdrawn: 0,
      archived: 0.2,
    };
    const avg = chunks.reduce((sum, c) => sum + (statusScores[c.metadata.status] ?? 0), 0) / chunks.length;
    return Math.round(avg * 100) / 100;
  }
}
