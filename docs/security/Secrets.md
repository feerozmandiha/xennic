# Secrets — مدیریت اسرار

**نسخه**: ۲.۰.۰ | **وضعیت**: Review | **آخرین بروزرسانی**: تیر ۱۴۰۵

---

## Purpose

این سند موجودی کامل اسرار (Secrets Inventory)، رویکرد فعلی مدیریت اسرار، نقشه مهاجرت به Docker Secrets و HashiCorp Vault، و روش اضافه کردن و چرخش اسرار را شرح می‌دهد.

---

## Scope

API keys, database credentials, JWT keys, service tokens, third-party credentials.

---

## Secrets Inventory — موجودی کامل اسرار

### سطح دسترسی: 🔴 CRITICAL (نیاز به اقدام فوری)

| سِری | مقدار (نمونه) | مکان فعلی | خطر | اولویت | وضعیت A2.5 |
|------|--------------|----------|------|--------|------------|
| **JWT Private Key** | RSA 2048-bit | Docker Secrets (`/run/secrets/jwt_private_key`) | 🟢 **Docker Secrets** | P0→✅ | مهاجرت شد |
| **GROQ_API_KEY #1** | (rotated) | `apps/api/.env` (gitignored) | 🟢 **History purged** | P0→✅ | از تاریخچه حذف شد |
| **GROQ_API_KEY #2** | (rotated) | `apps/api/.env` (gitignored) | 🟢 **History purged** | P0→✅ | از تاریخچه حذف شد |
| **GROQ_API_KEY #3** | (rotated) | `engineering-service/.env` (gitignored) | 🟢 **History purged** | P0→✅ | از تاریخچه حذف شد |
| **ZARINPAL_MERCHANT_ID** | (rotated) | `apps/api/.env` (gitignored) | 🟢 **History purged** | P0→✅ | از تاریخچه حذف شد |
| **POSTGRES_PASSWORD** | (rotated) | `.env` + `infrastructure/docker/.env` (gitignored) | 🟢 **History purged** | P0→✅ | از تاریخچه حذف شد |

### سطح دسترسی: 🟠 HIGH

| سِری | مکان فعلی | وضعیت |
|------|----------|--------|
| OPENAI_API_KEY | Production docker-compose env | placeholder |
| ANTHROPIC_API_KEY | Production docker-compose env | placeholder |
| GOOGLE_API_KEY | Production docker-compose env | placeholder |
| SMTP_PASS | `.env` | placeholder |
| MINIO_ACCESS_KEY | `.env` | placeholder |
| REDIS_PASSWORD | `.env` | ✅ **تنظیم شد** (Sprint A2.5) |

### سطح دسترسی: 🟡 MEDIUM

| سِری | مکان فعلی | وضعیت |
|------|----------|--------|
| JWT Public Key | `infrastructure/docker/secrets/jwtRS256.key.pub` | commit شده (خطر کم) |
| ADMIN_PASSWORD | `.env.example` | placeholder value |
| RABBITMQ_DEFAULT_PASS | `.env` | placeholder |

---

## Current Approach — رویکرد فعلی (پس از Sprint A2.5)

```
┌─────────────────────────────────────────────────────────────┐
│               Current State (Sprint A2.5)                    │
├─────────────────────────────────────────────────────────────┤
│  ✅ Git history purged — 0 hardcoded credentials remain     │
│  ✅ JWT private key → Docker Secrets (production)           │
│  ✅ Redis password set (24-char random)                     │
│  ✅ Secrets rotation guide documented                       │
│  ✅ Dockerfiles hardened (non-root, tini, healthchecks)     │
│  🔶 No automated rotation (manual via runbook)              │
│  🔶 No audit logging for secret access                      │
│  🔶 No Vault integration yet                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Guide — راهنمای مهاجرت

### مرحله ۱: پاک‌سازی Git (انجام شد — Sprint A2.5)

✅ `git-filter-repo` اجرا شد — تمام credentials از تاریخچه (۴ commit) حذف شدند.

جایگزینی‌ها:
- `Admin@12345` → `ADMIN_PASSWORD_FROM_ENV`
- `minioadmin` → `MINIO_CREDENTIALS_FROM_ENV`
- `postgresql://xennic:xennic123@localhost:5432/xennic` → `DATABASE_URL_FROM_ENV`
- Groq API keys, Zarinpal merchant ID → placeholders

فایل‌های `.env` اکنون در `.gitignore` هستند و commit نمی‌شوند.

### مرحله ۲: Docker Secrets (انجام شد — Sprint A2.5 برای JWT)

✅ JWT keys از طریق Docker Secrets در production mount می‌شوند:

```yaml
# docker-compose.yml (production)
secrets:
  jwt_private_key:
    file: ../../secrets/jwtRS256.key
  jwt_public_key:
    file: ../../secrets/jwtRS256.key.pub

services:
  api:
    secrets:
      - jwt_private_key
      - jwt_public_key
    environment:
      JWT_PRIVATE_KEY_PATH: /run/secrets/jwt_private_key
      JWT_PUBLIC_KEY_PATH: /run/secrets/jwt_public_key
```

کد `jwt.service.ts` ابتدا مسیر `/run/secrets/...` را چک می‌کند، سپس به env var fallback می‌کند.

### مرحله ۳: HashiCorp Vault (Production)

```hcl
# vault-policy.hcl
path "secret/data/xennic/*" {
  capabilities = ["read", "list"]
}

path "secret/data/xennic/jwt/*" {
  capabilities = ["read"]
}

path "transit/keys/xennic-*" {
  capabilities = ["encrypt", "decrypt"]
}
```

```bash
# راه‌اندازی Vault
vault secrets enable -path=secret kv-v2

# ذخیره اسرار
vault kv put secret/xennic/database \
  POSTGRES_USER=xennic \
  POSTGRES_PASSWORD=$(openssl rand -base64 32)

vault kv put secret/xennic/jwt \
  JWT_PRIVATE_KEY=@jwtRS256.key \
  JWT_PUBLIC_KEY=@jwtRS256.key.pub

# PKI برای JWT signing (توصیه شده)
vault secrets enable pki
vault write pki/roles/xennic-jwt \
  allowed_domains=xennic.com \
  allow_subdomains=true \
  max_ttl=720h
```

### معماری نهایی

```mermaid
graph TB
    subgraph "Production"
        APP["NestJS API"] --> VAULT_AGENT["Vault Agent\nSidecar"]
        VAULT_AGENT --> VAULT["HashiCorp Vault\nCluster"]
        VAULT --> AUDIT["Audit Log\n(Vault Audit)"]
        VAULT --> ROTATION["Auto Rotation\n(Dynamic Secrets)"]
    end
    
    subgraph "Staging"
        STG["NestJS API"] --> DS["Docker Secrets\n(Mounted Files)"]
    end
    
    subgraph "Development"
        DEV["NestJS API"] --> ENV[".env Files\n(Local Only)"]
    end
```

---

## How to Add a New Secret — افزودن سِری جدید

### Dev (محلی)

```bash
# 1. افزودن به .env.local
echo "NEW_API_KEY=your_key_here" >> .env.local

# 2. افزودن به .env.example (بدون مقدار واقعی)
echo "NEW_API_KEY=change_me_in_production" >> .env.example

# 3. استفاده در کد
const apiKey = process.env.NEW_API_KEY;
```

### Production (Docker Secrets)

```bash
# 1. ایجاد فایل secret
echo -n "your_key_here" > infrastructure/docker/secrets/new_api_key.txt

# 2. افزودن به docker-compose
# secrets:
#   new_api_key:
#     file: ./secrets/new_api_key.txt

# 3. افزودن به سرویس
# services.api.secrets:
#   - new_api_key
# services.api.environment:
#   NEW_API_KEY_PATH: /run/secrets/new_api_key
```

### Production (Vault)

```bash
# 1. ذخیره در Vault
vault kv put secret/xennic/services/new_api_key=your_key_here

# 2. افزودن policy
vault policy write xennic-new-api-key - <<EOF
path "secret/data/xennic/services/new_api_key" {
  capabilities = ["read"]
}
EOF

# 3. راه‌اندازی Vault Agent برای auto-renew
```

---

## How to Rotate Secrets — چرخش اسرار

### Manual Rotation

```bash
# 1. تولید secret جدید
NEW_SECRET=$(openssl rand -base64 32)

# 2. به‌روزرسانی در Vault
vault kv put secret/xennic/database POSTGRES_PASSWORD=$NEW_SECRET

# 3. راه‌اندازی مجدد سرویس (در صورت نیاز)
docker-compose up -d api

# 4. حذف secret قبلی
vault kv metadata put -max-versions=3 secret/xennic/database
```

### Automatic Rotation Schedule

| سِری | دوره چرخش | روش |
|------|----------|------|
| JWT Private Key | ۹۰ روز | Vault PKI (auto) |
| Database Passwords | ۳۰ روز | Vault Dynamic Secrets (auto) |
| API Keys (LLM) | ۹۰ روز | Manual + Vault KV |
| Redis Password | ۹۰ روز | Manual |
| SMTP Password | ۱۸۰ روز | Manual |
| Session Secrets | هر release | CI/CD pipeline |

---

## Never Log Secrets — هرگز اسرار را لاگ نکنید

### قوانین

```typescript
// ✅ درست
logger.info(`Processing request for user ${userId}`);

// ❌ نادرست — لاگ کردن secret
logger.info(`API Key: ${process.env.GROQ_API_KEY}`);

// ❌ نادرست — لاگ کردن body کامل
logger.debug(`Request body: ${JSON.stringify(requestBody)}`);
```

### Redact Middleware

```typescript
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'key', 'authorization'];

app.register(require('@fastify/sensible'));
app.addHook('preSerialization', async (request, reply, payload) => {
  if (typeof payload === 'object') {
    redactSensitiveFields(payload, SENSITIVE_FIELDS);
  }
  return payload;
});
```

---

## Secret Detection — تشخیص اسرار

### git-secrets

```bash
# نصب
brew install git-secrets  # macOS
apt install git-secrets   # Linux

# تنظیم patterns
git secrets --add 'password\s*=\s*.+'
git secrets --add 'api[_-]?key\s*=\s*.+'
git secrets --add 'secret\s*=\s*.+'
git secrets --add '-----BEGIN PRIVATE KEY-----'

# اسکن کل تاریخچه
git secrets --scan-history
```

### trufflehog

```bash
# اسکن repository
trufflehog git file:///home/ahmad/xennic --results=verified

# اسکن Docker image
trufflehog docker --image xennic-api:latest
```

### GitHub Secret Scanning (Automatic)

GitHub به صورت خودکار repository را برای secrets شناخته شده اسکن می‌کند. الerts در `Settings → Code security → Secret scanning` قابل مشاهده است.

---

## Related Documents

| سند | مسیر |
|-----|------|
| Security Architecture | `security/Architecture.md` |
| Secrets Management (Overview) | `security/SECRETS_MANAGEMENT.md` |
| JWT | `security/JWT.md` |
| Data Encryption | `security/DATA_ENCRYPTION.md` |
| Production Hardening | `security/Production-Hardening.md` |
| Environment Variables | `.env.example` |
| Production Readiness Audit | `project/PRODUCTION_READINESS_AUDIT.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۲.۰.۰ | تیر ۱۴۰۵ | Sprint A2.5 — Git history purged, JWT→Docker Secrets, Redis password set |
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه — Secrets Inventory + Migration Guide |
