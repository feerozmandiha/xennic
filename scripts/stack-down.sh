#!/bin/bash
# ============================================================
# Xennic — Production Stack Down
# اجرا از ریشه monorepo: bash scripts/stack-down.sh
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="$PROJECT_ROOT/infrastructure/docker/compose/production/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/infrastructure/docker/.env"

echo "🛑 Stopping production stack..."
docker compose \
  --env-file "$ENV_FILE" \
  -f "$COMPOSE_FILE" \
  down
echo "✅ Stack stopped"

read -p "Remove volumes too? (yes/no): " del_volumes
if [ "$del_volumes" = "yes" ]; then
  echo "🗑️  Removing volumes..."
  docker compose \
    --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" \
    down -v
  echo "✅ Volumes removed"
fi
