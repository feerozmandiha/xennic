# Critical Path — Production Certification

> **Also see `docs/PROJECT_BOOTSTRAP.md` for the complete project bootstrap context including dependency chain, module registry, and architecture.**

**Updated:** 2026-07-05 (Sprint K4)

## Current Status

```
[Document Upload] ──> [Knowledge Factory] ──> [OCR/Parsing] ──> [Normalization]
     ✅ (K1)              ✅ (K1)               ✅ (K1)              ✅ (K1)

[Normalization] ──> [Chunking] ──> [Embedding] ──> [Publishing]
     ✅ (K1)           ⚠️ (external)      ⚠️ (external)      ✅ (K1)

[Publishing] ──> [Semantic Event Bus] ──> [Graph Update] ──> [Metrics]
     ✅ (K1)            ✅ (K2)               ✅ (K2)             ✅ (K2)

[Metrics] ──> [Hybrid Search] ──> [AI Cache Invalidation]
   ✅ (K2)         ⚠️ (needs Qdrant)      ✅ (K2)
```

## Legend

- ✅ = Production-ready (tested and validated)
- ⚠️ = Requires external service (validated with mocks)
- 🚧 = Not yet implemented

## Dependency Chain

### Layer 1: Infrastructure

```
PostgreSQL 17  ─── Prisma ORM ─── All Modules ✅
Redis 8        ─── BullMQ ─── Knowledge Queue ✅
RabbitMQ 4     ─── (future event streaming)
Qdrant         ─── Hybrid Search (needs live instance)
MinIO          ─── Document Storage (configured, not in base compose)
```

### Layer 2: Microservices

```
Engineering Service (8001) ─── 80+ calculators, health endpoint ✅
Vision Service (8003)      ─── PaddleOCR + LLM, health endpoint ✅
AI Service (8002)          ─── LLM orchestration, health endpoint ✅
```

### Layer 3: API Gateway

```
NestJS API (3000) ─── Fastify, RBAC, Swagger, circuit breaker ✅
Engineering Module ─── Circuit breaker + retry + correlation ID ✅
Knowledge Module  ─── CRUD + publish + search with workspace isolation ✅
Search Module     ─── Hybrid search (Qdrant-backed) ⚠️
```

### Layer 4: Event Integration

```
DomainEventPublisher ─── Outbox pattern ✅
SemanticEventBus     ─── Publish/subscribe ✅
OutboxRelayService   ─── Polling relay (5s interval) ✅
DocumentPublishedHandler ─── Graph node + metrics ✅
CacheInvalidationHandler ─── AI Runtime cache clear ✅
```

## Roadmap to Enterprise AI

### Pre-requisites (Sprint K4 certified)

1. ✅ Knowledge lifecycle integration tests
2. ✅ Engineering gateway validation (circuit breaker, retry, correlation ID)
3. ✅ Semantic event bus with 12 events
4. ✅ Workspace membership hardened (Guard + RBAC sync + ownership transfer)
5. ✅ Infrastructure validation scripts
6. 📋 Performance baseline (requires production load)
7. 📋 OpenAPI generation fix (pre-existing issue)

### Next: Enterprise AI Development

1. AI agents integration with event bus
2. Multi-step reasoning pipelines
3. Copilot features on engineering calculator results
4. Automated knowledge graph enrichment
