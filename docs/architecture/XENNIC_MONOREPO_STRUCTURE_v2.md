# XENNIC_MONOREPO_STRUCTURE_v2

Version: 2.0

Status: Approved

Date: 2026-05-30

---

# Purpose

This document defines the official monorepo structure of the Xennic Platform.

The architecture must support:

- Multi-Tenant SaaS
- AI Platform
- Engineering Calculation Engine
- Marketplace
- Mobile Applications
- Enterprise Expansion
- Microservice Extraction

---

# Architecture Principles

- Docker First
- OpenAPI First
- API First
- Monorepo First
- Domain Driven Design
- CQRS
- Event Driven Architecture
- Type Safety Everywhere
- Security By Design
- Cloud Native Ready

---

# Monorepo Technology Stack

Package Manager:

pnpm

Build System:

TurboRepo

Language:

TypeScript

Backend:

NestJS

Frontend:

Next.js

Engineering Services:

Python + FastAPI

AI Services:

Python + FastAPI

Database:

PostgreSQL

Cache:

Redis

Search:

Meilisearch

Vector Database:

Qdrant

Object Storage:

MinIO

Monitoring:

Prometheus
Grafana
Loki
OpenTelemetry

---

# Repository Root

xennic/

├── apps/
├── packages/
├── services/
├── infrastructure/
├── docs/
├── project-management/
├── tests/
├── scripts/
├── .github/
│
├── node_modules/
│
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
└── README.md

---

# Dependency Management Rules

There must be exactly one node_modules directory.

Allowed:

/node_modules

Prohibited:

apps/*/node_modules

packages/*/node_modules

services/*/node_modules

Tool:

pnpm workspace

---

# Applications

apps/

├── web/
├── api/
├── admin/
└── docs-site/

---

# apps/web

Technology:

Next.js

Responsibilities:

- Public Website
- Workspace Dashboard
- Marketplace
- Engineering UI
- AI Chat UI
- Knowledge Base

Structure:

apps/web/

src/

app/

components/

features/

hooks/

providers/

lib/

types/

styles/

tests/

---

# apps/api

Technology:

NestJS

Responsibilities:

- Authentication
- Authorization
- API Gateway
- SaaS Core
- Business Logic

Structure:

apps/api/

src/

modules/

common/

config/

database/

events/

queues/

middlewares/

interceptors/

guards/

filters/

main.ts

---

# Prisma Layer

apps/api/

prisma/

schema.prisma

migrations/

seed.ts

---

# apps/admin

Technology:

Next.js

Purpose:

Internal Administration Platform

Responsibilities:

- Tenant Management
- Billing Management
- Monitoring
- Feature Flags
- Audit Logs

---

# apps/docs-site

Technology:

Next.js
Nextra

Purpose:

Developer Documentation

Documentation Portal

API Documentation

Engineering Documentation

---

# Services

services/

├── engineering-service/
├── ai-service/
├── worker-service/
└── notification-service/

---

# engineering-service

Technology:

Python

Framework:

FastAPI

Purpose:

Engineering Calculations

Structure:

services/engineering-service/

app/

calculators/

schemas/

models/

standards/

tests/

---

# Engineering Calculators

calculators/

basic/

cable/

transformer/

protection/

pfc/

earthing/

lighting/

solar/

power_system/

power_quality/

---

# Power Quality

power_quality/

thd/

tdd/

ieee519/

harmonic_analysis/

resonance/

passive_filter/

active_filter/

k_factor/

---

# ai-service

Technology:

Python

Framework:

FastAPI

Purpose:

AI Platform

Structure:

services/ai-service/

app/

agents/

prompts/

rag/

tools/

workflows/

tests/

---

# AI Agents

agents/

electrical_engineer/

solar_consultant/

protection_engineer/

power_quality/

researcher/

document_analyst/

drawing_analyst/

---

# worker-service

Technology:

NestJS

Purpose:

Background Processing

Responsibilities:

- Email Jobs
- PDF Generation
- Report Generation
- AI Jobs
- Search Indexing
- Scheduled Tasks

---

# notification-service

Technology:

NestJS

Purpose:

Notification Delivery

Responsibilities:

- SMS
- Email
- Push Notifications
- Webhooks

---

# Shared Packages

packages/

├── ui/
├── sdk/
├── config/
├── eslint-config/
├── tsconfig/
└── openapi/

---

# Removed Package

The following package is deprecated:

packages/shared-types

Reason:

Types must be generated from OpenAPI.

Single Source of Truth:

OpenAPI Specification

---

# packages/ui

Shared React Components

Technology:

React
TypeScript
shadcn/ui

Structure:

components/

hooks/

providers/

utils/

---

# packages/sdk

Generated SDK

Source:

OpenAPI

Generated Clients:

- Web
- Mobile
- Third Party

Generation:

Automatic

---

# packages/config

Shared Configuration

Contains:

Constants

Feature Flags

Environment Definitions

Application Settings

---

# packages/openapi

Source of API Contracts

Structure:

v1/

v2/

schemas/

examples/

---

# Infrastructure

infrastructure/

├── docker/
├── nginx/
├── postgres/
├── redis/
├── meilisearch/
├── qdrant/
├── minio/
├── monitoring/
└── deployment/

---

# Docker

infrastructure/docker/

web/

api/

engineering-service/

ai-service/

worker-service/

notification-service/

---

# Monitoring

infrastructure/monitoring/

prometheus/

grafana/

loki/

otel/

alertmanager/

---

# Event Driven Architecture

apps/api/src/events/

domain/

application/

integration/

Examples:

UserCreatedEvent

WorkspaceCreatedEvent

CalculationCompletedEvent

AIConversationCreatedEvent

OrderCompletedEvent

---

# Queue Architecture

Technology:

BullMQ

Redis

Location:

apps/api/src/queues/

Examples:

EmailQueue

NotificationQueue

PDFQueue

AIQueue

SearchIndexQueue

ReportQueue

---

# Middleware Layer

apps/api/src/middlewares/

TenantMiddleware

RequestContextMiddleware

AuditMiddleware

RateLimitMiddleware

---

# Security Layer

apps/api/src/guards/

JwtGuard

RoleGuard

PermissionGuard

WorkspaceGuard

ApiKeyGuard

---

# OpenTelemetry

Mandatory

Supported Services:

api

web

engineering-service

ai-service

worker-service

notification-service

---

# Documentation

docs/

architecture/

database/

api/

engineering/

deployment/

standards/

decisions/

adr/

---

# Architecture Decision Records

docs/decisions/

ADR-001-monorepo.md

ADR-002-ddd.md

ADR-003-cqrs.md

ADR-004-multi-tenancy.md

ADR-005-ai-platform.md

ADR-006-dependency-management.md

ADR-007-database-migration-strategy.md

ADR-008-tenant-isolation.md

ADR-009-event-driven-architecture.md

ADR-010-queue-architecture.md

ADR-011-observability-strategy.md

---

# Tests

tests/

integration/

e2e/

performance/

security/

load/

---

# GitHub

.github/workflows/

ci.yml

lint.yml

test.yml

docker.yml

release.yml

deploy.yml

security.yml

---

# Environment Files

.env.example

.env.local

.env.development

.env.staging

.env.production

Rules:

Secrets must never be committed.

---

# Docker Compose Services

postgres

redis

minio

meilisearch

qdrant

api

web

engineering-service

ai-service

worker-service

notification-service

nginx

prometheus

grafana

loki

otel-collector

---

# Future Applications

apps/mobile

Technology:

React Native

Status:

Reserved

---

# Non-Negotiable Rules

- Docker First
- OpenAPI First
- API First
- Prisma First
- Monorepo First
- Type Safety Everywhere
- Generated SDK Only
- No Shared DTO Duplication
- Event Driven Architecture
- OpenTelemetry Enabled
- Multi-Tenant Ready
- Enterprise Ready

No code may be added outside the approved structure without architectural review.

project-management/

├── tasks/
├── reports/
├── reviews/
├── change-requests/
├── releases/
└── sprints/

project-management/

├── tasks/
│   ├── TASK-2026-0001.md
│   ├── TASK-2026-0002.md
│   └── ...
│
├── reports/
│   ├── REPORT-2026-0001.md
│   └── ...
│
├── reviews/
│   ├── REVIEW-2026-0001.md
│   └── ...
│
├── releases/
│   ├── RELEASE-2026-001.md
│   └── ...
│
└── sprints/
    ├── SPRINT-001.md
    └── ...

    TASK
    ↓
IMPLEMENTATION
    ↓
REPORT
    ↓
REVIEW
    ↓
APPROVAL
    ↓
COMMIT
    ↓
MERGE
    ↓
CLOSE

git commit -m "TASK-2026-0001 chore(repo): initialize monorepo workspace"
git commit -m "TASK-2026-0018 feat(engineering): implement harmonic analysis module"