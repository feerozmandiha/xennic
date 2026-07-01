# پیکربندی دامنه — Domain Configuration

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

پیکربندی DNS و دامنه پلتفرم Xennic.

---

## Scope

DNS records, subdomains, email.

---

## DNS Records

| نوع | نام | مقدار | TTL |
|-----|-----|-------|-----|
| A | @ | 203.0.113.1 | 3600 |
| A | api | 203.0.113.1 | 3600 |
| A | ws | 203.0.113.1 | 3600 |
| A | assets | CDN CNAME | 3600 |
| CNAME | www | xennic.com | 3600 |
| MX | @ | mail.xennic.com | 3600 |
| TXT | @ | v=spf1 ... | 3600 |

---

## Subdomain Strategy

| ساب‌دامین | کاربرد | پروکسی |
|-----------|--------|--------|
| xennic.com | Web Application | Nginx |
| api.xennic.com | REST API | Nginx |
| ws.xennic.com | WebSocket | Nginx |
| assets.xennic.com | Static Assets | CDN |
| admin.xennic.com | Admin Panel | Nginx |
| status.xennic.com | Status Page | External |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Nginx | `deployment/NGINX.md` |
| HTTPS | `deployment/HTTPS.md` |
| Production Checklist | `deployment/PRODUCTION_CHECKLIST.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
