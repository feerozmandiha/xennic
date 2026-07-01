# Xennic Platform Architecture Review

> **Date:** 2026-06-26
> **Scope:** Full-stack monorepo (apps/, packages/, services/, workspace/)
> **Audience:** Architecture stakeholders, engineering leads

---

## 1. What Is Excellent

### Multi-Tenant Isolation via AsyncLocalStorage + Prisma $extends

The tenant isolation layer is the single strongest architectural decision in the codebase. A single `AsyncLocalStorage` integration in `packages/database/src/prisma/` transparently scopes every query to the current `workspace_id` via Prisma's `$extends` middleware. This eliminates an entire class of bugs where a developer forgets to filter by tenant.

- **24+ models** are auto-filtered — every query, create, update, and delete passes through the middleware.
- **Zero boilerplate** per service/endpoint; the middleware is a single cross-cutting concern.
- The pattern is trivially testable (swap `AsyncLocalStorage` for a mock store in unit tests).

This should **never change**. Any future migration away from Prisma must replicate this exact pattern in the new ORM/query-builder layer.

### Monorepo Management: pnpm Workspaces + Turborepo

The monorepo toolchain is best-in-class:

- **pnpm workspaces** with content-addressable storage eliminates duplicate `node_modules`.
- **Turborepo** provides parallel execution, remote caching (`turbo.json`), and dependency-aware task orchestration.
- Root scripts (`pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm test`, `pnpm typecheck`) abstract away per-package complexity.
- `turbo.json` correctly models task dependencies (e.g., `test` → `build`).

### Comprehensive Documentation

276 files and 51K+ lines of documentation across the platform — an exceptional level of detail:

- Full Prisma schema documentation (`prisma/docs/`)
- 100+ ADRs spanning architecture, knowledge domain, and engineering
- Knowledge platform documentation (88 files, 17K+ lines) with full ontology, governance model, and user guide
- Engineering calculation catalog (40+ calculations across 10 categories)
- Deployment guides, runbooks, security policies, and disaster recovery plans
- Project management artifacts (risk register, milestones, release board)

The **documentation-as-code** approach (ADRs alongside source, auto-generated OpenAPI, PR template linking to ADRs) is a practice that should **never change**.

### CI/CD Pipeline

The `.github/workflows/` directory contains five CI jobs (lint, typecheck, test, build, security) and one CD workflow:

- **Docker image build & push** to GitHub Container Registry (GHCR)
- **SSH-based deploy** to target infrastructure
- Dependency caching, artifact retention, and failure notifications

### Production-Grade Monitoring Stack

`infrastructure/docker/compose/monitoring/` defines a full observability stack:

- **Prometheus** — metric collection and alerting
- **Grafana** — visualization (though no dashboards shipped — see §3)
- **Loki + Promtail** — log aggregation and shipping
- **cAdvisor** — container metric export
- All services have healthchecks and restart policies.

### Backup Strategy

`infrastructure/backup/` contains a robust backup pipeline:

- **Daily cron-based backup** of PostgreSQL (pg_dump with custom format)
- **Compression + encryption** before off-site transfer
- **Integrity verification** (restore to temp database, run checksums)
- **Trial restore** procedure documented in runbooks
- Retention policies (daily × 7, weekly × 4, monthly × 12)

### Nginx Security Configuration

`infrastructure/nginx/` shows deep attention to security hardening:

- **Rate limiting zones** (per-IP, per-endpoint, burst handling)
- **Security headers** (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- **TLS 1.2/1.3 only** — no legacy protocol support
- **Strict SNI**, OCSP stapling, and HPKP headers where appropriate
- Request body size limits, connection timeouts, and buffer size hardening

### Bilingual Platform Design (FA/EN)

The platform is designed Persian-first with English as secondary language:

- `next-intl` configured with RTL layout support
- Translation files for both locales
- RTL-aware CSS patterns in components
- This is a core product differentiator and should **never change**.

### Engineering Calculation Catalog

`packages/engineering/` contains a well-structured catalog of 40+ engineering calculations:

- 10 categories (structural, electrical, mechanical, etc.)
- Shared utilities (unit conversion, precision, validation)
- Documented formulas with sources
- Testable pure functions separated from I/O

---

## 2. What Is Good

### NestJS Modules Follow DDD

The `apps/api/src/` modules (auth, workspace, user, billing, knowledge, engineering, marketplace) follow Domain-Driven Design:
- Controllers handle HTTP concerns only
- Services contain business logic
- Repositories abstract data access (via Prisma)
- DTOs with `class-validator` decorators enforce input contracts
- `whitelist: true` and `forbidNonWhitelisted: true` prevent mass-assignment

### Frontend Feature-Based Organization

`apps/web/src/` components are organized by feature, not by type:
```
features/
  auth/
  dashboard/
  knowledge/
  marketplace/
  profile/
  workspace/
```
Shared UI primitives live in `components/ui/`. Layouts, hooks, and utilities each have their own top-level directories. This scales better than a flat component/container split.

### Docker Compose Production Stack

`infrastructure/docker/compose/production/` defines 15+ services covering the full platform:
- PostgreSQL 17, Redis 8, RabbitMQ 4
- API, Web, Engineering Service, AI Service
- Nginx reverse proxy
- Qdrant vector database
- Full monitoring stack (Prometheus, Grafana, Loki, Promtail)
- Healthchecks configured on every service

### Preflight and Post-Deploy Validation

Scripts in `scripts/` validate environment before and after deployment:
- Preflight: port availability, disk space, dependency checks, config validation
- Post-deploy: endpoint health, database connectivity, queue connectivity

### RBAC System

`prisma/schema.prisma` defines a complete RBAC model with:
- **12 roles** (SuperAdmin, OrgAdmin, Engineer, Viewer, etc.)
- **57 permissions** covering every major domain action
- Permission checks via NestJS guards (`@RequirePermission()` decorator)
- Role hierarchy and inheritance

### JWT Auth with Refresh Tokens

Authentication handles:
- Access token + refresh token pair
- Token rotation on refresh
- Password reset via email (token expiration, single-use)
- Session invalidation on password change

### Full-Text Search on Knowledge Base

The knowledge module uses PostgreSQL GIN indexes on `tsvector` columns for efficient full-text search:
- Weighted search results (title > keywords > body)
- Persian stemmer support via custom text search configuration
- Ranking with `ts_rank`

### Plan/Subscription Model

`prisma/schema.prisma` models:
- Plans with feature limits and pricing tiers
- Subscriptions with status tracking (active, past_due, canceled, expired)
- Usage tracking against plan limits
- Metered billing units

### Marketplace with Multi-Vendor Support

The marketplace module supports:
- Vendor registration and profiles
- Product/listing management
- Order lifecycle (cart → checkout → fulfillment)
- Reviews and ratings
- Commission tracking

---

## 3. What Is Weak

### Test Coverage ~18%

**Current:** 212 tests across the entire platform.
**Target:** 70% (per project standards).

Breakdown by package:
| Package | Tests | Est. Coverage |
|---------|-------|---------------|
| `packages/engineering` | 98 | ~55% |
| `apps/api` (NestJS) | 72 | ~20% |
| `services/engineering` | 42 | ~35% |
| `services/ai` | 0 | 0% |
| `apps/web` | 0 | 0% |
| Other packages | 0 | 0% |

**Impact:** Low confidence in refactoring safety. No regression detection. Untestable business logic in uncovered paths.

**Action required before Beta:** Implement minimum coverage gates (40% by Beta, 70% by GA).

### Frontend Has 0 Tests

`apps/web/` has no test files, no test runner configured, and no testing library in dependencies. The entire frontend — 40+ components, 15+ pages, auth flows, i18n switching, RTL layout — is manually tested only.

**Action:** Add Vitest + React Testing Library. Start with critical paths (auth, knowledge search, marketplace checkout).

### No E2E Tests

Zero end-to-end tests exist. There is no Playwright/Cypress configuration, no test user seeding, and no CI e2e job.

**Action:** Add Playwright with 10 core user journeys before Beta release.

### No Load Tests

No k6/Artillery/Locust scripts exist. No performance baselines. The engineering calculation service (CPU-bound) and AI service (LLM latency) are highest risk.

**Action:** Add load test suites for engineering-service (40+ calculations) and AI-service (concurrent inference).

### Missing Redis/RabbitMQ Client Integration

Configuration exists for Redis (in `config/`) and RabbitMQ (in `config/`), but NestJS modules do not wire them:

- **Redis:** `@nestjs/bull` not installed. No queues defined. No caching decorator used.
- **RabbitMQ:** `@nestjs/microservices` client not configured. No event emitters or listeners.
- The `infrastructure/docker/` compose files deploy both services, but the application does not connect to them.

**Impact:** Services are fully synchronous. No async processing, no job queues, no event-driven communication, no caching.

### Billing/Subscription Module Not Implemented

The `billing` module in `apps/api/` exists as a skeleton:
- Controllers stubbed
- Zarinpal integration (Iranian payment gateway) references exist in config but no API calls
- No webhook handlers for payment events
- No invoice generation
- No usage metering against plan limits

**Impact:** The platform cannot collect revenue. This is a **blocker for Beta** for any paid tier.

### API Gateway Is a Placeholder

`services/api-gateway/` is an empty directory. All services are directly exposed:
- `apps/api` on port 3000 (directly accessible)
- `services/engineering` on port 8001 (directly accessible)
- `services/ai` on port 8002 (directly accessible)

**Impact:** No unified auth, rate limiting, request transformation, or service routing at the edge. Services must each implement auth checks independently, leading to duplication and potential gaps.

### Kubernetes Directory Empty

`infrastructure/kubernetes/` exists but contains no manifests. All K8s-related configuration is absent despite the stated intent to deploy on Kubernetes.

### Grafana Ships with No Dashboards

The Grafana service is configured and deployed, but `infrastructure/docker/compose/monitoring/grafana/dashboards/` is empty. No pre-built dashboards for:
- Application metrics (request rate, latency, error rate)
- Business metrics (users, subscriptions, usage)
- Infrastructure metrics (CPU, memory, disk, network)

**Action:** Ship dashboards as JSON files provisioned via Grafana's provisioning API.

### Monitoring Exporters Not Deployed

While Prometheus and Grafana are configured, no exporters are deployed:
- `node_exporter` — missing (host metrics)
- `postgres_exporter` — missing (database metrics)
- `redis_exporter` — missing (cache metrics)
- `rabbitmq_exporter` — missing (queue metrics)

Without exporters, Prometheus scrapes only itself.

### Web Docker Build Fails

`apps/web/Dockerfile` has a known issue: `npm install` (or equivalent) times out when pulling from the public npm registry. This blocks the CD pipeline for the frontend.

**Root cause:** No explicit `NODE_OPTIONS` for network timeout, no registry mirror configuration, and no lockfile handling for offline builds.

### Two Doc Roots Diverged

Documentation exists in two separate directory trees that are increasingly out of sync:
- `docs/` — platform-level docs (project management, architecture, deployment)
- `/home/ahmad/xennic-docs/docs/` — knowledge domain docs (ontology, governance, user guide)

Cross-references between them are broken in several places (see §6).

---

## 4. What Is Overdesigned

### Knowledge Platform Documentation (88 Files, 17K+ Lines — 0% Implementation)

The knowledge domain has the most extensive documentation of any module: full ontology (concepts, relationships, properties), governance model (workflows, roles, policies), user guide (10+ user journeys), 40+ ADRs, and detailed API specs. Yet the Rustle tree in `workspace/` shows zero implemented routes, models, or business logic.

**Concern:** This is a classic documentation-inversion antipattern. The docs describe a system that does not exist. When implementation begins, reality will diverge from docs, and maintaining the docs will become a burden.

**Recommendation:** Freeze new knowledge ADRs. Implement the minimal viable knowledge module (CRUD for the 5 core concepts) and update docs to match reality. Deflect non-essential ADR work until post-Beta.

### 24 Models in Tenant Isolation Extension (1 Repository Implemented)

The Prisma `$extends` middleware filters 24+ models, but only the `workspace` repository in `apps/api/` actually uses tenant isolation. The other models are in domains that have not been implemented (knowledge, marketplace, billing) or are single-tenant by nature (system config).

**Concern:** The tenant filter for models like `KnowledgeDocument`, `MarketplaceListing`, `BillingInvoice`, etc. is tested only in abstract — no integration tests verify these filters against actual API endpoints.

### 12 Roles with 57 Permissions Before Multi-User Testing

The RBAC system defines 12 roles and 57 permissions, but:
- No integration tests exercise permission boundaries
- No end-to-end tests verify role-based access
- Several permissions reference unimplemented features (knowledge moderation, marketplace admin)
- The permission guard is tested in isolation but not in the context of actual request flows

### Full Monitoring Stack (4 Services) for Pre-Alpha

Prometheus + Grafana + Loki + Promtail is a production-grade stack for a codebase with no production users. The operational overhead (config management, log rotation, storage sizing, alert fatigue) may not be justified at this stage.

**Recommendation:** Replace with a lightweight alternative (e.g., `uptime-kuma` + structured logging to files) until Beta. Reintroduce the full stack at GA.

### 4 Database Migrations for a Pre-Stable Schema

The `prisma/migrations/` directory contains 4 migrations. Given that the schema is still changing significantly (empty billing tables, unimplemented knowledge models, placeholder marketplace fields), each migration adds overhead (rollback scripts, CI time, developer cognitive load).

**Recommendation:** Squash migrations into a single baseline migration at each milestone release (Alpha → Beta → GA). Maintain migration hygiene only between milestones.

### Secrets Rotation Runbook (760 Lines)

`docs/runbooks/secrets-rotation.md` is 760 lines detailing every key rotation procedure (PostgreSQL, Redis, JWT, API keys, SSH, cloud provider credentials). This is comprehensive but premature:
- No secrets manager is deployed (Vault, AWS Secrets Manager, etc.)
- No automated rotation tooling exists
- The runbook references infrastructure that does not exist (K8s secrets, cloud KMS)

---

## 5. What Is Underdesigned

### API Gateway — Completely Missing

`services/api-gateway/` is an empty directory. All backend services are exposed directly to clients:
- No centralized authentication/authorization at the edge
- No rate limiting or throttling per client
- No request/response transformation
- No service discovery or load balancing
- No circuit breaking or timeout management

**Impact:** Every service must independently implement auth, rate limiting, and error handling. Adding a new service requires configuring Nginx or changing DNS. There is no single entry point for monitoring, logging, or debugging.

**Recommendation:** Implement at minimum a lightweight gateway (e.g., Express Gateway or a simple Fastify-based proxy in `services/api-gateway/`) that handles auth validation, rate limiting, and request routing.

### No Service Mesh or Circuit Breakers

There is no service mesh (Istio, Linkerd) and no application-level circuit breakers:
- Engineering service → AI service calls have no retry/backoff/circuit-breaker
- API → Engineering/AI calls have no timeout management
- Service-to-service calls are direct HTTP with no fallback

**Recommendation:** Implement circuit breakers at the application layer (e.g., `@nestjs/bull` with retry queues, or `opossum` for HTTP calls). Defer service mesh until K8s migration.

### No Event-Driven Communication

RabbitMQ is deployed (`infrastructure/docker/compose/`) and configured in `config/`, but no NestJS microservice client or producer is wired:
- No events published on user registration, subscription change, order placement
- No async job processing (report generation, email sending, calculation offloading)
- No event sourcing for audit trail

**Recommendation:** Define the first 5 domain events (UserRegistered, SubscriptionChanged, OrderPlaced, CalculationRequested, DocumentPublished). Implement a single producer/consumer pair to prove the event bus works.

### No Caching Layer

Redis is deployed but not integrated:
- No `@nestjs/cache-manager` usage
- No response caching on read-heavy endpoints (knowledge search, calculation catalog)
- No session caching (sessions are stateless JWT, but rate-limit counters could use Redis)
- No distributed lock for scheduled tasks

**Recommendation:** Implement Redis-based caching for the 3 most-read endpoints in knowledge and engineering modules. Use `@nestjs/cache-manager` with `keyv` adapter.

### No GraphQL or BFF Layer

The frontend consumes REST APIs directly. For a mobile app and multi-client platform:
- Over-fetching and under-fetching are inevitable
- Multiple round-trips for a single page view
- No type-safe client-server contract

**Recommendation:** Implement a BFF (Backend-for-Frontend) pattern using GraphQL or tRPC, owned by the web team, that aggregates REST endpoints. Defer until Beta.

### No Feature Flags System

`prisma/schema.prisma` has a `FeatureFlag` model, but:
- No API endpoints to manage flags
- No UI to toggle flags
- No client-side SDK to evaluate flags
- No gradual rollout (percentage-based, user-segment-based)
- No A/B testing framework

**Recommendation:** Implement a minimal `/api/v1/feature-flags` CRUD + evaluate endpoint. Use flag evaluation middleware in critical paths.

### No Audit Log UI

Audit events are captured in the database (`AuditEvent` model), but:
- No API to query audit events (filterable by user, action, resource, date range)
- No admin UI to view/search audit trails
- No export functionality

**Recommendation:** Implement a paginated, filterable `/api/v1/audit` endpoint and a basic admin table view.

### No Webhook Delivery System

`prisma/schema.prisma` has a `Webhook` model with delivery tracking, but:
- No endpoints to register/manage webhooks
- No webhook delivery engine (retry, backoff, signing)
- No event-to-webhook mapping
- No webhook health monitoring

**Recommendation:** Implement minimal webhook CRUD + HMAC-signed delivery before inviting marketplace vendors.

---

## 6. What Should Never Change

| Element | Rationale |
|---------|-----------|
| **Multi-tenant architecture (AsyncLocalStorage)** | Core differentiator; every query is tenant-scoped by default. See §1. |
| **Monorepo structure (apps/ ⏐ packages/ ⏐ services/ ⏐ workspace/)** | Proven scalable layout; all tooling built around it. |
| **Bilingual platform design (FA primary, EN secondary)** | Product requirement; RTL-first architecture is baked into CSS and layout. |
| **Prisma as ORM** | Type-safe, well-documented, supports all required features (multi-tenant via $extends, full-text search, migration management). |
| **PostgreSQL as primary database** | Best-in-class for relational data, JSON support, full-text search, and ACID compliance. |
| **Fastify adapter for NestJS** | Faster than Express, well-supported by NestJS ecosystem. |
| **Documentation-as-code approach** | Maintains single source of truth; ADRs alongside source prevent drift. |
| **API versioning pattern (/api/v1/)** | Industry standard; prevents breaking existing clients. |

---

## 7. What Should Be Redesigned

### Package Dependency Structure

**Problem:** `@xennic/database` depends on `@nestjs/throttler` (a NestJS-specific package). This creates a circular-like coupling where a data-access package depends on a web framework package. Additionally, some packages in `packages/` are raw TypeScript, while others compile to JavaScript before publishing — causing inconsistent consumption patterns.

**Recommendation:** Audit `packages/*` for framework-specific imports. Move framework-specific code to the framework packages. Standardize package build output (all ESM, all compiled). Enforce with ESLint `import/no-restricted-paths`.

### ADR Numbering Namespace Collisions

**Problem:** Both `docs/adr/` (project architecture) and `xennic-docs/docs/adr/` (knowledge domain) use sequential numbering (ADR-001, ADR-002, etc.). When cross-referencing, it is ambiguous which ADR-015 is being cited. Several cross-references resolve to the wrong document.

**Recommendation:** Prefix ADR numbers by domain: `ARCH-001` for architecture, `KNOW-001` for knowledge, `ENG-001` for engineering. Update existing ADR files and all cross-references.

### Knowledge Runtime README Wrong Cross-Reference

**Problem:** `workspace/knowledge/README.md` (or equivalent) references `governance/acquisition-policy.md` — but the file lives at `concepts/acquisition-policy.md`.

**Recommendation:** Fix the cross-reference. Add a CI check that validates internal cross-references resolve to existing files.

### pnpm-workspace.yaml Corrupted allowBuilds

**Problem:** The `pnpm.onlyBuiltDependencies` (or `pnvm.overrides`) section has a corrupted `allowBuilds` entry — likely from a merge conflict or manual edit. This causes pnpm install warnings and may skip necessary postinstall scripts (e.g., Prisma generate, esbuild).

**Recommendation:** Fix the YAML structure. Verify with `pnpm install --frozen-lockfile` that all native builds run correctly.

---

## 8. What Should Wait Until Beta

| Feature | Rationale |
|---------|-----------|
| **Kubernetes migration** | Docker Compose is sufficient for single-node Beta deployments. K8s adds operational complexity that is not yet justified. |
| **Full GraphQL adoption** | REST is working. GraphQL adds schema management, resolver complexity, and N+1 query risk. |
| **Multi-region deployment** | No traffic volume requires it. Adds latency, data residency, and conflict resolution complexity. |
| **OAuth2 / Social login** | Email/password + JWT is sufficient for Beta. SSO adds provider-specific integration and testing burden. |
| **Mobile app** | Spec exists; native development should begin after web platform stabilizes. |
| **Advanced caching (CDN, edge)** | No traffic volume. Cloudflare/CDN can wait. Redis-based caching (§5) should be done first. |
| **Real-time collaboration** | WebSockets, CRDT, or OT for concurrent editing — significant complexity. Document-locking is sufficient for Beta. |

---

## 9. What Should Wait Until Production (GA)

| Feature | Rationale |
|---------|-----------|
| **Horizontal pod autoscaling** | Requires K8s HPA configuration, load testing, and metric-based scaling policies. |
| **Blue-green deployments** | Requires infrastructure automation (Terraform/Pulumi), load balancer config, and smoke test gate. |
| **Canary releases** | Requires feature flags (§5), progressive delivery tooling (Argo Rollouts/Flagger), and monitoring thresholds. |
| **Multi-cloud strategy** | Single-cloud is simpler, cheaper, and easier to debug. Multi-cloud adds 2-3× operational complexity. |
| **SOC2 / ISO compliance** | Formal compliance audits require stable processes, documented controls, and external assessors — 6-12 month effort. |
| **Penetration testing** | Valuable but should follow feature freeze. A pentest before feature freeze will immediately be invalidated by new code. |
| **99.9%+ SLA guarantees** | Requires redundant infrastructure, failover automation, and SLO monitoring. Not viable until platform is stable. |

---

## 10. Summary of Recommendations

### Immediately (Before Alpha Release)

1. Fix `pnpm-workspace.yaml` corrupted `allowBuilds` section.
2. Fix knowledge runtime README cross-reference.
3. Add frontend test runner (Vitest) and 10 critical path tests.
4. Wire Redis client in NestJS for at least caching.
5. Fix web Docker build failure (registry timeout).

### Before Beta

1. Implement billing/subscription Zarinpal integration.
2. Implement API Gateway (lightweight Fastify proxy).
3. Add E2E tests (Playwright, 10 core journeys).
4. Add load tests (k6 for engineering-service, ai-service).
5. Write Grafana dashboards for RED metrics.
6. Deploy `node_exporter` and `postgres_exporter`.
7. Add audit log query API + admin UI.
8. Add webhook delivery for marketplace.
9. Add feature flags management API.
10. Increase test coverage to 40%.

### Before GA

1. Increase test coverage to 70%.
2. Add service circuit breakers (e.g., `opossum`).
3. Implement event-driven communication (RabbitMQ).
4. Implement BFF layer (GraphQL or tRPC).
5. Resolve ADR numbering namespace collision.
6. Decouple `@xennic/database` from NestJS packages.
7. Squash database migrations into baseline.
8. Reintroduce full monitoring stack with dashboards.
9. Implement remaining tenant-isolated repositories.

### Never

- Change multi-tenant AsyncLocalStorage pattern.
- Abandon monorepo structure.
- Drop bilingual/FA-primary support.
- Replace Prisma or PostgreSQL.
- Stop writing ADRs and documentation.

---

*This review is based on codebase analysis as of 2026-06-26. It should be revisited after each major milestone release.*
