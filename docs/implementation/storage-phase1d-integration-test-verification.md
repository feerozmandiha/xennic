# Storage Phase 1D — Integration Test Verification

**Order**: 042  
**Date**: 2026-07-25  
**Status**: COMPLETE

## Test Files

| File                                                                                                   | Type                   | Tests  | Assertions |
| ------------------------------------------------------------------------------------------------------ | ---------------------- | ------ | ---------- |
| `apps/api/src/modules/storage/infrastructure/repositories/file-version.repository.integration.spec.ts` | Repository integration | 22     | 22+        |
| `apps/api/src/modules/storage/application/services/file-version.service.integration.spec.ts`           | Service integration    | 15     | 15+        |
| **Total**                                                                                              |                        | **37** | **37+**    |

## Test Results

```
PASS  file-version.repository.integration.spec.ts (22 passed)
PASS  file-version.service.integration.spec.ts (15 passed)

Test Suites: 2 passed, 2 total
Tests:       37 passed, 37 total
```

Existing unit test `file-version.service.spec.ts` (13 tests) continues to pass.

## Test Matrix — Repository Integration

| Test Group               | Tests                                           | Status |
| ------------------------ | ----------------------------------------------- | ------ |
| `save + findById`        | save and retrieve, null for non-existent        | PASS   |
| `findByFileId`           | ordered by version DESC, pagination, empty file | PASS   |
| `findByFileIdAndVersion` | specific version, null for non-existent         | PASS   |
| `getLatestVersion`       | highest version, null for empty                 | PASS   |
| `getNextVersionNumber`   | 1 for empty, max+1 for existing                 | PASS   |
| `countByFileId`          | count for file, 0 for empty                     | PASS   |
| `delete`                 | delete by id                                    | PASS   |
| `unique constraint`      | reject duplicate file_id + version              | PASS   |
| `FK enforcement`         | file_id FK, created_by FK                       | PASS   |
| `BigInt mapping`         | BigInt → number conversion                      | PASS   |
| `nullable fields`        | null checksum, change_reason, created_by        | PASS   |
| `ordering`               | version DESC ordering                           | PASS   |

## Test Matrix — Service Integration

| Test Group                | Tests                                          | Status |
| ------------------------- | ---------------------------------------------- | ------ |
| `createVersion`           | v1 for new file, v2 on second call             | PASS   |
| `workspace authorization` | cross-workspace rejection                      | PASS   |
| `missing file`            | NotFoundException for non-existent             | PASS   |
| `deleted file`            | NotFoundException for soft-deleted             | PASS   |
| `negative size`           | BadRequestException                            | PASS   |
| `listVersions`            | paginated results, unauthorized rejection      | PASS   |
| `getVersion`              | specific version, non-existent, invalid number | PASS   |
| `revertVersion`           | create new from existing                       | PASS   |
| `deleteVersion`           | delete non-initial, reject initial             | PASS   |
| `data persistence`        | persisted data correctness                     | PASS   |

## Infrastructure

- **Database**: PostgreSQL 17 via Docker (`xennic-postgres`)
- **Jest pattern**: `jest.mock('@xennic/database')` with real `PrismaClient` from `@prisma/client`
- **Test isolation**: Unique UUIDs per run, cleanup in `afterAll`
- **Workspace fixtures**: Include `code`, `name`, `created_by` (all required NOT NULL)
- **FK ordering**: file_versions → files → users → workspaces in cleanup

## Issues Resolved During Implementation

1. **Workspace NOT NULL columns**: `code`, `created_by` are required — initial fixtures only provided `id` and `name`
2. **Workspace UNIQUE `code`**: Test fixtures must use unique codes to avoid cross-test contamination
3. **Missing `version` in test data**: `FileVersionEntity.create()` requires `version` — base `versionData` was missing it
4. **Module path resolution**: Service test imported repository with wrong relative path (`../infrastructure/` → `../../infrastructure/`)
5. **Mock file registration**: Service tests use a mock `storageRepository`; dynamically created files must be registered in the mock
6. **FK ordering in cleanup**: Must delete `file_versions` before `files` before `users` before `workspaces`
7. **Delete initial version test**: Must use a dedicated file fixture with only 1 version, since prior tests add multiple versions

## Typecheck

```
@xennic/api:typecheck: tsc --noEmit
Tasks: 9 successful, 9 total
Cached: 2 cached, 9 total
```

Zero errors.
