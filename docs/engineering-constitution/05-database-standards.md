# 5. Database Standards

> **Cross-References**: → prisma/schema.prisma, → docs/decisions/ADR-007-database-migration-strategy.md, → docs/engineering-constitution/02-coding-standards.md §6 Prisma Standards
>
> **Status**: Adopted · **Version**: 1.0.0 · **Last Updated**: 2026-06-26

---

## Table of Contents

1. [Prisma Rules](#1-prisma-rules)
2. [Migration Rules](#2-migration-rules)
3. [Index Policy](#3-index-policy)
4. [UUID Policy](#4-uuid-policy)
5. [Tenant Isolation](#5-tenant-isolation)
6. [Soft Delete](#6-soft-delete)
7. [Audit Fields](#7-audit-fields)
8. [Transactions](#8-transactions)
9. [Optimistic Locking](#9-optimistic-locking)
10. [Naming Conventions](#10-naming-conventions)
11. [Foreign Keys](#11-foreign-keys)
12. [Vector Storage](#12-vector-storage)
13. [Knowledge Storage](#13-knowledge-storage)
14. [Schema Evolution](#14-schema-evolution)
15. [Connection Management](#15-connection-management)

---

## 1. Prisma Rules

### WHY

Prisma is our single source of truth for the database schema (per [ADR-007](../decisions/ADR-007-database-migration-strategy.md)). Every change flows through the Prisma schema. Consistency in schema organization, naming, and field types is essential for maintainability across 61+ models and 15+ domains.

### RATIONALE

Schema is organized by domain with clear section comments. Models use PascalCase singular names. Fields use camelCase. Relations are explicitly named. All business entity IDs use `@default(uuid())`. Timestamps follow a consistent pattern. `@map` and `@@map` control physical column/table names.

### Schema Organization by Domain

```prisma
// ============================================================
// IDENTITY DOMAIN
// ============================================================
model users { ... }
model sessions { ... }
model roles { ... }

// ============================================================
// WORKSPACE DOMAIN
// ============================================================
model workspaces { ... }
model workspace_members { ... }

// ============================================================
// PROJECT DOMAIN
// ============================================================
model projects { ... }
```

### Model Naming

| Element | Convention | Example |
|---------|------------|---------|
| Model name | PascalCase, singular | `Project`, `User`, `Workspace`, `Calculation` |
| Field names | camelCase | `firstName`, `createdAt`, `workspaceId` |
| Relation names | PascalCase | `author`, `workspace`, `projectMembers` |
| Relation fields | Explicit naming | `@relation("ProjectCreatedBy")` |

### Field Types

```prisma
model example {
  id          String    @id @default(uuid())    // UUID primary key
  workspaceId String                            // Foreign key
  name        String                            // Required string
  description String?                           // Optional string
  status      String    @default("active")      // String enum
  count       Int       @default(0)             // Integer
  amount      Decimal   @db.Decimal(12, 2)      // Decimal with precision
  metadata    Json      @default("{}")          // JSON
  isActive    Boolean   @default(false)         // Boolean
  createdAt   DateTime  @default(now())         // Created timestamp
  updatedAt   DateTime  @updatedAt              // Updated timestamp
  deletedAt   DateTime?                         // Soft delete
}
```

### @map and @@map

```prisma
model users {
  firstName String @map("first_name")
  createdAt DateTime @map("created_at")

  @@map("users")
}
```

| Directive | Purpose | Convention |
|-----------|---------|------------|
| `@map("column_name")` | Map camelCase field → snake_case column | Snake case |
| `@@map("table_name")` | Map PascalCase model → snake_case table | Snake case, plural |
| `@@id([a, b])` | Composite primary key | When needed |
| `@@unique([a, b])` | Composite unique constraint | Descriptive |

**GOOD example:**
```prisma
model project_members {
  id          String   @id @default(uuid())
  projectId   String   @map("project_id")
  userId      String   @map("user_id")
  role        String   @default("viewer")
  joinedAt    DateTime @default(now()) @map("joined_at")

  project     projects @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        users    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@map("project_members")
}
```

**BAD example:**
```prisma
// No @map — Prisma generates camelCase columns in PostgreSQL
model ProjectMembers {
  id          String   @id @default(uuid())
  projectId   String
  userId      String
}
```

**BAD example:**
```prisma
// Mixed naming conventions, no domain organization
model project { ... }
model ProjectWorkspace { ... }
model project_notes { ... }
```

---

## 2. Migration Rules

### WHY

Database migrations are irreversible changes to the schema. Mistakes can cause data loss, downtime, or corruption. Strict migration discipline ensures safety, auditability, and rollback capability.

### RATIONALE

Prisma Migrate generates SQL migrations from schema changes. Each schema change produces exactly one migration. Existing migrations are NEVER edited after creation — if a correction is needed, a new migration is created. This follows the guidance in [ADR-007](../decisions/ADR-007-database-migration-strategy.md).

### One Migration Per Change

```bash
# Generate a migration for a specific change
npx prisma migrate dev --name add_project_priority_field --create-only

# Create only — review the SQL first, then apply
npx prisma migrate dev
```

### Migration Naming Convention

```
YYYYMMDDHHMMSS_description

Examples:
20260530120000_init
20260601101500_add_workspace_settings
20260615143000_add_project_priority_field
20260620120000_add_knowledge_search_index
```

### Migration Review Process

1. Run `pnpm db:generate` — ensure schema compiles
2. Run `npx prisma migrate dev --create-only` — generate migration SQL (no apply)
3. Review the generated SQL file in `prisma/migrations/`
4. Verify: no destructive changes without explicit approval
5. Verify: new indexes are named per convention
6. Commit migration file alongside schema change
7. Run `pnpm db:apply` in CI to apply

### Rollback Strategy

```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back "20260615143000_add_project_priority_field"

# Apply the rollback SQL manually (generated from diff)
# Then mark as resolved
```

> **Note:** Prisma Migrate does not natively support rollback. Rollback requires either:
> 1. Creating a new "revert" migration that undoes the change
> 2. Restoring from backup and re-applying migrations up to the point before the faulty one
>
> Strategy 1 is preferred for non-data-loss rollbacks. Strategy 2 for data-loss scenarios.

### Zero-Downtime Migrations

| Migration Type | Zero-Downtime? | Strategy |
|----------------|---------------|----------|
| Add nullable column | Yes | Simple `ALTER TABLE ADD COLUMN` |
| Add non-nullable column | Yes | Add nullable → backfill data → set NOT NULL |
| Add index | Yes | `CREATE INDEX CONCURRENTLY` |
| Drop index | Yes | `DROP INDEX CONCURRENTLY` |
| Add table | Yes | Simple `CREATE TABLE` |
| Rename column | Requires expand/contract | Add new column → dual-write → backfill → drop old |
| Drop column | Requires expand/contract | Deprecate → stop reading → drop |
| Change column type | Requires expand/contract | Add new column → dual-write → backfill → swap → drop |

**GOOD example:**
```bash
npx prisma migrate dev --name add_calculation_engine_version --create-only
# Review SQL
# Commit both schema change and migration
```

**BAD example:**
```bash
# Editing an existing migration file
# Direct ALTER TABLE on production database
# Dropping a column without deprecation period
```

---

## 3. Index Policy

### WHY

Indexes are the primary tool for query performance. Missing indexes cause slow queries. Too many indexes cause slow writes and bloat. A deliberate index policy ensures the right indexes exist where needed.

### RATIONALE

Index every foreign key. Index columns used in `WHERE`, `ORDER BY`, and `JOIN`. Composite indexes follow column selectivity order. Partial indexes cover filtered queries. Index names follow a predictable convention.

### When to Index

| Situation | Index? | Example |
|-----------|--------|---------|
| Foreign key column | ALWAYS | `workspaceId`, `userId`, `projectId` |
| `WHERE` filter column | YES | `status`, `type`, `language` |
| `ORDER BY` column | YES | `createdAt`, `updatedAt` |
| `UNIQUE` constraint | ALWAYS | Prisma creates automatically |
| Low-cardinality column | MAYBE | Boolean columns rarely benefit |
| Rarely queried column | NO | `avatarFileId` |

### Composite Index Order

```prisma
model user_roles {
  userId String
  roleId String
  workspaceId String

  @@index([userId, workspaceId])  // Leftmost = most selective
}
```

Rule: Place the most selective (highest cardinality) column first.

### Partial Indexes

```prisma
// Index only active records
model projects {
  status String

  @@index([status], where: "status = 'active'")
}
```

### Index Naming Convention

```
idx_{tablename}_{column(s)}

Examples:
idx_users_email
idx_projects_workspace_id_status
idx_knowledge_workspace_id_status_language
idx_user_roles_user_id_workspace_id
```

### Avoid Over-Indexing

| Index | Justification |
|-------|---------------|
| `idx_users_deleted_at` | Needed — soft delete filter |
| `idx_users_created_at` | Needed — list ordering |
| `idx_users_avatar_file_id` | NOT needed — rarely queried alone |
| `idx_projects_name` | NOT needed — full-text search uses different mechanism |

**GOOD example:**
```prisma
model knowledge {
  workspaceId String
  status      String
  language    String
  authorId    String?

  @@index([workspaceId])                              // FK
  @@index([status])                                   // Filter
  @@index([workspaceId, status, language])            // Composite filter
  @@index([authorId])                                 // FK (nullable)
  @@index([createdAt])                                // Sort
}
```

**BAD example:**
```prisma
// Missing indexes on foreign keys and filters
model knowledge {
  workspaceId String
  status      String
  // No @@index declarations
}
```

---

## 4. UUID Policy

### WHY

UUIDs provide globally unique identifiers without a central coordinator. They enable safe client-side ID generation, cross-service ID sharing, and distributed database operations without collision risk.

### RATIONALE

Every business entity uses UUID v4 as its primary key. UUIDs are stored as `@db.Uuid` (PostgreSQL native UUID type) for storage efficiency. Auto-increment integers are NEVER used for business entity IDs. UUIDs are formatted as lowercase hex with hyphens (`8-4-4-4-12`).

### UUID v4 for All Primary Keys

```prisma
model projects {
  id String @id @default(uuid()) @db.Uuid
}
```

### UUID Format

| Format | Example | Accepted? |
|--------|---------|-----------|
| `8-4-4-4-12` lowercase | `550e8400-e29b-41d4-a716-446655440000` | YES |
| `8-4-4-4-12` uppercase | `550E8400-E29B-41D4-A716-446655440000` | No — normalize to lowercase |
| Without hyphens | `550e8400e29b41d4a716446655440000` | No — reject |
| Non-UUID v4 | `00000000-0000-0000-0000-000000000000` | No — nil UUID not allowed |

### Storage

| Storage Type | Configuration |
|--------------|---------------|
| Column type | `@db.Uuid` |
| Default | `@default(uuid())` |
| Foreign key type | `String` (Prisma maps to `text` — acceptable for FK references) |

### Never Use Auto-Increment

```prisma
// BAD — auto-increment ID
model projects {
  id Int @id @default(autoincrement())
}

// GOOD — UUID
model projects {
  id String @id @default(uuid()) @db.Uuid
}
```

**GOOD example:**
```prisma
model workspaces {
  id String @id @default(uuid()) @db.Uuid
}
```

**BAD example:**
```prisma
model workspaces {
  id Int @id @default(autoincrement())
}
```

---

## 5. Tenant Isolation

### WHY

Xennic is a multi-tenant SaaS platform. Every tenant's data must be isolated. A single misconfiguration can leak data across tenants, violating security, compliance, and trust.

### RATIONALE

Every tenant-scoped model has a `workspaceId` field. Composite unique constraints include `workspaceId` to prevent cross-tenant ID collisions. Prisma middleware automatically filters by workspace context. PostgreSQL Row-Level Security (RLS) provides a defense-in-depth layer.

### workspace_id on All Tenant Models

```prisma
model projects {
  id          String    @id @default(uuid())
  workspaceId String    @map("workspace_id")
  name        String

  workspace   workspaces @relation(fields: [workspaceId], references: [id])
}
```

### Composite Unique with workspace_id

```prisma
model project_members {
  id          String @id @default(uuid())
  workspaceId String @map("workspace_id")
  projectId   String @map("project_id")
  userId      String @map("user_id")

  @@unique([workspaceId, projectId, userId])
}
```

### Prisma Middleware for Auto-Filtering

```typescript
// apps/api/src/common/prisma/prisma-middleware.ts
export function workspaceFilterMiddleware(
  prisma: PrismaClient,
  req: FastifyRequest,
): void {
  const workspaceId = req.user?.wsid;

  if (!workspaceId) return;

  prisma.$use(async (params, next) => {
    // Skip non-tenant models
    const exemptModels = ['users', 'roles', 'permissions', 'system_settings'];
    if (exemptModels.includes(params.model as string)) return next(params);

    // Add workspaceId filter to find/findFirst/findMany
    if (params.action.startsWith('find')) {
      params.args.where = {
        ...params.args.where,
        workspaceId,
      };
    }

    return next(params);
  });
}
```

### RLS as Defense in Depth

```sql
-- Enable RLS on tenant-scoped tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see projects in their workspace
CREATE POLICY tenant_isolation ON projects
  FOR ALL
  USING (workspace_id = current_setting('app.workspace_id')::uuid);
```

**GOOD example:**
```prisma
model knowledge {
  id          String @id @default(uuid())
  workspaceId String @map("workspace_id")
  slug        String @unique

  @@unique([workspaceId, slug])
  @@index([workspaceId])
}
```

**BAD example:**
```prisma
// No workspaceId on tenant model
model projects {
  id   String @id @default(uuid())
  name String
}
```

---

## 6. Soft Delete

### WHY

Hard-deleting records destroys data that may be needed for audit, recovery, or historical analysis. Soft delete preserves data while making it invisible to normal queries.

### RATIONALE

Soft delete uses a `deletedAt` nullable timestamp field. Non-null value = deleted. Prisma middleware or query filters exclude soft-deleted records. Cascade behavior varies by relationship. Data retention periods are defined per domain.

### Soft Delete vs Hard Delete Decision Tree

```mermaid
flowchart TD
    A[Delete request] --> B{Legal hold or audit required?}
    B -->|Yes| C[Soft delete]
    B -->|No| D{Data needed for<br/>historical integrity?}
    D -->|Yes| E{Data size growth<br/>acceptable?}
    D -->|No| F[Hard delete]
    E -->|Yes| C
    E -->|No| F
    C --> G[Set deletedAt = now()]
    F --> H[DELETE FROM table]
    G --> I{Has child records?}
    I -->|Yes| J[Cascade or SetNull per relation]
    I -->|No| K[Done]
```

### deletedAt Field Convention

```prisma
model projects {
  deletedAt DateTime? @map("deleted_at")
}
```

### Filtering Soft-Deleted Records

```typescript
// Automatically exclude soft-deleted records
prisma.$use(async (params, next) => {
  if (params.action.startsWith('find') && params.model !== 'users') {
    params.args.where = {
      ...params.args.where,
      deletedAt: null,
    };
  }
  return next(params);
});
```

### Cascade Behavior

| Relation | onDelete | Rationale |
|----------|----------|-----------|
| User → Sessions | Cascade | User deleted → all sessions invalid |
| Workspace → Members | Cascade | Workspace deleted → member records gone |
| Project → Notes | Cascade | Notes don't exist without project |
| Knowledge → Comments | SetNull | Keep comments visible, mark as orphaned |
| File → Versions | Cascade | File deleted → all versions gone |

### Data Retention Periods

| Entity Type | Soft Delete Duration | After That |
|-------------|---------------------|------------|
| Projects | 90 days | Hard delete + archive |
| Knowledge articles | 180 days | Hard delete + archive |
| Users | 30 days | Anonymize |
| Files | 30 days | Delete from storage |
| Audit logs | Never hard delete | Permanent |

**GOOD example:**
```prisma
model projects {
  deletedAt DateTime? @map("deleted_at")

  @@index([deletedAt])
}
```

**BAD example:**
```prisma
// Hard delete without consideration
async delete(id: string) {
  await prisma.project.delete({ where: { id } });
}
```

---

## 7. Audit Fields

### WHY

Knowing who created or modified a record and when is essential for auditing, debugging, and compliance. Without audit fields, investigating data changes requires digging through application logs.

### RATIONALE

Every model has `createdAt`, `updatedAt`, `createdBy`, and `updatedBy` fields. `createdAt` and `updatedAt` are managed by Prisma. `createdBy` and `updatedBy` are populated by middleware from the authenticated user context. Once set, audit trail fields are immutable.

### Field Convention

```prisma
model projects {
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdBy String   @map("created_by")
  updatedBy String?  @map("updated_by")
}
```

### Automatic Population

```typescript
// apps/api/src/common/prisma/audit-middleware.ts
export function auditMiddleware(prisma: PrismaClient, userId: string): void {
  prisma.$use(async (params, next) => {
    if (params.action === 'create') {
      params.args.data.createdBy = userId;
      params.args.data.updatedBy = userId;
    }

    if (params.action === 'update') {
      params.args.data.updatedBy = userId;
    }

    return next(params);
  });
}
```

### Immutable Audit Trail

```typescript
// Prevent overwriting createdAt
prisma.$use(async (params, next) => {
  if (params.action === 'update' && params.args.data?.createdAt) {
    delete params.args.data.createdAt; // Silently ignore
  }
  return next(params);
});
```

**GOOD example:**
```prisma
model projects {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  createdBy String    @map("created_by")
  updatedBy String?   @map("updated_by")
}
```

**BAD example:**
```prisma
// Missing audit fields
model projects {
  id   String @id @default(uuid())
  name String
}
```

---

## 8. Transactions

### WHY

Multi-step operations that span multiple models must be atomic. If one step fails, all changes must be rolled back. Transactions enforce this atomicity.

### RATIONALE

Prisma's `$transaction` API provides atomic operations. Nested writes (creating a record with related records) are preferred when possible. Explicit transactions are used for operations spanning unrelated models. Isolation level is `ReadCommitted` (PostgreSQL default). Timeout prevents long-running transactions from blocking other operations.

### When to Use Transactions

| Scenario | Transaction Type | Example |
|----------|-----------------|---------|
| Create nested entity | Interactive | Create project + member + default note |
| Update multiple independent models | Interactive | Update project + update calculation status |
| Bulk operations | Iterative | Bulk-create knowledge tags |
| Financial operations | Interactive | Create invoice + create payment + update subscription |
| Compare-and-swap | Interactive | Update with version check |

### Transaction Implementation

```typescript
// Interactive transaction
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({
    data: { name, workspaceId, createdBy: userId },
  });

  await tx.projectMember.create({
    data: { projectId: project.id, userId, role: 'ADMIN' },
  });

  await tx.auditLog.create({
    data: {
      workspaceId,
      action: 'project.created',
      entity: 'project',
      entityId: project.id,
    },
  });

  return project;
});
```

### Transaction Isolation Level

```prisma
// PostgreSQL default: ReadCommitted
// Use Serializable only when absolutely necessary
await prisma.$transaction(
  async (tx) => { ... },
  { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
);
```

### Transaction Timeout

```typescript
await prisma.$transaction(
  async (tx) => { ... },
  { timeout: 10000 }, // 10 seconds
);
```

### Retry on Serialization Failure

```typescript
async function withRetry<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034') { // Serialization failure
        continue;
      }
      throw error;
    }
  }
  throw new Error('Transaction failed after max retries');
}
```

**GOOD example:**
```typescript
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({ data });
  await tx.projectMember.create({ data: { ... } });
});
```

**BAD example:**
```typescript
// Multiple separate queries without transaction
const project = await prisma.project.create({ data });
const member = await prisma.projectMember.create({ data: { ... } });
// If member creation fails, project is orphaned
```

---

## 9. Optimistic Locking

### WHY

Concurrent updates to the same record can cause lost updates (last writer wins). Optimistic locking detects conflicts and forces the client to retry with fresh data.

### RATIONALE

We use a `version` integer field for optimistic locking. The `@updatedAt` timestamp also changes on every update and can be used for CAS (compare-and-swap) patterns. Prisma's `updatedAt` is automatically managed.

### Version Field

```prisma
model calculations {
  version Int @default(1)
}
```

### CAS (Compare-and-Swap) Pattern

```typescript
async function updateCalculation(
  id: string,
  data: UpdateCalculationDto,
  expectedVersion: number,
): Promise<Calculation> {
  try {
    return await prisma.calculation.update({
      where: {
        id,
        version: expectedVersion, // CAS condition
      },
      data: {
        ...data,
        version: expectedVersion + 1,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025') { // Record not found
      throw new ConflictException('Calculation was modified by another request');
    }
    throw error;
  }
}
```

### Using @updatedAt for CAS

```typescript
async function updateProject(
  id: string,
  data: UpdateProjectDto,
  lastUpdatedAt: Date,
): Promise<Project> {
  return prisma.project.update({
    where: {
      id,
      updatedAt: lastUpdatedAt,
    },
    data,
  });
}
```

**GOOD example:**
```typescript
@Patch(':id')
async update(
  @Param('id') id: string,
  @Body() dto: UpdateCalculationDto,
  @Headers('if-match') ifMatch?: string,
) {
  const expectedVersion = parseInt(ifMatch ?? '0', 10);

  try {
    const result = await this.service.update(id, dto, expectedVersion);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ConflictException) {
      throw new PreconditionFailedException({
        success: false,
        error: {
          code: 'COMMON_CONCURRENT_MODIFICATION',
          message: 'Resource was modified. Please refresh and retry.',
        },
      });
    }
    throw error;
  }
}
```

**BAD example:**
```typescript
// Blind update — last writer wins, no conflict detection
async update(id: string, data: any) {
  return prisma.project.update({ where: { id }, data });
}
```

---

## 10. Naming Conventions

### WHY

Consistent naming across all database objects makes the schema predictable. Developers, DBAs, and tools can infer meaning from names without looking up definitions.

### RATIONALE

Tables are snake_case, plural. Columns are snake_case. Indexes, foreign keys, and constraints follow established naming patterns. Enums follow Prisma conventions.

### Table Naming

| Convention | Example |
|------------|---------|
| Snake case, plural | `users`, `projects`, `workspace_members`, `knowledge_versions` |
| Join tables | `role_permissions`, `knowledge_taxonomy` |
| Junction tables | `user_roles` |

### Column Naming

| Convention | Example |
|------------|---------|
| Snake case | `first_name`, `created_at`, `workspace_id` |
| Boolean prefixes | `is_active`, `is_deleted`, `has_mfa` |
| Timestamp suffixes | `_at`: `created_at`, `updated_at`, `deleted_at`, `reviewed_at` |
| Date suffixes | `_on`: `verified_on` (less common, prefer _at) |
| Count suffixes | `_count`: `page_count`, `chunk_count` |

### Naming Rules

```prisma
// GOOD
model workspace_members {
  workspaceId String @map("workspace_id")
  userId      String @map("user_id")
  joinedAt    DateTime @default(now()) @map("joined_at")
}

// BAD — mixed conventions
model WorkspaceMembers {
  workspaceId String
  joined_at   DateTime
}
```

### Foreign Key Naming

Foreign key columns follow the pattern `{referenced_table_singular}_id`:

| Column | References |
|--------|------------|
| `workspace_id` | `workspaces.id` |
| `user_id` | `users.id` |
| `project_id` | `projects.id` |
| `knowledge_id` | `knowledge.id` |

### Constraint Naming

| Constraint Type | Pattern | Example |
|-----------------|---------|---------|
| Primary key | `{table}_pkey` | `users_pkey` |
| Unique | `{table}_{column}_key` | `users_email_key` |
| Foreign key | `{table}_{column}_fkey` | `projects_workspace_id_fkey` |
| Index | `idx_{table}_{column}` | `idx_projects_status` |

### Enum Naming

Prisma does not natively support PostgreSQL enums. We use `String` fields with validation:

```prisma
model projects {
  status String @default("active")
}
```

When PostgreSQL enums are needed, they are named `{Domain}_{Name}`:

```sql
CREATE TYPE project_status AS ENUM ('active', 'archived', 'cancelled');
```

**GOOD example:**
```prisma
model knowledge_comments {
  @@map("knowledge_comments")
}
```

**BAD example:**
```prisma
model KnowledgeComments {
  // Prisma default table name: KnowledgeComments
}
```

---

## 11. Foreign Keys

### WHY

Foreign keys enforce referential integrity at the database level. Without them, orphaned records accumulate and data consistency degrades. Explicit `onDelete` behavior prevents unexpected data loss.

### RATIONALE

Every foreign key is backed by a Prisma relation with an explicit `onDelete` policy. Cascade is used for owned relationships (parent owns child). SetNull is used for optional references where the child should survive the parent's deletion. Circular foreign keys are prevented by design.

### Cascading Behavior Policy

| onDelete Value | When to Use |
|----------------|-------------|
| `Cascade` | Child records are owned by parent and have no meaning without it (e.g., project → notes, user → sessions) |
| `SetNull` | Child records can exist without parent, but reference should be cleared (e.g., knowledge → reviewer) |
| `Restrict` | Prevent deletion if child records exist (use sparingly) |
| `NoAction` | Application-level cascade (avoid — prefer database-level) |

```prisma
model project_notes {
  project   projects  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  author    users     @relation(fields: [createdBy], references: [id])  // No cascade — never delete user
}
```

### Referential Integrity

```prisma
// Every FK must have a corresponding @relation
model projects {
  workspace   workspaces @relation(fields: [workspaceId], references: [id])
}
```

### Circular FK Prevention

Circular foreign keys are NOT allowed. If two models reference each other, one reference must be optional:

```prisma
// BAD — circular required references
model a { bId String; b B @relation(fields: [bId], refs: [id]) }
model b { aId String; a A @relation(fields: [aId], refs: [id]) }

// GOOD — one side optional
model a { bId String?; b B? @relation(fields: [bId], refs: [id]) }
model b { aId String; a A @relation(fields: [aId], refs: [id]) }
```

**GOOD example:**
```prisma
model workspace_members {
  workspace workspaces @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      users      @relation(fields: [userId], references: [id])
}
```

**BAD example:**
```prisma
// Missing onDelete policy — Prisma defaults to NoAction
model project_notes {
  project projects @relation(fields: [projectId], references: [id])
  // onDelete: Cascade should be here
}
```

---

## 12. Vector Storage

### WHY

Vector embeddings enable semantic search, similarity matching, and AI-powered retrieval. Qdrant is our vector database for storing and querying embeddings generated from knowledge articles, documents, and engineering content.

### RATIONALE

Qdrant runs as a standalone service (→ `workspace/docker-compose.yml`). Embeddings are generated by the AI service and stored with a payload schema that mirrors domain metadata. Collection names follow a naming convention. Index configuration balances search speed with accuracy.

### Qdrant Integration Pattern

```python
# workspace/services/ai-service/src/vector_store/qdrant_client.py
from qdrant_client import QdrantClient
from qdrant_client.http import models

class VectorStore:
    def __init__(self, host: str, port: int, api_key: str):
        self.client = QdrantClient(host=host, port=port, api_key=api_key)

    def upsert_embedding(
        self,
        collection: str,
        point_id: str,
        vector: list[float],
        payload: dict,
    ):
        self.client.upsert(
            collection_name=collection,
            points=[
                models.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload=payload,
                )
            ],
        )
```

### Embedding Dimensions

| Model | Dimensions | Use Case |
|-------|-----------|----------|
| `text-embedding-3-small` | 1536 | General knowledge embedding |
| `text-embedding-3-large` | 3072 | High-accuracy knowledge embedding |
| Custom engineering model | 768 | Engineering calculation embeddings |

### Payload Schema

```json
{
  "knowledge_id": "uuid",
  "workspace_id": "uuid",
  "title": "string",
  "language": "string",
  "content_type": "string",
  "chunk_index": "integer",
  "chunk_count": "integer",
  "status": "string",
  "created_at": "datetime"
}
```

### Collection Naming

```
{domain}_{environment}_{version}

Examples:
knowledge_production_v1
documents_staging_v1
calculations_development_v1
```

### Index Configuration

```python
self.client.create_collection(
    collection_name="knowledge_production_v1",
    vectors_config=models.VectorParams(
        size=1536,
        distance=models.Distance.COSINE,
    ),
    optimizers_config=models.OptimizersConfigDiff(
        indexing_threshold=10000,
    ),
)
```

| Parameter | Default | Notes |
|-----------|---------|-------|
| `distance` | `COSINE` | Best for text embeddings |
| `indexing_threshold` | 10000 | Index after 10000 points |
| `hnsw_config.m` | 16 | HNSW graph connections |
| `hnsw_config.ef_construct` | 100 | HNSW construction time/accuracy trade-off |

**GOOD example:**
```python
self.client.create_collection(
    collection_name="documents_production_v1",
    vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE),
)
```

**BAD example:**
```python
# Collection name inconsistency
self.client.create_collection(collection_name="my-docs")
# No payload schema defined
```

---

## 13. Knowledge Storage

### WHY

The Knowledge Platform (EKO — Engineering Knowledge Objects) requires specialized storage patterns beyond simple CRUD. Version history, concept relationships, graph traversal, and full-text search all demand deliberate schema design.

### RATIONALE

EKO storage uses a main `knowledge` table with version snapshots in `knowledge_versions`. Concept relationships are stored in `knowledge_taxonomy` with polymorphic associations. Graph traversal uses recursive CTEs. Full-text search uses PostgreSQL `tsvector` with a `search_text` column.

### EKO Storage Pattern

```prisma
model knowledge {
  id          String   @id @default(uuid())
  workspaceId String   @map("workspace_id")
  slug        String   @unique
  version     Int      @default(1)
  status      String   @default("draft")
  content     Json     @default("{}")
  searchText  String?  @map("search_text")
}

model knowledge_versions {
  id          String   @id @default(uuid())
  knowledgeId String   @map("knowledge_id")
  version     Int
  snapshot    Json     // Full content copy at version point
  comment     String?
  createdBy   String?  @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")

  knowledge   knowledge @relation(fields: [knowledgeId], references: [id], onDelete: Cascade)

  @@unique([knowledgeId, version])
}
```

### Version Tables

```prisma
// Each domain object that needs versioning follows the same pattern:
// 1. Main table with `version` counter
// 2. Version table with full JSON snapshot

// knowledge_versions stores every published version
// Snapshot includes: content, taxonomy, media, formulas, examples
```

### Concept Relationship Tables

```prisma
model knowledge_taxonomy {
  id            String @id @default(uuid())
  knowledgeId   String @map("knowledge_id")
  taxonomyType  String @map("taxonomy_type") // category | topic | tag | discipline | audience
  taxonomyId    String @map("taxonomy_id")

  knowledge     knowledge @relation(fields: [knowledgeId], references: [id], onDelete: Cascade)

  @@unique([knowledgeId, taxonomyType, taxonomyId])
}
```

### Graph Traversal Indexes

```prisma
model categories {
  id       String      @id @default(uuid())
  parentId String?     @map("parent_id")

  parent   categories?  @relation("CategoryTree", fields: [parentId], references: [id])
  children categories[] @relation("CategoryTree")

  @@index([parentId])  // Critical for tree traversal
}
```

### Full-Text Search Configuration

```sql
-- Migration SQL for full-text search
ALTER TABLE knowledge ADD COLUMN search_text tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(content->>'title', ''))
  ) STORED;

CREATE INDEX idx_knowledge_search_text ON knowledge USING GIN(search_text);
```

Alternatively, using Prisma:

```prisma
model knowledge {
  searchText String? @map("search_text") // Populated by application layer
}
```

```typescript
// apps/api/src/knowledge/knowledge.service.ts
async search(query: string, workspaceId: string) {
  return this.prisma.knowledge.findMany({
    where: {
      workspaceId,
      searchText: { contains: query, mode: 'insensitive' },
    },
  });
}
```

**GOOD example:**
```prisma
model knowledge_versions {
  knowledgeId String  @map("knowledge_id")
  version     Int
  snapshot    Json    // Full copy for audit/history

  @@unique([knowledgeId, version])
}
```

**BAD example:**
```prisma
// No versioning — overwrite content directly
model knowledge {
  content Json // Previous versions lost forever
}
```

---

## 14. Schema Evolution

### WHY

Database schema evolves with the application. Uncontrolled schema changes cause downtime, data loss, and application errors. A deliberate evolution strategy ensures safe, zero-downtime changes.

### RATIONALE

Every schema change follows an expand/contract pattern where applicable. Adding columns is safe when nullable. Removing columns requires a deprecation phase. Renaming uses a three-phase migration. Data migrations are separated from schema migrations.

### Adding Columns (Nullable First)

```prisma
// Phase 1: Add as nullable
model projects {
  priority String? @default(null) @map("priority")
}

// Phase 2: Backfill data
// (separate data migration script)

// Phase 3: Make non-nullable (if needed)
model projects {
  priority String @default("medium") @map("priority")
}
```

### Removing Columns (Deprecate First)

```prisma
// Phase 1: Deprecate in code — stop all writes to column
// Phase 2: Ensure no code reads the column
// Phase 3: Remove from schema after confirming zero usage
// Option: Annotate with comment before removal
@Deprecated("Use fullName instead. Remove in v3.")
firstName String @map("first_name")
```

### Renaming (Add New + Migrate Data + Drop Old)

```prisma
// Phase 1: Add new column
model projects {
  fullName String? @map("full_name")
}

// Phase 2: Dual-write to both columns
// Phase 3: Backfill data
// Phase 4: Stop writing to old column
// Phase 5: Remove old column
```

### Data Migrations

Data migrations are separate scripts, NOT part of schema migrations:

```typescript
// prisma/seed/backfill-priority.ts
async function backfillPriority(prisma: PrismaClient) {
  const projects = await prisma.project.findMany({
    where: { priority: null },
  });

  for (const project of projects) {
    await prisma.project.update({
      where: { id: project.id },
      data: { priority: 'medium' },
    });
  }

  console.log(`Backfilled ${projects.length} projects`);
}
```

**GOOD example:**
```prisma
// Schema evolution: adding priority field
// Step 1: Add nullable (shipped)
model projects {
  priority String? @map("priority")
}

// Step 2: Backfill (separate script)
// Step 3: Make required (next release)
model projects {
  priority String @default("medium") @map("priority")
}
```

**BAD example:**
```prisma
// Dropping a column without deprecation
// Renaming without dual-write phase
// Schema and data changes in the same migration
```

---

## 15. Connection Management

### WHY

Database connections are a finite resource. Mismanagement leads to connection pool exhaustion, query queuing, and service degradation. Proper connection management ensures the database operates within safe limits.

### RATIONALE

PgBouncer provides connection pooling between services and PostgreSQL. Prisma uses a configurable connection pool per service. Pool sizing follows the formula `(connections_per_instance * instance_count) + buffer`. Connection strings are managed through environment variables.

### PgBouncer Integration

```ini
# infrastructure/docker/compose/base/pgbouncer.ini
[databases]
xennic = host=postgres port=5432 dbname=xennic

[pgbouncer]
pool_mode = transaction
max_client_conn = 200
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 5
server_idle_timeout = 600
```

### Connection Limits

| Service | Max Connections | Pool Size | Pool Mode |
|---------|----------------|-----------|-----------|
| API (NestJS) | 20 | 10-20 | Transaction |
| Engineering (FastAPI) | 10 | 5-10 | Transaction |
| AI (FastAPI) | 5 | 3-5 | Transaction |
| Vision (FastAPI) | 5 | 3-5 | Transaction |
| Admin tools | 5 | 2-5 | Session |
| Migrations | 1 | 1 | Session |

### Pool Sizing

```
Total connections = (pool_size × app_instances) + admin_buffer

Example:
API: pool_size=15, instances=3 → 45 connections
Engineering: pool_size=8, instances=2 → 16 connections
Admin buffer: 10 connections
Total: 71 connections

PostgreSQL max_connections should be: total × 1.5 = ~107
PgBouncer default_pool_size: total = 71
```

### Connection String Format

```
# Direct connection (for migrations/admin)
DATABASE_URL=postgresql://user:password@postgres:5432/xennic

# Pooled connection (via PgBouncer — for applications)
DATABASE_URL=postgresql://user:password@pgbouncer:6432/xennic

# With query parameters
DATABASE_URL=postgresql://user:password@pgbouncer:6432/xennic?schema=public&connection_limit=15
```

### Prisma Connection Configuration

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // connection_limit is set in DATABASE_URL query parameter
}
```

```typescript
// apps/api/src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**GOOD example:**
```env
DATABASE_URL=postgresql://xennic:password@pgbouncer:6432/xennic?connection_limit=15
```

**BAD example:**
```env
# Direct connection without pooling — each instance opens N connections
DATABASE_URL=postgresql://xennic:password@postgres:5432/xennic
```

---

## Cross-References

| Document | Relevance |
|----------|-----------|
| → prisma/schema.prisma | Full Prisma schema (single source of truth) |
| → docs/decisions/ADR-007-database-migration-strategy.md | Migration decision record |
| → docs/engineering-constitution/02-coding-standards.md §6 | Prisma coding standards |
| → docs/engineering-constitution/04-api-standards.md | API standards (filtering, pagination affecting queries) |
| → docs/engineering-constitution/06-security-standards.md | Data security, encryption at rest |
| → docs/engineering-constitution/08-observability-standards.md | Database monitoring, slow query alerts |
| → [CODE] apps/api/src/prisma/ | Prisma service and middleware implementation |
