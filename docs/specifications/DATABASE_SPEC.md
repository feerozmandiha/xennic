# مشخصات دیتابیس — Database Specification

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **مالک**: Backend Team | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: شهریور ۱۴۰۵

---

## Purpose

مشخصات رسمی دیتابیس پلتفرم Xennic به عنوان قرارداد پیاده‌سازی.

---

## Scope

Schema, ORM, migrations, backup.

---

## Contract

### Database
| پارامتر | مقدار |
|---------|-------|
| Engine | PostgreSQL 17 |
| ORM | Prisma 5 |
| Schema Source | `apps/api/prisma/schema.prisma` |
| Migration Tool | Prisma Migrate |

### Models
| دامنه | تعداد مدل‌ها |
|-------|-------------|
| Identity & Auth | 6 |
| Project Management | 8 |
| Engineering Calculations | 12 |
| AI/ML | 5 |
| Knowledge Management | 4 |
| Subscription/Billing | 9 |
| Marketplace | 3 |
| **Total** | **47** |

### Conventions
| مؤلفه | سبک |
|-------|------|
| Tables | snake_case, plural |
| Columns | snake_case |
| Primary Keys | UUID v4 |
| Foreign Keys | `[table]_id` |
| Timestamps | `created_at`, `updated_at` |
| Soft Delete | `deleted_at` (optional) |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Database Design | `database/DATABASE_DESIGN.md` |
| ERD | `database/ERD.md` |
| Indexing | `database/INDEXING.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
