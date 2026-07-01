# انتخاب مدل — Model Selection

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

استراتژی انتخاب مدل‌های AI در پلتفرم Xennic.

---

## Scope

LLM models, embedding models, OCR models.

---

## LLM Models

| Provider | Model | Strengths | Weaknesses | Cost |
|----------|-------|-----------|------------|------|
| **Groq** | Llama 3 8B | Very fast, free tier | Limited context | $۰/M (free) |
| **Groq** | Llama 3 70B | Fast, good quality | Rate limited | $۰.۵۹/M |
| **OpenAI** | GPT-4o-mini | Balanced, fast | - | $۰.۱۵/M |
| **OpenAI** | GPT-4o | Best quality | Expensive | $۲.۵۰/M |
| **Ollama** | Llama 3.2 | Local, free | Limited power | $۰ |

### Selection Criteria
```
For speed:        Groq (Llama 3 8B)
For quality:      OpenAI (GPT-4o)
For development:  Ollama (Local)
For cost:         Groq (Free tier)
```

---

## Embedding Models

| Model | Dimension | Max Length | Quality |
|-------|-----------|------------|---------|
| all-MiniLM-L6-v2 | ۳۸۴ | ۲۵۶ | Good |
| all-mpnet-base-v2 | ۷۶۸ | ۳۸۴ | Better |
| text-embedding-3-small | ۱۵۳۶ | ۸۱۹۱ | Best (API) |

### Selected
```
all-MiniLM-L6-v2
Reason: Lightweight, fast, good enough for engineering domain
```

---

## OCR Models

| Engine | Language | Speed | Quality |
|--------|----------|-------|---------|
| **Tesseract** | eng+fas | Fast | Good (printed text) |
| **EasyOCR** | en+fa | Slow | Better (handwritten) |
| **PaddleOCR** | en+fa | Medium | Best (Persian text) |

### Current Status
```
Tesseract: ✅ Active (main OCR engine)
EasyOCR:  ⏳ Installed, models not cached
PaddleOCR: ❌ Not installed (needs GPU)
```

---

## Model Versioning

| Model | Version | Date |
|-------|---------|------|
| Tesseract | ۵.۳.۴ | ۲۰۲۴ |
| EasyOCR | ۱.۷.۲ | ۲۰۲۴ |
| all-MiniLM-L6-v2 | ۱.۰ | ۲۰۲۱ |
| Llama 3.1 | ۸B | ۲۰۲۴ |
| GPT-4o | - | ۲۰۲۴ |

---

## Cost Optimization

| Strategy | Impact |
|----------|--------|
| Cache common queries | -۳۰٪ cost |
| Use smaller model for simple tasks | -۵۰٪ cost |
| Batch embedding requests | -۲۰٪ cost |
| Local model for development | $۰ cost |

---

## Related Documents

| سند | مسیر |
|-----|------|
| LLM Integration | `ai/LLM_INTEGRATION.md` |
| AI Engine | `ai/AI_ENGINE.md` |
| OCR Pipeline | `ai/OCR_PIPELINE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
