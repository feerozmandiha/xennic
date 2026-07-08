# Technical Debt Report

**Date:** 2026-07-05
**Sprint:** K4 — Production Integration Certification

## Critical Items

| # | Item | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 1 | OpenAPI generation hangs on `NestFactory.create()` | Blocks API documentation pipeline | 2h | Known issue |
| 2 | `any` types across 718 lint warnings | Reduces type safety | 40h | Pre-existing |
| 3 | Missing E2E test environment for Qdrant/Search | Unverified search integration | 4h | Documented |

## High Priority

| # | Item | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 4 | No health check endpoint in NestJS API | Can't verify API liveness via Docker | 1h | Missing |
| 5 | `@xennic/database` prisma client not mockable in test | Forces `jest.mock` workaround | 2h | Known |
| 6 | OutboxRelayService has no public `processPendingEvents` | Can't test relay without timers | 1h | Known |
| 7 | Missing MinIO from docker-compose base | Storage unavailable in dev stack | 1h | Missing |
| 8 | Missing Qdrant from docker-compose base | Vector search unavailable in dev stack | 1h | Missing |

## Medium Priority

| # | Item | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 9 | Unused imports in controllers | Lint warnings, no runtime impact | 4h | Pre-existing |
| 10 | `proxyJson` in engineering controller uses raw fetch | Bypasses circuit breaker | 2h | Sprint K4 hardening |
| 11 | Energy OCR endpoints use raw fetch to vision-service | Bypasses API gateway | 2h | Sprint K4 hardening |
| 12 | No request timeout in vision OCR call in controller | Potential resource leak | 1h | Sprint K4 hardening |

## Fixed in Sprint K4

| # | Item | Fix |
|---|------|-----|
| 13 | Circuit breaker missing from engineering client | Created CircuitBreaker class with 3-state machine |
| 14 | No retry policy in engineering client | Added 3 retries with exponential backoff (1s/2s/4s) |
| 15 | No correlation ID propagation | Added X-Correlation-ID header forwarding |
| 16 | WorkspaceGuard missing from member controller | Added @UseGuards(WorkspaceGuard) |
| 17 | Role changes not synced to user_roles RBAC table | Added _syncUserRole() in addMember/updateMemberRole/acceptInvitation/removeMember |
| 18 | No transferOwnership method | Added with workspace created_by + member role update |
| 19 | Circuit breaker state not exposed in health | Engineering health returns circuitState + circuitFailures |

## Debt Trend

| Sprint | Items Found | Items Fixed | Net Change |
|--------|-------------|-------------|------------|
| K2 | 12 | 12 | 0 |
| K3 | 7 | 7 | 0 |
| K4 | 5 | 0 | +5 (all documented) |

## Recommendation

Address critical items #1 and #4 before Enterprise AI development begins. The 718 `any` warnings are acceptable technical debt — they are concentrated in repository implementations and controllers where TypeScript cannot infer Prisma result shapes.
