# Deployment Runbook — راهنمای استقرار

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال | **آخرین به‌روزرسانی**: ۲۰۲۶-۰۶-۲۳

**لینک‌های مرتبط**: [Rollback](Rollback.md) · [Disaster Recovery](Disaster-Recovery.md) · [Incident Response](Incident-Response.md) · [Server Rebuild](Server-Rebuild.md) · [Secrets Rotation](Secrets-Rotation.md) · [Infrastructure Spec](/home/ahmad/xennic-docs/docs/deployment/XENNIC_INFRASTRUCTURE_SPEC_v1.md) · [Security Model](/home/ahmad/xennic-docs/docs/security/SECURITY_MODEL.md)

---

## پیش‌نیازها

| نیازمندی | نسخه | توضیح |
|----------|------|--------|
| Docker | ۲۴+ | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Git | ۲+ | `git --version` |
| OpenSSL | ۱.۱+ | برای تولید JWT key pair |
| certbot | اختیاری | برای SSL خودکار (Let's Encrypt) |

### متغیرهای محیطی الزامی

قبل از استقرار، فایل `.env` را از قالب زیر پر کنید:

```bash
cp infrastructure/docker/compose/production/.env.production.template .env
```

متغیرهای اجباری (بدون مقدار پیش‌فرض):

| متغیر | منبع | توضیح |
|-------|------|-------|
| `POSTGRES_PASSWORD` | تولید کنید | حداقل ۲۴ کاراکتر |
| `REDIS_PASSWORD` | تولید کنید | حداقل ۲۴ کاراکتر |
| `RABBITMQ_DEFAULT_PASS` | تولید کنید | حداقل ۲۴ کاراکتر |
| `GROQ_API_KEY` | Groq Console | برای AI Service |
| `OPENAI_API_KEY` | OpenAI Console | برای AI/Vision Service |
| `ANTHROPIC_API_KEY` | Anthropic Console | برای AI Service |
| `GOOGLE_API_KEY` | Google AI Studio | برای AI Service |
| `JWT_ACCESS_TOKEN_TTL` | مقدار پیش‌فرض ۹۰۰ | ثانیه (۱۵ دقیقه) |
| `JWT_REFRESH_TOKEN_TTL` | مقدار پیش‌فرض ۲۵۹۲۰۰۰ | ثانیه (۳۰ روز) |

### گواهی SSL

مسیر گواهی‌ها در Nginx: `/etc/nginx/ssl/`

```bash
# تولید Self-Signed (فقط توسعه):
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/secrets/selfsigned.key \
  -out infrastructure/secrets/selfsigned.crt \
  -subj "/CN=xennic.local"

# Let's Encrypt (production):
sudo certbot certonly --standalone -d api.xennic.com -d app.xennic.com
# سپس کپی به مسیر nginx/ssl
```

---

## فرآیند استقرار گام‌به‌گام

### گام ۱: دریافت کد

```bash
git clone git@github.com:anomalyco/xennic.git
cd xennic
git checkout main
git pull origin main
```

### گام ۲: تنظیم متغیرهای محیطی

```bash
cp infrastructure/docker/compose/production/.env.production.template .env
# ویرایش فایل .env با مقادیر واقعی
vim .env
```

تولید JWT key pair:

```bash
mkdir -p infrastructure/secrets
ssh-keygen -t rsa -b 4096 -m PEM -f infrastructure/secrets/jwtRS256.key -N ""
openssl rsa -in infrastructure/secrets/jwtRS256.key -pubout -outform PEM \
  -out infrastructure/secrets/jwtRS256.key.pub
chmod 600 infrastructure/secrets/jwtRS256.key
```

### گام ۳: آماده‌سازی قبل از استقرار (Rollback Preparation)

> **⚠️ بحرانی**: قبل از هر استقرار، حتماً از دیتابیس بکاپ بگیرید. به [Rollback Runbook](Rollback.md) مراجعه کنید.

```bash
# بکاپ دیتابیس
docker exec xennic-postgres pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  --format=custom -f /tmp/pre_deploy_backup_$(date +%Y%m%d_%H%M%S).dump
docker cp xennic-postgres:/tmp/pre_deploy_backup_*.dump ./backups/

# ثبت نسخه فعلی
git log --oneline -1 > ./backups/current_version_$(date +%Y%m%d).txt
docker images --format "{{.Repository}}:{{.Tag}}" | grep xennic > ./backups/current_images_$(date +%Y%m%d).txt
```

### گام ۴: اجرای Docker Compose Production

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml pull
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d
```

پایش لاگ‌ها:

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml logs -f --tail=100
```

### گام ۵: اجرای Migration‌ها

```bash
# اجرای Prisma migrations
docker exec xennic-api npx prisma migrate deploy
# یا از طریق script پروژه:
docker exec xennic-api npx prisma migrate deploy
```

> **نکته**: migrationها به صورت خودکار در health check اجرا نمی‌شوند. در صورت شکست migration، دستورالعمل [Rollback Runbook](Rollback.md#بازیابی-دیتابیس) را دنبال کنید.

### گام ۶: بررسی Health Endpoint‌ها

| سرویس | endpoint | وضعیت مطلوب |
|-------|----------|-------------|
| Nginx | `http://localhost/nginx-health` | `healthy` |
| API | `http://localhost/api/v1/health` | `{"success":true}` |
| Web | `http://localhost:3001/` | HTTP 200 |
| Engineering | `http://localhost:8001/health` | HTTP 200 |
| AI | `http://localhost:8002/health` | HTTP 200 |
| Vision | `http://localhost:8003/health` | HTTP 200 |
| PostgreSQL | `pg_isready` | `accepting connections` |
| Redis | `redis-cli ping` | `PONG` |
| RabbitMQ | `rabbitmq-diagnostics ping` | `pong` |

اسکریپت بررسی یکپارچه:

```bash
for svc in \
  "Nginx|http://localhost/nginx-health" \
  "API|http://localhost/api/v1/health" \
  "Engineering|http://localhost:8001/health" \
  "AI|http://localhost:8002/health" \
  "Vision|http://localhost:8003/health"; do
  name="${svc%%|*}"
  url="${svc##*|}"
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  echo "$name: $([ "$code" = "200" ] && echo "✅ OK" || echo "❌ FAIL ($code)")"
done
```

### گام ۷: پیکربندی Nginx + SSL

پس از اطمینان از صحت سرویس‌ها، Nginx را برای SSL پیکربندی کنید:

```bash
# کپی گواهی‌ها
sudo cp /etc/letsencrypt/live/api.xennic.com/fullchain.pem \
  infrastructure/nginx/ssl/fullchain.pem
sudo cp /etc/letsencrypt/live/api.xennic.com/privkey.pem \
  infrastructure/nginx/ssl/privkey.pem

# ری‌استارت Nginx
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart nginx
```

تأیید SSL:

```bash
curl -vI https://api.xennic.com/api/v1/health 2>&1 | grep "SSL certificate"
```

### گام ۸: فعال‌سازی CI/CD (GitHub Actions)

فایل workflow در `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /home/xennic/app
            git pull origin main
            docker compose -f infrastructure/docker/compose/production/docker-compose.yml pull
            docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d
            docker exec xennic-api npx prisma migrate deploy
```

> **نکته امنیتی**: secrets پروژه را در GitHub Secrets تنظیم کنید: `HOST`, `USERNAME`, `SSH_KEY`.

---

## چک‌لیست پس از استقرار

- [ ] همه health endpoints پاسخ ۲۰۰ می‌دهند
- [ ] صفحه اصلی (web) بدون خطا بار می‌شود
- [ ] لاگین با کاربر ادمین کار می‌کند
- [ ] Swagger UI در `/api/docs` در دسترس است
- [ ] SSL certificate در مرورگر معتبر است
- [ ] Redis cache warm شده (ابتدا چند درخواست بزنید)
- [ ] RabbitMQ queues سالم هستند (UI در پورت ۱۵۶۷۲)
- [ ] Backup خودکار تنظیم شده است (cron job)
- [ ] monitoring dashboard داده‌ها را نشان می‌دهد

---

## Troubleshooting سریع

| مشکل | دستور بررسی | اقدام |
|------|-------------|-------|
| Container exited | `docker ps -a --filter status=exited` | `docker logs <container>` |
| Port conflict | `ss -tlnp \| grep <port>` | سرویس مزاحم را متوقف کنید |
| Database connection | `docker logs xennic-postgres --tail 20` | اطمینان از `POSTGRES_PASSWORD` |
| Disk full | `df -h` | `docker system prune -af` (احتیاط) |
| OOM kill | `dmesg \| grep -i oom` | افزایش memory limit در compose |

---

> **بعد از استقرار**: اگر نیاز به بازگشت دارید، بلافاصله به [Rollback Runbook](Rollback.md) مراجعه کنید.
