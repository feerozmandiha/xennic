# نمودارهای توالی — Sequence Diagrams

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

مجموعه نمودارهای توالی (Sequence Diagrams) برای سناریوهای کلیدی پلتفرم Xennic.

---

## ۱. ثبت‌نام کاربر

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js
    participant Nest as NestJS API
    participant DB as PostgreSQL
    participant RMQ as RabbitMQ
    
    User->>Web: Fill Registration Form
    Web->>Nest: POST /api/v1/auth/register
    Nest->>Nest: Validate Input
    Nest->>DB: Check Email Uniqueness
    DB-->>Nest: OK
    Nest->>Nest: Hash Password (Argon2id)
    Nest->>DB: Create User + Workspace
    DB-->>Nest: {user, workspace}
    Nest->>Nest: Generate JWT + Refresh Token
    Nest-->>Web: {user, tokens}
    Web-->>User: Redirect to Dashboard
```

---

## ۲. OCR Pipeline کامل

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js
    participant VS as Vision Service
    participant Pipe as Pipeline
    participant Tess as Tesseract
    participant LLM as LLM (Fallback)
    
    User->>Web: Select File
    Web->>VS: POST /api/v1/vision/upload
    VS->>Pipe: Process Image
    
    alt Large Image
        Pipe->>Pipe: Skip Preprocessing
    else
        Pipe->>Pipe: Enhance → Correct → Deskew → Denoise
    end
    
    Pipe->>Tess: OCR (3 Strategies)
    Tess-->>Pipe: Text + Confidence
    
    alt Low Confidence
        Pipe->>LLM: Fallback OCR
        LLM-->>Pipe: Text
    end
    
    Pipe->>Pipe: Classify Document Type
    
    alt Nameplate
        Pipe->>Pipe: Extract (Manufacturer, Model, Power, V, I...)
    else Bill
        Pipe->>Pipe: Extract (Bill#, Consumption, Amount...)
    end
    
    Pipe->>Pipe: Validate Data
    VS-->>Web: {type, text, extracted}
    Web-->>User: Display Results
```

---

## ۳. محاسبه موتور الکتریکی

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js
    participant Nest as NestJS API
    participant ES as Engineering Service
    participant Calc as Calculator
    participant DB as PostgreSQL
    
    User->>Web: Enter Motor Parameters
    Web->>Nest: POST /api/v1/engineering/motor
    Nest->>Nest: Validate DTO
    Nest->>ES: POST /analysis/motor
    ES->>Calc: Motor Analysis
    Calc->>Calc: Apparent Power
    Calc->>Calc: Real Power
    Calc->>Calc: Torque
    Calc->>Calc: Efficiency
    Calc-->>ES: {results, knowledge}
    ES-->>Nest: {data, knowledge}
    Nest->>DB: Save Calculation History
    Nest-->>Web: {results, knowledge}
    Web-->>User: Show Charts + Report
```

---

## ۴. AI Chat با RAG

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js
    participant Nest as NestJS API
    participant AS as AI Service
    participant QD as Qdrant
    participant LLM as LLM Provider
    
    User->>Web: Ask Technical Question
    Web->>Nest: POST /api/v1/ai/chat
    Nest->>Nest: Check Subscription Quota
    Nest->>AS: POST /ai/chat
    
    AS->>AS: Select Agent (Electrical Engineer)
    AS->>QD: Embed Query
    AS->>QD: Search Top-K
    QD-->>AS: {chunks, sources}
    
    AS->>AS: Build Prompt (System + Context + History)
    AS->>LLM: Generate Response
    LLM-->>AS: Response Text
    
    AS->>AS: Log Token Usage
    AS-->>Nest: {response, sources, usage}
    Nest->>Nest: Save to Conversation History
    Nest-->>Web: {response, sources}
    Web-->>User: Display Response
```

---

## ۵. مدیریت دانش (Publish Flow)

```mermaid
sequenceDiagram
    actor Author as نویسنده
    actor Reviewer as بازبین
    participant Web as Next.js
    participant Nest as NestJS API
    participant DB as PostgreSQL
    
    Author->>Web: Create Knowledge Article
    Web->>Nest: POST /api/v1/knowledge
    Nest->>DB: Save as Draft
    DB-->>Nest: {id, status: "draft"}
    Web-->>Author: Article Created
    
    Author->>Web: Submit for Review
    Web->>Nest: PUT /api/v1/knowledge/{id}/workflow
    Nest->>DB: Update Status → "submitted"
    DB-->>Nest: OK
    Web-->>Author: Submitted
    
    Reviewer->>Web: Review Article
    Web->>Nest: GET /api/v1/knowledge/pending
    Nest->>DB: Find Pending Articles
    DB-->>Nest: [articles]
    Web-->>Reviewer: Pending List
    
    Reviewer->>Web: Approve
    Web->>Nest: PUT /api/v1/knowledge/{id}/workflow
    Nest->>DB: Update Status → "published"
    Nest->>DB: Create Version Snapshot
    DB-->>Nest: Done
    Web-->>Reviewer: Published
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Request Flow | `architecture/REQUEST_FLOW.md` |
| Event Flow | `architecture/EVENT_FLOW.md` |
| Service Architecture | `architecture/SERVICE_ARCHITECTURE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
