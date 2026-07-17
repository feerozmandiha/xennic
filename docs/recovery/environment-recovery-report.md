# Environment Recovery Report — Sprint R1

**Date:** 2026-07-17
**Trigger:** Linux OS reinstall (Ubuntu 25.10 Questing Quokka)
**Duration:** ~1 session
**Outcome:** FULLY RECOVERED — 100% baseline certification

---

## Executive Summary

All development environment components restored after OS reinstall:

- 5 runtimes installed
- 54.4s `pnpm install` (all packages)
- 5 Docker containers running (Postgres 17, Redis 8, RabbitMQ 4, Qdrant)
- 6 application services operational
- 1538 tests passing (1401 unit + 137 E2E)
- 0 architecture violations
- 0 typecheck errors

---

## Phase Completion

| Phase | Description                                                              | Status                                  |
| ----- | ------------------------------------------------------------------------ | --------------------------------------- |
| 1     | Runtime inventory                                                        | ✅ `docs/recovery/runtime-inventory.md` |
| 2     | Runtime installation (Node 22.23.1, Python 3.12.11, GCC 15.2, etc.)      | ✅                                      |
| 3     | `pnpm install` + validation (typecheck 9/9, lint 6/6, arch 0 violations) | ✅                                      |
| 4     | Python 3.12 venvs (engineering, ai, vision)                              | ✅                                      |
| 5     | Prisma schema validated, client generated (v6.19.3), 4 migrations        | ✅                                      |
| 6     | Docker infra (Postgres, Redis, RabbitMQ, Qdrant) + DB push + seed        | ✅                                      |
| 7a    | NestJS API (port 3000) — health, login, JWT, Swagger                     | ✅                                      |
| 7b    | Python services (8001, 8002, 8003) — all health endpoints                | ✅                                      |
| 7c    | Next.js Web (port 3001) — ready, locale redirect                         | ✅                                      |
| 8     | Connectivity matrix — all 12 ports verified                              | ✅                                      |
| 9     | Test baseline — unit, E2E, typecheck, arch validation                    | ✅                                      |
| 10    | Monitoring stack                                                         | ⏸ Deferred (Docker Hub rate-limited)    |

---

## Infrastructure Status

### Docker Containers

| Container       | Image                 | Port       | Status     |
| --------------- | --------------------- | ---------- | ---------- |
| xennic-postgres | postgres:17-alpine    | 5432       | ✅ healthy |
| xennic-redis    | redis:8-alpine        | 6380       | ✅ healthy |
| xennic-rabbitmq | rabbitmq:4-management | 5672/15672 | ✅ healthy |
| xennic-qdrant   | qdrant/qdrant:latest  | 6333/6334  | ✅ healthy |

### Application Services

| Service             | Port | Status                             |
| ------------------- | ---- | ---------------------------------- |
| NestJS API          | 3000 | ✅ health OK, login OK, Swagger OK |
| Next.js Web         | 3001 | ✅ ready                           |
| Engineering Service | 8001 | ✅ health OK (52 calculators)      |
| AI Service          | 8002 | ✅ health OK (2 agents)            |
| Vision Service      | 8003 | ✅ health OK                       |

### Credentials

| Service    | User            | Password    |
| ---------- | --------------- | ----------- |
| PostgreSQL | xennic          | xennic      |
| Redis      | —               | xennic      |
| RabbitMQ   | xennic          | xennic      |
| Admin      | admin@xennic.ir | Admin@12345 |

---

## Test Results

| Category   | Suites | Tests    | Pass Rate |
| ---------- | ------ | -------- | --------- |
| Unit tests | 82     | 1401     | 100%      |
| E2E tests  | 7      | 137      | 100%      |
| **Total**  | **89** | **1538** | **100%**  |

### Validation Commands

| Command              | Result                                |
| -------------------- | ------------------------------------- |
| `pnpm typecheck`     | ✅ 9/9 packages, 482ms (cached)       |
| `pnpm validate:arch` | ✅ 87 rules, 43 modules, 0 violations |

---

## Configuration Fixes Applied

### .env password alignment

- `.env`: Changed `POSTGRES_PASSWORD` from `xennic123` to `xennic` (matching Docker default)
- `apps/api/.env`: Changed `DATABASE_URL` password, `REDIS_PASSWORD`, `RABBITMQ_DEFAULT_USER/PASS`, `POSTGRES_PASSWORD` to match Docker containers

### JWT key paths

- `.env` and `apps/api/.env`: Changed JWT key paths from `/home/ahmad/xennic/...` to `/media/ahmad/home/ahmad/xennic/...` (matching actual mount point)

### Seed password

- Re-ran `pnpm db:seed` with `ADMIN_PASSWORD=Admin@12345` env var (default was `ADMIN_PASSWORD_FROM_ENV`)

---

## Known Issues / Deferred

1. **Monitoring stack** (Prometheus, Grafana, Loki, Tempo, AlertManager, exporters) — Docker Hub 429 rate-limiting. Will pull when rate limit resets.
2. **Python services run via `setsid`** — Using `setsid` for background persistence. Consider Docker Compose for production-like setup.

---

## Verification Commands

```bash
# Infrastructure
docker ps --filter "name=xennic"
curl http://localhost:5432  # Postgres
curl http://localhost:6333/healthz  # Qdrant

# Services
curl http://localhost:3000/api/v1/health  # API
curl http://localhost:3001/  # Web
curl http://localhost:8001/health  # Engineering
curl http://localhost:8002/health  # AI
curl http://localhost:8003/health  # Vision

# Tests
pnpm typecheck
pnpm validate:arch
cd apps/api && pnpm test
cd apps/api && pnpm test:e2e
```

---

## Sprint R1 Verdict: ✅ PASS

All critical infrastructure restored. Development environment fully operational.
