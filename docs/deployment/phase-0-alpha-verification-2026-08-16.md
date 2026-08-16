# Xennic — گزارش راستی‌آزمایی استقرار Phase-0 Alpha

> - **تاریخ:** 2026-08-16
> - **Commit مورد آزمون:** `399e70d` (شاخهٔ `arena/01a004a5-xennic`، PR #5 به `dev`)
> - **محیط:** Docker Engine + Compose v2 روی WSL2 (Ubuntu / DESKTOP-AV239MT)
> - **مرجع Runbook:** `docs/deployment/phase-0-alpha-launch.md`
> - **مرجع Governance:** `docs/governance/git-github-governance.md`

## ۱. نتیجهٔ کلی

اولین استقرار کامل پلتفرم با **یک دستور** (`bash infrastructure/docker/scripts/deploy.sh`)
با موفقیت انجام شد. هر ۱۱ سرویس بالا آمدند، مهاجرت‌های Prisma اعمال شدند و seed کامل
اجرا شد. این نقطه، معیار پذیرش Phase-0/Alpha را برآورده می‌کند.

| معیار پذیرش | وضعیت |
| --- | --- |
| بالا آمدن کل استک با یک دستور، بدون Node/pnpm روی host | ✅ |
| اعمال خودکار مهاجرت‌های Prisma در startup | ✅ (۱۱ مهاجرت) |
| Healthcheck همهٔ سرویس‌های برنامه | ✅ |
| Seed داده‌های پایه و ادمین | ✅ |
| هم‌زیستی با استک توسعهٔ محلی روی همان ماشین | ✅ |

## ۲. وضعیت سرویس‌ها (`docker ps --filter name=xennic-prod`)

| کانتینر | ایمیج | وضعیت |
| --- | --- | --- |
| `xennic-prod-nginx` | `nginx:1.27-alpine` | Up — `0.0.0.0:80->80`, `0.0.0.0:443->443` |
| `xennic-prod-web` | `xennic-prod-web` | Up (healthy) — 3001/tcp |
| `xennic-prod-api` | `xennic-prod-api` | Up (healthy) — 3000/tcp |
| `xennic-prod-engineering-service` | build محلی | Up (healthy) — 8001/tcp |
| `xennic-prod-ai-service` | build محلی | Up (healthy) — 8002/tcp |
| `xennic-prod-vision-service` | build محلی | Up (healthy) — 8003/tcp |
| `xennic-prod-postgres` | `postgres:17-alpine` | Up (healthy) — 5432/tcp |
| `xennic-prod-redis` | `redis:8-alpine` | Up (healthy) — 6379/tcp |
| `xennic-prod-rabbitmq` | `rabbitmq:4-management` | Up (healthy) — 5672/tcp |
| `xennic-prod-qdrant` | `qdrant/qdrant:latest` | Up (healthy) — 6333-6334/tcp |
| `xennic-prod-minio` | `minio/minio:RELEASE.2025-09-07T16-13-09Z` | Up — 9000/tcp |

تأیید ایزولاسیون: هیچ سرویس زیرساختی پورتی روی host منتشر نکرده است؛ تنها `nginx`
پورت‌های ۸۰ و ۴۴۳ را در اختیار دارد. استک توسعهٔ محلی موجود (`xennic-postgres`,
`xennic-minio`, …) بدون تداخل به کار خود ادامه داد.

## ۳. مهاجرت و Seed

```
[api-entrypoint] Applying Prisma migrations ...
11 migrations found in prisma/migrations
No pending migrations to apply.
[api-entrypoint] Migrations applied.
[api-entrypoint] Executing command: node prisma/seed.js
```

| بخش | نتیجه |
| --- | --- |
| Plans | ۳ (Free / Pro / Enterprise) |
| Roles | ۱۲ |
| Permissions | ۶۲ |
| Role → Permission bindings | ۱۲ نقش (SUPER_ADMIN با ۶۲ مجوز) |
| System settings | ۷ |
| Engineering standards | ۱۵ |
| AI agents | ۷ |
| Admin + Workspace | ✅ Workspace «Xennic» |
| Marketplace vendors | ۷ |
| Marketplace products | ۳۸ |
| Feature flags | ۱۶ |

## ۴. زمان build

| اجرا | مدت |
| --- | --- |
| build کامل (cold cache) | ~۹۷۴ ثانیه |
| rebuild بعد از اصلاح لایهٔ runtime API | ~۲۳۴ ثانیه |
| اجرای مجدد بدون تغییر (cache کامل) | ~۹ ثانیه |

## ۵. اشکالات یافته و رفع‌شده در جریان این راستی‌آزمایی

| # | نشانه | ریشه | Commit رفع |
| --- | --- | --- | --- |
| ۱ | `deploy.sh: Permission denied` | فایل با mode `100644` در Git ثبت شده بود | `6d59214` |
| ۲ | `Conflict. container name "/xennic-minio" is already in use` | تداخل نام با استک توسعهٔ محلی | `6d59214` |
| ۳ | تداخل پورت‌های زیرساخت با استک محلی | انتشار پورت‌های infra روی host | `6d59214` |
| ۴ | `dependency failed to start: xennic-prod-api is unhealthy` | ایمیج فقط `node_modules` ریشه را داشت؛ ۲۷ وابستگی runtime از `apps/api/node_modules` (چیدمان isolated در pnpm) گم شده بود | `399e70d` |
| ۵ | تلاش مکرر OTLP روی `:4318` | OpenTelemetry بدون collector فعال می‌شد | `399e70d` |

## ۶. یافته‌های باز (اقدام لازم پیش از استقرار عمومی)

| # | یافته | شدت | اقدام |
| --- | --- | --- | --- |
| ۱ | `POSTGRES_PASSWORD` در محیط آزمون روی مقدار پیش‌فرض `CHANGE_ME_STRONG_PASSWORD` مانده بود | **بالا** | گارد اعتبارسنجی به `deploy.sh` اضافه شد و اجرا را با placeholder متوقف می‌کند |
| ۲ | `ADMIN_EMAIL` روی `admin@xennic.example.com` (مقدار نمونه) مانده بود | متوسط | باید به ایمیل واقعی تغییر کند و ادمین دوباره seed شود |
| ۳ | HTTPS هنوز فعال نیست (فقط HTTP روی ۸۰) | **بالا برای استقرار عمومی** | صدور گواهی و فعال‌سازی بلاک `listen 443 ssl` طبق بخش ۸ Runbook |
| ۴ | ایمیج‌ها روی سرور ساخته می‌شوند | پایین | انتشار به GHCR در فاز بعد |
| ۵ | PgBouncer، Meilisearch و Monitoring خارج از استک پایه | پایین | فازهای بعدی |

> نکته: مقدار `AI_MASTER_KEY` که در جریان این آزمون تولید شد در کانال گفتگو افشا شد و
> باید پیش از هر استفادهٔ غیرآزمایشی چرخانده شود.

## ۷. نکتهٔ راستی‌آزمایی HTTP

در این اجرا `NGINX_HTTP_PORT` روی مقدار پیش‌فرض `80` بود، اما دستورهای smoke test با
`BASE=http://localhost:8080` اجرا شدند و طبیعتاً `000` برگرداندند. آدرس درست همان است که
خود `deploy.sh` در پایان چاپ می‌کند:

```
Web:    http://localhost:80/
API:    http://localhost:80/api/v1/health
Swagger:http://localhost:80/api/docs
```

Runbook به‌روزرسانی شد تا `BASE` از همان مقدار `NGINX_HTTP_PORT` در `.env` استخراج شود و
این ناهمخوانی تکرار نشود.

## ۸. جمع‌بندی برای مسیر Release

با سبز شدن این راستی‌آزمایی، پیش‌نیاز Phase-0/Alpha برآورده شده است. مسیر بعدی طبق
Governance:

1. Merge شدن PR #5 به `dev` (نیازمند Approve انسانی؛ ruleset `protect-main-and-dev` فعال است).
2. ساخت اولین **Release PR از `dev` به `main`** با استناد به همین سند به‌عنوان شاهد.
3. Tag با SemVer روی `main` پس از merge.
