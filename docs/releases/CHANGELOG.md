# Changelog — Xennic Platform

All notable changes to the Xennic platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v0.5.0-alpha] — Tir 1405 (2026-06)

### Sprint A5 — Monitoring & Observability Finalization

#### Added

- Prometheus alerting rules for all services (CPU > 80%, memory > 85%, error rate > 1%, latency > 2s)
- Grafana dashboards: System Health, API Performance, Engineering Service, AI Service metrics
- Loki log aggregation with Promtail for all containers
- Alert notification channel configuration (Slack webhook)
- Uptime monitoring endpoint (`/health`) with detailed component status (DB, Redis, RabbitMQ)
- `scripts/stack-status.sh` — unified status check across all services
- Observability Gate verification checklist to release process

#### Changed

- Refined log levels across all services — structured JSON logging with consistent `level`, `timestamp`, `trace_id` fields
- Prometheus metrics now include business-level KPIs (auth requests, calculations run, OCR documents processed)
- Health check detail level: each service now reports dependency status individually

#### Fixed

- Missing `start_period` on container health checks causing false negatives during cold start
- Loki retention policy alignment with infrastructure disk capacity
- Prometheus target discovery not including engineering and vision services

#### Removed

- Legacy unstructured log format fallback in engineering and vision services

---

### Sprint A4 — Production Compose & Infrastructure Hardening

#### Added

- Production Docker Compose file with 9 services including Nginx, PgBouncer, MinIO
- `scripts/stack-up.sh` and `scripts/stack-down.sh` lifecycle management scripts
- Docker build context optimization — API service reduced from 422MB to 1.7MB
- `infrastructure/docker/compose/production/.env.production.template` with all production variables
- Volume size limit documentation and recommendations
- Resource limit (`mem_limit`, `cpus`) for all services in production compose
- Graceful shutdown handling across all Python services

#### Changed

- Base Docker Compose rewritten to align with production compose structure
- Nginx configuration updated with production SSL termination, rate limiting zones, and security headers
- Network isolation: all services now use `xennic-network` with internal-only exposure for service ports
- All Dockerfiles reviewed: `USER non-root`, `tini` init process, `HEALTHCHECK` added

#### Fixed

- Engineering service Dockerfile builder stage was commented out — restored and optimized
- Vision service `docker-entrypoint.sh` not creating required temp directories
- Missing `.dockerignore` files for AI service and vision service

---

### Sprint A3 — Database & Backup Infrastructure

#### Added

- `prisma migrate deploy` migration strategy (replaced `db push` in all scripts and documentation)
- `scripts/db-backup.sh` — automated pg_dump with compression level 9 and 30-day retention
- `scripts/db-restore.sh` — database restoration with validation and drop/recreate logic
- PgBouncer transaction pooling integrated into Docker Compose with `DISCARD ALL` reset and `pgbouncer=true` connection string
- Backup strategy documentation (`docs/devops/BACKUP_PLAN.md`) with RTO/RPO targets
- Connection pooling configuration for Prisma with `@prisma/adapter-pg` and `pgbouncer=true`

#### Changed

- `db:apply` npm script now uses `prisma migrate deploy` instead of `prisma db push`
- Migration files version-controlled with proper naming convention
- All documentation references updated from `db push` to `migrate deploy`
- Prisma schema connection URL parameterized for PgBouncer compatibility

#### Fixed

- Empty SQL backup files (0 bytes) — root cause was incorrect `pg_dump` invocation
- Migration ordering issue causing foreign key constraint failures on fresh deployments

---

### Sprint A2.5 — Critical Security Closure

#### Added

- `docs/releases/ALPHA_RELEASE_GATE.md` — formal release gate document with 6 gate categories and 55 criteria
- `docs/releases/ALPHA_SECURITY_CHECKLIST.md` — comprehensive 15-category security checklist
- `docs/operations/SECRETS_ROTATION.md` — secrets rotation runbook for all 15 secret types
- Git history cleanup: `git-filter-repo` executed to remove all real credentials from 4 commits
- JWT private key migration to Docker Secrets (`/run/secrets/`) with env fallback
- Redis authentication with 24-character random password
- Non-root user enforcement in all 5 Dockerfiles
- `HEALTHCHECK` instruction added to all Dockerfiles

#### Changed

- `jwt.service.ts` — reads private key from `/run/secrets/jwtRS256.key` instead of filesystem path
- `infrastructure/docker/secrets/` — directory created for Docker Secret files
- `.gitignore` — expanded to prevent re-commit of secret files

#### Removed

- All hardcoded credentials from git history: `Admin@12345`, `minioadmin`, database URLs, Groq API keys, Zarinpal merchant ID
- `.env` files with real credentials from tracked state (moved to `.gitignore`)

#### Security

- Credential audit: 22 secrets identified across codebase
- Zero secrets remaining in git history (verified with `git log --all -p` and `trufflehog`)

---

### Sprint A2 — Security & Observability

#### Added

- Zod schema validation for 30+ environment variables with fail-fast startup
- `@fastify/helmet` with 14 security headers (CSP, HSTS, X-Frame-Options, etc.)
- JWT hardening: `clockTolerance` (30s), `jti` claim, token reuse detection, PassportModule integration
- Swagger UI auto-disable in production (`NODE_ENV === 'production'`)
- `AuthThrottlerGuard` — rate limiting on auth endpoints (5 requests/minute for login)
- Global rate limiting: 10 requests/10s, 100/60s, 1000/1h
- `AllExceptionsFilter` — global exception handler with unified error format
- Rate limiting by IP via custom `getTracker()` implementation
- RBAC system: 12 roles, 136 permissions, permission checking middleware
- AdminGuard and AuthorizationService for fine-grained access control
- `docs/security/` directory — 7 files covering architecture, secrets, JWT, headers, audit, hardening
- 6 runbooks: Deployment, Rollback, Disaster Recovery, Incident Response, Server Rebuild, Secrets Rotation
- Dependency audit: `pnpm audit --fix` with 43 overrides, pip upgrades for pydantic, starlette, pytest

#### Changed

- Environment validation now blocks startup on missing/malformed variables
- CORS policy restricted to whitelist-based domain configuration
- Password hashing upgraded to Argon2id
- Python dependency audit resolved 56 CVEs across engineering, AI, and vision services

#### Fixed

- JWT error information leakage in error responses
- Redis connection handling — retry logic and timeout configuration
- CORS preflight handling for cross-origin authenticated requests

---

### Sprint A1 — Foundation & Dockerization

#### Added

- Dockerfiles for NestJS API, Next.js Web, Engineering Service, Vision Service (all multi-stage where applicable)
- `.dockerignore` for all services to exclude `node_modules`, `.git`, `.env`, and build artifacts
- Production Docker Compose base configuration with PostgreSQL 17, Redis 8, RabbitMQ 4, Nginx
- Nginx reverse proxy configuration with SSL termination, rate limiting zones
- GitHub Actions CI pipeline (`ci.yml`) with lint, typecheck, test, and build stages
- GitHub Actions CD pipeline (`cd-deploy.yml`) with Docker image build and push
- Graceful shutdown handling in NestJS (`SIGTERM`/`SIGINT` + `enableShutdownHooks`)
- `apps/api/Dockerfile` — multi-stage build for TypeScript compilation and production runtime
- `apps/web/Dockerfile` — standalone output mode for Next.js
- Health check endpoints for all Python services

#### Changed

- Monorepo structure finalized with `pnpm-workspace.yaml` and Turborepo configuration
- NestJS API migrated from Express to Fastify adapter
- Unified API response format: `{ success, data, meta }` / `{ success, error }`
- Migration from `class-validator` validation to global `ValidationPipe` with `whitelist: true`

#### Improved

- Engineering service: Ohm's Law, Power (active/apparent/reactive), Power Factor, Cable Ampacity, Voltage Drop, Short Circuit Withstand, PE Sizing, Transformer Sizing/Losses/Regulation/K-Factor, MCCB Selection
- AI service: multi-provider LLM gateway (Groq, OpenAI, Anthropic, Google), embedding generation with all-MiniLM-L6-v2
- Vision service: 3-pass OCR pipeline (default Tesseract, PSM mode, custom), EasyOCR integration, diagram detection

---

## [v0.4.0-dev] — Ordibehesht 1405 (2026-05)

### Added

- Initial project scaffold with Turborepo monorepo
- NestJS API with Fastify adapter and Prisma ORM
- Next.js web frontend with next-intl i18n
- Engineering service base with FastAPI
- AI service with LangChain integration
- Vision service with OpenCV and Tesseract OCR
- PostgreSQL 17 schema with Prisma migrations (4 initial migrations)
- Core authentication: registration, login, JWT issuance, password hashing (Argon2id)
- Workspace CRUD with multi-tenant isolation
- Initial RBAC model with role and permission entities
- Project management module
- Knowledge base CRUD with vector store foundation
- Subscription plan entities (Free, Professional, Enterprise)
- Zarinpal payment gateway integration basics
- Docker Compose development environment

---

## Upcoming Releases

| Version | Target Date | Focus |
|---------|-------------|-------|
| **v0.6.0-beta** | Shahrivar 1405 | Test coverage > 70%, VPS deploy, TLS, automated rollback |
| **v0.7.0-beta** | Aban 1405 | Power Quality, Solar, Earthing calculators; AI caching |
| **v0.8.0-rc** | Dey 1405 | Admin panel, CDN, SMTP, webhook retry, performance benchmarks |
| **v1.0.0** | Esfand 1405 | Production ready: full test coverage, multi-region DR, marketplace |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🚧 | In Progress |
| 📋 | Planned |
| 🔴 | Blocked |

---

## Related Documents

| Document | Path |
|----------|------|
| Release Notes | `docs/releases/ALPHA_RELEASE_NOTES.md` |
| Known Issues | `docs/releases/KNOWN_ISSUES.md` |
| Milestones | `docs/project/MILESTONES.md` |
| Roadmap | `docs/roadmap/ROADMAP.md` |
| Release Board | `docs/project/RELEASE_BOARD.md` |
| Versioning | `docs/project/VERSIONING.md` |
| Release Process | `docs/project/RELEASE_PROCESS.md` |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Tir 1405 | Initial release changelog |
