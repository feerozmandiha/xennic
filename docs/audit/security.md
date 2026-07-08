# Security Audit Report — Xennic Platform

**Date:** 2026-07-02
**Scope:** Entire monorepo (apps/api, apps/web, workspace/services/*)
**Severity Levels:** CRITICAL • HIGH • MEDIUM • LOW • INFO

---

## 1. Authentication (JWT)

### 1.1 JWT Implementation
| Finding | Severity | Location |
|---------|----------|----------|
| RS256 algorithm with RSA key pair — cryptographically sound | ✅ GOOD | `apps/api/src/modules/auth/auth.module.ts:18-21` |
| Access token TTL = 900s (15 min) — appropriate | ✅ GOOD | `.env.example:29` |
| Refresh token TTL = 2,592,000s (30 days) — standard | ✅ GOOD | `.env.example:30` |
| Refresh token rotation (revoke on reuse) — prevents replay | ✅ GOOD | `apps/api/src/modules/auth/application/services/auth.service.ts:114` |
| Refresh token stored as SHA-256 hash — not plaintext | ✅ GOOD | `auth.service.ts:102-103` |
| Argon2id password hashing — industry best practice | ✅ GOOD | `auth.module.ts:10` |
| JWT keys stored on filesystem (not committed in prod) | ⚠️ OK | `.env.example:27-28` |
| **JWT RSA private key committed to git repository** | **🔴 CRITICAL** | `infrastructure/docker/secrets/jwtRS256.key` |

### 1.2 Missing Authentication Features
| Finding | Severity | Location |
|---------|----------|----------|
| No MFA/2FA support | 🟡 MEDIUM | Not implemented anywhere |
| No account lockout after failed attempts | 🟡 MEDIUM | `auth.service.ts:73-98` |
| No email verification enforcement | 🟢 LOW | `auth.service.ts:84` — checks `isActive()` only |
| Password reset token: 32 bytes hex, 15-min expiry, SHA-256 hash | ✅ GOOD | `auth.service.ts:184-186` |

### 1.3 Token Refresh Security
- Old refresh token is revoked on refresh (`auth.service.ts:114`)
- Revoke-all on logout (`auth.service.ts:121-122`)
- No refresh token reuse detection (token rotation on each refresh only — does not check if old token was already revoked before use)
- Session management: sessions table with IP + user-agent tracking (`schema.prisma:69-83`)

---

## 2. Authorization

### 2.1 RBAC Implementation
| Finding | Severity | Location |
|---------|----------|----------|
| `@RequirePermissions` decorator with centralized guard | ✅ GOOD | `apps/api/src/modules/rbac/infrastructure/decorators/permissions.decorator.ts` |
| `PermissionsGuard` checks permissions via `AuthorizationService` | ✅ GOOD | `apps/api/src/modules/rbac/infrastructure/guards/permissions.guard.ts` |
| Workspace owners automatically get all permissions bypass | ⚠️ INFO | `apps/api/src/modules/rbac/application/services/authorization.service.ts:23-29` |
| SUPER_ADMIN role bypasses all permission checks | ⚠️ INFO | `authorization.service.ts:50-52` |
| **PermissionsGuard: fail-open on unexpected errors (returns true)** | **🟠 HIGH** | `permissions.guard.ts:73-74` |

### 2.2 Guard Coverage Audit
| Controller | Guards Used | Issues |
|------------|-------------|--------|
| **UserController** | **NONE** | **🔴 CRITICAL — create, findAll, findOne, update, delete, hardDelete all public** |
| WorkspaceController | JwtAuthGuard | findOne(id) doesn't verify user membership |
| WorkspaceController.hardDelete | JwtAuthGuard | No ownership check — any user can hard-delete any workspace |
| SubscriptionController | JwtAuthGuard | No workspace guard on getPlans/getPlan |
| AuthController | JwtAuthGuard (3 endpoints) | Login/register/refresh have rate limiting but no auth guard (correct) |
| AiController | JwtAuthGuard + WorkspaceGuard | ✅ Good |
| StorageController | JwtAuthGuard + WorkspaceGuard + PermissionsGuard | ✅ Good |
| BillingController | JwtAuthGuard + WorkspaceGuard | ✅ Good |
| ConsultationsController | JwtAuthGuard + WorkspaceGuard | **findOne/updateStatus skip workspace isolation** |
| RoleController | JwtAuthGuard + PermissionsGuard | No WorkspaceGuard — roles are global |
| PermissionController | JwtAuthGuard + PermissionsGuard | No WorkspaceGuard |

---

## 3. RBAC Guards

### 3.1 AdminGuard
- Checks `SUPER_ADMIN` or `PLATFORM_ADMIN` via RBAC (primary)
- Falls back to `is_admin` column on `users` table (secondary)
- No insecure email-based fallback
- Location: `apps/api/src/modules/admin/infrastructure/guards/admin.guard.ts:31`

### 3.2 SuperAdminGuard
- Only `SUPER_ADMIN` role allowed
- No fallback
- Location: `apps/api/src/common/guards/super-admin.guard.ts:34`

### 3.3 WorkspaceGuard
- Extracts workspaceId from: `x-workspace-id` header → `params.workspaceId` → `params.id` → `body.workspaceId`
- Falls back to first workspace via raw SQL query if not provided
- Checks membership via `workspaceService.isUserMember()`
- **Fallback to first workspace could cause accidental cross-workspace access when header is missing**
- Location: `apps/api/src/modules/rbac/infrastructure/guards/workspace.guard.ts:32-48`

### 3.4 AuthorizationService Flaws
- `_getMemberRole` fallback grants `*` (all permissions) to any workspace member (`authorization.service.ts:101`)
- This means any member role (MEMBER, VIEWER) gets full access permissions
- The comment says "دسترسی به محاسبات پایه" but the code returns `['*']`

---

## 4. Workspace Isolation

| Finding | Severity | Location |
|---------|----------|----------|
| WorkspaceGuard enforces workspace_id from headers/params | ✅ GOOD | `workspace.guard.ts:32-39` |
| Most controllers use WorkspaceGuard | ✅ GOOD | See guard coverage audit |
| **ConsultationsController.findOne(id) — no workspaceId check** | **🟠 HIGH** | `consultations.controller.ts:42-44` |
| **ConsultationsController.aiReply(id) — no workspaceId check** | **🟠 HIGH** | `consultations.controller.ts:78-80` |
| **ConsultationsController.updateStatus(id) — no workspaceId check** | **🟠 HIGH** | `consultations.controller.ts:86-88` |
| **UserController — no guards at all** | **🔴 CRITICAL** | `user.controller.ts:34` |
| **WorkspaceController.findOne(id) — no membership check** | **🟡 MEDIUM** | `workspace.controller.ts:101-103` |
| **WorkspaceController.hardDelete(id) — no ownership check** | **🟠 HIGH** | `workspace.controller.ts:153-155` |

---

## 5. Tenant Isolation

- Multi-tenant via `workspace_id` column on all entities (`schema.prisma`)
- WorkspaceGuard intercepts all requests and sets `req.workspaceId`
- Services filter by `req.workspaceId` consistently
- `findById` + workspace comparison pattern used in services (e.g., `storage.service.ts:181-186`)
- **AiRepository.findConversation does NOT filter by workspaceId** — relies on AiService to check (`ai.repository.ts:42-50`), which is correct but defense-in-depth would be better

---

## 6. Secret Management

| Finding | Severity | Location |
|---------|----------|----------|
| **JWT private key committed to git** | **🔴 CRITICAL** | `infrastructure/docker/secrets/jwtRS256.key` |
| **JWT public key committed to git** | **🟡 MEDIUM** | `infrastructure/docker/secrets/jwtRS256.key.pub` |
| **GROQ_API_KEY (live) in apps/api/.env** | **🔴 CRITICAL** | `apps/api/.env:31` |
| **GROQ_API_KEY (live) in engineering-service/.env** | **🔴 CRITICAL** | `workspace/services/engineering-service/.env:5` |
| **ADMIN_PASSWORD=Admin@12345 in .env** | **🟠 HIGH** | `apps/api/.env:37` |
| **POSTGRES_PASSWORD=xennic123 — weak dev password** | **🟡 MEDIUM** | `infrastructure/docker/.env:3` |
| **MINIO admin creds hardcoded** | **🟡 MEDIUM** | `infrastructure/docker/.env:21-22` |
| **ENCRYPTION_MASTER_KEY hardcoded** | **🟠 HIGH** | `apps/api/.env:47` |
| **SIGNED_URL_SECRET hardcoded** | **🟠 HIGH** | `apps/api/.env:48` |
| **.env files NOT in .gitignore check — committed** | **🔴 CRITICAL** | `.env`, `apps/api/.env`, etc. |
| **Zarinpal merchant ID in .env** | **🟡 MEDIUM** | `apps/api/.env:44` |
| Production .env.example has `CHANGE_ME` placeholders — good | ✅ GOOD | `infrastructure/docker/compose/production/.env.production.example` |

---

## 7. JWT Analysis

| Finding | Severity | Location |
|---------|----------|----------|
| Algorithm: RS256 (asymmetric) — correct | ✅ GOOD | `auth.module.ts:19`, `jwt.strategy.ts:16` |
| Key size: 4096-bit RSA — adequate | ✅ GOOD | `jwtRS256.key` |
| Issuer and audience validation enabled | ✅ GOOD | `jwt.service.ts:22-23` |
| Key files committed to repo (dev) | **🔴 CRITICAL** | `infrastructure/docker/secrets/` |
| Production uses Docker secrets (`/run/secrets/jwt_private_key`) | ✅ GOOD | `.env.production.example:125-126` |
| Token expiry verified (`ignoreExpiration: false`) | ✅ GOOD | `jwt.strategy.ts:14` |
| Payload contains: sub, email, workspaceId, roles — appropriate | ✅ GOOD | `jwt-payload.vo.ts:2-6` |

---

## 8. API Validation

| Finding | Severity | Location |
|---------|----------|----------|
| Global ValidationPipe: whitelist=true ✅ | ✅ GOOD | `main.ts:33-38` |
| forbidNonWhitelisted=true ✅ | ✅ GOOD | `main.ts:36` |
| forbidUnknownValues=true ✅ | ✅ GOOD | `main.ts:37` |
| transform=true (enables auto-type conversion) | ⚠️ OK | `main.ts:34` |
| class-validator decorators on all DTOs | ✅ GOOD | All DTO files |
| Password complexity enforced (uppercase, lowercase, digit, special) | ✅ GOOD | `auth.dto.ts:40-41` |

---

## 9. DTO Validation

- **LoginDto**: `@IsEmail()`, `@IsNotEmpty()` — ✅
- **RegisterDto**: `@IsEmail()`, `@MinLength(2)`, `@MaxLength(50)`, password complexity — ✅
- **RefreshTokenDto**: `@IsString()`, `@IsNotEmpty()` — ✅
- **ResetPasswordDto**: `@MinLength(8)`, password complexity — ✅
- **SendMessageDto**: `@MaxLength(4000)` — input length limit ✅
- **ValidateCalculationDto**: `inputs` is `Record<string, any>` — **no type validation** 🟡 MEDIUM
- **CreateWebhookDto**: needs URL validation (done in service) ✅

---

## 10. SQL Injection

| Finding | Severity | Location |
|---------|----------|----------|
| All raw queries use parameterized `$queryRaw` with `${var}` (safe) | ✅ GOOD | All `*repository.ts` files |
| No raw string concatenation found | ✅ GOOD | |
| Prisma ORM as primary data access layer | ✅ GOOD | |
| `$executeRaw` also uses parameterized variables | ✅ GOOD | `ai.repository.ts:35-39` |
| Raw SQL in guards: `workspace.guard.ts:79-82`, `admin.guard.ts:76-83` — parameterized ✅ | ✅ GOOD |

---

## 11. Prompt Injection

| Finding | Severity | Location |
|---------|----------|----------|
| **User message sent directly to LLM without sanitization** | **🟠 HIGH** | `ai.service.ts:86-90` |
| **validateCalculation inlines raw user input (type, inputs, result) into system prompt** | **🔴 CRITICAL** | `ai.service.ts:169-197` |
| No input filtering of malicious prompt engineering strings | **🟠 HIGH** | `ai.service.ts` |
| No rate limiting on AI prompt size | 🟢 LOW | `ai.dto.ts:19` — 4000 char limit on `SendMessageDto` |
| **System prompt stored in DB as message** | **🟡 MEDIUM** | `ai.service.ts:47-53` |
| System prompt contains proprietary engineering knowledge | 🟡 MEDIUM | `llm.provider.ts:63-80` |

**Risk**: An attacker can inject prompts like "Ignore your previous instructions..." to extract the system prompt or bypass content restrictions.

---

## 12. Tool Injection

Not applicable — the AI service does not implement a tool/function-calling framework. Only free-form text LLM chat.

---

## 13. SSRF (Server-Side Request Forgery)

| Finding | Severity | Location |
|---------|----------|----------|
| **Webhook delivery uses `fetch(webhook.url)` without IP validation** | **🔴 CRITICAL** | `apps/api/src/modules/webhooks/application/services/webhook.service.ts:133` |
| URL validation only checks protocol (http/https) | 🟡 MEDIUM | `webhook.service.ts:152-160` |
| **No blocklist for private/internal IPs (127.0.0.1, 10.x.x.x, 172.16.x.x, 192.168.x.x)** | **🔴 CRITICAL** | |
| Timeout of 10s prevents indefinite hang | ✅ GOOD | `webhook.service.ts:137` |
| LLM provider calls go to configured API URLs only | ✅ GOOD | `llm.provider.ts:138` |

**Risk**: A user can create a webhook pointing to `http://localhost:5432` or internal cloud metadata endpoints (`http://169.254.169.254/`).

---

## 14. CSRF

| Finding | Severity | Location |
|---------|----------|----------|
| **No CSRF protection middleware** | **🟡 MEDIUM** | Not imported |
| JWT Bearer token from `Authorization` header — immune to standard CSRF | ⚠️ Mitigated | Auth header not auto-sent by browser |
| Fastify CSRF module not registered | 🟢 LOW | |

**Note**: Since authentication uses JWT in `Authorization` header (not cookies), CSRF attack surface is limited. If cookie-based auth is added in the future, CSRF protection will be required.

---

## 15. CORS

| Finding | Severity | Location |
|---------|----------|----------|
| CORS origins from env var `CORS_ORIGINS` — explicit allowlist | ✅ GOOD | `main.ts:59-61` |
| Fallback to localhost:3000,3001 in dev | ✅ GOOD | `main.ts:61` |
| `credentials: true` — allows cookies (if used) | ✅ GOOD | `main.ts:74` |
| Methods restricted to standard HTTP verbs | ✅ GOOD | `main.ts:65` |
| Allowed headers explicitly listed | ✅ GOOD | `main.ts:66-73` |
| No wildcard origin (`*`) — safe | ✅ GOOD | |

---

## 16. Path Traversal

| Finding | Severity | Location |
|----------|----------|---------|
| File paths use `${workspaceId}/${year}/${month}/${randomUUID}.${ext}` — safe | ✅ GOOD | `apps/api/src/modules/storage/application/services/storage.service.ts:64` |
| Extension extracted via `path.extname()` — safe | ✅ GOOD | `storage.service.ts:61` |
| No user-controlled path components in MinIO object keys | ✅ GOOD | |
| **Webhook URL not checked for path traversal — but limited by URL parser** | 🟢 LOW | `webhook.service.ts:152-160` |

---

## 17. File Upload

| Finding | Severity | Location |
|----------|----------|---------|
| MIME type allowlist enforced | ✅ GOOD | `storage.service.ts:17-31` |
| Max file size: 100MB (configurable) | ✅ GOOD | `main.ts:25`, `storage.service.ts:15` |
| Files stored with random UUID filename (no user-controlled name) | ✅ GOOD | `storage.service.ts:62` |
| SHA-256 checksum computed on upload | ✅ GOOD | `storage.service.ts:65` |
| `@fastify/multipart` with size limits | ✅ GOOD | `main.ts:21-29` |
| Extension whitelist NOT enforced (only MIME type) | 🟡 MEDIUM | Application/octet-stream allowed — generic |
| ZIP and octet-stream allowed in MIME allowlist — potential risk | 🟢 LOW | `storage.service.ts:29` |

---

## 18. Rate Limiting

| Finding | Severity | Location |
|----------|----------|---------|
| Global rate limiter: 10 req/10s (short), 100 req/60s (medium), 1000 req/3600s (long) | ✅ GOOD | `apps/api/src/api.module.ts:57-73` |
| Auth-specific throttle guard: 5 req/60s | ✅ GOOD | `apps/api/src/common/guards/auth-throttler.guard.ts` |
| Tracker uses `IP:UserID` for auth endpoints | ✅ GOOD | `auth-throttler.guard.ts:21` |
| Tracker uses `IP:UserID` for general endpoints | ✅ GOOD | `throttler.guard.ts:20` |
| **AuthThrottlerGuard not applied to auth controller endpoints** | **🟡 MEDIUM** | `auth.controller.ts` — no `@UseGuards(AuthThrottlerGuard)` |
| Rate limiting config in `.env.example` (THROTTLE_*) not actually consumed by code | 🟢 LOW | `.env.example:74-83` |

---

## 19. Prompt Leakage

| Finding | Severity | Location |
|----------|----------|---------|
| **System prompt saved as message in DB (metadata.type = 'system_prompt')** | **🟡 MEDIUM** | `apps/api/src/modules/ai/application/services/ai.service.ts:47-53` |
| Response DTOs filter out system messages | ✅ GOOD | `ai.dto.ts:124` |
| Proprietary engineering knowledge in system prompt | 🟡 MEDIUM | `llm.provider.ts:63-80` |
| No encryption at rest for AI messages | 🟢 LOW | Plaintext in PostgreSQL |

**Risk**: Anyone with direct DB access or a successful SQL injection could extract the system prompt.

---

## 20. Data Leakage

| Finding | Severity | Location |
|----------|----------|---------|
| Global exception filter masks internal errors in production | ✅ GOOD | `apps/api/src/shared/filters/all-exceptions.filter.ts:62-64` |
| Prisma error codes mapped to safe messages | ✅ GOOD | `all-exceptions.filter.ts:135-153` |
| Validation errors expose field names only — acceptable | ✅ GOOD | `all-exceptions.filter.ts:106-126` |
| Stack traces suppressed in production | ✅ GOOD | `all-exceptions.filter.ts:67` |
| **Console.log used for audit events (not logger)** | 🟢 LOW | `auth.service.ts:96,132,197,227,245` |
| **File upload error messages leak internal error details** | 🟡 MEDIUM | `storage.controller.ts:96` — `error.message` included in response |

---

## 21. Dependencies

| Finding | Severity | Location |
|----------|----------|---------|
| NestJS 11.1 — current | ✅ GOOD | `package.json` |
| Prisma 6.19.3 — current | ✅ GOOD | `package.json` |
| `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` in deps | ✅ GOOD | `package.json` (root hoisted) |
| `@fastify/multipart` for file uploads | ✅ GOOD | `apps/api/package.json:17` |
| **No `helmet` package for security headers** | **🟠 HIGH** | Not in any package.json |
| **No `@fastify/csrf` or `@fastify/cookie`** | 🟢 LOW | Not in any package.json |
| `argon2` for password hashing — strong | ✅ GOOD | `package.json:53` |
| `minio` client SDK — standard | ✅ GOOD | `apps/api/package.json:27` |

---

## 22. HTTP Headers

| Finding | Severity | Location |
|----------|----------|---------|
| **No Helmet middleware — missing security headers** | **🟠 HIGH** | Not configured in `main.ts` |
| **Missing headers:** X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, X-XSS-Protection, Content-Security-Policy, Referrer-Policy, Permissions-Policy | **🟠 HIGH** | |
| Fastify adapter — would need `@fastify/helmet` | **🟠 HIGH** | |

---

## 23. Additional Findings

### 23.1 Critical: Encryption Master Key
- `ENCRYPTION_MASTER_KEY=xennic-master-key-32chars!!` hardcoded in `.env`
- This key likely encrypts sensitive data at rest
- **🔴 CRITICAL** — `apps/api/.env:47`

### 23.2 Critical: Hard Delete Endpoints Public
- `UserController.hardDelete(id)` — no authentication, no authorization
- `WorkspaceController.hardDelete(id)` — only JwtAuthGuard, no ownership check
- **🔴 CRITICAL** — `user.controller.ts:178-179`, `workspace.controller.ts:153-155`

### 23.3 Critical: UserController Missing Guards
- All endpoints (create, findAll, findOne, update, remove, restore, hardDelete) have **no guards at all**
- Any unauthenticated user can list all users, delete any user, etc.
- **🔴 CRITICAL** — `user.controller.ts:92-181`

### 23.4 High: RBAC Permission Bypass
- `PermissionsGuard` returns `true` on unexpected errors (fail-open)
- `AuthorizationService._getMemberRole` fallback grants `['*']` permissions to any workspace member
- **🟠 HIGH** — `permissions.guard.ts:73-74`, `authorization.service.ts:101`

### 23.5 High: SSRF via Webhooks
- `fetch(webhook.url)` without IP validation can target internal services
- **🔴 CRITICAL** — `webhook.service.ts:133`

### 23.6 Medium: No Audit Trail for Security Events
- Console.log used instead of structured audit logging
- `audit_logs` table exists in schema but not populated from auth events
- **🟡 MEDIUM** — `auth.service.ts`, `schema.prisma:1149-1170`

### 23.7 Medium: Weak Dev Credentials
- `ADMIN_PASSWORD=Admin@12345` — meets complexity but weak
- `POSTGRES_PASSWORD=xennic123` — very weak
- `REDIS_PASSWORD=S7cfYHFut2S7aZF9H9KvZASA` — appears strong
- **🟡 MEDIUM** — `.env` files

### 23.8 Medium: vision-service/.env Empty API Keys
- `GROQ_API_KEY=`, `OPENAI_API_KEY=`, `ANTHROPIC_API_KEY=` — empty
- If service runs without keys, it may use mock mode or fail
- **🟢 LOW** — `workspace/services/vision-service/.env:14-16`

### 23.9 Info: Prisma Raw SQL in Guards
- `workspace.guard.ts:79` runs raw SQL on every request when no workspace header present
- Performance concern, not a security vulnerability
- **ℹ️ INFO**

---

## Severity Summary

| Severity | Count | Key Issues |
|----------|-------|------------|
| 🔴 CRITICAL | 7 | JWT keys committed, GROQ keys committed, UserController unguarded, SSRF, hard delete endpoints public, encryption master key hardcoded, .env files committed |
| 🟠 HIGH | 7 | No helmet headers, prompt injection, PermissionsGuard fail-open, consultations missing workspace isolation, workspace hardDelete unowned, ENCRYPTION_MASTER_KEY, SIGNED_URL_SECRET |
| 🟡 MEDIUM | 10 | No MFA, no account lockout, empty API keys in vision-service, fallback permissions, global roles without workspace guard, system prompt in DB, weak dev passwords, no audit trail |
| 🟢 LOW | 5 | Console.log audit, vision-service empty keys, ZIP/octet-stream allowed, AuthThrottlerGuard not applied, import resolution |

---

## Recommended Remediations (Priority Order)

### Immediate (P0)
1. **Remove committed secrets and rotate all keys** — regenerate JWT RSA keys, rotate GROQ_API_KEY, change all passwords
   - Files: `infrastructure/docker/secrets/*`, `.env`, `apps/api/.env`, `workspace/services/engineering-service/.env`
2. **Add authentication guards to UserController** — `@UseGuards(JwtAuthGuard, AdminGuard)`
   - File: `apps/api/src/modules/user/presentation/controllers/user.controller.ts:92`
3. **Fix workspace isolation gaps**:
   - `consultations.controller.ts:42` — check workspaceId
   - `consultations.controller.ts:78` — check workspaceId
   - `consultations.controller.ts:86` — check workspaceId
   - `workspace.controller.ts:101` — check membership
   - `workspace.controller.ts:153` — check ownership
4. **Add SSRF protection** — validate webhook URLs against private IP ranges and internal hostnames
   - File: `apps/api/src/modules/webhooks/application/services/webhook.service.ts:152`
5. **Add Helmet middleware** for security headers
   - File: `apps/api/src/main.ts` — register `@fastify/helmet`

### Short-term (P1)
6. **Sanitize LLM inputs** — add prompt injection detection/filtering
   - Files: `apps/api/src/modules/ai/application/services/ai.service.ts:89,169-197`
7. **Fix PermissionsGuard fail-open** → fail-closed (deny on unknown errors)
   - File: `apps/api/src/modules/rbac/infrastructure/guards/permissions.guard.ts:73`
8. **Replace console.log with structured audit logging**
   - File: `apps/api/src/modules/auth/application/services/auth.service.ts`
9. **Apply AuthThrottlerGuard** to auth endpoints
   - File: `apps/api/src/modules/auth/presentation/controllers/auth.controller.ts`

### Medium-term (P2)
10. **Add MFA/2FA support**
11. **Implement account lockout** after N failed login attempts
12. **Add refresh token reuse detection** (check if token was already revoked)
13. **Implement proper audit trail** using `audit_logs` table
14. **Enforce extension whitelist** for file uploads (in addition to MIME type)
15. **Encrypt AI messages at rest**

---

## Appendix: Files Audited

```
apps/api/src/main.ts
apps/api/src/api.module.ts
apps/api/src/modules/auth/auth.module.ts
apps/api/src/modules/auth/application/services/auth.service.ts
apps/api/src/modules/auth/presentation/controllers/auth.controller.ts
apps/api/src/modules/auth/presentation/dtos/auth.dto.ts
apps/api/src/modules/auth/presentation/strategies/jwt.strategy.ts
apps/api/src/modules/auth/infrastructure/guards/jwt-auth.guard.ts
apps/api/src/modules/auth/infrastructure/jwt/jwt.service.ts
apps/api/src/modules/auth/domain/value-objects/jwt-payload.vo.ts
apps/api/src/modules/rbac/rbac.module.ts
apps/api/src/modules/rbac/application/services/authorization.service.ts
apps/api/src/modules/rbac/infrastructure/guards/permissions.guard.ts
apps/api/src/modules/rbac/infrastructure/guards/workspace.guard.ts
apps/api/src/modules/rbac/infrastructure/decorators/permissions.decorator.ts
apps/api/src/modules/admin/infrastructure/guards/admin.guard.ts
apps/api/src/modules/common/guards/super-admin.guard.ts
apps/api/src/modules/common/guards/throttler.guard.ts
apps/api/src/modules/common/guards/auth-throttler.guard.ts
apps/api/src/modules/common/guards/rate-limit.decorator.ts
apps/api/src/modules/ai/application/services/ai.service.ts
apps/api/src/modules/ai/infrastructure/repositories/ai.repository.ts
apps/api/src/modules/ai/infrastructure/providers/llm.provider.ts
apps/api/src/modules/ai/presentation/controllers/ai.controller.ts
apps/api/src/modules/ai/presentation/dtos/ai.dto.ts
apps/api/src/modules/storage/application/services/storage.service.ts
apps/api/src/modules/storage/infrastructure/minio/minio.service.ts
apps/api/src/modules/storage/presentation/controllers/storage.controller.ts
apps/api/src/modules/storage/presentation/dtos/storage.dto.ts
apps/api/src/modules/webhooks/application/services/webhook.service.ts
apps/api/src/modules/webhooks/presentation/controllers/webhook.controller.ts
apps/api/src/modules/user/presentation/controllers/user.controller.ts
apps/api/src/modules/workspace/presentation/controllers/workspace.controller.ts
apps/api/src/modules/consultations/presentation/controllers/consultations.controller.ts
apps/api/src/modules/subscription/presentation/controllers/subscription.controller.ts
apps/api/src/shared/filters/all-exceptions.filter.ts
prisma/schema.prisma
.env / .env.example
apps/api/.env
apps/web/.env.local
infrastructure/docker/.env
infrastructure/docker/secrets/jwtRS256.key
infrastructure/docker/secrets/jwtRS256.key.pub
infrastructure/docker/compose/base/docker-compose.yml
infrastructure/docker/compose/production/.env.production.example
workspace/services/ai-service/.env
workspace/services/engineering-service/.env
workspace/services/vision-service/.env
```
