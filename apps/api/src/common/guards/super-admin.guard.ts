import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { prisma } from '@xennic/database';

/**
 * SuperAdminGuard — فقط SUPER_ADMIN
 *
 * این Guard برای عملیات بسیار حساس مثل Hard Delete استفاده می‌شود.
 *
 * ✅ فقط از RBAC استفاده می‌کند
 * ❌ هیچ fallback ناامنی ندارد
 * ❌ هیچ email-based تشخیصی ندارد
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, SuperAdminGuard)
 * @Delete('users/:id/hard')
 * async hardDeleteUser() { ... }
 * ```
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  private readonly logger = new Logger(SuperAdminGuard.name);

  /**
   * نقش‌های مجاز — فقط SUPER_ADMIN
   * بر خلاف AdminGuard که PLATFORM_ADMIN هم قبول می‌کند
   */
  private readonly ALLOWED_ROLES = ['SUPER_ADMIN'];

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    // ── بررسی احراز هویت ─────────────────────────────────────────────────────
    if (!user?.userId) {
      throw new ForbiddenException('احراز هویت لازم است');
    }

    // ── بررسی نقش SUPER_ADMIN ─────────────────────────────────────────────────
    try {
      const rows = await prisma.$queryRaw<{ role_slug: string }[]>`
        SELECT r.slug AS role_slug
        FROM "user_roles" ur
        JOIN "roles" r ON r.id = ur.role_id
        WHERE ur.user_id = ${user.userId}
          AND r.slug = ANY(${this.ALLOWED_ROLES})
        LIMIT 1
      `;

      if (rows.length === 0) {
        this.logger.warn(
          `SuperAdminGuard: DENIED — userId=${user.userId}, ` +
          `ip=${req.ip}, path=${req.url}, ` +
          `userAgent=${req.headers?.['user-agent']?.slice(0, 100)}`
        );
        throw new ForbiddenException(
          'فقط SUPER_ADMIN به این عملیات دسترسی دارد'
        );
      }

      this.logger.debug(
        `SuperAdminGuard: GRANTED — userId=${user.userId}, role=${rows[0]?.role_slug}`
      );
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      this.logger.error(
        `SuperAdminGuard error: ${(err as Error).message}`
      );
      throw new ForbiddenException('خطا در بررسی دسترسی');
    }
  }
}
