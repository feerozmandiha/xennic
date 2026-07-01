# Nginx

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

پیکربندی Nginx برای پلتفرم Xennic.

---

## Scope

Server blocks, SSL, performance tuning.

---

## Configuration

```nginx
# /etc/nginx/sites-available/xennic
upstream api {
    server localhost:3000;
    keepalive 64;
}

upstream web {
    server localhost:3001;
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name xennic.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/xennic.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xennic.com/privkey.pem;
    ssl_protocols TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Web
    location / {
        proxy_pass http://web;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS
        add_header Access-Control-Allow-Origin *;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Rate limiting
    limit_req zone=api burst=100 nodelay;
    limit_req zone=auth burst=5 nodelay;
}
```

## Performance Tuning

```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 4096;
sendfile on;
tcp_nopush on;
keepalive_timeout 65;
client_max_body_size 50M;

# Gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Reverse Proxy | `deployment/REVERSE_PROXY.md` |
| HTTPS | `deployment/HTTPS.md` |
| Production Checklist | `deployment/PRODUCTION_CHECKLIST.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
