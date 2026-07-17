# Runtime Manifest — Baseline v1

**Generated:** 2026-07-17
**Sprint:** R2 — Baseline Snapshot & Development Certification

---

## Git State

| Property       | Value                                      |
| -------------- | ------------------------------------------ |
| Branch         | main                                       |
| HEAD           | `e1f3c0e9d1d8988c7a6ed98fe20923079a649d4b` |
| Commit message | `docs: add web runtime qa checklist`       |
| Total commits  | 51                                         |
| Tags           | none (baseline-v1 to be created)           |
| Status         | 5 modified files (Sprint R1 changes)       |

---

## Modified Files (Uncommitted — Sprint R1)

| File                                                | Change                             | Reason                      |
| --------------------------------------------------- | ---------------------------------- | --------------------------- |
| `package.json`                                      | Added `pnpm.onlyBuildDependencies` | Native module build control |
| `workspace/services/engineering-service/Dockerfile` | venv-based pip install             | Docker best practice        |
| `workspace/services/ai-service/Dockerfile`          | venv-based pip install             | Docker best practice        |
| `workspace/services/vision-service/Dockerfile`      | venv-based pip install             | Docker best practice        |
| `docs/generated/governance-report.md`               | Timestamp update                   | Auto-generated              |

### Untracked (Sprint R1 output)

| Path                                           | Content           |
| ---------------------------------------------- | ----------------- |
| `docs/recovery/runtime-inventory.md`           | Phase 1 inventory |
| `docs/recovery/environment-recovery-report.md` | Sprint R1 report  |

---

## Toolchain Versions (Locked)

| Tool              | Version  | Path                            |
| ----------------- | -------- | ------------------------------- |
| Node.js           | v22.23.1 | `~/.nvm/versions/node/v22.23.1` |
| npm               | 10.9.8   | bundled with Node               |
| pnpm              | 10.33.0  | corepack                        |
| Turborepo         | 2.9.16   | `node_modules/.bin/turbo`       |
| TypeScript        | 6.0.3    | `node_modules/.bin/tsc`         |
| Prisma CLI        | 6.19.3   | `node_modules/.bin/prisma`      |
| Python (services) | 3.12.11  | `~/.pyenv/versions/3.12.11`     |
| Python (system)   | 3.13.7   | `/usr/bin/python3`              |
| pip               | 25.1.1   | system                          |
| Docker            | 29.6.2   | `/usr/bin/docker`               |
| Docker Compose    | v5.3.1   | docker plugin                   |
| Git               | 2.51.0   | `/usr/bin/git`                  |
| GCC               | 15.2.0   | `/usr/bin/gcc`                  |

---

## Architecture Version

| Component                  | Version                 |
| -------------------------- | ----------------------- |
| Platform version           | 0.1.0                   |
| API version                | 0.1.0                   |
| Web version                | 0.1.0                   |
| OpenAPI version            | 1.0.0                   |
| Architecture rules         | 87 (11 YAML rule files) |
| Architecture modules       | 43                      |
| Architecture files scanned | 944                     |

---

## Database Schema Version

| Property         | Value                                           |
| ---------------- | ----------------------------------------------- |
| ORM              | Prisma 6.19.3                                   |
| Database         | PostgreSQL 17                                   |
| Schema models    | 132                                             |
| Total migrations | 6                                               |
| Latest migration | `20260707094543_add_provider_management_tables` |
| Migration lock   | postgresql                                      |

---

## Docker Image Versions

| Image         | Tag          | Container       | Port       | Status     |
| ------------- | ------------ | --------------- | ---------- | ---------- |
| postgres      | 17-alpine    | xennic-postgres | 5432       | ✅ running |
| redis         | 8-alpine     | xennic-redis    | 6380       | ✅ running |
| rabbitmq      | 4-management | xennic-rabbitmq | 5672/15672 | ✅ running |
| qdrant/qdrant | latest       | xennic-qdrant   | 6333/6334  | ✅ running |

---

## Environment Variables (Non-Secret)

| Variable                | Value                 | Service    |
| ----------------------- | --------------------- | ---------- |
| NODE_ENV                | development           | API        |
| PORT                    | 3000                  | API        |
| HOST                    | 0.0.0.0               | API        |
| POSTGRES_DB             | xennic                | PostgreSQL |
| POSTGRES_USER           | xennic                | PostgreSQL |
| REDIS_HOST              | localhost             | API        |
| REDIS_PORT              | 6380                  | API        |
| RABBITMQ_HOST           | localhost             | API        |
| RABBITMQ_PORT           | 5672                  | API        |
| ENGINEERING_SERVICE_URL | http://localhost:8001 | API        |
| AI_SERVICE_URL          | http://localhost:8002 | API        |
| VISION_SERVICE_URL      | http://localhost:8003 | API        |
| FRONTEND_URL            | http://localhost:3001 | API        |
| AI_PROVIDER             | mistral               | API        |
| NEXT_PUBLIC_API_URL     | http://localhost:3000 | Web        |

---

## Ports Map

| Port  | Service             | Protocol |
| ----- | ------------------- | -------- |
| 3000  | NestJS API          | HTTP     |
| 3001  | Next.js Web         | HTTP     |
| 5432  | PostgreSQL          | TCP      |
| 5672  | RabbitMQ (AMQP)     | TCP      |
| 6333  | Qdrant (HTTP)       | HTTP     |
| 6334  | Qdrant (gRPC)       | gRPC     |
| 6380  | Redis               | TCP      |
| 8001  | Engineering Service | HTTP     |
| 8002  | AI Service          | HTTP     |
| 8003  | Vision Service      | HTTP     |
| 15672 | RabbitMQ Management | HTTP     |

---

## Running Services (Baseline Snapshot)

| Service             | Port | PID     | Status     |
| ------------------- | ---- | ------- | ---------- |
| xennic-postgres     | 5432 | docker  | ✅ healthy |
| xennic-redis        | 6380 | docker  | ✅ healthy |
| xennic-rabbitmq     | 5672 | docker  | ✅ healthy |
| xennic-qdrant       | 6333 | docker  | ✅ healthy |
| NestJS API          | 3000 | node    | ✅ running |
| Next.js Web         | 3001 | next    | ✅ running |
| Engineering Service | 8001 | uvicorn | ✅ running |
| AI Service          | 8002 | uvicorn | ✅ running |
| Vision Service      | 8003 | uvicorn | ✅ running |

---

## Known Technical Debt

| ID     | Severity    | Category       | Description                                                         |
| ------ | ----------- | -------------- | ------------------------------------------------------------------- |
| TD-001 | 🔴 Critical | Security       | JWT private key committed to git history                            |
| TD-002 | 🔴 Critical | Security       | API keys (GROQ, Mistral) in `.env` files committed to git           |
| TD-003 | 🟠 High     | Security       | DB passwords in committed `.env` files                              |
| TD-004 | 🟠 High     | Infrastructure | Docker Hub rate-limited — monitoring stack deferred                 |
| TD-005 | 🟡 Medium   | Code           | `google.generativeai` deprecated — should migrate to `google.genai` |
| TD-006 | 🟡 Medium   | Infrastructure | Redis started without auth config in compose                        |
| TD-007 | 🔵 Low      | Code           | `workers/*` workspace defined but no directory exists               |
| TD-008 | 🔵 Low      | Infrastructure | `services/api-gateway/` is empty placeholder                        |
| TD-009 | 🔵 Low      | DevEx          | Python services run via `setsid` — should use Docker Compose        |
| TD-010 | 🔵 Low      | Config         | `.env` files use absolute paths — should be relative                |

---

## CI Pipelines

| Workflow     | File                                 | Purpose                     |
| ------------ | ------------------------------------ | --------------------------- |
| CI           | `.github/workflows/ci.yml`           | PR validation               |
| API E2E      | `.github/workflows/api-e2e.yml`      | API E2E tests               |
| Release Gate | `.github/workflows/release-gate.yml` | 8-job release certification |

---

## Credentials (Reference Only — Not Committed)

| Service    | User            | Password    |
| ---------- | --------------- | ----------- |
| PostgreSQL | xennic          | xennic      |
| Redis      | —               | xennic      |
| RabbitMQ   | xennic          | xennic      |
| Admin      | admin@xennic.ir | Admin@12345 |
