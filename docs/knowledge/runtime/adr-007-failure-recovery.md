# ADR-007: Failure Recovery

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

The Knowledge Acquisition Runtime processes millions of documents from diverse sources. Failures are inevitable: malformed PDFs, corrupted images, transient network issues, downstream service outages, and exhaustion of compute resources. Without a robust failure recovery mechanism, a single problematic document can stall the entire pipeline or cause silent data loss. The recovery strategy must prioritise data integrity above all else.

## Decision

Implement a multi-level failure recovery strategy:

1. **Retry with exponential backoff** — transient failures (network timeouts, rate limits, temporary unavailability) trigger automatic retry with backoff: 1s, 4s, 16s, 64s, 256s (5 retries max). Jitter is applied to avoid thundering herd.
2. **Dead letter queue** — after exhausting retries, the event is moved to a per-stage DLQ. DLQ messages are surfaced in a Grafana dashboard and trigger an alert. Operators can replay DLQ messages after addressing the root cause.
3. **Automated rollback** — if publication fails (see ADR-005), all targets are rolled back atomically. The document is returned to a pre-publication state and queued for re-evaluation.
4. **Manual recovery** — unrecoverable failures (schema violations, corrupted source files, undefined document types) are routed to a human operator via the review UI. The operator can skip, repair, or return the document to an earlier pipeline stage.
5. **Pipeline checkpointing** — each stage persists its output atomically. A document can be restarted from the last successful checkpoint rather than re-processing from ingestion.

## Alternatives Considered

- **Fail-fast with manual restart:** Simplest implementation but risks data loss. A crash mid-publication leaves some targets updated and others not. Operator must manually reconcile state.
- **Infinite retry:** Guarantees eventual processing but can exhaust resources. A stuck document consumes a worker slot indefinitely, reducing pipeline throughput. Masks underlying issues.
- **Skip-and-continue:** Loses the document entirely. Unacceptable for compliance — every ingested document must be either published or explicitly rejected with an auditable reason.

## Consequences

- **Positive:** High resilience — most failures are handled automatically without operator intervention. Data integrity is guaranteed (no partial publications). DLQ provides a safety net for unhandled failure modes. Checkpointing reduces wasted compute on re-processing.
- **Negative:** Increased system complexity — retry logic, DLQs, checkpoint stores, and rollback mechanisms must be implemented, tested, and monitored. Problematic documents can remain in the pipeline for extended periods (hours of retry + human review delay).

## Future Impact

The recovery infrastructure enables future capabilities: automated document repair (e.g., re-download from source, re-parse with different parser), intelligent retry routing (send parser failures to a specialised parser), and SLA-based escalation (e.g., auto-escalate to senior engineering reviewer if document stuck > 24h).

## Compliance

- Every pipeline stage must implement the retry/DLQ pattern — no silent exception swallowing.
- DLQ depth and age must be monitored with alerts configured at P1 (critical) if depth exceeds threshold.
- Rollback procedures must be tested in CI/CD for every publication target.
- Checkpoint store must use the same database transaction as the output — no split-brain state.
