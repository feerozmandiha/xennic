# Enterprise Operations Knowledge Foundation — پایه دانش عملیات سازمانی

> **شناسه:** KNW-401
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-30
> **مسئول:** معمار عملیات سازمانی
> **وابستگی:** [KNW-000](./00-enterprise-knowledge-architecture.md), [KNW-001](./10-knowledge-index.md), [KNW-101](./100-business-knowledge-foundation.md), [KNW-102](./102-business-rules-policies.md), [KNW-103](./104-business-process-architecture.md), [KNW-301](./300-platform-knowledge-foundation.md), [KNW-302](./302-platform-capability-service-architecture.md), [KNW-304](./306-platform-governance-architecture.md)
> **مخاطب:** human, ai-agent, knowledge-engineer, operations-manager, quality-analyst, compliance-officer

---

## ۱. Purpose

KNW-401 نخستین سند خانواده Knowledge Operations (KNW-OPS) و SSOT (تک منبع حقیقت) برای تمام مفاهیم، دامنه‌ها، موجودیت‌ها، قابلیت‌ها و کارکردهای عملیات سازمانی SMOS است.

### چرا KNW-401 وجود دارد

بدون یک پایه دانش عملیات:

- مفاهیم عملیاتی در AI-_ و AUT-_ پراکنده می‌شوند
- Agentها نمی‌توانند دانش عملیات را به صورت ساختاریافته مصرف کنند
- قابلیت‌های عملیاتی قابل ردیابی و مقایسه نیستند
- اضافه کردن عملیات جدید نیازمند بازتعریف مفاهیم است
- هماهنگی بین AI-_ و AUT-_ و PRM-\* مختل می‌شود

KNW-401 این مشکلات را با تعریف **چارچوب یکپارچه دانش عملیات** حل می‌کند.

### نقش KNW-401 در SMOS

| سند             | نقش                                           |
| --------------- | --------------------------------------------- |
| KNW-101–KNW-104 | SSOT مفاهیم کسب‌وکار — مراجع بالادستی عملیات  |
| KNW-301–KNW-308 | SSOT مفاهیم پلتفرم — بستر عملیات              |
| **KNW-401**     | **SSOT مفاهیم، دامنه‌ها و قابلیت‌های عملیات** |
| KNW-402+        | دانش‌های تخصصی عملیات (حکمرانی، نظارت، گزارش) |
| AI-\*           | مصرف‌کننده مفاهیم عملیات برای اجرا            |
| AUT-\*          | مصرف‌کننده مفاهیم عملیات برای خودکارسازی      |

---

## ۲. Scope

### Inside Scope

| حوزه                 | توضیح                         |
| -------------------- | ----------------------------- |
| فلسفه و اصول عملیات  | هستی‌شناسی عملیات سازمانی     |
| تعریف دامنه عملیات   | مرزهای دانش عملیات            |
| مدل طبقه‌بندی عملیات | انواع و دسته‌بندی عملیات‌ها   |
| مدل مفاهیم عملیاتی   | مفاهیم بنیادین عملیات         |
| مدل موجودیت عملیاتی  | موجودیت‌های عملیاتی           |
| مدل قابلیت عملیاتی   | قابلیت‌های عملیاتی            |
| مدل کارکرد عملیاتی   | کارکردهای عملیاتی             |
| مدل حالت عملیاتی     | وضعیت‌های عملیات              |
| مدل رابطه عملیاتی    | روابط بین موجودیت‌های عملیاتی |
| مدل محدودیت عملیاتی  | محدودیت‌های عملیات            |
| مدل حکمرانی عملیاتی  | اصول و قواعد حاکم بر عملیات   |
| مدل بلوغ عملیاتی     | مراحل تکامل عملیات            |

### Outside Scope

| حوزه                       | دلیل                     |
| -------------------------- | ------------------------ |
| Workflowهای عملیاتی        | حوزه AUT-\*              |
| پرامپت‌های عملیاتی         | حوزه PRM-\*              |
| SOP و رویه‌های اجرایی      | حوزه عملیاتی خارج از KNW |
| داده‌های واقعی عملیات      | حوزه سیستم‌های عملیاتی   |
| پیکربندی Agent برای عملیات | حوزه AI-\*               |
| پیاده‌سازی API             | حوزه فنی (خارج از KNW)   |
| مشخصات پلتفرم              | حوزه KNW-301, PLAT-\*    |

---

## ۳. Operations Principles

### اصول عملیات سازمانی

| ID     | اصل                             | توضیح                                          |
| ------ | ------------------------------- | ---------------------------------------------- |
| OPP-01 | **عملیات قابل مشاهده است**      | همه عملیات SMOS قابل ردیابی و حسابرسی هستند    |
| OPP-02 | **عملیات قابل اندازه‌گیری است** | هر عملیات دارای معیارهای کمی و کیفی است        |
| OPP-03 | **عملیات قابل تکرار است**       | عملیات باید به صورت استاندارد قابل تکرار باشند |
| OPP-04 | **عملیات قابل بهبود است**       | بازخورد عملیات به بهبود مستمر منجر می‌شود      |
| OPP-05 | **عملیات دارای مرز است**        | هر عملیات دارای محدوده و مسئولیت مشخص است      |
| OPP-06 | **عملیات خودکار شدنی است**      | عملیات باید برای خودکارسازی طراحی شوند         |
| OPP-07 | **عملیات ایمن است**             | امنیت در همه عملیات SMOS ذاتی است              |
| OPP-08 | **عملیات هماهنگ است**           | عملیات با سایر خانواده‌های دانش هماهنگ است     |

---

## ۴. Operations Philosophy

### فلسفه دانش عملیات

SMOS دانش عملیات را به عنوان **زبان مشترک عملیاتی** سازمان می‌بیند که:

1. **انتزاعی است** — مستقل از هر ابزار یا سیستم خاصی تعریف می‌شود
2. **ثابت است** — در طول زمان پایدار می‌ماند مگر با ADR تغییر کند
3. **مرجع است** — همه AI-*ها و AUT-*ها به آن ارجاع می‌دهند
4. **قابل مصرف است** — توسط انسان و Agent قابل درک است
5. **تک منبع است** — هر مفهوم عملیاتی یک خانه دارد

### اصول هستی‌شناسی عملیات

| اصل                                       | توضیح                                |
| ----------------------------------------- | ------------------------------------ |
| **عملیات یک فعالیت است**                  | مجموعه اقدامات با ورودی و خروجی مشخص |
| **هر عملیات یک وضعیت دارد**               | وضعیت جریان عملیات قابل ردیابی است   |
| **هر عملیات یک مالک دارد**                | مسئولیت عملیات مشخص است              |
| **عملیات تابع فرآیند کسب‌وکار است**       | از KNW-103 پیروی می‌کند              |
| **عملیات روی سکوهای پلتفرمی اجرا می‌شود** | از KNW-301 استفاده می‌کند            |

---

## ۵. Operations Objectives

### اهداف عملیات سازمانی

| ID     | هدف                     | توضیح                                      |
| ------ | ----------------------- | ------------------------------------------ |
| OBO-01 | **قابلیت مشاهده کامل**  | همه عملیات SMOS قابل مشاهده و ردیابی هستند |
| OBO-02 | **کیفیت عملیاتی**       | عملیات با بالاترین کیفیت اجرا می‌شوند      |
| OBO-03 | **سرعت عملیاتی**        | عملیات در کمترین زمان ممکن اجرا می‌شوند    |
| OBO-04 | **هزینه عملیاتی بهینه** | منابع عملیاتی بهینه مصرف می‌شوند           |
| OBO-05 | **خودکارسازی تدریجی**   | عملیات به مرور خودکار می‌شوند              |
| OBO-06 | **تاب‌آوری عملیاتی**    | عملیات در برابر خطا مقاوم هستند            |
| OBO-07 | **انطباق عملیاتی**      | عملیات با قواعد و سیاست‌ها مطابق هستند     |
| OBO-08 | **تکامل عملیاتی**       | عملیات در طول زمان بهبود می‌یابد           |

---

## ۶. Operations Taxonomy

### تاکسونومی عملیات

KNW-401 عملیات‌ها را بر اساس چهار بعد اصلی طبقه‌بندی می‌کند:

#### بعد اول — نوع عملیات

| نوع      | شناسه      | مثال                   |
| -------- | ---------- | ---------------------- |
| انتشار   | OP-TYPE-01 | انتشار محتوا در پلتفرم |
| نظارت    | OP-TYPE-02 | نظارت بر عملکرد پلتفرم |
| تعامل    | OP-TYPE-03 | پاسخ به نظرات کاربران  |
| گزارش    | OP-TYPE-04 | تولید گزارش عملکرد     |
| تحلیل    | OP-TYPE-05 | تحلیل داده عملیاتی     |
| پشتیبانی | OP-TYPE-06 | پشتیبانی عملیاتی       |
| هماهنگی  | OP-TYPE-07 | هماهنگی بین عملیات‌ها  |
| بازیابی  | OP-TYPE-08 | بازیابی از خطا         |

#### بعد دوم — سطح عملیات

| سطح       | شناسه       | توضیح                          |
| --------- | ----------- | ------------------------------ |
| استراتژیک | OP-LEVEL-01 | تصمیمات و برنامه‌ریزی عملیاتی  |
| تاکتیکی   | OP-LEVEL-02 | هماهنگی و مدیریت عملیات روزانه |
| اجرایی    | OP-LEVEL-03 | اجرای مستقیم عملیات            |
| خودکار    | OP-LEVEL-04 | عملیات خودکار بدون دخالت انسان |

#### بعد سوم — تکرارپذیری

| سطح تکرار | شناسه     | توضیح                       |
| --------- | --------- | --------------------------- |
| تکراری    | OP-REP-01 | عملیات روزانه با الگوی ثابت |
| دوره‌ای   | OP-REP-02 | عملیات هفتگی/ماهانه         |
| رویدادی   | OP-REP-03 | عملیات مبتنی بر رویداد      |
| یک‌باره   | OP-REP-04 | عملیات ویژه و غیرتکراری     |

#### بعد چهارم — خودکارسازی

| سطح خودکارسازی | شناسه     | توضیح                       |
| -------------- | --------- | --------------------------- |
| دستی           | OP-AUT-01 | کاملاً دستی توسط انسان      |
| نیمه‌خودکار    | OP-AUT-02 | ترکیب انسان و ماشین         |
| خودکار         | OP-AUT-03 | کاملاً خودکار               |
| هوشمند         | OP-AUT-04 | خودکار با تصمیم‌گیری هوشمند |

---

## ۷. Operations Classification Model

### مدل طبقه‌بندی عملیات

هر عملیات SMOS با ترکیب چهار بعد طبقه‌بندی می‌شود:

```
عملیات = نوع + سطح + تکرارپذیری + خودکارسازی
```

### ماتریس طبقه‌بندی عملیات‌های مرجع

| عملیات           | نوع        | سطح         | تکرارپذیری | خودکارسازی |
| ---------------- | ---------- | ----------- | ---------- | ---------- |
| انتشار محتوا     | OP-TYPE-01 | OP-LEVEL-03 | OP-REP-01  | OP-AUT-03  |
| زمان‌بندی انتشار | OP-TYPE-01 | OP-LEVEL-02 | OP-REP-01  | OP-AUT-03  |
| نظارت بر پلتفرم  | OP-TYPE-02 | OP-LEVEL-03 | OP-REP-01  | OP-AUT-03  |
| پاسخ به نظر      | OP-TYPE-03 | OP-LEVEL-03 | OP-REP-01  | OP-AUT-02  |
| تحلیل عملکرد     | OP-TYPE-05 | OP-LEVEL-02 | OP-REP-02  | OP-AUT-03  |
| گزارش ماهانه     | OP-TYPE-04 | OP-LEVEL-02 | OP-REP-02  | OP-AUT-03  |
| مدیریت حادثه     | OP-TYPE-08 | OP-LEVEL-02 | OP-REP-03  | OP-AUT-02  |
| حسابرسی عملیات   | OP-TYPE-06 | OP-LEVEL-01 | OP-REP-02  | OP-AUT-02  |

---

## ۸. Operations Object Model

### مدل اشیاء عملیاتی

مدل اشیاء عملیاتی SMOS روابط بین مفاهیم بنیادین عملیات را تعریف می‌کند:

```
┌──────────────┐        ┌──────────────┐
│  Operational │── runs ─▶  Operational │
│  Entity      │        │  Function    │
└──────────────┘        └──────┬───────┘
       │                       │
       │ has                   │ produces
       ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Operational  │        │ Operational  │
│ Capability   │        │   Outcome    │
└──────────────┘        └──────────────┘
       │                       │
       │ enables               │ feeds
       ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Operational  │        │ Operational  │
│ Domain       │        │   Metric     │
└──────────────┘        └──────────────┘
```

### مدل حالت

هر عملیات SMOS دارای یک وضعیت جاری از مجموعه وضعیت‌های تعریف‌شده است و از طریق انتقال‌های مجاز بین وضعیت‌ها حرکت می‌کند.

---

## ۹. Operational Concepts

### مفاهیم بنیادین عملیات

| شناسه  | مفهوم                   | توضیح                                                |
| ------ | ----------------------- | ---------------------------------------------------- |
| OPC-01 | Operation               | یک فعالیت عملیاتی اتمیک در SMOS                      |
| OPC-02 | Operational Process     | مجموعه فعالیت‌های عملیاتی مرتبط با توالی مشخص        |
| OPC-03 | Operational Event       | رویدادی که آغازگر یا تغییردهنده وضعیت عملیات است     |
| OPC-04 | Operational Task        | وظیفه عملیاتی مشخص با ورودی، خروجی و مسئول           |
| OPC-05 | Operational Schedule    | زمان‌بندی اجرای عملیات در بازه‌های زمانی             |
| OPC-06 | Operational State       | وضعیت جاری یک عملیات در چرخه حیات                    |
| OPC-07 | Operational Transition  | حرکت مجاز بین دو وضعیت عملیاتی                       |
| OPC-08 | Operational Alert       | هشدار خودکار درباره وضعیت یا رویداد عملیاتی          |
| OPC-09 | Operational Incident    | حادثه عملیاتی نیازمند مداخله                         |
| OPC-10 | Operational Report      | گزارش ساختاریافته از وضعیت و عملکرد عملیات           |
| OPC-11 | Operational Metric      | معیار کمی برای اندازه‌گیری عملکرد عملیات             |
| OPC-12 | Operational Quality     | سطح کیفی مورد انتظار از یک عملیات                    |
| OPC-13 | Operational Risk        | ریسک مرتبط با اجرای یک عملیات                        |
| OPC-14 | Operational Constraint  | محدودیت اعمال‌شده بر یک عملیات                       |
| OPC-15 | Operational Resource    | منبع مورد نیاز برای اجرای عملیات (زمان، هزینه، نیرو) |
| OPC-16 | Operational Role        | نقش مسئول در قبال یک عملیات                          |
| OPC-17 | Operational Log         | ثبت وقایع و رویدادهای عملیاتی                        |
| OPC-18 | Operational Audit       | حسابرسی مستقل از عملیات                              |
| OPC-19 | Operational Baseline    | خط پایه عملکرد عملیات برای مقایسه                    |
| OPC-20 | Operational Improvement | بهبود مستمر در یک عملیات                             |

---

## ۱۰. Operational Entities

### موجودیت‌های عملیاتی

| شناسه  | موجودیت              | توضیح                    | مؤلفه‌های کلیدی             |
| ------ | -------------------- | ------------------------ | --------------------------- |
| OPE-01 | Operations Schedule  | زمان‌بندی اجرای عملیات   | بازه، تناوب، اولویت، وضعیت  |
| OPE-02 | Operations Queue     | صف عملیات در انتظار اجرا | ترتیب، اولویت، نوع، وضعیت   |
| OPE-03 | Operations Log       | ثبت وقایع عملیاتی        | زمان، نوع، منبع، جزئیات     |
| OPE-04 | Operations Report    | گزارش عملیاتی            | بازه، معیارها، روند، نتیجه  |
| OPE-05 | Operations Alert     | هشدار عملیاتی            | سطح، نوع، منبع، اقدام       |
| OPE-06 | Operations Incident  | حادثه عملیاتی            | شدت، وضعیت، مسئول، اقدامات  |
| OPE-07 | Operations Runbook   | کتابچه راهنمای عملیات    | هدف، مراحل، خطاها، بازیابی  |
| OPE-08 | Operations Metric    | سنجه عملیاتی             | نام، مقدار، هدف، وضعیت      |
| OPE-09 | Operations Dashboard | داشبورد عملیاتی          | معیارها، نمودارها، هشدارها  |
| OPE-10 | Operations Policy    | خط‌مشی عملیاتی           | دامنه، قواعد، مجوزها        |
| OPE-11 | Operations Role      | نقش عملیاتی              | مسئولیت، اختیار، حساب‌پذیری |
| OPE-12 | Operations Resource  | منبع عملیاتی             | نوع، ظرفیت، مصرف، وضعیت     |

---

## ۱۱. Operational Capabilities

### قابلیت‌های عملیاتی

| شناسه     | قابلیت                | دامنه  | توضیح                                 |
| --------- | --------------------- | ------ | ------------------------------------- |
| OPCAP-001 | Publishing Operations | OPD-01 | عملیات انتشار محتوا در پلتفرم‌ها      |
| OPCAP-002 | Scheduling Operations | OPD-01 | عملیات زمان‌بندی و برنامه‌ریزی انتشار |
| OPCAP-003 | Monitoring Operations | OPD-02 | نظارت مستمر بر عملیات و پلتفرم‌ها     |
| OPCAP-004 | Incident Response     | OPD-03 | تشخیص، تحلیل و رخداد حادثه            |
| OPCAP-005 | Performance Tracking  | OPD-02 | ردیابی و اندازه‌گیری عملکرد عملیات    |
| OPCAP-006 | Quality Control       | OPD-04 | کنترل و تضمین کیفیت عملیات            |
| OPCAP-007 | Reporting Operations  | OPD-05 | تولید و توزیع گزارش‌های عملیاتی       |
| OPCAP-008 | Resource Management   | OPD-06 | مدیریت و تخصیص منابع عملیاتی          |
| OPCAP-009 | Queue Management      | OPD-01 | مدیریت صف عملیات                      |
| OPCAP-010 | Log Management        | OPD-02 | مدیریت ثبت و بایگانی وقایع عملیاتی    |
| OPCAP-011 | Alert Management      | OPD-03 | مدیریت هشدارها و اطلاع‌رسانی          |
| OPCAP-012 | Audit Operations      | OPD-07 | حسابرسی و بازرسی عملیات               |
| OPCAP-013 | Compliance Operations | OPD-07 | انطباق عملیات با قواعد و سیاست‌ها     |
| OPCAP-014 | Continuity Management | OPD-08 | مدیریت تداوم و بازیابی عملیات         |

### نگاشت قابلیت به Agent

| قابلیت    | Agent مصرف‌کننده | نوع مصرف    |
| --------- | ---------------- | ----------- |
| OPCAP-001 | AI-008           | اجرا        |
| OPCAP-002 | AI-008           | برنامه‌ریزی |
| OPCAP-003 | AI-009, AI-010   | نظارت       |
| OPCAP-004 | AI-009, AI-012   | اجرا        |
| OPCAP-005 | AI-010           | تحلیل       |
| OPCAP-006 | AI-004           | اعتبارسنجی  |
| OPCAP-007 | AI-010           | تولید       |
| OPCAP-008 | AI-014           | مدیریت      |
| OPCAP-009 | AI-008           | مدیریت      |
| OPCAP-010 | AI-011           | مدیریت      |
| OPCAP-011 | AI-009, AI-010   | مدیریت      |
| OPCAP-012 | AI-011, AI-014   | حسابرسی     |
| OPCAP-013 | AI-004, AI-008   | اعتبارسنجی  |
| OPCAP-014 | AI-012, AI-014   | مدیریت      |

---

## ۱۲. Operational Functions

### کارکردهای عملیاتی

| شناسه  | کارکرد               | قابلیت مرتبط | توضیح                                 |
| ------ | -------------------- | ------------ | ------------------------------------- |
| OPF-01 | Content Publishing   | OPCAP-001    | انتشار محتوای کانونیکال در پلتفرم هدف |
| OPF-02 | Content Scheduling   | OPCAP-002    | برنامه‌ریزی و زمان‌بندی انتشار محتوا  |
| OPF-03 | Platform Monitoring  | OPCAP-003    | نظارت بر وضعیت و عملکرد پلتفرم        |
| OPF-04 | Incident Detection   | OPCAP-004    | تشخیص خودکار حادثه عملیاتی            |
| OPF-05 | Incident Resolution  | OPCAP-004    | تحلیل و رفع حادثه عملیاتی             |
| OPF-06 | Performance Analysis | OPCAP-005    | تحلیل داده عملکرد و شناسایی روندها    |
| OPF-07 | Quality Assurance    | OPCAP-006    | تضمین کیفیت خروجی عملیات              |
| OPF-08 | Report Generation    | OPCAP-007    | تولید گزارش‌های دوره‌ای عملیاتی       |
| OPF-09 | Resource Allocation  | OPCAP-008    | تخصیص بهینه منابع به عملیات           |
| OPF-10 | Queue Processing     | OPCAP-009    | پردازش ترتیبی صف عملیات               |
| OPF-11 | Log Archiving        | OPCAP-010    | بایگانی و نگهداری وقایع عملیاتی       |
| OPF-12 | Alert Triage         | OPCAP-011    | اولویت‌بندی و دسته‌بندی هشدارها       |
| OPF-13 | Compliance Check     | OPCAP-013    | بررسی انطباق عملیات با قواعد          |
| OPF-14 | Recovery Execution   | OPCAP-014    | اجرای برنامه بازیابی عملیات           |

---

## ۱۳. Operational Domains

### دامنه‌های عملیاتی

| شناسه  | دامنه                 | توضیح                           | کارکردهای کلیدی        |
| ------ | --------------------- | ------------------------------- | ---------------------- |
| OPD-01 | Publishing Operations | عملیات انتشار و توزیع محتوا     | OPF-01, OPF-02, OPF-10 |
| OPD-02 | Monitoring Operations | نظارت و پایش مستمر عملیات       | OPF-03, OPF-05, OPF-06 |
| OPD-03 | Incident Operations   | مدیریت رویدادها و حوادث عملیاتی | OPF-04, OPF-05, OPF-12 |
| OPD-04 | Quality Operations    | تضمین و کنترل کیفیت عملیات      | OPF-07                 |
| OPD-05 | Reporting Operations  | تولید و توزیع گزارش‌های عملیاتی | OPF-08                 |
| OPD-06 | Resource Operations   | مدیریت و تخصیص منابع عملیاتی    | OPF-09                 |
| OPD-07 | Compliance Operations | انطباق و حسابرسی عملیات         | OPF-13                 |
| OPD-08 | Continuity Operations | تداوم و بازیابی عملیات          | OPF-14                 |

---

## ۱۴. Operational States

### وضعیت‌های عملیاتی

| شناسه  | وضعیت      | توضیح                                | وضعیت پایانی |
| ------ | ---------- | ------------------------------------ | ------------ |
| OPS-01 | Planned    | عملیات برنامه‌ریزی‌شده اما شروع‌نشده | خیر          |
| OPS-02 | Scheduled  | عملیات زمان‌بندی‌شده برای اجرا       | خیر          |
| OPS-03 | InProgress | عملیات در حال اجرا                   | خیر          |
| OPS-04 | Completed  | عملیات با موفقیت به پایان رسیده      | بله          |
| OPS-05 | Failed     | عملیات با خطا مواجه شده              | بله          |
| OPS-06 | Retrying   | عملیات در حال تلاش مجدد              | خیر          |
| OPS-07 | Cancelled  | عملیات لغو شده                       | بله          |
| OPS-08 | Archived   | عملیات بایگانی شده                   | بله          |

### انتقال‌های مجاز

| از     | به     | شرط                     |
| ------ | ------ | ----------------------- |
| OPS-01 | OPS-02 | تأیید زمان‌بندی         |
| OPS-01 | OPS-07 | لغو قبل از اجرا         |
| OPS-02 | OPS-03 | آغاز اجرا               |
| OPS-02 | OPS-07 | لغو قبل از شروع         |
| OPS-03 | OPS-04 | تکمیل موفق              |
| OPS-03 | OPS-05 | خطا در اجرا             |
| OPS-05 | OPS-06 | تصمیم به تلاش مجدد      |
| OPS-05 | OPS-07 | لغو پس از خطا           |
| OPS-06 | OPS-03 | آغاز تلاش مجدد          |
| OPS-06 | OPS-05 | خطای مجدد               |
| OPS-06 | OPS-07 | لغو پس از خطاهای متوالی |
| OPS-04 | OPS-08 | بایگانی پس از تأیید     |
| OPS-07 | OPS-08 | بایگانی پس از تأیید     |

---

## ۱۵. Operational Relationships

### انواع روابط عملیاتی

| شناسه    | نوع رابطه    | جهت     | توضیح                                        |
| -------- | ------------ | ------- | -------------------------------------------- |
| OPREL-01 | triggers     | یک‌طرفه | یک موجودیت عملیات دیگری را راه‌اندازی می‌کند |
| OPREL-02 | monitors     | یک‌طرفه | یک موجودیت بر دیگری نظارت می‌کند             |
| OPREL-03 | reports-to   | یک‌طرفه | یک موجودیت به دیگری گزارش می‌دهد             |
| OPREL-04 | escalates-to | یک‌طرفه | یک موجودیت به سطح بالاتر ارجاع می‌دهد        |
| OPREL-05 | resolves     | یک‌طرفه | یک موجودیت حادثه را رفع می‌کند               |
| OPREL-06 | logs-to      | یک‌طرفه | یک موجودیت رویداد را در دیگری ثبت می‌کند     |
| OPREL-07 | alerts       | یک‌طرفه | یک موجودیت به دیگری هشدار می‌دهد             |
| OPREL-08 | validates    | یک‌طرفه | یک موجودیت خروجی دیگری را اعتبارسنجی می‌کند  |
| OPREL-09 | schedules    | یک‌طرفه | یک موجودیت اجرای دیگری را زمان‌بندی می‌کند   |
| OPREL-10 | audits       | یک‌طرفه | یک موجودیت عملکرد دیگری را حسابرسی می‌کند    |

---

## ۱۶. Operational Constraints

### محدودیت‌های عملیاتی

| شناسه     | محدودیت   | دامنه  | توضیح                                            |
| --------- | --------- | ------ | ------------------------------------------------ |
| CST-OP-01 | زمان اجرا | همه    | هر عملیات دارای حداکثر زمان مجاز اجرا است        |
| CST-OP-02 | توالی     | OPD-01 | برخی عملیات‌ها باید به ترتیب مشخص اجرا شوند      |
| CST-OP-03 | وابستگی   | همه    | عملیات ممکن است به تکمیل عملیات دیگر وابسته باشد |
| CST-OP-04 | فرکانس    | OPD-01 | عملیات تکراری دارای محدودیت فرکانس اجرا هستند    |
| CST-OP-05 | منابع     | همه    | هر عملیات دارای سقف مصرف منابع است               |
| CST-OP-06 | همزمانی   | همه    | تعداد عملیات همزمان محدود است                    |
| CST-OP-07 | اختیار    | همه    | هر عملیات نیازمند سطح اختیار مشخصی است           |
| CST-OP-08 | انطباق    | OPD-07 | عملیات باید با قواعد کسب‌وکار مطابق باشد         |

---

## ۱۷. Operational Governance

### حکمرانی KNW-401

| ID        | اصل              | توضیح                                           |
| --------- | ---------------- | ----------------------------------------------- |
| GOV-OP-01 | KNW-401 SSOT است | هیچ مفهوم عملیاتی خارج از این سند تعریف نمی‌شود |
| GOV-OP-02 | بازبینی دوره‌ای  | سند با اضافه شدن هر عملیات جدید بازبینی می‌شود  |
| GOV-OP-03 | نسخه‌بندی دقیق   | همه تغییرات دارای نسخه SemVer هستند             |
| GOV-OP-04 | عدم تکرار        | مفاهیم عملیاتی در AI-_ و AUT-_ تکرار نمی‌شوند   |
| GOV-OP-05 | انطباق با معماری | KNW-401 تابع KNW-000, KNW-101 و CON-000 است     |
| GOV-OP-06 | تأیید تغییر      | تغییر در مفاهیم پایه عملیات نیازمند ADR است     |
| GOV-OP-07 | قابلیت حسابرسی   | همه تغییرات در Change Log ثبت می‌شوند           |

---

## ۱۸. Operational Ownership

### مالکیت KNW-401

| نقش                   | موجودیت                      | مسئولیت                          |
| --------------------- | ---------------------------- | -------------------------------- |
| مالک (Owner)          | معمار عملیات                 | معماری، یکپارچگی، تغییرات        |
| متولی (Steward)       | متولی دانش                   | به‌روزرسانی، Registry، نسخه‌بندی |
| تولیدکننده (Producer) | مدیر عملیات                  | پیشنهاد عملیات جدید، بازبینی     |
| مصرف‌کننده (Consumer) | همه Agentهای عملیاتی + انسان | استفاده از مفاهیم                |

### قواعد مالکیت

| ID        | قاعده                                                      |
| --------- | ---------------------------------------------------------- |
| OWN-OP-01 | تغییر در مفاهیم پایه عملیات نیازمند تأیید معمار عملیات است |
| OWN-OP-02 | تغییر MAJOR نیازمند ADR است                                |
| OWN-OP-03 | همه تغییرات در Change Log ثبت می‌شوند                      |
| OWN-OP-04 | اضافه کردن عملیات جدید نیازمند ثبت در KNW-401 است          |

---

## ۱۹. Operational Authority Levels

### سطوح اختیار عملیاتی

| سطح | عنوان                | ایجاد | ویرایش | حذف | مصرف       |
| --- | -------------------- | ----- | ------ | --- | ---------- |
| A-4 | Operations Architect | ✓     | ✓      | ✓   | ✓          |
| A-3 | Operations Manager   | ✓     | ✓      | —   | ✓          |
| A-2 | Operations Engineer  | ✓     | ✓      | —   | ✓          |
| A-1 | Operator             | —     | —      | —   | ✓          |
| A-0 | Viewer               | —     | —      | —   | فقط خواندن |

### ماتریس اختیار به تفکیک کارکرد

| کارکرد              | A-4   | A-3      | A-2   | A-1    | A-0    |
| ------------------- | ----- | -------- | ----- | ------ | ------ |
| OPF-01 (Publishing) | تعریف | تأیید    | اجرا  | —      | مشاهده |
| OPF-03 (Monitoring) | تعریف | پیکربندی | اجرا  | مشاهده | —      |
| OPF-04 (Incident)   | تعریف | مدیریت   | تحلیل | اطلاع  | مشاهده |
| OPF-08 (Report)     | تعریف | تأیید    | تولید | مصرف   | مصرف   |
| OPF-13 (Compliance) | تعریف | اجرا     | بررسی | —      | مشاهده |

---

## ۲۰. Operational Registry

### ثبت عملیات مرجع

| شناسه      | عملیات                   | دامنه  | نوع        | تکرارپذیری | خودکارسازی | اولویت |
| ---------- | ------------------------ | ------ | ---------- | ---------- | ---------- | ------ |
| OP-REG-001 | Content Publication      | OPD-01 | OP-TYPE-01 | OP-REP-01  | OP-AUT-03  | P0     |
| OP-REG-002 | Content Scheduling       | OPD-01 | OP-TYPE-01 | OP-REP-01  | OP-AUT-03  | P0     |
| OP-REG-003 | Platform Health Check    | OPD-02 | OP-TYPE-02 | OP-REP-01  | OP-AUT-03  | P1     |
| OP-REG-004 | Comment Response         | OPD-02 | OP-TYPE-03 | OP-REP-01  | OP-AUT-02  | P2     |
| OP-REG-005 | Incident Triage          | OPD-03 | OP-TYPE-08 | OP-REP-03  | OP-AUT-02  | P0     |
| OP-REG-006 | Performance Analysis     | OPD-02 | OP-TYPE-05 | OP-REP-02  | OP-AUT-03  | P1     |
| OP-REG-007 | Weekly Report Generation | OPD-05 | OP-TYPE-04 | OP-REP-02  | OP-AUT-03  | P1     |
| OP-REG-008 | Monthly Audit            | OPD-07 | OP-TYPE-06 | OP-REP-02  | OP-AUT-02  | P1     |
| OP-REG-009 | Resource Reallocation    | OPD-06 | OP-TYPE-06 | OP-REP-03  | OP-AUT-01  | P2     |
| OP-REG-010 | Recovery Execution       | OPD-08 | OP-TYPE-08 | OP-REP-03  | OP-AUT-02  | P0     |
| OP-REG-011 | Quality Check            | OPD-04 | OP-TYPE-06 | OP-REP-01  | OP-AUT-02  | P1     |
| OP-REG-012 | Queue Processing         | OPD-01 | OP-TYPE-07 | OP-REP-01  | OP-AUT-03  | P1     |

---

## ۲۱. Operational Quality Principles

### اصول کیفیت عملیاتی

| ID        | اصل               | توضیح                                   |
| --------- | ----------------- | --------------------------------------- |
| QLT-OP-01 | **دقت**           | عملیات باید با حداکثر دقت اجرا شود      |
| QLT-OP-02 | **به‌موقع بودن**  | عملیات در زمان مقرر اجرا شود            |
| QLT-OP-03 | **کامل بودن**     | همه مراحل عملیات به طور کامل اجرا شوند  |
| QLT-OP-04 | **سازگاری**       | خروجی عملیات با استانداردها سازگار باشد |
| QLT-OP-05 | **قابلیت تکرار**  | نتیجه عملیات در اجراهای مکرر یکسان باشد |
| QLT-OP-06 | **قابلیت ردیابی** | همه مراحل عملیات قابل ردیابی باشد       |
| QLT-OP-07 | **امنیت**         | عملیات الزامات امنیتی را رعایت کند      |

---

## ۲۲. Operational Metrics

### معیارهای کلیدی عملیات

| شناسه  | معیار             | دامنه  | هدف              | بازه اندازه‌گیری |
| ------ | ----------------- | ------ | ---------------- | ---------------- |
| OPM-01 | نرخ موفقیت عملیات | همه    | ≥ ۹۹٪            | روزانه           |
| OPM-02 | میانگین زمان اجرا | همه    | ≤ زمان تعیین‌شده | روزانه           |
| OPM-03 | نرخ خطا           | همه    | ≤ ۱٪             | روزانه           |
| OPM-04 | نرخ خودکارسازی    | همه    | ≥ ۸۰٪            | ماهانه           |
| OPM-05 | زمان تشخیص حادثه  | OPD-03 | ≤ ۵ دقیقه        | هفتگی            |
| OPM-06 | زمان رفع حادثه    | OPD-03 | ≤ ۳۰ دقیقه       | هفتگی            |
| OPM-07 | نرخ انطباق        | OPD-07 | ۱۰۰٪             | ماهانه           |
| OPM-08 | نرخ به‌موقع بودن  | OPD-01 | ≥ ۹۵٪            | روزانه           |
| OPM-09 | پوشش نظارت        | OPD-02 | ۱۰۰٪             | هفتگی            |
| OPM-10 | کیفیت گزارش       | OPD-05 | ≥ ۹۰٪            | ماهانه           |

---

## ۲۳. Operational Dependencies

### وابستگی KNW-401 به سایر دانش‌ها

| شناسه     | سند وابسته | نوع وابستگی | توضیح                      |
| --------- | ---------- | ----------- | -------------------------- |
| DEP-OP-01 | KNW-000    | معماری      | معماری دانش سازمانی        |
| DEP-OP-02 | KNW-001    | نمایه       | نمایه و ثبت دانش           |
| DEP-OP-03 | KNW-101    | مفاهیم      | مفاهیم کسب‌وکار سازمانی    |
| DEP-OP-04 | KNW-102    | قواعد       | قواعد و سیاست‌های کسب‌وکار |
| DEP-OP-05 | KNW-103    | فرآیند      | فرآیندهای مرجع کسب‌وکار    |
| DEP-OP-06 | KNW-301    | پلتفرم      | مفاهیم و دامنه‌های پلتفرم  |
| DEP-OP-07 | KNW-302    | قابلیت      | قابلیت‌های پلتفرمی         |
| DEP-OP-08 | KNW-304    | حکمرانی     | حکمرانی پلتفرم             |
| DEP-OP-09 | KNW-305    | چرخه حیات   | چرخه حیات پلتفرم           |
| DEP-OP-10 | KNW-306    | کیفیت       | کیفیت پلتفرم               |

---

## ۲۴. Operational Evolution

### مراحل بلوغ عملیاتی

| مرحله     | شناسه   | توضیح                          | معیار خروج           |
| --------- | ------- | ------------------------------ | -------------------- |
| Initial   | OPEV-01 | عملیات دستی و ناپایدار         | مستندسازی عملیات     |
| Defined   | OPEV-02 | عملیات تعریف‌شده و مستند       | ثبت در KNW-401       |
| Managed   | OPEV-03 | عملیات با معیارهای اندازه‌گیری | داشبورد عملیاتی      |
| Automated | OPEV-04 | عملیات خودکار با نظارت         | نرخ خودکارسازی ≥ ۸۰٪ |
| Optimized | OPEV-05 | عملیات بهینه و هوشمند          | بهبود مستمر فعال     |

### مسیر تکامل

| مرحله فعلی | مرحله بعدی | محرک                     | گیت کیفیت |
| ---------- | ---------- | ------------------------ | --------- |
| OPEV-01    | OPEV-02    | مستندسازی همه عملیات     | QG-EVO-01 |
| OPEV-02    | OPEV-03    | نصب معیارها و داشبورد    | QG-EVO-02 |
| OPEV-03    | OPEV-04    | خودکارسازی عملیات تکراری | QG-EVO-03 |
| OPEV-04    | OPEV-05    | بهینه‌سازی هوشمند        | QG-EVO-04 |

---

## ۲۵. Naming Rules

### قواعد نام‌گذاری در KNW-401

| الگو                      | شناسه       | مثال        |
| ------------------------- | ----------- | ----------- |
| Operational Concept       | OPC-NN      | OPC-01      |
| Operational Entity        | OPE-NN      | OPE-01      |
| Operational Capability    | OPCAP-NNN   | OPCAP-001   |
| Operational Function      | OPF-NN      | OPF-01      |
| Operational Domain        | OPD-NN      | OPD-01      |
| Operational State         | OPS-NN      | OPS-01      |
| Operational Relationship  | OPREL-NN    | OPREL-01    |
| Operational Constraint    | CST-OP-NN   | CST-OP-01   |
| Operational Metric        | OPM-NN      | OPM-01      |
| Operational Principle     | OPP-NN      | OPP-01      |
| Operational Objective     | OBO-NN      | OBO-01      |
| Operational Registry      | OP-REG-NNN  | OP-REG-001  |
| Operational Evolution     | OPEV-NN     | OPEV-01     |
| Operational Type          | OP-TYPE-NN  | OP-TYPE-01  |
| Operational Level         | OP-LEVEL-NN | OP-LEVEL-01 |
| Operational Repeatability | OP-REP-NN   | OP-REP-01   |
| Operational Automation    | OP-AUT-NN   | OP-AUT-01   |

---

## ۲۶. Cross References

### ارجاعات متقابل

| سند KNW | ارجاع به                                    | نوع ارجاع        |
| ------- | ------------------------------------------- | ---------------- |
| KNW-401 | KNW-000, KNW-001                            | معماری + نمایه   |
| KNW-401 | KNW-101, KNW-102, KNW-103                   | کسب‌وکار         |
| KNW-401 | KNW-301, KNW-302, KNW-304, KNW-305, KNW-306 | پلتفرم           |
| KNW-401 | CON-000                                     | قانون اساسی SMOS |
| KNW-401 | AI-_, AUT-_, PRM-\*                         | مصرف‌کنندگان     |

### نگاشت به AI-\*

| Agent                     | شناسه  | مفاهیم مصرفی از KNW-401                    |
| ------------------------- | ------ | ------------------------------------------ |
| Content Review            | AI-004 | OPCAP-006, OPCAP-013                       |
| Publishing & Distribution | AI-008 | OPCAP-001, OPCAP-002, OPCAP-009            |
| Community Engagement      | AI-009 | OPCAP-003, OPCAP-004, OPCAP-011            |
| Analytics & Intelligence  | AI-010 | OPCAP-003, OPCAP-005, OPCAP-007, OPCAP-011 |
| Knowledge Management      | AI-011 | همه                                        |
| Continuous Improvement    | AI-012 | OPCAP-004, OPCAP-014                       |
| Enterprise Orchestrator   | AI-014 | OPCAP-008, OPCAP-012, OPCAP-014            |

### نگاشت به AUT-\*

| Workflow          | شناسه            | مفاهیم مصرفی از KNW-401 |
| ----------------- | ---------------- | ----------------------- |
| Publishing Chain  | AUT-001-001..010 | OPCAP-001, OPCAP-002    |
| Monitoring        | AUT-001-011..020 | OPCAP-003, OPCAP-005    |
| Incident Response | AUT-001-021..030 | OPCAP-004, OPCAP-011    |
| Reporting         | AUT-001-031..040 | OPCAP-007               |

---

## ۲۷. Machine Readable Blocks

### Block 1 — Operations Identity

```json
{
  "id": "KNW-401",
  "name_fa": "پایه دانش عملیات سازمانی",
  "name_en": "Enterprise Operations Knowledge Foundation",
  "version": "1.0.0-draft",
  "family": "KNW-OPS",
  "domain": "OPD-01",
  "type": "Operations Foundation",
  "status": "draft",
  "ssot": true,
  "total_concepts": 20,
  "total_entities": 12,
  "total_capabilities": 14,
  "total_functions": 14,
  "total_domains": 8,
  "total_states": 8,
  "total_relationships": 10,
  "total_metrics": 10,
  "dependencies": [
    "KNW-000",
    "KNW-001",
    "KNW-101",
    "KNW-102",
    "KNW-103",
    "KNW-301",
    "KNW-302",
    "KNW-304"
  ]
}
```

### Block 2 — Operations Object Model

```json
{
  "object_model": {
    "entities": [
      { "id": "OPE-01", "name": "Operations Schedule", "stateful": true, "domain": "OPD-01" },
      { "id": "OPE-02", "name": "Operations Queue", "stateful": true, "domain": "OPD-01" },
      { "id": "OPE-03", "name": "Operations Log", "stateful": true, "domain": "OPD-02" },
      { "id": "OPE-04", "name": "Operations Report", "stateful": false, "domain": "OPD-05" },
      { "id": "OPE-05", "name": "Operations Alert", "stateful": false, "domain": "OPD-03" },
      { "id": "OPE-06", "name": "Operations Incident", "stateful": true, "domain": "OPD-03" },
      { "id": "OPE-07", "name": "Operations Runbook", "stateful": false, "domain": "OPD-08" },
      { "id": "OPE-08", "name": "Operations Metric", "stateful": false, "domain": "OPD-02" },
      { "id": "OPE-09", "name": "Operations Dashboard", "stateful": true, "domain": "OPD-02" },
      { "id": "OPE-10", "name": "Operations Policy", "stateful": false, "domain": "OPD-07" },
      { "id": "OPE-11", "name": "Operations Role", "stateful": false, "domain": "OPD-06" },
      { "id": "OPE-12", "name": "Operations Resource", "stateful": true, "domain": "OPD-06" }
    ],
    "state_machine": {
      "states": ["OPS-01", "OPS-02", "OPS-03", "OPS-04", "OPS-05", "OPS-06", "OPS-07", "OPS-08"],
      "transitions": [
        { "from": "OPS-01", "to": "OPS-02" },
        { "from": "OPS-01", "to": "OPS-07" },
        { "from": "OPS-02", "to": "OPS-03" },
        { "from": "OPS-02", "to": "OPS-07" },
        { "from": "OPS-03", "to": "OPS-04" },
        { "from": "OPS-03", "to": "OPS-05" },
        { "from": "OPS-05", "to": "OPS-06" },
        { "from": "OPS-05", "to": "OPS-07" },
        { "from": "OPS-06", "to": "OPS-03" },
        { "from": "OPS-06", "to": "OPS-05" },
        { "from": "OPS-06", "to": "OPS-07" },
        { "from": "OPS-04", "to": "OPS-08" },
        { "from": "OPS-07", "to": "OPS-08" }
      ]
    }
  }
}
```

### Block 3 — Operations Taxonomy

```json
{
  "taxonomy": {
    "types": [
      { "id": "OP-TYPE-01", "name": "Publishing", "description": "عملیات انتشار محتوا" },
      { "id": "OP-TYPE-02", "name": "Monitoring", "description": "عملیات نظارت" },
      { "id": "OP-TYPE-03", "name": "Engagement", "description": "عملیات تعامل" },
      { "id": "OP-TYPE-04", "name": "Reporting", "description": "عملیات گزارش‌دهی" },
      { "id": "OP-TYPE-05", "name": "Analysis", "description": "عملیات تحلیل" },
      { "id": "OP-TYPE-06", "name": "Support", "description": "عملیات پشتیبانی" },
      { "id": "OP-TYPE-07", "name": "Coordination", "description": "عملیات هماهنگی" },
      { "id": "OP-TYPE-08", "name": "Recovery", "description": "عملیات بازیابی" }
    ],
    "levels": [
      { "id": "OP-LEVEL-01", "name": "Strategic", "description": "سطح استراتژیک" },
      { "id": "OP-LEVEL-02", "name": "Tactical", "description": "سطح تاکتیکی" },
      { "id": "OP-LEVEL-03", "name": "Execution", "description": "سطح اجرایی" },
      { "id": "OP-LEVEL-04", "name": "Automated", "description": "سطح خودکار" }
    ],
    "repeatability": [
      { "id": "OP-REP-01", "name": "Daily", "description": "تکراری روزانه" },
      { "id": "OP-REP-02", "name": "Periodic", "description": "دوره‌ای" },
      { "id": "OP-REP-03", "name": "Event", "description": "مبتنی بر رویداد" },
      { "id": "OP-REP-04", "name": "One-time", "description": "یک‌باره" }
    ],
    "automation": [
      { "id": "OP-AUT-01", "name": "Manual", "description": "کاملاً دستی" },
      { "id": "OP-AUT-02", "name": "Semi-automated", "description": "نیمه‌خودکار" },
      { "id": "OP-AUT-03", "name": "Automated", "description": "کاملاً خودکار" },
      { "id": "OP-AUT-04", "name": "Intelligent", "description": "هوشمند" }
    ]
  }
}
```

### Block 4 — Operations Registry

```json
{
  "registry": {
    "domains": [
      { "id": "OPD-01", "name": "Publishing Operations", "type": "core", "priority": "P0" },
      { "id": "OPD-02", "name": "Monitoring Operations", "type": "core", "priority": "P1" },
      { "id": "OPD-03", "name": "Incident Operations", "type": "core", "priority": "P0" },
      { "id": "OPD-04", "name": "Quality Operations", "type": "support", "priority": "P1" },
      { "id": "OPD-05", "name": "Reporting Operations", "type": "support", "priority": "P1" },
      { "id": "OPD-06", "name": "Resource Operations", "type": "support", "priority": "P2" },
      { "id": "OPD-07", "name": "Compliance Operations", "type": "governance", "priority": "P1" },
      { "id": "OPD-08", "name": "Continuity Operations", "type": "governance", "priority": "P0" }
    ],
    "capabilities": [
      {
        "id": "OPCAP-001",
        "name": "Publishing Operations",
        "domain": "OPD-01",
        "primary_agent": "AI-008"
      },
      {
        "id": "OPCAP-002",
        "name": "Scheduling Operations",
        "domain": "OPD-01",
        "primary_agent": "AI-008"
      },
      {
        "id": "OPCAP-003",
        "name": "Monitoring Operations",
        "domain": "OPD-02",
        "primary_agent": "AI-010"
      },
      {
        "id": "OPCAP-004",
        "name": "Incident Response",
        "domain": "OPD-03",
        "primary_agent": "AI-009"
      },
      {
        "id": "OPCAP-005",
        "name": "Performance Tracking",
        "domain": "OPD-02",
        "primary_agent": "AI-010"
      },
      {
        "id": "OPCAP-006",
        "name": "Quality Control",
        "domain": "OPD-04",
        "primary_agent": "AI-004"
      },
      {
        "id": "OPCAP-007",
        "name": "Reporting Operations",
        "domain": "OPD-05",
        "primary_agent": "AI-010"
      },
      {
        "id": "OPCAP-008",
        "name": "Resource Management",
        "domain": "OPD-06",
        "primary_agent": "AI-014"
      },
      {
        "id": "OPCAP-009",
        "name": "Queue Management",
        "domain": "OPD-01",
        "primary_agent": "AI-008"
      },
      {
        "id": "OPCAP-010",
        "name": "Log Management",
        "domain": "OPD-02",
        "primary_agent": "AI-011"
      },
      {
        "id": "OPCAP-011",
        "name": "Alert Management",
        "domain": "OPD-03",
        "primary_agent": "AI-009"
      },
      {
        "id": "OPCAP-012",
        "name": "Audit Operations",
        "domain": "OPD-07",
        "primary_agent": "AI-014"
      },
      {
        "id": "OPCAP-013",
        "name": "Compliance Operations",
        "domain": "OPD-07",
        "primary_agent": "AI-004"
      },
      {
        "id": "OPCAP-014",
        "name": "Continuity Management",
        "domain": "OPD-08",
        "primary_agent": "AI-012"
      }
    ],
    "registered_operations": [
      {
        "id": "OP-REG-001",
        "name": "Content Publication",
        "domain": "OPD-01",
        "capability": "OPCAP-001",
        "type": "OP-TYPE-01",
        "priority": "P0"
      },
      {
        "id": "OP-REG-002",
        "name": "Content Scheduling",
        "domain": "OPD-01",
        "capability": "OPCAP-002",
        "type": "OP-TYPE-01",
        "priority": "P0"
      },
      {
        "id": "OP-REG-003",
        "name": "Platform Health Check",
        "domain": "OPD-02",
        "capability": "OPCAP-003",
        "type": "OP-TYPE-02",
        "priority": "P1"
      },
      {
        "id": "OP-REG-004",
        "name": "Comment Response",
        "domain": "OPD-02",
        "capability": "OPCAP-003",
        "type": "OP-TYPE-03",
        "priority": "P2"
      },
      {
        "id": "OP-REG-005",
        "name": "Incident Triage",
        "domain": "OPD-03",
        "capability": "OPCAP-004",
        "type": "OP-TYPE-08",
        "priority": "P0"
      },
      {
        "id": "OP-REG-006",
        "name": "Performance Analysis",
        "domain": "OPD-02",
        "capability": "OPCAP-005",
        "type": "OP-TYPE-05",
        "priority": "P1"
      },
      {
        "id": "OP-REG-007",
        "name": "Weekly Report Generation",
        "domain": "OPD-05",
        "capability": "OPCAP-007",
        "type": "OP-TYPE-04",
        "priority": "P1"
      },
      {
        "id": "OP-REG-008",
        "name": "Monthly Audit",
        "domain": "OPD-07",
        "capability": "OPCAP-012",
        "type": "OP-TYPE-06",
        "priority": "P1"
      },
      {
        "id": "OP-REG-009",
        "name": "Resource Reallocation",
        "domain": "OPD-06",
        "capability": "OPCAP-008",
        "type": "OP-TYPE-06",
        "priority": "P2"
      },
      {
        "id": "OP-REG-010",
        "name": "Recovery Execution",
        "domain": "OPD-08",
        "capability": "OPCAP-014",
        "type": "OP-TYPE-08",
        "priority": "P0"
      },
      {
        "id": "OP-REG-011",
        "name": "Quality Check",
        "domain": "OPD-04",
        "capability": "OPCAP-006",
        "type": "OP-TYPE-06",
        "priority": "P1"
      },
      {
        "id": "OP-REG-012",
        "name": "Queue Processing",
        "domain": "OPD-01",
        "capability": "OPCAP-009",
        "type": "OP-TYPE-07",
        "priority": "P1"
      }
    ]
  }
}
```

### Block 5 — Operations KPIs

```json
{
  "kpis": [
    {
      "id": "KPI-401-01",
      "name": "operation_success_rate",
      "description": "نرخ موفقیت عملیات",
      "target": "≥ 99%",
      "measurement": "daily"
    },
    {
      "id": "KPI-401-02",
      "name": "avg_execution_time",
      "description": "میانگین زمان اجرا",
      "target": "≤ threshold",
      "measurement": "daily"
    },
    {
      "id": "KPI-401-03",
      "name": "error_rate",
      "description": "نرخ خطای عملیات",
      "target": "≤ 1%",
      "measurement": "daily"
    },
    {
      "id": "KPI-401-04",
      "name": "automation_rate",
      "description": "نرخ خودکارسازی عملیات",
      "target": "≥ 80%",
      "measurement": "monthly"
    },
    {
      "id": "KPI-401-05",
      "name": "incident_detection_time",
      "description": "زمان تشخیص حادثه",
      "target": "≤ 5 min",
      "measurement": "weekly"
    },
    {
      "id": "KPI-401-06",
      "name": "incident_resolution_time",
      "description": "زمان رفع حادثه",
      "target": "≤ 30 min",
      "measurement": "weekly"
    },
    {
      "id": "KPI-401-07",
      "name": "compliance_rate",
      "description": "نرخ انطباق عملیات",
      "target": "100%",
      "measurement": "monthly"
    },
    {
      "id": "KPI-401-08",
      "name": "on_time_rate",
      "description": "نرخ به‌موقع بودن",
      "target": "≥ 95%",
      "measurement": "daily"
    },
    {
      "id": "KPI-401-09",
      "name": "monitoring_coverage",
      "description": "پوشش نظارت",
      "target": "100%",
      "measurement": "weekly"
    },
    {
      "id": "KPI-401-10",
      "name": "report_quality",
      "description": "کیفیت گزارش‌های عملیاتی",
      "target": "≥ 90%",
      "measurement": "monthly"
    }
  ]
}
```

### Block 6 — Operations Roadmap

```json
{
  "roadmap": [
    {
      "id": "P6.S15",
      "phase": "Operations Knowledge Foundation",
      "description": "پایه دانش عملیات سازمانی",
      "status": "current"
    },
    {
      "id": "P6.S16",
      "phase": "Operations Governance Architecture",
      "description": "معماری حکمرانی عملیات",
      "status": "planned",
      "documents": ["KNW-402"]
    },
    {
      "id": "P6.S17",
      "phase": "Operations Monitoring Knowledge",
      "description": "دانش نظارت عملیاتی",
      "status": "planned",
      "documents": ["KNW-403"]
    },
    {
      "id": "P6.S18",
      "phase": "Operations Reporting Knowledge",
      "description": "دانش گزارش‌دهی عملیاتی",
      "status": "planned",
      "documents": ["KNW-404"]
    },
    {
      "id": "P6.S19",
      "phase": "Operations Continuity Knowledge",
      "description": "دانش تداوم عملیات",
      "status": "planned",
      "documents": ["KNW-405"]
    }
  ]
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Operational Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:operations:entity:v1",
  "title": "Operational Entity",
  "description": "Schema for SMOS Operational Entity definitions",
  "type": "object",
  "required": ["id", "name", "domain"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^OPE-[0-9]{2}$"
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
      "pattern": "^OPD-[0-9]{2}$"
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

### Schema 2 — Operational Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:operations:capability:v1",
  "title": "Operational Capability",
  "description": "Schema for SMOS Operational Capability definitions",
  "type": "object",
  "required": ["id", "name", "domain", "primary_agent"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^OPCAP-[0-9]{3}$"
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
      "pattern": "^OPD-[0-9]{2}$"
    },
    "primary_agent": {
      "type": "string",
      "pattern": "^AI-[0-9]{3}$"
    },
    "consumption_type": {
      "type": "string",
      "enum": [
        "execution",
        "planning",
        "monitoring",
        "analysis",
        "validation",
        "management",
        "audit"
      ]
    },
    "functions": {
      "type": "array",
      "items": { "type": "string", "pattern": "^OPF-[0-9]{2}$" },
      "maxItems": 10
    }
  },
  "additionalProperties": false
}
```

### Schema 3 — Operational Relationship

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:operations:relationship:v1",
  "title": "Operational Relationship",
  "description": "Schema for relationships between SMOS Operational Entities",
  "type": "object",
  "required": ["id", "type", "source", "target"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^OPREL-[0-9]{2}$"
    },
    "type": {
      "type": "string",
      "enum": [
        "triggers",
        "monitors",
        "reports-to",
        "escalates-to",
        "resolves",
        "logs-to",
        "alerts",
        "validates",
        "schedules",
        "audits"
      ]
    },
    "source": {
      "type": "string",
      "pattern": "^OPE-[0-9]{2}$"
    },
    "target": {
      "type": "string",
      "pattern": "^OPE-[0-9]{2}$"
    },
    "description": {
      "type": "string",
      "maxLength": 300
    }
  },
  "additionalProperties": false
}
```

---

## ۲۹. Statistics

### آمار KNW-401

| شاخص                      | مقدار |
| ------------------------- | ----- |
| تعداد مفاهیم عملیاتی      | ۲۰    |
| تعداد موجودیت‌های عملیاتی | ۱۲    |
| تعداد قابلیت‌های عملیاتی  | ۱۴    |
| تعداد کارکردهای عملیاتی   | ۱۴    |
| تعداد دامنه‌های عملیاتی   | ۸     |
| تعداد وضعیت‌های عملیاتی   | ۸     |
| تعداد انتقال‌های مجاز     | ۱۳    |
| تعداد روابط عملیاتی       | ۱۰    |
| تعداد محدودیت‌های عملیاتی | ۸     |
| تعداد معیارهای کلیدی      | ۱۰    |
| تعداد اصول عملیاتی        | ۸     |
| تعداد اهداف عملیاتی       | ۸     |
| تعداد مراحل بلوغ          | ۵     |
| تعداد Stakeholder         | ۶     |
| تعداد سطوح اختیار         | ۵     |

### ذی‌نفعان

| شناسه     | ذی‌نفع              | نقش                             |
| --------- | ------------------- | ------------------------------- |
| STK-OP-01 | Operations Manager  | مدیریت و نظارت بر عملیات روزانه |
| STK-OP-02 | Operations Engineer | اجرا و پیکربندی عملیات          |
| STK-OP-03 | Quality Analyst     | تضمین کیفیت عملیات              |
| STK-OP-04 | Content Publisher   | اجرای عملیات انتشار             |
| STK-OP-05 | Community Manager   | مدیریت تعاملات اجتماعی          |
| STK-OP-06 | Compliance Officer  | انطباق عملیات با قواعد          |

---

## ۳۰. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                | توسط        |
| ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-30 | نگارش اولیه — پایه دانش عملیات سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ Schema. ۲۰ مفهوم, ۱۲ موجودیت, ۱۴ قابلیت, ۱۴ کارکرد, ۸ دامنه, ۸ وضعیت, ۱۰ رابطه. | معمار سیستم |
