# Rollback Runbook — راهنمای بازگشت به نسخه قبل

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال | **آخرین به‌روزرسانی**: ۲۰۲۶-۰۶-۲۳

**لینک‌های مرتبط**: [Deployment](Deployment.md) · [Disaster Recovery](Disaster-Recovery.md) · [Incident Response](Incident-Response.md) · [Server Rebuild](Server-Rebuild.md) · [Secrets Rotation](Secrets-Rotation.md) · [Backup Plan](/home/ahmad/xennic-docs/docs/devops/BACKUP_PLAN.md)

---

## چه زمانی Rollback کنیم؟

شرط **Rollback فوری** (۵ دقیقه):

| معیار | توضیح |
|-------|-------|
 | **Health check failed** | یکی از سرویس‌های اصلی (api, web) بعد از ۳ دقیقه still unhealthy |
| **اشتباه در دیتابیس** | migration باعث loss data یا schema mismatch شده |
| **افزایش خطای ۵xx** | نرخ خطا > ۵٪ بعد از استقرار |
| **کرش مکرر** | container مدام restart می‌خورد |
| **کندی شدید** | latency بیش از ۲ برابر baseline |
| **مشکل امنیتی** | باگ امنیتی در نسخه جدید کشف شد |

شرط **عدم Rollback**:

- فقط UI/ظاهری مشکل دارد
- Feature flag غیرفعال قابل بازگشت است
- باگ در بخش غیربحرانی (ادمین پنل)

---

## فرآیند بازگشت گام‌به‌گام

> **زمان هدف**: ۱۰ دقیقه (SEV1) · ۳۰ دقیقه (SEV2)

### گام ۱: شناسایی نسخه معیوب

```bash
# نسخه فعلی
docker images --format "{{.Repository}}:{{.Tag}}" | grep xennic

# commit اخیر
git log --oneline -5

# چه چیزی تغییر کرده؟
git diff HEAD~1 --name-only
```

اگر need به آخرین نسخه سالم دارید:

```bash
# پیدا کردن آخرین tag/image سالم
docker images --format "{{.Repository}}:{{.Tag}} {{.CreatedAt}}" | sort -k2 | tail -10
```

### گام ۲: توقف سرویس‌های معیوب

```bash
# متوقف کردن سرویس‌های جدید
docker compose -f infrastructure/docker/compose/production/docker-compose.yml down api
```

> اگر همه سرویس‌ها مشکل دارند، همه را پایین بیاورید.

### گام ۳: بازگشت Docker Image Tag

اگر از tag `latest` استفاده می‌کنید:

```bash
# بازگشت به نسخه قبلی
git checkout <previous_stable_commit> -- infrastructure/docker/compose/production/docker-compose.yml
git checkout <previous_stable_commit> -- apps/api/Dockerfile
git checkout <previous_stable_commit> -- apps/web/Dockerfile
```

اگر image tag versioned دارید:

```bash
# در docker-compose.yml tag را عوض کنید
# image: xennic/api:v1.2.3 → xennic/api:v1.2.2
vim infrastructure/docker/compose/production/docker-compose.yml
```

سپس:

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml pull api web
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d api web
```

### گام ۴: بازگشت دیتابیس (اگر migration ناموفق بود)

> **⚠️ خطرناک**: بازگشت دیتابیس باعث از دست رفتن داده‌های بعد از بکاپ می‌شود.

```bash
# پیدا کردن آخرین بکاپ سالم
ls -lt backups/*.dump | head -5

# ریستور دیتابیس
docker exec -i xennic-postgres pg_restore -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" --clean --if-exists \
  < backups/pre_deploy_backup_20260623_143000.dump
```

> **جزییات بیشتر**: به [Disaster Recovery](Disaster-Recovery.md#سناریوی-خرابی-دیتابیس) مراجعه کنید.

### گام ۵: ری‌استارت سرویس‌های وابسته

```bash
# ری‌استارت همه سرویس‌ها
docker compose -f infrastructure/docker/compose/production/docker-compose.yml restart

# پایش لاگ‌ها
docker compose -f infrastructure/docker/compose/production/docker-compose.yml logs -f --tail=50
```

### گام ۶: بررسی سلامت

```bash
# اجرای health check
for url in \
  http://localhost/nginx-health \
  http://localhost/api/v1/health \
  http://localhost:8001/health \
  http://localhost:8002/health \
  http://localhost:8003/health; do
  echo "$url: $(curl -s -o /dev/null -w '%{http_code}' "$url")"
done
```

### گام ۷: اطلاع‌رسانی

- تیم را در Slack مطلع کنید: `#incidents`
- وضعیت را در صفحه status به‌روز کنید
- اگر public API تحت تأثیر است، در وب‌سایت اطلاع‌رسانی کنید

---

## بازگشت سریع با Docker Compose

برای مواقع بحرانی (SEV1):

```bash
# فایل بکاپ docker-compose نگه دارید
cp infrastructure/docker/compose/production/docker-compose.yml \
  infrastructure/docker/compose/production/docker-compose.yml.bak

# بازگشت به compose قبلی
mv infrastructure/docker/compose/production/docker-compose.yml.bak \
  infrastructure/docker/compose/production/docker-compose.yml

docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d
```

---

## ارتباطات حین Rollback

| مخاطب | کانال | محتوا |
|-------|-------|-------|
| تیم فنی | Slack `#incidents` | علت، scope، زمان تخمینی |
| مدیریت محصول | Slack `#product` | تأثیر بر کاربر، ETA |
| کاربران (در صورت لزوم) | status page | downtime اعلام شده |

پیام نمونه برای `#incidents`:

```
🚨 Rollback در حال اجرا
نسخه: <commit_hash>
علت: <دلیل>
سرویس‌های متأثر: api, web
زمان شروع: <HH:MM>
زمان تخمینی: <MM> دقیقه
وضعیت: ⏳ در حال اجرا
```

---

## ری‌استارت پس از Rollback

پس از رفع مشکل در نسخه جدید:

1. ریشه‌یابی خطا (root cause analysis)
2. Fix در branch جداگانه
3. تست در staging
4. استقرار مجدد طبق [Deployment Runbook](Deployment.md)
