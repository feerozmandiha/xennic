# Enterprise Editorial Architecture — معماری تحریریه سازمانی SMOS

> **شناسه:** COM-003
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-07-02
> **مسئول:** معمار تحریریه سازمانی
> **وابستگی:** [KNW-000](../70-KNOWLEDGE/00-enterprise-knowledge-architecture.md), [KNW-001](../70-KNOWLEDGE/10-knowledge-index.md), [KNW-701](../70-KNOWLEDGE/700-brand-knowledge-foundation.md), [KNW-801](../70-KNOWLEDGE/800-reference-knowledge-foundation.md), [KNW-510](../70-KNOWLEDGE/518-ai-meta-architecture.md), [COM-001](./000-enterprise-content-architecture.md), [COM-002](./002-enterprise-brand-voice-architecture.md)
> **مخاطب:** human, ai-agent, content-architect, editorial-architect, communication-architect

---

## 1. Purpose

COM-003 سومین سند خانواده Communication Architecture (COM) و SSOT (تک منبع حقیقت) برای معماری تحریریه سازمانی SMOS است. این سند تعریف می‌کند که محتوای سازمانی چگونه برنامه‌ریزی، توالی‌بندی و هماهنگ می‌شود — بدون ورود به بازاریابی، تقویم اجرایی یا پیاده‌سازی.

### Why COM-003 Exists

بدون یک معماری تحریریه سازمانی:

- برنامه‌ریزی محتوا بدون ساختار معماری انجام می‌شود
- توالی و وابستگی بین محتواها تعریف نشده باقی می‌ماند
- تصمیمات تحریریه (چه محتوایی، در چه زمانی) بدون مبنا است
- هماهنگی بین پلتفرم‌های مختلف قابل ردیابی نیست
- اولویت‌بندی محتوا بدون معیار مشخص انجام می‌شود
- چرخه تحریریه از ایده تا انتشار فاقد معماری است

COM-003 این مشکلات را با تعریف **چارچوب یکپارچه معماری تحریریه سازمانی** حل می‌کند.

### Role of COM-003 in SMOS

| سند            | نقش                                                         |
| -------------- | ----------------------------------------------------------- |
| KNW-000        | معماری دانش سازمانی — منبع دانش                             |
| COM-001        | معماری محتوای سازمانی — ساختار محتوا                        |
| COM-002        | معماری صدای برند — نحوه ارتباط                              |
| **COM-003**    | **SSOT معماری تحریریه سازمانی — برنامه‌ریزی و توالی محتوا** |
| AI-001..AI-002 | عامل‌های استراتژی و برنامه‌ریزی — مصرف‌کنندگان تحریریه      |
| AI-003..AI-008 | عامل‌های تولید تا انتشار — اجراکنندگان تحریریه              |
| AI-014         | هماهنگ‌ساز — مصرف‌کننده تصمیمات تحریریه                     |

---

## 2. Scope

### Inside Scope

| حوزه                            | توضیح                                          |
| ------------------------------- | ---------------------------------------------- |
| Enterprise Editorial Philosophy | هستی‌شناسی و اصول بنیادین تحریریه سازمانی      |
| Editorial Planning Model        | مدل برنامه‌ریزی تحریریه — ساختار تصمیمات       |
| Content Sequencing Model        | مدل توالی محتوا — وابستگی و ترتیب              |
| Editorial Workflow Model        | مدل گردش کار تحریریه — مراحل از ایده تا انتشار |
| Editorial Governance Model      | حکمرانی تحریریه — قواعد، سطوح اختیار، سیاست‌ها |
| Content Priority Model          | مدل اولویت‌بندی محتوا — معیارهای تعیین اولویت  |
| Editorial Consistency Model     | سازگاری تحریریه — یکپارچگی تصمیمات             |
| Multi-Platform Editorial Model  | هماهنگی تحریریه در پلتفرم‌های مختلف            |
| Editorial Quality Model         | کیفیت تحریریه — معیارها و گیت‌ها               |
| Editorial Role Model            | نقش‌های تحریریه — مسئولیت‌ها و اختیارات        |
| Editorial Decision Model        | مدل تصمیمات تحریریه — انواع و سطوح             |
| Editorial Metrics               | ۱۵ معیار تحریریه                               |
| Editorial Concepts              | ۲۰ مفهوم بنیادین تحریریه                       |
| Editorial Entities              | ۱۲ موجودیت تحریریه                             |
| Editorial Capabilities          | ۱۴ قابلیت تحریریه                              |
| Editorial Functions             | ۱۴ کارکرد تحریریه                              |
| Editorial Domains               | ۸ دامنه تحریریه                                |
| Editorial State Model           | ۸ وضعیت تحریریه                                |
| Editorial Principles            | ۸ اصل تحریریه                                  |
| Editorial Constraints           | ۸ محدودیت تحریریه                              |
| Editorial Quality Gates         | ۷ گیت کیفیت                                    |

### Outside Scope

| حوزه                       | دلیل                          |
| -------------------------- | ----------------------------- |
| استراتژی بازاریابی         | خارج از معماری — حوزه عملیاتی |
| کمپین‌های تبلیغاتی         | خارج از معماری — حوزه اجرایی  |
| تقویم تحریریه اجرایی       | حوزه اجرایی — خارج از معماری  |
| کپی‌رایتینگ و تولید متن    | حوزه اجرایی — تولید محتوا     |
| مثال‌های محتوای واقعی      | خارج از مرز معماری            |
| ابزارهای مدیریت محتوا      | خنثی‌بودن فناوری              |
| محصولات و Vendorها         | خنثی‌بودن فناوری              |
| SEO و تکنیک‌های بهینه‌سازی | حوزه اجرایی خارج از معماری    |

---

## 3. Editorial Principles

| ID     | اصل                         | توضیح                                                                                               |
| ------ | --------------------------- | --------------------------------------------------------------------------------------------------- |
| EDP-01 | **تحریریه تابع محتوا**      | معماری تحریریه از معماری محتوا مشتق می‌شود — محتوا تعیین می‌کند که تحریریه چگونه برنامه‌ریزی می‌شود |
| EDP-02 | **توالی مبتنی بر وابستگی**  | هر محتوا در یک توالی مبتنی بر وابستگی به محتواهای دیگر قرار می‌گیرد                                 |
| EDP-03 | **تصمیم مبتنی بر معیار**    | همه تصمیمات تحریریه باید بر اساس معیارهای معماری قابل اندازه‌گیری باشند                             |
| EDP-04 | **جداسازی معماری از اجرا**  | معماری تحریریه از برنامه‌ریزی و اجرای روزانه جدا تعریف می‌شود                                       |
| EDP-05 | **خنثی بودن پلتفرمی**       | معماری تحریریه مستقل از پلتفرم انتشار تعریف می‌شود                                                  |
| EDP-06 | **هماهنگی بین‌پلتفرمی**     | تحریریه باید توزیع محتوا را در پلتفرم‌های مختلف هماهنگ کند                                          |
| EDP-07 | **تکامل کنترل‌شده**         | تغییر در معماری تحریریه تابع فرآیند حکمرانی مشخص است                                                |
| EDP-08 | **مصرف توسط انسان و Agent** | معماری تحریریه باید برای انسان و Agent هوشمند قابل تفسیر باشد                                       |

---

## 4. Editorial Philosophy

### فلسفه تحریریه سازمانی

SMOS تحریریه سازمانی را به عنوان **عامل هماهنگ‌کننده محتوا در زمان و مکان** می‌بیند که:

1. **برنامه‌ریز است** — تعیین می‌کند چه محتوایی در چه زمانی تولید و منتشر شود
2. **توالی‌بند است** — ترتیب و وابستگی بین محتواها را مشخص می‌کند
3. **هماهنگ‌کننده است** — توزیع محتوا را در پلتفرم‌های مختلف هماهنگ می‌کند
4. **معیارمحور است** — همه تصمیمات بر اساس معیارهای قابل اندازه‌گیری اتخاذ می‌شوند
5. **ردیابی‌پذیر است** — از تصمیم تا انتشار قابل ردیابی است
6. **تک منبع دارد** — هر تصمیم تحریریه یک مبنا و مبدأ مشخص دارد

### هستی‌شناسی تحریریه

تحریریه سازمانی در SMOS دارای سه لایه هستی‌شناختی است:

| لایه                   | توضیح                                  | مثال                                             |
| ---------------------- | -------------------------------------- | ------------------------------------------------ |
| Strategy (استراتژی)    | اصول و معماری تغییرناپذیر تحریریه      | Editorial Principles, Governance, Priority Model |
| Planning (برنامه‌ریزی) | ساختار برنامه‌ریزی — قابل تکامل        | Editorial Calendar Model, Sequencing, Workflow   |
| Execution (اجرا)       | نحوه ظهور تصمیمات تحریریه — قابل تطبیق | Assignment, Schedule, Publication Coordination   |

---

## 5. Enterprise Editorial Model

### مدل تحریریه سازمانی

تحریریه سازمانی SMOS از چهار لایه تشکیل شده است:

| لایه                   | شناسه  | توضیح                                    | وابستگی    |
| ---------------------- | ------ | ---------------------------------------- | ---------- |
| Editorial Strategy     | EDM-01 | استراتژی تحریریه — اصول و معماری تصمیمات | EDP-01..08 |
| Editorial Planning     | EDM-02 | برنامه‌ریزی تحریریه — ساختار و توالی     | EDM-01     |
| Editorial Coordination | EDM-03 | هماهنگی تحریریه — توزیع و تطبیق پلتفرمی  | EDM-02     |
| Editorial Execution    | EDM-04 | اجرای تحریریه — تخصیص و زمان‌بندی        | EDM-03     |

### اصول مدل تحریریه

1. Editorial Strategy تنها لایه غیرقابل تغییر است — تغییر آن نیازمند ADR سطح A-4 است
2. Editorial Planning در بازه‌های راهبردی قابل بازبینی است
3. Editorial Coordination بر اساس پلتفرم‌های هدف قابل تنظیم است
4. Editorial Execution تابع قواعد Editorial Strategy و Editorial Planning است
5. لایه‌های پایین‌دستی باید با لایه‌های بالادستی سازگار باشند

---

## 6. Editorial Domains

| شناسه  | دامنه                    | توضیح                                                      |
| ------ | ------------------------ | ---------------------------------------------------------- |
| EDD-01 | Editorial Planning       | برنامه‌ریزی تحریریه — ساختار برنامه‌ریزی محتوا در طول زمان |
| EDD-02 | Content Sequencing       | توالی محتوا — ترتیب و وابستگی بین محتواها                  |
| EDD-03 | Editorial Workflow       | گردش کار تحریریه — مراحل از ایده تا انتشار                 |
| EDD-04 | Editorial Governance     | حکمرانی تحریریه — قواعد و سیاست‌های تحریریه                |
| EDD-05 | Content Hierarchy        | سلسله‌مراتب محتوا — اولویت، قدرت و روابط محتوا             |
| EDD-06 | Editorial Consistency    | سازگاری تحریریه — یکپارچگی در تصمیمات تحریریه              |
| EDD-07 | Multi-Platform Editorial | تحریریه چندپلتفرمی — هماهنگی در پلتفرم‌های مختلف           |
| EDD-08 | Editorial Quality        | کیفیت تحریریه — معیارها و گیت‌های کیفی تحریریه             |

---

## 7. Editorial Concepts

| شناسه   | مفهوم                       | توضیح                                                        | دامنه  |
| ------- | --------------------------- | ------------------------------------------------------------ | ------ |
| EDC-001 | Editorial Plan              | برنامه تحریریه — ساختار کلان برنامه‌ریزی محتوا در بازه زمانی | EDD-01 |
| EDC-002 | Editorial Calendar          | تقویم تحریریه — توزیع محتوا در زمان                          | EDD-01 |
| EDC-003 | Content Sequence            | توالی محتوا — ترتیب منطقی محتواها بر اساس وابستگی            | EDD-02 |
| EDC-004 | Editorial Workflow          | گردش کار تحریریه — مراحل از ایده تا انتشار                   | EDD-03 |
| EDC-005 | Content Priority            | اولویت محتوا — سطح اهمیت یک محتوا در برنامه تحریریه          | EDD-05 |
| EDC-006 | Editorial Role              | نقش تحریریه — مسئولیت و اختیار در فرآیند تحریریه             | EDD-04 |
| EDC-007 | Editorial Decision          | تصمیم تحریریه — انتخاب آگاهانه در مورد محتوا                 | EDD-04 |
| EDC-008 | Content Pipeline            | خط لوله محتوا — جریان محتوا از ایده تا انتشار                | EDD-03 |
| EDC-009 | Editorial Gate              | گیت تحریریه — نقطه تصمیم در گردش کار تحریریه                 | EDD-03 |
| EDC-010 | Editorial Policy            | سیاست تحریریه — قاعده کلی حاکم بر تصمیمات تحریریه            | EDD-04 |
| EDC-011 | Content Assignment          | تخصیص محتوا — انتساب محتوا به نقش یا عامل                    | EDD-03 |
| EDC-012 | Editorial Review            | بازبینی تحریریه — ارزیابی تصمیمات تحریریه                    | EDD-08 |
| EDC-013 | Publication Schedule        | زمان‌بندی انتشار — تعیین زمان دقیق انتشار                    | EDD-01 |
| EDC-014 | Editorial Consistency       | سازگاری تحریریه — یکپارچگی در همه تصمیمات تحریریه            | EDD-06 |
| EDC-015 | Cross-Platform Coordination | هماهنگی بین‌پلتفرمی — توزیع هماهنگ محتوا در پلتفرم‌ها        | EDD-07 |
| EDC-016 | Editorial Metric            | معیار تحریریه — شاخص اندازه‌گیری عملکرد تحریریه              | EDD-08 |
| EDC-017 | Editorial Governance        | حکمرانی تحریریه — نظام قواعد و سیاست‌های تحریریه             | EDD-04 |
| EDC-018 | Content Lifecycle Editorial | چرخه حیات تحریریه — مراحل تحریریه از ایده تا بایگانی         | EDD-03 |
| EDC-019 | Editorial Template          | الگوی تحریریه — ساختار تکراری برای برنامه‌ریزی محتوا         | EDD-01 |
| EDC-020 | Editorial Quality           | کیفیت تحریریه — سطح انطباق با معیارهای معماری تحریریه        | EDD-08 |

---

## 8. Editorial Entities

| شناسه   | موجودیت              | نوع      | توضیح                                          | دامنه  |
| ------- | -------------------- | -------- | ---------------------------------------------- | ------ |
| EDE-001 | Editorial Plan       | Core     | برنامه تحریریه — ساختار کلان برنامه‌ریزی محتوا | EDD-01 |
| EDE-002 | Editorial Calendar   | Core     | تقویم تحریریه — توزیع محتوا در بازه زمانی      | EDD-01 |
| EDE-003 | Content Sequence     | Temporal | توالی محتوا — ترتیب و وابستگی محتواها          | EDD-02 |
| EDE-004 | Editorial Workflow   | Core     | گردش کار تحریریه — مراحل استاندارد تحریریه     | EDD-03 |
| EDE-005 | Content Assignment   | Temporal | تخصیص محتوا — انتساب به نقش یا Agent           | EDD-03 |
| EDE-006 | Editorial Decision   | Core     | تصمیم تحریریه — انتخاب بر اساس معیارها         | EDD-04 |
| EDE-007 | Editorial Gate       | Core     | گیت تحریریه — نقطه تصمیم با معیار عبور         | EDD-03 |
| EDE-008 | Editorial Policy     | Core     | سیاست تحریریه — قاعده کلی تصمیم‌گیری           | EDD-04 |
| EDE-009 | Editorial Role       | Core     | نقش تحریریه — مسئولیت و سطح اختیار             | EDD-04 |
| EDE-010 | Publication Schedule | Temporal | زمان‌بندی انتشار — زمان دقیق هر انتشار         | EDD-01 |
| EDE-011 | Editorial Metric     | Core     | معیار تحریریه — شاخص عملکرد تحریریه            | EDD-08 |
| EDE-012 | Editorial Review     | Temporal | بازبینی تحریریه — ارزیابی و اعتبارسنجی تصمیمات | EDD-08 |

---

## 9. Editorial Attributes

| شناسه  | ویژگی                    | توضیح                                       | موجودیت مرتبط |
| ------ | ------------------------ | ------------------------------------------- | ------------- |
| EDA-01 | Timeliness               | به‌موقع بودن — رعایت زمان‌بندی تحریریه      | EDE-001       |
| EDA-02 | Priority Accuracy        | دقت اولویت — تطابق با معیارهای اولویت‌بندی  | EDE-001       |
| EDA-03 | Sequence Consistency     | سازگاری توالی — رعایت وابستگی‌های محتوا     | EDE-003       |
| EDA-04 | Workflow Compliance      | انطباق گردش کار — رعایت مراحل تحریریه       | EDE-004       |
| EDA-05 | Decision Traceability    | ردیابی تصمیم — قابلیت ردیابی به مبدأ تصمیم  | EDE-006       |
| EDA-06 | Governance Conformance   | انطباق حکمرانی — رعایت قواعد و سیاست‌ها     | EDE-008       |
| EDA-07 | Cross-Platform Alignment | هماهنگی بین‌پلتفرمی — یکپارچگی در پلتفرم‌ها | EDE-001       |
| EDA-08 | Metric Completeness      | تکمیل معیار — پوشش همه معیارهای کیفی        | EDE-011       |

---

## 10. Editorial Capabilities

| شناسه     | قابلیت                                | توضیح                                       | لایه      |
| --------- | ------------------------------------- | ------------------------------------------- | --------- |
| EDCAP-001 | Editorial Plan Definition             | تعریف برنامه تحریریه بر اساس استراتژی محتوا | Strategy  |
| EDCAP-002 | Editorial Calendar Design             | طراحی تقویم تحریریه — توزیع محتوا در زمان   | Planning  |
| EDCAP-003 | Content Sequence Management           | مدیریت توالی و وابستگی محتواها              | Planning  |
| EDCAP-004 | Editorial Workflow Design             | طراحی گردش کار تحریریه — مراحل و گیت‌ها     | Strategy  |
| EDCAP-005 | Content Priority Assignment           | تعیین اولویت محتوا بر اساس معیارها          | Planning  |
| EDCAP-006 | Editorial Decision Execution          | اجرای تصمیمات تحریریه مبتنی بر معیار        | Execution |
| EDCAP-007 | Editorial Governance Enforcement      | اعمال قواعد حکمرانی بر تصمیمات تحریریه      | Strategy  |
| EDCAP-008 | Content Assignment Management         | مدیریت تخصیص محتوا به نقش‌ها و Agentها      | Execution |
| EDCAP-009 | Editorial Gate Management             | مدیریت گیت‌های تحریریه — نقاط تصمیم         | Planning  |
| EDCAP-010 | Cross-Platform Editorial Coordination | هماهنگی تحریریه در پلتفرم‌های مختلف         | Execution |
| EDCAP-011 | Editorial Quality Assessment          | ارزیابی کیفیت تحریریه                       | Strategy  |
| EDCAP-012 | Editorial Consistency Verification    | تأیید سازگاری تصمیمات تحریریه               | Planning  |
| EDCAP-013 | Editorial Review Execution            | اجرای بازبینی تحریریه                       | Execution |
| EDCAP-014 | Editorial Evolution Management        | مدیریت تکامل معماری تحریریه                 | Strategy  |

---

## 11. Editorial Functions

| شناسه  | کارکرد                              | توضیح                                       | قابلیت مرتبط |
| ------ | ----------------------------------- | ------------------------------------------- | ------------ |
| EDF-01 | Define Editorial Plan               | تعریف برنامه تحریریه بر اساس استراتژی محتوا | EDCAP-001    |
| EDF-02 | Design Editorial Calendar           | طراحی تقویم تحریریه                         | EDCAP-002    |
| EDF-03 | Manage Content Sequence             | مدیریت توالی و وابستگی محتواها              | EDCAP-003    |
| EDF-04 | Design Editorial Workflow           | طراحی گردش کار تحریریه                      | EDCAP-004    |
| EDF-05 | Assign Content Priority             | تعیین اولویت محتوا                          | EDCAP-005    |
| EDF-06 | Execute Editorial Decision          | اجرای تصمیم تحریریه                         | EDCAP-006    |
| EDF-07 | Enforce Editorial Governance        | اعمال قواعد حکمرانی تحریریه                 | EDCAP-007    |
| EDF-08 | Manage Content Assignment           | مدیریت تخصیص محتوا                          | EDCAP-008    |
| EDF-09 | Manage Editorial Gate               | مدیریت گیت‌های تحریریه                      | EDCAP-009    |
| EDF-10 | Coordinate Cross-Platform Editorial | هماهنگی تحریریه بین پلتفرم‌ها               | EDCAP-010    |
| EDF-11 | Assess Editorial Quality            | ارزیابی کیفیت تحریریه                       | EDCAP-011    |
| EDF-12 | Verify Editorial Consistency        | تأیید سازگاری تحریریه                       | EDCAP-012    |
| EDF-13 | Execute Editorial Review            | اجرای بازبینی تحریریه                       | EDCAP-013    |
| EDF-14 | Manage Editorial Evolution          | مدیریت تکامل معماری تحریریه                 | EDCAP-014    |

---

## 12. Editorial Taxonomy

### طبقه‌بندی تحریریه سازمانی

تحریریه سازمانی SMOS در سه سطح طبقه‌بندی می‌شود:

| سطح         | شناسه                  | توضیح                                                    | دامنه‌ها |
| ----------- | ---------------------- | -------------------------------------------------------- | -------- |
| Core        | EDD-04, EDD-05         | حکمرانی و سلسله‌مراتب — اصول و قواعد تغییرناپذیر تحریریه |
| Planning    | EDD-01, EDD-02, EDD-03 | برنامه‌ریزی، توالی، گردش کار — ساختار تحریریه            |
| Operational | EDD-06, EDD-07, EDD-08 | سازگاری، چندپلتفرمی، کیفیت — عملیات تحریریه              |

### اصول طبقه‌بندی

1. هر مفهوم تحریریه دقیقاً در یک دامنه طبقه‌بندی می‌شود
2. دامنه‌های Core قواعد همه دامنه‌ها را تعیین می‌کنند
3. دامنه‌های Planning از Core تبعیت می‌کنند اما ساختار برنامه‌ریزی را تعریف می‌کنند
4. دامنه‌های Operational قواعد اجرا و هماهنگی را تعریف می‌کنند

---

## 13. Editorial State Model

| شناسه  | وضعیت                 | توضیح                                             | مجوز انتقال      |
| ------ | --------------------- | ------------------------------------------------- | ---------------- |
| EDS-01 | Planned               | برنامه‌ریزی‌شده — محتوا در برنامه تحریریه ثبت شده | → EDS-02         |
| EDS-02 | Scheduled             | زمان‌بندی‌شده — زمان دقیق انتشار تعیین شده        | → EDS-03         |
| EDS-03 | In Pipeline           | در خط لوله — محتوا در حال تولید یا بازبینی        | → EDS-04, EDS-07 |
| EDS-04 | Ready for Publication | آماده انتشار — همه گیت‌های تحریریه عبور کرده‌اند  | → EDS-05         |
| EDS-05 | Published             | منتشرشده — محتوا در پلتفرم هدف منتشر شده          | → EDS-06         |
| EDS-06 | Completed             | تکمیل‌شده — چرخه تحریریه کامل شده                 | → EDS-07         |
| EDS-07 | Rescheduled           | زمان‌بندی مجدد — محتوا به زمان دیگری منتقل شد     | → EDS-02         |
| EDS-08 | Removed               | حذف‌شده — از برنامه تحریریه حذف گردید             | → EDS-01         |

### انتقال‌های مجاز

| از     | به     | شرط                         |
| ------ | ------ | --------------------------- |
| EDS-01 | EDS-02 | تکمیل اطلاعات زمان‌بندی     |
| EDS-02 | EDS-03 | شروع فرآیند تولید محتوا     |
| EDS-03 | EDS-04 | عبور از همه گیت‌های تحریریه |
| EDS-03 | EDS-07 | تصمیم به تغییر زمان‌بندی    |
| EDS-04 | EDS-05 | انتشار در پلتفرم هدف        |
| EDS-05 | EDS-06 | تکمیل چرخه انتشار           |
| EDS-06 | EDS-07 | تصمیم به بازنشر یا تکرار    |
| EDS-07 | EDS-02 | زمان‌بندی مجدد              |
| EDS-07 | EDS-08 | تصمیم به حذف از برنامه      |
| EDS-08 | EDS-01 | بازگشت به برنامه‌ریزی       |

---

## 14. Editorial Lifecycle Model

| شناسه   | مرحله       | توضیح                                       | معیار خروج                  |
| ------- | ----------- | ------------------------------------------- | --------------------------- |
| EDST-01 | Planning    | برنامه‌ریزی — تعریف محتوا در برنامه تحریریه | ثبت در Editorial Plan       |
| EDST-02 | Scheduling  | زمان‌بندی — تعیین زمان دقیق انتشار          | اختصاص Publication Schedule |
| EDST-03 | Production  | تولید — عبور محتوا از گردش کار تحریریه      | عبور از Editorial Gates     |
| EDST-04 | Gate Review | بازبینی گیت — ارزیابی در گیت‌های تحریریه    | تأیید توسط Editorial Role   |
| EDST-05 | Publication | انتشار — تحویل به کانال توزیع               | انتشار در پلتفرم هدف        |
| EDST-06 | Completion  | تکمیل — پایان چرخه تحریریه                  | ثبت وضعیت Completed         |
| EDST-07 | Evaluation  | ارزیابی — بازبینی پس از انتشار              | تکمیل Editorial Review      |
| EDST-08 | Closure     | بسته شدن — پایان کامل چرخه                  | بایگانی یا حذف از برنامه    |

---

## 15. Editorial Governance Model

### مدل حکمرانی تحریریه

حکمرانی تحریریه SMOS بر اساس سطوح اختیار (A-0 تا A-4) تعریف می‌شود:

| سطح | عنوان                | اختیارات                             | مثال             |
| --- | -------------------- | ------------------------------------ | ---------------- |
| A-0 | بدون دسترسی          | فقط خواندن برنامه تحریریه            | مصرف‌کننده نهایی |
| A-1 | مصرف‌کننده تحریریه   | استفاده از برنامه تحریریه در تصمیمات | AI-003, AI-008   |
| A-2 | مشارکت‌کننده تحریریه | پیشنهاد محتوا برای برنامه تحریریه    | AI-001, AI-002   |
| A-3 | برنامه‌ریز تحریریه   | ایجاد و ویرایش برنامه تحریریه        | معمار تحریریه    |
| A-4 | مالک تحریریه         | تصویب، تغییر در معماری تحریریه       | مدیر تحریریه     |

### انواع تصمیمات حکمرانی

| نوع         | توضیح                          | سطح اختیار |
| ----------- | ------------------------------ | ---------- |
| تعریف       | ایجاد الگوی تحریریه جدید       | A-4        |
| برنامه‌ریزی | افزودن محتوا به برنامه تحریریه | A-3        |
| زمان‌بندی   | تعیین زمان انتشار              | A-3        |
| تخصیص       | انتساب محتوا به نقش یا Agent   | A-3        |
| تصویب       | تأیید نهایی برنامه تحریریه     | A-4        |
| بازبینی     | ارزیابی تصمیمات تحریریه        | A-3        |
| حذف         | حذف محتوا از برنامه تحریریه    | A-4        |

---

## 16. Editorial Consistency Model

### مدل سازگاری تحریریه

سازگاری تحریریه در SMOS در چهار بعد تعریف می‌شود:

| بعد                        | توضیح                                         | معیار                                      |
| -------------------------- | --------------------------------------------- | ------------------------------------------ |
| Vertical Consistency       | سازگاری عمودی — هماهنگی استراتژی تا اجرا      | همه لایه‌ها با Editorial Strategy سازگارند |
| Horizontal Consistency     | سازگاری افقی — یکپارچگی در همه دامنه‌ها       | یک تحریریه در همه دامنه‌ها                 |
| Temporal Consistency       | سازگاری زمانی — ثبات در طول زمان              | تغییرات تابع حکمرانی                       |
| Cross-Platform Consistency | سازگاری بین‌پلتفرمی — هماهنگی در همه کانال‌ها | یک برنامه تحریریه در همه پلتفرم‌ها         |

### قواعد سازگاری

| ID     | قاعده                           | توضیح                                                     |
| ------ | ------------------------------- | --------------------------------------------------------- |
| ECR-01 | استراتژی تحریریه مقدم بر برنامه | هیچ برنامه‌ای نباید با Editorial Strategy تضاد داشته باشد |
| ECR-02 | ثبات در همه دامنه‌ها            | اصول تحریریه در همه دامنه‌ها یکسان است                    |
| ECR-03 | توالی تابع وابستگی              | ترتیب محتوا باید مبتنی بر وابستگی‌های تعریف‌شده باشد      |
| ECR-04 | تغییر تابع فرآیند               | هیچ تغییری بدون طی کردن حکمرانی مجاز نیست                 |

---

## 17. Editorial Validation Model

### مدل اعتبارسنجی تحریریه

اعتبارسنجی تحریریه در چهار سطح انجام می‌شود:

| سطح | نوع اعتبارسنجی         | توضیح                                 | مجری          |
| --- | ---------------------- | ------------------------------------- | ------------- |
| L1  | Structural Validation  | بررسی انطباق با معماری تحریریه        | AI-004        |
| L2  | Consistency Validation | بررسی سازگاری با سایر تصمیمات تحریریه | AI-004        |
| L3  | Governance Validation  | بررسی انطباق با قواعد حکمرانی         | AI-004        |
| L4  | Quality Validation     | بررسی عبور از گیت‌های کیفیت تحریریه   | معمار تحریریه |

### قواعد اعتبارسنجی

| ID     | قاعده                                               | توضیح |
| ------ | --------------------------------------------------- | ----- |
| EVR-01 | هر تصمیم تحریریه باید قبل از اجرا اعتبارسنجی شود    |
| EVR-02 | اعتبارسنجی L1 و L2 برای همه تصمیمات الزامی است      |
| EVR-03 | اعتبارسنجی L3 برای تصمیمات با تأثیر بالا الزامی است |
| EVR-04 | نتیجه اعتبارسنجی باید قابل ردیابی و مستند باشد      |
| EVR-05 | عدم انطباق باید به سطح اختیار مناسب ارجاع شود       |

---

## 18. Editorial Metrics Model

| شناسه  | معیار                    | توضیح                                             | دامنه  | واحد  |
| ------ | ------------------------ | ------------------------------------------------- | ------ | ----- |
| EDM-01 | Planning Completeness    | تکمیل برنامه‌ریزی — درصد محتواهای برنامه‌ریزی‌شده | EDD-01 | درصد  |
| EDM-02 | Schedule Adherence       | انطباق با زمان‌بندی — درصد انتشار به‌موقع         | EDD-01 | درصد  |
| EDM-03 | Sequence Consistency     | سازگاری توالی — درصد رعایت وابستگی‌ها             | EDD-02 | درصد  |
| EDM-04 | Workflow Compliance      | انطباق گردش کار — درصد عبور از مراحل              | EDD-03 | درصد  |
| EDM-05 | Governance Compliance    | انطباق حکمرانی — درصد رعایت قواعد                 | EDD-04 | درصد  |
| EDM-06 | Priority Accuracy        | دقت اولویت — درصد تطابق با معیارها                | EDD-05 | درصد  |
| EDM-07 | Consistency Score        | امتیاز سازگاری — میزان یکپارچگی تحریریه           | EDD-06 | ۰-۱۰۰ |
| EDM-08 | Cross-Platform Alignment | هماهنگی بین‌پلتفرمی — درصد هماهنگی                | EDD-07 | درصد  |
| EDM-09 | Gate Pass Rate           | نرخ عبور از گیت — درصد عبور موفق                  | EDD-03 | درصد  |
| EDM-10 | Pipeline Velocity        | سرعت خط لوله — میانگین زمان از برنامه تا انتشار   | EDD-03 | روز   |
| EDM-11 | Review Coverage          | پوشش بازبینی — درصد محتواهای بازبینی‌شده          | EDD-08 | درصد  |
| EDM-12 | Decision Traceability    | ردیابی تصمیم — درصد تصمیمات قابل ردیابی           | EDD-04 | درصد  |
| EDM-13 | Assignment Efficiency    | کارایی تخصیص — درصد تخصیص‌های موفق                | EDD-03 | درصد  |
| EDM-14 | Editorial Quality Index  | شاخص کیفیت تحریریه — میانگین معیارها              | EDD-08 | ۰-۱۰۰ |
| EDM-15 | Evolution Stability      | پایداری تکامل — درصد تغییرات غیربرگشتی            | EDD-04 | درصد  |

---

## 19. Editorial Registry Model

### مدل ثبت تحریریه

همه مؤلفه‌های تحریریه سازمانی باید در نمایه مرکزی ثبت شوند:

| فیلد         | توضیح                                                    | الزامی  |
| ------------ | -------------------------------------------------------- | ------- |
| Editorial ID | شناسه یکتای مؤلفه تحریریه                                | ✅      |
| Name         | نام مؤلفه                                                | ✅      |
| Type         | نوع مؤلفه (Plan, Calendar, Workflow, Gate, Policy, Role) | ✅      |
| Domain       | دامنه تحریریه                                            | ✅      |
| Status       | وضعیت در State Model                                     | ✅      |
| Version      | نسخه فعلی                                                | ✅      |
| Owner        | مالک مؤلفه                                               | ✅      |
| Created      | تاریخ ایجاد                                              | ✅      |
| Updated      | آخرین به‌روزرسانی                                        | ✅      |
| Dependencies | وابستگی به سایر مؤلفه‌ها                                 | اختیاری |

---

## 20. Editorial Constraint Model

| شناسه    | محدودیت                                     | توضیح                                                          | دامنه  |
| -------- | ------------------------------------------- | -------------------------------------------------------------- | ------ |
| EDCST-01 | استراتژی تحریریه غیرقابل تغییر بدون ADR A-4 | تغییر در Editorial Strategy نیازمند بالاترین سطح اختیار        | EDD-04 |
| EDCST-02 | برنامه تابع استراتژی                        | هیچ برنامه‌ای نمی‌تواند از Editorial Strategy خارج شود         | EDD-01 |
| EDCST-03 | تصمیم مبتنی بر معیار                        | همه تصمیمات تحریریه باید بر اساس معیارهای معماری باشند         | EDD-04 |
| EDCST-04 | توالی مبتنی بر وابستگی                      | ترتیب محتوا باید مبتنی بر وابستگی‌های تعریف‌شده باشد           | EDD-02 |
| EDCST-05 | حکمرانی بر همه الزامی                       | قواعد حکمرانی برای انسان و Agent یکسان است                     | EDD-04 |
| EDCST-06 | اعتبارسنجی قبل از اجرا                      | هیچ تصمیم تحریریه‌ای بدون اعتبارسنجی اجرا نمی‌شود              | EDD-03 |
| EDCST-07 | عدم تغییر پس از انتشار                      | برنامه تحریریه منتشرشده تغییر نمی‌کند — نسخه جدید ایجاد می‌شود | EDD-01 |
| EDCST-08 | Registry Entry الزامی                       | هر مؤلفه تحریریه باید در نمایه ثبت شود                         | EDD-04 |

---

## 21. Editorial Quality Gates

| ID      | گیت                        | معیار                                      | دامنه  |
| ------- | -------------------------- | ------------------------------------------ | ------ |
| EDQG-01 | Plan Completeness          | همه مؤلفه‌های برنامه تحریریه تعریف شده‌اند | EDD-01 |
| EDQG-02 | Schedule Validity          | زمان‌بندی با برنامه تحریریه سازگار است     | EDD-01 |
| EDQG-03 | Sequence Consistency       | توالی محتوا مبتنی بر وابستگی‌ها است        | EDD-02 |
| EDQG-04 | Governance Compliance      | همه قواعد حکمرانی رعایت شده‌اند            | EDD-04 |
| EDQG-05 | Validation Completeness    | همه تصمیمات تحریریه اعتبارسنجی شده‌اند     | EDD-03 |
| EDQG-06 | Registry Completeness      | همه مؤلفه‌ها در نمایه ثبت شده‌اند          | EDD-04 |
| EDQG-07 | Cross-Family Compatibility | تحریریه با COM-001 و COM-002 سازگار است    | EDD-06 |

---

## 22. Editorial Evolution Model

### مدل تکامل تحریریه

تکامل تحریریه سازمانی در SMOS تابع یک فرآیند ۵ مرحله‌ای است:

| مرحله                   | توضیح                                 | مجری |
| ----------------------- | ------------------------------------- | ---- |
| 1. Proposal             | ارائه پیشنهاد تغییر در معماری تحریریه | A-2+ |
| 2. Impact Assessment    | ارزیابی تأثیر بر محتواها و برنامه‌ها  | A-3  |
| 3. Approval             | تصویب تغییر توسط مالک تحریریه         | A-4  |
| 4. Implementation       | اجرای تغییر در معماری و نمایه         | A-3  |
| 5. Institutionalization | نهادینه‌سازی در سیستم تحریریه         | A-3  |

### انواع تغییر

| نوع       | توضیح                                  | سطح تأثیر           |
| --------- | -------------------------------------- | ------------------- |
| Patch     | اصلاح جزئی — بدون تغییر معنا یا ساختار | EDD-06+             |
| Minor     | تغییر در برنامه یا زمان‌بندی تحریریه   | EDD-01, EDD-02      |
| Major     | تغییر در گردش کار یا گیت‌های تحریریه   | EDD-03, EDD-04      |
| Strategic | تغییر در Editorial Strategy یا اصول    | EDD-04 (فوق‌العاده) |

---

## 23. Editorial Relationship Model

| شناسه  | رابطه       | مبدأ                        | مقصد                 | نوع            | توضیح                                |
| ------ | ----------- | --------------------------- | -------------------- | -------------- | ------------------------------------ |
| EDR-01 | governs     | Editorial Plan              | Content Sequence     | Governance     | برنامه تحریریه توالی را هدایت می‌کند |
| EDR-02 | sequences   | Content Sequence            | Content Asset        | Sequencing     | توالی محتوا را مرتب می‌کند           |
| EDR-03 | routes      | Editorial Workflow          | Content Assignment   | Routing        | گردش کار تخصیص را هدایت می‌کند       |
| EDR-04 | decides     | Editorial Decision          | Editorial Plan       | Decision       | تصمیم برنامه را تعیین می‌کند         |
| EDR-05 | gates       | Editorial Gate              | Editorial Workflow   | Gating         | گیت گردش کار را کنترل می‌کند         |
| EDR-06 | prioritizes | Content Priority            | Editorial Plan       | Prioritization | اولویت برنامه را تعیین می‌کند        |
| EDR-07 | validates   | Editorial Review            | Editorial Decision   | Validation     | بازبینی تصمیم را اعتبارسنجی می‌کند   |
| EDR-08 | schedules   | Publication Schedule        | Editorial Calendar   | Scheduling     | زمان‌بندی تقویم را تعیین می‌کند      |
| EDR-09 | measures    | Editorial Metric            | Editorial Quality    | Measurement    | معیار کیفیت را اندازه می‌گیرد        |
| EDR-10 | coordinates | Cross-Platform Coordination | Publication Schedule | Coordination   | هماهنگی زمان‌بندی را مدیریت می‌کند   |

---

## 24. Editorial Hierarchy Model

### سلسله‌مراتب تحریریه

تحریریه سازمانی SMOS دارای سلسله‌مراتب زیر است:

```
Editorial Registry
    │
    ├── Editorial Plan (EDE-001)
    │       │
    │       ├── Editorial Calendar (EDE-002)
    │       ├── Content Sequence (EDE-003)
    │       │
    │       ├── Editorial Workflow (EDE-004)
    │       ├── Content Assignment (EDE-005)
    │       │
    │       ├── Editorial Decision (EDE-006)
    │       ├── Editorial Gate (EDE-007)
    │       │
    │       ├── Editorial Policy (EDE-008)
    │       ├── Editorial Role (EDE-009)
    │       │
    │       ├── Publication Schedule (EDE-010)
    │       ├── Editorial Metric (EDE-011)
    │       │
    │       └── Editorial Review (EDE-012)
```

### اصول سلسله‌مراتب

1. هر موجودیت دقیقاً یک والد دارد (به جز Registry به عنوان ریشه)
2. موجودیت‌های Strategy (Plan, Calendar, Sequence) در بالاترین سطح
3. موجودیت‌های Workflow (Workflow, Assignment, Decision, Gate, Policy, Role) در سطح میانی
4. موجودیت‌های Operational (Schedule, Metric, Review) در سطح پایینی

---

## 25. Naming Rules

| الگو                        | شناسه          | مثال      |
| --------------------------- | -------------- | --------- |
| Editorial Concepts          | EDC-[0-9]{3}   | EDC-001   |
| Editorial Entities          | EDE-[0-9]{3}   | EDE-001   |
| Editorial Attributes        | EDA-[0-9]{2}   | EDA-01    |
| Editorial Capabilities      | EDCAP-[0-9]{3} | EDCAP-001 |
| Editorial Functions         | EDF-[0-9]{2}   | EDF-01    |
| Editorial Domains           | EDD-[0-9]{2}   | EDD-01    |
| Editorial States            | EDS-[0-9]{2}   | EDS-01    |
| Editorial Stages            | EDST-[0-9]{2}  | EDST-01   |
| Editorial Relationships     | EDR-[0-9]{2}   | EDR-01    |
| Editorial Metrics           | EDM-[0-9]{2}   | EDM-01    |
| Editorial Principles        | EDP-[0-9]{2}   | EDP-01    |
| Editorial Constraints       | EDCST-[0-9]{2} | EDCST-01  |
| Editorial Quality Gates     | EDQG-[0-9]{2}  | EDQG-01   |
| Editorial Consistency Rules | ECR-[0-9]{2}   | ECR-01    |
| Editorial Validation Rules  | EVR-[0-9]{2}   | EVR-01    |

---

## 26. Cross References

### ارجاع به سایر معماری‌ها و دانش

| خانواده                    | سند     | ارجاع به COM                             |
| -------------------------- | ------- | ---------------------------------------- |
| Knowledge Architecture     | KNW-000 | معماری مادر دانش                         |
| Knowledge Index            | KNW-001 | نمایه مرکزی دانش                         |
| AI Meta Architecture       | KNW-510 | متا معماری دانش                          |
| Brand Knowledge            | KNW-701 | هویت برند — منبع هویت تحریریه            |
| Reference Knowledge        | KNW-801 | طبقه‌بندی‌ها و شناسه‌های مرجع            |
| Communication Architecture | COM-001 | معماری محتوا — ساختار محتوا برای تحریریه |
| Brand Voice Architecture   | COM-002 | معماری صدای برند — لحن برای تحریریه      |
| Content Strategy Agent     | AI-001  | عامل استراتژی محتوا — مصرف‌کننده تحریریه |
| Content Planning Agent     | AI-002  | عامل برنامه‌ریزی محتوا — مصرف‌کننده اصلی |
| Content Production Agent   | AI-003  | عامل تولید محتوا — اجراکننده تحریریه     |
| Publishing Agent           | AI-008  | عامل انتشار — مصرف‌کننده زمان‌بندی       |
| Enterprise Orchestrator    | AI-014  | هماهنگ‌ساز — مصرف‌کننده تصمیمات تحریریه  |
| Automation                 | AUT-\*  | خودکارسازی — مصرف‌کننده برنامه تحریریه   |

---

## 27. Machine Readable JSON Blocks

### Block 1 — Editorial Identity

```json
{
  "id": "COM-003",
  "name_fa": "معماری تحریریه سازمانی SMOS",
  "name_en": "Enterprise Editorial Architecture",
  "version": "1.0.0-draft",
  "family": "COM",
  "domain": "EDD-01",
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
  "dependencies": ["KNW-000", "KNW-001", "KNW-701", "KNW-801", "KNW-510", "COM-001", "COM-002"]
}
```

### Block 2 — Editorial Entities

```json
{
  "entities": [
    {
      "id": "EDE-001",
      "name": "Editorial Plan",
      "type": "Core",
      "domain": "EDD-01",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDE-002",
      "name": "Editorial Calendar",
      "type": "Core",
      "domain": "EDD-01",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDE-003",
      "name": "Content Sequence",
      "type": "Temporal",
      "domain": "EDD-02",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDE-004",
      "name": "Editorial Workflow",
      "type": "Core",
      "domain": "EDD-03",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDE-005",
      "name": "Content Assignment",
      "type": "Temporal",
      "domain": "EDD-03",
      "owner": "Editorial Manager"
    },
    {
      "id": "EDE-006",
      "name": "Editorial Decision",
      "type": "Core",
      "domain": "EDD-04",
      "owner": "Editorial Manager"
    },
    {
      "id": "EDE-007",
      "name": "Editorial Gate",
      "type": "Core",
      "domain": "EDD-03",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDE-008",
      "name": "Editorial Policy",
      "type": "Core",
      "domain": "EDD-04",
      "owner": "Editorial Manager"
    },
    {
      "id": "EDE-009",
      "name": "Editorial Role",
      "type": "Core",
      "domain": "EDD-04",
      "owner": "Editorial Manager"
    },
    {
      "id": "EDE-010",
      "name": "Publication Schedule",
      "type": "Temporal",
      "domain": "EDD-01",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDE-011",
      "name": "Editorial Metric",
      "type": "Core",
      "domain": "EDD-08",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDE-012",
      "name": "Editorial Review",
      "type": "Temporal",
      "domain": "EDD-08",
      "owner": "Editorial Architect"
    }
  ]
}
```

### Block 3 — Editorial Capabilities

```json
{
  "capabilities": [
    {
      "id": "EDCAP-001",
      "name": "Editorial Plan Definition",
      "layer": "Strategy",
      "owner": "Editorial Manager"
    },
    {
      "id": "EDCAP-002",
      "name": "Editorial Calendar Design",
      "layer": "Planning",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDCAP-003",
      "name": "Content Sequence Management",
      "layer": "Planning",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDCAP-004",
      "name": "Editorial Workflow Design",
      "layer": "Strategy",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDCAP-005",
      "name": "Content Priority Assignment",
      "layer": "Planning",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDCAP-006",
      "name": "Editorial Decision Execution",
      "layer": "Execution",
      "owner": "Editorial Manager"
    },
    {
      "id": "EDCAP-007",
      "name": "Editorial Governance Enforcement",
      "layer": "Strategy",
      "owner": "Editorial Manager"
    },
    {
      "id": "EDCAP-008",
      "name": "Content Assignment Management",
      "layer": "Execution",
      "owner": "Editorial Manager"
    },
    {
      "id": "EDCAP-009",
      "name": "Editorial Gate Management",
      "layer": "Planning",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDCAP-010",
      "name": "Cross-Platform Editorial Coordination",
      "layer": "Execution",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDCAP-011",
      "name": "Editorial Quality Assessment",
      "layer": "Strategy",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDCAP-012",
      "name": "Editorial Consistency Verification",
      "layer": "Planning",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDCAP-013",
      "name": "Editorial Review Execution",
      "layer": "Execution",
      "owner": "Editorial Architect"
    },
    {
      "id": "EDCAP-014",
      "name": "Editorial Evolution Management",
      "layer": "Strategy",
      "owner": "Editorial Manager"
    }
  ]
}
```

### Block 4 — Editorial States

```json
{
  "states": [
    {
      "id": "EDS-01",
      "name": "Planned",
      "description": "برنامه‌ریزی‌شده — محتوا در برنامه تحریریه ثبت شده"
    },
    {
      "id": "EDS-02",
      "name": "Scheduled",
      "description": "زمان‌بندی‌شده — زمان دقیق انتشار تعیین شده"
    },
    {
      "id": "EDS-03",
      "name": "In Pipeline",
      "description": "در خط لوله — محتوا در حال تولید یا بازبینی"
    },
    {
      "id": "EDS-04",
      "name": "Ready for Publication",
      "description": "آماده انتشار — همه گیت‌های تحریریه عبور کرده‌اند"
    },
    {
      "id": "EDS-05",
      "name": "Published",
      "description": "منتشرشده — محتوا در پلتفرم هدف منتشر شده"
    },
    { "id": "EDS-06", "name": "Completed", "description": "تکمیل‌شده — چرخه تحریریه کامل شده" },
    {
      "id": "EDS-07",
      "name": "Rescheduled",
      "description": "زمان‌بندی مجدد — محتوا به زمان دیگری منتقل شد"
    },
    { "id": "EDS-08", "name": "Removed", "description": "حذف‌شده — از برنامه تحریریه حذف گردید" }
  ],
  "valid_transitions": [
    { "from": "EDS-01", "to": "EDS-02" },
    { "from": "EDS-02", "to": "EDS-03" },
    { "from": "EDS-03", "to": "EDS-04" },
    { "from": "EDS-03", "to": "EDS-07" },
    { "from": "EDS-04", "to": "EDS-05" },
    { "from": "EDS-05", "to": "EDS-06" },
    { "from": "EDS-06", "to": "EDS-07" },
    { "from": "EDS-07", "to": "EDS-02" },
    { "from": "EDS-07", "to": "EDS-08" },
    { "from": "EDS-08", "to": "EDS-01" }
  ]
}
```

### Block 5 — Editorial Relationships

```json
{
  "relationships": [
    {
      "id": "EDR-01",
      "source": "EDE-001",
      "target": "EDE-003",
      "type": "governs",
      "description": "Editorial Plan governs Content Sequence"
    },
    {
      "id": "EDR-02",
      "source": "EDE-003",
      "target": "CCE-001",
      "type": "sequences",
      "description": "Content Sequence sequences Content Asset"
    },
    {
      "id": "EDR-03",
      "source": "EDE-004",
      "target": "EDE-005",
      "type": "routes",
      "description": "Editorial Workflow routes Content Assignment"
    },
    {
      "id": "EDR-04",
      "source": "EDE-006",
      "target": "EDE-001",
      "type": "decides",
      "description": "Editorial Decision decides Editorial Plan"
    },
    {
      "id": "EDR-05",
      "source": "EDE-007",
      "target": "EDE-004",
      "type": "gates",
      "description": "Editorial Gate controls Editorial Workflow"
    },
    {
      "id": "EDR-06",
      "source": "EDE-003",
      "target": "EDE-001",
      "type": "prioritizes",
      "description": "Content Priority prioritizes Editorial Plan"
    },
    {
      "id": "EDR-07",
      "source": "EDE-012",
      "target": "EDE-006",
      "type": "validates",
      "description": "Editorial Review validates Editorial Decision"
    },
    {
      "id": "EDR-08",
      "source": "EDE-010",
      "target": "EDE-002",
      "type": "schedules",
      "description": "Publication Schedule schedules Editorial Calendar"
    },
    {
      "id": "EDR-09",
      "source": "EDE-011",
      "target": "EDE-001",
      "type": "measures",
      "description": "Editorial Metric measures Editorial Quality"
    },
    {
      "id": "EDR-10",
      "source": "EDE-001",
      "target": "EDE-010",
      "type": "coordinates",
      "description": "Cross-Platform Coordination coordinates Publication Schedule"
    }
  ]
}
```

### Block 6 — Editorial Metrics

```json
{
  "metrics": [
    {
      "id": "EDM-01",
      "name": "Planning Completeness",
      "domain": "EDD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "EDM-02",
      "name": "Schedule Adherence",
      "domain": "EDD-01",
      "unit": "percent",
      "target": 95
    },
    {
      "id": "EDM-03",
      "name": "Sequence Consistency",
      "domain": "EDD-02",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "EDM-04",
      "name": "Workflow Compliance",
      "domain": "EDD-03",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "EDM-05",
      "name": "Governance Compliance",
      "domain": "EDD-04",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "EDM-06",
      "name": "Priority Accuracy",
      "domain": "EDD-05",
      "unit": "percent",
      "target": 95
    },
    {
      "id": "EDM-07",
      "name": "Consistency Score",
      "domain": "EDD-06",
      "unit": "score_0_100",
      "target": 95
    },
    {
      "id": "EDM-08",
      "name": "Cross-Platform Alignment",
      "domain": "EDD-07",
      "unit": "percent",
      "target": 90
    },
    {
      "id": "EDM-09",
      "name": "Gate Pass Rate",
      "domain": "EDD-03",
      "unit": "percent",
      "target": 95
    },
    {
      "id": "EDM-10",
      "name": "Pipeline Velocity",
      "domain": "EDD-03",
      "unit": "days",
      "target": 14
    },
    {
      "id": "EDM-11",
      "name": "Review Coverage",
      "domain": "EDD-08",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "EDM-12",
      "name": "Decision Traceability",
      "domain": "EDD-04",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "EDM-13",
      "name": "Assignment Efficiency",
      "domain": "EDD-03",
      "unit": "percent",
      "target": 95
    },
    {
      "id": "EDM-14",
      "name": "Editorial Quality Index",
      "domain": "EDD-08",
      "unit": "score_0_100",
      "target": 90
    },
    {
      "id": "EDM-15",
      "name": "Evolution Stability",
      "domain": "EDD-04",
      "unit": "percent",
      "target": 90
    }
  ]
}
```

---

## 28. Draft-07 JSON Schemas

### Schema 1 — Editorial Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:communication:editorial:entity:v1",
  "title": "Editorial Entity",
  "description": "Schema for SMOS Editorial Entity definitions",
  "type": "object",
  "required": ["id", "name", "type", "domain", "owner"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^EDE-[0-9]{3}$"
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
      "pattern": "^EDD-[0-9]{2}$"
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

### Schema 2 — Editorial Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:communication:editorial:capability:v1",
  "title": "Editorial Capability",
  "description": "Schema for SMOS Editorial Capability definitions",
  "type": "object",
  "required": ["id", "name", "layer"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^EDCAP-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "layer": {
      "type": "string",
      "enum": ["Strategy", "Planning", "Execution"]
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

### Schema 3 — Editorial State Transition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:communication:editorial:state:v1",
  "title": "Editorial State Transition",
  "description": "Schema for Editorial State transitions in the lifecycle model",
  "type": "object",
  "required": ["from", "to"],
  "properties": {
    "from": {
      "type": "string",
      "pattern": "^EDS-[0-9]{2}$"
    },
    "to": {
      "type": "string",
      "pattern": "^EDS-[0-9]{2}$"
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

### آمار COM-003

| شاخص                      | مقدار                             |
| ------------------------- | --------------------------------- |
| تعداد بخش‌ها              | ۳۰                                |
| تعداد دامنه‌های تحریریه   | ۸                                 |
| تعداد مفاهیم تحریریه      | ۲۰                                |
| تعداد موجودیت‌های تحریریه | ۱۲                                |
| تعداد ویژگی‌های تحریریه   | ۸                                 |
| تعداد قابلیت‌های تحریریه  | ۱۴                                |
| تعداد کارکردهای تحریریه   | ۱۴                                |
| تعداد وضعیت‌های تحریریه   | ۸                                 |
| تعداد مراحل چرخه حیات     | ۸                                 |
| تعداد روابط تحریریه       | ۱۰                                |
| تعداد معیارهای تحریریه    | ۱۵                                |
| تعداد اصول تحریریه        | ۸                                 |
| تعداد محدودیت‌های تحریریه | ۸                                 |
| تعداد گیت‌های کیفیت       | ۷                                 |
| تعداد لایه‌های معماری     | ۳ (Strategy, Planning, Execution) |
| تعداد JSON Blocks         | ۶                                 |
| تعداد JSON Schemas        | ۳                                 |
| تعداد کل خطوط             | ~۸۸۰                              |

---

## 30. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | توسط        |
| ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-07-02 | نگارش اولیه — معماری تحریریه سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (EDC-001 تا EDC-020), ۱۲ موجودیت (EDE-001 تا EDE-012), ۱۴ قابلیت (EDCAP-001 تا EDCAP-014), ۱۴ کارکرد (EDF-01 تا EDF-14), ۸ دامنه (EDD-01 تا EDD-08), ۸ وضعیت (EDS-01 تا EDS-08), ۱۰ رابطه (EDR-01 تا EDR-10), ۱۵ معیار (EDM-01 تا EDM-15), ۸ اصل (EDP-01 تا EDP-08), ۸ محدودیت (EDCST-01 تا EDCST-08), ۷ گیت کیفیت (EDQG-01 تا EDQG-07). سومین سند خانواده COM. SSOT معماری تحریریه سازمانی SMOS. Architecture Neutral, Platform Neutral, Implementation Free, Vendor Neutral. | معمار سیستم |
