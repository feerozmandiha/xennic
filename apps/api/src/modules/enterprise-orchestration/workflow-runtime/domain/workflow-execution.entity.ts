import { randomUUID } from 'node:crypto';
import type { ExecutionStatus, StepType, Metadata } from '../../shared/types/index.js';
import type {
  WorkflowDefinition,
  WorkflowStep,
} from '../../workflow-engine/domain/workflow-definition.entity.js';

export interface ExecutionStep {
  stepId: string;
  name: string;
  type: StepType;
  status: ExecutionStatus;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  attempts: number;
  retryCount: number;
}

export interface WorkflowExecutionOptions {
  workflowId: string;
  workflowVersion: number;
  definition: WorkflowDefinition;
  context: Record<string, unknown>;
  input?: Record<string, unknown>;
  metadata: Metadata;
}

export class WorkflowExecution {
  public readonly id: string;
  public readonly workflowId: string;
  public readonly workflowVersion: number;
  public status: ExecutionStatus;
  public readonly steps: ExecutionStep[];
  public readonly context: Record<string, unknown>;
  public output: Record<string, unknown> | null;
  public error: string | null;
  public startedAt: Date | null;
  public completedAt: Date | null;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;

  private constructor(
    id: string,
    workflowId: string,
    workflowVersion: number,
    status: ExecutionStatus,
    steps: ExecutionStep[],
    context: Record<string, unknown>,
    output: Record<string, unknown> | null,
    error: string | null,
    startedAt: Date | null,
    completedAt: Date | null,
    metadata: Metadata,
    createdAt: Date,
  ) {
    this.id = id;
    this.workflowId = workflowId;
    this.workflowVersion = workflowVersion;
    this.status = status;
    this.steps = steps;
    this.context = context;
    this.output = output;
    this.error = error;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }

  static create(opts: WorkflowExecutionOptions): WorkflowExecution {
    const now = new Date();
    const steps: ExecutionStep[] = opts.definition.steps.map((step: WorkflowStep) => ({
      stepId: step.id,
      name: step.name,
      type: step.type,
      status: 'pending' as ExecutionStatus,
      input: null,
      output: null,
      error: null,
      startedAt: null,
      completedAt: null,
      attempts: 0,
      retryCount: 0,
    }));

    return new WorkflowExecution(
      randomUUID(),
      opts.workflowId,
      opts.workflowVersion,
      'pending',
      steps,
      opts.context,
      opts.input ?? null,
      null,
      now,
      null,
      opts.metadata,
      now,
    );
  }

  static reconstitute(
    id: string,
    workflowId: string,
    workflowVersion: number,
    status: ExecutionStatus,
    steps: ExecutionStep[],
    context: Record<string, unknown>,
    output: Record<string, unknown> | null,
    error: string | null,
    startedAt: Date | null,
    completedAt: Date | null,
    metadata: Metadata,
    createdAt: Date,
  ): WorkflowExecution {
    return new WorkflowExecution(
      id,
      workflowId,
      workflowVersion,
      status,
      steps,
      context,
      output,
      error,
      startedAt,
      completedAt,
      metadata,
      createdAt,
    );
  }
}
