# Production Readiness Audit Report

**Project:** Xennic API (`@xennic/api`)
**Date:** 2026-07-02
**Scope:** Full NestJS API at `apps/api/src/`

---

## Executive Summary

| Area | Score | Verdict |
|---|---|---|
| **Logging** | 60/100 | Structured Logger used but mixed with `console.log` |
| **Exception Handling** | 75/100 | Global filter exists; Prisma errors handled |
| **Timeouts** | 70/100 | Most external calls have timeouts; inconsistencies exist |
| **Retry Policy** | 45/100 | Only the LlmProvider has basic retry; others lack it |
| **Resource Cleanup** | 50/100 | No `OnModuleDestroy`, no DB disconnect handler |
| **Memory Leaks** | 30/100 | In-memory stores unbounded; no eviction |
| **Configuration** | 40/100 | @nestjs/config declared but never initialized |
| **Env Validation** | 35/100 | No Joi/validation; .env.example stale |
| **Graceful Shutdown** | 10/100 | No SIGTERM/SIGINT handlers |
| **Health Checks** | 40/100 | Only basic health endpoint; no DB/REDIS/Queue checks |
| **Readiness Checks** | 25/100 | No readiness probe endpoint |
| **Liveness Checks** | 20/100 | No liveness probe |
| **Backpressure** | 15/100 | No backpressure handling for streaming |
| **Rate Limiting** | 80/100 | ThrottlerModule configured; guards exist |
| **Idempotency** | 10/100 | No idempotency keys on POST endpoints |
| **Transaction Consistency** | 20/100 | No Prisma transactions; multi-step ops not atomic |
| **Overall API** | **40/100** | **Not production-ready — major gaps** |

---

## 1. Logging

**Score: 60/100**

### Good
- `Logger` from `@nestjs/common` used in most services (`src/modules/*/application/services/*.service.ts`)
- Structured log messages with context (service name, operation, key data)

### Issues

| File | Line | Issue |
|---|---|---|
| `src/main.ts` | 136–146 | `console.log('📚 Swagger UI:...')`, `console.log('🚀 API running on:...')` — should use Logger |
| `src/shared/filters/all-exceptions.filter.ts` | 67 | `console.error('Unhandled exception:', exception)` — should use Logger |
| `src/modules/auth/application/services/auth.service.ts` | 66 | `console.error('[EMAIL] Welcome email failed:...')` |
| `src/modules/auth/application/services/auth.service.ts` | 96 | `console.log('[AUDIT] User logged in:...')` |
| `src/modules/auth/application/services/auth.service.ts` | 132, 197, 227, 245 | Multiple `console.log('[AUDIT] ...')` — audit logging should be structured |
| `src/modules/notification/application/services/notification.service.ts` | 83–84 | `console.error('Failed to notify user...')` |

**Fix:** Replace all `console.log`/`console.error` with injected `Logger`. For audit events, push to DB table, not console.

---

## 2. Exception Handling

**Score: 75/100**

### Good
- Global `AllExceptionsFilter` at `src/shared/filters/all-exceptions.filter.ts:20-87` catches all exceptions
- Handles `HttpException`, Prisma errors (P2002, P2003, P2025), unknown errors
- `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`
- Services throw proper `NotFoundException`, `ForbiddenException`, `ConflictException`

### Issues

| File | Line | Issue |
|---|---|---|
| `src/shared/filters/all-exceptions.filter.ts` | 67 | `console.error` used instead of Logger in production error case |
| `src/modules/ai/infrastructure/repositories/ai.repository.ts` | 20, 29, 50, 67, 113, 136, 163 | All `catch { return null; }` — silently swallows DB errors |
| `src/modules/admin/application/services/admin.service.ts` | 480 | `catch { return { success: true }; }` — swallows errors in settings update |
| `src/modules/admin/application/services/admin.service.ts` | 214 | `.catch(() => null)` — fire-and-forget error |
| `src/modules/rbac/infrastructure/guards/permissions.guard.ts` | 73–74 | Fail-open: `catch → return true` — security concern |
| `src/modules/billing/application/services/billing.service.ts` | 122 | `throw new Error(...)` — should throw `HttpException` |
| `src/modules/billing/application/services/billing.service.ts` | 139 | `throw new Error(...)` — same |

**Fix:** 
- Don't silence DB errors in `ai.repository.ts` — log them.
- Replace `throw new Error(...)` with `HttpException` or `ServiceUnavailableException` in billing.
- Fix the permissions guard fail-open: if authorization check breaks, deny, not allow.

---

## 3. Timeouts

**Score: 70/100**

### Good
- `AbortSignal.timeout(30_000)` in `LlmProvider._callOpenAI` (`src/modules/ai/infrastructure/providers/llm.provider.ts:145`)
- `AbortController` with `setTimeout` in `EngineeringClientService` (`src/modules/engineering/infrastructure/http/engineering-client.service.ts:38-40`)
- `AbortSignal.timeout(120_000)` for Vision OCR in engineering controller (`src/modules/engineering/presentation/controllers/engineering.controller.ts:200`)
- `AbortSignal.timeout(10_000)` for webhook delivery (`src/modules/webhooks/application/services/webhook.service.ts:137`)
- `AbortController` in `VisionClientService` (`src/modules/vision/infrastructure/http/vision-client.service.ts:40-41`)

### Issues

| File | Line | Issue |
|---|---|---|
| `src/modules/engineering/infrastructure/http/engineering-client.service.ts` | 41, 48 | Uses AbortController with `setTimeout` but never clears the timer if fetch itself fails before timeout (timer leak) |
| `src/modules/engineering/infrastructure/http/engineering-client.service.ts` | 100–101 | Health check uses `setTimeout(5_000)` without `clearTimeout` — timer leak |
| `src/modules/vision/infrastructure/http/vision-client.service.ts` | 41, 53 | Same pattern — AbortController with setTimeout, timer leak if fetch fails synchronously |
| `src/modules/engineering/presentation/controllers/engineering.controller.ts` | 188 | Raw stream read (`for await (const chunk of req.raw)`) — no overall timeout |
| `src/modules/vision/infrastructure/http/vision-client.service.ts` | 79 | Health check also leaks timer |

**Fix:** Use `AbortSignal.timeout()` everywhere instead of manual `AbortController` + `setTimeout` pattern to avoid timer leaks. Or wrap in `try/finally` with `clearTimeout`.

---

## 4. Retry Policy

**Score: 45/100**

### Good
- `LlmProvider.chat()` (`src/modules/ai/infrastructure/providers/llm.provider.ts:109-117`): retries once after 2s on 429/403/rate-limit errors

### Issues

| File | Line | Issue |
|---|---|---|
| `src/modules/engineering/infrastructure/http/engineering-client.service.ts` | 37–88 | No retry at all — single failure = `ServiceUnavailableException` |
| `src/modules/vision/infrastructure/http/vision-client.service.ts` | 39–73 | No retry — single failure = `ServiceUnavailableException` |
| `src/modules/ai/infrastructure/providers/llm.provider.ts` | 121 | On retry failure, falls back to mock response — dangerous in production (silent data corruption) |
| `src/modules/billing/infrastructure/gateways/zarinpal.gateway.ts` | 56–86 | No retry for payment gateway calls |
| `src/modules/webhooks/application/services/webhook.service.ts` | 133 | No retry on webhook delivery failure — lost events |

**Fix:**
- Add retry with exponential backoff to `EngineeringClientService`, `VisionClientService`, `ZarinpalGateway`
- Remove mock fallback in production mode for `LlmProvider`
- Add retry with backoff for webhook delivery

---

## 5. Resource Cleanup

**Score: 50/100**

### Good
- `MinioService` correctly handles bucket creation as needed

### Issues

| File | Line | Issue |
|---|---|---|
| N/A | All modules | **No `OnModuleDestroy` implementation anywhere** — Prisma connection, Redis, MinIO client never properly disconnected |
| `src/modules/ai/infrastructure/providers/llm.provider.ts` | 138–146 | Uses `fetch()` — no connection pooling or cleanup |
| `src/modules/ai-runtime/infrastructure/stores/in-memory-session.store.ts` | 1–41 | Session store is in-memory — sessions lost on restart, never cleaned up to DB |
| `src/modules/ai-runtime/infrastructure/stores/in-memory-memory.store.ts` | 1–47 | Memory store in-memory — entries lost on restart |
| `src/modules/ai-runtime/infrastructure/stores/in-memory-prompt-template.store.ts` | exists | Prompt template store in-memory |

**Fix:**
- Add `@nestjs/bull` or similar for proper session/store persistence
- Implement `OnModuleDestroy` for Prisma/Redis/MinIO disconnect
- Add shutdown lifecycle hooks to close DB connections

---

## 6. Memory Leaks

**Score: 30/100**

### Issues

| File | Line | Issue |
|---|---|---|
| `src/modules/ai-runtime/infrastructure/stores/in-memory-session.store.ts` | 7 | `Map<string, AgentSession>` — unbounded, no eviction under memory pressure |
| `src/modules/ai-runtime/infrastructure/stores/in-memory-memory.store.ts` | 7 | `MemoryEntry[]` — unbounded array, never pruned |
| `src/modules/ai-runtime/infrastructure/stores/in-memory-prompt-template.store.ts` | exists | Unbounded in-memory store |
| `src/modules/ai-runtime/application/services/streaming-response-manager.service.ts` | 10 | `Map<string, IStreamingHandler>` — handlers added but only removed on `endStream`/`errorStream` — if client disconnects, handler leaks |
| `src/modules/ai/infrastructure/providers/llm.provider.ts` | 171–176 | `chatStream()` simulates streaming by splitting on spaces with setTimeout — allocates full response in memory, no real streaming |

**Fix:**
- Replace in-memory stores with Redis/DB backed stores
- Add TTL-based eviction for session/memory stores
- Handle client disconnect events for streaming handlers
- Remove mock streaming — implement real SSE streaming

---

## 7. Configuration

**Score: 40/100**

### Issues

| File | Line | Issue |
|---|---|---|
| `apps/api/package.json` | 19 | `@nestjs/config` listed as dependency **but never used** — `ConfigModule.forRoot()` is absent from `api.module.ts` |
| `src/api.module.ts` | 1–78 | No `ConfigModule.forRoot()` import |
| `src/modules/ai/infrastructure/providers/llm.provider.ts` | 50–59 | `getConfig()` reads `process.env` directly — bypasses any config module |
| `src/modules/storage/infrastructure/minio/minio.service.ts` | 25–35 | Direct `process.env` reads |
| `src/modules/email/infrastructure/providers/nodemailer.provider.ts` | 11 | Direct `process.env.SMTP_HOST` |
| `src/modules/engineering/infrastructure/http/engineering-client.service.ts` | 14 | Direct `process.env.ENGINEERING_SERVICE_URL` |
| Everywhere | — | All services read `process.env.*` directly |

**Fix:**
- Add `ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({...}) })` to `api.module.ts`
- Inject `ConfigService` into all services instead of reading `process.env`
- Create a centralized config namespace

---

## 8. Env Validation

**Score: 35/100**

### Issues

| File | Line | Issue |
|---|---|---|
| `apps/api/.env` | exists | Contains **production secrets** (API keys, passwords, JWT) — should NOT be committed |
| `apps/api/.env.example` | **MISSING** | No `.env.example` inside `apps/api/` |
| `/home/ahmad/xennic/.env.example` | 1–88 | Exists at root but is **stale** — missing keys: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ENCRYPTION_MASTER_KEY`, `SIGNED_URL_SECRET`, `BACKUP_STORAGE_PATH`, `JOB_MAX_RETRIES`, `WORKER_CONCURRENCY`, `RABBITMQ_*` values |
| N/A | — | No Joi/class-validator validation for env vars anywhere |
| `src/modules/ai/infrastructure/providers/llm.provider.ts` | 51 | Falls back to `'mock'` provider if no API key — an undetected misconfiguration in production |

**Fix:**
- Create `apps/api/.env.example` with all required vars
- Add Joi validation schema
- Remove mock fallback for production
- Remove actual .env from git tracking (add to .gitignore)

---

## 9. Graceful Shutdown

**Score: 10/100**

### Issues

| File | Line | Issue |
|---|---|---|
| `src/main.ts` | 1–149 | **No `app.enableShutdownHooks()` call** |
| `src/main.ts` | 14–149 | No `process.on('SIGTERM', ...)` or `process.on('SIGINT', ...)` handlers |
| All modules | — | No `OnModuleDestroy` lifecycle hooks to gracefully close connections |

**Fix:**
- Add `app.enableShutdownHooks()` before `app.listen()`
- Add signal handlers for SIGTERM/SIGINT with drain logic
- Implement `OnModuleDestroy` in all services holding connections (Prisma, MinIO, etc.)

---

## 10. Health Checks

**Score: 40/100`

### Good
- `GET /api/v1/health` returns `{ status: 'ok', service: 'xennic-api', timestamp }`
- `GET /api/v1/engineering/health` probes Python engineering service
- `GET /api/v1/storage/health` probes MinIO
- `GET /api/v1/ai-runtime/info` returns runtime stats

### Issues

| File | Line | Issue |
|---|---|---|
| `src/modules/health/health.service.ts` | 6–11 | **Only returns static `'ok'`** — no actual dependency checks (DB, Redis, Qdrant) |
| `src/modules/health/health.module.ts` | 1–8 | Health module has no dependencies injected — can't check external services |
| N/A | — | No `/health/readiness` endpoint (for k8s readiness probe) |
| N/A | — | No `/health/liveness` endpoint (for k8s liveness probe) |
| N/A | — | No DB connectivity check |
| N/A | — | No Redis connectivity check |
| N/A | — | No Qdrant connectivity check |
| N/A | — | No MinIO connectivity check in the main health endpoint |

**Fix:**
- Rewrite health service to probe all dependencies (DB ping, Redis ping, MinIO ping, Qdrant ping)
- Create separate `/health/readiness` and `/health/liveness` endpoints
- Use `@nestjs/terminus` for health checks

---

## 11. Readiness Checks

**Score: 25/100**

### Issues
- **No `/health/readiness` endpoint exists**
- No database connection readiness check
- No Redis/Qdrant/MinIO readiness check
- No `@nestjs/terminus` or equivalent

**Fix:** Create a readiness endpoint that pings DB, Redis, MinIO, and returns 200 only when all are available.

---

## 12. Liveness Checks

**Score: 20/100**

### Issues
- **No `/health/liveness` endpoint exists**
- The basic `/health` endpoint doesn't differentiate between liveness and readiness

**Fix:** Create a lightweight liveness endpoint that checks only process health (not dependencies).

---

## 13. Backpressure

**Score: 15/100**

### Issues

| File | Line | Issue |
|---|---|---|
| `src/modules/ai/infrastructure/providers/llm.provider.ts` | 171–176 | `chatStream()` yields words with fake delays — no backpressure handling |
| `src/modules/ai-runtime/application/services/streaming-response-manager.service.ts` | 64–75 | `streamResponse()` splits by words, sends each with delay — no flow control |
| `src/modules/engineering/presentation/controllers/engineering.controller.ts` | 188 | `for await (const chunk of req.raw)` — no backpressure on reading |
| N/A | — | No queue-based approach for email/webhook delivery |
| N/A | — | No circuit breaker pattern for external service calls |

**Fix:**
- Implement proper Node.js backpressure for streaming responses
- Add a message queue (RabbitMQ, Bull) for email/webhook/notification delivery
- Implement circuit breaker for Engineering/Vision/AI services

---

## 14. Rate Limiting

**Score: 80/100`

### Good
- `ThrottlerModule.forRoot()` configured in `api.module.ts:57-73` with short/medium/long limits
- `XennicThrottlerGuard` at `src/common/guards/throttler.guard.ts` with IP+UserID tracking
- `AuthThrottlerGuard` at `src/common/guards/auth-throttler.guard.ts` with stricter limits
- Guards apply to auth endpoints

### Issues

| File | Line | Issue |
|---|---|---|
| `src/api.module.ts` | 57–73 | Throttler limits defined inline — not configurable via env vars |
| `src/api.module.ts` | 31–73 | Throttler guards not applied globally — each controller must individually opt in |
| N/A | — | No `@ThrottleSkip()` or per-route customization for heavy endpoints |

**Fix:**
- Make throttler limits configurable via ConfigService/env
- Apply throttler globally with `APP_GUARD`
- Add per-endpoint override for calculation-heavy routes

---

## 15. Idempotency

**Score: 10/100**

### Issues

| Endpoint | Method | Idempotent? | Problem |
|---|---|---|---|
| `POST /api/v1/workspaces` | POST | No | No idempotency key |
| `POST /api/v1/auth/register` | POST | No | No idempotency — duplicate registration |
| `POST /api/v1/engineering/calculations` | POST | No | No idempotency — duplicate calculations |
| `POST /api/v1/storage/upload` | POST | No | No idempotency — duplicate uploads |
| `POST /api/v1/billing/invoices` | POST | No | No idempotency — double billing |
| `POST /api/v1/ai/conversations/:id/messages` | POST | No | No idempotency — duplicate messages |
| All POST endpoints | — | **None** check `Idempotency-Key` header |

**Fix:**
- Implement idempotency middleware that checks `Idempotency-Key` header
- Store processed keys in Redis with TTL
- Return cached response for duplicate requests within TTL window
- At minimum, add database-level unique constraints on critical POST endpoints

---

## 16. Transaction Consistency

**Score: 20/100**

### Issues

| File | Line | Issue |
|---|---|---|
| `src/modules/auth/application/services/auth.service.ts` | 62–64 | Token generation and session save not in a transaction — if session save fails, tokens exist orphaned |
| `src/modules/auth/application/services/auth.service.ts` | 153–158 | Token generation and refresh token save not in a transaction |
| `src/modules/auth/application/services/auth.service.ts` | 74–98 | Login: user update + token generation + session save — not atomic |
| `src/modules/workspace/application/services/workspace.service.ts` | 49–54 | Workspace creation + member creation — not in a transaction |
| `src/modules/engineering/application/services/engineering.service.ts` | 157–177 | Engineering call + calculation save — not atomic |
| `src/modules/storage/application/services/storage.service.ts` | 68–90 | MinIO upload + DB save — not in a transaction; if DB save fails, file is orphaned in MinIO |
| `src/modules/billing/application/services/billing.service.ts` | 176–203 | Payment + invoice + transaction — not wrapped in a transaction |
| All modules | — | **No Prisma `$transaction` anywhere** |

**Fix:**
- Wrap all multi-step operations in Prisma `$transaction`
- For cross-service operations (MinIO + DB), implement compensation/rollback
- Use outbox pattern for critical financial transactions

---

## Module-by-Module Audit

### Health Module (`health/`) — Score: 20/100

- **Logging:** No Logger
- **Exception handling:** N/A (static response)
- **Configuration:** Direct process.env
- **Completeness:** Only returns static "ok" — no dependency checks
- **Missing:** Terminus, readiness/liveness probes, DB/Redis/MinIO health

### Auth Module (`auth/`) — Score: 50/100
- **Logging:** Logger in `jwt.service.ts`, `console.log` in `auth.service.ts` for audit
- **Exception handling:** Good — proper `UnauthorizedException`, `ConflictException`
- **Transactions:** Missing — token generation + session save not atomic
- **Idempotency:** Missing — no `Idempotency-Key` on register/login/refresh
- **Password reset:** Good — SHA-256 hashing of tokens
- **Secrets:** Line 12–13 in `jwt.service.ts` reads JWT keys from filesystem paths — crashes if missing

### User Module (`user/`) — Score: 65/100
- **Logging:** No Logger
- **Exception handling:** Proper `NotFoundException`, `ConflictException`
- **Hashing:** Argon2 — good
- **Issues:** No transaction when updating user

### Workspace Module (`workspace/`) — Score: 55/100
- **Logging:** Logger used (`workspace.service.ts:20`)
- **Exception handling:** Good with proper exceptions
- **Transactions:** Missing — workspace + member creation not atomic

### Engineering Module (`engineering/`) — Score: 50/100
- **Logging:** Logger in `engineering-client.service.ts`
- **Timeouts:** Good (30s), but timer leak in health check
- **Retry:** Missing — no retry on Python service failure
- **Transactions:** Missing — calculation save + Python call not atomic
- **Issues:** `_proxyJson()` helper in controller bypasses NestJS response pipeline

### AI Module (`ai/`) — Score: 35/100
- **Logging:** Logger used
- **Timeouts:** `AbortSignal.timeout(30_000)` — good
- **Retry:** Basic retry in `LlmProvider` — but falls back to mock on failure (dangerous)
- **Mock streaming:** `chatStream()` is fake — not safe for production
- **Repository:** All DB errors silently swallowed with `catch { return null; }`
- **Configuration:** `process.env` reads directly

### AI Runtime Module (`ai-runtime/`) — Score: 20/100
- **Memory:** All stores are in-memory, unbounded — severe leak risk
- **Streaming:** Handler map grows unbounded — leaks on client disconnect
- **Persistence:** Sessions/memory lost on restart
- **Logging:** Logger used in pipeline
- **Not production-ready** — needs Redis-backed stores

### Storage Module (`storage/`) — Score: 55/100
- **Logging:** Logger in MinioService
- **Timeouts:** Missing — no timeout on MinIO operations
- **Transactions:** MinIO + DB not atomic — orphaned files possible
- **Configuration:** `process.env` directly
- **Health:** Health endpoint exists

### Billing Module (`billing/`) — Score: 35/100
- **Logging:** Logger used
- **Transactions:** Missing — payments + invoices + transactions not in transaction
- **Error handling:** Uses `throw new Error()` instead of `HttpException`
- **Retry:** Missing — no retry for Zarinpal
- **Gateway:** Zarinpal gateway works but no circuit breaker

### Subscription Module (`subscription/`) — Score: 60/100
- **Logging:** No Logger
- **Exception handling:** Good with proper exceptions
- **Usage tracking:** Well designed with plan-based limits
- **Issues:** No transactions on subscription changes

### Knowledge Module (`knowledge/`) — Score: 50/100
- **Logging:** Logger used (`knowledge.service.ts:23`)
- **Exception handling:** Proper exceptions used
- **Issues:** Direct `prisma.*` calls mixed with repository pattern — inconsistency
- **Transactions:** Multi-step operations not in transaction

### Admin Module (`admin/`) — Score: 40/100
- **Logging:** Logger used
- **Error handling:** Many `catch { /* ignore */ }` and `catch { return mock }` — dangerous
- **Issues:** Mixed Prisma client usage (normal + raw queries), mock fallbacks in production paths
- **Security:** `catch { return { success: true }; }` at line 480 — silent write failures

### Notification Module (`notification/`) — Score: 60/100
- **Logging:** `console.error` at line 83–84
- **Issues:** No actual email/sms delivery — only in-app; queue mentioned but not implemented
- **Rate limiting:** Manual rate limiting for email (kind of)

### Webhooks Module (`webhooks/`) — Score: 40/100
- **Logging:** Logger used
- **Timeouts:** `AbortSignal.timeout(10_000)` — good
- **Retry:** Missing — no retry for failed deliveries
- **Signature:** HMAC signature for payload — good
- **Issues:** Fire-and-forget `Promise.allSettled`, no delivery confirmation

### Vision Module (`vision/`) — Score: 45/100
- **Logging:** Logger used
- **Timeouts:** 120s with timer leak issue
- **Retry:** Missing
- **Issues:** Timer leak in health check

### Remaining Modules (Project, RBAC, API Keys, Feature Flags, Standards, Search, Email, Consultations, Marketplace) — Score: 40/100

All share common patterns:
- Logger usage inconsistent
- No `@nestjs/config` usage
- No transactions
- Direct `process.env.*` reads
- No idempotency
- No retry
- No graceful shutdown hooks

---

## Critical Blockers (Must Fix Before Production)

| # | Issue | Impact | Location |
|---|---|---|---|
| 1 | **No graceful shutdown** | Connection drops on restart/deploy | `src/main.ts:14-149` |
| 2 | **No env validation** | Undetected misconfiguration in prod | All modules |
| 3 | **In-memory stores unbounded** | Memory leak → OOM crash | `ai-runtime/infrastructure/stores/*` |
| 4 | **No transactions** | Data inconsistency on failures | All modules |
| 5 | **No idempotency** | Duplicate payments, registrations, calculations | All POST endpoints |
| 6 | **Mock fallback in production** | Silent data corruption | `llm.provider.ts:121` |
| 7 | **Secrets in .env committed** | Security breach | `apps/api/.env` |
| 8 | **DB errors silently swallowed** | Data loss | `ai.repository.ts` — all methods |
| 9 | **Timer leaks** | Event emitter leaks | `engineering-client.service.ts`, `vision-client.service.ts` |
| 10 | **No readiness/liveness probes** | Can't deploy in k8s | `src/modules/health/` |

---

## Recommendations (Priority Order)

### P0 — Immediate (before any production traffic)
1. Remove `.env` from git, add to `.gitignore`, rotate all secrets
2. Add `app.enableShutdownHooks()` and SIGTERM/SIGINT handlers to `main.ts`
3. Add ConfigModule with Joi validation to `api.module.ts`
4. Create proper health/readiness/liveness endpoints using `@nestjs/terminus`
5. Replace all `catch { return null; }` with proper error logging in `ai.repository.ts`
6. Remove mock fallback from `LlmProvider` in production mode

### P1 — High
7. Implement `$transaction` for all multi-step Prisma operations
8. Add idempotency middleware for POST endpoints
9. Replace in-memory stores with Redis-backed stores
10. Add retry with exponential backoff to all external HTTP calls
11. Fix all timer leaks (`AbortSignal.timeout()` instead of manual AbortController)

### P2 — Medium
12. Replace all `console.log`/`console.error` with structured Logger
13. Add `OnModuleDestroy` hooks to close Prisma/MinIO/Redis connections
14. Replace direct `process.env` with `ConfigService` injection
15. Implement circuit breaker pattern for Engineering/Vision/AI services
16. Add request ID tracking for distributed tracing

### P3 — Low
17. Move rate limit limits to env config
18. Implement outbox pattern for critical financial transactions
19. Add connection pooling for external HTTP calls
20. Implement proper SSE streaming (replace mock streaming)
21. Add request/response logging interceptor
