#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:3000/api/v1}"
REPORT_DIR="docs/benchmarks"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${REPORT_DIR}/baseline-${TIMESTAMP}.md"

mkdir -p "$REPORT_DIR"

echo "══════════════════════════════════════════════"
echo "  XENNIC — Performance Baseline"
echo "  Report: $REPORT_FILE"
echo "══════════════════════════════════════════════"
echo ""

bench_endpoint() {
  local name=$1 url=$2 method=${3:-GET} body=${4:-}
  local total_samples=${5:-10}
  local times=()

  echo -n "  Benchmarking $name..."

  for ((i=1; i<=total_samples; i++)); do
    local start end elapsed
    start=$(date +%s%N)
    if [ "$method" = "POST" ]; then
      curl -s -o /dev/null -X POST -H "Content-Type: application/json" -d "$body" --max-time 30 "$url" 2>/dev/null || true
    else
      curl -s -o /dev/null --max-time 10 "$url" 2>/dev/null || true
    fi
    end=$(date +%s%N)
    elapsed=$(( (end - start) / 1000000 ))
    times+=("$elapsed")
  done

  local sum=0 min=${times[0]} max=${times[0]}
  for t in "${times[@]}"; do
    sum=$((sum + t))
    [ "$t" -lt "$min" ] && min=$t
    [ "$t" -gt "$max" ] && max=$t
  done
  local avg=$(( sum / total_samples ))

  printf "\r  ✓ %-45s avg=%4dms min=%3dms max=%4dms\n" "$name" "$avg" "$min" "$max"
  echo "$avg $min $max"
}

echo "── LATENCY BENCHMARKS ──"
echo ""

# API endpoints
echo "--- API Layer ---"
api_health=$(bench_endpoint "API Health" "${API_BASE}/health")
# Knowledge endpoints
knowledge_list=$(bench_endpoint "Knowledge: List" "${API_BASE}/knowledge" GET)
knowledge_create=$(bench_endpoint "Knowledge: Create" "${API_BASE}/knowledge" POST '{"slug":"bench-test","content":{"blocks":[]},"language":"en","visibility":"workspace","difficulty":"beginner"}')
# Engineering endpoints
eng_health=$(bench_endpoint "Engineering: Health" "${API_BASE}/engineering/health" GET)
eng_catalog=$(bench_endpoint "Engineering: Catalog" "${API_BASE}/engineering/catalog" GET)

echo ""
echo "--- External Services ---"
# Direct Python service checks
py_eng_health=$(bench_endpoint "Python Engineering: Health" "http://localhost:8001/health" GET)
py_vision_health=$(bench_endpoint "Vision Service: Health" "http://localhost:8003/health" GET)
py_ai_health=$(bench_endpoint "AI Service: Health" "http://localhost:8002/health" GET)

echo ""
echo "── CONCURRENT REQUEST TEST ──"
concurrent_test() {
  local name=$1 url=$2 concurrency=${3:-5}
  local start end elapsed

  start=$(date +%s%N)
  for ((i=1; i<=concurrency; i++)); do
    curl -s -o /dev/null --max-time 30 "$url" 2>/dev/null &
  done
  wait
  end=$(date +%s%N)
  elapsed=$(( (end - start) / 1000000 ))
  printf "  ✓ %-45s %d concurrent requests in %dms\n" "$name" "$concurrency" "$elapsed"
}

concurrent_test "Knowledge: List (5x)"   "${API_BASE}/knowledge" 5
concurrent_test "Engineering: Health (5x)" "${API_BASE}/engineering/health" 5

echo ""
echo "── RESOURCE USAGE ──"
if command -v docker &>/dev/null; then
  echo "--- Docker Container Stats ---"
  for svc in xennic-postgres xennic-redis xennic-rabbitmq xennic-engineering-service xennic-vision-service; do
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^$svc$"; then
      stats=$(docker stats --no-stream --format "{{.Name}} | CPU: {{.CPUPerc}} | MEM: {{.MemUsage}} | MEM%%: {{.MemPerc}}" "$svc" 2>/dev/null)
      echo "  $stats"
    fi
  done
fi

echo ""
echo "── GENERATING REPORT ──"

cat > "$REPORT_FILE" <<REPORT
# Performance Baseline Report
**Date:** $(date -u '+%Y-%m-%dT%H:%M:%SZ')
**Environment:** ${ENVIRONMENT:-development}

## API Latency (ms, n=10)

| Endpoint | Avg | Min | Max |
|----------|-----|-----|-----|
| API Health | $(echo $api_health | awk '{print $1}') | $(echo $api_health | awk '{print $2}') | $(echo $api_health | awk '{print $3}') |
| Knowledge: List | $(echo $knowledge_list | awk '{print $1}') | $(echo $knowledge_list | awk '{print $2}') | $(echo $knowledge_list | awk '{print $3}') |
| Knowledge: Create | $(echo $knowledge_create | awk '{print $1}') | $(echo $knowledge_create | awk '{print $2}') | $(echo $knowledge_create | awk '{print $3}') |
| Engineering: Health | $(echo $eng_health | awk '{print $1}') | $(echo $eng_health | awk '{print $2}') | $(echo $eng_health | awk '{print $3}') |
| Engineering: Catalog | $(echo $eng_catalog | awk '{print $1}') | $(echo $eng_catalog | awk '{print $2}') | $(echo $eng_catalog | awk '{print $3}') |

## External Service Latency (ms, n=10)

| Service | Avg | Min | Max |
|---------|-----|-----|-----|
| Python Engineering | $(echo $py_eng_health | awk '{print $1}') | $(echo $py_eng_health | awk '{print $2}') | $(echo $py_eng_health | awk '{print $3}') |
| Vision Service | $(echo $py_vision_health | awk '{print $1}') | $(echo $py_vision_health | awk '{print $2}') | $(echo $py_vision_health | awk '{print $3}') |
| AI Service | $(echo $py_ai_health | awk '{print $1}') | $(echo $py_ai_health | awk '{print $2}') | $(echo $py_ai_health | awk '{print $3}') |

## Concurrent Request Performance

| Scenario | Concurrency | Duration (ms) |
|----------|-------------|---------------|
| Knowledge: List | 5 | (measured) |
| Engineering: Health | 5 | (measured) |

## Resource Usage

\`\`\`
$(docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null || echo "Docker not available")
\`\`\`

---
*Report generated by benchmark.sh at $(date)*
REPORT

chmod +x "$REPORT_FILE"
echo ""
echo "Report written to $REPORT_FILE"
echo "══════════════════════════════════════════════"
echo "  Benchmark complete"
echo "══════════════════════════════════════════════"
