# Enterprise Knowledge Architecture — معماری دانش سازمانی SMOS

> **شناسه:** KNW-000
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-29
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** [CON-000](../05-CONSTITUTION/00-constitution.md), [AI-000](../40-AI-AGENTS/00-enterprise-ai-agent-architecture.md), [AUT-000](../50-AUTOMATION/00-enterprise-automation-architecture.md), [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [DEPLOY-001](../15-DEPLOY/00-deployment-strategy.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-management-model.md), [ARCH-003](../00-ARCHITECTURE/03-canonical-vocabulary.md)
> **مخاطب:** human, ai-agent, knowledge-engineer, system-architect

---

## ۱. Purpose

KNW-000 معماری مادر دانش سازمانی SMOS را تعریف می‌کند. این سند به عنوان **تک منبع حقیقت (SSOT)** برای تمام اسناد پایگاه دانش (KNW-NNN) عمل می‌کند.

### چرا KNW-000 وجود دارد

بدون یک معماری دانش سازمانی:

- هر KNW-\* ساختار متفاوتی خواهد داشت
- موجودیت‌های دانش تکراری یا متناقض ایجاد می‌شوند
- روابط بین دانش‌ها غیرقابل ردیابی است
- اعتبارسنجی و کیفیت دانش نامشخص می‌ماند
- تکامل دانش در طول زمان غیرممکن است
- حکمرانی دانش غیرقابل اجرا است

KNW-000 این مشکلات را با تعریف یک **چارچوب دانش سازمانی** حل می‌کند که همه KNW-NNNها از آن پیروی می‌کنند.

### نقش KNW-000 در SMOS

| سند         | نقش در SMOS                           |
| ----------- | ------------------------------------- |
| CON-000     | قانون اساسی — اصول عالی و حاکمیت      |
| AI-000      | معماری عامل‌های هوشمند — SSOT Agentها |
| AUT-000     | معماری خودکارسازی — SSOT Workflowها   |
| PRM-000     | معماری پرامپت — SSOT پرامپت‌ها        |
| **KNW-000** | **معماری دانش — SSOT پایگاه دانش**    |
| DEPLOY-001  | استراتژی استقرار — SSOT استقرار       |

---

## ۲. Scope

### Inside Scope

| حوزه                       | توضیح                  |
| -------------------------- | ---------------------- |
| معماری دانش سازمانی        | اصول، چارچوب، مدل‌ها   |
| چرخه حیات دانش             | تولید تا بازیابی       |
| طبقه‌بندی و تاکسونومی دانش | انواع، سطوح، دسته‌بندی |
| مدل شیء دانش               | ساختار و روابط         |
| حکمرانی و کیفیت دانش       | قواعد، گیت‌ها، مالکیت  |
| Registry و نمایه دانش      | ثبت مرکزی              |
| تکامل و فدراسیون دانش      | رشد و همکاری           |

### Outside Scope

| حوزه                     | دلیل          |
| ------------------------ | ------------- |
| دانش عملیاتی خاص         | حوزه KNW-100+ |
| محتوای مقالات دانش       | حوزه KNW-NNN  |
| پرامپت‌های مرتبط با دانش | حوزه PRM-4xx  |
| پیاده‌سازی AI Agent      | حوزه AI-011   |
| Workflowهای خودکار دانش  | حوزه AUT-NNN  |

---

## ۳. Architecture Principles

| ID    | اصل                                | توضیح                                                         |
| ----- | ---------------------------------- | ------------------------------------------------------------- |
| KP-01 | **دانش به عنوان دارایی استراتژیک** | دانش سازمانی دارایی غیرمادی با ارزش تجاری است                 |
| KP-02 | **تک منبع حقیقت**                  | هر مفهوم دانش یک SSOT دارد                                    |
| KP-03 | **تفکیک معماری از محتوا**          | KNW-000 معماری را تعریف می‌کند — KNW-NNN محتوا را نگه می‌دارد |
| KP-04 | **چرخه حیات کامل**                 | دانش از ایجاد تا بازیابی چرخه حیات دارد                       |
| KP-05 | **اعتبارسنجی مستمر**               | هر دانش قبل از ثبت اعتبارسنجی می‌شود                          |
| KP-06 | **قابلیت ردیابی**                  | هر دانش دارای منشأ، مالک و تاریخچه است                        |
| KP-07 | **تکامل تدریجی**                   | دانش در طول زمان تکامل می‌یابد — نه یکباره                    |
| KP-08 | **فدراسیون نه یکپارچگی**           | دانش‌ها می‌توانند مستقل اما هماهنگ باشند                      |
| KP-09 | **خنثی بودن**                      | معماری دانش مستقل از فروشنده، پلتفرم و LLM است                |
| KP-10 | **مقیاسپذیری سازمانی**             | معماری برای هزاران دانش در ده‌ها حوزه طراحی شده است           |

---

## ۴. Knowledge Philosophy

### فلسفه دانش SMOS

SMOS دانش سازمانی را به عنوان یک **اکوسیستم زنده** می‌بیند که:

1. **زاینده است** — دانش جدید از عملیات روزانه متولد می‌شود
2. **تکامل‌یابنده است** — دانش موجود با تجربه بهبود می‌یابد
3. **مرتبط است** — دانش نامرتبط به مرور منجمد و بایگانی می‌شود
4. **قابل بازیابی است** — دانش باید در لحظه نیاز قابل دسترسی باشد
5. **قابل اعتماد است** — دانش دارای منشأ، اعتبار و کیفیت مشخص است

### اصول هستی‌شناسی دانش

| اصل                            | توضیح                                                         |
| ------------------------------ | ------------------------------------------------------------- |
| **هر دانش یک موجودیت است**     | Knowledge Asset = OBJ-018                                     |
| **هر دانش یک نوع دارد**        | نوع دانش دامنه، ساختار و کاربرد آن را تعیین می‌کند            |
| **هر دانش یک سطح اختیار دارد** | سطح اختیار تعیین می‌کند誰 می‌تواند آن را ایجاد/ویرایش/حذف کند |
| **هر دانش یک وضعیت دارد**      | وضعیت چرخه حیات دانش را نشان می‌دهد                           |
| **هر دانش روابط دارد**         | دانش‌ها از طریق روابط معنایی به هم متصل هستند                 |

---

## ۵. Knowledge Lifecycle

### چرخه حیات دانش

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Capture  │────▶│ Validate │────▶│ Register │────▶│ Maintain │────▶│ Retrieve │
│ (ضبط)    │     │ (اعتبار) │     │ (ثبت)    │     │ (نگهداری)│     │ (بازیابی)│
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │               │               │               │
     ▼                ▼               ▼               ▼               ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Extract  │     │ Normalize│     │ Index    │     │ Evolve   │     │ Consume  │
│ (استخراج)│     │ (نرمال)  │     │ (نمایه)  │     │ (تکامل)  │     │ (مصرف)   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### مراحل چرخه حیات

| مرحله     | شناسه | توضیح                                  | مسئول          |
| --------- | ----- | -------------------------------------- | -------------- |
| Capture   | LC-01 | ضبط دانش از منبع (انسان، Agent، سیستم) | AI-011 / Human |
| Extract   | LC-02 | استخراج ساختاریافته از منبع            | AI-011         |
| Validate  | LC-03 | اعتبارسنجی اولیه دانش                  | AI-004         |
| Normalize | LC-04 | نرمال‌سازی به فرمت استاندارد           | AI-011         |
| Register  | LC-05 | ثبت در پایگاه دانش                     | AI-011         |
| Index     | LC-06 | نمایه‌سازی برای بازیابی                | AI-011         |
| Maintain  | LC-07 | نگهداری و به‌روزرسانی                  | AI-011 / Human |
| Evolve    | LC-08 | تکامل دانش در طول زمان                 | AI-012         |
| Retrieve  | LC-09 | بازیابی برای مصرف                      | AI-011         |
| Consume   | LC-10 | مصرف توسط Agent یا انسان               | همه Agentها    |

---

## ۶. Knowledge Taxonomy

### تاکسونomi دانش SMOS

```
Knowledge (KNW-000)
├── KNW-100+  Business Knowledge     (دانش کسب‌وکار)
│   ├── Market Intelligence
│   ├── Competitive Analysis
│   ├── Industry Research
│   └── Strategic Insights
├── KNW-200+  Engineering Knowledge   (دانش فنی)
│   ├── System Architecture
│   ├── Technical Specifications
│   ├── Design Decisions
│   └── Implementation Patterns
├── KNW-300+  Platform Knowledge      (دانش پلتفرمی)
│   ├── Platform Specifications
│   ├── Content Requirements
│   ├── Audience Profiles
│   └── Platform Trends
├── KNW-400+  Operational Knowledge   (دانش عملیاتی)
│   ├── Standard Operating Procedures
│   ├── Incident Reports
│   ├── Lessons Learned
│   └── Best Practices
├── KNW-500+  AI Knowledge            (دانش هوش مصنوعی)
│   ├── Agent Capabilities
│   ├── Model Knowledge
│   ├── Prompt Knowledge
│   └── Automation Knowledge
├── KNW-600+  Automation Knowledge    (دانش خودکارسازی)
│   ├── Workflow Definitions
│   ├── Integration Patterns
│   ├── Error Handling
│   └── Optimization Knowledge
├── KNW-700+  Brand Knowledge         (دانش برند)
│   ├── Brand Identity
│   ├── Brand Voice
│   ├── Visual Guidelines
│   └── Brand Assets
├── KNW-800+  Reference Knowledge     (دانش مرجع)
│   ├── Industry Standards
│   ├── Regulatory Knowledge
│   ├── Legal Knowledge
│   └── Compliance Knowledge
└── KNW-900+  Archived Knowledge      (دانش بایگانی)
    ├── Historical Knowledge
    ├── Frozen Knowledge
    └── Deprecated Knowledge
```

---

## ۷. Knowledge Classification Model

### ابعاد طبقه‌بندی

| بعد    | مقادیر                                                                                   | توضیح            |
| ------ | ---------------------------------------------------------------------------------------- | ---------------- |
| دامنه  | Business, Engineering, Platform, Operational, AI, Automation, Brand, Reference, Archived | حوزه موضوعی      |
| ساختار | Structured, Semi-Structured, Unstructured                                                | سطح ساختاریافتگی |
| منشأ   | Human, Agent, System, External                                                           | منبع تولید       |
| بلوغ   | Emerging, Maturing, Mature, Frozen                                                       | سطح بلوغ         |
| حساسیت | Public, Internal, Confidential, Restricted                                               | سطح امنیتی       |

### قواعد طبقه‌بندی

| ID     | قاعده                               |
| ------ | ----------------------------------- |
| CLS-01 | هر دانش حداقل به یک دامنه تعلق دارد |
| CLS-02 | هر دانش دارای سطح ساختار مشخص است   |
| CLS-03 | منشأ دانش همیشه ثبت می‌شود          |
| CLS-04 | سطح بلوغ با وضعیت دانش هماهنگ است   |

---

## ۸. Knowledge Object Model

### مدل شیء دانش

```json
{
  "knowledge_object": {
    "id": "KNW-NNN",
    "type": "knowledge",
    "title": "عنوان دانش",
    "domain": "دامنه دانش",
    "classification": {
      "structure": "structured|semi-structured|unstructured",
      "origin": "human|agent|system|external",
      "maturity": "emerging|maturing|mature|frozen",
      "sensitivity": "public|internal|confidential|restricted"
    },
    "lifecycle": {
      "status": "draft|validated|registered|active|deprecated|archived",
      "version": "1.0.0",
      "created": "2026-01-01",
      "updated": "2026-06-29",
      "authority_level": "A-0|A-1|A-2|A-3|A-4"
    },
    "provenance": {
      "source": "شناسه منبع",
      "source_type": "human|agent|system|external",
      "confidence": 0.95,
      "evidence": ["شواهد"],
      "validated_by": "AI-004|Human"
    },
    "content": {
      "summary": "خلاصه",
      "body": "متن اصلی",
      "language": "fa|en",
      "tags": ["برچسب"],
      "references": ["ارجاعات"]
    },
    "relationships": [
      {
        "type": "relationship_type",
        "target": "KNW-NNN",
        "direction": "outbound|inbound|bidirectional",
        "description": "توضیح رابطه"
      }
    ],
    "metadata": {
      "owner": "نقش مالک",
      "steward": "نقف متولی",
      "quality_score": 0.0,
      "last_reviewed": "2026-06-29",
      "expiry": "2027-06-29"
    }
  }
}
```

---

## ۹. Knowledge Types

### انواع دانش SMOS

| نوع          | شناسه | توضیح                   | مثال              |
| ------------ | ----- | ----------------------- | ----------------- |
| Conceptual   | KT-01 | مفاهیم انتزاعی          | معماری سیستم      |
| Procedural   | KT-02 | رویه‌ها و فرآیندها      | SOP انتشار        |
| Declarative  | KT-03 | حقایق و داده‌ها         | مشخصات پلتفرم     |
| Experiential | KT-04 | تجربیات و درس‌آموخته‌ها | گزارش حادثه       |
| Strategic    | KT-05 | دانش استراتژیک          | تحلیل رقبا        |
| Reference    | KT-06 | دانش مرجع               | استاندارد صنعت    |
| Operational  | KT-07 | دانش عملیاتی            | دستورالعمل روزانه |
| Historical   | KT-08 | دانش تاریخی             | گزارش‌های گذشته   |

---

## ۱۰. Knowledge Authority Levels

| سطح | شناسه        | توضیح        | مجوزها                   |
| --- | ------------ | ------------ | ------------------------ |
| A-0 | Public       | دانش عمومی   | مشاهده توسط همه          |
| A-1 | Internal     | دانش داخلی   | مشاهده توسط تیم          |
| A-2 | Restricted   | دانش محدود   | مشاهده توسط نقش‌های خاص  |
| A-3 | Confidential | دانش محرمانه | مشاهده + ایجاد توسط مالک |
| A-4 | Critical     | دانش بحرانی  | محدود به معمار سیستم     |

---

## ۱۱. Knowledge States

### ماشین وضعیت

```
                    ┌────────────┐
                    │   Draft    │
                    └─────┬──────┘
                          │ Validate
                          ▼
                    ┌────────────┐
                    │ Validated  │
                    └─────┬──────┘
                          │ Register
                          ▼
                    ┌────────────┐
                    │ Registered │
                    └─────┬──────┘
                          │ Activate
                          ▼
                    ┌────────────┐
                    │   Active   │
                    └─────┬──────┘
                     ┌────┴────┐
                     │         │
                     ▼         ▼
               ┌────────┐ ┌────────┐
               │Deprec. │ │Frozen  │
               └────┬───┘ └────┬───┘
                    │          │
                    ▼          │
               ┌────────┐      │
               │Archived│◀─────┘
               └────────┘
```

| وضعیت      | شناسه | توضیح                      |
| ---------- | ----- | -------------------------- |
| Draft      | KS-01 | پیش‌نویس — در حال ایجاد    |
| Validated  | KS-02 | اعتبارسنجی‌شده — آماده ثبت |
| Registered | KS-03 | ثبت‌شده — در نمایه         |
| Active     | KS-04 | فعال — قابل مصرف           |
| Deprecated | KS-05 | منسوخ — هنوز موجود         |
| Frozen     | KS-06 | منجمد — تغییر نمی‌کند      |
| Archived   | KS-07 | بایگانی — فقط خواندنی      |

---

## ۱۲. Knowledge Versioning

### قواعد نسخه‌بندی

هر دانش SMOS از نسخه‌بندی Semantic زیر پیروی می‌کند:

```
MAJOR.MINOR.PATCH
```

| بخش   | تغییر              | مثال          |
| ----- | ------------------ | ------------- |
| MAJOR | تغییر محتوای اساسی | 1.0.0 → 2.0.0 |
| MINOR | افزودن محتوای جدید | 1.0.0 → 1.1.0 |
| PATCH | تصحیح خطا          | 1.0.0 → 1.0.1 |

### قواعد

| ID     | قاعده                                    |
| ------ | ---------------------------------------- |
| VER-01 | هر دانش MINOR ≥ 1 در Registry ثبت می‌شود |
| VER-02 | نسخه در Change Log دانش ثبت می‌شود       |
| VER-03 | تغییر MAJOR نیازمند ADR است              |
| VER-04 | تاریخچه نسخه‌ها در دانش نگهداری می‌شود   |

---

## ۱۳. Knowledge Provenance

### منشأ دانش

| فیلد         | توضیح                        | اجباری |
| ------------ | ---------------------------- | ------ |
| source       | شناسه منبع (نفر، Agent، سند) | بله    |
| source_type  | نوع منبع                     | بله    |
| confidence   | سطح اطمینان (۰ تا ۱)         | بله    |
| evidence     | شواهد و مستندات              | خیر    |
| validated_by | اعتبارسنج‌کننده              | بله    |

### قواعد منشأ

| ID     | قاعده                                       |
| ------ | ------------------------------------------- |
| PRO-01 | هر دانش دارای منشأ ثبت‌شده است              |
| PRO-02 | سطح اطمینان کمتر از ۰.۵ نیازمند بازبینی است |
| PRO-03 | منشأ در طول چرخه حیات تغییر نمی‌کند         |

---

## ۱۴. Knowledge Relationships

### انواع روابط

| نوع          | شناسه | توضیح      | مثال                                      |
| ------------ | ----- | ---------- | ----------------------------------------- |
| Depends-On   | KR-01 | وابستگی    | KNW-201 به KNW-101                        |
| Derived-From | KR-02 | مشتق‌شده   | KNW-301 از KNW-201                        |
| Related-To   | KR-03 | مرتبط      | KNW-401 با KNW-501                        |
| Replaces     | KR-04 | جایگزین    | KNW-102 جایگزین KNW-101                   |
| References   | KR-05 | ارجاع      | KNW-801 به استاندارد                      |
| Validates    | KR-06 | اعتبارسنجی | KNW-901 دانش بالادست را اعتبارسنجی می‌کند |
| Extends      | KR-07 | توسعه      | KNW-202 دانش پایه را توسعه می‌دهد         |
| Contradicts  | KR-08 | تناقض      | KNW-301 با KNW-302 تناقض دارد             |

### قواعد روابط

| ID     | قاعده                              |
| ------ | ---------------------------------- |
| REL-01 | روابط غیرچرخه‌ای باشند             |
| REL-02 | هر رابطه دارای نوع و جهت مشخص است  |
| REL-03 | روابط در Registry دانش ثبت می‌شوند |

---

## ۱۵. Knowledge Dependencies

### وابستگی‌های دانش

| ID     | توضیح                                             | شدت   |
| ------ | ------------------------------------------------- | ----- |
| DEP-01 | وابستگی معماری — دانش به معماری سیستم وابسته است  | بالا  |
| DEP-02 | وابستگی محتوایی — دانش به دانش دیگر وابسته است    | متوسط |
| DEP-03 | وابستگی عملیاتی — دانش به رویه عملیاتی وابسته است | پایین |
| DEP-04 | وابستگی ابزاری — دانش به ابزار خاص وابسته است     | متغیر |

### قواعد وابستگی

| ID     | قاعده                                     |
| ------ | ----------------------------------------- |
| DEP-05 | وابستگی‌های دانش در Registry ثبت می‌شوند  |
| DEP-06 | وابستگی غیرقابل رفع، دانش را مسدود می‌کند |

---

## ۱۶. Knowledge Validation

### اعتبارسنجی دانش

| سطح     | شناسه | معیار                     | مسئول  |
| ------- | ----- | ------------------------- | ------ |
| ساختاری | KV-01 | انطباق با مدل شیء         | خودکار |
| اصطلاحی | KV-02 | انطباق با واژه‌نامه       | AI-004 |
| سازگاری | KV-03 | عدم تناقض با دانش موجود   | AI-011 |
| کیفیت   | KV-04 | امتیاز کیفیت ≥ آستانه     | AI-004 |
| تکمیل   | KV-05 | تکمیل تمام فیلدهای اجباری | خودکار |

---

## ۱۷. Knowledge Quality Gates

| گیت   | مکان                   | معیار                        | مسئول  |
| ----- | ---------------------- | ---------------------------- | ------ |
| QG-01 | Draft → Validated      | اعتبارسنجی ساختاری و اصطلاحی | AI-004 |
| QG-02 | Validated → Registered | ثبت در Registry + نمایه‌سازی | AI-011 |
| QG-03 | Registered → Active    | تأیید کیفیت + آمادگی مصرف    | AI-011 |
| QG-04 | Active → Deprecated    | اطلاع مصرف‌کنندگان           | AI-011 |
| QG-05 | Active → Frozen        | تأیید عدم نیاز به تغییر      | AI-011 |
| QG-06 | Deprecated → Archived  | بایگانی نهایی                | AI-011 |

---

## ۱۸. Knowledge Governance

### اصول حکمرانی

| ID     | اصل                   | توضیح                                 |
| ------ | --------------------- | ------------------------------------- |
| GOV-01 | هر دانش یک مالک دارد  | مالک مسئول محتوا و کیفیت است          |
| GOV-02 | هر دانش یک متولی دارد | متولی مسئول فنی و Registry است        |
| GOV-03 | تغییرات ثبت می‌شوند   | همه تغییرات در Change Log ثبت می‌شوند |
| GOV-04 | حسابرسی دوره‌ای       | دانش هر ۶ ماه بازبینی می‌شود          |
| GOV-05 | انطباق با معماری      | همه دانش‌ها تابع KNW-000 هستند        |

### RACI دانش

| نقش                  | ایجاد | ثبت | ویرایش | حذف | مصرف |
| -------------------- | ----- | --- | ------ | --- | ---- |
| معمار دانش (Owner)   | R     | A   | A      | A   | I    |
| متولی دانش (Steward) | A     | R   | R      | R   | I    |
| تولیدکننده دانش      | R     | C   | C      | —   | C    |
| مصرف‌کننده دانش      | C     | —   | —      | —   | R    |
| AI-011               | A     | R   | R      | —   | R    |

---

## ۱۹. Knowledge Ownership

### نقش‌های مالکیت

| نقش             | مسئولیت                      | سطح اختیار |
| --------------- | ---------------------------- | ---------- |
| معمار دانش      | معماری، استانداردها، حکمرانی | A-4        |
| متولی دانش      | Registry، کیفیت، نگهداری     | A-3        |
| تولیدکننده دانش | ایجاد و به‌روزرسانی محتوا    | A-2        |
| مصرف‌کننده دانش | استفاده از دانش در عملیات    | A-1        |

### قواعد مالکیت

| ID     | قاعده                                     |
| ------ | ----------------------------------------- |
| OWN-01 | هر دانش یک مالک مشخص دارد                 |
| OWN-02 | مالک می‌تواند تولیدکننده را تعیین کند     |
| OWN-03 | تغییر مالکیت نیازمند تأیید معمار دانش است |

---

## ۲۰. Knowledge Consumption Model

### مدل مصرف دانش

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Query   │────▶│ Retrieve │────▶│ Validate │────▶│  Apply   │
│ (پرس‌وجو)│     │ (بازیابی) │     │ (اعتبار)  │     │ (اعمال)  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### انواع مصرف

| مصرف‌کننده            | نوع مصرف                  | سطح اختیار |
| --------------------- | ------------------------- | ---------- |
| AI-001 (Strategy)     | پرس‌وجو + بازیابی         | A-3        |
| AI-002 (Planning)     | پرس‌وجو + بازیابی         | A-2        |
| AI-003 (Production)   | پرس‌وجو                   | A-2        |
| AI-004 (Review)       | بازیابی + اعتبارسنجی      | A-3        |
| AI-010 (Analytics)    | پرس‌وجو + تحلیل           | A-3        |
| AI-011 (Knowledge)    | همه                       | A-4        |
| AI-012 (Improvement)  | بازیابی + تحلیل           | A-3        |
| AI-013 (Research)     | پرس‌وجو + تحلیل           | A-3        |
| AI-014 (Orchestrator) | پرس‌وجو                   | A-4        |
| Human                 | همه (محدود به سطح اختیار) | متغیر      |

---

## ۲۱. Knowledge Production Model

### مدل تولید دانش

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Capture  │────▶│ Extract  │────▶│ Structure│────▶│ Validate │────▶│ Register │
│ (ضبط)    │     │ (استخراج)│     │ (ساختار) │     │ (اعتبار)  │     │ (ثبت)    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
     ▲
     │
┌──────────┐
│ Sources  │
│ (منابع)  │
└──────────┘
```

### منابع تولید

| منبع     | نوع    | توضیح                      |
| -------- | ------ | -------------------------- |
| Agent AI | خودکار | تولید توسط Agentهای SMOS   |
| Human    | دستی   | تولید توسط انسان (کارشناس) |
| System   | خودکار | تولید توسط سیستم‌های خارجی |
| External | ترکیبی | منابع خارجی معتبر          |

---

## ۲۲. Knowledge Evolution

### تکامل دانش

| مرحله         | توضیح           | بازه زمانی |
| ------------- | --------------- | ---------- |
| Creation      | ایجاد اولیه     | روز ۰      |
| Review        | بازبینی و بهبود | هفته ۱–۲   |
| Maturation    | بلوغ تدریجی     | ماه ۱–۳    |
| Stabilization | تثبیت           | ماه ۳–۶    |
| Obsolescence  | منسوخ شدن       | سال ۱–۲    |
| Archival      | بایگانی         | سال ۲+     |

### محرک‌های تکامل

| محرک            | توضیح                       |
| --------------- | --------------------------- |
| Experience جدید | درس‌آموخته‌های جدید         |
| تغییر محیط      | تغییر پلتفرم، بازار، فناوری |
| خطا             | کشف خطا در دانش موجود       |
| نیاز جدید       | نیاز مصرف‌کننده جدید        |
| بازبینی دوره‌ای | بازبینی ۶ ماهه              |

---

## ۲۳. Knowledge Federation

### فدراسیون دانش

SMOS از مدل **فدراسیون** برای دانش سازمانی استفاده می‌کند — نه یکپارچگی متمرکز.

| ویژگی                  | توضیح                                     |
| ---------------------- | ----------------------------------------- |
| استقلال حوزه‌ها        | هر حوزه دانش مستقل است                    |
| هماهنگی از طریق معماری | KNW-000 هماهنگی را تضمین می‌کند           |
| Registry مرکزی         | همه دانش‌ها در Registry مرکزی ثبت می‌شوند |
| روابط بین حوزه‌ای      | روابط بین دانش‌های حوزه‌های مختلف         |

### قواعد فدراسیون

| ID     | قاعده                                               |
| ------ | --------------------------------------------------- |
| FED-01 | هر حوزه دانش مجزاست اما از معماری واحد پیروی می‌کند |
| FED-02 | Registry مرکزی نمایه همه دانش‌ها را نگه می‌دارد     |
| FED-03 | روابط بین حوزه‌ای در Registry ثبت می‌شود            |

---

## ۲۴. Knowledge Discovery

### قابلیت کشف دانش

| روش       | توضیح            | مسئول  |
| --------- | ---------------- | ------ |
| Search    | جستجوی متنی      | AI-011 |
| Browse    | مرور ساختاریافته | AI-011 |
| Navigate  | پیمایش روابط     | AI-011 |
| Recommend | پیشنهاد هوشمند   | AI-010 |

### شاخص‌های کشف

| شاخص             | هدف       |
| ---------------- | --------- |
| زمان بازیابی     | < ۱ ثانیه |
| دقت جستجو        | > ۹۵٪     |
| پوشش روابط       | > ۸۰٪     |
| رضایت مصرف‌کننده | > ۹۰٪     |

---

## ۲۵. Knowledge Registry

### معماری Registry

```
KNW-000 (معماری دانش سازمانی)
  │
KNW-001 (نمایه دانش سازمانی — این سند)
  │
  ├── KNW-100+  Business Knowledge
  ├── KNW-200+  Engineering Knowledge
  ├── KNW-300+  Platform Knowledge
  ├── KNW-400+  Operational Knowledge
  ├── KNW-500+  AI Knowledge
  ├── KNW-600+  Automation Knowledge
  ├── KNW-700+  Brand Knowledge
  ├── KNW-800+  Reference Knowledge
  └── KNW-900+  Archived Knowledge
```

### قواعد Registry

| ID     | قاعده                                                |
| ------ | ---------------------------------------------------- |
| REG-01 | همه دانش‌ها در KNW-001 ثبت می‌شوند                   |
| REG-02 | هر دانش یک شناسه یکتا دارد                           |
| REG-03 | شناسه‌های حذف‌شده هرگز به دانش دیگر اختصاص نمی‌یابند |
| REG-04 | وضعیت دانش در Registry وضعیت واقعی را نشان می‌دهد    |

---

## ۲۶. Canonical Naming Rules

### قواعد نام‌گذاری

| ID     | قاعده                    | مثال                                                      |
| ------ | ------------------------ | --------------------------------------------------------- |
| NAM-01 | شناسه: KNW-NNN           | KNW-001                                                   |
| NAM-02 | دامنه: ۳–۴ رقمی          | 100, 200, 300                                             |
| NAM-03 | زیردامنه: ۱ رقمی         | KNW-101, KNW-201                                          |
| NAM-04 | فایل: kebab-case         | enterprise-knowledge-architecture                         |
| NAM-05 | مسیر: docs/70-KNOWLEDGE/ | docs/70-KNOWLEDGE/00-enterprise-knowledge-architecture.md |

### دامنه‌های شناسه

| دامنه       | شناسه           | توضیح           |
| ----------- | --------------- | --------------- |
| معماری      | KNW-000–KNW-009 | اسناد معماری    |
| نمایه       | KNW-001         | نمایه مرکزی     |
| Business    | KNW-100–KNW-199 | دانش کسب‌وکار   |
| Engineering | KNW-200–KNW-299 | دانش فنی        |
| Platform    | KNW-300–KNW-399 | دانش پلتفرمی    |
| Operational | KNW-400–KNW-499 | دانش عملیاتی    |
| AI          | KNW-500–KNW-599 | دانش هوش مصنوعی |
| Automation  | KNW-600–KNW-699 | دانش خودکارسازی |
| Brand       | KNW-700–KNW-799 | دانش برند       |
| Reference   | KNW-800–KNW-899 | دانش مرجع       |
| Archived    | KNW-900–KNW-999 | دانش بایگانی    |

---

## ۲۷. Machine Readable Model

### Block 1 — Identity

```json
{
  "id": "KNW-000",
  "name_fa": "معماری دانش سازمانی SMOS",
  "name_en": "Enterprise Knowledge Architecture",
  "version": "1.0.0-draft",
  "status": "draft",
  "ssot": true,
  "total_domains": 9,
  "total_knowledge_types": 8,
  "total_states": 7,
  "total_authority_levels": 5,
  "dependencies": ["CON-000", "AI-000", "AUT-000", "PRM-000", "DEPLOY-001", "ARCH-012", "ARCH-003"]
}
```

### Block 2 — Knowledge Object Model

```json
{
  "knowledge_object_schema": {
    "required_fields": [
      "id",
      "title",
      "domain",
      "lifecycle.status",
      "lifecycle.version",
      "provenance.source",
      "provenance.source_type",
      "provenance.confidence",
      "content.language",
      "metadata.owner"
    ],
    "optional_fields": [
      "relationships",
      "provenance.evidence",
      "content.references",
      "metadata.expiry"
    ],
    "max_relationships": 100,
    "max_tags": 20
  }
}
```

### Block 3 — Taxonomy

```json
{
  "taxonomy": {
    "domains": [
      { "id": "business", "range": "KNW-100–199", "consumer_agents": ["AI-001", "AI-002"] },
      {
        "id": "engineering",
        "range": "KNW-200–299",
        "consumer_agents": ["AI-003", "AI-006", "AI-007"]
      },
      { "id": "platform", "range": "KNW-300–399", "consumer_agents": ["AI-005", "AI-008"] },
      { "id": "operational", "range": "KNW-400–499", "consumer_agents": ["AI-009", "AI-010"] },
      { "id": "ai", "range": "KNW-500–599", "consumer_agents": ["AI-011", "AI-012", "AI-013"] },
      { "id": "automation", "range": "KNW-600–699", "consumer_agents": ["AI-008", "AI-014"] },
      {
        "id": "brand",
        "range": "KNW-700–799",
        "consumer_agents": ["AI-001", "AI-003", "AI-004", "AI-006", "AI-007"]
      },
      { "id": "reference", "range": "KNW-800–899", "consumer_agents": ["AI-011", "AI-013"] },
      { "id": "archived", "range": "KNW-900–999", "consumer_agents": ["AI-011"] }
    ]
  }
}
```

### Block 4 — Lifecycle

```json
{
  "lifecycle": {
    "stages": [
      { "id": "LC-01", "name": "Capture", "next": ["LC-02"], "quality_gate": null },
      { "id": "LC-02", "name": "Extract", "next": ["LC-03"], "quality_gate": null },
      { "id": "LC-03", "name": "Validate", "next": ["LC-04"], "quality_gate": "QG-01" },
      { "id": "LC-04", "name": "Normalize", "next": ["LC-05"], "quality_gate": null },
      { "id": "LC-05", "name": "Register", "next": ["LC-06"], "quality_gate": "QG-02" },
      { "id": "LC-06", "name": "Index", "next": ["LC-07"], "quality_gate": null },
      { "id": "LC-07", "name": "Maintain", "next": ["LC-08"], "quality_gate": null },
      { "id": "LC-08", "name": "Evolve", "next": ["LC-09"], "quality_gate": "QG-03" },
      { "id": "LC-09", "name": "Retrieve", "next": ["LC-10"], "quality_gate": null },
      { "id": "LC-10", "name": "Consume", "next": [], "quality_gate": null }
    ],
    "max_concurrent_stages": 3
  }
}
```

### Block 5 — Governance

```json
{
  "governance": {
    "roles": [
      {
        "id": "knowledge-architect",
        "authority": "A-4",
        "responsibilities": ["architecture", "standards", "governance"]
      },
      {
        "id": "knowledge-steward",
        "authority": "A-3",
        "responsibilities": ["registry", "quality", "maintenance"]
      },
      {
        "id": "knowledge-producer",
        "authority": "A-2",
        "responsibilities": ["creation", "update"]
      },
      { "id": "knowledge-consumer", "authority": "A-1", "responsibilities": ["usage"] }
    ],
    "review_cycle_days": 180,
    "max_age_before_review_days": 365,
    "min_confidence_threshold": 0.5
  }
}
```

### Block 6 — KPIs

```json
{
  "kpis": [
    {
      "id": "KPI-01",
      "name": "knowledge_count",
      "description": "تعداد کل دانش‌های ثبت‌شده",
      "target": "≥ 100",
      "measurement": "monthly"
    },
    {
      "id": "KPI-02",
      "name": "knowledge_quality",
      "description": "میانگین امتیاز کیفیت",
      "target": "≥ 0.8",
      "measurement": "monthly"
    },
    {
      "id": "KPI-03",
      "name": "knowledge_coverage",
      "description": "پوشش دامنه‌های دانش",
      "target": "100%",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-04",
      "name": "knowledge_freshness",
      "description": "درصد دانش بازبینی‌شده در ۶ ماه",
      "target": "≥ 90%",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-05",
      "name": "knowledge_retrieval_time",
      "description": "زمان بازیابی دانش",
      "target": "< 1s",
      "measurement": "monthly"
    },
    {
      "id": "KPI-06",
      "name": "knowledge_utilization",
      "description": "نرخ مصرف دانش",
      "target": "≥ 70%",
      "measurement": "monthly"
    },
    {
      "id": "KPI-07",
      "name": "knowledge_accuracy",
      "description": "دقت دانش (عدم تناقض)",
      "target": "≥ 95%",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-08",
      "name": "knowledge_completion",
      "description": "تکمیل فیلدهای اجباری",
      "target": "100%",
      "measurement": "monthly"
    }
  ]
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Knowledge Object

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:object:v1",
  "title": "Knowledge Object",
  "description": "Schema for SMOS Knowledge Objects",
  "type": "object",
  "required": ["id", "title", "domain", "lifecycle", "provenance", "content", "metadata"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^KNW-[0-9]{3}$"
    },
    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 200
    },
    "domain": {
      "type": "string",
      "enum": [
        "business",
        "engineering",
        "platform",
        "operational",
        "ai",
        "automation",
        "brand",
        "reference",
        "archived"
      ]
    },
    "classification": {
      "type": "object",
      "properties": {
        "structure": {
          "type": "string",
          "enum": ["structured", "semi-structured", "unstructured"]
        },
        "origin": { "type": "string", "enum": ["human", "agent", "system", "external"] },
        "maturity": { "type": "string", "enum": ["emerging", "maturing", "mature", "frozen"] },
        "sensitivity": {
          "type": "string",
          "enum": ["public", "internal", "confidential", "restricted"]
        }
      },
      "required": ["structure", "origin", "maturity", "sensitivity"]
    },
    "lifecycle": {
      "type": "object",
      "required": ["status", "version", "created", "authority_level"],
      "properties": {
        "status": {
          "type": "string",
          "enum": ["draft", "validated", "registered", "active", "deprecated", "archived"]
        },
        "version": { "type": "string", "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$" },
        "created": { "type": "string", "format": "date" },
        "authority_level": { "type": "string", "enum": ["A-0", "A-1", "A-2", "A-3", "A-4"] }
      }
    },
    "provenance": {
      "type": "object",
      "required": ["source", "source_type", "confidence", "validated_by"],
      "properties": {
        "source": { "type": "string" },
        "source_type": { "type": "string", "enum": ["human", "agent", "system", "external"] },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
        "validated_by": { "type": "string" }
      }
    },
    "content": {
      "type": "object",
      "required": ["summary", "language"],
      "properties": {
        "summary": { "type": "string", "maxLength": 500 },
        "language": { "type": "string", "enum": ["fa", "en"] }
      }
    },
    "metadata": {
      "type": "object",
      "required": ["owner", "quality_score"],
      "properties": {
        "owner": { "type": "string" },
        "quality_score": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    }
  }
}
```

### Schema 2 — Knowledge Registry

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:registry:v1",
  "title": "Knowledge Registry",
  "description": "Schema for SMOS Knowledge Registry (KNW-001)",
  "type": "object",
  "required": ["entries", "total_count", "last_updated"],
  "properties": {
    "entries": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "domain", "status", "version"],
        "properties": {
          "id": { "type": "string", "pattern": "^KNW-[0-9]{3}$" },
          "title": { "type": "string" },
          "domain": {
            "type": "string",
            "enum": [
              "business",
              "engineering",
              "platform",
              "operational",
              "ai",
              "automation",
              "brand",
              "reference",
              "archived"
            ]
          },
          "status": {
            "type": "string",
            "enum": ["draft", "validated", "registered", "active", "deprecated", "archived"]
          },
          "version": { "type": "string", "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$" },
          "owner": { "type": "string" },
          "quality_score": { "type": "number", "minimum": 0, "maximum": 1 }
        }
      },
      "minItems": 0
    },
    "total_count": {
      "type": "integer",
      "minimum": 0
    },
    "last_updated": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### Schema 3 — Knowledge Relationship

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:relationship:v1",
  "title": "Knowledge Relationship",
  "description": "Schema for relationships between SMOS Knowledge Objects",
  "type": "object",
  "required": ["source", "target", "type", "direction"],
  "properties": {
    "source": {
      "type": "string",
      "pattern": "^KNW-[0-9]{3}$"
    },
    "target": {
      "type": "string",
      "pattern": "^KNW-[0-9]{3}$"
    },
    "type": {
      "type": "string",
      "enum": [
        "depends-on",
        "derived-from",
        "related-to",
        "replaces",
        "references",
        "validates",
        "extends",
        "contradicts"
      ]
    },
    "direction": {
      "type": "string",
      "enum": ["outbound", "inbound", "bidirectional"]
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "weight": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "default": 0.5
    }
  },
  "additionalProperties": false
}
```

---

## ۲۹. KPIs — شاخص‌های کلیدی عملکرد

| KPI                    | شناسه  | هدف       | بازه   | مسئول       |
| ---------------------- | ------ | --------- | ------ | ----------- |
| تعداد دانش‌های ثبت‌شده | KPI-01 | ≥ ۱۰۰     | ماهانه | متولی دانش  |
| میانگین امتیاز کیفیت   | KPI-02 | ≥ ۰.۸     | ماهانه | معمار دانش  |
| پوشش دامنه‌های دانش    | KPI-03 | ۱۰۰٪      | فصلی   | معمار دانش  |
| درصد بازبینی در ۶ ماه  | KPI-04 | ≥ ۹۰٪     | فصلی   | متولی دانش  |
| زمان بازیابی           | KPI-05 | < ۱ ثانیه | ماهانه | مهندس سیستم |
| نرخ مصرف دانش          | KPI-06 | ≥ ۷۰٪     | ماهانه | متولی دانش  |
| دقت دانش               | KPI-07 | ≥ ۹۵٪     | فصلی   | معمار دانش  |
| تکمیل فیلدهای اجباری   | KPI-08 | ۱۰۰٪      | ماهانه | خودکار      |

---

## ۳۰. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                | توسط        |
| ----------- | ---------- | ---------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-29 | نگارش اولیه — معماری دانش سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema. SSOT برای تمام KNW-NNN. | معمار سیستم |
