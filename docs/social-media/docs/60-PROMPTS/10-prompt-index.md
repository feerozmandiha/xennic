# Enterprise Prompt Index — نمایه پرامپت سازمانی SMOS

> **شناسه:** PRM-001
> **وضعیت:** پیش‌نویس
> **نسخه:** 2.7.0-draft
> **به‌روزرسانی:** 2026-06-29
> **مسئول:** معمار سیستم
> **وابستگی:** [PRM-000](./00-enterprise-prompt-architecture.md), [ARCH-013](../00-ARCHITECTURE/13-ai-operating-model.md), [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md), [AI-000](../40-AI-AGENTS/00-enterprise-ai-agent-architecture.md), [AUT-000](../50-AUTOMATION/00-enterprise-automation-architecture.md), [AUT-001](../30-AUTOMATION/00-automation-index.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md), [GOV-001](../10-GOVERNANCE/01-documentation-standards.md), [GOV-003](../10-GOVERNANCE/03-naming-conventions.md), [GOV-004](../10-GOVERNANCE/04-cross-references.md)
> **مخاطب:** human, ai-agent, mcp, workflow-engine, prompt-engineer

---

## Architectural Dependencies

### Why This Document Exists

SMOS شامل ده‌ها پرامپت سازمانی در خانواده‌ها و Agentهای مختلف است. بدون یک نمایه مرکزی:

- هر PRM-\* ساختار متفاوتی خواهد داشت
- شناسه‌های تکراری یا متضاد ایجاد می‌شوند
- وابستگی بین پرامپت‌ها غیرقابل ردیابی است
- نگاشت پرامپت به Agent و Workflow نامشخص می‌ماند
- Governance و حسابرسی پرامپت غیرممکن است

PRM-001 این مشکلات را با تعریف یک **چارچوب نمایه پرامپت سازمانی** حل می‌کند که همه PRM-\*ها از آن پیروی می‌کنند.

### Problems It Solves

1. **نبود استاندارد**: هر پرامپت ساختار متفاوت → یکسان‌سازی با Metadata Standard
2. **شناسه‌های پراکنده**: تداخل شناسه‌ها → Canonical Registry مرکزی
3. **وابستگی نامشخص**: زنجیره پرامپت‌ها نامشخص → Dependency Model با DAG
4. **نگاشت ناقص**: ارتباط پرامپت با Agent و Workflow نامشخص → Mapping Matrix
5. **توسعه‌ناپذیر**: اضافه‌شدن پرامپت جدید بدون بازطراحی → Reserved Identifier Space

### Explicit Scope

این سند فقط تعریف می‌کند:

- فلسفه و اصول نمایه پرامپت SMOS
- Canonical Identifier Rules
- خانواده‌ها، انواع و سطوح پرامپت
- استاندارد فراداده و شناسه‌گذاری
- ثبت مرکزی همه پرامپت‌ها
- نگاشت پرامپت به Agent, Automation, Knowledge
- Dependency Registry پرامپت‌ها
- ماشین وضعیت و چرخه حیات در Registry
- جدول شناسه‌های رزروشده
- Catalog کامل پرامپت‌های برنامه‌ریزی‌شده

### Explicit Non-Scope

این سند هرگز شامل موارد زیر نیست:

- محتوای پرامپت (در PRM-NNN)
- معماری پرامپت (در PRM-000)
- پیاده‌سازی Agent (در AI-\*)
- پیاده‌سازی Workflow (در AUT-\*)
- کد، اسکریپت، API
- Vendor-specific syntax
- مثال پرامپت

### Upstream Dependencies

| سند                                                                  | نوع وابستگی | دلیل                                         |
| -------------------------------------------------------------------- | ----------- | -------------------------------------------- |
| [PRM-000](./00-enterprise-prompt-architecture.md)                    | depends-on  | معماری پرامپت پایه — هویت، تاکسونومی، قواعد  |
| [ARCH-013](../00-ARCHITECTURE/13-ai-operating-model.md)              | depends-on  | مدل عملیاتی Agentها — مصرف‌کنندگان پرامپت    |
| [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md)         | depends-on  | حکمرانی، RACI، تصمیمات                       |
| [AI-000](../40-AI-AGENTS/00-enterprise-ai-agent-architecture.md)     | depends-on  | معماری Agentها — مصرف‌کنندگان اصلی پرامپت    |
| [AUT-000](../50-AUTOMATION/00-enterprise-automation-architecture.md) | depends-on  | معماری Automation — اجرای پرامپت در Workflow |
| [AUT-001](../30-AUTOMATION/00-automation-index.md)                   | interacts   | Workflowهای مصرف‌کننده پرامپت                |
| [EDT-001](../24-EDITORIAL/10-content-guidelines.md)                  | depends-on  | چرخه حیات محتوا — بافت پرامپت‌های محتوا      |
| [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)                    | depends-on  | تاکسونومی محتوا — بافت پرامپت‌های محتوا      |
| [CON-000](../05-CONSTITUTION/00-constitution.md)                     | governs     | اصول عالی، کیفیت، حاکمیت                     |
| [GOV-001](../10-GOVERNANCE/01-documentation-standards.md)            | follows     | استاندارد نگارش                              |
| [GOV-003](../10-GOVERNANCE/03-naming-conventions.md)                 | follows     | قراردادهای نام‌گذاری                         |

### Downstream Dependencies

| سند                         | نوع وابستگی  | دلیل                                 |
| --------------------------- | ------------ | ------------------------------------ |
| [PRM-\*](./)                | derived-from | همه PRM-\*ها از PRM-001 مشتق می‌شوند |
| [AI-\*](../40-AI-AGENTS/)   | interacts    | Agentها از پرامپت‌ها استفاده می‌کنند |
| [AUT-\*](../30-AUTOMATION/) | uses         | Workflowها پرامپت‌ها را اجرا می‌کنند |
| [DEPLOY-\*](../15-DEPLOY/)  | implements   | استقرار پرامپت‌ها طبق DEPLOY-001     |

### SSOT Ownership

| موضوع                       | SSOT                  |
| --------------------------- | --------------------- |
| Canonical Prompt Registry   | **PRM-001** (این سند) |
| Prompt Identifier Rules     | **PRM-001** (این سند) |
| Prompt Family Registry      | **PRM-001** (این سند) |
| Prompt Type Registry        | **PRM-001** (این سند) |
| Prompt Complexity Registry  | **PRM-001** (این سند) |
| Prompt Ownership Registry   | **PRM-001** (این سند) |
| Prompt → Agent Mapping      | **PRM-001** (این سند) |
| Prompt → Automation Mapping | **PRM-001** (این سند) |
| Prompt → Knowledge Mapping  | **PRM-001** (این سند) |
| Reserved Identifier Table   | **PRM-001** (این سند) |
| Prompt Architecture         | PRM-000               |
| Prompt Implementation       | PRM-NNN               |

### Related ADRs

| ADR     | عنوان                             | ارتباط                 |
| ------- | --------------------------------- | ---------------------- |
| ADR-010 | معماری متا به عنوان الگوی عملیاتی | لایه پرامپت در معماری  |
| ADR-013 | جداسازی Automation و Agent        | پرامپت به عنوان واسط   |
| ADR-019 | حکمرانی ۱۰ لایه                   | لایه پرامپت در حکمرانی |

### Related Objects (from ARCH-011)

Prompt (PRM-\*), AI Agent (OBJ-015), Content Piece (OBJ-004), Publication (OBJ-022), Metric (OBJ-017), Knowledge Asset (OBJ-018)

### Related AI Agents (from ARCH-013)

All 14 agents from AI-001 to AI-014 consume prompts as defined in PRM-000.

---

## ۱. Purpose

### جایگاه پرامپت در SMOS

پرامپت‌ها در SMOS لایه واسط بین **لایه Agent (AI-\*)** و **لایه اجرا (AUT-\*)** هستند. هر Agent از پرامپت‌های استاندارد برای ارتباط با LLM استفاده می‌کند.

```
┌─────────────────────────────────────────────────────────┐
│                   AI Agent Layer                         │
│  (Decision, Creation, Analysis, Knowledge)               │
│  AI-000 to AI-014                                        │
└──────────────────────────┬──────────────────────────────┘
                           │ Agent Instruction
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Prompt Layer                           │
│  (Instruction, Context, Variables, Composition)           │
│  PRM-001 — PRM-NNN                                        │
├─────────────────────────────────────────────────────────┤
│  Registry · Identity · DAG · Mapping                     │
└──────────────────────────┬──────────────────────────────┘
                           │ Prompt Resolution
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Automation Layer                          │
│  (Execution, Composition, Routing)                       │
│  AUT-000 to AUT-NNN                                      │
└─────────────────────────────────────────────────────────┘
```

### سه اصل بنیادین

| اصل                                | توضیح                                     |
| ---------------------------------- | ----------------------------------------- |
| **PRM-000 معماری را تعریف می‌کند** | ساختار، هویت، ترکیب، بافت، متغیر، وابستگی |
| **PRM-001 نمایه را نگه می‌دارد**   | ثبت مرکزی، نگاشت، شناسه‌ها، وابستگی‌ها    |
| **PRM-NNN پیاده‌سازی می‌کند**      | محتوای پرامپت، متغیرها، بافت              |

### اهداف PRM-001

1. **ایجاد زبان مشترک**: همه PRM-\*ها از یک چارچوب شناسه‌گذاری واحد پیروی می‌کنند
2. **جلوگیری از هرج‌ومرج**: شناسه‌ها، فراداده و ساختار یکسان
3. **قابلیت ردیابی**: هر پرامپت قابل ردیابی، حسابرسی و اشکال‌زدایی است
4. **مقیاس‌پذیری**: پرامپت جدید بدون بازطراحی معماری اضافه می‌شود
5. **نگاشت کامل**: ارتباط پرامپت با Agentها، Workflowها و دانش مشخص است
6. **حکمرانی یکپارچه**: همه پرامپت‌ها تابع Governance یکسان هستند

### اصول PRM-001

| اصل            | توضیح                                                     |
| -------------- | --------------------------------------------------------- |
| **PRM-001-01** | هر پرامپت یک شناسه یکتا دارد — بدون استثنا                |
| **PRM-001-02** | هر پرامپت دارای فراداده کامل مطابق Metadata Standard است  |
| **PRM-001-03** | هر پرامپت دارای وابستگی‌های مشخص است                      |
| **PRM-001-04** | نگاشت پرامپت به Agent و Workflow باید در Registry ثبت شود |
| **PRM-001-05** | تغییر در چارچوب PRM-001 نیازمند ADR است                   |

---

## ۲. Prompt Registry

### معماری Registry

Registry پرامپت SMOS یک **ثبت مرکزی سلسله‌مراتبی** است که همه پرامپت‌ها را با ساختار زیر مدیریت می‌کند:

```
PRM-000 (معماری پرامپت)
  │
PRM-001 (نمایه پرامپت — این سند)
  │
  ├── FAM-STR (PRM-1xx: Strategic)
  │     ├── PRM-101 — Content Strategy
  │     ├── PRM-102 — Editorial Calendar
  │     └── ...
  │
  ├── FAM-CON (PRM-2xx: Content)
  │     ├── PRM-201 — Content Production
  │     ├── PRM-202 — Content Review
  │     └── ...
  │
  ├── FAM-OPS (PRM-3xx: Operations)
  │     ├── PRM-301 — Platform Publishing
  │     ├── PRM-302 — Community Engagement
  │     └── ...
  │
  ├── FAM-KNW (PRM-4xx: Knowledge)
  │     ├── PRM-401 — Knowledge Retrieval
  │     ├── PRM-402 — Research Analysis
  │     └── ...
  │
  └── FAM-SYS (PRM-9xx: System)
        ├── PRM-901 — Orchestration Instruction
        ├── PRM-902 — Agent Communication
        └── ...
```

### قواعد Registry

| ID      | قاعده                                                               |
| ------- | ------------------------------------------------------------------- |
| REG-R01 | همه پرامپت‌ها باید در PRM-001 ثبت شوند                              |
| REG-R02 | وضعیت پرامپت در Registry باید با وضعیت واقعی همخوانی داشته باشد     |
| REG-R03 | تغییر وضعیت باید ظرف ۲۴ ساعت در Registry منعکس شود                  |
| REG-R04 | Registry باید توسط ماشین (JSON) و انسان (Markdown) قابل خواندن باشد |
| REG-R05 | شناسه‌های حذف‌شده هرگز به پرامپت دیگر اختصاص نمی‌یابند              |
| REG-R06 | هر پرامپت دقیقاً به یک خانواده تعلق دارد                            |

---

## ۳. Canonical Identifier Rules

### قالب شناسه

هر پرامپت در SMOS دارای شناسه یکتای زیر است:

```
PRM-NNN
```

| بخش     | توضیح                     | مثال          |
| ------- | ------------------------- | ------------- |
| **PRM** | Prefix ثابت همه پرامپت‌ها | PRM           |
| **NNN** | شماره سه‌رقمی             | 001, 101, 901 |

### قواعد شماره‌گذاری

| ID     | قاعده                                                     |
| ------ | --------------------------------------------------------- |
| ID-R01 | شماره‌های ۰۰۱–۰۹۹: اسناد پایه و نمایه (PRM-000 محفوظ است) |
| ID-R02 | شماره‌های ۱۰۰–۱۹۹: خانواده Strategic (FAM-STR)            |
| ID-R03 | شماره‌های ۲۰۰–۲۹۹: خانواده Content (FAM-CON)              |
| ID-R04 | شماره‌های ۳۰۰–۳۹۹: خانواده Operations (FAM-OPS)           |
| ID-R05 | شماره‌های ۴۰۰–۴۹۹: خانواده Knowledge (FAM-KNW)            |
| ID-R06 | شماره‌های ۹۰۰–۹۹۹: خانواده System (FAM-SYS)               |
| ID-R07 | شماره‌های ۵۰۰–۸۹۹: رزرو برای توسعه آینده                  |
| ID-R08 | شماره سند حذف‌شده هرگز به سند دیگر اختصاص نمی‌یابد        |

### فراداده استاندارد هر پرامپت

هر پرامپت در SMOS باید با بلوک فراداده زیر تعریف شود:

```json
{
  "prompt_metadata": {
    "id": "PRM-NNN",
    "name_fa": "نام فارسی",
    "name_en": "نام انگلیسی",
    "version": "1.0.0",
    "family": "FAM-STR|FAM-CON|FAM-OPS|FAM-KNW|FAM-SYS",
    "type": "PT-01|PT-02|PT-03|PT-04|PT-05|PT-06|PT-07",
    "complexity": "C-0|C-1|C-2|C-3|C-4",
    "authority": "A-0|A-1|A-2|A-3|A-4",
    "owner": "نقش مالک",
    "consumers": ["AI-NNN", "AUT-NNN"],
    "dependencies": ["PRM-NNN"],
    "context_sources": ["CTX-01", "CTX-02"],
    "variables": ["var_name_1", "var_name_2"],
    "security_level": "SL-01|SL-02|SL-03|SL-04",
    "status": "draft|review|approved|active|deprecated|retired"
  }
}
```

### فیلدهای اجباری

| فیلد                | توضیح              | نوع    | مثال                           |
| ------------------- | ------------------ | ------ | ------------------------------ |
| **id**              | شناسه یکتای پرامپت | string | `PRM-101`                      |
| **name_fa**         | نام فارسی          | string | `استراتژی محتوا`               |
| **name_en**         | نام انگلیسی        | string | `Content Strategy`             |
| **version**         | نسخه Semantic      | string | `1.0.0`                        |
| **family**          | خانواده پرامپت     | enum   | `FAM-STR`                      |
| **type**            | نوع پرامپت         | enum   | `PT-01`                        |
| **complexity**      | سطح پیچیدگی        | enum   | `C-2`                          |
| **authority**       | سطح اختیار         | enum   | `A-2`                          |
| **owner**           | نقش مالک           | string | `Content Strategist`           |
| **consumers**       | مصرف‌کنندگان       | array  | `["AI-001"]`                   |
| **dependencies**    | وابستگی‌ها         | array  | `["PRM-401"]`                  |
| **context_sources** | منابع بافت         | array  | `["CTX-02"]`                   |
| **variables**       | متغیرها            | array  | `["platform", "content_body"]` |
| **security_level**  | سطح امنیتی         | enum   | `SL-02`                        |
| **status**          | وضعیت جاری         | enum   | `active`                       |

---

## ۴. Prompt Families

### خانواده‌های ثبت‌شده

همه پرامپت‌های SMOS در یکی از پنج خانواده زیر ثبت می‌شوند:

| شناسه       | خانواده    | پیشوند عددی | توضیح                                              | لایه معماری | Agent مصرف‌کننده                                               |
| ----------- | ---------- | ----------- | -------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| **FAM-STR** | Strategic  | PRM-1xx     | پرامپت‌های استراتژیک — برنامه‌ریزی، تحلیل، تصمیم   | PLYR-01     | AI-001, AI-002, AI-012, AI-013                                 |
| **FAM-CON** | Content    | PRM-2xx     | پرامپت‌های محتوا — تولید، بازبینی، بهینه‌سازی      | PLYR-02     | AI-003, AI-004, AI-005, AI-006, AI-007                         |
| **FAM-OPS** | Operations | PRM-3xx     | پرامپت‌های عملیات — انتشار، تعامل، گزارش           | PLYR-02     | AI-008, AI-009, AI-010                                         |
| **FAM-KNW** | Knowledge  | PRM-4xx     | پرامپت‌های دانش — بازیابی، استخراج، پژوهش، یادگیری | PLYR-01     | AI-011, AI-010, AI-012, AI-001, AI-002, AI-004, AI-014, AI-013 |
| **FAM-SYS** | System     | PRM-9xx     | پرامپت‌های سیستم — Orchestration, Communication    | PLYR-03     | AI-014, همه Agentها                                            |

### قواعد خانواده

| قاعده  | توضیح                                                        |
| ------ | ------------------------------------------------------------ |
| FAM-01 | هر پرامپت دقیقاً به یک خانواده تعلق دارد                     |
| FAM-02 | خانواده پرامپت در شناسه PRM-NNN منعکس می‌شود                 |
| FAM-03 | خانواده‌های جدید نیازمند به‌روزرسانی PRM-001 و PRM-000 هستند |
| FAM-04 | هر خانواده می‌تواند زیرخانواده داشته باشد                    |

---

## ۵. Prompt Categories

هر خانواده پرامپت به زیرخانواده‌های موضوعی تقسیم می‌شود:

### FAM-STR: Strategic

| کد      | زیرخانواده   | دامنه شناسه     | توضیح                            |
| ------- | ------------ | --------------- | -------------------------------- |
| STR-PLN | Planning     | PRM-101–PRM-109 | پرامپت‌های برنامه‌ریزی استراتژیک |
| STR-DEC | Decision     | PRM-110–PRM-119 | پرامپت‌های تصمیم‌گیری            |
| STR-ANL | Analysis     | PRM-120–PRM-129 | پرامپت‌های تحلیل استراتژیک       |
| STR-RES | Research     | PRM-130–PRM-139 | پرامپت‌های پژوهش استراتژیک       |
| STR-OPT | Optimization | PRM-140–PRM-149 | پرامپت‌های بهینه‌سازی استراتژیک  |

### FAM-CON: Content

| کد      | زیرخانواده   | دامنه شناسه     | توضیح                            |
| ------- | ------------ | --------------- | -------------------------------- |
| CON-PRD | Production   | PRM-201–PRM-209 | پرامپت‌های تولید محتوا           |
| CON-RVW | Review       | PRM-210–PRM-219 | پرامپت‌های بازبینی و تضمین کیفیت |
| CON-SEO | Optimization | PRM-220–PRM-229 | پرامپت‌های بهینه‌سازی جستجو      |
| CON-MED | Media        | PRM-230–PRM-239 | پرامپت‌های تولید دارایی رسانه    |
| CON-VID | Video        | PRM-240–PRM-249 | پرامپت‌های تولید ویدئو           |
| CON-FMT | Format       | PRM-250–PRM-259 | پرامپت‌های قالب‌بندی پلتفرمی     |

### FAM-OPS: Operations

| کد      | زیرخانواده | دامنه شناسه     | توضیح                     |
| ------- | ---------- | --------------- | ------------------------- |
| OPS-PUB | Publishing | PRM-301–PRM-309 | پرامپت‌های انتشار و توزیع |
| OPS-CMG | Community  | PRM-310–PRM-319 | پرامپت‌های تعامل با جامعه |
| OPS-RPT | Reporting  | PRM-320–PRM-329 | پرامپت‌های گزارش‌گیری     |
| OPS-MON | Monitoring | PRM-330–PRM-339 | پرامپت‌های نظارت عملیاتی  |
| OPS-MON | Monitoring | PRM-330–PRM-339 | پرامپت‌های نظارت          |

### FAM-KNW: Knowledge

| کد      | زیرخانواده              | دامنه شناسه     | توضیح                                              |
| ------- | ----------------------- | --------------- | -------------------------------------------------- |
| KNW-RTR | Retrieval & Extraction  | PRM-401–PRM-409 | پرامپت‌های بازیابی، استخراج و ثبت دانش — تکمیل‌شده |
| KNW-EXT | Extraction & Enrichment | PRM-410–PRM-419 | پرامپت‌های استخراج و غنی‌سازی دانش                 |
| KNW-RSR | Research                | PRM-420–PRM-429 | پرامپت‌های پژوهش و تحلیل — تکمیل‌شده               |
| KNW-LRN | Learning                | PRM-430–PRM-439 | پرامپت‌های یادگیری و بهبود — تکمیل‌شده             |

### FAM-SYS: System

| کد      | زیرخانواده     | دامنه شناسه     | توضیح                         |
| ------- | -------------- | --------------- | ----------------------------- |
| SYS-ORC | Orchestration  | PRM-901–PRM-909 | پرامپت‌های هماهنگ‌سازی        |
| SYS-COM | Communication  | PRM-910–PRM-919 | پرامپت‌های ارتباط بین Agentها |
| SYS-ERR | Error Handling | PRM-920–PRM-929 | پرامپت‌های مدیریت خطا         |
| SYS-MTA | Meta           | PRM-930–PRM-939 | پرامپت‌های متا (انتخاب مسیر)  |

---

## ۶. Prompt Type Registry

### انواع ثبت‌شده

| شناسه     | نوع               | توضیح                          | خانواده‌های مجاز | سطح پیچیدگی پیشنهادی |
| --------- | ----------------- | ------------------------------ | ---------------- | -------------------- |
| **PT-01** | System Definition | تعریف هویت، مرز و شخصیت        | FAM-SYS, FAM-STR | C-2                  |
| **PT-02** | Instruction       | دستورالعمل اجرایی مشخص         | همه خانواده‌ها   | C-1                  |
| **PT-03** | Template          | قالب با متغیرهای قابل تزریق    | FAM-CON, FAM-OPS | C-2                  |
| **PT-04** | Chain             | زنجیره‌ای از پرامپت‌های متوالی | همه خانواده‌ها   | C-3                  |
| **PT-05** | Context           | تأمین بافت و زمینه             | FAM-KNW, FAM-SYS | C-1                  |
| **PT-06** | Validation        | اعتبارسنجی خروجی               | FAM-CON, FAM-KNW | C-2                  |
| **PT-07** | Meta              | پرامپت درباره پرامپت‌ها        | FAM-SYS          | C-4                  |

### قواعد Type

| قاعده  | توضیح                                                  |
| ------ | ------------------------------------------------------ |
| TYP-01 | هر پرامپت دقیقاً یک Type دارد                          |
| TYP-02 | Type باید با خانواده پرامپت سازگار باشد                |
| TYP-03 | انواع جدید نیازمند به‌روزرسانی PRM-000 و PRM-001 هستند |

---

## ۷. Complexity Registry

### سطوح ثبت‌شده

| سطح            | شناسه | توضیح                             | معیارها                 | خانواده‌های رایج |
| -------------- | ----- | --------------------------------- | ----------------------- | ---------------- |
| **Atomic**     | C-0   | پرامپت ساده، بدون متغیر و وابستگی | ۰ متغیر, ۰ وابستگی      | FAM-SYS          |
| **Simple**     | C-1   | یک متغیر، بدون وابستگی خارجی      | ۱–۲ متغیر, ۰ وابستگی    | FAM-KNW          |
| **Moderate**   | C-2   | چند متغیر، یک وابستگی             | ۲–۵ متغیر, ۱–۲ وابستگی  | FAM-CON, FAM-OPS |
| **Complex**    | C-3   | زنجیره متغیرها، وابستگی‌های متعدد | ۵–۱۰ متغیر, ۲–۵ وابستگی | FAM-STR, FAM-CON |
| **Enterprise** | C-4   | ترکیب چند خانواده، وابستگی گسترده | ۱۰+ متغیر, ۵+ وابستگی   | FAM-SYS          |

### قواعد Complexity

| قاعده  | توضیح                                                |
| ------ | ---------------------------------------------------- |
| CMP-01 | سطح پیچیدگی باید با معیارهای جدول همخوانی داشته باشد |
| CMP-02 | پرامپت‌های C-3 و C-4 نیازمند ADR هستند               |
| CMP-03 | افزایش سطح پیچیدگی نیازمند Minor Version Bump است    |

---

## ۸. Architecture Layer Registry

### لایه‌های معماری ثبت‌شده

| شناسه       | لایه         | مسئولیت                    | خانواده‌های عضو  |
| ----------- | ------------ | -------------------------- | ---------------- |
| **PLYR-01** | Governance   | قواعد، استانداردها، مجوزها | FAM-STR, FAM-KNW |
| **PLYR-02** | Architecture | هویت، تاکسونومی، چرخه حیات | FAM-CON, FAM-OPS |
| **PLYR-03** | Registry     | فهرست، نمایه، کشف، وابستگی | FAM-SYS          |
| **PLYR-04** | Packaging    | بسته‌بندی، نسخه، انتشار    | همه خانواده‌ها   |
| **PLYR-05** | Runtime      | اجرا، تزریق، رزولوشن       | FAM-SYS          |

### قواعد لایه

| قاعده  | توضیح                                             |
| ------ | ------------------------------------------------- |
| LYR-01 | هر پرامپت از لایه معماری خانواده خود پیروی می‌کند |
| LYR-02 | لایه معماری در فراداده پرامپت ثبت می‌شود          |
| LYR-03 | پرامپت‌های بین‌لایه‌ای نیازمند ADR هستند          |

---

## ۹. Ownership Registry

### نقش‌های مالکیتی ثبت‌شده

| نقش                     | شناسه   | مسئولیت                    | دامنه            |
| ----------------------- | ------- | -------------------------- | ---------------- |
| **System Architect**    | OWN-SYS | معماری پرامپت، استانداردها | PRM-000, PRM-001 |
| **Content Strategist**  | OWN-STR | پرامپت‌های استراتژیک       | FAM-STR          |
| **Content Producer**    | OWN-CON | پرامپت‌های محتوا           | FAM-CON          |
| **Operations Lead**     | OWN-OPS | پرامپت‌های عملیات          | FAM-OPS          |
| **Knowledge Architect** | OWN-KNW | پرامپت‌های دانش            | FAM-KNW          |
| **Orchestrator Lead**   | OWN-SYS | پرامپت‌های سیستم           | FAM-SYS          |

### قواعد Ownership

| قاعده  | توضیح                                    |
| ------ | ---------------------------------------- |
| OWN-01 | هر پرامپت دقیقاً یک Owner دارد           |
| OWN-02 | Owner مسئول انطباق پرامپت با PRM-000 است |
| OWN-03 | تغییر Owner باید در Registry ثبت شود     |

---

## ۱۰. Version Registry

### وضعیت نسخه‌بندی

نسخه‌بندی پرامپت‌ها طبق PRM-000 §۱۳ (SemVer 2.0.0) انجام می‌شود:

| مؤلفه     | شناسه   | توضیح                                                 |
| --------- | ------- | ----------------------------------------------------- |
| **MAJOR** | VER-MAJ | تغییرات ناسازگار — تغییر family, type, متغیر required |
| **MINOR** | VER-MIN | افزودن قابلیت سازگار — متغیر optional جدید            |
| **PATCH** | VER-PAT | رفع اشکال یا بهبود جزئی — اصلاح دستورالعمل            |

### قواعد نسخه در Registry

| قاعده  | توضیح                                               |
| ------ | --------------------------------------------------- |
| VER-01 | Registry باید آخرین نسخه هر پرامپت را ثبت کند       |
| VER-02 | تاریخچه نسخه‌ها در Change Log پرامپت ذخیره می‌شود   |
| VER-03 | Registry باید وابستگی‌های نسخه‌ای را اعتبارسنجی کند |
| VER-04 | پرامپت‌های Active باید MAJOR ≥ 1 داشته باشند        |

---

## ۱۱. Status Model

### حالت‌های ثبت‌شده در Registry

| حالت           | شناسه     | توضیح                         | گذار مجاز به    |
| -------------- | --------- | ----------------------------- | --------------- |
| **Draft**      | ST-PRM-01 | پیش‌نویس اولیه — در حال طراحی | Review          |
| **Review**     | ST-PRM-02 | در حال بازبینی معماری         | Approved, Draft |
| **Approved**   | ST-PRM-03 | تأیید شده — آماده انتشار      | Active          |
| **Active**     | ST-PRM-04 | فعال در محیط تولید            | Deprecated      |
| **Deprecated** | ST-PRM-05 | منسوخ — حداقل ۳۰ روز اطلاع    | Retired, Active |
| **Retired**    | ST-PRM-06 | بازنشسته — غیرقابل استفاده    | —               |

### ماشین حالت

```
                    ┌──────────┐
                    │  Draft   │
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
               ┌───▶│  Review  │◀───┐
               │    └────┬─────┘    │
               │         │          │
               │         ▼          │
               │    ┌──────────┐    │
               │    │ Approved │    │
               │    └────┬─────┘    │
               │         │          │
               │         ▼          │
               │    ┌──────────┐    │
               │    │  Active  │    │
               │    └────┬─────┘    │
               │         │          │
               │         ▼          │
               │    ┌──────────┐    │
               │    │Deprecated│────┘
               │    └────┬─────┘
               │         │
               │         ▼
               │    ┌──────────┐
               └────│ Retired  │
                    └──────────┘
```

### قواعد Status

| قاعده | توضیح                                                        |
| ----- | ------------------------------------------------------------ |
| ST-01 | هر پرامپت در هر لحظه دقیقاً یک Status دارد                   |
| ST-02 | Registry باید Status جاری را نمایش دهد                       |
| ST-03 | تغییر Status باید در Change Log ثبت شود                      |
| ST-04 | پرامپت Deprecated حداقل ۳۰ روز پس از اعلام به Retired می‌رود |

---

## ۱۲. Dependency Registry

### انواع وابستگی ثبت‌شده

| شناسه      | نوع        | توضیح                                      | نمایش در DAG |
| ---------- | ---------- | ------------------------------------------ | ------------ |
| **DEP-01** | Requires   | پرامپت مقصد برای اجرا ضروری است            | خط توپر      |
| **DEP-02** | Extends    | پرامپت مقصد را گسترش می‌دهد (وارث)         | خط چین       |
| **DEP-03** | References | به پرامپت مقصد ارجاع می‌دهد (اختیاری)      | خط نقطه‌چین  |
| **DEP-04** | Validates  | خروجی پرامپت مقصد را اعتبارسنجی می‌کند     | خط دوتایی    |
| **DEP-05** | Provides   | بافت یا داده برای پرامپت مقصد تأمین می‌کند | خط پیکان‌دار |

### قواعد Dependency

| قاعده  | توضیح                                               |
| ------ | --------------------------------------------------- |
| DEP-01 | وابستگی‌های چرخه‌ای (Circular Dependency) ممنوع     |
| DEP-02 | Registry باید DAG وابستگی‌ها را نگهداری کند         |
| DEP-03 | هر وابستگی باید نسخه دقیق داشته باشد                |
| DEP-04 | وابستگی‌های DEP-01 باید در زمان اجرا در دسترس باشند |

---

## ۱۳. Agent Mapping

### نگاشت پرامپت به Agent

این بخش ارتباط بین هر Agent و پرامپت‌های مصرفی آن را ثبت می‌کند:

| Agent                     | شناسه  | پرامپت‌های مصرفی                                                                                                                 | خانواده                                     | نوع مصرف                                                |
| ------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| Content Strategy          | AI-001 | PRM-101, PRM-102, PRM-103, PRM-323, PRM-329, PRM-1xx (STR), PRM-4xx (KNW)                                                        | FAM-STR, FAM-KNW, FAM-OPS                   | Instruction, Context, Chain                             |
| Content Planning          | AI-002 | PRM-102, PRM-1xx (STR), PRM-4xx (KNW)                                                                                            | FAM-STR, FAM-KNW                            | Instruction, Context                                    |
| Content Production        | AI-003 | PRM-2xx (CON), PRM-4xx (KNW), PRM-3xx (OPS)                                                                                      | FAM-CON, FAM-KNW, FAM-OPS                   | Template, Instruction                                   |
| Content Review            | AI-004 | PRM-104, PRM-2xx (CON), PRM-3xx (OPS), PRM-4xx (KNW), PRM-906                                                                    | FAM-CON, FAM-KNW, FAM-OPS, FAM-STR, FAM-SYS | Validation, Instruction                                 |
| Search Optimization       | AI-005 | PRM-2xx (CON), PRM-4xx (KNW)                                                                                                     | FAM-CON, FAM-KNW                            | Instruction, Context, Validation                        |
| Media Asset Production    | AI-006 | PRM-2xx (CON), PRM-4xx (KNW)                                                                                                     | FAM-CON, FAM-KNW                            | Template, Instruction, Chain, Validation                |
| Video Production          | AI-007 | PRM-2xx (CON), PRM-4xx (KNW)                                                                                                     | FAM-CON, FAM-KNW                            | Template, Instruction, Validation, Chain                |
| Publishing & Distribution | AI-008 | PRM-2xx (CON), PRM-3xx (OPS), PRM-4xx (KNW), PRM-9xx (SYS)                                                                       | FAM-CON, FAM-OPS, FAM-KNW, FAM-SYS          | Instruction, Template, Validation, Chain, Meta          |
| Community Engagement      | AI-009 | PRM-3xx (OPS), PRM-4xx (KNW)                                                                                                     | FAM-OPS, FAM-KNW                            | Instruction, Template, Validation, Chain, Meta          |
| Analytics & Intelligence  | AI-010 | PRM-2xx (CON), PRM-3xx (OPS), PRM-4xx (KNW)                                                                                      | FAM-CON, FAM-OPS, FAM-KNW                   | Instruction, Context, Validation                        |
| Knowledge Management      | AI-011 | PRM-2xx (CON), PRM-3xx (OPS), PRM-4xx (KNW), PRM-906, PRM-907                                                                    | FAM-CON, FAM-KNW, FAM-OPS, FAM-SYS          | Context, Instruction, Chain, Validation                 |
| Continuous Improvement    | AI-012 | PRM-103, PRM-104, PRM-3xx (OPS), PRM-1xx (STR), PRM-4xx (KNW), PRM-905, PRM-907                                                  | FAM-OPS, FAM-STR, FAM-KNW, FAM-SYS          | Instruction, Meta, Validation                           |
| Research                  | AI-013 | PRM-1xx (STR), PRM-4xx (KNW)                                                                                                     | FAM-STR, FAM-KNW                            | Instruction, Context                                    |
| Orchestrator              | AI-014 | PRM-101, PRM-102, PRM-103, PRM-104, PRM-105, PRM-9xx (SYS), PRM-902, PRM-903, PRM-904, PRM-905, PRM-906, PRM-907, همه خانواده‌ها | FAM-SYS, FAM-STR                            | System Definition, Meta, Instruction, Chain, Validation |

### قواعد نگاشت Agent

| قاعده  | توضیح                                                    |
| ------ | -------------------------------------------------------- |
| AGT-01 | هر Agent باید پرامپت‌های مصرفی خود را در PRM-001 ثبت کند |
| AGT-02 | یک پرامپت می‌تواند توسط چند Agent مصرف شود               |
| AGT-03 | تغییر در نگاشت Agent نیازمند به‌روزرسانی PRM-001 است     |

---

## ۱۴. Automation Mapping

### نگاشت پرامپت به Automation

این بخش ارتباط بین Workflowهای خودکار (AUT-\*) و پرامپت‌های مصرفی را ثبت می‌کند:

| Workflow                        | شناسه            | پرامپت‌های مصرفی                                     | نوع مصرف                |
| ------------------------------- | ---------------- | ---------------------------------------------------- | ----------------------- |
| Content Pipeline                | AUT-001-001      | PRM-2xx, PRM-4xx                                     | Instruction, Template   |
| Publication Queue               | AUT-001-002      | PRM-3xx                                              | Instruction             |
| Cross-Platform Distribution     | AUT-001-003      | PRM-3xx, PRM-2xx (Format)                            | Template                |
| Content Approval                | AUT-001-004      | PRM-2xx (Validation)                                 | Validation              |
| Platform Publishing (هر پلتفرم) | AUT-001-005..012 | PRM-3xx (OPS-PUB)                                    | Template                |
| Platform Monitoring             | AUT-001-013..018 | PRM-3xx (OPS-MON)                                    | Instruction             |
| Engagement Workflows            | AUT-001-019..025 | PRM-3xx (OPS-CMG)                                    | Template                |
| Reporting Workflows             | AUT-001-026..031 | PRM-3xx (OPS-RPT)                                    | Instruction             |
| Knowledge Extraction            | AUT-001-040..043 | PRM-4xx (KNW-EXT, KNW-RTR)                           | Instruction, Context    |
| Knowledge Research              | AUT-001-044..048 | PRM-4xx (KNW-RSR)                                    | Instruction, Chain      |
| Knowledge Learning              | AUT-001-049..054 | PRM-4xx (KNW-LRN)                                    | Instruction, Chain      |
| Agent Evaluation                | AUT-001-037..039 | PRM-9xx (SYS)                                        | System Definition       |
| Orchestration Execution         | AUT-001-055..059 | PRM-902, PRM-903, PRM-904, PRM-905, PRM-906, PRM-907 | Chain, Meta, Validation |

### قواعد نگاشت Automation

| قاعده  | توضیح                                                          |
| ------ | -------------------------------------------------------------- |
| AUT-01 | هر Workflow باید پرامپت‌های مصرفی خود را در PRM-001 ثبت کند    |
| AUT-02 | پرامپت‌های مصرفی در Workflow باید با نوع Workflow سازگار باشند |
| AUT-03 | تغییر در نگاشت Automation نیازمند به‌روزرسانی PRM-001 است      |

---

## ۱۵. Knowledge Mapping

### نگاشت پرامپت به Knowledge

این بخش ارتباط بین پرامپت‌ها و منابع دانشی (KNW-_, EDT-_, BRD-\*) را ثبت می‌کند:

| پرامپت               | منبع دانش                       | نوع بافت | کاربرد                        |
| -------------------- | ------------------------------- | -------- | ----------------------------- |
| PRM-1xx (Strategic)  | EDT-002 (Content Taxonomy)      | CTX-02   | تاکسونومی در تحلیل استراتژیک  |
| PRM-1xx (Strategic)  | ARCH-003 (Vocabulary)           | CTX-02   | واژگان در تصمیم‌گیری          |
| PRM-2xx (Content)    | BRD-002 (Brand Voice)           | CTX-02   | صدای برند در تولید محتوا      |
| PRM-2xx (Content)    | EDT-001 (ECOS)                  | CTX-02   | چرخه حیات محتوا               |
| PRM-2xx (Content)    | EDT-002 (Content Taxonomy)      | CTX-02   | نوع محتوا در تولید            |
| PRM-3xx (Operations) | PLAT-\* (Platform Playbooks)    | CTX-05   | مشخصات پلتفرم در انتشار       |
| PRM-3xx (Operations) | MET-\* (Metrics)                | CTX-04   | KPI در گزارش‌گیری             |
| PRM-4xx (Knowledge)  | KNW-\* (Knowledge Base)         | CTX-02   | دانش سازمانی                  |
| PRM-4xx (Knowledge)  | ARCH-012 (Knowledge Model)      | CTX-02   | مدل دانش                      |
| PRM-4xx (KNW-RSR)    | PRM-001 (Prompt Registry)       | CTX-02   | رجیستری پرامپت در انتخاب منبع |
| PRM-4xx (KNW-RSR)    | PRM-420–PRM-428 (chain outputs) | CTX-02   | خروجی‌های زنجیره پژوهش        |
| PRM-4xx (KNW-LRN)    | PRM-430–PRM-438 (chain outputs) | CTX-02   | خروجی‌های زنجیره یادگیری      |
| PRM-4xx (KNW-LRN)    | PRM-001 (Knowledge Index)       | CTX-02   | نمایه دانش در تکامل           |
| PRM-9xx (System)     | AI-\* (Agent Specifications)    | CTX-01   | مشخصات Agent در Orchestration |
| PRM-9xx (SYS-ORC)    | PRM-902–PRM-907 (chain outputs) | CTX-02   | خروجی‌های زنجیره هماهنگ‌سازی  |

### قواعد نگاشت Knowledge

| قاعده  | توضیح                                                    |
| ------ | -------------------------------------------------------- |
| KNW-01 | هر پرامپت باید منبع دانش مصرفی خود را در PRM-001 ثبت کند |
| KNW-02 | منابع دانش باید در زمان اجرا در دسترس باشند              |
| KNW-03 | تغییر در منبع دانش نیازمند به‌روزرسانی Registry است      |

---

## ۱۶. Deployment Mapping

### نگاشت پرامپت به Deployment

این بخش ارتباط بین پرامپت‌ها و فازهای استقرار (DEPLOY-001) را ثبت می‌کند:

| فاز استقرار             | پرامپت‌ها                                         | اولویت استقرار |
| ----------------------- | ------------------------------------------------- | -------------- |
| Phase 1: Foundation     | PRM-9xx (SYS) — پرامپت‌های سیستمی                 | P0             |
| Phase 2: Knowledge Core | PRM-4xx (KNW) — پرامپت‌های دانش                   | P0             |
| Phase 3: AI Agents      | PRM-1xx (STR), PRM-2xx (CON), PRM-3xx (OPS)       | P1             |
| Phase 4: Automation     | PRM-3xx (OPS) — پرامپت‌های عملیات برای Workflowها | P2             |
| Phase 5: Intelligence   | PRM-1xx (STR) — پرامپت‌های بهبود مستمر            | P3             |

### قواعد نگاشت Deployment

| قاعده  | توضیح                                                        |
| ------ | ------------------------------------------------------------ |
| DPL-01 | اولویت استقرار پرامپت باید با DEPLOY-001 هماهنگ باشد         |
| DPL-02 | پرامپت‌های P0 باید در Phase 2 مستقر شوند                     |
| DPL-03 | پرامپت‌های وابسته باید پس از پرامپت‌های مورد نیاز مستقر شوند |

---

## ۱۷. Cross Reference Matrix

### ماتریس ارجاع متقابل

| موجودیت       | PRM-001           | AI-\*       | AUT-\*      | KNW-\*     | PLAT-\*    | DEPLOY-\* |
| ------------- | ----------------- | ----------- | ----------- | ---------- | ---------- | --------- |
| **PRM-001**   | —                 | مصرف‌کننده  | مصرف‌کننده  | منبع دانش  | منبع بافت  | استقرار   |
| **AI-\***     | منبع پرامپت       | —           | همکار       | مصرف‌کننده | مصرف‌کننده | استقرار   |
| **AUT-\***    | مصرف‌کننده پرامپت | همکار       | —           | مصرف‌کننده | مصرف‌کننده | استقرار   |
| **KNW-\***    | منبع بافت         | تأمین‌کننده | تأمین‌کننده | —          | —          | استقرار   |
| **PLAT-\***   | منبع بافت         | مصرف‌کننده  | مصرف‌کننده  | —          | —          | استقرار   |
| **DEPLOY-\*** | استقرار           | استقرار     | استقرار     | استقرار    | استقرار    | —         |

---

## ۱۸. Machine Readable Registry

### Block 1 — Registry Identity

```json
{
  "registry": {
    "id": "PRM-001",
    "name": "Enterprise Prompt Index",
    "type": "registry",
    "version": "1.0.0-draft",
    "status": "draft",
    "ssot": true,
    "total_families": 5,
    "total_types": 7,
    "total_complexities": 5,
    "total_layers": 5,
    "total_prompts_registered": 117,
    "total_prompts_draft": 117,
    "total_prompts_planned": 0
  }
}
```

### Block 2 — Family Registry

```json
{
  "families": [
    {
      "id": "FAM-STR",
      "name": "Strategic",
      "prefix": "PRM-1xx",
      "layer": "PLYR-01",
      "consumers": ["AI-001", "AI-002", "AI-004", "AI-012", "AI-013", "AI-014"],
      "status": "active"
    },
    {
      "id": "FAM-CON",
      "name": "Content",
      "prefix": "PRM-2xx",
      "layer": "PLYR-02",
      "consumers": ["AI-003", "AI-004", "AI-005", "AI-006", "AI-007", "AI-008", "AI-010", "AI-011"],
      "status": "active"
    },
    {
      "id": "FAM-OPS",
      "name": "Operations",
      "prefix": "PRM-3xx",
      "layer": "PLYR-02",
      "consumers": ["AI-004", "AI-008", "AI-009", "AI-010", "AI-011", "AI-012", "AI-014"],
      "status": "active"
    },
    {
      "id": "FAM-KNW",
      "name": "Knowledge",
      "prefix": "PRM-4xx",
      "layer": "PLYR-01",
      "consumers": ["AI-011", "AI-010", "AI-012", "AI-001", "AI-002", "AI-004", "AI-014", "AI-013"],
      "status": "active"
    },
    {
      "id": "FAM-SYS",
      "name": "System",
      "prefix": "PRM-9xx",
      "layer": "PLYR-03",
      "consumers": ["AI-014"],
      "status": "active"
    }
  ]
}
```

### Block 3 — Type Registry

```json
{
  "prompt_types": [
    {
      "id": "PT-01",
      "name": "System Definition",
      "allowed_families": ["FAM-SYS", "FAM-STR"],
      "suggested_complexity": "C-2"
    },
    {
      "id": "PT-02",
      "name": "Instruction",
      "allowed_families": ["FAM-STR", "FAM-CON", "FAM-OPS", "FAM-KNW", "FAM-SYS"],
      "suggested_complexity": "C-1"
    },
    {
      "id": "PT-03",
      "name": "Template",
      "allowed_families": ["FAM-CON", "FAM-OPS"],
      "suggested_complexity": "C-2"
    },
    {
      "id": "PT-04",
      "name": "Chain",
      "allowed_families": ["FAM-STR", "FAM-CON", "FAM-OPS", "FAM-KNW", "FAM-SYS"],
      "suggested_complexity": "C-3"
    },
    {
      "id": "PT-05",
      "name": "Context",
      "allowed_families": ["FAM-KNW", "FAM-SYS"],
      "suggested_complexity": "C-1"
    },
    {
      "id": "PT-06",
      "name": "Validation",
      "allowed_families": ["FAM-CON", "FAM-KNW", "FAM-SYS"],
      "suggested_complexity": "C-2"
    },
    {
      "id": "PT-07",
      "name": "Meta",
      "allowed_families": ["FAM-SYS", "FAM-KNW", "FAM-OPS"],
      "suggested_complexity": "C-4"
    }
  ]
}
```

### Block 4 — Complexity Registry

```json
{
  "complexity_levels": [
    {
      "id": "C-0",
      "name": "Atomic",
      "max_variables": 0,
      "max_dependencies": 0,
      "common_families": ["FAM-SYS"]
    },
    {
      "id": "C-1",
      "name": "Simple",
      "max_variables": 2,
      "max_dependencies": 0,
      "common_families": ["FAM-KNW"]
    },
    {
      "id": "C-2",
      "name": "Moderate",
      "max_variables": 5,
      "max_dependencies": 2,
      "common_families": ["FAM-CON", "FAM-OPS"]
    },
    {
      "id": "C-3",
      "name": "Complex",
      "max_variables": 10,
      "max_dependencies": 5,
      "common_families": ["FAM-STR", "FAM-CON"]
    },
    {
      "id": "C-4",
      "name": "Enterprise",
      "max_variables": -1,
      "max_dependencies": -1,
      "common_families": ["FAM-SYS"]
    }
  ]
}
```

### Block 5 — Agent Mapping

```json
{
  "agent_prompt_mapping": [
    {
      "agent": "AI-001",
      "families": ["FAM-STR", "FAM-KNW", "FAM-OPS"],
      "prompts": [
        "PRM-101",
        "PRM-102",
        "PRM-103",
        "PRM-323",
        "PRM-329",
        "PRM-403",
        "PRM-408",
        "PRM-410",
        "PRM-415",
        "PRM-420",
        "PRM-425",
        "PRM-433",
        "PRM-435",
        "PRM-438"
      ],
      "types": ["PT-02", "PT-05", "PT-04", "PT-06"]
    },
    {
      "agent": "AI-002",
      "families": ["FAM-STR", "FAM-KNW"],
      "prompts": ["PRM-102", "PRM-403", "PRM-410", "PRM-415", "PRM-420", "PRM-425", "PRM-435"],
      "types": ["PT-02", "PT-05"]
    },
    {
      "agent": "AI-003",
      "families": ["FAM-CON", "FAM-KNW", "FAM-OPS"],
      "prompts": ["PRM-201", "PRM-203", "PRM-204", "PRM-205", "PRM-206", "PRM-207", "PRM-209"],
      "types": ["PT-02", "PT-03", "PT-04"]
    },
    {
      "agent": "AI-004",
      "families": ["FAM-CON", "FAM-KNW", "FAM-OPS", "FAM-STR", "FAM-SYS"],
      "prompts": [
        "PRM-104",
        "PRM-202",
        "PRM-208",
        "PRM-210",
        "PRM-211",
        "PRM-212",
        "PRM-213",
        "PRM-214",
        "PRM-232",
        "PRM-243",
        "PRM-305",
        "PRM-313",
        "PRM-325",
        "PRM-334",
        "PRM-335",
        "PRM-406",
        "PRM-407",
        "PRM-416",
        "PRM-417",
        "PRM-418",
        "PRM-423",
        "PRM-426",
        "PRM-427",
        "PRM-429",
        "PRM-436",
        "PRM-437",
        "PRM-439",
        "PRM-906"
      ],
      "types": ["PT-06", "PT-02", "PT-04"]
    },
    {
      "agent": "AI-005",
      "families": ["FAM-CON", "FAM-KNW"],
      "prompts": [
        "PRM-203",
        "PRM-204",
        "PRM-207",
        "PRM-220",
        "PRM-221",
        "PRM-222",
        "PRM-223",
        "PRM-224"
      ],
      "types": ["PT-02", "PT-05", "PT-04", "PT-06"]
    },
    {
      "agent": "AI-006",
      "families": ["FAM-CON", "FAM-KNW"],
      "prompts": [
        "PRM-203",
        "PRM-204",
        "PRM-205",
        "PRM-230",
        "PRM-231",
        "PRM-232",
        "PRM-233",
        "PRM-234"
      ],
      "types": ["PT-02", "PT-03", "PT-04", "PT-06"]
    },
    {
      "agent": "AI-007",
      "families": ["FAM-CON", "FAM-KNW"],
      "prompts": [
        "PRM-205",
        "PRM-233",
        "PRM-234",
        "PRM-240",
        "PRM-241",
        "PRM-242",
        "PRM-243",
        "PRM-244"
      ],
      "types": ["PT-02", "PT-03", "PT-04", "PT-06"]
    },
    {
      "agent": "AI-008",
      "families": ["FAM-CON", "FAM-OPS", "FAM-KNW", "FAM-SYS"],
      "prompts": [
        "PRM-204",
        "PRM-206",
        "PRM-207",
        "PRM-209",
        "PRM-214",
        "PRM-224",
        "PRM-234",
        "PRM-244",
        "PRM-301",
        "PRM-302",
        "PRM-303",
        "PRM-304",
        "PRM-305",
        "PRM-306",
        "PRM-307",
        "PRM-308"
      ],
      "types": ["PT-02", "PT-03", "PT-04", "PT-06", "PT-07"]
    },
    {
      "agent": "AI-009",
      "families": ["FAM-OPS", "FAM-KNW"],
      "prompts": [
        "PRM-308",
        "PRM-310",
        "PRM-311",
        "PRM-312",
        "PRM-313",
        "PRM-314",
        "PRM-315",
        "PRM-316",
        "PRM-317",
        "PRM-318",
        "PRM-319"
      ],
      "types": ["PT-02", "PT-03", "PT-04", "PT-06", "PT-07"]
    },
    {
      "agent": "AI-010",
      "families": ["FAM-CON", "FAM-OPS", "FAM-KNW"],
      "prompts": [
        "PRM-224",
        "PRM-244",
        "PRM-307",
        "PRM-308",
        "PRM-316",
        "PRM-318",
        "PRM-319",
        "PRM-320",
        "PRM-321",
        "PRM-322",
        "PRM-323",
        "PRM-324",
        "PRM-325",
        "PRM-326",
        "PRM-327",
        "PRM-328",
        "PRM-329",
        "PRM-330",
        "PRM-331",
        "PRM-332",
        "PRM-333",
        "PRM-334",
        "PRM-335",
        "PRM-336",
        "PRM-337",
        "PRM-338",
        "PRM-339",
        "PRM-403",
        "PRM-404",
        "PRM-405",
        "PRM-410",
        "PRM-411",
        "PRM-412",
        "PRM-413",
        "PRM-414",
        "PRM-415",
        "PRM-418",
        "PRM-424",
        "PRM-428",
        "PRM-431",
        "PRM-438"
      ],
      "types": ["PT-02", "PT-05", "PT-06", "PT-04", "PT-07"]
    },
    {
      "agent": "AI-011",
      "families": ["FAM-CON", "FAM-KNW", "FAM-OPS", "FAM-SYS"],
      "prompts": [
        "PRM-213",
        "PRM-222",
        "PRM-223",
        "PRM-308",
        "PRM-319",
        "PRM-326",
        "PRM-329",
        "PRM-336",
        "PRM-339",
        "PRM-403",
        "PRM-404",
        "PRM-405",
        "PRM-406",
        "PRM-407",
        "PRM-408",
        "PRM-410",
        "PRM-411",
        "PRM-412",
        "PRM-413",
        "PRM-414",
        "PRM-415",
        "PRM-416",
        "PRM-417",
        "PRM-418",
        "PRM-419",
        "PRM-420",
        "PRM-421",
        "PRM-422",
        "PRM-429",
        "PRM-430",
        "PRM-432",
        "PRM-434",
        "PRM-439",
        "PRM-906",
        "PRM-907"
      ],
      "types": ["PT-05", "PT-02", "PT-04", "PT-06"]
    },
    {
      "agent": "AI-012",
      "families": ["FAM-OPS", "FAM-STR", "FAM-KNW", "FAM-SYS"],
      "prompts": [
        "PRM-103",
        "PRM-104",
        "PRM-318",
        "PRM-319",
        "PRM-324",
        "PRM-328",
        "PRM-329",
        "PRM-333",
        "PRM-337",
        "PRM-338",
        "PRM-339",
        "PRM-407",
        "PRM-408",
        "PRM-418",
        "PRM-419",
        "PRM-425",
        "PRM-428",
        "PRM-429",
        "PRM-430",
        "PRM-431",
        "PRM-432",
        "PRM-433",
        "PRM-434",
        "PRM-435",
        "PRM-436",
        "PRM-437",
        "PRM-438",
        "PRM-439",
        "PRM-905",
        "PRM-907"
      ],
      "types": ["PT-02", "PT-06", "PT-07", "PT-04"]
    },
    {
      "agent": "AI-013",
      "families": ["FAM-STR", "FAM-KNW"],
      "prompts": [
        "PRM-410",
        "PRM-411",
        "PRM-412",
        "PRM-420",
        "PRM-421",
        "PRM-422",
        "PRM-423",
        "PRM-424",
        "PRM-425",
        "PRM-426",
        "PRM-427",
        "PRM-428",
        "PRM-429",
        "PRM-433"
      ],
      "types": ["PT-02", "PT-05", "PT-04", "PT-06", "PT-07"]
    },
    {
      "agent": "AI-014",
      "families": ["FAM-OPS", "FAM-SYS", "FAM-STR", "FAM-KNW"],
      "prompts": [
        "PRM-101",
        "PRM-102",
        "PRM-103",
        "PRM-104",
        "PRM-105",
        "PRM-303",
        "PRM-311",
        "PRM-314",
        "PRM-327",
        "PRM-337",
        "PRM-339",
        "PRM-408",
        "PRM-419",
        "PRM-429",
        "PRM-439",
        "PRM-901",
        "PRM-902",
        "PRM-903",
        "PRM-904",
        "PRM-905",
        "PRM-906",
        "PRM-907"
      ],
      "types": ["PT-01", "PT-07", "PT-02", "PT-04", "PT-06"]
    }
  ]
}
```

### Block 6 — Status Machine

```json
{
  "status_machine": {
    "states": ["draft", "review", "approved", "active", "deprecated", "retired"],
    "transitions": [
      { "from": "draft", "to": "review" },
      { "from": "review", "to": "approved" },
      { "from": "review", "to": "draft" },
      { "from": "approved", "to": "active" },
      { "from": "active", "to": "deprecated" },
      { "from": "deprecated", "to": "retired" },
      { "from": "deprecated", "to": "active" }
    ],
    "initial_state": "draft",
    "terminal_states": ["retired"]
  }
}
```

---

## ۱۹. Prompt Catalog

### کاتالوگ پرامپت‌های برنامه‌ریزی‌شده

این بخش فهرست پرامپت‌های مصوب برای پیاده‌سازی در نسخه‌های آتی SMOS را ثبت می‌کند. هر مدخل نشان‌دهنده یک PRM-NNN آینده است.

> **توجه:** این کاتالوگ شناسه‌ها را ثبت می‌کند — محتوای پرامپت در PRM-NNN جداگانه پیاده‌سازی می‌شود. ستون `سند` مسیر فایل پیاده‌سازی را نشان می‌دهد. وضعیت `draft` به معنای وجود پیش‌نویس اولیه است.

#### FAM-STR: Strategic Prompts

| شناسه   | نام                           | نوع   | پیچیدگی | اختیار | Agent مصرف‌کننده       | وابستگی                              | اولویت | سند                                                     | وضعیت   |
| ------- | ----------------------------- | ----- | ------- | ------ | ---------------------- | ------------------------------------ | ------ | ------------------------------------------------------- | ------- |
| PRM-101 | Enterprise Strategic Planning | PT-02 | C-3     | A-3    | AI-001, AI-014         | PRM-401, PRM-402                     | P1     | [✅](../35-PROMPTS/10-enterprise-strategic-planning.md) | draft   |
| PRM-102 | Goal Decomposition            | PT-04 | C-3     | A-2    | AI-001, AI-002, AI-014 | PRM-101, PRM-402                     | P1     | [✅](../35-PROMPTS/12-goal-decomposition.md)            | draft   |
| PRM-103 | Decision Framing              | PT-07 | C-3     | A-3    | AI-001, AI-012, AI-014 | PRM-101, PRM-102, ARCH-030           | P1     | [✅](../35-PROMPTS/14-decision-framing.md)              | draft   |
| PRM-104 | Governance Compliance         | PT-06 | C-2     | A-3    | AI-014, AI-004, AI-012 | PRM-103, ARCH-030, ARCH-032, CON-000 | P1     | [✅](../35-PROMPTS/16-governance-compliance.md)         | draft   |
| PRM-105 | Executive Response Generation | PT-02 | C-3     | A-4    | AI-014                 | PRM-103, PRM-104, PRM-401, ARCH-032  | P1     | [✅](../35-PROMPTS/18-executive-response-generation.md) | draft   |
| PRM-106 | Research Direction            | PT-02 | C-2     | A-2    | AI-013                 | PRM-401, PRM-402                     | P1     | —                                                       | planned |
| PRM-107 | Competitor Analysis           | PT-02 | C-3     | A-2    | AI-013                 | PRM-401, PRM-402                     | P2     | —                                                       | planned |
| PRM-108 | Trend Analysis                | PT-02 | C-3     | A-2    | AI-013                 | PRM-401, PRM-402                     | P2     | —                                                       | planned |

#### FAM-CON: Content Prompts

| شناسه   | نام                                    | نوع   | پیچیدگی | اختیار | Agent مصرف‌کننده               | وابستگی                                     | اولویت | سند                                                             | وضعیت |
| ------- | -------------------------------------- | ----- | ------- | ------ | ------------------------------ | ------------------------------------------- | ------ | --------------------------------------------------------------- | ----- |
| PRM-201 | Content Production Instruction         | PT-02 | C-2     | A-2    | AI-003                         | PRM-401, PRM-402                            | P0     | [✅](../35-PROMPTS/20-content-production-instruction.md)        | draft |
| PRM-202 | Content Review Validation              | PT-06 | C-2     | A-2    | AI-004                         | PRM-201, PRM-401                            | P0     | [✅](../35-PROMPTS/22-content-review-validation.md)             | draft |
| PRM-203 | Content Structuring Instruction        | PT-04 | C-2     | A-3    | AI-003, AI-005, AI-006         | PRM-201, PRM-202, PRM-402                   | P1     | [✅](../35-PROMPTS/24-content-structuring-instruction.md)       | draft |
| PRM-204 | Metadata Generation Instruction        | PT-04 | C-2     | A-3    | AI-003, AI-005, AI-006, AI-008 | PRM-203, PRM-402                            | P1     | [✅](../35-PROMPTS/26-metadata-generation-instruction.md)       | draft |
| PRM-205 | Accessibility Enhancement Instruction  | PT-06 | C-2     | A-3    | AI-003, AI-006, AI-007         | PRM-203, PRM-204                            | P1     | [✅](../35-PROMPTS/28-accessibility-enhancement-instruction.md) | draft |
| PRM-206 | Localization & Translation Instruction | PT-04 | C-3     | A-3    | AI-003, AI-008                 | PRM-203, PRM-401, PRM-402                   | P1     | [✅](../35-PROMPTS/29-localization-translation-instruction.md)  | draft |
| PRM-207 | Platform Format Adaptation             | PT-03 | C-2     | A-1    | AI-003, AI-005, AI-008         | PRM-203, PRM-401, PRM-402                   | P1     | [✅](../35-PROMPTS/31-platform-format-adaptation.md)            | draft |
| PRM-208 | Content Quality Check                  | PT-06 | C-1     | A-1    | AI-004                         | PRM-401, PRM-402                            | P1     | [✅](../35-PROMPTS/33-content-quality-check.md)                 | draft |
| PRM-209 | Multi-Platform Adaptation Chain        | PT-04 | C-3     | A-2    | AI-003, AI-008                 | PRM-207, PRM-301, PRM-401, PRM-402          | P2     | [✅](../35-PROMPTS/35-multi-platform-adaptation-chain.md)       | draft |
| PRM-210 | Review Preparation                     | PT-04 | C-1     | A-2    | AI-004                         | PRM-401, PRM-402                            | P1     | [✅](../35-PROMPTS/40-review-preparation.md)                    | draft |
| PRM-211 | Structural Validation                  | PT-06 | C-2     | A-2    | AI-004                         | PRM-210, PRM-402, EDT-001                   | P1     | [✅](../35-PROMPTS/42-structural-validation.md)                 | draft |
| PRM-212 | Terminology Validation                 | PT-06 | C-2     | A-2    | AI-004                         | PRM-210, ARCH-003, GOV-004                  | P1     | [✅](../35-PROMPTS/44-terminology-validation.md)                | draft |
| PRM-213 | Consistency Validation                 | PT-06 | C-3     | A-3    | AI-004, AI-011                 | PRM-210, PRM-211, PRM-212, PRM-401          | P1     | [✅](../35-PROMPTS/46-consistency-validation.md)                | draft |
| PRM-214 | Publication Readiness Validation       | PT-06 | C-3     | A-3    | AI-004, AI-008                 | PRM-210, PRM-211, PRM-212, PRM-213, PRM-301 | P1     | [✅](../35-PROMPTS/48-publication-readiness-validation.md)      | draft |
| PRM-220 | Semantic Optimization                  | PT-04 | C-3     | A-3    | AI-005                         | PRM-203, PRM-401, PRM-402, ARCH-003         | P1     | [✅](../35-PROMPTS/50-semantic-optimization.md)                 | draft |
| PRM-221 | Search Intent Alignment                | PT-04 | C-2     | A-3    | AI-005                         | PRM-220, PRM-402, EDT-002                   | P1     | [✅](../35-PROMPTS/52-search-intent-alignment.md)               | draft |
| PRM-222 | Internal Linking Strategy              | PT-04 | C-3     | A-3    | AI-005, AI-011                 | PRM-220, PRM-221, ARCH-012                  | P1     | [✅](../35-PROMPTS/54-internal-linking-strategy.md)             | draft |
| PRM-223 | Structured Metadata Enhancement        | PT-04 | C-3     | A-3    | AI-005, AI-011                 | PRM-220, PRM-222, PRM-402, PRM-401          | P1     | [✅](../35-PROMPTS/56-structured-metadata-enhancement.md)       | draft |
| PRM-224 | Discoverability Validation             | PT-06 | C-3     | A-3    | AI-005, AI-008, AI-010         | PRM-220, PRM-221, PRM-222, PRM-223          | P1     | [✅](../35-PROMPTS/58-discoverability-validation.md)            | draft |
| PRM-230 | Media Planning Instruction             | PT-04 | C-2     | A-3    | AI-006                         | PRM-402, PRM-401                            | P1     | [✅](../35-PROMPTS/60-media-planning-instruction.md)            | draft |
| PRM-231 | Visual Composition Instruction         | PT-04 | C-3     | A-3    | AI-006                         | PRM-230, BRD-001, PRM-401                   | P1     | [✅](../35-PROMPTS/62-visual-composition-instruction.md)        | draft |
| PRM-232 | Brand Visual Compliance                | PT-06 | C-2     | A-3    | AI-006, AI-004                 | PRM-231, BRD-001, BRD-002                   | P1     | [✅](../35-PROMPTS/64-brand-visual-compliance.md)               | draft |
| PRM-233 | Accessibility Media Validation         | PT-06 | C-2     | A-3    | AI-006, AI-007                 | PRM-232, PRM-205                            | P1     | [✅](../35-PROMPTS/66-accessibility-media-validation.md)        | draft |
| PRM-234 | Media Production Readiness             | PT-06 | C-3     | A-3    | AI-006, AI-007, AI-008         | PRM-232, PRM-233, PRM-301                   | P1     | [✅](../35-PROMPTS/68-media-production-readiness.md)            | draft |
| PRM-240 | Video Storyboard Planning              | PT-04 | C-3     | A-3    | AI-007                         | PRM-230, PRM-402, PRM-401                   | P1     | [✅](../35-PROMPTS/70-video-storyboard-planning.md)             | draft |
| PRM-241 | Video Scene Composition                | PT-04 | C-3     | A-3    | AI-007                         | PRM-240, BRD-001, PRM-401                   | P1     | [✅](../35-PROMPTS/72-video-scene-composition.md)               | draft |
| PRM-242 | Audio & Narration Guidance             | PT-04 | C-2     | A-3    | AI-007                         | PRM-240, PRM-401, PRM-205                   | P1     | [✅](../35-PROMPTS/74-audio-narration-guidance.md)              | draft |
| PRM-243 | Video Brand Compliance                 | PT-06 | C-2     | A-3    | AI-007, AI-004                 | PRM-241, PRM-242, BRD-001                   | P1     | [✅](../35-PROMPTS/76-video-brand-compliance.md)                | draft |
| PRM-244 | Video Publication Readiness            | PT-06 | C-3     | A-3    | AI-007, AI-008, AI-010         | PRM-243, PRM-233, PRM-301                   | P1     | [✅](../35-PROMPTS/78-video-publication-readiness.md)           | draft |

#### FAM-OPS: Operations Prompts

| شناسه   | نام                                | نوع   | پیچیدگی | اختیار | Agent مصرف‌کننده               | وابستگی                                      | اولویت | سند                                                          | وضعیت |
| ------- | ---------------------------------- | ----- | ------- | ------ | ------------------------------ | -------------------------------------------- | ------ | ------------------------------------------------------------ | ----- |
| PRM-301 | Publishing Instruction             | PT-02 | C-1     | A-2    | AI-008                         | PRM-201, PRM-202                             | P0     | [✅](../35-PROMPTS/30-publishing-instruction.md)             | draft |
| PRM-302 | Publishing Package Assembly        | PT-04 | C-2     | A-3    | AI-008                         | PRM-301, PRM-402                             | P1     | [✅](../35-PROMPTS/80-publishing-package-assembly.md)        | draft |
| PRM-303 | Platform Selection Strategy        | PT-07 | C-3     | A-3    | AI-008, AI-014                 | PRM-302, PLAT-\*                             | P1     | [✅](../35-PROMPTS/82-platform-selection-strategy.md)        | draft |
| PRM-304 | Publication Scheduling             | PT-04 | C-2     | A-2    | AI-008                         | PRM-303, PRM-402                             | P1     | [✅](../35-PROMPTS/84-publication-scheduling.md)             | draft |
| PRM-305 | Platform Compliance Validation     | PT-06 | C-2     | A-3    | AI-008, AI-004                 | PRM-304, PLAT-\*, BRD-002                    | P1     | [✅](../35-PROMPTS/86-platform-compliance-validation.md)     | draft |
| PRM-306 | Publication Execution Chain        | PT-04 | C-3     | A-3    | AI-008                         | PRM-305, PRM-207, PRM-301                    | P1     | [✅](../35-PROMPTS/88-publication-execution-chain.md)        | draft |
| PRM-307 | Publication Verification           | PT-06 | C-2     | A-2    | AI-008, AI-010                 | PRM-306, PLAT-\*                             | P1     | [✅](../35-PROMPTS/90-publication-verification.md)           | draft |
| PRM-308 | Distribution Completion Validation | PT-06 | C-3     | A-3    | AI-008, AI-009, AI-010, AI-011 | PRM-307, PRM-301, PLAT-\*                    | P1     | [✅](../35-PROMPTS/92-distribution-completion-validation.md) | draft |
| PRM-310 | Comment Classification             | PT-04 | C-2     | A-2    | AI-009                         | PLAT-\*, BRD-002                             | P1     | [✅](../35-PROMPTS/100-comment-classification.md)            | draft |
| PRM-311 | Response Strategy Selection        | PT-07 | C-3     | A-3    | AI-009, AI-014                 | PRM-310, BRD-002, BRD-001                    | P1     | [✅](../35-PROMPTS/102-response-strategy-selection.md)       | draft |
| PRM-312 | Response Draft Preparation         | PT-04 | C-2     | A-2    | AI-009                         | PRM-311, BRD-002, PLAT-\*                    | P1     | [✅](../35-PROMPTS/104-response-draft-preparation.md)        | draft |
| PRM-313 | Moderation Validation              | PT-06 | C-2     | A-3    | AI-009, AI-004                 | PRM-312, PLAT-\*, BRD-002                    | P1     | [✅](../35-PROMPTS/106-moderation-validation.md)             | draft |
| PRM-314 | Escalation Decision                | PT-07 | C-3     | A-3    | AI-009, AI-014                 | PRM-313, BRD-001, ARCH-030                   | P1     | [✅](../35-PROMPTS/108-escalation-decision.md)               | draft |
| PRM-315 | Community Interaction Validation   | PT-06 | C-2     | A-2    | AI-009                         | PRM-314, BRD-002                             | P1     | [✅](../35-PROMPTS/110-community-interaction-validation.md)  | draft |
| PRM-316 | Sentiment Observation              | PT-04 | C-3     | A-3    | AI-009, AI-010                 | PRM-315, EDT-002                             | P1     | [✅](../35-PROMPTS/112-sentiment-observation.md)             | draft |
| PRM-317 | Conversation Continuity            | PT-04 | C-2     | A-2    | AI-009                         | PRM-315, BRD-002                             | P1     | [✅](../35-PROMPTS/114-conversation-continuity.md)           | draft |
| PRM-318 | Community Incident Assessment      | PT-06 | C-3     | A-3    | AI-009, AI-010, AI-012         | PRM-316, PRM-317, BRD-001, ARCH-030, PLAT-\* | P1     | [✅](../35-PROMPTS/116-community-incident-assessment.md)     | draft |
| PRM-319 | Community Handoff Validation       | PT-06 | C-3     | A-3    | AI-009, AI-010, AI-011, AI-012 | PRM-318, PRM-301, PLAT-\*                    | P1     | [✅](../35-PROMPTS/118-community-handoff-validation.md)      | draft |
| PRM-320 | Performance Report Generation      | PT-04 | C-2     | A-3    | AI-010                         | MET-\*                                       | P1     | [✅](../35-PROMPTS/120-performance-report-generation.md)     | draft |
| PRM-321 | KPI Dashboard Construction         | PT-04 | C-3     | A-3    | AI-010                         | PRM-320, MET-\*                              | P1     | [✅](../35-PROMPTS/122-kpi-dashboard-construction.md)        | draft |
| PRM-322 | Trend Analysis Preparation         | PT-04 | C-3     | A-3    | AI-010                         | PRM-321, MET-\*                              | P1     | [✅](../35-PROMPTS/124-trend-analysis-preparation.md)        | draft |
| PRM-323 | Audience Insight Generation        | PT-07 | C-3     | A-3    | AI-010, AI-001                 | PRM-322, EDT-002                             | P1     | [✅](../35-PROMPTS/126-audience-insight-generation.md)       | draft |
| PRM-324 | Recommendation Package Assembly    | PT-07 | C-3     | A-3    | AI-010, AI-012                 | PRM-323, PRM-301                             | P1     | [✅](../35-PROMPTS/128-recommendation-package-assembly.md)   | draft |
| PRM-325 | Analytics Validation               | PT-06 | C-2     | A-3    | AI-010, AI-004                 | PRM-324, MET-\*                              | P1     | [✅](../35-PROMPTS/130-analytics-validation.md)              | draft |
| PRM-326 | Reporting Consistency Validation   | PT-06 | C-2     | A-2    | AI-010, AI-011                 | PRM-325, PRM-301                             | P1     | [✅](../35-PROMPTS/132-reporting-consistency-validation.md)  | draft |
| PRM-327 | Executive Dashboard Validation     | PT-06 | C-3     | A-3    | AI-010, AI-014                 | PRM-326, MET-\*                              | P1     | [✅](../35-PROMPTS/134-executive-dashboard-validation.md)    | draft |
| PRM-328 | Analytics Quality Assessment       | PT-06 | C-3     | A-3    | AI-010, AI-012                 | PRM-327, PRM-326, PRM-325, EDT-001           | P1     | [✅](../35-PROMPTS/136-analytics-quality-assessment.md)      | draft |
| PRM-329 | Reporting Completion Validation    | PT-06 | C-3     | A-3    | AI-010, AI-011, AI-012, AI-001 | PRM-328, PLAT-\*                             | P1     | [✅](../35-PROMPTS/138-reporting-completion-validation.md)   | draft |
| PRM-330 | Operational Event Classification   | PT-04 | C-2     | A-2    | AI-010                         | PLAT-\*                                      | P1     | [✅](../35-PROMPTS/140-operational-event-classification.md)  | draft |
| PRM-331 | Alert Prioritization Strategy      | PT-07 | C-3     | A-3    | AI-010                         | PRM-330, ARCH-030                            | P1     | [✅](../35-PROMPTS/142-alert-prioritization-strategy.md)     | draft |
| PRM-332 | Incident Correlation Analysis      | PT-04 | C-3     | A-3    | AI-010                         | PRM-331                                      | P1     | [✅](../35-PROMPTS/144-incident-correlation-analysis.md)     | draft |
| PRM-333 | Operational Health Assessment      | PT-04 | C-2     | A-2    | AI-010, AI-012                 | PRM-332                                      | P1     | [✅](../35-PROMPTS/146-operational-health-assessment.md)     | draft |
| PRM-334 | Service Degradation Evaluation     | PT-06 | C-2     | A-2    | AI-010, AI-004                 | PRM-333, PLAT-\*                             | P1     | [✅](../35-PROMPTS/148-service-degradation-evaluation.md)    | draft |
| PRM-335 | Operational Risk Validation        | PT-06 | C-3     | A-3    | AI-010, AI-004                 | PRM-334, ARCH-030                            | P1     | [✅](../35-PROMPTS/150-operational-risk-validation.md)       | draft |
| PRM-336 | Monitoring Consistency Validation  | PT-06 | C-2     | A-2    | AI-010, AI-011                 | PRM-335, PLAT-\*                             | P1     | [✅](../35-PROMPTS/152-monitoring-consistency-validation.md) | draft |
| PRM-337 | Operational Intelligence Summary   | PT-07 | C-3     | A-3    | AI-010, AI-012, AI-014         | PRM-336, PRM-333, PRM-335                    | P1     | [✅](../35-PROMPTS/154-operational-intelligence-summary.md)  | draft |
| PRM-338 | Monitoring Quality Assessment      | PT-06 | C-3     | A-3    | AI-010, AI-012                 | PRM-337, PRM-336, PRM-335, EDT-001           | P1     | [✅](../35-PROMPTS/156-monitoring-quality-assessment.md)     | draft |
| PRM-339 | Monitoring Completion Validation   | PT-06 | C-3     | A-3    | AI-010, AI-011, AI-012, AI-014 | PRM-338, PLAT-\*                             | P1     | [✅](../35-PROMPTS/158-monitoring-completion-validation.md)  | draft |

#### FAM-KNW: Knowledge Prompts

| شناسه   | نام                                        | نوع   | پیچیدگی | اختیار | Agent مصرف‌کننده                       | وابستگی                                                       | اولویت | سند                                                                   | وضعیت    |
| ------- | ------------------------------------------ | ----- | ------- | ------ | -------------------------------------- | ------------------------------------------------------------- | ------ | --------------------------------------------------------------------- | -------- |
| PRM-401 | Brand Voice Context                        | PT-05 | C-1     | A-2    | همه                                    | BRD-002                                                       | P0     | [✅](../35-PROMPTS/40-brand-voice-context.md)                         | draft    |
| PRM-402 | Content Taxonomy Context                   | PT-05 | C-1     | A-2    | همه                                    | EDT-002                                                       | P0     | [✅](../35-PROMPTS/42-content-taxonomy-context.md)                    | draft    |
| PRM-403 | Knowledge Retrieval Strategy               | PT-04 | C-2     | A-3    | AI-011, AI-010, AI-001, AI-002         | ARCH-012                                                      | P1     | [✅](../35-PROMPTS/160-knowledge-retrieval-strategy.md)               | draft    |
| PRM-404 | Knowledge Source Selection                 | PT-07 | C-3     | A-3    | AI-011, AI-010                         | PRM-403, ARCH-012                                             | P1     | [✅](../35-PROMPTS/162-knowledge-source-selection.md)                 | draft    |
| PRM-405 | Knowledge Extraction Instruction           | PT-04 | C-3     | A-3    | AI-011, AI-010                         | PRM-404, ARCH-012, EDT-002                                    | P1     | [✅](../35-PROMPTS/164-knowledge-extraction-instruction.md)           | draft    |
| PRM-406 | Knowledge Normalization Validation         | PT-06 | C-2     | A-3    | AI-011, AI-004                         | PRM-405, ARCH-012, ARCH-003                                   | P1     | [✅](../35-PROMPTS/166-knowledge-normalization-validation.md)         | draft    |
| PRM-407 | Knowledge Quality Assessment               | PT-06 | C-3     | A-3    | AI-011, AI-012, AI-004                 | PRM-406, EDT-001                                              | P1     | [✅](../35-PROMPTS/168-knowledge-quality-assessment.md)               | draft    |
| PRM-408 | Knowledge Registration Validation          | PT-06 | C-3     | A-3    | AI-011, AI-012, AI-001, AI-014         | PRM-407, PRM-001                                              | P1     | [✅](../35-PROMPTS/170-knowledge-registration-validation.md)          | draft    |
| PRM-409 | —                                          | —     | —       | —      | —                                      | —                                                             | —      | —                                                                     | reserved |
| PRM-410 | Structured Knowledge Extraction            | PT-04 | C-2     | A-3    | AI-011, AI-010, AI-001, AI-002, AI-013 | ARCH-012, EDT-002                                             | P1     | [✅](../35-PROMPTS/200-structured-knowledge-extraction.md)            | draft    |
| PRM-411 | Unstructured Knowledge Extraction          | PT-04 | C-3     | A-3    | AI-011, AI-010, AI-013                 | PRM-410, ARCH-012                                             | P1     | [✅](../35-PROMPTS/202-unstructured-knowledge-extraction.md)          | draft    |
| PRM-412 | Knowledge Entity Identification            | PT-04 | C-2     | A-3    | AI-011, AI-010, AI-013                 | PRM-411, ARCH-012, ARCH-003                                   | P1     | [✅](../35-PROMPTS/204-knowledge-entity-identification.md)            | draft    |
| PRM-413 | Relationship Extraction                    | PT-04 | C-3     | A-3    | AI-011, AI-010                         | PRM-412, ARCH-012                                             | P1     | [✅](../35-PROMPTS/206-relationship-extraction.md)                    | draft    |
| PRM-414 | Knowledge Enrichment                       | PT-04 | C-3     | A-3    | AI-011, AI-010                         | PRM-413, KNW-\*                                               | P1     | [✅](../35-PROMPTS/208-knowledge-enrichment.md)                       | draft    |
| PRM-415 | Knowledge Classification                   | PT-04 | C-2     | A-3    | AI-011, AI-010, AI-001, AI-002         | PRM-414, EDT-002, ARCH-012                                    | P1     | [✅](../35-PROMPTS/210-knowledge-classification.md)                   | draft    |
| PRM-416 | Knowledge Deduplication Validation         | PT-06 | C-2     | A-3    | AI-011, AI-004                         | PRM-415, ARCH-012                                             | P1     | [✅](../35-PROMPTS/212-knowledge-deduplication-validation.md)         | draft    |
| PRM-417 | Knowledge Consistency Validation           | PT-06 | C-2     | A-3    | AI-011, AI-004                         | PRM-416, ARCH-012, ARCH-003                                   | P1     | [✅](../35-PROMPTS/214-knowledge-consistency-validation.md)           | draft    |
| PRM-418 | Knowledge Integrity Assessment             | PT-06 | C-3     | A-3    | AI-011, AI-012, AI-010, AI-004         | PRM-417, EDT-001                                              | P1     | [✅](../35-PROMPTS/216-knowledge-integrity-assessment.md)             | draft    |
| PRM-419 | Knowledge Extraction Completion Validation | PT-06 | C-3     | A-3    | AI-011, AI-012, AI-014                 | PRM-418, PRM-001                                              | P1     | [✅](../35-PROMPTS/218-knowledge-extraction-completion-validation.md) | draft    |
| PRM-420 | Research Planning Strategy                 | PT-04 | C-2     | A-3    | AI-013, AI-011, AI-001, AI-002         | ARCH-012                                                      | P1     | [✅](../35-PROMPTS/220-research-planning-strategy.md)                 | draft    |
| PRM-421 | Source Selection Strategy                  | PT-07 | C-3     | A-3    | AI-013, AI-011, AI-001                 | PRM-420, PRM-001                                              | P1     | [✅](../35-PROMPTS/222-source-selection-strategy.md)                  | draft    |
| PRM-422 | Evidence Collection Instruction            | PT-04 | C-3     | A-3    | AI-013, AI-011                         | PRM-421                                                       | P1     | [✅](../35-PROMPTS/224-evidence-collection-instruction.md)            | draft    |
| PRM-423 | Evidence Evaluation                        | PT-06 | C-2     | A-3    | AI-013, AI-004                         | PRM-422                                                       | P1     | [✅](../35-PROMPTS/226-evidence-evaluation.md)                        | draft    |
| PRM-424 | Cross-Source Correlation                   | PT-04 | C-3     | A-3    | AI-013, AI-010                         | PRM-423                                                       | P1     | [✅](../35-PROMPTS/228-cross-source-correlation.md)                   | draft    |
| PRM-425 | Insight Generation                         | PT-07 | C-3     | A-3    | AI-013, AI-001, AI-002, AI-012         | PRM-424                                                       | P1     | [✅](../35-PROMPTS/230-insight-generation.md)                         | draft    |
| PRM-426 | Research Consistency Validation            | PT-06 | C-2     | A-3    | AI-013, AI-004                         | PRM-425                                                       | P1     | [✅](../35-PROMPTS/232-research-consistency-validation.md)            | draft    |
| PRM-427 | Research Quality Assessment                | PT-06 | C-3     | A-3    | AI-013, AI-004                         | PRM-426                                                       | P1     | [✅](../35-PROMPTS/234-research-quality-assessment.md)                | draft    |
| PRM-428 | Research Report Assembly                   | PT-04 | C-3     | A-3    | AI-013, AI-010, AI-012                 | PRM-420, PRM-421, PRM-422, PRM-423, PRM-424, PRM-425, PRM-427 | P1     | [✅](../35-PROMPTS/236-research-report-assembly.md)                   | draft    |
| PRM-429 | Research Completion Validation             | PT-06 | C-3     | A-3    | AI-013, AI-011, AI-014, AI-004         | PRM-428                                                       | P1     | [✅](../35-PROMPTS/238-research-completion-validation.md)             | draft    |
| PRM-430 | Lessons Learned Capture                    | PT-04 | C-2     | A-3    | AI-012, AI-011                         | —                                                             | P1     | [✅](../35-PROMPTS/250-lessons-learned-capture.md)                    | draft    |
| PRM-431 | Improvement Opportunity Identification     | PT-07 | C-3     | A-3    | AI-012, AI-010                         | PRM-430                                                       | P1     | [✅](../35-PROMPTS/252-improvement-opportunity-identification.md)     | draft    |
| PRM-432 | Root Cause Analysis Preparation            | PT-04 | C-3     | A-3    | AI-012, AI-011                         | PRM-431                                                       | P1     | [✅](../35-PROMPTS/254-root-cause-analysis-preparation.md)            | draft    |
| PRM-433 | Organizational Learning Synthesis          | PT-07 | C-3     | A-3    | AI-012, AI-001, AI-013                 | PRM-430, PRM-431, PRM-432                                     | P1     | [✅](../35-PROMPTS/256-organizational-learning-synthesis.md)          | draft    |
| PRM-434 | Knowledge Evolution Planning               | PT-04 | C-3     | A-3    | AI-012, AI-011                         | PRM-433, PRM-001                                              | P1     | [✅](../35-PROMPTS/258-knowledge-evolution-planning.md)               | draft    |
| PRM-435 | Optimization Recommendation Assembly       | PT-07 | C-3     | A-3    | AI-012, AI-001, AI-002                 | PRM-434, PRM-431, PRM-433                                     | P1     | [✅](../35-PROMPTS/260-optimization-recommendation-assembly.md)       | draft    |
| PRM-436 | Learning Consistency Validation            | PT-06 | C-2     | A-3    | AI-012, AI-004                         | PRM-435, PRM-433, PRM-430                                     | P1     | [✅](../35-PROMPTS/262-learning-consistency-validation.md)            | draft    |
| PRM-437 | Organizational Learning Assessment         | PT-06 | C-3     | A-3    | AI-012, AI-004                         | PRM-436, PRM-435, PRM-433                                     | P1     | [✅](../35-PROMPTS/264-organizational-learning-assessment.md)         | draft    |
| PRM-438 | Improvement Package Assembly               | PT-04 | C-3     | A-3    | AI-012, AI-010, AI-001                 | PRM-430, PRM-431, PRM-432, PRM-433, PRM-434, PRM-435, PRM-437 | P1     | [✅](../35-PROMPTS/266-improvement-package-assembly.md)               | draft    |
| PRM-439 | Learning Completion Validation             | PT-06 | C-3     | A-3    | AI-012, AI-011, AI-014, AI-004         | PRM-438                                                       | P1     | [✅](../35-PROMPTS/268-learning-completion-validation.md)             | draft    |

#### FAM-SYS: System Prompts

| شناسه   | نام                                            | نوع   | پیچیدگی | اختیار | Agent مصرف‌کننده       | وابستگی          | اولویت | سند                                                                      | وضعیت |
| ------- | ---------------------------------------------- | ----- | ------- | ------ | ---------------------- | ---------------- | ------ | ------------------------------------------------------------------------ | ----- |
| PRM-901 | Orchestrator System Definition                 | PT-01 | C-3     | A-4    | AI-014                 | همه PRM-\*       | P0     | [✅](../35-PROMPTS/90-orchestrator-system-definition.md)                 | draft |
| PRM-902 | System Task Decomposition                      | PT-04 | C-3     | A-4    | AI-014                 | PRM-901          | P0     | [✅](../35-PROMPTS/92-system-task-decomposition.md)                      | draft |
| PRM-903 | Agent Capability Matching                      | PT-07 | C-3     | A-4    | AI-014, AI-001         | PRM-902          | P0     | [✅](../35-PROMPTS/93-agent-capability-matching.md)                      | draft |
| PRM-904 | Execution Routing Strategy                     | PT-04 | C-4     | A-4    | AI-014                 | PRM-903, PRM-902 | P0     | [✅](../35-PROMPTS/94-execution-routing-strategy.md)                     | draft |
| PRM-905 | Execution Recovery Strategy                    | PT-07 | C-4     | A-4    | AI-014, AI-012         | PRM-904          | P0     | [✅](../35-PROMPTS/95-execution-recovery-strategy.md)                    | draft |
| PRM-906 | Cross-Agent Consistency Validation             | PT-06 | C-3     | A-4    | AI-004, AI-011, AI-014 | PRM-905          | P0     | [✅](../35-PROMPTS/96-cross-agent-consistency-validation.md)             | draft |
| PRM-907 | Enterprise Orchestration Completion Validation | PT-06 | C-4     | A-4    | AI-014, AI-011, AI-012 | PRM-906, PRM-904 | P0     | [✅](../35-PROMPTS/97-enterprise-orchestration-completion-validation.md) | draft |

---

## ۲۰. Reserved Identifier Table

### شناسه‌های رزروشده

| شناسه           | کاربرد                                         | وضعیت    |
| --------------- | ---------------------------------------------- | -------- |
| PRM-000         | Enterprise Prompt Architecture (معماری مادر)   | Active   |
| PRM-001         | Enterprise Prompt Index (نمایه مرکزی)          | Active   |
| PRM-002         | رزرو برای توسعه آینده                          | Reserved |
| PRM-009         | رزرو برای توسعه آینده                          | Reserved |
| PRM-099         | رزرو برای توسعه آینده                          | Reserved |
| PRM-101         | Enterprise Strategic Planning                  | Draft    |
| PRM-102         | Goal Decomposition                             | Draft    |
| PRM-103         | Decision Framing                               | Draft    |
| PRM-104         | Governance Compliance                          | Draft    |
| PRM-105         | Executive Response Generation                  | Draft    |
| PRM-201         | Content Production Instruction                 | Draft    |
| PRM-202         | Content Review Validation                      | Draft    |
| PRM-203         | Content Structuring Instruction                | Draft    |
| PRM-204         | Metadata Generation Instruction                | Draft    |
| PRM-205         | Accessibility Enhancement Instruction          | Draft    |
| PRM-206         | Localization & Translation Instruction         | Draft    |
| PRM-207         | Platform Format Adaptation                     | Draft    |
| PRM-208         | Content Quality Check                          | Draft    |
| PRM-209         | Multi-Platform Adaptation Chain                | Draft    |
| PRM-210         | Review Preparation                             | Draft    |
| PRM-211         | Structural Validation                          | Draft    |
| PRM-212         | Terminology Validation                         | Draft    |
| PRM-213         | Consistency Validation                         | Draft    |
| PRM-214         | Publication Readiness Validation               | Draft    |
| PRM-215–PRM-219 | رزرو برای زیرخانواده CON-RVW (Review)          | Reserved |
| PRM-220         | Semantic Optimization                          | Draft    |
| PRM-221         | Search Intent Alignment                        | Draft    |
| PRM-222         | Internal Linking Strategy                      | Draft    |
| PRM-223         | Structured Metadata Enhancement                | Draft    |
| PRM-224         | Discoverability Validation                     | Draft    |
| PRM-225–PRM-229 | رزرو برای زیرخانواده CON-SEO (Optimization)    | Reserved |
| PRM-230         | Media Planning Instruction                     | Draft    |
| PRM-231         | Visual Composition Instruction                 | Draft    |
| PRM-232         | Brand Visual Compliance                        | Draft    |
| PRM-233         | Accessibility Media Validation                 | Draft    |
| PRM-234         | Media Production Readiness                     | Draft    |
| PRM-235–PRM-239 | رزرو برای زیرخانواده CON-MED (Media)           | Reserved |
| PRM-240         | Video Storyboard Planning                      | Draft    |
| PRM-241         | Video Scene Composition                        | Draft    |
| PRM-242         | Audio & Narration Guidance                     | Draft    |
| PRM-243         | Video Brand Compliance                         | Draft    |
| PRM-244         | Video Publication Readiness                    | Draft    |
| PRM-245–PRM-249 | رزرو برای زیرخانواده CON-VID (Video)           | Reserved |
| PRM-250–PRM-259 | رزرو برای زیرخانواده CON-FMT (Format)          | Reserved |
| PRM-301         | Publishing Instruction                         | Draft    |
| PRM-302         | Publishing Package Assembly                    | Draft    |
| PRM-303         | Platform Selection Strategy                    | Draft    |
| PRM-304         | Publication Scheduling                         | Draft    |
| PRM-305         | Platform Compliance Validation                 | Draft    |
| PRM-306         | Publication Execution Chain                    | Draft    |
| PRM-307         | Publication Verification                       | Draft    |
| PRM-308         | Distribution Completion Validation             | Draft    |
| PRM-309         | رزرو برای خانواده Operations                   | Reserved |
| PRM-310         | Comment Classification                         | Draft    |
| PRM-311         | Response Strategy Selection                    | Draft    |
| PRM-312         | Response Draft Preparation                     | Draft    |
| PRM-313         | Moderation Validation                          | Draft    |
| PRM-314         | Escalation Decision                            | Draft    |
| PRM-315         | Community Interaction Validation               | Draft    |
| PRM-316         | Sentiment Observation                          | Draft    |
| PRM-317         | Conversation Continuity                        | Draft    |
| PRM-318         | Community Incident Assessment                  | Draft    |
| PRM-319         | Community Handoff Validation                   | Draft    |
| PRM-320–PRM-329 | زیرخانواده OPS-RPT (Reporting) — تکمیل‌شده     | Draft    |
| PRM-330–PRM-339 | زیرخانواده OPS-MON (Monitoring) — تکمیل‌شده    | Draft    |
| PRM-401         | Brand Voice Context                            | Draft    |
| PRM-402         | Content Taxonomy Context                       | Draft    |
| PRM-403         | Knowledge Retrieval Strategy                   | Draft    |
| PRM-404         | Knowledge Source Selection                     | Draft    |
| PRM-405         | Knowledge Extraction Instruction               | Draft    |
| PRM-406         | Knowledge Normalization Validation             | Draft    |
| PRM-407         | Knowledge Quality Assessment                   | Draft    |
| PRM-408         | Knowledge Registration Validation              | Draft    |
| PRM-409         | رزرو برای خانواده Knowledge                    | Reserved |
| PRM-410         | Structured Knowledge Extraction                | Draft    |
| PRM-411         | Unstructured Knowledge Extraction              | Draft    |
| PRM-412         | Knowledge Entity Identification                | Draft    |
| PRM-413         | Relationship Extraction                        | Draft    |
| PRM-414         | Knowledge Enrichment                           | Draft    |
| PRM-415         | Knowledge Classification                       | Draft    |
| PRM-416         | Knowledge Deduplication Validation             | Draft    |
| PRM-417         | Knowledge Consistency Validation               | Draft    |
| PRM-418         | Knowledge Integrity Assessment                 | Draft    |
| PRM-419         | Knowledge Extraction Completion Validation     | Draft    |
| PRM-420         | Research Planning Strategy                     | Draft    |
| PRM-421         | Source Selection Strategy                      | Draft    |
| PRM-422         | Evidence Collection Instruction                | Draft    |
| PRM-423         | Evidence Evaluation                            | Draft    |
| PRM-424         | Cross-Source Correlation                       | Draft    |
| PRM-425         | Insight Generation                             | Draft    |
| PRM-426         | Research Consistency Validation                | Draft    |
| PRM-427         | Research Quality Assessment                    | Draft    |
| PRM-428         | Research Report Assembly                       | Draft    |
| PRM-429         | Research Completion Validation                 | Draft    |
| PRM-430         | Lessons Learned Capture                        | Draft    |
| PRM-431         | Improvement Opportunity Identification         | Draft    |
| PRM-432         | Root Cause Analysis Preparation                | Draft    |
| PRM-433         | Organizational Learning Synthesis              | Draft    |
| PRM-434         | Knowledge Evolution Planning                   | Draft    |
| PRM-435         | Optimization Recommendation Assembly           | Draft    |
| PRM-436         | Learning Consistency Validation                | Draft    |
| PRM-437         | Organizational Learning Assessment             | Draft    |
| PRM-438         | Improvement Package Assembly                   | Draft    |
| PRM-439         | Learning Completion Validation                 | Draft    |
| PRM-440–PRM-499 | رزرو برای توسعه آینده FAM-KNW                  | Reserved |
| PRM-500–PRM-899 | رزرو برای خانواده‌های جدید در توسعه آینده      | Reserved |
| PRM-901         | Orchestrator System Definition                 | Draft    |
| PRM-902         | System Task Decomposition                      | Draft    |
| PRM-903         | Agent Capability Matching                      | Draft    |
| PRM-904         | Execution Routing Strategy                     | Draft    |
| PRM-905         | Execution Recovery Strategy                    | Draft    |
| PRM-906         | Cross-Agent Consistency Validation             | Draft    |
| PRM-907         | Enterprise Orchestration Completion Validation | Draft    |
| PRM-908–PRM-999 | رزرو برای توسعه آینده                          | Reserved |

---

## ۲۱. Future Expansion

### مسیرهای توسعه آینده

PRM-001 برای توسعه‌های زیر در آینده طراحی شده است:

| مورد                  | دامنه شناسه        | توضیح                                       |
| --------------------- | ------------------ | ------------------------------------------- |
| خانواده جدید          | PRM-5xx تا PRM-8xx | خانواده‌های جدید با شناسه‌های رزروشده       |
| زیرخانواده جدید       | درون هر خانواده    | زیرخانواده‌های جدید با شناسه‌های آزاد       |
| ADR برای خانواده جدید | —                  | نیازمند ADR + به‌روزرسانی PRM-000 و PRM-001 |
| Cross-Family Prompt   | PRM-NNN            | پرامپت‌های بین‌خانواده‌ای نیازمند ADR       |

---

## ۲۲. Validation Rules

| ID     | قانون                                                          | سطح     | نقض     |
| ------ | -------------------------------------------------------------- | ------- | ------- |
| VR-R01 | هر پرامپت باید شناسه یکتا در Registry داشته باشد               | معماری  | عدم ثبت |
| VR-R02 | هر پرامپت باید در خانواده معتبر ثبت شود                        | معماری  | عدم ثبت |
| VR-R03 | شناسه پرامپت باید با دامنه خانواده مطابقت داشته باشد           | معماری  | عدم ثبت |
| VR-R04 | Type پرامپت باید با خانواده سازگار باشد                        | معماری  | عدم ثبت |
| VR-R05 | سطح پیچیدگی باید با معیارهای جدول همخوانی داشته باشد           | معماری  | هشدار   |
| VR-R06 | وابستگی‌ها باید غیرچرخه‌ای باشند                               | معماری  | عدم ثبت |
| VR-R07 | هر پرامپت باید حداقل یک مصرف‌کننده (Agent/Workflow) داشته باشد | معماری  | هشدار   |
| VR-R08 | پرامپت‌های Active باید MAJOR ≥ 1 داشته باشند                   | معماری  | عدم ثبت |
| VR-R09 | پرامپت‌های A-3 و A-4 نیازمند ADR هستند                         | معماری  | عدم ثبت |
| VR-R10 | تغییر Status باید در Change Log ثبت شود                        | معماری  | هشدار   |
| VR-R11 | پرامپت Deprecated باید مصرف‌کنندگان را اطلاع دهد               | عملیاتی | هشدار   |
| VR-R12 | پرامپت‌های Retired نباید مصرف‌کننده فعال داشته باشند           | معماری  | عدم ثبت |
| VR-R13 | Owner باید در Registry ثبت شده باشد                            | معماری  | عدم ثبت |
| VR-R14 | Version باید SemVer معتبر باشد                                 | معماری  | عدم ثبت |
| VR-R15 | نگاشت Agent باید با نقش Agent همخوانی داشته باشد               | معماری  | هشدار   |

---

## ۲۳. Reading Guide

این سند توسط موجودیت‌های مختلف به روش‌های مختلف خوانده می‌شود:

### برای معمار سیستم

از **§۱ (Purpose)** و **§۲ (Prompt Registry)** و **§۴ (Prompt Families)** شروع کنید. سپس **§۵ (Prompt Categories)** , **§۱۷ (Cross Reference Matrix)** و **§۲۲ (Validation Rules)** را بخوانید. برای ایجاد خانواده جدید از **§۲۱ (Future Expansion)** استفاده کنید.

### برای Prompt Engineer

از **§۳ (Identifier Rules)** و **§۴ (Families)** برای درک شناسه‌گذاری شروع کنید. **§۱۹ (Prompt Catalog)** فهرست پرامپت‌های موجود را مشخص می‌کند. **§۶ (Type Registry)** و **§۷ (Complexity Registry)** محدودیت‌های طراحی را تعیین می‌کنند.

### برای حکمران پرامپت

از **§۱۱ (Status Model)** و **§۱۲ (Dependency Registry)** و **§۲۲ (Validation Rules)** شروع کنید. **§۹ (Ownership Registry)** و **§۱۰ (Version Registry)** برای مدیریت مالکیت و نسخه استفاده می‌شوند.

### برای پیاده‌کننده Agent

از **§۱۳ (Agent Mapping)** و **§۱۴ (Automation Mapping)** برای یافتن پرامپت‌های مصرفی Agent خود شروع کنید. **§۱۹ (Prompt Catalog)** جزئیات هر پرامپت را مشخص می‌کند.

### مسیرهای خواندن

| مخاطب             | مسیر                    |
| ----------------- | ----------------------- |
| معمار سیستم       | ۱ → ۲ → ۴ → ۵ → ۱۷ → ۲۲ |
| Prompt Engineer   | ۳ → ۴ → ۶ → ۷ → ۱۹ → ۱۸ |
| حکمران پرامپت     | ۱۱ → ۱۲ → ۲۲ → ۹ → ۱۰   |
| پیاده‌کننده Agent | ۱۳ → ۱۴ → ۱۹ → ۳        |
| ممیز (Auditor)    | ۱۷ → ۱۳ → ۱۴ → ۲۲       |
| MCP / Runtime     | ۱۸ → ۳ → ۱۱             |

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | توسط        |
| ----------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 2.7.0-draft | 2026-06-29 | P5.S18 — افزودن ۶ پرامپت SYS-ORC (PRM-902–907: System Task Decomposition, Agent Capability Matching, Execution Routing Strategy, Execution Recovery Strategy, Cross-Agent Consistency Validation, Enterprise Orchestration Completion Validation) — تکمیل زیرخانواده SYS-ORC — **تکمیل کامل FAM-SYS (۷ پرامپت: PRM-901–907)** — به‌روزرسانی کاتالوگ (planned→draft), Agent Mapping (AI-004, AI-011, AI-012, AI-014, AI-001), Reserved Identifiers (PRM-902–907 Draft), Registry Statistics (111→117 registered, 6→0 planned), Type Registry (PT-06→FAM-SYS, PT-07→FAM-KNW+OPS), Automation Mapping (AUT-001-055..059), Knowledge Mapping, Change Log — **تکمیل کامل Enterprise Prompt Library (P5)** — ۱۱۷ پرامپت registered, ۰ planned | معمار سیستم |
| 2.6.0-draft | 2026-06-28 | P5.S17 — افزودن ۱۰ پرامپت KNW-LRN (PRM-430–439: Lessons Learned Capture, Improvement Opportunity Identification, Root Cause Analysis Preparation, Organizational Learning Synthesis, Knowledge Evolution Planning, Optimization Recommendation Assembly, Learning Consistency Validation, Organizational Learning Assessment, Improvement Package Assembly, Learning Completion Validation) — تکمیل زیرخانواده KNW-LRN — به‌روزرسانی کاتالوگ, Agent Mapping (AI-001, AI-002, AI-004, AI-010, AI-011, AI-012, AI-013, AI-014), Reserved Identifiers (PRM-430–439 Draft), Registry Statistics (101→111 registered), Automation Mapping (AUT-001-049..054 Knowledge Learning) — **تکمیل کامل FAM-KNW (۴۰ پرامپت: PRM-401–439)**            | معمار سیستم |
| 2.5.0-draft | 2026-06-28 | P5.S16 — افزودن ۱۰ پرامپت KNW-RSR (PRM-420–429: Research Planning Strategy, Source Selection Strategy, Evidence Collection Instruction, Evidence Evaluation, Cross-Source Correlation, Insight Generation, Research Consistency Validation, Research Quality Assessment, Research Report Assembly, Research Completion Validation) — تکمیل زیرخانواده KNW-RSR — به‌روزرسانی کاتالوگ, Agent Mapping (AI-001, AI-002, AI-004, AI-010, AI-011, AI-012, AI-013, AI-014), Reserved Identifiers (PRM-420–429 Draft), Registry Statistics (91→101 registered), Automation Mapping (AUT-001-044..048 Knowledge Research) — تکمیل زیرخانواده KNW-RSR                                                                                             | معمار سیستم |
| 2.4.0-draft | 2026-06-28 | P5.S15 — افزودن ۱۰ پرامپت KNW-EXT (PRM-410–419: Structured Knowledge Extraction, Unstructured Knowledge Extraction, Knowledge Entity Identification, Relationship Extraction, Knowledge Enrichment, Knowledge Classification, Knowledge Deduplication Validation, Knowledge Consistency Validation, Knowledge Integrity Assessment, Knowledge Extraction Completion Validation) — تکمیل زیرخانواده KNW-EXT — به‌روزرسانی کاتالوگ, Agent Mapping (AI-001, AI-002, AI-004, AI-010, AI-011, AI-012, AI-013, AI-014), Reserved Identifiers (PRM-410–419 Draft), Registry Statistics (81→91 registered) — تکمیل زیرخانواده KNW-EXT                                                                                                           | معمار سیستم |
| 2.3.0-draft | 2026-06-28 | P5.S14 — افزودن ۶ پرامپت KNW-RTR (PRM-403–408: Knowledge Retrieval Strategy, Knowledge Source Selection, Knowledge Extraction Instruction, Knowledge Normalization Validation, Knowledge Quality Assessment, Knowledge Registration Validation) — اولین زیرخانواده FAM-KNW — به‌روزرسانی کاتالوگ, Agent Mapping (AI-001, AI-002, AI-004, AI-010, AI-011, AI-012, AI-014), FAM-KNW consumers, Reserved Identifiers (PRM-403–408 Draft), Registry Statistics (75→81 registered, 4→0 planned) — تکمیل زیرخانواده KNW-RTR                                                                                                                                                                                                                   | معمار سیستم |
| 2.2.0-draft | 2026-06-28 | P5.S13 — افزودن ۱۰ پرامپت OPS-MON (PRM-330–339: Operational Event Classification, Alert Prioritization Strategy, Incident Correlation Analysis, Operational Health Assessment, Service Degradation Evaluation, Operational Risk Validation, Monitoring Consistency Validation, Operational Intelligence Summary, Monitoring Quality Assessment, Monitoring Completion Validation) — تکمیل زیرخانواده OPS-MON — تکمیل کامل FAM-OPS (۳۹ پرامپت: PRM-301–339) — به‌روزرسانی کاتالوگ, Agent Mapping (AI-004, AI-010, AI-011, AI-012, AI-014), Reserved Identifiers, Registry Statistics (65→75 registered)                                                                                                                                  | معمار سیستم |
| 2.1.0-draft | 2026-06-28 | P5.S12 — افزودن ۱۰ پرامپت OPS-RPT (PRM-320–329: Performance Report Generation, KPI Dashboard Construction, Trend Analysis Preparation, Audience Insight Generation, Recommendation Package Assembly, Analytics Validation, Reporting Consistency Validation, Executive Dashboard Validation, Analytics Quality Assessment, Reporting Completion Validation) — تکمیل زیرخانواده OPS-RPT — به‌روزرسانی کاتالوگ, Agent Mapping (AI-001, AI-010, AI-011, AI-012, AI-014), Reserved Identifiers, Registry Statistics (55→65 registered)                                                                                                                                                                                                      | معمار سیستم |
| 2.0.0-draft | 2026-06-28 | P5.S11 — افزودن ۱۰ پرامپت OPS-CMG (PRM-310–319: Comment Classification, Response Strategy Selection, Response Draft Preparation, Moderation Validation, Escalation Decision, Community Interaction Validation, Sentiment Observation, Conversation Continuity, Community Incident Assessment, Community Handoff Validation) — تکمیل زیرخانواده OPS-CMG — به‌روزرسانی کاتالوگ, Agent Mapping (AI-004, AI-009, AI-010, AI-011, AI-012, AI-014), FAM-OPS consumers, Reserved Identifiers (PRM-320–339), Registry Statistics                                                                                                                                                                                                                | معمار سیستم |
| 1.9.0-draft | 2026-06-28 | P5.S10 — افزودن ۷ پرامپت OPS-PUB (PRM-302–308: Publishing Package Assembly, Platform Selection Strategy, Publication Scheduling, Platform Compliance Validation, Publication Execution Chain, Publication Verification, Distribution Completion Validation) — تکمیل زیرخانواده OPS-PUB — به‌روزرسانی کاتالوگ, Agent Mapping (AI-004, AI-008, AI-009, AI-010, AI-011, AI-014), FAM-OPS consumers, Reserved Identifiers, Registry Statistics                                                                                                                                                                                                                                                                                              | معمار سیستم |
| 1.8.0-draft | 2026-06-28 | P5.S9 — افزودن ۵ پرامپت ویدئو (PRM-240–244: Video Storyboard Planning, Video Scene Composition, Audio & Narration Guidance, Video Brand Compliance, Video Publication Readiness) — تکمیل زیرخانواده CON-VID — به‌روزرسانی کاتالوگ, Agent Mapping (AI-004, AI-007, AI-008, AI-010), Reserved Identifiers                                                                                                                                                                                                                                                                                                                                                                                                                                 | معمار سیستم |
| 1.7.0-draft | 2026-06-28 | P5.S8 — افزودن ۵ پرامپت رسانه (PRM-230–234: Media Planning, Visual Composition, Brand Visual Compliance, Accessibility Media Validation, Media Production Readiness) — تکمیل زیرخانواده CON-MED — به‌روزرسانی کاتالوگ, Agent Mapping (AI-004, AI-006, AI-007, AI-008), Reserved Identifiers                                                                                                                                                                                                                                                                                                                                                                                                                                             | معمار سیستم |
| 1.6.0-draft | 2026-06-28 | P5.S7 — افزودن ۵ پرامپت بهینه‌سازی (PRM-220–224: Semantic Optimization, Search Intent Alignment, Internal Linking Strategy, Structured Metadata Enhancement, Discoverability Validation) — تکمیل زیرخانواده CON-SEO — به‌روزرسانی کاتالوگ, Agent Mapping (AI-005, AI-008, AI-010, AI-011), Reserved Identifiers                                                                                                                                                                                                                                                                                                                                                                                                                         | معمار سیستم |
| 1.5.0-draft | 2026-06-28 | P5.S6 — افزودن ۵ پرامپت بازبینی (PRM-210–214: Review Preparation, Structural Validation, Terminology Validation, Consistency Validation, Publication Readiness Validation) — تکمیل زیرخانواده CON-RVW — به‌روزرسانی کاتالوگ, Agent Mapping, Reserved Identifiers                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | معمار سیستم |
| 1.4.0-draft | 2026-06-28 | P5.S5 — افزودن ۳ پرامپت محتوایی (PRM-207–209: Platform Format Adaptation, Content Quality Check, Multi-Platform Adaptation Chain) — به‌روزرسانی کامل کاتالوگ, Agent Mapping, Reserved Identifiers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | معمار سیستم |
| 1.3.0-draft | 2026-06-28 | P5.S4 — افزودن ۴ پرامپت محتوایی (PRM-203–206: Content Structuring, Metadata Generation, Accessibility Enhancement, Localization & Translation) — به‌روزرسانی کاتالوگ, Agent Mapping                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | معمار سیستم |
| 1.2.0-draft | 2026-06-28 | P5.S3 — افزودن ۵ پرامپت استراتژیک (PRM-101 تا PRM-105) — به‌روزرسانی Agent Mapping, Registry, Reserved Identifiers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | معمار سیستم |
| 1.1.0-draft | 2026-06-28 | افزودن ستون‌های سند و وضعیت به کاتالوگ — ثبت ۶ پرامپت جدید (PRM-201, PRM-202, PRM-301, PRM-401, PRM-402, PRM-901) با سند draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | معمار سیستم |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — نمایه پرامپت سازمانی                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | معمار سیستم |
