# Pipeline OCR — OCR Pipeline

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

Pipeline تشخیص متن (OCR) پلتفرم Xennic را توصیف می‌کند.

---

## Scope

Vision Service, Tesseract, EasyOCR, OCR strategies.

---

## معماری Pipeline

```mermaid
graph TB
    IN["Input Image"] --> PRE["Preprocessing"]
    PRE --> STR1["Strategy 1\nAdaptive Threshold"]
    PRE --> STR2["Strategy 2\nOTSU Binarization"]
    PRE --> STR3["Strategy 3\nRaw Grayscale"]
    
    STR1 --> TESS["Tesseract OCR"]
    STR2 --> TESS
    STR3 --> TESS
    
    TESS --> BEST["Select Best Result"]
    BEST --> QUALITY{"Quality > 0.55?"}
    
    QUALITY -->|"Yes"| DONE["Use OCR Result"]
    QUALITY -->|"No"| FALLBACK["Fallback:\nOriginal Image OCR"]
    FALLBACK --> DONE
```

---

## OCR Strategies

### 1. Adaptive Threshold
```python
thresh = cv2.adaptiveThreshold(
    gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY, blockSize=15, C=2
)
```

### 2. OTSU Binarization
```python
_, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
```

### 3. Raw Grayscale
```python
# بدون باینری‌سازی، مستقیم grayscale
ocr_result = pytesseract.image_to_string(gray, lang='eng+fas')
```

---

## Cascade OCR

```
1. EasyOCR (اگر مدل‌ها کش شده باشند)
   ↓ fail
2. Tesseract (۳ استراتژی - بهترین نتیجه)
   ↓ fail
3. Vision LLM (در صورت وجود API key)
```

---

## Quality Metrics

| معیار | فرمول | آستانه |
|-------|-------|---------|
| Character Readability | `alpha / total_chars` | > ۰.۵۵ |
| Length | کل کاراکترها | > ۱۰ |
| Alphanumeric Ratio | `alnum / total` | > ۰.۴ |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Vision Pipeline | `ai/VISION_PIPELINE.md` |
| Vision AI | `ai/VISION_AI.md` |
| Vision Service | `services/vision-service.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
