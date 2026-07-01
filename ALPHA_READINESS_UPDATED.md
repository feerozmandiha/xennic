# Alpha Readiness — Updated

_Sprint A2 — 2026-06-27_

## Build & CI

- [x] API builds successfully (166 endpoints, +4 from Sprint A1)
- [x] Web builds successfully (Next.js standalone)
- [x] All packages build (database, types, shared, config)
- [x] All tests pass (225/225, +11 from Sprint A1)
- [x] OpenAPI spec auto-generated
- [x] GitHub Actions CI workflow created

## Auth & Security

- [x] JWT RS256 auth implemented
- [x] Argon2id password hashing
- [x] Refresh token rotation
- [x] Session management (Redis-backed)
- [x] Password reset flow
- [x] Rate limiting on auth endpoints
- [x] Correlation ID tracking
- [ ] RBAC fully tested
- [ ] 2FA enabled in production
- [ ] Replace weak/default credentials in .env files
- [ ] Audit all CVE in dependencies

## Observability

- [x] Structured JSON logging (Pino)
- [x] Correlation ID in logs
- [x] Prometheus metrics endpoint (RED + USE)
- [x] OpenTelemetry tracing
- [x] Health probes (liveness, readiness, startup)
- [x] Dependency health checks (DB, Redis, RabbitMQ)

## API & Endpoints

- [x] 166 endpoints generated
- [x] Swagger docs at /api/docs
- [x] Unified error format (RFC7807)
- [x] Health endpoint with dependency checks
- [x] Validation (whitelist + forbidNonWhitelisted)
- [x] Standard error hierarchy
- [ ] All endpoints have integration tests

## Cache & Events

- [x] Redis cache service (JSON, TTL policies, cache-aside)
- [x] Distributed lock (SET NX EX)
- [x] Session store in Redis
- [x] Cache decorator (@Cacheable)
- [x] Event publisher (RabbitMQ, topic exchange)
- [x] Event consumer with retry + DLQ
- [x] Event idempotency
- [x] Event versioning

## Repository Layer

- [x] Base repository interface
- [x] Prisma transaction service
- [x] Audit repository
- [x] Soft delete interfaces
- [x] Tenant isolation (existing)

## Frontend

- [x] Next.js 15 with i18n (next-intl)
- [x] API proxy via rewrites
- [ ] Login page functional
- [ ] Registration page functional
- [ ] Dashboard page functional
- [ ] Calculations page functional
- [x] Jest + RTL setup added
- [x] Playwright E2E setup added

## Infrastructure

- [x] PostgreSQL 17 (Docker Compose)
- [x] Redis 8 (Docker Compose)
- [x] RabbitMQ 4 (Docker Compose)
- [x] Prometheus + Grafana (monitoring)
- [x] Loki + Promtail (logging)
- [x] Qdrant (vector DB)
- [x] API Docker image build verified

## Python Microservices

- [x] engineering-service (FastAPI, port 8001)
- [ ] ai-service (no src/ yet)
- [ ] vision-service (no src/ yet)

## Deployment

- [ ] Single VPS provisioned
- [ ] Docker Compose deployment script
- [ ] SSL/TLS via Let's Encrypt
- [ ] Domain DNS configured
- [ ] Database backup strategy in place
