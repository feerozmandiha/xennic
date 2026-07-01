# دروازه انتشار نسخه Alpha — Alpha Release Gate

**نسخه**: ۱.۰.۰ | **وضعیت**: پیش‌نویس | **آخرین بروزرسانی**: خرداد ۱۴۰۵
**Sprint**: A2.5 — Critical Security Closure

> هیچ نسخه‌ای بدون عبور از تمام دروازه‌های (Gates) زیر منتشر نخواهد شد.
> این سند معیارهای الزامی برای انتشار Alpha پلتفرم Xennic را تعریف می‌کند.

---

## ۱. هدف — Purpose

هدف از این سند، تعریف **دروازه‌های انتشار (Release Gates)** برای نسخه Alpha است. هر دروازه مجموعه‌ای از معیارهای الزامی را مشخص می‌کند که باید پیش از انتشار تأیید شوند. انتشار تنها زمانی مجاز است که **تمام دروازه‌ها به وضعیت 🟢 GREEN** برسند.

این فرآیند تضمین می‌کند:
- امنیت سامانه در سطح قابل قبولی است
- زیرساخت برای بار真实 (real traffic) آماده است
- داده‌ها محافظت شده و قابل بازیابی هستند
- تیم عملیاتی قابلیت مشاهده و عیب‌یابی دارد
- فرآیند استقرار و بازگشت مستند و خودکار است
- مستندات لازم برای نگهداری و توسعه وجود دارد

---

## ۲. دسته‌بندی دروازه‌ها — Gate Categories

### ۲.۱. دروازه امنیت — Security Gate

**مسئول**: Security Lead | **وابستگی**: Security Checklist (ALPHA_SECURITY_CHECKLIST.md)

- [ ] **SEC-01**: هیچ credential واقعی (P0/P1) در مخزن Git وجود ندارد — git filter-branch اجرا شده
- [ ] **SEC-02**: کلید خصوصی JWT از مخزن حذف و به Docker Secrets/Vault منتقل شده است
- [ ] **SEC-03**: اعتبارسنجی متغیرهای محیطی (env validation) در startup فعال است و در صورت نقص fail-fast می‌کند
- [ ] **SEC-04**: @fastify/helmet فعال است و ۱۴ هدر امنیتی (شامل CSP, HSTS, X-Frame-Options) در Production سرو می‌شود
- [ ] **SEC-05**: CORS فقط به domainهای مجاز محدود شده است (whitelist-based)
- [ ] **SEC-06**: Rate limiting در سطح Nginx و API برای endpoints حساس (auth, AI) پیکربندی شده است
- [ ] **SEC-07**: Swagger UI در Production غیرفعال است
- [ ] **SEC-08**: Docker Secrets به جای env file برای credentials حساس استفاده می‌شود
- [ ] **SEC-09**: Non-root user در تمام Dockerfileها استفاده می‌شود
- [ ] **SEC-10**: Dependency audit (pnpm audit / pip audit) انجام شده و هیچ CVE بحرانی باز نیست

### ۲.۲. دروازه زیرساخت — Infrastructure Gate

**مسئول**: DevOps Lead | **وابستگی**: Production docker-compose + Nginx

- [ ] **INF-01**: Docker build برای همه سرویس‌ها (API, Web, Engineering, AI, Vision) موفق است
- [ ] **INF-02**: Docker images با تگ semantic (نه latest) ساخته و به registry推送 شده‌اند
- [ ] **INF-03**: Nginx به عنوان reverse proxy پیکربندی و تست شده است
- [ ] **INF-04**: گواهی SSL معتبر (Let's Encrypt) نصب و تمدید خودکار پیکربندی شده است
- [ ] **INF-05**: فقط TLS 1.2/1.3 فعال است (SSLv3, TLS 1.0, 1.1 غیرفعال)
- [ ] **INF-06**: Health checks برای تمام سرویس‌ها در docker-compose تعریف و کار می‌کنند
- [ ] **INF-07**: restart policy (unless-stopped) برای همه سرویس‌ها تنظیم شده است
- [ ] **INF-08**: فقط پورت‌های ۸۰ و ۴۴۳ از اینترنت باز هستند (سایر پورت‌ها در شبکه داخلی)
- [ ] **INF-09**: fail2ban یا معادل برای SSH و HTTP brute force پیکربندی شده است
- [ ] **INF-10**: Resource limits (memory/cpu) برای همه containerها تنظیم شده است

### ۲.۳. دروازه داده — Data Gate

**مسئول**: Backend Lead | **وابستگی**: Prisma + Redis + MinIO

- [ ] **DAT-01**: Prisma migrations (`migrate deploy`) بدون خطا روی دیتابیس خالی اجرا می‌شوند
- [ ] **DAT-02**: دستور `db:apply` از `prisma migrate deploy` استفاده می‌کند (نه `db push`)
- [ ] **DAT-03**: Redis با رمز عبور (`REQUIREPASS`) پیکربندی شده است
- [ ] **DAT-04**: MinIO در docker-compose تعریف شده و از طریق API قابل دسترسی است
- [ ] **DAT-05**: Connection pooling (PgBouncer) برای PostgreSQL پیکربندی شده است
- [ ] **DAT-06**: استراتژی پشتیبان‌گیری مستند شده و اسکریپت backup خودکار پیاده‌سازی شده است
- [ ] **DAT-07**: WAL archiving برای point-in-time recovery فعال است
- [ ] **DAT-08**: SSL/TLS برای اتصال به PostgreSQL فعال است
- [ ] **DAT-09**: Backupهای روزانه خودکار در ۰۳:۰۰ UTC برنامه‌ریزی شده‌اند
- [ ] **DAT-10**: تست بازیابی (restore test) با موفقیت انجام شده است

### ۲.۴. دروازه مشاهده‌پذیری — Observability Gate

**مسئول**: DevOps Lead | **وابستگی**: All services

- [ ] **OBS-01**: همه سرویس‌ها endpoint `/health` (یا `/api/v1/health`) دارند که status واقعی سرویس را برمی‌گرداند
- [ ] **OBS-02**: health check جزئی‌تر شامل وضعیت DB و Redis است (نه فقط 'ok')
- [ ] **OBS-03**: لاگینگ ساختاریافته (JSON format) با level, timestamp, trace_id در همه سرویس‌ها فعال است
- [ ] **OBS-04**: خطاگیری (error tracking) — Sentry یا معادل آن پیکربندی شده است
- [ ] **OBS-05**: Prometheus metrics endpoint برای همه سرویس‌ها فعال است
- [ ] **OBS-06**: آلرت‌های P0/P1 برای down service, error rate بالا, latency غیرعادی پیکربندی شده‌اند
- [ ] **OBS-07**: لاگ‌ها در یک مرکز جمع‌آوری (Loki/Elasticsearch) ذخیره می‌شوند
- [ ] **OBS-08**: هیچ secret یا credential در لاگ‌ها ظاهر نمی‌شود (فیلتر خودکار)

### ۲.۵. دروازه CI/CD — CI/CD Gate

**مسئول**: DevOps Lead | **وابستگی**: GitHub Actions

- [ ] **CICD-01**: CI pipeline روی branch `main` سبز است (همه مراحل موفق)
- [ ] **CICD-02**: Docker images در CI ساخته می‌شوند و به registry推送 می‌شوند
- [ ] **CICD-03**: هیچ lint error وجود ندارد (turbo run lint موفق)
- [ ] **CICD-04**: هیچ type error وجود ندارد (turbo run typecheck موفق)
- [ ] **CICD-05**: تست‌ها (unit + e2e) با موفقیت عبور می‌کنند (turbo run test موفق)
- [ ] **CICD-06**: اسکن امنیتی image (Trivy/Snyk) در CI فعال است
- [ ] **CICD-07**: SAST scanning (Semgrep/CodeQL) در CI فعال است
- [ ] **CICD-08**: Smoke tests خودکار پس از deploy اجرا می‌شوند و موفق هستند
- [ ] **CICD-09**: GitHub Secrets برای credentials حساس در CI استفاده می‌شود (نه hardcoded)

### ۲.۶. دروازه مستندات — Documentation Gate

**مسئول**: Tech Lead | **وابستگی**: docs/ directory

- [ ] **DOC-01**: Runbook استقرار (Deployment Runbook) موجود و به‌روز است
- [ ] **DOC-02**: Runbook بازگشت (Rollback Runbook) موجود و به‌روز است
- [ ] **DOC-03**: Runbook بازیابی در بحران (Disaster Recovery Runbook) موجود است
- [ ] **DOC-04**: Runbook واکنش به حادثه (Incident Response Runbook) موجود است
- [ ] **DOC-05**: معماری سیستم (System Architecture) مستند شده است
- [ ] **DOC-06**: فرآیند چرخش secrets (Secrets Rotation) مستند شده است
- [ ] **DOC-07**: چک‌لیست امنیتی Alpha کامل و به‌روز است
- [ ] **DOC-08**: Production readiness audit به‌روز است

---

## ۳. جدول وضعیت دروازه‌ها — Gate Status Table

| Gate | Status | Criteria Met | Total Criteria | Owner | Blockers |
|------|--------|-------------|----------------|-------|----------|
| **Security Gate** | 🔴 RED | — | ۱۰ | Security Lead | — |
| **Infrastructure Gate** | 🟡 YELLOW | — | ۱۰ | DevOps Lead | — |
| **Data Gate** | 🔴 RED | — | ۱۰ | Backend Lead | — |
| **Observability Gate** | 🔴 RED | — | ۸ | DevOps Lead | — |
| **CI/CD Gate** | 🟡 YELLOW | — | ۹ | DevOps Lead | — |
| **Documentation Gate** | 🟡 YELLOW | — | ۸ | Tech Lead | — |
| **Overall** | 🔴 RED | — | ۵۵ | — | — |

**راهنما**:
- 🟢 **GREEN** = همه معیارها PASS شده‌اند
- 🟡 **YELLOW** = برخی معیارها PASS شده‌اند، برخی در حال انجام
- 🔴 **RED** = معیارهای بحرانی PASS نشده‌اند (مسدودکننده)

> **شرط انتشار**: تمام دروازه‌ها باید **GREEN** باشند.

---

## ۴. امضا — Sign-Off

| نقش | نام | تاریخ | امضا |
|-----|-----|-------|------|
| **DevOps Lead** | ___________ | ___________ | ___________ |
| **Security Lead** | ___________ | ___________ | ___________ |
| **Tech Lead** | ___________ | ___________ | ___________ |
| **Product Owner** | ___________ | ___________ | ___________ |

> انتشار Alpha تنها با امضای هر سه نقش اصلی (DevOps Lead, Security Lead, Tech Lead) مجاز است.

---

## ۵. override اضطراری — Emergency Override

در شرایط استثنایی، ممکن است نیاز به عبور از یک یا چند دروازه وجود داشته باشد. این مکانیزم برای مواقع بحرانی تعریف شده است و **نمی‌تواند به‌عنوان روش معمول استفاده شود**.

### شرایط مجاز برای override:

1. **بلاکر امنیتی P0/P1 رفع شده** و تنها یک معیار غیربحرانی (non-critical) از دروازه باقی مانده است
2. **تأیید صریح کتبی** از هر سه نقش امنیتی (Security Lead + DevOps Lead + Tech Lead)
3. **مستندسازی دلیل** در این سند با ارجاع به issue/ticket مربوطه
4. **ضرب‌الاجل حداکثر ۷۲ ساعت** برای رفع آیتم‌های override شده

### فرم override:

```
درخواست‌کننده: ___________  تاریخ: ___________
دروازه: ___________  معیار(ها): ___________
دلیل: ___________
مدت زمان مجاز: ۷۲ ساعت (از تاریخ امضا)

امضاها:
Security Lead: ___________  تاریخ: ___________
DevOps Lead:  ___________  تاریخ: ___________
Tech Lead:    ___________  تاریخ: ___________
```

### موارد override فعال:

| # | دروازه | معیار | دلیل | تاریخ شروع | مهلت | وضعیت |
|---|--------|-------|------|-----------|------|--------|
| — | — | — | — | — | — | — |

---

## ۶. چک‌لیست پس از انتشار — Post-Release Checklist

پس از انتشار Alpha، موارد زیر باید ظرف **۴۸ ساعت** تأیید شوند:

- [ ] **POST-01**: همه سرویس‌ها در Production پاسخگوی health check هستند
- [ ] **POST-02**: لاگ‌ها به مرکز جمع‌آوری (Loki) می‌رسند
- [ ] **POST-03**: آلرت‌ها فعال و تست شده‌اند (یک تست inject failure انجام شود)
- [ ] **POST-04**: اولین backup خودکار با موفقیت اجرا شده است
- [ ] **POST-05**: SSL Labs امتیاز ≥ A را تأیید کرده است
- [ ] **POST-06**: endpointهای عمومی (auth, API) با rate limiting تست شده‌اند
- [ ] **POST-07**: فرآیند احراز هویت (ثبت‌نام، ورود، refresh token) end-to-end تست شده است
- [ ] **POST-08**: حافظه و CPU مصرفی همه سرویس‌ها در محدوده قابل قبول است
- [ ] **POST-09**: هیچ error 5xx غیرمنتظره‌ای در لاگ‌ها وجود ندارد
- [ ] **POST-10**: فرآیند rollback مستند شده و تیم عملیاتی آموزش دیده است

---

## ۷. تاریخچه نسخه‌ها — Version History

| نسخه | تاریخ | تغییرات | نویسنده |
|------|-------|---------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه — Sprint A2.5 Critical Security Closure | — |

---

## مستندات مرتبط

| سند | مسیر |
|-----|------|
| Alpha Security Checklist | `docs/releases/ALPHA_SECURITY_CHECKLIST.md` |
| Production Readiness Audit | `docs/project/PRODUCTION_READINESS_AUDIT.md` |
| Deployment Runbook | `docs/runbooks/DEPLOYMENT_RUNBOOK.md` |
| Rollback Runbook | `docs/runbooks/ROLLBACK_RUNBOOK.md` |
| Disaster Recovery Runbook | `docs/runbooks/DISASTER_RECOVERY_RUNBOOK.md` |
| Incident Response Runbook | `docs/runbooks/INCIDENT_RESPONSE_RUNBOOK.md` |
| Secrets Rotation Runbook | `docs/runbooks/SECRETS_ROTATION_RUNBOOK.md` |
