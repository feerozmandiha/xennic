import type { ISessionStore } from '../../domain/interfaces/session-store.interface.js';
import type { AgentSession } from '../../domain/types/session.types.js';

export class InMemorySessionStore implements ISessionStore {
  private readonly _sessions = new Map<string, AgentSession>();

  async create(session: AgentSession): Promise<void> {
    this._sessions.set(session.id, session);
  }

  async findById(id: string): Promise<AgentSession | null> {
    return this._sessions.get(id) ?? null;
  }

  async findByUser(workspaceId: string, userId: string): Promise<AgentSession[]> {
    return Array.from(this._sessions.values()).filter(
      (s) => s.workspaceId === workspaceId && s.userId === userId,
    );
  }

  async update(session: AgentSession): Promise<void> {
    this._sessions.set(session.id, session);
  }

  async delete(id: string): Promise<void> {
    this._sessions.delete(id);
  }

  async cleanupExpired(): Promise<number> {
    let count = 0;
    for (const [id, session] of this._sessions) {
      if (session.isExpired()) {
        this._sessions.delete(id);
        count++;
      }
    }
    return count;
  }
}
