# Scripts Reference — راهنمای اسکریپت‌ها

**آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## دیتابیس

| اسکریپت | توضیح |
|---------|--------|
| `scripts/db-apply.sh` | اعمال Prisma schema + seed |
| `scripts/db-migrate-dev.sh` | اجرای migration توسعه |
| `scripts/db-setup.sh` | راه‌اندازی دیتابیس |
| `scripts/db-fix-constraints.sh` | رفع محدودیت‌های دیتابیس |

## Debug

| اسکریپت | توضیح |
|---------|--------|
| `scripts/debug-403.sh` | دیباگ خطای ۴۰۳ |
| `scripts/debug-project.sh` | دیباگ پروژه‌ها |

## Python

| اسکریپت | توضیح |
|---------|--------|
| `scripts/make-admin.py` | تبدیل کاربر به ادمین |
| `scripts/mock-api.py` | شبیه‌سازی پاسخ‌های API |
| `scripts/test-engineering.py` | تست endpoints مهندسی |

## Test

| اسکریپت | توضیح |
|---------|--------|
| `scripts/setup-test-deps.sh` | نصب وابستگی‌های تست |
| `scripts/test-full.sh` | اجرای کامل تست‌ها |
| `TEST_COMMANDS.sh` | دستورات تست در ریشه |

## Docker

| اسکریپت | توضیح |
|---------|--------|
| `infrastructure/docker/scripts/up.sh` | راه‌اندازی Docker stack |
| `infrastructure/docker/scripts/down.sh` | توقف Docker stack |
| `infrastructure/docker/scripts/reset.sh` | بازنشانی Docker stack |

## Vision Service

| اسکریپت | توضیح |
|---------|--------|
| `workspace/services/vision-service/scripts/setup.sh` | راه‌اندازی سرویس |
| `workspace/services/vision-service/scripts/test.sh` | تست سرویس |
