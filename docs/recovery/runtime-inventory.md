# Runtime Inventory — Xennic Platform

> Generated: Sprint R1 — Phase 1
> OS: Ubuntu 25.10 (Questing Quokka)

---

## Node.js Ecosystem

| Tool       | Required Version         | Source                                                              |
| ---------- | ------------------------ | ------------------------------------------------------------------- |
| Node.js    | ≥ 22.x (LTS recommended) | `.node-version` not set; NestJS 11.x, Next.js 15.x require Node 22+ |
| npm        | bundled with Node        | —                                                                   |
| corepack   | bundled with Node        | Enables pnpm without global install                                 |
| pnpm       | 10.33.0                  | `package.json` → `packageManager` field                             |
| turbo      | ≥ 2.5.0                  | `devDependencies` in root `package.json`                            |
| TypeScript | 6.x                      | `devDependencies` in root `package.json`                            |
| tsx        | 4.22.x                   | `devDependencies` in root; used by architecture/release validators  |
| Nest CLI   | 11.x                     | `devDependencies` in root                                           |
| Prisma CLI | 6.19.x                   | `devDependencies` in root                                           |
| eslint     | 10.x                     | `devDependencies` in root                                           |

## Python Ecosystem

| Tool           | Required Version | Source                                                                              |
| -------------- | ---------------- | ----------------------------------------------------------------------------------- |
| Python         | 3.12+            | `pyproject.toml` → `requires-python = ">=3.12"`; Dockerfiles use `python:3.12-slim` |
| pip            | latest           | For installing requirements                                                         |
| venv           | built-in         | Each Python service has its own virtualenv                                          |
| ruff           | 0.9.10           | Code quality (ai-service, vision-service)                                           |
| mypy           | 1.15.0           | Type checking (ai-service, vision-service)                                          |
| pytest         | 8.3.x            | Test runner for all 3 Python services                                               |
| pytest-cov     | 6.0.0            | Coverage for engineering, ai, vision services                                       |
| pytest-asyncio | 0.25.3           | Async tests (ai, vision services)                                                   |

## Docker Infrastructure

| Service             | Image                                         | Port        | Compose File                                              |
| ------------------- | --------------------------------------------- | ----------- | --------------------------------------------------------- |
| PostgreSQL          | postgres:17-alpine                            | 5432        | `infrastructure/docker/compose/base/docker-compose.yml`   |
| Redis               | redis:8-alpine                                | 6380        | Same                                                      |
| RabbitMQ            | rabbitmq:4-management                         | 5672, 15672 | Same                                                      |
| Engineering Service | Build from workspace/                         | 8001        | Same                                                      |
| AI Service          | Build from workspace/                         | 8002        | Same                                                      |
| Vision Service      | Build from workspace/                         | 8003        | Same                                                      |
| Qdrant              | qdrant/qdrant:latest                          | 6333, 6334  | `workspace/docker-compose.yml`                            |
| Prometheus          | prom/prometheus:v2.55.1                       | 9090        | `infrastructure/monitoring/docker-compose.monitoring.yml` |
| Grafana             | grafana/grafana:11.3.0                        | 3002        | Same                                                      |
| Loki                | grafana/loki:3.2.0                            | 3100        | Same                                                      |
| Tempo               | grafana/tempo:2.6.1                           | 3200        | Same                                                      |
| AlertManager        | prom/alertmanager:v0.27.0                     | 9093        | Same                                                      |
| Node Exporter       | prom/node-exporter:v1.8.2                     | 9100        | Same                                                      |
| Postgres Exporter   | prometheuscommunity/postgres-exporter:v0.16.0 | 9187        | Same                                                      |
| Redis Exporter      | oliver006/redis_exporter:v1.67.0              | 9121        | Same                                                      |
| RabbitMQ Exporter   | kbudde/rabbitmq-exporter:latest               | 9419        | Same                                                      |

## System Dependencies

| Tool            | Purpose                                    | Required              |
| --------------- | ------------------------------------------ | --------------------- |
| git             | Version control                            | ✅ Installed (2.51.0) |
| git-lfs         | Large file storage                         | ❌ Missing            |
| curl            | HTTP client, healthchecks                  | ✅ Installed          |
| jq              | JSON processing                            | ✅ Installed          |
| openssl         | JWT key generation                         | ✅ Installed          |
| gcc/g++         | Native module compilation (argon2, bcrypt) | ❌ Missing            |
| make            | Build tool                                 | ❌ Missing            |
| build-essential | Meta-package for gcc/g++/make              | ❌ Missing            |
| psql            | PostgreSQL client                          | ❌ Missing            |
| redis-cli       | Redis client                               | ❌ Missing            |

## NestJS API — Key Dependencies

| Package                  | Version | Purpose             |
| ------------------------ | ------- | ------------------- |
| @nestjs/platform-fastify | 11.x    | HTTP adapter        |
| @nestjs/bullmq           | 11.x    | Job queue           |
| @prisma/client           | 6.19.x  | Database ORM        |
| ioredis                  | 5.x     | Redis client        |
| amqplib                  | 2.x     | RabbitMQ client     |
| minio                    | 8.x     | Object storage      |
| @opentelemetry/\*        | Various | Distributed tracing |
| prom-client              | 15.x    | Prometheus metrics  |

## Next.js Web — Key Dependencies

| Package               | Version | Purpose          |
| --------------------- | ------- | ---------------- |
| next                  | 15.3.2  | Framework        |
| react / react-dom     | 19.x    | UI               |
| next-intl             | 4.x     | i18n             |
| tailwindcss           | 4.x     | Styling          |
| @tanstack/react-query | 5.x     | Data fetching    |
| zustand               | 5.x     | State management |
| tiptap                | 3.x     | Rich text editor |
| recharts              | 3.x     | Charts           |

## Workspace Structure

```
pnpm-workspace.yaml:
  - apps/*       → @xennic/api, @xennic/web
  - packages/*   → @xennic/config, @xennic/database, @xennic/shared, @xennic/types
  - services/*   → (empty placeholder)
  - workers/*    → (not created)
  - workspace/*  → engineering-service, ai-service, vision-service
```

## Current State

| Component         | Status                                             |
| ----------------- | -------------------------------------------------- |
| node_modules      | Partially exists (may be stale from pre-reinstall) |
| pnpm-lock.yaml    | ✅ Exists                                          |
| .env              | ✅ Exists with dev values                          |
| JWT keys          | ✅ Exist in `infrastructure/docker/secrets/`       |
| Prisma migrations | ✅ Present in `prisma/migrations/`                 |
| Docker volumes    | Unknown (post-reinstall)                           |
| Python venvs      | ❌ Need recreation                                 |
| .turbo cache      | ❌ Needs cleanup                                   |

---

_Next: Phase 2 — Install Required Software_
