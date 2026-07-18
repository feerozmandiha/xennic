# Security Audit — Sprint R3.0

**Date:** 2026-07-18

## Summary: ⚠️ CONDITIONAL PASS (2 CRITICAL, 5 HIGH findings)

## Risk Summary

| Severity    | Count | Action Required   |
| ----------- | ----- | ----------------- |
| CRITICAL    | 2     | Immediate         |
| HIGH        | 5     | Before production |
| MEDIUM      | 7     | Soon              |
| LOW         | 3     | Backlog           |
| INFO (pass) | 8     | None              |

## CRITICAL Findings

### SEC-001: Real Mistral API key in `apps/api/.env`

- Live API key `oMqTcVOfzK1ayavI6QPVCUIXowqE44cO` in plaintext
- File not tracked in git (safe from repo leak)
- **Action:** Rotate key, use environment variable injection in production

### SEC-002: Helmet installed but never registered

- `@fastify/helmet` v13.0.0 in package.json
- Never imported or registered in main.ts
- **No security headers:** No X-Content-Type-Options, X-Frame-Options, HSTS, CSP, X-XSS-Protection
- **Action:** Add `app.register(helmet)` in main.ts (one-line fix)

## HIGH Findings

### SEC-003: 57 dependency vulnerabilities (3 critical, 19 high)

- Both `apps/api` and `apps/web` affected
- DOMPurify XSS via jspdf (transitive)
- **Action:** Run `pnpm audit --fix`, update vulnerable deps

### SEC-004: No MIME type validation on file uploads

- Upload controllers accept any file with spoofed Content-Type
- No fileFilter configured in Multer
- **Action:** Add server-side MIME verification

### SEC-005: All infrastructure ports on 0.0.0.0

- PostgreSQL, Redis, RabbitMQ exposed to all network interfaces
- Weak default credentials (`xennic:xennic`, `minioadmin:minioadmin`)
- **Action:** Bind to 127.0.0.1 for local dev, use Docker network isolation

### SEC-006: Weak/real credentials in .env files

- `ADMIN_PASSWORD=Admin@12345` (weak)
- `SIGNED_URL_SECRET=xennic-signed-url-secret-key!!` (weak)
- `AI_MASTER_KEY=xennic-master-key-32chars!!` (weak)
- **Action:** Use strong secrets, inject via secrets manager in production

### SEC-007: AES encryption fallback key

- `apps/api/src/modules/ai-provider-management/infrastructure/encryption/aes-encryption.service.ts:17`
- Fallback key `'xennic-dev-fallback-key-2026!!'` used when AI_MASTER_KEY is unset
- **Action:** Remove fallback, require env var

## MEDIUM Findings

| #       | Finding                                     | Action                             |
| ------- | ------------------------------------------- | ---------------------------------- |
| SEC-008 | Swagger UI unguarded + persistAuthorization | Disable in production              |
| SEC-009 | Hardcoded AES encryption salt               | Use random per-deployment salt     |
| SEC-010 | No CSRF protection                          | Add CSRF for cookie-based flows    |
| SEC-011 | Silent error swallowing in repositories     | Log all errors                     |
| SEC-012 | Weak dev credentials throughout             | Document as dev-only               |
| SEC-013 | Vision CORS `allow_origins=["*"]`           | Restrict to known origins          |
| SEC-014 | No TLS at application level                 | Ensure nginx reverse proxy in prod |

## LOW Findings

| #       | Finding                                                    |
| ------- | ---------------------------------------------------------- |
| SEC-015 | Password hashing uses argon2id (GOOD)                      |
| SEC-016 | SQL injection prevented via Prisma tagged templates (GOOD) |
| SEC-017 | JWT keys have correct 600 permissions (GOOD)               |

## Security Strengths

| Area                  | Status                                               |
| --------------------- | ---------------------------------------------------- |
| Password hashing      | ✅ Argon2id (64MB, 3 iterations, 4 threads)          |
| JWT authentication    | ✅ RS256 with proper key management                  |
| RBAC                  | ✅ 173 guard/permission usages across codebase       |
| CORS                  | ✅ Env-driven, explicit origins, credentials         |
| Container security    | ✅ All Python services run as non-root `xennic` user |
| Gitignore for secrets | ✅ All .env files excluded from tracking             |
| Rate limiting         | ✅ 3-tier throttler with auth-specific hardening     |
| Validation            | ✅ 520 class-validator decorators, whitelist mode    |

## Score

**6.5/10** — Strong foundations (auth, RBAC, hashing) but critical gaps in HTTP security headers, dependency vulnerabilities, and credential management.
