import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

/**
 * AuthThrottlerGuard — محدودیت نرخ سخت‌گیرانه برای endpointهای احراز هویت
 *
 * قوانین:
 *   - Login:          5 درخواست / 60 ثانیه
 *   - Register:       3 درخواست / 60 ثانیه
 *   - Forgot Password: 3 درخواست / 300 ثانیه
 *   - Refresh Token:  10 درخواست / 60 ثانیه
 *
 * هدف: جلوگیری از Brute Force و Credential Stuffing
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(AuthThrottlerGuard.name);

  protected override async getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.headers?.['x-forwarded-for'] || 'unknown';
    const email = req.body?.email || 'unknown';
    return `auth:${ip}:${email}`;
  }

  protected override async throwThrottlingException(): Promise<void> {
    this.logger.warn('Auth rate limit exceeded');
    throw new ThrottlerException(
      'تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ۵ دقیقه صبر کنید.',
    );
  }

  protected override getRequestResponse(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    return {
      req: ctx.getRequest(),
      res: ctx.getResponse(),
    };
  }
}
