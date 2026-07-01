# Build Validation Report — Sprint A5

**تاریخ**: تیر ۱۴۰۵ | **نسخه**: ۱.۰.۰ | **وضعیت**: ۴ از ۵ سرویس ✅

---

## Summary

| Service | Status | Image Size | Dockerfile | Build Time | Notes |
|---------|--------|------------|------------|------------|-------|
| engineering-service | ✅ **PASS** | 705MB | `workspace/services/engineering-service/Dockerfile` | ~8 min | Pip deps cached; fixed invalid `COPY` → `COPY ./pyproject.toml ./` |
| vision-service | ✅ **PASS** | 1.01GB | `workspace/services/vision-service/Dockerfile` | ~12 min | Fixed `libgl1-mesa-glx` → `libgl1` (Debian trixie rename) |
| ai-service | ✅ **PASS** | 567MB | `workspace/services/ai-service/Dockerfile` | ~5 min (cached) | Removed unused `COPY pyproject.toml` (file doesn't exist) |
| api | ✅ **PASS** | 896MB | `apps/api/Dockerfile` | ~15 min | 3 rounds of fixes: prisma schema copy, prisma generate order, CI env, pnpm install dev→prod |
| web | ❌ **BLOCKED** | — | `apps/web/Dockerfile` | Timed out | Next.js dependencies (pnpm install) too slow via npm registry (2-40 KiB/s) |

**Overall**: 4/5 services build successfully. Web build requires faster network or registry mirror.

---

## Issues Found & Fixed

### 1. Engineering-service: Invalid COPY syntax
**Problem**: `COPY ./pyproject.toml ./ 2>/dev/null || true` — Docker interprets shell operators as filenames
**Fix**: Changed to `COPY ./pyproject.toml ./`
**File**: `workspace/services/engineering-service/Dockerfile:22`

### 2. Vision-service: Missing package `libgl1-mesa-glx`
**Problem**: Package was renamed in Debian trixie (Python 3.12-slim base)
**Fix**: Changed to `libgl1`
**File**: `workspace/services/vision-service/Dockerfile:15`

### 3. AI-service: Copying non-existent file
**Problem**: `COPY ./pyproject.toml ./` — file doesn't exist in ai-service directory
**Fix**: Removed COPY line entirely (pyproject.toml not needed for production)
**File**: `workspace/services/ai-service/Dockerfile`

### 4. API: Prisma client not generated before build
**Problem**: `@prisma/client` exports (`workspaces`, `users`, etc.) needed by `packages/database/src/index.ts` were not available during tsc compilation
**Fix**: Added `COPY prisma ./prisma` and `RUN pnpm db:generate` before database build
**Files**: `apps/api/Dockerfile` lines 15, 20

### 5. API: `.prisma` directory not at expected path
**Problem**: Dockerfile tried to `COPY --from=builder /app/packages/database/node_modules/.prisma` — path doesn't exist (pnpm stores generated client in `.pnpm/` store)
**Fix**: Regenerate prisma client in production stage instead
**File**: `apps/api/Dockerfile` line 47 removed, lines 51-53 added

### 6. API: pnpm `--prod` skips devDependencies (prisma CLI)
**Problem**: `pnpm install --prod` doesn't install prisma, so `pnpm db:generate` fails
**Fix**: Two-step install: `pnpm install --frozen-lockfile` (all deps) → `prisma generate` → `pnpm install --prod` (prune dev)
**File**: `apps/api/Dockerfile` line 51-53

### 7. API: pnpm requires `CI=true` for non-TTY modules purge
**Problem**: Without TTY, pnpm refuses to purge modules directory
**Fix**: `CI=true pnpm install ...`
**File**: `apps/api/Dockerfile` line 51

### 8. Shared package: Missing `build` script
**Problem**: `@xennic/shared` had no `build` script, causing `pnpm --filter @xennic/shared build` to fail
**Fix**: Added `"build": "tsc -p tsconfig.json"` to `packages/shared/package.json`

### 9. API: OpenAPI generation in Docker
**Problem**: `pnpm --filter @xennic/api build` includes `generate:openapi` step which fails inside Docker
**Fix**: Changed to `pnpm --filter @xennic/api exec -- tsc -p tsconfig.json` (separate tsc from OpenAPI generation)
**File**: `apps/api/Dockerfile` line 25

---

## Image Details

| Service | Engine | Base Image | Layers | Entrypoint |
|---------|--------|------------|--------|------------|
| engineering-service | FastAPI | python:3.12-slim | 22 | tini → uvicorn |
| vision-service | FastAPI | python:3.12-slim | 21 | tini → uvicorn |
| ai-service | FastAPI | python:3.12-slim | 19 | tini → uvicorn |
| api | NestJS/Fastify | node:22-alpine | 42 | tini → node |

All images:
- ✅ Use non-root user (appuser)
- ✅ Have HEALTHCHECK directives
- ✅ Use tini as init system (PID 1)
- ✅ Multi-stage builds (smaller final images)

---

## Web Service — Build Failure Analysis

The web service uses Next.js and requires downloading all npm dependencies (react, next, next-intl, etc.) during `pnpm install`. The npm registry is currently unreliably slow (~2-40 KiB/s) on this network.

**Workarounds**:
1. Use a local npm registry mirror (e.g., `npm config set registry https://registry.npmmirror.com`)
2. Build on a machine with fast internet and push to Docker registry
3. Pre-cache node_modules and use COPY instead of pnpm install
4. Set up a CI/CD pipeline on GitHub Actions (fast network)

---

## Recommendation

Proceed with Alpha deployment of the 4 working services. The web service build can be completed separately once a faster network connection is available, or by using a pre-built Next.js image from the CI pipeline.
