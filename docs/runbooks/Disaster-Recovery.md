# Disaster Recovery Runbook — راهنمای بازیابی پس از فاجعه

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال | **آخرین به‌روزرسانی**: ۲۰۲۶-۰۶-۲۳

**اهداف**: RTO ≤ ۱۵ دقیقه · RPO ≤ ۱ ساعت

**لینک‌های مرتبط**: [Deployment](Deployment.md) · [Rollback](Rollback.md) · [Incident Response](Incident-Response.md) · [Server Rebuild](Server-Rebuild.md) · [Secrets Rotation](Secrets-Rotation.md) · [Backup Plan](/home/ahmad/xennic-docs/docs/devops/BACKUP_PLAN.md) · [Infrastructure Spec](/home/ahmad/xennic-docs/docs/deployment/XENNIC_INFRASTRUCTURE_SPEC_v1.md)

---

## ماتریس سناریوها

| سناریو | RTO هدف | RPO هدف | شدت | صفحه مرجع |
|--------|---------|---------|-----|-----------|
| **خرابی کامل سرور** | ۱۵ دقیقه | ۱ ساعت | SEV1 | [Server Rebuild](Server-Rebuild.md) |
| **خرابی دیتابیس** | ۱۰ دقیقه | ۱ ساعت | SEV1 | [Rollback](Rollback.md#بازیابی-دیتابیس) |
| **افشای اسرار** | ۵ دقیقه | N/A | SEV1 | [Secrets Rotation](Secrets-Rotation.md) |
| **خرابی یک سرویس** | ۱۵ دقیقه | N/A | SEV2 | [Rollback](Rollback.md) |
| **فاجعه منطقه‌ای (Region Down)** | ۶۰ دقیقه | ۱۵ دقیقه | SEV1 | زیرساخت DR |

---

## سناریوی ۱: خرابی کامل سرور (Complete Server Failure)

**علائم**: SSH doesn't connect, all services down, monitoring silent

### گام ۱: تشخیص

```bash
# از یک سرور دیگر بررسی کنید
ping <SERVER_IP>
nc -zv <SERVER_IP> 22
# اگر timeout → سرور down است
```

### گام ۲: فعال‌سازی سرور جایگزین

```bash
# اگر DR server دارید:
ssh xennic@<DR_SERVER_IP>
cd /home/xennic/app

# آخرین نسخه کد را دریافت کنید
git pull origin main
```

### گام ۳: بازیابی از آخرین بکاپ

بکاپ‌ها در `backups/` یا در object storage:

```bash
# لیست بکاپ‌های موجود
ls -lt backups/*.dump | head -5

# دریافت آخرین بکاپ (اگر در MinIO/S3 است)
mc cp minio/xennic-backups/db_20260623_140000.dump ./backups/

# ریستور دیتابیس
docker exec -i xennic-postgres pg_restore -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" --clean --if-exists \
  < backups/db_20260623_140000.dump
```

### گام ۴: راه‌اندازی سرویس‌ها

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d
```

### گام ۵: تأیید

طبق چک‌لیست [Deployment Runbook](Deployment.md#چک‌لیست-پس-از-استقرار) تأیید کنید.

### گام ۶: به‌روزرسانی DNS (در صورت تغییر IP)

```bash
# رکورد A را به IP سرور جدید تغییر دهید
# TTL را به ۳۰۰ ثانیه کاهش دهید (از قبل)
```

---

## سناریوی ۲: خرابی دیتابیس (Database Corruption)

**علائم**: `ERROR: relation does not exist`, `could not open file`, `PANIC: WAL`

### گام ۱: ایزوله کردن دیتابیس

```bash
docker stop xennic-api xennic-web xennic-engineering-service xennic-ai-service xennic-vision-service
docker stop xennic-postgres
```

### گام ۲: تشخیص نوع خرابی

```bash
# بررسی لاگ‌های PostgreSQL
docker logs xennic-postgres --tail 100

# بررسی یکپارچگی
docker run --rm -v postgres_data:/var/lib/postgresql/data \
  postgres:17-alpine pg_checksums -c /var/lib/postgresql/data
```

### گام ۳: بازیابی از بکاپ

```bash
# حذف دیتابیس خراب
docker rm -v xennic-postgres

# راه‌اندازی مجدد container
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d postgres

# ریستور آخرین بکاپ سالم
docker exec -i xennic-postgres pg_restore -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" --clean --if-exists \
  < backups/db_20260623_130000.dump
```

### گام ۴: ری‌استارت سرویس‌ها

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml start api web engineering-service ai-service vision-service
```

### گام ۵: بررسی و ثبت

- لاگ‌های PostgreSQL را برای علت خرابی بررسی کنید
- تیکت investigation باز کنید

---

## سناریوی ۳: افشای اسرار (Secrets Compromise)

**علائم**: دسترسی غیرمجاز گزارش شده، activity غیرعادی، alert از monitoring

### گام ۱: ایزوله فوری

```bash
# Revoke دسترسی‌های جاری
# 1. تغییر POSTGRES_PASSWORD
# 2. تغییر REDIS_PASSWORD
# 3. تغییر RABBITMQ credentials
# 4. چرخش JWT keys
```

### گام ۲: چرخش همه اسرار

به [Secrets Rotation Runbook](Secrets-Rotation.md) مراجعه کنید و تمام اسرار را چرخش (rotate) کنید:

1. JWT key pair → تولید مجدد
2. Database password → تغییر
3. Redis password → تغییر
4. RabbitMQ credentials → تغییر
5. API keys → تغییر در provider console
6. SSH keys → تغییر

### گام ۳: بررسی نفوذ

```bash
# بررسی لاگ‌های دسترسی
docker logs xennic-api --tail 1000 | grep -i "401\|403\|invalid token"

# بررسی SSH sessions
last | grep -v "still logged in"

# بررسی docker events
docker events --since 24h
```

### گام ۴: ری‌استارت و مانیتورینگ

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart
# افزایش سطح monitoring برای ۲۴ ساعت آینده
```

> **مرجع کامل**: به [Security Model](/home/ahmad/xennic-docs/docs/security/SECURITY_MODEL.md) رجوع کنید.

---

## بکاپ‌گیری و تأیید

### اسکریپت بکاپ خودکار (cron)

```bash
# نصب در crontab:
# 0 * * * * /home/xennic/app/scripts/backup.sh
```

```bash
#!/bin/bash
# scripts/backup.sh
BACKUP_DIR="/home/xennic/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="xennic-postgres"

docker exec "$DB_CONTAINER" pg_dump -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" --format=custom \
  -f "/tmp/backup_${TIMESTAMP}.dump"

docker cp "$DB_CONTAINER:/tmp/backup_${TIMESTAMP}.dump" "${BACKUP_DIR}/"

# نگهداری ۷ روز آخر
find "$BACKUP_DIR" -name "*.dump" -mtime +7 -delete
```

### تأیید بکاپ (Verification)

```bash
# هر روز اجرا شود
# scripts/verify_backup.sh
docker run --rm -v "${BACKUP_DIR}:/backups" postgres:17-alpine \
  pg_restore --verbose --list "/backups/$(ls -t ${BACKUP_DIR} | head -1)" \
  | head -20 && echo "✅ Backup is valid"
```

---

## DR Testing Schedule

| تست | تعداد | مسئول | توضیح |
|-----|-------|-------|-------|
| **Full DR drill** | سـه‌ماهه | DevOps Lead | شبیه‌سازی خرابی کامل سرور |
| **Database restore** | ماهانه | DB Admin | ریستور بکاپ در محیط staging |
| **Secrets rotation** | سـه‌ماهه | Security Lead | چرخش کامل اسرار در staging |
| **Backup verification** | روزانه | Automated | cron job تأیید یکپارچگی |
| **Tabletop exercise** | سـه‌ماهه |全体チーム | شبیه‌سازی سناریوی incident |

---

## لیست تماس و مسیر escalation

| سطح | مخاطب | کانال | Responsetime |
|-----|-------|-------|-------------|
| L1 | DevOps on-call | Phone / Slack | ۵ دقیقه |
| L2 | DevOps Lead | Phone | ۱۰ دقیقه |
| L3 | CTO / Engineering Manager | Phone | ۱۵ دقیقه |
| L4 | CEO (فقط بحران کامل) | Phone | ۳۰ دقیقه |

### Escalation Matrix

```
SEV1 → L1 فوری → L2 همزمان → L3 در ۱۰ دقیقه → L4 در ۲۰ دقیقه
SEV2 → L1 فوری → L2 در ۱۵ دقیقه
SEV3 → L1 در ۳۰ دقیقه
```

> **جزئیات بیشتر**: [Incident Response Runbook](Incident-Response.md) را ببینید.
