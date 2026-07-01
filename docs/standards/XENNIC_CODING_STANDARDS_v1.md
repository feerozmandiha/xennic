# XENNIC_CODING_STANDARDS_v1

Version: 1.0

Status: Approved

Date: 2026-05-30

---

# Purpose

This document defines the official coding standards for the Xennic Platform.

Applies To:

* Next.js
* NestJS
* TypeScript
* Python
* FastAPI
* Prisma
* Docker
* GitHub Actions

Every contributor and assistant must follow these standards.

---

# Core Principles

1. Readability First
2. Maintainability First
3. Type Safety First
4. Security By Design
5. Testability By Design
6. API First
7. Documentation First

---

# Repository Standards

Monorepo Tool:

pnpm workspace

Build Orchestration:

Turbo

Rule:

Exactly one node_modules directory exists at repository root.

Forbidden:

apps/*/node_modules

packages/*/node_modules

services/*/node_modules

---

# Naming Standards

## Folders

kebab-case

Examples:

user-management

engineering-service

power-quality

---

## Files

kebab-case

Examples:

create-user.dto.ts

auth.controller.ts

workspace.service.ts

---

## Classes

PascalCase

Examples:

AuthController

WorkspaceService

CreateProjectUseCase

---

## Interfaces

Prefix:

I

Examples:

IUserRepository

IWorkspaceMember

---

## Enums

Suffix:

Enum

Examples:

UserStatusEnum

WorkspaceRoleEnum

---

## Constants

UPPER_SNAKE_CASE

Examples:

MAX_FILE_SIZE

JWT_EXPIRATION

---

# TypeScript Standards

Strict Mode:

Required

tsconfig:

"strict": true

"noImplicitAny": true

"strictNullChecks": true

Forbidden:

any

Except:

Approved external integrations

---

# NestJS Standards

Architecture:

DDD + CQRS

Structure:

module

application

domain

infrastructure

presentation

Example:

workspace/

├── application/
├── domain/
├── infrastructure/
└── presentation/

---

# Controller Rules

Controllers must:

* Validate input
* Call application layer only
* Never contain business logic

Forbidden:

Business logic inside controllers

---

# Service Rules

Application Services:

Use Cases only

Domain Logic:

Domain Layer only

---

# DTO Standards

Every request:

DTO Required

Every response:

Response DTO Required

Validation:

class-validator

class-transformer

Required

---

# Error Handling

Never return raw errors.

Standard Response:

{
"success": false,
"error": {
"code": "ERROR_CODE",
"message": "Human readable message"
}
}

---

# Logging Standards

Library:

Pino

Required Fields:

timestamp

request_id

user_id

workspace_id

service

level

message

---

# OpenAPI Standards

Every endpoint requires:

* Summary
* Description
* Tags
* Request DTO
* Response DTO
* Error Responses
* Examples

No undocumented endpoint allowed.

---

# Next.js Standards

Version:

Latest Stable

Router:

App Router

Required:

Server Components by default

Client Components only when necessary

---

# Frontend Architecture

Structure:

features/

shared/

widgets/

entities/

app/

Pattern:

Feature-Sliced Design

---

# State Management

Preferred:

TanStack Query

Zustand

Forbidden:

Global state without justification

---

# UI Standards

Technology:

shadcn/ui

Tailwind CSS

Radix UI

Accessibility:

WCAG 2.2

Required

---

# SEO Standards

Every page must define:

title

description

canonical

open graph

structured data

---

# Prisma Standards

ORM:

Prisma

---

# Database Rules

Primary Key:

UUID v7

Required

Forbidden:

Auto Increment IDs

---

# Migrations

Tool:

Prisma Migrate

Rule:

No manual production schema changes.

---

# Python Standards

Version:

Python 3.12+

---

# FastAPI Rules

Type Hints:

Mandatory

Pydantic Models:

Mandatory

Response Models:

Mandatory

---

# Python Formatting

Formatter:

Ruff

Linter:

Ruff

Type Checker:

mypy

Required

---

# Engineering Calculation Standards

Every Calculation Requires:

* Code
* Formula Version
* Standard Reference
* Input Validation
* Unit Validation

---

# AI Standards

Model Access:

Through AI Gateway only

Forbidden:

Direct model calls from frontend

---

# Security Standards

Password Hash:

Argon2id

JWT:

RS256

Secrets:

Environment Variables Only

Forbidden:

Hardcoded Secrets

---

# Docker Standards

Every Service Must Have:

Dockerfile

Health Check

Non-root User

Multi-stage Build

Required

---

# Git Standards

Branch Naming

feature/TASK-ID-description

fix/TASK-ID-description

hotfix/TASK-ID-description

---

# Commit Standard

Format:

TASK-ID type(scope): description

Examples:

TASK-2026-0001 chore(repo): initialize workspace

TASK-2026-0002 feat(api): add auth module

TASK-2026-0003 feat(database): create prisma schema

---

# Testing Standards

Backend

Unit Tests Required

Integration Tests Required

---

Frontend

Component Tests Required

E2E Tests Required

---

Coverage

Minimum:

80%

Target:

90%

---

# Documentation Standards

Every Module Requires:

README.md

Architecture Notes

OpenAPI Docs

Examples

---

# Review Checklist

Before Approval:

✓ Builds Successfully

✓ Tests Pass

✓ Lint Passes

✓ Types Pass

✓ Documentation Updated

✓ Security Review Passed

✓ No Architecture Violations

---

# Non-Negotiable Rules

* No any
* No undocumented APIs
* No hardcoded secrets
* No business logic in controllers
* No direct database access from controllers
* No local node_modules
* No untested critical code
* No cross-domain modifications without approval

Approved.
