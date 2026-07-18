# Enterprise Automation Index — نمایه خودکارسازی سازمانی SMOS

> **شناسه:** AUT-001
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-27
> **مسئول:** معمار سیستم
> **وابستگی:** [ARCH-014](../00-ARCHITECTURE/14-automation-model.md), [ARCH-013](../00-ARCHITECTURE/13-ai-operating-model.md), [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md), [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md), [PLAT-000](../20-PLATFORMS/00-platform-playbook-standard.md)
> **مخاطب:** human, agent, n8n, mcp

---

## Architectural Dependencies

### Why This Document Exists

SMOS شامل ده‌ها گردش کار خودکار در پلتفرم‌های مختلف است. بدون یک نمایه مرکزی:

- هر AUT-\* ساختار متفاوتی خواهد داشت
- شناسه‌های تکراری یا متضاد ایجاد می‌شوند
- وابستگی بین Workflowها غیرقابل ردیابی است
- خطاهای زنجیره‌ای (Cascading Failures) قابل پیش‌بینی نیستند
- Governance و حسابرسی خودکار غیرممکن است

AUT-001 این مشکلات را با تعریف یک **چارچوب معماری خودکارسازی** حل می‌کند که همه AUT-\*ها از آن پیروی می‌کنند.

### Problems It Solves

1. **نبود استاندارد**: هر Workflow ساختار متفاوت → یکسان‌سازی با Metadata Standard
2. **شناسه‌های پراکنده**: تداخل شناسه‌ها → Canonical Registry مرکزی
3. **وابستگی نامشخص**: زنجیره Workflowها نامشخص → Dependency Model با DAG
4. **خطاهای پیش‌بینی‌نشده**: رفتار خطا نامشخص → Failure Model استاندارد
5. **حسابرسی ناقص**: ردگیری اقدامات خودکار → Logging Standard + Audit Layer

### Explicit Scope

این سند فقط تعریف می‌کند:

- فلسفه و اصول خودکارسازی SMOS
- لایه‌های معماری خودکارسازی
- تاکسونومی و خانواده‌های Workflow
- استاندارد فراداده و شناسه‌گذاری
- مدل‌های Trigger, Execution, Failure, Authority
- مدل تعامل Automation ↔ AI ↔ Human
- استاندارد رویداد، State Machine و لاگ‌نگاری
- مدل نظارت، امنیت و وابستگی
- حکمرانی و چرخه حیات Workflowها

### Explicit Non-Scope

این سند هرگز شامل موارد زیر نیست:

- پیاده‌سازی n8n (Nodeها، کد، Credential)
- جزئیات API پلتفرم‌ها
- محتوای عملیاتی Workflowها
- اسکریپت‌های اجرایی
- راهنمای نصب و کانفیگ n8n

### Upstream Dependencies

| سند                                                          | نوع وابستگی | دلیل                                       |
| ------------------------------------------------------------ | ----------- | ------------------------------------------ |
| [ARCH-014](../00-ARCHITECTURE/14-automation-model.md)        | depends-on  | مدل خودکارسازی پایه، لایه‌ها، قواعد        |
| [ARCH-013](../00-ARCHITECTURE/13-ai-operating-model.md)      | depends-on  | مدل عملیاتی Agentها، تعامل AI↔Automation   |
| [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md) | depends-on  | حکمرانی، RACI، تصمیمات پلتفرمی             |
| [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md)           | depends-on  | مدل اختیار A-1 تا A-3                      |
| [EDT-001](../24-EDITORIAL/10-content-guidelines.md)          | depends-on  | چرخه حیات محتوا (ورودی Workflowها)         |
| [PLAT-000](../20-PLATFORMS/00-platform-playbook-standard.md) | depends-on  | شناسه‌های PLAT-\*, قالب Workflow Reference |
| [CON-000](../05-CONSTITUTION/00-constitution.md)             | governs     | اصول خودکارسازی، کیفیت، حاکمیت             |
| [GOV-001](../10-GOVERNANCE/01-documentation-standards.md)    | follows     | استاندارد نگارش                            |
| [GOV-003](../10-GOVERNANCE/03-naming-conventions.md)         | follows     | قراردادهای نام‌گذاری                       |
| [GOV-004](../10-GOVERNANCE/04-cross-references.md)           | follows     | نظام ارجاع متقابل                          |

### Downstream Dependencies

| سند                         | نوع وابستگی  | دلیل                                        |
| --------------------------- | ------------ | ------------------------------------------- |
| [AUT-\*](./)                | derived-from | همه AUT-\*ها از AUT-001 مشتق می‌شوند        |
| [PLAT-\*](../20-PLATFORMS/) | uses         | PLAT-_ها به Workflowهای AUT-_ ارجاع می‌دهند |
| [AI-\*](../40-AI-AGENTS/)   | interacts    | Agentها با Automation تعامل دارند           |
| [PRM-\*](../35-PROMPTS/)    | implements   | پرامپت‌ها در Workflowها استفاده می‌شوند     |
| [MET-\*](../60-METRICS/)    | measures     | KPIهای Automation                           |

### SSOT Ownership

| موضوع                        | SSOT                  |
| ---------------------------- | --------------------- |
| Automation Philosophy        | **AUT-001** (این سند) |
| Automation Taxonomy          | **AUT-001** (این سند) |
| Workflow Metadata Standard   | **AUT-001** (این سند) |
| Canonical Workflow Registry  | **AUT-001** (این سند) |
| Execution Model              | **AUT-001** (این سند) |
| Failure Model                | **AUT-001** (این سند) |
| Authority Model (Automation) | **AUT-001** (این سند) |
| Event & State Models         | **AUT-001** (این سند) |
| Logging Standard             | **AUT-001** (این سند) |
| Monitoring Model             | **AUT-001** (این سند) |
| Dependency Model             | **AUT-001** (این سند) |
| Trigger Taxonomy             | **AUT-001** (این سند) |
| Workflow-level Authority     | ARCH-032              |
| Agent-level Authority        | ARCH-032              |
| Automation Implementation    | AUT-NNN (هر Workflow) |

### Related ADRs

| ADR     | عنوان                             | ارتباط                                  |
| ------- | --------------------------------- | --------------------------------------- |
| ADR-010 | معماری متا به عنوان الگوی عملیاتی | لایه Automation & Execution             |
| ADR-013 | جداسازی Automation و Agent        | Automation زیرساخت اجرا، Agent لایه هوش |
| ADR-016 | لاگ متمرکز و ردیابی خودکار        | Audit Layer, Logging Standard           |
| ADR-019 | حکمرانی ۱۰ لایه                   | لایه Automation در حکمرانی              |

### Related Objects (from ARCH-011)

Workflow (OBJ-014), Agent (OBJ-015), Event (OBJ-020), State (OBJ-021), Platform (OBJ-010), Content Piece (OBJ-004), Publication (OBJ-022), Metric (OBJ-017)

### Related AI Agents (from ARCH-013)

Orchestrator (000), Planning (002), Publishing (008), Monitoring (009), Analytics (010), Knowledge (011), Scheduler (014)

---

## ۱. Purpose

### جایگاه Automation در SMOS

خودکارسازی در SMOS لایه اجرایی است که بین **لایه هوش (AI Agents)** و **لایه یکپارچه‌سازی (Platform APIs)** قرار دارد.

```
┌─────────────────────────────────────────────────────────┐
│                   Human Layer                            │
│  (Policy, Strategy, Final Approval)                      │
└──────────────────────────┬──────────────────────────────┘
                           │ سیاست و استراتژی
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   AI Agent Layer                         │
│  (Decision, Creation, Analysis, Knowledge)               │
│  AI-000 to AI-014                                        │
└──────────────────────────┬──────────────────────────────┘
                           │ تصمیم و دستور
                           ▼
┌─────────────────────────────────────────────────────────┐
│                Automation Layer                          │
│  (Execution, Coordination, Monitoring)                   │
│  AUT-001 to AUT-NNN                                      │
├─────────────────────────────────────────────────────────┤
│  n8n | MCP | Scheduler | Webhook | Queue                │
└──────────────────────────┬──────────────────────────────┘
                           │ اجرا
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Integration Layer                           │
│  (Platform APIs, DB, External Services)                  │
└─────────────────────────────────────────────────────────┘
```

### سه اصل بنیادین

| اصل                             | توضیح                                                         |
| ------------------------------- | ------------------------------------------------------------- |
| **Automation اجرا می‌کند**      | گردش کارها، ارسال API، زمان‌بندی، اعلان — همه توسط Automation |
| **AI تصمیم می‌گیرد**            | انتخاب محتوا، تحلیل داده، استخراج دانش — توسط Agentها         |
| **Human سیاست را تعیین می‌کند** | قواعد، مرزها، تأیید نهایی — توسط انسان                        |

### اهداف AUT-001

1. **ایجاد زبان مشترک**: همه AUT-\*ها از یک چارچوب مفهومی واحد پیروی می‌کنند
2. **جلوگیری از هرج‌ومرج**: شناسه‌ها، فراداده و ساختار یکسان
3. **قابلیت ردیابی**: هر Workflow قابل ردیابی، حسابرسی و اشکال‌زدایی است
4. **مقیاس‌پذیری**: Workflow جدید بدون بازطراحی معماری اضافه می‌شود
5. **یکپارچگی با Agentها**: Automation و AI در چارچوبی مشخص همکاری می‌کنند
6. **حکمرانی خودکار**: همه Workflowها تابع Governance یکسان هستند

### اصول AUT-001

| اصل            | توضیح                                                      |
| -------------- | ---------------------------------------------------------- |
| **AUT-001-01** | هر Workflow یک شناسه یکتا دارد — بدون استثنا               |
| **AUT-001-02** | هر Workflow دارای فراداده کامل مطابق Metadata Standard است |
| **AUT-001-03** | هر Workflow دارای Failure Model مشخص است                   |
| **AUT-001-04** | Workflowها بدون DAG واضح مجاز نیستند                       |
| **AUT-001-05** | تغییر در چارچوب AUT-001 نیازمند ADR است                    |

---

## ۲. Automation Philosophy

### فلسفه خودکارسازی SMOS

خودکارسازی در SMOS یک ابزار نیست — یک لایه معماری است که **اجرا را از تصمیم جدا می‌کند**.

### اصول فلسفی

| اصل                        | توضیح                                                                           |
| -------------------------- | ------------------------------------------------------------------------------- |
| **Separation of Concerns** | Automation اجرا می‌کند، AI تصمیم می‌گیرد، Human سیاست می‌سازد                   |
| **Automation by Default**  | هر فرایندی که می‌تواند خودکار شود، باید خودکار شود                              |
| **Human in the Loop**      | تصمیمات کلیدی نیازمند تأیید انسانی — اما انسان مسیر را هموار می‌کند نه blockers |
| **Idempotency**            | هر Workflow باید قابل اجرای مجدد بدون عوارض جانبی باشد                          |
| **Observability**          | هر Workflow قابل مشاهده، اندازه‌گیری و اشکال‌زدایی است                          |
| **Graceful Degradation**   | در صورت خطا، سیستم به جای توقف کامل، عملکرد محدود دارد                          |
| **Security by Design**     | Credentialها، Tokenها و Secretها هرگز در معرض دید نیستند                        |

### تقسیم مسئولیت

| لایه           | مسئولیت                                            | مثال                                 |
| -------------- | -------------------------------------------------- | ------------------------------------ |
| **Human**      | Policy, Strategy, Governance, Final Approval       | تصویب تقویم محتوا، تأیید بحران       |
| **AI Agent**   | Decision, Creation, Analysis, Knowledge Extraction | تصمیم‌گیری نوع محتوا، تولید پیش‌نویس |
| **Automation** | Execution, Coordination, Monitoring, Notification  | انتشار در پلتفرم، ارسال هشدار        |

---

## ۳. Automation Layer Model

### لایه‌های معماری خودکارسازی

هر Workflow در SMOS از هشت لایه عبور می‌کند:

```
┌─────────────────────────────────────────────────────┐
│                    8. Recovery Layer                 │
│  (بازیابی از خطا، جبران، بازگشت)                      │
├─────────────────────────────────────────────────────┤
│                    7. Audit Layer                    │
│  (ثبت دائمی، حسابرسی، ردیابی)                         │
├─────────────────────────────────────────────────────┤
│                  6. Knowledge Update Layer           │
│  (به‌روزرسانی مخازن دانش، استخراج)                    │
├─────────────────────────────────────────────────────┤
│                  5. Notification Layer               │
│  (اعلان به انسان، Agent، سیستم‌های دیگر)              │
├─────────────────────────────────────────────────────┤
│                  4. Execution Layer                  │
│  (اجرای واقعی: API Call, DB Write, File Upload)     │
├─────────────────────────────────────────────────────┤
│                  3. Routing Layer                    │
│  (مسیریابی به Agent، Human، Workflow دیگر)           │
├─────────────────────────────────────────────────────┤
│                 2. Validation Layer                  │
│  (اعتبارسنجی ورودی، قواعد، مجوزها)                   │
├─────────────────────────────────────────────────────┤
│                  1. Trigger Layer                    │
│  (محرک: Schedule, Event, Webhook, ...)              │
└─────────────────────────────────────────────────────┘
```

### توضیح لایه‌ها

| لایه                 | توضیح                                                                | مسئول                |
| -------------------- | -------------------------------------------------------------------- | -------------------- |
| **Trigger**          | محرک آغاز Workflow — Schedule, Event, Webhook, Manual, AI Decision   | Trigger System       |
| **Validation**       | اعتبارسنجی ورودی، بررسی مجوزها، قواعد Pre-condition                  | Validation Engine    |
| **Routing**          | مسیریابی به مقصد: Agent, Human, Workflow دیگر, Queue                 | Orchestrator         |
| **Execution**        | اجرای واقعی: API Call, Database Write, File Upload, Platform Publish | Executor             |
| **Notification**     | اعلان به ذی‌نفعان: Human, Agent, Alert System                        | Notification Service |
| **Knowledge Update** | به‌روزرسانی مخازن دانش: KNW-\*, Graph, Metrics                       | Knowledge Sync       |
| **Audit**            | ثبت دائمی همه اقدامات برای حسابرسی                                   | Audit Logger         |
| **Recovery**         | بازیابی از خطا: Retry, Fallback, Compensate, Rollback                | Recovery Handler     |

---

## ۴. Automation Taxonomy

### خانواده‌های Workflow

همه Workflowهای SMOS در یکی از هشت خانواده زیر قرار می‌گیرند:

| شناسه خانواده | نام                  | توضیح                     | مثال                               |
| ------------- | -------------------- | ------------------------- | ---------------------------------- |
| **AUT-CORE**  | Core Operations      | گردش کارهای هسته‌ای سیستم | Content Pipeline, Publication      |
| **AUT-PLAT**  | Platform Operations  | عملیات مختص یک پلتفرم     | پست در اینستاگرام، آپلود در یوتیوب |
| **AUT-AI**    | AI Operations        | عملیات مربوط به Agentها   | آموزش Agent, ارزیابی Agent         |
| **AUT-KNW**   | Knowledge Operations | عملیات دانش               | استخراج دانش، به‌روزرسانی گراف     |
| **AUT-REP**   | Reporting Operations | عملیات گزارش‌گیری         | گزارش هفتگی, KPI Dashboard         |
| **AUT-SYS**   | System Operations    | عملیات سیستم              | پشتیبان‌گیری, به‌روزرسانی          |
| **AUT-SEC**   | Security Operations  | عملیات امنیتی             | چرخش Token, بررسی دسترسی           |
| **AUT-DATA**  | Data Operations      | عملیات داده               | همگام‌سازی داده, مهاجرت            |

### قواعد تاکسونومی

| قاعده      | توضیح                                              |
| ---------- | -------------------------------------------------- |
| TAX-AUT-01 | هر Workflow دقیقاً به یک خانواده تعلق دارد         |
| TAX-AUT-02 | خانواده Workflow در شناسه AUT-NNN منعکس می‌شود     |
| TAX-AUT-03 | خانواده‌های جدید نیازمند به‌روزرسانی AUT-001 هستند |
| TAX-AUT-04 | هر خانواده می‌تواند زیرخانواده داشته باشد          |

---

## ۵. Canonical Workflow Registry

### ثبـت مرکزی شناسه‌های Workflow

این بخش **فهرست رسمی** همه Workflowهای SMOS است. هر Workflow یک شناسه یکتا دارد.

> **توجه:** این بخش فقط شناسه‌ها را ثبت می‌کند — پیاده‌سازی در AUT-NNN جداگانه انجام می‌شود.

#### AUT-CORE (Core Operations)

| شناسه       | نام                         | PLAT مرتبط | AI مرتبط                                       | وضعیت |
| ----------- | --------------------------- | ---------- | ---------------------------------------------- | ----- |
| AUT-001-001 | Content Pipeline            | ALL        | AI-000, AI-001, AI-002, AI-003, AI-004, AI-005 | Draft |
| AUT-001-002 | Publication Queue           | ALL        | AI-008, AI-014                                 | Draft |
| AUT-001-003 | Cross-Platform Distribution | ALL        | AI-008, AI-014                                 | Draft |
| AUT-001-004 | Content Approval            | ALL        | AI-004, Human                                  | Draft |

#### AUT-PLAT (Platform Operations)

| شناسه       | نام                       | PLAT مرتبط | AI مرتبط       | وضعیت |
| ----------- | ------------------------- | ---------- | -------------- | ----- |
| AUT-001-005 | Instagram Publishing      | PLAT-001   | AI-008         | Draft |
| AUT-001-006 | LinkedIn Publishing       | PLAT-002   | AI-008         | Draft |
| AUT-001-007 | Telegram Publishing       | PLAT-003   | AI-008         | Draft |
| AUT-001-008 | Bale Publishing           | PLAT-003   | AI-008         | Draft |
| AUT-001-009 | X/Twitter Publishing      | PLAT-004   | AI-008         | Draft |
| AUT-001-010 | YouTube Publishing        | PLAT-005   | AI-008         | Draft |
| AUT-001-011 | Aparat Publishing         | PLAT-006   | AI-008         | Draft |
| AUT-001-012 | Website Publishing        | PLAT-007   | AI-008         | Draft |
| AUT-001-013 | Instagram Monitoring      | PLAT-001   | AI-009, AI-010 | Draft |
| AUT-001-014 | LinkedIn Monitoring       | PLAT-002   | AI-009, AI-010 | Draft |
| AUT-001-015 | Telegram Monitoring       | PLAT-003   | AI-009, AI-010 | Draft |
| AUT-001-016 | YouTube Monitoring        | PLAT-005   | AI-009, AI-010 | Draft |
| AUT-001-017 | Aparat Monitoring         | PLAT-006   | AI-009, AI-010 | Draft |
| AUT-001-018 | Website Monitoring        | PLAT-007   | AI-009, AI-010 | Draft |
| AUT-001-019 | Instagram Engagement      | PLAT-001   | AI-013         | Draft |
| AUT-001-020 | LinkedIn Engagement       | PLAT-002   | AI-013         | Draft |
| AUT-001-021 | Telegram Engagement       | PLAT-003   | AI-013         | Draft |
| AUT-001-022 | X/Twitter Engagement      | PLAT-004   | AI-013         | Draft |
| AUT-001-023 | YouTube Engagement        | PLAT-005   | AI-013         | Draft |
| AUT-001-024 | Aparat Engagement         | PLAT-006   | AI-013         | Draft |
| AUT-001-025 | Website Engagement        | PLAT-007   | AI-013         | Draft |
| AUT-001-026 | Instagram Reporting       | PLAT-001   | AI-010         | Draft |
| AUT-001-027 | LinkedIn Reporting        | PLAT-002   | AI-010         | Draft |
| AUT-001-028 | Telegram Reporting        | PLAT-003   | AI-010         | Draft |
| AUT-001-029 | YouTube Reporting         | PLAT-005   | AI-010         | Draft |
| AUT-001-030 | Aparat Reporting          | PLAT-006   | AI-010         | Draft |
| AUT-001-031 | Website Reporting         | PLAT-007   | AI-010         | Draft |
| AUT-001-032 | Website SEO               | PLAT-007   | AI-010, AI-011 | Draft |
| AUT-001-033 | Website Internal Links    | PLAT-007   | AI-011         | Draft |
| AUT-001-034 | Website Content Refresh   | PLAT-007   | AI-011         | Draft |
| AUT-001-035 | Website Broken Links      | PLAT-007   | AI-009         | Draft |
| AUT-001-036 | Website Schema Validation | PLAT-007   | AI-009         | Draft |

#### AUT-AI (AI Operations)

| شناسه       | نام                          | PLAT مرتبط | AI مرتبط      | وضعیت |
| ----------- | ---------------------------- | ---------- | ------------- | ----- |
| AUT-001-037 | Agent Performance Evaluation | ALL        | AI-000, Human | Draft |
| AUT-001-038 | Agent Training Pipeline      | ALL        | AI-000        | Draft |
| AUT-001-039 | Human Feedback Collection    | ALL        | AI-013, Human | Draft |

#### AUT-KNW (Knowledge Operations)

| شناسه       | نام                           | PLAT مرتبط | AI مرتبط      | وضعیت |
| ----------- | ----------------------------- | ---------- | ------------- | ----- |
| AUT-001-040 | Knowledge Extraction          | ALL        | AI-011        | Draft |
| AUT-001-041 | Knowledge Graph Update        | ALL        | AI-011        | Draft |
| AUT-001-042 | Knowledge Quality Audit       | ALL        | AI-011, Human | Draft |
| AUT-001-043 | Cross-Platform Knowledge Sync | ALL        | AI-011        | Draft |

#### AUT-REP (Reporting Operations)

| شناسه       | نام                       | PLAT مرتبط | AI مرتبط      | وضعیت |
| ----------- | ------------------------- | ---------- | ------------- | ----- |
| AUT-001-044 | Weekly Performance Report | ALL        | AI-010        | Draft |
| AUT-001-045 | Monthly Strategic Report  | ALL        | AI-010, Human | Draft |
| AUT-001-046 | KPI Dashboard Update      | ALL        | AI-010        | Draft |
| AUT-001-047 | Quarterly Business Review | ALL        | AI-010, Human | Draft |

#### AUT-SYS (System Operations)

| شناسه       | نام              | PLAT مرتبط | AI مرتبط | وضعیت |
| ----------- | ---------------- | ---------- | -------- | ----- |
| AUT-001-048 | Backup Workflows | ALL        | —        | Draft |
| AUT-001-049 | Health Check     | ALL        | —        | Draft |
| AUT-001-050 | Version Update   | ALL        | —        | Draft |
| AUT-001-051 | Log Rotation     | ALL        | —        | Draft |

#### AUT-SEC (Security Operations)

| شناسه       | نام                     | PLAT مرتبط | AI مرتبط | وضعیت |
| ----------- | ----------------------- | ---------- | -------- | ----- |
| AUT-001-052 | Credential Rotation     | ALL        | —        | Draft |
| AUT-001-053 | Access Audit            | ALL        | —        | Draft |
| AUT-001-054 | Token Refresh           | ALL        | —        | Draft |
| AUT-001-055 | Security Alert Handling | ALL        | AI-009   | Draft |

#### AUT-DATA (Data Operations)

| شناسه       | نام                | PLAT مرتبط | AI مرتبط | وضعیت |
| ----------- | ------------------ | ---------- | -------- | ----- |
| AUT-001-056 | Data Sync          | ALL        | —        | Draft |
| AUT-001-057 | Data Migration     | ALL        | AI-011   | Draft |
| AUT-001-058 | Data Quality Check | ALL        | AI-010   | Draft |
| AUT-001-059 | Archive Old Data   | ALL        | —        | Draft |

---

## ۶. Workflow Metadata Standard

### فراداده استاندارد هر Workflow

هر Workflow در SMOS باید با بلوک فراداده زیر تعریف شود:

```json
{
  "workflow_metadata": {
    "id": "AUT-NNN-NNN",
    "name_fa": "نام فارسی",
    "name_en": "نام انگلیسی",
    "version": "1.0.0",
    "family": "AUT-CORE|AUT-PLAT|AUT-AI|AUT-KNW|AUT-REP|AUT-SYS|AUT-SEC|AUT-DATA",
    "owner": "نقش مالک",
    "authority_level": "A-1|A-2|A-3",
    "trigger": {
      "type": "manual|scheduled|event|webhook|queue|human_approval|ai_decision|system_event",
      "schedule": "cron expression (if scheduled)",
      "event_source": "source (if event-driven)"
    },
    "inputs": ["ورودی۱", "ورودی۲"],
    "outputs": ["خروجی۱", "خروجی۲"],
    "dependencies": ["AUT-NNN-NNN", "AUT-NNN-NNN"],
    "failure_policy": "retry|escalate|fallback|abort|manual",
    "retry_policy": {
      "max_retries": 3,
      "backoff_seconds": 30,
      "exponential_backoff": true
    },
    "timeout_seconds": 300,
    "audit_level": "all|execution|error|none"
  }
}
```

### فیلدهای اجباری

| فیلد                | توضیح                  | نوع    | مثال                 |
| ------------------- | ---------------------- | ------ | -------------------- |
| **id**              | شناسه یکتای Workflow   | string | `AUT-001-001`        |
| **name_fa**         | نام فارسی              | string | `خط لوله محتوا`      |
| **name_en**         | نام انگلیسی            | string | `Content Pipeline`   |
| **version**         | نسخه Semantic          | string | `1.0.0`              |
| **family**          | خانواده Workflow       | enum   | `AUT-CORE`           |
| **owner**           | نقش مالک               | string | `Media Director`     |
| **authority_level** | سطح اختیار از ARCH-032 | enum   | `A-2`                |
| **trigger.type**    | نوع محرک               | enum   | `scheduled`          |
| **inputs**          | ورودی‌ها               | array  | `["content_brief"]`  |
| **outputs**         | خروجی‌ها               | array  | `["published_post"]` |
| **dependencies**    | وابستگی‌ها             | array  | `["AUT-001-002"]`    |
| **failure_policy**  | سیاست خطا              | enum   | `retry`              |
| **timeout_seconds** | تایم‌اوت               | number | `300`                |
| **audit_level**     | سطح حسابرسی            | enum   | `all`                |

---

## ۷. Trigger Taxonomy

### انواع محرک Workflow

| نوع محرک           | شناسه   | توضیح                         | موارد استفاده                  |
| ------------------ | ------- | ----------------------------- | ------------------------------ |
| **Manual**         | TRG-MAN | اجرای دستی توسط انسان         | انتشار محتوای بحرانی           |
| **Scheduled**      | TRG-SCH | اجرای برنامه‌ریزی‌شده با Cron | انتشار روزانه, گزارش هفتگی     |
| **Event**          | TRG-EVT | واکنش به رویداد داخلی         | انتشار پس از تأیید             |
| **Webhook**        | TRG-WHK | فراخوانی خارجی                | دریافت داده از پلتفرم‌ها       |
| **Queue**          | TRG-QUE | مصرف از صف                    | پردازش批量 محتوا               |
| **Human Approval** | TRG-HAP | تأیید انسانی به عنوان محرک    | شروع زنجیره پس از تأیید        |
| **AI Decision**    | TRG-AID | تصمیم Agent به عنوان محرک     | درخواست تولید محتوا توسط Agent |
| **System Event**   | TRG-SEV | رویداد سیستمی                 | آستانه‌های نظارت, خطا          |

### ویژگی‌های محرک‌ها

| ویژگی          | توضیح           | اجباری |
| -------------- | --------------- | ------ |
| **Trigger ID** | شناسه یکتا      | ✓      |
| **Type**       | نوع محرک        | ✓      |
| **Source**     | منبع محرک       | ✓      |
| **Condition**  | شرط فعال‌سازی   | ✗      |
| **Payload**    | داده همراه محرک | ✗      |
| **Rate Limit** | محدودیت نرخ     | ✗      |

---

## ۸. Execution Model

### مدل‌های اجرا

هر Workflow در SMOS از یکی از مدل‌های اجرای زیر پیروی می‌کند:

| مدل              | شناسه  | توضیح                                     | مثال                        |
| ---------------- | ------ | ----------------------------------------- | --------------------------- |
| **Sequential**   | EX-SEQ | اجرای مرحله‌ای — هر مرحله پس از مرحله قبل | Content Pipeline            |
| **Parallel**     | EX-PAR | اجرای همزمان چند شاخه                     | Cross-Platform Distribution |
| **Conditional**  | EX-CND | انتخاب مسیر بر اساس شرط                   | Approval: مسیر تأیید/رد     |
| **Loop**         | EX-LOP | تکرار تا رسیدن به شرط خروج                | Retry Loop                  |
| **Saga**         | EX-SAG | زنجیره تراکنش‌های توزیع‌شده               | Multi-Platform Publication  |
| **Compensation** | EX-COM | جبران اقدام قبلی در صورت خطا              | Rollback Publication        |
| **Rollback**     | EX-RBK | بازگشت کامل به حالت قبل                   | Failed Migration            |

### قواعد اجرا

| قاعده   | توضیح                                                         |
| ------- | ------------------------------------------------------------- |
| EXEC-01 | هر Workflow باید مدل اجرای مشخصی داشته باشد                   |
| EXEC-02 | مدل‌های ترکیبی مجاز هستند (مثلاً Sequential با شاخه Parallel) |
| EXEC-03 | هر مرحله باید Timeout مشخص داشته باشد                         |
| EXEC-04 | مراحل Parallel باید ایزوله باشند (بدون حالت مشترک)            |
| EXEC-05 | مدل Saga باید Compensation برای هر مرحله داشته باشد           |

---

## ۹. Failure Model

### مدل خطا

| سیاست                   | شناسه | توضیح                 | موارد استفاده               |
| ----------------------- | ----- | --------------------- | --------------------------- |
| **Retry**               | F-RTY | تلاش مجدد با Backoff  | خطای API, Timeout موقت      |
| **Escalation**          | F-ESC | ارجاع به سطح بالاتر   | خطای پس از Retry, خطای مجوز |
| **Fallback**            | F-FLB | اجرای مسیر جایگزین    | سرویس اصلی در دسترس نیست    |
| **Abort**               | F-ABT | توقف کامل Workflow    | خطای بحرانی, نقض امنیت      |
| **Manual Intervention** | F-MAN | نیاز به مداخله انسانی | خطای غیرمنتظره, تصمیم‌گیری  |

### ماتریس تصمیم خطا

| نوع خطا              | سیاست اول       | سیاست دوم  | سیاست نهایی |
| -------------------- | --------------- | ---------- | ----------- |
| API Timeout          | Retry (۳ بار)   | Escalation | Manual      |
| API 401/403          | Abort           | Escalation | Manual      |
| API 404              | Fallback        | Escalation | Manual      |
| API 429 (Rate Limit) | Retry (Backoff) | Escalation | Manual      |
| Data Validation      | Abort           | Escalation | Manual      |
| Agent Unavailable    | Retry (۱ بار)   | Fallback   | Abort       |
| Network Error        | Retry (۵ بار)   | Fallback   | Abort       |
| Internal Error       | Retry (۲ بار)   | Escalation | Manual      |

### بلوک JSON

```json
{
  "failure_policy": {
    "primary": "retry",
    "max_retries": 3,
    "backoff_seconds": 30,
    "exponential_backoff": true,
    "escalation_after_retry": true,
    "fallback_workflow": "AUT-NNN-NNN",
    "manual_timeout_hours": 24,
    "notify_on_failure": ["AI-009", "human_admin"]
  }
}
```

---

## ۱۰. Authority Model

### مدل اختیار در Automation

سطوح اختیار مطابق [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md) در Workflowها اعمال می‌شود:

| سطح     | توضیح                   | مثال در Automation                         |
| ------- | ----------------------- | ------------------------------------------ |
| **A-1** | پیشنهاد به انسان        | Workflow پیشنهاد محتوا به انسان برای تأیید |
| **A-2** | اقدام با نظارت انسان    | انتشار خودکار با لاگ و قابلیت Cancel       |
| **A-3** | اقدام خودکار حوزه محدود | مانیتورینگ خودکار, گزارش‌گیری              |

### نگاشت Authority به Workflow

| سطح Workflow | قواعد                                                    |
| ------------ | -------------------------------------------------------- |
| A-1          | نیازمند تأیید انسانی قبل از اجرا — Human-in-the-Loop     |
| A-2          | اجرای خودکار — با امکان توقف انسانی — Human-on-the-Loop  |
| A-3          | اجرای کاملاً خودکار — Human-out-of-the-Loop — حوزه محدود |

### قواعد Authority

| قاعده   | توضیح                                                     |
| ------- | --------------------------------------------------------- |
| AUTH-01 | هر Workflow باید سطح Authority مشخص داشته باشد            |
| AUTH-02 | Workflow با A-3 باید دارای محدودیت دامنه (Scope) باشد     |
| AUTH-03 | تغییر Authority نیازمند تأیید System Architect است        |
| AUTH-04 | Authority Workflow نمی‌تواند از Authority Agent فراتر رود |

---

## ۱۱. AI Interaction Model

### مدل تعامل Automation با AI

```
┌─────────────────────────────────────────────────────────┐
│                    AUTOMATION                            │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│  │ Trigger  │──▶│ Validate │──▶│  Route   │            │
│  └──────────┘   └──────────┘   └────┬─────┘            │
│                                      │                  │
│              ┌───────────────────────┼──────────────┐   │
│              ▼                       ▼              ▼   │
│      ┌──────────────┐      ┌──────────────┐  ┌────────┐ │
│      │   Execute     │      │   AI Agent   │  │ Human  │ │
│      │ (Automation)  │      │ (AI-NNN)     │  │        │ │
│      └──────┬───────┘      └──────┬───────┘  └────────┘ │
│             │                     │                      │
│             ▼                     ▼                      │
│      ┌──────────────┐      ┌──────────────┐              │
│      │  Notify      │      │  Knowledge   │              │
│      │  & Audit     │      │  Update      │              │
│      └──────────────┘      └──────────────┘              │
└─────────────────────────────────────────────────────────┘
```

### انواع تعامل

| نوع تعامل                  | جهت            | توضیح                                    | مثال                          |
| -------------------------- | -------------- | ---------------------------------------- | ----------------------------- |
| **Automation → AI**        | درخواست تصمیم  | Automation از Agent درخواست تصمیم می‌کند | تحلیل داده قبل از گزارش       |
| **AI → Automation**        | دستور اجرا     | Agent به Automation دستور اجرا می‌دهد    | Agent تصمیم به انتشار می‌گیرد |
| **Automation → Human**     | درخواست تأیید  | Automation از انسان تأیید می‌خواهد       | تأیید محتوای بحرانی           |
| **Human → Automation**     | دستور اجرا     | انسان Workflow را راه‌اندازی می‌کند      | انتشار دستی                   |
| **Automation → Knowledge** | ذخیره دانش     | دانش جدید را در مخزن ثبت می‌کند          | استخراج دانش از تعاملات       |
| **Automation → Platform**  | اجرا در پلتفرم | API پلتفرم را فراخوانی می‌کند            | انتشار در اینستاگرام          |

### قواعد تعامل

| قاعده  | توضیح                                                                             |
| ------ | --------------------------------------------------------------------------------- |
| INT-01 | Automation هرگز تصمیم نمی‌گیرد — فقط اجرا می‌کند                                  |
| INT-02 | Agent هرگز مستقیماً API پلتفرم را فراخوانی نمی‌کند — از Automation استفاده می‌کند |
| INT-03 | تعامل Automation ↔ AI از طریق MCP انجام می‌شود                                    |
| INT-04 | همه تعاملات در Audit Log ثبت می‌شوند                                              |
| INT-05 | Timeout تعامل با AI نباید از ۳۰ ثانیه تجاوز کند                                   |

---

## ۱۲. Event Model

### رویدادهای استاندارد

هر Workflow رویدادهای استاندارد زیر را تولید می‌کند:

| شناسه رویداد | نام                          | توضیح                         | سطح      |
| ------------ | ---------------------------- | ----------------------------- | -------- |
| EVT-AUT-001  | Workflow Started             | Workflow آغاز شد              | Info     |
| EVT-AUT-002  | Workflow Completed           | Workflow با موفقیت پایان یافت | Info     |
| EVT-AUT-003  | Workflow Failed              | Workflow با خطا مواجه شد      | Error    |
| EVT-AUT-004  | Workflow Cancelled           | Workflow توسط انسان لغو شد    | Warning  |
| EVT-AUT-005  | Stage Started                | یک مرحله از Workflow آغاز شد  | Debug    |
| EVT-AUT-006  | Stage Completed              | یک مرحله با موفقیت پایان یافت | Info     |
| EVT-AUT-007  | Stage Failed                 | یک مرحله با خطا مواجه شد      | Error    |
| EVT-AUT-008  | Retry Attempt                | تلاش مجدد برای مرحله خطا      | Warning  |
| EVT-AUT-009  | Escalation Triggered         | ارجاع به سطح بالاتر           | Critical |
| EVT-AUT-010  | Fallback Activated           | مسیر جایگزین فعال شد          | Warning  |
| EVT-AUT-011  | Human Intervention Requested | درخواست مداخله انسانی         | Critical |
| EVT-AUT-012  | Approval Granted             | تأیید انسانی صادر شد          | Info     |
| EVT-AUT-013  | Approval Rejected            | تأیید انسانی رد شد            | Info     |
| EVT-AUT-014  | Threshold Breached           | آستانه KPI رد شد              | Warning  |
| EVT-AUT-015  | SLA Breached                 | مهلت SLA رد شد                | Critical |

### ساختار Event

```json
{
  "event": {
    "id": "EVT-AUT-001",
    "workflow_id": "AUT-NNN-NNN",
    "execution_id": "EXEC-2026-06-27-001",
    "timestamp": "2026-06-27T10:00:00Z",
    "severity": "info|warning|error|critical",
    "source": "workflow|agent|human|system",
    "message": "توضیح فارسی",
    "payload": {},
    "correlation_id": "CORR-UUID",
    "trace_id": "TRACE-UUID"
  }
}
```

---

## ۱۳. State Machine

### ماشین حالت Workflow

هر Workflow در SMOS از ماشین حالت زیر پیروی می‌کند:

```
                         ┌──────────┐
                         │  Created │
                         └────┬─────┘
                              │
                              ▼
                         ┌──────────┐
                         │  Queued  │
                         └────┬─────┘
                              │
                              ▼
                         ┌──────────┐
                    ┌───▶│ Running  │◀───┐
                    │    └────┬─────┘    │
                    │         │          │
                    │    ┌────┼────┐     │
                    │    ▼    ▼    ▼     │
                    │ ┌────┐ ┌───┐ ┌───┐ │
                    │ │Wait│ │...│ │OK │ │
                    │ └────┘ └───┘ └─┬─┘ │
                    │               │   │
                    └───────────────┘   │
                                        ▼
                                 ┌──────────┐
                            ┌───▶│ Succeeded│
                            │    └──────────┘
                            │
                    ┌───────┼───────┐
                    ▼       ▼       ▼
               ┌────────┐ ┌────────┐ ┌──────────┐
               │ Failed │ │Cancelled│ │ Archived │
               └────────┘ └────────┘ └──────────┘
```

### حالات استاندارد

| حالت          | شناسه     | توضیح                                     | گذار مجاز به                          |
| ------------- | --------- | ----------------------------------------- | ------------------------------------- |
| **Created**   | ST-AUT-01 | Workflow ایجاد شد اما هنوز فعال نشده      | Queued                                |
| **Queued**    | ST-AUT-02 | در صف انتظار برای اجرا                    | Running, Cancelled                    |
| **Running**   | ST-AUT-03 | در حال اجرا                               | Succeeded, Failed, Waiting, Cancelled |
| **Waiting**   | ST-AUT-04 | منتظر ورودی خارجی (تأیید انسان, پاسخ API) | Running, Cancelled                    |
| **Succeeded** | ST-AUT-05 | با موفقیت پایان یافت                      | Archived                              |
| **Failed**    | ST-AUT-06 | با خطا پایان یافت                         | Running (Retry), Archived             |
| **Cancelled** | ST-AUT-07 | توسط انسان لغو شد                         | Archived                              |
| **Archived**  | ST-AUT-08 | بایگانی‌شده — غیرقابل تغییر               | —                                     |

---

## ۱۴. Logging Standard

### ساختار لاگ

هر Workflow باید لاگ‌های خود را با ساختار زیر ثبت کند:

```json
{
  "log": {
    "timestamp": "2026-06-27T10:00:00.000Z",
    "level": "debug|info|warn|error|critical",
    "correlation_id": "CORR-UUID",
    "trace_id": "TRACE-UUID",
    "execution_id": "EXEC-2026-06-27-001",
    "workflow_id": "AUT-NNN-NNN",
    "stage": "stage_name",
    "action": "action_name",
    "message": "توضیح رویداد",
    "data": {},
    "error": {
      "code": "ERR-001",
      "message": "خطا",
      "stack": "stack trace (if available)"
    },
    "source": "agent|human|system|api",
    "duration_ms": 1234
  }
}
```

### سطوح لاگ

| سطح          | شناسه   | توضیح                           |
| ------------ | ------- | ------------------------------- |
| **DEBUG**    | LVL-DBG | اطلاعات اشکال‌زدایی — فقط توسعه |
| **INFO**     | LVL-INF | اطلاعات عمومی — پیگیری جریان    |
| **WARN**     | LVL-WRN | هشدار — نیاز به توجه            |
| **ERROR**    | LVL-ERR | خطا — قابل بازیابی              |
| **CRITICAL** | LVL-CRT | خطای بحرانی — مداخله فوری       |

### شناسه‌های الزامی

| شناسه              | توضیح                                   | ماندگاری     |
| ------------------ | --------------------------------------- | ------------ |
| **Correlation ID** | شناسه همبستگی — همه رویدادهای یک سناریو | کل چرخه حیات |
| **Trace ID**       | شناسه ردیابی — یک execution             | کل execution |
| **Execution ID**   | شناسه یکتای اجرا                        | هر بار اجرا  |

---

## ۱۵. Monitoring Model

### مدل نظارت

| معیار              | شناسه   | توضیح                         | آستانه هشدار  | آستانه بحرانی  |
| ------------------ | ------- | ----------------------------- | ------------- | -------------- |
| **Health**         | MON-HLT | Workflow در حال اجراست یا خیر | —             | Down > ۵ دقیقه |
| **Latency**        | MON-LAT | میانگین زمان اجرا             | > ۲× baseline | > ۵× baseline  |
| **Success Rate**   | MON-SUC | درصد موفقیت                   | < ۹۵٪         | < ۸۰٪          |
| **Queue Depth**    | MON-QUE | تعداد در صف انتظار            | > ۱۰          | > ۵۰           |
| **SLA Compliance** | MON-SLA | درصد رعایت SLA                | < ۹۸٪         | < ۹۵٪          |
| **Error Rate**     | MON-ERR | درصد خطا                      | > ۲٪          | > ۱۰٪          |
| **Retry Rate**     | MON-RTY | درصد Retry                    | > ۵٪          | > ۲۰٪          |
| **Resource Usage** | MON-RSC | مصرف RAM/CPU                  | > ۷۰٪         | > ۹۰٪          |

### بلوک JSON

```json
{
  "monitoring": {
    "health_check_interval_seconds": 60,
    "latency_threshold_warning_ms": 5000,
    "latency_threshold_critical_ms": 15000,
    "success_rate_threshold": 0.95,
    "error_rate_threshold": 0.02,
    "alert_channels": ["telegram", "email", "slack"],
    "auto_recovery": true
  }
}
```

---

## ۱۶. Security Model

### مدل امنیت

| مؤلفه                | توضیح                                 | استاندارد         |
| -------------------- | ------------------------------------- | ----------------- |
| **Secrets**          | ذخیره در n8n Credentials — هرگز در کد | AES-256           |
| **Credentials**      | Tokenها و API Keyها با دسترسی محدود   | Role-based        |
| **Token Management** | چرخش خودکار Tokenها                   | هر ۹۰ روز         |
| **Encryption**       | رمزنگاری داده‌های حساس در حال انتقال  | TLS 1.3           |
| **Audit Trail**      | ثبت همه دسترسی‌های امنیتی             | لاگ غیرقابل تغییر |
| **Access Control**   | دسترسی به Workflow بر اساس نقش        | RBAC              |

### قواعد امنیتی

| قاعده  | توضیح                                                   |
| ------ | ------------------------------------------------------- |
| SEC-01 | هیچ Credentialی در کد Workflow ذخیره نمی‌شود            |
| SEC-02 | همه Credentialها در n8n Credentials ذخیره می‌شوند       |
| SEC-03 | دسترسی به Workflowهای بحرانی محدود به roles مشخص است    |
| SEC-04 | Tokenهای منقضی شده باید فوراً چرخانده شوند              |
| SEC-05 | لاگ‌های امنیتی هرگز حذف نمی‌شوند                        |
| SEC-06 | خطاهای امنیتی (۴۰۱, ۴۰۳) به Security Alert منجر می‌شوند |

---

## ۱۷. Dependency Model

### مدل وابستگی Workflow

وابستگی بین Workflowها یک **DAG (Directed Acyclic Graph)** است.

```
AUT-001-001 (Content Pipeline)
    │
    ├──▶ AUT-001-002 (Publication Queue)
    │        │
    │        ├──▶ AUT-001-005 (Instagram Publishing)
    │        ├──▶ AUT-001-006 (LinkedIn Publishing)
    │        ├──▶ AUT-001-007 (Telegram Publishing)
    │        └──▶ AUT-001-012 (Website Publishing)
    │
    └──▶ AUT-001-040 (Knowledge Extraction)
             │
             └──▶ AUT-001-041 (Knowledge Graph Update)
```

### قواعد وابستگی

| قاعده  | توضیح                                                       |
| ------ | ----------------------------------------------------------- |
| DEP-01 | وابستگی‌ها باید صریحاً در Metadata Workflow ثبت شوند        |
| DEP-02 | گراف وابستگی باید DAG باشد — حلقه ممنوع                     |
| DEP-03 | وابستگی دایره‌ای (Circular Dependency) ممنوع — بررسی خودکار |
| DEP-04 | Workflow بالادست باید قبل از پاییندست اجرا شود              |
| DEP-05 | خطا در Workflow بالادست → توقف یا Fallback در پاییندست      |
| DEP-06 | گراف وابستگی باید قابل مشاهده باشد (Visualization)          |

### Dependency Graph بلوک

```json
{
  "dependency_graph": {
    "AUT-001-001": {
      "depends_on": [],
      "depended_by": ["AUT-001-002", "AUT-001-040"]
    },
    "AUT-001-002": {
      "depends_on": ["AUT-001-001"],
      "depended_by": ["AUT-001-005", "AUT-001-006", "AUT-001-007", "AUT-001-012"]
    },
    "AUT-001-005": {
      "depends_on": ["AUT-001-002"],
      "depended_by": []
    }
  }
}
```

---

## ۱۸. Versioning

### نسخه‌بندی Workflow

| نوع تغییر                        | سطح   | مثال          |
| -------------------------------- | ----- | ------------- |
| اصلاح خطا، به‌روزرسانی پارامتر   | PATCH | ۱.۰.۰ → ۱.۰.۱ |
| افزودن مرحله جدید، تغییر Trigger | MINOR | ۱.۰.۰ → ۱.۱.۰ |
| بازنویسی کامل، تغییر معماری      | MAJOR | ۱.۰.۰ → ۲.۰.۰ |

### قواعد نسخه‌بندی

| قاعده  | توضیح                                                            |
| ------ | ---------------------------------------------------------------- |
| VER-01 | هر Workflow نسخه Semantic دارد                                   |
| VER-02 | تغییر MINOR یا MAJOR نیازمند به‌روزرسانی AUT-001 و PLAT-\* مرتبط |
| VER-03 | دو نسخه متفاوت از یک Workflow نمی‌توانند همزمان فعال باشند       |
| VER-04 | نسخه قدیمی باید ۳۰ روز قبل از حذف Deprecated شود                 |
| VER-05 | مهاجرت از نسخه قدیم به جدید باید خودکار باشد                     |

---

## ۱۹. Governance

### حکمرانی Workflow

| نقش                     | مسئولیت                              |
| ----------------------- | ------------------------------------ |
| **System Architect**    | معماری کلی، تصویب Workflow جدید, ADR |
| **Automation Engineer** | پیاده‌سازی، نگهداری، مانیتورینگ      |
| **Platform Manager**    | تعیین نیازمندی‌های Workflow پلتفرم   |
| **Media Director**      | تصویب Workflowهای استراتژیک          |

### چرخه حیات Workflow

| مرحله              | ورودی         | خروجی               | مسئول                                  |
| ------------------ | ------------- | ------------------- | -------------------------------------- |
| **Identification** | نیاز عملیاتی  | پیشنهاد Workflow    | Platform Manager                       |
| **Design**         | پیشنهاد       | Metadata + DAG      | Automation Engineer                    |
| **Review**         | Metadata      | تأیید معماری        | System Architect                       |
| **Implementation** | Design        | Workflow در n8n     | Automation Engineer                    |
| **Testing**        | Workflow      | تست موفق            | Automation Engineer + Platform Manager |
| **Deployment**     | تست موفق      | Workflow فعال       | Automation Engineer                    |
| **Monitoring**     | Workflow فعال | Metrics             | AI-009                                 |
| **Deprecation**    | نسخه جدید     | Deprecated Workflow | Automation Engineer                    |

### قواعد حکمرانی

| قاعده      | توضیح                                              |
| ---------- | -------------------------------------------------- |
| GOV-AUT-01 | هر Workflow جدید نیازمند ثبت در AUT-001 است        |
| GOV-AUT-02 | تغییر MAJOR نیازمند ADR است                        |
| GOV-AUT-03 | هر Workflow باید Owner داشته باشد                  |
| GOV-AUT-04 | Workflow بدون Owner به مدت > ۳ ماه → Deprecated    |
| GOV-AUT-05 | Workflow بحرانی نیازمند Disaster Recovery Plan است |

---

## ۲۰. Machine Readable Blocks

### بلوک اصلی

```json
{
  "aut_metadata": {
    "doc_id": "AUT-001",
    "version": "1.0.0-draft",
    "status": "draft",
    "updated": "2026-06-27",
    "owner": "معمار سیستم",
    "upstream": ["ARCH-014", "ARCH-013", "ARCH-030", "ARCH-032", "EDT-001", "PLAT-000"],
    "downstream": ["AUT-*", "PLAT-*", "AI-*"]
  }
}
```

### Workflow Registry IDs

```json
{
  "workflow_registry": {
    "families": {
      "core": "AUT-CORE",
      "platform": "AUT-PLAT",
      "ai": "AUT-AI",
      "knowledge": "AUT-KNW",
      "reporting": "AUT-REP",
      "system": "AUT-SYS",
      "security": "AUT-SEC",
      "data": "AUT-DATA"
    },
    "workflows": {
      "total": 59,
      "items": [
        "AUT-001-001",
        "AUT-001-002",
        "AUT-001-003",
        "AUT-001-004",
        "AUT-001-005",
        "AUT-001-006",
        "AUT-001-007",
        "AUT-001-008",
        "AUT-001-009",
        "AUT-001-010",
        "AUT-001-011",
        "AUT-001-012",
        "AUT-001-013",
        "AUT-001-014",
        "AUT-001-015",
        "AUT-001-016",
        "AUT-001-017",
        "AUT-001-018",
        "AUT-001-019",
        "AUT-001-020",
        "AUT-001-021",
        "AUT-001-022",
        "AUT-001-023",
        "AUT-001-024",
        "AUT-001-025",
        "AUT-001-026",
        "AUT-001-027",
        "AUT-001-028",
        "AUT-001-029",
        "AUT-001-030",
        "AUT-001-031",
        "AUT-001-032",
        "AUT-001-033",
        "AUT-001-034",
        "AUT-001-035",
        "AUT-001-036",
        "AUT-001-037",
        "AUT-001-038",
        "AUT-001-039",
        "AUT-001-040",
        "AUT-001-041",
        "AUT-001-042",
        "AUT-001-043",
        "AUT-001-044",
        "AUT-001-045",
        "AUT-001-046",
        "AUT-001-047",
        "AUT-001-048",
        "AUT-001-049",
        "AUT-001-050",
        "AUT-001-051",
        "AUT-001-052",
        "AUT-001-053",
        "AUT-001-054",
        "AUT-001-055",
        "AUT-001-056",
        "AUT-001-057",
        "AUT-001-058",
        "AUT-001-059"
      ]
    }
  }
}
```

### State IDs

```json
{
  "state_ids": {
    "created": "ST-AUT-01",
    "queued": "ST-AUT-02",
    "running": "ST-AUT-03",
    "waiting": "ST-AUT-04",
    "succeeded": "ST-AUT-05",
    "failed": "ST-AUT-06",
    "cancelled": "ST-AUT-07",
    "archived": "ST-AUT-08"
  }
}
```

### Event IDs

```json
{
  "event_ids": {
    "workflow_started": "EVT-AUT-001",
    "workflow_completed": "EVT-AUT-002",
    "workflow_failed": "EVT-AUT-003",
    "workflow_cancelled": "EVT-AUT-004",
    "stage_started": "EVT-AUT-005",
    "stage_completed": "EVT-AUT-006",
    "stage_failed": "EVT-AUT-007",
    "retry_attempt": "EVT-AUT-008",
    "escalation_triggered": "EVT-AUT-009",
    "fallback_activated": "EVT-AUT-010",
    "human_intervention": "EVT-AUT-011",
    "approval_granted": "EVT-AUT-012",
    "approval_rejected": "EVT-AUT-013",
    "threshold_breached": "EVT-AUT-014",
    "sla_breached": "EVT-AUT-015"
  }
}
```

### Authority IDs

```json
{
  "authority_ids": {
    "a1_suggest": "A-1",
    "a2_supervised": "A-2",
    "a3_autonomous": "A-3"
  }
}
```

### Automation Types

```json
{
  "automation_types": {
    "execution_models": [
      "sequential",
      "parallel",
      "conditional",
      "loop",
      "saga",
      "compensation",
      "rollback"
    ],
    "trigger_types": [
      "manual",
      "scheduled",
      "event",
      "webhook",
      "queue",
      "human_approval",
      "ai_decision",
      "system_event"
    ],
    "failure_policies": ["retry", "escalation", "fallback", "abort", "manual"]
  }
}
```

### Log Levels

```json
{
  "log_levels": {
    "debug": "LVL-DBG",
    "info": "LVL-INF",
    "warn": "LVL-WRN",
    "error": "LVL-ERR",
    "critical": "LVL-CRT"
  }
}
```

### Monitoring Metrics

```json
{
  "monitoring_metrics": {
    "health": "MON-HLT",
    "latency": "MON-LAT",
    "success_rate": "MON-SUC",
    "queue_depth": "MON-QUE",
    "sla_compliance": "MON-SLA",
    "error_rate": "MON-ERR",
    "retry_rate": "MON-RTY",
    "resource_usage": "MON-RSC"
  }
}
```

---

## ۲۱. Validation Rules

### قواعد AUT-001

| #          | قاعده                                               | توضیح                       | نوع |
| ---------- | --------------------------------------------------- | --------------------------- | --- |
| VAL-AUT-01 | هدر سند باید شامل همه فیلدهای اجباری باشد           | missing_metadata            |
| VAL-AUT-02 | شناسه سند باید AUT-001 باشد                         | invalid_id                  |
| VAL-AUT-03 | نسخه سند باید Semantic X.Y.Z باشد                   | invalid_version             |
| VAL-AUT-04 | Canonical Registry شامل Workflowهای تکراری نباشد    | duplicate_workflow          |
| VAL-AUT-05 | شناسه هر Workflow یکتا است                          | duplicate_id                |
| VAL-AUT-06 | هر Workflow به یک خانواده تعلق دارد                 | missing_family              |
| VAL-AUT-07 | خانواده Workflow باید یکی از ۸ خانواده مجاز باشد    | invalid_family              |
| VAL-AUT-08 | هر Workflow Metadata کامل دارد (همه فیلدهای اجباری) | missing_metadata_field      |
| VAL-AUT-09 | سطح Authority باید A-1, A-2 یا A-3 باشد             | invalid_authority           |
| VAL-AUT-10 | Trigger Type باید یکی از ۸ نوع مجاز باشد            | invalid_trigger             |
| VAL-AUT-11 | Execution Model باید یکی از ۷ مدل مجاز باشد         | invalid_execution_model     |
| VAL-AUT-12 | Failure Policy باید یکی از ۵ سیاست مجاز باشد        | invalid_failure_policy      |
| VAL-AUT-13 | Dependency Graph باید DAG باشد — بدون دور           | circular_dependency         |
| VAL-AUT-14 | ارجاع به Workflow نامعتبر ممنوع                     | invalid_workflow_ref        |
| VAL-AUT-15 | ارجاع به Agent نامعتبر ممنوع                        | invalid_agent_ref           |
| VAL-AUT-16 | State Machine باید شامل همه ۸ حالت باشد             | missing_state               |
| VAL-AUT-17 | Event IDs باید یکتا باشند                           | duplicate_event             |
| VAL-AUT-18 | ارجاع به PLAT-\* باید معتبر باشد                    | invalid_plat_ref            |
| VAL-AUT-19 | محتوای تکراری از ARCH-014 مجاز نیست                 | duplicate_strategic_content |
| VAL-AUT-20 | خطا در Failure Policy ذکر نشده باشد                 | missing_error_case          |

---

## ۲۲. Quality Gates

### گیت‌های کیفیت AUT-001

| Gate                  | ترتیب | توضیح                                       | مسئول                        | خودکار؟ |
| --------------------- | ----- | ------------------------------------------- | ---------------------------- | ------- |
| **Metadata Gate**     | ۱     | بررسی کامل بودن Metadata هر Workflow        | Automation Engineer + Script | ✓       |
| **DAG Gate**          | ۲     | بررسی DAG بودن Dependency Graph (بدون دور)  | Script                       | ✓       |
| **Authority Gate**    | ۳     | بررسی تناسب Authority با Scope Workflow     | System Architect             | Partial |
| **Failure Gate**      | ۴     | بررسی وجود Failure Policy برای همه خطاها    | Automation Engineer          | ✓       |
| **Integration Gate**  | ۵     | بررسی ارجاعات به Agentها و PLAT-\*های معتبر | Script                       | ✓       |
| **Naming Gate**       | ۶     | بررسی تطابق نام‌گذاری با GOV-003            | Script                       | ✓       |
| **Architecture Gate** | ۷     | بررسی تطابق با ARCH-014 و ARCH-013          | System Architect             | Partial |
| **Governance Gate**   | ۸     | بررسی وجود Owner و Authority Level          | System Architect             | ✓       |

### معیارهای عبور

| Gate              | معیار قبولی                            |
| ----------------- | -------------------------------------- |
| Metadata Gate     | همه فیلدهای اجباری پر شده‌اند          |
| DAG Gate          | Dependency Graph بدون دور است          |
| Authority Gate    | Authority با Scope Workflow سازگار است |
| Failure Gate      | همه انواع خطا پوشش داده شده‌اند        |
| Integration Gate  | همه ارجاعات به منابع معتبر است         |
| Naming Gate       | شناسه‌ها مطابق GOV-003 هستند           |
| Architecture Gate | Workflow با ARCH-014 مغایرت ندارد      |
| Governance Gate   | Owner + Authority Level ثبت شده است    |

---

## ۲۳. Compliance Checklist

### چک‌لیست تطابق AUT-001

#### معماری

| #        | آیتم                                       | منبع                                                                               |
| -------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| C-AUT-01 | AUT-001 از ARCH-014 مشتق شده است           | [ARCH-014 §۳](../00-ARCHITECTURE/14-automation-model.md#۳-معماری-خودکارسازی)       |
| C-AUT-02 | جداسازی Automation و AI رعایت شده است      | [ARCH-014 §۸](../00-ARCHITECTURE/14-automation-model.md#۸-رابطه-با-Agentها)        |
| C-AUT-03 | Trigger Taxonomy با ARCH-014 §۴ هماهنگ است | [ARCH-014 §۴](../00-ARCHITECTURE/14-automation-model.md#۴-لایه‌های-خودکارسازی)     |
| C-AUT-04 | Authority Model از ARCH-032 مشتق شده است   | [ARCH-032 §۳](../00-ARCHITECTURE/32-ai-governance.md#۳-مدل-اختیار-authority-model) |

#### یکپارچگی

| #        | آیتم                                          | منبع                                                                        |
| -------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| C-AUT-05 | همه PLAT-\*های موجود در Registry ثبت شده‌اند  | [PLAT-\*](../20-PLATFORMS/)                                                 |
| C-AUT-06 | همه AI Agentها در تعاملات مشخص شده‌اند        | [ARCH-013 §۴](../00-ARCHITECTURE/13-ai-operating-model.md#۴-مشخصات-عامل‌ها) |
| C-AUT-07 | ارجاعات به GOV-_, ARCH-_, PLAT-\* معتبر هستند | [GOV-004](../10-GOVERNANCE/04-cross-references.md)                          |
| C-AUT-08 | نام‌گذاری شناسه‌ها مطابق GOV-003 است          | [GOV-003](../10-GOVERNANCE/03-naming-conventions.md)                        |

#### استاندارد

| #        | آیتم                                       | توضیح     |
| -------- | ------------------------------------------ | --------- |
| C-AUT-09 | همه Workflowها Metadata کامل دارند         | مطابق §۶  |
| C-AUT-10 | Dependency Graph DAG است                   | مطابق §۱۷ |
| C-AUT-11 | همه Trigger Types از ۸ نوع مجاز هستند      | مطابق §۷  |
| C-AUT-12 | همه Execution Models از ۷ مدل مجاز هستند   | مطابق §۸  |
| C-AUT-13 | همه Failure Policies از ۵ سیاست مجاز هستند | مطابق §۹  |
| C-AUT-14 | State Machine شامل ۸ حالت است              | مطابق §۱۳ |
| C-AUT-15 | Event IDs استاندارد هستند                  | مطابق §۱۲ |

#### کیفیت

| #        | آیتم                                         | توضیح     |
| -------- | -------------------------------------------- | --------- |
| C-AUT-16 | همه Validation Rules پاس می‌شوند             | مطابق §۲۱ |
| C-AUT-17 | همه Quality Gates پاس می‌شوند                | مطابق §۲۲ |
| C-AUT-18 | Owner برای هر Workflow ثبت شده است           | مطابق §۱۹ |
| C-AUT-19 | Authority Level برای هر Workflow ثبت شده است | مطابق §۱۰ |
| C-AUT-20 | خطاهای امنیتی پوشش داده شده‌اند              | مطابق §۱۶ |

---

## ۲۴. Cross References

### ارجاعات به ARCH

| سند                                                          | بخش‌های مرتبط                                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| [ARCH-014](../00-ARCHITECTURE/14-automation-model.md)        | §۳ معماری خودکارسازی, §۴ لایه‌ها, §۵ گردش کارها, §۸ رابطه با Agentها |
| [ARCH-013](../00-ARCHITECTURE/13-ai-operating-model.md)      | §۴ مشخصات Agentها, §۶ تعامل Automation ↔ AI                          |
| [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md) | §۴ RACI, §۶ حکمرانی                                                  |
| [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md)           | §۳ مدل اختیار, §۴ مرزهای اختیار                                      |
| [ARCH-011](../00-ARCHITECTURE/11-object-model.md)            | OBJ-014 (Workflow), OBJ-020 (Event), OBJ-021 (State)                 |

### ارجاعات به GOV

| سند                                                       | بخش‌های مرتبط                       |
| --------------------------------------------------------- | ----------------------------------- |
| [GOV-001](../10-GOVERNANCE/01-documentation-standards.md) | قالب مستندات, فراداده               |
| [GOV-003](../10-GOVERNANCE/03-naming-conventions.md)      | شناسه‌های AUT-NNN, EVT-AUT-NNN      |
| [GOV-004](../10-GOVERNANCE/04-cross-references.md)        | DAG ارجاعات, ممنوعیت ارجاع دایره‌ای |

### ارجاعات به EDT

| سند                                                 | بخش‌های مرتبط                          |
| --------------------------------------------------- | -------------------------------------- |
| [EDT-001](../24-EDITORIAL/10-content-guidelines.md) | §۱۵ چرخه حیات محتوا (ورودی Workflowها) |

### ارجاعات به PLAT

| سند                                                          | بخش‌های مرتبط                                      |
| ------------------------------------------------------------ | -------------------------------------------------- |
| [PLAT-000](../20-PLATFORMS/00-platform-playbook-standard.md) | §۲۱ Automation Interfaces, §۲۷ Workflow References |
| [PLAT-\*](../20-PLATFORMS/)                                  | هر PLAT-\* §۲۶ خودکارسازی, §۲۷ Workflow            |

### ارجاعات به BRD

| سند                                         | بخش‌های مرتبط                        |
| ------------------------------------------- | ------------------------------------ |
| [BRD-001](../22-BRAND/10-brand-identity.md) | هویت برند در خودکارسازی (Brand Gate) |
| [BRD-002](../22-BRAND/20-brand-voice.md)    | صدای برند در ارتباطات خودکار         |

---

## ۲۵. Reading Guide

### راهنمای خواندن این سند

| مخاطب                   | بخش‌های کلیدی             | اقدام                                 |
| ----------------------- | ------------------------- | ------------------------------------- |
| **System Architect**    | ۱, ۲, ۳, ۴, ۱۷, ۱۹, ۲۴    | تصویب معماری, مدیریت Dependency Graph |
| **Automation Engineer** | ۵, ۶, ۷, ۸, ۹, ۱۰, ۱۳, ۱۴ | پیاده‌سازی Workflowها در n8n          |
| **Platform Manager**    | ۵ (AUT-PLAT), ۱۱, ۲۴      | تعریف نیازمندی‌های Workflow پلتفرم    |
| **AI Engineer**         | ۱۰, ۱۱, ۲۵ (AI Agent)     | تعریف تعامل Agent ↔ Automation        |
| **Security Officer**    | ۱۶, ۱۹                    | بررسی امنیت و حکمرانی                 |
| **n8n Instance**        | ۶, ۱۲, ۱۳, ۱۴, ۲۰         | Metadata Validation, Event Generation |
| **MCP Server**          | ۱۱, ۲۰                    | Context Provision برای Agentها        |
| **AI Agents**           | ۶, ۱۰, ۱۱, ۱۲             | درک چگونگی تعامل با Automation        |

### مسیر خواندن وابسته

```
برای درک کامل معماری خودکارسازی SMOS:
1. [ARCH-014](../00-ARCHITECTURE/14-automation-model.md) — مدل خودکارسازی پایه
2. [ARCH-013](../00-ARCHITECTURE/13-ai-operating-model.md) — مدل عملیاتی Agentها
3. [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md) — مدل اختیار
4. AUT-001 (این سند) — نمایه خودکارسازی
5. [PLAT-*](../20-PLATFORMS/) — کتابچه پلتفرم (برای Workflowهای خاص)
```

> **اتوماسیون خوب مثل یه ارکستر خوب می‌مونه — هر کی ساز خودشو بزنه، آهنگ درست میشه.**
