import {
  CanActivate, ExecutionContext, ForbiddenException,
  Injectable, UnauthorizedException, Logger,
} from '@nestjs/common';
import { prisma } from '@xennic/database';

/**
 * AdminGuard — بررسی دسترسی ادمین
 *
 * روش ۱: ستون is_admin در جدول users (اگر وجود داشت)
 * روش ۲: role = 'super_admin' | 'admin' در جدول user_roles
 * روش ۳: ستون is_active با email خاص (fallback)
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req  = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user?.userId) {
      throw new UnauthorizedException('احراز هویت لازم است');
    }

    try {
      const isAdmin = await this._checkAdmin(user.userId);

      if (!isAdmin) {
        this.logger.warn(`AdminGuard: denied — userId=${user.userId}`);
        throw new ForbiddenException('دسترسی ادمین لازم است');
      }

      req.isAdmin = true;
      this.logger.debug(`AdminGuard: granted — userId=${user.userId}`);
      return true;

    } catch (err) {
      if (err instanceof ForbiddenException || err instanceof UnauthorizedException) {
        throw err;
      }
      this.logger.error(`AdminGuard error: ${(err as Error).message}`);
      throw new ForbiddenException('خطا در بررسی دسترسی');
    }
  }

  private async _checkAdmin(userId: string): Promise<boolean> {
    // روش اول: is_admin column در جدول users
    try {
      const rows = await prisma.$queryRaw<{ is_admin: boolean }[]>`
        SELECT is_admin FROM "users"
        WHERE id = ${userId}
          AND is_admin = true
          AND deleted_at IS NULL
        LIMIT 1
      `;
      if (rows.length > 0 && rows[0]?.is_admin === true) return true;
    } catch (e) {
      this.logger.debug(`is_admin check failed: ${(e as Error).message}`);
    }

    // روش دوم: user_roles با role_id → جدول roles
    try {
      const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT ur.id FROM "user_roles" ur
        JOIN "roles" r ON r.id = ur.role_id
        WHERE ur.user_id = ${userId}
          AND r.name IN ('super_admin', 'admin')
        LIMIT 1
      `;
      if (rows.length > 0) return true;
    } catch (e) {
      this.logger.debug(`user_roles+roles check failed: ${(e as Error).message}`);
    }

    return false;
  }
}
