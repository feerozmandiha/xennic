# متغیرهای محیطی — Environment Variables

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای متغیرهای محیطی برای پلتفرم Xennic.

---

## Scope

All environment variables by service.

---

## Common Variables

| متغیر | توضیح | مثال |
|-------|-------|------|
| NODE_ENV | Environment | production |
| LOG_LEVEL | Logging level | info |
| API_PORT | API port | 3000 |

---

## API Service

| متغیر | توضیح | Required |
|-------|-------|----------|
| DATABASE_URL | PostgreSQL connection | ✓ |
| REDIS_URL | Redis connection | ✓ |
| RABBITMQ_URL | RabbitMQ connection | ✓ |
| JWT_SECRET | JWT signing | ✓ |
| JWT_REFRESH_SECRET | Refresh token | ✓ |
| AWS_ACCESS_KEY | S3 access | For file upload |
| AWS_SECRET_KEY | S3 secret | For file upload |
| S3_BUCKET | Upload bucket | For file upload |
| OPENAI_API_KEY | LLM access | For AI features |
| CORS_ORIGIN | Allowed origins | ✓ |

## Web Service

| متغیر | توضیح | Required |
|-------|-------|----------|
| NEXT_PUBLIC_API_URL | API base URL | ✓ |
| API_INTERNAL_URL | Internal API URL | ✓ |
| NEXTAUTH_SECRET | Auth secret | ✓ |
| NEXTAUTH_URL | Auth URL | ✓ |

## Python Services

| متغیر | توضیح | Required |
|-------|-------|----------|
| DATABASE_URL | PostgreSQL connection | ✓ |
| RABBITMQ_URL | RabbitMQ connection | ✓ |
| QDRANT_URL | Qdrant connection | For AI Service |
| MODEL_PATH | Model path | For AI Service |

## .env Files

| فایل | مکان | مستند شده |
|------|------|-----------|
| .env | Root | ✓ |
| .env.local | apps/web | ✓ |
| .env | Each service dir | ✓ |
| .env | infrastructure/docker | ✓ |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Secrets Management | `security/SECRETS_MANAGEMENT.md` |
| Server Setup | `deployment/SERVER_SETUP.md` |
| Production Checklist | `deployment/PRODUCTION_CHECKLIST.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
