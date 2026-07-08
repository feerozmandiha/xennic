import { Injectable, Inject } from '@nestjs/common';
import type { ISessionStore } from '../../domain/interfaces/session-store.interface.js';
import { I_SESSION_STORE } from '../../domain/interfaces/session-store.interface.js';
import { AgentSession } from '../../domain/types/session.types.js';
import type { SessionStatus } from '../../domain/types/session.types.js';
import { SessionNotFoundException, SessionExpiredException } from '../../domain/exceptions/session.exception.js';

@Injectable()
export class AgentSessionManagerService {
  constructor(
    @Inject(I_SESSION_STORE)
    private readonly store: ISessionStore,
  ) {}

  async create(
    agentId: string,
    workspaceId: string,
    userId: string,
    ttlMs?: number,
  ): Promise<AgentSession> {
    const existing = await this.store.findByUser(workspaceId, userId);
    for (const session of existing) {
      if (!session.isExpired() && session.agentId === agentId) {
        return session;
      }
    }

    const session = AgentSession.create(agentId, workspaceId, userId, ttlMs);
    await this.store.create(session);
    return session;
  }

  async get(id: string): Promise<AgentSession> {
    const session = await this.store.findById(id);
    if (!session) {
      throw new SessionNotFoundException(id);
    }
    if (session.isExpired()) {
      throw new SessionExpiredException(id);
    }
    return session;
  }

  async transition(sessionId: string, target: SessionStatus): Promise<AgentSession> {
    const session = await this.get(sessionId);
    session.transition(target);
    await this.store.update(session);
    return session;
  }

  async end(sessionId: string): Promise<void> {
    const session = await this.store.findById(sessionId);
    if (!session) {
      throw new SessionNotFoundException(sessionId);
    }
    session.expiresAt = new Date(0);
    await this.store.update(session);
  }

  async cleanup(): Promise<number> {
    return this.store.cleanupExpired();
  }
}
