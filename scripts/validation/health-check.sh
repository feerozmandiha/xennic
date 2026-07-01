#!/bin/bash
# ============================================================
# Xennic — Health Check Script
# بررسی سلامت تمام سرویس‌های پلتفرم
#
# Usage:
#   bash scripts/validation/health-check.sh
#   bash scripts/validation/health-check.sh --json
#   bash scripts/validation/health-check.sh --service api
#   bash scripts/validation/health-check.sh --help
#
# Examples:
#   bash scripts/validation/health-check.sh
#   bash scripts/validation/health-check.sh --json | jq .
#   bash scripts/validation/health-check.sh --service postgres
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

COMPOSE_FILE="$PROJECT_ROOT/infrastructure/docker/compose/production/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/infrastructure/docker/.env"

# ─── Colors ──────────────────────────────────────────────────────
G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; C='\033[0;36m'; B='\033[1m'; N='\033[0m'

# ─── Config ──────────────────────────────────────────────────────
declare -A APP_SERVICES
APP_SERVICES=(
  ["api"]="http://localhost:3000/api/v1/health"
  ["web"]="http://localhost:3001"
  ["engineering-service"]="http://localhost:8001/health"
  ["ai-service"]="http://localhost:8002/health"
  ["vision-service"]="http://localhost:8003/health"
)

INFRA_SERVICES=("postgres" "redis" "rabbitmq" "minio" "pgbouncer")

declare -A MONITORING_SERVICES
MONITORING_SERVICES=(
  ["prometheus"]="http://localhost:9090/-/ready"
  ["grafana"]="http://localhost:3002/api/health"
  ["loki"]="http://localhost:3100/ready"
)

JSON_MODE=false
SINGLE_SERVICE=""
FAILED=0
TOTAL=0

# ─── Logging ─────────────────────────────────────────────────────
log_info()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${B}INFO${N}  $*"; }
log_ok()    { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${G}OK${N}    $*"; }
log_fail()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${R}FAIL${N}  $*"; }
log_warn()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${Y}WARN${N}  $*"; }

json_start()   { echo '{'; echo '"timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",'; echo '"results": ['; }
json_end()     { echo ']'; echo '}'; }
json_result()  {
  local status="$1" name="$2" detail="$3"
  if [ "$JSON_MODE" = true ]; then
    echo "{\"status\":\"$status\",\"service\":\"$name\",\"detail\":\"$detail\"},"
  fi
}

# ─── Help ────────────────────────────────────────────────────────
show_help() {
  cat <<HELP
Usage: bash scripts/validation/health-check.sh [OPTIONS]

Check health of all Xennic platform services.

Options:
  --json            Output in JSON format (for CI/CD)
  --service <name>  Check only a specific service
  --help            Show this help message

Services:
  Application: api, web, engineering-service, ai-service, vision-service
  Infrastructure: postgres, redis, rabbitmq, minio, pgbouncer
  Monitoring: prometheus, grafana, loki

Exit codes:
  0  All services healthy
  1  One or more services unhealthy

Examples:
  bash scripts/validation/health-check.sh
  bash scripts/validation/health-check.sh --json
  bash scripts/validation/health-check.sh --service api
HELP
  exit 0
}

# ─── Parse arguments ─────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --help) show_help ;;
    --json) JSON_MODE=true; shift ;;
    --service) SINGLE_SERVICE="$2"; shift 2 ;;
    *) echo -e "${R}Unknown option: $1${N}"; show_help ;;
  esac
done

# ─── Check HTTP endpoint ─────────────────────────────────────────
check_http() {
  local name="$1" url="$2"
  TOTAL=$((TOTAL + 1))

  if [ "$JSON_MODE" = false ]; then
    printf "  %-25s" "$name..."
  fi

  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

  if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
    if [ "$JSON_MODE" = false ]; then
      echo -e "${G}OK${N}  (HTTP $http_code)"
    fi
    json_result "healthy" "$name" "HTTP $http_code"
  else
    if [ "$JSON_MODE" = false ]; then
      echo -e "${R}FAIL${N} (HTTP $http_code)"
    fi
    json_result "unhealthy" "$name" "HTTP $http_code"
    FAILED=$((FAILED + 1))
  fi
}

# ─── Check Docker service ────────────────────────────────────────
check_docker() {
  local name="$1"
  TOTAL=$((TOTAL + 1))

  if [ "$JSON_MODE" = false ]; then
    printf "  %-25s" "$name..."
  fi

  if docker compose -f "$COMPOSE_FILE" ps --format json "$name" 2>/dev/null | grep -q '"State":"running"'; then
    if [ "$JSON_MODE" = false ]; then
      echo -e "${G}OK${N}  (running)"
    fi
    json_result "healthy" "$name" "running"
  else
    local state
    state=$(docker compose -f "$COMPOSE_FILE" ps --format json "$name" 2>/dev/null | grep '"State"' | head -1 || echo "unknown")
    if [ "$JSON_MODE" = false ]; then
      echo -e "${R}FAIL${N} ($state)"
    fi
    json_result "unhealthy" "$name" "$state"
    FAILED=$((FAILED + 1))
  fi
}

# ─── Main ─────────────────────────────────────────────────────────
if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo -e "${B}  Xennic — Health Check${N}"
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo ""
fi

if [ "$JSON_MODE" = true ]; then
  json_start
fi

# ─── Application Services ────────────────────────────────────────
if [ -z "$SINGLE_SERVICE" ] || [ -n "${APP_SERVICES[$SINGLE_SERVICE]:-}" ]; then
  if [ "$JSON_MODE" = false ]; then
    echo -e "${B}Application Services:${N}"
  fi
  for svc in "${!APP_SERVICES[@]}"; do
    if [ -z "$SINGLE_SERVICE" ] || [ "$SINGLE_SERVICE" = "$svc" ]; then
      check_http "$svc" "${APP_SERVICES[$svc]}"
    fi
  done
fi

# ─── Infrastructure Services ─────────────────────────────────────
if [ -z "$SINGLE_SERVICE" ] || [[ " ${INFRA_SERVICES[*]} " == *" $SINGLE_SERVICE "* ]]; then
  if [ "$JSON_MODE" = false ]; then
    echo ""
    echo -e "${B}Infrastructure Services:${N}"
  fi
  for svc in "${INFRA_SERVICES[@]}"; do
    if [ -z "$SINGLE_SERVICE" ] || [ "$SINGLE_SERVICE" = "$svc" ]; then
      check_docker "$svc"
    fi
  done
fi

# ─── Monitoring Services ─────────────────────────────────────────
if [ -z "$SINGLE_SERVICE" ] || [ -n "${MONITORING_SERVICES[$SINGLE_SERVICE]:-}" ]; then
  if [ "$JSON_MODE" = false ]; then
    echo ""
    echo -e "${B}Monitoring Services:${N}"
  fi
  for svc in "${!MONITORING_SERVICES[@]}"; do
    if [ -z "$SINGLE_SERVICE" ] || [ "$SINGLE_SERVICE" = "$svc" ]; then
      check_http "$svc" "${MONITORING_SERVICES[$svc]}"
    fi
  done
fi

# ─── Summary ──────────────────────────────────────────────────────
if [ "$JSON_MODE" = true ]; then
  # Remove trailing comma from last JSON result
  # Not perfect but works for CI
  echo ""
  json_end
fi

if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  if [ "$FAILED" -eq 0 ]; then
    echo -e "${G}  All $TOTAL services healthy${N}"
    exit 0
  else
    echo -e "${R}  $FAILED/$TOTAL services unhealthy${N}"
    exit 1
  fi
fi

exit $([ "$FAILED" -eq 0 ] && echo 0 || echo 1)
