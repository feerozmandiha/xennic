# Storage Phase 1D — API Inventory

- **Document ID:** XENNIC-STORAGE-PHASE1D-API-INVENTORY
- **Date:** 2026-07-31
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-API-REVIEW-046
- **Related:** ADR-022, ADR-024, XENNIC-STORAGE-EO-1D-REVIEW-034

---

## 1. Purpose

Single source of truth for the current Storage API surface relevant to File Versioning, and the
delta required to expose `file_versions` via HTTP.

---

## 2. Existing Storage API (live controller)

`apps/api/src/modules/storage/presentation/controllers/storage.controller.ts`
— `@Controller('storage')`, `@ApiTags('storage')`, `@ApiBearerAuth('JWT-auth')`,
`@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)`.

| Method | Path                          | Permission     | HTTP | Returns                                             |
| ------ | ----------------------------- | -------------- | ---- | --------------------------------------------------- |
| POST   | `/storage/upload`             | `files.upload` | 201  | `{ success, data: FileResponseDto }`                |
| GET    | `/storage/files`              | `files.read`   | 200  | `{ success, data: FileResponseDto[], meta }`        |
| GET    | `/storage/files/:id`          | `files.read`   | 200  | `{ success, data: FileResponseDto (+downloadUrl) }` |
| GET    | `/storage/files/:id/download` | `files.read`   | 200  | binary stream                                       |
| DELETE | `/storage/files/:id`          | `files.delete` | 204  | —                                                   |
| GET    | `/storage/stats`              | `files.read`   | 200  | `{ success, data: StorageStatsDto }`                |
| GET    | `/storage/health`             | —              | 200  | `{ success, data: { status, buckets } }`            |

Reference patterns to reuse for versioning:

- Multipart read: `req.isMultipart()`, `req.file({ limits: { fileSize: 100MB } })`, buffer concat,
  `truncated` check → `BadRequestException`.
- Presigned-URL fallback: try `getDownloadUrl` → on error return DTO without `downloadUrl`.
- Download: `@Res()` stream with `Content-Type` / `Content-Disposition` / `Content-Length`.

---

## 3. Missing Presentation Layer (File Versioning)

| Item                      | Status  | Target Location                                                                    |
| ------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `FileVersionController`   | MISSING | `apps/api/src/modules/storage/presentation/controllers/file-version.controller.ts` |
| `FileVersionDto`          | MISSING | `apps/api/src/modules/storage/presentation/dtos/file-version.dto.ts`               |
| `FileVersionListResponse` | MISSING | same DTO file                                                                      |
| `RevertVersionRequest`    | MISSING | same DTO file                                                                      |
| `CreateFileVersionDto`    | MISSING | same DTO file (changeReason; file via multipart)                                   |
| Pagination query DTO      | MISSING | same DTO file                                                                      |
| OpenAPI paths/schemas     | MISSING | `packages/openapi/v1/openapi.json` (regenerate + prettier)                         |

No schema, migration, service, repository, or guard changes required.

---

## 4. Implemented Layer (verified, no changes)

### 4.1 Schema — `file_versions` (`prisma/schema.prisma:1177-1196`)

| Column        | Type     | Nullable | Notes                                     |
| ------------- | -------- | -------- | ----------------------------------------- |
| id            | String   | —        | UUID PK                                   |
| file_id       | String   | —        | FK → files (ON DELETE CASCADE)            |
| version       | Int      | —        | default 1, `@@unique([file_id, version])` |
| path          | String   | —        | object key, no workspaceId prefix         |
| size          | BigInt   | —        | converted to Number in entity             |
| mime_type     | String   | —        |                                           |
| original_name | String   | —        |                                           |
| checksum      | String   | YES      |                                           |
| change_reason | String   | YES      |                                           |
| created_by    | String   | YES      | FK → users (ON DELETE SET NULL)           |
| created_at    | DateTime | —        | default now()                             |

Indexes: `@@unique([file_id, version])`, `@@index([file_id])`, `@@index([file_id, created_at])`.
**Dead schema today:** zero code references, zero rows (per Order 044 audit).

### 4.2 Domain — `FileVersionEntity`

Fields: `id, fileId, version, path, size (number), mimeType, originalName, checksum|null,
changeReason|null, createdBy|null, createdAt`. Getter `isInitialVersion` (`version === 1`),
`sizeHuman` (B/KB/MB/GB).

### 4.3 App — `FileVersionService`

| Method        | Signature                                                                                             | Throws                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| createVersion | `({ fileId, workspaceId, path, size, mimeType, originalName, checksum?, changeReason?, createdBy? })` | 404 file missing/deleted; 403 foreign ws; 400 size<0; 409 unique race |
| listVersions  | `(fileId, workspaceId, page=1, limit=20)` → `{ data, meta }`                                          | 404; 403                                                              |
| getVersion    | `(fileId, version, workspaceId)`                                                                      | 404; 403; 400 non-integer/<1                                          |
| revertVersion | `(fileId, version, workspaceId, createdBy?, changeReason?)`                                           | 404; 403; 400                                                         |
| deleteVersion | `(fileId, version, workspaceId)`                                                                      | 404; 403; 400 when `total <= 1`                                       |

Internal guard: `file.workspaceId !== workspaceId → ForbiddenException`. Pagination clamps:
`page ≥ 1`, `1 ≤ limit ≤ 100`. **No MinIO dependency injected** (create/revert accept `path`
pre-uploaded by caller).

### 4.4 Infra — `IFileVersionRepository` / `FileVersionRepository`

- `save`, `findById`, `findByFileId(fileId, {offset, limit})` → **`ORDER BY version DESC`**,
- `findByFileIdAndVersion`, `getLatestVersion`, `getNextVersionNumber` (MAX+1),
- `countByFileId`, `delete`.
- Raw SQL via `prisma.$queryRaw`.

### 4.5 Infra — `MinioService`

`ensureBucket(s)`, `uploadBuffer(bucket, key, buffer)`, `getObject(bucket, key): Buffer`,
`getPresignedUrl(bucket, key, expirySeconds=3600)`, `deleteObject(bucket, key)`, `health()`.
Buckets: `public, private, reports, documents, engineering, ai`.

### 4.6 Module — `StorageModule`

Providers: `StorageService, MinioService, FileVersionService, IFileVersionRepository,
IStorageRepository`. Exports include `MinioService`, `FileVersionService`, both repository tokens
— so a new controller can inject `FileVersionService` + `MinioService` directly. `WorkspaceModule`
and `RbacModule` imported (guards available).

---

## 5. DTO Inventory (presentation)

| DTO               | File                         | Fields                                                                                                                               |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `FileResponseDto` | `storage.dto.ts`             | id, workspaceId, bucket, filename, originalName, extension, mimeType, size, sizeHuman, checksum, uploadedBy, createdAt, downloadUrl? |
| `StorageStatsDto` | `storage.dto.ts`             | totalFiles, totalSizeBytes, totalSizeHuman                                                                                           |
| FileVersion DTOs  | — (MISSING, must be created) | see `storage-phase1d-api-review.md` §8                                                                                               |

---

## 6. Test Inventory (File Versioning — all PASS, Order 044 verified)

| Suite       | File                                                                                                             | Count  |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| Unit        | `apps/api/src/modules/storage/application/services/file-version.service.spec.ts`                                 | 13     |
| Integration | `apps/api/src/modules/storage/application/services/file-version.service.integration.spec.ts`                     | 15     |
| Repository  | `apps/api/src/modules/storage/infrastructure/repositories/__tests__/file-version.repository.integration.spec.ts` | 22     |
| **Total**   | —                                                                                                                | **50** |

Missing (controller/E2E): see `storage-phase1d-api-test-gap.md`.

---

## 7. OpenAPI Inventory

- `packages/openapi/v1/openapi.json`: 233 paths, **zero** storage file-version endpoints.
- Only version-like endpoints elsewhere: `knowledge/{id}/versions*` and
  `admin/calculations/definitions/{id}/versions*` (different domains — do not reuse).
- Generation: OpenAPI spec is generated output; regenerate + `prettier` per Order 045 findings.

---

## 8. Change Log

| Date       | Author             | Change                |
| ---------- | ------------------ | --------------------- |
| 2026-07-31 | Chief Executive AI | Initial API inventory |

---

_End of Storage Phase 1D API Inventory_
