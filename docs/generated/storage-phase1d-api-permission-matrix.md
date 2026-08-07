# Storage Phase 1D — File Version API Permission Matrix

- **Document ID:** XENNIC-STORAGE-PHASE1D-API-PERMISSION-MATRIX
- **Date:** 2026-07-31
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-API-REVIEW-046
- **Related:** ADR-022, ADR-024, storage-phase1d-api-review.md, `apps/api/prisma/seed.ts`

---

## 1. Purpose

Definitive endpoint × permission × role matrix for the proposed File Version API. Verified
against the live seed data (`apps/api/prisma/seed.ts`), not assumptions.

---

## 2. Permission Slugs (seeded, `seed.ts:228-232`)

| Slug           | Domain  | Description  | Status |
| -------------- | ------- | ------------ | ------ |
| `files.read`   | storage | Read Files   | EXISTS |
| `files.upload` | storage | Upload Files | EXISTS |
| `files.update` | storage | Update Files | EXISTS |
| `files.delete` | storage | Delete Files | EXISTS |
| `files.share`  | storage | Share Files  | EXISTS |

**No new slugs required.** All six version endpoints reuse the four existing slugs; `files.update`
and `files.share` are unused by versioning but available for future policies.

---

## 3. Endpoint → Permission

| #   | Method | Path                                                | Permission     |
| --- | ------ | --------------------------------------------------- | -------------- |
| 1   | POST   | `/storage/files/:fileId/versions`                   | `files.upload` |
| 2   | GET    | `/storage/files/:fileId/versions`                   | `files.read`   |
| 3   | GET    | `/storage/files/:fileId/versions/:version`          | `files.read`   |
| 4   | GET    | `/storage/files/:fileId/versions/:version/download` | `files.read`   |
| 5   | POST   | `/storage/files/:fileId/versions/:version/revert`   | `files.upload` |
| 6   | DELETE | `/storage/files/:fileId/versions/:version`          | `files.delete` |

Mapping rationale:

- Create/revert write new history rows → `files.upload` (matches 034 design; ENGINEER/EDITOR
  both hold it).
- List/get/download are read-only → `files.read` (VIEWER-compatible).
- Delete destroys history → `files.delete` (OWNER/ADMIN/SUPER_ADMIN only).

---

## 4. Role → `files.*` Assignments (verified from `seed.ts`)

| Role             | `files.read` | `files.upload` | `files.update` | `files.delete` | `files.share` |
| ---------------- | :----------: | :------------: | :------------: | :------------: | :-----------: |
| SUPER_ADMIN      | ✓ (allSlugs) |       ✓        |       ✓        |       ✓        |       ✓       |
| PLATFORM_ADMIN   |      —       |       —        |       —        |       —        |       —       |
| SUPPORT_ADMIN    |      —       |       —        |       —        |       —        |       —       |
| OWNER            |      ✓       |       ✓        |       ✓        |       ✓        |       ✓       |
| ADMIN            |      ✓       |       ✓        |       ✓        |       ✓        |       —       |
| ENGINEER         |      ✓       |       ✓        |       —        |       —        |       —       |
| EDITOR           |      ✓       |       ✓        |       —        |       —        |       —       |
| KNOWLEDGE_WRITER |      ✓       |       —        |       —        |       —        |       —       |
| REVIEWER         |      ✓       |       ✓        |       —        |       —        |       —       |
| CONSULTANT       |      ✓       |       ✓        |       —        |       —        |       —       |
| MEMBER           |      ✓       |       ✓        |       —        |       —        |       —       |
| VIEWER           |      ✓       |       —        |       —        |       —        |       —       |

Sources: `seed.ts:272-276` (SUPER_ADMIN = `allSlugs`), `278-290` (PLATFORM_ADMIN, SUPPORT_ADMIN),
`292-330` (OWNER), `336-367` (ADMIN), `370-389` (ENGINEER), `392-406` (EDITOR),
`409-417` (KNOWLEDGE_WRITER), `420-433` (REVIEWER), `436-449` (CONSULTANT), `452-464` (MEMBER),
`467-469` (VIEWER).

---

## 5. Role → Version Endpoint Access

Derived from §3 × §4.

| Role             | Create (1) | List (2) | Get (3) | Download (4) | Revert (5) | Delete (6) |
| ---------------- | :--------: | :------: | :-----: | :----------: | :--------: | :--------: |
| SUPER_ADMIN      |     ✓      |    ✓     |    ✓    |      ✓       |     ✓      |     ✓      |
| PLATFORM_ADMIN   |     —      |    —     |    —    |      —       |     —      |     —      |
| SUPPORT_ADMIN    |     —      |    —     |    —    |      —       |     —      |     —      |
| OWNER            |     ✓      |    ✓     |    ✓    |      ✓       |     ✓      |     ✓      |
| ADMIN            |     ✓      |    ✓     |    ✓    |      ✓       |     ✓      |     ✓      |
| ENGINEER         |     ✓      |    ✓     |    ✓    |      ✓       |     ✓      |     —      |
| EDITOR           |     ✓      |    ✓     |    ✓    |      ✓       |     ✓      |     —      |
| KNOWLEDGE_WRITER |     —      |    ✓     |    ✓    |      ✓       |     —      |     —      |
| REVIEWER         |     ✓      |    ✓     |    ✓    |      ✓       |     ✓      |     —      |
| CONSULTANT       |     ✓      |    ✓     |    ✓    |      ✓       |     ✓      |     —      |
| MEMBER           |     ✓      |    ✓     |    ✓    |      ✓       |     ✓      |     —      |
| VIEWER           |     —      |    ✓     |    ✓    |      ✓       |     —      |     —      |

---

## 6. Enforcement Chain

1. `JwtAuthGuard` — authenticates user.
2. `WorkspaceGuard` — resolves `workspaceId` from `x-workspace-id` header (or auto-detect first
   workspace); populates `req.workspaceId`.
3. `PermissionsGuard` — reads `@RequirePermissions(...)` metadata; denies if user lacks the slug
   for the workspace.
4. `FileVersionService` — defense-in-depth: `file.workspaceId !== workspaceId →
ForbiddenException` (403) for every version method.

Project-scoped access is optional (via ProjectFile + `ProjectMemberGuard` pattern); not required
for this order.

---

## 7. Notes

- **DELETE is privileged:** only SUPER_ADMIN / OWNER / ADMIN can delete a version — appropriate,
  since `files.delete` is the history-destroying permission.
- **Revert reuses `files.upload`:** an ENGINEER/EDITOR can create a new version via revert but
  cannot delete history — a sensible default.
- **No per-version permissions:** ADR-024 D5 (version inherits parent file permissions) holds —
  the matrix is file-scoped, never version-scoped.
- If future policy must distinguish "revert" from "upload", `files.update` is already seeded and
  available without a migration.

---

## 8. Change Log

| Date       | Author             | Change                    |
| ---------- | ------------------ | ------------------------- |
| 2026-07-31 | Chief Executive AI | Initial permission matrix |

---

_End of File Version API Permission Matrix_
