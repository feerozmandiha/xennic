# ADR-012: Enterprise Messaging Bus Architecture

## Status
Accepted — Sprint E1

## Context
The platform needs a unified messaging layer for CQRS, event-driven communication, and async task processing. Existing semantic integration uses only events via outbox pattern. We need Command, Query, and Message buses.

## Decision
Implement a three-bus architecture (Command, Query, Message) with in-process initial implementations:

1. **CommandBus**: Point-to-point, exactly-once execution for mutations
2. **QueryBus**: Point-to-point, read-only data retrieval
3. **MessageQueue**: Publish-subscribe, async event processing with priority and DLQ

All buses use the same interface pattern: handler registration with typed payloads, DI tokens for testability, `@Global()` module for universal availability.

## Consequences
- Clean CQRS separation: commands never return data, queries never mutate
- Handlers are registered explicitly — no auto-discovery
- In-process implementation has no network overhead but no persistence across restarts
- Future Redis/RabbitMQ adapters implement the same interfaces
- DLQ provides resilience for failed messages with retry + exponential backoff
