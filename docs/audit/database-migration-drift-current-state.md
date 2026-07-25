# Database Migration Drift — Current State

- **Document ID:** XENNIC-DRIFT-CURRENT-STATE
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-DRIFT-RECONCILIATION-036

---

## 1. Executive Summary

11 Calculation Platform tables exist in both `prisma/schema.prisma` and the live database, but have **zero entries in the Prisma migration history**. This drift blocks all `prisma migrate dev` operations, including Phase 1D file versioning migration.

---

## 2. Migration History

8 migrations exist, none contain the drifted tables:

| #   | Migration                                         | Tables Created                                                                          |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | `20260602080333_init`                             | users, sessions, files, file_versions, calculations, calculation_templates, + 50 others |
| 2   | `20260617074611_knowledge_system_phase1`          | knowledge, knowledge_documents, knowledge_versions, + others                            |
| 3   | `20260617080956_add_knowledge_workspace_id`       | Column addition                                                                         |
| 4   | `20260618000000_add_search_text_fts`              | Column addition                                                                         |
| 5   | `20260705000000_add_event_outbox_and_process_log` | event_outbox, event_process_log                                                         |
| 6   | `20260707094543_add_provider_management_tables`   | ai_providers, ai_models, + others                                                       |
| 7   | `20260719141300_storage_phase1a_fk_foundation`    | FK additions only                                                                       |
| 8   | `20260719164100_storage_phase1b_project_files`    | project_files                                                                           |

**Result:** `calculation_audit`, `calculation_categories`, `calculation_certificates`, `calculation_definitions`, `calculation_plugins`, `calculation_results`, `calculation_versions`, `formula_definitions`, `formula_variables`, `unit_conversions`, `unit_definitions` — **zero migration coverage**.

---

## 3. Drift Detection Evidence

```
Drift detected: Your database schema is not in sync with your migration history.

[+] Added tables
  - calculation_audit
  - calculation_categories
  - calculation_certificates
  - calculation_definitions
  - calculation_plugins
  - calculation_results
  - calculation_versions
  - formula_definitions
  - formula_variables
  - unit_conversions
  - unit_definitions
```

---

## 4. Reconciliation Matrix

| Table                    | Schema | DB  | Migration History | Rows   | FKs                   | Indexes | Action              |
| ------------------------ | ------ | --- | ----------------- | ------ | --------------------- | ------- | ------------------- |
| calculation_categories   | YES    | YES | NO                | 0      | 1 (self)              | 2       | Baseline            |
| calculation_definitions  | YES    | YES | NO                | 0      | 1 (→categories)       | 2       | Baseline            |
| calculation_versions     | YES    | YES | NO                | 0      | 1 (→definitions)      | 3       | Baseline            |
| formula_definitions      | YES    | YES | NO                | 0      | 0                     | 2       | Baseline            |
| formula_variables        | YES    | YES | NO                | 0      | 2 (→formulas, →units) | 2       | Baseline            |
| unit_definitions         | YES    | YES | NO                | **75** | 0                     | 1       | Baseline (HAS DATA) |
| unit_conversions         | YES    | YES | NO                | 0      | 2 (→units)            | 3       | Baseline            |
| calculation_results      | YES    | YES | NO                | 0      | 0                     | 6       | Baseline            |
| calculation_certificates | YES    | YES | NO                | 0      | 0                     | 7       | Baseline            |
| calculation_audit        | YES    | YES | NO                | 0      | 0                     | 6       | Baseline            |
| calculation_plugins      | YES    | YES | NO                | 0      | 0                     | 2       | Baseline            |

---

## 5. FK Dependency Graph

```
unit_definitions (75 rows)
  ↑ formula_variables.unit_id
  ↑ unit_conversions.from_unit_id
  ↑ unit_conversions.to_unit_id

calculation_categories
  ↑ calculation_categories.parent_id (self-ref)
  ↑ calculation_definitions.category_id

calculation_definitions
  ↑ calculation_versions.definition_id

formula_definitions
  ↑ formula_variables.formula_id
```

---

## 6. Data Safety

| Table            | Rows   | Has Data? | Production Used?           | Rollback Safe?    |
| ---------------- | ------ | --------- | -------------------------- | ----------------- |
| unit_definitions | **75** | YES       | YES (formula_variables FK) | YES (can re-seed) |
| All others (10)  | 0      | NO        | YES (code references)      | YES (no data)     |

**Total drifted data:** 75 rows in `unit_definitions` only.

---

## 7. Root Cause

The 11 tables were created via `prisma db push` or direct SQL during Calculation Platform development. `db push` modifies the database directly without creating migration files, causing the migration history to diverge from the actual schema.

---

## 8. Change Log

| Date       | Author    | Change                               |
| ---------- | --------- | ------------------------------------ |
| 2026-07-25 | Order 036 | Initial drift current state document |

---

_End of Drift Current State_

---

## Order 037 Execution Results

**Date:** 2026-07-25
**Status:** RESOLVED

The 11-table calculation platform drift has been resolved via Option A baseline migration.

- Backup created and verified
- Baseline migration `20260725120000_calculation_platform_baseline` created (schema-only, no data operations)
- Migration marked as applied via `prisma migrate resolve`
- `prisma migrate status`: "Database schema is up to date!"
- All row counts preserved (unit_definitions = 75)
- Phase 1D migration generation is now UNBLOCKED
