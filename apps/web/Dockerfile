FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @xennic/web build

FROM node:22-alpine

RUN apk add --no-cache curl tini

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

USER appuser

ENTRYPOINT ["tini", "--"]

CMD ["node", "apps/web/server.js"]
