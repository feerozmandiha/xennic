# Production Hardening — سخت‌افزاری امنیتی Production

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

خلاصه فعالیت‌های سخت‌افزاری امنیتی (Hardening) انجام شده در Sprint A2، مقایسه قبل/بعد، فهرست کامل تغییرات، و ریسک‌ها و توصیه‌های باقیمانده.

---

## Scope

Sprint A2 hardening activities — مجموعه اقدامات امنیتی برای بهبود آمادگی Production.

---

## Before/After Comparison — مقایسه قبل و بعد

### Security Score: ۳۵/۱۰۰ → ۴۰/۱۰۰ (+۵)

| حوزه | قبل (Sprint A1) | بعد (Sprint A2) | تغییر |
|------|----------------|----------------|-------|
| Security Headers (Helmet) | ❌ نصب و پیکربندی نشده | ✅ `@fastify/helmet` فعال | +۱۵ |
| Secrets in Git | 🔴 ۷+ credential واقعی | 🔴 همچنان ۷ عدد (بدون تغییر) | ۰ |
| JWT Private Key in Repo | 🔴 در `infrastructure/docker/secrets/` | 🔴 تغییر نکرده | ۰ |
| Redis Password | 🔴 خالی | 🔴 در env ولی production docker-compose تنظیم شده | +۵ |
| CORS | ⚠️ basic | ✅ whitelist + credentials:true | +۵ |
| Rate Limiting | ✅ basic | ✅ NestJS + Nginx | ۰ |
| Non-Root User | ❌ همه containerها root | ✅ همه containerها non-root | +۱۰ |
| Docker Secrets | ❌ استفاده نشده | 🔄 JWT keys از secrets | +۵ |
| Validation | ✅ whitelist | ✅ + forbidNonWhitelisted + forbidUnknownValues | ۰ |
| Swagger in Production | ❌ فعال | ✅ غیرفعال در production | +۵ |

---

## Complete List of Changes — فهرست کامل تغییرات

### 1. Security Headers — @fastify/helmet

**فایل**: `apps/api/src/main.ts:44-70`

- [x] نصب `@fastify/helmet`
- [x] Content-Security-Policy (فقط production)
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy: camera=(), microphone=(), geolocation=()
- [x] Cross-Origin-Resource-Policy: same-origin
- [x] Cross-Origin-Opener-Policy: same-origin
- [x] Cross-Origin-Embedder-Policy: require-corp
- [x] X-XSS-Protection: 0 (CSP handles this)
- [x] X-Permitted-Cross-Domain-Policies: none
- [x] hidePoweredBy: true
- [x] noSniff: true
- [x] ieNoOpen: true
- [x] dnsPrefetchControl: false
- [x] originAgentCluster: true

### 2. CORS Hardening

**فایل**: `apps/api/src/main.ts:111-128`

- [x] Whitelist-based origin کنترل (از `CORS_ORIGINS` env)
- [x] روش‌های HTTP محدود: GET, POST, PUT, PATCH, DELETE, OPTIONS
- [x] Allowed headers محدود: ۶ هدر مشخص
- [x] `credentials: true` برای احراز هویت
- [x] `maxAge: 86400` برای کش preflight

### 3. Rate Limiting

**فایل**: `apps/api/src/api.module.ts:55-71`, `apps/api/src/common/guards/`

- [x] ThrottlerModule با ۳ سطح: short (10/10s), medium (100/60s), long (1000/1h)
- [x] AuthThrottlerGuard: 5/60s login, 3/60s register, 3/300s forgot-password
- [x] XennicThrottlerGuard با ردیابی IP + User ID
- [x] Nginx rate limiting: 100r/s API, 10r/s Auth

### 4. Non-Root Users

- [x] `apps/api/Dockerfile`: `adduser -S appuser -G appgroup` + `USER appuser`
- [x] `apps/web/Dockerfile`: Non-root user
- [x] `workspace/services/engineering-service/Dockerfile`: Non-root user
- [x] `workspace/services/vision-service/Dockerfile`: Non-root user
- [x] `workspace/services/ai-service/Dockerfile`: Non-root user

### 5. Docker Security

- [x] `.dockerignore` برای همه ۵ سرویس
- [x] Healthcheck برای همه containers
- [x] Production docker-compose (`infrastructure/docker/compose/production/`)
- [x] JWT keys via Docker Secrets (mount شده)
- [x] Redis password در production compose
- [x] Network isolation (`xennic-network` bridge)

### 6. Graceful Shutdown

**فایل**: `apps/api/src/main.ts:29-41`

- [x] `app.enableShutdownHooks()`
- [x] SIGTERM handler
- [x] SIGINT handler

### 7. Swagger Disabled in Production

**فایل**: `apps/api/src/main.ts:131-133`

- [x] `if (isProduction)` → Swagger UI غیرفعال

### 8. Nginx Hardening

**فایل**: `infrastructure/nginx/nginx.conf`

- [x] `server_tokens off`
- [x] Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [x] TLS 1.2/1.3 فقط
- [x] Strong ciphers (ECDHE + AES-GCM)
- [x] SSL stapling
- [x] Rate limiting zones
- [x] JSON structured logging
- [x] HTTP → HTTPS redirect

**فایل**: `infrastructure/nginx/conf.d/default.conf`

- [x] Auth endpoint rate limiting (10r/s, burst 5)
- [x] API proxy with upstream keepalive
- [x] WebSocket support
- [x] Static asset caching
- [x] Health endpoint

### 9. Environment Validation

**فایل**: `apps/api/src/config/env-validation.ts`

- [x] Zod schema validation برای همه env vars
- [x] Startup fail در صورت env نامعتبر
- [x] DATABASE_URL validation (باید postgresql:// باشد)
- [x] PORT validation (0-65535)

### 10. Global Exception Filter

**فایل**: `apps/api/src/shared/filters/all-exceptions.filter.ts`

- [x] Unified error format: `{ success: false, error: { code, message } }`
- [x] Prisma error handling (P2002, P2003, P2025)
- [x] Validation error formatting
- [x] Production mode: hide internal error details

---

## Remaining Risks — ریسک‌های باقیمانده

### 🔴 Critical Risks (نیاز به اقدام فوری)

| # | ریسک | CVE/Issue | راهکار | اولویت |
|---|------|-----------|--------|--------|
| R-1 | **Secrets در Git** (۷+ فایل) | Credential leak | `git filter-branch` + rotation | P0 |
| R-2 | **JWT private key در مخزن** | توکن قابل جعل | انتقال به Vault | P0 |
| R-3 | **Redis بدون رمز در env** | دسترسی غیرمجاز به کش | تنظیم `REDIS_PASSWORD` قوی | P1 |
| R-4 | **بدون backup خودکار** | از دست رفتن داده | پیاده‌سازی pg_dump cron + WAL | P1 |
| R-5 | **بدون monitoring** | ناتوانی در تشخیص حمله | Prometheus + Grafana + Loki | P1 |

### 🟠 High Risks

| # | ریسک | راهکار | اولویت |
|---|------|--------|--------|
| R-6 | jspdf vulnerabilities (CRITICAL, CVSS 8.6) | مهاجرت به jspdf v4 | P1 |
| R-7 | No HSTS header | اضافه کردن به nginx.conf | P1 |
| R-8 | No jti blacklist | پیاده‌سازی با Redis | P1 |
| R-9 | `prisma db push` (data loss risk) | تغییر به `prisma migrate deploy` | P1 |
| R-10 | No DB connection pooling | PgBouncer setup | P1 |
| R-11 | No SSL certificate configured | Let's Encrypt + certbot | P1 |

### 🟡 Medium Risks

| # | ریسک | راهکار | اولویت |
|---|------|--------|--------|
| R-12 | No key rotation (JWT) | PKI + kid support | P2 |
| R-13 | No JWKS endpoint | `.well-known/jwks.json` | P2 |
| R-14 | No CSRF protection | @fastify/csrf-protection | P2 |
| R-15 | Resource limits فقط برای vision | اضافه کردن برای همه سرویس‌ها | P2 |
| R-16 | Volume size limits | تعریف در docker-compose | P2 |
| R-17 | Port contradiction (Redis 6379 vs 6380) | یکسان‌سازی | P2 |
| R-18 | AI endpoints بدون rate limiting خاص | اضافه کردن ThrottlerGuard | P2 |

### 🟢 Low Risks

| # | ریسک | راهکار | اولویت |
|---|------|--------|--------|
| R-19 | No audit log review process | فرآیند بازبینی ماهانه | P3 |
| R-20 | No security training برای تیم | برنامه آموزشی | P3 |
| R-21 | No penetration test | برنامه‌ریزی برای Q3 | P3 |
| R-22 | No SBOM | تولید با `pnpm sbom` | P3 |

---

## Recommendations — توصیه‌ها

### Immediate (۷۲ ساعت)

```bash
# 1. پاک‌سازی Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch \
    .env apps/api/.env engineering-service/.env \
    infrastructure/docker/.env \
    infrastructure/docker/secrets/jwtRS256.key" \
  --prune-empty --tag-name-filter cat -- --all

# 2. چرخش تمام credentials
# 3. تنظیم REDIS_PASSWORD قوی
# 4. فعال‌سازی backup
```

### Short-term (Sprint A3 — ۲ هفته)

| # | اقدام | خروجی |
|---|-------|-------|
| 1 | انتقال JWT keys به Vault | Vault PKI + agent |
| 2 | پیاده‌سازی jti blacklist | Redis-backed revocation |
| 3 | مهاجرت jspdf v2 → v4 | رفع ۲ CVE critical |
| 4 | HSTS + SSL certificate | Let's Encrypt + nginx |
| 5 | `prisma migrate deploy` جایگزین `db push` | migration ایمن |

### Medium-term (Sprint A4 — ۱ ماه)

| # | اقدام | خروجی |
|---|-------|-------|
| 1 | Prometheus + Grafana + Loki | monitoring کامل |
| 2 | PgBouncer | connection pooling |
| 3 | Automated backups + WAL archiving | backup خودکار |
| 4 | CSRF protection | @fastify/csrf-protection |
| 5 | Key rotation + JWKS | JWT production-ready |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Security Architecture | `security/Architecture.md` |
| Security Model | `security/SECURITY_MODEL.md` |
| JWT | `security/JWT.md` |
| Headers | `security/Headers.md` |
| Secrets | `security/Secrets.md` |
| Dependency Audit | `security/Dependency-Audit.md` |
| Security Checklist | `security/Security-Checklist.md` |
| Access Control | `security/ACCESS_CONTROL.md` |
| Data Encryption | `security/DATA_ENCRYPTION.md` |
| Rate Limiting | `security/RATE_LIMITING.md` |
| Production Readiness | `project/PRODUCTION_READINESS_AUDIT.md` |
| Risk Register | `project/RISK_REGISTER.md` |
| Technical Debt | `project/TECHNICAL_DEBT.md` |
| Runbooks | `runbooks/` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه — Sprint A2 hardening summary + before/after + remaining risks |
