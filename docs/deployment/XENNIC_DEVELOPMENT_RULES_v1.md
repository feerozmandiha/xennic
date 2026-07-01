# XENNIC DEVELOPMENT RULES v1

## General Principles

Code must be:

* Maintainable
* Testable
* Modular
* Secure
* Scalable

Short-term solutions that create long-term technical debt are prohibited.

---

# Source Control

Platform:

Git

Branch Strategy:

main

develop

feature/*

bugfix/*

hotfix/*

release/*

---

# Commit Convention

feat:

fix:

refactor:

docs:

test:

chore:

perf:

Example:

feat(auth): add refresh token rotation

---

# Backend Standards

Framework:

NestJS

Language:

TypeScript

Rules:

* Strict Mode Enabled
* ESLint Mandatory
* Prettier Mandatory
* Dependency Injection Only
* No Business Logic Inside Controllers
* No Raw SQL In Controllers

Architecture:

Controller

Application Layer

Domain Layer

Infrastructure Layer

---

# Frontend Standards

Framework:

Next.js

Language:

TypeScript

Rules:

* Server Components First
* Client Components Only When Required
* Mobile First Design
* Accessibility Compliance

State Management:

Zustand

Server State:

TanStack Query

Validation:

Zod

Forms:

React Hook Form

---

# API Standards

OpenAPI First

Swagger Mandatory

Every endpoint requires:

* Summary
* Description
* Request Schema
* Response Schema
* Error Responses

Versioning:

/api/v1

Future:

/api/v2

---

# Database Standards

Database:

PostgreSQL

Rules:

* UUID Primary Keys
* Soft Delete Support
* Audit Fields Mandatory

Required Fields:

id

created_at

updated_at

created_by

updated_by

---

# Redis Rules

Use For:

Cache

Queues

Sessions

Rate Limiting

Never store critical business data permanently in Redis.

---

# Docker Rules

Every service requires:

Dockerfile

Health Check

Environment Variables

Container Isolation

Local development must run entirely through Docker Compose.

---

# Testing Standards

Backend:

Unit Tests

Integration Tests

E2E Tests

Frontend:

Component Tests

E2E Tests

Coverage Target:

Minimum 80%

Critical Domains:

Minimum 90%

---

# Security Standards

Password Hashing:

Argon2

Secrets:

Environment Variables Only

No Hardcoded Secrets

Mandatory:

Rate Limiting

Input Validation

Output Sanitization

Audit Logging

---

# Performance Standards

Database Queries:

Optimized

Avoid N+1 Problems

Caching Strategy Required

Lazy Loading Where Appropriate

---

# Internationalization

Default Language:

Persian

Supported Language:

English

All content must be i18n ready.

No hardcoded language-specific logic.

---

# Documentation Rules

Every Module Must Have:

README

Architecture Notes

API Documentation

Business Rules Documentation

---

# Engineering Module Rules

Every calculation must include:

Input Schema

Validation Rules

Calculation Formula

Reference Standard

Version Number

Result Schema

Engineering calculations must be reproducible and auditable.

---

# AI Module Rules

AI suggestions are advisory.

Final engineering decisions remain user responsibility.

Every AI response must be traceable and logged.

---

# Long-Term Rule

Design for 10 years of growth, not 10 weeks of development.
