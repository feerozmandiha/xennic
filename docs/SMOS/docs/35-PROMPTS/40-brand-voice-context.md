# Brand Voice Context — بافت معماری صدای برند

> **شناسه:** PRM-401
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** معمار سیستم
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [BRD-002](../22-BRAND/20-brand-voice.md)
> **مخاطب:** human, ai-agent, mcp, workflow-engine

---

## ۱. Purpose

PRM-401 بافت معماری صدای برند Xennic را برای مصرف‌کنندگان (Agentها و Workflowها) تأمین می‌کند. این پرامپت از نوع Context (PT-05) است و بر اساس [BRD-002](../22-BRAND/20-brand-voice.md) طراحی شده است.

### کاربرد

- تأمین ابعاد صدای برند (Voice Dimensions) برای Agentهای تولید محتوا
- تعیین حالت لحن (Tone Mode) متناسب با بافت محتوا
- ارائه قواعد نگارش، جملات، پاراگراف‌ها و تیترها
- تعیین محدودیت‌های زبانی (Forbidden/Preferred Language)
- تنظیم سطح خوانایی (Reading Level) بر اساس مخاطب

### مصرف‌کنندگان

| مصرف‌کننده                         | نوع مصرف           | مورد استفاده                 |
| ---------------------------------- | ------------------ | ---------------------------- |
| AI-003 (Content Production)        | Context Injection  | هنگام تولید محتوای متعارف    |
| AI-004 (Content Review)            | Validation Context | هنگام بازبینی انطباق با برند |
| AI-005 (Search Optimization)       | Context Injection  | هنگام بهینه‌سازی محتوا       |
| AI-006 (Media Asset Production)    | Context Injection  | هنگام تولید توضیحات رسانه    |
| AI-007 (Video Production)          | Context Injection  | هنگام تولید اسکریپت ویدئو    |
| AI-008 (Publishing & Distribution) | Context Injection  | هنگام تطبیق پلتفرمی          |
| AI-009 (Community Engagement)      | Context Injection  | هنگام پاسخ به جامعه          |
| همه Agentها                        | Reference          | دریافت هویت برند             |

---

## ۲. Context Definition

### منابع بافت

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "BRD-002",
        "scope": [
          "voice-dimensions",
          "tone-modes",
          "writing-principles",
          "sentence-architecture",
          "paragraph-architecture",
          "headline-system",
          "forbidden-language",
          "preferred-language",
          "reading-difficulty",
          "narrative-architecture"
        ],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

### متغیرهای ورودی

| متغیر                 | نوع    | اجباری | توضیح                   | اعتبارسنجی                                                                                           |
| --------------------- | ------ | ------ | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `tone_mode`           | VAR-04 | خیر    | حالت لحن برند           | members: [MODE-EDU, MODE-PRO, MODE-NEW, MODE-INT, MODE-ANL, MODE-CRS, MODE-INS, MODE-NAR, MODE-INTL] |
| `audience_level`      | VAR-04 | خیر    | سطح دانش مخاطب          | members: [RL-1, RL-2, RL-3, RL-4]                                                                    |
| `communication_layer` | VAR-04 | خیر    | لایه ارتباطی            | members: [LAY-EXT, LAY-SEM, LAY-INF, LAY-INT, LAY-CRS]                                               |
| `content_ct_id`       | VAR-01 | خیر    | شناسه نوع محتوا (CT-ID) | pattern: ^CT-\d{3}$                                                                                  |

### متغیرهای خروجی

بافت تزریق‌شده شامل موارد زیر است:

| بخش                            | توضیح                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Voice Dimensions**           | ۵ بعد صدا با وزن پیش‌فرض — آگاهانه (۷۰٪), صریح (۸۰٪), محترم (۷۵٪), الهام‌بخش (۶۰٪), انسانی (۷۰٪) |
| **Tone Mode Configuration**    | تنظیمات حالت لحن شامل ۵ بعد formal/humor/tech/structure/emotion                                  |
| **Writing Rules**              | ۸ قاعده بنیادین + ۵ قاعده ساختاری نگارش                                                          |
| **Reading Level Guidelines**   | محدودیت‌های سطح خوانایی بر اساس RL                                                               |
| **Language Constraints**       | واژگان ممنوع (F-01 تا F-09) و ترجیحات زبانی                                                      |
| **Sentence & Paragraph Rules** | انواع جملات و پاراگراف‌های مجاز با محدودیت کلمه                                                  |
| **Headline Rules**             | انواع تیتر با محدودیت کلمه                                                                       |
| **CTA Rules**                  | اصول فراخوان به اقدام                                                                            |
| **Narrative Patterns**         | ۵ الگوی روایی با ساختار                                                                          |

---

## ۳. Dependencies

| شناسه   | نوع               | نسخه   | دلیل                                                       |
| ------- | ----------------- | ------ | ---------------------------------------------------------- |
| BRD-002 | DEP-05 (Provides) | ^2.0.0 | منبع دانش معماری صدای برند — تأمین تمام قواعد و ابعاد برند |

---

## ۴. Instruction Body

### هدف پرامپت

این پرامپت برای تزریق بافت معماری صدای برند Xennic به Agent مصرف‌کننده طراحی شده است. محتوای تزریق‌شده شامل تمام ابعاد، قواعد و محدودیت‌های برند مطابق BRD-002 است.

### ساختار بافت تزریقی

بافت تزریق‌شده به ترتیب زیر سازماندهی می‌شود:

1. **Identity Block**: معرفی هویت برند Xennic (نور، نیرو، یکتا)
2. **Voice Dimensions Table**: ۵ بعد صدا با وزن و دامنه مجاز
3. **Active Tone Mode**: تنظیمات حالت لحن فعال (پیش‌فرض: MODE-EDU اگر مشخص نشده)
4. **Language Rules**: واژگان ممنوع و ترجیحات
5. **Writing Constraints**: قواعد جمله، پاراگراف، تیتر
6. **Reading Level**: سطح خوانایی هدف
7. **Narrative Guidance**: الگوهای روایی مناسب

### قواعد تزریق

| ID      | قاعده                                                                  |
| ------- | ---------------------------------------------------------------------- |
| CTX-R01 | بافت همیشه در ابتدای پرامپت مصرف‌کننده تزریق می‌شود (prepend)          |
| CTX-R02 | اگر tone_mode مشخص نشده، Agent از بافت محتوا نوع لحن را استنتاج می‌کند |
| CTX-R03 | اگر audience_level مشخص نشده، سطح RL-2 (عمومی) پیش‌فرض است             |
| CTX-R04 | بافت BRD-002 در همه پرامپت‌های تولید محتوای متنی اجباری است            |
| CTX-R05 | بافت BRD-002 در پرامپت‌های سیستمی (FAM-SYS) اختیاری است                |

---

## ۵. Quality Gates

| گیت   | مکان              | معیار                                         | مسئول           |
| ----- | ----------------- | --------------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، متغیرهای تعریف‌شده، وابستگی مشخص   | خودکار          |
| QG-02 | Review → Approved | انطباق با BRD-002 v2.0.0، پوشش کامل ۵ بعد صدا | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001                                | Registry Keeper |

---

## ۶. Machine Readable Block

```json
{
  "prompt_metadata": {
    "id": "PRM-401",
    "name_fa": "بافت معماری صدای برند",
    "name_en": "Brand Voice Context",
    "version": "1.0.0-draft",
    "family": "FAM-KNW",
    "type": "PT-05",
    "complexity": "C-1",
    "authority": "A-2",
    "owner": "Knowledge Architect",
    "consumers": ["AI-003", "AI-004", "AI-005", "AI-006", "AI-007", "AI-008", "AI-009"],
    "dependencies": ["BRD-002"],
    "context_sources": ["CTX-02"],
    "variables": ["tone_mode", "audience_level", "communication_layer", "content_ct_id"],
    "security_level": "SL-02",
    "status": "draft"
  }
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — بافت معماری صدای برند | معمار سیستم |
