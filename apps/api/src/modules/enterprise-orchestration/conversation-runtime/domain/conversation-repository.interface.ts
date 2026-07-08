import type { Conversation, Message, ConversationStatus } from './conversation.entity.js';
import type { ExecutionHistory, HistoryEvent } from './execution-history.entity.js';

export interface IConversationRepository {
  saveConversation(conversation: Conversation): Promise<void>;
  getConversation(id: string): Promise<Conversation | null>;
  findByExecution(executionId: string): Promise<Conversation[]>;
  findBySession(sessionId: string): Promise<Conversation | null>;
  updateStatus(id: string, status: ConversationStatus): Promise<void>;
  addMessage(conversationId: string, message: Message): Promise<void>;
  saveHistory(history: ExecutionHistory): Promise<void>;
  getHistory(executionId: string): Promise<ExecutionHistory | null>;
  addEvent(executionId: string, event: HistoryEvent): Promise<void>;
  deleteConversation(id: string): Promise<void>;
}
