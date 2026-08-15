#!/bin/sh
set -eu

# ──────────────────────────────────────────────────────────────────────────────
# Xennic API container entrypoint
#  1. Wait for PostgreSQL and apply Prisma migrations (with retries).
#  2. Run the provided command if one is given (e.g. `node prisma/seed.js`),
#     otherwise start the NestJS API.
# ──────────────────────────────────────────────────────────────────────────────

MAX_ATTEMPTS="${MIGRATE_MAX_ATTEMPTS:-40}"
RETRY_SECONDS="${MIGRATE_RETRY_SECONDS:-3}"

echo "[api-entrypoint] Applying Prisma migrations (DATABASE_URL=${DATABASE_URL:-<unset>})..."

attempt=1
until ./node_modules/.bin/prisma migrate deploy; do
  if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
    echo "[api-entrypoint] ERROR: migrations failed after ${attempt} attempts" >&2
    exit 1
  fi
  echo "[api-entrypoint] Database not ready or migration failed (attempt ${attempt}/${MAX_ATTEMPTS}); retrying in ${RETRY_SECONDS}s..."
  attempt=$((attempt + 1))
  sleep "$RETRY_SECONDS"
done

echo "[api-entrypoint] Migrations applied."

# Allow one-off commands (e.g. seeding) to run against the migrated database.
if [ "$#" -gt 0 ]; then
  echo "[api-entrypoint] Executing command: $*"
  exec "$@"
fi

echo "[api-entrypoint] Starting API..."
exec node apps/api/dist/main.js
