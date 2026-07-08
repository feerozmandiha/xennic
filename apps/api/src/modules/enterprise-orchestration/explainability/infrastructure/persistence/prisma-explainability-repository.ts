import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
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

@Injectable()
export class PrismaExplainabilityRepository implements IExplainabilityRepository {
  private readonly logger = new Logger(PrismaExplainabilityRepository.name);

  async saveDecision(log: DecisionLog): Promise<void> {
    await prisma.decision_logs.upsert({
      where: { id: log.id },
      create: {
        id: log.id,
        execution_id: log.workflowExecutionId,
        step_id: log.stepId,
        decision_type: log.decisionType,
        input: {
          decision: log.decision,
          rationale: log.rationale,
          alternatives: log.alternatives,
          actor: log.actor,
        } as unknown as Record<string, unknown>,
        output: {} as unknown as Record<string, unknown>,
        confidence: log.confidence,
        metadata: log.metadata as any,
      },
      update: {
        decision_type: log.decisionType,
        input: {
          decision: log.decision,
          rationale: log.rationale,
          alternatives: log.alternatives,
          actor: log.actor,
        } as unknown as Record<string, unknown>,
        output: {} as unknown as Record<string, unknown>,
        confidence: log.confidence,
        metadata: log.metadata as any,
      },
    });
    this.logger.debug(`Saved decision ${log.id}`);
  }

  async getDecisions(executionId: string, options?: FindDecisionOptions): Promise<PaginatedResult<DecisionLog>> {
    const where: Record<string, unknown> = { execution_id: executionId };
    if (options?.stepId) {
      where.step_id = options.stepId;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.decision_logs.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.decision_logs.count({ where: where as any }),
    ]);

    return {
      items: rows.map(row => this.rowToDecision(row)),
      total,
      offset,
      limit,
    };
  }

  async getDecisionsByType(executionId: string, type: DecisionType): Promise<DecisionLog[]> {
    const rows = await prisma.decision_logs.findMany({
      where: { execution_id: executionId, decision_type: type },
      orderBy: { created_at: 'desc' },
    });
    return rows.map(row => this.rowToDecision(row));
  }

  async saveRationale(rationale: SelectionRationale): Promise<void> {
    await prisma.decision_logs.upsert({
      where: { id: rationale.id },
      create: {
        id: rationale.id,
        execution_id: rationale.executionId,
        step_id: null,
        decision_type: 'tool_selection',
        input: {
          selectionType: rationale.selectionType,
          selectedId: rationale.selectedId,
          candidates: rationale.candidates,
          criteria: rationale.criteria,
          scores: rationale.scores,
          winnerReason: rationale.winnerReason,
        } as unknown as Record<string, unknown>,
        output: {} as unknown as Record<string, unknown>,
        confidence: null,
        metadata: { __type: 'selection_rationale' } as unknown as Record<string, unknown>,
      },
      update: {
        input: {
          selectionType: rationale.selectionType,
          selectedId: rationale.selectedId,
          candidates: rationale.candidates,
          criteria: rationale.criteria,
          scores: rationale.scores,
          winnerReason: rationale.winnerReason,
        } as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved rationale ${rationale.id}`);
  }

  async getRationale(executionId: string, selectionType?: SelectionType): Promise<SelectionRationale[]> {
    const where: Record<string, unknown> = {
      execution_id: executionId,
      metadata: { path: '$.__type', equals: 'selection_rationale' },
    };

    const rows = await prisma.decision_logs.findMany({
      where: where as any,
      orderBy: { created_at: 'desc' },
    });

    return rows
      .map(row => {
        const input = row.input as Record<string, unknown> ?? {};
        if (selectionType && input.selectionType !== selectionType) return null;

        return SelectionRationale.reconstitute({
          id: row.id,
          executionId: row.execution_id,
          selectionType: input.selectionType as SelectionType,
          selectedId: input.selectedId as string,
          candidates: input.candidates as any[] ?? [],
          criteria: input.criteria as string[] ?? [],
          scores: input.scores as Record<string, number> ?? {},
          winnerReason: input.winnerReason as string,
          timestamp: row.created_at,
        });
      })
      .filter((r): r is SelectionRationale => r !== null);
  }

  async saveConfidence(score: ConfidenceScore): Promise<void> {
    await prisma.confidence_scores.upsert({
      where: { id: score.id },
      create: {
        id: score.id,
        execution_id: score.executionId,
        step_id: score.stepId,
        score: score.score,
        details: { factors: score.factors } as unknown as Record<string, unknown>,
      },
      update: {
        score: score.score,
        details: { factors: score.factors } as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved confidence ${score.id}`);
  }

  async getConfidenceScores(executionId: string): Promise<ConfidenceScore[]> {
    const rows = await prisma.confidence_scores.findMany({
      where: { execution_id: executionId },
      orderBy: { created_at: 'desc' },
    });
    return rows.map(row => this.rowToConfidence(row));
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

    const allScores = scores.map(s => s.score);
    const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;

    return {
      avg: Math.round(avg * 100) / 100,
      min: Math.min(...allScores),
      max: Math.max(...allScores),
      byStep,
    };
  }

  async list(options?: ListExplainabilityOptions): Promise<PaginatedResult<DecisionLog>> {
    const where: Record<string, unknown> = {};
    if (options?.decisionType) {
      where.decision_type = options.decisionType;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.decision_logs.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.decision_logs.count({ where: where as any }),
    ]);

    return {
      items: rows.map(row => this.rowToDecision(row)),
      total,
      offset,
      limit,
    };
  }

  private rowToDecision(row: any): DecisionLog {
    const input = (row.input as Record<string, unknown>) ?? {};
    return DecisionLog.reconstitute({
      id: row.id,
      workflowExecutionId: row.execution_id,
      stepId: row.step_id ?? '',
      decisionType: row.decision_type as DecisionType,
      decision: (input.decision as string) ?? '',
      rationale: (input.rationale as string) ?? '',
      alternatives: (input.alternatives as string[]) ?? [],
      confidence: row.confidence as number | null,
      metadata: (row.metadata as any) ?? {},
      timestamp: row.created_at,
      actor: (input.actor as string | null) ?? null,
    });
  }

  private rowToConfidence(row: any): ConfidenceScore {
    const details = (row.details as Record<string, unknown>) ?? {};
    return ConfidenceScore.reconstitute({
      id: row.id,
      executionId: row.execution_id,
      stepId: row.step_id ?? '',
      score: row.score,
      factors: (details.factors as any[]) ?? [],
      timestamp: row.created_at,
    });
  }
}
