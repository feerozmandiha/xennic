import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/infrastructure/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../guards/super-admin.guard.js';

export const SUPER_ADMIN_ONLY_KEY = 'superAdminOnly';

/**
 * دکوراتور SuperAdminOnly
 *
 * ترکیبی از:
 *   - احراز هویت JWT
 *   - بررسی نقش SUPER_ADMIN
 *   - مستندسازی Swagger
 *
 * برای عملیات بسیار حساس مثل Hard Delete استفاده می‌شود.
 *
 * @example
 * ```typescript
 * @SuperAdminOnly()
 * @Delete('users/:id/hard')
 * @ApiOperation({ summary: 'حذف دائمی کاربر' })
 * async hardDeleteUser() { ... }
 * ```
 */
export function SuperAdminOnly() {
  return applyDecorators(
    SetMetadata(SUPER_ADMIN_ONLY_KEY, true),
    UseGuards(JwtAuthGuard, SuperAdminGuard),
    ApiBearerAuth('JWT-auth'),
    ApiForbiddenResponse({
      description: 'فقط SUPER_ADMIN مجاز به انجام این عملیات است',
    }),
  );
}
