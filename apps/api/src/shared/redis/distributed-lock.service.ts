import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service.js';

@Injectable()
export class DistributedLockService {
  constructor(private readonly redis: RedisService) {}

  async acquire(lockKey: string, ttl: number): Promise<boolean> {
    const result = await this.redis.getClient().set(lockKey, 'locked', {
      condition: 'NX',
      expiration: { type: 'EX', value: ttl },
    });
    return result !== null;
  }

  async release(lockKey: string): Promise<void> {
    await this.redis.del(lockKey);
  }

  async withLock<T>(lockKey: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    const acquired = await this.acquire(lockKey, ttl);
    if (!acquired) {
      throw new Error(`Could not acquire lock: ${lockKey}`);
    }
    try {
      return await fn();
    } finally {
      await this.release(lockKey);
    }
  }
}
