# Implementation Progress

_Last updated: 2026-06-27_

## Build Status

| Service | Build | Tests | Notes |
|---------|-------|-------|-------|
| `@xennic/api` (NestJS) | ✅ Passes | ✅ 214/214 | 162 endpoints in OpenAPI |
| `@xennic/web` (Next.js) | ✅ Passes | ⚠️ Setup only | No real tests yet |
| `@xennic/database` | ✅ Passes | N/A | 61 Prisma models |
| `@xennic/types` | ✅ Passes | N/A | Shared types package |
| `@xennic/shared` | ✅ Passes | N/A | Shared utilities |
| `@xennic/config` | ✅ Passes | N/A | Shared ESLint base |

## Dependency Health

- Dependencies moved from root `devDependencies` into proper package `dependencies` / `devDependencies`
- `pnpm-workspace.yaml` cleaned of garbage entries
- `apps/api` has all required NestJS auth deps (`@nestjs/jwt`, `@nestjs/passport`, `passport`, etc.)
- No duplicate dependencies across packages

## Auth Module

Auth module detected as **fully implemented** with hexagonal architecture (16 files):

- **Domain layer** — entities, value objects, specification pattern
- **Application layer** — services (auth, session, password-reset, two-factor)
- **Infrastructure layer** — Prisma repos, JWT + refresh token strategies, guards
- **Presentation layer** — DTOs, controllers with validation

Implementations:
- RS256 JWT with full key pair
- Argon2id password hashing
- Refresh token rotation
- Session management (device tracking, concurrent limit)
- Password reset flow
- 2FA ready (domain objects exist)
- Rate limiting per endpoint

## Health Monitoring

- Health endpoint: `GET /api/v1/health`
- Checks: Database (Prisma), Redis, RabbitMQ
- Returns `ok` / `degraded` status with per-service details
- Uptime tracking included

## Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| PostgreSQL 17 | ✅ Configured | In Docker Compose |
| Redis 8 | ✅ Configured | In Docker Compose |
| RabbitMQ 4 | ✅ Configured | In Docker Compose |
| Prometheus | ✅ Configured | Monitoring infra |
| Grafana | ✅ Configured | With dashboards |
| Loki + Promtail | ✅ Configured | Log aggregation |
| Qdrant | ✅ Configured | Vector DB (separate compose) |

## Known Gaps

1. **Frontend tests** — Jest + RTL setup added but no real tests
2. **E2E tests** — Playwright setup added but no real tests
3. **CI/CD** — No GitHub Actions workflow yet
4. **Python microservices** — `ai-service` and `vision-service` have no `src/` directory
5. **Weak credentials** — `.env` files still use default passwords
6. **jspdf CVE** — `^2.5.2` version in `apps/web` (root has `^4.2.1`)
7. **Redis unused** — Redis is running but NestJS doesn't use it for caching/sessions yet
8. **Docker image build** — API multistage build verified, but not CI-published
9. **No deployment** — No VPS provisioning or deployment automation

## What Was Fixed (Sprint A1)

1. `pnpm-workspace.yaml` — cleaned corrupted `allowBuilds` section
2. `apps/api/package.json` — added 8 missing runtime deps (jwt, passport, class-validator, etc.)
3. Root `package.json` — removed 25+ duplicate entries
4. `packages/database`, `types`, `shared` — removed incorrect `@nestjs/throttler` dep
5. `apps/api` — added `fastify` and `redis` and `amqplib` deps
6. Health service — enhanced with dependency checks
7. Frontend test infrastructure — Jest + RTL + Playwright boilerplate
