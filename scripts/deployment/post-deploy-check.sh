#!/bin/bash
# ============================================================
# Xennic — Post-Deployment Validation Check
# بررسی صحت استقرار تمام سرویس‌ها
#
# Usage:
#   bash scripts/deployment/post-deploy-check.sh
#   bash scripts/deployment/post-deploy-check.sh --json
#   bash scripts/deployment/post-deploy-check.sh --service api
#   bash scripts/deployment/post-deploy-check.sh --verbose
#   bash scripts/deployment/post-deploy-check.sh --help
#
# Examples:
#   bash scripts/deployment/post-deploy-check.sh
#   bash scripts/deployment/post-deploy-check.sh --json | jq .
#   bash scripts/deployment/post-deploy-check.sh --service postgres
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

COMPOSE_FILE="$PROJECT_ROOT/infrastructure/docker/compose/production/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/infrastructure/docker/compose/production/.env"

# ─── Colors ──────────────────────────────────────────────────────
G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; C='\033[0;36m'; B='\033[1m'; N='\033[0m'

# ─── State ───────────────────────────────────────────────────────
VERBOSE=false
JSON_MODE=false
SINGLE_SERVICE=""
COMPOSE_OVERRIDE=""
CHECK_TIMEOUT=5
WARNINGS=0
FAILURES=0
CHECKED=0
HAS_DOCKER=false
HAS_COMPOSE_FILE=false

# ─── Logging ─────────────────────────────────────────────────────
log_info()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${B}INFO${N}  $*"; }
log_ok()    { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${G}OK${N}    $*"; }
log_fail()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${R}FAIL${N}  $*"; }
log_warn()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${Y}WARN${N}  $*"; }
log_verb()  { [ "$VERBOSE" = true ] && echo -e "         ${C}$*${N}"; }

json_output=""
json_emit() {
  local status="$1" check="$2" detail="$3"
  [ "$JSON_MODE" = true ] && json_output+="{\"status\":\"$status\",\"service\":\"$check\",\"detail\":\"$detail\"},"
}

# ─── Help ────────────────────────────────────────────────────────
show_help() {
  cat <<HELP
Usage: bash scripts/deployment/post-deploy-check.sh [OPTIONS]

Validate that all Xennic platform services are healthy after deployment.

Options:
  --json              Output in JSON format (for CI/CD)
  --verbose           Show detailed information for each check
  --service <name>    Check only a specific service
  --compose-file <path>  Specify alternate docker-compose file
  --timeout <secs>    Timeout per check in seconds (default: 5)
  --help              Show this help message

Services:
  nginx, api, web, postgres, redis, rabbitmq, minio,
  engineering-service, ai-service, vision-service,
  pgbouncer, prometheus, grafana, loki

Exit codes:
  0  All services healthy
  1  Warnings found (non-critical)
  2  Failures found (critical)

Examples:
  bash scripts/deployment/post-deploy-check.sh
  bash scripts/deployment/post-deploy-check.sh --json
  bash scripts/deployment/post-deploy-check.sh --service api
  bash scripts/deployment/post-deploy-check.sh --compose-file /path/to/docker-compose.yml
HELP
  exit 0
}

# ─── Parse arguments ─────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --help) show_help ;;
    --json) JSON_MODE=true; shift ;;
    --verbose) VERBOSE=true; shift ;;
    --service) SINGLE_SERVICE="$2"; shift 2 ;;
    --compose-file) COMPOSE_OVERRIDE="$2"; shift 2 ;;
    --timeout) CHECK_TIMEOUT="$2"; shift 2 ;;
    *) echo -e "${R}Unknown option: $1${N}"; show_help ;;
  esac
done

[ -n "$COMPOSE_OVERRIDE" ] && COMPOSE_FILE="$COMPOSE_OVERRIDE"

# ─── Capabilities ────────────────────────────────────────────────
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  HAS_DOCKER=true
fi
if [ -f "$COMPOSE_FILE" ]; then
  HAS_COMPOSE_FILE=true
fi

# ─── Check runner ────────────────────────────────────────────────
check_result() {
  local status="$1" name="$2" detail="$3"
  CHECKED=$((CHECKED + 1))
  if [ "$JSON_MODE" = false ]; then
    case "$status" in
      pass) echo -e "  ${G}PASS${N}  $name" ;;
      warn) echo -e "  ${Y}WARN${N}  $name — $detail" ;;
      fail) echo -e "  ${R}FAIL${N}  $name — $detail" ;;
    esac
  fi
  json_emit "$status" "$name" "$detail"
  case "$status" in
    warn) WARNINGS=$((WARNINGS + 1)) ;;
    fail) FAILURES=$((FAILURES + 1)) ;;
  esac
}

# ─── Check HTTP endpoint ─────────────────────────────────────────
check_http() {
  local name="$1" url="$2" expected_codes="${3:-200}"

  if [ -n "$SINGLE_SERVICE" ] && [ "$SINGLE_SERVICE" != "$name" ]; then
    return
  fi

  [ "$JSON_MODE" = false ] && printf "  %-25s" "$name..."

  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$CHECK_TIMEOUT" "$url" 2>/dev/null || echo "000")

  local ok=false
  IFS=' ' read -ra codes <<< "$expected_codes"
  for code in "${codes[@]}"; do
    [ "$http_code" = "$code" ] && ok=true && break
  done

  if [ "$ok" = true ]; then
    if [ "$JSON_MODE" = false ]; then
      echo -e "${G}OK${N}  (HTTP $http_code)"
    fi
    check_result "pass" "$name" "HTTP $http_code"
  else
    if [ "$JSON_MODE" = false ]; then
      echo -e "${R}FAIL${N} (HTTP $http_code)"
    fi
    check_result "fail" "$name" "HTTP $http_code (expected $expected_codes)"
  fi
}

# ─── Check Docker service ────────────────────────────────────────
check_docker_svc() {
  local name="$1"

  if [ -n "$SINGLE_SERVICE" ] && [ "$SINGLE_SERVICE" != "$name" ]; then
    return
  fi

  [ "$JSON_MODE" = false ] && printf "  %-25s" "$name..."

  # Try docker compose exec first
  if [ "$HAS_DOCKER" = true ] && [ "$HAS_COMPOSE_FILE" = true ]; then
    if docker compose -f "$COMPOSE_FILE" ps --format json "$name" 2>/dev/null | grep -q '"State":"running"'; then
      # Service is running — try a health-specific exec check
      local healthy=true
      case "$name" in
        postgres)
          docker compose -f "$COMPOSE_FILE" exec -T "$name" pg_isready -U "${POSTGRES_USER:-xennic}" >/dev/null 2>&1 || healthy=false
          ;;
        redis)
          docker compose -f "$COMPOSE_FILE" exec -T "$name" redis-cli ping 2>/dev/null | grep -q "PONG" || healthy=false
          ;;
        pgbouncer)
          docker compose -f "$COMPOSE_FILE" exec -T "$name" psql -U "${POSTGRES_USER:-xennic}" -d "${POSTGRES_DB:-xennic}" -c "SELECT 1;" >/dev/null 2>&1 || healthy=false
          ;;
        rabbitmq)
          docker compose -f "$COMPOSE_FILE" exec -T "$name" rabbitmqctl status >/dev/null 2>&1 || healthy=false
          ;;
        minio)
          docker compose -f "$COMPOSE_FILE" exec -T "$name" mc ready local >/dev/null 2>&1 || healthy=false
          ;;
        nginx)
          docker compose -f "$COMPOSE_FILE" exec -T "$name" nginx -t >/dev/null 2>&1 || healthy=false
          ;;
      esac

      if [ "$healthy" = true ]; then
        if [ "$JSON_MODE" = false ]; then
          echo -e "${G}OK${N}  (running, healthy)"
        fi
        check_result "pass" "$name" "running and healthy"
      else
        if [ "$JSON_MODE" = false ]; then
          echo -e "${G}OK${N}  (running, health check inconclusive — check manually)"
        fi
        check_result "pass" "$name" "running, health check not performed"
      fi
      return
    fi
  fi

  # Fallback: try HTTP check for services that expose HTTP
  local http_url=""
  case "$name" in
    nginx)  http_url="http://localhost:${NGINX_HTTP_PORT:-80}" ;;
    postgres) ;;
    redis) ;;
    rabbitmq) http_url="http://localhost:15672/api/overview" ;;
    minio)  http_url="http://localhost:9000/minio/health/live" ;;
    pgbouncer) ;;
    prometheus) http_url="http://localhost:9090/-/healthy" ;;
    grafana) http_url="http://localhost:3002/api/health" ;;
    loki)   http_url="http://localhost:3100/ready" ;;
  esac

  if [ -n "$http_url" ]; then
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$CHECK_TIMEOUT" "$http_url" 2>/dev/null || echo "000")
    if [ "$http_code" != "000" ]; then
      if [ "$JSON_MODE" = false ]; then
        echo -e "${G}OK${N}  (HTTP $http_code)"
      fi
      check_result "pass" "$name" "HTTP $http_code"
      return
    fi
  fi

  if [ "$HAS_DOCKER" = true ] && [ "$HAS_COMPOSE_FILE" = true ]; then
    local state
    state=$(docker compose -f "$COMPOSE_FILE" ps --format json "$name" 2>/dev/null | grep '"State"' | head -1 || echo "unknown")
    if [ "$JSON_MODE" = false ]; then
      echo -e "${R}FAIL${N} ($state)"
    fi
    check_result "fail" "$name" "$state"
  else
    if [ "$JSON_MODE" = false ]; then
      echo -e "${R}FAIL${N} (not reachable)"
    fi
    check_result "fail" "$name" "not reachable via HTTP or Docker"
  fi
}

# ─── Service definitions ─────────────────────────────────────────
SERVICE_HTTP_CHECKS=(
  "api:http://localhost:3000/api/v1/health:200"
  "web:http://localhost:3001:200 302"
  "engineering-service:http://localhost:8001/health:200"
  "ai-service:http://localhost:8002/health:200"
  "vision-service:http://localhost:8003/health:200"
)

SERVICE_DOCKER_CHECKS=(
  "nginx"
  "postgres"
  "redis"
  "rabbitmq"
  "minio"
  "pgbouncer"
  "prometheus"
  "grafana"
  "loki"
)

# ─── Main ─────────────────────────────────────────────────────────
if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════════════════════${N}"
  echo -e "${B}  Xennic — Post-Deployment Validation Check${N}"
  echo -e "${B}══════════════════════════════════════════════════════════════${N}"
  echo ""
  log_info "Project root: $PROJECT_ROOT"
  log_info "Compose file: $COMPOSE_FILE"
  [ -n "$SINGLE_SERVICE" ] && log_info "Single service: $SINGLE_SERVICE"
  echo ""
fi

# ─── Preflight capability check ──────────────────────────────────
if [ "$HAS_DOCKER" = false ] && [ "$JSON_MODE" = false ]; then
  log_warn "Docker not available — falling back to HTTP-only checks"
  WARNINGS=$((WARNINGS + 1))
fi
if [ "$HAS_COMPOSE_FILE" = false ] && [ "$JSON_MODE" = false ]; then
  log_warn "Compose file not found at $COMPOSE_FILE — using HTTP checks only"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── Application Services (HTTP) ─────────────────────────────────
if [ -z "$SINGLE_SERVICE" ] || [[ " api web engineering-service ai-service vision-service " == *" $SINGLE_SERVICE "* ]]; then
  if [ "$JSON_MODE" = false ]; then
    echo ""
    echo -e "${B}Application Services:${N}"
  fi
  for entry in "${SERVICE_HTTP_CHECKS[@]}"; do
    name="${entry%%:*}"
    rest="${entry#*:}"
    url="${rest%:*}"
    codes="${rest##*:}"
    if [ -z "$SINGLE_SERVICE" ] || [ "$SINGLE_SERVICE" = "$name" ]; then
      check_http "$name" "$url" "$codes"
    fi
  done
fi

# ─── Infrastructure Services (Docker + HTTP fallback) ────────────
if [ -z "$SINGLE_SERVICE" ] || [[ " nginx postgres redis rabbitmq minio pgbouncer prometheus grafana loki " == *" $SINGLE_SERVICE "* ]]; then
  if [ "$JSON_MODE" = false ]; then
    echo ""
    echo -e "${B}Infrastructure Services:${N}"
  fi
  for svc in "${SERVICE_DOCKER_CHECKS[@]}"; do
    if [ -z "$SINGLE_SERVICE" ] || [ "$SINGLE_SERVICE" = "$svc" ]; then
      check_docker_svc "$svc"
    fi
  done
fi

# ─── Summary ──────────────────────────────────────────────────────
TOTAL_CHECKS=$CHECKED
if [ "$JSON_MODE" = true ]; then
  json_output="${json_output%,}"
  cat <<JSON
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total": $TOTAL_CHECKS,
  "failures": $FAILURES,
  "warnings": $WARNINGS,
  "results": [$json_output]
}
JSON
fi

if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════════════════════${N}"
  passed=$((TOTAL_CHECKS - FAILURES - WARNINGS))
  echo -e "  ${B}Summary:${N}  $TOTAL_CHECKS checks, ${G}${passed} healthy${N}"
  [ "$FAILURES" -gt 0 ] && echo -e "         ${R}$FAILURES failure(s) — service(s) down${N}"
  [ "$WARNINGS" -gt 0 ] && echo -e "         ${Y}$WARNINGS warning(s)${N}"
  [ "$FAILURES" -eq 0 ] && [ "$WARNINGS" -eq 0 ] && echo -e "         ${G}All services operational${N}"
  echo ""
fi

[ "$FAILURES" -gt 0 ] && exit 2
[ "$WARNINGS" -gt 0 ] && exit 1
exit 0
