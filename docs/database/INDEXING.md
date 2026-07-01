# ایندکس‌گذاری — Indexing Strategy

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

استراتژی ایندکس‌گذاری دیتابیس PostgreSQL برای پلتفرم Xennic.

---

## Scope

PostgreSQL 17 indexes, query optimization, performance.

---

## Index Types

| نوع | کاربرد | مثال |
|------|---------|-------|
| B-tree | پیش‌فرض، sorting, equality | `email`, `slug` |
| Hash | equality فقط | `token_hash` |
| GIN | full-text search | `search_text` |
| JSONB | queries روی JSON | `content`, `settings` |
| Composite | multi-column queries | `(workspace_id, created_at)` |

---

## Index Convention

```prisma
model users {
  @@index([email])          // B-tree, single column
  @@index([workspace_id, created_at])  // Composite
  @@index([deleted_at])     // Soft delete filter
}
```

---

## Mandatory Indexes

| جدول | ایندکس | نوع | دلیل |
|------|--------|------|------|
| همه جدول‌ها | `created_at` | B-tree | مرتب‌سازی زمانی |
| جدول‌های چندمستأجری | `workspace_id` | B-tree | tenant isolation |
| جدول‌های حساس | `(workspace_id, created_at)` | Composite | queries رایج |
| جدول‌های Soft-delete | `deleted_at` | B-tree | فیلتر حذف‌شده‌ها |

---

## Query Patterns

```sql
-- Most common query pattern
SELECT * FROM calculations
WHERE workspace_id = 'ws-123'
  AND deleted_at IS NULL
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 20;
```

### Needed Index
```prisma
model calculations {
  @@index([workspace_id, created_at])
  @@index([deleted_at])
}
```

---

## Full-Text Search

```prisma
model knowledge {
  search_text String?  // Auto-populated
  @@index([search_text], type: Gin)
}
```

---

## Performance Guidelines

- هر جدول حداکثر **۵ ایندکس** (تعادل بین read/write)
- ایندکس‌های composite برای queries رایج
- اجتناب از over-indexing در جدول‌های write-heavy
- مانیتورینگ ایندکس‌های استفاده‌نشده

---

## Related Documents

| سند | مسیر |
|-----|------|
| Database Design | `database/DATABASE_DESIGN.md` |
| Migrations | `database/MIGRATIONS.md` |
| Backup Strategy | `database/BACKUP_STRATEGY.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
