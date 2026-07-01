# استراتژی پشتیبان‌گیری — Backup Strategy

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

استراتژی پشتیبان‌گیری (Backup) دیتابیس و فایل‌های پلتفرم Xennic.

---

## Scope

PostgreSQL backup, Qdrant backup, file backup.

---

## Backup Types

| نوع | محتوا | فرکانس | Retention |
|------|--------|---------|-----------|
| **Full (PG)** | کل دیتابیس | روزانه | ۳۰ روز |
| **WAL** | Write-Ahead Log | پیوسته | ۷ روز |
| **Qdrant Snapshot** | وکتور دیتابیس | هفتگی | ۸ هفته |
| **Configuration** | env, docker, nginx | به ازای هر تغییر | نسخه‌های git |

---

## PostgreSQL Backup

```bash
#!/bin/bash
# Daily full backup
pg_dump -h localhost -U postgres -d xennic \
  --format=custom \
  --file=/backups/pg/xennic_$(date +%Y%m%d).dump

# Restore
pg_restore -h localhost -U postgres -d xennic \
  --format=custom \
  /backups/pg/xennic_20260623.dump
```

---

## Backup Locations

| داده | مسیر | نگهداری |
|------|------|---------|
| PostgreSQL dump | `/backups/pg/` | ۳۰ روز |
| WAL archive | `/backups/pg/wal/` | ۷ روز |
| Qdrant snapshot | `/backups/qdrant/` | ۸ هفته |
| .env files | Git (encrypted) | همیشگی |

---

## Restore Testing

- تست restore ماهانه
- مستندات restore procedure
- بررسی integrity پس از restore

---

## Future Improvements

1. **Automated Backup Scripts** — اسکریپت‌های خودکار
2. **Off-site Storage** — S3/MinIO برای backup
3. **Point-in-Time Recovery** — PITR با WAL
4. **Backup Monitoring** — آلرت برای failure
5. **Encrypted Backups** — رمزنگاری backupها

---

## Related Documents

| سند | مسیر |
|-----|------|
| Database Design | `database/DATABASE_DESIGN.md` |
| Disaster Recovery | `devops/DISASTER_RECOVERY.md` |
| Backup Plan | `devops/BACKUP_PLAN.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
