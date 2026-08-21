# Xennic — Agent Guide

> **⚠️ MANDATORY STARTUP SEQUENCE — Complete before ANY code changes.**

**1. Read completely: `docs/PROJECT_BOOTSTRAP.md`**

- Full architecture, module registry, sprint history, readiness, debt, topology, events, AI infrastructure, roadmap
- Execute the AI Startup Checklist in Section 15

**2. Read only AFTER bootstrap:**

- `docs/STATUS_REPORT.md` — Current module-level status
- `docs/critical-path.md` — Production dependency chain
- `docs/AI_SESSION_CONTRACT.md` — Governance contract for all sessions
- Relevant ADR files in `docs/adr/` (minimum: ADR-020, ADR-019, ADR-017, ADR-011, ADR-012)

**3. Validate:**

- Run `scripts/bootstrap/bootstrap-check.sh` to verify governance artifact integrity
- Run `pnpm validate:arch` to enforce architecture rules (zero tolerance: exit 0 required)
- Confirm bootstrap version compatibility (see Section 16 of PROJECT_BOOTSTRAP.md)
- Review `docs/TECHNICAL_DEBT_REGISTER.md` if constraints prevent clean validation

**4. Release Validation (must pass before marking work complete):**

- Run `npx tsx tools/release/release-validator.ts` to execute all 15 validation gates
- Verify `docs/generated/release-validation-report.md` shows zero failures
- Verify `docs/generated/build-certification.md` shows grade A+ or A
- Run `pnpm validate:arch` and confirm exit 0

**5. Never begin coding before the bootstrap has been fully loaded and understood.**

## Monorepo

pnpm workspace + Turborepo. Workspace roots in `pnpm-workspace.yaml`:
`apps/*`, `packages/*`, `services/*`, `workers/*`, `workspace/*`.

```bash
pnpm build          # turbo run build
pnpm dev            # turbo run dev
pnpm lint           # turbo run lint
pnpm test           # turbo run test  (dependsOn build — build first)
pnpm typecheck      # turbo run typecheck
pnpm format         # prettier . --write (not through turbo)
pnpm format:check   # prettier . --check
```

## NestJS API (`apps/api`)

- **Fastify** adapter (not Express), port **3000**, prefix `/api/v1`
- Swagger at `/api/docs`
- `tsconfig.json` needs `experimentalDecorators: true`, `emitDecoratorMetadata: true`
- Validation: `whitelist: true`, `forbidNonWhitelisted: true`
- Unified response: `{success, data, meta}` / `{success, error}`
- OpenAPI auto-generated during build (`tsc && pnpm generate:openapi`) → `packages/openapi/v1/openapi.json` — **never edit manually**
- Module imports use `.js` extensions: `import { Foo } from './foo.js'`
- Dev: `pnpm dev` runs `nest start --watch`

### Testing (jest, not vitest)

- Unit tests: `pnpm test` in `apps/api` — jest with ts-jest, matches `*.spec.ts`
- E2E tests: `pnpm test:e2e` — uses `test/jest-e2e.json`, matches `*.e2e-spec.ts`
- Coverage: `pnpm test:cov`
- Test tsconfig (`tsconfig.test.json`) uses `module: "commonjs"` — different from source

## Next.js Web (`apps/web`)

- Port **3001**, standalone output, next-intl i18n
- The `next.config.ts` rewrites proxy vision (`:8003`) and engineering/energy paths separately before the general API proxy (`:3000`)
- Default locale redirect: `/` → `/fa`
- Lint: `next lint` (separate from root eslint)

## Database

PostgreSQL 17, Prisma ORM. Schema at `prisma/schema.prisma`.
All entity IDs are UUIDs, multi-tenant via `workspace_id`.
Seed is pure CJS (`prisma/seed.js`, uses `require`, no tsx needed).

```bash
pnpm db:apply    # prisma db push && prisma generate && node prisma/seed.js
pnpm db:reset    # prisma migrate reset --force && node prisma/seed.js
pnpm db:seed     # node prisma/seed.js
pnpm db:generate # prisma generate
pnpm db:studio   # prisma studio
pnpm db:migrate  # prisma migrate dev
```

## Python Microservices (`workspace/services/`)

Each has its own venv. Activate before working:

| Service                | Port | Framework | Lint/Type  | Test Runner                        |
| ---------------------- | ---- | --------- | ---------- | ---------------------------------- |
| `engineering-service/` | 8001 | FastAPI   | ruff, mypy | pytest --cov=src (min 80%)         |
| `ai-service/`          | 8002 | FastAPI   | ruff, mypy | pytest-asyncio (asyncio_mode=auto) |
| `vision-service/`      | 8003 | FastAPI   | ruff, mypy | pytest (asyncio_mode=auto)         |

```bash
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001
ruff check src tests
mypy src
pytest tests -v --cov=src --cov-report=term-missing
```

## Docker

- Infra stack: `infrastructure/docker/compose/base/docker-compose.yml` (Postgres 17, Redis 8, RabbitMQ 4, engineering-service, ai-service, vision-service)
- Vector DB: `workspace/docker-compose.yml` (Qdrant)
- Production: `infrastructure/docker/compose/production/`
- Docker env: `infrastructure/docker/.env`
- JWT keys (dev): `infrastructure/docker/secrets/jwtRS256.key`

## Config & Formatting

- **EditorConfig**: 2-space indent, LF, UTF-8
- **Prettier** (`packages/config/prettier.config.cjs`): semi, singleQuote, trailingComma all, printWidth 100
- **ESLint**: `eslint.config.mjs` (flat config, NOT `.eslintrc.cjs` — that file is stale)
- **Shared TSConfig** at `packages/config/tsconfig.base.json` — target ES2022, module NodeNext, strict

## Sprint G1 — Enterprise Release Governance & Quality Gate

**8 phases complete.** Governance-only sprint — zero business logic changes.

### Location

- `tools/release/release-validator.ts` — 15-step release validation orchestrator
- `.github/workflows/release-gate.yml` — GitHub Actions pipeline (8 jobs, sequential)
- `docs/VERSION_POLICY.md` — SemVer, ADR, bootstrap, migration numbering policy

### Key Deliverables

- **Release Validator**: architecture → typecheck → lint → unit tests → e2e tests → Prisma schema → migration history → bootstrap version → STATUS_REPORT → ADR refs → OpenAPI → Mermaid → doc links → AGENTS.md refs → rules version
- **Release Manifest**: `docs/generated/release-manifest.json` (commit, timestamp, versions, checksums)
- **Build Certification**: `docs/generated/build-certification.md` (6 scores, overall grade A+-Fail)
- **Release Checklist**: `docs/generated/release-checklist.md` (6 categories, 25 items)
- **Release Gate CI**: 8-job pipeline — architecture → typecheck → lint → tests → docs → release validator → certification → artifacts
- **Version Policy**: `docs/VERSION_POLICY.md` governing all versioning conventions

### Verification

```bash
npx tsx tools/release/release-validator.ts    # 15-step validation + 4 reports
pnpm validate:release                           # Quick: skip slow tests
pnpm validate:arch                              # Must pass (exit 0)
```

## Notable Quirks

- `services/api-gateway/` is empty (placeholder)
- `workers/*` in pnpm-workspace.yaml has no directory yet
- `.env` files: root, `apps/web/.env.local`, per-service dirs, `infrastructure/docker/.env`
- CI pipeline: `.github/workflows/release-gate.yml` — 8-job release gate; `.github/workflows/ci.yml` — CI
- Docs reference in `opencode.json`: `/home/ahmad/xennic/docs`
- `docs/` has `TEST_GUIDE.md` (تست API مرحله‌ای), `STATUS_REPORT.md` (وضعیت ماژول‌ها), `LANDING-PATCH.md` (صفحه فرود), `knowledge/` (اسناد معماری، نمودار رویدادها، ADR)
- `scripts/` has db setup/migration/debug scripts
- `infrastructure/` includes kubernetes and nginx configs
- `.vscode/settings.json` configures Python (mypy, ruff, pytest) — matches CI-less local workflow

## Knowledge Module — Rich Content (Phase K5)

**Location:** `apps/api/src/modules/knowledge/`
**DB tables:** `knowledge_translations`, `knowledge_media`, `knowledge_formulas`, `knowledge_examples`, `knowledge_comments.liked_by` (all pre-existing in `prisma/schema.prisma` — no migration)
**Key classes:** `KnowledgeContentService`, `KnowledgeContentRepository`, `KnowledgeContentController`, `KnowledgeLocale` (value object)
**Docs:** `docs/knowledge/knowledge-rich-content.md`

### Architecture

- Child collections of the existing `knowledge` aggregate — **no new aggregate root**
- Every mutation resolves the root via `KnowledgeService.findOne()` (enforces `workspace_id` isolation + soft delete), then `_assertOwnedBy` verifies the child row belongs to that article
- `KnowledgeLocale` owns locale normalization (`fa-IR` → `fa`) and the fallback chain: requested → default (`fa`) → remaining
- Formula/example writes rebuild the article `search_text` via `KnowledgeService.updateSearchText()` (base content + LaTeX + example titles)
- Comment likes are array-based (`liked_by`), so like/unlike are idempotent and `likes === liked_by.length`

### Route ordering caveat

In `public-knowledge.controller.ts`, `@Get(':slug/localized')` **must** stay declared before `@Get(':slug')` or the wildcard swallows it.

### Verification

```bash
cd apps/api && npx jest --testPathPattern "modules/knowledge/"   # 158 tests
pnpm validate:arch                                                # must exit 0
```

## Marketplace Module — Admin Console & Product Translations

**Location:** `apps/api/src/modules/marketplace/` · `apps/web/src/features/admin/marketplace/`
**DB tables:** `vendors`, `products`, `product_translations` (all pre-existing in `prisma/schema.prisma` — no migration)
**Key classes:** `ProductTranslation` (value object), `ProductEntity`, `ProductService`, `VendorService`, `MarketplaceRepository`, `marketplace.mapper.ts`
**Docs:** `docs/marketplace/marketplace-admin-and-product-translations.md`

### Architecture

- `ProductTranslation` owns every locale concern: supported set (`fa`, `en`), normalization (`fa-IR` → `fa`), title/description validation, and the fallback chain requested → `fa` → `en` → first available
- Strict path (`create`/`collection`) validates user input; lenient path (`fromPersistence`) silently skips malformed DB rows so a bad legacy locale can never break a read
- Translations are a child collection of the `products` aggregate — mutated only through `ProductEntity`; `saveProduct` mirrors the entity set onto `product_translations` (absent locales deleted, rest upserted)
- Controllers return mapper output, **never** raw entities — domain entities keep state in private fields and would serialize as `_sku`/`_price`
- Vendor deletion is guarded: `VendorService.remove` throws `409` while the vendor still owns products

### Route ordering caveat

In `products.controller.ts`, `@Get('suggest')` **must** stay declared before `@Get(':id')` or the wildcard swallows it.

### Verification

```bash
cd apps/api && npx jest --testPathPattern "modules/marketplace"   # 151 tests
pnpm validate:arch                                                # must exit 0
```

## Semantic Integration Module

**Phase K2** — Event-driven integration layer connecting Knowledge Factory, Knowledge Intelligence, AI Runtime, Workspace, RBAC, Storage, and Search.

**Location:** `apps/api/src/modules/semantic-integration/`
**DB tables:** `event_outbox`, `event_process_log` (in `prisma/schema.prisma`)
**Key classes:** `DomainEventPublisher`, `SemanticEventBus`, `OutboxRelayService`, `DocumentPublishedHandler`, `CacheInvalidationHandler`
**Module:** `SemanticIntegrationModule` (`@Global()` — no explicit import needed for providers)

### Architecture

- 12 immutable domain events with typed payloads, event versioning, correlation/causation/tracing IDs
- Outbox pattern: events → DB outbox → poll relay → event bus → handlers
- `@Global()` module so `DomainEventPublisher` is available in all modules without explicit imports
- Idempotency via `event_process_log` table (event_id + handler_name unique constraint)
- Retry: 3 attempts with exponential backoff, then dead-letter

### Event Flow

1. `PublishWorker` emits `DocumentPublished` → `DomainEventPublisher` writes to `event_outbox`
2. `OutboxRelayService` polls every 5s → dispatches to `SemanticEventBus`
3. `DocumentPublishedHandler` creates graph node + metrics via KI services
4. `CacheInvalidationHandler` clears AI Runtime in-memory caches (memory store, prompt store)

### Verification

```bash
pnpm typecheck      # Must pass (tsc --noEmit)
pnpm db:generate    # If schema changes
```

## Sprint K4 — Production Integration Certification

**All 5 phases complete.** 36 integration tests (43 assertions) — 100% pass.

### Test Files

- `apps/api/test/knowledge-lifecycle.e2e-spec.ts` — Full lifecycle: create → update → publish → delete → search → 404
- `apps/api/test/semantic-event-bus.e2e-spec.ts` — Event outbox → bus → handler dispatch, 12 event types
- `apps/api/src/modules/engineering/infrastructure/http/__tests__/circuit-breaker.spec.ts` — 9 unit tests: state transitions, concurrency, recovery
- `apps/api/src/modules/engineering/infrastructure/http/__tests__/engineering-client.service.spec.ts` — 11 integration tests: retry, timeout, correlation ID, circuit breaker integration

### Infrastructure Scripts

- `infrastructure/scripts/health-check.sh` — Verify all 8 services
- `infrastructure/scripts/validate-startup-order.sh` — Validate depends_on + healthcheck
- `infrastructure/scripts/graceful-shutdown.sh` — Test reverse-order shutdown
- `infrastructure/scripts/benchmark.sh` — Performance baseline (latency + concurrency + resource usage)

### Reports (in `docs/`)

- `production-integration-report.md` — Test results, integration points
- `architecture-validation-report.md` — Architecture diagram, ADR validation, security
- `technical-debt-report.md` — 18 items tracked, 7 fixed in K4
- `readiness-score.md` — Overall 7.8/10
- `critical-path.md` — Updated dependency chain for Enterprise AI
- `benchmarks/performance-baseline-template.md` — Ready for production execution

### Run Commands

```bash
pnpm test:e2e                    # E2E tests (knowledge-lifecycle + semantic-event-bus)
npx jest --config jest.config.ts --testPathPattern "circuit-breaker|engineering-client"  # Engineering tests
pnpm typecheck                   # Must pass
```

## Sprint I1 — Enterprise Intelligence Platform

**10 phases complete.** 135 files, ~12,000 LOC, 39 integration tests — 100% pass. No end-user agents or chatbots — pure infrastructure.

### Location

`apps/api/src/modules/enterprise-intelligence/` — each phase is a sub-module with DDD layers.

### Module Structure

| Phase | Module                 | Files   | Tests                  |
| ----- | ---------------------- | ------- | ---------------------- |
| 1     | `context-engine/`      | 13      | 29 unit                |
| 2     | `memory-platform/`     | 12      | 28 unit                |
| 3     | `prompt-governance/`   | 18      | 37 unit                |
| 4     | `tool-registry/`       | 11      | 35 unit                |
| 5     | `skill-registry/`      | 11      | 24 unit                |
| 6     | `reasoning-engine/`    | 15      | 26 unit                |
| 7     | `policy-engine/`       | 10      | 22 unit                |
| 8     | `ai-gateway/`          | 16      | 15 unit                |
| 9     | `evaluation-platform/` | 13      | 21 unit                |
| 10    | `sdk/`                 | 11      | —                      |
| —     | **total**              | **135** | **~237 unit + 39 e2e** |

### Key Architecture Decisions

- All sub-modules are `@Global()` — SDK module imports them explicitly
- In-memory first — all persistence uses interfaces (`IMemoryStore`, `IContextRepository`, etc.) for future DB swap
- No LLM-specific code in reasoning engine — pure structured planning and verification
- Provider-neutral AI Gateway — 8 providers with routing/failover/quotas/retries/telemetry
- All relative imports use `.js` extension

### Verification

```bash
pnpm typecheck                   # Must pass (zero errors)
npx jest --config test/jest-e2e.json --testPathPattern "enterprise-intelligence"  # E2E tests
```

### Phase Details

- **Context Engine** — 11 source builders (`fromWorkspace`, `fromUser`, `fromProject`, etc.) + context assembler with caching
- **Memory Platform** — 7 memory types with `MemoryService`, `MemoryIndexerService`, `MemoryExpirationService`
- **Prompt Governance** — registry with versioning, templates with `{{variable}}` rendering, policy evaluation with wildcards
- **Tool Registry** — JSON Schema validation, capability discovery, execution contracts with timeout
- **Skill Registry** — dependency resolution (transitive + circular detection), skill composition (DAG)
- **Reasoning Engine** — DAG execution graph, reflection with scoring, verification with confidence, telemetry
- **Policy Engine** — priority-ordered evaluation, deny-overrides-allow, wildcard resource matching, enable/disable lifecycle
- **AI Gateway** — 8 providers, token-bucket quota, exponential backoff retry, latency histogram telemetry
- **Evaluation Platform** — pluggable comparison strategies, regression detection with significance thresholds
- **Intelligence SDK** — 9 API facades + `IntelligenceClient` with `executeWorkflow()` and `evaluateAndReason()` cross-cutting methods
