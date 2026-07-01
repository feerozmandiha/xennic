# Secrets Rotation Runbook — راهنمای چرخش اسرار

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال | **آخرین به‌روزرسانی**: ۲۰۲۶-۰۶-۲۳

**لینک‌های مرتبط**: [Deployment](Deployment.md) · [Rollback](Rollback.md) · [Disaster Recovery](Disaster-Recovery.md) · [Incident Response](Incident-Response.md) · [Server Rebuild](Server-Rebuild.md) · [Security Model](/home/ahmad/xennic-docs/docs/security/SECURITY_MODEL.md)

---

## اصول کلی

- **Zero-downtoy**: تا حد امکان بدون توقف سرویس
- **Least privilege**: همزمان دو secret معتبر (old + new) در دوره transition
- **هماهنگی**: بعد از چرخش، تیم را مطلع کنید
- **ثبت**: تمام چرخش‌ها در audit log ثبت شوند
- **فوریت**: در صورت افشا، چرخش فوری طبق [Incident Response Runbook](Incident-Response.md)

---

## ۱. چرخش JWT Key Pair

> **تأثیر**: تمام access tokens جاری بلافاصله invalid می‌شوند. کاربران باید دوباره login کنند.

### گام ۱: تولید key pair جدید

```bash
cd /home/xennic/app

# بکاپ key‌های قدیمی
cp infrastructure/secrets/jwtRS256.key infrastructure/secrets/jwtRS256.key.bak.$(date +%Y%m%d)
cp infrastructure/secrets/jwtRS256.key.pub infrastructure/secrets/jwtRS256.key.pub.bak.$(date +%Y%m%d)

# تولید key pair جدید
ssh-keygen -t rsa -b 4096 -m PEM \
  -f infrastructure/secrets/jwtRS256.key -N ""
openssl rsa -in infrastructure/secrets/jwtRS256.key \
  -pubout -outform PEM \
  -out infrastructure/secrets/jwtRS256.key.pub
chmod 600 infrastructure/secrets/jwtRS256.key
```

### گام ۲: به‌روزرسانی config (صفر downtime)

Docker secrets را در compose به‌روز کنید:

```yaml
# infrastructure/docker/compose/production/docker-compose.yml
secrets:
  jwt_private_key:
    file: ../../secrets/jwtRS256.key
  jwt_public_key:
    file: ../../secrets/jwtRS256.key.pub
```

بدون ری‌استارت، سرویس API جدید key را می‌خواند:

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api
```

### گام ۳: تأیید

```bash
# تست با token جدید
TOKEN=$(curl -s -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@xennic.ir","password":"<password>"}' \
  | jq -r '.data.accessToken')

curl -s http://localhost/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### گام ۴: بازنشستگی key قدیمی

پس از اطمینان از کارکرد صحیح:

```bash
# حذف بکاپ بعد از ۷ روز
# به صورت دستی نگهداری کنید تا در صورت نیاز rollback کنید
```

> **Rollback**: در صورت مشکل، key‌های `.bak` را برگردانید.

---

## ۲. چرخش Database Password (PostgreSQL)

> **تأثیر**: downtime کوتاه (حداکثر ۳۰ ثانیه) برای restart service.

### گام ۱: تولید پسورد جدید

```bash
NEW_DB_PASS=$(openssl rand -base64 32)
echo "New PostgreSQL password: $NEW_DB_PASS"
```

### گام ۲: تغییر پسورد در دیتابیس

```bash
docker exec -it xennic-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "ALTER USER ${POSTGRES_USER} WITH PASSWORD '${NEW_DB_PASS}';"
```

### گام ۳: به‌روزرسانی `.env`

```bash
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${NEW_DB_PASS}/" .env
```

### گام ۴: ری‌استارت سرویس‌های متصل

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api engineering-service ai-service
```

### گام ۵: تأیید

```bash
docker exec -it xennic-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;"
```

---

## ۳. چرخش API Keys (Groq, OpenAI, Anthropic, Google)

> **استراتژی**: بدون downtime — همیشه ۲ key معتبر همزمان در provider.

### گام ۱: دریافت key جدید از provider

| Provider | Console | توجه |
|----------|---------|-------|
| **Groq** | https://console.groq.com/keys | billing را بررسی کنید |
| **OpenAI** | https://platform.openai.com/api-keys | usage limit را تنظیم کنید |
| **Anthropic** | https://console.anthropic.com/ | rate limit را چک کنید |
| **Google** | https://makersuite.google.com/app/apikey | quota را بررسی کنید |

### گام ۲: اضافه کردن key جدید به `.env`

```bash
# به جای جایگزینی، key جدید را اضافه کنید:
vim .env
# GROQ_API_KEY_NEW=gsk_...
```

در docker-compose یا سرویس مربوطه، متغیر قدیمی را نگه دارید و متغیر جدید را اضافه کنید:

```yaml
# برای ai-service و vision-service
environment:
  - GROQ_API_KEY=${GROQ_API_KEY}
  - GROQ_API_KEY_NEW=${GROQ_API_KEY_NEW}
```

### گام ۳: به‌روزرسانی کد (در صورت استفاده از key جدید)

کد سرویس را به‌روز کنید تا از key جدید به عنوان fallback استفاده کند:

```python
# مثال در ai-service
GROQ_API_KEY = os.getenv("GROQ_API_KEY_NEW") or os.getenv("GROQ_API_KEY")
```

### گام ۴: ری‌استارت سرویس‌ها

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart ai-service vision-service
```

### گام ۵: غیرفعال کردن key قدیمی در provider console

پس از ۲۴ ساعت و اطمینان از عدم استفاده:

1. وارد console provider شوید
2. Key قدیمی را revoke/delete کنید
3. متغیر `GROQ_API_KEY_NEW` را به `GROQ_API_KEY` تغییر نام دهید
4. کد fallback را پاک کنید

---

## ۴. چرخش Redis Password

> **تأثیر**: downtime برای اتصال مجدد سرویس‌ها به Redis.

### گام ۱: تولید پسورد جدید

```bash
NEW_REDIS_PASS=$(openssl rand -base64 32)
```

### گام ۲: به‌روزرسانی docker-compose

```bash
sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${NEW_REDIS_PASS}/" .env
```

### گام ۳: ری‌استارت Redis

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart redis
```

### گام ۴: ری‌استارت سرویس‌های وابسته

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api
```

### گام ۵: تأیید

```bash
docker exec xennic-redis redis-cli -a "${NEW_REDIS_PASS}" ping
# → PONG
```

---

## ۵. چرخش RabbitMQ Credentials

> **تأثیر**: downtime کوتاه برای اتصال مجدد.

### گام ۱: تولید username/password جدید

```bash
NEW_RABBIT_USER="xennic_$(date +%s)"
NEW_RABBIT_PASS=$(openssl rand -base64 32)
```

### گام ۲: ایجاد user جدید در RabbitMQ

```bash
docker exec xennic-rabbitmq rabbitmqctl add_user "${NEW_RABBIT_USER}" "${NEW_RABBIT_PASS}"
docker exec xennic-rabbitmq rabbitmqctl set_permissions -p / "${NEW_RABBIT_USER}" ".*" ".*" ".*"
docker exec xennic-rabbitmq rabbitmqctl set_user_tags "${NEW_RABBIT_USER}" administrator
```

### گام ۳: به‌روزرسانی `.env`

```bash
sed -i "s/RABBITMQ_DEFAULT_USER=.*/RABBITMQ_DEFAULT_USER=${NEW_RABBIT_USER}/" .env
sed -i "s/RABBITMQ_DEFAULT_PASS=.*/RABBITMQ_DEFAULT_PASS=${NEW_RABBIT_PASS}/" .env
```

### گام ۴: ری‌استارت سرویس‌های وابسته

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api
```

### گام ۵: تأیید

```bash
docker exec xennic-rabbitmq rabbitmqctl authenticate_user "${NEW_RABBIT_USER}" "${NEW_RABBIT_PASS}"
# → Success
```

### گام ۶: حذف user قدیمی

```bash
docker exec xennic-rabbitmq rabbitmqctl delete_user "${OLD_RABBIT_USER}"
```

---

## ۶. چرخش MinIO Credentials

> **تأثیر**: بدون downtime در صورت استفاده از access key rotation.

### گام ۱: ایجاد access key جدید

```bash
docker exec xennic-minio mc alias set local http://localhost:9000 "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}"
docker exec xennic-minio mc admin user svcacct add local "${MINIO_ACCESS_KEY}"
# → New access key و secret key نمایش داده می‌شود
```

### گام ۲: به‌روزرسانی `.env`

```bash
vim .env
# MINIO_ACCESS_KEY=<new_key>
# MINIO_SECRET_KEY=<new_secret>
```

### گام ۳: ری‌استارت سرویس‌های وابسته

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart api vision-service
```

### گام ۴: حذف access key قدیمی

```bash
docker exec xennic-minio mc admin user svcacct remove local "${OLD_ACCESS_KEY}"
```

---

## برنامه منظم چرخش

| Secret | دوره | مسئول | Zero-downtime? |
|--------|------|-------|---------------|
| JWT key pair | سـه‌ماهه | DevOps | ❌ (کاربران logout) |
| Database password | ۶ ماهه | DBA | ❌ (~۳۰ ثانیه) |
| Redis password | ۶ ماهه | DevOps | ❌ (~۳۰ ثانیه) |
| RabbitMQ credentials | ۶ ماهه | DevOps | ❌ (~۳۰ ثانیه) |
| MinIO credentials | سالانه | DevOps | ✅ |
| API keys (AI) | سـه‌ماهه | Developer | ✅ |
| SSH keys | سالانه | DevOps | ❌ (نیاز به deploy) |

---

## Emergency Rotation Script

```bash
#!/bin/bash
# scripts/emergency_rotate.sh
# در صورت افشای اسرار - همه را یکباره تغییر می‌دهد

echo "🚨 Emergency Secrets Rotation Started: $(date)"

# 1. JWT Keys
ssh-keygen -t rsa -b 4096 -m PEM -f infrastructure/secrets/jwtRS256.key -N ""
openssl rsa -in infrastructure/secrets/jwtRS256.key -pubout -outform PEM \
  -out infrastructure/secrets/jwtRS256.key.pub

# 2. DB Password
NEW_DB_PASS=$(openssl rand -base64 32)
docker exec xennic-postgres psql -U xennic -c "ALTER USER xennic WITH PASSWORD '${NEW_DB_PASS}';"
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${NEW_DB_PASS}/" .env

# 3. Redis Password
NEW_REDIS_PASS=$(openssl rand -base64 32)
sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${NEW_REDIS_PASS}/" .env
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart redis

# 4. RabbitMQ
NEW_RABBIT_USER="xennic_$(date +%s)"
NEW_RABBIT_PASS=$(openssl rand -base64 32)
docker exec xennic-rabbitmq rabbitmqctl add_user "${NEW_RABBIT_USER}" "${NEW_RABBIT_PASS}"
docker exec xennic-rabbitmq rabbitmqctl set_permissions -p / "${NEW_RABBIT_USER}" ".*" ".*" ".*"

# 5. Restart all services
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart

echo "✅ Emergency Rotation Complete: $(date)"
```

---

> **پس از چرخش**: [Deployment Runbook](Deployment.md#چک‌لیست-پس-از-استقرار) را برای تأیید کامل بررسی کنید.
