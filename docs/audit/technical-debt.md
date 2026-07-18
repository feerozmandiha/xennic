# Xennic Platform — Technical Debt Audit

> Generated: 2026-07-02
> Scope: Full monorepo audit (apps/api, prisma, services, infra)
> Total items: **48**

---

## Priority Matrix

| Priority          | Count | Criteria                                             |
| ----------------- | ----- | ---------------------------------------------------- |
| **P0 — Critical** | 8     | Data loss risk, security hole, blocking dev workflow |
| **P1 — High**     | 14    | Significant perf/correctness impact, high friction   |
| **P2 — Medium**   | 18    | Best-practice violations, inconsistent patterns      |
| **P3 — Low**      | 8     | Cosmetic, nice-to-have, speculative                  |

---

## P0 — Critical

### CRIT-01: Missing cascade deletes on 20+ relations

- **Category**: Data Integrity
- **Severity**: Critical
- **Business impact**: Deleting a workspace/project/user leaves orphaned rows in `subscriptions`, `orders`, `conversations`, `audit_logs`, `calculation_templates`, etc. Over time DB bloat grows unbounded; GDPR-style hard-delete requests become impossible.
- **Engineering impact**: Every manual cleanup requires bespoke scripts; no confidence in referential integrity.
- **Estimated effort**: 8h (add `onDelete: Cascade` / `onDelete: SetNull` to ~22 relations)
- **Risk**: Existing orphan data may cause FK violations when adding cascade. Must audit production data first.
- **Recommended fix**: Add `onDelete: Cascade` to child-side relations where the child should be deleted with the parent; add `onDelete: SetNull` for audit/history tables. Run `prisma db push` and generate a migration.

**Affected relations (missing `onDelete`):**

| Relation                                                              | File                             |
| --------------------------------------------------------------------- | -------------------------------- |
| `subscriptions → workspaces`                                          | `prisma/schema.prisma:277`       |
| `subscriptions → plans`                                               | `prisma/schema.prisma:278`       |
| `usage_logs → workspaces`                                             | `prisma/schema.prisma:292`       |
| `invoices → workspaces`                                               | `prisma/schema.prisma:318`       |
| `payments → invoices`                                                 | `prisma/schema.prisma:339`       |
| `payments → workspaces` (no relation defined — column only)           | `prisma/schema.prisma:329`       |
| `transactions → payments`                                             | `prisma/schema.prisma:358`       |
| `payment_methods → workspaces`                                        | `prisma/schema.prisma:378`       |
| `payment_methods → users`                                             | `prisma/schema.prisma:379`       |
| `subscription_payments → {workspace, subscription, invoice, payment}` | `prisma/schema.prisma:402-405`   |
| `projects → workspaces`                                               | `prisma/schema.prisma:431`       |
| `calculations → {workspace, project, user}`                           | `prisma/schema.prisma:498-500`   |
| `conversations → {workspace, agent}`                                  | `prisma/schema.prisma:559-560`   |
| `ai_usage → {workspace, user, agent}`                                 | `prisma/schema.prisma:593-595`   |
| `orders → {workspace, user}`                                          | `prisma/schema.prisma:1003-1004` |
| `order_items → products`                                              | `prisma/schema.prisma:1021`      |
| `files → {workspace, user}`                                           | `prisma/schema.prisma:1045-1046` |
| `feature_flags → plans`                                               | `prisma/schema.prisma:1144`      |
| `audit_logs → {workspace, user}`                                      | `prisma/schema.prisma:1163-1164` |
| `workspace_invitations → inviter (users)`                             | `prisma/schema.prisma:228`       |

---

### CRIT-02: `password_reset_tokens` has no Prisma relation to `users`

- **Category**: Data Integrity
- **Severity**: Critical
- **Business impact**: Orphaned password-reset tokens accumulate; no cascade cleanup when a user is deleted.
- **Engineering impact**: Raw Prisma queries needed to JOIN; no type-safe relation navigation.
- **Estimated effort**: 30 min
- **Risk**: Minimal — adding a relation is backward-compatible.
- **Recommended fix**: Add `user users @relation(fields: [user_id], references: [id], onDelete: Cascade)` to `password_reset_tokens` model and `password_reset_tokens password_reset_tokens[]` to `users` model.

---

### CRIT-03: No database health check — health endpoint returns static `ok`

- **Category**: Reliability / Observability
- **Severity**: Critical
- **Business impact**: Orchestrator (K8s, Docker) cannot detect DB outages. A dead DB means every request fails, but the health endpoint says "ok" — no auto-restart, no load-shedding.
- **Engineering impact**: Debugging production issues requires manual SSH; no heartbeat metrics.
- **Estimated effort**: 2h
- **Risk**: Low — additive change.
- **Recommended fix**: Add Prisma `$queryRaw\`SELECT 1\`` probe to health service. Extend to check Redis, RabbitMQ, MinIO readiness.

---

### CRIT-04: No graceful shutdown handling

- **Category**: Reliability
- **Severity**: Critical
- **Business impact**: Pod kill during an active calculation or file upload corrupts data; in-flight requests are hard-dropped.
- **Engineering impact**: No `enableShutdownHooks`, no `process.on('SIGTERM')` — cannot test graceful migration.
- **Estimated effort**: 2h
- **Risk**: Low
- **Recommended fix**: Add `app.enableShutdownHooks()` in `main.ts`. Register `beforeApplicationShutdown` lifecycle hooks for Prisma disconnect, queue connection drain, and HTTP server `close()`.

---

### CRIT-05: UUIDs stored as `String` (TEXT) instead of native `@db.Uuid`

- **Category**: Performance / Data Integrity
- **Severity**: Critical
- **Business impact**: All 40+ entity tables store UUIDs as TEXT (variable-length, no native sort). For tables with millions of rows (audit_logs, ai_usage), indexes are ~30% larger and JOINs are slower.
- **Engineering impact**: No `gen_random_uuid()` at DB level; Prisma generates UUIDs client-side, adding latency.
- **Estimated effort**: XLarge (requires migration on every table)
- **Risk**: Very high — changing column types on a live DB with millions of rows is dangerous. Must be planned as a scheduled migration with read-only mode.
- **Recommended fix**: Add `@db.Uuid` to all `id` and `*_id` foreign-key columns. Generate migration with zero-downtime approach (add new columns, backfill, swap, drop old).

**Current**: `id String @id @default(uuid())` (TEXT)
**Should be**: `id String @id @default(uuid()) @db.Uuid`

---

### CRIT-06: `@nestjs/platform-express` in dependencies (dead weight)

- **Category**: Dependency
- **Severity**: Critical (if not caught in production)
- **Business impact**: The adapter is Fastify, but `@nestjs/platform-express` is installed. Server could accidentally switch to Express in a misconfigured deployment, breaking multipart uploads and performance guarantees.
- **Engineering impact**: Confusion about which adapter is active; extra 3 MB in production image.
- **Estimated effort**: 10 min
- **Risk**: Low — as long as `NestFactory.create` uses `FastifyAdapter`, the Express package is dead code.
- **Recommended fix**: Remove `"@nestjs/platform-express"` from `apps/api/package.json`.

---

### CRIT-07: No CI/CD pipeline (`.github/` directory missing)

- **Category**: DevOps
- **Severity**: Critical
- **Business impact**: Every merge is a manual deploy risk. No automated linting, testing, typechecking, or security scanning. Regressions ship to production silently.
- **Engineering impact**: No safety net encourages "works on my machine" culture; code review cannot catch type errors or test failures.
- **Estimated effort**: 16h (GitHub Actions for lint → test → build → deploy)
- **Risk**: Low
- **Recommended fix**: Create `.github/workflows/ci.yml` with jobs for: pnpm install, lint, typecheck, test (unit + e2e), build. Add a deploy job for staging on push to main.

---

### CRIT-08: No configuration validation (env vars)

- **Category**: Security / Reliability
- **Severity**: Critical
- **Business impact**: A missing `DATABASE_URL` or `JWT_SECRET` silently defaults or crashes at first request instead of failing fast at startup. Production outages from configuration drift are undiagnosable.
- **Engineering impact**: No typed config object; every service reads `process.env` directly with no schema validation.
- **Estimated effort**: 4h
- **Risk**: Low
- **Recommended fix**: Use `@nestjs/config` with a validated `ConfigSchema` class (Joi/Zod). Assert all required env vars exist in `main.ts` before `app.listen`.

---

## P1 — High

### HIGH-01: 452 uses of `any` type across 278 source files

- **Category**: Code Quality
- **Severity**: High
- **Business impact**: Runtime type errors that TypeScript would catch slip to production.
- **Engineering impact**: Refactoring is terrifying — no type-checker safety net. IntelliSense provides no completions for `any`-typed values.
- **Estimated effort**: Large (staged across modules, ~20h)
- **Risk**: Medium — some `any` usages are in tricky Prisma raw query wrappers; fixing without breaking requires thorough testing.
- **Recommended fix**: Enable `noImplicitAny` and `strictNullChecks` in tsconfig. Add proper types to all function signatures. Replace raw SQL wrappers with typed Prisma client calls where possible.

**Hotspots**:

- `apps/api/src/shared/filters/all-exceptions.filter.ts` — 5 `as any` casts
- `apps/api/src/modules/api-keys/infrastructure/repositories/api-key.repository.ts` — 6 `as any` on `$queryRaw`
- `apps/api/src/modules/consultations/...` — `$queryRaw<any[]>`

---

### HIGH-02: `feature_flags.enabled` inconsistently named vs `is_active` pattern

- **Category**: Code Quality / Consistency
- **Severity**: High
- **Business impact**: Developers must check every model to guess the boolean naming convention. Leads to bugs when mapping DTOs.
- **Engineering impact**: Every new boolean field needs a decision; code review debates naming instead of logic.
- **Estimated effort**: 2h
- **Risk**: Low — rename `enabled` → `is_enabled` in schema, entity class, DTOs, and repositories.
- **Recommended fix**: Rename `feature_flags.enabled` to `is_enabled` for consistency with the rest of the schema (11 other `is_*` booleans).

**Model consistency audit**:
| Model | Field | Convention |
|-------|-------|------------|
| `users` | `is_active`, `is_admin` | ✅ `is_*` |
| `plans` | `is_active` | ✅ `is_*` |
| `categories` | `is_active` | ✅ `is_*` |
| `feature_flags` | `enabled` | ❌ should be `is_enabled` |
| `payment_methods` | `is_default` | ✅ `is_*` |

---

### HIGH-03: 5 stub enterprise modules with no implementation

- **Category**: Architecture
- **Severity**: High
- **Business impact**: Blocks enterprise-tier feature delivery. Modules exist in the codebase but are non-functional, creating false expectations.
- **Engineering impact**: Import paths and module registrations are missing. Any developer starting an enterprise feature must create from scratch with no context.
- **Estimated effort**: 80h+ (full DDD implementation per module)
- **Risk**: N/A — these are empty shells.
- **Recommended fix**: Either implement the modules properly or remove the stubs and add them to a feature roadmap. Stubs should not be in the main branch.

**Current state**:
| Module | Contents |
|--------|----------|
| `enterprise-background/` | Empty `presentation/controllers/` dir |
| `enterprise-backup/` | Empty `presentation/` dir |
| `enterprise-config/` | Empty `presentation/` dir |
| `enterprise-performance/` | Empty `application/interceptors/` dir |
| `knowledge-factory/` | Empty `infrastructure/` dir |

---

### HIGH-04: 49+ `String` fields that should be Prisma enums

- **Category**: Data Integrity / Code Quality
- **Severity**: High
- **Business impact**: Invalid status strings can be inserted via raw SQL or migration scripts with no DB-level validation.
- **Engineering impact**: Every query filters `WHERE status = 'active'` with no IDE support for valid values. Typos become runtime bugs.
- **Estimated effort**: 16h
- **Risk**: Medium — existing data may contain values not in the new enum. Requires data audit and staged migration.
- **Recommended fix**: Define Prisma enums for all status/role/type fields. Generate migration with `using: "status::text"` casts.

**Top candidates**:
| Model | Field | Values (from comments/defaults) |
|-------|-------|---------------------------------|
| `workspace_members` | `role` | MEMBER, ADMIN, OWNER |
| `workspace_invitations` | `role` | MEMBER, ADMIN, OWNER |
| `workspace_invitations` | `status` | pending, accepted, declined, expired |
| `subscriptions` | `status` | active, trialing, past_due, canceled, expired |
| `invoices` | `status` | pending, paid, overdue, canceled, refunded |
| `payments` | `status` | pending, paid, failed, refunded |
| `transactions` | `type` | payment, refund, adjustment |
| `transactions` | `status` | pending, completed, failed |
| `subscription_payments` | `status` | pending, paid, failed, refunded |
| `projects` | `status` | active, completed, archived, cancelled |
| `project_members` | `role` | viewer, editor, admin, owner |
| `knowledge` | `status` | draft, review, published, archived |
| `knowledge` | `visibility` | public, private, workspace |
| `notifications` | `type` | email, sms, push, in_app |
| `notifications` | `channel` | email, sms, push, in_app |
| `notifications` | `status` | pending, sent, failed, read |
| `orders` | `status` | pending, confirmed, shipped, completed, cancelled |
| `products` | `status` | active, inactive, discontinued |
| `calculation_templates` | `type` | basic, cable, transformer, ... |
| `calculations` | `type` | basic, cable, transformer, protection, power_quality |

---

### HIGH-05: Missing `@updatedAt` on mutable models

- **Category**: Data Integrity
- **Severity**: High
- **Business impact**: Cannot track when critical records were last modified (e.g., feature flag toggles, API key usage). Audit trails are incomplete.
- **Engineering impact**: Manual `updated_at` management required in application code.
- **Estimated effort**: 4h
- **Risk**: Low — additive field with `@updatedAt` Prisma handles automatically.
- **Recommended fix**: Add `updated_at DateTime @updatedAt` to all mutable models currently missing it.

**Models missing `@updatedAt`** (mutable subset):
| Model | Rationale |
|-------|-----------|
| `sessions` | `last_activity_at` changes |
| `password_reset_tokens` | `used_at` changes |
| `workspace_members` | `role` can change |
| `workspace_invitations` | `status` can change |
| `payments` | `status`, `paid_at` change |
| `transactions` | `status` changes |
| `calculation_templates` | schema can be updated |
| `engineering_standards` | status changes |
| `agents` | `is_active`, `version` change |
| `tags` | name can be updated |
| `product_translations` | title, description can change |
| `api_keys` | `last_used_at` changes (though this isn't the same as updatedAt) |
| `webhooks` | `is_active`, `events` change |
| `feature_flags` | **No `updatedAt`** — critical for audit |
| `notifications` | `status`, `sent_at` change |
| `files` | `deleted_at` changes |

---

### HIGH-06: Missing indexes on foreign-key columns (10+ FKs unindexed)

- **Category**: Performance
- **Severity**: High
- **Business impact**: Queries filtering by these FKs do full table scans. With table growth (>100k rows), response times degrade exponentially.
- **Engineering impact**: No EXPLAIN plan culture; performance issues detected only in production.
- **Estimated effort**: 2h
- **Risk**: Low — additive indexes are read-optimized, no query rewriting needed.
- **Recommended fix**: Audit all FK columns for `@@index`. Add indexes where missing.

**Missing indexes** (partial list):
| Model | FK Column |
|-------|-----------|
| `workspace_members` | `user_id` (has workspace_id) |
| `project_notes` | `created_by` (user FK) |
| `project_reports` | `file_id` |
| `calculations` | `user_id` |
| `calculations` | `project_id` |
| `ai_usage` | `agent_id` |
| `file_versions` | `file_id` |
| `order_items` | `product_id` |
| `product_translations` | `product_id` |
| `subscription_payments` | `invoice_id`, `payment_id` |

---

### HIGH-07: No `.github/` CI/CD (duplicate from CRIT-07, tracked at infra level)

- **Category**: DevOps
- **Severity**: High
- **Reference**: See CRIT-07

---

### HIGH-08: 3 E2E tests only — integration test gap

- **Category**: Test
- **Severity**: High
- **Business impact**: Module interactions (auth → RBAC → workspace → project) are untested. Breaking changes between modules are caught only in staging or production.
- **Engineering impact**: Fear of refactoring cross-module code. Developers over-test in unit tests to compensate.
- **Estimated effort**: 40h+
- **Risk**: Low
- **Recommended fix**: Write integration tests for all cross-module flows: auth + workspace, project + calculations, knowledge + search.

---

### HIGH-09: 278 source files, only 24 test files (~8.6% test density)

- **Category**: Test
- **Severity**: High
- **Business impact**: Most of the business logic (knowledge lifecycle, billing, marketplace, engineering calculations) has zero tests. Regressions are inevitable.
- **Engineering impact**: Manual testing for every change; no regression suite.
- **Estimated effort**: 200h+ (ongoing)
- **Risk**: Low per individual test; cumulative effort is high.
- **Recommended fix**: Establish minimum 60% coverage threshold. Prioritize core domains: Auth, Workspace, Knowledge, Engineering calculations.

**Module coverage map**:
| Module | Source files | Test files | Coverage status |
|--------|-------------|------------|-----------------|
| health | 2 | 2 | ✅ Good |
| ai-runtime | ~15 | 8 | ✅ Good |
| knowledge | ~20 | 3 | ⚠️ Partial |
| workspace | ~10 | 2 | ⚠️ Partial |
| admin | ~8 | 1 | ❌ Minimal |
| auth | ~12 | 0 | ❌ None |
| engineering | ~15 | 0 | ❌ None |
| billing | ~10 | 0 | ❌ None |
| marketplace | ~10 | 0 | ❌ None |
| notification | ~8 | 0 | ❌ None |
| project | ~10 | 0 | ❌ None |
| All others | ~160 | 0 | ❌ None |

---

### HIGH-10: Spec files excluded from main `tsconfig.json`, causing ESLint `parserOptions.project` errors

- **Category**: Code Quality / DX
- **Severity**: High
- **Business impact**: ESLint with `project: true` fails to parse `.spec.ts` files because they are excluded from `tsconfig.json`. Developers either disable linting on tests or add `// @ts-nocheck`.
- **Engineering impact**: Type-aware lint rules (e.g., `@typescript-eslint/no-floating-promises`) don't apply to tests. Test quality suffers.
- **Estimated effort**: 1h
- **Risk**: Low — add `tsconfig.eslint.json` that extends the main config and includes spec files.
- **Recommended fix**: Create `tsconfig.eslint.json` with `include: ["src/**/*.ts", "test/**/*.ts"]` and point ESLint's `parserOptions.project` to it.

---

### HIGH-11: Raw SQL (`$queryRaw` / `$executeRaw`) used instead of Prisma Client

- **Category**: Code Quality
- **Severity**: High
- **Business impact**: Raw SQL bypasses Prisma's type generation. Schema changes silently break queries at runtime.
- **Engineering impact**: 11+ raw SQL calls that must be manually maintained. No type safety, no IDE autocompletion.
- **Estimated effort**: 8h
- **Risk**: Medium — some raw SQL uses window functions or complex joins not easily expressible in Prisma.
- **Recommended fix**: Replace simple CRUD raw SQL with Prisma client calls. For complex queries, add Prisma views or raw queries with typed parsers.

**Hotspots**:
| File | Raw calls |
|------|-----------|
| `apps/api/src/modules/api-keys/.../api-key.repository.ts` | 8 |
| `apps/api/src/common/guards/super-admin.guard.ts` | 1 |
| `apps/api/src/common/interceptors/hard-delete-audit.interceptor.ts` | 1 |
| `apps/api/src/modules/consultations/.../consultations.repository.ts` | 1+ |

---

### HIGH-12: Empty `services/api-gateway/` directory

- **Category**: Architecture / DevOps
- **Severity**: High
- **Business impact**: The project roadmap includes an API gateway but no implementation exists. May confuse deployment topology.
- **Engineering impact**: Developers unsure whether to route through gateway or direct to API.
- **Estimated effort**: N/A (scope decision)
- **Risk**: N/A
- **Recommended fix**: Either implement the gateway or remove the directory. Add a README explaining the intended architecture if kept as a placeholder.

---

### HIGH-13: Empty Kubernetes manifests directory

- **Category**: DevOps
- **Severity**: High
- **Business impact**: No production deployment manifests. Every deploy requires manual steps or custom scripting.
- **Engineering impact**: No staging/production parity. Cannot test scaling, secrets management, or rolling updates.
- **Estimated effort**: 24h
- **Risk**: Low
- **Recommended fix**: Create K8s manifests for all services (api, web, engineering-service, ai-service, vision-service) with ConfigMaps, Secrets, HPAs, and network policies.

---

### HIGH-14: No workers/ directory (referenced in `pnpm-workspace.yaml`)

- **Category**: Architecture
- **Severity**: High
- **Business impact**: Background job processing infrastructure is missing. Tasks like email sending, report generation, and knowledge indexing must run synchronously in the API process.
- **Engineering impact**: Blocking I/O in request threads; no retry/queue mechanism for long-running tasks.
- **Estimated effort**: 40h+ (create worker package, integrate with RabbitMQ/bull)
- **Risk**: Medium — new infrastructure requires deployment planning.
- **Recommended fix**: Create `workers/email-worker`, `workers/report-worker` packages. Integrate with existing RabbitMQ (docker compose). Move notification delivery and report generation to workers.

---

## P2 — Medium

### MED-01: Stale `.eslintrc.cjs` coexists with `eslint.config.mjs`

- **Category**: Code Quality / DX
- **Severity**: Medium
- **Business impact**: Confusing dual config — one is flat (mjs), one is legacy (cjs). Team members may edit the wrong file.
- **Engineering impact**: ESLint may read the stale file depending on version, leading to inconsistent lint results.
- **Estimated effort**: 10 min
- **Risk**: Low — flat config (mjs) is the active one.
- **Recommended fix**: Delete `.eslintrc.cjs` after verifying flat config covers all needed rules.

---

### MED-02: Magic numbers and hardcoded values in main.ts and api.module.ts

- **Category**: Code Quality
- **Severity**: Medium
- **Business impact**: Rate limits (10 req/10s), file size limits (100 MB), CORS max age (86400s) are hardcoded. Tuning for production requires code changes.
- **Engineering impact**: Cannot override per environment. Different plans (free/pro/enterprise) need different rate limits.
- **Estimated effort**: 2h
- **Risk**: Low
- **Recommended fix**: Move all tunable constants (rate limits, file size, CORS max age) to environment variables with typed defaults.

**Hardcoded values**:
| Location | Value | Should be |
|----------|-------|-----------|
| `apps/api/src/main.ts:39` | `100 * 1024 * 1024` (100 MB) | `FILE_UPLOAD_MAX_SIZE` |
| `apps/api/src/api.module.ts:59` | `ttl: 10000, limit: 10` | `RATE_LIMIT_SHORT_TTL/LIMIT` |
| `apps/api/src/api.module.ts:63` | `ttl: 60000, limit: 100` | `RATE_LIMIT_MEDIUM_TTL/LIMIT` |
| `apps/api/src/api.module.ts:67` | `ttl: 3600000, limit: 1000` | `RATE_LIMIT_LONG_TTL/LIMIT` |
| `apps/api/src/main.ts:85` | `maxAge: 86400` | `CORS_MAX_AGE` |

---

### MED-03: No `@db.Uuid` usage — all IDs stored as TEXT

- **Category**: Performance
- **Severity**: Medium (elevated to Critical for production scale — see CRIT-05)
- **Reference**: See CRIT-05

---

### MED-04: Persian comments mixed with English throughout codebase

- **Category**: Documentation / Code Quality
- **Severity**: Medium
- **Business impact**: Non-Persian-speaking developers (or future OSS contributors) cannot understand inline documentation.
- **Engineering impact**: Mental context-switch when reading comments; Google Translate needed.
- **Estimated effort**: 4h
- **Risk**: Low
- **Recommended fix**: Standardize on English for all code comments. Move Persian docs to Persian-language documentation files if needed.

**Examples**:

- `apps/api/src/api.module.ts` — `// ✅ صورتحساب`, `// ✅ ادمین`
- `apps/api/src/modules/notification/application/services/notification.service.ts:67` — `// TODO: برای email/sms در آینده با queue ارسال می‌شود`
- `apps/api/src/modules/webhooks/infrastructure/repositories/webhook.repository.ts` — Persian inline comments

---

### MED-05: `method_name_casing` inconsistency in repositories (snake_case vs camelCase)

- **Category**: Code Quality
- **Severity**: Medium
- **Business impact**: Some repositories return snake_case DB columns directly; controllers expect camelCase. Forces manual mapping.
- **Engineering impact**: Every raw SQL result needs manual transformation. Source of bugs when adding new fields.
- **Estimated effort**: 4h
- **Risk**: Low
- **Recommended fix**: Ensure all repositories return camelCase consistently. Use Prisma client (which auto-converts) instead of raw SQL where possible.

---

### MED-06: `discipline` typo in `knowledge_taxonomy.taxonomy_type` (should be `discipline`/`discipline`)

- **Category**: Code Quality
- **Severity**: Medium
- **Business impact**: None yet, but if third parties consume the taxonomy API, they'll have to match the incorrect value.
- **Engineering impact**: Perpetuates the typo through codebase; confusing when searching for "discipline" references.
- **Estimated effort**: 30 min
- **Risk**: Medium — changing taxonomy_type values requires DB migration and code updates.
- **Recommended fix**: Add a migration to fix the value. Leave the typo in the enum if third-party code depends on it.

---

### MED-07: Commented-out code blocks in guards and interceptors

- **Category**: Code Quality
- **Severity**: Medium
- **Business impact**: None, but dead comment clutter reduces signal-to-noise ratio.
- **Engineering impact**: Distracts during code review; outdated comments mislead.
- **Estimated effort**: 1h
- **Risk**: Low
- **Recommended fix**: Remove commented-out code. If it represents future feature work, create a ticket instead.

---

### MED-08: `health` module not wired into Swagger tags (missing from ApiModule)

- **Category**: Documentation
- **Severity**: Medium
- **Business impact**: Health endpoints are not discoverable via Swagger.
- **Engineering impact**: Manual curl to test health; no documentation for ops team.
- **Estimated effort**: 10 min
- **Risk**: Low
- **Recommended fix**: Add `health` to ApiModule imports if not already (it is), and verify Swagger tag is present.

---

### MED-09: No `Adr` (Architecture Decision Records) directory

- **Category**: Documentation
- **Severity**: Medium
- **Business impact**: No historical record of why architectural decisions were made (e.g., why DDD, why Fastify, why multi-tenant via workspace_id).
- **Engineering impact**: New joiners ask the same questions repeatedly; decisions get re-litigated.
- **Estimated effort**: 4h
- **Risk**: Low
- **Recommended fix**: Create `docs/adr/` with initial records for: DDD adoption, Fastify choice, multi-tenant strategy, Prisma ORM.

---

### MED-10: `packages/shared` and `packages/types` appear unused in `apps/api`

- **Category**: Dependency / Architecture
- **Severity**: Medium
- **Business impact**: None, but workspace bloat and install overhead.
- **Engineering impact**: Developers may duplicate types already in `@xennic/types`.
- **Estimated effort**: 2h (verify usage across all apps)
- **Risk**: Low
- **Recommended fix**: Audit imports across the monorepo. Remove or deprecate unused packages.

---

### MED-11: `is_admin` on `users` duplicates RBAC `user_roles` system

- **Category**: Architecture
- **Severity**: Medium
- **Business impact**: Super-admin check via `is_admin` boolean bypasses RBAC permissions. Inconsistent enforcement — some gates check the boolean, others check roles.
- **Engineering impact**: Two authorization paths to maintain. Risk of privilege escalation if one path is misconfigured.
- **Estimated effort**: 8h
- **Risk**: Medium — removing `is_admin` requires migrating all checks to RBAC.
- **Recommended fix**: Deprecate `is_admin`. Migrate super-admin checks to use a dedicated SUPER_ADMIN role via `user_roles`. Remove column after migration.

---

### MED-12: `sessions` model tracks `workspace_id` but has no `workspaces` relation

- **Category**: Data Integrity
- **Severity**: Medium
- **Business impact**: Cannot cascade-delete sessions when a workspace is deleted.
- **Engineering impact**: Manual session cleanup needed.
- **Estimated effort**: 30 min
- **Risk**: Low — sessions table is write-heavy; adding relation adds FK constraint overhead.
- **Recommended fix**: Either add the relation and cascade, or remove `workspace_id` from sessions if not needed.

---

### MED-13: `role_permissions` junction table has no `@@index([permission_id])`

- **Category**: Performance
- **Severity**: Medium
- **Business impact**: Queries filtering by `permission_id` (e.g., "find all roles with this permission") do full scan.
- **Engineering impact**: Performance degrades with permission count.
- **Estimated effort**: 10 min
- **Risk**: Low
- **Recommended fix**: Add `@@index([permission_id])` to `role_permissions`.

---

### MED-14: `knowledge_taxonomy` lacks index on `(taxonomy_type, taxonomy_id)` for reverse lookups

- **Category**: Performance
- **Severity**: Medium
- **Business impact**: "Find all knowledge items in category X" queries are slow.
- **Engineering impact**: No composite index for the most common query pattern.
- **Estimated effort**: 10 min
- **Risk**: Low
- **Recommended fix**: Add `@@index([taxonomy_type, taxonomy_id])`.

---

### MED-15: `notification` model stores `type`, `channel`, `status` as plain strings

- **Category**: Code Quality
- **Severity**: Medium
- **Business impact**: Invalid notification types can be inserted.
- **Engineering impact**: See HIGH-04 (enum audit).

---

### MED-16: `api_keys.last_used_at` exists but `updated_at` does not

- **Category**: Data Integrity
- **Severity**: Medium
- **Business impact**: Cannot tell when an API key was created vs last used vs last modified.
- **Engineering impact**: Separate tracking for different timestamps.
- **Estimated effort**: 10 min
- **Risk**: Low
- **Recommended fix**: Add `updated_at DateTime @updatedAt`.

---

### MED-17: No global `X-Request-ID` tracing

- **Category**: Observability
- **Severity**: Medium
- **Business impact**: Request-level tracing impossible. Correlating logs across API, workers, and services requires manual effort.
- **Engineering impact**: Debugging production issues is slow; no distributed tracing.
- **Estimated effort**: 4h
- **Risk**: Low
- **Recommended fix**: Add middleware to generate/forward `X-Request-ID`. Integrate with NestJS logger and pass to backend services.

---

### MED-18: `health` module not registered in any Swagger tag group

- **Category**: Documentation
- **Severity**: Medium
- **Reference**: See MED-08

---

## P3 — Low

### LOW-01: `audit_logs` has no `@@index([entity, entity_id])`

- **Category**: Performance
- **Severity**: Low
- **Business impact**: Finding audit trail for a specific entity is slow.
- **Engineering impact**: Affects admin panel performance.
- **Estimated effort**: 10 min
- **Risk**: Low
- **Recommended fix**: Add `@@index([entity, entity_id])`.

---

### LOW-02: `transactions` table lacks `@@index([type])`

- **Category**: Performance
- **Severity**: Low
- **Business impact**: Filtering by transaction type is unindexed.
- **Estimated effort**: 10 min
- **Risk**: Low

---

### LOW-03: `knowledge_media` uses `url` as storage mechanism — no path abstraction

- **Category**: Architecture
- **Severity**: Low
- **Business impact**: Hard to migrate storage backend (MinIO → S3 → GCS).
- **Engineering impact**: URLs hardcoded; storage abstraction exists only in `files` table.
- **Estimated effort**: 4h
- **Risk**: Low
- **Recommended fix**: Reference `files.id` instead of raw URLs in `knowledge_media`.

---

### LOW-04: `orders.total_amount` could be derived from `order_items`

- **Category**: Data Integrity
- **Severity**: Low
- **Business impact**: Possible inconsistency between `orders.total_amount` and sum of `order_items.total_price`.
- **Engineering impact**: Application must ensure they stay in sync.
- **Estimated effort**: 4h
- **Risk**: Medium — removing the column requires updating all write paths.
- **Recommended fix**: Either add a DB trigger/application constraint to sync, or remove `total_amount` from `orders` and compute on read.

---

### LOW-05: Prettier config uses trailing commas — conflicts with some NestJS decorator expectations

- **Category**: Code Quality
- **Severity**: Low
- **Business impact**: Minor formatting inconsistencies in parameter decorators.
- **Estimated effort**: 30 min
- **Risk**: Low
- **Recommended fix**: Add `"trailingCommas": "all"` override for ts files if needed, or disable for decorator-heavy files.

---

### LOW-06: `packages/config/tsconfig.json` is empty/minimal

- **Category**: Code Quality
- **Severity**: Low
- **Engineering impact**: May cause IDE to use incorrect settings for config package.
- **Estimated effort**: 10 min
- **Risk**: Low

---

### LOW-07: No `package.json` scripts for DB rollback

- **Category**: DevOps
- **Severity**: Low
- **Business impact**: DB migration failures require manual Prisma commands.
- **Engineering impact**: No `pnpm db:rollback` — team must remember Prisma CLI syntax.
- **Estimated effort**: 10 min
- **Risk**: Low
- **Recommended fix**: Add `"db:rollback": "prisma migrate down"` to package.json.

---

### LOW-08: No `format:check` in CI — formatting depends on pre-commit hooks

- **Category**: DevOps
- **Severity**: Low
- **Business impact**: Unformatted code can be merged if pre-commit hooks are bypassed.
- **Engineering impact**: Diff noise from formatting changes.
- **Estimated effort**: 10 min
- **Risk**: Low
- **Recommended fix**: Add `pnpm format:check` to CI pipeline.

---

## Summary

| Category       | P0    | P1     | P2     | P3    | Total  |
| -------------- | ----- | ------ | ------ | ----- | ------ |
| Architecture   | 0     | 3      | 1      | 1     | 5      |
| Code Quality   | 0     | 3      | 6      | 2     | 11     |
| Data Integrity | 3     | 2      | 1      | 1     | 7      |
| Dependency     | 1     | 0      | 1      | 0     | 2      |
| DevOps         | 2     | 3      | 0      | 2     | 7      |
| Documentation  | 0     | 0      | 2      | 0     | 2      |
| Observability  | 0     | 0      | 1      | 0     | 1      |
| Performance    | 1     | 2      | 2      | 2     | 7      |
| Reliability    | 2     | 0      | 0      | 0     | 2      |
| Security       | 1     | 0      | 0      | 0     | 1      |
| Test           | 0     | 3      | 0      | 0     | 3      |
| **Total**      | **8** | **14** | **18** | **8** | **48** |

### Recommended sprint plan

| Sprint       | Items                                            | Theme                             | Estimated hours |
| ------------ | ------------------------------------------------ | --------------------------------- | --------------- |
| **Sprint 1** | CRIT-01, CRIT-02, CRIT-06, MED-01, HIGH-10       | Quick wins + data integrity       | 12h             |
| **Sprint 2** | CRIT-03, CRIT-04, CRIT-08, MED-02                | Reliability & config              | 10h             |
| **Sprint 3** | HIGH-01, HIGH-11, MED-05                         | Type safety & raw SQL elimination | 30h             |
| **Sprint 4** | HIGH-03, HIGH-12, HIGH-14, MED-08                | Architecture gaps                 | 40h+            |
| **Sprint 5** | CRIT-05, HIGH-06, MED-03, MED-13, MED-14         | Database optimization             | 24h+            |
| **Sprint 6** | HIGH-04, MED-10, MED-11, MED-15, MED-16          | Schema quality                    | 30h             |
| **Sprint 7** | CRIT-07, HIGH-13, LOW-07, LOW-08                 | CI/CD & deployment                | 42h             |
| **Sprint 8** | HIGH-08, HIGH-09, MED-17                         | Test coverage & observability     | 200h+           |
| **Ongoing**  | HIGH-05, MED-04, MED-06, MED-07, LOW-01 → LOW-06 | Low-priority cleanup              | 16h             |
