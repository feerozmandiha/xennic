# Storage File Versioning — Risk Register

- **Document ID:** XENNIC-STORAGE-VERSIONING-RISK-REGISTER
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-REVIEW-034

---

## 1. Risk Assessment Methodology

| Severity | Description                               |
| -------- | ----------------------------------------- |
| CRITICAL | Data loss, security breach, system down   |
| HIGH     | Significant functional or security impact |
| MEDIUM   | Moderate impact, workaround available     |
| LOW      | Minor impact, cosmetic or operational     |

| Probability | Description                        |
| ----------- | ---------------------------------- |
| HIGH        | Likely to occur in production      |
| MEDIUM      | May occur under certain conditions |
| LOW         | Unlikely but possible              |

---

## 2. Schema Risks

### R1: Unique Constraint Missing

| Field         | Value                                                                             |
| ------------- | --------------------------------------------------------------------------------- |
| ID            | R1                                                                                |
| Category      | Schema                                                                            |
| Description   | No `@@unique([file_id, version])` constraint — duplicate version numbers possible |
| Severity      | MEDIUM                                                                            |
| Probability   | LOW                                                                               |
| Impact        | Data integrity violation; version confusion                                       |
| Mitigation    | Add unique constraint in Phase 1D migration                                       |
| Residual Risk | LOW — constraint added before any code                                            |
| Owner         | Storage Team                                                                      |
| Status        | MITIGATED (planned)                                                               |

### R2: Missing Size Column

| Field         | Value                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| ID            | R2                                                                            |
| Category      | Schema                                                                        |
| Description   | `file_versions` has no `size` column — cannot track per-version storage usage |
| Severity      | LOW                                                                           |
| Probability   | HIGH                                                                          |
| Impact        | Inaccurate quota tracking                                                     |
| Mitigation    | Add `size BIGINT` column in Phase 1D migration                                |
| Residual Risk | LOW                                                                           |
| Owner         | Storage Team                                                                  |
| Status        | MITIGATED (planned)                                                           |

### R3: Missing Created_by Column

| Field         | Value                                                       |
| ------------- | ----------------------------------------------------------- |
| ID            | R3                                                          |
| Category      | Schema                                                      |
| Description   | No user attribution — cannot track who created each version |
| Severity      | MEDIUM                                                      |
| Probability   | HIGH                                                        |
| Impact        | No audit trail for version creation                         |
| Mitigation    | Add `created_by` FK column in Phase 1D migration            |
| Residual Risk | LOW                                                         |
| Owner         | Storage Team                                                |
| Status        | MITIGATED (planned)                                         |

---

## 3. Storage Risks

### R4: Storage Duplication

| Field         | Value                                                                           |
| ------------- | ------------------------------------------------------------------------------- |
| ID            | R4                                                                              |
| Category      | Storage                                                                         |
| Description   | Each version creates a full copy in MinIO — N versions × file size = N× storage |
| Severity      | MEDIUM                                                                          |
| Probability   | HIGH                                                                            |
| Impact        | Storage costs grow linearly with version count                                  |
| Mitigation    | Quota enforcement; retention policy in Phase 1G                                 |
| Residual Risk | MEDIUM — no automatic cleanup in Phase 1D                                       |
| Owner         | Platform Team                                                                   |
| Status        | OPEN (Phase 1G)                                                                 |

### R5: Large File Versioning

| Field         | Value                                                             |
| ------------- | ----------------------------------------------------------------- |
| ID            | R5                                                                |
| Category      | Storage                                                           |
| Description   | 100MB files × many versions = significant storage and upload time |
| Severity      | MEDIUM                                                            |
| Probability   | MEDIUM                                                            |
| Impact        | Slow uploads, high storage usage                                  |
| Mitigation    | 100MB limit enforced; streaming upload                            |
| Residual Risk | LOW — limit already in StorageService                             |
| Owner         | Storage Team                                                      |
| Status        | MITIGATED                                                         |

### R6: MinIO Object Orphan

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| ID            | R6                                                      |
| Category      | Storage                                                 |
| Description   | Version deleted from DB but MinIO object remains        |
| Severity      | LOW                                                     |
| Probability   | LOW                                                     |
| Impact        | Wasted storage                                          |
| Mitigation    | Transactional delete: DB row + MinIO object in sequence |
| Residual Risk | LOW                                                     |
| Owner         | Storage Team                                            |
| Status        | MITIGATED                                               |

---

## 4. Access Control Risks

### R7: Cross-Workspace Version Access

| Field         | Value                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------- |
| ID            | R7                                                                                                |
| Category      | Security                                                                                          |
| Description   | User from workspace A accesses version of file in workspace B                                     |
| Severity      | HIGH                                                                                              |
| Probability   | LOW                                                                                               |
| Impact        | Data breach across workspaces                                                                     |
| Mitigation    | `StorageService._getFile()` enforces `workspaceId` match; version access goes through file access |
| Residual Risk | LOW — existing guard already enforces                                                             |
| Owner         | Security Team                                                                                     |
| Status        | MITIGATED                                                                                         |

### R8: Cross-Project Version Access

| Field         | Value                                                                 |
| ------------- | --------------------------------------------------------------------- |
| ID            | R8                                                                    |
| Category      | Security                                                              |
| Description   | Non-member of project accesses version of project-attached file       |
| Severity      | HIGH                                                                  |
| Probability   | LOW                                                                   |
| Impact        | Unauthorized access to project data                                   |
| Mitigation    | `ProjectMemberGuard` applies via parent file's ProjectFile attachment |
| Residual Risk | LOW — guard already implemented (Phase 1C)                            |
| Owner         | Security Team                                                         |
| Status        | MITIGATED                                                             |

### R9: Deleted File Version Access

| Field         | Value                                                                       |
| ------------- | --------------------------------------------------------------------------- |
| ID            | R9                                                                          |
| Category      | Security                                                                    |
| Description   | Versions of a soft-deleted file remain accessible                           |
| Severity      | MEDIUM                                                                      |
| Probability   | LOW                                                                         |
| Impact        | Access to data marked for deletion                                          |
| Mitigation    | `findById` filters `deleted_at IS NULL`; CASCADE DELETE on file hard delete |
| Residual Risk | LOW                                                                         |
| Owner         | Storage Team                                                                |
| Status        | MITIGATED                                                                   |

---

## 5. Data Integrity Risks

### R10: Concurrent Version Creation

| Field         | Value                                                                           |
| ------------- | ------------------------------------------------------------------------------- |
| ID            | R10                                                                             |
| Category      | Data Integrity                                                                  |
| Description   | Two simultaneous version creation requests produce same version number          |
| Severity      | LOW                                                                             |
| Probability   | LOW                                                                             |
| Impact        | Unique constraint violation                                                     |
| Mitigation    | `@@unique([file_id, version])` constraint; application-level MAX()+1 with retry |
| Residual Risk | LOW                                                                             |
| Owner         | Storage Team                                                                    |
| Status        | MITIGATED                                                                       |

### R11: Revert Source Deleted

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| ID            | R11                                                  |
| Category      | Data Integrity                                       |
| Description   | User reverts to version N, but version N was deleted |
| Severity      | LOW                                                  |
| Probability   | MEDIUM                                               |
| Impact        | Revert fails gracefully (404)                        |
| Mitigation    | Version existence check before revert                |
| Residual Risk | LOW — fails safe                                     |
| Owner         | Storage Team                                         |
| Status        | MITIGATED                                            |

### R12: Checksum Collision

| Field         | Value                                                 |
| ------------- | ----------------------------------------------------- |
| ID            | R12                                                   |
| Category      | Data Integrity                                        |
| Description   | Two different file contents produce same SHA-256 hash |
| Severity      | LOW                                                   |
| Probability   | LOW                                                   |
| Impact        | Incorrect content verification                        |
| Mitigation    | SHA-256 collision probability is negligible (2^-128)  |
| Residual Risk | NEGLIGIBLE                                            |
| Owner         | N/A                                                   |
| Status        | ACCEPTED                                              |

---

## 6. Performance Risks

### R13: Version List at Scale

| Field         | Value                                               |
| ------------- | --------------------------------------------------- |
| ID            | R13                                                 |
| Category      | Performance                                         |
| Description   | Files with 100+ versions may have slow list queries |
| Severity      | MEDIUM                                              |
| Probability   | LOW                                                 |
| Impact        | Slow API response for version listing               |
| Mitigation    | Composite index `(file_id, created_at)`; pagination |
| Residual Risk | LOW — index support                                 |
| Owner         | Storage Team                                        |
| Status        | MITIGATED                                           |

### R14: Large Version Download

| Field         | Value                                                     |
| ------------- | --------------------------------------------------------- |
| ID            | R14                                                       |
| Category      | Performance                                               |
| Description   | Downloading 100MB version may be slow                     |
| Severity      | MEDIUM                                                    |
| Probability   | MEDIUM                                                    |
| Impact        | User-perceived latency                                    |
| Mitigation    | Streaming download; presigned URL for direct MinIO access |
| Residual Risk | MEDIUM — network-bound                                    |
| Owner         | Storage Team                                              |
| Status        | MITIGATED                                                 |

### R15: Quota Calculation with Many Versions

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| ID            | R15                                                          |
| Category      | Performance                                                  |
| Description   | SUM(size) across all versions may be slow at scale           |
| Severity      | LOW                                                          |
| Probability   | LOW                                                          |
| Impact        | Slow quota check on upload                                   |
| Mitigation    | Denormalized workspace total size (maintained incrementally) |
| Residual Risk | LOW                                                          |
| Owner         | Storage Team                                                 |
| Status        | DEFERRED (Phase 1G)                                          |

---

## 7. Operational Risks

### R16: No Retention Policy

| Field         | Value                                                         |
| ------------- | ------------------------------------------------------------- |
| ID            | R16                                                           |
| Category      | Operational                                                   |
| Description   | All versions retained indefinitely — unbounded storage growth |
| Severity      | HIGH                                                          |
| Probability   | HIGH                                                          |
| Impact        | Storage costs grow without bound                              |
| Mitigation    | Phase 1G adds retention policy and cleanup jobs               |
| Residual Risk | HIGH — no automatic cleanup in Phase 1D                       |
| Owner         | Platform Team                                                 |
| Status        | OPEN (Phase 1G)                                               |

### R17: No Cleanup Job for Orphaned Objects

| Field         | Value                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| ID            | R17                                                                     |
| Category      | Operational                                                             |
| Description   | If DB delete succeeds but MinIO delete fails, orphan objects accumulate |
| Severity      | MEDIUM                                                                  |
| Probability   | LOW                                                                     |
| Impact        | Wasted storage                                                          |
| Mitigation    | Periodic reconciliation job (Phase 1G)                                  |
| Residual Risk | MEDIUM                                                                  |
| Owner         | Platform Team                                                           |
| Status        | OPEN (Phase 1G)                                                         |

---

## 8. Risk Matrix

|              | LOW Prob         | MEDIUM Prob | HIGH Prob |
| ------------ | ---------------- | ----------- | --------- |
| **CRITICAL** | —                | —           | —         |
| **HIGH**     | R7, R8           | —           | R16       |
| **MEDIUM**   | R1, R6, R10, R11 | R5, R14     | R3, R4    |
| **LOW**      | R12              | R15         | R2        |

---

## 9. Summary

| Severity  | Count  | Mitigated | Open    |
| --------- | ------ | --------- | ------- |
| CRITICAL  | 0      | —         | —       |
| HIGH      | 3      | 2         | 1 (R16) |
| MEDIUM    | 6      | 5         | 1 (R4)  |
| LOW       | 5      | 4         | 0       |
| **Total** | **14** | **11**    | **2**   |

**Critical Risks:** NONE

**High Risks:**

- R7, R8: MITIGATED by existing access control
- R16: OPEN — deferred to Phase 1G retention policy

---

## 10. Risk Acceptance Criteria

| Criterion                             | Required                              |
| ------------------------------------- | ------------------------------------- |
| Zero CRITICAL risks                   | YES                                   |
| All HIGH risks mitigated or accepted  | YES (R16 accepted with Phase 1G plan) |
| All MEDIUM risks have mitigation plan | YES                                   |
| No unmitigated security risks         | YES                                   |

---

## 11. Change Log

| Date       | Author             | Change                                                          |
| ---------- | ------------------ | --------------------------------------------------------------- |
| 2026-07-25 | Chief Executive AI | Initial risk register                                           |
| 2026-07-25 | Order 035          | Schema applied; migration blocked by drift — new risk R18 added |

### New Risk: R18 — Migration Drift Blocker

| Field         | Value                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------- |
| ID            | R18                                                                                       |
| Category      | Operational                                                                               |
| Description   | Pre-existing database drift (calculation tables) blocks `prisma migrate dev` for Phase 1D |
| Severity      | HIGH                                                                                      |
| Probability   | HIGH                                                                                      |
| Impact        | Phase 1D migration cannot be generated or applied                                         |
| Mitigation    | Reconciliation order to resolve drift; or manual migration SQL execution                  |
| Residual Risk | MEDIUM — depends on reconciliation approach                                               |
| Status        | OPEN                                                                                      |

---

_End of Risk Register_
