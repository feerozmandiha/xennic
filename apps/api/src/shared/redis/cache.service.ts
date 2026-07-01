import { Injectable, Optional } from '@nestjs/common';
import { RedisService } from './redis.service.js';
import { MetricsService } from '../metrics/metrics.service.js';

export const TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
} as const;

@Injectable()
export class CacheService {
  constructor(
    private readonly redis: RedisService,
    @Optional() private readonly metrics?: MetricsService,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (raw === null) {
      this.metrics?.incrementCacheMisses();
      return null;
    }
    this.metrics?.incrementCacheHits();
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.redis.set(key, serialized, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidate(pattern: string): Promise<void> {
    const client = this.redis.getClient();
    let cursor = 0;
    do {
      const result = await client.scan(String(cursor), { MATCH: pattern, COUNT: 100 });
      cursor = Number(result.cursor);
      if (result.keys.length > 0) {
        await client.del(result.keys);
      }
    } while (cursor !== 0);
  }

  async remember<T>(key: string, ttl: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
