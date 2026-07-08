import { Injectable, Logger } from '@nestjs/common';
import type { RateLimitConfig, RateLimitResult, IRateLimiter } from '../../domain/interfaces/rate-limiter.interface.js';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

@Injectable()
export class TokenBucketRateLimiter implements IRateLimiter {
  private readonly logger = new Logger(TokenBucketRateLimiter.name);
  private readonly buckets = new Map<string, Bucket>();
  private readonly tiers: Record<RateLimitConfig['tier'], RateLimitConfig> = {
    free: { tier: 'free', requestsPerWindow: 10, windowMs: 60_000 },
    basic: { tier: 'basic', requestsPerWindow: 100, windowMs: 60_000 },
    premium: { tier: 'premium', requestsPerWindow: 1000, windowMs: 60_000, burstLimit: 2000 },
    enterprise: { tier: 'enterprise', requestsPerWindow: 10000, windowMs: 60_000, burstLimit: 50000 },
  };

  async check(key: string, tier: RateLimitConfig['tier']): Promise<RateLimitResult> {
    const config = this.tiers[tier];
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: config.requestsPerWindow, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    const elapsed = now - bucket.lastRefill;
    const refill = Math.floor((elapsed / config.windowMs) * config.requestsPerWindow);
    if (refill > 0) {
      bucket.tokens = Math.min(config.requestsPerWindow + (config.burstLimit ?? 0), bucket.tokens + refill);
      bucket.lastRefill = now;
    }

    if (bucket.tokens > 0) {
      bucket.tokens--;
      const resetAt = new Date(bucket.lastRefill + config.windowMs).toISOString();
      return { allowed: true, remaining: Math.floor(bucket.tokens), resetAt };
    }

    const resetAt = new Date(bucket.lastRefill + config.windowMs).toISOString();
    this.logger.warn(`Rate limit exceeded for ${key} (${tier})`);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterMs: bucket.lastRefill + config.windowMs - now,
    };
  }

  async reset(key: string): Promise<void> {
    this.buckets.delete(key);
  }

  getConfig(tier: RateLimitConfig['tier']): RateLimitConfig {
    return this.tiers[tier];
  }
}
