# وابستگی‌ها — Dependencies

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

فهرست وابستگی‌های اصلی پلتفرم Xennic.

---

## Scope

Node.js packages, Python packages, infrastructure services.

---

## Node.js (NestJS API)

| پکیج | نسخه | کاربرد |
|------|-------|--------|
| @nestjs/core | ^10 | Framework |
| @nestjs/platform-fastify | ^10 | HTTP adapter |
| @nestjs/swagger | ^8 | OpenAPI |
| @prisma/client | ^5 | ORM |
| ioredis | ^5 | Redis client |
| amqplib | ^0.10 | RabbitMQ |
| class-validator | ^0.14 | Validation |

## Node.js (Next.js Web)

| پکیج | نسخه | کاربرد |
|------|-------|--------|
| next | ^14 | Framework |
| next-intl | ^3 | i18n |
| zustand | ^4 | State management |
| @tanstack/react-query | ^5 | Server state |
| axios | ^1 | HTTP client |

## Python

| پکیج | نسخه | کاربرد |
|------|-------|--------|
| fastapi | ^0.110 | Framework |
| uvicorn | ^0.29 | ASGI server |
| pytesseract | ^0.3 | OCR |
| pillow | ^10 | Image processing |
| sentence-transformers | ^2 | Embeddings |
| qdrant-client | ^1 | Vector DB client |

## Infrastructure

| سرویس | نسخه | کاربرد |
|-------|-------|--------|
| PostgreSQL | 17 | Primary database |
| Redis | 8 | Cache & sessions |
| RabbitMQ | 4 | Message broker |
| Qdrant | 1 | Vector database |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Packages Reference | `architecture/PACKAGES_REFERENCE.md` |
| Developer Guide | `development/DEVELOPER_GUIDE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
