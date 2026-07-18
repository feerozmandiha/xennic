# Enterprise AI Learning Architecture — معماری یادگیری هوش مصنوعی سازمانی

> **شناسه:** KNW-508
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **خانواده:** KNW-AI
> **دامنه:** ALD-01
> **نوع:** AI Learning Architecture
> **تاریخ:** 2026-07-02
> **مسئول:** معمار یادگیری هوش مصنوعی
> **SSOT:** ✅ بله — تک منبع حقیقت معماری یادگیری هوش مصنوعی
> **وابستگی:** KNW-000, KNW-001, KNW-501, KNW-502, KNW-503, KNW-504, KNW-505, KNW-506, KNW-507, AI-000
> **مخاطب:** ai-architect, ai-engineer, prompt-engineer, ml-engineer, ai-operator, ai-auditor

---

## 1. Purpose

### چرا معماری یادگیری؟

عامل‌های هوشمند SMOS برای اثربخشی پایدار باید بتوانند از تجربیات گذشته بیاموزند، رفتار خود را تطبیق دهند و دانش عملیاتی را در طول زمان بهبود بخشند. بدون معماری یادگیری:

- تجربیات موفق و ناموفق Agentها مستند و قابل استفاده مجدد نیستند
- الگوهای رفتاری بهینه از یک Agent به Agent دیگر منتقل نمی‌شوند
- دانش عملیاتی سازمانی در طول زمان تحلیل می‌رود
- Agentها از یک اشتباه دوبار یاد نمی‌گیرند
- بهبود مستمر سازمانی وابسته به مداخله دستی خواهد بود

KNW-508 این مشکلات را با تعریف یک **چارچوب معماری یادگیری** حل می‌کند که نحوه یادگیری، تطبیق و بهبود رفتار Agentهای SMOS را تعریف می‌کند.

### اهداف

1. **تعریف زبان مشترک یادگیری**: همه Agentها از یک چارچوب یادگیری واحد پیروی می‌کنند
2. **جلوگیری از یادگیری پراکنده**: الگوهای یادگیری مشخص و استاندارد
3. **قابلیت ردیابی**: هر فرآیند یادگیری قابل ردیابی، حسابرسی و اشکال‌زدایی است
4. **مقیاس‌پذیری**: Agentهای جدید بدون بازطراحی معماری یادگیری اضافه می‌شوند
5. **خودمختاری در یادگیری**: Agentها می‌توانند بدون مداخله خارجی یاد بگیرند و تطبیق یابند

---

## 2. Scope

### Inside Scope

| حوزه                   | توضیح                    |
| ---------------------- | ------------------------ |
| Learning Concepts      | مفاهیم بنیادین یادگیری   |
| Learning Entities      | موجودیت‌های یادگیری      |
| Learning Capabilities  | قابلیت‌های یادگیری       |
| Learning Functions     | کارکردهای یادگیری        |
| Learning Domains       | دامنه‌های یادگیری        |
| Learning States        | وضعیت‌های یادگیری        |
| Learning Stages        | مراحل یادگیری            |
| Learning Models        | مدل‌های یادگیری          |
| Learning Relationships | روابط یادگیری            |
| Learning Taxonomy      | طبقه‌بندی ابعادی یادگیری |
| Learning Lifecycle     | چرخه حیات یادگیری        |
| Learning Governance    | حکمرانی یادگیری          |
| Agent Learning Mapping | نگاشت یادگیری به Agentها |

### Outside Scope

| حوزه                        | دلیل             |
| --------------------------- | ---------------- |
| پیاده‌سازی پرامپت یادگیری   | حوزه PRM-\*      |
| پیاده‌سازی Workflow یادگیری | حوزه AUT-\*      |
| پروتکل‌های ارتباطی          | پیاده‌سازی فنی   |
| APIها و SDKها               | پیاده‌سازی فنی   |
| کد و الگوریتم               | پیاده‌سازی       |
| محصولات و Vendorها          | خنثی‌بودن فناوری |
| مدل‌های ML/AI خاص           | خنثی‌بودن فناوری |

---

## 3. Learning Principles

| ID     | اصل                  | توضیح                                                         |
| ------ | -------------------- | ------------------------------------------------------------- |
| ALP-01 | **یادگیری خودمختار** | هر Agent autonomously تصمیم می‌گیرد چه چیزی و چگونه یاد بگیرد |
| ALP-02 | **شفافیت**           | همه فرآیندهای یادگیری قابل ردیابی و حسابرسی هستند             |
| ALP-03 | **حداقلی بودن**      | کمترین میزان یادگیری لازم برای دستیابی به هدف                 |
| ALP-04 | **بازخورد محور**     | همه یادگیری‌ها مبتنی بر بازخورد عملکردی هستند                 |
| ALP-05 | **تدریجی بودن**      | یادگیری به صورت تدریجی و افزایشی انجام می‌شود                 |
| ALP-06 | **سازگاری**          | دانش جدید با دانش موجود ادغام می‌شود بدون تناقض               |
| ALP-07 | **بازیابی‌پذیری**    | یادگیری‌های نادرست قابل بازگشت و اصلاح هستند                  |
| ALP-08 | **انتقال‌پذیری**     | یادگیری‌های یک Agent قابل استفاده برای Agentهای دیگر است      |

---

## 4. Learning Concepts

| ID      | مفهوم               | توضیح                                                   | دامنه      |
| ------- | ------------------- | ------------------------------------------------------- | ---------- |
| ALC-001 | Learning Need       | نیاز به یادگیری ناشی از شکاف عملکردی یا دانشی           | ALD-01..08 |
| ALC-002 | Learning Session    | یک جلسه یادگیری شامل جمع‌آوری داده، تحلیل و اعمال تغییر | ALD-01..08 |
| ALC-003 | Learning Objective  | هدف مشخص و قابل اندازه‌گیری برای یادگیری                | ALD-01..08 |
| ALC-004 | Training Data       | داده‌های ورودی برای فرآیند یادگیری                      | ALD-01..08 |
| ALC-005 | Learning Signal     | نشانه یا رویدادی که یادگیری را تحریک می‌کند             | ALD-01..08 |
| ALC-006 | Feedback            | بازخورد عملکردی که مبنای یادگیری قرار می‌گیرد           | ALD-01..08 |
| ALC-007 | Learned Pattern     | الگوی رفتاری یا دانشی که از یادگیری حاصل می‌شود         | ALD-01..08 |
| ALC-008 | Behavior Change     | تغییر در رفتار Agent ناشی از یادگیری                    | ALD-01..08 |
| ALC-009 | Knowledge Update    | به‌روزرسانی پایگاه دانش Agent                           | ALD-03     |
| ALC-010 | Learning Evaluation | ارزیابی اثربخشی یادگیری انجام‌شده                       | ALD-01..08 |
| ALC-011 | Learning Model      | الگوریتم یا متد یادگیری مورد استفاده                    | ALD-01..08 |
| ALC-012 | Learning Strategy   | رویکرد سطح بالا برای هدایت فرآیند یادگیری               | ALD-01..08 |
| ALC-013 | Memory Update       | به‌روزرسانی حافظه عامل بر اساس یادگیری                  | ALD-01..08 |
| ALC-014 | Performance Delta   | تغییر در عملکرد Agent پس از یادگیری                     | ALD-01..08 |
| ALC-015 | Transfer            | انتقال یادگیری از یک Agent به Agent دیگر                | ALD-01..08 |
| ALC-016 | Forgetting          | حذف یا کاهش وزن دانش قدیمی یا نادرست                    | ALD-01..08 |
| ALC-017 | Lesson Learned      | دانش مستند از یک تجربه یادگیری خاص                      | ALD-01..08 |
| ALC-018 | Adaptation          | تطبیق رفتار Agent با شرایط جدید                         | ALD-01..08 |
| ALC-019 | Reinforcement       | تقویت یک رفتار یا دانش از طریق بازخورد مثبت             | ALD-01..08 |
| ALC-020 | Learning Report     | گزارش مستند از فرآیند و نتایج یادگیری                   | ALD-01..08 |

---

## 5. Learning Entities

| ID      | موجودیت             | وضعیت     | توضیح                               | دامنه      |
| ------- | ------------------- | --------- | ----------------------------------- | ---------- |
| ALE-001 | Learning Session    | stateful  | جلسه یادگیری با وضعیت‌های مشخص      | ALD-01..08 |
| ALE-002 | Learning Agent      | stateless | Agent یادگیرنده                     | ALD-01..08 |
| ALE-003 | Training Data Store | stateful  | مخزن داده‌های آموزشی                | ALD-01..08 |
| ALE-004 | Learning Objective  | stateful  | هدف یادگیری با وضعیت پیشرفت         | ALD-01..08 |
| ALE-005 | Feedback Record     | stateful  | بازخورد ثبت‌شده                     | ALD-01..08 |
| ALE-006 | Learned Knowledge   | stateful  | دانش حاصل از یادگیری                | ALD-01..08 |
| ALE-007 | Behavior Pattern    | stateful  | الگوی رفتاری ثبت‌شده                | ALD-01..08 |
| ALE-008 | Learning Evaluation | stateful  | ارزیابی یادگیری                     | ALD-01..08 |
| ALE-009 | Memory Snapshot     | stateful  | تصویر لحظه‌ای حافظه قبل/بعد یادگیری | ALD-01..08 |
| ALE-010 | Learning Log        | stateful  | لاگ کامل فرآیند یادگیری             | ALD-01..08 |
| ALE-011 | Learning Report     | stateful  | گزارش یادگیری                       | ALD-01..08 |
| ALE-012 | Transfer Record     | stateful  | رکورد انتقال یادگیری بین Agentها    | ALD-01..08 |

---

## 6. Learning Capabilities

| ID        | قابلیت                        | توضیح                                        | دامنه      | مرحله   |
| --------- | ----------------------------- | -------------------------------------------- | ---------- | ------- |
| ALCAP-001 | Detect Learning Need          | شناسایی نیاز به یادگیری از شکاف عملکردی      | ALD-01..08 | ALST-01 |
| ALCAP-002 | Define Learning Objective     | تعریف هدف یادگیری قابل اندازه‌گیری           | ALD-01..08 | ALST-02 |
| ALCAP-003 | Collect Training Data         | جمع‌آوری داده‌های آموزشی از منابع مختلف      | ALD-01..08 | ALST-03 |
| ALCAP-004 | Execute Learning              | اجرای فرآیند یادگیری با مدل انتخابی          | ALD-01..08 | ALST-04 |
| ALCAP-005 | Evaluate Learning Outcome     | ارزیابی اثربخشی یادگیری                      | ALD-01..08 | ALST-05 |
| ALCAP-006 | Apply Learned Knowledge       | اعمال دانش حاصل از یادگیری در رفتار          | ALD-01..08 | ALST-06 |
| ALCAP-007 | Update Memory                 | به‌روزرسانی حافظه با دانش جدید               | ALD-01..08 | ALST-06 |
| ALCAP-008 | Transfer Learning             | انتقال دانش یادگرفته‌شده به Agent دیگر       | ALD-01..08 | ALST-07 |
| ALCAP-009 | Revert Learning               | بازگشت یادگیری نادرست                        | ALD-01..08 | ALST-08 |
| ALCAP-010 | Consolidate Knowledge         | تثبیت و یکپارچه‌سازی دانش جدید با دانش موجود | ALD-01..08 | ALST-06 |
| ALCAP-011 | Detect Forgetting Need        | شناسایی نیاز به فراموشی دانش قدیمی یا نادرست | ALD-01..08 | ALST-01 |
| ALCAP-012 | Adapt Behavior                | تطبیق رفتار Agent بر اساس یادگیری            | ALD-01..08 | ALST-06 |
| ALCAP-013 | Generate Learning Report      | تولید گزارش یادگیری                          | ALD-01..08 | ALST-08 |
| ALCAP-014 | Validate Learning Consistency | اعتبارسنجی سازگاری یادگیری با دانش موجود     | ALD-01..08 | ALST-05 |

---

## 7. Learning Functions

| ID     | کارکرد                  | توضیح                                            | دامنه      |
| ------ | ----------------------- | ------------------------------------------------ | ---------- |
| ALF-01 | Need Identification     | شناسایی نیاز یادگیری از بازخورد و عملکرد         | ALD-01..08 |
| ALF-02 | Objective Setting       | تعیین اهداف یادگیری مشخص و قابل اندازه‌گیری      | ALD-01..08 |
| ALF-03 | Data Collection         | جمع‌آوری داده‌های آموزشی از منابع معتبر          | ALD-01..08 |
| ALF-04 | Learning Execution      | اجرای فرآیند یادگیری با مدل و استراتژی مناسب     | ALD-01..08 |
| ALF-05 | Outcome Evaluation      | ارزیابی نتایج یادگیری بر اساس معیارهای تعریف‌شده | ALD-01..08 |
| ALF-06 | Knowledge Application   | اعمال دانش جدید در رفتار عملیاتی Agent           | ALD-01..08 |
| ALF-07 | Memory Integration      | ادغام دانش جدید در حافظه Agent                   | ALD-01..08 |
| ALF-08 | Learning Transfer       | انتقال دانش یادگرفته‌شده به Agentهای دیگر        | ALD-01..08 |
| ALF-09 | Learning Reversion      | بازگشت به حالت قبل از یادگیری در صورت نیاز       | ALD-01..08 |
| ALF-10 | Knowledge Consolidation | تثبیت و یکپارچه‌سازی دانش                        | ALD-03     |
| ALF-11 | Forgetting Management   | مدیریت فراموشی دانش منسوخ یا نادرست              | ALD-01..08 |
| ALF-12 | Behavior Calibration    | تنظیم دقیق رفتار بر اساس یادگیری                 | ALD-01..08 |
| ALF-13 | Report Generation       | تولید گزارش جامع از فرآیند یادگیری               | ALD-01..08 |
| ALF-14 | Learning Audit          | حسابرسی انطباق فرآیند یادگیری با سیاست‌ها        | ALD-01..08 |

---

## 8. Learning Domains

| ID     | دامنه                  | توضیح                                                | نوع     | اولویت |
| ------ | ---------------------- | ---------------------------------------------------- | ------- | ------ |
| ALD-01 | Strategic Learning     | یادگیری استراتژیک — بهبود استراتژی محتوا و هدف‌گذاری | core    | P0     |
| ALD-02 | Operational Learning   | یادگیری عملیاتی — بهبود گردش کار و اجرا              | core    | P0     |
| ALD-03 | Knowledge Learning     | یادگیری دانش — افزایش و بهبود پایگاه دانش            | core    | P0     |
| ALD-04 | Behavioral Learning    | یادگیری رفتاری — بهبود الگوهای تعامل                 | core    | P1     |
| ALD-05 | Performance Learning   | یادگیری عملکرد — بهینه‌سازی معیارهای عملکردی         | support | P1     |
| ALD-06 | Collaborative Learning | یادگیری مشارکتی — بهبود همکاری بین Agentها           | support | P2     |
| ALD-07 | Adaptive Learning      | یادگیری تطبیقی — سازگاری با شرایط متغیر              | support | P1     |
| ALD-08 | Meta Learning          | فرایادگیری — یادگیری درباره نحوه یادگیری             | core    | P2     |

---

## 9. Learning States

| ID     | وضعیت      | توضیح                                   | نهایی |
| ------ | ---------- | --------------------------------------- | ----- |
| ALS-01 | Idle       | آماده برای یادگیری — منتظر محرک یادگیری | خیر   |
| ALS-02 | Detecting  | در حال شناسایی نیاز یادگیری             | خیر   |
| ALS-03 | Planning   | در حال برنامه‌ریزی جلسه یادگیری         | خیر   |
| ALS-04 | Collecting | در حال جمع‌آوری داده‌های آموزشی         | خیر   |
| ALS-05 | Learning   | در حال اجرای فرآیند یادگیری             | خیر   |
| ALS-06 | Evaluating | در حال ارزیابی نتایج یادگیری            | خیر   |
| ALS-07 | Applying   | در حال اعمال یادگیری در رفتار           | خیر   |
| ALS-08 | Completed  | یادگیری کامل و ثبت‌شده                  | بله   |

### انتقال‌های مجاز وضعیت

| از     | به     | شرط                              |
| ------ | ------ | -------------------------------- |
| ALS-01 | ALS-02 | محرک یادگیری شناسایی شد          |
| ALS-01 | ALS-08 | نیاز یادگیری وجود ندارد          |
| ALS-02 | ALS-03 | نیاز یادگیری تأیید شد            |
| ALS-02 | ALS-01 | نیاز یادگیری تأیید نشد           |
| ALS-03 | ALS-04 | برنامه یادگیری تصویب شد          |
| ALS-03 | ALS-01 | برنامه یادگیری رد شد             |
| ALS-04 | ALS-05 | داده‌های آموزشی کافی جمع‌آوری شد |
| ALS-04 | ALS-01 | داده کافی نیست — بازگشت          |
| ALS-05 | ALS-06 | یادگیری کامل شد                  |
| ALS-05 | ALS-01 | یادگیری ناموفق — بازگشت          |
| ALS-06 | ALS-07 | نتایج یادگیری تأیید شد           |
| ALS-06 | ALS-01 | نتایج یادگیری نامعتبر — بازگشت   |
| ALS-07 | ALS-08 | یادگیری با موفقیت اعمال شد       |
| ALS-07 | ALS-05 | یادگیری نیاز به تکرار دارد       |
| ALS-07 | ALS-01 | اعمال یادگیری ناموفق — بازگشت    |
| ALS-08 | ALS-01 | بازنشانی برای یادگیری جدید       |
| ALS-08 | ALS-02 | محرک یادگیری جدید در حین تکمیل   |

---

## 10. Learning Stages

| ID      | مرحله                 | توضیح                | ورودی                      | خروجی                 |
| ------- | --------------------- | -------------------- | -------------------------- | --------------------- |
| ALST-01 | Need Detection        | شناسایی نیاز یادگیری | Performance Data, Feedback | Learning Signal       |
| ALST-02 | Objective Definition  | تعریف هدف یادگیری    | Learning Signal            | Learning Objective    |
| ALST-03 | Data Acquisition      | جمع‌آوری داده آموزشی | Learning Objective         | Training Data         |
| ALST-04 | Learning Execution    | اجرای یادگیری        | Training Data              | Learned Pattern       |
| ALST-05 | Outcome Validation    | اعتبارسنجی نتیجه     | Learned Pattern, Objective | Validation Result     |
| ALST-06 | Knowledge Integration | ادغام دانش           | Validated Pattern, Memory  | Updated Knowledge     |
| ALST-07 | Transfer & Share      | انتقال و اشتراک      | Updated Knowledge          | Transferred Knowledge |
| ALST-08 | Completion & Report   | تکمیل و گزارش        | Full Session Data          | Learning Report       |

---

## 11. Learning Models

| ID      | مدل                         | توضیح                                              | نوع           | کاربرد                   |
| ------- | --------------------------- | -------------------------------------------------- | ------------- | ------------------------ |
| ALMD-01 | Reinforcement from Feedback | یادگیری تقویتی از بازخورد عملکرد                   | Reactive      | بهبود تدریجی رفتار       |
| ALMD-02 | Pattern Recognition         | تشخیص الگو از داده‌های گذشته                       | Analytical    | شناسایی الگوهای موفق     |
| ALMD-03 | Case-Based Learning         | یادگیری مبتنی بر موارد مشابه گذشته                 | Memory        | استفاده از تجربیات مشابه |
| ALMD-04 | Rule Induction              | استخراج قاعده از نمونه‌ها                          | Logical       | تولید قواعد جدید         |
| ALMD-05 | Demonstration Learning      | یادگیری از نمایش یا مثال                           | Observational | تقلید رفتار موفق         |
| ALMD-06 | Self-Supervised Learning    | یادگیری خودنظارت‌شده از داده‌های بدون برچسب        | Autonomous    | کشف الگوهای پنهان        |
| ALMD-07 | Collaborative Learning      | یادگیری مشارکتی با Agentهای دیگر                   | Social        | اشتراک دانش و تجربه      |
| ALMD-08 | Meta-Learning               | یادگیری نحوه یادگیری — بهینه‌سازی استراتژی یادگیری | Strategic     | بهبود کارایی یادگیری     |

---

## 12. Learning Relationships

| ID     | رابطه               | از      | به      | نوع        |
| ------ | ------------------- | ------- | ------- | ---------- |
| ALR-01 | Initiates           | ALE-002 | ALE-001 | Functional |
| ALR-02 | Defines Objective   | ALE-002 | ALE-004 | Behavioral |
| ALR-03 | Uses Training Data  | ALE-001 | ALE-003 | Structural |
| ALR-04 | Produces Knowledge  | ALE-001 | ALE-006 | Functional |
| ALR-05 | Records Feedback    | ALE-002 | ALE-005 | Behavioral |
| ALR-06 | Evaluates Outcome   | ALE-002 | ALE-008 | Functional |
| ALR-07 | Captures Memory     | ALE-001 | ALE-009 | Structural |
| ALR-08 | Generates Log       | ALE-001 | ALE-010 | Functional |
| ALR-09 | Generates Report    | ALE-001 | ALE-011 | Functional |
| ALR-10 | Transfers Knowledge | ALE-002 | ALE-012 | Behavioral |

---

## 13. Learning Metrics

| ID      | معیار                 | توضیح                                      | دامنه      | واحد         |
| ------- | --------------------- | ------------------------------------------ | ---------- | ------------ |
| ALM-001 | Learning Frequency    | تعداد جلسات یادگیری در بازه زمانی          | ALD-01..08 | count/period |
| ALM-002 | Learning Success Rate | درصد جلسات یادگیری موفق                    | ALD-01..08 | percentage   |
| ALM-003 | Performance Delta     | تغییر عملکرد پس از یادگیری                 | ALD-01..08 | percentage   |
| ALM-004 | Knowledge Quality     | کیفیت دانش حاصل از یادگیری                 | ALD-03     | score (1-10) |
| ALM-005 | Learning Latency      | زمان بین شناسایی نیاز تا تکمیل             | ALD-01..08 | seconds      |
| ALM-006 | Transfer Efficiency   | اثربخشی انتقال یادگیری به Agent دیگر       | ALD-01..08 | percentage   |
| ALM-007 | Knowledge Retention   | ماندگاری دانش یادگرفته‌شده                 | ALD-03     | days         |
| ALM-008 | Reversion Rate        | درصد یادگیری‌های بازگشت‌خورده              | ALD-01..08 | percentage   |
| ALM-009 | Objective Achievement | درصد تحقق اهداف یادگیری                    | ALD-01..08 | percentage   |
| ALM-010 | Data Quality Score    | کیفیت داده‌های آموزشی                      | ALD-01..08 | score (1-10) |
| ALM-011 | Model Effectiveness   | اثربخشی مدل یادگیری انتخاب‌شده             | ALD-01..08 | score (1-10) |
| ALM-012 | Learning Consistency  | سازگاری دانش جدید با دانش موجود            | ALD-03     | score (1-10) |
| ALM-013 | Adaptation Speed      | سرعت تطبیق رفتار پس از یادگیری             | ALD-01..08 | seconds      |
| ALM-014 | Knowledge Reuse Rate  | نرخ استفاده مجدد از دانش یادگرفته‌شده      | ALD-01..08 | percentage   |
| ALM-015 | Learning ROI          | بازگشت سرمایه یادگیری نسبت به بهبود عملکرد | ALD-01..08 | percentage   |

---

## 14. Learning Constraints

| ID         | محدودیت                     | توضیح                                                 | دامنه      |
| ---------- | --------------------------- | ----------------------------------------------------- | ---------- |
| ALC-CST-01 | حداکثر تعداد جلسات هم‌زمان  | بیش از ۵ جلسه یادگیری هم‌زمان ممنوع                   | ALD-01..08 |
| ALC-CST-02 | حداقل کیفیت داده            | داده‌های آموزشی باید حداقل امتیاز ۵ از ۱۰ داشته باشند | ALD-01..08 |
| ALC-CST-03 | حداکثر مدت یادگیری          | هر جلسه یادگیری حداکثر ۳۰ دقیقه                       | ALD-01..08 |
| ALC-CST-04 | حداقل عملکرد قبل از یادگیری | عملکرد فعلی باید حداقل ۲۰٪ زیر هدف باشد               | ALD-01..08 |
| ALC-CST-05 | عدم تضاد با دانش موجود      | دانش جدید نباید با دانش موجود در تضاد باشد            | ALD-03     |
| ALC-CST-06 | تأیید انسانی برای ریسک بالا | یادگیری‌های پرریسک نیاز به تأیید انسانی دارند         | ALD-01..08 |
| ALC-CST-07 | حداکثر ۳ بازگشت متوالی      | بیش از ۳ بازگشت متوالی نیاز به مداخله دارد            | ALD-01..08 |
| ALC-CST-08 | حداقل فاصله بین جلسات       | حداقل ۵ دقیقه فاصله بین جلسات یادگیری                 | ALD-01..08 |

---

## 15. Learning Governance

### قواعد حکمرانی

| ID      | قاعده                           | توضیح                                            | سطح      |
| ------- | ------------------------------- | ------------------------------------------------ | -------- |
| ALG-R01 | ثبت تمام جلسات یادگیری          | همه جلسات یادگیری باید در Learning Log ثبت شوند  | الزامی   |
| ALG-R02 | ارزیابی قبل از اعمال            | نتایج یادگیری باید قبل از اعمال ارزیابی شوند     | الزامی   |
| ALG-R03 | عدم اعمال خودکار برای ریسک بالا | یادگیری‌های پرریسک نیاز به تأیید دارند           | الزامی   |
| ALG-R04 | پشتیبان‌گیری قبل از یادگیری     | از Memory Snapshot قبل از یادگیری گرفته شود      | الزامی   |
| ALG-R05 | سازگاری با حکمرانی دانش         | دانش جدید باید با KNW-\* سازگار باشد             | الزامی   |
| ALG-R06 | گزارش دوره‌ای                   | گزارش یادگیری به صورت دوره‌ای تولید شود          | توصیه‌ای |
| ALG-R07 | ممیزی یادگیری                   | فرآیند یادگیری سالانه ممیزی شود                  | الزامی   |
| ALG-R08 | محرمانگی داده‌ها                | داده‌های آموزشی نباید حاوی اطلاعات محرمانه باشند | الزامی   |

### سطوح اختیار یادگیری

| سطح | توضیح                       | مجاز برای                        |
| --- | --------------------------- | -------------------------------- |
| A-0 | بدون یادگیری خودمختار       | Agents با قابلیت یادگیری غیرفعال |
| A-1 | یادگیری با تأیید انسانی     | Agents سطح A-1                   |
| A-2 | یادگیری با تأیید هماهنگ‌ساز | Agents سطح A-2                   |
| A-3 | یادگیری خودمختار با محدودیت | Agents سطح A-3 (پیش‌فرض)         |
| A-4 | یادگیری خودمختار کامل       | AI-014 و Agents سطح A-4          |

---

## 16. Learning Lifecycle

| مرحله          | شناسه   | توضیح                    | ورودی                      | خروجی                | گیت کیفیت |
| -------------- | ------- | ------------------------ | -------------------------- | -------------------- | --------- |
| Need Detection | ALLC-01 | شناسایی نیاز یادگیری     | Performance Data, Feedback | Learning Signal      | QG-AL-01  |
| Planning       | ALLC-02 | برنامه‌ریزی جلسه یادگیری | Learning Signal            | Learning Plan        | QG-AL-02  |
| Preparation    | ALLC-03 | آماده‌سازی داده و ابزار  | Learning Plan              | Prepared Data, Model | QG-AL-03  |
| Execution      | ALLC-04 | اجرای فرآیند یادگیری     | Prepared Data, Model       | Learned Pattern      | QG-AL-04  |
| Validation     | ALLC-05 | اعتبارسنجی نتیجه         | Learned Pattern, Objective | Validated Outcome    | QG-AL-05  |
| Integration    | ALLC-06 | ادغام دانش در Agent      | Validated Outcome, Memory  | Updated Knowledge    | QG-AL-06  |
| Application    | ALLC-07 | اعمال در رفتار عملیاتی   | Updated Knowledge          | Adapted Behavior     | QG-AL-07  |
| Review         | ALLC-08 | بازبینی و گزارش          | Complete Session           | Learning Report, Log | —         |

---

## 17. Quality Gates

| ID       | گیت                                | مرحله   | معیار                                     | خروجی رد              |
| -------- | ---------------------------------- | ------- | ----------------------------------------- | --------------------- |
| QG-AL-01 | Learning Need Validation           | ALLC-01 | نیاز یادگیری معتبر و measurable است       | بازگشت به Idle        |
| QG-AL-02 | Learning Plan Validation           | ALLC-02 | برنامه دارای هدف، مدل و معیار ارزیابی است | بازگشت به Planning    |
| QG-AL-03 | Data Readiness Validation          | ALLC-03 | داده‌ها کیفیت ≥۵ و حجم کافی دارند         | بازگشت به Preparation |
| QG-AL-04 | Execution Validation               | ALLC-04 | الگوی یادگرفته‌شده غیرتهی و غیرتضاد است   | بازگشت به Execution   |
| QG-AL-05 | Outcome Quality Validation         | ALLC-05 | نتایج ≥۷۰٪ هدف را پوشش می‌دهند            | بازگشت به Evaluation  |
| QG-AL-06 | Integration Consistency Validation | ALLC-06 | دانش جدید با دانش موجود سازگار است        | بازگشت به Integration |
| QG-AL-07 | Application Readiness Validation   | ALLC-07 | رفتار تطبیقی‌شده قابل بازگشت است          | بازگشت به Application |

---

## 18. Learning Taxonomy

### ابعاد طبقه‌بندی

| بعد              | شناسه   | توضیح         | مقادیر                                                    |
| ---------------- | ------- | ------------- | --------------------------------------------------------- |
| Learning Scope   | ALT-D01 | گستره یادگیری | Individual, Collaborative, Enterprise                     |
| Learning Trigger | ALT-D02 | محرک یادگیری  | Scheduled, Event-Driven, Demand-Driven, Performance-Based |
| Learning Method  | ALT-D03 | روش یادگیری   | Supervised, Unsupervised, Reinforcement, Observational    |
| Learning Speed   | ALT-D04 | سرعت یادگیری  | Batch, Incremental, Real-Time                             |
| Knowledge Type   | ALT-D05 | نوع دانش حاصل | Procedural, Declarative, Behavioral, Relational           |
| Authority Level  | ALT-D06 | سطح اختیار    | A-0 to A-4                                                |
| Risk Level       | ALT-D07 | سطح ریسک      | Low, Medium, High, Critical                               |
| Domain Scope     | ALT-D08 | دامنه کاربرد  | Mono-Domain, Cross-Domain, Enterprise                     |

---

## 19. Learning Role Mapping

| شناسه     | نقش                | مسئولیت                                | دامنه      |
| --------- | ------------------ | -------------------------------------- | ---------- |
| ROL-AL-01 | Learning Architect | طراحی معماری یادگیری                   | ALD-01..08 |
| ROL-AL-02 | Learning Engineer  | پیاده‌سازی قابلیت‌های یادگیری          | ALD-01..08 |
| ROL-AL-03 | Prompt Engineer    | طراحی پرامپت‌های یادگیری               | ALD-01..08 |
| ROL-AL-04 | Learning Operator  | نظارت بر کیفیت یادگیری‌ها              | ALD-01..08 |
| ROL-AL-05 | Learning Auditor   | حسابرسی انطباق یادگیری                 | ALD-01..08 |
| ROL-AL-06 | Knowledge Steward  | حفاظت از یکپارچگی دانش حاصل از یادگیری | ALD-03     |

---

## 20. Dependencies

### وابستگی‌های بالادستی

| سند     | نوع وابستگی | توضیح                         |
| ------- | ----------- | ----------------------------- |
| KNW-000 | معماری      | معماری مادر دانش سازمانی      |
| KNW-001 | نمایه       | نمایه دانش سازمانی            |
| KNW-501 | پایه        | پایه دانش هوش مصنوعی          |
| KNW-502 | استدلال     | معماری استدلال هوش مصنوعی     |
| KNW-503 | حافظه       | معماری حافظه هوش مصنوعی       |
| KNW-504 | ابزار       | معماری ابزار هوش مصنوعی       |
| KNW-505 | برنامه‌ریزی | معماری برنامه‌ریزی هوش مصنوعی |
| KNW-506 | تصمیم‌گیری  | معماری تصمیم‌گیری هوش مصنوعی  |
| KNW-507 | همکاری      | معماری همکاری هوش مصنوعی      |
| AI-000  | معماری      | معماری مادر عامل‌های هوشمند   |

### وابستگی‌های پایین‌دستی

| سند          | نوع وابستگی | توضیح                                   |
| ------------ | ----------- | --------------------------------------- |
| KNW-509      | مشتق‌شده    | معماری حکمرانی هوش مصنوعی               |
| AI-001..014  | مصرف‌کننده  | تمام Agentها از یادگیری استفاده می‌کنند |
| PRM-430..439 | پیاده‌سازی  | پرامپت‌های یادگیری و بهبود              |

---

## 21. AI Agent Mapping

| Agent  | دامنه      | قابلیت‌ها                                                        | مدل پیش‌فرض | اختیار | مراحل                         |
| ------ | ---------- | ---------------------------------------------------------------- | ----------- | ------ | ----------------------------- |
| AI-001 | ALD-01     | ALCAP-001, ALCAP-002, ALCAP-010                                  | ALMD-02     | A-3    | ALST-01..02, ALST-05..06      |
| AI-002 | ALD-01     | ALCAP-001, ALCAP-002, ALCAP-010                                  | ALMD-03     | A-3    | ALST-01..02, ALST-05..06      |
| AI-003 | ALD-02     | ALCAP-003, ALCAP-004, ALCAP-005, ALCAP-012                       | ALMD-01     | A-2    | ALST-03..06                   |
| AI-004 | ALD-01..08 | ALCAP-005, ALCAP-010, ALCAP-013, ALCAP-014                       | ALMD-05     | A-3    | ALST-01, ALST-05..08          |
| AI-005 | ALD-01     | ALCAP-001, ALCAP-002, ALCAP-010                                  | ALMD-02     | A-3    | ALST-01..02, ALST-05..06      |
| AI-006 | ALD-02     | ALCAP-003, ALCAP-004, ALCAP-012                                  | ALMD-05     | A-2    | ALST-03..06                   |
| AI-007 | ALD-02     | ALCAP-003, ALCAP-004, ALCAP-012                                  | ALMD-05     | A-2    | ALST-03..06                   |
| AI-008 | ALD-02     | ALCAP-003, ALCAP-004, ALCAP-006, ALCAP-007                       | ALMD-01     | A-3    | ALST-03..07                   |
| AI-009 | ALD-04     | ALCAP-001, ALCAP-004, ALCAP-006, ALCAP-012                       | ALMD-07     | A-3    | ALST-01, ALST-04..07          |
| AI-010 | ALD-05     | ALCAP-001, ALCAP-003, ALCAP-005, ALCAP-013                       | ALMD-02     | A-3    | ALST-01, ALST-03..05, ALST-08 |
| AI-011 | ALD-03     | ALCAP-003, ALCAP-007, ALCAP-010, ALCAP-014                       | ALMD-04     | A-3    | ALST-03, ALST-06..08          |
| AI-012 | ALD-01..08 | ALCAP-001..014                                                   | ALMD-08     | A-4    | ALST-01..08                   |
| AI-013 | ALD-03     | ALCAP-001, ALCAP-003, ALCAP-005                                  | ALMD-03     | A-2    | ALST-01..05                   |
| AI-014 | ALD-01..08 | ALCAP-001, ALCAP-002, ALCAP-004, ALCAP-008, ALCAP-013, ALCAP-014 | ALMD-08     | A-4    | ALST-01..08                   |

---

## 22. Naming Rules

| الگو                      | شناسه            | مثال       |
| ------------------------- | ---------------- | ---------- |
| Learning Concepts         | ALC-[0-9]{3}     | ALC-001    |
| Learning Entities         | ALE-[0-9]{3}     | ALE-001    |
| Learning Capabilities     | ALCAP-[0-9]{3}   | ALCAP-001  |
| Learning Functions        | ALF-[0-9]{2}     | ALF-01     |
| Learning Domains          | ALD-[0-9]{2}     | ALD-01     |
| Learning States           | ALS-[0-9]{2}     | ALS-01     |
| Learning Stages           | ALST-[0-9]{2}    | ALST-01    |
| Learning Models           | ALMD-[0-9]{2}    | ALMD-01    |
| Learning Relationships    | ALR-[0-9]{2}     | ALR-01     |
| Learning Metrics          | ALM-[0-9]{3}     | ALM-001    |
| Learning Principles       | ALP-[0-9]{2}     | ALP-01     |
| Learning Constraints      | ALC-CST-[0-9]{2} | ALC-CST-01 |
| Learning Governance Rules | ALG-R[0-9]{2}    | ALG-R01    |
| Quality Gates             | QG-AL-[0-9]{2}   | QG-AL-01   |
| Lifecycle Stages          | ALLC-[0-9]{2}    | ALLC-01    |
| Taxonomy Dimensions       | ALT-D[0-9]{2}    | ALT-D01    |
| Roles                     | ROL-AL-[0-9]{2}  | ROL-AL-01  |

---

## 23. Versioning Strategy

| جنبه                   | رویکرد                                                |
| ---------------------- | ----------------------------------------------------- |
| Semantic Versioning    | SemVer MAJOR.MINOR.PATCH                              |
| MAJOR                  | تغییر در ساختار مفاهیم یا اصول یادگیری                |
| MINOR                  | افزودن مفاهیم، مدل‌ها یا قابلیت‌های جدید              |
| PATCH                  | اصلاح خطاها، بهبود توضیحات، به‌روزرسانی ارجاعات       |
| Pre-release            | پسوند -draft برای نسخه‌های پیش‌نویس                   |
| Frequency              | بر اساس نیاز — هر تغییر توسط معمار یادگیری            |
| Backward Compatibility | نسخه‌های MINOR و PATCH باید backward-compatible باشند |

---

## 24. Cross-References

| سند مبدأ | سند مقصد | نوع ارجاع                         |
| -------- | -------- | --------------------------------- |
| KNW-508  | KNW-000  | معماری — معماری مادر دانش سازمانی |
| KNW-508  | KNW-001  | نمایه — نمایه دانش سازمانی        |
| KNW-508  | KNW-501  | پایه — پایه دانش هوش مصنوعی       |
| KNW-508  | KNW-502  | مشتق‌شده — استدلال یادگیری        |
| KNW-508  | KNW-503  | مشتق‌شده — حافظه یادگیری          |
| KNW-508  | KNW-504  | مشتق‌شده — ابزار یادگیری          |
| KNW-508  | KNW-505  | مشتق‌شده — برنامه‌ریزی یادگیری    |
| KNW-508  | KNW-506  | مشتق‌شده — تصمیم‌گیری یادگیری     |
| KNW-508  | KNW-507  | مشتق‌شده — همکاری در یادگیری      |
| KNW-508  | AI-000   | معماری — معماری مادر Agentها      |

---

## 25. Machine Readable Blocks

### Block 1 — Learning Identity

```json
{
  "id": "KNW-508",
  "name_fa": "معماری یادگیری هوش مصنوعی سازمانی",
  "name_en": "Enterprise AI Learning Architecture",
  "version": "1.0.0-draft",
  "family": "KNW-AI",
  "domain": "ALD-01",
  "type": "AI Learning Architecture",
  "status": "draft",
  "ssot": true,
  "total_concepts": 20,
  "total_entities": 12,
  "total_capabilities": 14,
  "total_functions": 14,
  "total_domains": 8,
  "total_states": 8,
  "total_stages": 8,
  "total_learning_models": 8,
  "total_relationships": 10,
  "total_metrics": 15,
  "total_principles": 8,
  "total_lifecycle_stages": 8,
  "dependencies": [
    "KNW-000",
    "KNW-001",
    "KNW-501",
    "KNW-502",
    "KNW-503",
    "KNW-504",
    "KNW-505",
    "KNW-506",
    "KNW-507",
    "AI-000"
  ]
}
```

### Block 2 — Learning Ontology

```json
{
  "ontology": {
    "concepts": [
      { "id": "ALC-001", "name": "Learning Need", "domain": "ALD-01..08" },
      { "id": "ALC-002", "name": "Learning Session", "domain": "ALD-01..08" },
      { "id": "ALC-003", "name": "Learning Objective", "domain": "ALD-01..08" },
      { "id": "ALC-004", "name": "Training Data", "domain": "ALD-01..08" },
      { "id": "ALC-005", "name": "Learning Signal", "domain": "ALD-01..08" },
      { "id": "ALC-006", "name": "Feedback", "domain": "ALD-01..08" },
      { "id": "ALC-007", "name": "Learned Pattern", "domain": "ALD-01..08" },
      { "id": "ALC-008", "name": "Behavior Change", "domain": "ALD-01..08" },
      { "id": "ALC-009", "name": "Knowledge Update", "domain": "ALD-03" },
      { "id": "ALC-010", "name": "Learning Evaluation", "domain": "ALD-01..08" },
      { "id": "ALC-011", "name": "Learning Model", "domain": "ALD-01..08" },
      { "id": "ALC-012", "name": "Learning Strategy", "domain": "ALD-01..08" },
      { "id": "ALC-013", "name": "Memory Update", "domain": "ALD-01..08" },
      { "id": "ALC-014", "name": "Performance Delta", "domain": "ALD-01..08" },
      { "id": "ALC-015", "name": "Transfer", "domain": "ALD-01..08" },
      { "id": "ALC-016", "name": "Forgetting", "domain": "ALD-01..08" },
      { "id": "ALC-017", "name": "Lesson Learned", "domain": "ALD-01..08" },
      { "id": "ALC-018", "name": "Adaptation", "domain": "ALD-01..08" },
      { "id": "ALC-019", "name": "Reinforcement", "domain": "ALD-01..08" },
      { "id": "ALC-020", "name": "Learning Report", "domain": "ALD-01..08" }
    ],
    "entities": [
      { "id": "ALE-001", "name": "Learning Session", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-002", "name": "Learning Agent", "stateful": false, "domain": "ALD-01..08" },
      { "id": "ALE-003", "name": "Training Data Store", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-004", "name": "Learning Objective", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-005", "name": "Feedback Record", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-006", "name": "Learned Knowledge", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-007", "name": "Behavior Pattern", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-008", "name": "Learning Evaluation", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-009", "name": "Memory Snapshot", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-010", "name": "Learning Log", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-011", "name": "Learning Report", "stateful": true, "domain": "ALD-01..08" },
      { "id": "ALE-012", "name": "Transfer Record", "stateful": true, "domain": "ALD-01..08" }
    ],
    "state_machine": {
      "states": ["ALS-01", "ALS-02", "ALS-03", "ALS-04", "ALS-05", "ALS-06", "ALS-07", "ALS-08"],
      "transitions": [
        { "from": "ALS-01", "to": "ALS-02" },
        { "from": "ALS-01", "to": "ALS-08" },
        { "from": "ALS-02", "to": "ALS-03" },
        { "from": "ALS-02", "to": "ALS-01" },
        { "from": "ALS-03", "to": "ALS-04" },
        { "from": "ALS-03", "to": "ALS-01" },
        { "from": "ALS-04", "to": "ALS-05" },
        { "from": "ALS-04", "to": "ALS-01" },
        { "from": "ALS-05", "to": "ALS-06" },
        { "from": "ALS-05", "to": "ALS-01" },
        { "from": "ALS-06", "to": "ALS-07" },
        { "from": "ALS-06", "to": "ALS-01" },
        { "from": "ALS-07", "to": "ALS-08" },
        { "from": "ALS-07", "to": "ALS-05" },
        { "from": "ALS-07", "to": "ALS-01" },
        { "from": "ALS-08", "to": "ALS-01" },
        { "from": "ALS-08", "to": "ALS-02" }
      ]
    }
  }
}
```

### Block 3 — Learning Registry

```json
{
  "registry": {
    "domains": [
      { "id": "ALD-01", "name": "Strategic Learning", "type": "core", "priority": "P0" },
      { "id": "ALD-02", "name": "Operational Learning", "type": "core", "priority": "P0" },
      { "id": "ALD-03", "name": "Knowledge Learning", "type": "core", "priority": "P0" },
      { "id": "ALD-04", "name": "Behavioral Learning", "type": "core", "priority": "P1" },
      { "id": "ALD-05", "name": "Performance Learning", "type": "support", "priority": "P1" },
      { "id": "ALD-06", "name": "Collaborative Learning", "type": "support", "priority": "P2" },
      { "id": "ALD-07", "name": "Adaptive Learning", "type": "support", "priority": "P1" },
      { "id": "ALD-08", "name": "Meta Learning", "type": "core", "priority": "P2" }
    ],
    "models": [
      {
        "id": "ALMD-01",
        "name": "Reinforcement from Feedback",
        "type": "Reactive",
        "description": "یادگیری تقویتی از بازخورد عملکرد"
      },
      {
        "id": "ALMD-02",
        "name": "Pattern Recognition",
        "type": "Analytical",
        "description": "تشخیص الگو از داده‌های گذشته"
      },
      {
        "id": "ALMD-03",
        "name": "Case-Based Learning",
        "type": "Memory",
        "description": "یادگیری مبتنی بر موارد مشابه"
      },
      {
        "id": "ALMD-04",
        "name": "Rule Induction",
        "type": "Logical",
        "description": "استخراج قاعده از نمونه‌ها"
      },
      {
        "id": "ALMD-05",
        "name": "Demonstration Learning",
        "type": "Observational",
        "description": "یادگیری از نمایش یا مثال"
      },
      {
        "id": "ALMD-06",
        "name": "Self-Supervised Learning",
        "type": "Autonomous",
        "description": "یادگیری خودنظارت‌شده"
      },
      {
        "id": "ALMD-07",
        "name": "Collaborative Learning",
        "type": "Social",
        "description": "یادگیری مشارکتی"
      },
      {
        "id": "ALMD-08",
        "name": "Meta-Learning",
        "type": "Strategic",
        "description": "فرایادگیری — بهینه‌سازی یادگیری"
      }
    ]
  }
}
```

### Block 4 — Learning Relationships

```json
{
  "relationships": [
    {
      "id": "ALR-01",
      "name": "Initiates",
      "from": "ALE-002",
      "to": "ALE-001",
      "type": "Functional"
    },
    {
      "id": "ALR-02",
      "name": "Defines Objective",
      "from": "ALE-002",
      "to": "ALE-004",
      "type": "Behavioral"
    },
    {
      "id": "ALR-03",
      "name": "Uses Training Data",
      "from": "ALE-001",
      "to": "ALE-003",
      "type": "Structural"
    },
    {
      "id": "ALR-04",
      "name": "Produces Knowledge",
      "from": "ALE-001",
      "to": "ALE-006",
      "type": "Functional"
    },
    {
      "id": "ALR-05",
      "name": "Records Feedback",
      "from": "ALE-002",
      "to": "ALE-005",
      "type": "Behavioral"
    },
    {
      "id": "ALR-06",
      "name": "Evaluates Outcome",
      "from": "ALE-002",
      "to": "ALE-008",
      "type": "Functional"
    },
    {
      "id": "ALR-07",
      "name": "Captures Memory",
      "from": "ALE-001",
      "to": "ALE-009",
      "type": "Structural"
    },
    {
      "id": "ALR-08",
      "name": "Generates Log",
      "from": "ALE-001",
      "to": "ALE-010",
      "type": "Functional"
    },
    {
      "id": "ALR-09",
      "name": "Generates Report",
      "from": "ALE-001",
      "to": "ALE-011",
      "type": "Functional"
    },
    {
      "id": "ALR-10",
      "name": "Transfers Knowledge",
      "from": "ALE-002",
      "to": "ALE-012",
      "type": "Behavioral"
    }
  ]
}
```

### Block 5 — AI Agent Learning Mapping

```json
{
  "agent_learning": [
    {
      "agent": "AI-001",
      "domain": "ALD-01",
      "capabilities": ["ALCAP-001", "ALCAP-002", "ALCAP-010"],
      "default_model": "ALMD-02",
      "authority": "A-3",
      "stages": ["ALST-01..02", "ALST-05..06"]
    },
    {
      "agent": "AI-002",
      "domain": "ALD-01",
      "capabilities": ["ALCAP-001", "ALCAP-002", "ALCAP-010"],
      "default_model": "ALMD-03",
      "authority": "A-3",
      "stages": ["ALST-01..02", "ALST-05..06"]
    },
    {
      "agent": "AI-003",
      "domain": "ALD-02",
      "capabilities": ["ALCAP-003", "ALCAP-004", "ALCAP-005", "ALCAP-012"],
      "default_model": "ALMD-01",
      "authority": "A-2",
      "stages": ["ALST-03..06"]
    },
    {
      "agent": "AI-004",
      "domain": "ALD-01..08",
      "capabilities": ["ALCAP-005", "ALCAP-010", "ALCAP-013", "ALCAP-014"],
      "default_model": "ALMD-05",
      "authority": "A-3",
      "stages": ["ALST-01", "ALST-05..08"]
    },
    {
      "agent": "AI-005",
      "domain": "ALD-01",
      "capabilities": ["ALCAP-001", "ALCAP-002", "ALCAP-010"],
      "default_model": "ALMD-02",
      "authority": "A-3",
      "stages": ["ALST-01..02", "ALST-05..06"]
    },
    {
      "agent": "AI-006",
      "domain": "ALD-02",
      "capabilities": ["ALCAP-003", "ALCAP-004", "ALCAP-012"],
      "default_model": "ALMD-05",
      "authority": "A-2",
      "stages": ["ALST-03..06"]
    },
    {
      "agent": "AI-007",
      "domain": "ALD-02",
      "capabilities": ["ALCAP-003", "ALCAP-004", "ALCAP-012"],
      "default_model": "ALMD-05",
      "authority": "A-2",
      "stages": ["ALST-03..06"]
    },
    {
      "agent": "AI-008",
      "domain": "ALD-02",
      "capabilities": ["ALCAP-003", "ALCAP-004", "ALCAP-006", "ALCAP-007"],
      "default_model": "ALMD-01",
      "authority": "A-3",
      "stages": ["ALST-03..07"]
    },
    {
      "agent": "AI-009",
      "domain": "ALD-04",
      "capabilities": ["ALCAP-001", "ALCAP-004", "ALCAP-006", "ALCAP-012"],
      "default_model": "ALMD-07",
      "authority": "A-3",
      "stages": ["ALST-01", "ALST-04..07"]
    },
    {
      "agent": "AI-010",
      "domain": "ALD-05",
      "capabilities": ["ALCAP-001", "ALCAP-003", "ALCAP-005", "ALCAP-013"],
      "default_model": "ALMD-02",
      "authority": "A-3",
      "stages": ["ALST-01", "ALST-03..05", "ALST-08"]
    },
    {
      "agent": "AI-011",
      "domain": "ALD-03",
      "capabilities": ["ALCAP-003", "ALCAP-007", "ALCAP-010", "ALCAP-014"],
      "default_model": "ALMD-04",
      "authority": "A-3",
      "stages": ["ALST-03", "ALST-06..08"]
    },
    {
      "agent": "AI-012",
      "domain": "ALD-01..08",
      "capabilities": [
        "ALCAP-001",
        "ALCAP-002",
        "ALCAP-003",
        "ALCAP-004",
        "ALCAP-005",
        "ALCAP-006",
        "ALCAP-007",
        "ALCAP-008",
        "ALCAP-009",
        "ALCAP-010",
        "ALCAP-011",
        "ALCAP-012",
        "ALCAP-013",
        "ALCAP-014"
      ],
      "default_model": "ALMD-08",
      "authority": "A-4",
      "stages": ["ALST-01..08"]
    },
    {
      "agent": "AI-013",
      "domain": "ALD-03",
      "capabilities": ["ALCAP-001", "ALCAP-003", "ALCAP-005"],
      "default_model": "ALMD-03",
      "authority": "A-2",
      "stages": ["ALST-01..05"]
    },
    {
      "agent": "AI-014",
      "domain": "ALD-01..08",
      "capabilities": [
        "ALCAP-001",
        "ALCAP-002",
        "ALCAP-004",
        "ALCAP-008",
        "ALCAP-013",
        "ALCAP-014"
      ],
      "default_model": "ALMD-08",
      "authority": "A-4",
      "stages": ["ALST-01..08"]
    }
  ]
}
```

### Block 6 — Statistics

```json
{
  "statistics": {
    "total_concepts": 20,
    "total_entities": 12,
    "total_capabilities": 14,
    "total_functions": 14,
    "total_domains": 8,
    "total_states": 8,
    "total_transitions": 18,
    "total_stages": 8,
    "total_learning_models": 8,
    "total_relationships": 10,
    "total_metrics": 15,
    "total_principles": 8,
    "total_lifecycle_stages": 8,
    "total_constraints": 8,
    "total_quality_gates": 7,
    "total_validation_rules": 12,
    "total_governance_rules": 8,
    "total_agents_mapped": 14,
    "taxonomy_dimensions": 8,
    "toplevel_predicates": ["is_learning", "is_evaluating", "is_applying", "is_completed"],
    "lowest_state": "ALS-01",
    "highest_state": "ALS-08"
  }
}
```

---

## JSON Schemas (Draft-07)

### Schema 1 — Learning Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:ai:learning:entity:v1",
  "title": "Learning Entity",
  "description": "Schema for SMOS Learning Entity definitions",
  "type": "object",
  "required": ["id", "name", "domain"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^ALE-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "domain": {
      "type": "string",
      "pattern": "^ALD-[0-9]{2}$"
    },
    "stateful": {
      "type": "boolean"
    },
    "components": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 10
    }
  },
  "additionalProperties": false
}
```

### Schema 2 — Learning Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:ai:learning:capability:v1",
  "title": "Learning Capability",
  "description": "Schema for SMOS Learning Capability definitions",
  "type": "object",
  "required": ["id", "name", "domain", "stage"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^ALCAP-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "domain": {
      "type": "string",
      "pattern": "^ALD-[0-9]{2}$"
    },
    "stage": {
      "type": "string",
      "pattern": "^ALST-[0-9]{2}$"
    },
    "learning_models": {
      "type": "array",
      "items": { "type": "string", "pattern": "^ALMD-[0-9]{2}$" },
      "maxItems": 8
    },
    "applicable_agents": {
      "type": "array",
      "items": { "type": "string", "pattern": "^AI-[0-9]{3}$" },
      "maxItems": 20
    }
  },
  "additionalProperties": false
}
```

### Schema 3 — Learning State

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:ai:learning:state:v1",
  "title": "Learning State",
  "description": "Schema for SMOS Learning State machine definitions",
  "type": "object",
  "required": ["id", "name", "is_final"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^ALS-[0-9]{2}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50
    },
    "description": {
      "type": "string",
      "maxLength": 300
    },
    "is_final": {
      "type": "boolean"
    },
    "transitions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["to"],
        "properties": {
          "to": { "type": "string", "pattern": "^ALS-[0-9]{2}$" },
          "condition": { "type": "string", "maxLength": 200 }
        }
      },
      "maxItems": 10
    }
  },
  "additionalProperties": false
}
```

---

## Statistics

### آمار KNW-508

| شاخص                      | مقدار |
| ------------------------- | ----- |
| تعداد مفاهیم یادگیری      | ۲۰    |
| تعداد موجودیت‌های یادگیری | ۱۲    |
| تعداد قابلیت‌های یادگیری  | ۱۴    |
| تعداد کارکردهای یادگیری   | ۱۴    |
| تعداد دامنه‌های یادگیری   | ۸     |
| تعداد وضعیت‌های یادگیری   | ۸     |
| تعداد انتقال‌های مجاز     | ۱۸    |
| تعداد مراحل یادگیری       | ۸     |
| تعداد مدل‌های یادگیری     | ۸     |
| تعداد روابط یادگیری       | ۱۰    |
| تعداد محدودیت‌های یادگیری | ۸     |
| تعداد معیارهای کلیدی      | ۱۵    |
| تعداد اصول یادگیری        | ۸     |
| تعداد اهداف یادگیری       | ۸     |
| تعداد مراحل چرخه حیات     | ۸     |
| تعداد گیت‌های کیفیت       | ۷     |
| تعداد قواعد اعتبارسنجی    | ۱۲    |
| تعداد قواعد حکمرانی       | ۸     |
| تعداد ابعاد تاکسونومی     | ۸     |
| تعداد Agentهای نگاشت‌شده  | ۱۴    |

### ذی‌نفعان

| شناسه     | ذی‌نفع            | نقش                                    |
| --------- | ----------------- | -------------------------------------- |
| STK-AL-01 | AI Architect      | طراحی معماری یادگیری Agentها           |
| STK-AL-02 | AI Engineer       | پیاده‌سازی قابلیت‌های یادگیری          |
| STK-AL-03 | Prompt Engineer   | طراحی پرامپت‌های یادگیری               |
| STK-AL-04 | AI Operator       | نظارت بر کیفیت یادگیری‌ها              |
| STK-AL-05 | AI Auditor        | حسابرسی انطباق یادگیری‌ها              |
| STK-AL-06 | Knowledge Steward | حفاظت از یکپارچگی دانش حاصل از یادگیری |

---

## Roadmap

### نقشه راه توسعه معماری یادگیری

| فاز           | اسپرینت    | تمرکز                | اسناد       |
| ------------- | ---------- | -------------------- | ----------- |
| Foundation    | P6.S20     | پایه دانش هوش مصنوعی | KNW-501     |
| Reasoning     | P6.S21     | معماری استدلال       | KNW-502     |
| Memory        | P6.S22     | معماری حافظه         | KNW-503     |
| Tool          | P6.S23     | معماری ابزار         | KNW-504     |
| Planning      | P6.S24     | معماری برنامه‌ریزی   | KNW-505     |
| Decision      | P6.S25     | معماری تصمیم‌گیری    | KNW-506     |
| Collaboration | P6.S26     | معماری همکاری        | KNW-507     |
| **Learning**  | **P6.S27** | **معماری یادگیری**   | **KNW-508** |
| Governance    | P6.S28     | معماری حکمرانی       | KNW-509     |

---

## Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | توسط        |
| ----------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-07-02 | نگارش اولیه — معماری یادگیری هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (ALC-001 تا ALC-020), ۱۲ موجودیت (ALE-001 تا ALE-012), ۱۴ قابلیت (ALCAP-001 تا ALCAP-014), ۱۴ کارکرد (ALF-01 تا ALF-14), ۸ دامنه (ALD-01 تا ALD-08), ۸ وضعیت (ALS-01 تا ALS-08), ۸ مرحله (ALST-01 تا ALST-08), ۸ مدل یادگیری (ALMD-01 تا ALMD-08), ۱۰ رابطه (ALR-01 تا ALR-10), ۱۵ معیار (ALM-001 تا ALM-015). هشتمین و آخرین سند خانواده KNW-AI. Architecture Neutral, Implementation Free, Vendor Neutral. | معمار سیستم |
