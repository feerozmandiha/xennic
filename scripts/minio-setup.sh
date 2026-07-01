#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────
# Xennic — MinIO Setup Script
# ──────────────────────────────────────────────────────────────────
# Creates buckets, sets policies, enables versioning,
# and provisions access keys for platform services.
#
# Idempotent — safe to re-run at any time.
# ──────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ── Config ──────────────────────────────────────────────────────
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://localhost:9000}"
MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-Ch4ngeTh1s!nPr0duct10n}"
MC_ALIAS="${MC_ALIAS:-xennic}"
LOG_FILE="${LOG_FILE:-${SCRIPT_DIR}/minio-setup.log}"
MC_BIN="mc"

# Bucket definitions
BUCKETS=(
  "xennic-uploads"
  "xennic-calculations"
  "xennic-backups"
  "xennic-ai-models"
  "xennic-public"
)

# Buckets that should have versioning enabled
VERSIONED_BUCKETS=("xennic-backups" "xennic-ai-models")

# ── Helpers ─────────────────────────────────────────────────────
log() {
  local level="$1"
  shift
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [${level}] $*" | tee -a "${LOG_FILE}"
}

info()  { log "INFO"  "$*"; }
warn()  { log "WARN"  "$*"; }
error() { log "ERROR" "$*"; }

cleanup() {
  local ec=$?
  if [ $ec -ne 0 ]; then
    error "Script failed with exit code ${ec}"
  else
    info "Setup completed successfully"
  fi
  exit $ec
}
trap cleanup EXIT

# ── Prerequisites ───────────────────────────────────────────────
if ! command -v "${MC_BIN}" &>/dev/null; then
  error "MinIO Client (mc) not found. Install it first:"
  error "  curl https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc"
  error "  chmod +x /usr/local/bin/mc"
  exit 1
fi

# ── Wait for MinIO ──────────────────────────────────────────────
info "Waiting for MinIO at ${MINIO_ENDPOINT}..."

MAX_RETRIES=30
RETRY_DELAY=2
retries=0
until ${MC_BIN} ping --count 1 --error-count 1 "${MINIO_ENDPOINT}" &>/dev/null; do
  retries=$((retries + 1))
  if [ "${retries}" -ge "${MAX_RETRIES}" ]; then
    error "MinIO not reachable after ${MAX_RETRIES} attempts at ${MINIO_ENDPOINT}"
    exit 1
  fi
  warn "MinIO not ready yet (attempt ${retries}/${MAX_RETRIES})..."
  sleep "${RETRY_DELAY}"
done
info "MinIO is reachable"

# ── Configure mc alias ──────────────────────────────────────────
if ${MC_BIN} alias set "${MC_ALIAS}" "${MINIO_ENDPOINT}" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" &>/dev/null; then
  info "MinIO alias '${MC_ALIAS}' configured"
else
  error "Failed to set MinIO alias '${MC_ALIAS}'"
  exit 1
fi

# ── Create Buckets ──────────────────────────────────────────────
for bucket in "${BUCKETS[@]}"; do
  if ${MC_BIN} ls "${MC_ALIAS}/${bucket}" &>/dev/null 2>&1; then
    info "Bucket '${bucket}' already exists — skipping creation"
  else
    if ${MC_BIN} mb "${MC_ALIAS}/${ bucket}" --region us-east-1; then
      info "Created bucket '${bucket}'"
    else
      error "Failed to create bucket '${bucket}'"
      exit 1
    fi
  fi
done

# ── Set Bucket Policies ─────────────────────────────────────────
info "Setting bucket policies..."

# Private buckets (default — no public access)
for bucket in "xennic-uploads" "xennic-calculations" "xennic-backups" "xennic-ai-models"; do
  if ${MC_BIN} anonymous set private "${MC_ALIAS}/${bucket}" &>/dev/null; then
    info "  '${bucket}' → private"
  else
    warn "  Failed to set policy for '${bucket}' (may already be correct)"
  fi
done

# Public bucket
if ${MC_BIN} anonymous set download "${MC_ALIAS}/xennic-public" &>/dev/null; then
  info "  'xennic-public' → public (download)"
else
  warn "  Failed to set public policy for 'xennic-public'"
fi

# ── Enable Versioning ───────────────────────────────────────────
info "Enabling versioning on designated buckets..."

for bucket in "${VERSIONED_BUCKETS[@]}"; do
  current_status=$(${MC_BIN} version info "${MC_ALIAS}/${bucket}" 2>/dev/null | grep -i "versioning" || echo "")
  if echo "${current_status}" | grep -qi "enabled"; then
    info "  Versioning already enabled on '${bucket}'"
  else
    if ${MC_BIN} version enable "${MC_ALIAS}/${bucket}"; then
      info "  Versioning enabled on '${bucket}'"
    else
      warn "  Failed to enable versioning on '${bucket}'"
    fi
  fi
done

# ── Set Lifecycle Policies ──────────────────────────────────────
info "Setting lifecycle policies..."

apply_lifecycle() {
  local bucket="$1"
  local rule_file
  rule_file="$(mktemp)"
  cat > "${rule_file}" <<RULES
<?xml version="1.0" encoding="UTF-8"?>
<LifecycleConfiguration>
  <Rule>
    <ID>transition-to-warm</ID>
    <Filter><Prefix></Prefix></Filter>
    <Status>Enabled</Status>
    <Transition>
      <Days>30</Days>
      <StorageClass>WARM</StorageClass>
    </Transition>
  </Rule>
  <Rule>
    <ID>delete-old-data</ID>
    <Filter><Prefix></Prefix></Filter>
    <Status>Enabled</Status>
    <Expiration>
      <Days>365</Days>
    </Expiration>
  </Rule>
</LifecycleConfiguration>
RULES

  if ${MC_BIN} ilm import "${MC_ALIAS}/${bucket}" < "${rule_file}" &>/dev/null; then
    info "  Lifecycle rules applied to '${bucket}'"
  else
    warn "  Failed to apply lifecycle rules to '${bucket}' (may already exist)"
  fi
  rm -f "${rule_file}"
}

for bucket in "xennic-uploads" "xennic-calculations"; do
  apply_lifecycle "${bucket}"
done

# ── Create Access Keys ──────────────────────────────────────────
info "Creating service access keys..."

create_service_key() {
  local key_name="$1"
  local policy_file="$2"
  local policy_name="${key_name}-policy"
  local tmp_policy
  tmp_policy="$(mktemp)"

  # Write policy JSON
  cat > "${tmp_policy}" "${policy_file}"

  # Create or update policy
  if ${MC_BIN} admin policy create "${MC_ALIAS}" "${policy_name}" "${tmp_policy}" &>/dev/null 2>&1; then
    info "  Policy '${policy_name}' created"
  else
    # Policy may already exist — update it
    ${MC_BIN} admin policy update "${MC_ALIAS}" "${policy_name}" "${tmp_policy}" &>/dev/null && \
      info "  Policy '${policy_name}' updated" || \
      warn "  Failed to create/update policy '${policy_name}'"
  fi

  # Check if user already has a key
  existing_keys=$(${MC_BIN} admin user svcacct list "${MC_ALIAS}" "${key_name}" 2>/dev/null || true)
  if [ -n "${existing_keys}" ]; then
    info "  Access key(s) already exist for '${key_name}' — skipping creation"
    info "  To rotate, delete existing keys manually: mc admin user svcacct remove ${MC_ALIAS} <ACCESS_KEY>"
  else
    # Create user if not exists
    ${MC_BIN} admin user add "${MC_ALIAS}" "${key_name}" "xennic-${key_name}-default-secret" &>/dev/null || true
    # Assign policy
    ${MC_BIN} admin policy set "${MC_ALIAS}" "${policy_name}" user="${key_name}" &>/dev/null || true
    info "  User '${key_name}' configured with policy '${policy_name}'"
    info "  ⚠  Default secret: xennic-${key_name}-default-secret — change immediately via mc admin user info"
  fi

  rm -f "${tmp_policy}"
}

# api-service policy — read/write on uploads + calculations
API_POLICY=$(cat <<'POLICY'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::xennic-uploads/*",
        "arn:aws:s3:::xennic-uploads",
        "arn:aws:s3:::xennic-calculations/*",
        "arn:aws:s3:::xennic-calculations"
      ]
    }
  ]
}
POLICY
)

# ai-service policy — read/write on ai-models
AI_POLICY=$(cat <<'POLICY'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::xennic-ai-models/*",
        "arn:aws:s3:::xennic-ai-models"
      ]
    }
  ]
}
POLICY
)

# engineering-service policy — read-only on calculations
ENG_POLICY=$(cat <<'POLICY'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::xennic-calculations/*",
        "arn:aws:s3:::xennic-calculations"
      ]
    }
  ]
}
POLICY
)

create_service_key "api-service" "${API_POLICY}"
create_service_key "ai-service" "${AI_POLICY}"
create_service_key "engineering-service" "${ENG_POLICY}"

# ── Summary ─────────────────────────────────────────────────────
info "─────────────────────────────────────────────"
info "  MinIO setup complete"
info "  Endpoint:  ${MINIO_ENDPOINT}"
info "  Console:   ${MINIO_ENDPOINT//:9000/:9001}"
info "  Buckets:   ${BUCKETS[*]}"
info "  Log:       ${LOG_FILE}"
info "─────────────────────────────────────────────"
