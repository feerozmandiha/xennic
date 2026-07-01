# Xennic Knowledge Factory (XKF) — Evolution Roadmap

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Development Phases

```
Phase 1       Phase 2       Phase 3       Phase 4       Phase 5
Foundation    Core Pipeline Graph RAG      Reasoning     Autonomous
  (Q3 2026)    (Q4 2026)    (Q1 2027)     (Q2 2027)     (Q3 2027)
     │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼
  ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐
  │Intake│     │Extract│    │Graph  │     │Reason│     │Self  │
  │Pars+ │     │Resolve│    │Construct│   │Engine│     │Optim │
  │Class │     │Normal │    │Graph RAG│   │Confid│     │Learn │
  └──────┘     └──────┘     └──────┘     └──────┘     └──────┘
```

---

## 2. Phase 1: Foundation (Q3 2026)

### Goal: Core ingestion pipeline capable of processing PDF documents

### Deliverables

| Component | Type | Notes |
|-----------|------|-------|
| Intake Service | Microservice | File upload, validation, staging |
| Classify Service | Microservice | Document type + domain classification |
| Parse Service | Microservice | PDF text extraction (OCR for scanned) |
| Chunk Service | Microservice | Semantic chunking strategy |
| Embed Service | Microservice | Basic embedding with e5-large |
| Publish Service | Microservice | Write to vector store |
| Quality Gate (basic) | Microservice | Format validation, completeness check |
| Event bus (RabbitMQ) | Infrastructure | Already configured, wire into factory |

### Key Milestones
- [ ] Single document end-to-end pipeline operational
- [ ] EKO created and stored in Qdrant
- [ ] Basic search and retrieval from NestJS
- [ ] Pipeline monitoring (Prometheus metrics)

### Dependencies
- RabbitMQ configured and accessible (exists)
- Qdrant configured and accessible (exists)
- AI Service with extraction endpoints (exists, needs extension)
- Governance documents finalized (done)

---

## 3. Phase 2: Core Pipeline (Q4 2026)

### Goal: Full extraction, resolution, and normalization pipeline

### Deliverables

| Component | Type | Notes |
|-----------|------|-------|
| Extract Service | Microservice | Entity, concept, relation extraction |
| Resolve Service | Microservice | Canonical concept mapping |
| Normalize Service | Microservice | Unit conversion, term standardization |
| Enrich Service | Microservice | Cross-reference, summarization |
| Human Review API | NestJS extension | Review queue, approval workflow |
| Version Manager | Library | EKO version tracking and supersession |
| Quality Gate (full) | Microservice | All 5 gates with scoring |

### Key Milestones
- [ ] All 10 factory services operational
- [ ] Human review workflow integrated
- [ ] EKO versioning and lifecycle management
- [ ] Pipeline re-processing capability

### Dependencies
- Concept registry operational (need `concept-registry.md` implementation)
- AI Service extraction endpoints (need development)
- Human review UI in web app (need frontend development)

---

## 4. Phase 3: Graph RAG (Q1 2027)

### Goal: Knowledge graph integration and hybrid retrieval

### Deliverables

| Component | Type | Notes |
|-----------|------|-------|
| Knowledge Graph | Store | Neo4j or custom graph database |
| Graph Construction | Pipeline stage | Entity→graph node, relation→edge |
| Graph Traversal | Service | Query→graph paths |
| Hybrid Fusion | Service | RRF merge of vector + graph results |
| Re-ranker | Service | Cross-encoder reranking of results |

### Key Milestones
- [ ] Knowledge graph populated from existing EKOs
- [ ] Hybrid search returning better results than vector-only
- [ ] Graph visualization in knowledge explorer UI
- [ ] Query analyzer distinguishing graph vs vector queries

### Dependencies
- Phase 2 pipeline fully operational
- Graph database selected and deployed
- Semantic concept registry mature

---

## 5. Phase 4: Reasoning (Q2 2027)

### Goal: AI reasoning runtime consuming factory knowledge

### Deliverables

| Component | Type | Notes |
|-----------|------|-------|
| Context Builder | Reasoning stage | Assemble relevant context from query |
| Knowledge Selector | Reasoning stage | Choose vector vs graph vs both |
| Evidence Collector | Reasoning stage | Gather supporting evidence for claims |
| Reasoning Engine | Microservice | Multi-mode reasoning (see reasoning-modes.md) |
| Constraint Checker | Microservice | Validate against engineering constraints |
| Formula Evaluator | Microservice | Execute mathematical formulas |
| Conflict Resolver | Microservice | Resolve contradictions per source hierarchy |
| Confidence Engine | Microservice | Compute answer confidence (see confidence-scoring.md) |
| Citation Generator | Microservice | Generate cited answer with provenance |

### Key Milestones
- [ ] End-to-end reasoning pipeline operational
- [ ] Engineering question → cited answer flow
- [ ] Conflict resolution producing correct results
- [ ] Confidence scores calibrated against human evaluation

### Dependencies
- Phase 3 hybrid retrieval operational
- LLM provider selected and integrated
- Formula engine capable of executing engineering calculations

---

## 6. Phase 5: Autonomous (Q3 2027)

### Goal: Self-improving, adaptive knowledge factory

### Deliverables

| Feature | Description |
|---------|-------------|
| Active learning | Identify low-confidence EKOs and prioritize them for human review |
| Automatic re-embedding | Detect embedding model drift; re-embed on schedule |
| Quality feedback loop | Use query success/failure to improve extraction quality |
| Adaptive chunking | Adjust chunk size based on content type and retrieval performance |
| Anomaly detection | Detect unusual patterns in document ingestion or query behavior |
| Self-healing | Auto-retry failed pipeline stages with modified parameters |

### Key Milestones
- [ ] Factory operates with <5% human review rate
- [ ] Automatic model upgrade without data loss
- [ ] Quality metrics improving month over month
- [ ] <1% hallucination rate in AI answers

---

## 7. Phase 6: Federation (Q4 2027+)

### Goal: Multi-factory, cross-organization knowledge sharing

| Feature | Description |
|---------|-------------|
| Knowledge federation | Share curated EKOs across workspace boundaries |
| Cross-organization search | Search across federated knowledge bases |
| Publisher network | Organizations contribute to shared knowledge pools |
| Usage-based billing | Per-EKO consumption metering |
| Marketplace for knowledge | Buy/sell engineering knowledge objects |

---

## 8. Dependencies Map

```
Phase 1
  │
  ├── AI Service         (depends on: LLM provider)
  ├── Qdrant             (depends on: infrastructure)
  ├── RabbitMQ           (depends on: infrastructure - EXISTS)
  └── Governance docs    (depends on: knowledge team - DONE)
       │
       ▼
Phase 2
  │
  ├── Concept Registry   (depends on: knowledge team)
  ├── AI Extraction API  (depends on: AI team)
  └── Human Review UI    (depends on: frontend team)
       │
       ▼
Phase 3
  │
  ├── Graph DB           (depends on: infrastructure)
  └── Cross-encoder      (depends on: AI/ML team)
       │
       ▼
Phase 4
  │
  ├── LLM Infrastructure (depends on: AI/ML team)
  ├── Formula Engine     (depends on: engineering team)
  └── Confidence Model   (depends on: AI/ML team)
```

---

## 9. Assumptions & Risks

### Assumptions

1. RabbitMQ cluster will be available and stable
2. Qdrant can scale to millions of vectors with acceptable query latency
3. LLM providers (open-source or API) will continue to improve extraction quality
4. The concept registry will be populated with 1,000+ canonical engineering concepts
5. Human reviewers will be available for quality escalation
6. PostgreSQL can handle the metadata query load with appropriate indexing
7. The NestJS API remains the primary gateway for external access

### Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LLM extraction quality insufficient | Medium | High | Rule-based fallback; human review escalation |
| Qdrant performance degradation at scale | Low | High | Sharding strategy; read replica planning |
| Concept registry incomplete | High | Medium | Start with 100 core concepts; iterative expansion |
| Human review bottleneck | Medium | High | Target <10% escalation rate; batch review UI |
| Pipeline latency too high for real-time | Medium | Medium | Async processing; progress indicators for users |
| Bilingual extraction quality imbalance | Medium | Medium | Separate FA/EN models; cross-lingual evaluation |
| Embedding model deprecation | Low | High | Abstract embedding interface; migration plan |
| Storage costs exceed budget | Medium | Medium | Retention policies; tiered storage (hot/cold/archive) |

---

## 10. Cost Estimation

### Development Effort (Person-Months)

| Phase | Backend | AI/ML | Frontend | Infrastructure | Total |
|-------|---------|-------|----------|----------------|-------|
| Phase 1 | 2 PM | 1 PM | 0.5 PM | 1 PM | 4.5 PM |
| Phase 2 | 3 PM | 2 PM | 1 PM | 0.5 PM | 6.5 PM |
| Phase 3 | 2 PM | 2 PM | 1 PM | 1 PM | 6.0 PM |
| Phase 4 | 3 PM | 3 PM | 0.5 PM | 0.5 PM | 7.0 PM |
| Phase 5 | 1 PM | 2 PM | 0.5 PM | 0.5 PM | 4.0 PM |
| **Total** | **11 PM** | **10 PM** | **3.5 PM** | **3.5 PM** | **28 PM** |

### Infrastructure Cost (Monthly)

| Environment | Compute | Storage | AI/GPU | Total |
|-------------|---------|---------|--------|-------|
| Alpha | $200 | $50 | $200 | **$450/mo** |
| Beta | $800 | $200 | $800 | **$1,800/mo** |
| GA | $3,000 | $1,000 | $3,000 | **$7,000/mo** |
