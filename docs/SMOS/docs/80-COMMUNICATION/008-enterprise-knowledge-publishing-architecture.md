# Enterprise Knowledge Publishing Architecture — معماری انتشار دانش سازمانی SMOS

> **شناسه:** COM-005
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-07-03
> **مسئول:** معمار انتشار دانش سازمانی
> **وابستگی:** [KNW-000](../70-KNOWLEDGE/00-enterprise-knowledge-architecture.md), [KNW-001](../70-KNOWLEDGE/10-knowledge-index.md), [KNW-701](../70-KNOWLEDGE/700-brand-knowledge-foundation.md), [KNW-801](../70-KNOWLEDGE/800-reference-knowledge-foundation.md), [KNW-510](../70-KNOWLEDGE/518-ai-meta-architecture.md), [COM-001](./000-enterprise-content-architecture.md), [COM-002](./002-enterprise-brand-voice-architecture.md), [COM-003](./004-enterprise-editorial-architecture.md), [COM-004](./006-enterprise-social-media-architecture.md)
> **مخاطب:** human, ai-agent, knowledge-architect, content-architect, publishing-architect

---

## 1. Purpose

COM-005 پنجمین سند خانواده Communication Architecture (COM) و SSOT (تک منبع حقیقت) برای معماری انتشار دانش سازمانی SMOS است. این سند تعریف می‌کند که دانش متعارف سازمانی چگونه به دانش قابل انتشار تبدیل می‌شود — بدون ورود به گردش کار انتشار، CMS، پیاده‌سازی یا تولید محتوا.

### Why COM-005 Exists

بدون یک معماری انتشار دانش سازمانی:

- انتشار دانش از سیستم دانش به کانال‌های هدف بدون ساختار معماری انجام می‌شود
- تبدیل دانش متعارف به محتوای قابل انتشار فاقد قاعده معماری است
- یکپارچگی بین Knowledge System و Communication System تعریف نشده باقی می‌ماند
- ردیابی دانش از مبدأ تا انتشار غیرممکن می‌شود
- نسخه‌بندی و همگام‌سازی دانش بین سیستم‌ها بدون چارچوب است
- کیفیت انتشار دانش بدون معیار معماری قابل اندازه‌گیری نیست
- تکامل کانال‌های انتشار دانش بدون چارچوب معماری انجام می‌شود

COM-005 این مشکلات را با تعریف **چارچوب یکپارچه معماری انتشار دانش سازمانی** حل می‌کند.

### Role of COM-005 in SMOS

| سند         | نقش                                                                    |
| ----------- | ---------------------------------------------------------------------- |
| KNW-000     | معماری دانش سازمانی — منبع دانش متعارف                                 |
| KNW-001     | نمایه دانش سازمانی — ثبت و نمایه‌سازی دانش                             |
| KNW-701     | پایه دانش برند — هویت برند                                             |
| KNW-801     | پایه دانش مرجع — طبقه‌بندی‌های مرجع                                    |
| COM-001     | معماری محتوای سازمانی — ساختار محتوا                                   |
| COM-002     | معماری صدای برند — نحوه ارتباط                                         |
| COM-003     | معماری تحریریه سازمانی — برنامه‌ریزی و توالی                           |
| COM-004     | معماری شبکه‌های اجتماعی — انتشار در پلتفرم‌ها                          |
| **COM-005** | **SSOT معماری انتشار دانش سازمانی — تبدیل دانش به محتوای قابل انتشار** |
| KNW-201     | کامپایلر دانش — پردازش و تبدیل دانش                                    |
| AI-008      | عامل انتشار و توزیع — مصرف‌کننده معماری انتشار                         |
| AI-011      | عامل مدیریت دانش — تأمین‌کننده دانش برای انتشار                        |

---

## 2. Scope

### Inside Scope

| حوزه                                       | توضیح                                                      |
| ------------------------------------------ | ---------------------------------------------------------- |
| Enterprise Knowledge Publishing Philosophy | هستی‌شناسی و اصول بنیادین انتشار دانش سازمانی              |
| Canonical Knowledge Model                  | مدل دانش متعارف — دانش خالص مستقل از کانال انتشار          |
| Knowledge Publication Model                | مدل انتشار دانش — تبدیل دانش متعارف به محتوای قابل انتشار  |
| Canonical Source Model                     | مدل منبع متعارف — دانش به عنوان منبع حقیقت واحد            |
| Publication Governance Model               | حکمرانی انتشار — قواعد، سطوح اختیار، سیاست‌های انتشار دانش |
| Publication Quality Model                  | کیفیت انتشار — معیارها و گیت‌های کیفیت برای انتشار دانش    |
| Publication Lifecycle Model                | چرخه حیات انتشار — از دانش متعارف تا انتشار و بایگانی      |
| Publication Consistency Model              | سازگاری انتشار — یکپارچگی دانش در همه کانال‌ها             |
| Knowledge Synchronization Model            | همگام‌سازی دانش — تطابق دانش بین سیستم مبدأ و کانال‌ها     |
| Publication Traceability Model             | ردیابی انتشار — از دانش متعارف تا مخاطب نهایی              |
| Publication Versioning Model               | نسخه‌بندی انتشار — مدیریت نسخه‌های دانش منتشرشده           |
| Publication Registry Model                 | ثبت انتشار — نمایه مرکزی انتشارات دانش                     |
| Knowledge Distribution Architecture        | معماری توزیع دانش — کانال‌های توزیع دانش                   |
| Knowledge Publishing Concepts              | ۲۰ مفهوم بنیادین انتشار دانش                               |
| Knowledge Publishing Entities              | ۱۲ موجودیت انتشار دانش                                     |
| Knowledge Publishing Capabilities          | ۱۴ قابلیت انتشار دانش                                      |
| Knowledge Publishing Functions             | ۱۴ کارکرد انتشار دانش                                      |
| Publishing Domains                         | ۸ دامنه انتشار دانش                                        |
| Publishing State Model                     | ۸ وضعیت انتشار دانش                                        |
| Publishing Principles                      | ۸ اصل انتشار دانش                                          |
| Publishing Constraints                     | ۸ محدودیت انتشار دانش                                      |
| Publishing Quality Gates                   | ۷ گیت کیفیت                                                |

### Outside Scope

| حوزه                   | دلیل                                        |
| ---------------------- | ------------------------------------------- |
| گردش کار انتشار        | خارج از معماری — حوزه execution در SMOS-704 |
| CMS معماری             | خنثی‌بودن فناوری — خارج از مرز COM          |
| پیاده‌سازی Publisher   | خنثی‌بودن فناوری                            |
| مستندات آموزشی         | حوزه محتوایی — خارج از معماری               |
| مثال‌های انتشار واقعی  | خارج از مرز معماری                          |
| ابزارهای مدیریت انتشار | خنثی‌بودن فناوری                            |
| Vendorها و محصولات     | خنثی‌بودن فناوری                            |
| استراتژی بازاریابی     | حوزه عملیاتی — خارج از معماری               |
| SOP و دستورالعمل‌ها    | حوزه اجرایی — خارج از معماری                |
| پرامپت و دستورات AI    | حوزه PRM — خارج از COM                      |
| قالب‌های محتوایی       | حوزه اجرایی — خارج از معماری                |
| Copywriting            | حوزه اجرایی — خارج از معماری                |

---

## 3. Knowledge Publishing Principles

| ID     | اصل                        | توضیح                                                                                        |
| ------ | -------------------------- | -------------------------------------------------------------------------------------------- |
| KPP-01 | **دانش متعارف منبع حقیقت** | همه انتشارات باید از دانش متعارف مشتق شوند — هیچ محتوایی بدون منبع دانش متعارف منتشر نمی‌شود |
| KPP-02 | **ردیابی‌پذیری کامل**      | هر انتشار باید تا دانش متعارف مبدأ قابل ردیابی باشد                                          |
| KPP-03 | **حکمرانی انتشار**         | همه انتشارات دانش باید از قواعد و سطوح اختیار تعریف‌شده پیروی کنند                           |
| KPP-04 | **کیفیت در مبدأ**          | کیفیت انتشار در مبدأ (دانش متعارف) تعیین می‌شود — نه در کانال مقصد                           |
| KPP-05 | **جداسازی محتوا از کانال** | دانش متعارف مستقل از هر کانال انتشار تعریف می‌شود                                            |
| KPP-06 | **نسخه‌بندی یکپارچه**      | هر انتشار دانش باید دارای نسخه‌ای قابل ردیابی به دانش متعارف باشد                            |
| KPP-07 | **تکامل کنترل‌شده**        | تغییر در معماری انتشار تابع فرآیند حکمرانی است                                               |
| KPP-08 | **همگام‌سازی دائمی**       | دانش منتشرشده باید با دانش متعارف مبدأ همگام باقی بماند                                      |

---

## 4. Knowledge Publishing Philosophy

### فلسفه انتشار دانش سازمانی

SMOS انتشار دانش سازمانی را به عنوان **فرآیند معماری تبدیل دانش متعارف سازمانی به محتوای قابل انتشار در کانال‌های هدف** می‌بیند که:

1. **حفظ‌کننده یکپارچگی است** — دانش متعارف را در همه کانال‌ها یکسان نگه می‌دارد
2. **تطبیق‌دهنده است** — دانش متعارف را برای کانال‌های مختلف آماده می‌کند
3. **ردیابی‌کننده است** — هر انتشار را از دانش متعارف تا مخاطب ردیابی می‌کند
4. **اعتبارسنج است** — کیفیت و صحت انتشار را قبل و بعد از انتشار تضمین می‌کند
5. **هماهنگ‌کننده است** — توالی و نسخه‌بندی انتشار را در همه کانال‌ها هماهنگ می‌کند

### هستی‌شناسی انتشار دانش

انتشار دانش سازمانی در SMOS دارای سه لایه هستی‌شناختی است:

| لایه                 | توضیح                             | مثال                               |
| -------------------- | --------------------------------- | ---------------------------------- |
| Canonical (متعارف)   | دانش خالص — مستقل از کانال و قالب | Knowledge Asset در KNW System      |
| Publication (انتشار) | دانش آماده‌شده برای یک کانال خاص  | Publication Package با تطبیق کانال |
| Distribution (توزیع) | دانش منتشرشده در کانال هدف        | Post, Article, Video در پلتفرم     |

### اصول فلسفی

1. Canonical تنها یک نسخه دارد — Publication می‌تواند چند نسخه داشته باشد
2. تغییر در Canonical باید به همه Publication‌های مرتبط منتشر شود
3. هر Publication باید دقیقاً یک Canonical منبع داشته باشد
4. Distribution تصویر لحظه‌ای Publication در کانال مقصد است

---

## 5. Enterprise Knowledge Publishing Model

### مدل انتشار دانش سازمانی

انتشار دانش سازمانی SMOS از چهار لایه تشکیل شده است:

| لایه                            | شناسه  | توضیح                                           | وابستگی        |
| ------------------------------- | ------ | ----------------------------------------------- | -------------- |
| Knowledge Canonical Layer       | KPL-01 | دانش متعارف — منبع حقیقت دانش خالص              | KNW-000        |
| Knowledge Publication Layer     | KPL-02 | انتشار دانش — آماده‌سازی برای کانال             | KPL-01         |
| Knowledge Distribution Layer    | KPL-03 | توزیع دانش — ارسال به کانال‌های هدف             | KPL-02         |
| Knowledge Synchronization Layer | KPL-04 | همگام‌سازی — تطابق بین Canonical و Distribution | KPL-01, KPL-03 |

### اصول مدل انتشار

1. KPL-01 (Canonical) تنها لایه غیرقابل تغییر مستقیم است — تغییر از طریق KNW System
2. KPL-02 (Publication) تنها لایه‌ای است که تطبیق کانال در آن انجام می‌شود
3. KPL-03 (Distribution) تک‌جهته است — از Publication به کانال، نه بالعکس
4. KPL-04 (Synchronization) مسئول شناسایی و اطلاع‌رسانی تغییرات است
5. هر کانال انتشار جدید باید با هر چهار لایه سازگار باشد

---

## 6. Publishing Domains

| شناسه  | دامنه                     | توضیح                                             |
| ------ | ------------------------- | ------------------------------------------------- |
| KPD-01 | Canonical Knowledge       | دانش متعارف — منبع حقیقت دانش خالص                |
| KPD-02 | Publication Governance    | حکمرانی انتشار — قواعد و سیاست‌های انتشار دانش    |
| KPD-03 | Publication Quality       | کیفیت انتشار — معیارها و گیت‌های کیفیت            |
| KPD-04 | Publication Lifecycle     | چرخه حیات انتشار — مراحل دانش از متعارف تا انتشار |
| KPD-05 | Knowledge Distribution    | توزیع دانش — ارسال به کانال‌های هدف               |
| KPD-06 | Knowledge Synchronization | همگام‌سازی دانش — تطابق بین سیستم‌ها              |
| KPD-07 | Knowledge Versioning      | نسخه‌بندی دانش — مدیریت نسخه‌ها در انتشار         |
| KPD-08 | Knowledge Evolution       | تکامل دانش — تغییر در دانش و انتشار               |

---

## 7. Knowledge Publishing Concepts

| شناسه   | مفهوم                         | توضیح                                                    | دامنه  |
| ------- | ----------------------------- | -------------------------------------------------------- | ------ |
| KPC-001 | Canonical Knowledge Asset     | دارایی دانش متعارف — واحد بنیادین دانش در KNW System     | KPD-01 |
| KPC-002 | Publication Package           | بسته انتشار — مجموعه دانش آماده برای یک کانال            | KPD-05 |
| KPC-003 | Publication Channel           | کانال انتشار — مقصد توزیع دانش                           | KPD-05 |
| KPC-004 | Publication Format            | قالب انتشار — ساختار نمایش دانش در کانال                 | KPD-05 |
| KPC-005 | Publication Transformation    | تبدیل انتشار — فرآیند تبدیل دانش متعارف به قالب کانال    | KPD-05 |
| KPC-006 | Publication Version           | نسخه انتشار — snapshot دانش در لحظه انتشار               | KPD-07 |
| KPC-007 | Publication Gate              | گیت انتشار — نقطه تصمیم در فرآیند انتشار                 | KPD-02 |
| KPC-008 | Publication Policy            | سیاست انتشار — قاعده حاکم بر انتشار دانش                 | KPD-02 |
| KPC-009 | Publication Decision          | تصمیم انتشار — انتخاب در مورد انتشار دانش                | KPD-02 |
| KPC-010 | Publication Trace             | رد انتشار — مسیر دانش از متعارف تا کانال                 | KPD-08 |
| KPC-011 | Publication Audit             | حسابرسی انتشار — ثبت و بازبینی انتشارات                  | KPD-02 |
| KPC-012 | Publication Metric            | معیار انتشار — شاخص اندازه‌گیری کیفیت انتشار             | KPD-03 |
| KPC-013 | Publication Quality Gate      | گیت کیفیت انتشار — معیار پذیرش برای انتشار               | KPD-03 |
| KPC-014 | Publication Role              | نقش انتشار — مسئولیت و اختیار در انتشار                  | KPD-02 |
| KPC-015 | Canonical Source              | منبع متعارف — دانش مبدأ برای انتشار                      | KPD-01 |
| KPC-016 | Publication Sync Point        | نقطه همگام‌سازی — لحظه تطابق بین Canonical و Publication | KPD-06 |
| KPC-017 | Publication Notification      | اعلان انتشار — اطلاع‌رسانی تغییر در دانش متعارف          | KPD-06 |
| KPC-018 | Publication Registry Entry    | ثبت نمایه انتشار — ورود انتشار در نمایه مرکزی            | KPD-02 |
| KPC-019 | Publication Lifecycle Stage   | مرحله چرخه حیات انتشار — وضعیت در طول حیات               | KPD-04 |
| KPC-020 | Publication Evolution Request | درخواست تکامل انتشار — تغییر در معماری انتشار            | KPD-08 |

---

## 8. Knowledge Publishing Entities

| شناسه   | موجودیت                    | نوع      | توضیح                                      | دامنه  |
| ------- | -------------------------- | -------- | ------------------------------------------ | ------ |
| KPE-001 | Canonical Knowledge Asset  | Core     | دارایی دانش متعارف — منبع حقیقت دانش خالص  | KPD-01 |
| KPE-002 | Publication Package        | Core     | بسته انتشار — دانش آماده برای کانال        | KPD-05 |
| KPE-003 | Publication Channel        | Core     | کانال انتشار — مقصد توزیع دانش             | KPD-05 |
| KPE-004 | Publication Format         | Core     | قالب انتشار — ساختار نمایش در کانال        | KPD-05 |
| KPE-005 | Publication Transformation | Temporal | تبدیل انتشار — فرآیند تبدیل به قالب کانال  | KPD-05 |
| KPE-006 | Publication Version        | Core     | نسخه انتشار — snapshot دانش در لحظه انتشار | KPD-07 |
| KPE-007 | Publication Gate           | Core     | گیت انتشار — نقطه تصمیم در انتشار          | KPD-02 |
| KPE-008 | Publication Policy         | Core     | سیاست انتشار — قاعده حاکم بر انتشار        | KPD-02 |
| KPE-009 | Publication Decision       | Core     | تصمیم انتشار — انتخاب در فرآیند انتشار     | KPD-02 |
| KPE-010 | Publication Role           | Core     | نقش انتشار — مسئولیت و سطح اختیار          | KPD-02 |
| KPE-011 | Publication Sync Point     | Temporal | نقطه همگام‌سازی — لحظه تطابق               | KPD-06 |
| KPE-012 | Publication Metric         | Core     | معیار انتشار — شاخص عملکرد انتشار          | KPD-03 |

---

## 9. Publishing Attributes

| شناسه  | ویژگی                       | توضیح                                      | موجودیت مرتبط |
| ------ | --------------------------- | ------------------------------------------ | ------------- |
| KPA-01 | Canonical Integrity         | یکپارچگی متعارف — انطباق با دانش مبدأ      | KPE-001       |
| KPA-02 | Publication Readiness       | آمادگی انتشار — کیفیت برای انتشار در کانال | KPE-002       |
| KPA-03 | Channel Compatibility       | سازگاری کانال — انطباق با الزامات کانال    | KPE-003       |
| KPA-04 | Transformation Completeness | تکمیل تبدیل — درصد تبدیل کامل              | KPE-005       |
| KPA-05 | Version Lineage             | شجره‌نامه نسخه — توالی نسخه‌ها             | KPE-006       |
| KPA-06 | Governance Conformance      | انطباق حکمرانی — رعایت قواعد انتشار        | KPE-008       |
| KPA-07 | Decision Traceability       | ردیابی تصمیم — قابلیت ردیابی به مبدأ       | KPE-009       |
| KPA-08 | Sync Completeness           | تکمیل همگام‌سازی — تطابق کامل با Canonical | KPE-011       |

---

## 10. Knowledge Publishing Capabilities

| شناسه     | قابلیت                             | توضیح                                          | لایه         |
| --------- | ---------------------------------- | ---------------------------------------------- | ------------ |
| KPCAP-001 | Canonical Knowledge Management     | مدیریت دانش متعارف — تعریف و نگهداری دانش خالص | Strategy     |
| KPCAP-002 | Publication Package Assembly       | مونتاژ بسته انتشار — ترکیب دانش برای کانال     | Execution    |
| KPCAP-003 | Publication Transformation         | تبدیل انتشار — تطبیق دانش متعارف برای کانال    | Architecture |
| KPCAP-004 | Publication Channel Management     | مدیریت کانال انتشار — تعریف و پیکربندی کانال   | Architecture |
| KPCAP-005 | Publication Version Management     | مدیریت نسخه انتشار — ردیابی و کنترل نسخه       | Architecture |
| KPCAP-006 | Publication Gate Management        | مدیریت گیت انتشار — نقاط تصمیم                 | Architecture |
| KPCAP-007 | Publication Governance Enforcement | اعمال حکمرانی بر تصمیمات انتشار                | Strategy     |
| KPCAP-008 | Publication Quality Assessment     | ارزیابی کیفیت انتشار                           | Strategy     |
| KPCAP-009 | Publication Trace Management       | مدیریت ردیابی انتشار — ثبت مسیر                | Architecture |
| KPCAP-010 | Publication Audit Management       | مدیریت حسابرسی انتشار — بازبینی                | Strategy     |
| KPCAP-011 | Knowledge Synchronization          | همگام‌سازی دانش — تطابق بین سیستم‌ها           | Architecture |
| KPCAP-012 | Publication Notification           | اعلان انتشار — اطلاع‌رسانی تغییرات             | Execution    |
| KPCAP-013 | Publication Registry Management    | مدیریت نمایه انتشار — ثبت و فهرست‌بندی         | Architecture |
| KPCAP-014 | Publication Evolution Management   | مدیریت تکامل انتشار — تطبیق با تغییرات         | Strategy     |

---

## 11. Knowledge Publishing Functions

| شناسه  | کارکرد                         | توضیح                            | قابلیت مرتبط |
| ------ | ------------------------------ | -------------------------------- | ------------ |
| KPF-01 | Manage Canonical Knowledge     | مدیریت دانش متعارف در KNW System | KPCAP-001    |
| KPF-02 | Assemble Publication Package   | مونتاژ بسته انتشار برای کانال    | KPCAP-002    |
| KPF-03 | Transform for Publication      | تبدیل دانش متعارف برای کانال     | KPCAP-003    |
| KPF-04 | Manage Publication Channel     | مدیریت کانال انتشار              | KPCAP-004    |
| KPF-05 | Manage Publication Version     | مدیریت نسخه انتشار               | KPCAP-005    |
| KPF-06 | Manage Publication Gate        | مدیریت گیت‌های انتشار            | KPCAP-006    |
| KPF-07 | Enforce Publication Governance | اعمال قواعد حکمرانی بر انتشار    | KPCAP-007    |
| KPF-08 | Assess Publication Quality     | ارزیابی کیفیت انتشار             | KPCAP-008    |
| KPF-09 | Manage Publication Trace       | مدیریت ردیابی انتشار             | KPCAP-009    |
| KPF-10 | Audit Publication              | حسابرسی انتشارات دانش            | KPCAP-010    |
| KPF-11 | Synchronize Knowledge          | همگام‌سازی دانش بین سیستم‌ها     | KPCAP-011    |
| KPF-12 | Notify Publication Change      | اعلان تغییر در دانش متعارف       | KPCAP-012    |
| KPF-13 | Manage Publication Registry    | مدیریت نمایه مرکزی انتشار        | KPCAP-013    |
| KPF-14 | Manage Publication Evolution   | مدیریت تکامل معماری انتشار       | KPCAP-014    |

---

## 12. Publishing Taxonomy

### طبقه‌بندی انتشار دانش سازمانی

انتشار دانش سازمانی SMOS در سه سطح طبقه‌بندی می‌شود:

| سطح          | شناسه                  | توضیح                                                       | دامنه‌ها |
| ------------ | ---------------------- | ----------------------------------------------------------- | -------- |
| Core         | KPD-01, KPD-02, KPD-07 | دانش متعارف، حکمرانی و نسخه‌بندی — اصول و قواعد تغییرناپذیر |
| Distribution | KPD-05, KPD-08         | توزیع و تکامل دانش — کانال‌های هدف و تغییرات آنها           |
| Quality      | KPD-03, KPD-04, KPD-06 | کیفیت، چرخه حیات و همگام‌سازی — عملیات انتشار               |

### اصول طبقه‌بندی

1. هر مفهوم انتشار دقیقاً در یک دامنه طبقه‌بندی می‌شود
2. دامنه‌های Core قواعد همه دامنه‌ها را تعیین می‌کنند
3. دامنه‌های Distribution از Core تبعیت می‌کنند اما کانال‌های توزیع را تعریف می‌کنند
4. دامنه‌های Quality قواعد ارزیابی و اندازه‌گیری را تعریف می‌کنند

---

## 13. Publishing State Model

| شناسه  | وضعیت      | توضیح                                         | مجوز انتقال |
| ------ | ---------- | --------------------------------------------- | ----------- |
| KPS-01 | Draft      | پیش‌نویس — دانش متعارف برای انتشار انتخاب شده | → KPS-02    |
| KPS-02 | Prepared   | آماده‌شده — بسته انتشار برای کانال مونتاژ شده | → KPS-03    |
| KPS-03 | Validated  | اعتبارسنجی‌شده — همه گیت‌ها عبور کرده‌اند     | → KPS-04    |
| KPS-04 | Approved   | تصویب‌شده — مجوز انتشار صادر شده              | → KPS-05    |
| KPS-05 | Published  | منتشرشده — دانش در کانال هدف منتشر شد         | → KPS-06    |
| KPS-06 | Maintained | نگهداری‌شده — دانش منتشرشده در حال همگام‌سازی | → KPS-07    |
| KPS-07 | Superseded | جایگزین‌شده — نسخه جدیدتر منتشر شده           | → KPS-08    |
| KPS-08 | Archived   | بایگانی‌شده — چرخه انتشار کامل شده            | → KPS-01    |

### انتقال‌های مجاز

| از     | به     | شرط                                  |
| ------ | ------ | ------------------------------------ |
| KPS-01 | KPS-02 | تکمیل مونتاژ Publication Package     |
| KPS-02 | KPS-03 | عبور از گیت‌های اعتبارسنجی           |
| KPS-03 | KPS-04 | تصویب توسط نقش مجاز                  |
| KPS-04 | KPS-05 | اجرای انتشار در کانال                |
| KPS-05 | KPS-06 | تأیید موفقیت انتشار                  |
| KPS-06 | KPS-07 | انتشار نسخه جدیدتر                   |
| KPS-07 | KPS-08 | تکمیل چرخه پایش                      |
| KPS-06 | KPS-05 | بازنشر پس از همگام‌سازی با Canonical |
| KPS-07 | KPS-05 | بازگشت به انتشار برای اصلاح          |
| KPS-08 | KPS-01 | بازگشت به چرخه برای انتشار مجدد      |

---

## 14. Publication Lifecycle Model

| شناسه   | مرحله               | توضیح                                            | معیار خروج                       |
| ------- | ------------------- | ------------------------------------------------ | -------------------------------- |
| KPST-01 | Canonical Selection | انتخاب دانش متعارف — تعیین دانش مبدأ برای انتشار | ثبت Canonical Knowledge Asset    |
| KPST-02 | Package Assembly    | مونتاژ بسته — ترکیب دانش برای کانال هدف          | تکمیل Publication Package        |
| KPST-03 | Transformation      | تبدیل — تطبیق دانش برای قالب کانال               | تکمیل Publication Transformation |
| KPST-04 | Validation          | اعتبارسنجی — عبور از گیت‌های انتشار              | تأیید توسط Publication Gate      |
| KPST-05 | Approval            | تصویب — اخذ مجوز نهایی انتشار                    | تأیید توسط Publication Role      |
| KPST-06 | Distribution        | توزیع — ارسال به کانال هدف                       | تأیید انتشار در کانال            |
| KPST-07 | Synchronization     | همگام‌سازی — تطابق با Canonical پس از انتشار     | تأیید Sync Completeness          |
| KPST-08 | Closure             | بسته شدن — پایان کامل چرخه انتشار                | بایگانی یا جایگزینی              |

---

## 15. Publication Governance Model

### مدل حکمرانی انتشار دانش

حکمرانی انتشار دانش SMOS بر اساس سطوح اختیار (A-0 تا A-4) تعریف می‌شود:

| سطح | عنوان               | اختیارات                           | مثال             |
| --- | ------------------- | ---------------------------------- | ---------------- |
| A-0 | بدون دسترسی         | فقط خواندن دانش منتشرشده           | مصرف‌کننده نهایی |
| A-1 | مصرف‌کننده انتشار   | مشاهده Publication Registry        | AI-010           |
| A-2 | مشارکت‌کننده انتشار | پیشنهاد بسته انتشار و کانال        | AI-008           |
| A-3 | مدیر انتشار         | ایجاد و مدیریت Publication Package | معمار انتشار     |
| A-4 | مالک انتشار         | تصویب، تغییر در معماری انتشار      | مدیر دانش        |

### انواع تصمیمات حکمرانی

| نوع         | توضیح                          | سطح اختیار |
| ----------- | ------------------------------ | ---------- |
| تعریف       | ایجاد الگوی انتشار جدید        | A-4        |
| برنامه‌ریزی | انتخاب دانش متعارف برای انتشار | A-3        |
| تبدیل       | تعیین قالب و کانال انتشار      | A-3        |
| اعتبارسنجی  | عبور از گیت‌های انتشار         | A-3        |
| تصویب       | تأیید نهایی بسته انتشار        | A-4        |
| بازبینی     | ارزیابی تصمیمات انتشار         | A-3        |
| حذف         | حذف از Publication Registry    | A-4        |

---

## 16. Publication Consistency Model

### مدل سازگاری انتشار

سازگاری انتشار در SMOS در چهار بعد تعریف می‌شود:

| بعد                       | توضیح                                                       | معیار                                         |
| ------------------------- | ----------------------------------------------------------- | --------------------------------------------- |
| Vertical Consistency      | سازگاری عمودی — هماهنگی Canonical تا Distribution           | همه لایه‌ها با Canonical Knowledge سازگارند   |
| Horizontal Consistency    | سازگاری افقی — یکپارچگی در همه دامنه‌ها                     | یک دانش در همه دامنه‌های انتشار               |
| Cross-Channel Consistency | سازگاری بین‌کانالی — یکپارچگی در همه کانال‌ها               | یک دانش در همه کانال‌ها                       |
| Version Consistency       | سازگاری نسخه‌ای — تطابق نسخه‌ها بین Canonical و Publication | نسخه Publication با نسخه Canonical سازگار است |

### قواعد سازگاری

| ID     | قاعده                                   | توضیح                                                         |
| ------ | --------------------------------------- | ------------------------------------------------------------- |
| PCR-01 | Canonical مقدم بر Publication           | هیچ Publication بدون Canonical منبع مجاز نیست                 |
| PCR-02 | نسخه Canonical مقدم بر نسخه Publication | نسخه Publication نمی‌تواند از نسخه Canonical جلوتر باشد       |
| PCR-03 | تغییر Canonical → تغییر Publication     | هر تغییر در Canonical باید به Publication‌های مرتبط منتشر شود |
| PCR-04 | Consistency Validation پیش از انتشار    | سازگاری باید قبل از انتشار تأیید شود                          |

---

## 17. Publication Validation Model

### مدل اعتبارسنجی انتشار

اعتبارسنجی انتشار در چهار سطح انجام می‌شود:

| سطح | نوع اعتبارسنجی        | توضیح                                                      | مجری         |
| --- | --------------------- | ---------------------------------------------------------- | ------------ |
| L1  | Canonical Integrity   | بررسی یکپارچگی با دانش متعارف — انطباق با Canonical Source | AI-004       |
| L2  | Governance Validation | بررسی انطباق با قواعد حکمرانی انتشار                       | AI-004       |
| L3  | Quality Validation    | بررسی کیفیت انتشار — عبور از معیارهای کیفیت                | AI-004       |
| L4  | Publication Readiness | بررسی آمادگی کامل برای انتشار                              | معمار انتشار |

### قواعد اعتبارسنجی

| ID     | قاعده                                                     | توضیح |
| ------ | --------------------------------------------------------- | ----- |
| PVR-01 | هر بسته انتشار باید قبل از توزیع اعتبارسنجی شود           |
| PVR-02 | اعتبارسنجی L1 برای همه انتشارات الزامی است                |
| PVR-03 | اعتبارسنجی L2 برای انتشارات با تأثیر بالا الزامی است      |
| PVR-04 | اعتبارسنجی L3 برای انتشارات در کانال‌های عمومی الزامی است |
| PVR-05 | عدم انطباق باید به سطح اختیار مناسب ارجاع شود             |

---

## 18. Publishing Metrics

| شناسه  | معیار                     | توضیح                                                  | دامنه  | واحد  |
| ------ | ------------------------- | ------------------------------------------------------ | ------ | ----- |
| KPM-01 | Canonical Coverage        | پوشش متعارف — درصد دانش متعارف منتشرشده                | KPD-01 | درصد  |
| KPM-02 | Publication Completeness  | تکمیل انتشار — درصد انتشار کامل طبق برنامه             | KPD-05 | درصد  |
| KPM-03 | Channel Coverage          | پوشش کانال — درصد کانال‌های فعال                       | KPD-05 | درصد  |
| KPM-04 | Transformation Accuracy   | دقت تبدیل — درصد تبدیل موفق                            | KPD-05 | درصد  |
| KPM-05 | Version Consistency       | سازگاری نسخه — درصد تطابق نسخه Canonical و Publication | KPD-07 | درصد  |
| KPM-06 | Governance Compliance     | انطباق حکمرانی — درصد رعایت قواعد انتشار               | KPD-02 | درصد  |
| KPM-07 | Gate Pass Rate            | نرخ عبور از گیت — درصد عبور موفق                       | KPD-02 | درصد  |
| KPM-08 | Sync Completeness         | تکمیل همگام‌سازی — درصد تطابق با Canonical             | KPD-06 | درصد  |
| KPM-09 | Decision Traceability     | ردیابی تصمیم — درصد تصمیمات قابل ردیابی                | KPD-02 | درصد  |
| KPM-10 | Audit Coverage            | پوشش حسابرسی — درصد انتشارات حسابرسی‌شده               | KPD-02 | درصد  |
| KPM-11 | Publication Quality Index | شاخص کیفیت انتشار — میانگین معیارها                    | KPD-03 | ۰-۱۰۰ |
| KPM-12 | Lifecycle Completion      | تکمیل چرخه حیات — درصد عبور از همه مراحل               | KPD-04 | درصد  |
| KPM-13 | Notification Latency      | تأخیر اعلان — زمان بین تغییر Canonical و اعلان         | KPD-06 | ثانیه |
| KPM-14 | Evolution Readiness       | آمادگی تکامل — درصد تطبیق با تغییرات                   | KPD-08 | درصد  |
| KPM-15 | Registry Completeness     | تکمیل نمایه — درصد انتشارات ثبت‌شده                    | KPD-02 | درصد  |

---

## 19. Publication Registry Model

### مدل ثبت انتشار

همه مؤلفه‌های انتشار دانش سازمانی باید در نمایه مرکزی ثبت شوند:

| فیلد             | توضیح                                                             | الزامی  |
| ---------------- | ----------------------------------------------------------------- | ------- |
| Publication ID   | شناسه یکتای مؤلفه انتشار                                          | ✅      |
| Name             | نام مؤلفه                                                         | ✅      |
| Type             | نوع مؤلفه (Package, Channel, Format, Gate, Policy, Role, Version) | ✅      |
| Domain           | دامنه انتشار                                                      | ✅      |
| Canonical Source | شناسه دانش متعارف مبدأ                                            | ✅      |
| Status           | وضعیت در State Model                                              | ✅      |
| Version          | نسخه فعلی                                                         | ✅      |
| Owner            | مالک مؤلفه                                                        | ✅      |
| Created          | تاریخ ایجاد                                                       | ✅      |
| Updated          | آخرین به‌روزرسانی                                                 | ✅      |
| Channel          | کانال هدف (برای انتشارات)                                         | اختیاری |
| Dependencies     | وابستگی به سایر مؤلفه‌ها                                          | اختیاری |

---

## 20. Publication Constraint Model

| شناسه    | محدودیت                                 | توضیح                                                | دامنه  |
| -------- | --------------------------------------- | ---------------------------------------------------- | ------ |
| KPCST-01 | Canonical Source الزامی                 | هیچ انتشار بدون دانش متعارف مبدأ مجاز نیست           | KPD-01 |
| KPCST-02 | Governance غیرقابل تغییر بدون ADR A-4   | تغییر در حکمرانی انتشار نیازمند بالاترین سطح اختیار  | KPD-02 |
| KPCST-03 | انتشار تابع اعتبارسنجی                  | هیچ بسته انتشار بدون عبور از گیت‌ها منتشر نمی‌شود    | KPD-02 |
| KPCST-04 | نسخه تابع Canonical                     | نسخه Publication از نسخه Canonical جلوتر نیست        | KPD-07 |
| KPCST-05 | حکمرانی بر همه الزامی                   | قواعد حکمرانی برای انسان و Agent یکسان است           | KPD-02 |
| KPCST-06 | همگام‌سازی الزامی پس از تغییر Canonical | پس از تغییر دانش متعارف، Publication باید همگام شود  | KPD-06 |
| KPCST-07 | عدم تغییر پس از انتشار                  | دانش منتشرشده تغییر نمی‌کند — نسخه جدید ایجاد می‌شود | KPD-04 |
| KPCST-08 | Registry Entry الزامی                   | هر Publication باید در نمایه مرکزی ثبت شود           | KPD-02 |

---

## 21. Publication Quality Gates

| ID      | گیت                         | معیار                                       | دامنه  |
| ------- | --------------------------- | ------------------------------------------- | ------ |
| KPQG-01 | Canonical Integrity         | دانش متعارف مبدأ معتبر و قابل ردیابی است    | KPD-01 |
| KPQG-02 | Package Completeness        | همه اجزای بسته انتشار تعریف شده‌اند         | KPD-05 |
| KPQG-03 | Transformation Completeness | تبدیل دانش برای کانال کامل است              | KPD-05 |
| KPQG-04 | Governance Compliance       | همه قواعد حکمرانی رعایت شده‌اند             | KPD-02 |
| KPQG-05 | Quality Threshold           | کیفیت انتشار از آستانه تعیین‌شده بالاتر است | KPD-03 |
| KPQG-06 | Version Consistency         | نسخه Publication با Canonical سازگار است    | KPD-07 |
| KPQG-07 | Registry Completeness       | همه مؤلفه‌ها در نمایه ثبت شده‌اند           | KPD-02 |

---

## 22. Publication Evolution Model

### مدل تکامل انتشار

تکامل انتشار دانش سازمانی در SMOS تابع یک فرآیند ۵ مرحله‌ای است:

| مرحله                   | توضیح                                      | مجری |
| ----------------------- | ------------------------------------------ | ---- |
| 1. Proposal             | ارائه پیشنهاد تغییر در معماری انتشار       | A-2+ |
| 2. Impact Assessment    | ارزیابی تأثیر بر کانال‌ها و Publication‌ها | A-3  |
| 3. Approval             | تصویب تغییر توسط مالک انتشار               | A-4  |
| 4. Implementation       | اجرای تغییر در معماری و نمایه              | A-3  |
| 5. Institutionalization | نهادینه‌سازی در سیستم انتشار               | A-3  |

### انواع تغییر

| نوع         | توضیح                                  | سطح تأثیر           |
| ----------- | -------------------------------------- | ------------------- |
| Patch       | اصلاح جزئی — بدون تغییر معنا یا ساختار | KPD-02+             |
| Minor       | تغییر در قالب یا کانال انتشار          | KPD-05              |
| Major       | تغییر در گیت‌ها یا قواعد تبدیل         | KPD-02              |
| Strategic   | تغییر در معماری انتشار یا اصول         | KPD-02 (فوق‌العاده) |
| New Channel | افزودن کانال جدید به معماری انتشار     | KPD-05              |

---

## 23. Publication Relationship Model

| شناسه  | رابطه        | مبدأ                       | مقصد                      | نوع             | توضیح                                          |
| ------ | ------------ | -------------------------- | ------------------------- | --------------- | ---------------------------------------------- |
| KPR-01 | sources      | Publication Package        | Canonical Knowledge Asset | Source          | بسته انتشار از دانش متعارف مشتق می‌شود         |
| KPR-02 | transforms   | Publication Transformation | Publication Package       | Transformation  | تبدیل، بسته انتشار را برای کانال آماده می‌کند  |
| KPR-03 | distributes  | Publication Package        | Publication Channel       | Distribution    | بسته انتشار به کانال توزیع می‌رود              |
| KPR-04 | formats      | Publication Format         | Publication Package       | Formatting      | قالب، ساختار بسته انتشار را تعیین می‌کند       |
| KPR-05 | versions     | Publication Version        | Publication Package       | Versioning      | نسخه، بسته انتشار را کنترل می‌کند              |
| KPR-06 | gates        | Publication Gate           | Publication Package       | Gating          | گیت، بسته انتشار را کنترل می‌کند               |
| KPR-07 | decides      | Publication Decision       | Publication Package       | Decision        | تصمیم، سرنوشت بسته انتشار را تعیین می‌کند      |
| KPR-08 | synchronizes | Publication Sync Point     | Canonical Knowledge Asset | Synchronization | همگام‌سازی، تطابق با Canonical را تضمین می‌کند |
| KPR-09 | measures     | Publication Metric         | Publication Package       | Measurement     | معیار، کیفیت انتشار را اندازه می‌گیرد          |
| KPR-10 | evolves      | Publication Channel        | Publication Package       | Evolution       | تکامل کانال، بسته انتشار را به‌روز می‌کند      |

---

## 24. Publication Hierarchy Model

### سلسله‌مراتب انتشار

انتشار دانش سازمانی SMOS دارای سلسله‌مراتب زیر است:

```
Publication Registry
    │
    ├── Canonical Knowledge Asset (KPE-001)
    │       │
    │       ├── Publication Package (KPE-002)
    │       ├── Publication Channel (KPE-003)
    │       ├── Publication Format (KPE-004)
    │       │
    │       ├── Publication Transformation (KPE-005)
    │       ├── Publication Version (KPE-006)
    │       │
    │       ├── Publication Gate (KPE-007)
    │       ├── Publication Policy (KPE-008)
    │       │
    │       ├── Publication Decision (KPE-009)
    │       ├── Publication Role (KPE-010)
    │       │
    │       ├── Publication Sync Point (KPE-011)
    │       └── Publication Metric (KPE-012)
```

### اصول سلسله‌مراتب

1. هر موجودیت دقیقاً یک والد دارد (به جز Registry به عنوان ریشه)
2. موجودیت‌های Core (Asset, Package, Channel, Format) در بالاترین سطح
3. موجودیت‌های Transformation (Transformation, Version, Sync Point) در سطح میانی
4. موجودیت‌های Operational (Gate, Policy, Decision, Role, Metric) در سطح پایینی

---

## 25. Naming Rules

| الگو                          | شناسه          | مثال      |
| ----------------------------- | -------------- | --------- |
| Knowledge Publishing Concepts | KPC-[0-9]{3}   | KPC-001   |
| Knowledge Publishing Entities | KPE-[0-9]{3}   | KPE-001   |
| Publishing Attributes         | KPA-[0-9]{2}   | KPA-01    |
| Publishing Capabilities       | KPCAP-[0-9]{3} | KPCAP-001 |
| Publishing Functions          | KPF-[0-9]{2}   | KPF-01    |
| Publishing Domains            | KPD-[0-9]{2}   | KPD-01    |
| Publishing States             | KPS-[0-9]{2}   | KPS-01    |
| Publishing Stages             | KPST-[0-9]{2}  | KPST-01   |
| Publishing Relationships      | KPR-[0-9]{2}   | KPR-01    |
| Publishing Metrics            | KPM-[0-9]{2}   | KPM-01    |
| Publishing Principles         | KPP-[0-9]{2}   | KPP-01    |
| Publishing Constraints        | KPCST-[0-9]{2} | KPCST-01  |
| Publishing Quality Gates      | KPQG-[0-9]{2}  | KPQG-01   |
| Publishing Consistency Rules  | PCR-[0-9]{2}   | PCR-01    |
| Publishing Validation Rules   | PVR-[0-9]{2}   | PVR-01    |

---

## 26. Cross References

### ارجاع به سایر معماری‌ها و دانش

| خانواده                   | سند     | ارجاع به COM-005                           |
| ------------------------- | ------- | ------------------------------------------ |
| Knowledge Architecture    | KNW-000 | معماری مادر دانش — منبع دانش متعارف        |
| Knowledge Index           | KNW-001 | نمایه مرکزی دانش — ثبت و نمایه‌سازی        |
| AI Meta Architecture      | KNW-510 | متا معماری دانش — سازگاری با معماری AI     |
| Brand Knowledge           | KNW-701 | هویت برند — منبع هویت برای انتشار          |
| Reference Knowledge       | KNW-801 | طبقه‌بندی‌ها و شناسه‌های مرجع              |
| Content Architecture      | COM-001 | معماری محتوا — ساختار محتوا برای انتشار    |
| Brand Voice Architecture  | COM-002 | معماری صدای برند — لحن انتشار              |
| Editorial Architecture    | COM-003 | معماری تحریریه — برنامه‌ریزی انتشار        |
| Social Media Architecture | COM-004 | معماری شبکه‌های اجتماعی — کانال‌های انتشار |
| Knowledge Compiler        | KNW-201 | کامپایلر دانش — پردازش و تبدیل             |
| Publishing Agent          | AI-008  | عامل انتشار و توزیع — اجراکننده اصلی       |
| Knowledge Agent           | AI-011  | عامل مدیریت دانش — تأمین‌کننده دانش متعارف |
| Automation                | AUT-\*  | خودکارسازی — مصرف‌کننده معماری انتشار      |

---

## 27. Machine Readable JSON Blocks

### Block 1 — Publishing Identity

```json
{
  "id": "COM-005",
  "name_fa": "معماری انتشار دانش سازمانی SMOS",
  "name_en": "Enterprise Knowledge Publishing Architecture",
  "version": "1.0.0-draft",
  "family": "COM",
  "domain": "KPD-02",
  "type": "Architecture",
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
  "dependencies": [
    "KNW-000",
    "KNW-001",
    "KNW-701",
    "KNW-801",
    "KNW-510",
    "COM-001",
    "COM-002",
    "COM-003",
    "COM-004"
  ]
}
```

### Block 2 — Publishing Entities

```json
{
  "entities": [
    {
      "id": "KPE-001",
      "name": "Canonical Knowledge Asset",
      "type": "Core",
      "domain": "KPD-01",
      "owner": "Knowledge Architect"
    },
    {
      "id": "KPE-002",
      "name": "Publication Package",
      "type": "Core",
      "domain": "KPD-05",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPE-003",
      "name": "Publication Channel",
      "type": "Core",
      "domain": "KPD-05",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPE-004",
      "name": "Publication Format",
      "type": "Core",
      "domain": "KPD-05",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPE-005",
      "name": "Publication Transformation",
      "type": "Temporal",
      "domain": "KPD-05",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPE-006",
      "name": "Publication Version",
      "type": "Core",
      "domain": "KPD-07",
      "owner": "Knowledge Architect"
    },
    {
      "id": "KPE-007",
      "name": "Publication Gate",
      "type": "Core",
      "domain": "KPD-02",
      "owner": "Publishing Manager"
    },
    {
      "id": "KPE-008",
      "name": "Publication Policy",
      "type": "Core",
      "domain": "KPD-02",
      "owner": "Publishing Manager"
    },
    {
      "id": "KPE-009",
      "name": "Publication Decision",
      "type": "Core",
      "domain": "KPD-02",
      "owner": "Publishing Manager"
    },
    {
      "id": "KPE-010",
      "name": "Publication Role",
      "type": "Core",
      "domain": "KPD-02",
      "owner": "Publishing Manager"
    },
    {
      "id": "KPE-011",
      "name": "Publication Sync Point",
      "type": "Temporal",
      "domain": "KPD-06",
      "owner": "Knowledge Architect"
    },
    {
      "id": "KPE-012",
      "name": "Publication Metric",
      "type": "Core",
      "domain": "KPD-03",
      "owner": "Publishing Architect"
    }
  ]
}
```

### Block 3 — Publishing Capabilities

```json
{
  "capabilities": [
    {
      "id": "KPCAP-001",
      "name": "Canonical Knowledge Management",
      "layer": "Strategy",
      "owner": "Knowledge Architect"
    },
    {
      "id": "KPCAP-002",
      "name": "Publication Package Assembly",
      "layer": "Execution",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPCAP-003",
      "name": "Publication Transformation",
      "layer": "Architecture",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPCAP-004",
      "name": "Publication Channel Management",
      "layer": "Architecture",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPCAP-005",
      "name": "Publication Version Management",
      "layer": "Architecture",
      "owner": "Knowledge Architect"
    },
    {
      "id": "KPCAP-006",
      "name": "Publication Gate Management",
      "layer": "Architecture",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPCAP-007",
      "name": "Publication Governance Enforcement",
      "layer": "Strategy",
      "owner": "Publishing Manager"
    },
    {
      "id": "KPCAP-008",
      "name": "Publication Quality Assessment",
      "layer": "Strategy",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPCAP-009",
      "name": "Publication Trace Management",
      "layer": "Architecture",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPCAP-010",
      "name": "Publication Audit Management",
      "layer": "Strategy",
      "owner": "Publishing Manager"
    },
    {
      "id": "KPCAP-011",
      "name": "Knowledge Synchronization",
      "layer": "Architecture",
      "owner": "Knowledge Architect"
    },
    {
      "id": "KPCAP-012",
      "name": "Publication Notification",
      "layer": "Execution",
      "owner": "Knowledge Architect"
    },
    {
      "id": "KPCAP-013",
      "name": "Publication Registry Management",
      "layer": "Architecture",
      "owner": "Publishing Architect"
    },
    {
      "id": "KPCAP-014",
      "name": "Publication Evolution Management",
      "layer": "Strategy",
      "owner": "Publishing Manager"
    }
  ]
}
```

### Block 4 — Publishing States

```json
{
  "states": [
    {
      "id": "KPS-01",
      "name": "Draft",
      "description": "پیش‌نویس — دانش متعارف برای انتشار انتخاب شده"
    },
    {
      "id": "KPS-02",
      "name": "Prepared",
      "description": "آماده‌شده — بسته انتشار برای کانال مونتاژ شده"
    },
    {
      "id": "KPS-03",
      "name": "Validated",
      "description": "اعتبارسنجی‌شده — همه گیت‌ها عبور کرده‌اند"
    },
    { "id": "KPS-04", "name": "Approved", "description": "تصویب‌شده — مجوز انتشار صادر شده" },
    { "id": "KPS-05", "name": "Published", "description": "منتشرشده — دانش در کانال هدف منتشر شد" },
    {
      "id": "KPS-06",
      "name": "Maintained",
      "description": "نگهداری‌شده — دانش منتشرشده در حال همگام‌سازی"
    },
    { "id": "KPS-07", "name": "Superseded", "description": "جایگزین‌شده — نسخه جدیدتر منتشر شده" },
    { "id": "KPS-08", "name": "Archived", "description": "بایگانی‌شده — چرخه انتشار کامل شده" }
  ],
  "valid_transitions": [
    { "from": "KPS-01", "to": "KPS-02" },
    { "from": "KPS-02", "to": "KPS-03" },
    { "from": "KPS-03", "to": "KPS-04" },
    { "from": "KPS-04", "to": "KPS-05" },
    { "from": "KPS-05", "to": "KPS-06" },
    { "from": "KPS-06", "to": "KPS-07" },
    { "from": "KPS-07", "to": "KPS-08" },
    { "from": "KPS-06", "to": "KPS-05" },
    { "from": "KPS-07", "to": "KPS-05" },
    { "from": "KPS-08", "to": "KPS-01" }
  ]
}
```

### Block 5 — Publishing Relationships

```json
{
  "relationships": [
    {
      "id": "KPR-01",
      "source": "KPE-002",
      "target": "KPE-001",
      "type": "sources",
      "description": "Publication Package sources Canonical Knowledge Asset"
    },
    {
      "id": "KPR-02",
      "source": "KPE-005",
      "target": "KPE-002",
      "type": "transforms",
      "description": "Publication Transformation transforms Publication Package"
    },
    {
      "id": "KPR-03",
      "source": "KPE-002",
      "target": "KPE-003",
      "type": "distributes",
      "description": "Publication Package distributes to Publication Channel"
    },
    {
      "id": "KPR-04",
      "source": "KPE-004",
      "target": "KPE-002",
      "type": "formats",
      "description": "Publication Format formats Publication Package"
    },
    {
      "id": "KPR-05",
      "source": "KPE-006",
      "target": "KPE-002",
      "type": "versions",
      "description": "Publication Version controls Publication Package"
    },
    {
      "id": "KPR-06",
      "source": "KPE-007",
      "target": "KPE-002",
      "type": "gates",
      "description": "Publication Gate gates Publication Package"
    },
    {
      "id": "KPR-07",
      "source": "KPE-009",
      "target": "KPE-002",
      "type": "decides",
      "description": "Publication Decision decides Publication Package"
    },
    {
      "id": "KPR-08",
      "source": "KPE-011",
      "target": "KPE-001",
      "type": "synchronizes",
      "description": "Publication Sync Point synchronizes Canonical Knowledge Asset"
    },
    {
      "id": "KPR-09",
      "source": "KPE-012",
      "target": "KPE-002",
      "type": "measures",
      "description": "Publication Metric measures Publication Package quality"
    },
    {
      "id": "KPR-10",
      "source": "KPE-003",
      "target": "KPE-002",
      "type": "evolves",
      "description": "Publication Channel evolves Publication Package"
    }
  ]
}
```

### Block 6 — Publishing Metrics

```json
{
  "metrics": [
    {
      "id": "KPM-01",
      "name": "Canonical Coverage",
      "domain": "KPD-01",
      "unit": "percent",
      "target": 95
    },
    {
      "id": "KPM-02",
      "name": "Publication Completeness",
      "domain": "KPD-05",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "KPM-03",
      "name": "Channel Coverage",
      "domain": "KPD-05",
      "unit": "percent",
      "target": 90
    },
    {
      "id": "KPM-04",
      "name": "Transformation Accuracy",
      "domain": "KPD-05",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "KPM-05",
      "name": "Version Consistency",
      "domain": "KPD-07",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "KPM-06",
      "name": "Governance Compliance",
      "domain": "KPD-02",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "KPM-07",
      "name": "Gate Pass Rate",
      "domain": "KPD-02",
      "unit": "percent",
      "target": 95
    },
    {
      "id": "KPM-08",
      "name": "Sync Completeness",
      "domain": "KPD-06",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "KPM-09",
      "name": "Decision Traceability",
      "domain": "KPD-02",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "KPM-10",
      "name": "Audit Coverage",
      "domain": "KPD-02",
      "unit": "percent",
      "target": 90
    },
    {
      "id": "KPM-11",
      "name": "Publication Quality Index",
      "domain": "KPD-03",
      "unit": "score_0_100",
      "target": 90
    },
    {
      "id": "KPM-12",
      "name": "Lifecycle Completion",
      "domain": "KPD-04",
      "unit": "percent",
      "target": 95
    },
    {
      "id": "KPM-13",
      "name": "Notification Latency",
      "domain": "KPD-06",
      "unit": "seconds",
      "target": 300
    },
    {
      "id": "KPM-14",
      "name": "Evolution Readiness",
      "domain": "KPD-08",
      "unit": "percent",
      "target": 90
    },
    {
      "id": "KPM-15",
      "name": "Registry Completeness",
      "domain": "KPD-02",
      "unit": "percent",
      "target": 100
    }
  ]
}
```

---

## 28. Draft-07 JSON Schemas

### Schema 1 — Publishing Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:publishing:entity:v1",
  "title": "Knowledge Publishing Entity",
  "description": "Schema for SMOS Knowledge Publishing Entity definitions",
  "type": "object",
  "required": ["id", "name", "type", "domain", "owner"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^KPE-[0-9]{3}$"
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
    "domain": {
      "type": "string",
      "pattern": "^KPD-[0-9]{2}$"
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

### Schema 2 — Publishing Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:publishing:capability:v1",
  "title": "Knowledge Publishing Capability",
  "description": "Schema for SMOS Knowledge Publishing Capability definitions",
  "type": "object",
  "required": ["id", "name", "layer"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^KPCAP-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "layer": {
      "type": "string",
      "enum": ["Strategy", "Architecture", "Execution"]
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

### Schema 3 — Publishing State Transition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:publishing:state:v1",
  "title": "Knowledge Publishing State Transition",
  "description": "Schema for Knowledge Publishing State transitions in the lifecycle model",
  "type": "object",
  "required": ["from", "to"],
  "properties": {
    "from": {
      "type": "string",
      "pattern": "^KPS-[0-9]{2}$"
    },
    "to": {
      "type": "string",
      "pattern": "^KPS-[0-9]{2}$"
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

### آمار COM-005

| شاخص                     | مقدار                                                     |
| ------------------------ | --------------------------------------------------------- |
| تعداد بخش‌ها             | ۳۰                                                        |
| تعداد دامنه‌های انتشار   | ۸                                                         |
| تعداد مفاهیم انتشار      | ۲۰                                                        |
| تعداد موجودیت‌های انتشار | ۱۲                                                        |
| تعداد ویژگی‌های انتشار   | ۸                                                         |
| تعداد قابلیت‌های انتشار  | ۱۴                                                        |
| تعداد کارکردهای انتشار   | ۱۴                                                        |
| تعداد وضعیت‌های انتشار   | ۸                                                         |
| تعداد مراحل چرخه حیات    | ۸                                                         |
| تعداد روابط انتشار       | ۱۰                                                        |
| تعداد معیارهای انتشار    | ۱۵                                                        |
| تعداد اصول انتشار        | ۸                                                         |
| تعداد محدودیت‌های انتشار | ۸                                                         |
| تعداد گیت‌های کیفیت      | ۷                                                         |
| تعداد لایه‌های معماری    | ۴ (Canonical, Publication, Distribution, Synchronization) |
| تعداد مدل‌های معماری     | ۱۲                                                        |
| تعداد JSON Blocks        | ۶                                                         |
| تعداد JSON Schemas       | ۳                                                         |
| تعداد کل خطوط            | ~۹۵۰                                                      |

---

## 30. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | توسط        |
| ----------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-07-03 | نگارش اولیه — معماری انتشار دانش سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (KPC-001 تا KPC-020), ۱۲ موجودیت (KPE-001 تا KPE-012), ۱۴ قابلیت (KPCAP-001 تا KPCAP-014), ۱۴ کارکرد (KPF-01 تا KPF-14), ۸ دامنه (KPD-01 تا KPD-08), ۸ وضعیت (KPS-01 تا KPS-08), ۱۰ رابطه (KPR-01 تا KPR-10), ۱۵ معیار (KPM-01 تا KPM-15), ۸ اصل (KPP-01 تا KPP-08), ۸ محدودیت (KPCST-01 تا KPCST-08), ۷ گیت کیفیت (KPQG-01 تا KPQG-07). پنجمین سند خانواده COM. SSOT معماری انتشار دانش سازمانی SMOS. Architecture Neutral, Platform Neutral, Implementation Free, Vendor Neutral. پشتیبانی از ۴ لایه معماری انتشار. | معمار سیستم |
