import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PaginatedResult } from '../../shared/types/index.js';

export interface EvaluationEntry {
  id: string;
  promptId: string;
  version: number;
  score: number;
  metrics: Record<string, unknown> | null;
  timestamp: Date;
}

export interface EvaluationFindOptions {
  offset?: number;
  limit?: number;
}

@Injectable()
export class PromptEvaluationService {
  private readonly logger = new Logger(PromptEvaluationService.name);
  private readonly evaluations: EvaluationEntry[] = [];

  async recordEvaluation(
    promptId: string,
    version: number,
    score: number,
    metrics?: Record<string, unknown>,
  ): Promise<EvaluationEntry> {
    const entry: EvaluationEntry = {
      id: randomUUID(),
      promptId,
      version,
      score,
      metrics: metrics ?? null,
      timestamp: new Date(),
    };
    this.evaluations.push(entry);
    this.logger.debug(`Recorded evaluation ${entry.id} for prompt ${promptId} v${version}: ${score}`);
    return entry;
  }

  async getEvaluations(
    promptId: string,
    options?: EvaluationFindOptions,
  ): Promise<PaginatedResult<EvaluationEntry>> {
    const filtered = this.evaluations.filter(e => e.promptId === promptId);
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? filtered.length;
    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      offset,
      limit,
    };
  }

  async getAverageScore(promptId: string): Promise<number | null> {
    const entries = this.evaluations.filter(e => e.promptId === promptId);
    if (entries.length === 0) return null;
    const sum = entries.reduce((acc, e) => acc + e.score, 0);
    return sum / entries.length;
  }
}
