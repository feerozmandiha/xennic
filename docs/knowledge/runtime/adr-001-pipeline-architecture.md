# ADR-001: Pipeline Architecture

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Raw engineering documents arrive from diverse sources (PDFs, CAD files, datasheets, technical reports) in multiple languages and formats. These documents must be processed into validated, structured knowledge objects that can be published to vector stores, graph databases, search indexes, and APIs. The pipeline must support auditability, explainability, and resilience while accommodating human review gates for safety-critical engineering content.

## Decision

Adopt a multi-stage sequential pipeline with parallel branches, orchestrated via events (RabbitMQ). The pipeline consists of:

1. **Ingestion** — acquire and normalize raw documents
2. **Parsing** — extract text, tables, figures per file type
3. **Chunking** — segment content into digestible units
4. **Extraction** — identify entities, relationships, metadata
5. **Validation** — six-layer quality gate (see ADR-003)
6. **Enrichment** — augment with cross-references, linked data
7. **Publication** — versioned all-or-nothing (see ADR-005)

Parallel branches handle independent document streams concurrently. Human-in-the-loop gates (see ADR-004) pause the pipeline at the Validation stage when confidence thresholds are not met.

## Alternatives Considered

- **Monolithic processor:** Higher throughput but zero auditability, no partial retries, single point of failure, and impossible to explain intermediate state.
- **Fully ML-based extraction:** Fragile when models degrade; no deterministic guarantees for safety-critical engineering knowledge.
- **Fully manual processing:** Maximum accuracy but prohibitive latency and cost at scale (100M+ documents).

## Consequences

- **Positive:** Full audit trail at every stage, explainable decisions via intermediate artifacts, resilience through per-stage retry/dead-letter, parallel branches improve throughput for independent workloads.
- **Negative:** Lower end-to-end throughput compared to a monolithic processor; higher operational complexity (multi-service orchestration, monitoring, inter-stage schema contracts).

## Future Impact

This architecture enables incremental upgrades per stage without rewiring the entire system. New extraction strategies, validation rules, or enrichment sources can be inserted as new pipeline stages or parallel branches. It also constrains the system to asynchronous, eventually-consistent processing — real-time query will require pre-published knowledge.

## Compliance

- Every pipeline stage must emit a structured event on completion or failure.
- Stage contracts (input/output schemas) must be versioned and validated at integration test time.
- Pipeline topology is defined in a single declarative config; changes require architecture review.
