# Branch Ledger — ثبت وضعیت شاخه‌ها و تصمیم‌ها

> - **وضعیت:** ثبت اولیه (Baseline)
> - **تاریخ ممیزی:** 2026-08-15
> - **Issue:** [#2](https://github.com/feerozmandiha/xennic/issues/2) — chore(governance): establish Git/GitHub baseline and migration
> - **مرجع:** `docs/governance/git-github-governance.md` (مرحله ۲ — آماده‌سازی مدیریت)
> - **روش:** ممیزی read-only با `git ls-remote` و GitHub API (Branches و Compare)؛ بدون هیچ تغییر شاخه/حذف/Merge

این سند فقط وضعیت را ثبت می‌کند؛ هیچ شاخه‌ای بدون تأیید Owner حذف یا Merge نمی‌شود (مطابق بند ۵ و ۷ سند Governance).

## 1. قواعد خواندن جدول

- **وضعیت نسبت به `dev`** از GitHub Compare (`compare/dev...BRANCH`) گرفته شده است:
  - `ahead_by` = تعداد Commit روی شاخه که در `dev` نیست (کار تلف‌نشده).
  - `behind_by` = تعداد Commit روی `dev` که در شاخه نیست (فاصله شاخه از `dev`).
  - `status` = `ahead` | `behind` | `diverged` | `identical`.
- **Owner** = نویسنده آخرین Commit روی HEAD شاخه (به‌عنوان نماینده مالکیت ثبت می‌شود).
- SHA کوتاه در جدول و SHA کامل در پیوست ۱ آمده است.

## 2. جدول کامل شاخه‌ها (۱۵ Remote Head)

| Branch                              | SHA      | آخرین فعالیت (UTC)     | Owner        | وضعیت vs `dev` | رابطه / محتوا                                                     | تصمیم پیشنهادی |
| ----------------------------------- | -------- | ---------------------- | ------------ | -------------- | ----------------------------------------------------------------- | -------------- |
| `main`                              | e3a2dff  | 2026-08-07T19:36:47Z   | feerozmandiha | `behind` (0/1) | Production؛ Freeze توسعه مستقیم                                   | نگهداری + Protection |
| `dev`                               | 650c2dd  | 2026-08-15T08:40:07Z   | arena-bot    | `identical`    | Integration/Staging؛ از `main@e3a2dff` + `650c2dd`                | نگهداری + Protection |
| `arena/01a004a5-xennic`             | 4e535c8  | 2026-08-15T09:21:46Z   | feerozmandiha | `ahead` (2/0)  | شاخه کاری سشن جاری (Ledger + بستن #4)                             | حذف پس از Squash-Merge PRها |
| `arena/019f75f0-xennic`             | 78504fb  | 2026-08-07T06:37:49Z   | feerozmandiha | `behind` (0/6) | در Ancestry `dev`؛ محتوای PR #1 (AI provider + storage + admin UI) | کاندید Cleanup پس از تأیید Owner |
| `arena/019ff14a-xennic`             | faf9cbc  | 2026-08-14T17:27:20Z   | feerozmandiha | `diverged` (9/1) | سند Governance در `dev` است (PR #3، Squash)؛ ۹ Commit میانی باقی است | کاندید Cleanup پس از تأیید Owner |
| `arena/019f76cd-xennic`             | 1613466  | 2026-07-18T20:39:03Z   | feerozmandiha | `diverged` (1/25) | Storage phase 0 — audit + design                                   | Issue مستقل → انتقال انتخابی |
| `arena/019f7a82-xennic`             | 3bfd420  | 2026-07-19T13:49:43Z   | feerozmandiha | `diverged` (1/25) | Bill Bot؛ بخشی در `main` (merge `25f29aa`)؛ باقی نیاز به Review      | Issue مستقل → انتقال انتخابی |
| `arena/019fdffb-xennic`             | b627e95  | 2026-08-09T13:07:28Z   | feerozmandiha | `diverged` (22/1) | Admin/Knowledge؛ Ancestor در `feat/landing-cms-merged`             | در خوشه Landing Consolidate شود |
| `feat/landing-cms`                  | 1aae683  | 2026-08-08T20:02:00Z   | feerozmandiha | `diverged` (6/1) | Landing CMS؛ ۱ Commit پس از Merge-point دارد                       | منبع قطعی نیست؛ Consolidate |
| `feat/landing-cms-merged`           | 15e2584  | 2026-08-09T19:15:35Z   | feerozmandiha | `diverged` (25/1) | ادغام Admin/Knowledge + Landing؛ مرجع Consolidation                | Issue مستقل → انتقال انتخابی |
| `feat/knowledge-factory-fastify-upload` | ea8b0ab | 2026-08-07T09:33:36Z | feerozmandiha | `diverged` (1/25) | Knowledge Factory — Upload                                        | خوشه Knowledge → Issue مستقل |
| `feat/knowledge-factory-pipeline`    | 46b5ef2  | 2026-08-07T11:35:17Z   | feerozmandiha | `diverged` (1/25) | Knowledge Factory — Pipeline                                      | خوشه Knowledge → Issue مستقل |
| `feat/knowledge-pipeline-e2e`        | 5acaead  | 2026-08-07T15:47:22Z   | feerozmandiha | `diverged` (2/25) | Knowledge Pipeline — E2E + CI services                            | خوشه Knowledge → Issue مستقل |
| `feat/activate-dormant-platform-modules` | 525d1c3 | 2026-08-06T14:13:21Z | feerozmandiha | `diverged` (1/25) | فعال‌سازی ۱۴ Module خاموش                                         | شکستن به چند PR کوچک وابسته |
| `feat/redis-single-config`           | c6f7ce7  | 2026-08-07T09:03:58Z   | feerozmandiha | `diverged` (1/25) | Redis — پیکربندی واحد                                            | Security/Runtime review + تست اتصال → PR مستقل |

## 3. گروه‌بندی و تصمیم

### 3.1 شاخه‌های محافظت‌شده

- `main` و `dev` نگه داشته می‌شوند. در ممیزی این سشن، Ruleset **`protect-main-and-dev` با enforcement=active** ثبت شد
  (push مستقیم/force/delete مسدود؛ ورود فقط با PR). این با مدل هدف Governance هماهنگ است.

### 3.2 شاخه کاری جاری (Transient)

- `arena/01a004a5-xennic` شاخه همین سشن است و الگوی نام‌گذاری دائمی نیست؛ پس از Squash-Merge شدن PRها حذف می‌شود.

### 3.3 کاندیدهای Cleanup (فقط پس از تأیید Owner)

| Branch                | دلیل                                         |
| --------------------- | -------------------------------------------- |
| `arena/019f75f0-xennic` | محتوا در Ancestry `dev` است (PR #1)         |
| `arena/019ff14a-xennic` | محتوا (سند Governance) در `dev` است (PR #3) |

شرط حذف: تأیید صریح Owner + تأیید نبود Stash/Worktree وابسته + ثبت SHA به‌عنوان evidence (بند ۵ Governance).

### 3.4 خوشه Storage

- `arena/019f76cd-xennic`: Audit/Design فاز ۰ ذخیره‌سازی. در شاخه جدید از `dev`، Commitهای معتبر با ثبت Origin SHA منتقل شوند.

### 3.5 خوشه Bill Bot

- `arena/019f7a82-xennic`: سرویس Bill Bot. پیش از انتقال، Product/Test review لازم است؛ فقط بخش‌های معتبر انتخابی منتقل شوند.

### 3.6 خوشه Admin/Knowledge + Landing

- `arena/019fdffb-xennic` داخل `feat/landing-cms-merged` است (ahead 3/0 در مقایسه معکوس).
- `feat/landing-cms` یک Commit (`1aae683`) دارد که در `feat/landing-cms-merged` نیست.
- **نتیجه:** هیچ‌کدام به‌تنهایی منبع قطعی نیستند؛ در شاخه جدید از `dev` با مرجعیت `feat/landing-cms-merged` Consolidate و به Issue مستقل منتقل شوند.

### 3.7 خوشه Knowledge Factory

- سه شاخه (`fastify-upload`, `pipeline`, `e2e`) incremental اما غیرخطی هستند (هرکدام ۱–۲ Commit منحصربه‌فرد).
- **نتیجه:** انتقال انتخابی به `dev` از مسیر Issue مستقل؛ ترتیب پیشنهادی: Upload → Pipeline → E2E.

### 3.8 سایر

- `feat/activate-dormant-platform-modules`: فعال‌سازی ۱۴ Module به چند PR کوچک و وابسته تقسیم شود.
- `feat/redis-single-config`: پیش از PR مستقل، Security/Runtime review و تست اتصال اجرا شود.

## 4. اقدامات بعدی (پیشنهادی)

1. تعیین **Reviewer مستقل** در GitHub (نیازمند اقدام Owner است؛ Robot صرفاً read است).
2. ساخت Issueهای زیر و انتقال انتخابی تغییرات از `dev`:
   - `chore(storage): port phase-0 storage changes from arena/019f76cd`
   - `feat(bill-bot): review and port bill-bot service from arena/019f7a82`
   - `feat(admin/landing): consolidate admin-knowledge + landing from landing cluster`
   - `feat(knowledge-factory): port upload → pipeline → e2e from knowledge cluster`
   - `feat(api): activate dormant platform modules (split into dependent PRs)`
   - `chore(redis): review and land single redis config`
3. پس از Merge و انتقال، حذف کاندیدهای Cleanup با evidence SHA.

## 5. وضعیت پذیرش Issue #2

- [x] سند Governance با PR بررسی و Merge شد (PR #3)
- [x] `dev` از SHA تأییدشده `main` ساخته شد (`dev@650c2dd`)
- [x] CI baseline سبز است (PR #3 و PR #5)
- [x] Branch Ledger برای شاخه‌های فعلی ایجاد شد (همین سند)
- [ ] Reviewer مستقل مشخص شود (اقدام Owner در GitHub)
- [ ] Rulesetها پس از چرخه موفق Evaluate→Enforce نهایی شوند (هماکنون `active` است و ثبت شد)
- [ ] بازیابی/انتقال انتخابی و Cleanup شاخه‌های قدیمی (Issues بعدی)

## پیوست ۱ — SHA کامل

```text
main                                    e3a2dffd30ce583a2924419585a5435dc16c6168
dev                                     650c2dd9cc958f5a879ff4512e520bd63ea656e9
arena/01a004a5-xennic                    4e535c84ec72a431c71698f0216455146ceb78eb (شاخه کاری جاری؛ در حال پیشروی)
arena/019f75f0-xennic                    78504fb0cc8431d03d7aed6b17714f6a35b0fb9a
arena/019ff14a-xennic                    faf9cbc1dd96efdf4565244bb66c7b78c2475359
arena/019f76cd-xennic                    1613466a959227beb84c0a304fc6a02dcf6421b4
arena/019f7a82-xennic                    3bfd420a071e8e50441eecc855ddb1d61ee3bd49
arena/019fdffb-xennic                    b627e95ea0c8b3fdcc70e8da8773181dc2a7d8d1
feat/landing-cms                         1aae683530bb0fea9297e8dd0e6b0d58480149af
feat/landing-cms-merged                  15e2584f763752cdf850f654372b6b25d46c087e
feat/knowledge-factory-fastify-upload    ea8b0ab4359ad4af29e98abf6d5f59aab9549d51
feat/knowledge-factory-pipeline          46b5ef297fe3575d260318f711f27a4f238178c0
feat/knowledge-pipeline-e2e              5acaeadb63d02bdb2cd6318c4072c1af22c1349c
feat/activate-dormant-platform-modules   525d1c3607884b414dd15fb28c97cec30e0768c5
feat/redis-single-config                 c6f7ce78a163abacdb253ac0d6081adba148502f
```
