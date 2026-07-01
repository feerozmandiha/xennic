# ADR-014: Rule Engine

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Engineering standards (IEC, IEEE, NEC, BS) and regulations contain thousands of IF-THEN rules that must be applied deterministically during reasoning. Examples include "IF voltage > 1000V THEN require SF6 insulation" or "IF conductor cross-section < 2.5mm² THEN derate ampacity by 0.8". These rules cannot be applied probabilistically — engineering compliance requires deterministic, reproducible outcomes.

## Decision

Implement a **forward-chaining rule engine** with the following characteristics:

- **Inference strategy:** Forward-chaining (data-driven) — the engine starts from known facts (query parameters, EKO content) and fires rules whose conditions are satisfied, adding new facts until no more rules fire.
- **Tier-based priority:** Rules are assigned to tiers (Tier 0 = safety-critical, Tier 1 = regulatory, Tier 2 = standard, Tier 3 = advisory). Higher-tier rules fire before lower-tier rules within each inference cycle.
- **Versioned rules:** Each rule has a semver, a supersedes field, and an effective date range. Rules can be deprecated without removal.
- **Audit trail:** Every rule firing logs the rule ID, version, input facts, output facts, and timestamp.
- **Conflict handling:** When two rules produce contradictory conclusions, the conflict is escalated to the Conflict Resolution stage (see ADR-019).

Rules are authored in a declarative DSL (YAML-based, with conditions expressed as JSON Logic or simple predicate expressions). The rule registry is stored in PostgreSQL with a caching layer for frequently accessed rules.

## Alternatives Considered

- **LLM-based rule application:** Flexible and can interpret natural language rule text, but non-deterministic — the same query may produce different results across invocations. Unacceptable for compliance-gated engineering decisions.
- **Hardcoded rules in application code:** Deterministic and fast, but every rule change requires a deployment. Not maintainable at the scale of thousands of rules from dozens of standards bodies.
- **Backward-chaining (goal-driven):** More efficient for targeted queries ("is this design compliant?"), but forward-chaining is more natural for the breadth of engineering reasoning where all applicable rules must be considered.

## Consequences

- **Positive:** Deterministic, reproducible rule application; versioned rules enable rollback and audit; tier-based priority ensures safety-critical rules always fire; forward-chaining ensures no applicable rule is missed.
- **Negative:** Rule authoring is a skilled task requiring both engineering domain knowledge and DSL proficiency; forward-chaining can be slower than backward-chaining for targeted queries; large rule sets may require optimization (RETE algorithm) to avoid combinatorial explosion.

## Future Impact

The rule engine is the determinism anchor of the reasoning runtime. As new standards are adopted, rule authors encode them in the registry without changing pipeline code. Future enhancements include a RETE network optimizer, a rule testing sandbox, and an auto-suggest engine that proposes rules from text analysis of new standards. The tier system also enables jurisdictions to override tiers based on local regulatory practice.

## Compliance

- Every rule MUST have a unique ID, version, and effective date range.
- Rules MUST pass a validation suite (syntax check, test cases) before being published to the registry.
- Rule engine logs MUST be retained for the audit retention period defined in the governance policy.
