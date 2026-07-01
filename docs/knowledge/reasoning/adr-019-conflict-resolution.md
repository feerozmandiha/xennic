# ADR-019: Conflict Resolution

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Engineering sources frequently contradict each other. A 2018 edition of a standard may conflict with a 2023 amendment; a manufacturer specification may deviate from the codebook; two different standards bodies may define the same parameter differently. Without a systematic resolution strategy, the reasoning runtime would produce conflicting conclusions or arbitrarily pick one source, undermining trust and reproducibility.

## Decision

Adopt a **6-step conflict resolution hierarchy**, applied in order until a winner emerges:

1. **Tier** — Sources from higher regulatory tiers (safety codes > standards > guidelines > manufacturer specs) take precedence.
2. **Jurisdiction** — Sources matching the query's jurisdiction override general sources. A local amendment beats the base standard.
3. **Temporal** — Newer sources (by effective date) override older ones, unless the older source is from a higher tier.
4. **Specificity** — More specific sources (directly addressing the query's parameter) override general sources (addressing the broader category).
5. **Consensus** — If multiple independent sources agree, the majority position is adopted. Ties proceed to step 6.
6. **Human Escalation** — The conflict is escalated to human review (see ADR-018) with the conflicting sources, the hierarchy steps applied, and the unresolved state documented.

Each conflict event is recorded as an evidence graph subgraph: conflicting evidence nodes, the resolution step applied, the rationale, and the outcome. The entire resolution chain is auditable.

The hierarchy is implemented as a deterministic function in the Conflict Resolution stage (stage 7 of the reasoning pipeline, see ADR-013). It takes a set of conflicting evidence nodes and returns a single winning node (or escalates).

## Alternatives Considered

- **Random selection:** Fast and simple, but produces non-deterministic results — the same query may yield different conclusions. Unacceptable for engineering reproducibility.
- **Always escalate to human:** Maximum accuracy but defeats automation — every conflict would require a human reviewer. Not scalable at thousands of conflicts per day.
- **Majority vote only:** Ignores source authority — a low-tier source with majority may override a high-tier source with minority. Violates regulatory hierarchy.
- **Manual priority configuration:** Requires engineers to pre-configure every possible conflict pair. Not maintainable at scale.

## Consequences

- **Positive:** Deterministic resolution that respects regulatory hierarchy; auditable — every conflict and resolution is recorded; the 6-step hierarchy handles the vast majority of cases without human involvement; step 6 provides a safety valve for edge cases.
- **Negative:** The hierarchy may not cover all edge cases (e.g., conflicting sources at the same tier, jurisdiction, date, and specificity); step 5 (consensus) can be computationally expensive with many sources; step 6 escalation adds latency for unresolved conflicts.

## Future Impact

The conflict resolution hierarchy establishes a predictable, explainable method for handling contradictory knowledge. As the knowledge graph grows, conflict resolution becomes increasingly critical. Future enhancements include statistical conflict detection (flagging sources that frequently conflict), conflict pattern analysis (identifying systemic contradictions between standards), and automated hierarchy adjustment (learning which steps are most effective for specific domains).

## Compliance

- Every conflict involving 2+ evidence nodes MUST be processed through the 6-step hierarchy.
- Conflict resolution results MUST be recorded as evidence graph edges with the step identifier.
- Step 6 escalations MUST create a human review ticket with full conflict context.
- Hierarchy step configuration is domain-configurable; changes require architecture review.
