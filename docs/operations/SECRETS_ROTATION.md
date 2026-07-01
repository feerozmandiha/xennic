# Secrets Rotation Guide

**Version**: 1.0.0 | **Status**: Final | **Last Updated**: 2026-06-23 | **Sprint**: A2.5

**Related**: [Secrets Management](/home/ahmad/xennic-docs/docs/security/SECRETS_MANAGEMENT.md) · [Secrets Inventory](/home/ahmad/xennic-docs/docs/security/Secrets.md) · [Alpha Security Checklist](/home/ahmad/xennic/docs/releases/ALPHA_SECURITY_CHECKLIST.md) · [Production Readiness Audit](/home/ahmad/xennic/docs/project/PRODUCTION_READINESS_AUDIT.md) · [JWT](/home/ahmad/xennic-docs/docs/security/JWT.md) · [Data Encryption](/home/ahmad/xennic-docs/docs/security/DATA_ENCRYPTION.md)

---

## 1. Purpose

This document defines the standard operating procedure for rotating every secret in the Xennic platform — JWT key pairs, database credentials, Redis password, MinIO access keys, third-party API keys, and administrative credentials. All rotations target **zero-downtime** where possible and **full audit logging** always.

Rotation is mandatory:
- **Scheduled**: per the rotation schedule below
- **Emergency**: immediately upon suspected or confirmed compromise (see Section 5)
- **Pre-release**: before any production deployment

---

## 2. Secrets Inventory

### 2.1 Production Secrets

| ID | Secret | Current Location(s) | Type | Scope | Risk if Exposed |
|----|--------|---------------------|------|-------|-----------------|
| SEC-001 | **JWT Private Key** | `infrastructure/docker/secrets/jwtRS256.key` | RSA 2048-bit PEM | All service auth | 🔴 Token forgery, account takeover |
| SEC-002 | **JWT Public Key** | `infrastructure/docker/secrets/jwtRS256.key.pub` | RSA 2048-bit PEM | Token verification | 🟡 Public by design |
| SEC-003 | `POSTGRES_PASSWORD` | `.env`, `infrastructure/docker/.env` | Plaintext | Full database access | 🔴 Data breach, data loss |
| SEC-004 | `DATABASE_URL` (PostgreSQL) | `apps/api/.env` | Connection string | Full database access | 🔴 Data breach, data loss |
| SEC-005 | `REDIS_PASSWORD` | `.env`, `infrastructure/docker/.env` | Plaintext | Redis cache/queue | 🟠 Cache poisoning, session data leak |
| SEC-006 | `MINIO_ACCESS_KEY` | `.env` | Plaintext | Object storage | 🟠 File access, data leak |
| SEC-007 | `MINIO_SECRET_KEY` | `.env` | Plaintext | Object storage | 🟠 File access, data leak |
| SEC-008 | `GROQ_API_KEY` | `apps/api/.env`, `engineering-service/.env` | Plaintext | AI service billing | 🔴 Financial cost, service abuse |
| SEC-009 | `OPENAI_API_KEY` | `workspace/services/ai-service/.env`, `workspace/services/vision-service/.env` | Plaintext | AI service billing | 🔴 Financial cost, service abuse |
| SEC-010 | `ANTHROPIC_API_KEY` | `workspace/services/ai-service/.env`, `workspace/services/vision-service/.env` | Plaintext | AI service billing | 🔴 Financial cost, service abuse |
| SEC-011 | `GOOGLE_API_KEY` | `workspace/services/ai-service/.env` | Plaintext | AI service billing | 🔴 Financial cost, service abuse |
| SEC-012 | `ZARINPAL_MERCHANT_ID` | `apps/api/.env` | Plaintext | Payment gateway | 🔴 Financial fraud |
| SEC-013 | `RABBITMQ_DEFAULT_PASS` | `.env`, `infrastructure/docker/.env` | Plaintext | Message queue | 🟠 Queue manipulation |
| SEC-014 | `ADMIN_PASSWORD` | `.env` | Plaintext | Admin account | 🔴 Full platform takeover |
| SEC-015 | `AI_API_KEY` (duplicate Groq) | `apps/api/.env` | Plaintext | AI service | 🟡 Redundant (same as SEC-008) |

### 2.2 CI/CD Secrets (GitHub Actions)

| ID | Secret | Location | Scope |
|----|--------|----------|-------|
| CI-001 | `REGISTRY_TOKEN` | GitHub Secrets | Container registry push |
| CI-002 | `SSH_PRIVATE_KEY` | GitHub Secrets | Deployment server access |
| CI-003 | `ENV_FILE_BASE64` | GitHub Secrets | Production .env injection |

### 2.3 Rotation Schedule

| Secret | Period | Zero-Downtime | Rotation Window | Validator |
|--------|--------|---------------|-----------------|-----------|
| JWT key pair | 90 days | ❌ (users re-login) | Off-peak, announce 24h prior | Auth e2e tests |
| POSTGRES_PASSWORD | 90 days | ❌ (~30s restart) | Maintenance window | Health check |
| REDIS_PASSWORD | 90 days | ❌ (~30s restart) | Maintenance window | redis-cli ping |
| MINIO keys | 180 days | ✅ (dual-key overlap) | Any time | MinIO health check |
| GROQ_API_KEY | 90 days | ✅ (dual-key overlap) | Any time | API call test |
| OPENAI_API_KEY | 90 days | ✅ (dual-key overlap) | Any time | API call test |
| ANTHROPIC_API_KEY | 90 days | ✅ (dual-key overlap) | Any time | API call test |
| GOOGLE_API_KEY | 90 days | ✅ (dual-key overlap) | Any time | API call test |
| ZARINPAL_MERCHANT_ID | 180 days | ❌ (manual switch) | Maintenance window | Payment test |
| RABBITMQ_DEFAULT_PASS | 180 days | ❌ (~30s restart) | Maintenance window | rabbitmq-diagnostics ping |
| ADMIN_PASSWORD | 90 days | ❌ (session re-auth) | Off-peak | Login test |
| CI/CD secrets | 180 days | ✅ (GitHub rotates) | Any time | CI pipeline pass |

---

## 3. Rotation Procedures

### 3.1 JWT RS256 Key Pair

**Impact**: All issued access tokens become invalid immediately upon restart. Users must re-authenticate. Plan for a forced logout of all sessions.

**Step 1 — Backup current keys**

```bash
cd /home/ahmad/xennic
BACKUP_DIR="infrastructure/docker/secrets/backup/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp infrastructure/docker/secrets/jwtRS256.key "$BACKUP_DIR/jwtRS256.key"
cp infrastructure/docker/secrets/jwtRS256.key.pub "$BACKUP_DIR/jwtRS256.key.pub"
chmod 400 "$BACKUP_DIR"/*
```

**Step 2 — Generate new key pair**

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out infrastructure/docker/secrets/jwtRS256.key
openssl rsa -pubout -in infrastructure/docker/secrets/jwtRS256.key \
  -out infrastructure/docker/secrets/jwtRS256.key.pub
chmod 600 infrastructure/docker/secrets/jwtRS256.key
chmod 644 infrastructure/docker/secrets/jwtRS256.key.pub
```

**Step 3 — Verify new keys**

```bash
openssl rsa -text -noout -in infrastructure/docker/secrets/jwtRS256.key | head -3
openssl rsa -pubin -in infrastructure/docker/secrets/jwtRS256.key.pub -text -noout | head -3
# Confirm modulus matches between private and public
```

**Step 4 — Deploy (Docker Secrets)**

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d api
```

**Step 5 — Verify**

```bash
# Get a new token
TOKEN=$(curl -s -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@xennic.ir","password":"'${ADMIN_PASSWORD}'"}' | jq -r '.data.accessToken')

# Call a protected endpoint
curl -s http://localhost/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .

# Verify the new key signed it (check kid if implemented)
echo "$TOKEN" | cut -d'.' -f1 | base64 -d | jq .
```

**Step 6 — Retire old keys**

After 48 hours with no rollback needed: remove backup files from server (keep in encrypted off-site storage for 90 days).

```bash
rm -rf "infrastructure/docker/secrets/backup/$(date -d '2 days ago' +%Y%m%d)*"
```

**Rollback**: Replace the key files with the backup, restart API.

---

### 3.2 Database Credentials (PostgreSQL)

**Impact**: ~30 seconds of database connection interruption. API, Engineering Service, and any DB-connected consumers restart.

**Step 1 — Generate new password**

```bash
NEW_DB_PASS=$(openssl rand -base64 32)
echo "New password: $NEW_DB_PASS"
```

**Step 2 — Update password inside PostgreSQL**

```bash
docker exec xennic-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "ALTER USER ${POSTGRES_USER} WITH PASSWORD '${NEW_DB_PASS}';"
```

**Step 3 — Update .env files**

```bash
# Root .env
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${NEW_DB_PASS}/" .env

# Docker .env
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${NEW_DB_PASS}/" infrastructure/docker/.env

# Update DATABASE_URL in apps/api/.env (if used)
NEW_DB_URL="postgresql://${POSTGRES_USER}:${NEW_DB_PASS}@${POSTGRES_HOST:-localhost}:${POSTGRES_PORT:-5432}/${POSTGRES_DB}?schema=public"
sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"${NEW_DB_URL}\"|" apps/api/.env
```

**Step 4 — Restart dependent services**

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart engineering-service
```

**Step 5 — Verify**

```bash
docker exec xennic-postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
# Also verify from API health endpoint
curl -s http://localhost/api/v1/health | jq .
```

**Rollback**: Use the previous password, repeat ALTER USER with old value, restart services.

---

### 3.3 Redis Password

**Impact**: ~30 seconds cache/queue interruption. All services reconnect after restart.

**Step 1 — Generate new password**

```bash
NEW_REDIS_PASS=$(openssl rand -base64 32)
echo "New Redis password: $NEW_REDIS_PASS"
```

**Step 2 — Update .env files**

```bash
sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${NEW_REDIS_PASS}/" .env
sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${NEW_REDIS_PASS}/" infrastructure/docker/.env
```

**Step 3 — Restart Redis with new password**

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d redis
```

**Step 4 — Restart dependent services**

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api
```

**Step 5 — Verify**

```bash
docker exec xennic-redis redis-cli -a "${NEW_REDIS_PASS}" ping
# → PONG
```

**Rollback**: Revert REDIS_PASSWORD in .env files, restart Redis and API.

---

### 3.4 MinIO Access Keys

**Impact**: Zero downtime — MinIO supports multiple simultaneous access keys. Create a new key, update consumers, then revoke the old key.

**Step 1 — Create a new access key pair in MinIO**

```bash
# Ensure mc is configured
docker exec xennic-minio mc alias set local \
  http://localhost:9000 "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}"

# Create new service account
NEW_MINIO_CREDS=$(docker exec xennic-minio mc admin user svcacct add local "${MINIO_ACCESS_KEY}")
echo "$NEW_MINIO_CREDS"
```

**Step 2 — Extract new credentials**

```bash
NEW_MINIO_ACCESS_KEY=$(echo "$NEW_MINIO_CREDS" | grep 'Access Key' | awk '{print $NF}')
NEW_MINIO_SECRET_KEY=$(echo "$NEW_MINIO_CREDS" | grep 'Secret Key' | awk '{print $NF}')
```

**Step 3 — Update `.env` and dependent services**

```bash
sed -i "s/MINIO_ACCESS_KEY=.*/MINIO_ACCESS_KEY=${NEW_MINIO_ACCESS_KEY}/" .env
sed -i "s/MINIO_SECRET_KEY=.*/MINIO_SECRET_KEY=${NEW_MINIO_SECRET_KEY}/" .env
```

**Step 4 — Restart services that consume MinIO**

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api vision-service
```

**Step 5 — Verify**

```bash
docker exec xennic-minio mc alias set newlocal \
  http://localhost:9000 "${NEW_MINIO_ACCESS_KEY}" "${NEW_MINIO_SECRET_KEY}"
docker exec xennic-minio mc ls newlocal/
```

**Step 6 — Revoke old access key**

After 24 hours (or immediately in emergency):

```bash
docker exec xennic-minio mc admin user svcacct remove local "${OLD_ACCESS_KEY}"
```

**Rollback**: Create another new key pair (or use backup if saved); update .env; revoke the compromised new key.

---

### 3.5 Third-Party API Keys (Groq, OpenAI, Anthropic, Google, Zarinpal)

**Strategy**: All third-party API keys follow the dual-key protocol — add the new key alongside the old one, switch over, then revoke the old key. This achieves zero-downtime rotation.

**Step 1 — Obtain new key from provider console**

| Provider | Console URL | Pre-rotation Checks |
|----------|------------|---------------------|
| **Groq** | https://console.groq.com/keys | Verify billing is active, check rate limits |
| **OpenAI** | https://platform.openai.com/api-keys | Set usage limits on new key, verify quota |
| **Anthropic** | https://console.anthropic.com/ | Check rate tier, verify workspaces |
| **Google AI** | https://makersuite.google.com/app/apikey | Verify quota, check enabled APIs |
| **Zarinpal** | https://panel.zarinpal.com/ | Verify merchant account status |

**Step 2 — Add new key alongside old key in `.env`**

```bash
# For GROQ_API_KEY — keep old, add new
echo "GROQ_API_KEY_NEW=<new_key_from_console>" >> .env
echo "GROQ_API_KEY_NEW=<new_key_from_console>" >> apps/api/.env
echo "GROQ_API_KEY_NEW=<new_key_from_console>" >> workspace/services/engineering-service/.env
```

**Step 3 — Update docker-compose environment**

For production deployments, add the new key variable to `docker-compose.yml`:

```yaml
# infrastructure/docker/compose/production/docker-compose.yml
services:
  vision-service:
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
      - GROQ_API_KEY_NEW=${GROQ_API_KEY_NEW}
```

**Step 4 — Update application code to use new key as primary**

```typescript
// apps/api (NestJS) — config with fallback
const groqApiKey = process.env.GROQ_API_KEY_NEW || process.env.GROQ_API_KEY;
```

**Step 5 — Restart services**

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api vision-service
```

**Step 6 — Test**

```bash
# Hit an endpoint that uses the LLM
curl -s http://localhost/api/v1/ai/health | jq .
```

**Step 7 — Revoke old key at provider console**

After 48-hour observation period:
1. Log in to provider console
2. Delete/revoke the old key
3. Rename `GROQ_API_KEY_NEW` → `GROQ_API_KEY` across all .env files
4. Remove fallback logic from code
5. Remove `GROQ_API_KEY_NEW` from docker-compose

**Rollback**: Set `GROQ_API_KEY` back to the old key value (if still valid), restart services.

---

### 3.6 Admin Password

**Impact**: Current admin sessions remain valid until JWT expiry (max 15 min). The admin must log in again with the new password.

**Step 1 — Generate new password**

```bash
NEW_ADMIN_PASS=$(openssl rand -base64 16)
echo "New admin password: $NEW_ADMIN_PASS"
```

**Step 2 — Update the password hash in the database**

```bash
# Use the API's own password-hash endpoint or a script
# If Argon2id is used (recommended), hash via the API service
PASS_HASH=$(curl -s -X POST http://localhost/api/v1/admin/hash-password \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$NEW_ADMIN_PASS\"}" | jq -r '.data.hash')

# Update admin user in database
docker exec xennic-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "UPDATE users SET password_hash='${PASS_HASH}' WHERE email='admin@xennic.ir';"
```

If the hash endpoint is unavailable, use Node.js directly:

```bash
node -e "
const argon2 = require('argon2');
const pass = '${NEW_ADMIN_PASS}';
argon2.hash(pass).then(hash => console.log(hash));
"
```

**Step 3 — Update `.env`**

```bash
sed -i "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=${NEW_ADMIN_PASS}/" .env
```

> **Note**: The `.env` `ADMIN_PASSWORD` is only used for initial seeding. After seeding, the database hash is authoritative. Keep `.env` in sync for disaster recovery.

**Step 4 — Verify**

```bash
# Login with new password
curl -s -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@xennic.ir\",\"password\":\"$NEW_ADMIN_PASS\"}" | jq .
```

**Rollback**: Use the old password hash from backup, update via SQL.

---

## 4. Emergency Rotation

Use this procedure when a secret compromise is **confirmed or strongly suspected** (e.g., leaked in git commit, exposed in logs, detected in SIEM).

### 4.1 Immediate Actions (T-minus 0–5 min)

```bash
# ── 1. Trigger incident in the on-call system ──
# Log to: #security-alerts Slack channel + PagerDuty

# ── 2. Revoke all sessions ──
docker exec xennic-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "UPDATE refresh_tokens SET revoked_at = NOW() WHERE revoked_at IS NULL;"
docker exec xennic-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "DELETE FROM sessions;"

# ── 3. Rotate the compromised secret(s) using the procedures above ──
# If JWT is compromised, also rotate DB password + Redis password + admin password
# (assume full platform compromise)
```

### 4.2 Full Emergency Rotation Script

Save as `scripts/emergency-rotate.sh` and run when the entire platform's secret store is compromised:

```bash
#!/usr/bin/env bash
# scripts/emergency-rotate.sh
# Full emergency rotation — run when all secrets are suspect
set -euo pipefail

export COMPOSE_FILE="infrastructure/docker/compose/production/docker-compose.yml"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo " EMERGENCY SECRETS ROTATION "
echo " Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "============================================"

log() { echo "[$(date +%H:%M:%S)] $*"; }

# ── Phase 1: Backup ──
log "Phase 1: Backing up current secrets..."
BACKUP_DIR="infrastructure/docker/secrets/emergency-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp infrastructure/docker/secrets/jwtRS256.key "$BACKUP_DIR/" 2>/dev/null || true
cp .env "$BACKUP_DIR/"
echo "Backup created at $BACKUP_DIR"

# ── Phase 2: JWT ──
log "Phase 2: Rotating JWT key pair..."
cp infrastructure/docker/secrets/jwtRS256.key "$BACKUP_DIR/jwtRS256.key.before"
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out infrastructure/docker/secrets/jwtRS256.key
openssl rsa -pubout -in infrastructure/docker/secrets/jwtRS256.key \
  -out infrastructure/docker/secrets/jwtRS256.key.pub
chmod 600 infrastructure/docker/secrets/jwtRS256.key

# ── Phase 3: Database ──
log "Phase 3: Rotating database password..."
NEW_DB_PASS=$(openssl rand -base64 32)
docker exec xennic-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "ALTER USER ${POSTGRES_USER} WITH PASSWORD '${NEW_DB_PASS}';"
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${NEW_DB_PASS}/" .env
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${NEW_DB_PASS}/" infrastructure/docker/.env

# ── Phase 4: Redis ──
log "Phase 4: Rotating Redis password..."
NEW_REDIS_PASS=$(openssl rand -base64 32)
sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${NEW_REDIS_PASS}/" .env
sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${NEW_REDIS_PASS}/" infrastructure/docker/.env
docker compose -f "$COMPOSE_FILE" up -d redis

# ── Phase 5: Admin password ──
log "Phase 5: Rotating admin password..."
NEW_ADMIN_PASS=$(openssl rand -base64 16)
# Note: In production, hash this with argon2 via the API.
# Here we update .env; a separate step updates the DB hash.
sed -i "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=${NEW_ADMIN_PASS}/" .env
echo "WARN: Admin DB hash must be updated manually via API."

# ── Phase 6: Restart ──
log "Phase 6: Restarting all services..."
docker compose -f "$COMPOSE_FILE" restart api vision-service engineering-service ai-service

# ── Phase 7: Verify ──
log "Phase 7: Verification..."
sleep 10
if curl -sf http://localhost/api/v1/health > /dev/null 2>&1; then
  echo "✅ API health check passed"
else
  echo "❌ API health check FAILED — check logs"
fi

echo "============================================"
echo " EMERGENCY ROTATION COMPLETE "
echo " Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo " Backup at: $BACKUP_DIR"
echo "============================================"

# ── Phase 8: Notify ──
echo "Notify the team: #security-alerts channel"
echo "Create a post-mortem issue tagged security/rotation"
```

### 4.3 Post-Emergency Checklist

| # | Action | Owner | Deadline |
|---|--------|-------|----------|
| 1 | Update DB password hash for admin user via API | DevOps | 15 min |
| 2 | Rotate all third-party API keys at provider consoles | Lead Dev | 1 hour |
| 3 | Rotate GitHub Secrets (CI/CD) | DevOps | 1 hour |
| 4 | Verify all health endpoints pass | DevOps | 2 hours |
| 5 | Run full integration test suite | QA | 4 hours |
| 6 | Create post-mortem with root cause analysis | Security Lead | 24 hours |
| 7 | Update schedule to trigger earlier rotation | DevOps | 48 hours |

---

## 5. Audit Logging

Every secret rotation **must** be logged to the platform's audit trail. Rotations are security-relevant events and feed into compliance reporting.

### 5.1 Log Format

```json
{
  "event": "secret.rotation",
  "version": "1.0.0",
  "timestamp": "2026-06-23T14:30:00Z",
  "actor": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "devops@xennic.com",
    "role": "devops"
  },
  "target": {
    "secret_id": "SEC-001",
    "secret_name": "JWT_PRIVATE_KEY",
    "rotation_type": "scheduled"
  },
  "outcome": "success",
  "metadata": {
    "reason": "90-day scheduled rotation",
    "backup_path": "infrastructure/docker/secrets/backup/20260623-143000/",
    "services_restarted": ["api"],
    "session_invalidation": true
  },
  "source_ip": "203.0.113.42",
  "correlation_id": "c7a3b2f0-...",
  "severity": "high"
}
```

### 5.2 Write-to Locations

| Destination | Purpose | Retention |
|-------------|---------|-----------|
| **`/var/log/xennic/audit/secret-rotation.log`** | Local file audit trail | 90 days |
| **Grafana Loki** (label: `event=secret-rotation`) | Centralized querying | 1 year |
| **AWS CloudTrail / Vault Audit** (future) | Compliance archive | 7 years |
| **Slack #security-alerts** channel notification | Real-time alert | — |
| **PostgreSQL audit_logs table** (if available) | Database-backed audit | 1 year |

### 5.3 Notification Template

Post to `#security-alerts` on every rotation:

```
🔑 Secret Rotation Completed
  Secret: SEC-001 (JWT_PRIVATE_KEY)
  Type: scheduled
  Outcome: success
  Services restarted: api
  Actor: devops@xennic.com
  Log: /var/log/xennic/audit/secret-rotation.log
```

### 5.4 Automated Audit via Logger

```bash
# Helper function for scripted rotations
log_rotation() {
  local secret_id="$1" secret_name="$2" outcome="$3" reason="$4"
  local timestamp
  timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  local log_line=$(cat <<EOF
{
  "event": "secret.rotation",
  "timestamp": "$timestamp",
  "actor": { "email": "${USER:-unknown}@xennic.com" },
  "target": { "secret_id": "$secret_id", "secret_name": "$secret_name" },
  "outcome": "$outcome",
  "metadata": { "reason": "$reason" },
  "severity": "high"
}
EOF
)
  echo "$log_line" | sudo tee -a /var/log/xennic/audit/secret-rotation.log > /dev/null
  # Also send to Slack if webhook configured
  if [[ -n "${SLACK_SECURITY_WEBHOOK:-}" ]]; then
    curl -s -X POST "$SLACK_SECURITY_WEBHOOK" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"🔑 Secret Rotation: $secret_name ($outcome)\"}" > /dev/null
  fi
}
```

---

## 6. Recovery

If a rotation breaks the system, follow these steps in order.

### 6.1 JWT Rotation Failure

**Symptoms**: `401 Unauthorized` on all endpoints, users cannot authenticate.

**Recovery**:
```bash
# 1. Restore previous key pair from backup
cp "infrastructure/docker/secrets/backup/$(ls -t infrastructure/docker/secrets/backup/ | head -1)/jwtRS256.key" \
  infrastructure/docker/secrets/jwtRS256.key
cp "infrastructure/docker/secrets/backup/$(ls -t infrastructure/docker/secrets/backup/ | head -1)/jwtRS256.key.pub" \
  infrastructure/docker/secrets/jwtRS256.key.pub

# 2. Restart API
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api

# 3. Verify
curl -s http://localhost/api/v1/auth/me -H "Authorization: Bearer $OLD_TOKEN" | jq .
```

### 6.2 Database Password Rotation Failure

**Symptoms**: API cannot connect to PostgreSQL, `ECONNREFUSED` or `password authentication failed` in logs.

**Recovery**:
```bash
# 1. Revert password in PostgreSQL
docker exec xennic-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "ALTER USER ${POSTGRES_USER} WITH PASSWORD '${OLD_DB_PASS}';"

# 2. Revert .env files
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${OLD_DB_PASS}/" .env
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${OLD_DB_PASS}/" infrastructure/docker/.env

# 3. Restart services
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api

# 4. Investigate root cause in /var/log/xennic/api/error.log
```

### 6.3 Redis Password Rotation Failure

**Symptoms**: Cache misses, session errors, `NOAUTH Authentication required` in logs.

**Recovery**:
```bash
# 1. Revert .env
sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${OLD_REDIS_PASS}/" .env
sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${OLD_REDIS_PASS}/" infrastructure/docker/.env

# 2. Restart Redis and API
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart redis api

# 3. Verify
docker exec xennic-redis redis-cli -a "${OLD_REDIS_PASS}" ping
```

### 6.4 Third-Party API Key Rotation Failure

**Symptoms**: HTTP 401/403 from LLM provider, AI features broken.

**Recovery**:
```bash
# 1. If old key was not yet revoked: simply revert .env
sed -i "s/GROQ_API_KEY=.*/GROQ_API_KEY=${OLD_GROQ_KEY}/" .env
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api vision-service

# 2. If old key was already revoked: generate a new key at provider console
# and update .env with the brand-new key, restart services.
```

### 6.5 General Rollback Procedure

When the specific cause is unknown, perform a full secrets rollback:

```bash
# 1. Restore entire .env from backup
cp "infrastructure/docker/secrets/backup/$(ls -t infrastructure/docker/secrets/backup/ | head -1)/.env" .env

# 2. Restore JWT keys
cp "infrastructure/docker/secrets/backup/$(ls -t infrastructure/docker/secrets/backup/ | head -1)/jwtRS256.key" \
  infrastructure/docker/secrets/jwtRS256.key
cp "infrastructure/docker/secrets/backup/$(ls -t infrastructure/docker/secrets/backup/ | head -1)/jwtRS256.key.pub" \
  infrastructure/docker/secrets/jwtRS256.key.pub

# 3. Restart everything
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart

# 4. Run health checks
curl -sf http://localhost/api/v1/health
```

---

## 7. Pre-Rotation Checklist

Run this checklist before **every** scheduled rotation:

| # | Check | Verified by |
|---|-------|-------------|
| 1 | Recent database backup exists and is tested | [ ] |
| 2 | JWT key backup taken (current keys) | [ ] |
| 3 | All .env files backed up to `/secrets/backup/` | [ ] |
| 4 | Recent backup of all `.env.*` files | [ ] |
| 5 | Third-party provider consoles are accessible | [ ] |
| 6 | On-call engineer is notified of maintenance window | [ ] |
| 7 | Health monitoring (Grafana/Datadog) is accessible | [ ] |
| 8 | Slack #security-alerts channel is active | [ ] |
| 9 | Rollback plan is reviewed and ready | [ ] |
| 10 | All affected service owners have acknowledged | [ ] |

---

## 8. Automation Roadmap

| Phase | Target | What | Priority |
|-------|--------|------|----------|
| **Phase 1** | Sprint A2.5 | Manual runbook + logging helper (this doc) | P0 |
| **Phase 2** | Sprint B1 | Shell scripts for each rotation type in `scripts/rotate-*.sh` | P1 |
| **Phase 3** | Sprint B2 | GitHub Actions workflow `rotate-secrets.yml` with manual trigger | P1 |
| **Phase 4** | Sprint B3 | HashiCorp Vault integration with auto-rotation engine | P2 |
| **Phase 5** | Sprint C1 | Vault dynamic secrets (auto-rotating DB creds on each connection) | P2 |

---

## 9. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-06-23 | DevOps / Security Team | Initial release — comprehensive rotation guide for Sprint A2.5 critical security closure. Covers JWT, DB, Redis, MinIO, 3rd-party API keys, admin password. Includes emergency rotation, audit logging, recovery procedures. |

---

> **Post-rotation**: Run the [Deployment Checklist](/home/ahmad/xennic/docs/deployment/PRODUCTION_CHECKLIST.md) and verify all health endpoints pass before closing the rotation ticket.
