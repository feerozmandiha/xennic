import { randomUUID } from 'node:crypto';
import type { Metadata } from '../../shared/types/index.js';

export type ConversationStatus = 'active' | 'paused' | 'completed' | 'expired';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  metadata: Record<string, unknown> | null;
}

export interface CreateConversationOptions {
  workflowExecutionId: string;
  sessionId: string;
  metadata: Metadata;
  expiresAt?: Date | null;
}

export class Conversation {
  public readonly id: string;
  public readonly workflowExecutionId: string;
  public readonly sessionId: string;
  public status: ConversationStatus;
  public readonly messages: Message[];
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public expiresAt: Date | null;

  private constructor(
    id: string,
    workflowExecutionId: string,
    sessionId: string,
    status: ConversationStatus,
    messages: Message[],
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
    expiresAt: Date | null,
  ) {
    this.id = id;
    this.workflowExecutionId = workflowExecutionId;
    this.sessionId = sessionId;
    this.status = status;
    this.messages = messages;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.expiresAt = expiresAt;
  }

  static create(opts: CreateConversationOptions): Conversation {
    const now = new Date();
    return new Conversation(
      randomUUID(),
      opts.workflowExecutionId,
      opts.sessionId,
      'active',
      [],
      opts.metadata,
      now,
      now,
      opts.expiresAt ?? null,
    );
  }

  static reconstitute(
    id: string,
    workflowExecutionId: string,
    sessionId: string,
    status: ConversationStatus,
    messages: Message[],
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
    expiresAt: Date | null,
  ): Conversation {
    return new Conversation(
      id,
      workflowExecutionId,
      sessionId,
      status,
      messages,
      metadata,
      createdAt,
      updatedAt,
      expiresAt,
    );
  }
}
