# Xennic Project State Audit

**Date:** 2026-07-02
**Scope:** Full repository audit — architecture, API, database, knowledge platform, AI, security, testing, build, technical debt
**Method:** Direct source-code analysis (no assumptions from prior reports or this session's prior work)

---

## Executive Summary

Xennic is a multi-tenant B2B electrical engineering platform under active development. The codebase follows a **DDD-layered monorepo** architecture with 28 NestJS modules (23 registered, 5 empty), **61 Prisma database models**, and 3 Python microservices. The core platform (auth, RBAC, workspace, billing, projects, knowledge storage) is largely complete. However:

- **5 enterprise modules** and the **knowledge-factory** are empty scaffolding
- **RAG/vector retrieval** exists in ai-service (chunker, embedding, Qdrant, retriever) but lacks orchestration
- **AI agents**: 2 of 7 are implemented (Electrical Engineer, Document Analyst)
- **Lint is broken**: 4 of 6 packages have no lint script; 3 packages fail lint
- **98 raw `throw new Error`** in repositories bypass NestJS exception handling
- **15 Python tests failing** in engineering-service; **ai-service tests completely broken** (missing `openai`)
- **57 npm vulnerabilities** (3 critical)

| Dimension         | Score    | Status                                                        |
| ----------------- | -------- | ------------------------------------------------------------- |
| API Maturity      | 82%      | 38 controllers, 220 endpoints, guards, DTOs, validation       |
| Database Maturity | 90%      | 61 models, 4 migrations, seed, workspace isolation            |
| Security          | 75%      | JWT/Argon2/RBAC; 98 throw Error bypass filter; no CSP         |
| Knowledge Storage | 100%     | 12 Prisma tables, full CRUD + versions + workflow             |
| Knowledge Factory | 0%       | Empty DDD directory, no code                                  |
| RAG Engine        | 35%      | Chunker + Embedding + Qdrant + Retriever exist                |
| Enterprise AI     | 40%      | Thin NestJS gateway + Python ai-service (2/7 agents)          |
| Testing           | 10%      | 96 unit/7 e2e pass; 15 Python fail; AI tests broken           |
| Build             | 30%      | tsc clean; lint broken; web build timeout                     |
| CI/CD             | 0%       | No `.github/`, no pre-commit, no commitlint wired             |
| **Overall**       | **~50%** | **Core complete; knowledge-factory/AI/enterprise unfinished** |

---

## 1. Architecture

### 1.1 Monorepo Structure

```
xennic/
├── apps/
│   ├── api/              # NestJS 11 + Fastify, port 3000, /api/v1
│   └── web/              # Next.js 15, port 3001, i18n
├── packages/
│   ├── config/           # Shared ESLint, Prettier, TSConfig
│   ├── database/         # Prisma client + tenant extension
│   ├── shared/           # Shared constants/utils
│   ├── types/            # Shared TS types
│   └── openapi/          # Auto-generated OpenAPI spec
├── prisma/               # Schema + 4 migrations + seed
├── workspace/services/
│   ├── engineering-service/  # FastAPI, port 8001
│   ├── ai-service/           # FastAPI, port 8002
│   └── vision-service/       # FastAPI, port 8003
├── infrastructure/
│   ├── docker/           # Compose (base, production) + .env + secrets
│   ├── kubernetes/       # K8s manifests
│   └── nginx/            # Nginx configs
├── docs/
│   ├── audits/           # THIS REPORT
│   ├── TEST_GUIDE.md
│   ├── STATUS_REPORT.md
│   └── knowledge/        # Empty directory for EE knowledge
└── scripts/              # DB setup/migration/debug scripts
```

### 1.2 Build System

| Tool       | Config                                              | Status             |
| ---------- | --------------------------------------------------- | ------------------ |
| Turborepo  | `turbo.json` — 6 packages, dependsOn build pipeline | ✅                 |
| PNPM       | `pnpm-workspace.yaml` — 5 workspace globs           | ✅                 |
| TypeScript | ES2022, NodeNext, strict across packages            | ✅                 |
| ESLint     | `eslint.config.mjs` (flat config)                   | ⚠️ 3 packages fail |
| Prettier   | `packages/config/prettier.config.cjs`               | ✅                 |

### 1.3 Module Registration

| Status                        | Count | Modules                                                                                                                                                                                                                        |
| ----------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Registered in `api.module.ts` | 23    | health, workspace, user, auth, rbac, project, engineering, subscription, storage, notification, ai, consultations, billing, admin, search, knowledge, standards, marketplace, api-keys, webhooks, email, feature-flags, vision |
| Exist on disk, NOT registered | 5     | enterprise-background, enterprise-backup, enterprise-config, enterprise-performance, knowledge-factory                                                                                                                         |
| Total on disk                 | 28    |                                                                                                                                                                                                                                |

### 1.4 DDD Compliance

Most registered modules follow: `domain/` → entities, repositories; `application/` → services, DTOs; `infrastructure/` → repository implementations; `presentation/` → controllers.

Empty modules (5) have planned DDD folder structure but zero `.ts` files.

---

## 2. API Inventory

**220 total endpoints** across 38 controllers (23 registered modules).

### Global Configuration

- **Framework:** Fastify (NestJS 11) on port 3000
- **Prefix:** `/api/v1`
- **Swagger:** `/api/docs` with JWT Bearer auth
- **Response format:** `{success, data, meta}` / `{success, error}`
- **Validation:** `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **Rate limits:** Auth 5/60s, API 100/60s, AI 20/60s, Admin 200/60s

### Endpoints by Module

| Module        | Endpoints | Auth           | Notes                                                                                             |
| ------------- | --------- | -------------- | ------------------------------------------------------------------------------------------------- |
| Public        | 10        | None           | root, health, register, login, refresh, forgot/reset password, billing callback, public knowledge |
| Auth          | 7         | JWT            | logout, me, change-password                                                                       |
| User          | 7         | JWT+Perm       | CRUD + soft/hard delete                                                                           |
| RBAC          | 10        | JWT+Perm       | roles + permissions CRUD, role-permission mapping                                                 |
| Workspace     | 17        | JWT            | CRUD, settings, members, invitations, dashboard                                                   |
| Project       | 12        | JWT+Perm       | CRUD, members, notes, restore                                                                     |
| Engineering   | 10        | JWT+Perm       | calculations CRUD, catalog, health, energy                                                        |
| Knowledge     | 30        | JWT+Perm       | CRUD, taxonomy, standards, versions, comments, workflow, analytics                                |
| Billing       | 16        | JWT            | invoices, payments, transactions, methods, subscription payments                                  |
| Admin         | 17        | JWT+SuperAdmin | dashboard, users, workspaces, plans, consultations, articles, audit log                           |
| AI            | 7         | JWT+Rate       | agents, conversations, messages, validate                                                         |
| Search        | 1         | JWT+WS         | global search                                                                                     |
| Subscription  | 7         | JWT+WS         | CRUD + cancel + upgrade                                                                           |
| Notifications | 6         | JWT            | CRUD + read-all                                                                                   |
| API Keys      | 6         | JWT+Perm       | CRUD                                                                                              |
| Webhooks      | 5         | JWT+Perm       | CRUD                                                                                              |
| Feature Flags | 7         | JWT/Admin      | CRUD + toggle                                                                                     |
| Consultations | 6         | JWT+WS         | CRUD                                                                                              |
| Storage       | 6         | JWT+Perm       | upload, download, delete                                                                          |
| Standards     | 5         | JWT+Perm       | CRUD                                                                                              |
| Vendors       | 4         | JWT            | CRUD                                                                                              |
| Products      | 6         | JWT            | CRUD                                                                                              |
| Orders        | 4         | JWT            | CRUD                                                                                              |
| Vision        | 2         | JWT+WS         | upload, detect                                                                                    |
| Email         | 1         | JWT+SuperAdmin | send                                                                                              |
| Taxonomy      | 2         | JWT+WS         | categories, topics                                                                                |

### Shared Infrastructure

| Component                                          | Status                                    |
| -------------------------------------------------- | ----------------------------------------- |
| Response interceptor `{success, data, meta}`       | ✅                                        |
| Validation pipe (whitelist + forbidNonWhitelisted) | ✅                                        |
| AllExceptionsFilter                                | ✅ (but bypassed by 98 `throw new Error`) |
| Pagination DTO                                     | ✅                                        |
| Swagger docs at `/api/docs`                        | ✅                                        |
| OpenAPI spec auto-generated                        | ✅                                        |

---

## 3. Database

### 3.1 Schema (1,170 lines, Prisma 6.19.3)

| Domain        | Count  | Models                                                                                                                                                                                                                                            |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity/Auth | 8      | users, sessions, refresh_tokens, password_reset_tokens, roles, permissions, role_permissions, user_roles                                                                                                                                          |
| Workspace     | 4      | workspaces, workspace_members, workspace_invitations, workspace_settings                                                                                                                                                                          |
| Billing       | 8      | plans, subscriptions, usage_logs, invoices, payments, transactions, payment_methods, subscription_payments                                                                                                                                        |
| Projects      | 4      | projects, project_members, project_notes, project_reports                                                                                                                                                                                         |
| Engineering   | 3      | calculations, calculation_templates, engineering_standards                                                                                                                                                                                        |
| AI            | 4      | agents, conversations, messages, ai_usage                                                                                                                                                                                                         |
| Knowledge     | 13     | knowledge, knowledge_translations, knowledge_taxonomy, knowledge_media, knowledge_formulas, knowledge_examples, knowledge_standards, knowledge_versions, knowledge_comments, knowledge_workflows, knowledge_workflow_history, knowledge_analytics |
| Taxonomy      | 5      | categories, topics, tags, disciplines, audiences                                                                                                                                                                                                  |
| Marketplace   | 5      | vendors, products, product_translations, orders, order_items                                                                                                                                                                                      |
| Storage       | 2      | files, file_versions                                                                                                                                                                                                                              |
| API           | 2      | api_keys, webhooks                                                                                                                                                                                                                                |
| Notifications | 1      | notifications                                                                                                                                                                                                                                     |
| Admin         | 3      | system_settings, feature_flags, audit_logs                                                                                                                                                                                                        |
| **TOTAL**     | **61** |                                                                                                                                                                                                                                                   |

### 3.2 Migrations

| Migration                                   | Lines | Content                                  |
| ------------------------------------------- | ----- | ---------------------------------------- |
| `20260602080333_init`                       | 817   | 45 initial tables                        |
| `20260617074611_knowledge_system_phase1`    | 1,624 | UUID→TEXT migration, 17 knowledge tables |
| `20260617080956_add_knowledge_workspace_id` | 14    | workspace_id FK on knowledge             |
| `20260618000000_add_search_text_fts`        | 7     | GIN full-text search index               |

### 3.3 Seed Data (502 lines CJS, `require`)

| Entity                | Count                              |
| --------------------- | ---------------------------------- |
| Plans                 | 3 (free, professional, enterprise) |
| Roles                 | 12                                 |
| Permissions           | 57                                 |
| Engineering Standards | 15                                 |
| AI Agents             | 7 (only 2 implemented in code)     |
| Admin User            | 1                                  |
| Default Workspace     | 1                                  |
| Vendors               | 7                                  |
| Products              | 33                                 |
| Product Translations  | 33                                 |

### 3.4 Prisma Client

`packages/database/` provides extended client with:

- Tenant middleware (`tenant-extension.ts`) — auto-injects `workspace_id` on 26 models
- `TenantService` via CLS (`ClsService`)
- Repository base classes for multi-tenant access

---

## 4. Knowledge Platform

### 4.1 Knowledge Module (`modules/knowledge/`) — ✅ COMPLETE

14 files, 3,487 LOC. Full lifecycle with:

- CRUD + search (7 endpoints)
- Taxonomy management (3 endpoints)
- Standards linking (3 endpoints)
- Versioning (3 endpoints)
- Comments (4 endpoints)
- Workflow + approval (4 endpoints)
- Analytics (3 endpoints)
- 12 dedicated Prisma tables

### 4.2 Knowledge Factory (`modules/knowledge-factory/`) — ❌ EMPTY

DDD folder structure exists. Zero `.ts` files. Not registered in `api.module.ts`.

**What's missing:**

- Document intake pipeline (crawl, classify, parse)
- OCR integration for EE documents
- Parser orchestration (PDF, DWG, DOCX, images)
- Table extraction and normalization
- Ontology mapping
- Automated chunking + embedding publishing
- Citation tracking and provenance chains

**Estimated effort:** 3-6 months for production-grade implementation.

---

## 5. Enterprise AI

### 5.1 NestJS AI Gateway (`modules/ai/`) — ✅ COMPLETE

8 files, 1,029 LOC. Thin gateway with:

- Conversation CRUD (4 endpoints)
- Message management (2 endpoints)
- Agent listing (2 endpoints)
- Calculation validation (1 endpoint)
- Usage tracking
- Rate limiting (20/60s)
- All logic delegated to Python `ai-service`

### 5.2 Python `ai-service` (port 8002) — ⚠️ ~40%

| Component                 | Status                                    |
| ------------------------- | ----------------------------------------- |
| **RAG Infrastructure**    | ✅ 60%                                    |
| Chunker                   | ✅ `app/rag/chunker.py`                   |
| Embedding Pipeline        | ✅ `app/rag/embedding_pipeline.py`        |
| Qdrant Store              | ✅ `app/rag/qdrant_store.py`              |
| Retriever                 | ✅ `app/rag/retriever.py`                 |
| File Store                | ✅ `app/rag/file_store.py`                |
| **AI Agents**             | ⚠️ 2/7                                    |
| Electrical Engineer       | ✅ Implemented                            |
| Document Analyst          | ✅ Implemented                            |
| Solar Consultant          | ❌                                        |
| Protection Engineer       | ❌                                        |
| Power Quality             | ❌                                        |
| Research                  | ❌                                        |
| Drawing Analysis          | ❌                                        |
| **Agent Infrastructure**  | ❌ Mostly missing                         |
| Agent Registry            | ✅ Basic                                  |
| LangGraph Workflows       | ✅                                        |
| Tool execution            | ⚠️ Direct calls, no executor              |
| Memory/Context            | ❌ Basic conversation history only        |
| Safety/Guardrails         | ❌                                        |
| Multi-Agent Orchestration | ❌                                        |
| Response Validator        | ❌                                        |
| Confidence Engine         | ❌                                        |
| Conflict Resolver         | ❌                                        |
| **Tests**                 | ❌ Broken (`ModuleNotFoundError: openai`) |

### 5.3 Python `vision-service` (port 8003) — ✅ 60%

Pipeline: preprocessing → detection → OCR (3 engines: Tesseract, Paddle, doctr) → extraction → validation.
16/16 tests pass.

### 5.4 Python `engineering-service` (port 8001) — ✅ 90%

~51 calculators across 13 domains. 419 tests pass, **15 fail**.

---

## 6. Security

### 6.1 Authentication

| Component                            | Status |
| ------------------------------------ | ------ |
| JWT (RS256, public/private key pair) | ✅     |
| Password hashing (Argon2id)          | ✅     |
| OTP verification (password reset)    | ✅     |
| Rotating refresh tokens              | ✅     |
| Server-side session tracking         | ✅     |

### 6.2 Authorization Guards

| Guard            | Status |
| ---------------- | ------ |
| JwtAuthGuard     | ✅     |
| PermissionsGuard | ✅     |
| WorkspaceGuard   | ✅     |
| SuperAdminGuard  | ✅     |

### 6.3 Rate Limiting

| Guard                | Rate                                       |
| -------------------- | ------------------------------------------ |
| AuthThrottlerGuard   | Login 5/60s, Register 3/60s, Forgot 3/300s |
| XennicThrottlerGuard | 100/60s default                            |
| AiRateLimit          | 20/60s                                     |
| AdminRateLimit       | 200/60s                                    |

### 6.4 Issues

| Issue                                        | Severity    | Details                                     |
| -------------------------------------------- | ----------- | ------------------------------------------- |
| 98 `throw new Error` bypass exception filter | 🔴 Critical | Every repo method returns raw 500           |
| MinIO placeholder credentials in source      | 🟡 Low      | `storage.minio.service.ts:33`               |
| No CSP/Helmet headers                        | 🟡 Medium   | Fastify not configured                      |
| `.gitignore` line-merge typo at line 15      | 🟡 Medium   | `*.log` not ignored; secrets pattern broken |

---

## 7. Testing

### 7.1 TypeScript Tests

| Suite                    | Files                   | Result                       |
| ------------------------ | ----------------------- | ---------------------------- |
| API unit (jest, ts-jest) | 9 `.spec.ts`            | ✅ **96/96 pass**            |
| API e2e (jest)           | 2 `.e2e-spec.ts` + CORS | ✅ **7/7 pass**              |
| Coverage                 | —                       | **8.72% statements**         |
| Test modules covered     | 3 of 23                 | health, knowledge, workspace |

### 7.2 Python Tests

| Service             | Tests | Result                           |
| ------------------- | ----- | -------------------------------- |
| engineering-service | 434   | ⚠️ 419 pass, **15 fail**         |
| ai-service          | ~15   | ❌ **BROKEN** (`openai` missing) |
| vision-service      | 16    | ✅ **All pass**                  |

### 7.3 Test Infrastructure

| Component                                      | Status                       |
| ---------------------------------------------- | ---------------------------- |
| Jest config (ts-jest)                          | ✅                           |
| Jest E2E config (`test/jest-e2e.json`)         | ✅                           |
| Test tsconfig (`tsconfig.test.json`, commonjs) | ✅                           |
| Python pytest-cov (80% target)                 | ⚠️ Configured, some failures |

---

## 8. Build & Deployment

### 8.1 Build Results

| Command              | Result                  |
| -------------------- | ----------------------- |
| `tsc --noEmit` (api) | ✅ Clean (zero errors)  |
| `prisma generate`    | ✅ (v6.19.3)            |
| `pnpm build`         | ⚠️ Web timeout (>5 min) |
| `pnpm lint`          | ❌ 3 packages fail      |
| `next build` (web)   | ❌ Timeout              |

### 8.2 Lint Status

| Package            | Script       | Status               |
| ------------------ | ------------ | -------------------- |
| `@xennic/api`      | ❌ None      | Error in turbo graph |
| `@xennic/web`      | `next lint`  | ✅                   |
| `@xennic/config`   | `eslint src` | ✅                   |
| `@xennic/database` | ❌ None      | Error in turbo graph |
| `@xennic/shared`   | ❌ None      | Error in turbo graph |
| `@xennic/types`    | ❌ None      | Error in turbo graph |

### 8.3 Docker

| Environment | File                                                    | Status                                                 |
| ----------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Base (dev)  | `infrastructure/docker/compose/base/docker-compose.yml` | ✅ Postgres 17, Redis 8, RabbitMQ 4, 3 Python services |
| Production  | `infrastructure/docker/compose/production/`             | Exists                                                 |
| Vector DB   | `workspace/docker-compose.yml`                          | ✅ Qdrant                                              |

### 8.4 CI/CD

| Component        | Status                   |
| ---------------- | ------------------------ |
| GitHub Actions   | ❌ No `.github/`         |
| Pre-commit hooks | ❌                       |
| lint-staged      | ❌ Not wired             |
| commitlint       | ❌ In devDeps, not wired |

---

## 9. Technical Debt

### 9.1 Critical

| Issue                                 | Count/Location                             | Risk                       |
| ------------------------------------- | ------------------------------------------ | -------------------------- |
| `throw new Error` not HttpException   | 98 across 34 files                         | Generic 500s in production |
| npm vulnerabilities                   | 57 (3 critical)                            | Security exploits          |
| No lint on 4 packages                 | api, database, shared, types               | Quality unenforced         |
| `.gitignore` typo line 15             | `*.loginfrastructure/docker/secrets/*.key` | Secrets/logs leak risk     |
| `openai` missing from ai-service venv | 1 package                                  | Zero AI tests              |
| 15 Python test failures               | engineering-service                        | Calculator API broken      |

### 9.2 Moderate

| Issue                                     | Count               |
| ----------------------------------------- | ------------------- |
| `:any` type usage                         | 215 in 85 files     |
| Pydantic V2 deprecation warnings          | 215                 |
| `console.log` for audit logging           | 5 (auth.service.ts) |
| Runtime deps in devDeps                   | ~10 packages        |
| `@nestjs/throttler` in production devDeps | api + web           |

### 9.3 Clean Code

| Metric                      | Count                  |
| --------------------------- | ---------------------- |
| FIXME                       | 0                      |
| HACK                        | 0                      |
| eslint-disable              | 0                      |
| ts-ignore / ts-expect-error | 0                      |
| TODO                        | 1 (notification queue) |

---

## 10. Empty / Planned Structure

### Empty Modules (5)

| Module                 | Path                              | Files |
| ---------------------- | --------------------------------- | ----- |
| knowledge-factory      | `modules/knowledge-factory/`      | 0     |
| enterprise-background  | `modules/enterprise-background/`  | 0     |
| enterprise-backup      | `modules/enterprise-backup/`      | 0     |
| enterprise-config      | `modules/enterprise-config/`      | 0     |
| enterprise-performance | `modules/enterprise-performance/` | 0     |

### Stale vs Current

| Aspect                | Old Report (replaced)   | Actual (this session)                                   |
| --------------------- | ----------------------- | ------------------------------------------------------- |
| Prisma models         | 50                      | **61**                                                  |
| Migrations            | 4 (202503\*)            | **4 (202606\*)**                                        |
| API endpoints         | ~counted differently    | **220**                                                 |
| AI agents implemented | 7 (claimed)             | **2** (Electrical Engineer + Document Analyst)          |
| RAG                   | "Not implemented"       | **Implemented** (chunker, embedding, Qdrant, retriever) |
| Vision OCR            | "Not implemented"       | **Implemented** (3 engines: Tesseract, Paddle, doctr)   |
| Python test failures  | "All pass (claimed)"    | **15 fail + AI broken**                                 |
| Test coverage         | "12 TS tests (claimed)" | **96 unit / 7 e2e**                                     |
| Lint status           | Claimed OK for 2        | **3 of 6 packages fail**                                |
| npm vulns             | Not reported            | **57 (3 critical)**                                     |

---

## 11. Engineering Service (Python)

### 11.1 Implementation: ~90%

~51 calculators across 13 domains (ohms law, power, cable sizing, short-circuit, power factor, transformer, lighting, earthing, motor, resonance, THD, APF, sag/swell). 15 test failures indicate API-level issues with specific calculator endpoints.

### 11.2 Pydantic V2 Warnings

215 deprecation warnings from Pydantic V2 schema definitions. Non-blocking but noisy.

---

## 12. Recommended Next Phase

### Phase A: Foundation Hardening (8 weeks) — DO NOT SKIP

| Priority | Task                                                | Effort    |
| -------- | --------------------------------------------------- | --------- |
| P0       | Fix `.gitignore` line-merge typo                    | 1 hour    |
| P0       | Install `openai` in ai-service venv                 | 1 day     |
| P0       | Fix 15 Python test failures                         | 1-2 weeks |
| P1       | Add lint scripts to all 6 packages; fix lint errors | 1-2 weeks |
| P1       | Fix web build timeout                               | 1-2 weeks |
| P2       | Replace 98 `throw new Error` with HttpException     | 2-4 weeks |
| P2       | Fix 57 npm vulnerabilities                          | 1-2 weeks |
| P3       | Set up GitHub Actions CI                            | 1-2 weeks |

### Phase B: Testing (2-3 months)

- Add tests for all 23 modules
- Reach 80% coverage

### Phase C: AI Platform (2-3 months)

- Build remaining 5 agents
- Full multi-agent orchestration
- Memory, safety, executor infrastructure

### Phase D: Knowledge Factory (3-6 months)

- Intake pipeline, parser orchestration, chunking, embedding
- Automated publishing with citation tracking

### Phase E: Enterprise Modules (2-3 months)

- config, background, backup, performance

---

_Report generated 2026-07-02 from source-code analysis. Every finding verified against files on disk._
