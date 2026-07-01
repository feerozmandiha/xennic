# راهبرد عملکرد — Performance Strategy

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Batch Processing — پردازش دسته‌ای

| Operation | Batch Size | Rationale |
|-----------|-----------|-----------|
| **Embedding** | 32–64 chunks | GPU memory efficiency, maximum throughput per inference call |
| **Validation** | 10 documents per batch | Cross-reference consistency checks across documents |
| **Publication (Vector DB)** | 1000 vectors max per batch | Qdrant bulk upsert optimal payload size |
| **Publication (Graph DB)** | 500 nodes + edges per batch | Neo4j/Age bulk write limits |

**Optimal Batch Sizes — اندازه‌های بهینه دسته**

| Processor | Optimal Batch Size | Unit | Notes |
|-----------|-------------------|------|-------|
| Embedding Generator | 64 | chunks | Measured on NVIDIA A10G |
| Publication Service | 100 | documents | MinIO + API throughput balanced |
| Validation Service | 10 | documents | Cross-document reference checks |
| Concept Resolver | 32 | documents | AI Service gRPC batch limit |

---

## 2. Parallel Processing — پردازش موازی

| Parallelism Level | Scope | Mechanism | Configuration |
|-------------------|-------|-----------|---------------|
| **Document-level** | Multiple documents concurrently | Worker pool per processor (configurable) | `WORKER_COUNT = 4–16` |
| **Stage-level** | Independent stages per document | Async execution within processing pipeline | Orchestrator DAG scheduler |
| **Chunk-level** | Embedding of multiple chunks | Batch embeddings in parallel per document | Batch size 64 |
| **Model-level** | Multiple models active | Separate worker pools per model | `MODEL_PARALLELISM = true` |

**Configurable Worker Pools — استخرهای کارگری قابل تنظیم**

| Processor | Default Workers | Min Workers | Max Workers | Scale Trigger |
|-----------|----------------|-------------|-------------|---------------|
| Ingestion | 4 | 2 | 16 | Queue depth > 500 |
| OCR | 2 | 1 | 8 | GPU utilization < 80% |
| Parser | 8 | 4 | 32 | Queue depth > 1000 |
| Metadata | 4 | 2 | 16 | Queue depth > 500 |
| Concept Resolver | 4 | 2 | 16 | AI Service latency |
| Entity Extractor | 4 | 2 | 16 | Queue depth > 500 |
| Embedding Generator | 2 | 1 | 8 | GPU memory available |
| Validation | 4 | 2 | 16 | Queue depth > 500 |
| Publication | 4 | 2 | 16 | Target throughput |

---

## 3. Incremental Processing — پردازش افزایشی

| Strategy | Scope | Detection Method | Action |
|----------|-------|------------------|--------|
| **Smart Reprocessing** | Changed documents only | Checksum comparison (SHA-256 of raw content) | Skip unchanged documents |
| **Incremental Embedding** | New chunks only | Chunk hash tracking in metadata | Embed new chunks, keep existing |
| **Incremental Graph Update** | New/changed entities | Entity version in graph DB | MERGE operations (no full rebuild) |
| **Change Detection** | Journal-based | Event log of source changes | Trigger re-ingestion pipeline |

**Change Detection Methods — روش‌های تشخیص تغییر**

| Method | Granularity | Overhead | Use Case |
|--------|-------------|----------|----------|
| SHA-256 checksum | Entire document | Low (single hash) | Standard re-import |
| Journal tracking | Per-event | Medium (event log) | Crawler-based sources |
| Version header | Per-document | None (already present) | API uploads with version field |
| Size + timestamp | Quick heuristic | Minimal | First-pass filter before checksum |

---

## 4. Lazy Embedding — Embedding تنبل

| Priority Level | Behavior | Queue |
|----------------|----------|-------|
| **High Priority** | Embed immediately upon chunk generation | Direct processing queue |
| **Normal Priority** | Embed within 5 minutes | Standard batch queue |
| **Low Priority** | Queue for off-peak batch (nightly) | Scheduled batch job |
| **On-Demand** | Embed when first queried if not already embedded | Query-triggered embedding |

**Embedding Cache Levels — سطوح کش Embedding**

| Cache | Storage | TTL | Hit Rate Target |
|-------|---------|-----|-----------------|
| **Hot** | Redis | 1 hour | Frequent query reuse |
| **Primary** | Qdrant (persistent) | Forever | All published chunks |
| **Cold** | MinIO (parquet backup) | Archival | Disaster recovery |

---

## 5. Caching Strategy — راهبرد کش

| Cache | Content | Storage | TTL | Invalidation |
|-------|---------|---------|-----|-------------|
| **Metadata Cache** | Document metadata (title, source, tier, stage) | Redis | 1 hour | On publication / update |
| **Taxonomy Cache** | Canonical concept tree, entity types | In-process memory | Refresh on change (event-driven) | Taxonomy update event |
| **Embedding Hot Cache** | Frequently queried embeddings | Redis | 1 hour | LRU eviction, TTL expiry |
| **Parser Cache** | Parsed document structure | In-process (per pipeline) | Document scope | Released after processing |
| **Validation Rules Cache** | Active validation rules | Redis | 5 minutes | Rule update event |

**Cache Invalidation Events — رویدادهای باطل‌سازی کش**

| Event | Cache Affected | Strategy |
|-------|----------------|----------|
| Document published | Metadata cache (document) | Delete specific key |
| Taxonomy updated | Taxonomy cache | Broadcast invalidation event |
| Embedding model changed | Embedding hot cache | Flush entire cache |
| Validation rule changed | Validation rules cache | Refresh on next validation |
| Source re-crawled | Metadata cache (source group) | Delete by source pattern |

---

## 6. Memory Optimization — بهینه‌سازی حافظه

| Strategy | Implementation | Benefit |
|----------|---------------|---------|
| **Streaming Processing** | Process document as stream; never load entire file | Handles 100MB+ documents |
| **Memory Budget** | Configurable per processor (default: 512MB) | Prevents OOM in shared environments |
| **Garbage Collection Tuning** | Generational GC for Python/TypeScript | Reduced pause times for long-running processors |
| **OOM Protection** | Document-level isolation; fail single doc not processor | Graceful degradation |
| **Shared Memory Pool** | Inter-process shared memory for parsed artifacts | Reduced duplication between stages |

**Memory Budget per Processor — بودجه حافظه هر پردازشگر**

| Processor | Default Budget | Max Budget | Memory Profile |
|-----------|---------------|------------|----------------|
| Ingestion | 256 MB | 1 GB | Transient, small footprint |
| OCR | 1 GB | 4 GB | Image processing heavy |
| Parser | 512 MB | 2 GB | Document structure in memory |
| Metadata | 256 MB | 1 GB | Lightweight |
| Concept Resolver | 1 GB | 4 GB | LLM context window |
| Entity Extractor | 1 GB | 4 GB | LLM context window |
| Embedding Generator | 2 GB | 8 GB | Model weights + batch |
| Validation | 512 MB | 2 GB | Rule engine |
| Publication | 512 MB | 2 GB | Batch buffer |

---

## 7. CPU Strategy — راهبرد پردازنده

| Processor | CPU Profile | Recommendation |
|-----------|------------|----------------|
| **Parser** | CPU-bound (PDF parsing, layout analysis) | Multi-core, 4+ vCPUs |
| **Cleaner** | CPU-bound (regex, text normalization) | Multi-core, 2+ vCPUs |
| **Chunk Generator** | CPU-bound (sentence splitting, tokenization) | Multi-core, 2+ vCPUs |
| **Metadata Builder** | Lightweight | 1 vCPU |
| **Validation Engine** | Mixed | 2+ vCPUs |

**Threading Model — مدل نخ‌بندی**

| Level | Parallelism | Implementation |
|-------|-------------|---------------|
| Per-document | Multi-threaded per document | One thread per stage per document |
| Per-processor | Multiple documents concurrently | Worker pool (multi-process) |
| Per-model | Separate processes per model | Independent sub-processes |

**CPU Quota Configuration — پیکربندی سهمیه CPU**

| Processor Type | CPU Request | CPU Limit | Priority |
|----------------|-------------|-----------|----------|
| Online processors | 2 cores | 4 cores | High |
| Batch processors | 1 core | 2 cores | Low |
| Crawler processors | 0.5 core | 1 core | Background |
| Maintenance tasks | 0.5 core | 1 core | Idle |

---

## 8. GPU Strategy — راهبرد پردازنده گرافیکی

| Processor | GPU Requirement | Model | VRAM |
|-----------|----------------|-------|------|
| Embedding Generator | Required | `intfloat/multilingual-e5-large` | 2 GB |
| OCR (GPU-accelerated) | Optional | Tesseract + GPU backend | 1 GB |
| AI Service (LLM) | Required (shared) | Llama/Mistral (via AI Service) | Shared pool |

**GPU Memory Management — مدیریت حافظه GPU**

| Technique | Description | Benefit |
|-----------|-------------|---------|
| **Batch Embedding** | Process 64 chunks per inference call | Near 100% GPU utilization |
| **Memory Pooling** | Reuse GPU memory across batches | Reduce allocation overhead |
| **Gradient Checkpointing** | Offload activations to CPU | Fit larger models in smaller VRAM |
| **Mixed Precision** | FP16 inference | 2x throughput, half VRAM |

**GPU Queue Strategy — راهبرد صف GPU**

| Queue Type | Priority | Scheduling | Description |
|------------|----------|------------|-------------|
| **Real-time** | High | Immediate | Online embedding requests (API queries) |
| **Batch** | Normal | FIFO | Standard processing pipeline |
| **Off-peak** | Low | Scheduled | Nightly re-embedding jobs |

**Fallback Strategy — راهبرد جایگزین**

| Condition | Action | Performance Impact |
|-----------|--------|-------------------|
| GPU unavailable | Switch to CPU-based embedding model | 10–20x slower |
| GPU memory full | Reduce batch size dynamically | Gradual throughput reduction |
| GPU queue full | Spill to CPU queue | Mixed performance |
| Multi-GPU available | Shard by model or batch | Linear throughput scaling |

---

## 9. Performance Targets — اهداف عملکرد

| Operation | P50 | P95 | P99 | Max (Hard Limit) |
|-----------|-----|-----|-----|------------------|
| File Validation | 100ms | 500ms | 1s | 2s |
| OCR (10 pages) | 10s | 30s | 60s | 120s |
| PDF Parsing | 2s | 10s | 30s | 60s |
| Metadata Building | 500ms | 2s | 5s | 10s |
| Concept Resolution | 3s | 15s | 45s | 90s |
| Entity Extraction | 5s | 20s | 60s | 120s |
| Relationship Extraction | 5s | 20s | 60s | 120s |
| Embedding (100 chunks) | 5s | 15s | 30s | 60s |
| Vector Publication | 2s | 10s | 30s | 60s |
| Graph Publication | 3s | 15s | 45s | 90s |
| Knowledge API Publication | 1s | 5s | 15s | 30s |
| **End-to-End (Text, ≤ 50 pg)** | **30s** | **120s** | **300s** | **600s** |
| **End-to-End (Scanned, 10 pg)** | **60s** | **240s** | **600s** | **900s** |
| **End-to-End (Large, > 500 pg)** | **300s** | **900s** | **1800s** | **3600s** |

**Latency Budget per Stage — بودجه تأخیر هر مرحله**

| Phase | Budget (%) | Budget (s) | Cumulative (s) |
|-------|-----------|------------|----------------|
| Ingestion | 5% | 1.5s | 1.5s |
| OCR (if scanned) | 30% | 9s | 10.5s |
| Parsing | 10% | 3s | 13.5s |
| Cleaning | 3% | 0.9s | 14.4s |
| Metadata | 5% | 1.5s | 15.9s |
| Concept Resolution | 10% | 3s | 18.9s |
| Entity Extraction | 10% | 3s | 21.9s |
| Relationship Extraction | 7% | 2.1s | 24s |
| Validation | 5% | 1.5s | 25.5s |
| Chunk Generation | 3% | 0.9s | 26.4s |
| Embedding | 8% | 2.4s | 28.8s |
| Publication | 4% | 1.2s | 30s |

---

## 10. Resource Estimation — تخمین منابع

**Per-Processor Resource Profile — نیمرخ منابع هر پردازشگر**

| Processor | vCPU | RAM | GPU | Storage |
|-----------|------|-----|-----|---------|
| Ingestion Service | 2 | 256 MB | — | 10 GB (logs) |
| OCR Service | 4 | 1 GB | Optional (1 GB) | 50 GB (temp files) |
| Parser Service | 4 | 512 MB | — | 20 GB (logs) |
| Metadata Service | 1 | 256 MB | — | 5 GB (logs) |
| Concept Resolver | 2 | 1 GB | — | 10 GB (model cache) |
| Entity Extractor | 2 | 1 GB | — | 10 GB (model cache) |
| Relationship Extractor | 2 | 1 GB | — | 10 GB (model cache) |
| Chunk Generator | 2 | 512 MB | — | 5 GB (logs) |
| Embedding Generator | 2 | 2 GB | 2 GB (VRAM) | 20 GB (model cache) |
| Validation Service | 2 | 512 MB | — | 10 GB (logs) |
| Publication Service | 2 | 512 MB | — | 10 GB (logs) |
| Orchestrator | 1 | 256 MB | — | 5 GB (state) |
| Event Bus (RabbitMQ) | 4 | 4 GB | — | 50 GB (persistent) |
