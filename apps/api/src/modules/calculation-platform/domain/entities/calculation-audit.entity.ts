import { randomUUID } from 'crypto';

export type AuditAction =
  | 'run'
  | 'validate'
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'rollback';
export type AuditEntityType =
  | 'definition'
  | 'version'
  | 'formula'
  | 'result'
  | 'certificate'
  | 'plugin'
  | 'category';

export class CalculationAuditEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly action: AuditAction,
    public readonly entityType: AuditEntityType,
    public readonly entityId: string | null,
    public readonly inputs: Record<string, unknown> | null,
    public readonly outputs: Record<string, unknown> | null,
    public readonly formulaVersion: string | null,
    public readonly aiResponse: Record<string, unknown> | null,
    public readonly executionPath: string[] | null,
    public readonly errorMessage: string | null,
    public readonly durationMs: number | null,
    public readonly correlationId: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    userId: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string | null;
    inputs?: Record<string, unknown> | null;
    outputs?: Record<string, unknown> | null;
    formulaVersion?: string | null;
    aiResponse?: Record<string, unknown> | null;
    executionPath?: string[] | null;
    errorMessage?: string | null;
    durationMs?: number | null;
    correlationId?: string | null;
  }): CalculationAuditEntity {
    return new CalculationAuditEntity(
      randomUUID(),
      data.workspaceId,
      data.userId,
      data.action,
      data.entityType,
      data.entityId ?? null,
      data.inputs ?? null,
      data.outputs ?? null,
      data.formulaVersion ?? null,
      data.aiResponse ?? null,
      data.executionPath ?? null,
      data.errorMessage ?? null,
      data.durationMs ?? null,
      data.correlationId ?? null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspace_id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    inputs: Record<string, unknown> | null;
    outputs: Record<string, unknown> | null;
    formula_version: string | null;
    ai_response: Record<string, unknown> | null;
    execution_path: string[] | null;
    error_message: string | null;
    duration_ms: number | null;
    correlation_id: string | null;
    created_at: Date;
  }): CalculationAuditEntity {
    return new CalculationAuditEntity(
      data.id,
      data.workspace_id,
      data.user_id,
      data.action as AuditAction,
      data.entity_type as AuditEntityType,
      data.entity_id,
      data.inputs,
      data.outputs,
      data.formula_version,
      data.ai_response,
      data.execution_path,
      data.error_message,
      data.duration_ms,
      data.correlation_id,
      data.created_at,
    );
  }
}
