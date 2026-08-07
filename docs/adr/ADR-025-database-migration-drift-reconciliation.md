# ADR-025: Database Migration Drift Reconciliation

- **ID:** ADR-025
- **Title:** Database Migration Drift Reconciliation
- **Status:** PROPOSED
- **Date:** 2026-07-25
- **Decision makers:** Chief Executive AI — Xennic Platform
- **Related:** ADR-020, Order 036, Phase 1D
- **Supersedes:** N/A

---

## Context

Xennic uses Prisma ORM with a migration-based workflow. 11 Calculation Platform tables were created outside the Prisma migration system (via `prisma db push` or direct SQL), causing the database schema to diverge from the migration history.

This drift blocks all `prisma migrate dev` operations, including Phase 1D file versioning migration.

**Drifted tables:**

- calculation_audit, calculation_categories, calculation_certificates
- calculation_definitions, calculation_plugins, calculation_results
- calculation_versions, formula_definitions, formula_variables
- unit_conversions, unit_definitions

**Current state:**

- All 11 tables exist in `prisma/schema.prisma`
- All 11 tables exist in the database
- Zero of 11 tables appear in any migration file
- `unit_definitions` has 75 rows; all others are empty
- All 11 tables are actively used by `apps/api/src/modules/calculation-platform/`

---

## Decision

Use **migration baseline** pattern to reconcile drift.

### Specific Decisions

| #   | Decision                           | Rationale                                          |
| --- | ---------------------------------- | -------------------------------------------------- |
| D1  | Create single baseline migration   | Simpler than 11 individual migrations              |
| D2  | Filter to only drifted tables      | Prevents including unrelated schema changes        |
| D3  | Insert `_prisma_migrations` record | Marks migration as already applied                 |
| D4  | Preserve all existing data         | Zero data loss; 75 unit_definitions rows preserved |
| D5  | Test on local before production    | Validates reconciliation approach                  |

---

## Alternatives Considered

### Option A: Migration Baseline (RECOMMENDED)

**Description:** Create a single baseline migration capturing all 11 tables, mark as applied.

**Pros:** Clean history; standard pattern; unblocks Phase 1D immediately
**Cons:** Requires manual `_prisma_migrations` insert

### Option B: Independent Domain Migrations

**Description:** Create separate migrations for calculation, formula, and unit domains.

**Pros:** Granular history
**Cons:** More complex; still requires manual inserts

### Option C: Remove Unused Models

**Description:** Remove drifted models from schema.prisma.

**Pros:** Eliminates drift
**Cons:** Breaks calculation-platform module; loses 75 rows

### Option D: prisma db push

**Description:** Use `db push` to sync schema.

**Pros:** Quick
**Cons:** Does not create migration records; drift persists; does not unblock `migrate dev`

**Decision:** REJECTED

---

## Consequences

### Positive

- Phase 1D unblocked
- Clean Prisma migration history restored
- Future migrations work normally
- Calculation Platform tables properly tracked

### Negative

- Requires manual `_prisma_migrations` insert (one-time)
- Baseline migration is large (11 tables)

### Neutral

- No data changes
- No code changes
- No service disruption

---

## Implementation Sequence

1. Backup (DONE)
2. Generate migration diff
3. Filter to 11 calculation tables
4. Create migration directory
5. Insert migration record
6. Verify with `prisma migrate status`
7. Verify with `prisma generate`
8. Verify with `pnpm typecheck`
9. Verify data preservation
10. Test Phase 1D migration generation

---

## Risk Assessment

| Severity | Count | Notes                                                     |
| -------- | ----- | --------------------------------------------------------- |
| CRITICAL | 1     | R1: Phase 1D blocked (resolved by this ADR)               |
| HIGH     | 2     | R2: data loss (mitigated by backup), R4: production drift |
| MEDIUM   | 3     | Code, deployment, schema risks                            |

---

## Acceptance Criteria

1. `pnpm prisma migrate status` shows "up to date"
2. `pnpm prisma migrate dev --name test` succeeds
3. All 75 unit_definitions rows preserved
4. `pnpm typecheck` passes
5. Phase 1D migration can be generated

---

## Change Log

| Date       | Author    | Change      |
| ---------- | --------- | ----------- |
| 2026-07-25 | Order 036 | Initial ADR |

---

_End of ADR-025_

---

## Decision Outcome — RESOLVED

**Date Resolved:** 2026-07-25

**Option A (Migration Baseline) was executed and succeeded.**

- 11 tables captured via `pg_dump --schema-only`
- Baseline migration: `20260725120000_calculation_platform_baseline`
- Migration marked as applied: `prisma migrate resolve --applied`
- Post-reconciliation: `prisma migrate status` → "Database schema is up to date!"
- Data preserved: 75 rows in `unit_definitions`
- Phase 1D: UNBLOCKED

**Reversibility:** Possible — remove migration record via SQL delete from `_prisma_migrations` table if needed.
