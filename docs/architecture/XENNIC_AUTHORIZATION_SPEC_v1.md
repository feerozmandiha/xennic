# XENNIC_AUTHORIZATION_SPEC_v1

Version: 1.0

Status: Approved

Date: 2026-05-30

---

# Purpose

Defines:

- Authentication
- Authorization
- RBAC
- PBAC
- Subscription Access Control
- API Access Control
- Workspace Isolation

for the Xennic Platform.

---

# Security Principles

- Zero Trust
- Least Privilege
- Workspace Isolation
- Defense In Depth
- Audit Everything

---

# Authentication

Provider:

Internal Identity System

Technology:

JWT Access Token

JWT Refresh Token

Password Hashing:

Argon2id

---

# Session Strategy

Access Token:

15 Minutes

Refresh Token:

30 Days

Rotation:

Required

Reuse Detection:

Required

---

# Multi-Factor Authentication

Status:

Phase 2

Supported:

TOTP

Email OTP

SMS OTP

---

=========================================================
AUTHORIZATION MODEL
=========================================================

Authorization Formula:

User
+
Workspace Membership
+
Role
+
Permissions
+
Subscription Plan
=
Final Access

---

=========================================================
ROLE MODEL
=========================================================

System Roles

SUPER_ADMIN

PLATFORM_ADMIN

SUPPORT_ADMIN

---

Workspace Roles

OWNER

ADMIN

ENGINEER

CONSULTANT

MEMBER

VIEWER

---

=========================================================
ROLE DEFINITIONS
=========================================================

SUPER_ADMIN

Full Platform Access

Cannot be restricted

---

PLATFORM_ADMIN

Platform Management

No Direct Access To Customer Data

Unless Authorized

---

SUPPORT_ADMIN

Support Operations

Read Only Access

Temporary Access Tokens

Required

---

OWNER

Workspace Owner

Full Workspace Access

---

ADMIN

Workspace Administration

User Management

Project Management

Billing Access

---

ENGINEER

Engineering Features

Reports

Calculations

AI Engineering

---

CONSULTANT

Consultation

Documents

Reports

AI Analysis

---

MEMBER

Standard Usage

Based On Plan

---

VIEWER

Read Only

---

=========================================================
PERMISSION MODEL
=========================================================

Permission Format

domain.action

Examples:

users.read

users.create

users.update

users.delete

projects.read

projects.create

projects.update

projects.delete

---

=========================================================
IDENTITY PERMISSIONS
=========================================================

users.read

users.create

users.update

users.delete

roles.read

roles.manage

permissions.manage

---

=========================================================
WORKSPACE PERMISSIONS
=========================================================

workspace.read

workspace.update

workspace.delete

workspace.members.manage

workspace.settings.manage

---

=========================================================
PROJECT PERMISSIONS
=========================================================

projects.read

projects.create

projects.update

projects.delete

projects.export

projects.share

---

=========================================================
ENGINEERING PERMISSIONS
=========================================================

engineering.read

engineering.calculate

engineering.export

engineering.templates.manage

engineering.reports.generate

engineering.reports.approve

---

=========================================================
AI PERMISSIONS
=========================================================

ai.chat

ai.document_analysis

ai.drawing_analysis

ai.agent_access

ai.export

---

=========================================================
MARKETPLACE PERMISSIONS
=========================================================

products.read

products.create

products.update

products.delete

orders.read

orders.create

orders.manage

vendors.manage

---

=========================================================
STORAGE PERMISSIONS
=========================================================

files.read

files.upload

files.update

files.delete

files.share

---

=========================================================
API PERMISSIONS
=========================================================

api_keys.read

api_keys.create

api_keys.delete

webhooks.manage

---

=========================================================
ADMIN PERMISSIONS
=========================================================

admin.dashboard

admin.users

admin.billing

admin.audit_logs

admin.system_settings

---

=========================================================
PLAN MODEL
=========================================================

FREE

PRO

ENTERPRISE

---

# FREE PLAN

Target:

Students

Small Users

Limits:

Projects: 3

Calculations Per Month: 100

AI Requests Per Month: 50

Storage: 1 GB

API Access: No

Reports:

PDF Only

---

# PRO PLAN

Target:

Professional Engineers

Limits:

Projects: Unlimited

Calculations: Unlimited

AI Requests: 10,000 / Month

Storage: 100 GB

API Access: Limited

Reports:

PDF

DOCX

XLSX

---

# ENTERPRISE PLAN

Target:

Organizations

Limits:

Unlimited

Everything

API Access:

Full

SSO:

Available

Custom AI Agents:

Available

Dedicated Support:

Available

---

=========================================================
ENGINEERING ACCESS MATRIX
=========================================================

Feature                    FREE   PRO   ENTERPRISE

Basic Calculations          ✔      ✔         ✔

Cable Design                ✔      ✔         ✔

Transformer Design          ✔      ✔         ✔

Protection Coordination     ✖      ✔         ✔

Power System Studies        ✖      ✔         ✔

Power Quality               ✖      ✔         ✔

Arc Flash                   ✖      ✔         ✔

Solar Design                ✔      ✔         ✔

Custom Templates            ✖      ✔         ✔

Engineering API             ✖      Limited   ✔

---

=========================================================
AI ACCESS MATRIX
=========================================================

Feature                     FREE   PRO   ENTERPRISE

AI Chat                      ✔      ✔         ✔

Document Analysis            ✖      ✔         ✔

Drawing Analysis             ✖      ✔         ✔

RAG Knowledge                ✖      ✔         ✔

Custom Agents                ✖      ✖         ✔

Private Models               ✖      ✖         ✔

---

=========================================================
API ACCESS LEVELS
=========================================================

Level 0

No API

FREE

---

Level 1

Read Only API

PRO

---

Level 2

Read + Write API

ENTERPRISE

---

Level 3

Partner API

Special Contract

---

=========================================================
WORKSPACE ISOLATION
=========================================================

Every Request Must Include:

workspace_id

Validation Layers:

Middleware

Guard

Service

Repository

Database Query

---

Cross Workspace Access:

Forbidden

---

=========================================================
FEATURE FLAGS
=========================================================

Feature Flags Can Override:

Plans

Permissions

Modules

Experiments

Beta Features

---

=========================================================
AUDIT REQUIREMENTS
=========================================================

Must Log:

Login

Logout

Permission Changes

Role Changes

Project Changes

Calculation Execution

AI Usage

File Access

API Key Usage

Billing Events

---

=========================================================
API KEY SECURITY
=========================================================

Storage:

Hashed Only

Algorithm:

SHA-256

Rotation:

Supported

Expiration:

Supported

Scopes:

Required

Examples:

engineering.read

engineering.calculate

ai.chat

projects.read

---

=========================================================
AUTHORIZATION PIPELINE
=========================================================

Request

↓

Authentication

↓

Workspace Validation

↓

Role Validation

↓

Permission Validation

↓

Plan Validation

↓

Feature Flag Validation

↓

Business Logic

---

=========================================================
NON-NEGOTIABLE RULES
=========================================================

- Every API Requires Authentication
  Except Public Routes

- Every Workspace Resource Must Be Scoped

- Every Sensitive Action Must Be Audited

- Permission Checks Are Mandatory

- Plan Checks Are Mandatory

- Feature Flags Must Be Supported

- No Cross-Tenant Data Access

Approved.