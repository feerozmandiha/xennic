# Sprint E1 — Enterprise Platform Architecture

## Overview

Sprint E1 transforms the Xennic platform from a collection of modules into a fully integrated Enterprise Platform. Eight phases build on the Sprint K4 foundation to deliver a unified architecture spanning messaging, events, sagas, caching, observability, configuration, API management, and search federation.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Layer 7 — API Platform"
        API[Enterprise API Platform]
        RL[Rate Limiter]
        AD[API Discovery]
    end

    subgraph "Layer 6 — Observability"
        OBS[Enterprise Observability]
        TR[Tracing]
        MT[Metrics]
        LG[Logging]
    end

    subgraph "Layer 5 — Config & Cache"
        CFG[Enterprise Config]
        CACHE[Enterprise Cache]
        FF[Feature Flags]
    end

    subgraph "Layer 4 — Messaging"
        CQRS[Command/Query Bus]
        EVT[Enterprise Events]
        MSG[Message Queue]
        DLQ[Dead Letter Queue]
    end

    subgraph "Layer 3 — Sagas"
        SAGA[Saga Orchestrator]
        COMP[Compensation Handler]
    end

    subgraph "Layer 2 — Search"
        FED[Federated Search]
        RANK[Ranking Strategy]
    end

    subgraph "Layer 1 — Semantic Integration (Existing)"
        OBOX[Outbox Pattern]
        DOM[12 Domain Events]
        HANDLERS[Event Handlers]
    end

    subgraph "Infrastructure"
        DB[(PostgreSQL 17)]
        REDIS[(Redis 8 - planned)]
        RMQ[(RabbitMQ 4 - planned)]
    end

    API --> RL
    API --> AD
    API --> CQRS
    CQRS --> EVT
    EVT --> MSG
    MSG --> DLQ
    EVT --> OBOX
    OBOX --> DB
    SAGA --> CQRS
    SAGA --> COMP
    FED --> RANK
    FED --> DOM
    CACHE --> REDIS
    CFG --> DB
    OBS --> TR
    OBS --> MT
    OBS --> LG
```

## Phase Dependency Graph

```mermaid
graph LR
    P6[Phase 6: Messaging] --> P1[Phase 1: Events]
    P6 --> P2[Phase 2: Sagas]
    P6 --> P7[Phase 7: API Platform]
    P1 --> P2
    P1 --> P8[Phase 8: Search]
    P2 --> P5[Phase 5: Cache]
    P5 --> P3[Phase 3: Observability]
    P3 --> P4[Phase 4: Config]
    P7 --> P3
    P8 --> P5
```

## Module Structure

```
apps/api/src/modules/
├── enterprise-messaging/          # Phase 6: Command/Query/Message buses
├── enterprise-event-architecture/ # Phase 1: Schema registry, replay
├── enterprise-saga/               # Phase 2: Saga orchestration + compensation
├── enterprise-cache/              # Phase 5: Unified cache + invalidation
├── enterprise-observability/      # Phase 3: Tracing + metrics + logging
├── enterprise-config/             # Phase 4: Feature flags + config store
├── enterprise-api-platform/       # Phase 7: API discovery + rate limiting
├── enterprise-search-federation/  # Phase 8: Federated search + ranking
└── semantic-integration/          # Existing: Outbox + 12 events + 2 handlers
```

## Sequence Diagram: Event Flow with Saga

```mermaid
sequenceDiagram
    participant App as Application
    participant Cmd as Command Bus
    participant Saga as Saga Orchestrator
    participant Evt as Event Bus
    participant Out as Outbox
    participant DB as Database
    participant Cache as Cache Manager

    App->>Cmd: execute(Command)
    Cmd->>Saga: startSaga(context)
    Saga->>Saga: create SagaInstance
    Saga->>Evt: publish(SagaStarted)
    Evt->>Out: write to outbox
    Out->>DB: insert event_outbox

    loop steps
        Saga->>Saga: execute step
        Saga->>Evt: publish(StepCompleted)
        Evt->>Out: write to outbox
    end

    Saga->>Saga: mark completed
    Saga->>Evt: publish(SagaCompleted)
    Evt->>Cache: invalidate related cache
    Cache->>Cache: clear by tags
```

## Event Schema Compatibility Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Reg as Schema Registry
    participant Pub as Event Publisher
    participant Bus as Event Bus
    participant Hand as Event Handler

    Dev->>Reg: register(schema v2)
    Reg->>Reg: check backward compat
    Reg-->>Dev: { compatible: true }

    Pub->>Reg: getSchema(eventType)
    Reg-->>Pub: latest schema
    Pub->>Pub: validate payload
    Pub->>Bus: publish(event v2)

    Bus->>Hand: deliver(event)
    Hand->>Reg: getSchema(v1)
    Hand->>Hand: upcast if needed
```

## Rate Limiting Flow

```mermaid
sequenceDiagram
    participant Client as API Client
    participant GW as API Gateway
    participant RL as Rate Limiter
    participant App as Application

    Client->>GW: GET /api/v1/...
    GW->>RL: check(apiKey, tier)
    RL->>RL: token bucket check
    alt allowed
        RL-->>GW: { allowed: true, remaining: 9 }
        GW->>App: forward request
        App-->>GW: response
        GW-->>Client: 200 OK + X-RateLimit headers
    else denied
        RL-->>GW: { allowed: false, retryAfterMs: 30000 }
        GW-->>Client: 429 Too Many Requests
    end
```

## Implementation Status

| Phase | Module | Status | Lines of Code |
|-------|--------|--------|---------------|
| Phase 6 | Enterprise Messaging | Complete | ~250 |
| Phase 1 | Enterprise Event Architecture | Complete | ~200 |
| Phase 2 | Enterprise Saga | Complete | ~250 |
| Phase 5 | Enterprise Cache | Complete | ~200 |
| Phase 3 | Enterprise Observability | Complete | ~200 |
| Phase 4 | Enterprise Config | Complete | ~200 |
| Phase 7 | Enterprise API Platform | Complete | ~170 |
| Phase 8 | Enterprise Search Federation | Complete | ~180 |

## Key Design Decisions

1. **In-process first**: All buses use in-process implementation initially. Redis/RabbitMQ adapters can be added without API changes.
2. **Interface-driven**: All modules define pure TypeScript interfaces with DI tokens for testability.
3. **Global modules**: Messaging, Cache, and Observability are `@Global()` — available everywhere without explicit imports.
4. **Extends existing**: Event Architecture builds on the existing Semantic Integration outbox pattern rather than replacing it.
5. **No external dependencies**: All implementations use built-in Node.js and NestJS features. No new npm packages required.

## Production Readiness

| Aspect | Status | Notes |
|--------|--------|-------|
| Interfaces defined | ✅ | All modules have clean interfaces |
| In-process implementation | ✅ | Working without external infra |
| Redis adapter | 📋 Planned | Phase E2 |
| RabbitMQ adapter | 📋 Planned | Phase E2 |
| Persistent saga storage | 📋 Planned | PostgreSQL saga-store |
| OpenTelemetry exporter | 📋 Planned | Jaeger/Zipkin integration |
| Prometheus scrape endpoint | 📋 Planned | /metrics endpoint |
| Distributed cache invalidation | 📋 Planned | Redis Pub/Sub |
