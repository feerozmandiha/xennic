import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service.js';

export interface SessionData {
  userId: string;
  workspaceId: string;
  roles: string[];
  refreshToken?: string;
  deviceInfo?: string;
  createdAt: string;
  lastAccessAt: string;
}

@Injectable()
export class SessionStoreService {
  private readonly prefix = 'session:';

  constructor(private readonly redis: RedisService) {}

  private buildKey(sessionId: string): string {
    return `${this.prefix}${sessionId}`;
  }

  async createSession(sessionId: string, data: SessionData, ttl: number): Promise<void> {
    const key = this.buildKey(sessionId);
    await this.redis.set(key, JSON.stringify(data), ttl);
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const key = this.buildKey(sessionId);
    const raw = await this.redis.get(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as SessionData;
  }

  async updateSession(sessionId: string, data: Partial<SessionData>): Promise<void> {
    const key = this.buildKey(sessionId);
    const existing = await this.getSession(sessionId);
    if (existing === null) {
      return;
    }
    const updated: SessionData = {
      ...existing,
      ...data,
      lastAccessAt: new Date().toISOString(),
    };
    await this.redis.getClient().set(key, JSON.stringify(updated), {
      expiration: 'KEEPTTL',
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = this.buildKey(sessionId);
    await this.redis.del(key);
  }
}
