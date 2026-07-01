# مشخصات Vision — Vision Specification

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **مالک**: AI Team | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: شهریور ۱۴۰۵

---

## Purpose

مشخصات رسمی Vision Pipeline پلتفرم Xennic.

---

## Scope

Image processing, diagram detection, symbol recognition.

---

## Contract

### Pipeline Stages (11 steps)
| مرحله | توضیح | تکنولوژی |
|-------|-------|-----------|
| ۱. Receive | دریافت document از API | FastAPI |
| ۲. Validate | اعتبارسنجی فرمت و اندازه | Python |
| ۳. Preprocess | آماده‌سازی تصویر | OpenCV |
| ۴. OCR | استخراج متن | Tesseract |
| ۵. Detect Diagrams | شناسایی نمودارها | CV |
| ۶. Extract Tables | استخراج جداول | CV + ML |
| ۷. Classify Document | دسته‌بندی سند | Rule-based |
| ۸. Extract Entities | استخراج موجودیت‌ها | NER |
| ۹. Generate Embeddings | تولید بردار | sentence-transformers |
| ۱۰. Store | ذخیره در Qdrant + PostgreSQL | Qdrant |
| ۱۱. Index | نمایه‌سازی | Async |

### Detection Methods
| نوع | روش |
|-----|------|
| Single Line Diagrams | Hough Line Transform |
| Schematics | Symbol matching |
| Tables | Grid detection |
| Graphs | Node-edge detection |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Vision Pipeline | `ai/VISION_PIPELINE.md` |
| Vision AI | `ai/VISION_AI.md` |
| Document Analysis | `ai/DOCUMENT_ANALYSIS.md` |
| Vision Service | `services/vision-service.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
