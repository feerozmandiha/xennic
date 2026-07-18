# Enterprise Content Architecture — معماری محتوای سازمانی SMOS

> **شناسه:** COM-001
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-07-02
> **مسئول:** معمار محتوای سازمانی
> **وابستگی:** [KNW-000](../70-KNOWLEDGE/00-enterprise-knowledge-architecture.md), [KNW-001](../70-KNOWLEDGE/10-knowledge-index.md), [KNW-701](../70-KNOWLEDGE/700-brand-knowledge-foundation.md), [KNW-801](../70-KNOWLEDGE/800-reference-knowledge-foundation.md), [KNW-510](../70-KNOWLEDGE/518-ai-meta-architecture.md)
> **مخاطب:** human, ai-agent, content-architect, knowledge-engineer, enterprise-architect

---

## 1. Purpose

COM-001 نخستین سند خانواده Communication Architecture (COM) و SSOT (تک منبع حقیقت) برای معماری محتوای سازمانی SMOS است. این سند تعریف می‌کند که دانش سازمانی چگونه به محتوای قابل انتشار تبدیل می‌شود — بدون ورود به بازاریابی، کپی‌رایتینگ یا پیاده‌سازی.

### Why COM-001 Exists

بدون یک معماری محتوای سازمانی:

- محتوای منتشرشده فاقد ساختار یکپارچه است
- تبدیل دانش به محتوا بدون فرآیند مشخص انجام می‌شود
- انواع محتوا (آموزشی، مستندات، تحقیقاتی) تعریف نشده‌اند
- چرخه حیات محتوا از دانش تا انتشار قابل ردیابی نیست
- یکپارچگی بین خروجی‌های مختلف (مقاله، ویدئو، مستند) تضمین نمی‌شود
- کیفیت محتوا بدون معیارهای معماری قابل اندازه‌گیری نیست

COM-001 این مشکلات را با تعریف **چارچوب یکپارچه معماری محتوای سازمانی** حل می‌کند.

### Role of COM-001 in SMOS

| سند            | نقش                                                        |
| -------------- | ---------------------------------------------------------- |
| KNW-000        | معماری دانش سازمانی — منبع دانش                            |
| KNW-701        | پایه دانش برند — هویت برند برای محتوا                      |
| KNW-801        | پایه دانش مرجع — طبقه‌بندی‌ها و شناسه‌ها                   |
| **COM-001**    | **SSOT معماری محتوای سازمانی — تبدیل دانش به محتوا**       |
| COM-002+       | اسناد تخصصی معماری محتوا                                   |
| AI-003..AI-005 | عامل‌های تولید و بازبینی محتوا — مصرف‌کنندگان معماری محتوا |

---

## 2. Scope

### Inside Scope

| حوزه                                   | توضیح                                        |
| -------------------------------------- | -------------------------------------------- |
| Enterprise Content Philosophy          | هستی‌شناسی و اصول بنیادین محتوای سازمانی     |
| Knowledge-to-Content Transformation    | مدل تبدیل دانش سازمانی به محتوای قابل انتشار |
| Content Classification Model           | طبقه‌بندی انواع محتوا                        |
| Content Lifecycle Model                | چرخه حیات محتوا از مفهوم تا انتشار و بایگانی |
| Content Governance Model               | حکمرانی محتوا — قواعد، سطوح اختیار، سیاست‌ها |
| Content Ownership Model                | مدل مالکیت و مسئولیت محتوا                   |
| Content Metadata Model                 | فراداده محتوا — ساختار برچسب‌گذاری           |
| Content Versioning Model               | نسخه‌بندی محتوا                              |
| Content Traceability Model             | ردیابی محتوا به دانش مبدأ                    |
| Content Consistency Model              | سازگاری محتوا در تمام خروجی‌ها               |
| Content Quality Model                  | کیفیت محتوا — معیارها و گیت‌ها               |
| Content Distribution Abstraction Model | انتزاع توزیع — مستقل از پلتفرم               |
| Cross-Family Mapping                   | نگاشت به خانواده‌های دانش و سایر معماری‌ها   |
| Content Concepts                       | ۲۰ مفهوم بنیادین محتوا                       |
| Content Entities                       | ۱۲ موجودیت محتوا                             |
| Content Capabilities                   | ۱۴ قابلیت محتوا                              |
| Content Functions                      | ۱۴ کارکرد محتوا                              |
| Content Domains                        | ۸ دامنه محتوا                                |
| Content State Model                    | ۸ وضعیت محتوا                                |
| Content Metrics                        | ۱۵ معیار محتوا                               |
| Content Principles                     | ۸ اصل محتوا                                  |
| Content Constraints                    | ۸ محدودیت محتوا                              |
| Content Quality Gates                  | ۷ گیت کیفیت                                  |

### Outside Scope

| حوزه                       | دلیل                          |
| -------------------------- | ----------------------------- |
| استراتژی بازاریابی         | خارج از معماری — حوزه عملیاتی |
| کمپین‌های تبلیغاتی         | خارج از معماری — حوزه اجرایی  |
| کپی‌رایتینگ و تولید متن    | حوزه اجرایی — تولید محتوا     |
| پست‌های شبکه‌های اجتماعی   | حوزه اجرایی — انتشار          |
| طراحی UI/UX                | حوزه فنی خارج از معماری محتوا |
| دارایی‌های بصری و گرافیک   | حوزه اجرایی — تولید رسانه     |
| مثال‌های محتوای واقعی      | خارج از مرز معماری            |
| محصولات و Vendorها         | خنثی‌بودن فناوری              |
| SEO و تکنیک‌های بهینه‌سازی | حوزه اجرایی خارج از معماری    |

---

## 3. Content Principles

| ID     | اصل                         | توضیح                                                                              |
| ------ | --------------------------- | ---------------------------------------------------------------------------------- |
| CCP-01 | **محتوا تابع دانش**         | هر محتوای سازمانی از دانش سازمانی مشتق می‌شود — محتوا بدون دانش پشتیبان معتبر نیست |
| CCP-02 | **یکپارچگی ساختاری**        | همه محتواها از یک معماری ساختاری یکسان پیروی می‌کنند                               |
| CCP-03 | **ردیابی به مبدأ**          | هر محتوای منتشرشده باید قابل ردیابی به دانش مبدأ خود باشد                          |
| CCP-04 | **جداسازی معماری از اجرا**  | معماری محتوا از تولید و انتشار محتوا جدا تعریف می‌شود                              |
| CCP-05 | **خنثی بودن پلتفرمی**       | معماری محتوا مستقل از پلتفرم انتشار تعریف می‌شود                                   |
| CCP-06 | **کیفیت قابل اندازه‌گیری**  | کیفیت محتوا باید با معیارهای معماری قابل اندازه‌گیری باشد                          |
| CCP-07 | **تکامل کنترل‌شده**         | تغییر در معماری محتوا تابع فرآیند حکمرانی مشخص است                                 |
| CCP-08 | **مصرف توسط انسان و Agent** | معماری محتوا باید برای انسان و Agent هوشمند قابل تفسیر باشد                        |

---

## 4. Content Philosophy

### فلسفه محتوای سازمانی

SMOS محتوای سازمانی را به عنوان **تجلی بیرونی دانش درونی** می‌بیند که:

1. **مشتق از دانش است** — هر محتوا ریشه در یک دانش سازمانی دارد
2. **ساختاری است** — دارای الگو، فراداده و چرخه حیات قابل مدل‌سازی است
3. **مستقل از پلتفرم است** — معماری محتوا قبل از تطبیق با پلتفرم تعریف می‌شود
4. **ردیابی‌پذیر است** — از دانش مبدأ تا انتشار قابل ردیابی است
5. **تک منبع دارد** — هر محتوای واحد یک منبع دانش واحد دارد
6. **کیفیت‌پذیر است** — دارای معیارها و گیت‌های کیفی قابل اندازه‌گیری است

### هستی‌شناسی محتوا

محتوای سازمانی در SMOS دارای سه لایه هستی‌شناختی است:

| لایه                 | توضیح                           | مثال                                           |
| -------------------- | ------------------------------- | ---------------------------------------------- |
| Core (هسته)          | ساختار و اصول تغییرناپذیر محتوا | Content Architecture, Classification, Metadata |
| Abstraction (انتزاع) | محتوای مستقل از پلتفرم و قالب   | Canonical Content Asset                        |
| Expression (بیان)    | تطبیق محتوا برای پلتفرم و مخاطب | Platform-Adapted Content                       |

---

## 5. Enterprise Content Model

### مدل محتوای سازمانی

محتوای سازمانی SMOS از چهار لایه تشکیل شده است:

| لایه                    | شناسه  | توضیح                                                | وابستگی |
| ----------------------- | ------ | ---------------------------------------------------- | ------- |
| Knowledge Source        | CCM-01 | منبع دانش — موجودیت دانشی که محتوا از آن مشتق می‌شود | KNW-\*  |
| Canonical Content Asset | CCM-02 | دارایی محتوای بنیادین — محتوای مستقل از پلتفرم       | CCM-01  |
| Platform Adaptation     | CCM-03 | تطبیق پلتفرمی — قالب‌بندی برای پلتفرم هدف            | CCM-02  |
| Published Content       | CCM-04 | محتوای منتشرشده — خروجی نهایی در پلتفرم              | CCM-03  |

### اصول مدل محتوا

1. هر محتوای منتشرشده دقیقاً یک Canonical Content Asset دارد
2. هر Canonical Content Asset دقیقاً یک Knowledge Source دارد
3. یک Knowledge Source می‌تواند به چندین Canonical Content Asset تبدیل شود
4. یک Canonical Content Asset می‌تواند برای چندین پلتفرم تطبیق داده شود

---

## 6. Content Knowledge Domains

| شناسه  | دامنه         | توضیح                                                      |
| ------ | ------------- | ---------------------------------------------------------- |
| CCD-01 | Knowledge     | دانش — محتوای مبتنی بر دانش سازمانی (مستندات، مقالات مرجع) |
| CCD-02 | Education     | آموزش — محتوای آموزشی و یادگیری (آموزش‌ها، دوره‌ها)        |
| CCD-03 | Documentation | مستندات — محتوای مستندات فنی و کاربردی                     |
| CCD-04 | Marketing     | بازاریابی — محتوای آگاهی‌بخش و معرفی (غیر تبلیغاتی)        |
| CCD-05 | Community     | جامعه — محتوای تعاملی با جامعه مخاطبان                     |
| CCD-06 | Support       | پشتیبانی — محتوای کمک‌رسانی و راهنمایی                     |
| CCD-07 | Media         | رسانه — محتوای چندرسانه‌ای (ویدئو، تصویر، صوت)             |
| CCD-08 | Research      | پژوهش — محتوای تحقیقاتی و تحلیلی                           |

---

## 7. Content Concepts

| شناسه   | مفهوم                   | توضیح                                                 | دامنه  |
| ------- | ----------------------- | ----------------------------------------------------- | ------ |
| CCC-001 | Knowledge Source        | منبع دانش — موجودیت دانشی که محتوا از آن مشتق می‌شود  | CCD-01 |
| CCC-002 | Canonical Content Asset | دارایی محتوای بنیادین — محتوای مستقل از پلتفرم و قالب | CCD-01 |
| CCC-003 | Content Type            | نوع محتوا — دسته‌بندی محتوا بر اساس هدف و ساختار      | CCD-01 |
| CCC-004 | Content Format          | قالب محتوا — ساختار ظاهری محتوا (مقاله، ویدئو، مستند) | CCD-01 |
| CCC-005 | Content Structure       | ساختار محتوا — الگوی معماری داخلی محتوا               | CCD-01 |
| CCC-006 | Content Metadata        | فراداده محتوا — داده‌های توصیف‌کننده محتوا            | CCD-01 |
| CCC-007 | Content Lifecycle       | چرخه حیات محتوا — مراحل از مفهوم تا بایگانی           | CCD-01 |
| CCC-008 | Content Version         | نسخه محتوا — وضعیت تکامل یک محتوا                     | CCD-01 |
| CCC-009 | Content Quality         | کیفیت محتوا — سطح انطباق با معیارهای معماری           | CCD-01 |
| CCC-010 | Content Governance      | حکمرانی محتوا — قواعد و سیاست‌های حاکم بر محتوا       | CCD-01 |
| CCC-011 | Content Ownership       | مالکیت محتوا — مسئولیت و اختیار بر محتوا              | CCD-01 |
| CCC-012 | Content Consistency     | سازگاری محتوا — یکپارچگی در تمام خروجی‌ها             | CCD-01 |
| CCC-013 | Content Traceability    | ردیابی محتوا — اتصال محتوا به دانش مبدأ               | CCD-01 |
| CCC-014 | Content Distribution    | توزیع محتوا — انتشار محتوا در پلتفرم‌های هدف          | CCD-01 |
| CCC-015 | Content Validation      | اعتبارسنجی محتوا — تأیید انطباق با معماری             | CCD-01 |
| CCC-016 | Content Evolution       | تکامل محتوا — تغییر کنترل‌شده در طول زمان             | CCD-01 |
| CCC-017 | Content Taxonomy        | طبقه‌بندی محتوا — نظام دسته‌بندی محتوا                | CCD-01 |
| CCC-018 | Content Registry        | نمایه محتوا — ثبت مرکزی محتوای سازمانی                | CCD-01 |
| CCC-019 | Content Model           | مدل محتوا — نمایش انتزاعی ساختار محتوا                | CCD-01 |
| CCC-020 | Content Asset           | دارایی محتوا — واحد قابل انتشار محتوا                 | CCD-01 |

---

## 8. Content Entities

| شناسه   | موجودیت                      | نوع      | توضیح                                      | دامنه  |
| ------- | ---------------------------- | -------- | ------------------------------------------ | ------ |
| CCE-001 | Content Asset                | Core     | دارایی محتوا — واحد بنیادین محتوای سازمانی | CCD-01 |
| CCE-002 | Knowledge Source             | Core     | منبع دانش — موجودیت دانش مبدأ              | CCD-01 |
| CCE-003 | Content Type Definition      | Core     | تعریف نوع محتوا — مشخصات یک نوع محتوا      | CCD-01 |
| CCE-004 | Content Structure            | Core     | ساختار محتوا — الگوی معماری محتوا          | CCD-01 |
| CCE-005 | Content Metadata             | Core     | فراداده محتوا — داده‌های توصیفی            | CCD-01 |
| CCE-006 | Content Version              | Temporal | نسخه محتوا — وضعیت تکامل                   | CCD-01 |
| CCE-007 | Content Lifecycle Stage      | Temporal | مرحله چرخه حیات — وضعیت در چرخه حیات       | CCD-01 |
| CCE-008 | Content Quality Gate         | Core     | گیت کیفیت — معیار عبور از مرحله            | CCD-01 |
| CCE-009 | Content Governance Rule      | Core     | قاعده حکمرانی — سیاست محتوا                | CCD-01 |
| CCE-010 | Content Distribution Channel | Core     | کانال توزیع — پلتفرم هدف انتشار            | CCD-01 |
| CCE-011 | Content Platform Adaptation  | Core     | تطبیق پلتفرمی — قالب محتوا برای پلتفرم     | CCD-01 |
| CCE-012 | Content Traceability Link    | Core     | پیوند ردیابی — اتصال محتوا به دانش         | CCD-01 |

---

## 9. Content Attributes

| شناسه  | ویژگی                 | توضیح                                        | موجودیت مرتبط |
| ------ | --------------------- | -------------------------------------------- | ------------- |
| CCA-01 | Completeness          | کامل بودن — پوشش تمام جنبه‌های مورد نیاز     | CCE-001       |
| CCA-02 | Accuracy              | دقت — مطابقت با دانش مبدأ                    | CCE-001       |
| CCA-03 | Consistency           | سازگاری — یکپارچگی با سایر محتواها           | CCE-001       |
| CCA-04 | Traceability          | ردیابی — قابلیت ردیابی به دانش مبدأ          | CCE-001       |
| CCA-05 | Structure Validity    | اعتبار ساختاری — انطباق با الگوی معماری      | CCE-001       |
| CCA-06 | Audience Relevance    | مرتبط بودن با مخاطب — تناسب با هدف           | CCE-001       |
| CCA-07 | Platform Readiness    | آمادگی پلتفرمی — قابلیت انتشار در پلتفرم هدف | CCE-001       |
| CCA-08 | Governance Compliance | انطباق حکمرانی — رعایت قواعد و سیاست‌ها      | CCE-001       |

---

## 10. Content Capabilities

| شناسه     | قابلیت                           | توضیح                                | لایه        |
| --------- | -------------------------------- | ------------------------------------ | ----------- |
| CCCAP-001 | Knowledge Source Identification  | شناسایی دانش مبدأ برای تولید محتوا   | Core        |
| CCCAP-002 | Canonical Content Asset Creation | ایجاد دارایی محتوای بنیادین از دانش  | Core        |
| CCCAP-003 | Content Type Definition          | تعریف انواع محتوای سازمانی           | Core        |
| CCCAP-004 | Content Structure Design         | طراحی ساختار معماری محتوا            | Core        |
| CCCAP-005 | Content Metadata Management      | مدیریت فراداده محتوا                 | Core        |
| CCCAP-006 | Content Quality Assessment       | ارزیابی کیفیت محتوا بر اساس معیارها  | Core        |
| CCCAP-007 | Content Lifecycle Management     | مدیریت چرخه حیات محتوا               | Abstraction |
| CCCAP-008 | Content Version Management       | مدیریت نسخه‌بندی محتوا               | Abstraction |
| CCCAP-009 | Content Governance Enforcement   | اعمال قواعد حکمرانی بر محتوا         | Core        |
| CCCAP-010 | Content Distribution Abstraction | انتزاع توزیع — طراحی مستقل از پلتفرم | Abstraction |
| CCCAP-011 | Content Platform Adaptation      | تطبیق محتوای بنیادین برای پلتفرم هدف | Expression  |
| CCCAP-012 | Content Validation Execution     | اجرای اعتبارسنجی محتوا               | Abstraction |
| CCCAP-013 | Content Traceability Management  | مدیریت ردیابی محتوا به دانش مبدأ     | Core        |
| CCCAP-014 | Content Evolution Coordination   | هماهنگی تکامل محتوا                  | Abstraction |

---

## 11. Content Functions

| شناسه  | کارکرد                         | توضیح                                 | قابلیت مرتبط |
| ------ | ------------------------------ | ------------------------------------- | ------------ |
| CCF-01 | Identify Knowledge Source      | شناسایی و انتخاب دانش مبدأ برای محتوا | CCCAP-001    |
| CCF-02 | Create Canonical Content Asset | ایجاد دارایی محتوای بنیادین           | CCCAP-002    |
| CCF-03 | Define Content Type            | تعریف نوع محتوای جدید                 | CCCAP-003    |
| CCF-04 | Design Content Structure       | طراحی ساختار معماری برای نوع محتوا    | CCCAP-004    |
| CCF-05 | Manage Content Metadata        | ایجاد و نگهداری فراداده محتوا         | CCCAP-005    |
| CCF-06 | Assess Content Quality         | ارزیابی کیفیت محتوا با معیارها        | CCCAP-006    |
| CCF-07 | Manage Content Lifecycle       | مدیریت مراحل چرخه حیات محتوا          | CCCAP-007    |
| CCF-08 | Manage Content Versions        | مدیریت نسخه‌های محتوا                 | CCCAP-008    |
| CCF-09 | Enforce Content Governance     | اعمال قواعد و سیاست‌های محتوا         | CCCAP-009    |
| CCF-10 | Design Distribution Channel    | طراحی کانال توزیع انتزاعی             | CCCAP-010    |
| CCF-11 | Adapt Content for Platform     | تطبیق محتوا برای پلتفرم هدف           | CCCAP-011    |
| CCF-12 | Validate Content               | اجرای اعتبارسنجی محتوا                | CCCAP-012    |
| CCF-13 | Manage Content Traceability    | مدیریت پیوندهای ردیابی                | CCCAP-013    |
| CCF-14 | Coordinate Content Evolution   | هماهنگی تکامل و به‌روزرسانی محتوا     | CCCAP-014    |

---

## 12. Content Taxonomy

### طبقه‌بندی محتوای سازمانی

محتوای سازمانی SMOS در سه سطح طبقه‌بندی می‌شود:

| سطح         | شناسه                          | توضیح                                          | دامنه‌ها |
| ----------- | ------------------------------ | ---------------------------------------------- | -------- |
| Core        | CCD-01                         | دانش — محتوای مبتنی بر دانش سازمانی            |
| Operational | CCD-02, CCD-03, CCD-06         | آموزش، مستندات، پشتیبانی — محتوای عملیاتی      |
| Engagement  | CCD-04, CCD-05, CCD-07, CCD-08 | بازاریابی، جامعه، رسانه، پژوهش — محتوای تعاملی |

### اصول طبقه‌بندی

1. هر محتوا دقیقاً در یک دامنه طبقه‌بندی می‌شود
2. دامنه‌های Core بالاترین اولویت را در ارجاع دارند
3. دامنه‌های Operational تابع قواعد دامنه‌های Core هستند
4. دامنه‌های Engagement قواعد تطبیق پلتفرمی را تعریف می‌کنند

---

## 13. Content State Model

| شناسه  | وضعیت      | توضیح                                          | مجوز انتقال      |
| ------ | ---------- | ---------------------------------------------- | ---------------- |
| CCS-01 | Draft      | پیش‌نویس — محتوا در حال ایجاد                  | → CCS-02         |
| CCS-02 | Reviewed   | بازبینی‌شده — بررسی ساختاری انجام شده          | → CCS-03         |
| CCS-03 | Approved   | تصویب‌شده — تأیید نهایی توسط مالک              | → CCS-04         |
| CCS-04 | Published  | منتشرشده — در دسترس مخاطبان                    | → CCS-05, CCS-07 |
| CCS-05 | Maintained | در حال نگهداری — به‌روزرسانی و بازبینی دوره‌ای | → CCS-06, CCS-07 |
| CCS-06 | Updated    | به‌روزرسانی‌شده — نسخه جدید منتشر شده          | → CCS-04         |
| CCS-07 | Deprecated | منسوخ — جایگزین شده یا حذف                     | → CCS-08         |
| CCS-08 | Archived   | بایگانی‌شده — غیرفعال اما قابل بازیابی         | → CCS-01         |

### انتقال‌های مجاز

| از     | به     | شرط                              |
| ------ | ------ | -------------------------------- |
| CCS-01 | CCS-02 | تکمیل پیش‌نویس و بازبینی ساختاری |
| CCS-02 | CCS-03 | تأیید توسط مالک محتوا            |
| CCS-03 | CCS-04 | انتشار در کانال توزیع            |
| CCS-04 | CCS-05 | شروع دوره نگهداری                |
| CCS-04 | CCS-07 | تصمیم به منسوخ‌سازی              |
| CCS-05 | CCS-06 | اعمال به‌روزرسانی                |
| CCS-05 | CCS-07 | تصمیم به منسوخ‌سازی              |
| CCS-06 | CCS-04 | انتشار نسخه به‌روز               |
| CCS-07 | CCS-08 | بایگانی نهایی                    |
| CCS-08 | CCS-01 | بازتعریف محتوا                   |

---

## 14. Content Lifecycle Model

| شناسه   | مرحله       | توضیح                          | معیار خروج                     |
| ------- | ----------- | ------------------------------ | ------------------------------ |
| CCST-01 | Conception  | شکل‌گیری ایده محتوا از دانش    | شناسایی Knowledge Source       |
| CCST-02 | Planning    | برنامه‌ریزی ساختار و نوع محتوا | تعریف Content Type و Structure |
| CCST-03 | Creation    | ایجاد دارایی محتوای بنیادین    | تکمیل Canonical Content Asset  |
| CCST-04 | Validation  | اعتبارسنجی محتوا               | عبور از گیت‌های کیفیت          |
| CCST-05 | Approval    | تصویب نهایی                    | تأیید توسط مالک                |
| CCST-06 | Publication | انتشار در کانال‌های توزیع      | تحویل به پلتفرم هدف            |
| CCST-07 | Maintenance | نگهداری و به‌روزرسانی          | بازبینی دوره‌ای                |
| CCST-08 | Retirement  | بازنشستگی                      | بایگانی یا حذف                 |

---

## 15. Content Governance Model

### مدل حکمرانی محتوا

حکمرانی محتوای SMOS بر اساس سطوح اختیار (A-0 تا A-4) تعریف می‌شود:

| سطح | عنوان            | اختیارات                                  | مثال                |
| --- | ---------------- | ----------------------------------------- | ------------------- |
| A-0 | بدون دسترسی      | فقط خواندن محتوای منتشرشده                | مصرف‌کننده نهایی    |
| A-1 | مصرف‌کننده داخلی | استفاده از محتوا در خروجی‌ها              | AI-003, AI-004      |
| A-2 | متقاضی محتوا     | پیشنهاد ایجاد یا تغییر محتوا              | AI-001, AI-005      |
| A-3 | تولیدکننده محتوا | ایجاد و ویرایش محتوای غیر Core            | AI-003, معمار محتوا |
| A-4 | مالک محتوا       | تصویب، منسوخ‌سازی و تغییر در معماری محتوا | مدیر محتوا          |

### انواع تصمیمات حکمرانی

| نوع        | توضیح                 | سطح اختیار |
| ---------- | --------------------- | ---------- |
| تعریف      | ایجاد نوع محتوای جدید | A-4        |
| ایجاد      | تولید محتوای جدید     | A-3        |
| ویرایش     | تغییر محتوای موجود    | A-3        |
| تصویب      | تأیید نهایی محتوا     | A-4        |
| انتشار     | انتشار در کانال توزیع | A-3        |
| منسوخ‌سازی | Deprecate محتوا       | A-4        |
| بایگانی    | Archive محتوا         | A-3        |

---

## 16. Content Consistency Model

### مدل سازگاری محتوا

سازگاری محتوا در SMOS در چهار بعد تعریف می‌شود:

| بعد                        | توضیح                                                | معیار                                     |
| -------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| Vertical Consistency       | سازگاری عمودی — هماهنگی دانش مبدأ تا محتوای منتشرشده | محتوا با دانش مبدأ مطابقت دارد            |
| Horizontal Consistency     | سازگاری افقی — یکپارچگی بین انواع محتوا              | همه محتواها از معماری یکسان پیروی می‌کنند |
| Temporal Consistency       | سازگاری زمانی — ثبات در طول زمان                     | نسخه‌های مختلف یک محتوا سازگارند          |
| Cross-Platform Consistency | سازگاری بین‌پلتفرمی — یک محتوا در پلتفرم‌های مختلف   | محتوای بنیادین یکسان در همه پلتفرم‌ها     |

### قواعد سازگاری

| ID     | قاعده                          | توضیح                                            |
| ------ | ------------------------------ | ------------------------------------------------ |
| CCR-01 | محتوا تابع دانش                | هیچ محتوایی نباید با دانش مبدأ تضاد داشته باشد   |
| CCR-02 | یک محتوای بنیادین — چند پلتفرم | Canonical Content Asset واحد برای همه پلتفرم‌ها  |
| CCR-03 | تغییر تابع حکمرانی             | هیچ تغییری بدون طی کردن فرآیند حکمرانی مجاز نیست |
| CCR-04 | ردیابی الزامی                  | هر محتوا باید قابل ردیابی به دانش مبدأ باشد      |

---

## 17. Content Validation Model

### مدل اعتبارسنجی محتوا

اعتبارسنجی محتوا در چهار سطح انجام می‌شود:

| سطح | نوع اعتبارسنجی        | توضیح                               | مجری        |
| --- | --------------------- | ----------------------------------- | ----------- |
| L1  | Structural Validation | بررسی انطباق با ساختار معماری محتوا | AI-004      |
| L2  | Semantic Validation   | بررسی سازگاری معنایی با دانش مبدأ   | AI-004      |
| L3  | Governance Validation | بررسی انطباق با قواعد حکمرانی       | AI-004      |
| L4  | Quality Validation    | بررسی عبور از گیت‌های کیفیت         | معمار محتوا |

### قواعد اعتبارسنجی

| ID     | قاعده                                                      | توضیح |
| ------ | ---------------------------------------------------------- | ----- |
| CVR-01 | هر محتوا باید قبل از انتشار اعتبارسنجی شود                 |
| CVR-02 | اعتبارسنجی L1 و L2 برای همه محتواها الزامی است             |
| CVR-03 | اعتبارسنجی L3 برای محتواهای با تأثیر بالا الزامی است       |
| CVR-04 | اعتبارسنجی L4 برای محتواهای جدید یا تغییر یافته الزامی است |
| CVR-05 | نتیجه اعتبارسنجی باید قابل ردیابی و مستند باشد             |

---

## 18. Content Metrics Model

| شناسه  | معیار                     | توضیح                                               | دامنه  | واحد     |
| ------ | ------------------------- | --------------------------------------------------- | ------ | -------- |
| CCM-01 | Source Accuracy           | دقت منبع — درصد مطابقت با دانش مبدأ                 | CCD-01 | درصد     |
| CCM-02 | Structural Completeness   | تکمیل ساختاری — درصد اجزای ساختاری تعریف‌شده        | CCD-01 | درصد     |
| CCM-03 | Metadata Coverage         | پوشش فراداده — درصد فیلدهای فراداده پر شده          | CCD-01 | درصد     |
| CCM-04 | Quality Gate Pass Rate    | نرخ عبور از گیت کیفیت — درصد محتواهای تأییدشده      | CCD-01 | درصد     |
| CCM-05 | Governance Compliance     | انطباق حکمرانی — درصد محتواهای منطبق                | CCD-01 | درصد     |
| CCM-06 | Traceability Completeness | تکمیل ردیابی — درصد محتواهای دارای پیوند به دانش    | CCD-01 | درصد     |
| CCM-07 | Version Consistency       | سازگاری نسخه — درصد نسخه‌های سازگار                 | CCD-01 | درصد     |
| CCM-08 | Lifecycle Velocity        | سرعت چرخه حیات — میانگین زمان از Draft تا Published | CCD-01 | روز      |
| CCM-09 | Content Reuse Rate        | نرخ استفاده مجدد — میانگین پلتفرم‌های هر محتوا      | CCD-01 | عدد      |
| CCM-10 | Platform Adaptation Rate  | نرخ تطبیق پلتفرمی — درصد محتواهای تطبیق‌یافته       | CCD-01 | درصد     |
| CCM-11 | Update Frequency          | دفعات به‌روزرسانی — تعداد به‌روزرسانی در بازه       | CCD-01 | عدد/دوره |
| CCM-12 | Deprecation Rate          | نرخ منسوخ‌سازی — درصد محتواهای منسوخ‌شده            | CCD-01 | درصد     |
| CCM-13 | Asset Completeness        | تکمیل دارایی — درصد محتواهای دارای Canonical Asset  | CCD-01 | درصد     |
| CCM-14 | Validation Coverage       | پوشش اعتبارسنجی — درصد محتواهای اعتبارسنجی‌شده      | CCD-01 | درصد     |
| CCM-15 | Evolution Stability       | پایداری تکامل — درصد تغییرات غیربرگشتی              | CCD-01 | درصد     |

---

## 19. Content Registry Model

### مدل ثبت محتوا

همه محتوای سازمانی باید در نمایه مرکزی ثبت شوند:

| فیلد                | توضیح                  | الزامی  |
| ------------------- | ---------------------- | ------- |
| Content ID          | شناسه یکتای محتوا      | ✅      |
| Title               | عنوان محتوا            | ✅      |
| Content Type        | نوع محتوا (از CCC-003) | ✅      |
| Domain              | دامنه محتوا            | ✅      |
| Source Knowledge ID | شناسه دانش مبدأ        | ✅      |
| Status              | وضعیت در State Model   | ✅      |
| Version             | نسخه فعلی              | ✅      |
| Owner               | مالک محتوا             | ✅      |
| Created             | تاریخ ایجاد            | ✅      |
| Published           | تاریخ انتشار           | ✅      |
| Updated             | آخرین به‌روزرسانی      | ✅      |
| Platforms           | پلتفرم‌های هدف         | اختیاری |

---

## 20. Content Constraint Model

| شناسه    | محدودیت                              | توضیح                                                   | دامنه  |
| -------- | ------------------------------------ | ------------------------------------------------------- | ------ |
| CCCST-01 | محتوا بدون دانش مبدأ معتبر نیست      | هر محتوای سازمانی باید به یک دانش مبدأ معتبر متصل باشد  | CCD-01 |
| CCCST-02 | معماری جدا از اجرا                   | معماری محتوا نباید شامل جزئیات اجرایی تولید باشد        | CCD-01 |
| CCCST-03 | یک محتوای بنیادین برای همه پلتفرم‌ها | Canonical Content Asset واحد برای همه تطبیق‌های پلتفرمی | CCD-01 |
| CCCST-04 | ردیابی الزامی                        | همه محتواها باید به دانش مبدأ قابل ردیابی باشند         | CCD-01 |
| CCCST-05 | اعتبارسنجی قبل از انتشار             | هیچ محتوایی بدون عبور از گیت‌های کیفیت منتشر نمی‌شود    | CCD-01 |
| CCCST-06 | حکمرانی بر همه الزامی                | قواعد حکمرانی برای انسان و Agent یکسان است              | CCD-01 |
| CCCST-07 | عدم تغییر پس از انتشار               | محتوای منتشرشده تغییر نمی‌کند — نسخه جدید ایجاد می‌شود  | CCD-01 |
| CCCST-08 | Registry Entry الزامی                | هر محتوا باید در نمایه مرکزی ثبت شود                    | CCD-01 |

---

## 21. Content Quality Gates

| ID      | گیت                       | معیار                                        | دامنه  |
| ------- | ------------------------- | -------------------------------------------- | ------ |
| CCQG-01 | Source Validity           | دانش مبدأ معتبر و قابل ردیابی است            | CCD-01 |
| CCQG-02 | Structural Completeness   | محتوا با ساختار معماری تعریف‌شده مطابقت دارد | CCD-01 |
| CCQG-03 | Metadata Completeness     | همه فیلدهای فراداده الزامی پر شده‌اند        | CCD-01 |
| CCQG-04 | Consistency Conformance   | محتوا با سایر محتواها سازگار است             | CCD-01 |
| CCQG-05 | Governance Compliance     | همه قواعد حکمرانی رعایت شده‌اند              | CCD-01 |
| CCQG-06 | Traceability Confirmation | پیوند ردیابی به دانش مبدأ تأیید شده است      | CCD-01 |
| CCQG-07 | Registry Completeness     | محتوا در نمایه مرکزی ثبت شده است             | CCD-01 |

---

## 22. Content Evolution Model

### مدل تکامل محتوا

تکامل محتوای سازمانی در SMOS تابع یک فرآیند ۵ مرحله‌ای است:

| مرحله                | توضیح                              | مجری |
| -------------------- | ---------------------------------- | ---- |
| 1. Proposal          | ارائه پیشنهاد ایجاد یا تغییر محتوا | A-2+ |
| 2. Impact Assessment | ارزیابی تأثیر بر محتواهای وابسته   | A-3  |
| 3. Approval          | تصویب تغییر توسط مالک محتوا        | A-4  |
| 4. Implementation    | اجرای تغییر در محتوا و نمایه       | A-3  |
| 5. Validation        | اعتبارسنجی پس از تغییر             | A-3  |

### انواع تغییر

| نوع      | توضیح                                           | سطح تأثیر            |
| -------- | ----------------------------------------------- | -------------------- |
| Patch    | اصلاح جزئی — بدون تغییر معنا یا ساختار          | CCE-001              |
| Minor    | به‌روزرسانی محتوا — تغییر در محتوای غیر بنیادین | CCE-006              |
| Major    | تغییر در Canonical Content Asset یا ساختار      | CCE-002, CCE-004     |
| Breaking | تغییر ناسازگار با نسخه قبلی                     | CCE-001 (فوق‌العاده) |

---

## 23. Content Relationship Model

| شناسه  | رابطه        | مبدأ              | مقصد                 | نوع          | توضیح                               |
| ------ | ------------ | ----------------- | -------------------- | ------------ | ----------------------------------- |
| CCR-01 | derives-from | Content Asset     | Knowledge Source     | Derivation   | محتوا از دانش مشتق می‌شود           |
| CCR-02 | adapts-to    | Content Asset     | Platform Adaptation  | Adaptation   | محتوا برای پلتفرم تطبیق می‌یابد     |
| CCR-03 | publishes-to | Content Asset     | Distribution Channel | Publication  | محتوا در کانال منتشر می‌شود         |
| CCR-04 | traces-to    | Content Asset     | Knowledge Source     | Traceability | محتوا به دانش ردیابی می‌شود         |
| CCR-05 | validates    | Quality Gate      | Content Asset        | Validation   | Gate محتوا را اعتبارسنجی می‌کند     |
| CCR-06 | governs      | Governance Rule   | Content Asset        | Governance   | Rule محتوا را هدایت می‌کند          |
| CCR-07 | versions     | Content Version   | Content Asset        | Versioning   | Version نسخه محتوا را نگه می‌دارد   |
| CCR-08 | structures   | Content Structure | Content Type         | Structuring  | Structure نوع محتوا را تعریف می‌کند |
| CCR-09 | describes    | Content Metadata  | Content Asset        | Description  | Metadata محتوا را توصیف می‌کند      |
| CCR-10 | evolves      | Content Evolution | Content Asset        | Evolution    | Evolution محتوا را تکامل می‌دهد     |

---

## 24. Content Hierarchy Model

### سلسله‌مراتب محتوا

محتوای سازمانی SMOS دارای سلسله‌مراتب زیر است:

```
Content Registry
    │
    ├── Content Asset (CCE-001)
    │       │
    │       ├── Knowledge Source (CCE-002)
    │       │
    │       ├── Content Type Definition (CCE-003)
    │       ├── Content Structure (CCE-004)
    │       │
    │       ├── Content Metadata (CCE-005)
    │       ├── Content Version (CCE-006)
    │       │
    │       ├── Content Lifecycle Stage (CCE-007)
    │       ├── Content Quality Gate (CCE-008)
    │       │
    │       ├── Content Governance Rule (CCE-009)
    │       │
    │       ├── Content Distribution Channel (CCE-010)
    │       │
    │       ├── Content Platform Adaptation (CCE-011)
    │       │
    │       └── Content Traceability Link (CCE-012)
```

### اصول سلسله‌مراتب

1. هر موجودیت دقیقاً یک والد دارد (به جز Registry به عنوان ریشه)
2. موجودیت‌های Core (Asset, Source, Type, Structure, Metadata) در سطح اول
3. موجودیت‌های Lifecycle (Stage, Version, Gate) در سطح میانی
4. موجودیت‌های Operational (Channel, Adaptation, Traceability) در سطح پایینی

---

## 25. Naming Rules

| الگو                      | شناسه          | مثال      |
| ------------------------- | -------------- | --------- |
| Content Concepts          | CCC-[0-9]{3}   | CCC-001   |
| Content Entities          | CCE-[0-9]{3}   | CCE-001   |
| Content Attributes        | CCA-[0-9]{2}   | CCA-01    |
| Content Capabilities      | CCCAP-[0-9]{3} | CCCAP-001 |
| Content Functions         | CCF-[0-9]{2}   | CCF-01    |
| Content Domains           | CCD-[0-9]{2}   | CCD-01    |
| Content States            | CCS-[0-9]{2}   | CCS-01    |
| Content Stages            | CCST-[0-9]{2}  | CCST-01   |
| Content Relationships     | CCR-[0-9]{2}   | CCR-01    |
| Content Metrics           | CCM-[0-9]{2}   | CCM-01    |
| Content Principles        | CCP-[0-9]{2}   | CCP-01    |
| Content Constraints       | CCCST-[0-9]{2} | CCCST-01  |
| Content Quality Gates     | CCQG-[0-9]{2}  | CCQG-01   |
| Content Consistency Rules | CCR-[0-9]{2}   | CCR-01    |
| Content Validation Rules  | CVR-[0-9]{2}   | CVR-01    |

---

## 26. Cross References

### ارجاع به سایر معماری‌ها و دانش

| خانواده                | سند            | ارجاع به COM                            |
| ---------------------- | -------------- | --------------------------------------- |
| Knowledge Architecture | KNW-000        | معماری مادر دانش                        |
| Knowledge Index        | KNW-001        | نمایه مرکزی دانش                        |
| AI Meta Architecture   | KNW-510        | متا معماری دانش                         |
| Brand Knowledge        | KNW-701        | هویت برند برای محتوا                    |
| Reference Knowledge    | KNW-801        | طبقه‌بندی‌ها و شناسه‌های مرجع           |
| Brand Architecture     | BRD-001        | معماری سیستم برند — مصرف‌کننده محتوا    |
| Brand Voice            | BRD-002        | معماری صدای برند — مصرف‌کننده محتوا     |
| AI Agents              | AI-003..AI-005 | عامل‌های تولید و بازبینی — مصرف‌کنندگان |
| Automation             | AUT-\*         | خودکارسازی انتشار — مصرف‌کننده          |

---

## 27. Machine Readable JSON Blocks

### Block 1 — Content Identity

```json
{
  "id": "COM-001",
  "name_fa": "معماری محتوای سازمانی SMOS",
  "name_en": "Enterprise Content Architecture",
  "version": "1.0.0-draft",
  "family": "COM",
  "domain": "CCD-01",
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
  "dependencies": ["KNW-000", "KNW-001", "KNW-701", "KNW-801", "KNW-510"]
}
```

### Block 2 — Content Entities

```json
{
  "entities": [
    {
      "id": "CCE-001",
      "name": "Content Asset",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Content Architect"
    },
    {
      "id": "CCE-002",
      "name": "Knowledge Source",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Knowledge Architect"
    },
    {
      "id": "CCE-003",
      "name": "Content Type Definition",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Content Architect"
    },
    {
      "id": "CCE-004",
      "name": "Content Structure",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Content Architect"
    },
    {
      "id": "CCE-005",
      "name": "Content Metadata",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Content Architect"
    },
    {
      "id": "CCE-006",
      "name": "Content Version",
      "type": "Temporal",
      "domain": "CCD-01",
      "owner": "Content Architect"
    },
    {
      "id": "CCE-007",
      "name": "Content Lifecycle Stage",
      "type": "Temporal",
      "domain": "CCD-01",
      "owner": "Content Manager"
    },
    {
      "id": "CCE-008",
      "name": "Content Quality Gate",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Content Architect"
    },
    {
      "id": "CCE-009",
      "name": "Content Governance Rule",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Content Manager"
    },
    {
      "id": "CCE-010",
      "name": "Content Distribution Channel",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Content Architect"
    },
    {
      "id": "CCE-011",
      "name": "Content Platform Adaptation",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Content Architect"
    },
    {
      "id": "CCE-012",
      "name": "Content Traceability Link",
      "type": "Core",
      "domain": "CCD-01",
      "owner": "Knowledge Architect"
    }
  ]
}
```

### Block 3 — Content Capabilities

```json
{
  "capabilities": [
    {
      "id": "CCCAP-001",
      "name": "Knowledge Source Identification",
      "layer": "Core",
      "owner": "Knowledge Architect"
    },
    {
      "id": "CCCAP-002",
      "name": "Canonical Content Asset Creation",
      "layer": "Core",
      "owner": "Content Architect"
    },
    {
      "id": "CCCAP-003",
      "name": "Content Type Definition",
      "layer": "Core",
      "owner": "Content Architect"
    },
    {
      "id": "CCCAP-004",
      "name": "Content Structure Design",
      "layer": "Core",
      "owner": "Content Architect"
    },
    {
      "id": "CCCAP-005",
      "name": "Content Metadata Management",
      "layer": "Core",
      "owner": "Content Architect"
    },
    {
      "id": "CCCAP-006",
      "name": "Content Quality Assessment",
      "layer": "Core",
      "owner": "Content Architect"
    },
    {
      "id": "CCCAP-007",
      "name": "Content Lifecycle Management",
      "layer": "Abstraction",
      "owner": "Content Manager"
    },
    {
      "id": "CCCAP-008",
      "name": "Content Version Management",
      "layer": "Abstraction",
      "owner": "Content Architect"
    },
    {
      "id": "CCCAP-009",
      "name": "Content Governance Enforcement",
      "layer": "Core",
      "owner": "Content Manager"
    },
    {
      "id": "CCCAP-010",
      "name": "Content Distribution Abstraction",
      "layer": "Abstraction",
      "owner": "Content Architect"
    },
    {
      "id": "CCCAP-011",
      "name": "Content Platform Adaptation",
      "layer": "Expression",
      "owner": "Content Architect"
    },
    {
      "id": "CCCAP-012",
      "name": "Content Validation Execution",
      "layer": "Abstraction",
      "owner": "Content Architect"
    },
    {
      "id": "CCCAP-013",
      "name": "Content Traceability Management",
      "layer": "Core",
      "owner": "Knowledge Architect"
    },
    {
      "id": "CCCAP-014",
      "name": "Content Evolution Coordination",
      "layer": "Abstraction",
      "owner": "Content Manager"
    }
  ]
}
```

### Block 4 — Content States

```json
{
  "states": [
    { "id": "CCS-01", "name": "Draft", "description": "پیش‌نویس — محتوا در حال ایجاد" },
    { "id": "CCS-02", "name": "Reviewed", "description": "بازبینی‌شده — بررسی ساختاری انجام شده" },
    { "id": "CCS-03", "name": "Approved", "description": "تصویب‌شده — تأیید نهایی توسط مالک" },
    { "id": "CCS-04", "name": "Published", "description": "منتشرشده — در دسترس مخاطبان" },
    {
      "id": "CCS-05",
      "name": "Maintained",
      "description": "در حال نگهداری — به‌روزرسانی و بازبینی دوره‌ای"
    },
    { "id": "CCS-06", "name": "Updated", "description": "به‌روزرسانی‌شده — نسخه جدید منتشر شده" },
    { "id": "CCS-07", "name": "Deprecated", "description": "منسوخ — جایگزین شده یا حذف" },
    { "id": "CCS-08", "name": "Archived", "description": "بایگانی‌شده — غیرفعال اما قابل بازیابی" }
  ],
  "valid_transitions": [
    { "from": "CCS-01", "to": "CCS-02" },
    { "from": "CCS-02", "to": "CCS-03" },
    { "from": "CCS-03", "to": "CCS-04" },
    { "from": "CCS-04", "to": "CCS-05" },
    { "from": "CCS-04", "to": "CCS-07" },
    { "from": "CCS-05", "to": "CCS-06" },
    { "from": "CCS-05", "to": "CCS-07" },
    { "from": "CCS-06", "to": "CCS-04" },
    { "from": "CCS-07", "to": "CCS-08" },
    { "from": "CCS-08", "to": "CCS-01" }
  ]
}
```

### Block 5 — Content Relationships

```json
{
  "relationships": [
    {
      "id": "CCR-01",
      "source": "CCE-001",
      "target": "CCE-002",
      "type": "derives-from",
      "description": "Content Asset derives from Knowledge Source"
    },
    {
      "id": "CCR-02",
      "source": "CCE-001",
      "target": "CCE-011",
      "type": "adapts-to",
      "description": "Content Asset adapts to Platform Adaptation"
    },
    {
      "id": "CCR-03",
      "source": "CCE-001",
      "target": "CCE-010",
      "type": "publishes-to",
      "description": "Content Asset publishes to Distribution Channel"
    },
    {
      "id": "CCR-04",
      "source": "CCE-001",
      "target": "CCE-012",
      "type": "traces-to",
      "description": "Content Asset traces to Knowledge Source"
    },
    {
      "id": "CCR-05",
      "source": "CCE-008",
      "target": "CCE-001",
      "type": "validates",
      "description": "Quality Gate validates Content Asset"
    },
    {
      "id": "CCR-06",
      "source": "CCE-009",
      "target": "CCE-001",
      "type": "governs",
      "description": "Governance Rule governs Content Asset"
    },
    {
      "id": "CCR-07",
      "source": "CCE-006",
      "target": "CCE-001",
      "type": "versions",
      "description": "Content Version versions Content Asset"
    },
    {
      "id": "CCR-08",
      "source": "CCE-004",
      "target": "CCE-003",
      "type": "structures",
      "description": "Content Structure structures Content Type"
    },
    {
      "id": "CCR-09",
      "source": "CCE-005",
      "target": "CCE-001",
      "type": "describes",
      "description": "Content Metadata describes Content Asset"
    },
    {
      "id": "CCR-10",
      "source": "CCE-001",
      "target": "CCE-006",
      "type": "evolves",
      "description": "Content Asset evolves through Content Version"
    }
  ]
}
```

### Block 6 — Content Metrics

```json
{
  "metrics": [
    {
      "id": "CCM-01",
      "name": "Source Accuracy",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "CCM-02",
      "name": "Structural Completeness",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "CCM-03",
      "name": "Metadata Coverage",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "CCM-04",
      "name": "Quality Gate Pass Rate",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 95
    },
    {
      "id": "CCM-05",
      "name": "Governance Compliance",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "CCM-06",
      "name": "Traceability Completeness",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "CCM-07",
      "name": "Version Consistency",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "CCM-08",
      "name": "Lifecycle Velocity",
      "domain": "CCD-01",
      "unit": "days",
      "target": 14
    },
    {
      "id": "CCM-09",
      "name": "Content Reuse Rate",
      "domain": "CCD-01",
      "unit": "count",
      "target": 3
    },
    {
      "id": "CCM-10",
      "name": "Platform Adaptation Rate",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 80
    },
    {
      "id": "CCM-11",
      "name": "Update Frequency",
      "domain": "CCD-01",
      "unit": "count_per_period",
      "target": 4
    },
    {
      "id": "CCM-12",
      "name": "Deprecation Rate",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 10
    },
    {
      "id": "CCM-13",
      "name": "Asset Completeness",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "CCM-14",
      "name": "Validation Coverage",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 100
    },
    {
      "id": "CCM-15",
      "name": "Evolution Stability",
      "domain": "CCD-01",
      "unit": "percent",
      "target": 90
    }
  ]
}
```

---

## 28. Draft-07 JSON Schemas

### Schema 1 — Content Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:communication:content:entity:v1",
  "title": "Content Entity",
  "description": "Schema for SMOS Content Entity definitions",
  "type": "object",
  "required": ["id", "name", "type", "domain", "owner"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^CCE-[0-9]{3}$"
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
      "pattern": "^CCD-[0-9]{2}$"
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

### Schema 2 — Content Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:communication:content:capability:v1",
  "title": "Content Capability",
  "description": "Schema for SMOS Content Capability definitions",
  "type": "object",
  "required": ["id", "name", "layer"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^CCCAP-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "layer": {
      "type": "string",
      "enum": ["Core", "Abstraction", "Expression"]
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

### Schema 3 — Content State Transition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:communication:content:state:v1",
  "title": "Content State Transition",
  "description": "Schema for Content State transitions in the lifecycle model",
  "type": "object",
  "required": ["from", "to"],
  "properties": {
    "from": {
      "type": "string",
      "pattern": "^CCS-[0-9]{2}$"
    },
    "to": {
      "type": "string",
      "pattern": "^CCS-[0-9]{2}$"
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

### آمار COM-001

| شاخص                    | مقدار                             |
| ----------------------- | --------------------------------- |
| تعداد بخش‌ها            | ۳۰                                |
| تعداد دامنه‌های محتوا   | ۸                                 |
| تعداد مفاهیم محتوا      | ۲۰                                |
| تعداد موجودیت‌های محتوا | ۱۲                                |
| تعداد ویژگی‌های محتوا   | ۸                                 |
| تعداد قابلیت‌های محتوا  | ۱۴                                |
| تعداد کارکردهای محتوا   | ۱۴                                |
| تعداد وضعیت‌های محتوا   | ۸                                 |
| تعداد مراحل چرخه حیات   | ۸                                 |
| تعداد روابط محتوا       | ۱۰                                |
| تعداد معیارهای محتوا    | ۱۵                                |
| تعداد اصول محتوا        | ۸                                 |
| تعداد محدودیت‌های محتوا | ۸                                 |
| تعداد گیت‌های کیفیت     | ۷                                 |
| تعداد لایه‌های معماری   | ۳ (Core, Abstraction, Expression) |
| تعداد JSON Blocks       | ۶                                 |
| تعداد JSON Schemas      | ۳                                 |
| تعداد کل خطوط           | ~۸۵۰                              |

---

## 30. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | توسط        |
| ----------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-07-02 | نگارش اولیه — معماری محتوای سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (CCC-001 تا CCC-020), ۱۲ موجودیت (CCE-001 تا CCE-012), ۱۴ قابلیت (CCCAP-001 تا CCCAP-014), ۱۴ کارکرد (CCF-01 تا CCF-14), ۸ دامنه (CCD-01 تا CCD-08), ۸ وضعیت (CCS-01 تا CCS-08), ۱۰ رابطه (CCR-01 تا CCR-10), ۱۵ معیار (CCM-01 تا CCM-15), ۸ اصل (CCP-01 تا CCP-08), ۸ محدودیت (CCCST-01 تا CCCST-08), ۷ گیت کیفیت (CCQG-01 تا CCQG-07). نخستین سند خانواده COM (Communication Architecture). SSOT معماری محتوای سازمانی SMOS. Architecture Neutral, Platform Neutral, Implementation Free, Vendor Neutral. | معمار سیستم |
