# Enterprise Architecture Audit — Xennic Platform

**Audit Date:** 1405/04/11
**Scope:** All 25 active NestJS modules, 3 Python microservices, shared packages

---

## 1. DDD Boundaries

### Assessment
- **21/25** modules follow Clean Architecture: `domain/`, `application/`, `infrastructure/`, `presentation/`
- **Health module** (`modules/health/`) — flat structure, no DDD layers
- **4 stub modules** (`enterprise-background/`, `enterprise-backup/`, `enterprise-config/`, `enterprise-performance/`, `knowledge-factory/`) — empty directories

### Violations
| Module | Issue | Severity |
|--------|-------|----------|
| `health/` | No domain/application/infrastructure — flat structure | Medium |
| `vision/` | Minimal DDD — missing domain layer | Medium |
| `consultations/` | Minimal DDD — missing domain layer | Medium |
| `ai-runtime/` | Imports infrastructure stores directly in services (`in-memory-session.store`) | Low |
| Several modules | `PrismaClient` imported in application layer services (infrastructure leak) | High |

### Score: 60/100

---

## 2. Dependency Direction

### Rules
- `domain/` → nothing (isolated)
- `application/` → `domain/`
- `infrastructure/` → `domain/` and `application/`
- `presentation/` → `application/`

### Findings
- ✅ Domain layer is pure — no external dependencies (types, interfaces, exceptions)
- ✅ Application services only depend on domain interfaces (not concrete implementations)
- ✅ Controllers depend on services, not repositories
- ⚠️ Some services import Prisma types directly (infrastructure leak)
- ⚠️ `ai-runtime/` controller imports `InMemorySessionStore` type for module registration

### Score: 70/100

---

## 3. Module Isolation

### Assessment
Modules are well-isolated with explicit imports in `@Module({ imports: [...] })`.

### Findings
- ✅ Each module is self-contained with its own DDD layers
- ✅ Modules only import what they need via NestJS DI
- ✅ `AiModule` only imports `WorkspaceModule`
- ✅ `AiRuntimeModule` only imports `WorkspaceModule`
- ⚠️ 4 stub modules add noise without value
- ⚠️ Cross-module type reuse could be improved via `@xennic/shared` or `@xennic/types`

### Score: 75/100

---

## 4. Circular Dependencies

### Assessment
No circular module imports detected in `api.module.ts`. Each module imports linearly.

### NestJS Circular DI Detection
- ✅ No `@Injectable()` circular references detected (all constructors have simple DI chains)
- ✅ Module graph is a DAG (directed acyclic graph)
- ✅ `forwardRef` not used anywhere — no circular module references

### Score: 95/100

---

## 5. Shared Kernel Usage

### Assessment
Shared packages at `packages/`:
- `@xennic/config` — shared config (prettier, tsconfig, eslint)
- `@xennic/database` — Prisma client wrapper
- `@xennic/shared` — common utilities
- `@xennic/types` — shared TypeScript types
- `packages/openapi/` — auto-generated OpenAPI spec

### Findings
- ✅ Shared kernel exists and is used across modules
- ⚠️ `@xennic/shared` and `@xennic/types` are underutilized — many types are duplicated across modules
- ⚠️ No shared AI types package — `ai-runtime/` types can't be reused by other modules easily
- ⚠️ OpenAPI spec is regenerated on every build (can be optimized)

### Score: 55/100

---

## 6. Infrastructure Leakage

### Assessment
The Clean Architecture principle requires that `application/` and `domain/` layers never import from `infrastructure/`.

### Findings
| File | Leak | Severity |
|------|------|----------|
| `ai.service.ts:7` | Imports `LlmProvider` from infrastructure | **High** — application knows about infrastructure |
| `modules/*/application/services/*` | 8 services import Prisma types | **High** — database types in application layer |
| `ai-runtime.module.ts` | Registers `InMemorySessionStore` directly | Low — acceptable in module composition |

### Score: 40/100

---

## 7. Application Service Purity

### Rules
Application services should:
- ✅ Only depend on domain interfaces
- ✅ Orchestrate business logic  
- ❌ NOT depend on infrastructure directly
- ❌ NOT contain HTTP/DB logic

### Findings
- ✅ Most services are pure — they orchestrate via injected interfaces
- ⚠️ `AiService` depends on `LlmProvider` directly (infrastructure leak)
- ✅ `AiRuntimeModule` services depend on interfaces (`ISessionStore`, `IMemoryStore`, etc.)
- ✅ Tests can easily mock dependencies via interface tokens

### Score: 55/100

---

## 8. Aggregate Boundaries

### Assessment
Aggregate boundaries are defined by Prisma models and NestJS modules.

### Findings
- ✅ Knowledge aggregate has clear boundaries (knowledge + 11 related models)
- ✅ Billing aggregate well-defined (invoices, payments, transactions)
- ✅ Multi-tenant boundary consistently applied via `workspace_id`
- ⚠️ `password_reset_tokens` has no relation to `users` aggregate — boundary violation
- ⚠️ `user_roles` has no relation to `workspace` — missing aggregate connection

### Score: 50/100

---

## 9. Repository Abstractions

### Assessment
Each module defines a repository interface in `domain/interfaces/` with implementation in `infrastructure/repositories/`.

### Findings
- ✅ All 21 DDD modules have interface-based repository abstractions
- ✅ Repositories are injected via `@Inject('IToken')` pattern
- ⚠️ `AiRepository` uses raw SQL strings — bypasses Prisma abstractions
- ⚠️ Some repositories use `SELECT *` patterns (30+ instances)
- ⚠️ Most repositories lack pagination abstractions (duplicated ~25 times)

### Score: 65/100

---

## 10. Hexagonal Architecture Compliance

### Assessment
Hexagonal (Ports & Adapters) compliance means:
- Domain is the innermost circle
- Application ports (interfaces) define boundaries
- Infrastructure adapters implement ports
- External concerns don't leak inward

### Findings
| Layer | Status | Notes |
|-------|--------|-------|
| Domain | ✅ Clean | Pure types, interfaces, exceptions |
| Application ports | ✅ Good | Interface tokens defined |
| Infrastructure adapters | ⚠️ Partial | Some services bypass ports |
| Adapters (external) | ⚠️ Partial | LlmProvider leaks into app |

### Key Violations
1. `AiService` depends on `LlmProvider` directly (not through an interface)
2. Prisma types used in application services
3. No `IAiRepository` interface for `AiRepository` — wait, there IS `IAiRepository` interface. But `AiService` accesses `llm` directly without an `ILlmProvider` interface.

### Score: 45/100

---

## Architecture Score Summary

| Dimension | Score | Weight |
|-----------|:-----:|:------:|
| DDD Boundaries | 60/100 | 15% |
| Dependency Direction | 70/100 | 15% |
| Module Isolation | 75/100 | 10% |
| Circular Dependencies | 95/100 | 10% |
| Shared Kernel | 55/100 | 10% |
| Infrastructure Leakage | 40/100 | 15% |
| Application Service Purity | 55/100 | 10% |
| Aggregate Boundaries | 50/100 | 5% |
| Repository Abstractions | 65/100 | 5% |
| Hexagonal Compliance | 45/100 | 5% |
| **Overall** | **55/100** | **100%** |

---

## Key Recommendations

1. **Extract `LlmProvider` behind an interface** (`ILlmProvider`) — eliminates infrastructure leak
2. **Create shared AI types package** — allow `ai-runtime` types to be reused
3. **Remove Prisma imports from application layer** — create domain-level interfaces
4. **Removed or implement stub modules** — no empty directories in production
5. **Add missing Prisma relations** — `password_reset_tokens` → `users`, `user_roles` → `workspaces`
6. **Standardize pagination** — extract into shared utility
7. **Add `@map`/`@@schema` annotations** for better schema organization
