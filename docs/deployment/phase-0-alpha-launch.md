# Xennic — Phase-0 Alpha استقرار پایه

> - **وضعیت:** راهنمای اجرایی
> - **تاریخ:** 2026-08-15
> - **دامنه:** استقرار پلتفرم پایه روی یک سرور، اجرای تست‌های اولیه آنلاین، و آماده‌سازی مسیر `dev → main`
> - **مرجع Governance:** `docs/governance/git-github-governance.md`

هدف این سند این است که با **یک سرور و Docker** بتوان کل پلتفرم پایه را بالا آورد، تست‌های
اولیه را آنلاین انجام داد و هم‌زمان توسعه را ادامه داد. هیچ Node/pnpm روی سرور لازم نیست؛
ایمیج‌ها داخل Container ساخته می‌شوند.

## 1. چه چیزی بالا می‌آید

| سرویس                  | نقش                             | پورت داخلی | توضیح                         |
| ---------------------- | ------------------------------- | ---------- | ----------------------------- |
| `nginx`                | Reverse proxy / TLS             | 80, 443    | تنها سرویس عمومی               |
| `web`                  | Frontend (Next.js standalone)   | 3001       |                              |
| `api`                  | Backend (NestJS/Fastify)        | 3000       | مهاجرت Prisma در startup      |
| `postgres`             | دیتابیس                         | 5432       |                              |
| `redis`                | Cache + Queue                   | 6379       |                              |
| `rabbitmq`             | Message broker                  | 5672       | UI مدیریت روی 15672          |
| `minio`                | Object storage (S3-compatible)  | 9000/9001  | Bucketها توسط API ساخته می‌شوند |
| `qdrant`               | Vector database                 | 6333/6334  | برای AI / RAG                |
| `engineering-service`  | محاسبات مهندسی (Python/FastAPI) | 8001       |                              |
| `ai-service`           | ارکستراسیون LLM (Python)        | 8002       |                              |
| `vision-service`       | OCR / تحلیل تصویر (Python)      | 8003       |                              |

مسیرهای عمومی (پشت `nginx`):

- `/` → Frontend
- `/api/*` → API (پیشوند سراسری `api/v1`)
- `/api/docs` → Swagger UI
- `/api/v1/vision/*` → vision-service

## 2. پیش‌نیازهای سرور

```bash
# Docker Engine + Compose v2
curl -fsSL https://get.docker.com | sh
docker compose version   # باید v2 باشد
```

- یک دامنه (یا IP) که به سرور اشاره کند.
- پورت‌های 80 (و بعداً 443) باز باشند.

## 3. آوردن کد روی سرور

```bash
# روش A — git (پیشنهادی؛ سپس روی شاخه dev یا یک tag بایستید)
git clone https://github.com/feerozmandiha/xennic.git
cd xennic
git checkout dev

# روش B — بسته‌بندی دستی (بدون git روی سرور)
#   روی ماشین لوکال:  tar --exclude='.git' --exclude='node_modules' -czf xennic.tar.gz xennic/
#   روی سرور:         tar -xzf xennic.tar.gz && cd xennic
```

> در فاز آلفا روی شاخه `dev` مستقر می‌کنیم؛ پس از سبز شدن Release Gate، اولین
> **Release PR از `dev` به `main`** ساخته و `main` نقطه‌ی استقرار پایدار می‌شود.

## 4. پیکربندی محیط

```bash
cp infrastructure/docker/compose/production/.env.production.example \
   infrastructure/docker/compose/production/.env
```

سپس همه‌ی مقادیر `CHANGE_ME` را پر کنید. حداقل‌های حیاتی:

| متغیر             | توضیح                                                        |
| ----------------- | ------------------------------------------------------------ |
| `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `RABBITMQ_DEFAULT_PASS` | رمزهای قوی بدون کاراکتر خاص URL (در URL استفاده می‌شوند) |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | دسترسی Object Storage                                        |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | ادمین اولیه (برای seed)                                      |
| `FRONTEND_URL`    | آدرس عمومی Frontend (برای CORS و build وب)                   |
| `API_PUBLIC_URL`  | آدرس عمومی API                                               |
| `AI_MASTER_KEY`   | کلید رمزنگاری اعتبارنامه‌های AI                              |
| `CORS_ORIGINS`    | اوریجین‌های مجاز (کاما جدا)                                   |

تولید رمز قوی:

```bash
openssl rand -base64 32
```

> نکته: کلیدهای JWT (RSA) لازم نیست دستی بسازید؛ `deploy.sh` خودش تولید می‌کند.

## 5. استقرار

```bash
./infrastructure/docker/scripts/deploy.sh           # build + up + healthcheck
./infrastructure/docker/scripts/deploy.sh --seed    # + ساخت ادمین و داده‌های اولیه
```

- ایمیج‌های `api` و `web` از مسیر `apps/*` و سرویس‌های Python از `workspace/services/*`
  ساخته می‌شوند.
- پس از بالا آمدن، اسکریپت تا سالم شدن `/api/v1/health` منتظر می‌ماند.

دستورات کمکی:

```bash
./infrastructure/docker/scripts/deploy.sh --logs    # دنبال‌کردن لاگ‌ها
./infrastructure/docker/scripts/deploy.sh --down    # توقف
```

## 6. راستی‌آزمایی اولیه (Smoke Test)

```bash
BASE=http://YOUR_SERVER

# سلامت API
curl -s $BASE/api/v1/health

# Swagger
curl -s -o /dev/null -w '%{http_code}\n' $BASE/api/docs

# Frontend
curl -s -o /dev/null -w '%{http_code}\n' $BASE/

# سلامت سرویس‌های Python (مستقیم روی host فقط برای دیباگ)
curl -s http://localhost:8001/health   # engineering-service
curl -s http://localhost:8002/health   # ai-service
curl -s http://localhost:8003/health   # vision-service
```

ورود به پنل: باز کردن `$BASE/` و استفاده از `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## 7. پشتیبان‌گیری و بازگشت

```bash
# پشتیبان دیتابیس
docker exec xennic-postgres pg_dump -U xennic xennic > backup_$(date +%F).sql

# بازگشت (Rollback): stop → remove containers → restore volume
docker compose -f infrastructure/docker/compose/production/docker-compose.yml down
```

## 8. فعال‌سازی HTTPS (گام بعدی)

1. گواهی Let's Encrypt را بگیرید (مثلاً با certbot) و فایل‌های `fullchain.pem` و
   `privkey.pem` را در `infrastructure/docker/compose/production/certs/` بگذارید.
2. بلاک `server { listen 443 ssl; ... }` را در
   `infrastructure/docker/nginx/nginx.conf` فعال کنید.
3. `docker compose ... restart nginx`.

## 9. محدودیت‌های شناخته‌شده فاز آلفا

- PgBouncer، Meilisearch و Monitoring (Prometheus/Grafana) در این مرحله خارج از استک
  پایه هستند و در فازهای بعدی اضافه می‌شوند.
- ایمیج‌ها روی سرور ساخته می‌شوند (build on server)؛ انتشار ایمیج به GHCR پس از تثبیت
  دامنه انجام می‌شود تا `NEXT_PUBLIC_*` در Build درون‌خطی نشود.
- اتصال API به PostgreSQL مستقیم است (بدون PgBouncer).

## 10. پیوند با مدل Governance

- تغییرات این فاز اول روی `dev` (با PR) می‌روند؛ سپس اولین **Release PR `dev → main`**
  ساخته می‌شود. هیچ Push مستقیم به `main` انجام نمی‌شود.
- Ruleset فعال `protect-main-and-dev` اجازه‌ی Merge بدون PR را نمی‌دهد.
