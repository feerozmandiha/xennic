import { randomUUID } from 'node:crypto';
import type { Metadata } from '../../shared/types/index.js';

export type ReviewTaskStatus = 'pending' | 'completed' | 'failed';

export interface ReviewTaskOptions {
  executionId: string;
  stepId: string;
  assignedTo: string;
  instructions: string;
  input: Record<string, unknown>;
}

export class ReviewTask {
  public readonly id: string;
  public readonly executionId: string;
  public readonly stepId: string;
  public status: ReviewTaskStatus;
  public readonly assignedTo: string;
  public readonly instructions: string;
  public readonly input: Record<string, unknown>;
  public output: Record<string, unknown> | null;
  public feedback: string | null;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;

  private constructor(
    id: string,
    executionId: string,
    stepId: string,
    status: ReviewTaskStatus,
    assignedTo: string,
    instructions: string,
    input: Record<string, unknown>,
    output: Record<string, unknown> | null,
    feedback: string | null,
    metadata: Metadata,
    createdAt: Date,
  ) {
    this.id = id;
    this.executionId = executionId;
    this.stepId = stepId;
    this.status = status;
    this.assignedTo = assignedTo;
    this.instructions = instructions;
    this.input = input;
    this.output = output;
    this.feedback = feedback;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }

  static create(opts: ReviewTaskOptions): ReviewTask {
    const now = new Date();
    const metadata: Metadata = {
      createdAt: now,
      updatedAt: now,
      createdBy: opts.assignedTo,
      updatedBy: null,
    };

    return new ReviewTask(
      randomUUID(),
      opts.executionId,
      opts.stepId,
      'pending',
      opts.assignedTo,
      opts.instructions,
      opts.input,
      null,
      null,
      metadata,
      now,
    );
  }

  static reconstitute(
    id: string,
    executionId: string,
    stepId: string,
    status: ReviewTaskStatus,
    assignedTo: string,
    instructions: string,
    input: Record<string, unknown>,
    output: Record<string, unknown> | null,
    feedback: string | null,
    metadata: Metadata,
    createdAt: Date,
  ): ReviewTask {
    return new ReviewTask(
      id,
      executionId,
      stepId,
      status,
      assignedTo,
      instructions,
      input,
      output,
      feedback,
      metadata,
      createdAt,
    );
  }
}
