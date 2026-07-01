# ADR-015: Constraint Engine

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Engineering designs must respect physical limits (e.g., conductor ampacity, voltage drop), regulatory limits (e.g., minimum clearance, maximum earth resistance), and safety limits (e.g., touch voltage threshold, fault current capacity). These limits vary by jurisdiction, application type, and installation context. A validation system must check designs against all applicable constraints and produce actionable results before reasoning proceeds.

## Decision

Implement a **parameter-based constraint validation engine** with the following design:

- **Constraint model:** Each constraint is a named rule with a target parameter, a comparison operator (≤, ≥, ==, BETWEEN, IN), a threshold value (or expression), and a reference to the source EKO or regulation.
- **Four severity levels:**
  - `PASS` — constraint satisfied
  - `WARNING` — near-limit (e.g., within 5% of threshold), advisory
  - `FAIL` — constraint violated, reasoning can continue but flagged
  - `CRITICAL` — safety violation, reasoning must halt and escalate
- **Jurisdiction-aware:** Constraints are tagged with jurisdiction codes (e.g., `IRN`, `USA`, `EU`). The engine loads only constraints applicable to the query's jurisdiction.
- **Contextual parameters:** Constraints can reference design parameters (voltage, current, conductor type, ambient temperature, derating factors) extracted during query parsing.
- **Execution model:** Constraints are evaluated in dependency order — if a constraint's parameter depends on a formula result (see ADR-016), the engine waits for the formula execution stage.

Constraints are authored in the same declarative format as rules (YAML) and stored in the same registry. The constraint engine is a separate service but shares the rule registry database for consistency.

## Alternatives Considered

- **Hardcoded constraint checks in application code:** Simple for a small number of constraints, but each jurisdiction and code edition would require code changes. Not scalable.
- **Post-hoc validation (after design is complete):** Catches violations too late — the reasoning runtime would waste resources on non-compliant designs. Constraints should gate reasoning early.
- **Single severity level (fail/non-fail):** Insufficient granularity. Engineers need warnings for near-limits and critical halts for safety violations.

## Consequences

- **Positive:** Safety-critical constraints halt reasoning before non-compliant designs propagate; jurisdiction-aware filtering ensures correct constraints for each market; four severity levels give nuanced feedback; dependency-ordered execution integrates cleanly with the formula engine.
- **Negative:** Constraint maintenance effort scales with number of jurisdictions and code editions; constraint authoring requires domain expertise; dependency resolution for parameter chains adds complexity.

## Future Impact

The constraint engine enables automated compliance checking across jurisdictions — a core differentiator for Xennic. Future enhancements include constraint derivation from natural language standards (AI-assisted authoring), constraint version comparison (what changed between code editions), and constraint coverage analysis (which parameters lack constraints). The engine's design also supports user-defined custom constraints for enterprise deployments.

## Compliance

- Every constraint MUST reference a source EKO or regulation.
- Constraints MUST be tagged with at least one jurisdiction code.
- CRITICAL severity results MUST trigger an immediate pipeline halt and notification.
- Constraint engine results are appended to the evidence graph as evidence nodes.
