# ADR-004: Human-in-the-Loop

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Automated NLP and ML-based extraction cannot achieve 100% accuracy for specialised engineering knowledge. Ambiguous units, context-dependent terminology, multi-lingual sources, and novel document types all produce low-confidence extractions. Uncorrected errors propagate through the knowledge graph, undermining trust. However, fully manual review does not scale to the expected document volume.

## Decision

Require human review in four specific scenarios, governed by configurable thresholds:

1. **Tier 1–2 sources** — documents classified as regulatory, safety-critical, or engineering-standard always receive human review at validation layers 3–6 (see ADR-003)
2. **Low-confidence extractions** — any entity, relationship, or metadata extracted with AI confidence < 0.7 (configurable per domain) triggers a human review gate
3. **Conflicting knowledge** — when the runtime detects a contradiction with existing published knowledge, a human must resolve the conflict before publication
4. **Safety-critical content** — documents tagged with safety-critical labels (e.g., IEC 61508, ISO 13849) require mandatory human sign-off regardless of confidence

Human review workflow:
- Reviewer receives a structured diff (proposed knowledge vs. extracted raw content vs. existing knowledge)
- Reviewer can approve, reject, or edit the proposed knowledge
- Approved/reviewed documents pass to the next stage
- Rejected documents return to extraction with reviewer notes

## Alternatives Considered

- **Fully automated:** Errors propagate silently. Acceptable for general content but unacceptable for safety-critical engineering knowledge. Risk of eroding user trust in the platform.
- **Fully manual:** Maximum quality but latency of hours-to-days per document. Cannot meet throughput requirements (100M+ documents). Engineering domain expert time is scarce and expensive.

## Consequences

- **Positive:** High accuracy where it matters most. Human judgment catches edge cases that ML models miss. Reviewer feedback can be used to retrain models and improve extraction quality over time. Trust in published knowledge is maintained.
- **Negative:** Documents requiring review experience hours-to-days of latency vs. minutes for fully automated processing. Operational cost scales with reviewer headcount. Requires a review UI and workflow engine.

## Future Impact

The human-in-the-loop architecture enables a continuous improvement flywheel: reviewer corrections become training data for ML models, gradually reducing the reliance on human review over time. The threshold-based gating allows fine-tuning: as model confidence improves, thresholds can be tightened to reduce review load.

## Compliance

- Human review decisions must be logged with reviewer ID, timestamp, decision, and optional notes.
- Review gates must be enforced at the pipeline level — no automated bypass.
- Reviewer workload and queue depth must be monitored and alerted via Grafana.
- Threshold values (confidence, tier assignments) must be configuration-driven and auditable.
