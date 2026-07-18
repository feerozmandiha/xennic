# DATABASE INVENTORY

**Date:** 2026-07-02
**Verified from:** `prisma/schema.prisma` (1,170 lines)

---

## Schema

| Attribute          | Value            |
| ------------------ | ---------------- |
| Total models       | 61               |
| Enums              | 0                |
| Index declarations | 118              |
| Unique constraints | 8                |
| Field unique       | 17               |
| Datasource         | PostgreSQL       |
| Generator          | prisma-client-js |
| Client version     | 6.19.3           |

## Domain → Model Mapping

| Domain        | Count | Models                                                                                                                                                                                                                                            |
| ------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity/Auth | 8     | users, sessions, refresh_tokens, password_reset_tokens, roles, permissions, role_permissions, user_roles                                                                                                                                          |
| Workspace     | 4     | workspaces, workspace_members, workspace_invitations, workspace_settings                                                                                                                                                                          |
| Billing       | 8     | plans, subscriptions, usage_logs, invoices, payments, transactions, payment_methods, subscription_payments                                                                                                                                        |
| Projects      | 4     | projects, project_members, project_notes, project_reports                                                                                                                                                                                         |
| Engineering   | 3     | calculations, calculation_templates, engineering_standards                                                                                                                                                                                        |
| AI            | 4     | agents, conversations, messages, ai_usage                                                                                                                                                                                                         |
| Knowledge     | 13    | knowledge, knowledge_translations, knowledge_taxonomy, knowledge_media, knowledge_formulas, knowledge_examples, knowledge_standards, knowledge_versions, knowledge_comments, knowledge_workflows, knowledge_workflow_history, knowledge_analytics |
| Taxonomy      | 5     | categories, topics, tags, disciplines, audiences                                                                                                                                                                                                  |
| Marketplace   | 5     | vendors, products, product_translations, orders, order_items                                                                                                                                                                                      |
| Storage       | 2     | files, file_versions                                                                                                                                                                                                                              |
| API           | 2     | api_keys, webhooks                                                                                                                                                                                                                                |
| Notifications | 1     | notifications                                                                                                                                                                                                                                     |
| Admin         | 3     | system_settings, feature_flags, audit_logs                                                                                                                                                                                                        |

## Migrations (4)

| #   | Name                                        | Lines | Content                                  |
| --- | ------------------------------------------- | ----- | ---------------------------------------- |
| 1   | `20260602080333_init`                       | 817   | 45 initial tables                        |
| 2   | `20260617074611_knowledge_system_phase1`    | 1,624 | UUID→TEXT migration, 17 knowledge tables |
| 3   | `20260617080956_add_knowledge_workspace_id` | 14    | workspace_id FK on knowledge             |
| 4   | `20260618000000_add_search_text_fts`        | 7     | GIN full-text search index               |

## Seed Data (`prisma/seed.js`, 502 lines CJS)

| Entity                | Records   |
| --------------------- | --------- |
| Plans                 | 3         |
| Roles                 | 12        |
| Permissions           | 57        |
| Engineering Standards | 15        |
| AI Agents             | 7         |
| Users                 | 1 (admin) |
| Workspaces            | 1         |
| Vendors               | 7         |
| Products              | 33        |
| Product Translations  | 33        |

## Tenant Isolation

`packages/database/src/tenant-extension.ts` — Prisma extension auto-injects `workspace_id` on 26 models for all operations except `findUnique`.
