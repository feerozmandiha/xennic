# Test Coverage Gap Analysis

**Date:** 2026-07-02  
**Scope:** Full Xennic platform — `apps/api`, `apps/web`, `workspace/services/*`  
**Methodology:** File inventory, spec detection, pytest collection, coverage config review

---

## 1. Executive Summary

| Layer                          | Modules/Dirs | With Tests              | Without Tests | Coverage %               |
| ------------------------------ | ------------ | ----------------------- | ------------- | ------------------------ |
| `apps/api` (NestJS)            | 27 modules   | 5 (19%)                 | 22 (81%)      | ~8.7%                    |
| `apps/web` (Next.js)           | —            | 0                       | —             | 0%                       |
| `engineering-service` (Python) | —            | 53 test files           | —             | Unknown (cov dep broken) |
| `ai-service` (Python)          | —            | 2 test files (1 broken) | —             | N/A                      |
| `vision-service` (Python)      | —            | 4 test files            | —             | Unknown (cov dep broken) |

**Overall test count:** 538 passed, 15 failed, 1 collection error across all layers.  
**268 TypeScript source files** (`*.ts` excluding `.spec` and `.module`) produce **248 source LOC targets**; only **22 spec files** exercise them.

---

## 2. API Module Audit (`apps/api/src/modules/`)

Legend: ✅ = tested, ⚠️ = partially tested, ❌ = not tested, — = no source code

| Module                 | Source Files | Controllers | Services | Repositories | Spec Files | Has Tests?       | Score |
| ---------------------- | ------------ | ----------- | -------- | ------------ | ---------- | ---------------- | ----- |
| admin                  | 8            | 3           | 1        | 0            | 1          | ⚠️ guard only    | 2/10  |
| ai                     | 8            | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| ai-runtime             | 48           | 1           | 10       | 0 (stores)   | 12         | ✅               | 9/10  |
| api-keys               | 7            | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| auth                   | 14           | 1           | 2        | 2            | 0          | ❌               | 0/10  |
| billing                | 14           | 2           | 2        | 1            | 0          | ❌               | 0/10  |
| consultations          | 5            | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| email                  | 10           | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| engineering            | 8            | 1           | 2        | 1            | 0          | ❌               | 0/10  |
| enterprise-background  | 0            | 0           | 0        | 0            | 0          | —                | —     |
| enterprise-backup      | 0            | 0           | 0        | 0            | 0          | —                | —     |
| enterprise-config      | 0            | 0           | 0        | 0            | 0          | —                | —     |
| enterprise-performance | 0            | 0           | 0        | 0            | 0          | —                | —     |
| feature-flags          | 10           | 2           | 1        | 1            | 0          | ❌               | 0/10  |
| health                 | 5            | 1           | 1        | 0            | 2          | ⚠️ stub only     | 2/10  |
| knowledge              | 14           | 4           | 1        | 1            | 3          | ✅               | 8/10  |
| knowledge-factory      | 0            | 0           | 0        | 0            | 0          | —                | —     |
| marketplace            | 15           | 3           | 3        | 1            | 0          | ❌               | 0/10  |
| notification           | 7            | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| project                | 7            | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| rbac                   | 23           | 2           | 3        | 3            | 0          | ❌               | 0/10  |
| search                 | 7            | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| standards              | 7            | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| storage                | 8            | 1           | 2        | 1            | 0          | ❌               | 0/10  |
| subscription           | 8            | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| user                   | 10           | 1           | 2        | 1            | 0          | ❌               | 0/10  |
| vision                 | 4            | 1           | 2        | 0            | 0          | ❌               | 0/10  |
| webhooks               | 7            | 1           | 1        | 1            | 0          | ❌               | 0/10  |
| workspace              | 26           | 4           | 3        | 3            | 2          | ⚠️ settings only | 3/10  |

### 2.1 Per-Module Deep Dive

#### admin (1 spec — admin.guard.spec.ts)

- **Unit coverage:** 12 test assertions, 1 guard method (canActivate). Good.
- **Controller coverage:** 3 controllers — 0 tested
- **Service coverage:** 1 service — 0 tested
- **Edge cases:** Tests empty roles, no user, expired sessions, null/undefined userId — ✅
- **Failure cases:** UnauthorizedException, ForbiddenException — ✅
- **Concurrency:** Not tested ❌
- **Missing:** Controller endpoints, admin service, taxonomy service

#### ai (0 specs)

- **Total gap.** 1 controller, 1 service, 1 repository — all untested.
- Missing: AI execution, conversation handling, LLM integration

#### ai-runtime (12 specs — BEST COVERED MODULE)

- **Unit coverage:** ~60 assertions across 12 spec files, 10 services, 5 domain type files, 2 stores
- **Service coverage:**
  - `agent-session-manager.service` — 6 tests (create, get, transition, end, error) ✅
  - `agent-state-manager.service` — 6 tests (init, transition, invalid, metadata, null, reset) ✅
  - `conversation-context-manager.service` — 2 tests (basic build, token limit) ⚠️
  - `prompt-template-engine.service` — 4 tests (render, missing vars, defaults, fromString) ✅
  - `tool-registry.service` — 5 tests (register, unregister, dispatch, unknown, handler error) ✅
- **Not tested:** `execution-pipeline.service`, `memory-abstraction.service`, `prompt-registry.service`, `streaming-response-manager.service`, `tool-dispatcher.service` ❌
- **Controller coverage:** 1 controller — 0 tested ❌
- **Domain types:** 5 type files tested (ExecutionContext, PromptTemplate, AgentSession, StreamChunk, ToolDefinition) ✅
- **Stores:** InMemorySessionStore (5 tests), InMemoryMemoryStore (3 tests) ✅
- **AI pipeline:** `execution-pipeline.service` not tested ❌
- **RAG pipeline:** Not applicable at this layer (handled by ai-service)
- **Edge cases:** Empty search results, expired sessions, null agent lookups, missing variables ✅
- **Failure cases:** SessionNotFoundException, SessionExpiredException, invalid state transitions, tool errors, prompt rendering errors ✅
- **Concurrency:** Not tested ❌

#### health (2 specs — health.controller.spec.ts, health.service.spec.ts)

- Both are stub tests — only check `should be defined`. No endpoint testing. ❌
- **Service coverage:** 0 assertions against actual behavior

#### knowledge (3 specs — BEST DOMAIN COVERAGE)

- **Entity tests:** 22 assertions across create, reconstitute, update, status transitions, soft-delete — comprehensive ✅
- **Service tests:** 21 test cases across findAll, findOne, findBySlug, create, update, requestReview, publish, reject, archive, restore, remove, search, addTaxonomy, removeTaxonomy, getTaxonomy, recordView ✅
- **Controller tests:** 15 endpoint tests, all routes covered (findAll, create, search, findBySlug, findOne, update, remove, requestReview, publish, reject, archive, restore, getTaxonomy, addTaxonomy, removeTaxonomy, recordView) ✅
- **Edge cases:** Soft-deleted entities, workspace mismatch, slug not found, missing taxonomy, conflict on duplicate, invalid transition states ✅
- **Failure cases:** NotFoundException, ForbiddenException, ConflictException ✅
- **Concurrency:** Not tested ❌
- **Missing:** Repository implementation (knex), other 3 controllers (knowledge-standards, public-knowledge, taxonomy)

#### workspace (2 specs — settings only)

- **Service coverage:** workspace-settings.service — 7 tests (get existing, get defaults, update merge, update create, update undefined, reset, reset NotFoundException) ✅
- **Controller coverage:** workspace-settings.controller — 3 endpoint tests ✅
- **Not tested:** workspace.service, dashboard.service, workspace-member.repository, workspace.repository ❌
- **Missing:** workspace CRUD, member management, invitations, dashboard, workspace entity, member entity

#### All other modules (21 modules — ZERO TESTS)

- These represent the vast majority of business logic: **auth**, **billing**, **rbac** (permissions/roles), **subscription**, **engineering**, **vision**, **search**, **storage**, **marketplace**, **feature-flags**, etc.

---

## 3. Dimension Gap Analysis

### 3.1 Unit Coverage (Test Assertions vs Service Methods)

| Module         | Service Methods          | Test Assertions | Coverage %        |
| -------------- | ------------------------ | --------------- | ----------------- |
| admin          | 1 (guard)                | 12              | 100% (guard)      |
| ai-runtime     | 10 services, ~50 methods | ~60             | ~30% (5/10 serv.) |
| health         | 1 service, ~3 methods    | 0 (stub)        | 0%                |
| knowledge      | 1 service, ~20 methods   | ~45             | ~95%              |
| workspace      | 3 services, ~20 methods  | ~12             | ~20% (1/3 serv.)  |
| **All others** | ~100+ methods            | 0               | **0%**            |

### 3.2 Controller Coverage

| Module         | Controllers | Endpoints Tested       | Coverage % |
| -------------- | ----------- | ---------------------- | ---------- |
| ai-runtime     | 1           | 0                      | 0%         |
| health         | 1           | 0                      | 0%         |
| knowledge      | 4           | 1 (all endpoints)      | 25%        |
| workspace      | 4           | 1 (settings endpoints) | 25%        |
| **All others** | ~25         | 0                      | **0%**     |

### 3.3 Repository Coverage

| Module         | Repositories | Repository Tests | Coverage %       |
| -------------- | ------------ | ---------------- | ---------------- |
| ai-runtime     | 2 stores     | 2 (InMemory)     | 100% (in-memory) |
| knowledge      | 1            | 0 (mocked)       | 0% (mocked away) |
| workspace      | 3            | 0 (mocked)       | 0%               |
| **All others** | ~20          | 0                | **0%**           |

**Problem:** All repository tests use mocked interfaces. No integration tests run against real Prisma or database connections (except 2 e2e tests that also mock Prisma).

### 3.4 Edge Case Coverage

| Edge Case                    | Tested In                                                     |
| ---------------------------- | ------------------------------------------------------------- |
| Empty results / pagination   | knowledge.service ✅                                          |
| Null / undefined inputs      | admin.guard, knowledge.service, workspace-settings.service ✅ |
| Invalid IDs                  | knowledge.service (workspace mismatch, not found) ✅          |
| Soft-deleted entities        | knowledge.entity, knowledge.service ✅                        |
| Invalid state transitions    | knowledge.entity, session.types, agent-state-manager ✅       |
| Missing required fields      | prompt-template-engine (missing vars) ✅                      |
| Non-existent resources       | tool-registry, session-manager, knowledge.service ✅          |
| Boundary values (max tokens) | conversation-context-manager ✅                               |
| Empty search queries         | knowledge.service ✅                                          |

**Not tested anywhere:** Concurrent access, race conditions, database deadlocks, network timeouts, rate limiting, payload size limits, file upload edge cases, streaming interruptions, WebSocket reconnection.

### 3.5 Failure / Error Path Coverage

| Error Path                | Tested In                                               |
| ------------------------- | ------------------------------------------------------- |
| UnauthorizedException     | admin.guard, workspace-settings.e2e ✅                  |
| ForbiddenException        | admin.guard, knowledge.service ✅                       |
| NotFoundException         | knowledge.service, workspace-settings.service ✅        |
| ConflictException         | knowledge.service (duplicate taxonomy) ✅               |
| Invalid state transitions | session.types, knowledge.entity, agent-state-manager ✅ |
| Handler exceptions        | tool-registry (handler error → error result) ✅         |
| DB connection failure     | admin.guard (rejected promise) ✅                       |
| Validation errors         | knowledge.controller.dto testing via e2e ✅             |

**Not tested:** Auth token expiry, refresh token rotation failure, RBAC permission check failures, payment gateway errors, file storage errors, email delivery failures, external API timeouts, rate limit exceeded.

### 3.6 Concurrency Coverage

**No module tests concurrent access patterns.** The only test that touches this area is `test_registry_thread_safe` in engineering-service, and **it currently fails**.

- **engineering-service:** `test_registry_thread_safe` — FAILED (assertion failure)
- **All API modules:** 0 concurrency tests
- **Recommendation:** This is CRITICAL for multi-tenant workspace isolation.

### 3.7 AI Pipeline Coverage

**ai-runtime `execution-pipeline.service.ts`** — **0 tests.** This is the core AI orchestration service.

The pipeline orchestrates:

1. Context building
2. Tool resolution
3. Prompt rendering
4. LLM call
5. Response streaming

Individual components are tested (context manager, tool registry, prompt engine), but their orchestration is not.

### 3.8 RAG Pipeline Coverage

RAG is handled by **ai-service** (Python). The test situation:

- `test_agents.py` — **broken** (ImportError: missing `openai` module)
- `test_vector_store.py` — **10 passed, 5 skipped** (skipped tests likely require Qdrant connection)

**RAG-specific gaps:**

- Agent execution flow not tested
- No Qdrant integration tests (skipped)
- No end-to-end RAG pipeline tests
- No embedding/retrieval quality tests

### 3.9 Runtime Coverage (ai-runtime)

The ai-runtime module (48 files) is the **most tested module** but still has gaps:

- ✅ Session management
- ✅ State management
- ✅ Prompt template engine
- ✅ Tool registry
- ✅ In-memory stores
- ✅ Domain types
- ❌ **Execution pipeline** (the orchestrator)
- ❌ **Memory abstraction**
- ❌ **Prompt registry**
- ❌ **Streaming response manager**
- ❌ **Tool dispatcher**
- ❌ **Controller endpoints**

### 3.10 Python Agent Coverage

| Service             | Test Files | Test Functions                | Status                |
| ------------------- | ---------- | ----------------------------- | --------------------- |
| engineering-service | 53         | 434 collected (419✅, 15❌)   | ⚠️ 15 failures        |
| ai-service          | 2          | 15 collected (10✅, 5⏭️, 1💥) | ❌ 1 collection error |
| vision-service      | 4          | 16 collected (16✅)           | ✅ All pass           |

**engineering-service failures (15):**

- `test_basic_api.py` — 6 failures (ActivePower, ApparentPower, ReactivePower, PowerFactor, OhmsLaw). Root cause: API/schema refactoring not updated in tests.
- `test_pq_integration.py` — 4 failures (THD, TDD, Resonance, ActiveFilter). Root cause: API routing changes.
- `test_registry.py` — 1 failure (thread safety). Root cause: Race condition in test or implementation.

**ai-service issues:**

- `test_agents.py` cannot be imported — missing `openai` in venv. The module `app.core.model_router` has a top-level import of `openai` that isn't installed.
- `test_vector_store.py` — 5 skipped tests likely require Qdrant running.

### 3.11 Knowledge Factory Coverage

**module `knowledge-factory`:** Empty directory. No source code, no tests. The concept exists but is unimplemented.

---

## 4. Frontend Test Coverage (`apps/web`)

**Tests found: 0**

- No `*.test.*` or `*.spec.*` files anywhere in `apps/web`
- No `jest.config.*`, `vitest.config.*`, or test framework configuration
- No test scripts in `package.json`
- The `next.config.ts` references API proxies, but no frontend testing infrastructure exists

**Risk:** All UI components, page logic, i18n handling, and API integration points are untested.

---

## 5. Configuration Coverage

### Jest Config (`apps/api/jest.config.ts`)

- ✅ Test pattern: `.*\.spec\.ts$`
- ✅ Coverage collection: `**/*.(t|j)s` excluding `.spec.ts` and `.module.ts`
- ❌ **No coverage thresholds set**
- ❌ Coverage directory: `../coverage`
- ⚠️ Uses `ts-jest` with `tsconfig.test.json`

### E2E Config (`apps/api/test/jest-e2e.json`)

- ✅ Test pattern: `.e2e-spec.ts`
- ❌ No coverage settings

### Python Coverage Config

- **engineering-service:** `[tool.coverage.run] fail_under = 80` — but `coverage` module is not installed in venv, so coverage report fails
- **vision-service:** No coverage config in `pyproject.toml`
- **ai-service:** No coverage config in `pytest.ini`

---

## 6. E2E Test Coverage

| E2E Test                         | Type       | What It Tests                                   |
| -------------------------------- | ---------- | ----------------------------------------------- |
| `app.e2e-spec.ts`                | Stub       | GET / returns "Hello World!"                    |
| `workspace-settings.e2e-spec.ts` | Functional | GET/PATCH settings, validation, auth rejection  |
| `cors-security.spec.ts`          | Security   | CORS origin validation, allowed methods/headers |

**Missing E2E tests:**

- Auth flows (login, register, refresh token, logout)
- RBAC (role assignment, permission checks)
- Knowledge CRUD (create, read, update, delete, search, publish workflow)
- Workspace CRUD and member management
- Multi-tenancy isolation
- File upload/download
- Billing/subscription flows
- API key management
- Rate limiting

---

## 7. Summary of Gaps by Severity

### 🔴 Critical (blocking production confidence)

1. **21 of 27 API modules have zero tests** (auth, rbac, billing, subscription, etc.)
2. **Frontend has zero tests** — no test infrastructure exists
3. **Coverage at 8.72%** — far below any production standard
4. **No concurrency tests** anywhere — multi-tenant isolation is unverified
5. **No real database integration tests** — all repositories are mocked
6. **AI pipeline orchestration untested** (`execution-pipeline.service`)
7. **RAG pipeline broken** (ai-service agent tests cannot import)

### 🟠 High

8. **15 Python tests failing** in engineering-service (basic calculator API)
9. **Missing `coverage` module** in Python service venvs — coverage reporting broken
10. **Knowledge Factory module empty** — no code, no tests
11. **5 ai-runtime services untested** (memory-abstraction, prompt-registry, streaming-response-manager, tool-dispatcher, execution-pipeline)
12. **health module tests are stubs** — they assert nothing

### 🟡 Medium

13. **No API contract/integration tests** (e.g., Pact or supertest-based)
14. **No load/stress/performance tests**
15. **No CI pipeline** for automated test execution
16. **Python test collection warnings** — Pydantic v2 deprecations, unconfigurable test classes

### 🟢 Low

17. **Short-term:** Install `coverage` in Python venvs, install `openai` in ai-service venv
18. **Short-term:** Add test coverage thresholds in jest config
19. **Tech debt:** 215 Pydantic v2 deprecation warnings in engineering-service

---

## 8. Recommendations

### Immediate (week 1-2)

1. Fix **15 failing Python tests** — update assertions for refactored API/schemas
2. Install `coverage` in engineering-service and vision-service venvs
3. Install `openai` in ai-service venv so tests can run
4. Add **coverage thresholds** to jest config (e.g., 30% minimum)

### Short-term (month 1)

5. Write **unit tests for auth module** — login, register, refresh token, JWT validation
6. Write **unit tests for rbac module** — permission checks, role assignment
7. Write **e2e tests for auth + rbac** — full login-to-permission flow
8. Test **execution-pipeline.service** — the core AI orchestrator
9. Test **5 untested ai-runtime services**

### Medium-term (quarter 1)

10. Add **real database integration tests** (testcontainers or in-memory PostgreSQL)
11. Add **concurrency/race condition tests** for workspace isolation
12. Set up **frontend testing** (vitest + React Testing Library)
13. Add **API contract tests** for all endpoints
14. Implement **CI pipeline** (GitHub Actions) running all tests on PR

### Long-term

15. Target **60%+ line coverage** across all modules
16. Add **load/stress tests** (k6 or Artillery)
17. Implement **Knowledge Factory** module with full test suite
18. Add **end-to-end RAG pipeline tests** with real Qdrant

---

## 9. Test File Inventory

### TypeScript Spec Files (21 files)

```
apps/api/src/api.controller.spec.ts
apps/api/src/modules/admin/infrastructure/guards/admin.guard.spec.ts
apps/api/src/modules/ai-runtime/application/services/agent-session-manager.service.spec.ts
apps/api/src/modules/ai-runtime/application/services/agent-state-manager.service.spec.ts
apps/api/src/modules/ai-runtime/application/services/conversation-context-manager.service.spec.ts
apps/api/src/modules/ai-runtime/application/services/prompt-template-engine.service.spec.ts
apps/api/src/modules/ai-runtime/application/services/tool-registry.service.spec.ts
apps/api/src/modules/ai-runtime/domain/types/execution.types.spec.ts
apps/api/src/modules/ai-runtime/domain/types/prompt.types.spec.ts
apps/api/src/modules/ai-runtime/domain/types/session.types.spec.ts
apps/api/src/modules/ai-runtime/domain/types/streaming.types.spec.ts
apps/api/src/modules/ai-runtime/domain/types/tool.types.spec.ts
apps/api/src/modules/ai-runtime/infrastructure/stores/in-memory-memory.store.spec.ts
apps/api/src/modules/ai-runtime/infrastructure/stores/in-memory-session.store.spec.ts
apps/api/src/modules/health/health.controller.spec.ts
apps/api/src/modules/health/health.service.spec.ts
apps/api/src/modules/knowledge/application/services/knowledge.service.spec.ts
apps/api/src/modules/knowledge/domain/entities/knowledge.entity.spec.ts
apps/api/src/modules/knowledge/presentation/controllers/knowledge.controller.spec.ts
apps/api/src/modules/workspace/application/services/workspace-settings.service.spec.ts
apps/api/src/modules/workspace/presentation/controllers/workspace-settings.controller.spec.ts
```

### E2E Spec Files (3 files)

```
apps/api/test/app.e2e-spec.ts
apps/api/test/cors-security.spec.ts
apps/api/test/workspace-settings.e2e-spec.ts
```

### Python Test Files (59 files)

```
workspace/services/ai-service/tests/test_agents.py
workspace/services/ai-service/tests/test_vector_store.py
workspace/services/engineering-service/tests/integration/test_basic_api.py
workspace/services/engineering-service/tests/integration/test_cable_api.py
workspace/services/engineering-service/tests/test_calculators/test_active_power.py
+ 48 more in engineering-service
workspace/services/vision-service/tests/test_extractors.py
workspace/services/vision-service/tests/test_pipeline.py
workspace/services/vision-service/tests/test_preprocessing.py
workspace/services/vision-service/tests/test_validation.py
```

### Frontend Test Files

**None — zero test infrastructure exists in `apps/web`.**
