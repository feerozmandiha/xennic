# Media Asset Production Agent Architecture — معماری عامل تولید دارایی رسانه SMOS

> **شناسه:** AI-006
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-27
> **مسئول:** معمار سیستم
> **وابستگی:** [AI-000](00-enterprise-ai-agent-architecture.md), [AI-005](50-search-discoverability-agent.md), [BRD-001](../22-BRAND/10-brand-identity.md), [BRD-002](../22-BRAND/20-brand-voice.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** human, ai-agent, mcp, workflow-engine

---

## ۱. Identity

AI-006 ششمین Agent مشخص از معماری AI-000 و عامل اصلی تولید دارایی‌های رسانه‌ای SMOS است.

### هویت

| بعد                   | مقدار                        |
| --------------------- | ---------------------------- |
| **Agent ID**          | AI-006                       |
| **Canonical Name**    | Media Asset Production Agent |
| **Agent Type**        | Specialist (AT-01)           |
| **Family**            | Content (FAM-02)             |
| **Authority Level**   | A-3 (Autonomous, Limited)    |
| **Operational Layer** | Execution (LYR-03)           |
| **Version**           | 1.0.0-draft                  |
| **Status**            | draft                        |

### موقعیت در معماری

AI-006 پس از AI-005 (Discoverability) و پیش از AI-008 (Publishing) قرار دارد. دارایی‌های بهینه‌شده متنی را به دارایی‌های رسانه‌ای قابل استفاده مجدد تبدیل می‌کند.

```
AI-003 (Production) → AI-004 (Review) → AI-005 (Discovery)
  │  OUT-01 (Optimized Content Asset)
  ▼
AI-006 (Media Asset Production)  ← این Agent
  │  OUT-01 (Media Asset)
  ├──→ AI-008 (Publishing)
  └──→ Media Repository
```

---

## ۲. Mission

ماموریت AI-006 تبدیل دارایی‌های محتوایی متعارف بهینه‌شده به دارایی‌های رسانه‌ای قابل استفاده مجدد است.

این Agent محدود به گرافیک نیست. لایه تولید رسانه سازمانی است. معماری باید از انواع رسانه کنونی و آینده بدون نیاز به بازطراحی پشتیبانی کند.

### بیانیه ماموریت

> AI-006 دارایی‌های محتوایی بهینه‌شده توسط AI-005 را به دارایی‌های رسانه‌ای مستقل از پلتفرم تبدیل می‌کند. تصاویر، گرافیک‌ها، نمودارها، اینفوگرافیک‌ها، ارائه‌ها و اسناد را متناسب با هویت برند BRD-001 تولید می‌کند. خروجی AI-006 کاملاً مستقل از پلتفرم است و از طریق AI-008 برای کانال‌های مختلف تطبیق داده می‌شود.

---

## ۳. Responsibilities

### Primary Responsibilities

| ID     | Responsibility                    | توضیح                                                   |
| ------ | --------------------------------- | ------------------------------------------------------- |
| RSP-01 | **Media Asset Planning**          | برنامه‌ریزی دارایی‌های رسانه‌ای مورد نیاز برای هر محتوا |
| RSP-02 | **Image Asset Generation**        | تولید دارایی‌های تصویری مستقل از فرمت                   |
| RSP-03 | **Graphic Asset Generation**      | تولید گرافیک‌های اطلاعاتی و ارتباطی                     |
| RSP-04 | **Diagram Generation**            | تولید نمودارها و دیاگرام‌های مفهومی                     |
| RSP-05 | **Illustration Production**       | تولید تصاویر مفهومی متناسب با برند                      |
| RSP-06 | **Infographic Production**        | تولید اینفوگرافیک از محتوای ساختاریافته                 |
| RSP-07 | **Presentation Asset Generation** | تولید دارایی‌های ارائه (اسلاید، مستند)                  |
| RSP-08 | **Document Asset Packaging**      | بسته‌بندی اسناد قابل ارائه                              |
| RSP-09 | **Thumbnail Preparation**         | تولید تصاویر بندانگشتی برای جستجو و اشتراک              |
| RSP-10 | **Media Metadata Generation**     | تولید فراداده استاندارد برای هر دارایی رسانه‌ای         |
| RSP-11 | **Media Consistency**             | حفظ انسجام بصری در سراسر دارایی‌های رسانه‌ای            |
| RSP-12 | **Media Quality**                 | تضمین کیفیت فنی و زیبایی‌شناختی دارایی‌ها               |
| RSP-13 | **Asset Catalog Registration**    | ثبت دارایی در کاتالگ دارایی‌های رسانه‌ای                |

### Non-Responsibilities

| ID     | Non-Responsibility         | دلیل              |
| ------ | -------------------------- | ----------------- |
| NRS-01 | **Content Strategy**       | حوزه AI-001       |
| NRS-02 | **Editorial Planning**     | حوزه AI-002       |
| NRS-03 | **Content Writing**        | حوزه AI-003       |
| NRS-04 | **Quality Approval**       | حوزه AI-004       |
| NRS-05 | **Publishing**             | حوزه AI-008       |
| NRS-06 | **Video Production**       | حوزه AI-007       |
| NRS-07 | **Community Management**   | حوزه Human        |
| NRS-07 | **Analytics**              | حوزه AI-010       |
| NRS-08 | **Workflow Orchestration** | حوزه Orchestrator |
| NRS-09 | **Brand Governance**       | حوزه Human        |
| NRS-10 | **SEO Optimization**       | حوزه AI-005       |

---

## ۴. Capabilities

### Core Capability

| ID     | Capability                 | توضیح                                              |
| ------ | -------------------------- | -------------------------------------------------- |
| CAP-01 | **Media Asset Production** | تولید دارایی‌های رسانه‌ای از محتوای متنی بهینه‌شده |

### Supporting Capabilities

| ID     | Capability               | توضیح                                            |
| ------ | ------------------------ | ------------------------------------------------ |
| CAP-02 | **Asset Planning**       | برنامه‌ریزی خودکار دارایی‌های مورد نیاز          |
| CAP-03 | **Visual Composition**   | ترکیب بصری مطابق هویت برند BRD-001               |
| CAP-04 | **Format Adaptation**    | تطبیق برای انواع رسانه (تصویر، گرافیک، ارائه)    |
| CAP-05 | **Thumbnail Generation** | تولید خودکار تصاویر بندانگشتی                    |
| CAP-06 | **Media Metadata**       | تولید فراداده استاندارد برای دارایی‌های رسانه‌ای |
| CAP-07 | **Quality Assurance**    | ارزیابی کیفیت فنی و بصری                         |

### Collaborative Capabilities

| ID     | Capability                      | Partner | توضیح                           |
| ------ | ------------------------------- | ------- | ------------------------------- |
| CAP-08 | **Asset Intake from Discovery** | AI-005  | دریافت دارایی محتوایی بهینه‌شده |
| CAP-09 | **Media Package Handoff**       | AI-008  | تحویل بسته رسانه‌ای کامل        |

### Reflexive Capability

| ID     | Capability          | توضیح                                              |
| ------ | ------------------- | -------------------------------------------------- |
| CAP-10 | **Self-Assessment** | خودارزیابی کیفیت بصری، انسجام برند و آمادگی انتشار |

---

## ۵. Inputs

| ID    | Input                           | Source           | توضیح                                           |
| ----- | ------------------------------- | ---------------- | ----------------------------------------------- |
| IN-01 | **Optimized Content Asset**     | AI-005 (OUT-01)  | دارایی محتوایی بهینه‌شده برای تولید رسانه       |
| IN-02 | **Metadata Package (Enhanced)** | AI-005 (OUT-02)  | فراداده غنی‌شده با داده‌های ساختاریافته         |
| IN-03 | **Review Report**               | AI-004 (OUT-01)  | گزارش بازبینی برای نیازهای رسانه‌ای             |
| IN-04 | **Brand Identity**              | BRD-001          | هویت برند — رنگ، فونت، فضاهای بصری (مرجع ثابت)  |
| IN-05 | **Brand Voice Guidelines**      | BRD-002          | صدای برند — تطابق بصری با کلام (مرجع ثابت)      |
| IN-06 | **Media Guidelines**            | EDT-001, BRD-001 | دستورالعمل‌های رسانه‌ای (مرجع ثابت)             |
| IN-07 | **Knowledge Repository**        | KNW-\*           | الگوهای رسانه‌ای و دارایی‌های موجود (مرجع ثابت) |

---

## ۶. Outputs

| ID     | Output                     | Consumer                 | توضیح                                |
| ------ | -------------------------- | ------------------------ | ------------------------------------ |
| OUT-01 | **Media Asset**            | AI-008, Media Repository | دارایی رسانه‌ای اصلی (مستقل از فرمت) |
| OUT-02 | **Media Package**          | AI-008                   | بسته کامل رسانه‌ای شامل انواع خروجی  |
| OUT-03 | **Asset Manifest**         | AI-008, Orchestrator     | مانیفست دارایی‌های تولیدی            |
| OUT-04 | **Asset Metadata**         | Media Repository, KNW    | فراداده استاندارد دارایی رسانه‌ای    |
| OUT-05 | **Thumbnail Package**      | AI-008, Media Repository | مجموعه تصاویر بندانگشتی              |
| OUT-06 | **Accessibility Metadata** | AI-008, KNW              | فراداده دسترسی (Alt Text، توضیحات)   |
| OUT-07 | **Media Quality Report**   | AI-004, KNW              | گزارش کیفیت فنی و بصری               |
| OUT-08 | **Catalog Entry**          | Media Repository         | ورود دارایی در کاتالگ مرکزی          |

---

## ۷. Context Requirements

### Global Context (ثابت)

| منبع             | شناسه            | کاربرد                                     |
| ---------------- | ---------------- | ------------------------------------------ |
| Brand Identity   | BRD-001          | رنگ، تایپوگرافی، فضاهای بصری، الگوهای برند |
| Brand Voice      | BRD-002          | تطابق بصری با زبان و تن برند               |
| Media Guidelines | EDT-001, BRD-001 | استانداردهای کیفی رسانه‌ای                 |
| Content Taxonomy | EDT-002          | تطابق نوع محتوا با نوع رسانه               |

### Session Context (متغیر)

| منبع                    | شناسه | کاربرد                       |
| ----------------------- | ----- | ---------------------------- |
| Optimized Content Asset | IN-01 | محتوای مبدأ برای تولید رسانه |
| Metadata Package        | IN-02 | فراداده برای تطبیق رسانه‌ای  |

---

## ۸. Knowledge Requirements

### منابع دانش

| اولویت | منبع             | نحوه دسترسی                         | سطح دسترسی       |
| ------ | ---------------- | ----------------------------------- | ---------------- |
| ۱      | BRD-001          | هویت برند — SSOT بصری               | Read-Only Global |
| ۲      | BRD-002          | صدای برند — تطابق کلام و تصویر      | Read-Only Global |
| ۳      | EDT-001, EDT-002 | قواعد تحریریه                       | Read-Only Global |
| ۴      | KNW-\*           | الگوهای رسانه‌ای و دارایی‌های موجود | Read-Only Global |
| ۵      | Media Repository | کاتالگ دارایی‌های رسانه‌ای          | Read-Only Global |

### قواعد دانش

1. BRD-001 منبع اصلی همه تصمیمات بصری است
2. همه دارایی‌های رسانه‌ای باید با BRD-001 و BRD-002 تطابق داشته باشند
3. دارایی‌های تولیدی در Media Repository ثبت می‌شوند
4. AI-006 از دارایی‌های موجود در Media Repository برای جلوگیری از بازتولید استفاده می‌کند
5. AI-006 هرگز BRD-001 یا BRD-002 را تغییر نمی‌دهد

---

## ۹. Decision Authority

AI-006 در سطح **A-3** (Autonomous, Limited) مطابق ARCH-032 عمل می‌کند.

### حوزه اختیار

| نوع تصمیم   | شناسه  | سطح | توضیح                                                  |
| ----------- | ------ | --- | ------------------------------------------------------ |
| **Visual**  | DCS-01 | A-3 | انتخاب سبک بصری، ترکیب‌بندی، پالت رنگ درون چارچوب برند |
| **Format**  | DCS-02 | A-3 | انتخاب نوع رسانه متناسب با محتوا                       |
| **Catalog** | DCS-03 | A-3 | ثبت دارایی در کاتالگ با فراداده استاندارد              |

### تصمیمات مجاز

| ID     | تصمیم                  | خودکار | محدودیت                              |
| ------ | ---------------------- | ------ | ------------------------------------ |
| ACT-01 | انتخاب نوع رسانه       | بله    | مطابق CT-ID و هدف محتوا              |
| ACT-02 | تعیین ترکیب بصری       | بله    | در چارچوب BRD-001                    |
| ACT-03 | انتخاب پالت رنگ        | بله    | فقط از پالت BRD-001                  |
| ACT-04 | تولید فراداده رسانه‌ای | بله    | مطابق استاندارد                      |
| ACT-05 | ثبت در کاتالگ          | بله    | بدون ایجاد تغییر در دارایی‌های موجود |

### تصمیمات ممنوع

| ID      | تصمیم ممنوع                 | دلیل        |
| ------- | --------------------------- | ----------- |
| FORB-01 | تغییر هویت برند BRD-001     | حوزه انسانی |
| FORB-02 | انتشار دارایی               | حوزه AI-008 |
| FORB-03 | تغییر محتوای متنی اصلی      | حوزه AI-003 |
| FORB-04 | حذف دارایی از کاتالگ        | حوزه انسانی |
| FORB-05 | استفاده از سبک خارج از برند | نقض BRD-001 |

---

## ۱۰. Communication Interfaces

### رویدادهای صادره

| ID     | رویداد                   | علت                         | گیرنده           |
| ------ | ------------------------ | --------------------------- | ---------------- |
| EVT-01 | `media.produced`         | دارایی رسانه‌ای تولید شد    | Orchestrator     |
| EVT-02 | `media.packaged`         | بسته رسانه‌ای کامل شد       | AI-008           |
| EVT-03 | `media.catalogued`       | دارایی در کاتالگ ثبت شد     | Media Repository |
| EVT-04 | `media.quality_assessed` | کیفیت رسانه ارزیابی شد      | KNW, AI-004      |
| EVT-05 | `media.failed`           | تولید رسانه با خطا مواجه شد | Orchestrator     |

### رویدادهای وارده

| ID     | رویداد                      | فرستنده | عکس‌العمل                               |
| ------ | --------------------------- | ------- | --------------------------------------- |
| EVT-06 | `discoverability.optimized` | AI-005  | آغاز تولید رسانه برای دارایی بهینه‌شده  |
| EVT-07 | `readiness.scored`          | AI-005  | دریافت امتیاز آمادگی و شروع تولید       |
| EVT-08 | `asset.approved`            | AI-004  | دریافت دارایی تأییدشده برای تولید رسانه |

---

## ۱۱. Collaboration Matrix

### مصرف‌کنندگان

| Agent          | شناسه  | خروجی دریافتی                                                                            |
| -------------- | ------ | ---------------------------------------------------------------------------------------- |
| **Publishing** | AI-008 | OUT-01 (Media Asset), OUT-02 (Media Package), OUT-05 (Thumbnail), OUT-06 (Accessibility) |
| **Knowledge**  | AI-011 | OUT-04 (Asset Metadata), OUT-06 (Accessibility Metadata)                                 |

### تأمین‌کنندگان

| Agent               | شناسه  | ورودی ارسالی                                                       |
| ------------------- | ------ | ------------------------------------------------------------------ |
| **Discoverability** | AI-005 | IN-01 (Optimized Content Asset), IN-02 (Metadata Package Enhanced) |
| **Review**          | AI-004 | IN-03 (Review Report)                                              |

### همکاران

| Agent                | شناسه    | نوع همکاری                          |
| -------------------- | -------- | ----------------------------------- |
| **Media Repository** | External | ذخیره و بازیابی دارایی‌های رسانه‌ای |

---

## ۱۲. Delegation Rules

| نوع           | شناسه  | توضیح                                                            |
| ------------- | ------ | ---------------------------------------------------------------- |
| **Chain**     | DLG-01 | AI-005 پس از بهینه‌سازی، دارایی را به AI-006 واگذار می‌کند       |
| **Direct**    | DLG-02 | Orchestrator دستور تولید رسانه برای یک دارایی خاص را می‌دهد      |
| **Broadcast** | DLG-03 | AI-006 پس از اتمام، خروجی را به AI-008 و Media Repository می‌دهد |

### مسیر Delegation

```
AI-005 (Discoverability)
  │
  ▼
AI-006 (Media Asset Production)  ← این Agent
  │
  ├──→ AI-008 (Publishing)
  └──→ Media Repository
```

---

## ۱۳. Escalation Rules

| ID     | شرط                                       | سطح | اقدام                       |
| ------ | ----------------------------------------- | --- | --------------------------- |
| ESC-01 | دارایی رسانه‌ای خارج از هویت برند BRD-001 | E-2 | اطلاع به Brand Manager      |
| ESC-02 | نیاز به دارایی غیراستاندارد یا سفارشی     | E-2 | ارجاع به تیم خلاق           |
| ESC-03 | تعارض در فراداده رسانه‌ای با دارایی موجود | E-1 | اطلاع به معمار دانش         |
| ESC-04 | کیفیت فنی پایین‌تر از آستانه قابل قبول    | E-1 | بازتولید با پارامترهای جدید |
| ESC-05 | دارایی تکراری با رکورد موجود در کاتالگ    | E-1 | اطلاع به Orchestrator       |

---

## ۱۴. Human Override

| نوع                    | شناسه  | شرایط                                      | سطح مجاز          |
| ---------------------- | ------ | ------------------------------------------ | ----------------- |
| **Soft Override**      | OVR-01 | اصلاح دستی ترکیب بصری یا انتخاب نوع رسانه  | Content Manager   |
| **Hard Override**      | OVR-02 | جایگزینی کامل دارایی AI-006 با دارایی دستی | Creative Director |
| **Emergency Override** | OVR-03 | توقف تولید رسانه در بحران برند             | Media Director    |

### فرایند Override

1. AI-006 دارایی رسانه‌ای را تولید و ارزیابی می‌کند
2. انسان گزارش کیفیت (OUT-07) را بررسی می‌کند
3. Soft Override: اصلاح جزئی ترکیب بصری
4. Hard Override: جایگزینی با دارایی تولیدشده توسط انسان
5. همه Overrideها در Audit Log ثبت می‌شوند

---

## ۱۵. KPIs

| ID     | KPI                         | واحد                                    | هدف          | منبع             |
| ------ | --------------------------- | --------------------------------------- | ------------ | ---------------- |
| KPI-01 | **Media Production Volume** | تعداد دارایی‌های تولیدی / دوره          | مطابق برنامه | OUT-08           |
| KPI-02 | **Brand Visual Compliance** | % تطابق با BRD-001                      | >= ۹۵٪       | OUT-07           |
| KPI-03 | **Reusability Rate**        | % دارایی‌های قابل استفاده در چند پلتفرم | >= ۷۰٪       | Media Repository |
| KPI-04 | **Catalog Coverage**        | % دارایی‌های ثبت‌شده در کاتالگ          | ۱۰۰٪         | OUT-08           |
| KPI-05 | **Metadata Completeness**   | % دارایی‌های با فراداده کامل            | ۱۰۰٪         | OUT-04           |
| KPI-06 | **Accessibility Coverage**  | % دارایی‌های دارای فراداده دسترسی       | >= ۹۰٪       | OUT-06           |
| KPI-07 | **Quality Score**           | امتیاز متوسط کیفیت فنی و بصری (۱-۵)     | >= ۴         | OUT-07           |
| KPI-08 | **Thumbnail Availability**  | % محتواهای دارای تصویر بندانگشتی        | ۱۰۰٪         | OUT-05           |
| KPI-09 | **On-Time Delivery**        | % تحویل به‌موقع مطابق برنامه            | >= ۹۰٪       | System           |
| KPI-10 | **Escalation Rate**         | % موارد ارجاع‌شده به انسان              | <= ۱۰٪       | System           |

---

## ۱۶. Validation Rules

| ID    | قانون                                                  | نقض                    | عکس‌العمل     |
| ----- | ------------------------------------------------------ | ---------------------- | ------------- |
| VR-01 | دارایی رسانه‌ای با BRD-001 (رنگ، فونت، فضا) تطابق دارد | نقض هویت بصری          | اصلاح         |
| VR-02 | دارایی با صدای برند BRD-002 سازگار است                 | ناسازگاری کلام و تصویر | اصلاح         |
| VR-03 | فراداده کامل و مطابق استاندارد است                     | نقص فراداده            | تکمیل خودکار  |
| VR-04 | دارایی از نظر فنی معتبر است                            | نقص فنی                | بازتولید      |
| VR-05 | دارایی در کاتالگ تکراری نیست                           | تکرار                  | اطلاع + ادغام |
| VR-06 | نوع رسانه با CT-ID محتوا سازگار است                    | ناسازگاری              | انتخاب مجدد   |
| VR-07 | دارایی مستقل از پلتفرم است                             | وابستگی به پلتفرم      | اصلاح         |
| VR-08 | ابعاد و نسبت‌ها در محدوده استاندارد است                | خارج از استاندارد      | اصلاح         |
| VR-09 | فراداده دسترسی (Alt Text) کامل است                     | فقدان فراداده دسترسی   | تکمیل         |
| VR-10 | دارایی فاقد محتوای حساس یا ممنوع است                   | محتوای حساس            | Escalation    |
| VR-11 | نسخه thumbnail از دارایی اصلی مشتق شده است             | عدم تطابق              | بازتولید      |
| VR-12 | مانیفست دارایی کامل است                                | نقص مانیفست            | تکمیل         |
| VR-13 | گزارش کیفیت خودارزیابی کامل است                        | ناقص                   | تجدید         |
| VR-14 | دارایی با استراتژی محتوای AI-001 هماهنگ است            | عدم هماهنگی            | اطلاع         |
| VR-15 | همه بلوک‌های رسانه‌ای قابل استفاده مجدد هستند          | وابستگی به زمینه       | بازسازی       |

---

## ۱۷. Quality Gates

هر Optimized Content Asset (IN-01) قبل از تحویل از ۵ گیت کیفیت عبور می‌کند:

```
IN-01 (Optimized Content Asset)
  │
  ▼
GATE-1: Brand Visual Compliance
  │  بررسی: تطابق با BRD-001 (رنگ، فونت، فضا)
  │
  ▼
GATE-2: Technical Quality
  │  بررسی: کیفیت فنی، ابعاد، نسبت‌ها
  │
  ▼
GATE-3: Metadata Readiness
  │  بررسی: فراداده استاندارد + دسترسی
  │
  ▼
GATE-4: Reusability Check
  │  بررسی: قابلیت استفاده مجدد مستقل از پلتفرم
  │
  ▼
GATE-5: Self-Assessment
  │  بررسی: خودارزیابی کامل
  │
  ▼
OUT-01 (Media Asset)
```

| ID         | Gate                    | معیار عبور              | عکس‌العمل در رد |
| ---------- | ----------------------- | ----------------------- | --------------- |
| **GATE-1** | Brand Visual Compliance | تطابق کامل با BRD-001   | اصلاح بصری      |
| **GATE-2** | Technical Quality       | کیفیت فنی >= ۴ از ۵     | بازتولید        |
| **GATE-3** | Metadata Readiness      | فراداده کامل + Alt Text | تکمیل فراداده   |
| **GATE-4** | Reusability             | مستقل از پلتفرم         | بازسازی         |
| **GATE-5** | Self-Assessment         | خودارزیابی کامل         | تجدید           |

---

## ۱۸. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "agent": {
    "id": "AI-006",
    "name": "Media Asset Production Agent",
    "type": "specialist",
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
    "core": { "id": "CAP-01", "name": "Media Asset Production" },
    "supporting": [
      { "id": "CAP-02", "name": "Asset Planning" },
      { "id": "CAP-03", "name": "Visual Composition" },
      { "id": "CAP-04", "name": "Format Adaptation" },
      { "id": "CAP-05", "name": "Thumbnail Generation" },
      { "id": "CAP-06", "name": "Media Metadata" },
      { "id": "CAP-07", "name": "Quality Assurance" }
    ],
    "collaborative": [
      { "id": "CAP-08", "name": "Asset Intake from Discovery", "target": "AI-005" },
      { "id": "CAP-09", "name": "Media Package Handoff", "target": "AI-008" }
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
      { "id": "RSP-01", "name": "Media Asset Planning" },
      { "id": "RSP-02", "name": "Image Asset Generation" },
      { "id": "RSP-03", "name": "Graphic Asset Generation" },
      { "id": "RSP-04", "name": "Diagram Generation" },
      { "id": "RSP-05", "name": "Illustration Production" },
      { "id": "RSP-06", "name": "Infographic Production" },
      { "id": "RSP-07", "name": "Presentation Asset Generation" },
      { "id": "RSP-08", "name": "Document Asset Packaging" },
      { "id": "RSP-09", "name": "Thumbnail Preparation" },
      { "id": "RSP-10", "name": "Media Metadata Generation" },
      { "id": "RSP-11", "name": "Media Consistency" },
      { "id": "RSP-12", "name": "Media Quality" },
      { "id": "RSP-13", "name": "Asset Catalog Registration" }
    ],
    "non_responsibility": [
      { "id": "NRS-01", "name": "Content Strategy" },
      { "id": "NRS-02", "name": "Editorial Planning" },
      { "id": "NRS-03", "name": "Content Writing" },
      { "id": "NRS-04", "name": "Quality Approval" },
      { "id": "NRS-05", "name": "Publishing" },
      { "id": "NRS-06", "name": "Community Management" },
      { "id": "NRS-07", "name": "Analytics" },
      { "id": "NRS-08", "name": "Workflow Orchestration" },
      { "id": "NRS-09", "name": "Brand Governance" },
      { "id": "NRS-10", "name": "SEO Optimization" }
    ]
  }
}
```

### Block 4 — Inputs & Outputs

```json
{
  "inputs": {
    "IN-01": { "name": "Optimized Content Asset", "source": "AI-005" },
    "IN-02": { "name": "Metadata Package (Enhanced)", "source": "AI-005" },
    "IN-03": { "name": "Review Report", "source": "AI-004" },
    "IN-04": { "name": "Brand Identity", "source": "BRD-001" },
    "IN-05": { "name": "Brand Voice Guidelines", "source": "BRD-002" },
    "IN-06": { "name": "Media Guidelines", "source": "EDT-001, BRD-001" },
    "IN-07": { "name": "Knowledge Repository", "source": "KNW-*" }
  },
  "outputs": {
    "OUT-01": { "name": "Media Asset", "consumers": ["AI-008", "Media Repository"] },
    "OUT-02": { "name": "Media Package", "consumers": ["AI-008"] },
    "OUT-03": { "name": "Asset Manifest", "consumers": ["AI-008", "Orchestrator"] },
    "OUT-04": { "name": "Asset Metadata", "consumers": ["Media Repository", "KNW"] },
    "OUT-05": { "name": "Thumbnail Package", "consumers": ["AI-008", "Media Repository"] },
    "OUT-06": { "name": "Accessibility Metadata", "consumers": ["AI-008", "KNW"] },
    "OUT-07": { "name": "Media Quality Report", "consumers": ["AI-004", "KNW"] },
    "OUT-08": { "name": "Catalog Entry", "consumers": ["Media Repository"] }
  }
}
```

### Block 5 — Events

```json
{
  "events": {
    "published": [
      "EVT-01": "media.produced",
      "EVT-02": "media.packaged",
      "EVT-03": "media.catalogued",
      "EVT-04": "media.quality_assessed",
      "EVT-05": "media.failed"
    ],
    "subscribed": [
      "EVT-06": "discoverability.optimized",
      "EVT-07": "readiness.scored",
      "EVT-08": "asset.approved"
    ]
  }
}
```

### Block 6 — KPIs

```json
{
  "kpis": [
    { "id": "KPI-01", "name": "Media Production Volume", "target": "per plan" },
    { "id": "KPI-02", "name": "Brand Visual Compliance", "target": ">= 95%" },
    { "id": "KPI-03", "name": "Reusability Rate", "target": ">= 70%" },
    { "id": "KPI-04", "name": "Catalog Coverage", "target": "100%" },
    { "id": "KPI-05", "name": "Metadata Completeness", "target": "100%" },
    { "id": "KPI-06", "name": "Accessibility Coverage", "target": ">= 90%" },
    { "id": "KPI-07", "name": "Quality Score", "target": ">= 4" },
    { "id": "KPI-08", "name": "Thumbnail Availability", "target": "100%" },
    { "id": "KPI-09", "name": "On-Time Delivery", "target": ">= 90%" },
    { "id": "KPI-10", "name": "Escalation Rate", "target": "<= 10%" }
  ]
}
```

---

> **AI-006 ششمین Agent مشخص SMOS است. عامل تولید دارایی رسانه — لایه تولید رسانه سازمانی. تصاویر، گرافیک‌ها، نمودارها، اینفوگرافیک‌ها، ارائه‌ها و اسناد. مشتق از AI-000، مصرف‌کننده AI-005.**
