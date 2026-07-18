import { Logger } from '@nestjs/common';
import type { PaginatedResult } from '../../../shared/types/index.js';
import { DecisionLog, type DecisionType } from '../../domain/decision-log.entity.js';
import { SelectionRationale, type SelectionType } from '../../domain/selection-rationale.vo.js';
import { ConfidenceScore } from '../../domain/confidence-score.vo.js';
import type {
  IExplainabilityRepository,
  FindDecisionOptions,
  ListExplainabilityOptions,
  ConfidenceSummary,
} from '../../domain/explainability-repository.interface.js';

export class InMemoryExplainabilityRepository implements IExplainabilityRepository {
  private readonly logger = new Logger(InMemoryExplainabilityRepository.name);
  private readonly decisions = new Map<string, DecisionLog>();
  private readonly rationales = new Map<string, SelectionRationale>();
  private readonly confidences = new Map<string, ConfidenceScore>();

  async saveDecision(log: DecisionLog): Promise<void> {
    this.decisions.set(log.id, log);
    this.logger.debug(`Saved decision ${log.id}`);
  }

  async getDecisions(
    executionId: string,
    options?: FindDecisionOptions,
  ): Promise<PaginatedResult<DecisionLog>> {
    let items = Array.from(this.decisions.values()).filter(
      (d) => d.workflowExecutionId === executionId,
    );

    if (options?.stepId) {
      items = items.filter((d) => d.stepId === options.stepId);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async getDecisionsByType(executionId: string, type: DecisionType): Promise<DecisionLog[]> {
    return Array.from(this.decisions.values()).filter(
      (d) => d.workflowExecutionId === executionId && d.decisionType === type,
    );
  }

  async saveRationale(rationale: SelectionRationale): Promise<void> {
    this.rationales.set(rationale.id, rationale);
    this.logger.debug(`Saved rationale ${rationale.id}`);
  }

  async getRationale(
    executionId: string,
    selectionType?: SelectionType,
  ): Promise<SelectionRationale[]> {
    return Array.from(this.rationales.values()).filter(
      (r) => r.executionId === executionId && (!selectionType || r.selectionType === selectionType),
    );
  }

  async saveConfidence(score: ConfidenceScore): Promise<void> {
    this.confidences.set(score.id, score);
    this.logger.debug(`Saved confidence ${score.id}`);
  }

  async getConfidenceScores(executionId: string): Promise<ConfidenceScore[]> {
    return Array.from(this.confidences.values()).filter((c) => c.executionId === executionId);
  }

  async getConfidenceSummary(executionId: string): Promise<ConfidenceSummary> {
    const scores = await this.getConfidenceScores(executionId);

    if (scores.length === 0) {
      return { avg: 0, min: 0, max: 0, byStep: {} };
    }

    const byStep: Record<string, number[]> = {};
    for (const s of scores) {
      if (!byStep[s.stepId]) {
        byStep[s.stepId] = [];
      }
      byStep[s.stepId]!.push(s.score);
    }

    const allScores = scores.map((s) => s.score);
    const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;

    return {
      avg: Math.round(avg * 100) / 100,
      min: Math.min(...allScores),
      max: Math.max(...allScores),
      byStep,
    };
  }

  async list(options?: ListExplainabilityOptions): Promise<PaginatedResult<DecisionLog>> {
    let items = Array.from(this.decisions.values());

    if (options?.decisionType) {
      items = items.filter((d) => d.decisionType === options.decisionType);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }
}
