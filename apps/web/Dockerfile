# syntax=docker/dockerfile:1.7

# ──────────────────────────────────────────────────────────────────────────────
# Xennic Web (Next.js, standalone output) — production image
# Build context: repository root
# ──────────────────────────────────────────────────────────────────────────────

FROM node:22-bookworm-slim AS deps

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

# ── build ─────────────────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app

# NEXT_PUBLIC_* are inlined at build time. Default to the same public origin
# served by the reverse proxy (single-origin); override via build args.
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_VISION_API_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_VISION_API_URL=$NEXT_PUBLIC_VISION_API_URL \
    NEXT_TELEMETRY_DISABLED=1

COPY . .

RUN pnpm --filter @xennic/web build

# ── runtime (Next.js standalone server) ───────────────────────────────────────
FROM node:22-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3001

CMD ["node", "apps/web/server.js"]
