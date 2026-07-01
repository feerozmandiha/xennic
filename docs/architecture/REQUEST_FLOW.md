# جریان درخواست‌ها — Request Flow

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

**نویسنده**: تیم معماری Xennic

---

## Purpose

این سند چگونگی جریان درخواست‌ها از فرانت‌اند تا پاسخ نهایی را در پلتفرم Xennic توصیف می‌کند.

---

## Scope

تمامی مسیرهای اصلی درخواست: احراز هویت، OCR، محاسبات مهندسی، AI چت.

---

## ۱. احراز هویت (Authentication Flow)

```mermaid
sequenceDiagram
    participant User as کاربر
    participant Web as Next.js
    participant Nest as NestJS API
    participant DB as PostgreSQL
    
    User->>Web:填写 فرم ورود
    Web->>Nest: POST /api/v1/auth/login
    
    Nest->>Nest: Validation (class-validator)
    Nest->>DB: findByEmail()
    DB-->>Nest: user record
    
    Nest->>Nest: Verify password (Argon2id)
    Nest->>Nest: Generate JWT (15min) + Refresh Token (7d)
    
    Nest-->>Web: {access_token, refresh_token, user}
    Web-->>User: ورود موفق
```

---

## ۲. OCR / Upload (Vision Flow)

```mermaid
sequenceDiagram
    participant User as کاربر
    participant Web as Next.js
    participant VS as Vision Service
    participant TESS as Tesseract
    
    User->>Web: انتخاب فایل تصویر/PDF
    Web->>VS: POST /api/v1/vision/upload (CORS direct)
    
    alt PDF
        VS->>VS: Convert PDF→Images (100 DPI)
    end
    
    alt Image > 2000px
        VS->>VS: فقط Validator + OCR
    else
        VS->>VS: Full Preprocessing
        VS->>VS: OCR Preprocessed
        VS->>VS: Check Quality (>0.55)
        alt Quality < 0.55
            VS->>VS: OCR Original Image (Fallback)
        end
    end
    
    VS->>TESS: Tesseract OCR
    TESS-->>VS: Extracted Text
    
    VS->>VS: Classify Document (Nameplate/Bill)
    VS->>VS: Extract Data
    VS-->>Web: {type, text, extracted, confidence}
    Web-->>User: نمایش نتایج
```

---

## ۳. محاسبات مهندسی (Engineering Flow)

```mermaid
sequenceDiagram
    participant User as کاربر
    participant Web as Next.js
    participant Nest as NestJS API
    participant ES as Engineering Service
    
    User->>Web: وارد کردن مشخصات موتور
    Web->>Nest: POST /api/v1/engineering/motor
    
    Nest->>Nest: Validation
    Nest->>ES: POST /api/v1/engineering/analysis/motor
    
    ES->>ES: Validate Inputs
    ES->>ES: Run Calculation
    ES->>ES: Check Standards
    ES-->>Nest: {success, data, knowledge}
    
    Nest->>Nest: Store in DB
    Nest-->>Web: {success, data, knowledge}
    Web-->>User: نمایش نتایج + دانش فنی
```

---

## ۴. AI Chat Flow

```mermaid
sequenceDiagram
    participant User as کاربر
    participant Web as Next.js
    participant Nest as NestJS API
    participant AS as AI Service
    participant QD as Qdrant
    participant LLM as LLM Provider
    
    User->>Web: سوال فنی
    Web->>Nest: POST /api/v1/ai/chat
    
    Nest->>Nest: Check Usage Quota
    Nest->>AS: POST /api/v1/ai/chat
    
    AS->>AS: Select Agent
    AS->>QD: Search Relevant Knowledge
    QD-->>AS: Context
    
    AS->>LLM: Prompt + Context
    LLM-->>AS: Response
    
    AS->>AS: Log Usage
    AS-->>Nest: {response, sources, usage}
    
    Nest->>Nest: Save Conversation
    Nest-->>Web: {response, sources}
    Web-->>User: نمایش پاسخ
```

---

## مسیرهای درخواست — خلاصه

| سناریو | مسیر | سرویس‌ها | پروتکل |
|--------|------|-----------|--------|
| Login | `/api/v1/auth/login` | Web → NestJS | HTTP/REST |
| Upload | `/api/v1/vision/upload` | Web → Vision | HTTP/CORS |
| Motor Calc | `/api/v1/engineering/motor` | Web → NestJS → Eng | HTTP/REST |
| AI Chat | `/api/v1/ai/chat` | Web → NestJS → AI | HTTP/REST |
| Knowledge Search | `/api/v1/ai/knowledge` | Web → NestJS → AI → Qdrant | HTTP/gRPC |

---

## Related Documents

| سند | مسیر |
|-----|------|
| System Architecture | `architecture/SYSTEM_ARCHITECTURE.md` |
| Sequence Diagrams | `architecture/SEQUENCE_DIAGRAMS.md` |
| Event Flow | `architecture/EVENT_FLOW.md` |
| API Design | `backend/API_DESIGN.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
