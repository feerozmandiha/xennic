import { randomUUID } from 'node:crypto';

export enum EvaluationTargetType {
  PROMPT = 'prompt',
  TOOL = 'tool',
  AGENT = 'agent',
  SKILL = 'skill',
}

export enum EvaluationRunStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface EvaluationResult {
  metric: string;
  value: number;
  details?: Record<string, unknown>;
}

export interface EvaluationRunData {
  benchmarkId: string;
  targetType: EvaluationTargetType;
  targetId: string;
  targetVersion: number;
  metadata?: Record<string, unknown>;
}

export class EvaluationRun {
  public readonly id: string;
  public readonly benchmarkId: string;
  public readonly targetType: EvaluationTargetType;
  public readonly targetId: string;
  public readonly targetVersion: number;
  public readonly status: EvaluationRunStatus;
  public readonly results: EvaluationResult[];
  public readonly score: number | null;
  public readonly startedAt: Date | null;
  public readonly completedAt: Date | null;
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    benchmarkId: string,
    targetType: EvaluationTargetType,
    targetId: string,
    targetVersion: number,
    status: EvaluationRunStatus,
    results: EvaluationResult[],
    score: number | null,
    startedAt: Date | null,
    completedAt: Date | null,
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.benchmarkId = benchmarkId;
    this.targetType = targetType;
    this.targetId = targetId;
    this.targetVersion = targetVersion;
    this.status = status;
    this.results = results;
    this.score = score;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(data: EvaluationRunData): EvaluationRun {
    const now = new Date();
    return new EvaluationRun(
      randomUUID(),
      data.benchmarkId,
      data.targetType,
      data.targetId,
      data.targetVersion,
      EvaluationRunStatus.PENDING,
      [],
      null,
      null,
      null,
      data.metadata ?? {},
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    benchmarkId: string,
    targetType: EvaluationTargetType,
    targetId: string,
    targetVersion: number,
    status: EvaluationRunStatus,
    results: EvaluationResult[],
    score: number | null,
    startedAt: Date | null,
    completedAt: Date | null,
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ): EvaluationRun {
    return new EvaluationRun(
      id,
      benchmarkId,
      targetType,
      targetId,
      targetVersion,
      status,
      results,
      score,
      startedAt,
      completedAt,
      metadata,
      createdAt,
      updatedAt,
    );
  }
}
