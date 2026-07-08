# 04 — Database Audit

**Date:** 2026-07-02

---

## 4.1 Schema Overview

| Metric | Value |
|--------|-------|
| **Total models** | 61 |
| **Enums** | 0 (all statuses use string fields) |
| **Schema file** | `prisma/schema.prisma`, 1,170 lines |
| **Datasource** | PostgreSQL |
| **Generator** | `prisma-client-js` |
| **Client version** | 6.19.3 |

---

## 4.2 Complete Model List

### Auth & Identity (9 models)
| Model | Key Fields | Relations |
|-------|-----------|-----------|
| `users` | id, email, password_hash, full_name, is_active | → user_roles, sessions, refresh_tokens, workspace_members |
| `roles` | id, name, slug, description | → user_roles, role_permissions |
| `permissions` | id, name, slug, resource, action, module | → role_permissions |
| `user_roles` | user_id, role_id, workspace_id | → users, roles, workspaces |
| `role_permissions` | role_id, permission_id, workspace_id | → roles, permissions |
| `refresh_tokens` | id, token, user_id, expires_at | → users |
| `sessions` | id, user_id, token, expires_at, ip_address | → users |
| `password_reset_tokens` | id, email, token, expires_at | standalone |
| `audiences` | id, name | standalone |

### Tenancy & Workspace (6 models)
| Model | Key Fields | Relations |
|-------|-----------|-----------|
| `workspaces` | id, name, slug, is_active | → workspace_members, workspace_settings, all tenant entities |
| `workspace_settings` | workspace_id, business_type, default_currency | → workspaces |
| `workspace_members` | user_id, workspace_id, role | → users, workspaces |
| `workspace_invitations` | email, workspace_id, token, status | → workspaces |
| `system_settings` | key, value, description | standalone |
| `audit_logs` | workspace_id, user_id, action, entity_type, entity_id, metadata | → workspaces, users |

### Subscription & Billing (5 models)
| Model | Key Fields |
|-------|-----------|
| `plans` | id, name, slug, price, currency, interval, features |
| `subscriptions` | workspace_id, plan_id, status, current_period_start, current_period_end |
| `subscription_payments` | subscription_id, amount, currency, status, payment_method |
| `invoices` | subscription_id, number, amount, status, due_date, paid_at |
| `transactions` | workspace_id, type, amount, currency, status, description |

### Projects (4 models)
| Model | Key Fields |
|-------|-----------|
| `projects` | workspace_id, name, slug, status, description, metadata |
| `project_members` | project_id, user_id, role |
| `project_notes` | project_id, title, content, created_by |
| `project_reports` | project_id, title, type, file_url, generated_by |

### Knowledge (13 models)
| Model | Key Fields |
|-------|-----------|
| `knowledge` | workspace_id, title, content, status, category_id, author_id, version |
| `knowledge_versions` | knowledge_id, version, content, change_summary |
| `knowledge_analytics` | knowledge_id, views, searches, avg_reading_time |
| `knowledge_comments` | knowledge_id, content, author_id |
| `knowledge_examples` | knowledge_id, title, content |
| `knowledge_formulas` | knowledge_id, name, formula, description |
| `knowledge_media` | knowledge_id, file_type, file_url, caption |
| `knowledge_standards` | knowledge_id, standard_id |
| `knowledge_taxonomy` | knowledge_id, taxonomy_id |
| `knowledge_translations` | knowledge_id, locale, title, content |
| `knowledge_workflows` | knowledge_id, status, assigned_to, due_date |
| `knowledge_workflow_history` | workflow_id, from_status, to_status, changed_by |
| `categories` | workspace_id, name, slug, parent_id |

### Engineering (5 models)
| Model | Key Fields |
|-------|-----------|
| `calculations` | workspace_id, project_id, type, status, input, output |
| `calculation_templates` | name, type, category, default_input |
| `engineering_standards` | workspace_id, name, code, description, type, jurisdiction |
| `disciplines` | name, slug, description |
| `topics` | discipline_id, name, slug, description |

### Marketplace (6 models)
| Model | Key Fields |
|-------|-----------|
| `products` | vendor_id, name, slug, price, category, specifications |
| `product_translations` | product_id, locale, name, description |
| `vendors` | name, slug, country, is_active |
| `orders` | workspace_id, vendor_id, status, total_amount |
| `order_items` | order_id, product_id, quantity, unit_price |
| `tags` | name, slug |

### AI & ML (5 models)
| Model | Key Fields |
|-------|-----------|
| `conversations` | workspace_id, user_id, title, agent_type, metadata |
| `messages` | conversation_id, role, content, metadata, tokens_used |
| `agents` | name, slug, description, model, system_prompt, capabilities |
| `ai_usage` | workspace_id, model, tokens_in, tokens_out, cost, duration_ms |
| `usage_logs` | workspace_id, user_id, action, resource, metadata, ip_address |

### Notifications (1 model)
| Model | Key Fields |
|-------|-----------|
| `notifications` | workspace_id, user_id, type, title, content, is_read, metadata |

### Webhooks & API (2 models)
| Model | Key Fields |
|-------|-----------|
| `webhooks` | workspace_id, name, url, secret, events, is_active |
| `api_keys` | workspace_id, name, key_hash, permissions, expires_at, is_active |

### Feature Flags (1 model)
| Model | Key Fields |
|-------|-----------|
| `feature_flags` | workspace_id, key, name, description, enabled, rules |

### File Storage (2 models)
| Model | Key Fields |
|-------|-----------|
| `files` | workspace_id, name, mime_type, size, storage_path, provider |
| `file_versions` | file_id, version_number, size, storage_path |

### Communication (1 model)
| Model | Key Fields |
|-------|-----------|
| `notifications` | (listed above) |

### Payment (2 models)
| Model | Key Fields |
|-------|-----------|
| `payment_methods` | workspace_id, type, provider, details, is_default |
| `payments` | workspace_id, amount, currency, status, payment_method_id |

---

## 4.3 Key Conventions

| Convention | Implementation |
|------------|---------------|
| **IDs** | UUID (CUID2) via `@default(cuid())` |
| **Multi-tenancy** | `workspace_id` on all tenant-scoped models |
| **Timestamps** | `created_at` `@default(now())`, `updated_at` `@updatedAt` |
| **Soft delete** | `deleted_at` on some models |
| **Indexes** | Composite `(workspace_id, created_at)`, unique slugs |
| **Naming** | snake_case columns, plural table names |

---

## 4.4 Migrations

| # | Migration | Applied | Description |
|---|-----------|---------|-------------|
| 1 | `20250301000001_init` | ✅ | Initial 61-model schema |
| 2 | `20250301000002_add_workspace_settings` | ✅ | Workspace settings |
| 3 | `20250301000003_add_audit_log` | ✅ | Audit logging |
| 4 | `20250301000004_add_workspace_members` | ✅ | Workspace membership |

**All 61 models created in a single initial migration.** Subsequent migrations add specific tables. No migration conflicts detected.

---

## 4.5 Seed Data (`prisma/seed.js`)

| Entity | Count | Details |
|--------|-------|---------|
| Subscription plans | 3 | free, professional, enterprise |
| Roles | 12 | owner, admin, super_admin, engineer, viewer, 7 enterprise roles |
| Permissions | 60+ | Granular CRUD per module |
| Engineering standards | 15 | IEC, IEEE, NEC, BS, DIN, ISIRI, etc. |
| AI agents | 7 | Calculations Expert, Standards Expert, etc. |
| Admin user | 1 | admin@xennic.com |
| Default workspace | 1 | Default Organization |
| Vendors | 7 | Electrical equipment vendors |
| Products | 40+ | Vendor products with specifications |

**Seed execution:** CJS (`require`), run via `node prisma/seed.js`.

---

## 4.6 Potential Issues

| Issue | Severity | Details |
|-------|----------|---------|
| No enums | Low | All status fields are strings — no DB-level validation |
| Single migration for all models | Medium | `init` migration is monolithic; hard to roll back partially |
| Raw SQL in SuperAdminGuard | Low | `prisma.$queryRaw` instead of type-safe Prisma API |
| Missing indexes on foreign keys | Low | Some FKs may lack explicit indexes |
| No migration for `fix-plan-features.js` | Low | Standalone script, not tracked as migration |
