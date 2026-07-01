# Infrastructure — زیرساخت فعلی

**نسخه**: ۱.۰.۰ | **وضعیت**: توسعه محلی

---

## Docker Stack

### Base Stack (infrastructure/docker/compose/base/)
```yaml
services:
  postgres:  # PostgreSQL 17, پورت 5432
  redis:     # Redis 8, پورت 6379
  rabbitmq:  # RabbitMQ 4, پورت 5672
```

### Vector DB (workspace/docker-compose.yml)
```yaml
services:
  qdrant:    # Qdrant, پورت 6333
```

---

## پورت‌ها

| سرویس | پورت | پروتکل |
|-------|------|--------|
| Next.js | ۳۰۰۱ | HTTP |
| NestJS | ۳۰۰۰ | HTTP |
| PostgreSQL | ۵۴۳۲ | TCP |
| Redis | ۶۳۷۹ | TCP |
| RabbitMQ | ۵۶۷۲ | AMQP |
| Qdrant | ۶۳۳۳ | gRPC |
| Vision Service | ۸۰۰۳ | HTTP |
| Engineering Service | ۸۰۰۱ | HTTP |
| AI Service | ۸۰۰۲ | HTTP |

---

## Environment Variables

### Root `.env`
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xennic
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
QDRANT_URL=http://localhost:6333
GROQ_API_KEY=
OPENAI_API_KEY=
```

### Vision Service
```bash
VISION_PORT=8003
OCR_ENGINE_MODE=auto
VISION_LLM_PROVIDER=groq
GROQ_API_KEY=
```

---

## Docker Commands

```bash
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d
docker compose -f workspace/docker-compose.yml up -d
```

> برای معماری کامل زیرساخت هدف (MinIO, Meilisearch, Nginx, Monitoring و ...) به `XENNIC_INFRASTRUCTURE_SPEC_v1.md` مراجعه کنید.
