# Xennic Platform — Comprehensive Refactoring Roadmap

> **Generated:** 2026-07-02  
> **Source audits:** security, production-readiness, ai-audit, code-quality, technical-debt, test-gap-analysis, test-report, database-audit, api-audit, module-audit  
> **Total estimated duration:** 28 weeks (~7 months)  
> **Total estimated effort:** 1,200+ engineering hours

---

## Table of Contents

1. [Executive Summary of Required Changes](#1-executive-summary-of-required-changes)
2. [Phase 0 — Stop the Bleeding (Weeks 1-2)](#2-phase-0--stop-the-bleeding-weeks-1-2)
3. [Phase 1 — Foundation (Weeks 3-5)](#3-phase-1--foundation-weeks-3-5)
4. [Phase 2 — Security Hardening (Weeks 6-8)](#4-phase-2--security-hardening-weeks-6-8)
5. [Phase 3 — Data Layer (Weeks 9-11)](#5-phase-3--data-layer-weeks-9-11)
6. [Phase 4 — Quality (Weeks 12-14)](#6-phase-4--quality-weeks-12-14)
7. [Phase 5 — AI Quality (Weeks 15-17)](#7-phase-5--ai-quality-weeks-15-17)
8. [Phase 6 — Testing (Weeks 18-22)](#8-phase-6--testing-weeks-18-22)
9. [Phase 7 — DevOps (Weeks 23-25)](#9-phase-7--devops-weeks-23-25)
10. [Phase 8 — Polish (Weeks 26-28)](#10-phase-8--polish-weeks-26-28)

---

## 1. Executive Summary of Required Changes

The Xennic platform audit reveals a codebase with **strong architectural foundations** (DDD folder structure, NestJS DI, Prisma ORM, multi-tenancy design) undermined by **critical security, production-readiness, and code quality gaps**.

### What must be fixed (by severity)

| Severity | Count | Key Themes |
|----------|-------|------------|
| 🔴 Critical Security | 7 | Committed JWT keys, unguarded UserController, SSRF via webhooks, hard-delete endpoints public, encryption key in `.env`, no Helmet, prompt injection |
| 🔴 Critical Production | 10 | No graceful shutdown, no env validation, unbounded in-memory stores, no Prisma transactions, no idempotency, mock fallback on AI failure, secrets committed, DB errors silently swallowed, timer leaks, no readiness/liveness probes |
| 🔴 Critical AI | 5 | Agent never calls LLM, pipeline echoes input, dummy embeddings identical, typo in controller, duplicate method |
| 🔴 Critical Code Quality | 6 | Prisma in application layer, 95 bare catch blocks, 54 `console.log`, 6 classes >300 lines, 50+ `as any`, CORS wildcard in Python |
| 💰 Technical Debt | 48 items (8 P0, 14 P1, 18 P2, 8 P3) | Cascade deletes, missing indexes, string enums, UUID as TEXT, no CI/CD |
| 🧪 Test Coverage | 8.72% | 21 of 27 API modules untested, 15 failing Python tests, no frontend tests |

### Overarching goals

1. **Make the system secure** — remove committed secrets, add guards, fix SSRF, add Helmet
2. **Make the system reliable** — graceful shutdown, env validation, transactions, idempotency, health checks
3. **Make the AI actually work** — connect agents to LLMs, fix embeddings, implement real streaming
4. **Make the code maintainable** — extract pagination, fix catch blocks, split large classes, add proper types
5. **Build confidence through tests** — from 8.72% to 60%+ coverage
6. **Operationalize** — CI/CD, monitoring, Kubernetes, centralized logging

---

## 2. Phase 0 — Stop the Bleeding (Weeks 1-2)

> **Goal:** Eliminate immediate security vulnerabilities and critical correctness bugs that could cause a breach or data loss today.

| Attribute | Value |
|-----------|-------|
| **Sprint** | S0 |
| **Duration** | 2 weeks |
| **Dependencies** | None |
| **Risk** | 🔴 **Critical** — any delay extends active security holes |
| **Total items** | 10 |
| **Estimated hours** | 40h |

### Items

| # | Priority | Item | Location | Effort | Risk |
|---|----------|------|----------|--------|------|
| P0-01 | 🔴 P0 | Remove committed JWT private key from git, rotate all keys, add to `.gitignore` | `infrastructure/docker/secrets/jwtRS256.key`, `.env` files | 2h | 🔴 Rotating keys breaks existing sessions — coordinate rollout |
| P0-02 | 🔴 P0 | Add `@UseGuards(JwtAuthGuard, AdminGuard)` to all UserController endpoints | `user.controller.ts:92-181` | 1h | 🟢 None |
| P0-03 | 🔴 P0 | Add `@fastify/helmet` middleware to main.ts | `apps/api/src/main.ts` | 1h | 🟢 None |
| P0-04 | 🔴 P0 | Fix Agent: replace hardcoded if/else in `_generateResponse()` with actual LLM call via ModelRouter | `ai-service/agents/electrical_engineer/agent.py:44-139` | 4h | 🟡 Changes response behavior |
| P0-05 | 🔴 P0 | Fix duplicate `analyze_document()` — remove first definition (lines 77-172) | `ai-service/agents/document_analyst/agent.py:77-172` | 30m | 🟡 Ensure second version handles all callers |
| P0-06 | 🔴 P0 | Fix NestJS controller typo: `req.workspaceId` → `req.workspaceId` | `ai-runtime.controller.ts:54` | 10m | 🟢 None |
| P0-07 | 🔴 P0 | Add workspace isolation to ConsultationsController endpoints | `consultations.controller.ts:42,78,86` | 1h | 🟢 None |
| P0-08 | 🟠 P1 | Fix PermissionsGuard fail-open: `catch → return false` (deny on unexpected errors) | `permissions.guard.ts:73-74` | 30m | 🟡 May break existing callers relying on fail-open |
| P0-09 | 🟠 P1 | Add `@UseGuards(JwtAuthGuard, WorkspaceGuard)` to hard-delete endpoints | `workspace.controller.ts:153-155` | 30m | 🟢 None |
| P0-10 | 🟠 P1 | Fix SSRF: add IP validation blocklist to webhook URL delivery | `webhook.service.ts:133,152-160` | 2h | 🟢 None |

### Acceptance criteria

- [ ] All committed `.env` files removed from git history (BFG Repo-Cleaner or `git filter-repo`)
- [ ] All production secrets rotated (GROQ_API_KEY, JWT keys, DB passwords)
- [ ] Unauthenticated requests to any UserController endpoint return 401
- [ ] Security headers present on all API responses (X-Content-Type-Options, CSP, HSTS, etc.)
- [ ] Electrical Engineer Agent sends actual LLM requests (visible in logs)
- [ ] Duplicate method removed — no runtime override
- [ ] Consultations endpoints check `workspaceId` before returning data
- [ ] Webhook URL validation blocks private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x)

---

## 3. Phase 1 — Foundation (Weeks 3-5)

> **Goal:** Make the API production-ready with proper shutdown, configuration validation, data consistency, and observability.

| Attribute | Value |
|-----------|-------|
| **Sprint** | S1 |
| **Duration** | 3 weeks |
| **Dependencies** | Phase 0 (secrets removed before env validation) |
| **Risk** | 🟠 **High** — changing shutdown behavior and transaction patterns affects all modules |
| **Total items** | 12 |
| **Estimated hours** | 120h |

### Priority items

| # | Priority | Item | Location | Effort | Risk |
|---|----------|------|----------|--------|------|
| P1-01 | 🔴 P0 | Add graceful shutdown: `app.enableShutdownHooks()`, SIGTERM/SIGINT handlers, `OnModuleDestroy` for Prisma/MinIO/Redis | `apps/api/src/main.ts`, all modules | 4h | 🟡 Must test drain logic |
| P1-02 | 🔴 P0 | Add `@nestjs/config` with `ConfigModule.forRoot()` and Joi validation schema for all env vars | `api.module.ts`, create `config.schema.ts` | 6h | 🟡 All `process.env` refs must migrate |
| P1-03 | 🔴 P0 | Fix unbounded in-memory stores: replace with Redis-backed or bounded TTL-cache stores | `ai-runtime/infrastructure/stores/*.ts` | 12h | 🟡 Redis becomes a hard dependency |
| P1-04 | 🔴 P0 | Add Prisma `$transaction` wrapping on all multi-step write operations (auth login, workspace create, storage upload, billing payment) | All services | 16h | 🟠 Affects every write path |
| P1-05 | 🔴 P0 | Add idempotency middleware: check `Idempotency-Key` header, store in Redis with TTL | New middleware + all POST endpoints | 8h | 🟡 New required header for clients |
| P1-06 | 🔴 P0 | Replace LlmProvider mock fallback: throw `ServiceUnavailableException` instead of returning mock data in production | `llm.provider.ts:121` | 2h | 🟡 Client must handle 503 |
| P1-07 | 🔴 P0 | Add readiness/liveness health checks with DB, Redis, MinIO, Qdrant probes | `health/` module, `@nestjs/terminus` | 6h | 🟢 None |
| P1-08 | 🟠 P1 | Fix timer leaks: replace manual `AbortController` + `setTimeout` with `AbortSignal.timeout()` | `engineering-client.service.ts`, `vision-client.service.ts` | 2h | 🟢 None |
| P1-09 | 🟠 P1 | Fix silent DB error swallowing: replace `catch { return null; }` with proper error logging and propagation | `ai.repository.ts` all methods | 4h | 🟡 May surface latent errors |
| P1-10 | 🟠 P1 | Replace `all-exceptions.filter.ts:67` `console.error` with Logger | `all-exceptions.filter.ts` | 1h | 🟢 None |
| P1-11 | 🟠 P1 | Add `OnModuleDestroy` hooks to PrismaService, MinioService, Redis connections | All infrastructure modules | 4h | 🟢 None |
| P1-12 | 🟡 P2 | Create centralized `config/` module with typed ConfigService wrappers for all env vars | New `shared/config/` | 8h | 🟢 None |

### Acceptance criteria

- [ ] `CTRL+C` or `SIGTERM` drains in-flight requests and closes all connections cleanly
- [ ] Missing env vars cause startup failure with descriptive error message
- [ ] All write operations in auth, workspace, storage, billing use Prisma `$transaction`
- [ ] POST endpoints return 409 on duplicate `Idempotency-Key` within TTL window
- [ ] LLM provider throws 503 when API key is missing — no silent mock data
- [ ] `/health/readiness` returns 200 only when DB, Redis, MinIO all responsive
- [ ] `/health/liveness` returns 200 when process is alive
- [ ] No timer leaks in engineering-client or vision-client (verified by test)

---

## 4. Phase 2 — Security Hardening (Weeks 6-8)

> **Goal:** Close all remaining security gaps: secret management, CSRF, CORS, input sanitization, file validation.

| Attribute | Value |
|-----------|-------|
| **Sprint** | S2 |
| **Duration** | 3 weeks |
| **Dependencies** | Phase 1 (env validation needed for secret management) |
| **Risk** | 🟡 **Medium** — most changes are additive/non-breaking |
| **Total items** | 9 |
| **Estimated hours** | 60h |

### Priority items

| # | Priority | Item | Location | Effort | Risk |
|---|----------|------|----------|--------|------|
| P2-01 | 🔴 P0 | Implement proper JWT key management: load from env/secret mount only, remove all filesystem key paths | `jwt.service.ts` | 2h | 🟡 Key availability becomes env-dependent |
| P2-02 | 🔴 P0 | Move all secrets from `.env` files to env-only or secret manager (remove committed files) | All `.env` files | 2h | 🟠 Must update CI/CD env config |
| P2-03 | 🔴 P0 | Add SSRF protection: private IP blocklist + DNS rebinding protection for webhooks | `webhook.service.ts:152-160` | 4h | 🟢 None |
| P2-04 | 🟠 P1 | Add CSRF protection: register `@fastify/csrf` middleware | `main.ts` | 1h | 🟢 None |
| P2-05 | 🟠 P1 | Add security headers via `@fastify/helmet` | `main.ts` | 1h | 🟢 None |
| P2-06 | 🟠 P1 | Fix CORS wildcard `["*"]` in Python services → use env-configurable allowlist | `vision-service/main.py:72`, `engineering-service/src/main.py:77` | 1h | 🟢 None |
| P2-07 | 🔴 P0 | Add prompt injection sanitization: filter/escape known injection patterns before LLM submission | `ai.service.ts:86-90,169-197` | 4h | 🟡 May block legitimate technical content |
| P2-08 | 🟡 P2 | Add file upload extension whitelist (in addition to MIME type check) | `storage.service.ts:17-31` | 1h | 🟢 None |
| P2-09 | 🟡 P2 | Add `AuthThrottlerGuard` to auth controller endpoints | `auth.controller.ts` | 30m | 🟢 None |

### Acceptance criteria

- [ ] No secrets committed or loaded from filesystem — all from env variables
- [ ] Webhook delivery rejects URLs resolving to private/internal IPs
- [ ] All API responses include: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy`
- [ ] Python services reject requests from unexpected origins in production
- [ ] Prompt injection attempts (e.g., "Ignore previous instructions") are detected and blocked
- [ ] File uploads with disallowed extensions (e.g., `.exe`, `.sh`) are rejected even if MIME type is faked
- [ ] Login endpoints return 429 after 5 failed attempts in 60s

---

## 5. Phase 3 — Data Layer (Weeks 9-11)

> **Goal:** Fix database schema issues: missing cascade deletes, missing indexes, string enums, UUID types, updatedAt fields.

| Attribute | Value |
|-----------|-------|
| **Sprint** | S3 |
| **Duration** | 3 weeks |
| **Dependencies** | Phase 1 (transactions) — schema changes affect transaction code |
| **Risk** | 🟠 **High** — schema migrations on live DB; UUID migration is high-risk |
| **Total items** | 9 |
| **Estimated hours** | 80h |

### Priority items

| # | Priority | Item | Location | Effort | Risk |
|---|----------|------|----------|--------|------|
| P3-01 | 🔴 P0 | Add `onDelete: Cascade` / `onDelete: SetNull` to 20+ missing cascade relations | `schema.prisma` | 8h | 🟠 Must audit existing orphan data before migration |
| P3-02 | 🔴 P0 | Add missing Prisma relation to `password_reset_tokens → users` | `schema.prisma` | 30m | 🟢 None |
| P3-03 | 🟠 P1 | Convert 49+ String status/type/role fields to Prisma enums | `schema.prisma` + all related code | 16h | 🟡 Must handle existing data values not in new enums |
| P3-04 | 🟠 P1 | Add missing indexes on 10+ foreign-key columns | `schema.prisma` | 2h | 🟢 None |
| P3-05 | 🟠 P1 | Fix N+1 query patterns: add `include`/`select` eager-loading where missing | All repository files | 8h | 🟡 May increase query complexity |
| P3-06 | 🔴 P0 | Migrate UUID columns from `String` (TEXT) to `@db.Uuid` — all 40+ entity tables | `schema.prisma` + migration | 24h | 🔴 Very high risk — requires zero-downtime migration plan |
| P3-07 | 🟠 P1 | Add missing `@updatedAt` to 15+ mutable models | `schema.prisma` | 2h | 🟢 None |
| P3-08 | 🟡 P2 | Add `@@index([entity, entity_id])` to `audit_logs` | `schema.prisma` | 1h | 🟢 None |
| P3-09 | 🟠 P1 | Add `@@index([permission_id])` to `role_permissions`, composite index to `knowledge_taxonomy` | `schema.prisma` | 1h | 🟢 None |

### Acceptance criteria

- [ ] Deleting a workspace cascades to all owned entities (subscriptions, projects, files, etc.)
- [ ] `password_reset_tokens` has a typed Prisma relation to `users`
- [ ] All status fields (`subscriptions.status`, `invoices.status`, etc.) use Prisma enums — invalid values rejected at DB level
- [ ] All FK columns used in `WHERE` clauses have indexes — verified by `EXPLAIN ANALYZE`
- [ ] UUID columns stored as native PostgreSQL `uuid` type (16 bytes vs ~36 bytes text)
- [ ] All mutable models have `updated_at` set automatically by Prisma

---

## 6. Phase 4 — Quality (Weeks 12-14)

> **Goal:** Raise internal code quality: eliminate dead code, fix error handling, add centralized patterns, improve typing.

| Attribute | Value |
|-----------|-------|
| **Sprint** | S4 |
| **Duration** | 3 weeks |
| **Dependencies** | Phase 1 (config module for Logger integration), Phase 3 (enum changes affect type definitions) |
| **Risk** | 🟡 **Medium** — widespread changes, potential for regression |
| **Total items** | 12 |
| **Estimated hours** | 120h |

### Priority items

| # | Priority | Item | Location | Effort | Risk |
|---|----------|------|----------|--------|------|
| P4-01 | 🟡 P2 | Remove stale `.eslintrc.cjs` (flat config `eslint.config.mjs` is the active one) | root | 10m | 🟢 None |
| P4-02 | 🟠 P1 | Fix spec file exclusion: add `tsconfig.eslint.json` including spec files | root | 1h | 🟢 None |
| P4-03 | 🟠 P1 | Remove 5 empty stub enterprise modules or add README stubs | `modules/enterprise-*/` | 2h | 🟢 None |
| P4-04 | 🟠 P1 | Add centralized error handling: global exception filter that covers all known error types | `shared/filters/` | 4h | 🟡 Must not change existing error response format |
| P4-05 | 🟠 P1 | Replace all 54 `console.log`/`console.error` with injected NestJS `Logger` | All files | 6h | 🟢 None |
| P4-06 | 🔴 P0 | Fix 95 bare catch blocks: always log, re-throw, or handle explicitly (no silent swallowing) | All repository files, admin service | 12h | 🟡 May surface previously hidden errors |
| P4-07 | 🟠 P1 | Extract pagination boilerplate (~25 occurrences) into `shared/utils/pagination.ts` | All paginated services | 4h | 🟢 None |
| P4-08 | 🟠 P1 | Remove `@nestjs/platform-express` from dependencies | `apps/api/package.json` | 10m | 🟢 None |
| P4-09 | 🟠 P1 | Replace 50+ `as any` casts with proper generics, interfaces, or type assertions | All files | 8h | 🟡 Some raw SQL wrappers are hard to type |
| P4-10 | 🟠 P1 | Move prisma calls from application layer to repositories (auth, admin, knowledge, taxonomy controller) | Multiple files | 12h | 🟡 Significant architectural refactor |
| P4-11 | 🟡 P2 | Fix inconsistent boolean naming: `feature_flags.enabled` → `is_enabled` | Schema + all references | 2h | 🟡 Migration required |
| P4-12 | 🟡 P2 | Remove commented-out code blocks and Persian comments | All files | 2h | 🟢 None |

### Acceptance criteria

- [ ] ESLint parses all `.spec.ts` files correctly — no `parserOptions.project` errors
- [ ] Zero `console.log`/`console.error` in production code — all through Logger
- [ ] Zero bare catch blocks — every `catch` does at least one of: log, re-throw, handle
- [ ] Pagination extracted to shared utility — no inline page/limit/offset boilerplate
- [ ] Zero `as any` casts in new code (existing may be grandfathered with `eslint-disable` comments)
- [ ] Prisma calls only in `infrastructure/repositories/` — not in application services or controllers
- [ ] `@nestjs/platform-express` removed from dependencies

---

## 7. Phase 5 — AI Quality (Weeks 15-17)

> **Goal:** Make AI actually intelligent: real LLM calls, correct embeddings, citation engine, evidence chains, guardrails.

| Attribute | Value |
|-----------|-------|
| **Sprint** | S5 |
| **Duration** | 3 weeks |
| **Dependencies** | Phase 0 (agent LLM fix), Phase 1 (env validation for API keys) |
| **Risk** | 🟠 **High** — new AI infrastructure (citation, guardrails) is unproven in this codebase |
| **Total items** | 10 |
| **Estimated hours** | 160h |

### Priority items

| # | Priority | Item | Location | Effort | Risk |
|---|----------|------|----------|--------|------|
| P5-01 | 🔴 P0 | Implement real LLM calls in Electrical Engineer Agent — connect `process()` to ModelRouter with Groq/OpenAI | `agent.py:44-139` | 8h | 🟡 Response quality depends on prompt design |
| P5-02 | 🔴 P0 | Implement real SSE streaming — replace mock word-splitting with actual token stream from LLM | `llm.provider.ts:171-176`, `agent.py:163-171` | 8h | 🟡 Streaming protocol differences between providers |
| P5-03 | 🔴 P0 | Fix embedding pipeline: replace deterministic seed with content-based hash so each document gets a unique fallback embedding | `embedding_pipeline.py:46` | 1h | 🟢 None |
| P5-04 | 🟠 P1 | Add Citation Engine: track which document chunks/standards informed each claim, return structured citations with responses | New `rag/citation_engine.py` | 24h | 🟡 Must integrate with LLM response parsing |
| P5-05 | 🟠 P1 | Add Evidence Chain: add `retrievedDocuments` and `usedSources` to `ExecutionContext` for provenance tracking | `execution.types.ts`, `execution-pipeline.service.ts` | 12h | 🟡 Changes execution result schema |
| P5-06 | 🟠 P1 | Add Hallucination Guardrails: implement response grounding check (claim → source verification), "I don't know" fallback, uncertainty communication | New `rag/guardrails.py` | 16h | 🟡 May reduce answer rate |
| P5-07 | 🟠 P1 | Add Conflict Resolution: detect conflicting source documents, implement temporal/authority-based resolution | New `rag/conflict_resolver.py` | 12h | 🟡 Hard to test without real data |
| P5-08 | 🟠 P1 | Fix RAG pipeline: add proper token-aware chunking, hybrid search (dense + sparse), cross-encoder re-ranking | `chunker.py`, `retriever.py` | 16h | 🟡 Performance impact of re-ranking |
| P5-09 | 🔴 P0 | Implement real embedding generation (replace broken dummy fallback with actual API call or configurable fallback) | `embedding_pipeline.py` | 4h | 🟢 None |
| P5-10 | 🟠 P1 | Implement tool calling in Electrical Engineer Agent — connect `tools.py` to LLM function-calling loop | `agent.py`, `tools.py` | 16h | 🟡 Depends on LLM provider function-calling support |

### Acceptance criteria

- [ ] Electrical Engineer Agent sends messages to Groq/OpenAI API and returns LLM-generated responses
- [ ] SSE streams real tokens from LLM, not pre-generated word splits
- [ ] Fallback embeddings produce different vectors for different documents
- [ ] Chat responses include `citations[]` with linked source document references
- [ ] Execution result includes `stages[].sources[]` tracking which documents were retrieved
- [ ] Responses that cannot be grounded in sources include an uncertainty disclaimer
- [ ] Conflicting source values are detected and resolved with clear metadata
- [ ] RAG chunking respects token limits (not word counts) with proper overlap

---

## 8. Phase 6 — Testing (Weeks 18-22)

> **Goal:** Build comprehensive test coverage from 8.72% to 60%+ with unit, integration, e2e, concurrency, and load tests.

| Attribute | Value |
|-----------|-------|
| **Sprint** | S6-S7 |
| **Duration** | 5 weeks |
| **Dependencies** | Phase 1, 3, 4 (code must be stable before writing tests that won't need rewriting) |
| **Risk** | 🟡 **Medium** — test infrastructure setup may reveal design issues |
| **Total items** | 10 |
| **Estimated hours** | 400h |

### Priority items

| # | Priority | Item | Location | Effort | Risk |
|---|----------|------|----------|--------|------|
| P6-01 | 🔴 P0 | Add unit tests for 21 untested API modules: auth, rbac, billing, engineering, storage, user, workspace, etc. | `apps/api/src/modules/*/` | 120h | 🟡 Mock-heavy tests may not catch real issues |
| P6-02 | 🔴 P0 | Fix 15 failing engineering-service tests (basic calculator API assertions, registry thread safety) | `engineering-service/tests/` | 8h | 🟢 None |
| P6-03 | 🔴 P0 | Install missing `openai` in ai-service venv so tests can run; fix collection error | `ai-service/` | 1h | 🟢 None |
| P6-04 | 🟠 P1 | Add integration tests for critical cross-module flows: auth→workspace, workspace→project→calculations | `apps/api/test/` | 40h | 🟡 Requires test DB setup |
| P6-05 | 🟠 P1 | Add e2e tests for critical paths: login→token→CRUD, file upload/download, billing flow | `apps/api/test/` | 40h | 🟡 Environment setup complexity |
| P6-06 | 🟠 P1 | Add concurrency tests for multi-tenant isolation (workspace A cannot access workspace B data) | All modules | 16h | 🟡 Race conditions hard to reproduce |
| P6-07 | 🟡 P2 | Add load/stress tests with k6 or Artillery for auth, engineering calculations, AI chat endpoints | New `load-tests/` | 20h | 🟢 None |
| P6-08 | 🟠 P1 | Add unit tests for 5 untested ai-runtime services (execution-pipeline, memory-abstraction, prompt-registry, streaming-response-manager, tool-dispatcher) | `ai-runtime/application/services/` | 24h | 🟡 Mocking LLM calls requires careful setup |
| P6-09 | 🟡 P2 | Set up frontend testing infrastructure (vitest + React Testing Library) and test critical components | `apps/web/` | 40h | 🟡 No existing patterns to follow |
| P6-10 | 🟠 P1 | Add coverage thresholds to jest config (minimum 30% initially, ramp to 60%) | `apps/api/jest.config.ts` | 1h | 🟢 None |

### Acceptance criteria

- [ ] All 27 API modules have at least basic unit tests for service and controller
- [ ] All 15 engineering-service Python tests pass
- [ ] All ai-service tests pass (0 collection errors, 0 failures)
- [ ] Integration tests verify auth → RBAC → workspace → project flow end-to-end
- [ ] E2E tests verify: user registration → login → workspace creation → project → calculation
- [ ] Concurrency tests verify: parallel requests from workspace A cannot access workspace B data
- [ ] Load test shows system handles 100 concurrent users without degradation
- [ ] Frontend has test infrastructure and at least 10 component tests
- [ ] Line coverage ≥ 30% (failing build if below threshold)

---

## 9. Phase 7 — DevOps (Weeks 23-25)

> **Goal:** Production deployment infrastructure: CI/CD, Kubernetes, monitoring, logging, error tracking.

| Attribute | Value |
|-----------|-------|
| **Sprint** | S8 |
| **Duration** | 3 weeks |
| **Dependencies** | Phase 1 (health checks), Phase 3 (DB schema stable) |
| **Risk** | 🟡 **Medium** — infrastructure changes affect deployment workflow |
| **Total items** | 6 |
| **Estimated hours** | 80h |

### Priority items

| # | Priority | Item | Location | Effort | Risk |
|---|----------|------|----------|--------|------|
| P7-01 | 🔴 P0 | Create CI/CD pipeline: `.github/workflows/ci.yml` with lint → typecheck → test → build → security scan | `.github/` | 16h | 🟡 Must handle monorepo caching |
| P7-02 | 🔴 P0 | Create Kubernetes manifests for all services (api, web, engineering-service, ai-service, vision-service) | `infrastructure/kubernetes/` | 24h | 🟡 Must match docker-compose configuration |
| P7-03 | 🟠 P1 | Set up monitoring: Prometheus metrics endpoint, Grafana dashboards for API, AI, DB | All services | 16h | 🟢 None |
| P7-04 | 🟠 P1 | Set up centralized logging: structured JSON logging, log aggregation (Loki/ELK) | All services | 12h | 🟢 None |
| P7-05 | 🟠 P1 | Set up error tracking: integrate Sentry for NestJS and Python services | All services | 4h | 🟢 None |
| P7-06 | 🟡 P2 | Configure production docker-compose with health checks, resource limits, restart policies | `infrastructure/docker/compose/production/` | 8h | 🟢 None |

### Acceptance criteria

- [ ] Every PR triggers: `pnpm install` → `pnpm lint` → `pnpm typecheck` → `pnpm test` (all layers)
- [ ] PR merge to `main` triggers staging deployment
- [ ] All Kubernetes deployments have: readinessProbe, livenessProbe, resource limits, HPA config
- [ ] Prometheus collects metrics from all services (request rate, latency, error rate, saturation)
- [ ] Grafana has dashboards for: API performance, AI response quality, DB health
- [ ] Structured JSON logs from all services stream to centralized log store
- [ ] Sentry captures unhandled exceptions from NestJS and Python with source maps

---

## 10. Phase 8 — Polish (Weeks 26-28)

> **Goal:** Address remaining technical debt, optimize performance, complete documentation, final security review.

| Attribute | Value |
|-----------|-------|
| **Sprint** | S9 |
| **Duration** | 3 weeks |
| **Dependencies** | All prior phases |
| **Risk** | 🟢 **Low** — primarily cleanup and documentation |
| **Total items** | 12 |
| **Estimated hours** | 80h |

### Priority items

| # | Priority | Item | Location | Effort | Risk |
|---|----------|------|----------|--------|------|
| P8-01 | 🟡 P2 | Split 6 large classes (>300 lines): `knowledge.service.ts`, `admin.service.ts`, `billing.service.ts`, `billing.repository.ts`, `workspace.service.ts`, `marketplace.repository.ts` | Various | 20h | 🟡 Must not change public API |
| P8-02 | 🟡 P2 | Extract magic numbers into `shared/domain/constants/` | All files | 4h | 🟢 None |
| P8-03 | 🟡 P2 | Add Architecture Decision Records (ADRs) for: DDD adoption, Fastify choice, multi-tenant strategy, Prisma ORM | `docs/adr/` | 4h | 🟢 None |
| P8-04 | 🟡 P2 | Add request-level tracing (`X-Request-ID` middleware) | All services | 4h | 🟢 None |
| P8-05 | 🟡 P2 | Remove dead code: `packages/shared`, `packages/types` if unused | Monorepo | 2h | 🟡 Verify no imports exist |
| P8-06 | 🟡 P2 | Fix `is_admin` → RBAC migration (deprecate boolean, use SUPER_ADMIN role) | Schema + auth code | 8h | 🟡 Dual-path authorization must work during migration |
| P8-07 | 🟡 P2 | Implement circuit breaker pattern for Engineering/Vision/AI external service calls | Multiple files | 8h | 🟢 None |
| P8-08 | 🟢 P3 | Add `pnpm db:rollback` script | `package.json` | 10m | 🟢 None |
| P8-09 | 🟢 P3 | Fix `discipline` typo in `knowledge_taxonomy` | Schema + migration | 1h | 🟢 None |
| P8-10 | 🟡 P2 | Performance optimization: audit N+1 queries, add missing eager-loading, optimize hot paths | All repositories | 8h | 🟡 Must benchmark before/after |
| P8-11 | 🟢 P3 | Complete inline documentation: JSDoc on public API methods, Python docstrings on FastAPI endpoints | All files | 12h | 🟢 None |
| P8-12 | 🟡 P2 | Final security review: penetration test, dependency audit (`pnpm audit`), OWASP Top 10 checklist | All | 8h | 🟢 None |

### Acceptance criteria

- [ ] No class exceeds 300 lines
- [ ] No magic numbers in production code — all in named constants
- [ ] `docs/adr/` contains at least 4 records covering key architectural decisions
- [ ] All HTTP requests carry a unique `X-Request-ID` propagated to backend services
- [ ] `is_admin` column is deprecated and all super-admin checks use RBAC roles
- [ ] External service failures are isolated by circuit breakers
- [ ] `pnpm audit` reports zero high/critical vulnerabilities
- [ ] OWASP Top 10 checklist completed with no unaddressed items

---

## Summary: Phase Dependency Graph

```
Phase 0 ──► Phase 2 ──► Phase 8
  │             │
  ▼             │
Phase 1 ────────┤
  │             │
  ├──► Phase 3  │
  │       │     │
  ▼       ▼     │
Phase 4 ──┤     │
  │       │     │
  ▼       │     │
Phase 5 ◄─┘     │
  │             │
  ▼             │
Phase 6 ◄───────┘
  │
  ▼
Phase 7
```

| Phase | Sprint | Weeks | Hours | Items | Risk | Dependencies |
|-------|--------|-------|-------|-------|------|--------------|
| 0 — Stop the Bleeding | S0 | 1-2 | 40h | 10 | 🔴 Critical | None |
| 1 — Foundation | S1 | 3-5 | 120h | 12 | 🟠 High | Phase 0 |
| 2 — Security Hardening | S2 | 6-8 | 60h | 9 | 🟡 Medium | Phase 1 |
| 3 — Data Layer | S3 | 9-11 | 80h | 9 | 🟠 High | Phase 1 |
| 4 — Quality | S4 | 12-14 | 120h | 12 | 🟡 Medium | Phase 1, 3 |
| 5 — AI Quality | S5 | 15-17 | 160h | 10 | 🟠 High | Phase 0, 1 |
| 6 — Testing | S6-S7 | 18-22 | 400h | 10 | 🟡 Medium | Phase 1, 3, 4 |
| 7 — DevOps | S8 | 23-25 | 80h | 6 | 🟡 Medium | Phase 1 |
| 8 — Polish | S9 | 26-28 | 80h | 12 | 🟢 Low | All prior |
| **Total** | **9 sprints** | **28 weeks** | **1,140h+** | **90** | | |

## Key Metrics to Track

| Metric | Current | Target (end of Phase 0) | Target (end of Phase 4) | Target (final) |
|--------|---------|-------------------------|------------------------|----------------|
| Test coverage | 8.72% | 8.72% | 15% | 60%+ |
| Open CVEs | 7 critical | 0 | 0 | 0 |
| Failing tests | 15 | 0 | 0 | 0 |
| `console.log` count | 54 | 54 | 0 | 0 |
| Bare catch blocks | 95 | 95 | 0 | 0 |
| Classes >300 lines | 6 | 6 | 6 | 0 |
| `as any` casts | 50+ | 50+ | 25 | <10 |
| Graceful shutdown | ❌ | ❌ | ✅ | ✅ |
| Env validation | ❌ | ❌ | ✅ | ✅ |
| Prisma transactions | 0 | 0 | ✅ | ✅ |
| AI → real LLM | ❌ | ✅ | ✅ | ✅ |
| CI/CD pipeline | ❌ | ❌ | ❌ | ✅ |
| K8s manifests | ❌ | ❌ | ❌ | ✅ |
