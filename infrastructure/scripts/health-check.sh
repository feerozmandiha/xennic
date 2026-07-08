#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/../../infrastructure/docker/.env" 2>/dev/null || true

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check() {
  local name=$1 url=$2 expected=${3:-200}
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
  if [ "$status" = "$expected" ]; then
    echo -e "${GREEN}  ✓ $name${NC} (HTTP $status)"
    PASS=$((PASS + 1))
  elif [ "$status" = "000" ]; then
    echo -e "${RED}  ✗ $name${NC} — unreachable"
    FAIL=$((FAIL + 1))
  else
    echo -e "${YELLOW}  ⚠ $name${NC} — expected $expected, got $status"
    WARN=$((WARN + 1))
  fi
}

echo "══════════════════════════════════════════════"
echo "  XENNIC — Infrastructure Health Check"
echo "══════════════════════════════════════════════"
echo ""

echo "── PostgreSQL ──"
check "PostgreSQL (host)"         "localhost:${POSTGRES_PORT:-5432}" "000"

echo ""
echo "── Redis ──"
check "Redis (host)"              "localhost:${REDIS_PORT:-6379}" "000"

echo ""
echo "── RabbitMQ ──"
check "RabbitMQ (host)"           "localhost:${RABBITMQ_PORT:-5672}" "000"
check "RabbitMQ (management UI)"  "localhost:${RABBITMQ_UI_PORT:-15672}" "200"

echo ""
echo "── Qdrant ──"
check "Qdrant (host)"             "localhost:6333/health" "200"

echo ""
echo "── NestJS API ──"
check "API health"                "http://localhost:3000/api/v1/health" "200"
check "API Swagger"               "http://localhost:3000/api/docs" "200"

echo ""
echo "── Engineering Service ──"
check "Engineering health"        "http://localhost:8001/health" "200"

echo ""
echo "── Vision Service ──"
check "Vision health"             "http://localhost:8003/health" "200"

echo ""
echo "── AI Service ──"
check "AI health"                 "http://localhost:8002/health" "200"

echo ""
echo "── MinIO ──"
check "MinIO (console)"           "http://localhost:9001" "200"

echo ""
echo "══════════════════════════════════════════════"
echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, ${YELLOW}$WARN warnings${NC}"
echo "══════════════════════════════════════════════"

exit $FAIL
