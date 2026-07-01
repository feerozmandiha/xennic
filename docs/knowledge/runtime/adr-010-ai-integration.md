# ADR-010: AI Integration

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

The Knowledge Acquisition Runtime relies on AI capabilities — LLM-based entity extraction, relationship identification, classification, summarisation, and embedding generation. The AI Service (port 8002) provides these capabilities via a FastAPI interface. However, the AI Service may be unavailable due to model loading failures, GPU resource exhaustion, upstream API rate limits, or maintenance windows. The runtime must degrade gracefully without halting the entire pipeline, while still delivering high-quality extraction when AI is available.

## Decision

Define two categories of AI dependency:

1. **Soft dependency — LLM-based extraction and enrichment:** AI Service is preferred but the runtime falls back to pattern-based extraction (regex, rule-based NLP, dictionary matching) when the AI Service is unavailable or returns low-confidence results. Fallback logic:
   - Pattern-based extraction runs in parallel as a lower-confidence baseline
   - If AI Service responds with confidence >= 0.7 within timeout (30s), use AI result
   - If AI Service times out or returns low confidence, fallback to pattern-based result
   - If both fail, the document enters a human review gate (see ADR-004)
   - Extraction quality metrics (confidence, completeness) are tagged with `extraction_method: ai` or `extraction_method: pattern`

2. **Hard dependency — embedding generation:** Embeddings are required for vector DB publication. Pattern-based fallback cannot produce vector embeddings. If the AI Service embedding endpoint is unavailable, the pipeline halts at the enrichment stage until the service recovers. Rationale: publishing incomplete or missing embeddings corrupts the vector index and degrades all similarity search queries, not just the affected document.

Service integration details:
- Runtime communicates with AI Service via gRPC for low-latency extraction calls, with HTTP/JSON fallback
- Circuit breaker pattern: after 5 consecutive failures, skip AI extraction for 60s, then probe
- AI Service health is polled every 15s; embedding unavailability triggers a P1 alert

## Alternatives Considered

- **Hard dependency on AI for everything:** Simple to implement (no fallback paths) but fragile — any AI Service outage stalls the entire pipeline. Unacceptable for a runtime processing 100M+ documents.
- **No AI integration:** Pattern-based extraction only avoids AI dependency entirely but produces poor extraction quality for complex engineering documents. Misses relationships, implicit knowledge, and context-dependent classifications. Competitive disadvantage.

## Consequences

- **Positive:** Graceful degradation — pipeline continues processing during AI outages with pattern-based fallback. Circuit breaker prevents cascading failures. Extraction method tagging enables quality monitoring and continuous improvement of both AI and pattern-based approaches.
- **Negative:** Dual maintenance burden — pattern-based extractors must be maintained alongside AI models. Additional complexity in the extraction stage (fallback orchestration, timeout handling, confidence comparison). Embedding hard dependency means complete pipeline stall during embedding service outage.

## Future Impact

The soft/hard dependency split creates a clear roadmap: as pattern-based extraction improves, the AI Service can focus on higher-value tasks (implicit knowledge discovery, cross-document synthesis). The circuit breaker and fallback patterns can be extended to other AI capabilities (classification, summarisation) as they are added. Embedding as a hard dependency constrains deployment architecture — the embedding service must be provisioned with sufficient GPU capacity and redundancy.

## Compliance

- Every extraction call must define a timeout; AI Service responses exceeding timeout must trigger fallback, not pipeline failure.
- Extraction method (`ai` or `pattern`) must be persisted per knowledge object for audit and quality analysis.
- Circuit breaker state must be exposed via Prometheus metrics (current state, failure count, last probe timestamp).
- Embedding service availability alerts must be configured at P1 severity with on-call escalation.
