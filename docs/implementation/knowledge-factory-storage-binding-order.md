# Knowledge Factory — IStorageService Binding Fix

**Engineering Order:** XENNIC-STORAGE-EO-KF-FIX (Separate Order)
**Date:** 2026-07-19
**Status:** DESIGN ONLY (not implemented)

---

## 1. Problem

**File:** `apps/api/src/modules/knowledge-factory/knowledge-factory.module.ts:70`

```ts
{
  provide: 'IStorageService',
  useExisting: StorageService,  // ← Type mismatch
},
```

The `useExisting` token is `StorageService` (class), but the `provide` token is `'IStorageService'` (string). This creates a DI binding where:

1. Any provider injecting `'IStorageService'` expects the `IStorageService` interface
2. `StorageService` implements more than `IStorageService` (has extra methods)
3. TypeScript structural typing allows this at compile time
4. But NestJS DI resolves the token `'IStorageService'` to the full `StorageService` class, which may expose methods not in the interface

### Root cause

The `StorageService` class was designed to implement `IStorageService`, but the `useExisting` binding doesn't enforce interface compliance — it's a token alias, not a type-safe binding.

---

## 2. Impact

| Component                                        | Status                                        |
| ------------------------------------------------ | --------------------------------------------- |
| `StorageModule` exports `StorageService`         | ✅ Works                                      |
| `KnowledgeFactoryModule` imports `StorageModule` | ✅ Works                                      |
| `'IStorageService'` binding in KnowledgeFactory  | ⚠️ Type mismatch (runtime works, type unsafe) |
| Any KF service injecting `'IStorageService'`     | ⚠️ Gets full `StorageService`, not interface  |
| Runtime behavior                                 | ✅ Works (no crash)                           |
| Type safety                                      | ❌ Compromised                                |

---

## 3. Options

### Option A: Change `useExisting` to `useClass` with `IStorageService` adapter

```ts
{
  provide: 'IStorageService',
  useClass: StorageService,  // ← Same as useExisting, same problem
},
```

**Result:** No change — `useClass` has the same type mismatch.

### Option B: Export `IStorageService` from `StorageModule`

```ts
// storage.module.ts
exports: [StorageService, MinioService, 'IStorageRepository', 'IStorageService'],
```

And in KnowledgeFactoryModule:

```ts
{
  provide: 'IStorageService',
  useExisting: 'IStorageService',  // ← Token-to-token alias
},
```

**Result:** Clean token alias, but still type-unsafe at the NestJS DI level.

### Option C: Create a typed wrapper class

```ts
// storage.service.ts
@Injectable()
export class StorageService implements IStorageService {
  // ... all IStorageService methods
}
```

And bind:

```ts
{
  provide: 'IStorageService',
  useClass: StorageService,
},
```

**Result:** `useClass` creates a NEW instance. If `StorageService` has other dependencies, they must be provided.

### Option D: Use `useFactory` for type-safe binding

```ts
{
  provide: 'IStorageService',
  useFactory: (storageService: StorageService) => storageService,
  inject: [StorageService],
},
```

**Result:** Runtime alias with correct injection. Type-safe if `StorageService` implements `IStorageService`.

---

## 4. Recommendation

**Option D** — Use `useFactory` for type-safe binding.

**Reasons:**

1. Explicit injection of `StorageService`
2. Returns the same instance (no duplication)
3. Type-safe if `StorageService` implements `IStorageService`
4. Compatible with NestJS DI patterns

**Implementation steps:**

1. Verify `StorageService` implements `IStorageService` (add `implements` clause if missing)
2. Update `knowledge-factory.module.ts:70` to use `useFactory`
3. Run typecheck
4. Run unit tests
5. Verify no regressions

---

## 5. Prerequisites

- [ ] `StorageService` must implement `IStorageService` interface
- [ ] `IStorageService` interface must be importable from `knowledge-factory.module.ts`
- [ ] No circular dependencies between `StorageModule` and `KnowledgeFactoryModule`

---

## 6. Risk Assessment

| Risk                               | Level | Mitigation                                  |
| ---------------------------------- | ----- | ------------------------------------------- |
| Breaking existing KF functionality | Low   | `useFactory` returns same instance          |
| Circular dependency                | Low   | KF already imports StorageModule            |
| Type regression                    | Low   | Add `implements` clause to `StorageService` |
| Performance impact                 | None  | No runtime overhead                         |

---

## 7. Testing Plan

1. **Typecheck:** `npx tsc --noEmit` — must pass
2. **Unit tests:** `npx jest --config jest.config.ts` — all existing tests pass
3. **E2E tests:** `npx jest --config test/jest-e2e.json` — all existing tests pass
4. **Integration test:** Verify KF service can resolve `'IStorageService'` at runtime
5. **Regression:** Full test suite pass

---

## 8. Scope

This is a **separate Engineering Order** from Phase 1B. It should be:

- Independent of Phase 1B completion
- Merged after Phase 1B is verified
- Documented in its own ADR if significant
