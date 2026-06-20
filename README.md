🔒 Xennic Security Hardening — SEC-001
تاریخ: 2026-06-15
وضعیت: آماده اجرا

📁 ساختار فایل‌ها
text

security/
├── README.md                                    ← این فایل
├── .env.example                                 ← متغیرهای محیطی نمونه
│
├── apps/
│   └── api/
│       ├── src/
│       │   ├── main.ts                          ← SEC-001A: CORS Hardening
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   │   ├── throttler.guard.ts        ← SEC-001C: Rate Limiting
│       │   │   │   ├── auth-throttler.guard.ts   ← SEC-001C: Auth Rate Limiting
│       │   │   │   ├── rate-limit.decorator.ts   ← SEC-001C: Rate Limit Decorators
│       │   │   │   └── super-admin.guard.ts      ← SEC-001D: Super Admin Guard
│       │   │   ├── decorators/
│       │   │   │   └── super-admin-only.decorator.ts  ← SEC-001D: Decorator
│       │   │   └── interceptors/
│       │   │       └── hard-delete-audit.interceptor.ts  ← SEC-001D: Audit
│       │   └── modules/
│       │       └── admin/
│       │           └── infrastructure/
│       │               └── guards/
│       │                   ├── admin.guard.ts    ← SEC-001B: اصلاح شده
│       │                   └── admin.guard.spec.ts  ← SEC-001B: تست
│       └── test/
│           └── cors-security.spec.ts            ← SEC-001A: تست CORS
│
└── workspace/
    └── services/
        └── engineering-service/
            └── src/
                └── main.py                      ← SEC-001A: Python CORS
🚀 مراحل اجرا
پیش‌نیاز: Backup
Bash

# از پایگاه داده backup بگیرید
pg_dump xennic > backup_pre_security_$(date +%Y%m%d).sql
مرحله ۱: نصب پکیج‌ها
Bash

cd ~/xennic/apps/api
pnpm add @nestjs/throttler
مرحله ۲: کپی فایل‌ها
۲.۱. فایل‌های جدید (ایجاد کنید):
Bash

# Guards
cp security/apps/api/src/common/guards/throttler.guard.ts ~/xennic/apps/api/src/common/guards/
cp security/apps/api/src/common/guards/auth-throttler.guard.ts ~/xennic/apps/api/src/common/guards/
cp security/apps/api/src/common/guards/rate-limit.decorator.ts ~/xennic/apps/api/src/common/guards/
cp security/apps/api/src/common/guards/super-admin.guard.ts ~/xennic/apps/api/src/common/guards/

# Decorators
cp security/apps/api/src/common/decorators/super-admin-only.decorator.ts ~/xennic/apps/api/src/common/decorators/

# Interceptors
cp security/apps/api/src/common/interceptors/hard-delete-audit.interceptor.ts ~/xennic/apps/api/src/common/interceptors/

# Tests
cp security/apps/api/src/modules/admin/infrastructure/guards/admin.guard.spec.ts ~/xennic/apps/api/src/modules/admin/infrastructure/guards/
cp security/apps/api/test/cors-security.spec.ts ~/xennic/apps/api/test/
۲.۲. فایل‌های اصلاحی (جایگزین کنید):
Bash

# AdminGuard — اصلاح شده
cp security/apps/api/src/modules/admin/infrastructure/guards/admin.guard.ts ~/xennic/apps/api/src/modules/admin/infrastructure/guards/

# main.ts — CORS Hardening
cp security/apps/api/src/main.ts ~/xennic/apps/api/src/

# Python CORS
cp security/workspace/services/engineering-service/src/main.py ~/xennic/workspace/services/engineering-service/src/
۲.۳. فایل‌های محیطی:
Bash

# اضافه کردن CORS_ORIGINS به .env
echo "CORS_ORIGINS=http://localhost:3000,http://localhost:3001" >> ~/xennic/.env
مرحله ۳: اعمال تغییرات در api.module.ts
فایل apps/api/src/api.module.ts را ویرایش کنید:

TypeScript

import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    // ... سایر imports

    // ✅ SEC-001C: Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 10000,   // 10 ثانیه
        limit: 10,     // 10 درخواست
      },
      {
        name: 'medium',
        ttl: 60000,   // 60 ثانیه
        limit: 100,   // 100 درخواست
      },
      {
        name: 'long',
        ttl: 3600000, // 1 ساعت
        limit: 1000,  // 1000 درخواست
      },
    ]),

    // ... سایر imports
  ],
})
export class ApiModule {}
مرحله ۴: اعمال Rate Limiting در Controllerها
Auth Controller:
TypeScript

import { Throttle } from '@nestjs/throttler';
import { AuthThrottlerGuard } from '../../common/guards/auth-throttler.guard';

@Controller('auth')
@UseGuards(AuthThrottlerGuard)
export class AuthController {

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login() { ... }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register() { ... }
}
AI Controller:
TypeScript

import { XennicThrottlerGuard } from '../../common/guards/throttler.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard, XennicThrottlerGuard)
export class AiController {

  @Post('conversations/:id/messages')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async sendMessage() { ... }
}
مرحله ۵: اعمال Hard Delete Protection در Admin Controller
TypeScript

import { SuperAdminGuard } from '../../../../common/guards/super-admin.guard';
import { HardDeleteAuditInterceptor } from '../../../../common/interceptors/hard-delete-audit.interceptor';
import { UseInterceptors, UseGuards } from '@nestjs/common';

// ✅ Soft Delete — Admin مجاز
@Delete('users/:id')
async deleteUser(@Param('id') id: string) {
  return this.svc.deleteUser(id);
}

// ✅ Hard Delete — فقط SUPER_ADMIN + Audit
@Delete('users/:id/hard')
@UseGuards(SuperAdminGuard)
@UseInterceptors(HardDeleteAuditInterceptor)
async hardDeleteUser(
  @Param('id') id: string,
  @Body() body: { reason?: string },
) {
  return this.svc.hardDeleteUser(id, body.reason);
}
مرحله ۶: تست
Bash

# تست واحد
cd ~/xennic/apps/api
pnpm test

# تست CORS
pnpm test -- --testPathPattern=cors-security

# تست AdminGuard
pnpm test -- --testPathPattern=admin.guard

# بررسی TypeScript
pnpm typecheck
✅ معیارهای پذیرش
معیار	تست
CORS فقط origins مجاز	test/cors-security.spec.ts
AdminGuard بدون fallback	admin.guard.spec.ts
Rate Limiting فعال	pnpm test
Hard Delete فقط SUPER_ADMIN	Manual test
Audit Log ثبت می‌شود	Manual test
⚠️ نکات مهم
ترتیب اجرا مهم است — ابتدا CORS، سپس AdminGuard
Backup بگیرید — قبل از هر تغییر
در staging تست کنید — قبل از production
لاگ‌ها را بررسی کنید — بعد از استقرار
🔄 اقدامات بعدی
پس از تکمیل SEC-001:

SEC-002: تکمیل مدل‌های Prisma (حذف Raw SQL)
SEC-003: پیاده‌سازی Event Bus
SEC-004: شروع pandapower integration