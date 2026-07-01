# Private Alpha Checklist

_Last updated: 2026-06-27_

## Build & CI

- [x] API builds successfully (162 endpoints)
- [x] Web builds successfully (Next.js standalone)
- [x] All packages build (database, types, shared, config)
- [x] All tests pass (214/214)
- [x] OpenAPI spec auto-generated
- [ ] GitHub Actions CI workflow created
- [ ] CI runs lint → typecheck → test → build on every PR

## Auth & Security

- [x] JWT RS256 auth implemented
- [x] Argon2id password hashing
- [x] Refresh token rotation
- [x] Session management
- [x] Password reset flow
- [x] Rate limiting on auth endpoints
- [ ] RBAC fully tested
- [ ] 2FA enabled in production
- [ ] Replace weak/default credentials in .env files
- [ ] Audit all CVE in dependencies

## API & Endpoints

- [x] 162 endpoints generated
- [x] Swagger docs at /api/docs
- [x] Unified response format (success/error)
- [x] Health endpoint with dependency checks
- [x] Validation (whitelist + forbidNonWhitelisted)
- [ ] All endpoints have integration tests

## Frontend

- [x] Next.js 15 with i18n (next-intl)
- [x] API proxy via rewrites
- [ ] Login page functional
- [ ] Registration page functional
- [ ] Dashboard page functional
- [ ] Calculations page functional
- [ ] Jest + RTL setup added
- [ ] Playwright E2E setup added
- [ ] At least 50% code coverage on critical pages

## Infrastructure

- [x] PostgreSQL 17 (Docker Compose)
- [x] Redis 8 (Docker Compose)
- [x] RabbitMQ 4 (Docker Compose)
- [x] Prometheus + Grafana (monitoring)
- [x] Loki + Promtail (logging)
- [x] Qdrant (vector DB)
- [ ] API Docker image build verified
- [ ] Docker Compose for full stack works
- [ ] Health checks on all services

## Python Microservices

- [x] engineering-service (FastAPI, port 8001)
- [ ] ai-service (no src/ yet)
- [ ] vision-service (no src/ yet)
- [ ] Integration tests for engineering service
- [ ] End-to-end API calls from NestJS to Python services

## Deployment

- [ ] Single VPS provisioned
- [ ] Docker Compose deployment script
- [ ] SSL/TLS via Let's Encrypt
- [ ] Domain DNS configured
- [ ] Database backup strategy in place
- [ ] Monitoring dashboards accessible
- [ ] Log aggregation working

## Release

- [ ] Version tag set
- [ ] Changelog generated
- [ ] Release notes written
- [ ] Private Alpha invite list ready
- [ ] Known issues documented
- [ ] Rollback plan documented
