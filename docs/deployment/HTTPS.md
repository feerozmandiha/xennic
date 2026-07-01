# HTTPS — SSL/TLS

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای HTTPS و SSL/TLS برای پلتفرم Xennic.

---

## Scope

Certificate management, Let's Encrypt, TLS configuration.

---

## Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d xennic.com -d api.xennic.com

# Auto-renewal (default 2x/day)
sudo systemctl status certbot.timer
```

---

## TLS Configuration

| پارامتر | مقدار | توضیح |
|---------|-------|-------|
| Protocol | TLS 1.3 | Latest secure protocol |
| Cipher Suite | ECDHE+AES-GCM | Strong encryption |
| HSTS | max-age=31536000 | Strict transport |
| OCSP Stapling | Enabled | Certificate status |

## Certificate Management

```bash
# Manual renewal test
sudo certbot renew --dry-run

# Check expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/xennic.com/fullchain.pem

# SSL Labs test
curl https://www.ssllabs.com/ssltest/analyze.html?d=xennic.com
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Nginx | `deployment/NGINX.md` |
| Domain Configuration | `deployment/DOMAIN_CONFIGURATION.md` |
| Reverse Proxy | `deployment/REVERSE_PROXY.md` |
| Data Encryption | `security/DATA_ENCRYPTION.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
