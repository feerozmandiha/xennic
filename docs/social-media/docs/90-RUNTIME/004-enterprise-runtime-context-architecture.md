# RT-003 — Enterprise Runtime Context Architecture

> **معماری بافت زمان اجرای سازمانی SMOS**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۰۹
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**

---

## ۱. Purpose

RT-003 معماری بافت زمان اجرای سازمانی SMOS را تعریف می‌کند. Context (بافت) لایه‌ای از زمان اجرا است که داده‌ها، شرایط و محیط مورد نیاز برای اجرای وظایف، گردش کارها و عملیات سازمانی را نگهداری و مدیریت می‌کند. بافت تعیین می‌کند که یک اجرا در چه شرایطی، با چه داده‌هایی و با چه محدودیت‌هایی انجام می‌شود.

**SSOT**: تنها منبع معتبر برای معماری بافت زمان اجرای سازمانی SMOS.

---

## ۲. Scope

این سند محدوده زیر را پوشش می‌دهد:

- اصول و فلسفه بافت در Runtime
- دامنه‌ها، مفاهیم و موجودیت‌های بافت
- قابلیت‌ها و کارکردهای بافت
- مدل مرحله‌ای و مدل وضعیت بافت
- مدل‌های بافت (Context Models)
- مدل‌های اکتساب، تفکیک، انتشار، ایزولاسیون و تکامل بافت
- روابط، معیارها، محدودیت‌ها و گیت‌های کیفیت بافت
- ۶ بلوک Machine Readable JSON
- ۳ JSON Schema (Draft-07)

**خارج از محدوده**:

- پیاده‌سازی فنی مدیریت بافت
- الگوریتم‌های هماهنگی یا همگام‌سازی بافت
- حافظه نهان (Cache) یا پایگاه داده بافت
- APIها، پروتکل‌ها یا زبان‌های خاص
- پیاده‌سازی Session Management
- پایگاه داده یا Vendor خاص
- هرگونه پیاده‌سازی اجرایی
- دیاگرام، نمودار یا نمایش بصری

---

## ۳. Context Principles

بافت زمان اجرای SMOS بر ۸ اصل زیر استوار است:

| ID     | اصل                               | توضیح                                                                 |
| ------ | --------------------------------- | --------------------------------------------------------------------- |
| RCP-01 | **Immutability During Execution** | بافت در طول اجرا تغییر نمی‌کند — فقط در نقاط تعریف‌شده قابل تغییر است |
| RCP-02 | **Explicit Ownership**            | هر بافت دارای مالک مشخص و مسئول است                                   |
| RCP-03 | **Traceable Lineage**             | مسیر بافت از منبع تا مصرف قابل ردیابی است                             |
| RCP-04 | **Controlled Inheritance**        | بافت فقط از طریق مسیرهای تعریف‌شده به ارث برده می‌شود                 |
| RCP-05 | **Governed Visibility**           | دید بافت بر اساس قواعد حکمرانی محدود می‌شود                           |
| RCP-06 | **Deterministic Synchronization** | همگام‌سازی بافت همیشه نتیجه قابل پیش‌بینی دارد                        |
| RCP-07 | **Independent Lifecycle**         | چرخه حیات بافت مستقل از مصرف‌کنندگان آن است                           |
| RCP-08 | **Full Auditability**             | تمام تغییرات بافت قابل حسابرسی و بازبینی هستند                        |

این اصول مکمل RTP-01..08 (RT-001) و REP-01..08 (RT-002) هستند و بر روی آنها بنا شده‌اند.

---

## ۴. Context Philosophy

بافت زمان اجرای SMOS بر اساس فلسفه "بافت امن در مرزهای تعریف‌شده با قابلیت ردیابی کامل" (Secure Context Within Defined Boundaries With Full Traceability) طراحی شده است. بافت به عنوان لایه اطلاعاتی مستقل از اجرا عمل می‌کند که داده‌ها و شرایط لازم را برای عملیات سازمانی فراهم می‌کند.

بافت SMOS:

- **مستقل است** — چرخه حیات بافت مستقل از اجرا است
- **ردیابی است** — منبع و تغییرات بافت قابل ردیابی هستند
- **ایمن است** — دسترسی به بافت بر اساس قواعد حکمرانی کنترل می‌شود
- **سازگار است** — داده‌های بافتی همیشه سازگار و معتبر هستند
- **منعطف است** — بافت در دامنه‌های مختلف با ویژگی‌های متفاوت کار می‌کند
- **مقیاس‌پذیر است** — بافت می‌تواند بین چند مصرف‌کننده به اشتراک گذاشته شود

---

## ۵. Architecture — Context in the Layered Model

بافت در معماری ۵ لایه‌ای RT-001 در لایه LYR-RT-02 (Context Layer) قرار دارد اما با تمام لایه‌های دیگر تعامل دارد:

| لایه                     | نقش در بافت                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| LYR-RT-01 (Execution)    | **مصرف‌کننده بافت** — اجرا از بافت برای انجام وظایف استفاده می‌کند |
| LYR-RT-02 (Context)      | **لایه اصلی بافت** — مدیریت اکتساب، تفکیک، انتشار و نگهداری بافت   |
| LYR-RT-03 (State)        | **ذخیره‌ساز بافت** — وضعیت و ماندگاری بافت را مدیریت می‌کند        |
| LYR-RT-04 (Coordination) | **هماهنگ‌ساز بافت** — همگام‌سازی و اشتراک بافت بین مصرف‌کنندگان    |
| LYR-RT-05 (Governance)   | **حاکم بر بافت** — سیاست‌ها، محدودیت‌ها و حسابرسی بافت             |

---

## ۶. Context Domains

بافت زمان اجرای SMOS شامل ۸ دامنه اصلی است:

| ID     | نام                         | توضیح                                                   | لایه مرتبط |
| ------ | --------------------------- | ------------------------------------------------------- | ---------- |
| RCD-01 | **Context Acquisition**     | اکتساب بافت — جمع‌آوری و دریافت داده‌های بافتی از منابع | LYR-RT-02  |
| RCD-02 | **Context Resolution**      | تفکیک بافت — تبدیل و نرمال‌سازی داده‌های بافتی          | LYR-RT-02  |
| RCD-03 | **Context Propagation**     | انتشار بافت — توزیع بافت بین مصرف‌کنندگان               | LYR-RT-04  |
| RCD-04 | **Context Isolation**       | ایزولاسیون بافت — جداسازی بافت‌های مختلف از یکدیگر      | LYR-RT-02  |
| RCD-05 | **Context Persistence**     | ماندگاری بافت — ذخیره و بازیابی بافت                    | LYR-RT-03  |
| RCD-06 | **Context Synchronization** | همگام‌سازی بافت — هماهنگی بافت بین مصرف‌کنندگان         | LYR-RT-04  |
| RCD-07 | **Context Governance**      | حکمرانی بافت — سیاست‌ها و محدودیت‌های بافت              | LYR-RT-05  |
| RCD-08 | **Context Evolution**       | تکامل بافت — تغییر و به‌روزرسانی بافت در طول زمان       | LYR-RT-02  |

---

## ۷. Context Concepts

۲۰ مفهوم اصلی بافت زمان اجرا:

| ID      | مفهوم                       | توضیح                                                  | دامنه  |
| ------- | --------------------------- | ------------------------------------------------------ | ------ |
| RCC-001 | **Context**                 | بافت — داده‌ها و شرایط مورد نیاز برای اجرا             | RCD-01 |
| RCC-002 | **Context Data**            | داده بافتی — داده‌های خام بافت                         | RCD-01 |
| RCC-003 | **Context Source**          | منبع بافت — مبدأ داده‌های بافتی                        | RCD-01 |
| RCC-004 | **Context Identity**        | هویت بافت — شناسه یکتای بافت                           | RCD-02 |
| RCC-005 | **Context Schema**          | شمای بافت — ساختار داده‌های بافتی                      | RCD-02 |
| RCC-006 | **Context Resolution**      | تفکیک بافت — فرآیند تبدیل داده خام به بافت ساختاریافته | RCD-02 |
| RCC-007 | **Context Propagation**     | انتشار بافت — توزیع بافت بین مصرف‌کنندگان              | RCD-03 |
| RCC-008 | **Context Consumer**        | مصرف‌کننده بافت — موجودیتی که از بافت استفاده می‌کند   | RCD-03 |
| RCC-009 | **Context Boundary**        | مرز بافت — محدوده مجاز دسترسی به بافت                  | RCD-04 |
| RCC-010 | **Context Isolation**       | ایزولاسیون بافت — جداسازی بافت از سایر بافت‌ها         | RCD-04 |
| RCC-011 | **Context Storage**         | ذخیره‌ساز بافت — محل نگهداری بافت                      | RCD-05 |
| RCC-012 | **Context Snapshot**        | عکس بافت — وضعیت بافت در یک مقطع زمانی                 | RCD-05 |
| RCC-013 | **Context Synchronization** | همگام‌سازی بافت — هماهنگی بافت بین مصرف‌کنندگان        | RCD-06 |
| RCC-014 | **Context Version**         | نسخه بافت — نگارش بافت در طول زمان                     | RCD-06 |
| RCC-015 | **Context Policy**          | سیاست بافت — قواعد حاکم بر بافت                        | RCD-07 |
| RCC-016 | **Context Audit**           | حسابرسی بافت — ثبت و بازبینی تغییرات بافت              | RCD-07 |
| RCC-017 | **Context Lineage**         | شجره بافت — مسیر تکامل بافت از منبع تا مصرف            | RCD-07 |
| RCC-018 | **Context Evolution**       | تکامل بافت — تغییر بافت در طول چرخه حیات               | RCD-08 |
| RCC-019 | **Context Migration**       | مهاجرت بافت — انتقال بافت بین محیط‌ها                  | RCD-08 |
| RCC-020 | **Context Retirement**      | بازنشستگی بافت — خاتمه اعتبار بافت                     | RCD-08 |

---

## ۸. Context Entities

۱۲ موجودیت اصلی بافت زمان اجرا:

| ID      | موجودیت                | توضیح                                        | دامنه  | نوع         |
| ------- | ---------------------- | -------------------------------------------- | ------ | ----------- |
| RCE-001 | **ContextRecord**      | ثبت بافت — موجودیت مرکزی حاوی داده‌های بافتی | RCD-01 | Core        |
| RCE-002 | **ContextSource**      | منبع بافت — مبدأ داده‌های بافتی              | RCD-01 | Core        |
| RCE-003 | **ContextIdentity**    | هویت بافت — شناسه یکتای بافت                 | RCD-02 | Core        |
| RCE-004 | **ContextSchema**      | شمای بافت — تعریف ساختار بافت                | RCD-02 | Core        |
| RCE-005 | **ContextPropagation** | انتشار بافت — مسیر توزیع بافت                | RCD-03 | Operational |
| RCE-006 | **ContextConsumer**    | مصرف‌کننده بافت — موجودیت مصرف‌کننده بافت    | RCD-03 | Operational |
| RCE-007 | **ContextBoundary**    | مرز بافت — محدوده مجاز بافت                  | RCD-04 | Governance  |
| RCE-008 | **ContextIsolation**   | ایزولاسیون بافت — واحد جداسازی بافت          | RCD-04 | Core        |
| RCE-009 | **ContextSnapshot**    | عکس بافت — وضعیت بافت در زمان مشخص           | RCD-05 | Operational |
| RCE-010 | **ContextVersion**     | نسخه بافت — نگارش بافت                       | RCD-06 | Operational |
| RCE-011 | **ContextPolicy**      | سیاست بافت — قاعده حاکم بر بافت              | RCD-07 | Governance  |
| RCE-012 | **ContextLineage**     | شجره بافت — مسیر تکامل بافت                  | RCD-07 | Audit       |

---

## ۹. Context Capabilities

۱۴ قابلیت اصلی بافت زمان اجرا:

| ID        | قابلیت                      | توضیح                                            | دامنه  |
| --------- | --------------------------- | ------------------------------------------------ | ------ |
| RCCAP-001 | **Context Acquisition**     | اکتساب بافت — جمع‌آوری داده‌های بافتی از منابع   | RCD-01 |
| RCCAP-002 | **Source Validation**       | اعتبارسنجی منبع — تأیید معتبر بودن منبع بافت     | RCD-01 |
| RCCAP-003 | **Context Resolution**      | تفکیک بافت — تبدیل داده خام به بافت ساختاریافته  | RCD-02 |
| RCCAP-004 | **Schema Enforcement**      | اعمال شمای بافت — تطابق داده با شمای تعریف‌شده   | RCD-02 |
| RCCAP-005 | **Context Propagation**     | انتشار بافت — توزیع بافت بین مصرف‌کنندگان        | RCD-03 |
| RCCAP-006 | **Consumer Registration**   | ثبت مصرف‌کننده — شناسایی و ثبت مصرف‌کنندگان بافت | RCD-03 |
| RCCAP-007 | **Boundary Enforcement**    | اعمال مرز — محدودسازی دسترسی به بافت             | RCD-04 |
| RCCAP-008 | **Isolation Provisioning**  | ایزولاسیون بافت — جداسازی بافت‌ها                | RCD-04 |
| RCCAP-009 | **Context Persistence**     | ماندگاری بافت — ذخیره و بازیابی بافت             | RCD-05 |
| RCCAP-010 | **Snapshot Management**     | مدیریت عکس — ثبت و بازیابی وضعیت بافت            | RCD-05 |
| RCCAP-011 | **Context Synchronization** | همگام‌سازی بافت — هماهنگی بافت بین مصرف‌کنندگان  | RCD-06 |
| RCCAP-012 | **Version Management**      | مدیریت نسخه — ردیابی تغییرات بافت                | RCD-06 |
| RCCAP-013 | **Governance Enforcement**  | اعمال حکمرانی — اجرای سیاست‌های بافت             | RCD-07 |
| RCCAP-014 | **Lineage Tracking**        | ردیابی شجره — ثبت مسیر تکامل بافت                | RCD-07 |

---

## ۱۰. Context Functions

۱۴ کارکرد اصلی بافت زمان اجرا:

| ID     | کارکرد              | قابلیت مرتبط | دامنه  |
| ------ | ------------------- | ------------ | ------ |
| RCF-01 | Acquire Context     | RCCAP-001    | RCD-01 |
| RCF-02 | Validate Source     | RCCAP-002    | RCD-01 |
| RCF-03 | Resolve Context     | RCCAP-003    | RCD-02 |
| RCF-04 | Enforce Schema      | RCCAP-004    | RCD-02 |
| RCF-05 | Propagate Context   | RCCAP-005    | RCD-03 |
| RCF-06 | Register Consumer   | RCCAP-006    | RCD-03 |
| RCF-07 | Enforce Boundary    | RCCAP-007    | RCD-04 |
| RCF-08 | Provision Isolation | RCCAP-008    | RCD-04 |
| RCF-09 | Persist Context     | RCCAP-009    | RCD-05 |
| RCF-10 | Manage Snapshot     | RCCAP-010    | RCD-05 |
| RCF-11 | Synchronize Context | RCCAP-011    | RCD-06 |
| RCF-12 | Manage Version      | RCCAP-012    | RCD-06 |
| RCF-13 | Enforce Governance  | RCCAP-013    | RCD-07 |
| RCF-14 | Track Lineage       | RCCAP-014    | RCD-07 |

---

## ۱۱. Context Stage Model

مدل مرحله‌ای بافت زمان اجرا شامل ۸ مرحله است:

| ID      | مرحله               | ورودی               | خروجی               | دامنه  |
| ------- | ------------------- | ------------------- | ------------------- | ------ |
| RCST-01 | **Acquisition**     | RawSourceData       | AcquiredContext     | RCD-01 |
| RCST-02 | **Validation**      | AcquiredContext     | ValidatedContext    | RCD-01 |
| RCST-03 | **Resolution**      | ValidatedContext    | ResolvedContext     | RCD-02 |
| RCST-04 | **Registration**    | ResolvedContext     | RegisteredContext   | RCD-02 |
| RCST-05 | **Propagation**     | RegisteredContext   | PropagatedContext   | RCD-03 |
| RCST-06 | **Activation**      | PropagatedContext   | ActiveContext       | RCD-03 |
| RCST-07 | **Synchronization** | ActiveContext       | SynchronizedContext | RCD-06 |
| RCST-08 | **Archival**        | SynchronizedContext | ArchivedContext     | RCD-05 |

---

## ۱۲. Context State Model

مدل وضعیت بافت زمان اجرا شامل ۸ وضعیت با ۲۰ انتقال مجاز است:

### وضعیت‌ها

| ID     | وضعیت          | توضیح                                                  |
| ------ | -------------- | ------------------------------------------------------ |
| RCS-01 | **Undefined**  | بافت تعریف‌نشده — هنوز داده‌ای جمع‌آوری نشده           |
| RCS-02 | **Collecting** | در حال جمع‌آوری — داده‌های بافتی در حال دریافت         |
| RCS-03 | **Resolving**  | در حال تفکیک — داده‌های خام در حال پردازش              |
| RCS-04 | **Active**     | فعال — بافت آماده و قابل مصرف است                      |
| RCS-05 | **Shared**     | اشتراکی — بافت بین چند مصرف‌کننده به اشتراک گذاشته شده |
| RCS-06 | **Suspended**  | معلق — بافت به طور موقت غیرفعال است                    |
| RCS-07 | **Expired**    | منقضی — اعتبار بافت به پایان رسیده                     |
| RCS-08 | **Archived**   | بایگانی‌شده — بافت برای نگهداری طولانی مدت ذخیره شده   |

### انتقال‌های مجاز

| مبدأ                | مقصد                | شرط                                    |
| ------------------- | ------------------- | -------------------------------------- |
| RCS-01 (Undefined)  | RCS-02 (Collecting) | منبع بافت شناسایی و قابل دسترس است     |
| RCS-02 (Collecting) | RCS-03 (Resolving)  | داده‌های کافی جمع‌آوری شده است         |
| RCS-02 (Collecting) | RCS-06 (Suspended)  | خطا در جمع‌آوری داده                   |
| RCS-02 (Collecting) | RCS-07 (Expired)    | مهلت جمع‌آوری به پایان رسیده           |
| RCS-03 (Resolving)  | RCS-04 (Active)     | تفکیک با موفقیت کامل شده               |
| RCS-03 (Resolving)  | RCS-06 (Suspended)  | خطا در تفکیک داده                      |
| RCS-03 (Resolving)  | RCS-07 (Expired)    | مهلت تفکیک به پایان رسیده              |
| RCS-04 (Active)     | RCS-05 (Shared)     | نیاز به اشتراک بافت تشخیص داده شده     |
| RCS-04 (Active)     | RCS-06 (Suspended)  | دستور تعلیق بافت صادر شده              |
| RCS-04 (Active)     | RCS-07 (Expired)    | اعتبار بافت به پایان رسیده             |
| RCS-04 (Active)     | RCS-08 (Archived)   | بافت دیگر مورد نیاز نیست               |
| RCS-05 (Shared)     | RCS-04 (Active)     | آخرین مصرف‌کننده بافت را آزاد کرده     |
| RCS-05 (Shared)     | RCS-06 (Suspended)  | خطا در یکی از مصرف‌کنندگان             |
| RCS-05 (Shared)     | RCS-07 (Expired)    | اعتبار بافت اشتراکی به پایان رسیده     |
| RCS-05 (Shared)     | RCS-08 (Archived)   | همه مصرف‌کنندگان بافت را آزاد کرده‌اند |
| RCS-06 (Suspended)  | RCS-02 (Collecting) | نیاز به جمع‌آوری مجدد داده‌ها          |
| RCS-06 (Suspended)  | RCS-04 (Active)     | رفع مشکل تعلیق                         |
| RCS-06 (Suspended)  | RCS-07 (Expired)    | مهلت رفع تعلیق به پایان رسیده          |
| RCS-06 (Suspended)  | RCS-08 (Archived)   | تصمیم به بایگانی بافت معلق             |
| RCS-07 (Expired)    | RCS-08 (Archived)   | بافت منقضی بایگانی می‌شود              |

---

## ۱۳. Context Models

۸ مدل بافت:

| ID     | مدل                       | توضیح                                        | دامنه  |
| ------ | ------------------------- | -------------------------------------------- | ------ |
| RCM-01 | **Execution Context**     | بافت اجرا — داده‌ها و شرایط مربوط به یک اجرا | RCD-01 |
| RCM-02 | **Session Context**       | بافت نشست — داده‌های مربوط به یک نشست        | RCD-02 |
| RCM-03 | **User Context**          | بافت کاربر — داده‌های مربوط به کاربر         | RCD-03 |
| RCM-04 | **Agent Context**         | بافت عامل — داده‌های مربوط به Agent هوشمند   | RCD-04 |
| RCM-05 | **Knowledge Context**     | بافت دانش — داده‌های مربوط به دانش سازمانی   | RCD-05 |
| RCM-06 | **Operational Context**   | بافت عملیاتی — داده‌های مربوط به عملیات جاری | RCD-06 |
| RCM-07 | **Environmental Context** | بافت محیط — داده‌های مربوط به محیط اجرا      | RCD-07 |
| RCM-08 | **Composite Context**     | بافت ترکیبی — ترکیب چند بافت در یک بافت واحد | RCD-08 |

---

## ۱۴. Context Relationships

۱۰ رابطه اصلی بافت:

| ID     | رابطه             | مبدأ          | مقصد            | توضیح                                  |
| ------ | ----------------- | ------------- | --------------- | -------------------------------------- |
| RCR-01 | **Acquired From** | ContextRecord | ContextSource   | بافت از یک منبع اکتساب شده است         |
| RCR-02 | **Resolved By**   | ContextRecord | ContextSchema   | بافت بر اساس یک شمای تفکیک شده است     |
| RCR-03 | **Consumed By**   | ContextRecord | ContextConsumer | بافت توسط یک مصرف‌کننده استفاده می‌شود |
| RCR-04 | **Governed By**   | ContextRecord | ContextPolicy   | بافت تابع یک سیاست است                 |
| RCR-05 | **Has Boundary**  | ContextRecord | ContextBoundary | بافت دارای مرز مشخص است                |
| RCR-06 | **Has Version**   | ContextRecord | ContextVersion  | بافت دارای نسخه است                    |
| RCR-07 | **Has Lineage**   | ContextRecord | ContextLineage  | بافت دارای شجره قابل ردیابی است        |
| RCR-08 | **Has Snapshot**  | ContextRecord | ContextSnapshot | بافت دارای عکس وضعیت است               |
| RCR-09 | **Propagates To** | ContextRecord | ContextConsumer | بافت به مصرف‌کننده منتشر می‌شود        |
| RCR-10 | **Depends On**    | ContextRecord | ContextRecord   | یک بافت به بافت دیگر وابسته است        |

---

## ۱۵. Context Integrity

یکپارچگی بافت بر اساس ۴ بعد تعریف می‌شود:

### بعد ۱: یکپارچگی داده (Data Integrity)

| قاعده                                                   | توضیح |
| ------------------------------------------------------- | ----- |
| داده‌های بافت باید با شمای تعریف‌شده مطابقت داشته باشند |
| داده‌های بافت نباید حاوی اطلاعات متناقض باشند           |
| داده‌های بافت باید قابل اعتماد و معتبر باشند            |

### بعد ۲: یکپارچگی منبع (Source Integrity)

| قاعده                                   | توضیح |
| --------------------------------------- | ----- |
| هر بافت باید دارای منبع مشخص باشد       |
| منبع بافت باید معتبر و قابل اعتماد باشد |
| تغییر منبع باید در شجره بافت ثبت شود    |

### بعد ۳: یکپارچگی مرز (Boundary Integrity)

| قاعده                                                  | توضیح |
| ------------------------------------------------------ | ----- |
| هر بافت باید دارای مرز مشخص باشد                       |
| داده‌های خارج از مرز برای مصرف‌کننده قابل دسترس نیستند |
| نقض مرز باید منجر به هشدار یا مسدودسازی شود            |

### بعد ۴: یکپارچگی شجره (Lineage Integrity)

| قاعده                                   | توضیح |
| --------------------------------------- | ----- |
| هر بافت باید دارای شجره کامل باشد       |
| تمام تغییرات بافت باید در شجره ثبت شوند |
| شجره بافت باید قابل حسابرسی باشد        |

---

## ۱۶. Context Consistency Rules

۱۲ قاعده سازگاری بافت:

| ID      | قاعده                                                   | توضیح                         |
| ------- | ------------------------------------------------------- | ----------------------------- |
| RCCR-01 | هر بافت دقیقاً یک هویت یکتا دارد                        | Unique identity per context   |
| RCCR-02 | هر بافت دقیقاً یک منبع دارد                             | Single source per context     |
| RCCR-03 | هر بافت در یک زمان فقط یک وضعیت دارد                    | Single state at any time      |
| RCCR-04 | انتقال وضعیت فقط از طریق انتقال‌های مجاز                | Allowed transitions only      |
| RCCR-05 | داده‌های بافت باید با شمای تعریف‌شده مطابقت داشته باشند | Schema compliance             |
| RCCR-06 | بافت اشتراکی باید برای همه مصرف‌کنندگان سازگار باشد     | Shared context consistency    |
| RCCR-07 | نسخه‌های بافت باید ترتیب زمانی مشخص داشته باشند         | Version ordering              |
| RCCR-08 | بافت وابسته باید قبل از مصرف‌کننده فعال شود             | Dependency ordering           |
| RCCR-09 | بافت نباید خارج از مرز تعریف‌شده مصرف شود               | Scope-bound consumption       |
| RCCR-10 | همگام‌سازی بافت باید قطعی باشد                          | Deterministic synchronization |
| RCCR-11 | بافت منقضی نباید مصرف شود                               | No expired consumption        |
| RCCR-12 | شجره بافت باید غیرچرخه‌ای باشد                          | Acyclic lineage               |

---

## ۱۷. Context Constraints

۸ محدودیت اصلی بافت:

| ID       | محدودیت                                      | توضیح                    |
| -------- | -------------------------------------------- | ------------------------ |
| RCCST-01 | هر بافت فقط یک وضعیت در هر زمان دارد         | Single state at any time |
| RCCST-02 | انتقال وضعیت فقط از طریق انتقال‌های مجاز     | Allowed transitions only |
| RCCST-03 | هر بافت دارای مرز مشخص است                   | Defined boundary         |
| RCCST-04 | داده‌های بافت فقط درون مرز معتبر هستند       | Scope-limited data       |
| RCCST-05 | بافت نباید با بافت‌های دیگر تداخل داشته باشد | Non-interference         |
| RCCST-06 | بافت منقضی قابل بازیابی نیست                 | No expired recovery      |
| RCCST-07 | بافت اشتراکی فقط خواندنی است                 | Shared context read-only |
| RCCST-08 | هر بافت باید دارای شجره کامل باشد            | Mandatory lineage        |

---

## ۱۸. Context Governance

حکمرانی بافت بر اساس ۵ سطح اختیار (A-0 تا A-4) و ۴ حوزه حکمرانی تعریف می‌شود:

### حوزه‌های حکمرانی بافت

| حوزه                       | توضیح                                       |
| -------------------------- | ------------------------------------------- |
| **Acquisition Governance** | حکمرانی اکتساب — اعتبارسنجی منبع و داده     |
| **Access Governance**      | حکمرانی دسترسی — مرزها و مجوزهای بافت       |
| **Lifecycle Governance**   | حکمرانی چرخه حیات — ایجاد، تغییر، بازنشستگی |
| **Compliance Governance**  | حکمرانی انطباق — سیاست‌ها و حسابرسی بافت    |

### مدل تصمیم‌گیری بافت

| نوع تصمیم             | سطح اختیار | مسئول        |
| --------------------- | ---------- | ------------ |
| ایجاد بافت جدید       | A-0        | سیستم        |
| تغییر بافت فعال       | A-1        | مدیر بافت    |
| اشتراک بافت           | A-2        | مدیر بافت    |
| تعلیق بافت            | A-2        | مدیر بافت    |
| تغییر سیاست بافت      | A-3        | افسر حکمرانی |
| بازنشستگی پیش از موعد | A-3        | افسر حکمرانی |
| استثنای مرز بافت      | A-4        | معمار سیستم  |
| مصالحه بین بافت‌ها    | A-4        | هماهنگ‌ساز   |

---

## ۱۹. Context Taxonomy

### ابعاد تاکسونومی بافت

| بعد             | توضیح         | مقادیر ممکن                                                                       |
| --------------- | ------------- | --------------------------------------------------------------------------------- |
| **Scope**       | محدوده بافت   | execution, session, user, agent, knowledge, operational, environmental, composite |
| **Lifetime**    | طول عمر بافت  | transient, short-lived, session-bound, long-lived, permanent                      |
| **Visibility**  | سطح دید بافت  | private, protected, shared, public                                                |
| **Ownership**   | نوع مالکیت    | system, user, agent, workflow, organization                                       |
| **Sensitivity** | سطح حساسیت    | public, internal, confidential, restricted, critical                              |
| **Persistence** | نحوه ماندگاری | volatile, persistent, snapshot-only, archived                                     |
| **Source**      | نوع منبع      | internal, external, derived, computed, composed                                   |
| **Consistency** | سطح سازگاری   | eventual, causal, strong, strict                                                  |

### قواعد طبقه‌بندی

| قاعده                                               | توضیح |
| --------------------------------------------------- | ----- |
| هر بافت باید در تمام ابعاد طبقه‌بندی شود            |
| بعد Scope تعیین‌کننده مدل بافت (RCM-01..08) است     |
| بعد Lifetime بر چرخه حیات بافت تأثیر می‌گذارد       |
| بعد Visibility سطح دسترسی به بافت را مشخص می‌کند    |
| بعد Sensitivity قواعد حکمرانی را تعیین می‌کند       |
| بعد Persistence نحوه ذخیره‌سازی بافت را مشخص می‌کند |

---

## ۲۰. Context Acquisition Model

مدل اکتساب بافت نحوه جمع‌آوری و دریافت داده‌های بافتی از منابع را مشخص می‌کند:

### انواع اکتساب

| نوع                          | توضیح                                    |
| ---------------------------- | ---------------------------------------- |
| **Push Acquisition**         | منبع داده را به زمان اجرا ارسال می‌کند   |
| **Pull Acquisition**         | زمان اجرا داده را از منبع درخواست می‌کند |
| **Event-Driven Acquisition** | رویداد باعث شروع اکتساب می‌شود           |
| **Scheduled Acquisition**    | اکتساب در زمان مشخص انجام می‌شود         |

### قواعد اکتساب

| قاعده                                           | توضیح |
| ----------------------------------------------- | ----- |
| هر بافت باید از یک منبع معتبر اکتساب شود        |
| منبع باید قبل از اکتساب اعتبارسنجی شود          |
| داده‌های اکتسابی باید با شمای مقصد سازگار باشند |
| خطا در اکتساب باید در شجره بافت ثبت شود         |
| اکتساب مجدد باید جایگزین داده قبلی شود          |

---

## ۲۱. Context Resolution Model

مدل تفکیک بافت نحوه تبدیل داده‌های خام به بافت ساختاریافته را مشخص می‌کند:

### مراحل تفکیک

| مرحله              | توضیح                              |
| ------------------ | ---------------------------------- |
| **Parsing**        | تجزیه داده خام بر اساس شمای بافت   |
| **Validation**     | اعتبارسنجی داده بر اساس قواعد شمای |
| **Transformation** | تبدیل داده به ساختار هدف           |
| **Enrichment**     | غنی‌سازی داده با اطلاعات اضافی     |

### قواعد تفکیک

| قاعده                                        | توضیح |
| -------------------------------------------- | ----- |
| تفکیک باید بر اساس شمای بافت انجام شود       |
| داده نامعتبر باید با خطای مشخص برگردانده شود |
| غنی‌سازی باید غیرمخرب باشد                   |
| شمای بافت پس از تعریف قابل تغییر نیست        |

---

## ۲۲. Context Propagation Model

مدل انتشار بافت نحوه توزیع بافت بین مصرف‌کنندگان را مشخص می‌کند:

### انواع انتشار

| نوع                       | توضیح                                 |
| ------------------------- | ------------------------------------- |
| **Direct Propagation**    | انتشار مستقیم به مصرف‌کننده مشخص      |
| **Broadcast Propagation** | انتشار به همه مصرف‌کنندگان مجاز       |
| **Selective Propagation** | انتشار به گروهی از مصرف‌کنندگان       |
| **Deferred Propagation**  | انتشار در زمان مشخص یا بر اساس رویداد |

### قواعد انتشار

| قاعده                                      | توضیح |
| ------------------------------------------ | ----- |
| انتشار فقط در مرز مجاز بافت انجام می‌شود   |
| مصرف‌کننده باید قبل از انتشار ثبت شده باشد |
| بافت اشتراکی فقط خواندنی منتشر می‌شود      |
| انتشار نباید یکپارچگی بافت را نقض کند      |

---

## ۲۳. Context Isolation Model

مدل ایزولاسیون بافت نحوه جداسازی بافت‌های مختلف از یکدیگر را مشخص می‌کند:

### سطوح ایزولاسیون

| سطح                    | توضیح                                                    |
| ---------------------- | -------------------------------------------------------- |
| **Full Isolation**     | ایزولاسیون کامل — بافت‌ها کاملاً جدا از یکدیگر           |
| **Schema Isolation**   | ایزولاسیون شمای — شمای بافت‌ها مجزا اما داده قابل اشتراک |
| **Boundary Isolation** | ایزولاسیون مرزی — مرزهای مشخص با اشتراک محدود            |

### قواعد ایزولاسیون

| قاعده                                                 | توضیح |
| ----------------------------------------------------- | ----- |
| بافت‌های مختلف نباید در داده یکدیگر تداخل داشته باشند |
| بافت‌های ایزوله نمی‌توانند به یکدیگر وابسته باشند     |
| بافت اشتراکی فقط در سطح مرز مجاز ایزوله می‌شود        |
| نقض ایزولاسیون باید در شجره بافت ثبت شود              |

---

## ۲۴. Context Evolution Model

مدل تکامل بافت نحوه تغییر و به‌روزرسانی بافت در طول زمان را مشخص می‌کند:

### ابعاد تکامل

| بعد                  | توضیح                                     |
| -------------------- | ----------------------------------------- |
| **Data Evolution**   | تکامل داده — تغییر در محتوای بافت         |
| **Schema Evolution** | تکامل شمای — تغییر در ساختار بافت         |
| **Scope Evolution**  | تکامل محدوده — تغییر در مرز بافت          |
| **Policy Evolution** | تکامل سیاست — تغییر در قواعد حاکم بر بافت |

### قواعد تکامل

| قاعده                                            | توضیح |
| ------------------------------------------------ | ----- |
| تکامل داده باید نسخه‌بندی شود                    |
| تکامل شمای باید با مصرف‌کنندگان سازگار باشد      |
| تکامل محدوده نیاز به تأیید حکمرانی دارد          |
| تکامل سیاست باید در شجره بافت ثبت شود            |
| بازگشت به نسخه قبلی فقط در صورت سازگاری مجاز است |

---

## ۲۵. Context Metrics

۱۵ معیار اصلی ارزیابی بافت:

| ID        | معیار                    | توضیح                             | واحد       |
| --------- | ------------------------ | --------------------------------- | ---------- |
| RCMTR-001 | Acquisition Success Rate | درصد اکتساب‌های موفق به کل        | درصد       |
| RCMTR-002 | Resolution Time          | میانگین زمان تفکیک بافت           | میلی‌ثانیه |
| RCMTR-003 | Propagation Latency      | تأخیر انتشار بافت به مصرف‌کنندگان | میلی‌ثانیه |
| RCMTR-004 | Context Size             | حجم متوسط داده بافت               | کیلوبایت   |
| RCMTR-005 | Active Context Count     | تعداد بافت‌های فعال همزمان        | عدد        |
| RCMTR-006 | Schema Violations        | تعداد نقض شمای بافت               | عدد        |
| RCMTR-007 | Boundary Violations      | تعداد نقض مرز بافت                | عدد        |
| RCMTR-008 | Synchronization Errors   | تعداد خطاهای همگام‌سازی           | عدد        |
| RCMTR-009 | Context Expiry Rate      | درصد بافت‌های منقضی به کل         | درصد       |
| RCMTR-010 | Shared Context Count     | تعداد بافت‌های اشتراکی فعال       | عدد        |
| RCMTR-011 | Average Consumer Count   | میانگین مصرف‌کنندگان هر بافت      | عدد        |
| RCMTR-012 | Lineage Depth            | عمق متوسط شجره بافت               | سطح        |
| RCMTR-013 | Version Count            | میانگین تعداد نسخه‌های هر بافت    | عدد        |
| RCMTR-014 | Governance Compliance    | درصد انطباق بافت با حکمرانی       | درصد       |
| RCMTR-015 | Context Recovery Time    | میانگین زمان بازیابی بافت         | میلی‌ثانیه |

---

## ۲۶. Glossary

### واژه‌نامه تخصصی بافت

| اصطلاح                      | توضیح                                        |
| --------------------------- | -------------------------------------------- |
| **Context Acquisition**     | فرآیند جمع‌آوری داده‌های بافتی از منابع مشخص |
| **Context Resolution**      | فرآیند تبدیل داده خام به بافت ساختاریافته    |
| **Context Propagation**     | فرآیند توزیع بافت بین مصرف‌کنندگان           |
| **Context Isolation**       | جداسازی منطقی بافت‌ها از یکدیگر              |
| **Context Persistence**     | ذخیره و بازیابی بافت در طول زمان             |
| **Context Synchronization** | هماهنگی بافت بین چند مصرف‌کننده              |
| **Context Governance**      | مجموعه سیاست‌ها و قواعد حاکم بر بافت         |
| **Context Evolution**       | تغییر و به‌روزرسانی بافت در طول زمان         |
| **Context Lineage**         | مسیر کامل تکامل بافت از منبع تا مصرف         |
| **Context Schema**          | تعریف ساختار و نوع داده‌های بافتی            |
| **Context Snapshot**        | وضعیت بافت در یک مقطع زمانی مشخص             |
| **Context Boundary**        | محدوده مجاز دسترسی و مصرف بافت               |

---

## ۲۷. Machine Readable JSON Blocks

### Block 1 — Context Concepts

```json
{
  "$schema": "RT-003-concept-registry",
  "context_concepts": [
    { "id": "RCC-001", "name": "Context", "domain": "RCD-01" },
    { "id": "RCC-002", "name": "Context Data", "domain": "RCD-01" },
    { "id": "RCC-003", "name": "Context Source", "domain": "RCD-01" },
    { "id": "RCC-004", "name": "Context Identity", "domain": "RCD-02" },
    { "id": "RCC-005", "name": "Context Schema", "domain": "RCD-02" },
    { "id": "RCC-006", "name": "Context Resolution", "domain": "RCD-02" },
    { "id": "RCC-007", "name": "Context Propagation", "domain": "RCD-03" },
    { "id": "RCC-008", "name": "Context Consumer", "domain": "RCD-03" },
    { "id": "RCC-009", "name": "Context Boundary", "domain": "RCD-04" },
    { "id": "RCC-010", "name": "Context Isolation", "domain": "RCD-04" },
    { "id": "RCC-011", "name": "Context Storage", "domain": "RCD-05" },
    { "id": "RCC-012", "name": "Context Snapshot", "domain": "RCD-05" },
    { "id": "RCC-013", "name": "Context Synchronization", "domain": "RCD-06" },
    { "id": "RCC-014", "name": "Context Version", "domain": "RCD-06" },
    { "id": "RCC-015", "name": "Context Policy", "domain": "RCD-07" },
    { "id": "RCC-016", "name": "Context Audit", "domain": "RCD-07" },
    { "id": "RCC-017", "name": "Context Lineage", "domain": "RCD-07" },
    { "id": "RCC-018", "name": "Context Evolution", "domain": "RCD-08" },
    { "id": "RCC-019", "name": "Context Migration", "domain": "RCD-08" },
    { "id": "RCC-020", "name": "Context Retirement", "domain": "RCD-08" }
  ]
}
```

### Block 2 — Context Entities

```json
{
  "$schema": "RT-003-entity-registry",
  "context_entities": [
    { "id": "RCE-001", "name": "ContextRecord", "domain": "RCD-01", "type": "Core" },
    { "id": "RCE-002", "name": "ContextSource", "domain": "RCD-01", "type": "Core" },
    { "id": "RCE-003", "name": "ContextIdentity", "domain": "RCD-02", "type": "Core" },
    { "id": "RCE-004", "name": "ContextSchema", "domain": "RCD-02", "type": "Core" },
    { "id": "RCE-005", "name": "ContextPropagation", "domain": "RCD-03", "type": "Operational" },
    { "id": "RCE-006", "name": "ContextConsumer", "domain": "RCD-03", "type": "Operational" },
    { "id": "RCE-007", "name": "ContextBoundary", "domain": "RCD-04", "type": "Governance" },
    { "id": "RCE-008", "name": "ContextIsolation", "domain": "RCD-04", "type": "Core" },
    { "id": "RCE-009", "name": "ContextSnapshot", "domain": "RCD-05", "type": "Operational" },
    { "id": "RCE-010", "name": "ContextVersion", "domain": "RCD-06", "type": "Operational" },
    { "id": "RCE-011", "name": "ContextPolicy", "domain": "RCD-07", "type": "Governance" },
    { "id": "RCE-012", "name": "ContextLineage", "domain": "RCD-07", "type": "Audit" }
  ]
}
```

### Block 3 — Context Capabilities

```json
{
  "$schema": "RT-003-capability-registry",
  "context_capabilities": [
    { "id": "RCCAP-001", "name": "Context Acquisition", "domain": "RCD-01" },
    { "id": "RCCAP-002", "name": "Source Validation", "domain": "RCD-01" },
    { "id": "RCCAP-003", "name": "Context Resolution", "domain": "RCD-02" },
    { "id": "RCCAP-004", "name": "Schema Enforcement", "domain": "RCD-02" },
    { "id": "RCCAP-005", "name": "Context Propagation", "domain": "RCD-03" },
    { "id": "RCCAP-006", "name": "Consumer Registration", "domain": "RCD-03" },
    { "id": "RCCAP-007", "name": "Boundary Enforcement", "domain": "RCD-04" },
    { "id": "RCCAP-008", "name": "Isolation Provisioning", "domain": "RCD-04" },
    { "id": "RCCAP-009", "name": "Context Persistence", "domain": "RCD-05" },
    { "id": "RCCAP-010", "name": "Snapshot Management", "domain": "RCD-05" },
    { "id": "RCCAP-011", "name": "Context Synchronization", "domain": "RCD-06" },
    { "id": "RCCAP-012", "name": "Version Management", "domain": "RCD-06" },
    { "id": "RCCAP-013", "name": "Governance Enforcement", "domain": "RCD-07" },
    { "id": "RCCAP-014", "name": "Lineage Tracking", "domain": "RCD-07" }
  ]
}
```

### Block 4 — Context Functions

```json
{
  "$schema": "RT-003-function-registry",
  "context_functions": [
    { "id": "RCF-01", "name": "Acquire Context", "capability": "RCCAP-001", "domain": "RCD-01" },
    { "id": "RCF-02", "name": "Validate Source", "capability": "RCCAP-002", "domain": "RCD-01" },
    { "id": "RCF-03", "name": "Resolve Context", "capability": "RCCAP-003", "domain": "RCD-02" },
    { "id": "RCF-04", "name": "Enforce Schema", "capability": "RCCAP-004", "domain": "RCD-02" },
    { "id": "RCF-05", "name": "Propagate Context", "capability": "RCCAP-005", "domain": "RCD-03" },
    { "id": "RCF-06", "name": "Register Consumer", "capability": "RCCAP-006", "domain": "RCD-03" },
    { "id": "RCF-07", "name": "Enforce Boundary", "capability": "RCCAP-007", "domain": "RCD-04" },
    {
      "id": "RCF-08",
      "name": "Provision Isolation",
      "capability": "RCCAP-008",
      "domain": "RCD-04"
    },
    { "id": "RCF-09", "name": "Persist Context", "capability": "RCCAP-009", "domain": "RCD-05" },
    { "id": "RCF-10", "name": "Manage Snapshot", "capability": "RCCAP-010", "domain": "RCD-05" },
    {
      "id": "RCF-11",
      "name": "Synchronize Context",
      "capability": "RCCAP-011",
      "domain": "RCD-06"
    },
    { "id": "RCF-12", "name": "Manage Version", "capability": "RCCAP-012", "domain": "RCD-06" },
    { "id": "RCF-13", "name": "Enforce Governance", "capability": "RCCAP-013", "domain": "RCD-07" },
    { "id": "RCF-14", "name": "Track Lineage", "capability": "RCCAP-014", "domain": "RCD-07" }
  ]
}
```

### Block 5 — Context Stages

```json
{
  "$schema": "RT-003-stage-registry",
  "context_stages": [
    {
      "id": "RCST-01",
      "name": "Acquisition",
      "input": "RawSourceData",
      "output": "AcquiredContext",
      "domain": "RCD-01"
    },
    {
      "id": "RCST-02",
      "name": "Validation",
      "input": "AcquiredContext",
      "output": "ValidatedContext",
      "domain": "RCD-01"
    },
    {
      "id": "RCST-03",
      "name": "Resolution",
      "input": "ValidatedContext",
      "output": "ResolvedContext",
      "domain": "RCD-02"
    },
    {
      "id": "RCST-04",
      "name": "Registration",
      "input": "ResolvedContext",
      "output": "RegisteredContext",
      "domain": "RCD-02"
    },
    {
      "id": "RCST-05",
      "name": "Propagation",
      "input": "RegisteredContext",
      "output": "PropagatedContext",
      "domain": "RCD-03"
    },
    {
      "id": "RCST-06",
      "name": "Activation",
      "input": "PropagatedContext",
      "output": "ActiveContext",
      "domain": "RCD-03"
    },
    {
      "id": "RCST-07",
      "name": "Synchronization",
      "input": "ActiveContext",
      "output": "SynchronizedContext",
      "domain": "RCD-06"
    },
    {
      "id": "RCST-08",
      "name": "Archival",
      "input": "SynchronizedContext",
      "output": "ArchivedContext",
      "domain": "RCD-05"
    }
  ],
  "total_stages": 8
}
```

### Block 6 — Context Models

```json
{
  "$schema": "RT-003-model-registry",
  "context_models": [
    {
      "id": "RCM-01",
      "name": "Execution Context",
      "domain": "RCD-01",
      "input": "ExecutionRequest",
      "output": "ExecutionEnvironment",
      "consumers": ["AI-003", "AI-006", "AI-008"]
    },
    {
      "id": "RCM-02",
      "name": "Session Context",
      "domain": "RCD-02",
      "input": "SessionStart",
      "output": "SessionState",
      "consumers": ["AI-009", "AI-010"]
    },
    {
      "id": "RCM-03",
      "name": "User Context",
      "domain": "RCD-03",
      "input": "UserIdentity",
      "output": "UserProfile",
      "consumers": ["AI-009", "AI-010", "AI-013"]
    },
    {
      "id": "RCM-04",
      "name": "Agent Context",
      "domain": "RCD-04",
      "input": "AgentRequest",
      "output": "AgentEnvironment",
      "consumers": ["AI-001", "AI-002", "AI-014"]
    },
    {
      "id": "RCM-05",
      "name": "Knowledge Context",
      "domain": "RCD-05",
      "input": "KnowledgeQuery",
      "output": "KnowledgeResult",
      "consumers": ["AI-011", "AI-013"]
    },
    {
      "id": "RCM-06",
      "name": "Operational Context",
      "domain": "RCD-06",
      "input": "OperationRequest",
      "output": "OperationEnvironment",
      "consumers": ["AI-010", "AI-012"]
    },
    {
      "id": "RCM-07",
      "name": "Environmental Context",
      "domain": "RCD-07",
      "input": "EnvironmentSnapshot",
      "output": "EnvironmentState",
      "consumers": ["AI-014"]
    },
    {
      "id": "RCM-08",
      "name": "Composite Context",
      "domain": "RCD-08",
      "input": "MultipleContexts",
      "output": "ComposedContext",
      "consumers": ["AI-014"]
    }
  ],
  "total_models": 8
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Context Record Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-003-context-record",
  "title": "Context Record Schema",
  "description": "Schema for a context record in the Enterprise Runtime Context Architecture",
  "type": "object",
  "properties": {
    "context_id": {
      "type": "string",
      "description": "شناسه یکتای بافت",
      "pattern": "^RCC-[0-9]{12}-[A-Z0-9]{8}$"
    },
    "context_domain": {
      "type": "string",
      "description": "دامنه بافت",
      "enum": ["RCD-01", "RCD-02", "RCD-03", "RCD-04", "RCD-05", "RCD-06", "RCD-07", "RCD-08"]
    },
    "status": {
      "type": "string",
      "description": "وضعیت بافت",
      "enum": [
        "undefined",
        "collecting",
        "resolving",
        "active",
        "shared",
        "suspended",
        "expired",
        "archived"
      ]
    },
    "context_type": {
      "type": "string",
      "description": "نوع بافت",
      "enum": [
        "execution",
        "session",
        "user",
        "agent",
        "knowledge",
        "operational",
        "environmental",
        "composite"
      ]
    },
    "source": {
      "type": "string",
      "description": "منبع بافت",
      "pattern": "^SRC-[A-Z0-9]{8}$"
    },
    "schema": {
      "type": "string",
      "description": "شمای بافت",
      "pattern": "^SCH-[A-Z0-9]{8}$"
    },
    "data": {
      "type": "object",
      "description": "داده‌های بافتی",
      "properties": {
        "scope": { "type": "string" },
        "lifetime": {
          "type": "string",
          "enum": ["transient", "short-lived", "session-bound", "long-lived", "permanent"]
        },
        "visibility": { "type": "string", "enum": ["private", "protected", "shared", "public"] },
        "sensitivity": {
          "type": "string",
          "enum": ["public", "internal", "confidential", "restricted", "critical"]
        }
      }
    },
    "boundary": {
      "type": "object",
      "description": "مرز بافت",
      "properties": {
        "allowed_consumers": { "type": "array", "items": { "type": "string" } },
        "max_scope": { "type": "string" },
        "isolated": { "type": "boolean" }
      }
    },
    "validity": {
      "type": "object",
      "description": "اعتبار بافت",
      "properties": {
        "valid_from": { "type": "string", "format": "date-time" },
        "valid_until": { "type": "string", "format": "date-time" }
      }
    },
    "created_at": {
      "type": "string",
      "description": "زمان ایجاد بافت",
      "format": "date-time"
    }
  },
  "required": ["context_id", "context_domain", "status", "context_type", "source", "data"]
}
```

### Schema 2 — Context Propagation Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-003-context-propagation",
  "title": "Context Propagation Schema",
  "description": "Schema for context propagation in the Enterprise Runtime Context Architecture",
  "type": "object",
  "properties": {
    "propagation_id": {
      "type": "string",
      "description": "شناسه یکتای انتشار"
    },
    "context_id": {
      "type": "string",
      "description": "شناسه بافت مبدأ"
    },
    "propagation_type": {
      "type": "string",
      "description": "نوع انتشار",
      "enum": ["direct", "broadcast", "selective", "deferred"]
    },
    "consumers": {
      "type": "array",
      "description": "مصرف‌کنندگان هدف",
      "items": {
        "type": "object",
        "properties": {
          "consumer_id": { "type": "string" },
          "consumer_type": {
            "type": "string",
            "enum": ["agent", "workflow", "execution", "session"]
          }
        }
      }
    },
    "isolation_level": {
      "type": "string",
      "description": "سطح ایزولاسیون",
      "enum": ["full", "schema", "boundary"]
    },
    "visibility": {
      "type": "string",
      "description": "سطح دید",
      "enum": ["private", "protected", "shared", "public"]
    },
    "schema": {
      "type": "object",
      "description": "شمای بافت انتشاریافته",
      "properties": {
        "schema_id": { "type": "string" },
        "schema_version": { "type": "string" }
      }
    },
    "initiated_at": {
      "type": "string",
      "description": "زمان شروع انتشار",
      "format": "date-time"
    },
    "completed_at": {
      "type": "string",
      "description": "زمان پایان انتشار",
      "format": "date-time"
    }
  },
  "required": ["propagation_id", "context_id", "propagation_type", "consumers", "isolation_level"]
}
```

### Schema 3 — Context State Transition Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-003-state-transition",
  "title": "Context State Transition Schema",
  "description": "Schema for a state transition in the Enterprise Runtime Context Architecture",
  "type": "object",
  "properties": {
    "transition_id": {
      "type": "string",
      "description": "شناسه یکتای انتقال"
    },
    "context_id": {
      "type": "string",
      "description": "شناسه بافت"
    },
    "from_state": {
      "type": "string",
      "description": "حالت مبدأ",
      "enum": ["RCS-01", "RCS-02", "RCS-03", "RCS-04", "RCS-05", "RCS-06", "RCS-07", "RCS-08"]
    },
    "to_state": {
      "type": "string",
      "description": "حالت مقصد",
      "enum": ["RCS-01", "RCS-02", "RCS-03", "RCS-04", "RCS-05", "RCS-06", "RCS-07", "RCS-08"]
    },
    "condition": {
      "type": "string",
      "description": "شرط انتقال"
    },
    "triggered_by": {
      "type": "string",
      "description": "علت انتقال",
      "enum": ["system", "operator", "scheduler", "policy", "error", "consumer", "expiry"]
    },
    "stage": {
      "type": "string",
      "description": "مرحله مرتبط",
      "enum": [
        "acquisition",
        "validation",
        "resolution",
        "registration",
        "propagation",
        "activation",
        "synchronization",
        "archival"
      ]
    },
    "timestamp": {
      "type": "string",
      "description": "زمان انتقال",
      "format": "date-time"
    },
    "metadata": {
      "type": "object",
      "description": "فراداده انتقال",
      "properties": {
        "duration": { "type": "integer", "description": "مدت زمان در حالت قبلی (میلی‌ثانیه)" },
        "reason": { "type": "string" },
        "source_version": { "type": "string", "description": "نسخه بافت قبل از انتقال" },
        "target_version": { "type": "string", "description": "نسخه بافت بعد از انتقال" }
      }
    }
  },
  "required": ["transition_id", "context_id", "from_state", "to_state", "condition", "triggered_by"]
}
```

---

## ۲۹. Context Quality Gates

۷ گیت کیفیت بافت:

| ID      | گیت                        | مرحله   | معیار عبور                                         |
| ------- | -------------------------- | ------- | -------------------------------------------------- |
| RCQG-01 | **Source Validation**      | RCST-01 | منبع بافت معتبر، قابل دسترس و مجاز است             |
| RCQG-02 | **Data Completeness**      | RCST-02 | داده‌های جمع‌آوری‌شده کامل و بدون نقص هستند        |
| RCQG-03 | **Schema Compliance**      | RCST-03 | داده‌های بافت با شمای تعریف‌شده مطابقت کامل دارند  |
| RCQG-04 | **Registration Integrity** | RCST-04 | هویت، شمای، مرز و منبع بافت ثبت شده است            |
| RCQG-05 | **Propagation Success**    | RCST-05 | همه مصرف‌کنندگان هدف بافت را دریافت کرده‌اند       |
| RCQG-06 | **Activation Readiness**   | RCST-06 | بافت فعال، معتبر و آماده مصرف است                  |
| RCQG-07 | **Archival Completeness**  | RCST-07 | بافت بایگانی، شجره کامل و مسیر حسابرسی ثبت شده است |

---

## ۳۰. Cross-Domain Context Mapping

### نگاشت بین دامنه‌های بافت

| دامنه مبدأ               | دامنه مقصد               | نوع نگاشت  | توضیح                                         |
| ------------------------ | ------------------------ | ---------- | --------------------------------------------- |
| RCD-01 (Acquisition)     | RCD-02 (Resolution)      | Direct     | داده اکتسابی به تفکیک نیاز دارد               |
| RCD-02 (Resolution)      | RCD-03 (Propagation)     | Direct     | بافت تفکیک‌شده قابل انتشار است                |
| RCD-02 (Resolution)      | RCD-05 (Persistence)     | Direct     | بافت تفکیک‌شده قابل ذخیره است                 |
| RCD-03 (Propagation)     | RCD-04 (Isolation)       | Contextual | انتشار باید در مرز ایزوله انجام شود           |
| RCD-03 (Propagation)     | RCD-06 (Synchronization) | Direct     | انتشار نیاز به همگام‌سازی دارد                |
| RCD-04 (Isolation)       | RCD-07 (Governance)      | Direct     | ایزولاسیون توسط حکمرانی اعمال می‌شود          |
| RCD-05 (Persistence)     | RCD-08 (Evolution)       | Composite  | ماندگاری بر تکامل تأثیر می‌گذارد              |
| RCD-06 (Synchronization) | RCD-03 (Propagation)     | Direct     | همگام‌سازی به انتشار مجدد منتهی می‌شود        |
| RCD-07 (Governance)      | RCD-01..RCD-08           | Universal  | حکمرانی بر همه دامنه‌های بافت اعمال می‌شود    |
| RCD-08 (Evolution)       | RCD-01 (Acquisition)     | Composite  | تکامل ممکن است نیاز به اکتساب مجدد داشته باشد |

### نگاشت به RT-001 و RT-002

| RT-۰۰۱/۰۰۲                  | RT-003 (اختصاصی بافت)       | نوع نگاشت                                                 |
| --------------------------- | --------------------------- | --------------------------------------------------------- |
| RTD-02 (Context)            | RCD-01..RCD-08              | تخصصی‌سازی — دامنه بافت RTD-02 به ۸ دامنه تخصصی تبدیل شده |
| RTE-003 (RuntimeContext)    | RCE-001 (ContextRecord)     | تخصصی‌سازی — Context به Record تبدیل شده                  |
| RTS-01..08 (Runtime States) | RCS-01..08 (Context States) | تکامل — دو مدل وضعیت مکمل                                 |
| RTC-003 (Runtime Context)   | RCC-001 (Context)           | تخصصی‌سازی                                                |
| RTC-004 (Runtime Session)   | RCM-02 (Session Context)    | تخصصی‌سازی به مدل بافت نشست                               |
| RTF-03 (Manage Context)     | RCF-01..14                  | گسترش — یک کارکرد به ۱۴ کارکرد تخصصی                      |
| RED-02 (Execution Context)  | RCM-01 (Execution Context)  | ارتباط — دامنه اجرا از بافت اجرا استفاده می‌کند           |

---

> **پایان RT-003 — Enterprise Runtime Context Architecture**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۰۹
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**
