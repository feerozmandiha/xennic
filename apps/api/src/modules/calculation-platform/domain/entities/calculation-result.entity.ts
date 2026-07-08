import { randomUUID } from 'crypto';

export type ResultStatus = 'completed' | 'failed' | 'pending';

export class CalculationResultEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly definitionId: string | null,
    public readonly versionId: string | null,
    public readonly userId: string,
    public inputs: Record<string, unknown>,
    public outputs: Record<string, unknown> | null,
    public status: ResultStatus,
    public errorMessage: string | null,
    public readonly engineVersion: string,
    public durationMs: number | null,
    public aiReview: Record<string, unknown> | null,
    public confidence: number | null,
    public correlationId: string | null,
    public readonly executedAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    definitionId?: string | null;
    versionId?: string | null;
    userId: string;
    inputs: Record<string, unknown>;
    engineVersion: string;
    correlationId?: string | null;
  }): CalculationResultEntity {
    return new CalculationResultEntity(
      randomUUID(),
      data.workspaceId,
      data.definitionId ?? null,
      data.versionId ?? null,
      data.userId,
      data.inputs,
      null,
      'pending',
      null,
      data.engineVersion,
      null,
      null,
      null,
      data.correlationId ?? null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspace_id: string;
    definition_id: string | null;
    version_id: string | null;
    user_id: string;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown> | null;
    status: string;
    error_message: string | null;
    engine_version: string;
    duration_ms: number | null;
    ai_review: Record<string, unknown> | null;
    confidence: number | null;
    correlation_id: string | null;
    executed_at: Date;
    created_at: Date;
  }): CalculationResultEntity {
    return new CalculationResultEntity(
      data.id,
      data.workspace_id,
      data.definition_id,
      data.version_id,
      data.user_id,
      data.inputs,
      data.outputs,
      data.status as ResultStatus,
      data.error_message,
      data.engine_version,
      data.duration_ms,
      data.ai_review,
      data.confidence,
      data.correlation_id,
      data.executed_at,
      data.created_at,
    );
  }

  complete(outputs: Record<string, unknown>, durationMs: number): void {
    this.outputs = outputs;
    this.status = 'completed';
    this.durationMs = durationMs;
  }

  fail(errorMessage: string, durationMs: number): void {
    this.status = 'failed';
    this.errorMessage = errorMessage;
    this.durationMs = durationMs;
  }

  setAiReview(aiReview: Record<string, unknown>, confidence: number): void {
    this.aiReview = aiReview;
    this.confidence = confidence;
  }
}
