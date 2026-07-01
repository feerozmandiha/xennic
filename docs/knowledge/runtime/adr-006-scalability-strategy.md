# ADR-006: Scalability Strategy

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

The Knowledge Acquisition Runtime must handle 100M+ documents across multiple languages, source types, and geographic regions. Document ingestion rates vary unpredictably — bulk uploads of thousands of documents can arrive simultaneously, while at other times the system is idle. The architecture must scale horizontally without downtime, optimise cost by matching capacity to demand, and support deployment in both cloud and on-premise environments.

## Decision

Adopt a stateless worker architecture with event-driven auto-scaling on Kubernetes:

- **Stateless processors** — every pipeline stage (parsing, extraction, validation, enrichment) is stateless. All state lives in RabbitMQ queues, PostgreSQL, and Qdrant. Workers can be scaled up/down arbitrarily without data loss.
- **Auto-scaling worker pools** — per-stage horizontal pod autoscaling (HPA) based on queue depth. When a queue grows, additional workers are spawned; when it drains, workers are scaled down to zero.
- **Event-driven backpressure** — RabbitMQ queues act as natural buffers. If publication targets are slow, queues accumulate and backpressure propagates upstream, slowing ingestion.
- **Kubernetes deployment** — all runtime services are containerised and deployed via Helm charts. Resource limits, affinity rules, and pod disruption budgets ensure predictable behaviour.
- **Multi-region partitioning** — documents are partitioned by source region/language. Each partition has independent pipeline instances to prevent cross-region noise.

## Alternatives Considered

- **Stateful processing:** Easier to reason about (services hold in-memory state) but significantly harder to scale. State resharding requires coordinated downtime or complex rebalancing protocols.
- **Serverless (AWS Lambda, etc.):** Excellent auto-scaling but cold start latency (5–30s) is unacceptable for sub-second extraction jobs. Harder to debug, limited execution duration, and vendor lock-in.
- **Vertical scaling (larger instances):** Simple but hits ceiling. Single-instance resource limits cannot handle 100M+ documents. No fault isolation — one bad document can OOM the entire process.

## Consequences

- **Positive:** Near-infinite horizontal scalability — adding capacity is a Helm values change. Cost efficiency via scale-to-zero during idle periods. Cloud-native portability (any Kubernetes cluster). Fault isolation per worker pod.
- **Negative:** Operational complexity increases — requires Kubernetes expertise, monitoring of 20+ microservices, and careful resource tuning. Stateless design pushes complexity to message queues and databases, which become the new scaling bottlenecks. Network overhead between stateless workers and shared stores.

## Future Impact

The stateless event-driven architecture enables future capabilities: canary deployments of new pipeline versions (route 1% of documents to new extraction logic), spot/preemptible instance usage for cost savings, and multi-cloud deployment for geo-redundancy. The primary constraint is that any stateful transformation (e.g., document ordering across stages) requires explicit coordination via the message bus.

## Compliance

- All runtime services must be stateless — no in-memory caches or local state beyond ephemeral processing buffers.
- HPA configuration must be defined per-stage in the Helm chart with documented scale-up/scale-down thresholds.
- Load testing must validate linear scaling: doubling worker count doubles throughput (within backend limits).
- Cross-region partitioning strategy must be documented and reviewed before onboarding new regions.
