# Database Migration Reconciliation — Architecture

- **Document ID:** XENNIC-DRIFT-RECONCILIATION-ARCH
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Status:** PROPOSED
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-DRIFT-RECONCILIATION-036

---

## 1. Problem

11 Calculation Platform tables exist in DB and schema.prisma but not in migration history. This blocks `prisma migrate dev` for all future migrations, including Phase 1D.

---

## 2. Reconciliation Options

### Option A: Migration Baseline

**Approach:** Create a single baseline migration that captures the current state of all 11 tables, then mark it as already applied.

**How:**

1. Use `prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-empty` to generate DDL
2. Create migration directory with the DDL
3. Insert record into `_prisma_migrations` with status `Applied`

| Criterion           | Assessment                                                            |
| ------------------- | --------------------------------------------------------------------- |
| Pros                | Clean Prisma history; future migrations work                          |
| Cons                | Requires manual `_prisma_migrations` insert (prohibited in Order 036) |
| Data Risk           | NONE — no data changes                                                |
| Prisma Risk         | LOW — standard baseline pattern                                       |
| Production Risk     | LOW — no production impact                                            |
| Rollback            | Remove migration dir + \_prisma_migrations row                        |
| Downtime            | ZERO                                                                  |
| Phase 1D Dependency | Unblocks immediately                                                  |

### Option B: Independent Domain Migrations

**Approach:** Create separate migration files for each domain group (calculation, formula, unit).

| Criterion           | Assessment                                               |
| ------------------- | -------------------------------------------------------- |
| Pros                | Granular history per domain                              |
| Cons                | More complex; still requires `_prisma_migrations` insert |
| Data Risk           | NONE                                                     |
| Prisma Risk         | LOW                                                      |
| Production Risk     | LOW                                                      |
| Rollback            | Remove individual migration dirs                         |
| Downtime            | ZERO                                                     |
| Phase 1D Dependency | Unblocks immediately                                     |

### Option C: Remove Unused Models

**Approach:** If calculation tables are unused, remove them from schema.prisma.

| Criterion           | Assessment                                                       |
| ------------------- | ---------------------------------------------------------------- |
| Pros                | Eliminates drift entirely                                        |
| Cons                | Tables ARE used by code; would break calculation-platform module |
| Data Risk           | HIGH — 75 rows in unit_definitions would be orphaned             |
| Prisma Risk         | HIGH — removes code references                                   |
| Production Risk     | HIGH — breaks calculation-platform API                           |
| Rollback            | Re-add models + re-create tables                                 |
| Downtime            | YES — API breakage                                               |
| Phase 1D Dependency | Unblocks but breaks other modules                                |

### Option D: prisma db push

**Approach:** Use `prisma db push` to sync schema without migration tracking.

| Criterion           | Assessment                                                          |
| ------------------- | ------------------------------------------------------------------- |
| Pros                | Quick fix                                                           |
| Cons                | **Does not create migration records** — drift persists conceptually |
| Data Risk           | LOW (additive only)                                                 |
| Prisma Risk         | **HIGH** — bypasses migration system entirely                       |
| Production Risk     | MEDIUM — no migration trail                                         |
| Rollback            | Manual SQL only                                                     |
| Downtime            | ZERO                                                                |
| Phase 1D Dependency | **Does NOT unblock** — `migrate dev` still fails                    |

**Decision:** REJECTED — does not solve the root problem.

---

## 3. Recommended Option

**Option A: Migration Baseline**

Rationale:

- Simplest approach
- Standard Prisma pattern for drift recovery
- Zero data risk (all tables empty except unit_definitions which is preserved)
- Immediately unblocks Phase 1D
- Clean audit trail

---

## 4. Implementation Plan

### Step 1: Generate baseline DDL

```bash
pnpm prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script > /tmp/baseline.sql
```

### Step 2: Filter to only drifted tables

Extract only the 11 calculation tables from the diff.

### Step 3: Create migration directory

```
prisma/migrations/20260725000000_calculation_platform_baseline/migration.sql
```

### Step 4: Insert migration record

```sql
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (uuid(), '...', NOW(), '20260725000000_calculation_platform_baseline', NULL, NULL, NOW(), 1);
```

### Step 5: Verify

```bash
pnpm prisma migrate status  # Should show: "Database schema is up to date!"
pnpm prisma migrate dev --name test_migration  # Should succeed
```

---

## 5. Change Log

| Date       | Author    | Change                              |
| ---------- | --------- | ----------------------------------- |
| 2026-07-25 | Order 036 | Initial reconciliation architecture |

---

_End of Reconciliation Architecture_

---

## Order 037 Execution Results

**Selected Option:** A — Migration Baseline (as recommended)
**Status:** SUCCESS

**Execution Summary:**

- Schema-only pg_dump of 11 tables captured
- Baseline SQL contains: 11 CREATE TABLE, 17 CREATE INDEX, 12 ADD CONSTRAINT, 11 PRIMARY KEY
- Zero data operations (no INSERT INTO, COPY, DELETE, TRUNCATE)
- Migration registered via `prisma migrate resolve --applied`
- Prisma status: "Database schema is up to date!"

**Risk R17 (Baseline too large):** MITIGATED — 562-line SQL, purely additive
**Risk R18 (Data loss):** MITIGATED — 75 unit_definitions rows preserved

**Next Step:** Execute Phase 1D migration generation
