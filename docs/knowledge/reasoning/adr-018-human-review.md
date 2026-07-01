# ADR-018: Human Review

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Automated reasoning cannot handle all engineering cases with sufficient reliability. Safety-critical decisions (e.g., "is this design compliant with fire safety regulations?"), ambiguous queries (e.g., "which standard applies when two conflict?"), and low-confidence conclusions require human expertise. The review system must be systematic — escalating the right cases to the right reviewers with appropriate urgency — without overwhelming human reviewers or creating bottlenecks.

## Decision

Implement an **escalation-based human review system** with the following design:

- **Eight escalation triggers:**
  1. CRITICAL constraint violation (see ADR-015)
  2. Confidence score below domain threshold (see ADR-017)
  3. Unresolvable conflict (see ADR-019, step 6 — escalation to human)
  4. Query outside known knowledge coverage
  5. Novel design pattern not in any standard
  6. Jurisdiction requires mandatory human review by regulation
  7. User explicitly requests human review
  8. Consecutive similar low-confidence results (degradation detection)

- **Priority SLA:**
  - **Critical** — 30 minutes (safety violation, halted pipeline)
  - **High** — 2 hours (low confidence on regulatory question)
  - **Medium** — 8 hours (ambiguous query, novel pattern)
  - **Low** — 24 hours (advisory review, user-requested)

- **Reviewer qualification requirements:**
  - Critical/High: Licensed professional engineer in the relevant jurisdiction
  - Medium: Senior engineer with 5+ years domain experience
  - Low: Any qualified engineer

- **Review workflow:**
  1. Escalation ticket created with full reasoning trace (evidence graph, confidence breakdown, conflict details)
  2. Ticket routed to qualified reviewer pool based on domain and jurisdiction
  3. Reviewer accepts, rejects, or modifies the AI conclusion
  4. Reviewer decision recorded as a new evidence node with signature
  5. Modified conclusion re-enters the pipeline for downstream processing

## Alternatives Considered

- **Fully automated reasoning:** No human latency, no operational cost, but dangerous for safety-critical engineering — a single wrong conclusion could have serious consequences. Not acceptable for regulated domains.
- **Fully manual review (every query):** Maximum safety and accuracy, but does not scale — engineering firms process thousands of queries daily. Latency of hours to days defeats the purpose of AI assistance.
- **Random sampling review:** Catches some errors but misses systematic failures. No guarantee that safety-critical cases are reviewed.

## Consequences

- **Positive:** Safety-critical and ambiguous cases are systematically escalated; qualified reviewers ensure domain-appropriate judgment; full trace from trigger through reviewer decision; priority SLA ensures urgent cases are not queued behind routine ones.
- **Negative:** Operational cost of human reviewers; latency added for escalated queries (minutes to hours); reviewer qualification management adds administrative overhead; reviewer availability may cause SLA misses during off-hours.

## Future Impact

The human review system enables phased autonomy — initially conservative (low trigger thresholds, wide escalation), becoming more aggressive as the system proves itself (higher thresholds, narrower escalation). Review data also serves as a training signal: confirmed AI conclusions reinforce the model, corrected conclusions identify gaps. Future enhancements include reviewer performance analytics, automated reviewer suggestion based on past decisions, and a reviewer feedback loop into the confidence engine.

## Compliance

- Escalation triggers MUST be configured per domain and jurisdiction.
- Reviewer qualifications MUST be verified and recorded before ticket assignment.
- All reviewer decisions MUST be signed and persisted as immutable evidence graph nodes.
- SLA adherence is monitored and reported monthly.
