# SMOS-720 — Global Orchestrator

## 1. Document Control

| Field          | Value                                   |
| -------------- | --------------------------------------- |
| Document ID    | SMOS-720                                |
| Document Name  | Global Orchestrator                     |
| Phase          | P7.S03                                  |
| Version        | 1.0.0-draft                             |
| Status         | Draft                                   |
| Classification | Enterprise Architecture — Control Plane |
| Owner          | Xennic                                  |
| Created        | 2026-07-01                              |
| Supersedes     | —                                       |

## 2. Purpose & Scope

The **Global Orchestrator** is the central coordination engine of the SMOS Control Plane. It manages cross-component, cross-region, and cross-tenant orchestration, ensuring that every execution, agent interaction, workflow, and policy decision is coordinated, monitored, and governed.

**Scope:** Workflow orchestration, agent orchestration, cross-region coordination, queue management, state management, and execution supervision.

## 3. Orchestrator Architecture

```mermaid
graph TB
    subgraph "Global Orchestrator"
        direction TB
        GOR[Global Orchestrator Router]

        subgraph "Orchestration Engines"
            WO[Workflow Orchestrator]
            AO[Agent Orchestrator]
            XO[Cross-Region Orchestrator]
        end

        subgraph "State Management"
            SM[State Manager]
            TM[Transaction Manager]
            LM[Lock Manager]
        end

        subgraph "Queue Management"
            GQM[Global Queue Manager]
            PM[Priority Manager]
            DLQ[Dead Letter Queue]
        end

        subgraph "Coordination"
            CO[Coordination Service]
            LE[Leader Election]
            CM[Cluster Membership]
        end

        subgraph "Observation"
            OM[Orchestrator Monitor]
            OH[Orchestrator Health]
            OA[Orchestrator Auditor]
        end
    end

    GOR --> WO
    GOR --> AO
    GOR --> XO

    WO --> SM
    AO --> SM
    XO --> SM

    SM --> TM
    SM --> LM

    GOR --> GQM
    GQM --> PM
    GQM --> DLQ

    GOR --> CO
    CO --> LE
    CO --> CM

    OM --> OH
    OM --> OA

    subgraph "Runtime Engine (SMOS-710..718)"
        WFE[SMOS-710 Workflow Engine]
        DIST[SMOS-712 Distributed Exec]
        CHK[SMOS-713 Checkpoint]
        SAGA[SMOS-714 Saga]
        TEL[SMOS-715 Telemetry]
    end

    WO --> WFE
    XO --> DIST
    SM --> CHK
    TM --> SAGA
    OM --> TEL

    style GOR fill:#2c3e50,color:#fff
    style WO fill:#2980b9,color:#fff
    style AO fill:#27ae60,color:#fff
    style XO fill:#8e44ad,color:#fff
    style SM fill:#f39c12,color:#fff
    style GQM fill:#e74c3c,color:#fff
    style CO fill:#16a085,color:#fff
    style OM fill:#7f8c8d,color:#fff
```

## 4. Workflow Orchestrator

Manages cross-runtime workflow execution runs:

| Responsibility              | Description                                         |
| --------------------------- | --------------------------------------------------- |
| Global Workflow Execution   | Orchestrates workflow runs across runtime instances |
| Workflow Version Management | Routes to correct workflow version                  |
| Workflow State Coordination | Synchronizes state across workflow steps            |
| Workflow Event Handling     | Responds to workflow lifecycle events               |
| Workflow Error Management   | Coordinates error recovery and compensation         |

## 5. Agent Orchestrator

Coordinates multi-agent collaboration:

```mermaid
sequenceDiagram
    participant AO as Agent Orchestrator
    participant A1 as AI-001 Strategy
    participant A2 as AI-002 Planning
    participant A3 as AI-003 Production
    participant A4 as AI-004 Review
    participant A8 as AI-008 Publishing

    AO->>A1: Strategic Goal
    A1-->>AO: Content Strategy

    AO->>A2: Strategy
    A2-->>AO: Content Plan

    AO->>A3: Plan
    A3-->>AO: Content Asset

    AO->>A4: Asset
    A4-->>AO: Review Result

    alt Approved
        AO->>A8: Publish
        A8-->>AO: Publication Result
    else Revision Needed
        AO->>A3: Revision Request
        A3-->>AO: Revised Asset
        AO->>A4: Re-review
        A4-->>AO: Final Approval
        AO->>A8: Publish
        A8-->>AO: Publication Result
    end
```

## 6. Cross-Region Orchestrator

Coordinates execution across multiple geographic regions:

| Capability            | Description                                 |
| --------------------- | ------------------------------------------- |
| Regional Routing      | Routes workflow execution to optimal region |
| State Synchronization | Syncs workflow state across regions         |
| Cross-Region Saga     | Coordinates distributed saga across regions |
| Region Affinity       | Keeps workflows within preferred region     |
| Region Failover       | Transfers execution on region failure       |

## 7. Global Queue Manager

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GlobalQueue",
  "type": "object",
  "required": ["queue_id", "name", "queue_type", "tenants"],
  "properties": {
    "queue_id": { "type": "string" },
    "name": { "type": "string" },
    "queue_type": {
      "type": "string",
      "enum": ["workflow", "agent", "event", "compensation", "audit"]
    },
    "tenants": { "type": "array", "items": { "type": "string" } },
    "priorities": { "type": "array", "items": { "type": "integer" } },
    "max_depth": { "type": "integer" },
    "dead_letter_target": { "type": "string" },
    "scheduling": {
      "type": "object",
      "properties": {
        "strategy": { "type": "string", "enum": ["fifo", "priority", "weighted", "deadline"] },
        "weight": { "type": "number" }
      }
    }
  }
}
```

## 8. Orchestrator State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Orchestrating: execution_request
    Idle --> Recovering: recovery_request

    Orchestrating --> Coordinating: cross_component
    Orchestrating --> Suspended: error_detected

    Coordinating --> Finalizing: all_coordinated
    Coordinating --> Suspended: coordination_error

    Finalizing --> Idle: execution_complete
    Finalizing --> Compensating: execution_failed

    Compensating --> Idle: compensated
    Compensating --> Failed_Orchestration: compensation_error

    Suspended --> Recovering: resume_signal
    Suspended --> Failed_Orchestration: unrecoverable

    Recovering --> Orchestrating: recovered
    Recovering --> Idle: recovery_complete

    Failed_Orchestration --> [*]
```

## 9. Discovery & Registration

All orchestration targets register with the Global Orchestrator:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OrchestrationTarget",
  "type": "object",
  "required": ["target_id", "type", "capabilities", "region", "status"],
  "properties": {
    "target_id": { "type": "string" },
    "type": { "type": "string", "enum": ["runtime", "agent", "workflow", "region"] },
    "capabilities": { "type": "array", "items": { "type": "string" } },
    "region": { "type": "string" },
    "status": { "type": "string", "enum": ["active", "draining", "paused", "offline"] },
    "load": { "type": "number", "minimum": 0, "maximum": 1 },
    "tenants": { "type": "array", "items": { "type": "string" } },
    "last_heartbeat": { "type": "string", "format": "date-time" },
    "metadata": { "type": "object" }
  }
}
```

## 10. Orchestration Policies

| Policy | Scope     | Description                              |
| ------ | --------- | ---------------------------------------- |
| ORP-01 | Routing   | Route to least-loaded runtime            |
| ORP-02 | Affinity  | Keep sequential steps in same region     |
| ORP-03 | Retry     | Automatic retry with exponential backoff |
| ORP-04 | Timeout   | SLA-based execution deadlines            |
| ORP-05 | Fallback  | Fallback to secondary region on failure  |
| ORP-06 | Quota     | Per-tenant orchestration quotas          |
| ORP-07 | Isolation | Isolate tenant workflows                 |
| ORP-08 | Audit     | Audit all orchestration decisions        |

## 11. Flow: Content Plan → Publish

```mermaid
sequenceDiagram
    participant OR as Global Orchestrator
    participant WQ as Workflow Queue
    participant WO as Workflow Orchestrator
    participant A2 as AI-002 Planning
    participant A3 as AI-003 Production
    participant A6 as AI-006 Media
    participant A4 as AI-004 Review
    participant A8 as AI-008 Publish
    participant TEL as Telemetry

    OR->>WQ: Enqueue(content_plan)
    WQ->>WO: Dequeue
    WO->>A2: Execute Plan
    A2-->>WO: Plan(assets)
    WO->>WQ: Enqueue(production, assets)

    WQ->>WO: Dequeue(production)
    par Production
        WO->>A3: Execute(text_asset)
        WO->>A6: Execute(media_asset)
    end
    A3-->>WO: text_asset
    A6-->>WO: media_asset

    WO->>A4: Review(asset)
    A4-->>WO: approved

    WO->>A8: Publish(asset)
    A8-->>WO: published

    WO->>TEL: record_execution
    TEL-->>OR: execution_complete
```

## 12. Dead Letter Queue Management

| Trigger              | Action      | Escalation               |
| -------------------- | ----------- | ------------------------ |
| Max retries exceeded | Move to DLQ | Alert orchestrator admin |
| Invalid payload      | Move to DLQ | Log, notify source       |
| Unhandled error      | Move to DLQ | Create incident          |
| Policy violation     | Move to DLQ | Notify governance        |
| Timeout              | Move to DLQ | Schedule retry           |

## 13. Orchestrator Metrics

| Metric                      | Description                  | Unit  |
| --------------------------- | ---------------------------- | ----- |
| orchestrations_per_second   | Throughput                   | ops/s |
| orchestration_duration      | Execution time               | ms    |
| queue_depth                 | Current queue depth          | items |
| queue_latency               | Average enqueue→dequeue time | ms    |
| failed_orchestrations       | Total failures               | count |
| compensation_executions     | Compensation runs            | count |
| cross_region_orchestrations | Cross-region count           | count |
| active_workflows            | Currently active             | count |
| registered_targets          | Total targets                | count |

## 14. Orchestrator Events

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OrchestratorEvent",
  "type": "object",
  "required": ["event_id", "event_type", "timestamp", "source", "data"],
  "properties": {
    "event_id": { "type": "string" },
    "event_type": {
      "type": "string",
      "enum": [
        "orchestration_started",
        "orchestration_completed",
        "orchestration_failed",
        "orchestration_compensated",
        "target_registered",
        "target_deregistered",
        "queue_depth_exceeded",
        "dead_letter_created",
        "cross_region_triggered",
        "cross_region_completed"
      ]
    },
    "timestamp": { "type": "string", "format": "date-time" },
    "source": { "type": "string" },
    "data": { "type": "object" },
    "correlation_id": { "type": "string" }
  }
}
```

## 15. Cross-Reference Matrix

| Document | Relationship                                                                |
| -------- | --------------------------------------------------------------------------- |
| SMOS-704 | Workflow orchestration — Global Orchestrator extends to cross-runtime scope |
| SMOS-705 | Event architecture — orchestrator emits and consumes events                 |
| SMOS-710 | Workflow Engine — orchestrator coordinates engine instances                 |
| SMOS-712 | Distributed Execution — orchestrator provides cross-region coordination     |
| SMOS-714 | Saga compensation — orchestrator orchestrates compensation flows            |
| SMOS-715 | Telemetry — orchestrator reports metrics                                    |
| SMOS-719 | Control Plane — orchestrator is the core component                          |
| AI-014   | Enterprise Orchestrator — integrated for agent orchestration                |
| AUT-\*   | Automation — workflows registered and orchestrated                          |

---

**End of SMOS-720**
