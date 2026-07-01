import type { AgentMemoryEntry, AgentMemorySession, MemoryType } from '../types/agent.types.js';

export interface IAgentMemory {
  createSession(agentId: string, agentSlug: string, workspaceId: string): AgentMemorySession;
  getSession(sessionId: string): AgentMemorySession | null;
  store(sessionId: string, entry: Omit<AgentMemoryEntry, 'id' | 'timestamp'>): AgentMemoryEntry;
  retrieve(sessionId: string, type?: MemoryType): AgentMemoryEntry[];
  search(sessionId: string, query: string, maxResults?: number): Promise<AgentMemoryEntry[]>;
  clearSession(sessionId: string): void;
  deleteSession(sessionId: string): void;
}
