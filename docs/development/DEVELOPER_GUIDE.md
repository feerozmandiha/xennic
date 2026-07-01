# Developer Guide — راهنمای توسعه‌دهندگان

**آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## پیش‌نیازها

```bash
node >= 20    pnpm >= 9    python >= 3.12
docker >= 24  docker compose >= 2
```

---

## راه‌اندازی

```bash
# 1. نصب وابستگی‌ها
pnpm install

# 2. زیرساخت
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d
docker compose -f workspace/docker-compose.yml up -d

# 3. دیتابیس
pnpm db:apply

# 4. Environment
cp .env.example .env  # و ویرایش

# 5. اجرا
pnpm dev
```

---

## دستورات روزانه

```bash
pnpm dev              # تمام سرویس‌ها
pnpm build            # build همه
pnpm lint             # lint همه
pnpm test             # تست همه (build اول)
pnpm typecheck        # TypeScript type check
pnpm format           # Prettier
```

### Python Services

```bash
# Vision Service (پورت 8003)
cd workspace/services/vision-service
source venv/bin/activate
uvicorn app.main:app --reload --port 8003

# Engineering Service (پورت 8001)
cd workspace/services/engineering-service
source venv/bin/activate
uvicorn src.main:app --reload --port 8001

# AI Service (پورت 8002)
cd workspace/services/ai-service
source venv/bin/activate
uvicorn src.main:app --reload --port 8002
```

### Python Lint/Type/Test

```bash
cd workspace/services/vision-service
source venv/bin/activate
ruff check src tests
mypy src
pytest tests -v --cov=app --cov-report=term-missing
```

---

## ساختار Monorepo

```
xennic/
├── apps/
│   ├── api/           # NestJS API (Fastify)
│   └── web/           # Next.js Frontend
├── packages/
│   ├── config/        # Shared configs
│   └── openapi/       # OpenAPI (auto-generated)
├── services/
│   └── api-gateway/   # Placeholder
├── workspace/services/
│   ├── vision-service/      # پورت 8003
│   ├── engineering-service/ # پورت 8001
│   └── ai-service/          # پورت 8002
├── infrastructure/docker/
├── prisma/            # Prisma schema
└── docs/              # مستندات رسمی
```

---

## استانداردهای کدنویسی

### TypeScript
- semi, singleQuote, trailingComma all, printWidth 100
- 2-space indent

### Python
- ruff برای linting
- mypy برای type checking (strict)
- type hints اجباری

### Commit Convention
```
type(scope): description
انواع: feat, fix, refactor, docs, test, chore, style
حوزه: api, web, vision, engineering, ai, infra, config
```

---

## تست

```bash
pnpm test                                           # همه
pnpm --filter @xennic/api test                      # NestJS
pnpm --filter @xennic/web test                      # Next.js
cd workspace/services/vision-service && pytest -v   # Vision
```

> برای استانداردها و قوانین کامل توسعه به `XENNIC_CODING_STANDARDS_v1.md` و `XENNIC_DEVELOPMENT_RULES_v1.md` مراجعه کنید.
