FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY prisma ./prisma
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile

RUN pnpm db:generate && \
    pnpm --filter @xennic/database build && \
    pnpm --filter @xennic/shared build && \
    pnpm --filter @xennic/types build

RUN pnpm --filter @xennic/api exec -- tsc -p tsconfig.json
# OpenAPI generation skipped in Docker build (can be regenerated from running API)

FROM node:22-alpine

RUN apk add --no-cache curl tini

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/package.json ./packages/types/

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

RUN CI=true pnpm install --frozen-lockfile --filter @xennic/api && \
    pnpm db:generate && \
    CI=true pnpm install --prod --frozen-lockfile --filter @xennic/api

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

USER appuser

ENTRYPOINT ["tini", "--"]

CMD ["node", "apps/api/dist/main.js"]
