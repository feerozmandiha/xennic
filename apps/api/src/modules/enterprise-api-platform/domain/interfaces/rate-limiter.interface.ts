export const IRATE_LIMITER = 'IRateLimiter' as const;

export interface RateLimitConfig {
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  requestsPerWindow: number;
  windowMs: number;
  burstLimit?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  retryAfterMs?: number;
}

export interface IRateLimiter {
  check(key: string, tier: RateLimitConfig['tier']): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
  getConfig(tier: RateLimitConfig['tier']): RateLimitConfig;
}
