import { randomUUID } from 'node:crypto';

export type CompensationStatus = 'pending' | 'completed' | 'failed';

export interface CompensationEntryOptions {
  executionId: string;
  stepId: string;
  action: string;
}

export class CompensationEntry {
  public readonly id: string;
  public readonly executionId: string;
  public readonly stepId: string;
  public readonly action: string;
  public status: CompensationStatus;
  public output: Record<string, unknown> | null;
  public error: string | null;
  public readonly createdAt: Date;

  private constructor(
    id: string,
    executionId: string,
    stepId: string,
    action: string,
    status: CompensationStatus,
    output: Record<string, unknown> | null,
    error: string | null,
    createdAt: Date,
  ) {
    this.id = id;
    this.executionId = executionId;
    this.stepId = stepId;
    this.action = action;
    this.status = status;
    this.output = output;
    this.error = error;
    this.createdAt = createdAt;
  }

  static create(opts: CompensationEntryOptions): CompensationEntry {
    return new CompensationEntry(
      randomUUID(),
      opts.executionId,
      opts.stepId,
      opts.action,
      'pending',
      null,
      null,
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    executionId: string,
    stepId: string,
    action: string,
    status: CompensationStatus,
    output: Record<string, unknown> | null,
    error: string | null,
    createdAt: Date,
  ): CompensationEntry {
    return new CompensationEntry(
      id,
      executionId,
      stepId,
      action,
      status,
      output,
      error,
      createdAt,
    );
  }
}
