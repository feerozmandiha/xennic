import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { prisma } from '@xennic/database';
import { randomUUID } from 'crypto';

/**
 * HardDeleteAuditInterceptor — ثبت تمام Hard Delete ها در Audit Log
 *
 * هر Hard Delete باید موارد زیر را ثبت کند:
 *   1. نوع موجودیت (users, workspaces, ...)
 *   2. شناسه موجودیت
 *   3. شناسه کاربر انجام‌دهنده
 *   4. IP کاربر
 *   5. User Agent
 *   6. زمان انجام
 *   7. دلیل حذف
 *   8. مدت زمان اجرا
 *
 * ❌ خطا در audit نباید عملیات را متوقف کند (fail-safe)
 *
 * @example
 * ```typescript
 * @UseInterceptors(HardDeleteAuditInterceptor)
 * @Delete('users/:id/hard')
 * async hardDeleteUser() { ... }
 * ```
 */
@Injectable()
export class HardDeleteAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HardDeleteAuditInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (response) => {
          await this._logAudit(req, startTime, response);
        },
        error: async (error) => {
          // حتی اگر خطا رخ دهد، audit log ثبت شود
          await this._logAudit(req, startTime, null, error);
        },
      }),
    );
  }

  /**
   * ثبت در audit_logs
   */
  private async _logAudit(
    req: any,
    startTime: number,
    response?: any,
    error?: Error,
  ): Promise<void> {
    try {
      const entityType = this._extractEntityType(req.url);
      const entityId = req.params?.id || 'unknown';
      const durationMs = Date.now() - startTime;

      await prisma.$executeRaw`
        INSERT INTO "audit_logs" (
          id,
          workspace_id,
          user_id,
          ip_address,
          user_agent,
          action,
          entity,
          entity_id,
          old_values,
          new_values,
          metadata,
          created_at
        ) VALUES (
          ${randomUUID()},
          ${req.headers?.['x-workspace-id'] || null},
          ${req.user?.userId || 'system'},
          ${req.ip || req.headers?.['x-forwarded-for'] || 'unknown'},
          ${req.headers?.['user-agent']?.slice(0, 500) || 'unknown'},
          'HARD_DELETE',
          ${entityType},
          ${entityId},
          ${JSON.stringify({
            deleted: true,
            previousState: 'active',
          })}::jsonb,
          ${JSON.stringify({
            success: !error,
            error: error?.message || null,
          })}::jsonb,
          ${JSON.stringify({
            reason: req.body?.reason || 'not_provided',
            duration_ms: durationMs,
            method: req.method,
            url: req.url,
            statusCode: error ? 500 : 200,
          })}::jsonb,
          NOW()
        )
      `;

      this.logger.warn(
        `HARD_DELETE_AUDIT: ` +
        `entity=${entityType}, ` +
        `entityId=${entityId}, ` +
        `userId=${req.user?.userId}, ` +
        `ip=${req.ip}, ` +
        `success=${!error}, ` +
        `duration=${durationMs}ms`
      );
    } catch (auditErr) {
      // ❌ خطا در audit نباید عملیات اصلی را متوقف کند
      this.logger.error(
        `Audit log failed (non-blocking): ${(auditErr as Error).message}`
      );
    }
  }

  /**
   * استخراج نوع موجودیت از URL
   *
   * @example
   * /api/v1/admin/users/123/hard → 'users'
   * /api/v1/admin/workspaces/456/hard → 'workspaces'
   */
  private _extractEntityType(url: string): string {
    const patterns = [
      /\/admin\/(users)\/[^/]+\/hard/,
      /\/admin\/(workspaces)\/[^/]+\/hard/,
      /\/admin\/(projects)\/[^/]+\/hard/,
      /\/admin\/(orders)\/[^/]+\/hard/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return 'unknown';
  }
}
