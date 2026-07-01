# ADR-017: Confidence Engine

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Engineering decisions cannot tolerate opaque confidence scores. When an AI system concludes "this cable is adequately sized," the engineer needs to know how certain that conclusion is and why. A single LLM-provided confidence score is not explainable and cannot be decomposed into contributing factors. Without a structured confidence model, engineers cannot assess whether to trust, verify, or reject an AI conclusion.

## Decision

Implement a **5-component weighted confidence formula**:

```
Confidence = 0.30 × Confidence_source
           + 0.25 × Confidence_evidence
           + 0.20 × Confidence_reasoning
           + 0.15 × Confidence_consistency
           + 0.10 × Confidence_temporal
```

Each component is computed independently:

1. **Source Confidence (30%):** Based on the source's authority (primary standard body = 1.0, manufacturer datasheet = 0.8, forum post = 0.3), source age, and source verification status.
2. **Evidence Confidence (25%):** Based on the evidence graph edge types and counts — conclusions supported by multiple SUPPORTS edges score higher; presence of CONTRADICTS edges reduces score.
3. **Reasoning Confidence (20%):** Based on the determinism of the stages used — rule engine and formula engine outputs score 1.0, LLM-based stages score based on model confidence calibration.
4. **Consistency Confidence (15%):** Based on cross-validation — do multiple independent reasoning paths produce the same conclusion? Higher consistency increases score.
5. **Temporal Confidence (10%):** Based on the age and stability of the underlying knowledge — newer editions of standards increase score, recently superseded knowledge decreases it.

The weights are configurable per domain and jurisdiction. All component scores and their contributing factors are recorded as evidence nodes in the evidence graph (see ADR-012), enabling full explainability.

## Alternatives Considered

- **Single LLM confidence score (e.g., "I am 90% confident"):** Fast but not explainable — the engineer cannot decompose why confidence is 90% rather than 70%. No audit trail.
- **No confidence score:** Unusable for engineering — engineers cannot assess risk. Every AI output would require manual verification, defeating the purpose of automation.
- **Binary confidence (confident / not confident):** Too coarse — engineers need nuanced thresholds for different decision types (safety-critical vs advisory).

## Consequences

- **Positive:** Explainable — each component is independently computed and traceable; configurable weights accommodate different domains and risk tolerances; component scores feed into the evidence graph for rich traceability; temporal component captures knowledge freshness.
- **Negative:** Weight calibration requires empirical validation across domains; component computation adds pipeline latency; 5-component model may be over-engineered for simple queries where a single source suffices.

## Future Impact

The confidence engine enables risk-based decision-making. Outputs below configurable thresholds can trigger automatic escalation to human review (see ADR-018). As the system gathers more data, weights can be empirically calibrated against human expert judgments. Future enhancements include per-component uncertainty intervals and Bayesian confidence propagation through the evidence graph.

## Compliance

- Every reasoning cycle MUST produce a confidence score with all 5 component scores recorded.
- Component scores and their inputs MUST be persisted as evidence graph nodes.
- Weight configuration changes MUST be versioned and auditable.
- Thresholds for human review escalation are defined per domain and reviewed quarterly.
