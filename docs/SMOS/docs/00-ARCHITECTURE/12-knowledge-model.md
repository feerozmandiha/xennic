# Knowledge Model — مدل دانش SMOS

> **شناسه:** ARCH-012
> **وضعیت:** منتشرشده
> **نسخه:** 1.0.0
> **به‌روزرسانی:** 2026-06-26
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** [ARCH-010](./10-meta-architecture.md), [ARCH-011](./11-object-model.md)
> **مخاطب:** human, agent, n8n, mcp

---

## ۱. معرفی

این سند **مدل دانش** SMOS را تعریف می‌کند: چگونگی جریان، ذخیره، بازیابی و بهبود دانش در سراسر سیستم.

## ۲. اصول مدل دانش

1. **هر عملیات دانش تولید می‌کند** — هیچ فعالیتی بدون خروجی دانش نیست
2. **هر دانش یک SSOT دارد** — هیچ دانشی در دو جا تعریف نمی‌شود
3. **دانش در ۵ مخزن ذخیره می‌شود** — مستندات، پرامپت‌ها، پایگاه دانش، گزارش‌ها، دانش Agent
4. **دانش قابل جستجو است** — همه مخازن توسط humans و Agents قابل پرس‌وجو هستند
5. **دانش چرخه حیات دارد** — ایجاد، تأیید، به‌روزرسانی، منسوخ شدن

---

## ۳. مخازن دانش (Knowledge Repositories)

SMOS از ۵ مخزن دانش استفاده می‌کند:

| مخزن            | محتوا                         | فرمت              | مصرف‌کننده          | SSOT          |
| --------------- | ----------------------------- | ----------------- | ------------------- | ------------- |
| **مستندات**     | قوانین، استانداردها، راهنماها | Markdown          | انسان + Agent       | docs/         |
| **پرامپت‌ها**   | دستورالعمل‌های Agent          | Markdown + YAML   | Agent               | PRM-\*        |
| **پایگاه دانش** | درس‌آموخته‌ها، الگوها، FAQs   | Markdown + ساختار | انسان + Agent + RAG | KNW-\*        |
| **گزارش‌ها**    | متریک‌ها، تحلیلها، روندها     | Markdown + JSON   | انسان + Agent       | REP-\*        |
| **دانش Agent**  | حافظه و تجربه Agentها         | Vector DB         | Agent               | Agent Runtime |

### نمودار مخازن دانش

```
                    ┌──────────────────┐
                    │   Documentation  │  ← SSOT برای قواعد
                    │   (docs/)        │
                    └────────┬─────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│                   Prompt Library                    │  ← SSOT برای دستورات Agent
│                   (PRM-*)                           │
└─────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│                   Knowledge Base                    │  ← SSOT برای دانش تجربی
│                   (KNW-*)                           │
└─────────────────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌──────────────────────┐     ┌──────────────────────┐
│     Reports (REP-*)  │     │  Agent Knowledge     │
│     دانش تحلیلی      │     │  (Vector DB)         │
│                      │     │  دانش عملیاتی       │
└──────────────────────┘     └──────────────────────┘
```

---

## ۴. جریان اطلاعات (Information Flow)

```
VISION LAYER
  │  [CON-000, ARCH-002]  ← اهداف و چشم‌انداز
  ▼
GOVERNANCE LAYER
  │  [GOV-*, BRD-*, EDT-*]  ← قوانین و استانداردها
  ▼
KNOWLEDGE LAYER
  │  [KNW-*, ARCH-003]  ← دانش پایه و الگوها
  ▼
PLANNING LAYER
  │  [PLAT-*, CAM-*]  ← برنامه و استراتژی
  ▼
CONTENT LAYER
  │  [AI Agents, PRM-*, Humans]  ← تولید محتوا
  ▼
EXECUTION LAYER
  │  [n8n, AUT-*]  ← آماده‌سازی و صف
  ▼
DISTRIBUTION LAYER
  │  [Platform APIs, MCP]  ← انتشار
  ▼
ANALYTICS LAYER
  │  [MET-*, Analytics Agent]  ← داده و تحلیل
  ▼
LEARNING LAYER
  │  [Knowledge Agent, Improvement Agent]  ← استخراج دانش
  │
  └─────────────── بازخورد به لایه‌های بالاتر ───────────────┐
                                                              │
  ┌───────────────────────────────────────────────────────────┘
  ▼
ARCHIVE LAYER
     [ARC-*]  ← نگهداری بلندمدت
```

### کانال‌های جریان اطلاعات

| مسیر                     | جهت     | پروتکل      | تأخیر   |
| ------------------------ | ------- | ----------- | ------- |
| Vision → Governance      | یک‌طرفه | مستندات     | روز     |
| Governance → Knowledge   | یک‌طرفه | مستندات     | روز     |
| Knowledge → Planning     | دوطرفه  | API/فایل    | ساعت    |
| Planning → Content       | یک‌طرفه | Task Queue  | لحظه‌ای |
| Content → Execution      | یک‌طرفه | n8n         | لحظه‌ای |
| Execution → Distribution | یک‌طرفه | API         | لحظه‌ای |
| Distribution → Analytics | یک‌طرفه | Webhook/API | دقیقه   |
| Analytics → Learning     | دوطرفه  | Vector DB   | ساعت    |
| Learning → Knowledge     | دوطرفه  | مستندات/API | روز     |
| Learning → Prompts       | یک‌طرفه | API         | روز     |
| Learning → All Layers    | بازخورد | متغیر       | متغیر   |

---

## ۵. حلقه بازخورد (Feedback Loop)

```
                    ┌──────────────┐
                    │  Analytics   │  ← داده‌های خام از پلتفرم‌ها
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Analysis   │  ← Analytics Agent
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Campaign │ │  Prompts │ │   KNW    │
       │  Goals   │ │ Improve  │ │  Update  │
       └──────────┘ └──────────┘ └──────────┘
              │            │            │
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Content  │ │  Agents  │ │ Playbooks│
       │ Strategy │ │ Improve  │ │  Update  │
       └──────────┘ └──────────┘ └──────────┘
              │            │            │
              └────────────┼────────────┘
                           ▼
                    ┌──────────────┐
                    │  Next Cycle  │  ← بهبود یافته
                    └──────────────┘
```

### انواع بازخورد

| نوع                   | مبدأ              | مقصد             | فرکانس | خودکار         |
| --------------------- | ----------------- | ---------------- | ------ | -------------- |
| **تصحیح مسیر کمپین**  | Analytics Agent   | Campaign Manager | روزانه | پیشنهادی       |
| **بهبود پرامپت**      | Analytics Agent   | Prompt Library   | هفتگی  | خودکار + تأیید |
| **به‌روزرسانی دانش**  | Knowledge Agent   | KNW-\*           | هفتگی  | خودکار + تأیید |
| **بهبود Agent**       | Improvement Agent | AI-\*            | ماهانه | نیاز به تأیید  |
| **بهبود استاندارد**   | Human Analyst     | GOV-\*           | فصلی   | انسانی         |
| **بهبود قانون اساسی** | Board             | CON-000          | سالانه | انسانی         |

---

## ۶. گراف دانش (Knowledge Graph)

### گره‌ها (Nodes)

| گره              | نوع        | SSOT       |
| ---------------- | ---------- | ---------- |
| Business Vision  | Conceptual | CON-000    |
| Brand            | Entity     | BRD-\*     |
| Platform         | Entity     | PLAT-\*    |
| Account          | Entity     | PLAT-\*    |
| Audience         | Entity     | AUD-\*     |
| Persona          | Entity     | PERSONA-\* |
| Campaign         | Entity     | CAM-\*     |
| Content Pillar   | Entity     | PILLAR-\*  |
| Content Series   | Entity     | SERIES-\*  |
| Content Piece    | Entity     | CONT-\*    |
| Asset            | Entity     | AST-\*     |
| Prompt           | Knowledge  | PRM-\*     |
| Agent            | Entity     | AI-\*      |
| Workflow         | Entity     | AUT-\*     |
| Knowledge Object | Knowledge  | KNW-\*     |
| Metric           | Knowledge  | MET-\*     |
| Report           | Knowledge  | REP-\*     |
| KPI              | Knowledge  | MET-\*     |
| Brand Rule       | Rule       | BRD-\*     |
| Editorial Rule   | Rule       | EDT-\*     |
| Task             | Entity     | ابزاری     |
| Publication      | Event      | ابزاری     |

### روابط (Relationships)

| مبدأ             | رابطه          | مقصد             | توضیح                                |
| ---------------- | -------------- | ---------------- | ------------------------------------ |
| Vision           | `drives`       | Objective        | چشم‌انداز اهداف را هدایت می‌کند      |
| Objective        | `measured_by`  | KPI              | هدف با KPI اندازه‌گیری می‌شود        |
| Campaign         | `targets`      | Audience         | کمپین مخاطب را هدف می‌گیرد           |
| Campaign         | `uses`         | Platform         | کمپین از پلتفرم استفاده می‌کند       |
| Campaign         | `contains`     | Content Pillar   | کمپین شامل ستون محتواست              |
| Content Pillar   | `has`          | Content Series   | ستون شامل سری است                    |
| Content Series   | `has`          | Content Piece    | سری شامل قطعه است                    |
| Content Piece    | `adapted_for`  | Platform         | محتوا برای پلتفرم بومی‌سازی می‌شود   |
| Content Piece    | `uses`         | Asset            | محتوا از دارایی استفاده می‌کند       |
| Content Piece    | `generated_by` | Agent            | محتوا توسط Agent تولید شده           |
| Content Piece    | `approved_by`  | Human            | محتوا توسط انسان تأیید شده           |
| Platform Version | `published_on` | Account          | نسخه در حساب منتشر می‌شود            |
| Publication      | `produces`     | Metric           | انتشار متریک تولید می‌کند            |
| Metric           | `feeds`        | Report           | متریک به گزارش تغذیه می‌کند          |
| Report           | `updates`      | Knowledge Object | گزارش دانش را به‌روز می‌کند          |
| Knowledge Object | `improves`     | Prompt           | دانش پرامپت را بهبود می‌بخشد         |
| Prompt           | `guides`       | Agent            | پرامپت Agent را هدایت می‌کند         |
| Agent            | `executes`     | Workflow         | Agent گردش کار را اجرا می‌کند        |
| Workflow         | `triggers`     | Publication      | گردش کار انتشار را فعال می‌کند       |
| Brand Rule       | `constrains`   | Content          | قاعده برند محتوا را محدود می‌کند     |
| Editorial Rule   | `guides`       | Caption          | قاعده تحریریه کپشن را هدایت می‌کند   |
| Persona          | `represents`   | Audience Segment | پرسونا نماینده بخش مخاطب است         |
| Approval         | `decides`      | Content          | تأیید سرنوشت محتوا را تعیین می‌کند   |
| Feedback         | `improves`     | Content          | بازخورد محتوا را بهبود می‌بخشد       |
| Learning         | `updates`      | Constitution     | یادگیری قانون اساسی را به‌روز می‌کند |

### گراف ترسیم شده (سطح بالا)

```
                ┌──────────┐
                │  Vision  │
                └────┬─────┘
                     │ drives
                     ▼
              ┌──────────────┐
         ┌─── │  Objectives   │ ◄──── measured_by ──── KPI
         │    └──────┬───────┘
         │           │ targets
         │           ▼
         │    ┌──────────────┐
         │    │  Campaign     │ ──── uses ────► Platform
         │    └──────┬───────┘
         │           │ contains
         │           ▼
         │    ┌──────────────┐         ┌──────────────┐
         │    │ Content Pillar│ ───►   │  Brand Rule  │ ◄── constrains
         │    └──────┬───────┘         └──────────────┘
         │           │ has
         │           ▼
         │    ┌──────────────┐         ┌──────────────┐
         │    │ Content Series│ ───►   │ Editorial Rule│ ◄── guides
         │    └──────┬───────┘         └──────────────┘
         │           │ has
         │           ▼
         │    ┌──────────────┐
         │    │ Content Piece │ ──── uses ────► Asset
         │    └──────┬───────┘ ──── generated_by ──► Agent
         │           │ adapted_for                 │
         │           ▼                             │ guides
         │    ┌──────────────┐                     │
         │    │Platform Ver. │ ◄─── Prompt ────────┘
         │    └──────┬───────┘
         │           │ published_on
         │           ▼
         │    ┌──────────────┐
         │    │ Publication   │ ──── produces ────► Metric
         │    └──────────────┘                     │
         │                                        │ feeds
         │                                        ▼
         │                                 ┌──────────────┐
         │                                 │   Report      │
         │                                 └──────┬───────┘
         │                                        │ updates
         │                                        ▼
         │                                 ┌──────────────┐
         └──────────────────────────────── │ Knowledge Obj │
                                           └──────┬───────┘
                                                  │ improves
                                                  ▼
                                           ┌──────────────┐
                                           │   Prompt      │ ──── guides ────► Agent
                                           └──────────────┘
```

---

## ۷. قواعد حاکمیت دانش

| قاعده    | توضیح                                                     |
| -------- | --------------------------------------------------------- |
| **K-01** | هر دانش یک منبع حقیقت واحد دارد                           |
| **K-02** | دانش منسوخ باید به‌روز یا بایگانی شود                     |
| **K-03** | دانش تأییدنشده نباید در دسترس Agentها باشد                |
| **K-04** | هر دانش باید دارای فراداده کامل باشد (شناسه، مالک، تاریخ) |
| **K-05** | دانش باید قابل ارجاع (Referenceable) باشد                 |
| **K-06** | دانش باید قابل جستجو (Searchable) باشد                    |
| **K-07** | بازخورد تحلیلی باید ظرف ۷ روز به دانش تبدیل شود           |
| **K-08** | Agentها باید منبع دانش خود را اعلام کنند                  |
