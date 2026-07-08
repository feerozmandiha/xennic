# ADR-014: Distributed Saga Orchestration Pattern

## Status
Accepted — Sprint E1

## Context
Multi-step business processes (e.g., document upload → classify → parse → chunk → embed → publish) need coordinated execution with failure handling and rollback.

## Decision
Implement a choreography-based saga orchestrator:

1. **SagaDefinition**: Declares steps, timeout, and whether compensation is supported
2. **SagaInstance**: Tracks state (PENDING → EXECUTING → COMPLETED|FAILED|COMPENSATING|COMPENSATED)
3. **Step execution**: Sequential with timeout per step via `Promise.race`
4. **Compensation**: Reversed-order execution of compensators for completed steps on failure

The orchestrator runs steps asynchronously via `setImmediate`. Each step has a `compensate()` method that undoes the step's changes.

## Consequences
- Sagas are self-contained without external workflow engine
- Compensation ensures eventual consistency even on partial failures
- Timeout prevents hung sagas
- In-memory instance storage (persistent storage planned)
- Compensators must be idempotent for safety
