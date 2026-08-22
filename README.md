<!-- XENNIC_LOCAL_RUNTIME_GUIDE -->

# Xennic Local Runtime Guide

این بخش راهنمای راه‌اندازی و خاموش‌کردن بخش‌های مختلف پروژه Xennic در محیط لوکال است.

## نکته مهم درباره Docker

در وضعیت فعلی ریپوزیتوری:

- زیرساخت‌ها با Docker اجرا می‌شوند:
  - PostgreSQL
  - Redis
  - RabbitMQ
  - Qdrant
- سرویس‌های Python با Docker اجرا می‌شوند:
  - `engineering-service`
  - `ai-service`
  - `vision-service`
- Backend و Frontend برای **استقرار تولید** اکنون Dockerfile رسمی دارند:
  - `apps/api/Dockerfile` → سرویس `api` (NestJS/Fastify)
  - `apps/web/Dockerfile` → سرویس `web` (Next.js standalone)
  - استک کامل تولید: `infrastructure/docker/compose/production/docker-compose.yml`
    و اسکریپت `infrastructure/docker/scripts/deploy.sh`
  - راهنمای استقرار فاز صفر/آلفا: `docs/deployment/phase-0-alpha-launch.md`
- اما برای **توسعه روزمره**، API و Web همچنان با `pnpm` روی host اجرا می‌شوند:
  - API از مسیر `apps/api` با `pnpm --filter @xennic/api dev`
  - Web از مسیر `apps/web` با `pnpm --filter @xennic/web dev`

بنابراین برای توسعه روزمره، همه چیز را یکجا بالا نیاورید. سرویس‌های Python سنگین هستند و ممکن است باعث کندی یا هنگ سیستم شوند.

## نسخه Python برای تست‌های لوکال

سرویس‌های Python پروژه با Python 3.12 پشتیبانی و در CI اجرا می‌شوند. فایل `.python-version`
نیز روی `3.12` تنظیم شده است. برای اجرای تست‌های Python از venv مبتنی بر 3.12 استفاده کنید؛
Python 3.14 در حال حاضر با برخی وابستگی‌های native مثل NumPy/CFFI سازگار نیست.

نمونه:

```bash
cd workspace/services/engineering-service
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
PYTHONPATH=. python -m pytest tests -q --tb=short
```

---

## 1. راه‌اندازی سبک برای توسعه روزمره

این حالت پیشنهادی برای اکثر کارهای روزانه است.

### سرویس‌هایی که با Docker بالا می‌آیند

- PostgreSQL
- Redis
- RabbitMQ

### سرویس‌هایی که فعلاً خاموش می‌مانند

- `engineering-service`
- `ai-service`
- `vision-service`
- `qdrant`

### دستور راه‌اندازی زیرساخت سبک

```bash
cd /media/ahmad/home/ahmad/xennic
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d postgres redis rabbitmq
```

### بررسی وضعیت

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml ps
```

### اجرای API روی host

در یک terminal جداگانه:

```bash
cd /media/ahmad/home/ahmad/xennic
corepack pnpm --filter @xennic/api dev
```

آدرس API:

```text
http://localhost:3000/api/v1
```

Health check:

```bash
curl -s http://localhost:3000/api/v1/health
```

### اجرای Web روی host

در terminal جداگانه:

```bash
cd /media/ahmad/home/ahmad/xennic
corepack pnpm --filter @xennic/web dev
```

آدرس Web:

```text
http://localhost:3001/fa
```

Smoke test:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/fa
```

---

## 2. راه‌اندازی Engineering Service هنگام نیاز

این سرویس برای محاسبات مهندسی Python استفاده می‌شود.

### اگر image قبلاً build شده است

```bash
cd /media/ahmad/home/ahmad/xennic
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d --no-build engineering-service
```

### اگر build لازم است

در شبکه‌های کند بهتر است build با `--network=host` انجام شود:

```bash
cd /media/ahmad/home/ahmad/xennic
docker build --network=host --progress=plain \
  -t base-engineering-service:latest \
  -f workspace/services/engineering-service/Dockerfile \
  workspace/services/engineering-service
```

سپس:

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d --no-build engineering-service
```

### تست Engineering

```bash
curl -s http://localhost:8001/health | python3 -m json.tool
```

```bash
curl -s -X POST http://localhost:8001/api/v1/engineering/basic/ohms-law \
  -H 'Content-Type: application/json' \
  -d '{"voltage_v":230,"current_a":10}' | python3 -m json.tool
```

### خاموش کردن Engineering

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml stop engineering-service
```

---

## 3. راه‌اندازی Vision Service هنگام نیاز

`vision-service` سنگین است و از OpenCV، Tesseract و پردازش تصویر استفاده می‌کند. فقط وقتی OCR یا Vision لازم دارید آن را روشن کنید.

### اگر image قبلاً build شده است

```bash
cd /media/ahmad/home/ahmad/xennic
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d --no-build vision-service
```

### اگر build لازم است

```bash
cd /media/ahmad/home/ahmad/xennic
docker build --network=host --progress=plain \
  -t base-vision-service:latest \
  -f workspace/services/vision-service/Dockerfile \
  workspace/services/vision-service
```

### تست OpenCV داخل image

```bash
docker run --rm --entrypoint python base-vision-service:latest -c "import cv2; print('CV2_OK', cv2.__version__)"
```

### تست Vision

```bash
curl -s http://localhost:8003/health | python3 -m json.tool
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8003/docs
```

### خاموش کردن Vision

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml stop vision-service
```

---

## 4. راه‌اندازی AI Service هنگام نیاز

`ai-service` معمولاً به `engineering-service` و `qdrant` نیاز دارد.

### راه‌اندازی Qdrant

```bash
cd /media/ahmad/home/ahmad/xennic
docker network inspect xennic-network >/dev/null 2>&1 || docker network create xennic-network
docker compose -f workspace/docker-compose.yml up -d qdrant
```

تست Qdrant:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:6333/collections
```

خروجی مطلوب:

```text
200
```

### راه‌اندازی Engineering برای AI

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d --no-build engineering-service
```

### راه‌اندازی AI Service

اگر image قبلاً build شده است:

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d --no-build ai-service
```

اگر build لازم است:

```bash
docker build --network=host --progress=plain \
  -t base-ai-service:latest \
  -f workspace/services/ai-service/Dockerfile \
  workspace/services/ai-service
```

سپس:

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d --no-build ai-service
```

### تست AI Service

```bash
curl -s http://localhost:8002/health | python3 -m json.tool
```

```bash
curl -s http://localhost:8002/api/v1/ai/agents | python3 -m json.tool
```

### خاموش کردن AI

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml stop ai-service
```

اگر Qdrant لازم نیست:

```bash
docker compose -f workspace/docker-compose.yml stop qdrant
```

---

## 5. اجرای همه سرویس‌ها با هم

این حالت فقط وقتی توصیه می‌شود که RAM و CPU کافی دارید.

```bash
cd /media/ahmad/home/ahmad/xennic
docker compose -f workspace/docker-compose.yml up -d qdrant
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d \
  postgres redis rabbitmq engineering-service ai-service vision-service
```

بررسی وضعیت:

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml ps
docker compose -f workspace/docker-compose.yml ps
```

مشاهده مصرف منابع:

```bash
docker stats
```

اگر سیستم کند شد، سرویس‌های سنگین را خاموش کنید:

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml stop engineering-service ai-service vision-service
docker compose -f workspace/docker-compose.yml stop qdrant
```

---

## 6. خاموش کردن کل سرویس‌ها

### خاموش کردن موقت همه containerهای پروژه

```bash
cd /media/ahmad/home/ahmad/xennic
docker compose -f infrastructure/docker/compose/base/docker-compose.yml stop
docker compose -f workspace/docker-compose.yml stop
```

### حذف containerها بدون حذف volume و داده‌ها

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml down
docker compose -f workspace/docker-compose.yml down
```

### بررسی اینکه چیزی از Xennic روشن نمانده باشد

```bash
docker ps --filter "name=xennic-prod"
```

---

## 7. خاموش کردن فقط سرویس‌های سنگین

اگر API و Web خوب کار می‌کنند ولی سیستم کند شده است، این‌ها را خاموش کنید:

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml stop engineering-service ai-service vision-service
docker compose -f workspace/docker-compose.yml stop qdrant
```

زیرساخت سبک را می‌توانید روشن نگه دارید:

- `postgres`
- `redis`
- `rabbitmq`

---

## 8. راه‌اندازی پیشنهادی روزمره

برای کار معمولی روی API و Web:

```bash
cd /media/ahmad/home/ahmad/xennic
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d postgres redis rabbitmq
corepack pnpm --filter @xennic/api dev
```

در terminal دیگر:

```bash
cd /media/ahmad/home/ahmad/xennic
corepack pnpm --filter @xennic/web dev
```

فقط وقتی نیاز داشتید:

- برای محاسبات Python، `engineering-service` را روشن کنید.
- برای AI، `qdrant` و `ai-service` را روشن کنید.
- برای OCR/Vision، `vision-service` را روشن کنید.

---

## 9. نکته درباره هنگ سیستم

سرویس‌های زیر سنگین هستند و نباید همیشه هم‌زمان روشن باشند:

- `vision-service`
- `ai-service`
- `qdrant`
- `engineering-service`

اگر سیستم کند یا هنگ شد:

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml stop engineering-service ai-service vision-service
docker compose -f workspace/docker-compose.yml stop qdrant
```

<!-- /XENNIC_LOCAL_RUNTIME_GUIDE -->

---

🔒 Xennic Security Hardening — SEC-001
تاریخ: 2026-06-15
وضعیت: آماده اجرا

📁 ساختار فایل‌ها
text

security/
├── README.md ← این فایل
├── .env.example ← متغیرهای محیطی نمونه
│
├── apps/
│ └── api/
│ ├── src/
│ │ ├── main.ts ← SEC-001A: CORS Hardening
│ │ ├── common/
│ │ │ ├── guards/
│ │ │ │ ├── throttler.guard.ts ← SEC-001C: Rate Limiting
│ │ │ │ ├── auth-throttler.guard.ts ← SEC-001C: Auth Rate Limiting
│ │ │ │ ├── rate-limit.decorator.ts ← SEC-001C: Rate Limit Decorators
│ │ │ │ └── super-admin.guard.ts ← SEC-001D: Super Admin Guard
│ │ │ ├── decorators/
│ │ │ │ └── super-admin-only.decorator.ts ← SEC-001D: Decorator
│ │ │ └── interceptors/
│ │ │ └── hard-delete-audit.interceptor.ts ← SEC-001D: Audit
│ │ └── modules/
│ │ └── admin/
│ │ └── infrastructure/
│ │ └── guards/
│ │ ├── admin.guard.ts ← SEC-001B: اصلاح شده
│ │ └── admin.guard.spec.ts ← SEC-001B: تست
│ └── test/
│ └── cors-security.spec.ts ← SEC-001A: تست CORS
│
└── workspace/
└── services/
└── engineering-service/
└── src/
└── main.py ← SEC-001A: Python CORS
🚀 مراحل اجرا
پیش‌نیاز: Backup
Bash

# از پایگاه داده backup بگیرید

pg*dump xennic > backup_pre_security*$(date +%Y%m%d).sql
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
معیار تست
CORS فقط origins مجاز test/cors-security.spec.ts
AdminGuard بدون fallback admin.guard.spec.ts
Rate Limiting فعال pnpm test
Hard Delete فقط SUPER_ADMIN Manual test
Audit Log ثبت می‌شود Manual test
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
