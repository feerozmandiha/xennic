# Documentation Consistency Audit — Sprint R3.0

**Date:** 2026-07-18

## Summary: ⚠️ FAIL — Significant drift detected

## Documentation Inventory

| Directory              | Files    | Purpose                                   |
| ---------------------- | -------- | ----------------------------------------- |
| `docs/audit/r3/`       | 12       | Sprint R3.0 audit (this round)            |
| `docs/audit/`          | 26       | Sprint R1/R2 audit (01-13 + full reports) |
| `docs/audits/`         | 13       | Earlier audit round                       |
| `docs/baseline/`       | 4        | Development baseline v1                   |
| `docs/generated/`      | 14       | Auto-generated reports                    |
| `docs/governance/`     | 10       | Sprint governance, ADR process            |
| `docs/implementation/` | 8        | Gap analysis, sprint plan                 |
| `docs/knowledge/`      | 5        | Knowledge subsystem docs                  |
| `docs/recovery/`       | 2        | Environment recovery                      |
| `docs/adr/`            | 8        | Architecture Decision Records             |
| **Total**              | **~200** | —                                         |

## Critical Drift

| #   | Document               | Issue                                                                   |
| --- | ---------------------- | ----------------------------------------------------------------------- |
| 1   | Sprint S2 reports      | Claims "freeLLM API" on port 3001 — this is Next.js Web                 |
| 2   | Sprint S2 reports      | Claims MinIO running on 9000/9001 — no MinIO container exists           |
| 3   | Sprint S2 reports      | Claims PgBouncer on 6432 — no PgBouncer container exists                |
| 4   | `STATUS_REPORT.md`     | Dated 2026-07-06, missing R1/R2/R3 sprints entirely                     |
| 5   | `critical-path.md`     | Updated 2026-07-05 (Sprint K4), missing Enterprise Intelligence         |
| 6   | `PROJECT_BOOTSTRAP.md` | Claims "Testing: 15%" — now 1,538 tests passing                         |
| 7   | `PROJECT_BOOTSTRAP.md` | Claims "Enterprise AI: 25%" — Sprint I1 completed (135 files, ~12k LOC) |

## Moderate Drift

| #   | Document                            | Issue                                                 |
| --- | ----------------------------------- | ----------------------------------------------------- |
| 8   | `docs/audit/01-13`                  | Module count 28 vs current 43                         |
| 9   | `docs/audits/`                      | Coverage 8.72%, 96 tests — baseline shows 1,538       |
| 10  | `audits/PROJECT_BASELINE_REPORT.md` | "Overall Completion: ~50%" vs baseline v1 "7.5/10"    |
| 11  | `readiness-score.md`                | "Qdrant missing from base compose" — it's present now |

## Port Verification

| Port | Service     | All Docs Match Reality?             |
| ---- | ----------- | ----------------------------------- |
| 3000 | NestJS API  | ✅ Yes                              |
| 3001 | Next.js Web | ❌ S2 reports call it "freeLLM API" |
| 5432 | PostgreSQL  | ✅ Yes                              |
| 5672 | RabbitMQ    | ✅ Yes                              |
| 6333 | Qdrant      | ✅ Yes                              |
| 6380 | Redis       | ✅ Yes                              |
| 6432 | PgBouncer   | ❌ Claimed in S2 but doesn't exist  |
| 8001 | Engineering | ✅ Yes                              |
| 8002 | AI Service  | ✅ Yes                              |
| 8003 | Vision      | ✅ Yes                              |
| 9000 | MinIO       | ❌ Claimed in S2 but doesn't exist  |

## Recommendations

1. **Archive Sprint S2 reports** — they contain factually incorrect claims
2. **Update STATUS_REPORT.md** — missing 3 weeks of sprints
3. **Update critical-path.md** — last updated Sprint K4
4. **Consolidate audit directories** — `docs/audit/` and `docs/audits/` are confusing
5. **Mark historical docs** — add "historical" headers to superseded documents
