# Xennic Knowledge Factory (XKF) — Deployment Architecture

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Deployment Model

The XKF deploys alongside the existing Xennic infrastructure as an extension
of the production Docker Compose stack. In production, factory services
run as separate containers within the same Docker network.

### 1.1 Deployment Stages

| Stage | Environment | Services | Scalability |
|-------|-------------|----------|-------------|
| **Alpha** | Single VPS | All factory services (single instance) | Vertical scaling only |
| **Beta** | Multi-node Docker Swarm | Factory services with replicas | Horizontal per service |
| **GA** | Kubernetes (K8s) | All services with HPA | Full auto-scaling |

### 1.2 Container Architecture (Alpha)

```
┌──────────────────────────────────────────────────────────────────┐
│                        Single VPS / VM                          │
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │ Intake │  │Classify│  │ Parse  │  │Extract │  │Resolve │    │
│  │   Svc  │  │  Svc   │  │  Svc   │  │  Svc   │  │  Svc   │    │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘    │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │Normali │  │ Chunk  │  │ Embed  │  │ Enrich │  │Publish │    │
│  │  Svc   │  │  Svc   │  │  Svc   │  │  Svc   │  │  Svc   │    │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘    │
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │Quality │  │  Human │  │Version │  │Lifecyc │                │
│  │ Gate   │  │ Review │  │Manager │  │Manager │                │
│  └────────┘  └────────┘  └────────┘  └────────┘                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Shared Infrastructure                       │    │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐  │    │
│  │  │Postgr│  │Redis │  │RMQ   │  │MinIO │  │ Qdrant   │  │    │
│  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────────┘  │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 1.3 Container Image Strategy

| Service | Base Image | Size Target | Build Trigger |
|---------|-----------|-------------|---------------|
| Intake | `python:3.12-slim` | <200 MB | On change |
| Classify | `python:3.12-slim` | <200 MB | On change |
| Parse | `python:3.12-slim` (+ Tesseract/deps) | <500 MB | On change |
| Extract | `python:3.12-slim` | <300 MB | On change |
| Resolve | `python:3.12-slim` | <200 MB | On change |
| Normalize | `python:3.12-slim` | <200 MB | On change |
| Chunk | `python:3.12-slim` | <200 MB | On change |
| Embed | `python:3.12-slim` (+ ONNX runtime) | <800 MB | On change |
| Enrich | `python:3.12-slim` | <200 MB | On change |
| Publish | `python:3.12-slim` | <200 MB | On change |
| Quality Gate | `python:3.12-slim` | <200 MB | On change |
| Human Review | `node:22-alpine` | <200 MB | On change |

---

## 2. Resource Requirements

### 2.1 Alpha Deployment (1,000 Docs/Day)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 4 cores | 8 cores |
| RAM | 16 GB | 32 GB |
| Disk (SSD) | 100 GB | 200 GB |
| GPU | Optional (CPU embedding) | 1× T4 (for AI extraction) |
| Network | 100 Mbps | 1 Gbps |

### 2.2 Beta Deployment (10,000 Docs/Day)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 16 cores | 32 cores (across 2 nodes) |
| RAM | 64 GB | 128 GB |
| Disk (SSD) | 500 GB | 1 TB |
| GPU | 1× T4 | 2× T4 |
| Network | 1 Gbps | 10 Gbps |

### 2.3 GA Deployment (100,000 Docs/Day)

Kubernetes cluster with:
- 3+ worker nodes (compute-optimized)
- 2 GPU nodes (for AI workloads)
- 3 storage nodes (for Qdrant + PG + MinIO)
- Auto-scaling for factory services (HPA based on queue depth)

---

## 3. CI/CD Pipeline

### 3.1 Build Pipeline

Extends the existing `.github/workflows/ci.yml` with factory service builds:

```
Git push
    │
    ├── Lint & Typecheck (existing)
    ├── Test Node (existing)
    ├── Test Python (existing + factory service tests)
    ├── Docker Build (existing + factory images)
    │
    └── Integration Test
        ├── Start factory services (test mode)
        ├── Upload test document
        ├── Verify pipeline completion
        ├── Query published EKO
        └── Tear down
```

### 3.2 Deploy Pipeline

Extends `.github/workflows/cd-deploy.yml`:

```
Git push to main
    │
    ├── Build & push all factory images to GHCR
    ├── SSH into production
    ├── Pull new images
    ├── docker compose up -d (with factory services)
    ├── Run post-deploy checks
    └── Health check all services
```

---

## 4. Network Architecture

### 4.1 Service Network

```
                    ┌──────────────┐
                    │   Nginx      │
                    │   :443       │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        ┌──────────┐             ┌──────────┐
        │  NestJS  │             │   Web    │
        │  :3000   │             │  :3001   │
        └────┬─────┘             └──────────┘
             │
    ┌────────┴───────────────────────┐
    │         Internal Network       │
    │     (docker network, no外     │
    │      external access)          │
    │                                │
    │  ┌──────────┐ ┌──────────┐    │
    │  │Factory   │ │Factory   │     │
    │  │Services  │ │Stores    │     │
    │  │(:8001-n) │ │(:6333    │     │
    │  │          │ │ :5432    │     │
    │  │          │ │ :9000)   │     │
    │  └──────────┘ └──────────┘    │
    └────────────────────────────────┘
```

### 4.2 Port Allocation

| Service | Internal Port | External | Protocol |
|---------|--------------|----------|----------|
| Intake Service | 8101 | No | HTTP/gRPC |
| Classify Service | 8102 | No | HTTP/gRPC |
| Parse Service | 8103 | No | HTTP/gRPC |
| Extract Service | 8104 | No | HTTP/gRPC |
| Resolve Service | 8105 | No | HTTP/gRPC |
| Normalize Service | 8106 | No | HTTP/gRPC |
| Chunk Service | 8107 | No | HTTP/gRPC |
| Embed Service | 8108 | No | HTTP/gRPC |
| Enrich Service | 8109 | No | HTTP/gRPC |
| Publish Service | 8110 | No | HTTP/gRPC |
| Quality Gate | 8111 | No | HTTP |
| Human Review API | 8112 | No (via NestJS) | HTTP |

---

## 5. Backup & Disaster Recovery

### 5.1 Backup Strategy

| Component | Method | Frequency | Retention |
|-----------|--------|-----------|-----------|
| PostgreSQL | pg_dump custom format | Daily | 30 days |
| Qdrant | Snapshot API | Daily | 14 days |
| MinIO (documents) | S3 replication | Continuous | 90 days |
| MinIO (processed) | S3 replication | Daily | 14 days |
| Repository metadata | pg_dump (included) | Daily | 30 days |

### 5.2 Disaster Recovery Tiers

| Tier | RTO | RPO | Scenario |
|------|-----|-----|----------|
| Tier 1 | <1h | <5min | Single service failure |
| Tier 2 | <4h | <1h | Node/host failure |
| Tier 3 | <24h | <24h | Full region failure |

### 5.3 Recovery Runbook Sequence

```
1. Identify failure scope
2. Stop incoming traffic (Nginx maintenance page)
3. Restore PostgreSQL from latest backup
4. Restore Qdrant from latest snapshot
5. Restore MinIO from S3 replication
6. Verify data consistency (cross-reference EKO counts)
7. Start factory services
8. Verify health of all services
9. Replay any events from DLQ
10. Resume incoming traffic
```
