import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Injectable, ExecutionContext, Logger } from '@nestjs/common';

/**
 * XennicThrottlerGuard — Rate Limiting هوشمند
 *
 * قوانین پیش‌فرض:
 *   - عمومی: 100 درخواست / 60 ثانیه
 *   - Auth endpoints: 5 درخواست / 60 ثانیه
 *   - AI endpoints: 20 درخواست / 60 ثانیه
 *
 * ردیابی بر اساس IP + User ID
 */
@Injectable()
export class XennicThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(XennicThrottlerGuard.name);

  protected override async getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.headers?.['x-forwarded-for'] || 'unknown';
    const userId = req.user?.userId || 'anonymous';
    return `${ip}:${userId}`;
  }

  protected override async throwThrottlingException(): Promise<void> {
    this.logger.warn('Rate limit exceeded');
    throw new ThrottlerException(
      'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید.',
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
