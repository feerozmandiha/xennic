# Xennic — Sprint Plan to RC1

> **Team:** 3–4 engineers (2 backend NestJS, 1 AI/ML Python, 1 DevOps)
> **Sprint cadence:** 2 weeks
> **Total duration:** 28 weeks (14 sprints)
> **Estimated total effort:** ~1,200 hours
> **Target:** Release Candidate 1 (RC1)

---

## Sprint 1 — Stop the Bleeding (Weeks 1–2)

**Theme:** Eliminate immediate security vulnerabilities and critical infrastructure gaps.

**Estimated hours:** 80h

**Objectives:**
- Close all P0 security holes (unguarded endpoints, SSRF, hard deletes, committed secrets)
- Fix build infrastructure (gitignore, lint, deps)
- Fix failing tests (Python engineering-service + ai-service venv)

**Gap IDs:** XEN-GAP-0010, XEN-GAP-0008, XEN-GAP-0005, XEN-GAP-0018, XEN-GAP-0007, XEN-GAP-0006, XEN-GAP-0032, XEN-GAP-0034, XEN-GAP-0033, XEN-GAP-0035, XEN-GAP-0037, XEN-GAP-0038, XEN-GAP-0076, XEN-GAP-0077, XEN-GAP-0020, XEN-GAP-0036

**Deliverables:**
- ✅ `.gitignore` updated — `venv/`, `__pycache__/`, `*.pyc` excluded
- ✅ `@nestjs/throttler` moved to dependencies in both `apps/api` and `apps/web`
- ✅ Lint scripts added to all 6 packages; lint errors fixed
- ✅ `@xennic/shared` has build step
- ✅ `@nestjs/platform-express` removed from `apps/api`
- ✅ Stale `.eslintrc.cjs` deleted
- ✅ Pre-commit hooks installed (lint + format check)
- ✅ `openai` installed in ai-service venv; tests run
- ✅ 15 failing engineering-service tests fixed
- ✅ JWT + SUPER_ADMIN guards on all UserController endpoints
- ✅ Ownership/membership checks on hard-delete endpoints
- ✅ Webhook URL validation blocks private IP ranges (SSRF fix)
- ✅ Encryption master key moved to env-only (not in `.env`)
- ✅ Workspace isolation added to ConsultationsController
- ✅ PermissionsGuard fail-open → fail-closed
- ✅ Prompt injection sanitization in `ai.service.ts`
- ✅ `AuthThrottlerGuard` applied to auth endpoints

**Acceptance Criteria:**
- [ ] Unauthenticated requests to UserController return 401
- [ ] Webhook delivery rejects internal IPs (10.x, 172.16–31.x, 192.168.x, 127.x, 169.254.x)
- [ ] All 434 engineering-service tests pass (0 failures)
- [ ] All 15 ai-service tests collect and pass
- [ ] `git status` shows no `.pyc` or `venv/` files
- [ ] `pnpm lint` passes on all 6 packages
- [ ] Pre-commit hooks prevent commit on lint failure

**Dependencies Cleared:** None (foundation sprint)

---

## Sprint 2 — Foundation: Production Readiness (Weeks 3–4)

**Theme:** Make the API production-ready with graceful shutdown, config validation, transactions, and health checks.

**Estimated hours:** 80h

**Objectives:**
- Add graceful shutdown and lifecycle hooks
- Implement centralized env validation with Joi
- Add Prisma `$transaction` to all multi-step writes
- Create readiness/liveness health probes
- Implement idempotency middleware for POST endpoints
- Add Redis caching for hot-path queries

**Gap IDs:** XEN-GAP-0041, XEN-GAP-0042, XEN-GAP-0044, XEN-GAP-0045, XEN-GAP-0049, XEN-GAP-0052, XEN-GAP-0053, XEN-GAP-0080

**Deliverables:**
- ✅ `app.enableShutdownHooks()` + SIGTERM/SIGINT handlers in `main.ts`
- ✅ `ConfigModule.forRoot()` with Joi validation schema in `api.module.ts`
- ✅ All `process.env` reads migrated to `ConfigService`
- ✅ Prisma `$transaction` wrapping on: auth login/register, workspace create, storage upload, billing payment, project create
- ✅ Idempotency middleware checking `Idempotency-Key` header (Redis-backed)
- ✅ `@nestjs/terminus` health check with DB, Redis, MinIO, Qdrant probes
- ✅ `/health/readiness` and `/health/liveness` endpoints
- ✅ `OnModuleDestroy` in PrismaService, MinioService, Redis connections
- ✅ Rate limit config moved to env vars
- ✅ Redis caching for `getActivePlanSlug`, workspace settings, permissions
- ✅ Web build hang investigated and fixed or documented with workaround

**Acceptance Criteria:**
- [ ] `SIGTERM` drains in-flight requests and closes connections cleanly
- [ ] Missing `DATABASE_URL` causes startup failure with descriptive message
- [ ] Auth, workspace, storage, billing writes use `$transaction`
- [ ] POST endpoints return 409 on duplicate `Idempotency-Key`
- [ ] `/health/readiness` returns 200 only when DB, Redis, MinIO responsive
- [ ] `/health/liveness` returns 200 when process alive
- [ ] `getActivePlanSlug` returns cached value in <5ms (was ~50ms DB query)

**Dependencies Cleared:** XEN-GAP-0010, XEN-GAP-0005

---

## Sprint 3 — Security Hardening (Weeks 5–6)

**Theme:** Close all remaining security gaps: headers, CORS, retry, timer leaks, JWT management.

**Estimated hours:** 72h

**Objectives:**
- Add comprehensive security headers via Helmet
- Fix CORS in Python services
- Implement retry with exponential backoff on all external calls
- Fix timer leaks in engineering/vision clients
- Implement account lockout and MFA foundation
- Proper JWT key management (env-only, no filesystem paths)

**Gap IDs:** XEN-GAP-0014, XEN-GAP-0040, XEN-GAP-0069, XEN-GAP-0031, XEN-GAP-0039, XEN-GAP-0050, XEN-GAP-0051

**Deliverables:**
- ✅ `@fastify/helmet` registered with CSP, HSTS, X-Content-Type-Options, X-Frame-Options
- ✅ `@fastify/csrf` middleware registered
- ✅ Python services CORS changed to env-configurable allowlist
- ✅ JWT keys loaded from env only; filesystem paths removed
- ✅ All secrets removed from `.env` files; files added to `.gitignore`
- ✅ New JWT key pair generated and deployed
- ✅ Account lockout: 5 failed attempts → 15-min lock
- ✅ Retry with exponential backoff (3 retries, 1s/2s/4s) for: EngineeringClient, VisionClient, Zarinpal, webhooks
- ✅ All `AbortController` + `setTimeout` replaced with `AbortSignal.timeout()`

**Acceptance Criteria:**
- [ ] All API responses include: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy`
- [ ] Python services reject requests from unexpected origins in production
- [ ] 5 failed login attempts → account locked for 15 min
- [ ] External service failures retry 3 times with backoff before failing
- [ ] No timer leaks in engineering-client or vision-client (verified by test)
- [ ] No `.env` files or JWT keys in git tracking
- [ ] No filesystem key paths in auth module

**Dependencies Cleared:** XEN-GAP-0018, XEN-GAP-0007, XEN-GAP-0076, XEN-GAP-0077, XEN-GAP-0020

---

## Sprint 4 — Data Layer: Schema & Queries (Weeks 7–8)

**Theme:** Fix database schema issues, missing indexes, N+1 queries, and query performance anti-patterns.

**Estimated hours:** 80h

**Objectives:**
- Add cascade deletes to all relations
- Fix missing Prisma relations
- Eliminate N+1 query patterns
- Replace `SELECT *` with explicit columns
- Fix manual UPSERT patterns
- Add parallelism to multi-collection RAG retrieval

**Gap IDs:** XEN-GAP-0070, XEN-GAP-0071, XEN-GAP-0081, XEN-GAP-0082, XEN-GAP-0083, XEN-GAP-0084, XEN-GAP-0085

**Deliverables:**
- ✅ `onDelete: Cascade` / `onDelete: SetNull` added to 22 missing relations in `schema.prisma`
- ✅ `password_reset_tokens → users` relation added with cascade
- ✅ Data audit for existing orphans before migration
- ✅ Prisma migration generated and applied
- ✅ `messages` — composite index `[conversation_id, created_at]`
- ✅ `knowledge` — composite indexes `[workspace_id, status, is_active]`, `[workspace_id, deleted_at]`
- ✅ `projects` — composite index `[workspace_id, deleted_at]`
- ✅ `usage_logs` — composite index `[workspace_id, feature, logged_at]`
- ✅ N+1 fix: `AiRepository.findConversation` — lazy message loading
- ✅ N+1 fix: `SubscriptionService.getActivePlan` — use Prisma `include`
- ✅ N+1 fix: `WorkspaceService.create` — use SQL `COUNT` instead of in-memory scan
- ✅ N+1 fix: `KnowledgeService.getDashboardAnalytics` — DB-side aggregation
- ✅ 30+ `SELECT *` replaced with explicit column lists
- ✅ Manual UPSERT → Prisma native `upsert` in project, llm provider
- ✅ `ai-service/file_store.py` → `aiofiles` for async file I/O
- ✅ `retriever.py` — sequential → `asyncio.gather` for multi-collection search
- ✅ `qdrant_store.py` — `wait=False` for bulk upsert + `ensure()` at end

**Acceptance Criteria:**
- [ ] Deleting a workspace cascades to all owned entities
- [ ] `password_reset_tokens` has typed Prisma relation to `users`
- [ ] No N+1 queries in hot paths (verified by test or EXPLAIN ANALYZE)
- [ ] All repository queries select only needed columns
- [ ] Multi-collection RAG retrieval runs in parallel (3x speedup)
- [ ] DB migration applies cleanly with no data loss

**Dependencies Cleared:** XEN-GAP-0041, XEN-GAP-0042

---

## Sprint 5 — Code Quality: Errors, Logging & Architecture (Weeks 9–10)

**Theme:** Eliminate silent failures, improve observability, fix architecture leaks.

**Estimated hours:** 80h

**Objectives:**
- Eliminate all bare catch blocks (95 instances)
- Replace all `console.log`/`console.error` with Logger (54 instances)
- Move Prisma calls from application layer to repositories
- Extract pagination boilerplate into shared utility
- Fix `any` types (50+ instances)
- Begin splitting large classes

**Gap IDs:** XEN-GAP-0065, XEN-GAP-0066, XEN-GAP-0064, XEN-GAP-0068, XEN-GAP-0017, XEN-GAP-0067

**Deliverables:**
- ✅ All 95 bare catch blocks fixed: every `catch` must log, re-throw, or handle explicitly
- ✅ `ai.repository.ts` — `catch { return null; }` → proper error logging + propagation
- ✅ `admin.service.ts` — all silent swallows fixed
- ✅ `billing.service.ts` — `throw new Error()` → `HttpException`
- ✅ All 54 `console.log`/`console.error` → injected `Logger`
- ✅ `all-exceptions.filter.ts` — `console.error` → Logger
- ✅ `auth.service.ts` — console audit → `audit_logs` DB table
- ✅ `PrismaClient` removed from: `admin.service.ts`, `auth.service.ts`, `knowledge.service.ts`, `taxonomy.controller.ts`
- ✅ Pagination extracted to `shared/utils/pagination.ts` — all ~25 callers updated
- ✅ 50+ `as any` → proper generics/interfaces (grandfathered where impossible)
- ✅ `knowledge.service.ts` (801 lines) → split into: `KnowledgeCrudService`, `TaxonomyService`, `AnalyticsService`, `FormulaService`
- ✅ `admin.service.ts` (583 lines) → split into: `AdminStatsService`, `AdminUserService`, `AdminWorkspaceService`

**Acceptance Criteria:**
- [ ] Zero bare catch blocks in production code
- [ ] Zero `console.log`/`console.error` — all through Logger
- [ ] No Prisma imports in `application/` layer or controllers
- [ ] Pagination uses shared utility (no inline page/limit/offset)
- [ ] `as any` count reduced from 50+ to <15
- [ ] `knowledge.service.ts` <300 lines, `admin.service.ts` <300 lines

**Dependencies Cleared:** XEN-GAP-0008, XEN-GAP-0006, XEN-GAP-0032, XEN-GAP-0034, XEN-GAP-0033, XEN-GAP-0035, XEN-GAP-0037, XEN-GAP-0038, XEN-GAP-0036

---

## Sprint 6 — AI Foundation: Real LLM Integration (Weeks 11–12)

**Theme:** Fix critical AI bugs — agents must actually call LLMs, pipeline must execute, embeddings must work.

**Estimated hours:** 80h

**Objectives:**
- Connect Electrical Engineer Agent to real LLM via ModelRouter
- Fix execution pipeline to actually call LLM (not echo)
- Fix embedding pipeline (content-based hash, not constant seed)
- Implement real SSE streaming (not fake word-by-word)
- Connect tool functions to agent tool-calling loop
- Fix critical bugs (workspaceId typo, duplicate method, mock fallback)

**Gap IDs:** XEN-GAP-0054, XEN-GAP-0055, XEN-GAP-0056, XEN-GAP-0057, XEN-GAP-0058, XEN-GAP-0059, XEN-GAP-0062, XEN-GAP-0063, XEN-GAP-0046, XEN-GAP-0047

**Deliverables:**
- ✅ `ElectricalEngineerAgent.process()` — replace hardcoded if/else with `ModelRouter.route()` + LLM API call
- ✅ `ModelRouter` actually used by both agents (previously academic)
- ✅ `execution-pipeline.service.ts` — replace mock echo with actual `LlmProvider.chat()`
- ✅ `embedding_pipeline.py` — `hash(str(dimension))` → `hashlib.sha256(text.encode())` for unique per-doc fallback
- ✅ Embedding dimension validation added
- ✅ `ai-runtime.controller.ts:54` — `req.workspaceId` → correct property
- ✅ Duplicate `analyze_document()` removed (keep second version, lines 282–398)
- ✅ `llm.provider.ts:171-176` — real SSE streaming via provider API (not word-split)
- ✅ `agent.py:163-171` — real streaming (not chunked pre-generated text)
- ✅ `streaming-response-manager.service.ts` — real stream, no hardcoded 15ms delay
- ✅ `tools.py` — all tool functions registered in agent via function-calling/ReAct loop
- ✅ `llm.provider.ts:121` — mock fallback removed; throws `ServiceUnavailableException`
- ✅ `ai.repository.ts` — all silent swallows → proper error handling

**Acceptance Criteria:**
- [ ] Electrical Engineer Agent sends messages to Groq/OpenAI API and returns LLM-generated responses
- [ ] Execution pipeline returns actual LLM responses (not echoed input)
- [ ] Fallback embeddings produce DIFFERENT vectors for different documents
- [ ] SSE streams real tokens from LLM (TTFB <500ms)
- [ ] Agent uses `CalculationTool` via function calling (not hardcoded values)
- [ ] No mock data returned in non-development mode
- [ ] WebSocket/SSE client disconnect cleans up stream handler

**Dependencies Cleared:** XEN-GAP-0014, XEN-GAP-0040, XEN-GAP-0069, XEN-GAP-0031, XEN-GAP-0039, XEN-GAP-0050, XEN-GAP-0051

---

## Sprint 7 — AI Quality: Memory, Guardrails & Source Grounding (Weeks 13–14)

**Theme:** Make AI reliable with persistent memory, safety guardrails, and source-attributed responses.

**Estimated hours:** 80h

**Objectives:**
- Replace in-memory stores with Redis/DB-backed persistence
- Implement agent memory (conversation, facts, preferences)
- Add source grounding to chat responses (RAG context injection)
- Build citation engine and evidence chain
- Add hallucination guardrails and conflict resolution

**Gap IDs:** XEN-GAP-0043, XEN-GAP-0060, XEN-GAP-0061, XEN-GAP-0015, XEN-GAP-0016

**Deliverables:**
- ✅ `InMemorySessionStore` → Redis-backed `SessionStore`
- ✅ `InMemoryMemoryStore` → Prisma-backed `MemoryStore`
- ✅ `InMemoryPromptTemplateStore` → Prisma-backed `PromptTemplateStore`
- ✅ Session TTL + eviction policy added
- ✅ `InMemoryMemoryStore` replaced with DB persistence + consolidation logic
- ✅ Short-term → long-term memory consolidation (fact extraction from conversations)
- ✅ `ai.service.ts:92-97` — RAG context injection before LLM call
- ✅ `retriever.py` → cross-encoder re-ranking (top 20 → top 5)
- ✅ `chunker.py` → token-aware chunking (replaces word-count)
- ✅ Hybrid search: dense + sparse (BM25) with reciprocal rank fusion
- ✅ Citation Engine: `Source` model populated in responses
- ✅ `execution.types.ts` — `retrievedDocuments` and `usedSources` fields added
- ✅ `execution-pipeline.service.ts` — provenance tracking through stages
- ✅ Hallucination guardrails: response grounding check (claim → source verification)
- ✅ "I don't know" detection — admit uncertainty when source-grounded confidence < threshold
- ✅ Conflict Resolution: detect conflicting sources, temporal/authority-based resolution
- ✅ Engineering guardrails: range/sanity checks, unit consistency, multi-method verification

**Acceptance Criteria:**
- [ ] Sessions persist across restarts (Redis-backed)
- [ ] Agent remembers facts from earlier conversations (DB-backed)
- [ ] Chat responses include `citations[]` with linked source document references
- [ ] Execution result includes `stages[].sources[]` tracking which documents were retrieved
- [ ] Responses without source grounding include uncertainty disclaimer
- [ ] Conflicting source values are detected and resolved with clear metadata
- [ ] RAG chunking respects token limits (not word counts)
- [ ] Retrieval uses hybrid search (not pure vector)

**Dependencies Cleared:** XEN-GAP-0008 (already cleared), XEN-GAP-0045, XEN-GAP-0044, XEN-GAP-0049, XEN-GAP-0052, XEN-GAP-0053, XEN-GAP-0080

---

## Sprint 8 — AI Advanced: RAG Pipeline & Multi-Agent Orchestration (Weeks 15–16)

**Theme:** Connect knowledge module to AI service, build multi-agent coordination, create knowledge → AI bridge.

**Estimated hours:** 80h

**Objectives:**
- Build knowledge → ai-service RAG bridge
- Implement multi-agent orchestration layer
- Add agent safety and permission enforcement
- Fix Pydantic deprecation warnings

**Gap IDs:** XEN-GAP-0012, XEN-GAP-0013, XEN-GAP-0029

**Deliverables:**
- ✅ knowledge module → ai-service RAG pipeline integration
- ✅ Knowledge articles automatically indexed to Qdrant on publish
- ✅ Knowledge search uses hybrid search (vector + keyword)
- ✅ Multi-agent orchestrator: tool registry → routing → dispatch → aggregation
- ✅ Agent registry: lifecycle management, initialization hooks, shutdown cleanup
- ✅ Agent permission checking (`REQUIRED_PERMISSION` enforced in registry + API)
- ✅ Model router: API key validation at startup, fallback chain
- ✅ Add circuit breaker for engineering-service → AI service calls
- ✅ 215 Pydantic `example=` → `json_schema_extra` migration in engineering-service

**Acceptance Criteria:**
- [ ] Publishing a knowledge article auto-indexes it for RAG retrieval
- [ ] Chat responses include knowledge articles in citations
- [ ] Multi-agent orchestrator routes tasks to appropriate agent
- [ ] Permission errors return 403 (not 500) when agent access denied
- [ ] Circuit breaker trips after 5 failures in 60s window
- [ ] Zero Pydantic deprecation warnings in engineering-service tests

**Dependencies Cleared:** XEN-GAP-0054, XEN-GAP-0055, XEN-GAP-0056, XEN-GAP-0057, XEN-GAP-0058, XEN-GAP-0059, XEN-GAP-0062, XEN-GAP-0063, XEN-GAP-0046, XEN-GAP-0047

---

## Sprint 9 — Testing Expansion: Unit Tests Part 1 (Weeks 17–18)

**Theme:** Build comprehensive unit test coverage for core business modules.

**Estimated hours:** 80h

**Objectives:**
- Write unit tests for auth module (login, register, refresh, JWT)
- Write unit tests for rbac module (roles, permissions, guards)
- Write unit tests for user and project modules
- Set up CI/CD pipeline (GitHub Actions)

**Gap IDs:** XEN-GAP-0003, XEN-GAP-0004

**Deliverables:**
- ✅ `auth.service.spec.ts` — 20+ tests: register, login, refresh token rotation, logout, forgot/reset password, profile CRUD, rate limiting
- ✅ `auth.controller.spec.ts` — 10+ tests: all 10 endpoints
- ✅ `jwt.service.spec.ts` — sign, verify, decode, expiry
- ✅ `jwt.strategy.spec.ts` — validate, invalid token, expired token
- ✅ `role.service.spec.ts` — CRUD, role-permission assignment
- ✅ `permission.service.spec.ts` — CRUD
- ✅ `authorization.service.spec.ts` — check, hasPermission, getEffectivePermissions
- ✅ `permissions.guard.spec.ts` — allowed, denied, fail-closed
- ✅ `workspace.guard.spec.ts` — valid workspace, invalid workspace, missing header
- ✅ `user.service.spec.ts` — CRUD, soft delete, restore
- ✅ `user.controller.spec.ts` — all 6 endpoints with auth
- ✅ `project.service.spec.ts` — CRUD, members, notes
- ✅ `project.controller.spec.ts` — all 5 endpoints
- ✅ `.github/workflows/ci.yml` — install → lint → typecheck → test → build
- ✅ `.github/workflows/deploy.yml` — staging deploy on main push
- ✅ GitHub status checks required before merge

**Acceptance Criteria:**
- [ ] Auth module: ≥70% line coverage (controller + service + strategy)
- [ ] RBAC module: ≥70% line coverage (services + guards)
- [ ] User module: ≥60% line coverage
- [ ] Project module: ≥60% line coverage
- [ ] CI pipeline runs all jobs in <10 minutes
- [ ] PR with failing test cannot merge

**Dependencies Cleared:** XEN-GAP-0006 (already), XEN-GAP-0007 (already), XEN-GAP-0065, XEN-GAP-0066

---

## Sprint 10 — Testing Expansion: Unit Tests Part 2 (Weeks 19–20)

**Theme:** Continue unit test coverage for remaining modules + E2E smoke tests.

**Estimated hours:** 80h

**Objectives:**
- Write unit tests for billing, subscription, engineering, storage modules
- Write E2E tests for critical user journeys

**Gap IDs:** XEN-GAP-0003

**Deliverables:**
- ✅ `billing.service.spec.ts` — plans CRUD, payment flow, invoice generation
- ✅ `billing.controller.spec.ts` — all 8 endpoints
- ✅ `subscription.service.spec.ts` — create, cancel, upgrade, getActivePlan
- ✅ `subscription.controller.spec.ts` — all 6 endpoints
- ✅ `engineering.service.spec.ts` — calculate, validate, compare, approve/reject
- ✅ `engineering.controller.spec.ts` — all 8 endpoints
- ✅ `storage.service.spec.ts` — upload, download, delete, list
- ✅ `storage.controller.spec.ts` — all 4 endpoints
- ✅ E2E: Auth flow — register → login → refresh → logout
- ✅ E2E: Workspace flow — create → settings → members → dashboard
- ✅ E2E: Project flow — create → add members → create calculation
- ✅ E2E: File flow — upload → list → download → delete

**Acceptance Criteria:**
- [ ] Billing module: ≥60% line coverage
- [ ] Subscription module: ≥60% line coverage
- [ ] Engineering module: ≥60% line coverage
- [ ] Storage module: ≥60% line coverage
- [ ] 4 E2E test suites pass (covering critical user journeys)
- [ ] Overall coverage ≥25%

**Dependencies Cleared:** XEN-GAP-0070, XEN-GAP-0071, XEN-GAP-0081, XEN-GAP-0082, XEN-GAP-0083, XEN-GAP-0084, XEN-GAP-0085

---

## Sprint 11 — Testing Expansion: Integration & Concurrency (Weeks 21–22)

**Theme:** Add integration tests with real DB, concurrency tests for multi-tenancy, load tests.

**Estimated hours:** 80h

**Objectives:**
- Write integration tests for cross-module flows
- Write concurrency tests for multi-tenant isolation
- Add load/stress test infrastructure
- Set up frontend testing infrastructure

**Gap IDs:** XEN-GAP-0003

**Deliverables:**
- ✅ Integration test: auth → RBAC → workspace → project → calculation (end-to-end)
- ✅ Integration test: knowledge lifecycle (create → publish → version → search)
- ✅ Integration test: billing → subscription → payment → invoice
- ✅ Integration test: multi-tenant isolation (workspace A cannot see workspace B data)
- ✅ Concurrency test: 10 parallel requests for workspace isolation
- ✅ Concurrency test: duplicate registration prevention
- ✅ k6 load test scripts for: auth login, engineering calculation, AI chat
- ✅ Load test report showing system handles 100 concurrent users
- ✅ Frontend: vitest + React Testing Library setup
- ✅ Frontend: 10+ component tests for critical pages

**Acceptance Criteria:**
- [ ] All integration tests pass with real PostgreSQL (testcontainers)
- [ ] Concurrency tests confirm workspace A cannot access workspace B data
- [ ] Load test shows <2s p95 response time at 100 concurrent users
- [ ] Frontend tests run in CI
- [ ] Overall coverage ≥30% (enforced by jest config threshold)

**Dependencies Cleared:** XEN-GAP-0064, XEN-GAP-0065, XEN-GAP-0066, XEN-GAP-0068, XEN-GAP-0017, XEN-GAP-0067

---

## Sprint 12 — Enterprise Modules (Weeks 23–24)

**Theme:** Implement enterprise-tier modules: config management, background jobs, backup, performance.

**Estimated hours:** 80h

**Objectives:**
- Implement enterprise-config module (workspace configuration management)
- Implement enterprise-background module (background job processing with RabbitMQ)
- Begin UUID-to-native-`@db.Uuid` migration

**Gap IDs:** XEN-GAP-0011, XEN-GAP-0072

**Deliverables:**
- ✅ `enterprise-config` module: workspace configuration CRUD, schema validation, version history
- ✅ `enterprise-config` registered in `api.module.ts`
- ✅ `enterprise-background` module: job queue, worker pool, job status tracking
- ✅ RabbitMQ integration for background jobs (email, report generation, knowledge indexing)
- ✅ `enterprise-backup` module: basic backup/restore for workspace data
- ✅ `enterprise-performance` module: basic monitoring endpoints, query timing
- ✅ UUID migration plan documented (add `@db.Uuid` columns, backfill, swap, drop old)
- ✅ Zero-downtime migration script for UUID → native `@db.Uuid` on key tables

**Acceptance Criteria:**
- [ ] `enterprise-config` endpoints work with workspace isolation
- [ ] Background jobs execute via RabbitMQ (not inline in request)
- [ ] Email notifications delivered via background worker
- [ ] UUID migration script tested on staging

**Dependencies Cleared:** XEN-GAP-0043, XEN-GAP-0060, XEN-GAP-0061, XEN-GAP-0015, XEN-GAP-0016

---

## Sprint 13 — Knowledge Factory (Weeks 25–26)

**Theme:** Build the Knowledge Factory pipeline — document intake, classification, parsing, chunking, publishing.

**Estimated hours:** 80h

**Objectives:**
- Implement document intake pipeline (upload → classify → parse → extract → chunk → embed → publish)
- Connect to existing knowledge module and ai-service RAG pipeline
- Create ADRs and documentation cleanup

**Gap IDs:** XEN-GAP-0001, XEN-GAP-0078, XEN-GAP-0021, XEN-GAP-0022, XEN-GAP-0023, XEN-GAP-0024, XEN-GAP-0025, XEN-GAP-0026, XEN-GAP-0027, XEN-GAP-0028, XEN-GAP-0030

**Deliverables:**
- ✅ Knowledge Factory module: `domain/`, `application/`, `infrastructure/`, `presentation/` filled
- ✅ Intake pipeline: multi-format upload (PDF, DOCX, images), validation, deduplication (content hash)
- ✅ Document classification: rule-based + ML classifier for document type detection
- ✅ Parser orchestration: route to appropriate parser (PDF, DOCX, image/OCR)
- ✅ OCR integration: Tesseract + PaddleOCR with Persian fallback chain
- ✅ Table extraction from engineering documents
- ✅ Chunking: token-aware, section-aware, preserves equations/code blocks
- ✅ Embedding: text + image embedding generation
- ✅ Publishing workflow: review → approve → publish to knowledge module
- ✅ Knowledge Factory registered in `api.module.ts` with full endpoints
- ✅ ADRs created for: DDD adoption, Fastify choice, multi-tenant strategy, Prisma ORM
- ✅ Git workflow: feature branch strategy documented
- ✅ Semantic versioning: `v0.1.0` tag created
- ✅ `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE.md` created
- ✅ `STATUS_REPORT.md` updated
- ✅ `docs/knowledge/` and `docs/diagrams/` populated with initial content
- ✅ `tsconfig.eslint.json` created for spec file inclusion

**Acceptance Criteria:**
- [ ] Uploading a PDF engineering document → automatically classified → parsed → chunked → embedded → searchable via RAG
- [ ] Knowledge Factory endpoints return 201 on intake, 200 on publish
- [ ] ADRs document key architectural decisions
- [ ] Feature branch strategy operational
- [ ] `v0.1.0` tagged in git
- [ ] `CHANGELOG.md` tracks release history

**Dependencies Cleared:** XEN-GAP-0012, XEN-GAP-0013, XEN-GAP-0029, XEN-GAP-0054, XEN-GAP-0055, XEN-GAP-0056

---

## Sprint 14 — Polish & RC1 (Weeks 27–28)

**Theme:** Final refactoring pass, technical debt cleanup, performance optimization, RC1 readiness review.

**Estimated hours:** 80h

**Objectives:**
- Convert remaining `throw new Error` to NestJS HTTP exceptions
- Add missing database indexes
- Convert string status fields to Prisma enums
- Add missing `@updatedAt` fields
- Deprecate `is_admin` in favor of RBAC SUPER_ADMIN role
- Final security review and RC1 checklist verification

**Gap IDs:** XEN-GAP-0002, XEN-GAP-0073, XEN-GAP-0074, XEN-GAP-0075, XEN-GAP-0079, XEN-GAP-0019, XEN-GAP-0039

**Deliverables:**
- ✅ All `throw new Error(message)` → `HttpException` subclasses (~98 occurrences across 20 modules)
- ✅ Missing indexes added: 10+ FK columns indexed
- ✅ `role_permissions` — `@@index([permission_id])` added
- ✅ `knowledge_taxonomy` — `@@index([taxonomy_type, taxonomy_id])` added
- ✅ 49+ string status fields → Prisma enums (migration with data audit)
- ✅ `@updatedAt` added to 15+ mutable models
- ✅ `is_admin` deprecated → all super-admin checks use SUPER_ADMIN role via `user_roles`
- ✅ README.md rewritten as proper project overview
- ✅ MFA/2FA support added (TOTP-based)
- ✅ Performance optimization pass: profile hot paths, optimize slow queries
- ✅ Complete RC1 checklist verification (security, performance, deployment, observability, testing)
- ✅ Sign-off from Engineering, Security, DevOps, QA, AI leads

**Acceptance Criteria:**
- [ ] Zero `throw new Error` in production code — all use NestJS HTTP exceptions
- [ ] All missing indexes verified by `EXPLAIN ANALYZE` on known slow queries
- [ ] `subscriptions.status`, `invoices.status`, `payments.status` etc. use Prisma enums
- [ ] All mutable models have `updated_at` set automatically
- [ ] `is_admin` column not referenced in any authorization code
- [ ] RC1 checklist: 100% items completed
- [ ] `pnpm audit` reports 0 critical/high vulnerabilities
- [ ] Overall test coverage ≥60%

**Dependencies Cleared:** XEN-GAP-0011, XEN-GAP-0072, XEN-GAP-0001, XEN-GAP-0078, XEN-GAP-0002

---

## Summary

| Sprint | Theme | Weeks | Hours | Gaps Cleared | Critical Path |
|--------|-------|-------|-------|-------------|:------------:|
| 1 | Stop the Bleeding | 1–2 | 80 | 16 | **Yes** |
| 2 | Foundation: Production Readiness | 3–4 | 80 | 9 | **Yes** |
| 3 | Security Hardening | 5–6 | 72 | 7 | No |
| 4 | Data Layer: Schema & Queries | 7–8 | 80 | 7 | No |
| 5 | Code Quality: Errors & Logging | 9–10 | 80 | 6 | No |
| 6 | AI Foundation: Real LLM | 11–12 | 80 | 9 | **Yes** |
| 7 | AI Quality: Memory & Guardrails | 13–14 | 80 | 5 | No |
| 8 | AI Advanced: RAG & Multi-Agent | 15–16 | 80 | 3 | No |
| 9 | Testing: Unit Tests Pt 1 | 17–18 | 80 | 2 | **Yes** |
| 10 | Testing: Unit Tests Pt 2 | 19–20 | 80 | 1 | No |
| 11 | Testing: Integration & E2E | 21–22 | 80 | 1 | No |
| 12 | Enterprise Modules | 23–24 | 80 | 2 | No |
| 13 | Knowledge Factory | 25–26 | 80 | 10 | No |
| 14 | Polish & RC1 | 27–28 | 80 | 7 | **Yes** |
| **Total** | | **28 wks** | **1,112h** | **78 gaps** | **5 critical sprints** |

---

## Resource Allocation

| Role | Sprint 1–3 | Sprint 4–5 | Sprint 6–8 | Sprint 9–11 | Sprint 12–14 |
|------|:---------:|:---------:|:---------:|:----------:|:----------:|
| Backend (2) | 100% security/infra | 100% data/code quality | 50% AI integration, 50% AI quality | 100% testing | 50% enterprise, 50% polish |
| AI/ML (1) | 100% Python test fixes | 50% AI bug fixes, 50% RAG | 100% AI pipeline/agents | 50% RAG, 50% testing | 100% Knowledge Factory |
| DevOps (1) | 50% infra, 50% security | 50% DB, 50% monitoring | 50% Redis, 50% CI/CD | 100% CI/CD + K8s | 50% K8s, 50% RC1 |
