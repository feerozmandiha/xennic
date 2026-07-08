import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Metadata, PaginatedResult } from '../../shared/types/index.js';
import type { IConversationRepository } from '../domain/conversation-repository.interface.js';
import { Conversation, type Message } from '../domain/conversation.entity.js';
import { ConversationState, } from '../domain/conversation-state.vo.js';

interface MessageQueryOptions {
  offset?: number;
  limit?: number;
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private readonly states = new Map<string, ConversationState>();
  private readonly conversationIds = new Set<string>();

  constructor(
    @Inject('IConversationRepository')
    private readonly repository: IConversationRepository,
  ) {}

  async create(executionId: string, sessionId: string, createdBy?: string): Promise<Conversation> {
    const metadata: Metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: createdBy ?? 'system',
      updatedBy: null,
    };

    const conversation = Conversation.create({
      workflowExecutionId: executionId,
      sessionId,
      metadata,
    });

    const state = ConversationState.create(conversation.id);
    this.states.set(conversation.id, state);
    this.conversationIds.add(conversation.id);

    await this.repository.saveConversation(conversation);
    this.logger.log(`Created conversation ${conversation.id} for execution ${executionId}`);
    return conversation;
  }

  async sendMessage(
    conversationId: string,
    role: Message['role'],
    content: string,
    messageMetadata?: Record<string, unknown> | null,
  ): Promise<Message> {
    const conversation = await this.repository.getConversation(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    if (conversation.status !== 'active') {
      throw new BadRequestException(`Cannot send message to ${conversation.status} conversation`);
    }

    const message: Message = {
      id: randomUUID(),
      role,
      content,
      timestamp: new Date(),
      metadata: messageMetadata ?? null,
    };

    await this.repository.addMessage(conversationId, message);
    conversation.updatedAt = new Date();

    const state = this.states.get(conversationId);
    if (state) {
      state.recordTurn();
      if (role === 'user') {
        state.state = 'processing';
      } else if (role === 'assistant') {
        state.state = 'awaiting_input';
      }
    }

    this.logger.debug(`Message added to conversation ${conversationId}`);
    return message;
  }

  async getMessages(
    conversationId: string,
    options?: MessageQueryOptions,
  ): Promise<PaginatedResult<Message>> {
    const conversation = await this.repository.getConversation(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? conversation.messages.length;

    return {
      items: conversation.messages.slice(offset, offset + limit),
      total: conversation.messages.length,
      offset,
      limit,
    };
  }

  async getContext(conversationId: string): Promise<ConversationState | null> {
    return this.states.get(conversationId) ?? null;
  }

  async pause(conversationId: string): Promise<void> {
    const conversation = await this.repository.getConversation(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    if (conversation.status !== 'active') {
      throw new BadRequestException(`Cannot pause ${conversation.status} conversation`);
    }

    await this.repository.updateStatus(conversationId, 'paused');
    conversation.status = 'paused';
    conversation.updatedAt = new Date();
    this.logger.log(`Conversation ${conversationId} paused`);
  }

  async resume(conversationId: string): Promise<void> {
    const conversation = await this.repository.getConversation(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    if (conversation.status !== 'paused') {
      throw new BadRequestException(`Cannot resume ${conversation.status} conversation`);
    }

    await this.repository.updateStatus(conversationId, 'active');
    conversation.status = 'active';
    conversation.updatedAt = new Date();
    this.logger.log(`Conversation ${conversationId} resumed`);
  }

  async end(conversationId: string): Promise<void> {
    const conversation = await this.repository.getConversation(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    if (conversation.status === 'completed' || conversation.status === 'expired') {
      throw new BadRequestException(`Conversation already ${conversation.status}`);
    }

    await this.repository.updateStatus(conversationId, 'completed');
    conversation.status = 'completed';
    conversation.updatedAt = new Date();
    this.logger.log(`Conversation ${conversationId} ended`);
  }

  async expireStale(maxAge: number): Promise<number> {
    const cutoff = new Date(Date.now() - maxAge);
    let expiredCount = 0;

    for (const id of this.conversationIds) {
      const conversation = await this.repository.getConversation(id);
      if (conversation && conversation.status === 'active' && conversation.createdAt < cutoff) {
        await this.repository.updateStatus(id, 'expired');
        conversation.status = 'expired';
        expiredCount += 1;
      }
    }

    if (expiredCount > 0) {
      this.logger.log(`Expired ${expiredCount} stale conversations`);
    }
    return expiredCount;
  }
}
