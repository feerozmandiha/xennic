# Storage Phase 1D — File Version API Implementation

- **Document ID:** XENNIC-STORAGE-PHASE1D-API-IMPLEMENTATION
- **Date:** 2026-08-02
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-API-IMPLEMENT-048
- **Related:** ADR-026, storage-phase1d-api-review.md, test-environment-configuration.md, ADR-022, ADR-024

---

## 1. Scope

Implementation of the File Version API on top of the already-implemented
`FileVersionService` / `FileVersionRepository` / `FileVersionEntity` / `file_versions`
schema. Adds the missing presentation layer (controller + DTOs + OpenAPI paths) and
comprehensive controller + e2e test coverage, plus the Order 047 env-loading fix
(`apps/api/test/setup-env.ts`).

Out of scope: no schema changes, no migration, no new permission slugs, no commit/push.

---

## 2. Executive Summary

The 6-endpoint File Version API is complete, registered, and fully tested.

| Metric                 | Result                             |
| ---------------------- | ---------------------------------- |
| Endpoints              | 6 (3 POST, 2 GET, 1 DELETE)        |
| Controller unit tests  | 20/20 PASS                         |
| Service unit           | PASS (incl. rollback, revert copy) |
| Service integration    | PASS                               |
| Repository integration | PASS                               |
| FileVersion test total | 86/86 PASS                         |
| FileVersion e2e        | 18/18 PASS                         |
| Full unit suite        | 93 suites / 1576 tests PASS        |
| Full e2e suite         | 12 suites / 225 tests PASS         |
| Typecheck              | Clean (`tsc --noEmit`)             |
| Build + OpenAPI        | PASS — 237 endpoints               |
| Prisma validate        | Valid 🚀                           |
| Prisma migrate status  | Up to date                         |
| `git diff --check`     | Clean (own files)                  |

Design contract: ADR-026 and `storage-phase1d-api-review.md` (Option A — nested under
`/storage/files/:fileId/versions`).

---

## 3. API Identity

Base path `/api/v1/storage`. All endpoints protected by
`@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)` + `@ApiBearerAuth('JWT-auth')`.

| #   | Method | Path                                                | Permission     | HTTP         |
| --- | ------ | --------------------------------------------------- | -------------- | ------------ |
| 1   | POST   | `/storage/files/:fileId/versions`                   | `files.upload` | 201          |
| 2   | GET    | `/storage/files/:fileId/versions`                   | `files.read`   | 200          |
| 3   | GET    | `/storage/files/:fileId/versions/:version`          | `files.read`   | 200          |
| 4   | GET    | `/storage/files/:fileId/versions/:version/download` | `files.read`   | 200 (binary) |
| 5   | POST   | `/storage/files/:fileId/versions/:version/revert`   | `files.upload` | 201          |
| 6   | DELETE | `/storage/files/:fileId/versions/:version`          | `files.delete` | 204          |

- `:version` is the **integer** version number (1, 2, 3…), not the row UUID.
- All six routes reuse the 4 existing `files.*` slugs — **no new permissions added**.
- `ProjectMemberGuard` is **not** required: this API is storage-scoped (matches the existing
  `StorageController`), not project-nested. The `ProjectMemberGuard` pattern remains available
  if project-scoped access is later layered on `projects/:projectId/files/*`.

Route matrix (authoritative, from generated OpenAPI):

| Path                                                  | Operations  |
| ----------------------------------------------------- | ----------- |
| `/storage/files/{fileId}/versions`                    | POST, GET   |
| `/storage/files/{fileId}/versions/{version}`          | GET, DELETE |
| `/storage/files/{fileId}/versions/{version}/download` | GET         |
| `/storage/files/{fileId}/versions/{version}/revert`   | POST        |

---

## 4. DTO Inventory

| DTO                      | Location                                                                    | Notes                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `CreateFileVersionDto`   | `apps/api/src/modules/storage/presentation/dtos/create-file-version.dto.ts` | `changeReason` optional, `@IsString` `@MaxLength(500)`. `file` is multipart, validated at service layer (MIME + size) |
| `RevertFileVersionDto`   | `.../revert-file-version.dto.ts`                                            | `changeReason` optional, `@MaxLength(500)`                                                                            |
| `FileVersionResponseDto` | `.../file-version-response.dto.ts`                                          | 15 fields + `downloadUrl`; `fromEntity` mapper                                                                        |

`FileVersionResponseDto` fields: `id`, `fileId`, `version`, `path`, `size` (number),
`sizeHuman`, `mimeType`, `originalName`, `checksum` (null), `changeReason` (null),
`createdBy` (null), `createdAt`, `isInitialVersion`, `isLatest`, `downloadUrl` (optional).

---

## 5. Guard Chain & Authorization

- `JwtAuthGuard` → authentication.
- `WorkspaceGuard` → extracts/auto-detects `workspaceId` from `x-workspace-id` header.
- `PermissionsGuard` → enforces `@RequirePermissions` metadata (`files.upload/read/delete`).

Defense-in-depth workspace isolation: service re-checks `file.workspaceId !== workspaceId`
→ `ForbiddenException` (403), so even a forged header cannot read/write a foreign file.
Soft-deleted files are treated as `NotFound` (404).

Role mapping (from `prisma/seed.ts`, unchanged): SUPER_ADMIN → all `files.*`; OWNER → all;
ADMIN → all; ENGINEER/EDITOR/KNOWLEDGE_WRITER/REVIEWER/CONSULTANT/MEMBER → read/upload;
VIEWER → read; PLATFORM_ADMIN/SUPPORT_ADMIN → none.

---

## 6. Implementation Details

### 6.1 POST create (multipart upload)

1. Fastify multipart parse with `limits: { fileSize: 100MB, files: 1 }`; truncated file →
   400 (`File too large`); non-multipart request → 400; no `file` field → 400.
2. `FileVersionService.createVersion`:
   - `getAuthorizedFile` (404 deleted/missing, 403 foreign workspace).
   - Validate `changeReason` (≤ 500).
   - Validate size ≤ 100MB (400) and MIME ∈ 17-type allowlist (400).
   - Sanitize original name (path-traversal guard), build `YYYY/MM/<uuid>.<ext>` object path.
   - SHA-256 checksum.
   - `getNextVersionNumber` → integer version.
   - **Upload to MinIO** → on failure, no DB record is written.
   - **Save metadata** → on failure, uploaded object is rolled back (`deleteObject`).
   - Unique-constraint race → `ConflictException` (409 `File version already exists`).
   - Audit log entry `file_version_created`.

### 6.2 GET list

`listVersions(fileId, workspaceId, page=1, limit=20)`; clamps `page ≥ 1`, `1 ≤ limit ≤ 100`.
Repository orders `ORDER BY version DESC` (newest first). Response `{success, data, meta}`,
`meta = {page, limit, total, totalPages}`. Each item carries `isLatest` computed against the
newest version in the page.

### 6.3 GET detail

`getVersion` (validates positive integer, 404 if missing) + `getLatestVersion` (for
`isLatest`) + `getVersionDownloadUrl` (presigned, 1h). Download URL failure → `undefined`,
detail still returned.

### 6.4 GET download

`getVersionContent` → streams binary from MinIO with `Content-Type`,
`Content-Disposition: attachment; filename="<encoded>"`, `Content-Length`.

### 6.5 POST revert

1. `getVersionWithFile` — source version must exist (404) and be in the caller's workspace.
2. Validate `changeReason`.
3. `getNextVersionNumber`; builds a **new independent object path**.
4. **Server-side copy** (`MinioService.copyObject`) source → new object. Source path is never
   reused; the source version is left untouched.
5. Save metadata; on failure roll back the copied object; unique race → 409.
6. Audit `file_version_reverted` (old: source version/path; new: reverted metadata).

### 6.6 DELETE

Policy (per ADR-026 / G3/G5):

- Initial version (v1) → **400** `BadRequestException` (immutable).
- Latest active version → **409** `ConflictException` (never leave the file headless).
- Intermediate version → deletes the MinIO object **and** the DB row (orphan-free), then
  audit `file_version_deleted`. 204 No Content.

---

## 7. Error Mapping

| Condition                              | HTTP      | Exception                     |
| -------------------------------------- | --------- | ----------------------------- |
| Non-multipart request / no file field  | 400       | `BadRequestException`         |
| File too large (> 100MB)               | 400       | `BadRequestException`         |
| Disallowed MIME type                   | 400       | `BadRequestException`         |
| Invalid changeReason (> 500 chars)     | 400       | `BadRequestException`         |
| Version not a positive integer         | 400       | `BadRequestException`         |
| Delete initial version (v1)            | 400       | `BadRequestException`         |
| File missing or soft-deleted           | 404       | `NotFoundException`           |
| Version not found                      | 404       | `NotFoundException`           |
| Foreign workspace                      | 403       | `ForbiddenException`          |
| Unique-constraint race / delete latest | 409       | `ConflictException`           |
| Missing JWT / permission               | 401 / 403 | Guards                        |
| MinIO unavailable                      | 503       | `ServiceUnavailableException` |

All errors go through the global `AllExceptionsFilter` → unified `{success, error}` envelope
with generic codes.

---

## 8. Test Matrix

### 8.1 Controller unit — `file-version.controller.spec.ts` (20)

Permission mapping (create→`files.upload`, list/detail/download→`files.read`,
revert→`files.upload`, remove→`files.delete`), route metadata, multipart parsing, DTO
validation, service error propagation, workspace passthrough.

### 8.2 Service unit — `file-version.service.spec.ts`

Create (MinIO→DB order, missing file, foreign workspace, oversized, disallowed MIME, long
changeReason, **rollback on persistence failure**, **no DB write on MinIO failure**, audit),
list (pagination, clamps, deleted file), get/getLatest/getContent/getDownloadUrl,
revert (**new object via copy**, missing source, **rollback of copied object on save
failure**), delete (intermediate OK, **initial version 400**, **latest 409**).

### 8.3 Service + repository integration

Real Postgres + MinIO round-trips: upload → persist → list → download → revert (new object)
→ delete; unique-conflict → `ConflictException`; `path` stored without workspaceId prefix.

### 8.4 E2E — `test/file-version.e2e-spec.ts` (18)

1. creates version 1 via multipart upload
2. creates version 2
3. lists versions newest first
4. gets version detail with presigned download URL
5. downloads a version as binary
6. reverts to version 1 — creates a NEW version with same content
7. rejects deleting the initial version
8. rejects deleting the latest active version
9. deletes an intermediate version
10. returns 404 for a non-existent version
11. returns 404 for a non-existent file
12. returns 400 for an invalid version number
13. returns 400 for a multipart upload without a file part
14. returns 401 when authentication fails
15. returns 403 when permission is missing
16. rejects cross-workspace access to another workspace file
17. rejects operations on a soft-deleted file
18. rejects invalid MIME type on create

All order test requirements covered: create/list/get/download/revert/delete + authn/authz +
cross-workspace + deleted-file + invalid MIME + oversized + duplicate-version (unique → 409)

- initial-version-deletion rejection.

---

## 9. Quality Gates (Order 047 follow-up evidence)

```bash
pnpm --filter @xennic/api test --runInBand        # 93 suites / 1576 tests PASS
pnpm --filter @xennic/api test:e2e                # 12 suites / 225 tests PASS
pnpm --filter @xennic/api typecheck               # tsc --noEmit clean
pnpm --filter @xennic/api build                   # PASS — 237 endpoints
pnpm prisma validate                              # schema valid
pnpm prisma migrate status                        # up to date (10 migrations)
git diff --check -- apps/api/src/modules/storage/  # clean
```

---

## 10. Files Changed

### New

- `apps/api/src/modules/storage/presentation/controllers/file-version.controller.ts`
- `apps/api/src/modules/storage/presentation/controllers/file-version.controller.spec.ts`
- `apps/api/src/modules/storage/presentation/dtos/create-file-version.dto.ts`
- `apps/api/src/modules/storage/presentation/dtos/revert-file-version.dto.ts`
- `apps/api/src/modules/storage/presentation/dtos/file-version-response.dto.ts`
- `apps/api/test/file-version.e2e-spec.ts`
- `apps/api/test/setup-env.ts` (Order 047)
- `docs/adr/ADR-026-storage-file-version-api.md`
- `docs/generated/storage-phase1d-api-inventory.md`
- `docs/generated/storage-phase1d-api-permission-matrix.md`
- `docs/generated/storage-phase1d-api-test-gap.md`
- `docs/implementation/storage-phase1d-api-review.md`
- `docs/implementation/test-environment-configuration.md`
- `docs/implementation/storage-phase1d-api-implementation.md` (this doc)

### Modified

- `apps/api/jest.config.ts`, `apps/api/test/jest-e2e.json` (setupFiles env loader)
- `apps/api/src/modules/storage/application/services/file-version.service.ts` (+ `.spec.ts`,
  `.integration.spec.ts`) — MinIO orchestration, revert server-side copy, delete object+row
- `apps/api/src/modules/storage/infrastructure/minio/minio.service.ts` — `copyObject`,
  `deleteObject`, `uploadBuffer` support
- `apps/api/src/modules/storage/storage.module.ts` — registers `FileVersionController`
- `apps/api/test/kf-storage-integration.e2e-spec.ts` — env-loader adaptation
- `packages/openapi/v1/openapi.json` — regenerated (237 endpoints)

Unchanged: `prisma/schema.prisma`, migrations, seed (permissions/roles), RBAC module.

---

## 11. Change Log

| Date       | Author             | Change                                  |
| ---------- | ------------------ | --------------------------------------- |
| 2026-08-02 | Chief Executive AI | Implementation + tests + OpenAPI + docs |

---

_End of Storage Phase 1D API Implementation_
