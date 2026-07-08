#!/usr/bin/env bash
set -euo pipefail

echo "═══════════════════════════════════════════════════════════════"
echo "  XENNIC — Memory & Resource Profiler"
echo "═══════════════════════════════════════════════════════════════"

PROFILE_DIR="docs/benchmarks/profiles"
mkdir -p "$PROFILE_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROFILE_FILE="${PROFILE_DIR}/memory-profile-${TIMESTAMP}.json"

profile_snapshot() {
  local snapshot="{}"

  # Docker container stats
  if command -v docker &>/dev/null; then
    local containers
    containers=$(docker stats --no-stream --format '{"name":"{{.Name}}","cpu":"{{.CPUPerc}}","mem_usage":"{{.MemUsage}}","mem_perc":"{{.MemPerc}}","net_io":"{{.NetIO}}","block_io":"{{.BlockIO}}","pid":"{{.PIDs}}"}' 2>/dev/null || echo "[]")
    snapshot=$(echo "$snapshot" | jq --argjson containers "$containers" '. + {containers: $containers}' 2>/dev/null || echo "$snapshot")
  fi

  # Node.js process stats
  if command -v node &>/dev/null; then
    local node_stats
    node_stats=$(node -e "
      const v8 = require('v8');
      const heap = v8.getHeapStatistics();
      const usage = process.memoryUsage();
      console.log(JSON.stringify({
        heap_limit_mb: (heap.heap_size_limit / 1024 / 1024).toFixed(1),
        heap_total_mb: (heap.total_heap_size / 1024 / 1024).toFixed(1),
        heap_used_mb: (heap.used_heap_size / 1024 / 1024).toFixed(1),
        rss_mb: (usage.rss / 1024 / 1024).toFixed(1),
        heap_total: (usage.heapTotal / 1024 / 1024).toFixed(1),
        heap_used: (usage.heapUsed / 1024 / 1024).toFixed(1),
        external: (usage.external / 1024 / 1024).toFixed(1),
        array_buffers: (usage.arrayBuffers / 1024 / 1024).toFixed(1),
      }));
    " 2>/dev/null || echo "{}")
    snapshot=$(echo "$snapshot" | jq --argjson node "$node_stats" '. + {node: $node}' 2>/dev/null || echo "$snapshot")
  fi

  # System memory
  if command -v free &>/dev/null; then
    local system_mem
    system_mem=$(free -m | jq -Rn '
      [inputs | split(" ") | map(select(length > 0))] |
      {total: .[1][1], used: .[1][2], free: .[1][3], available: .[1][6]}
    ' 2>/dev/null || echo "{}")
    snapshot=$(echo "$snapshot" | jq --argjson sys "$system_mem" '. + {system_memory: $sys}' 2>/dev/null || echo "$snapshot")
  fi

  # Open file descriptors
  if command -v lsof &>/dev/null; then
    local node_fds
    node_fds=$(lsof -p $(pgrep -f "nest" | head -1) 2>/dev/null | wc -l || echo "N/A")
    snapshot=$(echo "$snapshot" | jq --arg fds "$node_fds" '. + {node_file_descriptors: $fds}' 2>/dev/null || echo "$snapshot")
  fi

  # Timestamp
  snapshot=$(echo "$snapshot" | jq --arg ts "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" '. + {timestamp: $ts}' 2>/dev/null || echo "$snapshot")

  echo "$snapshot"
}

echo "Taking memory profile snapshot..."
profile_snapshot | tee "$PROFILE_FILE"

echo ""
echo "Profile saved to: $PROFILE_FILE"
echo ""

if command -v jq &>/dev/null; then
  echo "── Node.js Memory ──"
  jq -r '.node | to_entries | map("  \(.key): \(.value)") | .[]' "$PROFILE_FILE" 2>/dev/null || true
  echo ""
  echo "── System Memory ──"
  jq -r '.system_memory | to_entries | map("  \(.key): \(.value) MB") | .[]' "$PROFILE_FILE" 2>/dev/null || true
  echo ""
  echo "── Containers ──"
  jq -r '.containers[] | "  \(.name): CPU \(.cpu), MEM \(.mem_usage)"' "$PROFILE_FILE" 2>/dev/null || true
fi
