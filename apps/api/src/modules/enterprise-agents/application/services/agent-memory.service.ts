import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IAgentMemory } from '../../domain/interfaces/agent-memory.interface.js';
import type { AgentMemoryEntry, AgentMemorySession } from '../../domain/types/agent.types.js';
import { MemoryType } from '../../domain/types/agent.types.js';

@Injectable()
export class AgentMemory implements IAgentMemory {
  private sessions = new Map<string, AgentMemorySession>();

  createSession(agentId: string, agentSlug: string, workspaceId: string): AgentMemorySession {
    const session: AgentMemorySession = {
      sessionId: randomUUID(), agentId, agentSlug, workspaceId,
      entries: [], createdAt: Date.now(), updatedAt: Date.now(), metadata: {},
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  getSession(sessionId: string): AgentMemorySession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  store(sessionId: string, entry: Omit<AgentMemoryEntry, 'id' | 'timestamp'>): AgentMemoryEntry {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    const stored: AgentMemoryEntry = {
      id: randomUUID(), sessionId, agentId: entry.agentId,
      type: entry.type, content: entry.content, timestamp: Date.now(),
      ttl: entry.ttl, metadata: entry.metadata,
    };
    session.entries.push(stored);
    session.updatedAt = Date.now();

    if (stored.ttl) {
      setImmediate(() => this.evictExpired(sessionId));
    }

    return stored;
  }

  retrieve(sessionId: string, type?: MemoryType): AgentMemoryEntry[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    let entries = session.entries;
    if (type !== undefined) {
      entries = entries.filter((e) => e.type === type);
    }
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }

  async search(sessionId: string, query: string, maxResults = 5): Promise<AgentMemoryEntry[]> {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    const ql = query.toLowerCase();
    const words = ql.split(/\s+/).filter((w) => w.length > 2);

    const scored = session.entries.map((entry) => {
      let score = 0;
      const contentStr = JSON.stringify(entry.content).toLowerCase();
      for (const word of words) {
        const regex = new RegExp(word, 'g');
        const matches = contentStr.match(regex);
        if (matches) score += matches.length;
      }
      return { entry, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map((s) => s.entry);
  }

  clearSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.entries = [];
      session.updatedAt = Date.now();
    }
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private evictExpired(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    const now = Date.now();
    session.entries = session.entries.filter((e) => {
      if (!e.ttl) return true;
      return e.timestamp + e.ttl > now;
    });
  }
}
