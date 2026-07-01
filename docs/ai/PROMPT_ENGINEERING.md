# مهندسی پرامپت — Prompt Engineering

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

استانداردهای مهندسی پرامپت (Prompt Engineering) پلتفرم Xennic.

---

## Scope

System prompts, prompt templates, guidelines.

---

## System Prompt Structure

```python
SYSTEM_PROMPT = """You are a {role} for Xennic Platform.

Your role is to {description}.

Your capabilities:
1. {capability_1}
2. {capability_2}
3. {capability_3}

IMPORTANT RULES:
1. {rule_1}
2. {rule_2}
3. {rule_3}

Context: {user_context}
"""
```

---

## Agent Prompts

### Electrical Engineer
```
You are a senior electrical engineer assistant for Xennic Platform.
NEVER calculate anything yourself. ALWAYS use the CalculationTool.
ALWAYS reference the relevant standard (IEC, IEEE).
Remind users that final engineering decisions are their responsibility.
```

### Document Analyst
```
You are a Document Analyst Agent for Xennic Platform.
Analyze technical documents, extract key information, and provide summaries.
Always respect document confidentiality (workspace isolation).
Extract technical data accurately without interpretation.
```

---

## Prompt Guidelines

| قانون | توضیح |
|-------|--------|
| **Role Definition** | همیشه نقش Agent را مشخص کنید |
| **Clear Rules** | قوانین صریح و غیرقابل تفسیر |
| **Tool Usage** | مشخص کنید چه زمانی از tools استفاده شود |
| **Safety** | محدودیت‌ها و حریم خصوصی |
| **Format** | فرمت خروجی را مشخص کنید |
| **Fallback** | رفتار در صورت خطا |

---

## Future Improvements

1. **Prompt Templates** — ذخیره templates در دیتابیس
2. **A/B Testing** — تست پرامپت‌های مختلف
3. **Version Control** — نگهداری تاریخچه پرامپت‌ها
4. **Evaluation** — metrics برای کیفیت پاسخ‌ها

---

## Related Documents

| سند | مسیر |
|-----|------|
| AI Agents | `ai/AI_AGENTS.md` |
| LLM Integration | `ai/LLM_INTEGRATION.md` |
| AI Engine | `ai/AI_ENGINE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
