import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  /** پنجره زمانی (میلی‌ثانیه) */
  ttl: number;
  /** حداکثر تعداد درخواست در پنجره زمانی */
  limit: number;
}

/**
 * دکوراتور سفارشی برای محدودسازی نرخ درخواست
 *
 * @example
 * ```typescript
 * @RateLimit({ ttl: 60000, limit: 10 })
 * @Post('login')
 * async login() { ... }
 * ```
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

/**
 * دکوراتورهای پیش‌فرض برای سناریوهای مختلف
 */
export const AuthRateLimit = () => RateLimit({ ttl: 60000, limit: 5 });
export const ApiRateLimit = () => RateLimit({ ttl: 60000, limit: 100 });
export const AiRateLimit = () => RateLimit({ ttl: 60000, limit: 20 });
export const AdminRateLimit = () => RateLimit({ ttl: 60000, limit: 200 });
