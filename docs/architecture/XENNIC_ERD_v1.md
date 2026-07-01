# XENNIC_ERD_v1

Version: 1.0

Status: Approved

Date: 2026-05-30

---

# Purpose

This document defines:

- Entity Relationships
- Foreign Keys
- Aggregate Roots
- Domain Boundaries
- Ownership Rules

for the Xennic Platform.

This document is the source for:

- Prisma Schema
- Database Migrations
- Repository Layer
- CQRS Design

---

# Relationship Notation

1 : 1

One To One

1 : N

One To Many

N : N

Many To Many

---

=========================================================
IDENTITY DOMAIN
=========================================================

users

1:N

sessions

users.id
→ sessions.user_id

---

users

1:N

refresh_tokens

users.id
→ refresh_tokens.user_id

---

roles

N:N

permissions

roles.id
→ role_permissions.role_id

permissions.id
→ role_permissions.permission_id

---

users

N:N

roles

users.id
→ user_roles.user_id

roles.id
→ user_roles.role_id

workspace_id required

---

=========================================================
WORKSPACE DOMAIN
=========================================================

workspaces

1:N

workspace_members

workspaces.id
→ workspace_members.workspace_id

---

users

1:N

workspace_members

users.id
→ workspace_members.user_id

---

workspaces

1:N

workspace_invitations

workspaces.id
→ workspace_invitations.workspace_id

---

workspaces

1:1

workspace_settings

workspaces.id
→ workspace_settings.workspace_id

---

=========================================================
SUBSCRIPTION DOMAIN
=========================================================

plans

1:N

subscriptions

plans.id
→ subscriptions.plan_id

---

workspaces

1:N

subscriptions

workspaces.id
→ subscriptions.workspace_id

---

workspaces

1:N

usage_logs

workspaces.id
→ usage_logs.workspace_id

---

=========================================================
BILLING DOMAIN
=========================================================

workspaces

1:N

invoices

workspaces.id
→ invoices.workspace_id

---

invoices

1:N

payments

invoices.id
→ payments.invoice_id

---

payments

1:N

transactions

payments.id
→ transactions.payment_id

---

=========================================================
PROJECT DOMAIN
=========================================================

workspaces

1:N

projects

workspaces.id
→ projects.workspace_id

---

projects

1:N

project_members

projects.id
→ project_members.project_id

---

users

1:N

project_members

users.id
→ project_members.user_id

---

projects

1:N

project_notes

projects.id
→ project_notes.project_id

---

projects

1:N

project_reports

projects.id
→ project_reports.project_id

---

=========================================================
ENGINEERING DOMAIN
=========================================================

projects

1:N

calculations

projects.id
→ calculations.project_id

---

users

1:N

calculations

users.id
→ calculations.user_id

---

workspaces

1:N

calculations

workspaces.id
→ calculations.workspace_id

---

calculations

1:N

calculation_versions

calculations.id
→ calculation_versions.calculation_id

---

calculations

1:N

calculation_reports

calculations.id
→ calculation_reports.calculation_id

---

engineering_standards

1:N

calculations

engineering_standards.code
→ calculations.standard_version

Logical Relationship

---

=========================================================
AI DOMAIN
=========================================================

agents

1:N

conversations

agents.id
→ conversations.agent_id

---

workspaces

1:N

conversations

workspaces.id
→ conversations.workspace_id

---

conversations

1:N

messages

conversations.id
→ messages.conversation_id

---

users

1:N

ai_usage

users.id
→ ai_usage.user_id

---

agents

1:N

ai_usage

agents.id
→ ai_usage.agent_id

---

workspaces

1:N

ai_usage

workspaces.id
→ ai_usage.workspace_id

---

=========================================================
KNOWLEDGE DOMAIN
=========================================================

articles

1:N

article_translations

articles.id
→ article_translations.article_id

---

categories

1:N

categories

parent_id
→ categories.id

Self Reference

---

=========================================================
MARKETPLACE DOMAIN
=========================================================

vendors

1:N

products

vendors.id
→ products.vendor_id

---

products

1:N

product_translations

products.id
→ product_translations.product_id

---

users

1:N

orders

users.id
→ orders.user_id

---

workspaces

1:N

orders

workspaces.id
→ orders.workspace_id

---

orders

1:N

order_items

orders.id
→ order_items.order_id

---

products

1:N

order_items

products.id
→ order_items.product_id

---

=========================================================
STORAGE DOMAIN
=========================================================

files

1:N

file_versions

files.id
→ file_versions.file_id

---

users

1:N

files

users.id
→ files.uploaded_by

---

workspaces

1:N

files

workspaces.id
→ files.workspace_id

---

=========================================================
API DOMAIN
=========================================================

workspaces

1:N

api_keys

workspaces.id
→ api_keys.workspace_id

---

workspaces

1:N

webhooks

workspaces.id
→ webhooks.workspace_id

---

=========================================================
NOTIFICATION DOMAIN
=========================================================

users

1:N

notifications

users.id
→ notifications.user_id

---

=========================================================
AUDIT DOMAIN
=========================================================

users

1:N

audit_logs

users.id
→ audit_logs.user_id

---

workspaces

1:N

audit_logs

workspaces.id
→ audit_logs.workspace_id

---

=========================================================
AGGREGATE ROOTS
=========================================================

Identity

Aggregate Root:

users

---

Workspace

Aggregate Root:

workspaces

---

Subscription

Aggregate Root:

subscriptions

---

Project

Aggregate Root:

projects

---

Engineering

Aggregate Root:

calculations

---

AI

Aggregate Root:

conversations

---

Marketplace

Aggregate Root:

orders

---

Storage

Aggregate Root:

files

---

Administration

Aggregate Root:

audit_logs

---

=========================================================
DOMAIN BOUNDARIES
=========================================================

Identity
↔ Workspace

Workspace
↔ Subscription

Workspace
↔ Project

Workspace
↔ Engineering

Workspace
↔ AI

Workspace
↔ Marketplace

Workspace
↔ Storage

Administration
↔ All Domains

---

=========================================================
TENANT ISOLATION RULE
=========================================================

Every business resource must belong to:

workspace_id

No cross-workspace data access is allowed.

Enforcement Layers:

- Database
- Repository
- Service
- API
- Authorization

---

=========================================================
CASCADE RULES
=========================================================

Recommended:

ON DELETE RESTRICT

For:

users
workspaces
projects
orders

---

Recommended:

ON DELETE CASCADE

For:

messages
file_versions
project_members
role_permissions

---

=========================================================
SOFT DELETE POLICY
=========================================================

Required:

users

workspaces

projects

calculations

orders

files

articles

products

---

Physical delete is prohibited
except for:

sessions

refresh_tokens

jobs

temporary files

---

# ERD Completion Status

Identity Domain           ✔
Workspace Domain          ✔
Subscription Domain       ✔
Billing Domain            ✔
Project Domain            ✔
Engineering Domain        ✔
AI Domain                 ✔
Knowledge Domain          ✔
Marketplace Domain        ✔
Storage Domain            ✔
API Domain                ✔
Notification Domain       ✔
Administration Domain     ✔

ERD Status:

Approved