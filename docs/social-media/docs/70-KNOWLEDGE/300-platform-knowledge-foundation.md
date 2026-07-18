# Enterprise Platform Knowledge Foundation — پایه دانش پلتفرم سازمانی

> **شناسه:** KNW-301
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-29
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** [KNW-000](./00-enterprise-knowledge-architecture.md), [KNW-001](./10-knowledge-index.md), [KNW-101](./100-business-knowledge-foundation.md), [PLAT-000](../20-PLATFORMS/00-platform-playbook-standard.md), [ARCH-020](../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md)
> **مخاطب:** human, ai-agent, knowledge-engineer, platform-strategist

---

## ۱. Purpose

KNW-301 نخستین سند خانواده Knowledge Platform (KNW-PLT) و SSOT (تک منبع حقیقت) برای تمام مفاهیم، دامنه‌ها، لایه‌ها، قابلیت‌ها و مؤلفه‌های پلتفرم سازمانی SMOS است.

### چرا KNW-301 وجود دارد

بدون یک پایه دانش پلتفرم:

- مفاهیم پلتفرمی در PLAT-\*ها پراکنده می‌شوند
- Agentها نمی‌توانند دانش پلتفرم را به صورت ساختاریافته مصرف کنند
- قابلیت‌های پلتفرم قابل ردیابی و مقایسه نیستند
- اضافه کردن پلتفرم جدید نیازمند بازتعریف مفاهیم است
- هماهنگی بین PLAT-_ و AI-_ و AUT-_ و PRM-_ مختل می‌شود

KNW-301 این مشکلات را با تعریف **چارچوب یکپارچه دانش پلتفرم** حل می‌کند.

### نقش KNW-301 در SMOS

| سند           | نقش                                           |
| ------------- | --------------------------------------------- |
| PLAT-000      | قالب مادر کتابچه‌های پلتفرم                   |
| PLAT-001..007 | کتابچه‌های عملیاتی پلتفرم                     |
| **KNW-301**   | **SSOT مفاهیم، دامنه‌ها و قابلیت‌های پلتفرم** |
| KNW-302+      | سرویس‌ها، مؤلفه‌ها و نگاشت‌های تخصصی پلتفرم   |
| ARCH-020      | استراتژی چندپلتفرمی سازمانی                   |

---

## ۲. Scope

### Inside Scope

| حوزه                     | توضیح                       |
| ------------------------ | --------------------------- |
| فلسفه و اصول دانش پلتفرم | هستی‌شناسی پلتفرم           |
| تعریف دامنه پلتفرم       | مرزهای دانش پلتفرم          |
| مدل طبقه‌بندی پلتفرم     | انواع و دسته‌بندی پلتفرم‌ها |
| مدل لایه پلتفرم          | لایه‌های معماری پلتفرم      |
| مدل قابلیت پلتفرم        | قابلیت‌های پلتفرمی          |
| مدل سرویس پلتفرم         | سرویس‌های پلتفرمی           |
| مدل مؤلفه پلتفرم         | اجزای سازنده پلتفرم         |
| مدل ماژول پلتفرم         | ماژول‌های سازمانی           |
| مفهوم رابط پلتفرم        | ورودی/خروجی پلتفرم          |
| مفهوم یکپارچگی پلتفرم    | نحوه اتصال پلتفرم‌ها        |
| مدل مرز پلتفرم           | محدوده هر پلتفرم            |
| روابط پلتفرمی            | ارتباط با سایر حوزه‌ها      |

### Outside Scope

| حوزه                       | دلیل                   |
| -------------------------- | ---------------------- |
| استراتژی محتوای پلتفرمی    | حوزه PLAT-\*           |
| قواعد انتشار و زمان‌بندی   | حوزه PLAT-\*           |
| مشخصات API و پیاده‌سازی    | حوزه فنی (خارج از KNW) |
| داده‌های واقعی پلتفرم      | حوزه سیستم‌های عملیاتی |
| پیکربندی Agent برای پلتفرم | حوزه AI-\*             |
| Workflowهای پلتفرمی        | حوزه AUT-\*            |
| پرامپت‌های پلتفرمی         | حوزه PRM-\*            |

---

## ۳. Platform Knowledge Philosophy

### فلسفه دانش پلتفرم

SMOS دانش پلتفرم را به عنوان **زبان مشترک پلتفرمی** سازمان می‌بیند که:

1. **انتزاعی است** — مستقل از هر پلتفرم خاصی تعریف می‌شود
2. **ثابت است** — در طول زمان پایدار می‌ماند مگر با ADR تغییر کند
3. **مرجع است** — همه PLAT-*ها و AI-*ها به آن ارجاع می‌دهند
4. **قابل مصرف است** — توسط انسان و Agent قابل درک است
5. **تک منبع است** — هر مفهوم پلتفرمی یک خانه دارد

### اصول هستی‌شناسی پلتفرم

| اصل                                          | توضیح                         |
| -------------------------------------------- | ----------------------------- |
| **پلتفرم یک کانال است**                      | واسط بین محتوا و مخاطب        |
| **هر پلتفرم یک نقش دارد**                    | نقش در معماری سازمانی (P0–P3) |
| **هر قابلیت یک مصرف‌کننده دارد**             | Agent یا Workflow             |
| **مفاهیم پلتفرمی مستقل از پیاده‌سازی هستند** | انتزاع کامل                   |
| **پلتفرم‌ها قابل مقایسه هستند**              | از طریق مدل قابلیت یکسان      |

---

## ۴. Platform Architecture Principles

| ID     | اصل                        | توضیح                                               |
| ------ | -------------------------- | --------------------------------------------------- |
| PKP-01 | **انتزاع پلتفرمی**         | مفاهیم پلتفرم مستقل از هر پلتفرم خاصی تعریف می‌شوند |
| PKP-02 | **SSOT**                   | هر مفهوم پلتفرمی تنها در KNW-301 تعریف می‌شود       |
| PKP-03 | **جداسازی دامنه**          | هر دامنه پلتفرمی مرز مشخص و غیرهمپوشان دارد         |
| PKP-04 | **ساختاریافتگی**           | همه مفاهیم پلتفرمی دارای ساختار مشخص هستند          |
| PKP-05 | **تکامل تدریجی**           | دانش پلتفرم در طول زمان تکامل می‌یابد               |
| PKP-06 | **عدم تکرار**              | هیچ مفهومی در PLAT-\* و KNW-301 تکرار نمی‌شود       |
| PKP-07 | **هم‌راستایی با کسب‌وکار** | مفاهیم پلتفرمی تکمیل‌کننده KNW-101 هستند            |

---

## ۵. Platform Taxonomy

### تاکسونومی پلتفرم

KNW-301 پلتفرم‌ها را بر اساس چهار بعد اصلی طبقه‌بندی می‌کند:

#### بعد اول — نوع پلتفرم

| نوع          | شناسه       | مثال                      |
| ------------ | ----------- | ------------------------- |
| شبکه اجتماعی | PLT-TYPE-01 | اینستاگرام، لینکدین، ایکس |
| پیام‌رسان    | PLT-TYPE-02 | تلگرام، بله               |
| ویدئو        | PLT-TYPE-03 | یوتیوب، آپارات            |
| وب           | PLT-TYPE-04 | وبسایت، وبلاگ             |

#### بعد دوم — نقش پلتفرم

| نقش          | شناسه       | اولویت |
| ------------ | ----------- | ------ |
| Hub          | PLT-ROLE-01 | P0     |
| News         | PLT-ROLE-02 | P2     |
| Video        | PLT-ROLE-03 | P2     |
| Video Backup | PLT-ROLE-04 | P2     |
| Professional | PLT-ROLE-05 | P1     |
| Messaging    | PLT-ROLE-06 | P2     |

#### بعد سوم — سطح تعامل

| سطح        | شناسه        | توضیح             |
| ---------- | ------------ | ----------------- |
| Broadcast  | PLT-LEVEL-01 | انتشار یک‌طرفه    |
| Engagement | PLT-LEVEL-02 | تعامل دوطرفه      |
| Community  | PLT-LEVEL-03 | جامعه کاربری فعال |

#### بعد چهارم — دامنه محتوایی

| دامنه     | شناسه         | توضیح          |
| --------- | ------------- | -------------- |
| B2B       | PLT-DOMAIN-01 | محتوای حرفه‌ای |
| B2C       | PLT-DOMAIN-02 | محتوای عمومی   |
| Technical | PLT-DOMAIN-03 | محتوای فنی     |
| Corporate | PLT-DOMAIN-04 | محتوای سازمانی |

---

## ۶. Platform Classification Model

### مدل طبقه‌بندی پلتفرم

هر پلتفرم SMOS با ترکیب چهار بعد طبقه‌بندی می‌شود:

```
پلتفرم = نوع + نقش + سطح + دامنه
```

### ماتریس طبقه‌بندی پلتفرم‌های فعلی

| پلتفرم         | نوع         | نقش         | سطح          | دامنه         |
| -------------- | ----------- | ----------- | ------------ | ------------- |
| Instagram      | PLT-TYPE-01 | PLT-ROLE-01 | PLT-LEVEL-02 | PLT-DOMAIN-02 |
| LinkedIn       | PLT-TYPE-01 | PLT-ROLE-05 | PLT-LEVEL-02 | PLT-DOMAIN-01 |
| Telegram       | PLT-TYPE-02 | PLT-ROLE-06 | PLT-LEVEL-03 | PLT-DOMAIN-04 |
| Bale           | PLT-TYPE-02 | PLT-ROLE-06 | PLT-LEVEL-03 | PLT-DOMAIN-04 |
| X/Twitter      | PLT-TYPE-01 | PLT-ROLE-02 | PLT-LEVEL-02 | PLT-DOMAIN-02 |
| YouTube        | PLT-TYPE-03 | PLT-ROLE-03 | PLT-LEVEL-02 | PLT-DOMAIN-02 |
| Aparat         | PLT-TYPE-03 | PLT-ROLE-04 | PLT-LEVEL-01 | PLT-DOMAIN-02 |
| Website & Blog | PLT-TYPE-04 | PLT-ROLE-01 | PLT-LEVEL-01 | PLT-DOMAIN-04 |

---

## ۷. Platform Domain Model

### دامنه‌های پلتفرمی

| شناسه    | دامنه                 | توضیح                   | مؤلفه‌های کلیدی            |
| -------- | --------------------- | ----------------------- | -------------------------- |
| PLTD-001 | Social Media Platform | پلتفرم‌های شبکه اجتماعی | نشر، تعامل، نظارت          |
| PLTD-002 | Content Distribution  | توزیع و انتشار محتوا    | زمان‌بندی، تطبیق، توزیع    |
| PLTD-003 | Audience Engagement   | تعامل با مخاطب          | پاسخ، نظارت، تحلیل احساسات |
| PLTD-004 | Brand Presence        | حضور برند در پلتفرم     | هویت بصری، صدا، انطباق     |
| PLTD-005 | Analytics & Insights  | تحلیل و بینش پلتفرمی    | جمع‌آوری، تجمیع، گزارش     |
| PLTD-006 | Platform Automation   | خودکارسازی پلتفرم       | گردش کار، رویداد، وضعیت    |
| PLTD-007 | Platform Governance   | حکمرانی پلتفرم          | انطباق، ریسک، خط‌مشی       |
| PLTD-008 | Platform Operations   | عملیات پلتفرم           | پایش، نگهداری، بازیابی     |

### نگاشت پلتفرم‌ها به دامنه‌ها

| پلتفرم         | دامنه‌های مرتبط                        |
| -------------- | -------------------------------------- |
| Instagram      | PLTD-001, PLTD-002, PLTD-003, PLTD-004 |
| LinkedIn       | PLTD-001, PLTD-002, PLTD-003, PLTD-004 |
| Telegram       | PLTD-001, PLTD-002, PLTD-003           |
| X/Twitter      | PLTD-001, PLTD-002, PLTD-005           |
| YouTube        | PLTD-001, PLTD-002, PLTD-003, PLTD-005 |
| Aparat         | PLTD-001, PLTD-002                     |
| Website & Blog | PLTD-001, PLTD-002, PLTD-004           |

---

## ۸. Platform Layer Model

### لایه‌های معماری پلتفرم

| شناسه      | لایه               | سطح انتزاع | توضیح                           |
| ---------- | ------------------ | ---------- | ------------------------------- |
| LYR-PLT-01 | Strategic Layer    | L1         | استراتژی و نقش پلتفرم در معماری |
| LYR-PLT-02 | Governance Layer   | L1         | قواعد، سیاست‌ها و انطباق پلتفرم |
| LYR-PLT-03 | Content Layer      | L2         | محتوای کانونیکال و تطبیق‌شده    |
| LYR-PLT-04 | Distribution Layer | L3         | زمان‌بندی، توزیع و انتشار       |
| LYR-PLT-05 | Engagement Layer   | L3         | تعامل، پاسخ و نظارت اجتماعی     |
| LYR-PLT-06 | Analytics Layer    | L2         | جمع‌آوری و تحلیل داده پلتفرم    |
| LYR-PLT-07 | Automation Layer   | L3         | خودکارسازی فرآیندهای پلتفرمی    |

### ویژگی‌های هر لایه

| لایه       | ورودی             | خروجی            | مصرف‌کننده     |
| ---------- | ----------------- | ---------------- | -------------- |
| LYR-PLT-01 | استراتژی سازمانی  | نقش پلتفرم       | AI-001, AI-002 |
| LYR-PLT-02 | CON-000, KNW-102  | قواعد انطباق     | AI-004, AI-008 |
| LYR-PLT-03 | محتوای کانونیکال  | محتوای تطبیق‌شده | AI-003, AI-005 |
| LYR-PLT-04 | محتوای آماده      | محتوای منتشرشده  | AI-008         |
| LYR-PLT-05 | تعاملات کاربران   | پاسخ و گزارش     | AI-009         |
| LYR-PLT-06 | داده پلتفرم       | بینش و گزارش     | AI-010         |
| LYR-PLT-07 | رویدادهای پلتفرمی | خودکارسازی       | AI-014, AUT-\* |

---

## ۹. Platform Capability Model

### قابلیت‌های پلتفرمی

| شناسه      | قابلیت                            | لایه       | توضیح                             |
| ---------- | --------------------------------- | ---------- | --------------------------------- |
| PLTCAP-001 | Content Publishing                | LYR-PLT-04 | انتشار محتوا در پلتفرم            |
| PLTCAP-002 | Multi-Platform Distribution       | LYR-PLT-04 | توزیع همزمان در چند پلتفرم        |
| PLTCAP-003 | Cross-Platform Scheduling         | LYR-PLT-04 | زمان‌بندی انتشار در پلتفرم‌ها     |
| PLTCAP-004 | Platform Format Adaptation        | LYR-PLT-03 | تطبیق قالب محتوا با پلتفرم        |
| PLTCAP-005 | Platform Compliance Validation    | LYR-PLT-02 | اعتبارسنجی انطباق با قواعد پلتفرم |
| PLTCAP-006 | Audience Targeting                | LYR-PLT-03 | هدف‌گیری مخاطب در پلتفرم          |
| PLTCAP-007 | Platform Analytics Collection     | LYR-PLT-06 | جمع‌آوری داده عملکرد پلتفرم       |
| PLTCAP-008 | Community Monitoring              | LYR-PLT-05 | نظارت بر تعاملات اجتماعی          |
| PLTCAP-009 | Platform Performance Optimization | LYR-PLT-06 | بهینه‌سازی عملکرد پلتفرم          |
| PLTCAP-010 | Platform Intelligence             | LYR-PLT-06 | بینش و تحلیل هوشمند پلتفرم        |
| PLTCAP-011 | Platform State Management         | LYR-PLT-07 | مدیریت وضعیت پلتفرم               |
| PLTCAP-012 | Cross-Platform Orchestration      | LYR-PLT-07 | هماهنگ‌سازی بین پلتفرم‌ها         |

### نگاشت قابلیت به Agent

| قابلیت     | Agent مصرف‌کننده | نوع مصرف    |
| ---------- | ---------------- | ----------- |
| PLTCAP-001 | AI-008           | اجرا        |
| PLTCAP-002 | AI-008           | اجرا        |
| PLTCAP-003 | AI-008           | برنامه‌ریزی |
| PLTCAP-004 | AI-003, AI-005   | اجرا        |
| PLTCAP-005 | AI-004, AI-008   | اعتبارسنجی  |
| PLTCAP-006 | AI-001, AI-002   | پرس‌وجو     |
| PLTCAP-007 | AI-010           | جمع‌آوری    |
| PLTCAP-008 | AI-009           | نظارت       |
| PLTCAP-009 | AI-010, AI-012   | تحلیل       |
| PLTCAP-010 | AI-010, AI-012   | تحلیل       |
| PLTCAP-011 | AI-008, AI-014   | مدیریت      |
| PLTCAP-012 | AI-014           | هماهنگ‌سازی |

---

## ۱۰. Platform Service Model

### سرویس‌های پلتفرمی

| شناسه    | سرویس                         | قابلیت مرتبط | توضیح                          |
| -------- | ----------------------------- | ------------ | ------------------------------ |
| PLTS-001 | Publishing Service            | PLTCAP-001   | سرویس انتشار محتوا             |
| PLTS-002 | Scheduling Service            | PLTCAP-003   | سرویس زمان‌بندی انتشار         |
| PLTS-003 | Format Conversion Service     | PLTCAP-004   | تبدیل قالب محتوا برای پلتفرم   |
| PLTS-004 | Compliance Validation Service | PLTCAP-005   | بررسی انطباق با قواعد پلتفرم   |
| PLTS-005 | Analytics Collection Service  | PLTCAP-007   | جمع‌آوری داده از پلتفرم        |
| PLTS-006 | Notification Service          | —            | اطلاع‌رسانی وضعیت پلتفرم       |
| PLTS-007 | Content Retrieval Service     | —            | بازیابی محتوای پلتفرمی         |
| PLTS-008 | State Synchronization Service | PLTCAP-011   | همگام‌سازی وضعیت بین پلتفرم‌ها |
| PLTS-009 | Rate Limit Service            | —            | مدیریت محدودیت نرخ پلتفرم      |

### مشخصات سرویس

| سرویس    | ورودی                    | خروجی                 | حالت  | خطا                 |
| -------- | ------------------------ | --------------------- | ----- | ------------------- |
| PLTS-001 | Publishing Package       | Publication Receipt   | async | PlatformUnavailable |
| PLTS-002 | Schedule Request         | Schedule Confirmation | sync  | InvalidSchedule     |
| PLTS-003 | Canonical Content        | Platform Content      | sync  | UnsupportedFormat   |
| PLTS-004 | Content + Platform Rules | Compliance Report     | sync  | NonCompliant        |
| PLTS-005 | Platform Metrics         | Raw Data Points       | async | CollectionFailure   |
| PLTS-006 | Notification Payload     | Delivery Confirmation | sync  | DeliveryFailed      |
| PLTS-007 | Retrieval Query          | Platform Content      | sync  | ContentNotFound     |
| PLTS-008 | State Delta              | Synchronized State    | async | SyncConflict        |
| PLTS-009 | Request Batch            | Rate Status           | sync  | RateExceeded        |

---

## ۱۱. Platform Component Model

### مؤلفه‌های پلتفرمی

| شناسه    | مؤلفه                  | سرویس مرتبط        | لایه       | توضیح                        |
| -------- | ---------------------- | ------------------ | ---------- | ---------------------------- |
| PLTC-001 | Platform Connector     | PLTS-001, PLTS-005 | LYR-PLT-04 | اتصال به API پلتفرم          |
| PLTC-002 | Content Adapter        | PLTS-003           | LYR-PLT-03 | تطبیق محتوا با قالب پلتفرم   |
| PLTC-003 | Schedule Manager       | PLTS-002           | LYR-PLT-04 | مدیریت زمان‌بندی انتشار      |
| PLTC-004 | Compliance Engine      | PLTS-004           | LYR-PLT-02 | موتور بررسی انطباق           |
| PLTC-005 | Analytics Collector    | PLTS-005           | LYR-PLT-06 | جمع‌آوری داده تحلیلی         |
| PLTC-006 | Platform Cache         | —                  | LYR-PLT-04 | کش داده و وضعیت پلتفرم       |
| PLTC-007 | Rate Limiter           | PLTS-009           | LYR-PLT-04 | مدیریت محدودیت نرخ           |
| PLTC-008 | Error Handler          | —                  | LYR-PLT-04 | مدیریت خطاهای پلتفرم         |
| PLTC-009 | Retry Manager          | —                  | LYR-PLT-04 | تلاش مجدد برای عملیات ناموفق |
| PLTC-010 | Platform State Store   | PLTS-008           | LYR-PLT-07 | ذخیره وضعیت پلتفرم           |
| PLTC-011 | Authentication Manager | —                  | LYR-PLT-04 | مدیریت احراز هویت پلتفرم     |
| PLTC-012 | Webhook Receiver       | PLTS-006           | LYR-PLT-04 | دریافت رویدادهای پلتفرم      |

---

## ۱۲. Platform Module Model

### ماژول‌های پلتفرمی

| شناسه    | ماژول                | مؤلفه‌ها                                         | لایه       | توضیح                   |
| -------- | -------------------- | ------------------------------------------------ | ---------- | ----------------------- |
| PLTM-001 | Publishing Module    | PLTC-001, PLTC-003, PLTC-007, PLTC-008, PLTC-009 | LYR-PLT-04 | مدیریت چرخه انتشار      |
| PLTM-002 | Adaptation Module    | PLTC-002                                         | LYR-PLT-03 | تطبیق محتوای کانونیکال  |
| PLTM-003 | Compliance Module    | PLTC-004                                         | LYR-PLT-02 | انطباق با قواعد پلتفرم  |
| PLTM-004 | Analytics Module     | PLTC-005                                         | LYR-PLT-06 | تحلیل عملکرد پلتفرم     |
| PLTM-005 | Engagement Module    | —                                                | LYR-PLT-05 | تعامل با مخاطب          |
| PLTM-006 | Intelligence Module  | —                                                | LYR-PLT-06 | بینش و هوش پلتفرمی      |
| PLTM-007 | Orchestration Module | PLTC-001, PLTC-010                               | LYR-PLT-07 | هماهنگ‌سازی بین پلتفرمی |

---

## ۱۳. Platform Interface Concept

### مفهوم رابط پلتفرم

رابط پلتفرم نقطه تماس بین SMOS و یک پلتفرم اجتماعی خارجی است. هر رابط پلتفرم:

- یک **اتصال منطقی** به پلتفرم را نشان می‌دهد
- دارای **ورودی/خروجی** مشخص است
- مستقل از **API و پروتکل** پلتفرم تعریف می‌شود
- توسط **یک یا چند مؤلفه** پیاده‌سازی می‌شود

### انواع رابط پلتفرمی

| شناسه     | نوع رابط            | جهت    | مثال                    |
| --------- | ------------------- | ------ | ----------------------- |
| PLT-IF-01 | Publish Interface   | خروجی  | انتشار محتوا در پلتفرم  |
| PLT-IF-02 | Retrieve Interface  | ورودی  | بازیابی محتوا از پلتفرم |
| PLT-IF-03 | Analytics Interface | ورودی  | دریافت داده تحلیلی      |
| PLT-IF-04 | Event Interface     | دوطرفه | دریافت رویدادهای پلتفرم |
| PLT-IF-05 | Status Interface    | ورودی  | بررسی وضعیت پلتفرم      |

### نگاشت رابط به سرویس

| رابط      | سرویس‌های مرتبط              |
| --------- | ---------------------------- |
| PLT-IF-01 | PLTS-001, PLTS-002, PLTS-003 |
| PLT-IF-02 | PLTS-007                     |
| PLT-IF-03 | PLTS-005                     |
| PLT-IF-04 | PLTS-006                     |
| PLT-IF-05 | PLTS-008, PLTS-009           |

---

## ۱۴. Platform Integration Concept

### مفهوم یکپارچگی پلتفرم

یکپارچگی پلتفرم نحوه اتصال و هماهنگی بین SMOS و پلتفرم‌های اجتماعی را تعریف می‌کند.

### الگوهای یکپارچگی

| شناسه      | الگو           | توضیح                      | کاربرد          |
| ---------- | -------------- | -------------------------- | --------------- |
| PLT-INT-01 | Direct API     | اتصال مستقیم به API پلتفرم | انتشار، بازیابی |
| PLT-INT-02 | Webhook        | دریافت رویداد از پلتفرم    | تعامل، نظارت    |
| PLT-INT-03 | Scheduled Poll | واکشی دوره‌ای داده         | تحلیل، بینش     |
| PLT-INT-04 | Batch Upload   | آپلود دسته‌ای محتوا        | انتشار انبوه    |
| PLT-INT-05 | Manual Bridge  | ورود دستی انسان            | موارد خاص       |

### قواعد یکپارچگی

| ID     | قاعده                                                 |
| ------ | ----------------------------------------------------- |
| INT-01 | هر پلتفرم حداقل یک الگوی یکپارچگی دارد                |
| INT-02 | الگوی یکپارچگی مستقل از پیاده‌سازی API است            |
| INT-03 | تغییر الگوی یکپارچگی نیازمند بازبینی مؤلفه مربوطه است |

---

## ۱۵. Platform Boundary Model

### مدل مرز پلتفرم

مرز پلتفرم محدوده مسئولیت و تأثیر هر پلتفرم را در معماری SMOS تعریف می‌کند.

### ابعاد مرز

| بعد       | توضیح                            |
| --------- | -------------------------------- |
| محتوایی   | نوع محتوای قابل انتشار در پلتفرم |
| مخاطبی    | جامعه هدف پلتفرم                 |
| زمانی     | بازه زمانی فعالیت پلتفرم         |
| جغرافیایی | محدوده جغرافیایی پلتفرم          |
| قانونی    | قواعد و محدودیت‌های قانونی       |

### نمونه مرز پلتفرم

| پلتفرم    | مرز محتوایی         | مرز مخاطبی      | مرز جغرافیایی |
| --------- | ------------------- | --------------- | ------------- |
| Instagram | بصری + Reels        | عمومی (B2C)     | جهانی         |
| LinkedIn  | حرفه‌ای + مقالات    | حرفه‌ای (B2B)   | جهانی         |
| Telegram  | متنی + کانال        | عمومی + اختصاصی | ایران + جهان  |
| YouTube   | ویدئو بلند + Shorts | عمومی (B2C)     | جهانی         |
| Aparat    | ویدئو بلند          | عمومی فارسی     | ایران         |

---

## ۱۶. Platform Dependency Model

### مدل وابستگی پلتفرم

پلتفرم‌ها در SMOS به مفاهیم و اسناد دیگر وابسته هستند. این وابستگی‌ها در مدل زیر تعریف می‌شوند.

### انواع وابستگی

| شناسه      | نوع                   | توضیح                                   |
| ---------- | --------------------- | --------------------------------------- |
| PLT-DEP-01 | Business Dependency   | وابستگی به مفاهیم کسب‌وکار (KNW-101)    |
| PLT-DEP-02 | Content Dependency    | وابستگی به تاکسونومی محتوا (EDT-002)    |
| PLT-DEP-03 | Brand Dependency      | وابستگی به هویت برند (BRD-001, BRD-002) |
| PLT-DEP-04 | Rule Dependency       | وابستگی به قواعد کسب‌وکار (KNW-102)     |
| PLT-DEP-05 | Process Dependency    | وابستگی به فرآیندها (KNW-103)           |
| PLT-DEP-06 | Decision Dependency   | وابستگی به تصمیم‌ها (KNW-104)           |
| PLT-DEP-07 | Governance Dependency | وابستگی به حکمرانی (PLAT-000, GOV-\*)   |

### ماتریس وابستگی پلتفرم

| پلتفرم    | PLT-DEP-01 | PLT-DEP-02 | PLT-DEP-03 | PLT-DEP-04 | PLT-DEP-05 | PLT-DEP-06 | PLT-DEP-07 |
| --------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| Instagram | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          |
| LinkedIn  | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          |
| Telegram  | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          |
| X/Twitter | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          |
| YouTube   | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          |
| Aparat    | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          |
| Website   | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          | ✓          |

---

## ۱۷. Platform Ownership

### مالکیت KNW-301

| نقش                   | موجودیت                      | مسئولیت                          |
| --------------------- | ---------------------------- | -------------------------------- |
| مالک (Owner)          | معمار دانش                   | معماری، یکپارچگی، تغییرات        |
| متولی (Steward)       | متولی دانش                   | به‌روزرسانی، Registry، نسخه‌بندی |
| مصرف‌کننده (Consumer) | همه Agentهای پلتفرمی + انسان | استفاده از مفاهیم                |

### قواعد مالکیت

| ID     | قاعده                                                    |
| ------ | -------------------------------------------------------- |
| OWN-01 | تغییر در مفاهیم پایه پلتفرم نیازمند تأیید معمار دانش است |
| OWN-02 | تغییر MAJOR نیازمند ADR است                              |
| OWN-03 | همه تغییرات در Change Log ثبت می‌شوند                    |
| OWN-04 | اضافه کردن پلتفرم جدید نیازمند ثبت در KNW-301 است        |

---

## ۱۸. Platform Governance

### حکمرانی KNW-301

| ID     | اصل              | توضیح                                                |
| ------ | ---------------- | ---------------------------------------------------- |
| GOV-01 | KNW-301 SSOT است | هیچ مفهوم پلتفرمی خارج از این سند تعریف نمی‌شود      |
| GOV-02 | بازبینی دوره‌ای  | سند با اضافه شدن هر پلتفرم جدید بازبینی می‌شود       |
| GOV-03 | نسخه‌بندی دقیق   | همه تغییرات دارای نسخه SemVer هستند                  |
| GOV-04 | عدم تکرار        | مفاهیم پلتفرمی در PLAT-\* تکرار نمی‌شوند — فقط ارجاع |
| GOV-05 | انطباق با معماری | KNW-301 تابع KNW-000, KNW-101 و CON-000 است          |

---

## ۱۹. Relationship to PLAT-\*

### رابطه KNW-301 با کتابچه‌های پلتفرم

KNW-301 مفاهیم انتزاعی پلتفرم را تعریف می‌کند — PLAT-\* این مفاهیم را برای یک پلتفرم خاص **نمونه‌سازی** می‌کند.

### قواعد رابطه

| ID         | قاعده                                                         |
| ---------- | ------------------------------------------------------------- |
| PLT-REF-01 | هر PLAT-\* باید به KNW-301 برای مفاهیم پایه ارجاع دهد         |
| PLT-REF-02 | هیچ PLAT-\* نباید مفهومی که در KNW-301 تعریف شده را تکرار کند |
| PLT-REF-03 | PLAT-\* تنها مشخصات مختص به پلتفرم خود را اضافه می‌کند        |
| PLT-REF-04 | تغییر در KNW-301 ممکن است نیازمند بازبینی PLAT-\*ها باشد      |

### نگاشت PLAT-\* به KNW-301

| کتابچه               | مفاهیم مصرفی از KNW-301                        |
| -------------------- | ---------------------------------------------- |
| PLAT-001 (Instagram) | PLTD-001..005, LYR-PLT-01..07, PLTCAP-001..012 |
| PLAT-002 (LinkedIn)  | PLTD-001..005, LYR-PLT-01..07, PLTCAP-001..012 |
| PLAT-003 (Telegram)  | PLTD-001..005, LYR-PLT-01..07, PLTCAP-001..012 |
| PLAT-004 (X/Twitter) | PLTD-001..005, LYR-PLT-01..07, PLTCAP-001..012 |
| PLAT-005 (YouTube)   | PLTD-001..005, LYR-PLT-01..07, PLTCAP-001..012 |
| PLAT-006 (Aparat)    | PLTD-001..005, LYR-PLT-01..07, PLTCAP-001..012 |
| PLAT-007 (Website)   | PLTD-001..005, LYR-PLT-01..07, PLTCAP-001..012 |

---

## ۲۰. Relationship to AI-\*

### رابطه KNW-301 با Agentهای هوشمند

Agentها از KNW-301 برای درک مفاهیم، قابلیت‌ها و لایه‌های پلتفرمی استفاده می‌کنند.

### قواعد رابطه

| ID        | قاعده                                                     |
| --------- | --------------------------------------------------------- |
| AI-REF-01 | هر Agent که با پلتفرم کار می‌کند باید KNW-301 را مصرف کند |
| AI-REF-02 | قابلیت‌های Agent باید با PLTCAP\* سازگار باشد             |
| AI-REF-03 | Agent جدید نیازمند بررسی تطابق قابلیتی با KNW-301 است     |

### نگاشت Agent به KNW-301

| Agent                     | شناسه  | مفاهیم مصرفی                                           |
| ------------------------- | ------ | ------------------------------------------------------ |
| Content Strategy          | AI-001 | PLTD-001..004, PLT-ROLE\*                              |
| Content Planning          | AI-002 | PLTD-002, PLTCAP-003, PLTCAP-006                       |
| Content Production        | AI-003 | PLTD-002, PLTCAP-004                                   |
| Content Review            | AI-004 | PLTD-007, PLTCAP-005                                   |
| Search Optimization       | AI-005 | PLTCAP-004                                             |
| Media Asset Production    | AI-006 | PLTD-002                                               |
| Video Production          | AI-007 | PLTD-002                                               |
| Publishing & Distribution | AI-008 | PLTD-001, PLTD-002, PLTCAP-001..005, PLTCAP-011        |
| Community Engagement      | AI-009 | PLTD-003, PLTD-005, PLTCAP-008                         |
| Analytics & Intelligence  | AI-010 | PLTD-005, PLTD-008, PLTCAP-007, PLTCAP-009, PLTCAP-010 |
| Knowledge Management      | AI-011 | همه دامنه‌ها                                           |
| Continuous Improvement    | AI-012 | PLTCAP-009, PLTCAP-010                                 |
| Research                  | AI-013 | PLTD-001..008                                          |
| Enterprise Orchestrator   | AI-014 | PLTCAP-011, PLTCAP-012, PLTM-007                       |

---

## ۲۱. Relationship to AUT-\*

### رابطه KNW-301 با Workflowهای خودکار

Workflowها از KNW-301 برای تعریف گام‌های پلتفرمی استفاده می‌کنند.

### قواعد رابطه

| ID         | قاعده                                                            |
| ---------- | ---------------------------------------------------------------- |
| AUT-REF-01 | هر Workflow پلتفرمی باید مؤلفه مصرفی خود را از PLTC\* انتخاب کند |
| AUT-REF-02 | وضعیت Workflow با وضعیت‌های PLTC\* هماهنگ است                    |
| AUT-REF-03 | خطاهای Workflow با خطاهای PLTS\* مطابقت دارند                    |

### نگاشت AUT-\* به KNW-301

| Workflow              | مؤلفه‌های مصرفی                        |
| --------------------- | -------------------------------------- |
| Publishing Chain      | PLTC-001, PLTC-003, PLTC-007, PLTC-009 |
| Platform Adaptation   | PLTC-002, PLTC-004                     |
| Analytics Collection  | PLTC-005, PLTC-006                     |
| Engagement Processing | PLTC-008, PLTC-012                     |
| Cross-Platform Sync   | PLTC-010, PLTC-011                     |

---

## ۲۲. Relationship to PRM-\*

### رابطه KNW-301 با پرامپت‌ها

پرامپت‌های پلتفرمی از مفاهیم KNW-301 برای زمینه‌سازی (context) استفاده می‌کنند.

### قواعد رابطه

| ID         | قاعده                                                |
| ---------- | ---------------------------------------------------- |
| PRM-REF-01 | پرامپت‌های پلتفرمی باید به PLTD*, PLTCAP* ارجاع دهند |
| PRM-REF-02 | پرامپت نباید مفاهیم KNW-301 را بازتعریف کند          |

### نگاشت PRM-\* به KNW-301

| پرامپت                        | مفاهیم مصرفی                     |
| ----------------------------- | -------------------------------- |
| PRM-301 (Publishing)          | PLTD-002, PLTCAP-001, PLTCAP-002 |
| PRM-302 (Package Assembly)    | PLTD-002, PLTC-001               |
| PRM-303 (Platform Selection)  | PLT-ROLE*, PLT-TYPE*             |
| PRM-305 (Platform Compliance) | PLTD-007, PLTCAP-005             |
| PRM-306 (Execution Chain)     | PLTC-001..012                    |
| PRM-207 (Format Adaptation)   | PLTCAP-004, PLTC-002             |

---

## ۲۳. Validation Rules

| ID    | قانون                                        | سطح     | نقض   |
| ----- | -------------------------------------------- | ------- | ----- |
| VR-01 | هر دامنه پلتفرمی دارای شناسه یکتا است        | معماری  | خطا   |
| VR-02 | هر لایه به یک سطح انتزاع معتبر تعلق دارد     | معماری  | خطا   |
| VR-03 | هر قابلیت به یک لایه مرتبط است               | معماری  | خطا   |
| VR-04 | هر سرویس به یک قابلیت مرتبط است              | معماری  | هشدار |
| VR-05 | هر مؤلفه به یک سرویس مرتبط است               | معماری  | هشدار |
| VR-06 | پلتفرم‌ها در طبقه‌بندی منحصربه‌فرد هستند     | محتوایی | خطا   |
| VR-07 | هیچ دو پلتفرمی نقش یکسان ندارند مگر با ADR   | محتوایی | هشدار |
| VR-08 | مفاهیم پلتفرمی با KNW-101 تناقض ندارند       | محتوایی | خطا   |
| VR-09 | مرز پلتفرم با سایر پلتفرم‌ها همپوشانی ندارد  | محتوایی | هشدار |
| VR-10 | همه Agentهای مصرف‌کننده در AI-\* ثبت شده‌اند | معماری  | خطا   |

---

## ۲۴. Quality Gates

| گیت   | مکان              | معیار                     | مسئول        |
| ----- | ----------------- | ------------------------- | ------------ |
| QG-01 | Draft → Review    | هویت کامل، ۳۰ بخش         | خودکار       |
| QG-02 | Review → Approved | اعتبارسنجی مفاهیم پلتفرمی | معمار دانش   |
| QG-03 | Approved → Active | ثبت در KNW-001            | متولی دانش   |
| QG-04 | Active → Updated  | هماهنگی با PLAT-\* جدید   | معمار پلتفرم |

---

## ۲۵. Knowledge Producers

### تولیدکنندگان KNW-301

| تولیدکننده        | نوع تولید             | نقش        |
| ----------------- | --------------------- | ---------- |
| معمار دانش        | ایجاد + ویرایش        | مالک       |
| متولی دانش        | ویرایش + نگهداری      | متولی      |
| معمار پلتفرم      | پیشنهاد تغییر پلتفرمی | مصرف‌کننده |
| استراتژیست پلتفرم | پیشنهاد دامنه جدید    | مصرف‌کننده |

---

## ۲۶. Knowledge Consumers

### مصرف‌کنندگان KNW-301

| مصرف‌کننده                         | نوع مصرف                 | سطح دسترسی |
| ---------------------------------- | ------------------------ | ---------- |
| AI-001 (Content Strategy)          | پرس‌وجو + استخراج مفاهیم | A-3        |
| AI-002 (Content Planning)          | پرس‌وجو                  | A-2        |
| AI-003 (Content Production)        | پرس‌وجو                  | A-2        |
| AI-004 (Content Review)            | پرس‌وجو                  | A-3        |
| AI-005 (Search Optimization)       | پرس‌وجو                  | A-3        |
| AI-008 (Publishing & Distribution) | پرس‌وجو + اجرا           | A-3        |
| AI-009 (Community Engagement)      | پرس‌وجو                  | A-2        |
| AI-010 (Analytics & Intelligence)  | پرس‌وجو                  | A-3        |
| AI-011 (Knowledge Management)      | همه                      | A-4        |
| AI-012 (Continuous Improvement)    | پرس‌وجو                  | A-3        |
| AI-014 (Enterprise Orchestrator)   | پرس‌وجو + اجرا           | A-4        |
| Human (Platform Strategist)        | مطالعه + مرجع            | A-4        |

---

## ۲۷. Machine Readable Blocks

### Block 1 — Platform Identity

```json
{
  "id": "KNW-301",
  "name_fa": "پایه دانش پلتفرم سازمانی",
  "name_en": "Enterprise Platform Knowledge Foundation",
  "version": "1.0.0-draft",
  "family": "KNW-PLT",
  "domain": "PLTD-001",
  "type": "Platform Foundation",
  "status": "draft",
  "ssot": true,
  "total_domains": 8,
  "total_layers": 7,
  "total_capabilities": 12,
  "total_services": 9,
  "total_components": 12,
  "total_modules": 7,
  "total_platforms_mapped": 8,
  "dependencies": ["KNW-000", "KNW-001", "KNW-101", "PLAT-000", "ARCH-020"]
}
```

### Block 2 — Platform Domains

```json
{
  "domains": [
    {
      "id": "PLTD-001",
      "name": "Social Media Platform",
      "layer": "LYR-PLT-01",
      "platforms": ["Instagram", "LinkedIn", "X/Twitter", "YouTube", "Aparat", "Telegram"]
    },
    {
      "id": "PLTD-002",
      "name": "Content Distribution",
      "layer": "LYR-PLT-04",
      "platforms": [
        "Instagram",
        "LinkedIn",
        "X/Twitter",
        "YouTube",
        "Aparat",
        "Telegram",
        "Website"
      ]
    },
    {
      "id": "PLTD-003",
      "name": "Audience Engagement",
      "layer": "LYR-PLT-05",
      "platforms": ["Instagram", "LinkedIn", "Telegram", "YouTube"]
    },
    {
      "id": "PLTD-004",
      "name": "Brand Presence",
      "layer": "LYR-PLT-01",
      "platforms": ["Instagram", "LinkedIn", "Website"]
    },
    {
      "id": "PLTD-005",
      "name": "Analytics & Insights",
      "layer": "LYR-PLT-06",
      "platforms": ["Instagram", "LinkedIn", "X/Twitter", "YouTube", "Website"]
    },
    {
      "id": "PLTD-006",
      "name": "Platform Automation",
      "layer": "LYR-PLT-07",
      "platforms": ["all"]
    },
    {
      "id": "PLTD-007",
      "name": "Platform Governance",
      "layer": "LYR-PLT-02",
      "platforms": ["all"]
    },
    { "id": "PLTD-008", "name": "Platform Operations", "layer": "LYR-PLT-07", "platforms": ["all"] }
  ]
}
```

### Block 3 — Platform Capabilities

```json
{
  "capabilities": [
    {
      "id": "PLTCAP-001",
      "name": "Content Publishing",
      "layer": "LYR-PLT-04",
      "primary_agent": "AI-008",
      "service": "PLTS-001"
    },
    {
      "id": "PLTCAP-002",
      "name": "Multi-Platform Distribution",
      "layer": "LYR-PLT-04",
      "primary_agent": "AI-008",
      "service": "PLTS-001"
    },
    {
      "id": "PLTCAP-003",
      "name": "Cross-Platform Scheduling",
      "layer": "LYR-PLT-04",
      "primary_agent": "AI-008",
      "service": "PLTS-002"
    },
    {
      "id": "PLTCAP-004",
      "name": "Platform Format Adaptation",
      "layer": "LYR-PLT-03",
      "primary_agent": "AI-003",
      "service": "PLTS-003"
    },
    {
      "id": "PLTCAP-005",
      "name": "Platform Compliance Validation",
      "layer": "LYR-PLT-02",
      "primary_agent": "AI-004",
      "service": "PLTS-004"
    },
    {
      "id": "PLTCAP-006",
      "name": "Audience Targeting",
      "layer": "LYR-PLT-03",
      "primary_agent": "AI-001",
      "service": null
    },
    {
      "id": "PLTCAP-007",
      "name": "Platform Analytics Collection",
      "layer": "LYR-PLT-06",
      "primary_agent": "AI-010",
      "service": "PLTS-005"
    },
    {
      "id": "PLTCAP-008",
      "name": "Community Monitoring",
      "layer": "LYR-PLT-05",
      "primary_agent": "AI-009",
      "service": null
    },
    {
      "id": "PLTCAP-009",
      "name": "Platform Performance Optimization",
      "layer": "LYR-PLT-06",
      "primary_agent": "AI-012",
      "service": null
    },
    {
      "id": "PLTCAP-010",
      "name": "Platform Intelligence",
      "layer": "LYR-PLT-06",
      "primary_agent": "AI-010",
      "service": null
    },
    {
      "id": "PLTCAP-011",
      "name": "Platform State Management",
      "layer": "LYR-PLT-07",
      "primary_agent": "AI-014",
      "service": "PLTS-008"
    },
    {
      "id": "PLTCAP-012",
      "name": "Cross-Platform Orchestration",
      "layer": "LYR-PLT-07",
      "primary_agent": "AI-014",
      "service": null
    }
  ]
}
```

### Block 4 — Platform Components

```json
{
  "components": [
    {
      "id": "PLTC-001",
      "name": "Platform Connector",
      "service": "PLTS-001",
      "layer": "LYR-PLT-04",
      "type": "integration",
      "stateful": true
    },
    {
      "id": "PLTC-002",
      "name": "Content Adapter",
      "service": "PLTS-003",
      "layer": "LYR-PLT-03",
      "type": "transformation",
      "stateful": false
    },
    {
      "id": "PLTC-003",
      "name": "Schedule Manager",
      "service": "PLTS-002",
      "layer": "LYR-PLT-04",
      "type": "orchestration",
      "stateful": true
    },
    {
      "id": "PLTC-004",
      "name": "Compliance Engine",
      "service": "PLTS-004",
      "layer": "LYR-PLT-02",
      "type": "validation",
      "stateful": false
    },
    {
      "id": "PLTC-005",
      "name": "Analytics Collector",
      "service": "PLTS-005",
      "layer": "LYR-PLT-06",
      "type": "collection",
      "stateful": true
    },
    {
      "id": "PLTC-006",
      "name": "Platform Cache",
      "service": null,
      "layer": "LYR-PLT-04",
      "type": "infrastructure",
      "stateful": true
    },
    {
      "id": "PLTC-007",
      "name": "Rate Limiter",
      "service": "PLTS-009",
      "layer": "LYR-PLT-04",
      "type": "protection",
      "stateful": true
    },
    {
      "id": "PLTC-008",
      "name": "Error Handler",
      "service": null,
      "layer": "LYR-PLT-04",
      "type": "resilience",
      "stateful": false
    },
    {
      "id": "PLTC-009",
      "name": "Retry Manager",
      "service": null,
      "layer": "LYR-PLT-04",
      "type": "resilience",
      "stateful": true
    },
    {
      "id": "PLTC-010",
      "name": "Platform State Store",
      "service": "PLTS-008",
      "layer": "LYR-PLT-07",
      "type": "storage",
      "stateful": true
    },
    {
      "id": "PLTC-011",
      "name": "Authentication Manager",
      "service": null,
      "layer": "LYR-PLT-04",
      "type": "security",
      "stateful": true
    },
    {
      "id": "PLTC-012",
      "name": "Webhook Receiver",
      "service": "PLTS-006",
      "layer": "LYR-PLT-04",
      "type": "integration",
      "stateful": false
    }
  ]
}
```

### Block 5 — Platform Relationships

```json
{
  "relationships": [
    {
      "id": "PLTR-001",
      "source": "PLTC-001",
      "target": "PLTC-003",
      "type": "triggers",
      "description": "Connector triggers Schedule Manager on publish"
    },
    {
      "id": "PLTR-002",
      "source": "PLTC-002",
      "target": "PLTC-001",
      "type": "feeds",
      "description": "Content Adapter feeds adapted content to Connector"
    },
    {
      "id": "PLTR-003",
      "source": "PLTC-004",
      "target": "PLTC-002",
      "type": "validates",
      "description": "Compliance Engine validates adapted content"
    },
    {
      "id": "PLTR-004",
      "source": "PLTC-005",
      "target": "PLTC-006",
      "type": "stores",
      "description": "Analytics Collector stores data in Cache"
    },
    {
      "id": "PLTR-005",
      "source": "PLTC-007",
      "target": "PLTC-001",
      "type": "protects",
      "description": "Rate Limiter protects Connector from overuse"
    },
    {
      "id": "PLTR-006",
      "source": "PLTC-008",
      "target": "PLTC-009",
      "type": "delegates",
      "description": "Error Handler delegates retries to Retry Manager"
    },
    {
      "id": "PLTR-007",
      "source": "PLTC-010",
      "target": "PLTC-003",
      "type": "persists",
      "description": "Platform State Store persists Schedule Manager state"
    },
    {
      "id": "PLTR-008",
      "source": "PLTC-011",
      "target": "PLTC-001",
      "type": "authenticates",
      "description": "Authentication Manager authenticates Connector"
    },
    {
      "id": "PLTR-009",
      "source": "PLTC-012",
      "target": "PLTC-008",
      "type": "notifies",
      "description": "Webhook Receiver notifies Error Handler of events"
    }
  ]
}
```

### Block 6 — Platform KPIs

```json
{
  "kpis": [
    {
      "id": "KPI-301-01",
      "name": "platform_domain_coverage",
      "description": "پوشش دامنه‌های پلتفرمی تعریف‌شده",
      "target": "8/8",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-301-02",
      "name": "capability_completeness",
      "description": "تکمیل قابلیت‌های پلتفرمی",
      "target": "12/12",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-301-03",
      "name": "component_service_alignment",
      "description": "هم‌راستایی مؤلفه‌ها با سرویس‌ها",
      "target": "100%",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-301-04",
      "name": "platform_agent_mapping",
      "description": "نگاشت قابلیت به Agent",
      "target": "12/12",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-301-05",
      "name": "platform_taxonomy_consistency",
      "description": "سازگاری طبقه‌بندی پلتفرم‌ها",
      "target": "100%",
      "measurement": "semi-annual"
    },
    {
      "id": "KPI-301-06",
      "name": "consumption_rate",
      "description": "نرخ مصرف توسط Agentها و PLAT-*ها",
      "target": "≥ 85%",
      "measurement": "monthly"
    }
  ]
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Platform Component

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:platform:component:v1",
  "title": "Platform Component",
  "description": "Schema for SMOS Platform Component definitions",
  "type": "object",
  "required": ["id", "name", "service", "layer", "type"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^PLTC-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "service": {
      "type": ["string", "null"],
      "pattern": "^(PLTS-[0-9]{3}|null)$"
    },
    "layer": {
      "type": "string",
      "pattern": "^LYR-PLT-[0-9]{2}$"
    },
    "type": {
      "type": "string",
      "enum": [
        "integration",
        "transformation",
        "orchestration",
        "validation",
        "collection",
        "infrastructure",
        "protection",
        "resilience",
        "storage",
        "security"
      ]
    },
    "stateful": {
      "type": "boolean"
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "additionalProperties": false
}
```

### Schema 2 — Platform Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:platform:capability:v1",
  "title": "Platform Capability",
  "description": "Schema for SMOS Platform Capability definitions",
  "type": "object",
  "required": ["id", "name", "layer", "primary_agent"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^PLTCAP-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "layer": {
      "type": "string",
      "pattern": "^LYR-PLT-[0-9]{2}$"
    },
    "primary_agent": {
      "type": "string",
      "pattern": "^AI-[0-9]{3}$"
    },
    "service": {
      "type": ["string", "null"],
      "pattern": "^(PLTS-[0-9]{3}|null)$"
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "additionalProperties": false
}
```

### Schema 3 — Platform Relationship

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:platform:relationship:v1",
  "title": "Platform Relationship",
  "description": "Schema for relationships between SMOS Platform Components",
  "type": "object",
  "required": ["id", "source", "target", "type"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^PLTR-[0-9]{3}$"
    },
    "source": {
      "type": "string",
      "pattern": "^PLTC-[0-9]{3}$"
    },
    "target": {
      "type": "string",
      "pattern": "^PLTC-[0-9]{3}$"
    },
    "type": {
      "type": "string",
      "enum": [
        "triggers",
        "feeds",
        "validates",
        "stores",
        "protects",
        "delegates",
        "persists",
        "authenticates",
        "notifies",
        "orchestrates",
        "monitors"
      ]
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

## ۲۹. KPIs — شاخص‌های کلیدی عملکرد

| KPI                               | شناسه      | هدف       | بازه    | مسئول        |
| --------------------------------- | ---------- | --------- | ------- | ------------ |
| پوشش دامنه‌های پلتفرمی            | KPI-301-01 | ۸/۸ دامنه | فصلی    | متولی دانش   |
| تکمیل قابلیت‌های پلتفرمی          | KPI-301-02 | ۱۲/۱۲     | فصلی    | متولی دانش   |
| هم‌راستایی مؤلفه‌ها با سرویس‌ها   | KPI-301-03 | ۱۰۰٪      | فصلی    | معمار دانش   |
| نگاشت قابلیت به Agent             | KPI-301-04 | ۱۲/۱۲     | فصلی    | معمار دانش   |
| سازگاری طبقه‌بندی پلتفرم‌ها       | KPI-301-05 | ۱۰۰٪      | شش‌ماهه | معمار پلتفرم |
| نرخ مصرف توسط Agentها و PLAT-\*ها | KPI-301-06 | ≥ ۸۵٪     | ماهانه  | متولی دانش   |

---

## ۳۰. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                  | توسط        |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-29 | نگارش اولیه — پایه دانش پلتفرم سازمانی. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema, ۸ دامنه, ۷ لایه, ۱۲ قابلیت, ۹ سرویس, ۱۲ مؤلفه, ۷ ماژول. SSOT پلتفرم SMOS. | معمار سیستم |
