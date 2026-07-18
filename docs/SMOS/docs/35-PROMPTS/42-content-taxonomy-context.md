# Content Taxonomy Context — بافت تاکسونومی محتوا

> **شناسه:** PRM-402
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** معمار سیستم
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-401](./40-brand-voice-context.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** human, ai-agent, mcp, workflow-engine

---

## ۱. Purpose

PRM-402 بافت تاکسونومی محتوای سازمانی SMOS را برای مصرف‌کنندگان تأمین می‌کند. این پرامپت از نوع Context (PT-05) است و بر اساس [EDT-002](../24-EDITORIAL/20-content-taxonomy.md) طراحی شده است.

### کاربرد

- تعیین نوع محتوا (CT-ID) متناسب با هدف و مخاطب
- ارائه ابعاد طبقه‌بندی محتوا (Primary Type, Format, Length, Tone و ...)
- تعیین چرخه حیات مناسب برای هر نوع محتوا
- ارائه روابط بین انواع محتوا (Relationship Types)
- تعیین سطوح AI Suitability برای هر CT-ID

### مصرف‌کنندگان

| مصرف‌کننده                         | نوع مصرف           | مورد استفاده               |
| ---------------------------------- | ------------------ | -------------------------- |
| AI-001 (Content Strategy)          | Context Injection  | هنگام تعیین استراتژی محتوا |
| AI-002 (Content Planning)          | Context Injection  | هنگام برنامه‌ریزی محتوا    |
| AI-003 (Content Production)        | Context Injection  | هنگام تولید محتوا          |
| AI-004 (Content Review)            | Validation Context | هنگام بازبینی نوع محتوا    |
| AI-005 (Search Optimization)       | Context Injection  | هنگام بهینه‌سازی           |
| AI-008 (Publishing & Distribution) | Context Injection  | هنگام انتشار               |
| AI-011 (Knowledge Management)      | Context Injection  | هنگام نمایه‌سازی دانش      |
| همه Agentها                        | Reference          | طبقه‌بندی محتوا            |

---

## ۲. Context Definition

### منابع بافت

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "EDT-002",
        "scope": [
          "content-categories",
          "content-type-definitions",
          "classification-dimensions",
          "content-attributes",
          "content-relationships",
          "lifecycle-mapping",
          "ai-interpretation-rules"
        ],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-alignment"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 2500,
    "priority": "high"
  }
}
```

### متغیرهای ورودی

| متغیر             | نوع    | اجباری | توضیح          | اعتبارسنجی                                                                                                                  |
| ----------------- | ------ | ------ | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `primary_goal`    | VAR-04 | بله    | هدف اصلی محتوا | members: [educational, authority, marketing, community, conversion, trust, interactive, event, knowledge, crisis, internal] |
| `audience_intent` | VAR-04 | خیر    | قصد مخاطب      | members: [learn, decide, engage, buy, trust, participate, know]                                                             |
| `platform`        | VAR-04 | خیر    | پلتفرم هدف     | members: [website, instagram, linkedin, telegram, youtube, aparat, bale]                                                    |
| `lifecycle_speed` | VAR-04 | خیر    | سرعت چرخه حیات | members: [rapid, normal, slow, evergreen]                                                                                   |

### متغیرهای خروجی

بافت تزریق‌شده شامل موارد زیر است:

| بخش                        | توضیح                                             |
| -------------------------- | ------------------------------------------------- |
| **CT-ID و نام**            | شناسه و نام فارسی/انگلیسی نوع محتوا               |
| **دسته‌بندی سطح ۱**        | یکی از ۱۱ دسته اصلی (CAT-EDU تا CAT-INT)          |
| **فرمت‌های مجاز**          | فرمت‌های سازگار با CT-ID                          |
| **پلتفرم‌های سازگار**      | پلتفرم‌های قابل انتشار برای این CT-ID             |
| **چرخه حیات پیشنهادی**     | سرعت و مراحل تولید (rapid/normal/slow/evergreen)  |
| **AI Suitability**         | سطح خودکاری مجاز (full/partial/review/human_only) |
| **گیت‌های کیفیت**          | گیت‌های الزامی برای این CT-ID                     |
| **روابط با CT-IDهای دیگر** | روابط معنایی با انواع محتوای مرتبط                |

---

## ۳. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                                                 |
| ------- | ------------------- | ------ | -------------------------------------------------------------------- |
| EDT-002 | DEP-05 (Provides)   | ^1.0.0 | منبع دانش تاکسونومی محتوا — تأمین ۴۲ CT-ID, ۱۱ دسته, ابعاد طبقه‌بندی |
| PRM-401 | DEP-03 (References) | ^1.0.0 | بافت صدای برند — تطبیق لحن با نوع محتوا (اختیاری)                    |

---

## ۴. Instruction Body

### هدف پرامپت

این پرامپت برای تزریق بافت تاکسونومی محتوای سازمانی به Agent مصرف‌کننده طراحی شده است. محتوای تزریق‌شده طبقه‌بندی، ابعاد و محدودیت‌های هر نوع محتوا را مطابق EDT-002 مشخص می‌کند.

### ساختار بافت تزریقی

بافت تزریق‌شده به ترتیب زیر سازماندهی می‌شود:

1. **Category Identification**: تعیین دسته اصلی بر اساس primary_goal
2. **CT-ID Selection**: انتخاب نوع محتوا از ۴۲ CT-ID بر اساس هدف، مخاطب و پلتفرم
3. **Format Constraints**: محدودیت‌های فرمت برای CT-ID انتخاب‌شده
4. **Platform Compatibility**: پلتفرم‌های سازگار
5. **Lifecycle Guidance**: چرخه حیات و مراحل تولید پیشنهادی
6. **AI Autonomy Level**: سطح خودکاری مجاز Agent در تولید
7. **Quality Gates**: گیت‌های کیفیت الزامی
8. **Related CT-IDs**: انواع محتوای مرتبط برای زنجیره محتوا

### قواعد تزریق

| ID      | قاعده                                                               |
| ------- | ------------------------------------------------------------------- |
| CTX-R01 | primary_goal اجباری است — بدون آن بافت کامل نمی‌شود                 |
| CTX-R02 | اگر platform مشخص نشود، تمام پلتفرم‌های سازگار برگردانده می‌شوند    |
| CTX-R03 | اگر lifecycle_speed مشخص نشود، مقدار پیش‌فرض CT-ID استفاده می‌شود   |
| CTX-R04 | AI Suitability باید با سطح اختیار Agent مصرف‌کننده تطابق داشته باشد |
| CTX-R05 | CT-IDهای بحران (CT-036 تا CT-038) نیازمند تأیید انسانی اجباری هستند |

---

## ۵. Quality Gates

| گیت   | مکان              | معیار                                            | مسئول           |
| ----- | ----------------- | ------------------------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل، متغیرها تعریف‌شده، وابستگی به EDT-002 | خودکار          |
| QG-02 | Review → Approved | انطباق کامل با EDT-002، پوشش ۱۱ دسته و ۴۲ CT-ID  | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001                                   | Registry Keeper |

---

## ۶. Machine Readable Block

```json
{
  "prompt_metadata": {
    "id": "PRM-402",
    "name_fa": "بافت تاکسونومی محتوا",
    "name_en": "Content Taxonomy Context",
    "version": "1.0.0-draft",
    "family": "FAM-KNW",
    "type": "PT-05",
    "complexity": "C-1",
    "authority": "A-2",
    "owner": "Knowledge Architect",
    "consumers": ["AI-001", "AI-002", "AI-003", "AI-004", "AI-005", "AI-008", "AI-011"],
    "dependencies": ["EDT-002", "PRM-401"],
    "context_sources": ["CTX-02"],
    "variables": ["primary_goal", "audience_intent", "platform", "lifecycle_speed"],
    "security_level": "SL-02",
    "status": "draft"
  }
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                              | توسط        |
| ----------- | ---------- | ---------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — بافت تاکسونومی محتوا | معمار سیستم |
