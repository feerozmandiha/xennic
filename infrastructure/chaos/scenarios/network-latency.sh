#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Network latency (+2000ms)"
echo "    - Adding 2s latency to inter-service traffic via tc"

if command -v tc &>/dev/null; then
  iface=$(ip route get 8.8.8.8 | awk '{print $5; exit}' 2>/dev/null || echo "eth0")
  echo "    - Interface: $iface"

  sudo tc qdisc add dev "$iface" root netem delay 2000ms 500ms 2>/dev/null || true
  sleep 2

  echo "    - Testing: timeouts should trigger retry mechanism"
  start_time=$(date +%s%N)
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
  end_time=$(date +%s%N)
  elapsed_ms=$(( (end_time - start_time) / 1000000 ))

  sudo tc qdisc del dev "$iface" root netem 2>/dev/null || true

  if [ "$status" = "200" ]; then
    echo "    - Request succeeded after ${elapsed_ms}ms (latency degraded)"
    exit 0
  else
    echo "    - Request failed with HTTP $status after ${elapsed_ms}ms"
    exit 2
  fi
else
  echo "    - SKIP: tc (traffic control) not available"
  exit 2
fi
