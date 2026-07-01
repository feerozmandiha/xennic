#!/bin/bash
# ============================================================
# Xennic — Restore Validation Script
# تست بازیابی دیتابیس بدون تأثیر بر دیتابیس اصلی
#
# This script:
#   1. Takes a fresh pg_dump of the current database
#   2. Creates a temporary database (xennic_restore_test)
#   3. Restores the backup to the temporary database
#   4. Runs validation queries (SELECT 1, count tables)
#   5. Drops the temporary database
#   6. Reports success/failure
#
# Usage:
#   bash scripts/validation/restore-check.sh
#   bash scripts/validation/restore-check.sh --dry-run
#   bash scripts/validation/restore-check.sh --backup-file /path/to/backup.dump
#   bash scripts/validation/restore-check.sh --json
#   bash scripts/validation/restore-check.sh --help
#
# Examples:
#   bash scripts/validation/restore-check.sh
#   bash scripts/validation/restore-check.sh --backup-file backups/postgres/latest.dump
#   bash scripts/validation/restore-check.sh --json | jq .
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# ─── Colors ──────────────────────────────────────────────────────
G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; C='\033[0;36m'; B='\033[1m'; N='\033[0m'

# ─── Config ──────────────────────────────────────────────────────
TEMP_DB="xennic_restore_test"
JSON_MODE=false
DRY_RUN=false
BACKUP_FILE=""
FAILED=0

# ─── Load .env ──────────────────────────────────────────────────
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env" | grep DATABASE_URL | xargs)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo -e "${R}❌ DATABASE_URL not found in .env${N}" >&2
  exit 1
fi

# Parse DATABASE_URL for connection params
PG_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
PG_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')
PG_HOST=$(echo "$DATABASE_URL" | sed -n 's/@\([^:]*\):.*/\1/p')
PG_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
PG_DB=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

export PGPASSWORD="$PG_PASS"

# ─── Logging ─────────────────────────────────────────────────────
log_info()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${B}INFO${N}  $*"; }
log_ok()    { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${G}OK${N}    $*"; }
log_fail()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${R}FAIL${N}  $*"; }
log_warn()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${Y}WARN${N}  $*"; }

# ─── Help ────────────────────────────────────────────────────────
show_help() {
  cat <<HELP
Usage: bash scripts/validation/restore-check.sh [OPTIONS]

Test database restore capability without affecting production.

Options:
  --json                Output in JSON format (for CI/CD)
  --dry-run             Show what would be done without executing
  --backup-file <path>  Use specific backup file instead of fresh dump
  --help                Show this help message

Exit codes:
  0  Restore test successful
  1  Restore test failed

Examples:
  bash scripts/validation/restore-check.sh
  bash scripts/validation/restore-check.sh --dry-run
  bash scripts/validation/restore-check.sh --backup-file /backups/latest.dump
HELP
  exit 0
}

# ─── Parse arguments ─────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --help) show_help ;;
    --json) JSON_MODE=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    --backup-file) BACKUP_FILE="$2"; shift 2 ;;
    *) echo -e "${R}Unknown option: $1${N}"; show_help ;;
  esac
done

# ─── Prerequisites ───────────────────────────────────────────────
if ! command -v psql &>/dev/null; then
  echo -e "${R}❌ psql not found. Install PostgreSQL client.${N}" >&2
  exit 1
fi

if ! command -v pg_dump &>/dev/null; then
  echo -e "${R}❌ pg_dump not found. Install PostgreSQL client.${N}" >&2
  exit 1
fi

if ! command -v pg_restore &>/dev/null; then
  echo -e "${R}❌ pg_restore not found. Install PostgreSQL client.${N}" >&2
  exit 1
fi

# ─── Header ──────────────────────────────────────────────────────
if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo -e "${B}  Xennic — Restore Validation${N}"
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo ""
  log_info "Host: $PG_HOST:$PG_PORT"
  log_info "Database: $PG_DB"
  log_info "Temp database: $TEMP_DB"
  if [ "$DRY_RUN" = true ]; then
    log_warn "DRY RUN — no changes will be made"
  fi
  echo ""
fi

# ─── Step 1: Take backup (or use existing) ───────────────────────
step_backup() {
  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Step 1: Taking database backup..."
  fi

  local dump_file
  if [ -n "$BACKUP_FILE" ]; then
    if [ ! -f "$BACKUP_FILE" ]; then
      if [ "$JSON_MODE" = false ]; then echo -e "${R}FAIL${N}  (backup file not found: $BACKUP_FILE)"; fi
      FAILED=$((FAILED + 1))
      return 1
    fi
    dump_file="$BACKUP_FILE"
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}  (using existing: $(basename "$dump_file"))"; fi
  else
    if [ "$DRY_RUN" = true ]; then
      if [ "$JSON_MODE" = false ]; then echo -e "${Y}DRY-RUN${N}  (would run: pg_dump ... --file=/tmp/xennic-restore-check.dump)"; fi
      DUMP_FILE="/tmp/xennic-restore-check.dump"
      return 0
    fi
    dump_file=$(mktemp /tmp/xennic-restore-check-XXXXXX.dump)
    if pg_dump "$DATABASE_URL" --format=custom --compress=9 --file="$dump_file" 2>/dev/null; then
      if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}  ($(du -h "$dump_file" | cut -f1))"; fi
    else
      if [ "$JSON_MODE" = false ]; then echo -e "${R}FAIL${N}  (pg_dump failed)"; fi
      rm -f "$dump_file"
      FAILED=$((FAILED + 1))
      return 1
    fi
  fi
  DUMP_FILE="$dump_file"
}

# ─── Step 2: Create temp database ────────────────────────────────
step_create_temp_db() {
  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Step 2: Creating temp database..."
  fi

  if [ "$DRY_RUN" = true ]; then
    if [ "$JSON_MODE" = false ]; then echo -e "${Y}DRY-RUN${N}  (would create database $TEMP_DB)"; fi
    return 0
  fi

  # Drop if exists (idempotent)
  psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres \
    -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$TEMP_DB' AND pid <> pg_backend_pid();" 2>/dev/null || true
  dropdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$TEMP_DB" 2>/dev/null || true

  if createdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$TEMP_DB" 2>/dev/null; then
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}"; fi
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${R}FAIL${N}  (could not create temp database)"; fi
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# ─── Step 3: Restore backup to temp database ─────────────────────
step_restore() {
  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Step 3: Restoring to temp database..."
  fi

  if [ "$DRY_RUN" = true ]; then
    if [ "$JSON_MODE" = false ]; then echo -e "${Y}DRY-RUN${N}  (would run: pg_restore -d $TEMP_DB $DUMP_FILE)"; fi
    return 0
  fi

  if pg_restore -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$TEMP_DB" \
    --format=custom --no-owner --no-acl "$DUMP_FILE" 2>/dev/null; then
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}"; fi
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${R}FAIL${N}  (pg_restore failed)"; fi
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# ─── Step 4: Validate restored database ──────────────────────────
step_validate() {
  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Step 4a: Running SELECT 1..."
  fi

  if [ "$DRY_RUN" = true ]; then
    if [ "$JSON_MODE" = false ]; then echo -e "${Y}DRY-RUN${N}"; fi
    return 0
  fi

  if psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$TEMP_DB" -c "SELECT 1 AS ok;" 2>/dev/null | grep -q "1"; then
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}"; fi
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${R}FAIL${N}  (SELECT 1 failed)"; fi
    FAILED=$((FAILED + 1))
    return 1
  fi

  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Step 4b: Counting tables..."
  fi

  local table_count
  table_count=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$TEMP_DB" -t -c "SELECT count(*)::int FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")

  if [ "$table_count" -gt 0 ]; then
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}  ($table_count tables)"; fi
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${Y}WARN${N}  (0 tables in public schema)"; fi
  fi
}

# ─── Step 5: Drop temp database ──────────────────────────────────
step_cleanup() {
  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Step 5: Dropping temp database..."
  fi

  if [ "$DRY_RUN" = true ]; then
    if [ "$JSON_MODE" = false ]; then echo -e "${Y}DRY-RUN${N}  (would drop database $TEMP_DB)"; fi
    return 0
  fi

  psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres \
    -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$TEMP_DB' AND pid <> pg_backend_pid();" 2>/dev/null || true

  if dropdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$TEMP_DB" 2>/dev/null; then
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}"; fi
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${Y}WARN${N}  (could not drop — may not exist)"; fi
  fi

  # Clean up temp dump if we created one
  if [ -z "${BACKUP_FILE:-}" ] && [ -f "${DUMP_FILE:-}" ]; then
    rm -f "$DUMP_FILE"
  fi
}

# ─── Run all steps ───────────────────────────────────────────────
step_backup
step_create_temp_db
step_restore
step_validate
step_cleanup

unset PGPASSWORD

# ─── Summary ──────────────────────────────────────────────────────
if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  if [ "$DRY_RUN" = true ]; then
    echo -e "${Y}  DRY RUN — no changes made${N}"
    echo -e "${G}  All steps would proceed without errors${N}"
    exit 0
  elif [ "$FAILED" -eq 0 ]; then
    echo -e "${G}  Restore validation — PASSED${N}"
    exit 0
  else
    echo -e "${R}  Restore validation — FAILED${N}"
    exit 1
  fi
fi

exit $([ "$FAILED" -eq 0 ] && echo 0 || echo 1)
