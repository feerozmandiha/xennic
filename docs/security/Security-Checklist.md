# Security Checklist — چک‌لیست امنیتی پیش از استقرار

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

چک‌لیست جامع امنیتی برای استقرار Production پلتفرم Xennic. هر آیتم باید پیش از استقرار تأیید شود.

**راهنما**: ✅ = تکمیل شده، ❌ = انجام نشده، 🔄 = در حال انجام

---

## 1. Infrastructure — زیرساخت

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 1.1 | Firewall rules (ورودی فقط ۸۰, ۴۴۳) | 🔄 | نیاز به پیکربندی iptables |
| 1.2 | DDoS protection (Cloudflare / AWS Shield) | ❌ | پیاده‌سازی نشده |
| 1.3 | WAF rules (ModSecurity / Cloudflare WAF) | ❌ | پیاده‌سازی نشده |
| 1.4 | Private network برای سرویس‌های داخلی | ✅ | `xennic-network` bridge |
| 1.5 | VPN برای دسترسی مدیریتی | ❌ | پیاده‌سازی نشده |
| 1.6 | Security groups با least privilege | 🔄 | نیاز به بازبینی |
| 1.7 | Network segmentation (DMZ, Private, Data) | 🔄 | جزئی در docker-compose |

---

## 2. Docker — داکر

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 2.1 | Non-root user در همه containers | ✅ | API, Web, Services |
| 2.2 | Read-only root filesystem | ❌ | پیاده‌سازی نشده |
| 2.3 | Resource limits (memory, CPU) | 🔄 | فقط vision-service محدودیت دارد |
| 2.4 | Image scanning (Trivy / Snyk) | ❌ | پیاده‌سازی نشده |
| 2.5 | .dockerignore برای همه سرویس‌ها | ✅ | ۵ فایل ایجاد شده |
| 2.6 | No privileged containers | ✅ | بررسی شده |
| 2.7 | Healthcheck برای همه containers | ✅ | API, Web, Services |
| 2.8 | Docker content trust (signing) | ❌ | پیاده‌سازی نشده |
| 2.9 | Secrets via Docker Secrets (not env) | 🔄 | JWT keys از secrets mount شده‌اند |
| 2.10 | No exposed ports on public interface | 🔄 | فقط Nginx پورت باز دارد |

---

## 3. Nginx — پروکسی معکوس

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 3.1 | TLS 1.2/1.3 فقط (بدون TLS 1.0/1.1) | ✅ | `ssl_protocols TLSv1.2 TLSv1.3` |
| 3.2 | Strong ciphersuite | ✅ | ECDHE + AES-GCM فقط |
| 3.3 | HSTS enabled (`max-age=31536000`) | ❌ | **نیاز به اضافه شدن** |
| 3.4 | HTTP → HTTPS redirect | ✅ | در `default.conf` |
| 3.5 | Security headers (X-Frame-Options, etc.) | ✅ | در `nginx.conf` |
| 3.6 | Rate limiting (API + Auth) | ✅ | `limit_req_zone` |
| 3.7 | `server_tokens off` | ✅ | عدم افشای نسخه Nginx |
| 3.8 | SSL stapling | ✅ | `ssl_stapling on` |
| 3.9 | Let's Encrypt auto-renewal | ❌ | **نیاز به پیکربندی** |
| 3.10 | Request size limit (100MB) | ✅ | `client_max_body_size 100M` |

---

## 4. JWT — توکن احراز هویت

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 4.1 | RS256 algorithm (asymmetric) | ✅ | فعال |
| 4.2 | Private key NOT in Git | ❌ | **🔴 بحرانی** — در `infrastructure/docker/secrets/` |
| 4.3 | Private key via Docker Secrets | 🔄 | mount شده ولی در Git |
| 4.4 | Private key → Vault (goal) | ❌ | برنامه برای Sprint A3 |
| 4.5 | Access token TTL ≤ ۱۵ min | ✅ | ۹۰۰ ثانیه |
| 4.6 | Refresh token TTL ≤ ۳۰ روز | ✅ | ۲۵۹۲۰۰۰ ثانیه |
| 4.7 | Refresh token rotation | ✅ | Revoke old + create new |
| 4.8 | Reuse detection | ✅ | Revoke all tokens on reuse |
| 4.9 | jti blacklist (immediate revocation) | ❌ | پیاده‌سازی نشده |
| 4.10 | JWKS endpoint | ❌ | پیاده‌سازی نشده |
| 4.11 | Key rotation (kid support) | ❌ | پیاده‌سازی نشده |
| 4.12 | Clock skew tolerance (۳۰s) | ✅ | فعال |

---

## 5. Database — دیتابیس

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 5.1 | PostgreSQL password in Vault | ❌ | در `.env` commit شده |
| 5.2 | SSL/TLS for DB connections | ❌ | پیکربندی نشده |
| 5.3 | Connection pooling (PgBouncer) | ❌ | پیاده‌سازی نشده |
| 5.4 | `prisma migrate deploy` (نه db push) | ❌ | `pnpm db:apply` از `db push` استفاده می‌کند |
| 5.5 | Automatic backups (WAL archiving) | ❌ | **Backup خالی است** |
| 5.6 | Backup encryption (AES-256) | ❌ | پیاده‌سازی نشده |
| 5.7 | Least privilege DB users | ❌ | فقط یک کاربر `xennic` |
| 5.8 | Audit logging (pgaudit) | ❌ | پیاده‌سازی نشده |
| 5.9 | Connection limit per user | ❌ | پیکربندی نشده |
| 5.10 | Regular VACUUM schedule | ❌ | پیکربندی نشده |

---

## 6. Redis — کش

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 6.1 | Redis password configured | 🔄 | در production docker-compose فعال است |
| 6.2 | Redis NOT exposed to internet | ✅ | فقط internal network |
| 6.3 | `rename-command FLUSHALL` | ❌ | پیکربندی نشده |
| 6.4 | `rename-command FLUSHDB` | ❌ | پیکربندی نشده |
| 6.5 | `rename-command CONFIG` | ❌ | پیکربندی نشده |
| 6.6 | `rename-command EVAL` (اگر Lua استفاده نمی‌شود) | ❌ | پیکربندی نشده |

---

## 7. Backups — پشتیبان‌گیری

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 7.1 | Automatic daily backups | ❌ | **هیچ اسکریپتی وجود ندارد** |
| 7.2 | Backup encryption (AES-256) | ❌ | پیاده‌سازی نشده |
| 7.3 | Offsite backup storage | ❌ | پیاده‌سازی نشده |
| 7.4 | Restore testing (حداقل ماهانه) | ❌ | هیچ تست بازیابی انجام نشده |
| 7.5 | RPO target ≤ ۱ ساعت | ❌ | فقط در docs |
| 7.6 | RTO target ≤ ۱۵ دقیقه | ❌ | فقط در docs |
| 7.7 | WAL archiving | ❌ | پیاده‌سازی نشده |

---

## 8. Monitoring — مانیتورینگ

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 8.1 | Prometheus metrics | ❌ | پیاده‌سازی نشده |
| 8.2 | Grafana dashboards | ❌ | پیاده‌سازی نشده |
| 8.3 | Loki log aggregation | ❌ | پیاده‌سازی نشده |
| 8.4 | Uptime monitoring | ❌ | پیاده‌سازی نشده |
| 8.5 | Alerting (Slack/Email/PagerDuty) | ❌ | پیاده‌سازی نشده |
| 8.6 | Security event monitoring | ❌ | پیاده‌سازی نشده |
| 8.7 | Audit log review process | ❌ | پیاده‌سازی نشده |
| 8.8 | Rate limiting dashboard | ❌ | پیاده‌سازی نشده |

---

## 9. Secrets — اسرار

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 9.1 | No secrets in Git (past commits) | ❌ | **🔴 بحرانی** — نیاز به `git filter-branch` |
| 9.2 | No secrets in environment variables | 🔄 | JWT keys از secrets mount شده |
| 9.3 | `.env` files in `.gitignore` | ✅ | اضافه شده |
| 9.4 | Secret rotation (حداقل ۹۰ روز) | ❌ | پیاده‌سازی نشده |
| 9.5 | Vault / Secrets Manager | ❌ | برنامه برای Sprint A3 |
| 9.6 | `git-secrets` / `trufflehog` pre-commit hooks | ❌ | پیاده‌سازی نشده |
| 9.7 | Secret scanning در CI | ❌ | پیاده‌سازی نشده |

---

## 10. SSL/TLS — امنیت لایه انتقال

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 10.1 | Valid SSL certificate (Let's Encrypt) | ❌ | **نیاز به پیکربندی** |
| 10.2 | Auto-renewal (certbot) | ❌ | پیاده‌سازی نشده |
| 10.3 | TLS 1.3 priority (fallback 1.2) | ✅ | در nginx.conf |
| 10.4 | Strong ciphers (AEAD only) | ✅ | ECDHE + AES-GCM |
| 10.5 | HSTS preload | ❌ | پیاده‌سازی نشده |
| 10.6 | OCSP stapling | ✅ | فعال |
| 10.7 | No weak DH parameters | ✅ | پیش‌فرض OpenSSL |

---

## 11. Firewall — فایروال

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 11.1 | UFW / iptables rules | ❌ | پیکربندی نشده |
| 11.2 | Only ports 80, 443 open | ❌ | در محیط فعلی همه پورت‌ها باز |
| 11.3 | Fail2ban برای SSH | ❌ | پیکربندی نشده |
| 11.4 | Rate limiting در سطح firewall | ❌ | پیکربندی نشده |

---

## 12. Logging — ثبت رویداد

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 12.1 | Structured JSON logging | ✅ | Fastify logger + Nginx JSON |
| 12.2 | Centralized log aggregation | ❌ | Loki پیاده‌سازی نشده |
| 12.3 | Audit log (login, logout, actions) | ✅ | Console log + DB audit |
| 12.4 | No sensitive data in logs | 🔄 | نیاز به redact middleware |
| 12.5 | Log retention policy | ❌ | پیکربندی نشده |
| 12.6 | Error tracking (Sentry) | ❌ | پیاده‌سازی نشده |
| 12.7 | Security events alerting | ❌ | پیاده‌سازی نشده |

---

## 13. CI/CD — یکپارچگی و استقرار مداوم

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 13.1 | SAST (Static Analysis) در CI | ❌ | پیاده‌سازی نشده |
| 13.2 | DAST (Dynamic Analysis) در CI | ❌ | پیاده‌سازی نشده |
| 13.3 | Dependency scanning در CI | ❌ | پیاده‌سازی نشده |
| 13.4 | Container image scanning | ❌ | پیاده‌سازی نشده |
| 13.5 | Secret scanning در CI | ❌ | پیاده‌سازی نشده |
| 13.6 | No credentials در CI variables | ✅ | GitHub Secrets استفاده می‌شود |
| 13.7 | Signed commits (GPG) | ❌ | پیاده‌سازی نشده |
| 13.8 | SBOM generation | ❌ | پیاده‌سازی نشده |

---

## 14. Deployment — استقرار

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 14.1 | Production docker-compose | ✅ | `infrastructure/docker/compose/production/` |
| 14.2 | Nginx configured | ✅ | `infrastructure/nginx/` |
| 14.3 | Helm (security headers) configured | ✅ | `@fastify/helmet` |
| 14.4 | CORS restricted | ✅ | Whitelist از env |
| 14.5 | Swagger disabled in production | ✅ | `isProduction` check |
| 14.6 | ValidationPipe (whitelist + forbidNonWhitelisted) | ✅ | فعال |
| 14.7 | Rate limiting configured | ✅ | NestJS + Nginx |
| 14.8 | Graceful shutdown | ✅ | SIGTERM/SIGINT handlers |

---

## 15. Rollback — بازگشت به نسخه قبل

| # | آیتم | وضعیت | توضیحات |
|---|------|-------|---------|
| 15.1 | Database migration rollback plan | ❌ | مستند نشده |
| 15.2 | Docker image versioning (tags) | 🔄 | `latest` + commit SHA |
| 15.3 | Automated rollback in CI/CD | ❌ | پیاده‌سازی نشده |
| 15.4 | Backup before deployment | ❌ | پیاده‌سازی نشده |
| 15.5 | Canary / blue-green deployment | ❌ | پیاده‌سازی نشده |

---

## Score Summary — خلاصه امتیاز

| بخش | مجموع | ✅ Done | 🔄 In Progress | ❌ Not Done | امتیاز |
|-----|-------|--------|----------------|------------|--------|
| Infrastructure | ۷ | ۱ | ۲ | ۴ | ۱۴٪ |
| Docker | ۱۰ | ۵ | ۲ | ۳ | ۵۰٪ |
| Nginx | ۱۰ | ۸ | ۰ | ۲ | ۸۰٪ |
| JWT | ۱۲ | ۷ | ۱ | ۴ | ۵۸٪ |
| Database | ۱۰ | ۰ | ۰ | ۱۰ | ۰٪ |
| Redis | ۶ | ۱ | ۱ | ۴ | ۱۷٪ |
| Backups | ۷ | ۰ | ۰ | ۷ | ۰٪ |
| Monitoring | ۸ | ۰ | ۰ | ۸ | ۰٪ |
| Secrets | ۷ | ۱ | ۱ | ۵ | ۱۴٪ |
| SSL/TLS | ۷ | ۴ | ۰ | ۳ | ۵۷٪ |
| Firewall | ۴ | ۰ | ۰ | ۴ | ۰٪ |
| Logging | ۷ | ۲ | ۱ | ۴ | ۲۹٪ |
| CI/CD | ۸ | ۱ | ۰ | ۷ | ۱۳٪ |
| Deployment | ۸ | ۸ | ۰ | ۰ | ۱۰۰٪ |
| Rollback | ۵ | ۰ | ۱ | ۴ | ۰٪ |
| **Total** | **۱۱۳** | **۳۸** | **۹** | **۶۶** | **۳۴٪** |

> **وضعیت کلی**: ❌ **NOT READY FOR PRODUCTION** — امتیاز ۳۴٪ (حداقل مطلوب: ۸۵٪)

---

## Related Documents

| سند | مسیر |
|-----|------|
| Security Architecture | `security/Architecture.md` |
| Production Hardening | `security/Production-Hardening.md` |
| Production Readiness | `project/PRODUCTION_READINESS_AUDIT.md` |
| Risk Register | `project/RISK_REGISTER.md` |
| Technical Debt | `project/TECHNICAL_DEBT.md` |
| Deployment Spec | `specifications/DEPLOYMENT_SPEC.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه — ۱۵ بخش، ۱۱۳ آیتم |
