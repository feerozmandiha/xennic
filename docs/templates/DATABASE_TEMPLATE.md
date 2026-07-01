# [نام موجودیت] — قالب مستندات دیتابیس

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **آخرین بروزرسانی**: [تاریخ]

---

## Purpose

هدف این مدل دیتابیس چیست؟

---

## Scope

Table schema, relationships, indexes.

---

## Schema

```prisma
model [EntityName] {
  id        String   @id @default(uuid())
  field     Type     @default(...)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  relation  RelatedModel @relation(fields: [relationId], references: [id])
  relationId String
}
```

## Relationships

| رابطه | نوع | مدل مقابل |
|--------|------|-----------|
| [relation] | one-to-many / many-to-many | [Model] |

## Indexes

| Index | Columns | Type |
|-------|---------|------|
| [index_name] | [columns] | B-tree / GIN |

## Audit Fields

| فیلد | توضیح |
|------|-------|
| createdAt | زمان ایجاد |
| updatedAt | آخرین بروزرسانی |
| deletedAt | (اختیاری) Soft delete |

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
| ۱.۰.۰ | [تاریخ] | انتشار اولیه |
