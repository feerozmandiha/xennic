import type { AgentEntity, ConversationEntity, MessageEntity } from '../entities/conversation.entity.js';

export interface IAiRepository {
  // Agents
  findAgentBySlug(slug: string): Promise<AgentEntity | null>;
  findActiveAgents(): Promise<AgentEntity[]>;

  // Conversations
  createConversation(conv: ConversationEntity): Promise<void>;
  findConversation(id: string): Promise<ConversationEntity | null>;
  findConversationsByWorkspace(workspaceId: string, limit: number, offset: number): Promise<ConversationEntity[]>;
  updateConversationTitle(id: string, title: string): Promise<void>;
  deleteConversation(id: string): Promise<void>;

  // Messages
  saveMessage(msg: {
    id: string; conversationId: string; role: string;
    content: string; metadata: Record<string, unknown>; createdAt: Date;
  }): Promise<void>;
  findMessages(conversationId: string): Promise<MessageEntity[]>;

  // Usage
  recordUsage(data: {
    workspaceId: string; userId: string; agentId?: string;
    provider: string; model: string;
    promptTokens: number; completionTokens: number; totalTokens: number;
    cost: number;
  }): Promise<void>;

  getUsageStats(workspaceId: string, month: Date): Promise<{
    totalRequests: number; totalTokens: number; totalCost: number;
  }>;
}
