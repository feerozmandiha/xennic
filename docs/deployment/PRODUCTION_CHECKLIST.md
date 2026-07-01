# چک‌لیست تولید — Production Checklist

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

چک‌لیست پیش از استقرار Production پلتفرم Xennic.

---

## Scope

Pre-deployment verification, security, performance.

---

## Pre-deployment Checklist

### Infrastructure
- [ ] سرور مطابق `SERVER_SETUP.md` پیکربندی شده
- [ ] Docker Compose سرویس‌ها را بالا آورده
- [ ] Nginx پیکربانی و SSL معتبر است
- [ ] DNS records تنظیم شده‌اند
- [ ] فایروال فقط پورت‌های لازم را باز کرده
- [ ] Monitoring و alerting فعال است
- [ ] Backup به درستی کار می‌کند

### Security
- [ ] تمام متغیرهای محیطی در Vault / Secrets Manager
- [ ] JWT با کلید 2048-bit RSA امضا شده
- [ ] Rate limiting فعال است
- [ ] CORS به domain خاص محدود شده
- [ ] Helmet / security headers فعال

### Performance
- [ ] Load testing با k6 انجام شده
- [ ] Database connection pooling پیکربندی شده
- [ ] Redis caching فعال
- [ ] CDN برای assets استاتیک
- [ ] GZIP compression فعال

### Monitoring
- [ ] Health endpoints پاسخ می‌دهند (`/api/v1/health`)
- [ ] Grafana dashboards آماده
- [ ] Alerts پیکربندی شده
- [ ] Log aggregation فعال

---

## Post-deployment

- [ ] Smoke tests passed
- [ ] SSL Labs test: A+
- [ ] Lighthouse score > 90
- [ ] All services healthy

---

## Related Documents

| سند | مسیر |
|-----|------|
| Server Setup | `deployment/SERVER_SETUP.md` |
| Production Spec | `deployment/XENNIC_INFRASTRUCTURE_SPEC_v1.md` |
| CI/CD | `devops/CI_CD.md` |
| Monitoring | `devops/MONITORING.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
