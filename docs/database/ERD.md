# نمودار ERD — Entity Relationship Diagram

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

نمودار ارتباط موجودیت‌ها (ERD) پلتفرم Xennic.

---

## Scope

۴۷ مدل Prisma در ۱۰ دامنه.

> نمودار کامل در `architecture/XENNIC_ERD_v1.md` با ۸۴۰ خط جزئیات موجود است.

---

## Core Entities

```mermaid
erDiagram
    users {
        uuid id PK
        string email UK
        string password
        string first_name
        string last_name
        boolean is_admin
        datetime created_at
        datetime deleted_at
    }
    
    workspaces {
        uuid id PK
        string code UK
        string name
        datetime created_at
        datetime deleted_at
    }
    
    workspace_members {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        string role
        datetime joined_at
    }
    
    users ||--o{ workspace_members : "belongs to"
    workspaces ||--o{ workspace_members : "has"
```

---

## Engineering Domain

```mermaid
erDiagram
    calculations {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        uuid project_id FK
        string type
        json inputs
        json results
        json knowledge
        string status
        datetime created_at
    }
    
    engineering_standards {
        uuid id PK
        string code UK
        string title
        string organization
        string version
    }
    
    workspaces ||--o{ calculations : "contains"
    users ||--o{ calculations : "performs"
```

---

## Knowledge Domain

```mermaid
erDiagram
    knowledge {
        uuid id PK
        uuid workspace_id FK
        string slug UK
        string status
        string visibility
        string language
        int version
        json content
        datetime created_at
    }
    
    knowledge_translations {
        uuid id PK
        uuid knowledge_id FK
        string language
        string title
        json content
    }
    
    knowledge_versions {
        uuid id PK
        uuid knowledge_id FK
        int version
        json snapshot
        datetime created_at
    }
    
    knowledge_workflows {
        uuid id PK
        uuid knowledge_id FK UK
        string current_status
        uuid assigned_to FK
        uuid reviewer_id FK
    }
    
    knowledge ||--o{ knowledge_translations : "has"
    knowledge ||--o{ knowledge_versions : "has"
    knowledge ||--o| knowledge_workflows : "has"
```

---

## Subscription Domain

```mermaid
erDiagram
    plans {
        uuid id PK
        string name
        string slug UK
        decimal monthly_price
        decimal yearly_price
        json features
    }
    
    subscriptions {
        uuid id PK
        uuid workspace_id FK
        uuid plan_id FK
        string status
        datetime starts_at
        datetime ends_at
    }
    
    plans ||--o{ subscriptions : "has"
    workspaces ||--o{ subscriptions : "has"
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Database Design | `database/DATABASE_DESIGN.md` |
| Indexing | `database/INDEXING.md` |
| ERD Spec | `architecture/XENNIC_ERD_v1.md` |
| Database Spec | `architecture/XENNIC_DATABASE_SPEC_v2.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
