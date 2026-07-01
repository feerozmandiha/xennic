# Technical Debt & Known Issues — Updated

_Sprint A2 — 2026-06-27_

## Critical

| Issue | Category | File(s) | Notes |
|-------|----------|---------|-------|
| Weak/default credentials in .env files | Security | `.env`, `infrastructure/docker/.env` | Change all DB, Redis, RabbitMQ passwords |
| jspdf CVE (^2.5.2) | Security | `apps/web/package.json` | Root has ^4.2.1 — upgrade apps/web to match |
| Python services incomplete | Implementation | `services/ai-service/`, `services/vision-service/` | No src/ directory exists |
| No deployment automation | DevOps | — | No VPS provisioning or deployment scripts |

## High

| Issue | Category | File(s) | Notes |
|-------|----------|---------|-------|
| No frontend tests (coverage = 0%) | Testing | `apps/web/src/` | Jest setup added; no real tests |
| No E2E tests | Testing | `apps/web/e2e/` | Playwright setup added; no real tests |
| Python microservice integration | Integration | `apps/api/src/` | No calls to engineering/ai/vision services tested |
| RBAC not fully tested | Testing | `apps/api/src/modules/admin/` | Guard tests pass but coverage unknown |
| `nest-cli.json` stale root | Config | `nest-cli.json` | Points to `apps/xennic` instead of `apps/api` |
| No database migrations in CI | DevOps | `prisma/` | Migrations run manually |

## Medium

| Issue | Category | File(s) | Notes |
|-------|----------|---------|-------|
| `packages/database` main points to `dist/` | Consistency | `packages/database/package.json` | Other packages point to `src/` |
| No VPS provisioning script | DevOps | `infrastructure/` | Manual deployment only |
| No monitoring alerts configured | Observability | `infrastructure/monitoring/grafana/` | Dashboards exist, alerts don't |
| PostgreSQL exporter not in compose | Monitoring | `infrastructure/docker/compose/base/` | Listed in prometheus config but not in compose |
| Redis exporter not in compose | Monitoring | `infrastructure/docker/compose/base/` | Listed in prometheus config but not in compose |
| PgBouncer not configured | Performance | `infrastructure/` | Listed in prometheus config, not deployed |
| Docker image not pushed to registry | DevOps | — | No container registry configured |
| No backup strategy | Operations | — | No pg_dump cron or WAL archiving |
| `services/api-gateway/` empty placeholder | Architecture | `services/api-gateway/` | Clean up or implement |

## Low

| Issue | Category | File(s) | Notes |
|-------|----------|---------|-------|
| Some `console.log` in production code | Code Quality | `apps/api/src/` | Audit logs should use logger |
| `apps/web` has `.env.local` with secrets | Security | `apps/web/.env.local` | Should use env vars in CI |
| Prettier not yet run across codebase | Formatting | — | Run `pnpm format` before release |
| No commit hooks (husky/lint-staged) | DX | — | Consider adding pre-commit hooks |
| Redis client has no reconnection strategy | Resilience | `apps/api/src/shared/redis/` | Client reconnects but no exponential backoff |
| Event idempotency keys never expire | Operations | `apps/api/src/shared/events/` | Keys have TTL but no explicit cleanup |
