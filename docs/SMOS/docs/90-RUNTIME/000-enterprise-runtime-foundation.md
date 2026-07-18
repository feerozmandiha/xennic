# RT-001 — Enterprise Runtime Foundation

> **بنیان زمان اجرای سازمانی SMOS**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۰۹
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**

---

## ۱. Purpose

RT-001 معماری بنیادین زمان اجرای سازمانی SMOS را تعریف می‌کند. Runtime (زمان اجرا) لایه‌ای از سیستم است که در آن تمام عملیات سازمانی — از اجرای وظایف و گردش کارها تا مدیریت نشست‌ها و هماهنگی عامل‌های هوشمند — صورت می‌پذیرد. این سند چیستی Runtime را از نظر مفهومی و ساختاری تعریف می‌کند — نه نحوه اجرای فنی آن.

**SSOT**: تنها منبع معتبر برای معماری بنیادین زمان اجرای سازمانی SMOS.

---

## ۲. Scope

این سند محدوده زیر را پوشش می‌دهد:

- تعریف اصول و فلسفه زمان اجرا
- مدل لایه‌ای معماری زمان اجرا
- دامنه‌ها، مفاهیم و موجودیت‌های زمان اجرا
- قابلیت‌ها و کارکردهای زمان اجرا
- مدل مرحله‌ای، مدل وضعیت و مدل‌های زمان اجرا
- روابط، یکپارچگی و سازگاری زمان اجرا
- حکمرانی، معیارها، محدودیت‌ها و گیت‌های کیفیت
- ۶ بلوک Machine Readable JSON
- ۳ JSON Schema (Draft-07)

**خارج از محدوده**:

- پیاده‌سازی فنی زمان اجرا
- الگوریتم‌های زمان‌بندی یا هماهنگی
- موتور گردش کار یا موتور اجرا
- APIها، پروتکل‌ها یا زبان‌های خاص
- Workflow یا اتوماسیون
- پایگاه داده یا Vendor خاص
- هرگونه پیاده‌سازی اجرایی یا زمان اجرا
- دیاگرام، نمودار یا نمایش بصری
- پرامپت یا دستورالعمل‌های Agent

---

## ۳. Runtime Principles

زمان اجرای SMOS بر ۸ اصل زیر استوار است:

| ID     | اصل                          | توضیح                                                 |
| ------ | ---------------------------- | ----------------------------------------------------- |
| RTP-01 | **Isolation**                | هر نمونه اجرا باید از سایر نمونه‌ها ایزوله باشد       |
| RTP-02 | **Determinism**              | ورودی یکسان باید خروجی یکسان تولید کند                |
| RTP-03 | **Observability**            | تمام عملیات زمان اجرا باید قابل مشاهده و ردیابی باشند |
| RTP-04 | **Resilience**               | زمان اجرا باید در برابر خطاها مقاوم و خودبازیاب باشد  |
| RTP-05 | **Boundary Respect**         | هر اجرا باید در مرز تعریف‌شده خود باقی بماند          |
| RTP-06 | **Owner Accountability**     | هر نمونه اجرا باید دارای مالک مشخص باشد               |
| RTP-07 | **Identity First**           | هر موجودیت زمان اجرا باید دارای هویت یکتا باشد        |
| RTP-08 | **Consistency Preservation** | زمان اجرا نباید سازگاری حالت سیستم را نقض کند         |

---

## ۴. Runtime Philosophy

زمان اجرای SMOS بر اساس فلسفه "اجرای امن در مرزهای تعریف‌شده" (Safe Execution Within Defined Boundaries) طراحی شده است. در یک سیستم سازمانی، عملیات متعدد به صورت همزمان و توزیع‌شده اجرا می‌شوند. Runtime چارچوبی را فراهم می‌کند که این عملیات در آن به صورت ایزوله، قابل ردیابی و قابل مدیریت انجام شوند.

زمان اجرای SMOS:

- **ایزوله است** — هر نمونه اجرا مرزهای مشخصی دارد
- **مشاهده‌پذیر است** — تمام عملیات قابل ردیابی و حسابرسی هستند
- **مقاوم است** — خطاها را مدیریت کرده و خود را بازیابی می‌کند
- **مبتنی بر هویت است** — هر موجودیت دارای هویت یکتا است
- **مبتنی بر مالکیت است** — هر اجرا دارای مالک و مسئول است
- **سازگار است** — حالت سیستم را در تمام مراحل حفظ می‌کند

---

## ۵. Architecture — Layered Model

معماری زمان اجرای SMOS در ۵ لایه تعریف می‌شود:

| لایه      | نام                    | توضیح                                            |
| --------- | ---------------------- | ------------------------------------------------ |
| LYR-RT-01 | **Execution Layer**    | لایه اجرا — مدیریت اجرای وظایف و عملیات          |
| LYR-RT-02 | **Context Layer**      | لایه بافت — نگهداری و مدیریت بافت اجرا           |
| LYR-RT-03 | **State Layer**        | لایه حالت — مدیریت حالت و حافظه زمان اجرا        |
| LYR-RT-04 | **Coordination Layer** | لایه هماهنگی — هماهنگی بین نمونه‌های اجرا        |
| LYR-RT-05 | **Governance Layer**   | لایه حکمرانی — نظارت، محدودیت و انطباق زمان اجرا |

---

## ۶. Runtime Domains

زمان اجرای SMOS شامل ۸ دامنه اصلی است:

| ID     | نام              | توضیح                          | لایه      |
| ------ | ---------------- | ------------------------------ | --------- |
| RTD-01 | **Execution**    | اجرای وظایف و عملیات سازمانی   | LYR-RT-01 |
| RTD-02 | **Context**      | مدیریت بافت زمان اجرا          | LYR-RT-02 |
| RTD-03 | **Session**      | مدیریت نشست‌های زمان اجرا      | LYR-RT-02 |
| RTD-04 | **State**        | مدیریت حالت زمان اجرا          | LYR-RT-03 |
| RTD-05 | **Coordination** | هماهنگی بین نمونه‌های اجرا     | LYR-RT-04 |
| RTD-06 | **Scheduling**   | زمان‌بندی و تخصیص منابع اجرا   | LYR-RT-04 |
| RTD-07 | **Monitoring**   | نظارت و مشاهده‌پذیری زمان اجرا | LYR-RT-05 |
| RTD-08 | **Recovery**     | بازیابی خطا و تداوم زمان اجرا  | LYR-RT-05 |

---

## ۷. Runtime Concepts

۲۰ مفهوم بنیادین زمان اجرا:

| ID      | مفهوم                    | توضیح                                            |
| ------- | ------------------------ | ------------------------------------------------ |
| RTC-001 | **Runtime**              | لایه اجرای سازمانی — بستر اجرای عملیات           |
| RTC-002 | **Runtime Instance**     | یک نمونه از زمان اجرا — فضای اجرای ایزوله        |
| RTC-003 | **Runtime Context**      | بافت زمان اجرا — شرایط و داده‌های مرتبط با اجرا  |
| RTC-004 | **Runtime Session**      | نشست زمان اجرا — یک توالی از عملیات مرتبط        |
| RTC-005 | **Runtime State**        | حالت زمان اجرا — وضعیت فعلی یک نمونه اجرا        |
| RTC-006 | **Runtime Lifecycle**    | چرخه حیات زمان اجرا — از ایجاد تا خاتمه          |
| RTC-007 | **Runtime Boundary**     | مرز زمان اجرا — محدوده مجاز یک نمونه اجرا        |
| RTC-008 | **Runtime Isolation**    | ایزولاسیون — جداسازی نمونه‌های اجرا از یکدیگر    |
| RTC-009 | **Runtime Identity**     | هویت زمان اجرا — شناسه یکتای هر نمونه            |
| RTC-010 | **Runtime Ownership**    | مالکیت زمان اجرا — مسئول نمونه اجرا              |
| RTC-011 | **Runtime Execution**    | اجرا — انجام یک وظیفه یا عملیات در زمان اجرا     |
| RTC-012 | **Runtime Coordination** | هماهنگی — مدیریت تعامل بین نمونه‌های اجرا        |
| RTC-013 | **Runtime Scheduling**   | زمان‌بندی — تخصیص زمان و منابع به نمونه‌های اجرا |
| RTC-014 | **Runtime Monitoring**   | نظارت — مشاهده و اندازه‌گیری وضعیت زمان اجرا     |
| RTC-015 | **Runtime Recovery**     | بازیابی — بازگشت به حالت پایدار پس از خطا        |
| RTC-016 | **Runtime Traceability** | ردیابی — ثبت و دنبال‌کردن مسیر اجرا              |
| RTC-017 | **Runtime Governance**   | حکمرانی — قواعد و سیاست‌های حاکم بر زمان اجرا    |
| RTC-018 | **Runtime Metric**       | معیار زمان اجرا — شاخص اندازه‌گیری عملکرد        |
| RTC-019 | **Runtime Policy**       | سیاست زمان اجرا — قواعد حاکم بر رفتار زمان اجرا  |
| RTC-020 | **Runtime Contract**     | قرارداد زمان اجرا — توافق بین نمونه و زمان اجرا  |

---

## ۸. Runtime Entities

۱۲ موجودیت اصلی زمان اجرا:

| ID      | موجودیت                | توضیح                                    | دامنه  |
| ------- | ---------------------- | ---------------------------------------- | ------ |
| RTE-001 | **RuntimeEnvironment** | محیط زمان اجرا — بستر کلی اجرا           | RTD-01 |
| RTE-002 | **RuntimeInstance**    | نمونه زمان اجرا — یک فضای اجرای مشخص     | RTD-01 |
| RTE-003 | **RuntimeContext**     | بافت زمان اجرا — داده‌های بافتی یک نمونه | RTD-02 |
| RTE-004 | **RuntimeSession**     | نشست زمان اجرا — توالی عملیات مرتبط      | RTD-03 |
| RTE-005 | **RuntimeState**       | حالت زمان اجرا — وضعیت یک نمونه          | RTD-04 |
| RTE-006 | **RuntimeBoundary**    | مرز زمان اجرا — محدوده مجاز              | RTD-01 |
| RTE-007 | **RuntimeIdentity**    | هویت زمان اجرا — شناسه یکتای نمونه       | RTD-01 |
| RTE-008 | **RuntimeOwner**       | مالک زمان اجرا — مسئول نمونه             | RTD-01 |
| RTE-009 | **ExecutionTask**      | وظیفه اجرایی — واحد کار در زمان اجرا     | RTD-01 |
| RTE-010 | **CoordinationUnit**   | واحد هماهنگی — مدیریت تعامل نمونه‌ها     | RTD-05 |
| RTE-011 | **MonitoringRecord**   | ثبت نظارت — داده‌های مشاهده‌پذیری        | RTD-07 |
| RTE-012 | **RecoveryPlan**       | طرح بازیابی — مسیر بازگشت از خطا         | RTD-08 |

---

## ۹. Runtime Capabilities

۱۴ قابلیت اصلی زمان اجرا:

| ID        | قابلیت                     | توضیح                              | لایه      |
| --------- | -------------------------- | ---------------------------------- | --------- |
| RTCAP-001 | **Instance Provisioning**  | ایجاد و راه‌اندازی نمونه زمان اجرا | LYR-RT-01 |
| RTCAP-002 | **Task Execution**         | اجرای وظایف درون یک نمونه          | LYR-RT-01 |
| RTCAP-003 | **Context Management**     | نگهداری و مدیریت بافت زمان اجرا    | LYR-RT-02 |
| RTCAP-004 | **Session Management**     | مدیریت نشست‌های زمان اجرا          | LYR-RT-02 |
| RTCAP-005 | **State Persistence**      | ماندگاری حالت زمان اجرا            | LYR-RT-03 |
| RTCAP-006 | **State Transition**       | انتقال بین حالت‌های زمان اجرا      | LYR-RT-03 |
| RTCAP-007 | **Instance Coordination**  | هماهنگی بین نمونه‌های زمان اجرا    | LYR-RT-04 |
| RTCAP-008 | **Resource Scheduling**    | زمان‌بندی و تخصیص منابع            | LYR-RT-04 |
| RTCAP-009 | **Boundary Enforcement**   | اعمال مرزهای زمان اجرا             | LYR-RT-04 |
| RTCAP-010 | **Runtime Monitoring**     | نظارت بر نمونه‌های زمان اجرا       | LYR-RT-05 |
| RTCAP-011 | **Health Assessment**      | ارزیابی سلامت زمان اجرا            | LYR-RT-05 |
| RTCAP-012 | **Error Detection**        | شناسایی خطاهای زمان اجرا           | LYR-RT-05 |
| RTCAP-013 | **Recovery Execution**     | اجرای طرح بازیابی                  | LYR-RT-05 |
| RTCAP-014 | **Governance Enforcement** | اعمال قواعد و سیاست‌های زمان اجرا  | LYR-RT-05 |

---

## ۱۰. Runtime Functions

۱۴ کارکرد زمان اجرا:

| ID     | کارکرد               | قابلیت مرتبط | دامنه  |
| ------ | -------------------- | ------------ | ------ |
| RTF-01 | Provision Instance   | RTCAP-001    | RTD-01 |
| RTF-02 | Execute Task         | RTCAP-002    | RTD-01 |
| RTF-03 | Manage Context       | RTCAP-003    | RTD-02 |
| RTF-04 | Manage Session       | RTCAP-004    | RTD-03 |
| RTF-05 | Persist State        | RTCAP-005    | RTD-04 |
| RTF-06 | Transition State     | RTCAP-006    | RTD-04 |
| RTF-07 | Coordinate Instances | RTCAP-007    | RTD-05 |
| RTF-08 | Schedule Resources   | RTCAP-008    | RTD-06 |
| RTF-09 | Enforce Boundary     | RTCAP-009    | RTD-05 |
| RTF-10 | Monitor Runtime      | RTCAP-010    | RTD-07 |
| RTF-11 | Assess Health        | RTCAP-011    | RTD-07 |
| RTF-12 | Detect Error         | RTCAP-012    | RTD-08 |
| RTF-13 | Execute Recovery     | RTCAP-013    | RTD-08 |
| RTF-14 | Enforce Governance   | RTCAP-014    | RTD-07 |

---

## ۱۱. Runtime Taxonomy

تاکسونومی زمان اجرا در سه بعد اصلی طبقه‌بندی می‌شود:

### بعد ۱: نوع نمونه اجرا

| نوع              | توضیح                                           | مثال                  |
| ---------------- | ----------------------------------------------- | --------------------- |
| **Stateless**    | نمونه بدون حالت — هر درخواست مستقل است          | پردازش تراکنش ساده    |
| **Stateful**     | نمونه با حالت — وضعیت بین درخواست‌ها حفظ می‌شود | نشست کاربر            |
| **Long-Running** | نمونه طولانی — اجرای مداوم و پیوسته             | گردش کار انتشار محتوا |
| **Scheduled**    | نمونه زمان‌بندی‌شده — اجرای دوره‌ای             | گزارش هفتگی           |
| **Event-Driven** | نمونه مبتنی بر رویداد — اجرا در پاسخ به رویداد  | واکنش به نظر کاربر    |

### بعد ۲: نوع ایزولاسیون

| نوع                           | توضیح                                |
| ----------------------------- | ------------------------------------ |
| **Process Isolation**         | ایزولاسیون در سطح فرآیند             |
| **Thread Isolation**          | ایزولاسیون در سطح نخ                 |
| **Container Isolation**       | ایزولاسیون در سطح کانتینر            |
| **Virtual Machine Isolation** | ایزولاسیون در سطح ماشین مجازی        |
| **Logical Isolation**         | ایزولاسیون منطقی — مرزهای نرم‌افزاری |

### بعد ۳: سطح اولویت

| سطح          | توضیح                                  |
| ------------ | -------------------------------------- |
| **Critical** | اجرای بحرانی — بالاترین اولویت         |
| **High**     | اولویت بالا — اجرای فوری               |
| **Medium**   | اولویت متوسط — اجرای عادی              |
| **Low**      | اولویت پایین — اجرا در صورت وجود منابع |

---

## ۱۲. Runtime Stage Model

مدل مرحله‌ای زمان اجرا در ۸ مرحله تعریف می‌شود:

| مرحله   | نام                        | توضیح                              | خروجی                |
| ------- | -------------------------- | ---------------------------------- | -------------------- |
| RTST-01 | **Provisioning**           | ایجاد و راه‌اندازی نمونه زمان اجرا | Provisioned Instance |
| RTST-02 | **Context Initialization** | راه‌اندازی بافت زمان اجرا          | Initialized Context  |
| RTST-03 | **Resource Allocation**    | تخصیص منابع به نمونه               | Allocated Resources  |
| RTST-04 | **Execution**              | اجرای وظایف درون نمونه             | Execution Results    |
| RTST-05 | **Coordination**           | هماهنگی با سایر نمونه‌ها           | Coordinated State    |
| RTST-06 | **Monitoring**             | نظارت بر اجرا و جمع‌آوری معیارها   | Monitoring Data      |
| RTST-07 | **Completion**             | تکمیل اجرا و آزادسازی منابع        | Completed Instance   |
| RTST-08 | **Audit**                  | ثبت و حسابرسی مسیر اجرا            | Audit Trail          |

---

## ۱۳. Runtime State Model

مدل وضعیت زمان اجرا با ۸ وضعیت و ۱۸ انتقال مجاز:

### وضعیت‌ها

| ID     | وضعیت           | توضیح                                |
| ------ | --------------- | ------------------------------------ |
| RTS-01 | **Initialized** | نمونه ایجاد شده اما آماده اجرا نیست  |
| RTS-02 | **Prepared**    | نمونه آماده اجرا — منابع تخصیص یافته |
| RTS-03 | **Ready**       | نمونه آماده پذیرش وظایف              |
| RTS-04 | **Running**     | نمونه در حال اجرا                    |
| RTS-05 | **Paused**      | نمونه متوقف شده — قابل ادامه         |
| RTS-06 | **Recovering**  | نمونه در حال بازیابی از خطا          |
| RTS-07 | **Completed**   | نمونه با موفقیت به پایان رسیده       |
| RTS-08 | **Terminated**  | نمونه خاتمه یافته — غیرقابل ادامه    |

### انتقال‌های مجاز

| از     | به     | شرط                       |
| ------ | ------ | ------------------------- |
| RTS-01 | RTS-02 | تکمیل آماده‌سازی          |
| RTS-01 | RTS-08 | خطا در آماده‌سازی         |
| RTS-02 | RTS-03 | آماده‌سازی بافت و منابع   |
| RTS-02 | RTS-08 | عدم تأمین منابع           |
| RTS-03 | RTS-04 | شروع اجرا                 |
| RTS-03 | RTS-05 | توقف درخواستی قبل از اجرا |
| RTS-03 | RTS-08 | انصراف از اجرا            |
| RTS-04 | RTS-05 | توقف موقت اجرا            |
| RTS-04 | RTS-06 | خطای قابل بازیابی         |
| RTS-04 | RTS-07 | تکمیل موفق                |
| RTS-04 | RTS-08 | خطای غیرقابل بازیابی      |
| RTS-05 | RTS-04 | ادامه اجرا                |
| RTS-05 | RTS-08 | خاتمه از حالت متوقف       |
| RTS-05 | RTS-06 | خطا در حین توقف           |
| RTS-06 | RTS-04 | بازیابی موفق              |
| RTS-06 | RTS-08 | شکست بازیابی              |
| RTS-06 | RTS-02 | نیاز به آماده‌سازی مجدد   |
| RTS-07 | RTS-08 | بایگانی و خاتمه نهایی     |

---

## ۱۴. Runtime Models

۸ مدل زمان اجرا:

| ID     | مدل                         | توضیح                                | دامنه  |
| ------ | --------------------------- | ------------------------------------ | ------ |
| RTM-01 | **Stateless Execution**     | اجرای بدون حالت — هر درخواست مستقل   | RTD-01 |
| RTM-02 | **Stateful Execution**      | اجرای با حالت — وضعیت بین درخواست‌ها | RTD-01 |
| RTM-03 | **Session-Based Execution** | اجرای مبتنی بر نشست                  | RTD-03 |
| RTM-04 | **Isolated Execution**      | اجرای ایزوله — مرزهای سخت            | RTD-01 |
| RTM-05 | **Coordinated Execution**   | اجرای هماهنگ — تعامل بین نمونه‌ها    | RTD-05 |
| RTM-06 | **Scheduled Execution**     | اجرای زمان‌بندی‌شده                  | RTD-06 |
| RTM-07 | **Monitored Execution**     | اجرای تحت نظارت                      | RTD-07 |
| RTM-08 | **Resilient Execution**     | اجرای مقاوم — با قابلیت بازیابی      | RTD-08 |

---

## ۱۵. Runtime Relationships

۱۰ رابطه اصلی زمان اجرا:

| ID     | رابطه               | مبدأ             | مقصد               | توضیح                                  |
| ------ | ------------------- | ---------------- | ------------------ | -------------------------------------- |
| RTR-01 | **Runs In**         | RuntimeInstance  | RuntimeEnvironment | نمونه در یک محیط اجرا می‌شود           |
| RTR-02 | **Has Context**     | RuntimeInstance  | RuntimeContext     | نمونه دارای بافت است                   |
| RTR-03 | **Has State**       | RuntimeInstance  | RuntimeState       | نمونه دارای حالت است                   |
| RTR-04 | **Belongs To**      | RuntimeInstance  | RuntimeOwner       | نمونه متعلق به یک مالک است             |
| RTR-05 | **Executes**        | RuntimeInstance  | ExecutionTask      | نمونه یک وظیفه را اجرا می‌کند          |
| RTR-06 | **Cooperates With** | RuntimeInstance  | RuntimeInstance    | دو نمونه با هم همکاری می‌کنند          |
| RTR-07 | **Monitors**        | MonitoringRecord | RuntimeInstance    | ثبت نظارت مربوط به یک نمونه است        |
| RTR-08 | **Recovers**        | RecoveryPlan     | RuntimeInstance    | طرح بازیابی یک نمونه را بازیابی می‌کند |
| RTR-09 | **Governs**         | RuntimePolicy    | RuntimeInstance    | سیاست بر نمونه حاکم است                |
| RTR-10 | **Contracts**       | RuntimeContract  | RuntimeInstance    | قرارداد بین نمونه و زمان اجرا          |

---

## ۱۶. Runtime Integrity

یکپارچگی زمان اجرا بر اساس ۴ بعد تعریف می‌شود:

### بعد ۱: یکپارچگی نمونه (Instance Integrity)

| قاعده                                      | توضیح |
| ------------------------------------------ | ----- |
| هر نمونه باید دارای هویت یکتا باشد         |
| هر نمونه باید دارای مرز مشخص باشد          |
| نمونه‌ها نباید با یکدیگر تداخل داشته باشند |

### بعد ۲: یکپارچگی بافت (Context Integrity)

| قاعده                                  | توضیح |
| -------------------------------------- | ----- |
| هر نمونه باید دارای بافت معتبر باشد    |
| بافت نباید حاوی داده‌های متناقض باشد   |
| بافت باید قابل ردیابی تا منبع خود باشد |

### بعد ۳: یکپارچگی حالت (State Integrity)

| قاعده                                 | توضیح |
| ------------------------------------- | ----- |
| حالت نمونه باید همیشه معتبر باشد      |
| انتقال‌های حالت باید مجاز باشند       |
| حالت نباید بدون انتقال مجاز تغییر کند |

### بعد ۴: یکپارچگی حکمرانی (Governance Integrity)

| قاعده                                       | توضیح |
| ------------------------------------------- | ----- |
| هر نمونه باید تابع سیاست‌های تعریف‌شده باشد |
| نقض سیاست باید مستند و گزارش شود            |
| مالک نمونه مسئول انطباق است                 |

---

## ۱۷. Runtime Consistency Rules

۱۲ قاعده سازگاری زمان اجرا:

| ID      | قاعده                                            | توضیح                        |
| ------- | ------------------------------------------------ | ---------------------------- |
| RTCR-01 | هر نمونه دقیقاً یک هویت یکتا دارد                | Unique identity per instance |
| RTCR-02 | هر نمونه دقیقاً یک مالک دارد                     | Single owner per instance    |
| RTCR-03 | هر نمونه در یک زمان فقط یک حالت دارد             | Single state at any time     |
| RTCR-04 | انتقال حالت فقط از طریق انتقال‌های مجاز          | Allowed transitions only     |
| RTCR-05 | نمونه‌های همکار باید در یک دامنه هماهنگی باشند   | Coordination scope           |
| RTCR-06 | وظایف یک نمونه نباید از مرز نمونه خارج شوند      | Boundary respect             |
| RTCR-07 | بافت نمونه باید با بافت محیط سازگار باشد         | Context consistency          |
| RTCR-08 | بازیابی نباید نمونه‌های دیگر را مختل کند         | Non-disruptive recovery      |
| RTCR-09 | نظارت نباید بر اجرای نمونه تأثیر بگذارد          | Non-intrusive monitoring     |
| RTCR-10 | سیاست‌های زمان اجرا بر همه نمونه‌ها اعمال می‌شود | Universal policy enforcement |
| RTCR-11 | قرارداد زمان اجرا باید توسط همه طرفین رعایت شود  | Contract compliance          |
| RTCR-12 | بدون اجرا خارج از مرز تعریف‌شده                  | Scope-bound execution        |

---

## ۱۸. Runtime Governance

حکمرانی زمان اجرا بر اساس ۵ سطح اختیار (A-0 تا A-4) و ۴ حوزه حکمرانی تعریف می‌شود:

### حوزه‌های حکمرانی

| حوزه                    | توضیح                                 |
| ----------------------- | ------------------------------------- |
| **Instance Governance** | حکمرانی نمونه — ایجاد، نظارت، خاتمه   |
| **Context Governance**  | حکمرانی بافت — اعتبارسنجی، نگهداری    |
| **State Governance**    | حکمرانی حالت — انتقال، ماندگاری       |
| **Policy Governance**   | حکمرانی سیاست — تعریف، اعمال، حسابرسی |

### مدل تصمیم‌گیری

| نوع تصمیم             | سطح اختیار | مسئول        |
| --------------------- | ---------- | ------------ |
| ایجاد نمونه زمان اجرا | A-1        | مدیر اجرا    |
| تخصیص منابع           | A-2        | زمان‌بند     |
| توقف نمونه            | A-2        | مدیر اجرا    |
| بازیابی از خطا        | A-2        | مدیر بازیابی |
| تغییر سیاست زمان اجرا | A-3        | افسر حکمرانی |
| خاتمه اضطراری نمونه   | A-3        | افسر حکمرانی |
| مصالحه بین نمونه‌ها   | A-4        | هماهنگ‌ساز   |
| استثنای حکمرانی       | A-4        | معمار سیستم  |

---

## ۱۹. Runtime Context Model

مدل بافت زمان اجرا (Runtime Context) نحوه نگهداری و مدیریت داده‌های بافتی را مشخص می‌کند:

### انواع بافت

| نوع بافت                | توضیح                                           |
| ----------------------- | ----------------------------------------------- |
| **Execution Context**   | بافت اجرا — داده‌های مربوط به وظیفه در حال اجرا |
| **Session Context**     | بافت نشست — داده‌های مربوط به نشست جاری         |
| **Environment Context** | بافت محیط — داده‌های مربوط به محیط اجرا         |
| **Security Context**    | بافت امنیت — هویت، مجوزها و دسترسی‌ها           |
| **Governance Context**  | بافت حکمرانی — سیاست‌ها و محدودیت‌های فعال      |

### ویژگی‌های بافت

| ویژگی                                           | توضیح |
| ----------------------------------------------- | ----- |
| هر نمونه دارای یک بافت منحصربه‌فرد است          |
| بافت فقط درون مرز نمونه معتبر است               |
| بافت پس از خاتمه نمونه منقضی می‌شود             |
| بافت قابل اشتراک‌گذاری بین نمونه‌های همکار نیست |

---

## ۲۰. Runtime Metrics

۱۵ معیار اصلی ارزیابی زمان اجرا:

| ID      | معیار                   | توضیح                              | واحد       |
| ------- | ----------------------- | ---------------------------------- | ---------- |
| RTM-001 | Instance Uptime         | مدت زمان فعال بودن نمونه           | ثانیه      |
| RTM-002 | Execution Success Rate  | درصد اجراهای موفق به کل            | درصد       |
| RTM-003 | Average Execution Time  | میانگین زمان اجرای وظایف           | میلی‌ثانیه |
| RTM-004 | Resource Utilization    | میزان استفاده از منابع تخصیص‌یافته | درصد       |
| RTM-005 | Recovery Success Rate   | درصد بازیابی‌های موفق              | درصد       |
| RTM-006 | Mean Time To Recovery   | میانگین زمان بازیابی از خطا        | ثانیه      |
| RTM-007 | Isolation Violations    | تعداد نقض ایزولاسیون               | عدد        |
| RTM-008 | Context Inconsistencies | تعداد ناسازگاری‌های بافت           | عدد        |
| RTM-009 | State Transition Errors | تعداد خطاهای انتقال حالت           | عدد        |
| RTM-010 | Policy Violations       | تعداد نقض سیاست                    | عدد        |
| RTM-011 | Instance Density        | تراکم نمونه‌ها در محیط             | عدد        |
| RTM-012 | Scheduling Latency      | تأخیر زمان‌بندی                    | میلی‌ثانیه |
| RTM-013 | Monitoring Coverage     | پوشش نظارت بر نمونه‌ها             | درصد       |
| RTM-014 | Coordination Overhead   | سربار هماهنگی بین نمونه‌ها         | درصد       |
| RTM-015 | Governance Compliance   | درصد انطباق با حکمرانی             | درصد       |

---

## ۲۱. Runtime Constraints

۸ محدودیت اصلی زمان اجرا:

| ID       | محدودیت                                        | توضیح                    |
| -------- | ---------------------------------------------- | ------------------------ |
| RTCST-01 | هر نمونه فقط یک حالت در هر زمان دارد           | Single state at any time |
| RTCST-02 | انتقال حالت فقط از طریق انتقال‌های مجاز        | Allowed transitions only |
| RTCST-03 | هر نمونه دارای مرز مشخص و غیرقابل نفوذ است     | Defined boundary         |
| RTCST-04 | بافت نمونه فقط درون مرز نمونه معتبر است        | Scope-limited context    |
| RTCST-05 | نمونه نباید با نمونه‌های دیگر تداخل داشته باشد | Non-interference         |
| RTCST-06 | بازیابی نباید نمونه‌های سالم را مختل کند       | Non-disruptive recovery  |
| RTCST-07 | سیاست‌ها بر همه نمونه‌ها اعمال می‌شوند         | Universal policy         |
| RTCST-08 | هر نمونه باید دارای مالک مشخص باشد             | Mandatory ownership      |

---

## ۲۲. Runtime Quality Gates

۷ گیت کیفیت زمان اجرا:

| ID      | گیت                      | مرحله   | معیار عبور                               |
| ------- | ------------------------ | ------- | ---------------------------------------- |
| RTQG-01 | **Instance Validation**  | RTST-01 | هویت، مرز و مالک نمونه معتبر هستند       |
| RTQG-02 | **Context Readiness**    | RTST-02 | بافت کامل، سازگار و معتبر است            |
| RTQG-03 | **Resource Sufficiency** | RTST-03 | منابع کافی برای اجرا تخصیص یافته         |
| RTQG-04 | **Execution Health**     | RTST-04 | اجرا بدون خطا و در مرز مجاز است          |
| RTQG-05 | **Coordination Check**   | RTST-05 | هماهنگی با نمونه‌های دیگر موفق است       |
| RTQG-06 | **Monitoring Active**    | RTST-06 | نظارت فعال و داده‌ها در حال ثبت هستند    |
| RTQG-07 | **Completion Integrity** | RTST-07 | اجرا کامل، منابع آزاد و مسیر ثبت شده است |

---

## ۲۳. Cross-Family Mapping

نگاشت زمان اجرا با سایر خانواده‌های دانشی SMOS:

| خانواده دانش           | دامنه        | ارتباط با زمان اجرا                            |
| ---------------------- | ------------ | ---------------------------------------------- |
| KNW-BUS (KNW-101..104) | کسب‌وکار     | تعریف فرآیندها و قواعد کسب‌وکار برای اجرا      |
| KNW-ENG (KNW-201..206) | مهندسی دانش  | کامپایلر، گراف، معنا، پرس‌وجو، فدراسیون، تفکیک |
| KNW-PLT (KNW-301..308) | پلتفرم       | قابلیت‌ها و سرویس‌های پلتفرم برای اجرا         |
| KNW-OPS (KNW-401..405) | عملیات       | رویه‌ها، گزارش‌ها و تداوم عملیات               |
| KNW-AI (KNW-501..510)  | هوش مصنوعی   | عامل‌های هوشمند که در زمان اجرا فعالیت می‌کنند |
| KNW-BRD (KNW-701)      | برند         | هویت و صدای برند در زمان اجرا                  |
| KNW-REF (KNW-801)      | مرجع         | استانداردها و مراجع برای انطباق زمان اجرا      |
| COM-001..005           | ارتباطات     | محتوا، صدا، تحریریه، شبکه‌های اجتماعی، انتشار  |
| AI-000                 | معماری Agent | معماری مادر عامل‌های هوشمند برای اجرا          |

---

## ۲۴. Runtime Authority Model

مدل اختیار زمان اجرا (Runtime Authority) نحوه تعیین مرجعیت در مدیریت زمان اجرا را مشخص می‌کند:

### سطوح اختیار در زمان اجرا

| سطح        | نام                        | توضیح                         | تصمیمات مجاز               |
| ---------- | -------------------------- | ----------------------------- | -------------------------- |
| AUTH-RT-01 | **Instance Authority**     | اختیار نمونه — مدیر اجرا      | ایجاد، نظارت و خاتمه نمونه |
| AUTH-RT-02 | **Resource Authority**     | اختیار منابع — زمان‌بند       | تخصیص و آزادسازی منابع     |
| AUTH-RT-03 | **Coordination Authority** | اختیار هماهنگی — هماهنگ‌ساز   | هماهنگی بین نمونه‌ها       |
| AUTH-RT-04 | **Governance Authority**   | اختیار حکمرانی — افسر حکمرانی | سیاست‌ها و استثناها        |
| AUTH-RT-05 | **Enterprise Authority**   | اختیار سازمانی — معمار سیستم  | تصمیمات معماری و کلان      |

### قواعد اختیار

| قاعده                                              | توضیح |
| -------------------------------------------------- | ----- |
| هر نمونه باید در lowest possible level مدیریت شود  |
| ارجاع به سطح بالاتر نیاز به مستندسازی دارد         |
| تصمیم سطح بالاتر بر تصمیم سطح پایین‌تر اولویت دارد |
| اختیار قابل تفویض است اما مسئولیت غیرقابل تفویض    |

---

## ۲۵. Runtime Evolution Model

مدل تکامل زمان اجرا در ۵ سطح تعریف می‌شود:

| سطح       | نام                       | توضیح                              |
| --------- | ------------------------- | ---------------------------------- |
| REL-RT-01 | **Basic Execution**       | اجرای پایه — نمونه‌های ایزوله ساده |
| REL-RT-02 | **Managed Execution**     | اجرای مدیریت‌شده — نظارت و گزارش   |
| REL-RT-03 | **Coordinated Execution** | اجرای هماهنگ — تعامل بین نمونه‌ها  |
| REL-RT-04 | **Resilient Execution**   | اجرای مقاوم — بازیابی خودکار       |
| REL-RT-05 | **Adaptive Execution**    | اجرای تطبیقی — بهینه‌سازی خودکار   |

---

## ۲۶. Runtime Traceability Model

مدل ردیابی زمان اجرا (Runtime Traceability) نحوه ردیابی مسیر اجرا از ایجاد تا خاتمه را مشخص می‌کند:

### ابعاد ردیابی

| بعد                         | توضیح                              |
| --------------------------- | ---------------------------------- |
| **Identity Traceability**   | ردیابی هویت نمونه در طول چرخه حیات |
| **State Traceability**      | ردیابی تمام انتقال‌های حالت        |
| **Execution Traceability**  | ردیابی وظایف اجراشده درون نمونه    |
| **Context Traceability**    | ردیابی تغییرات بافت                |
| **Governance Traceability** | ردیابی تصمیمات حکمرانی و استثناها  |

### ساختار رد (Runtime Trail Entry)

| فیلد         | توضیح                             |
| ------------ | --------------------------------- |
| trail_id     | شناسه یکتای رد                    |
| instance_id  | شناسه نمونه زمان اجرا             |
| event        | رویداد ثبت‌شده                    |
| timestamp    | زمان ثبت                          |
| actor        | عامل رویداد (سیستم، مدیر، خودکار) |
| state_before | حالت قبل از رویداد                |
| state_after  | حالت بعد از رویداد                |

---

## ۲۷. Machine Readable JSON Blocks

### Block 1 — Runtime Concepts

```json
{
  "$schema": "RT-001-concept-registry",
  "runtime_concepts": [
    { "id": "RTC-001", "name": "Runtime", "domain": "RTD-01", "layer": "LYR-RT-01" },
    { "id": "RTC-002", "name": "Runtime Instance", "domain": "RTD-01", "layer": "LYR-RT-01" },
    { "id": "RTC-003", "name": "Runtime Context", "domain": "RTD-02", "layer": "LYR-RT-02" },
    { "id": "RTC-004", "name": "Runtime Session", "domain": "RTD-03", "layer": "LYR-RT-02" },
    { "id": "RTC-005", "name": "Runtime State", "domain": "RTD-04", "layer": "LYR-RT-03" },
    { "id": "RTC-006", "name": "Runtime Lifecycle", "domain": "RTD-01", "layer": "LYR-RT-01" },
    { "id": "RTC-007", "name": "Runtime Boundary", "domain": "RTD-01", "layer": "LYR-RT-01" },
    { "id": "RTC-008", "name": "Runtime Isolation", "domain": "RTD-01", "layer": "LYR-RT-01" },
    { "id": "RTC-009", "name": "Runtime Identity", "domain": "RTD-01", "layer": "LYR-RT-01" },
    { "id": "RTC-010", "name": "Runtime Ownership", "domain": "RTD-01", "layer": "LYR-RT-01" },
    { "id": "RTC-011", "name": "Runtime Execution", "domain": "RTD-01", "layer": "LYR-RT-01" },
    { "id": "RTC-012", "name": "Runtime Coordination", "domain": "RTD-05", "layer": "LYR-RT-04" },
    { "id": "RTC-013", "name": "Runtime Scheduling", "domain": "RTD-06", "layer": "LYR-RT-04" },
    { "id": "RTC-014", "name": "Runtime Monitoring", "domain": "RTD-07", "layer": "LYR-RT-05" },
    { "id": "RTC-015", "name": "Runtime Recovery", "domain": "RTD-08", "layer": "LYR-RT-05" },
    { "id": "RTC-016", "name": "Runtime Traceability", "domain": "RTD-07", "layer": "LYR-RT-05" },
    { "id": "RTC-017", "name": "Runtime Governance", "domain": "RTD-07", "layer": "LYR-RT-05" },
    { "id": "RTC-018", "name": "Runtime Metric", "domain": "RTD-07", "layer": "LYR-RT-05" },
    { "id": "RTC-019", "name": "Runtime Policy", "domain": "RTD-05", "layer": "LYR-RT-04" },
    { "id": "RTC-020", "name": "Runtime Contract", "domain": "RTD-05", "layer": "LYR-RT-04" }
  ]
}
```

### Block 2 — Runtime Entities

```json
{
  "$schema": "RT-001-entity-registry",
  "runtime_entities": [
    { "id": "RTE-001", "name": "RuntimeEnvironment", "domain": "RTD-01", "type": "Core" },
    { "id": "RTE-002", "name": "RuntimeInstance", "domain": "RTD-01", "type": "Core" },
    { "id": "RTE-003", "name": "RuntimeContext", "domain": "RTD-02", "type": "Core" },
    { "id": "RTE-004", "name": "RuntimeSession", "domain": "RTD-03", "type": "Operational" },
    { "id": "RTE-005", "name": "RuntimeState", "domain": "RTD-04", "type": "Core" },
    { "id": "RTE-006", "name": "RuntimeBoundary", "domain": "RTD-01", "type": "Core" },
    { "id": "RTE-007", "name": "RuntimeIdentity", "domain": "RTD-01", "type": "Core" },
    { "id": "RTE-008", "name": "RuntimeOwner", "domain": "RTD-01", "type": "Governance" },
    { "id": "RTE-009", "name": "ExecutionTask", "domain": "RTD-01", "type": "Operational" },
    { "id": "RTE-010", "name": "CoordinationUnit", "domain": "RTD-05", "type": "Operational" },
    { "id": "RTE-011", "name": "MonitoringRecord", "domain": "RTD-07", "type": "Audit" },
    { "id": "RTE-012", "name": "RecoveryPlan", "domain": "RTD-08", "type": "Operational" }
  ]
}
```

### Block 3 — Runtime Capabilities

```json
{
  "$schema": "RT-001-capability-registry",
  "runtime_capabilities": [
    {
      "id": "RTCAP-001",
      "name": "Instance Provisioning",
      "layer": "LYR-RT-01",
      "domain": "RTD-01"
    },
    { "id": "RTCAP-002", "name": "Task Execution", "layer": "LYR-RT-01", "domain": "RTD-01" },
    { "id": "RTCAP-003", "name": "Context Management", "layer": "LYR-RT-02", "domain": "RTD-02" },
    { "id": "RTCAP-004", "name": "Session Management", "layer": "LYR-RT-02", "domain": "RTD-03" },
    { "id": "RTCAP-005", "name": "State Persistence", "layer": "LYR-RT-03", "domain": "RTD-04" },
    { "id": "RTCAP-006", "name": "State Transition", "layer": "LYR-RT-03", "domain": "RTD-04" },
    {
      "id": "RTCAP-007",
      "name": "Instance Coordination",
      "layer": "LYR-RT-04",
      "domain": "RTD-05"
    },
    { "id": "RTCAP-008", "name": "Resource Scheduling", "layer": "LYR-RT-04", "domain": "RTD-06" },
    { "id": "RTCAP-009", "name": "Boundary Enforcement", "layer": "LYR-RT-04", "domain": "RTD-05" },
    { "id": "RTCAP-010", "name": "Runtime Monitoring", "layer": "LYR-RT-05", "domain": "RTD-07" },
    { "id": "RTCAP-011", "name": "Health Assessment", "layer": "LYR-RT-05", "domain": "RTD-07" },
    { "id": "RTCAP-012", "name": "Error Detection", "layer": "LYR-RT-05", "domain": "RTD-08" },
    { "id": "RTCAP-013", "name": "Recovery Execution", "layer": "LYR-RT-05", "domain": "RTD-08" },
    {
      "id": "RTCAP-014",
      "name": "Governance Enforcement",
      "layer": "LYR-RT-05",
      "domain": "RTD-07"
    }
  ]
}
```

### Block 4 — Runtime Functions

```json
{
  "$schema": "RT-001-function-registry",
  "runtime_functions": [
    { "id": "RTF-01", "name": "Provision Instance", "capability": "RTCAP-001", "domain": "RTD-01" },
    { "id": "RTF-02", "name": "Execute Task", "capability": "RTCAP-002", "domain": "RTD-01" },
    { "id": "RTF-03", "name": "Manage Context", "capability": "RTCAP-003", "domain": "RTD-02" },
    { "id": "RTF-04", "name": "Manage Session", "capability": "RTCAP-004", "domain": "RTD-03" },
    { "id": "RTF-05", "name": "Persist State", "capability": "RTCAP-005", "domain": "RTD-04" },
    { "id": "RTF-06", "name": "Transition State", "capability": "RTCAP-006", "domain": "RTD-04" },
    {
      "id": "RTF-07",
      "name": "Coordinate Instances",
      "capability": "RTCAP-007",
      "domain": "RTD-05"
    },
    { "id": "RTF-08", "name": "Schedule Resources", "capability": "RTCAP-008", "domain": "RTD-06" },
    { "id": "RTF-09", "name": "Enforce Boundary", "capability": "RTCAP-009", "domain": "RTD-05" },
    { "id": "RTF-10", "name": "Monitor Runtime", "capability": "RTCAP-010", "domain": "RTD-07" },
    { "id": "RTF-11", "name": "Assess Health", "capability": "RTCAP-011", "domain": "RTD-07" },
    { "id": "RTF-12", "name": "Detect Error", "capability": "RTCAP-012", "domain": "RTD-08" },
    { "id": "RTF-13", "name": "Execute Recovery", "capability": "RTCAP-013", "domain": "RTD-08" },
    { "id": "RTF-14", "name": "Enforce Governance", "capability": "RTCAP-014", "domain": "RTD-07" }
  ]
}
```

### Block 5 — Runtime Stages

```json
{
  "$schema": "RT-001-stage-registry",
  "runtime_stages": [
    {
      "id": "RTST-01",
      "name": "Provisioning",
      "input": "RuntimeRequest",
      "output": "ProvisionedInstance",
      "domain": "RTD-01"
    },
    {
      "id": "RTST-02",
      "name": "Context Initialization",
      "input": "ProvisionedInstance",
      "output": "InitializedContext",
      "domain": "RTD-02"
    },
    {
      "id": "RTST-03",
      "name": "Resource Allocation",
      "input": "InitializedContext",
      "output": "AllocatedResources",
      "domain": "RTD-06"
    },
    {
      "id": "RTST-04",
      "name": "Execution",
      "input": "AllocatedResources",
      "output": "ExecutionResults",
      "domain": "RTD-01"
    },
    {
      "id": "RTST-05",
      "name": "Coordination",
      "input": "ExecutionResults",
      "output": "CoordinatedState",
      "domain": "RTD-05"
    },
    {
      "id": "RTST-06",
      "name": "Monitoring",
      "input": "CoordinatedState",
      "output": "MonitoringData",
      "domain": "RTD-07"
    },
    {
      "id": "RTST-07",
      "name": "Completion",
      "input": "MonitoringData",
      "output": "CompletedInstance",
      "domain": "RTD-01"
    },
    {
      "id": "RTST-08",
      "name": "Audit",
      "input": "CompletedInstance",
      "output": "AuditTrail",
      "domain": "RTD-07"
    }
  ],
  "total_stages": 8
}
```

### Block 6 — Runtime Models

```json
{
  "$schema": "RT-001-model-registry",
  "runtime_models": [
    {
      "id": "RTM-01",
      "name": "Stateless Execution",
      "domain": "RTD-01",
      "input": "TaskRequest",
      "output": "TaskResult",
      "consumers": ["AI-003", "AI-006", "AI-008"]
    },
    {
      "id": "RTM-02",
      "name": "Stateful Execution",
      "domain": "RTD-01",
      "input": "SessionRequest",
      "output": "SessionResult",
      "consumers": ["AI-001", "AI-002", "AI-009"]
    },
    {
      "id": "RTM-03",
      "name": "Session-Based Execution",
      "domain": "RTD-03",
      "input": "SessionStart",
      "output": "SessionEnd",
      "consumers": ["AI-009", "AI-010"]
    },
    {
      "id": "RTM-04",
      "name": "Isolated Execution",
      "domain": "RTD-01",
      "input": "IsolatedTask",
      "output": "IsolatedResult",
      "consumers": ["AI-014"]
    },
    {
      "id": "RTM-05",
      "name": "Coordinated Execution",
      "domain": "RTD-05",
      "input": "CoordinationRequest",
      "output": "CoordinationResult",
      "consumers": ["AI-014"]
    },
    {
      "id": "RTM-06",
      "name": "Scheduled Execution",
      "domain": "RTD-06",
      "input": "ScheduleSpec",
      "output": "ScheduledResult",
      "consumers": ["AI-008", "AI-010", "AI-014"]
    },
    {
      "id": "RTM-07",
      "name": "Monitored Execution",
      "domain": "RTD-07",
      "input": "MonitoringSpec",
      "output": "MonitoringReport",
      "consumers": ["AI-010", "AI-012"]
    },
    {
      "id": "RTM-08",
      "name": "Resilient Execution",
      "domain": "RTD-08",
      "input": "ResilientTask",
      "output": "ResilientResult",
      "consumers": ["AI-012", "AI-014"]
    }
  ],
  "total_models": 8
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Runtime Instance Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-001-runtime-instance",
  "title": "Runtime Instance Schema",
  "description": "Schema for a runtime instance in the Enterprise Runtime Foundation",
  "type": "object",
  "properties": {
    "instance_id": {
      "type": "string",
      "description": "شناسه یکتای نمونه زمان اجرا",
      "pattern": "^RTI-[0-9]{12}-[A-Z0-9]{8}$"
    },
    "runtime_domain": {
      "type": "string",
      "description": "دامنه زمان اجرا",
      "enum": ["RTD-01", "RTD-02", "RTD-03", "RTD-04", "RTD-05", "RTD-06", "RTD-07", "RTD-08"]
    },
    "status": {
      "type": "string",
      "description": "وضعیت نمونه",
      "enum": [
        "initialized",
        "prepared",
        "ready",
        "running",
        "paused",
        "recovering",
        "completed",
        "terminated"
      ]
    },
    "owner": {
      "type": "string",
      "description": "مالک نمونه",
      "pattern": "^AI-[0-9]{3}$|^Human$|^System$"
    },
    "context": {
      "type": "object",
      "description": "بافت زمان اجرا",
      "properties": {
        "context_id": { "type": "string" },
        "context_type": {
          "type": "string",
          "enum": ["execution", "session", "environment", "security", "governance"]
        },
        "scope": { "type": "string" }
      }
    },
    "boundary": {
      "type": "object",
      "description": "مرز نمونه",
      "properties": {
        "allowed_domains": { "type": "array", "items": { "type": "string" } },
        "max_duration": { "type": "integer", "description": "حداکثر مدت زمان اجرا (ثانیه)" },
        "resource_limit": { "type": "object" }
      }
    },
    "created_at": {
      "type": "string",
      "description": "زمان ایجاد نمونه",
      "format": "date-time"
    }
  },
  "required": ["instance_id", "runtime_domain", "status", "owner", "context"]
}
```

### Schema 2 — Runtime Context Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-001-runtime-context",
  "title": "Runtime Context Schema",
  "description": "Schema for runtime context in the Enterprise Runtime Foundation",
  "type": "object",
  "properties": {
    "context_id": {
      "type": "string",
      "description": "شناسه یکتای بافت"
    },
    "instance_id": {
      "type": "string",
      "description": "شناسه نمونه مرتبط"
    },
    "context_type": {
      "type": "string",
      "description": "نوع بافت",
      "enum": ["execution", "session", "environment", "security", "governance"]
    },
    "data": {
      "type": "object",
      "description": "داده‌های بافتی",
      "properties": {
        "execution_params": { "type": "object" },
        "session_data": { "type": "object" },
        "environment_vars": { "type": "object" },
        "security_claims": { "type": "object" },
        "governance_rules": { "type": "array", "items": { "type": "string" } }
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
    "source": {
      "type": "string",
      "description": "منبع بافت"
    }
  },
  "required": ["context_id", "instance_id", "context_type", "data"]
}
```

### Schema 3 — Runtime State Transition Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-001-state-transition",
  "title": "Runtime State Transition Schema",
  "description": "Schema for a state transition in the Enterprise Runtime Foundation",
  "type": "object",
  "properties": {
    "transition_id": {
      "type": "string",
      "description": "شناسه یکتای انتقال"
    },
    "instance_id": {
      "type": "string",
      "description": "شناسه نمونه"
    },
    "from_state": {
      "type": "string",
      "description": "حالت مبدأ",
      "enum": ["RTS-01", "RTS-02", "RTS-03", "RTS-04", "RTS-05", "RTS-06", "RTS-07", "RTS-08"]
    },
    "to_state": {
      "type": "string",
      "description": "حالت مقصد",
      "enum": ["RTS-01", "RTS-02", "RTS-03", "RTS-04", "RTS-05", "RTS-06", "RTS-07", "RTS-08"]
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
    "instance_id",
    "from_state",
    "to_state",
    "condition",
    "triggered_by"
  ]
}
```

---

## ۲۹. Runtime Integrity Rules

### قواعد یکپارچگی زمان اجرا

| ID          | قاعده                                  | توضیح                           | منبع     |
| ----------- | -------------------------------------- | ------------------------------- | -------- |
| RINTR-RT-01 | هر نمونه یک هویت یکتا دارد             | نمونه‌های بدون هویت مجاز نیستند | RTCST-01 |
| RINTR-RT-02 | هر نمونه یک مالک مشخص دارد             | نمونه‌های بدون مالک مجاز نیستند | RTCST-08 |
| RINTR-RT-03 | انتقال حالت فقط مجاز است               | انتقال غیرمجاز blocked می‌شود   | RTCST-02 |
| RINTR-RT-04 | مرز نمونه غیرقابل نفوذ است             | نقض مرز مجاز نیست               | RTCST-03 |
| RINTR-RT-05 | بافت فقط درون مرز معتبر است            | بافت خارج از مرز نامعتبر است    | RTCST-04 |
| RINTR-RT-06 | نمونه‌ها نباید تداخل داشته باشند       | تداخل بین نمونه‌ها مجاز نیست    | RTCST-05 |
| RINTR-RT-07 | بازیابی غیرمخرب الزامی است             | بازیابی مخرب مجاز نیست          | RTCST-06 |
| RINTR-RT-08 | سیاست‌ها بر همه نمونه‌ها اعمال می‌شوند | تبعیض در اعمال سیاست مجاز نیست  | RTCST-07 |

---

## ۳۰. Cross-Domain Runtime Mapping

### نگاشت بین دامنه‌های زمان اجرا

| دامنه مبدأ            | دامنه مقصد            | نوع نگاشت  | توضیح                           |
| --------------------- | --------------------- | ---------- | ------------------------------- |
| RTD-01 (Execution)    | RTD-02 (Context)      | Direct     | اجرا نیاز به بافت دارد          |
| RTD-01 (Execution)    | RTD-03 (Session)      | Contextual | اجرا می‌تواند درون یک نشست باشد |
| RTD-02 (Context)      | RTD-04 (State)        | Direct     | بافت بر حالت تأثیر می‌گذارد     |
| RTD-03 (Session)      | RTD-01 (Execution)    | Composite  | نشست شامل چند اجرا است          |
| RTD-04 (State)        | RTD-05 (Coordination) | Contextual | حالت بر هماهنگی تأثیر می‌گذارد  |
| RTD-05 (Coordination) | RTD-06 (Scheduling)   | Direct     | هماهنگی نیاز به زمان‌بندی دارد  |
| RTD-06 (Scheduling)   | RTD-01 (Execution)    | Delegated  | زمان‌بندی به اجرا منتهی می‌شود  |
| RTD-07 (Monitoring)   | RTD-05 (Coordination) | Direct     | نظارت بر هماهنگی تأثیر می‌گذارد |
| RTD-08 (Recovery)     | RTD-04 (State)        | Direct     | بازیابی حالت را تغییر می‌دهد    |
| RTD-08 (Recovery)     | RTD-07 (Monitoring)   | Composite  | بازیابی نیاز به نظارت دارد      |

---

> **پایان RT-001 — Enterprise Runtime Foundation**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۰۹
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**
