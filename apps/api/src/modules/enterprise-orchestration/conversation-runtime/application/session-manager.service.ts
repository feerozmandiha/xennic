import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { } from '../domain/conversation.entity.js';
interface Session {
  id: string;
  executionId: string;
  conversationIds: string[];
  createdAt: Date;
  lastActivityAt: Date;
}

@Injectable()
export class SessionManagerService {
  private readonly logger = new Logger(SessionManagerService.name);
  private readonly sessions = new Map<string, Session>();

  async createSession(executionId: string): Promise<Session> {
    const session: Session = {
      id: randomUUID(),
      executionId,
      conversationIds: [],
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };
    this.sessions.set(session.id, session);
    this.logger.log(`Created session ${session.id} for execution ${executionId}`);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async getOrCreate(executionId: string): Promise<Session> {
    const existing = Array.from(this.sessions.values()).find(
      s => s.executionId === executionId,
    );
    if (existing) {
      existing.lastActivityAt = new Date();
      return existing;
    }
    return this.createSession(executionId);
  }

  async linkConversation(sessionId: string, conversationId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }
    if (!session.conversationIds.includes(conversationId)) {
      session.conversationIds.push(conversationId);
      session.lastActivityAt = new Date();
    }
    this.logger.debug(`Linked conversation ${conversationId} to session ${sessionId}`);
  }

  async getActiveSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      s => s.conversationIds.length > 0,
    );
  }

  async expireSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }
    this.sessions.delete(sessionId);
    this.logger.log(`Session ${sessionId} expired`);
  }
}
