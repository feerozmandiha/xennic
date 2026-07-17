# Project Statistics — Baseline v1

**Generated:** 2026-07-17
**Sprint:** R2 — Baseline Snapshot & Development Certification

---

## Code Volume

| Language         | Source LOC | Test LOC | Total LOC    |
| ---------------- | ---------- | -------- | ------------ |
| TypeScript       | 73,584     | 19,181   | 95,637       |
| Python           | 28,294     | —        | 28,294       |
| SQL (migrations) | —          | —        | ~3,000       |
| YAML/JSON config | —          | —        | ~2,000       |
| **Total**        |            |          | **~129,000** |

---

## File Counts

| Type                   | Count      |
| ---------------------- | ---------- |
| TypeScript (.ts)       | 1,001      |
| Python (.py)           | 241        |
| TSX (.tsx)             | 116        |
| HTML (.html)           | 529        |
| Markdown (.md)         | 123        |
| JSON (.json)           | 24         |
| JavaScript (.js/.cjs)  | 10         |
| YAML (.yml)            | ~15        |
| SQL (.sql)             | ~10        |
| **Total source files** | **~2,070** |

---

## Module Structure

### NestJS API Modules — 43

| Category                         | Modules                                                                                                                                                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Core Business** (21)           | admin, api-keys, auth, billing, consultations, feature-flags, health, marketplace, notification, project, rbac, search, standards, storage, subscription, user, vision, webhooks, workspace, engineering, email                                              |
| **AI Platform** (3)              | ai, ai-runtime, ai-provider-management                                                                                                                                                                                                                       |
| **Knowledge Platform** (3)       | knowledge, knowledge-factory, knowledge-intelligence                                                                                                                                                                                                         |
| **Calculation Platform** (1)     | calculation-platform                                                                                                                                                                                                                                         |
| **Enterprise Platform** (8)      | enterprise-api-platform, enterprise-background, enterprise-backup, enterprise-cache, enterprise-config, enterprise-event-architecture, enterprise-messaging, enterprise-observability, enterprise-performance, enterprise-search-federation, enterprise-saga |
| **Enterprise Intelligence** (1)  | enterprise-intelligence (10 sub-modules)                                                                                                                                                                                                                     |
| **Enterprise Orchestration** (1) | enterprise-orchestration (9 sub-modules)                                                                                                                                                                                                                     |
| **Infrastructure** (2)           | email, monitoring                                                                                                                                                                                                                                            |
| **Integration** (1)              | semantic-integration                                                                                                                                                                                                                                         |

### Shared Packages — 5

| Package          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| @xennic/config   | Shared tsconfig, prettier, env            |
| @xennic/database | Prisma client + repositories              |
| @xennic/shared   | Constants, errors, guards, logger, result |
| @xennic/types    | Base entity, tenant context types         |
| @xennic/openapi  | Auto-generated OpenAPI spec               |

### Applications — 2

| App         | Port | Framework              |
| ----------- | ---- | ---------------------- |
| @xennic/api | 3000 | NestJS 11 + Fastify    |
| @xennic/web | 3001 | Next.js 15 + next-intl |

### Python Microservices — 3

| Service             | Port | Framework | LOC     |
| ------------------- | ---- | --------- | ------- |
| engineering-service | 8001 | FastAPI   | ~15,000 |
| ai-service          | 8002 | FastAPI   | ~8,000  |
| vision-service      | 8003 | FastAPI   | ~5,300  |

---

## Database

| Metric             | Count |
| ------------------ | ----- |
| Prisma models      | 132   |
| Migrations         | 6     |
| Tables (estimated) | 132+  |

### Models by Domain

| Domain                   | Models   |
| ------------------------ | -------- |
| Auth/Users               | 6        |
| RBAC                     | 2        |
| Workspace                | 4        |
| Billing                  | 8        |
| Project                  | 4        |
| Engineering              | 3        |
| AI Core                  | 4        |
| Knowledge Base           | 16       |
| Knowledge Analytics      | 3        |
| Knowledge Pipeline       | 2        |
| Marketplace              | 5        |
| Storage                  | 2        |
| System                   | 5        |
| Audit                    | 1        |
| Knowledge Graph          | 9        |
| Event System             | 2        |
| AI Provider Management   | 12       |
| Enterprise Intelligence  | 15       |
| Enterprise Orchestration | 14       |
| Calculation Platform     | 10       |
| **Total**                | **~132** |

---

## API Surface

| Metric                  | Count  |
| ----------------------- | ------ |
| REST endpoints          | 366    |
| Controller declarations | 57     |
| DTOs                    | 51     |
| Guards                  | 8      |
| Middleware              | 1      |
| Interceptors            | 4      |
| Strategies              | 14     |
| OpenAPI spec size       | 276 KB |

---

## Domain-Driven Design

| Artifact                      | Count                |
| ----------------------------- | -------------------- |
| Entities (.entity.ts)         | 90                   |
| Services (.service.ts)        | 192                  |
| Controllers (.controller.ts)  | 59                   |
| Repositories (.repository.ts) | 153                  |
| Value Objects                 | embedded in entities |
| Domain Events                 | 12                   |

---

## Background Processing

| Type                  | Count |
| --------------------- | ----- |
| BullMQ workers        | 7     |
| BullMQ queues         | 8     |
| Outbox relay services | 1     |
| Scheduled tasks       | 1     |
| Total background jobs | 9     |

### BullMQ Queues (Knowledge Factory Pipeline)

1. INTAKE
2. CLASSIFY
3. PARSE
4. NORMALIZE
5. CHUNK
6. EMBED
7. PUBLISH
8. DEAD_LETTER

---

## Enterprise Platform Breakdown

### Enterprise Intelligence (I1) — 10 sub-modules

| Sub-Module          | Files   | Tests   |
| ------------------- | ------- | ------- |
| context-engine      | 13      | 29      |
| memory-platform     | 12      | 28      |
| prompt-governance   | 18      | 37      |
| tool-registry       | 11      | 35      |
| skill-registry      | 11      | 24      |
| reasoning-engine    | 15      | 26      |
| policy-engine       | 10      | 22      |
| ai-gateway          | 16      | 15      |
| evaluation-platform | 13      | 21      |
| sdk                 | 11      | —       |
| **Total**           | **135** | **237** |

### Enterprise Orchestration (O1) — 9 sub-modules

| Sub-Module           | Purpose                          |
| -------------------- | -------------------------------- |
| workflow-engine      | Workflow definition + validation |
| workflow-runtime     | Execution + lifecycle + retry    |
| planning-engine      | Task graph + planner             |
| human-in-the-loop    | Approval + review                |
| multi-agent          | Coordinator + reviewer           |
| conversation-runtime | History + conversation           |
| execution-context    | Context variables + artifacts    |
| cost-management      | Cost analysis + tracking         |
| explainability       | Confidence + decision logging    |

### Enterprise Platform (E1) — 8 modules

| Module                        | Purpose                      |
| ----------------------------- | ---------------------------- |
| enterprise-api-platform       | API management               |
| enterprise-background         | Background job orchestration |
| enterprise-backup             | Backup management            |
| enterprise-cache              | Cache invalidation           |
| enterprise-config             | Configuration management     |
| enterprise-event-architecture | Event-driven architecture    |
| enterprise-messaging          | RabbitMQ messaging           |
| enterprise-observability      | OTel + Prometheus + logging  |
| enterprise-performance        | Performance monitoring       |
| enterprise-search-federation  | Search federation            |
| enterprise-saga               | Saga orchestration           |

---

## Knowledge Platform

### Knowledge Base — 16 DB models, DDD structure

### Knowledge Factory — 7-stage pipeline, 7 workers, 4 DB models

### Knowledge Intelligence — 9 DB models, graph + ontology + citations

---

## Calculation Platform

| Metric             | Count                            |
| ------------------ | -------------------------------- |
| DB models          | 11                               |
| Controllers        | 7                                |
| Electrical plugins | 52+                              |
| Unit definitions   | 75 (seeded)                      |
| Formula types      | IEEE, IEC, custom                |
| Certificates       | Calculation certification system |

---

## Test Coverage

| Category             | Count     | LOC        |
| -------------------- | --------- | ---------- |
| Unit test files      | 82        | ~15,000    |
| E2E test files       | 7         | ~4,200     |
| **Total test files** | **89**    | **19,181** |
| **Total test cases** | **1,538** | —          |

### Test Results (Baseline)

| Suite      | Tests     | Pass Rate |
| ---------- | --------- | --------- |
| Unit tests | 1,401     | 100%      |
| E2E tests  | 137       | 100%      |
| **Total**  | **1,538** | **100%**  |

---

## Infrastructure

| Component         | Technology              | Status           |
| ----------------- | ----------------------- | ---------------- |
| Database          | PostgreSQL 17           | ✅               |
| Cache             | Redis 8                 | ✅               |
| Message Broker    | RabbitMQ 4              | ✅               |
| Vector DB         | Qdrant                  | ✅               |
| Monitoring        | Prometheus/Grafana/Loki | ⏸ Deferred       |
| Container Runtime | Docker 29.6             | ✅               |
| Orchestration     | Docker Compose v5       | ✅               |
| CI/CD             | GitHub Actions          | ✅ (3 workflows) |

---

## Repository

| Metric                 | Value              |
| ---------------------- | ------------------ |
| Git commits            | 51                 |
| Contributors           | 1                  |
| Repository size (.git) | 960 MB             |
| Disk usage (workspace) | ~3.5 GB            |
| Documentation files    | 123                |
| Scripts                | 14                 |
| CI workflows           | 3                  |
| Architecture rules     | 87 (11 YAML files) |
