# ADR-021: Canonical File, Document, Asset & Attachment Platform

- **Status:** PROPOSED
- **Date:** 2026-07-19
- **Decision makers:** Chief Executive AI, Architecture Team
- **Related:** XENNIC-STORAGE-001 Engineering Order
- **Supersedes:** Current dual-storage abstraction

---

## Context

Xennic currently has **two independent storage abstractions**:

1. **Storage Module** (`apps/api/src/modules/storage/`) — `StorageService` + `MinioService` + `FileEntity` + `StorageRepository`. Manages files in MinIO with metadata in the `files` table.

2. **Knowledge Factory Storage** (`apps/api/src/modules/knowledge-factory/`) — `IStorageService` interface + `MinioStorageService` adapter + `knowledge_documents.storage_path` string field. Independent MinIO bucket (`knowledge-factory`), independent path strategy, no shared validation.

Additionally:

- `users.avatar_file_id` references a file by string with no FK constraint
- `project_reports.file_id` references a file by string with no FK constraint
- `knowledge_media.url` stores a URL string with no file reference
- `file_versions` table exists in schema but no code creates or reads versions
- No asset management system for UI/brand media (logo, favicon, hero image)
- No attachment system for linking files to domain entities
- No quota enforcement, no audit logging, no file versioning code

This duplication creates:

- Two MinIO client initializations
- Two path strategies (`{workspaceId}/{year}/{month}/` vs `workspaces/{workspaceId}/`)
- Two metadata stores with different schemas
- No shared validation layer
- No unified access control
- Growing divergence as each module evolves independently

## Decision

Implement a **Canonical File, Document, Asset & Attachment Platform** as a unified storage layer.

### Key architectural decisions:

1. **Single StorageService** — One NestJS injectable service handles all file operations (upload, download, versioning, lifecycle, quota). All modules consume this service via `IStorageService` interface.

2. **Four domain concepts:**
   - **File** — Physical object in MinIO with metadata in `files` table
   - **Document** — Processable content (PDFs, receipts, nameplates, drawings) linked to a File
   - **Asset** — UI/brand media (logo, favicon, hero image, avatar) linked to a File
   - **Attachment** — Polymorphic join connecting Files to any domain entity

3. **Knowledge Factory integration** — KF's `DocumentIntakeService` uses `StorageService` (via `IStorageService` interface). The duplicate `MinioStorageService` is removed. KF documents are linked to `files` table via `file_id` FK.

4. **File versioning** — Application-level versioning using `file_versions` table. Each upload to an existing logical file creates a new version record.

5. **Quota enforcement** — Per-workspace storage quotas checked synchronously at upload time.

6. **Audit logging** — Every file operation (upload, download, delete, archive) logged to `audit_logs`.

7. **Lifecycle management** — Files have states: `uploading → active → archived → deleted`. MinIO lifecycle policies clean up soft-deleted objects after configurable retention.

### What this ADR does NOT decide:

- Image processing pipeline (thumbnail generation, resize) — deferred to Phase 4
- CDN integration — deferred to production deployment
- Malware scanning — requires separate ADR for external service integration
- Backup strategy — deferred to infrastructure ADR

## Consequences

### Benefits

- **Single Source of Truth** — One service, one schema, one validation layer
- **Eliminates duplication** — Knowledge Factory no longer maintains its own storage abstraction
- **Type-safe references** — All file references use FK constraints, no orphan strings
- **Quota enforcement** — Prevents storage cost explosion
- **Audit trail** — Every file operation traceable
- **Version tracking** — File changes are versioned and recoverable
- **Clean architecture** — All consumers depend on `IStorageService` interface
- **Workspace isolation** — Single enforcement point for multi-tenancy

### Tradeoffs

- **Migration complexity** — Requires schema changes and code migration across Storage and Knowledge Factory modules
- **Breaking changes** — Knowledge Factory upload flow changes (mitigated by keeping API surface similar)
- **Performance** — Quota check adds one extra DB query per upload (mitigated by caching)

### Risks

- Knowledge Factory migration may break document processing pipeline — mitigated by phased approach and comprehensive testing
- Quota enforcement may block legitimate uploads — mitigated by configurable quotas and admin override

## Compliance

- All file operations enforce `workspace_id` isolation
- All endpoints use existing `JwtAuthGuard` + `WorkspaceGuard` + `PermissionsGuard`
- File operations logged to `audit_logs` table
- Schema changes follow Prisma migration conventions
- All new code follows DDD layering (domain → application → infrastructure → presentation)

## Related

- **Audit report:** `docs/audit/storage-current-state-audit.md`
- **Architecture design:** `docs/architecture/storage-platform-architecture.md`
- **Gap registry:** `docs/implementation/storage-gap-registry.md`
- **Prisma schema:** `prisma/schema.prisma`
- **Storage module:** `apps/api/src/modules/storage/`
- **Knowledge Factory:** `apps/api/src/modules/knowledge-factory/`

---

## Appendix: Current vs Target State

| Aspect            | Current                             | Target                      |
| ----------------- | ----------------------------------- | --------------------------- |
| MinIO clients     | 2 (Storage + KF)                    | 1 (Storage)                 |
| Metadata tables   | 2 (`files` + `knowledge_documents`) | 1 (`files`) + linked tables |
| Path strategy     | 2 different strategies              | 1 unified strategy          |
| Validation        | 1 (Storage only)                    | 1 (shared)                  |
| Versioning        | Schema only, no code                | Full implementation         |
| Quota             | None                                | Per-workspace               |
| Audit             | None                                | Every operation             |
| FK integrity      | 3 orphan references                 | All FK-constrained          |
| Asset management  | None                                | Dedicated service           |
| Attachment system | None                                | Polymorphic join            |

---

_End of ADR-021_
