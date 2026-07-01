#!/bin/bash
# ============================================================
# Xennic — Pre-Deployment Preflight Check
# بررسی آمادگی سرور VPS برای استقرار
#
# Usage:
#   bash scripts/deployment/preflight-check.sh
#   bash scripts/deployment/preflight-check.sh --json
#   bash scripts/deployment/preflight-check.sh --verbose
#   bash scripts/deployment/preflight-check.sh --help
#
# Examples:
#   bash scripts/deployment/preflight-check.sh
#   bash scripts/deployment/preflight-check.sh --json | jq .
#   bash scripts/deployment/preflight-check.sh --verbose
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

COMPOSE_FILE="$PROJECT_ROOT/infrastructure/docker/compose/production/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/infrastructure/docker/compose/production/.env"
ENV_EXAMPLE="$PROJECT_ROOT/infrastructure/docker/compose/production/.env.production.example"

# ─── Colors ──────────────────────────────────────────────────────
G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; C='\033[0;36m'; B='\033[1m'; N='\033[0m'

# ─── State ───────────────────────────────────────────────────────
VERBOSE=false
JSON_MODE=false
WARNINGS=0
FAILURES=0
CHECKED=0

# ─── Logging ─────────────────────────────────────────────────────
log_info()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${B}INFO${N}  $*"; }
log_ok()    { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${G}OK${N}    $*"; }
log_fail()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${R}FAIL${N}  $*"; }
log_warn()  { echo -e "${C}[$(date '+%Y-%m-%d %H:%M:%S')]${N} ${Y}WARN${N}  $*"; }
log_verb()  { [ "$VERBOSE" = true ] && echo -e "         ${C}$*${N}"; }

json_output=""
json_emit() {
  local status="$1" check="$2" detail="$3"
  [ "$JSON_MODE" = true ] && json_output+="{\"status\":\"$status\",\"check\":\"$check\",\"detail\":\"$detail\"},"
}

# ─── Help ────────────────────────────────────────────────────────
show_help() {
  cat <<HELP
Usage: bash scripts/deployment/preflight-check.sh [OPTIONS]

Verify that the target VPS is ready for Xennic platform deployment.

Options:
  --json      Output in JSON format (for CI/CD)
  --verbose   Show detailed information for each check
  --help      Show this help message

Checks:
  1.  Docker installed and accessible
  2.  Docker Compose plugin installed
  3.  Required ports available (or used by xennic stack)
  4.  Disk space (>20GB free on /var/lib/docker and /)
  5.  Available RAM (>4GB)
  6.  CPU cores (>2)
  7.  Environment variables set (no CHANGE_ME placeholders)
  8.  Git installed and accessible
  9.  DNS resolution for configured endpoints
  10. Docker network creation works

Exit codes:
  0  All checks pass
  1  Warnings found (non-critical)
  2  Failures found (critical - deployment should not proceed)

Examples:
  bash scripts/deployment/preflight-check.sh
  bash scripts/deployment/preflight-check.sh --json
  bash scripts/deployment/preflight-check.sh --verbose
HELP
  exit 0
}

# ─── Parse arguments ─────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --help) show_help ;;
    --json) JSON_MODE=true; shift ;;
    --verbose) VERBOSE=true; shift ;;
    *) echo -e "${R}Unknown option: $1${N}"; show_help ;;
  esac
done

# ─── Check runners ───────────────────────────────────────────────
check_result() {
  local status="$1" name="$2" detail="$3"
  CHECKED=$((CHECKED + 1))
  if [ "$JSON_MODE" = false ]; then
    case "$status" in
      pass) echo -e "  ${G}PASS${N}  $name" ;;
      warn) echo -e "  ${Y}WARN${N}  $name — $detail" ;;
      fail) echo -e "  ${R}FAIL${N}  $name — $detail" ;;
    esac
  fi
  json_emit "$status" "$name" "$detail"
  case "$status" in
    warn) WARNINGS=$((WARNINGS + 1)) ;;
    fail) FAILURES=$((FAILURES + 1)) ;;
  esac
}

check_cmd() {
  local name="$1" cmd="$2"
  local detail="${3:-}"
  if eval "$cmd" >/dev/null 2>&1; then
    check_result "pass" "$name" "$detail"
  else
    check_result "fail" "$name" "Command failed: $cmd"
  fi
}

# ─── 1. Docker ───────────────────────────────────────────────────
check_docker() {
  local name="Docker installed"
  local version
  version=$(docker --version 2>/dev/null) || {
    check_result "fail" "$name" "docker not found in PATH or not installed"
    return
  }
  if [ "$VERBOSE" = true ]; then
    log_verb "docker --version: $version"
  fi
  check_result "pass" "$name" "$version"

  name="Docker socket accessible"
  if docker info >/dev/null 2>&1; then
    check_result "pass" "$name" "Docker daemon is running"
  else
    check_result "fail" "$name" "Cannot connect to Docker daemon. Is docker running? Check /var/run/docker.sock"
  fi
}

# ─── 2. Docker Compose ───────────────────────────────────────────
check_docker_compose() {
  local name="Docker Compose plugin"
  local version
  version=$(docker compose version 2>/dev/null) || {
    check_result "fail" "$name" "docker compose plugin not found"
    return
  }
  if [ "$VERBOSE" = true ]; then
    log_verb "docker compose version: $version"
  fi
  check_result "pass" "$name" "$version"
}

# ─── 3. Ports ────────────────────────────────────────────────────
check_ports() {
  local name="Required ports available"
  local PORTS=(3000 3001 5432 6379 5672 8001 8002 8003 9000 9090 3002)
  local conflicts=()
  local xennic_procs=0

  if ! command -v ss &>/dev/null && ! command -v netstat &>/dev/null; then
    check_result "warn" "$name" "Neither ss nor netstat available — cannot check ports"
    return
  fi

  local cmd
  if command -v ss &>/dev/null; then
    cmd="ss -tlnp"
  else
    cmd="netstat -tlnp"
  fi

  for port in "${PORTS[@]}"; do
    if $cmd 2>/dev/null | grep -q ":$port "; then
      local proc_name
      proc_name=$($cmd 2>/dev/null | grep ":$port " | awk '{print $NF}' | head -1 | sed 's/.*://' | sed 's/["]//g' || echo "unknown")
      if echo "$proc_name" | grep -qiE "(docker|compose|nginx|postgres|redis|rabbitmq|minio|prometheus|grafana|loki|node|python|api|web)"; then
        xennic_procs=$((xennic_procs + 1))
      else
        conflicts+=("$port (used by $proc_name)")
      fi
    fi
  done

  if [ ${#conflicts[@]} -eq 0 ]; then
    local detail=""
    [ "$xennic_procs" -gt 0 ] && detail="$xennic_procs already in use by xennic stack"
    check_result "pass" "$name" "$detail"
  else
    local joined
    joined=$(IFS=", "; echo "${conflicts[*]}")
    check_result "fail" "$name" "Ports in use by other processes: $joined"
  fi

  if [ "$VERBOSE" = true ] && [ ${#PORTS[@]} -gt 0 ]; then
    for port in "${PORTS[@]}"; do
      if $cmd 2>/dev/null | grep -q ":$port "; then
        local info
        info=$($cmd 2>/dev/null | grep ":$port " | head -1 | awk '{print $1, $NF}')
        log_verb "  Port $port: LISTEN — $info"
      else
        log_verb "  Port $port: free"
      fi
    done
  fi
}

# ─── 4. Disk space ───────────────────────────────────────────────
check_disk() {
  local name="Disk space >20GB free"
  local CHECK_PATHS=("/var/lib/docker" "/")
  local issues=()

  for path in "${CHECK_PATHS[@]}"; do
    if [ ! -d "$path" ] && [ "$path" = "/var/lib/docker" ]; then
      if [ "$VERBOSE" = true ]; then
        log_verb "  $path does not exist yet (fine — docker not initialized)"
      fi
      continue
    fi
    local avail_kb
    avail_kb=$(df --output=avail "$path" 2>/dev/null | tail -1 | tr -d ' ') || {
      issues+=("Cannot check $path")
      continue
    }
    local avail_gb=$((avail_kb / 1024 / 1024))
    if [ "$avail_gb" -lt 20 ]; then
      issues+=("$path: ${avail_gb}GB free (need >20GB)")
    fi
    if [ "$VERBOSE" = true ]; then
      log_verb "  $path: ${avail_gb}GB free"
    fi
  done

  if [ ${#issues[@]} -eq 0 ]; then
    check_result "pass" "$name" "Sufficient disk space on all checked paths"
  else
    local joined
    joined=$(IFS="; "; echo "${issues[*]}")
    check_result "fail" "$name" "$joined"
  fi
}

# ─── 5. Memory ───────────────────────────────────────────────────
check_memory() {
  local name="Available RAM >4GB"
  if ! command -v free &>/dev/null; then
    check_result "warn" "$name" "free command not available"
    return
  fi

  local avail_kb
  avail_kb=$(free -k | awk '/^Mem:/ {print $7}') || {
    check_result "fail" "$name" "Cannot determine available memory"
    return
  }
  local avail_gb=$((avail_kb / 1024 / 1024))
  if [ "$VERBOSE" = true ]; then
    log_verb "Available RAM: ${avail_gb}GB (${avail_kb}KB)"
  fi
  if [ "$avail_gb" -lt 4 ]; then
    check_result "fail" "$name" "${avail_gb}GB available (need >4GB)"
  else
    check_result "pass" "$name" "${avail_gb}GB available"
  fi
}

# ─── 6. CPU ──────────────────────────────────────────────────────
check_cpu() {
  local name="CPU cores >2"
  local cores
  if command -v nproc &>/dev/null; then
    cores=$(nproc)
  elif [ -f /proc/cpuinfo ]; then
    cores=$(grep -c ^processor /proc/cpuinfo)
  else
    check_result "warn" "$name" "Cannot determine CPU count — /proc/cpuinfo not available"
    return
  fi

  if [ "$VERBOSE" = true ]; then
    log_verb "CPU cores: $cores"
  fi
  if [ "$cores" -lt 2 ]; then
    check_result "fail" "$name" "${cores} core(s) (need >2)"
  else
    check_result "pass" "$name" "${cores} cores"
  fi
}

# ─── 7. Environment variables ────────────────────────────────────
check_env_vars() {
  local name="Environment variables set"

  # Determine which env file to check: prefer .env, fall back to example
  local env_source=""
  if [ -f "$ENV_FILE" ]; then
    env_source="$ENV_FILE"
  elif [ -f "$ENV_EXAMPLE" ]; then
    env_source="$ENV_EXAMPLE"
    check_result "warn" "Env file" ".env not found — checking .env.production.example instead"
    if [ "$JSON_MODE" = false ]; then
      WARNINGS=$((WARNINGS - 1))  # already counted below
    fi
  else
    check_result "warn" "$name" "No .env or .env.production.example found at $ENV_FILE"
    return
  fi

  local placeholders=()
  local missing_section=false
  local current_section=""

  while IFS= read -r line; do
    # Track sections
    if [[ "$line" =~ ^#[[:space:]]*-- ]]; then
      current_section="$line"
    fi
    # Skip comments and blank lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$(echo "$line" | tr -d '[:space:]')" ]] && continue
    # Must be KEY=VALUE
    [[ "$line" != *"="* ]] && continue

    local key="${line%%=*}"
    local value="${line#*=}"

    # Remove any surrounding quotes
    value="${value%\"}"
    value="${value#\"}"

    # Skip internal/internal-use vars
    [[ "$key" == "COMPOSE_PROJECT_NAME" ]] && continue
    [[ "$key" == "NODE_ENV" ]] && continue
    [[ "$key" == "LOG_LEVEL" ]] && continue

    # Check for CHANGE_ME
    if echo "$value" | grep -qi "change_me"; then
      placeholders+=("$key")
      if [ "$missing_section" = false ] && [ -n "$current_section" ]; then
        missing_section=true
      fi
    fi

    # Check for empty values on critical vars
    if [ -z "$value" ] && [[ "$key" =~ ^(POSTGRES_PASSWORD|REDIS_PASSWORD|RABBITMQ_DEFAULT_PASS|MINIO_ROOT_PASSWORD|MINIO_ROOT_USER|JWT_PRIVATE_KEY_PATH|JWT_PUBLIC_KEY_PATH|SMTP_HOST) ]]; then
      placeholders+=("$key (empty)")
    fi
  done < "$env_source"

  if [ ${#placeholders[@]} -eq 0 ]; then
    check_result "pass" "$name" "All required variables properly set"
  else
    local joined
    joined=$(IFS=", "; echo "${placeholders[*]}")
    check_result "fail" "$name" "${#placeholders[@]} placeholder(s) found: $joined"
    if [ "$VERBOSE" = true ]; then
      for p in "${placeholders[@]}"; do
        log_verb "  CHANGE_ME: $p"
      done
    fi
  fi
}

# ─── 8. Git ──────────────────────────────────────────────────────
check_git() {
  local name="Git installed and accessible"
  local version
  version=$(git --version 2>/dev/null) || {
    check_result "fail" "$name" "git not found in PATH or not installed"
    return
  }
  if [ "$VERBOSE" = true ]; then
    log_verb "git --version: $version"
  fi
  check_result "pass" "$name" "$version"

  name="Git SSH connectivity"
  if ssh -T git@github.com 2>&1 | grep -qi "successfully authenticated"; then
    check_result "pass" "$name" "SSH key authenticated with GitHub"
  elif ssh -T git@github.com 2>&1 | grep -qi "permission denied"; then
    check_result "warn" "$name" "SSH key not registered with GitHub — HTTPS pull still works"
  else
    check_result "warn" "$name" "Cannot verify SSH connectivity — git may not have SSH access"
  fi
}

# ─── 9. DNS resolution ───────────────────────────────────────────
check_dns() {
  local name="DNS resolution for configured endpoints"

  # Extract public URLs from env file for DNS checks
  local hosts=()
  local env_source=""
  [ -f "$ENV_FILE" ] && env_source="$ENV_FILE" || env_source="$ENV_EXAMPLE"

  if [ -f "$env_source" ]; then
    while IFS= read -r line; do
      [[ "$line" =~ ^[[:space:]]*# ]] && continue
      [[ "$line" != *"="* ]] && continue
      local key="${line%%=*}"
      local value="${line#*=}"
      value="${value%\"}"
      value="${value#\"}"
      case "$key" in
        API_PUBLIC_URL|FRONTEND_URL|NEXT_PUBLIC_API_URL|NEXT_PUBLIC_VISION_API_URL|NGINX_SERVER_NAME)
          # Skip values that reference other variables
          [[ "$value" == *'${'* ]] && continue
          # Extract hostname from URL (strip protocol and path)
          local host
          host=$(echo "$value" | sed 's|https\?://||' | sed 's|/.*$||' | sed 's|:.*$||')
          [ -n "$host" ] && hosts+=("$host")
          ;;
      esac
    done < "$env_source"
  fi

  # Deduplicate
  local -A seen=()
  local unique_hosts=()
  for h in "${hosts[@]}"; do
    [ -z "$h" ] && continue
    [ -n "${seen[$h]:-}" ] && continue
    seen[$h]=1
    unique_hosts+=("$h")
  done

  if [ ${#unique_hosts[@]} -eq 0 ]; then
    check_result "pass" "$name" "No public URLs configured to check"
    return
  fi

  local failures=()
  for host in "${unique_hosts[@]}"; do
    if host "$host" >/dev/null 2>&1 || nslookup "$host" >/dev/null 2>&1; then
      local ip
      ip=$(host "$host" 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "resolved")
      if [ "$VERBOSE" = true ]; then
        log_verb "  $host → $ip"
      fi
    else
      failures+=("$host")
    fi
  done

  if [ ${#failures[@]} -eq 0 ]; then
    check_result "pass" "$name" "All ${#unique_hosts[@]} host(s) resolve"
  else
    local joined
    joined=$(IFS=", "; echo "${failures[*]}")
    check_result "warn" "$name" "DNS resolution failed for: $joined (may not be public yet)"
  fi
}

# ─── 10. Docker network ──────────────────────────────────────────
check_docker_network() {
  local name="Docker network creation"
  local test_net="xennic-preflight-$$"

  if docker network create "$test_net" >/dev/null 2>&1; then
    docker network rm "$test_net" >/dev/null 2>&1 || true
    check_result "pass" "$name" "Docker can create and remove networks"
  else
    check_result "fail" "$name" "Cannot create Docker network — check docker permissions"
  fi
}

# ─── Main ─────────────────────────────────────────────────────────
if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════════════════════${N}"
  echo -e "${B}  Xennic — Pre-Deployment Preflight Check${N}"
  echo -e "${B}══════════════════════════════════════════════════════════════${N}"
  echo ""
  log_info "Project root: $PROJECT_ROOT"
  log_info "Compose file: $COMPOSE_FILE"
  log_info "Env example:  $ENV_EXAMPLE"
  echo ""
fi

# ─── Prerequisites ────────────────────────────────────────────────
if [ "$JSON_MODE" = false ]; then
  echo -e "${B}System Requirements:${N}"
fi
check_docker
check_docker_compose
check_ports
check_disk
check_memory
check_cpu

if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}Configuration Checks:${N}"
fi
check_env_vars
check_git
check_dns
check_docker_network

# ─── Summary ──────────────────────────────────────────────────────
TOTAL_CHECKS=$CHECKED
if [ "$JSON_MODE" = true ]; then
  json_output="${json_output%,}"
  cat <<JSON
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total": $TOTAL_CHECKS,
  "failures": $FAILURES,
  "warnings": $WARNINGS,
  "results": [$json_output]
}
JSON
fi

if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════════════════════${N}"
  echo -e "  ${B}Summary:${N}  $TOTAL_CHECKS checks, ${G}$((TOTAL_CHECKS - FAILURES - WARNINGS)) passed${N}"
  [ "$FAILURES" -gt 0 ] && echo -e "         ${R}$FAILURES failure(s) — deployment blocked${N}"
  [ "$WARNINGS" -gt 0 ] && echo -e "         ${Y}$WARNINGS warning(s) — review recommended${N}"
  [ "$FAILURES" -eq 0 ] && [ "$WARNINGS" -eq 0 ] && echo -e "         ${G}All systems ready for deployment${N}"
  echo ""
fi

[ "$FAILURES" -gt 0 ] && exit 2
[ "$WARNINGS" -gt 0 ] && exit 1
exit 0
