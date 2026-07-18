# Enterprise Canonical Vocabulary & Semantic Ontology — واژه‌نامه رسمی و هستی‌شناسی SMOS

> **شناسه:** ARCH-003
> **وضعیت:** پیش‌نویس معماری
> **نسخه:** 1.0.0-draft
> **تاریخ:** 2026-06-26
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** CON-000, ARCH-000, ARCH-010, ARCH-011, ARCH-012, ARCH-030
> **مخاطب:** human, agent, n8n, mcp

---

## فهرست مطالب

- [۱. هدف](#۱-هدف)
- [۲. دامنه](#۲-دامنه)
- [۳. حاکمیت واژگان](#۳-حاکمیت-واژگان)
- [۴. قراردادهای نام‌گذاری](#۴-قراردادهای-نام‌گذاری)
- [۵. واژگان رسمی](#۵-واژگان-رسمی)
- [۶. مدل هستی‌شناسی](#۶-مدل-هستی‌شناسی)
- [۷. قواعد واژگان کنترل‌شده](#۷-قواعد-واژگان-کنترل‌شده)
- [۸. مرجع نام‌گذاری سازمانی](#۸-مرجع-نام‌گذاری-سازمانی)
- [۹. قواعد معنایی برای عامل‌های هوشمند](#۹-قواعد-معنایی-برای-عامل‌های-هوشمند)
- [۱۰. قواعد نگارش برای انسان](#۱۰-قواعد-نگارش-برای-انسان)
- [۱۱. تکامل آینده](#۱۱-تکامل-آینده)

---

## ۱. هدف

این سند **واژگان رسمی و هستی‌شناسی SMOS** را تعریف می‌کند. این سند یک فرهنگ لغت ساده نیست — این سند **مرجع عالی زبان** SMOS است.

هر انسانی، عامل هوشمند، گردش کار، سند و نرم‌افزاری در SMOS باید دقیقاً از واژگان تعریف‌شده در این سند استفاده کند. هر مفهوم دقیقاً یک تعریف رسمی دارد. هیچ ابهامی در terminology مجاز نیست.

---

## ۲. دامنه

این سند تمام مفاهیم زیر را پوشش می‌دهد:

- مفاهیم معماری و سیستم
- مفاهیم محتوا و رسانه
- مفاهیم دانش و اطلاعات
- مفاهیم حکمرانی و تصمیم‌گیری
- مفاهیم عامل‌های هوشمند و خودکارسازی
- مفاهیم اندازه‌گیری و گزارش
- مفاهیم چرخه حیات و وضعیت

---

## ۳. حاکمیت واژگان

| قاعده        | توضیح                                                          |
| ------------ | -------------------------------------------------------------- |
| **V-GOV-01** | این سند تنها مرجع معتبر برای تعریف واژگان SMOS است             |
| **V-GOV-02** | هر مفهوم دقیقاً یک تعریف رسمی دارد                             |
| **V-GOV-03** | هیچ سندی نمی‌تواند واژه‌ای را مغایر با این سند تعریف کند       |
| **V-GOV-04** | افزودن واژه جدید نیازمند ADR و به‌روزرسانی این سند است         |
| **V-GOV-05** | تغییر تعریف یک واژه نیازمند ADR و تأیید معمار سیستم است        |
| **V-GOV-06** | واژه‌های منسوخ در بخش Forbidden Terms ثبت می‌شوند              |
| **V-GOV-07** | عامل‌های هوشمند موظف به استفاده از واژگان رسمی هستند           |
| **V-GOV-08** | بازبینی این سند همزمان با بازبینی معماری (۶ ماهه) انجام می‌شود |

---

## ۴. قراردادهای نام‌گذاری

### ۴.۱ شناسه مفاهیم

```
XXX-NNN
```

- `XXX`: پیشوند سه حرفی دسته
- `NNN`: شماره سه رقمی

### ۴.۲ دسته‌بندی شناسه‌ها

| پیشوند | دسته               |
| ------ | ------------------ |
| CON    | مفاهیم سیستمی      |
| CNT    | مفاهیم محتوا       |
| KNW    | مفاهیم دانش        |
| GOV    | مفاهیم حکمرانی     |
| AI     | مفاهیم عامل هوشمند |
| AUT    | مفاهیم خودکارسازی  |
| MET    | مفاهیم اندازه‌گیری |
| LIF    | مفاهیم چرخه حیات   |
| REL    | روابط معنایی       |

### ۴.۳ قواعد نام انگلیسی

- PascalCase برای نام‌های چندکلمه‌ای (ContentPiece)
- حروف بزرگ برای acronymها (SMOS, ADR, KPI, RACI)
- نام مفرد (به جز موارد استثنا)

### ۴.۴ قواعد نام فارسی

- نام کامل فارسی در ابتدا
- نام انگلیسی رایج در پرانتز
- از اسامی بیگانه غیرضروری پرهیز شود

---

## ۵. واژگان رسمی

### ۵.۱ مفاهیم سیستمی (CON)

---

#### CON-001: SMOS

| فیلد           | مقدار                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| **English**    | SMOS (Social Media Operating System)                                                                            |
| **Persian**    | اس‌موس — سیستم عامل مدیریت شبکه‌های اجتماعی                                                                     |
| **Definition** | سیستم عامل جامع برای مدیریت تمام فعالیت‌های رسانه‌ای سازمان؛ شامل انسان، عامل هوشمند، گردش کار خودکار و مستندات |
| **Parent**     | —                                                                                                               |
| **Children**   | Platform, Campaign, Workflow, AI Agent                                                                          |
| **Synonyms**   | SMOS Platform, SMOS System                                                                                      |
| **Forbidden**  | SMOS software, SMOS app, SMOS tool                                                                              |
| **SSOT**       | CON-000                                                                                                         |
| **Owner**      | System Architect                                                                                                |

---

#### CON-002: Xennic

| فیلد           | مقدار                                     |
| -------------- | ----------------------------------------- |
| **English**    | Xennic (Zar Noor Niroo Yekta)             |
| **Persian**    | زنیک — زر نور نیرو یکتا                   |
| **Definition** | شرکت مالک و متولی SMOS                    |
| **Parent**     | —                                         |
| **Synonyms**   | Xennic Company, Xennic Organization       |
| **Forbidden**  | Xennic brand, Xennic team (partial usage) |
| **SSOT**       | CON-000                                   |
| **Owner**      | CEO                                       |

---

#### CON-003: Platform

| فیلد           | مقدار                                                               |
| -------------- | ------------------------------------------------------------------- |
| **English**    | Platform                                                            |
| **Persian**    | پلتفرم                                                              |
| **Definition** | یک شبکه اجتماعی یا کانال انتشار محتوا که SMOS با آن یکپارچه شده است |
| **Parent**     | SMOS                                                                |
| **Children**   | Account                                                             |
| **Synonyms**   | Social network, Channel, Network                                    |
| **Forbidden**  | App, Platform app, Social app                                       |
| **SSOT**       | PLAT-\*                                                             |
| **Owner**      | Platform Manager                                                    |

---

#### CON-004: Campaign

| فیلد           | مقدار                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| **English**    | Campaign                                                                                               |
| **Persian**    | کمپین                                                                                                  |
| **Definition** | مجموعه‌ای از فعالیت‌های رسانه‌ای با هدف تجاری مشخص، بازه زمانی معین و شاخص‌های موفقیت قابل اندازه‌گیری |
| **Parent**     | Strategy                                                                                               |
| **Children**   | Content Pillar                                                                                         |
| **Synonyms**   | Media campaign, Marketing campaign                                                                     |
| **Forbidden**  | Project, Initiative, Program (when referring to campaigns)                                             |
| **SSOT**       | CAM-\*                                                                                                 |
| **Owner**      | Media Director                                                                                         |

---

#### CON-005: Strategy

| فیلد           | مقدار                                                                 |
| -------------- | --------------------------------------------------------------------- |
| **English**    | Strategy                                                              |
| **Persian**    | استراتژی                                                              |
| **Definition** | طرح بلندمدت برای دستیابی به اهداف سازمانی از طریق فعالیت‌های رسانه‌ای |
| **Parent**     | Vision                                                                |
| **Children**   | Campaign, Goal                                                        |
| **Synonyms**   | Strategic plan                                                        |
| **Forbidden**  | Tactics, Plan (when referring to strategy)                            |
| **SSOT**       | PLAT-\*                                                               |
| **Owner**      | Media Director                                                        |

---

#### CON-006: Goal

| فیلد           | مقدار                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| **English**    | Goal                                                                                |
| **Persian**    | هدف کلان                                                                            |
| **Definition** | نتیجه مطلوب قابل اندازه‌گیری که یک کمپین یا فعالیت برای دستیابی به آن طراحی شده است |
| **Parent**     | Strategy                                                                            |
| **Children**   | Objective                                                                           |
| **Synonyms**   | Target, Aim                                                                         |
| **Forbidden**  | Wish, Hope, Intention (non-measurable)                                              |
| **SSOT**       | MET-\*                                                                              |
| **Owner**      | Media Director                                                                      |

---

#### CON-007: Objective

| فیلد           | مقدار                                                  |
| -------------- | ------------------------------------------------------ |
| **English**    | Objective                                              |
| **Persian**    | هدف عملیاتی                                            |
| **Definition** | گام مشخص و قابل اندازه‌گیری در مسیر دستیابی به یک Goal |
| **Parent**     | Goal                                                   |
| **Synonyms**   | Operational target                                     |
| **Forbidden**  | Goal (when referring to objective-level targets)       |
| **SSOT**       | MET-\*                                                 |
| **Owner**      | Content Manager                                        |

---

#### CON-008: Mission

| فیلد           | مقدار                                               |
| -------------- | --------------------------------------------------- |
| **English**    | Mission                                             |
| **Persian**    | مأموریت                                             |
| **Definition** | دلیل وجودی SMOS و ارزشی که برای سازمان ایجاد می‌کند |
| **Parent**     | —                                                   |
| **Children**   | Vision                                              |
| **Synonyms**   | Purpose                                             |
| **Forbidden**  | Goal, Objective, Strategy                           |
| **SSOT**       | CON-000                                             |
| **Owner**      | System Architect                                    |

---

#### CON-009: Vision

| فیلد           | مقدار                                         |
| -------------- | --------------------------------------------- |
| **English**    | Vision                                        |
| **Persian**    | چشم‌انداز                                     |
| **Definition** | تصویر آرمانی از آینده SMOS در یک بازه بلندمدت |
| **Parent**     | Mission                                       |
| **Synonyms**   | Long-term aspiration                          |
| **Forbidden**  | Mission, Goal, Prediction                     |
| **SSOT**       | CON-000                                       |
| **Owner**      | System Architect                              |

---

### ۵.۲ مفاهیم محتوا (CNT)

---

#### CNT-001: Content Pillar

| فیلد           | مقدار                                                            |
| -------------- | ---------------------------------------------------------------- |
| **English**    | Content Pillar                                                   |
| **Persian**    | ستون محتوا                                                       |
| **Definition** | حوزه موضوعی پایدار و همیشگی که محتوای سازمان حول آن تولید می‌شود |
| **Parent**     | Campaign                                                         |
| **Children**   | Content Series                                                   |
| **Synonyms**   | Content theme, Topic pillar                                      |
| **Forbidden**  | Category, Subject                                                |
| **SSOT**       | PILLAR-\*                                                        |
| **Owner**      | Content Strategist                                               |

---

#### CNT-002: Content Series

| فیلد           | مقدار                                                        |
| -------------- | ------------------------------------------------------------ |
| **English**    | Content Series                                               |
| **Persian**    | سری محتوا                                                    |
| **Definition** | دنباله‌ای از قطعات محتوای مرتبط که در طول زمان منتشر می‌شوند |
| **Parent**     | Content Pillar                                               |
| **Children**   | Content Piece                                                |
| **Synonyms**   | Content sequence                                             |
| **Forbidden**  | Series (without content prefix), Collection                  |
| **SSOT**       | SERIES-\*                                                    |
| **Owner**      | Content Producer                                             |

---

#### CNT-003: Content Piece

| فیلد           | مقدار                                           |
| -------------- | ----------------------------------------------- |
| **English**    | Content Piece                                   |
| **Persian**    | قطعه محتوا                                      |
| **Definition** | واحد پایه و اتمی محتوا که قابل انتشار مستقل است |
| **Parent**     | Content Series                                  |
| **Children**   | Platform Version, Asset                         |
| **Synonyms**   | Content item                                    |
| **Forbidden**  | Post, Article, Content (without piece)          |
| **SSOT**       | CONT-\*                                         |
| **Owner**      | Content Writer                                  |

---

#### CNT-004: Publication

| فیلد           | مقدار                                                         |
| -------------- | ------------------------------------------------------------- |
| **English**    | Publication                                                   |
| **Persian**    | انتشار                                                        |
| **Definition** | رویداد انتشار یک قطعه محتوا در یک پلتفرم مشخص در یک زمان مشخص |
| **Parent**     | Content Variant                                               |
| **Synonyms**   | Publish event                                                 |
| **Forbidden**  | Post, Publish                                                 |
| **SSOT**       | Publication log (system)                                      |
| **Owner**      | System                                                        |

---

#### CNT-005: Asset

| فیلد           | مقدار                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| **English**    | Asset                                                                     |
| **Persian**    | دارایی                                                                    |
| **Definition** | هر فایل دیجیتال که در تولید محتوا استفاده می‌شود (تصویر، ویدئو، صوت، سند) |
| **Parent**     | Content Piece                                                             |
| **Children**   | Asset Version                                                             |
| **Synonyms**   | Media file, Digital asset                                                 |
| **Forbidden**  | File, Resource                                                            |
| **SSOT**       | AST-\*                                                                    |
| **Owner**      | Asset Manager                                                             |

---

#### CNT-006: Media Asset

| فیلد           | مقدار                                   |
| -------------- | --------------------------------------- |
| **English**    | Media Asset                             |
| **Persian**    | دارایی رسانه‌ای                         |
| **Definition** | Asset با محتوای تصویری، ویدئویی یا صوتی |
| **Parent**     | Asset                                   |
| **Synonyms**   | Creative asset                          |
| **Forbidden**  | Asset (when type is specified)          |
| **SSOT**       | AST-\*                                  |
| **Owner**      | Asset Manager                           |

---

#### CNT-007: Brand Asset

| فیلد           | مقدار                                                     |
| -------------- | --------------------------------------------------------- |
| **English**    | Brand Asset                                               |
| **Persian**    | دارایی برند                                               |
| **Definition** | Asset که حاوی عناصر هویت برند است (لوگو، رنگ‌ها، فونت‌ها) |
| **Parent**     | Asset                                                     |
| **Synonyms**   | Brand element                                             |
| **Forbidden**  | Logo (when referring to all brand assets)                 |
| **SSOT**       | BRD-\*                                                    |
| **Owner**      | Brand Manager                                             |

---

### ۵.۳ مفاهیم دانش (KNW)

---

#### KNW-001: Knowledge

| فیلد           | مقدار                                                                                 |
| -------------- | ------------------------------------------------------------------------------------- |
| **English**    | Knowledge                                                                             |
| **Persian**    | دانش                                                                                  |
| **Definition** | اطلاعات ساختاریافته، تأییدشده و قابل استفاده که از تجربیات و تحلیل‌ها استخراج شده است |
| **Synonyms**   | Organizational knowledge                                                              |
| **Forbidden**  | Data, Information (when referring to processed knowledge)                             |
| **SSOT**       | KNW-\*                                                                                |
| **Owner**      | Knowledge Manager                                                                     |

---

#### KNW-002: Knowledge Object

| فیلد           | مقدار                                     |
| -------------- | ----------------------------------------- |
| **English**    | Knowledge Object                          |
| **Persian**    | شیء دانش                                  |
| **Definition** | واحد پایه و اتمی دانش در پایگاه دانش SMOS |
| **Parent**     | Knowledge Domain                          |
| **Children**   | Knowledge Version                         |
| **Synonyms**   | Knowledge item, K-Object                  |
| **Forbidden**  | Document, Article                         |
| **SSOT**       | KNW-\*                                    |
| **Owner**      | Knowledge Manager                         |

---

#### KNW-003: Knowledge Repository

| فیلد           | مقدار                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------- |
| **English**    | Knowledge Repository                                                                      |
| **Persian**    | مخزن دانش                                                                                 |
| **Definition** | یکی از پنج محل ذخیره دانش در SMOS: مستندات، پرامپت‌ها، پایگاه دانش، گزارش‌ها، حافظه Agent |
| **Parent**     | SMOS                                                                                      |
| **Synonyms**   | Knowledge store                                                                           |
| **Forbidden**  | Database, Storage                                                                         |
| **SSOT**       | KNW-\*                                                                                    |
| **Owner**      | Knowledge Manager                                                                         |

---

#### KNW-004: Evidence

| فیلد           | مقدار                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| **English**    | Evidence                                                                 |
| **Persian**    | شاهد                                                                     |
| **Definition** | داده یا اطلاعات خامی که برای پشتیبانی از یک ادعا یا یافته استفاده می‌شود |
| **Parent**     | Finding                                                                  |
| **Synonyms**   | Supporting data, Source                                                  |
| **Forbidden**  | Proof (when not absolute)                                                |
| **SSOT**       | KNW-\*                                                                   |
| **Owner**      | Analyst                                                                  |

---

#### KNW-005: Finding

| فیلد           | مقدار                                                   |
| -------------- | ------------------------------------------------------- |
| **English**    | Finding                                                 |
| **Persian**    | یافته                                                   |
| **Definition** | نتیجه تحلیل داده‌ها که یک الگو یا حقیقت را آشکار می‌کند |
| **Parent**     | Insight                                                 |
| **Children**   | Evidence                                                |
| **Synonyms**   | Observation                                             |
| **Forbidden**  | Conclusion, Opinion                                     |
| **SSOT**       | KNW-\*                                                  |
| **Owner**      | Analyst                                                 |

---

#### KNW-006: Insight

| فیلد           | مقدار                                                              |
| -------------- | ------------------------------------------------------------------ |
| **English**    | Insight                                                            |
| **Persian**    | بینش                                                               |
| **Definition** | دانش عمیق و قابل اقدام که از ترکیب یافته‌ها و تحلیل استخراج می‌شود |
| **Parent**     | Knowledge Object                                                   |
| **Children**   | Finding                                                            |
| **Synonyms**   | Actionable knowledge                                               |
| **Forbidden**  | Idea, Thought, Opinion                                             |
| **SSOT**       | KNW-\*                                                             |
| **Owner**      | Knowledge Manager                                                  |

---

### ۵.۴ مفاهیم حکمرانی (GOV)

---

#### GOV-001: Decision

| فیلد           | مقدار                                                               |
| -------------- | ------------------------------------------------------------------- |
| **English**    | Decision                                                            |
| **Persian**    | تصمیم                                                               |
| **Definition** | انتخاب آگاهانه و مستند بین گزینه‌های ممکن که بر SMOS تأثیر می‌گذارد |
| **Parent**     | —                                                                   |
| **Children**   | ADR                                                                 |
| **Synonyms**   | Choice, Resolution                                                  |
| **Forbidden**  | Opinion, Preference                                                 |
| **SSOT**       | ADR-\*                                                              |
| **Owner**      | Decision Owner                                                      |

---

#### GOV-002: ADR (Architectural Decision Record)

| فیلد           | مقدار                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| **English**    | ADR (Architectural Decision Record)                                                  |
| **Persian**    | اِیدآر — ثبت تصمیم معماری                                                            |
| **Definition** | سند رسمی و غیرقابل حذف که یک تصمیم معماری را با زمینه، گزینه‌ها و پیامدها ثبت می‌کند |
| **Parent**     | Decision                                                                             |
| **Synonyms**   | Architecture decision, AD record                                                     |
| **Forbidden**  | Log, Note, Memo                                                                      |
| **SSOT**       | ARCH-034                                                                             |
| **Owner**      | System Architect                                                                     |

---

#### GOV-003: Policy

| فیلد           | مقدار                                                       |
| -------------- | ----------------------------------------------------------- |
| **English**    | Policy                                                      |
| **Persian**    | خط‌مشی                                                      |
| **Definition** | قاعده سطح بالا که چارچوب تصمیم‌گیری و اقدام را تعیین می‌کند |
| **Parent**     | Governance                                                  |
| **Children**   | Standard                                                    |
| **Synonyms**   | Policy directive                                            |
| **Forbidden**  | Rule, Procedure, Guideline                                  |
| **SSOT**       | GOV-\*                                                      |
| **Owner**      | Governance Engineer                                         |

---

#### GOV-004: Standard

| فیلد           | مقدار                                                         |
| -------------- | ------------------------------------------------------------- |
| **English**    | Standard                                                      |
| **Persian**    | استاندارد                                                     |
| **Definition** | الزام قابل اندازه‌گیری که نحوه اجرای یک Policy را مشخص می‌کند |
| **Parent**     | Policy                                                        |
| **Children**   | Procedure                                                     |
| **Synonyms**   | Specification                                                 |
| **Forbidden**  | Rule, Policy, Guideline                                       |
| **SSOT**       | GOV-\*                                                        |
| **Owner**      | Governance Engineer                                           |

---

#### GOV-005: Procedure

| فیلد           | مقدار                                        |
| -------------- | -------------------------------------------- |
| **English**    | Procedure                                    |
| **Persian**    | رویه                                         |
| **Definition** | گام‌های مشخص و ترتیبی برای اجرای یک Standard |
| **Parent**     | Standard                                     |
| **Synonyms**   | SOP, Work instruction                        |
| **Forbidden**  | Process, Workflow, Guideline                 |
| **SSOT**       | OPS-\*                                       |
| **Owner**      | Process Owner                                |

---

#### GOV-006: Guideline

| فیلد           | مقدار                                           |
| -------------- | ----------------------------------------------- |
| **English**    | Guideline                                       |
| **Persian**    | راهنما                                          |
| **Definition** | توصیه غیرالزامی که بهترین روش را پیشنهاد می‌کند |
| **Parent**     | Standard                                        |
| **Synonyms**   | Recommendation, Best practice                   |
| **Forbidden**  | Policy, Standard, Procedure, Rule               |
| **SSOT**       | EDT-_, BRD-_                                    |
| **Owner**      | Content Manager                                 |

---

#### GOV-007: Governance

| فیلد           | مقدار                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **English**    | Governance                                                                                       |
| **Persian**    | حکمرانی                                                                                          |
| **Definition** | چارچوب قواعد، نقش‌ها، فرایندها و اختیارات که تصمیم‌گیری و accountability را در SMOS تعریف می‌کند |
| **Parent**     | —                                                                                                |
| **Children**   | Policy, Standard, Procedure                                                                      |
| **Synonyms**   | Governance framework                                                                             |
| **Forbidden**  | Management, Administration, Control                                                              |
| **SSOT**       | ARCH-030                                                                                         |
| **Owner**      | System Architect                                                                                 |

---

#### GOV-008: Compliance

| فیلد           | مقدار                                                     |
| -------------- | --------------------------------------------------------- |
| **English**    | Compliance                                                |
| **Persian**    | تطابق                                                     |
| **Definition** | وضعیت هماهنگی یک موجودیت با قواعد تعریف‌شده در Governance |
| **Synonyms**   | Conformance                                               |
| **Forbidden**  | Audit (process vs outcome)                                |
| **SSOT**       | ARCH-030                                                  |
| **Owner**      | System Architect                                          |

---

#### GOV-009: Playbook

| فیلد           | مقدار                                                                         |
| -------------- | ----------------------------------------------------------------------------- |
| **English**    | Playbook                                                                      |
| **Persian**    | کتابچه                                                                        |
| **Definition** | مجموعه ساختاریافته از رویه‌ها و دستورالعمل‌ها برای عملیات یک پلتفرم یا فرایند |
| **Parent**     | Platform                                                                      |
| **Children**   | Procedure                                                                     |
| **Synonyms**   | Runbook                                                                       |
| **Forbidden**  | Manual, Guide                                                                 |
| **SSOT**       | PLAT-\*                                                                       |
| **Owner**      | Platform Manager                                                              |

---

### ۵.۵ مفاهیم عامل هوشمند (AI)

---

#### AI-001: AI Agent

| فیلد           | مقدار                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| **English**    | AI Agent                                                                                               |
| **Persian**    | عامل هوشمند                                                                                            |
| **Definition** | یک سیستم نرم‌افزاری خودکار با مسئولیت مشخص، مرزهای اختیار مشخص و توانایی تصمیم‌گیری در دامنه تعریف‌شده |
| **Parent**     | SMOS                                                                                                   |
| **Children**   | Agent Instance                                                                                         |
| **Synonyms**   | Agent, Intelligent agent                                                                               |
| **Forbidden**  | Bot, AI assistant, Chatbot                                                                             |
| **SSOT**       | AI-\*                                                                                                  |
| **Owner**      | AI Governance Manager                                                                                  |

---

#### AI-002: Human Operator

| فیلد           | مقدار                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| **English**    | Human Operator                                                                     |
| **Persian**    | اپراتور انسانی                                                                     |
| **Definition** | فرد انسانی که در SMOS فعالیت می‌کند، تصمیم می‌گیرد و بر عامل‌های هوشمند نظارت دارد |
| **Parent**     | —                                                                                  |
| **Synonyms**   | Operator, User                                                                     |
| **Forbidden**  | Employee, Staff (generic)                                                          |
| **SSOT**       | GOV-\*                                                                             |
| **Owner**      | HR                                                                                 |

---

#### AI-003: Prompt

| فیلد           | مقدار                                                        |
| -------------- | ------------------------------------------------------------ |
| **English**    | Prompt                                                       |
| **Persian**    | پرامپت                                                       |
| **Definition** | دستورالعمل ورودی ساختاریافته برای هدایت خروجی یک عامل هوشمند |
| **Parent**     | Prompt Library                                               |
| **Children**   | Prompt Version                                               |
| **Synonyms**   | Instruction, System prompt                                   |
| **Forbidden**  | Command, Template, Script                                    |
| **SSOT**       | PRM-\*                                                       |
| **Owner**      | Prompt Engineer                                              |

---

#### AI-004: Prompt Library

| فیلد           | مقدار                                                 |
| -------------- | ----------------------------------------------------- |
| **English**    | Prompt Library                                        |
| **Persian**    | کتابخانه پرامپت                                       |
| **Definition** | مخزن ساختاریافته و نسخه‌بندی‌شده تمام پرامپت‌های SMOS |
| **Parent**     | Knowledge Repository                                  |
| **Children**   | Prompt                                                |
| **Synonyms**   | Prompt repository                                     |
| **Forbidden**  | Prompt collection, Prompt folder                      |
| **SSOT**       | PRM-\*                                                |
| **Owner**      | Prompt Engineer                                       |

---

### ۵.۶ مفاهیم خودکارسازی (AUT)

---

#### AUT-001: Workflow

| فیلد           | مقدار                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **English**    | Workflow                                                                                           |
| **Persian**    | گردش کار                                                                                           |
| **Definition** | دنباله‌ای خودکار از گام‌ها که توسط n8n orchestrate می‌شود و می‌تواند شامل گره‌های انسانی و AI باشد |
| **Parent**     | Automation                                                                                         |
| **Children**   | Workflow Step, Trigger                                                                             |
| **Synonyms**   | Automated workflow                                                                                 |
| **Forbidden**  | Process, Procedure, Flow                                                                           |
| **SSOT**       | AUT-\*                                                                                             |
| **Owner**      | Automation Engineer                                                                                |

---

#### AUT-002: Automation

| فیلد           | مقدار                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| **English**    | Automation                                                                |
| **Persian**    | خودکارسازی                                                                |
| **Definition** | لایه اجرایی SMOS که شامل گردش کارها، triggerها، یکپارچه‌سازی‌ها و MCP است |
| **Parent**     | SMOS                                                                      |
| **Children**   | Workflow                                                                  |
| **Synonyms**   | Automation system, Automation layer                                       |
| **Forbidden**  | Scripting, Programming                                                    |
| **SSOT**       | ARCH-014                                                                  |
| **Owner**      | Automation Engineer                                                       |

---

### ۵.۷ مفاهیم اندازه‌گیری (MET)

---

#### MET-001: Metric

| فیلد           | مقدار                                                              |
| -------------- | ------------------------------------------------------------------ |
| **English**    | Metric                                                             |
| **Persian**    | متریک                                                              |
| **Definition** | یک کمیت قابل اندازه‌گیری که وضعیت یک جنبه از عملکرد را نشان می‌دهد |
| **Parent**     | KPI                                                                |
| **Synonyms**   | Measure                                                            |
| **Forbidden**  | KPI (when not key), Number, Stat                                   |
| **SSOT**       | MET-\*                                                             |
| **Owner**      | Analyst                                                            |

---

#### MET-002: KPI (Key Performance Indicator)

| فیلد           | مقدار                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| **English**    | KPI (Key Performance Indicator)                                                     |
| **Persian**    | کِی‌پی‌آی — شاخص کلیدی عملکرد                                                       |
| **Definition** | متریک استراتژیک که به طور مستقیم به یک Goal متصل است و موفقیت را اندازه‌گیری می‌کند |
| **Parent**     | Goal                                                                                |
| **Children**   | Metric                                                                              |
| **Synonyms**   | Key metric, Performance indicator                                                   |
| **Forbidden**  | Metric, Measure, Number                                                             |
| **SSOT**       | MET-\*                                                                              |
| **Owner**      | Media Director                                                                      |

---

#### MET-003: Analytics

| فیلد           | مقدار                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| **English**    | Analytics                                                              |
| **Persian**    | تحلیل                                                                  |
| **Definition** | فرایند سیستماتیک جمع‌آوری، پردازش و تفسیر داده‌ها برای استخراج Insight |
| **Synonyms**   | Data analytics                                                         |
| **Forbidden**  | Reporting, Statistics                                                  |
| **SSOT**       | MET-\*                                                                 |
| **Owner**      | Analyst                                                                |

---

#### MET-004: Report

| فیلد           | مقدار                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| **English**    | Report                                                                  |
| **Persian**    | گزارش                                                                   |
| **Definition** | ارائه ساختاریافته متریک‌ها، یافته‌ها و بینش‌ها برای یک مخاطب و هدف مشخص |
| **Parent**     | Analytics                                                               |
| **Synonyms**   | Performance report                                                      |
| **Forbidden**  | Dashboard (interactive vs static)                                       |
| **SSOT**       | REP-\*                                                                  |
| **Owner**      | Analyst                                                                 |

---

### ۵.۸ مفاهیم مخاطب (AUD)

---

#### AUD-001: Audience

| فیلد           | مقدار                                                 |
| -------------- | ----------------------------------------------------- |
| **English**    | Audience                                              |
| **Persian**    | مخاطب                                                 |
| **Definition** | گروه هدفی که محتوای SMOS برای آن تولید و منتشر می‌شود |
| **Parent**     | Account                                               |
| **Children**   | Persona                                               |
| **Synonyms**   | Target audience                                       |
| **Forbidden**  | Follower, Fan, Customer                               |
| **SSOT**       | AUD-\*                                                |
| **Owner**      | Analyst                                               |

---

#### AUD-002: Persona

| فیلد           | مقدار                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| **English**    | Persona                                                                  |
| **Persian**    | پرسونا                                                                   |
| **Definition** | نماینده نیمه‌واقعی یک بخش از مخاطبان با ویژگی‌ها، نیازها و رفتارهای مشخص |
| **Parent**     | Audience                                                                 |
| **Synonyms**   | User persona, Audience persona                                           |
| **Forbidden**  | Avatar, Character, Profile                                               |
| **SSOT**       | PERSONA-\*                                                               |
| **Owner**      | Content Strategist                                                       |

---

### ۵.۹ مفاهیم چرخه حیات (LIF)

---

#### LIF-001: Lifecycle

| فیلد           | مقدار                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| **English**    | Lifecycle                                                               |
| **Persian**    | چرخه حیات                                                               |
| **Definition** | دنباله وضعیت‌های استانداردی که یک موجودیت از ایجاد تا بایگانی طی می‌کند |
| **Parent**     | —                                                                       |
| **Children**   | Draft, Review, Approved, Published, Archived                            |
| **Synonyms**   | Life cycle                                                              |
| **Forbidden**  | Process, Flow                                                           |
| **SSOT**       | ARCH-011, ARCH-031                                                      |
| **Owner**      | System Architect                                                        |

---

#### LIF-002: Draft

| فیلد           | مقدار                                                       |
| -------------- | ----------------------------------------------------------- |
| **English**    | Draft                                                       |
| **Persian**    | پیش‌نویس                                                    |
| **Definition** | وضعیت اولیه یک سند یا محتوا که هنوز برای بازبینی آماده نیست |
| **Parent**     | Lifecycle                                                   |
| **Synonyms**   | First draft, Working draft                                  |
| **Forbidden**  | Draft version, Working copy                                 |
| **SSOT**       | ARCH-031                                                    |
| **Owner**      | Content Writer                                              |

---

#### LIF-003: Review

| فیلد           | مقدار                                                        |
| -------------- | ------------------------------------------------------------ |
| **English**    | Review                                                       |
| **Persian**    | بازبینی                                                      |
| **Definition** | وضعیت یک سند یا محتوا که در فرایند ارزیابی کیفیت و تطابق است |
| **Parent**     | Lifecycle                                                    |
| **Synonyms**   | Peer review, Content review                                  |
| **Forbidden**  | Check, Inspection                                            |
| **SSOT**       | ARCH-031                                                     |
| **Owner**      | Reviewer                                                     |

---

#### LIF-004: Approval

| فیلد           | مقدار                                                      |
| -------------- | ---------------------------------------------------------- |
| **English**    | Approval                                                   |
| **Persian**    | تأیید                                                      |
| **Definition** | تصمیم مثبت توسط فرد مجاز برای حرکت به مرحله بعدی چرخه حیات |
| **Parent**     | Lifecycle                                                  |
| **Synonyms**   | Sign-off, Authorization                                    |
| **Forbidden**  | OK, Go-ahead                                               |
| **SSOT**       | ARCH-031                                                   |
| **Owner**      | Approver                                                   |

---

#### LIF-005: Publication Status

| فیلد           | مقدار                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **English**    | Publication Status                                                                                 |
| **Persian**    | وضعیت انتشار                                                                                       |
| **Definition** | وضعیت فعلی یک قطعه محتوا در چرخه حیات: Draft, In Review, Approved, Published, Archived, Deprecated |
| **Parent**     | Lifecycle                                                                                          |
| **Synonyms**   | Content status, Publish state                                                                      |
| **Forbidden**  | Post status, Status                                                                                |
| **SSOT**       | ARCH-031                                                                                           |
| **Owner**      | Content Manager                                                                                    |

---

#### LIF-006: Version

| فیلد           | مقدار                                              |
| -------------- | -------------------------------------------------- |
| **English**    | Version                                            |
| **Persian**    | نسخه                                               |
| **Definition** | شناسه یکتای یک وضعیت خاص از یک موجودیت در طول زمان |
| **Parent**     | Lifecycle                                          |
| **Synonyms**   | Revision                                           |
| **Forbidden**  | Copy, Backup, Edition                              |
| **SSOT**       | GOV-002                                            |
| **Owner**      | System Architect                                   |

---

#### LIF-007: Archive

| فیلد           | مقدار                                                                 |
| -------------- | --------------------------------------------------------------------- |
| **English**    | Archive                                                               |
| **Persian**    | بایگانی                                                               |
| **Definition** | وضعیت نهایی یک موجودیت که دیگر فعال نیست اما برای مرجع نگهداری می‌شود |
| **Parent**     | Lifecycle                                                             |
| **Synonyms**   | Archive status                                                        |
| **Forbidden**  | Deleted, Removed, Trash                                               |
| **SSOT**       | ARCH-031                                                              |
| **Owner**      | System                                                                |

---

### ۵.۱۰ مفاهیم اضافی

---

#### EXT-001: Approval (n.)

| فیلد           | مقدار                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| **English**    | Approval (noun)                                                        |
| **Persian**    | تأیید (اسم) — یک شیء تأیید                                             |
| **Definition** | ثبت رسمی یک تصمیم مثبت که یک موجودیت را به مرحله بعدی چرخه حیات می‌برد |
| **Synonyms**   | Sign-off record                                                        |
| **Forbidden**  | OK, Green light                                                        |
| **SSOT**       | ابزاری                                                                 |
| **Owner**      | Approver                                                               |

---

#### EXT-002: Review (n.)

| فیلد           | مقدار                                                       |
| -------------- | ----------------------------------------------------------- |
| **English**    | Review (noun)                                               |
| **Persian**    | بازبینی (اسم) — یک شیء بازبینی                              |
| **Definition** | ارزیابی سیستماتیک یک موجودیت بر اساس معیارهای کیفیت و تطابق |
| **Synonyms**   | Review record                                               |
| **Forbidden**  | Check, Examination                                          |
| **SSOT**       | ابزاری                                                      |
| **Owner**      | Reviewer                                                    |

---

#### EXT-003: Owner

| فیلد           | مقدار                              |
| -------------- | ---------------------------------- |
| **English**    | Owner                              |
| **Persian**    | مالک                               |
| **Definition** | فرد پاسخگو برای یک موجودیت در SMOS |
| **Synonyms**   | Responsible person                 |
| **Forbidden**  | Manager, Admin                     |
| **SSOT**       | ARCH-030                           |
| **Owner**      | System Architect                   |

---

## ۶. مدل هستی‌شناسی (Ontology Model)

### ۶.۱ تعریف

مدل هستی‌شناسی SMOS شامل ۱۶ رابطه معنایی استاندارد بین مفاهیم است:

| ID      | رابطه          | جهت          | معنی                                          |
| ------- | -------------- | ------------ | --------------------------------------------- |
| REL-001 | `contains`     | والد ← فرزند | یک موجودیت شامل موجودیت دیگر است              |
| REL-002 | `belongs_to`   | فرزند ← والد | یک موجودیت به موجودیت دیگر تعلق دارد          |
| REL-003 | `references`   | ← →          | یک موجودیت به موجودیت دیگر ارجاع می‌دهد       |
| REL-004 | `derived_from` | ←            | یک موجودیت از موجودیت دیگر مشتق شده است       |
| REL-005 | `governs`      | ←            | یک موجودیت بر موجودیت دیگر حاکم است           |
| REL-006 | `requires`     | ←            | یک موجودیت به موجودیت دیگر نیاز دارد          |
| REL-007 | `creates`      | ←            | یک موجودیت موجودیت دیگر را ایجاد می‌کند       |
| REL-008 | `approves`     | ←            | یک موجودیت موجودیت دیگر را تأیید می‌کند       |
| REL-009 | `reviews`      | ←            | یک موجودیت موجودیت دیگر را بازبینی می‌کند     |
| REL-010 | `owns`         | ←            | یک موجودیت مالک موجودیت دیگر است              |
| REL-011 | `publishes`    | ←            | یک موجودیت موجودیت دیگر را منتشر می‌کند       |
| REL-012 | `measures`     | ←            | یک موجودیت موجودیت دیگر را اندازه‌گیری می‌کند |
| REL-013 | `improves`     | ←            | یک موجودیت موجودیت دیگر را بهبود می‌بخشد      |
| REL-014 | `supersedes`   | ←            | یک موجودیت جایگزین موجودیت دیگر می‌شود        |
| REL-015 | `archives`     | ←            | یک موجودیت موجودیت دیگر را بایگانی می‌کند     |
| REL-016 | `validates`    | ←            | یک موجودیت موجودیت دیگر را اعتبارسنجی می‌کند  |

### ۶.۲ ماتریس روابط اصلی

| مبدأ             | رابطه          | مقصد                                   |
| ---------------- | -------------- | -------------------------------------- |
| SMOS             | `contains`     | Platform, Campaign, Workflow, AI Agent |
| Campaign         | `contains`     | Content Pillar                         |
| Content Pillar   | `contains`     | Content Series                         |
| Content Series   | `contains`     | Content Piece                          |
| Content Piece    | `belongs_to`   | Content Series                         |
| Platform Version | `belongs_to`   | Content Piece                          |
| Publication      | `belongs_to`   | Platform Version                       |
| Constitution     | `governs`      | همه                                    |
| Policy           | `governs`      | Standard                               |
| Standard         | `governs`      | Procedure                              |
| Decision         | `creates`      | ADR                                    |
| ADR              | `supersedes`   | ADR (قبلی)                             |
| AI Agent         | `creates`      | Content Piece                          |
| Human Operator   | `approves`     | Content Piece, Publication             |
| Human Operator   | `reviews`      | Content Piece, Knowledge Object        |
| Workflow         | `publishes`    | Publication                            |
| Report           | `measures`     | Metric, KPI                            |
| Insight          | `derived_from` | Finding                                |
| Knowledge Object | `improves`     | Prompt                                 |
| Archive          | `archives`     | همه                                    |

---

## ۷. قواعد واژگان کنترل‌شده

### ۷.۱ واژه‌های ترجیحی (Preferred Terms)

| به جای         | استفاده کن                                     |
| -------------- | ---------------------------------------------- |
| Post           | Content Piece                                  |
| Article        | Content Piece                                  |
| Social network | Platform                                       |
| Bot            | AI Agent                                       |
| Rule           | Policy (rule سطح بالا) یا Standard (الزام فنی) |
| Goal           | Objective (عملیاتی) یا KPI (قابل اندازه‌گیری)  |
| SOP            | Procedure                                      |

### ۷.۲ واژه‌های منسوخ (Deprecated Terms)

| واژه           | جایگزین             | تاریخ انقضا |
| -------------- | ------------------- | ----------- |
| WF             | AUT                 | S0.1        |
| Workflow (pod) | Automation Workflow | S0.1        |

### ۷.۳ واژه‌های ممنوع (Forbidden Terms)

| واژه      | دلیل                                          |
| --------- | --------------------------------------------- |
| Bot       | تحقیرآمیز برای عامل‌های هوشمند                |
| Script    | نادرست برای Workflow                          |
| App       | نادرست برای Platform                          |
| Dashboard | نادرست برای Report (تعاملی در مقابل ایستا)    |
| Post      | مبهم — مشخص نیست Content Piece یا Publication |

### ۷.۴ واژه‌های رزرو شده (Reserved Words)

| واژه         | دلیل                    |
| ------------ | ----------------------- |
| SMOS         | فقط برای خود سیستم عامل |
| Xennic       | فقط برای شرکت           |
| Constitution | فقط برای CON-000        |
| Architecture | فقط برای اسناد ARCH-\*  |

### ۷.۵ قواعد جمع و اختصار

- اسامی در واژه‌نامه رسمی به صورت مفرد ثبت می‌شوند
- جمع با افزودن "ها" به فارسی و "s" به انگلیسی ساخته می‌شود
- اختصارات در اولین استفاده در هر سند باید توضیح داده شوند

---

## ۸. مرجع نام‌گذاری سازمانی

| موجودیت       | الگو                                | مثال                            |
| ------------- | ----------------------------------- | ------------------------------- |
| Document      | `NN-name-with-dashes.md`            | `30-governance-architecture.md` |
| Folder        | `NN-NAME/`                          | `00-ARCHITECTURE/`              |
| Campaign      | `CAM-YYYY-QN-PLATFORM`              | `CAM-2026-Q3-IG`                |
| Content Piece | `CONT-YYYY-MM-DD-SEQ`               | `CONT-2026-06-26-042`           |
| Asset         | `TYPE-CAMPAIGN-DESCRIPTION-VERSION` | `IMG-CAM-2026-Q3-hero-v2`       |
| Prompt        | `PRM-CATEGORY-SEQ`                  | `PRM-CONTENT-042`               |
| Workflow      | `WF-CATEGORY-DESCRIPTION`           | `WF-CONTENT-PIPELINE`           |
| AI Agent      | `AGENT-ROLE-SEQ`                    | `AGENT-WRITING-003`             |
| Report        | `REP-PERIOD-TYPE`                   | `REP-WEEKLY-ENGAGEMENT`         |
| ADR           | `ADR-NNN`                           | `ADR-019`                       |

---

## ۹. قواعد معنایی برای عامل‌های هوشمند

**۹.۱** عامل‌های هوشمند باید از واژگان رسمی این سند در تمام خروجی‌های خود استفاده کنند.

**۹.۲** عامل‌های هوشمند باید هر Synonym را به Preferred Term نگاشت کنند.

**۹.۳** عامل‌های هوشمند هرگز نباید از Forbidden Terms استفاده کنند.

**۹.۴** در صورت ابهام در معنا، عامل هوشمند باید:
۱. سند SSOT مربوطه را جستجو کند
۲. اگر پاسخ نیافت، از انسان سؤال کند
۳. هرگز حدس نزند

**۹.۵** عامل‌های هوشمند باید روابط Ontology را در استدلال خود در نظر بگیرند:

- اگر X `governs` Y است، X مقدم بر Y است
- اگر X `creates` Y است، X مسئول Y است
- اگر X `supersedes` Y است، X معتبرتر از Y است

**۹.۶** عامل‌های هوشمند باید هنگام ارجاع به مفاهیم، شناسه رسمی (CON-001, CNT-003) را نیز ذکر کنند.

---

## ۱۰. قواعد نگارش برای انسان

**۱۰.۱** نویسندگان انسانی باید از واژگان رسمی این سند استفاده کنند.

**۱۰.۲** اولین استفاده از هر واژه رسمی در یک سند باید با شناسه آن باشد: `Content Piece (CNT-003)`.

**۱۰.۳** از Forbidden Terms در مستندات رسمی استفاده نشود.

**۱۰.۴** در صورت نیاز به استفاده از واژه خارج از این سند، ابتدا در بخش Future Evolution ثبت شود.

**۱۰.۵** اختصارات در اولین استفاده باید توضیح داده شوند.

---

## ۱۱. تکامل آینده

| مرحله                 | مسئول       | فرایند                          |
| --------------------- | ----------- | ------------------------------- |
| **پیشنهاد واژه جدید** | هر کس       | ارسال درخواست به معمار دانش     |
| **بررسی**             | معمار دانش  | بررسی عدم تداخل با واژگان موجود |
| **ثبت ADR**           | معمار دانش  | ADR تغییر واژگان                |
| **تأیید**             | معمار سیستم | تأیید ADR                       |
| **به‌روزرسانی**       | معمار دانش  | افزودن به این سند               |

### قواعد تکامل

۱. حداکثر یک بار در هر ۳ ماه می‌توان واژه جدید اضافه کرد (مگر در شرایط اضطراری)
۲. تغییر تعریف واژه‌های CON-\* فقط با MAJOR version مجاز است
۳. حذف واژه ممنوع است — واژه‌ها فقط به Deprecated منتقل می‌شوند
۴. هر به‌روزرسانی باید در بخش تغییرات این سند ثبت شود
۵. پس از هر به‌روزرسانی، عامل‌های هوشمند باید بازآموزی شوند

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط               |
| ----------- | ---------- | -------------------------------- | ------------------ |
| ۱.۰.۰-draft | 2026-06-26 | انتشار اولیه برای بازبینی معماری | معمار دانش سازمانی |
