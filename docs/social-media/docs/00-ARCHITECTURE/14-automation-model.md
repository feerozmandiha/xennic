# Automation Model — مدل خودکارسازی SMOS

> **شناسه:** ARCH-014
> **وضعیت:** منتشرشده
> **نسخه:** 1.0.0
> **به‌روزرسانی:** 2026-06-26
> **مسئول:** معمار سیستم
> **وابستگی:** [ARCH-010](./10-meta-architecture.md), [ARCH-013](./13-ai-operating-model.md)
> **مخاطب:** human, agent, n8n, mcp

---

## ۱. معرفی

این سند **مدل خودکارسازی** SMOS را تعریف می‌کند: چگونگی ارتباط n8n، MCP، APIها، زمان‌بندها، محرک‌ها، تأییدها و اعلان‌ها.

## ۲. اصول خودکارسازی

1. **خودکارسازی پیش‌فرض** — هر فرایند خودکار است مگر اینکه صریحاً استثنا شود
2. **انسان در حلقه بحرانی** — تصمیمات تأیید نهایی همیشه انسانی
3. **قابلیت ردیابی** — هر اقدام خودکار قابل ردیابی و حسابرسی است
4. **جدا از Agentها** — Automation زیرساخت اجراست، Agentها لایه هوش
5. **خطاهای مشخص** — هر workflow رفتار خطا (error handling) مشخص دارد
6. **قابلیت مکث** — هر workflow می‌تواند متوقف، از سر گرفته یا لغو شود

---

## ۳. معماری خودکارسازی

```
                    ┌──────────────────────────────┐
                    │        Trigger Layer         │
                    │  (زمان‌بندی، رویداد، API Call) │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │     Orchestration Layer      │
                    │  (n8n - مدیریت گردش کارها)     │
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│    Execution Layer   │ │   MCP Servers    │ │   API Gateway    │
│  (workflow instances)│ │ (Context Protocol)│ │ (REST/GraphQL)   │
└──────────────────────┘ └──────────────────┘ └──────────────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │     Integration Layer        │
                    │  (Platform APIs, Databases,  │
                    │   External Services)         │
                    └──────────────────────────────┘
```

---

## ۴. لایه‌های خودکارسازی

### ۴.۱ Trigger Layer (لایه محرک)

| نوع محرک           | توضیح                 | مثال                        |
| ------------------ | --------------------- | --------------------------- |
| **Schedule**       | اجرای برنامه‌ریزی‌شده | انتشار روزانه در اینستاگرام |
| **Event**          | واکنش به رویداد       | انتشار خودکار پس از تأیید   |
| **Webhook**        | فراخوانی خارجی        | دریافت داده از API پلتفرم   |
| **Human Action**   | اقدام انسانی          | تأیید یک قطعه محتوا         |
| **Agent Decision** | تصمیم Agent           | درخواست تولید محتوا         |
| **Alert**          | هشدار از سیستم نظارت  | افت ناگهانی تعامل           |

### ۴.۲ Orchestration Layer (لایه هماهنگ‌کننده) — n8n

| قابلیت              | توضیح                              |
| ------------------- | ---------------------------------- |
| **Workflow Engine** | اجرای گردش کارهای پیچیده           |
| **Branching**       | مسیرهای شرطی                       |
| **Error Handling**  | رفتار در خطا (retry, fail, notify) |
| **Human Approval**  | گره‌های تأیید انسانی               |
| **Sub-workflow**    | گردش کارهای تو در تو               |
| **Logging**         | ثبت تمام اقدامات                   |

### ۴.۳ MCP Layer (Model Context Protocol)

| قابلیت                | توضیح                             |
| --------------------- | --------------------------------- |
| **Context Provision** | ارائه context به Agentها و مدل‌ها |
| **Resource Access**   | دسترسی به مستندات، KNW، MET       |
| **Tool Execution**    | اجرای ابزارها توسط Agentها        |
| **Prompt Templates**  | قالب‌های پرامپت از PRM-\*         |

### ۴.۴ Integration Layer (لایه یکپارچه‌سازی)

| سرویس               | پروتکل    | هدف                   |
| ------------------- | --------- | --------------------- |
| Instagram Graph API | REST      | انتشار و دریافت متریک |
| LinkedIn API        | REST      | انتشار و تحلیل        |
| Telegram Bot API    | REST      | انتشار و تعامل        |
| Twitter/X API       | REST      | انتشار و نظارت        |
| YouTube Data API    | REST      | انتشار و تحلیل        |
| Internal DB         | SQL/NoSQL | ذخیره‌سازی داده‌ها    |
| Vector DB           | API       | جستجوی معنایی         |

---

## ۵. گردش کارهای اصلی (Core Workflows)

### WF-01: Content Pipeline (خط لوله محتوا)

```
[Schedule Trigger]
      │
      ▼
[Planning Agent]  ← تولید برنامه هفتگی
      │
      ▼
[Writing Agent]  ← تولید محتوای متنی
      │
      ▼
[Review Agent + Fact Check Agent]  ← بازبینی همزمان
      │
      ▼
[Human Approval Node]  ← تأیید نهایی (n8n)
      │
      ├── Approved ──► [Production] ──► [Publishing Queue]
      │
      └── Rejected ──► [Writing Agent] ──► بازبینی مجدد
```

### WF-02: Monitoring & Alerts (نظارت و هشدار)

```
[Platform API Polling]
      │
      ▼
[Analytics Agent]  ← تحلیل داده‌های دریافتی
      │
      ├── Normal ──► [Log to Database]
      │
      └── Anomaly ──► [Alert Trigger]
                       │
                       ▼
              [Human Notification]  ← ایمیل/تلگرام/اسلک
                       │
                       ▼
              [Improvement Agent]  ← تحلیل علت
```

### WF-03: Report Generation (تولید گزارش)

```
[Weekly Schedule]
      │
      ▼
[Data Aggregation]  ← جمع‌آوری داده از همه پلتفرم‌ها
      │
      ▼
[Analytics Agent]  ← تحلیل و تولید بینش
      │
      ▼
[Report Compilation]  ← تولید گزارش ساختاریافته
      │
      ▼
[Human Review]  ← بررسی نهایی
      │
      ▼
[Distribution]  ← ارسال به ذی‌نفعان
```

### WF-04: Knowledge Extraction (استخراج دانش)

```
[Analytics Agent Output]
      │
      ▼
[Knowledge Agent]  ← شناسایی الگوها و درس‌آموخته‌ها
      │
      ▼
[Human Review]  ← تأیید دانش جدید
      │
      ├── Approved ──► [Update KNW-*]
      │
      └── Rejected ──► [Discard / Revise]
```

---

## ۶. ماتریس Trigger → Workflow → Agent

| Trigger           | Workflow             | Agent           | خروجی           |
| ----------------- | -------------------- | --------------- | --------------- |
| Schedule (daily)  | Content Pipeline     | Writing, Review | محتوای جدید     |
| Approval Event    | Publish              | Publishing      | محتوای منتشرشده |
| Platform Webhook  | Monitor              | Monitoring      | داده خام        |
| Data Threshold    | Alert                | Analytics       | هشدار           |
| Schedule (weekly) | Report               | Analytics       | گزارش هفتگی     |
| Analytics Output  | Knowledge Extraction | Knowledge       | دانش جدید       |
| Human Request     | Arbitrary            | Orchestrator    | تخصیص وظیفه     |

---

## ۷. قواعد خودکارسازی

| قاعده      | توضیح                                                |
| ---------- | ---------------------------------------------------- |
| **AUT-01** | هر workflow باید خطایابی (error handling) داشته باشد |
| **AUT-02** | هر workflow باید لاگ کامل ثبت کند                    |
| **AUT-03** | workflowهای بحرانی نیاز به تأیید انسانی دارند        |
| **AUT-04** | rate limiting باید رعایت شود (API limits)            |
| **AUT-05** | credentials در متغیرهای امن n8n ذخیره شوند           |
| **AUT-06** | workflowها باید idempotent باشند (قابلیت اجرای مجدد) |
| **AUT-07** | نسخه پشتیبان workflowها نگهداری شود                  |

---

## ۸. رابطه با Agentها

```
┌─────────────────────────────────────────────────────┐
│                   Agent Layer                       │
│  (هوش و تصمیم‌گیری)                                 │
│  Orchestrator, Research, Writing, Review, ...      │
└──────────────────────────┬──────────────────────────┘
                           │ دستور/درخواست
                           ▼
┌─────────────────────────────────────────────────────┐
│                Automation Layer                      │
│  (اجرا و هماهنگی)                                   │
│  n8n, MCP, APIs, Schedulers, Triggers, Notifications│
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              Integration Layer                       │
│  (اتصال به جهان خارج)                                │
│  Platform APIs, Databases, External Services        │
└─────────────────────────────────────────────────────┘
```

Agentها **تصمیم می‌گیرند** و Automation **اجرا می‌کند**.
