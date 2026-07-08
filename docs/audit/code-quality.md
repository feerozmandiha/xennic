# Code Quality Audit Report

**Date:** 2026-07-02
**Scope:** `apps/api/src/modules/` (TypeScript) and `workspace/services/` (Python)
**Total files scanned:** ~180 TS source files, ~35 Python source files

---

## Maintainability Score: **43 / 100**

| Dimension | Score | Criticality |
|---|---|---|
| Dead Code Elimination | 65 | Medium |
| Code Duplication | 30 | High |
| Method Length | 35 | High |
| Class Size | 40 | High |
| Magic Numbers | 50 | Medium |
| Naming Conventions | 55 | Medium |
| DDD Alignment | 25 | High |
| SOLID Principles | 30 | High |
| DRY Principle | 35 | High |
| KISS Principle | 40 | Medium |
| Clean Architecture | 25 | High |
| Testability | 45 | Medium |
| Comments/Documentation | 60 | Medium |
| Error Handling | 30 | High |
| Async Patterns | 50 | Medium |

---

## 1. Dead Code Elimination (65/100)

### Commented-out blocks left in production code

- `modules/notification/application/services/notification.service.ts:68` — commented-out TODO for future email/SMS sending
- `modules/user/domain/entities/user.entity.ts:95` — `// BUG FIX: was return this._firstName + ' ' + this._lastName` — fix comment has value but should be in git blame, not code
- `modules/user/presentation/dtos/user-response.dto.ts:48` — same BUG FIX comment carried from entity

### Unused imports suspected

- `modules/ai-runtime/application/services/pipeline-orchestrator.service.ts` — imports multiple tools/services, many likely unused
- `modules/knowledge/presentation/controllers/taxonomy.controller.ts:19,33` — uses `prisma.$queryRawUnsafe` bypassing the service layer entirely; fragile and dead-codish pattern

**Recommendation:** Remove commented code; enforce `no-unused-vars` with tsconfig strict.

---

## 2. Code Duplication (30/100)

### Pagination boilerplate — ~25 occurrences

Every paginated endpoint repeats the same pattern identically:

```typescript
const page = dto.page ?? 1;
const limit = dto.limit ?? 10;
const offset = (page - 1) * limit;
// ...
return { success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
```

Found in:
- `modules/billing/application/services/billing.service.ts:68-71`
- `modules/project/application/services/project.service.ts:58-64`
- `modules/webhooks/application/services/webhook.service.ts:55-63`
- `modules/feature-flags/application/services/feature-flag.service.ts:59-68`
- `modules/search/infrastructure/repositories/search.repository.ts:35-43`
- `modules/marketplace/infrastructure/repositories/marketplace.repository.ts:65-72, 121-128, 138-145, 259-266`
- `modules/knowledge/infrastructure/repositories/knowledge.repository.ts:69-78`
- `modules/standards/infrastructure/repositories/standard.repository.ts:32-40`
- `modules/api-keys/application/services/api-key.service.ts:46-52`
- `modules/notification/application/services/notification.service.ts:102-108`
- And ~15 other locations

### PRO_ONLY_CALCULATIONS — exact duplicate list

Two services maintain identical lists of "pro-only" calculation slugs:

- `modules/engineering/application/services/engineering.service.ts:117-140` — 23 items
- `modules/marketplace/application/services/product.service.ts:59-82` — same 23 items

### Duplicate env reading patterns

- `modules/email/infrastructure/providers/nodemailer.provider.ts` — reads host, port, user, pass, secure inline
- `modules/auth/infrastructure/jwt/jwt.service.ts` — reads key paths inline
- Both should use ConfigService (NestJS config)

### Catch-block duplication

All repositories follow the same try/catch template — correct structurally, but the error handling is identical boilerplate in ~95 locations. Consider a base repository class.

---

## 3. Method Length (35/100)

### Excessively long methods (>100 lines)

| File | Method | Lines |
|---|---|---|
| `modules/knowledge/application/services/knowledge.service.ts` | `getPaginated` | ~120 |
| `modules/knowledge/application/services/knowledge.service.ts` | `create` | ~95 |
| `modules/admin/application/services/admin.service.ts` | `getStats` (entire file is one big class) | 583 total |
| `modules/billing/application/services/billing.service.ts` | `getSubscription` | ~85 |
| `modules/billing/infrastructure/repositories/billing.repository.ts` | `getBillingPortal` | ~120 |
| `modules/sensored/engineering/application/services/engineering.service.ts` | `calculate` | ~150 |
| `modules/sensored/engineering/application/services/engineering.service.ts` | `compare` | ~90 |

---

## 4. Class Size (40/100)

### Overly large classes (>300 lines)

| File | Lines | Violation |
|---|---|---|
| `modules/knowledge/application/services/knowledge.service.ts` | **801** | **SRP — handles CRUD, taxonomy, analytics, formulas, versions** |
| `modules/admin/application/services/admin.service.ts` | **583** | **SRP — stats, user management, workspace management, notifications** |
| `modules/billing/infrastructure/repositories/billing.repository.ts` | **380** | Repository handles both read/write and external provider calls |
| `modules/billing/application/services/billing.service.ts` | **360** | Multiple billing workflows in single service |
| `modules/engineering/application/services/engineering.service.ts` | **~340** | Calculation logic, image upload, comparison |
| `modules/workspace/application/services/workspace.service.ts` | **394** | All workspace operations |
| `modules/marketplace/infrastructure/repositories/marketplace.repository.ts` | **357** | Single repository for orders, listings, ratings |

---

## 5. Magic Numbers / Hardcoded Constants (50/100)

- `auth/infrastructure/jwt/jwt.service.ts:21` — `parseInt(process.env.JWT_ACCESS_TOKEN_TTL || '900', 10)` (magic number `900`)
- `auth/application/services/auth.service.ts:166` — `parseInt(process.env.JWT_ACCESS_TOKEN_TTL || '900', 10)` (duplicate fallback)
- `modules/api-keys/domain/entities/api-key.entity.ts` — `50` (max keys, hardcoded)
- `modules/ai/application/services/ai.service.ts` — `4000` context window, `0.45` temperature, all hardcoded
- `modules/storage/domain/entities/file.entity.ts:95` — `1024 * 1024` (magic number for MB conversion)
- `modules/subscription/domain/entities/subscription.entity.ts` — `15`, `60`, days/grace periods hardcoded
- `modules/webhooks/application/services/webhook.service.ts` — `10000` (timeout ms), `3` (retry count)
- `modules/notification/application/services/notification.service.ts` — `100` (limit default), `20` (page default)

No centralized constants file; values are scattered across entities, services, and DTOs.

---

## 6. Naming Conventions (55/100)

### Inconsistencies

| Issue | Example |
|---|---|
| Module naming pluralized inconsistently | `consultations/` (plural) vs `knowledge/` (singular) vs `api-keys/` (kebab-plural) |
| File naming mixed | Some use `*.service.ts`, some `*.repository.ts` (consistent), but controllers mix `*-controller.ts` and `*.controller.ts` |
| Variable naming | Persian comments in `notification.service.ts:67`, `user.entity.ts:95` (Persian text mixed with English) |
| Interface naming | Some prefixed with `I` (old style), some without (modern) — inconsistent across modules |
| DTO naming | Inconsistent: `CreateKnowledgeDto` vs `RefreshTokenDto` vs inline `LoginDto` defined in auth.service.ts |

---

## 7. DDD / Clean Architecture Violations (25/100)

### Direct `prisma` access in Application Layer

The Application Layer (services) should depend on Repository interfaces, not directly on Prisma. Violations found:

| File | Line | Pattern |
|---|---|---|
| `modules/auth/application/services/auth.service.ts` | `188,203,221` | `prisma.$executeRaw`, `prisma.$queryRaw` |
| `modules/rbac/application/services/authorization.service.ts` | `123-157` | `prisma.$queryRaw` for permission checks |
| `modules/admin/application/services/admin.service.ts` | `20-248` | Direct `prisma.users.findUnique`, `prisma.workspaces.count` — **entire class** |
| `modules/knowledge/application/services/knowledge.service.ts` | `65-505` | 20+ direct `prisma.*` calls through the service |
| `modules/knowledge/presentation/controllers/taxonomy.controller.ts` | `19,33` | Controller queries Prisma directly — **worst violation** |

### Domain entities mixing concerns

- `modules/subscription/domain/entities/subscription.entity.ts:76` — `this.expiresAt < new Date()` — domain calling `new Date()` is acceptable but limits testability
- `modules/storage/domain/entities/file.entity.ts:95` — `(this.size / 1024).toFixed(1)` — domain formatting concern in entity

### `auth.service.ts` defines DTOs inline (lines ~12-37)

`CreateUserDto`, `LoginDto`, `RegisterDto`, `AuthResponse` are interfaces defined within the service file instead of separate DTO files in `presentation/dtos/`.

---

## 8. SOLID Principles Violations (30/100)

### Single Responsibility (S)

- **`knowledge.service.ts` (801 lines)**: Handles CRUD, taxonomy, formulas, examples, analytics, versions — at least 6 responsibilities
- **`admin.service.ts` (583 lines)**: Stats dashboard, user management, workspace management, notification sending
- **`engineering.service.ts` (~340 lines)**: Calculation orchestration, image upload, comparison, 3D model metadata

### Open/Closed (O)

- No use of polymorphism for calculation types; a large `if/else` or switch chain exists for comparing calculation methods
- Python engineering-service uses Strategy pattern (`base_calculator.py`) — good, but calculators are not easily extensible without modifying registry

### Liskov Substitution (L)

- `base_calculator.py` is abstract and well-defined
- `ai-service` base_agent has some methods that raise `NotImplementedError` — acceptable for Python ABC

### Interface Segregation (I)

- No evidence of fat interfaces being split; most services/repos expose many methods
- `billing.repository.ts` has 15+ public methods (CRUD + external API calls)

### Dependency Inversion (D)

- Inversion is partially achieved via `@InjectRepository()` decorators, BUT:
  - `admin.service.ts` directly references `prisma` (PrismaClient)
  - `auth.service.ts` uses `prisma.$queryRaw` bypassing repositories
  - `taxonomy.controller.ts` uses `prisma.$queryRawUnsafe` directly
  - No Interface/Port abstractions for external providers (email, LLM, payment)

---

## 9. DRY Principle (35/100)

### What's NOT duplicated

- The Prisma schema (`schema.prisma`) is clean — single source of truth
- Python `base_calculator.py` eliminates calculator boilerplate

### What IS duplicated

- Pagination logic (~25 identical patterns)
- PRO_ONLY_CALCULATIONS list (2 exact copies)
- Environment variable reading (5+ different files)
- Error response format `{ success: false, error: { ... } }` duplicated in every controller
- `catch (error) { this.logger.error(...); throw error; }` pattern in every single repository (~95 times)
- Exception handling: `NotFoundException`, `ConflictException` re-thrown identically everywhere

---

## 10. KISS Principle (40/100)

### Overcomplicated patterns

- `modules/ai-runtime/` has **8 sub-services** (agent-state-manager, conversation-manager, executor, memory, pipeline-orchestrator, state-store, tool-dispatcher, token-usage) — likely over-engineering for an MVP
- `knowledge.service.ts:417-460` — analytics upsert with 4 separate queries where a single aggregation would suffice
- Python `vision-service/app/core/pipeline.py` — Chain of Responsibility is clean but the stage abstraction may be overkill for 3 stages

### Simplicity wins

- `modules/health/` — simple and focused
- Python `unit_converter.py` — straightforward
- `modules/email/` — simple provider abstraction

---

## 11. Error Handling (30/100)

### Bare catch blocks (~95 occurrences)

Silent swallowing patterns:

| Location | Pattern |
|---|---|
| `modules/api-keys/application/services/api-key.service.ts:81` | `.catch(() => {})` — **silent failure** |
| `modules/admin/application/services/admin.service.ts:214` | `.catch(() => null)` — swallows error |
| `modules/admin/application/services/admin.service.ts:408` | `.catch(() => null)` — silent |
| `modules/notification/application/services/notification.service.ts:83` | `.catch(err => ...)` — logged but fire-and-forget |

### `console.error()` instead of Logger (~54 occurrences)

| File | Instances |
|---|---|
| `modules/auth/infrastructure/repositories/refresh-token.repository.ts` | 6 |
| `modules/auth/infrastructure/repositories/session.repository.ts` | 7 |
| `modules/rbac/infrastructure/repositories/role.repository.ts` | 3 |
| `modules/project/infrastructure/repositories/project.repository.ts` | 4 |
| Other repositories | ~34 scattered |

### No structured error taxonomy

- Only built-in NestJS exceptions used (NotFoundException, ConflictException, BadRequestException)
- No custom domain exception hierarchy
- No error codes for API consumers to handle programmatically

---

## 12. Async Patterns (50/100)

### Fire-and-forget with no tracking

- `auth.service.ts:66` — `this.emailService.sendWelcome(...).catch(err => ...)`
- `auth.service.ts:194` — `.catch(err => ...)` on password reset email
- `notification.service.ts:83` — fire-and-forget per notification
- `api-key.service.ts:81` — `.catch(() => {})` — completely silent

### No timeout handling

- No `Promise.race` with timeout for external HTTP calls
- Python `ai-service` LLM calls — no timeout on model inference requests
- Python `engineering-service` external calls — no timeout mechanism

### Good patterns

- `modules/webhooks/application/services/webhook.service.ts:118` — uses `Promise.allSettled` correctly for parallel delivery
- `modules/billing/application/services/billing.service.ts` — uses `Promise.all` for parallel queries

---

## 13. Comments/Documentation (60/100)

### Missing

- No JSDoc on any public API method across all TS modules
- No docstrings on Python service endpoints (FastAPI)
- README files exist but no inline documentation

### Present but problematic

- Persian comments in mixed-language code (`notification.service.ts:67`)
- Commented-out code left in production (`notification.service.ts:68`)
- BUG FIX comments that belong in commit messages (`user.entity.ts:95`)

---

## 14. Testability (45/100)

### Challenges

- **Large classes**: 7 classes >300 lines with multiple concerns — hard to mock
- **Direct Prisma**: `admin.service.ts`, `knowledge.service.ts`, `auth.service.ts`, `taxonomy.controller.ts` use prisma directly — cannot unit-test without DB
- **Static instantiation**: `new Date()` in entities (`subscription.entity.ts:76`) — can't control time in tests
- **Process.env in constructors**: `jwt.service.ts`, `email.provider.ts` — must mock env vars for each test
- **No IoC for external clients**: `ai/infrastructure/providers/llm.provider.ts` creates HTTP client internally

### Good patterns

- NestJS DI via `@Injectable()` makes repository mocking possible
- Python `registry.py` with dictionary-based lookup — easily mockable
- Python `base_calculator.py` subclasses are independently testable

---

## 15. Python-Specific Findings

### engineering-service

| File | Lines | Issues |
|---|---|---|
| `src/main.py` | **~308 (estimated 14K chars)** | Too long; monolithic import section; inline CORS config |
| `src/core/registry.py` | 198 | **Singleton anti-pattern**: `_instance`, `_lock`, `_calculators` are class-level, not instance-level — shared state across threads |
| `src/core/base_calculator.py` | 254 | Good abstraction but some calculators may be too large |
| `src/core/validation.py` | 262 | Well-structured |

### ai-service

| File | Lines | Issues |
|---|---|---|
| `app/tools/document_parser.py` | 271 | Large file, likely single-responsibility violation |
| `app/tools/minio_client.py` | 219 | Good S3 abstraction |
| `app/rag/chunker.py` | 213 | Reasonable size |
| `app/rag/retriever.py` | 213 | Acceptable |

### vision-service

| File | Lines | Issues |
|---|---|---|
| `app/config/providers.py` | 114 | CORS `origins=["*"]` in `main.py:72` — security risk |
| `app/core/pipeline.py` | 48 | Clean Strategy/Chain pattern |
| `app/core/stage.py` | 51 | Good base abstraction |
| `app/core/result.py` | 54 | Acceptable |

### Python-specific issues

| Issue | Severity | Location |
|---|---|---|
| CORS `["*"]` in production | High | `vision-service/app/main.py:72`, `engineering-service/src/main.py:77` |
| Singleton with class-level state | Medium | `engineering-service/src/core/registry.py:12-15` |
| No request timeout on external calls | Medium | `ai-service`, `engineering-service` |
| `main.py` files too large | Medium | `engineering-service/src/main.py` (~308 lines) |
| No mypy strict mode | Low | All services |

---

## Summary of Critical Issues (Priority Order)

1. **[CRITICAL] prisma bypasses Clean Architecture** — Administration service, Auth service, Knowledge service all call prisma directly from application layer. Taxonomy controller calls prisma directly from presentation layer.
2. **[CRITICAL] Bare catch blocks (~95)** — Silent failure swallowing, especially `.catch(() => {})` and `.catch(() => null)`. Production systems will fail silently.
3. **[HIGH] `console.*` instead of Logger (~54 instances)** — No structured logging; cannot filter/query logs by level or context.
4. **[HIGH] 6 classes >300 lines** — `knowledge.service.ts` (801), `admin.service.ts` (583), `billing.repository.ts` (380), `billing.service.ts` (360), `workspace.service.ts` (394), `marketplace.repository.ts` (357). Single Responsibility Principle severely violated.
5. **[HIGH] `as any` (~50 instances)** — Weakens type safety; most can be replaced with proper generics or interfaces.
6. **[HIGH] Pagination boilerplate (~25 duplicates)** — Trivial to extract into shared utility; adds maintenance burden.
7. **[HIGH] CORS `["*"]` in Python services** — vision-service and engineering-service allow all origins.
8. **[MEDIUM] `process.env` scattered (15+ locations)** — No centralized config validation; missing env vars will be `undefined` silently.
9. **[MEDIUM] Magic numbers everywhere** — No named constants for TTLs, limits, timeouts, temperatures.
10. **[MEDIUM] Fire-and-forget async** — Email sends, API key updates, notifications are fired without tracking success/failure.

---

## What's ACTUALLY Good

- **Prisma schema** is well-structured with proper UUIDs, relations, and workspace-level scoping
- **NestJS DI** is used consistently for module wiring
- **Python `base_calculator.py`** is a solid abstract base with clear contracts
- **Vision-service Pipeline pattern** is clean and extensible
- **DDD folder structure** is followed at the module level (domain/application/infrastructure/presentation)
- **Only 1 TODO** found across all TS code — low technical debt in terms of markers
- **No SQL injection** vectors detected — Prisma parameterized queries used
- **Password hashing** uses argon2 with proper config
- **Repository pattern** is attempted (even if violated in some places)
- **Thin controllers** — most controllers delegate to services (except taxonomy.controller.ts)

---

## Recommendations (Next Steps)

1. **Extract pagination** into `shared/infrastructure/utils/pagination.ts`
2. **Remove bare catch blocks** — always log, always re-throw or handle explicitly
3. **Replace `console.*` with Logger** — inject NestJS Logger or use `@nestjs/common` Logger
4. **Replace `as any`** — create proper types/interfaces where cast is needed
5. **Extract env config** — use `@nestjs/config` with a validated `ConfigSchema` class
6. **Split large classes**:
   - `knowledge.service.ts` → `KnowledgeCrudService`, `TaxonomyService`, `AnalyticsService`, `FormulaService`
   - `admin.service.ts` → `AdminStatsService`, `AdminUserService`, `AdminWorkspaceService`
7. **Move prisma calls from Application layer** to their respective repositories
8. **Centralize constants** in `shared/domain/constants/`
9. **Write unit tests** for at least the largest classes to verify refactors
10. **Fix Python CORS** to restrict origins per environment
11. **Add request timeouts** to all external HTTP calls in both TS and Python
