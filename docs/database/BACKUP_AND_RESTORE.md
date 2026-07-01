# Backup & Restore — Database Reliability

**Version**: 1.0.0 | **Date**: Tir 1405

---

## Overview

Automated PostgreSQL backup and restore system with compression, retention, and verification.

---

## Backup Script

**File**: `scripts/db-backup.sh` | Also at: `infrastructure/backup/backup.sh`

### Features

| Feature | Detail |
|---------|--------|
| Format | `pg_dump --format=custom` (portable, restorable selectively) |
| Compression | `--compress=9` (maximum gzip) |
| Retention | 30 days (auto-deletes older files) |
| Credentials | Reads `DATABASE_URL` from `.env` |
| Logging | `/var/log/db-backup/YYYY-MM-DD-HH-MM-SS.log` |
| Output | `backups/postgres/xennic-YYYY-MM-DD-HH-MM-SS.dump` |

### Usage

```bash
# Manual backup
bash scripts/db-backup.sh

# View last backup
ls -lh backups/postgres/
```

### Automation (cron)

```bash
# Daily backup at 02:00
0 2 * * * /home/ahmad/xennic/scripts/db-backup.sh >> /var/log/db-backup-cron.log 2>&1
```

---

## Restore Script

**File**: `scripts/db-restore.sh` | Also at: `infrastructure/backup/restore.sh`

### Features

| Feature | Detail |
|---------|--------|
| Safety | Prompts for database name confirmation |
| Connection handling | Terminates all active connections |
| Clean restore | Drops and recreates the database |
| Tool | `pg_restore --format=custom --no-owner --no-acl` |

### Usage

```bash
# Interactive restore
bash scripts/db-restore.sh

# Will prompt for:
# - Database name to restore
# - Confirmation before dropping
```

---

## Verification Script

**File**: `infrastructure/backup/verify.sh`

### Features

| Feature | Detail |
|---------|--------|
| Integrity | Verifies dump file is valid PostgreSQL custom format |
| Checksum | Generates and verifies SHA256 checksums |
| Trial restore | Optionally restores to a temporary database |
| Reporting | Exit code and summary for automation |

### Usage

```bash
# Verify latest backup
bash infrastructure/backup/verify.sh

# Verify specific backup
bash infrastructure/backup/verify.sh backups/postgres/xennic-2026-06-24-020000.dump

# Verify with trial restore
bash infrastructure/backup/verify.sh --restore
```

Example output:
```
=== Backup Verification ===
File: backups/postgres/xennic-2026-06-24-020000.dump
Size: 1.2 GB
Format: PostgreSQL custom database dump (pg_dump)
SHA256: a1b2c3d4... ✅ MATCHES stored checksum
Corruption: none detected
Integrity: ✅ PASS
```

---

## Retention Policy

| Age | Action |
|-----|--------|
| < 7 days | Keep all |
| 7-30 days | Keep daily |
| > 30 days | Delete automatically |

---

## RTO / RPO Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| RTO (Recovery Time) | 15 minutes | ⏳ Scripts ready, untested |
| RPO (Recovery Point) | 1 hour | ⏳ Manual only, no cron yet |

---

## Disaster Recovery Procedure

1. **Stop all services**:
   ```bash
   bash scripts/stack-down.sh
   ```

2. **Restore database**:
   ```bash
   bash scripts/db-restore.sh
   ```

3. **Verify data**:
   ```bash
   psql -h localhost -U xennic -d xennic -c "SELECT count(*) FROM users;"
   ```

4. **Restart services**:
   ```bash
   bash scripts/stack-up.sh
   ```

---

## Related Documents

| Document | Path |
|----------|------|
| Migration Strategy | `docs/database/MIGRATION_STRATEGY.md` |
| PgBouncer | `docs/database/PGBOUNCER.md` |
| Disaster Recovery | `docs/runbooks/Disaster-Recovery.md` |
| Production Audit | `docs/project/PRODUCTION_READINESS_AUDIT.md` |
