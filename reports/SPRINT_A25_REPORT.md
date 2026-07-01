# Sprint A2.5 — Critical Security Closure

**تاریخ**: ۱۴۰۴/۰۴/۰۲ (۲۰۲۵-۰۶-۲۳)
**امتیاز قبلی**: ۵۲/۱۰۰ → **امتیاز جدید**: ۶۰/۱۰۰ (+۸)
**حالت**: ❌ NOT READY (پیشرفت امنیتی قابل توجه، ۵۴٪ به Alpha Readiness)

---

## Tasks Completed (۸/۸)

| Task | Description | Status | Key Deliverables |
|------|-------------|--------|------------------|
| T1 | Git History Purge | ✅ | git-filter-repo, ۴ کامیت بازنویسی، ۰ hardcoded credential باقی |
| T2 | Secrets Rotation Guide | ✅ | docs/operations/SECRETS_ROTATION.md — ۱۵ secret, rotation, emergency, audit |
| T3 | Docker Secrets for JWT | ✅ | jwt.service.ts → /run/secrets/*, production docker-compose, .env.example updated |
| T4 | Redis Password | ✅ | infrastructure/docker/.env — ۲۴-char random password |
| T5 | Docker Image Audit | ✅ | All Dockerfiles: multi-stage, node:22-alpine, non-root, tini, healthcheck |
| T6 | Remaining Secret Scan | ✅ | ۰ secrets in git, .env.example fixed, CI uses test creds, Secrets.md updated |
| T7 | Alpha Release Gate | ✅ | docs/releases/ALPHA_RELEASE_GATE.md |
| T8 | Sprint Report | ✅ | reports/SPRINT_A25_REPORT.md |

---

## Files Created & Modified

### Created (۳ فایل)
| File | Purpose |
|------|---------|
| `docs/operations/SECRETS_ROTATION.md` | Comprehensive secrets rotation guide (۱۵ secrets, emergency, audit) |
| `docs/releases/ALPHA_RELEASE_GATE.md` | Alpha release gate criteria and process |
| `reports/SPRINT_A25_REPORT.md` | This report |

### Modified (۸+ فایل)
| File | Change |
|------|--------|
| Git history (۴ commits) | git-filter-repo purge — Admin@12345, minioadmin, DB URLs, Groq keys, Zarinpal ID → placeholders |
| `apps/api/src/modules/auth/infrastructure/jwt/jwt.service.ts` | Added /run/secrets/* paths with env var fallback |
| `infrastructure/docker/compose/production/docker-compose.yml` | Added JWT_PRIVATE_KEY_PATH, JWT_PUBLIC_KEY_PATH env vars |
| `infrastructure/docker/.env` | REDIS_PASSWORD set to 24-char random alphanumeric |
| `.env.example` | Updated with RS256 key config placeholders |
| `docs/security/Secrets.md` | Updated to reflect post-purge clean state |
| Dockerfiles (۵ services) | Multi-stage, pinned node:22-alpine, non-root user, tini init, healthchecks |

---

## Achievements

### Critical Security Closure
- ✅ **۰ hardcoded credentials in git history** — git-filter-repo rewrote all ۴ commits; Admin@12345, minioadmin, DB URLs, Groq API keys, Zarinpal merchant ID replaced with placeholders. Remote re-added.
- ✅ **Secrets rotation guide** — `docs/operations/SECRETS_ROTATION.md` covers all ۱۵ production secrets with rotation procedures, emergency script, audit logging, and recovery
- ✅ **JWT → Docker Secrets (production)** — `jwt.service.ts` reads from `/run/secrets/jwtRS256.key` with fallback to `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` env vars
- ✅ **Redis password set** — 24-character random alphanumeric password in `infrastructure/docker/.env`

### Hardening
- ✅ **۵ source files hardened** — seed files (`prisma/seed.js`, `prisma/seed.ts`), MinIO service, debug script sanitized
- ✅ **Docker image audit** — All Dockerfiles multi-stage, pinned `node:22-alpine`, non-root user, `tini` init, healthchecks configured
- ✅ **Alpha release gate defined** — Entry/exit criteria, go/no-go process, sign-off requirements
- ✅ **Remaining secret scan completed** — Only gitignored `.env` files (local dev), `.env.example` fixed, GitHub CI uses test-only creds

---

## Production Readiness Score: ۶۰/۱۰۰ (+۸ از Sprint A2)

| Dimension | Score | Weight | Contribution |
|-----------|-------|--------|-------------|
| Repository Analysis | ۹۰ | ۵٪ | ۴.۵ |
| Infrastructure | ۷۵ | ۱۵٪ | ۱۱.۲۵ |
| Security | ۸۲ | ۲۵٪ | ۲۰.۵ |
| Database | ۴۰ | ۱۵٪ | ۶.۰ |
| Storage | ۳۰ | ۵٪ | ۱.۵ |
| AI Services | ۵۰ | ۱۰٪ | ۵.۰ |
| Observability | ۱۵ | ۱۰٪ | ۱.۵ |
| Deployment | ۷۲ | ۱۰٪ | ۷.۲ |
| Performance | ۵۰ | ۵٪ | ۲.۵ |
| **Total** | | **۱۰۰٪** | **۵۹.۹۵ → ۶۰/۱۰۰** |

---

## Remaining Critical Risks

| Risk | Severity | Status |
|------|----------|--------|
| `prisma db push` should be `migrate deploy` | 🔴 CRITICAL | ❌ Not fixed |
| No monitoring stack (Prometheus/Grafana) | 🔴 CRITICAL | ❌ Not deployed |
| No automated database backups | 🟠 HIGH | ❌ Not implemented |
| No connection pooling (PgBouncer) | 🟠 HIGH | ❌ Not configured |

---

## Next Sprint (A3)

**Focus: Database & Observability**

| Priority | Task | Area | Est. Effort |
|----------|------|------|-------------|
| P0 | Switch `db:apply` → `prisma migrate deploy` | Database | ۲h |
| P0 | Deploy Prometheus + Grafana + Loki | Observability | ۸h |
| P1 | Implement automated backup scripts | Database | ۸h |
| P1 | Configure PgBouncer connection pooling | Performance | ۴h |
| P1 | Add Prometheus metrics endpoint to API | Observability | ۴h |
| P2 | jspdf 2→4 major upgrade | Dependencies | ۴h |
| P2 | Create Grafana dashboards | Observability | ۶h |

**Target Score: ۶۵+/۱۰۰** (+۵ از Sprint A2.5)

---

## Sprint A2.5 Stats

| Metric | Value |
|--------|-------|
| Git commits rewritten | ۴ |
| Hardcoded credentials removed | All (۰ remaining in history) |
| Secrets documented in rotation guide | ۱۵ |
| Dockerfiles audited | ۵ |
| Source files hardened | ۵ |
| New docs created | ۳ |
| Score improvement (A2→A2.5) | +۸ (۵۲→۶۰) |
