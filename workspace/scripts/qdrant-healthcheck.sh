#!/bin/sh
# Portable Qdrant healthcheck — works on Alpine (wget), Debian/Ubuntu (bash /dev/tcp)
# No external dependencies beyond what the base image provides.

QDANT_HOST="${QDANT_HOST:-127.0.0.1}"
QDANT_PORT="${QDANT_PORT:-6333}"

# Method 1: wget (Alpine default, also on Debian if installed)
if command -v wget >/dev/null 2>&1; then
  wget -q -O - "http://${QDANT_HOST}:${QDANT_PORT}/healthz" 2>/dev/null | grep -q "healthz" && exit 0
fi

# Method 2: curl (Debian/Ubuntu if installed)
if command -v curl >/dev/null 2>&1; then
  curl -sf "http://${QDANT_HOST}:${QDANT_PORT}/healthz" 2>/dev/null | grep -q "healthz" && exit 0
fi

# Method 3: bash /dev/tcp (Debian/Ubuntu with bash)
if command -v bash >/dev/null 2>&1; then
  bash -c "exec 3<>/dev/tcp/${QDANT_HOST}/${QDANT_PORT}" 2>/dev/null && exit 0
fi

# No method available
exit 1
