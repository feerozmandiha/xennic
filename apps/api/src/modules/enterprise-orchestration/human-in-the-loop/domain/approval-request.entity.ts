import { randomUUID } from 'node:crypto';
import type { Metadata } from '../../shared/types/index.js';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export interface ApprovalRequestOptions {
  executionId: string;
  stepId: string;
  requestedBy: string;
  assignedTo: string[];
  title: string;
  description: string;
  context?: Record<string, unknown>;
  dueAt?: Date | null;
}

export class ApprovalRequest {
  public readonly id: string;
  public readonly executionId: string;
  public readonly stepId: string;
  public status: ApprovalStatus;
  public readonly requestedBy: string;
  public readonly assignedTo: string[];
  public readonly title: string;
  public readonly description: string;
  public readonly context: Record<string, unknown>;
  public dueAt: Date | null;
  public escalatedAt: Date | null;
  public escalationReason: string | null;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(
    id: string,
    executionId: string,
    stepId: string,
    status: ApprovalStatus,
    requestedBy: string,
    assignedTo: string[],
    title: string,
    description: string,
    context: Record<string, unknown>,
    dueAt: Date | null,
    escalatedAt: Date | null,
    escalationReason: string | null,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.executionId = executionId;
    this.stepId = stepId;
    this.status = status;
    this.requestedBy = requestedBy;
    this.assignedTo = assignedTo;
    this.title = title;
    this.description = description;
    this.context = context;
    this.dueAt = dueAt;
    this.escalatedAt = escalatedAt;
    this.escalationReason = escalationReason;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(opts: ApprovalRequestOptions): ApprovalRequest {
    const now = new Date();
    const metadata: Metadata = {
      createdAt: now,
      updatedAt: now,
      createdBy: opts.requestedBy,
      updatedBy: null,
    };

    return new ApprovalRequest(
      randomUUID(),
      opts.executionId,
      opts.stepId,
      'pending',
      opts.requestedBy,
      opts.assignedTo,
      opts.title,
      opts.description,
      opts.context ?? {},
      opts.dueAt ?? null,
      null,
      null,
      metadata,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    executionId: string,
    stepId: string,
    status: ApprovalStatus,
    requestedBy: string,
    assignedTo: string[],
    title: string,
    description: string,
    context: Record<string, unknown>,
    dueAt: Date | null,
    escalatedAt: Date | null,
    escalationReason: string | null,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ): ApprovalRequest {
    return new ApprovalRequest(
      id,
      executionId,
      stepId,
      status,
      requestedBy,
      assignedTo,
      title,
      description,
      context,
      dueAt,
      escalatedAt,
      escalationReason,
      metadata,
      createdAt,
      updatedAt,
    );
  }

  approve(userId: string, _comment?: string): void {
    this.status = 'approved';
    this.metadata.updatedBy = userId;
    this.updatedAt = new Date();
  }

  reject(userId: string, _reason: string, _comment?: string): void {
    this.status = 'rejected';
    this.metadata.updatedBy = userId;
    this.updatedAt = new Date();
  }
}
