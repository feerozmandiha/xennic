# Dependency Lock Report — Baseline v1

**Generated:** 2026-07-17
**Sprint:** R2 — Baseline Snapshot & Development Certification

---

## Toolchain Versions

| Tool                   | Version  |
| ---------------------- | -------- |
| Node.js                | v22.23.1 |
| npm                    | 10.9.8   |
| pnpm                   | 10.33.0  |
| Turborepo              | 2.9.16   |
| TypeScript             | 6.0.3    |
| Prisma                 | 6.19.3   |
| @prisma/client         | 6.19.3   |
| Python (system)        | 3.13.7   |
| Python (service venvs) | 3.12.11  |
| pip                    | 25.1.1   |
| Docker                 | 29.6.2   |
| Docker Compose         | v5.3.1   |
| Git                    | 2.51.0   |
| GCC                    | 15.2.0   |

---

## Node.js Packages

### Workspace Packages (6)

| Package          | Version | Location                  |
| ---------------- | ------- | ------------------------- |
| xennic           | 0.1.0   | root                      |
| @xennic/api      | 0.1.0   | apps/api                  |
| @xennic/web      | 0.1.0   | apps/web                  |
| @xennic/config   | 0.1.0   | packages/config           |
| @xennic/database | 0.1.0   | packages/database         |
| @xennic/shared   | 0.1.0   | packages/shared           |
| @xennic/types    | 0.1.0   | packages/types            |
| @xennic/openapi  | 1.0.0   | apps/api/packages/openapi |

### Root devDependencies (54 packages)

| Category      | Packages                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Build**     | @swc/core, esbuild                                                                                                                                                           |
| **Framework** | @nestjs/cli, @nestjs/schematics, @nestjs/testing                                                                                                                             |
| **Linting**   | @commitlint/cli, @commitlint/config-conventional, eslint, eslint-config-prettier, prettier                                                                                   |
| **Testing**   | jest, ts-jest, @types/jest, supertest, @types/supertest                                                                                                                      |
| **Types**     | @types/node, @types/argon2, @types/bcrypt, @types/cors, @types/express, @types/jest, @types/multer, @types/passport-jwt, @types/passport-local, @types/supertest, typescript |
| **ORM**       | prisma                                                                                                                                                                       |
| **Utilities** | tsx, turbo, npm-run-all                                                                                                                                                      |

### Key Runtime Dependencies (by module)

| Module     | Key Deps                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| Auth       | @nestjs/jwt, @nestjs/passport, passport-jwt, passport-local, argon2, bcrypt                |
| API        | @nestjs/core, @nestjs/common, @nestjs/platform-fastify, @nestjs/swagger, @nestjs/throttler |
| Queue      | bullmq, ioredis                                                                            |
| Validation | class-validator, class-transformer                                                         |
| HTTP       | @nestjs/axios, axios                                                                       |
| Search     | @elastic/elasticsearch (planned)                                                           |
| Email      | nodemailer                                                                                 |
| OpenAPI    | @nestjs/swagger                                                                            |

### node_modules Size

- **Installed packages:** 35 direct, 1,242+ transitive
- **Disk usage:** 1.3 GB

---

## Python Dependencies

### engineering-service (14 packages)

| Package           | Constraint |
| ----------------- | ---------- |
| fastapi           | >=0.115.0  |
| uvicorn[standard] | >=0.34.0   |
| pydantic          | >=2.10.0   |
| pydantic-settings | >=2.7.0    |
| numpy             | <2.0.0     |
| pandas            | >=2.2.0    |
| scipy             | >=1.13.0   |
| sympy             | >=1.13.0   |
| pint              | >=0.24.0   |
| pandapower        | >=2.14.0   |
| python-multipart  | >=0.0.20   |
| httpx             | >=0.28.0   |
| pytest            | >=8.3.0    |
| pytest-cov        | >=6.0.0    |

### ai-service (18 packages)

| Package             | Version  |
| ------------------- | -------- |
| fastapi             | 0.115.12 |
| uvicorn[standard]   | 0.34.0   |
| pydantic            | 2.10.6   |
| pydantic-settings   | 2.7.1    |
| openai              | 1.59.9   |
| anthropic           | 0.49.0   |
| google-generativeai | 0.8.4    |
| langchain           | 0.3.20   |
| langgraph           | 0.2.72   |
| httpx               | 0.28.1   |
| minio               | 7.2.16   |
| qdrant-client       | 1.12.1   |
| pytest              | 8.3.5    |
| pytest-asyncio      | 0.25.3   |
| ruff                | 0.9.10   |
| mypy                | 1.15.0   |

### vision-service (19 packages)

| Package               | Version   |
| --------------------- | --------- |
| fastapi               | 0.115.12  |
| uvicorn[standard]     | 0.34.0    |
| pydantic              | 2.10.6    |
| PyMuPDF               | 1.25.5    |
| opencv-contrib-python | 4.10.0.84 |
| Pillow                | 11.1.0    |
| scikit-image          | 0.25.2    |
| scipy                 | 1.15.2    |
| numpy                 | 2.2.4     |
| pytesseract           | 0.3.13    |
| prometheus-client     | 0.21.1    |
| pytest                | 8.3.5     |
| ruff                  | 0.9.10    |
| mypy                  | 1.15.0    |

---

## Docker Images

| Image         | Tag          | Usage                 |
| ------------- | ------------ | --------------------- |
| postgres      | 17-alpine    | PostgreSQL database   |
| redis         | 8-alpine     | Cache + session store |
| rabbitmq      | 4-management | Message broker        |
| qdrant/qdrant | latest       | Vector database       |

### Deferred (Docker Hub rate-limited)

| Image                                 | Tag     | Usage               |
| ------------------------------------- | ------- | ------------------- |
| prom/prometheus                       | v2.55.1 | Metrics             |
| grafana/grafana                       | 11.3.0  | Dashboards          |
| grafana/loki                          | 3.2.0   | Log aggregation     |
| grafana/tempo                         | 2.6.1   | Distributed tracing |
| prom/alertmanager                     | v0.27.0 | Alerting            |
| prom/node-exporter                    | v1.8.2  | Host metrics        |
| prometheuscommunity/postgres-exporter | v0.16.0 | PG metrics          |
| oliver006/redis_exporter              | v1.67.0 | Redis metrics       |
| kbudde/rabbitmq-exporter              | latest  | RabbitMQ metrics    |

---

## Prisma

| Component      | Version/Value                            |
| -------------- | ---------------------------------------- |
| prisma         | 6.19.3                                   |
| @prisma/client | 6.19.3                                   |
| Engine hash    | c2990dca591cba766e3b7ef5d9e8a84796e47ab7 |
| Provider       | postgresql                               |
| Schema models  | 132                                      |
| Migrations     | 6                                        |
| Lock provider  | postgresql                               |

### Migration History

| Migration                                       | Description                   |
| ----------------------------------------------- | ----------------------------- |
| 20260602080333_init                             | Initial schema                |
| 20260617074611_knowledge_system_phase1          | Knowledge system              |
| 20260617080956_add_knowledge_workspace_id       | Knowledge workspace isolation |
| 20260618000000_add_search_text_fts              | Full-text search              |
| 20260705000000_add_event_outbox_and_process_log | Event outbox pattern          |
| 20260707094543_add_provider_management_tables   | AI provider management        |

---

## pnpm Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
  - services/*
  - workers/*
  - workspace/*
```

```json
// package.json pnpm config
{
  "onlyBuiltDependencies": [
    "@nestjs/core",
    "@parcel/watcher",
    "@prisma/client",
    "@prisma/engines",
    "@swc/core",
    "argon2",
    "bcrypt",
    "core-js",
    "esbuild",
    "msgpackr-extract",
    "prisma",
    "protobufjs",
    "sharp",
    "unrs-resolver"
  ]
}
```

---

## Lock File

- **Format:** pnpm lockfile v9.0
- **Auto-install peers:** true
- **Exclude links from lockfile:** false
