# Performance Baseline Report

**Generated:** Run `infrastructure/scripts/benchmark.sh` to populate.
**Environment:** Production-like (Docker Compose stack)

## Scope

Measurements cover the critical API paths and external service interactions.

## Metrics

### API Latency (ms)

| Endpoint              | Avg | P50 | P95 | P99 | Max |
| --------------------- | --- | --- | --- | --- | --- |
| API Health            | —   | —   | —   | —   | —   |
| Knowledge List        | —   | —   | —   | —   | —   |
| Knowledge Create      | —   | —   | —   | —   | —   |
| Knowledge Publish     | —   | —   | —   | —   | —   |
| Engineering Health    | —   | —   | —   | —   | —   |
| Engineering Calculate | —   | —   | —   | —   | —   |
| Search                | —   | —   | —   | —   | —   |
| Event Outbox Poll     | —   | —   | —   | —   | —   |

### Knowledge Publish Latency (ms)

| Stage               | Avg | P95 |
| ------------------- | --- | --- |
| Total End-to-End    | —   | —   |
| DB Write            | —   | —   |
| Event Publication   | —   | —   |
| Graph Update        | —   | —   |
| Metrics Calculation | —   | —   |
| Cache Invalidation  | —   | —   |

### Queue Throughput

| Queue             | Rate (msg/s) | Backlog |
| ----------------- | ------------ | ------- |
| knowledge-publish | —            | —       |
| document-process  | —            | —       |
| event-outbox      | —            | —       |

### Resource Usage

| Service             | CPU (%) | Memory |
| ------------------- | ------- | ------ |
| API (NestJS)        | —       | —      |
| PostgreSQL 17       | —       | —      |
| Redis 8             | —       | —      |
| RabbitMQ 4          | —       | —      |
| Engineering Service | —       | —      |
| Vision Service      | —       | —      |
| AI Service          | —       | —      |
| Qdrant              | —       | —      |

## Targets

| Metric                    | Target      | Measured |
| ------------------------- | ----------- | -------- |
| API P95 latency           | < 500ms     | —        |
| Knowledge publish E2E     | < 5s        | —        |
| Engineering calculate P95 | < 2s        | —        |
| Hybrid search P95         | < 1s        | —        |
| Queue throughput          | > 100 msg/s | —        |
| API memory usage          | < 512MB     | —        |

## Recommendations

(Filled after benchmark execution)
