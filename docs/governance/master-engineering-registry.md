# Xennic Platform — Master Engineering Registry

> **Central registry for ALL implementation items across the Xennic platform gap closure program.**
> This document is the single source of truth for tracking every gap from identification through verification.

---

## Registry Metadata

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Last Updated** | 2026-07-02 |
| **Total Gaps** | 100 |
| **Source Documents** | 25 audit reports: security, architecture, production-readiness, performance, AI, code quality, test gap analysis, technical debt, executive summary, build report, git status, documentation audit, knowledge factory audit |
| **Governing Sprint Plan** | `docs/implementation/sprint-plan.md` |
| **Governing Gap Registry** | `docs/implementation/gap-registry.md` |
| **Sprint Cadence** | 2 weeks |
| **Total Duration** | 28 weeks (14 sprints) |
| **Target** | Release Candidate 1 (RC1) |

### Count by Status

| Status | Count |
|--------|:-----:|
| Not Started | 100 |
| In Progress | 0 |
| Review | 0 |
| Done | 0 |
| Blocked | 0 |

### Count by Priority

| Priority | Count |
|----------|:-----:|
| P0 (Critical) | 20 |
| P1 (High) | 38 |
| P2 (Medium) | 31 |
| P3 (Low) | 11 |

### Count by Risk

| Risk | Count |
|------|:-----:|
| High | 58 |
| Medium | 31 |
| Low | 11 |

### Count by Sprint

| Sprint | Theme | Gaps | Status |
|--------|-------|:----:|--------|
| Sprint 1 | Stop the Bleeding | 16 | Not Started |
| Sprint 2 | Foundation: Production Readiness | 8 | Not Started |
| Sprint 3 | Security Hardening | 7 | Not Started |
| Sprint 4 | Data Layer: Schema & Queries | 7 | Not Started |
| Sprint 5 | Code Quality: Errors, Logging & Architecture | 6 | Not Started |
| Sprint 6 | AI Foundation: Real LLM Integration | 10 | Not Started |
| Sprint 7 | AI Quality: Memory, Guardrails & Source Grounding | 5 | Not Started |
| Sprint 8 | AI Advanced: RAG Pipeline & Multi-Agent | 3 | Not Started |
| Sprint 9 | Testing: Unit Tests Pt 1 | 2 | Not Started |
| Sprint 10 | Testing: Unit Tests Pt 2 | 1 | Not Started |
| Sprint 11 | Testing: Integration & E2E | 1 | Not Started |
| Sprint 12 | Enterprise Modules | 2 | Not Started |
| Sprint 13 | Knowledge Factory | 11 | Not Started |
| Sprint 14 | Polish & RC1 | 7 | Not Started |
| Unassigned | — | 22 | Not Started |

---

## Status Legend

| Status | Definition |
|--------|------------|
| **Not Started** | Work has not begun. Available for pick-up. |
| **In Progress** | Active implementation underway. |
| **Review** | Implementation complete, pending peer review or stakeholder sign-off. |
| **Done** | All acceptance criteria met, verification passed, deployed to target environment. |
| **Blocked** | Cannot proceed due to unresolved dependency, decision, or external factor. |

## Risk Legend

| Risk | Definition |
|------|------------|
| **High** | Failure causes data loss, security breach, production outage, or regulatory non-compliance. |
| **Medium** | Failure causes degraded performance, incorrect but non-critical results, or poor UX. |
| **Low** | Failure causes cosmetic issues, developer friction, or minor technical debt. |

---

## Index by Sprint

### Sprint 1 — Stop the Bleeding (Weeks 1–2)
XEN-GAP-0005, XEN-GAP-0006, XEN-GAP-0007, XEN-GAP-0008, XEN-GAP-0010, XEN-GAP-0018, XEN-GAP-0020, XEN-GAP-0032, XEN-GAP-0033, XEN-GAP-0034, XEN-GAP-0035, XEN-GAP-0036, XEN-GAP-0037, XEN-GAP-0038, XEN-GAP-0076, XEN-GAP-0077

### Sprint 2 — Foundation: Production Readiness (Weeks 3–4)
XEN-GAP-0041, XEN-GAP-0042, XEN-GAP-0044, XEN-GAP-0045, XEN-GAP-0049, XEN-GAP-0052, XEN-GAP-0053, XEN-GAP-0080

### Sprint 3 — Security Hardening (Weeks 5–6)
XEN-GAP-0014, XEN-GAP-0031, XEN-GAP-0039, XEN-GAP-0040, XEN-GAP-0050, XEN-GAP-0051, XEN-GAP-0069

### Sprint 4 — Data Layer: Schema & Queries (Weeks 7–8)
XEN-GAP-0070, XEN-GAP-0071, XEN-GAP-0081, XEN-GAP-0082, XEN-GAP-0083, XEN-GAP-0084, XEN-GAP-0085

### Sprint 5 — Code Quality: Errors, Logging & Architecture (Weeks 9–10)
XEN-GAP-0017, XEN-GAP-0064, XEN-GAP-0065, XEN-GAP-0066, XEN-GAP-0067, XEN-GAP-0068

### Sprint 6 — AI Foundation: Real LLM Integration (Weeks 11–12)
XEN-GAP-0046, XEN-GAP-0047, XEN-GAP-0054, XEN-GAP-0055, XEN-GAP-0056, XEN-GAP-0057, XEN-GAP-0058, XEN-GAP-0059, XEN-GAP-0062, XEN-GAP-0063

### Sprint 7 — AI Quality: Memory, Guardrails & Source Grounding (Weeks 13–14)
XEN-GAP-0015, XEN-GAP-0016, XEN-GAP-0043, XEN-GAP-0060, XEN-GAP-0061

### Sprint 8 — AI Advanced: RAG Pipeline & Multi-Agent (Weeks 15–16)
XEN-GAP-0012, XEN-GAP-0013, XEN-GAP-0029

### Sprint 9 — Testing: Unit Tests Pt 1 (Weeks 17–18)
XEN-GAP-0003, XEN-GAP-0004

### Sprint 10 — Testing: Unit Tests Pt 2 (Weeks 19–20)
XEN-GAP-0003 (continued)

### Sprint 11 — Testing: Integration & E2E (Weeks 21–22)
XEN-GAP-0003 (continued)

### Sprint 12 — Enterprise Modules (Weeks 23–24)
XEN-GAP-0011, XEN-GAP-0072

### Sprint 13 — Knowledge Factory (Weeks 25–26)
XEN-GAP-0001, XEN-GAP-0021, XEN-GAP-0022, XEN-GAP-0023, XEN-GAP-0024, XEN-GAP-0025, XEN-GAP-0026, XEN-GAP-0027, XEN-GAP-0028, XEN-GAP-0030, XEN-GAP-0078

### Sprint 14 — Polish & RC1 (Weeks 27–28)
XEN-GAP-0002, XEN-GAP-0019, XEN-GAP-0039, XEN-GAP-0073, XEN-GAP-0074, XEN-GAP-0075, XEN-GAP-0079

### Unassigned
XEN-GAP-0009, XEN-GAP-0048, XEN-GAP-0086, XEN-GAP-0087, XEN-GAP-0088, XEN-GAP-0089, XEN-GAP-0090, XEN-GAP-0091, XEN-GAP-0092, XEN-GAP-0093, XEN-GAP-0094, XEN-GAP-0095, XEN-GAP-0096, XEN-GAP-0097, XEN-GAP-0098, XEN-GAP-0099, XEN-GAP-0100

---

## Registry

---

### XEN-GAP-0001 — Secrets Committed to Git (JWT Keys, API Keys, Passwords)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `infrastructure/docker/secrets/`, `apps/api/.env`, `workspace/services/engineering-service/.env`, `infrastructure/docker/.env` |
| **Target Module** | Repository root (`.gitignore`, git history), `apps/api`, `infrastructure/docker/` |
| **Acceptance Criteria** | — All JWT keys, API keys, passwords removed from git history via BFG Repo-Cleaner<br/>— `.env` files added to `.gitignore`; `venv/`, `__pycache__/`, `*.pyc` also excluded<br/>— All production secrets injected via environment variables or Docker secrets (not files)<br/>— New JWT key pair generated; old keys rotated<br/>— `git status` shows no secrets, no `.pyc` or `venv/` artifacts |
| **Verification Method** | Manual `git grep` for known secrets; `git log --diff-filter=A` scan; security scan (truffleHog/gitleaks) |
| **Rollback Strategy** | Restore `.gitignore` from backup; re-commit `.env` files if deployment breaks; revert BFG rewrite from backup refs |

---

### XEN-GAP-0002 — UserController Has Zero Authentication Guards

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 14 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/user/presentation/controllers/user.controller.ts` |
| **Target Module** | Same (UserController) |
| **Acceptance Criteria** | — `@UseGuards(JwtAuthGuard, AdminGuard)` applied to all UserController endpoints<br/>— Unauthenticated requests to UserController return 401<br/>— Hard-delete endpoints require admin/super-admin role with ownership verification<br/>— Authorization checks enforce role-based access for all mutations<br/>— Soft-delete-only enforced for regular users on delete endpoints |
| **Verification Method** | Automated test (unit + integration); manual API call review |
| **Rollback Strategy** | Revert the commit adding guards; restore previous controller decorators |

---

### XEN-GAP-0003 — SSRF Vulnerability in Webhook Delivery

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 9 (continued Sprints 10, 11) |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/webhooks/application/services/webhook.service.ts` |
| **Target Module** | Same (WebhookService); shared utility library |
| **Acceptance Criteria** | — Webhook URL validation blocks private/internal IP ranges (10.x, 172.16–31.x, 192.168.x, 127.x, 169.254.x)<br/>— URL resolution checked before `fetch()` (DNS resolution validates target IP)<br/>— Blocked URLs return 400 with descriptive error<br/>— Unit tests cover all private range edge cases<br/>— Webhook delivery integration tests pass with SSRF-safe URLs |
| **Verification Method** | Automated test (unit + integration); manual security review |
| **Rollback Strategy** | Revert webhook validation changes; restore original `fetch(webhook.url)` without IP check |

---

### XEN-GAP-0004 — Hard Delete Endpoints Public with No Ownership Check

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 9 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0002 |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/user/presentation/controllers/user.controller.ts`, `workspace.controller.ts` |
| **Target Module** | Same (controllers); RBAC guards |
| **Acceptance Criteria** | — Hard-delete endpoints require admin/super-admin role<br/>— Ownership/membership verification before hard-delete on workspace controller<br/>— Confirmation step or soft-delete-only enforced for non-admin users<br/>— Tests verify non-admin users get 403 on hard-delete<br/>— Tests verify admin can hard-delete with proper ownership |
| **Verification Method** | Automated test (unit + integration); manual API call testing |
| **Rollback Strategy** | Revert decorator changes; restore original endpoint guard configuration |

---

### XEN-GAP-0005 — No Helmet/Security Headers

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/main.ts` |
| **Target Module** | Same (`main.ts`); Fastify adapter |
| **Acceptance Criteria** | — `@fastify/helmet` installed and registered in `main.ts`<br/>— All API responses include: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`<br/>— Helmet configured with production-appropriate defaults<br/>— CSP policy allows only expected origins<br/>— No regressions in existing API response behavior |
| **Verification Method** | Automated test (header inspection); manual cURL/Postman verification; security scan |
| **Rollback Strategy** | Comment out or remove `@fastify/helmet` registration; re-deploy API |

---

### XEN-GAP-0006 — Prompt Injection Vulnerability in AI Service

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/application/services/ai.service.ts` |
| **Target Module** | Same (AiService); LLM provider |
| **Acceptance Criteria** | — User input sanitization layer added before LLM prompt construction<br/>— Prompt injection detection/filtering implemented (pattern matching + delimiters)<br/>— User input isolated from system instructions via clear delimiters (`<user_input>`...`</user_input>`)<br/>— Tests verify injection attempts (e.g., "Ignore previous instructions") are blocked or sanitized<br/>— System prompt structure enforces separation between instructions and user content |
| **Verification Method** | Automated test (unit); manual penetration testing |
| **Rollback Strategy** | Revert sanitization changes; restore original prompt construction logic |

---

### XEN-GAP-0007 — Python AI Agent Never Calls LLM (Hardcoded Responses)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/agents/electrical_engineer/agent.py` |
| **Target Module** | Same (agent.py); ModelRouter |
| **Acceptance Criteria** | — `ElectricalEngineerAgent._generateResponse()` uses `ModelRouter.route()` + actual LLM API call (not if/else rules)<br/>— Tool-calling loop integrated for `CalculationTool` dispatch<br/>— Agent sends requests to Groq/OpenAI API and returns LLM-generated responses<br/>— All existing tests updated and passing<br/>— No hardcoded response branches remain in agent logic |
| **Verification Method** | Automated test (unit); manual prompt verification; integration test with mock LLM |
| **Rollback Strategy** | Revert agent.py changes; restore original if/else implementation |

---

### XEN-GAP-0008 — NestJS Execution Pipeline Is a Mock Echo

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai-runtime/application/services/execution-pipeline.service.ts` |
| **Target Module** | Same (execution-pipeline.service.ts); LlmProvider |
| **Acceptance Criteria** | — `ExecutionPipelineService.execute()` invokes actual LLM provider or routes to Python AI service<br/>— Tool calls dispatched to appropriate handlers<br/>— Response streaming works end-to-end (WebSocket/SSE)<br/>— No passthrough mock/echo behavior in any mode<br/>— Unit tests verify pipeline invokes real provider interface |
| **Verification Method** | Automated test (unit + integration); manual end-to-end test |
| **Rollback Strategy** | Revert execution pipeline changes; restore mock echo behavior |

---

### XEN-GAP-0009 — Dummy Embeddings All Identical (Broken RAG)

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/embedding_pipeline.py` |
| **Target Module** | Same (embedding_pipeline.py) |
| **Acceptance Criteria** | — `hash(str(dimension))` seed replaced with content-based hashing (`hashlib.sha256(text.encode()).hexdigest()`)<br/>— Different documents produce different fallback embedding vectors<br/>— Proper API-based embeddings used when API key is available<br/>— Fallback mode logs via structured logger (not `print`)<br/>— Embedding dimension validation added |
| **Verification Method** | Automated test (unit); verify cosine distance between different documents is not 1.0 |
| **Rollback Strategy** | Revert embedding pipeline changes; restore original hash-based implementation |

---

### XEN-GAP-0010 — No Graceful Shutdown Handling

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/main.ts` |
| **Target Module** | Same (`main.ts`); all modules holding connections (PrismaService, MinioService, Redis) |
| **Acceptance Criteria** | — `app.enableShutdownHooks()` added in `main.ts`<br/>— SIGTERM/SIGINT handlers with drain logic for in-flight requests<br/>— `OnModuleDestroy` implemented in PrismaService, MinioService, Redis connections<br/>— `SIGTERM` drains in-flight requests and closes connections cleanly<br/>— No dropped connections or leaked resources during pod termination |
| **Verification Method** | Manual integration test (send SIGTERM during active request); automated lifecycle test |
| **Rollback Strategy** | Remove `enableShutdownHooks()` and `OnModuleDestroy` implementations; revert to default NestJS behavior |

---

### XEN-GAP-0011 — No Environment Variable Validation

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 12 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/api.module.ts` |
| **Target Module** | Same (`api.module.ts`); all services using `process.env` |
| **Acceptance Criteria** | — `ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({...}) })` added to `api.module.ts`<br/>— Joi validation schema covers all required env vars (DATABASE_URL, REDIS_URL, JWT_*, etc.)<br/>— Missing `DATABASE_URL` causes startup failure with descriptive error message<br/>— All `process.env` reads migrated to `ConfigService` injection<br/>— Rate limit config moved to env vars |
| **Verification Method** | Automated test (startup validation); manual review |
| **Rollback Strategy** | Remove `ConfigModule.forRoot()` and Joi schema; restore `process.env` reads |

---

### XEN-GAP-0012 — Unbounded In-Memory Stores (OOM Risk)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 8 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0020 |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai-runtime/infrastructure/stores/` |
| **Target Module** | Same (stores); Redis module |
| **Acceptance Criteria** | — `InMemorySessionStore` replaced with Redis-backed `SessionStore`<br/>— `InMemoryMemoryStore` replaced with Prisma-backed `MemoryStore`<br/>— `InMemoryPromptTemplateStore` replaced with Prisma-backed `PromptTemplateStore`<br/>— Session TTL + eviction policy added<br/>— Sessions persist across restarts (Redis-backed)<br/>— Size limits with LRU eviction for memory entries |
| **Verification Method** | Automated test (unit + integration); manual restart test verifying persistence |
| **Rollback Strategy** | Revert to in-memory stores; keep Redis infrastructure in place for other uses |

---

### XEN-GAP-0013 — No Prisma Transactions (Data Inconsistency)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 8 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | Multiple services: `apps/api/src/modules/auth/`, `workspace/`, `storage/`, `billing/`, `project/` |
| **Target Module** | Same modules; shared transaction utility |
| **Acceptance Criteria** | — All multi-step operations wrapped in Prisma `$transaction`<br/>— Auth login/register, workspace creation, storage upload, billing payment, project create use transactions<br/>— Compensation/rollback for cross-service operations (MinIO + DB)<br/>— Outbox pattern for critical financial transactions<br/>— Partial failure scenarios roll back all changes atomically |
| **Verification Method** | Automated test (integration with forced failure scenarios) |
| **Rollback Strategy** | Remove `$transaction` wrappers; restore non-transactional writes |

---

### XEN-GAP-0014 — No Idempotency on POST Endpoints

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 3 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0020 |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | All POST endpoints across auth, billing, engineering, storage |
| **Target Module** | Shared middleware; all POST controllers |
| **Acceptance Criteria** | — Idempotency middleware checks `Idempotency-Key` header on all POST endpoints<br/>— Processed keys stored in Redis with TTL<br/>— Duplicate requests within TTL window return cached response (409 or original response)<br/>— POST endpoints return 409 on duplicate `Idempotency-Key`<br/>— Tests verify idempotency key behavior for all critical endpoints |
| **Verification Method** | Automated test (integration); manual API testing |
| **Rollback Strategy** | Remove idempotency middleware; restore original POST behavior |

---

### XEN-GAP-0015 — Mock Fallback in LlmProvider (Silent Data Corruption)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 7 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/infrastructure/providers/llm.provider.ts` |
| **Target Module** | Same (llm.provider.ts) |
| **Acceptance Criteria** | — Mock fallback removed in production mode (gated by `NODE_ENV`)<br/>— LLM provider throws `ServiceUnavailableException` on API failure in production<br/>— User-facing error message returned on AI failure (not plausible-sounding mock)<br/>— Development/staging may still use mock with clear logging<br/>— Tests verify production mode never returns mock data |
| **Verification Method** | Automated test (unit); NODE_ENV switching test |
| **Rollback Strategy** | Restore mock fallback; re-enable `_smartMock()` in production |

---

### XEN-GAP-0016 — DB Errors Silently Swallowed (AiRepository)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 7 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/infrastructure/repositories/ai.repository.ts` |
| **Target Module** | Same (ai.repository.ts) |
| **Acceptance Criteria** | — All `catch { return null; }` blocks (lines 20, 29, 50, 67, 113, 136, 163) replaced with proper error logging<br/>— Domain exceptions thrown for DB failures (not null returns)<br/>— Controller handles exceptions gracefully (returns appropriate HTTP status)<br/>— Structured Logger injected and used in all catch blocks<br/>— Tests verify DB failures propagate correctly |
| **Verification Method** | Automated test (unit with forced DB failure) |
| **Rollback Strategy** | Restore `catch { return null; }` original implementation |

---

### XEN-GAP-0017 — Timer Leaks in Engineering and Vision Client Services

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 5 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/engineering/infrastructure/http/engineering-client.service.ts`, `vision-client.service.ts` |
| **Target Module** | Same modules |
| **Acceptance Criteria** | — All `AbortController` + `setTimeout` patterns replaced with `AbortSignal.timeout()`<br/>— `try/finally` with `clearTimeout()` used where manual abort is needed<br/>— Health check timers also fixed<br/>— No timer leaks in engineering-client or vision-client (verified by test)<br/>— All existing functionality preserved |
| **Verification Method** | Automated test (unit with timer leak detection); code review |
| **Rollback Strategy** | Revert to original `AbortController` + `setTimeout` implementation |

---

### XEN-GAP-0018 — No Readiness/Liveness Probes for Kubernetes

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/health/` |
| **Target Module** | Same (health module) |
| **Acceptance Criteria** | — `@nestjs/terminus` installed and health indicators registered<br/>— Health service probes all dependencies (DB ping, Redis, MinIO, Qdrant)<br/>— Separate `/health/readiness` and `/health/liveness` endpoints created<br/>— `/health/readiness` returns 200 only when DB, Redis, MinIO are responsive<br/>— `/health/liveness` returns 200 when process is alive |
| **Verification Method** | Automated test (integration); manual endpoint verification |
| **Rollback Strategy** | Revert health module changes; restore static `'ok'` response |

---

### XEN-GAP-0019 — Consultations Module Missing Workspace Isolation

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 14 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/consultations/presentation/controllers/consultations.controller.ts` |
| **Target Module** | Same (consultations controller); RBAC guards |
| **Acceptance Criteria** | — All ConsultationController endpoints verify workspace membership before returning data<br/>— `WorkspaceGuard` or explicit `workspaceId` check added to `findOne`, `aiReply`, `updateStatus`<br/>— Cross-workspace data access returns 403 or 404<br/>— Tests verify workspace isolation for all consultation endpoints |
| **Verification Method** | Automated test (unit + integration); manual security review |
| **Rollback Strategy** | Revert consultation guard changes; restore unguarded endpoints |

---

### XEN-GAP-0020 — No Redis Caching Layer

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | All hot-path services: subscription, workspace, RBAC, rate limiting |
| **Target Module** | Shared Redis module; all affected services |
| **Acceptance Criteria** | — Redis caching layer added for hot-path data<br/>— Subscription plans cached with 5-min TTL (`getActivePlanSlug` returns cached in <5ms)<br/>— Workspace settings and user permissions/roles cached<br/>— Rate limiting counters use Redis<br/>— Session storage uses Redis |
| **Verification Method** | Automated test (integration); performance benchmark comparison |
| **Rollback Strategy** | Remove Redis cache calls; revert to direct DB reads |

---

### XEN-GAP-0021 — Fake Streaming (No Real SSE)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/infrastructure/providers/llm.provider.ts`, `workspace/services/ai-service/app/agents/electrical_engineer/agent.py` |
| **Target Module** | Same modules; `StreamingResponseManager` |
| **Acceptance Criteria** | — Real SSE-based streaming using OpenAI/Groq streaming API with proper backpressure<br/>— Artificial 15ms delays eliminated<br/>— `LlmProvider.chatStream()` yields real tokens from LLM (not word-split full response)<br/>— TTFB <500ms for streaming responses<br/>— WebSocket/SSE client disconnect cleans up stream handler |
| **Verification Method** | Automated test (integration); manual streaming verification; TTFB measurement |
| **Rollback Strategy** | Revert to fake streaming implementation; restore word-split approach |

---

### XEN-GAP-0022 — PermissionsGuard Fail-Open (Security Bypass)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/rbac/infrastructure/guards/permissions.guard.ts`, `authorization.service.ts` |
| **Target Module** | Same modules |
| **Acceptance Criteria** | — `PermissionsGuard` returns `false` (deny) on unexpected errors (fail-closed)<br/>— `AuthorizationService._getMemberRole` fallback returns specific member permissions instead of wildcard `['*']`<br/>— Privilege escalation path closed<br/>— Tests verify fail-closed behavior on guard errors<br/>— Tests verify non-admin members receive restricted permissions |
| **Verification Method** | Automated test (unit + integration); manual security review |
| **Rollback Strategy** | Restore fail-open behavior; revert `_getMemberRole` fallback |

---

### XEN-GAP-0023 — Duplicate `analyze_document()` Method Override

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/agents/document_analyst/agent.py` |
| **Target Module** | Same (agent.py) |
| **Acceptance Criteria** | — First duplicate definition (lines 77–172) removed<br/>— Second version (lines 282–398) kept as canonical implementation<br/>— All callers verified to work correctly with single method<br/>— Improved error handling in remaining version<br/>— Tests pass with single method |
| **Verification Method** | Automated test (unit); code review |
| **Rollback Strategy** | Restore removed method definition |

---

### XEN-GAP-0024 — `req.workspaceId` Typo in ai-runtime Controller

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai-runtime/presentation/controllers/ai-runtime.controller.ts` |
| **Target Module** | Same (controller) |
| **Acceptance Criteria** | — Property name corrected from `req.workspaceId` to `req.workspaceId`<br/>— Sessions created with correct `workspaceId` value<br/>— Multi-tenant isolation restored for AI runtime<br/>— Unit tests verify workspace ID is correctly populated<br/>— No regression in other controller functionality |
| **Verification Method** | Automated test (unit + integration); code review |
| **Rollback Strategy** | Revert the property name change |

---

### XEN-GAP-0025 — No Cross-Encoder Re-Ranking in RAG

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/retriever.py` |
| **Target Module** | Same (retriever.py); Qdrant integration |
| **Acceptance Criteria** | — Cross-encoder re-ranker (e.g., BAAI/bge-reranker-v2-m3) applied to top 20 retrieval results<br/>— Re-scored results used for context building (top 20 → top 5)<br/>— Re-ranking improves contextual relevance of retrieved documents<br/>— Re-ranking latency is acceptable (<200ms added)<br/>— Fallback to pure vector search if re-ranker unavailable |
| **Verification Method** | Automated test (unit); manual relevance comparison; latency benchmark |
| **Rollback Strategy** | Disable cross-encoder re-ranking; restore pure vector search sorting |

---

### XEN-GAP-0026 — No Hybrid Search (Dense + Sparse)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/retriever.py` |
| **Target Module** | Same (retriever.py); Qdrant integration |
| **Acceptance Criteria** | — BM25 sparse retrieval implemented alongside dense vector search<br/>— Reciprocal Rank Fusion (RRF) for combining dense and sparse results<br/>— Hybrid search handles exact keyword matching (e.g., "IEC 60364")<br/>— Retrieval quality improved for keyword-specific queries<br/>— Performance impact of dual retrieval is acceptable |
| **Verification Method** | Automated test (unit + integration); keyword query accuracy comparison |
| **Rollback Strategy** | Disable hybrid search; restore pure vector search |

---

### XEN-GAP-0027 — No RAG Context Injection in Chat

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0025, XEN-GAP-0026 |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/application/services/ai.service.ts` |
| **Target Module** | Same (ai.service.ts); RAG retriever |
| **Acceptance Criteria** | — RAG retriever invoked before each chat message<br/>— Top-N relevant document chunks injected into the prompt context for source-grounded responses<br/>— LLM responds with access to organization's knowledge base (not just training data)<br/>— Responses include source citations when RAG context is used<br/>— Graceful degradation if RAG retrieval fails (continue with base LLM) |
| **Verification Method** | Automated test (integration); manual chat verification with known documents |
| **Rollback Strategy** | Remove RAG context injection; restore LLM-only responses |

---

### XEN-GAP-0028 — All Python Tool Functions Are Dead Code

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0007 |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/agents/electrical_engineer/tools.py` |
| **Target Module** | Same (tools.py); agent.py |
| **Acceptance Criteria** | — All 10+ tool functions (Ohm's Law, Power, Cable Sizing, Transformer, etc.) registered in agent via function-calling/ReAct loop<br/>— Agent dispatches calculations to engineering service via tools (not hardcoded values)<br/>— Tool functions no longer dead code — invoked in actual agent flows<br/>— Tests verify agent uses tools for calculation requests<br/>— Error handling for tool execution failures |
| **Verification Method** | Automated test (unit + integration); manual agent conversation with calculation request |
| **Rollback Strategy** | Remove tool registration; restore hardcoded if/else calculation dispatch |

---

### XEN-GAP-0029 — No Citation Engine

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 8 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0027 |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/schemas/outputs.py`, `app/agents/electrical_engineer/agent.py` |
| **Target Module** | Same modules; execution pipeline |
| **Acceptance Criteria** | — Citation engine tracks which document chunks/standards informed each claim<br/>— `Source` Pydantic model populated in responses (not empty list)<br/>— Citations formatted in responses with reference links to source documents<br/>— `execution.types.ts` — `retrievedDocuments` and `usedSources` fields added<br/>— `execution-pipeline.service.ts` — provenance tracking through stages |
| **Verification Method** | Automated test (unit + integration); manual response inspection for citations |
| **Rollback Strategy** | Remove citation tracking; restore empty `sources` response |

---

### XEN-GAP-0030 — No Hallucination Guardrails

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0029 |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/agents/electrical_engineer/agent.py` |
| **Target Module** | Same (agent.py); response validation layer |
| **Acceptance Criteria** | — Response grounding check implemented (claim-to-source verification)<br/>— "I don't know" detection — admit uncertainty when source-grounded confidence < threshold<br/>— Responses without source grounding include uncertainty disclaimer<br/>— Confidence scoring for AI responses<br/>— Conflicting source values detected and resolved with clear metadata |
| **Verification Method** | Automated test (unit + integration); manual review of responses to out-of-knowledge questions |
| **Rollback Strategy** | Remove guardrail checks; restore unvalidated response generation |

---

### XEN-GAP-0031 — No Evidence Chain / Provenance Tracking

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 3 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai-runtime/domain/types/execution.types.ts` |
| **Target Module** | Same (execution.types.ts); execution-pipeline.service.ts |
| **Acceptance Criteria** | — `ExecutionContext` gains `retrievedDocuments` and `usedSources` fields<br/>— Pipeline stages tracked with which documents were retrieved and which tools invoked<br/>— Provenance metadata attached to all AI responses<br/>— Execution result includes `stages[].sources[]` tracking which documents were retrieved<br/>— Evidence chain available for audit/inspection |
| **Verification Method** | Automated test (unit + integration); manual inspection of execution context |
| **Rollback Strategy** | Revert evidence chain fields; restore minimal execution context |

---

### XEN-GAP-0032 — No Confidence Engine

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/application/services/ai.service.ts` |
| **Target Module** | Same (ai.service.ts); new confidence engine module |
| **Acceptance Criteria** | — Confidence engine with logprob analysis implemented<br/>— Response consistency checking added<br/>— Source grounding strength scoring implemented<br/>— Calibrated confidence thresholds for different response types<br/>— Confidence scores returned alongside AI responses |
| **Verification Method** | Automated test (unit); manual confidence score validation |
| **Rollback Strategy** | Remove confidence engine; restore LLM-reported confidence only |

---

### XEN-GAP-0033 — No Conflict Resolution for RAG Sources

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0025 |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/vector_store.py` |
| **Target Module** | Same (vector_store.py); retriever.py |
| **Acceptance Criteria** | — Conflict detection identifies when retrieved documents give contradictory information<br/>— Temporal recency weighting applied for conflict resolution<br/>— Authority scoring based on document source credibility<br/>— Consensus-based resolution when majority of sources agree<br/>— Conflicting source metadata exposed in response provenance |
| **Verification Method** | Automated test (unit); manual review of conflict resolution scenarios |
| **Rollback Strategy** | Remove conflict resolution logic; restore single-source sorting |

---

### XEN-GAP-0034 — No Token-Aware Chunking

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/chunker.py` |
| **Target Module** | Same (chunker.py) |
| **Acceptance Criteria** | — Token-count-based chunking using model-specific tokenizers (replaces 500-word fixed count)<br/>— Hierarchical chunking respecting document structure (sections, paragraphs)<br/>— Code blocks and equations preserved intact (not split across chunks)<br/>— Section-header detection for intelligent chunk boundaries<br/>— Chunk size configurable per model context window |
| **Verification Method** | Automated test (unit); manual inspection of chunked document output |
| **Rollback Strategy** | Restore fixed word-count chunking; remove token-aware logic |

---

### XEN-GAP-0035 — N+1 Query Patterns

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/infrastructure/repositories/ai.repository.ts`, `knowledge.service.ts`, `subscription.service.ts` |
| **Target Module** | Same modules; database layer |
| **Acceptance Criteria** | — All N+1 queries fixed: use JOINs, eager loading, or batch loading patterns<br/>— `AiRepository.findConversation` — lazy message loading fixed<br/>— `KnowledgeService.getDashboardAnalytics` — DB-side filtering and aggregation instead of in-memory<br/>— `SubscriptionService.getActivePlan` — uses Prisma `include` instead of serial queries<br/>— Redundant re-fetches eliminated across all services |
| **Verification Method** | Automated test (integration); EXPLAIN ANALYZE verification |
| **Rollback Strategy** | Revert query changes individually per module |

---

### XEN-GAP-0036 — 30+ `SELECT *` in Raw SQL Queries

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | All repository files across project, ai, api-keys, auth, notification, engineering, feature-flags, consultations |
| **Target Module** | Same repositories |
| **Acceptance Criteria** | — All `SELECT *` replaced with explicit column lists matching entity mapper requirements<br/>— Data transfer reduced by 40-60% on affected queries<br/>— No regression in query results due to missing columns<br/>— All repositories reviewed and updated<br/>— Tests verify correct data mapping with explicit columns |
| **Verification Method** | Code review (grep for remaining `SELECT *`); automated test |
| **Rollback Strategy** | Revert per-file SELECT * changes individually |

---

### XEN-GAP-0037 — Manual UPSERT Instead of Prisma Native

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/project/infrastructure/repositories/project.repository.ts`, LLM provider retry logic |
| **Target Module** | Same modules |
| **Acceptance Criteria** | — All manual `SELECT` + `UPDATE`/`INSERT` patterns replaced with Prisma native `upsert`<br/>— Database round-trips reduced by 50% on affected operations<br/>— No regression in upsert behavior<br/>— Tests verify upsert creates and updates correctly |
| **Verification Method** | Automated test (unit + integration); code review |
| **Rollback Strategy** | Revert to manual SELECT + UPDATE/INSERT pattern |

---

### XEN-GAP-0038 — Raw SQL Instead of Prisma Client (AiRepository)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/infrastructure/repositories/ai.repository.ts` |
| **Target Module** | Same (ai.repository.ts) |
| **Acceptance Criteria** | — Simple CRUD operations migrated from `$queryRaw`/`$executeRaw` to Prisma client (`prisma.agents.findFirst`, etc.)<br/>— Complex queries retain raw SQL with typed parsers<br/>— Prisma middleware functional for AI repository operations<br/>— Type safety restored for CRUD operations<br/>— Tests verify all repository operations work correctly |
| **Verification Method** | Automated test (unit + integration); code review |
| **Rollback Strategy** | Revert to raw SQL implementation; restore `$queryRaw` approach |

---

### XEN-GAP-0039 — Sequential Multi-Collection RAG Retrieval

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 3 (also Sprint 14) |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/retriever.py` |
| **Target Module** | Same (retriever.py) |
| **Acceptance Criteria** | — All parallelizable collection searches use `asyncio.gather` for concurrent execution<br/>— Timeout per collection to bound latency<br/>— Multi-collection RAG retrieval runs in parallel (3x speedup with 3+ collections)<br/>— Error handling for collection-level failures (partial results still returned)<br/>— Performance improvement verified with metrics |
| **Verification Method** | Automated test (unit + integration); performance benchmark |
| **Rollback Strategy** | Revert to sequential for-loop collection search |

---

### XEN-GAP-0040 — Synchronous File I/O in Async Context (file_store.py)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 3 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/file_store.py` |
| **Target Module** | Same (file_store.py) |
| **Acceptance Criteria** | — `aiofiles` used for all async file I/O operations<br/>— `orjson` used for faster JSON serialization/deserialization<br/>— Python event loop no longer blocked by file operations<br/>— Performance improvement verified under concurrent access<br/>— Existing functionality preserved with no data corruption |
| **Verification Method** | Automated test (unit + integration); performance benchmark |
| **Rollback Strategy** | Revert to synchronous file I/O; restore `open/read/write` with `json.load`/`json.dump` |

---

### XEN-GAP-0041 — Full Content Loaded in List Views

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 2 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/knowledge/application/services/knowledge.service.ts` |
| **Target Module** | Same (knowledge.service.ts) |
| **Acceptance Criteria** | — List view queries select only required columns (title, slug, status, published_at)<br/>— Full content JSON column loaded only for detail view<br/>— Prisma `select` used for field-specific queries<br/>— Data transfer reduced for paginated list queries<br/>— No regression in list view functionality |
| **Verification Method** | Automated test (unit + integration); query logging verification |
| **Rollback Strategy** | Restore full content loading in list views |

---

### XEN-GAP-0042 — Qdrant `wait=True` on Every Upsert

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 2 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/qdrant_store.py` |
| **Target Module** | Same (qdrant_store.py) |
| **Acceptance Criteria** | — Bulk upserts use `wait=False` with a single `await client.collection.ensure()` at the end<br/>— Single document upserts may still use `wait=True` for consistency<br/>— Bulk ingestion performance improved 5-10x<br/>— Data consistency maintained after bulk operations<br/>— No regression in single-document upsert reliability |
| **Verification Method** | Automated test (unit + integration); performance benchmark |
| **Rollback Strategy** | Revert to `wait=True` on all upserts |

---

### XEN-GAP-0043 — Missing Cascade Deletes on 20+ Prisma Relations

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 7 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` |
| **Target Module** | Same (schema.prisma); all affected models |
| **Acceptance Criteria** | — `onDelete: Cascade` or `onDelete: SetNull` added to 20+ missing relations<br/>— `password_reset_tokens → users` relation added with cascade<br/>— Deleting a workspace cascades to all owned entities<br/>— Existing orphaned rows audited and cleaned up before migration<br/>— Prisma migration applies cleanly with no data loss |
| **Verification Method** | Automated test (integration); manual migration testing |
| **Rollback Strategy** | Revert schema changes; restore previous migration |

---

### XEN-GAP-0044 — 49+ String Fields Should Be Prisma Enums

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 2 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` |
| **Target Module** | Same (schema.prisma); all models with string status fields |
| **Acceptance Criteria** | — Prisma enums defined for all status/role/type fields (workspace_members.role, subscriptions.status, invoices.status, knowledge.status, etc.)<br/>— Migration handles existing data (maps current string values to enum values)<br/>— DB-level validation prevents invalid values<br/>— IDE support for valid enum values<br/>— TypeScript types updated accordingly |
| **Verification Method** | Automated test (unit); manual migration testing |
| **Rollback Strategy** | Revert schema changes; restore string fields; restore previous migration |

---

### XEN-GAP-0045 — UUIDs Stored as TEXT Instead of `@db.Uuid`

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 2 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` (all models) |
| **Target Module** | Same (schema.prisma); all 40+ entity tables |
| **Acceptance Criteria** | — `@db.Uuid` annotation added to all `id` and `*_id` columns<br/>— Zero-downtime migration strategy documented (new columns → backfill → swap → drop old)<br/>— Migration plan tested on staging<br/>— Index sizes reduced (~30% smaller)<br/>— `gen_random_uuid()` available at database level |
| **Verification Method** | Manual migration testing; EXPLAIN ANALYZE comparison |
| **Rollback Strategy** | Keep old TEXT columns; run reverse migration script |

---

### XEN-GAP-0046 — Missing Foreign Key Indexes (10+ FKs)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` |
| **Target Module** | Same (schema.prisma); database migration |
| **Acceptance Criteria** | — Indexes added to all unindexed FK columns: workspace_members.user_id, project_notes.created_by, project_reports.file_id, calculations.user_id, calculations.project_id, ai_usage.agent_id, file_versions.file_id, order_items.product_id, product_translations.product_id, subscription_payments.invoice_id, subscription_payments.payment_id<br/>— Missing indexes verified by `EXPLAIN ANALYZE` on known slow queries<br/>— Full table scans eliminated for FK-filtered queries<br/>— Migration applies without downtime |
| **Verification Method** | EXPLAIN ANALYZE verification; database index review |
| **Rollback Strategy** | Drop added indexes via reverse migration |

---

### XEN-GAP-0047 — Missing Composite Indexes for Common Query Patterns

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` |
| **Target Module** | Same (schema.prisma); database migration |
| **Acceptance Criteria** | — Composite indexes added: `messages(conversation_id, created_at)`, `knowledge(workspace_id, status, is_active)`, `projects(workspace_id, deleted_at)`, `usage_logs(workspace_id, feature, logged_at)`<br/>— Query performance improved for filtered/sorted queries<br/>— Migration applies without downtime<br/>— `EXPLAIN ANALYZE` shows index usage for target queries |
| **Verification Method** | EXPLAIN ANALYZE verification; query performance benchmark |
| **Rollback Strategy** | Drop added composite indexes via reverse migration |

---

### XEN-GAP-0048 — Missing `@updatedAt` on Mutable Models

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` |
| **Target Module** | Same (schema.prisma) |
| **Acceptance Criteria** | — `updated_at DateTime @updatedAt` added to all mutable models: sessions, password_reset_tokens, workspace_members, workspace_invitations, payments, transactions, calculation_templates, engineering_standards, agents, tags, product_translations, api_keys, webhooks, feature_flags, notifications, files<br/>— All mutable models have `updated_at` set automatically<br/>— Migration applies without data loss<br/>— Existing records get `updated_at` set to current timestamp |
| **Verification Method** | Automated test (unit); migration dry-run |
| **Rollback Strategy** | Drop added `updated_at` columns via reverse migration |

---

### XEN-GAP-0049 — In-Memory Analytics Sorting (CPU Hotspot)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 2 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/knowledge/application/services/knowledge.service.ts` |
| **Target Module** | Same (knowledge.service.ts) |
| **Acceptance Criteria** | — Analytics aggregation pushed to database with proper `GROUP BY`, `ORDER BY`, and `LIMIT` clauses<br/>— Application-level sorting and filtering eliminated<br/>— `ORDER BY views DESC LIMIT 10` used instead of in-memory sort<br/>— Performance improvement verified with large datasets<br/>— No regression in analytics data accuracy |
| **Verification Method** | Automated test (unit + integration); performance benchmark |
| **Rollback Strategy** | Restore in-memory analytics sorting |

---

### XEN-GAP-0050 — No Circuit Breaker for External Services

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 3 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/engineering/infrastructure/http/engineering-client.service.ts`, `vision-client.service.ts`, webhook delivery, Zarinpal |
| **Target Module** | Same modules; shared circuit breaker utility |
| **Acceptance Criteria** | — Circuit breaker implemented for all external HTTP calls (Engineering, Vision, AI services, Zarinpal, webhook delivery)<br/>— Circuit breaker trips after 5 failures in 60s window<br/>— Fallback or cached response returned when circuit is open<br/>— Automatic half-open testing and recovery<br/>— Configurable thresholds per service |
| **Verification Method** | Automated test (integration with simulated failures) |
| **Rollback Strategy** | Remove circuit breaker wrapper; restore direct HTTP calls |

---

### XEN-GAP-0051 — OpenAPI Regenerated on Every Build

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 3 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/package.json` |
| **Target Module** | Same (package.json); build process |
| **Acceptance Criteria** | — OpenAPI generation conditional on source file changes<br/>— Excluded from CI build or cached until API-contract files change<br/>— Build overhead reduced by 5-15s<br/>— Manual regeneration still available for development<br/>— OpenAPI spec remains up-to-date when API changes |
| **Verification Method** | Build timing comparison; manual verification |
| **Rollback Strategy** | Restore unconditional OpenAPI generation |

---

### XEN-GAP-0052 — Cross-Module Coupling Causing Eager Loading

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 2 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/engineering/application/services/engineering.service.ts` |
| **Target Module** | All modules with deep cross-module imports; shared event bus |
| **Acceptance Criteria** | — Cross-module communication via shared interfaces or event bus<br/>— Direct service imports replaced with module-based DI or message passing<br/>— Deep relative import paths (>3 levels) eliminated<br/>— Module startup time improved<br/>— No circular dependencies introduced |
| **Verification Method** | Automated test (module loading); code review; import path analysis |
| **Rollback Strategy** | Revert to direct service imports per module |

---

### XEN-GAP-0053 — Pretty-Printed JSON in LLM Prompts

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 2 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/application/services/ai.service.ts` |
| **Target Module** | Same (ai.service.ts); all prompt builders |
| **Acceptance Criteria** | — `JSON.stringify(inputs, null, 2)` replaced with compact `JSON.stringify(inputs)` in LLM prompts<br/>— Token count reduced by 30-50% on affected prompts<br/>— No degradation in LLM response quality<br/>— Pretty-print reserved for debugging/logging only<br/>— All prompt templates updated |
| **Verification Method** | Code review; token count comparison |
| **Rollback Strategy** | Restore pretty-printed JSON in prompts |

---

### XEN-GAP-0054 — `health` Module Flat Structure (No DDD)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/health/` |
| **Target Module** | Same (health module) |
| **Acceptance Criteria** | — Health module refactored to follow DDD layer structure (`domain/`, `application/`, `infrastructure/`, `presentation/`)<br/>— Health service properly depends on injected repository interfaces<br/>— No functional regression in health endpoints<br/>— Consistent with other 22 DDD-compliant modules<br/>— All existing tests pass |
| **Verification Method** | Code review; automated test |
| **Rollback Strategy** | Restore flat health module structure |

---

### XEN-GAP-0055 — Prisma Client Leaked into Application Layer

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/admin/application/services/admin.service.ts`, `auth.service.ts`, `knowledge.service.ts`, `taxonomy.controller.ts` |
| **Target Module** | Same modules; new repository interfaces |
| **Acceptance Criteria** | — All `prisma.*` calls moved from application/presentation layers to infrastructure repositories<br/>— `PrismaClient` removed from `admin.service.ts`, `auth.service.ts`, `knowledge.service.ts`, `taxonomy.controller.ts`<br/>— Services depend on repository interfaces only (not Prisma directly)<br/>— No Prisma imports in `application/` layer or controllers<br/>— All existing functionality preserved |
| **Verification Method** | Code review (grep for prisma imports in app layer); automated test |
| **Rollback Strategy** | Revert repository extraction; restore direct prisma.* calls |

---

### XEN-GAP-0056 — `AiService` Depends on `LlmProvider` Directly (Infrastructure Leak)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/ai/application/services/ai.service.ts` |
| **Target Module** | Same (ai.service.ts); new `ILlmProvider` interface |
| **Acceptance Criteria** | — `ILlmProvider` interface extracted from `LlmProvider`<br/>— `AiService` depends on interface only (not concrete implementation)<br/>— `LlmProvider` implements `ILlmProvider`<br/>— DI injects implementation via interface token<br/>— Hexagonal architecture compliance achieved |
| **Verification Method** | Code review; automated test |
| **Rollback Strategy** | Remove interface abstraction; restore direct dependency |

---

### XEN-GAP-0057 — 5 Enterprise Stub Modules Empty

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/enterprise-background/`, `enterprise-backup/`, `enterprise-config/`, `enterprise-performance/`, `knowledge-factory/` |
| **Target Module** | Same modules |
| **Acceptance Criteria** | — Either implemented with full DDD structure<br/>— Or removed from main branch with feature roadmap entries documenting planned scope<br/>— Empty directory scaffolding removed<br/>— If kept: registered in `api.module.ts` with working endpoints<br/>— Consistent with project architecture standards |
| **Verification Method** | Code review; directory listing |
| **Rollback Strategy** | Restore stub directories; unregister from `api.module.ts` |

---

### XEN-GAP-0058 — `@nestjs/platform-express` Dead Dependency

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/package.json` |
| **Target Module** | Same (package.json) |
| **Acceptance Criteria** | — `@nestjs/platform-express` removed from `apps/api/package.json`<br/>— No accidental Express dependency in production image<br/>— All tests pass without Express adapter<br/>— No Fastify compatibility regressions<br/>— Docker image size reduced |
| **Verification Method** | Build verification; automated test |
| **Rollback Strategy** | Re-add `@nestjs/platform-express` to `package.json` |

---

### XEN-GAP-0059 — No CI/CD Pipeline

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | Multiple pre-sprint gaps (lint, tests, build) |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | Repository root (`.github/`) |
| **Target Module** | Same (`.github/`) |
| **Acceptance Criteria** | — GitHub Actions CI pipeline: install → lint → typecheck → test (unit + e2e) → build<br/>— Deploy job for staging on push to main<br/>— Quality gates block merges on failure<br/>— CI pipeline runs all jobs in <10 minutes<br/>— PR with failing test cannot merge |
| **Verification Method** | Manual pipeline run; GitHub status check review |
| **Rollback Strategy** | Disable GitHub Actions workflows; restore manual deploy process |

---

### XEN-GAP-0060 — Lint Broken for 4 of 6 Packages

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 7 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/package.json`, `apps/web/package.json`, `@xennic/database`, `@xennic/shared` |
| **Target Module** | Same packages; root ESLint config |
| **Acceptance Criteria** | — All 6 packages have working lint scripts<br/>— ESLint configuration unified across packages<br/>— Web build hang (Next.js timeout) resolved or documented with workaround<br/>— `pnpm lint` passes on all 6 packages<br/>— Pre-commit hooks prevent commit on lint failure |
| **Verification Method** | `pnpm lint` execution; CI pipeline verification |
| **Rollback Strategy** | Revert ESLint config changes per package |

---

### XEN-GAP-0061 — 95 Bare `catch` Blocks Silently Swallowing Errors

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 7 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | All modules: api-keys, admin, notification, and all repositories |
| **Target Module** | All modules with bare catch blocks |
| **Acceptance Criteria** | — All 95 bare catch blocks fixed<br/>— Every `catch` must log (using structured Logger), re-throw domain exception, or handle explicitly<br/>— `ai.repository.ts` — `catch { return null; }` → proper error logging + propagation<br/>— `admin.service.ts` — all silent swallows fixed<br/>— `billing.service.ts` — `throw new Error()` → `HttpException`<br/>— Zero bare catch blocks in production code |
| **Verification Method** | Code review (grep for bare catch); automated lint rule |
| **Rollback Strategy** | Revert per-file catch block changes; restore silent swallows |

---

### XEN-GAP-0062 — 54 `console.*` Calls Instead of Structured Logger

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | All modules; `apps/api/src/main.ts` |
| **Target Module** | All modules; NestJS Logger |
| **Acceptance Criteria** | — All 54 `console.log`/`console.error` replaced with injected NestJS `Logger`<br/>— `all-exceptions.filter.ts` — `console.error` → Logger<br/>— `auth.service.ts` — console audit → `audit_logs` DB table<br/>— Structured JSON logging with context fields (timestamp, level, module, requestId)<br/>— Zero `console.log`/`console.error` in production code |
| **Verification Method** | Code review (grep for console.*); automated lint rule |
| **Rollback Strategy** | Revert per-file console-to-Logger changes |

---

### XEN-GAP-0063 — 50+ `as any` Casts Bypassing Type Safety

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 6 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | All modules (278 source files with `any`/`as any` usage) |
| **Target Module** | All modules; `tsconfig.json` |
| **Acceptance Criteria** | — All `any` types replaced with proper TypeScript types/generics<br/>— `noImplicitAny` and `strictNullChecks` enabled in tsconfig<br/>— Raw SQL wrappers use typed parsers<br/>— `as any` count reduced from 50+ to <15 (grandfathered where impossible)<br/>— No regression in compilation |
| **Verification Method** | TypeScript compiler check; ESLint rule (`@typescript-eslint/no-explicit-any`) |
| **Rollback Strategy** | Revert per-file type fixes; relax tsconfig strictness |

---

### XEN-GAP-0064 — 6 Classes Over 300 Lines (SRP Violations)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 5 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `knowledge.service.ts` (801 lines), `admin.service.ts` (583 lines), `billing.repository.ts` (380), `billing.service.ts` (360), `workspace.service.ts` (394), `marketplace.repository.ts` (357) |
| **Target Module** | Same modules (split into focused services) |
| **Acceptance Criteria** | — Large classes split into focused services following SRP<br/>— `knowledge.service.ts` → `KnowledgeCrudService`, `TaxonomyService`, `AnalyticsService`, `FormulaService`<br/>— `admin.service.ts` → `AdminStatsService`, `AdminUserService`, `AdminWorkspaceService`<br/>— `knowledge.service.ts` <300 lines, `admin.service.ts` <300 lines<br/>— All existing functionality preserved; callers updated |
| **Verification Method** | Code review; line count check |
| **Rollback Strategy** | Revert per-class splitting; restore monolithic service files |

---

### XEN-GAP-0065 — Pagination Boilerplate Duplicated ~25 Times

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 5 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | All modules (billing, project, webhooks, feature-flags, search, marketplace, knowledge, standards, api-keys, notification) |
| **Target Module** | `@xennic/shared`; all ~25 callers |
| **Acceptance Criteria** | — Shared pagination utility extracted to `@xennic/shared`<br/>— All modules import and use the shared pagination function (no inline page/limit/offset)<br/>— Pagination uses shared utility (no inline duplication)<br/>— All ~25 callers updated<br/>— Backward compatible with existing clients |
| **Verification Method** | Code review; automated test |
| **Rollback Strategy** | Revert per-module pagination changes; restore inline pagination |

---

### XEN-GAP-0066 — CORS `["*"]` in Python Microservices

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 5 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/vision-service/app/main.py`, `workspace/services/engineering-service/src/main.py` |
| **Target Module** | Same modules |
| **Acceptance Criteria** | — CORS origins restricted per environment<br/>— Production uses specific origins (API gateway domain)<br/>— Development can use wildcard internally<br/>— Python services reject requests from unexpected origins in production<br/>— Python FastAPI middleware for security headers added |
| **Verification Method** | Automated test (integration); manual CORS header inspection |
| **Rollback Strategy** | Restore `origins=["*"]` in Python services |

---

### XEN-GAP-0067 — `password_reset_tokens` Has No Relation to `users`

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 5 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` |
| **Target Module** | Same (schema.prisma); `password_reset_tokens` and `users` models |
| **Acceptance Criteria** | — `user users @relation(fields: [user_id], references: [id], onDelete: Cascade)` added to `password_reset_tokens`<br/>— Relation added to `users` model (`password_reset_tokens password_reset_tokens[]`) <br/>— Orphaned tokens cleaned up by cascade on user delete<br/>— Typed Prisma relation enables type-safe JOINs<br/>— Migration applies cleanly |
| **Verification Method** | Automated test (integration); migration review |
| **Rollback Strategy** | Remove added relation; restore standalone `password_reset_tokens` |

---

### XEN-GAP-0068 — `user_roles` Has No Relation to `workspace`

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 5 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` |
| **Target Module** | Same (schema.prisma); `user_roles` and `workspaces` models |
| **Acceptance Criteria** | — `workspace workspaces @relation(fields: [workspace_id], references: [id])` added to `user_roles` model<br/>— Aggregate connection between RBAC and tenant context established<br/>— Typed Prisma relation enables workspace-scoped role queries<br/>— Migration applies cleanly |
| **Verification Method** | Automated test (integration); migration review |
| **Rollback Strategy** | Remove added relation; restore standalone `user_roles` |

---

### XEN-GAP-0069 — Missing `@map`/`@@schema` Annotations for Better Schema Organization

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 3 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` |
| **Target Module** | Same (schema.prisma) |
| **Acceptance Criteria** | — `@@schema` annotations added to organize models by domain context<br/>— `@@map` used for explicit table names<br/>— Models grouped logically in generated Prisma client<br/>— No functional change — purely organizational improvements<br/>— Migration applies cleanly |
| **Verification Method** | Code review; Prisma client generation check |
| **Rollback Strategy** | Remove added annotations; restore original schema |

---

### XEN-GAP-0070 — No MFA/2FA Support

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 4 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/auth/` |
| **Target Module** | Same (auth module); user settings |
| **Acceptance Criteria** | — TOTP-based 2FA implemented<br/>— Backup codes provided (10 codes)<br/>— QR code setup flow for authenticator apps<br/>— 2FA enforcement configurable per workspace<br/>— Tests verify 2FA enrollment, verification, and recovery |
| **Verification Method** | Automated test (unit + integration); manual QR code verification |
| **Rollback Strategy** | Remove MFA feature flag; disable 2FA enforcement in auth module |

---

### XEN-GAP-0071 — No Account Lockout After Failed Attempts

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 4 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/auth/application/services/auth.service.ts` |
| **Target Module** | Same (auth.service.ts) |
| **Acceptance Criteria** | — Account lockout after 5 consecutive failed login attempts<br/>— Lockout duration configurable (default: 15 minutes)<br/>— Exponential backoff for repeated lockout events<br/>— Email notification sent on lockout<br/>— 5 failed login attempts → account locked for 15 min |
| **Verification Method** | Automated test (unit + integration); manual testing |
| **Rollback Strategy** | Remove lockout logic; restore unlimited login attempts |

---

### XEN-GAP-0072 — No Audit Trail for Security Events

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 12 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/auth/application/services/auth.service.ts`, `prisma/schema.prisma` (audit_logs table) |
| **Target Module** | Same modules; audit service |
| **Acceptance Criteria** | — Auth events written to `audit_logs` table (login, logout, password change, role assignment, permission changes)<br/>— Structured audit logging for all security-relevant events<br/>— Console.log audit events migrated to DB<br/>— Audit logs queryable and filterable<br/>— No regression in auth performance |
| **Verification Method** | Automated test (integration); manual audit log inspection |
| **Rollback Strategy** | Remove audit logging; restore console-based audit |

---

### XEN-GAP-0073 — No Request ID / Distributed Tracing

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 14 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/main.ts` |
| **Target Module** | Same (main.ts); shared middleware |
| **Acceptance Criteria** | — Middleware generates/forwards `X-Request-ID` header<br/>— Request ID integrated with NestJS Logger<br/>— Request ID passed to Python services via HTTP headers<br/>— Correlating logs across API, workers, and microservices possible via request ID<br/>— OpenTelemetry tracing considered for future |
| **Verification Method** | Automated test (integration); manual log correlation verification |
| **Rollback Strategy** | Remove request ID middleware; restore no-ID logging |

---

### XEN-GAP-0074 — Magic Numbers / Hardcoded Constants Scattered

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 14 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/api.module.ts`, `main.ts`, all modules with hardcoded values |
| **Target Module** | `@xennic/shared`; env variables |
| **Acceptance Criteria** | — All tunable constants moved to environment variables with typed defaults<br/>— Centralized constants file in `@xennic/shared` for non-env values<br/>— Magic numbers eliminated across all modules (rate limits, file sizes, TTLs, page sizes, temperatures)<br/>— Configuration changes no longer require code changes<br/>— Default values documented |
| **Verification Method** | Code review; grep for hardcoded numeric literals |
| **Rollback Strategy** | Revert per-file constant extraction; restore hardcoded values |

---

### XEN-GAP-0075 — No Pre-Commit Hooks

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 14 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0060 |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | Repository root (`.git/hooks/`) |
| **Target Module** | Same (new pre-commit hooks) |
| **Acceptance Criteria** | — Pre-commit hooks configured (husky or similar) for linting, formatting check, and type checking<br/>— commitlint for conventional commit messages<br/>— Pre-push hook running tests<br/>— Pre-commit hooks prevent commit on lint failure<br/>— 14 sample hooks replaced with active hooks |
| **Verification Method** | Manual commit attempt with intentional lint error |
| **Rollback Strategy** | Disable husky hooks; restore disabled sample hooks |

---

### XEN-GAP-0076 — `venv/` Not in `.gitignore` (Git Pollution)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `.gitignore` |
| **Target Module** | Same (`.gitignore`) |
| **Acceptance Criteria** | — `venv/`, `__pycache__/`, and `*.pyc` added to `.gitignore`<br/>— `git status` shows no `.pyc` or `venv/` files<br/>— Existing tracked `.pyc` files removed from tracking<br/>— No regression in other gitignore patterns<br/>— All environments benefit from cleaner git status |
| **Verification Method** | `git status` verification after update |
| **Rollback Strategy** | Remove added patterns from `.gitignore` |

---

### XEN-GAP-0077 — Backpressure Not Handled for Streaming

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 1 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/engineering/presentation/controllers/engineering.controller.ts` |
| **Target Module** | Same (engineering controller); streaming infrastructure |
| **Acceptance Criteria** | — Proper Node.js backpressure for streaming responses<br/>— Message queue (RabbitMQ/Bull) for email, webhook, notification delivery<br/>— Circuit breaker pattern for external calls<br/>— Stream reads use proper flow control (not `for await...of` without backpressure)<br/>— Tests verify backpressure behavior under load |
| **Verification Method** | Automated test (integration); load test |
| **Rollback Strategy** | Remove backpressure handling; restore unbounded streaming |

---

### XEN-GAP-0078 — No `OnModuleDestroy` Lifecycle Hooks

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 13 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | All modules holding external connections (Prisma, MinIO, Redis) |
| **Target Module** | Same modules |
| **Acceptance Criteria** | — `OnModuleDestroy` implemented in modules holding external connections<br/>— Prisma connection gracefully closed on shutdown<br/>— MinIO client disconnected on shutdown<br/>— Redis connections closed on shutdown<br/>— SIGTERM triggers proper cleanup |
| **Verification Method** | Manual shutdown test; automated lifecycle test |
| **Rollback Strategy** | Remove `OnModuleDestroy` implementations; restore default lifecycle |

---

### XEN-GAP-0079 — No Retry Policy for External HTTP Calls

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 14 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/engineering/infrastructure/http/engineering-client.service.ts`, `vision-client.service.ts`, `ZarinpalGateway`, webhook delivery |
| **Target Module** | Same modules; shared retry utility |
| **Acceptance Criteria** | — Retry with exponential backoff (+ jitter) implemented for all external HTTP calls<br/>— Configurable max retries per service (default: 3 retries, 1s/2s/4s)<br/>— Retry for 429 (rate limit) and 5xx responses<br/>— External service failures retry 3 times with backoff before failing<br/>— Existing retry in LlmProvider standardized |
| **Verification Method** | Automated test (integration with simulated failures) |
| **Rollback Strategy** | Remove retry wrapper; restore single-attempt HTTP calls |

---

### XEN-GAP-0080 — No `@nestjs/config` Initialized

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 2 |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/api.module.ts` |
| **Target Module** | Same (`api.module.ts`) |
| **Acceptance Criteria** | — `ConfigModule.forRoot({ isGlobal: true })` added to `api.module.ts`<br/>— All `process.env` reads replaced with `ConfigService.get()` calls<br/>— Typed config service with validation<br/>— Missing env vars cause startup failure with clear message<br/>— All services use injected `ConfigService` |
| **Verification Method** | Automated test (startup validation); code review |
| **Rollback Strategy** | Remove `ConfigModule.forRoot()`; restore `process.env` reads |

---

### XEN-GAP-0081 — 15 Python Tests Failing in Engineering Service

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 4 |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/engineering-service/tests/` |
| **Target Module** | Same (tests); engineering-service API |
| **Acceptance Criteria** | — All 15 failing tests passing<br/>— Root causes fixed: API routing changes, schema refactoring, race conditions<br/>— `test_basic_api.py` (6 failures — ActivePower, ApparentPower, ReactivePower, PowerFactor, OhmsLaw) fixed<br/>— `test_pq_integration.py` (4 failures — THD, TDD, Resonance, ActiveFilter) fixed<br/>— `test_registry.py` (1 thread safety failure) fixed<br/>— All 434 engineering-service tests pass (0 failures) |
| **Verification Method** | `pytest` execution; CI pipeline test job |
| **Rollback Strategy** | Revert API/schema changes that caused test failures |

---

### XEN-GAP-0082 — 21 of 27 API Modules Have Zero Tests

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 4 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | High |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/*/` |
| **Target Module** | All 27 modules |
| **Acceptance Criteria** | — Minimum 60% line coverage across all modules<br/>— Unit tests for all service methods<br/>— Controller tests for all endpoints<br/>— Priority coverage on auth, RBAC, engineering, and billing modules<br/>— Overall coverage threshold enforced in CI |
| **Verification Method** | Jest coverage report; CI pipeline |
| **Rollback Strategy** | Remove test files temporarily; revert jest config changes |

---

### XEN-GAP-0083 — No Frontend Tests (apps/web)

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 4 |
| **Owner** | Backend Engineer (FE support) |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/web/` |
| **Target Module** | Same (apps/web); test framework |
| **Acceptance Criteria** | — Vitest + React Testing Library configured<br/>— Unit tests for key components and pages<br/>— Integration tests for API interaction flows<br/>— Frontend tests run in CI<br/>— 10+ component tests for critical pages |
| **Verification Method** | Test execution; CI pipeline |
| **Rollback Strategy** | Revert test configuration; remove test files |

---

### XEN-GAP-0084 — No Integration/E2E Tests for Core Flows

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 4 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0082 |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/test/` |
| **Target Module** | Same (test directory) |
| **Acceptance Criteria** | — E2E tests for all critical user journeys<br/>— Integration tests for cross-module flows (auth → RBAC → workspace → project → calculation)<br/>— Real PostgreSQL database via testcontainers<br/>— Auth flow: register → login → refresh → logout<br/>— Workspace flow: create → settings → members → dashboard<br/>— Project flow: create → add members → create calculation |
| **Verification Method** | E2E test execution; CI pipeline |
| **Rollback Strategy** | Remove added E2E test files; restore original test structure |

---

### XEN-GAP-0085 — No Concurrency/Race Condition Tests

| Field | Value |
|-------|-------|
| **Sprint** | Sprint 4 |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | All modules with concurrent access patterns |
| **Target Module** | New concurrency test suite |
| **Acceptance Criteria** | — Concurrency tests for workspace isolation (10 parallel requests)<br/>— Concurrency tests for subscription plan changes under load<br/>— Concurrency tests for billing operations under simultaneous access<br/>— Concurrency tests for duplicate registration prevention<br/>— Workspace A cannot access workspace B data under concurrent access |
| **Verification Method** | Concurrency test execution; load test |
| **Rollback Strategy** | Remove concurrency test files; reduce parallel execution |

---

### XEN-GAP-0086 — `README.md` Is a Security Document (Misleading)

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | All Engineers |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `/README.md` |
| **Target Module** | Same (README.md) |
| **Acceptance Criteria** | — Proper project README with: project description, architecture overview, setup instructions, development guide, deployment guide<br/>— Links to security policy and other docs<br/>— Security hardening content moved to dedicated security doc<br/>— README gives new contributors clear onboarding<br/>— Markdown formatting consistent with rest of project |
| **Verification Method** | Manual review |
| **Rollback Strategy** | Revert README.md to previous version |

---

### XEN-GAP-0087 — No ADR (Architecture Decision Records)

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | All Engineers |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | N/A (this IS the ADR trigger) |
| **Source Module** | `docs/adr/` |
| **Target Module** | Same (new directory) |
| **Acceptance Criteria** | — `docs/adr/` directory created<br/>— Initial ADRs created for: DDD adoption, Fastify choice, multi-tenant strategy, Prisma ORM selection<br/>— Each ADR follows standard template (title, status, context, decision, consequences)<br/>— ADRs referenced from affected modules<br/>— ADR index page created |
| **Verification Method** | Manual review |
| **Rollback Strategy** | Remove ADR files; delete `docs/adr/` directory |

---

### XEN-GAP-0088 — Stale `.eslintrc.cjs` Coexists with `eslint.config.mjs`

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | Repository root |
| **Target Module** | Same (`.eslintrc.cjs`) |
| **Acceptance Criteria** | — `.eslintrc.cjs` deleted after verifying flat config covers all needed rules<br/>— No lint regression after removal<br/>— All packages still pass `pnpm lint`<br/>— Clean separation between legacy and flat config eliminated |
| **Verification Method** | `pnpm lint` verification after deletion |
| **Rollback Strategy** | Restore `.eslintrc.cjs` from git history |

---

### XEN-GAP-0089 — `packages/shared` and `packages/types` Underutilized

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `packages/shared`, `packages/types` |
| **Target Module** | Same packages; all consuming modules |
| **Acceptance Criteria** | — Common types migrated to `@xennic/types`<br/>— Shared utilities (pagination, DTO base classes, response helpers) moved to `@xennic/shared`<br/>— AI types package created for cross-module AI type reuse<br/>— Duplicate type definitions eliminated across modules<br/>— All existing imports updated to use shared packages |
| **Verification Method** | Code review; import analysis |
| **Rollback Strategy** | Revert per-module import changes; restore local type definitions |

---

### XEN-GAP-0090 — Spec Files Excluded from tsconfig (ESLint Errors)

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `tsconfig.json`, `eslint.config.mjs` |
| **Target Module** | Same files; new `tsconfig.eslint.json` |
| **Acceptance Criteria** | — `tsconfig.eslint.json` created that extends main config and includes spec files<br/>— ESLint `parserOptions.project` pointed to new config<br/>— Type-aware lint rules apply to test files<br/>— No ESLint parsing errors on `.spec.ts` files<br/>— Lint passes for all spec files |
| **Verification Method** | `pnpm lint` execution on spec files |
| **Rollback Strategy** | Revert tsconfig changes; restore spec file exclusion |

---

### XEN-GAP-0091 — No Security Headers (Helmet) in Python Services

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/engineering-service/src/main.py`, `workspace/services/vision-service/app/main.py`, `workspace/services/ai-service/app/main.py` |
| **Target Module** | Same modules |
| **Acceptance Criteria** | — FastAPI middleware added for security headers in all Python services<br/>— CORS origins restricted per environment (not wildcard)<br/>— Rate limiting at service level<br/>— Security headers: X-Content-Type-Options, X-Frame-Options, etc.<br/>— Tests verify headers present in responses |
| **Verification Method** | Automated test (integration); manual header inspection |
| **Rollback Strategy** | Remove security middleware; restore unsecured Python service configuration |

---

### XEN-GAP-0092 — AuthThrottlerGuard Not Applied to Auth Controller

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/modules/auth/presentation/controllers/auth.controller.ts` |
| **Target Module** | Same (auth.controller.ts) |
| **Acceptance Criteria** | — `@UseGuards(AuthThrottlerGuard)` added to auth controller endpoints (register, login)<br/>— Auth endpoints use specific rate limit (5 req/60s)<br/>— General `ThrottlerGuard` still applied to all other endpoints<br/>— Tests verify rate limiting on auth endpoints<br/>— Rate limit config moved to env vars |
| **Verification Method** | Automated test (integration); manual rate limit testing |
| **Rollback Strategy** | Remove `AuthThrottlerGuard`; restore general throttler only |

---

### XEN-GAP-0093 — No Token-Aware Chunking / Hierarchical Chunking

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/chunker.py` |
| **Target Module** | Same (chunker.py) |
| **Acceptance Criteria** | — Token-count-based chunking with model-specific tokenizers (replaces 500-word count)<br/>— Hierarchical chunking respecting document structure (sections, paragraphs)<br/>— Code blocks and equations preserved intact<br/>— Section-header detection for intelligent chunk boundaries<br/>— Semantic chunking for related content grouping |
| **Verification Method** | Automated test (unit); manual chunking quality review |
| **Rollback Strategy** | Restore fixed 500-word chunking |

---

### XEN-GAP-0094 — Document Deduplication Not Implemented

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/` |
| **Target Module** | Same (RAG pipeline) |
| **Acceptance Criteria** | — Content hashing (SHA-256) computed before indexing<br/>— Duplicate detection prevents re-indexing same content<br/>— Version history tracked for updated documents<br/>— Checksum-based comparison (not filename) for dedup<br/>— Performance impact of hashing is negligible |
| **Verification Method** | Automated test (unit + integration) |
| **Rollback Strategy** | Remove dedup logic; allow re-indexing of identical content |

---

### XEN-GAP-0095 — RAG Cache Unbounded with No TTL

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | AI/ML Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0020 |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `workspace/services/ai-service/app/rag/retriever.py` |
| **Target Module** | Same (retriever.py); Redis cache |
| **Acceptance Criteria** | — Redis-based cache with TTL (not unbounded dictionary)<br/>— LRU eviction for cache size management<br/>— Cache key uses normalized query embedding hash (not full query text)<br/>— Cache shared across workers (not per-worker)<br/>— Cache hit ratio measurable |
| **Verification Method** | Automated test (unit + integration); cache hit ratio monitoring |
| **Rollback Strategy** | Remove Redis cache; restore per-worker unbounded dictionary cache |

---

### XEN-GAP-0096 — No Bull/Queue for Background Jobs

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0020 |
| **Risk** | Medium |
| **Architecture Doc** | TBD |
| **Source Module** | All modules with synchronous background work (email, report generation, knowledge indexing) |
| **Target Module** | New `workers/` directory; Bull/BullMQ configuration |
| **Acceptance Criteria** | — Bull/BullMQ configured with Redis<br/>— Email sending moved to background job<br/>— Report generation moved to background job<br/>— Knowledge indexing moved to background job<br/>— `workers/` directory created with worker packages<br/>— Job status tracking and failure handling |
| **Verification Method** | Automated test (integration); manual job queue monitoring |
| **Rollback Strategy** | Remove Bull/BullMQ; restore synchronous background processing |

---

### XEN-GAP-0097 — No `.nvmrc` or `.node-version` Files

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | Repository root |
| **Target Module** | Same (new `.nvmrc` and `.node-version`) |
| **Acceptance Criteria** | — `.nvmrc` added specifying supported Node.js version (e.g., 20.x LTS)<br/>— `.node-version` added for other Node version managers<br/>— Both files committed to repo<br/>— Build consistency across developer environments improved |
| **Verification Method** | Manual file review |
| **Rollback Strategy** | Remove `.nvmrc` and `.node-version` files |

---

### XEN-GAP-0098 — `is_admin` Duplicates RBAC System

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | Backend Engineer |
| **Status** | Not Started |
| **Dependencies** | XEN-GAP-0022 |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `prisma/schema.prisma` (users table), authorization code |
| **Target Module** | Same (schema.prisma); authorization service |
| **Acceptance Criteria** | — `is_admin` deprecated; all super-admin checks migrated to use `SUPER_ADMIN` role via `user_roles`<br/>— No authorization code references `is_admin`<br/>— Column removed after migration<br/>— Dual authorization paths consolidated to single RBAC path<br/>— No regression in admin functionality |
| **Verification Method** | Code review (grep for is_admin); automated test |
| **Rollback Strategy** | Restore `is_admin` column; re-add dual authorization paths |

---

### XEN-GAP-0099 — No Global `X-Request-ID` Tracing

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/src/main.ts` |
| **Target Module** | Same (main.ts); shared middleware |
| **Acceptance Criteria** | — Middleware generates/forwards `X-Request-ID`<br/>— Request ID integrated with NestJS Logger<br/>— Request ID passed to Python services via HTTP headers<br/>— Correlating logs across API, workers, and microservices possible<br/>— `X-Request-ID` included in API responses |
| **Verification Method** | Automated test (integration); manual log correlation |
| **Rollback Strategy** | Remove tracing middleware; restore no-ID logging |

---

### XEN-GAP-0100 — `@nestjs/throttler` in devDependencies Instead of dependencies

| Field | Value |
|-------|-------|
| **Sprint** | Unassigned |
| **Owner** | DevOps Engineer |
| **Status** | Not Started |
| **Dependencies** | None |
| **Risk** | Low |
| **Architecture Doc** | TBD |
| **Source Module** | `apps/api/package.json`, `apps/web/package.json` |
| **Target Module** | Same files |
| **Acceptance Criteria** | — `@nestjs/throttler` moved to `dependencies` in both `apps/api/package.json` and `apps/web/package.json`<br/>— Rate limiting available in production builds<br/>— No runtime resolution failures<br/>— All tests pass after dependency move<br/>— Docker image includes throttler in production |
| **Verification Method** | Build verification; test execution |
| **Rollback Strategy** | Move `@nestjs/throttler` back to `devDependencies` |

---

## Quick Reference Tables

### Gaps by Priority

| Priority | Gap IDs |
|----------|---------|
| **P0 (Critical)** | 0001, 0002, 0003, 0004, 0005, 0006, 0007, 0008, 0009, 0010, 0011, 0012, 0013, 0014, 0015, 0016, 0017, 0018, 0019, 0020 |
| **P1 (High)** | 0021, 0022, 0025, 0026, 0027, 0028, 0029, 0030, 0035, 0036, 0037, 0038, 0039, 0040, 0043, 0044, 0045, 0046, 0047, 0050, 0055, 0059, 0060, 0061, 0062, 0063, 0064, 0066, 0070, 0071, 0081, 0082, 0083, 0091, 0092, 0093, 0096 |
| **P2 (Medium)** | 0023, 0024, 0031, 0032, 0033, 0034, 0041, 0042, 0048, 0049, 0052, 0053, 0054, 0056, 0057, 0058, 0065, 0067, 0068, 0072, 0073, 0074, 0075, 0077, 0078, 0079, 0080, 0084, 0085, 0086, 0089, 0090, 0094, 0095, 0098, 0099, 0100 |
| **P3 (Low)** | 0048, 0051, 0069, 0076, 0087, 0088, 0097 |

### Gaps by Category

| Category | Gap IDs |
|----------|---------|
| **Security** | 0001, 0002, 0003, 0004, 0005, 0006, 0019, 0022, 0066, 0070, 0071, 0072, 0091, 0092 |
| **AI** | 0007, 0008, 0009, 0015, 0021, 0023, 0024, 0025, 0026, 0027, 0028, 0029, 0030, 0031, 0032, 0033, 0034, 0093, 0094, 0095 |
| **Performance** | 0012, 0020, 0035, 0036, 0037, 0039, 0040, 0041, 0042, 0049, 0053 |
| **Database** | 0013, 0016, 0038, 0043, 0044, 0045, 0046, 0047, 0048, 0067, 0068, 0069 |
| **Runtime** | 0010, 0017, 0050, 0077, 0078, 0079 |
| **Infrastructure** | 0011, 0058, 0080, 0096, 0097, 0100 |
| **API** | 0014 |
| **Architecture** | 0052, 0054, 0055, 0056, 0057, 0098 |
| **Code Quality** | 0061, 0062, 0063, 0064, 0065, 0074, 0088, 0089, 0090 |
| **DevOps** | 0051, 0059, 0060, 0075, 0076 |
| **Testing** | 0081, 0082, 0083, 0084, 0085 |
| **Documentation** | 0086, 0087 |
| **Observability** | 0073, 0099 |

---

*End of Master Engineering Registry — v1.0.0*
