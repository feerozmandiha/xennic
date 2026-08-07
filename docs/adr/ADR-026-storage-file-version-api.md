# ADR-026: Storage File Version API

- **ID:** ADR-026
- **Title:** Storage File Version API (Phase 1D presentation layer)
- **Status:** ACCEPTED
- **Date:** 2026-07-31
- **Decision makers:** Chief Executive AI — Xennic Platform
- **Related:** ADR-022, ADR-023, ADR-024, ADR-025, XENNIC-STORAGE-EO-1D-API-REVIEW-046, XENNIC-STORAGE-EO-1D-API-IMPLEMENT-047
- **Supersedes:** N/A (activates the presentation layer designed in Order 034)

---

## Context

ADR-024 established application-level file versioning using the existing `file_versions` table.
Order 034 delivered the design-only API spec, and Orders 042-045 implemented and verified the
full domain/app/infrastructure layer (`FileVersionService`, `FileVersionRepository`, `MinioService`)
with 50/50 tests passing.

The one missing layer is the HTTP presentation: there is no controller, no DTOs, and no OpenAPI
paths for file versions. The `file_versions` schema is currently dead in practice — no rows, no
endpoints.

Order 047 (this order) closed the gap: it added the controller + DTOs, refactored the service to
**orchestrate MinIO inside the service layer** (G1), made revert create an **independent object**
via server-side copy (G2), made delete remove the DB row **and** the object (G3), and fixed the
delete policy (G5). This ADR fixes the API shape, permission mapping, and the reconciliation of
the five gaps between the 034 design spec and the final implemented service.

---

## Decision

Expose file versioning via **Option A — nested paths under the parent file**:

| #   | Method | Path                                                       | Permission     |
| --- | ------ | ---------------------------------------------------------- | -------------- |
| 1   | POST   | `/api/v1/storage/files/:fileId/versions`                   | `files.upload` |
| 2   | GET    | `/api/v1/storage/files/:fileId/versions`                   | `files.read`   |
| 3   | GET    | `/api/v1/storage/files/:fileId/versions/:version`          | `files.read`   |
| 4   | GET    | `/api/v1/storage/files/:fileId/versions/:version/download` | `files.read`   |
| 5   | POST   | `/api/v1/storage/files/:fileId/versions/:version/revert`   | `files.upload` |
| 6   | DELETE | `/api/v1/storage/files/:fileId/versions/:version`          | `files.delete` |

### Specific Decisions

| #   | Decision                                                                                                     | Rationale                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Nested REST paths under `/files/:fileId/versions`                                                            | Matches Order 034 design + existing `StorageController` style                                                                       |
| D2  | `:version` route param is the **integer** version number (1,2,3)                                             | Service/repository resolve by integer (`findByFileIdAndVersion`); stable deterministic URLs; matches `@@unique([file_id, version])` |
| D3  | Reuse existing `files.*` permission slugs — no new permissions                                               | Slugs already seeded and role-assigned (seed.ts:228-232)                                                                            |
| D4  | Create/revert → `files.upload`; list/get/download → `files.read`; delete → `files.delete`                    | Matches 034; sensible by role (see permission matrix)                                                                               |
| D5  | Service orchestrates MinIO (upload/copy/delete) — controller only parses multipart and passes buffer         | G1 — single place for object-key + upload + rollback semantics; controller stays thin                                               |
| D6  | Object key = `${workspaceId}/${path}`; version `path` stored WITHOUT workspaceId prefix                      | Verified in integration spec; identical to `FileEntity.objectKey` convention                                                        |
| D7  | Download = binary stream with presigned-URL fallback                                                         | Mirrors `StorageController.download`/`findOne`                                                                                      |
| D8  | Revert creates an **independent** MinIO object (server-side copy); delete removes DB row **and** that object | G2/G3 — no shared object keys, so per-version object deletion is safe; only v1 object is shared as the initial content              |
| D9  | Keep global `AllExceptionsFilter` error codes (generic)                                                      | G5/— — no custom codes; consistent with rest of API                                                                                 |
| D10 | Errors: 400/403/404/409/413/415 as defined by service + controller                                           | Service already throws these precisely                                                                                              |

---

## Implementation Gaps (034 spec → actual code)

| ID  | 034 Design Says…                           | Actual Implementation (Order 047)                                                                              | Resolution                                                                          |
| --- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| G1  | Service uploads to MinIO on create         | `createVersion` uploads inside the service (upload-before-create, rollback on DB failure)                      | Accepted — service orchestrates MinIO; controller parses multipart only             |
| G2  | Revert creates "new object key"            | `revertVersion` creates a **new independent object** via `copyObject` (server-side copy)                       | Accepted — no shared keys; download/delete semantics stay per-version               |
| G3  | DELETE removes DB row **and** MinIO object | `deleteVersion` deletes the DB row **and** its own object (never the shared v1 object)                         | Accepted — safe because revert uses independent objects (G2)                        |
| G4  | List sorted ASC (034 prose)                | Repository `ORDER BY version DESC`                                                                             | Accepted — newest-first is the contract; fix 034 prose                              |
| G5  | DELETE latest blocked with 409             | Initial version (v1) blocked with **400**; latest active blocked with **409**; intermediate versions deletable | Accepted — initial version immutable AND latest protected; delete = DB row + object |

---

## Alternatives Considered

### Option B — Flat `/api/v1/storage/versions`

**Pros:** Flat URL; no nesting.
**Cons:** Loses file sub-resource semantics; duplicates `fileId` already in service; drifts from
Order 034.
**Decision:** REJECTED.

### Option C — Separate `FileVersionController` at `/storage/file-versions`

**Pros:** Dedicated namespace.
**Cons:** Inconsistent naming vs `files` resource; contradicts 034; no benefit.
**Decision:** REJECTED.

### Option D — Route by version row UUID (`:versionId`) instead of integer

**Pros:** Matches generic id conventions elsewhere.
**Cons:** Row UUID is opaque; service resolves by integer version; breaks determinism of
`findByFileIdAndVersion`; extra lookup needed.
**Decision:** REJECTED — integer version number is the stable, user-facing key.

---

## Consequences

### Positive

- Activates the dead `file_versions` schema with zero schema/migration change.
- Workspace-isolated, permission-mapped API consistent with existing storage endpoints.
- Service-level MinIO orchestration (G1) keeps rollback and object-key semantics in one place.
- Independent revert objects (G2) make per-version object deletion safe (G3).

### Negative

- Each version (and each revert) is a distinct MinIO object — storage grows per version (copy cost on revert, no dedup).
- v1's object is shared as the content source for the first version only; if v1 is the only version, deleting the file later requires the file-delete flow, not this API.
- API docs (034) contain stale prose (ordering, delete rules) that must be corrected during
  implementation.

### Neutral

- Six new OpenAPI paths + schemas (generated output — regenerate + prettier).
- New controller + DTO + e2e/unit tests (~20 gap items in the test-gap matrix).
- `files.update`/`files.share` remain unused but available for future policy.

---

## Implementation Plan

| Step | Deliverable                                                             | Dependencies                |
| ---- | ----------------------------------------------------------------------- | --------------------------- |
| 1    | `FileVersionDto` + request/query DTOs                                   | —                           |
| 2    | `FileVersionController` (6 endpoints, Option A)                         | DTOs, service, MinioService |
| 3    | Controller tests (unit + e2e per gap matrix)                            | controller                  |
| 4    | OpenAPI: regenerate + prettier (6 paths/schemas)                        | controller                  |
| 5    | Correct 034 test-strategy/API-doc prose (G4/G5)                         | —                           |
| 6    | Verify: `pnpm typecheck`, `pnpm build`, `pnpm test`, `git diff --check` | all                         |

---

## Risk Assessment

| Severity | Count | Notes                                                                                  |
| -------- | ----- | -------------------------------------------------------------------------------------- |
| CRITICAL | 0     | —                                                                                      |
| HIGH     | 0     | —                                                                                      |
| MEDIUM   | 3     | MinIO orphan objects (G3); shared object keys (G2); doc drift (G4/G5)                  |
| LOW      | 3     | Version-number race (unique constraint → 409); presigned expiry; `isLatest` derivation |

---

## Acceptance Criteria

1. 6 endpoints live under `/api/v1/storage/files/:fileId/versions*` (Option A).
2. Workspace isolation + `files.*` permission enforcement verified via e2e.
3. Create uploads to MinIO then creates version row (G1); download streams from MinIO.
4. Revert creates version N+1 reusing source object (G2); delete removes DB row only (G3).
5. List returns versions **newest-first** (DESC) with pagination meta.
6. `pnpm typecheck`, `pnpm build`, `pnpm test` (existing 50 + new) all pass.
7. OpenAPI regenerated and prettier-clean with the 6 new paths.

---

## Change Log

| Date       | Author             | Change      |
| ---------- | ------------------ | ----------- |
| 2026-07-31 | Chief Executive AI | Initial ADR |

---

_End of ADR-026_
