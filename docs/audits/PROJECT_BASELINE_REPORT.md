# PROJECT BASELINE REPORT

**Date:** 2026-07-02
**Session:** XED-RECOVERY-001 (fresh audit, no prior trust)

---

## Repository Overview

| Attribute              | Value                                                 |
| ---------------------- | ----------------------------------------------------- |
| Repository             | `/home/ahmad/xennic`                                  |
| Package manager        | pnpm v10.33                                           |
| Build system           | Turborepo                                             |
| NestJS version         | 11.x                                                  |
| Fastify adapter        | @nestjs/platform-fastify                              |
| Prisma version         | 6.19.3                                                |
| TypeScript version     | ^6.x (root) / ^5.8 (web)                              |
| Database               | PostgreSQL 17                                         |
| Message queue          | RabbitMQ (configured in Docker, not used in code)     |
| Cache                  | Redis 8 (configured in Docker, not used in code)      |
| Object storage         | MinIO (configured in Docker + used in storage module) |
| Vector store           | Qdrant (configured in ai-service)                     |
| Python services        | 3 (engineering:8001, ai:8002, vision:8003)            |
| Total endpoints        | 220                                                   |
| Total Prisma models    | 61                                                    |
| Total TS source files  | 246                                                   |
| Total TS lines of code | 25,092                                                |

## Verified Module Count

| Category                    | Count |
| --------------------------- | ----- |
| NestJS modules on disk      | 28    |
| Registered in api.module.ts | 23    |
| Empty (scaffolding only)    | 5     |
| Controllers                 | 38    |
| Services                    | 28    |
| Repositories                | 22    |
| Domain entities             | 39    |
| DTO files                   | 25    |
| Global guards               | 3     |
| Global interceptors         | 2     |
| Global filters              | 1     |
| .spec.ts files              | 9     |
| .e2e-spec.ts files          | 2     |

## Build Verification

| Check                             | Status                     |
| --------------------------------- | -------------------------- |
| TypeScript compilation            | ✅ PASS (zero errors)      |
| Prisma generate                   | ✅ PASS (v6.19.3)          |
| Unit tests (96)                   | ✅ ALL PASS                |
| E2E tests (7)                     | ✅ ALL PASS                |
| Python engineering tests (419/15) | ⚠️ 15 FAIL                 |
| Python AI tests                   | ❌ BROKEN (missing openai) |
| Python vision tests (16)          | ✅ ALL PASS                |
| Full lint (`pnpm lint`)           | ❌ FAIL (3/6 packages)     |
| Web build                         | ⚠️ TIMEOUT (>5 min)        |
| Coverage                          | 8.72% statements           |

## Dependency Health

| Issue                                 | Count           |
| ------------------------------------- | --------------- |
| npm vulnerabilities                   | 57 (3 critical) |
| Major versions behind                 | Prisma 6→7      |
| Runtime deps in devDeps               | ~10 packages    |
| `any` type usage                      | 215             |
| `throw new Error` (not HttpException) | 98              |

## Overall Completion: ~50%

| Dimension          | Score |
| ------------------ | ----- |
| API Maturity       | 82%   |
| Database           | 90%   |
| Security           | 75%   |
| Knowledge Factory  | 0%    |
| AI/RAG             | 35%   |
| Testing            | 10%   |
| Build/Lint         | 30%   |
| CI/CD              | 0%    |
| Enterprise Modules | 0%    |
