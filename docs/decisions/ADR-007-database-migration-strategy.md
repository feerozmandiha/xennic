# ADR-007 Database Migration Strategy

Status: Accepted

Date: 2026-05-30

## Context

Xennic requires:

- PostgreSQL
- Type Safety
- Multi-Tenant SaaS
- Docker First
- OpenAPI First
- NestJS
- Next.js

The project requires a reliable migration system with long-term maintainability.

## Decision

ORM:

Prisma ORM

Migration Tool:

Prisma Migrate

Seed Strategy:

Prisma Seed

Client Generation:

Automatic

Schema Source:

Single Source of Truth

schema.prisma

Location:

apps/api/prisma/

## Benefits

- Excellent Type Safety
- Reliable Migrations
- Strong PostgreSQL Support
- NestJS Integration
- OpenAPI Friendly
- Excellent Developer Experience

## Rules

All database changes must be performed through:

Prisma Schema

and

Prisma Migrations

Direct database modifications are prohibited.

## Consequences

Pros:

- Predictable migrations
- Consistent schema management
- Better maintainability

Cons:

- Additional Prisma dependency

Accepted.