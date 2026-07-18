# Enterprise Brand Knowledge Foundation — پایه دانش برند سازمانی

> **شناسه:** KNW-701
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-07-02
> **مسئول:** معمار برند سازمانی
> **وابستگی:** [KNW-000](./00-enterprise-knowledge-architecture.md), [KNW-001](./10-knowledge-index.md), [KNW-510](./518-ai-meta-architecture.md)
> **مخاطب:** human, ai-agent, knowledge-engineer, brand-architect, brand-governance-officer

---

## 1. Purpose

KNW-701 نخستین سند خانواده Brand Knowledge (KNW-BRD) و SSOT (تک منبع حقیقت) برای تمام مفاهیم، دامنه‌ها، موجودیت‌ها، قابلیت‌ها و کارکردهای برند سازمانی SMOS است.

### Why KNW-701 Exists

بدون یک پایه دانش برند:

- مفاهیم برند در BRD-001, BRD-002 و سایر اسناد پراکنده می‌شوند
- Agentها نمی‌توانند دانش برند را به صورت ساختاریافته مصرف کنند
- قابلیت‌های برند قابل ردیابی و اندازه‌گیری نیستند
- اضافه کردن هویت برند جدید نیازمند بازتعریف مفاهیم است
- یکپارچگی برند در پلتفرم‌های مختلف تضمین نمی‌شود
- تکامل دانش برند بدون مبنا باقی می‌ماند

KNW-701 این مشکلات را با تعریف **چارچوب یکپارچه دانش برند سازمانی** حل می‌کند.

### Role of KNW-701 in SMOS

| سند            | نقش                                                 |
| -------------- | --------------------------------------------------- |
| KNW-000        | معماری دانش سازمانی                                 |
| KNW-001        | نمایه مرکزی دانش                                    |
| KNW-510        | معماری کلان — متا معماری خانواده‌های دانش           |
| BRD-001        | معماری سیستم برند — مصرف‌کننده مفاهیم KNW-701       |
| BRD-002        | معماری صدای برند — مصرف‌کننده مفاهیم KNW-701        |
| **KNW-701**    | **SSOT مفاهیم، دامنه‌ها و قابلیت‌های برند سازمانی** |
| AI-001..AI-014 | عامل‌های هوشمند — مصرف‌کننده مفاهیم برند            |
| PLAT-\*        | کتابچه‌های پلتفرم — مصرف‌کننده ساختار برند          |

---

## 2. Scope

### Inside Scope

| حوزه                       | توضیح                                      |
| -------------------------- | ------------------------------------------ |
| Brand Knowledge Philosophy | هستی‌شناسی و اصول بنیادین برند             |
| Brand Identity Model       | معماری هویت برند — لایه‌ها و عناصر ساختاری |
| Brand Knowledge Domains    | دامنه‌های ۸‌گانه دانش برند                 |
| Brand Concepts             | ۲۰ مفهوم بنیادین برند                      |
| Brand Entities             | ۱۲ موجودیت برند                            |
| Brand Attributes           | ویژگی‌های ساختاری برند                     |
| Brand Capabilities         | ۱۴ قابلیت برند                             |
| Brand Functions            | ۱۴ کارکرد برند                             |
| Brand Taxonomy             | طبقه‌بندی دانش برند                        |
| Brand State Model          | ۸ وضعیت برند                               |
| Brand Lifecycle Model      | ۸ مرحله چرخه حیات برند                     |
| Brand Governance Model     | مدل حکمرانی برند                           |
| Brand Consistency Model    | مدل سازگاری برند                           |
| Brand Validation Model     | مدل اعتبارسنجی برند                        |
| Brand Metrics Model        | ۱۵ معیار برند                              |
| Brand Registry Model       | مدل ثبت و نمایه‌سازی برند                  |
| Brand Constraint Model     | ۸ محدودیت برند                             |
| Brand Quality Gates        | ۷ گیت کیفیت                                |
| Brand Evolution Model      | مدل تکامل برند                             |
| Brand Relationship Model   | ۱۰ رابطه برند                              |
| Brand Hierarchy Model      | سلسله‌مراتب برند                           |

### Outside Scope

| حوزه                              | دلیل                         |
| --------------------------------- | ---------------------------- |
| استراتژی بازاریابی                | خارج از معماری دانش          |
| کمپین‌های تبلیغاتی                | حوزه عملیاتی خارج از KNW     |
| شعارهای تبلیغاتی                  | خارج از مرز معماری دانش      |
| محتوای کپی‌رایتینگ                | حوزه تولید محتوا             |
| طراحی UI/UX                       | حوزه فنی خارج از معماری دانش |
| دارایی‌های بصری (لوگو, رنگ, فونت) | حوزه اجرایی BRD-001          |
| مثال‌های برند واقعی               | خارج از مرز معماری دانش      |
| محصولات و Vendorها                | خنثی‌بودن فناوری             |

---

## 3. Brand Principles

| ID     | اصل                         | توضیح                                                                     |
| ------ | --------------------------- | ------------------------------------------------------------------------- |
| BRP-01 | **برند دارایی سازمانی**     | برند یک دارایی ساختاریافته و حفاظت‌شده سازمانی است — نه یک هویت بصری ساده |
| BRP-02 | **هویت یکپارچه**            | هویت برند در تمام لایه‌ها، پلتفرم‌ها و خروجی‌ها یکپارچه و سازگار است      |
| BRP-03 | **ساختار دانش‌بنیان**       | برند به عنوان یک سیستم دانش تعریف می‌شود — نه مجموعه‌ای از عناصر بصری     |
| BRP-04 | **مصرف توسط Agent**         | دانش برند باید توسط Agentهای هوشمند بدون ابهام قابل مصرف باشد             |
| BRP-05 | **سازگاری عمودی**           | همه لایه‌های برند با معماری مادر دانش (KNW-000) سازگارند                  |
| BRP-06 | **تکامل کنترل‌شده**         | تغییر در برند تابع یک فرآیند حکمرانی مشخص است                             |
| BRP-07 | **حاکمیت بر تمام خروجی‌ها** | قواعد برند بر تمام خروجی‌های انسانی و عاملی الزامی است                    |
| BRP-08 | **تفکیک هویت از بیان**      | هویت برند (چیستی) از بیان برند (چگونگی) جدا تعریف می‌شود                  |

---

## 4. Brand Philosophy

### فلسفه دانش برند

SMOS دانش برند را به عنوان **زبان مشترک هویت سازمانی** می‌بیند که:

1. **توصیف‌گر است** — هویت برند را توصیف می‌کند نه محتوای بازاریابی
2. **ساختاری است** — دارای لایه‌ها، اجزاء و روابط قابل مدل‌سازی است
3. **ثابت است** — در طول زمان تغییر نمی‌کند مگر با فرآیند حکمرانی
4. **مرجع است** — همه اسناد SMOS به آن ارجاع می‌دهند
5. **قابل مصرف است** — توسط انسان و Agent بدون ابهام قابل درک است
6. **تک منبع است** — هر مفهوم برند یک خانه دقیق دارد

### هستی‌شناسی برند

برند در SMOS دارای سه لایه هستی‌شناختی است:

| لایه               | توضیح                       | مثال                           |
| ------------------ | --------------------------- | ------------------------------ |
| هسته (Essence)     | چیستی برند — غیرقابل تغییر  | Purpose, DNA, Values           |
| ساختار (Structure) | معماری برند — قابل تکامل    | Identity, Governance, Taxonomy |
| بیان (Expression)  | نحوه ظهور برند — قابل تطبیق | Voice, Tone, Language Rules    |

---

## 5. Brand Identity Model

### معماری هویت برند

هویت برند در SMOS از چهار لایه تشکیل شده است:

| لایه           | شناسه  | توضیح                                       | دامنه  |
| -------------- | ------ | ------------------------------------------- | ------ |
| Essence        | IDY-01 | جوهره برند — Purpose, DNA, Core Values      | BRD-01 |
| Identity       | IDY-02 | هویت ساختاری — Mission, Vision, Personality | BRD-01 |
| Expression     | IDY-03 | بیان برند — Voice, Tone, Language           | BRD-02 |
| Representation | IDY-04 | بازنمایی — Rules for Human & AI             | BRD-02 |

### اصول معماری هویت

1. Essence تنها لایه غیرقابل تغییر است — تغییر آن نیازمند ADR سطح A-4 است
2. Identity در بازه‌های راهبردی قابل بازبینی است
3. Expression بر اساس پلتفرم و مخاطب قابل تطبیق است
4. Representation تابع قواعد یکپارچه برند است
5. لایه‌های پایین‌دستی (Expression, Representation) باید با لایه‌های بالادستی (Essence, Identity) سازگار باشند

---

## 6. Brand Knowledge Domains

| شناسه  | دامنه                    | توضیح                                           |
| ------ | ------------------------ | ----------------------------------------------- |
| BRD-01 | Identity Architecture    | معماری هویت برند — Essence, Identity, DNA       |
| BRD-02 | Semantic Structure       | ساختار معنایی برند — Voice, Tone, Language      |
| BRD-03 | Knowledge Representation | بازنمایی دانش برند — مدل‌ها و ساختارها          |
| BRD-04 | Governance               | حکمرانی برند — قواعد، سیاست‌ها، اختیارات        |
| BRD-05 | Consistency              | سازگاری برند — قواعد یکپارچگی                   |
| BRD-06 | Evolution                | تکامل برند — تغییر کنترل‌شده                    |
| BRD-07 | Validation               | اعتبارسنجی برند — انطباق و تأیید                |
| BRD-08 | Integration              | یکپارچگی برند — ارتباط با سایر خانواده‌های دانش |

---

## 7. Brand Concepts

| شناسه   | مفهوم                | توضیح                                         | دامنه  |
| ------- | -------------------- | --------------------------------------------- | ------ |
| BRC-001 | Brand Purpose        | هدف وجودی برند — دلیل هستی برند               | BRD-01 |
| BRC-002 | Brand DNA            | دی‌ان‌ای برند — عناصر ژنتیکی هویت             | BRD-01 |
| BRC-003 | Brand Mission        | مأموریت برند — رسالت عملی                     | BRD-01 |
| BRC-004 | Brand Vision         | چشم‌انداز برند — تصویر آینده                  | BRD-01 |
| BRC-005 | Brand Values         | ارزش‌های برند — اصول اخلاقی و رفتاری          | BRD-01 |
| BRC-006 | Brand Personality    | شخصیت برند — ویژگی‌های انسانی برند            | BRD-01 |
| BRC-007 | Brand Voice          | صدای برند — لحن و سبک ارتباطی                 | BRD-02 |
| BRC-008 | Brand Tone           | تُن برند — تنظیمات لحن بر اساس بافت           | BRD-02 |
| BRC-009 | Brand Language       | زبان برند — واژگان، عبارات و نحو              | BRD-02 |
| BRC-010 | Brand Identity       | هویت برند — کلیت ساختار هویتی                 | BRD-01 |
| BRC-011 | Brand Expression     | بیان برند — نحوه ظهور برند                    | BRD-02 |
| BRC-012 | Brand Representation | بازنمایی برند — قواعد ظهور برای انسان و Agent | BRD-03 |
| BRC-013 | Brand Governance     | حکمرانی برند — نظام مدیریت تغییر برند         | BRD-04 |
| BRC-014 | Brand Consistency    | سازگاری برند — یکپارچگی در تمام خروجی‌ها      | BRD-05 |
| BRC-015 | Brand Validation     | اعتبارسنجی برند — تأیید انطباق با هویت        | BRD-07 |
| BRC-016 | Brand Evolution      | تکامل برند — تغییر کنترل‌شده در طول زمان      | BRD-06 |
| BRC-017 | Brand Taxonomy       | طبقه‌بندی برند — نظام دسته‌بندی دانش برند     | BRD-03 |
| BRC-018 | Brand Registry       | نمایه برند — ثبت مرکزی مؤلفه‌های برند         | BRD-03 |
| BRC-019 | Brand Quality        | کیفیت برند — معیارهای کیفی برند               | BRD-07 |
| BRC-020 | Brand Integration    | یکپارچگی برند — ارتباط با سایر سیستم‌ها       | BRD-08 |

---

## 8. Brand Entities

| شناسه   | موجودیت              | نوع      | توضیح                                 | دامنه  |
| ------- | -------------------- | -------- | ------------------------------------- | ------ |
| BRE-001 | Brand                | Core     | برند به عنوان یک موجودیت سازمانی      | BRD-01 |
| BRE-002 | Brand Purpose        | Core     | هدف وجودی برند                        | BRD-01 |
| BRE-003 | Brand Value          | Core     | ارزش بنیادین برند                     | BRD-01 |
| BRE-004 | Brand Attribute      | Core     | ویژگی ساختاری برند                    | BRD-01 |
| BRE-005 | Brand Rule           | Core     | قاعده برند — دستورالعمل هویتی         | BRD-04 |
| BRE-006 | Brand Policy         | Core     | سیاست برند — خط‌مشی هویتی             | BRD-04 |
| BRE-007 | Brand Constraint     | Core     | محدودیت برند — مرزهای هویتی           | BRD-04 |
| BRE-008 | Brand Expression     | Core     | بیان برند — نحوه ظهور                 | BRD-02 |
| BRE-009 | Brand Representation | Core     | بازنمایی برند — قواعد مصرف            | BRD-03 |
| BRE-010 | Brand Metric         | Core     | معیار برند — شاخص اندازه‌گیری         | BRD-07 |
| BRE-011 | Brand Stage          | Temporal | مرحله برند — وضعیت در چرخه حیات       | BRD-06 |
| BRE-012 | Brand Asset          | Core     | دارایی برند — مؤلفه قابل استفاده برند | BRD-03 |

---

## 9. Brand Attributes

| شناسه  | ویژگی           | توضیح                                      | موجودیت مرتبط |
| ------ | --------------- | ------------------------------------------ | ------------- |
| BRA-01 | Uniqueness      | یگانگی — تمایز از سایر برندها              | BRE-001       |
| BRA-02 | Authenticity    | اصالت — صداقت و شفافیت                     | BRE-001       |
| BRA-03 | Consistency     | سازگاری — یکپارچگی در تمام خروجی‌ها        | BRE-001       |
| BRA-04 | Adaptability    | تطبیق‌پذیری — قابلیت تنظیم بدون تغییر هویت | BRE-001       |
| BRA-05 | Recognizability | تشخیص‌پذیری — قابلیت تشخیص بدون ابهام      | BRE-001       |
| BRA-06 | Durability      | ماندگاری — پایداری در طول زمان             | BRE-001       |
| BRA-07 | Coherence       | انسجام — هماهنگی بین اجزاء                 | BRE-001       |
| BRA-08 | Defensibility   | دفاع‌پذیری — مقاومت در برابر سوءاستفاده    | BRE-001       |

---

## 10. Brand Capabilities

| شناسه     | قابلیت                         | توضیح                       | لایه       |
| --------- | ------------------------------ | --------------------------- | ---------- |
| BRCAP-001 | Brand Identity Definition      | تعریف و نگهداری هویت برند   | Essence    |
| BRCAP-002 | Brand DNA Modeling             | مدل‌سازی دی‌ان‌ای برند      | Essence    |
| BRCAP-003 | Brand Values Management        | مدیریت ارزش‌های برند        | Essence    |
| BRCAP-004 | Brand Voice Definition         | تعریف صدای برند             | Structure  |
| BRCAP-005 | Brand Tone Calibration         | تنظیم تُن برند بر اساس بافت | Expression |
| BRCAP-006 | Brand Language Structuring     | ساختاردهی زبان برند         | Structure  |
| BRCAP-007 | Brand Governance Execution     | اجرای حکمرانی برند          | Structure  |
| BRCAP-008 | Brand Consistency Verification | تأیید سازگاری برند          | Expression |
| BRCAP-009 | Brand Validation Execution     | اجرای اعتبارسنجی برند       | Structure  |
| BRCAP-010 | Brand Evolution Management     | مدیریت تکامل برند           | Essence    |
| BRCAP-011 | Brand Rule Enforcement         | اعمال قواعد برند            | Expression |
| BRCAP-012 | Brand Quality Assessment       | ارزیابی کیفیت برند          | Structure  |
| BRCAP-013 | Brand Taxonomy Management      | مدیریت طبقه‌بندی برند       | Structure  |
| BRCAP-014 | Brand Integration Coordination | هماهنگی یکپارچگی برند       | Expression |

---

## 11. Brand Functions

| شناسه  | کارکرد                       | توضیح                               | قابلیت مرتبط |
| ------ | ---------------------------- | ----------------------------------- | ------------ |
| BRF-01 | Define Brand Identity        | تعریف و مستندسازی هویت برند         | BRCAP-001    |
| BRF-02 | Model Brand DNA              | مدل‌سازی عناصر ژنتیکی برند          | BRCAP-002    |
| BRF-03 | Maintain Brand Values        | نگهداری و به‌روزرسانی ارزش‌ها       | BRCAP-003    |
| BRF-04 | Define Brand Voice           | تعریف صدای برند در تمام کانال‌ها    | BRCAP-004    |
| BRF-05 | Calibrate Brand Tone         | تنظیم تُن بر اساس پلتفرم و مخاطب    | BRCAP-005    |
| BRF-06 | Structure Brand Language     | ساختاردهی واژگان و عبارات برند      | BRCAP-006    |
| BRF-07 | Enforce Brand Governance     | اجرای قواعد و سیاست‌های برند        | BRCAP-007    |
| BRF-08 | Verify Brand Consistency     | بررسی سازگاری خروجی‌ها با هویت      | BRCAP-008    |
| BRF-09 | Validate Brand Conformance   | اعتبارسنجی انطباق با استانداردها    | BRCAP-009    |
| BRF-10 | Manage Brand Evolution       | مدیریت تغییرات کنترل‌شده برند       | BRCAP-010    |
| BRF-11 | Apply Brand Rules            | اعمال قواعد برند روی خروجی‌ها       | BRCAP-011    |
| BRF-12 | Assess Brand Quality         | ارزیابی کیفیت و اثربخشی برند        | BRCAP-012    |
| BRF-13 | Maintain Brand Taxonomy      | نگهداری طبقه‌بندی دانش برند         | BRCAP-013    |
| BRF-14 | Coordinate Brand Integration | هماهنگی یکپارچگی با سایر خانواده‌ها | BRCAP-014    |

---

## 12. Brand Taxonomy

### طبقه‌بندی دانش برند

دانش برند SMOS در سه سطح طبقه‌بندی می‌شود:

| سطح        | شناسه                  | توضیح                                          | دامنه‌ها |
| ---------- | ---------------------- | ---------------------------------------------- | -------- |
| Core       | BRD-01, BRD-02         | هویت و ساختار معنایی — هسته غیرقابل تغییر برند |
| Governance | BRD-04, BRD-05, BRD-07 | حکمرانی، سازگاری و اعتبارسنجی                  |
| Evolution  | BRD-06, BRD-08         | تکامل و یکپارچگی                               |

### اصول طبقه‌بندی

1. هر مفهوم برند دقیقاً در یک دامنه طبقه‌بندی می‌شود
2. دامنه‌های Core بالاترین اولویت را در ارجاع دارند
3. دامنه‌های Governance قواعد دامنه‌های Core را اجرا می‌کنند
4. دامنه‌های Evolution تغییرات را مدیریت می‌کنند

---

## 13. Brand State Model

| شناسه  | وضعیت      | توضیح                                  | مجوز انتقال      |
| ------ | ---------- | -------------------------------------- | ---------------- |
| BRS-01 | Draft      | پیش‌نویس — مؤلفه برند در حال تعریف     | → BRS-02         |
| BRS-02 | Defined    | تعریف‌شده — ساختار اولیه تکمیل شده     | → BRS-03         |
| BRS-03 | Structured | ساختاریافته — در طبقه‌بندی ثبت شده     | → BRS-04         |
| BRS-04 | Validated  | تأییدشده — انطباق با هویت بررسی شده    | → BRS-05         |
| BRS-05 | Approved   | تصویب‌شده — تأیید نهایی توسط مالک برند | → BRS-06         |
| BRS-06 | Active     | فعال — در حال استفاده در سیستم         | → BRS-07, BRS-08 |
| BRS-07 | Evolving   | در حال تکامل — تحت بازبینی             | → BRS-04, BRS-06 |
| BRS-08 | Deprecated | منسوخ — جایگزین شده یا حذف             | → BRS-01         |

### انتقال‌های مجاز

| از     | به     | شرط                    |
| ------ | ------ | ---------------------- |
| BRS-01 | BRS-02 | تکمیل تعریف مؤلفه      |
| BRS-02 | BRS-03 | ثبت در طبقه‌بندی       |
| BRS-03 | BRS-04 | انجام اعتبارسنجی       |
| BRS-04 | BRS-05 | تأیید توسط مالک        |
| BRS-05 | BRS-06 | انتشار در سیستم        |
| BRS-06 | BRS-07 | شروع فرآیند تکامل      |
| BRS-06 | BRS-08 | تصمیم به منسوخ‌سازی    |
| BRS-07 | BRS-04 | بازگشت برای اعتبارسنجی |
| BRS-07 | BRS-06 | تأیید تغییرات          |
| BRS-08 | BRS-01 | بازتعریف               |

---

## 14. Brand Lifecycle Model

| شناسه   | مرحله          | توضیح               | معیار خروج                |
| ------- | -------------- | ------------------- | ------------------------- |
| BRST-01 | Conception     | شکل‌گیری مفهوم برند | مستندسازی Purpose و DNA   |
| BRST-02 | Definition     | تعریف ساختاری       | تکمیل هویت و ارزش‌ها      |
| BRST-03 | Formalization  | صوری‌سازی           | ثبت در نمایه برند         |
| BRST-04 | Validation     | اعتبارسنجی          | تأیید انطباق با اصول      |
| BRST-05 | Activation     | فعال‌سازی           | انتشار در سیستم           |
| BRST-06 | Operation      | عملیات              | استفاده مداوم در خروجی‌ها |
| BRST-07 | Review         | بازبینی             | ارزیابی دوره‌ای           |
| BRST-08 | Transformation | دگرگونی             | تغییر یا بازنشستگی        |

---

## 15. Brand Governance Model

### مدل حکمرانی برند

حکمرانی برند SMOS بر اساس سطوح اختیار (A-0 تا A-4) تعریف می‌شود:

| سطح | عنوان        | اختیارات                           | مثال               |
| --- | ------------ | ---------------------------------- | ------------------ |
| A-0 | بدون دسترسی  | فقط خواندن دانش برند               | Agentهای سطح پایین |
| A-1 | مصرف‌کننده   | استفاده از مفاهیم برند در خروجی‌ها | AI-003, AI-004     |
| A-2 | متقاضی تغییر | پیشنهاد تغییر در مؤلفه‌های برند    | AI-001, AI-005     |
| A-3 | متولی برند   | ویرایش مؤلفه‌های غیر Essence       | معمار برند         |
| A-4 | مالک برند    | تغییر در Essence و DNA             | مدیر برند          |

### انواع تصمیمات حکمرانی

| نوع       | توضیح                           | سطح اختیار |
| --------- | ------------------------------- | ---------- |
| تعریف     | ایجاد مؤلفه برند جدید           | A-3        |
| ویرایش    | تغییر مؤلفه موجود (غیر Essence) | A-3        |
| تأیید     | تصویب نهایی مؤلفه               | A-4        |
| انسجام    | تأیید سازگاری                   | A-3        |
| استثنا    | مجوز انحراف موقت                | A-4        |
| بازنشستگی | حذف یا منسوخ‌سازی               | A-4        |

---

## 16. Brand Consistency Model

### مدل سازگاری برند

سازگاری برند در SMOS در چهار بعد تعریف می‌شود:

| بعد                    | توضیح                                                      | معیار                                |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------ |
| Vertical Consistency   | سازگاری عمودی — هماهنگی لایه‌های Essence تا Representation | همه لایه‌ها با Essence سازگارند      |
| Horizontal Consistency | سازگاری افقی — یکپارچگی در تمام پلتفرم‌ها                  | یک برند در همه جا یکسان              |
| Temporal Consistency   | سازگاری زمانی — ثبات در طول زمان                           | تغییرات تابع حکمرانی                 |
| Behavioral Consistency | سازگاری رفتاری — یکپارچگی در تعاملات                       | Agentها و انسان‌ها قواعد یکسان دارند |

### قواعد سازگاری

| ID     | قاعده                 | توضیح                                        |
| ------ | --------------------- | -------------------------------------------- |
| BCR-01 | هویت مقدم بر بیان     | هیچ بیانی نباید با هویت برند تضاد داشته باشد |
| BCR-02 | ثبات در تمام کانال‌ها | برند در همه پلتفرم‌ها یکسان ظاهر می‌شود      |
| BCR-03 | تغییر تابع فرآیند     | هیچ تغییری بدون طی کردن حکمرانی مجاز نیست    |
| BCR-04 | انحراف موقت مستند     | هر انحراف باید مستند و دارای انقضا باشد      |

---

## 17. Brand Validation Model

### مدل اعتبارسنجی برند

اعتبارسنجی برند در چهار سطح انجام می‌شود:

| سطح | نوع اعتبارسنجی        | توضیح                         | مجری       |
| --- | --------------------- | ----------------------------- | ---------- |
| L1  | Structural Validation | بررسی ساختار و انطباق با قالب | AI-004     |
| L2  | Semantic Validation   | بررسی سازگاری معنایی با هویت  | AI-004     |
| L3  | Governance Validation | بررسی انطباق با قواعد حکمرانی | AI-004     |
| L4  | Integrity Validation  | بررسی یکپارچگی با Essence     | معمار برند |

### قواعد اعتبارسنجی

| ID     | قاعده                                              | توضیح |
| ------ | -------------------------------------------------- | ----- |
| BVR-01 | هر خروجی برند باید قبل از انتشار اعتبارسنجی شود    |
| BVR-02 | اعتبارسنجی L1 و L2 الزامی — L3 و L4 در موارد تغییر |
| BVR-03 | نتیجه اعتبارسنجی باید قابل ردیابی و مستند باشد     |
| BVR-04 | عدم انطباق باید به سطح اختیار مناسب ارجاع شود      |

---

## 18. Brand Metrics Model

| شناسه  | معیار                 | توضیح                                                     | دامنه  | واحد     |
| ------ | --------------------- | --------------------------------------------------------- | ------ | -------- |
| BRM-01 | Identity Completeness | تکمیل هویت — درصد تعریف شده                               | BRD-01 | درصد     |
| BRM-02 | Consistency Score     | امتیاز سازگاری — میزان یکپارچگی                           | BRD-05 | ۰-۱۰۰    |
| BRM-03 | Governance Compliance | انطباق حکمرانی — درصد رعایت قواعد                         | BRD-04 | درصد     |
| BRM-04 | Validation Coverage   | پوشش اعتبارسنجی — درصد خروجی‌های تأییدشده                 | BRD-07 | درصد     |
| BRM-05 | Evolution Frequency   | دفعات تکامل — تعداد تغییرات در بازه                       | BRD-06 | عدد/دوره |
| BRM-06 | Rule Adherence        | تبعیت از قواعد — درصد خروجی‌های منطبق                     | BRD-04 | درصد     |
| BRM-07 | Concept Coverage      | پوشش مفاهیم — درصد مفاهیم تعریف‌شده                       | BRD-03 | درصد     |
| BRM-08 | Entity Utilization    | بهره‌برداری موجودیت‌ها — درصد استفاده                     | BRD-03 | درصد     |
| BRM-09 | Quality Index         | شاخص کیفیت برند — میانگین معیارهای کیفی                   | BRD-07 | ۰-۱۰۰    |
| BRM-10 | Integration Health    | سلامت یکپارچگی — درصد سازگاری با سایر خانواده‌ها          | BRD-08 | درصد     |
| BRM-11 | Taxonomy Coverage     | پوشش طبقه‌بندی — درصد دامنه‌های پوشش‌داده‌شده             | BRD-03 | درصد     |
| BRM-12 | Lifecycle Velocity    | سرعت چرخه حیات — میانگین زمان از Conception تا Activation | BRD-06 | روز      |
| BRM-13 | Escalation Rate       | نرخ ارجاع — درصد موارد ارجاع به سطوح بالاتر               | BRD-04 | درصد     |
| BRM-14 | Asset Completeness    | تکمیل دارایی — درصد دارایی‌های تعریف‌شده                  | BRD-03 | درصد     |
| BRM-15 | Evolution Stability   | پایداری تکامل — درصد تغییرات غیربرگشتی                    | BRD-06 | درصد     |

---

## 19. Brand Registry Model

### مدل ثبت برند

همه مؤلفه‌های برند باید در نمایه مرکزی ثبت شوند:

| فیلد              | توضیح                                    | الزامی  |
| ----------------- | ---------------------------------------- | ------- |
| شناسه             | شناسه یکتای مؤلفه برند                   | ✅      |
| نام               | نام مؤلفه برند                           | ✅      |
| نوع               | نوع مؤلفه (Concept, Entity, Rule, Asset) | ✅      |
| دامنه             | دامنه دانش برند                          | ✅      |
| وضعیت             | وضعیت در State Model                     | ✅      |
| مالک              | مسئول مؤلفه                              | ✅      |
| تاریخ ایجاد       | تاریخ ثبت اولیه                          | ✅      |
| تاریخ به‌روزرسانی | آخرین ویرایش                             | ✅      |
| وابستگی           | وابستگی به سایر مؤلفه‌ها                 | اختیاری |

---

## 20. Brand Constraint Model

| شناسه    | محدودیت                            | توضیح                                              | دامنه  |
| -------- | ---------------------------------- | -------------------------------------------------- | ------ |
| BRCST-01 | Essence غیرقابل تغییر بدون ADR A-4 | تغییر در Purpose و DNA نیازمند بالاترین سطح اختیار | BRD-01 |
| BRCST-02 | Expression تابع Identity           | هیچ بیانی نمی‌تواند از هویت برند خارج شود          | BRD-02 |
| BRCST-03 | Consistency الزامی                 | همه خروجی‌ها باید با هویت برند سازگار باشند        | BRD-05 |
| BRCST-04 | Governance بر همه الزامی           | قواعد حکمرانی برای انسان و Agent یکسان است         | BRD-04 |
| BRCST-05 | Validation قبل از انتشار           | هیچ خروجی برند بدون اعتبارسنجی منتشر نمی‌شود       | BRD-07 |
| BRCST-06 | Evolution تابع فرآیند              | هر تغییر در برند باید از چرخه حیات عبور کند        | BRD-06 |
| BRCST-07 | No Circular Dependencies           | وابستگی‌های برند باید DAG باقی بماند               | BRD-08 |
| BRCST-08 | Registry Entry الزامی              | هر مؤلفه برند باید در نمایه ثبت شود                | BRD-03 |

---

## 21. Brand Quality Gates

| ID        | گیت                        | معیار                                          | دامنه  |
| --------- | -------------------------- | ---------------------------------------------- | ------ |
| QG-BRD-01 | Identity Completeness      | همه مؤلفه‌های Essence و Identity تعریف شده‌اند | BRD-01 |
| QG-BRD-02 | Structure Validity         | ساختار برند با مدل معماری مطابقت دارد          | BRD-01 |
| QG-BRD-03 | Consistency Conformance    | هیچ تضادی بین لایه‌های برند وجود ندارد         | BRD-05 |
| QG-BRD-04 | Governance Compliance      | همه قواعد حکمرانی رعایت شده‌اند                | BRD-04 |
| QG-BRD-05 | Validation Completeness    | همه خروجی‌های برند اعتبارسنجی شده‌اند          | BRD-07 |
| QG-BRD-06 | Registry Completeness      | همه مؤلفه‌ها در نمایه ثبت شده‌اند              | BRD-03 |
| QG-BRD-07 | Cross-family Compatibility | برند با سایر خانواده‌های دانش سازگار است       | BRD-08 |

---

## 22. Brand Evolution Model

### مدل تکامل برند

تکامل برند در SMOS تابع یک فرآیند ۵ مرحله‌ای است:

| مرحله             | توضیح                  | مجری |
| ----------------- | ---------------------- | ---- |
| 1. Proposal       | ارائه پیشنهاد تغییر    | A-2+ |
| 2. Assessment     | ارزیابی تأثیر تغییر    | A-3  |
| 3. Approval       | تصویب تغییر            | A-4  |
| 4. Implementation | اجرای تغییر            | A-3  |
| 5. Validation     | اعتبارسنجی پس از تغییر | A-3  |

### انواع تغییر

| نوع     | توضیح                                 | سطح تأثیر           |
| ------- | ------------------------------------- | ------------------- |
| Patch   | اصلاح جزئی — بدون تغییر معنا          | BRD-02+             |
| Minor   | تغییر در Expression یا Representation | BRD-02, BRD-03      |
| Major   | تغییر در Identity یا Governance       | BRD-01, BRD-04      |
| Essence | تغییر در Purpose یا DNA               | BRD-01 (فوق‌العاده) |

---

## 23. Brand Relationship Model

| شناسه  | رابطه      | مبدأ              | مقصد                 | نوع          | توضیح                                      |
| ------ | ---------- | ----------------- | -------------------- | ------------ | ------------------------------------------ |
| BRR-01 | defines    | Brand Purpose     | Brand Identity       | Definition   | Purpose هویت را تعریف می‌کند               |
| BRR-02 | governs    | Brand Governance  | Brand Expression     | Governance   | Governance بیان را هدایت می‌کند            |
| BRR-03 | validates  | Brand Validation  | Brand Representation | Validation   | Validation بازنمایی را تأیید می‌کند        |
| BRR-04 | evolves    | Brand Evolution   | Brand Structure      | Evolution    | Evolution ساختار را تکامل می‌دهد           |
| BRR-05 | expresses  | Brand Identity    | Brand Voice          | Expression   | Identity از طریق Voice بیان می‌شود         |
| BRR-06 | constrains | Brand Constraint  | Brand Expression     | Constraint   | Constraint بیان را محدود می‌کند            |
| BRR-07 | measures   | Brand Metric      | Brand Quality        | Measurement  | Metric کیفیت را اندازه می‌گیرد             |
| BRR-08 | integrates | Brand Integration | External Systems     | Integration  | Integration با سیستم‌های خارجی ارتباط دارد |
| BRR-09 | registers  | Brand Registry    | Brand Asset          | Registration | Registry دارایی‌ها را ثبت می‌کند           |
| BRR-10 | ensures    | Brand Consistency | Brand Quality        | Consistency  | Consistency کیفیت را تضمین می‌کند          |

---

## 24. Brand Hierarchy Model

### سلسله‌مراتب برند

برند SMOS دارای سلسله‌مراتب زیر است:

```
Brand (BRE-001)
    │
    ├── Brand Purpose (BRE-002)
    ├── Brand Values (BRE-003)
    ├── Brand Attributes (BRE-004)
    │
    ├── Brand Rules (BRE-005)
    ├── Brand Policies (BRE-006)
    ├── Brand Constraints (BRE-007)
    │
    ├── Brand Expression (BRE-008)
    │       │
    │       ├── Brand Voice
    │       ├── Brand Tone
    │       └── Brand Language
    │
    ├── Brand Representation (BRE-009)
    ├── Brand Metrics (BRE-010)
    ├── Brand Stages (BRE-011)
    └── Brand Assets (BRE-012)
```

### اصول سلسله‌مراتب

1. هر موجودیت دقیقاً یک والد دارد (به جز ریشه)
2. موجودیت‌های Core (Purpose, Values, Attributes) والد همه هستند
3. موجودیت‌های Governance (Rules, Policies, Constraints) در لایه میانی
4. موجودیت‌های Operational (Expression, Representation, Assets) در لایه پایینی

---

## 25. Naming Rules

| الگو                    | شناسه           | مثال      |
| ----------------------- | --------------- | --------- |
| Brand Concepts          | BRC-[0-9]{3}    | BRC-001   |
| Brand Entities          | BRE-[0-9]{3}    | BRE-001   |
| Brand Attributes        | BRA-[0-9]{2}    | BRA-01    |
| Brand Capabilities      | BRCAP-[0-9]{3}  | BRCAP-001 |
| Brand Functions         | BRF-[0-9]{2}    | BRF-01    |
| Brand Domains           | BRD-[0-9]{2}    | BRD-01    |
| Brand States            | BRS-[0-9]{2}    | BRS-01    |
| Brand Stages            | BRST-[0-9]{2}   | BRST-01   |
| Brand Relationships     | BRR-[0-9]{2}    | BRR-01    |
| Brand Metrics           | BRM-[0-9]{2}    | BRM-01    |
| Brand Principles        | BRP-[0-9]{2}    | BRP-01    |
| Brand Constraints       | BRCST-[0-9]{2}  | BRCST-01  |
| Brand Quality Gates     | QG-BRD-[0-9]{2} | QG-BRD-01 |
| Brand Consistency Rules | BCR-[0-9]{2}    | BCR-01    |
| Brand Validation Rules  | BVR-[0-9]{2}    | BVR-01    |

---

## 26. Cross References

### ارجاع به سایر خانواده‌های دانش

| خانواده                | سند          | ارجاع به KNW-BRD                       |
| ---------------------- | ------------ | -------------------------------------- |
| Knowledge Architecture | KNW-000      | معماری مادر                            |
| Knowledge Index        | KNW-001      | نمایه مرکزی                            |
| AI Meta Architecture   | KNW-510      | متا معماری دانش                        |
| Business Knowledge     | KNW-101..104 | مفاهیم کسب‌وکار — برند به عنوان ENT-02 |
| Platform Knowledge     | KNW-301..308 | پلتفرم‌ها — بستر ظهور برند             |
| Operations Knowledge   | KNW-401..405 | عملیات — اجرای قواعد برند              |
| AI Knowledge           | KNW-501..510 | هوش مصنوعی — مصرف‌کننده دانش برند      |

### ارجاع به اسناد خارج از KNW

| سند         | نوع ارجاع                               |
| ----------- | --------------------------------------- |
| BRD-001     | معماری سیستم برند — مصرف‌کننده KNW-701  |
| BRD-002     | معماری صدای برند — مصرف‌کننده KNW-701   |
| PLAT-007    | وبسایت و وبلاگ — مصرف‌کننده ساختار برند |
| CON-000 §۱۶ | قانون اساسی — یکپارچگی برند             |

---

## 27. Machine Readable JSON Blocks

### Block 1 — Brand Identity

```json
{
  "id": "KNW-701",
  "name_fa": "پایه دانش برند سازمانی",
  "name_en": "Enterprise Brand Knowledge Foundation",
  "version": "1.0.0-draft",
  "family": "KNW-BRD",
  "domain": "BRD-01",
  "type": "Conceptual",
  "status": "draft",
  "ssot": true,
  "total_concepts": 20,
  "total_entities": 12,
  "total_capabilities": 14,
  "total_functions": 14,
  "total_domains": 8,
  "total_states": 8,
  "total_relationships": 10,
  "total_metrics": 15,
  "total_principles": 8,
  "total_constraints": 8,
  "total_quality_gates": 7,
  "dependencies": ["KNW-000", "KNW-001", "KNW-510"]
}
```

### Block 2 — Brand Entities

```json
{
  "entities": [
    { "id": "BRE-001", "name": "Brand", "type": "Core", "owner": "Brand Manager" },
    { "id": "BRE-002", "name": "Brand Purpose", "type": "Core", "owner": "Brand Manager" },
    { "id": "BRE-003", "name": "Brand Value", "type": "Core", "owner": "Brand Manager" },
    { "id": "BRE-004", "name": "Brand Attribute", "type": "Core", "owner": "Brand Architect" },
    { "id": "BRE-005", "name": "Brand Rule", "type": "Core", "owner": "Brand Architect" },
    { "id": "BRE-006", "name": "Brand Policy", "type": "Core", "owner": "Brand Manager" },
    { "id": "BRE-007", "name": "Brand Constraint", "type": "Core", "owner": "Brand Architect" },
    { "id": "BRE-008", "name": "Brand Expression", "type": "Core", "owner": "Brand Architect" },
    { "id": "BRE-009", "name": "Brand Representation", "type": "Core", "owner": "Brand Architect" },
    { "id": "BRE-010", "name": "Brand Metric", "type": "Core", "owner": "Brand Architect" },
    { "id": "BRE-011", "name": "Brand Stage", "type": "Temporal", "owner": "Brand Manager" },
    { "id": "BRE-012", "name": "Brand Asset", "type": "Core", "owner": "Media Producer" }
  ]
}
```

### Block 3 — Brand Capabilities

```json
{
  "capabilities": [
    {
      "id": "BRCAP-001",
      "name": "Brand Identity Definition",
      "layer": "Essence",
      "owner": "Brand Manager"
    },
    {
      "id": "BRCAP-002",
      "name": "Brand DNA Modeling",
      "layer": "Essence",
      "owner": "Brand Manager"
    },
    {
      "id": "BRCAP-003",
      "name": "Brand Values Management",
      "layer": "Essence",
      "owner": "Brand Manager"
    },
    {
      "id": "BRCAP-004",
      "name": "Brand Voice Definition",
      "layer": "Structure",
      "owner": "Brand Architect"
    },
    {
      "id": "BRCAP-005",
      "name": "Brand Tone Calibration",
      "layer": "Expression",
      "owner": "Brand Architect"
    },
    {
      "id": "BRCAP-006",
      "name": "Brand Language Structuring",
      "layer": "Structure",
      "owner": "Brand Architect"
    },
    {
      "id": "BRCAP-007",
      "name": "Brand Governance Execution",
      "layer": "Structure",
      "owner": "Brand Manager"
    },
    {
      "id": "BRCAP-008",
      "name": "Brand Consistency Verification",
      "layer": "Expression",
      "owner": "Brand Architect"
    },
    {
      "id": "BRCAP-009",
      "name": "Brand Validation Execution",
      "layer": "Structure",
      "owner": "Brand Architect"
    },
    {
      "id": "BRCAP-010",
      "name": "Brand Evolution Management",
      "layer": "Essence",
      "owner": "Brand Manager"
    },
    {
      "id": "BRCAP-011",
      "name": "Brand Rule Enforcement",
      "layer": "Expression",
      "owner": "Brand Architect"
    },
    {
      "id": "BRCAP-012",
      "name": "Brand Quality Assessment",
      "layer": "Structure",
      "owner": "Brand Architect"
    },
    {
      "id": "BRCAP-013",
      "name": "Brand Taxonomy Management",
      "layer": "Structure",
      "owner": "Brand Architect"
    },
    {
      "id": "BRCAP-014",
      "name": "Brand Integration Coordination",
      "layer": "Expression",
      "owner": "Brand Manager"
    }
  ]
}
```

### Block 4 — Brand States

```json
{
  "states": [
    { "id": "BRS-01", "name": "Draft", "description": "پیش‌نویس — مؤلفه برند در حال تعریف" },
    { "id": "BRS-02", "name": "Defined", "description": "تعریف‌شده — ساختار اولیه تکمیل شده" },
    { "id": "BRS-03", "name": "Structured", "description": "ساختاریافته — در طبقه‌بندی ثبت شده" },
    { "id": "BRS-04", "name": "Validated", "description": "تأییدشده — انطباق با هویت بررسی شده" },
    { "id": "BRS-05", "name": "Approved", "description": "تصویب‌شده — تأیید نهایی توسط مالک برند" },
    { "id": "BRS-06", "name": "Active", "description": "فعال — در حال استفاده در سیستم" },
    { "id": "BRS-07", "name": "Evolving", "description": "در حال تکامل — تحت بازبینی" },
    { "id": "BRS-08", "name": "Deprecated", "description": "منسوخ — جایگزین شده یا حذف" }
  ],
  "valid_transitions": [
    { "from": "BRS-01", "to": "BRS-02" },
    { "from": "BRS-02", "to": "BRS-03" },
    { "from": "BRS-03", "to": "BRS-04" },
    { "from": "BRS-04", "to": "BRS-05" },
    { "from": "BRS-05", "to": "BRS-06" },
    { "from": "BRS-06", "to": "BRS-07" },
    { "from": "BRS-06", "to": "BRS-08" },
    { "from": "BRS-07", "to": "BRS-04" },
    { "from": "BRS-07", "to": "BRS-06" },
    { "from": "BRS-08", "to": "BRS-01" }
  ]
}
```

### Block 5 — Brand Relationships

```json
{
  "relationships": [
    {
      "id": "BRR-01",
      "source": "BRE-002",
      "target": "BRE-001",
      "type": "defines",
      "description": "Brand Purpose defines Brand Identity"
    },
    {
      "id": "BRR-02",
      "source": "BRE-005",
      "target": "BRE-008",
      "type": "governs",
      "description": "Brand Rule governs Brand Expression"
    },
    {
      "id": "BRR-03",
      "source": "BRE-001",
      "target": "BRE-009",
      "type": "validates",
      "description": "Brand Validation validates Brand Representation"
    },
    {
      "id": "BRR-04",
      "source": "BRE-011",
      "target": "BRE-001",
      "type": "evolves",
      "description": "Brand Stage evolves Brand Structure"
    },
    {
      "id": "BRR-05",
      "source": "BRE-001",
      "target": "BRE-008",
      "type": "expresses",
      "description": "Brand Identity expresses through Brand Voice"
    },
    {
      "id": "BRR-06",
      "source": "BRE-007",
      "target": "BRE-008",
      "type": "constrains",
      "description": "Brand Constraint constrains Brand Expression"
    },
    {
      "id": "BRR-07",
      "source": "BRE-010",
      "target": "BRE-001",
      "type": "measures",
      "description": "Brand Metric measures Brand Quality"
    },
    {
      "id": "BRR-08",
      "source": "BRE-001",
      "target": "External",
      "type": "integrates",
      "description": "Brand Integration connects with External Systems"
    },
    {
      "id": "BRR-09",
      "source": "BRE-012",
      "target": "BRE-001",
      "type": "registers",
      "description": "Brand Registry registers Brand Asset"
    },
    {
      "id": "BRR-10",
      "source": "BRE-001",
      "target": "BRE-001",
      "type": "ensures",
      "description": "Brand Consistency ensures Brand Quality"
    }
  ]
}
```

### Block 6 — Brand Metrics

```json
{
  "metrics": [
    {
      "id": "BRM-01",
      "name": "Identity Completeness",
      "domain": "BRD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "BRM-02",
      "name": "Consistency Score",
      "domain": "BRD-05",
      "unit": "score_0_100",
      "target": 95
    },
    {
      "id": "BRM-03",
      "name": "Governance Compliance",
      "domain": "BRD-04",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "BRM-04",
      "name": "Validation Coverage",
      "domain": "BRD-07",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "BRM-05",
      "name": "Evolution Frequency",
      "domain": "BRD-06",
      "unit": "count_per_period",
      "target": 5
    },
    {
      "id": "BRM-06",
      "name": "Rule Adherence",
      "domain": "BRD-04",
      "unit": "percent",
      "target": 98
    },
    {
      "id": "BRM-07",
      "name": "Concept Coverage",
      "domain": "BRD-03",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "BRM-08",
      "name": "Entity Utilization",
      "domain": "BRD-03",
      "unit": "percent",
      "target": 90
    },
    {
      "id": "BRM-09",
      "name": "Quality Index",
      "domain": "BRD-07",
      "unit": "score_0_100",
      "target": 85
    },
    {
      "id": "BRM-10",
      "name": "Integration Health",
      "domain": "BRD-08",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "BRM-11",
      "name": "Taxonomy Coverage",
      "domain": "BRD-03",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "BRM-12",
      "name": "Lifecycle Velocity",
      "domain": "BRD-06",
      "unit": "days",
      "target": 30
    },
    {
      "id": "BRM-13",
      "name": "Escalation Rate",
      "domain": "BRD-04",
      "unit": "percent",
      "target": 5
    },
    {
      "id": "BRM-14",
      "name": "Asset Completeness",
      "domain": "BRD-03",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "BRM-15",
      "name": "Evolution Stability",
      "domain": "BRD-06",
      "unit": "percent",
      "target": 90
    }
  ]
}
```

---

## 28. Draft-07 JSON Schemas

### Schema 1 — Brand Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:brand:entity:v1",
  "title": "Brand Entity",
  "description": "Schema for SMOS Brand Entity definitions",
  "type": "object",
  "required": ["id", "name", "type", "owner"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^BRE-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "type": {
      "type": "string",
      "enum": ["Core", "Temporal", "Abstract"]
    },
    "owner": {
      "type": "string",
      "minLength": 3,
      "maxLength": 50
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "domain": {
      "type": "string",
      "pattern": "^BRD-[0-9]{2}$"
    }
  },
  "additionalProperties": false
}
```

### Schema 2 — Brand Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:brand:capability:v1",
  "title": "Brand Capability",
  "description": "Schema for SMOS Brand Capability definitions",
  "type": "object",
  "required": ["id", "name", "layer"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^BRCAP-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "layer": {
      "type": "string",
      "enum": ["Essence", "Structure", "Expression"]
    },
    "owner": {
      "type": "string",
      "minLength": 3,
      "maxLength": 50
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "additionalProperties": false
}
```

### Schema 3 — Brand State Transition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:brand:state:v1",
  "title": "Brand State Transition",
  "description": "Schema for Brand State transitions in the lifecycle model",
  "type": "object",
  "required": ["from", "to"],
  "properties": {
    "from": {
      "type": "string",
      "pattern": "^BRS-[0-9]{2}$"
    },
    "to": {
      "type": "string",
      "pattern": "^BRS-[0-9]{2}$"
    },
    "condition": {
      "type": "string",
      "maxLength": 200
    }
  },
  "additionalProperties": false
}
```

---

## 29. Statistics

### آمار KNW-701

| شاخص                   | مقدار                              |
| ---------------------- | ---------------------------------- |
| تعداد بخش‌ها           | ۳۰                                 |
| تعداد دامنه‌های برند   | ۸                                  |
| تعداد مفاهیم برند      | ۲۰                                 |
| تعداد موجودیت‌های برند | ۱۲                                 |
| تعداد ویژگی‌های برند   | ۸                                  |
| تعداد قابلیت‌های برند  | ۱۴                                 |
| تعداد کارکردهای برند   | ۱۴                                 |
| تعداد وضعیت‌های برند   | ۸                                  |
| تعداد مراحل چرخه حیات  | ۸                                  |
| تعداد روابط برند       | ۱۰                                 |
| تعداد معیارهای برند    | ۱۵                                 |
| تعداد اصول برند        | ۸                                  |
| تعداد محدودیت‌های برند | ۸                                  |
| تعداد گیت‌های کیفیت    | ۷                                  |
| تعداد لایه‌های معماری  | ۳ (Essence, Structure, Expression) |
| تعداد JSON Blocks      | ۶                                  |
| تعداد JSON Schemas     | ۳                                  |
| تعداد کل خطوط          | ~۸۵۰                               |

---

## 30. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | توسط        |
| ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-07-02 | نگارش اولیه — پایه دانش برند سازمانی. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (BRC-001 تا BRC-020), ۱۲ موجودیت (BRE-001 تا BRE-012), ۱۴ قابلیت (BRCAP-001 تا BRCAP-014), ۱۴ کارکرد (BRF-01 تا BRF-14), ۸ دامنه (BRD-01 تا BRD-08), ۸ وضعیت (BRS-01 تا BRS-08), ۱۰ رابطه (BRR-01 تا BRR-10), ۱۵ معیار (BRM-01 تا BRM-15), ۸ اصل (BRP-01 تا BRP-08), ۸ محدودیت (BRCST-01 تا BRCST-08), ۷ گیت کیفیت (QG-BRD-01 تا QG-BRD-07). نخستین سند خانواده KNW-BRD. SSOT برند سازمانی SMOS. Architecture Neutral, Implementation Free, Vendor Neutral. | معمار سیستم |
