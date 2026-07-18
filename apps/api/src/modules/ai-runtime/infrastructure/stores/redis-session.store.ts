import { Injectable } from '@nestjs/common';
import type { ISessionStore } from '../../domain/interfaces/session-store.interface.js';
import { AgentSession } from '../../domain/types/session.types.js';
import { RedisService } from '../../../enterprise-cache/infrastructure/redis/redis.service.js';

const SESSION_PREFIX = 'session:';
const USER_SESSIONS_PREFIX = 'user_sessions:';

@Injectable()
export class RedisSessionStore implements ISessionStore {
  constructor(private readonly redis: RedisService) {}

  async create(session: AgentSession): Promise<void> {
    const key = `${SESSION_PREFIX}${session.id}`;
    await this.redis.hset(key, 'id', session.id);
    await this.redis.hset(key, 'agentId', session.agentId);
    await this.redis.hset(key, 'workspaceId', session.workspaceId);
    await this.redis.hset(key, 'userId', session.userId);
    await this.redis.hset(key, 'status', session.status);
    await this.redis.hset(key, 'metadata', JSON.stringify(session.metadata));
    await this.redis.hset(key, 'createdAt', session.createdAt.toISOString());
    await this.redis.hset(key, 'expiresAt', session.expiresAt.toISOString());

    const ttlSeconds = Math.max(1, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
    await this.redis.expire(key, ttlSeconds);

    const userSetKey = `${USER_SESSIONS_PREFIX}${session.workspaceId}:${session.userId}`;
    await this.redis.sadd(userSetKey, session.id);
    await this.redis.expire(userSetKey, ttlSeconds);
  }

  async findById(id: string): Promise<AgentSession | null> {
    const key = `${SESSION_PREFIX}${id}`;
    const data = await this.redis.hgetall(key);
    if (!data || Object.keys(data).length === 0) return null;

    return this.hashToSession(data);
  }

  async findByUser(workspaceId: string, userId: string): Promise<AgentSession[]> {
    const userSetKey = `${USER_SESSIONS_PREFIX}${workspaceId}:${userId}`;
    const ids = await this.redis.smembers(userSetKey);

    if (ids.length === 0) return [];

    const sessions: AgentSession[] = [];
    for (const id of ids) {
      const session = await this.findById(id);
      if (session) sessions.push(session);
    }

    return sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(session: AgentSession): Promise<void> {
    const key = `${SESSION_PREFIX}${session.id}`;
    await this.redis.hset(key, 'status', session.status);
    await this.redis.hset(key, 'metadata', JSON.stringify(session.metadata));
    await this.redis.hset(key, 'expiresAt', session.expiresAt.toISOString());

    const ttlSeconds = Math.max(1, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
    await this.redis.expire(key, ttlSeconds);
  }

  async delete(id: string): Promise<void> {
    const key = `${SESSION_PREFIX}${id}`;
    const data = await this.redis.hgetall(key);
    if (data && Object.keys(data).length > 0) {
      const workspaceId = data['workspaceId'] ?? '';
      const userId = data['userId'] ?? '';
      if (workspaceId && userId) {
        const userSetKey = `${USER_SESSIONS_PREFIX}${workspaceId}:${userId}`;
        await this.redis.srem(userSetKey, id);
      }
    }
    await this.redis.del(key);
  }

  async cleanupExpired(): Promise<number> {
    return 0;
  }

  private hashToSession(data: Record<string, string>): AgentSession {
    let metadata: Record<string, unknown>;
    try {
      metadata = JSON.parse(data['metadata'] ?? '{}');
    } catch {
      metadata = {};
    }

    return new AgentSession(
      data['id'] ?? '',
      data['agentId'] ?? '',
      data['workspaceId'] ?? '',
      data['userId'] ?? '',
      (data['status'] ?? 'idle') as AgentSession['status'],
      new Date(data['createdAt'] ?? Date.now()),
      new Date(data['expiresAt'] ?? Date.now()),
      metadata,
    );
  }
}
