# مدیریت Git و GitHub در Xennic

> - **وضعیت:** سند اجرایی مختصر
> - **تاریخ ممیزی:** 2026-08-11
> - **Issue اجرا:** [#2](https://github.com/feerozmandiha/xennic/issues/2)
> - **دامنه:** Branchها، Pull Request، CI، Protection، Release و پاک‌سازی کنترل‌شده

این سند مرجع عملیاتی مدیریت Git/GitHub در Xennic است. هدف آن ایجاد یک مسیر ساده و قابل اجرا برای `main`، `dev` و Branchهای کاری است؛ نه ارائه آموزش عمومی Git.

## 1. مبنای آغاز کار

این Snapshot پیش از ایجاد Issue #2، Push شدن Branch فعلی و بازشدن [PR #3](https://github.com/feerozmandiha/xennic/pull/3) ثبت شد. ممیزی به‌صورت read-only انجام شد و چون Checkout محلی shallow است، Branchهای Remote با `git ls-remote` و GitHub API بررسی شدند.

| مورد                 | وضعیت مشاهده‌شده                                           |
| -------------------- | ---------------------------------------------------------- |
| Branch پیش‌فرض       | `main@e3a2dffd30ce`                                        |
| Branch کاری فعلی     | `arena/019ff14a-xennic`، فقط Local و بدون Upstream         |
| تعداد Branch         | 2 Local، 12 Remote head، در مجموع 13 نام یکتا              |
| `dev` / `develop`    | وجود ندارد                                                 |
| CI                   | آخرین Baseline روی `main` قرمز است                         |
| Protection           | Ruleset و Branch protection فعال وجود ندارد                |
| Tag / GitHub Release | وجود ندارد                                                 |
| Review               | فقط یک Collaborator قابل مشاهده؛ Reviewer مستقل وجود ندارد |
| Environment          | `production` بدون Approval و Branch policy                 |
| Stash / Worktree     | Stash خالی؛ یک Worktree                                    |

**نتیجه:** مدل هدف مناسب است، ولی Repository هنوز برای فعال‌سازی فوری Protection سخت‌گیرانه آماده نیست. ابتدا باید CI و Reviewer مستقل آماده شوند.

## 2. مدل Branch هدف

| Branch                                  | نقش                            | منبع تغییر                      | روش ورود                           | اقدام الزامی                                             |
| --------------------------------------- | ------------------------------ | ------------------------------- | ---------------------------------- | -------------------------------------------------------- |
| `main`                                  | Production و Release           | فقط Release PR یا Hotfix        | Reviewed PR                        | همیشه releasable؛ بدون Push مستقیم، Force-push یا Delete |
| `dev`                                   | Integration / Staging          | Branchهای کاری و Sync از `main` | Reviewed PR                        | همگام با `main`، buildable و testable؛ بدون توسعه مستقیم |
| `feature/*`                             | قابلیت جدید                    | latest `dev`                    | Squash PR به `dev`                 | کوتاه‌عمر، یک Issue و یک Outcome                         |
| `fix/*`                                 | رفع Bug                        | latest `dev`                    | Squash PR به `dev`                 | Test و regression evidence الزامی                        |
| `refactor/*`                            | تغییر ساختاری بدون تغییر رفتار | latest `dev`                    | Squash PR به `dev`                 | Scope محدود و Test موجود                                 |
| `docs/*`, `test/*`, `perf/*`, `chore/*` | کار تخصصی محدود                | latest `dev`                    | Squash PR به `dev`                 | نوع Branch با نوع تغییر هماهنگ باشد                      |
| `hotfix/*`                              | Incident تولید                 | `main`                          | PR به `main`، سپس Sync PR به `dev` | فقط حداقل Fix لازم و با اولویت بالا                      |
| `release/*`                             | Stabilization اختیاری          | `dev`                           | Release PR به `main`               | فقط وقتی ادامه توسعه هم‌زمان روی `dev` ضروری است         |

نام Branch کاری:

```text
<type>/<github-issue>-<short-description>
```

نمونه: `feature/412-workspace-invitation` یا `fix/487-ai-timeout`.

## 3. مسیر استاندارد تغییر و Release

1. یک GitHub Issue با Scope، Acceptance criteria، Owner و Risk ساخته می‌شود.
2. Branch کوتاه‌عمر از آخرین `dev` ساخته می‌شود.
3. Commitها از Conventional Commits استفاده می‌کنند و به Issue ارجاع می‌دهند.
4. Draft PR به `dev` باز می‌شود.
5. CI، Review و Conversationها کامل می‌شوند.
6. PR به‌صورت Squash وارد `dev` می‌شود.
7. پس از سبز بودن `dev`، Release PR از `dev` به `main` ایجاد می‌شود.
8. Release PR با Merge commit وارد `main` می‌شود.
9. Tag رسمی SemVer فقط روی Commit تأییدشده `main` ساخته می‌شود.
10. GitHub Release و Artifactها به همان Tag و SHA متصل می‌شوند.

Tagهای رسمی:

```text
vMAJOR.MINOR.PATCH
vMAJOR.MINOR.PATCH-rc.N
```

Run number، Build ID، digest و SHA فقط Build metadata هستند و نباید با Product Version مخلوط شوند.

## 4. تنظیمات مورد نیاز GitHub

تنظیمات باید ابتدا در حالت **Evaluate** یا پس از اجرای آزمایشی فعال شوند؛ فعال‌سازی Protection روی CI قرمز ممنوع است.

### `main`

- Require Pull Request و حداقل یک Approval مستقل؛ Self-approval مجاز نیست.
- Require conversation resolution.
- Require status checks فقط پس از سبز و پایدار شدن Gateها.
- Block direct push، force-push و deletion؛ Admin bypass عادی غیرفعال.
- Rebase merge غیرفعال؛ Release PR با Merge commit ادغام شود.
- Linear history فعال نشود، چون با Merge commit رسمی Release ناسازگار است.
- Tagهای `v*` فقط توسط Release Manager و پس از Release Gate ساخته شوند.

### `dev`

- Require Pull Request و حداقل یک Approval مستقل.
- Require یک Gate پایدار شامل lint، typecheck، test، build و checks معماری.
- Require branch up-to-date، پس از رفع مشکل Checkهای skipped/pending.
- Block direct push، force-push و deletion.
- PRهای عادی فقط با Squash merge ادغام شوند.

### Repository و Environment

- حداقل یک Reviewer مستقل اضافه شود تا Protection باعث قفل Repository نشود.
- PR template، Issue templates و CODEOWNERS در PRهای جدا افزوده شوند.
- Auto-delete فقط برای Branchهای جدید و پس از تعیین تکلیف Branchهای فعلی فعال شود.
- Environment به نام `production` فقط `main` را بپذیرد و Approval مستقل بخواهد.
- Secret، dependency و code scanning با دسترسی Admin بررسی و در صورت پشتیبانی فعال شوند.
- Merge Queue فعلاً لازم نیست؛ حجم فعالیت کم است و Workflowها هنوز `merge_group` را پشتیبانی نمی‌کنند.

## 5. اقدام لازم برای Branchهای موجود

هیچ Branch فعلی قبل از بررسی Owner، Diff، CI، Worktree و Stash حذف یا Merge نمی‌شود.

| Branch یا گروه                                 | اقدام مورد نیاز                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `main`                                         | توسعه مستقیم Freeze شود؛ CI تعمیر و سپس Protection فعال شود                         |
| `dev`                                          | پس از سبز شدن `main` از SHA دقیق آن ایجاد و به‌عنوان Integration/Staging محافظت شود |
| `arena/019ff14a-xennic`                        | فقط سند Governance را از طریق PR اولیه وارد کند؛ الگوی نام‌گذاری دائمی نیست         |
| `arena/019f75f0-xennic`                        | در ancestry مربوط به PR #1 است؛ فقط پس از تأیید Owner کاندید Cleanup است            |
| `arena/019f76cd-xennic`                        | تغییرات Storage حفظ، Issue تطبیق ساخته و تغییرات معتبر انتخابی منتقل شوند           |
| `arena/019f7a82-xennic`                        | تغییرات Bill Bot حفظ، Product/Test review و انتقال انتخابی انجام شود                |
| `arena/019fdffb-xennic`                        | Branch مهم Admin/Knowledge؛ همراه Branchهای Landing سه‌طرفه مقایسه شود              |
| `feat/landing-cms` و `feat/landing-cms-merged` | هیچ‌کدام منبع قطعی فرض نشوند؛ در Branch جدید از `dev` Consolidate شوند              |
| سه Branch Knowledge                            | Upload، Pipeline و E2E به Issueهای مستقل تقسیم و تغییرات مفید منتقل شوند            |
| `feat/activate-dormant-platform-modules`       | فعال‌سازی 14 Module به چند PR کوچک و وابسته تقسیم شود                               |
| `feat/redis-single-config`                     | Security/Runtime review و Test اتصال؛ سپس PR مستقل                                  |

Branchهای قدیمی `feat/*` یا `arena/*` به‌صورت wholesale Merge نمی‌شوند. Branch جدید از `dev` ساخته و Commit/تغییر معتبر با ثبت Origin SHA منتقل می‌شود.

## 6. برنامه اجرای اولیه

### مرحله 1 — ثبت Governance

1. یک Issue با عنوان «Git/GitHub governance baseline and migration» ایجاد شود.
2. همین سند روی Branch فعلی Commit شود.
3. Branch فعلی Push و یک PR موقت به `main` باز شود؛ چون `dev` هنوز وجود ندارد، این یک Transition کنترل‌شده است.
4. PR باید Review و نتیجه CI را شفاف ثبت کند؛ Check قرمز به‌عنوان موفقیت پذیرفته نشود.

**خروجی:** سند Governance در Repository و یک Issue مرجع برای تمام اقدامات بعدی.

### مرحله 2 — آماده‌سازی مدیریت

1. Reviewer مستقل تعیین شود.
2. برای CI baseline و هر خوشه Branch قدیمی Issue جدا ساخته شود.
3. Branch ledger شامل Owner، SHA، آخرین فعالیت، Diff و تصمیم پیشنهادی تکمیل شود.

**خروجی:** هیچ Branch بی‌مالک یا بدون تصمیم باقی نماند.

### مرحله 3 — تعمیر Baseline و ایجاد `dev`

1. CI در یک PR جدا و محدود تعمیر شود؛ Triggerهای `develop` و `main-only` با مدل `dev` هماهنگ شوند.
2. پس از سبز شدن `main`، `dev` از SHA دقیق `main` ایجاد شود.
3. یک PR آزمایشی کوچک به `dev` اجرا و همه Gateها بررسی شوند.

**خروجی:** `main` releasable و `dev` سبز، buildable و testable.

### مرحله 4 — Protection

1. Rulesetهای `main` و `dev` ابتدا در Evaluate mode ساخته شوند.
2. پس از یک چرخه موفق PR و Release، Rulesetها Active شوند.
3. Production Environment و Tag restriction فعال شوند.

**خروجی:** Push مستقیم و Merge بدون Review/CI از نظر GitHub مسدود باشد.

### مرحله 5 — بازیابی و Cleanup

1. Branchهای ارزشمند به Branchهای استاندارد از `dev` منتقل شوند.
2. هر Branch قدیمی فقط با Owner approval، SHA evidence و تأیید نبود Stash/Worktree وابسته حذف شود.
3. اولین Release رسمی از مسیر `dev → main → SemVer tag → GitHub Release` انجام شود.

## 7. مجوز اجرای عملیات

- بررسی‌های read-only بدون مجوز اضافه مجازند.
- Commit، Push، ایجاد Branch/Issue/PR و تغییر Ruleset باید Scope مشخص و تأیید کاربر داشته باشند.
- Merge، حذف Branch/Tag، Force-push، Rebase تاریخچه و تغییر Production نیازمند تأیید صریح و برنامه بازگشت هستند.
- هیچ تنظیم GitHub یا فایل CI/CD در همین مرحله مستندی تغییر داده نمی‌شود.

## 8. اقدام بعدی

اولین اقدام اجرایی پیشنهادی، **ایجاد Issue مرجع Governance** و سپس Commit/Push همین سند روی `arena/019ff14a-xennic` و ایجاد PR به `main` است. پس از Merge این PR، مرحله CI baseline و ایجاد `dev` آغاز می‌شود.
