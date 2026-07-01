# Incident Response Runbook — راهنمای پاسخ به حادثه

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال | **آخرین به‌روزرسانی**: ۲۰۲۶-۰۶-۲۳

**لینک‌های مرتبط**: [Deployment](Deployment.md) · [Rollback](Rollback.md) · [Disaster Recovery](Disaster-Recovery.md) · [Server Rebuild](Server-Rebuild.md) · [Secrets Rotation](Secrets-Rotation.md) · [Security Model](/home/ahmad/xennic-docs/docs/security/SECURITY_MODEL.md)

---

## سطوح شدت (Severity Levels)

| سطح | تعریف | Response Time | Mitigation Time | مثال |
|------|-------|--------------|----------------|------|
| **SEV1** | سرویس اصلی کاملاً down | ۵ دقیقه | ۱۵ دقیقه | API down, DB corruption |
| **SEV2** | سرویس اصلی با اختلال partial | ۱۵ دقیقه | ۶۰ دقیقه | سرعت پایین، یک سرویس down |
| **SEV3** | باگ غیربحرانی | ۶۰ دقیقه | ۱ روز | UI bug, feature broken |
| **SEV4** | درخواست / سوال | ۱ روز | — | Feature request, question |

---

## چرخه حیات حادثه

```
Detection → Triage → Containment → Eradication → Recovery → Post-mortem
```

---

### فاز ۱: Detection (تشخیص)

**منابع تشخیص**:

| منبع | توضیح | اقدام |
|------|-------|-------|
| **Uptime monitoring** (Uptime Kuma, Better Uptime) | Alert خودکار | بررسی dashboard |
| **Error tracking** (Sentry) | Exception alert | مشاهده stack trace |
| **Log aggregation** (Grafana Loki) | Error rate spike | query: `{job=~".+"} \|= "ERROR"` |
| **Metric alert** (Prometheus) | CPU/Mem بالا, 5xx spike | بررسی alert rule |
| **گزارش کاربر** | تیکت پشتیبانی | تأیید و ارتقا به incident |

**اقدام اولیه**:

```bash
# بررسی وضعیت سرویس‌ها
docker ps --format "table {{.Names}}\t{{.Status}}"

# بررسی لاگ‌ها
docker compose -f infrastructure/docker/compose/production/docker-compose.yml logs \
  --tail=50 --since=5m

# بررسی metrics
curl -s http://localhost:9090/api/v1/query?query=up
```

---

### فاز ۲: Triage (اولویت‌بندی)

1. **تعیین severity** بر اساس جدول بالا
2. **اعلام incident** به تیم (Slack + Pager)
3. **تشکیل war room** (Slack channel یا voice call)
4. **ثبت incident** در سیستم (شماره و timestamp)

```bash
# ثبت incident
INCIDENT_ID="INC-$(date +%Y%m%d-%H%M%S)"
echo "$INCIDENT_ID: $(date) - اولیه" >> /var/log/incidents.log
```

کانال Slack: `#incidents` (اعلان عمومی) · `#incidents-war-room` (مکالمه فنی)

---

### فاز ۳: Containment (مهار)

بر اساس severity:

**SEV1**:

```bash
# 1. قطع ترافیک اگر حمله است
docker compose -f infrastructure/docker/compose/production/docker-compose.yml stop api

# 2. یا بازگشت به نسخه قبل (Rollback)
# به Rollback Runbook مراجعه کنید
```

```
⚠️ [SEV1] INC-{id} - فعال‌سازی Rollback
سرویس‌های متأثر: {services}
اقدام: قطع سرویس / بازگشت نسخه
ESC: {name} @ {phone}
```

**SEV2**:

```bash
# محدود کردن rate limiting
docker exec xennic-nginx sed -i 's/rate=100r\/s/rate=20r\/s/' /etc/nginx/nginx.conf
docker exec xennic-nginx nginx -s reload
```

**SEV3/SEV4**: بدون نیاز به containment فوری. ثبت در backlog.

---

### فاز ۴: Eradication (ریشه‌کنی)

پس از containment، علت ریشه‌ای را پیدا و رفع کنید:

| مشکل | اقدام |
|-------|--------|
| Bug در کد | Hotfix → PR → deploy |
| Configuration error | اصلاح config → reload |
| Resource exhaustion | افزایش resource → scale |
| Security issue | Patch + rotate credentials |
| Database issue | Optimize query → ایجاد index |

```bash
# کشف علت
docker logs xennic-api --tail 200 | grep "ERROR\|Error\|error"
# بررسی metrics اخیر
curl -s http://localhost:9090/api/v1/query?query=rate\(http_requests_total\[5m\]\)
```

---

### فاز ۵: Recovery (بازیابی)

1. **Deploy fix** طبق [Deployment Runbook](Deployment.md)
2. **تأیید health** همه سرویس‌ها
3. **فعال‌سازی مجدد** سرویس‌های متوقف شده
4. **پایش ۳۰ دقیقه** بعد از recovery

```bash
# بررسی نرخ خطا بعد از recovery
for i in 1 2 3 4 5 6; do
  sleep 300  # هر ۵ دقیقه
  curl -s http://localhost:9090/api/v1/query?query=rate\(http_requests_total\[5m\]\)
done
```

---

### فاز ۶: Post-mortem

**زمان**: حداکثر ۴۸ ساعت پس از recovery

**الگوی Post-mortem**:

```markdown
# Post-mortem: INC-{id}

## خلاصه
- تاریخ: {date}
- Severity: {SEV1/SEV2/SEV3}
- Duration: {duration}
- مسئول: {name}

## Timeline
| زمان | رویداد |
|------|--------|
| HH:MM | کشف incident |
| HH:MM | Triage |
| HH:MM | Containment |
| HH:MM | Eradication |
| HH:MM | Recovery |

## Root Cause
{علت اصلی}

## Impact
- کاربران متأثر: {count}
- Downtime: {duration}
- Data loss: {none/partial/full}

## Action Items
- [ ] اقدام ۱ | مسئول: {name} | deadline: {date}
- [ ] اقدام ۲ | مسئول: {name} | deadline: {date}

## Lessons Learned
{نکات آموخته شده}

## Blameless Statement
این incident نتیجه خطای فرآیند است، نه خطای افراد.
```

---

## Security Incident Procedures

### تشخیص نفوذ

```bash
# بررسی SSH sessions غیرمجاز
last -a | grep -v "$(whoami)"

# بررسی لاگ API برای brute force
docker logs xennic-api --tail 10000 | grep "401" | wc -l

# بررسی تغییرات فایل
find /home/xennic/app -name "*.php" -o -name "*.asp"  # فایل‌های غیرمنتظره
```

### اقدامات امنیتی فوری

| اقدام | دستور | زمان |
|-------|-------|------|
| بلاک IP | `iptables -A INPUT -s <IP> -j DROP` | ۱ دقیقه |
| چرخش SSH key | `ssh-keygen -t ed25519` | ۵ دقیقه |
| چرخش همه اسرار | به [Secrets Rotation Runbook](Secrets-Rotation.md) مراجعه کنید | ۳۰ دقیقه |
| بررسی integrity | `docker diff xennic-api` | ۲ دقیقه |

---

## Escalation Matrix

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌────────┐
│ L1:     │ ──→ │ L2:      │ ──→ │ L3:        │ ──→ │ L4:    │
│ On-Call │     │ DevOps   │     │ CTO / Eng  │     │ CEO    │
│ ۵ دقیقه │     │ Lead     │     │ Manager    │     │ ۳۰ د   │
│         │     │ ۱۰ دقیقه │     │ ۱۵ دقیقه   │     │       │
└─────────┘     └──────────┘     └────────────┘     └────────┘
```

| سطح | نام | شماره | کانال جایگزین |
|------|------|-------|--------------|
| L1 On-Call | (مشخص شود) | (شماره) | Slack DM |
| L2 DevOps Lead | (مشخص شود) | (شماره) | Phone |
| L3 CTO | (مشخص شود) | (شماره) | Phone |
| L4 CEO | (مشخص شود) | (شماره) | Phone |

> **پس از incident**: حتماً [Disaster Recovery Runbook](Disaster-Recovery.md) را بررسی کنید تا از بکاپ‌ها مطمئن شوید.
