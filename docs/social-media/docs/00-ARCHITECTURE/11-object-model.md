# Object Model — مدل اشیاء SMOS

> **شناسه:** ARCH-011
> **وضعیت:** منتشرشده
> **نسخه:** 1.0.0
> **به‌روزرسانی:** 2026-06-26
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** [ARCH-010](./10-meta-architecture.md)
> **مخاطب:** human, agent, n8n, mcp

---

## ۱. معرفی

این سند مدل اشیاء (Object Model) SMOS را تعریف می‌کند.
هر موجودیت در سیستم یک شیء است با: ID یکتا، والد، فرزندان، روابط، چرخه حیات و مالک.

## ۲. اصول مدل اشیاء

1. هر شیء یک **شناسه یکتای جهانی** (UUID) در زمان ایجاد دریافت می‌کند
2. هر شیء یک **نوع** (Type) دارد که مشخص‌کننده قواعد آن است
3. هر شیء یک **والد** دارد (جز اشیاء ریشه)
4. هر شیء یک **چرخه حیات** با وضعیت‌های مشخص دارد
5. هر شیء یک **مالک انسانی** دارد (حتی اگر توسط Agent ایجاد شده باشد)
6. هر شیء به یک **منبع حقیقت واحد** مستند متصل است

## ۳. چرخه حیات عمومی (General Lifecycle)

```
ایده (Idea)
  │
  ├── تحقیق (Research)
  │    └── اعتبارسنجی (Validation)
  │         └── برنامه‌ریزی (Planning)
  │              └── تولید (Writing)
  │                   └── بازبینی (Review)
  │                        └── تأیید (Approval)
  │                             └── تولید نهایی (Production)
  │                                  └── انتشار (Publishing)
  │                                       └── توزیع (Distribution)
  │                                            └── نظارت (Monitoring)
  │                                                 └── تحلیل (Analytics)
  │                                                      └── استخراج دانش (Knowledge Extraction)
  │                                                           └── بهبود مستمر (Continuous Improvement)
  │                                                                └── بایگانی (Archive)
```

### وضعیت‌های استاندارد

| وضعیت               | توضیح              | امکان بازگشت |
| ------------------- | ------------------ | ------------ |
| `draft`             | پیش‌نویس اولیه     | —            |
| `in_review`         | در حال بازبینی     | بله          |
| `changes_requested` | نیاز به اصلاح      | بله          |
| `approved`          | تأیید شده          | خیر          |
| `in_production`     | در حال تولید نهایی | خیر          |
| `published`         | منتشر شده          | خیر          |
| `archived`          | بایگانی شده        | خیر          |
| `deprecated`        | منسوخ              | خیر          |

---

## ۴. فهرست کامل اشیاء

### OBJ-001: Campaign (کمپین)

| فیلد         | مقدار                                                     |
| ------------ | --------------------------------------------------------- |
| **هدف**      | مجموعه‌ای از فعالیت‌ها با هدف تجاری مشخص                  |
| **والد**     | Mission                                                   |
| **فرزندان**  | Content Pillar                                            |
| **روابط**    | Platform, Persona, Budget, Timeline                       |
| **مالک**     | مدیر بازاریابی                                            |
| **SSOT**     | CAM-\* (جدید)                                             |
| **وضعیت‌ها** | draft → approved → active → paused → completed → archived |

### OBJ-002: Content Pillar (ستون محتوا)

| فیلد         | مقدار                                |
| ------------ | ------------------------------------ |
| **هدف**      | حوزه موضوعی پایدار و همیشگی محتوا    |
| **والد**     | Campaign                             |
| **فرزندان**  | Content Series                       |
| **روابط**    | Brand Rule, Audience                 |
| **مالک**     | استراتژیست محتوا                     |
| **SSOT**     | PILLAR-\* (جدید)                     |
| **وضعیت‌ها** | draft → active → inactive → archived |

### OBJ-003: Content Series (سری محتوا)

| فیلد         | مقدار                                   |
| ------------ | --------------------------------------- |
| **هدف**      | دنباله‌ای از قطعات محتوای مرتبط         |
| **والد**     | Content Pillar                          |
| **فرزندان**  | Content Piece                           |
| **روابط**    | Editorial Calendar                      |
| **مالک**     | تولیدکننده محتوا                        |
| **SSOT**     | SERIES-\* (جدید)                        |
| **وضعیت‌ها** | planned → active → completed → archived |

### OBJ-004: Content Piece (قطعه محتوا)

| فیلد         | مقدار                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------ |
| **هدف**      | واحد پایه و اتمی محتوا                                                                     |
| **والد**     | Content Series                                                                             |
| **فرزندان**  | Platform Version, Asset                                                                    |
| **روابط**    | Prompt, Caption, Approval, Feedback                                                        |
| **مالک**     | نویسنده محتوا                                                                              |
| **SSOT**     | CONT-\* (جدید)                                                                             |
| **وضعیت‌ها** | idea → researching → writing → in_review → approved → in_production → published → archived |

### OBJ-005: Platform Version (نسخه پلتفرم)

| فیلد         | مقدار                                          |
| ------------ | ---------------------------------------------- |
| **هدف**      | بومی‌سازی یک قطعه محتوا برای یک پلتفرم خاص     |
| **والد**     | Content Piece                                  |
| **فرزندان**  | Content Variant                                |
| **روابط**    | Platform, Character Limit, Format              |
| **مالک**     | تولیدکننده محتوا                               |
| **SSOT**     | CONT-\* (همان قطعه)                            |
| **وضعیت‌ها** | draft → adapted → reviewed → ready → published |

### OBJ-006: Content Variant (واریانت محتوا)

| فیلد         | مقدار                                       |
| ------------ | ------------------------------------------- |
| **هدف**      | تغییر A/B یک نسخه پلتفرم برای آزمایش        |
| **والد**     | Platform Version                            |
| **فرزندان**  | Publication                                 |
| **روابط**    | Metric (A/B test results)                   |
| **مالک**     | تحلیل‌گر                                    |
| **SSOT**     | CONT-\* (همان قطعه)                         |
| **وضعیت‌ها** | draft → active → winner_selected → archived |

### OBJ-007: Asset (دارایی)

| فیلد         | مقدار                                                       |
| ------------ | ----------------------------------------------------------- |
| **هدف**      | فایل رسانه‌ای (تصویر، ویدئو، صوت، سند)                      |
| **والد**     | Content Piece (یا مستقل)                                    |
| **فرزندان**  | Asset Version                                               |
| **روابط**    | License, Tags, Folder                                       |
| **مالک**     | مدیر دارایی‌ها                                              |
| **SSOT**     | [AST-001](../26-ASSETS/10-media-library.md)                 |
| **وضعیت‌ها** | uploaded → processing → ready → in_use → archived → deleted |

### OBJ-008: Caption (کپشن)

| فیلد         | مقدار                                   |
| ------------ | --------------------------------------- |
| **هدف**      | متن همراه محتوا در پلتفرم               |
| **والد**     | Platform Version                        |
| **فرزندان**  | —                                       |
| **روابط**    | Hashtag, Mention, Link, Call-to-Action  |
| **مالک**     | نویسنده محتوا                           |
| **SSOT**     | CONT-\* (همان قطعه)                     |
| **وضعیت‌ها** | draft → reviewed → approved → published |

### OBJ-009: Prompt (پرامپت)

| فیلد         | مقدار                                                      |
| ------------ | ---------------------------------------------------------- |
| **هدف**      | دستورالعمل ورودی برای AI Agent                             |
| **والد**     | (کتابخانه پرامپت)                                          |
| **فرزندان**  | Prompt Version                                             |
| **روابط**    | Agent, Content Type, Tone                                  |
| **مالک**     | مهندس پرامپت                                               |
| **SSOT**     | [PRM-\*](../35-PROMPTS/)                                   |
| **وضعیت‌ها** | draft → tested → reviewed → approved → active → deprecated |

### OBJ-010: Platform (پلتفرم)

| فیلد         | مقدار                               |
| ------------ | ----------------------------------- |
| **هدف**      | یک شبکه اجتماعی یا کانال انتشار     |
| **والد**     | Enterprise                          |
| **فرزندان**  | Account                             |
| **روابط**    | API, Format Rules, Character Limits |
| **مالک**     | مدیر پلتفرم                         |
| **SSOT**     | [PLAT-\*](../20-PLATFORMS/)         |
| **وضعیت‌ها** | active → paused → deprecated        |

### OBJ-011: Persona (پرسونا)

| فیلد         | مقدار                                           |
| ------------ | ----------------------------------------------- |
| **هدف**      | نماینده یک گروه مخاطب هدف                       |
| **والد**     | Audience                                        |
| **فرزندان**  | —                                               |
| **روابط**    | Campaign, Content, Brand Rule                   |
| **مالک**     | استراتژیست محتوا                                |
| **SSOT**     | PERSONA-\* (جدید)                               |
| **وضعیت‌ها** | draft → validated → active → updated → archived |

### OBJ-012: Audience (مخاطب)

| فیلد         | مقدار                                  |
| ------------ | -------------------------------------- |
| **هدف**      | گروه‌بندی مخاطبان هدف                  |
| **والد**     | Account                                |
| **فرزندان**  | Persona                                |
| **روابط**    | Platform, Campaign, Metric             |
| **مالک**     | تحلیل‌گر                               |
| **SSOT**     | AUD-\* (جدید)                          |
| **وضعیت‌ها** | defined → segmented → active → refined |

### OBJ-013: Brand Rule (قاعده برند)

| فیلد         | مقدار                                             |
| ------------ | ------------------------------------------------- |
| **هدف**      | محدودیت و راهنمای هویت برند                       |
| **والد**     | Brand                                             |
| **فرزندان**  | —                                                 |
| **روابط**    | Content, Asset, Caption, Prompt                   |
| **مالک**     | مدیر برند                                         |
| **SSOT**     | [BRD-\*](../22-BRAND/)                            |
| **وضعیت‌ها** | draft → reviewed → approved → active → deprecated |

### OBJ-014: Workflow (گردش کار)

| فیلد         | مقدار                                                         |
| ------------ | ------------------------------------------------------------- |
| **هدف**      | اتوماسیون یک فرایند مشخص                                      |
| **والد**     | Automation System                                             |
| **فرزندان**  | Workflow Step, Trigger                                        |
| **روابط**    | Agent, n8n, MCP, API                                          |
| **مالک**     | مهندس اتوماسیون                                               |
| **SSOT**     | [AUT-\*](../30-AUTOMATION/)                                   |
| **وضعیت‌ها** | design → development → testing → active → paused → deprecated |

### OBJ-015: Agent (عامل هوشمند)

| فیلد         | مقدار                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| **هدف**      | یک عامل AI با وظایف مشخص                                                  |
| **والد**     | Agent System                                                              |
| **فرزندان**  | Agent Instance, Agent Task                                                |
| **روابط**    | Prompt, Workflow, Knowledge Object                                        |
| **مالک**     | مهندس AI                                                                  |
| **SSOT**     | [AI-\*](../40-AI-AGENTS/)                                                 |
| **وضعیت‌ها** | defined → developed → tested → active → monitoring → updated → deprecated |

### OBJ-016: Knowledge Object (شیء دانش)

| فیلد         | مقدار                                                     |
| ------------ | --------------------------------------------------------- |
| **هدف**      | واحد پایه دانش در پایگاه دانش                             |
| **والد**     | Knowledge Domain                                          |
| **فرزندان**  | Knowledge Version                                         |
| **روابط**    | Agent, Content, Metric, Report                            |
| **مالک**     | معمار دانش                                                |
| **SSOT**     | [KNW-\*](../45-KNOWLEDGE/)                                |
| **وضعیت‌ها** | draft → reviewed → approved → active → updated → archived |

### OBJ-017: Metric (متریک)

| فیلد         | مقدار                                       |
| ------------ | ------------------------------------------- |
| **هدف**      | یک شاخص قابل اندازه‌گیری                    |
| **والد**     | KPI Framework                               |
| **فرزندان**  | Metric Instance, Dimension                  |
| **روابط**    | KPI, Dashboard, Report, Alert               |
| **مالک**     | تحلیل‌گر                                    |
| **SSOT**     | [MET-\*](../60-METRICS/)                    |
| **وضعیت‌ها** | defined → implemented → active → deprecated |

### OBJ-018: Report (گزارش)

| فیلد         | مقدار                                       |
| ------------ | ------------------------------------------- |
| **هدف**      | مجموعه‌ای ساختاریافته از متریک‌ها و تحلیلها |
| **والد**     | (گزارش‌ها)                                  |
| **فرزندان**  | Report Section, Chart                       |
| **روابط**    | Metric, Dashboard, Audience, Schedule       |
| **مالک**     | تحلیل‌گر                                    |
| **SSOT**     | [REP-\*](../55-REPORTS/)                    |
| **وضعیت‌ها** | drafted → reviewed → published → archived   |

### OBJ-019: Task (وظیفه)

| فیلد         | مقدار                                                       |
| ------------ | ----------------------------------------------------------- |
| **هدف**      | واحد کار قابل انتساب                                        |
| **والد**     | Workflow یا Campaign                                        |
| **فرزندان**  | Subtask                                                     |
| **روابط**    | Assignee (human/agent), Deadline, Status                    |
| **مالک**     | مدیر پروژه                                                  |
| **SSOT**     | Task سیستم (ابزاری)                                         |
| **وضعیت‌ها** | todo → in_progress → in_review → done → blocked → cancelled |

### OBJ-020: Approval (تأیید)

| فیلد         | مقدار                                             |
| ------------ | ------------------------------------------------- |
| **هدف**      | ثبت تصمیم تأیید یا رد                             |
| **والد**     | Content Piece یا شیء قابل تأیید                   |
| **فرزندان**  | —                                                 |
| **روابط**    | Approver (human), Reviewer (agent), Feedback      |
| **مالک**     | تأییدکننده                                        |
| **SSOT**     | Approval سیستم (ابزاری)                           |
| **وضعیت‌ها** | pending → approved → rejected → changes_requested |

### OBJ-021: Feedback (بازخورد)

| فیلد         | مقدار                                        |
| ------------ | -------------------------------------------- |
| **هدف**      | نظر اصلاحی یا تکمیلی                         |
| **والد**     | Content Piece یا Workflow                    |
| **فرزندان**  | —                                            |
| **روابط**    | Author, Reviewer, Resolution                 |
| **مالک**     | ارائه‌دهنده بازخورد                          |
| **SSOT**     | Feedback سیستم (ابزاری)                      |
| **وضعیت‌ها** | submitted → acknowledged → resolved → closed |

### OBJ-022: Publication (انتشار)

| فیلد         | مقدار                                                  |
| ------------ | ------------------------------------------------------ |
| **هدف**      | ثبت یک رویداد انتشار                                   |
| **والد**     | Content Variant                                        |
| **فرزندان**  | —                                                      |
| **روابط**    | Platform, Account, Timestamp, Metric                   |
| **مالک**     | سیستم                                                  |
| **SSOT**     | Publication سیستم (ابزاری)                             |
| **وضعیت‌ها** | scheduled → publishing → published → failed → retrying |

---

## ۵. ماتریس روابط اشیاء

| شیء              | والد              | فرزندان                 | وابسته به مستند |
| ---------------- | ----------------- | ----------------------- | --------------- |
| Campaign         | Mission           | Pillar                  | CAM-\*          |
| Content Pillar   | Campaign          | Series                  | PILLAR-\*       |
| Content Series   | Pillar            | Piece                   | SERIES-\*       |
| Content Piece    | Series            | Platform Version, Asset | CONT-\*         |
| Platform Version | Piece             | Variant                 | CONT-\*         |
| Content Variant  | Version           | Publication             | CONT-\*         |
| Asset            | Piece             | Asset Version           | AST-\*          |
| Caption          | Platform Version  | —                       | CONT-\*         |
| Prompt           | —                 | Prompt Version          | PRM-\*          |
| Platform         | Enterprise        | Account                 | PLAT-\*         |
| Persona          | Audience          | —                       | PERSONA-\*      |
| Audience         | Account           | Persona                 | AUD-\*          |
| Brand Rule       | Brand             | —                       | BRD-\*          |
| Workflow         | Automation        | Step                    | AUT-\*          |
| Agent            | Agent System      | Task                    | AI-\*           |
| Knowledge Object | Knowledge Domain  | Version                 | KNW-\*          |
| Metric           | KPI Framework     | Instance                | MET-\*          |
| Report           | —                 | Section                 | REP-\*          |
| Task             | Workflow/Campaign | Subtask                 | ابزاری          |
| Approval         | Content Piece     | —                       | ابزاری          |
| Feedback         | Content Piece     | —                       | ابزاری          |
| Publication      | Variant           | —                       | ابزاری          |

---

## ۶. چرخه حیات تخصصی محتوا (Content Lifecycle)

```
Idea (ایده)
  │  [Research Agent]
  ▼
Research (تحقیق)
  │  [Human Review]
  ▼
Validation (اعتبارسنجی)
  │  [Planning Agent]
  ▼
Planning (برنامه‌ریزی)
  │  [Writing Agent]
  ▼
Writing (نویسندگی)
  │  [Review Agent + Fact Check Agent]
  ▼
Review (بازبینی)
  │  [Human Approval]
  ▼
Approval (تأیید)
  │  [Graphic Agent + Video Agent]
  ▼
Production (تولید نهایی)
  │  [Publishing Agent]
  ▼
Publishing (انتشار)
  │  [n8n Workflow]
  ▼
Distribution (توزیع)
  │  [Monitoring Agent]
  ▼
Monitoring (نظارت)
  │  [Analytics Agent]
  ▼
Analytics (تحلیل)
  │  [Knowledge Agent]
  ▼
Knowledge Extraction (استخراج دانش)
  │  [Improvement Agent]
  ▼
Continuous Improvement (بهبود مستمر)
  │
  └──→ Archive (بایگانی)
```

هر مرحله از چرخه حیات محتوا توسط یک Agent مشخص هدایت می‌شود. جزئیات در [ARCH-013](./13-ai-operating-model.md).
