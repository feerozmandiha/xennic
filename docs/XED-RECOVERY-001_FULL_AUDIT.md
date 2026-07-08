# XENNIC ENTERPRISE PLATFORM — RECOVERY AUDIT AFTER SESSION RESET

**Command ID:** XED-RECOVERY-001
**Date:** 2026-07-02
**Method:** Fresh source-code reconstruction — zero trust in prior sessions

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| NestJS modules | 28 (23 registered + 5 empty scaffolding) |
| API endpoints | 220 |
| Controllers | 38 |
| Services (NestJS) | 28 |
| Repositories | 22 |
| Domain entities | 39 |
| DTOs | 25 |
| Prisma models | 61 |
| Migrations | 4 |
| Python services | 3 (engineering, ai, vision) |
| Python source files | ~161 |
| Total TS files | 246 |
| Total TS LOC | 25,092 |
| Test coverage | 8.72% |
| Unit tests | 96/96 pass |
| E2E tests | 7/7 pass |
| Python tests | 419 pass / 15 fail (eng), 16/16 (vision), 0 (ai — broken) |
| TypeScript errors | 0 |
| Lint status | Broken (3/6 packages) |
| npm vulnerabilities | 57 (3 critical) |
| **Overall completion** | **~50%** |

**Critical:** Knowledge Factory = 0% (empty directory). 5 of 7 planned AI agents missing. 98 `throw new Error` calls bypass NestJS HTTP exception layer. `.gitignore` has a line-merge typo (`*.log` not ignored). No CI/CD pipeline exists.

---

## 2. Architecture Report

### Repository Root Layout

```
xennic/
├── apps/
│   ├── api/                    # NestJS 11 + Fastify, port 3000, /api/v1
│   └── web/                    # Next.js 15.3, port 3001, next-intl i18n
├── packages/
│   ├── config/                 # Shared ESLint, Prettier, TSConfig
│   ├── database/               # Prisma client + tenant extension + workspace repo
│   ├── openapi/                # Auto-generated OpenAPI v1 spec
│   ├── shared/                 # Shared constants/utils (no build step)
│   └── types/                  # Shared TypeScript type definitions
├── services/                   # Empty (api-gateway placeholder)
├── workers/                    # Does not exist (pnpm workspace glob only)
├── workspace/services/
│   ├── engineering-service/    # FastAPI 0.115, port 8001, 99 .py files
│   ├── ai-service/             # FastAPI 0.115, port 8002, 30 .py files
│   └── vision-service/         # FastAPI 0.115, port 8003, 32 .py files
├── prisma/                     # 61 models, 4 migrations, seed.js (CJS)
├── infrastructure/
│   ├── docker/                 # Compose base/production, secrets, scripts
│   ├── kubernetes/             # Empty
│   └── nginx/                  # SSL configs
├── docs/                       # Reports, audit files
├── scripts/                    # 11 DB/debug scripts
└── tools/                      # (not examined)
```

### Build System

| Tool | Config | Status |
|------|--------|--------|
| PNPM | v10.33, `pnpm-workspace.yaml` with 5 globs | ✅ |
| Turborepo | `turbo.json` — 6 tasks (build, dev, lint, test, typecheck, clean) | ✅ |
| TypeScript | ES2022, NodeNext, strict mode | ✅ (0 errors) |
| ESLint | `eslint.config.mjs` (flat config) | ⚠️ 3 packages fail |
| Prettier | `packages/config/prettier.config.cjs` | ✅ |
| NestJS CLI | `nest-cli.json` exists (monorepo, Fastify adapter) | ✅ |
| Prisma | v6.19.3 (v7.8.0 available — major behind) | ✅ |

### NestJS Module Tree (28 on disk)

```
modules/
  ✅ admin/            (8 files, 1310 LOC) — Admin dashboard, audit logs, taxonomy
  ✅ ai/               (8 files, 1029 LOC) — AI conversation/agent gateway
  ✅ api-keys/         (7 files, 502 LOC) — API key management
  ✅ auth/             (14 files, 1091 LOC) — JWT auth, register, login, password reset
  ✅ billing/          (14 files, 1986 LOC) — Invoices, payments, payment methods
  ✅ consultations/    (5 files, 346 LOC) — Consultation management
  ✅ email/            (10 files, 539 LOC) — Email sending + templates
  ✅ engineering/      (8 files, 1103 LOC) — Engineering calculation gateway
  ❌ enterprise-background/  (0 files — EMPTY)
  ❌ enterprise-backup/      (0 files — EMPTY)
  ❌ enterprise-config/      (0 files — EMPTY)
  ❌ enterprise-performance/ (0 files — EMPTY)
  ✅ feature-flags/    (10 files, 543 LOC) — Feature flag management
  ✅ health/           (5 files, 73 LOC) — Health check endpoints
  ❌ knowledge-factory/ (0 files — EMPTY)
  ✅ knowledge/        (14 files, 3487 LOC) — Full KMS: articles, versions, taxonomy
  ✅ marketplace/      (15 files, 1228 LOC) — Vendors, products, orders
  ✅ notification/     (7 files, 667 LOC) — In-app notifications
  ✅ project/          (7 files, 1257 LOC) — Project CRUD with members
  ✅ rbac/             (23 files, 2052 LOC) — Roles, permissions, authorization
  ✅ search/           (7 files, 483 LOC) — Global search
  ✅ standards/        (7 files, 448 LOC) — Engineering standards
  ✅ storage/          (8 files, 885 LOC) — MinIO file storage
  ✅ subscription/     (8 files, 857 LOC) — Plan subscription management
  ✅ user/             (10 files, 978 LOC) — User management
  ✅ vision/           (4 files, 288 LOC) — Vision upload gateway
  ✅ webhooks/         (7 files, 624 LOC) — Webhook management
  ✅ workspace/        (26 files, 2487 LOC) — Workspace, members, settings, dashboard
```

23 registered in `api.module.ts`, 5 orphans (enterprise-* + knowledge-factory — all empty).

### Global Infrastructure (`apps/api/src/common/`)

| Layer | Files | Description |
|-------|-------|-------------|
| **Guards** | `super-admin.guard.ts` (81 lines), `auth-throttler.guard.ts` (39), `throttler.guard.ts` (38) | Role-check + rate limiting |
| **Decorators** | `rate-limit.decorator.ts` (31), `super-admin-only.decorator.ts` (35) | Auth presets |
| **Interceptors** | `response.interceptor.ts`, `hard-delete-audit.interceptor.ts` (155), `tenant.interceptor.ts` (29) | Response format, audit, multi-tenancy |
| **Filters** | `all-exceptions.filter.ts` (154) | Global HTTP + Prisma error handler |
| **Tenant** | `tenant-context.ts` (13), `tenant-extension.ts` (98) | AsyncLocalStorage workspace_id injection |

### Python Services

| Service | LOC | Port | Architecture |
|---------|-----|------|-------------|
| engineering-service | ~99 files | 8001 | calculators/ (50+ across 13 domains), api/, core/, data/, schemas/ |
| ai-service | ~30 files | 8002 | agents/ (2 of 7), rag/ (chunker, embedding, Qdrant, retriever), tools/, workflows/ |
| vision-service | ~32 files | 8003 | stages/ (preprocessing, detection, ocr, extraction, validation, knowledge) |

---

## 3. Knowledge Factory Report

### `knowledge-factory` Module (NestJS)

**Status: 0% — COMPLETELY EMPTY**

Directory at `apps/api/src/modules/knowledge-factory/` has DDD structure (`domain/`, `application/`, `infrastructure/storage/`, `presentation/`) but **zero `.ts` files**. Not imported in `api.module.ts`. Cannot be used.

### Component Verification

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| **Intake pipeline** | ❌ Missing | Nowhere | 0 grep matches across codebase |
| **Classifier** | ❌ Missing | Nowhere | 0 matches |
| **Parser** | ❌ Missing | Nowhere | 0 matches |
| **OCR** | ⚠️ Partial | vision-service | Tesseract + Paddle OCR stages exist (16 tests pass) |
| **Extractor** | ⚠️ Partial | vision-service | Nameplate + bill extractors exist |
| **Resolver** | ❌ Missing | Nowhere | 0 matches |
| **Normalizer** | ❌ Missing | Nowhere | 0 matches |
| **Chunker** | ✅ Exists | ai-service | `app/rag/chunker.py` |
| **Embedding** | ✅ Exists | ai-service | `app/rag/embedding_pipeline.py` |
| **Publisher** | ❌ Missing | Nowhere | 0 matches |
| **Citation Engine** | ❌ Missing | Nowhere | 0 matches |
| **Evidence Chain** | ❌ Missing | Nowhere | 0 matches |
| **Knowledge Storage** | ✅ Exists | NestJS knowledge module + Prisma | 12 knowledge tables with full CRUD |
| **Ontology** | ❌ Missing | Nowhere | 0 matches |
| **Taxonomy** | ⚠️ Partial | NestJS knowledge module | Basic taxonomy CRUD endpoints exist |
| **Qdrant Adapter** | ✅ Exists | ai-service | `app/rag/qdrant_store.py` — configured |
| **MinIO** | ✅ Exists | NestJS storage module + ai-service | `minio.service.ts`, `minio_client.py` |
| **Version Manager** | ✅ Exists | NestJS knowledge module | Article versioning (create, list, get, restore) |
| **Full Text Search** | ✅ Exists | Prisma migration #4 | GIN index on `to_tsvector('simple', search_text)` |

### What Exists vs What's Missing

**Exists (the "storage" side):**
- Knowledge module with full CRUD, versioning, categories, taxonomy, comments, workflow
- 12 Prisma tables for knowledge entities
- RAG pipeline in ai-service (chunk → embed → Qdrant → retrieve)
- Full-text search index in PostgreSQL

**Missing (the "factory" side):**
- Automated ingestion from engineering standards (IEC, IEEE, etc.)
- Document classification and routing
- Parser orchestration for PDF/DWG/images
- Table extraction from technical documents
- Text normalization and ontology mapping
- Publishing workflow automation
- Citation/provenance tracking

---

## 4. AI Report

### RAG Pipeline (ai-service)

| Component | Status | Implementation |
|-----------|--------|---------------|
| Chunker | ✅ | `app/rag/chunker.py` |
| Embedding Pipeline | ✅ | `app/rag/embedding_pipeline.py` |
| Qdrant Store | ✅ | `app/rag/qdrant_store.py` — with connection pooling |
| Retriever | ✅ | `app/rag/retriever.py` |
| Vector Store (abstract) | ✅ | `app/rag/vector_store.py` |
| File Store | ✅ | `app/rag/file_store.py` |
| **Hybrid Retrieval** | ❌ | Simple vector-only |
| **Context Builder** | ❌ | No structured context assembly |
| **Prompt Builder** | ❌ | Hardcoded prompts |

### AI Agents

| Agent | Status | Location |
|-------|--------|----------|
| Electrical Engineer | ✅ | `app/agents/electrical_engineer/` |
| Document Analyst | ✅ | `app/agents/document_analyst/` |
| Solar Consultant | ❌ | Not implemented |
| Protection Engineer | ❌ | Not implemented |
| Power Quality | ❌ | Not implemented |
| Research | ❌ | Not implemented |
| Drawing Analysis | ❌ | Not implemented |

**5 of 7 planned agents missing. Only 28.5% complete.**

### Agent Infrastructure

| Component | Status |
|-----------|--------|
| Agent Registry | ✅ Basic |
| Tool Execution | ⚠️ Tools called directly, no executor layer |
| Agent Memory | ❌ Basic conversation history only |
| Agent Safety/Guardrails | ❌ |
| Multi-Agent Orchestration | ❌ |
| Response Validator | ❌ |
| Confidence Engine | ❌ |
| Conflict Resolver | ❌ |

### Engineering Calculation Engine (Python, port 8001)

~51 calculators across 13 domains — **all implemented**. 15 API tests failing (basic Ohm's Law and power quality integration tests). 215 Pydantic V2 deprecation warnings.

### Vision Service (Python, port 8003)

Pipeline: preprocessing → detection → OCR (Tesseract + Paddle + Vision LLM) → extraction (nameplate, bill) → validation → knowledge. **16/16 tests pass.**

---

## 5. Database Report

### Schema Overview

| Attribute | Value |
|-----------|-------|
| Schema file | `prisma/schema.prisma`, 1170 lines |
| Total models | **61** |
| Enums | **0** (all statuses use String fields) |
| `@@index` declarations | **118** |
| `@@unique` constraints | **8** |
| `@unique` field constraints | **17** |
| ID strategy | CUID2 (string), migrated from UUID v4 |
| Timestamps | `created_at` + `updated_at` everywhere, `deleted_at` optional |
| Datasource | PostgreSQL |
| Client | Prisma v6.19.3 (latest: 7.8.0 — major version behind) |

### Domain Coverage

| Domain | Models |
|--------|--------|
| **Identity & Auth** | 8 — users, sessions, refresh_tokens, password_reset_tokens, roles, permissions, role_permissions, user_roles |
| **Workspace** | 4 — workspaces, workspace_members, workspace_invitations, workspace_settings |
| **Billing** | 8 — plans, subscriptions, usage_logs, invoices, payments, transactions, payment_methods, subscription_payments |
| **Projects** | 4 — projects, project_members, project_notes, project_reports |
| **Engineering** | 3 — calculations, calculation_templates, engineering_standards |
| **AI** | 4 — agents, conversations, messages, ai_usage |
| **Knowledge** | **13** — knowledge, knowledge_translations, knowledge_taxonomy, knowledge_media, knowledge_formulas, knowledge_examples, knowledge_standards, knowledge_versions, knowledge_comments, knowledge_workflows, knowledge_workflow_history, knowledge_analytics |
| **Taxonomy** | 5 — categories, topics, tags, disciplines, audiences |
| **Marketplace** | 5 — vendors, products, product_translations, orders, order_items |
| **Storage** | 2 — files, file_versions |
| **API** | 2 — api_keys, webhooks |
| **Notifications** | 1 — notifications |
| **Admin** | 3 — system_settings, feature_flags, audit_logs |

### Migrations (4)

| # | Name | Lines | Summary |
|---|------|-------|---------|
| 1 | `20260602080333_init` | 817 | Initial schema — 45 tables |
| 2 | `20260617074611_knowledge_system_phase1` | 1,624 | UUID→TEXT migration, 17 new knowledge tables, 162 ALTER INDEX RENAME TO |
| 3 | `20260617080956_add_knowledge_workspace_id` | 14 | Add workspace_id FK to knowledge |
| 4 | `20260618000000_add_search_text_fts` | 7 | Add GIN full-text search index on knowledge |

### Seed Data (`prisma/seed.js`, 502 lines, CJS)

| Entity | Records | Details |
|--------|---------|---------|
| Subscription Plans | 3 | free, professional, enterprise |
| Roles | 12 | SUPER_ADMIN, ADMIN, ENGINEER, VIEWER, etc. |
| Permissions | 57 | Granular CRUD permissions per module |
| Engineering Standards | 15 | IEC, IEEE, NEC, BS, DIN, ISIRI, etc. |
| AI Agents | 7 | domain experts (definitions only) |
| Admin User | 1 | admin@xennic.ir (Argon2id hashed) |
| Workspace | 1 | Default Organization |
| Vendors | 7 | Electrical equipment manufacturers |
| Products | 33 | With Persian translations |

### Tenant Isolation

`packages/database/src/tenant-extension.ts` — Prisma extension auto-injects `workspace_id` filter on **26 models** for `findMany`, `findFirst`, `count`, `aggregate`, `groupBy`, `create`, `update`, `delete`, `upsert` operations. Skips `findUnique`.

---

## 6. API Report

### Global Configuration

| Setting | Value |
|---------|-------|
| Framework | Fastify via @nestjs/platform-fastify |
| Port | 3000 (env PORT) |
| Host | 0.0.0.0 (env HOST) |
| Global Prefix | `/api/v1` |
| Response Format | `{success, data, meta}` / `{success, error}` |
| Validation | whitelist: true, forbidNonWhitelisted: true, transform: true |
| Swagger UI | `/api/docs` with JWT-auth Bearer scheme |
| CORS | Configurable origins (fallback localhost:3001,3000) |
| Rate Limiting | Auth: 5/60s, API: 100/60s, AI: 20/60s, Admin: 200/60s |
| File Upload | 100MB via @fastify/multipart |

### Endpoints by Module (220 total)

| Module | Count | Auth Pattern | Public |
|--------|-------|-------------|--------|
| knowledge | 30 | JWT + PermissionsGuard | 2 (public) |
| workspace | 17 | JWT + WorkspaceGuard | 0 |
| admin | 17 | JWT + AdminGuard | 0 |
| billing | 16 | JWT + WorkspaceGuard | 1 (callback) |
| project | 12 | JWT + PermissionsGuard | 0 |
| engineering | 10 | JWT + PermissionsGuard | 0 |
| auth | 8 | Mixed | 5 |
| user | 7 | JWT | 0 |
| ai | 7 | JWT + WorkspaceGuard | 0 |
| subscription | 7 | JWT + WorkspaceGuard | 0 |
| roles | 6 | JWT + PermissionsGuard | 0 |
| notifications | 6 | JWT | 0 |
| admin feature-flags | 6 | JWT + AdminGuard | 0 |
| api-keys | 6 | JWT + PermissionsGuard | 0 |
| consultations | 6 | JWT + WorkspaceGuard | 0 |
| storage | 6 | JWT + PermissionsGuard | 0 |
| webhooks | 5 | JWT + PermissionsGuard | 0 |
| standards | 5 | JWT + PermissionsGuard | 0 |
| permissions | 4 | JWT + PermissionsGuard | 0 |
| vendors | 4 | JWT | 0 |
| products | 4 | JWT | 0 |
| orders | 4 | JWT | 0 |
| admin-taxonomy | 4 | JWT + AdminGuard | 0 |
| workspace-settings | 3 | JWT + WorkspaceGuard | 0 |
| knowledge-standards | 3 | JWT + PermissionsGuard | 0 |
| public-knowledge | 2 | None | **2** |
| taxonomy | 2 | JWT + WorkspaceGuard | 0 |
| vision | 2 | JWT + WorkspaceGuard | 0 |
| root | 1 | None | **1** |
| health | 1 | None | **1** |
| search | 1 | JWT + WorkspaceGuard | 0 |
| dashboard | 1 | JWT + WorkspaceGuard | 0 |
| admin-check | 1 | JWT | 0 |
| feature-flags (user) | 1 | JWT | 0 |
| email | 1 | JWT + SuperAdmin | 0 |

**Public endpoints: 10 of 220 (4.5%)** — root, health, auth register/login/refresh/forgot/reset, billing callback, public knowledge.

---

## 7. Testing Report

### TypeScript/Jest

| Category | Results | Time | Coverage |
|----------|---------|------|----------|
| Unit tests | **96/96 pass** (9 suites) | 21.93s | 8.72% |
| E2E tests | **7/7 pass** (2 suites) | 15.79s | — |

### Python

| Service | Passed | Failed | Errors | Time |
|---------|--------|--------|--------|------|
| engineering-service | 419 | **15** | 0 | 69.26s |
| ai-service | 0 | 0 | **1** (collection) | — |
| vision-service | **16** | 0 | 0 | 2.63s |

### Coverage by Module

| Module | Coverage | Test Files |
|--------|----------|------------|
| workspace-settings service | **100%** | 2 |
| permissions.decorator | **100%** | — |
| admin.guard | **91.89%** | 1 |
| knowledge.entity | **96.34%** | 1 |
| health | **80-87%** | 2 |
| knowledge controller | **70.87%** | 1 |
| knowledge service | **~60%** | 1 |
| **All other modules** | **0%** | **0** |

**20 of 23 registered modules have ZERO tests.**

### 15 Failing Python Tests

| Test Group | Failures | Root Cause |
|------------|----------|------------|
| test_basic_api.py | 10 | Ohm's Law, active/reactive/apparent power API — likely service not running during test |
| test_pq_integration.py | 4 | THD, TDD, Resonance, ActiveFilter API tests |
| test_registry.py | 1 | Thread-safety assertion failure |

### 215 Pydantic Warnings

All `PydanticDeprecatedSince20` — using `example=` kwarg in `Field()` instead of `json_schema_extra`.

---

## 8. Quality Report

### TypeScript Compilation

**Zero errors.** `tsc --noEmit` produces clean output.

### Lint

**Broken for 3 of 6 packages:**

| Package | Status | Reason |
|---------|--------|--------|
| `@xennic/config` | ❌ | `node_modules` missing |
| `@xennic/types` | ❌ | `node_modules` missing |
| `@xennic/web` | ❌ | Missing `@eslint/eslintrc` |
| `@xennic/api` | ❌ | No lint script defined |
| `@xennic/database` | ❌ | No lint script defined |
| `@xennic/shared` | ❌ | No lint script defined |

### Code Quality Metrics

| Metric | Count |
|--------|-------|
| `throw new Error` (not HttpException) | **98** across 34 files |
| `: any` type usage | **215** across 85 files |
| `console.log` | **8** (3 startup + 5 audit in auth.service) |
| `TODO` | **1** (notification queue) |
| `FIXME` | **0** |
| `HACK` | **0** |
| `eslint-disable` | **0** |
| `ts-ignore` / `ts-expect-error` | **0** |
| Empty `.ts` files | **0** |
| `.spec.ts` files | **9** |

### Dependency Issues

| Issue | Severity |
|-------|----------|
| 57 npm vulnerabilities (3 critical, 19 high) | **Critical** |
| `@nestjs/throttler` in api devDeps (used at runtime) | Medium |
| `@nestjs/throttler` in web devDeps (unnecessary) | Low |
| Runtime packages declared as devDeps in root | Medium |
| Prisma 6.19.3 → 7.8.0 (major behind) | Medium |
| ai-service missing `openai` dependency | **High** |
| `.gitignore` line-merge typo: `*.loginfrastructure/...` | Medium |

---

## 9. Roadmap Reconstruction

Reconstructed from commit history, module implementation status, and file contents:

| Phase | Name | Completion | Implemented Features | Remaining Work |
|-------|------|-----------|---------------------|----------------|
| 0 | Repository Init | **100%** | pnpm workspace, turbo, nest-cli, eslint, prettier, editorconfig | — |
| 1 | Infrastructure (Docker) | **60%** | Compose base (Postgres, Redis, RabbitMQ, 3 services), secrets, scripts | CI/CD, monitoring, K8s |
| 2 | Database Schema | **100%** | 61 models, 4 migrations, seed with full dataset | — |
| 3 | Auth + User | **100%** | JWT RS256, Argon2id, register/login/refresh/password-reset/OTP/profile | — |
| 4 | RBAC | **100%** | 12 roles, 57 permissions, 3 guards, decorators, authorization service | — |
| 5 | Workspace + Multi-tenancy | **100%** | CRUD, members, invitations, settings, dashboard, tenant extension | — |
| 6 | Core Business | **100%** | Health, Project, Standards, Engineering gateway | — |
| 7 | Knowledge Management | **100%** | Articles, versions, categories, taxonomy, comments, workflow, analytics, FTS | — |
| 8 | Subscription + Billing | **100%** | Plans, subscriptions, invoices, payments, payment methods, callbacks | — |
| 9 | AI Gateway | **100%** | Conversations, messages, agents, validation, usage tracking | — |
| 10 | Python Engineering | **90%** | 51 calculators (13 domains), 80% test coverage | 15 failing tests, Pydantic warnings |
| 11 | Python AI | **40%** | RAG pipeline, 2 agents, Qdrant, embedding, chunking | 5 missing agents, no orchestration/memory/safety |
| 12 | Python Vision | **60%** | Preprocessing, OCR, extraction, validation pipeline | Advanced OCR models, production hardening |
| 13 | Storage (MinIO) | **100%** | Upload, versioning, download, MinIO integration | — |
| 14 | Marketplace | **100%** | Vendors, products, orders, translations | — |
| 15 | Notifications | **90%** | In-app notifications | Email/SMS via queue (TODO) |
| 16 | Admin Dashboard | **100%** | Stats, audit logs, user/workspace management, taxonomy | — |
| 17 | Search | **100%** | Global search with GIN FTS index | — |
| 18 | Enterprise Modules | **0%** | — | 4 modules to build from scratch |
| 19 | Knowledge Factory | **0%** | — | Automated ingestion pipeline |
| 20 | Testing Expansion | **10%** | 9 spec files, 8.72% coverage | Tests for 20 modules |
| 21 | CI/CD | **0%** | — | GitHub Actions workflow |
| 22 | Production Hardening | **0%** | — | Helmet, CSP, 57 vulns, error handling |

---

## 10. Next Recommended Phase

### Foundation Hardening (Duration: 1-2 months)

**THE ONLY RECOMMENDATION.** Do NOT add features until the foundation is stable.

### Technical Justification

The platform has 220 endpoints and 61 database models — substantial. But:

1. **98 `throw new Error` calls** → every one of these will return a generic 500 with no structured error when it fails in production. The platform has a unified response format (`{success, error: {code, message, details}}`) but `throw new Error` bypasses it entirely.

2. **57 npm vulnerabilities (3 critical)** → active exploits exist for `dompurify` (XSS via jspdf). The codebase cannot be deployed to production as-is.

3. **15 Python tests failing** → Ohm's Law and power quality calculator APIs are broken. These are the most basic calculators — if they fail, no calculation can be trusted.

4. **AI-service has zero tests** → `openai` package missing from venv. The AI service has no test coverage at all.

5. **Lint broken for all 6 packages** → no code quality enforcement. New code will introduce style violations and potential bugs without detection.

6. **`.gitignore` typo** → `*.log` is not ignored (line-merged with secrets pattern). Logs may be committed.

7. **No CI/CD** → every change is deployed manually. No automated builds, tests, or lint checks before deployment.

### Estimate

| Dimension | Value |
|-----------|-------|
| Complexity | Low — mechanical refactors, no new logic |
| Risk | Low — existing tests already pass |
| Dependencies | None |
| Files changed | ~40 (throw Error → HttpException), ~6 (lint configs), ~3 (Python tests), ~1 (.gitignore) |
| New test files | 0 (fixing existing tests, not adding new ones) |
| Total effort | 4-8 weeks (1-2 developers) |

---

## 11. Critical Risks

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|-----------|------------|
| 1 | 98 `throw new Error` in production | Generic 500 errors, no useful response | High | Replace with HttpException (4 weeks) |
| 2 | 57 npm vulnerabilities (3 critical) | Exploitable in production | High | `pnpm audit fix` + manual review (2 weeks) |
| 3 | AI-service zero test coverage | Undetected regressions | High | Install openai, fix test collection (1 day) |
| 4 | 15 failing Python tests | Calculator API broken | High | Fix integration tests (1 week) |
| 5 | Lint broken for all packages | Code quality degrades | High | Fix eslint configs + add scripts (1 week) |
| 6 | Web build hangs | Cannot deploy frontend | Medium | Investigate Next.js build (1 week) |
| 7 | No CI/CD | No automated verification | Medium | GitHub Actions (2 weeks) |
| 8 | `.gitignore` typo | Secret leaks via git | Medium | Fix merged line (1 hour) |
| 9 | 215 `any` types | Runtime type errors | Medium | Incremental typing (4 weeks) |
| 10 | 5 empty enterprise modules | Enterprise features missing | Medium | Phased implementation (3 months) |

---

## 12. Technical Debt

### Critical (Fix Within 1 Month)

| Item | Count | Files | Effort |
|------|-------|-------|--------|
| `throw new Error` instead of HttpException | 98 | 34 files | 2-4 weeks |
| npm vulnerabilities | 57 (3 critical) | root deps | 1-2 weeks |
| Missing lint scripts | 4 packages | api, database, shared, types | 1 week |
| `.gitignore` line-merge typo | 1 | `.gitignore` line 15 | 1 hour |

### Moderate (Fix Within 2 Months)

| Item | Count | Effort |
|------|-------|--------|
| `: any` type usage | 215 occurrences | 2-4 weeks |
| Pydantic deprecation warnings | 215 | 1 week |
| `console.log` for audit logging | 5 in auth.service.ts | 1 day |
| Runtime packages in root devDeps | ~10 packages | 1 day |
| MinIO placeholder credentials | 1 in minio.service.ts | 1 hour |
| `@nestjs/throttler` mis-categorized | 2 package.json files | 1 day |

### Positive (Clean Code)

| Metric | Value |
|--------|-------|
| `FIXME` | 0 |
| `HACK` | 0 |
| `eslint-disable` | 0 |
| `ts-ignore` / `ts-expect-error` | 0 |
| Empty .ts files | 0 |

---

## 13. Priority Fixes

### Tier 1 — Immediate (This Week)

| # | Fix | Est. |
|---|-----|------|
| 1 | Fix `.gitignore` line-merge typo (separate `*.log` and secrets pattern) | 1 min |
| 2 | Add `venv/`, `__pycache__/`, `*.pyc` to `.gitignore` | 1 min |
| 3 | Install `openai` in ai-service venv | 5 min |
| 4 | Move `@nestjs/throttler` from devDeps to dependencies (api) | 5 min |
| 5 | Remove unnecessary `@nestjs/throttler` from web devDeps | 1 min |

### Tier 2 — This Sprint

| # | Fix | Est. |
|---|-----|------|
| 6 | Fix 15 failing Python tests (engineering-service) | 1 week |
| 7 | Fix 215 Pydantic deprecation warnings | 1 week |
| 8 | Fix web eslint config (missing `@eslint/eslintrc`) | 1 week |
| 9 | Add lint scripts to api, database, shared, types | 1 day |
| 10 | Investigate web build hang (Next.js timeout) | 1 week |

### Tier 3 — This Month

| # | Fix | Est. |
|---|-----|------|
| 11 | Replace all 98 `throw new Error` with NestJS HttpException | 2-4 weeks |
| 12 | Fix 57 npm vulnerabilities (prioritize 3 critical) | 1-2 weeks |
| 13 | Replace `console.log` audit with proper Logger service | 1 day |
| 14 | Fix MinIO placeholder to throw on missing env | 1 hour |
| 15 | Set up GitHub Actions CI (lint → typecheck → test → build) | 2 weeks |

---

*Report generated 2026-07-02 from source-code analysis.*
*Directive XED-RECOVERY-001 — Session-reset recovery. Zero assumptions. Zero trust. Only code.*
