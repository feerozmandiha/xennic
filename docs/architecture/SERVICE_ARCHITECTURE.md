# معماری سرویس‌ها — Service Architecture

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

**نویسنده**: تیم معماری Xennic

---

## Purpose

این سند معماری داخلی هر سرویس پلتفرم Xennic را توصیف می‌کند.

---

## Scope

تمام سرویس‌های فعال پلتفرم: NestJS API، Vision Service، Engineering Service، AI Service.

---

## معماری NestJS API

```mermaid
graph TB
    subgraph "NestJS API"
        CT["Controllers\n(Presentation Layer)"]
        AS["Application Services\n(Use Cases)"]
        DM["Domain Layer\n(Entities, VOs, Interfaces)"]
        IN["Infrastructure Layer\n(Repositories, External Services)"]
        
        CT --> AS
        AS --> DM
        AS --> IN
        IN --> PG[("PostgreSQL via Prisma")]
        IN --> RD[("Redis")]
    end
```

### ساختار ماژول (DDD/CQRS)
```
module/
├── application/    # Use cases, application services
├── domain/         # Entities, value objects, interfaces
├── infrastructure/ # Repositories, external services
├── presentation/   # Controllers, DTOs
└── {module}.module.ts
```

### ماژول‌های NestJS API

| ماژول | دامنه | endpointها |
|-------|-------|------------|
| `auth` | احراز هویت | register, login, refresh, profile |
| `user` | مدیریت کاربران | CRUD, roles |
| `workspace` | فضای کاری | CRUD, members, invitations |
| `engineering` | محاسبات مهندسی | calculate, calculators, history |
| `ai` | هوش مصنوعی | chat, embeddings, search |
| `knowledge` | مدیریت دانش | CRUD, versions, workflow |
| `marketplace` | بازارگاه | products, vendors, orders |
| `subscription` | اشتراک | plans, subscribe, cancel |
| `billing` | صورتحساب | invoices, payments, payment-methods |
| `project` | پروژه‌ها | CRUD, members, notes |
| `storage` | فایل‌ها | upload, list, versions |
| `notification` | اعلان‌ها | list, read, delete |
| `rbac` | نقش و مجوز | roles, permissions |
| `vision` | بینایی | (proxy به Vision Service) |
| `api-keys` | کلید API | CRUD |
| `webhooks` | وب‌هوک | subscribe, events |
| `admin` | مدیریت پلتفرم | dashboard, users, settings |
| `health` | سلامت | health, database, redis |
| `search` | جستجو | search, index |
| `standards` | استانداردها | CRUD |
| `consultations` | مشاوره | CRUD |
| `email` | ایمیل | send, templates |
| `feature-flags` | ویژگی‌ها | manage, check |

---

## معماری Vision Service

```mermaid
graph LR
    subgraph "Vision Service Pipeline"
        IN["Input\n(Image/PDF)"] --> PRE["Preprocessing"]
        PRE --> OCR["OCR Cascade"]
        OCR --> DET["Document Detection"]
        DET --> EXT["Data Extraction"]
        EXT --> VAL["Validation"]
        VAL --> OUT["Output"]
    end
```

### مراحل Pipeline

| Stage | کلاس‌ها | مسئولیت |
|-------|---------|----------|
| **Preprocessing** | Validator, Enhancer, Corrector, Deskew, Denoiser | آماده‌سازی تصویر |
| **OCR Cascade** | EasyOCR, Tesseract, VisionLLM | تشخیص متن با fallback |
| **Detection** | DocumentClassifier | تشخیص نوع سند (پلاک/قبض) |
| **Extraction** | NameplateExtractor, BillExtractor | استخراج داده‌های فنی |
| **Validation** | ValidationEngine, KnowledgeEngine | اعتبارسنجی و غنی‌سازی |

---

## معماری Engineering Service

```mermaid
graph TB
    subgraph "Engineering Service"
        API["API Layer\n(FastAPI)"] --> REG["Calculator Registry"]
        REG --> C1["Basic Calculators"]
        REG --> C2["Cable Calculators"]
        REG --> C3["Transformer Calculators"]
        REG --> C4["Protection Calculators"]
        REG --> C5["Power System Calculators"]
        REG --> C6["Power Quality Calculators"]
        REG --> C7["Renewable Calculators"]
    end
```

### Calculator Registry (Singleton)
- ثبت خودکار تمام ماشین‌حساب‌ها در زمان راه‌اندازی
- جستجوی ماشین‌حساب با کد یکتا
- Validation pipeline

---

## معماری AI Service

```mermaid
graph TB
    subgraph "AI Service"
        API["API Layer"] --> AR["Agent Registry"]
        API --> RP["RAG Pipeline"]
        API --> LLM["LLM Manager"]
        
        AR --> EE["Electrical Engineer Agent"]
        AR --> DA["Document Analyst Agent"]
        
        RP --> CH["Document Chunker"]
        RP --> EP["Embedding Pipeline"]
        RP --> VS["Vector Store\n(Qdrant)"]
        
        LLM --> G["Groq"]
        LLM --> O["OpenAI"]
        LLM --> OL["Ollama"]
    end
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| System Architecture | `architecture/SYSTEM_ARCHITECTURE.md` |
| Microservices | `architecture/MICROSERVICES.md` |
| NestJS Modules | `architecture/NESTJS_MODULES.md` |
| Vision Service | `services/vision-service.md` |
| Engineering Service | `services/engineering-service.md` |
| AI Service | `services/ai-service.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
