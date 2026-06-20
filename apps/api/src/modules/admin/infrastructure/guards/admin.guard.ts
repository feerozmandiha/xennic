import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { prisma } from '@xennic/database';

/**
 * AdminGuard — بررسی دسترسی ادمین
 *
 * ✅ فقط از RBAC واقعی استفاده می‌کند
 * ❌ هیچ fallback ناامن (email خاص) ندارد
 *
 * روش‌های بررسی (به ترتیب اولویت):
 *   1. user_roles + roles (PRIMARY)
 *   2. is_admin column در users (SECONDARY — اگر وجود داشته باشد)
 *
 * نقش‌های مجاز: SUPER_ADMIN, PLATFORM_ADMIN
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  /**
   * نقش‌هایی که دسترسی ادمین دارند
   * ⚠️ این مقادیر باید با جدول roles مطابقت داشته باشند
   */
  private readonly ADMIN_ROLE_SLUGS = ['SUPER_ADMIN', 'PLATFORM_ADMIN'];

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    // ── بررسی احراز هویت ─────────────────────────────────────────────────────
    if (!user?.userId) {
      throw new UnauthorizedException('احراز هویت لازم است');
    }

    try {
      const isAdmin = await this._checkAdmin(user.userId);

      if (!isAdmin) {
        this.logger.warn(
          `AdminGuard: DENIED — userId=${user.userId}, ` +
          `ip=${req.ip}, path=${req.url}`
        );
        throw new ForbiddenException('دسترسی ادمین لازم است');
      }

      req.isAdmin = true;
      this.logger.debug(`AdminGuard: GRANTED — userId=${user.userId}`);
      return true;
    } catch (err) {
      if (
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      }
      this.logger.error(`AdminGuard error: ${(err as Error).message}`);
      throw new ForbiddenException('خطا در بررسی دسترسی');
    }
  }

  /**
   * بررسی آیا کاربر ادمین است
   *
   * فقط از RBAC واقعی استفاده می‌کند — بدون fallback ناامن
   */
  private async _checkAdmin(userId: string): Promise<boolean> {
    // ── روش اول: user_roles + roles (PRIMARY) ──────────────────────────────────
    try {
      const rows = await prisma.$queryRaw<{ role_slug: string }[]>`
        SELECT r.slug AS role_slug
        FROM "user_roles" ur
        JOIN "roles" r ON r.id = ur.role_id
        WHERE ur.user_id = ${userId}
          AND r.slug = ANY(${this.ADMIN_ROLE_SLUGS})
        LIMIT 1
      `;

      if (rows.length > 0) {
        this.logger.debug(
          `Admin check via RBAC: role=${rows[0]?.role_slug}`
        );
        return true;
      }
    } catch (err) {
      this.logger.error(`RBAC check failed: ${(err as Error).message}`);
      // ❌ دیگر fallback نمی‌کنیم — خطا باید برطرف شود
      throw new ForbiddenException('خطا در بررسی دسترسی RBAC');
    }

    // ── روش دوم: is_admin column (SECONDARY) ──────────────────────────────────
    try {
      const rows = await prisma.$queryRaw<{ is_admin: boolean }[]>`
        SELECT is_admin FROM "users"
        WHERE id = ${userId}
          AND is_admin = true
          AND deleted_at IS NULL
        LIMIT 1
      `;

      if (rows.length > 0 && rows[0]?.is_admin === true) {
        this.logger.debug('Admin check via is_admin column');
        return true;
      }
    } catch {
      // Column ممکن است وجود نداشته باشد — مشکلی نیست
      this.logger.debug('is_admin column not available — using RBAC only');
    }

    // ── کاربر ادمین نیست ─────────────────────────────────────────────────────
    return false;
  }
}
