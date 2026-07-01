# XENNIC_DATABASE_SPEC_v2

Version: 2.0

Status: Approved

Date: 2026-05-30

---

# Database Engine

PostgreSQL 17

---

# ORM

Prisma ORM

Migration:

Prisma Migrate

Seed:

Prisma Seed

Schema Location:

apps/api/prisma/schema.prisma

---

# Design Principles

- Multi-Tenant First
- UUIDv7 Primary Keys
- Soft Delete Support
- Auditability
- Domain Driven Design
- CQRS Ready
- Event Driven Ready
- Horizontal Scaling Ready

---

# Naming Convention

Tables:

snake_case

Columns:

snake_case

Indexes:

idx_<table>_<column>

Foreign Keys:

fk_<table>_<reference>

---

# Primary Key Strategy

Every business entity must use:

id UUID

UUID Version:

UUIDv7

Auto Increment IDs are prohibited.

---

# Standard Audit Fields

Every business table must contain:

id

created_at

updated_at

created_by

updated_by

deleted_at

---

# Tenant Isolation Strategy

Architecture:

Shared Database

Shared Schema

Tenant Column Isolation

Mandatory Column:

workspace_id UUID

Every business query must be scoped by workspace_id.

---

=========================================================
IDENTITY DOMAIN
=========================================================

# users

id

email

phone

password_hash

first_name

last_name

avatar_file_id

status

email_verified_at

last_login_at

created_at

updated_at

deleted_at

---

# sessions

id

user_id

ip_address

user_agent

expires_at

last_activity_at

created_at

---

# refresh_tokens

id

user_id

token_hash

expires_at

revoked_at

created_at

---

# roles

id

name

slug

description

---

# permissions

id

name

slug

description

---

# role_permissions

id

role_id

permission_id

---

# user_roles

id

user_id

role_id

workspace_id

---

=========================================================
WORKSPACE DOMAIN
=========================================================

# workspaces

id

name

slug

owner_id

status

created_at

updated_at

---

# workspace_members

id

workspace_id

user_id

role

joined_at

---

# workspace_invitations

id

workspace_id

email

token

expires_at

created_at

---

# workspace_settings

id

workspace_id

settings JSONB

updated_at

---

=========================================================
SUBSCRIPTION DOMAIN
=========================================================

# plans

id

name

slug

monthly_price

yearly_price

features JSONB

is_active

---

# subscriptions

id

workspace_id

plan_id

status

starts_at

ends_at

cancelled_at

---

# usage_logs

id

workspace_id

feature

amount

logged_at

---

=========================================================
BILLING DOMAIN
=========================================================

# invoices

id

workspace_id

invoice_number

status

currency

subtotal

tax_amount

total_amount

issued_at

due_at

paid_at

---

# payments

id

workspace_id

invoice_id

gateway

reference_number

amount

status

paid_at

---

# transactions

id

workspace_id

payment_id

type

amount

status

metadata JSONB

created_at

---

=========================================================
PROJECT DOMAIN
=========================================================

# projects

id

workspace_id

name

description

status

start_date

end_date

created_at

updated_at

---

# project_members

id

project_id

user_id

role

---

# project_notes

id

project_id

content

created_by

created_at

---

# project_reports

id

project_id

file_id

created_at

---

=========================================================
ENGINEERING DOMAIN
=========================================================

# calculations

id

workspace_id

project_id

user_id

type

version

inputs JSONB

results JSONB

engine_version

standard_version

created_at

---

# calculation_versions

id

calculation_id

formula_version

engine_version

standard_version

created_at

---

# calculation_templates

id

name

type

schema JSONB

created_at

---

# calculation_reports

id

calculation_id

file_id

created_at

---

=========================================================
ENGINEERING STANDARDS DOMAIN
=========================================================

# engineering_standards

id

code

title

organization

version

published_at

status

---

Examples:

IEC 60364

IEEE 519

IEC 60909

NFPA 70

NEC

VDE

ISIRI

---

=========================================================
AI DOMAIN
=========================================================

# agents

id

name

slug

version

is_active

---

# conversations

id

workspace_id

agent_id

title

created_at

updated_at

---

# messages

id

conversation_id

role

content

metadata JSONB

created_at

---

# ai_usage

id

workspace_id

user_id

agent_id

provider

model

prompt_tokens

completion_tokens

total_tokens

cost

created_at

---

=========================================================
KNOWLEDGE DOMAIN
=========================================================

# articles

id

slug

status

published_at

created_at

updated_at

---

# article_translations

id

article_id

locale

title

excerpt

content

---

# categories

id

parent_id

slug

status

---

=========================================================
MARKETPLACE DOMAIN
=========================================================

# vendors

id

name

slug

status

---

# products

id

vendor_id

type

sku

price

currency

status

created_at

updated_at

---

# product_translations

id

product_id

locale

title

description

---

# orders

id

workspace_id

user_id

status

currency

total_amount

created_at

---

# order_items

id

order_id

product_id

quantity

unit_price

total_price

---

=========================================================
STORAGE DOMAIN
=========================================================

# files

id

workspace_id

bucket

path

filename

original_name

extension

mime_type

size

checksum

uploaded_by

created_at

---

# file_versions

id

file_id

version

path

checksum

created_at

---

=========================================================
SEARCH DOMAIN
=========================================================

# search_indexes

id

entity_type

entity_id

indexed_at

status

---

=========================================================
API DOMAIN
=========================================================

# api_keys

id

workspace_id

name

key_hash

last_used_at

expires_at

created_at

---

# webhooks

id

workspace_id

url

secret

events JSONB

is_active

created_at

---

=========================================================
QUEUE DOMAIN
=========================================================

# jobs

id

queue_name

job_type

status

payload JSONB

attempts

processed_at

created_at

---

=========================================================
NOTIFICATION DOMAIN
=========================================================

# notifications

id

user_id

type

channel

title

content

status

sent_at

created_at

---

=========================================================
ADMIN DOMAIN
=========================================================

# system_settings

id

key

value

updated_at

---

# feature_flags

id

name

description

enabled

plan_id

workspace_id

created_at

---

# audit_logs

id

workspace_id

user_id

ip_address

user_agent

action

entity

entity_id

old_values JSONB

new_values JSONB

metadata JSONB

created_at

---

=========================================================
INDEX STRATEGY
=========================================================

Required Indexes:

workspace_id

created_at

updated_at

status

slug

email

user_id

project_id

calculation_id

conversation_id

---

=========================================================
JSONB POLICY
=========================================================

Allowed:

settings

features

inputs

results

metadata

events

Forbidden:

users

orders

products

projects

subscriptions

---

=========================================================
SEARCH STRATEGY
=========================================================

Engine:

Meilisearch

Indexes:

articles

products

projects

documents

calculations

---

=========================================================
VECTOR SEARCH
=========================================================

Vector Database:

Qdrant

Collections:

documents

articles

engineering_standards

calculations

ai_knowledge

Use Cases:

RAG

Document Retrieval

Semantic Search

Engineering Knowledge Base

AI Context Retrieval

---

# Data Retention

Audit Logs:

7 Years

AI Usage:

5 Years

Projects:

Unlimited

Calculations:

Unlimited

Files:

Plan Based

---

# Database Rules

- Every business entity must be auditable.
- Every tenant resource must contain workspace_id.
- Soft delete must be supported.
- Direct database changes are prohibited.
- Prisma schema is the single source of truth.
- All changes require migration files.