#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; C='\033[0;36m'; B='\033[1m'; N='\033[0m'

JSON_MODE=false
VERBOSE=false
WARNINGS=0
FAILURES=0

VULN_PACKAGES="jspdf lodash axios got node-fetch minimist shelljs follow-redirects express undici"

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

show_help() {
  cat <<HELP
Usage: bash scripts/validation/security-check.sh [OPTIONS]

Run static security checks on the Xennic platform.

Options:
  --json      Output in JSON format (for CI/CD)
  --verbose   Show detailed information for each check
  --help      Show this help message

Exit codes:
  0  All checks pass (no issues found)
  1  Warnings found (non-critical issues)
  2  Failures found (critical issues)

Examples:
  bash scripts/validation/security-check.sh
  bash scripts/validation/security-check.sh --json
  bash scripts/validation/security-check.sh --verbose
HELP
  exit 0
}

while [ $# -gt 0 ]; do
  case "$1" in
    --help) show_help ;;
    --json) JSON_MODE=true; shift ;;
    --verbose) VERBOSE=true; shift ;;
    *) echo -e "${R}Unknown option: $1${N}"; show_help ;;
  esac
done

if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo -e "${B}  Xennic - Security Check${N}"
  echo -e "${B}══════════════════════════════════════════════${N}"
  echo ""
  log_info "Project: $PROJECT_ROOT"
  echo ""
fi

check_env_secrets() {
  local check_name="env_secrets"
  [ "$JSON_MODE" = false ] && echo -e "${B}Check 1: No hardcoded production secrets in .env files${N}"
  local found=0
  local secret_patterns=("password" "secret" "key" "token" "api_key" "api-key" "apikey" "auth" "credential")

  while IFS= read -r -d '' envfile; do
    local relpath
    relpath=$(realpath --relative-to="$PROJECT_ROOT" "$envfile" 2>/dev/null || echo "$envfile")
    local line_num=0
    while IFS= read -r line; do
      line_num=$((line_num + 1))
      [[ "$line" =~ ^[[:space:]]*# ]] && continue
      [[ -z "$(echo "$line" | tr -d '[:space:]')" ]] && continue
      local lower_line
      lower_line=$(echo "$line" | tr '[:upper:]' '[:lower:]')
      for pattern in "${secret_patterns[@]}"; do
        if echo "$lower_line" | grep -q "$pattern"; then
          local value
          value=$(echo "$line" | sed 's/^[^=]*=//')
          local val_lower
          val_lower=$(echo "$value" | tr '[:upper:]' '[:lower:]')
          if echo "$val_lower" | grep -qE "(placeholder|your_|changeme|example|test|dummy|null|true|false|^$|^\[.*\]$)"; then
            continue
          fi
          if [ -z "$(echo "$value" | tr -d '\"')" ]; then
            continue
          fi
          found=$((found + 1))
          if [ "$JSON_MODE" = false ]; then
            log_warn "Potential secret in $relpath:$line_num"
            log_verb "  $line"
          fi
          json_emit "warn" "$check_name" "Potential secret in $relpath:$line_num"
          break
        fi
      done
    done < "$envfile"
  done < <(find "$PROJECT_ROOT" -name ".env" -o -name ".env.*" 2>/dev/null | grep -v node_modules | grep -v '.git/' | sort -u)

  if [ "$found" -eq 0 ]; then
    [ "$JSON_MODE" = false ] && echo -e "  ${G}OK${N}  No potential secrets found"
    json_emit "pass" "$check_name" "No potential secrets found"
  else
    WARNINGS=$((WARNINGS + found))
    [ "$JSON_MODE" = false ] && echo -e "  ${Y}$found potential secret(s) found - review recommended${N}"
  fi
}

check_docker_user() {
  local check_name="docker_user"
  [ "$JSON_MODE" = false ] && echo "" && echo -e "${B}Check 2: Dockerfiles have USER directive${N}"
  local found=0

  while IFS= read -r -d '' dockerfile; do
    local relpath
    relpath=$(realpath --relative-to="$PROJECT_ROOT" "$dockerfile" 2>/dev/null || echo "$dockerfile")
    if grep -q "^USER" "$dockerfile" 2>/dev/null; then
      local user
      user=$(grep "^USER" "$dockerfile" | head -1 | awk '{print $2}')
      [ "$VERBOSE" = true ] && [ "$JSON_MODE" = false ] && log_verb "  $relpath -> USER $user"
    else
      found=$((found + 1))
      [ "$JSON_MODE" = false ] && log_fail "$relpath - no USER directive (runs as root)"
      json_emit "fail" "$check_name" "$relpath has no USER directive"
    fi
  done < <(find "$PROJECT_ROOT" -name "Dockerfile" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

  if [ "$found" -eq 0 ]; then
    [ "$JSON_MODE" = false ] && echo -e "  ${G}OK${N}  All Dockerfiles have USER directive"
    json_emit "pass" "$check_name" "All Dockerfiles have USER directive"
  else
    FAILURES=$((FAILURES + found))
  fi
}

check_exposed_ports() {
  local check_name="exposed_ports"
  [ "$JSON_MODE" = false ] && echo "" && echo -e "${B}Check 3: Reported exposed ports in Dockerfiles${N}"
  local found=0

  while IFS= read -r -d '' dockerfile; do
    local relpath
    relpath=$(realpath --relative-to="$PROJECT_ROOT" "$dockerfile" 2>/dev/null || echo "$dockerfile")
    local ports
    ports=$(grep "^EXPOSE" "$dockerfile" 2>/dev/null || true)
    if [ -n "$ports" ]; then
      found=$((found + 1))
      if [ "$JSON_MODE" = false ]; then
        while IFS= read -r line; do
          echo -e "  ${C}$relpath${N}: $line"
        done <<< "$ports"
      fi
      json_emit "info" "$check_name" "$relpath: $(echo "$ports" | tr '\n' ' ')"
    fi
  done < <(find "$PROJECT_ROOT" -name "Dockerfile" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

  if [ "$found" -eq 0 ]; then
    [ "$JSON_MODE" = false ] && echo -e "  ${Y}No EXPOSE statements found${N}"
    json_emit "warn" "$check_name" "No EXPOSE statements found"
  fi
}

check_world_writable() {
  local check_name="world_writable"
  [ "$JSON_MODE" = false ] && echo "" && echo -e "${B}Check 4: No world-writable files${N}"
  local found=0

  while IFS= read -r -d '' file; do
    local relpath
    relpath=$(realpath --relative-to="$PROJECT_ROOT" "$file" 2>/dev/null || echo "$file")
    found=$((found + 1))
    [ "$VERBOSE" = true ] && [ "$JSON_MODE" = false ] && log_verb "  World-writable: $relpath"
  done < <(find "$PROJECT_ROOT" -perm -o+w -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/venv/*" -not -path "*/__pycache__/*" -print0 2>/dev/null | head -100)

  if [ "$found" -eq 0 ]; then
    [ "$JSON_MODE" = false ] && echo -e "  ${G}OK${N}  No world-writable files"
    json_emit "pass" "$check_name" "No world-writable files found"
  else
    WARNINGS=$((WARNINGS + found))
    [ "$JSON_MODE" = false ] && echo -e "  ${Y}$found world-writable file(s) found${N}"
    json_emit "warn" "$check_name" "$found world-writable files found"
    if [ "$VERBOSE" = true ] && [ "$JSON_MODE" = false ]; then
      find "$PROJECT_ROOT" -perm -o+w -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null | head -100 | xargs -0 -I{} echo "     {}"
    fi
  fi
}

check_vulnerable_deps() {
  local check_name="vulnerable_deps"
  local found=0
  if [ "$JSON_MODE" = false ]; then
    echo ""
    echo -e "${B}Check 5: Known vulnerable dependencies${N}"
  fi
  for pkg in $VULN_PACKAGES; do
    for pkgfile in $(find "$PROJECT_ROOT" -name "package.json" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null); do
      local relpath
      relpath="$(realpath --relative-to="$PROJECT_ROOT" "$pkgfile" 2>/dev/null || echo "$pkgfile")"
      if grep -q "$pkg" "$pkgfile" 2>/dev/null; then
        found=$((found + 1))
        log_warn "$relpath contains $pkg"
        json_emit "warn" "$check_name" "$relpath contains $pkg"
      fi
    done
  done
  if [ "$found" -eq 0 ]; then
    if [ "$JSON_MODE" = false ]; then echo -e "  ${G}OK${N}  No known vulnerable packages found"; fi
    json_emit "pass" "$check_name" "No known vulnerable packages found"
  else
    WARNINGS=$((WARNINGS + found))
  fi
}

check_env_secrets
check_docker_user
check_exposed_ports
check_world_writable
check_vulnerable_deps

if [ "$JSON_MODE" = true ]; then
  json_output="${json_output%,}"
  cat <<JSON
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "failures": $FAILURES,
  "warnings": $WARNINGS,
  "results": [$json_output]
}
JSON
fi

if [ "$JSON_MODE" = false ]; then
  echo ""
  echo -e "${B}══════════════════════════════════════════════${N}"
  [ "$FAILURES" -gt 0 ] && echo -e "${R}  $FAILURES failure(s) - must fix${N}"
  [ "$WARNINGS" -gt 0 ] && echo -e "${Y}  $WARNINGS warning(s) - review recommended${N}"
  [ "$FAILURES" -eq 0 ] && [ "$WARNINGS" -eq 0 ] && echo -e "${G}  All security checks passed${N}"
  echo ""
fi

[ "$FAILURES" -gt 0 ] && exit 2
[ "$WARNINGS" -gt 0 ] && exit 1
exit 0
