# RT-002 — Enterprise Runtime Execution Architecture

> **معماری اجرای زمان اجرای سازمانی SMOS**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۰۹
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**

---

## ۱. Purpose

RT-002 معماری اجرای زمان اجرای سازمانی SMOS را تعریف می‌کند. Execution (اجرا) هسته مرکزی Runtime است — جایی که وظایف، عملیات و گردش کارهای سازمانی واقعاً انجام می‌شوند. این سند چیستی Execution را از نظر مفهومی و ساختاری تعریف می‌کند — نه نحوه پیاده‌سازی فنی آن.

**SSOT**: تنها منبع معتبر برای معماری اجرای زمان اجرای سازمانی SMOS.

---

## ۲. Scope

این سند محدوده زیر را پوشش می‌دهد:

- اصول و فلسفه اجرا در Runtime
- دامنه‌ها، مفاهیم و موجودیت‌های اجرا
- قابلیت‌ها و کارکردهای اجرا
- مدل مرحله‌ای و مدل وضعیت اجرا
- مدل‌های اجرا (Execution Models)
- مرز اجرا، بافت اجرا، مالکیت و هویت اجرا
- ایزولاسیون، هماهنگی، چرخه حیات و مشاهده‌پذیری اجرا
- سازگاری، ردیابی و حکمرانی اجرا
- روابط، معیارها، محدودیت‌ها و گیت‌های کیفیت اجرا
- ۶ بلوک Machine Readable JSON
- ۳ JSON Schema (Draft-07)

**خارج از محدوده**:

- پیاده‌سازی فنی موتور اجرا
- الگوریتم‌های زمان‌بندی یا هماهنگی
- پیاده‌سازی Workflow Engine
- APIها، پروتکل‌ها یا زبان‌های خاص
- الگوریتم‌های صف یا زمان‌بند
- پایگاه داده یا Vendor خاص
- هرگونه پیاده‌سازی اجرایی
- دیاگرام، نمودار یا نمایش بصری

---

## ۳. Execution Principles

اجرای زمان اجرای SMOS بر ۸ اصل زیر استوار است:

| ID     | اصل                           | توضیح                                                            |
| ------ | ----------------------------- | ---------------------------------------------------------------- |
| REP-01 | **Pipeline Integrity**        | هر اجرا یک خط لوله است — مراحل باید به ترتیب و بدون شکست طی شوند |
| REP-02 | **Context Isolation**         | بافت هر اجرا نباید با بافت اجراهای دیگر تداخل داشته باشد         |
| REP-03 | **Deterministic Consumption** | مصرف یکسان از ورودی باید خروجی یکسان تولید کند                   |
| REP-04 | **Ownership Traceability**    | هر اجرا باید دارای مالک مشخص و مسیر قابل ردیابی باشد             |
| REP-05 | **State Observability**       | وضعیت اجرا در هر لحظه باید قابل مشاهده باشد                      |
| REP-06 | **Boundary Enforcement**      | هر اجرا باید در مرز تعریف‌شده خود باقی بماند                     |
| REP-07 | **Non-Interference**          | اجراها نباید در عملکرد یکدیگر اختلال ایجاد کنند                  |
| REP-08 | **Governance Compliance**     | هر اجرا باید تابع قواعد و سیاست‌های حاکم باشد                    |

این اصول مکمل RTP-01..08 (RT-001) هستند و بر روی آنها بنا شده‌اند.

---

## ۴. Execution Philosophy

اجرای زمان اجرای SMOS بر اساس فلسفه "اجرای امن در خط لوله تعریف‌شده" (Safe Execution Within a Defined Pipeline) طراحی شده است. هر اجرا یک خط لوله از مراحل مشخص است که وظیفه را از دریافت تا تکمیل هدایت می‌کند.

اجرای SMOS:

- **خط لوله‌ای است** — هر اجرا از یک توالی مشخص از مراحل عبور می‌کند
- **ایزوله است** — هر اجرا مرزها و بافت مستقل خود را دارد
- **مشاهده‌پذیر است** — وضعیت و پیشرفت اجرا در هر لحظه قابل مشاهده است
- **مبتنی بر هویت است** — هر اجرا دارای هویت یکتا است
- **مبتنی بر مالکیت است** — هر اجرا دارای مالک و مسئول است
- **سازگار است** — قواعد سازگاری در تمام مراحل اجرا رعایت می‌شوند

---

## ۵. Architecture — Execution in the Layered Model

اجرا در معماری ۵ لایه‌ای RT-001 در لایه LYR-RT-01 (Execution Layer) قرار دارد اما با تمام لایه‌های دیگر تعامل دارد:

| لایه                     | نقش در اجرا                                             |
| ------------------------ | ------------------------------------------------------- |
| LYR-RT-01 (Execution)    | **لایه اصلی اجرا** — مدیریت خط لوله، مراحل و وضعیت اجرا |
| LYR-RT-02 (Context)      | **بافت اجرا** — نگهداری بافت، داده‌ها و شرایط اجرا      |
| LYR-RT-03 (State)        | **حالت اجرا** — مدیریت و ماندگاری وضعیت اجرا            |
| LYR-RT-04 (Coordination) | **هماهنگی اجرا** — هماهنگی بین اجراهای همزمان           |
| LYR-RT-05 (Governance)   | **حکمرانی اجرا** — نظارت، محدودیت و انطباق اجرا         |

---

## ۶. Execution Domains

اجرای زمان اجرای SMOS شامل ۸ دامنه اصلی است:

| ID     | نام                      | توضیح                                         | لایه مرتبط |
| ------ | ------------------------ | --------------------------------------------- | ---------- |
| RED-01 | **Execution Pipeline**   | خط لوله اجرا — توالی مراحل اجرا               | LYR-RT-01  |
| RED-02 | **Execution Context**    | بافت اجرا — داده‌ها و شرایط اجرا              | LYR-RT-02  |
| RED-03 | **Execution State**      | حالت اجرا — وضعیت جاری و انتقال‌ها            | LYR-RT-03  |
| RED-04 | **Execution Scheduling** | زمان‌بندی اجرا — تخصیص زمان و ترتیب اجرا      | LYR-RT-04  |
| RED-05 | **Execution Isolation**  | ایزولاسیون اجرا — جداسازی اجراها از یکدیگر    | LYR-RT-01  |
| RED-06 | **Execution Monitoring** | نظارت اجرا — مشاهده و اندازه‌گیری اجرا        | LYR-RT-05  |
| RED-07 | **Execution Recovery**   | بازیابی اجرا — بازگشت از خطا در اجرا          | LYR-RT-05  |
| RED-08 | **Execution Governance** | حکمرانی اجرا — قواعد و سیاست‌های حاکم بر اجرا | LYR-RT-05  |

این دامنه‌ها بر روی RTD-01..08 (RT-001) بنا شده‌اند و تخصصی‌شده برای حوزه Execution هستند.

---

## ۷. Execution Concepts

۲۰ مفهوم بنیادین اجرا:

| ID      | مفهوم                    | توضیح                                        | دامنه  |
| ------- | ------------------------ | -------------------------------------------- | ------ |
| REC-001 | **Execution Pipeline**   | خط لوله اجرا — توالی تعریف‌شده از مراحل اجرا | RED-01 |
| REC-002 | **Execution Stage**      | مرحله اجرا — یک گام در خط لوله اجرا          | RED-01 |
| REC-003 | **Execution Step**       | گام اجرا — کوچکترین واحد کار در یک مرحله     | RED-01 |
| REC-004 | **Execution Context**    | بافت اجرا — داده‌ها و شرایط مرتبط با اجرا    | RED-02 |
| REC-005 | **Execution State**      | حالت اجرا — وضعیت فعلی یک اجرا               | RED-03 |
| REC-006 | **Execution Transition** | انتقال اجرا — حرکت بین حالت‌های اجرا         | RED-03 |
| REC-007 | **Execution Schedule**   | زمان‌بند اجرا — تعیین ترتیب و زمان اجرا      | RED-04 |
| REC-008 | **Execution Queue**      | صف اجرا — انتظار برای اجرا                   | RED-04 |
| REC-009 | **Execution Boundary**   | مرز اجرا — محدوده مجاز یک اجرا               | RED-05 |
| REC-010 | **Execution Isolation**  | ایزولاسیون اجرا — جداسازی اجراها             | RED-05 |
| REC-011 | **Execution Identity**   | هویت اجرا — شناسه یکتای هر اجرا              | RED-05 |
| REC-012 | **Execution Ownership**  | مالکیت اجرا — مسئول اجرا                     | RED-05 |
| REC-013 | **Execution Monitor**    | ناظر اجرا — مشاهده و اندازه‌گیری اجرا        | RED-06 |
| REC-014 | **Execution Metric**     | معیار اجرا — شاخص اندازه‌گیری اجرا           | RED-06 |
| REC-015 | **Execution Recovery**   | بازیابی اجرا — بازگشت از خطا                 | RED-07 |
| REC-016 | **Execution Retry**      | تلاش مجدد — تکرار اجرا پس از خطا             | RED-07 |
| REC-017 | **Execution Policy**     | سیاست اجرا — قواعد حاکم بر اجرا              | RED-08 |
| REC-018 | **Execution Governance** | حکمرانی اجرا — انطباق و حسابرسی اجرا         | RED-08 |
| REC-019 | **Execution Trace**      | رد اجرا — ثبت مسیر اجرا                      | RED-06 |
| REC-020 | **Execution Contract**   | قرارداد اجرا — توافق بین اجرا و Runtime      | RED-08 |

---

## ۸. Execution Entities

۱۲ موجودیت اصلی اجرا:

| ID      | موجودیت               | توضیح                                    | دامنه  |
| ------- | --------------------- | ---------------------------------------- | ------ |
| REE-001 | **ExecutionPipeline** | خط لوله اجرا — توالی مراحل یک اجرا       | RED-01 |
| REE-002 | **ExecutionStage**    | مرحله خط لوله — یک گام در توالی اجرا     | RED-01 |
| REE-003 | **ExecutionContext**  | بافت اجرا — داده‌های جاری یک اجرا        | RED-02 |
| REE-004 | **ExecutionState**    | حالت اجرا — وضعیت فعلی اجرا              | RED-03 |
| REE-005 | **ExecutionSchedule** | برنامه زمان‌بندی اجرا — زمان‌بندی اجراها | RED-04 |
| REE-006 | **ExecutionBoundary** | مرز اجرا — محدوده مجاز اجرا              | RED-05 |
| REE-007 | **ExecutionIdentity** | هویت اجرا — شناسه یکتای اجرا             | RED-05 |
| REE-008 | **ExecutionOwner**    | مالک اجرا — مسئول اجرا                   | RED-05 |
| REE-009 | **ExecutionMonitor**  | ناظر اجرا — ثبت و مشاهده اجرا            | RED-06 |
| REE-010 | **ExecutionRecovery** | بازیابی اجرا — طرح بازگشت از خطا         | RED-07 |
| REE-011 | **ExecutionPolicy**   | سیاست اجرا — قواعد حاکم بر اجرا          | RED-08 |
| REE-012 | **ExecutionContract** | قرارداد اجرا — توافقنامه اجرا            | RED-08 |

---

## ۹. Execution Capabilities

۱۴ قابلیت اصلی اجرا:

| ID        | قابلیت                     | توضیح                                      | دامنه  |
| --------- | -------------------------- | ------------------------------------------ | ------ |
| RECAP-001 | **Pipeline Definition**    | تعریف خط لوله اجرا — مشخص کردن توالی مراحل | RED-01 |
| RECAP-002 | **Stage Execution**        | اجرای مرحله — اجرای یک گام از خط لوله      | RED-01 |
| RECAP-003 | **Context Provisioning**   | تأمین بافت — ایجاد و نگهداری بافت اجرا     | RED-02 |
| RECAP-004 | **State Management**       | مدیریت حالت — نگهداری و انتقال حالت اجرا   | RED-03 |
| RECAP-005 | **Schedule Management**    | مدیریت زمان‌بندی — تعیین زمان و ترتیب اجرا | RED-04 |
| RECAP-006 | **Queue Management**       | مدیریت صف — نگهداری و مدیریت صف اجرا       | RED-04 |
| RECAP-007 | **Boundary Enforcement**   | اعمال مرز — حفظ اجرا در مرز تعریف‌شده      | RED-05 |
| RECAP-008 | **Identity Assignment**    | تخصیص هویت — اختصاص شناسه یکتا به اجرا     | RED-05 |
| RECAP-009 | **Ownership Assignment**   | تخصیص مالکیت — تعیین مالک اجرا             | RED-05 |
| RECAP-010 | **Execution Monitoring**   | نظارت بر اجرا — مشاهده و ثبت وضعیت اجرا    | RED-06 |
| RECAP-011 | **Metric Collection**      | جمع‌آوری معیار — اندازه‌گیری شاخص‌های اجرا | RED-06 |
| RECAP-012 | **Recovery Execution**     | اجرای بازیابی — بازگشت از خطا در اجرا      | RED-07 |
| RECAP-013 | **Retry Management**       | مدیریت تلاش مجدد — تکرار اجرا پس از خطا    | RED-07 |
| RECAP-014 | **Governance Enforcement** | اعمال حکمرانی — انطباق اجرا با سیاست‌ها    | RED-08 |

---

## ۱۰. Execution Functions

۱۴ کارکرد اجرا:

| ID     | کارکرد             | قابلیت مرتبط | دامنه  |
| ------ | ------------------ | ------------ | ------ |
| REF-01 | Define Pipeline    | RECAP-001    | RED-01 |
| REF-02 | Execute Stage      | RECAP-002    | RED-01 |
| REF-03 | Provision Context  | RECAP-003    | RED-02 |
| REF-04 | Manage State       | RECAP-004    | RED-03 |
| REF-05 | Manage Schedule    | RECAP-005    | RED-04 |
| REF-06 | Manage Queue       | RECAP-006    | RED-04 |
| REF-07 | Enforce Boundary   | RECAP-007    | RED-05 |
| REF-08 | Assign Identity    | RECAP-008    | RED-05 |
| REF-09 | Assign Ownership   | RECAP-009    | RED-05 |
| REF-10 | Monitor Execution  | RECAP-010    | RED-06 |
| REF-11 | Collect Metric     | RECAP-011    | RED-06 |
| REF-12 | Execute Recovery   | RECAP-012    | RED-07 |
| REF-13 | Manage Retry       | RECAP-013    | RED-07 |
| REF-14 | Enforce Governance | RECAP-014    | RED-08 |

---

## ۱۱. Execution Taxonomy

تاکسونومی اجرا در سه بعد اصلی طبقه‌بندی می‌شود:

### بعد ۱: نوع خط لوله

| نوع                      | توضیح                                               |
| ------------------------ | --------------------------------------------------- |
| **Sequential Pipeline**  | خط لوله ترتیبی — مراحل پشت سر هم اجرا می‌شوند       |
| **Parallel Pipeline**    | خط لوله موازی — مراحل به صورت همزمان اجرا می‌شوند   |
| **Conditional Pipeline** | خط لوله شرطی — مسیر اجرا بر اساس شرایط تعیین می‌شود |
| **Dynamic Pipeline**     | خط لوله پویا — مراحل در زمان اجرا تعیین می‌شوند     |

### بعد ۲: نوع ایزولاسیون اجرا

| نوع                          | توضیح                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| **Strict Isolation**         | ایزولاسیون سخت — هیچ اشتراکی بین اجراها مجاز نیست                 |
| **Shared Context Isolation** | ایزولاسیون با بافت مشترک — بافت‌های فقط خواندنی قابل اشتراک       |
| **Cooperative Isolation**    | ایزولاسیون همکارانه — اجراها می‌توانند در چارچوب مشخص همکاری کنند |

### بعد ۳: سطح بحرانیت اجرا

| سطح            | توضیح                                     |
| -------------- | ----------------------------------------- |
| **Critical**   | اجرای بحرانی — توقف آن مجاز نیست          |
| **Important**  | اجرای مهم — توقف فقط در شرایط اضطراری     |
| **Normal**     | اجرای عادی — توقف با اطلاع قبلی مجاز است  |
| **Background** | اجرای پس‌زمینه — توقف در هر زمان مجاز است |

---

## ۱۲. Execution Stage Model

مدل مرحله‌ای اجرا در ۸ مرحله تعریف می‌شود:

| مرحله   | نام          | توضیح                                          | خروجی               |
| ------- | ------------ | ---------------------------------------------- | ------------------- |
| REST-01 | **Receive**  | دریافت وظیفه — پذیرش ورودی و ثبت درخواست اجرا  | Received Request    |
| REST-02 | **Validate** | اعتبارسنجی — بررسی ورودی، بافت و شرایط اجرا    | Validated Request   |
| REST-03 | **Prepare**  | آماده‌سازی — تخصیص منابع، ایجاد بافت و تنظیمات | Prepared Execution  |
| REST-04 | **Allocate** | تخصیص — اختصاص منابع، هویت و مرز به اجرا       | Allocated Execution |
| REST-05 | **Execute**  | اجرا — انجام وظیفه درون مرز تعریف‌شده          | Execution Result    |
| REST-06 | **Observe**  | مشاهده — ثبت معیارها، وضعیت و نتایج اجرا       | Observed Result     |
| REST-07 | **Finalize** | نهایی‌سازی — تکمیل، آزادسازی منابع و ثبت رد    | Finalized Execution |
| REST-08 | **Close**    | بستن — خاتمه رسمی، بایگانی و اطلاع‌رسانی       | Closed Execution    |

---

## ۱۳. Execution State Model

مدل وضعیت اجرا با ۸ وضعیت و ۲۰ انتقال مجاز:

### وضعیت‌ها

| ID     | وضعیت          | توضیح                                     |
| ------ | -------------- | ----------------------------------------- |
| RES-01 | **Created**    | اجرا ایجاد شده — منتظر شروع               |
| RES-02 | **Prepared**   | اجرا آماده — منابع و بافت آماده شده‌اند   |
| RES-03 | **Queued**     | اجرا در صف — منتظر زمان‌بندی              |
| RES-04 | **Executing**  | در حال اجرا — وظیفه در حال انجام است      |
| RES-05 | **Waiting**    | در انتظار — منتظر شرط یا منبع خارجی       |
| RES-06 | **Recovering** | در حال بازیابی — بازگشت از خطا            |
| RES-07 | **Completed**  | تکمیل شده — اجرا با موفقیت به پایان رسیده |
| RES-08 | **Cancelled**  | لغو شده — اجرا قبل از تکمیل لغو شده       |

### انتقال‌های مجاز (۲۰ مورد)

| از     | به     | شرط                                   |
| ------ | ------ | ------------------------------------- |
| RES-01 | RES-02 | تکمیل آماده‌سازی اولیه                |
| RES-01 | RES-08 | انصراف قبل از شروع                    |
| RES-02 | RES-03 | قرار گرفتن در صف زمان‌بندی            |
| RES-02 | RES-08 | عدم امکان آماده‌سازی                  |
| RES-03 | RES-04 | رسیدن نوبت اجرا                       |
| RES-03 | RES-05 | نیاز به منبع خارجی قبل از اجرا        |
| RES-03 | RES-08 | حذف از صف                             |
| RES-04 | RES-05 | نیاز به ورودی خارجی در حین اجرا       |
| RES-04 | RES-06 | خطای قابل بازیابی                     |
| RES-04 | RES-07 | تکمیل موفق اجرا                       |
| RES-04 | RES-08 | خطای غیرقابل بازیابی                  |
| RES-05 | RES-04 | دریافت ورودی یا شرط مورد نیاز         |
| RES-05 | RES-06 | خطا در حین انتظار                     |
| RES-05 | RES-08 | انقضای زمان انتظار                    |
| RES-06 | RES-02 | نیاز به آماده‌سازی مجدد پس از بازیابی |
| RES-06 | RES-03 | بازگشت به صف پس از بازیابی            |
| RES-06 | RES-04 | ادامه اجرا پس از بازیابی موفق         |
| RES-06 | RES-07 | تکمیل موفق در حین بازیابی             |
| RES-06 | RES-08 | شکست بازیابی                          |
| RES-07 | RES-08 | بایگانی و خاتمه نهایی                 |

---

## ۱۴. Execution Models

۸ مدل اجرا:

| ID      | مدل                       | توضیح                           | دامنه  |
| ------- | ------------------------- | ------------------------------- | ------ |
| REDM-01 | **Sequential Execution**  | اجرای ترتیبی — مراحل پشت سر هم  | RED-01 |
| REDM-02 | **Parallel Execution**    | اجرای موازی — مراحل همزمان      | RED-01 |
| REDM-03 | **Conditional Execution** | اجرای شرطی — مسیر بر اساس شرایط | RED-01 |
| REDM-04 | **Isolated Execution**    | اجرای ایزوله — مرزهای سخت       | RED-05 |
| REDM-05 | **Cooperative Execution** | اجرای همکارانه — اشتراک محدود   | RED-05 |
| REDM-06 | **Monitored Execution**   | اجرای تحت نظارت — ثبت کامل      | RED-06 |
| REDM-07 | **Resilient Execution**   | اجرای مقاوم — با بازیابی خودکار | RED-07 |
| REDM-08 | **Governed Execution**    | اجرای تحت حکمرانی — انطباق کامل | RED-08 |

---

## ۱۵. Execution Relationships

۱۰ رابطه اصلی اجرا:

| ID     | رابطه              | مبدأ              | مقصد              | توضیح                                     |
| ------ | ------------------ | ----------------- | ----------------- | ----------------------------------------- |
| RER-01 | **Executes In**    | ExecutionPipeline | RuntimeInstance   | خط لوله در یک نمونه زمان اجرا اجرا می‌شود |
| RER-02 | **Has Stage**      | ExecutionPipeline | ExecutionStage    | خط لوله دارای مراحل است                   |
| RER-03 | **Has Context**    | ExecutionPipeline | ExecutionContext  | خط لوله دارای بافت است                    |
| RER-04 | **Has State**      | ExecutionPipeline | ExecutionState    | خط لوله دارای حالت است                    |
| RER-05 | **Has Identity**   | ExecutionPipeline | ExecutionIdentity | خط لوله دارای هویت است                    |
| RER-06 | **Has Owner**      | ExecutionPipeline | ExecutionOwner    | خط لوله دارای مالک است                    |
| RER-07 | **Monitored By**   | ExecutionPipeline | ExecutionMonitor  | خط لوله توسط ناظر مشاهده می‌شود           |
| RER-08 | **Governed By**    | ExecutionPipeline | ExecutionPolicy   | خط لوله تابع سیاست است                    |
| RER-09 | **Recovered By**   | ExecutionPipeline | ExecutionRecovery | خط لوله توسط بازیابی پشتیبانی می‌شود      |
| RER-10 | **Contracts With** | ExecutionPipeline | ExecutionContract | خط لوله با Runtime قرارداد دارد           |

---

## ۱۶. Execution Integrity

یکپارچگی اجرا بر اساس ۴ بعد تعریف می‌شود:

### بعد ۱: یکپارچگی خط لوله (Pipeline Integrity)

| قاعده                                          | توضیح |
| ---------------------------------------------- | ----- |
| هر خط لوله باید دارای توالی مشخص از مراحل باشد |
| مراحل باید بدون شکست و به ترتیب طی شوند        |
| خط لوله نباید در وضعیت نامعتبر باقی بماند      |

### بعد ۲: یکپارچگی بافت (Context Integrity)

| قاعده                                       | توضیح |
| ------------------------------------------- | ----- |
| هر اجرا باید دارای بافت معتبر باشد          |
| بافت اجرا نباید حاوی داده‌های متناقض باشد   |
| بافت اجرا باید قابل ردیابی تا منبع خود باشد |

### بعد ۳: یکپارچگی حالت (State Integrity)

| قاعده                                     | توضیح |
| ----------------------------------------- | ----- |
| حالت اجرا باید همیشه معتبر باشد           |
| انتقال‌های حالت باید از مجموعه مجاز باشند |
| حالت نباید بدون انتقال مجاز تغییر کند     |

### بعد ۴: یکپارچگی مرز (Boundary Integrity)

| قاعده                                                        | توضیح |
| ------------------------------------------------------------ | ----- |
| هر اجرا باید در مرز تعریف‌شده خود باقی بماند                 |
| اجرا نباید به داده‌ها یا منابع خارج از مرز دسترسی داشته باشد |
| نقض مرز باید منجر به توقف یا هشدار شود                       |

---

## ۱۷. Execution Consistency Rules

۱۲ قاعده سازگاری اجرا:

| ID      | قاعده                                           | توضیح                         |
| ------- | ----------------------------------------------- | ----------------------------- |
| RECR-01 | هر اجرا دقیقاً یک خط لوله دارد                  | Single pipeline per execution |
| RECR-02 | هر خط لوله دقیقاً یک هویت یکتا دارد             | Unique identity per pipeline  |
| RECR-03 | هر خط لوله دقیقاً یک مالک دارد                  | Single owner per pipeline     |
| RECR-04 | هر خط لوله در یک زمان فقط یک حالت دارد          | Single state at any time      |
| RECR-05 | مراحل خط لوله باید به ترتیب تعریف‌شده اجرا شوند | Ordered stage execution       |
| RECR-06 | اجراهای موازی نباید با یکدیگر تداخل داشته باشند | Non-interfering parallelism   |
| RECR-07 | بافت اجرا فقط درون مرز اجرا معتبر است           | Scope-limited context         |
| RECR-08 | بازیابی نباید اجراهای دیگر را مختل کند          | Non-disruptive recovery       |
| RECR-09 | نظارت نباید بر اجرا تأثیر بگذارد                | Non-intrusive monitoring      |
| RECR-10 | سیاست‌ها بر همه اجراها اعمال می‌شوند            | Universal policy enforcement  |
| RECR-11 | قرارداد اجرا باید توسط همه طرفین رعایت شود      | Contract compliance           |
| RECR-12 | خروجی هر مرحله ورودی مرحله بعد است              | Stage output chaining         |

---

## ۱۸. Execution Governance

حکمرانی اجرا بر اساس ۵ سطح اختیار (A-0 تا A-4) و ۴ حوزه حکمرانی تعریف می‌شود:

### حوزه‌های حکمرانی اجرا

| حوزه                    | توضیح                                 |
| ----------------------- | ------------------------------------- |
| **Pipeline Governance** | حکمرانی خط لوله — ایجاد، اصلاح، خاتمه |
| **Context Governance**  | حکمرانی بافت — اعتبارسنجی، نگهداری    |
| **State Governance**    | حکمرانی حالت — انتقال، ماندگاری       |
| **Policy Governance**   | حکمرانی سیاست — تعریف، اعمال، حسابرسی |

### مدل تصمیم‌گیری اجرا

| نوع تصمیم            | سطح اختیار | مسئول        |
| -------------------- | ---------- | ------------ |
| ایجاد خط لوله اجرا   | A-1        | مدیر اجرا    |
| اصلاح مراحل خط لوله  | A-2        | معمار اجرا   |
| توقف اجرا            | A-2        | مدیر اجرا    |
| بازیابی از خطا       | A-2        | مدیر بازیابی |
| تغییر سیاست اجرا     | A-3        | افسر حکمرانی |
| خاتمه اضطراری اجرا   | A-3        | افسر حکمرانی |
| مصالحه بین اجراها    | A-4        | هماهنگ‌ساز   |
| استثنای حکمرانی اجرا | A-4        | معمار سیستم  |

---

## ۱۹. Execution Boundary Model

مدل مرز اجرا (Execution Boundary) محدوده مجاز یک اجرا را مشخص می‌کند:

### ابعاد مرز اجرا

| بعد                   | توضیح                               |
| --------------------- | ----------------------------------- |
| **Domain Boundary**   | مرز دامنه — دامنه‌های مجاز اجرا     |
| **Data Boundary**     | مرز داده — داده‌های قابل دسترس اجرا |
| **Resource Boundary** | مرز منبع — منابع قابل مصرف اجرا     |
| **Time Boundary**     | مرز زمان — حداکثر مدت زمان اجرا     |

### قواعد مرز

| قاعده                                            | توضیح |
| ------------------------------------------------ | ----- |
| هر اجرا باید حداقل یک مرز دامنه داشته باشد       |
| اجرا نمی‌تواند از مرز دامنه خود خارج شود         |
| داده‌های خارج از مرز برای اجرا قابل دسترس نیستند |
| اجرا نمی‌تواند از سهمیه منبع خود تجاوز کند       |
| اجرا باید در بازه زمانی مجاز خود تکمیل شود       |

---

## ۲۰. Execution Context Model

مدل بافت اجرا (Execution Context) نحوه نگهداری و مدیریت داده‌های بافتی اجرا را مشخص می‌کند:

### انواع بافت اجرا

| نوع بافت                | توضیح                                     |
| ----------------------- | ----------------------------------------- |
| **Input Context**       | بافت ورودی — داده‌های ورودی به اجرا       |
| **Stage Context**       | بافت مرحله — داده‌های مربوط به مرحله جاری |
| **Environment Context** | بافت محیط — داده‌های محیط اجرا            |
| **Security Context**    | بافت امنیت — هویت و مجوزهای اجرا          |
| **Governance Context**  | بافت حکمرانی — سیاست‌های فعال اجرا        |

### ویژگی‌های بافت اجرا

| ویژگی                                   | توضیح |
| --------------------------------------- | ----- |
| هر اجرا دارای یک بافت منحصربه‌فرد است   |
| بافت فقط درون مرز اجرا معتبر است        |
| بافت پس از خاتمه اجرا منقضی می‌شود      |
| بافت بین اجراهای مختلف قابل اشتراک نیست |

---

## ۲۱. Execution Ownership & Identity

### مالکیت اجرا

| نقش                     | مسئولیت                               |
| ----------------------- | ------------------------------------- |
| **Execution Owner**     | مالک اجرا — مسئول نهایی اجرا          |
| **Execution Initiator** | آغازگر اجرا — درخواست‌کننده اجرا      |
| **Execution Operator**  | اپراتور اجرا — مدیر اجرا در زمان اجرا |
| **Execution Auditor**   | حسابرس اجرا — ناظر بر انطباق اجرا     |

### هویت اجرا

| ویژگی                                         | توضیح |
| --------------------------------------------- | ----- |
| هر اجرا دارای یک شناسه یکتای global است       |
| شناسه اجرا در تمام مراحل خط لوله ثابت می‌ماند |
| شناسه اجرا قابل ردیابی تا منبع درخواست است    |
| هویت اجرا شامل اطلاعات مالکیت و دامنه است     |

---

## ۲۲. Execution Isolation Model

مدل ایزولاسیون اجرا نحوه جداسازی اجراها از یکدیگر را مشخص می‌کند:

### سطوح ایزولاسیون

| سطح                    | توضیح                                         |
| ---------------------- | --------------------------------------------- |
| **Full Isolation**     | ایزولاسیون کامل — هیچ اشتراکی بین اجراها      |
| **Context Isolation**  | ایزولاسیون بافت — بافت‌ها جدا اما منابع مشترک |
| **Boundary Isolation** | ایزولاسیون مرزی — مرزهای سخت با اشتراک محدود  |

### قواعد ایزولاسیون

| قاعده                                               | توضیح |
| --------------------------------------------------- | ----- |
| اجراها نباید در بافت یکدیگر دخالت کنند              |
| اجراها نباید در وضعیت یکدیگر تغییر ایجاد کنند       |
| اشتراک منابع فقط از طریق مسیرهای تعریف‌شده مجاز است |
| نقض ایزولاسیون باید به ناظر اجرا گزارش شود          |

---

## ۲۳. Execution Coordination Model

مدل هماهنگی اجرا نحوه تعامل بین اجراهای همزمان را مشخص می‌کند:

### انواع هماهنگی

| نوع                           | توضیح                                                |
| ----------------------------- | ---------------------------------------------------- |
| **Sequential Coordination**   | هماهنگی ترتیبی — اجراها پشت سر هم اجرا می‌شوند       |
| **Parallel Coordination**     | هماهنگی موازی — اجراها همزمان اما مستقل              |
| **Dependent Coordination**    | هماهنگی وابسته — اجرای دوم وابسته به نتیجه اجرای اول |
| **Synchronized Coordination** | هماهنگی همگام — اجراها در نقاط مشخص همگام می‌شوند    |

### قواعد هماهنگی

| قاعده                                           | توضیح |
| ----------------------------------------------- | ----- |
| هماهنگی نباید ایزولاسیون اجراها را نقض کند      |
| اجراهای وابسته باید ترتیب مشخصی داشته باشند     |
| همگام‌سازی نباید باعث deadlock شود              |
| شکست در یک اجرا نباید اجراهای مستقل را مختل کند |

---

## ۲۴. Execution Observability

مشاهده‌پذیری اجرا (Execution Observability) نحوه مشاهده، اندازه‌گیری و ثبت وضعیت اجرا را مشخص می‌کند:

### ابعاد مشاهده‌پذیری

| بعد                           | توضیح                                    |
| ----------------------------- | ---------------------------------------- |
| **State Observability**       | مشاهده حالت — وضعیت جاری اجرا در هر لحظه |
| **Progress Observability**    | مشاهده پیشرفت — میزان تکمیل اجرا         |
| **Performance Observability** | مشاهده عملکرد — معیارهای زمانی و منابع   |
| **Health Observability**      | مشاهده سلامت — وضعیت سالم یا ناسالم اجرا |

### عناصر ثبت (Execution Log Entry)

| فیلد         | توضیح                        |
| ------------ | ---------------------------- |
| log_id       | شناسه یکتای ثبت              |
| execution_id | شناسه اجرا                   |
| stage        | مرحله جاری در خط لوله        |
| state        | وضعیت فعلی اجرا              |
| timestamp    | زمان ثبت                     |
| metric       | معیار ثبت‌شده (در صورت وجود) |

---

## ۲۵. Execution Metrics

۱۵ معیار اصلی ارزیابی اجرا:

| ID      | معیار                      | توضیح                       | واحد       |
| ------- | -------------------------- | --------------------------- | ---------- |
| REM-001 | Pipeline Success Rate      | درصد خط لوله‌های موفق به کل | درصد       |
| REM-002 | Average Stage Duration     | میانگین زمان هر مرحله       | میلی‌ثانیه |
| REM-003 | Total Execution Time       | کل زمان اجرا                | میلی‌ثانیه |
| REM-004 | Resource Consumption       | مصرف منابع در طول اجرا      | واحد منبع  |
| REM-005 | Queue Wait Time            | زمان انتظار در صف           | میلی‌ثانیه |
| REM-006 | Recovery Success Rate      | درصد بازیابی‌های موفق       | درصد       |
| REM-007 | Mean Time To Recover       | میانگین زمان بازیابی        | ثانیه      |
| REM-008 | Isolation Violations       | تعداد نقض ایزولاسیون        | عدد        |
| REM-009 | State Transition Errors    | تعداد خطاهای انتقال حالت    | عدد        |
| REM-010 | Policy Violations          | تعداد نقض سیاست             | عدد        |
| REM-011 | Concurrent Execution Count | تعداد اجراهای همزمان        | عدد        |
| REM-012 | Stage Completion Rate      | درصد تکمیل مراحل            | درصد       |
| REM-013 | Retry Count                | تعداد تلاش‌های مجدد         | عدد        |
| REM-014 | Context Switch Overhead    | سربار جابجایی بافت          | درصد       |
| REM-015 | Governance Compliance      | درصد انطباق با حکمرانی      | درصد       |

---

## ۲۶. Execution Constraints

۸ محدودیت اصلی اجرا:

| ID       | محدودیت                                     | توضیح                         |
| -------- | ------------------------------------------- | ----------------------------- |
| RECST-01 | هر اجرا فقط یک خط لوله دارد                 | Single pipeline per execution |
| RECST-02 | هر خط لوله فقط یک حالت در هر زمان دارد      | Single state at any time      |
| RECST-03 | انتقال حالت فقط از طریق انتقال‌های مجاز     | Allowed transitions only      |
| RECST-04 | هر اجرا دارای مرز مشخص و غیرقابل نفوذ است   | Defined boundary              |
| RECST-05 | بافت اجرا فقط درون مرز اجرا معتبر است       | Scope-limited context         |
| RECST-06 | اجرا نباید با اجراهای دیگر تداخل داشته باشد | Non-interference              |
| RECST-07 | بازیابی نباید اجراهای سالم را مختل کند      | Non-disruptive recovery       |
| RECST-08 | هر اجرا باید دارای مالک مشخص باشد           | Mandatory ownership           |

---

## ۲۷. Machine Readable JSON Blocks

### Block 1 — Execution Concepts

```json
{
  "$schema": "RT-002-concept-registry",
  "execution_concepts": [
    { "id": "REC-001", "name": "Execution Pipeline", "domain": "RED-01" },
    { "id": "REC-002", "name": "Execution Stage", "domain": "RED-01" },
    { "id": "REC-003", "name": "Execution Step", "domain": "RED-01" },
    { "id": "REC-004", "name": "Execution Context", "domain": "RED-02" },
    { "id": "REC-005", "name": "Execution State", "domain": "RED-03" },
    { "id": "REC-006", "name": "Execution Transition", "domain": "RED-03" },
    { "id": "REC-007", "name": "Execution Schedule", "domain": "RED-04" },
    { "id": "REC-008", "name": "Execution Queue", "domain": "RED-04" },
    { "id": "REC-009", "name": "Execution Boundary", "domain": "RED-05" },
    { "id": "REC-010", "name": "Execution Isolation", "domain": "RED-05" },
    { "id": "REC-011", "name": "Execution Identity", "domain": "RED-05" },
    { "id": "REC-012", "name": "Execution Ownership", "domain": "RED-05" },
    { "id": "REC-013", "name": "Execution Monitor", "domain": "RED-06" },
    { "id": "REC-014", "name": "Execution Metric", "domain": "RED-06" },
    { "id": "REC-015", "name": "Execution Recovery", "domain": "RED-07" },
    { "id": "REC-016", "name": "Execution Retry", "domain": "RED-07" },
    { "id": "REC-017", "name": "Execution Policy", "domain": "RED-08" },
    { "id": "REC-018", "name": "Execution Governance", "domain": "RED-08" },
    { "id": "REC-019", "name": "Execution Trace", "domain": "RED-06" },
    { "id": "REC-020", "name": "Execution Contract", "domain": "RED-08" }
  ]
}
```

### Block 2 — Execution Entities

```json
{
  "$schema": "RT-002-entity-registry",
  "execution_entities": [
    { "id": "REE-001", "name": "ExecutionPipeline", "domain": "RED-01", "type": "Core" },
    { "id": "REE-002", "name": "ExecutionStage", "domain": "RED-01", "type": "Core" },
    { "id": "REE-003", "name": "ExecutionContext", "domain": "RED-02", "type": "Core" },
    { "id": "REE-004", "name": "ExecutionState", "domain": "RED-03", "type": "Core" },
    { "id": "REE-005", "name": "ExecutionSchedule", "domain": "RED-04", "type": "Operational" },
    { "id": "REE-006", "name": "ExecutionBoundary", "domain": "RED-05", "type": "Core" },
    { "id": "REE-007", "name": "ExecutionIdentity", "domain": "RED-05", "type": "Core" },
    { "id": "REE-008", "name": "ExecutionOwner", "domain": "RED-05", "type": "Governance" },
    { "id": "REE-009", "name": "ExecutionMonitor", "domain": "RED-06", "type": "Audit" },
    { "id": "REE-010", "name": "ExecutionRecovery", "domain": "RED-07", "type": "Operational" },
    { "id": "REE-011", "name": "ExecutionPolicy", "domain": "RED-08", "type": "Governance" },
    { "id": "REE-012", "name": "ExecutionContract", "domain": "RED-08", "type": "Governance" }
  ]
}
```

### Block 3 — Execution Capabilities

```json
{
  "$schema": "RT-002-capability-registry",
  "execution_capabilities": [
    { "id": "RECAP-001", "name": "Pipeline Definition", "domain": "RED-01" },
    { "id": "RECAP-002", "name": "Stage Execution", "domain": "RED-01" },
    { "id": "RECAP-003", "name": "Context Provisioning", "domain": "RED-02" },
    { "id": "RECAP-004", "name": "State Management", "domain": "RED-03" },
    { "id": "RECAP-005", "name": "Schedule Management", "domain": "RED-04" },
    { "id": "RECAP-006", "name": "Queue Management", "domain": "RED-04" },
    { "id": "RECAP-007", "name": "Boundary Enforcement", "domain": "RED-05" },
    { "id": "RECAP-008", "name": "Identity Assignment", "domain": "RED-05" },
    { "id": "RECAP-009", "name": "Ownership Assignment", "domain": "RED-05" },
    { "id": "RECAP-010", "name": "Execution Monitoring", "domain": "RED-06" },
    { "id": "RECAP-011", "name": "Metric Collection", "domain": "RED-06" },
    { "id": "RECAP-012", "name": "Recovery Execution", "domain": "RED-07" },
    { "id": "RECAP-013", "name": "Retry Management", "domain": "RED-07" },
    { "id": "RECAP-014", "name": "Governance Enforcement", "domain": "RED-08" }
  ]
}
```

### Block 4 — Execution Functions

```json
{
  "$schema": "RT-002-function-registry",
  "execution_functions": [
    { "id": "REF-01", "name": "Define Pipeline", "capability": "RECAP-001", "domain": "RED-01" },
    { "id": "REF-02", "name": "Execute Stage", "capability": "RECAP-002", "domain": "RED-01" },
    { "id": "REF-03", "name": "Provision Context", "capability": "RECAP-003", "domain": "RED-02" },
    { "id": "REF-04", "name": "Manage State", "capability": "RECAP-004", "domain": "RED-03" },
    { "id": "REF-05", "name": "Manage Schedule", "capability": "RECAP-005", "domain": "RED-04" },
    { "id": "REF-06", "name": "Manage Queue", "capability": "RECAP-006", "domain": "RED-04" },
    { "id": "REF-07", "name": "Enforce Boundary", "capability": "RECAP-007", "domain": "RED-05" },
    { "id": "REF-08", "name": "Assign Identity", "capability": "RECAP-008", "domain": "RED-05" },
    { "id": "REF-09", "name": "Assign Ownership", "capability": "RECAP-009", "domain": "RED-05" },
    { "id": "REF-10", "name": "Monitor Execution", "capability": "RECAP-010", "domain": "RED-06" },
    { "id": "REF-11", "name": "Collect Metric", "capability": "RECAP-011", "domain": "RED-06" },
    { "id": "REF-12", "name": "Execute Recovery", "capability": "RECAP-012", "domain": "RED-07" },
    { "id": "REF-13", "name": "Manage Retry", "capability": "RECAP-013", "domain": "RED-07" },
    { "id": "REF-14", "name": "Enforce Governance", "capability": "RECAP-014", "domain": "RED-08" }
  ]
}
```

### Block 5 — Execution Stages

```json
{
  "$schema": "RT-002-stage-registry",
  "execution_stages": [
    {
      "id": "REST-01",
      "name": "Receive",
      "input": "ExecutionRequest",
      "output": "ReceivedRequest",
      "domain": "RED-01"
    },
    {
      "id": "REST-02",
      "name": "Validate",
      "input": "ReceivedRequest",
      "output": "ValidatedRequest",
      "domain": "RED-01"
    },
    {
      "id": "REST-03",
      "name": "Prepare",
      "input": "ValidatedRequest",
      "output": "PreparedExecution",
      "domain": "RED-01"
    },
    {
      "id": "REST-04",
      "name": "Allocate",
      "input": "PreparedExecution",
      "output": "AllocatedExecution",
      "domain": "RED-04"
    },
    {
      "id": "REST-05",
      "name": "Execute",
      "input": "AllocatedExecution",
      "output": "ExecutionResult",
      "domain": "RED-01"
    },
    {
      "id": "REST-06",
      "name": "Observe",
      "input": "ExecutionResult",
      "output": "ObservedResult",
      "domain": "RED-06"
    },
    {
      "id": "REST-07",
      "name": "Finalize",
      "input": "ObservedResult",
      "output": "FinalizedExecution",
      "domain": "RED-01"
    },
    {
      "id": "REST-08",
      "name": "Close",
      "input": "FinalizedExecution",
      "output": "ClosedExecution",
      "domain": "RED-01"
    }
  ],
  "total_stages": 8
}
```

### Block 6 — Execution Models

```json
{
  "$schema": "RT-002-model-registry",
  "execution_models": [
    {
      "id": "REDM-01",
      "name": "Sequential Execution",
      "domain": "RED-01",
      "input": "SequenceRequest",
      "output": "SequenceResult",
      "consumers": ["AI-003", "AI-006", "AI-008"]
    },
    {
      "id": "REDM-02",
      "name": "Parallel Execution",
      "domain": "RED-01",
      "input": "ParallelRequest",
      "output": "ParallelResult",
      "consumers": ["AI-007", "AI-010"]
    },
    {
      "id": "REDM-03",
      "name": "Conditional Execution",
      "domain": "RED-01",
      "input": "ConditionalRequest",
      "output": "ConditionalResult",
      "consumers": ["AI-001", "AI-002", "AI-014"]
    },
    {
      "id": "REDM-04",
      "name": "Isolated Execution",
      "domain": "RED-05",
      "input": "IsolatedTask",
      "output": "IsolatedResult",
      "consumers": ["AI-014"]
    },
    {
      "id": "REDM-05",
      "name": "Cooperative Execution",
      "domain": "RED-05",
      "input": "CooperationRequest",
      "output": "CooperationResult",
      "consumers": ["AI-009", "AI-014"]
    },
    {
      "id": "REDM-06",
      "name": "Monitored Execution",
      "domain": "RED-06",
      "input": "MonitoringSpec",
      "output": "MonitoringReport",
      "consumers": ["AI-010", "AI-012"]
    },
    {
      "id": "REDM-07",
      "name": "Resilient Execution",
      "domain": "RED-07",
      "input": "ResilientTask",
      "output": "ResilientResult",
      "consumers": ["AI-012", "AI-014"]
    },
    {
      "id": "REDM-08",
      "name": "Governed Execution",
      "domain": "RED-08",
      "input": "GovernedTask",
      "output": "GovernedResult",
      "consumers": ["AI-004", "AI-011", "AI-014"]
    }
  ],
  "total_models": 8
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Execution Pipeline Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-002-execution-pipeline",
  "title": "Execution Pipeline Schema",
  "description": "Schema for an execution pipeline in the Enterprise Runtime Execution Architecture",
  "type": "object",
  "properties": {
    "pipeline_id": {
      "type": "string",
      "description": "شناسه یکتای خط لوله اجرا",
      "pattern": "^REP-[0-9]{12}-[A-Z0-9]{8}$"
    },
    "execution_domain": {
      "type": "string",
      "description": "دامنه اجرا",
      "enum": ["RED-01", "RED-02", "RED-03", "RED-04", "RED-05", "RED-06", "RED-07", "RED-08"]
    },
    "status": {
      "type": "string",
      "description": "وضعیت خط لوله",
      "enum": [
        "created",
        "prepared",
        "queued",
        "executing",
        "waiting",
        "recovering",
        "completed",
        "cancelled"
      ]
    },
    "stages": {
      "type": "array",
      "description": "مراحل خط لوله",
      "items": {
        "type": "object",
        "properties": {
          "stage_id": { "type": "string" },
          "stage_name": {
            "type": "string",
            "enum": [
              "receive",
              "validate",
              "prepare",
              "allocate",
              "execute",
              "observe",
              "finalize",
              "close"
            ]
          },
          "order": { "type": "integer" },
          "status": { "type": "string" }
        }
      }
    },
    "context": {
      "type": "object",
      "description": "بافت اجرا",
      "properties": {
        "context_id": { "type": "string" },
        "context_type": {
          "type": "string",
          "enum": ["input", "stage", "environment", "security", "governance"]
        },
        "scope": { "type": "string" }
      }
    },
    "boundary": {
      "type": "object",
      "description": "مرز اجرا",
      "properties": {
        "allowed_domains": { "type": "array", "items": { "type": "string" } },
        "max_duration": { "type": "integer", "description": "حداکثر مدت زمان اجرا (ثانیه)" },
        "resource_limit": { "type": "object" }
      }
    },
    "owner": {
      "type": "string",
      "description": "مالک اجرا",
      "pattern": "^AI-[0-9]{3}$|^Human$|^System$"
    },
    "created_at": {
      "type": "string",
      "description": "زمان ایجاد خط لوله",
      "format": "date-time"
    }
  },
  "required": ["pipeline_id", "execution_domain", "status", "stages", "owner"]
}
```

### Schema 2 — Execution Stage Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-002-execution-stage",
  "title": "Execution Stage Schema",
  "description": "Schema for an execution stage in the Enterprise Runtime Execution Architecture",
  "type": "object",
  "properties": {
    "stage_id": {
      "type": "string",
      "description": "شناسه یکتای مرحله"
    },
    "pipeline_id": {
      "type": "string",
      "description": "شناسه خط لوله مرتبط"
    },
    "stage_name": {
      "type": "string",
      "description": "نام مرحله",
      "enum": [
        "receive",
        "validate",
        "prepare",
        "allocate",
        "execute",
        "observe",
        "finalize",
        "close"
      ]
    },
    "order": {
      "type": "integer",
      "description": "ترتیب مرحله در خط لوله"
    },
    "status": {
      "type": "string",
      "description": "وضعیت مرحله",
      "enum": ["pending", "active", "completed", "failed", "skipped"]
    },
    "input": {
      "type": "object",
      "description": "ورودی مرحله",
      "properties": {
        "source_stage": { "type": "string" },
        "data_type": { "type": "string" }
      }
    },
    "output": {
      "type": "object",
      "description": "خروجی مرحله",
      "properties": {
        "target_stage": { "type": "string" },
        "data_type": { "type": "string" }
      }
    },
    "started_at": {
      "type": "string",
      "description": "زمان شروع مرحله",
      "format": "date-time"
    },
    "completed_at": {
      "type": "string",
      "description": "زمان پایان مرحله",
      "format": "date-time"
    }
  },
  "required": ["stage_id", "pipeline_id", "stage_name", "order", "status"]
}
```

### Schema 3 — Execution State Transition Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-002-state-transition",
  "title": "Execution State Transition Schema",
  "description": "Schema for a state transition in the Enterprise Runtime Execution Architecture",
  "type": "object",
  "properties": {
    "transition_id": {
      "type": "string",
      "description": "شناسه یکتای انتقال"
    },
    "execution_id": {
      "type": "string",
      "description": "شناسه اجرا"
    },
    "from_state": {
      "type": "string",
      "description": "حالت مبدأ",
      "enum": ["RES-01", "RES-02", "RES-03", "RES-04", "RES-05", "RES-06", "RES-07", "RES-08"]
    },
    "to_state": {
      "type": "string",
      "description": "حالت مقصد",
      "enum": ["RES-01", "RES-02", "RES-03", "RES-04", "RES-05", "RES-06", "RES-07", "RES-08"]
    },
    "condition": {
      "type": "string",
      "description": "شرط انتقال"
    },
    "triggered_by": {
      "type": "string",
      "description": "علت انتقال",
      "enum": ["system", "operator", "scheduler", "error", "policy", "external"]
    },
    "stage": {
      "type": "string",
      "description": "مرحله مرتبط در خط لوله",
      "enum": [
        "receive",
        "validate",
        "prepare",
        "allocate",
        "execute",
        "observe",
        "finalize",
        "close"
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
        "reason": { "type": "string" }
      }
    }
  },
  "required": [
    "transition_id",
    "execution_id",
    "from_state",
    "to_state",
    "condition",
    "triggered_by"
  ]
}
```

---

## ۲۹. Execution Quality Gates

۷ گیت کیفیت اجرا:

| ID      | گیت                      | مرحله   | معیار عبور                                     |
| ------- | ------------------------ | ------- | ---------------------------------------------- |
| REQG-01 | **Request Validation**   | REST-01 | ورودی معتبر، کامل و قابل پردازش است            |
| REQG-02 | **Context Readiness**    | REST-02 | بافت کامل، سازگار و معتبر است                  |
| REQG-03 | **Resource Sufficiency** | REST-03 | منابع کافی برای اجرا تخصیص یافته               |
| REQG-04 | **Allocation Integrity** | REST-04 | هویت، مرز و مالکیت اجرا معتبر هستند            |
| REQG-05 | **Execution Health**     | REST-05 | اجرا بدون خطا و در مرز مجاز است                |
| REQG-06 | **Observation Complete** | REST-06 | همه معیارها ثبت و وضعیت مستند شده است          |
| REQG-07 | **Closure Integrity**    | REST-07 | منابع آزاد، رد ثبت و اطلاع‌رسانی انجام شده است |

---

## ۳۰. Cross-Domain Execution Mapping

### نگاشت بین دامنه‌های اجرا

| دامنه مبدأ          | دامنه مقصد          | نوع نگاشت  | توضیح                                |
| ------------------- | ------------------- | ---------- | ------------------------------------ |
| RED-01 (Pipeline)   | RED-02 (Context)    | Direct     | خط لوله نیاز به بافت دارد            |
| RED-01 (Pipeline)   | RED-03 (State)      | Direct     | خط لوله دارای حالت است               |
| RED-01 (Pipeline)   | RED-04 (Scheduling) | Direct     | خط لوله نیاز به زمان‌بندی دارد       |
| RED-01 (Pipeline)   | RED-05 (Isolation)  | Direct     | خط لوله نیاز به ایزولاسیون دارد      |
| RED-02 (Context)    | RED-05 (Isolation)  | Direct     | بافت در مرز ایزوله محافظت می‌شود     |
| RED-03 (State)      | RED-06 (Monitoring) | Composite  | وضعیت توسط ناظر ثبت می‌شود           |
| RED-06 (Monitoring) | RED-05 (Isolation)  | Contextual | نظارت نباید ایزولاسیون را نقض کند    |
| RED-07 (Recovery)   | RED-03 (State)      | Direct     | بازیابی وضعیت را تغییر می‌دهد        |
| RED-07 (Recovery)   | RED-06 (Monitoring) | Composite  | بازیابی نیاز به نظارت دارد           |
| RED-08 (Governance) | RED-01..RED-07      | Universal  | حکمرانی بر همه دامنه‌ها اعمال می‌شود |

### نگاشت به RT-001

| RT-001 (عمومی)              | RT-002 (اختصاصی اجرا)         | نوع نگاشت                                           |
| --------------------------- | ----------------------------- | --------------------------------------------------- |
| RTD-01 (Execution)          | RED-01..RED-08                | تخصصی‌سازی — هر دامنه RTD به REDهای تخصصی تبدیل شده |
| RTE-009 (ExecutionTask)     | REE-001 (ExecutionPipeline)   | تخصصی‌سازی — Task به Pipeline تبدیل شده             |
| RTS-01..08 (Runtime States) | RES-01..08 (Execution States) | تکامل — دو مدل وضعیت مکمل                           |
| RTC-011 (Runtime Execution) | REC-001 (Execution Pipeline)  | تخصصی‌سازی                                          |
| RTF-02 (Execute Task)       | REF-01..14                    | گسترش — یک کارکرد به ۱۴ کارکرد تخصصی                |

---

> **پایان RT-002 — Enterprise Runtime Execution Architecture**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۰۹
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**
