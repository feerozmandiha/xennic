# Xennic Platform — Dependency Graph

> Architecture reference describing all dependency relationships across the platform.

---

## 1. System Dependency Tree (Production)

```
Nginx (:80/:443)
 ├── Next.js (web, :3001) ──────────────┐
 └── NestJS (api, :3000) ───────────────┤
                                        │
                                        ▼
                                   PgBouncer (:6432)
                                        │
                                        ▼
                                   PostgreSQL (:5432)

NestJS (api, :3000)
 ├── Redis (:6379)
 ├── RabbitMQ (:5672)
 ├── MinIO (:9000)
 ├── Engineering Service (:8001)  ──┐
 ├── AI Service (:8002)             ├── PostgreSQL (:5432)
 └── Vision Service (:8003)        ┘
```

### Base Mode

In the base (non-production) compose stack, services expose ports directly without Nginx.

```
PostgreSQL (:5432) ◄── PgBouncer (:6432)
Redis (:6380)
RabbitMQ (:5672 + :15672)
Engineering Service (:8001)
Vision Service (:8003)
AI Service (:8002)
```

### Monitoring Stack

```
Prometheus (:9090)
 ├── Scrapes api:3000/api/v1/metrics
 ├── Scrapes engineering-service:8001/metrics
 ├── Scrapes ai-service:8002/metrics
 ├── Scrapes vision-service:8003/metrics
 ├── Scrapes postgres-exporter:9187
 ├── Scrapes redis-exporter:9121
 ├── Scrapes rabbitmq:15692
 └── Scrapes pgbouncer-exporter:9127

Grafana (:3002)
 └── Data Source → Prometheus

Loki (:3100)
 └── Log aggregation via Promtail
```

### Vector DB

```
Qdrant (:6333 HTTP, :6334 gRPC)
 └── Standalone docker-compose at workspace/docker-compose.yml
 └── Network: xennic-network
```

---

## 2. Module Dependency Tree (Node.js)

```
apps/api (@xennic/api)
 ├── @xennic/database (workspace:*)  → @prisma/client
 ├── @xennic/shared (workspace:*)
 ├── @xennic/types (workspace:*)
 ├── @nestjs/common, @nestjs/core
 ├── @nestjs/config
 ├── @nestjs/platform-fastify
 ├── @fastify/multipart
 ├── @prisma/client
 ├── minio
 ├── nodemailer
 └── zod

apps/web (@xennic/web) — standalone (no internal workspace packages)
 ├── next, react, react-dom
 ├── next-intl, next-themes
 ├── @radix-ui/* (11 packages)
 ├── @tanstack/react-query
 ├── zustand
 ├── @tiptap/* (editor)
 ├── recharts
 ├── @react-pdf/renderer
 ├── jspdf, html-to-image
 ├── katex
 └── tailwindcss, class-variance-authority, clsx, tailwind-merge

packages/database (@xennic/database)
 └── @prisma/client

packages/shared (@xennic/shared) — standalone (zero deps)

packages/types (@xennic/types) — standalone (zero deps)

packages/config (@xennic/config) — standalone (zero deps)
 └── tsconfig.base.json (shared TypeScript config base)

packages/openapi — auto-generated; never edited manually
```

---

## 3. Knowledge Dependency Tree

```
Governance ───────────────────────────────────── (none)
     ↑
Concepts ──── Governance
     ↑
Semantics ──── Governance, Concepts
     ↑
Runtime ────── Governance, Concepts, Semantics
     ↑
Reasoning ──── Runtime, AI Intelligence
     ↑
AI Intelligence ── Governance, Concepts
```

---

## 4. Runtime Dependency Tree

```
┌─────────────────────────────────────────────────────┐
│                    Ingestion                         │
│              OCR / Parser (Vision Service)           │
└──────────┬──────────────────────────────────────────┘
           ▼
┌─────────────────────────────────────────────────────┐
│                   Processing                         │
│   Metadata ── Concept Resolution ── Entity Extraction│
└──────────┬──────────────────────────────────────────┘
           ▼
┌─────────────────────────────────────────────────────┐
│                    Validation                        │
│    Quality Policy ── Source Hierarchy ── Constraints │
└──────────┬──────────────────────────────────────────┘
           ▼
┌─────────────────────────────────────────────────────┐
│                   Publication                        │
│       Qdrant (Vector DB) ── Knowledge Graph          │
└─────────────────────────────────────────────────────┘
```

---

## 5. AI Dependency Tree

```
AI Service (:8002)
 └── Engineering Service (:8001)  (HTTP for engineering calculations)

Vision Service (:8003)
 └── Standalone — depends on LLM providers (Groq, OpenAI)

Reasoning Runtime (within AI Service)
 ├── Confidence Engine
 ├── Evidence Chain
 └── Citation Engine
```

---

## 6. Deployment Dependency Tree

```
All services ──→ PostgreSQL (:5432)
                    ↑ via PgBouncer (:6432) in production

Python services (Engineering, AI, Vision)
 └── Common network: xennic-network

Monitoring stack (Prometheus, Grafana, Loki, Promtail)
 └── Standalone but targets all services via scrape configs

Infrastructure (Redis, RabbitMQ, MinIO)
 └── Standalone; consumed by NestJS API
```

---

## 7. Microservice Communication

| Source | Target | Protocol | Port | Status |
|--------|--------|----------|------|--------|
| NestJS API | Engineering Service | HTTP | 8001 | Active |
| NestJS API | AI Service | HTTP | 8002 | Active |
| NestJS API | Vision Service | HTTP | 8003 | Active |
| AI Service | Engineering Service | HTTP | 8001 | Active |
| NestJS API | Redis | RESP | 6379 | Active |
| NestJS API | RabbitMQ | AMQP | 5672 | Active |
| NestJS API | MinIO | S3 API | 9000 | Active |
| Any → Any | RabbitMQ Event Bus | AMQP | 5672 | Future |
| Any → Any | gRPC | — | — | Future |

---

## 8. Data Flow

```
Document Upload
     │
     ▼
Vision Service ──→ OCR / Image Processing
     │
     ▼
Engineering Service ──→ Parsing & Validation
     │
     ▼
NestJS API ──→ Business Logic & Persistence
     │
     ├──→ PostgreSQL (relational storage)
     └──→ Qdrant (vector embeddings)
```

---

## 9. Knowledge Flow

```
Raw Document
     │
     ▼
Chunking (Engineering Service)
     │
     ▼
Embedding (AI Service / external LLM)
     │
     ▼
Vector DB (Qdrant) ──→ Storage
     │
     ▼
Retrieval (on user query)
     │
     ▼
LLM ──→ Answer Generation
```

---

## 10. Engineering Reasoning Flow

```
User Query
     │
     ▼
Context Building
     │
     ▼
Knowledge Selection
     │
     ▼
Evidence Collection
     │
     ▼
Reasoning
     │
     ├──→ Constraint Checking
     ├──→ Formula Evaluation
     └──→ Conflict Resolution
     │
     ▼
Confidence Calculation
     │
     ▼
Citation
     │
     ▼
Conclusion
```
