#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/../../infrastructure/docker/.env" 2>/dev/null || true

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "══════════════════════════════════════════════"
echo "  XENNIC — Startup Order Validation"
echo "══════════════════════════════════════════════"
echo ""

# Dependency map: service -> prerequisites
declare -A DEPS
DEPS["postgres"]=""
DEPS["redis"]=""
DEPS["rabbitmq"]=""
DEPS["minio"]=""
DEPS["qdrant"]=""
DEPS["engineering-service"]="postgres"
DEPS["vision-service"]="postgres redis"
DEPS["ai-service"]="engineering-service:healthy postgres redis"
DEPS["api"]="postgres redis rabbitmq minio qdrant engineering-service:healthy"

# Check docker-compose depends_on configuration
echo "── Checking depends_on in docker-compose.yml ──"
COMPOSE_FILE="infrastructure/docker/compose/base/docker-compose.yml"

check_depends() {
  local service=$1 expected_deps=$2
  if [ -z "$expected_deps" ]; then
    echo -e "  ${GREEN}✓ $service${NC} — no dependencies"
    return
  fi

  for dep in $expected_deps; do
    local dep_name="${dep%:*}"
    local dep_cond="${dep#*:}"
    dep_cond="${dep_cond:-service_started}"

    if grep -A 20 "^\s\+$service:" "$COMPOSE_FILE" | grep -q "$dep_name"; then
      if [ "$dep_cond" = "healthy" ]; then
        if grep -A 20 "^\s\+$service:" "$COMPOSE_FILE" | grep -A 5 "depends_on" | grep -q "condition: service_healthy"; then
          echo -e "  ${GREEN}✓ $service → $dep_name${NC} (condition: service_healthy)"
        else
          echo -e "  ${YELLOW}⚠ $service → $dep_name${NC} — should use condition: service_healthy but doesn't"
        fi
      else
        echo -e "  ${GREEN}✓ $service → $dep_name${NC} (condition: service_started)"
      fi
    else
      echo -e "  ${YELLOW}⚠ $service → $dep_name${NC} — missing depends_on"
    fi
  done
}

check_depends "postgres" "${DEPS["postgres"]}"
check_depends "redis" "${DEPS["redis"]}"
check_depends "rabbitmq" "${DEPS["rabbitmq"]}"
check_depends "engineering-service" "${DEPS["engineering-service"]}"
check_depends "vision-service" "${DEPS["vision-service"]}"
check_depends "ai-service" "${DEPS["ai-service"]}"

echo ""
echo "── Checking healthcheck definitions ──"
for svc in postgres redis rabbitmq engineering-service vision-service ai-service; do
  if grep -A 10 "^\s\+$svc:" "$COMPOSE_FILE" | grep -q "healthcheck:"; then
    echo -e "  ${GREEN}✓ $svc${NC} — has healthcheck"
  else
    echo -e "  ${RED}✗ $svc${NC} — missing healthcheck"
  fi
done

echo ""
echo "── Checking service ports ──"
check_port() {
  local svc=$1 port=$2
  if grep -A 10 "^\s\+$svc:" "$COMPOSE_FILE" | grep -q "${port}:${port}"; then
    echo -e "  ${GREEN}✓ $svc${NC} — port $port"
  else
    echo -e "  ${YELLOW}⚠ $svc${NC} — port $port not found in compose"
  fi
}

check_port "postgres" "5432"
check_port "redis" "6379"
check_port "rabbitmq" "5672"
check_port "engineering-service" "8001"
check_port "vision-service" "8003"
check_port "ai-service" "8002"

echo ""
echo "══════════════════════════════════════════════"
echo "  Validation complete"
echo "══════════════════════════════════════════════"
