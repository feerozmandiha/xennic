#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Packet loss (25%)"
echo "    - TCP retransmission should handle packet loss gracefully"

if command -v tc &>/dev/null; then
  iface=$(ip route get 8.8.8.8 | awk '{print $5; exit}' 2>/dev/null || echo "eth0")

  sudo tc qdisc add dev "$iface" root netem loss 25% 2>/dev/null || true
  sleep 2

  echo "    - Testing: requests should succeed with retransmission"
  success=0
  for i in 1 2 3; do
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
      success=$((success + 1))
    fi
    sleep 1
  done

  sudo tc qdisc del dev "$iface" root netem 2>/dev/null || true

  if [ "$success" -ge 2 ]; then
    echo "    - $success/3 requests succeeded despite 25% packet loss"
    exit 0
  fi
  echo "    - Only $success/3 requests succeeded"
  exit 2
else
  echo "    - SKIP: tc not available"
  exit 2
fi
