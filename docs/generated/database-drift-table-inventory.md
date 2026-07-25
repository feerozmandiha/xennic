# Database Drift — Table Inventory

- **Document ID:** XENNIC-DRIFT-TABLE-INVENTORY
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-DRIFT-RECONCILIATION-036

---

## 1. Complete Table Inventory

### 1.1 calculation_categories

| Property          | Value                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| Schema            | YES (line 2331)                                                                      |
| Database          | YES                                                                                  |
| Migration History | NO                                                                                   |
| Rows              | 0                                                                                    |
| Columns           | id, name, slug, description, parent_id, icon, sort_order, created_at, updated_at (9) |
| PK                | id                                                                                   |
| Unique            | slug                                                                                 |
| FKs               | parent_id → self (SET NULL)                                                          |
| Indexes           | pkey, slug_key                                                                       |
| Code References   | prisma-calculation.repository.ts (6 refs)                                            |
| Domain            | Calculation Platform — Category taxonomy                                             |

### 1.2 calculation_definitions

| Property          | Value                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Schema            | YES (line 2347)                                                                                                                          |
| Database          | YES                                                                                                                                      |
| Migration History | NO                                                                                                                                       |
| Rows              | 0                                                                                                                                        |
| Columns           | id, category_id, slug, name, description, standard, standard_ref, enabled, ai_review, certificate, metadata, created_at, updated_at (13) |
| PK                | id                                                                                                                                       |
| Unique            | slug                                                                                                                                     |
| FKs               | category_id → calculation_categories (RESTRICT)                                                                                          |
| Indexes           | pkey, slug_key                                                                                                                           |
| Code References   | prisma-calculation.repository.ts (10 refs)                                                                                               |
| Domain            | Calculation Platform — Formula definitions                                                                                               |

### 1.3 calculation_versions

| Property          | Value                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Schema            | YES (line 2366)                                                                                          |
| Database          | YES                                                                                                      |
| Migration History | NO                                                                                                       |
| Rows              | 0                                                                                                        |
| Columns           | id, definition_id, version, status, dsl_definition, change_log, published_at, created_by, created_at (9) |
| PK                | id                                                                                                       |
| FKs               | definition_id → calculation_definitions (RESTRICT)                                                       |
| Indexes           | pkey, definition_id_idx, status_idx                                                                      |
| Code References   | prisma-calculation.repository.ts (5 refs)                                                                |
| Domain            | Calculation Platform — Version control                                                                   |

### 1.4 formula_definitions

| Property          | Value                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Schema            | YES (line 2383)                                                                                                  |
| Database          | YES                                                                                                              |
| Migration History | NO                                                                                                               |
| Rows              | 0                                                                                                                |
| Columns           | id, definition_id, version_id, name, expression, description, return_type, metadata, created_at, updated_at (10) |
| PK                | id                                                                                                               |
| FKs               | None                                                                                                             |
| Indexes           | pkey, definition_id_idx                                                                                          |
| Code References   | prisma-calculation.repository.ts (5 refs)                                                                        |
| Domain            | Calculation Platform — Formula expressions                                                                       |

### 1.5 formula_variables

| Property          | Value                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Schema            | YES (line 2400)                                                                                                                                  |
| Database          | YES                                                                                                                                              |
| Migration History | NO                                                                                                                                               |
| Rows              | 0                                                                                                                                                |
| Columns           | id, formula_id, name, label, type, unit_id, required, default_value, min_value, max_value, enum_values, description, sort_order, created_at (14) |
| PK                | id                                                                                                                                               |
| FKs               | formula_id → formula_definitions (RESTRICT), unit_id → unit_definitions (SET NULL)                                                               |
| Indexes           | pkey, formula_id_idx                                                                                                                             |
| Code References   | prisma-calculation.repository.ts (4 refs)                                                                                                        |
| Domain            | Calculation Platform — Variable definitions                                                                                                      |

### 1.6 unit_definitions

| Property          | Value                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- |
| Schema            | YES (line 2422)                                                                    |
| Database          | YES                                                                                |
| Migration History | NO                                                                                 |
| Rows              | **75**                                                                             |
| Columns           | id, category, name, symbol, base_unit, factor, offset, description, created_at (9) |
| PK                | id                                                                                 |
| FKs               | None                                                                               |
| Indexes           | pkey                                                                               |
| Code References   | formula_variables.unit_id, unit_conversions.from/to_unit_id                        |
| Domain            | Calculation Platform — Unit of measurement                                         |
| **DATA RISK**     | **75 rows — seed data must be preserved**                                          |

### 1.7 unit_conversions

| Property          | Value                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| Schema            | YES (line 2438)                                                                      |
| Database          | YES                                                                                  |
| Migration History | NO                                                                                   |
| Rows              | 0                                                                                    |
| Columns           | id, from_unit_id, to_unit_id, factor, offset, formula, created_at (7)                |
| PK                | id                                                                                   |
| FKs               | from_unit_id → unit_definitions (RESTRICT), to_unit_id → unit_definitions (RESTRICT) |
| Indexes           | pkey, from_unit_id_idx, to_unit_id_idx                                               |
| Code References   | None direct (used via formula_variables)                                             |
| Domain            | Calculation Platform — Unit conversion rules                                         |

### 1.8 calculation_results

| Property          | Value                                                                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema            | YES (line 2454)                                                                                                                                                                                |
| Database          | YES                                                                                                                                                                                            |
| Migration History | NO                                                                                                                                                                                             |
| Rows              | 0                                                                                                                                                                                              |
| Columns           | id, workspace_id, definition_id, version_id, user_id, inputs, outputs, status, error_message, engine_version, duration_ms, ai_review, confidence, correlation_id, executed_at, created_at (16) |
| PK                | id                                                                                                                                                                                             |
| FKs               | None                                                                                                                                                                                           |
| Indexes           | pkey, definition_id_idx, executed_at_idx, status_idx, user_id_idx, workspace_id_idx                                                                                                            |
| Code References   | prisma-result.repository.ts (5 refs)                                                                                                                                                           |
| Domain            | Calculation Platform — Execution results                                                                                                                                                       |

### 1.9 calculation_certificates

| Property          | Value                                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema            | YES (line 2479)                                                                                                                                                            |
| Database          | YES                                                                                                                                                                        |
| Migration History | NO                                                                                                                                                                         |
| Rows              | 0                                                                                                                                                                          |
| Columns           | id, result_id, certificate_id, calculation_hash, input_hash, formula_version, standard_version, ai_provider, confidence, operator, workspace_id, status, generated_at (13) |
| PK                | id                                                                                                                                                                         |
| FKs               | None                                                                                                                                                                       |
| Indexes           | pkey, certificate_id_idx/key, result_id_idx/key, status_idx, workspace_id_idx                                                                                              |
| Code References   | prisma-certificate.repository.ts (5 refs)                                                                                                                                  |
| Domain            | Calculation Platform — Audit certificates                                                                                                                                  |

### 1.10 calculation_audit

| Property          | Value                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema            | YES (line 2500)                                                                                                                                                                       |
| Database          | YES                                                                                                                                                                                   |
| Migration History | NO                                                                                                                                                                                    |
| Rows              | 0                                                                                                                                                                                     |
| Columns           | id, workspace_id, user_id, action, entity_type, entity_id, inputs, outputs, formula_version, ai_response, execution_path, error_message, duration_ms, correlation_id, created_at (15) |
| PK                | id                                                                                                                                                                                    |
| FKs               | None                                                                                                                                                                                  |
| Indexes           | pkey, action_idx, created_at_idx, entity_type_idx, user_id_idx, workspace_id_idx                                                                                                      |
| Code References   | prisma-audit.repository.ts (4 refs)                                                                                                                                                   |
| Domain            | Calculation Platform — Audit trail                                                                                                                                                    |

### 1.11 calculation_plugins

| Property          | Value                                                                             |
| ----------------- | --------------------------------------------------------------------------------- |
| Schema            | YES (line 2524)                                                                   |
| Database          | YES                                                                               |
| Migration History | NO                                                                                |
| Rows              | 0                                                                                 |
| Columns           | id, slug, name, description, version, enabled, config, created_at, updated_at (9) |
| PK                | id                                                                                |
| Unique            | slug                                                                              |
| FKs               | None                                                                              |
| Indexes           | pkey, slug_key                                                                    |
| Code References   | prisma-plugin.repository.ts (5 refs)                                              |
| Domain            | Calculation Platform — Plugin registry                                            |

---

## 2. Summary

| Metric                 | Value                         |
| ---------------------- | ----------------------------- |
| Total drifted tables   | 11                            |
| Tables with data       | 1 (unit_definitions: 75 rows) |
| Tables with FKs        | 6                             |
| Total FK constraints   | 7                             |
| Total indexes          | 40+                           |
| Active code references | YES (all 11 tables)           |
| Migration-safe         | YES (additive baseline)       |

---

## 3. Change Log

| Date       | Author    | Change                  |
| ---------- | --------- | ----------------------- |
| 2026-07-25 | Order 036 | Initial table inventory |

---

_End of Table Inventory_

---

## Order 037 Execution Results

**Resolution Status:** ALL 11 TABLES RESOLVED

Each table now has:

- Prisma schema: ✅
- Database table: ✅
- Migration history: ✅ (via `20260725120000_calculation_platform_baseline`)
- Drift status: **RESOLVED**

No further drift reconciliation required for Calculation Platform tables.
