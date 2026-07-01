# پایگاه داده برداری — Vector Database

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

پایگاه داده برداری (Vector Database) پلتفرم Xennic را توصیف می‌کند.

---

## Scope

Qdrant integration, collections, indexing, search.

---

## Architecture

| مؤلفه | مقدار |
|--------|-------|
| Engine | Qdrant |
| Version | latest |
| Port | ۶۳۳۳ |
| Protocol | gRPC (HTTP API also available) |
| Deployment | Docker (workspace/docker-compose.yml) |

---

## Collections

| Collection | Dimension | Distance | Index |
|------------|-----------|----------|-------|
| `xennic_knowledge` | ۳۸۴ | Cosine | HNSW |
| `documents` | ۳۸۴ | Cosine | HNSW |

---

## Document Schema

```json
{
  "id": "uuid",
  "vector": [0.1, 0.2, ...],
  "payload": {
    "content": "متن سند...",
    "source": "filename.pdf",
    "workspace_id": "ws-uuid",
    "chunk_index": 3,
    "total_chunks": 10,
    "metadata": {
      "title": "عنوان سند",
      "author": "نویسنده",
      "created_at": "2026-06-23T10:00:00Z"
    }
  }
}
```

---

## Filtering

```python
# Workspace isolation filter
query_filter = Filter(
    must=[
        FieldCondition(
            key="workspace_id",
            match=MatchValue(value="ws-uuid")
        ),
    ]
)
```

---

## Search Parameters

| پارامتر | مقدار | توضیح |
|-----------|-------|--------|
| limit | ۵ | تعداد نتایج |
| offset | ۰ | page |
| score_threshold | ۰.۷ | حداقل شباهت |
| with_payload | true | برگرداندن metadata |

---

## Index Configuration (HNSW)

```python
# HNSW parameters
hnsw_config = HnswConfigDiff(
    m=16,              # Number of bi-directional links
    ef_construct=100,  # Search breadth during indexing
    full_scan_threshold=10000,  # Full scan threshold
)
```

---

## Performance

| معیار | مقدار |
|-------|-------|
| Search Latency | < ۵۰ms |
| Index Build Time | ۱۰۰۰ docs/s |
| Storage per Vector | ۱.۵KB (with payload) |
| Max Vectors per Collection | ~۱M (on single node) |

---

## Related Documents

| سند | مسیر |
|-----|------|
| RAG Architecture | `ai/RAG_ARCHITECTURE.md` |
| Embedding Pipeline | `ai/EMBEDDING_PIPELINE.md` |
| AI Engine | `ai/AI_ENGINE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
