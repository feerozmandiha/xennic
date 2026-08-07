# Storage Continue Verification — Order 018

## 1. Order Identity

| Field     | Value                                                |
| --------- | ---------------------------------------------------- |
| Order ID  | XENNIC-STORAGE-CONTINUE-VERIFY-018                   |
| Title     | راستی‌آزمایی نهایی Authorization و Knowledge Factory |
| Issued By | Chief Executive AI — Xennic Platform                 |
| Executor  | OpenCode                                             |
| Execution | LOCAL-FIRST                                          |
| Priority  | CRITICAL                                             |

## 2. Repository & Branch

| Field           | Value                                         |
| --------------- | --------------------------------------------- |
| Repository path | `/media/ahmad/home/ahmad/xennic`              |
| Current branch  | `main` (f9e944ef2)                            |
| Required branch | `arena/019f75f0-xennic` — NOT available       |
| Remote          | `origin/main` clean                           |
| Git operations  | ❌ All FORBIDDEN until correct arena checkout |

## 3. Project Authorization Facts

### Implementation

| #   | Question                              | Answer                                                                                          | Evidence                                                                                          |
| --- | ------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | Project membership guard exists?      | **YES — inline in service** (no dedicated guard class)                                          | `project-file.service.ts:42` — `isMember(projectId, addedBy)` check in `attachFile()`             |
| 2   | Guard registered in Controller?       | **NO** — no `@UseGuards(ProjectMemberGuard)` — membership enforced at service layer             | `project-file.controller.ts` — `@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)` only  |
| 3   | Guard applied in Service?             | **YES** — all 3 operations                                                                      | `attachFile:42`, `detachFile:81`, `listProjectFiles:113`                                          |
| 4   | Attach depends on project membership? | **YES** — inline check                                                                          | `attachFile:42-44`                                                                                |
| 5   | Detach depends on project membership? | **YES** — inline check                                                                          | `detachFile:81-83`                                                                                |
| 6   | List depends on project membership?   | **YES** — inline check with `userId` param                                                      | `listProjectFiles:113-115`                                                                        |
| 7   | Unit test for non-member?             | **YES** — all 3 operations                                                                      | `spec.ts:126, 186, 237`                                                                           |
| 8   | E2E test for non-member?              | **NO** — E2E mock always returns `true`                                                         | `e2e-spec.ts:72` — `isMember: jest.fn().mockResolvedValue(true)` — no rejection test              |
| 9   | Cross-workspace rejection?            | **YES** — unit + E2E                                                                            | Unit tests at `spec.ts:118-124, 144-151, 229-235`; E2E at `e2e-spec.ts:176-197, 266-275, 339-348` |
| 10  | `projects.update` access scope?       | **Workspace-scoped** — `PermissionsGuard` checks workspace-level permission, NOT project-scoped | `permissions.guard.ts:49-53` calls `authorizationService.hasPermissions()` workspace-scoped       |
| 11  | Deleted project rejection?            | **YES** — unit + E2E                                                                            | `service.ts:35` — `isDeleted()` check + `NotFoundException`; E2E at `e2e-spec.ts:212-224`         |
| 12  | Deleted file rejection?               | **YES** — unit + E2E                                                                            | `service.ts:47` — `file.isDeleted()` check                                                        |

### Authorization Chain (Controller → Service)

```
JwtAuthGuard (auth) → WorkspaceGuard (workspace membership) → PermissionsGuard (RBAC permission)
  → ProjectFileService (inline project membership via isMember())
```

### Key Gap

`projects.update` permission is **workspace-scoped** — any user with this permission can access ALL projects in the workspace at the RBAC layer. The only thing preventing unauthorized cross-project access is the inline `isMember()` call in the service. A dedicated `ProjectMemberGuard` would provide defense-in-depth at the controller/NestJS guard layer.

### Test Matrix

| Test                                        | Unit (spec.ts) | E2E (e2e-spec.ts) | Status                          |
| ------------------------------------------- | -------------- | ----------------- | ------------------------------- |
| attach — member accepted                    | line 94        | line 134          | ✅ PASS                         |
| attach — non-member rejected                | line 126       | —                 | ✅ PASS (unit) ❌ MISSING (E2E) |
| attach — another workspace project rejected | line 118       | line 176          | ✅ PASS                         |
| attach — another workspace file rejected    | line 144       | line 187          | ✅ PASS                         |
| attach — deleted project rejected           | —              | line 212          | ✅ PASS (E2E)                   |
| attach — duplicate rejected                 | line 153       | line 199          | ✅ PASS                         |
| detach — member accepted                    | line 167       | line 230          | ✅ PASS                         |
| detach — non-member rejected                | line 186       | —                 | ✅ PASS (unit) ❌ MISSING (E2E) |
| detach — workspace mismatch rejected        | —              | line 266          | ✅ PASS (E2E)                   |
| list — member accepted                      | line 208       | line 294          | ✅ PASS                         |
| list — non-member rejected                  | line 237       | —                 | ✅ PASS (unit) ❌ MISSING (E2E) |
| list — workspace mismatch rejected          | line 229       | line 339          | ✅ PASS                         |
| list — pagination                           | —              | line 350          | ✅ PASS                         |

## 4. Knowledge Factory Binding Facts

### Original Problem

`KnowledgeFactoryModule` had `{ provide: 'IStorageService', useExisting: StorageService }` which was a **type mismatch**:

- `IStorageService.upload(buffer, path, contentType)` — 3 positional params
- `StorageService.upload(data)` — single config object

### Current State

| #   | Question                                               | Answer                                                                          | Evidence                                                        |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | `useExisting: StorageService` present?                 | **NO** — removed                                                                | `knowledge-factory.module.ts:71` — `useClass: KfStorageAdapter` |
| 2   | Interface/Implementation compatible?                   | **YES** — `KfStorageAdapter` implements `IStorageService` exactly               | `minio-storage.service.ts:6` — `implements IStorageService`     |
| 3   | Adapter created?                                       | **YES** — `KfStorageAdapter`                                                    | `minio-storage.service.ts:6-31`                                 |
| 4   | Old `MinioStorageService` still a provider?            | **NO** — rewritten as `KfStorageAdapter`                                        | File was fully replaced                                         |
| 5   | `DocumentIntakeService` uses canonical StorageService? | **YES** — `@Inject('IStorageService')`                                          | `document-intake.service.ts:30-31`                              |
| 6   | Upload in KF works?                                    | **MECHANICALLY YES** — calls `storageService.upload(buffer, path, contentType)` | `document-intake.service.ts:54`                                 |
| 7   | Metadata in `files` table?                             | **NO** — KF does NOT register file metadata in StorageModule's `FileEntity`     | No `IStorageRepository` usage in KF flow                        |
| 8   | Knowledge document linked to FileEntity?               | **NO** — no cross-reference                                                     | Storage path stored only on `KnowledgeDocument.storagePath`     |
| 9   | Duplicate MinIO path?                                  | **NO** — single `MinioService` used via adapter                                 | `minio-storage.service.ts:9` delegates to `this.minioService`   |
| 10  | Regression test for KF upload?                         | **NO** — no `DocumentIntakeService` spec exists                                 | No `document-intake.service.spec.ts` in `application/services/` |

### KF Test Gap Detail

The KF module has 10 spec files but **none test `DocumentIntakeService.registerDocument()`** which is the only method that calls `IStorageService.upload()`. The existing KF tests cover:

- Domain entities (KnowledgeDocument, DocumentStatus)
- Classifiers, normalizers, providers
- Queue names, health, metrics, search

**Missing**: Upload integration test, adapter test, end-to-end document intake flow.

## 5. E2E Log Classification

All E2E errors observed in the output are **expected test-controlled errors**:

| Log Message                                          | Source File                  | Expected? | Type                                 |
| ---------------------------------------------------- | ---------------------------- | --------- | ------------------------------------ |
| `Message dlq-1 failed: always fails`                 | enterprise-platform.e2e      | ✅ Yes    | Intentional DLQ failure test         |
| `Step step2 failed for saga ...: step2 failed`       | enterprise-orchestration.e2e | ✅ Yes    | Intentional saga step failure test   |
| `Span error: failing-op`                             | enterprise-platform.e2e:570  | ✅ Yes    | Intentional observability error test |
| `Error: test error`                                  | enterprise-platform.e2e:570  | ✅ Yes    | Intentional error test               |
| `Error: test`                                        | enterprise-platform.e2e:594  | ✅ Yes    | Intentional error test               |
| `Step failing-step failed for saga ...: intentional` | enterprise-orchestration.e2e | ✅ Yes    | Intentional saga failure test        |

**Unexpected errors**: ❌ NONE — all errors are intentional resilience/error-handling test scenarios.

## 6. Test Evidence

### Unit Tests (project scope)

| Suite                             | Tests                             | Pass                                                                         |
| --------------------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `project-file.service.spec.ts`    | 3 membership tests + 8 other → 11 | ✅ 11/11                                                                     |
| `project-file.repository.spec.ts` | 25                                | ✅ 25/25 (timeout errors logged but tests pass — pre-existing raw SQL issue) |
| `project-file.entity.spec.ts`     | 22                                | ✅ 22/22                                                                     |
| `project-file.controller.spec.ts` | 3 decorator + 5 behavior → 8      | ✅ 8/8                                                                       |
| **Total project-file unit tests** | **61**                            | ✅ **61/61**                                                                 |

### Integration Tests (E2E)

| Suite                                     | Tests                       | Pass              |
| ----------------------------------------- | --------------------------- | ----------------- |
| `project-file.e2e-spec.ts`                | 19                          | ✅ 19/19          |
| `project-file.runtime-di.e2e-spec.ts`     | 8                           | ✅ 8/8            |
| `project-file.db-integration.e2e-spec.ts` | 8 (DB-dependent — all skip) | ✅ 0 run / 8 skip |
| All E2E suites                            | 189                         | ✅ 189/189        |

### Knowledge Factory Tests

| Suite                                   | Tests | Pass        | Covers Upload?           |
| --------------------------------------- | ----- | ----------- | ------------------------ |
| 10 spec files (no document-intake spec) | ~?    | ✅ All pass | ❌ No upload test exists |

## 7. Typecheck & Build

| Gate                  | Result                             |
| --------------------- | ---------------------------------- |
| `tsc --noEmit`        | ✅ PASS (zero errors)              |
| Prisma validate       | ✅ PASS (valid schema)             |
| Prisma migrate status | ✅ PASS (8 migrations, up to date) |

## 8. Quality Gate Status

| Gate                      | Status                     | Notes                                                                                                                  |
| ------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Project Authorization** | **PARTIAL**                | Implemented at service layer (inline `isMember` checks) but **no dedicated guard class**; E2E missing non-member tests |
| **Workspace Isolation**   | **PASS**                   | Cross-workspace rejection tested in unit + E2E                                                                         |
| **Knowledge Factory**     | **CONDITIONALLY COMPLETE** | Binding fixed (adapter pattern), but **no upload regression test** exists                                              |
| **Runtime DI**            | **PASS**                   | Verified via `runtime-di.e2e-spec.ts`                                                                                  |
| **E2E**                   | **PASS**                   | All errors classified as intentional; zero unexpected errors                                                           |
| **Security**              | **PARTIAL**                | Project-level authorization relies on service-layer check only — no guard-layer defense-in-depth                       |
| **Testing**               | **PARTIAL**                | 61 unit + 27 E2E for project-file; **zero tests for KF upload path**                                                   |
| **Documentation**         | **PASS**                   | This verification document complete                                                                                    |

## 9. Security Risks

| Risk                                  | Severity | Status                                                                                    |
| ------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| No dedicated `ProjectMemberGuard`     | MEDIUM   | Mitigated by service-layer `isMember` check but not defense-in-depth                      |
| `projects.update` is workspace-scoped | MEDIUM   | `PermissionsGuard` checks RBAC at workspace level — inline `isMember` is the only barrier |
| KF upload path untested               | LOW      | Binding is mechanically correct but no regression test exists                             |
| `file_versions` dead schema           | LOW      | Model exists in Prisma with zero code references                                          |
| Raw SQL in repositories               | MEDIUM   | Known pre-existing risk; `$executeRaw`/`$queryRaw` bypass Prisma type safety              |

## 10. Remaining Risks

1. **E2E non-member test gap**: No E2E test verifies a project non-member is rejected for attach/detach/list
2. **No ProjectMemberGuard**: Membership check lives in service layer — no guard-layer decorator approach
3. **KF upload untested**: `DocumentIntakeService.registerDocument()` has no spec file
4. **KF metadata gap**: Uploaded files via KF do not register in `FileEntity` table (no `IStorageRepository` call)
5. **Dead schema**: `file_versions` model (schema line 1176) is unused
6. **Raw SQL repos**: `ProjectFileRepository` uses `$executeRaw`/`$queryRaw` (pre-existing, Phase 1B decision)

## 11. Corrected Final Status

```text
Final status:
CONDITIONALLY COMPLETE

Authorization:
PARTIAL / MEDIUM RISK

Authorization detail:
- Workspace-level isolation: COMPLETE ✅
- Project-level membership: IMPLEMENTED (service layer, inline)
- Dedicated guard class: MISSING
- E2E non-member rejection tests: MISSING

Knowledge Factory:
CONDITIONALLY COMPLETE

KF detail:
- Binding mismatch: FIXED (useClass: KfStorageAdapter)
- Adapter pattern: IMPLEMENTED ✅
- Upload regression test: MISSING
- File metadata registration: NOT INTEGRATED

Security:
PARTIAL

Acceptance:
NOT VERIFIED — 2 gaps remain (E2E membership test + KF upload test)
```

## 12. Files Created / Modified

### Phase 1B (all new)

- `apps/api/src/modules/project/domain/entities/project-file.entity.ts`
- `apps/api/src/modules/project/domain/entities/project-file.entity.spec.ts`
- `apps/api/src/modules/project/domain/interfaces/project-file.repository.interface.ts`
- `apps/api/src/modules/project/application/services/project-file.service.ts`
- `apps/api/src/modules/project/application/services/project-file.service.spec.ts`
- `apps/api/src/modules/project/infrastructure/repositories/project-file.repository.ts`
- `apps/api/src/modules/project/infrastructure/repositories/project-file.repository.spec.ts`
- `apps/api/src/modules/project/presentation/controllers/project-file.controller.ts`
- `apps/api/src/modules/project/presentation/controllers/project-file.controller.spec.ts`
- `apps/api/src/modules/project/presentation/dtos/project-file.dto.ts`
- `apps/api/test/project-file.e2e-spec.ts`
- `apps/api/test/project-file.runtime-di.e2e-spec.ts`
- `apps/api/test/project-file.db-integration.e2e-spec.ts`
- `prisma/migrations/20260719141300_storage_phase1a_fk_foundation/`
- `prisma/migrations/20260719164100_storage_phase1b_project_files/`
- Multiple docs in `docs/implementation/`, `docs/generated/`, `docs/adr/`, `docs/audit/`, `docs/architecture/`

### Phase 1C (modified)

- `apps/api/src/modules/project/application/services/project-file.service.ts` — added `isMember` checks + `userId` param
- `apps/api/src/modules/project/presentation/controllers/project-file.controller.ts` — passes `req.user.userId` to `listProjectFiles`
- `apps/api/src/modules/project/application/services/project-file.service.spec.ts` — mock + 3 membership tests
- `apps/api/src/modules/project/presentation/controllers/project-file.controller.spec.ts` — updated call expectations

### KF Binding Fix (modified)

- `apps/api/src/modules/knowledge-factory/infrastructure/storage/minio-storage.service.ts` — REWRITTEN as `KfStorageAdapter`
- `apps/api/src/modules/knowledge-factory/knowledge-factory.module.ts` — Changed binding to `useClass: KfStorageAdapter`

### E2E Fix (modified in this verification)

- `apps/api/test/project-file.e2e-spec.ts` — added `isMember: jest.fn().mockResolvedValue(true)` to mock
- `apps/api/test/project-file.runtime-di.e2e-spec.ts` — added `isMember: jest.fn().mockResolvedValue(true)` to mock

## 13. Change Log

| Date       | Change                                                               | Author               |
| ---------- | -------------------------------------------------------------------- | -------------------- |
| 2026-07-20 | E2E mock fix — added `isMember` to mockProjectRepo in both E2E files | OpenCode (Order 018) |

## 14. Violation Check

| Restriction                          | Status                                                             |
| ------------------------------------ | ------------------------------------------------------------------ |
| No commit                            | ✅ CONFIRMED — no commits made                                     |
| No push                              | ✅ CONFIRMED — no pushes made                                      |
| No branch change                     | ✅ CONFIRMED — still on `main`                                     |
| No branch creation                   | ✅ CONFIRMED                                                       |
| No Prisma schema change              | ✅ CONFIRMED                                                       |
| No migration                         | ✅ CONFIRMED                                                       |
| No `db push` / `db reset`            | ✅ CONFIRMED                                                       |
| No frontend change                   | ✅ CONFIRMED                                                       |
| No file deletion                     | ✅ CONFIRMED                                                       |
| Production code change without order | ✅ NOT VIOLATED — E2E mock fixes only (test files, not production) |

## 15. Recommended Next Order

### Order Proposal: XENNIC-STORAGE-PROJECT-GUARD-019

**Rationale**: Close the 2 remaining gaps:

1. Create `ProjectMemberGuard` (dedicated NestJS guard) and register it in `ProjectFileController`
2. Add E2E tests for project non-member rejection (3 tests: attach/detach/list)
3. Optionally add `DocumentIntakeService` spec with upload test

**Scope**: `apps/api/src/modules/project/` + `apps/api/test/` (guard + controller + E2E tests)

**Risk**: LOW — no schema change, no migration, no architectural change
