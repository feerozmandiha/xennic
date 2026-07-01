# ADR-020: Engineering Truth Runtime

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

The K1.5 truth model defines engineering truth as a function of five elements: source authority, evidence support, reasoning validity, confidence threshold, and version currency. However, a documented truth model is only as good as its enforcement. Without runtime validation, the reasoning pipeline could produce outputs that violate the truth model — using unverified sources, ignoring contradictory evidence, or presenting conclusions below the confidence threshold. An architectural gap between the truth model and the runtime creates a false sense of reliability.

## Decision

Implement a **Truth Validator service** that enforces all five elements of the K1.5 truth model at runtime. The validator sits at stage 11 of the reasoning pipeline (see ADR-013), after human review and before final output, serving as the last gate.

The validator checks:

1. **Source Validity** — every source referenced in the conclusion must exist in the EKO registry with a verified SHA-256 hash. Orphaned or tampered sources are rejected.
2. **Evidence Completeness** — the conclusion must have at least one evidence path to a root source through the evidence graph. Conclusions supported only by LLM-generated text are rejected unless explicitly flagged as draft.
3. **Reasoning Soundness** — all deterministic stages (rules, constraints, formulas) must have executed on the path to the conclusion. Missing deterministic stage outputs are flagged.
4. **Confidence Threshold** — the final confidence score (see ADR-017) must meet or exceed the domain- and jurisdiction-specific minimum threshold.
5. **Version Currency** — all referenced EKOs, rules, formulas, and constraints must be current as of the query's effective date. Superseded or deprecated references are rejected.

Three enforcement levels are selectable per domain and jurisdiction:

- **Strict** — all five checks must pass; failure returns an error and blocks output.
- **Moderate** — checks 1, 3, and 4 are blocking; checks 2 and 5 produce warnings but do not block.
- **Relaxed** — all checks produce warnings only; output is delivered with a warning banner.

## Alternatives Considered

- **Trust but verify (post-hoc auditing):** Validates truth model compliance after output delivery. Catches violations but does not prevent them — an engineer may act on a non-compliant conclusion before the audit runs. Too late for safety-critical applications.
- **No enforcement (truth model is documentation only):** Creates an architectural gap — the truth model is aspirational but not operational. Engineers cannot trust that the system enforces what it promises.
- **Enforcement at each stage (distributed):** Each stage validates its own truth model element. More resilient to stage-level failures, but duplicate validation logic scatters across services. Harder to audit and maintain.

## Consequences

- **Positive:** Active enforcement prevents non-compliant outputs from reaching users; three levels accommodate different risk tolerances (strict for safety-critical, relaxed for research); centralized validator is auditable and maintainable; the validator itself can be independently tested.
- **Negative:** Performance overhead — each validations adds 50–500ms depending on the depth of evidence graph traversal; centralized validator becomes a single point of failure unless replicated; strict mode may produce false rejections for edge cases not covered by the truth model.

## Future Impact

The Truth Validator closes the loop between architectural intent (K1.5) and runtime behavior. Future enhancements include truth model versioning (the validator can run multiple truth model versions in parallel during migration), truth model simulation ("what if we adopted stricter thresholds?"), and automated truth model adjustments based on empirical validation rates. The validator also enables a compliance dashboard showing real-time truth model adherence across all queries.

## Compliance

- All reasoning pipeline outputs MUST pass through the Truth Validator before delivery.
- Enforcement level MUST be logged with each validation result.
- Strict-level rejections MUST trigger an incident alert.
- The validator's logic MUST be reviewed and updated whenever the K1.5 truth model changes.
