# Gap Registry — Xennic Platform

**Generated:** 2026-07-02
**Source:** 25 audit documents across Architecture, Production Readiness, Performance, Security, AI, Code Quality, Test Gap Analysis, Technical Debt, Executive Summary, and supplementary reports.

---

## Gaps

### XEN-GAP-0001 — Secrets Committed to Git (JWT Keys, API Keys, Passwords)

- **Source documents:** security.md, production-readiness.md, executive-summary.md, technical-debt.md, FULL_RECOVERY_REPORT.md
- **Category:** Security
- **Priority:** P0 (Critical)
- **Current state:** JWT RSA private key (`infrastructure/docker/secrets/jwtRS256.key`), GROQ_API_KEY, ENCRYPTION_MASTER_KEY, SIGNED_URL_SECRET, ADMIN_PASSWORD, DB passwords, and other production secrets are committed to the git repository across multiple `.env` files.
- **Target state:** All secrets removed from git history (use BFG Repo-Cleaner), keys rotated, `.env` files added to `.gitignore`, secrets injected via environment variables or Docker secrets in production.
- **File references:**
  - `infrastructure/docker/secrets/jwtRS256.key` (CRITICAL)
  - `apps/api/.env:31,37,47,48`
  - `workspace/services/engineering-service/.env:5`
  - `infrastructure/docker/.env:3,21-22`
  - `security.md:121-135,386-395`
- **Estimated effort:** 4 hours

### XEN-GAP-0002 — UserController Has Zero Authentication Guards

- **Source documents:** security.md, executive-summary.md, refactoring-roadmap.md
- **Category:** Security
- **Priority:** P0 (Critical)
- **Current state:** All endpoints in `UserController` (create, findAll, findOne, update, remove, hardDelete) have no guards — any unauthenticated user can list, create, delete, or hard-delete any user account.
- **Target state:** `@UseGuards(JwtAuthGuard, AdminGuard)` applied to all UserController endpoints; authorization checks for role-based access enforced.
- **File references:** `security.md:50-56,346-353`; `apps/api/src/modules/user/presentation/controllers/user.controller.ts:92-181`
- **Estimated effort:** 1 hour

### XEN-GAP-0003 — SSRF Vulnerability in Webhook Delivery

- **Source documents:** security.md, executive-summary.md, refactoring-roadmap.md
- **Category:** Security
- **Priority:** P0 (Critical)
- **Current state:** Webhook delivery uses `fetch(webhook.url)` without IP validation. A user can create a webhook pointing to internal services (localhost, 10.x.x.x, 169.254.169.254, etc.) enabling SSRF attacks.
- **Target state:** Webhook URL validation includes IP address blocklist for private/internal IP ranges; URL resolution checked before fetch.
- **File references:** `security.md:210-221`; `apps/api/src/modules/webhooks/application/services/webhook.service.ts:133,152-160`
- **Estimated effort:** 2 hours

### XEN-GAP-0004 — Hard Delete Endpoints Public with No Ownership Check

- **Source documents:** security.md, executive-summary.md
- **Category:** Security
- **Priority:** P0 (Critical)
- **Current state:** `UserController.hardDelete(id)` has no authentication; `WorkspaceController.hardDelete(id)` has JWT guard but no ownership/membership check — any authenticated user can hard-delete any workspace.
- **Target state:** Hard-delete endpoints require admin/super-admin role with ownership verification; confirmation step or soft-delete-only for regular users.
- **File references:** `security.md:345-348`; `user.controller.ts:178-179`; `workspace.controller.ts:153-155`
- **Estimated effort:** 1 hour

### XEN-GAP-0005 — No Helmet/Security Headers

- **Source documents:** security.md, executive-summary.md, 11_GAP_ANALYSIS.md
- **Category:** Security
- **Priority:** P0 (Critical)
- **Current state:** `@fastify/helmet` not installed or configured. API responses lack X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Content-Security-Policy, Referrer-Policy, Permissions-Policy headers.
- **Target state:** `@fastify/helmet` registered in `main.ts` with production-appropriate security header defaults.
- **File references:** `security.md:328-334,398-414`; `apps/api/src/main.ts`
- **Estimated effort:** 1 hour

### XEN-GAP-0006 — Prompt Injection Vulnerability in AI Service

- **Source documents:** security.md, ai-audit.md, executive-summary.md
- **Category:** Security
- **Priority:** P0 (Critical)
- **Current state:** User message content and calculation inputs are directly embedded into LLM system prompts without sanitization. Attackers can inject "Ignore your previous instructions" type prompts.
- **Target state:** Input sanitization layer added; prompt injection detection/filtering implemented; user input isolated from system instructions via delimiters.
- **File references:** `security.md:189-200`; `apps/api/src/modules/ai/application/services/ai.service.ts:86-90,169-197`
- **Estimated effort:** 4 hours

### XEN-GAP-0007 — Python AI Agent Never Calls LLM (Hardcoded Responses)

- **Source documents:** ai-audit.md, executive-summary.md, refactoring-roadmap.md
- **Category:** AI
- **Priority:** P0 (Critical)
- **Current state:** `ElectricalEngineerAgent._generateResponse()` uses hardcoded if/else rules and regex pattern matching — no LLM is ever called. The agent has never sent a single token to GPT/Claude/Groq.
- **Target state:** ElectricalEngineerAgent uses actual LLM calls via ModelRouter for response generation; tool-calling loop integrated for CalculationTool dispatch.
- **File references:** `ai-audit.md:169-176`; `workspace/services/ai-service/app/agents/electrical_engineer/agent.py:44-139`
- **Estimated effort:** 8 hours

### XEN-GAP-0008 — NestJS Execution Pipeline Is a Mock Echo

- **Source documents:** ai-audit.md, executive-summary.md
- **Category:** AI
- **Priority:** P0 (Critical)
- **Current state:** `ExecutionPipelineService.execute()` has a passthrough mock for the LLM call — it simply echoes the last user message back instead of invoking an actual LLM or routing to Python AI service.
- **Target state:** Execution pipeline connects to actual LLM provider or routes to Python AI service; tool calls dispatched; response streaming working end-to-end.
- **File references:** `ai-audit.md:237-239`; `apps/api/src/modules/ai-runtime/application/services/execution-pipeline.service.ts:71-73`
- **Estimated effort:** 8 hours

### XEN-GAP-0009 — Dummy Embeddings All Identical (Broken RAG)

- **Source documents:** ai-audit.md, performance.md, executive-summary.md
- **Category:** AI
- **Priority:** P0 (Critical)
- **Current state:** `embedding_pipeline.py` uses `hash(str(dimension))` as seed, producing the same random seed every call. All documents get identical random vectors; cosine similarity = 1.0 for any two documents. Fallback mode is silent (print instead of log).
- **Target state:** Content-based hashing (e.g., `hashlib.sha256(text.encode()).hexdigest()`) used for deterministic fallback embeddings; proper API-based embeddings when key available; logging for fallback mode.
- **File references:** `ai-audit.md:85-90`; `performance.md:613-620`; `workspace/services/ai-service/app/rag/embedding_pipeline.py:46,69`
- **Estimated effort:** 2 hours

### XEN-GAP-0010 — No Graceful Shutdown Handling

- **Source documents:** production-readiness.md, executive-summary.md, technical-debt.md
- **Category:** Runtime
- **Priority:** P0 (Critical)
- **Current state:** No `app.enableShutdownHooks()`, no SIGTERM/SIGINT handlers. Pod termination drops active connections, in-flight requests are hard-dropped, database connections leak.
- **Target state:** `app.enableShutdownHooks()` added; SIGTERM/SIGINT handlers with drain logic; `OnModuleDestroy` implemented in all services holding connections.
- **File references:** `production-readiness.md:229-240`; `apps/api/src/main.ts:1-149`; `technical-debt.md:83-91`
- **Estimated effort:** 2 hours

### XEN-GAP-0011 — No Environment Variable Validation

- **Source documents:** production-readiness.md, executive-summary.md, technical-debt.md
- **Category:** Infrastructure
- **Priority:** P0 (Critical)
- **Current state:** `@nestjs/config` is installed but never initialized (`ConfigModule.forRoot()` absent). All services read `process.env.*` directly with no validation. Missing env vars silently default to undefined or fallback values, causing undetected misconfiguration.
- **Target state:** `ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({...}) })` added to `api.module.ts`; `ConfigService` injected into all services instead of `process.env` reads.
- **File references:** `production-readiness.md:186-199`; `apps/api/src/api.module.ts:1-78`; `technical-debt.md:134-142`
- **Estimated effort:** 4 hours

### XEN-GAP-0012 — Unbounded In-Memory Stores (OOM Risk)

- **Source documents:** production-readiness.md, ai-audit.md, performance.md, executive-summary.md
- **Category:** Performance
- **Priority:** P0 (Critical)
- **Current state:** `InMemorySessionStore`, `InMemoryMemoryStore`, `InMemoryPromptTemplateStore` use unbounded `Map`/`Array` data structures with no eviction, TTL, or size limits. Sessions and memory entries are lost on restart.
- **Target state:** In-memory stores replaced with Redis-backed or database-backed stores; TTL-based eviction for sessions; size limits with LRU eviction for memory entries.
- **File references:** `production-readiness.md:162-176`; `ai-audit.md:261-267`; `apps/api/src/modules/ai-runtime/infrastructure/stores/*.ts`
- **Estimated effort:** 16 hours

### XEN-GAP-0013 — No Prisma Transactions (Data Inconsistency)

- **Source documents:** production-readiness.md, executive-summary.md, performance.md
- **Category:** Database
- **Priority:** P0 (Critical)
- **Current state:** Zero usage of Prisma `$transaction` across the entire codebase. Multi-step operations (workspace creation + member creation, payment + invoice + transaction, token generation + session save) are not atomic — partial failures cause data inconsistency.
- **Target state:** All multi-step operations wrapped in Prisma `$transaction`; compensation/rollback for cross-service operations (MinIO + DB); outbox pattern for critical financial transactions.
- **File references:** `production-readiness.md:372-390`; `apps/api/src/modules/auth/application/services/auth.service.ts:62-64,153-158`
- **Estimated effort:** 12 hours

### XEN-GAP-0014 — No Idempotency on POST Endpoints

- **Source documents:** production-readiness.md, executive-summary.md
- **Category:** API
- **Priority:** P0 (Critical)
- **Current state:** No `Idempotency-Key` header checking on any POST endpoint. Duplicate registration, double billing, duplicate calculations, and duplicate uploads are possible.
- **Target state:** Idempotency middleware checks `Idempotency-Key` header; processed keys stored in Redis with TTL; cached response returned for duplicate requests within the TTL window.
- **File references:** `production-readiness.md:347-366`; all POST endpoints in auth, billing, engineering, storage
- **Estimated effort:** 8 hours

### XEN-GAP-0015 — Mock Fallback in LlmProvider (Silent Data Corruption)

- **Source documents:** production-readiness.md, ai-audit.md, executive-summary.md
- **Category:** AI
- **Priority:** P0 (Critical)
- **Current state:** When LLM API call fails, `LlmProvider` falls back to `_smartMock()` which returns plausible-sounding but potentially incorrect engineering advice. In production, this means silent data corruption.
- **Target state:** Mock fallback removed in production mode (gated by `NODE_ENV`); proper error propagation and user-facing error messages on AI failure.
- **File references:** `production-readiness.md:123,215`; `apps/api/src/modules/ai/infrastructure/providers/llm.provider.ts:121,181-204`
- **Estimated effort:** 2 hours

### XEN-GAP-0016 — DB Errors Silently Swallowed (AiRepository)

- **Source documents:** production-readiness.md, ai-audit.md, executive-summary.md
- **Category:** Database
- **Priority:** P0 (Critical)
- **Current state:** `ai.repository.ts` uses `catch { return null; }` in all methods (lines 20, 29, 50, 67, 113, 136, 163). Database errors are silently swallowed, returning null — leading to silent data loss and undetected failures.
- **Target state:** All catch blocks log errors properly; domain exceptions thrown for DB failures; controller handles exceptions gracefully.
- **File references:** `production-readiness.md:71`; `apps/api/src/modules/ai/infrastructure/repositories/ai.repository.ts:20,29,50,67,113,136,163`
- **Estimated effort:** 2 hours

### XEN-GAP-0017 — Timer Leaks in Engineering and Vision Client Services

- **Source documents:** production-readiness.md, executive-summary.md
- **Category:** Runtime
- **Priority:** P0 (Critical)
- **Current state:** `EngineeringClientService` and `VisionClientService` use `AbortController` with `setTimeout` but never clear the timer if fetch fails before timeout. Health checks also leak timers.
- **Target state:** Replace manual `AbortController + setTimeout` with `AbortSignal.timeout()`; use `try/finally` with `clearTimeout()` where manual abort is needed.
- **File references:** `production-readiness.md:100-104`; `apps/api/src/modules/engineering/infrastructure/http/engineering-client.service.ts:41,48,100-101`; `apps/api/src/modules/vision/infrastructure/http/vision-client.service.ts:41,53,79`
- **Estimated effort:** 2 hours

### XEN-GAP-0018 — No Readiness/Liveness Probes for Kubernetes

- **Source documents:** production-readiness.md, executive-summary.md, technical-debt.md
- **Category:** Infrastructure
- **Priority:** P0 (Critical)
- **Current state:** Health module returns only static `'ok'` with no dependency checks. No separate `/health/readiness` or `/health/liveness` endpoints. Cannot deploy on Kubernetes — orchestrator cannot detect DB/Redis/Qdrant outages.
- **Target state:** Health service probes all dependencies (DB ping, Redis, MinIO, Qdrant); separate readiness and liveness endpoints using `@nestjs/terminus`.
- **File references:** `production-readiness.md:246-295`; `apps/api/src/modules/health/health.service.ts:6-11`
- **Estimated effort:** 4 hours

### XEN-GAP-0019 — Consultations Module Missing Workspace Isolation

- **Source documents:** security.md, executive-summary.md
- **Category:** Security
- **Priority:** P0 (Critical)
- **Current state:** `ConsultationsController.findOne(id)`, `aiReply(id)`, and `updateStatus(id)` do not check workspace membership before returning or modifying consultation data — cross-workspace data access possible.
- **Target state:** All ConsultationsController endpoints verify workspace membership before returning data; WorkspaceGuard or explicit workspaceId check added.
- **File references:** `security.md:97-105`; `apps/api/src/modules/consultations/presentation/controllers/consultations.controller.ts:42,78,86`
- **Estimated effort:** 1 hour

### XEN-GAP-0020 — No Redis Caching Layer

- **Source documents:** performance.md, executive-summary.md
- **Category:** Performance
- **Priority:** P0 (Critical)
- **Current state:** Zero Redis integration across the entire codebase. No cache for subscription plan lookups (called on EVERY calculation request), workspace settings, user permissions, or rate limiting. Hot-path queries hit the database every time.
- **Target state:** Redis caching layer added for hot-path data: subscription plans (5-min TTL), workspace settings, user permissions/roles, rate limiting counters, and session storage.
- **File references:** `performance.md:248-295`; `apps/api/src/modules/subscription/application/services/subscription.service.ts:51-53`
- **Estimated effort:** 20 hours

### XEN-GAP-0021 — Fake Streaming (No Real SSE)

- **Source documents:** performance.md, ai-audit.md, executive-summary.md
- **Category:** AI
- **Priority:** P0 (Critical)
- **Current state:** `LlmProvider.chatStream()` waits for full LLM response, splits into words, and yields with artificial 15ms delays. Python agent streaming is identical. TTFB is same as non-streaming. This is not real streaming.
- **Target state:** Real SSE-based streaming using OpenAI/Groq streaming API with proper backpressure; eliminate artificial delays; integrate with `StreamingResponseManager` for proper flow control.
- **File references:** `performance.md:426-468`; `apps/api/src/modules/ai/infrastructure/providers/llm.provider.ts:171-177`; `workspace/services/ai-service/app/agents/electrical_engineer/agent.py:163-171`
- **Estimated effort:** 12 hours

### XEN-GAP-0022 — PermissionsGuard Fail-Open (Security Bypass)

- **Source documents:** security.md, executive-summary.md, refactoring-roadmap.md
- **Category:** Security
- **Priority:** P1 (High)
- **Current state:** `PermissionsGuard` catches unexpected errors and returns `true` (allow). Combined with `AuthorizationService._getMemberRole` fallback that grants `['*']` (all permissions) to any workspace member, this creates a privilege escalation path.
- **Target state:** PermissionsGuard returns `false` (deny) on unexpected errors (fail-closed); `_getMemberRole` fallback returns specific member permissions instead of wildcard.
- **File references:** `security.md:48,354-359`; `apps/api/src/modules/rbac/infrastructure/guards/permissions.guard.ts:73-74`; `apps/api/src/modules/rbac/application/services/authorization.service.ts:101`
- **Estimated effort:** 2 hours

### XEN-GAP-0023 — Duplicate `analyze_document()` Method Override

- **Source documents:** ai-audit.md, executive-summary.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** `analyze_document()` method defined twice in `DocumentAnalystAgent`. The second definition (lines 282-398) silently overrides the first (lines 77-172) at runtime. The first version has different error handling.
- **Target state:** First duplicate definition removed; second version kept with improved error handling; all callers verified to work correctly.
- **File references:** `ai-audit.md:126,191-192`; `workspace/services/ai-service/app/agents/document_analyst/agent.py:77-172,282-398`
- **Estimated effort:** 0.5 hours

### XEN-GAP-0024 — `req.workspaceId` Typo in ai-runtime Controller

- **Source documents:** ai-audit.md, executive-summary.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** AI-Runtime controller uses `req.workspaceId` but the WorkspaceGuard populates `req.workspaceId` (property name typo). Sessions are created with `workspaceId = undefined`, breaking multi-tenant isolation.
- **Target state:** Property name corrected to `req.workspaceId` matching the guard's injected property.
- **File references:** `ai-audit.md:240`; `apps/api/src/modules/ai-runtime/presentation/controllers/ai-runtime.controller.ts:54`
- **Estimated effort:** 0.2 hours

### XEN-GAP-0025 — No Cross-Encoder Re-Ranking in RAG

- **Source documents:** ai-audit.md, performance.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** RAG retrieval sorts results by initial cosine similarity only. No cross-encoder re-ranking model applied. Top candidates may not be most contextually relevant.
- **Target state:** Cross-encoder re-ranker (e.g., BAAI/bge-reranker-v2-m3) applied to top 20 retrieval results; re-scored results used for context building.
- **File references:** `ai-audit.md:66-68`; `workspace/services/ai-service/app/rag/retriever.py:156`
- **Estimated effort:** 8 hours

### XEN-GAP-0026 — No Hybrid Search (Dense + Sparse)

- **Source documents:** ai-audit.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** Pure vector search only — no BM25/sparse retrieval or reciprocal rank fusion. Engineering standards search needs exact keyword matching (e.g., "IEC 60364").
- **Target state:** Hybrid search implemented with BM25 sparse retrieval; Reciprocal Rank Fusion (RRF) for combining dense and sparse results.
- **File references:** `ai-audit.md:62,66`; `workspace/services/ai-service/app/rag/retriever.py:68`
- **Estimated effort:** 12 hours

### XEN-GAP-0027 — No RAG Context Injection in Chat

- **Source documents:** ai-audit.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** `AiService.sendMessage()` sends user messages + conversation history to LLM with system prompt but no RAG context is injected. The LLM responds from its training data alone, without access to the organization's knowledge base.
- **Target state:** RAG retriever invoked before each chat message; top-N relevant document chunks injected into the prompt context for source-grounded responses.
- **File references:** `ai-audit.md:469`; `apps/api/src/modules/ai/application/services/ai.service.ts:75-152`
- **Estimated effort:** 8 hours

### XEN-GAP-0028 — All Python Tool Functions Are Dead Code

- **Source documents:** ai-audit.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** 10+ PydanticAI-compatible tool functions in `tools.py` (Ohm's Law, Power, Cable Sizing, Transformer, etc.) are fully defined but never registered or invoked by any agent. The Electrical Engineer Agent uses hardcoded if/else instead.
- **Target state:** Tool functions connected to agent via OpenAI function calling or ReAct pattern; agent dispatches calculations to engineering service via tools.
- **File references:** `ai-audit.md:443-449`; `workspace/services/ai-service/app/agents/electrical_engineer/tools.py:25-276`
- **Estimated effort:** 8 hours

### XEN-GAP-0029 — No Citation Engine

- **Source documents:** ai-audit.md, 03_KNOWLEDGE_FACTORY_AUDIT.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** No citation engine exists. The `Source` Pydantic model is defined but never populated. Electrical Engineer agent returns `"sources": []`. No document chunk tracking in responses.
- **Target state:** Citation engine tracks which document chunks/standards informed each claim; citations formatted in responses with reference links to source documents.
- **File references:** `ai-audit.md:344-367`; `workspace/services/ai-service/app/schemas/outputs.py:29-34`
- **Estimated effort:** 12 hours

### XEN-GAP-0030 — No Hallucination Guardrails

- **Source documents:** ai-audit.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** No source grounding enforcement, no fact-checking against knowledge base, no response validation against sources, no "I don't know" fallback, no uncertainty communication. Mock responses give plausible but incorrect engineering advice.
- **Target state:** Response grounding check (claim-to-source verification); unanswerable detection; confidence scoring; uncertainty communication in responses.
- **File references:** `ai-audit.md:456-483`; `workspace/services/ai-service/app/agents/electrical_engineer/agent.py:53-60`
- **Estimated effort:** 16 hours

### XEN-GAP-0031 — No Evidence Chain / Provenance Tracking

- **Source documents:** ai-audit.md, 03_KNOWLEDGE_FACTORY_AUDIT.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** `ExecutionContext` has no `retrievedDocuments` or `usedSources` fields. Pipeline stages tracked but which documents were retrieved or which tools were invoked is not recorded. No provenance metadata on responses.
- **Target state:** Evidence chain tracks retrieved documents, invoked tools, and intermediate results through each pipeline stage; provenance metadata attached to all AI responses.
- **File references:** `ai-audit.md:369-383`; `apps/api/src/modules/ai-runtime/domain/types/execution.types.ts`
- **Estimated effort:** 8 hours

### XEN-GAP-0032 — No Confidence Engine

- **Source documents:** ai-audit.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** Confidence is LLM-reported only (self-reported). No independent confidence scoring via logprob analysis, consistency checks, or source-grounded verification. No confidence for general chat responses.
- **Target state:** Confidence engine with logprob analysis, response consistency checking, source grounding strength scoring, and calibrated confidence thresholds.
- **File references:** `ai-audit.md:386-404`; `apps/api/src/modules/ai/application/services/ai.service.ts:156-229`
- **Estimated effort:** 12 hours

### XEN-GAP-0033 — No Conflict Resolution for RAG Sources

- **Source documents:** ai-audit.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** No code handles conflicting sources. `VectorStore.search()` returns results sorted by similarity — if two documents give conflicting values, there is no detection or resolution mechanism.
- **Target state:** Conflict detection identifies when retrieved documents give contradictory information; temporal recency weighting, authority scoring, and consensus-based resolution implemented.
- **File references:** `ai-audit.md:486-498`; `workspace/services/ai-service/app/rag/vector_store.py`
- **Estimated effort:** 12 hours

### XEN-GAP-0034 — No Token-Aware Chunking

- **Source documents:** ai-audit.md
- **Category:** AI
- **Priority:** P1 (High)
- **Current state:** Chunker uses fixed word count (500 words) regardless of model context window. No token-aware chunking, no hierarchical chunking, no section-header detection, no code/equation preservation.
- **Target state:** Token-count-based chunking using model-specific tokenizers; hierarchical chunking with section header awareness; code block and equation preservation.
- **File references:** `ai-audit.md:43-47`; `workspace/services/ai-service/app/rag/chunker.py:54-64`
- **Estimated effort:** 6 hours

### XEN-GAP-0035 — N+1 Query Patterns

- **Source documents:** performance.md, executive-summary.md
- **Category:** Performance
- **Priority:** P1 (High)
- **Current state:** Multiple N+1 query patterns: `AiRepository.findConversation` unconditionally loads all messages; `KnowledgeService.getDashboardAnalytics` fetches ALL analytics and filters in-memory; `SubscriptionService.getActivePlan` uses serial queries instead of JOIN.
- **Target state:** All database queries use JOINs, eager loading, or batch loading patterns; analytics queries push filtering and aggregation to database; redundant re-fetches eliminated.
- **File references:** `performance.md:11-81`; `apps/api/src/modules/ai/infrastructure/repositories/ai.repository.ts:42-51`; `apps/api/src/modules/knowledge/application/services/knowledge.service.ts:470-498`
- **Estimated effort:** 8 hours

### XEN-GAP-0036 — 30+ `SELECT *` in Raw SQL Queries

- **Source documents:** performance.md, executive-summary.md
- **Category:** Performance
- **Priority:** P1 (High)
- **Current state:** 30+ raw SQL queries across repositories use `SELECT *` instead of selecting only needed columns. Projects table has 17 columns; messages table has JSON/metadata. Unnecessary data transfer on every query.
- **Target state:** All `SELECT *` replaced with explicit column lists matching entity mapper requirements; data transfer reduced by 40-60% on affected queries.
- **File references:** `performance.md:84-102`; files across project, ai, api-keys, auth, notification, engineering, feature-flags, consultations repositories
- **Estimated effort:** 4 hours

### XEN-GAP-0037 — Manual UPSERT Instead of Prisma Native

- **Source documents:** performance.md
- **Category:** Performance
- **Priority:** P1 (High)
- **Current state:** Multiple repositories use manual `SELECT` + `UPDATE`/`INSERT` (2 round-trips) instead of Prisma's native `upsert` (1 round-trip). Pattern found across project repository and LLM provider retry logic.
- **Target state:** All manual UPSERT patterns replaced with Prisma's native `upsert` method, reducing database round-trips by 50%.
- **File references:** `performance.md:146-161`; `apps/api/src/modules/project/infrastructure/repositories/project.repository.ts:20-23,140-155`
- **Estimated effort:** 2 hours

### XEN-GAP-0038 — Raw SQL Instead of Prisma Client (AiRepository)

- **Source documents:** performance.md, technical-debt.md
- **Category:** Database
- **Priority:** P1 (High)
- **Current state:** Entire `AiRepository` uses `$queryRaw` and `$executeRaw` instead of Prisma's generated types (`prisma.agents.findFirst`, etc.). Bypasses Prisma query engine optimizations (batch, cache, connection pooling), type safety, and middleware/hooks.
- **Target state:** Simple CRUD operations migrated to Prisma client; complex queries use raw SQL with typed parsers; Prisma middleware functional for AI repository operations.
- **File references:** `performance.md:164-173`; `apps/api/src/modules/ai/infrastructure/repositories/ai.repository.ts`; `technical-debt.md:362-379`
- **Estimated effort:** 8 hours

### XEN-GAP-0039 — Sequential Multi-Collection RAG Retrieval

- **Source documents:** performance.md, ai-audit.md
- **Category:** Performance
- **Priority:** P1 (High)
- **Current state:** Multi-collection retrieval in `retriever.py` searches collections sequentially with a `for` loop. With 3+ collections, search latency is serial — using `asyncio.gather` would be 3x faster.
- **Target state:** All parallelizable collection searches use `asyncio.gather` for concurrent execution; timeout per collection to bound latency.
- **File references:** `performance.md:222-234,474-478`; `workspace/services/ai-service/app/rag/retriever.py:105-113,145-153`
- **Estimated effort:** 2 hours

### XEN-GAP-0040 — Synchronous File I/O in Async Context (file_store.py)

- **Source documents:** performance.md
- **Category:** Performance
- **Priority:** P1 (High)
- **Current state:** `file_store.py` uses synchronous `open/read/write` (`open()`, `json.load()`, `json.dump()`) within async functions. This blocks the Python event loop, degrading all concurrent requests.
- **Target state:** `aiofiles` used for async file I/O; `orjson` for faster JSON serialization/deserialization.
- **File references:** `performance.md:502-519`; `workspace/services/ai-service/app/rag/file_store.py:28-37`
- **Estimated effort:** 2 hours

### XEN-GAP-0041 — Full Content Loaded in List Views

- **Source documents:** performance.md, executive-summary.md
- **Category:** Performance
- **Priority:** P1 (High)
- **Current state:** `knowledge.service.ts:findPublished` loads full `content` JSON column (potentially 50-500KB per article) for every article in a paginated list view. Users browsing articles need only title, slug, status, published_at.
- **Target state:** List view queries select only required columns; full content loaded only for detail view; Prisma `select` used for field-specific queries.
- **File references:** `performance.md:308-311,566-571`; `apps/api/src/modules/knowledge/application/services/knowledge.service.ts:65-97`
- **Estimated effort:** 2 hours

### XEN-GAP-0042 — Qdrant `wait=True` on Every Upsert

- **Source documents:** performance.md
- **Category:** Performance
- **Priority:** P1 (High)
- **Current state:** Every Qdrant upsert uses `wait=True`, blocking until all replicas confirm. For bulk document ingestion, this is 5-10x slower than necessary.
- **Target state:** Bulk upserts use `wait=False` with a single `await client.collection.ensure()` at the end; single document upserts may still use `wait=True` for consistency guarantees.
- **File references:** `performance.md:196-208`; `workspace/services/ai-service/app/rag/qdrant_store.py:104-108`
- **Estimated effort:** 1 hour

### XEN-GAP-0043 — Missing Cascade Deletes on 20+ Prisma Relations

- **Source documents:** technical-debt.md
- **Category:** Database
- **Priority:** P1 (High)
- **Current state:** 20+ relations in Prisma schema lack `onDelete: Cascade` or `onDelete: SetNull`. Deleting a workspace/project/user leaves orphaned rows across subscriptions, orders, conversations, audit_logs, etc. DB bloat grows unbounded.
- **Target state:** Appropriate `onDelete` actions added to all child relations; existing orphaned data audited and cleaned up before migration.
- **File references:** `technical-debt.md:22-56`; `prisma/schema.prisma:277,292,318,339,358,378,402-405,431,498-500,559-560,593-595,1003-1004,1021,1045-1046,1144,1163-1164`
- **Estimated effort:** 8 hours

### XEN-GAP-0044 — 49+ String Fields Should Be Prisma Enums

- **Source documents:** technical-debt.md, database-audit.md
- **Category:** Database
- **Priority:** P1 (High)
- **Current state:** 49+ status/role/type fields across the schema use plain `String` instead of Prisma enums. Invalid values can be inserted via raw SQL with no DB-level validation. No IDE support for valid values.
- **Target state:** Prisma enums defined for all status/role/type fields (workspace_members.role, subscriptions.status, invoices.status, knowledge.status, etc.); migration handles existing data.
- **File references:** `technical-debt.md:207-240`; `prisma/schema.prisma` (multiple models)
- **Estimated effort:** 16 hours

### XEN-GAP-0045 — UUIDs Stored as TEXT Instead of `@db.Uuid`

- **Source documents:** technical-debt.md
- **Category:** Database
- **Priority:** P1 (High)
- **Current state:** All 40+ entity tables store UUIDs as `String` (TEXT) instead of native `@db.Uuid`. Indexes are ~30% larger, JOINs slower, no `gen_random_uuid()` at database level — UUIDs generated client-side.
- **Target state:** `@db.Uuid` annotation added to all `id` and `*_id` columns; zero-downtime migration strategy (add new columns, backfill, swap, drop old).
- **File references:** `technical-debt.md:95-107`; `prisma/schema.prisma` (all models)
- **Estimated effort:** 24 hours

### XEN-GAP-0046 — Missing Foreign Key Indexes (10+ FKs)

- **Source documents:** technical-debt.md, performance.md
- **Category:** Performance
- **Priority:** P1 (High)
- **Current state:** 10+ foreign key columns lack database indexes. Queries filtering by these FKs perform full table scans. With table growth (>100k rows), response times degrade exponentially.
- **Target state:** Indexes added to all unindexed FK columns: `workspace_members.user_id`, `project_notes.created_by`, `project_reports.file_id`, `calculations.user_id`, `calculations.project_id`, `ai_usage.agent_id`, `file_versions.file_id`, `order_items.product_id`, `product_translations.product_id`, `subscription_payments.invoice_id`, `subscription_payments.payment_id`.
- **File references:** `technical-debt.md:275-298`; `prisma/schema.prisma`
- **Estimated effort:** 2 hours

### XEN-GAP-0047 — Missing Composite Indexes for Common Query Patterns

- **Source documents:** performance.md
- **Category:** Database
- **Priority:** P2 (Medium)
- **Current state:** Missing composite indexes on commonly filtered columns: `messages(conversation_id, created_at)` for ORDER BY; `knowledge(workspace_id, status, is_active)` for filtering; `usage_logs(workspace_id, feature, logged_at)` for monthly aggregation.
- **Target state:** Composite indexes added for all common query patterns identified in the audit.
- **File references:** `performance.md:107-140`; `prisma/schema.prisma:577,294-296`
- **Estimated effort:** 2 hours

### XEN-GAP-0048 — Missing `@updatedAt` on Mutable Models

- **Source documents:** technical-debt.md
- **Category:** Database
- **Priority:** P2 (Medium)
- **Current state:** 15+ mutable models lack `updated_at DateTime @updatedAt`. Cannot track when critical records were last modified. Feature flags, API keys, webhooks, notifications, and other mutable entities have no automatic timestamp.
- **Target state:** `updated_at @updatedAt` added to all mutable models: sessions, password_reset_tokens, workspace_members, workspace_invitations, payments, transactions, calculation_templates, engineering_standards, agents, tags, product_translations, api_keys, webhooks, feature_flags, notifications, files.
- **File references:** `technical-debt.md:244-272`; `prisma/schema.prisma`
- **Estimated effort:** 4 hours

### XEN-GAP-0049 — In-Memory Analytics Sorting (CPU Hotspot)

- **Source documents:** performance.md
- **Category:** Performance
- **Priority:** P2 (Medium)
- **Current state:** `KnowledgeService.getDashboardAnalytics` fetches all analytics rows across all workspaces, filters in-memory, then sorts and slices in application memory. Should use `ORDER BY views DESC LIMIT 10` SQL.
- **Target state:** Analytics aggregation pushed to database with proper `GROUP BY`, `ORDER BY`, and `LIMIT` clauses; application-level sorting eliminated.
- **File references:** `performance.md:326-338`; `apps/api/src/modules/knowledge/application/services/knowledge.service.ts:485-488`
- **Estimated effort:** 2 hours

### XEN-GAP-0050 — No Circuit Breaker for External Services

- **Source documents:** performance.md, production-readiness.md, ai-audit.md
- **Category:** Runtime
- **Priority:** P2 (Medium)
- **Current state:** No circuit breaker pattern for Engineering/Vision/AI service calls. A slow or overloaded downstream service causes API workers to accumulate and exhaust memory/connections.
- **Target state:** Circuit breaker implemented for all external HTTP calls (Engineering, Vision, AI services, Zarinpal, webhook delivery); fallback or cached response when circuit is open.
- **File references:** `performance.md:480-484`; `apps/api/src/modules/engineering/infrastructure/http/engineering-client.service.ts`; `ai-audit.md:447`
- **Estimated effort:** 8 hours

### XEN-GAP-0051 — OpenAPI Regenerated on Every Build

- **Source documents:** performance.md, executive-summary.md
- **Category:** DevOps
- **Priority:** P2 (Medium)
- **Current state:** OpenAPI spec regenerated unconditionally on every `tsc` build via `pnpm generate:openapi`. Even when no API contracts changed, this adds ~5-15s overhead per build.
- **Target state:** OpenAPI generation conditional on source file changes; excluded from CI build; or cached until API-contract files change.
- **File references:** `performance.md:400-419`; `apps/api/package.json:12,14`
- **Estimated effort:** 2 hours

### XEN-GAP-0052 — Cross-Module Coupling Causing Eager Loading

- **Source documents:** performance.md
- **Category:** Architecture
- **Priority:** P2 (Medium)
- **Current state:** Deep cross-module import paths (e.g., `engineering.service.ts` imports `SubscriptionService` with 7-level relative path). Forces NestJS to resolve subscription module before engineering module, cascading slow startup with 29 modules.
- **Target state:** Cross-module communication via shared interfaces or event bus; direct service imports replaced with module-based DI or message passing.
- **File references:** `performance.md:526-532`; `apps/api/src/modules/engineering/application/services/engineering.service.ts:10`
- **Estimated effort:** 4 hours

### XEN-GAP-0053 — Pretty-Printed JSON in LLM Prompts

- **Source documents:** performance.md, executive-summary.md
- **Category:** Performance
- **Priority:** P2 (Medium)
- **Current state:** `JSON.stringify(inputs, null, 2)` and `JSON.stringify(result, null, 2)` used in prompt building. Pretty-printing increases token count by 30-50% for no LLM benefit, adding token cost and latency.
- **Target state:** Compact `JSON.stringify(inputs)` without spacing used for LLM prompts; pretty-print reserved for debugging/logging.
- **File references:** `performance.md:366-374,546-554`; `apps/api/src/modules/ai/application/services/ai.service.ts:169-170`
- **Estimated effort:** 1 hour

### XEN-GAP-0054 — `health` Module Flat Structure (No DDD)

- **Source documents:** architecture-audit.md
- **Category:** Architecture
- **Priority:** P2 (Medium)
- **Current state:** `health/` module has a flat file structure with no `domain/`, `application/`, `infrastructure/`, `presentation/` layers. Only 3 of 25 modules deviate from DDD Clean Architecture.
- **Target state:** Health module refactored to follow DDD layer structure; health service properly depends on injected repository interfaces.
- **File references:** `architecture-audit.md:12,17`; `apps/api/src/modules/health/`
- **Estimated effort:** 2 hours

### XEN-GAP-0055 — Prisma Client Leaked into Application Layer

- **Source documents:** architecture-audit.md, code-quality.md, executive-summary.md
- **Category:** Architecture
- **Priority:** P1 (High)
- **Current state:** Several modules import `PrismaClient` and use `prisma.*` directly in application services: `admin.service.ts` (entire class), `auth.service.ts` (raw queries at lines 188,203,221), `knowledge.service.ts` (20+ direct calls), `taxonomy.controller.ts` (worst — controller queries Prisma directly).
- **Target state:** All `prisma.*` calls moved from application/presentation layers to infrastructure repositories; services depend on repository interfaces only.
- **File references:** `architecture-audit.md:22,104-108`; `code-quality.md:156-178`; `apps/api/src/modules/admin/application/services/admin.service.ts:20-248`
- **Estimated effort:** 12 hours

### XEN-GAP-0056 — `AiService` Depends on `LlmProvider` Directly (Infrastructure Leak)

- **Source documents:** architecture-audit.md
- **Category:** Architecture
- **Priority:** P2 (Medium)
- **Current state:** `AiService` imports and depends on `LlmProvider` (infrastructure implementation) directly instead of through an interface. No `ILlmProvider` interface exists for hexagonal architecture compliance.
- **Target state:** `ILlmProvider` interface extracted; `AiService` depends on interface only; `LlmProvider` implements interface; DI injects implementation.
- **File references:** `architecture-audit.md:106,126,183-186`; `apps/api/src/modules/ai/application/services/ai.service.ts:7`
- **Estimated effort:** 3 hours

### XEN-GAP-0057 — 5 Enterprise Stub Modules Empty

- **Source documents:** architecture-audit.md, technical-debt.md, 11_GAP_ANALYSIS.md, executive-summary.md
- **Category:** Architecture
- **Priority:** P2 (Medium)
- **Current state:** `enterprise-background/`, `enterprise-backup/`, `enterprise-config/`, `enterprise-performance/`, and `knowledge-factory/` are empty directories with DDD folder scaffolding but zero `.ts` files. Not registered in `api.module.ts`.
- **Target state:** Either implemented with full DDD structure or removed from main branch with feature roadmap entries documenting planned scope.
- **File references:** `architecture-audit.md:13`; `technical-debt.md:186-204`; `03_KNOWLEDGE_FACTORY_AUDIT.md:7-21`
- **Estimated effort:** 80+ hours (if implementing)

### XEN-GAP-0058 — `@nestjs/platform-express` Dead Dependency

- **Source documents:** technical-debt.md
- **Category:** Infrastructure
- **Priority:** P2 (Medium)
- **Current state:** `@nestjs/platform-express` installed as dependency but adapter is Fastify. Could accidentally switch to Express in misconfigured deployment; adds 3MB to production image.
- **Target state:** `@nestjs/platform-express` removed from `apps/api/package.json`.
- **File references:** `technical-debt.md:110-118`; `apps/api/package.json`
- **Estimated effort:** 0.2 hours

### XEN-GAP-0059 — No CI/CD Pipeline

- **Source documents:** technical-debt.md, 11_GAP_ANALYSIS.md, executive-summary.md
- **Category:** DevOps
- **Priority:** P1 (High)
- **Current state:** No `.github/` directory. No automated lint, test, typecheck, build, or deploy pipeline. Every merge is a manual deploy risk. Regressions ship silently.
- **Target state:** GitHub Actions CI pipeline with jobs for: install → lint → typecheck → test (unit + e2e) → build; deploy job for staging on push to main; quality gates block merges on failure.
- **File references:** `technical-debt.md:122-131`; `11_GAP_ANALYSIS.md:14`
- **Estimated effort:** 16 hours

### XEN-GAP-0060 — Lint Broken for 4 of 6 Packages

- **Source documents:** 07_BUILD_REPORT.md, 11_GAP_ANALYSIS.md, executive-summary.md
- **Category:** DevOps
- **Priority:** P1 (High)
- **Current state:** `apps/api`, `apps/web`, `@xennic/database`, `@xennic/shared` have no `lint` script or lint fails. Only `@xennic/config` and `@xennic/types` pass lint. Web build hangs (Next.js timeout).
- **Target state:** All 6 packages have working lint scripts; ESLint configuration unified; web build timeout issue resolved.
- **File references:** `07_BUILD_REPORT.md:53-78`; `apps/api/package.json`; `apps/web/package.json`
- **Estimated effort:** 8 hours

### XEN-GAP-0061 — 95 Bare `catch` Blocks Silently Swallowing Errors

- **Source documents:** code-quality.md, executive-summary.md, FULL_RECOVERY_REPORT.md
- **Category:** Code Quality
- **Priority:** P1 (High)
- **Current state:** ~95 bare catch blocks across the codebase, including `.catch(() => {})` (silent failure), `.catch(() => null)` (swallowed errors), and empty catch bodies. Production systems fail silently.
- **Target state:** All catch blocks log errors (structured Logger); re-throw domain exceptions or handle explicitly; bare catch blocks eliminated.
- **File references:** `code-quality.md:248-275`; various files across api-keys, admin, notification, and all repositories
- **Estimated effort:** 8 hours

### XEN-GAP-0062 — 54 `console.*` Calls Instead of Structured Logger

- **Source documents:** code-quality.md, production-readiness.md, executive-summary.md
- **Category:** Code Quality
- **Priority:** P1 (High)
- **Current state:** 54 `console.log`/`console.error` calls across the codebase instead of injected `Logger`. Audit events logged to console instead of audit table. Cannot filter/query logs by level, context, or service.
- **Target state:** All `console.*` replaced with injected NestJS `Logger`; audit events pushed to `audit_logs` DB table; structured JSON logging with context fields.
- **File references:** `code-quality.md:260-268`; `production-readiness.md:42-51`; `apps/api/src/main.ts:136-146`
- **Estimated effort:** 4 hours

### XEN-GAP-0063 — 50+ `as any` Casts Bypassing Type Safety

- **Source documents:** code-quality.md, technical-debt.md, executive-summary.md
- **Category:** Code Quality
- **Priority:** P1 (High)
- **Current state:** 452 uses of `any` type across 278 source files. Raw SQL query wrappers, DTO mappings, and generic handlers use `as any` casts. TypeScript cannot catch runtime type errors.
- **Target state:** All `any` types replaced with proper TypeScript types/generics; `noImplicitAny` and `strictNullChecks` enabled; raw SQL wrappers use typed parsers.
- **File references:** `code-quality.md:381`; `technical-debt.md:148-161`; `apps/api/src/shared/filters/all-exceptions.filter.ts` (5 `as any`)
- **Estimated effort:** 20 hours

### XEN-GAP-0064 — 6 Classes Over 300 Lines (SRP Violations)

- **Source documents:** code-quality.md, executive-summary.md
- **Category:** Code Quality
- **Priority:** P1 (High)
- **Current state:** `knowledge.service.ts` (801 lines — CRUD, taxonomy, analytics, formulas, versions), `admin.service.ts` (583 lines — stats, users, workspaces, notifications), `billing.repository.ts` (380), `billing.service.ts` (360), `workspace.service.ts` (394), `marketplace.repository.ts` (357). All violate Single Responsibility Principle.
- **Target state:** Large classes split into focused services following SRP: `knowledge.service.ts` → `KnowledgeCrudService`, `TaxonomyService`, `AnalyticsService`, `FormulaService`; `admin.service.ts` → `AdminStatsService`, `AdminUserService`, `AdminWorkspaceService`.
- **File references:** `code-quality.md:110-124`; `apps/api/src/modules/knowledge/application/services/knowledge.service.ts`; `apps/api/src/modules/admin/application/services/admin.service.ts`
- **Estimated effort:** 24 hours

### XEN-GAP-0065 — Pagination Boilerplate Duplicated ~25 Times

- **Source documents:** code-quality.md, architecture-audit.md
- **Category:** Code Quality
- **Priority:** P2 (Medium)
- **Current state:** Identical pagination patterns (`page = dto.page ?? 1`, `limit = dto.limit ?? 10`, `offset = (page - 1) * limit`, `meta: { page, limit, total, totalPages }`) duplicated in ~25 locations across all modules.
- **Target state:** Shared pagination utility extracted to `@xennic/shared`; all modules import and use the shared pagination function.
- **File references:** `code-quality.md:50-73`; modules across billing, project, webhooks, feature-flags, search, marketplace, knowledge, standards, api-keys, notification
- **Estimated effort:** 4 hours

### XEN-GAP-0066 — CORS `["*"]` in Python Microservices

- **Source documents:** code-quality.md, executive-summary.md
- **Category:** Security
- **Priority:** P1 (High)
- **Current state:** Vision-service and engineering-service have `origins=["*"]` in their CORS configuration. This allows any website to make requests to these services, bypassing browser same-origin policy.
- **Target state:** CORS origins restricted per environment — production uses specific origins (e.g., API gateway domain); development can use wildcard.
- **File references:** `code-quality.md:358,367`; `workspace/services/vision-service/app/main.py:72`; `workspace/services/engineering-service/src/main.py:77`
- **Estimated effort:** 1 hour

### XEN-GAP-0067 — `password_reset_tokens` Has No Relation to `users`

- **Source documents:** architecture-audit.md, technical-debt.md
- **Category:** Database
- **Priority:** P2 (Medium)
- **Current state:** `password_reset_tokens` model is standalone with no Prisma relation to `users` table. Orphaned tokens accumulate; no cascade cleanup when user is deleted; raw Prisma queries needed for JOIN.
- **Target state:** `user users @relation(fields: [user_id], references: [id], onDelete: Cascade)` added to `password_reset_tokens`; relation added to `users` model.
- **File references:** `architecture-audit.md:142`; `technical-debt.md:59-67`; `prisma/schema.prisma`
- **Estimated effort:** 0.5 hours

### XEN-GAP-0068 — `user_roles` Has No Relation to `workspace`

- **Source documents:** architecture-audit.md
- **Category:** Database
- **Priority:** P2 (Medium)
- **Current state:** `user_roles` entity has no relation to `workspaces`. Missing aggregate connection between RBAC and tenant context.
- **Target state:** `workspace workspaces @relation(fields: [workspace_id], references: [id])` added to `user_roles` model.
- **File references:** `architecture-audit.md:143`; `prisma/schema.prisma`
- **Estimated effort:** 0.5 hours

### XEN-GAP-0069 — Missing `@map`/`@@schema` Annotations for Better Schema Organization

- **Source documents:** architecture-audit.md
- **Category:** Database
- **Priority:** P3 (Low)
- **Current state:** No `@@map` or `@@schema` annotations in Prisma schema for organizing models into logical groups.
- **Target state:** `@@schema` annotations added to organize models by domain context; `@@map` for explicit table names.
- **File references:** `architecture-audit.md:217`
- **Estimated effort:** 2 hours

### XEN-GAP-0070 — No MFA/2FA Support

- **Source documents:** security.md
- **Category:** Security
- **Priority:** P2 (Medium)
- **Current state:** No multi-factor authentication support. Application relies solely on password + JWT for authentication.
- **Target state:** TOTP-based 2FA implemented; backup codes provided; QR code setup flow for authenticator apps.
- **File references:** `security.md:26`
- **Estimated effort:** 12 hours

### XEN-GAP-0071 — No Account Lockout After Failed Attempts

- **Source documents:** security.md
- **Category:** Security
- **Priority:** P2 (Medium)
- **Current state:** No account lockout mechanism. Attackers can brute-force passwords indefinitely at the rate limit boundary (5 req/60s).
- **Target state:** Account lockout after N consecutive failed login attempts; exponential backoff; lockout duration configurable; notified via email on lockout.
- **File references:** `security.md:27`; `apps/api/src/modules/auth/application/services/auth.service.ts:73-98`
- **Estimated effort:** 4 hours

### XEN-GAP-0072 — No Audit Trail for Security Events

- **Source documents:** security.md
- **Category:** Security
- **Priority:** P2 (Medium)
- **Current state:** `audit_logs` table exists in schema but is not populated from auth events. Console.log used for audit events instead of structured audit logging. Security events (login, register, password reset, role changes) are not recorded in the database.
- **Target state:** Auth events written to `audit_logs` table; structured audit logging for all security-relevant events (login, logout, password change, role assignment, permission changes).
- **File references:** `security.md:365-368`; `apps/api/src/modules/auth/application/services/auth.service.ts`; `prisma/schema.prisma:1149-1170`
- **Estimated effort:** 4 hours

### XEN-GAP-0073 — No Request ID / Distributed Tracing

- **Source documents:** production-readiness.md, technical-debt.md
- **Category:** Observability
- **Priority:** P2 (Medium)
- **Current state:** No `X-Request-ID` middleware. Correlating logs across API, workers, and microservices requires manual effort. Debugging production issues is slow.
- **Target state:** Middleware generates/forwards `X-Request-ID` header; request ID integrated with NestJS Logger and passed to Python services via HTTP headers; OpenTelemetry tracing considered.
- **File references:** `production-readiness.md:547`; `technical-debt.md:618-626`
- **Estimated effort:** 4 hours

### XEN-GAP-0074 — Magic Numbers / Hardcoded Constants Scattered

- **Source documents:** code-quality.md, technical-debt.md
- **Category:** Code Quality
- **Priority:** P2 (Medium)
- **Current state:** Magic numbers hardcoded throughout: rate limits (10 req/10s), file size (100 MB), TTLs (900s, 15 min), page sizes (10), temperatures (0.45). No centralized constants file. Tuning requires code changes.
- **Target state:** All tunable constants moved to environment variables with typed defaults; centralized constants file in `@xennic/shared` for non-env values; magic numbers eliminated.
- **File references:** `code-quality.md:126-137`; `technical-debt.md:430-449`; `apps/api/src/api.module.ts:57-73`; `apps/api/src/main.ts:39,85`
- **Estimated effort:** 4 hours

### XEN-GAP-0075 — No Pre-Commit Hooks

- **Source documents:** 09_GIT_STATUS.md, 11_GAP_ANALYSIS.md
- **Category:** DevOps
- **Priority:** P2 (Medium)
- **Current state:** No active git hooks — no pre-commit linting, testing, or commit message validation. 14 sample hooks exist but are disabled.
- **Target state:** Pre-commit hooks configured (husky or similar) for linting, formatting check, and type checking; commitlint for conventional commit messages; pre-push hook running tests.
- **File references:** `09_GIT_STATUS.md:70-79`; `.git/hooks/`
- **Estimated effort:** 2 hours

### XEN-GAP-0076 — `venv/` Not in `.gitignore` (Git Pollution)

- **Source documents:** 09_GIT_STATUS.md, 11_GAP_ANALYSIS.md
- **Category:** DevOps
- **Priority:** P2 (Medium)
- **Current state:** `.gitignore` has `.venv` but not `venv/`. The engineering-service virtual environment at `workspace/services/engineering-service/venv/` is not ignored, causing ~1700 `.pyc` files to appear as modified in `git status`.
- **Target state:** `venv/`, `__pycache__/`, and `*.pyc` added to `.gitignore`.
- **File references:** `09_GIT_STATUS.md:49-65`; `.gitignore`
- **Estimated effort:** 0.2 hours

### XEN-GAP-0077 — Backpressure Not Handled for Streaming

- **Source documents:** production-readiness.md
- **Category:** Runtime
- **Priority:** P2 (Medium)
- **Current state:** No backpressure handling for streaming responses. No queue-based approach for email/webhook delivery. No circuit breaker pattern. Stream reads use `for await (const chunk of req.raw)` without flow control.
- **Target state:** Proper Node.js backpressure for streaming; message queue (RabbitMQ/Bull) for email/webhook/notification delivery; circuit breaker pattern for external calls.
- **File references:** `production-readiness.md:300-318`; `apps/api/src/modules/engineering/presentation/controllers/engineering.controller.ts:188`
- **Estimated effort:** 12 hours

### XEN-GAP-0078 — No `OnModuleDestroy` Lifecycle Hooks

- **Source documents:** production-readiness.md
- **Category:** Runtime
- **Priority:** P2 (Medium)
- **Current state:** Zero implementations of `OnModuleDestroy` anywhere in the codebase. Prisma connection, Redis, MinIO client never properly disconnected on application shutdown.
- **Target state:** `OnModuleDestroy` implemented in modules holding external connections (Prisma, MinIO, Redis); connections gracefully closed on shutdown.
- **File references:** `production-readiveness.md:143-154`; all modules
- **Estimated effort:** 4 hours

### XEN-GAP-0079 — No Retry Policy for External HTTP Calls

- **Source documents:** production-readiness.md
- **Category:** Runtime
- **Priority:** P2 (Medium)
- **Current state:** Only `LlmProvider` has basic retry (once after 2s on 429/403). `EngineeringClientService`, `VisionClientService`, `ZarinpalGateway`, and webhook delivery have zero retry — single failure causes operation failure.
- **Target state:** Retry with exponential backoff (+ jitter) implemented for all external HTTP calls; configurable max retries per service.
- **File references:** `production-readiness.md:111-131`; `apps/api/src/modules/engineering/infrastructure/http/engineering-client.service.ts:37-88`
- **Estimated effort:** 6 hours

### XEN-GAP-0080 — No `@nestjs/config` Initialized

- **Source documents:** production-readiness.md
- **Category:** Infrastructure
- **Priority:** P2 (Medium)
- **Current state:** `@nestjs/config` listed as dependency but `ConfigModule.forRoot()` is absent from `api.module.ts`. All services read `process.env.*` directly. No typed config service.
- **Target state:** `ConfigModule.forRoot({ isGlobal: true })` added; all `process.env` reads replaced with `ConfigService.get()` calls.
- **File references:** `production-readiness.md:186-199`; `apps/api/src/api.module.ts:1-78`
- **Estimated effort:** 6 hours

### XEN-GAP-0081 — 15 Python Tests Failing in Engineering Service

- **Source documents:** 06_TEST_REPORT.md, test-gap-analysis.md, executive-summary.md
- **Category:** Testing
- **Priority:** P1 (High)
- **Current state:** 15 Python tests failing in engineering-service: `test_basic_api.py` (6 failures — ActivePower, ApparentPower, ReactivePower, PowerFactor, OhmsLaw), `test_pq_integration.py` (4 failures — THD, TDD, Resonance, ActiveFilter), `test_registry.py` (1 thread safety failure).
- **Target state:** All 15 failing tests passing; test assertions updated for refactored API/schema; root causes fixed (API routing changes, schema refactoring, race conditions).
- **File references:** `06_TEST_REPORT.md:87-100`; `test-gap-analysis.md:239-246`; `workspace/services/engineering-service/tests/`
- **Estimated effort:** 8 hours

### XEN-GAP-0082 — 21 of 27 API Modules Have Zero Tests

- **Source documents:** test-gap-analysis.md, executive-summary.md
- **Category:** Testing
- **Priority:** P1 (High)
- **Current state:** 8.72% overall coverage. Only 5 of 27 modules have tests (ai-runtime 12 specs, knowledge 3 specs, workspace 2 specs, admin 1 spec, health 2 stubs). Core modules (auth, rbac, billing, subscription, engineering, storage, marketplace, etc.) have zero tests.
- **Target state:** Minimum 60% line coverage across all modules; unit tests for all service methods; controller tests for all endpoints; priority on auth, rbac, engineering, and billing modules.
- **File references:** `test-gap-analysis.md:28-114`; `apps/api/src/modules/*/`
- **Estimated effort:** 200+ hours

### XEN-GAP-0083 — No Frontend Tests (apps/web)

- **Source documents:** test-gap-analysis.md, executive-summary.md
- **Category:** Testing
- **Priority:** P1 (High)
- **Current state:** Zero test files in `apps/web`. No test framework configuration (no jest, vitest, React Testing Library). No test scripts in `package.json`.
- **Target state:** Vitest + React Testing Library configured; unit tests for key components and pages; integration tests for API interaction flows.
- **File references:** `test-gap-analysis.md:254-262`; `apps/web/`
- **Estimated effort:** 40 hours

### XEN-GAP-0084 — No Integration/E2E Tests for Core Flows

- **Source documents:** test-gap-analysis.md, technical-debt.md
- **Category:** Testing
- **Priority:** P2 (Medium)
- **Current state:** Only 3 E2E test files (app stub, workspace-settings, CORS security). No integration tests for auth flows, RBAC, knowledge CRUD, workspace management, billing, or multi-tenancy isolation.
- **Target state:** E2E tests for all critical user journeys; integration tests for cross-module flows (auth → RBAC → workspace → project); real database in testcontainers.
- **File references:** `test-gap-analysis.md:289-305`; `apps/api/test/`
- **Estimated effort:** 40 hours

### XEN-GAP-0085 — No Concurrency/Race Condition Tests

- **Source documents:** test-gap-analysis.md
- **Category:** Testing
- **Priority:** P2 (Medium)
- **Current state:** Zero concurrency tests across all modules. The only concurrency-adjacent test (`test_registry_thread_safe`) fails. Multi-tenant workspace isolation under concurrent access is unverified.
- **Target state:** Concurrency tests for workspace isolation, subscription plan changes, billing operations, and knowledge operations under simultaneous access.
- **File references:** `test-gap-analysis.md:184-188`; `workspace/services/engineering-service/tests/test_registry.py`
- **Estimated effort:** 16 hours

### XEN-GAP-0086 — `README.md` Is a Security Document (Misleading)

- **Source documents:** 08_DOCUMENTATION_AUDIT.md, 11_GAP_ANALYSIS.md
- **Category:** Documentation
- **Priority:** P2 (Medium)
- **Current state:** Root `README.md` contains a Security Hardening plan (SEC-001) instead of a project overview. Anyone reading it gets no information about what Xennic is, how to set it up, or how to contribute.
- **Target state:** Proper project README with: project description, architecture overview, setup instructions, development guide, deployment guide, and link to security policy.
- **File references:** `08_DOCUMENTATION_AUDIT.md:56`; `/README.md`
- **Estimated effort:** 4 hours

### XEN-GAP-0087 — No ADR (Architecture Decision Records)

- **Source documents:** technical-debt.md, 08_DOCUMENTATION_AUDIT.md
- **Category:** Documentation
- **Priority:** P3 (Low)
- **Current state:** No `docs/adr/` directory. No historical record of why architectural decisions were made (DDD, Fastify, multi-tenant via workspace_id, Prisma ORM). New joiners re-litigate decisions.
- **Target state:** `docs/adr/` created with initial ADRs for: DDD adoption, Fastify choice, multi-tenant strategy, Prisma ORM selection.
- **File references:** `technical-debt.md:526-533`
- **Estimated effort:** 4 hours

### XEN-GAP-0088 — Stale `.eslintrc.cjs` Coexists with `eslint.config.mjs`

- **Source documents:** technical-debt.md
- **Category:** Code Quality
- **Priority:** P3 (Low)
- **Current state:** Both `.eslintrc.cjs` (legacy) and `eslint.config.mjs` (flat config) exist. Flat config is active but stale config may cause confusion or inconsistent lint results.
- **Target state:** `.eslintrc.cjs` deleted after verifying flat config covers all needed rules.
- **File references:** `technical-debt.md:420-428`; `.eslintrc.cjs`
- **Estimated effort:** 0.2 hours

### XEN-GAP-0089 — `packages/shared` and `packages/types` Underutilized

- **Source documents:** architecture-audit.md, technical-debt.md
- **Category:** Code Quality
- **Priority:** P2 (Medium)
- **Current state:** `@xennic/shared` and `@xennic/types` exist but are underutilized. Many types are duplicated across modules. No shared AI types package — ai-runtime types cannot be reused by other modules easily.
- **Target state:** Common types migrated to `@xennic/types`; shared utilities in `@xennic/shared`; AI types package created for cross-module AI type reuse.
- **File references:** `architecture-audit.md:89-92`; `technical-debt.md:539-546`
- **Estimated effort:** 8 hours

### XEN-GAP-0090 — Spec Files Excluded from tsconfig (ESLint Errors)

- **Source documents:** technical-debt.md
- **Category:** Code Quality
- **Priority:** P2 (Medium)
- **Current state:** `.spec.ts` files excluded from main `tsconfig.json`. ESLint with `project: true` fails to parse spec files, preventing type-aware lint rules from applying to tests.
- **Target state:** `tsconfig.eslint.json` created that extends main config and includes spec files; ESLint `parserOptions.project` pointed to new config.
- **File references:** `technical-debt.md:349-358`
- **Estimated effort:** 1 hour

### XEN-GAP-0091 — No Security Headers (Helmet) in Python Services

- **Source documents:** security.md, code-quality.md
- **Category:** Security
- **Priority:** P2 (Medium)
- **Current state:** Python FastAPI services (engineering, ai, vision) have no security middleware — no CORS restrictions beyond wildcard, no security headers.
- **Target state:** FastAPI middleware added for security headers; CORS origins restricted per environment; rate limiting at service level.
- **File references:** `security.md:328-334`; `workspace/services/engineering-service/src/main.py:77`
- **Estimated effort:** 2 hours

### XEN-GAP-0092 — AuthThrottlerGuard Not Applied to Auth Controller

- **Source documents:** security.md
- **Category:** Security
- **Priority:** P2 (Medium)
- **Current state:** `AuthThrottlerGuard` is defined (5 req/60s) but not applied to auth controller endpoints. Auth endpoints use only the general `ThrottlerGuard`.
- **Target state:** `@UseGuards(AuthThrottlerGuard)` added to auth controller endpoints (register, login).
- **File references:** `security.md:282`; `apps/api/src/modules/auth/presentation/controllers/auth.controller.ts`
- **Estimated effort:** 0.5 hours

### XEN-GAP-0093 — No Token-Aware Chunking / Hierarchical Chunking

- **Source documents:** ai-audit.md
- **Category:** AI
- **Priority:** P2 (Medium)
- **Current state:** Chunker uses fixed 500-word chunks regardless of model context window. No section-header detection, no code/equation preservation, no semantic chunking.
- **Target state:** Token-count-based chunking with model-specific tokenizers; hierarchical chunking respecting document structure (sections, paragraphs); code blocks and equations preserved intact.
- **File references:** `ai-audit.md:43-47`; `workspace/services/ai-service/app/rag/chunker.py:54-64`
- **Estimated effort:** 6 hours

### XEN-GAP-0094 — Document Deduplication Not Implemented

- **Source documents:** ai-audit.md
- **Category:** AI
- **Priority:** P2 (Medium)
- **Current state:** Same document can be indexed multiple times in RAG pipeline. No checksum or content-based hash deduplication before embedding and storage.
- **Target state:** Content hashing (SHA-256) computed before indexing; duplicate detection prevents re-indexing same content; version history tracked for updated documents.
- **File references:** `ai-audit.md:127`; `workspace/services/ai-service/app/rag/`
- **Estimated effort:** 3 hours

### XEN-GAP-0095 — RAG Cache Unbounded with No TTL

- **Source documents:** ai-audit.md, performance.md
- **Category:** Performance
- **Priority:** P2 (Medium)
- **Current state:** `Retriever._cache` is an unbounded dictionary with no TTL, no LRU/LFU eviction, and no size limit. Cache key includes full query text causing collision risk. Cache is per-worker only (not shared).
- **Target state:** Redis-based cache with TTL; LRU eviction; cache key uses normalized query embedding hash; shared across workers.
- **File references:** `ai-audit.md:67-68`; `performance.md:262-284`; `workspace/services/ai-service/app/rag/retriever.py:31,60-78`
- **Estimated effort:** 4 hours

### XEN-GAP-0096 — No Bull/Queue for Background Jobs

- **Source documents:** production-readiness.md, technical-debt.md
- **Category:** Infrastructure
- **Priority:** P2 (Medium)
- **Current state:** No background job processing. Email sending, report generation, knowledge indexing run synchronously in request threads. `workers/` directory referenced in workspace config but doesn't exist.
- **Target state:** Bull/BullMQ configured with Redis; email, report generation, and knowledge indexing moved to background jobs; `workers/` directory created with worker packages.
- **File references:** `production-readiness.md:311,479`; `technical-debt.md:405-413`
- **Estimated effort:** 24 hours

### XEN-GAP-0097 — No `.nvmrc` or `.node-version` Files

- **Source documents:** 11_GAP_ANALYSIS.md
- **Category:** DevOps
- **Priority:** P3 (Low)
- **Current state:** Node.js version not pinned. Developers may use different versions causing build inconsistencies or compatibility issues.
- **Target state:** `.nvmrc` and `.node-version` added specifying the supported Node.js version (e.g., 20.x LTS).
- **File references:** `11_GAP_ANALYSIS.md:65-66`
- **Estimated effort:** 0.2 hours

### XEN-GAP-0098 — `is_admin` Duplicates RBAC System

- **Source documents:** technical-debt.md
- **Category:** Architecture
- **Priority:** P3 (Low)
- **Current state:** `is_admin` boolean on `users` table duplicates the RBAC `user_roles` system. Some gates check the boolean, others check roles — two authorization paths to maintain.
- **Target state:** `is_admin` deprecated; super-admin checks migrated to use `SUPER_ADMIN` role via `user_roles`; column removed after migration.
- **File references:** `technical-debt.md:550-558`; `prisma/schema.prisma`
- **Estimated effort:** 8 hours

### XEN-GAP-0099 — No Global `X-Request-ID` Tracing

- **Source documents:** technical-debt.md
- **Category:** Observability
- **Priority:** P2 (Medium)
- **Current state:** Request-level tracing impossible. Correlating logs across API, workers, and microservices requires manual effort. No distributed tracing.
- **Target state:** Middleware generates/forwards `X-Request-ID`; integrated with NestJS Logger; passed to Python services via HTTP headers.
- **File references:** `technical-debt.md:618-626`
- **Estimated effort:** 4 hours

### XEN-GAP-0100 — `@nestjs/throttler` in devDependencies Instead of dependencies

- **Source documents:** 07_BUILD_REPORT.md, 11_GAP_ANALYSIS.md
- **Category:** Infrastructure
- **Priority:** P2 (Medium)
- **Current state:** `@nestjs/throttler` (runtime dependency for rate limiting) is listed in `devDependencies` instead of `dependencies` in API and web package.json.
- **Target state:** `@nestjs/throttler` moved to `dependencies` in both `apps/api/package.json` and `apps/web/package.json`.
- **File references:** `07_BUILD_REPORT.md:78`; `apps/api/package.json`
- **Estimated effort:** 0.2 hours

---

**Total gaps: 100**
