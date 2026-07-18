# 02 — Module Audit

**Date:** 2026-07-02

---

## Module: health

| Attribute        | Value                                                 |
| ---------------- | ----------------------------------------------------- |
| **Status**       | Complete                                              |
| **Purpose**      | Health check endpoints                                |
| **Files**        | 5                                                     |
| **LOC**          | 73                                                    |
| **Controllers**  | `health.controller.ts`                                |
| **Services**     | `health.service.ts`                                   |
| **Endpoints**    | 3 (GET /health, /health/ready, /health/live)          |
| **Auth**         | None (public)                                         |
| **Tests**        | `health.controller.spec.ts`, `health.service.spec.ts` |
| **DB usage**     | Prisma health check                                   |
| **Dependencies** | Prisma                                                |

---

## Module: workspace

| Attribute        | Value                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Status**       | Complete                                                                                                                   |
| **Purpose**      | Workspace management, settings, members, dashboard                                                                         |
| **Files**        | 25                                                                                                                         |
| **LOC**          | 2,487                                                                                                                      |
| **Controllers**  | `workspace.controller.ts`, `workspace-settings.controller.ts`, `workspace-member.controller.ts`, `dashboard.controller.ts` |
| **Services**     | `workspace.service.ts`, `workspace-settings.service.ts`, `dashboard.service.ts`                                            |
| **Entities**     | 4 (workspace, settings, member, settings entity)                                                                           |
| **Repositories** | 3 (workspace, settings, member)                                                                                            |
| **DTOs**         | 6 (create, update, settings, member, etc.)                                                                                 |
| **Tests**        | `workspace-settings.service.spec.ts`, `workspace-settings.controller.spec.ts`                                              |
| **Auth**         | JWT + PermissionsGuard + WorkspaceGuard                                                                                    |

---

## Module: user

| Attribute        | Value                        |
| ---------------- | ---------------------------- |
| **Status**       | Complete                     |
| **Purpose**      | User CRUD                    |
| **Files**        | 9                            |
| **LOC**          | 978                          |
| **Controllers**  | `user.controller.ts`         |
| **Services**     | `user.service.ts`            |
| **Entities**     | 1 (user) + 2 VOs + interface |
| **Repositories** | 1                            |
| **Auth**         | JWT + PermissionsGuard       |
| **Tests**        | None                         |

---

## Module: auth

| Attribute         | Value                                                                           |
| ----------------- | ------------------------------------------------------------------------------- |
| **Status**        | Complete                                                                        |
| **Purpose**       | Authentication (register, login, refresh, logout, password reset, OTP, profile) |
| **Files**         | 14                                                                              |
| **LOC**           | 1,091                                                                           |
| **Controllers**   | `auth.controller.ts`                                                            |
| **Services**      | `auth.service.ts`                                                               |
| **Entities**      | 2 (refresh-token, session) + VO                                                 |
| **Repositories**  | 2 (refresh-token, session)                                                      |
| **Strategy**      | jwt.strategy.ts (RS256)                                                         |
| **Auth**          | Public (register, login, forgot, reset) / JWT (profile)                         |
| **Rate limiting** | AuthThrottlerGuard (5/60s login, 3/60s register)                                |
| **Tests**         | None                                                                            |

---

## Module: rbac

| Attribute        | Value                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| **Status**       | Complete                                                               |
| **Purpose**      | Role & permission management                                           |
| **Files**        | 23                                                                     |
| **LOC**          | 2,052                                                                  |
| **Controllers**  | `role.controller.ts`, `permission.controller.ts`                       |
| **Services**     | `role.service.ts`, `permission.service.ts`, `authorization.service.ts` |
| **Entities**     | 3 (role, permission, role-permission) + 2 VOs                          |
| **Repositories** | 3                                                                      |
| **Guards**       | `permissions.guard.ts` (global)                                        |
| **Tests**        | None                                                                   |

---

## Module: project

| Attribute       | Value                   |
| --------------- | ----------------------- |
| **Status**      | Complete                |
| **Purpose**     | Project CRUD            |
| **Files**       | 7                       |
| **LOC**         | 1,257                   |
| **Controllers** | `project.controller.ts` |
| **Services**    | `project.service.ts`    |
| **Auth**        | JWT + PermissionsGuard  |
| **Tests**       | None                    |

---

## Module: engineering

| Attribute       | Value                                                 |
| --------------- | ----------------------------------------------------- |
| **Status**      | Complete                                              |
| **Purpose**     | Engineering calculation gateway (delegates to Python) |
| **Files**       | 8                                                     |
| **LOC**         | 1,103                                                 |
| **Controllers** | `engineering.controller.ts`                           |
| **Services**    | `engineering.service.ts`                              |
| **Auth**        | JWT + PermissionsGuard                                |
| **Integration** | HTTP client to engineering-service (port 8001)        |
| **Tests**       | None                                                  |

---

## Module: subscription

| Attribute       | Value                                    |
| --------------- | ---------------------------------------- |
| **Status**      | Complete                                 |
| **Purpose**     | Subscription management, upgrade, cancel |
| **Files**       | 8                                        |
| **LOC**         | 857                                      |
| **Controllers** | `subscription.controller.ts`             |
| **Services**    | `subscription.service.ts`                |
| **Entities**    | 2 (subscription, plan)                   |
| **Tests**       | None                                     |

---

## Module: storage

| Attribute       | Value                   |
| --------------- | ----------------------- |
| **Status**      | Complete                |
| **Purpose**     | File storage (MinIO)    |
| **Files**       | 8                       |
| **LOC**         | 885                     |
| **Controllers** | `storage.controller.ts` |
| **Services**    | `storage.service.ts`    |
| **Integration** | MinIO client            |
| **Tests**       | None                    |

---

## Module: notification

| Attribute       | Value                                                    |
| --------------- | -------------------------------------------------------- |
| **Status**      | Partial (has TODO for queue)                             |
| **Purpose**     | In-app notifications                                     |
| **Files**       | 7                                                        |
| **LOC**         | 667                                                      |
| **Controllers** | `notification.controller.ts`                             |
| **Services**    | `notification.service.ts`                                |
| **TODO**        | Line 67: "برای email/sms در آینده با queue ارسال می‌شود" |
| **Tests**       | None                                                     |

---

## Module: ai

| Attribute         | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| **Status**        | Complete (gateway)                                             |
| **Purpose**       | AI conversation/agent gateway (delegates to Python ai-service) |
| **Files**         | 8                                                              |
| **LOC**           | 1,029                                                          |
| **Controllers**   | `ai.controller.ts`                                             |
| **Services**      | `ai.service.ts`                                                |
| **Endpoints**     | 9 (conversations CRUD, messages, agents, calculate)            |
| **Rate limiting** | AiRateLimit                                                    |
| **Integration**   | HTTP client to ai-service (port 8002)                          |
| **Tests**         | None                                                           |

---

## Module: consultations

| Attribute       | Value                         |
| --------------- | ----------------------------- |
| **Status**      | Complete                      |
| **Purpose**     | Consultation management       |
| **Files**       | 5                             |
| **LOC**         | 346                           |
| **Controllers** | `consultations.controller.ts` |
| **Services**    | `consultations.service.ts`    |
| **Tests**       | None                          |

---

## Module: billing

| Attribute       | Value                                                     |
| --------------- | --------------------------------------------------------- |
| **Status**      | Complete                                                  |
| **Purpose**     | Billing plans, payment gateways                           |
| **Files**       | 14                                                        |
| **LOC**         | 1,986                                                     |
| **Controllers** | `billing.controller.ts`, `billing-callback.controller.ts` |
| **Services**    | `billing.service.ts`, `subscription-billing.service.ts`   |
| **Entities**    | 4 (plan, invoice, payment, transaction)                   |
| **Gateways**    | 2 payment gateway adapters                                |
| **Tests**       | None                                                      |

---

## Module: admin

| Attribute       | Value                                  |
| --------------- | -------------------------------------- |
| **Status**      | Complete                               |
| **Purpose**     | Admin dashboard, audit logs            |
| **Files**       | 8                                      |
| **LOC**         | 1,310                                  |
| **Controllers** | 3 (admin, admin-check, admin-taxonomy) |
| **Services**    | `admin.service.ts`                     |
| **Auth**        | JWT + SuperAdminGuard                  |
| **Tests**       | `admin.guard.spec.ts`                  |

---

## Module: search

| Attribute       | Value                         |
| --------------- | ----------------------------- |
| **Status**      | Complete                      |
| **Purpose**     | Global search across entities |
| **Files**       | 7                             |
| **LOC**         | 483                           |
| **Controllers** | `search.controller.ts`        |
| **Services**    | `search.service.ts`           |
| **Tests**       | None                          |

---

## Module: knowledge

| Attribute             | Value                                                             |
| --------------------- | ----------------------------------------------------------------- |
| **Status**            | Complete                                                          |
| **Purpose**           | Knowledge article lifecycle with versioning, categories, taxonomy |
| **Files**             | 14                                                                |
| **LOC**               | 3,487                                                             |
| **Controllers**       | 4 (knowledge, taxonomy, public-knowledge, knowledge-standards)    |
| **Services**          | `knowledge.service.ts`                                            |
| **Entities**          | 1 (knowledge)                                                     |
| **Tests**             | 3 (service, entity, controller)                                   |
| **Swagger endpoints** | 12                                                                |

---

## Module: standards

| Attribute       | Value                      |
| --------------- | -------------------------- |
| **Status**      | Complete                   |
| **Purpose**     | Engineering standards CRUD |
| **Files**       | 7                          |
| **LOC**         | 448                        |
| **Controllers** | `standard.controller.ts`   |
| **Services**    | `standard.service.ts`      |
| **Tests**       | None                       |

---

## Module: marketplace

| Attribute       | Value                            |
| --------------- | -------------------------------- |
| **Status**      | Complete                         |
| **Purpose**     | Product/vendor/order marketplace |
| **Files**       | 15                               |
| **LOC**         | 1,228                            |
| **Controllers** | 3 (products, vendors, orders)    |
| **Services**    | 3 (product, vendor, order)       |
| **Entities**    | 3 (product, vendor, order)       |
| **Tests**       | None                             |

---

## Module: api-keys

| Attribute       | Value                   |
| --------------- | ----------------------- |
| **Status**      | Complete                |
| **Purpose**     | API key management      |
| **Files**       | 7                       |
| **LOC**         | 502                     |
| **Controllers** | `api-key.controller.ts` |
| **Tests**       | None                    |

---

## Module: webhooks

| Attribute       | Value                   |
| --------------- | ----------------------- |
| **Status**      | Complete                |
| **Purpose**     | Webhook management      |
| **Files**       | 7                       |
| **LOC**         | 624                     |
| **Controllers** | `webhook.controller.ts` |
| **Tests**       | None                    |

---

## Module: email

| Attribute       | Value                               |
| --------------- | ----------------------------------- |
| **Status**      | Complete                            |
| **Purpose**     | Email sending + template management |
| **Files**       | 10                                  |
| **LOC**         | 539                                 |
| **Controllers** | `email.controller.ts`               |
| **Services**    | 2 (email, email-templates)          |
| **Tests**       | None                                |

---

## Module: feature-flags

| Attribute       | Value                                |
| --------------- | ------------------------------------ |
| **Status**      | Complete                             |
| **Purpose**     | Feature flag management              |
| **Files**       | 10                                   |
| **LOC**         | 543                                  |
| **Controllers** | 2 (feature-flag, feature-flag-admin) |
| **Services**    | `feature-flag.service.ts`            |
| **Tests**       | None                                 |

---

## Module: vision

| Attribute       | Value                                                           |
| --------------- | --------------------------------------------------------------- |
| **Status**      | Complete (gateway)                                              |
| **Purpose**     | Vision file upload gateway (delegates to Python vision-service) |
| **Files**       | 4                                                               |
| **LOC**         | 288                                                             |
| **Controllers** | `vision-upload.controller.ts`                                   |
| **Integration** | HTTP client to vision-service (port 8003)                       |
| **Tests**       | None                                                            |

---

## Empty Modules (Scaffolding Only)

All five have DDD directory structures but **zero .ts files**:

| Module                 | Path                              | Dirs present                                      | Missing    |
| ---------------------- | --------------------------------- | ------------------------------------------------- | ---------- |
| enterprise-background  | `modules/enterprise-background/`  | domain, application, infrastructure, presentation | Everything |
| enterprise-backup      | `modules/enterprise-backup/`      | domain, application, infrastructure, presentation | Everything |
| enterprise-config      | `modules/enterprise-config/`      | domain, application, infrastructure, presentation | Everything |
| enterprise-performance | `modules/enterprise-performance/` | domain, application, infrastructure, presentation | Everything |
| knowledge-factory      | `modules/knowledge-factory/`      | domain, application, infrastructure, presentation | Everything |

None are registered in `api.module.ts`.

---

## Module Dependency Graph

```
health (standalone, no deps)
  └─ Prisma

auth ─────────────────────────┐
  ├─ user                     │
  ├─ JWT strategy             │
  └─ Argon2 hashing           │
                               │
rbac ─────────────────────────┤
  ├─ permissions.guard (global)│
  └─ roles + permissions       │
                               │
workspace ────────────────────┤
  ├─ workspace-settings        │
  ├─ workspace-members         │
  └─ dashboard                 │
                               │
user ─────────────────────────┤
  └─ rbac (for role assign)    │
                               │
project ──────────────────────┤
  ├─ workspace                 │
  └─ user (members)            │
                               │
engineering ──────────────────┤
  └─ engineering-service (HTTP)│
                               │
knowledge ────────────────────┤
  ├─ workspace                 │
  └─ standards (optional link) │
                               │
ai ───────────────────────────┤
  └─ ai-service (HTTP)         │
                               │
vision ───────────────────────┤
  └─ vision-service (HTTP)     │
                               │
billing ──────────────────────┤
  └─ subscription              │
                               │
subscription ─────────────────┤
  └─ billing                   │
                               │
marketplace ──────────────────┤
  ├─ storage (for images)      │
  └─ billing (for payments)    │
                               │
storage ──────────────────────┤
  └─ MinIO (external S3)       │
                               │
notification ─────────────────┘
  └─ (future: RabbitMQ queue)

admin ────────────────────────┐
  └─ all modules (audit logs)  │

email ────────────────────────┤
  └─ nodemailer                │

search ───────────────────────┤
  └─ all modules (global query)│

feature-flags ────────────────┤
  └─ workspace                 │

api-keys ─────────────────────┘
webhooks ─────────────────────┘
consultations ────────────────┘
standards ────────────────────┘
```

**Note:** Empty modules (enterprise-\*, knowledge-factory) have zero dependencies because they have zero code.
