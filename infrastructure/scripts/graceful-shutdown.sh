#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "══════════════════════════════════════════════"
echo "  XENNIC — Graceful Shutdown Test"
echo "══════════════════════════════════════════════"
echo ""

SHUTDOWN_TIMEOUT=30
PASS=0
FAIL=0

test_shutdown() {
  local name=$1 container=$2
  local start

  if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^$container$"; then
    echo -e "  ${RED}✗ $name ($container)${NC} — not running"
    FAIL=$((FAIL + 1))
    return
  fi

  start=$(date +%s)
  if docker stop "$container" --time "$SHUTDOWN_TIMEOUT" >/dev/null 2>&1; then
    local elapsed=$(( $(date +%s) - start ))
    if [ "$elapsed" -lt "$SHUTDOWN_TIMEOUT" ]; then
      echo -e "  ${GREEN}✓ $name${NC} — stopped in ${elapsed}s"
      PASS=$((PASS + 1))
    else
      echo -e "  ${RED}✗ $name${NC} — stopped at timeout (${elapsed}s)"
      FAIL=$((FAIL + 1))
    fi
  else
    echo -e "  ${RED}✗ $name${NC} — failed to stop"
    FAIL=$((FAIL + 1))
  fi
}

echo "── Testing graceful shutdown of core services ──"
echo ""

# Shutdown order: reverse of startup
test_shutdown "AI Service"        "xennic-ai-service"
test_shutdown "Vision Service"    "xennic-vision-service"
test_shutdown "Engineering"       "xennic-engineering-service"
test_shutdown "RabbitMQ"          "xennic-rabbitmq"
test_shutdown "Redis"             "xennic-redis"
test_shutdown "PostgreSQL"        "xennic-postgres"

echo ""
echo "── Restarting services ──"
cd "$(dirname "$0")/../../infrastructure/docker/compose/base"
docker compose up -d --wait 2>/dev/null || true
cd - >/dev/null

echo ""
echo "══════════════════════════════════════════════"
echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "══════════════════════════════════════════════"
exit $FAIL
