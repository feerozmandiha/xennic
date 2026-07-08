# ADR-013: Enterprise Event Schema Registry & Versioning

## Status
Accepted — Sprint E1

## Context
The existing Semantic Integration module has 12 domain events with version field but no schema validation, no compatibility checking, and no replay capability. As the platform grows, event schemas will evolve and need controlled migration.

## Decision
Add a Schema Registry alongside the existing event system:

1. **Schema Registry**: Stores event schema definitions with version history, supports BACKWARD/FORWARD/FULL/NONE compatibility modes
2. **Event Replay**: Queries delivered events from the outbox and reinserts them for reprocessing
3. **Versioning**: New versions increment the version counter; upcasting is the handler's responsibility

The Schema Registry is advisory — it validates but doesn't reject at the outbox level. Handlers use the version field to determine upcasting needs.

## Consequences
- Event producers can validate payloads before publishing
- Downstream handlers can detect schema changes via version field
- Replay enables recovery scenarios and data backfills
- Compatibility checks prevent breaking changes in production
- No automatic upcasting — handlers remain responsible for version migration
