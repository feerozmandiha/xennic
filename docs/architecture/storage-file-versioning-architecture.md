# Storage File Versioning — Architecture

- **Document ID:** XENNIC-STORAGE-VERSIONING-ARCH
- **Status:** PROPOSED
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-REVIEW-034
- **Supersedes:** N/A (new capability)

---

## 1. Design Principles

1. **Immutability** — Once a version row is created, it is never updated. Content changes create new versions.
2. **Inheritance** — Version access control inherits from the parent file. No per-version ACL.
3. **Auditability** — Every version operation (create, download, revert, delete) emits an audit event.
4. **Workspace Isolation** — Version access requires passing through parent file workspace guard.
5. **Simplicity** — Sequential numbering, derived active version, no complex state machine.
6. **Independence** — Each version has its own MinIO object, checksum, and metadata.

---

## 2. Domain Model

### 2.1 FileVersion Entity (Target Schema)

```typescript
FileVersion {
  id: UUID           // Primary key
  file_id: UUID      // FK → files.id (CASCADE DELETE)
  version: Int       // Sequential per file (1, 2, 3...)
  path: String       // MinIO object key
  size: BigInt       // Bytes — per-version size tracking
  mime_type: String  // Inherited from parent file at creation time
  original_name: String // Inherited from parent file at creation time
  checksum: String?  // SHA-256 of this version's content
  change_reason: String? // Optional user-provided reason
  created_by: UUID   // FK → users.id (SET NULL on user delete)
  created_at: DateTime
}
```

### 2.2 TypeScript Interface

```typescript
interface IFileVersion {
  readonly id: string;
  readonly fileId: string;
  readonly version: number;
  readonly path: string;
  readonly size: number;
  readonly mimeType: string;
  readonly originalName: string;
  readonly checksum: string | null;
  readonly changeReason: string | null;
  readonly createdBy: string;
  readonly createdAt: Date;
}
```

### 2.3 Relationship Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   workspaces │────→│      files       │←────│    users     │
└─────────────┘     └────────┬─────────┘     └──────────────┘
                             │
                    ┌────────┴────────┐
                    ↓                 ↓
              ┌──────────┐    ┌──────────────┐
              │ versions │    │ attachments  │
              │ (N per   │    │ (polymorphic)│
              │  file)   │    └──────────────┘
              └──────────┘

Version → File: CASCADE DELETE
Version → User: SET NULL (created_by)
```

---

## 3. Lifecycle State Machine

```
                    ┌──────────┐
                    │ CREATED  │ ← Initial state on POST
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  ACTIVE  │ ← MAX(version) = current
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │SUPERSEDED│ ← When newer version exists
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ DELETED  │ ← Hard delete (row + object)
                    └──────────┘
```

**State derivation:**

- **ACTIVE** = `version == MAX(version) for this file_id`
- **SUPERSEDED** = `version < MAX(version) for this file_id`
- **DELETED** = row removed from DB + object removed from MinIO

No explicit `status` column needed. State is derived from the version number relative to the file's latest version.

---

## 4. Object Storage Strategy

### 4.1 Object Key Pattern

```
{workspace_id}/{year}/{month}/{uuid}_v{N}.{ext}
```

Example:

```
a1b2c3d4-e5f6-7890-abcd-ef1234567890/2026/07/f47ac10b-58cc-4372-a567-0e02b2c3d479_v2.pdf
```

### 4.2 Storage Lifecycle

| Event             | MinIO Action             | DB Action                   |
| ----------------- | ------------------------ | --------------------------- |
| Create version    | PUT new object           | INSERT row                  |
| Download version  | GET object               | —                           |
| Revert to version | (source read) + PUT copy | INSERT new row              |
| Delete version    | REMOVE object            | DELETE row                  |
| Delete file       | — (cascade)              | CASCADE DELETE all versions |

### 4.3 Previous Versions

Previous versions **remain in MinIO** until explicitly deleted. This ensures:

- Immutability guarantee
- Audit trail integrity
- Ability to revert to any historical version

### 4.4 Restore

Restore is implemented as "revert" — creating a new version with the content of the target version. No in-place restoration.

---

## 5. Version Creation Flow

```
User ──POST /files/:id/versions──→ FileVersionController
                                      │
                                      ▼
                               FileVersionService.createVersion()
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                  ▼
            StorageService     prisma.$queryRaw    MinioService
            ._getFile()        MAX(version)        .uploadBuffer()
            (workspace check)  + INSERT row        (new object)
                    │                 │                  │
                    ▼                 ▼                  ▼
              File exists?    version = N+1        Object stored
              workspace OK    file_versions row
                    │
                    ▼
            Audit event: file_version_created
                    │
                    ▼
            FileVersionDto returned
```

---

## 6. Revert Flow

```
User ──POST /files/:id/versions/:vid/revert──→ FileVersionController
                                                    │
                                                    ▼
                                          FileVersionService.revertToVersion()
                                                    │
                              ┌──────────────────────┼──────────────────────┐
                              ▼                      ▼                      ▼
                    Find source version      Read source object       Calculate new version
                    (file_id + version)      from MinIO              number (MAX + 1)
                              │                      │                      │
                              ▼                      ▼                      ▼
                    Source exists?           Content retrieved      New version = N+1
                    File access OK?
                              │
                              ▼
                    Upload content as new object
                    with new UUID + version suffix
                              │
                              ▼
                    INSERT new file_versions row
                              │
                              ▼
                    Audit: file_version_reverted
                    { source_version: M, new_version: N }
                              │
                              ▼
                    Return new FileVersionDto
```

---

## 7. Access Control

### 7.1 Permission Inheritance

```
FileVersion access
  └── requires File access
        └── requires WorkspaceGuard (workspace_id match)
        └── requires PermissionsGuard (files.read / files.upload / files.delete)
        └── requires ProjectMemberGuard (if file is ProjectFile attachment)
```

**No per-version ACL.** All versions of a file inherit the parent file's access rules.

### 7.2 Cross-Workspace Isolation

```typescript
// StorageService._getFile() — already enforces workspace match
const file = await this.storageRepository.findById(id);
if (!file || file.isDeleted()) throw NotFoundException;
if (file.workspaceId !== workspaceId) throw ForbiddenException;
```

Any version access goes through this check first.

### 7.3 ProjectMemberGuard Integration

When a file is attached to a project (via `project_files`), the `ProjectMemberGuard` already enforces project membership. This guard applies to version operations because they go through the same controller path.

---

## 8. Quota Enforcement

### 8.1 Storage Accounting

All versions count in quota:

```sql
SELECT SUM(size) FROM file_versions
WHERE file_id IN (SELECT id FROM files WHERE workspace_id = ? AND deleted_at IS NULL);
```

Alternatively, aggregate via `files` table + version sizes.

### 8.2 Quota Check on Version Creation

```
1. Get current workspace usage (files + all versions)
2. Add new version size
3. Compare against workspace quota limit
4. If exceeded → 413 Quota Exceeded
5. If OK → proceed with upload
```

---

## 9. Audit Events

| Event                     | Trigger                   | Metadata                                           |
| ------------------------- | ------------------------- | -------------------------------------------------- |
| `file_version_created`    | Version creation succeeds | `{ fileId, version, size, checksum, createdBy }`   |
| `file_version_downloaded` | Version download succeeds | `{ fileId, version, downloadedBy }`                |
| `file_version_reverted`   | Revert succeeds           | `{ fileId, sourceVersion, newVersion, createdBy }` |
| `file_version_deleted`    | Version deletion succeeds | `{ fileId, version, size, deletedBy }`             |

---

## 10. Service Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    StorageModule                          │
│                                                          │
│  ┌─────────────────┐    ┌──────────────────────────┐    │
│  │ StorageController│    │ FileVersionController     │    │
│  └────────┬────────┘    └────────────┬─────────────┘    │
│           │                          │                   │
│  ┌────────▼────────┐    ┌────────────▼─────────────┐    │
│  │ StorageService  │    │ FileVersionService        │    │
│  └────────┬────────┘    └────────────┬─────────────┘    │
│           │                          │                   │
│  ┌────────▼────────┐    ┌────────────▼─────────────┐    │
│  │ StorageRepository│   │ FileVersionRepository     │    │
│  └────────┬────────┘    └────────────┬─────────────┘    │
│           │                          │                   │
│  ┌────────▼────────┐    ┌────────────▼─────────────┐    │
│  │   MinioService  │◄───│   MinioService (shared)  │    │
│  └─────────────────┘    └──────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

**Key integration points:**

- `FileVersionService` uses `StorageService._getFile()` (via DI) for workspace validation
- `FileVersionService` uses `MinioService` for object operations
- `FileVersionService` uses `FileVersionRepository` for DB operations
- `FileVersionController` is registered in `StorageModule`

---

## 11. Migration Strategy

**Approach:** Additive only — no drops, no renames, no data modification.

| Step | SQL                                       | Risk                            |
| ---- | ----------------------------------------- | ------------------------------- |
| 1    | Add `size BIGINT` column                  | LOW — nullable, empty table     |
| 2    | Add `created_by TEXT` column              | LOW — nullable, FK optional     |
| 3    | Add `mime_type TEXT` column               | LOW — nullable                  |
| 4    | Add `original_name TEXT` column           | LOW — nullable                  |
| 5    | Add `change_reason TEXT` column           | LOW — nullable                  |
| 6    | Add `UNIQUE(file_id, version)` constraint | LOW — empty table, no conflicts |
| 7    | Add `INDEX(file_id, created_at)`          | LOW — empty table, instant      |

**All changes are safe on an empty table.**

---

## 12. Rollback Strategy

If versioning needs to be rolled back:

1. Remove `FileVersionController` routes from `StorageModule`
2. Remove `FileVersionService` and `FileVersionRepository`
3. Remove new columns from schema (DROP COLUMN — table remains)
4. Schema table `file_versions` can stay or be dropped
5. No data to lose (versions are only created by the new code)

---

## 13. Open Questions

| #   | Question                                              | Status                                             |
| --- | ----------------------------------------------------- | -------------------------------------------------- |
| 1   | Should revert be limited to superseded versions only? | OPEN — allow revert to any version for flexibility |
| 2   | Should there be a max versions per file limit?        | DEFERRED — Phase 1G retention policy               |
| 3   | Should version creation auto-detect metadata changes? | NO — explicit content upload required              |

---

## 14. Change Log

| Date       | Author             | Change                        |
| ---------- | ------------------ | ----------------------------- |
| 2026-07-25 | Chief Executive AI | Initial architecture document |

---

_End of File Versioning Architecture_
