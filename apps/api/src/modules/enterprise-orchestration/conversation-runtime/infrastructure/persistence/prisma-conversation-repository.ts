import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IConversationRepository } from '../../domain/conversation-repository.interface.js';
import type { Conversation, Message, ConversationStatus } from '../../domain/conversation.entity.js';
import type { ExecutionHistory, HistoryEvent } from '../../domain/execution-history.entity.js';

@Injectable()
export class PrismaConversationRepository implements IConversationRepository {
  private readonly logger = new Logger(PrismaConversationRepository.name);

  async saveConversation(conversation: Conversation): Promise<void> {
    await prisma.conversation_stores.upsert({
      where: { conversation_id: conversation.id },
      create: {
        id: conversation.id,
        conversation_id: conversation.id,
        execution_id: conversation.workflowExecutionId,
        session_id: conversation.sessionId,
        status: conversation.status,
        metadata: {
          messages: conversation.messages,
          expiresAt: conversation.expiresAt?.toISOString() ?? null,
          entityMetadata: conversation.metadata,
        } as unknown as Record<string, unknown>,
      },
      update: {
        execution_id: conversation.workflowExecutionId,
        session_id: conversation.sessionId,
        status: conversation.status,
        metadata: {
          messages: conversation.messages,
          expiresAt: conversation.expiresAt?.toISOString() ?? null,
          entityMetadata: conversation.metadata,
        } as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved conversation ${conversation.id}`);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const row = await prisma.conversation_stores.findUnique({
      where: { conversation_id: id },
    });
    if (!row) return null;

    return this.rowToConversation(row);
  }

  async findByExecution(executionId: string): Promise<Conversation[]> {
    const rows = await prisma.conversation_stores.findMany({
      where: { execution_id: executionId, conversation_id: { not: '' } },
      orderBy: { created_at: 'asc' },
    });
    return (await Promise.all(rows.map(row => this.rowToConversation(row)))).filter((c): c is Conversation => c !== null);
  }

  async findBySession(sessionId: string): Promise<Conversation | null> {
    const row = await prisma.conversation_stores.findFirst({
      where: { session_id: sessionId },
    });
    if (!row) return null;
    return this.rowToConversation(row);
  }

  async updateStatus(id: string, status: ConversationStatus): Promise<void> {
    await prisma.conversation_stores.update({
      where: { conversation_id: id },
      data: { status },
    });
    this.logger.debug(`Updated conversation ${id} status to ${status}`);
  }

  async addMessage(conversationId: string, message: Message): Promise<void> {
    const row = await prisma.conversation_stores.findUnique({
      where: { conversation_id: conversationId },
    });
    if (!row) return;

    const meta = row.metadata as Record<string, unknown> | null;
    const messages = (meta?.messages as Message[]) ?? [];
    messages.push(message);

    await prisma.conversation_stores.update({
      where: { conversation_id: conversationId },
      data: {
        metadata: { ...meta, messages } as unknown as Record<string, unknown>,
      },
    });
  }

  async saveHistory(history: ExecutionHistory): Promise<void> {
    const existing = await prisma.conversation_stores.findFirst({
      where: {
        execution_id: history.workflowExecutionId,
        session_id: null,
      },
    });

    const data = {
      execution_id: history.workflowExecutionId,
      status: 'active',
      metadata: {
        __type: 'execution_history',
        historyId: history.id,
        events: history.events,
        historyMetadata: history.metadata,
      } as unknown as Record<string, unknown>,
    };

    if (existing) {
      await prisma.conversation_stores.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.conversation_stores.create({
        data: {
          id: history.id,
          conversation_id: history.id,
          ...data,
        },
      });
    }
    this.logger.debug(`Saved history for execution ${history.workflowExecutionId}`);
  }

  async getHistory(executionId: string): Promise<ExecutionHistory | null> {
    const row = await prisma.conversation_stores.findFirst({
      where: {
        execution_id: executionId,
      },
      orderBy: { created_at: 'desc' },
    });
    if (!row) return null;

    const meta = row.metadata as Record<string, unknown> | null;
    if (meta?.__type !== 'execution_history') return null;

    const { ExecutionHistory: Hist } = await import('../../domain/execution-history.entity.js');
    return Hist.reconstitute(
      (meta.historyId as string) ?? row.id,
      row.execution_id!,
      (meta.events as HistoryEvent[]) ?? [],
      (meta.historyMetadata as Record<string, unknown>) ?? {},
    ) as ExecutionHistory;
  }

  async addEvent(executionId: string, event: HistoryEvent): Promise<void> {
    const history = await this.getHistory(executionId);
    if (!history) return;

    history.events.push(event);
    await this.saveHistory(history);
  }

  async deleteConversation(id: string): Promise<void> {
    await prisma.conversation_stores.deleteMany({
      where: { conversation_id: id },
    });
    this.logger.debug(`Deleted conversation ${id}`);
  }

  private async rowToConversation(row: any): Promise<Conversation | null> {
    const { Conversation: Conv } = await import('../../domain/conversation.entity.js');
    const meta = (row.metadata as Record<string, unknown>) ?? {};
    const messages = (meta.messages as Message[]) ?? [];
    const expiresAt = meta.expiresAt ? new Date(meta.expiresAt as string) : null;
    const entityMetadata = (meta.entityMetadata as any) ?? {};

    return Conv.reconstitute(
      row.conversation_id,
      row.execution_id ?? '',
      row.session_id ?? '',
      row.status as ConversationStatus,
      messages,
      entityMetadata,
      row.created_at,
      row.updated_at,
      expiresAt,
    ) as Conversation;
  }
}
