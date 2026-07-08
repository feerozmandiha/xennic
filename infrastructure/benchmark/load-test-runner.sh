#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

API_BASE="${API_BASE:-http://localhost:3000/api/v1}"
K6_DIR="$(dirname "$0")/k6-scripts"
REPORT_DIR="docs/benchmarks"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$REPORT_DIR"

echo "═══════════════════════════════════════════════════════════════"
echo "  XENNIC — Load & Performance Benchmark Suite"
echo "  API Base: $API_BASE"
echo "═══════════════════════════════════════════════════════════════"

if ! command -v k6 &>/dev/null; then
  echo -e "${RED}ERROR: k6 not installed. Install from https://k6.io/docs/get-started/installation/${NC}"
  exit 1
fi

run_k6_test() {
  local name=$1 script=$2 options=$3
  echo ""
  echo -e "${CYAN}── Test: $name ──${NC}"
  local report_file="${REPORT_DIR}/${name}-${TIMESTAMP}.json"
  set +e
  k6 run \
    --out json="$report_file" \
    $options \
    --tag "test=$name" \
    --tag "timestamp=$TIMESTAMP" \
    -e API_BASE="$API_BASE" \
    "$script" 2>&1
  local exit_code=$?
  set -euo pipefail
  if [ "$exit_code" -eq 0 ]; then
    echo -e "${GREEN}  ✓ $name PASSED${NC}"
    echo "  Report: $report_file"
  else
    echo -e "${RED}  ✗ $name FAILED (exit $exit_code)${NC}"
  fi
  return $exit_code
}

echo ""
echo "══ SMOKE TEST (quick validation) ══"
run_k6_test "smoke-test" "${K6_DIR}/api-smoke-test.js" "--vus 2 --duration 30s"

echo ""
echo "══ LOAD TEST (ramp-up pattern) ══"
run_k6_test "load-test" "${K6_DIR}/load-test.js" ""

echo ""
echo "══ STRESS TEST (high concurrency) ══"
run_k6_test "stress-test" "${K6_DIR}/stress-test.js" ""

echo ""
echo "══ SOAK TEST (long duration) ══"
echo "  (skipped by default — run manually with: k6 run ${K6_DIR}/soak-test.js)"
echo "  Expected duration: 4 hours"

# ── Resource Measurement ──
echo ""
echo "══ RESOURCE USAGE ══"
if command -v docker &>/dev/null; then
  echo "--- Docker Container Stats ---"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" 2>/dev/null || echo "  Docker stats unavailable"
fi

echo ""
echo "══ DATABASE CONNECTIONS ══"
if command -v psql &>/dev/null; then
  PGPASSWORD="${PGPASSWORD:-postgres}" psql -h localhost -U postgres -d xennic -c "SELECT count(*) as active_connections FROM pg_stat_activity;" 2>/dev/null || echo "  Database connection stats unavailable"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Benchmark suite complete"
echo "  Reports: $REPORT_DIR/"
echo "═══════════════════════════════════════════════════════════════"
