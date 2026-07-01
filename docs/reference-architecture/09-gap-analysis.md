# 9. Gap Analysis — Designed vs. Implemented

> **Revision:** v1.0
> **Date:** 2026-06-26
> **Status:** Living Document

Compares the DESIGNED architecture (documented in `knowledge/`, `reference-architecture/`, `knowledge-factory/`) against the IMPLEMENTED code (`apps/`, `workspace/services/`, `packages/`, `infrastructure/`).

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| CRITICAL | Blocks alpha release or introduces unacceptable production risk |
| HIGH     | Major feature or quality gap; significant risk without remediation |
| MEDIUM   | Important but workarounds exist; can defer past alpha |
| LOW      | Cosmetic, tech debt, nice-to-have |

## Effort Scale

| Effort | Range |
|--------|-------|
| 🟢 <1h | Quick fix |
| 🟡 1-4h | Single session |
| 🟠 4-16h | Multiple sessions |
| 🔴 16-40h | Full sprint |
| ⚫ 40h+ | Multi-sprint |

---

## 1. Missing Services

Services defined in architecture but absent or merely scaffolded in code.

| # | Service | Designed In | Code Status | Effort | Priority | Sprint |
|---|---------|-------------|-------------|--------|----------|--------|
| 1.1 | **API Gateway** (`services/api-gateway/`) | `02-service-catalog.md` §2.6 | Empty directory — 0% implemented | ⚫ 40h+ | LOW | Post-MVP |
| 1.2 | **Knowledge Factory — Intake Service** | `02-service-catalog.md` §2.18 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.3 | **Knowledge Factory — Classify Service** | `02-service-catalog.md` §2.19 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.4 | **Knowledge Factory — Parse Service** | `02-service-catalog.md` §2.20 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.5 | **Knowledge Factory — Extract Service** | `02-service-catalog.md` §2.21 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.6 | **Knowledge Factory — Resolve Service** | `02-service-catalog.md` §2.22 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.7 | **Knowledge Factory — Normalize Service** | `02-service-catalog.md` §2.23 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.8 | **Knowledge Factory — Chunk Service** | `02-service-catalog.md` §2.24 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.9 | **Knowledge Factory — Embed Service** | `02-service-catalog.md` §2.25 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.10 | **Knowledge Factory — Enrich Service** | `02-service-catalog.md` §2.26 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.11 | **Knowledge Factory — Publish Service** | `02-service-catalog.md` §2.27 | Not started (0%) | ⚫ 40h+ | MEDIUM | Post-MVP |
| 1.12 | **Knowledge Factory — Quality Gate** | `02-service-catalog.md` §2.27 | Not started (0%) | 🟠 8-16h | MEDIUM | Post-MVP |

**BLOCKING:** Knowledge Factory is 0% implemented. Architecture fully designed across 8 XKF documents but zero services exist. Not needed for alpha but must be queued for beta.

---

## 2. Missing APIs

Endpoints defined in service catalog or controller specs but absent from code.

| # | Endpoint | Module | Status | Effort | Priority | Sprint |
|---|----------|--------|--------|--------|----------|--------|
| 2.1 | `GET /api/v1/metrics` | MetricsModule | No controller, no service — 15% implementation | 🟠 4-8h | **HIGH** | Sprint 3 |
| 2.2 | Full-text search integration in `GET /api/v1/search/*` | SearchModule | Basic scaffold, no Meilisearch/Elasticsearch | 🟠 8-16h | **HIGH** | Sprint 4 |
| 2.3 | Webhook delivery retry + HMAC signing | WebhooksModule | Scaffold only — retry, signing, delivery tracking missing | 🟡 4-8h | MEDIUM | Sprint 3 |
| 2.4 | Real-time notifications (WebSocket) | NotificationsModule | REST only — no `ws://` endpoint | 🔴 16-24h | MEDIUM | Sprint 5 |
| 2.5 | Payment gateway production integration | BillingModule | Scaffold exists, no real payment provider wired | 🔴 16-24h | **HIGH** | Sprint 4 |
| 2.6 | Marketplace checkout flow | MarketplaceModule | No checkout/cart endpoints | 🟠 8-16h | MEDIUM | Sprint 5 |

---

## 3. Missing Schemas

Database models or validation schemas defined in design but not implemented.

| # | Schema | Designed In | Status | Effort | Priority | Sprint |
|---|--------|-------------|--------|--------|----------|--------|
| 3.1 | `plans.features` stored as JSON blob | Prisma schema L254 | No normalized feature model; stored as opaque JSON | 🟡 1-4h | LOW | Sprint 6 |
| 3.2 | PostgreSQL UUID columns migrated to TEXT | All migrations | Architecture specifies UUID; column types are `String` (text) — divergent | 🟠 4-8h | **HIGH** | Sprint 3 |
| 3.3 | Legacy `Tenant` table not dropped | Migrations L8 | `DROP TABLE IF EXISTS "Tenant"` in init migration — stale reference | 🟢 <1h | LOW | Sprint 6 |

---

## 4. Missing Tests

Components with zero or critically low test coverage.

| # | Component | Files | Tests Found | Coverage | Effort | Priority | Sprint |
|---|-----------|-------|-------------|----------|--------|----------|--------|
| 4.1 | **Next.js Web** (`apps/web`) | 61 feature files, 36 pages, 20 components | **0 tests** | 0% | 🔴 16-24h | **CRITICAL** | Sprint 1 |
| 4.2 | **AuthModule** | 4 controllers, 3 services | 2 test files | ~30% | 🟠 4-8h | **HIGH** | Sprint 2 |
| 4.3 | **UsersModule** | 1 controller, 1 service | **0 tests** | 0% | 🟠 4-8h | **HIGH** | Sprint 2 |
| 4.4 | **RolesModule** | 1 controller, 1 service | **0 tests** | 0% | 🟠 4-8h | **HIGH** | Sprint 2 |
| 4.5 | **PermissionsModule** | 1 controller, 1 service | **0 tests** | 0% | 🟠 4-8h | **HIGH** | Sprint 2 |
| 4.6 | **ProjectsModule** | 1 controller, 1 service | **0 tests** | 0% | 🟠 4-8h | MEDIUM | Sprint 3 |
| 4.7 | **BillingModule** | 2 controllers, 1 service | **0 tests** | 0% | 🟠 4-8h | MEDIUM | Sprint 3 |
| 4.8 | **MarketplaceModule** | 3 controllers, 1 service | **0 tests** | 0% | 🟠 4-8h | MEDIUM | Sprint 4 |
| 4.9 | **NotificationsModule** | 1 controller, 1 service | **0 tests** | 0% | 🟠 4-8h | MEDIUM | Sprint 4 |
| 4.10 | **StorageModule** | 1 controller, 1 service | **0 tests** | 0% | 🟠 4-8h | MEDIUM | Sprint 3 |
| 4.11 | **WebhooksModule** | 1 controller, 1 service | **0 tests** | 0% | 🟠 4-8h | MEDIUM | Sprint 4 |
| 4.12 | **ApiKeysModule** | 1 controller, 1 service | **0 tests** | 0% | 🟡 1-4h | MEDIUM | Sprint 4 |
| 4.13 | **FeatureFlagsModule** | 1 controller, 1 service | **0 tests** | 0% | 🟡 1-4h | MEDIUM | Sprint 5 |
| 4.14 | **SearchModule** | 1 controller, 1 service | **0 tests** | 0% | 🟡 1-4h | LOW | Sprint 5 |
| 4.15 | **AiModule** (NestJS) | 1 controller, 1 service | **0 tests** | 0% | 🟠 4-8h | MEDIUM | Sprint 3 |
| 4.16 | **AI Service** (Python) | 35 source files | 3 test files | ~15% | 🟠 4-8h | MEDIUM | Sprint 3 |
| 4.17 | **Vision Service** (Python) | 44 source files | 6 test files | ~20% | 🟠 4-8h | MEDIUM | Sprint 3 |
| 4.18 | **Packages** (`@xennic/{config,database,shared,types,openapi}`) | 19+ source files | **0 tests** | 0% | 🟠 4-8h | MEDIUM | Sprint 4 |

**BLOCKING:** Zero frontend tests is a BLOCKER for alpha. Core backend modules (Users, Roles, Permissions) with 0% test coverage are HIGH risk.

---

## 5. Missing Events

RabbitMQ events defined in service catalog but not produced or consumed in code.

| # | Event | Routing Key | Producer | Designed In | Status | Effort | Priority |
|---|-------|-------------|----------|-------------|--------|--------|----------|
| 5.1 | `doc.uploaded` | `api.doc.uploaded.v1` | NestJS API | `02-service-catalog.md` §2.1 | Not emitted (no RabbitMQ client wired) | 🟠 8-16h | MEDIUM |
| 5.2 | `eko.published` | `factory.publish.published.v1` | Publish Service | `02-service-catalog.md` §2.1 | Entire pipeline not implemented | 🟠 4-8h | MEDIUM |
| 5.3 | `eko.failed` | `factory.*.failed.v1` | Any factory service | `02-service-catalog.md` §2.1 | Entire pipeline not implemented | 🟠 4-8h | MEDIUM |
| 5.4 | `quality.escalated` | `factory.quality.escalated.v1` | Quality Gate | `02-service-catalog.md` §2.1 | Quality Gate not implemented | 🟠 4-8h | MEDIUM |
| 5.5 | RabbitMQ client in NestJS API | — | — | `02-service-catalog.md` §2.1 | No @nestjs/microservices or amqp dependency; no producers/consumers | 🟠 4-8h | MEDIUM |

**Root cause:** RabbitMQ infrastructure exists in docker-compose but no NestJS module connects to it. Zero events flow through the bus.

---

## 6. Missing Repositories

Prisma repository pattern defined in `@xennic/database` but only one repository built.

| # | Repository | Path | Status | Effort | Priority | Sprint |
|---|------------|------|--------|--------|----------|--------|
| 6.1 | `workspace.repository.ts` | `packages/database/src/repositories/` | ✅ Implemented | — | — | — |
| 6.2 | `user.repository.ts` | — | ❌ Missing | 🟡 2-4h | **HIGH** | Sprint 2 |
| 6.3 | `knowledge.repository.ts` | — | ❌ Missing (in-module repo exists but not in database package) | 🟡 2-4h | **HIGH** | Sprint 2 |
| 6.4 | `project.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 3 |
| 6.5 | `billing.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 3 |
| 6.6 | `subscription.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 3 |
| 6.7 | `notification.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 3 |
| 6.8 | `file.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 3 |
| 6.9 | `calculation.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 3 |
| 6.10 | `agent.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 3 |
| 6.11 | `conversation.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 4 |
| 6.12 | `role.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 4 |
| 6.13 | `permission.repository.ts` | — | ❌ Missing | 🟡 2-4h | MEDIUM | Sprint 4 |
| 6.14 | `api-key.repository.ts` | — | ❌ Missing | 🟡 2-4h | LOW | Sprint 4 |
| 6.15 | `webhook.repository.ts` | — | ❌ Missing | 🟡 2-4h | LOW | Sprint 4 |
| 6.16 | `audit-log.repository.ts` | — | ❌ Missing | 🟡 2-4h | LOW | Sprint 5 |
| 6.17 | `payment.repository.ts` | — | ❌ Missing | 🟡 2-4h | LOW | Sprint 5 |

**Total:** 1 of ~24 repositories implemented (4%). Modules implement inline repositories instead of sharing via the `@xennic/database` package. This duplicates code and undermines the layered architecture.

---

## 7. Missing Security

Security measures documented in architecture but not deployed or misconfigured.

| # | Issue | Details | Severity | Effort | Priority | Sprint |
|---|-------|---------|----------|--------|----------|--------|
| 7.1 | **`@nestjs/jwt` and `@nestjs/passport` not in `apps/api/package.json`** | Missing direct deps; code imports them at runtime (auth.module.ts L2, jwt-auth.guard.ts L2). Present in node_modules via hoisting but not declared — CI/cold install may fail. | BLOCKER | 🟢 <1h | **CRITICAL** | Sprint 1 |
| 7.2 | **Weak dev credentials in `.env`** | `POSTGRES_PASSWORD=xennic123`, `MINIO_ACCESS_KEY=minioadmin`, `MINIO_SECRET_KEY=minioadmin` — hard-coded weak secrets | HIGH | 🟢 <1h | **CRITICAL** | Sprint 1 |
| 7.3 | **Self-signed SSL certificate** | Nginx configured with self-signed cert (`fullchain.pem`, `privkey.pem`); no Let's Encrypt auto-renewal | HIGH | 🟡 2-4h | **HIGH** | Sprint 3 |
| 7.4 | **Redis password empty** | `REDIS_PASSWORD=` in `.env` — no authentication configured | HIGH | 🟢 <1h | **HIGH** | Sprint 1 |
| 7.5 | **No Helmet/CSP headers** | No Content-Security-Policy or other security headers configured in Nginx | MEDIUM | 🟡 1-2h | MEDIUM | Sprint 3 |
| 7.6 | **JWT single key pair** | Single RS256 key pair for all environments — no key rotation strategy | MEDIUM | 🟡 2-4h | MEDIUM | Sprint 3 |

---

## 8. Missing Monitoring

Monitoring targets configured in Prometheus but exporter containers not deployed or endpoints not instrumented.

| # | Target | Prometheus Job | Exporter | Status | Effort | Priority | Sprint |
|---|--------|----------------|----------|--------|--------|----------|--------|
| 8.1 | PostgreSQL | `postgres` → `postgres-exporter:9187` | `postgres-exporter` | ❌ Not in docker-compose | 🟡 1-2h | **HIGH** | Sprint 3 |
| 8.2 | Redis | `redis` → `redis-exporter:9121` | `redis-exporter` | ❌ Not in docker-compose | 🟡 1-2h | **HIGH** | Sprint 3 |
| 8.3 | PgBouncer | `pgbouncer` → `pgbouncer-exporter:9127` | `pgbouncer-exporter` | ❌ Not in docker-compose | 🟡 1-2h | **HIGH** | Sprint 3 |
| 8.4 | NestJS API metrics endpoint | `api` → `api:3000/api/v1/metrics` | Prometheus client | ❌ MetricsModule at 15% — no `/metrics` endpoint exposed | 🟠 4-8h | **HIGH** | Sprint 3 |
| 8.5 | Grafana dashboard JSON files | — | — | ❌ `provisioning/dashboards/` has `dashboard.yml` provider but **zero** dashboard JSON files | 🟡 2-4h | MEDIUM | Sprint 3 |
| 8.6 | Prometheus alerting rules | — | — | ❌ No alert rules configured | 🟠 4-8h | MEDIUM | Sprint 4 |
| 8.7 | Engineering Service `/metrics` | `engineering-service:8001` | — | ❌ No `/metrics` endpoint exposed | 🟠 4-8h | MEDIUM | Sprint 3 |
| 8.8 | AI Service `/metrics` | `ai-service:8002` | — | ❌ No `/metrics` endpoint exposed | 🟠 4-8h | MEDIUM | Sprint 3 |
| 8.9 | Vision Service `/metrics` | `vision-service:8003` | — | ❌ No `/metrics` endpoint exposed | 🟠 4-8h | MEDIUM | Sprint 3 |

**BLOCKING:** 3 of 8 Prometheus scrape targets point to containers that don't exist. No service actually exposes a `/metrics` endpoint. Monitoring is architecturally designed but operationally non-functional.

---

## 9. Missing Integrations

Connections between services that architecture specifies but code does not implement.

| # | Integration | Architecture Spec | Code Status | Effort | Priority | Sprint |
|---|-------------|-------------------|-------------|--------|----------|--------|
| 9.1 | **NestJS API → Redis** | Caching, session store, JWT blacklist | Redis config exists in .env but no `ioredis` or `cache-manager` in NestJS modules | 🟠 4-8h | **HIGH** | Sprint 2 |
| 9.2 | **NestJS API → RabbitMQ** | Async event bus, event producers/consumers | No `@nestjs/microservices` or amqp dependency; no producers/consumers | 🟠 8-16h | MEDIUM | Sprint 4 |
| 9.3 | **AI Service → Redis** | Semantic caching | Redis in infra but AI Service has no Redis client | 🟠 4-8h | MEDIUM | Sprint 4 |
| 9.4 | **Engineering Service → RabbitMQ** | Async calculation requests (planned) | Planned for roadmap — not started | 🟠 4-8h | LOW | Post-MVP |
| 9.5 | **AI Service → RabbitMQ** | Extraction/enrichment task consumption | Planned for roadmap — not started | 🟠 4-8h | LOW | Post-MVP |
| 9.6 | **Vision Service → RabbitMQ** | Parse task consumption | Planned for roadmap — not started | 🟠 4-8h | LOW | Post-MVP |
| 9.7 | **NestJS API → Engineering Service** | Calculation orchestration (HTTP) | ✅ Implemented — engineering.controller.ts proxies to engineering-service:8001 | — | — | — |
| 9.8 | **NestJS API → AI Service** | AI chat proxy (HTTP) | ✅ Implemented — ai controller proxies to ai-service:8002 | — | — | — |
| 9.9 | **NestJS API → Vision Service** | Vision upload proxy (HTTP) | ✅ Implemented — vision controller proxies to vision-service:8003 | — | — | — |
| 9.10 | **AI Service → Qdrant** | Vector store for RAG | ✅ Implemented — retriever.py uses qdrant_client | — | — | — |
| 9.11 | **AI Service → Engineering Service** | Calculation context for AI | ✅ Implemented — agents call engineering-service via HTTP | — | — | — |

---

## 10. Architecture Drift

Where implementation materially diverges from documented architecture.

| # | Drift | Documented | Actual | Impact | Effort | Priority | Sprint |
|---|-------|------------|--------|--------|--------|----------|--------|
| 10.1 | **Two doc roots divergent** | Architecture doc lives in `docs/reference-architecture/` (main repo) AND `xennic-docs/docs/architecture/` (reference). Contents overlap but differ. | Contradictory specs; readers can't tell which is authoritative | HIGH | 🟠 8-16h | **HIGH** | Sprint 2 |
| 10.2 | **ADR numbering collision** | `docs/decisions/` has ADR-006, ADR-007 | `xennic-docs/docs/decisions/` has overlapping ADRs with same numbers but different content | HIGH | 🟡 2-4h | **HIGH** | Sprint 2 |
| 10.3 | **TenantContext naming collision** | `@xennic/types` exports `interface TenantContext` | `@xennic/database` exports `class TenantContext` — same name, different semantics | MEDIUM | 🟡 1-2h | MEDIUM | Sprint 2 |
| 10.4 | **pnpm-workspace.yaml corrupted `allowBuilds`** | Should contain valid package names | Contains garbage entries: `' ': true`, `'"': true`, `',': true`, `'-': true`, `'[': true`, `']': true`, individual letters `c, d, e, j, o, r, s, z: true` | MEDIUM | 🟢 <1h | MEDIUM | Sprint 1 |
| 10.5 | **Knowledge sub-models not tenant-isolated** | Architecture requires `workspace_id` isolation on all knowledge entities | `knowledge_media`, `knowledge_comments`, `knowledge_analytics`, `knowledge_workflow_history`, etc. have no `workspace_id` column — only `knowledge` parent has it | HIGH | 🟠 4-8h | **HIGH** | Sprint 3 |
| 10.6 | **`packages/config` duplicate `src/package.json`** | Single config package | `packages/config/src/package.json` exists alongside root `package.json` — duplicate, confusing | LOW | 🟢 <1h | LOW | Sprint 6 |
| 10.7 | **PostgreSQL UUID stored as TEXT** | Architecture: `@db.Uuid` on all ID columns | All `String @id @default(uuid())` in Prisma — stored as text, not native UUID type | HIGH | 🟠 4-8h | **HIGH** | Sprint 3 |
| 10.8 | **Web Docker build fails (npm registry timeout)** | Architecture: Docker image builds cleanly | `docker build` for `apps/web` fails due to registry timeout — no CI check validates this | CRITICAL | 🟡 2-4h | **CRITICAL** | Sprint 1 |
| 10.9 | **jspdf CVE in lockfile** | Architecture: dependencies should be vetted | `pnpm-lock.yaml` contains `jspdf` with known CVEs | HIGH | 🟡 2-4h | **HIGH** | Sprint 2 |
| 10.10 | **No load testing** | Architecture: performance testing required for alpha | No k6/artillery/benchmark scripts exist | MEDIUM | 🟠 4-8h | MEDIUM | Sprint 5 |
| 10.11 | **No backup automation/cron** | Architecture: scheduled backups | Backup scripts exist (`backup.sh`, `restore.sh`) but no cron scheduling or automation | MEDIUM | 🟡 2-4h | MEDIUM | Sprint 4 |

---

## Summary

### By Priority

| Priority | Count | Key Items |
|----------|-------|-----------|
| **CRITICAL** | 4 | Missing JWT deps, zero frontend tests, web Docker build fails, weak dev credentials |
| **HIGH** | 18 | 3 missing monitoring exporters, Redis not wired, AuthModule coverage, many module tests at 0%, knowledge tenant isolation, UUID type drift, two doc roots, ADR collision |
| **MEDIUM** | 26 | Knowledge Factory (11 services), missing repositories (17), RabbitMQ not wired, no Grafana dashboards, alert rules missing, no load testing |
| **LOW** | 5 | API Gateway placeholder, legacy table cleanup, `features` JSON blob, config duplicate, `allowBuilds` corruption |

### Gap Closure Targets

| Milestone | Target Gaps Closed | Readiness |
|-----------|-------------------|-----------|
| **Alpha (Sprint 1-3)** | All CRITICAL + all HIGH + selected MEDIUM | 80%+ |
| **Beta (Sprint 4-6)** | All MEDIUM + Knowledge Factory (partial) | 70%+ |
| **GA (Sprint 7+)** | All LOW + Knowledge Factory (full) + API Gateway | 90%+ |

### Quick Wins (Sprint 1, <2h each)

1. Add `@nestjs/jwt` and `@nestjs/passport` to `apps/api/package.json`
2. Fix `pnpm-workspace.yaml` corrupted `allowBuilds`
3. Set strong `REDIS_PASSWORD` in `.env`
4. Rotate weak dev credentials (`POSTGRES_PASSWORD`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`)
5. Resolve `TenantContext` naming collision (rename interface or class)
