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

# ── 1a. Reject unfilled placeholder secrets ───────────────────────────────────
# Only the variables that this stack actually consumes are enforced; optional
# integrations (SMTP, LLM providers, Zarinpal, Grafana...) may stay as-is.
REQUIRED_SECRETS="POSTGRES_PASSWORD REDIS_PASSWORD RABBITMQ_DEFAULT_PASS MINIO_ROOT_USER MINIO_ROOT_PASSWORD AI_MASTER_KEY ADMIN_PASSWORD"
unfilled=""
for key in $REQUIRED_SECRETS; do
  value="$(grep -E "^${key}=" "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
  case "$value" in
    ''|CHANGE_ME*) unfilled="$unfilled $key" ;;
  esac
done

if [ -n "$unfilled" ]; then
  echo "ERROR: the following required secrets are still empty or set to a CHANGE_ME" >&2
  echo "       placeholder in $ENV_FILE:" >&2
  for key in $unfilled; do echo "         - $key" >&2; done
  echo "" >&2
  echo "       Generate strong values (letters, digits, - and _ only, because they are" >&2
  echo "       embedded in connection URLs):" >&2
  echo "         openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 32" >&2
  echo "" >&2
  echo "       Set ALLOW_INSECURE_DEFAULTS=1 to bypass this check for a throwaway" >&2
  echo "       local trial (never on a public server)." >&2
  if [ "${ALLOW_INSECURE_DEFAULTS:-0}" != "1" ]; then
    exit 1
  fi
  echo "WARNING: ALLOW_INSECURE_DEFAULTS=1 — continuing with insecure credentials." >&2
fi

# ── 1b. Preflight: make sure the public HTTP port is free ─────────────────────
read_env() {
  grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '[:space:]'
}

NGINX_HTTP_PORT="$(read_env NGINX_HTTP_PORT)"
NGINX_HTTP_PORT="${NGINX_HTTP_PORT:-80}"

port_in_use() {
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]$1\$"
  elif command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
  else
    return 1
  fi
}

if ! docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps --status running 2>/dev/null | grep -q nginx; then
  if port_in_use "$NGINX_HTTP_PORT"; then
    echo "ERROR: host port ${NGINX_HTTP_PORT} is already in use by another process." >&2
    echo "       Set a free port in $ENV_FILE, for example:" >&2
    echo "         NGINX_HTTP_PORT=8080" >&2
    echo "         FRONTEND_URL=http://localhost:8080" >&2
    echo "         API_PUBLIC_URL=http://localhost:8080" >&2
    echo "         CORS_ORIGINS=http://localhost:8080" >&2
    exit 1
  fi
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
if ! dc up -d; then
  echo "" >&2
  echo "ERROR: the stack failed to start. Recent logs from api/web/nginx:" >&2
  dc logs --tail=80 api web nginx || true
  exit 1
fi

# ── 5. Wait for the API to become healthy through nginx ───────────────────────
# NGINX_HTTP_PORT was already read from .env during the preflight step.
BASE_URL="http://localhost:${NGINX_HTTP_PORT}"

echo "==> Waiting for the API health endpoint (via nginx on port ${NGINX_HTTP_PORT})..."
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
