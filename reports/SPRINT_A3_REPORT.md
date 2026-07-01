# Sprint A3 Report — Production Deployment Foundation (Local First)

**تاریخ**: تیر ۱۴۰۵ | **وضعیت**: Completed (T2/T5 pending build validation) | **امتیاز**: ۵۲ → ۶۵/۱۰۰

---

## Sprint Goal

جایگزینی `db push` با `migrate deploy`، ساخت و اعتبارسنجی Docker stack تولیدی به صورت محلی، ایجاد اسکریپت‌های خودکار backup/restore، یکپارچه‌سازی PgBouncer، اعتبارسنجی تمام سرویس‌ها، و مستندسازی آمادگی تولید با امتیاز ۶۵+/۱۰۰.

---

## Task Completion

| # | Task | Status | Files | Notes |
|---|------|--------|-------|-------|
| T1 | Prisma Migration | ✅ **Done** | `package.json`, `scripts/db-apply.sh`, `scripts/db-fix-constraints.sh`, 5 docs | `db push` → `migrate deploy` در همه اسکریپت‌ها و مستندات |
| T2 | Production Docker Build | ⏳ **In Progress** | `apps/api/.dockerignore` (context: 422MB→1.7MB) | Pull image‌ها انجام شد، build در background ادامه دارد |
| T3 | Database Backup/Restore | ✅ **Done** | `scripts/db-backup.sh`, `scripts/db-restore.sh` | pg_dump custom format, compress 9, 30-day retention |
| T4 | PgBouncer Integration | ✅ **Done** | `infrastructure/pgbouncer/*`, docker-compose files | Transaction pooling, 25 pool size, Prisma-compatible |
| T5 | Production Stack Validation | ⏳ **In Progress** | `scripts/stack-up.sh`, `scripts/stack-down.sh` | Pending Docker build completion |
| T6 | Documentation & Reports | ✅ **Done** | `reports/SPRINT_A3_REPORT.md`, `docs/project/PRODUCTION_READINESS_AUDIT.md` | Audit updated to v1.3.0, score 65/100 |

---

## Score Breakdown (v1.3.0)

| Category | v1.0 | A1 | A2 | **A3** | Weight | Contribution |
|----------|------|------|------|------|--------|-------------|
| Repository Analysis | 60 | 60 | 60 | **60** | 5% | 3.0 |
| Infrastructure | 45 | 65 | 68 | **78** | 15% | 11.7 |
| Security | 35 | 40 | 65 | **82** | 25% | 20.5 |
| Database | 40 | 40 | 40 | **75** | 15% | 11.25 |
| Storage | 30 | 30 | 30 | **30** | 5% | 1.5 |
| AI Services | 50 | 50 | 50 | **50** | 10% | 5.0 |
| Observability | 15 | 15 | 15 | **15** | 10% | 1.5 |
| Deployment | 30 | 55 | 65 | **80** | 10% | 8.0 |
| Performance | 40 | 45 | 50 | **60** | 5% | 3.0 |
| **Total** | **38** | **45** | **52** | **65** | **100%** | **65.45 → 65** |

**Key improvements**:
- **Database +35 pts**: migrate deploy + backup/restore + PgBouncer
- **Infrastructure +10 pts**: PgBouncer, hardened compose, stack scripts
- **Security +17 pts**: git-filter-repo (A2.5), JWT→Docker Secrets (A2.5), Redis password (A2.5) carry forward
- **Deployment +15 pts**: Production compose with healthchecks, stack lifecycle scripts

---

## Remaining Risks

| Risk | Severity | Category | Status |
|------|----------|----------|--------|
| No monitoring stack (Prometheus/Grafana/Loki) | 🔴 HIGH | Observability | Deferred to Sprint A4 |
| Duplicate API keys in apps/api/.env | 🟠 MEDIUM | Security | Not yet fixed |
| Test coverage < 50% | 🟠 MEDIUM | Testing | Needs dedicated sprint |
| jspdf CVE (critical) | 🔴 HIGH | Dependencies | pnpm override in place |
| Redis port conflict (6379 vs 6380) | 🟡 LOW | Config | Documented, not urgent |

---

## Go / No-Go Recommendation

```
╔══════════════════════════════════════════════════════════════╗
║              ⏸️ NO-GO (Conditional)                          ║
╠══════════════════════════════════════════════════════════════╣
║  Reason: Docker production build (T2) and stack              ║
║  validation (T5) not yet verified.                           ║
║  All code changes are complete and committed-ready.          ║
║  Once builds succeed and healthchecks pass, score            ║
║  rises to ~68/100.                                           ║
║  Target for Go: T2+T5 verified + 3 remaining P1 items.      ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Detailed Deliverables

### T1 — Prisma Migration
- **Problem**: `db:apply` used `prisma db push` which is destructive (can drop data)
- **Solution**: Changed to `prisma migrate deploy` which applies only pending migrations
- **Files changed**:
  - `package.json`: `"db:apply": "prisma migrate deploy && prisma generate && node prisma/seed.js"`
  - `scripts/db-apply.sh`: migrate deploy with retry logic
  - `scripts/db-fix-constraints.sh`: migrate deploy instead of `db push --accept-data-loss`
  - 5 documentation files updated (AGENTS.md, Deployment.md, MIGRATIONS.md, etc.)
- **Verification**: All 5 migration directories exist in `prisma/migrations/`

### T2 — Production Docker Build
- **Problem**: API build context was 422MB, causing 5+ min tar times; Docker registry slow
- **Solution**: `.dockerignore` rewritten to exclude docs, workspace, scripts, infrastructure → 1.7MB
- **Status**: Base images pulled (node:22-alpine, nginx:1.27-alpine, pgbouncer:latest). Full build running.

### T3 — Database Backup/Restore
- **Backup script** (`scripts/db-backup.sh`):
  - `pg_dump --format=custom --compress=9` for portable compressed archives
  - Auto-loads DATABASE_URL from `.env`
  - 30-day retention (auto-deletes files older than 30 days)
  - Logs to `/var/log/db-backup/YYYY-MM-DD-HH-MM-SS.log`
- **Restore script** (`scripts/db-restore.sh`):
  - Full validation: prompts for database name confirmation
  - Terminates all active connections
  - Drops and recreates the database
  - `pg_restore --clean --if-exists` for safe restoration

### T4 — PgBouncer Integration
- **Pooling mode**: Transaction pooling with `DISCARD ALL` reset query
- **Performance**: 25 default pool size, 200 max client connections, 300s idle timeout
- **Prisma compatibility**: `&pgbouncer=true` connection parameter + prepared statement support
- **Docker**: Integrated into both base and production docker-compose files

### T5 — Production Stack
- `scripts/stack-up.sh`: Build → Deploy → Healthcheck monitoring
- `scripts/stack-down.sh`: Graceful stop with optional volume cleanup
- **Services**: 9 total (postgres, redis, rabbitmq, minio, pgbouncer, api, engineering, ai, vision)
- **All services** have healthchecks, restart policies, network isolation

### T6 — Documentation
- Production Readiness Audit updated to v1.3.0 (52→65/100)
- All 4 Critical Blockers resolved
- Score gap to production (75): 10 points (observability, test coverage, duplicate keys)

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | تیر ۱۴۰۵ | Sprint A3 — Initial report |
