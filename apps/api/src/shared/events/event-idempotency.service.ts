import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class EventIdempotencyService {
  private readonly defaultTtl = 3600;
  private readonly keyPrefix = 'event:idempotency:';

  constructor(private readonly redis: RedisService) {}

  async isProcessed(eventId: string): Promise<boolean> {
    const value = await this.redis.get(`${this.keyPrefix}${eventId}`);
    return value !== null;
  }

  async markProcessed(eventId: string, ttl?: number): Promise<void> {
    await this.redis.set(`${this.keyPrefix}${eventId}`, '1', ttl ?? this.defaultTtl);
  }
}
