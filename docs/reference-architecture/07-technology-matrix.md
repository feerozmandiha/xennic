# 7. Technology Matrix

> **Version:** 1.0.0 | **Status:** Living Document | **Last Updated:** Tir 1405 (June 2026)

Every technology in the Xennic platform, with rationale, location, trade-offs, and upgrade path.

---

## 7.1 NestJS

| Attribute | Value |
|-----------|-------|
| **Version** | ^11.1.24 |
| **Location** | `apps/api/` |
| **Status** | **Active** |

**Problem it solves:** Provides a structured, opinionated framework for building the central REST API. Without it, the Node.js backend would require manual wiring of controllers, providers, middleware, guards, interceptors, pipes, and modules — leading to inconsistent patterns across 24+ modules.

**Why NestJS over alternatives:**
- **vs Express raw**: NestJS provides modular architecture (modules, providers, controllers), decorator-based routing, dependency injection, guards/interceptors/pipes — Express alone has none of this built-in.
- **vs Fastify raw**: NestJS abstracts the HTTP adapter so you can swap Express for Fastify without changing business logic.
- **vs Next.js API routes**: Next.js API routes are file-based, lack DI, module isolation, and are tightly coupled to the web layer.
- **vs Hono**: Smaller ecosystem, fewer enterprise integrations (Swagger, Throttler, JWT, Passport). NestJS has richer decorators, a CLI, and a mature testing framework.

**Fastify adapter:** Chosen over Express for ~2× request throughput, lower memory footprint, and built-in schema serialization (`fast-json-stringify`). NestJS's `@nestjs/platform-fastify` bridges NestJS decorators to Fastify's lifecycle without sacrificing the DI and module system.

**Module architecture:** Each domain has its own module (`AuthModule`, `EngineeringModule`, `KnowledgeModule`, etc.) following DDD boundaries. Modules import only what they need, keeping the dependency graph acyclic. The root `ApiModule` imports all 24 feature modules plus `ThrottlerModule.forRoot()` with three named rate-limit tiers (short/medium/long).

**Dependency injection:** NestJS's DI container manages singleton providers, request-scoped services, and custom providers. Constructor-based injection ensures testability — every service can be mocked by providing an alternative provider in test modules.

**Risks/concerns:** Framework coupling — migrating away would require rewiring all decorators. `reflect-metadata` dependency required at import time (handled by `import 'reflect-metadata'` in `main.ts`). TypeScript experimental decorators (`experimentalDecorators: true`) are required, tying the project to a TC39 stage-3 feature.

**Upgrade path:** NestJS follows semver; minor bumps are straightforward. Major bumps (v10→v11 required updating `@nestjs/platform-fastify` to match Fastify v5). Follow `nestjs.com/migration-guide`.

---

## 7.2 FastAPI

| Attribute | Value |
|-----------|-------|
| **Version** | 0.115.12 |
| **Location** | `workspace/services/engineering-service/`, `workspace/services/ai-service/`, `workspace/services/vision-service/` |
| **Status** | **Active** |

**Problem it solves:** Provides a high-performance, type-safe Python web framework for microservices that require Python's scientific/AI ecosystem (NumPy, SciPy, LangChain, Qdrant client).

**Why FastAPI over alternatives:**
- **vs Flask/ Django REST**: FastAPI is ~3× faster due to Starlette async under the hood, has automatic OpenAPI generation, and Pydantic-based request/response validation with zero boilerplate.
- **vs Flask**: Flask lacks async, has no built-in validation, and requires Flask-RESTx or marshmallow for schema generation. FastAPI gives all of this natively.
- **vs Django REST**: Heavier, synchronous by default, steeper learning curve, overkill for single-responsibility microservices.
- **vs Quart**: Smaller ecosystem, fewer integrations, less community adoption.

**Pydantic validation:** Every request/response model is a Pydantic v2 model providing:
- Automatic type coercion and validation (e.g., `int` fields reject strings).
- JSON Schema generation → OpenAPI spec → auto-generated client docs.
- `pydantic-settings` for environment variable loading with type coercion.

**Current services:**
| Service | Port | Purpose |
|---------|------|---------|
| `engineering-service` | 8001 | Electrical engineering calculations (numpy, scipy, sympy, pandapower, pint) |
| `ai-service` | 8002 | LLM orchestration, RAG, multi-provider AI (OpenAI, Anthropic, Google, LangChain, LangGraph) |
| `vision-service` | 8003 | OCR, document classification, image processing |

**Risks/concerns:** Managing three separate Python venvs (or container images) adds operational overhead. Version conflicts between services could arise if shared dependencies drift. Type checking is opt-in via `mypy` — not enforced at the framework level like TypeScript.

**Upgrade path:** Pinned versions in `requirements.txt`. Run `pip install --upgrade fastapi` and test against existing test suite. Major FastAPI releases are rare and well-documented.

---

## 7.3 Next.js

| Attribute | Value |
|-----------|-------|
| **Version** | 15.3.2 |
| **Location** | `apps/web/` |
| **Status** | **Active** |

**Problem it solves:** Provides a full-stack React framework with SSR, static generation, API rewriting, and i18n — required for a bilingual (FA/EN), SEO-sensitive engineering platform.

**Why Next.js 15 over alternatives:**
- **vs Vite + React Router**: Lacks SSR, file-based routing, image optimization, built-in i18n support, and standalone output for containerized deployment.
- **vs Remix**: Smaller ecosystem, fewer deployment targets, weaker i18n story. Next.js has `next-intl` integration.
- **vs SPA (pure React)**: Zero SEO without SSR/SSG, slower initial load, no API rewrites for microservice proxying.
- **vs Gatsby**: Primarily static-site focused. Xennic needs dynamic SSR for authenticated pages and real-time data.

**App Router:** React Server Components by default. Pages at `app/[locale]/` leverage server components for data fetching, reducing client-side JS. Client components are explicitly marked with `'use client'`.

**SSR vs CSR:** Strategy depends on route:
- Public pages (landing, login): SSR for SEO.
- Authenticated app pages (dashboard, projects): mix of server components for initial data, client components for interactivity.
- Engineering calculators: mostly client-side for real-time computation feedback.

**Standalone output:** `next.config.ts` sets `output: 'standalone'`, producing a self-contained deployment with `node_modules` pruned to only production deps. Reduces Docker image size by ~80%.

**i18n with next-intl:** `next-intl` v4 provides:
- Middleware-based locale detection (`middleware.ts` redirects `/` → `/fa`).
- Two locales: `fa` (Persian, default) and `en` (English).
- `localePrefix: 'always'` — every URL includes the locale.
- Messages in `src/i18n/messages/{fa,en}.json`.
- Pathname mapping in `routing.ts` for consistent routing across locales.

**Risks/concerns:** Frequent Next.js major releases (13→14→15 in 18 months) require migration effort. RSC boundary leaks are easy to introduce accidentally (importing a server module into a client component). Standalone output changes layout between versions.

**Upgrade path:** Run `next@canary` in CI for early detection. Follow `nextjs.org/docs/app/building-your-application/upgrading`. The `next-intl` v4→v5 upgrade guide should be reviewed in tandem.

---

## 7.4 RabbitMQ

| Attribute | Value |
|-----------|-------|
| **Version** | 4.x (`rabbitmq:4-management`) |
| **Location** | `infrastructure/docker/compose/` — container, not yet wired in application code |
| **Status** | **Planned (infrastructure ready, code pending)** |

**Problem it solves:** Provides reliable asynchronous message passing between microservices for event-driven workflows — calculation completion notifications, PDF generation triggers, cross-service data sync.

**Why RabbitMQ over alternatives:**
- **vs Apache Kafka**: Kafka is optimized for high-throughput append-only logs, replay, and stream processing. Xennic's needs are simpler: task queues, RPC-style callbacks, and pub/sub with routing. RabbitMQ's exchange topology is a better fit for targeted message delivery. Kafka adds ZooKeeper/KRaft operational overhead.
- **vs Redis pub/sub / BullMQ**: Redis pub/sub is fire-and-forget (no persistence, no delivery guarantees). BullMQ (backed by Redis) provides queues but not the rich exchange types or AMQP interoperability that RabbitMQ offers. Xennic may have non-Node consumers in the future.
- **vs Amazon SQS / Google PubSub**: Cloud-vendor lock-in. RabbitMQ runs on-prem or in any cloud consistently.
- **vs NATS / Pulsar**: Less mature ecosystem, smaller community, fewer management tools.

**Exchange topology (planned):**
- **Direct exchange** (`xennic.direct`): Routing by task type (e.g., `calc.complete`, `pdf.generate`).
- **Topic exchange** (`xennic.topic`): Multi-criteria routing (e.g., `workspace.123.calculation.complete`).
- **Dead letter exchange**: Automatic routing of failed messages to a retry/DLQ queue.

**Delivery guarantees:** At-least-once delivery with consumer acknowledgements. Messages persisted to disk. Dead-letter + retry queue with TTL-based redelivery.

**Risks/concerns:** Not yet wired in application code (confirmed in `01-system-landscape.md`: "configured, not yet wired in code"). Operational overhead of maintaining RabbitMQ cluster. Message schema evolution requires careful planning.

**Upgrade path:** AMQP 0-9-1 is stable. RabbitMQ 4.x is latest; upgrade by pulling new Docker image. Monitor for Erlang version compatibility.

---

## 7.5 Redis

| Attribute | Value |
|-----------|-------|
| **Version** | 8.x (`redis:8-alpine`) |
| **Location** | `infrastructure/docker/compose/` — container only; configured with password and AOF persistence |
| **Status** | **Active (infrastructure deployed, code usage pending rate limiting and caching)** |

**Problem it solves:** In-memory data store for low-latency caching, session management, rate limiting counters, and (future) AI response caching.

**Why Redis over alternatives:**
- **vs Memcached**: Redis supports rich data structures (sorted sets for rate limiting, hashes for session data, streams for event logs), persistence (AOF/RDB), and built-in replication. Memcached is a simple key-value cache with no persistence.
- **vs in-memory Map**: Not shared across processes/instances, lost on restart, no TTL.
- **vs KeyDB / Dragonfly**: Both are Redis-compatible forks with better multi-threaded performance. Redis 8 natively added multi-threading and has a larger ecosystem. Dragonfly is compelling for high-throughput scenarios but has a smaller community.

**Use cases:**
| Use case | Status | Key pattern |
|----------|--------|-------------|
| JWT blacklist | Planned | `blacklist:{jti}` — TTL = remaining token lifetime |
| AI response cache | Planned | `ai:cache:{prompt_hash}` — TTL = configurable |
| Rate limiting | Planned (ThrottlerModule uses it) | `throttler:{key}:{timestamp}` |
| Session store | Planned | `session:{sid}` |
| BullMQ queues | Considered as alternative to RabbitMQ | `bull:{queue}:*` |

**Risks/concerns:** Single-threaded by default (Redis 8 adds some multi-threading but not for all operations). Memory-bound — cache eviction policy must be configured (allkeys-lru). No built-in authentication encryption (password + TLS recommended). Password currently in plaintext in compose file.

**Upgrade path:** Redis 8 → 9 when available. Redis has strong backwards compatibility within major versions. Pinned to `redis:8-alpine` — bump minor by pulling new image.

---

## 7.6 PostgreSQL 17

| Attribute | Value |
|-----------|-------|
| **Version** | 17 (`postgres:17-alpine`) |
| **Location** | `infrastructure/docker/compose/` — primary database |
| **Status** | **Active** |

**Problem it solves:** Relational database for all transactional, structured data — 61 models across identity, workspace, subscription, billing, project, engineering, AI, knowledge, marketplace, storage, API, notification, and admin domains.

**Why PostgreSQL over alternatives:**
- **vs MySQL**: Better SQL compliance (CTEs, window functions, recursive queries, `ON CONFLICT`), superior JSONB support, more advanced indexing (GiST, GIN, BRIN), full-text search (`tsvector`/`tsquery`). PostgreSQL 17 performance is at parity or better.
- **vs SQLite**: Not multi-user or concurrent-write friendly. Cannot handle the connection loads of a SaaS platform.
- **vs CockroachDB / YugabyteDB**: Distributed SQL is overkill for single-region deployment. Adds latency, complexity, and cost. PostgreSQL + PgBouncer + read replicas scales sufficiently.
- **vs MongoDB**: Document stores work for some use cases but lack joins, foreign key constraints, and transactional guarantees across collections. Xennic's relational data model (workspace → user → project → calculation) demands referential integrity.
- **vs Amazon Aurora**: Vendor lock-in. PostgreSQL runs identically on-prem, in any cloud, or in containers. Aurora's benefits (auto-scaling storage, faster failover) are not yet needed.

**Multi-tenant schema:** Row-level isolation via `workspace_id` on every tenant-scoped model. The Prisma tenant extension middleware automatically injects `workspace_id` filters on queries, preventing cross-tenant data leaks.

**Full-text search:** `knowledge.search_text` uses `tsvector`/`tsquery` for Persian/English FTS on knowledge articles. Additional FTS is handled by Meilisearch (see .env.example) for global search across entities.

**JSONB support:** Used extensively for flexible schemas — `calculations.inputs`/`results`, `knowledge.content` (block-based), `workspace_settings.settings`, `products.specifications`, `audit_logs.old_values`/`new_values`. JSONB allows indexing (GIN) for querying into JSON structures.

**Risks/concerns:** Connection exhaustion under load — mitigated by PgBouncer (transaction pooling). Full-text search performance degrades at scale without proper indexing. JSONB queries without GIN indexes are slow. Vacuuming required for MVCC bloat management.

**Upgrade path:** `postgres:17-alpine` → `postgres:18-alpine` when available. PostgreSQL upgrades require `pg_upgrade` or dump/restore. Test in staging first.

---

## 7.7 Prisma

| Attribute | Value |
|-----------|-------|
| **Version** | ^6.19.3 |
| **Location** | `prisma/schema.prisma`, `packages/database/src/` |
| **Status** | **Active** |

**Problem it solves:** Type-safe database access with auto-generated client, schema-first migrations, and the tenant isolation extension pattern.

**Why Prisma over alternatives:**
- **vs TypeORM**: Prisma generates fully typed clients — queries return typed objects without manual entity definitions. Migration management is declarative (`prisma migrate`). TypeORM has a history of API instability, slower adoption of new TypeScript features, and less intuitive relation handling.
- **vs Drizzle ORM**: Drizzle is SQL-like and lighter weight. However, Prisma's migration engine is more mature, the `prisma studio` GUI is useful for development, and the `$extends` API (used for tenant isolation) is elegant. Drizzle's zero-dependency approach is appealing, but Prisma's generated client reduces boilerplate significantly for 61 models.
- **vs Knex.js**: Knex is a query builder, not an ORM. No type-safe results, no migrations (requires `knex migrate` but no schema diffing). Prisma provides both.
- **vs MikroORM**: More complex, smaller community, fewer learning resources. Prisma has wider adoption and better DX.

**Type safety:** The generated `@prisma/client` mirrors the schema exactly — every query returns typed results, every `where` clause is typed, every relation is type-checked at compile time.

**Migration management:** `prisma migrate dev` generates SQL from schema changes. `prisma migrate deploy` applies in production. The workflow is `schema.prisma` → `prisma migrate dev --name desc` → commit migration SQL files.

**Tenant extension:** `packages/database/src/tenant-extension.ts` uses `Prisma.defineExtension` to intercept all `$allOperations` and inject `workspace_id` into queries for the 28 models listed in `MODELS_WITH_WORKSPACE_ID`. The `TenantContext` class uses `AsyncLocalStorage` to propagate the workspace ID across async boundaries without manual parameter passing.

**Risks/concerns:** Prisma generates a large client bundle (includes the query engine binary). The `prisma:generate` step is required after schema changes and after `node_modules` reinstalls. Some complex SQL (window functions, CTEs) requires raw queries. Version 6 → 7 migrations may require schema revalidation.

**Upgrade path:** Prisma follows semver. Run `npx prisma validate` after upgrading. Test the generated client against the test suite. The query engine binary must match the host OS — ensure Docker images include the correct `prisma-engine` for `linux/amd64`.

---

## 7.8 Qdrant

| Attribute | Value |
|-----------|-------|
| **Version** | v1.13.0 (`qdrant/qdrant:v1.13.0`) |
| **Location** | `workspace/docker-compose.yml` — dedicated compose file |
| **Status** | **Active (infrastructure deployed, code usage targeted for RAG)** |

**Problem it solves:** Vector database for semantic search over knowledge articles, engineering documentation, and AI-generated embeddings in the RAG pipeline.

**Why Qdrant over alternatives:**
- **vs Pinecone / Weaviate / Milvus**: Qdrant is self-hosted (no vendor lock-in, no per-vector pricing), written in Rust (performance), and has a compact single-binary deployment. No dependency on Kubernetes for basic operation.
- **vs pgvector (PostgreSQL extension)**: pgvector is simple to set up (same DB) but slower at scale (no HNSW indexing, no filtering during search). Qdrant's HNSW index + payload filtering is significantly faster for 100k+ vectors. Qdrant also supports CRUD on payloads, quantization, and multi-vector configs.
- **vs Chroma**: Simpler but less performant, fewer filtering capabilities, smaller community.
- **vs Elasticsearch**: Primarily a text search engine; vector support is bolted-on. Qdrant is purpose-built for vectors.

**Performance:** HNSW index with configurable `ef_construct` and `m` parameters. Payload filtering is applied before vector search (pre-filtering), avoiding full scan on large collections. Binary quantization support for memory-efficient storage.

**Filtering:** Each point stores payload (e.g., `workspace_id`, `language`, `category`, `standard_code`). Filters can combine `must`/`should`/`must_not` conditions with range, match, geo, and nested filters — critical for multi-tenant RAG where results must be scoped per workspace.

**Bilingual embedding support:** Farsi and English embeddings stored in the same collection with a `language` payload field for filtering. Supports any embedding model through the vector API.

**Risks/concerns:** Requires separate infrastructure (dedicated compose file). Not yet wired into the AI service's RAG pipeline in production code (the `ai-service/requirements.txt` includes `qdrant-client==1.12.1`, indicating usage is in development). RAM usage scales with vector count and HNSW graph size.

**Upgrade path:** Qdrant is backwards compatible within v1.x. Upgrade by pulling new Docker image. Check release notes for index format changes.

---

## 7.9 MinIO

| Attribute | Value |
|-----------|-------|
| **Version** | latest (`minio/minio:latest`) |
| **Location** | `infrastructure/docker/compose/` |
| **Status** | **Active (infrastructure deployed, code usage in `apps/api` via `minio` npm package)** |

**Problem it solves:** S3-compatible object storage for engineering documents (PDFs, CAD files, images), user uploads, AI model artifacts, and database backups.

**Why MinIO over alternatives:**
- **vs Amazon S3**: Vendor lock-in, egress costs, no offline/on-prem deployment. MinIO provides the same S3 API for on-premises or air-gapped environments.
- **vs Ceph / Rook**: Much heavier (requires multiple daemons, monitors, OSDs). MinIO is a single Go binary — far simpler to deploy and operate.
- **vs GCS / Azure Blob**: Same vendor lock-in concern. MinIO's S3 API is universally compatible.
- **vs local filesystem**: No replication, no versioning, no access to S3-compatible tools, hard to scale across multiple app instances.

**Document storage:** `files` and `file_versions` Prisma models track metadata. MinIO stores the binary content. The API (`StorageModule`) handles upload/download with workspace-scoped bucket isolation.

**AI model storage:** Planned — Fine-tuned models or Lora adapters can be stored in MinIO and loaded at inference time.

**Backup target:** Database dumps, configuration backups, and disaster recovery archives stored in MinIO. The `backup_pre_security_*.sql` files in the repo root suggest manual backups are being taken.

**Risks/concerns:** Single-node deployment in the compose file — no high availability or replication. Data loss if the MinIO volume is corrupted. `latest` tag in production is risky (should pin to a specific version). No TLS configured in the compose file (required for production).

**Upgrade path:** Pin to a specific version tag (e.g., `minio/minio:RELEASE.2024-*`). Upgrade by pulling new image and restarting. Multi-node deployment available if HA becomes necessary.

---

## 7.10 Docker / Docker Compose

| Attribute | Value |
|-----------|-------|
| **Version** | Docker Compose v3.8+ (format), Docker (assumed latest) |
| **Location** | `infrastructure/docker/compose/base/docker-compose.yml`, `infrastructure/docker/compose/production/docker-compose.yml`, `workspace/docker-compose.yml` |
| **Status** | **Active** |

**Problem it solves:** Reproducible development and production environments, dependency isolation, simplified service orchestration.

**Why Docker over alternatives:**
- **vs bare metal / VMs**: Docker provides consistent environments across developer machines and CI/CD. No "works on my machine" issues. Faster iteration (build → run → test cycle in seconds).
- **vs Vagrant**: Heavier (full VM), slower startup, more resource intensive. Docker containers share the host kernel.
- **vs Podman**: Podman is daemonless and more secure by default (rootless). However, Docker has wider tooling support (Docker Compose, Docker Hub, CI/CD integrations). The ecosystem advantage outweighs the security differences for this stage.

**Development reproducibility:** Single `docker compose up` starts PostgreSQL 17, Redis 8, RabbitMQ 4, PgBouncer, and all three Python microservices. Developers can run the NestJS API and Next.js web outside containers for hot-reload.

**Production deployment:** Production compose file adds Nginx, Prometheus, Grafana, Loki, Promtail, MinIO. Networks isolate internal services (backend containers communicate via `xennic-network` bridge). Secrets managed via Docker secrets (`/run/secrets/jwt_*`).

**Risks/concerns:** Docker Compose is designed for single-host deployments. Multi-host orchestration requires Kubernetes (planned). No built-in secrets encryption at rest. All compose files use `restart: unless-stopped` but no health-check-based restart dependencies (the production compose uses `depends_on` with `condition: service_healthy` for critical services, which is good).

**Upgrade path:** Docker Compose v2 is now the default. Stay current with Docker Engine releases. Plan for Kubernetes migration when multi-host orchestration is required.

---

## 7.11 Nginx

| Attribute | Value |
|-----------|-------|
| **Version** | 1.27 (`nginx:1.27-alpine`) |
| **Location** | `infrastructure/nginx/` |
| **Status** | **Active** |

**Problem it solves:** Reverse proxy, TLS termination, rate limiting, static file serving, and WebSocket proxying for the Xennic platform.

**Why Nginx over alternatives:**
- **vs Caddy / Traefik**: Caddy's automatic HTTPS (Let's Encrypt) is simpler, and Traefik's Docker-native service discovery is powerful. However, Nginx is more widely understood, has a larger ecosystem, and is already familiar to the ops team. More tuning options for high-concurrency workloads.
- **vs HAProxy**: HAProxy excels at TCP-level load balancing but has weaker HTTP feature set (no gzip, no complex location-based routing). Nginx provides both Layer 7 features and load balancing.
- **vs Apache**: Event-driven architecture scales better than Apache's process/thread model. Lower memory footprint under concurrent connections.

**Rate limiting:** Two zones configured:
- `api:10m rate=100r/s` — general API endpoints
- `auth:10m rate=10r/s` — authentication endpoints (brute-force protection)

Burst values: 200 (api), 5 (auth).

**SSL termination:** TLS 1.2/1.3 only (no deprecated protocols). Strong cipher suite with `ssl_prefer_server_ciphers off` (client-preferred). SSL session cache with 10m shared, 1d timeout. OSCP stapling enabled.

**Static file serving:** `/_next/static` proxied to Next.js with 365d immutable cache. `/static/` aliased to `/var/www/static/` with same cache headers.

**WebSocket proxy:** `/ws/` endpoints configured with 3600s timeouts for real-time communication.

**Logging:** Structured JSON log format with `escape=json` for machine parsing. Buffer flush at 5s / 32k.

**Risks/concerns:** No active health-check-based upstream selection (uses passive `proxy_next_upstream` with 3 tries). No SSL certificate auto-renewal (certbot setup referenced but not automated in compose). The `default.conf` strips `Connection` header for non-upgrade requests (minor spec violation).

**Upgrade path:** `nginx:1.27-alpine` → bump Alpine version for security patches. Configuration changes tested via `nginx -t` in CI.

---

## 7.12 Prometheus

| Attribute | Value |
|-----------|-------|
| **Version** | v2.54.1 (`prom/prometheus:v2.54.1`) |
| **Location** | `infrastructure/monitoring/prometheus/` |
| **Status** | **Active** |

**Problem it solves:** Metrics collection and alerting foundation — scrapes all backend services, databases, and message brokers every 15s.

**Why Prometheus over alternatives:**
- **vs Datadog / New Relic**: Vendor lock-in, per-host/per-metric pricing. Prometheus is self-hosted and free for any scale. The battle-tested pull model aligns with containerized ephemeral infrastructure.
- **vs InfluxDB**: Prometheus is purpose-built for alerting and time-series (PromQL is vastly more powerful than InfluxQL/Flux for alerting). InfluxDB is better for event logging but overlaps with Loki.
- **vs Graphite**: Graphite lacks built-in alerting, has no multi-dimensional data model, and its Whisper storage format is less efficient than Prometheus's TSDB.

**Scrape targets:**
| Target | Endpoint | Port |
|--------|----------|------|
| API (NestJS) | `/api/v1/metrics` | 3000 |
| Engineering Service | `/metrics` | 8001 |
| AI Service | `/metrics` | 8002 |
| Vision Service | `/metrics` | 8003 |
| PostgreSQL exporter | standard | 9187 |
| Redis exporter | standard | 9121 |
| RabbitMQ | built-in | 15692 |
| PgBouncer exporter | standard | 9127 |

**Retention:** 15 days (`storage.tsdb.retention.time=15d`).

**Alerting:** Prometheus configuration references a `rules` directory (implied by structure) but no rule files found in the repo. Alertmanager integration is not yet configured (no Alertmanager compose service).

**Risks/concerns:** No alerting rules defined yet. TSDB storage can grow quickly under high scrape volume — monitor disk usage. Single-node deployment (no Thanos/Cortex for long-term storage or high availability).

**Upgrade path:** Stay within v2.x, bump minor versions. Alertmanager should be added as a future task.

---

## 7.13 Grafana

| Attribute | Value |
|-----------|-------|
| **Version** | 11.3.0 (`grafana/grafana:11.3.0`) |
| **Location** | `infrastructure/monitoring/grafana/` |
| **Status** | **Active** |

**Problem it solves:** Unified visualization dashboard for metrics (Prometheus) and logs (Loki), with auto-provisioned datasources.

**Why Grafana over alternatives:**
- **vs Kibana**: Tied to the Elastic stack. Grafana is vendor-agnostic (works with Prometheus, Loki, InfluxDB, PostgreSQL, and 100+ other datasources). Lighter weight than Kibana + Elasticsearch.
- **vs Chronograf**: Part of the InfluxDB ecosystem; less flexible for multi-datasource environments.
- **vs built-from-scratch dashboards**: Grafana provides pre-built panels, alerting, annotations, and team collaboration out of the box. Building equivalent in a custom UI would take months.

**Auto-provisioned datasources:**
- Prometheus at `http://prometheus:9090` (default, non-editable).
- Loki at `http://loki:3100` (non-default, non-editable).

Dashboards directory exists (`provisioning/dashboards/`) with a `dashboard.yml` provider config.

**Risks/concerns:** No pre-built dashboards committed to the provisioning directory. Alerting not configured. Default admin password `admin` should be changed via `GF_SECURITY_ADMIN_PASSWORD` environment variable (currently uses `${GRAFANA_ADMIN_PASSWORD:-admin}`). No SMTP configured for alert notifications.

**Upgrade path:** Grafana 11→12 upgrade is well-documented. Plugin compatibility should be verified before upgrading.

---

## 7.14 Loki + Promtail

| Attribute | Value |
|-----------|-------|
| **Version** | 3.1.1 (`grafana/loki:3.1.1`, `grafana/promtail:3.1.1`) |
| **Location** | `infrastructure/monitoring/loki/`, `infrastructure/monitoring/promtail/` |
| **Status** | **Active** |

**Problem it solves:** Log aggregation from all Docker containers, indexed by container name and compose service label, searchable via Grafana.

**Why Loki over ELK:**
- **vs Elasticsearch + Logstash + Kibana**: ELK requires more resources (Elasticsearch JVM heap), more complex configuration (Logstash pipelines), and significantly more storage (indexes all log content). Loki indexes only metadata (labels), making it ~10× cheaper on storage and far simpler to operate. The Promtail agent auto-discovers Docker containers via the Docker socket.
- **vs Graylog**: Graylog is another Java-based solution requiring Elasticsearch. Similar resource concerns.
- **vs Papertrail / Logz.io**: Vendor lock-in, per-GB pricing. Loki is self-hosted and free.

**Simplicity:** Loki runs as a single binary (no ZooKeeper, no Hadoop). Promtail auto-discovers containers and attaches labels (`container`, `logstream`, `service`). Configuration is under 25 lines.

**Cost:** No indexing of log content → storage savings. Prometheus-format metrics from Loki can be queried in Grafana alongside Prometheus data.

**Risks/concerns:** Single-node Loki with in-memory ring storage — not suitable for high availability. `boltdb-shipper` store with filesystem backend means state is lost on container restart unless persistent volume is properly configured. `auth_enabled: false` — no authentication on Loki API (should be behind Nginx in production).

**Upgrade path:** Stay within Loki 3.x, bump minor versions. Plan for multi-tenant Loki when platform scales.

---

## 7.15 OpenTelemetry

| Attribute | Value |
|-----------|-------|
| **Version** | N/A (not yet implemented) |
| **Location** | N/A |
| **Status** | **Planned** |

**Problem it solves:** Distributed tracing across service boundaries — NestJS API → Python microservices → external AI providers → database queries.

**Why OpenTelemetry over alternatives:**
- **vs Jaeger (alone)**: Jaeger is a tracing backend; OpenTelemetry is the collection standard. OpenTelemetry can export to Jaeger, Zipkin, or any OTLP-compatible backend. Vendor-neutral.
- **vs AWS X-Ray / GCP Cloud Trace**: Vendor lock-in. OpenTelemetry runs anywhere.
- **vs Datadog APM / New Relic**: Vendor lock-in, per-host pricing.
- **vs manual correlation IDs**: Hard to propagate across async boundaries (RabbitMQ), HTTP calls to microservices, and database spans. OpenTelemetry automates context propagation.

**Future integration:** W3C Trace Context propagation (`traceparent` header) will enable end-to-end tracing. NestJS has `@opentelemetry/instrumentation-express`/`fastify`, Python microservices have `opentelemetry-instrumentation-fastapi`. RabbitMQ consumer spans will require `opentelemetry-instrumentation-pika` or similar.

**Risks/concerns:** Increased latency (instrumentation overhead), storage costs for trace data, operational complexity of running a trace backend (Jaeger or similar). Should be introduced incrementally — start with API service, then microservices.

**Upgrade path:** OTel is a standard (CNCF graduated). SDKs are stable across minor versions. Add `@opentelemetry/node`, configure exporter to Jaeger/Otlp, instrument as needed.

---

## 7.16 TypeScript

| Attribute | Value |
|-----------|-------|
| **Version** | ^6.0.3 (root), ^5.8.3 (web) |
| **Location** | All packages under `apps/` and `packages/` |
| **Status** | **Active** |

**Problem it solves:** Type safety across the entire Node.js/Next.js stack — catches type errors at compile time, provides IDE autocompletion, serves as living documentation for data shapes.

**Why TypeScript over alternatives:**
- **vs plain JavaScript**: Catches entire classes of bugs at compile time (null references, wrong argument types, misspelled properties). Makes refactoring safe — rename a field in a Prisma model and TypeScript reports every usage.
- **vs Flow**: Facebook abandoned Flow in favor of TypeScript. TypeScript has wider ecosystem support, better editor integration (tsserver), and faster evolution.
- **vs JSDoc annotations**: Verbose, not statically enforced, no type checking across module boundaries without a type checker.

**Usage throughout the stack:**
- `packages/config/tsconfig.base.json`: Base config with strict mode, `noUncheckedIndexedAccess`, `noImplicitOverride`.
- `apps/api/tsconfig.json`: Extends base, adds `experimentalDecorators` and `emitDecoratorMetadata` for NestJS.
- `apps/web/tsconfig.json`: `bundler` module resolution for Next.js, `jsx: preserve`, `noEmit: true`.
- `packages/database/`: TypeScript wrapper around Prisma client.
- `packages/shared/`, `packages/types/`: Shared TypeScript types and validation schemas.

**Risks/concerns:** TypeScript 6.0 introduces stricter default checks — may require code changes on upgrade. The root package uses `typescript@^6.0.3` while `apps/web` uses `typescript@^5.8.3` — this version mismatch could cause tooling confusion. Build time increases with project size (alleviated by Turborepo caching).

**Upgrade path:** Run `npx tsc --noEmit` after each TypeScript upgrade. Fix new strictness errors. Keep TypeScript versions consistent across the monorepo.

---

## 7.17 Python 3.12

| Attribute | Value |
|-----------|-------|
| **Version** | >=3.12 |
| **Location** | `workspace/services/*/` |
| **Status** | **Active** |

**Problem it solves:** Provides access to the Python ecosystem for engineering computation (NumPy, SciPy, SymPy, pandapower) and AI/ML workloads (LangChain, LangGraph, OpenAI, Anthropic clients).

**Why Python over alternatives:**
- **vs Node.js for engineering**: NumPy/SciPy/SymPy have no Node.js equivalents with the same maturity, performance, or community support. Pandapower is Python-only (power system analysis).
- **vs Rust/C++**: Faster but slower to develop. Engineering calculation logic changes frequently (standards updates, new formulas). Python's expressiveness and REPL-driven development are better suited.
- **vs R**: Better suited for statistics than general engineering computation. Smaller web framework ecosystem.
- **vs Julia**: Smaller community, fewer libraries for electrical engineering (no pandapower equivalent).

**Ecosystem:** The `requirements.txt` files demonstrate the breadth: `numpy`, `pandas`, `scipy`, `sympy`, `pint`, `pandapower` for engineering; `openai`, `anthropic`, `google-generativeai`, `langchain`, `langgraph`, `qdrant-client` for AI.

**Risks/concerns:** Python 3.12 is well supported but 3.13 is available — should evaluate upgrade for free-threading (no-GIL) mode. Dependency conflicts between services (e.g., different `pydantic` versions across services) are managed by isolated venvs.

**Upgrade path:** `requires-python = ">=3.12"` in `pyproject.toml`. Test against 3.13 in CI when available. Upgrade by changing base image in Dockerfiles.

---

## 7.18 Turborepo

| Attribute | Value |
|-----------|-------|
| **Version** | ^2.5.0 |
| **Location** | `turbo.json` |
| **Status** | **Active** |

**Problem it solves:** Monorepo task orchestration with caching, parallel execution, and dependency-aware builds.

**Why Turborepo over alternatives:**
- **vs Nx**: Both are excellent. Nx has more features (generators, executors, affected commands) but more configuration. Turborepo is simpler to set up (one `turbo.json`) and has first-class `pnpm` workspace support. Nx's dependency graph visualization is better, but Turborepo's remote caching (Vercel) is easier.
- **vs Lerna / Yarn Workspaces**: No task orchestration — just run scripts in parallel with no dependency ordering. No caching.
- **vs Bazel**: Far too heavy for a Node.js monorepo. Bazel is designed for monorepos with multiple languages and massive scale.

**Task configuration in `turbo.json`:**
| Task | Depends on | Cached | Notes |
|------|-----------|--------|-------|
| `build` | `^build` | `dist/**`, OpenAPI spec | Parallel, ordered by deps |
| `dev` | — | No | Persistent, no cache |
| `lint` | — | Outputs only | Fast |
| `test` | `build` | `coverage/**` | Build first, then test |
| `typecheck` | `^typecheck` | No output | Parallel |

**Caching:** Tasks that produce outputs are cached by default. `build` caches `dist/**` and the auto-generated OpenAPI spec. `dev` and `clean` are explicitly non-cached.

**Risks/concerns:** `pnpm-lock.yaml` changes invalidate all caches. Remote caching (Vercel) requires a paid plan for larger teams. Cache invalidation logic is opaque.

**Upgrade path:** Turborepo v2→v3 should be smooth — follow `turbo.build/blog`. Cache may be invalidated on upgrade.

---

## 7.19 pnpm

| Attribute | Value |
|-----------|-------|
| **Version** | 10.33.0 (configured in `package.json`: `packageManager: "pnpm@10.33.0"`) |
| **Location** | `pnpm-workspace.yaml` |
| **Status** | **Active** |

**Problem it solves:** Fast, disk-efficient Node.js package management with native workspace protocol support.

**Why pnpm over npm/yarn:**
- **Disk efficiency:** pnpm uses a content-addressable store — all versions of all packages are stored once, then hard-linked into `node_modules`. Saves gigabytes compared to npm/yarn's copy-per-project approach.
- **Workspace protocol (`workspace:*`)**: Packages reference each other via `workspace:*` (e.g., `"@xennic/database": "workspace:*"`). During publishing, these are replaced with actual version ranges. npm workspaces and yarn workspaces support similar but pnpm's implementation is stricter and faster.
- **Strict `node_modules`**: pnpm creates a non-hoisted `node_modules` where only direct dependencies are accessible. Prevents phantom dependencies (importing a package that isn't in `package.json`). This aligns with stricter coding standards.
- **Speed:** Faster installs than npm, especially in CI (cached store).

**Workspace configuration:** `pnpm-workspace.yaml` defines workspaces at `apps/*`, `packages/*`, `services/*`, `workers/*`, `workspace/*`.

**Risks/concerns:** Some tools (e.g., Prisma, `@nestjs/core`) require `onlyBuiltDependencies` permission to run post-install scripts (configured in `package.json` pnpm config). The workspace config has malformed `allowBuilds` entries (spaces, quotes, commas as keys — appears to be a bug or unintentional config).

**Upgrade path:** pnpm follows semver. Run `corepack prepare pnpm@latest --activate`. The lockfile format is stable within major versions.

---

## 7.20 Tailwind CSS v4

| Attribute | Value |
|-----------|-------|
| **Version** | ^4.1.8 |
| **Location** | `apps/web/src/app/globals.css` |
| **Status** | **Active** |

**Problem it solves:** Utility-first CSS framework for rapid UI development with a consistent design system, RTL support, and dark mode.

**Why Tailwind over alternatives:**
- **vs traditional CSS / SCSS / CSS Modules**: Tailwind eliminates context-switching between HTML and CSS files. No naming conventions (BEM, SMACSS), no cascade surprises, no dead CSS. The `@apply` directive was deprecated in v4 in favor of just using utility classes — cleaner, more maintainable.
- **vs styled-components / CSS-in-JS**: Runtime CSS-in-JS adds bundle size and runtime overhead. Tailwind v4 is compiled at build time (zero runtime). Next.js App Router prefers compile-time CSS.
- **vs Bootstrap / Material UI**: Opinionated component styles that are hard to customize without fighting the framework. Tailwind is unopinionated — you compose your own design system from primitives.
- **vs UnoCSS**: Similar approach, smaller ecosystem, fewer learning resources.

**Utility-first approach:** Every style is a utility class (`flex`, `items-center`, `p-4`, `text-lg`, `bg-primary`). Components are composed in JSX using `clsx`/`tailwind-merge` for conditional classes, `class-variance-authority` for component variants.

**RTL support:** Custom `@variant rtl` and `@variant ltr` directives in `globals.css` enable RTL-aware utilities without extra plugins. Combined with `next-intl` for locale-based `dir` attribute.

**Custom design system:** The `@theme` block in `globals.css` defines:
- Fonts: `--font-sans` (Iran Sans Farsi), `--font-en` (Inter), `--font-mono`.
- Border radius tokens.
- Color variables (HSL) in `:root` and `.dark` for light/dark mode.
- Shadow tokens.
- `next-themes` integrates with Tailwind's dark mode via the `.dark` class strategy.

**Risks/concerns:** Tailwind v4 is a major rewrite (CSS-first configuration instead of `tailwind.config.js`). Some community plugins (like `@tailwindcss/forms`) may lag behind. The `@theme` directive replaces `tailwind.config.js` theme extension — any missing tokens require manual CSS variables.

**Upgrade path:** Tailwind v4 is stable. Track upstream releases for bug fixes. `@tailwindcss/typography` and `@tailwindcss/postcss` should be upgraded in sync.

---

## 7.21 React 19

| Attribute | Value |
|-----------|-------|
| **Version** | ^19.1.0 |
| **Location** | `apps/web/` |
| **Status** | **Active** |

**Problem it solves:** Modern UI component model with Server Components, concurrent rendering, and improved hooks.

**Why React 19 over alternatives:**
- **vs Vue 3**: Smaller ecosystem for engineering-specific UIs (charting, rich text editors, PDF generation). React's component model is more widely understood.
- **vs Svelte**: Svelte compiles away the framework but has a smaller ecosystem and fewer job candidates familiar with it. React's ecosystem (Recharts, Tiptap, Radix, TanStack Query) is unmatched.
- **vs Solid.js**: Faster but smaller ecosystem, fewer UI libraries, less community support.

**Server Components:** RSC allows data fetching at the server level, reducing client JS bundle and improving initial page load. Used for dashboard pages, project listings, and knowledge articles.

**Performance:** Concurrent React (React 18+) enables automatic batching, transitions (`startTransition`), and `useOptimistic` for optimistic UI updates. React 19 adds the `use()` hook for reading promises directly in render.

**Risks/concerns:** Breaking changes between React 18→19 (removed PropTypes, deprecated `forwardRef` in favor of `ref` as prop). Some third-party libraries may lag behind React 19 compatibility.

**Upgrade path:** React 19→20 will follow the React 18→19 pattern. Check `react-strict-mode` for issues. Verify all dependencies (`@radix-ui/*`, `@tanstack/react-query`, `recharts`, `@tiptap/react`, `zustand`) support the new version.

---

## 7.22 Zustand

| Attribute | Value |
|-----------|-------|
| **Version** | ^5.0.5 |
| **Location** | `apps/web/src/stores/` |
| **Status** | **Active** |

**Problem it solves:** Lightweight, hook-based state management for React without boilerplate or provider nesting.

**Why Zustand over Redux:**
- **vs Redux Toolkit**: Zustand requires zero boilerplate — no slices, no reducers, no action creators, no `Provider` wrapper. A store is a single `create()` call with a function. Redux's `createSlice`/`configureStore` is significantly more code for the same result. Zustand's TypeScript integration is seamless.
- **vs Context + useReducer**: React Context triggers re-renders on all consumers when any part of the context changes. Zustand uses subscriptions — only components that use the changed slice re-render. No provider nesting required.
- **vs Jotai / Recoil**: Atom-based state management adds indirection. Zustand's single-store approach is simpler for app-wide state (auth, workspace, toast).

**Persistence:** `zustand/middleware` `persist` middleware persists to `localStorage` automatically. Used in `auth.store.ts` for token/user persistence with `partialize` to control what's stored.

**Simplicity:** The `auth.store.ts` is 111 lines for a complete auth state manager with token persistence, workspace selection, admin flag, and rehydration sync. A Redux equivalent would be 2-3× larger.

**Risks/concerns:** v4→v5 introduced breaking changes (middleware API). No built-in devtools (requires `devtools` middleware). Stores are singletons — not suitable for first-class server-side rendering patterns (though Next.js App Router works with Zustand when initialized on client).

**Upgrade path:** Zustand v5 is latest. v5→v6 should be smooth if it follows semver.

---

## 7.23 TanStack Query

| Attribute | Value |
|-----------|-------|
| **Version** | ^5.80.7 |
| **Location** | `apps/web/` (in `dependencies`) |
| **Status** | **Active** |

**Problem it solves:** Server state management — data fetching, caching, background refetching, optimistic updates, and pagination for API calls.

**Why TanStack Query over alternatives:**
- **vs SWR**: Similar caching and revalidation approach. TanStack Query has richer features: infinite queries, mutation callbacks, optimistic updates with rollback, automatic garbage collection, and better DevTools.
- **vs Redux Toolkit Query**: RTK Query is tied to Redux — requires the entire Redux setup. TanStack Query is standalone and works with any state manager (or no state manager at all).
- **vs manual `useEffect` + `fetch`**: Infinite re-render loops, no caching, no deduplication, no background refetching, no loading/error states. TanStack Query provides all of these declaratively.

**Server state:** Query keys API endpoints with typed responses. Mutations (`useMutation`) handle POST/PUT/DELETE with automatic cache invalidation via `queryClient.invalidateQueries`.

**Caching:** In-memory cache with `staleTime`, `gcTime`, and automatic garbage collection. Background refetching on window focus ensures fresh data.

**Risks/concerns:** Learning curve for advanced patterns (optimistic updates, infinite queries, query cancellation). Devtools bundle included in dev dependencies. v4→v5 changed cache time defaults (`cacheTime` → `gcTime`).

**Upgrade path:** TanStack Query follows semver. v5 is stable; v6 will have migration guide. Keep `@tanstack/react-query` and `@tanstack/query-core` in sync.

---

## 7.24 Future: Neo4j

| Attribute | Value |
|-----------|-------|
| **Version** | Not yet selected |
| **Location** | Not yet deployed |
| **Status** | **Planned** |

**Problem it will solve:** Graph database for representing engineering knowledge relationships — equipment connectivity, design dependencies, standards cross-references, and the knowledge graph.

**Why Neo4j over alternative graph databases:**
- **vs Amazon Neptune**: Vendor lock-in, higher cost, less transparent pricing.
- **vs ArangoDB / OrientDB**: Multi-model databases (document + graph) that don't excel at either. Neo4j is purpose-built for graphs with Cypher query language, native graph storage, and property graph model.
- **vs pgRouting / AGE (PostgreSQL extensions)**: AGE provides Cypher support on PostgreSQL but is less mature. pgRouting is only for spatial graphs. Neo4j's lab-grown ecosystem (Graph Data Science library, Bloom visualization) is unmatched.
- **vs Dgraph**: Dgraph uses GraphQL±, which has steeper learning curve. Neo4j's Cypher is closer to SQL and easier for the team to adopt.

**Knowledge graph use case:** Engineering standards reference each other (e.g., IEC 60909 references IEC 60038). Equipment spec sheets link to calculation templates. Formulas have prerequisites and dependencies. Neo4j can model these as nodes and edges, enabling traversal queries like "find all standards that depend on standard X, and the calculations that use them".

**Risks/concerns:** Additional infrastructure to operate (backup, clustering, monitoring). Data sync between PostgreSQL (transactional) and Neo4j (graph) requires a sync layer (eventual consistency via RabbitMQ). Not yet designed or provisioned.

**Upgrade path:** Start with a single Neo4j instance, add clustering if needed. Evaluate correctness of Cypher queries against domain model before production use.

---

## 7.25 Future: Kubernetes

| Attribute | Value |
|-----------|-------|
| **Version** | Not yet selected |
| **Location** | `infrastructure/kubernetes/` — empty directory (placeholder) |
| **Status** | **Planned** |

**Problem it will solve:** Container orchestration for multi-host deployment, auto-scaling, rolling updates, self-healing, and service discovery.

**Why Kubernetes over alternatives:**
- **vs Docker Swarm**: Swarm is simpler but essentially abandoned (minimal community activity, no major feature development). Kubernetes is the industry standard with rich ecosystem (Helm, Operators, Service Mesh).
- **vs Nomad**: Simpler than Kubernetes but smaller community, fewer integrations. Nomad is great for simple job scheduling but lacks Kubernetes' pod autoscaling, service mesh, and built-in ingress/egress.
- **vs Docker Compose**: Single-host only, no rolling updates, no auto-healing. Fine for development but insufficient for production at scale.

**Current status:** The `infrastructure/kubernetes/` directory exists but is empty — Kubernetes manifests have not been written. The production Docker Compose file serves as the current deployment target.

**When Kubernetes becomes necessary:**
- Multiple host machines are needed (horizontal scaling).
- Zero-downtime deployments are required (rolling updates).
- Auto-scaling based on CPU/memory/custom metrics.
- Self-healing (auto-restart crashed containers, reschedule failed pods).
- Multi-environment consistency (dev/staging/prod).

**Risks/concerns:** Kubernetes adds significant operational complexity — a dedicated DevOps role may be required. Over-engineering for the current scale. Should not be adopted until the Docker Compose deployment demonstrates scalability limits.

**Upgrade path:** Start with `kubeadm` or a managed Kubernetes service (EKS, GKE, AKS). Convert Docker Compose services to Kubernetes Deployments + Services. Use Helm for package management.

---

## 7.26 class-variance-authority

| Attribute | Value |
|-----------|-------|
| **Version** | ^0.7.1 |
| **Location** | `apps/web/` |
| **Status** | **Active** |

**Problem it solves:** Type-safe component variant management — defines component props (variants, sizes, states) that map to Tailwind classes.

**Why CVA over alternatives:**
- **vs Tailwind CSS `@apply` / component classes**: Manually concatenating conditional classes is error-prone and verbose. CVA provides a declarative API: `cva('base', { variants: { size: { sm: '...', md: '...' } } })`. Every variant combination is type-checked.
- **vs Stitches / vanilla-extract / Linaria**: CSS-in-JS solutions that require a build step or runtime. CVA is a zero-runtime macro that produces class strings — no extra CSS processing needed with Tailwind v4.
- **vs `clsx` alone**: `clsx` is a conditional class joiner but doesn't provide variant structure or type safety for component APIs. CVA and `clsx` are complementary (CVA defines variants, `clsx` handles conditional overrides).

**Usage pattern:** Used with `tailwind-merge` for merging utility classes (allowing consumers to override base styles). Combined with Radix UI primitives for consistent component APIs.

**Risks/concerns:** v0.7.x is pre-1.0 — API may change. Tightly coupled to the Tailwind class naming convention. Overuse can lead to overly complex variant matrices.

**Upgrade path:** CVA is a tiny utility (~1kB). v1.0 will bring API stability.

---

## 7.27 Radix UI

| Attribute | Value |
|-----------|-------|
| **Version** | Multiple packages (^1.x for primitives, ^2.x for drop-down menu/select) |
| **Location** | `apps/web/` (`@radix-ui/react-*`) |
| **Status** | **Active** |

**Problem it solves:** Unstyled, accessible React primitives for building custom UI components without reinventing accessibility patterns.

**Why Radix over alternatives:**
- **vs Headless UI (Tailwind Labs)**: Similar approach. Radix has more primitives (DropdownMenu, Select, Tooltip, Toast, Popover, ScrollArea, Switch) and better accessibility (WAI-ARIA compliance verified). Headless UI is simpler but less comprehensive.
- **vs React Aria (Adobe)**: More complex API, heavier bundle, opinionated styling approach. Radix's API is more React-idiomatic and integrates naturally with Tailwind.
- **vs Material UI / Ant Design / Chakra**: Fully styled component libraries that are hard to customize without fighting the default theme. Radix provides unstyled primitives that accept any styling approach (Tailwind, CSS modules, styled-components). Xennic's custom engineering brand requires full control over look and feel — Radix enables this.
- **vs building from scratch**: Accessible modals, dropdowns, selects, and tooltips require months of work to get right (focus trapping, keyboard navigation, screen reader announcements, scroll locking). Radix provides these battle-tested.

**Packages used:**
- `react-avatar`, `react-checkbox`, `react-dialog`, `react-dropdown-menu`, `react-label`, `react-popover`, `react-scroll-area`, `react-select`, `react-separator`, `react-slot`, `react-switch`, `react-toast`, `react-tooltip`

**Accessibility:** Radix primitives handle ARIA attributes, focus management, keyboard navigation, and screen reader announcements out of the box. This is critical for the platform's bilingual (Farsi/English) audience, including users relying on assistive technology.

**Risks/concerns:** Multiple packages to maintain (13 Radix packages in `package.json`). Breaking changes are managed with semver but the API surface is large. Some primitives (like `Select`) have known limitations with virtualized lists.

**Upgrade path:** Stay within v1/v2 major versions. Radix is well-maintained with frequent releases.

---

## 7.28 Tiptap

| Attribute | Value |
|-----------|-------|
| **Version** | ^3.27.0 |
| **Location** | `apps/web/` (`@tiptap/*`) |
| **Status** | **Active** |

**Problem it solves:** Rich text editor for knowledge article authoring, engineering report content, and calculation descriptions.

**Why Tiptap over alternatives:**
- **vs ProseMirror (raw)**: Tiptap wraps ProseMirror (the gold standard for extensible editors) in a React-friendly API with a plugin/extension system. Raw ProseMirror requires manual state management and schema setup — Tiptap provides a `useEditor` hook and declarative extension configuration.
- **vs Quill / Draft.js**: Limited extensibility, harder to add custom nodes (engineering formulas, KaTeX math, embedded charts). ProseMirror's document model (a structured JSON tree) is far more flexible and predictable than Quill's delta format.
- **vs Slate.js**: Slate is a framework for building editors, not a ready-to-use editor. Tiptap provides a complete editor out of the box with extensions for tables, links, images, code blocks, and text alignment.
- **vs CKEditor / TinyMCE**: Heavier, less customizable, and harder to integrate with modern React patterns.

**Extensions used:**
- Core: `@tiptap/core`, `@tiptap/pm` (ProseMirror), `@tiptap/react`, `@tiptap/starter-kit`
- Formatting: `underline`, `superscript`, `subscript`, `text-align`, `placeholder`
- Content: `image`, `link`, `code-block-lowlight` (syntax highlighting)
- Tables: `table`, `table-cell`, `table-header`, `table-row`

**Use in knowledge management:** Knowledge article content is stored as ProseMirror JSON (`knowledge.content` in the Prisma schema). This structured format preserves formatting, embedded elements, and extensibility for future custom nodes (e.g., embeddable calculators, live circuit diagrams).

**Risks/concerns:** Bundle size impact (ProseMirror is ~100kB). Tiptap v2→v3 migration was significant — future major upgrades may require migration effort. Custom node development requires understanding ProseMirror's node specification and schema.

**Upgrade path:** Tiptap v3 is stable. Stay current with minor releases. Evaluate v4 when available.

---

## 7.29 Recharts

| Attribute | Value |
|-----------|-------|
| **Version** | ^3.8.1 |
| **Location** | `apps/web/` |
| **Status** | **Active** |

**Problem it solves:** Declarative charting library for engineering calculation visualization — cable sizing charts, load profiles, voltage drop curves, power quality analysis.

**Why Recharts over alternatives:**
- **vs D3.js**: D3 is a low-level visualization library (not a charting library). Building bar charts, line charts, pie charts from scratch requires hundreds of lines of code. Recharts uses D3 internally but provides a declarative React API: `<LineChart><Line dataKey="value" /></LineChart>`.
- **vs Chart.js + react-chartjs-2**: Chart.js renders to Canvas (better performance for large datasets) but the React wrapper adds overhead. Recharts renders to SVG (better for interactive tooltips, responsive sizing, accessibility). SVG is preferred for engineering reports where charts must be exportable or embeddable.
- **vs Nivo / Victory**: Both are excellent but Recharts has the simplest API and best documentation. Nivo has steeper API. Victory is heavier.
- **vs ECharts**: Chinese-origin library with excellent performance but less idiomatic React integration.

**Engineering calculation visualization:** Specific use cases include:
- Cable sizing charts (current vs. temperature).
- Load duration curves.
- Power quality analysis (harmonic spectrum, voltage sags).
- Protection coordination curves (time-current curves).

**Risks/concerns:** Performance with large datasets (SVG DOM overhead). v2→v3 had breaking changes (prop names, type exports). Accessibility features require manual ARIA labels. No built-in theming — must synchronize with Tailwind design tokens manually.

**Upgrade path:** Recharts follows semver. Pin to v3.x, test chart rendering after upgrades. Evaluate if performance becomes an issue with large time-series data.

---

## 7.30 jspdf / react-pdf

| Attribute | Value |
|-----------|-------|
| **Version** | `jspdf@^4.2.1` (API), `jspdf@^2.5.2` (web), `@react-pdf/renderer@4.5.1` (web) |
| **Location** | `apps/api/` (jspdf), `apps/web/` (jspdf, react-pdf) |
| **Status** | **Active** |

**Problem it solves:** PDF generation for engineering reports, calculation outputs, project documentation, and invoices.

**Why jspdf / react-pdf over alternatives:**
- **vs LaTeX / pdflatex**: Overkill for dynamic, programmatically generated reports. LaTeX requires a full TeX distribution (~1GB) and is hard to use in a web service context.
- **vs Puppeteer (HTML→PDF)**: Puppeteer requires a headless Chromium binary (~200MB Docker image), is slower, and has inconsistent font rendering across platforms. jspdf is ~500kB and generates PDFs programmatically.
- **vs PDFKit**: Lower-level API (no pre-built table, no image embedding helpers). jspdf has `jspdf-autotable` for engineering data tables.

**jspdf** (`apps/api`): Used server-side in the NestJS API for generated report PDFs. `jspdf-autotable` adds table generation for structured engineering data.

**react-pdf** (`apps/web`): Used client-side for rendering PDFs in the browser with React components. `@react-pdf/renderer` allows composing PDFs with `<Document>`, `<Page>`, `<View>`, `<Text>`, `<Image>` components — same mental model as React DOM.

**Engineering reports:** PDFs include:
- Calculation results with formulas, charts, and tables.
- Equipment specification sheets.
- Project documentation and compliance reports.
- Invoices (from BillingModule).

**Risks/concerns:** Two different libraries for server vs. client PDF generation — code duplication risk. jspdf v2→v4 is a large jump (v2.5.2 in web, v4.2.1 in API) — version mismatch could cause confusion. Font embedding for Farsi/Arabic text requires careful configuration (`arabic-reshaper` and `bidi` packages in dependencies). react-pdf's `3.0.2` in root deps vs `4.5.1` in web deps — inconsistent.

**Upgrade path:** Unify versions across the monorepo. jspdf v5 should be tracked for API changes. react-pdf v4 is stable; follow @react-pdf/renderer upgrades.
