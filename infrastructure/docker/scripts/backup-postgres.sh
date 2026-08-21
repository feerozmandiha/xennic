#!/usr/bin/env bash
set -euo pipefail

# Xennic PostgreSQL backup helper for the production Docker Compose stack.
# Creates a pg_dump custom-format archive plus a SHA-256 checksum and removes
# old backup archives according to BACKUP_RETENTION_DAYS.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

COMPOSE_FILE="${COMPOSE_FILE:-$REPO_ROOT/infrastructure/docker/compose/production/docker-compose.yml}"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/infrastructure/docker/compose/production/.env}"
BACKUP_DIR="${BACKUP_DIR:-$REPO_ROOT/backups/postgres}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
BACKUP_PREFIX="${BACKUP_PREFIX:-xennic-postgres}"
LOCK_DIR="${LOCK_DIR:-/tmp/xennic-postgres-backup.lock}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "ERROR: compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: env file not found: $ENV_FILE" >&2
  echo "Create it from infrastructure/docker/compose/production/.env.production.example" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is required" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose plugin is required" >&2
  exit 1
fi

if ! [[ "$BACKUP_RETENTION_DAYS" =~ ^[0-9]+$ ]]; then
  echo "ERROR: BACKUP_RETENTION_DAYS must be a non-negative integer" >&2
  exit 1
fi

cleanup_lock() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "ERROR: another backup process is already running: $LOCK_DIR" >&2
  exit 1
fi
trap cleanup_lock EXIT

umask 077
mkdir -p "$BACKUP_DIR"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$BACKUP_DIR/${BACKUP_PREFIX}-${timestamp}.dump"
tmp_archive="$archive.tmp"
checksum="$archive.sha256"

echo "==> Creating PostgreSQL backup: $archive"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres sh -c '
  set -eu
  export PGPASSWORD="$POSTGRES_PASSWORD"
  pg_dump \
    --username="$POSTGRES_USER" \
    --dbname="$POSTGRES_DB" \
    --format=custom \
    --no-owner \
    --no-acl
' > "$tmp_archive"

mv "$tmp_archive" "$archive"
sha256sum "$archive" > "$checksum"

echo "==> Backup checksum written: $checksum"

if [[ "$BACKUP_RETENTION_DAYS" -gt 0 ]]; then
  echo "==> Removing backups older than $BACKUP_RETENTION_DAYS days from $BACKUP_DIR"
  find "$BACKUP_DIR" -type f \
    \( -name "${BACKUP_PREFIX}-*.dump" -o -name "${BACKUP_PREFIX}-*.dump.sha256" \) \
    -mtime "+$BACKUP_RETENTION_DAYS" \
    -print \
    -delete
fi

echo "==> Backup completed successfully: $archive"
