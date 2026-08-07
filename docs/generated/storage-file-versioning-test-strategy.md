# Storage File Versioning — Test Strategy

- **Document ID:** XENNIC-STORAGE-VERSIONING-TEST-STRATEGY
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Status:** DESIGN REVIEW ONLY
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-REVIEW-034

---

## 1. Overview

Test strategy for Phase 1D File Versioning activation. Covers unit, integration, and E2E testing.

**Framework:** Jest (consistent with `apps/api`)
**Test runner:** `pnpm test` (unit), `pnpm test:e2e` (E2E)
**Coverage target:** 80%+ unit, 100% critical paths

---

## 2. Test Files

| Type        | Location                                                                                   | Pattern         |
| ----------- | ------------------------------------------------------------------------------------------ | --------------- |
| Unit        | `apps/api/src/modules/storage/application/services/__tests__/file-version.service.spec.ts` | `*.spec.ts`     |
| Integration | `apps/api/test/file-version.integration.e2e-spec.ts`                                       | `*.e2e-spec.ts` |
| E2E         | `apps/api/test/file-version.e2e-spec.ts`                                                   | `*.e2e-spec.ts` |

---

## 3. Unit Tests (10)

### T1: createVersion creates row in DB

```
Setup: Mock file exists, mock MinIO upload succeeds
Action: FileVersionService.createVersion(fileId, data)
Assert: prisma.$executeRaw called with INSERT INTO file_versions
```

### T2: createVersion uploads to MinIO

```
Setup: Mock file exists
Action: FileVersionService.createVersion(fileId, data)
Assert: MinioService.uploadBuffer called with correct bucket, path, buffer
```

### T3: createVersion returns FileVersionDto

```
Setup: Mock file exists, mock DB insert succeeds
Action: FileVersionService.createVersion(fileId, data)
Assert: Returned object has all FileVersionDto fields (id, fileId, version, path, size, mimeType, originalName, checksum, createdBy, createdAt)
```

### T4: createVersion throws NotFoundException if file not found

```
Setup: Mock file NOT found
Action: FileVersionService.createVersion('nonexistent', data)
Assert: Throws NotFoundException
```

### T5: listVersions returns paginated results sorted by version ASC

```
Setup: Mock 5 versions (v1, v2, v3, v4, v5)
Action: FileVersionService.listVersions(fileId, 1, 3)
Assert: Returns versions [v1, v2, v3] with meta { total: 5, page: 1, limit: 3, totalPages: 2 }
```

### T6: getVersion returns correct version

```
Setup: Mock version v2 exists
Action: FileVersionService.getVersion(fileId, versionId)
Assert: Returns version with version number 2
```

### T7: revertToVersion creates new version with MAX+1

```
Setup: Mock file exists, mock versions [v1, v2, v3], mock v2 content
Action: FileVersionService.revertToVersion(fileId, v2_id)
Assert: New version created with version=4
```

### T8: revertToVersion copies content and checksum from source

```
Setup: Mock version v1 has checksum X and size Y
Action: FileVersionService.revertToVersion(fileId, v1_id)
Assert: New version has same checksum X and size Y
```

### T9: deleteVersion removes from DB and MinIO

```
Setup: Mock superseded version exists (v2 when v3 is latest)
Action: FileVersionService.deleteVersion(fileId, v2_id)
Assert: DB row removed, MinioService.deleteObject called
```

### T10: deleteVersion throws 409 if deleting latest version

```
Setup: Mock version v3 is latest (MAX version)
Action: FileVersionService.deleteVersion(fileId, v3_id)
Assert: Throws ConflictException (409)
```

---

## 4. Integration Tests (5)

### I1: Full lifecycle

```
Setup: Create file via StorageService.upload
Steps:
  1. Create version 2 via FileVersionService.createVersion
  2. List versions → expect 2 versions
  3. Get version 1 → expect correct metadata
  4. Download version 1 → compare checksum with original
  5. Revert to version 1 → expect version 3 created
Assert: All operations succeed, version count = 3
```

### I2: Workspace isolation

```
Setup: Create file in workspace A, create version
Action: Access version from workspace B
Assert: 403 Forbidden
```

### I3: Cascade delete

```
Setup: Create file with 3 versions
Action: Delete file via StorageService.delete
Assert: All 3 version rows removed from file_versions
```

### I4: Concurrent version creation

```
Setup: Create file
Action: 5 parallel createVersion calls
Assert: Unique constraint enforced; all 5 succeed with different version numbers (1-5)
```

### I5: Large file versioning

```
Setup: Create 1MB buffer
Action: Create version with 1MB content
Assert: Upload succeeds within 5 seconds, checksum matches
```

---

## 5. E2E Tests (3)

### E1: Complete round-trip with HTTP

```
1. POST /storage/upload → create file
2. POST /files/:id/versions → create version 2
3. GET /files/:id/versions → list, expect 2 versions
4. GET /files/:id/versions/:vid → get version 1, expect downloadUrl
5. GET /files/:id/versions/:vid/download → download content
6. POST /files/:id/versions/:vid/revert → revert to v1, expect v3
Assert: All HTTP responses have success:true
```

### E2: Version ordering and pagination

```
1. Create file
2. Create 5 versions (v2-v6)
3. GET /files/:id/versions?page=1&limit=3 → expect [v1, v2, v3]
4. GET /files/:id/versions?page=2&limit=3 → expect [v4, v5, v6]
Assert: Pagination correct, ordering by version ASC
```

### E3: Revert creates without destroying

```
1. Create file (v1)
2. Create version (v2)
3. Revert to v1 → creates v3
4. List versions → expect [v1, v2, v3]
5. Verify v2 still exists and is accessible
Assert: Revert creates new version, old versions preserved
```

---

## 6. Mock Strategy

### 6.1 MinioService Mock

```typescript
const mockMinioService = {
  uploadBuffer: jest.fn().mockResolvedValue('object-key'),
  getObject: jest.fn().mockResolvedValue(Buffer.from('content')),
  deleteObject: jest.fn().mockResolvedValue(undefined),
  getPresignedUrl: jest.fn().mockResolvedValue('https://minio...'),
};
```

### 6.2 StorageRepository Mock

```typescript
const mockStorageRepository = {
  findById: jest.fn().mockResolvedValue(mockFileEntity),
  save: jest.fn().mockResolvedValue(undefined),
};
```

### 6.3 FileVersionRepository Mock

```typescript
const mockFileVersionRepository = {
  create: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'uuid', ...data })),
  findByFileId: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findLatestByFileId: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(undefined),
  getMaxVersion: jest.fn().mockResolvedValue(0),
  countByFileId: jest.fn().mockResolvedValue(0),
};
```

---

## 7. Test Data Setup

| Data          | Strategy                                        |
| ------------- | ----------------------------------------------- |
| File          | Create via `FileEntity.create()` with mock data |
| Version       | Create via mock repository                      |
| Workspace     | Use UUID from test environment                  |
| User          | Use UUID from test environment                  |
| MinIO content | Use `Buffer.from('test content')`               |

### Teardown

- Each test cleans up its own data
- `beforeEach` resets all mocks
- `afterEach` cleans DB if integration test

---

## 8. Coverage Targets

| Category           | Target | Notes                                |
| ------------------ | ------ | ------------------------------------ |
| Unit test coverage | 80%+   | FileVersionService methods           |
| Branch coverage    | 70%+   | Error paths included                 |
| Integration paths  | 100%   | All 5 integration scenarios          |
| E2E critical paths | 100%   | Upload → version → download → revert |

---

## 9. CI Integration

```bash
# Unit tests (runs with pnpm test)
pnpm test -- --testPathPattern "file-version"

# Integration tests (runs with pnpm test:e2e)
pnpm test:e2e -- --testPathPattern "file-version"

# Coverage
pnpm test:cov -- --testPathPattern "file-version"
```

---

## 10. Change Log

| Date       | Author             | Change                |
| ---------- | ------------------ | --------------------- |
| 2026-07-25 | Chief Executive AI | Initial test strategy |

---

_End of Test Strategy_
