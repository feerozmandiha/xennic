# بدهی فنی — Technical Debt

**نسخه**: ۲.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: تیر ۱۴۰۵

---

## Purpose

Inventory of all identified technical debt across the Xennic platform. Items are organized by severity. Each entry includes description, location, type, effort estimate, and impact.

---

## CRITICAL

| # | Description | Location | Type | Effort | Impact |
|---|-------------|----------|------|--------|--------|
| 1 | **Duplicate API keys in seed data** — Hardcoded API keys committed in seed file. Claimed remediated in SPRINT_A4 but needs verification. | `prisma/seed.js` | Security | 1h | Secrets exposed in git history |
| 2 | **Web Docker build fails** — npm registry too slow, build times out. Blocks production deployment. | `apps/web/Dockerfile` | Build/CI | 4h | Production deployment blocked |
| 3 | **jspdf CVE** — Known vulnerability in jspdf dependency. Override in place but still in lockfile. | `pnpm-lock.yaml` | Security | 2h | Supply chain risk |
| 4 | **Missing @nestjs/jwt and @nestjs/passport** — NestJS package.json does not include these packages despite being used in source code. Build breaks. | `apps/api/package.json` | Build | 1h | Build failure |

## HIGH

| # | Description | Location | Type | Effort | Impact |
|---|-------------|----------|------|--------|--------|
| 5 | **JWT private key on filesystem** — JWT signing key exists on disk in docker secrets directory. Docker secrets configured but git history may have exposed it. Git purge performed but needs verification. | `infrastructure/docker/secrets/` | Security | 2h | Credential compromise |
| 6 | **Weak dev credentials** — Postgres password `xennic123`, RabbitMQ guest/guest, Grafana admin/admin. Acceptable for local dev only if documented. | `infrastructure/docker/.env` | Security | 1h | Unauthorized access in shared environments |
| 7 | **PostgreSQL UUID columns migrated to TEXT** — All PK/FK columns changed from UUID to TEXT in migration #2. Loses DB-level type validation and index efficiency. | Prisma migration #2 | Data Integrity | 8h | Data corruption risk, performance degradation |
| 8 | **Monitoring exporters configured but not deployed** — postgres-exporter, redis-exporter, pgbouncer-exporter configured in prometheus.yml but no containers exist. Prometheus logs errors on scrape. | `prometheus.yml` | Configuration | 3h | Broken monitoring, alert fatigue from scrape errors |
| 9 | **Two doc roots diverged** — 32 files in `xennic-docs/` are out of sync with main `docs/`. File contents differ. | `xennic-docs/` vs `docs/` | Duplication | 16h | Stale documentation misleads developers |
| 10 | **$queryRawUnsafe in NestJS repositories** — Multiple repositories use template literal interpolation with raw SQL, creating SQL injection risk. | `apps/api/src/**/*.repository.ts` | Security | 12h | SQL injection vulnerability |
| 11 | **Knowledge sub-models not tenant-isolated** — `knowledge_translations`, `knowledge_taxonomy`, `knowledge_media` bypass workspace filtering in tenant-extension. | `packages/database/src/tenant-extension.ts` | Bug | 6h | Cross-tenant data leakage |

## MEDIUM

| # | Description | Location | Type | Effort | Impact |
|---|-------------|----------|------|--------|--------|
| 12 | **ADR numbering collision** — Both `docs/decisions/` and `docs/knowledge/runtime/` use ADR-001 through ADR-010 for different decisions. | `docs/decisions/`, `docs/knowledge/runtime/` | Naming | 2h | Confusion navigating architecture decisions |
| 13 | **Outdated status reports** — Both DOCUMENTATION_STATUS.md and REVIEW_REPORT.md claim 120/149 files (actual 276) and 100% coverage when knowledge is Draft. | `docs/DOCUMENTATION_STATUS.md`, `docs/REVIEW_REPORT.md` | Inaccuracy | 3h | False sense of progress, misinformed stakeholders |
| 14 | **Empty placeholder directories** — Several directories exist with no content, cluttering the repository and confusing navigation. | `services/api-gateway/`, `infrastructure/kubernetes/`, `tools/`, `docs/diagrams/` | Dead Code | 1h | Repository noise, navigation confusion |
| 15 | **Missing Prisma schema tests** — Only 1 repository (workspace) has tests out of 24+ total. | `packages/database/` | Missing Tests | 40h | High regression risk for data layer |
| 16 | **No frontend tests** — Test script is `echo "No web tests yet"`. Zero coverage on 60+ components. | `apps/web/` | Missing Tests | 60h | High regression risk for UI |
| 17 | **Backup scripts use DATABASE_URL from root .env** — No fallback if .env is missing from the runtime environment. | `scripts/backup*.sh` | Reliability | 2h | Silent backup failure |
| 18 | **No Grafana dashboard JSON files** — Provider configured in provisioning but dashboards directory is empty. | `monitoring/grafana/provisioning/dashboards/` | Missing Config | 8h | No visualization, monitoring ineffective |

## LOW

| # | Description | Location | Type | Effort | Impact |
|---|-------------|----------|------|--------|--------|
| 19 | **@nestjs/throttler in devDependencies of packages** — Appears in config, database, shared, types package.json as devDependency — unrelated to their purpose (copy-paste boilerplate). | `packages/config/package.json`, `packages/database/package.json`, `packages/shared/package.json`, `packages/types/package.json` | Dead Code | 0.5h | Unnecessary dependencies, confusing |
| 20 | **Duplicate src/package.json** — Duplicate of outer package.json in packages/config/src/, potentially confusing to new developers. | `packages/config/src/package.json` | Duplication | 0.5h | Configuration confusion |
| 21 | **Empty shared/utils/** — Placeholder file with `export {}` at `packages/shared/src/utils/index.ts`. | `packages/shared/src/utils/` | Dead Code | 0.5h | None — low impact |
| 22 | **Naming collision: TenantContext** — Both `packages/types` and `packages/database` export something called TenantContext (interface vs class). | `packages/types/src/`, `packages/database/src/` | Naming | 1h | Import ambiguity, potential runtime confusion |
| 23 | **Legacy database tables not dropped** — `articles`, `article_translations`, `article_comments` still in database, removed from Prisma schema. | PostgreSQL database | Dead Code | 1h | Orphaned data, migration complexity |
| 24 | **Plans features as JSON blob** — Features stored as JSON rather than normalized table. `fix-plan-features.js` exists for corrections. | `prisma/schema.prisma` | Design | 8h | No referential integrity, query complexity |
| 25 | **governance/acquisition-policy.md broken reference** — runtime/README.md:19 references `governance/` but file is at `concepts/`. | `docs/knowledge/runtime/README.md` | Documentation | 0.5h | Broken link for readers |
| 26 | **@xennic/database main points to dist/** but others point to raw .ts — Inconsistency in package consumption pattern across the monorepo. | `packages/*/package.json` | Configuration | 1h | Inconsistent build/consumption behavior |
| 27 | **No .dockerignore files** — Build contexts unnecessarily large for Docker builds. | Repository root (missing) | Build | 1h | Slower Docker builds, larger images |
| 28 | **pnpm-workspace.yaml has corrupted allowBuilds** — Contains spaces, quotes, single letters as package names. | `pnpm-workspace.yaml` | Configuration | 0.5h | pnpm warnings, potential build issues |

---

## Summary

| Severity | Count | Est. Effort |
|----------|-------|-------------|
| CRITICAL | 4 | 8h |
| HIGH | 7 | 48h |
| MEDIUM | 7 | 116h |
| LOW | 10 | 14h |
| **Total** | **28** | **186h** |

---

## Planned Resolution

| Sprint | Items Targeted |
|--------|---------------|
| SPRINT_A5 | CRITICAL items (#1-4), HIGH items (#5, #6, #10) |
| SPRINT_B1 | HIGH items (#7-9, #11) |
| SPRINT_B2 | MEDIUM items (#12-14, #17-18) |
| SPRINT_B3 | MEDIUM items (#15-16) |
| SPRINT_C1 | LOW items (#19-28) |

---

## Related Documents

| Document | Path |
|----------|------|
| Known Limitations | `project/KNOWN_LIMITATIONS.md` |
| TODO | `project/TODO.md` |
| Roadmap | `project/IMPLEMENTATION_PROGRESS.md` |
| Risk Register | `project/RISK_REGISTER.md` |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| ۲.۰.۰ | تیر ۱۴۰۵ | Comprehensive rewrite — 28 items across 4 severity levels with effort estimates and planned resolution |
| ۱.۰.۰ | خرداد ۱۴۰۵ | Initial release with 6 items |
