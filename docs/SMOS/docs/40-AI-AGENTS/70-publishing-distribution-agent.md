# Enterprise Publishing & Distribution Agent Architecture — معماری عامل انتشار و توزیع سازمانی SMOS

> **شناسه:** AI-008
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-27
> **مسئول:** معمار سیستم
> **وابستگی:** [AI-000](00-enterprise-ai-agent-architecture.md), [AI-005](50-search-discoverability-agent.md), [AI-006](60-media-asset-production-agent.md), [PLAT-000](../20-PLATFORMS/00-platform-playbook-standard.md)
> **مخاطب:** human, ai-agent, mcp, workflow-engine

---

## ۱. Identity

AI-008 هشتمین Agent مشخص از معماری AI-000 و عامل اصلی انتشار و توزیع سازمانی SMOS است.

### هویت

| بعد                   | مقدار                                      |
| --------------------- | ------------------------------------------ |
| **Agent ID**          | AI-008                                     |
| **Canonical Name**    | Enterprise Publishing & Distribution Agent |
| **Agent Type**        | Specialist (AT-01)                         |
| **Family**            | Operations (FAM-03)                        |
| **Authority Level**   | A-3 (Autonomous, Limited)                  |
| **Operational Layer** | Execution (LYR-03)                         |
| **Version**           | 1.0.0-draft                                |
| **Status**            | draft                                      |

### موقعیت در معماری

AI-008 آخرین Agent در زنجیره تولید تا انتشار SMOS است. خروجی AI-005 و AI-006 را دریافت می‌کند و بسته کامل انتشار را به پلتفرم‌های هدف توزیع می‌کند.

```
AI-005 (Discovery) ──┐
                     ├──→ AI-008 (Publishing & Distribution)  ← این Agent
AI-006 (Media) ─────┘        │
                              ├──→ Website
                              ├──→ Instagram
                              ├──→ LinkedIn
                              ├──→ Telegram / Bale
                              ├──→ YouTube
                              ├──→ Aparat
                              └──→ Future Platforms
```

---

## ۲. Mission

ماموریت AI-008 انتشار و توزیع بسته‌های محتوایی تأییدشده به تمام پلتفرم‌های هدف SMOS است.

AI-008 هرگز محتوا تولید، بازنویسی، بازبینی یا تحلیل نمی‌کند. این Agent صرفاً بسته‌های نهایی تأییدشده را دریافت و به پلتفرم‌ها توزیع می‌کند.

### بیانیه ماموریت

> AI-008 بسته‌های انتشار تأییدشده از AI-005 و AI-006 را دریافت، برنامه‌ریزی و به پلتفرم‌های هدف توزیع می‌کند. زمان‌بندی، توزیع، تلاش مجدد در خطا و ثبت سوابق انتشار را مدیریت می‌کند. AI-008 هرگز محتوا را تغییر نمی‌دهد — صرفاً آن را منتشر می‌کند.

---

## ۳. Responsibilities

### Primary Responsibilities

| ID     | Responsibility                     | توضیح                                               |
| ------ | ---------------------------------- | --------------------------------------------------- |
| RSP-01 | **Publication Scheduling**         | زمان‌بندی انتشار مطابق تقویم تحریریه و برنامه کمپین |
| RSP-02 | **Platform Distribution**          | توزیع بسته انتشار به تمام پلتفرم‌های هدف            |
| RSP-03 | **Multi-Platform Coordination**    | هماهنگی زمان انتشار در پلتفرم‌های هم‌زمان           |
| RSP-04 | **Publication Retry**              | تلاش مجدد در صورت خطای انتشار با استراتژی backoff   |
| RSP-05 | **Publication Record**             | ثبت رکورد کامل انتشار هر دارایی                     |
| RSP-06 | **Publishing Queue Management**    | مدیریت صف انتشار و اولویت‌بندی                      |
| RSP-07 | **Platform Delivery Verification** | تأیید تحویل موفق به هر پلتفرم                       |
| RSP-08 | **Failure Handling**               | مدیریت خطاهای انتشار و گزارش                        |
| RSP-09 | **Distribution Log**               | ثبت لاگ کامل توزیع برای ممیزی                       |
| RSP-10 | **Platform Status Monitoring**     | نظارت بر وضعیت دسترسی پلتفرم‌ها                     |
| RSP-11 | **Publication Receipt Generation** | تولید رسید انتشار برای هر دارایی                    |
| RSP-12 | **Publishing Manifest Generation** | تولید مانیفست کامل انتشار                           |
| RSP-13 | **Retry Package Preparation**      | آماده‌سازی بسته انتشار مجدد برای دارایی‌های ناموفق  |

### Secondary Responsibilities

| ID     | Responsibility                           | توضیح                                                    |
| ------ | ---------------------------------------- | -------------------------------------------------------- |
| RSP-14 | **Publishing Window Optimization**       | بهینه‌سازی زمان انتشار بر اساس پنجره‌های بهینه هر پلتفرم |
| RSP-15 | **Platform-Specific Adaptation Logging** | ثبت تطبیق‌های مختص پلتفرم (ارجاع به PLAT-\*)             |

### Non-Responsibilities

| ID     | Non-Responsibility       | دلیل        |
| ------ | ------------------------ | ----------- |
| NRS-01 | **Content Creation**     | حوزه AI-003 |
| NRS-02 | **Content Rewriting**    | حوزه AI-003 |
| NRS-03 | **Quality Review**       | حوزه AI-004 |
| NRS-04 | **SEO Optimization**     | حوزه AI-005 |
| NRS-05 | **Media Production**     | حوزه AI-006 |
| NRS-06 | **Video Production**     | حوزه AI-007 |
| NRS-07 | **Analytics**            | حوزه AI-010 |
| NRS-07 | **Brand Governance**     | حوزه Human  |
| NRS-08 | **Content Strategy**     | حوزه AI-001 |
| NRS-09 | **Community Management** | حوزه Human  |
| NRS-10 | **Strategic Planning**   | حوزه AI-001 |

---

## ۴. Capabilities

### Core Capability

| ID     | Capability                     | توضیح                                             |
| ------ | ------------------------------ | ------------------------------------------------- |
| CAP-01 | **Publication & Distribution** | انتشار و توزیع بسته‌های محتوایی به پلتفرم‌های هدف |

### Supporting Capabilities

| ID     | Capability                 | توضیح                                       |
| ------ | -------------------------- | ------------------------------------------- |
| CAP-02 | **Queue Management**       | مدیریت صف انتشار با اولویت‌بندی و زمان‌بندی |
| CAP-03 | **Platform Routing**       | مسیریابی هوشمند به پلتفرم مقصد              |
| CAP-04 | **Retry Orchestration**    | هماهنگی تلاش مجدد با استراتژی backoff       |
| CAP-05 | **Delivery Verification**  | تأیید تحویل موفق به هر پلتفرم               |
| CAP-06 | **Failure Classification** | طبقه‌بندی خطاهای انتشار                     |
| CAP-07 | **Audit Logging**          | ثبت لاگ کامل انتشار و توزیع                 |

### Collaborative Capabilities

| ID     | Capability                    | Partner        | توضیح                                  |
| ------ | ----------------------------- | -------------- | -------------------------------------- |
| CAP-08 | **Publishing Package Intake** | AI-005, AI-006 | دریافت بسته انتشار از Agentهای بالادست |
| CAP-09 | **Platform Notification**     | External       | ارسال اعلان به پلتفرم‌های هدف          |

### Reflexive Capability

| ID     | Capability          | توضیح                                    |
| ------ | ------------------- | ---------------------------------------- |
| CAP-10 | **Self-Assessment** | خودارزیابی صحت و کامل بودن فرایند انتشار |

---

## ۵. Inputs

| ID    | Input                           | Source          | توضیح                                |
| ----- | ------------------------------- | --------------- | ------------------------------------ |
| IN-01 | **Optimized Content Asset**     | AI-005 (OUT-01) | دارایی محتوایی بهینه‌شده برای انتشار |
| IN-02 | **Media Package**               | AI-006 (OUT-02) | بسته کامل رسانه‌ای                   |
| IN-03 | **Metadata Package (Enhanced)** | AI-005 (OUT-02) | فراداده غنی‌شده برای انتشار          |
| IN-04 | **Accessibility Metadata**      | AI-006 (OUT-06) | فراداده دسترسی                       |
| IN-05 | **Thumbnail Package**           | AI-006 (OUT-05) | تصاویر بندانگشتی                     |
| IN-06 | **Publishing Manifest**         | AI-005, AI-006  | مانیفست آمادگی انتشار                |
| IN-07 | **Approval Decision**           | AI-004 (OUT-03) | تصمیم تأیید نهایی                    |
| IN-08 | **Publication Window**          | AI-002          | پنجره زمانی مجاز انتشار              |

---

## ۶. Outputs

| ID     | Output                       | Consumer                 | توضیح                             |
| ------ | ---------------------------- | ------------------------ | --------------------------------- |
| OUT-01 | **Publishing Package**       | Platforms                | بسته کامل انتشار مختص هر پلتفرم   |
| OUT-02 | **Publication Record**       | KNW, AI-010              | رکورد کامل انتشار دارایی          |
| OUT-03 | **Publishing Queue**         | Orchestrator, Automation | صف انتشار جاری                    |
| OUT-04 | **Publication Receipt**      | AI-002, Human            | رسید تأیید انتشار موفق            |
| OUT-05 | **Publishing Status**        | Orchestrator, AI-010     | وضعیت انتشار هر دارایی            |
| OUT-06 | **Publishing Manifest**      | KNW, Orchestrator        | مانیفست نهایی انتشار              |
| OUT-07 | **Distribution Log**         | KNW, AI-010              | لاگ کامل توزیع برای ممیزی         |
| OUT-08 | **Platform Delivery Report** | Human, AI-010            | گزارش تحویل به هر پلتفرم          |
| OUT-09 | **Failure Report**           | AI-012, Orchestrator     | گزارش خطاهای انتشار               |
| OUT-10 | **Retry Package**            | AI-008 (self)            | بسته انتشار مجدد برای خطاهای موقت |

---

## ۷. Context Requirements

### Global Context (ثابت)

| منبع                       | شناسه         | کاربرد                         |
| -------------------------- | ------------- | ------------------------------ |
| Platform Playbook Standard | PLAT-000      | قالب مادر کتابچه‌های پلتفرم    |
| Platform Playbooks         | PLAT-001..007 | مشخصات فنی و عملیاتی هر پلتفرم |
| Brand Identity             | BRD-001       | هویت برند — تطابق نهایی        |
| Editorial Calendar         | EDT-001       | تقویم تحریریه برای زمان‌بندی   |

### Session Context (متغیر)

| منبع               | شناسه        | کاربرد                            |
| ------------------ | ------------ | --------------------------------- |
| Publishing Package | IN-01..IN-06 | بسته کامل دارایی برای انتشار      |
| Publication Window | IN-08        | پنجره زمانی تعیین‌شده توسط AI-002 |

---

## ۸. Knowledge Requirements

### منابع دانش

| اولویت | منبع    | نحوه دسترسی                  | سطح دسترسی        |
| ------ | ------- | ---------------------------- | ----------------- |
| ۱      | PLAT-\* | مشخصات پلتفرم‌ها             | Read-Only Global  |
| ۲      | AI-002  | برنامه زمان‌بندی و تقویم     | Read-Only Session |
| ۳      | KNW-\*  | تاریخچه انتشار و الگوهای خطا | Read-Only Global  |
| ۴      | BRD-001 | هویت برند                    | Read-Only Global  |

### قواعد دانش

1. PLAT-\* منبع اصلی مشخصات پلتفرم‌ها برای تطبیق انتشار است
2. AI-008 به تاریخچه انتشار قبلی برای تشخیص الگوهای خطا دسترسی دارد
3. AI-008 هرگز محتوای اصلی را ذخیره، تغییر یا تفسیر نمی‌کند
4. AI-008 تمام خطاهای انتشار را برای AI-012 (Improvement) ثبت می‌کند

---

## ۹. Decision Authority

AI-008 در سطح **A-3** (Autonomous, Limited) مطابق ARCH-032 عمل می‌کند.

### حوزه اختیار

| نوع تصمیم        | شناسه  | سطح | توضیح                                |
| ---------------- | ------ | --- | ------------------------------------ |
| **Scheduling**   | DCS-01 | A-3 | تعیین زمان دقیق انتشار در پنجره مجاز |
| **Distribution** | DCS-02 | A-3 | انتخاب پلتفرم و ترتیب انتشار         |
| **Retry**        | DCS-03 | A-3 | تصمیم به تلاش مجدد یا ثبت خطا        |

### تصمیمات مجاز

| ID     | تصمیم              | خودکار | محدودیت                    |
| ------ | ------------------ | ------ | -------------------------- |
| ACT-01 | زمان‌بندی انتشار   | بله    | در پنجره مجاز AI-002       |
| ACT-02 | توزیع به پلتفرم    | بله    | مطابق پلتفرم‌های هدف       |
| ACT-03 | تلاش مجدد انتشار   | بله    | حداکثر ۳ بار               |
| ACT-04 | تولید رکورد انتشار | بله    | بدون محدودیت               |
| ACT-05 | لغو انتشار در صف   | بله    | فقط قبل از ارسال به پلتفرم |

### تصمیمات ممنوع

| ID      | تصمیم ممنوع               | دلیل              |
| ------- | ------------------------- | ----------------- |
| FORB-01 | تغییر محتوای دارایی       | حوزه AI-003       |
| FORB-02 | تغییر فراداده             | حوزه AI-005       |
| FORB-03 | تغییر دارایی رسانه‌ای     | حوزه AI-006       |
| FORB-04 | انتشار خارج از پنجره مجاز | نقض برنامه AI-002 |
| FORB-05 | حذف رکوردهای انتشار       | نقض ممیزی         |

---

## ۱۰. Communication Interfaces

### رویدادهای صادره

| ID     | رویداد                  | علت                       | گیرنده               |
| ------ | ----------------------- | ------------------------- | -------------------- |
| EVT-01 | `publication.scheduled` | انتشار زمان‌بندی شد       | Orchestrator, AI-002 |
| EVT-02 | `publication.success`   | انتشار با موفقیت انجام شد | Orchestrator, AI-010 |
| EVT-03 | `publication.failed`    | انتشار با خطا مواجه شد    | Orchestrator, AI-012 |
| EVT-04 | `publication.retrying`  | تلاش مجدد برای انتشار     | Orchestrator         |
| EVT-05 | `publication.completed` | همه انتشارات تکمیل شد     | Orchestrator, Human  |

### رویدادهای وارده

| ID     | رویداد                      | فرستنده | عکس‌العمل                    |
| ------ | --------------------------- | ------- | ---------------------------- |
| EVT-06 | `discoverability.optimized` | AI-005  | دریافت دارایی برای انتشار    |
| EVT-07 | `media.packaged`            | AI-006  | دریافت بسته رسانه‌ای         |
| EVT-08 | `plan.updated`              | AI-002  | به‌روزرسانی برنامه زمان‌بندی |

---

## ۱۱. Collaboration Matrix

### مصرف‌کنندگان

| Agent           | شناسه    | خروجی دریافتی                                                           |
| --------------- | -------- | ----------------------------------------------------------------------- |
| **Platforms**   | External | OUT-01 (Publishing Package)                                             |
| **Analytics**   | AI-010   | OUT-02 (Publication Record), OUT-05 (Status), OUT-07 (Distribution Log) |
| **Improvement** | AI-012   | OUT-09 (Failure Report)                                                 |

### تأمین‌کنندگان

| Agent               | شناسه  | ورودی ارسالی                                                    |
| ------------------- | ------ | --------------------------------------------------------------- |
| **Discoverability** | AI-005 | IN-01 (Optimized Content Asset), IN-03 (Metadata)               |
| **Media**           | AI-006 | IN-02 (Media Package), IN-04 (Accessibility), IN-05 (Thumbnail) |

### همکاران

| Agent         | شناسه  | نوع همکاری                                  |
| ------------- | ------ | ------------------------------------------- |
| **Knowledge** | AI-011 | ذخیره Publication Record و Distribution Log |

---

## ۱۲. Delegation Rules

| نوع           | شناسه  | توضیح                                                   |
| ------------- | ------ | ------------------------------------------------------- |
| **Merge**     | DLG-01 | AI-005 و AI-006 خروجی خود را به AI-008 می‌دهند (ادغام)  |
| **Direct**    | DLG-02 | Orchestrator دستور انتشار فوری یک دارایی را می‌دهد      |
| **Broadcast** | DLG-03 | AI-008 پس از انتشار، وضعیت را به Platforms و KNW می‌دهد |

### مسیر Delegation

```
AI-005 ──┐
         ├──→ AI-008 (Publishing & Distribution)  ← این Agent
AI-006 ──┘        │
                  ├──→ Platforms (External)
                  └──→ KNW / AI-010 (Records)
```

---

## ۱۳. Escalation Rules

| ID     | شرط                              | سطح | اقدام                               |
| ------ | -------------------------------- | --- | ----------------------------------- |
| ESC-01 | پلتفرم مقصد در دسترس نیست        | E-1 | تلاش مجدد با backoff                |
| ESC-02 | خطای احراز هویت پلتفرم           | E-2 | اطلاع به تیم فنی                    |
| ESC-03 | رد دارایی توسط پلتفرم            | E-2 | اطلاع به Content Manager            |
| ESC-04 | خطای سیستمی مداوم (بیش از ۳ بار) | E-2 | توقف انتشار و اطلاع به Orchestrator |
| ESC-05 | انتشار خارج از پنجره مجاز        | E-3 | ارجاع به AI-002                     |

---

## ۱۴. Human Override

| نوع                    | شناسه  | شرایط                      | سطح مجاز         |
| ---------------------- | ------ | -------------------------- | ---------------- |
| **Soft Override**      | OVR-01 | تغییر زمان انتشار در صف    | Content Manager  |
| **Hard Override**      | OVR-02 | لغو انتشار دارایی از صف    | Content Director |
| **Emergency Override** | OVR-03 | توقف همه انتشارات در بحران | Media Director   |

### فرایند Override

1. AI-008 دارایی را در صف انتشار قرار می‌دهد
2. انسان صف انتشار یا گزارش خطا را بررسی می‌کند
3. Soft Override: تنظیم مجدد زمان
4. Hard Override: حذف دارایی از صف
5. Emergency Override: توقف کامل صف
6. همه Overrideها در Distribution Log ثبت می‌شوند

---

## ۱۵. KPIs

| ID     | KPI                          | واحد                                 | هدف        | منبع   |
| ------ | ---------------------------- | ------------------------------------ | ---------- | ------ |
| KPI-01 | **Publication Success Rate** | % انتشار موفق از کل تلاش‌ها          | >= ۹۸٪     | OUT-02 |
| KPI-02 | **Publishing Latency**       | زمان متوسط از زمان‌بندی تا انتشار    | <= ۵ دقیقه | System |
| KPI-03 | **Retry Success**            | % انتشار موفق پس از تلاش مجدد        | >= ۹۵٪     | OUT-09 |
| KPI-04 | **Platform Coverage**        | % پلتفرم‌های هدف دریافت‌کننده دارایی | ۱۰۰٪       | OUT-08 |
| KPI-05 | **Publishing Accuracy**      | % دارایی‌های منتشرشده مطابق برنامه   | >= ۹۹٪     | OUT-02 |
| KPI-06 | **Scheduling Accuracy**      | % انتشار در زمان تعیین‌شده           | >= ۹۵٪     | System |
| KPI-07 | **Failed Publication Rate**  | % دارایی‌های با انتشار ناموفق نهایی  | <= ۱٪      | OUT-09 |
| KPI-08 | **Queue Health**             | متوسط طول صف انتشار                  | <= ۵۰      | System |
| KPI-09 | **Automation Coverage**      | % انتشار خودکار بدون مداخله انسان    | >= ۹۵٪     | System |
| KPI-10 | **Distribution Completion**  | % انتشار کامل در همه پلتفرم‌های هدف  | >= ۹۸٪     | OUT-08 |

---

## ۱۶. Validation Rules

| ID    | قانون                                             | نقض               | عکس‌العمل       |
| ----- | ------------------------------------------------- | ----------------- | --------------- |
| VR-01 | بسته انتشار شامل همه اجزای مورد نیاز است          | نقص بسته          | توقف انتشار     |
| VR-02 | دارایی تأیید نهایی (AI-004) را دارد               | عدم تأیید         | توقف انتشار     |
| VR-03 | زمان انتشار در پنجره مجاز AI-002 است              | خارج از پنجره     | تنظیم مجدد      |
| VR-04 | پلتفرم مقصد در نقشه راه فعال است                  | پلتفرم غیرفعال    | حذف از توزیع    |
| VR-05 | محتوای دارایی از آخرین بازبینی تغییری نکرده است   | تغییر غیرمجاز     | Escalation      |
| VR-06 | فراداده کامل و مطابق استاندارد انتشار است         | نقص فراداده       | تکمیل           |
| VR-07 | همه دارایی‌های رسانه‌ای در بسته موجود هستند       | دارایی缺失        | اطلاع به AI-006 |
| VR-08 | رکورد انتشار برای ممیزی ثبت شده است               | عدم ثبت           | تکمیل           |
| VR-09 | لاگ توزیع کامل و بدون شکاف است                    | نقص لاگ           | تکمیل           |
| VR-10 | خطاهای انتشار طبقه‌بندی و گزارش شده‌اند           | خطای ثبت‌نشده     | تکمیل           |
| VR-11 | همه پلتفرم‌های هدف تأیید تحویل را برگردانده‌اند   | عدم تأیید         | تلاش مجدد       |
| VR-12 | بسته انتشار مجدد (Retry) با بسته اصلی مطابقت دارد | عدم تطابق         | بازسازی         |
| VR-13 | مانیفست انتشار با محتوای واقعی مطابقت دارد        | عدم تطابق         | اصلاح مانیفست   |
| VR-14 | خودارزیابی کامل و صادقانه است                     | ناقص              | تکمیل           |
| VR-15 | هیچ دستور Override فعال بدون ثبت وجود ندارد       | Override ثبت‌نشده | تکمیل لاگ       |

---

## ۱۷. Quality Gates

هر Publishing Package (IN-01..IN-08) قبل از ارسال از ۵ گیت کیفیت عبور می‌کند:

```
IN-01..IN-08 (Publishing Package)
  │
  ▼
GATE-1: Package Completeness
  │  بررسی: همه اجزا موجود هستند
  │
  ▼
GATE-2: Approval Verification
  │  بررسی: تأیید نهایی AI-004 موجود است
  │
  ▼
GATE-3: Schedule Compliance
  │  بررسی: زمان انتشار در پنجره مجاز
  │
  ▼
GATE-4: Platform Readiness
  │  بررسی: پلتفرم‌های هدف در دسترس
  │
  ▼
GATE-5: Self-Assessment
  │  بررسی: خودارزیابی کامل
  │
  ▼
Platform Distribution
```

| ID         | Gate                  | معیار عبور                     | عکس‌العمل در رد      |
| ---------- | --------------------- | ------------------------------ | -------------------- |
| **GATE-1** | Package Completeness  | همه IN-01..IN-08 موجود و معتبر | تکمیل بسته           |
| **GATE-2** | Approval Verification | تأیید AI-004 موجود است         | توقف تا دریافت تأیید |
| **GATE-3** | Schedule Compliance   | زمان در پنجره مجاز             | تنظیم مجدد زمان      |
| **GATE-4** | Platform Readiness    | پلتفرم‌ها در دسترس             | تلاش مجدد یا صف      |
| **GATE-5** | Self-Assessment       | خودارزیابی کامل                | تجدید                |

---

## ۱۸. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "agent": {
    "id": "AI-008",
    "name": "Enterprise Publishing & Distribution Agent",
    "type": "specialist",
    "family": "FAM-03",
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
    "core": { "id": "CAP-01", "name": "Publication & Distribution" },
    "supporting": [
      { "id": "CAP-02", "name": "Queue Management" },
      { "id": "CAP-03", "name": "Platform Routing" },
      { "id": "CAP-04", "name": "Retry Orchestration" },
      { "id": "CAP-05", "name": "Delivery Verification" },
      { "id": "CAP-06", "name": "Failure Classification" },
      { "id": "CAP-07", "name": "Audit Logging" }
    ],
    "collaborative": [
      { "id": "CAP-08", "name": "Publishing Package Intake", "target": "AI-005" },
      { "id": "CAP-09", "name": "Platform Notification", "target": "External" }
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
      { "id": "RSP-01", "name": "Publication Scheduling" },
      { "id": "RSP-02", "name": "Platform Distribution" },
      { "id": "RSP-03", "name": "Multi-Platform Coordination" },
      { "id": "RSP-04", "name": "Publication Retry" },
      { "id": "RSP-05", "name": "Publication Record" },
      { "id": "RSP-06", "name": "Publishing Queue Management" },
      { "id": "RSP-07", "name": "Platform Delivery Verification" },
      { "id": "RSP-08", "name": "Failure Handling" },
      { "id": "RSP-09", "name": "Distribution Log" },
      { "id": "RSP-10", "name": "Platform Status Monitoring" },
      { "id": "RSP-11", "name": "Publication Receipt Generation" },
      { "id": "RSP-12", "name": "Publishing Manifest Generation" },
      { "id": "RSP-13", "name": "Retry Package Preparation" }
    ],
    "secondary": [
      { "id": "RSP-14", "name": "Publishing Window Optimization" },
      { "id": "RSP-15", "name": "Platform-Specific Adaptation Logging" }
    ],
    "non_responsibility": [
      { "id": "NRS-01", "name": "Content Creation" },
      { "id": "NRS-02", "name": "Content Rewriting" },
      { "id": "NRS-03", "name": "Quality Review" },
      { "id": "NRS-04", "name": "SEO Optimization" },
      { "id": "NRS-05", "name": "Media Production" },
      { "id": "NRS-06", "name": "Analytics" },
      { "id": "NRS-07", "name": "Brand Governance" },
      { "id": "NRS-08", "name": "Content Strategy" },
      { "id": "NRS-09", "name": "Community Management" },
      { "id": "NRS-10", "name": "Strategic Planning" }
    ]
  }
}
```

### Block 4 — Inputs & Outputs

```json
{
  "inputs": {
    "IN-01": { "name": "Optimized Content Asset", "source": "AI-005" },
    "IN-02": { "name": "Media Package", "source": "AI-006" },
    "IN-03": { "name": "Metadata Package (Enhanced)", "source": "AI-005" },
    "IN-04": { "name": "Accessibility Metadata", "source": "AI-006" },
    "IN-05": { "name": "Thumbnail Package", "source": "AI-006" },
    "IN-06": { "name": "Publishing Manifest", "source": "AI-005, AI-006" },
    "IN-07": { "name": "Approval Decision", "source": "AI-004" },
    "IN-08": { "name": "Publication Window", "source": "AI-002" }
  },
  "outputs": {
    "OUT-01": { "name": "Publishing Package", "consumers": ["Platforms"] },
    "OUT-02": { "name": "Publication Record", "consumers": ["KNW", "AI-010"] },
    "OUT-03": { "name": "Publishing Queue", "consumers": ["Orchestrator", "Automation"] },
    "OUT-04": { "name": "Publication Receipt", "consumers": ["AI-002", "Human"] },
    "OUT-05": { "name": "Publishing Status", "consumers": ["Orchestrator", "AI-010"] },
    "OUT-06": { "name": "Publishing Manifest", "consumers": ["KNW", "Orchestrator"] },
    "OUT-07": { "name": "Distribution Log", "consumers": ["KNW", "AI-010"] },
    "OUT-08": { "name": "Platform Delivery Report", "consumers": ["Human", "AI-010"] },
    "OUT-09": { "name": "Failure Report", "consumers": ["AI-012", "Orchestrator"] },
    "OUT-10": { "name": "Retry Package", "consumers": ["AI-008"] }
  }
}
```

### Block 5 — Events

```json
{
  "events": {
    "published": [
      "EVT-01": "publication.scheduled",
      "EVT-02": "publication.success",
      "EVT-03": "publication.failed",
      "EVT-04": "publication.retrying",
      "EVT-05": "publication.completed"
    ],
    "subscribed": [
      "EVT-06": "discoverability.optimized",
      "EVT-07": "media.packaged",
      "EVT-08": "plan.updated"
    ]
  }
}
```

### Block 6 — KPIs

```json
{
  "kpis": [
    { "id": "KPI-01", "name": "Publication Success Rate", "target": ">= 98%" },
    { "id": "KPI-02", "name": "Publishing Latency", "target": "<= 5 min" },
    { "id": "KPI-03", "name": "Retry Success", "target": ">= 95%" },
    { "id": "KPI-04", "name": "Platform Coverage", "target": "100%" },
    { "id": "KPI-05", "name": "Publishing Accuracy", "target": ">= 99%" },
    { "id": "KPI-06", "name": "Scheduling Accuracy", "target": ">= 95%" },
    { "id": "KPI-07", "name": "Failed Publication Rate", "target": "<= 1%" },
    { "id": "KPI-08", "name": "Queue Health", "target": "<= 50" },
    { "id": "KPI-09", "name": "Automation Coverage", "target": ">= 95%" },
    { "id": "KPI-10", "name": "Distribution Completion", "target": ">= 98%" }
  ]
}
```

---

> **AI-008 هشتمین Agent مشخص SMOS — عامل انتشار و توزیع سازمانی. نخستین Agent از خانواده Operations (FAM-03). آخرین حلقه زنجیره تولید تا انتشار. مشتق از AI-000، مصرف‌کننده AI-005 و AI-006.**
