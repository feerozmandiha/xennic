#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Xennic Platform — Phase-0 Alpha deploy script
#
# Prerequisites on the target server: Docker + Docker Compose v2.
# No Node/pnpm needed on the host (images build inside containers).
#
# Usage:
#   ./infrastructure/docker/scripts/deploy.sh            # build + up + healthcheck
#   ./infrastructure/docker/scripts/deploy.sh --seed     # also seed DB + admin
#   ./infrastructure/docker/scripts/deploy.sh --down     # stop the stack
#   ./infrastructure/docker/scripts/deploy.sh --logs     # tail logs
#
# See docs/deployment/phase-0-alpha-launch.md for the full runbook.
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
COMPOSE_DIR="$REPO_ROOT/infrastructure/docker/compose/production"
COMPOSE_FILE="$COMPOSE_DIR/docker-compose.yml"
ENV_FILE="$COMPOSE_DIR/.env"
ENV_EXAMPLE="$COMPOSE_DIR/.env.production.example"
JWT_DIR="$COMPOSE_DIR/secrets/jwt"
JWT_PRIVATE="$JWT_DIR/jwtRS256.key"
JWT_PUBLIC="$JWT_DIR/jwtRS256.key.pub"

SEED=0
ACTION="up"
NO_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --seed)    SEED=1 ;;
    --down)    ACTION="down" ;;
    --logs)    ACTION="logs" ;;
    --no-build) NO_BUILD=1 ;;
    -h|--help)
      sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

cd "$REPO_ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is not installed." >&2
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose (v2) is not available." >&2
  exit 1
fi

dc() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

case "$ACTION" in
  down)
    dc down
    exit 0
    ;;
  logs)
    dc logs -f --tail=200
    exit 0
    ;;
esac

# ── 1. Environment file ───────────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found." >&2
  echo "       Copy the example and fill in every CHANGE_ME value:" >&2
  echo "         cp $ENV_EXAMPLE $ENV_FILE" >&2
  exit 1
fi

# ── 2. JWT RSA keys (idempotent) ──────────────────────────────────────────────
mkdir -p "$JWT_DIR"
if [ ! -f "$JWT_PRIVATE" ] || [ ! -f "$JWT_PUBLIC" ]; then
  echo "==> Generating JWT RSA keypair..."
  openssl genrsa -out "$JWT_PRIVATE" 4096 2>/dev/null
  openssl rsa -in "$JWT_PRIVATE" -pubout -out "$JWT_PUBLIC" 2>/dev/null
  chmod 600 "$JWT_PRIVATE" "$JWT_PUBLIC"
  echo "    Keys written to $JWT_DIR/"
fi

# ── 3. Build images ───────────────────────────────────────────────────────────
if [ "$NO_BUILD" -eq 0 ]; then
  echo "==> Building images (api, web, python services)..."
  dc build --pull
fi

# ── 4. Start the stack ────────────────────────────────────────────────────────
echo "==> Starting the production stack..."
dc up -d

# ── 5. Wait for the API to become healthy through nginx ───────────────────────
echo "==> Waiting for the API health endpoint (via nginx on port ${NGINX_HTTP_PORT:-80})..."
BASE_URL="http://localhost:${NGINX_HTTP_PORT:-80}"
attempt=1
max_attempts="${HEALTHCHECK_MAX_ATTEMPTS:-120}"
until curl -sf "$BASE_URL/api/v1/health" >/dev/null 2>&1; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "ERROR: API did not become healthy after ${attempt} attempts." >&2
    echo "Recent logs:" >&2
    dc logs --tail=60 api nginx web
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep 5
done

echo ""
echo "✅ Phase-0 Alpha stack is UP"
echo "   Web:    $BASE_URL/"
echo "   API:    $BASE_URL/api/v1/health"
echo "   Swagger:$BASE_URL/api/docs"

# ── 6. Optional seed ──────────────────────────────────────────────────────────
if [ "$SEED" -eq 1 ]; then
  echo ""
  echo "==> Seeding database + admin user (ADMIN_EMAIL/ADMIN_PASSWORD from .env)..."
  dc run --rm api node prisma/seed.js
fi

echo ""
echo "Service status:"
dc ps
