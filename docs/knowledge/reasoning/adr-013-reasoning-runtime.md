# ADR-013: Reasoning Runtime

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

AI reasoning in engineering contexts must be structured, auditable, and explainable. A single LLM call produces opaque output with no intermediate artifacts — unacceptable for safety-critical domains where every conclusion must be traceable to specific sources, rules, and calculations. The reasoning process must decompose into discrete, observable stages that can be logged, inspected, and partially retried.

## Decision

Adopt an **11-stage sequential reasoning pipeline** with parallel sub-stages, orchestrated via event-driven messaging:

1. **Query Parsing** — decompose natural language query into intent, parameters, and constraints
2. **Knowledge Retrieval** — fetch relevant EKOs from vector store and knowledge graph
3. **Evidence Assembly** — construct evidence subgraph from retrieved EKOs
4. **Rule Application** — execute deterministic rules (see ADR-014)
5. **Constraint Validation** — validate against physical/regulatory limits (see ADR-015)
6. **Formula Execution** — run required calculations (see ADR-016)
7. **Conflict Resolution** — resolve contradictions between sources (see ADR-019)
8. **Confidence Scoring** — compute overall confidence (see ADR-017)
9. **Explanation Generation** — serialize the reasoning chain as a human-readable trace
10. **Human Review Escalation** — check escalation triggers (see ADR-018)
11. **Truth Validation** — validate against K1.5 truth model (see ADR-020)

Stages 3–7 execute in parallel sub-graphs where dependencies allow. Each stage emits structured events (evidence nodes, edges, confidence contributions) to the evidence graph. The orchestration layer (RabbitMQ + state machine) manages retries, dead-lettering, and partial re-execution.

## Alternatives Considered

- **Single LLM call with prompt engineering:** Maximum speed, minimal infrastructure. Produces zero intermediate trace, no partial retry, no deterministic guarantees. Unacceptable for regulated engineering domains.
- **Fully manual reasoning (human experts):** Maximum accuracy and explainability, but does not scale to thousands of queries per day. Latency is hours to days.
- **Two-stage (retrieve + generate):]** Common RAG pattern, but lacks rule application, constraint checking, conflict resolution, and confidence scoring. Insufficient for engineering-grade reasoning.

## Consequences

- **Positive:** Full explainability through stage-level trace; partial retry on failure without re-executing entire pipeline; each stage can be independently tested, monitored, and upgraded; deterministic stages (rules, constraints, formulas) catch LLM errors.
- **Negative:** Higher latency than a single LLM call (target: 5–30s vs 1–3s); operational complexity of 11 orchestrated services; inter-stage schema evolution requires coordination.

## Future Impact

The 11-stage pipeline is the central nervous system of Xennic reasoning. New reasoning capabilities (e.g., simulation coupling, cost estimation) can be inserted as new stages. The pipeline architecture also enables A/B testing of individual stages — for example, two different retrieval strategies can be compared in production with the same downstream stages. However, the sequential dependency of some stages limits overall throughput to the slowest stage — critical path optimization will be an ongoing concern.

## Compliance

- Every stage MUST produce a structured event with input and output hashes for audit.
- Stage execution order MUST follow the declared DAG; any reordering requires architecture review.
- Stage timeouts MUST be configured per stage; overdue stages trigger dead-letter and escalation.
