#!/bin/bash
# ============================================================
# Xennic — Database Backup Script
# استفاده: bash scripts/db-backup.sh [output-dir]
#
# خودکار: DATABASE_URL را از .env می‌خواند
# فشرده‌سازی: gzip
# نام فایل: xennic-backup-YYYY-MM-DD-HHMMSS.sql.gz
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ─── Load .env ──────────────────────────────────────────────
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env" | grep DATABASE_URL | xargs)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL not found in .env"
  exit 1
fi

# ─── Output directory ───────────────────────────────────────
BACKUP_DIR="${1:-$PROJECT_ROOT/backups/postgres}"
mkdir -p "$BACKUP_DIR"

# ─── Timestamp ──────────────────────────────────────────────
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/xennic-backup-$TIMESTAMP.sql"

echo "🗄️  Xennic Database Backup"
echo "==========================="
echo ""
echo "📁 Output: $BACKUP_FILE.gz"

# ─── Backup ─────────────────────────────────────────────────
pg_dump "$DATABASE_URL" \
  --format=custom \
  --compress=9 \
  --file="${BACKUP_FILE}.dump" \
  --verbose \
  --no-owner \
  --no-acl 2>&1 | tail -5

echo ""
echo "✅ Backup complete: ${BACKUP_FILE}.dump"
echo "   Size: $(du -h "${BACKUP_FILE}.dump" | cut -f1)"

# ─── Retention: keep last 30 days ───────────────────────────
find "$BACKUP_DIR" -name "xennic-backup-*.dump" -mtime +30 -delete 2>/dev/null || true

echo "💾 Retention: keeping last 30 days"
echo "🎉 Done at $(date)"
