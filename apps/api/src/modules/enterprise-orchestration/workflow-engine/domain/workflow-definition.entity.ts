import { randomUUID } from 'node:crypto';
import type { WorkflowStatus, StepType, Metadata } from '../../shared/types/index.js';

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  description: string;
  config: Record<string, unknown>;
  next: string[] | null;
  onFailure: string | null;
  retryConfig: { maxRetries: number; backoffMs: number } | null;
  timeoutMs: number | null;
}

export interface WorkflowTrigger {
  type: string;
  config: Record<string, unknown>;
}

export interface WorkflowDefinitionOptions {
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  timeout: number | null;
  metadata: Metadata;
}

export class WorkflowDefinition {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: number;
  public readonly steps: WorkflowStep[];
  public readonly triggers: WorkflowTrigger[];
  public readonly timeout: number | null;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly status: WorkflowStatus;

  private constructor(
    id: string,
    name: string,
    description: string,
    version: number,
    steps: WorkflowStep[],
    triggers: WorkflowTrigger[],
    timeout: number | null,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
    status: WorkflowStatus,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    this.steps = steps;
    this.triggers = triggers;
    this.timeout = timeout;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.status = status;
  }

  static create(opts: WorkflowDefinitionOptions): WorkflowDefinition {
    const now = new Date();
    return new WorkflowDefinition(
      randomUUID(),
      opts.name,
      opts.description,
      1,
      opts.steps,
      opts.triggers,
      opts.timeout,
      opts.metadata,
      now,
      now,
      'draft',
    );
  }

  static reconstitute(
    id: string,
    name: string,
    description: string,
    version: number,
    steps: WorkflowStep[],
    triggers: WorkflowTrigger[],
    timeout: number | null,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
    status: WorkflowStatus,
  ): WorkflowDefinition {
    return new WorkflowDefinition(
      id,
      name,
      description,
      version,
      steps,
      triggers,
      timeout,
      metadata,
      createdAt,
      updatedAt,
      status,
    );
  }
}
