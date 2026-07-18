# RT-007 — Enterprise Runtime Monitoring Architecture

> **معماری نظارت زمان اجرای سازمانی SMOS**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۱۲
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**

---

## فهرست بخش‌ها

| بخش | عنوان                                                          |
| --- | -------------------------------------------------------------- |
| ۱   | Purpose — هدف                                                  |
| ۲   | Scope — دامنه                                                  |
| ۳   | Monitoring Principles — اصول نظارت                             |
| ۴   | Monitoring Philosophy — فلسفه نظارت                            |
| ۵   | Architecture — Monitoring in the Layered Model                 |
| ۶   | Monitoring Domains — دامنه‌های نظارت                           |
| ۷   | Monitoring Concepts — مفاهیم نظارت                             |
| ۸   | Monitoring Entities — موجودیت‌های نظارت                        |
| ۹   | Monitoring Capabilities — قابلیت‌های نظارت                     |
| ۱۰  | Monitoring Functions — کارکردهای نظارت                         |
| ۱۱  | Monitoring Stage Model — مدل مرحله‌ای نظارت                    |
| ۱۲  | Monitoring State Model — مدل وضعیت نظارت                       |
| ۱۳  | Monitoring Models — مدل‌های نظارت                              |
| ۱۴  | Monitoring Relationships — روابط نظارت                         |
| ۱۵  | Monitoring Integrity — یکپارچگی نظارت                          |
| ۱۶  | Monitoring Consistency Rules — قواعد سازگاری نظارت             |
| ۱۷  | Monitoring Constraints — محدودیت‌های نظارت                     |
| ۱۸  | Monitoring Governance — حکمرانی نظارت                          |
| ۱۹  | Monitoring Evolution — تکامل نظارت                             |
| ۲۰  | Monitoring Pattern Catalog — کاتالوگ الگوهای نظارت             |
| ۲۱  | Monitoring Mapping — نگاشت نظارت                               |
| ۲۲  | Cross-Domain Monitoring Mapping — نگاشت بین‌دامنه‌ای           |
| ۲۳  | Monitoring Maturity Model — مدل بلوغ نظارت                     |
| ۲۴  | Monitoring Metrics — معیارهای نظارت                            |
| ۲۵  | Monitoring Validation — اعتبارسنجی نظارت                       |
| ۲۶  | Integration with RT Family — یکپارچگی با خانواده RT            |
| ۲۷  | Machine Readable JSON Blocks — بلوک‌های JSON ماشین‌خوان        |
| ۲۸  | JSON Schemas (Draft-07)                                        |
| ۲۹  | Monitoring Quality Gates — گیت‌های کیفیت نظارت                 |
| ۳۰  | Cross-Domain Integration Summary — خلاصه یکپارچگی بین‌دامنه‌ای |

---

## ۱. Purpose — هدف

هدف از RT-007 تعریف معماری نظارت زمان اجرای سازمانی SMOS است. این سند چارچوبی معماری، مستقل از فناوری، برای نظارت بر وضعیت، سلامت، عملکرد و رفتار Runtimeهای سازمانی در SMOS ارائه می‌دهد. RT-007 به عنوان SSOT (تک منبع حقیقت) برای همه مفاهیم، موجودیت‌ها، قابلیت‌ها و مدل‌های نظارت زمان اجرا عمل می‌کند و مرزهای دقیق بین نظارت و سایر دامنه‌های Runtime (اجرا، بافت، نشست، حالت، هماهنگی) را مشخص می‌سازد.

---

## ۲. Scope — دامنه

این سند شامل:

- تعریف مفهوم نظارت زمان اجرا در SMOS
- دامنه‌های تخصصی نظارت (۸ دامنه)
- مفاهیم نظارت (۲۰ مفهوم)
- موجودیت‌های نظارت (۱۲ موجودیت)
- قابلیت‌های نظارت (۱۴ قابلیت)
- کارکردهای نظارت (۱۴ کارکرد)
- مدل مرحله‌ای نظارت (۸ مرحله)
- مدل وضعیت نظارت (۸ وضعیت، ۲۰ انتقال مجاز)
- مدل‌های نظارت (۸ مدل)
- روابط نظارت (۱۰ رابطه)
- معیارهای نظارت (۱۵ معیار)
- اصول و محدودیت‌های نظارت
- حکمرانی و تکامل نظارت
- گیت‌های کیفیت نظارت (۷ گیت)

**این سند شامل نمی‌شود:** نرم‌افزار نظارت، پلتفرم‌های مشاهده‌پذیری، داشبوردها، موتورهای هشدار، جمع‌آوری لاگ، metrics collection, tracing, distributed tracing, زیرساخت نظارت، APIها، پروتکل‌ها، کد یا استقرار. RT-007 معماری را تعریف می‌کند — پیاده‌سازی در اسناد عملیاتی مربوطه انجام می‌شود.

---

## ۳. Monitoring Principles — اصول نظارت

| اصل                           | شناسه  | توضیح                                               |
| ----------------------------- | ------ | --------------------------------------------------- |
| **Separation of Observation** | RMP-01 | مشاهده از ارزیابی و گزارش‌دهی جدا می‌شود            |
| **Non-Interference**          | RMP-02 | نظارت بر عملکرد مؤلفه‌های تحت نظارت تأثیر نمی‌گذارد |
| **Composability**             | RMP-03 | مدل‌های نظارت قابل ترکیب برای سناریوهای مختلط هستند |
| **Temporal Integrity**        | RMP-04 | داده‌های نظارت دارای برچسب زمانی و ترتیب درست هستند |
| **Context Awareness**         | RMP-05 | نظارت به بافت زمان اجرا (RT-003) آگاه است           |
| **Governance Alignment**      | RMP-06 | نظارت تحت حکمرانی و سیاست‌های سازمانی است           |
| **Evolution Readiness**       | RMP-07 | معماری نظارت بدون بازطراحی بنیادین تکامل می‌یابد    |
| **Semantic Consistency**      | RMP-08 | مفاهیم و معیارهای نظارت از نظر معنایی سازگار هستند  |

---

## ۴. Monitoring Philosophy — فلسفه نظارت

نظارت زمان اجرا در SMOS بر سه اصل بنیادین استوار است:

1. **مشاهده بدون دخالت** — نظارت هرگز نباید بر رفتار مؤلفه‌های تحت نظارت تأثیر بگذارد. جمع‌آوری داده‌های نظارت به صورت غیرفعال یا با حداقل هزینه انجام می‌شود.
2. **تفکیک لایه‌ای** — نظارت در لایه‌ای مجزا از اجرا، بافت، نشست، حالت و هماهنگی قرار دارد و از طریق رابط‌های مشخص با این لایه‌ها ارتباط برقرار می‌کند.
3. **معناداری عملیاتی** — داده‌های نظارت صرفاً جمع‌آوری نمی‌شوند، بلکه برای تولید بینش عملیاتی (Operational Intelligence) پردازش و تفسیر می‌شوند.

---

## ۵. Architecture — Monitoring in the Layered Model

نظارت زمان اجرا در لایه نظارت (Monitoring Layer) از مدل لایه‌ای Runtime قرار دارد:

```
┌─────────────────────────────────────────────────┐
│            Orchestration Layer                   │
│  (AI-014, SMOS-704, SMOS-720)                   │
├─────────────────────────────────────────────────┤
│            Monitoring Layer (RT-007)             │
│  Observation → Evaluation → Reporting           │
├─────────────────────────────────────────────────┤
│  Coordination Layer (RT-006)                    │
├─────────────────────────────────────────────────┤
│  State Layer (RT-005)                           │
├─────────────────────────────────────────────────┤
│  Session Layer (RT-004)                         │
├─────────────────────────────────────────────────┤
│  Context Layer (RT-003)                         │
├─────────────────────────────────────────────────┤
│  Execution Layer (RT-002)                       │
├─────────────────────────────────────────────────┤
│  Foundation Layer (RT-001)                      │
└─────────────────────────────────────────────────┘
```

نظارت لایه‌ای مستقل است که از تمام لایه‌های زیرین داده دریافت می‌کند و به لایه Orchestration خروجی می‌دهد.

---

## ۶. Monitoring Domains — دامنه‌های نظارت

۸ دامنه تخصصی نظارت:

| شناسه  | دامنه                                      | توضیح                                              |
| ------ | ------------------------------------------ | -------------------------------------------------- |
| RMD-01 | **Runtime Health** — سلامت زمان اجرا       | نظارت بر سلامت کلی Runtime و مؤلفه‌های آن          |
| RMD-02 | **Telemetry** — تله‌متری                   | جمع‌آوری و انتقال داده‌های اندازه‌گیری از مؤلفه‌ها |
| RMD-03 | **Observation** — مشاهده                   | مشاهده و ضبط وضعیت، رویدادها و رفتار Runtime       |
| RMD-04 | **Diagnostics** — تشخیص                    | تحلیل علائم و تشخیص مشکلات و ناهنجاری‌ها           |
| RMD-05 | **Visibility** — قابلیت مشاهده             | فراهم‌سازی دید عملیاتی بر مؤلفه‌ها و فرآیندها      |
| RMD-06 | **Governance** — حکمرانی نظارت             | حکمرانی بر فرآیندها، داده‌ها و دسترسی نظارت        |
| RMD-07 | **Operational Intelligence** — هوش عملیاتی | تولید بینش عملیاتی از داده‌های نظارت               |
| RMD-08 | **Evolution** — تکامل نظارت                | تکامل و بهبود مستمر معماری نظارت                   |

---

## ۷. Monitoring Concepts — مفاهیم نظارت

۲۰ مفهوم بنیادین نظارت زمان اجرا:

| شناسه   | مفهوم                | دامنه  |
| ------- | -------------------- | ------ |
| RMC-001 | Runtime Monitoring   | RMD-01 |
| RMC-002 | Health Status        | RMD-01 |
| RMC-003 | Telemetry Data       | RMD-02 |
| RMC-004 | Observation Point    | RMD-03 |
| RMC-005 | Diagnostic Signal    | RMD-04 |
| RMC-006 | Anomaly Indicator    | RMD-04 |
| RMC-007 | Visibility Scope     | RMD-05 |
| RMC-008 | Monitoring Policy    | RMD-06 |
| RMC-009 | Operational Insight  | RMD-07 |
| RMC-010 | Monitoring Record    | RMD-03 |
| RMC-011 | Health Check         | RMD-01 |
| RMC-012 | Metric Definition    | RMD-02 |
| RMC-013 | Threshold            | RMD-04 |
| RMC-014 | Alert Condition      | RMD-04 |
| RMC-015 | Observation Window   | RMD-03 |
| RMC-016 | Monitoring Session   | RMD-05 |
| RMC-017 | Monitoring Report    | RMD-07 |
| RMC-018 | Monitoring Rule      | RMD-06 |
| RMC-019 | Monitoring Model     | RMD-01 |
| RMC-020 | Monitoring Evolution | RMD-08 |

---

## ۸. Monitoring Entities — موجودیت‌های نظارت

۱۲ موجودیت اصلی نظارت:

| شناسه   | موجودیت             | دامنه  | نوع         |
| ------- | ------------------- | ------ | ----------- |
| RME-001 | MonitoringRecord    | RMD-03 | Core        |
| RME-002 | HealthIndicator     | RMD-01 | Core        |
| RME-003 | TelemetryStream     | RMD-02 | Core        |
| RME-004 | ObservationPoint    | RMD-03 | Core        |
| RME-005 | DiagnosticSignal    | RMD-04 | Core        |
| RME-006 | MonitoringPolicy    | RMD-06 | Governance  |
| RME-007 | MonitoringSession   | RMD-05 | Operational |
| RME-008 | MonitoringReport    | RMD-07 | Operational |
| RME-009 | AlertCondition      | RMD-04 | Operational |
| RME-010 | ThresholdDefinition | RMD-04 | Core        |
| RME-011 | VisibilityScope     | RMD-05 | Governance  |
| RME-012 | MonitoringRegistry  | RMD-06 | Operational |

---

## ۹. Monitoring Capabilities — قابلیت‌های نظارت

۱۴ قابلیت اصلی نظارت:

| شناسه     | قابلیت                  | دامنه  |
| --------- | ----------------------- | ------ |
| RMCAP-001 | Health Assessment       | RMD-01 |
| RMCAP-002 | Status Determination    | RMD-01 |
| RMCAP-003 | Telemetry Collection    | RMD-02 |
| RMCAP-004 | Telemetry Transmission  | RMD-02 |
| RMCAP-005 | Observation Recording   | RMD-03 |
| RMCAP-006 | Observation Correlation | RMD-03 |
| RMCAP-007 | Signal Detection        | RMD-04 |
| RMCAP-008 | Anomaly Identification  | RMD-04 |
| RMCAP-009 | Visibility Provision    | RMD-05 |
| RMCAP-010 | Insight Generation      | RMD-07 |
| RMCAP-011 | Policy Enforcement      | RMD-06 |
| RMCAP-012 | Report Generation       | RMD-07 |
| RMCAP-013 | Evolution Management    | RMD-08 |
| RMCAP-014 | Governance Compliance   | RMD-06 |

---

## ۱۰. Monitoring Functions — کارکردهای نظارت

۱۴ کارکرد نظارت:

| شناسه  | کارکرد                 | قابلیت    | دامنه  |
| ------ | ---------------------- | --------- | ------ |
| RMF-01 | Assess Health          | RMCAP-001 | RMD-01 |
| RMF-02 | Determine Status       | RMCAP-002 | RMD-01 |
| RMF-03 | Collect Telemetry      | RMCAP-003 | RMD-02 |
| RMF-04 | Transmit Telemetry     | RMCAP-004 | RMD-02 |
| RMF-05 | Record Observation     | RMCAP-005 | RMD-03 |
| RMF-06 | Correlate Observations | RMCAP-006 | RMD-03 |
| RMF-07 | Detect Signal          | RMCAP-007 | RMD-04 |
| RMF-08 | Identify Anomaly       | RMCAP-008 | RMD-04 |
| RMF-09 | Provide Visibility     | RMCAP-009 | RMD-05 |
| RMF-10 | Generate Insight       | RMCAP-010 | RMD-07 |
| RMF-11 | Enforce Policy         | RMCAP-011 | RMD-06 |
| RMF-12 | Generate Report        | RMCAP-012 | RMD-07 |
| RMF-13 | Manage Evolution       | RMCAP-013 | RMD-08 |
| RMF-14 | Ensure Compliance      | RMCAP-014 | RMD-06 |

---

## ۱۱. Monitoring Stage Model — مدل مرحله‌ای نظارت

۸ مرحله چرخه نظارت:

| مرحله     | شناسه   | توضیح                                 | ورودی                  | خروجی                 |
| --------- | ------- | ------------------------------------- | ---------------------- | --------------------- |
| Define    | RMST-01 | تعریف اهداف و دامنه نظارت             | Monitoring Requirement | Monitoring Definition |
| Register  | RMST-02 | ثبت مؤلفه‌های نظارت در رجیستری        | Monitoring Definition  | Registered Component  |
| Configure | RMST-03 | پیکربندی پارامترها و آستانه‌های نظارت | Registered Component   | Configured Monitor    |
| Observe   | RMST-04 | مشاهده و جمع‌آوری داده‌های نظارت      | Configured Monitor     | Observation Data      |
| Evaluate  | RMST-05 | ارزیابی داده‌ها و تشخیص وضعیت         | Observation Data       | Evaluation Result     |
| Report    | RMST-06 | تولید گزارش و بینش عملیاتی            | Evaluation Result      | Monitoring Report     |
| Complete  | RMST-07 | تکمیل و جمع‌بندی چرخه نظارت           | Monitoring Report      | Completion Record     |
| Archive   | RMST-08 | بایگانی سوابق نظارت                   | Completion Record      | Archived Record       |

---

## ۱۲. Monitoring State Model — مدل وضعیت نظارت

۸ وضعیت نظارت با ۲۰ انتقال مجاز:

```
                  ┌──────────┐
                  │ RMS-01   │
                  │ Defined  │
                  └────┬─────┘
                       │ register
                  ┌────▼─────┐
                  │ RMS-02   │
                  │Registered│
                  └────┬─────┘
                       │ configure
                  ┌────▼─────┐
                  │ RMS-03   │
                  │Monitoring│
                  └────┬─────┘
                  ┌────▼─────┐
                  │ RMS-04   │
                  │Evaluating│
                  └────┬─────┘
                  ┌────▼─────┐
                  │ RMS-05   │
                  │ Reporting│
                  └────┬─────┘
                  ┌────▼─────┐
                  │ RMS-07   │
                  │Completed │
                  └────┬─────┘
                  ┌────▼─────┐
                  │ RMS-08   │
                  │ Archived │
                  └──────────┘

    RMS-06 (Suspended) ←→ RMS-03, RMS-04, RMS-05
```

### ۲۰ انتقال مجاز:

| مبدأ   | مقصد   | شرط                                   |
| ------ | ------ | ------------------------------------- |
| RMS-01 | RMS-02 | تعریف کامل و معتبر است                |
| RMS-02 | RMS-03 | پیکربندی انجام شده است                |
| RMS-03 | RMS-04 | داده کافی برای ارزیابی جمع‌آوری شده   |
| RMS-04 | RMS-05 | ارزیابی کامل شده است                  |
| RMS-05 | RMS-07 | گزارش نهایی تأیید شده                 |
| RMS-07 | RMS-08 | تکمیل ثبت و حسابرسی شده               |
| RMS-03 | RMS-06 | نظارت به دلیل خطا یا دستور معلق شده   |
| RMS-04 | RMS-06 | ارزیابی به دلیل خطا معلق شده          |
| RMS-05 | RMS-06 | گزارش‌دهی به دلیل خطا معلق شده        |
| RMS-06 | RMS-03 | نظارت از سر گرفته شده است             |
| RMS-06 | RMS-04 | ارزیابی از سر گرفته شده است           |
| RMS-06 | RMS-05 | گزارش‌دهی از سر گرفته شده است         |
| RMS-01 | RMS-07 | تعریف بدون نیاز به اجرا تکمیل شده     |
| RMS-02 | RMS-07 | ثبت بدون نیاز به نظارت تکمیل شده      |
| RMS-03 | RMS-07 | نظارت مستقیم تکمیل شده (بدون ارزیابی) |
| RMS-04 | RMS-07 | ارزیابی مستقیم تکمیل شده (بدون گزارش) |
| RMS-05 | RMS-07 | گزارش تأیید و ثبت شده                 |
| RMS-07 | RMS-03 | نظارت مجدد آغاز شده                   |
| RMS-08 | RMS-01 | بایگانی بازگشایی و تعریف جدید شده     |
| RMS-08 | RMS-02 | بایگانی بازگشایی و ثبت مجدد شده       |

---

## ۱۳. Monitoring Models — مدل‌های نظارت

۸ مدل نظارت:

| شناسه  | مدل                              | توضیح                                                               | مصرف‌کنندگان   |
| ------ | -------------------------------- | ------------------------------------------------------------------- | -------------- |
| RMM-01 | **Passive** — غیرفعال            | نظارت بدون درخواست فعال — داده‌ها به صورت غیرفعال جمع‌آوری می‌شوند  | AI-010, AI-011 |
| RMM-02 | **Active** — فعال                | نظارت با درخواست فعال — وضعیت مؤلفه‌ها به صورت دوره‌ای بررسی می‌شود | AI-010, AI-012 |
| RMM-03 | **Continuous** — مستمر           | نظارت پیوسته و بی‌وقفه بر وضعیت و عملکرد Runtime                    | AI-010, AI-014 |
| RMM-04 | **Periodic** — دوره‌ای           | نظارت در بازه‌های زمانی مشخص و برنامه‌ریزی‌شده                      | AI-010         |
| RMM-05 | **Event-Oriented** — رویدادمحور  | نظارت مبتنی بر رویدادهای زمان اجرا — با وقوع رویداد فعال می‌شود     | AI-009, AI-010 |
| RMM-06 | **State-Oriented** — وضعیت‌محور  | نظارت مبتنی بر تغییر وضعیت — با تغییر وضعیت فعال می‌شود             | AI-010, AI-012 |
| RMM-07 | **Policy-Oriented** — سیاست‌محور | نظارت مبتنی بر سیاست — مطابق با قواعد حکمرانی اجرا می‌شود           | AI-004, AI-011 |
| RMM-08 | **Hybrid** — ترکیبی              | ترکیب چند مدل نظارت برای پوشش کامل                                  | AI-014         |

---

## ۱۴. Monitoring Relationships — روابط نظارت

۱۰ رابطه اصلی نظارت:

| شناسه  | رابطه     | مبدأ                          | مقصد                        | نوع          |
| ------ | --------- | ----------------------------- | --------------------------- | ------------ |
| RMR-01 | observes  | MonitoringSession (RME-007)   | ExecutionComponent          | Observation  |
| RMR-02 | produces  | ObservationPoint (RME-004)    | MonitoringRecord (RME-001)  | Production   |
| RMR-03 | evaluates | DiagnosticSignal (RME-005)    | HealthIndicator (RME-002)   | Evaluation   |
| RMR-04 | governs   | MonitoringPolicy (RME-006)    | MonitoringSession (RME-007) | Governance   |
| RMR-05 | reports   | MonitoringReport (RME-008)    | MonitoringSession (RME-007) | Reporting    |
| RMR-06 | triggers  | AlertCondition (RME-009)      | MonitoringPolicy (RME-006)  | Triggering   |
| RMR-07 | defines   | ThresholdDefinition (RME-010) | HealthIndicator (RME-002)   | Definition   |
| RMR-08 | scopes    | VisibilityScope (RME-011)     | ObservationPoint (RME-004)  | Scoping      |
| RMR-09 | registers | MonitoringRegistry (RME-012)  | MonitoringRecord (RME-001)  | Registration |
| RMR-10 | consumes  | OperationalInsight            | MonitoringReport (RME-008)  | Consumption  |

---

## ۱۵. Monitoring Integrity — یکپارچگی نظارت

یکپارچگی نظارت بر ۴ بعد استوار است:

| بعد                    | توضیح                                                      | معیار                                    |
| ---------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| **Temporal Integrity** | داده‌های نظارت دارای برچسب زمانی دقیق و ترتیب صحیح هستند   | هر MonitoringRecord دارای timestamp است  |
| **Semantic Integrity** | داده‌های نظارت از نظر معنایی با مفاهیم RT-001 هماهنگ هستند | همه شناسه‌ها در محدوده مجاز هستند        |
| **Non-Interference**   | نظارت بر عملکرد Runtime تأثیر نمی‌گذارد                    | Observation به صورت غیرفعال انجام می‌شود |
| **Completeness**       | همه مؤلفه‌های تحت نظارت پوشش داده شده‌اند                  | VisibilityScope همه نقاط را پوشش می‌دهد  |

---

## ۱۶. Monitoring Consistency Rules — قواعد سازگاری نظارت

۱۲ قانون سازگاری نظارت:

| شناسه   | قانون                                                                        | دامنه  | سطح        |
| ------- | ---------------------------------------------------------------------------- | ------ | ---------- |
| RMCR-01 | هر MonitoringSession باید حداقل یک ObservationPoint داشته باشد               | RMD-05 | Structural |
| RMCR-02 | هر MonitoringRecord باید به یک MonitoringSession تعلق داشته باشد             | RMD-03 | Structural |
| RMCR-03 | هر HealthIndicator باید حداقل یک ThresholdDefinition داشته باشد              | RMD-01 | Structural |
| RMCR-04 | هر AlertCondition باید به یک ThresholdDefinition مرتبط باشد                  | RMD-04 | Behavioral |
| RMCR-05 | هر DiagnosticSignal باید یک ObservationPoint مبدأ داشته باشد                 | RMD-04 | Structural |
| RMCR-06 | هر MonitoringReport باید حداقل یک EvaluationResult داشته باشد                | RMD-07 | Structural |
| RMCR-07 | هیچ ObservationPoint نمی‌تواند به دو VisibilityScope هم‌زمان تعلق داشته باشد | RMD-05 | Governance |
| RMCR-08 | هر MonitoringPolicy باید حداقل یک قانون اجرایی داشته باشد                    | RMD-06 | Governance |
| RMCR-09 | هر TelemetryStream باید منبع و مقصد مشخص داشته باشد                          | RMD-02 | Structural |
| RMCR-10 | هیچ DiagnosticSignal بدون AnomalyIndicator ثبت نمی‌شود                       | RMD-04 | Behavioral |
| RMCR-11 | هر MonitoringSession باید در MonitoringRegistry ثبت شود                      | RMD-06 | Governance |
| RMCR-12 | تکامل MonitoringModel باید در MonitoringRegistry ثبت شود                     | RMD-08 | Evolution  |

---

## ۱۷. Monitoring Constraints — محدودیت‌های نظارت

۸ محدودیت نظارت:

| شناسه    | محدودیت                          | دامنه  | توضیح                                                    |
| -------- | -------------------------------- | ------ | -------------------------------------------------------- |
| RMCST-01 | **Observation Non-Interference** | RMD-03 | Observation نباید بر مؤلفه تحت نظارت تأثیر بگذارد        |
| RMCST-02 | **Single Ownership**             | RMD-05 | هر ObservationPoint دارای یک مالک واحد است               |
| RMCST-03 | **Temporal Ordering**            | RMD-03 | داده‌های نظارت باید دارای ترتیب زمانی صحیح باشند         |
| RMCST-04 | **Threshold Completeness**       | RMD-01 | هر HealthIndicator حداقل یک آستانه دارد                  |
| RMCST-05 | **Policy Compliance**            | RMD-06 | همه MonitoringSession تابع MonitoringPolicy هستند        |
| RMCST-06 | **Session Lifecycle**            | RMD-05 | MonitoringSession از RMS-01 تا RMS-08 حرکت می‌کند        |
| RMCST-07 | **Data Immutability**            | RMD-03 | MonitoringRecord پس از ثبت تغییر نمی‌کند                 |
| RMCST-08 | **Report Completeness**          | RMD-07 | MonitoringReport باید شامل همه Observationهای مرتبط باشد |

---

## ۱۸. Monitoring Governance — حکمرانی نظارت

حکمرانی نظارت بر ۴ سطح اختیار (مطابق AI-000 و KNW-304):

| سطح | نام      | توضیح                      | مصداق                      |
| --- | -------- | -------------------------- | -------------------------- |
| A-0 | None     | بدون نظارت                 | Runtime بدون نیاز به نظارت |
| A-1 | Observe  | فقط مشاهده و جمع‌آوری داده | Telemetry Collection       |
| A-2 | Evaluate | مشاهده + ارزیابی و تشخیص   | Health Assessment          |
| A-3 | Act      | مشاهده + ارزیابی + اقدام   | Automated Response         |
| A-4 | Govern   | نظارت کامل + حکمرانی       | Monitoring Governance      |

### سیاست‌های نظارت:

| سیاست                 | شناسه   | توضیح                          |
| --------------------- | ------- | ------------------------------ |
| Data Retention        | MPOL-01 | مدت نگهداری داده‌های نظارت     |
| Access Control        | MPOL-02 | کنترل دسترسی به داده‌های نظارت |
| Alert Escalation      | MPOL-03 | مسیر ارجاع هشدارها             |
| Observation Frequency | MPOL-04 | فرکانس مشاهده برای هر مدل      |
| Report Distribution   | MPOL-05 | توزیع گزارش‌های نظارت          |
| Audit Requirement     | MPOL-06 | الزامات حسابرسی نظارت          |
| Evolution Approval    | MPOL-07 | تأیید تکامل معماری نظارت       |

---

## ۱۹. Monitoring Evolution — تکامل نظارت

تکامل معماری نظارت در ۵ سطح بلوغ (مطابق §۲۳) انجام می‌شود. محرک‌های تکامل:

| محرک                   | شناسه  | توضیح                                                    |
| ---------------------- | ------ | -------------------------------------------------------- |
| New Runtime Component  | DRV-01 | اضافه شدن مؤلفه جدید نیاز به Observation جدید دارد       |
| Scale Change           | DRV-02 | تغییر مقیاس Runtime نیاز به مدل نظارت جدید دارد          |
| Policy Change          | DRV-03 | تغییر سیاست نیاز به به‌روزرسانی MonitoringPolicy دارد    |
| Anomaly Pattern        | DRV-04 | الگوی ناهنجاری جدید نیاز به DiagnosticSignal جدید دارد   |
| Governance Requirement | DRV-05 | نیاز جدید حکمرانی نیاز به MonitoringConstraint جدید دارد |

---

## ۲۰. Monitoring Pattern Catalog — کاتالوگ الگوهای نظارت

۵ الگوی اصلی نظارت:

| شناسه  | الگو                   | توضیح                                | مدل مرتبط               |
| ------ | ---------------------- | ------------------------------------ | ----------------------- |
| PAT-01 | **Health Probe**       | بررسی دوره‌ای سلامت یک مؤلفه         | RMM-02 (Active)         |
| PAT-02 | **Telemetry Pipeline** | جمع‌آوری و انتقال داده‌های تله‌متری  | RMM-01 (Passive)        |
| PAT-03 | **Event Correlation**  | همبستگی رویدادها برای تشخیص ناهنجاری | RMM-05 (Event-Oriented) |
| PAT-04 | **State Observer**     | نظارت بر تغییر وضعیت و واکنش به آن   | RMM-06 (State-Oriented) |
| PAT-05 | **Composite Monitor**  | ترکیب چند الگوی نظارت برای پوشش کامل | RMM-08 (Hybrid)         |

---

## ۲۱. Monitoring Mapping — نگاشت نظارت

### نگاشت بین دامنه‌های نظارت و سایر معماری‌های RT

| معماری                | RT-007 (نظارت)                 | نوع نگاشت                                                  |
| --------------------- | ------------------------------ | ---------------------------------------------------------- |
| RT-001 (Foundation)   | RMCAP-001..014 (قابلیت‌ها)     | تخصصی‌سازی — از قابلیت‌های پایه RT-001 مشتق شده            |
| RT-002 (Execution)    | RMD-01 (Runtime Health)        | ارتباط — سلامت اجرا از وضعیت اجرا مشتق می‌شود              |
| RT-003 (Context)      | RME-004 (ObservationPoint)     | تخصصی‌سازی — نقاط مشاهده در بافت Runtime قرار دارند        |
| RT-004 (Session)      | RME-007 (MonitoringSession)    | تخصصی‌سازی — نشست نظارت از نشست Runtime مشتق شده           |
| RT-005 (State)        | RMS-01..08 (Monitoring States) | تخصصی‌سازی — وضعیت‌های نظارت از وضعیت‌های Runtime مشتق شده |
| RT-006 (Coordination) | RMD-06 (Governance)            | ارتباط — حکمرانی نظارت با هماهنگی Runtime مرتبط است        |

---

## ۲۲. Cross-Domain Monitoring Mapping — نگاشت بین‌دامنه‌ای نظارت

### نگاشت بین دامنه‌های نظارت

| دامنه مبدأ           | دامنه مقصد            | نوع نگاشت | توضیح                                     |
| -------------------- | --------------------- | --------- | ----------------------------------------- |
| RMD-01 (Health)      | RMD-02 (Telemetry)    | Direct    | سلامت از داده‌های تله‌متری استخراج می‌شود |
| RMD-01 (Health)      | RMD-04 (Diagnostics)  | Composite | تشخیص از ارزیابی سلامت استفاده می‌کند     |
| RMD-02 (Telemetry)   | RMD-03 (Observation)  | Direct    | تله‌متری ورودی مشاهده است                 |
| RMD-03 (Observation) | RMD-04 (Diagnostics)  | Direct    | مشاهده مبنای تشخیص است                    |
| RMD-03 (Observation) | RMD-05 (Visibility)   | Direct    | مشاهده قابلیت دید فراهم می‌کند            |
| RMD-04 (Diagnostics) | RMD-07 (Intelligence) | Composite | تشخیص به بینش عملیاتی تبدیل می‌شود        |
| RMD-05 (Visibility)  | RMD-07 (Intelligence) | Direct    | دید فراهم‌شده مبنای بینش است              |
| RMD-06 (Governance)  | RMD-01..RMD-08        | Universal | حکمرانی بر همه دامنه‌ها اعمال می‌شود      |
| RMD-08 (Evolution)   | RMD-01 (Health)       | Composite | تکامل نیاز به ارزیابی سلامت فعلی دارد     |
| RMD-08 (Evolution)   | RMD-06 (Governance)   | Direct    | تکامل تحت حکمرانی است                     |

---

## ۲۳. Monitoring Maturity Model — مدل بلوغ نظارت

۵ سطح بلوغ نظارت زمان اجرا:

| سطح  | نام             | توضیح                                  | معیار                                              |
| ---- | --------------- | -------------------------------------- | -------------------------------------------------- |
| M-01 | **Ad Hoc**      | نظارت موردی و بدون ساختار مشخص         | بدون مدل نظارت تعریف‌شده                           |
| M-02 | **Defined**     | نظارت با مدل مشخص اما بدون حکمرانی     | مدل‌ها تعریف شده‌اند اما سیاستی وجود ندارد         |
| M-03 | **Governed**    | نظارت تحت حکمرانی و سیاست              | همه MonitoringSession دارای MonitoringPolicy هستند |
| M-04 | **Intelligent** | نظارت با بینش عملیاتی و تشخیص خودکار   | Operational Insight از داده‌های نظارت تولید می‌شود |
| M-05 | **Evolving**    | نظارت با تکامل کنترل‌شده و بهبود مستمر | تکامل نظارت خودکار و تحت حکمرانی است               |

---

## ۲۴. Monitoring Metrics — معیارهای نظارت

۱۵ معیار اصلی نظارت:

| شناسه     | معیار                            | توضیح                                  | دامنه  |
| --------- | -------------------------------- | -------------------------------------- | ------ |
| RMMTR-001 | **Total Monitoring Definitions** | تعداد کل نظارت‌های تعریف‌شده           | RMD-01 |
| RMMTR-002 | **Active Monitoring Sessions**   | تعداد نشست‌های نظارت فعال              | RMD-05 |
| RMMTR-003 | **Observation Count**            | تعداد مشاهده‌های انجام‌شده             | RMD-03 |
| RMMTR-004 | **Observation Success Rate**     | درصد موفقیت مشاهده‌ها                  | RMD-03 |
| RMMTR-005 | **Telemetry Collection Rate**    | نرخ جمع‌آوری داده‌های تله‌متری         | RMD-02 |
| RMMTR-006 | **Telemetry Latency**            | میانگین تأخیر انتقال داده‌های تله‌متری | RMD-02 |
| RMMTR-007 | **Anomaly Detection Rate**       | درصد تشخیص ناهنجاری‌ها                 | RMD-04 |
| RMMTR-008 | **False Positive Rate**          | درصد هشدارهای نادرست                   | RMD-04 |
| RMMTR-009 | **Health Check Coverage**        | درصد پوشش Health Check                 | RMD-01 |
| RMMTR-010 | **Visibility Coverage**          | درصد پوشش قابلیت مشاهده                | RMD-05 |
| RMMTR-011 | **Policy Compliance Rate**       | درصد انطباق با سیاست‌های نظارت         | RMD-06 |
| RMMTR-012 | **Report Generation Time**       | میانگین زمان تولید گزارش               | RMD-07 |
| RMMTR-013 | **Insight Accuracy**             | دقت بینش‌های عملیاتی تولیدشده          | RMD-07 |
| RMMTR-014 | **Evolution Frequency**          | تعداد تکامل‌های معماری نظارت           | RMD-08 |
| RMMTR-015 | **Audit Completeness**           | درصد پوشش حسابرسی نظارت                | RMD-06 |

---

## ۲۵. Monitoring Validation — اعتبارسنجی نظارت

اعتبارسنجی نظارت بر ۴ گام انجام می‌شود:

| گام  | نام                       | توضیح                                                     | خروجی                |
| ---- | ------------------------- | --------------------------------------------------------- | -------------------- |
| V-01 | **Structural Validation** | اعتبارسنجی ساختاری — بررسی ساختار و قالب MonitoringRecord | Validated Structure  |
| V-02 | **Temporal Validation**   | اعتبارسنجی زمانی — بررسی ترتیب و برچسب‌های زمانی          | Validated Timeline   |
| V-03 | **Threshold Validation**  | اعتبارسنجی آستانه — بررسی صحت ThresholdDefinition         | Validated Threshold  |
| V-04 | **Governance Validation** | اعتبارسنجی حکمرانی — بررسی انطباق با MonitoringPolicy     | Validated Governance |

---

## ۲۶. Integration with RT Family — یکپارچگی با خانواده RT

### وابستگی به RT-001 (Foundation)

| RT-001 Concept                | استفاده در RT-007                  |
| ----------------------------- | ---------------------------------- |
| RTC-012 (Runtime Observation) | پایه مفهوم نظارت — RMC-001         |
| RTD-07 (Observation Domain)   | گسترش به ۸ دامنه RMD-01..08        |
| RTS-01..08 (Runtime States)   | تخصصی‌سازی به وضعیت‌های RMS-01..08 |
| RTF-07 (Observe)              | گسترش به ۱۴ کارکرد RMF-01..14      |
| RTM-07 (Observation Model)    | تخصصی‌سازی به RMM-01..08           |

### وابستگی به RT-002 (Execution)

| RT-002 Concept            | استفاده در RT-007         |
| ------------------------- | ------------------------- |
| REC-007 (Execution State) | وضعیت RMS-03 (Monitoring) |
| RED-06 (Monitoring)       | دامنه RMD-05 (Visibility) |
| REST-05 (Observe)         | مرحله RMST-04 (Observe)   |

### وابستگی به RT-003 (Context)

| RT-003 Concept            | استفاده در RT-007                       |
| ------------------------- | --------------------------------------- |
| RCC-003 (Runtime Context) | بافت نظارت — RME-004 (ObservationPoint) |
| RCD-01 (Acquisition)      | دامنه RMD-02 (Telemetry)                |
| RCM-07 (Observation)      | مدل RMM-01 (Passive)                    |

### وابستگی به RT-004 (Session)

| RT-004 Concept             | استفاده در RT-007                   |
| -------------------------- | ----------------------------------- |
| RSC-001 (Session Identity) | موجودیت RME-007 (MonitoringSession) |
| RSD-02 (Lifecycle)         | دامنه RMD-05 (Visibility)           |
| RSM-06 (System)            | مدل RMM-03 (Continuous)             |

### وابستگی به RT-005 (State)

| RT-005 Concept                   | استفاده در RT-007               |
| -------------------------------- | ------------------------------- |
| RSTD-03 (State Observation)      | دامنه RMD-03 (Observation)      |
| RSTS-01..08 (State Classes)      | کلاس‌های وضعیت نظارت RMS-01..08 |
| RSTCR-01..12 (Consistency Rules) | الگوبرداری برای RMCR-01..12     |

### وابستگی به RT-006 (Coordination)

| RT-006 Concept                   | استفاده در RT-007                    |
| -------------------------------- | ------------------------------------ |
| RCOC-014 (Coordination State)    | وضعیت RMS-03 (Monitoring) در هماهنگی |
| RCOD-05 (Governance)             | دامنه RMD-06 (Governance)            |
| RCOCR-01..12 (Consistency Rules) | الگوبرداری برای RMCR-01..12          |

---

## ۲۷. Machine Readable JSON Blocks

### Block 1 — Monitoring Concepts

```json
{
  "$schema": "RT-007-concept-registry",
  "monitoring_concepts": [
    { "id": "RMC-001", "name": "Runtime Monitoring", "domain": "RMD-01" },
    { "id": "RMC-002", "name": "Health Status", "domain": "RMD-01" },
    { "id": "RMC-003", "name": "Telemetry Data", "domain": "RMD-02" },
    { "id": "RMC-004", "name": "Observation Point", "domain": "RMD-03" },
    { "id": "RMC-005", "name": "Diagnostic Signal", "domain": "RMD-04" },
    { "id": "RMC-006", "name": "Anomaly Indicator", "domain": "RMD-04" },
    { "id": "RMC-007", "name": "Visibility Scope", "domain": "RMD-05" },
    { "id": "RMC-008", "name": "Monitoring Policy", "domain": "RMD-06" },
    { "id": "RMC-009", "name": "Operational Insight", "domain": "RMD-07" },
    { "id": "RMC-010", "name": "Monitoring Record", "domain": "RMD-03" },
    { "id": "RMC-011", "name": "Health Check", "domain": "RMD-01" },
    { "id": "RMC-012", "name": "Metric Definition", "domain": "RMD-02" },
    { "id": "RMC-013", "name": "Threshold", "domain": "RMD-04" },
    { "id": "RMC-014", "name": "Alert Condition", "domain": "RMD-04" },
    { "id": "RMC-015", "name": "Observation Window", "domain": "RMD-03" },
    { "id": "RMC-016", "name": "Monitoring Session", "domain": "RMD-05" },
    { "id": "RMC-017", "name": "Monitoring Report", "domain": "RMD-07" },
    { "id": "RMC-018", "name": "Monitoring Rule", "domain": "RMD-06" },
    { "id": "RMC-019", "name": "Monitoring Model", "domain": "RMD-01" },
    { "id": "RMC-020", "name": "Monitoring Evolution", "domain": "RMD-08" }
  ]
}
```

### Block 2 — Monitoring Entities

```json
{
  "$schema": "RT-007-entity-registry",
  "monitoring_entities": [
    { "id": "RME-001", "name": "MonitoringRecord", "domain": "RMD-03", "type": "Core" },
    { "id": "RME-002", "name": "HealthIndicator", "domain": "RMD-01", "type": "Core" },
    { "id": "RME-003", "name": "TelemetryStream", "domain": "RMD-02", "type": "Core" },
    { "id": "RME-004", "name": "ObservationPoint", "domain": "RMD-03", "type": "Core" },
    { "id": "RME-005", "name": "DiagnosticSignal", "domain": "RMD-04", "type": "Core" },
    { "id": "RME-006", "name": "MonitoringPolicy", "domain": "RMD-06", "type": "Governance" },
    { "id": "RME-007", "name": "MonitoringSession", "domain": "RMD-05", "type": "Operational" },
    { "id": "RME-008", "name": "MonitoringReport", "domain": "RMD-07", "type": "Operational" },
    { "id": "RME-009", "name": "AlertCondition", "domain": "RMD-04", "type": "Operational" },
    { "id": "RME-010", "name": "ThresholdDefinition", "domain": "RMD-04", "type": "Core" },
    { "id": "RME-011", "name": "VisibilityScope", "domain": "RMD-05", "type": "Governance" },
    { "id": "RME-012", "name": "MonitoringRegistry", "domain": "RMD-06", "type": "Operational" }
  ]
}
```

### Block 3 — Monitoring Capabilities

```json
{
  "$schema": "RT-007-capability-registry",
  "monitoring_capabilities": [
    { "id": "RMCAP-001", "name": "Health Assessment", "domain": "RMD-01" },
    { "id": "RMCAP-002", "name": "Status Determination", "domain": "RMD-01" },
    { "id": "RMCAP-003", "name": "Telemetry Collection", "domain": "RMD-02" },
    { "id": "RMCAP-004", "name": "Telemetry Transmission", "domain": "RMD-02" },
    { "id": "RMCAP-005", "name": "Observation Recording", "domain": "RMD-03" },
    { "id": "RMCAP-006", "name": "Observation Correlation", "domain": "RMD-03" },
    { "id": "RMCAP-007", "name": "Signal Detection", "domain": "RMD-04" },
    { "id": "RMCAP-008", "name": "Anomaly Identification", "domain": "RMD-04" },
    { "id": "RMCAP-009", "name": "Visibility Provision", "domain": "RMD-05" },
    { "id": "RMCAP-010", "name": "Insight Generation", "domain": "RMD-07" },
    { "id": "RMCAP-011", "name": "Policy Enforcement", "domain": "RMD-06" },
    { "id": "RMCAP-012", "name": "Report Generation", "domain": "RMD-07" },
    { "id": "RMCAP-013", "name": "Evolution Management", "domain": "RMD-08" },
    { "id": "RMCAP-014", "name": "Governance Compliance", "domain": "RMD-06" }
  ]
}
```

### Block 4 — Monitoring Functions

```json
{
  "$schema": "RT-007-function-registry",
  "monitoring_functions": [
    { "id": "RMF-01", "name": "Assess Health", "capability": "RMCAP-001", "domain": "RMD-01" },
    { "id": "RMF-02", "name": "Determine Status", "capability": "RMCAP-002", "domain": "RMD-01" },
    { "id": "RMF-03", "name": "Collect Telemetry", "capability": "RMCAP-003", "domain": "RMD-02" },
    { "id": "RMF-04", "name": "Transmit Telemetry", "capability": "RMCAP-004", "domain": "RMD-02" },
    { "id": "RMF-05", "name": "Record Observation", "capability": "RMCAP-005", "domain": "RMD-03" },
    {
      "id": "RMF-06",
      "name": "Correlate Observations",
      "capability": "RMCAP-006",
      "domain": "RMD-03"
    },
    { "id": "RMF-07", "name": "Detect Signal", "capability": "RMCAP-007", "domain": "RMD-04" },
    { "id": "RMF-08", "name": "Identify Anomaly", "capability": "RMCAP-008", "domain": "RMD-04" },
    { "id": "RMF-09", "name": "Provide Visibility", "capability": "RMCAP-009", "domain": "RMD-05" },
    { "id": "RMF-10", "name": "Generate Insight", "capability": "RMCAP-010", "domain": "RMD-07" },
    { "id": "RMF-11", "name": "Enforce Policy", "capability": "RMCAP-011", "domain": "RMD-06" },
    { "id": "RMF-12", "name": "Generate Report", "capability": "RMCAP-012", "domain": "RMD-07" },
    { "id": "RMF-13", "name": "Manage Evolution", "capability": "RMCAP-013", "domain": "RMD-08" },
    { "id": "RMF-14", "name": "Ensure Compliance", "capability": "RMCAP-014", "domain": "RMD-06" }
  ]
}
```

### Block 5 — Monitoring States

```json
{
  "$schema": "RT-007-state-registry",
  "monitoring_states": [
    { "id": "RMS-01", "name": "Defined", "class": "initial", "domain": "RMD-01" },
    { "id": "RMS-02", "name": "Registered", "class": "intermediate", "domain": "RMD-06" },
    { "id": "RMS-03", "name": "Monitoring", "class": "stable", "domain": "RMD-03" },
    { "id": "RMS-04", "name": "Evaluating", "class": "transitional", "domain": "RMD-04" },
    { "id": "RMS-05", "name": "Reporting", "class": "stable", "domain": "RMD-07" },
    { "id": "RMS-06", "name": "Suspended", "class": "suspended", "domain": "RMD-05" },
    { "id": "RMS-07", "name": "Completed", "class": "terminal", "domain": "RMD-01" },
    { "id": "RMS-08", "name": "Archived", "class": "archived", "domain": "RMD-08" }
  ],
  "total_states": 8,
  "total_allowed_transitions": 20
}
```

### Block 6 — Monitoring Models

```json
{
  "$schema": "RT-007-model-registry",
  "monitoring_models": [
    { "id": "RMM-01", "name": "Passive", "domain": "RMD-03", "consumers": ["AI-010", "AI-011"] },
    { "id": "RMM-02", "name": "Active", "domain": "RMD-01", "consumers": ["AI-010", "AI-012"] },
    { "id": "RMM-03", "name": "Continuous", "domain": "RMD-01", "consumers": ["AI-010", "AI-014"] },
    { "id": "RMM-04", "name": "Periodic", "domain": "RMD-01", "consumers": ["AI-010"] },
    {
      "id": "RMM-05",
      "name": "Event-Oriented",
      "domain": "RMD-03",
      "consumers": ["AI-009", "AI-010"]
    },
    {
      "id": "RMM-06",
      "name": "State-Oriented",
      "domain": "RMD-03",
      "consumers": ["AI-010", "AI-012"]
    },
    {
      "id": "RMM-07",
      "name": "Policy-Oriented",
      "domain": "RMD-06",
      "consumers": ["AI-004", "AI-011"]
    },
    { "id": "RMM-08", "name": "Hybrid", "domain": "RMD-01", "consumers": ["AI-014"] }
  ],
  "total_models": 8
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Monitoring Record Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-007-monitoring-record",
  "title": "Monitoring Record Schema",
  "description": "Schema for a monitoring record in the Enterprise Runtime Monitoring Architecture",
  "type": "object",
  "properties": {
    "record_id": {
      "type": "string",
      "description": "شناسه یکتای رکورد نظارت",
      "pattern": "^RM-[0-9]{12}-[A-Z0-9]{8}$"
    },
    "monitoring_domain": {
      "type": "string",
      "description": "دامنه نظارت",
      "enum": ["RMD-01", "RMD-02", "RMD-03", "RMD-04", "RMD-05", "RMD-06", "RMD-07", "RMD-08"]
    },
    "monitoring_state": {
      "type": "string",
      "description": "وضعیت نظارت",
      "enum": [
        "defined",
        "registered",
        "monitoring",
        "evaluating",
        "reporting",
        "suspended",
        "completed",
        "archived"
      ]
    },
    "monitoring_model": {
      "type": "string",
      "description": "مدل نظارت",
      "enum": [
        "passive",
        "active",
        "continuous",
        "periodic",
        "event_oriented",
        "state_oriented",
        "policy_oriented",
        "hybrid"
      ]
    },
    "session_id": {
      "type": "string",
      "description": "شناسه نشست نظارت"
    },
    "observation_points": {
      "type": "array",
      "description": "نقاط مشاهده مرتبط",
      "items": {
        "type": "object",
        "properties": {
          "point_id": { "type": "string" },
          "domain": { "type": "string" },
          "status": { "type": "string", "enum": ["active", "inactive", "degraded"] }
        }
      }
    },
    "health_indicators": {
      "type": "array",
      "description": "نشانگرهای سلامت",
      "items": {
        "type": "object",
        "properties": {
          "indicator_id": { "type": "string" },
          "value": { "type": "string" },
          "status": { "type": "string", "enum": ["healthy", "degraded", "critical", "unknown"] },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    },
    "observation_data": {
      "type": "array",
      "description": "داده‌های مشاهده",
      "items": {
        "type": "object",
        "properties": {
          "timestamp": { "type": "string", "format": "date-time" },
          "metric": { "type": "string" },
          "value": { "type": "string" }
        }
      }
    },
    "state_history": {
      "type": "array",
      "description": "تاریخچه وضعیت‌ها",
      "items": {
        "type": "object",
        "properties": {
          "state": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" },
          "trigger": { "type": "string" }
        }
      }
    },
    "owner": {
      "type": "string",
      "description": "مالک نظارت"
    },
    "created_at": {
      "type": "string",
      "description": "زمان ایجاد",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "description": "آخرین به‌روزرسانی",
      "format": "date-time"
    }
  },
  "required": ["record_id", "monitoring_domain", "monitoring_state", "session_id", "owner"]
}
```

### Schema 2 — Health Indicator Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-007-health-indicator",
  "title": "Health Indicator Schema",
  "description": "Schema for a health indicator in the Enterprise Runtime Monitoring Architecture",
  "type": "object",
  "properties": {
    "indicator_id": {
      "type": "string",
      "description": "شناسه یکتای نشانگر سلامت"
    },
    "record_id": {
      "type": "string",
      "description": "شناسه رکورد نظارت مرتبط"
    },
    "component_id": {
      "type": "string",
      "description": "شناسه مؤلفه تحت نظارت"
    },
    "status": {
      "type": "string",
      "description": "وضعیت سلامت",
      "enum": ["healthy", "degraded", "critical", "unknown", "not_monitored"]
    },
    "thresholds": {
      "type": "array",
      "description": "آستانه‌های سلامت",
      "items": {
        "type": "object",
        "properties": {
          "threshold_id": { "type": "string" },
          "metric": { "type": "string" },
          "warning_value": { "type": "string" },
          "critical_value": { "type": "string" },
          "direction": { "type": "string", "enum": ["above", "below", "equal", "outside"] }
        }
      }
    },
    "last_check": {
      "type": "string",
      "description": "آخرین زمان بررسی سلامت",
      "format": "date-time"
    },
    "check_frequency_seconds": {
      "type": "integer",
      "description": "فرکانس بررسی سلامت (ثانیه)"
    },
    "diagnostic_signals": {
      "type": "array",
      "description": "سیگنال‌های تشخیصی فعال",
      "items": {
        "type": "object",
        "properties": {
          "signal_id": { "type": "string" },
          "type": { "type": "string", "enum": ["anomaly", "warning", "error", "info"] },
          "detected_at": { "type": "string", "format": "date-time" }
        }
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["indicator_id", "record_id", "component_id", "status", "last_check"]
}
```

### Schema 3 — Monitoring Session Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "RT-007-monitoring-session",
  "title": "Monitoring Session Schema",
  "description": "Schema for a monitoring session in the Enterprise Runtime Monitoring Architecture",
  "type": "object",
  "properties": {
    "session_id": {
      "type": "string",
      "description": "شناسه یکتای نشست نظارت"
    },
    "monitoring_domain": {
      "type": "string",
      "description": "دامنه نظارت",
      "enum": ["RMD-01", "RMD-02", "RMD-03", "RMD-04", "RMD-05", "RMD-06", "RMD-07", "RMD-08"]
    },
    "monitoring_model": {
      "type": "string",
      "description": "مدل نظارت",
      "enum": [
        "passive",
        "active",
        "continuous",
        "periodic",
        "event_oriented",
        "state_oriented",
        "policy_oriented",
        "hybrid"
      ]
    },
    "session_state": {
      "type": "string",
      "description": "وضعیت نشست نظارت",
      "enum": [
        "defined",
        "registered",
        "monitoring",
        "evaluating",
        "reporting",
        "suspended",
        "completed",
        "archived"
      ]
    },
    "scope": {
      "type": "object",
      "description": "حوزه نظارت",
      "properties": {
        "visibility_scope_id": { "type": "string" },
        "observation_points": { "type": "array", "items": { "type": "string" } },
        "target_components": { "type": "array", "items": { "type": "string" } }
      }
    },
    "policy": {
      "type": "object",
      "description": "سیاست نظارت",
      "properties": {
        "policy_id": { "type": "string" },
        "data_retention_days": { "type": "integer" },
        "observation_frequency_seconds": { "type": "integer" },
        "alert_escalation_path": { "type": "array", "items": { "type": "string" } }
      }
    },
    "observation_count": {
      "type": "integer",
      "description": "تعداد مشاهده‌های انجام‌شده"
    },
    "health_status": {
      "type": "string",
      "description": "وضعیت سلامت کلی",
      "enum": ["healthy", "degraded", "critical", "unknown"]
    },
    "owner": {
      "type": "string",
      "description": "مالک نشست نظارت"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "completed_at": {
      "type": "string",
      "format": "date-time"
    },
    "state_history": {
      "type": "array",
      "description": "تاریخچه وضعیت‌های نشست",
      "items": {
        "type": "object",
        "properties": {
          "state": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" },
          "trigger": { "type": "string" }
        }
      }
    }
  },
  "required": ["session_id", "monitoring_domain", "session_state", "scope", "owner", "created_at"]
}
```

---

## ۲۹. Monitoring Quality Gates — گیت‌های کیفیت نظارت

۷ گیت کیفیت نظارت:

| ID      | گیت                         | مرحله   | معیار عبور                                                     |
| ------- | --------------------------- | ------- | -------------------------------------------------------------- |
| RMQG-01 | **Definition Completeness** | RMST-01 | نظارت دارای تعریف رسمی، دامنه و مدل معتبر است                  |
| RMQG-02 | **Registration Validity**   | RMST-02 | مؤلفه نظارت در رجیستری ثبت و دارای شناسه یکتا است              |
| RMQG-03 | **Configuration Integrity** | RMST-03 | پیکربندی شامل ThresholdDefinition و ObservationPoint معتبر است |
| RMQG-04 | **Observation Accuracy**    | RMST-04 | داده‌های مشاهده دارای برچسب زمانی و ساختار صحیح هستند          |
| RMQG-05 | **Evaluation Completeness** | RMST-05 | همه داده‌های مشاهده ارزیابی و ناهنجاری‌ها تشخیص داده شده‌اند   |
| RMQG-06 | **Report Integrity**        | RMST-06 | گزارش نظارت کامل، معتبر و قابل حسابرسی است                     |
| RMQG-07 | **Archival Auditability**   | RMST-07 | بایگانی نظارت ثبت، حسابرسی و قابل بازگشت است                   |

---

## ۳۰. Cross-Domain Integration Summary — خلاصه یکپارچگی بین‌دامنه‌ای

### نگاشت بین دامنه نظارت و سایر معماری‌های Runtime

| معماری                | RT-007 (نظارت)                 | نوع نگاشت                                            |
| --------------------- | ------------------------------ | ---------------------------------------------------- |
| RT-001 (Foundation)   | RMM-01 (Passive)               | تخصصی‌سازی — نظارت غیرفعال از RTC-012 مشتق شده       |
| RT-002 (Execution)    | RMM-02 (Active)                | تخصصی‌سازی — نظارت فعال از REC-007 مشتق شده          |
| RT-003 (Context)      | RME-004 (ObservationPoint)     | تخصصی‌سازی — نقاط مشاهده در بافت Runtime قرار دارند  |
| RT-004 (Session)      | RME-007 (MonitoringSession)    | تخصصی‌سازی — نشست نظارت از RSC-001 مشتق شده          |
| RT-005 (State)        | RMS-01..08 (Monitoring States) | تخصصی‌سازی — وضعیت‌های نظارت از RSTS-01..08 مشتق شده |
| RT-006 (Coordination) | RMD-06 (Governance)            | ارتباط — حکمرانی نظارت با هماهنگی Runtime مرتبط است  |

### نگاشت کامل RT-001..RT-006 به RT-007

| RT-۰۰۱/۰۰۲/۰۰۳/۰۰۴/۰۰۵/۰۰۶       | RT-007 (اختصاصی نظارت)         | نوع نگاشت                                                  |
| -------------------------------- | ------------------------------ | ---------------------------------------------------------- |
| RTD-07 (Observation)             | RMD-01..RMD-08                 | تخصصی‌سازی — دامنه Observation به ۸ دامنه تخصصی تبدیل شده  |
| RTC-012 (Runtime Observation)    | RMC-001..RMC-020               | گسترش — یک مفهوم Observation به ۲۰ مفهوم تخصصی             |
| RTE-008 (Observation)            | RME-001..RME-012               | تخصصی‌سازی                                                 |
| RTF-07 (Observe)                 | RMF-01..14                     | گسترش — یک کارکرد به ۱۴ کارکرد تخصصی                       |
| RTS-01..08 (Runtime States)      | RMS-01..08 (Monitoring States) | تخصصی‌سازی — وضعیت‌های Runtime در حوزه نظارت               |
| RSTD-03 (State Observation)      | RMD-03 (Observation)           | ارتباط — مشاهده وضعیت با نظارت مرتبط است                   |
| RSTS-01..08 (State Classes)      | RMS-01..08 (Monitoring States) | نگاشت مستقیم                                               |
| RSTCR-01..12                     | RMCR-01..12                    | الگوبرداری — قواعد سازگاری وضعیت برای نظارت انطباق یافته   |
| RCOD-05 (Governance)             | RMD-06 (Governance)            | ارتباط — حکمرانی نظارت با حکمرانی هماهنگی مرتبط است        |
| RCOCR-01..12 (Consistency Rules) | RMCR-01..12                    | الگوبرداری — قواعد سازگاری هماهنگی برای نظارت انطباق یافته |

### نگاشت به RT-001، RT-002، RT-003، RT-004، RT-005 و RT-006

| RT-۰۰۱ تا RT-۰۰۶              | RT-007 (اختصاصی نظارت)         | نوع نگاشت                                                 |
| ----------------------------- | ------------------------------ | --------------------------------------------------------- |
| RTD-07 (Observation)          | RMD-01..RMD-08                 | تخصصی‌سازی — دامنه Observation به ۸ دامنه تخصصی تبدیل شده |
| RTE-008 (Observation)         | RME-001..RME-012               | تخصصی‌سازی                                                |
| RTS-01..08 (Runtime States)   | RMS-01..08 (Monitoring States) | تخصصی‌سازی                                                |
| RES-01..08                    | RMS-01..08                     | نگاشت غیرمستقیم از طریق وضعیت‌های RT-005                  |
| RCS-01..08                    | RMS-01..08                     | نگاشت غیرمستقیم از طریق وضعیت‌های RT-005                  |
| RSS-01..08                    | RMS-01..08                     | نگاشت غیرمستقیم از طریق وضعیت‌های RT-005                  |
| RCOS-01..08                   | RMS-01..08                     | نگاشت غیرمستقیم از طریق وضعیت‌های RT-005                  |
| RTC-012 (Runtime Observation) | RMM-01..RMM-08                 | تخصصی‌سازی — یک مفهوم Observation به ۸ مدل گسترش یافته    |
| RTF-07 (Observe)              | RMF-01..14                     | گسترش — یک کارکرد به ۱۴ کارکرد تخصصی                      |
| RTE-007 (Context)             | RME-004 (ObservationPoint)     | ارتباط — بافت برای نقاط مشاهده استفاده می‌شود             |
| RSTD-03 (State Observation)   | RMD-03 (Observation)           | ارتباط — مشاهده وضعیت زیرمجموعه نظارت است                 |
| RCOD-05 (Governance)          | RMD-06 (Governance)            | ارتباط — حکمرانی در هر دو معماری وجود دارد                |

---

> **پایان RT-007 — Enterprise Runtime Monitoring Architecture**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۱۲
