# XENNIC — Scalability Validation Assessment

**Date:** 2026-07-05
**Sprint:** E2 — Enterprise Production Validation

## 1. Horizontal Scalability Assessment

### NestJS API (Port 3000)

| Aspect | Current State | Scalability | Notes |
|--------|--------------|-------------|-------|
| **Statelessness** | ✅ Stateless (JWT auth, no server-side sessions) | Horizontally scalable | Add instances behind load balancer |
| **Database Connections** | ⚠ Connection pool per instance | Limited by PostgreSQL max_connections | Use PgBouncer for connection pooling |
| **In-Memory Cache** | ⚠ In-process Map (Volatile) | Lost on restart, not shared | Redis adapter needed (Phase E2) |
| **Event Bus** | ⚠ In-process only | Events not shared across instances | RabbitMQ adapter needed (Phase E2) |
| **Saga Instances** | ⚠ In-memory Map | Lost on restart | Persistent saga store needed |

**Horizontal Scaling Strategy:**
```
Load Balancer (nginx/traefik)
        │
    ┌───┴───┐
    │       │
  API-1   API-2   API-N
    │       │       │
    └───────┼───────┘
            │
      PostgreSQL (primary)
            │
      PgBouncer (pooling)
```

### Python Microservices

| Service | Current State | Scalability | Notes |
|---------|--------------|-------------|-------|
| Engineering (8001) | ✅ Stateless (FastAPI) | Horizontally scalable | Circuit breaker in NestJS client |
| AI (8002) | ✅ Stateless (FastAPI) | Horizontally scalable | LLM calls may be bottleneck |
| Vision (8003) | ✅ Stateless (FastAPI) | Horizontally scalable | Document processing is CPU-bound |

### Web Application (Next.js, Port 3001)

| Aspect | Current State | Scalability | Notes |
|--------|--------------|-------------|-------|
| **Rendering** | ⚠ Standalone output with i18n | Horizontally scalable | Static pages via ISR |
| **Session** | ✅ Stateless (JWT) | Horizontally scalable | No server-side sessions |
| **i18n** | ⚠ Server-side locale detection | Works with sticky sessions or cookie-based |

## 2. Component Scaling Limits

### PostgreSQL (Primary)

| Metric | Current Limit | Estimated Capacity | Scaling Path |
|--------|--------------|-------------------|-------------|
| Connections | 100 (default) | ~500 with PgBouncer | PgBouncer → Read replicas |
| Storage | Volume-bound | TB-scale with volume expansion | Sharding (CitusDB) |
| Write throughput | Single primary | ~5K writes/sec | Read replicas for reads only |
| Query complexity | Optimized | Degrades with data growth | Index tuning → Partitioning |

### Redis (Planned)

| Metric | Capacity | Scaling Path |
|--------|----------|-------------|
| Memory | Instance-bound | Redis Cluster |
| Throughput | ~100K ops/sec | Cluster mode |
| Persistence | RDB/AOF | Replication |

### RabbitMQ (Planned)

| Metric | Capacity | Scaling Path |
|--------|----------|-------------|
| Queues | Thousands | Cluster mode |
| Throughput | ~10K msg/sec | Queue sharding |
| Durability | Disk-bound | Replication factor |

## 3. Kubernetes Readiness Assessment

| Aspect | Readiness | Requirements |
|--------|-----------|-------------|
| **Containerized** | ✅ | Dockerfiles exist for all services |
| **Health Checks** | ✅ | /health endpoints on all services |
| **Graceful Shutdown** | ✅ | validate-startup-order.sh patterns |
| **Configuration** | ⚠ | Env vars need ConfigMap/Secret mapping |
| **Persistent Volumes** | ⚠ | PostgreSQL, MinIO, Qdrant need PVCs |
| **Ingress** | ⚠ | Needs Ingress controller config |
| **Service Discovery** | ⚠ | DNS-based, needs headless services |
| **Resource Limits** | ⚠ | Not defined in Docker Compose |
| **Horizontal Pod Autoscaler** | ⚠ | Needs CPU/mem metrics |
| **Pod Disruption Budgets** | ⚠ | Not defined |

### Required K8s Manifests (Not Yet Created)

```yaml
# Required for each service:
# - Deployment (with resource limits, probes)
# - Service (ClusterIP)
# - ConfigMap (env vars)
# - Secret (credentials, JWT keys)

# Infrastructure:
# - StatefulSet for PostgreSQL
# - StatefulSet for Redis
# - StatefulSet for RabbitMQ
# - Deployment for MinIO
# - StatefulSet for Qdrant

# Platform:
# - Ingress (nginx-ingress or traefik)
# - HorizontalPodAutoscaler
# - PodDisruptionBudget
# - NetworkPolicy
```

## 4. Current Scaling Limits Summary

| Component | Horizontal Scaling | Vertical Scaling | Notes |
|-----------|-------------------|-----------------|-------|
| NestJS API | ✅ Ready | ✅ | No state shared in-process |
| Next.js Web | ✅ Ready | ✅ | Static generation offloads |
| Engineering Service | ✅ Ready | ✅ | Stateless Python |
| AI Service | ✅ Ready | ⚠ GPU-dependent | LLM inference bottleneck |
| Vision Service | ✅ Ready | ⚠ CPU-intensive | Processing time linear |
| PostgreSQL | ⚠ PgBouncer needed | ✅ | Primary bottleneck |
| In-Memory Cache | ❌ Not shared | ✅ | Redis adapter required |
| In-Process Events | ❌ Not shared | ✅ | RabbitMQ adapter required |
| Saga Store | ❌ Not shared | ✅ | PostgreSQL persistence needed |

## 5. Scaling Recommendations

### Immediate (Pre-Production)
1. Add PgBouncer for PostgreSQL connection pooling
2. Define Kubernetes resource limits for all containers
3. Create K8s Deployment + Service manifests for all services

### Short-Term (Next Sprint)
1. Implement Redis adapter for enterprise-messaging (Phase E2)
2. Implement RabbitMQ adapter for event bus (Phase E2)
3. Implement persistent saga store in PostgreSQL

### Medium-Term
1. Multi-instance API deployment with nginx load balancing
2. PostgreSQL read replicas for search/reporting queries
3. Redis Cluster for cache high-availability

### Long-Term
1. Kubernetes migration with HPA
2. Database sharding (CitusDB or similar)
3. Event sourcing for complete audit trail
