# Storage Phase 1D — File Version API Review

- **Document ID:** XENNIC-STORAGE-PHASE1D-API-REVIEW
- **Date:** 2026-07-31
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-API-REVIEW-046
- **Related:** ADR-022, ADR-024, XENNIC-STORAGE-EO-1D-REVIEW-034, storage-phase1d-versioning-review.md

---

## 1. Scope

Read-only audit and API design for activating the `file_versions` dead schema as a live
File Version API on top of the already-implemented `FileVersionService` / `FileVersionRepository`.

No source code, schema, migration, OpenAPI, or test files were modified. Deliverables are
documentation only.

---

## 2. Executive Summary

The FileVersion domain/app/infrastructure layer is complete, tested (50/50 tests pass), and
workspace-isolated. **The only missing piece is the presentation layer**: there is no
`FileVersionController`, no FileVersion DTOs, and no OpenAPI paths.

This review recommends **Option A (nested paths under `/files/:fileId/versions`)** — the same
shape proposed by Order 034's API design — because the service and repository are already built
around `fileId` + integer `version` and the existing `StorageController` already exposes
`files/:id` sub-resources.

The review also documents **5 gaps between the 034 design spec and the actual implementation**
(see Section 6) that must be reconciled during implementation.

---

## 3. Inventory Summary

| Layer        | Artifact                                     | Status         | Location                                                                              |
| ------------ | -------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| Schema       | `file_versions` model                        | DONE           | `prisma/schema.prisma:1177-1196`                                                      |
| Domain       | `FileVersionEntity`                          | DONE           | `apps/api/src/modules/storage/domain/entities/file-version.entity.ts`                 |
| Domain       | `IFileVersionRepository`                     | DONE           | `apps/api/src/modules/storage/domain/interfaces/...repository.interface.ts`           |
| App          | `FileVersionService`                         | DONE           | `apps/api/src/modules/storage/application/services/file-version.service.ts`           |
| Infra        | `FileVersionRepository`                      | DONE           | `apps/api/src/modules/storage/infrastructure/repositories/file-version.repository.ts` |
| Infra        | `MinioService` (presigned/upload/get/delete) | DONE           | `apps/api/src/modules/storage/infrastructure/minio/minio.service.ts`                  |
| Module       | `StorageModule` wiring                       | DONE           | `apps/api/src/modules/storage/storage.module.ts`                                      |
| Tests        | Unit + integration + repository (50 total)   | DONE, PASS     | `file-version.service.spec.ts`, `.integration.spec.ts`, `file-version.repository.ts`  |
| Presentation | `FileVersionController`                      | **MISSING**    | —                                                                                     |
| DTOs         | `FileVersionDto` + request/query DTOs        | **MISSING**    | —                                                                                     |
| OpenAPI      | 6 new paths + schemas                        | **MISSING**    | `packages/openapi/v1/openapi.json`                                                    |
| Docs         | Endpoint/inventory/matrix/gap/ADR            | **THIS ORDER** | `docs/implementation`, `docs/generated`, `docs/adr`                                   |

Full inventory: `docs/generated/storage-phase1d-api-inventory.md`.

---

## 4. Option Analysis (API Shape)

### Option A — Nested under file (RECOMMENDED)

`/api/v1/storage/files/:fileId/versions[/:version[/download|revert]]`

- Matches Order 034 design (`storage-file-versioning-api-design.md`) and the existing
  `files/:id/...` controller style.
- Service already keyed on `fileId` + integer `version`.
- Natural REST sub-resource hierarchy.

### Option B — Flat `/api/v1/storage/versions`

- No nesting; flatter URLs, but loses the "version belongs to a file" relationship in the URL
  and duplicates the `fileId` semantics already in the service.

### Option C — Separate `FileVersionController` mounted at `/storage/file-versions`

- Naming drift vs the `files` resource; inconsistent with Order 034.

**Decision: Option A.** Reuses the existing 034 endpoint layout, needs no schema/permission
changes, and fits `WorkspaceGuard` (header `x-workspace-id`) + `PermissionsGuard` (`files.*`).

---

## 5. Endpoint Design (Target Contract)

Base path `/api/v1/storage`, all endpoints protected by
`@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)` and `@ApiBearerAuth('JWT-auth')`.

| #   | Method | Path                                                | Permission     | Response     |
| --- | ------ | --------------------------------------------------- | -------------- | ------------ |
| 1   | POST   | `/storage/files/:fileId/versions`                   | `files.upload` | 201          |
| 2   | GET    | `/storage/files/:fileId/versions`                   | `files.read`   | 200          |
| 3   | GET    | `/storage/files/:fileId/versions/:version`          | `files.read`   | 200          |
| 4   | GET    | `/storage/files/:fileId/versions/:version/download` | `files.read`   | 200 (binary) |
| 5   | POST   | `/storage/files/:fileId/versions/:version/revert`   | `files.upload` | 201          |
| 6   | DELETE | `/storage/files/:fileId/versions/:version`          | `files.delete` | 204          |

Route note: `:version` is the **integer** version number (1, 2, 3…), not the row UUID.
`FileVersionService.getVersion/deleteVersion/revertVersion` and
`FileVersionRepository.findByFileIdAndVersion` all resolve by integer version. Using the integer
keeps URLs stable, deterministic, and matches the `@@unique([file_id, version])` constraint.

### 5.1 Detailed contracts

#### 5.1.1 POST `/storage/files/:fileId/versions`

Multipart upload (`field name = file`, plus optional `changeReason` field). The controller:

1. Reads multipart via Fastify (`req.file({ limits: { fileSize: 100MB } })`) — same as
   `StorageController.upload`.
2. Validates against `ALLOWED_MIME_TYPES` (415) and `MAX_FILE_SIZE` (413).
3. Computes SHA-256 checksum.
4. Uploads buffer to MinIO → object key = `${workspaceId}/${YYYY/MM/uuid.ext}`.
5. Calls `fileVersionService.createVersion({ fileId, workspaceId, path: objectKey, size, mimeType, originalName, checksum, changeReason, createdBy })`.

Errors: 400 (invalid/negative size, no file), 403 (foreign workspace), 404 (file missing or deleted),
409 (unique violation race), 413 (too large), 415 (MIME).

#### 5.1.2 GET `/storage/files/:fileId/versions?page=1&limit=20`

`fileVersionService.listVersions(fileId, workspaceId, page, limit)`.
Returns `{ success, data: FileVersionDto[], meta: { page, limit, total, totalPages } }`.
Pagination clamps in service: `page ≥ 1`, `1 ≤ limit ≤ 100`.

> **Ordering note:** the repository orders `ORDER BY version DESC` (newest first). This differs
> from the 034 test-strategy prose ("sorted ASC") — see Gap G4.

#### 5.1.3 GET `/storage/files/:fileId/versions/:version`

`fileVersionService.getVersion(fileId, Number(version), workspaceId)`. Validates positive integer.
Returns single `FileVersionDto` with `downloadUrl` (presigned) and `isLatest`.

#### 5.1.4 GET `/storage/files/:fileId/versions/:version/download`

Streams binary via `minioService.getObject(bucket, objectKey)` where
`objectKey = ${workspaceId}/${version.path}`, setting `Content-Type`, `Content-Disposition`,
`Content-Length` (mirrors `StorageController.download`). Fallback: presigned URL.

#### 5.1.5 POST `/storage/files/:fileId/versions/:version/revert`

`fileVersionService.revertVersion(fileId, version, workspaceId, req.user.userId, changeReason?)`.
**Implementation fact:** the reverted version **reuses `source.path`** — no MinIO copy is made
(Gap G2). Design doc's "new object key" is not honored by the service; documented, accepted.

#### 5.1.6 DELETE `/storage/files/:fileId/versions/:version`

`fileVersionService.deleteVersion(fileId, Number(version), workspaceId)`.
Returns 204. **DB row only — MinIO object is NOT removed** (Gap G3). Service throws 400
(`BadRequestException`) when `total <= 1` (initial version protected); 404 when the version does
not exist; 403 on foreign workspace.

---

## 6. Design-vs-Implementation Gaps (034 spec → actual code)

| ID  | 034 Design Spec Says…                         | Actual Implementation                                                                                                      | Decision                                                                                               |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| G1  | Service uploads to MinIO (T1/T2 mock)         | `createVersion` takes `path`; **no MinIO call in service** — caller uploads first                                          | Controller orchestrates: upload → then `createVersion`. Service stays storage-agnostic.                |
| G2  | Revert "new object key"                       | `revertVersion` reuses `source.path` (same object key)                                                                     | Accepted; identical content, no copy. `download`/`delete` must key off shared object.                  |
| G3  | DELETE "removes both DB row and MinIO object" | `deleteVersion` deletes **DB row only**                                                                                    | Accepted in this phase; orphan-object GC deferred. Never delete MinIO object per-version (G2 sharing). |
| G4  | List "sorted ASC"                             | Repository `ORDER BY version DESC`                                                                                         | Accepted: newest-first is intended. Correct 034 test-strategy prose at implementation time.            |
| G5  | DELETE latest blocked with 409                | `deleteVersion` blocks only when `total <= 1` (400), allows deleting latest when >1 exist                                  | Accepted; aligns with "initial version immutable" intent. Frontend must surface this.                  |
| —   | Custom error codes (`VERSION_NOT_FOUND`…)     | Global `AllExceptionsFilter` emits generic codes (`NOT_FOUND`, `FORBIDDEN`, `BAD_REQUEST`, `CONFLICT`, `VALIDATION_ERROR`) | Keep global filter; document generic codes. No custom codes needed.                                    |

---

## 7. Authorization Review

- Guards: `JwtAuthGuard` (authn) → `WorkspaceGuard` (extracts/auto-detects `workspaceId`) →
  `PermissionsGuard` (reads `@RequirePermissions` metadata).
- Workspace isolation is **defense-in-depth**: both `WorkspaceGuard` (request scope) and the
  service (`file.workspaceId !== workspaceId → ForbiddenException`) enforce it.
- `files.*` slugs already exist in `prisma/seed.ts`. **No new permission slugs required** — the
  6 endpoints map onto the 4 existing slugs (`upload`, `read`, `delete`; `update` unused).
- Role mapping (verified from `seed.ts` lines 272-469): SUPER_ADMIN → all slugs; OWNER →
  read/upload/update/delete/share; ADMIN → read/upload/update/delete; ENGINEER/EDITOR →
  read/upload only; KNOWLEDGE_WRITER/REVIEWER/CONSULTANT/MEMBER → read/upload (REVIEWER etc.
  via list); VIEWER → read only; PLATFORM_ADMIN/SUPPORT_ADMIN → no `files.*`.
  Revert uses `files.upload` (per 034); `files.update` is available if a stricter future policy
  needs it.
- Project binding: optional via ProjectFile; `ProjectMemberGuard` pattern (from
  project-file.controller.ts) can be layered on top if project-scoped access is required — not
  required for this order.

Full matrix: `docs/generated/storage-phase1d-api-permission-matrix.md`.

---

## 8. DTO Design

`FileVersionDto` (presentation, mirrors `FileResponseDto` style — `size` as `number`,
`sizeHuman` as string):

| Field        | Type           | Notes                                |
| ------------ | -------------- | ------------------------------------ |
| id           | string         | row UUID                             |
| fileId       | string         | parent file UUID                     |
| version      | number         | integer 1..N                         |
| path         | string         | object key (no workspaceId prefix)   |
| size         | number         | bytes (converted from BigInt)        |
| sizeHuman    | string         | e.g. "1.0 MB"                        |
| mimeType     | string         |                                      |
| originalName | string         |                                      |
| checksum     | string \| null |                                      |
| changeReason | string \| null |                                      |
| createdBy    | string \| null | nullable in schema/entity            |
| createdAt    | string         | ISO-8601                             |
| isLatest     | boolean        | `version === countByFileId` (newest) |
| downloadUrl  | string \| null | presigned, single-get only           |

Supporting DTOs: `CreateFileVersionDto` (changeReason optional; file is multipart), pagination
query (page/limit, defaults 1/20), `FileVersionListResponse`, `RevertVersionRequest`
(changeReason optional). `isLatest` is derivable: `listVersions` meta.total gives the latest
number, so `isLatest = version === meta.total` on single-get (or expose `getLatestVersion`
already present in the repository interface).

---

## 9. Download Strategy

- **Default:** binary stream via `MinioService.getObject` (matches `StorageController.download`),
  sets `Content-Type`/`Content-Disposition`/`Content-Length`.
- **Alternative:** presigned URL via `MinioService.getPresignedUrl` for the single-version GET
  (`downloadUrl`), consistent with `StorageController.findOne` fallback behavior.
- **Object key resolution:** version rows store `path` **without** the workspaceId prefix
  (verified in integration spec: `path: '2026/07/svc-v1.pdf'`). Download/upload key =
  `${workspaceId}/${path}`. **Gap G1 consequence:** the controller must build the object key and
  upload before `createVersion`; the service stores the key as-is.

---

## 10. Test Gap Summary

Covered (no new tests required): service unit (13), service integration (15), repository
integration (22). **Missing (must be added in implementation):** controller/e2e coverage for all
6 endpoints, multipart upload, authorization per role, workspace isolation, pagination, 404/400/403
paths, presigned-URL fallback, checksum, and the ordering behavior (DESC).

Full gap matrix: `docs/generated/storage-phase1d-api-test-gap.md`.

---

## 11. OpenAPI Impact

- `packages/openapi/v1/openapi.json` (233 paths) currently has **no** storage file-version paths.
- Add 6 paths + `FileVersionDto`, `FileVersionListResponse`, `RevertVersionRequest` schemas
  under the `storage` tag, then re-run the generator and `prettier`
  (`prettier --config packages/config/prettier.config.cjs`) — per the 045 OpenAPI drift findings
  (generator output is canonical; committed file must equal generator output).
- `docs/generated/storage-file-versioning-api-design.md` §7 already lists the 6 paths — reuse.

---

## 12. Implementation Checklist (for the implementation order)

- [ ] `FileVersionController` with 6 endpoints (Option A routes), guards + `@RequirePermissions`.
- [ ] `FileVersionDto` + supporting DTOs; `FileResponseDto`-style `fromEntity`.
- [ ] Multipart read pattern copied from `StorageController.upload` (Fastify, 100MB, MIME allowlist).
- [ ] Controller-side MinIO upload (object key `${workspaceId}/${YYYY/MM/uuid.ext}`) before `createVersion` (G1).
- [ ] Download endpoint streaming + presigned fallback; object key `${workspaceId}/${version.path}`.
- [ ] `isLatest` derivation (reuse `meta.total` or `getLatestVersion`).
- [ ] OpenAPI: 6 paths + schemas, regenerate + prettier.
- [ ] Controller/e2e tests per gap matrix; fix G4 prose in 034 test-strategy doc.
- [ ] Re-verify: `pnpm typecheck`, `pnpm build`, `pnpm test`, `git diff --check`.

---

## 13. Change Log

| Date       | Author             | Change             |
| ---------- | ------------------ | ------------------ |
| 2026-07-31 | Chief Executive AI | Initial API review |

---

_End of Storage Phase 1D API Review_
