# Enterprise Business Decision Architecture — معماری تصمیم‌گیری کسب‌وکار سازمانی

> **شناسه:** KNW-104
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-29
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** [KNW-101](./100-business-knowledge-foundation.md), [KNW-102](./102-business-rules-policies.md), [KNW-103](./104-business-process-architecture.md), [KNW-000](./00-enterprise-knowledge-architecture.md), [KNW-001](./10-knowledge-index.md), [CON-000](../05-CONSTITUTION/00-constitution.md)
> **مخاطب:** human, ai-agent, knowledge-engineer, business-analyst, decision-architect

---

## ۱. Purpose

KNW-104 تنها SSOT (تک منبع حقیقت) برای معماری تصمیم‌گیری کسب‌وکار سازمانی SMOS است.

### چرا KNW-104 وجود دارد

بدون یک معماری تصمیم‌گیری:

- نقاط تصمیم در سازمان شناسایی نمی‌شوند
- اختیار تصمیم نامشخص می‌ماند
- معیارهای تصمیم مستند نیستند
- تصمیمات قابل ردیابی نیستند
- Agentها و Automationها بدون چارچوب تصمیم عمل می‌کنند
- وابستگی بین تصمیمات ناشناخته است

KNW-104 این مشکلات را با تعریف **چارچوب معماری تصمیم‌گیری کسب‌وکار** حل می‌کند.

### نقش KNW-104 در SMOS

| سند         | نقش                                                               |
| ----------- | ----------------------------------------------------------------- |
| CON-000     | قانون اساسی — اصول عالی                                           |
| KNW-101     | SSOT مفاهیم، موجودیت‌ها و قابلیت‌های کسب‌وکار                     |
| KNW-102     | SSOT قوانین، سیاست‌ها و محدودیت‌ها (شامل اختیار تصمیم A-0 تا A-4) |
| KNW-103     | SSOT فرآیندهای مرجع کسب‌وکار                                      |
| **KNW-104** | **SSOT معماری تصمیم‌گیری — نقاط، معیارها، اختیار و ردیابی**       |
| AI-014      | مصرف‌کننده مدل‌های تصمیم برای هماهنگ‌سازی                         |

---

## ۲. Scope

### Inside Scope

| حوزه                | توضیح                                                  |
| ------------------- | ------------------------------------------------------ |
| فلسفه تصمیم‌گیری    | هستی‌شناسی تصمیم در SMOS                               |
| تاکسونومی تصمیم     | دسته‌بندی و سلسله‌مراتب تصمیمات                        |
| مدل طبقه‌بندی تصمیم | انواع تصمیم بر اساس ابعاد مختلف                        |
| چرخه حیات تصمیم     | مراحل عمر یک تصمیم                                     |
| وضعیت‌های تصمیم     | حالت‌های ممکن                                          |
| دسته‌بندی تصمیم     | Operational, Tactical, Strategic, Executive, Emergency |
| مدل نقطه تصمیم      | مکان و زمان تصمیم                                      |
| مدل بافت تصمیم      | زمینه و شرایط تصمیم                                    |
| مدل معیار تصمیم     | شاخص‌های تصمیم‌گیری                                    |
| مدل ورودی تصمیم     | داده‌های مورد نیاز                                     |
| مدل خروجی تصمیم     | نتیجه تصمیم                                            |
| مدل اختیار تصمیم    | سطوح اختیار (ارجاع به KNW-102)                         |
| مدل ردیابی تصمیم    | زنجیره تصمیمات                                         |

### Outside Scope

| حوزه                         | دلیل                        |
| ---------------------------- | --------------------------- |
| قوانین و سیاست‌ها            | حوزه KNW-102 (RUL-_, POL-_) |
| اختیار تصمیم پایه A-0 تا A-4 | حوزه KNW-102 §۱۱            |
| فرآیندهای کسب‌وکار           | حوزه KNW-103                |
| الگوریتم تصمیم               | خارج از Scope معماری        |
| AI Reasoning                 | خارج از Scope معماری        |
| Rule Engine                  | خارج از Scope معماری        |
| Workflow                     | حوزه AUT-\*                 |
| پیاده‌سازی                   | خارج از Scope               |

---

## ۳. Decision Architecture Philosophy

### فلسفه معماری تصمیم‌گیری

SMOS تصمیم را به عنوان **اقدام آگاهانه در یک نقطه مشخص** می‌بیند که:

1. **هدف‌مند است** — هر تصمیم یک هدف دارد
2. **بافت‌محور است** — در زمینه مشخصی گرفته می‌شود
3. **معیارمحور است** — بر اساس معیارهای مشخص ارزیابی می‌شود
4. **قابل ردیابی است** — از علت تا نتیجه
5. **مسئولیت‌پذیر است** — یک مالک دارد

### اصول هستی‌شناسی تصمیم

| اصل                      | توضیح                  |
| ------------------------ | ---------------------- |
| **تصمیم یک نقطه است**    | در یک مکان و زمان مشخص |
| **تصمیم یک ورودی دارد**  | داده‌ها و زمینه        |
| **تصمیم یک معیار دارد**  | شاخص ارزیابی گزینه‌ها  |
| **تصمیم یک خروجی دارد**  | انتخاب یا اقدام        |
| **تصمیم قابل ارجاع است** | به سطح بالاتر          |

---

## ۴. Architecture Principles

### اصول معماری تصمیم‌گیری

| ID     | اصل               | توضیح                                                                         |
| ------ | ----------------- | ----------------------------------------------------------------------------- |
| DAP-01 | **SSOT**          | هر مدل تصمیم تنها در KNW-104 تعریف می‌شود                                     |
| DAP-02 | **عدم بازتعریف**  | موجودیت‌ها (KNW-101)، قوانین (KNW-102) و فرآیندها (KNW-103) بازتعریف نمی‌شوند |
| DAP-03 | **قابلیت ردیابی** | همه تصمیمات قابل ردیابی تا منبع هستند                                         |
| DAP-04 | **شفافیت**        | معیارها و بافت تصمیم مستند هستند                                              |
| DAP-05 | **مسئولیت**       | هر تصمیم یک مالک و یک سطح اختیار دارد                                         |
| DAP-06 | **خنثی بودن**     | مدل‌های تصمیم مستقل از ابزار و تکنولوژی                                       |
| DAP-07 | **تکامل تدریجی**  | مدل‌های تصمیم با ADR تغییر می‌کنند                                            |

---

## ۵. Decision Taxonomy

### تاکسونومی تصمیمات

| سطح         | شناسه  | توضیح                | مثال                 |
| ----------- | ------ | -------------------- | -------------------- |
| Executive   | DTX-01 | تصمیمات راهبردی کلان | تصویب معماری دانش    |
| Strategic   | DTX-02 | تصمیمات استراتژیک    | استراتژی محتوا       |
| Tactical    | DTX-03 | تصمیمات تاکتیکی      | برنامه انتشار ماهانه |
| Operational | DTX-04 | تصمیمات عملیاتی      | تأیید یک پست         |
| Emergency   | DTX-05 | تصمیمات اضطراری      | توقف انتشار          |

### خانواده تصمیمات

| خانواده               | شناسه   | سطح       | توضیح           |
| --------------------- | ------- | --------- | --------------- |
| Content Decisions     | FAM-D01 | DTX-02/03 | تصمیمات محتوایی |
| Publishing Decisions  | FAM-D02 | DTX-03/04 | تصمیمات انتشار  |
| Engagement Decisions  | FAM-D03 | DTX-03/04 | تصمیمات تعامل   |
| Knowledge Decisions   | FAM-D04 | DTX-01/02 | تصمیمات دانش    |
| Operational Decisions | FAM-D05 | DTX-04/05 | تصمیمات عملیاتی |
| Governance Decisions  | FAM-D06 | DTX-01    | تصمیمات حکمرانی |

---

## ۶. Decision Classification Model

### مدل طبقه‌بندی تصمیم

| بعد        | دسته           | شناسه   | توضیح                |
| ---------- | -------------- | ------- | -------------------- |
| زمان       | Real-Time      | DCL-T01 | تصمیم لحظه‌ای        |
| زمان       | Scheduled      | DCL-T02 | تصمیم زمان‌بندی‌شده  |
| زمان       | Batch          | DCL-T03 | تصمیم دوره‌ای        |
| پیچیدگی    | Simple         | DCL-C01 | دو گزینه، شرط مشخص   |
| پیچیدگی    | Complex        | DCL-C02 | چند گزینه، چند معیار |
| پیچیدگی    | Strategic      | DCL-C03 | عدم قطعیت بالا       |
| خودکارسازی | Automated      | DCL-A01 | تصمیم کاملاً خودکار  |
| خودکارسازی | Semi-Automated | DCL-A02 | تصمیم نیمه‌خودکار    |
| خودکارسازی | Manual         | DCL-A03 | تصمیم انسانی         |
| تکرار      | Recurring      | DCL-R01 | تصمیم مکرر           |
| تکرار      | One-Time       | DCL-R02 | تصمیم یکبارمصرف      |

---

## ۷. Decision Lifecycle

### چرخه حیات تصمیم

| مرحله       | شناسه  | توضیح                       |
| ----------- | ------ | --------------------------- |
| Trigger     | DLC-01 | فعال‌سازی نقطه تصمیم        |
| Gather      | DLC-02 | جمع‌آوری ورودی‌ها           |
| Evaluate    | DLC-03 | ارزیابی بر اساس معیارها     |
| Decide      | DLC-04 | اتخاذ تصمیم                 |
| Communicate | DLC-05 | اعلام نتیجه                 |
| Execute     | DLC-06 | اجرای تصمیم (AUT-_ یا AI-_) |
| Review      | DLC-07 | بازبینی تصمیم               |

### قواعد چرخه حیات

| ID      | قاعده                                         |
| ------- | --------------------------------------------- |
| DLC-R01 | تصمیم قبل از اجرا باید ارزیابی شود            |
| DLC-R02 | تصمیمات بحرانی نیازمند تأیید سطح بالاتر هستند |
| DLC-R03 | تصمیمات در لاگ ردیابی ثبت می‌شوند             |

---

## ۸. Decision States

### وضعیت‌های تصمیم

| وضعیت      | شناسه  | توضیح             | مجوز اقدام |
| ---------- | ------ | ----------------- | ---------- |
| Pending    | DST-01 | در انتظار ارزیابی | —          |
| Evaluating | DST-02 | در حال بررسی      | فقط تحلیل  |
| Approved   | DST-03 | تأییدشده          | ✓ اجرا     |
| Rejected   | DST-04 | ردشده             | —          |
| Deferred   | DST-05 | به تعویق افتاده   | —          |
| Completed  | DST-06 | اجراشده           | ✓ بسته     |
| Cancelled  | DST-07 | لغوشده            | —          |

### ماشین وضعیت

`Pending → Evaluating → Approved → Completed
                ↓           ↓
            Deferred    Rejected
                           ↓
                      Cancelled`

---

## ۹. Decision Categories

### دسته‌بندی تصمیمات مرجع

| ID      | تصمیم مرجع                   | خانواده | سطح         | توضیح                |
| ------- | ---------------------------- | ------- | ----------- | -------------------- |
| DEC-001 | Content Strategy Approval    | FAM-D01 | Executive   | تصویب استراتژی محتوا |
| DEC-002 | Campaign Plan Approval       | FAM-D01 | Tactical    | تأیید برنامه کارزار  |
| DEC-003 | Content Production Go/No-Go  | FAM-D01 | Operational | مجوز تولید محتوا     |
| DEC-004 | Publication Approval         | FAM-D02 | Operational | تأیید انتشار محتوا   |
| DEC-005 | Response Decision            | FAM-D03 | Operational | انتخاب نوع پاسخ      |
| DEC-006 | Escalation Decision          | FAM-D03 | Tactical    | تصمیم به ارجاع       |
| DEC-007 | Knowledge Registration       | FAM-D04 | Tactical    | تأیید ثبت دانش       |
| DEC-008 | Performance Threshold Action | FAM-D05 | Operational | اقدام بر اساس KPI    |
| DEC-009 | Architecture Change          | FAM-D06 | Executive   | تغییر معماری         |
| DEC-010 | Emergency Publish Stop       | FAM-D05 | Emergency   | توقف اضطراری انتشار  |

---

## ۱۰. Decision Point Model

### مدل نقطه تصمیم

| ID      | نقطه تصمیم       | فرآیند مرتبط | فعالیت  | توضیح                 |
| ------- | ---------------- | ------------ | ------- | --------------------- |
| DPT-001 | Strategy Gate    | PROC-001     | ACT-001 | دروازه تأیید استراتژی |
| DPT-002 | Campaign Gate    | PROC-002     | ACT-001 | دروازه تأیید کارزار   |
| DPT-003 | Production Gate  | PROC-003     | ACT-005 | دروازه تأیید تولید    |
| DPT-004 | Publishing Gate  | PROC-004     | ACT-007 | دروازه انتشار         |
| DPT-005 | Engagement Fork  | PROC-005     | ACT-010 | دو راهی پاسخ          |
| DPT-006 | Escalation Gate  | PROC-005     | ACT-010 | دروازه ارجاع          |
| DPT-007 | Knowledge Gate   | PROC-007     | ACT-014 | دروازه ثبت دانش       |
| DPT-008 | Performance Gate | PROC-006     | ACT-012 | دروازه عملکرد         |

### ویژگی‌های نقطه تصمیم

| ویژگی  | شناسه    | اجباری | توضیح          |
| ------ | -------- | ------ | -------------- |
| شناسه  | DPT-ID   | بله    | DPT-XXX        |
| نام    | DPT-NAME | بله    | نام نقطه تصمیم |
| فرآیند | DPT-PROC | بله    | PROC-XXX       |
| فعالیت | DPT-ACT  | بله    | ACT-XXX        |
| اختیار | DPT-AUTH | بله    | AUTH-XXX       |
| زمان   | DPT-TIME | خیر    | محدودیت زمانی  |

---

## ۱۱. Decision Context Model

### مدل بافت تصمیم

| ID     | بافت        | توضیح             | تأثیر           |
| ------ | ----------- | ----------------- | --------------- |
| CTX-01 | Normal      | وضعیت عادی عملیات | تصمیم استاندارد |
| CTX-02 | Urgent      | وضعیت فوری        | تصمیم تسریع‌شده |
| CTX-03 | Critical    | وضعیت بحرانی      | تصمیم با نظارت  |
| CTX-04 | Exceptional | وضعیت استثنا      | تصمیم با مصوبه  |

### ابعاد بافت

| بعد    | شناسه   | توضیح          |
| ------ | ------- | -------------- |
| زمان   | CTX-D01 | محدودیت زمانی  |
| ریسک   | CTX-D02 | سطح ریسک فعلی  |
| منابع  | CTX-D03 | منابع در دسترس |
| انطباق | CTX-D04 | الزامات قانونی |

---

## ۱۲. Decision Criteria Model

### مدل معیار تصمیم

| ID      | معیار                 | توضیح                       | نوع          |
| ------- | --------------------- | --------------------------- | ------------ |
| CRT-001 | Brand Alignment       | همخوانی با صدای برند        | Qualitative  |
| CRT-002 | Quality Threshold     | حداقل کیفیت قابل قبول       | Quantitative |
| CRT-003 | Compliance Check      | انطباق با قوانین و سیاست‌ها | Boolean      |
| CRT-004 | Risk Assessment       | ارزیابی ریسک تصمیم          | Qualitative  |
| CRT-005 | Resource Availability | منابع مورد نیاز             | Quantitative |
| CRT-006 | Priority Alignment    | هماهنگی با اولویت‌ها        | Ordinal      |
| CRT-007 | Cost-Benefit          | تحلیل هزینه-فایده           | Quantitative |
| CRT-008 | Timeliness            | به‌موقع بودن تصمیم          | Temporal     |

### ساختار معیار

| عنصر   | شناسه      | اجباری | توضیح                                                 |
| ------ | ---------- | ------ | ----------------------------------------------------- |
| شناسه  | CRT-ID     | بله    | CRT-XXX                                               |
| نام    | CRT-NAME   | بله    | نام معیار                                             |
| نوع    | CRT-TYPE   | بله    | Quantitative, Qualitative, Boolean, Ordinal, Temporal |
| وزن    | CRT-WEIGHT | خیر    | وزن معیار در تصمیم‌گیری                               |
| حداقل  | CRT-MIN    | خیر    | حداقل مقدار قابل قبول                                 |
| حداکثر | CRT-MAX    | خیر    | حداکثر مقدار                                          |

---

## ۱۳. Decision Input Model

### مدل ورودی تصمیم

| ID      | ورودی                 | نوع      | منبع   | تصمیمات مصرف‌کننده |
| ------- | --------------------- | -------- | ------ | ------------------ |
| DIN-001 | Content Draft         | Document | AI-003 | DEC-004            |
| DIN-002 | Quality Score         | Metric   | AI-004 | DEC-003, DEC-004   |
| DIN-003 | Brand Voice Report    | Report   | AI-006 | DEC-001            |
| DIN-004 | Compliance Validation | Boolean  | AI-004 | DEC-004            |
| DIN-005 | Performance Data      | Dataset  | AI-010 | DEC-008            |
| DIN-006 | Risk Assessment       | Report   | AI-014 | DEC-006, DEC-009   |
| DIN-007 | Knowledge Asset       | Asset    | AI-011 | DEC-007            |
| DIN-008 | Escalation Request    | Event    | AI-009 | DEC-006            |

### قواعد ورودی

| ID     | قاعده                                          |
| ------ | ---------------------------------------------- |
| DIN-01 | هر تصمیم حداقل یک ورودی دارد                   |
| DIN-02 | ورودی‌ها قبل از ارزیابی باید معتبر باشند       |
| DIN-03 | ورودی‌های نامعتبر باعث توقف (Deferred) می‌شوند |

---

## ۱۴. Decision Output Model

### مدل خروجی تصمیم

| ID       | خروجی                | نوع        | تصمیم مبدأ | مصرف‌کننده     |
| -------- | -------------------- | ---------- | ---------- | -------------- |
| DOUT-001 | Approved Strategy    | Document   | DEC-001    | AI-001, AI-002 |
| DOUT-002 | Campaign Go-Ahead    | Signal     | DEC-002    | AI-002         |
| DOUT-003 | Production Start     | Signal     | DEC-003    | AI-003         |
| DOUT-004 | Publication Approval | Signal     | DEC-004    | AI-008         |
| DOUT-005 | Response Draft       | Document   | DEC-005    | AI-009         |
| DOUT-006 | Escalation Package   | Package    | DEC-006    | Human/AI-014   |
| DOUT-007 | Knowledge Asset ID   | Identifier | DEC-007    | AI-011         |
| DOUT-008 | Action Command       | Command    | DEC-008    | AUT-\*         |
| DOUT-009 | ADR Document         | Document   | DEC-009    | همه            |
| DOUT-010 | Stop Signal          | Signal     | DEC-010    | AI-008         |

### قواعد خروجی

| ID      | قاعده                                                  |
| ------- | ------------------------------------------------------ |
| DOUT-01 | هر تصمیم دقیقاً یک خروجی اصلی دارد                     |
| DOUT-02 | خروجی تصمیم باید توسط مصرف‌کننده قابل پردازش باشد      |
| DOUT-03 | خروجی تصمیمات Rejected/Cancelled صرفاً اطلاع‌رسانی است |

---

## ۱۵. Decision Authority Model

### مدل اختیار تصمیم

KNW-104 اختیار تصمیم را به عنوان **توسعه‌ای بر مدل A-0 تا A-4 در KNW-102 §۱۱** تعریف می‌کند:

| ID      | سطح اختیار | نام | سطح KNW-102 | تصمیمات نمونه              |
| ------- | ---------- | --- | ----------- | -------------------------- |
| AUTH-01 | اطلاع      | A-0 | A-0         | مشاهده نتایج               |
| AUTH-02 | پیشنهاد    | A-1 | A-1         | پیشنهاد استراتژی           |
| AUTH-03 | اجرا       | A-2 | A-2         | تأیید انتشار معمول         |
| AUTH-04 | تأیید      | A-3 | A-3         | تأیید کارزار، ثبت دانش     |
| AUTH-05 | تصویب      | A-4 | A-4         | تصویب معماری، تغییرات کلان |

### نگاشت اختیار به تصمیمات مرجع

| تصمیم   | اختیار مورد نیاز | سطح KNW-102 |
| ------- | ---------------- | ----------- |
| DEC-001 | AUTH-05          | A-4         |
| DEC-002 | AUTH-04          | A-3         |
| DEC-003 | AUTH-03          | A-2         |
| DEC-004 | AUTH-03          | A-2         |
| DEC-005 | AUTH-02          | A-1         |
| DEC-006 | AUTH-04          | A-3         |
| DEC-007 | AUTH-04          | A-3         |
| DEC-008 | AUTH-03          | A-2         |
| DEC-009 | AUTH-05          | A-4         |
| DEC-010 | AUTH-04          | A-3         |

### قواعد اختیار

| ID    | قاعده                                                            |
| ----- | ---------------------------------------------------------------- |
| DA-01 | تصمیم خارج از اختیار به سطح بالاتر ارجاع می‌شود (KNW-102 §۱۵)    |
| DA-02 | تصمیم AUTH-05 نیازمند ADR است                                    |
| DA-03 | تصمیمات Emergency (DEC-010) می‌توانند موقتاً اختیار را دور بزنند |

---

## ۱۶. Decision Ownership

### مالکیت تصمیم

| تصمیم                        | شناسه   | مالک             | مسئولیت        |
| ---------------------------- | ------- | ---------------- | -------------- |
| Content Strategy Approval    | DEC-001 | استراتژیست محتوا | تصویب استراتژی |
| Campaign Plan Approval       | DEC-002 | مدیر کارزار      | تأیید کارزار   |
| Content Production Go/No-Go  | DEC-003 | تولیدکننده محتوا | مجوز تولید     |
| Publication Approval         | DEC-004 | مدیر انتشار      | تأیید انتشار   |
| Response Decision            | DEC-005 | مدیر جامعه       | انتخاب پاسخ    |
| Escalation Decision          | DEC-006 | مدیر جامعه       | تصمیم ارجاع    |
| Knowledge Registration       | DEC-007 | مدیر دانش        | ثبت دانش       |
| Performance Threshold Action | DEC-008 | تحلیلگر          | اقدام بر KPI   |
| Architecture Change          | DEC-009 | معمار سیستم      | تغییر معماری   |
| Emergency Publish Stop       | DEC-010 | مدیر انتشار      | توقف اضطراری   |

### قواعد مالکیت

| ID     | قاعده                                     |
| ------ | ----------------------------------------- |
| OWN-01 | هر تصمیم دقیقاً یک مالک دارد              |
| OWN-02 | مالک تصمیم مسئول کیفیت معیارها است        |
| OWN-03 | تغییر در مدل تصمیم نیازمند تأیید مالک است |

---

## ۱۷. Decision Governance

### حکمرانی تصمیم

| نقش              | شناسه | مسئولیت                          | سطح اختیار |
| ---------------- | ----- | -------------------------------- | ---------- |
| معمار تصمیم      | DG-01 | معماری و استاندارد مدل‌های تصمیم | AUTH-05    |
| مالک تصمیم       | DG-02 | کیفیت و صحت تصمیمات              | AUTH-04    |
| ممیز تصمیم       | DG-03 | حسابرسی زنجیره تصمیمات           | AUTH-04    |
| مصرف‌کننده تصمیم | DG-04 | اجرای خروجی تصمیم                | AUTH-03    |

### قواعد حکمرانی

| ID    | قاعده                                        |
| ----- | -------------------------------------------- |
| DG-01 | مدل تصمیم جدید نیازمند تأیید معمار تصمیم است |
| DG-02 | همه تصمیمات در Traceability Log ثبت می‌شوند  |
| DG-03 | بازبینی دوره‌ای مدل‌های تصمیم هر ۶ ماه       |

---

## ۱۸. Decision Traceability

### مدل ردیابی تصمیم

| ID     | عنصر ردیابی | توضیح                 |
| ------ | ----------- | --------------------- |
| TRC-01 | شناسه تصمیم | DEC-XXX               |
| TRC-02 | زمان تصمیم  | Timestamp             |
| TRC-03 | مالک تصمیم  | نقش یا Agent          |
| TRC-04 | ورودی‌ها    | داده‌ها و بافت        |
| TRC-05 | معیارها     | CRT-\*                |
| TRC-06 | خروجی       | DOUT-\*               |
| TRC-07 | اقدام بعدی  | فرآیند یا فعالیت بعدی |

### زنجیره ردیابی

`Trigger → Input → Criteria → Decision → Output → Action
   ↑                                                    │
   └────────────────────────────────────────────────────┘
          (بازخورد برای تصمیمات بعدی)`

### قواعد ردیابی

| ID    | قاعده                                             |
| ----- | ------------------------------------------------- |
| TR-01 | همه تصمیمات حداقل TRC-01 تا TRC-04 را ثبت می‌کنند |
| TR-02 | تصمیمات AUTH-05 باید TRC کامل داشته باشند         |
| TR-03 | زنجیره ردیابی غیرچرخه‌ای است                      |

---

## ۱۹. Relationship to KNW-101

### رابطه با KNW-101 — پایه دانش کسب‌وکار

| جنبه                | منبع    | کاربرد در KNW-104                         |
| ------------------- | ------- | ----------------------------------------- |
| موجودیت‌ها (ENT-\*) | KNW-101 | تصمیمات بر روی موجودیت‌ها اثر دارند       |
| واژگان (VOC-\*)     | KNW-101 | اصطلاحات تصمیم از VOC-\* استفاده می‌کنند  |
| قابلیت‌ها (CAP-\*)  | KNW-101 | تصمیمات قابلیت‌ها را فعال/غیرفعال می‌کنند |

### قواعد عدم بازتعریف

1. **هیچ موجودیت یا مفهومی از KNW-101 در KNW-104 بازتعریف نمی‌شود**
2. **همه ارجاعات به ENT-\* از KNW-101 است**

---

## ۲۰. Relationship to KNW-102

### رابطه با KNW-102 — قوانین و سیاست‌های کسب‌وکار

| جنبه                | منبع        | کاربرد در KNW-104                       |
| ------------------- | ----------- | --------------------------------------- |
| قوانین (RUL-\*)     | KNW-102     | تصمیمات تابع قوانین هستند               |
| اختیار (A-0 تا A-4) | KNW-102 §۱۱ | KNW-104 AUTH-_ بر اساس A-_ است          |
| استثناها (EXC-\*)   | KNW-102 §۱۴ | تصمیمات استثنا از این مدل پیروی می‌کنند |
| ارجاع (ESC-\*)      | KNW-102 §۱۵ | تصمیمات خارج از اختیار ارجاع می‌شوند    |

### قواعد عدم بازتعریف

1. **هیچ قانون یا سطح اختیاری در KNW-104 بازتعریف نمی‌شود**
2. **KNW-104 سطح AUTH-_ را بر اساس KNW-102 A-_ تعریف می‌کند ولی جایگزین نمی‌کند**

---

## ۲۱. Relationship to KNW-103

### رابطه با KNW-103 — معماری فرآیندهای کسب‌وکار

| جنبه                | منبع        | کاربرد در KNW-104                         |
| ------------------- | ----------- | ----------------------------------------- |
| نقاط تصمیم (DPT-\*) | KNW-104     | در فرآیندها جای گرفته‌اند (PROC-_, ACT-_) |
| رویدادها (EVT-\*)   | KNW-103 §۱۲ | تصمیمات توسط رویدادها فعال می‌شوند        |
| محرک‌ها (TRG-\*)    | KNW-103 §۱۳ | تصمیمات به محرک‌ها متصل هستند             |

### قواعد عدم بازتعریف

1. **هیچ فرآیندی در KNW-104 تعریف نمی‌شود**
2. **KNW-104 صرفاً نقاط تصمیم را به فرآیندهای KNW-103 متصل می‌کند**

---

## ۲۲. Validation Rules

| ID    | قانون                                         | سطح    | نقض |
| ----- | --------------------------------------------- | ------ | --- |
| VR-01 | هر مدل تصمیم دارای شناسه یکتا (DEC-XXX) است   | معماری | خطا |
| VR-02 | هر تصمیم دارای سطح اختیار معتبر است           | معماری | خطا |
| VR-03 | هر تصمیم دارای حداقل یک معیار است             | معماری | خطا |
| VR-04 | اختیار تصمیم با AUTH-\* در KNW-102 سازگار است | معماری | خطا |
| VR-05 | نقاط تصمیم به PROC-\* معتبر متصل هستند        | معماری | خطا |
| VR-06 | مفاهیم KNW-101 و KNW-102 بازتعریف نشده‌اند    | معماری | خطا |
| VR-07 | زنجیره ردیابی غیرچرخه‌ای است                  | معماری | خطا |
| VR-08 | هر تصمیم یک مالک دارد                         | معماری | خطا |

---

## ۲۳. Quality Gates

| گیت   | مکان              | معیار                                 | مسئول      |
| ----- | ----------------- | ------------------------------------- | ---------- |
| QG-01 | Draft → Review    | هویت کامل، ۳۰ بخش                     | خودکار     |
| QG-02 | Review → Approved | اعتبارسنجی سازگاری با KNW-101/102/103 | معمار دانش |
| QG-03 | Approved → Active | ثبت در KNW-001                        | متولی دانش |

---

## ۲۴. Knowledge Producers

### تولیدکنندگان KNW-104

| تولیدکننده  | نوع تولید        | نقش        |
| ----------- | ---------------- | ---------- |
| معمار تصمیم | ایجاد + ویرایش   | مالک       |
| معمار دانش  | ویرایش + نگهداری | متولی      |
| مالک تصمیم  | پیشنهاد مدل جدید | مصرف‌کننده |

---

## ۲۵. Knowledge Consumers

### مصرف‌کنندگان KNW-104

| مصرف‌کننده                    | نوع مصرف                        | سطح دسترسی |
| ----------------------------- | ------------------------------- | ---------- |
| AI-001 (Content Strategy)     | پرس‌وجو + استخراج مدل‌های تصمیم | AUTH-04    |
| AI-008 (Publishing)           | پرس‌وجو نقاط تصمیم انتشار       | AUTH-03    |
| AI-011 (Knowledge Management) | همه                             | AUTH-05    |
| AI-014 (Orchestrator)         | پرس‌وجو + استخراج زنجیره تصمیم  | AUTH-05    |
| AUT-\* (Workflows)            | مرجع تصمیمات خودکار             | AUTH-03    |
| Human (Decision Architect)    | مطالعه + طراحی                  | AUTH-05    |

---

## ۲۶. Related Knowledge Objects

| شناسه   | رابطه         | توضیح                                    |
| ------- | ------------- | ---------------------------------------- |
| KNW-101 | Derived-From  | پایه دانش کسب‌وکار — منبع موجودیت‌ها     |
| KNW-102 | Derived-From  | قوانین و سیاست‌ها — مرجع اختیار          |
| KNW-103 | Derived-From  | معماری فرآیندها — نقاط تصمیم در فرآیندها |
| AI-014  | References-To | هماهنگ‌ساز — مصرف‌کننده مدل‌های تصمیم    |

---

## ۲۷. Machine Readable Blocks

### Block 1 — Decision Identity

\\\json
{
"id": "KNW-104",
"name_fa": "معماری تصمیم‌گیری کسب‌وکار سازمانی",
"name_en": "Enterprise Business Decision Architecture",
"version": "1.0.0-draft",
"family": "KNW-BUS",
"domain": "DOM-001",
"type": "Decision",
"status": "draft",
"ssot": true,
"total_decisions": 10,
"total_decision_points": 8,
"total_criteria": 8,
"total_inputs": 8,
"total_outputs": 10,
"dependencies": ["KNW-101", "KNW-102", "KNW-103", "KNW-000", "KNW-001", "CON-000"]
}
\\\

### Block 2 — Decision Taxonomy

\\\json
{
"taxonomy": {
"levels": [
{"id": "DTX-01", "name": "Executive", "description": "تصمیمات راهبردی کلان"},
{"id": "DTX-02", "name": "Strategic", "description": "تصمیمات استراتژیک"},
{"id": "DTX-03", "name": "Tactical", "description": "تصمیمات تاکتیکی"},
{"id": "DTX-04", "name": "Operational", "description": "تصمیمات عملیاتی"},
{"id": "DTX-05", "name": "Emergency", "description": "تصمیمات اضطراری"}
],
"families": [
{"id": "FAM-D01", "name": "Content Decisions", "levels": ["DTX-02", "DTX-03"]},
{"id": "FAM-D02", "name": "Publishing Decisions", "levels": ["DTX-03", "DTX-04"]},
{"id": "FAM-D03", "name": "Engagement Decisions", "levels": ["DTX-03", "DTX-04"]},
{"id": "FAM-D04", "name": "Knowledge Decisions", "levels": ["DTX-01", "DTX-02"]},
{"id": "FAM-D05", "name": "Operational Decisions", "levels": ["DTX-04", "DTX-05"]},
{"id": "FAM-D06", "name": "Governance Decisions", "levels": ["DTX-01"]}
],
"states": [
{"id": "DST-01", "name": "Pending", "description": "در انتظار ارزیابی"},
{"id": "DST-02", "name": "Evaluating", "description": "در حال بررسی"},
{"id": "DST-03", "name": "Approved", "description": "تأییدشده"},
{"id": "DST-04", "name": "Rejected", "description": "ردشده"},
{"id": "DST-05", "name": "Deferred", "description": "به تعویق افتاده"},
{"id": "DST-06", "name": "Completed", "description": "اجراشده"},
{"id": "DST-07", "name": "Cancelled", "description": "لغوشده"}
]
}
}
\\\

### Block 3 — Decision Authorities

\\\json
{
"authorities": [
{"id": "AUTH-01", "name": "اطلاع", "base_level": "A-0", "decisions": []},
{"id": "AUTH-02", "name": "پیشنهاد", "base_level": "A-1", "decisions": ["DEC-005"]},
{"id": "AUTH-03", "name": "اجرا", "base_level": "A-2", "decisions": ["DEC-003", "DEC-004", "DEC-008"]},
{"id": "AUTH-04", "name": "تأیید", "base_level": "A-3", "decisions": ["DEC-002", "DEC-006", "DEC-007", "DEC-010"]},
{"id": "AUTH-05", "name": "تصویب", "base_level": "A-4", "decisions": ["DEC-001", "DEC-009"]}
]
}
\\\

### Block 4 — Decision Criteria

\\\json
{
"criteria": [
{"id": "CRT-001", "name": "Brand Alignment", "type": "Qualitative", "description": "همخوانی با صدای برند"},
{"id": "CRT-002", "name": "Quality Threshold", "type": "Quantitative", "description": "حداقل کیفیت قابل قبول"},
{"id": "CRT-003", "name": "Compliance Check", "type": "Boolean", "description": "انطباق با قوانین و سیاست‌ها"},
{"id": "CRT-004", "name": "Risk Assessment", "type": "Qualitative", "description": "ارزیابی ریسک تصمیم"},
{"id": "CRT-005", "name": "Resource Availability", "type": "Quantitative", "description": "منابع مورد نیاز"},
{"id": "CRT-006", "name": "Priority Alignment", "type": "Ordinal", "description": "هماهنگی با اولویت‌ها"},
{"id": "CRT-007", "name": "Cost-Benefit", "type": "Quantitative", "description": "تحلیل هزینه-فایده"},
{"id": "CRT-008", "name": "Timeliness", "type": "Temporal", "description": "به‌موقع بودن تصمیم"}
]
}
\\\

### Block 5 — Decision Relationships

\\\json
{
"relationships": [
{"id": "DREL-001", "source": "DEC-001", "target": "DEC-002", "type": "triggers", "description": "تصویب استراتژی → برنامه‌ریزی کارزار"},
{"id": "DREL-002", "source": "DEC-002", "target": "DEC-003", "type": "triggers", "description": "تأیید کارزار → شروع تولید"},
{"id": "DREL-003", "source": "DEC-003", "target": "DEC-004", "type": "precedes", "description": "مجوز تولید → تأیید انتشار"},
{"id": "DREL-004", "source": "DEC-004", "target": "DEC-005", "type": "follows", "description": "انتشار → تصمیم پاسخ"},
{"id": "DREL-005", "source": "DEC-005", "target": "DEC-006", "type": "may-escalate", "description": "پاسخ → ارجاع (در صورت نیاز)"},
{"id": "DREL-006", "source": "DEC-007", "target": "DEC-001", "type": "feeds-back", "description": "ثبت دانش → بازخورد به استراتژی"},
{"id": "DREL-007", "source": "DEC-008", "target": "DEC-003", "type": "adjusts", "description": "اقدام KPI → تنظیم تولید"},
{"id": "DREL-008", "source": "DEC-009", "target": "ALL", "type": "governs", "description": "تغییر معماری → همه تصمیمات"},
{"id": "DREL-009", "source": "DEC-010", "target": "DEC-004", "type": "overrides", "description": "توقف اضطراری → لغو انتشار"}
]
}
\\\

### Block 6 — Decision KPIs

\\\json
{
"kpis": [
{"id": "KPI-104-01", "name": "decision_coverage", "description": "پوشش تصمیمات در دامنه‌ها", "target": "100%", "measurement": "quarterly"},
{"id": "KPI-104-02", "name": "authority_mapping", "description": "نگاشت کامل اختیار به تصمیمات", "target": "100%", "measurement": "quarterly"},
{"id": "KPI-104-03", "name": "decision_consistency", "description": "سازگاری با KNW-101/102/103", "target": "100%", "measurement": "quarterly"},
{"id": "KPI-104-04", "name": "traceability_coverage", "description": "پوشش ردیابی تصمیمات", "target": "≥ 95%", "measurement": "monthly"},
{"id": "KPI-104-05", "name": "automation_readiness", "description": "آمادگی برای خودکارسازی تصمیمات", "target": "≥ 75%", "measurement": "semi-annual"}
]
}
\\\

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Decision Model

\\\json
{
"\": "http://json-schema.org/draft-07/schema#",
"\": "smos:knowledge:business:decision:v1",
"title": "Decision Model",
"description": "Schema for SMOS Business Decision Model definitions",
"type": "object",
"required": ["id", "name", "family", "level", "authority", "owner"],
"properties": {
"id": {
"type": "string",
"pattern": "^DEC-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "family": {
      "type": "string",
      "pattern": "^FAM-D[0-9]{2}$"
},
"level": {
"type": "string",
"enum": ["DTX-01", "DTX-02", "DTX-03", "DTX-04", "DTX-05"]
},
"authority": {
"type": "string",
"pattern": "^AUTH-[0-9]{2}$"
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
"criteria": {
"type": "array",
"items": {"type": "string"},
"maxItems": 20
},
"states": {
"type": "array",
"items": {
"type": "string",
"enum": ["DST-01", "DST-02", "DST-03", "DST-04", "DST-05", "DST-06", "DST-07"]
}
}
},
"additionalProperties": false
}
\\\

### Schema 2 — Decision Authority

\\\json
{
"\": "http://json-schema.org/draft-07/schema#",
"\": "smos:knowledge:business:decision-authority:v1",
"title": "Decision Authority",
"description": "Schema for SMOS Decision Authority levels",
"type": "object",
"required": ["id", "name", "base_level"],
"properties": {
"id": {
"type": "string",
"pattern": "^AUTH-[0-9]{2}$"
},
"name": {
"type": "string",
"minLength": 2,
"maxLength": 50
},
"base_level": {
"type": "string",
"enum": ["A-0", "A-1", "A-2", "A-3", "A-4"]
},
"description": {
"type": "string",
"maxLength": 200
},
"decisions": {
"type": "array",
"items": {"type": "string"},
"maxItems": 50
}
},
"additionalProperties": false
}
\\\

### Schema 3 — Decision Relationship

\\\json
{
"\": "http://json-schema.org/draft-07/schema#",
"\": "smos:knowledge:business:decision-relationship:v1",
"title": "Decision Relationship",
"description": "Schema for relationships between SMOS Decision Models",
"type": "object",
"required": ["id", "source", "target", "type"],
"properties": {
"id": {
"type": "string",
"pattern": "^DREL-[0-9]{3}$"
    },
    "source": {
      "type": "string",
      "pattern": "^DEC-[0-9]{3}$"
},
"target": {
"type": "string",
"pattern": "^DEC-[0-9]{3}$|^ALL$"
},
"type": {
"type": "string",
"enum": ["triggers", "precedes", "follows", "may-escalate", "feeds-back", "adjusts", "governs", "overrides"]
},
"description": {
"type": "string",
"maxLength": 300
}
},
"additionalProperties": false
}
\\\

---

## ۲۹. KPIs — شاخص‌های کلیدی عملکرد

| KPI                            | شناسه      | هدف   | بازه    | مسئول       |
| ------------------------------ | ---------- | ----- | ------- | ----------- |
| پوشش تصمیمات در دامنه‌ها       | KPI-104-01 | ۱۰۰٪  | فصلی    | معمار تصمیم |
| نگاشت کامل اختیار به تصمیمات   | KPI-104-02 | ۱۰۰٪  | فصلی    | معمار تصمیم |
| سازگاری با KNW-101/102/103     | KPI-104-03 | ۱۰۰٪  | فصلی    | معمار دانش  |
| پوشش ردیابی تصمیمات            | KPI-104-04 | ≥ ۹۵٪ | ماهانه  | ممیز تصمیم  |
| آمادگی برای خودکارسازی تصمیمات | KPI-104-05 | ≥ ۷۵٪ | شش‌ماهه | معمار تصمیم |

---

## ۳۰. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                 | توسط        |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-29 | نگارش اولیه — معماری تصمیم‌گیری کسب‌وکار سازمانی. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema, ۱۰ تصمیم مرجع (DEC-001 تا DEC-010), ۸ نقطه تصمیم, ۸ معیار, ۵ سطح اختیار, ۹ رابطه. SSOT تصمیم‌گیری SMOS. بدون الگوریتم, AI Logic یا پیاده‌سازی. | معمار سیستم |
