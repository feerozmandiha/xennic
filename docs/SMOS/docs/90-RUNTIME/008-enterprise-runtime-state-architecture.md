# RT-005 — Enterprise Runtime State Architecture

> **معماری وضعیت زمان اجرای سازمانی SMOS**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۱۰
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**

---

## ۱. Purpose

RT-005 معماری وضعیت (State) زمان اجرای سازمانی SMOS را تعریف می‌کند. State (وضعیت) نمایش رسمی و قطعی شرایط یک موجودیت در زمان اجرا است. State Architecture چارچوبی برای تعریف، اعتبارسنجی، انتقال، ماندگاری و تکامل وضعیت‌ها در سراسر Runtime فراهم می‌کند.

**SSOT**: تنها منبع معتبر برای معماری وضعیت زمان اجرای سازمانی SMOS.

---

## ۲. Scope

این سند محدوده زیر را پوشش می‌دهد:

- اصول و فلسفه وضعیت در Runtime
- دامنه‌ها، مفاهیم و موجودیت‌های وضعیت
- قابلیت‌ها و کارکردهای وضعیت
- مدل کلاس و مدل وضعیت
- مدل‌های وضعیت (State Models)
- مدل‌های تعریف، اعتبارسنجی، سازگاری و تکامل وضعیت
- روابط، معیارها، محدودیت‌ها و گیت‌های کیفیت وضعیت
- ۶ بلوک Machine Readable JSON
- ۳ JSON Schema (Draft-07)

**خارج از محدوده**:

- پیاده‌سازی فنی مدیریت وضعیت
- الگوریتم‌های انتقال یا همگام‌سازی وضعیت
- حافظه نهان (Cache) یا پایگاه داده وضعیت
- APIها، پروتکل‌ها یا زبان‌های خاص
- State Machine پیاده‌سازی شده
- پایگاه داده یا Vendor خاص
- هرگونه پیاده‌سازی اجرایی
- دیاگرام، نمودار یا نمایش بصری

---

## ۳. State Principles

وضعیت زمان اجرای SMOS بر ۸ اصل زیر استوار است:

| ID      | اصل                                     | توضیح                                                    |
| ------- | --------------------------------------- | -------------------------------------------------------- |
| RSTP-01 | **State is Deterministic**              | هر وضعیت در هر زمان نتیجه قطعی و قابل پیش‌بینی دارد      |
| RSTP-02 | **Transitions are Explicit**            | انتقال بین وضعیت‌ها صریح، ثبت‌شده و قابل حسابرسی است     |
| RSTP-03 | **State Lineage is Traceable**          | مسیر تکامل وضعیت از ایجاد تا خاتمه قابل ردیابی است       |
| RSTP-04 | **State Ownership is Unique**           | هر وضعیت در هر زمان دارای یک مالک مشخص است               |
| RSTP-05 | **State Synchronization is Controlled** | همگام‌سازی وضعیت‌های موازی تحت حکمرانی انجام می‌شود      |
| RSTP-06 | **State Persistence is Governed**       | ماندگاری وضعیت بر اساس سیاست‌های تعریف‌شده مدیریت می‌شود |
| RSTP-07 | **State Consistency is Verifiable**     | سازگاری وضعیت در همه دامنه‌ها قابل راستی‌آزمایی است      |
| RSTP-08 | **State Evolution is Auditable**        | تمام تغییرات وضعیت در طول تکامل قابل حسابرسی هستند       |

این اصول مکمل RTP-01..08 (RT-001)، REP-01..08 (RT-002)، RCP-01..08 (RT-003) و RSP-01..08 (RT-004) هستند.

---

## ۴. State Philosophy

وضعیت زمان اجرای SMOS بر اساس فلسفه "وضعیت قطعی با انتقال صریح در چرخه حیات قابل ردیابی" (Deterministic State with Explicit Transition in Traceable Lifecycle) طراحی شده است. وضعیت به عنوان نمایش رسمی شرایط یک موجودیت در Runtime عمل می‌کند که:

- **قطعی است** — شرایط موجودیت در هر لحظه بدون ابهام تعریف می‌شود
- **انتقالی است** — وضعیت فقط از طریق انتقال‌های مجاز تغییر می‌کند
- **ثابت است** — در غیاب انتقال، وضعیت بدون تغییر می‌ماند
- **مستقل است** — وضعیت هر موجودیت مستقل از دیگران تعریف می‌شود
- **قابل ردیابی است** — تمام انتقال‌ها ثبت و قابل بازگشت هستند
- **قابل اعتبارسنجی است** — هر وضعیت و انتقال قابل راستی‌آزمایی است

---

## ۵. Architecture — State in the Layered Model

وضعیت در معماری ۵ لایه‌ای RT-001 در تمام لایه‌ها حضور دارد اما هسته آن در لایه LYR-RT-03 (State) قرار دارد:

| لایه                          | نقش در وضعیت                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------- |
| LYR-RT-01 (Execution)         | **مصرف‌کننده وضعیت** — اجراها وضعیت‌های خود را از لایه State دریافت می‌کنند      |
| LYR-RT-02 (Context & Session) | **تأمین‌کننده وضعیت** — بافت و نشست وضعیت‌های خود را به لایه State ارائه می‌دهند |
| LYR-RT-03 (State)             | **لایه اصلی وضعیت** — تعریف، اعتبارسنجی و مدیریت وضعیت                           |
| LYR-RT-04 (Coordination)      | **هماهنگ‌ساز وضعیت** — هماهنگی و همگام‌سازی وضعیت‌های توزیع‌شده                  |
| LYR-RT-05 (Governance)        | **حاکم بر وضعیت** — سیاست‌ها، محدودیت‌ها و حسابرسی وضعیت                         |

---

## ۶. State Domains

وضعیت زمان اجرای SMOS شامل ۸ دامنه اصلی است:

| ID      | نام                       | توضیح                                        | لایه مرتبط |
| ------- | ------------------------- | -------------------------------------------- | ---------- |
| RSTD-01 | **State Definition**      | تعریف وضعیت — شناسایی، ساختار و معنای وضعیت  | LYR-RT-03  |
| RSTD-02 | **State Transition**      | انتقال وضعیت — حرکت قطعی بین وضعیت‌ها        | LYR-RT-03  |
| RSTD-03 | **State Validation**      | اعتبارسنجی وضعیت — تأیید صحت و انطباق وضعیت  | LYR-RT-03  |
| RSTD-04 | **State Consistency**     | سازگاری وضعیت — هماهنگی بین وضعیت‌های مرتبط  | LYR-RT-03  |
| RSTD-05 | **State Persistence**     | ماندگاری وضعیت — ذخیره و بازیابی وضعیت       | LYR-RT-03  |
| RSTD-06 | **State Synchronization** | همگام‌سازی وضعیت — هماهنگی وضعیت‌های موازی   | LYR-RT-04  |
| RSTD-07 | **State Governance**      | حکمرانی وضعیت — سیاست‌ها و محدودیت‌های وضعیت | LYR-RT-05  |
| RSTD-08 | **State Evolution**       | تکامل وضعیت — تغییر وضعیت در طول چرخه حیات   | LYR-RT-03  |

---

## ۷. State Concepts

۲۰ مفهوم اصلی وضعیت زمان اجرا:

| ID       | مفهوم                     | توضیح                                                 | دامنه   |
| -------- | ------------------------- | ----------------------------------------------------- | ------- |
| RSTC-001 | **Runtime State**         | وضعیت زمان اجرا — نمایش رسمی شرایط یک موجودیت         | RSTD-01 |
| RSTC-002 | **State Class**           | کلاس وضعیت — دسته‌بندی سطح بالای وضعیت                | RSTD-01 |
| RSTC-003 | **State Value**           | مقدار وضعیت — مقدار جاری وضعیت یک موجودیت             | RSTD-01 |
| RSTC-004 | **State Transition**      | انتقال وضعیت — حرکت قطعی از یک وضعیت به وضعیت دیگر    | RSTD-02 |
| RSTC-005 | **Transition Condition**  | شرط انتقال — شرط لازم برای وقوع انتقال                | RSTD-02 |
| RSTC-006 | **Transition Trigger**    | محرک انتقال — رویداد یا عملی که انتقال را فعال می‌کند | RSTD-02 |
| RSTC-007 | **State Validation**      | اعتبارسنجی وضعیت — تأیید صحت وضعیت                    | RSTD-03 |
| RSTC-008 | **State Consistency**     | سازگاری وضعیت — هماهنگی با وضعیت‌های دیگر             | RSTD-04 |
| RSTC-009 | **Consistency Rule**      | قاعده سازگاری — شرط سازگاری بین وضعیت‌ها              | RSTD-04 |
| RSTC-010 | **State Persistence**     | ماندگاری وضعیت — ذخیره وضعیت برای بازیابی آینده       | RSTD-05 |
| RSTC-011 | **State Snapshot**        | عکس فوری وضعیت — تصویر کامل وضعیت در یک لحظه          | RSTD-05 |
| RSTC-012 | **State Synchronization** | همگام‌سازی وضعیت — هماهنگی وضعیت بین مرزها            | RSTD-06 |
| RSTC-013 | **State Lineage**         | شجره وضعیت — مسیر تکامل وضعیت                         | RSTD-07 |
| RSTC-014 | **State Audit**           | حسابرسی وضعیت — ثبت و بازبینی تغییرات وضعیت           | RSTD-07 |
| RSTC-015 | **State Governance**      | حکمرانی وضعیت — سیاست‌های حاکم بر وضعیت               | RSTD-07 |
| RSTC-016 | **State Evolution**       | تکامل وضعیت — تغییر وضعیت در طول زمان                 | RSTD-08 |
| RSTC-017 | **State Migration**       | مهاجرت وضعیت — انتقال وضعیت بین محیط‌ها               | RSTD-08 |
| RSTC-018 | **State Recovery**        | بازیابی وضعیت — بازگشت به وضعیت پایدار پس از خطا      | RSTD-02 |
| RSTC-019 | **State Fork**            | انشعاب وضعیت — ایجاد وضعیت موازی از وضعیت موجود       | RSTD-08 |
| RSTC-020 | **State Merge**           | ادغام وضعیت — ترکیب چند وضعیت در یک وضعیت واحد        | RSTD-08 |

---

## ۸. State Entities

۱۲ موجودیت اصلی وضعیت زمان اجرا:

| ID       | موجودیت              | توضیح                                               | دامنه   | نوع         |
| -------- | -------------------- | --------------------------------------------------- | ------- | ----------- |
| RSTE-001 | **StateRecord**      | ثبت وضعیت — موجودیت مرکزی حاوی داده‌های وضعیت       | RSTD-01 | Core        |
| RSTE-002 | **StateClass**       | کلاس وضعیت — دسته‌بندی وضعیت (Initial, Stable, ...) | RSTD-01 | Core        |
| RSTE-003 | **StateValue**       | مقدار وضعیت — مقدار جاری وضعیت                      | RSTD-01 | Core        |
| RSTE-004 | **TransitionRule**   | قاعده انتقال — انتقال مجاز بین وضعیت‌ها             | RSTD-02 | Core        |
| RSTE-005 | **TransitionLog**    | ثبت انتقال — تاریخچه انتقال‌های انجام‌شده           | RSTD-02 | Audit       |
| RSTE-006 | **ConsistencyCheck** | بررسی سازگاری — نتیجه اعتبارسنجی سازگاری            | RSTD-04 | Operational |
| RSTE-007 | **StateSnapshot**    | عکس فوری وضعیت — تصویر کامل وضعیت در لحظه           | RSTD-05 | Operational |
| RSTE-008 | **SyncContract**     | قرارداد همگام‌سازی — قواعد هماهنگی وضعیت            | RSTD-06 | Operational |
| RSTE-009 | **LineageRecord**    | ثبت شجره — تاریخچه کامل تکامل وضعیت                 | RSTD-07 | Audit       |
| RSTE-010 | **StatePolicy**      | سیاست وضعیت — قاعده حاکم بر وضعیت                   | RSTD-07 | Governance  |
| RSTE-011 | **EvolutionMap**     | نقشه تکامل — طرح تغییر وضعیت در طول زمان            | RSTD-08 | Operational |
| RSTE-012 | **RecoveryPlan**     | طرح بازیابی — برنامه بازگشت به وضعیت پایدار         | RSTD-02 | Governance  |

---

## ۹. State Capabilities

۱۴ قابلیت اصلی وضعیت زمان اجرا:

| ID         | قابلیت                       | توضیح                                         | دامنه   |
| ---------- | ---------------------------- | --------------------------------------------- | ------- |
| RSTCAP-001 | **State Definition**         | تعریف وضعیت — تعریف ساختار و معنای وضعیت      | RSTD-01 |
| RSTCAP-002 | **State Classification**     | طبقه‌بندی وضعیت — انتساب کلاس به وضعیت        | RSTD-01 |
| RSTCAP-003 | **State Assignment**         | انتساب وضعیت — تعیین مقدار وضعیت برای موجودیت | RSTD-01 |
| RSTCAP-004 | **Transition Management**    | مدیریت انتقال — ایجاد و اعمال انتقال وضعیت    | RSTD-02 |
| RSTCAP-005 | **Condition Evaluation**     | ارزیابی شرط — بررسی شرایط لازم برای انتقال    | RSTD-02 |
| RSTCAP-006 | **State Validation**         | اعتبارسنجی وضعیت — تأیید صحت وضعیت            | RSTD-03 |
| RSTCAP-007 | **Consistency Verification** | بررسی سازگاری — تأیید سازگاری بین وضعیت‌ها    | RSTD-04 |
| RSTCAP-008 | **State Persistence**        | ماندگاری وضعیت — ذخیره و بازیابی وضعیت        | RSTD-05 |
| RSTCAP-009 | **State Snapshot**           | عکس فوری — ضبط وضعیت در لحظه                  | RSTD-05 |
| RSTCAP-010 | **State Synchronization**    | همگام‌سازی وضعیت — هماهنگی بین مرزها          | RSTD-06 |
| RSTCAP-011 | **Lineage Tracking**         | ردیابی شجره — ثبت مسیر تکامل وضعیت            | RSTD-07 |
| RSTCAP-012 | **Audit Logging**            | ثبت حسابرسی — ثبت تغییرات وضعیت               | RSTD-07 |
| RSTCAP-013 | **State Evolution**          | تکامل وضعیت — تغییر وضعیت در طول زمان         | RSTD-08 |
| RSTCAP-014 | **State Recovery**           | بازیابی وضعیت — بازگشت به وضعیت پایدار        | RSTD-02 |

---

## ۱۰. State Functions

۱۴ کارکرد اصلی وضعیت زمان اجرا:

| ID      | کارکرد             | قابلیت مرتبط | دامنه   |
| ------- | ------------------ | ------------ | ------- |
| RSTF-01 | Define State       | RSTCAP-001   | RSTD-01 |
| RSTF-02 | Classify State     | RSTCAP-002   | RSTD-01 |
| RSTF-03 | Assign State       | RSTCAP-003   | RSTD-01 |
| RSTF-04 | Execute Transition | RSTCAP-004   | RSTD-02 |
| RSTF-05 | Evaluate Condition | RSTCAP-005   | RSTD-02 |
| RSTF-06 | Validate State     | RSTCAP-006   | RSTD-03 |
| RSTF-07 | Verify Consistency | RSTCAP-007   | RSTD-04 |
| RSTF-08 | Persist State      | RSTCAP-008   | RSTD-05 |
| RSTF-09 | Capture Snapshot   | RSTCAP-009   | RSTD-05 |
| RSTF-10 | Synchronize State  | RSTCAP-010   | RSTD-06 |
| RSTF-11 | Track Lineage      | RSTCAP-011   | RSTD-07 |
| RSTF-12 | Log Audit          | RSTCAP-012   | RSTD-07 |
| RSTF-13 | Evolve State       | RSTCAP-013   | RSTD-08 |
| RSTF-14 | Recover State      | RSTCAP-014   | RSTD-02 |

---

## ۱۱. State Stage Model

مدل مرحله‌ای وضعیت زمان اجرا شامل ۸ مرحله است:

| ID       | مرحله           | ورودی             | خروجی             | دامنه   |
| -------- | --------------- | ----------------- | ----------------- | ------- |
| RSTST-01 | **Define**      | StateRequest      | DefinedState      | RSTD-01 |
| RSTST-02 | **Classify**    | DefinedState      | ClassifiedState   | RSTD-01 |
| RSTST-03 | **Assign**      | ClassifiedState   | AssignedState     | RSTD-01 |
| RSTST-04 | **Validate**    | AssignedState     | ValidatedState    | RSTD-03 |
| RSTST-05 | **Persist**     | ValidatedState    | PersistedState    | RSTD-05 |
| RSTST-06 | **Synchronize** | PersistedState    | SynchronizedState | RSTD-06 |
| RSTST-07 | **Evolve**      | SynchronizedState | EvolvedState      | RSTD-08 |
| RSTST-08 | **Archive**     | EvolvedState      | ArchivedState     | RSTD-05 |

---

## ۱۲. State Class Model

مدل کلاس وضعیت زمان اجرا شامل ۸ کلاس است. هر کلاس نشان‌دهنده دسته‌بندی سطح بالای وضعیت است و تعیین می‌کند که یک وضعیت در چه شرایطی قرار دارد:

| ID      | کلاس             | توضیح                                        | مثال‌ها                                  |
| ------- | ---------------- | -------------------------------------------- | ---------------------------------------- |
| RSTS-01 | **Initial**      | وضعیت اولیه — قبل از شروع عملیات             | Created (RSS-01), Undefined (RCS-01)     |
| RSTS-02 | **Intermediate** | وضعیت میانی — در جریان عملیات                | Initialized (RSS-02), Resolving (RCS-02) |
| RSTS-03 | **Stable**       | وضعیت پایدار — عملیات با موفقیت در حال انجام | Active (RSS-03), Active (RCS-04)         |
| RSTS-04 | **Transitional** | وضعیت گذرا — در حال تغییر بین وضعیت‌ها       | Waiting (RSS-05), Collecting (RCS-02)    |
| RSTS-05 | **Suspended**    | وضعیت معلق — عملیات به طور موقت متوقف        | Suspended (RSS-04), Suspended (RCS-05)   |
| RSTS-06 | **Recoverable**  | وضعیت قابل بازیابی — پس از خطا قابل بازگشت   | Resumed (RSS-06), Shared (RCS-04)        |
| RSTS-07 | **Terminal**     | وضعیت نهایی — پایان قطعی عملیات              | Closed (RSS-07), Expired (RCS-06)        |
| RSTS-08 | **Archived**     | وضعیت بایگانی — ذخیره برای نگهداری بلندمدت   | Archived (RSS-08), Archived (RCS-08)     |

### انتقال‌های مجاز بین کلاس‌ها

۲۰ انتقال مجاز بین کلاس‌های وضعیت:

| مبدأ                   | مقصد                   | شرط                                   |
| ---------------------- | ---------------------- | ------------------------------------- |
| RSTS-01 (Initial)      | RSTS-02 (Intermediate) | عملیات شروع شده است                   |
| RSTS-01 (Initial)      | RSTS-07 (Terminal)     | خطا در شروع عملیات                    |
| RSTS-02 (Intermediate) | RSTS-03 (Stable)       | عملیات با موفقیت به وضعیت پایدار رسید |
| RSTS-02 (Intermediate) | RSTS-05 (Suspended)    | نیاز به تعلیق در وضعیت میانی          |
| RSTS-02 (Intermediate) | RSTS-07 (Terminal)     | انصراف از ادامه عملیات                |
| RSTS-03 (Stable)       | RSTS-04 (Transitional) | شروع فرآیند تغییر وضعیت               |
| RSTS-03 (Stable)       | RSTS-05 (Suspended)    | دستور تعلیق عملیات                    |
| RSTS-03 (Stable)       | RSTS-07 (Terminal)     | خاتمه عادی عملیات                     |
| RSTS-04 (Transitional) | RSTS-03 (Stable)       | انتقال با موفقیت کامل شد              |
| RSTS-04 (Transitional) | RSTS-05 (Suspended)    | تعلیق در حین انتقال                   |
| RSTS-04 (Transitional) | RSTS-07 (Terminal)     | خطا در حین انتقال                     |
| RSTS-05 (Suspended)    | RSTS-03 (Stable)       | رفع مشکل تعلیق                        |
| RSTS-05 (Suspended)    | RSTS-06 (Recoverable)  | شروع فرآیند بازیابی                   |
| RSTS-05 (Suspended)    | RSTS-07 (Terminal)     | خاتمه در حالت تعلیق                   |
| RSTS-05 (Suspended)    | RSTS-08 (Archived)     | بایگانی وضعیت معلق                    |
| RSTS-06 (Recoverable)  | RSTS-03 (Stable)       | بازیابی با موفقیت کامل شد             |
| RSTS-06 (Recoverable)  | RSTS-07 (Terminal)     | بازیابی ناموفق                        |
| RSTS-07 (Terminal)     | RSTS-08 (Archived)     | بایگانی وضعیت نهایی                   |
| RSTS-07 (Terminal)     | RSTS-06 (Recoverable)  | بازگشایی استثنایی وضعیت نهایی         |
| RSTS-08 (Archived)     | RSTS-05 (Suspended)    | خارج‌سازی از بایگانی برای بررسی       |

---

## ۱۳. State Models

۸ مدل وضعیت:

| ID      | مدل                 | توضیح                                               | دامنه   |
| ------- | ------------------- | --------------------------------------------------- | ------- |
| RSTM-01 | **Lifecycle State** | وضعیت چرخه حیات — وضعیت یک موجودیت در طول چرخه حیات | RSTD-01 |
| RSTM-02 | **Execution State** | وضعیت اجرا — وضعیت یک اجرا یا وظیفه                 | RSTD-02 |
| RSTM-03 | **Session State**   | وضعیت نشست — وضعیت یک نشست زمان اجرا                | RSTD-01 |
| RSTM-04 | **Context State**   | وضعیت بافت — وضعیت یک بافت زمان اجرا                | RSTD-04 |
| RSTM-05 | **Knowledge State** | وضعیت دانش — وضعیت یک موجودیت دانشی                 | RSTD-01 |
| RSTM-06 | **Agent State**     | وضعیت عامل — وضعیت یک Agent هوشمند                  | RSTD-02 |
| RSTM-07 | **Workflow State**  | وضعیت گردش کار — وضعیت یک گردش کار                  | RSTD-02 |
| RSTM-08 | **Composite State** | وضعیت ترکیبی — ترکیب چند وضعیت در یک وضعیت واحد     | RSTD-04 |

---

## ۱۴. State Relationships

۱۰ رابطه اصلی وضعیت:

| ID      | رابطه                 | مبدأ        | مقصد             | توضیح                                 |
| ------- | --------------------- | ----------- | ---------------- | ------------------------------------- |
| RSTR-01 | **Classified As**     | StateRecord | StateClass       | وضعیت به یک کلاس تعلق دارد            |
| RSTR-02 | **Assigned To**       | StateRecord | Entity           | وضعیت به یک موجودیت اختصاص دارد       |
| RSTR-03 | **Transitioned From** | StateRecord | StateRecord      | وضعیت از وضعیت قبلی منتقل شده است     |
| RSTR-04 | **Validated By**      | StateRecord | ConsistencyCheck | وضعیت توسط یک بررسی تأیید شده است     |
| RSTR-05 | **Governed By**       | StateRecord | StatePolicy      | وضعیت تابع یک سیاست است               |
| RSTR-06 | **Has Snapshot**      | StateRecord | StateSnapshot    | وضعیت دارای عکس فوری است              |
| RSTR-07 | **Has Lineage**       | StateRecord | LineageRecord    | وضعیت دارای شجره قابل ردیابی است      |
| RSTR-08 | **Synchronized With** | StateRecord | StateRecord      | وضعیت با وضعیت دیگر همگام شده است     |
| RSTR-09 | **Recovered By**      | StateRecord | RecoveryPlan     | وضعیت توسط یک طرح بازیابی بازگشته است |
| RSTR-10 | **Evolved Into**      | StateRecord | StateRecord      | وضعیت به وضعیت بعدی تکامل یافته است   |

---

## ۱۵. State Integrity

یکپارچگی وضعیت بر اساس ۴ بعد تعریف می‌شود:

### بعد ۱: یکپارچگی تعریف (Definition Integrity)

| قاعده                                                       | توضیح |
| ----------------------------------------------------------- | ----- |
| هر وضعیت باید دارای تعریف رسمی و بدون ابهام باشد            |
| کلاس وضعیت باید با رفتار وضعیت سازگار باشد                  |
| وضعیت‌های هم‌ردیف باید تعاریف غیرمتناقض داشته باشند         |
| تغییر تعریف وضعیت نیازمند به‌روزرسانی تمام مصرف‌کنندگان است |

### بعد ۲: یکپارچگی انتقال (Transition Integrity)

| قاعده                                        | توضیح |
| -------------------------------------------- | ----- |
| هر انتقال باید صریح و ثبت‌شده باشد           |
| انتقال فقط از طریق مسیرهای مجاز انجام می‌شود |
| شرط انتقال باید قبل از وقوع ارزیابی شود      |
| انتقال ناموفق باید در شجره ثبت شود           |

### بعد ۳: یکپارچگی سازگاری (Consistency Integrity)

| قاعده                                                   | توضیح |
| ------------------------------------------------------- | ----- |
| وضعیت‌های مرتبط باید همیشه سازگار باشند                 |
| نقض سازگاری باید فوراً شناسایی شود                      |
| بازیابی از نقض سازگاری باید قابل ردیابی باشد            |
| سازگاری بین دامنه‌های وضعیت باید قابل راستی‌آزمایی باشد |

### بعد ۴: یکپارچگی شجره (Lineage Integrity)

| قاعده                                                      | توضیح |
| ---------------------------------------------------------- | ----- |
| هر تغییر وضعیت باید در شجره ثبت شود                        |
| شجره وضعیت باید غیرقابل تغییر باشد                         |
| شجره وضعیت باید امکان بازگشت به هر وضعیت قبلی را فراهم کند |
| شجره وضعیت باید دارای برچسب زمانی دقیق باشد                |

---

## ۱۶. State Consistency Rules

۱۲ قانون سازگاری وضعیت:

| ID       | قانون                       | توضیح                                                | دامنه   |
| -------- | --------------------------- | ---------------------------------------------------- | ------- |
| RSTCR-01 | **Unique State per Entity** | هر موجودیت در هر زمان فقط یک وضعیت دارد              | RSTD-04 |
| RSTCR-02 | **Valid Class Assignment**  | وضعیت باید به یک کلاس معتبر تعلق داشته باشد          | RSTD-01 |
| RSTCR-03 | **Deterministic Value**     | مقدار وضعیت در هر لحظه قطعی و بدون ابهام است         | RSTD-01 |
| RSTCR-04 | **Explicit Transition**     | تغییر وضعیت فقط از طریق انتقال صریح مجاز است         | RSTD-02 |
| RSTCR-05 | **Valid Transition Path**   | هر انتقال باید در مسیر مجاز بین دو وضعیت باشد        | RSTD-02 |
| RSTCR-06 | **Condition Satisfaction**  | شرط انتقال باید قبل از وقوع ارزیابی و تأیید شود      | RSTD-02 |
| RSTCR-07 | **Consistency Invariant**   | وضعیت‌های مرتبط باید همیشه قانون سازگاری را حفظ کنند | RSTD-04 |
| RSTCR-08 | **Snapshot Integrity**      | عکس فوری وضعیت باید نمای کامل و دقیق از وضعیت باشد   | RSTD-05 |
| RSTCR-09 | **Lineage Immutability**    | شجره وضعیت پس از ثبت قابل تغییر نیست                 | RSTD-07 |
| RSTCR-10 | **Governance Compliance**   | وضعیت باید با تمام سیاست‌های حاکم سازگار باشد        | RSTD-07 |
| RSTCR-11 | **Evolution Continuity**    | تکامل وضعیت باید تداوم و سازگاری با عقب را حفظ کند   | RSTD-08 |
| RSTCR-12 | **Recovery Feasibility**    | هر وضعیت باید دارای یک طرح بازیابی معتبر باشد        | RSTD-02 |

---

## ۱۷. State Constraints

۸ محدودیت اصلی وضعیت:

| ID        | محدودیت                         | توضیح                                                      | دامنه   |
| --------- | ------------------------------- | ---------------------------------------------------------- | ------- |
| RSTCST-01 | **One State at a Time**         | یک موجودیت در هر لحظه فقط یک وضعیت فعال دارد               | RSTD-01 |
| RSTCST-02 | **No Spontaneous Transition**   | انتقال بدون محرک یا شرط مجاز نیست                          | RSTD-02 |
| RSTCST-03 | **No Circular Dependency**      | وابستگی بین وضعیت‌ها باید غیرچرخه‌ای باشد                  | RSTD-04 |
| RSTCST-04 | **Limited Transition Scope**    | انتقال فقط بین وضعیت‌های یک دامنه یا دامنه‌های مجاز است    | RSTD-02 |
| RSTCST-05 | **Maximum State Duration**      | هر وضعیت دارای حداکثر مدت زمان مجاز است                    | RSTD-01 |
| RSTCST-06 | **Minimum Transition Interval** | حداقل فاصله زمانی بین دو انتقال متوالی                     | RSTD-02 |
| RSTCST-07 | **Snapshot Freshness**          | عکس‌های فوری باید در بازه زمانی معتبر باشند                | RSTD-05 |
| RSTCST-08 | **Lineage Completeness**        | شجره وضعیت باید شامل تمام انتقال‌ها از ایجاد تا خاتمه باشد | RSTD-07 |

---

## ۱۸. State Governance

حکمرانی وضعیت بر اساس ۵ سطح حکمرانی تعریف می‌شود:

| سطح  | نام                          | توضیح                           | دامنه   |
| ---- | ---------------------------- | ------------------------------- | ------- |
| G-01 | **State Policy Definition**  | تعریف سیاست‌های حاکم بر وضعیت   | RSTD-07 |
| G-02 | **Transition Authorization** | مجوزدهی به انتقال‌های وضعیت     | RSTD-07 |
| G-03 | **Consistency Enforcement**  | اعمال قواعد سازگاری وضعیت       | RSTD-07 |
| G-04 | **Audit and Review**         | حسابرسی و بازبینی تغییرات وضعیت | RSTD-07 |
| G-05 | **Evolution Oversight**      | نظارت بر تکامل و مهاجرت وضعیت   | RSTD-08 |

### قواعد حکمرانی

| ID    | قاعده                                           | توضیح | سطح |
| ----- | ----------------------------------------------- | ----- | --- |
| GR-01 | هر وضعیت باید دارای سیاست حاکم مشخص باشد        | G-01  |
| GR-02 | انتقال به وضعیت Terminal نیازمند مجوز اضافی است | G-02  |
| GR-03 | نقض سازگاری باید به مالک وضعیت گزارش شود        | G-03  |
| GR-04 | همه انتقال‌ها باید در شجره ثبت شوند             | G-04  |
| GR-05 | تکامل وضعیت باید توسط حکمرانی تأیید شود         | G-05  |

---

## ۱۹. State Evolution

تکامل وضعیت بر اساس ۶ مرحله تعریف می‌شود:

| مرحله | نام                      | توضیح                                                 |
| ----- | ------------------------ | ----------------------------------------------------- |
| EV-01 | **Current State**        | وضعیت جاری — وضعیت فعال و معتبر فعلی                  |
| EV-02 | **Proposed State**       | وضعیت پیشنهادی — وضعیت جدید برای جایگزینی             |
| EV-03 | **Impact Assessment**    | ارزیابی تأثیر — بررسی تأثیر تغییر بر وابستگی‌ها       |
| EV-04 | **Transition Planning**  | برنامه‌ریزی انتقال — طرح انتقال از وضعیت فعلی به جدید |
| EV-05 | **Controlled Migration** | مهاجرت کنترل‌شده — اجرای تدریجی انتقال                |
| EV-06 | **State Verification**   | تأیید وضعیت — راستی‌آزمایی وضعیت جدید                 |

---

## ۲۰. State Pattern Catalog

۵ الگوی اصلی وضعیت:

| ID     | الگو                   | توضیح                                               | مدل‌های مرتبط    |
| ------ | ---------------------- | --------------------------------------------------- | ---------------- |
| PAT-01 | **Simple State**       | وضعیت ساده — یک وضعیت بدون زیروضعیت                 | RSTM-01, RSTM-02 |
| PAT-02 | **Hierarchical State** | وضعیت سلسله‌مراتبی — وضعیت با زیروضعیت‌های تو در تو | RSTM-04, RSTM-08 |
| PAT-03 | **Orthogonal State**   | وضعیت هم‌راستا — چند وضعیت مستقل همزمان             | RSTM-08          |
| PAT-04 | **History State**      | وضعیت تاریخچه — بازگشت به آخرین وضعیت فرعی          | RSTM-03, RSTM-06 |
| PAT-05 | **Concurrent State**   | وضعیت هم‌روند — وضعیت‌های موازی با همگام‌سازی       | RSTM-07, RSTM-08 |

---

## ۲۱. State Mapping

### نگاشت به کلاس‌های وضعیت RT-001..RT-004

| ID                   | وضعیت RT     | کلاس RT-005 | توضیح               |
| -------------------- | ------------ | ----------- | ------------------- |
| RTS-01 (Initialized) | Initial      | RSTS-01     | وضعیت اولیه Runtime |
| RTS-02 (Prepared)    | Intermediate | RSTS-02     | آماده‌سازی          |
| RTS-03 (Ready)       | Stable       | RSTS-03     | آماده اجرا          |
| RTS-04 (Running)     | Stable       | RSTS-03     | در حال اجرا         |
| RTS-05 (Paused)      | Suspended    | RSTS-05     | متوقف موقت          |
| RTS-06 (Recovering)  | Recoverable  | RSTS-06     | در حال بازیابی      |
| RTS-07 (Completed)   | Terminal     | RSTS-07     | کامل شده            |
| RTS-08 (Terminated)  | Terminal     | RSTS-07     | خاتمه یافته         |
| RES-01 (Created)     | Initial      | RSTS-01     | ایجاد شده           |
| RES-02 (Prepared)    | Intermediate | RSTS-02     | آماده اجرا          |
| RES-03 (Queued)      | Transitional | RSTS-04     | در صف انتظار        |
| RES-04 (Executing)   | Stable       | RSTS-03     | در حال اجرا         |
| RES-05 (Waiting)     | Transitional | RSTS-04     | منتظر وابستگی       |
| RES-06 (Recovering)  | Recoverable  | RSTS-06     | در حال بازیابی      |
| RES-07 (Completed)   | Terminal     | RSTS-07     | کامل شده            |
| RES-08 (Cancelled)   | Terminal     | RSTS-07     | لغو شده             |
| RCS-01 (Undefined)   | Initial      | RSTS-01     | تعریف نشده          |
| RCS-02 (Collecting)  | Intermediate | RSTS-02     | در حال جمع‌آوری     |
| RCS-03 (Resolving)   | Intermediate | RSTS-02     | در حال تفکیک        |
| RCS-04 (Active)      | Stable       | RSTS-03     | فعال                |
| RCS-05 (Shared)      | Stable       | RSTS-03     | اشتراک‌گذاری‌شده    |
| RCS-06 (Suspended)   | Suspended    | RSTS-05     | معلق                |
| RCS-07 (Expired)     | Terminal     | RSTS-07     | منقضی شده           |
| RCS-08 (Archived)    | Archived     | RSTS-08     | بایگانی‌شده         |
| RSS-01 (Created)     | Initial      | RSTS-01     | ایجاد شده           |
| RSS-02 (Initialized) | Intermediate | RSTS-02     | مقداردهی‌شده        |
| RSS-03 (Active)      | Stable       | RSTS-03     | فعال                |
| RSS-04 (Suspended)   | Suspended    | RSTS-05     | معلق                |
| RSS-05 (Waiting)     | Transitional | RSTS-04     | در انتظار           |
| RSS-06 (Resumed)     | Recoverable  | RSTS-06     | بازگشایی‌شده        |
| RSS-07 (Closed)      | Terminal     | RSTS-07     | بسته‌شده            |
| RSS-08 (Archived)    | Archived     | RSTS-08     | بایگانی‌شده         |

---

## ۲۲. Cross-Domain State Mapping

### نگاشت بین دامنه‌های وضعیت

| دامنه مبدأ                | دامنه مقصد                | نوع نگاشت | توضیح                                           |
| ------------------------- | ------------------------- | --------- | ----------------------------------------------- |
| RSTD-01 (Definition)      | RSTD-02 (Transition)      | Direct    | تعریف وضعیت، انتقال‌های مجاز را مشخص می‌کند     |
| RSTD-01 (Definition)      | RSTD-03 (Validation)      | Direct    | تعریف وضعیت معیارهای اعتبارسنجی را تعیین می‌کند |
| RSTD-02 (Transition)      | RSTD-04 (Consistency)     | Composite | انتقال وضعیت می‌تواند بر سازگاری تأثیر بگذارد   |
| RSTD-02 (Transition)      | RSTD-05 (Persistence)     | Direct    | انتقال وضعیت نیاز به ماندگاری دارد              |
| RSTD-03 (Validation)      | RSTD-04 (Consistency)     | Direct    | اعتبارسنجی بخشی از بررسی سازگاری است            |
| RSTD-04 (Consistency)     | RSTD-07 (Governance)      | Direct    | سازگاری توسط حکمرانی اعمال می‌شود               |
| RSTD-05 (Persistence)     | RSTD-06 (Synchronization) | Direct    | ماندگاری به همگام‌سازی وابسته است               |
| RSTD-06 (Synchronization) | RSTD-07 (Governance)      | Direct    | همگام‌سازی تحت حکمرانی است                      |
| RSTD-07 (Governance)      | RSTD-01..RSTD-08          | Universal | حکمرانی بر همه دامنه‌های وضعیت اعمال می‌شود     |
| RSTD-08 (Evolution)       | RSTD-01 (Definition)      | Composite | تکامل می‌تواند تعریف وضعیت را تغییر دهد         |

### نگاشت به RT-001..RT-004

| RT-۰۰۱/۰۰۲/۰۰۳/۰۰۴          | RT-005 (اختصاصی وضعیت)      | نوع نگاشت                                              |
| --------------------------- | --------------------------- | ------------------------------------------------------ |
| RTD-03 (State)              | RSTD-01..RSTD-08            | تخصصی‌سازی — دامنه State به ۸ دامنه تخصصی تبدیل شده    |
| RTE-002 (Execution)         | RSTM-02 (Execution State)   | تخصصی‌سازی — وضعیت اجرا از State مشتق شده              |
| RTS-01..08 (Runtime States) | RSTS-01..08 (State Classes) | تکامل — حالت‌های Runtime به کلاس‌های وضعیت تبدیل شده   |
| RCC-003 (Runtime Context)   | RSTM-04 (Context State)     | ارتباط — بافت با وضعیت بافت مرتبط است                  |
| RSC-006 (Session State)     | RSTM-03 (Session State)     | تخصصی‌سازی — وضعیت نشست از State مشتق شده              |
| RTC-003 (Runtime State)     | RSTM-01..RSTM-08            | تخصصی‌سازی — یک مفهوم State به ۸ مدل وضعیت گسترش یافته |
| RTF-03 (Manage State)       | RSTF-01..14                 | گسترش — یک کارکرد به ۱۴ کارکرد تخصصی                   |
| RTE-007 (Context)           | RSTD-03 (State Validation)  | ارتباط — بافت برای اعتبارسنجی وضعیت استفاده می‌شود     |

---

## ۲۳. State Maturity Model

۵ سطح بلوغ وضعیت زمان اجرا:

| سطح  | نام           | توضیح                                   | معیار                                            |
| ---- | ------------- | --------------------------------------- | ------------------------------------------------ |
| M-01 | **Ad Hoc**    | وضعیت تعریف‌نشده و ناسازگار             | بدون تعریف رسمی وضعیت                            |
| M-02 | **Defined**   | وضعیت با تعریف رسمی اما بدون اعتبارسنجی | وضعیت‌ها تعریف شده‌اند اما سازگاری بررسی نمی‌شود |
| M-03 | **Validated** | وضعیت با اعتبارسنجی خودکار              | همه وضعیت‌ها اعتبارسنجی می‌شوند                  |
| M-04 | **Governed**  | وضعیت تحت حکمرانی کامل                  | همه انتقال‌ها ثبت و حسابرسی می‌شوند              |
| M-05 | **Evolving**  | وضعیت با تکامل کنترل‌شده                | تکامل وضعیت خودکار و تحت حکمرانی است             |

---

## ۲۴. State Metrics

۱۵ معیار اصلی وضعیت:

| ID         | معیار                          | توضیح                                    | دامنه   |
| ---------- | ------------------------------ | ---------------------------------------- | ------- |
| RSTMTR-001 | **Total State Definitions**    | تعداد کل وضعیت‌های تعریف‌شده             | RSTD-01 |
| RSTMTR-002 | **Total State Classes**        | تعداد کل کلاس‌های وضعیت فعال             | RSTD-01 |
| RSTMTR-003 | **Transition Count**           | تعداد انتقال‌های انجام‌شده در بازه زمانی | RSTD-02 |
| RSTMTR-004 | **Transition Success Rate**    | درصد موفقیت انتقال‌ها                    | RSTD-02 |
| RSTMTR-005 | **Transition Failure Rate**    | درصد شکست انتقال‌ها                      | RSTD-02 |
| RSTMTR-006 | **Validation Coverage**        | درصد وضعیت‌های تحت پوشش اعتبارسنجی       | RSTD-03 |
| RSTMTR-007 | **Consistency Check Coverage** | درصد بررسی‌های سازگاری انجام‌شده         | RSTD-04 |
| RSTMTR-008 | **Consistency Violations**     | تعداد نقض‌های سازگاری شناسایی‌شده        | RSTD-04 |
| RSTMTR-009 | **Persistence Latency**        | میانگین زمان ماندگاری وضعیت              | RSTD-05 |
| RSTMTR-010 | **Snapshot Freshness**         | میانگین عمر عکس‌های فوری وضعیت           | RSTD-05 |
| RSTMTR-011 | **Synchronization Count**      | تعداد همگام‌سازی‌های انجام‌شده           | RSTD-06 |
| RSTMTR-012 | **Lineage Depth**              | میانگین عمق شجره وضعیت                   | RSTD-07 |
| RSTMTR-013 | **Audit Completeness**         | درصد پوشش حسابرسی وضعیت                  | RSTD-07 |
| RSTMTR-014 | **Evolution Frequency**        | تعداد تکامل‌های وضعیت در بازه زمانی      | RSTD-08 |
| RSTMTR-015 | **Recovery Success Rate**      | درصد موفقیت بازیابی وضعیت                | RSTD-02 |

---

## ۲۵. State Validation

اعتبارسنجی وضعیت بر اساس ۴ گام انجام می‌شود:

| گام  | نام                        | توضیح                                                | خروجی                 |
| ---- | -------------------------- | ---------------------------------------------------- | --------------------- |
| V-01 | **Structural Validation**  | اعتبارسنجی ساختاری — بررسی ساختار و قالب وضعیت       | Validated Structure   |
| V-02 | **Semantic Validation**    | اعتبارسنجی معنایی — بررسی معنا و انطباق وضعیت        | Validated Semantics   |
| V-03 | **Consistency Validation** | اعتبارسنجی سازگاری — بررسی هماهنگی با وضعیت‌های دیگر | Validated Consistency |
| V-04 | **Governance Validation**  | اعتبارسنجی حکمرانی — بررسی انطباق با سیاست‌ها        | Validated Governance  |

---

## ۲۶. Integration with RT Family

### وابستگی به RT-001 (Foundation)

| RT-001 Concept              | استفاده در RT-005                  |
| --------------------------- | ---------------------------------- |
| RTC-003 (Runtime State)     | پایه و اساس مفهوم State — RSTC-001 |
| RTD-03 (State Domain)       | گسترش به ۸ دامنه RSTD-01..08       |
| RTS-01..08 (Runtime States) | تکامل به کلاس‌های RSTS-01..08      |
| RTF-03 (Manage State)       | گسترش به ۱۴ کارکرد RSTF-01..14     |
| RTM-03 (State Model)        | تخصصی‌سازی به RSTM-01..08          |

### وابستگی به RT-002 (Execution)

| RT-002 Concept                | استفاده در RT-005                |
| ----------------------------- | -------------------------------- |
| REC-008 (Execution State)     | مدل RSTM-02 (Execution State)    |
| RED-03 (State Domain)         | دامنه RSTD-01 (State Definition) |
| RES-01..08 (Execution States) | نگاشت به کلاس‌های RSTS-01..08    |

### وابستگی به RT-003 (Context)

| RT-003 Concept                  | استفاده در RT-005                 |
| ------------------------------- | --------------------------------- |
| RCC-009 (Context Consistency)   | دامنه RSTD-04 (State Consistency) |
| RCS-01..08 (Context States)     | مدل RSTM-04 (Context State)       |
| RCMTR-005 (Validation Coverage) | معیار RSTMTR-006                  |

### وابستگی به RT-004 (Session)

| RT-004 Concept                    | استفاده در RT-005                 |
| --------------------------------- | --------------------------------- |
| RSC-006 (Session State)           | مدل RSTM-03 (Session State)       |
| RSS-01..08 (Session States)       | مدل RSTM-03, کلاس‌های RSTS-01..08 |
| RSCR-01..12 (Session Consistency) | قواعد RSTCR-01..12                |

---

## ۲۷. Machine Readable JSON Blocks

### Block 1 — State Concepts

```json
{
  "$schema": "RT-005-concept-registry",
  "state_concepts": [
    { "id": "RSTC-001", "name": "Runtime State", "domain": "RSTD-01" },
    { "id": "RSTC-002", "name": "State Class", "domain": "RSTD-01" },
    { "id": "RSTC-003", "name": "State Value", "domain": "RSTD-01" },
    { "id": "RSTC-004", "name": "State Transition", "domain": "RSTD-02" },
    { "id": "RSTC-005", "name": "Transition Condition", "domain": "RSTD-02" },
    { "id": "RSTC-006", "name": "Transition Trigger", "domain": "RSTD-02" },
    { "id": "RSTC-007", "name": "State Validation", "domain": "RSTD-03" },
    { "id": "RSTC-008", "name": "State Consistency", "domain": "RSTD-04" },
    { "id": "RSTC-009", "name": "Consistency Rule", "domain": "RSTD-04" },
    { "id": "RSTC-010", "name": "State Persistence", "domain": "RSTD-05" },
    { "id": "RSTC-011", "name": "State Snapshot", "domain": "RSTD-05" },
    { "id": "RSTC-012", "name": "State Synchronization", "domain": "RSTD-06" },
    { "id": "RSTC-013", "name": "State Lineage", "domain": "RSTD-07" },
    { "id": "RSTC-014", "name": "State Audit", "domain": "RSTD-07" },
    { "id": "RSTC-015", "name": "State Governance", "domain": "RSTD-07" },
    { "id": "RSTC-016", "name": "State Evolution", "domain": "RSTD-08" },
    { "id": "RSTC-017", "name": "State Migration", "domain": "RSTD-08" },
    { "id": "RSTC-018", "name": "State Recovery", "domain": "RSTD-02" },
    { "id": "RSTC-019", "name": "State Fork", "domain": "RSTD-08" },
    { "id": "RSTC-020", "name": "State Merge", "domain": "RSTD-08" }
  ]
}
```

### Block 2 — State Entities

```json
{
  "$schema": "RT-005-entity-registry",
  "state_entities": [
    { "id": "RSTE-001", "name": "StateRecord", "domain": "RSTD-01", "type": "Core" },
    { "id": "RSTE-002", "name": "StateClass", "domain": "RSTD-01", "type": "Core" },
    { "id": "RSTE-003", "name": "StateValue", "domain": "RSTD-01", "type": "Core" },
    { "id": "RSTE-004", "name": "TransitionRule", "domain": "RSTD-02", "type": "Core" },
    { "id": "RSTE-005", "name": "TransitionLog", "domain": "RSTD-02", "type": "Audit" },
    { "id": "RSTE-006", "name": "ConsistencyCheck", "domain": "RSTD-04", "type": "Operational" },
    { "id": "RSTE-007", "name": "StateSnapshot", "domain": "RSTD-05", "type": "Operational" },
    { "id": "RSTE-008", "name": "SyncContract", "domain": "RSTD-06", "type": "Operational" },
    { "id": "RSTE-009", "name": "LineageRecord", "domain": "RSTD-07", "type": "Audit" },
    { "id": "RSTE-010", "name": "StatePolicy", "domain": "RSTD-07", "type": "Governance" },
    { "id": "RSTE-011", "name": "EvolutionMap", "domain": "RSTD-08", "type": "Operational" },
    { "id": "RSTE-012", "name": "RecoveryPlan", "domain": "RSTD-02", "type": "Governance" }
  ]
}
```

### Block 3 — State Capabilities

```json
{
  "$schema": "RT-005-capability-registry",
  "state_capabilities": [
    { "id": "RSTCAP-001", "name": "State Definition", "domain": "RSTD-01" },
    { "id": "RSTCAP-002", "name": "State Classification", "domain": "RSTD-01" },
    { "id": "RSTCAP-003", "name": "State Assignment", "domain": "RSTD-01" },
    { "id": "RSTCAP-004", "name": "Transition Management", "domain": "RSTD-02" },
    { "id": "RSTCAP-005", "name": "Condition Evaluation", "domain": "RSTD-02" },
    { "id": "RSTCAP-006", "name": "State Validation", "domain": "RSTD-03" },
    { "id": "RSTCAP-007", "name": "Consistency Verification", "domain": "RSTD-04" },
    { "id": "RSTCAP-008", "name": "State Persistence", "domain": "RSTD-05" },
    { "id": "RSTCAP-009", "name": "State Snapshot", "domain": "RSTD-05" },
    { "id": "RSTCAP-010", "name": "State Synchronization", "domain": "RSTD-06" },
    { "id": "RSTCAP-011", "name": "Lineage Tracking", "domain": "RSTD-07" },
    { "id": "RSTCAP-012", "name": "Audit Logging", "domain": "RSTD-07" },
    { "id": "RSTCAP-013", "name": "State Evolution", "domain": "RSTD-08" },
    { "id": "RSTCAP-014", "name": "State Recovery", "domain": "RSTD-02" }
  ]
}
```

### Block 4 — State Functions

```json
{
  "$schema": "RT-005-function-registry",
  "state_functions": [
    { "id": "RSTF-01", "name": "Define State", "capability": "RSTCAP-001", "domain": "RSTD-01" },
    { "id": "RSTF-02", "name": "Classify State", "capability": "RSTCAP-002", "domain": "RSTD-01" },
    { "id": "RSTF-03", "name": "Assign State", "capability": "RSTCAP-003", "domain": "RSTD-01" },
    {
      "id": "RSTF-04",
      "name": "Execute Transition",
      "capability": "RSTCAP-004",
      "domain": "RSTD-02"
    },
    {
      "id": "RSTF-05",
      "name": "Evaluate Condition",
      "capability": "RSTCAP-005",
      "domain": "RSTD-02"
    },
    { "id": "RSTF-06", "name": "Validate State", "capability": "RSTCAP-006", "domain": "RSTD-03" },
    {
      "id": "RSTF-07",
      "name": "Verify Consistency",
      "capability": "RSTCAP-007",
      "domain": "RSTD-04"
    },
    { "id": "RSTF-08", "name": "Persist State", "capability": "RSTCAP-008", "domain": "RSTD-05" },
    {
      "id": "RSTF-09",
      "name": "Capture Snapshot",
      "capability": "RSTCAP-009",
      "domain": "RSTD-05"
    },
    {
      "id": "RSTF-10",
      "name": "Synchronize State",
      "capability": "RSTCAP-010",
      "domain": "RSTD-06"
    },
    { "id": "RSTF-11", "name": "Track Lineage", "capability": "RSTCAP-011", "domain": "RSTD-07" },
    { "id": "RSTF-12", "name": "Log Audit", "capability": "RSTCAP-012", "domain": "RSTD-07" },
    { "id": "RSTF-13", "name": "Evolve State", "capability": "RSTCAP-013", "domain": "RSTD-08" },
    { "id": "RSTF-14", "name": "Recover State", "capability": "RSTCAP-014", "domain": "RSTD-02" }
  ]
}
```

### Block 5 — State Classes

```json
{
  "$schema": "RT-005-class-registry",
  "state_classes": [
    {
      "id": "RSTS-01",
      "name": "Initial",
      "examples": ["RTS-01", "RES-01", "RCS-01", "RSS-01"],
      "domain": "RSTD-01"
    },
    {
      "id": "RSTS-02",
      "name": "Intermediate",
      "examples": ["RTS-02", "RES-02", "RCS-02", "RSS-02"],
      "domain": "RSTD-01"
    },
    {
      "id": "RSTS-03",
      "name": "Stable",
      "examples": ["RTS-03", "RTS-04", "RES-04", "RCS-04", "RSS-03"],
      "domain": "RSTD-01"
    },
    {
      "id": "RSTS-04",
      "name": "Transitional",
      "examples": ["RES-03", "RES-05", "RSS-05"],
      "domain": "RSTD-02"
    },
    {
      "id": "RSTS-05",
      "name": "Suspended",
      "examples": ["RTS-05", "RCS-06", "RSS-04"],
      "domain": "RSTD-01"
    },
    {
      "id": "RSTS-06",
      "name": "Recoverable",
      "examples": ["RTS-06", "RES-06", "RSS-06"],
      "domain": "RSTD-02"
    },
    {
      "id": "RSTS-07",
      "name": "Terminal",
      "examples": ["RTS-07", "RTS-08", "RES-07", "RES-08", "RCS-07", "RSS-07"],
      "domain": "RSTD-01"
    },
    { "id": "RSTS-08", "name": "Archived", "examples": ["RCS-08", "RSS-08"], "domain": "RSTD-05" }
  ],
  "total_classes": 8,
  "total_allowed_transitions": 20
}
```

### Block 6 — State Models

```json
{
  "$schema": "RT-005-model-registry",
  "state_models": [
    {
      "id": "RSTM-01",
      "name": "Lifecycle State",
      "domain": "RSTD-01",
      "consumers": ["AI-001", "AI-002", "AI-014"]
    },
    {
      "id": "RSTM-02",
      "name": "Execution State",
      "domain": "RSTD-02",
      "consumers": ["AI-003", "AI-006", "AI-008"]
    },
    {
      "id": "RSTM-03",
      "name": "Session State",
      "domain": "RSTD-01",
      "consumers": ["AI-001", "AI-004", "AI-014"]
    },
    {
      "id": "RSTM-04",
      "name": "Context State",
      "domain": "RSTD-04",
      "consumers": ["AI-003", "AI-011", "AI-013"]
    },
    {
      "id": "RSTM-05",
      "name": "Knowledge State",
      "domain": "RSTD-01",
      "consumers": ["AI-011", "AI-013"]
    },
    { "id": "RSTM-06", "name": "Agent State", "domain": "RSTD-02", "consumers": ["AI-014"] },
    {
      "id": "RSTM-07",
      "name": "Workflow State",
      "domain": "RSTD-02",
      "consumers": ["AI-008", "AI-014"]
    },
    { "id": "RSTM-08", "name": "Composite State", "domain": "RSTD-04", "consumers": ["AI-014"] }
  ],
  "total_models": 8
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — State Record Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-005-state-record",
  "title": "State Record Schema",
  "description": "Schema for a state record in the Enterprise Runtime State Architecture",
  "type": "object",
  "properties": {
    "state_id": {
      "type": "string",
      "description": "شناسه یکتای وضعیت",
      "pattern": "^RST-[0-9]{12}-[A-Z0-9]{8}$"
    },
    "state_domain": {
      "type": "string",
      "description": "دامنه وضعیت",
      "enum": [
        "RSTD-01",
        "RSTD-02",
        "RSTD-03",
        "RSTD-04",
        "RSTD-05",
        "RSTD-06",
        "RSTD-07",
        "RSTD-08"
      ]
    },
    "state_class": {
      "type": "string",
      "description": "کلاس وضعیت",
      "enum": [
        "initial",
        "intermediate",
        "stable",
        "transitional",
        "suspended",
        "recoverable",
        "terminal",
        "archived"
      ]
    },
    "state_value": {
      "type": "string",
      "description": "مقدار وضعیت",
      "pattern": "^[A-Z]+-[0-9]{2}$"
    },
    "entity_id": {
      "type": "string",
      "description": "شناسه موجودیت مرتبط"
    },
    "owner": {
      "type": "string",
      "description": "مالک وضعیت",
      "pattern": "^OWN-[A-Z0-9]{8}$"
    },
    "transition_history": {
      "type": "array",
      "description": "تاریخچه انتقال‌ها",
      "items": {
        "type": "object",
        "properties": {
          "transition_id": { "type": "string" },
          "from_state": { "type": "string" },
          "to_state": { "type": "string" },
          "condition": { "type": "string" },
          "trigger": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    },
    "lineage": {
      "type": "object",
      "description": "شجره وضعیت",
      "properties": {
        "lineage_id": { "type": "string" },
        "depth": { "type": "integer", "minimum": 0 },
        "is_complete": { "type": "boolean" }
      }
    },
    "consistency_status": {
      "type": "string",
      "description": "وضعیت سازگاری",
      "enum": ["consistent", "inconsistent", "unknown", "pending_review"]
    },
    "created_at": {
      "type": "string",
      "description": "زمان ایجاد وضعیت",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "description": "آخرین به‌روزرسانی",
      "format": "date-time"
    }
  },
  "required": ["state_id", "state_domain", "state_class", "state_value", "entity_id", "owner"]
}
```

### Schema 2 — State Transition Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-005-state-transition",
  "title": "State Transition Schema",
  "description": "Schema for a state transition in the Enterprise Runtime State Architecture",
  "type": "object",
  "properties": {
    "transition_id": {
      "type": "string",
      "description": "شناسه یکتای انتقال"
    },
    "state_id": {
      "type": "string",
      "description": "شناسه وضعیت"
    },
    "from_class": {
      "type": "string",
      "description": "کلاس مبدأ",
      "enum": [
        "initial",
        "intermediate",
        "stable",
        "transitional",
        "suspended",
        "recoverable",
        "terminal",
        "archived"
      ]
    },
    "to_class": {
      "type": "string",
      "description": "کلاس مقصد",
      "enum": [
        "initial",
        "intermediate",
        "stable",
        "transitional",
        "suspended",
        "recoverable",
        "terminal",
        "archived"
      ]
    },
    "condition": {
      "type": "string",
      "description": "شرط انتقال",
      "enum": [
        "operation_started",
        "operation_completed",
        "operation_failed",
        "command_received",
        "dependency_satisfied",
        "timeout_expired",
        "error_detected",
        "recovery_initiated",
        "authorization_granted",
        "policy_violated"
      ]
    },
    "condition_satisfied": {
      "type": "boolean",
      "description": "شرط برآورده شده است"
    },
    "trigger": {
      "type": "string",
      "description": "محرک انتقال",
      "enum": [
        "system",
        "owner",
        "participant",
        "scheduler",
        "policy",
        "error",
        "expiry",
        "dependency"
      ]
    },
    "status": {
      "type": "string",
      "description": "وضعیت انتقال",
      "enum": ["pending", "evaluating", "approved", "executing", "completed", "failed", "rejected"]
    },
    "stage": {
      "type": "string",
      "description": "مرحله مرتبط",
      "enum": [
        "define",
        "classify",
        "assign",
        "validate",
        "persist",
        "synchronize",
        "evolve",
        "archive"
      ]
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "duration_ms": { "type": "integer" },
        "reason": { "type": "string" },
        "source_model": {
          "type": "string",
          "enum": [
            "lifecycle",
            "execution",
            "session",
            "context",
            "knowledge",
            "agent",
            "workflow",
            "composite"
          ]
        }
      }
    }
  },
  "required": ["transition_id", "state_id", "from_class", "to_class", "condition", "trigger"]
}
```

### Schema 3 — State Consistency Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-005-state-consistency",
  "title": "State Consistency Schema",
  "description": "Schema for state consistency verification in the Enterprise Runtime State Architecture",
  "type": "object",
  "properties": {
    "consistency_id": {
      "type": "string",
      "description": "شناسه یکتای بررسی سازگاری"
    },
    "primary_state": {
      "type": "string",
      "description": "وضعیت اصلی"
    },
    "check_type": {
      "type": "string",
      "description": "نوع بررسی",
      "enum": ["intra_domain", "cross_domain", "cross_model", "governance", "lineage"]
    },
    "related_states": {
      "type": "array",
      "description": "وضعیت‌های مرتبط",
      "items": {
        "type": "object",
        "properties": {
          "state_id": { "type": "string" },
          "relationship_type": {
            "type": "string",
            "enum": ["depends_on", "synchronized_with", "evolved_from", "classified_as"]
          },
          "expected_class": {
            "type": "string",
            "enum": [
              "initial",
              "intermediate",
              "stable",
              "transitional",
              "suspended",
              "recoverable",
              "terminal",
              "archived"
            ]
          },
          "actual_class": { "type": "string" }
        }
      }
    },
    "rules_applied": {
      "type": "array",
      "description": "قواعد اعمال‌شده",
      "items": {
        "type": "object",
        "properties": {
          "rule_id": { "type": "string", "pattern": "^RSTCR-[0-9]{2}$" },
          "satisfied": { "type": "boolean" },
          "details": { "type": "string" }
        }
      }
    },
    "status": {
      "type": "string",
      "description": "نتیجه بررسی",
      "enum": ["consistent", "inconsistent", "pending", "not_applicable"]
    },
    "violations": {
      "type": "array",
      "description": "نقض‌های شناسایی‌شده",
      "items": {
        "type": "object",
        "properties": {
          "rule_id": { "type": "string" },
          "severity": { "type": "string", "enum": ["critical", "major", "minor", "warning"] },
          "description": { "type": "string" },
          "resolution": { "type": "string" }
        }
      }
    },
    "checked_at": {
      "type": "string",
      "format": "date-time"
    },
    "next_check_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["consistency_id", "primary_state", "check_type", "status"]
}
```

---

## ۲۹. State Quality Gates

۷ گیت کیفیت وضعیت:

| ID       | گیت                             | مرحله    | معیار عبور                                             |
| -------- | ------------------------------- | -------- | ------------------------------------------------------ |
| RSTQG-01 | **Definition Completeness**     | RSTST-01 | وضعیت دارای تعریف رسمی، کلاس و دامنه معتبر است         |
| RSTQG-02 | **Classification Accuracy**     | RSTST-02 | کلاس وضعیت با رفتار و ماهیت وضعیت سازگار است           |
| RSTQG-03 | **Assignment Validity**         | RSTST-03 | وضعیت به موجودیت معتبر و با هویت یکتا اختصاص یافته است |
| RSTQG-04 | **Validation Integrity**        | RSTST-04 | وضعیت از نظر ساختاری و معنایی معتبر است                |
| RSTQG-05 | **Persistence Readiness**       | RSTST-05 | وضعیت برای ذخیره‌سازی و بازیابی آماده است              |
| RSTQG-06 | **Synchronization Consistency** | RSTST-06 | وضعیت با سایر وضعیت‌های مرتبط همگام و سازگار است       |
| RSTQG-07 | **Evolution Auditability**      | RSTST-07 | تکامل وضعیت ثبت، حسابرسی و قابل بازگشت است             |

---

## ۳۰. Cross-Domain State Mapping

### نگاشت بین دامنه وضعیت و سایر معماری‌های Runtime

| معماری              | RT-005 (وضعیت)                   | نوع نگاشت                                                   |
| ------------------- | -------------------------------- | ----------------------------------------------------------- |
| RT-001 (Foundation) | RSTM-01 (Lifecycle State)        | تخصصی‌سازی — وضعیت چرخه حیات از RTC-003 مشتق شده            |
| RT-002 (Execution)  | RSTM-02 (Execution State)        | تخصصی‌سازی — وضعیت اجرا از REC-008 مشتق شده                 |
| RT-003 (Context)    | RSTM-04 (Context State)          | تخصصی‌سازی — وضعیت بافت از RCC-003 مشتق شده                 |
| RT-004 (Session)    | RSTM-03 (Session State)          | تخصصی‌سازی — وضعیت نشست از RSC-006 مشتق شده                 |
| RT-001..RT-004      | RSTS-01..08 (State Classes)      | یکسان‌سازی — همه وضعیت‌های Runtime به ۸ کلاس نگاشت می‌شوند  |
| RT-001..RT-004      | RSTD-01..08 (State Domains)      | تفکیک — یک دامنه State به ۸ دامنه تخصصی تفکیک شده           |
| RT-001..RT-004      | RSTCR-01..12 (Consistency Rules) | یکپارچه‌سازی — قواعد سازگاری بین همه Runtime‌ها یکپارچه شده |

### نگاشت به RT-001، RT-002، RT-003 و RT-004

| RT-۰۰۱/۰۰۲/۰۰۳/۰۰۴          | RT-005 (اختصاصی وضعیت)      | نوع نگاشت                                                  |
| --------------------------- | --------------------------- | ---------------------------------------------------------- |
| RTD-03 (State)              | RSTD-01..RSTD-08            | تخصصی‌سازی — دامنه وضعیت RTD-03 به ۸ دامنه تخصصی تبدیل شده |
| RTE-002 (Execution)         | RSTM-02 (Execution State)   | تخصصی‌سازی                                                 |
| RTE-003 (Context)           | RSTM-04 (Context State)     | تخصصی‌سازی                                                 |
| RTE-004 (Session)           | RSTM-03 (Session State)     | تخصصی‌سازی                                                 |
| RTS-01..08 (Runtime States) | RSTS-01..08 (State Classes) | تکامل — حالت‌های Runtime به کلاس‌های وضعیت تبدیل شده       |
| RES-01..08                  | RSTS-01..08                 | نگاشت مستقیم                                               |
| RCS-01..08                  | RSTS-01..08                 | نگاشت مستقیم                                               |
| RSS-01..08                  | RSTS-01..08                 | نگاشت مستقیم                                               |
| RTC-003 (Runtime State)     | RSTM-01..RSTM-08            | تخصصی‌سازی — یک مفهوم State به ۸ مدل وضعیت گسترش یافته     |
| RTF-03 (Manage State)       | RSTF-01..14                 | گسترش — یک کارکرد به ۱۴ کارکرد تخصصی                       |
| RTE-007 (Context)           | RSTD-03 (State Validation)  | ارتباط — بافت برای اعتبارسنجی وضعیت استفاده می‌شود         |

---

> **پایان RT-005 — Enterprise Runtime State Architecture**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۱۰
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**
