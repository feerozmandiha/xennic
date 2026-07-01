# Platform Core Report

_Sprint A2 — 2026-06-27_

## Configuration Hardening

**Status: ✅ Complete**

### ConfigModule
- **File:** `apps/api/src/config/config.module.ts`
- **Schema:** Zod-based validation at `apps/api/src/config/env-validation.ts`
- **Validation:** 48 environment variables validated at startup
- **Fail-fast:** Application exits on invalid config with detailed error messages
- **Typing:** Full TypeScript type inference via `z.infer<typeof envSchema>`
- **Injection:** `'CONFIG'` provider token, injectable in any module
- **Access:** `getConfig()` function for use in `main.ts` before module init

### Validated Variables

| Category | Variables | Required |
|----------|-----------|----------|
| Node | `NODE_ENV`, `PORT`, `HOST` | PORT defaults to 3000 |
| Database | `DATABASE_URL` | ✅ Required (PostgreSQL) |
| JWT | `JWT_PRIVATE_KEY_PATH`, `JWT_PUBLIC_KEY_PATH`, `JWT_ACCESS_TOKEN_TTL`, `JWT_REFRESH_TOKEN_TTL`, `JWT_ISSUER`, `JWT_AUDIENCE` | Key paths required |
| Redis | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Optional (defaults) |
| RabbitMQ | `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS` | Optional |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional |
| MinIO | `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_USE_SSL` | Optional |
| AI | `GROQ_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` | Optional |
| CORS | `CORS_ORIGINS` | Optional (defaults to localhost) |
| Admin | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Optional |
| Microservices | `ENGINEERING_SERVICE_URL`, `AI_SERVICE_URL`, `VISION_SERVICE_URL` | Optional |
| Payment | `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX` | Optional |

## Standard Error System

**Status: ✅ Complete**

### Error Hierarchy

```
AppError (abstract)
├── ValidationError      → 400 VALIDATION_ERROR
├── AuthenticationError  → 401 AUTHENTICATION_ERROR
├── AuthorizationError   → 403 AUTHORIZATION_ERROR
├── BusinessError        → 422 BUSINESS_ERROR
├── InfrastructureError  → 503 INFRASTRUCTURE_ERROR
├── KnowledgeError       → 422 KNOWLEDGE_ERROR
└── AIError              → 502 AI_ERROR
```

### Features
- **Correlation IDs:** Every error gets a correlation ID (from request header or auto-generated)
- **RFC7807 Responses:** All errors return Problem Details (RFC 7807) format
- **Error Codes:** Machine-readable error codes for programmatic handling
- **Structured Details:** Optional `details` field for field-level errors
- **Prisma Error Mapping:** `P2002` → CONFLICT, `P2003` → BUSINESS_ERROR, `P2025` → NOT_FOUND

### Response Format
```json
{
  "type": "https://xennic.dev/errors/validation",
  "title": "VALIDATION_ERROR",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/api/v1/users",
  "correlationId": "abc-123-def",
  "timestamp": "2026-06-27T10:00:00.000Z",
  "errors": { "email": ["email must be a valid email address"] }
}
```

## Correlation ID System

**Status: ✅ Complete**

- **Interceptor:** `CorrelationIdInterceptor` reads `x-correlation-id` header or generates UUID
- **Propagation:** Correlation ID flows through all layers (HTTP → service → repository → events)
- **Response Header:** `x-correlation-id` returned in every response
- **File:** `apps/api/src/shared/interceptors/correlation-id.interceptor.ts`
