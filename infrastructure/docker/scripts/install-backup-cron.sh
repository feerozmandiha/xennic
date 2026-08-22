#!/usr/bin/env bash
set -euo pipefail

# Installs a host cron entry for the production PostgreSQL backup helper.
# Intended for single-server Docker Compose deployments.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

CRON_FILE="${CRON_FILE:-/etc/cron.d/xennic-postgres-backup}"
CRON_SCHEDULE="${CRON_SCHEDULE:-17 2 * * *}"
CRON_USER="${CRON_USER:-$(id -un)}"
BACKUP_DIR="${BACKUP_DIR:-$REPO_ROOT/backups/postgres}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/infrastructure/docker/compose/production/.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPO_ROOT/infrastructure/docker/compose/production/docker-compose.yml}"
LOG_FILE="${LOG_FILE:-/var/log/xennic-postgres-backup.log}"
BACKUP_SCRIPT="$REPO_ROOT/infrastructure/docker/scripts/backup-postgres.sh"

if [[ ! -x "$BACKUP_SCRIPT" ]]; then
  echo "ERROR: backup script is not executable: $BACKUP_SCRIPT" >&2
  echo "Run: chmod +x $BACKUP_SCRIPT" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: env file not found: $ENV_FILE" >&2
  exit 1
fi

cron_line="$CRON_SCHEDULE $CRON_USER cd $REPO_ROOT && ENV_FILE=$ENV_FILE COMPOSE_FILE=$COMPOSE_FILE BACKUP_DIR=$BACKUP_DIR BACKUP_RETENTION_DAYS=$BACKUP_RETENTION_DAYS $BACKUP_SCRIPT >> $LOG_FILE 2>&1"

tmp_file="$(mktemp)"
{
  echo "# Managed by Xennic install-backup-cron.sh"
  echo "SHELL=/bin/bash"
  echo "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
  echo "$cron_line"
} > "$tmp_file"

if [[ "$CRON_FILE" == /etc/cron.d/* ]]; then
  sudo install -m 0644 "$tmp_file" "$CRON_FILE"
else
  install -m 0644 "$tmp_file" "$CRON_FILE"
fi

rm -f "$tmp_file"

echo "Installed backup cron file: $CRON_FILE"
echo "Schedule: $CRON_SCHEDULE"
echo "Backup dir: $BACKUP_DIR"
echo "Retention days: $BACKUP_RETENTION_DAYS"
