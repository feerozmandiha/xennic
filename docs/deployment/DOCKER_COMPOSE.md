# Docker Compose

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای Docker Compose برای استقرار پلتفرم Xennic.

---

## Scope

Development compose, production compose, service topology.

---

## Service Topology

```mermaid
graph TB
    NGINX["Nginx\nReverse Proxy"]
    API["NestJS API\n:3000"]
    WEB["Next.js Web\n:3001"]
    ENG["Engineering Service\n:8001"]
    AI["AI Service\n:8002"]
    PG[("PostgreSQL 17\n:5432")]
    REDIS["Redis 8\n:6379"]
    RABBIT["RabbitMQ 4\n:5672"]
    QDRANT[("Qdrant\n:6333")]
    
    NGINX --> API
    NGINX --> WEB
    API --> PG
    API --> REDIS
    API --> RABBIT
    ENG --> PG
    ENG --> RABBIT
    AI --> QDRANT
    AI --> RABBIT
```

---

## Compose Files

| فایل | مکان | کاربرد |
|------|------|--------|
| Base Infrastructure | `infrastructure/docker/compose/base/docker-compose.yml` | Postgres, Redis, RabbitMQ |
| Qdrant | `workspace/docker-compose.yml` | Vector Database |
| Full Stack | Root-level | All services |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Docker | `deployment/DOCKER.md` |
| Server Setup | `deployment/SERVER_SETUP.md` |
| Infrastructure | `infrastructure/INFRASTRUCTURE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
