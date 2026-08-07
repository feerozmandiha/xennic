# Database Drift — Risk Register

- **Document ID:** XENNIC-DRIFT-RISK-REGISTER
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-DRIFT-RECONCILIATION-036

---

## 1. Risk Assessment

### R1: Phase 1D Migration Blocked

| Field         | Value                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------- |
| ID            | R1                                                                                       |
| Category      | Operational                                                                              |
| Description   | Drift prevents `prisma migrate dev` — Phase 1D file versioning cannot generate migration |
| Severity      | **CRITICAL**                                                                             |
| Probability   | **HIGH**                                                                                 |
| Impact        | Blocks all new schema migrations until resolved                                          |
| Mitigation    | Reconciliation baseline migration                                                        |
| Residual Risk | LOW (after reconciliation)                                                               |
| Status        | OPEN                                                                                     |

### R2: Data Loss During Reconciliation

| Field         | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| ID            | R2                                                              |
| Category      | Data                                                            |
| Description   | 75 rows in unit_definitions could be lost during reconciliation |
| Severity      | HIGH                                                            |
| Probability   | LOW                                                             |
| Impact        | Unit definitions lost; formula_variables FKs broken             |
| Mitigation    | Backup before reconciliation; preserve existing data            |
| Residual Risk | LOW (backup verified)                                           |
| Status        | MITIGATED (backup exists)                                       |

### R3: Prisma Client Regeneration Breaks Code

| Field         | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| ID            | R3                                                              |
| Category      | Code                                                            |
| Description   | After reconciliation, `prisma generate` may change client types |
| Severity      | MEDIUM                                                          |
| Probability   | LOW                                                             |
| Impact        | TypeScript compilation errors                                   |
| Mitigation    | Verify `pnpm typecheck` after generate                          |
| Residual Risk | LOW                                                             |
| Status        | MITIGATED                                                       |

### R4: Production Schema Drift

| Field         | Value                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------- |
| ID            | R4                                                                                             |
| Category      | Deployment                                                                                     |
| Description   | Production may have different drift state than local                                           |
| Severity      | HIGH                                                                                           |
| Probability   | MEDIUM                                                                                         |
| Impact        | Migration may fail on production                                                               |
| Mitigation    | Reconciliation must be tested on local first; production migration via `prisma migrate deploy` |
| Residual Risk | MEDIUM                                                                                         |
| Status        | OPEN                                                                                           |

### R5: Concurrent Migration During Reconciliation

| Field         | Value                                                     |
| ------------- | --------------------------------------------------------- |
| ID            | R5                                                        |
| Category      | Operational                                               |
| Description   | Other developers may run migrations during reconciliation |
| Severity      | MEDIUM                                                    |
| Probability   | LOW                                                       |
| Impact        | Conflicting migration state                               |
| Mitigation    | Coordinate via engineering order; single executor         |
| Residual Risk | LOW                                                       |
| Status        | MITIGATED                                                 |

### R6: Baseline Migration Includes Unwanted Tables

| Field         | Value                                                              |
| ------------- | ------------------------------------------------------------------ |
| ID            | R6                                                                 |
| Category      | Schema                                                             |
| Description   | Migration diff may include tables beyond the 11 calculation tables |
| Severity      | MEDIUM                                                             |
| Probability   | MEDIUM                                                             |
| Impact        | Unexpected schema changes in migration                             |
| Mitigation    | Manually filter migration SQL to only 11 calculation tables        |
| Residual Risk | LOW                                                                |
| Status        | MITIGATED                                                          |

---

## 2. Risk Matrix

|              | LOW Prob | MEDIUM Prob | HIGH Prob |
| ------------ | -------- | ----------- | --------- |
| **CRITICAL** | —        | —           | R1        |
| **HIGH**     | R2       | R4          | —         |
| **MEDIUM**   | R3, R5   | R6          | —         |
| **LOW**      | —        | —           | —         |

---

## 3. Summary

| Severity  | Count | Mitigated | Open   |
| --------- | ----- | --------- | ------ |
| CRITICAL  | 1     | 0         | 1 (R1) |
| HIGH      | 2     | 1         | 1 (R4) |
| MEDIUM    | 3     | 2         | 0      |
| **Total** | **6** | **3**     | **2**  |

---

## 4. Change Log

| Date       | Author    | Change                      |
| ---------- | --------- | --------------------------- |
| 2026-07-25 | Order 036 | Initial drift risk register |

---

_End of Risk Register_

---

## Order 037 Risk Resolution

| Risk                                     | Status               | Evidence                                |
| ---------------------------------------- | -------------------- | --------------------------------------- |
| R1: Data loss from migration reset       | MITIGATED            | No reset executed; backup verified      |
| R2: Phase 1D blocked by unresolved drift | RESOLVED             | Drift resolved; status = "up to date"   |
| R3: Inconsistent migration history       | RESOLVED             | Baseline marks all 11 tables as applied |
| R4: Schema drift in production           | NOT YET INVESTIGATED | Production state unknown                |
| R5: Calculation Platform code breaks     | MITIGATED            | Zero DDL changes to existing objects    |
| R6: Seed data lost                       | MITIGATED            | unit_definitions = 75 rows preserved    |

**Open Risks:** R4 (production drift investigation deferred)
