# Storage Phase 1D — File Version API Test Gap Matrix

- **Document ID:** XENNIC-STORAGE-PHASE1D-API-TEST-GAP
- **Date:** 2026-07-31
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-API-REVIEW-046
- **Related:** storage-file-versioning-test-strategy.md (Order 034), storage-phase1d-api-review.md

---

## 1. Purpose

Identify exactly which test coverage exists vs. what must be added when the File Version API
controller is implemented. Service/repository layer is fully covered (50/50 PASS, verified in
Order 044); the presentation layer has **zero** coverage.

---

## 2. Existing Coverage (no changes needed)

| Suite       | File                                                                                    | Count  | Covers                                                                 |
| ----------- | --------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| Unit        | `.../application/services/file-version.service.spec.ts`                                 | 13     | create/list/get/revert/delete + guard + pagination clamps + validation |
| Integration | `.../application/services/file-version.service.integration.spec.ts`                     | 15     | real Prisma/MinIO flows, workspace isolation, ordering, delete rules   |
| Repository  | `.../infrastructure/repositories/__tests__/file-version.repository.integration.spec.ts` | 22     | raw SQL CRUD, version numbering, unique constraint, pagination         |
| **Total**   | —                                                                                       | **50** | —                                                                      |

---

## 3. Gap Matrix — must be added at implementation time

| #   | Area                      | Endpoint(s)           | Gap Details                                                                                | Priority |
| --- | ------------------------- | --------------------- | ------------------------------------------------------------------------------------------ | -------- |
| 1   | **Controller happy path** | all 6                 | No controller exists → zero route-level coverage                                           | HIGH     |
| 2   | Multipart upload          | POST create           | `req.isMultipart`/`req.file` handling, field name `file`, buffer concat, `truncated` → 400 | HIGH     |
| 3   | MinIO orchestration (G1)  | POST create           | Upload-before-createVersion ordering; object key `${wsId}/YYYY/MM/uuid.ext`                | HIGH     |
| 4   | Checksum                  | POST create           | SHA-256 computed and stored                                                                | MEDIUM   |
| 5   | File constraints          | POST create           | 413 over 100MB, 415 MIME not in `ALLOWED_MIME_TYPES`, 400 no file                          | HIGH     |
| 6   | Permissions per role      | all 6                 | OWNER/ADMIN/ENGINEER/EDITOR/VIEWER → 403 matrix per `permission-matrix.md` §5              | HIGH     |
| 7   | Workspace isolation       | all 6                 | Foreign `x-workspace-id` → 403 (service + guard)                                           | HIGH     |
| 8   | AuthN                     | all 6                 | Missing/expired JWT → 401                                                                  | HIGH     |
| 9   | Pagination                | GET list              | page/limit defaults (1/20), clamps (1..100), meta shape                                    | MEDIUM   |
| 10  | Ordering (G4)             | GET list              | **`version DESC` (newest first)** asserted — diverges from 034 prose                       | MEDIUM   |
| 11  | Single get                | GET :version          | `downloadUrl` presigned present; 400 non-integer/:0; 404 missing                           | MEDIUM   |
| 12  | Download                  | GET :version/download | Binary stream headers (Content-Type/Disposition/Length); object key `${wsId}/${path}`      | HIGH     |
| 13  | Download fallback         | GET :version/download | Presigned fallback path on stream failure                                                  | LOW      |
| 14  | Revert                    | POST :version/revert  | New version created reusing source `path` (G2); version N+1; reason echo                   | HIGH     |
| 15  | Delete rules (G5)         | DELETE :version       | 204 on success; 400 when `total <= 1`; latest deletable when >1 exist                      | HIGH     |
| 16  | Not-found paths           | GET/DELETE :version   | 404 for missing file vs missing version                                                    | MEDIUM   |
| 17  | Race/concurrency          | POST create           | Concurrent creates → unique violation → 409 (service already throws)                       | LOW      |
| 18  | DTO validation            | create/revert/query   | `VALIDATION_ERROR` shape via global `AllExceptionsFilter`                                  | MEDIUM   |
| 19  | Error envelope            | all                   | `{ success: false, error: { code, message } }` from global filter                          | MEDIUM   |
| 20  | OpenAPI smoke             | all 6                 | Generated spec contains new paths/schemas (regenerate + prettier)                          | MEDIUM   |

---

## 4. Recommended Test Files (new, at implementation time)

| File                                                                                              | Scope                                  | Framework |
| ------------------------------------------------------------------------------------------------- | -------------------------------------- | --------- |
| `apps/api/test/file-version.e2e-spec.ts`                                                          | HTTP + authz + MinIO                   | Jest E2E  |
| `apps/api/src/modules/storage/presentation/controllers/__tests__/file-version.controller.spec.ts` | Controller unit (mocked service/minio) | Jest unit |

The 034 test-strategy doc named `apps/api/test/file-version.e2e-spec.ts` — reuse that name for
consistency. Note: 034 also named an `apps/api/test/file-version.integration.e2e-spec.ts`; the
actual integration spec lives at
`.../application/services/file-version.service.integration.spec.ts` — reconcile the 034 prose
(G4 fix) when implementing.

---

## 5. Coverage Targets (per 034 test-strategy)

- Unit: ≥ 80%.
- Critical paths: 100% (create, workspace isolation, permission denial, delete rules, download).
- E2E: all 6 endpoints green against real Prisma + MinIO (same harness as
  `project-file.e2e-spec.ts` / `kf-storage-integration.e2e-spec.ts`).

---

## 6. Change Log

| Date       | Author             | Change             |
| ---------- | ------------------ | ------------------ |
| 2026-07-31 | Chief Executive AI | Initial gap matrix |

---

_End of File Version API Test Gap Matrix_
