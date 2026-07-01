# [نام سرویس] — قالب مستندات سرویس

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **آخرین بروزرسانی**: [تاریخ]

---

## Purpose

هدف این سرویس چیست؟

---

## Scope

دامنه: مسئولیت‌ها, مرزها, وابستگی‌ها.

---

## Architecture

```mermaid
graph TB
    [نمودار معماری سرویس]
```

---

## API

| Method | Path | توضیح |
|--------|------|-------|
| GET | /health | Health check |
| [POST/GET/...] | /api/v1/... | [توضیح] |

## Dependencies

| سرویس/دیتابیس | نوع ارتباط | توضیح |
|---------------|-----------|-------|
| [PostgreSQL] | Database | [توضیح] |
| [RabbitMQ] | Message Queue | [توضیح] |

## Configuration

| متغیر محیطی | Required | توضیح |
|-------------|----------|-------|
| [VAR_NAME] | Yes/No | [توضیح] |

---

## Related Documents

| سند | مسیر |
|-----|------|
| System Architecture | `architecture/SYSTEM_ARCHITECTURE.md` |
| [سند مرتبط] | [مسیر] |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | [تاریخ] | انتشار اولیه |
