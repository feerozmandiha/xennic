# Xennic — Agent Guide

## Monorepo

pnpm workspace + Turborepo. Packages defined in `pnpm-workspace.yaml`:
`apps/*`, `packages/*`, `services/*`, `workspace/*`.

```bash
pnpm build          # turbo run build
pnpm dev            # turbo run dev
pnpm lint           # turbo run lint
pnpm test           # turbo run test  (dependsOn build — build first)
pnpm typecheck      # turbo run typecheck
pnpm format         # prettier . --write
pnpm format:check   # prettier . --check
```

## NestJS API (`apps/api`)

- **Fastify** adapter (not Express), port **3000**, prefix `/api/v1`
- Swagger at `/api/docs`
- `tsconfig.json` needs `experimentalDecorators: true`, `emitDecoratorMetadata: true`
- Validation: `whitelist: true`, `forbidNonWhitelisted: true`
- Unified response: `{success, data, meta}` / `{success, error}`
- OpenAPI auto-generated via `pnpm generate:openapi` → `packages/openapi/v1/openapi.json` — **never edit manually**
- Test depends on build (turbo.json); run via `pnpm test` at root

## Next.js Web (`apps/web`)

- Port **3001**, standalone output, next-intl i18n
- API proxy via rewrites → NestJS at `localhost:3000`

## Database

PostgreSQL 17, Prisma ORM. Schema at `prisma/schema.prisma`.
All entity IDs are UUIDs, multi-tenant via `workspace_id`.

```bash
pnpm db:apply    # prisma db push && prisma generate && node prisma/seed.js
pnpm db:reset    # prisma migrate reset --force && node prisma/seed.js
pnpm db:generate # prisma generate
pnpm db:studio   # prisma studio
```

## Python Microservices (`workspace/services/`)

Each has its own venv and toolchain:

| Service | Port | Framework | Lint/Type | Test |
|---------|------|-----------|-----------|------|
| `engineering-service/` | 8001 | FastAPI | ruff, mypy | pytest --cov=src |
| `ai-service/` | 8002 | FastAPI | ruff, mypy | pytest |

Run inside service directory after `source venv/bin/activate`:
```bash
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001
ruff check src tests
mypy src
pytest tests -v --cov=src --cov-report=term-missing
```

## Docker

- Infra stack: `infrastructure/docker/compose/base/docker-compose.yml` (Postgres 17, Redis 8, RabbitMQ 4, engineering, ai)
- Vector DB: `workspace/docker-compose.yml` (Qdrant)

## Config & Formatting

- EditorConfig: 2-space indent, LF, UTF-8
- Prettier: semi, singleQuote, trailingComma all, printWidth 100
- Shared base at `packages/config/`
- `.eslintrc.cjs` extends `packages/config/eslint.base.js`

## Notable Quirks

- `nest-cli.json` root is `apps/xennic` but actual app is `apps/api` — stale
- `services/api-gateway/` is empty (placeholder)
- `.env` files: root, `apps/web/.env.local`, per-service dirs, `infrastructure/docker/.env`
- Docs reference in `opencode.json`: `/home/ahmad/xennic-docs/docs`
- Root `apps/web` is the Next.js frontend; `apps/api` is the NestJS backend
