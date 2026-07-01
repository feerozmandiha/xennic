# چک‌لیست امنیتی نسخه Alpha — Alpha Security Checklist

**نسخه**: ۱.۰.۰ | **وضعیت**: پیش‌نویس | **آخرین بروزرسانی**: خرداد ۱۴۰۵

> این چک‌لیست معیارهای امنیتی الزامی برای انتشار نسخه Alpha پلتفرم Xennic را مشخص می‌کند.
> تمام آیتم‌ها باید پیش از انتشار Alpha تعیین تکلیف شوند.

---

## ستون‌های وضعیت

| نشان | معنی |
|------|------|
| ✅ | تکمیل / تأیید شده |
| ❌ | انجام نشده / مسدودکننده |
| 🔄 | در حال انجام |
| N/A | قابل اعمال نیست |

---

## ۱. زیرساخت — Infrastructure

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۱.۱ | قوانین فایروال | 🔄 | تمام پورت‌های غیرضروری بسته شده‌اند | `infrastructure/INFRASTRUCTURE.md` |
| ۱.۲ | پورت‌های در معرض | 🔄 | تنها پورت‌های ۸۰ و ۴۴۳ از اینترنت باز هستند | `deployment/SERVER_SETUP.md` |
| ۱.۳ | ایزولاسیون شبکه | 🔄 | containerها در شبکه‌های مجزا با دسترسی محدود | `deployment/DOCKER_COMPOSE.md` |
| ۱.۴ | جداسازی Production/Dev | 🔄 | محیط‌های production و توسعه کاملاً جدا شده‌اند | `infrastructure/INFRASTRUCTURE.md` |
| ۱.۵ | لیست سفید IP برای مدیریت | 🔄 | دسترسی SSH و مدیریت تنها از IPهای مجاز | `deployment/SERVER_SETUP.md` |
| ۱.۶ | زمان‌بندی (NTP) | 🔄 | NTP هماهنگ روی همه سرورها برای audit trail دقیق | `infrastructure/INFRASTRUCTURE.md` |

## ۲. داکر — Docker

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۲.۱ | کاربر غیر root در کانتینر | ❌ | Dockerfileها باید USER non-root داشته باشند | `deployment/DOCKER.md` |
| ۲.۲ | HEALTHCHECK در Dockerfile | ❌ | همه سرویس‌ها باید HEALTHCHECK داشته باشند | `deployment/DOCKER.md` |
| ۲.۳ | .dockerignore | 🔄 | فایل‌های غیرضروری (node_modules, .git, .env) از build حذف شوند | `deployment/DOCKER.md` |
| ۲.۴ | تگ خاص image (بدون latest) | ❌ | استفاده از تگ‌های semantic (مثلاً ۱.۲.۳) به جای latest | `deployment/DOCKER.md` |
| ۲.۵ | multi-stage build | 🔄 | کاهش حجم image با multi-stage builds | `deployment/DOCKER.md` |
| ۲.۶ | image scanning در registry | ❌ | اسکن vulnerability برای همه images در ghcr.io | `devops/CI_CD.md` |
| ۲.۷ | read-only root filesystem | 🔄 | کانتینرها با --read-only اجرا شوند مگر نیاز به write | `deployment/DOCKER.md` |

## ۳. انجین‌اکس — Nginx

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۳.۱ | خاتمه SSL در Nginx | ❌ | پایان‌دهی TLS در Nginx، نه در application | `deployment/NGINX.md` |
| ۳.۲ | Rate limiting | ❌ | limit_req روی endpoints حساس (auth, API) فعال باشد | `deployment/NGINX.md` |
| ۳.۳ | Security headers | ❌ | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | `deployment/NGINX.md` |
| ۳.۴ | HSTS header | ❌ | Strict-Transport-Security با max-age حداقل ۱ سال | `deployment/NGINX.md` |
| ۳.۵ | server_tokens off | ❌ | مخفی‌سازی نسخه Nginx در پاسخ‌ها | `deployment/NGINX.md` |
| ۳.۶ | محدودیت سایز بدنه | 🔄 | client_max_body_size متناسب با نیاز سرویس | `deployment/NGINX.md` |
| ۳.۷ | Content-Security-Policy | 🔄 | CSP header برای جلوگیری از XSS | `deployment/NGINX.md` |

## ۴. JWT

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۴.۱ | الگوریتم RS256 | ❌ | امضای نامتقارن با RSA 2048-bit، نه HMAC | `security/JWT.md` |
| ۴.۲ | TTL access token (۱۵ دقیقه) | 🔄 | access token با انقضای ۱۵ دقیقه | `security/JWT.md` |
| ۴.۳ | چرخش refresh token | ❌ | refresh token در هر استفاده مجدد چرخانده شود | `security/JWT.md` |
| ۴.۴ | ادعای jti (Token ID) | ❌ | شناسه یکتای token برای revoke و replay detection | `security/JWT.md` |
| ۴.۵ | تحمل ساعت (clock tolerance) | ❌ | clock skew تا ۳۰ ثانیه مجاز، بیش‌تر رد شود | `security/JWT.md` |
| ۴.۶ | قابلیت چرخش کلید | ❌ | پشتیبانی از key rotation با JWKS و overlap period | `security/JWT.md` |
| ۴.۷ | ذخیره امن کلید خصوصی | ❌ | کلید خصوصی در Vault/Secrets Manager، نه در کد | `security/SECRETS_MANAGEMENT.md` |

## ۵. دیتابیس — Database

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۵.۱ | Connection pooling | 🔄 | PgBouncer یا pool داخلی Prisma برای مدیریت اتصال‌ها | `database/DATABASE_ARCHITECTURE.md` |
| ۵.۲ | استفاده از migrate deploy | ❌ | در production از prisma migrate deploy استفاده شود، نه db push | `database/MIGRATIONS.md` |
| ۵.۳ | پشتیبان‌گیری خودکار | ❌ | pg_dump خودکار روزانه + WAL archiving | `database/BACKUP_STRATEGY.md` |
| ۵.۴ | رمزنگاری در حالت سکون | 🔄 | encryption at rest در سطح دیسک یا DB | `security/DATA_ENCRYPTION.md` |
| ۵.۵ | WAL archiving | ❌ | آرشیو پیوسته WAL برای point-in-time recovery | `database/BACKUP_STRATEGY.md` |
| ۵.۶ | کمبود حداقل کاربران DB | 🔄 | کاربر اختصاصی برای هر سرویس با دسترسی محدود | `database/DATABASE_DESIGN.md` |
| ۵.۷ | SSL/TLS برای اتصال DB | ❌ | اتصال رمزنگاری‌شده به PostgreSQL | `security/DATA_ENCRYPTION.md` |

## ۶. ردیس — Redis

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۶.۱ | احراز هویت با رمز عبور | ❌ | REQUIRE_PASS فعال باشد | `deployment/DOCKER_COMPOSE.md` |
| ۶.۲ | آمادگی برای TLS | 🔄 | پیکربندی TLS برای اتصالات Redis | `deployment/DOCKER_COMPOSE.md` |
| ۶.۳ | Connection retry | 🔄 | مکانیزم تلاش مجدد در application برای اتصال به Redis | — |
| ۶.۴ | Health check | ❌ | health check برای سرویس Redis در docker-compose | `deployment/DOCKER_COMPOSE.md` |
| ۶.۵ | Timeout اتصال | 🔄 | timeout مناسب برای کلاینت‌های Redis | — |
| ۶.۶ | حذف دستورات خطرناک | 🔄 | غیرفعال‌سازی FLUSHALL, CONFIG, EVAL در production | — |

## ۷. پشتیبان‌گیری — Backups

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۷.۱ | پشتیبان‌گیری خودکار روزانه | ❌ | pg_dump خودکار در ۰۳:۰۰ UTC هر روز | `devops/BACKUP_PLAN.md` |
| ۷.۲ | WAL archiving پیوسته | ❌ | آرشیو WAL برای PITR | `database/BACKUP_STRATEGY.md` |
| ۷.۳ | تست پشتیبان (سه‌ماهه) | ❌ | restore کامل هر ۳ ماه یکبار با تأیید integrity | `devops/BACKUP_PLAN.md` |
| ۷.۴ | ذخیره‌سازی خارج از سایت | ❌ | کپی backupها در S3/MinIO در منطقه متفاوت | `devops/BACKUP_PLAN.md` |
| ۷.۵ | رمزنگاری backupها | ❌ | backupهای خروجی با AES-256 رمزنگاری شوند | `devops/BACKUP_PLAN.md` |
| ۷.۶ | retention policy | 🔄 | retention: روزانه ۳۰ روز، هفتگی ۹۰ روز، ماهانه ۱ سال | `devops/BACKUP_PLAN.md` |
| ۷.۷ | مانیتورینگ پشتیبان | ❌ | آلرت برای failure در فرآیند backup | `devops/MONITORING.md` |

## ۸. مانیتورینگ — Monitoring

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۸.۱ | متریک‌های Prometheus | 🔄 | اکسپورت متریک‌های HTTP, DB, Redis, queue برای همه سرویس‌ها | `devops/MONITORING.md` |
| ۸.۲ | لاگینگ ساختاریافته (JSON) | 🔄 | همه سرویس‌ها خروجی JSON لاگ با سطح, timestamp, trace_id | `devops/LOGGING_INFRASTRUCTURE.md` |
| ۸.۳ | Health endpoint همه سرویس‌ها | ❌ | /health یا /api/v1/health برای همه سرویس‌ها | `devops/MONITORING.md` |
| ۸.۴ | Alerting rules | ❌ | آلرت‌های P0/P1 برای down, error rate, latency بالا | `devops/MONITORING.md` |
| ۸.۵ | Grafana dashboard | 🔄 | داشبوردهای System Health, API Performance, Business Metrics | `devops/MONITORING.md` |
| ۸.۶ | tracing توزیع‌شده | 🔄 | Tempo یا OpenTelemetry برای درخواست‌های跨سرویس | `devops/MONITORING.md` |
| ۸.۷ | آستانه‌های هشدار (thresholds) | 🔄 | threshold پیکربندی‌شده: CPU>80%, Memory>85%, Error>1% | `devops/MONITORING.md` |

## ۹. اسرار — Secrets

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۹.۱ | عدم وجود credentials در git | ❌ | هیچ secret, password, API key در repository نباشد | `security/SECRETS_MANAGEMENT.md` |
| ۹.۲ | .env.example placeholder | 🔄 | فایل‌های .env.example فقط placeholder داشته باشند | `deployment/ENVIRONMENT_VARIABLES.md` |
| ۹.۳ | استفاده از Docker Secrets/Vault | ❌ | secrets در runtime از Docker Secrets یا Vault تأمین شوند | `security/SECRETS_MANAGEMENT.md` |
| ۹.۴ | عدم لاگ شدن secrets | ❌ | secrets هرگز در logها ظاهر نشوند (ممنوعیت console.log(password)) | `security/SECRETS_MANAGEMENT.md` |
| ۹.۵ | چرخش دوره‌ای secrets | 🔄 | چرخش ۹۰ روزه برای همه secrets | `security/SECRETS_MANAGEMENT.md` |
| ۹.۶ | حداقل دسترسی (least privilege) | 🔄 | هر سرویس فقط به secrets موردنیاز خود دسترسی دارد | `security/SECRETS_MANAGEMENT.md` |
| ۹.۷ | git-secrets / pre-commit hook | ❌ | pre-commit hook برای جلوگیری از commit secrets | `security/SECRETS_MANAGEMENT.md` |

## ۱۰. SSL/TLS

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۱۰.۱ | گواهی معتبر (Let's Encrypt) | ❌ | صدور گواهی با certbot و اعتبارسنجی openssl | `deployment/HTTPS.md` |
| ۱۰.۲ | فقط TLS 1.2/1.3 | ❌ | SSLv3, TLS 1.0, 1.1 غیرفعال | `deployment/HTTPS.md` |
| ۱۰.۳ | رمزنگاری قوی (Strong Ciphers) | ❌ | only ECDHE+AES-GCM, حذف !aNULL, !MD5, !RC4 | `deployment/NGINX.md` |
| ۱۰.۴ | تمدید خودکار گواهی | ❌ | systemd timer certbot برای تمدید خودکار | `deployment/HTTPS.md` |
| ۱۰.۵ | OCSP Stapling | 🔄 | فعال‌سازی OCSP stapling در Nginx | `deployment/HTTPS.md` |
| ۱۰.۶ | امتیاز SSL Labs ≥ A | ❌ | تست با ssllabs.com و امتیاز حداقل A | `deployment/HTTPS.md` |
| ۱۰.۷ | HSTS preload | 🔄 | ثبت domain در لیست HSTS preload مرورگرها | `deployment/HTTPS.md` |

## ۱۱. فایروال — Firewall

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۱۱.۱ | فقط پورت‌های مجاز (۸۰, ۴۴۳ از اینترنت) | ❌ | ufw/iptables: فقط ۸۰ و ۴۴۳ از بیرون، بقیه داخلی | `deployment/SERVER_SETUP.md` |
| ۱۱.۲ | پورت‌های داخلی (۳۰۰۰-۸۰۰۳) | 🔄 | پورت‌های سرویس‌ها (API, Web, Engineering, AI) فقط در شبکه داخلی | `deployment/DOCKER_COMPOSE.md` |
| ۱۱.۳ | fail2ban یا معادل | ❌ | fail2ban برای SSH و HTTP brute force | `deployment/SERVER_SETUP.md` |
| ۱۱.۴ | Rate limiting لایه شبکه | 🔄 | محدودیت نرخ در سطح فایروال برای IPهای مشکوک | `infrastructure/INFRASTRUCTURE.md` |
| ۱۱.۵ | لاگ فایروال | 🔄 | فعال‌سازی logging برای reject شده‌ها | `infrastructure/INFRASTRUCTURE.md` |
| ۱۱.۶ | پورت‌های مدیریتی بسته | ❌ | SSH تنها از IPهای مشخص یا VPN | `deployment/SERVER_SETUP.md` |

## ۱۲. لاگینگ — Logging

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۱۲.۱ | لاگینگ متمرکز (Loki) | 🔄 | جمع‌آوری همه لاگ‌ها در Grafana Loki | `devops/LOGGING_INFRASTRUCTURE.md` |
| ۱۲.۲ | سیاست نگهداری لاگ | 🔄 | ERROR: ۹۰ روز, WARN: ۳۰ روز, INFO: ۱۴ روز, DEBUG: ۳ روز | `devops/LOGGING_INFRASTRUCTURE.md` |
| ۱۲.۳ | لاگ حسابرسی (audit log) برای رویدادهای احراز هویت | ❌ | ثبت لاگ جداگانه برای login, logout, failed attempts, token refresh | `security/SECURITY_MODEL.md` |
| ۱۲.۴ | عدم وجود secrets در لاگ‌ها | ❌ | فیلتر خودکار secrets و passwords از خروجی لاگ | `devops/LOGGING_INFRASTRUCTURE.md` |
| ۱۲.۵ | trace correlation | 🔄 | trace_id مشترک در همه لاگ‌های یک درخواست | `devops/LOGGING_INFRASTRUCTURE.md` |
| ۱۲.۶ | structured logging (JSON) | 🔄 | تمام سرویس‌ها خروجی JSON برای query و پارس آسان | `devops/LOGGING_INFRASTRUCTURE.md` |

## ۱۳. CI/CD

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۱۳.۱ | secrets در GitHub Secrets | ❌ | credentials در GitHub Actions Environment Secrets، نه در فایل yaml | `devops/GITHUB_ACTIONS.md` |
| ۱۳.۲ | اسکن image امنیتی | ❌ | اسکن vulnerability با Trivy یا Snyk در CI | `devops/CI_CD.md` |
| ۱۳.۳ | بررسی وابستگی‌ها (dependency audit) | ❌ | pnpm audit / npm audit در pipeline CI | `devops/CI_CD.md` |
| ۱۳.۴ | SAST scanning | ❌ | تحلیل استاتیک امنیتی (Semgrep, CodeQL) در CI | `devops/CI_CD.md` |
| ۱۳.۵ | lint و typecheck پیش از build | 🔄 | اجرای lint و typecheck در pipeline | `devops/CI_CD.md` |
| ۱۳.۶ | اسکن Dockerfile | ❌ | linting Dockerfile با hadolint | `devops/CI_CD.md` |
| ۱۳.۷ | gated deployment | 🔄 | تأیید دستی برای انتشار به production | `devops/CI_CD.md` |

## ۱۴. استقرار — Deployment

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۱۴.۱ | طرح بازگشت (rollback plan) | ❌ | مستندات rollback procedure برای هر سناریو | `deployment/PRODUCTION_CHECKLIST.md` |
| ۱۴.۲ | قابلیت استقرار بدون وقفه (zero-downtime) | 🔄 | rolling update یا blue/green deployment | `devops/CI_CD.md` |
| ۱۴.۳ | health gates بین مراحل | ❌ | checks health قبل از ارسال ترافیک به نسخه جدید | `devops/CI_CD.md` |
| ۱۴.۴ | canary testing برای تغییرات بحرانی | 🔄 | انتشار تدریجی به درصد کمی از کاربران | `devops/CI_CD.md` |
| ۱۴.۵ | pre-deploy backup | ❌ | پشتیبان‌گیری خودکار قبل از هر deploy | `database/BACKUP_STRATEGY.md` |
| ۱۴.۶ | smoke tests خودکار پس از deploy | ❌ | تست‌های سریع برای تأیید سرویس‌های اصلی بعد از deploy | `devops/CI_CD.md` |

## ۱۵. بازگشت — Rollback

| # | آیتم | وضعیت | توضیحات | ارجاع |
|---|------|-------|---------|-------|
| ۱۵.۱ | rollback دیتابیس | ❌ | procedure بازگشت migration دیتابیس (down migration) | `database/MIGRATIONS.md` |
| ۱۵.۲ | pinning نسخه image | ❌ | استفاده از تگ مشخص (مثلاً ghcr.io/xennic/api:۱.۲.۳) برای rollback دقیق | `devops/CI_CD.md` |
| ۱۵.۳ | بازگشت خودکار در صورت failure health check | ❌ | اگر health check نسخه جدید failed، خودکار به نسخه قبل برگردد | `devops/CI_CD.md` |
| ۱۵.۴ | مستندات rollback | ❌ | راهنمای گام‌به‌گام rollback برای هر سرویس | `deployment/PRODUCTION_CHECKLIST.md` |
| ۱۵.۵ | تست دوره‌ای rollback | ❌ | تمرین rollback در محیط staging هر ماه | `devops/CI_CD.md` |
| ۱۵.۶ | feature flags برای revert سریع | 🔄 | possibility غیرفعال‌سازی سریع feature بدون deploy | — |

---

## ارزیابی کلی آمادگی — Overall Readiness Assessment

| معیار | مقدار |
|-------|-------|
| **آمادگی کلی** | ████░░░░░░ **۴۰٪** |
| آیتم‌های تکمیل شده (✅) | ۰ |
| آیتم‌های در حال انجام (🔄) | ۳۴ |
| آیتم‌های انجام نشده (❌) | ۳۲ |
| قابل اعمال نیست (N/A) | ۰ |
| **آیتم‌های بحرانی مسدودکننده** | ۲۴ |
| **آیتم‌های توصیه‌شده** | ۸ |

---

## آیتم‌های مسدودکننده (باید پیش از Alpha رفع شوند)

این آیتم‌ها حداقل‌های امنیتی هستند و بدون آنها انتشار Alpha مجاز نیست:

1. **۲.۱** — کاربر غیر root در کانتینرها
2. **۳.۱** — SSL termination در Nginx با گواهی معتبر
3. **۳.۳** — Security headers (Helmet)
4. **۳.۴** — HSTS header
5. **۴.۱** — الگوریتم RS256 برای JWT
6. **۴.۶** — قابلیت چرخش کلید JWT
7. **۵.۲** — استفاده از migrate deploy (نه db push)
8. **۵.۳** — پشتیبان‌گیری خودکار دیتابیس
9. **۵.۵** — WAL archiving
10. **۶.۱** — احراز هویت Redis
11. **۷.۱** — پشتیبان‌گیری خودکار روزانه
12. **۸.۳** — Health endpoint همه سرویس‌ها
13. **۸.۴** — Alerting rules
14. **۹.۱** — عدم وجود credentials در git
15. **۹.۳** — استفاده از Docker Secrets/Vault
16. **۹.۴** — عدم لاگ شدن secrets
17. **۱۰.۱** — گواهی معتبر Let's Encrypt
18. **۱۰.۲** — فقط TLS 1.2/1.3
19. **۱۱.۱** — فقط پورت‌های مجاز باز
20. **۱۱.۳** — fail2ban
21. **۱۳.۱** — secrets در GitHub Secrets
22. **۱۳.۴** — SAST scanning
23. **۱۴.۱** — طرح rollback
24. **۱۵.۱** — rollback دیتابیس

## آیتم‌های توصیه‌شده (بهتر است پیش از Alpha رفع شوند)

این آیتم‌ها الزامی نیستند اما ریسک امنیتی را کاهش می‌دهند:

1. **۲.۶** — اسکن vulnerability image
2. **۴.۲** — TTL access token ۱۵ دقیقه (currently ۱ hour)
3. **۵.۶** — کاربر اختصاصی DB برای هر سرویس
4. **۱۰.۷** — HSTS preload
5. **۱۲.۳** — Audit log برای رویدادهای احراز هویت
6. **۱۳.۲** — اسکن image امنیتی در CI
7. **۱۴.۴** — Canary testing
8. **۱۵.۵** — تست دوره‌ای rollback

---

## امضا — Sign-Off

| نقش | نام | تاریخ | امضا |
|-----|-----|-------|------|
| Security Lead | ___________ | ___________ | ___________ |
| DevOps Lead | ___________ | ___________ | ___________ |
| Tech Lead | ___________ | ___________ | ___________ |
| Product Owner | ___________ | ___________ | ___________ |

---

## تاریخچه نسخه‌ها

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
