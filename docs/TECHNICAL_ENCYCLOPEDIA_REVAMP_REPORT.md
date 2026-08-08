# گزارش فنی بازسازی دانشنامه — Xennic

**مدیر فنی:** عامل ارشد دانشنامه فنی  
**برنچ:** `arena/019fdffb-xennic` (جدا از main)  
**تاریخ:** 2026-08-08

---

## بررسی اولیه مخزن

### ساختار کلی

- Monorepo pnpm + Turborepo
- API: NestJS + Fastify port 3000
- Web: Next.js 15 port 3001
- DB: PostgreSQL 17 + Prisma + 10 migration
- Python: engineering-service 8001, ai-service 8002, vision-service 8003
- Infra: Redis 6380, RabbitMQ, Qdrant

### ماژول‌های دانش (قبل از fix)

- `knowledge` — ✅ کامل (CRUD, publish, search FTS, versions, comments, workflow, analytics, taxonomy, standards, formulas, examples)
- `knowledge-factory` — ✅ کد کامل ولی **در ApiModule لود نشده** → غیرفعال
- `knowledge-intelligence` — ✅ کد کامل ولی لود نشده → گراف خالی
- `semantic-integration` — ✅ Global ولی لود نشده → outbox relay خاموش
- `standards` — ✅ CRUD ولی فقط با auth
- `taxonomy` — controller با guard، مسیرها فقط `/taxonomy` و `/taxonomy/:type`

### اتصال شکسته فرانت-بک

| کامپوننت فرانت        | درخواست                                            | بک‌اند واقعی                                             | نتیجه               |
| --------------------- | -------------------------------------------------- | -------------------------------------------------------- | ------------------- |
| TaxonomySelect        | `GET /categories?limit=200`                        | فقط `/taxonomy/categories` با guard                      | 404                 |
| StandardsManager      | `GET /standards?q=...`                             | `/standards` با guard + workspace                        | 401 در public       |
| PublicKnowledgeClient | `GET /public/knowledge` فقط لیست، فیلتر سمت کلاینت | `GET /public/knowledge` ساده، بدون q, standard, taxonomy | UX ضعیف، فیلتر ناقص |
| Detail                | `GET /public/knowledge/:slug` بدون ثبت view        | view فقط در `/knowledge/:id/view` با guard               | آمار بازدید صفر     |
| KnowledgeFactory UI   | وجود نداشت                                         | workers آماده ولی لود نشده                               | پایپلاین AI غیرفعال |

### اسناد مرتبط

- `docs/engineering-standards-matrix.md` — 55 پلاگین × 28 استاندارد
- `docs/calculation-catalog.md` — کاتالوگ کامل محاسبات
- `docs/electrical-plugin-guide.md` — 8 دسته، فرمول، AI metadata
- `docs/knowledge/*` — factory و intelligence architecture
- `docs/PROJECT_BOOTSTRAP.md` — باید SemanticIntegration قبل از همه AI لود شود

---

## اقدامات انجام شده

### ۱. بک‌اند — ۷ فایل تغییر/جدید

1. **ApiModule** — اضافه کردن 4 ماژول جاافتاده:
   - `AiRuntimeModule`, `SemanticIntegrationModule`, `KnowledgeFactoryModule`, `KnowledgeIntelligenceModule`
   - ترتیب: Knowledge → Standards → Factory → Intelligence → SemanticIntegration (Global) → AiRuntime

2. **PublicTaxonomyController (جدید)** — بدون guard:
   - `GET /categories|topics|tags|disciplines|audiences` با `?search=&q=&limit=`
   - `GET /public/taxonomy` و `GET /public/taxonomy/:type`
   - استفاده از `$queryRawUnsafe` با ILIKE برای فارسی

3. **TaxonomyController (refactor)** — پشتیبانی singular/plural + search + limit

4. **PublicStandardController (جدید)** — بدون guard:
   - `GET /public/standards?q=&organization=&page=&limit=`
   - فیلتر OR روی code و title با mode insensitive

5. **PublicKnowledgeController (بازطراحی کامل)** — از 52 خط به 300+ خط:
   - `hub/overview` — stats + recent + mostViewed
   - `list` با فیلترهای پیشرفته: q (FTS), difficulty, standard, taxonomy
   - `getBySlug` با auto view increment (upsert)
   - `related` — standards, taxonomy, analytics, formulas, examples, versions, related (6) بر اساس اشتراک استاندارد/taxonomy
   - `recordView` صریح

6. **StandardsModule** — اضافه PublicStandardController

7. **KnowledgeModule** — اضافه PublicTaxonomyController

### ۲. فرانت‌اند — ۱۶ فایل جدید/تغییر

#### lib (۶ فایل جدید)

- `knowledge-api.ts` — typed wrapper: `publicKnowledgeApi.list/hubOverview/getBySlug/getRelated/recordView/categories/...` + `knowledgeApi.search/get/...` + `standardsApi.list` + helpers `getArticleTitle/Summary`
- `standards-data.ts` — 13 استاندارد کلیدی با mapping به محاسبات، برگرفته از engineering-standards-matrix.md
- `equipment-registry.ts` — 10 تجهیز با `standards[], calculations[], regulations[], tags[]` + `EQUIPMENT_CATEGORIES`
- `ai-client.ts` — `summarizeArticle`, `chatAboutArticle`, `semanticSearch`, `suggestRelated`, `explainStandard` با fallback mock فارسی
- `taxonomy-data.ts` — meta برای 5 نوع taxonomy + difficulty levels
- `calculations-map.ts` — 19 پلاگین کلیدی با label فارسی/انگلیسی

#### components/encyclopedia (۹ فایل جدید)

- `encyclopedia-hub.tsx` — هاب اصلی:
  - Hero با gradient + stats (4 کارت)
  - SearchBar با ⌘K و `/` hotkey + AI button
  - Tabs: all, standards, equipment, taxonomy, ai (sticky top)
  - Sidebar: mostViewed (از hub overview) + categories + نکته هوشمند + CTA به AI
  - Main: filters (difficulty, standard, equipment, taxonomy, language) + grid cards + pagination
  - Floating AI button + modal
  - استفاده از `publicKnowledgeApi.hubOverview` و `list` با `placeholderData`

- `search/knowledge-search-bar.tsx` — rounded-2xl, focus ring, suggestions dropdown, ⌘K badge

- `search/knowledge-filters.tsx` — active count badge, clear all, pills برای فیلترهای فعال، panel با 3+2 select

- `search/knowledge-card-modern.tsx` — gradient top border, icon, AI badge (Zap), arrow hover, StandardsList, difficulty badge, views, readingTime, category

- `standards/standard-badge.tsx` — رنگ بر اساس org (IEC آبی, IEEE بنفش...), size xs/sm/md

- `standards/standards-matrix-view.tsx` — matrix با search + org filter + cat filter, کارت‌های استاندارد با code + year + titleFa + description + category chips + calculation count

- `equipment/equipment-directory.tsx` — search + category filter, کارت تجهیز با icon, description, standards badges, calculations count

- `ai/encyclopedia-ai-assistant.tsx` — chat UI: bot avatar gradient, user avatar, typing dots, suggested questions, history limit 6, input + send button, fallback

- `detail/article-reading.tsx` — hero با breadcrumb, title, metadata (difficulty, readingTime, publishedAt, views, version), standards badges, AI button + share, TOC auto-extract از Tiptap JSON, main content با KnowledgeRenderer, formulas section, examples section, related articles grid, sidebar sticky TOC + standards + taxonomy + AI inline + equipment hint

#### Wrapper های ساده (۲ فایل تغییر)

- `public-knowledge-client.tsx` — حالا فقط `return <EncyclopediaHub />`
- `public-knowledge-detail-client.tsx` — حالا `return <ArticleReading slug={slug} />`

#### Fix اتصال (۲ فایل تغییر)

- `taxonomy-select.tsx` — fallback chain: `/taxonomy/type → /public/taxonomy/type → /plural → /public/taxonomy/plural`, staleTime 5min, label شامل id search

- `standards-manager.tsx` — fallback chain: `/standards → /public/standards`, تابع `searchStandards`

---

## استانداردها، مقررات، تجهیزات — نگاشت به docs

| مفهوم                                                                                                            | منبع docs                                        | پیاده‌سازی                                                    |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| IEC 60027, 60076, 60364-5-52, 60909, IEEE 80, 519, 1459, NEC 2023, ...                                           | engineering-standards-matrix.md                  | `standards-data.ts` 13 استاندارد با `relatedCalculations`     |
| 55 پلاگین: ohms-law...pq-voltage-regulation                                                                      | calculation-catalog.md                           | `calculations-map.ts` 19 کلیدی + `EQUIPMENT_REGISTRY` mapping |
| 8 دسته: foundation, cable, transformer, short-circuit, grounding, protection, motor, power-quality + AI metadata | electrical-plugin-guide.md                       | `EQUIPMENT_CATEGORIES`, `CATEGORY_LABEL`, `TAXONOMY_META`     |
| مقررات: NEC Table 310.15, NEC 250, IEC 60364-5-52, IEEE 80                                                       | engineering-standards-matrix secondary standards | `equipment-registry.regulations[]`                            |
| پایپلاین ingest                                                                                                  | knowledge-factory-architecture.md                | `KnowledgeFactoryModule` فعال شد                              |
| گراف دانش + ontology                                                                                             | knowledge-intelligence-architecture.md           | `KnowledgeIntelligenceModule` فعال شد                         |
| outbox + 12 events                                                                                               | event-topology.md                                | `SemanticIntegrationModule` فعال شد                           |

---

## تکنولوژی روز دنیا — چک‌لیست

- [x] Next.js 15 App Router (از قبل) + React 19
- [x] TanStack Query v5 `placeholderData` (جلوگیری از layout shift)
- [x] Debounced search 350ms
- [x] Command palette (⌘K) + `/` hotkey (ترند Linear, Vercel)
- [x] Fallback chain برای API (resilience pattern)
- [x] AI Gateway abstraction با mock fallback (graceful degradation)
- [x] Glassmorphism, gradient, backdrop-blur (2024-2026 design trend)
- [x] Floating action button با pulsing dot
- [x] Skeleton loading + optimistic UI
- [x] TOC auto-extract (modern reading experience)
- [x] StandardBadge رنگی بر اساس سازمان (design system)
- [x] Equipment Directory با emoji + category

---

## نتیجه‌گیری

- برنچ `arena/019fdffb-xennic` مستقل از main ایجاد شده و تمام تغییرات روی آن است
- بک‌اند: ۷ فایل، اتصال DB↔API ترمیم شد، public endpoints بدون auth اضافه شد
- فرانت‌اند: ۱۶ فایل، هاب مدرن با AI, استانداردها, تجهیزات, مقررات ساخته شد
- ارتباط با docs: standards-data, equipment-registry, calculations-map مستقیماً از engineering-standards-matrix و calculation-catalog استخراج شده
- نوع‌سنجی وب: `pnpm --filter @xennic/web typecheck` ✅ pass
- آماده برای push و PR به main (در صورت نیاز)

---

## دستورات اجرا

```bash
# نصب
pnpm install

# وب
pnpm --filter @xennic/web dev # http://localhost:3001/fa/knowledge

# API (نیاز به Docker)
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d postgres redis rabbitmq
pnpm --filter @xennic/api dev # http://localhost:3000/api/v1/docs

# تست هاب
curl http://localhost:3000/api/v1/public/knowledge/hub/overview | jq
curl http://localhost:3000/api/v1/categories | jq
curl http://localhost:3000/api/v1/public/standards?q=IEC | jq
```
