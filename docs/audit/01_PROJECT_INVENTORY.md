# 01 — Project Inventory

**Date:** 2026-07-02
**Repository:** `/home/ahmad/xennic`

---

## 1.1 Top-Level Structure

```
xennic/
├── apps/
│   ├── api/                    # NestJS 11 + Fastify, port 3000, /api/v1
│   └── web/                    # Next.js 15.3, port 3001, i18n
├── packages/
│   ├── config/                 # Shared ESLint, Prettier, TSConfig
│   ├── database/               # Prisma client + tenant extension
│   ├── openapi/                # Auto-generated OpenAPI spec
│   ├── shared/                 # Shared constants/utils (no build step)
│   └── types/                  # Shared TypeScript type definitions
├── services/                   # Empty (api-gateway placeholder)
├── workers/                    # Does not exist yet
├── workspace/services/
│   ├── engineering-service/    # FastAPI, port 8001
│   ├── ai-service/             # FastAPI, port 8002
│   └── vision-service/         # FastAPI, port 8003
├── prisma/                     # Schema, migrations, seed
├── infrastructure/
│   ├── docker/                 # Compose files + secrets
│   ├── kubernetes/             # K8s manifests
│   └── nginx/                  # Nginx configs
├── docs/                       # Documentation + audit reports
├── scripts/                    # DB setup, migration, debug scripts
└── tools/                      # (not examined)
```

---

## 1.2 Build & Package Configuration

| File                      | Key Details                                                                |
| ------------------------- | -------------------------------------------------------------------------- |
| **package.json** (root)   | xennic v0.1.0, pnpm@10.33, 19 scripts, 53 devDependencies                  |
| **pnpm-workspace.yaml**   | `apps/*`, `packages/*`, `services/*`, `workers/*`, `workspace/*`           |
| **turbo.json**            | 6 tasks (build, dev, lint, test, typecheck, clean); build dependsOn ^build |
| **apps/api/package.json** | @xennic/api, 11 deps, 13 devDeps, 9 scripts                                |
| **apps/web/package.json** | @xennic/web, 49 deps, 7 devDeps, 5 scripts                                 |
| **nest-cli.json**         | Not present (build uses raw tsc)                                           |
| **eslint.config.mjs**     | Flat config, @eslint/js + typescript-eslint recommended                    |
| **tsconfig.base.json**    | ES2022 target, NodeNext module, strict mode                                |
| **.editorconfig**         | 2-space indent, LF, UTF-8                                                  |

---

## 1.3 API Module Inventory

| #   | Module                 | .ts Files | Lines of Code | Has Tests | Registered |
| --- | ---------------------- | --------- | ------------- | --------- | ---------- |
| 1   | health                 | 5         | 73            | ✅        | ✅         |
| 2   | workspace              | 25        | 2,487         | ✅        | ✅         |
| 3   | user                   | 9         | 978           | ❌        | ✅         |
| 4   | auth                   | 14        | 1,091         | ❌        | ✅         |
| 5   | rbac                   | 23        | 2,052         | ❌        | ✅         |
| 6   | project                | 7         | 1,257         | ❌        | ✅         |
| 7   | engineering            | 8         | 1,103         | ❌        | ✅         |
| 8   | subscription           | 8         | 857           | ❌        | ✅         |
| 9   | storage                | 8         | 885           | ❌        | ✅         |
| 10  | notification           | 7         | 667           | ❌        | ✅         |
| 11  | ai                     | 8         | 1,029         | ❌        | ✅         |
| 12  | consultations          | 5         | 346           | ❌        | ✅         |
| 13  | billing                | 14        | 1,986         | ❌        | ✅         |
| 14  | admin                  | 8         | 1,310         | ✅        | ✅         |
| 15  | search                 | 7         | 483           | ❌        | ✅         |
| 16  | knowledge              | 14        | 3,487         | ✅        | ✅         |
| 17  | standards              | 7         | 448           | ❌        | ✅         |
| 18  | marketplace            | 15        | 1,228         | ❌        | ✅         |
| 19  | api-keys               | 7         | 502           | ❌        | ✅         |
| 20  | webhooks               | 7         | 624           | ❌        | ✅         |
| 21  | email                  | 10        | 539           | ❌        | ✅         |
| 22  | feature-flags          | 10        | 543           | ❌        | ✅         |
| 23  | vision                 | 4         | 288           | ❌        | ✅         |
| 24  | enterprise-background  | 0         | 0             | ❌        | ❌         |
| 25  | enterprise-backup      | 0         | 0             | ❌        | ❌         |
| 26  | enterprise-config      | 0         | 0             | ❌        | ❌         |
| 27  | enterprise-performance | 0         | 0             | ❌        | ❌         |
| 28  | knowledge-factory      | 0         | 0             | ❌        | ❌         |

**Total:** 28 modules (23 registered, 5 empty scaffolding)

---

## 1.4 Global Infrastructure (`apps/api/src/common/` + `shared/`)

| Category         | File                               | Lines | Purpose                            |
| ---------------- | ---------------------------------- | ----- | ---------------------------------- |
| **Guards**       | `super-admin.guard.ts`             | 81    | SUPER_ADMIN role check via raw SQL |
|                  | `auth-throttler.guard.ts`          | 39    | Rate limiting for auth endpoints   |
|                  | `throttler.guard.ts`               | 38    | General rate limiting              |
| **Decorators**   | `rate-limit.decorator.ts`          | 31    | @RateLimit() + presets             |
|                  | `super-admin-only.decorator.ts`    | 35    | Composed JwtAuth+SuperAdmin guard  |
| **Interceptors** | `response.interceptor.ts`          | —     | Unified response wrapper           |
|                  | `hard-delete-audit.interceptor.ts` | 155   | Audit logging for hard deletes     |
|                  | `tenant.interceptor.ts`            | 29    | Workspace context injection        |
| **Filters**      | `all-exceptions.filter.ts`         | 154   | Global exception handler           |
| **Pipes**        | ValidationPipe (main.ts)           | —     | whitelist + forbidNonWhitelisted   |
| **DTOs**         | `pagination.dto.ts`                | —     | page, limit, sortBy, sortOrder     |

---

## 1.5 Python Services

| Service             | Port | Python Files | Test Files | Framework     | Architecture                                                    |
| ------------------- | ---- | ------------ | ---------- | ------------- | --------------------------------------------------------------- |
| engineering-service | 8001 | ~99          | 57         | FastAPI 0.115 | calculators/, api/, core/, data/, schemas/                      |
| ai-service          | 8002 | ~30          | 3          | FastAPI 0.115 | agents/, rag/, tools/, workflows/, core/                        |
| vision-service      | 8003 | ~32          | 6          | FastAPI 0.115 | stages/ (preprocessing, detection, ocr, extraction, validation) |

---

## 1.6 Aggregate Totals

| Metric                     | Count                              |
| -------------------------- | ---------------------------------- |
| **NestJS modules**         | 23 registered + 5 empty = 28 total |
| **Controllers**            | 27                                 |
| **Services**               | 28                                 |
| **Domain entities**        | 39                                 |
| **Repositories**           | 22                                 |
| **DTOs**                   | 25                                 |
| **Total .ts files**        | ~220                               |
| **Total TS lines of code** | ~23,880                            |
| **Python source files**    | ~161                               |
| **Prisma models**          | 61                                 |
| **Migrations**             | 4                                  |
| **Docker services**        | 6                                  |
| **Global guards**          | 3                                  |
| **Global interceptors**    | 2                                  |
| **Global filters**         | 1                                  |
