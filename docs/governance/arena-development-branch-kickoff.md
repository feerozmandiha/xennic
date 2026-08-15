# Arena Development Branch — Kickoff

- **Branch:** `feat/arena-platform-development`
- **Base:** `dev@650c2dd9cc958f5a879ff4512e520bd63ea656e9` (Integration/Staging)
- **Upstream target:** `dev` via Pull Request (Squash-Merge)
- **Production line:** `main@e3a2dffd` (frozen for direct development)
- **Created:** 2026-08-15
- **Owner:** Arena Agent (`agent@arena.ai`)

> این سند نقطه‌ی شروع شاخه‌ی توسعه‌ی اختصاصی است. هیچ کد تجاری در این کامیت تغییر
> نمی‌کند؛ صرفاً ثبت تصمیم و اعلام آمادگی.

---

## 1. مدل شاخه‌بندی (مطابق حاکمیت پروژه)

```
main  ─────────────────────────► Production (محافظت‌شده، freeze توسعه‌ی مستقیم)
  ▲
  └── PR (Squash-Merge) ◄── dev ── Integration/Staging (محافظت‌شده)
                                ▲
                                └── PR ◄── feat/arena-platform-development
                                                ▲
                                                └── شاخه‌های فرعی کوتاه‌عمر برای
                                                    هر Task / Issue
```

- شاخه‌ی `main` هیچ‌گاه مستقیماً توسعه داده نمی‌شود.
- هر تغییر از طریق شاخه‌ی فرعی از `dev` → PR → بررسی → Squash-Merge وارد `dev` می‌شود.
- انتشار از `dev` به `main` فقط از طریق Release Gate و ۱۵ گیت اعتبارسنجی
  (`tools/release/release-validator.ts`) انجام می‌شود.
- شاخه‌ی جاری یک شاخه‌ی **پایدار دائمی برای Arena** است؛ Taskهای بزرگ در زیرشاخه‌های
  کوتاه‌عمر از همین شاخه (نه از `dev`) پیش می‌روند و پس از آمادگی به `dev` PR می‌شوند.

## 2. قراردادهای الزامی (اجرا بر روی این شاخه)

- **Bootstrap:** قبل از هر تغییر کد، چک‌لیست بخش ۱۵ `docs/PROJECT_BOOTSTRAP.md` اجرا شود.
- **اعتبارسنجی معماری:** `pnpm validate:arch` باید exit 0 بدهد.
- **تایپ‌چک:** `pnpm typecheck` با ۰ خطا.
- **تست:** `pnpm test` و در صورت لزوم `pnpm test:e2e`.
- **انتساب‌ها:** استفاده از `.js` در importهای نسبی (ماژول‌های NestJS)؛ ممنوعیت
  barrel `index.ts`؛ ممنوعیت دسترسی مستقیم Prisma در Controller؛ ممنوعیت
  `fetch()` خام به میکروسرویس‌ها (استفاده از `EngineeringClientService` و
  circuit breaker).
- **مدرک ADR:** هر ماژول/تصمیم معماری جدید نیازمند ADR در `docs/adr/` است.
- **OpenAPI:** `packages/openapi/v1/openapi.json` خودکار تولید می‌شود؛ دستی ویرایش نشود.
- **تعریف آمادگی (DoR) و تعریف اتمام (DoD):**
  `docs/governance/definition-of-ready.md` و `docs/governance/definition-of-done.md`.

## 3. بررسی اولیه‌ی پروژه (خلاصه)

| بُعد | وضعیت |
| ---- | ----- |
| نوع پروژه | Monorepo با pnpm + Turborepo |
| Backend | NestJS 11 + Fastify (پورت ۳۰۰۰، پیشوند `/api/v1`)، DDD، ۴۱ ماژول |
| Frontend | Next.js 15 + next-intl (پورت ۳۰۰۱) |
| پایگاه داده | PostgreSQL 17 + Prisma 6 (SCHEMA با ۲۵۳۴ خط، چنداجاره‌ای با `workspace_id`) |
| سرویس‌های Python | `engineering-service:8001`, `ai-service:8002`, `vision-service:8003` (FastAPI) |
| زیرساخت | Redis 8، RabbitMQ 4، Qdrant، MinIO — Docker Compose |
| سرویس‌های کانال | `services/bill-bot` (تلگرام/بله — اسکلت) و `apps/web`؛ موبایل در آینده |
| آمادگی تولید | ~۷.۸ از ۱۰ — CONDITIONAL GO (Sprint S1 با Grade A) |
| بدهی فنی باز | ۰ مورد باز در رجیستر (۲۳۹ مورد رفع شده) |

### ماژول‌های کلیدی ثبت‌شده در `apps/api/src/modules/`

admin, ai, ai-provider-management, ai-runtime, api-keys, auth, billing,
calculation-platform, consultations, email, engineering, enterprise-api-platform,
enterprise-cache, enterprise-config, enterprise-event-architecture,
enterprise-intelligence, enterprise-messaging, enterprise-observability,
enterprise-orchestration, enterprise-saga, enterprise-search-federation,
feature-flags, health, knowledge, knowledge-factory, knowledge-intelligence,
marketplace, monitoring, notification, project, rbac, search,
semantic-integration, standards, storage, subscription, user, vision, webhooks,
workspace.

### کاستی‌های شناخته‌شده

- `Subscription` و `Notification` هنوز 🔴 پیاده‌سازی نشده‌اند.
- `Workspace.workspace_members` بخشی ناقص است.
- `Engineering.proxyJson` از `fetch()` خام استفاده می‌کند (circuit breaker را دور
  می‌زند) و endpointهای OCR انرژی نیز raw fetch دارند.
- آداپتورهای Redis/RabbitMQ برای کش و event bus درون‌فرآیندی هنوز پیاده نشده‌اند.
- Saga store هنوز پایا (persistent) نیست.
- OpenAPI generation مشکل hang دارد.
- Dockerfileهای رسمی برای API و Web وجود ندارند.

## 4. کاندیداهای کار پس از این شاخه (برمبنای ممیزی `docs/governance/branch-ledger.md`)

این کاندیداها قبلاً با Owner توافق و در سند ممیزی ثبت شده‌اند؛ انتخاب و اولویت‌بندی
نهایی با کاربر است:

1. **Bill-Bot (ADR-027):** اتصال واقعی `POST /vision/bill/read` و انتقال درخواست
   مشاوره از SQLite به API مرکزی (`/consultations/bot`).
2. **Storage Phase-0:** انتقال انتخابی کامیت‌های معتبر از `arena/019f76cd-xennic`.
3. **خوشه Landing/Admin:** یکپارچه‌سازی `arena/019fdffb`, `feat/landing-cms`,
   `feat/landing-cms-merged` از `dev`.
4. **خوشه Knowledge Factory:** انتقال مرتب upload → pipeline → E2E.
5. **فعال‌سازی ماژول‌های خاموش:** شکستن `feat/activate-dormant-modules` به چند
   PR کوچک وابسته.
6. **یکپارچه‌سازی پیکربندی Redis:** بازبینی امنیتی/Runtime و فرود
   `feat/redis-single-config`.
7. **ماژول‌های غایب:** پیاده‌سازی `Subscription` و `Notification` و تکمیل
   `workspace_members`.
8. **مقاوم‌سازی مهندسی:** جایگزینی `proxyJson` با `EngineeringClientService`.

## 5. وضعیت Push و PR

- شاخه از طریق توکن Owner با scope `repo` به Remote push می‌شود.
- پس از Push موفق، PR به مقصد `dev` با عنوان
  `chore(governance): establish arena development branch` باز می‌شود.
- پس از اتمام، توکن از URL کنار گذاشته می‌شود تا در snapshotها ذخیره نشود.

## 6. چک‌لیست شروع به کار (AI Startup Checklist)

- [x] خواندن `README.md`
- [x] خواندن `AGENTS.md`
- [x] خواندن `docs/PROJECT_BOOTSTRAP.md` (بخش‌های ۱، ۲، ۳)
- [x] خواندن `docs/STATUS_REPORT.md`
- [x] خواندن `docs/TECHNICAL_DEBT_REGISTER.md`
- [x] خواندن `docs/critical-path.md`
- [x] خواندن `docs/AI_SESSION_CONTRACT.md`
- [x] خواندن `docs/adr/ADR-027-platform-plus-channels.md`
- [x] خواندن `docs/governance/branch-ledger.md`
- [ ] اجرای `scripts/bootstrap/bootstrap-check.sh` (نیازمند npx/tsx و
      وابستگی‌های نصب‌شده)
- [ ] اجرای `pnpm install` و `pnpm validate:arch`
- [ ] تأیید صریح کاربر برای اولین محور توسعه (مورد ۴ باکس بالا)

> تا تکمیل موارد باقی‌مانده و انتخاب محور اول، هیچ کد تجاری تغییر نمی‌کند.
