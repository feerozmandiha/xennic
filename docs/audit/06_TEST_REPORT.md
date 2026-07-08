# 06 — Test Report

**Date:** 2026-07-02

---

## 6.1 TypeScript/Jest Tests — Unit

| Metric | Result |
|--------|--------|
| Test suites | **9 passed** (9 total) |
| Tests | **96 passed** (96 total) |
| Failed | **0** |
| Skipped | **0** |
| Total time | 31.36s |

**Spec files executed:**
1. `api.controller.spec.ts`
2. `admin.guard.spec.ts`
3. `health.controller.spec.ts`
4. `health.service.spec.ts`
5. `knowledge.controller.spec.ts`
6. `knowledge.service.spec.ts`
7. `knowledge.entity.spec.ts`
8. `workspace-settings.controller.spec.ts`
9. `workspace-settings.service.spec.ts`

**Slowest tests:**
| Test | Duration |
|------|----------|
| AuthGuard > should throw NotFoundException when not found | 744 ms |
| AuthGuard > should throw UnauthorizedException if no user | 231 ms |
| KnowledgeController > should be defined | 231 ms |
| KnowledgeService > should return paginated results | 88 ms |
| ApiController > should return Hello World | 95 ms |

---

## 6.2 Coverage Report

| Metric | Value |
|--------|-------|
| Statements | **8.72%** |
| Branches | **6.36%** |
| Functions | **6.29%** |
| Lines | **8.94%** |

**Highest coverage files:**

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| workspace-settings.service.ts | **100%** | 100% | 100% | 100% |
| permissions.decorator.ts | **100%** | 100% | 100% | 100% |
| workspace-settings.controller.ts | **100%** | 75% | 100% | 100% |
| knowledge.entity.ts | 96.34% | 89.47% | 96.77% | 98.68% |
| workspace-settings.entity.ts | 94.44% | 91.66% | 80% | 94.44% |
| health.controller.ts | 87.5% | 75% | 50% | 83.33% |
| knowledge.controller.ts | 70.87% | 72.91% | 53.12% | 70.29% |

**Modules with 0% coverage:**
consultations, email, engineering, feature-flags, marketplace, notification, project, rbac (most), search, standards, storage, subscription, user, vision, webhooks, workspace (repositories), shared/filters

---

## 6.3 TypeScript/Jest Tests — E2E

| Metric | Result |
|--------|--------|
| Test suites | **2 passed** (2 total) |
| Tests | **7 passed** (7 total) |
| Failed | **0** |
| Total time | 61.35s |

**E2E tests:**
- `GET /` — health root (519 ms)
- `GET /api/v1/workspace/settings` — 200 with data (1641 ms)
- `GET /api/v1/workspace/settings` — 401 without auth (691 ms)
- `PATCH /api/v1/workspace/settings` — 200 updated (416 ms)
- `PATCH /api/v1/workspace/settings` — 400 extra field (45 ms)
- `PATCH /api/v1/workspace/settings` — 400 invalid type (144 ms)
- `PATCH /api/v1/workspace/settings/reset` — 200 reset (85 ms)

---

## 6.4 Python Tests

### engineering-service (port 8001)

| Metric | Result |
|--------|--------|
| Tests | **419 passed**, **15 failed** |
| Warnings | 215 |
| Time | 142.01s |

**Failed tests (15):**
| Test | Issue |
|------|-------|
| test_ohms_law_calculate_voltage | Assertion/API error |
| test_ohms_law_calculate_current | Assertion/API error |
| test_ohms_law_validation_error | API error |
| test_active_power_single_phase | API error |
| test_active_power_three_phase | TypeError |
| test_active_power_invalid_pf | TypeError |
| test_apparent_power_single_phase | API error |
| test_apparent_power_three_phase | API error |
| test_reactive_power | AttributeError |
| test_power_factor | AttributeError |
| test_thd_missing_fundamental | API error |
| test_tdd_with_fundamental_raises | API error |
| test_resonance_low_risk | API error |
| test_apf_with_fundamental_raises | API error |
| test_registry_thread_safe | Assertion |

**Warnings:** 215 `PydanticDeprecatedSince20` — using `example=` instead of `json_schema_extra`.

### ai-service (port 8002)

| Metric | Result |
|--------|--------|
| Tests collected | 15 |
| **Errors** | **1 (collection failed)** |
| **Root cause** | Missing `openai` module in venv |

**Tests could not run** — `ModuleNotFoundError: No module named 'openai'` in `app/core/model_router.py`.

### vision-service (port 8003)

| Metric | Result |
|--------|--------|
| Tests | **16 passed**, **0 failed** |
| Time | 11.83s |

**All 16 tests passed** — extractors, pipeline, preprocessing, validation.

---

## 6.5 Test Summary

| Service | Total | Passed | Failed | Errors |
|---------|-------|--------|--------|--------|
| API unit | 96 | 96 | 0 | 0 |
| API e2e | 7 | 7 | 0 | 0 |
| engineering-service | 434 | 419 | 15 | 0 |
| ai-service | 15 | 0 | 0 | 1 (collection) |
| vision-service | 16 | 16 | 0 | 0 |
| **Total** | **568** | **538** | **15** | **1** |

---

## 6.6 Test File Counts

| Location | Files |
|----------|-------|
| `apps/api/src/**/*.spec.ts` | 9 |
| `apps/api/test/*.e2e-spec.ts` | 2 |
| `apps/api/test/*.spec.ts` | 1 (CORS) |
| `workspace/services/engineering-service/tests/` | 57 |
| `workspace/services/ai-service/tests/` | 3 |
| `workspace/services/vision-service/tests/` | 6 |
| **Total** | **78** |

---

## 6.7 Critical Gaps

1. **20+ NestJS modules have zero tests** — only 3 of 23 modules are tested
2. **ai-service tests cannot run** — missing `openai` dependency in venv
3. **15 engineering-service tests fail** — basic calculator API tests broken
4. **Coverage is 8.72%** — far below any production standard
5. **No integration tests** for auth flows, RBAC, multi-tenancy
6. **No load/stress tests** exist
7. **No test CI pipeline** — all testing is local/manual
