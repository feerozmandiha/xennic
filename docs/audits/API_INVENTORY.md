# API INVENTORY

**Date:** 2026-07-02
**Total verified endpoints: 220**

---

## Global Configuration

| Setting | Value |
|---------|-------|
| Framework | Fastify (NestJS 11) |
| Port | 3000 (env PORT) |
| Host | 0.0.0.0 (env HOST) |
| Prefix | `/api/v1` |
| Swagger | `/api/docs` with JWT-auth Bearer |
| Response | `{success, data, meta}` / `{success, error}` |
| Validation | whitelist + forbidNonWhitelisted + transform |
| CORS | configurable origins (local fallback) |
| Rate Limit | Auth 5/60s, API 100/60s, AI 20/60s, Admin 200/60s |

## Endpoints by Domain

### Public (10 endpoints — no auth required)

| Method | Route | Controller |
|--------|-------|------------|
| GET | `/api/v1/` | ApiController |
| GET | `/api/v1/health` | HealthController |
| POST | `/api/v1/auth/register` | AuthController |
| POST | `/api/v1/auth/login` | AuthController |
| POST | `/api/v1/auth/refresh-token` | AuthController |
| POST | `/api/v1/auth/forgot-password` | AuthController |
| POST | `/api/v1/auth/reset-password` | AuthController |
| GET | `/api/v1/billing/callback` | BillingCallbackController |
| GET | `/api/v1/public/knowledge` | PublicKnowledgeController |
| GET | `/api/v1/public/knowledge/:slug` | PublicKnowledgeController |

### Auth (7 endpoints)
| POST | `/api/v1/auth/logout` | JWT |
| GET | `/api/v1/auth/me` | JWT |
| PUT | `/api/v1/auth/change-password` | JWT |

### User (7 endpoints)
| GET | `/api/v1/users` | JWT |
| GET | `/api/v1/users/:id` | JWT |
| POST | `/api/v1/users` | JWT |
| PUT | `/api/v1/users/:id` | JWT |
| DELETE | `/api/v1/users/:id` | JWT |
| PATCH | `/api/v1/users/:id/restore` | JWT |
| DELETE | `/api/v1/users/:id/hard` | JWT |

### RBAC — Roles (6 endpoints)
| GET/POST | `/api/v1/roles` | JWT + Permissions |
| GET/PUT/DELETE | `/api/v1/roles/:id` | JWT + Permissions |
| POST | `/api/v1/roles/:id/permissions` | JWT + Permissions |

### RBAC — Permissions (4 endpoints)
| GET/POST | `/api/v1/permissions` | JWT + Permissions |
| GET | `/api/v1/permissions/:id` | JWT + Permissions |
| DELETE | `/api/v1/permissions/:id` | JWT + Permissions |

### Workspace (17 endpoints)
Workspace CRUD (6), Settings (3), Members (6), Invitations (4), Dashboard (1), Accept (1)

### Project (12 endpoints)
CRUD (5), Members (3), Notes (3), Restore (1)

### Engineering (10 endpoints)
Calculations CRUD (4), Catalog (1), Health (1), Energy sub-endpoints (4)

### Knowledge (30 endpoints)
CRUD + search (7), Taxonomy (3), Standards (3), Versions (3), Comments (4), Workflow (4), Analytics (3), By-calculator (1), Related-calculations (1), View tracking (1)

### Billing (16 endpoints)
Invoices (3), Payments (4), Transactions (1), Payment methods (4), Subscription payments (2), Dashboard (1), Callback (1)

### Admin (17 endpoints)
Dashboard (2), Users (3), Workspaces (2), Plans (2), Consultations (3), Articles (2), Notifications (1), Audit log (1), Settings (2)

### AI (7 endpoints)
Agents (1), Conversations (4), Messages (1), Validate (1)

### Additional Modules
| Module | Count | Auth |
|--------|-------|------|
| search | 1 | JWT + Workspace |
| subscription | 7 | JWT + Workspace |
| notifications | 6 | JWT |
| api-keys | 6 | JWT + Permissions |
| consultations | 6 | JWT + Workspace |
| storage | 6 | JWT + Permissions |
| webhooks | 5 | JWT + Permissions |
| standards | 5 | JWT + Permissions |
| feature-flags | 7 | JWT / Admin |
| vendors | 4 | JWT |
| products | 6 | JWT |
| orders | 4 | JWT |
| vision | 2 | JWT + Workspace |
| email | 1 | JWT + SuperAdmin |
| taxonomy | 2 | JWT + Workspace |
