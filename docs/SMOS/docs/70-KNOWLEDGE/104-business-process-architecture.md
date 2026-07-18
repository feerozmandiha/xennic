# Enterprise Business Process Architecture — معماری فرآیندهای کسب‌وکار سازمانی

> **شناسه:** KNW-103
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-29
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** [KNW-101](./100-business-knowledge-foundation.md), [KNW-102](./102-business-rules-policies.md), [KNW-000](./00-enterprise-knowledge-architecture.md), [KNW-001](./10-knowledge-index.md), [CON-000](../05-CONSTITUTION/00-constitution.md)
> **مخاطب:** human, ai-agent, knowledge-engineer, business-analyst, process-architect

---

## ۱. Purpose

KNW-103 تنها SSOT (تک منبع حقیقت) برای معماری فرآیندهای کسب‌وکار سازمانی SMOS است.

### چرا KNW-103 وجود دارد

بدون یک معماری فرآیند کسب‌وکار:

- فرآیندها بدون ساختار و پراکنده تعریف می‌شوند
- فعالیت‌های کسب‌وکار مرز مشخصی ندارند
- رویدادها و محرک‌های فرآیند مستند نیستند
- پیامدهای فرآیند قابل اندازه‌گیری نیستند
- زنجیره ارزش کسب‌وکار ناقص می‌ماند
- اتوماسیون فرآیند (AUT-\*) بدون پایه معماری طراحی می‌شود

KNW-103 این مشکلات را با تعریف **چارچوب معماری فرآیندهای کسب‌وکار** حل می‌کند.

### نقش KNW-103 در SMOS

| سند         | نقش                                               |
| ----------- | ------------------------------------------------- |
| CON-000     | قانون اساسی — اصول عالی                           |
| KNW-101     | SSOT مفاهیم، موجودیت‌ها و قابلیت‌های کسب‌وکار     |
| KNW-102     | SSOT قوانین، سیاست‌ها و محدودیت‌های رسمی کسب‌وکار |
| **KNW-103** | **SSOT معماری فرآیندهای کسب‌وکار**                |
| AUT-\*      | پیاده‌سازی Workflowهای خودکار (ارجاع به KNW-103)  |

### مرزهای معماری

KNW-103 معماری فرآیند را تعریف می‌کند — نه پیاده‌سازی را:

- فرآیندها → به صورت مفهومی و معماری تعریف می‌شوند
- Workflowها → در AUT-\* پیاده‌سازی می‌شوند
- Agentها → در AI-\* تعریف می‌شوند
- قوانین → در KNW-102 تعریف می‌شوند

---

## ۲. Scope

### Inside Scope

| حوزه                  | توضیح                   |
| --------------------- | ----------------------- |
| فلسفه فرآیند کسب‌وکار | هستی‌شناسی فرآیند       |
| تاکسونومی فرآیند      | سلسله‌مراتب و دسته‌بندی |
| چرخه حیات فرآیند      | مراحل عمر یک فرآیند     |
| وضعیت‌های فرآیند      | حالت‌های ممکن           |
| دسته‌بندی فرآیند      | انواع فرآیند            |
| مدل فعالیت            | فعالیت‌های کسب‌وکار     |
| مدل وظیفه             | وظایف اتمیک             |
| مدل رویداد            | رویدادهای کسب‌وکار      |
| مدل محرک              | شروع‌کننده‌های فرآیند   |
| مدل پیامد             | خروجی‌های مطلوب         |
| جریان ارزش            | زنجیره ارزش             |
| مالکیت فرآیند         | صاحبان فرآیند           |
| وابستگی بین فرآیندی   | DAG وابستگی‌ها          |

### Outside Scope

| حوزه                | دلیل                 |
| ------------------- | -------------------- |
| Workflow اجرایی     | حوزه AUT-\*          |
| هماهنگ‌سازی Agent   | حوزه AI-014          |
| قوانین و سیاست‌ها   | حوزه KNW-102         |
| مفاهیم و موجودیت‌ها | حوزه KNW-101         |
| BPMN, UML, Diagram  | خارج از Scope معماری |
| پیاده‌سازی فنی      | خارج از Scope معماری |

---

## ۳. Business Process Philosophy

### فلسفه فرآیند کسب‌وکار

SMOS فرآیندهای کسب‌وکار را به عنوان **جریان ارزش سازمانی** می‌بیند که:

1. **هدف‌محور هستند** — هر فرآیند یک پیامد مشخص دارد
2. **مرز دارند** — شروع و پایان مشخص دارند
3. **تکرارپذیر هستند** — قابل اجرای مکرر با نتیجه یکسان
4. **اندازه‌پذیر هستند** — می‌توان KPI برایشان تعریف کرد
5. **تکامل‌پذیر هستند** — در طول زمان بهبود می‌یابند

### اصول هستی‌شناسی فرآیند

| اصل                                  | توضیح                       |
| ------------------------------------ | --------------------------- |
| **فرآیند یک جریان است**              | دارای ورودی، فعالیت، خروجی  |
| **فرآیند توسط رویداد فعال می‌شود**   | یک محرک شروع‌کننده          |
| **فرآیند به فعالیت‌ها تقسیم می‌شود** | فعالیت‌ها اجزای فرآیند      |
| **فعالیت به وظایف تقسیم می‌شود**     | وظایف اتمیک (غیرقابل تقسیم) |
| **فرآیند یک پیامد دارد**             | خروجی مطلوب یا نامطلوب      |

---

## ۴. Architecture Principles

### اصول معماری فرآیند

| ID     | اصل                | توضیح                                               |
| ------ | ------------------ | --------------------------------------------------- |
| PAP-01 | **SSOT**           | هر فرآیند تنها در KNW-103 تعریف می‌شود              |
| PAP-02 | **سلسله‌مراتب**    | فرآیندها → فعالیت‌ها → وظایف                        |
| PAP-03 | **یکپارچگی**       | فرآیندها با KNW-101 و KNW-102 سازگار هستند          |
| PAP-04 | **عدم پیاده‌سازی** | KNW-103 معماری را تعریف می‌کند — AUT-\* اجرا می‌کند |
| PAP-05 | **عدم بازتعریف**   | مفاهیم KNW-101 و KNW-102 بازتعریف نمی‌شوند          |
| PAP-06 | **قابلیت ردیابی**  | هر فرآیند تا پیاده‌سازی قابل ردیابی است             |
| PAP-07 | **خنثی بودن**      | فرآیندها مستقل از ابزار، پلتفرم و تکنولوژی          |

---

## ۵. Process Taxonomy

### تاکسونومی فرآیند

| سطح         | شناسه  | توضیح                    | مثال                |
| ----------- | ------ | ------------------------ | ------------------- |
| Enterprise  | TAX-01 | فرآیندهای کلان سازمانی   | مدیریت حضور دیجیتال |
| Domain      | TAX-02 | فرآیندهای یک دامنه       | چرخه محتوا          |
| Operational | TAX-03 | فرآیندهای عملیاتی روزانه | انتشار محتوا        |
| Task        | TAX-04 | وظایف اتمیک              | ایجاد پست           |

### خانواده فرآیندها

| خانواده                | شناسه   | سطح    | توضیح               |
| ---------------------- | ------- | ------ | ------------------- |
| Content Lifecycle      | FAM-P01 | TAX-02 | چرخه کامل محتوا     |
| Campaign Management    | FAM-P02 | TAX-02 | مدیریت کارزار       |
| Knowledge Management   | FAM-P03 | TAX-02 | مدیریت دانش         |
| Analytics & Reporting  | FAM-P04 | TAX-03 | تحلیل و گزارش       |
| Community Engagement   | FAM-P05 | TAX-03 | تعامل با جامعه      |
| Improvement & Learning | FAM-P06 | TAX-02 | بهبود مستمر         |
| Orchestration          | FAM-P07 | TAX-01 | هماهنگ‌سازی سازمانی |

---

## ۶. Process Classification

### دسته‌بندی فرآیندها

| بعد        | دسته            | شناسه   | توضیح                     |
| ---------- | --------------- | ------- | ------------------------- |
| ماهیت      | Core            | CLS-C01 | فرآیندهای اصلی ارزش‌آفرین |
| ماهیت      | Supporting      | CLS-C02 | فرآیندهای پشتیبان         |
| ماهیت      | Governance      | CLS-C03 | فرآیندهای حکمرانی         |
| زمان       | Continuous      | CLS-T01 | فرآیندهای پیوسته          |
| زمان       | Batch           | CLS-T02 | فرآیندهای دوره‌ای         |
| زمان       | On-Demand       | CLS-T03 | فرآیندهای درخواستی        |
| خودکارسازی | Manual          | CLS-A01 | فرآیند دستی               |
| خودکارسازی | Semi-Automated  | CLS-A02 | نیمه‌خودکار               |
| خودکارسازی | Fully Automated | CLS-A03 | کاملاً خودکار             |

---

## ۷. Process Lifecycle

### چرخه حیات فرآیند

| مرحله     | شناسه  | توضیح                     |
| --------- | ------ | ------------------------- |
| Define    | PLC-01 | تعریف و مستندسازی         |
| Validate  | PLC-02 | اعتبارسنجی با Stakeholder |
| Implement | PLC-03 | پیاده‌سازی (AUT-\*)       |
| Execute   | PLC-04 | اجرا                      |
| Monitor   | PLC-05 | نظارت و اندازه‌گیری       |
| Improve   | PLC-06 | بهبود و بهینه‌سازی        |
| Retire    | PLC-07 | بازنشستگی                 |

### قواعد چرخه حیات

| ID      | قاعده                                        |
| ------- | -------------------------------------------- |
| PLC-R01 | فرآیند قبل از پیاده‌سازی باید اعتبارسنجی شود |
| PLC-R02 | فرآیند در حال اجرا باید KPI داشته باشد       |
| PLC-R03 | فرآیند بازنشسته باید در AUT-\* غیرفعال شود   |

---

## ۸. Process States

### وضعیت‌های فرآیند

| وضعیت     | شناسه  | توضیح                | مجوز اجرا |
| --------- | ------ | -------------------- | --------- |
| Defined   | PST-01 | تعریف‌شده در KNW-103 | —         |
| Validated | PST-02 | اعتبارسنجی‌شده       | —         |
| Active    | PST-03 | در حال اجرا          | ✓         |
| Suspended | PST-04 | متوقف موقت           | —         |
| Completed | PST-05 | تکمیل موفق           | —         |
| Failed    | PST-06 | شکست در اجرا         | —         |
| Retired   | PST-07 | بازنشسته             | —         |

### ماشین وضعیت

`Defined → Validated → Active → Completed
                         ↓          ↓
                    Suspended     Failed
                         ↓
                    Active (resume)
                         ↓
                    Retired`

---

## ۹. Process Categories

### دسته‌بندی فرآیندهای مرجع

| ID       | فرآیند مرجع                      | خانواده | ماهیت      | توضیح                                 |
| -------- | -------------------------------- | ------- | ---------- | ------------------------------------- |
| PROC-001 | Content Lifecycle Management     | FAM-P01 | Core       | چرخه کامل محتوا از استراتژی تا انتشار |
| PROC-002 | Campaign Planning & Execution    | FAM-P02 | Core       | برنامه‌ریزی و اجرای کارزار            |
| PROC-003 | Content Production Pipeline      | FAM-P01 | Core       | خط تولید محتوا                        |
| PROC-004 | Publishing & Distribution        | FAM-P01 | Core       | انتشار و توزیع چندپلتفرمی             |
| PROC-005 | Community Interaction            | FAM-P05 | Supporting | تعامل و مدیریت جامعه                  |
| PROC-006 | Performance Analysis             | FAM-P04 | Supporting | تحلیل عملکرد و گزارش                  |
| PROC-007 | Knowledge Capture & Registration | FAM-P03 | Supporting | ضبط و ثبت دانش                        |
| PROC-008 | Continuous Improvement           | FAM-P06 | Governance | بهبود مستمر و یادگیری                 |
| PROC-009 | Enterprise Orchestration         | FAM-P07 | Governance | هماهنگ‌سازی سازمانی                   |

---

## ۱۰. Business Activity Model

### مدل فعالیت کسب‌وکار

| ID      | فعالیت               | فرآیند مرجع | توضیح                |
| ------- | -------------------- | ----------- | -------------------- |
| ACT-001 | Strategy Formulation | PROC-001    | تدوین استراتژی محتوا |
| ACT-002 | Content Planning     | PROC-001    | برنامه‌ریزی تحریریه  |
| ACT-003 | Content Creation     | PROC-003    | تولید محتوای متعارف  |
| ACT-004 | Media Production     | PROC-003    | تولید دارایی رسانه   |
| ACT-005 | Content Review       | PROC-003    | بازبینی کیفیت        |
| ACT-006 | SEO Optimization     | PROC-003    | بهینه‌سازی جستجو     |
| ACT-007 | Publishing           | PROC-004    | انتشار در پلتفرم     |
| ACT-008 | Distribution         | PROC-004    | توزیع خودکار         |
| ACT-009 | Community Monitoring | PROC-005    | نظارت بر جامعه       |
| ACT-010 | Response Management  | PROC-005    | مدیریت پاسخ‌ها       |
| ACT-011 | Data Collection      | PROC-006    | جمع‌آوری داده        |
| ACT-012 | Report Generation    | PROC-006    | تولید گزارش          |
| ACT-013 | Knowledge Extraction | PROC-007    | استخراج دانش         |
| ACT-014 | Knowledge Validation | PROC-007    | اعتبارسنجی دانش      |
| ACT-015 | Gap Analysis         | PROC-008    | تحلیل شکاف           |
| ACT-016 | Improvement Planning | PROC-008    | برنامه‌ریزی بهبود    |
| ACT-017 | Task Decomposition   | PROC-009    | تجزیه وظایف          |
| ACT-018 | Agent Assignment     | PROC-009    | تخصیص عامل           |

### ساختار فعالیت

| عنصر        | شناسه    | اجباری | توضیح            |
| ----------- | -------- | ------ | ---------------- |
| شناسه       | ACT-ID   | بله    | ACT-XXX          |
| نام         | ACT-NAME | بله    | نام فعالیت       |
| فرآیند والد | ACT-PROC | بله    | PROC-XXX         |
| ورودی       | ACT-IN   | خیر    | ورودی‌های فعالیت |
| خروجی       | ACT-OUT  | بله    | خروجی فعالیت     |
| مسئول       | ACT-OWN  | بله    | نقش یا Agent     |

---

## ۱۱. Business Task Model

### مدل وظیفه کسب‌وکار

| ID      | وظیفه                  | فعالیت والد | توضیح              | قابل خودکارسازی |
| ------- | ---------------------- | ----------- | ------------------ | --------------- |
| TSK-001 | Audience Research      | ACT-001     | پژوهش مخاطب        | Partial         |
| TSK-002 | Content Calendar Setup | ACT-002     | تنظیم تقویم محتوا  | Yes             |
| TSK-003 | Copywriting            | ACT-003     | نگارش متن          | Yes             |
| TSK-004 | Visual Design          | ACT-004     | طراحی بصری         | Partial         |
| TSK-005 | Quality Check          | ACT-005     | بررسی کیفیت        | Yes             |
| TSK-006 | Metadata Tagging       | ACT-006     | برچسب‌زنی فراداده  | Yes             |
| TSK-007 | Platform Upload        | ACT-007     | بارگذاری در پلتفرم | Yes             |
| TSK-008 | Comment Triage         | ACT-009     | دسته‌بندی نظرات    | Yes             |
| TSK-009 | KPI Calculation        | ACT-011     | محاسبه KPI         | Yes             |
| TSK-010 | Knowledge Registration | ACT-013     | ثبت دانش           | Yes             |

### قواعد وظیفه

| ID     | قاعده                                             |
| ------ | ------------------------------------------------- |
| TSK-01 | هر وظیفه دقیقاً به یک فعالیت تعلق دارد            |
| TSK-02 | وظایف اتمیک غیرقابل تقسیم هستند                   |
| TSK-03 | وظایف می‌توانند دستی، نیمه‌خودکار یا خودکار باشند |

---

## ۱۲. Business Event Model

### مدل رویداد کسب‌وکار

| ID      | رویداد                 | نوع      | توضیح                   |
| ------- | ---------------------- | -------- | ----------------------- |
| EVT-001 | Content Published      | Success  | انتشار محتوا با موفقیت  |
| EVT-002 | Content Failed         | Error    | خطا در انتشار محتوا     |
| EVT-003 | Review Required        | Decision | نیاز به بازبینی انسانی  |
| EVT-004 | Escalation Triggered   | Alert    | فعال‌سازی سطح ارجاع     |
| EVT-005 | Knowledge Registered   | Success  | ثبت دانش با موفقیت      |
| EVT-006 | Knowledge Rejected     | Error    | رد دانش در اعتبارسنجی   |
| EVT-007 | Performance Threshold  | Alert    | عبور از آستانه KPI      |
| EVT-008 | Improvement Identified | Decision | شناسایی فرصت بهبود      |
| EVT-009 | Schedule Trigger       | Time     | فعال‌سازی زمان‌بندی‌شده |
| EVT-010 | Manual Intervention    | Human    | دخالت انسانی            |

### انواع رویداد

| نوع      | شناسه   | توضیح         |
| -------- | ------- | ------------- |
| Success  | EVT-T01 | رویداد موفقیت |
| Error    | EVT-T02 | رویداد خطا    |
| Decision | EVT-T03 | رویداد تصمیم  |
| Alert    | EVT-T04 | رویداد هشدار  |
| Time     | EVT-T05 | رویداد زمانی  |
| Human    | EVT-T06 | رویداد انسانی |

---

## ۱۳. Business Trigger Model

### مدل محرک فرآیند

| ID      | محرک                       | فرآیند هدف | نوع محرک | توضیح                      |
| ------- | -------------------------- | ---------- | -------- | -------------------------- |
| TRG-001 | Campaign Plan Approved     | PROC-002   | External | تأیید برنامه کارزار        |
| TRG-002 | Content Brief Ready        | PROC-003   | Internal | آمادگی خلاصه محتوا         |
| TRG-003 | Schedule Reached           | PROC-004   | Time     | رسیدن زمان برنامه‌ریزی‌شده |
| TRG-004 | New Comment Detected       | PROC-005   | External | تشخیص نظر جدید             |
| TRG-005 | Report Period End          | PROC-006   | Time     | پایان دوره گزارش           |
| TRG-006 | Knowledge Source Available | PROC-007   | External | در دسترس بودن منبع دانش    |
| TRG-007 | Performance Gap Detected   | PROC-008   | Event    | تشخیص شکاف عملکرد          |
| TRG-008 | Orchestration Request      | PROC-009   | Internal | درخواست هماهنگ‌سازی        |

### انواع محرک

| نوع محرک | شناسه   | توضیح                       |
| -------- | ------- | --------------------------- |
| Internal | TRG-T01 | محرک داخلی (از فرآیند دیگر) |
| External | TRG-T02 | محرک خارجی (از محیط)        |
| Time     | TRG-T03 | محرک زمانی (Schedule/Cron)  |
| Event    | TRG-T04 | محرک رویدادی (Event-Driven) |
| Manual   | TRG-T05 | محرک دستی (Human)           |

---

## ۱۴. Business Outcome Model

### مدل پیامد فرآیند

| ID      | پیامد                 | فرآیند   | نوع       | توضیح                  |
| ------- | --------------------- | -------- | --------- | ---------------------- |
| OUT-001 | Published Content Set | PROC-004 | Primary   | مجموعه محتوای منتشرشده |
| OUT-002 | Campaign Report       | PROC-002 | Primary   | گزارش کارزار           |
| OUT-003 | Knowledge Asset       | PROC-007 | Primary   | دارایی دانش ثبت‌شده    |
| OUT-004 | Performance Dashboard | PROC-006 | Primary   | داشبورد عملکرد         |
| OUT-005 | Community Log         | PROC-005 | Secondary | لاگ تعاملات جامعه      |
| OUT-006 | Improvement Package   | PROC-008 | Primary   | بسته بهبود             |
| OUT-007 | Execution Report      | PROC-009 | Primary   | گزارش اجرا             |
| OUT-008 | Strategic Calendar    | PROC-001 | Primary   | تقویم استراتژیک        |

### انواع پیامد

| نوع          | شناسه   | توضیح                      |
| ------------ | ------- | -------------------------- |
| Primary      | OUT-T01 | پیامد اصلی فرآیند          |
| Secondary    | OUT-T02 | پیامد فرعی یا جانبی        |
| Intermediate | OUT-T03 | پیامد میانی (خروجی فعالیت) |

### قواعد پیامد

| ID     | قاعده                                  |
| ------ | -------------------------------------- |
| OUT-01 | هر فرآیند حداقل یک پیامد اصلی دارد     |
| OUT-02 | پیامدها قابل اندازه‌گیری و تأیید هستند |
| OUT-03 | پیامد نامطلوب (Failure) مستند می‌شود   |

---

## ۱۵. Business Value Flow

### جریان ارزش کسب‌وکار

جریان ارزش سازمانی SMOS از زنجیره زیر تشکیل شده است:

`Strategy → Planning → Production → Publishing → Engagement → Analysis → Improvement
    ↑                                                                           │
    └───────────────────────────────────────────────────────────────────────────┘`

| مرحله       | شناسه  | فرآیند   | ورودی      | خروجی               |
| ----------- | ------ | -------- | ---------- | ------------------- |
| Strategy    | VAL-01 | PROC-001 | Mission →  | Strategic Calendar  |
| Planning    | VAL-02 | PROC-001 | Calendar → | Content Brief       |
| Production  | VAL-03 | PROC-003 | Brief →    | Content Asset       |
| Publishing  | VAL-04 | PROC-004 | Asset →    | Published Content   |
| Engagement  | VAL-05 | PROC-005 | Content →  | Community Log       |
| Analysis    | VAL-06 | PROC-006 | Data →     | Performance Report  |
| Improvement | VAL-07 | PROC-008 | Report →   | Improvement Package |

### قواعد جریان ارزش

| ID     | قاعده                                      |
| ------ | ------------------------------------------ |
| VAL-01 | جریان ارزش غیرچرخه‌ای است (DAG)            |
| VAL-02 | هر مرحله به مرحله بعدی ورودی می‌دهد        |
| VAL-03 | جریان ارزش در حلقه Improvement بسته می‌شود |

---

## ۱۶. Process Ownership

### مالکیت فرآیند

| فرآیند                           | شناسه    | مالک             | مسئولیت            |
| -------------------------------- | -------- | ---------------- | ------------------ |
| Content Lifecycle Management     | PROC-001 | استراتژیست محتوا | معماری و بهبود     |
| Campaign Planning & Execution    | PROC-002 | مدیر کارزار      | برنامه‌ریزی و اجرا |
| Content Production Pipeline      | PROC-003 | تولیدکننده محتوا | خط تولید           |
| Publishing & Distribution        | PROC-004 | مدیر انتشار      | توزیع              |
| Community Interaction            | PROC-005 | مدیر جامعه       | تعاملات            |
| Performance Analysis             | PROC-006 | تحلیلگر          | تحلیل و گزارش      |
| Knowledge Capture & Registration | PROC-007 | مدیر دانش        | ضبط دانش           |
| Continuous Improvement           | PROC-008 | مدیر بهبود       | بهبود              |
| Enterprise Orchestration         | PROC-009 | هماهنگ‌ساز       | هماهنگی            |

### قواعد مالکیت

| ID     | قاعده                                         |
| ------ | --------------------------------------------- |
| OWN-01 | هر فرآیند دقیقاً یک مالک دارد                 |
| OWN-02 | مالک فرآیند مسئول KPI فرآیند است              |
| OWN-03 | تغییر در معماری فرآیند نیازمند تأیید مالک است |

---

## ۱۷. Process Governance

### حکمرانی فرآیند

| نقش          | شناسه | مسئولیت                | سطح اختیار |
| ------------ | ----- | ---------------------- | ---------- |
| معمار فرآیند | PG-01 | معماری و استانداردسازی | A-4        |
| مالک فرآیند  | PG-02 | اداره و بهبود فرآیند   | A-3        |
| مدیر عملیات  | PG-03 | اجرای روزانه فرآیند    | A-2        |
| ممیز فرآیند  | PG-04 | حسابرسی انطباق         | A-3        |

### قواعد حکمرانی

| ID    | قاعده                                           |
| ----- | ----------------------------------------------- |
| PG-01 | فرآیند جدید نیازمند تأیید معمار فرآیند است      |
| PG-02 | تغییر در معماری فرآیند در Change Log ثبت می‌شود |
| PG-03 | هر فرآیند سالانه بازبینی می‌شود                 |

---

## ۱۸. Cross Process Dependencies

### وابستگی بین فرآیندی

| فرآیند   | وابسته به                    | نوع وابستگی            |
| -------- | ---------------------------- | ---------------------- |
| PROC-002 | PROC-001                     | ترتیبی (Sequential)    |
| PROC-003 | PROC-001, PROC-002           | ترتیبی                 |
| PROC-004 | PROC-003                     | ترتیبی                 |
| PROC-005 | PROC-004                     | ترتیبی                 |
| PROC-006 | PROC-004, PROC-005           | داده‌ای (Data)         |
| PROC-007 | PROC-003, PROC-004, PROC-006 | داده‌ای                |
| PROC-008 | PROC-006                     | داده‌ای                |
| PROC-009 | PROC-001 تا PROC-008         | هماهنگی (Coordination) |

---

## ۱۹. Relationship to KNW-101

### رابطه با KNW-101 — پایه دانش کسب‌وکار

KNW-103 از KNW-101 به عنوان منبع مفاهیم و موجودیت‌ها استفاده می‌کند:

| جنبه                | منبع    | کاربرد در KNW-103                         |
| ------------------- | ------- | ----------------------------------------- |
| موجودیت‌ها (ENT-\*) | KNW-101 | فرآیندها بر روی موجودیت‌ها اجرا می‌شوند   |
| قابلیت‌ها (CAP-\*)  | KNW-101 | فعالیت‌ها قابلیت‌ها را مصرف می‌کنند       |
| واژگان (VOC-\*)     | KNW-101 | اصطلاحات فرآیند از واژگان استفاده می‌کنند |
| وظایف (FUN-\*)      | KNW-101 | وظایف فرآیند با FUN-\* نگاشت می‌شوند      |

### قواعد عدم بازتعریف

1. **هیچ مفهومی از KNW-101 در KNW-103 بازتعریف نمی‌شود**
2. **همه ارجاعات به موجودیت‌ها از ENT-\* KNW-101 است**
3. **KNW-103 واژگان جدید نمی‌سازد — از VOC-\* استفاده می‌کند**

---

## ۲۰. Relationship to KNW-102

### رابطه با KNW-102 — قوانین و سیاست‌های کسب‌وکار

| جنبه                | منبع    | کاربرد در KNW-103                         |
| ------------------- | ------- | ----------------------------------------- |
| قوانین (RUL-\*)     | KNW-102 | فرآیندها تابع قوانین هستند                |
| سیاست‌ها (POL-\*)   | KNW-102 | فعالیت‌ها در چارچوب سیاست‌ها اجرا می‌شوند |
| محدودیت‌ها (CST-\*) | KNW-102 | محدودیت‌ها بر وضعیت فرآیند تأثیر دارند    |
| اختیار تصمیم        | KNW-102 | تصمیمات فرآیند تابع اختیار هستند          |

### قواعد عدم بازتعریف

1. **هیچ قانون یا سیاستی در KNW-103 تعریف نمی‌شود**
2. **KNW-103 به RUL-_ و POL-_ ارجاع می‌دهد ولی آنها را بازتعریف نمی‌کند**
3. **تغییر در قوانین نیازمند به‌روزرسانی KNW-102 است (نه KNW-103)**

---

## ۲۱. Validation Rules

| ID    | قانون                                      | سطح     | نقض |
| ----- | ------------------------------------------ | ------- | --- |
| VR-01 | هر فرآیند دارای شناسه یکتا (PROC-XXX) است  | معماری  | خطا |
| VR-02 | هر فعالیت به یک فرآیند والد تعلق دارد      | معماری  | خطا |
| VR-03 | هر رویداد دارای نوع معتبر است              | معماری  | خطا |
| VR-04 | هر فرآیند حداقل یک فعالیت دارد             | معماری  | خطا |
| VR-05 | وابستگی بین فرآیندی غیرچرخه‌ای است         | معماری  | خطا |
| VR-06 | فرآیندها با KNW-101 و KNW-102 سازگار هستند | محتوایی | خطا |
| VR-07 | مفاهیم KNW-101 و KNW-102 بازتعریف نشده‌اند | معماری  | خطا |
| VR-08 | هر فرآیند یک مالک دارد                     | معماری  | خطا |

---

## ۲۲. Quality Gates

| گیت   | مکان              | معیار                             | مسئول      |
| ----- | ----------------- | --------------------------------- | ---------- |
| QG-01 | Draft → Review    | هویت کامل، ۳۰ بخش                 | خودکار     |
| QG-02 | Review → Approved | اعتبارسنجی سازگاری با KNW-101/102 | معمار دانش |
| QG-03 | Approved → Active | ثبت در KNW-001                    | متولی دانش |

---

## ۲۳. Knowledge Producers

### تولیدکنندگان KNW-103

| تولیدکننده   | نوع تولید           | نقش        |
| ------------ | ------------------- | ---------- |
| معمار فرآیند | ایجاد + ویرایش      | مالک       |
| معمار دانش   | ویرایش + نگهداری    | متولی      |
| مالک فرآیند  | پیشنهاد فرآیند جدید | مصرف‌کننده |

---

## ۲۴. Knowledge Consumers

### مصرف‌کنندگان KNW-103

| مصرف‌کننده                    | نوع مصرف                 | سطح دسترسی |
| ----------------------------- | ------------------------ | ---------- |
| AI-003 (Content Production)   | پرس‌وجو + استخراج فعالیت | A-3        |
| AI-008 (Publishing)           | پرس‌وجو                  | A-3        |
| AI-011 (Knowledge Management) | همه                      | A-4        |
| AI-014 (Orchestrator)         | پرس‌وجو + استخراج جریان  | A-4        |
| AUT-\* (Workflows)            | مرجع معماری              | A-4        |
| Human (Process Architect)     | مطالعه + طراحی           | A-4        |

---

## ۲۵. Related Knowledge Objects

| شناسه   | رابطه         | توضیح                                   |
| ------- | ------------- | --------------------------------------- |
| KNW-101 | Derived-From  | پایه دانش کسب‌وکار — منبع مفاهیم        |
| KNW-102 | Derived-From  | قوانین و سیاست‌ها — مرجع قواعد          |
| AUT-000 | References-To | معماری خودکارسازی — پیاده‌سازی فرآیندها |
| AI-014  | References-To | هماهنگ‌ساز — هماهنگی فرآیندهای Agent    |

---

## ۲۶. Future Process Extensions

### مسیر توسعه آینده

| حوزه               | توضیح                 | زمان پیشنهادی |
| ------------------ | --------------------- | ------------- |
| Process Metrics    | مدل متریک‌های فرآیندی | P6.S7+        |
| Process Maturity   | مدل بلوغ فرآیند       | P6.S8+        |
| Process Templates  | قالب‌های فرآیند مرجع  | P6.S9+        |
| Process Simulation | مدل شبیه‌سازی فرآیند  | P6.S10+       |

### قواعد توسعه

| ID     | قاعده                                            |
| ------ | ------------------------------------------------ |
| EXT-01 | همه توسعه‌ها باید با معماری KNW-103 سازگار باشند |
| EXT-02 | توسعه جدید نباید با KNW-101/102 تناقض داشته باشد |
| EXT-03 | توسعه باید در KNW-001 ثبت شود                    |

---

## ۲۷. Machine Readable Blocks

### Block 1 — Process Identity

\\\json
{
"id": "KNW-103",
"name_fa": "معماری فرآیندهای کسب‌وکار سازمانی",
"name_en": "Enterprise Business Process Architecture",
"version": "1.0.0-draft",
"family": "KNW-BUS",
"domain": "DOM-001",
"type": "Behavioral",
"status": "draft",
"ssot": true,
"total_processes": 9,
"total_activities": 18,
"total_events": 10,
"total_outcomes": 8,
"total_triggers": 8,
"dependencies": ["KNW-101", "KNW-102", "KNW-000", "KNW-001", "CON-000"]
}
\\\

### Block 2 — Process Taxonomy

\\\json
{
"taxonomy": {
"levels": [
{"id": "TAX-01", "name": "Enterprise", "description": "فرآیندهای کلان سازمانی"},
{"id": "TAX-02", "name": "Domain", "description": "فرآیندهای یک دامنه"},
{"id": "TAX-03", "name": "Operational", "description": "فرآیندهای عملیاتی روزانه"},
{"id": "TAX-04", "name": "Task", "description": "وظایف اتمیک"}
],
"families": [
{"id": "FAM-P01", "name": "Content Lifecycle", "level": "TAX-02"},
{"id": "FAM-P02", "name": "Campaign Management", "level": "TAX-02"},
{"id": "FAM-P03", "name": "Knowledge Management", "level": "TAX-02"},
{"id": "FAM-P04", "name": "Analytics & Reporting", "level": "TAX-03"},
{"id": "FAM-P05", "name": "Community Engagement", "level": "TAX-03"},
{"id": "FAM-P06", "name": "Improvement & Learning", "level": "TAX-02"},
{"id": "FAM-P07", "name": "Orchestration", "level": "TAX-01"}
],
"classifications": [
{"id": "CLS-C01", "name": "Core", "description": "فرآیندهای اصلی ارزش‌آفرین"},
{"id": "CLS-C02", "name": "Supporting", "description": "فرآیندهای پشتیبان"},
{"id": "CLS-C03", "name": "Governance", "description": "فرآیندهای حکمرانی"}
]
}
}
\\\

### Block 3 — Business Activities

\\\json
{
"activities": [
{"id": "ACT-001", "name": "Strategy Formulation", "process": "PROC-001", "automation": "partial"},
{"id": "ACT-002", "name": "Content Planning", "process": "PROC-001", "automation": "full"},
{"id": "ACT-003", "name": "Content Creation", "process": "PROC-003", "automation": "full"},
{"id": "ACT-004", "name": "Media Production", "process": "PROC-003", "automation": "partial"},
{"id": "ACT-005", "name": "Content Review", "process": "PROC-003", "automation": "full"},
{"id": "ACT-006", "name": "SEO Optimization", "process": "PROC-003", "automation": "full"},
{"id": "ACT-007", "name": "Publishing", "process": "PROC-004", "automation": "full"},
{"id": "ACT-008", "name": "Distribution", "process": "PROC-004", "automation": "full"},
{"id": "ACT-009", "name": "Community Monitoring", "process": "PROC-005", "automation": "full"},
{"id": "ACT-010", "name": "Response Management", "process": "PROC-005", "automation": "partial"},
{"id": "ACT-011", "name": "Data Collection", "process": "PROC-006", "automation": "full"},
{"id": "ACT-012", "name": "Report Generation", "process": "PROC-006", "automation": "full"},
{"id": "ACT-013", "name": "Knowledge Extraction", "process": "PROC-007", "automation": "full"},
{"id": "ACT-014", "name": "Knowledge Validation", "process": "PROC-007", "automation": "full"},
{"id": "ACT-015", "name": "Gap Analysis", "process": "PROC-008", "automation": "full"},
{"id": "ACT-016", "name": "Improvement Planning", "process": "PROC-008", "automation": "partial"},
{"id": "ACT-017", "name": "Task Decomposition", "process": "PROC-009", "automation": "full"},
{"id": "ACT-018", "name": "Agent Assignment", "process": "PROC-009", "automation": "full"}
]
}
\\\

### Block 4 — Business Events

\\\json
{
"events": [
{"id": "EVT-001", "name": "Content Published", "type": "Success", "description": "انتشار محتوا با موفقیت"},
{"id": "EVT-002", "name": "Content Failed", "type": "Error", "description": "خطا در انتشار محتوا"},
{"id": "EVT-003", "name": "Review Required", "type": "Decision", "description": "نیاز به بازبینی انسانی"},
{"id": "EVT-004", "name": "Escalation Triggered", "type": "Alert", "description": "فعال‌سازی سطح ارجاع"},
{"id": "EVT-005", "name": "Knowledge Registered", "type": "Success", "description": "ثبت دانش با موفقیت"},
{"id": "EVT-006", "name": "Knowledge Rejected", "type": "Error", "description": "رد دانش در اعتبارسنجی"},
{"id": "EVT-007", "name": "Performance Threshold", "type": "Alert", "description": "عبور از آستانه KPI"},
{"id": "EVT-008", "name": "Improvement Identified", "type": "Decision", "description": "شناسایی فرصت بهبود"},
{"id": "EVT-009", "name": "Schedule Trigger", "type": "Time", "description": "فعال‌سازی زمان‌بندی‌شده"},
{"id": "EVT-010", "name": "Manual Intervention", "type": "Human", "description": "دخالت انسانی"}
]
}
\\\

### Block 5 — Business Outcomes

\\\json
{
"outcomes": [
{"id": "OUT-001", "name": "Published Content Set", "process": "PROC-004", "type": "Primary"},
{"id": "OUT-002", "name": "Campaign Report", "process": "PROC-002", "type": "Primary"},
{"id": "OUT-003", "name": "Knowledge Asset", "process": "PROC-007", "type": "Primary"},
{"id": "OUT-004", "name": "Performance Dashboard", "process": "PROC-006", "type": "Primary"},
{"id": "OUT-005", "name": "Community Log", "process": "PROC-005", "type": "Secondary"},
{"id": "OUT-006", "name": "Improvement Package", "process": "PROC-008", "type": "Primary"},
{"id": "OUT-007", "name": "Execution Report", "process": "PROC-009", "type": "Primary"},
{"id": "OUT-008", "name": "Strategic Calendar", "process": "PROC-001", "type": "Primary"}
]
}
\\\

### Block 6 — Process KPIs

\\\json
{
"kpis": [
{"id": "KPI-103-01", "name": "process_coverage", "description": "پوشش فرآیندهای دامنه‌ها", "target": "100%", "measurement": "quarterly"},
{"id": "KPI-103-02", "name": "activity_completeness", "description": "تکمیل فعالیت‌های هر فرآیند", "target": "100%", "measurement": "quarterly"},
{"id": "KPI-103-03", "name": "process_consistency", "description": "سازگاری با KNW-101 و KNW-102", "target": "100%", "measurement": "quarterly"},
{"id": "KPI-103-04", "name": "automation_readiness", "description": "آمادگی فرآیندها برای خودکارسازی", "target": "≥ 80%", "measurement": "semi-annual"},
{"id": "KPI-103-05", "name": "ownership_completeness", "description": "تکمیل مالکیت فرآیندها", "target": "100%", "measurement": "monthly"}
]
}
\\\

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Business Process

\\\json
{
"\": "http://json-schema.org/draft-07/schema#",
"\": "smos:knowledge:business:process:v1",
"title": "Business Process",
"description": "Schema for SMOS Business Process definitions",
"type": "object",
"required": ["id", "name", "family", "classification", "owner"],
"properties": {
"id": {
"type": "string",
"pattern": "^PROC-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "family": {
      "type": "string",
      "pattern": "^FAM-P[0-9]{2}$"
},
"classification": {
"type": "string",
"enum": ["CLS-C01", "CLS-C02", "CLS-C03"]
},
"owner": {
"type": "string",
"minLength": 3
},
"description": {
"type": "string",
"maxLength": 500
},
"inputs": {
"type": "array",
"items": {"type": "string"},
"maxItems": 20
},
"outputs": {
"type": "array",
"items": {"type": "string"},
"maxItems": 20
},
"triggers": {
"type": "array",
"items": {"type": "string"},
"maxItems": 10
},
"states": {
"type": "array",
"items": {
"type": "string",
"enum": ["PST-01", "PST-02", "PST-03", "PST-04", "PST-05", "PST-06", "PST-07"]
}
}
},
"additionalProperties": false
}
\\\

### Schema 2 — Business Activity

\\\json
{
"\": "http://json-schema.org/draft-07/schema#",
"\": "smos:knowledge:business:activity:v1",
"title": "Business Activity",
"description": "Schema for SMOS Business Activity definitions",
"type": "object",
"required": ["id", "name", "process", "owner"],
"properties": {
"id": {
"type": "string",
"pattern": "^ACT-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "process": {
      "type": "string",
      "pattern": "^PROC-[0-9]{3}$"
},
"owner": {
"type": "string",
"minLength": 3
},
"description": {
"type": "string",
"maxLength": 500
},
"automation": {
"type": "string",
"enum": ["manual", "partial", "full"]
},
"inputs": {
"type": "array",
"items": {"type": "string"},
"maxItems": 10
},
"outputs": {
"type": "array",
"items": {"type": "string"},
"maxItems": 10
}
},
"additionalProperties": false
}
\\\

### Schema 3 — Business Event

\\\json
{
"\": "http://json-schema.org/draft-07/schema#",
"\": "smos:knowledge:business:event:v1",
"title": "Business Event",
"description": "Schema for SMOS Business Event definitions",
"type": "object",
"required": ["id", "name", "type"],
"properties": {
"id": {
"type": "string",
"pattern": "^EVT-[0-9]{3}$"
},
"name": {
"type": "string",
"minLength": 2,
"maxLength": 100
},
"type": {
"type": "string",
"enum": ["Success", "Error", "Decision", "Alert", "Time", "Human"]
},
"description": {
"type": "string",
"maxLength": 500
},
"source": {
"type": "string",
"maxLength": 100
},
"consumers": {
"type": "array",
"items": {"type": "string"},
"maxItems": 20
}
},
"additionalProperties": false
}
\\\

---

## ۲۹. KPIs — شاخص‌های کلیدی عملکرد

| KPI                             | شناسه      | هدف   | بازه    | مسئول        |
| ------------------------------- | ---------- | ----- | ------- | ------------ |
| پوشش فرآیندهای دامنه‌ها         | KPI-103-01 | ۱۰۰٪  | فصلی    | معمار فرآیند |
| تکمیل فعالیت‌های هر فرآیند      | KPI-103-02 | ۱۰۰٪  | فصلی    | معمار فرآیند |
| سازگاری با KNW-101 و KNW-102    | KPI-103-03 | ۱۰۰٪  | فصلی    | معمار دانش   |
| آمادگی فرآیندها برای خودکارسازی | KPI-103-04 | ≥ ۸۰٪ | شش‌ماهه | معمار فرآیند |
| تکمیل مالکیت فرآیندها           | KPI-103-05 | ۱۰۰٪  | ماهانه  | متولی دانش   |

---

## ۳۰. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                   | توسط        |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-29 | نگارش اولیه — معماری فرآیندهای کسب‌وکار سازمانی. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema, ۹ فرآیند مرجع, ۱۸ فعالیت, ۱۰ رویداد, ۸ پیامد, ۸ محرک. SSOT فرآیندهای کسب‌وکار SMOS. بدون BPMN, UML یا پیاده‌سازی. | معمار سیستم |
