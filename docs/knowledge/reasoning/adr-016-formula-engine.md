# ADR-016: Formula Engine

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Engineering reasoning requires calculations: ampacity derating, voltage drop, cable sizing, fault current, short-circuit capacity, power factor correction. These calculations must be executed correctly using verified formulas with consistent units. LLMs are unreliable for numerical computation, hardcoded functions are not extensible, and unit mismatches cause silent errors.

## Decision

Implement a **registry-based formula execution engine** with the following design:

- **Formula registry:** Every formula has a unique ID, version, effective date range, input parameter schema, output parameter schema, and an executable expression. Formulas are authored in a sandboxed expression language (e.g., math.js expression syntax or a custom DSL) with access to standard mathematical functions, constants, and unit conversions.
- **Unit normalization:** All input parameters are normalized to SI base units before computation. Results are converted to the target unit system based on the query's jurisdiction (metric vs imperial). Unit mismatches are detected and flagged before execution.
- **Dependency resolution (DAG):** Formulas can reference other formulas as sub-expressions. The engine resolves the dependency graph into a topological order and executes leaf-to-root. Circular dependencies are detected and rejected at authoring time.
- **Versioned formulas:** Formula updates (e.g., a new edition of a standard changes a coefficient) are versioned. The engine uses the formula version applicable at the query's effective date.
- **Audit trail:** Every formula execution logs the formula ID, version, input values (with units), output values (with units), and timestamp.

The formula registry is stored in PostgreSQL, co-located with the rule registry. Execution is performed in a sandboxed WebAssembly runtime or a restricted JavaScript environment to prevent arbitrary code execution.

## Alternatives Considered

- **LLM calculates formulas:** Unreliable — LLMs make arithmetic errors, misinterpret units, and produce inconsistent results. Not acceptable for safety-critical engineering calculations.
- **Hardcoded functions in Python/TypeScript:** Fast and type-safe, but every new formula requires a code change, PR review, and deployment. Not extensible by domain experts.
- **Spreadsheet-based:** Familiar to engineers but not machine-executable, not auditable at scale, and impossible to integrate into an automated pipeline.

## Consequences

- **Positive:** High accuracy through verified formulas and unit normalization; extensible — domain experts can author new formulas without code changes; DAG resolution handles complex interdependent calculations; full audit trail.
- **Negative:** Formula registry requires ongoing maintenance as standards evolve; sandboxed execution adds performance overhead; expression language learning curve for formula authors.

## Future Impact

The formula engine enables systematic calculation across all engineering domains. Future enhancements include unit smart-suggest (auto-detect target units from jurisdiction), formula test harness (automated regression testing against known values), and formula composability (user-defined formulas derived from registry formulas). The DAG approach also enables incremental re-calculation — if one input changes, only downstream formulas need re-execution.

## Compliance

- Every formula MUST have unit-annotated input and output schemas.
- Formulas MUST pass a test suite (provided examples with expected outputs) before registry publication.
- Dependency graphs are validated for cycles at authoring time; cyclic formulas are rejected.
- All formula executions are logged and retained for audit.
