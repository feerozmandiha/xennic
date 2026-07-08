# 05 — API Audit

**Date:** 2026-07-02

**Total endpoints discovered:** 162 (confirmed by OpenAPI generation output)

---

## 5.1 Endpoint Inventory

### Auth (10 endpoints)
| Method | Route | Controller | Auth | Guard |
|--------|-------|------------|------|-------|
| POST | /auth/register | auth.controller | None | AuthThrottler |
| POST | /auth/login | auth.controller | None | AuthThrottler |
| POST | /auth/refresh | auth.controller | None | AuthThrottler |
| POST | /auth/logout | auth.controller | JWT | — |
| POST | /auth/forgot-password | auth.controller | None | AuthThrottler |
| POST | /auth/verify-otp | auth.controller | None | AuthThrottler |
| POST | /auth/reset-password | auth.controller | None | AuthThrottler |
| POST | /auth/change-password | auth.controller | JWT | — |
| GET | /auth/profile | auth.controller | JWT | — |
| PUT | /auth/profile | auth.controller | JWT | — |

### User (5 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| GET | /users | JWT | Permissions |
| GET | /users/:id | JWT | Permissions |
| POST | /users | JWT | Permissions |
| PATCH | /users/:id | JWT | Permissions |
| DELETE | /users/:id | JWT | Permissions |

### RBAC (10 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| GET | /rbac/roles | JWT | Permissions |
| GET | /rbac/roles/:id | JWT | Permissions |
| POST | /rbac/roles | JWT | Admin |
| PATCH | /rbac/roles/:id | JWT | Admin |
| DELETE | /rbac/roles/:id | JWT | Admin |
| GET | /rbac/permissions | JWT | Permissions |
| PATCH | /rbac/permissions/:id | JWT | Admin |
| GET | /rbac/roles/:id/permissions | JWT | Admin |
| POST | /rbac/roles/:id/permissions | JWT | Admin |
| DELETE | /rbac/roles/:id/permissions/:permissionId | JWT | Admin |

### Workspace (8 endpoints)
| Method | Route | Controller | Auth | Guard |
|--------|-------|------------|------|-------|
| GET | /workspace/settings | workspace-settings | JWT | Workspace |
| PATCH | /workspace/settings | workspace-settings | JWT | Workspace |
| GET | /workspace/members | workspace-member | JWT | Workspace |
| PUT | /workspace/members/:id/role | workspace-member | JWT | Workspace |
| DELETE | /workspace/members/:id | workspace-member | JWT | Workspace |
| GET | /workspace/dashboard | dashboard | JWT | Workspace |
| GET | /workspace | workspace | JWT | Workspace |
| PATCH | /workspace | workspace | JWT | Workspace |

### Health (3 endpoints)
| Method | Route | Auth |
|--------|-------|------|
| GET | /health | None |
| GET | /health/ready | None |
| GET | /health/live | None |

### Project (5 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| GET | /projects | JWT | Permissions |
| GET | /projects/:id | JWT | Permissions |
| POST | /projects | JWT | Permissions |
| PATCH | /projects/:id | JWT | Permissions |
| DELETE | /projects/:id | JWT | Permissions |

### Engineering (9 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| GET | /engineering/calculations | JWT | Permissions |
| GET | /engineering/calculations/:id | JWT | Permissions |
| POST | /engineering/calculations/:id/execute | JWT | Permissions |
| GET | /engineering/calculations/:id/history | JWT | Permissions |
| GET | /engineering/calculations/:id/history/:historyId | JWT | Permissions |
| GET | /engineering/calculations/:id/validate | JWT | Permissions |
| PUT | /engineering/calculations/:id/approve | JWT | Permissions |
| PUT | /engineering/calculations/:id/reject | JWT | Permissions |

### Standards (5 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| GET | /standards | JWT | Permissions |
| GET | /standards/:id | JWT | Permissions |
| POST | /standards | JWT | Permissions |
| PATCH | /standards/:id | JWT | Permissions |
| DELETE | /standards/:id | JWT | Permissions |

### Billing (8 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| GET | /billing/plans | JWT | — |
| GET | /billing/plans/:id | JWT | — |
| POST | /billing/plans | JWT | Admin |
| PATCH | /billing/plans/:id | JWT | Admin |
| DELETE | /billing/plans/:id | JWT | Admin |
| POST | /billing/callback | None | — (webhook) |
| POST | /billing/checkout | JWT | — |
| GET | /billing/invoices | JWT | — |

### Subscription (6 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| GET | /subscriptions | JWT | Workspace |
| GET | /subscriptions/current | JWT | Workspace |
| POST | /subscriptions | JWT | Workspace |
| PATCH | /subscriptions/:id | JWT | Workspace |
| POST | /subscriptions/:id/cancel | JWT | Workspace |
| POST | /subscriptions/:id/upgrade | JWT | Workspace |

### Knowledge (12 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| GET | /knowledge | JWT | Permissions |
| GET | /knowledge/:id | JWT | Permissions |
| POST | /knowledge | JWT | Permissions |
| PATCH | /knowledge/:id | JWT | Permissions |
| DELETE | /knowledge/:id | JWT | Permissions |
| POST | /knowledge/:id/version | JWT | Permissions |
| GET | /knowledge/:id/versions | JWT | Permissions |
| GET | /knowledge/:id/versions/:versionId | JWT | Permissions |
| GET | /knowledge/categories | JWT | Permissions |
| POST | /knowledge/categories | JWT | Permissions |
| PATCH | /knowledge/categories/:id | JWT | Permissions |
| DELETE | /knowledge/categories/:id | JWT | Permissions |

### AI (9 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| POST | /ai/conversations | JWT | AiRateLimit |
| GET | /ai/conversations | JWT | AiRateLimit |
| GET | /ai/conversations/:id | JWT | AiRateLimit |
| DELETE | /ai/conversations/:id | JWT | AiRateLimit |
| POST | /ai/conversations/:id/messages | JWT | AiRateLimit |
| GET | /ai/conversations/:id/messages | JWT | AiRateLimit |
| GET | /ai/agents | JWT | AiRateLimit |
| GET | /ai/agents/:id | JWT | AiRateLimit |
| POST | /ai/calculate | JWT | AiRateLimit |

### Vision (4 endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| POST | /vision/upload | JWT | Permissions |
| GET | /vision/files | JWT | Permissions |
| GET | /vision/files/:id | JWT | Permissions |
| DELETE | /vision/files/:id | JWT | Permissions |

### Notification (6 endpoints)
| Method | Route | Auth |
|--------|-------|------|
| GET | /notifications | JWT |
| GET | /notifications/:id | JWT |
| POST | /notifications | JWT |
| PATCH | /notifications/:id/read | JWT |
| PATCH | /notifications/read-all | JWT |
| DELETE | /notifications/:id | JWT |

### Storage (4 endpoints)
| Method | Route | Auth |
|--------|-------|------|
| POST | /storage/upload | JWT |
| GET | /storage/files | JWT |
| GET | /storage/files/:id | JWT |
| DELETE | /storage/files/:id | JWT |

### Admin (8+ endpoints)
| Method | Route | Auth | Guard |
|--------|-------|------|-------|
| GET | /admin/stats | JWT | SuperAdmin |
| GET | /admin/audit-logs | JWT | SuperAdmin |
| GET | /admin/audit-logs/:id | JWT | SuperAdmin |
| GET | /admin/check/* | JWT | SuperAdmin |
| GET/POST/PATCH/DELETE | /admin/taxonomy/* | JWT | SuperAdmin |

### Additional Modules (30 endpoints)
| Module | Endpoints | Auth | Guard |
|--------|-----------|------|-------|
| consultations | 4 CRUD | JWT | Permissions |
| api-keys | 4 CRUD | JWT | Admin |
| webhooks | 5 CRUD | JWT | — |
| email | 5 (send + templates) | JWT | Admin |
| search | 2 (search + reindex) | JWT | — |
| feature-flags | 5 CRUD + admin | JWT | Admin |
| marketplace | 9 (products, vendors, orders) | JWT | Permissions |

---

## 5.2 API Patterns

| Pattern | Implementation |
|---------|---------------|
| **Base path** | `/api/v1` |
| **Response format** | `{success: boolean, data?: T, meta?: object}` / `{success: false, error: {code, message, details}}` |
| **Validation** | Global ValidationPipe — whitelist + forbidNonWhitelisted |
| **Auth** | JWT Bearer token (RS256), optional on public routes |
| **Pagination** | Query params: page, limit, sortBy, sortOrder |
| **Rate limiting** | Per-endpoint via custom decorators |
| **Swagger** | `/api/docs` with bearer auth, auto-generated from decorators |
| **Error handling** | Global exception filter (HttpException, Prisma errors, unknown) |

---

## 5.3 Validation Summary

| Aspect | Status |
|--------|--------|
| Request body validation | ✅ class-validator decorators on all DTOs |
| Whitelist unknown properties | ✅ enabled globally |
| Forbid non-whitelisted | ✅ enabled globally |
| Response serialization | ✅ class-transformer on entities |
| Swagger types | ✅ @ApiProperty on all DTOs |
| OpenAPI generation | ✅ `pnpm generate:openapi` → 162 endpoints |
