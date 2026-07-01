# Xennic Platform — Implementation Audit

> Generated: 2026-06-26 | Sprint A1
> Status: Pre-Implementation Baseline

---

## 1. Repository Overview

| Metric | Value |
|--------|-------|
| Root package manager | pnpm@10.33.0 |
| Monorepo tool | Turborepo |
| Apps | 2 (apps/api, apps/web) |
| Packages | 5 (config, database, openapi, shared, types) |
| Python services | 3 (engineering-service, ai-service, vision-service) |
| Prisma models | 61 |
| Total packages (root devDeps) | 52 |
| CI workflows | 0 (no .github/workflows/) |

---

## 2. Critical Issues (Must Fix Before Alpha)

### 2.1 Missing NestJS Dependencies in apps/api

**Problem:** `apps/api/package.json` is missing 7 runtime dependencies that are incorrectly listed in root `devDependencies`:

| Dependency | Version | Currently In |
|-----------|---------|-------------|
| @nestjs/jwt | ^11.0.2 | Root devDeps |
| @nestjs/passport | ^11.0.5 | Root devDeps |
| passport | ^0.7.0 | Root devDeps |
| passport-jwt | ^4.0.1 | Root devDeps |
| class-validator | ^0.15.1 | Root devDeps |
| class-transformer | ^0.5.1 | Root devDeps |
| @nestjs/swagger | ^11.4.4 | Root devDeps |

**Impact:** Build fails, runtime crashes, auth module cannot function.

### 2.2 pnpm-workspace.yaml Corruption

**Problem:** The `allowBuilds` section is corrupted:

```yaml
allowBuilds:
  ' ': true
  '"': true
  ',': true
  '-': true
  '[': true
  ']': true
  c: true
  d: true
  e: true
  j: true
  o: true
  r: true
  s: true
  z: true
```

**Impact:** pnpm install will fail or behave unpredictably.

### 2.3 @nestjs/throttler in Every Package

**Problem:** `@nestjs/throttler` is listed as a devDependency in ALL 6 packages:

- apps/api
- apps/web
- packages/config
- packages/database
- packages/shared
- packages/types

**Impact:** Unnecessary installs, confusion about package boundaries.

### 2.4 jspdf CVE Vulnerability

**Problem:** `jspdf@^2.5.2` in apps/web has known CVE.

---

## 3. Module Implementation Status

### 3.1 NestJS Modules (23 registered)

| Module | Files | Status | Auth Guarded? |
|--------|-------|--------|--------------|
| AuthModule | 16 files | ✅ Complete | N/A (public) |
| UserModule | ✅ Complete | ✅ | Partial |
| WorkspaceModule | ✅ Complete | ✅ | Yes |
| RbacModule | ✅ Complete | ✅ | Yes |
| HealthModule | ✅ Complete | ❌ | Public |
| ProjectModule | ⚠️ Partial | ❌ | Needs check |
| EngineeringModule | ⚠️ Partial | ❌ | Needs check |
| KnowledgeModule | ⚠️ Partial | ❌ | Needs check |
| AiModule | ⚠️ Partial | ❌ | Needs check |
| VisionModule | ⚠️ Partial | ❌ | Needs check |
| StorageModule | ✅ Complete | ✅ | Yes |
| NotificationModule | ⚠️ Partial | ❌ | Needs check |
| SearchModule | ⚠️ Partial | ❌ | Needs check |
| AdminModule | ⚠️ Partial | ✅ | Yes (admin guard) |
| MarketplaceModule | ❌ Skeleton | ❌ | Not implemented |
| BillingModule | ❌ Skeleton | ❌ | Not implemented |
| SubscriptionModule | ❌ Skeleton | ❌ | Not implemented |
| ApiKeysModule | ✅ Complete | ✅ | Yes |
| WebhooksModule | ⚠️ Partial | ❌ | Needs check |
| EmailModule | ✅ Complete | ✅ | Internal |
| FeatureFlagsModule | ⚠️ Partial | ❌ | Needs check |
| StandardsModule | ⚠️ Partial | ❌ | Needs check |
| ConsultationsModule | ⚠️ Partial | ❌ | Needs check |

### 3.2 Auth Module Detail

The auth module is well-structured with hexagonal architecture:

```
auth/
├── domain/
│   ├── entities/
│   │   ├── session.entity.ts
│   │   └── refresh-token.entity.ts
│   ├── interfaces/
│   │   ├── session.repository.interface.ts
│   │   └── refresh-token.repository.interface.ts
│   └── value-objects/
│       └── jwt-payload.vo.ts
├── application/
│   └── services/
│       └── auth.service.ts
├── infrastructure/
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── jwt/
│   │   └── jwt.service.ts
│   └── repositories/
│       ├── session.repository.ts
│       └── refresh-token.repository.ts
├── presentation/
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── dtos/
│       └── auth.dto.ts
└── auth.module.ts
```

Endpoints: register, login, refresh-token, logout, me, forgot-password, reset-password, change-password
Uses: RS256 JWT, Argon2id hashing, refresh token rotation, session management

### 3.3 RBAC Module

Complete roles/permissions implementation with:
- RoleController: CRUD for roles
- PermissionController: permission assignment
- AuthorizationService: permission evaluation
- Audit logging for all RBAC changes

### 3.4 Key Missing Implementations

- Marketplace: 0% (skeleton module only)
- Billing: 0% (skeleton module only, missing billing.repository.ts)
- Subscription: 0% (skeleton module only)
- Knowledge Factory: 0% (10 pipeline services not started)

---

## 4. Test Coverage

### 4.1 Backend (NestJS)

| Metric | Value |
|--------|-------|
| Total spec files | 15 |
| Test framework | Jest 29 |
| Test runner | ts-jest |
| E2E config | test/jest-e2e.json |
| Coverage directory | apps/api/coverage/ (exists) |

Existing test files:
- api.controller.spec.ts
- admin.service.spec.ts, admin.guard.spec.ts, admin.controller.spec.ts
- auth.service.spec.ts, auth.controller.spec.ts
- engineering.controller.spec.ts
- health.controller.spec.ts, health.service.spec.ts
- knowledge.service.spec.ts, knowledge.entity.spec.ts, knowledge.controller.spec.ts
- workspace-settings.service.spec.ts, workspace-settings.controller.spec.ts
- cors-security.spec.ts

### 4.2 Frontend (Next.js)

| Metric | Value |
|--------|-------|
| Test framework | None configured |
| Test files | 0 |
| `test` script | `echo 'No web tests yet'` |

**Critical gap:** Zero frontend test infrastructure.

### 4.3 Python Services

| Service | Test Directory | Files |
|---------|---------------|-------|
| engineering-service | tests/ | test_calculators/, test_core/, test_energy_analyzer/, test_power_system/, test_renewable/ |
| ai-service | tests/ (in src/) | test_agents.py, test_vector_store.py |
| vision-service | tests/ (in src/) | conftest.py, test_extractors.py, test_pipeline.py, test_preprocessing.py, test_validation.py |

---

## 5. Infrastructure Status

### 5.1 Docker Setup

| Service | Image | Health Check? | Exposed Port |
|---------|-------|--------------|-------------|
| postgres | postgres:17-alpine | ✅ pg_isready | 5432 |
| pgbouncer | edoburu/pgbouncer | ✅ pg_isready | 6432 |
| redis | redis:8-alpine | ✅ redis-cli ping | 6380→6379 |
| rabbitmq | rabbitmq:4-management | ✅ (in base compose) | 5672, 15672 |
| minio | minio/minio | Not in base compose | — |
| qdrant | qdrant/qdrant | Not in base compose | — |
| api | (build from Dockerfile) | ✅ curl /health | 3000 |
| web | (build from Dockerfile) | ✅ curl /api/health | 3001 |

Missing from base compose: minio, qdrant, prometheus, grafana, loki, engineering-service, ai-service, vision-service

### 5.2 JWT Configuration

- JWT keys exist at `infrastructure/docker/secrets/jwtRS256.key` and `.pub`
- Algorithm: RS256
- Access token TTL: 900s (15 min)
- Refresh token TTL: 2592000s (30 days)
- Private key: file path configured in .env
- Missing: passport configuration in main.ts

### 5.3 Python Service Configurations

**engineering-service:** Has full src/ with calculators, API, core, data, schemas. Good structure.
**ai-service:** No src/ directory. Tests exist directly in service root.
**vision-service:** No src/ directory. Tests exist directly in service root.

---

## 6. Configuration Issues

### 6.1 pnpm-workspace.yaml

The `allowBuilds` section has invalid entries. Needs cleanup to allow only required native builds.

### 6.2 Package Dependency Issues

- `@nestjs/throttler` in all 6 packages removes from 5 where unnecessary
- `packages/database/main` points to `dist/` — inconsistency with other packages (need to check if dist exists)
- No root `tsconfig.json` — apps extend from `packages/config/tsconfig.base.json`

### 6.3 Environment Variables

- Weak production credentials in `.env`: `xennic:xennic123` for PG, `guest:guest` for RabbitMQ
- Docker `.env` has stronger Redis password but weak MinIO credentials
- No `.env.example` at root level

---

## 7. CI/CD Status

**No GitHub workflows found.** The `.github/workflows/` directory does not exist. There is no CI pipeline.

---

## 8. Recommendations (Ordered by Priority)

1. **Fix pnpm-workspace.yaml corruption** — Clean up allowBuilds
2. **Move deps from root to apps/api** — Add @nestjs/jwt, @nestjs/passport, passport, passport-jwt, class-validator, class-transformer, @nestjs/swagger
3. **Remove @nestjs/throttler** from all packages except apps/api
4. **Try to build** — Verify NestJS API compiles
5. **Add frontend test infrastructure** — Jest + React Testing Library
6. **Add Playwright E2E** — Smoke tests for critical paths
7. **Wire Redis into NestJS** — Current Redis is not used by the API
8. **Add monitoring exporters** — postgres-exporter, redis-exporter
9. **Replace weak credentials** — Generate strong passwords
10. **Create CI workflow** — GitHub Actions for lint → typecheck → test → build → security scan
