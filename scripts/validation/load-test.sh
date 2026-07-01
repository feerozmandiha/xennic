#!/bin/bash
# ============================================================
# Xennic — Load Test Script
# تست بار روی API با استفاده از hey یا curl
#
# Usage:
#   bash scripts/validation/load-test.sh
#   bash scripts/validation/load-test.sh --concurrency 20 --requests 500
#   bash scripts/validation/load-test.sh --target http://localhost:3000/api/v1/health
#   bash scripts/validation/load-test.sh --json
#   bash scripts/validation/load-test.sh --help
#
# Examples:
#   bash scripts/validation/load-test.sh
#   bash scripts/validation/load-test.sh --concurrency 5 --requests 50
#   bash scripts/validation/load-test.sh --target http://localhost:8001/health --json
# ============================================================

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────
G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; C='\033[0;36m'; B='\033[1m'; N='\033[0m'

# ─── Config ──────────────────────────────────────────────────────
CONCURRENCY=10
REQUESTS=100
TARGET="http://localhost:3000/api/v1/health"
JSON_MODE=false

# ─── Logging ─────────────────────────────────────────────────────
log_info()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${B}INFO${N}  $*"; }
log_ok()    { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${G}OK${N}    $*"; }
log_fail()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${R}FAIL${N}  $*"; }
log_warn()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${Y}WARN${N}  $*"; }

# ─── Help ────────────────────────────────────────────────────────
show_help() {
  cat <<HELP
Usage: bash scripts/validation/load-test.sh [OPTIONS]

Run HTTP load test against a target endpoint.

Options:
  --concurrency N    Number of concurrent requests (default: 10)
  --requests N       Total number of requests (default: 100)
  --target URL       Target URL (default: http://localhost:3000/api/v1/health)
  --json             Output in JSON format (for CI/CD)
  --help             Show this help message

Exit codes:
  0  Success rate > 95% AND avg latency < 500ms
  1  Performance degradation detected

Examples:
  bash scripts/validation/load-test.sh
  bash scripts/validation/load-test.sh --concurrency 5 --requests 200
  bash scripts/validation/load-test.sh --target http://localhost:8001/health --json
HELP
  exit 0
}

# ─── Parse arguments ─────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --help) show_help ;;
    --json) JSON_MODE=true; shift ;;
    --concurrency) CONCURRENCY="$2"; shift 2 ;;
    --requests) REQUESTS="$2"; shift 2 ;;
    --target) TARGET="$2"; shift 2 ;;
    *) echo -e "${R}Unknown option: $1${N}"; show_help ;;
  esac
done

# ─── Run load test ───────────────────────────────────────────────
if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo -e "${B}  Xennic — Load Test${N}"
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo ""
  log_info "Target: $TARGET"
  log_info "Concurrency: $CONCURRENCY"
  log_info "Requests: $REQUESTS"
  echo ""
fi

SUCCESSFUL=0
FAILED=0
TOTAL_TIME=0
MAX_TIME=0
MIN_TIME=999999

# ─── Attempt using hey ───────────────────────────────────────────
run_hey() {
  if command -v hey &>/dev/null; then
    if [ "$JSON_MODE" = false ]; then
      log_info "Using hey for load testing"
    fi

    local output_file
    output_file=$(mktemp /tmp/xennic-load-test-XXXXXX.txt)

    hey -n "$REQUESTS" -c "$CONCURRENCY" -o csv "$TARGET" > "$output_file" 2>/dev/null || true

    # Parse CSV output from hey
    if [ -f "$output_file" ]; then
      while IFS=, read -r status time; do
        if [ "$status" = "200" ] || [ "$status" = "204" ]; then
          SUCCESSFUL=$((SUCCESSFUL + 1))
        else
          FAILED=$((FAILED + 1))
        fi
        local_time=$(echo "$time" | awk '{print $1 * 1000}' 2>/dev/null || echo 0)
        TOTAL_TIME=$(echo "$TOTAL_TIME + $local_time" | bc 2>/dev/null || echo 0)
        MAX_TIME=$(echo "$local_time > $MAX_TIME" | bc -l 2>/dev/null && echo "$local_time" || echo "$MAX_TIME")
        MIN_TIME=$(echo "$local_time < $MIN_TIME" | bc -l 2>/dev/null && echo "$local_time" || echo "$MIN_TIME")
      done < <(tail -n +2 "$output_file")

      rm -f "$output_file"
    fi

    return 0
  fi
  return 1
}

# ─── Fallback using curl + seq ────────────────────────────────────
run_curl() {
  if [ "$JSON_MODE" = false ]; then
    log_info "hey not available — using curl fallback"
  fi

  local batch=$((REQUESTS / CONCURRENCY))
  [ "$batch" -lt 1 ] && batch=1

  for ((i = 0; i < REQUESTS; i++)); do
    local start end elapsed status
    start=$(date +%s%N)

    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$TARGET" 2>/dev/null || echo "000")

    end=$(date +%s%N)
    elapsed=$(( (end - start) / 1000000 )) # ms

    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
      SUCCESSFUL=$((SUCCESSFUL + 1))
    else
      FAILED=$((FAILED + 1))
    fi

    TOTAL_TIME=$((TOTAL_TIME + elapsed))
    [ "$elapsed" -gt "$MAX_TIME" ] && MAX_TIME="$elapsed"
    [ "$elapsed" -lt "$MIN_TIME" ] && MIN_TIME="$elapsed"
  done
}

# ─── Run ─────────────────────────────────────────────────────────
if ! run_hey; then
  run_curl
fi

# ─── Calculate stats ─────────────────────────────────────────────
TOTAL=$((SUCCESSFUL + FAILED))
if [ "$TOTAL" -gt 0 ]; then
  SUCCESS_RATE=$(echo "scale=2; $SUCCESSFUL * 100 / $TOTAL" | bc 2>/dev/null || echo "0")
  AVG_LATENCY=$((TOTAL_TIME / TOTAL))
else
  SUCCESS_RATE=0
  AVG_LATENCY=0
fi

# ─── Output ──────────────────────────────────────────────────────
if [ "$JSON_MODE" = true ]; then
  cat <<JSON
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "target": "$TARGET",
  "concurrency": $CONCURRENCY,
  "requests": $TOTAL,
  "successful": $SUCCESSFUL,
  "failed": $FAILED,
  "success_rate": $SUCCESS_RATE,
  "avg_latency_ms": $AVG_LATENCY,
  "max_latency_ms": $MAX_TIME,
  "min_latency_ms": $MIN_TIME,
  "tool": "$(command -v hey &>/dev/null && echo 'hey' || echo 'curl')"
}
JSON
else
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo -e "${B}  Results${N}"
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo ""
  echo -e "  Total requests:    ${B}$TOTAL${N}"
  echo -e "  Successful:        ${G}$SUCCESSFUL${N}"
  echo -e "  Failed:            ${R}$FAILED${N}"
  echo -e "  Success rate:      ${G}${SUCCESS_RATE}%${N}"
  echo -e "  Avg latency:       ${C}${AVG_LATENCY}ms${N}"
  echo -e "  Max latency:       ${Y}${MAX_TIME}ms${N}"
  echo -e "  Min latency:       ${G}${MIN_TIME}ms${N}"
  echo ""

  # ─── Check thresholds ──────────────────────────────────────────
  if [ "$TOTAL" -eq 0 ]; then
    echo -e "${R}  No requests completed — check target URL${N}"
    exit 1
  fi

  if [ "$(echo "$SUCCESS_RATE > 95" | bc -l 2>/dev/null || echo 0)" -eq 1 ] && [ "$AVG_LATENCY" -lt 500 ]; then
    echo -e "${G}  Load test PASSED (success rate: ${SUCCESS_RATE}%, avg latency: ${AVG_LATENCY}ms)${N}"
    exit 0
  else
    local reason=""
    [ "$(echo "$SUCCESS_RATE <= 95" | bc -l)" -eq 1 ] && reason+="success rate ${SUCCESS_RATE}% (min 95%), "
    [ "$AVG_LATENCY" -ge 500 ] && reason+="avg latency ${AVG_LATENCY}ms (max 500ms)"
    echo -e "${R}  Load test FAILED — ${reason%, }${N}"
    exit 1
  fi
fi
