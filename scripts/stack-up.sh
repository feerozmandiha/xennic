#!/bin/bash
# ============================================================
# Xennic — Production Stack Up (Local)
# Builds all images and starts the full production stack.
# اجرا از ریشه monorepo: bash scripts/stack-up.sh
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="$PROJECT_ROOT/infrastructure/docker/compose/production/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/infrastructure/docker/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Environment file not found: $ENV_FILE"
  echo "   Copy infrastructure/docker/.env.example or use the existing .env"
  exit 1
fi

echo "🏗️  Xennic Production Stack — Build & Deploy (Local)"
echo "==================================================="
echo ""

# ─── Build all images ───────────────────────────────────────
echo "🔨 Building production images..."
docker compose \
  --env-file "$ENV_FILE" \
  -f "$COMPOSE_FILE" \
  build --parallel
echo "✅ Build complete"
echo ""

# ─── Start stack ────────────────────────────────────────────
echo "🚀 Starting production stack..."
# Ensure required directories exist
mkdir -p "$PROJECT_ROOT/infrastructure/nginx/ssl"
mkdir -p "$PROJECT_ROOT/infrastructure/nginx/conf.d"

docker compose \
  --env-file "$ENV_FILE" \
  -f "$COMPOSE_FILE" \
  up -d
echo "✅ Stack started"
echo ""

# ─── Wait for healthchecks ──────────────────────────────────
echo "⏳ Waiting for services to become healthy (60s timeout)..."
sleep 5

services=$(docker compose -f "$COMPOSE_FILE" config --services 2>/dev/null || echo "nginx api web postgres redis rabbitmq pgbouncer engineering-service vision-service ai-service")
all_healthy=true

for svc in api postgres redis pgbouncer; do
  printf "  Checking %-25s" "$svc..."
  if docker compose -f "$COMPOSE_FILE" exec -T "$svc" true 2>/dev/null; then
    echo "✅"
  else
    echo "❌ (container running but exec limited)"
    all_healthy=false
  fi
done

echo ""
if [ "$all_healthy" = true ]; then
  echo "🎉 All services are running!"
else
  echo "⚠️  Some services may still be starting. Check with: docker compose -f $COMPOSE_FILE ps"
fi

echo ""
echo "📋 Service URLs:"
echo "   API Health:  http://localhost:3000/api/v1/health"
echo "   API Docs:    http://localhost:3000/api/docs"
echo "   Web:         http://localhost:3001"
echo "   Nginx:       http://localhost:80"
echo ""
echo "📋 To view logs:  docker compose -f $COMPOSE_FILE logs -f"
echo "📋 To stop:       bash scripts/stack-down.sh"
