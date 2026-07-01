#!/bin/bash
# ============================================================
# Xennic — Database Restore Script
# استفاده: bash scripts/db-restore.sh <backup-file.dump>
#
# هشدار: این دستور دیتابیس فعلی را Drop می‌کند!
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ─── Validate argument ──────────────────────────────────────
if [ $# -lt 1 ]; then
  echo "❌ Usage: bash scripts/db-restore.sh <backup-file.dump>"
  echo ""
  echo "   Available backups:"
  ls -1 "$PROJECT_ROOT/backups/postgres/"*.dump 2>/dev/null || echo "   (no backups found)"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

# ─── Load .env ──────────────────────────────────────────────
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env" | grep DATABASE_URL | xargs)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL not found in .env"
  exit 1
fi

echo "⚠️  ⚠️  ⚠️  WARNING ⚠️  ⚠️  ⚠️"
echo "This will DROP the current database and restore from backup."
echo "Source: $BACKUP_FILE"
echo ""

read -p "Type the database name to confirm restore: " db_confirm

# Extract DB name from DATABASE_URL
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ "$db_confirm" != "$DB_NAME" ]; then
  echo "❌ Database name mismatch. Aborted."
  exit 1
fi

echo ""
echo "🗄️  Restoring database: $DB_NAME"
echo "================================"

# ─── Parse DATABASE_URL for connection params ───────────────
# postgresql://user:pass@host:port/db
PG_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
PG_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')
PG_HOST=$(echo "$DATABASE_URL" | sed -n 's/@\([^:]*\):.*/\1/p')
PG_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

export PGPASSWORD="$PG_PASS"

# ─── Terminate connections ──────────────────────────────────
echo "🔌 Terminating active connections..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -c "
  SELECT pg_terminate_backend(pg_stat_activity.pid)
  FROM pg_stat_activity
  WHERE pg_stat_activity.datname = '$DB_NAME'
    AND pid <> pg_backend_pid();
" 2>/dev/null || true

# ─── Drop and recreate ──────────────────────────────────────
echo "🗑️  Dropping database..."
dropdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$DB_NAME" 2>/dev/null || true

echo "🏗️  Creating database..."
createdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$DB_NAME"

# ─── Restore ────────────────────────────────────────────────
echo "🔄 Restoring from backup..."
pg_restore \
  -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --verbose \
  --no-owner \
  --no-acl \
  "$BACKUP_FILE" 2>&1 | tail -10

unset PGPASSWORD

echo ""
echo "✅ Restore complete from: $(basename "$BACKUP_FILE")"
echo "🎉 Done at $(date)"
