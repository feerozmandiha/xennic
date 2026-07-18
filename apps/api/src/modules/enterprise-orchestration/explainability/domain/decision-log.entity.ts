import { randomUUID } from 'node:crypto';
import type { Metadata } from '../../shared/types/index.js';

export type DecisionType =
  | 'tool_selection'
  | 'skill_selection'
  | 'routing'
  | 'policy'
  | 'approval'
  | 'retry'
  | 'compensation';

export interface DecisionLogOptions {
  workflowExecutionId: string;
  stepId: string;
  decisionType: DecisionType;
  decision: string;
  rationale: string;
  alternatives?: string[];
  confidence?: number | null;
  actor?: string | null;
}

export interface DecisionLogReconstituteOptions {
  id: string;
  workflowExecutionId: string;
  stepId: string;
  decisionType: DecisionType;
  decision: string;
  rationale: string;
  alternatives: string[];
  confidence: number | null;
  metadata: Metadata;
  timestamp: Date;
  actor: string | null;
}

export class DecisionLog {
  public readonly id: string;
  public readonly workflowExecutionId: string;
  public readonly stepId: string;
  public readonly decisionType: DecisionType;
  public readonly decision: string;
  public readonly rationale: string;
  public readonly alternatives: string[];
  public readonly confidence: number | null;
  public readonly metadata: Metadata;
  public readonly timestamp: Date;
  public readonly actor: string | null;

  private constructor(
    id: string,
    workflowExecutionId: string,
    stepId: string,
    decisionType: DecisionType,
    decision: string,
    rationale: string,
    alternatives: string[],
    confidence: number | null,
    metadata: Metadata,
    timestamp: Date,
    actor: string | null,
  ) {
    this.id = id;
    this.workflowExecutionId = workflowExecutionId;
    this.stepId = stepId;
    this.decisionType = decisionType;
    this.decision = decision;
    this.rationale = rationale;
    this.alternatives = alternatives;
    this.confidence = confidence;
    this.metadata = metadata;
    this.timestamp = timestamp;
    this.actor = actor;
  }

  static create(opts: DecisionLogOptions): DecisionLog {
    const now = new Date();
    const metadata: Metadata = {
      createdAt: now,
      updatedAt: now,
      createdBy: opts.actor ?? 'system',
      updatedBy: null,
    };

    return new DecisionLog(
      randomUUID(),
      opts.workflowExecutionId,
      opts.stepId,
      opts.decisionType,
      opts.decision,
      opts.rationale,
      opts.alternatives ?? [],
      opts.confidence ?? null,
      metadata,
      now,
      opts.actor ?? null,
    );
  }

  static reconstitute(opts: DecisionLogReconstituteOptions): DecisionLog {
    return new DecisionLog(
      opts.id,
      opts.workflowExecutionId,
      opts.stepId,
      opts.decisionType,
      opts.decision,
      opts.rationale,
      opts.alternatives,
      opts.confidence,
      opts.metadata,
      opts.timestamp,
      opts.actor,
    );
  }
}
