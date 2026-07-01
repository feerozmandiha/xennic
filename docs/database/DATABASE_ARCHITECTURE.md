# Database Architecture — معماری دیتابیس فعلی

**نسخه**: ۱.۰.۰ | **دیتابیس**: PostgreSQL 17 | **ORM**: Prisma

---

## اصول

- شناسه UUID در تمام موجودیت‌ها
- Multi-tenant با `workspace_id`
- Soft Delete با `deleted_at`
- Timestamps: `created_at`, `updated_at`

---

## مدل‌های اصلی (Prisma)

### Workspace
```prisma
model Workspace {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  users     User[]
  motors    Motor[]
  analyses  Analysis[]
}
```

### User
```prisma
model User {
  id          String   @id @default(uuid()) @db.Uuid
  email       String   @unique
  name        String?
  password    String
  role        Role     @default(USER)
  workspaceId String   @db.Uuid
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  analyses    Analysis[]
}
```

### Motor
```prisma
model Motor {
  id           String   @id @default(uuid()) @db.Uuid
  manufacturer String?
  model        String?
  power        Float?
  voltage      Float?
  current      Float?
  frequency    Float?
  speed        Float?
  workspaceId  String   @db.Uuid
  workspace    Workspace @relation(fields: [workspaceId], references: [id])
}
```

---

## دستورات

```bash
pnpm db:apply    # prisma migrate deploy && prisma generate && seed
pnpm db:reset    # prisma migrate reset --force && seed
pnpm db:generate # prisma generate
pnpm db:studio   # prisma studio
```

> برای معماری کامل دیتابیس هدف با تمام دامنه‌ها (اشتراک، صورتحساب، دانش، بازارگاه و ...) به `XENNIC_DATABASE_SPEC_v2.md` و `XENNIC_ERD_v1.md` مراجعه کنید.
