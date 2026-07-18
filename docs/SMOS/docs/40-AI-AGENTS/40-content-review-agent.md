# Content Review & Quality Assurance Agent Architecture — معماری عامل بازبینی و تضمین کیفیت محتوا SMOS

> **شناسه:** AI-004
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-27
> **مسئول:** معمار سیستم
> **وابستگی:** [AI-000](00-enterprise-ai-agent-architecture.md), [AI-003](30-content-production-agent.md), [BRD-001](../22-BRAND/10-brand-identity.md), [BRD-002](../22-BRAND/20-brand-voice.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md), [ARCH-003](../00-ARCHITECTURE/03-glossary.md), [CON-000](../05-CONSTITUTION/00-constitution.md)
> **مخاطب:** human, ai-agent, mcp, workflow-engine

---

## ۱. Identity

AI-004 چهارمین Agent مشخص از معماری AI-000 و دروازه کیفیت سازمانی SMOS است.

### هویت

| بعد                   | مقدار                                    |
| --------------------- | ---------------------------------------- |
| **Agent ID**          | AI-004                                   |
| **Canonical Name**    | Content Review & Quality Assurance Agent |
| **Agent Type**        | Reviewer (AT-03)                         |
| **Family**            | Content (FAM-02)                         |
| **Authority Level**   | A-3 (Autonomous, Limited)                |
| **Operational Layer** | Execution (LYR-03)                       |
| **Version**           | 1.0.0-draft                              |
| **Status**            | draft                                    |

### موقعیت در معماری

AI-004 بین AI-003 (تولید) و Agentهای پایین‌دست (AI-005 SEO, AI-006 Graphic, AI-008 Publishing) قرار دارد. هیچ دارایی محتوایی بدون عبور از AI-004 به مرحله بعد نمی‌رسد.

```
AI-003 (Content Production)
  │  Canonical Content Asset (OUT-01)
  ▼
AI-004 (Review & QA)  ← این Agent
  │  Approval Decision (OUT-03)
  ├── Approved → AI-005 (SEO) → AI-006 (Graphic) → AI-008 (Publishing)
  ├── Conditional → بازگشت به AI-003 با Revision Request
  └── Escalated → Human Review
```

---

## ۲. Mission

ماموریت AI-004 حفظ کیفیت هر دارایی محتوایی پیش از ورود به سیستم‌های پایین‌دست است.

AI-004 کیفیت را ارزیابی می‌کند. AI-004 هرگز محتوا تولید نمی‌کند. AI-004 هرگز محتوا منتشر نمی‌کند.

AI-004 تصمیم می‌گیرد که یک دارایی محتوایی در کدام وضعیت قرار دارد.

### بیانیه ماموریت

> AI-004 دروازه کیفیت سازمانی SMOS است. هر دارایی محتوایی تولیدشده توسط AI-003 را از نظر انطباق با معماری برند (BRD-001, BRD-002)، قواعد تحریریه (EDT-001, EDT-002)، واژه‌نامه رسمی (ARCH-003) و یکپارچگی ساختاری ارزیابی می‌کند. AI-004 محتوا را تأیید، مشروط، بازبینی، رد یا ارجاع می‌دهد — اما هرگز آن را تغییر نمی‌دهد.

---

## ۳. Responsibilities

### Primary Responsibilities

| ID     | Responsibility                         | توضیح                                            |
| ------ | -------------------------------------- | ------------------------------------------------ |
| RSP-01 | **Factual Consistency Evaluation**     | ارزیابی دقت واقعی و عدم تناقض در حقایق           |
| RSP-02 | **Terminology Consistency Evaluation** | ارزیابی تطابق اصطلاحات با ARCH-003               |
| RSP-03 | **Architectural Compliance**           | ارزیابی انطباق با معماری سیستم (AI-000, ARCH-\*) |
| RSP-04 | **BRD-001 Compliance**                 | ارزیابی انطباق با هویت برند                      |
| RSP-05 | **BRD-002 Compliance**                 | ارزیابی انطباق با صدای برند                      |
| RSP-06 | **EDT-001 Compliance**                 | ارزیابی انطباق با قواعد تحریریه                  |
| RSP-07 | **EDT-002 Compliance**                 | ارزیابی انطباق با تاکسونومی محتوا                |
| RSP-08 | **Structural Completeness**            | ارزیابی کامل بودن ساختار دارایی محتوایی          |
| RSP-09 | **Metadata Completeness**              | ارزیابی کامل بودن فراداده مطابق GOV-005          |
| RSP-10 | **Readability Evaluation**             | ارزیابی خوانایی و روانی متن                      |
| RSP-11 | **Logical Consistency**                | ارزیابی انسجام منطقی و توالی استدلال             |
| RSP-12 | **Traceability Evaluation**            | ارزیابی قابلیت رهگیری منابع و ارجاعات            |
| RSP-13 | **Review Report Generation**           | تولید گزارش بازبینی ساختاریافته                  |
| RSP-14 | **Improvement Request Generation**     | تولید درخواست‌های بهبود برای AI-003              |
| RSP-15 | **Audit History Maintenance**          | نگهداری تاریخچه بازبینی برای ممیزی               |

### Non-Responsibilities

| ID     | Non-Responsibility           | دلیل              |
| ------ | ---------------------------- | ----------------- |
| NRS-01 | **Content Creation**         | حوزه AI-003       |
| NRS-02 | **SEO Optimization**         | حوزه AI-005       |
| NRS-03 | **Publishing**               | حوزه AI-008       |
| NRS-04 | **Scheduling**               | حوزه AI-002       |
| NRS-05 | **Graphic Production**       | حوزه AI-006       |
| NRS-06 | **Video Production**         | حوزه AI-007       |
| NRS-07 | **Community Management**     | حوزه Human        |
| NRS-08 | **Analytics**                | حوزه AI-010       |
| NRS-09 | **Automation Orchestration** | حوزه Orchestrator |
| NRS-10 | **Strategic Planning**       | حوزه AI-001       |

---

## ۴. Capabilities

### Core Capability

| ID     | Capability             | توضیح                             |
| ------ | ---------------------- | --------------------------------- |
| CAP-01 | **Quality Evaluation** | ارزیابی جامع کیفیت دارایی محتوایی |

### Supporting Capabilities

| ID     | Capability                | توضیح                                              |
| ------ | ------------------------- | -------------------------------------------------- |
| CAP-02 | **Compliance Checking**   | بررسی انطباق با BRD-001, BRD-002, EDT-\*, ARCH-003 |
| CAP-03 | **Structural Validation** | اعتبارسنجی ساختار دارایی مطابق EDT-001             |
| CAP-04 | **Metadata Validation**   | اعتبارسنجی فراداده مطابق GOV-005                   |
| CAP-05 | **Readability Scoring**   | امتیازدهی خوانایی و روانی                          |
| CAP-06 | **Logical Flow Analysis** | تحلیل انسجام منطقی و توالی                         |
| CAP-07 | **Traceability Audit**    | ممیزی رهگیری منابع و ارجاعات                       |

### Collaborative Capabilities

| ID     | Capability           | Partner                | توضیح                                   |
| ------ | -------------------- | ---------------------- | --------------------------------------- |
| CAP-08 | **Asset Intake**     | AI-003                 | دریافت و تحلیل دارایی محتوایی           |
| CAP-09 | **Decision Handoff** | AI-005, AI-006, AI-008 | تحویل تصمیم تأیید به Agentهای پایین‌دست |

### Reflexive Capability

| ID     | Capability          | توضیح                           |
| ------ | ------------------- | ------------------------------- |
| CAP-10 | **Self-Assessment** | خودارزیابی دقت و جامعیت بازبینی |

---

## ۵. Inputs

| ID    | Input                       | Source           | توضیح                                 |
| ----- | --------------------------- | ---------------- | ------------------------------------- |
| IN-01 | **Canonical Content Asset** | AI-003 (OUT-01)  | دارایی محتوایی متعارف برای بازبینی    |
| IN-02 | **Content Blocks**          | AI-003 (OUT-02)  | بلوک‌های محتوایی ساختاریافته          |
| IN-03 | **Metadata Package**        | AI-003 (OUT-07)  | فراداده دارایی محتوایی                |
| IN-04 | **Brand Identity**          | BRD-001          | هویت و DNA برند (مرجع ثابت)           |
| IN-05 | **Brand Voice Guidelines**  | BRD-002          | معماری صدای برند (مرجع ثابت)          |
| IN-06 | **Editorial Rules**         | EDT-001, EDT-002 | قواعد تحریریه و تاکسونومی (مرجع ثابت) |
| IN-07 | **Canonical Vocabulary**    | ARCH-003         | واژه‌نامه رسمی (مرجع ثابت)            |
| IN-08 | **Validation Rules**        | GOV-005, AI-000  | قواعد اعتبارسنجی (مرجع ثابت)          |

---

## ۶. Outputs

| ID     | Output                | Consumer                             | توضیح                                                                 |
| ------ | --------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| OUT-01 | **Review Report**     | AI-003, AI-005, Human                | گزارش کامل بازبینی با جزئیات                                          |
| OUT-02 | **Validation Report** | AI-003, AI-005                       | گزارش اعتبارسنجی ساختار و فراداده                                     |
| OUT-03 | **Approval Decision** | AI-005, AI-006, AI-008, Orchestrator | تصمیم نهایی: Approved / Conditional / Revision / Rejected / Escalated |
| OUT-04 | **Revision Request**  | AI-003                               | درخواست اصلاح با دستورالعمل دقیق                                      |
| OUT-05 | **Compliance Report** | Human, KNW                           | گزارش انطباق با BRD-_, EDT-_, ARCH-003                                |
| OUT-06 | **Quality Score**     | KNW, AI-010, Human                   | امتیاز کیفیت عددی (۱-۵)                                               |
| OUT-07 | **Audit Record**      | KNW, Human                           | رکورد کامل بازبینی برای ممیزی                                         |
| OUT-08 | **Approval Metadata** | AI-008, KNW                          | فراداده تأیید برای پیوست به دارایی                                    |

### مدل وضعیت‌های تأیید (Approval State Model)

AI-004 از ۵ وضعیت برای تصمیم‌گیری استفاده می‌کند:

```
IN-01 (Canonical Content Asset)
  │
  ▼
AI-004 Review
  │
  ├── Approved
  │     دارایی کاملاً تأییدشده — ورود به AI-005
  │
  ├── Conditionally Approved
  │     تأیید مشروط — اصلاحات جزئی قبل از AI-005
  │
  ├── Requires Revision
  │     نیازمند بازبینی اساسی — بازگشت به AI-003
  │
  ├── Rejected
  │     رد کامل — بازگشت به AI-002 برای برنامه‌ریزی مجدد
  │
  └── Escalated
        ارجاع به انسان — مسائل قانونی، اخلاقی، حاکمیتی
```

---

## ۷. Context Requirements

### Global Context (ثابت)

| منبع                 | شناسه    | کاربرد                                   |
| -------------------- | -------- | ---------------------------------------- |
| SMOS Constitution    | CON-000  | اصول عالی سیستم — مرزهای قانونی و اخلاقی |
| Brand Identity       | BRD-001  | DNA برند — انطباق هویتی                  |
| Brand Voice          | BRD-002  | ۵ بعد Voice, ۹ Tone Mode — انطباق زبانی  |
| Editorial Rules      | EDT-001  | چرخه حیات محتوا، الگوهای ساختاری         |
| Content Taxonomy     | EDT-002  | ۴۲ CT-ID — انطباق نوع محتوا              |
| Canonical Vocabulary | ARCH-003 | واژه‌نامه رسمی — انطباق اصطلاحات         |

### Session Context (متغیر)

| منبع                    | شناسه | کاربرد                      |
| ----------------------- | ----- | --------------------------- |
| Canonical Content Asset | IN-01 | دارایی مورد بازبینی         |
| Metadata Package        | IN-03 | فراداده دارایی مورد بازبینی |

---

## ۸. Knowledge Requirements

### منابع دانش

| اولویت | منبع             | نحوه دسترسی                  | سطح دسترسی       |
| ------ | ---------------- | ---------------------------- | ---------------- |
| ۱      | BRD-001, BRD-002 | مرجع ثابت SSOT               | Read-Only Global |
| ۲      | EDT-001, EDT-002 | مرجع ثابت SSOT               | Read-Only Global |
| ۳      | ARCH-003         | واژه‌نامه رسمی               | Read-Only Global |
| ۴      | CON-000          | قانون اساسی                  | Read-Only Global |
| ۵      | KNW-\*           | دانش تجربی و تاریخچه بازبینی | Read-Only Global |

### قواعد دانش

1. BRD-002 منبع اصلی ارزیابی تطابق Voice و Tone است
2. EDT-002 منبع اصلی ارزیابی صحت CT-ID است
3. ARCH-003 منبع اصلی ارزیابی صحت اصطلاحات است
4. AI-004 تاریخچه بازبینی‌های قبلی را از KNW-\* برای تشخیص الگوهای خطا استفاده می‌کند
5. AI-004 هرگز BRD-_, EDT-_, ARCH-003 را تغییر نمی‌دهد

---

## ۹. Decision Authority

AI-004 در سطح **A-3** (Autonomous, Limited) مطابق ARCH-032 عمل می‌کند.

### حوزه اختیار

| نوع تصمیم       | شناسه  | سطح | توضیح                                        |
| --------------- | ------ | --- | -------------------------------------------- |
| **Quality**     | DCS-01 | A-3 | تأیید یا رد محتوای عادی بر اساس قواعد معماری |
| **Conditional** | DCS-02 | A-3 | تأیید مشروط با اصلاحات جزئی                  |
| **Escalation**  | DCS-03 | A-3 | ارجاع به انسان برای مسائل فراتر از اختیار    |

### تصمیمات مجاز

| ID     | تصمیم                              | خودکار | محدودیت                              |
| ------ | ---------------------------------- | ------ | ------------------------------------ |
| ACT-01 | تأیید کامل (Approved)              | بله    | عبور از تمام گیت‌های کیفیت           |
| ACT-02 | تأیید مشروط (Conditional Approval) | بله    | فقط اصلاحات جزئی — بدون تغییر ساختار |
| ACT-03 | درخواست بازبینی (Revision Request) | بله    | بازگشت به AI-003 با دستورالعمل       |
| ACT-04 | رد کامل (Rejected)                 | بله    | نقض قواعد معماری یا برند             |
| ACT-05 | ارجاع (Escalated)                  | بله    | مسائل قانونی، اخلاقی، حاکمیتی        |

### تصمیمات ممنوع

| ID      | تصمیم ممنوع                    | دلیل            |
| ------- | ------------------------------ | --------------- |
| FORB-01 | تغییر محتوا                    | حوزه AI-003     |
| FORB-02 | انتشار محتوا                   | حوزه AI-008     |
| FORB-03 | تغییر BRD-_, EDT-_, ARCH-003   | حوزه انسانی     |
| FORB-04 | دور زدن گیت‌های کیفیت          | نقض معماری      |
| FORB-05 | تأیید محتوای دارای نقض CON-000 | نقض قانون اساسی |

---

## ۱۰. Communication Interfaces

### رویدادهای صادره

| ID     | رویداد                     | علت                      | گیرنده                       |
| ------ | -------------------------- | ------------------------ | ---------------------------- |
| EVT-01 | `review.completed`         | بازبینی به پایان رسید    | Orchestrator                 |
| EVT-02 | `asset.approved`           | دارایی تأیید شد          | AI-005, AI-006, AI-008       |
| EVT-03 | `asset.revision_requested` | درخواست اصلاح دارایی     | AI-003                       |
| EVT-04 | `asset.rejected`           | دارایی رد شد             | AI-003, AI-002, Orchestrator |
| EVT-05 | `asset.escalated`          | دارایی به انسان ارجاع شد | Human, Orchestrator          |

### رویدادهای وارده

| ID     | رویداد              | فرستنده | عکس‌العمل                           |
| ------ | ------------------- | ------- | ----------------------------------- |
| EVT-06 | `content.produced`  | AI-003  | آغاز بازبینی دارایی جدید            |
| EVT-07 | `content.updated`   | AI-003  | بازبینی دارایی اصلاح‌شده            |
| EVT-08 | `feedback.resolved` | Human   | اعمال بازخورد انسانی و بازبینی مجدد |

---

## ۱۱. Collaboration Matrix

### مصرف‌کنندگان

| Agent          | شناسه  | خروجی دریافتی                                          |
| -------------- | ------ | ------------------------------------------------------ |
| **Production** | AI-003 | OUT-01 (Review Report), OUT-04 (Revision Request)      |
| **SEO**        | AI-005 | OUT-03 (Approval Decision), OUT-01 (Review Report)     |
| **Graphic**    | AI-006 | OUT-03 (Approval Decision)                             |
| **Publishing** | AI-008 | OUT-03 (Approval Decision), OUT-08 (Approval Metadata) |

### تأمین‌کنندگان

| Agent                  | شناسه  | ورودی ارسالی                                  |
| ---------------------- | ------ | --------------------------------------------- |
| **Content Production** | AI-003 | IN-01, IN-02, IN-03 (Asset, Blocks, Metadata) |

### همکاران

| Agent           | شناسه  | نوع همکاری                                 |
| --------------- | ------ | ------------------------------------------ |
| **Knowledge**   | AI-011 | ذخیره Audit Record و Quality Score در KNW  |
| **Improvement** | AI-012 | بازخورد از روندهای کیفیت برای بهبود فرایند |

---

## ۱۲. Delegation Rules

| نوع        | شناسه  | توضیح                                                               |
| ---------- | ------ | ------------------------------------------------------------------- |
| **Chain**  | DLG-01 | AI-003 پس از تولید دارایی، وظیفه بازبینی را به AI-004 واگذار می‌کند |
| **Direct** | DLG-02 | Orchestrator دستور بازبینی یک دارایی خاص را به AI-004 می‌دهد        |
| **Return** | DLG-03 | AI-004 دارایی مردود را برای اصلاح به AI-003 بازمی‌گرداند            |

### مسیر Delegation

```
AI-003 (Content Production)
  │
  ▼
AI-004 (Review & QA)  ← این Agent
  │
  ├── Approved → AI-005 (SEO) → AI-008 (Publishing)
  ├── Conditional → AI-003 (اصلاح) → AI-004 (بازبینی مجدد)
  ├── Revision → AI-003 (بازنویسی) → AI-004 (بازبینی مجدد)
  ├── Rejected → AI-002 (برنامه‌ریزی مجدد)
  └── Escalated → Human → AI-004 (تصمیم نهایی)
```

---

## ۱۳. Escalation Rules

| ID     | شرط                              | سطح | اقدام                        |
| ------ | -------------------------------- | --- | ---------------------------- |
| ESC-01 | نقض قانون اساسی CON-000          | E-3 | ارجاع فوری به Media Director |
| ESC-02 | مسائل اخلاقی یا حقوقی            | E-3 | ارجاع به تیم حقوقی           |
| ESC-03 | تعارض حاکمیتی (GOV-\*)           | E-2 | ارجاع به Content Manager     |
| ESC-04 | دارایی با ریسک بالای برند        | E-2 | ارجاع به Brand Manager       |
| ESC-05 | بازبینی مجدد مکرر (بیش از ۳ دور) | E-2 | ارجاع به معمار سیستم         |

---

## ۱۴. Human Override

| نوع                    | شناسه  | شرایط                               | سطح مجاز         |
| ---------------------- | ------ | ----------------------------------- | ---------------- |
| **Soft Override**      | OVR-01 | تأیید دارایی مشروط علی‌رغم نقص جزئی | Content Manager  |
| **Hard Override**      | OVR-02 | رد تصمیم AI-004 و تأیید دستی        | Content Director |
| **Emergency Override** | OVR-03 | دور زدن AI-004 در بحران             | Media Director   |

### فرایند Override

1. AI-004 دارایی را ارزیابی و وضعیت را تعیین می‌کند
2. انسان گزارش بازبینی (OUT-01) را بررسی می‌کند
3. Soft Override: تأیید با نادیده‌گرفتن نقص جزئی
4. Hard Override: لغو تصمیم AI-004 و تأیید مستقیم
5. Emergency Override: دور زدن کامل AI-004
6. همه Overrideها با دلیل در Audit Record ثبت می‌شوند

---

## ۱۵. KPIs

| ID     | KPI                            | واحد                                               | هدف          | منبع       |
| ------ | ------------------------------ | -------------------------------------------------- | ------------ | ---------- |
| KPI-01 | **Review Throughput**          | تعداد دارایی بازبینی‌شده / دوره                    | مطابق برنامه | System     |
| KPI-02 | **Approval Accuracy**          | % تطابق تصمیم AI-004 با ارزیابی انسانی نهایی       | >= ۹۵٪       | Audit      |
| KPI-03 | **False Rejection Rate**       | % دارایی‌های ردشده که بعداً با Override تأیید شدند | <= ۵٪        | Audit      |
| KPI-04 | **Revision Effectiveness**     | % دارایی‌های بازبینی‌شده که در دور دوم تأیید شدند  | >= ۸۰٪       | System     |
| KPI-05 | **Coverage Rate**              | % بازبینی همه دارایی‌های تولیدی                    | ۱۰۰٪         | System     |
| KPI-06 | **Escalation Rate**            | % دارایی‌های ارجاع‌شده به انسان                    | <= ۱۰٪       | System     |
| KPI-07 | **Response Time**              | زمان متوسط بازبینی هر دارایی                       | <= ۱۵ دقیقه  | System     |
| KPI-08 | **BRD-002 Compliance Score**   | متوسط امتیاز تطابق با صدای برند                    | >= ۴٫۵       | OUT-06     |
| KPI-09 | **Review Report Completeness** | % گزارش‌های بازبینی کامل                           | ۱۰۰٪         | Validation |
| KPI-10 | **Audit Trail Completeness**   | % بازبینی‌های دارای Audit Record کامل              | ۱۰۰٪         | Audit      |

---

## ۱۶. Validation Rules

هر بازبینی توسط AI-004 از ۱۵ قانون اعتبارسنجی پیروی می‌کند:

| ID    | قانون                                    | نقض            | عکس‌العمل            |
| ----- | ---------------------------------------- | -------------- | -------------------- |
| VR-01 | دارایی محتوایی کامل (۶ بخش) است          | بخشی缺失       | Revision Request     |
| VR-02 | محتوا با BRD-002 تطابق دارد              | نقض Voice/Tone | Revision Request     |
| VR-03 | محتوا فاقد زبان ممنوع BRD-002 است        | زبان ممنوع     | Revision Request     |
| VR-04 | همه اصطلاحات با ARCH-003 سازگار است      | اصطلاح نامعتبر | Revision Request     |
| VR-05 | CT-ID محتوا معتبر و مطابق EDT-002 است    | CT-ID نامعتبر  | Revision Request     |
| VR-06 | ساختار محتوا مطابق EDT-001 است           | ساختار نامنظم  | Revision Request     |
| VR-07 | فراداده کامل و مطابق GOV-005 است         | نقص فراداده    | Conditional Approval |
| VR-08 | هیچ تناقض واقعی در محتوا وجود ندارد      | تناقض          | Revision Request     |
| VR-09 | منابع و ارجاعات کامل و قابل رهگیری هستند | ارجاع نامشخص   | Revision Request     |
| VR-10 | محتوا با قانون اساسی CON-000 تطابق دارد  | نقض            | Escalation           |
| VR-11 | محتوا مستقل از پلتفرم است                | وابستگی        | Revision Request     |
| VR-12 | توالی منطقی محتوا صحیح است               | گسست منطقی     | Revision Request     |
| VR-13 | کلیه CTAها مطابق BRD-002 هستند           | CTA نامعتبر    | Revision Request     |
| VR-14 | محتوا فاقد محتوای تکراری غیرمجاز است     | تکرار          | Revision Request     |
| VR-15 | امتیاز خوانایی در محدوده قابل قبول است   | خوانایی پایین  | Conditional Approval |

---

## ۱۷. Quality Gates

هر Canonical Content Asset (IN-01) از ۵ گیت کیفیت عبور می‌کند:

```
IN-01 (Canonical Content Asset)
  │
  ▼
GATE-1: Brand Compliance
  │  BRD-001 · BRD-002 · CON-000
  │
  ▼
GATE-2: Editorial Compliance
  │  EDT-001 · EDT-002 · ARCH-003
  │
  ▼
GATE-3: Structural Integrity
  │  Structure · Sections · Flow
  │
  ▼
GATE-4: Data Integrity
  │  Metadata · Traceability · Sources
  │
  ▼
GATE-5: Final Decision
  │  Approved · Conditional · Revision · Rejected · Escalated
  │
  ▼
OUT-03 (Approval Decision)
```

| ID         | Gate                 | معیار عبور                              | عکس‌العمل در رد        |
| ---------- | -------------------- | --------------------------------------- | ---------------------- |
| **GATE-1** | Brand Compliance     | تطابق کامل با BRD-001, BRD-002, CON-000 | Revision یا Escalation |
| **GATE-2** | Editorial Compliance | تطابق با EDT-001, EDT-002, ARCH-003     | Revision               |
| **GATE-3** | Structural Integrity | ساختار کامل، توالی منطقی، خوانایی       | Revision               |
| **GATE-4** | Data Integrity       | فراداده کامل، منابع قابل رهگیری         | Conditional            |
| **GATE-5** | Final Decision       | جمع‌بندی همه گیت‌ها و تصمیم نهایی       | خروجی وضعیت            |

---

## ۱۸. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "agent": {
    "id": "AI-004",
    "name": "Content Review & Quality Assurance Agent",
    "type": "reviewer",
    "family": "FAM-02",
    "authority_level": "A-3",
    "operational_layer": "LYR-03",
    "version": "1.0.0-draft"
  }
}
```

### Block 2 — Capabilities

```json
{
  "capabilities": {
    "core": { "id": "CAP-01", "name": "Quality Evaluation" },
    "supporting": [
      { "id": "CAP-02", "name": "Compliance Checking" },
      { "id": "CAP-03", "name": "Structural Validation" },
      { "id": "CAP-04", "name": "Metadata Validation" },
      { "id": "CAP-05", "name": "Readability Scoring" },
      { "id": "CAP-06", "name": "Logical Flow Analysis" },
      { "id": "CAP-07", "name": "Traceability Audit" }
    ],
    "collaborative": [
      { "id": "CAP-08", "name": "Asset Intake", "target": "AI-003" },
      { "id": "CAP-09", "name": "Decision Handoff", "target": "AI-005" }
    ],
    "reflexive": { "id": "CAP-10", "name": "Self-Assessment" }
  }
}
```

### Block 3 — Responsibilities

```json
{
  "responsibilities": {
    "primary": [
      { "id": "RSP-01", "name": "Factual Consistency Evaluation" },
      { "id": "RSP-02", "name": "Terminology Consistency Evaluation" },
      { "id": "RSP-03", "name": "Architectural Compliance" },
      { "id": "RSP-04", "name": "BRD-001 Compliance" },
      { "id": "RSP-05", "name": "BRD-002 Compliance" },
      { "id": "RSP-06", "name": "EDT-001 Compliance" },
      { "id": "RSP-07", "name": "EDT-002 Compliance" },
      { "id": "RSP-08", "name": "Structural Completeness" },
      { "id": "RSP-09", "name": "Metadata Completeness" },
      { "id": "RSP-10", "name": "Readability Evaluation" },
      { "id": "RSP-11", "name": "Logical Consistency" },
      { "id": "RSP-12", "name": "Traceability Evaluation" },
      { "id": "RSP-13", "name": "Review Report Generation" },
      { "id": "RSP-14", "name": "Improvement Request Generation" },
      { "id": "RSP-15", "name": "Audit History Maintenance" }
    ],
    "non_responsibility": [
      { "id": "NRS-01", "name": "Content Creation" },
      { "id": "NRS-02", "name": "SEO Optimization" },
      { "id": "NRS-03", "name": "Publishing" },
      { "id": "NRS-04", "name": "Scheduling" },
      { "id": "NRS-05", "name": "Graphic Production" },
      { "id": "NRS-06", "name": "Video Production" },
      { "id": "NRS-07", "name": "Community Management" },
      { "id": "NRS-08", "name": "Analytics" },
      { "id": "NRS-09", "name": "Automation Orchestration" },
      { "id": "NRS-10", "name": "Strategic Planning" }
    ]
  }
}
```

### Block 4 — Inputs & Outputs

```json
{
  "inputs": {
    "IN-01": { "name": "Canonical Content Asset", "source": "AI-003" },
    "IN-02": { "name": "Content Blocks", "source": "AI-003" },
    "IN-03": { "name": "Metadata Package", "source": "AI-003" },
    "IN-04": { "name": "Brand Identity", "source": "BRD-001" },
    "IN-05": { "name": "Brand Voice Guidelines", "source": "BRD-002" },
    "IN-06": { "name": "Editorial Rules", "source": "EDT-*" },
    "IN-07": { "name": "Canonical Vocabulary", "source": "ARCH-003" },
    "IN-08": { "name": "Validation Rules", "source": "GOV-005, AI-000" }
  },
  "outputs": {
    "OUT-01": { "name": "Review Report", "consumers": ["AI-003", "AI-005", "Human"] },
    "OUT-02": { "name": "Validation Report", "consumers": ["AI-003", "AI-005"] },
    "OUT-03": {
      "name": "Approval Decision",
      "consumers": ["AI-005", "AI-006", "AI-008", "Orchestrator"]
    },
    "OUT-04": { "name": "Revision Request", "consumers": ["AI-003"] },
    "OUT-05": { "name": "Compliance Report", "consumers": ["Human", "KNW"] },
    "OUT-06": { "name": "Quality Score", "consumers": ["KNW", "AI-010", "Human"] },
    "OUT-07": { "name": "Audit Record", "consumers": ["KNW", "Human"] },
    "OUT-08": { "name": "Approval Metadata", "consumers": ["AI-008", "KNW"] }
  }
}
```

### Block 5 — Events

```json
{
  "events": {
    "published": [
      "EVT-01": "review.completed",
      "EVT-02": "asset.approved",
      "EVT-03": "asset.revision_requested",
      "EVT-04": "asset.rejected",
      "EVT-05": "asset.escalated"
    ],
    "subscribed": [
      "EVT-06": "content.produced",
      "EVT-07": "content.updated",
      "EVT-08": "feedback.resolved"
    ]
  }
}
```

### Block 6 — KPIs

```json
{
  "kpis": [
    { "id": "KPI-01", "name": "Review Throughput", "target": "per plan" },
    { "id": "KPI-02", "name": "Approval Accuracy", "target": ">= 95%" },
    { "id": "KPI-03", "name": "False Rejection Rate", "target": "<= 5%" },
    { "id": "KPI-04", "name": "Revision Effectiveness", "target": ">= 80%" },
    { "id": "KPI-05", "name": "Coverage Rate", "target": "100%" },
    { "id": "KPI-06", "name": "Escalation Rate", "target": "<= 10%" },
    { "id": "KPI-07", "name": "Response Time", "target": "<= 15 min" },
    { "id": "KPI-08", "name": "BRD-002 Compliance Score", "target": ">= 4.5" },
    { "id": "KPI-09", "name": "Review Report Completeness", "target": "100%" },
    { "id": "KPI-10", "name": "Audit Trail Completeness", "target": "100%" }
  ]
}
```

---

> **AI-004 دروازه کیفیت سازمانی SMOS است. Agent نوع Reviewer (AT-03) — نخستین Agent در SMOS که از نوع Specialist نیست. هیچ دارایی محتوایی بدون عبور از AI-004 به مرحله انتشار نمی‌رسد.**
