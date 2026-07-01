#!/bin/bash
# ============================================================
# Xennic — Backup Validation Script
# اعتبارسنجی آخرین فایل پشتیبان دیتابیس
#
# Usage:
#   bash scripts/validation/backup-check.sh
#   bash scripts/validation/backup-check.sh --json
#   bash scripts/validation/backup-check.sh --dir /custom/backup/path
#   bash scripts/validation/backup-check.sh --help
#
# Examples:
#   BACKUP_DIR=/var/backups/xennic bash scripts/validation/backup-check.sh
#   bash scripts/validation/backup-check.sh --json | jq .
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# ─── Colors ──────────────────────────────────────────────────────
G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; C='\033[0;36m'; B='\033[1m'; N='\033[0m'

# ─── Config ──────────────────────────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-/var/backups/xennic}"
MAX_AGE_HOURS=24
DISK_USAGE_THRESHOLD=80
JSON_MODE=false
FAILED=0

# ─── Logging ─────────────────────────────────────────────────────
log_info()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${B}INFO${N}  $*"; }
log_ok()    { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${G}OK${N}    $*"; }
log_fail()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${R}FAIL${N}  $*"; }
log_warn()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${Y}WARN${N}  $*"; }

json_result() {
  if [ "$JSON_MODE" = true ]; then
    echo "$@"
  fi
}

# ─── Help ────────────────────────────────────────────────────────
show_help() {
  cat <<HELP
Usage: bash scripts/validation/backup-check.sh [OPTIONS]

Validate the most recent database backup.

Options:
  --json            Output in JSON format (for CI/CD)
  --dir <path>      Backup directory (default: \$BACKUP_DIR or /var/backups/xennic)
  --help            Show this help message

Environment:
  BACKUP_DIR        Backup directory path (default: /var/backups/xennic)

Exit codes:
  0  All checks pass
  1  One or more checks failed

Examples:
  bash scripts/validation/backup-check.sh
  bash scripts/validation/backup-check.sh --json
  BACKUP_DIR=/custom/path bash scripts/validation/backup-check.sh
HELP
  exit 0
}

# ─── Parse arguments ─────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --help) show_help ;;
    --json) JSON_MODE=true; shift ;;
    --dir) BACKUP_DIR="$2"; shift 2 ;;
    *) echo -e "${R}Unknown option: $1${N}"; show_help ;;
  esac
done

# ─── Checks ──────────────────────────────────────────────────────
if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo -e "${B}  Xennic — Backup Validation${N}"
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo ""
  log_info "Backup directory: $BACKUP_DIR"
  echo ""
fi

checks_passed=0
checks_total=0

# ─── Check 1: Backup directory exists ────────────────────────────
check_dir_exists() {
  checks_total=$((checks_total + 1))
  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Backup directory exists..."
  fi

  if [ -d "$BACKUP_DIR" ]; then
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}"; fi
    checks_passed=$((checks_passed + 1))
    return 0
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${R}FAIL${N}  (directory not found)"; fi
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# ─── Check 2: Most recent backup file exists and is not empty ────
check_backup_file() {
  checks_total=$((checks_total + 1))

  local latest
  latest=$(ls -t "$BACKUP_DIR"/*.dump 2>/dev/null | head -1)

  if [ -z "$latest" ]; then
    latest=$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | head -1)
  fi
  if [ -z "$latest" ]; then
    latest=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -1)
  fi
  if [ -z "$latest" ]; then
    latest=$(find "$BACKUP_DIR" -maxdepth 1 -type f \( -name "*.dump" -o -name "*.sql" -o -name "*.sql.gz" -o -name "*.pgdump" \) -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | awk '{print $2}')
  fi

  if [ -z "$latest" ]; then
    if [ "$JSON_MODE" = false ]; then
      printf "  %-50s" "Backup file exists..."
      echo -e "${R}FAIL${N}  (no backup files found in $BACKUP_DIR)"
    fi
    json_result "{\"check\":\"backup_file_exists\",\"status\":\"fail\",\"detail\":\"No backup files found in $BACKUP_DIR\"}"
    FAILED=$((FAILED + 1))
    return 1
  fi

  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Backup file exists..."
    echo -e "${G}OK${N}  ($(basename "$latest"))"
    printf "  %-50s" "Backup file not empty..."
  fi

  local size
  size=$(stat -c%s "$latest" 2>/dev/null || stat -f%z "$latest" 2>/dev/null || echo 0)

  if [ "$size" -gt 0 ]; then
    if [ "$JSON_MODE" = false ]; then
      echo -e "${G}OK${N}  ($(numfmt --to=iec $size 2>/dev/null || echo "$size bytes"))"
    fi
    checks_passed=$((checks_passed + 1))
    BACKUP_FILE="$latest"
    return 0
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${R}FAIL${N}  (file is empty)"; fi
    json_result "{\"check\":\"backup_file_exists\",\"status\":\"fail\",\"detail\":\"File is empty: $(basename "$latest")\"}"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# ─── Check 3: Backup format validation ───────────────────────────
check_backup_format() {
  checks_total=$((checks_total + 1))
  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Backup format (pg_dump custom)..."
  fi

  local filename
  filename=$(basename "$BACKUP_FILE")

  if [[ "$filename" == *.dump ]] || [[ "$filename" == *.pgdump ]]; then
    # pg_dump custom format magic bytes: first 4 bytes are PGDM
    local magic
    magic=$(xxd -l 4 -p "$BACKUP_FILE" 2>/dev/null || od -A n -t x1 -N 4 "$BACKUP_FILE" 2>/dev/null | tr -d ' ' || echo "")
    if [[ "$magic" == "5047444d" ]]; then
      if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}  (valid pg_dump custom format)"; fi
      checks_passed=$((checks_passed + 1))
      return 0
    else
      if [ "$JSON_MODE" = false ]; then echo -e "${Y}WARN${N}  (magic bytes: $magic, expected PGDM)"; fi
      # Not a hard fail — might be plain SQL
      json_result "{\"check\":\"backup_format\",\"status\":\"warn\",\"detail\":\"Unexpected magic bytes: $magic\"}"
      return 0
    fi
  elif [[ "$filename" == *.sql ]]; then
    if head -1 "$BACKUP_FILE" | grep -q "PostgreSQL"; then
      if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}  (plain SQL)"; fi
      checks_passed=$((checks_passed + 1))
      return 0
    else
      if [ "$JSON_MODE" = false ]; then echo -e "${Y}WARN${N}  (SQL file but no PostgreSQL header)"; fi
      json_result "{\"check\":\"backup_format\",\"status\":\"warn\",\"detail\":\"SQL file without PostgreSQL header\"}"
      return 0
    fi
  elif [[ "$filename" == *.sql.gz ]]; then
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}  (gzipped SQL — skipping magic check)"; fi
    checks_passed=$((checks_passed + 1))
    return 0
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${Y}WARN${N}  (unknown format: $filename)"; fi
    json_result "{\"check\":\"backup_format\",\"status\":\"warn\",\"detail\":\"Unknown format: $filename\"}"
    return 0
  fi
}

# ─── Check 4: Backup age < 24 hours ──────────────────────────────
check_backup_age() {
  checks_total=$((checks_total + 1))
  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Backup age < ${MAX_AGE_HOURS}h..."
  fi

  local file_mtime now age_hours
  file_mtime=$(stat -c%Y "$BACKUP_FILE" 2>/dev/null || stat -f%m "$BACKUP_FILE" 2>/dev/null || echo 0)
  now=$(date +%s)
  age_hours=$(( (now - file_mtime) / 3600 ))

  local age_human
  if [ "$age_hours" -lt 1 ]; then
    age_human="$(( (now - file_mtime) / 60 )) minutes"
  else
    age_human="${age_hours} hours"
  fi

  if [ "$age_hours" -lt "$MAX_AGE_HOURS" ]; then
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}  ($age_human old)"; fi
    checks_passed=$((checks_passed + 1))
    return 0
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${R}FAIL${N}  ($age_human old — exceeds ${MAX_AGE_HOURS}h limit)"; fi
    json_result "{\"check\":\"backup_age\",\"status\":\"fail\",\"detail\":\"Backup is $age_hours hours old (max: $MAX_AGE_HOURS)\"}"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# ─── Check 5: Disk usage < 80% ───────────────────────────────────
check_disk_usage() {
  checks_total=$((checks_total + 1))
  if [ "$JSON_MODE" = false ]; then
    printf "  %-50s" "Disk usage < ${DISK_USAGE_THRESHOLD}%..."
  fi

  if ! command -v df &>/dev/null; then
    if [ "$JSON_MODE" = false ]; then echo -e "${Y}WARN${N}  (df not available)"; fi
    json_result "{\"check\":\"disk_usage\",\"status\":\"warn\",\"detail\":\"df command not available\"}"
    return 0
  fi

  local usage
  usage=$(df "$BACKUP_DIR" 2>/dev/null | awk 'NR==2 {print $5}' | tr -d '%' || echo 0)

  if [ "$usage" -lt "$DISK_USAGE_THRESHOLD" ]; then
    if [ "$JSON_MODE" = false ]; then echo -e "${G}OK${N}  (${usage}% used)"; fi
    checks_passed=$((checks_passed + 1))
    return 0
  else
    if [ "$JSON_MODE" = false ]; then echo -e "${R}FAIL${N}  (${usage}% used — exceeds ${DISK_USAGE_THRESHOLD}%)"; fi
    json_result "{\"check\":\"disk_usage\",\"status\":\"fail\",\"detail\":\"Disk usage at ${usage}% (threshold: ${DISK_USAGE_THRESHOLD}%)\"}"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# ─── Run checks ──────────────────────────────────────────────────
check_dir_exists
check_backup_file
if [ -n "${BACKUP_FILE:-}" ]; then
  check_backup_format
  check_backup_age
fi
check_disk_usage

# ─── Summary ──────────────────────────────────────────────────────
if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  if [ "$FAILED" -eq 0 ]; then
    echo -e "${G}  All $checks_total checks passed${N}"
    exit 0
  else
    echo -e "${R}  $FAILED/$checks_total checks failed${N}"
    exit 1
  fi
fi

exit $([ "$FAILED" -eq 0 ] && echo 0 || echo 1)
