# بازیابی و تأیید Frozen-Install Baseline — بستن Issue #4

> - **وضعیت:** تأیید و مستند شد
> - **تاریخ:** 2026-08-15
> - **Issue:** [#4](https://github.com/feerozmandiha/xennic/issues/4) — fix(ci): restore frozen-install baseline before dev rollout
> - **Commit مرجع:** `dev@650c2dd9cc958f5a879ff4512e520bd63ea656e9` — fix(ci): establish governance and complete integration gates (#3)
> - **دامنه:** فقط ثبت علت، Diff و شواهد؛ بدون تغییر Feature یا Governance

## خلاصه

مشکل `ERR_PNPM_OUTDATED_LOCKFILE` هنگام نصب `--frozen-lockfile` شناسایی، رفع و تأیید شد.
وابستگی اختیاری `pdfmake` در `services/bill-bot/package.json` اعلان شده بود، اما ورودی متناظر آن در
`pnpm-lock.yaml` ثبت نشده بود. Commit مرجع روی `dev` این ورودی را اضافه کرد و همه Gateهای Node اکنون سبز هستند.

## علت ریشه‌ای (Root Cause)

1. در Merge سرویس Bill Bot (commit `25f29aa` — «merge: arena/019f7a82 (bill-bot service + docs)»،
   2026-08-07)، وابستگی `pdfmake@^0.3.11` به `optionalDependencies` در `services/bill-bot/package.json` اضافه شد.
2. `pnpm-lock.yaml` پس از آن تغییر دوباره تولید نشد؛ در نتیجه importer مربوط به `services/bill-bot`
   در لاک‌فایل غایب ماند.
3. چون CI از `pnpm install --frozen-lockfile` استفاده می‌کند، نصب با خطای زیر متوقف می‌شد:

```text
ERR_PNPM_OUTDATED_LOCKFILE
pnpm-lock.yaml is not up to date with services/bill-bot/package.json
added dependency: pdfmake@^0.3.11
```

این خطا فقط مسیرهای Node (`CI / node` و `Release Gate / Architecture Validation`) را تحت تأثیر قرار می‌داد؛
Jobهای Python (`engineering-service` و `ai-service`) مستقل از pnpm هستند و موفق بودند.

## تصمیم درباره `pdfmake`

**نتیجه: `pdfmake` حفظ می‌شود** و به‌عنوان `optionalDependency` باقی می‌ماند (حذف نمی‌شود):

- `services/bill-bot/src/report/pdf.ts` آن را به‌صورت **پویا و اختیاری** بارگذاری می‌کند:
  `await import('pdfmake/build/pdfmake.js').catch(() => null)`.
- خروجی PDF گزارش قبض، قابلیت اصلی Bill Bot است (`docs/bill-bot/07-REPORT-AND-CONSULTATION.md`).
- مسیر جایگزین خودکفا (گزارش HTML بدون وابستگی) در `report-html.ts` وجود دارد؛ بنابراین قرارگیری در
  `optionalDependencies` (و نه `dependencies`) انتخاب درست و کم‌ریسک است.

## Diff لاک‌فایل (حداقلی و Review شده)

```diff
--- a/pnpm-lock.yaml
+++ b/pnpm-lock.yaml
@@ -511,6 +511,12 @@ importers:

   packages/types: {}

+  services/bill-bot:
+    optionalDependencies:
+      pdfmake:
+        specifier: ^0.3.11
+        version: 0.3.11
+
 packages:
```

تنها ۶ خط اضافه شده و هیچ وابستگی دیگری تغییر نکرده است.

## شواهد CI (بدون Skip/Bypass)

| Gate                                   | Run                                                                                  | نتیجه      |
| -------------------------------------- | ------------------------------------------------------------------------------------ | ---------- |
| CI (node) — `pnpm install --frozen-lockfile` | push `dev`: [31875046006](https://github.com/feerozmandiha/xennic/actions/runs/31875046006) | ✅ success |
| API E2E Gate                           | push `dev`: [31875046036](https://github.com/feerozmandiha/xennic/actions/runs/31875046036) | ✅ success |
| Release Gate (Architecture Validation) | PR #5: [31876613141](https://github.com/feerozmandiha/xennic/actions/runs/31876613141) | ✅ success |
| CI (node + Python)                     | PR #5: [31876613142](https://github.com/feerozmandiha/xennic/actions/runs/31876613142) | ✅ success |

- مرحله `Install dependencies` در همه Workflowها همچنان `pnpm install --frozen-lockfile` است؛
  هیچ Gateای با skip/bypass به‌عنوان موفق پذیرفته نشده است.
- Triggerهای CI از `develop` به `dev` هماهنگ شدند.

## معیار پذیرش Issue #4

- [x] `corepack pnpm install --frozen-lockfile` موفق است (شواهد CI بالا)
- [x] `CI / node` از مرحله Install عبور می‌کند
- [x] `Release Gate / Architecture Validation` از مرحله Install عبور می‌کند (PR #5، run 31876613141)
- [x] علت و Diff لاک‌فایل در PR ثبت شده است (همین سند)
- [x] هیچ Test یا Gate با skip/bypass پذیرفته نشده است
- [x] `dev` از SHA تأییدشده `main` ایجاد شده است: `dev@650c2dd` با parent مستقیم `main@e3a2dff`

> نکته: Jobهای `Build Certification`، `Release Artifacts` و `Release Validator` در PR به `dev` به‌صورت
> طراحی‌شده skip می‌شوند (فقط روی `main`/`release/*` اجرا می‌شوند). این skip مربوط به انتشار است،
> نه نصب وابستگی؛ اعتبارسنجی frozen-install در `Architecture Validation` و `node` به‌طور واقعی اجرا و سبز شد.

## گام بعدی

پس از Merge این PR و بسته‌شدن Issue #4، مرحله بعد در Issue #2 (chore(governance)) است:
ساخت Branch Ledger برای ۱۴ Branch موجود، تعیین Reviewer مستقل، و سپس Evaluate→Enforce قوانین باقی‌مانده.
