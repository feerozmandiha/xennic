import type { AgentSession } from '../types/session.types.js';

export const I_SESSION_STORE = 'ISessionStore';

export interface ISessionStore {
  create(session: AgentSession): Promise<void>;
  findById(id: string): Promise<AgentSession | null>;
  findByUser(workspaceId: string, userId: string): Promise<AgentSession[]>;
  update(session: AgentSession): Promise<void>;
  delete(id: string): Promise<void>;
  cleanupExpired(): Promise<number>;
}
