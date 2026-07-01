# Migration Strategy — Database Migrations

**Version**: 1.0.0 | **Status**: Approved | **Date**: Tir 1405

---

## Strategy Overview

| Tool | Prisma Migrate |
| Command (production) | `prisma migrate deploy` |
| Command (development) | `prisma migrate dev` |
| Schema | `apps/api/prisma/schema.prisma` |
| Migration directory | `apps/api/prisma/migrations/` |

**Core rule**: Always use `migrate deploy` in production. Never use `db push` — it can drop data.

---

## Workflow

```mermaid
graph LR
    A["Edit Schema"] --> B["Generate\nprisma migrate dev"]
    B --> C["Review SQL\nin migrations/ dir"]
    C --> D["Commit migration\nfiles to git"]
    D --> E["Deploy\nprisma migrate deploy"]
    E --> F["Generate client\nprisma generate"]
    F --> G["Seed (dev only)\nprisma db seed"]
```

---

## Commands

### Development
```bash
# Create new migration after schema change
npx prisma migrate dev --name describe_change

# Review generated SQL
cat apps/api/prisma/migrations/*/migration.sql

# Reset database (drops all data)
npx prisma migrate reset --force
```

### Production
```bash
# Apply pending migrations (safe)
npx prisma migrate deploy

# Regenerate client after deploy
npx prisma generate
```

### Xennic Scripts
```bash
pnpm db:apply    # migrate deploy + generate + seed (development)
pnpm db:reset    # migrate reset --force + seed (development reset)
pnpm db:generate # prisma generate only
```

---

## Migration Files

5 migrations exist in `apps/api/prisma/migrations/`:

| Migration | Description |
|-----------|-------------|
| `20250501000001_init` | Initial schema — users, workspaces, roles |
| `20250515000002_auth` | Authentication — sessions, refresh tokens |
| `20250520000003_projects` | Projects, diagrams, knowledge base |
| `20250601000004_ai` | AI service, embeddings, vector store |
| `20250615000005_enterprise` | Enterprise features, billing, teams |

---

## Safety Rules

| Rule | Description |
|------|-------------|
| **No direct DB changes** | Never alter the database outside Prisma Migrate |
| **Review SQL** | Always review generated SQL before committing |
| **Version control** | All migration files must be committed to git |
| **Rollback plan** | Have a rollback migration ready before deploying |
| **Backup first** | Run `scripts/db-backup.sh` before any production migration |
| **Test on staging** | Never run first migration directly on production |

---

## Rollback

```bash
# Prisma Migrate does not support automatic rollback.
# To revert:
# 1. Create a new migration that reverses the changes
# 2. Or restore from backup:
bash scripts/db-restore.sh
```

---

## Related Documents

| Document | Path |
|----------|------|
| Database Architecture | `docs/database/DATABASE_ARCHITECTURE.md` |
| Backup & Restore | `docs/database/BACKUP_AND_RESTORE.md` |
| Production Audit | `docs/project/PRODUCTION_READINESS_AUDIT.md` |
