# RT-004 — Enterprise Runtime Session Architecture

> **معماری نشست زمان اجرای سازمانی SMOS**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۱۰
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**

---

## ۱. Purpose

RT-004 معماری نشست (Session) زمان اجرای سازمانی SMOS را تعریف می‌کند. Session (نشست) یک موجودیت Runtime است که مرزهای یک تعامل، اجرا یا همکاری را در زمان اجرا مشخص می‌کند. نشست‌ها هویت، وضعیت و مالکیت را برای مدت زمان یک عملیات سازمانی فراهم می‌کنند و تعیین می‌کنند که چه کسی (چه چیزی) در چه زمانی و با چه مجوزی در حال انجام چه کاری است.

**SSOT**: تنها منبع معتبر برای معماری نشست زمان اجرای سازمانی SMOS.

---

## ۲. Scope

این سند محدوده زیر را پوشش می‌دهد:

- اصول و فلسفه نشست در Runtime
- دامنه‌ها، مفاهیم و موجودیت‌های نشست
- قابلیت‌ها و کارکردهای نشست
- مدل مرحله‌ای و مدل وضعیت نشست
- مدل‌های نشست (Session Models)
- مدل‌های هویت، چرخه حیات، پیوست بافت، ایزولاسیون و تکامل نشست
- روابط، معیارها، محدودیت‌ها و گیت‌های کیفیت نشست
- ۶ بلوک Machine Readable JSON
- ۳ JSON Schema (Draft-07)

**خارج از محدوده**:

- پیاده‌سازی فنی مدیریت نشست
- الگوریتم‌های هماهنگی یا همگام‌سازی نشست
- حافظه نهان (Cache) یا پایگاه داده نشست
- APIها، پروتکل‌ها یا زبان‌های خاص
- مدیریت احراز هویت یا مجوزدهی
- پایگاه داده یا Vendor خاص
- هرگونه پیاده‌سازی اجرایی
- دیاگرام، نمودار یا نمایش بصری

---

## ۳. Session Principles

نشست زمان اجرای SMOS بر ۸ اصل زیر استوار است:

| ID     | اصل                           | توضیح                                                        |
| ------ | ----------------------------- | ------------------------------------------------------------ |
| RSP-01 | **Identity Immutability**     | هویت نشست پس از ایجاد تغییر نمی‌کند                          |
| RSP-02 | **Explicit Ownership**        | هر نشست دارای مالک مشخص و مسئول است                          |
| RSP-03 | **Independent Lifecycle**     | چرخه حیات نشست مستقل از محتوای آن است                        |
| RSP-04 | **Controlled Isolation**      | نشست‌ها ایزوله هستند مگر اینکه اشتراک به صراحت مجاز شده باشد |
| RSP-05 | **Governed Visibility**       | دید نشست بر اساس قواعد حکمرانی محدود می‌شود                  |
| RSP-06 | **Traceable Lineage**         | مسیر نشست از ایجاد تا خاتمه قابل ردیابی است                  |
| RSP-07 | **Deterministic Termination** | خاتمه نشست همیشه نتیجه قابل پیش‌بینی دارد                    |
| RSP-08 | **Full Auditability**         | تمام تغییرات وضعیت نشست قابل حسابرسی هستند                   |

این اصول مکمل RTP-01..08 (RT-001)، REP-01..08 (RT-002) و RCP-01..08 (RT-003) هستند.

---

## ۴. Session Philosophy

نشست زمان اجرای SMOS بر اساس فلسفه "نشست امن با هویت پایدار در مرزهای تعریف‌شده" (Secure Session with Stable Identity Within Defined Boundaries) طراحی شده است. نشست به عنوان واحد مستقل تعامل در زمان اجرا عمل می‌کند که مرزهای یک عملیات را مشخص کرده و هویت و وضعیت آن را در طول چرخه حیات حفظ می‌کند.

نشست SMOS:

- **هویت پایدار دارد** — شناسه نشست در تمام طول عمر بدون تغییر می‌ماند
- **مستقل است** — چرخه حیات نشست مستقل از اجراها و وظایف آن است
- **ایزوله است** — هر نشست در مرز مشخص خود عمل می‌کند
- **قابل ردیابی است** — تمام تغییرات وضعیت نشست ثبت می‌شود
- **قابل انتساب است** — مالک و تولیدکننده هر نشست مشخص است
- **قابل پیش‌بینی است** — رفتار نشست در همه شرایط قطعی است

---

## ۵. Architecture — Session in the Layered Model

نشست در معماری ۵ لایه‌ای RT-001 در لایه LYR-RT-02 (Context & Session Layer) قرار دارد اما با تمام لایه‌های دیگر تعامل دارد:

| لایه                          | نقش در نشست                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| LYR-RT-01 (Execution)         | **مصرف‌کننده نشست** — اجراها درون یک نشست انجام می‌شوند     |
| LYR-RT-02 (Context & Session) | **لایه اصلی نشست** — مدیریت ایجاد، فعال‌سازی و خاتمه نشست   |
| LYR-RT-03 (State)             | **ثبت‌کننده نشست** — وضعیت و ماندگاری نشست را مدیریت می‌کند |
| LYR-RT-04 (Coordination)      | **هماهنگ‌ساز نشست** — هماهنگی بین نشست‌ها و اشتراک آنها     |
| LYR-RT-05 (Governance)        | **حاکم بر نشست** — سیاست‌ها، محدودیت‌ها و حسابرسی نشست      |

---

## ۶. Session Domains

نشست زمان اجرای SMOS شامل ۸ دامنه اصلی است:

| ID     | نام                      | توضیح                                              | لایه مرتبط |
| ------ | ------------------------ | -------------------------------------------------- | ---------- |
| RSD-01 | **Session Identity**     | هویت نشست — شناسایی یکتای نشست و انتساب آن         | LYR-RT-02  |
| RSD-02 | **Session Lifecycle**    | چرخه حیات نشست — ایجاد، فعال‌سازی، تعلیق، خاتمه    | LYR-RT-02  |
| RSD-03 | **Session Context**      | بافت نشست — داده‌ها و شرایط مرتبط با نشست          | LYR-RT-02  |
| RSD-04 | **Session Ownership**    | مالکیت نشست — مالک، تولیدکننده و مصرف‌کنندگان نشست | LYR-RT-02  |
| RSD-05 | **Session Isolation**    | ایزولاسیون نشست — جداسازی نشست‌ها از یکدیگر        | LYR-RT-02  |
| RSD-06 | **Session Coordination** | هماهنگی نشست — اشتراک، توالی و وابستگی بین نشست‌ها | LYR-RT-04  |
| RSD-07 | **Session Governance**   | حکمرانی نشست — سیاست‌ها و محدودیت‌های نشست         | LYR-RT-05  |
| RSD-08 | **Session Evolution**    | تکامل نشست — تغییر و به‌روزرسانی نشست در طول زمان  | LYR-RT-02  |

---

## ۷. Session Concepts

۲۰ مفهوم اصلی نشست زمان اجرا:

| ID      | مفهوم                    | توضیح                                          | دامنه  |
| ------- | ------------------------ | ---------------------------------------------- | ------ |
| RSC-001 | **Session**              | نشست — موجودیت مرزی یک تعامل زمان اجرا         | RSD-02 |
| RSC-002 | **Session Identity**     | هویت نشست — شناسه یکتای نشست                   | RSD-01 |
| RSC-003 | **Session Owner**        | مالک نشست — موجودیت مسئول نشست                 | RSD-04 |
| RSC-004 | **Session Creator**      | تولیدکننده نشست — موجودیت ایجادکننده نشست      | RSD-04 |
| RSC-005 | **Session Participant**  | مشارکت‌کننده نشست — موجودیت فعال درون نشست     | RSD-04 |
| RSC-006 | **Session State**        | وضعیت نشست — وضعیت جاری نشست در چرخه حیات      | RSD-02 |
| RSC-007 | **Session Stage**        | مرحله نشست — گام فعلی در فرآیند نشست           | RSD-02 |
| RSC-008 | **Session Context**      | بافت نشست — داده‌ها و شرایط مرتبط با نشست      | RSD-03 |
| RSC-009 | **Session Policy**       | سیاست نشست — قواعد حاکم بر نشست                | RSD-07 |
| RSC-010 | **Session Boundary**     | مرز نشست — محدوده مجاز فعالیت نشست             | RSD-05 |
| RSC-011 | **Session Isolation**    | ایزولاسیون نشست — جداسازی نشست از سایر نشست‌ها | RSD-05 |
| RSC-012 | **Session Coordination** | هماهنگی نشست — هماهنگی بین نشست‌ها             | RSD-06 |
| RSC-013 | **Session Dependency**   | وابستگی نشست — وابستگی یک نشست به نشست دیگر    | RSD-06 |
| RSC-014 | **Session Lineage**      | شجره نشست — مسیر کامل تکامل نشست               | RSD-07 |
| RSC-015 | **Session Audit**        | حسابرسی نشست — ثبت و بازبینی رویدادهای نشست    | RSD-07 |
| RSC-016 | **Session Lifetime**     | طول عمر نشست — مدت زمان اعتبار نشست            | RSD-02 |
| RSC-017 | **Session Expiry**       | انقضای نشست — پایان اعتبار نشست                | RSD-02 |
| RSC-018 | **Session Evolution**    | تکامل نشست — تغییر ویژگی‌های نشست در طول زمان  | RSD-08 |
| RSC-019 | **Session Migration**    | مهاجرت نشست — انتقال نشست بین محیط‌ها          | RSD-08 |
| RSC-020 | **Session Termination**  | خاتمه نشست — پایان قطعی چرخه حیات نشست         | RSD-02 |

---

## ۸. Session Entities

۱۲ موجودیت اصلی نشست زمان اجرا:

| ID      | موجودیت                 | توضیح                                       | دامنه  | نوع         |
| ------- | ----------------------- | ------------------------------------------- | ------ | ----------- |
| RSE-001 | **SessionRecord**       | ثبت نشست — موجودیت مرکزی حاوی داده‌های نشست | RSD-02 | Core        |
| RSE-002 | **SessionIdentity**     | هویت نشست — شناسه یکتای نشست                | RSD-01 | Core        |
| RSE-003 | **SessionOwner**        | مالک نشست — موجودیت مسئول نشست              | RSD-04 | Core        |
| RSE-004 | **SessionParticipant**  | مشارکت‌کننده نشست — موجودیت فعال درون نشست  | RSD-04 | Operational |
| RSE-005 | **SessionState**        | وضعیت نشست — حالت جاری نشست                 | RSD-02 | Core        |
| RSE-006 | **SessionStage**        | مرحله نشست — گام فعلی نشست                  | RSD-02 | Operational |
| RSE-007 | **SessionContext**      | بافت نشست — داده‌های مرتبط با نشست          | RSD-03 | Operational |
| RSE-008 | **SessionBoundary**     | مرز نشست — محدوده مجاز نشست                 | RSD-05 | Governance  |
| RSE-009 | **SessionPolicy**       | سیاست نشست — قاعده حاکم بر نشست             | RSD-07 | Governance  |
| RSE-010 | **SessionLineage**      | شجره نشست — مسیر تکامل نشست                 | RSD-07 | Audit       |
| RSE-011 | **SessionDependency**   | وابستگی نشست — وابستگی بین نشست‌ها          | RSD-06 | Operational |
| RSE-012 | **SessionCoordination** | هماهنگی نشست — واحد هماهنگی بین نشست‌ها     | RSD-06 | Operational |

---

## ۹. Session Capabilities

۱۴ قابلیت اصلی نشست زمان اجرا:

| ID        | قابلیت                       | توضیح                                          | دامنه  |
| --------- | ---------------------------- | ---------------------------------------------- | ------ |
| RSCAP-001 | **Session Creation**         | ایجاد نشست — تولید یک نشست جدید با هویت یکتا   | RSD-02 |
| RSCAP-002 | **Identity Assignment**      | انتساب هویت — تخصیص شناسه یکتا به نشست         | RSD-01 |
| RSCAP-003 | **Owner Assignment**         | انتساب مالک — تعیین مالک نشست                  | RSD-04 |
| RSCAP-004 | **State Management**         | مدیریت وضعیت — انتقال بین وضعیت‌های نشست       | RSD-02 |
| RSCAP-005 | **Context Attachment**       | پیوست بافت — اتصال بافت به نشست                | RSD-03 |
| RSCAP-006 | **Participant Registration** | ثبت مشارکت‌کننده — افزودن مشارکت‌کننده به نشست | RSD-04 |
| RSCAP-007 | **Boundary Enforcement**     | اعمال مرز — محدودسازی دامنه فعالیت نشست        | RSD-05 |
| RSCAP-008 | **Isolation Provisioning**   | ایزولاسیون نشست — جداسازی نشست‌ها              | RSD-05 |
| RSCAP-009 | **Session Coordination**     | هماهنگی نشست — هماهنگی بین نشست‌ها             | RSD-06 |
| RSCAP-010 | **Dependency Management**    | مدیریت وابستگی — ردیابی و اعمال وابستگی‌ها     | RSD-06 |
| RSCAP-011 | **Governance Enforcement**   | اعمال حکمرانی — اجرای سیاست‌های نشست           | RSD-07 |
| RSCAP-012 | **Audit Logging**            | ثبت حسابرسی — ثبت رویدادهای نشست               | RSD-07 |
| RSCAP-013 | **Expiry Management**        | مدیریت انقضا — اعمال محدودیت زمانی نشست        | RSD-02 |
| RSCAP-014 | **Evolution Tracking**       | ردیابی تکامل — ثبت تغییرات نشست در طول زمان    | RSD-08 |

---

## ۱۰. Session Functions

۱۴ کارکرد اصلی نشست زمان اجرا:

| ID     | کارکرد               | قابلیت مرتبط | دامنه  |
| ------ | -------------------- | ------------ | ------ |
| RSF-01 | Create Session       | RSCAP-001    | RSD-02 |
| RSF-02 | Assign Identity      | RSCAP-002    | RSD-01 |
| RSF-03 | Assign Owner         | RSCAP-003    | RSD-04 |
| RSF-04 | Manage State         | RSCAP-004    | RSD-02 |
| RSF-05 | Attach Context       | RSCAP-005    | RSD-03 |
| RSF-06 | Register Participant | RSCAP-006    | RSD-04 |
| RSF-07 | Enforce Boundary     | RSCAP-007    | RSD-05 |
| RSF-08 | Provision Isolation  | RSCAP-008    | RSD-05 |
| RSF-09 | Coordinate Sessions  | RSCAP-009    | RSD-06 |
| RSF-10 | Manage Dependency    | RSCAP-010    | RSD-06 |
| RSF-11 | Enforce Governance   | RSCAP-011    | RSD-07 |
| RSF-12 | Log Audit            | RSCAP-012    | RSD-07 |
| RSF-13 | Manage Expiry        | RSCAP-013    | RSD-02 |
| RSF-14 | Track Evolution      | RSCAP-014    | RSD-08 |

---

## ۱۱. Session Stage Model

مدل مرحله‌ای نشست زمان اجرا شامل ۸ مرحله است:

| ID      | مرحله              | ورودی                  | خروجی                  | دامنه  |
| ------- | ------------------ | ---------------------- | ---------------------- | ------ |
| RSST-01 | **Create**         | SessionRequest         | CreatedSession         | RSD-02 |
| RSST-02 | **Initialize**     | CreatedSession         | InitializedSession     | RSD-02 |
| RSST-03 | **Attach Context** | InitializedSession     | ContextAttachedSession | RSD-03 |
| RSST-04 | **Activate**       | ContextAttachedSession | ActiveSession          | RSD-02 |
| RSST-05 | **Maintain**       | ActiveSession          | MaintainedSession      | RSD-06 |
| RSST-06 | **Suspend**        | ActiveSession          | SuspendedSession       | RSD-02 |
| RSST-07 | **Close**          | ActiveSession          | ClosedSession          | RSD-02 |
| RSST-08 | **Archive**        | ClosedSession          | ArchivedSession        | RSD-02 |

---

## ۱۲. Session State Model

مدل وضعیت نشست زمان اجرا شامل ۸ وضعیت با ۲۰ انتقال مجاز است:

### وضعیت‌ها

| ID     | وضعیت           | توضیح                                                |
| ------ | --------------- | ---------------------------------------------------- |
| RSS-01 | **Created**     | ایجادشده — نشست ایجاد شده اما هنوز آماده نیست        |
| RSS-02 | **Initialized** | مقداردهی‌شده — نشست مقداردهی و آماده فعال‌سازی است   |
| RSS-03 | **Active**      | فعال — نشست فعال و در حال استفاده است                |
| RSS-04 | **Suspended**   | معلق — نشست به طور موقت غیرفعال است                  |
| RSS-05 | **Waiting**     | در انتظار — نشست منتظر رویداد یا وابستگی است         |
| RSS-06 | **Resumed**     | بازگشایی‌شده — نشست پس از تعلیق مجدداً فعال شده      |
| RSS-07 | **Closed**      | بسته‌شده — نشست به طور عادی خاتمه یافته              |
| RSS-08 | **Archived**    | بایگانی‌شده — نشست برای نگهداری طولانی مدت ذخیره شده |

### انتقال‌های مجاز

| مبدأ                 | مقصد                 | شرط                            |
| -------------------- | -------------------- | ------------------------------ |
| RSS-01 (Created)     | RSS-02 (Initialized) | مقداردهی اولیه کامل شده است    |
| RSS-01 (Created)     | RSS-07 (Closed)      | خطا در ایجاد نشست              |
| RSS-02 (Initialized) | RSS-03 (Active)      | بافت پیوست و تأیید شده است     |
| RSS-02 (Initialized) | RSS-04 (Suspended)   | نیاز به تعلیق قبل از فعال‌سازی |
| RSS-02 (Initialized) | RSS-07 (Closed)      | انصراف از فعال‌سازی            |
| RSS-03 (Active)      | RSS-04 (Suspended)   | دستور تعلیق صادر شده           |
| RSS-03 (Active)      | RSS-05 (Waiting)     | وابستگی برآورده نشده           |
| RSS-03 (Active)      | RSS-06 (Resumed)     | بازگشایی پس از تعلیق ضمنی      |
| RSS-03 (Active)      | RSS-07 (Closed)      | خاتمه عادی نشست                |
| RSS-04 (Suspended)   | RSS-03 (Active)      | رفع مشکل تعلیق                 |
| RSS-04 (Suspended)   | RSS-06 (Resumed)     | بازگشایی رسمی نشست             |
| RSS-04 (Suspended)   | RSS-07 (Closed)      | خاتمه در حالت تعلیق            |
| RSS-04 (Suspended)   | RSS-08 (Archived)    | بایگانی نشست معلق              |
| RSS-05 (Waiting)     | RSS-03 (Active)      | وابستگی برآورده شد             |
| RSS-05 (Waiting)     | RSS-04 (Suspended)   | تعلیق در حالت انتظار           |
| RSS-05 (Waiting)     | RSS-07 (Closed)      | مهلت انتظار به پایان رسید      |
| RSS-06 (Resumed)     | RSS-03 (Active)      | بازگشایی کامل شد               |
| RSS-06 (Resumed)     | RSS-07 (Closed)      | خاتمه پس از بازگشایی           |
| RSS-07 (Closed)      | RSS-08 (Archived)    | نشست بسته بایگانی می‌شود       |
| RSS-07 (Closed)      | RSS-04 (Suspended)   | بازگشایی استثنایی نشست بسته    |

---

## ۱۳. Session Models

۸ مدل نشست:

| ID     | مدل                       | توضیح                                        | دامنه  |
| ------ | ------------------------- | -------------------------------------------- | ------ |
| RSM-01 | **Execution Session**     | نشست اجرا — مرز یک اجرا یا وظیفه             | RSD-02 |
| RSM-02 | **User Session**          | نشست کاربر — مرز تعامل یک کاربر انسانی       | RSD-04 |
| RSM-03 | **Agent Session**         | نشست عامل — مرز تعامل یک Agent هوشمند        | RSD-04 |
| RSM-04 | **Knowledge Session**     | نشست دانش — مرز یک عملیات دانشی              | RSD-03 |
| RSM-05 | **Workflow Session**      | نشست گردش کار — مرز یک گردش کار              | RSD-06 |
| RSM-06 | **Collaborative Session** | نشست همکاری — مرز یک همکاری بین چند موجودیت  | RSD-06 |
| RSM-07 | **System Session**        | نشست سیستم — مرز یک عملیات سیستمی            | RSD-04 |
| RSM-08 | **Composite Session**     | نشست ترکیبی — ترکیب چند نشست در یک نشست واحد | RSD-08 |

---

## ۱۴. Session Relationships

۱۰ رابطه اصلی نشست:

| ID     | رابطه                | مبدأ          | مقصد                | توضیح                                   |
| ------ | -------------------- | ------------- | ------------------- | --------------------------------------- |
| RSR-01 | **Owned By**         | SessionRecord | SessionOwner        | نشست توسط یک مالک اداره می‌شود          |
| RSR-02 | **Participated By**  | SessionRecord | SessionParticipant  | نشست توسط مشارکت‌کنندگان استفاده می‌شود |
| RSR-03 | **Has Context**      | SessionRecord | SessionContext      | نشست دارای بافت مرتبط است               |
| RSR-04 | **Has State**        | SessionRecord | SessionState        | نشست دارای وضعیت جاری است               |
| RSR-05 | **Governed By**      | SessionRecord | SessionPolicy       | نشست تابع یک سیاست است                  |
| RSR-06 | **Has Boundary**     | SessionRecord | SessionBoundary     | نشست دارای مرز مشخص است                 |
| RSR-07 | **Has Lineage**      | SessionRecord | SessionLineage      | نشست دارای شجره قابل ردیابی است         |
| RSR-08 | **Depends On**       | SessionRecord | SessionDependency   | نشست به نشست دیگر وابسته است            |
| RSR-09 | **Coordinates With** | SessionRecord | SessionCoordination | نشست با نشست دیگر هماهنگ می‌شود         |
| RSR-10 | **Evolved From**     | SessionRecord | SessionRecord       | نشست از یک نشست قبلی تکامل یافته است    |

---

## ۱۵. Session Integrity

یکپارچگی نشست بر اساس ۴ بعد تعریف می‌شود:

### بعد ۱: یکپارچگی هویت (Identity Integrity)

| قاعده                                   | توضیح |
| --------------------------------------- | ----- |
| هر نشست باید دارای هویت یکتا باشد       |
| هویت نشست پس از ایجاد قابل تغییر نیست   |
| هویت نشست باید قابل انتساب به مالک باشد |

### بعد ۲: یکپارچگی وضعیت (State Integrity)

| قاعده                                                 | توضیح |
| ----------------------------------------------------- | ----- |
| هر نشست در هر زمان فقط یک وضعیت دارد                  |
| انتقال وضعیت فقط از طریق انتقال‌های مجاز انجام می‌شود |
| تغییر وضعیت باید در شجره نشست ثبت شود                 |

### بعد ۳: یکپارچگی مرز (Boundary Integrity)

| قاعده                                       | توضیح |
| ------------------------------------------- | ----- |
| هر نشست باید دارای مرز مشخص باشد            |
| فعالیت خارج از مرز نشست مجاز نیست           |
| نقض مرز باید منجر به هشدار یا مسدودسازی شود |

### بعد ۴: یکپارچگی شجره (Lineage Integrity)

| قاعده                                         | توضیح |
| --------------------------------------------- | ----- |
| هر نشست باید دارای شجره کامل باشد             |
| تمام تغییرات وضعیت نشست باید در شجره ثبت شوند |
| شجره نشست باید قابل حسابرسی باشد              |

---

## ۱۶. Session Consistency Rules

۱۲ قاعده سازگاری نشست:

| ID      | قاعده                                           | توضیح                           |
| ------- | ----------------------------------------------- | ------------------------------- |
| RSCR-01 | هر نشست دقیقاً یک هویت یکتا دارد                | Unique identity per session     |
| RSCR-02 | هر نشست دقیقاً یک مالک دارد                     | Single owner per session        |
| RSCR-03 | هر نشست در یک زمان فقط یک وضعیت دارد            | Single state at any time        |
| RSCR-04 | انتقال وضعیت فقط از طریق انتقال‌های مجاز        | Allowed transitions only        |
| RSCR-05 | هر نشست باید دارای مرز مشخص باشد                | Defined boundary                |
| RSCR-06 | نشست‌های هماهنگ باید سازگار باشند               | Coordinated session consistency |
| RSCR-07 | وابستگی نشست باید قبل از مصرف برآورده شود       | Dependency ordering             |
| RSCR-08 | نشست وابسته باید قبل از وابسته‌کننده خاتمه یابد | Termination ordering            |
| RSCR-09 | نشست نباید خارج از مرز تعریف‌شده عمل کند        | Scope-bound operation           |
| RSCR-10 | هویت نشست در طول عمر تغییر نمی‌کند              | Identity immutability           |
| RSCR-11 | نشست منقضی نباید فعال شود                       | No expired activation           |
| RSCR-12 | شجره نشست باید غیرچرخه‌ای باشد                  | Acyclic lineage                 |

---

## ۱۷. Session Constraints

۸ محدودیت اصلی نشست:

| ID       | محدودیت                                    | توضیح                    |
| -------- | ------------------------------------------ | ------------------------ |
| RSCST-01 | هر نشست فقط یک وضعیت در هر زمان دارد       | Single state at any time |
| RSCST-02 | انتقال وضعیت فقط از طریق انتقال‌های مجاز   | Allowed transitions only |
| RSCST-03 | هر نشست دارای هویت یکتای غیرقابل تغییر است | Immutable identity       |
| RSCST-04 | هر نشست دارای مرز مشخص است                 | Defined boundary         |
| RSCST-05 | فعالیت نشست فقط درون مرز مجاز است          | Scope-bound activity     |
| RSCST-06 | نشست منقضی قابل بازیابی نیست               | No expired recovery      |
| RSCST-07 | نشست خاتمه‌یافته قابل بازگشایی نیست        | No closed reopening      |
| RSCST-08 | هر نشست باید دارای شجره کامل باشد          | Mandatory lineage        |

---

## ۱۸. Session Governance

حکمرانی نشست بر اساس ۵ سطح اختیار (A-0 تا A-4) و ۴ حوزه حکمرانی تعریف می‌شود:

### حوزه‌های حکمرانی نشست

| حوزه                      | توضیح                                          |
| ------------------------- | ---------------------------------------------- |
| **Creation Governance**   | حکمرانی ایجاد — مجوز ایجاد و انتساب هویت نشست  |
| **Access Governance**     | حکمرانی دسترسی — مرزها و مشارکت‌کنندگان نشست   |
| **Lifecycle Governance**  | حکمرانی چرخه حیات — تعلیق، خاتمه، بایگانی نشست |
| **Compliance Governance** | حکمرانی انطباق — سیاست‌ها و حسابرسی نشست       |

### مدل تصمیم‌گیری نشست

| نوع تصمیم           | سطح اختیار | مسئول        |
| ------------------- | ---------- | ------------ |
| ایجاد نشست جدید     | A-0        | سیستم        |
| فعال‌سازی نشست      | A-1        | مالک نشست    |
| افزودن مشارکت‌کننده | A-1        | مالک نشست    |
| تعلیق نشست          | A-2        | مالک نشست    |
| تغییر سیاست نشست    | A-3        | افسر حکمرانی |
| خاتمه پیش از موعد   | A-3        | افسر حکمرانی |
| استثنای مرز نشست    | A-4        | معمار سیستم  |
| هماهنگی بین نشست‌ها | A-4        | هماهنگ‌ساز   |

---

## ۱۹. Session Taxonomy

### ابعاد تاکسونومی نشست

| بعد             | توضیح          | مقادیر ممکن                                                                   |
| --------------- | -------------- | ----------------------------------------------------------------------------- |
| **Identity**    | نوع هویت نشست  | persistent, transient, anonymous, federated                                   |
| **Ownership**   | نوع مالکیت     | system, user, agent, workflow, organization                                   |
| **Visibility**  | سطح دید نشست   | private, protected, shared, public                                            |
| **Lifetime**    | طول عمر نشست   | transient, short-lived, medium-lived, long-lived, permanent                   |
| **Persistence** | نحوه ماندگاری  | volatile, persistent, snapshot-only, archived                                 |
| **Isolation**   | سطح ایزولاسیون | full, schema, boundary, none                                                  |
| **Sensitivity** | سطح حساسیت     | public, internal, confidential, restricted, critical                          |
| **Scope**       | محدوده نشست    | execution, user, agent, knowledge, workflow, collaborative, system, composite |

### قواعد طبقه‌بندی

| قاعده                                                     | توضیح |
| --------------------------------------------------------- | ----- |
| هر نشست باید در تمام ابعاد طبقه‌بندی شود                  |
| بعد Scope تعیین‌کننده مدل نشست (RSM-01..08) است           |
| بعد Lifetime بر طول عمر نشست تأثیر می‌گذارد               |
| بعد Visibility سطح دسترسی به نشست را مشخص می‌کند          |
| بعد Sensitivity قواعد حکمرانی را تعیین می‌کند             |
| بعد Persistence نحوه ذخیره‌سازی وضعیت نشست را مشخص می‌کند |

---

## ۲۰. Session Identity Model

مدل هویت نشست نحوه شناسایی و انتساب هویت به نشست‌ها را مشخص می‌کند:

### اجزای هویت نشست

| جزء                    | توضیح                 | منبع          |
| ---------------------- | --------------------- | ------------- |
| **Session ID**         | شناسه یکتای نشست      | سیستم         |
| **Owner ID**           | شناسه مالک نشست       | درخواست ایجاد |
| **Creator ID**         | شناسه تولیدکننده نشست | درخواست ایجاد |
| **Session Type**       | نوع نشست              | تعریف مدل     |
| **Creation Timestamp** | زمان ایجاد نشست       | سیستم         |

### قواعد هویت

| قاعده                                            | توضیح |
| ------------------------------------------------ | ----- |
| هر نشست باید دارای Session ID یکتا باشد          |
| Session ID پس از ایجاد قابل تغییر نیست           |
| هر نشست باید دارای Owner ID مشخص باشد            |
| Owner ID می‌تواند در طول عمر نشست تغییر کند      |
| هویت نشست باید در تمام طول عمر قابل استعلام باشد |

---

## ۲۱. Session Lifecycle Model

مدل چرخه حیات نشست نحوه ایجاد، فعال‌سازی، نگهداری و خاتمه نشست را مشخص می‌کند:

### فازهای چرخه حیات

| فاز                   | مراحل شامل       | توضیح                       |
| --------------------- | ---------------- | --------------------------- |
| **Creation Phase**    | RSST-01, RSST-02 | ایجاد و مقداردهی اولیه نشست |
| **Activation Phase**  | RSST-03, RSST-04 | پیوست بافت و فعال‌سازی      |
| **Active Phase**      | RSST-05          | نگهداری نشست فعال           |
| **Suspension Phase**  | RSST-06          | تعلیق موقت نشست             |
| **Termination Phase** | RSST-07, RSST-08 | خاتمه و بایگانی نشست        |

### قواعد چرخه حیات

| قاعده                                               | توضیح |
| --------------------------------------------------- | ----- |
| نشست فقط از طریق Create وارد چرخه حیات می‌شود       |
| نشست فقط از طریق Terminate از چرخه حیات خارج می‌شود |
| نشست نمی‌تواند به فاز قبلی بازگردد                  |
| هر فاز دارای حداقل و حداکثر مدت زمان است            |
| خطا در هر فاز باید به خاتمه امن نشست منجر شود       |

---

## ۲۲. Session Context Attachment Model

مدل پیوست بافت نشست نحوه اتصال بافت (Context) به نشست را مشخص می‌کند:

### انواع پیوست بافت

| نوع                      | توضیح                                |
| ------------------------ | ------------------------------------ |
| **Direct Attachment**    | بافت مستقیماً به نشست متصل می‌شود    |
| **Reference Attachment** | نشست به بافت موجود ارجاع می‌دهد      |
| **Derived Attachment**   | بافت از نشست مادر به ارث برده می‌شود |
| **Dynamic Attachment**   | بافت در طول عمر نشست تغییر می‌کند    |

### قواعد پیوست بافت

| قاعده                                       | توضیح |
| ------------------------------------------- | ----- |
| هر نشست باید حداقل یک بافت داشته باشد       |
| بافت نشست باید با شمای مدل نشست سازگار باشد |
| بافت پیوسته فقط در مرز نشست معتبر است       |
| تغییر بافت نشست باید در شجره ثبت شود        |
| بافت نشست با خاتمه نشست منقضی می‌شود        |

---

## ۲۳. Session Isolation Model

مدل ایزولاسیون نشست نحوه جداسازی نشست‌های مختلف از یکدیگر را مشخص می‌کند:

### سطوح ایزولاسیون

| سطح                    | توضیح                                          |
| ---------------------- | ---------------------------------------------- |
| **Full Isolation**     | ایزولاسیون کامل — نشست‌ها کاملاً جدا از یکدیگر |
| **Context Isolation**  | ایزولاسیون بافت — بافت نشست‌ها مجزا            |
| **Boundary Isolation** | ایزولاسیون مرزی — مرزهای مشخص با اشتراک محدود  |
| **No Isolation**       | بدون ایزولاسیون — نشست‌ها کاملاً اشتراکی       |

### قواعد ایزولاسیون

| قاعده                                                         | توضیح |
| ------------------------------------------------------------- | ----- |
| نشست‌های مختلف نباید در وضعیت یکدیگر تداخل داشته باشند        |
| نشست‌های ایزوله نمی‌توانند به وضعیت یکدیگر دسترسی داشته باشند |
| نشست اشتراکی فقط در سطح مرز مجاز ایزوله می‌شود                |
| نقض ایزولاسیون باید در شجره نشست ثبت شود                      |
| ایزولاسیون نشست پس از فعال‌سازی قابل تغییر نیست               |

---

## ۲۴. Session Evolution Model

مدل تکامل نشست نحوه تغییر و به‌روزرسانی نشست در طول زمان را مشخص می‌کند:

### ابعاد تکامل

| بعد                   | توضیح                                     |
| --------------------- | ----------------------------------------- |
| **State Evolution**   | تکامل وضعیت — تغییر در وضعیت نشست         |
| **Context Evolution** | تکامل بافت — تغییر در بافت نشست           |
| **Scope Evolution**   | تکامل محدوده — تغییر در مرز نشست          |
| **Policy Evolution**  | تکامل سیاست — تغییر در قواعد حاکم بر نشست |

### قواعد تکامل

| قاعده                                              | توضیح |
| -------------------------------------------------- | ----- |
| تکامل وضعیت باید از طریق انتقال‌های مجاز انجام شود |
| تکامل بافت باید در شجره نشست ثبت شود               |
| تکامل محدوده نیاز به تأیید حکمرانی دارد            |
| تکامل سیاست باید برای همه مشارکت‌کنندگان اعلام شود |
| هویت نشست در طول تکامل تغییر نمی‌کند               |

---

## ۲۵. Session Metrics

۱۵ معیار اصلی ارزیابی نشست:

| ID        | معیار                      | توضیح                            | واحد       |
| --------- | -------------------------- | -------------------------------- | ---------- |
| RSMTR-001 | Session Creation Rate      | نرخ ایجاد نشست در واحد زمان      | عدد/ثانیه  |
| RSMTR-002 | Session Activation Time    | میانگین زمان از Create تا Active | میلی‌ثانیه |
| RSMTR-003 | Session Lifetime           | میانگین طول عمر نشست             | ثانیه      |
| RSMTR-004 | Active Session Count       | تعداد نشست‌های فعال همزمان       | عدد        |
| RSMTR-005 | Suspension Rate            | درصد نشست‌های تعلیق‌شده به کل    | درصد       |
| RSMTR-006 | Successful Completion Rate | درصد نشست‌های خاتمه‌یافته موفق   | درصد       |
| RSMTR-007 | Session Error Rate         | درصد نشست‌های دارای خطا          | درصد       |
| RSMTR-008 | Average Participant Count  | میانگین مشارکت‌کنندگان هر نشست   | عدد        |
| RSMTR-009 | Context Attachment Time    | میانگین زمان پیوست بافت          | میلی‌ثانیه |
| RSMTR-010 | Session Expiry Rate        | درصد نشست‌های منقضی به کل        | درصد       |
| RSMTR-011 | Archival Rate              | درصد نشست‌های بایگانی‌شده        | درصد       |
| RSMTR-012 | Lineage Depth              | عمق متوسط شجره نشست              | سطح        |
| RSMTR-013 | Coordination Count         | میانگین تعداد هماهنگی هر نشست    | عدد        |
| RSMTR-014 | Governance Compliance      | درصد انطباق نشست با حکمرانی      | درصد       |
| RSMTR-015 | Session Recovery Time      | میانگین زمان بازیابی نشست        | میلی‌ثانیه |

---

## ۲۶. Glossary

### واژه‌نامه تخصصی نشست

| اصطلاح                   | توضیح                                                 |
| ------------------------ | ----------------------------------------------------- |
| **Session**              | موجودیت مرزی یک تعامل زمان اجرا با هویت و وضعیت مستقل |
| **Session Identity**     | شناسه یکتای غیرقابل تغییر نشست                        |
| **Session Lifecycle**    | چرخه حیات نشست از ایجاد تا خاتمه                      |
| **Session Context**      | بافت داده‌ها و شرایط مرتبط با نشست                    |
| **Session Ownership**    | انتساب مسئولیت نشست به یک موجودیت                     |
| **Session Isolation**    | جداسازی منطقی نشست‌ها از یکدیگر                       |
| **Session Coordination** | هماهنگی و مدیریت وابستگی بین نشست‌ها                  |
| **Session Governance**   | مجموعه سیاست‌ها و قواعد حاکم بر نشست                  |
| **Session Evolution**    | تغییر و به‌روزرسانی نشست در طول زمان                  |
| **Session Lineage**      | مسیر کامل تکامل نشست از ایجاد تا خاتمه                |
| **Session Boundary**     | محدوده مجاز فعالیت و دسترسی نشست                      |
| **Session Expiry**       | پایان اعتبار نشست بر اساس محدودیت زمانی               |

---

## ۲۷. Machine Readable JSON Blocks

### Block 1 — Session Concepts

```json
{
  "$schema": "RT-004-concept-registry",
  "session_concepts": [
    { "id": "RSC-001", "name": "Session", "domain": "RSD-02" },
    { "id": "RSC-002", "name": "Session Identity", "domain": "RSD-01" },
    { "id": "RSC-003", "name": "Session Owner", "domain": "RSD-04" },
    { "id": "RSC-004", "name": "Session Creator", "domain": "RSD-04" },
    { "id": "RSC-005", "name": "Session Participant", "domain": "RSD-04" },
    { "id": "RSC-006", "name": "Session State", "domain": "RSD-02" },
    { "id": "RSC-007", "name": "Session Stage", "domain": "RSD-02" },
    { "id": "RSC-008", "name": "Session Context", "domain": "RSD-03" },
    { "id": "RSC-009", "name": "Session Policy", "domain": "RSD-07" },
    { "id": "RSC-010", "name": "Session Boundary", "domain": "RSD-05" },
    { "id": "RSC-011", "name": "Session Isolation", "domain": "RSD-05" },
    { "id": "RSC-012", "name": "Session Coordination", "domain": "RSD-06" },
    { "id": "RSC-013", "name": "Session Dependency", "domain": "RSD-06" },
    { "id": "RSC-014", "name": "Session Lineage", "domain": "RSD-07" },
    { "id": "RSC-015", "name": "Session Audit", "domain": "RSD-07" },
    { "id": "RSC-016", "name": "Session Lifetime", "domain": "RSD-02" },
    { "id": "RSC-017", "name": "Session Expiry", "domain": "RSD-02" },
    { "id": "RSC-018", "name": "Session Evolution", "domain": "RSD-08" },
    { "id": "RSC-019", "name": "Session Migration", "domain": "RSD-08" },
    { "id": "RSC-020", "name": "Session Termination", "domain": "RSD-02" }
  ]
}
```

### Block 2 — Session Entities

```json
{
  "$schema": "RT-004-entity-registry",
  "session_entities": [
    { "id": "RSE-001", "name": "SessionRecord", "domain": "RSD-02", "type": "Core" },
    { "id": "RSE-002", "name": "SessionIdentity", "domain": "RSD-01", "type": "Core" },
    { "id": "RSE-003", "name": "SessionOwner", "domain": "RSD-04", "type": "Core" },
    { "id": "RSE-004", "name": "SessionParticipant", "domain": "RSD-04", "type": "Operational" },
    { "id": "RSE-005", "name": "SessionState", "domain": "RSD-02", "type": "Core" },
    { "id": "RSE-006", "name": "SessionStage", "domain": "RSD-02", "type": "Operational" },
    { "id": "RSE-007", "name": "SessionContext", "domain": "RSD-03", "type": "Operational" },
    { "id": "RSE-008", "name": "SessionBoundary", "domain": "RSD-05", "type": "Governance" },
    { "id": "RSE-009", "name": "SessionPolicy", "domain": "RSD-07", "type": "Governance" },
    { "id": "RSE-010", "name": "SessionLineage", "domain": "RSD-07", "type": "Audit" },
    { "id": "RSE-011", "name": "SessionDependency", "domain": "RSD-06", "type": "Operational" },
    { "id": "RSE-012", "name": "SessionCoordination", "domain": "RSD-06", "type": "Operational" }
  ]
}
```

### Block 3 — Session Capabilities

```json
{
  "$schema": "RT-004-capability-registry",
  "session_capabilities": [
    { "id": "RSCAP-001", "name": "Session Creation", "domain": "RSD-02" },
    { "id": "RSCAP-002", "name": "Identity Assignment", "domain": "RSD-01" },
    { "id": "RSCAP-003", "name": "Owner Assignment", "domain": "RSD-04" },
    { "id": "RSCAP-004", "name": "State Management", "domain": "RSD-02" },
    { "id": "RSCAP-005", "name": "Context Attachment", "domain": "RSD-03" },
    { "id": "RSCAP-006", "name": "Participant Registration", "domain": "RSD-04" },
    { "id": "RSCAP-007", "name": "Boundary Enforcement", "domain": "RSD-05" },
    { "id": "RSCAP-008", "name": "Isolation Provisioning", "domain": "RSD-05" },
    { "id": "RSCAP-009", "name": "Session Coordination", "domain": "RSD-06" },
    { "id": "RSCAP-010", "name": "Dependency Management", "domain": "RSD-06" },
    { "id": "RSCAP-011", "name": "Governance Enforcement", "domain": "RSD-07" },
    { "id": "RSCAP-012", "name": "Audit Logging", "domain": "RSD-07" },
    { "id": "RSCAP-013", "name": "Expiry Management", "domain": "RSD-02" },
    { "id": "RSCAP-014", "name": "Evolution Tracking", "domain": "RSD-08" }
  ]
}
```

### Block 4 — Session Functions

```json
{
  "$schema": "RT-004-function-registry",
  "session_functions": [
    { "id": "RSF-01", "name": "Create Session", "capability": "RSCAP-001", "domain": "RSD-02" },
    { "id": "RSF-02", "name": "Assign Identity", "capability": "RSCAP-002", "domain": "RSD-01" },
    { "id": "RSF-03", "name": "Assign Owner", "capability": "RSCAP-003", "domain": "RSD-04" },
    { "id": "RSF-04", "name": "Manage State", "capability": "RSCAP-004", "domain": "RSD-02" },
    { "id": "RSF-05", "name": "Attach Context", "capability": "RSCAP-005", "domain": "RSD-03" },
    {
      "id": "RSF-06",
      "name": "Register Participant",
      "capability": "RSCAP-006",
      "domain": "RSD-04"
    },
    { "id": "RSF-07", "name": "Enforce Boundary", "capability": "RSCAP-007", "domain": "RSD-05" },
    {
      "id": "RSF-08",
      "name": "Provision Isolation",
      "capability": "RSCAP-008",
      "domain": "RSD-05"
    },
    {
      "id": "RSF-09",
      "name": "Coordinate Sessions",
      "capability": "RSCAP-009",
      "domain": "RSD-06"
    },
    { "id": "RSF-10", "name": "Manage Dependency", "capability": "RSCAP-010", "domain": "RSD-06" },
    { "id": "RSF-11", "name": "Enforce Governance", "capability": "RSCAP-011", "domain": "RSD-07" },
    { "id": "RSF-12", "name": "Log Audit", "capability": "RSCAP-012", "domain": "RSD-07" },
    { "id": "RSF-13", "name": "Manage Expiry", "capability": "RSCAP-013", "domain": "RSD-02" },
    { "id": "RSF-14", "name": "Track Evolution", "capability": "RSCAP-014", "domain": "RSD-08" }
  ]
}
```

### Block 5 — Session Stages

```json
{
  "$schema": "RT-004-stage-registry",
  "session_stages": [
    {
      "id": "RSST-01",
      "name": "Create",
      "input": "SessionRequest",
      "output": "CreatedSession",
      "domain": "RSD-02"
    },
    {
      "id": "RSST-02",
      "name": "Initialize",
      "input": "CreatedSession",
      "output": "InitializedSession",
      "domain": "RSD-02"
    },
    {
      "id": "RSST-03",
      "name": "Attach Context",
      "input": "InitializedSession",
      "output": "ContextAttachedSession",
      "domain": "RSD-03"
    },
    {
      "id": "RSST-04",
      "name": "Activate",
      "input": "ContextAttachedSession",
      "output": "ActiveSession",
      "domain": "RSD-02"
    },
    {
      "id": "RSST-05",
      "name": "Maintain",
      "input": "ActiveSession",
      "output": "MaintainedSession",
      "domain": "RSD-06"
    },
    {
      "id": "RSST-06",
      "name": "Suspend",
      "input": "ActiveSession",
      "output": "SuspendedSession",
      "domain": "RSD-02"
    },
    {
      "id": "RSST-07",
      "name": "Close",
      "input": "ActiveSession",
      "output": "ClosedSession",
      "domain": "RSD-02"
    },
    {
      "id": "RSST-08",
      "name": "Archive",
      "input": "ClosedSession",
      "output": "ArchivedSession",
      "domain": "RSD-02"
    }
  ],
  "total_stages": 8
}
```

### Block 6 — Session Models

```json
{
  "$schema": "RT-004-model-registry",
  "session_models": [
    {
      "id": "RSM-01",
      "name": "Execution Session",
      "domain": "RSD-02",
      "input": "ExecutionRequest",
      "output": "ExecutionEnvironment",
      "consumers": ["AI-003", "AI-006", "AI-008"]
    },
    {
      "id": "RSM-02",
      "name": "User Session",
      "domain": "RSD-04",
      "input": "UserIdentity",
      "output": "UserInteraction",
      "consumers": ["AI-009", "AI-010"]
    },
    {
      "id": "RSM-03",
      "name": "Agent Session",
      "domain": "RSD-04",
      "input": "AgentRequest",
      "output": "AgentEnvironment",
      "consumers": ["AI-001", "AI-002", "AI-014"]
    },
    {
      "id": "RSM-04",
      "name": "Knowledge Session",
      "domain": "RSD-03",
      "input": "KnowledgeQuery",
      "output": "KnowledgeResult",
      "consumers": ["AI-011", "AI-013"]
    },
    {
      "id": "RSM-05",
      "name": "Workflow Session",
      "domain": "RSD-06",
      "input": "WorkflowRequest",
      "output": "WorkflowExecution",
      "consumers": ["AI-008", "AI-014"]
    },
    {
      "id": "RSM-06",
      "name": "Collaborative Session",
      "domain": "RSD-06",
      "input": "CollaborationRequest",
      "output": "CollaborativeEnvironment",
      "consumers": ["AI-009", "AI-014"]
    },
    {
      "id": "RSM-07",
      "name": "System Session",
      "domain": "RSD-04",
      "input": "SystemRequest",
      "output": "SystemOperation",
      "consumers": ["AI-014"]
    },
    {
      "id": "RSM-08",
      "name": "Composite Session",
      "domain": "RSD-08",
      "input": "MultipleSessions",
      "output": "ComposedSession",
      "consumers": ["AI-014"]
    }
  ],
  "total_models": 8
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Session Record Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-004-session-record",
  "title": "Session Record Schema",
  "description": "Schema for a session record in the Enterprise Runtime Session Architecture",
  "type": "object",
  "properties": {
    "session_id": {
      "type": "string",
      "description": "شناسه یکتای نشست",
      "pattern": "^RSE-[0-9]{12}-[A-Z0-9]{8}$"
    },
    "session_domain": {
      "type": "string",
      "description": "دامنه نشست",
      "enum": ["RSD-01", "RSD-02", "RSD-03", "RSD-04", "RSD-05", "RSD-06", "RSD-07", "RSD-08"]
    },
    "status": {
      "type": "string",
      "description": "وضعیت نشست",
      "enum": [
        "created",
        "initialized",
        "active",
        "suspended",
        "waiting",
        "resumed",
        "closed",
        "archived"
      ]
    },
    "session_type": {
      "type": "string",
      "description": "نوع نشست",
      "enum": [
        "execution",
        "user",
        "agent",
        "knowledge",
        "workflow",
        "collaborative",
        "system",
        "composite"
      ]
    },
    "owner": {
      "type": "string",
      "description": "مالک نشست",
      "pattern": "^OWN-[A-Z0-9]{8}$"
    },
    "creator": {
      "type": "string",
      "description": "تولیدکننده نشست",
      "pattern": "^CRT-[A-Z0-9]{8}$"
    },
    "participants": {
      "type": "array",
      "description": "مشارکت‌کنندگان نشست",
      "items": {
        "type": "object",
        "properties": {
          "participant_id": { "type": "string" },
          "participant_type": { "type": "string", "enum": ["user", "agent", "workflow", "system"] },
          "joined_at": { "type": "string", "format": "date-time" }
        }
      }
    },
    "context": {
      "type": "object",
      "description": "بافت نشست",
      "properties": {
        "context_id": { "type": "string" },
        "context_type": {
          "type": "string",
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
        "scope": { "type": "string" },
        "visibility": { "type": "string", "enum": ["private", "protected", "shared", "public"] },
        "sensitivity": {
          "type": "string",
          "enum": ["public", "internal", "confidential", "restricted", "critical"]
        }
      }
    },
    "boundary": {
      "type": "object",
      "description": "مرز نشست",
      "properties": {
        "allowed_participants": { "type": "array", "items": { "type": "string" } },
        "max_scope": { "type": "string" },
        "isolated": { "type": "boolean" }
      }
    },
    "lifetime": {
      "type": "object",
      "description": "طول عمر نشست",
      "properties": {
        "created_at": { "type": "string", "format": "date-time" },
        "activated_at": { "type": "string", "format": "date-time" },
        "expires_at": { "type": "string", "format": "date-time" },
        "closed_at": { "type": "string", "format": "date-time" }
      }
    }
  },
  "required": ["session_id", "session_domain", "status", "session_type", "owner", "context"]
}
```

### Schema 2 — Session Transition Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-004-session-transition",
  "title": "Session State Transition Schema",
  "description": "Schema for a state transition in the Enterprise Runtime Session Architecture",
  "type": "object",
  "properties": {
    "transition_id": {
      "type": "string",
      "description": "شناسه یکتای انتقال"
    },
    "session_id": {
      "type": "string",
      "description": "شناسه نشست"
    },
    "from_state": {
      "type": "string",
      "description": "حالت مبدأ",
      "enum": ["RSS-01", "RSS-02", "RSS-03", "RSS-04", "RSS-05", "RSS-06", "RSS-07", "RSS-08"]
    },
    "to_state": {
      "type": "string",
      "description": "حالت مقصد",
      "enum": ["RSS-01", "RSS-02", "RSS-03", "RSS-04", "RSS-05", "RSS-06", "RSS-07", "RSS-08"]
    },
    "condition": {
      "type": "string",
      "description": "شرط انتقال"
    },
    "triggered_by": {
      "type": "string",
      "description": "علت انتقال",
      "enum": ["system", "owner", "participant", "scheduler", "policy", "error", "expiry"]
    },
    "stage": {
      "type": "string",
      "description": "مرحله مرتبط",
      "enum": [
        "create",
        "initialize",
        "attach_context",
        "activate",
        "maintain",
        "suspend",
        "close",
        "archive"
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
        "participant_count": {
          "type": "integer",
          "description": "تعداد مشارکت‌کنندگان هنگام انتقال"
        }
      }
    }
  },
  "required": ["transition_id", "session_id", "from_state", "to_state", "condition", "triggered_by"]
}
```

### Schema 3 — Session Coordination Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-004-session-coordination",
  "title": "Session Coordination Schema",
  "description": "Schema for session coordination in the Enterprise Runtime Session Architecture",
  "type": "object",
  "properties": {
    "coordination_id": {
      "type": "string",
      "description": "شناسه یکتای هماهنگی"
    },
    "primary_session": {
      "type": "string",
      "description": "نشست اصلی"
    },
    "coordination_type": {
      "type": "string",
      "description": "نوع هماهنگی",
      "enum": ["sequential", "parallel", "dependency", "synchronization", "federation"]
    },
    "related_sessions": {
      "type": "array",
      "description": "نشست‌های مرتبط",
      "items": {
        "type": "object",
        "properties": {
          "session_id": { "type": "string" },
          "relationship_type": {
            "type": "string",
            "enum": ["depends_on", "coordinates_with", "parent_of", "child_of"]
          },
          "state": {
            "type": "string",
            "enum": [
              "created",
              "initialized",
              "active",
              "suspended",
              "waiting",
              "resumed",
              "closed",
              "archived"
            ]
          }
        }
      }
    },
    "dependencies": {
      "type": "array",
      "description": "وابستگی‌های نشست",
      "items": {
        "type": "object",
        "properties": {
          "dependent_session_id": { "type": "string" },
          "dependency_type": {
            "type": "string",
            "enum": ["requires", "blocks", "triggers", "terminates"]
          },
          "satisfied": { "type": "boolean" }
        }
      }
    },
    "isolation_level": {
      "type": "string",
      "description": "سطح ایزولاسیون",
      "enum": ["full", "context", "boundary", "none"]
    },
    "created_at": {
      "type": "string",
      "description": "زمان ایجاد هماهنگی",
      "format": "date-time"
    }
  },
  "required": ["coordination_id", "primary_session", "coordination_type", "related_sessions"]
}
```

---

## ۲۹. Session Quality Gates

۷ گیت کیفیت نشست:

| ID      | گیت                              | مرحله   | معیار عبور                                                   |
| ------- | -------------------------------- | ------- | ------------------------------------------------------------ |
| RSQG-01 | **Creation Validation**          | RSST-01 | نشست با هویت یکتا، مالک مشخص و نوع معتبر ایجاد شده است       |
| RSQG-02 | **Initialization Completeness**  | RSST-02 | نشست مقداردهی کامل شده و آماده دریافت بافت است               |
| RSQG-03 | **Context Attachment Integrity** | RSST-03 | بافت معتبر با شمای سازگار به نشست پیوسته است                 |
| RSQG-04 | **Activation Readiness**         | RSST-04 | نشست فعال، مرز مشخص و مشارکت‌کنندگان ثبت شده‌اند             |
| RSQG-05 | **Maintenance Stability**        | RSST-05 | نشست بدون خطا در حال اجرا و هماهنگی با وابستگی‌ها برقرار است |
| RSQG-06 | **Suspension Safety**            | RSST-06 | نشست به طور امن معلق و قابل بازگشایی است                     |
| RSQG-07 | **Closure Completeness**         | RSST-07 | نشست به طور کامل خاتمه یافته و شجره و حسابرسی ثبت شده است    |

---

## ۳۰. Cross-Domain Session Mapping

### نگاشت بین دامنه‌های نشست

| دامنه مبدأ            | دامنه مقصد          | نوع نگاشت  | توضیح                                       |
| --------------------- | ------------------- | ---------- | ------------------------------------------- |
| RSD-01 (Identity)     | RSD-02 (Lifecycle)  | Direct     | هویت در طول چرخه حیات معتبر است             |
| RSD-02 (Lifecycle)    | RSD-03 (Context)    | Direct     | نشست فعال نیاز به بافت دارد                 |
| RSD-02 (Lifecycle)    | RSD-04 (Ownership)  | Direct     | چرخه حیات تحت مالکیت است                    |
| RSD-03 (Context)      | RSD-02 (Lifecycle)  | Contextual | بافت بر چرخه حیات تأثیر می‌گذارد            |
| RSD-04 (Ownership)    | RSD-07 (Governance) | Direct     | مالکیت توسط حکمرانی اعمال می‌شود            |
| RSD-05 (Isolation)    | RSD-07 (Governance) | Direct     | ایزولاسیون توسط حکمرانی اعمال می‌شود        |
| RSD-06 (Coordination) | RSD-04 (Ownership)  | Composite  | هماهنگی بین نشست‌ها نیاز به رضایت مالک دارد |
| RSD-06 (Coordination) | RSD-07 (Governance) | Direct     | هماهنگی توسط حکمرانی محدود می‌شود           |
| RSD-07 (Governance)   | RSD-01..RSD-08      | Universal  | حکمرانی بر همه دامنه‌های نشست اعمال می‌شود  |
| RSD-08 (Evolution)    | RSD-01 (Identity)   | Composite  | تکامل هرگز هویت نشست را تغییر نمی‌دهد       |

### نگاشت به RT-001، RT-002 و RT-003

| RT-۰۰۱/۰۰۲/۰۰۳              | RT-004 (اختصاصی نشست)       | نوع نگاشت                                                 |
| --------------------------- | --------------------------- | --------------------------------------------------------- |
| RTD-02 (Context & Session)  | RSD-01..RSD-08              | تخصصی‌سازی — دامنه نشست RTD-02 به ۸ دامنه تخصصی تبدیل شده |
| RTE-004 (Session)           | RSE-001 (SessionRecord)     | تخصصی‌سازی — Session به Record تبدیل شده                  |
| RTS-03..08 (Runtime States) | RSS-01..08 (Session States) | تکامل — دو مدل وضعیت مکمل                                 |
| RCC-004 (Runtime Session)   | RSC-001 (Session)           | تخصصی‌سازی                                                |
| RCM-02 (Session Context)    | RSM-02 (User Session)       | ارتباط — مدل بافت نشست با مدل نشست کاربر مرتبط است        |
| RTC-004 (Runtime Session)   | RSM-01..RSM-08              | تخصصی‌سازی — یک مفهوم نشست به ۸ مدل نشست گسترش یافته      |
| RTF-04 (Manage Session)     | RSF-01..14                  | گسترش — یک کارکرد به ۱۴ کارکرد تخصصی                      |
| RCS-04 (Active Context)     | RSS-03 (Active Session)     | ارتباط — بافت فعال در نشست فعال معتبر است                 |

---

> **پایان RT-004 — Enterprise Runtime Session Architecture**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۱۰
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**
