# ADR-002: Event-Driven Runtime

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

The Knowledge Acquisition Runtime consists of multiple services (ingestion, parsing, extraction, validation, enrichment, publication) that must communicate asynchronously. Synchronous coupling would create cascading failures, limit scalability, and prevent independent deployment of services. The messaging system must guarantee delivery, support per-document correlation, and integrate with the existing infrastructure stack.

## Decision

Use RabbitMQ as the event bus with:

- **Topic exchanges** — each pipeline stage publishes to a topic; downstream services subscribe to relevant routing keys
- **At-least-once delivery** — messages are acknowledged only after successful processing; unacknowledged messages are redelivered
- **Per-document correlation ID** — every event carries a `correlation_id` (document UUID) for tracing across stages
- **Dead letter queues** — messages that exhaust retries are moved to DLQs for manual inspection (see ADR-007)
- **Consumer-side idempotency** — handlers are idempotent on `correlation_id` to handle duplicate deliveries

## Alternatives Considered

- **Synchronous HTTP calls:** Simple to implement but creates tight coupling. A single slow service stalls the entire pipeline; transient failures cascade. No built-in retry or backpressure.
- **Apache Kafka:** Superior throughput and log-based storage, but adds a new stateful infrastructure component (ZooKeeper/KRaft). RabbitMQ is already in the Xennic infrastructure stack — deferring Kafka until throughput requirements demonstrably exceed RabbitMQ's capabilities.
- **AWS SQS:** Fully managed and simple, but introduces cloud vendor lock-in. Xennic targets on-premise and air-gapped deployments for defence/industrial clients.

## Consequences

- **Positive:** Full decoupling — services can be deployed, scaled, and failed independently. Pipeline resilience improves via automatic retry and DLQ isolation. Topic exchanges enable flexible routing (e.g., route high-priority documents to dedicated workers).
- **Negative:** Eventual consistency means publication lags behind ingestion. Debugging distributed async flows requires correlation-ID-based tracing. Message ordering is not guaranteed across queues — the pipeline is designed for ordering at the per-stage level only.

## Future Impact

The event-driven foundation enables future capabilities: priority queues for urgent documents, event sourcing for full pipeline replay, and multi-region replication via RabbitMQ federation. It also constrains the architecture: stages that require synchronous responses (e.g., real-time query) must read from published stores, not from the pipeline bus.

## Compliance

- Every service must publish exactly one event type per completed stage.
- All events must include `correlation_id`, `document_id`, `source_stage`, `timestamp`, and `schema_version`.
- Idempotency keys must be checked before processing any event.
- Queue topology (exchanges, bindings, DLQs) is defined as infrastructure-as-code and must be reviewed via PR.
