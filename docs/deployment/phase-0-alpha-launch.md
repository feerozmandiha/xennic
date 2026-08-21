# Xennic — Phase-0 Alpha استقرار پایه

> - **وضعیت:** راهنمای اجرایی
> - **تاریخ:** 2026-08-15
> - **دامنه:** استقرار پلتفرم پایه روی یک سرور، اجرای تست‌های اولیه آنلاین، و آماده‌سازی مسیر `dev → main`
> - **مرجع Governance:** `docs/governance/git-github-governance.md`

هدف این سند این است که با **یک سرور و Docker** بتوان کل پلتفرم پایه را بالا آورد، تست‌های
اولیه را آنلاین انجام داد و هم‌زمان توسعه را ادامه داد. هیچ Node/pnpm روی سرور لازم نیست؛
ایمیج‌ها داخل Container ساخته می‌شوند.

## 1. چه چیزی بالا می‌آید

| سرویس                 | نقش                             | پورت داخلی | توضیح                           |
| --------------------- | ------------------------------- | ---------- | ------------------------------- |
| `nginx`               | Reverse proxy / TLS             | 80, 443    | تنها سرویس عمومی                |
| `web`                 | Frontend (Next.js standalone)   | 3001       |                                 |
| `api`                 | Backend (NestJS/Fastify)        | 3000       | مهاجرت Prisma در startup        |
| `postgres`            | دیتابیس                         | 5432       |                                 |
| `redis`               | Cache + Queue                   | 6379       |                                 |
| `rabbitmq`            | Message broker                  | 5672       | UI مدیریت روی 15672             |
| `minio`               | Object storage (S3-compatible)  | 9000/9001  | Bucketها توسط API ساخته می‌شوند |
| `qdrant`              | Vector database                 | 6333/6334  | برای AI / RAG                   |
| `engineering-service` | محاسبات مهندسی (Python/FastAPI) | 8001       |                                 |
| `ai-service`          | ارکستراسیون LLM (Python)        | 8002       |                                 |
| `vision-service`      | OCR / تحلیل تصویر (Python)      | 8003       |                                 |

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

| متغیر                                                          | توضیح                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `RABBITMQ_DEFAULT_PASS` | رمزهای قوی بدون کاراکتر خاص URL (در URL استفاده می‌شوند) |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`                      | دسترسی Object Storage                                    |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`                                | ادمین اولیه (برای seed)                                  |
| `FRONTEND_URL`                                                 | آدرس عمومی Frontend (برای CORS و build وب)               |
| `API_PUBLIC_URL`                                               | آدرس عمومی API                                           |
| `AI_MASTER_KEY`                                                | کلید رمزنگاری اعتبارنامه‌های AI                          |
| `CORS_ORIGINS`                                                 | اوریجین‌های مجاز (کاما جدا)                              |

تولید رمز قوی:

```bash
openssl rand -base64 32
```

> نکته: کلیدهای JWT (RSA) لازم نیست دستی بسازید؛ `deploy.sh` خودش تولید می‌کند.

### 4.1 هم‌زیستی با استک توسعهٔ محلی

این استک با نام پروژهٔ `xennic-prod` و کانتینرهای `xennic-prod-*` اجرا می‌شود و **هیچ
پورتی از سرویس‌های زیرساختی روی host منتشر نمی‌کند**؛ بنابراین می‌تواند در کنار استک
توسعهٔ محلی (`xennic-postgres`، `xennic-redis`، `xennic-minio` و …) روی یک ماشین اجرا شود
بدون تداخل نام یا پورت.

اگر روی ماشین محلی پورت 80 اشغال است (یا استک دیگری روی آن است)، در `.env` بگذارید:

```env
NGINX_HTTP_PORT=8080
FRONTEND_URL=http://localhost:8080
API_PUBLIC_URL=http://localhost:8080
CORS_ORIGINS=http://localhost:8080
```

برای دیباگ مستقیم زیرساخت (اتصال به Postgres/Redis/MinIO از host) از فایل override
استفاده کنید — فقط وقتی پورت‌ها آزاد باشند:

```bash
docker compose --env-file infrastructure/docker/compose/production/.env \
  -f infrastructure/docker/compose/production/docker-compose.yml \
  -f infrastructure/docker/compose/production/docker-compose.debug-ports.yml up -d
```

## 5. استقرار

```bash
./infrastructure/docker/scripts/deploy.sh           # build + up + healthcheck
./infrastructure/docker/scripts/deploy.sh --seed    # + ساخت ادمین و داده‌های اولیه
```

> اگر خطای `Permission denied` گرفتید (مثلاً به‌خاطر تنظیمات فایل‌سیستم ویندوز/WSL)، یا
> اسکریپت را با `bash` صدا بزنید یا بیت اجرا را ست کنید:
>
> ```bash
> bash infrastructure/docker/scripts/deploy.sh
> # یا
> chmod +x infrastructure/docker/scripts/deploy.sh
> ```

- اسکریپت پیش از هر کاری بررسی می‌کند پورت `NGINX_HTTP_PORT` آزاد باشد و در غیر این صورت
  با پیام راهنما متوقف می‌شود.

- ایمیج‌های `api` و `web` از مسیر `apps/*` و سرویس‌های Python از `workspace/services/*`
  ساخته می‌شوند.
- پس از بالا آمدن، اسکریپت تا سالم شدن `/api/v1/health` منتظر می‌ماند.

دستورات کمکی:

```bash
./infrastructure/docker/scripts/deploy.sh --logs    # دنبال‌کردن لاگ‌ها
./infrastructure/docker/scripts/deploy.sh --down    # توقف
```

## 6. راستی‌آزمایی اولیه (Smoke Test)

> ⚠️ `BASE` را از روی `NGINX_HTTP_PORT` همان `.env` بسازید، نه از روی حدس. اگر
> `NGINX_HTTP_PORT=80` باشد ولی `BASE` را `:8080` بگذارید، همهٔ `curl`ها `000` می‌دهند
> در حالی که استک کاملاً سالم است. `deploy.sh` هم در پایان آدرس درست را چاپ می‌کند.

```bash
ENV_FILE=infrastructure/docker/compose/production/.env
PORT=$(grep -E '^NGINX_HTTP_PORT=' $ENV_FILE | tail -1 | cut -d= -f2- | tr -d '"'"'"'[:space:]')
BASE="http://localhost:${PORT:-80}"
echo "BASE=$BASE"

# سلامت API
curl -s $BASE/api/v1/health

# Swagger
curl -s -o /dev/null -w '%{http_code}\n' $BASE/api/docs

# Frontend
curl -s -o /dev/null -w '%{http_code}\n' $BASE/

# Frontend (locale فارسی)
curl -s -o /dev/null -w '%{http_code}\n' $BASE/fa

# وضعیت کانتینرها
docker ps --filter name=xennic-prod

# سلامت سرویس‌های Python (از داخل شبکه، چون پورتی روی host منتشر نمی‌شود)
docker compose --env-file infrastructure/docker/compose/production/.env \
  -f infrastructure/docker/compose/production/docker-compose.yml \
  exec api sh -lc 'curl -s http://engineering-service:8001/health; \
                   curl -s http://ai-service:8002/health; \
                   curl -s http://vision-service:8003/health'
```

ورود به پنل: باز کردن `$BASE/` و استفاده از `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## 7. پشتیبان‌گیری و بازگشت

```bash
# پشتیبان دیتابیس
docker exec xennic-prod-postgres pg_dump -U xennic xennic > backup_$(date +%F).sql

# بازگشت (Rollback): stop → remove containers → restore volume
docker compose -f infrastructure/docker/compose/production/docker-compose.yml down
```

## 8. HTTPS و سخت‌سازی Nginx

پیکربندی production Nginx به‌صورت پیش‌فرض HTTPS، ریدایرکت HTTP به HTTPS، headerهای
امنیتی و rate-limit را فعال می‌کند. قبل از بالا آوردن `nginx` در production، گواهی
Let's Encrypt یا گواهی معتبر سازمانی را آماده کنید و فایل‌های زیر را در مسیر
`infrastructure/docker/compose/production/certs/` قرار دهید:

- `fullchain.pem`
- `privkey.pem`

سپس صحت پیکربندی و راه‌اندازی Nginx را بررسی کنید:

```bash
docker compose --env-file infrastructure/docker/compose/production/.env \
  -f infrastructure/docker/compose/production/docker-compose.yml \
  run --rm nginx nginx -t

docker compose --env-file infrastructure/docker/compose/production/.env \
  -f infrastructure/docker/compose/production/docker-compose.yml \
  up -d nginx
```

## 9. محدودیت‌های شناخته‌شده فاز آلفا

- PgBouncer، Meilisearch و Monitoring (Prometheus/Grafana) در این مرحله خارج از استک
  پایه هستند و در فازهای بعدی اضافه می‌شوند.
- ایمیج‌ها روی سرور ساخته می‌شوند (build on server)؛ انتشار ایمیج به GHCR پس از تثبیت
  دامنه انجام می‌شود تا `NEXT_PUBLIC_*` در Build درون‌خطی نشود.
- اتصال API به PostgreSQL مستقیم است (بدون PgBouncer).

## 10. عیب‌یابی متداول

| نشانه                                                                                        | علت                                                                | راه‌حل                                                                                                                            |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `./…/deploy.sh: Permission denied`                                                           | بیت اجرا روی فایل‌سیستم (WSL/NTFS) اعمال نشده                      | `bash infrastructure/docker/scripts/deploy.sh` یا `chmod +x …`                                                                    |
| `Conflict. The container name "/xennic-…" is already in use`                                 | استک توسعهٔ محلی با همان نام‌ها بالاست                             | از نسخهٔ فعلی استفاده کنید؛ کانتینرها `xennic-prod-*` هستند و تداخل ندارند                                                        |
| `Bind for 0.0.0.0:80 failed: port is already allocated`                                      | پورت 80 اشغال است                                                  | `NGINX_HTTP_PORT=8080` (به‌همراه `FRONTEND_URL`/`API_PUBLIC_URL`/`CORS_ORIGINS`)                                                  |
| `curl` → `000` روی `$BASE/...`                                                               | استک اصلاً بالا نیامده (deploy با خطا متوقف شده)                   | ابتدا `deploy.sh` را با موفقیت اجرا کنید، سپس smoke test                                                                          |
| `docker compose … logs` خروجی خالی                                                           | هیچ کانتینری از این پروژه ساخته نشده                               | همان مورد بالا                                                                                                                    |
| Seed پیش از بالا آمدن استک                                                                   | `run --rm api` تلاش می‌کند وابستگی‌ها را بسازد                     | ابتدا `deploy.sh`، سپس `deploy.sh --seed` یا دستور seed                                                                           |
| `dependency failed to start: container xennic-prod-api is unhealthy`                         | `Cannot find module …` — ایمیج API فقط `node_modules` ریشه را داشت | رفع شد؛ ایمیج حالا `apps/api/node_modules` و `packages/database/node_modules` را هم می‌برد و در زمان build صحت graph را چک می‌کند |
| لاگ API پر از `ECONNREFUSED …:4318`                                                          | OpenTelemetry بدون collector فعال می‌شد                            | رفع شد؛ SDK فقط با `OTEL_EXPORTER_ENABLED=true` بالا می‌آید                                                                       |
| همهٔ `curl`ها `000` اما `docker ps` همه‌چیز را healthy نشان می‌دهد                           | `BASE` با `NGINX_HTTP_PORT` واقعی در `.env` نمی‌خواند              | `BASE` را طبق بخش ۶ از `.env` بسازید                                                                                              |
| `deploy.sh` با پیام `secrets are still empty or set to a CHANGE_ME placeholder` متوقف می‌شود | رمزهای الزامی در `.env` پر نشده‌اند                                | مقادیر را پر کنید؛ این گارد عمدی است                                                                                              |

بررسی دستی سلامت API وقتی unhealthy است:

```bash
docker logs --tail=100 xennic-prod-api
docker exec xennic-prod-api curl -sf http://localhost:3000/api/v1/health
```

## 11. پیوند با مدل Governance

- تغییرات این فاز اول روی `dev` (با PR) می‌روند؛ سپس اولین **Release PR `dev → main`**
  ساخته می‌شود. هیچ Push مستقیم به `main` انجام نمی‌شود.
- Ruleset فعال `protect-main-and-dev` اجازه‌ی Merge بدون PR را نمی‌دهد.
