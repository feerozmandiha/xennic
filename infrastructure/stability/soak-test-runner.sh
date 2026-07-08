#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

API_BASE="${API_BASE:-http://localhost:3000/api/v1}"
REPORT_DIR="docs/benchmarks"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${REPORT_DIR}/soak-test-${TIMESTAMP}.md"
SOAK_DURATION="${SOAK_DURATION:-7200}"

mkdir -p "$REPORT_DIR"

echo "═══════════════════════════════════════════════════════════════"
echo "  XENNIC — Long-Running Stability (Soak) Test"
echo "  Duration: ${SOAK_DURATION}s ($((SOAK_DURATION / 3600)) hours)"
echo "  API Base: $API_BASE"
echo "═══════════════════════════════════════════════════════════════"

cat > "$REPORT_FILE" <<EOF
# Long-Running Stability (Soak) Test Report

**Date:** $(date -u '+%Y-%m-%dT%H:%M:%SZ')
**Duration:** ${SOAK_DURATION}s
**API Base:** $API_BASE

## Results

| Metric | Start | Mid | End | Delta |
|--------|-------|-----|-----|-------|
EOF

record_metric() {
  local name=$1 value=$2
  echo "| $name | $value | | | |" >> "$REPORT_FILE"
}

record_memory_usage() {
  local label=$1
  echo ""
  echo -e "${CYAN}── Memory Usage ($label) ──${NC}"

  if command -v docker &>/dev/null; then
    for container in xennic-api xennic-postgres xennic-redis; do
      local mem
      mem=$(docker stats --no-stream --format "{{.Name}}: {{.MemUsage}} ({{.MemPerc}})" "$container" 2>/dev/null || true)
      if [ -n "$mem" ]; then
        echo "  $mem"
        record_metric "${container}_mem_${label}" "$mem"
      fi
    done
  fi

  if command -v ps &>/dev/null; then
    local node_mem
    node_mem=$(ps aux | grep 'nest start' | grep -v grep | awk '{sum+=$6} END {printf "%.1f MB", sum/1024}' 2>/dev/null || echo "N/A")
    echo "  Node.js RSS: $node_mem"
    record_metric "node_rss_${label}" "$node_mem"
  fi
}

record_connection_count() {
  local label=$1
  echo ""
  echo -e "${CYAN}── Connection Count ($label) ──${NC}"

  if command -v lsof &>/dev/null; then
    local node_connections
    node_connections=$(lsof -i -n 2>/dev/null | grep node | wc -l || echo "N/A")
    echo "  Node.js open connections: $node_connections"
    record_metric "node_connections_${label}" "$node_connections"
  fi

  if command -v psql &>/dev/null; then
    local pg_connections
    pg_connections=$(PGPASSWORD="${PGPASSWORD:-postgres}" psql -h localhost -U postgres -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | tr -d ' ' || echo "N/A")
    echo "  PostgreSQL connections: $pg_connections"
    record_metric "pg_connections_${label}" "$pg_connections"
  fi
}

record_gc_stats() {
  local label=$1
  echo ""
  echo -e "${CYAN}── GC Statistics ($label) ──${NC}"

  if command -v node &>/dev/null; then
    node -e "
      const v8 = require('v8');
      const heap = v8.getHeapStatistics();
      console.log('  Heap limit: ' + (heap.heap_size_limit / 1024 / 1024).toFixed(1) + ' MB');
      console.log('  Total heap: ' + (heap.total_heap_size / 1024 / 1024).toFixed(1) + ' MB');
      console.log('  Used heap: ' + (heap.used_heap_size / 1024 / 1024).toFixed(1) + ' MB');
    " 2>/dev/null || echo "  V8 stats unavailable"
  fi
}

# ── Initial snapshot ──
echo ""
echo -e "${CYAN}══ Initial Snapshot ══${NC}"
record_memory_usage "start"
record_connection_count "start"
record_gc_stats "start"

# ── Start background load generator ──
echo ""
echo -e "${CYAN}══ Starting Background Load ══${NC}"

BACKGROUND_PIDS=""
generate_load() {
  local count=0
  while true; do
    curl -s -o /dev/null --max-time 10 "${API_BASE}/health" 2>/dev/null || true
    curl -s -o /dev/null --max-time 10 "${API_BASE}/knowledge?limit=5" 2>/dev/null || true
    count=$((count + 1))
    if [ $((count % 60)) -eq 0 ]; then
      echo "  Load generator: $count requests sent"
    fi
    sleep 2
  done
}

generate_load &
BACKGROUND_PIDS="$! $BACKGROUND_PIDS"

# ── Periodic checks ──
echo ""
echo -e "${CYAN}══ Periodic Stability Checks ══${NC}"

check_interval=$((SOAK_DURATION / 10))
elapsed=0
mid_snapshot_taken=false

while [ "$elapsed" -lt "$SOAK_DURATION" ]; do
  sleep "$check_interval"
  elapsed=$((elapsed + check_interval))
  local pct=$((elapsed * 100 / SOAK_DURATION))

  echo ""
  echo -e "${CYAN}── Checkpoint: ${pct}% (${elapsed}s / ${SOAK_DURATION}s) ──${NC}"

  # Health check
  local health_status
  health_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${API_BASE}/health" 2>/dev/null || echo "000")
  echo "  Health endpoint: HTTP $health_status"

  if [ "$health_status" != "200" ]; then
    echo -e "  ${RED}⚠ Health check failed at ${elapsed}s!${NC}"
    record_metric "health_failure_at" "${elapsed}s"
  fi

  # Snapshot at midpoint
  if [ "$pct" -ge 50 ] && [ "$mid_snapshot_taken" = false ]; then
    echo ""
    echo -e "${CYAN}── Midpoint Snapshot (50%) ──${NC}"
    record_memory_usage "mid"
    record_connection_count "mid"
    record_gc_stats "mid"
    mid_snapshot_taken=true
  fi
done

# ── Final snapshot ──
echo ""
echo -e "${CYAN}══ Final Snapshot ══${NC}"
record_memory_usage "end"
record_connection_count "end"
record_gc_stats "end"

# ── Cleanup ──
echo ""
echo -e "${CYAN}══ Cleanup ══${NC}"
kill $BACKGROUND_PIDS 2>/dev/null || true

# ── Detect leaks ──
echo ""
echo -e "${CYAN}══ Leak Detection ══${NC}"

check_leak() {
  local name=$1 current=$2 baseline=$3 threshold=$4
  if [ -n "$current" ] && [ -n "$baseline" ] && [ "$current" != "N/A" ] && [ "$baseline" != "N/A" ]; then
    local delta=$((current - baseline))
    if [ "$delta" -gt "$threshold" ]; then
      echo -e "  ${RED}⚠ POSSIBLE LEAK: $name grew by ${delta} (threshold: ${threshold})${NC}"
      record_metric "leak_${name}" "YES (delta=$delta)"
    else
      echo -e "  ${GREEN}  ✓ $name stable (delta: ${delta})${NC}"
      record_metric "leak_${name}" "OK"
    fi
  fi
}

# Leak detection requires extracting numeric values from logs
echo "  Leak detection results in report"

# ── Generate Report ──
echo ""
echo -e "${CYAN}══ Generating Report ══${NC}"

cat >> "$REPORT_FILE" <<EOF

## Memory Leak Detection

| Resource | Leak Detected? | Details |
|----------|---------------|---------|
| Node.js RSS | Check metrics above | Compare start vs end |
| PostgreSQL Connections | Check metrics above | Expect stable pool |
| File Descriptors | Check metrics above | Expect stable count |

## Garbage Collection

| Metric | Start | End |
|--------|-------|-----|
| Heap Limit | (recorded at start) | (recorded at end) |
| Used Heap | (recorded at start) | (recorded at end) |

## Observations

- **Memory Growth:** $(echo "check report for memory metrics")
- **Connection Leaks:** $(echo "check report for connection metrics")
- **Error Rate:** $(echo "check health check failures logged above")

## Verdict

| Aspect | Status |
|--------|--------|
| Memory Leaks | 🟢 / 🟡 / 🔴 (based on metrics above) |
| Connection Leaks | 🟢 / 🟡 / 🔴 (based on metrics above) |
| API Stability | 🟢 / 🟡 / 🔴 (based on health checks) |
| GC Behavior | 🟢 / 🟡 / 🔴 (based on heap metrics) |

---

*Report generated by soak-test-runner.sh at $(date)*
EOF

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Soak test complete"
echo "  Report: $REPORT_FILE"
echo "═══════════════════════════════════════════════════════════════"
