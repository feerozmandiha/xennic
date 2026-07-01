# زنجیره شواهد — Evidence Chain Architecture

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Evidence Chain Structure — ساختار زنجیره شواهد

```
Question → Reasoning Step 1 → Reasoning Step 2 → Conclusion
              ↓                    ↓                  ↓
           Source A              Source B        Source A + B
           (Tier 1)              (Tier 2)        (Score: 0.92)
```

هر زنجیره شواهد یک گراف جهت‌دار غیرمدور (DAG) است که مسیر استدلال از سوال تا نتیجه نهایی را نشان می‌دهد:

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ Question │────→│ Reasoning    │────→│ Reasoning    │────→│Conclusion │
│ Node     │     │ Step 1       │     │ Step 2       │     │ Node      │
└──────────┘     └──────┬───────┘     └──────┬───────┘     └──────────┘
                        │                     │
                        ▼                     ▼
                 ┌──────────────┐     ┌──────────────┐
                 │ Evidence     │     │ Evidence     │
                 │ Node A       │     │ Node B       │
                 │ (Tier 1)     │     │ (Tier 2)     │
                 └──────────────┘     └──────────────┘
```

---

## Chain Components — اجزای زنجیره

### 1. Evidence Node — گره شواهد

یک قطعه از دانش که از پایگاه دانش بازیابی شده است.

| فیلد | نوع | الزام | توضیح | مثال |
|------|-----|-------|-------|------|
| `id` | UUID | ✅ | شناسه یکتای گره | `ev-a1b2c3d4` |
| `content` | Text | ✅ | متن شواهد (چانک) | "جریان مجاز کابل ۲۵mm² مس: ۱۱۰A" |
| `source_document` | String | ✅ | سند مبدأ | `IEC 60364-5-52:2022` |
| `source_tier` | Integer | ✅ | تایر منبع (1-5) | `1` |
| `page_number` | Integer | Optional | شماره صفحه در سند مبدأ | `42` |
| `chunk_id` | String | ✅ | شناسه چانک در Qdrant | `chunk-iec-60364-5-52-0042` |
| `timestamp` | DateTime | ✅ | زمان بازیابی | `2025-06-20T10:30:00Z` |
| `retrieval_score` | Float | ✅ | امتیاز بازیابی (0.0-1.0) | `0.94` |

### 2. Reasoning Link — پیوند استدلال

ارتباط بین دو گره که نشان‌دهنده یک گام استدلال است.

| فیلد | نوع | الزام | توضیح | مثال |
|------|-----|-------|-------|------|
| `from_node` | UUID | ✅ | گره مبدأ (شواهد یا نتیجه میانی) | `ev-a1b2c3d4` |
| `to_node` | UUID | ✅ | گره مقصد (نتیجه میانی یا نهایی) | `conc-001` |
| `reasoning_mode` | Enum | ✅ | حالت استدلال | `deductive` |
| `rule_applied` | String | ✅ | قاعده یا مرجع استفاده شده | "IEC 60364-5-52 §4.2 جدول 4" |
| `confidence` | Float | ✅ | امتیاز اطمینان این پیوند (0.0-1.0) | `0.95` |
| `description` | Text | Optional | توضیح استدلال | "اعمال ضریب تصحیح دما از ISIRI 1234" |

### 3. Conclusion Node — گره نتیجه

نتیجه نهایی زنجیره استدلال.

| فیلد | نوع | الزام | توضیح | مثال |
|------|-----|-------|-------|------|
| `answer` | Text | ✅ | پاسخ نهایی تولید شده | "جریان مجاز: ۹۵.۷A" |
| `aggregated_confidence` | Float | ✅ | امتیاز اطمینان ترکیبی | `0.92` |
| `chain_id` | UUID | ✅ | شناسه یکتای زنجیره | `chain-001` |
| `timestamp` | DateTime | ✅ | زمان تولید نتیجه | `2025-06-20T10:30:05Z` |
| `linked_nodes` | Array[UUID] | ✅ | تمام گره‌های زنجیره | `["ev-a1b2c3d4", "ev-e5f6g7h8", "step-01"]` |

---

## Chain Rules — قوانین زنجیره

| قانون | توضیح | پیامد نقض |
|-------|-------|----------|
| **Minimum Evidence** | هر نتیجه حداقل یک گره شواهد داشته باشد | زنجیره نامعتبر است |
| **Acyclicity** | زنجیره باید غیرمدور باشد (DAG) | شناسایی و قطع حلقه |
| **Confidence Propagation** | اطمینان نهایی = حاصلضرب اطمینان تمام پیوندها × حداقل اطمینان تایر منابع | محاسبه خودکار |
| **Confidence Floor** | اگر هر پیوندی < 0.3 → کل زنجیره مشکوک | پرچم "Suspect Chain" |
| **Source Coverage** | هر گام استدلال حداقل یک منبع داشته باشد | گام نامعتبر |
| **Contradiction Check** | دو شاهد متضاد در یک زنجیره مجاز نیست | تشخیص و گسیختگی |

### فرمول اطمینان زنجیره

```
Chain Confidence = (∏ Link Confidence) × min(Source Tier Confidence)

Where:
  Link Confidence    = confidence of each reasoning link in the chain
  Source Confidence  = confidence derived from source tier:
                       Tier 1 → 1.0, Tier 2 → 0.9, Tier 3 → 0.75,
                       Tier 4 → 0.6, Tier 5 → 0.4
```

**مثال:**
```
Chain: Evidence A (Tier 1) → Link 1 (0.95) → Step 1 → Link 2 (0.90) → Conclusion
Chain Confidence = (0.95 × 0.90) × min(1.0) = 0.855
```

---

## Chain States — وضعیت‌های زنجیره

| وضعیت | توضیح | کد |
|-------|-------|-----|
| **Valid** | تمام قوانین رعایت شده | `valid` |
| **Incomplete** | حداقل یک گره شواهد وجود ندارد | `incomplete` |
| **Suspect** | یک یا چند پیوند < 0.3 | `suspect` |
| **Cyclic** | حلقه در زنجیره شناسایی شده | `cyclic` |
| **Contradictory** | شواهد متضاد در زنجیره | `contradictory` |
| **Expired** | یکی از منابع تاریخ مصرف گذشته | `expired` |

---

## Serialization Format — فرمت سریال‌سازی

### JSON Structure for Evidence Chain Storage

```json
{
  "chain_id": "chain-001",
  "question": "جریان نامی مجاز کابل مسی ۲۵mm² در دمای ۴۰°C چقدر است؟",
  "question_hash": "sha256:abc123...",
  "status": "valid",
  "created_at": "2025-06-20T10:30:05Z",
  "nodes": [
    {
      "node_id": "ev-a1b2c3d4",
      "node_type": "evidence",
      "content": "جریان مجاز کابل ۲۵mm² مس در هوای آزاد: ۱۱۰A",
      "source_document": "IEC 60364-5-52:2022",
      "source_tier": 1,
      "chunk_id": "chunk-iec-60364-5-52-0042",
      "retrieval_score": 0.94,
      "timestamp": "2025-06-20T10:30:00Z"
    },
    {
      "node_id": "ev-e5f6g7h8",
      "node_type": "evidence",
      "content": "ضریب تصحیح دما برای ۴۰°C: 0.87",
      "source_document": "ISIRI 1234:1403",
      "source_tier": 1,
      "chunk_id": "chunk-isiri-1234-0078",
      "retrieval_score": 0.91,
      "timestamp": "2025-06-20T10:30:01Z"
    },
    {
      "node_id": "step-01",
      "node_type": "intermediate",
      "content": "جریان پایه = ۱۱۰A × ضریب ۰.۸۷ = ۹۵.۷A",
      "timestamp": "2025-06-20T10:30:03Z"
    }
  ],
  "links": [
    {
      "from_node": "ev-a1b2c3d4",
      "to_node": "step-01",
      "reasoning_mode": "deductive",
      "rule_applied": "IEC 60364-5-52 §4.2 Table 4",
      "confidence": 0.95,
      "description": "استخراج جریان پایه از استاندارد IEC"
    },
    {
      "from_node": "ev-e5f6g7h8",
      "to_node": "step-01",
      "reasoning_mode": "deductive",
      "rule_applied": "ISIRI 1234 §7.1 Table 2",
      "confidence": 0.90,
      "description": "اعمال ضریب تصحیح دما"
    },
    {
      "from_node": "step-01",
      "to_node": "conclusion-001",
      "reasoning_mode": "deductive",
      "rule_applied": "ضرب جریان پایه در ضریب تصحیح",
      "confidence": 1.0,
      "description": "محاسبه نهایی"
    }
  ],
  "conclusion": {
    "node_id": "conclusion-001",
    "answer": "جریان نامی مجاز کابل مسی ۲۵mm² در دمای ۴۰°C برابر ۹۵.۷ آمپر است.",
    "aggregated_confidence": 0.855,
    "confidence_breakdown": {
      "product_of_links": 0.855,
      "min_source_confidence": 1.0,
      "chain_confidence": 0.855
    },
    "limitations": [
      "ضریب تصحیح گروه کابل در نظر گرفته نشده",
      "فرض نصب در هوای آزاد"
    ],
    "timestamp": "2025-06-20T10:30:05Z"
  }
}
```

### API Response Format

```json
{
  "success": true,
  "data": {
    "answer": "جریان نامی مجاز کابل مسی ۲۵mm² در دمای ۴۰°C برابر ۹۵.۷ آمپر است.",
    "confidence": 0.855,
    "chain": {
      "chain_id": "chain-001",
      "status": "valid",
      "evidence_count": 2,
      "reasoning_steps": 3
    }
  },
  "meta": {
    "chain_url": "/api/v1/ai/chains/chain-001",
    "processing_time_ms": 1247
  }
}
```

---

## Chain Storage — ذخیره‌سازی زنجیره

| مؤلفه | مقصد ذخیره‌سازی | فرمت | مدت نگهداری |
|-------|----------------|------|------------|
| **Full Chain** | PostgreSQL (JSONB) | ساختار کامل JSON | ۹۰ روز |
| **Chain Index** | Redis | Chain ID → Status | ۴۸ ساعت |
| **Audit Log** | PostgreSQL | Append-only | ۱ سال |
| **Cache** | Redis | پاسخ نهایی | ۱ ساعت |

---

## Chain Operations — عملیات زنجیره

### Chain Merge

زمانی که دو زنجیره به یک نتیجه واحد می‌رسند:

| شرط | رفتار |
|-----|-------|
| منابع یکسان | ادغام خودکار با بالاترین امتیاز |
| منابع مکمل | ادغام با افزایش Consensus Confidence |
| منابع متضاد | عدم ادغام — ثبت به عنوان Conflicting Chains |

### Chain Re-verification

بررسی دوره‌ای validity زنجیره‌های ذخیره شده:

- هفته‌ای یکبار: بررسی تغییرات در منابع ارجاع داده شده
- ماهانه: به‌روزرسانی Temporal Confidence
- در صورت بروزرسانی منبع: بازبینی خودکار زنجیره‌های affected
