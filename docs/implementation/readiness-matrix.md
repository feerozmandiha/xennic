# Platform Readiness Matrix

**Generated:** 2026-07-02
**Source:** All audit documents in `docs/audit/`
**Scoring:** 0-100 per dimension, averaged across subsystems

---

## Scoring Methodology

| Dimension      | Definition                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Doc Ready**  | API docs (Swagger), README, inline documentation, ADRs exist                                                     |
| **Arch Ready** | DDD structure, clean interfaces, dependency injection, module isolation                                          |
| **Impl Ready** | Feature-complete implementation, working endpoints, error handling                                               |
| **Prod Ready** | Graceful shutdown, retry, timeout, transactions, idempotency, health checks, env validation, caching, monitoring |

**Average Score** = (Doc + Arch + Impl + Prod) / 4

---

## Core Infrastructure

| Subsystem           | Doc Ready | Arch Ready | Impl Ready | Prod Ready | Avg Score | Notes                                                                                                                             |
| ------------------- | :-------: | :--------: | :--------: | :--------: | :-------: | --------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**            |    85     |     80     |     70     |     55     |  **73**   | JWT + RS256 + Argon2 + refresh rotation good; no MFA, no account lockout, no transaction on login                                 |
| **User Management** |    70     |     65     |     50     |     30     |  **54**   | CRUD works; **NO guards on controller** (CRITICAL: any unauthenticated user can manage users); no tests                           |
| **Workspace**       |    80     |     75     |     65     |     45     |  **66**   | Good multi-tenant isolation; missing cascade on delete, no ownership check on hardDelete, duplicate check scans 100 rows          |
| **RBAC**            |    75     |     80     |     70     |     40     |  **66**   | Role/permission system solid; PermissionsGuard fail-open (returns true on error), \_getMemberRole fallback grants `*` (all perms) |
| **Project**         |    60     |     65     |     60     |     35     |  **55**   | CRUD works; no tests, manual UPSERT (2 round-trips), manual cascade DELETE                                                        |
| **Health**          |    70     |     50     |     60     |     25     |  **51**   | Endpoints exist; no DB/Redis/Qdrant probe, no readiness/liveness, `@nestjs/terminus` not used                                     |

## AI Subsystems

| Subsystem                    | Doc Ready | Arch Ready | Impl Ready | Prod Ready | Avg Score | Notes                                                                                                                                                            |
| ---------------------------- | :-------: | :--------: | :--------: | :--------: | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI (NestJS Gateway)**      |    60     |     55     |     55     |     25     |  **49**   | Conversation CRUD works; mock fallback on LLM failure (silent data corruption), fake streaming, no RAG context injection, prompt injection vulnerability         |
| **AI Runtime**               |    70     |     75     |     60     |     15     |  **55**   | Best architected NestJS module (pipeline + middleware + stores); but ALL stores are in-memory (OOM risk), pipeline echoes input, controller has workspaceId typo |
| **AI Agents (Python)**       |    40     |     50     |     20     |     5      |  **29**   | BaseAgent abstract class + registry good; **Electrical Engineer never calls LLM** (hardcoded responses), 5 of 7 agents missing, fake streaming                   |
| **RAG Pipeline**             |    45     |     55     |     30     |     5      |  **34**   | Chunker + retriever + vector store exist; **dummy embeddings (identical random vectors)**, no hybrid search, no re-ranking, file store loads all into RAM        |
| **Knowledge Module**         |    75     |     65     |     70     |     40     |  **63**   | Full CRUD + versioning + taxonomy + workflow; **no sync to RAG pipeline**, 801-line service (SRP violation), huge content loaded in list views                   |
| **Knowledge Factory**        |    10     |     5      |     0      |     0      |   **4**   | **Empty module** — DDD directory structure with zero .ts files; foundational automated ingestion pipeline missing entirely                                       |
| **LLM Provider**             |    50     |     40     |     35     |     15     |  **35**   | OpenAI-compatible HTTP client exists; mock fallback dangerous, fake streaming, no ILlmProvider interface, static system prompt                                   |
| **Prompt Engine**            |    60     |     70     |     60     |     20     |  **53**   | Registry + template engine + validation built; in-memory only, no conditional sections, no loops, pipeline never sends to LLM                                    |
| **Memory**                   |    50     |     55     |     40     |     10     |  **39**   | CRUD operations defined for message/summary/fact/preference; in-memory only, no consolidation, no decay, no persistence                                          |
| **Tool System**              |    55     |     65     |     45     |     20     |  **46**   | NestJS tool registry + dispatcher + validator well-designed; Python tools are **dead code** (never called), no timeout, no rate limiting                         |
| **Streaming**                |    45     |     40     |     20     |     5      |  **28**   | SSE endpoint exists; **fake word-by-word simulation** (not real streaming), no backpressure, client disconnect leaks handlers                                    |
| **Citation / Evidence**      |    15     |     10     |     5      |     0      |   **8**   | Source model exists in outputs.py but **never populated**; no citation engine, no provenance tracking, no claim-source mapping                                   |
| **Hallucination Prevention** |    20     |     15     |     10     |     0      |  **11**   | No source grounding, no "I don't know" detection, no response validation against sources, no confidence scoring beyond LLM self-report                           |
| **Conflict Resolution**      |    10     |     10     |     0      |     0      |   **5**   | **Not implemented** — no detection of conflicting sources, no temporal/authority-based resolution                                                                |
| **Agent Orchestration**      |    25     |     35     |     15     |     5      |  **20**   | Agent registry singleton exists; no multi-agent orchestration, no task planning, no permission enforcement (REQUIRED_PERMISSION defined but unused)              |
| **Knowledge-RAG Sync**       |    20     |     15     |     5      |     0      |  **10**   | **No bridge** between NestJS Knowledge module and Python RAG pipeline; no event-driven sync on CRUD                                                              |

## Business Modules

| Subsystem         | Doc Ready | Arch Ready | Impl Ready | Prod Ready | Avg Score | Notes                                                                                                                                                          |
| ----------------- | :-------: | :--------: | :--------: | :--------: | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Billing**       |    65     |     60     |     65     |     25     |  **54**   | Gateways for Zarinpal + payment flows work; no Prisma transactions (data inconsistency risk), no retry on gateway calls, `throw new Error()` not HttpException |
| **Subscription**  |    70     |     65     |     65     |     40     |  **60**   | Plan management + usage tracking works; missing cascade on workspace delete, `getActivePlanSlug` hits DB on every calculation (no cache)                       |
| **Storage**       |    70     |     65     |     70     |     35     |  **60**   | MinIO integration + file upload with MIME validation + checksum; MinIO + DB save not in transaction (orphaned files), no timeout on MinIO ops                  |
| **Notification**  |    55     |     50     |     45     |     30     |  **45**   | In-app notifications work; email/SMS not implemented (TODO comment), fire-and-forget with no queue                                                             |
| **Webhooks**      |    65     |     60     |     65     |     25     |  **54**   | HMAC signing + delivery; **SSRF vulnerability** (no IP blocklist), no retry on failure, fire-and-forget delivery                                               |
| **Email**         |    60     |     55     |     55     |     35     |  **51**   | Nodemailer + template management; no retry, no queue, direct `process.env` reads                                                                               |
| **Feature Flags** |    60     |     55     |     55     |     35     |  **51**   | CRUD + plan-based gating; `enabled` boolean inconsistent with `is_*` naming convention, no tests                                                               |
| **Search**        |    55     |     55     |     55     |     30     |  **49**   | Global search across entities; basic implementation, no tests                                                                                                  |
| **Standards**     |    60     |     55     |     55     |     30     |  **50**   | Engineering standards CRUD; basic implementation, no tests                                                                                                     |
| **API Keys**      |    60     |     55     |     55     |     30     |  **50**   | Key management CRUD; no `updatedAt`, no tests                                                                                                                  |

## Domain-Specific Modules

| Subsystem                | Doc Ready | Arch Ready | Impl Ready | Prod Ready | Avg Score | Notes                                                                                                                |
| ------------------------ | :-------: | :--------: | :--------: | :--------: | :-------: | -------------------------------------------------------------------------------------------------------------------- |
| **Engineering (NestJS)** |    65     |     60     |     65     |     35     |  **56**   | Gateway to Python engineering-service; timer leak in health check, no retry, no circuit breaker, no transaction      |
| **Engineering (Python)** |    55     |     65     |     75     |     40     |  **59**   | 50+ calculators implemented; 15 tests failing, CORS `["*"]` in production, registry singleton with class-level state |
| **Vision (NestJS)**      |    55     |     50     |     60     |     30     |  **49**   | Gateway to Python vision-service; timer leak, no retry, no transaction                                               |
| **Vision (Python)**      |    50     |     60     |     65     |     35     |  **53**   | Pipeline architecture with OCR + extraction; CORS `["*"]`, 16/16 tests passing                                       |
| **Consultations**        |    50     |     45     |     50     |     25     |  **43**   | CRUD works; **missing workspace isolation** on findOne/aiReply/updateStatus, no guards, no tests                     |
| **Marketplace**          |    55     |     55     |     55     |     30     |  **49**   | Products/vendors/orders CRUD; no guards on controllers, no tests, 357-line repository                                |

## Admin & Enterprise

| Subsystem                  | Doc Ready | Arch Ready | Impl Ready | Prod Ready | Avg Score | Notes                                                                                                                                                 |
| -------------------------- | :-------: | :--------: | :--------: | :--------: | :-------: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin**                  |    55     |     50     |     55     |     25     |  **46**   | Dashboard + audit tools; 583-line service (SRP violation), `catch { return { success: true } }` swallows errors, prisma directly in application layer |
| **Enterprise Background**  |     5     |     5      |     0      |     0      |   **3**   | **Empty module** — DDD directory with zero .ts files                                                                                                  |
| **Enterprise Backup**      |     5     |     5      |     0      |     0      |   **3**   | **Empty module** — DDD directory with zero .ts files                                                                                                  |
| **Enterprise Config**      |     5     |     5      |     0      |     0      |   **3**   | **Empty module** — DDD directory with zero .ts files                                                                                                  |
| **Enterprise Performance** |     5     |     5      |     0      |     0      |   **3**   | **Empty module** — DDD directory with zero .ts files                                                                                                  |

## Infrastructure & Platform

| Subsystem                           | Doc Ready | Arch Ready | Impl Ready | Prod Ready | Avg Score | Notes                                                                                                                                 |
| ----------------------------------- | :-------: | :--------: | :--------: | :--------: | :-------: | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Database (Prisma Schema)**        |    70     |     80     |     85     |     50     |  **71**   | 61 models, indexes, workspace isolation; missing cascade on 20+ relations, UUIDs as TEXT, 49+ strings should be enums                 |
| **Database (Migrations)**           |    60     |     65     |     70     |     40     |  **59**   | 4 migrations executed; no rollback script, no zero-downtime strategy                                                                  |
| **Redis**                           |    30     |     20     |     5      |     0      |  **14**   | Redis in docker-compose; **zero integration** — no caching, no rate-limit backing, no session store (all in-memory)                   |
| **RabbitMQ**                        |    30     |     20     |     5      |     0      |  **14**   | RabbitMQ in docker-compose; **zero integration** — no event publishing, no queue consumers, no async processing                       |
| **Qdrant**                          |    40     |     50     |     50     |     20     |  **40**   | Connected with async client; `wait=True` on bulk upserts, `collection_exists` on every search, no index configuration                 |
| **MinIO**                           |    55     |     55     |     65     |     35     |  **53**   | File storage with upload/download; credentials hardcoded in .env, no connection pool, `MoEarning` placeholder                         |
| **OpenAPI / Swagger**               |    75     |     65     |     70     |     35     |  **61**   | 220 endpoints documented; regenerated on every build (slow), health module not in Swagger tags                                        |
| **Monorepo Build**                  |    60     |     70     |     65     |     40     |  **59**   | Turborepo + pnpm workspaces; lint broken for 4/6 packages, web build hangs, `@nestjs/throttler` in wrong deps                         |
| **Docker**                          |    55     |     60     |     60     |     35     |  **53**   | Base compose stack defined; production compose needs health checks + resource limits, .dockerignore missing                           |
| **Kubernetes**                      |    20     |     15     |     0      |     0      |   **9**   | **Empty directory** — no manifests for any service                                                                                    |
| **CI/CD**                           |    15     |     10     |     0      |     0      |   **6**   | **No `.github/`** — no pipeline, no automated testing, every deploy is manual                                                         |
| **Error Tracking (Sentry)**         |    10     |     5      |     0      |     0      |   **4**   | **Not integrated** — no Sentry SDK in any service                                                                                     |
| **Monitoring (Prometheus/Grafana)** |    10     |     5      |     0      |     0      |   **4**   | **Not integrated** — no metrics endpoint, no dashboards                                                                               |
| **Logging**                         |    40     |     35     |     30     |     20     |  **31**   | NestJS Logger used in some services; **54 `console.log` calls** remain, no structured JSON logging, no log aggregation                |
| **Graceful Shutdown**               |    15     |     10     |     10     |     5      |  **10**   | **Not implemented** — no `enableShutdownHooks()`, no `SIGTERM` handlers, no `OnModuleDestroy`                                         |
| **Configuration / Env**             |    30     |     25     |     20     |     15     |  **23**   | `@nestjs/config` installed but **never initialized**; all services read `process.env` directly, no Joi validation, .env.example stale |
| **Testing**                         |    30     |     25     |     15     |     10     |  **20**   | 96 unit + 7 e2e tests pass; **8.72% coverage**, 21 of 27 modules have zero tests, 15 Python tests fail, ai-service tests broken       |
| **API Gateway**                     |    10     |     10     |     0      |     0      |   **5**   | **Empty placeholder** — `services/api-gateway/` directory exists with zero files                                                      |
| **Workers**                         |     5     |     5      |     0      |     0      |   **3**   | Referenced in pnpm-workspace.yaml but **directory does not exist**                                                                    |

## Frontend

| Subsystem          | Doc Ready | Arch Ready | Impl Ready | Prod Ready | Avg Score | Notes                                                                                                                                     |
| ------------------ | :-------: | :--------: | :--------: | :--------: | :-------: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Web (Next.js)**  |    40     |     45     |     40     |     15     |  **35**   | next-intl i18n, API proxy rewrites configured; **build hangs** (cannot produce artifact), **zero tests**, no frontend test infrastructure |
| **Web Components** |    30     |     35     |     35     |     10     |  **28**   | UI components exist (presumed); no component tests, no storybook, no visual regression testing                                            |

## DevOps

| Subsystem                       | Doc Ready | Arch Ready | Impl Ready | Prod Ready | Avg Score | Notes                                                                                                                     |
| ------------------------------- | :-------: | :--------: | :--------: | :--------: | :-------: | ------------------------------------------------------------------------------------------------------------------------- |
| **DevOps (General)**            |    20     |     20     |     10     |     5      |  **14**   | No CI/CD, no K8s, no monitoring, no structured logging, no error tracking                                                 |
| **Security (Secrets)**          |    40     |     25     |     15     |     10     |  **23**   | **CRITICAL:** JWT private key + GROQ_API_KEY + .env files committed to git, encryption master key hardcoded               |
| **Security (Guards)**           |    50     |     45     |     40     |     25     |  **40**   | UserController unguarded (CRITICAL), consultations missing workspace isolation, PermissionsGuard fail-open                |
| **Security (Headers)**          |    25     |     20     |     10     |     5      |  **15**   | **No Helmet middleware** — missing all security headers (CSP, HSTS, X-Frame-Options, etc.)                                |
| **Security (Input Validation)** |    60     |     55     |     50     |     35     |  **50**   | Global ValidationPipe with whitelist; prompt injection vulnerability, SSRF via webhooks, file extension whitelist missing |
| **Documentation**               |    35     |     30     |     25     |     20     |  **28**   | Audit docs comprehensive; no ADRs, no CONTRIBUTING.md, no LICENSE.md, README.md is security doc                           |
| **Git Hygiene**                 |    25     |     20     |     15     |     10     |  **18**   | .gitignore line-merge typo, venv not gitignored (1700 .pyc), .env files tracked, no .nvmrc                                |

---

## Score Distribution Summary

|     Score Range     | Count | Subsystems                                                                                                                                                                                                                                               |
| :-----------------: | :---: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0-25** (Critical) |  16   | Knowledge Factory, Enterprise modules (4), Redis integration, RabbitMQ integration, Kubernetes, CI/CD, Sentry, Monitoring, Graceful Shutdown, API Gateway, Workers, Citation/Evidence, Conflict Resolution, Hallucination Prevention, Knowledge-RAG Sync |
|  **26-50** (Poor)   |  15   | AI Gateway, AI Agents, RAG Pipeline, LLM Provider, Memory, Tool System, Streaming, Agent Orchestration, Engineering (Python), Vision (Python), Consultation, Admin, Marketplace, Configuration, Security Guards                                          |
|  **51-75** (Fair)   |  14   | Auth, User, Workspace, RBAC, Project, Knowledge Module, AI Runtime, Prompt Engine, Billing, Subscription, Storage, Webhooks, Email, Database                                                                                                             |
|  **76-100** (Good)  |   0   | None — highest score is Database at 71                                                                                                                                                                                                                   |

## Top 5 Readiness Blockers

| #   | Subsystem                 | Avg Score | Critical Issue                                                 |
| --- | ------------------------- | :-------: | -------------------------------------------------------------- |
| 1   | **Worker Infrastructure** |   **3**   | Referenced in pnpm-workspace.yaml but directory does not exist |
| 2   | **Knowledge Factory**     |   **4**   | Empty module — core automated ingestion missing                |
| 3   | **4 Enterprise Modules**  |   **3**   | Empty scaffolding — enterprise features nonexistent            |
| 4   | **CI/CD**                 |   **6**   | No `.github/` — every deploy is manual risk                    |
| 5   | **Kubernetes**            |   **9**   | Empty manifests directory — no deployment topology             |

## Overall Platform Score

| Metric                          |     Value      |
| ------------------------------- | :------------: |
| Total Subsystems Scored         |       56       |
| Average Score (All)             | **34.6 / 100** |
| Average Score (NestJS Modules)  | **52.1 / 100** |
| Average Score (AI Subsystems)   | **30.5 / 100** |
| Average Score (Infrastructure)  | **20.7 / 100** |
| Average Score (Python Services) | **56.3 / 100** |

**Verdict:** Platform is **not production-ready** (Score: 34.6/100). Immediate focus on the 16 subsystems scoring 0-25 (Critical), especially AI infrastructure, infrastructure/platform, and empty modules.
