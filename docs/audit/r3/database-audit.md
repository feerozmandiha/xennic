# Database Audit — Sprint R3.0

**Date:** 2026-07-18

## Summary: ⚠️ CONDITIONAL PASS

## Schema Statistics

| Metric                        | Count                          |
| ----------------------------- | ------------------------------ |
| Models                        | 132                            |
| Enums                         | 0 (all use String)             |
| Fields (approx)               | ~1,467                         |
| Relations (@relation)         | 123                            |
| Indexes (@@index)             | 289                            |
| Unique constraints (@@unique) | 22 composite + ~35 field-level |
| workspace_id references       | 131 (multi-tenant)             |
| Soft delete (deleted_at)      | 19 models                      |
| UUID primary keys             | 132/132 (100%)                 |

## Migrations

6 migrations, sequential timestamps (June–July 2026), no gaps:

1. `20260602080333_init`
2. `20260617074611_knowledge_system_phase1`
3. `20260617080956_add_knowledge_workspace_id`
4. `20260618000000_add_search_text_fts`
5. `20260705000000_add_event_outbox_and_process_log`
6. `20260707094543_add_provider_management_tables`

## Key Findings

| Check                    | Result                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| Migration numbering      | ✅ Sequential, no gaps                                              |
| Index coverage           | ✅ Excellent — all FKs and common query fields indexed              |
| N+1 risk                 | ✅ Minimal — comprehensive FK index coverage                        |
| Seed script              | ✅ Idempotent (all upsert), 10 tables seeded                        |
| Connection pool config   | ❌ No pool parameters in DATABASE_URL                               |
| Prisma client generation | ⚠️ Needs `pnpm db:generate`                                         |
| Schema drift             | ✅ Whitespace-only diff after formatting                            |
| Raw SQL usage            | ⚠️ 32 files use $queryRaw — Prisma tagged templates (parameterized) |
| Multi-tenancy            | ✅ 131 workspace_id references across models                        |
| UUID PKs                 | ✅ 132/132 models                                                   |

## Raw SQL Audit

32 files use `$queryRaw`/`$executeRaw`. Most use Prisma tagged template literals which prevent SQL injection. Notable:

- `knowledge.repository.ts` — FTS queries (expected, Prisma lacks native FTS)
- `graph-traversal.repository.ts` — Recursive CTEs (expected)
- `consultations.repository.ts` — Dynamic SQL (reviewed, parameterized)
- `super-admin.guard.ts` — Role check (could use Prisma findMany)
- `hard-delete-audit.interceptor.ts` — Bypasses soft-delete (intentional)

## Recommendation

Add connection pool parameters to DATABASE_URL:

```
postgresql://xennic:xennic@localhost:5432/xennic?connection_limit=20&pool_timeout=10
```

## Score

**8.5/10** — Excellent schema design, comprehensive indexing, minor configuration gaps.
