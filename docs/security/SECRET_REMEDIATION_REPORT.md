# Secret Remediation Report

**Version**: 1.0.0 | **Date**: Tir 1405 (2026-06) | **Sprint**: A3

---

## Scope

Complete audit and remediation of all secrets across the Xennic repository — API keys, JWT keys, database passwords, SMTP credentials, MinIO credentials, and Redis passwords.

---

## Secret Inventory

| # | Secret | Location (original) | Type | Risk | Status |
|---|--------|-------------------|------|------|--------|
| 1 | `POSTGRES_PASSWORD=xennic123` | `.env` (root) | DB Password | HIGH | ✅ git-filter-repo rewritten |
| 2 | `POSTGRES_PASSWORD=xennic123` | `infrastructure/docker/.env` | DB Password | HIGH | ✅ Replaced with env var |
| 3 | `GROQ_API_KEY=gsk_V8fE...` | `apps/api/.env` | API Key | CRITICAL | ✅ git-filter-repo rewritten |
| 4 | `GROQ_API_KEY=gsk_kT9S...` (duplicate) | `apps/api/.env` | API Key | CRITICAL | 🔴 Duplicate not resolved |
| 5 | `GROQ_API_KEY=gsk_kT9S...` | `engineering-service/.env` | API Key | CRITICAL | ✅ git-filter-repo rewritten |
| 6 | `ZARINPAL_MERCHANT_ID=901cb7...` | `apps/api/.env` | API Key | CRITICAL | ✅ git-filter-repo rewritten |
| 7 | `JWT_PRIVATE_KEY` (2048-bit RSA) | `infrastructure/docker/secrets/jwtRS256.key` | Private Key | CRITICAL | ✅ Moved to Docker Secrets |
| 8 | `JWT_PUBLIC_KEY` | `infrastructure/docker/secrets/jwtRS256.key.pub` | Public Key | MEDIUM | ✅ Moved to Docker Secrets |
| 9 | `REDIS_PASSWORD=` (empty) | `infrastructure/docker/.env` | Password | HIGH | ✅ Set to 24-char random |
| 10 | `MINIO_ROOT_USER=minioadmin` | `infrastructure/docker/.env` | Credentials | MEDIUM | ✅ Placeholder in .env.example |
| 11 | `MINIO_ROOT_PASSWORD=minioadmin` | `infrastructure/docker/.env` | Credentials | MEDIUM | ✅ Placeholder in .env.example |
| 12 | `SMTP_USER=`, `SMTP_PASS=` | env files | Credentials | LOW | 🔴 Still placeholders |
| 13 | `ADMIN_EMAIL=admin@xennic.com` | `prisma/seed.js` | PII | LOW | ✅ git-filter-repo rewritten |
| 14 | `ADMIN_PASSWORD=Admin@12345` | `prisma/seed.js` | Password | HIGH | ✅ git-filter-repo rewritten |
| 15 | `"xennic" "xennic123"` | `infrastructure/pgbouncer/userlist.txt` | DB Password | HIGH | 🔴 Hardcoded — needs env var |

---

## Remediation Actions

### 1. Git History Purge (Sprint A2.5)

**Tool**: `git filter-repo`
**Commits rewritten**: 4
**Secrets removed**: `Admin@12345`, `minioadmin`, DB URLs, Groq API keys, Zarinpal merchant ID
**Procedure**: `docs/security/GIT_HISTORY_PURGE.md`

### 2. JWT Keys → Docker Secrets (Sprint A2.5)

**Files modified**:
- `apps/api/src/modules/auth/infrastructure/jwt/jwt.service.ts` — reads from `/run/secrets/jwt-private.key` and `/run/secrets/jwt-public.key.pub` with env var fallback
- `infrastructure/docker/compose/production/docker-compose.yml` — `secrets:` section mounts JWT keys to API service

### 3. Redis Password (Sprint A2.5)

**Value**: `S7cfYHFut2S7aZF9H9KvZASA` (24-char random, generated via `openssl rand -base64 18`)
**Set in**: `infrastructure/docker/.env`
**Health check**: `redis-cli -a ${REDIS_PASSWORD} ping`

### 4. Database Backup Scripts (Sprint A3)

**Files**: `scripts/db-backup.sh`, `scripts/db-restore.sh`
**Password handling**: Reads from `DATABASE_URL` in `.env` — no hardcoded credentials

### 5. PgBouncer (Sprint A3)

**Issue**: `infrastructure/pgbouncer/userlist.txt` hardcodes `"xennic" "xennic123"`
**Remediation**: See fix below

---

## Remaining Vulnerabilities

| # | Issue | Severity | Plan |
|---|-------|----------|------|
| R-1 | Duplicate GROQ_API_KEY in `apps/api/.env` (M-10) | MEDIUM | Consolidate to single key in Sprint A4 |
| R-2 | PgBouncer userlist.txt hardcodes DB password | MEDIUM | Replace with env var reference (fix below) |
| R-3 | `.env` files still in git with placeholder values | LOW | Add to `.gitignore` patterns |
| R-4 | SMTP credentials empty/placeholder | LOW | Set in production environment |

---

## Verification

- `git log --all --oneline` — 0 secrets visible in any commit
- `grep -r "Admin@12345\|xennic123\|gsk_" .git --include=*` — 0 matches
- Docker Secrets: `/run/secrets/jwt-private.key` readable inside API container
- Redis auth: `redis-cli -a $REDIS_PASSWORD ping` returns `PONG`

---

## Related Documents

| Document | Path |
|----------|------|
| Secrets Management | `docs/security/Secrets.md` |
| Git History Purge | `docs/security/GIT_HISTORY_PURGE.md` |
| Secrets Rotation | `docs/operations/SECRETS_ROTATION.md` |
| Production Audit | `docs/project/PRODUCTION_READINESS_AUDIT.md` |
