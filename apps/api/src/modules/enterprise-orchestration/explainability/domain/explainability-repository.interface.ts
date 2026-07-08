import type { PaginatedResult } from '../../shared/types/index.js';
import type { DecisionLog, DecisionType } from './decision-log.entity.js';
import type { SelectionRationale, SelectionType } from './selection-rationale.vo.js';
import type { ConfidenceScore } from './confidence-score.vo.js';

export interface FindDecisionOptions {
  offset?: number;
  limit?: number;
  stepId?: string;
}

export interface ListExplainabilityOptions {
  offset?: number;
  limit?: number;
  decisionType?: DecisionType;
}

export interface ConfidenceSummary {
  avg: number;
  min: number;
  max: number;
  byStep: Record<string, number[]>;
}

export interface IExplainabilityRepository {
  saveDecision(log: DecisionLog): Promise<void>;
  getDecisions(executionId: string, options?: FindDecisionOptions): Promise<PaginatedResult<DecisionLog>>;
  getDecisionsByType(executionId: string, type: DecisionType): Promise<DecisionLog[]>;
  saveRationale(rationale: SelectionRationale): Promise<void>;
  getRationale(executionId: string, selectionType?: SelectionType): Promise<SelectionRationale[]>;
  saveConfidence(score: ConfidenceScore): Promise<void>;
  getConfidenceScores(executionId: string): Promise<ConfidenceScore[]>;
  getConfidenceSummary(executionId: string): Promise<ConfidenceSummary>;
  list(options?: ListExplainabilityOptions): Promise<PaginatedResult<DecisionLog>>;
}
