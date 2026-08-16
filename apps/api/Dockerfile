# syntax=docker/dockerfile:1.7

# ──────────────────────────────────────────────────────────────────────────────
# Xennic API (NestJS + Fastify) — production image
# Build context: repository root
# ──────────────────────────────────────────────────────────────────────────────

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV PATH=$PNPM_HOME:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    make \
    g++ \
    python3 \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable

# ── deps: install workspace dependencies (frozen lockfile) ───────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/types/package.json packages/types/package.json
COPY services/bill-bot/package.json services/bill-bot/package.json

RUN pnpm install --frozen-lockfile

# ── build: generate Prisma client, build workspace packages + API ─────────────
FROM deps AS build
WORKDIR /app

COPY . .

RUN pnpm exec prisma generate \
    && pnpm --filter @xennic/database build \
    && pnpm --filter @xennic/api exec tsc

# ── runtime ───────────────────────────────────────────────────────────────────
FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

# pnpm uses an isolated node_modules layout: every workspace project keeps its
# own node_modules directory with symlinks into the root .pnpm store. Copying
# only the root node_modules would drop all 27 runtime dependencies declared in
# apps/api/package.json (@nestjs/platform-fastify, ioredis, minio, ...), so the
# whole linked set must be carried over together.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Application build output + its resolved dependencies
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules

# Workspace packages (database is resolved from its dist at runtime)
COPY --from=build /app/packages/database/dist ./packages/database/dist
COPY --from=build /app/packages/database/package.json ./packages/database/package.json
COPY --from=build /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/packages/types ./packages/types

# Prisma schema + migrations (used by `prisma migrate deploy` on startup)
COPY --from=build /app/prisma ./prisma

# Fail fast at build time if the runtime dependency graph is incomplete,
# instead of surfacing as an unhealthy container after deploy.
RUN node -e "require.resolve('@nestjs/platform-fastify',{paths:['/app/apps/api']});require.resolve('ioredis',{paths:['/app/apps/api']});require.resolve('minio',{paths:['/app/apps/api']});console.log('runtime dependency check: ok')"

COPY infrastructure/docker/api/entrypoint.sh /usr/local/bin/api-entrypoint.sh
RUN chmod +x /usr/local/bin/api-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["api-entrypoint.sh"]
