# Enterprise Automation Architecture — معماری خودکارسازی سازمانی SMOS

> **شناسه:** AUT-000
> **وضعیت:** معماری
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-27
> **مسئول:** معمار سیستم
> **وابستگی:** [CON-000](../05-CONSTITUTION/00-constitution.md), [ARCH-010](../00-ARCHITECTURE/10-meta-architecture.md), [ARCH-011](../00-ARCHITECTURE/11-object-model.md), [ARCH-013](../00-ARCHITECTURE/13-ai-operating-model.md), [ARCH-014](../00-ARCHITECTURE/14-automation-model.md), [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md), [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md), [GOV-001](../10-GOVERNANCE/01-documentation-standards.md), [GOV-002](../10-GOVERNANCE/02-versioning.md), [GOV-003](../10-GOVERNANCE/03-naming-conventions.md), [GOV-004](../10-GOVERNANCE/04-cross-references.md), [GOV-005](../10-GOVERNANCE/05-metadata.md), [AI-000](../40-AI-AGENTS/00-enterprise-ai-agent-architecture.md), [AUT-001](../30-AUTOMATION/00-automation-index.md)
> **مخاطب:** معمار سیستم, Automator, AI Agent, n8n, MCP

---

## Executive Summary

AUT-000 معماری مادر خودکارسازی سازمانی SMOS است. این سند تعریف می‌کند که Automation چیست، چه اصولی حاکم بر آن است، چه مدل‌هایی ساختار آن را شکل می‌دهند، و چگونه Automation با AI و Human تعامل می‌کند. تمام AUT-001 تا AUT-999 از این سند مشتق می‌شوند. AUT-000 فاقد هرگونه جزئیات پیاده‌سازی، کد، API یا ارجاع به فناوری خاص است.

AUT-000 معماری را تعریف می‌کند — AUT-001 نمایه را نگه می‌دارد — AUT-NNN پیاده‌سازی می‌کند.

---

## Purpose

### Why AUT-000 Exists

SMOS یک سیستم عامل محتوای سازمانی با ده‌ها فرایند خودکار است. بدون معماری مادر:

- هر AUT-\* از ساختار متفاوتی پیروی می‌کند
- Trigger, Event, State, Queue مدل مشترکی ندارند
- خطاها و Failure Recovery بدون استاندارد باقی می‌مانند
- تعامل Automation ↔ AI بدون چارچوب است
- مقیاس‌پذیری با افزایش Workflowها از بین می‌رود

AUT-000 این شکاف را با تعریف یک **معماری خودکارسازی لایه‌ای** پر می‌کند که همه AUT-\*ها از آن مشتق می‌شوند.

### Relationship to Other Documents

| سند                                                              | رابطه   | دلیل                                                      |
| ---------------------------------------------------------------- | ------- | --------------------------------------------------------- |
| [ARCH-014](../00-ARCHITECTURE/14-automation-model.md)            | parent  | مدل خودکارسازی در معماری سیستم — AUT-000 جزئی‌تر است      |
| [AUT-001](../30-AUTOMATION/00-automation-index.md)               | derived | نمایه خودکارسازی — از AUT-000 مشتق می‌شود                 |
| [AI-000](../40-AI-AGENTS/00-enterprise-ai-agent-architecture.md) | peer    | معماری Agentها — Automation اجرا می‌کند، AI تصمیم می‌گیرد |
| [AUT-002](../30-AUTOMATION/)                                     | derived | Workflowهای اختصاصی — از AUT-000 مشتق می‌شوند             |

---

## Scope

### In Scope

AUT-000 مالک تعریف معماری موارد زیر است:

- اصول و فلسفه خودکارسازی سازمانی
- لایه‌های معماری خودکارسازی (۵ لایه)
- تاکسونومی Workflow (خانواده‌ها، انواع، سطوح)
- مدل Identity Workflow
- مدل چرخه حیات Workflow
- مدل Trigger (محرک)
- مدل Event (رویداد)
- مدل State (وضعیت)
- مدل Queue (صف)
- مدل Scheduling (زمان‌بندی)
- مدل Execution (اجرا)
- مدل Retry (تلاش مجدد)
- مدل Failure Recovery (بازیابی خطا)
- مدل Compensation (جبران)
- مدل Human Interaction (تعامل انسان)
- مدل AI Collaboration (همکاری با Agent)
- مدل Governance (حکمرانی)
- مدل Security (امنیت)
- مدل Audit & Traceability (حسابرسی)
- مدل Metrics (شاخص‌ها)
- Validation Rules
- Quality Gates
- JSON Blocks & Schemas

### Out of Scope

AUT-000 هرگز شامل موارد زیر نیست:

- پیاده‌سازی n8n, Make, Temporal, Airflow, LangGraph, یا هر پلتفرم خودکارسازی
- کد، اسکریپت، Node یا Workflow Diagram
- API Reference
- Credential Management
- Platform-specific logic
- محتوای عملیاتی Workflowها
- جزئیات پیاده‌سازی Agentها (حوزه AI-\*)

---

## Enterprise Automation Architecture

### جایگاه Automation در SMOS

```
┌────────────────────────────────────────────────────────────┐
│                      Human Layer                            │
│  Policy — Strategy — Governance — Final Approval           │
│  (CON-000, GOV-*, Human Operators)                         │
└──────────────────────────┬─────────────────────────────────┘
                           │ Policy & Approval
                           ▼
┌────────────────────────────────────────────────────────────┐
│                      AI Agent Layer                         │
│  Decision — Creation — Analysis — Knowledge                │
│  (AI-000 — AI-014)                                         │
└──────────────────────────┬─────────────────────────────────┘
                           │ Decision & Instruction
                           ▼
┌────────────────────────────────────────────────────────────┐
│              ╔══════════════════════════════════════╗       │
│              ║     AUTOMATION LAYER (AUT-000)       ║       │
│              ║  Execution — Coordination — Monitor   ║       │
│              ║  Event — State — Queue — Schedule     ║       │
│              ╚══════════════════════════════════════╝       │
├────────────────────────────────────────────────────────────┤
│  n8n · MCP · Scheduler · Queue · Webhook · Runtime         │
└──────────────────────────┬─────────────────────────────────┘
                           │ Execution
                           ▼
┌────────────────────────────────────────────────────────────┐
│                   Integration Layer                         │
│  Platform APIs · Database · External Services               │
└────────────────────────────────────────────────────────────┘
```

### لایه‌های معماری خودکارسازی

AUT-000 معماری خودکارسازی را در ۵ لایه تعریف می‌کند:

```
LYR-01: Automation Governance
        قواعد، استانداردها، مجوزها، حکمرانی Workflow

            ↓

LYR-02: Workflow Architecture
        مدل Identity, Lifecycle, Taxonomy, Trigger, Event, State

            ↓

LYR-03: Execution Model
        Queue, Schedule, Retry, Timeout, Failure, Compensation

            ↓

LYR-04: Events & States
        State Machine, Event Bus, State Persistence

            ↓

LYR-05: Runtime Infrastructure
        اجرا، نظارت، مقیاس‌پذیری (implementation-agnostic)
```

| لایه                  | شناسه  | مسئولیت                                       | مالک    |
| --------------------- | ------ | --------------------------------------------- | ------- |
| Governance            | LYR-01 | قواعد، استانداردها، مجوزها، چرخه حیات         | AUT-000 |
| Workflow Architecture | LYR-02 | Identity, Lifecycle, Taxonomy, Models         | AUT-000 |
| Execution Model       | LYR-03 | Queue, Schedule, Retry, Failure, Compensation | AUT-000 |
| Events & States       | LYR-04 | State Machine, Event Bus, State Transitions   | AUT-000 |
| Runtime               | LYR-05 | اجرا، نظارت، مقیاس‌پذیری                      | AUT-NNN |

---

## Design Principles

| ID        | اصل                             | توضیح                                                                     |
| --------- | ------------------------------- | ------------------------------------------------------------------------- |
| **AP-01** | **Separation of Concerns**      | Automation اجرا می‌کند، AI تصمیم می‌گیرد، Human سیاست می‌سازد             |
| **AP-02** | **Automation by Default**       | هر فرایند تکراری باید خودکار شود — مگر اینکه Human-in-the-Loop ضروری باشد |
| **AP-03** | **Idempotency**                 | هر Workflow باید قابل اجرای مجدد بدون عوارض جانبی باشد                    |
| **AP-04** | **Observability**               | هر Workflow قابل مشاهده، اندازه‌گیری و اشکال‌زدایی است                    |
| **AP-05** | **Graceful Degradation**        | خطا در یک Workflow کل سیستم را متوقف نمی‌کند                              |
| **AP-06** | **Fail Fast, Recover Smart**    | خطا زود تشخیص داده می‌شود، Recovery بر اساس نوع خطا انتخاب می‌شود         |
| **AP-07** | **Compensating Action**         | هر Write Action باید Compensating Action داشته باشد                       |
| **AP-08** | **Deterministic State**         | وضعیت هر Workflow در هر لحظه قابل تعیین است                               |
| **AP-09** | **Traceability**                | هر اقدام خودکار قابل ردیابی به Trigger و Context اولیه است                |
| **AP-10** | **No Silent Failure**           | هر خطا باید ثبت و اعلام شود — خطای خاموش ممنوع                            |
| **AP-11** | **Transactional Boundaries**    | هر Workflow مرز تراکنش مشخص دارد                                          |
| **AP-12** | **Human-in-the-Loop by Design** | نقاط تأیید انسانی در معماری تعریف می‌شوند، نه در پیاده‌سازی               |

---

## Workflow Taxonomy

### خانواده‌های Workflow

| شناسه        | خانواده              | توضیح                     | لایه   |
| ------------ | -------------------- | ------------------------- | ------ |
| **FAM-CORE** | Core Operations      | گردش کارهای هسته‌ای سیستم | LYR-03 |
| **FAM-PLAT** | Platform Operations  | عملیات مختص یک پلتفرم     | LYR-03 |
| **FAM-AI**   | AI Operations        | عملیات مربوط به Agentها   | LYR-02 |
| **FAM-KNW**  | Knowledge Operations | عملیات دانش               | LYR-03 |
| **FAM-REP**  | Reporting Operations | عملیات گزارش‌گیری         | LYR-03 |
| **FAM-SYS**  | System Operations    | عملیات سیستم              | LYR-04 |
| **FAM-SEC**  | Security Operations  | عملیات امنیتی             | LYR-01 |
| **FAM-DATA** | Data Operations      | عملیات داده               | LYR-03 |

### انواع Workflow

| نوع             | شناسه | توضیح                       | مثال                       |
| --------------- | ----- | --------------------------- | -------------------------- |
| **Pipeline**    | WT-01 | زنجیره‌ای از مراحل متوالی   | Content Pipeline           |
| **Fan-Out**     | WT-02 | یک ورودی به چند خروجی موازی | Cross-Platform Publishing  |
| **Fan-In**      | WT-03 | چند ورودی به یک خروجی       | Result Aggregation         |
| **Conditional** | WT-04 | مسیرهای مختلف بر اساس شرط   | Content Routing            |
| **Loop**        | WT-05 | تکرار تا تحقق شرط           | Retry until success        |
| **Saga**        | WT-06 | تراکنش توزیع‌شده با جبران   | Multi-Platform Publication |

### سطوح Criticality

| سطح          | شناسه | توضیح                                             |
| ------------ | ----- | ------------------------------------------------- |
| **Critical** | CR-01 | خرابی باعث توقف کسب‌وکار می‌شود — Recovery فوری   |
| **High**     | CR-02 | خرابی باعث اختلال عمده می‌شود — Recovery < ۱ ساعت |
| **Medium**   | CR-03 | خرابی باعث اختلال جزئی می‌شود — Recovery < ۴ ساعت |
| **Low**      | CR-04 | خرابی بدون تأثیر مستقیم — Recovery < ۲۴ ساعت      |

---

## Workflow Identity Model

هر Workflow در SMOS دارای یک شناسه یکتای جهانی است:

```
AUT-NNN-NNN
```

| بخش           | توضیح                          | مثال |
| ------------- | ------------------------------ | ---- |
| **AUT**       | Prefix ثابت همه Workflowها     | AUT  |
| **NNN** (اول) | شماره خانواده یا Workflow مادر | 001  |
| **NNN** (دوم) | شماره ترتیبی در خانواده        | 001  |

### فراداده اجباری هر Workflow

| فیلد            | نوع    | اجباری | توضیح                       |
| --------------- | ------ | ------ | --------------------------- |
| `id`            | string | yes    | شناسه یکتا (AUT-NNN-NNN)    |
| `name`          | string | yes    | نام کوتاه                   |
| `description`   | string | yes    | توضیح                       |
| `family`        | enum   | yes    | FAM-\*                      |
| `type`          | enum   | yes    | WT-\*                       |
| `criticality`   | enum   | yes    | CR-\*                       |
| `authority`     | enum   | yes    | A-0 تا A-4                  |
| `trigger_type`  | enum   | yes    | TRG-\*                      |
| `state_machine` | string | yes    | State Machine ID            |
| `owner`         | string | yes    | تیم مسئول                   |
| `version`       | semver | yes    | Semantic Version            |
| `status`        | enum   | yes    | active, deprecated, retired |

---

## Workflow Lifecycle

| فاز             | شناسه  | توضیح                                                |
| --------------- | ------ | ---------------------------------------------------- |
| **Design**      | LIF-01 | طراحی معماری Workflow — نیازمند ADR برای معماری جدید |
| **Development** | LIF-02 | پیاده‌سازی (implementation-specific)                 |
| **Testing**     | LIF-03 | تست واحد، یکپارچه‌سازی، E2E                          |
| **Staging**     | LIF-04 | استقرار در محیط آزمایشی                              |
| **Active**      | LIF-05 | استقرار در محیط تولید                                |
| **Monitoring**  | LIF-06 | نظارت بر عملکرد و خطاها                              |
| **Deprecation** | LIF-07 | اعلام منسوخ‌شدن — حداقل ۳۰ روز اطلاع                 |
| **Retirement**  | LIF-08 | حذف کامل — پس از اطمینان از عدم استفاده              |

### قواعد Lifecycle

| ID      | قاعده                                                             |
| ------- | ----------------------------------------------------------------- |
| LIF-R01 | هیچ Workflow بدون شناسه ثبت‌شده در AUT-001 Active نمی‌شود         |
| LIF-R02 | تغییر در Trigger, State Machine, یا Failure Model نیازمند ADR است |
| LIF-R03 | Deprecation باید در AUT-001 ثبت و به مصرف‌کنندگان اعلام شود       |
| LIF-R04 | هر Workflow در هر لحظه دقیقاً یک فاز Lifecycle دارد               |

---

## Trigger Model

### انواع Trigger

| شناسه         | نوع         | توضیح                                         | منبع                |
| ------------- | ----------- | --------------------------------------------- | ------------------- |
| **TRG-SCH**   | Schedule    | زمان‌بندی شده (Cron, Interval, Specific Time) | Internal Scheduler  |
| **TRG-EVT**   | Event       | در پاسخ به یک رویداد (Event-Driven)           | Event Bus           |
| **TRG-WEB**   | Webhook     | درخواست HTTP خارجی                            | External System     |
| **TRG-MAN**   | Manual      | دستور مستقیم انسان                            | Human Interface     |
| **TRG-AI**    | AI Decision | تصمیم یک AI Agent                             | AI-\* Agent         |
| **TRG-CHAIN** | Chain       | نتیجه Workflow دیگر                           | Workflow Engine     |
| **TRG-QUEUE** | Queue       | آیتم در صف                                    | Queue System        |
| **TRG-COND**  | Conditional | تحقق یک شرط (یک بار)                          | Condition Evaluator |

### Trigger Parameters

هر Trigger دارای پارامترهای زیر است:

| پارامتر          | نوع      | اجباری | توضیح                             |
| ---------------- | -------- | ------ | --------------------------------- |
| `type`           | enum     | yes    | TRG-\*                            |
| `config`         | object   | yes    | پیکربندی مختص نوع                 |
| `cooldown`       | duration | no     | حداقل فاصله بین دو اجرا           |
| `max_concurrent` | integer  | no     | حداکثر اجراهای همزمان             |
| `constraints`    | object   | no     | محدودیت‌های اجرا (ساعت، روز، ...) |

---

## Event Model

### ساختار رویداد

```json
{
  "event": {
    "id": "string (UUID)",
    "type": "string (EVT-NNN)",
    "source": "string (AUT-NNN | AI-NNN | PLAT-*)",
    "timestamp": "string (ISO 8601)",
    "correlation_id": "string (Trace ID)",
    "causation_id": "string (Parent Event ID)",
    "data": "object (Event-specific payload)"
  }
}
```

### دسته‌بندی رویدادها

| دسته         | شناسه   | توضیح             | مثال                                 |
| ------------ | ------- | ----------------- | ------------------------------------ |
| **System**   | EVT-SYS | رویدادهای سیستمی  | Workflow Started, Completed, Failed  |
| **Content**  | EVT-CNT | رویدادهای محتوایی | Content Created, Approved, Published |
| **Platform** | EVT-PLT | رویدادهای پلتفرمی | Post Published, Comment Received     |
| **AI**       | EVT-AI  | رویدادهای Agent   | Decision Made, Knowledge Extracted   |
| **Human**    | EVT-HMN | رویدادهای انسانی  | Approval Given, Override Triggered   |
| **Security** | EVT-SEC | رویدادهای امنیتی  | Access Denied, Rate Limit Exceeded   |

### Event Routing

| الگو               | توضیح                               |
| ------------------ | ----------------------------------- |
| **Point-to-Point** | یک فرستنده، یک گیرنده               |
| **Pub/Sub**        | یک فرستنده، چند گیرنده              |
| **Event Sourcing** | رویدادها منبع حقیقت هستند           |
| **Dead Letter**    | رویدادهای ناموفق به صف مرده می‌روند |

---

## State Model

### وضعیت‌های پایه Workflow

| شناسه          | وضعیت           | توضیح                            |
| -------------- | --------------- | -------------------------------- |
| `PENDING`      | در انتظار       | Workflow ایجاد شده اما شروع نشده |
| `RUNNING`      | در حال اجرا     | Workflow در حال اجراست           |
| `WAITING`      | در انتظار ورودی | منتظر تأیید انسان یا Agent دیگر  |
| `COMPLETED`    | تکمیل‌شده       | Workflow با موفقیت پایان یافته   |
| `FAILED`       | ناموفق          | Workflow با خطا پایان یافته      |
| `COMPENSATING` | در حال جبران    | در حال اجرای Compensating Action |
| `COMPENSATED`  | جبران‌شده       | Workflow جبران شده است           |
| `CANCELLED`    | لغو شده         | Workflow توسط انسان لغو شده      |
| `TIMEOUT`      | زمان‌خورده      | مهلت Workflow تمام شده           |

### State Machine Rules

| ID     | قاعده                                                                |
| ------ | -------------------------------------------------------------------- |
| SM-R01 | هر Workflow یک State Machine دارد                                    |
| SM-R02 | انتقال وضعیت فقط از طریق Event معتبر مجاز است                        |
| SM-R03 | وضعیت‌های پایانی: COMPLETED, FAILED, COMPENSATED, CANCELLED, TIMEOUT |
| SM-R04 | انتقال از COMPLETED مجاز نیست                                        |
| SM-R05 | هر انتقال وضعیت در Audit Log ثبت می‌شود                              |

---

## Queue Model

### انواع صف

| شناسه         | نوع                | توضیح           | کاربرد                |
| ------------- | ------------------ | --------------- | --------------------- |
| **QUE-FIFO**  | First-In-First-Out | ترتیب دقیق ورود | Publication Queue     |
| **QUE-PRIO**  | Priority Queue     | اولویت‌بندی شده | Alert Queue           |
| **QUE-DELAY** | Delayed Queue      | تأخیر در تحویل  | Scheduled Publication |
| **QUE-DLQ**   | Dead Letter Queue  | پیام‌های ناموفق | Error Handling        |
| **QUE-BATCH** | Batch Queue        | پردازش دسته‌ای  | Bulk Operations       |

### Queue Parameters

| پارامتر              | نوع      | اجباری | توضیح                        |
| -------------------- | -------- | ------ | ---------------------------- |
| `type`               | enum     | yes    | QUE-\*                       |
| `max_retries`        | integer  | no     | حداکثر تلاش مجدد             |
| `retry_delay`        | duration | no     | فاصله بین تلاش‌ها            |
| `visibility_timeout` | duration | yes    | حداکثر زمان پردازش یک آیتم   |
| `dead_letter_target` | string   | no     | صف مقصد برای آیتم‌های ناموفق |

---

## Scheduling Model

### انواع Schedule

| شناسه        | نوع             | توضیح                             |
| ------------ | --------------- | --------------------------------- |
| **SCH-CRON** | Cron Expression | الگوی تکراری استاندارد            |
| **SCH-INT**  | Fixed Interval  | تکرار با فاصله ثابت               |
| **SCH-ONCE** | One-Time        | اجرا در یک زمان مشخص              |
| **SCH-WIN**  | Time Window     | اجرا در بازه زمانی مشخص           |
| **SCH-CAL**  | Calendar-Based  | بر اساس تقویم (تعطیلات، رویدادها) |

### قواعد Scheduling

| ID      | قاعده                                                   |
| ------- | ------------------------------------------------------- |
| SCH-R01 | Scheduleها در منطقه زمانی UTC تعریف می‌شوند             |
| SCH-R02 | Daylight Saving Time توسط Scheduler مدیریت می‌شود       |
| SCH-R03 | Schedule overlap مجاز نیست —除非 طراحی‌شده برای همزمانی |
| SCH-R04 | هر Schedule باید دارای Timeout باشد                     |

---

## Execution Model

### Execution Context

هر اجرا (Execution) دارای یک Context است:

| فیلد             | نوع       | توضیح            |
| ---------------- | --------- | ---------------- |
| `execution_id`   | UUID      | شناسه یکتای اجرا |
| `workflow_id`    | AUT-NNN   | شناسه Workflow   |
| `trigger`        | object    | Trigger منبع     |
| `input`          | object    | ورودی            |
| `started_at`     | timestamp | زمان شروع        |
| `correlation_id` | UUID      | شناسه ردیابی     |
| `step`           | string    | مرحله جاری       |
| `retry_count`    | integer   | تعداد تلاش مجدد  |

### Execution Lifecycle

```
Trigger → INIT → VALIDATE → EXECUTE → NOTIFY → AUDIT → COMPLETE
                    │          │         │
                    ▼          ▼         ▼
                  FAIL      RETRY     NOTIFY_FAILURE
                    │          │         │
                    ▼          ▼         ▼
                 ESCALATE   BACKOFF   COMPENSATE
```

### انواع Execution

| شناسه        | نوع          | توضیح                                 |
| ------------ | ------------ | ------------------------------------- |
| **EX-SYNC**  | Synchronous  | انتظار برای نتیجه — برای عملیات کوتاه |
| **EX-ASYNC** | Asynchronous | عدم انتظار — برای عملیات طولانی       |
| **EX-BATCH** | Batch        | اجرای دسته‌ای — برای حجم بالا         |

---

## Retry Model

### خط‌مشی Retry

| شناسه           | خط‌مشی              | توضیح                                                  |
| --------------- | ------------------- | ------------------------------------------------------ |
| **RTY-NONE**    | No Retry            | خطا بلافاصله گزارش می‌شود                              |
| **RTY-FIXED**   | Fixed Delay         | فاصله ثابت بین تلاش‌ها (مثلاً ۵ ثانیه)                 |
| **RTY-BACKOFF** | Exponential Backoff | فاصله افزایشی (۱ث, ۲ث, ۴ث, ۸ث, ...)                    |
| **RTY-JITTER**  | Backoff + Jitter    | Backoff با نویز تصادفی برای جلوگیری از Thundering Herd |
| **RTY-CUSTOM**  | Custom              | خط‌مشی سفارشی                                          |

### پارامترهای Retry

| پارامتر              | نوع      | پیش‌فرض | توضیح             |
| -------------------- | -------- | ------- | ----------------- |
| `max_attempts`       | integer  | ۳       | حداکثر تعداد تلاش |
| `initial_delay`      | duration | ۱s      | تأخیر اولیه       |
| `max_delay`          | duration | ۶۰s     | حداکثر تأخیر      |
| `backoff_multiplier` | float    | ۲.۰     | ضریب افزایش       |
| `retryable_errors`   | string[] | []      | خطاهای قابل Retry |

### خطاهای Retryable vs Non-Retryable

| نوع               | مثال                                    | رفتار                     |
| ----------------- | --------------------------------------- | ------------------------- |
| **Retryable**     | Timeout, Rate Limit, Network Error, 5xx | تلاش مجدد با Backoff      |
| **Non-Retryable** | Validation Error, Auth Error, 4xx       | خطا بلافاصله — بدون Retry |

---

## Failure Recovery

### سطوح Failure

| سطح                  | شناسه | توضیح                                       |
| -------------------- | ----- | ------------------------------------------- |
| **Step Failure**     | F-01  | خطا در یک مرحله — Retry یا Fallback         |
| **Workflow Failure** | F-02  | خطا در کل Workflow — Compensation           |
| **Chain Failure**    | F-03  | خطا در زنجیره Workflowها — Cascade Handling |
| **System Failure**   | F-04  | خطا در زیرساخت — Graceful Degradation       |

### Recovery Strategy

| خط‌مشی         | شناسه    | توضیح                               |
| -------------- | -------- | ----------------------------------- |
| **Retry**      | REC-RTY  | تلاش مجدد با Backoff                |
| **Fallback**   | REC-FB   | اجرای مسیر جایگزین                  |
| **Skip**       | REC-SKIP | رد شدن از مرحله (در صورت غیربحرانی) |
| **Compensate** | REC-CMP  | جبران اقدامات انجام‌شده             |
| **Escalate**   | REC-ESC  | ارجاع به Human                      |
| **Abort**      | REC-ABT  | توقف Workflow                       |

---

## Compensation Model

### اصل جبران

هر Write Action باید یک Compensating Action داشته باشد:

| Action            | Compensating Action               |
| ----------------- | --------------------------------- |
| Publish Content   | Unpublish / Mark as Draft         |
| Send Notification | No compensation (best-effort)     |
| Update Database   | Reverse Update / Snapshot Restore |
| File Upload       | File Delete                       |
| API Call          | Compensating API Call             |

### قواعد Compensation

| ID      | قاعده                                                 |
| ------- | ----------------------------------------------------- |
| CMP-R01 | هر Write Action باید Compensating Action داشته باشد   |
| CMP-R02 | Read-Only Action نیازی به Compensation ندارد          |
| CMP-R03 | Compensation باید Idempotent باشد                     |
| CMP-R04 | Compensation در Audit Log ثبت می‌شود                  |
| CMP-R05 | Compensation ممکن است نیاز به تأیید انسانی داشته باشد |

---

## Human Interaction Model

### Human-in-the-Loop نقاط

| نقطه                | شناسه   | توضیح              | Timeout |
| ------------------- | ------- | ------------------ | ------- |
| **Approval Gate**   | HITL-01 | تأیید قبل از ادامه | ۲۴ ساعت |
| **Review Gate**     | HITL-02 | بازبینی و اصلاح    | ۴۸ ساعت |
| **Escalation Gate** | HITL-03 | ارجاع بحران        | ۱ ساعت  |
| **Override Gate**   | HITL-04 | لغو تصمیم خودکار   | فوری    |

### قواعد Human Interaction

| ID       | قاعده                                               |
| -------- | --------------------------------------------------- |
| HITL-R01 | هر HITL دارای Timeout است — پس از Timeout: Escalate |
| HITL-R02 | HITL باید به انسان Context کامل بدهد                |
| HITL-R03 | تصمیم انسان در Audit Log ثبت می‌شود                 |
| HITL-R04 | Override انسان قابل ردیابی به فرد خاص است           |

---

## AI Collaboration Model

### Automation ↔ AI Interaction Patterns

| الگو                     | شناسه    | توضیح                                           |
| ------------------------ | -------- | ----------------------------------------------- |
| **AI-Triggered**         | AI-WF-01 | Agent تصمیم می‌گیرد → Workflow اجرا می‌کند      |
| **Automation-Triggered** | AI-WF-02 | Workflow اجرا می‌شود → Agent تصمیم می‌گیرد      |
| **AI-Monitored**         | AI-WF-03 | Workflow اجرا می‌شود → Agent نظارت می‌کند       |
| **Human-Escalated**      | AI-WF-04 | Workflow به Agent → Agent به Human ارجاع می‌دهد |

### Authority Boundaries

| سطح     | Automation             | AI                   |
| ------- | ---------------------- | -------------------- |
| **A-4** | Orchestration, Routing | —                    |
| **A-3** | Independent Execution  | Independent Decision |
| **A-2** | Supervised Execution   | Supervised Decision  |
| **A-1** | Monitored Execution    | Advisory             |
| **A-0** | Manual Only            | —                    |

---

## Governance

### قواعد Governance خودکارسازی

| ID            | قاعده                                        | لایه   |
| ------------- | -------------------------------------------- | ------ |
| **GOV-AR-01** | هر Workflow باید در AUT-001 ثبت شود          | LYR-01 |
| **GOV-AR-02** | هر Workflow باید دارای Metadata کامل باشد    | LYR-01 |
| **GOV-AR-03** | تغییر در معماری Workflow نیازمند ADR است     | LYR-01 |
| **GOV-AR-04** | Workflow بدون State Machine مجاز نیست        | LYR-02 |
| **GOV-AR-05** | Workflow بدون Failure Model مجاز نیست        | LYR-03 |
| **GOV-AR-06** | هر Workflow باید به صورت دوره‌ای بازبینی شود | LYR-01 |

### Ownership Model

| نقش                      | مسئولیت                                      |
| ------------------------ | -------------------------------------------- |
| **Automation Architect** | معماری خودکارسازی، استانداردها، Governance   |
| **Workflow Owner**       | طراحی، نگهداری و به‌روزرسانی یک Workflow خاص |
| **Workflow Operator**    | نظارت روزانه، پاسخ به خطاهای Workflow        |

---

## Security

### اصول امنیتی

| ID         | اصل                                                     |
| ---------- | ------------------------------------------------------- |
| **SEC-01** | Credentialها هرگز در Workflow Definition ذخیره نمی‌شوند |
| **SEC-02** | هر Workflow حداقل دسترسی لازم را دارد (Least Privilege) |
| **SEC-03** | ورودی‌های خارجی همیشه اعتبارسنجی می‌شوند                |
| **SEC-04** | خروجی‌های حساس هرگز در Log ذخیره نمی‌شوند               |
| **SEC-05** | Rate Limiting در Triggerها اعمال می‌شود                 |

---

## Audit & Traceability

### Audit Log Structure

| فیلد           | نوع      | توضیح                      |
| -------------- | -------- | -------------------------- |
| `audit_id`     | UUID     | شناسه یکتای Audit          |
| `timestamp`    | ISO 8601 | زمان رویداد                |
| `workflow_id`  | AUT-NNN  | شناسه Workflow             |
| `execution_id` | UUID     | شناسه اجرا                 |
| `action`       | string   | اقدام انجام‌شده            |
| `actor`        | string   | عامل (Human/AI/Automation) |
| `state_before` | object   | وضعیت قبل                  |
| `state_after`  | object   | وضعیت بعد                  |
| `reason`       | string   | دلیل تغییر                 |

### Traceability Chain

```
Trigger → Execution → Steps → Events → Audit
                                            │
                                            ▼
                                    Correlation ID
                                            │
                          ┌─────────────────┼─────────────────┐
                          ▼                 ▼                 ▼
                    Downstream WF     AI Decision       Human Action
```

---

## Performance Metrics

| شناسه    | Metric                   | واحد               | منبع   |
| -------- | ------------------------ | ------------------ | ------ |
| **M-01** | Workflow Execution Count | count / period     | System |
| **M-02** | Execution Duration       | ms (P50, P95, P99) | System |
| **M-03** | Success Rate             | %                  | System |
| **M-04** | Failure Rate             | %                  | System |
| **M-05** | Retry Count              | count / execution  | System |
| **M-06** | Queue Depth              | count              | System |
| **M-07** | Queue Wait Time          | ms                 | System |
| **M-08** | Human Approval Time      | duration           | System |
| **M-09** | Compensation Count       | count / period     | System |
| **M-10** | Escalation Rate          | % of executions    | System |

---

## Validation Rules

| ID    | قانون                                   | نقض            | عکس‌العمل |
| ----- | --------------------------------------- | -------------- | --------- |
| VR-01 | Workflow دارای شناسه یکتا است           | تکراری         | رد ثبت    |
| VR-02 | Workflow دارای Trigger مشخص است         | نامشخص         | رد        |
| VR-03 | Workflow دارای State Machine است        | فاقد           | رد        |
| VR-04 | Workflow دارای Failure Model است        | فاقد           | رد        |
| VR-05 | Workflow دارای فراداده کامل است         | ناقص           | رد        |
| VR-06 | Trigger دارای Timeout است               | فاقد           | هشدار     |
| VR-07 | هر Write Action دارای Compensation است  | فاقد           | هشدار     |
| VR-08 | Retry دارای Max Attempts است            | فاقد           | هشدار     |
| VR-09 | HITL دارای Timeout است                  | فاقد           | هشدار     |
| VR-10 | Audit Log کامل است                      | ناقص           | رد        |
| VR-11 | Authority سطح A-4 فقط برای Orchestrator | مغایرت         | رد        |
| VR-12 | Credential در Definition ذخیره نشده     | ذخیره شده      | رد        |
| VR-13 | State Machine بدون چرخه است             | چرخه           | رد        |
| VR-14 | Compensation Idempotent است             | غیر Idempotent | هشدار     |
| VR-15 | Workflow در Lifecycle فاز صحیح دارد     | نامنطبق        | هشدار     |

---

## Quality Gates

هر Workflow جدید (AUT-NNN) قبل از ثبت در AUT-001 از ۵ گیت عبور می‌کند:

```
Design → GATE-1: Identity & Taxonomy → GATE-2: State & Trigger
        → GATE-3: Failure & Recovery → GATE-4: Governance & Audit
        → GATE-5: Validation → Registry
```

| ID         | Gate                | معیار عبور                                | عکس‌العمل در رد |
| ---------- | ------------------- | ----------------------------------------- | --------------- |
| **GATE-1** | Identity & Taxonomy | شناسه یکتا، خانواده درست، نوع مشخص        | اصلاح Design    |
| **GATE-2** | State & Trigger     | State Machine کامل، Trigger مشخص          | اصلاح           |
| **GATE-3** | Failure & Recovery  | Retry, Compensation, Escalation تعریف شده | اصلاح           |
| **GATE-4** | Governance & Audit  | Metadata کامل, HITL تعریف شده, Audit      | تکمیل           |
| **GATE-5** | Validation          | همه VR-\* پاس شده‌اند                     | تجدید           |

---

## Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "document": {
    "id": "AUT-000",
    "name": "Enterprise Automation Architecture",
    "type": "architecture",
    "version": "1.0.0-draft",
    "status": "architecture",
    "ssot": true
  }
}
```

### Block 2 — Workflow Identity Schema

```json
{
  "workflow_identity": {
    "id": "string (AUT-NNN-NNN)",
    "name": "string",
    "description": "string",
    "family": "FAM-CORE | FAM-PLAT | FAM-AI | FAM-KNW | FAM-REP | FAM-SYS | FAM-SEC | FAM-DATA",
    "type": "WT-01 | WT-02 | WT-03 | WT-04 | WT-05 | WT-06",
    "criticality": "CR-01 | CR-02 | CR-03 | CR-04",
    "authority": "A-0 | A-1 | A-2 | A-3 | A-4",
    "trigger_type": "TRG-SCH | TRG-EVT | TRG-WEB | TRG-MAN | TRG-AI | TRG-CHAIN | TRG-QUEUE | TRG-COND",
    "state_machine": "string",
    "owner": "string",
    "version": "string (semver)",
    "status": "active | deprecated | retired"
  }
}
```

### Block 3 — Event Schema

```json
{
  "event": {
    "id": "string (UUID)",
    "type": "string (EVT-*)",
    "source": "string (AUT-* | AI-* | PLAT-* | HUMAN)",
    "timestamp": "string (ISO 8601)",
    "correlation_id": "string (UUID)",
    "causation_id": "string (UUID)",
    "data": {}
  }
}
```

### Block 4 — Trigger Schema

```json
{
  "trigger": {
    "type": "TRG-SCH | TRG-EVT | TRG-WEB | TRG-MAN | TRG-AI | TRG-CHAIN | TRG-QUEUE | TRG-COND",
    "config": {},
    "cooldown": "string (duration)",
    "max_concurrent": "integer",
    "constraints": {}
  }
}
```

### Block 5 — State Schema

```json
{
  "state_machine": {
    "id": "string",
    "states": [
      "PENDING | RUNNING | WAITING | COMPLETED | FAILED | COMPENSATING | COMPENSATED | CANCELLED | TIMEOUT"
    ],
    "transitions": [
      {
        "from": "string",
        "to": "string",
        "event": "string (EVT-*)"
      }
    ],
    "initial_state": "string",
    "terminal_states": ["COMPLETED", "FAILED", "COMPENSATED", "CANCELLED", "TIMEOUT"]
  }
}
```

### Block 6 — Queue Schema

```json
{
  "queue": {
    "type": "QUE-FIFO | QUE-PRIO | QUE-DELAY | QUE-DLQ | QUE-BATCH",
    "max_retries": "integer",
    "retry_delay": "string (duration)",
    "visibility_timeout": "string (duration)",
    "dead_letter_target": "string (queue name)"
  }
}
```

---

## JSON Schemas (Draft-07)

### Workflow Identity Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:automation:workflow-identity:1.0.0",
  "title": "SMOS Workflow Identity",
  "type": "object",
  "properties": {
    "id": { "type": "string", "pattern": "^AUT-\\d{3}-\\d{3}$" },
    "name": { "type": "string", "minLength": 1, "maxLength": 128 },
    "description": { "type": "string", "maxLength": 1024 },
    "family": {
      "type": "string",
      "enum": [
        "FAM-CORE",
        "FAM-PLAT",
        "FAM-AI",
        "FAM-KNW",
        "FAM-REP",
        "FAM-SYS",
        "FAM-SEC",
        "FAM-DATA"
      ]
    },
    "type": { "type": "string", "enum": ["WT-01", "WT-02", "WT-03", "WT-04", "WT-05", "WT-06"] },
    "criticality": { "type": "string", "enum": ["CR-01", "CR-02", "CR-03", "CR-04"] },
    "authority": { "type": "string", "enum": ["A-0", "A-1", "A-2", "A-3", "A-4"] },
    "trigger_type": {
      "type": "string",
      "enum": [
        "TRG-SCH",
        "TRG-EVT",
        "TRG-WEB",
        "TRG-MAN",
        "TRG-AI",
        "TRG-CHAIN",
        "TRG-QUEUE",
        "TRG-COND"
      ]
    },
    "state_machine": { "type": "string" },
    "owner": { "type": "string" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+" },
    "status": { "type": "string", "enum": ["active", "deprecated", "retired"] }
  },
  "required": [
    "id",
    "name",
    "family",
    "type",
    "criticality",
    "trigger_type",
    "state_machine",
    "owner",
    "version",
    "status"
  ]
}
```

### Event Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:automation:event:1.0.0",
  "title": "SMOS Automation Event",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "type": { "type": "string", "pattern": "^EVT-(SYS|CNT|PLT|AI|HMN|SEC)-\\d{3}$" },
    "source": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "correlation_id": { "type": "string", "format": "uuid" },
    "causation_id": { "type": "string", "format": "uuid" },
    "data": { "type": "object" }
  },
  "required": ["id", "type", "source", "timestamp", "correlation_id", "data"]
}
```

### State Machine Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:automation:state-machine:1.0.0",
  "title": "SMOS Workflow State Machine",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "states": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "PENDING",
          "RUNNING",
          "WAITING",
          "COMPLETED",
          "FAILED",
          "COMPENSATING",
          "COMPENSATED",
          "CANCELLED",
          "TIMEOUT"
        ]
      },
      "minItems": 2
    },
    "transitions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "from": { "type": "string" },
          "to": { "type": "string" },
          "event": { "type": "string" }
        },
        "required": ["from", "to", "event"]
      }
    },
    "initial_state": { "type": "string" },
    "terminal_states": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["id", "states", "transitions", "initial_state", "terminal_states"]
}
```

---

## Change Management

| نوع تغییر                       | نیازمند        | مسیر         |
| ------------------------------- | -------------- | ------------ |
| اضافه شدن Trigger جدید          | ADR            | ARCH-034     |
| تغییر State Machine             | ADR            | ARCH-034     |
| اضافه شدن خانواده Workflow جدید | ADR            | ARCH-034     |
| تغییر در Governance Rules       | ADR            | ARCH-034     |
| اضافه شدن Workflow جدید         | ثبت در AUT-001 | AUT-001      |
| به‌روزرسانی Metadata            | معمول          | Version Bump |

---

## Reading Guide

| مخاطب                  | بخش‌های پیشنهادی                                                  |
| ---------------------- | ----------------------------------------------------------------- |
| **معمار سیستم**        | Executive Summary, Architecture, Principles, Governance           |
| **Automator**          | Identity Model, Lifecycle, Trigger, Event, State, Queue, Schedule |
| **AI Agent Developer** | AI Collaboration Model, Authority Boundaries                      |
| **Platform Developer** | Execution Model, Retry, Failure, Compensation                     |
| **Operator**           | Audit, Metrics, Governance                                        |

---

## Cross References

| سند                   | شناسه                                                            | رابطه                                   |
| --------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| Constitution          | [CON-000](../05-CONSTITUTION/00-constitution.md)                 | اصول اساسی خودکارسازی                   |
| Automation Model      | [ARCH-014](../00-ARCHITECTURE/14-automation-model.md)            | مدل خودکارسازی در معماری سیستم          |
| AI Agent Architecture | [AI-000](../40-AI-AGENTS/00-enterprise-ai-agent-architecture.md) | تعامل Automation ↔ AI                   |
| Automation Index      | [AUT-001](../30-AUTOMATION/00-automation-index.md)               | نمایه خودکارسازی (مشتق از AUT-000)      |
| Content Taxonomy      | [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)                | تاکسونومی محتوا برای Triggerهای محتوایی |
| Platform Standard     | [PLAT-000](../20-PLATFORMS/00-platform-playbook-standard.md)     | ارجاع Workflowها در کتابچه‌های پلتفرم   |
| Governance            | [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md)     | حکمرانی خودکارسازی                      |
| ADR System            | [ARCH-034](../00-ARCHITECTURE/34-adr-system.md)                  | تغییرات در معماری خودکارسازی            |

---

> **AUT-000 سند مادر معماری خودکارسازی SMOS است. تمام AUT-001 تا AUT-999 از این سند مشتق می‌شوند. AUT-000 معماری را تعریف می‌کند — AUT-001 نمایه را نگه می‌دارد — AUT-NNN پیاده‌سازی می‌کند.**
