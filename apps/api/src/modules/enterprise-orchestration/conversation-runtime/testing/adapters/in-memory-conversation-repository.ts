import { Logger } from '@nestjs/common';
import type { IConversationRepository } from '../../domain/conversation-repository.interface.js';
import type { Conversation, Message, ConversationStatus } from '../../domain/conversation.entity.js';
import type { ExecutionHistory, HistoryEvent } from '../../domain/execution-history.entity.js';

export class InMemoryConversationRepository implements IConversationRepository {
  private readonly logger = new Logger(InMemoryConversationRepository.name);
  private readonly conversations = new Map<string, Conversation>();
  private readonly executionIndex = new Map<string, string[]>();
  private readonly sessionIndex = new Map<string, string>();
  private readonly histories = new Map<string, ExecutionHistory>();

  async saveConversation(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);

    const existingExecution = this.executionIndex.get(conversation.workflowExecutionId) ?? [];
    if (!existingExecution.includes(conversation.id)) {
      existingExecution.push(conversation.id);
    }
    this.executionIndex.set(conversation.workflowExecutionId, existingExecution);
    this.sessionIndex.set(conversation.sessionId, conversation.id);

    this.logger.debug(`Saved conversation ${conversation.id}`);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) ?? null;
  }

  async findByExecution(executionId: string): Promise<Conversation[]> {
    const ids = this.executionIndex.get(executionId) ?? [];
    return ids
      .map(id => this.conversations.get(id))
      .filter((c): c is Conversation => c !== undefined);
  }

  async findBySession(sessionId: string): Promise<Conversation | null> {
    const id = this.sessionIndex.get(sessionId);
    if (!id) return null;
    return this.conversations.get(id) ?? null;
  }

  async updateStatus(id: string, status: ConversationStatus): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      conversation.status = status;
      conversation.updatedAt = new Date();
      this.logger.debug(`Updated conversation ${id} status to ${status}`);
    }
  }

  async addMessage(conversationId: string, message: Message): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.messages.push(message);
      conversation.updatedAt = new Date();
    }
  }

  async saveHistory(history: ExecutionHistory): Promise<void> {
    this.histories.set(history.workflowExecutionId, history);
    this.logger.debug(`Saved history for execution ${history.workflowExecutionId}`);
  }

  async getHistory(executionId: string): Promise<ExecutionHistory | null> {
    return this.histories.get(executionId) ?? null;
  }

  async addEvent(executionId: string, event: HistoryEvent): Promise<void> {
    const history = this.histories.get(executionId);
    if (history) {
      history.events.push(event);
    }
  }

  async deleteConversation(id: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      this.conversations.delete(id);
      const execIds = this.executionIndex.get(conversation.workflowExecutionId) ?? [];
      this.executionIndex.set(
        conversation.workflowExecutionId,
        execIds.filter(eid => eid !== id),
      );
      this.sessionIndex.delete(conversation.sessionId);
      this.logger.debug(`Deleted conversation ${id}`);
    }
  }
}
