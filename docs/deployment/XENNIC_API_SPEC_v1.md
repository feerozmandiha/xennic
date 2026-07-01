# XENNIC_API_SPEC_v1

## API Philosophy

Architecture Style:

API First

Documentation:

OpenAPI 3.1

Generated Documentation:

Swagger

Versioning Strategy:

/api/v1

Future:

/api/v2

/api/v3

---

# API DESIGN RULES

Base URL

/api/v1

Response Format

Success:

{
  "success": true,
  "data": {},
  "meta": {}
}

Error:

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed"
  }
}

Pagination:

{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

---

# AUTH MODULE

Prefix:

/auth

Endpoints:

POST /auth/register

POST /auth/login

POST /auth/logout

POST /auth/refresh-token

POST /auth/forgot-password

POST /auth/reset-password

POST /auth/verify-email

GET /auth/me

PUT /auth/profile

PUT /auth/change-password

---

# WORKSPACE MODULE

Prefix:

/workspaces

GET /workspaces

POST /workspaces

GET /workspaces/:id

PATCH /workspaces/:id

DELETE /workspaces/:id

GET /workspaces/:id/members

POST /workspaces/:id/members

DELETE /workspaces/:id/members/:memberId

POST /workspaces/:id/invitations

GET /workspaces/:id/settings

PATCH /workspaces/:id/settings

---

# USER MANAGEMENT

Prefix:

/users

GET /users

GET /users/:id

PATCH /users/:id

DELETE /users/:id

GET /users/:id/workspaces

GET /users/:id/subscriptions

---

# ROLE & PERMISSION MODULE

Prefix:

/permissions

GET /roles

POST /roles

PATCH /roles/:id

DELETE /roles/:id

GET /permissions

POST /permissions

PATCH /permissions/:id

DELETE /permissions/:id

---

# SUBSCRIPTION MODULE

Prefix:

/subscriptions

GET /plans

GET /subscriptions

POST /subscriptions

GET /subscriptions/:id

PATCH /subscriptions/:id

POST /subscriptions/:id/cancel

GET /usage

---

# BILLING MODULE

Prefix:

/billing

GET /invoices

GET /invoices/:id

POST /payments

GET /payments

GET /transactions

---

# PROJECT MODULE

Prefix:

/projects

GET /projects

POST /projects

GET /projects/:id

PATCH /projects/:id

DELETE /projects/:id

GET /projects/:id/members

POST /projects/:id/members

GET /projects/:id/files

POST /projects/:id/files

GET /projects/:id/reports

POST /projects/:id/reports

---

# ENGINEERING MODULE

Prefix:

/engineering

---

GET /engineering/calculations

POST /engineering/calculations

GET /engineering/calculations/:id

DELETE /engineering/calculations/:id

---

# BASIC ELECTRICAL

POST /engineering/basic/ohms-law

POST /engineering/basic/power

POST /engineering/basic/energy

POST /engineering/basic/power-factor

POST /engineering/basic/unit-conversion

---

# CABLE ENGINEERING

POST /engineering/cable/sizing

POST /engineering/cable/voltage-drop

POST /engineering/cable/ampacity

POST /engineering/cable/short-circuit

POST /engineering/cable/pe-sizing

---

# TRANSFORMER ENGINEERING

POST /engineering/transformer/sizing

POST /engineering/transformer/loading

POST /engineering/transformer/losses

POST /engineering/transformer/short-circuit

---

# PROTECTION ENGINEERING

POST /engineering/protection/fuse-selection

POST /engineering/protection/mccb-selection

POST /engineering/protection/acb-selection

POST /engineering/protection/relay-settings

POST /engineering/protection/selectivity

---

# POWER FACTOR CORRECTION

POST /engineering/pfc/capacitor-bank

POST /engineering/pfc/power-factor

POST /engineering/pfc/penalty

---

# EARTHING

POST /engineering/earthing/ground-resistance

POST /engineering/earthing/grid-design

POST /engineering/earthing/touch-voltage

POST /engineering/earthing/step-voltage

---

# LIGHTING

POST /engineering/lighting/lux

POST /engineering/lighting/fixture-selection

POST /engineering/lighting/room-design

---

# SOLAR

POST /engineering/solar/pv-sizing

POST /engineering/solar/inverter-sizing

POST /engineering/solar/battery-sizing

POST /engineering/solar/roi

POST /engineering/solar/yield

---

# POWER SYSTEM STUDIES

POST /engineering/power/load-flow

POST /engineering/power/short-circuit

POST /engineering/power/motor-starting

POST /engineering/power/busbar-sizing

POST /engineering/power/feeder-analysis

---

# POWER QUALITY

POST /engineering/power-quality/thd

POST /engineering/power-quality/tdd

POST /engineering/power-quality/harmonic-analysis

POST /engineering/power-quality/ieee519

POST /engineering/power-quality/k-factor

POST /engineering/power-quality/resonance

POST /engineering/power-quality/passive-filter

POST /engineering/power-quality/active-filter

---

# AI MODULE

Prefix:

/ai

GET /ai/agents

GET /ai/conversations

POST /ai/conversations

GET /ai/conversations/:id

POST /ai/conversations/:id/messages

DELETE /ai/conversations/:id

---

# AI DOCUMENTS

POST /ai/documents/analyze

POST /ai/documents/summarize

POST /ai/documents/extract

---

# AI DRAWINGS

POST /ai/drawings/analyze

POST /ai/drawings/review

POST /ai/drawings/recommendations

---

# KNOWLEDGE BASE

Prefix:

/articles

GET /articles

GET /articles/:slug

POST /articles

PATCH /articles/:id

DELETE /articles/:id

---

# CATEGORIES

GET /categories

POST /categories

PATCH /categories/:id

DELETE /categories/:id

---

# MARKETPLACE

Prefix:

/shop

GET /products

GET /products/:id

POST /products

PATCH /products/:id

DELETE /products/:id

---

# ORDERS

GET /orders

POST /orders

GET /orders/:id

PATCH /orders/:id

---

# VENDORS

GET /vendors

POST /vendors

PATCH /vendors/:id

DELETE /vendors/:id

---

# FILE STORAGE

Prefix:

/storage

POST /storage/upload

GET /storage/files

GET /storage/files/:id

DELETE /storage/files/:id

POST /storage/files/:id/share

POST /storage/files/:id/version

---

# NOTIFICATIONS

Prefix:

/notifications

GET /notifications

PATCH /notifications/:id/read

DELETE /notifications/:id

---

# API KEYS

Prefix:

/api-keys

GET /api-keys

POST /api-keys

DELETE /api-keys/:id

---

# ADMIN

Prefix:

/admin

GET /admin/dashboard

GET /admin/users

GET /admin/workspaces

GET /admin/subscriptions

GET /admin/system-health

GET /admin/audit-logs

PATCH /admin/settings

---

# HEALTH CHECKS

Prefix:

/health

GET /health

GET /health/database

GET /health/redis

GET /health/storage

GET /health/search

GET /health/ai

---

# OPENAPI REQUIREMENTS

Every endpoint must define:

- Summary
- Description
- Tags
- Request DTO
- Response DTO
- Error Responses
- Authentication Requirement
- Permission Requirement
- Example Request
- Example Response

Swagger Generation:

Automatic

Swagger URL:

/api/docs

OpenAPI JSON:

/api/openapi.json