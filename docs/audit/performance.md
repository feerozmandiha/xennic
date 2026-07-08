# Performance Audit Report — Xennic Platform

**Date:** 2026-07-02
**Scope:** Full codebase (apps/api, workspace/services, prisma/schema)
**Priority:** P0 (critical) / P1 (high) / P2 (medium) / P3 (low)

---

## 1. Database Queries — N+1 Patterns

### 1.1 `AiRepository.findConversation` — Explicit N+1

**File:** `apps/api/src/modules/ai/infrastructure/repositories/ai.repository.ts:42-51`

```typescript
const rows = await prisma.$queryRaw<any[]>`
  SELECT * FROM "conversations" WHERE id = ${id} LIMIT 1
`;
if (!rows.length) return null;
const msgs = await this.findMessages(id);  // ← second query always, even if not needed
return this._mapConversation(rows[0], msgs);
```

Every single conversation fetch unconditionally loads ALL messages. Callers like `sendMessage` in `ai.service.ts:93` immediately call `findMessages` again anyway. **P1**

### 1.2 `KnowledgeService.getDashboardAnalytics` — Loop N+1

**File:** `apps/api/src/modules/knowledge/application/services/knowledge.service.ts:470-498`

```typescript
const analyticsRows = await prisma.knowledge_analytics.findMany({
  include: { knowledge: { select: { slug: true, status: true, workspace_id: true } } },
});
// ...
const wsAnalytics = analyticsRows.filter(a => a.knowledge?.workspace_id === workspaceId);
// ...
for (const a of articles) {
  const analytic = wsAnalytics.find(an => an.knowledge_id === a.id);  // ← O(n*m) in-memory
  viewsByStatus[a.status] = (viewsByStatus[a.status] ?? 0) + (analytic?.views ?? 0);
}
```

Fetches ALL analytics across ALL workspaces, then filters + loops in application memory. Should push filtering and aggregation to the database. **P1**

### 1.3 `SubscriptionService.getActivePlan` — Serial dependent queries

**File:** `apps/api/src/modules/subscription/application/services/subscription.service.ts:59-70`

```typescript
const sub = await this.subscriptionRepository.findActiveByWorkspace(workspaceId);
if (sub) {
  const plan = await this.subscriptionRepository.findPlanById(sub.planId);  // ← serial
  if (plan) return plan;
}
```

Two serial queries where a Prisma `include` or raw SQL `JOIN` would suffice in one round-trip. Called on EVERY calculation request via `getActivePlanSlug`. **P1**

### 1.4 `BillingService._completePayment` — Redundant re-fetch

**File:** `apps/api/src/modules/billing/application/services/billing.service.ts:183`

```typescript
const invoice = await this.billingRepository.findInvoiceById(payment.invoiceId);
```

The invoice ID is already known from the `payment` object and was already fetched earlier in the flow. This re-fetches a row just committed. **P2**

### 1.5 `WorkspaceService.create` — Full table scan for duplicate check

**File:** `apps/api/src/modules/workspace/application/services/workspace.service.ts:37-41`

```typescript
const existingWorkspaces = await this.workspaceRepository.findAll(0, 100);
const duplicate = existingWorkspaces.find(
  (w) => w.name.toLowerCase() === createWorkspaceDto.name.toLowerCase() && !w.isDeleted(),
);
```

Loads up to 100 workspaces into memory and iterates to check for a duplicate name. A single SQL `COUNT` with `LOWER(name) = LOWER($1)` would be O(1). **P2**

---

## 2. Missing Column Selections (`SELECT *`)

30+ raw SQL queries across the codebase use `SELECT *` instead of selecting only needed columns. Major instances:

| File | Line | Query |
|------|------|-------|
| `project/infrastructure/repositories/project.repository.ts` | 67, 85, 165, 183, 238 | All `SELECT *` |
| `ai/infrastructure/repositories/ai.repository.ts` | 16, 26, 45, 101 | All `SELECT *` |
| `api-keys/infrastructure/repositories/api-key.repository.ts` | 34, 46, 63 | All `SELECT *` |
| `auth/infrastructure/repositories/refresh-token.repository.ts` | 46, 70 | All `SELECT *` |
| `auth/infrastructure/repositories/session.repository.ts` | 43, 69 | All `SELECT *` |
| `notification/infrastructure/repositories/notification.repository.ts` | 42, 66, 74, 80, 86 | All `SELECT *` |
| `engineering/infrastructure/repositories/calculation.repository.ts` | 40, 66, 75, 83, 91 | All `SELECT *` |
| `feature-flags/infrastructure/repositories/feature-flag.repository.ts` | 35, 45, 57 | All `SELECT *` |
| `consultations/infrastructure/repositories/consultations.repository.ts` | 63 | `SELECT *` |

Projects table has 17 columns, messages table has 6 JSON/metadata columns — transferring unused bytes every query. **P1**

**Fix:** Replace `SELECT *` with explicit column lists matching only what the entity mapper needs.

---

## 3. Missing or Suboptimal Database Indexes

### 3.1 Missing indexes on commonly filtered columns

| Table | Missing Index | Impact |
|-------|--------------|--------|
| `messages` | `@@index([conversation_id, created_at])` | `ORDER BY created_at ASC` in `AiRepository.findMessages` does a full sort |
| `knowledge` | `@@index([workspace_id, status, is_active])` | Common filter combo in `findAll`, `search`, `count` |
| `knowledge` | `@@index([workspace_id, deleted_at])` | Soft-delete filtering pattern |
| `projects` | `@@index([workspace_id, deleted_at])` | `WHERE deleted_at IS NULL` + `workspace_id` used together |
| `usage_logs` | `@@index([workspace_id, feature, logged_at])` | Monthly usage queries scan many rows |
| `audit_logs` | `@@index([workspace_id, entity, entity_id])` | Entity audit trail lookups |
| `conversations` | `@@index([workspace_id, updated_at])` | List conversations sorted by `updated_at` |

**P2**

### 3.2 Composite indexes that would reduce index-only scans

**File:** `prisma/schema.prisma:577`

```
@@index([conversation_id])
```

Should be `@@index([conversation_id, created_at])` to support the `ORDER BY created_at ASC` in query patterns. **P2**

**File:** `prisma/schema.prisma:294-296`

```
@@index([workspace_id])
@@index([feature])
@@index([logged_at])
```

Three separate indexes. A composite `@@index([workspace_id, feature, logged_at])` would cover the monthly usage aggregation query. **P2**

---

## 4. Prisma Query Performance Anti-Patterns

### 4.1 Manual UPSERT (2 round-trips instead of 1)

**File:** `apps/api/src/modules/project/infrastructure/repositories/project.repository.ts:20-23`

```typescript
const existing = await prisma.$queryRaw<any[]>`
  SELECT id FROM "projects" WHERE id = ${project.id}
`;
if (existing && existing.length > 0) {
  await prisma.$executeRaw`UPDATE ...`;  // ← second query
} else {
  await prisma.$executeRaw`INSERT ...`;  // ← second query
}
```

Same pattern in `project.repository.ts:140-155` (for members) and `llm.provider.ts:109-118` (retry logic). Prisma's native `upsert` does this in one round-trip. **P1**

### 4.2 Raw SQL everywhere instead of Prisma client

**File:** `apps/api/src/modules/ai/infrastructure/repositories/ai.repository.ts`

The entire `AiRepository` uses `$queryRaw` and `$executeRaw` instead of Prisma's generated types (`prisma.agents.findFirst`, `prisma.conversations.findUnique`, etc.). This bypasses:
- Prisma query engine optimizations (batch, cache, connection pooling)
- Type safety
- Middleware/hooks

**P1**

### 4.3 Manual cascade DELETE (3 queries instead of 1 with CASCADE)

**File:** `apps/api/src/modules/project/infrastructure/repositories/project.repository.ts:114-116`

```typescript
await prisma.$executeRaw`DELETE FROM "project_members" WHERE project_id = ${id}`;
await prisma.$executeRaw`DELETE FROM "project_notes"   WHERE project_id = ${id}`;
await prisma.$executeRaw`DELETE FROM "projects"        WHERE id = ${id}`;
```

Schema already defines `onDelete: Cascade` for these relations. Prisma's `delete` with cascade would do this automatically in fewer queries. **P2**

### 4.4 Missing pagination in `calculation.repository.ts`

**File:** `apps/api/src/modules/engineering/infrastructure/repositories/calculation.repository.ts:66-91`

The `findAll` method builds 4 separate "query by slug" patterns — each `SELECT *` — with no pagination applied directly. Pagination is only handled in the service layer. **P2**

---

## 5. Qdrant / Vector Search Performance

### 5.1 `wait=True` on every upsert

**File:** `workspace/services/ai-service/app/rag/qdrant_store.py:104-108`

```python
await client.upsert(
    collection_name=name,
    points=points,
    wait=True,  # ← blocks until all replicas confirm
)
```

For bulk document ingestion, `wait=False` would be 5-10x faster followed by a single `await client.collection.ensure()` at the end. **P1**

### 5.2 Extra `collection_exists` call on every search

**File:** `workspace/services/ai-service/app/rag/qdrant_store.py:120-124`

```python
exists = await client.collection_exists(name)
if not exists:
    return []
```

An extra network round-trip on every search query. The `search` call itself would return empty results for a missing collection. **P2**

### 5.3 Sequential multi-collection retrieval

**File:** `workspace/services/ai-service/app/rag/retriever.py:105-113`

```python
for collection in collections:
    collection_results = await self.retrieve(
        query=query, workspace_id=workspace_id, collection=collection, ...
    )
    results[collection] = collection_results
```

Same pattern in `retrieve_with_context` (line 145-153). Collections are searched sequentially. With 3+ collections, using `asyncio.gather` would be 3x faster. **P1**

### 5.4 Default limit too conservative

**File:** `workspace/services/ai-service/app/rag/qdrant_store.py:116`

```python
limit: int = 5,
```

A hardcoded limit of 5 is fine for chat, but the same store is used for RAG context building where more results improve quality. **P3**

---

## 6. Caching / Redis — Near-Total Absence

### 6.1 No Redis caching layer anywhere

The entire codebase has zero Redis integration. There is no:
- Cache for subscription plan lookups (`getActivePlanSlug` hits DB on EVERY calculation request)
- Cache for workspace settings
- Cache for user permissions/roles
- Rate limiter backed by Redis
- Session store (in-memory only)

**P0** — missing caching for hot-path queries is the #1 performance gap.

### 6.2 In-memory cache — unbounded, no TTL, no eviction

**File:** `workspace/services/ai-service/app/rag/retriever.py:31,60-78`

```python
self._cache = {}

async def retrieve(self, ..., use_cache: bool = True):
    cache_key = f"{workspace_id}:{collection}:{query}:{limit}"
    if use_cache and cache_key in self._cache:
        return self._cache[cache_key]
    # ...
    if use_cache:
        self._cache[cache_key] = results
```

- Unbounded growth (memory leak under load)
- No TTL / expiry
- No LRU / LFU eviction
- Cache key includes full query text (collision risk)
- Cache persists across requests in the same worker only (not shared)

**P2**

### 6.3 `getActivePlanSlug` hot path — no caching

**File:** `apps/api/src/modules/subscription/application/services/subscription.service.ts:51-53`

```typescript
async getActivePlanSlug(workspaceId: string): Promise<string> {
  const sub = await this.subscriptionRepository.findActiveByWorkspace(workspaceId);
  return sub?.planSlug ?? 'free';
}
```

Called before EVERY engineering calculation (see `engineering.service.ts:139`). Plans rarely change — should be cached with TTL (e.g., 5 minutes). **P1**

---

## 7. Memory Allocation Issues

### 7.1 `crypto.randomUUID()` called manually everywhere

40+ instances of `crypto.randomUUID()` across entities and services (e.g., `knowledge.service.ts:318,448,573,654,663,683,719`). While each call is fast, this is 40 extra UUID allocations per request that could be deferred to the database `@default(uuid())`. Every entity constructor calls it regardless of whether the entity will be saved. **P3**

### 7.2 Large content objects loaded unnecessarily

**File:** `apps/api/src/modules/knowledge/application/services/knowledge.service.ts:65-70`

`findPublished` loads the full `content` JSON column (blocks potentially 100KB+) for every article in a list view. Users browsing articles only need `title`, `slug`, `status`, `published_at`. **P1**

### 7.3 File store loads entire collection into memory

**File:** `workspace/services/ai-service/app/rag/file_store.py:28-33`

```python
def _load_collection(self, collection: str) -> Dict:
    with open(file_path, 'r') as f:
        return json.load(f)
```

An entire collection of potentially thousands of vectors is loaded into RAM for every single search or write operation. For 10K documents with embeddings, this could be 500MB+ per read. **P1**

---

## 8. CPU Hotspots

### 8.1 In-memory sorting of analytics data

**File:** `apps/api/src/modules/knowledge/application/services/knowledge.service.ts:485-488`

```typescript
const mostViewed = wsAnalytics
  .sort((a, b) => b.views - a.views)
  .slice(0, 10)
```

Sorting all analytics rows (potentially thousands across all workspaces) in application memory. Should use `ORDER BY views DESC LIMIT 10` in SQL. **P2**

### 8.2 Array deduplication with spread + Set

**File:** `apps/api/src/modules/knowledge/application/services/knowledge.service.ts:408-413`

```typescript
const calculatorTypes = [
  ...new Set([
    ...formulas.map((f: any) => f.calculator_type),
    ...examples.map((e: any) => e.calculator_type),
  ]),
].filter(Boolean) as string[];
```

Creates intermediate arrays for spread operator then a Set. For small arrays (0-10 items) this is minimal, but the pattern appears in hot-ish paths. **P3**

### 8.3 `_determine_complexity` and `_determine_task_type` called on every message

**File:** `workspace/services/ai-service/app/core/base_agent.py:154-191`

Two functions that each iterate keyword lists with `any(kw in message_lower ...)` on every user message. Each call scans ~15-20 keywords. These are cheap individually but run on every chat interaction. **P3**

---

## 9. Serialization Overhead

### 9.1 Pretty-printed JSON in LLM prompts

**File:** `apps/api/src/modules/ai/application/services/ai.service.ts:169-170`

```typescript
const inputStr = JSON.stringify(inputs, null, 2);
const resultStr = result ? JSON.stringify(result, null, 2) : 'N/A (result not provided)';
```

Using `null, 2` (pretty-print) increases token count by 30-50% for no benefit to the LLM. Compacting would reduce token cost and latency. **P2**

### 9.2 System prompt re-serialized on every request

**File:** `apps/api/src/modules/ai/infrastructure/providers/llm.provider.ts:133`

```typescript
messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
```

The 500+ character `SYSTEM_PROMPT` is concatenated into the messages array and then `JSON.stringify(body)` is called every time (`line 144`). A cached serialized body template could avoid re-stringifying the constant system prompt. **P2**

### 9.3 SSE handler double-encodes JSON

**File:** `apps/api/src/modules/ai-runtime/infrastructure/streaming/sse-streaming.handler.ts:18-24`

```typescript
const payload = JSON.stringify({ type: chunk.type, data: chunk.data, ... });
this._send(`event: ${chunk.type}\ndata: ${payload}\n\n`);
```

For every streaming token/chunk, a new JSON payload is serialized. With rapid streaming, this creates allocation pressure. Consider pre-serializing fixed fields. **P3**

---

## 10. OpenAPI Generation

### 10.1 Regenerated on every build unconditionally

**File:** `apps/api/package.json:12`

```json
"build": "tsc && pnpm generate:openapi"
```

The OpenAPI spec is regenerated on every single TypeScript build, even when no API contracts changed. For a team with frequent builds, this adds ~5-15s of unnecessary overhead per build. **P2**

### 10.2 Uses interpreted tsx runner (not compiled)

**File:** `apps/api/package.json:14`

```json
"generate:openapi": "node --import tsx scripts/generate-openapi.ts"
```

Running through `tsx` (TypeScript interpreter) is slower than running compiled JS. Should run the compiled output or only regenerate when source files change. **P2**

---

## 11. Streaming Implementation Issues

### 11.1 `LlmProvider.chatStream` is fake streaming

**File:** `apps/api/src/modules/ai/infrastructure/providers/llm.provider.ts:171-177`

```typescript
async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
  const result = await this.chat(messages);  // ← waits for full response
  for (const word of result.content.split(' ')) {
    yield word + ' ';
    await new Promise(r => setTimeout(r, 15)); // ← artificial delay
  }
}
```

This is NOT streaming — it waits for the full LLM response, then simulates streaming by splitting words. Real streaming should use the provider's SSE-based streaming API. TTFB (time-to-first-token) is identical to non-streaming responses. **P0**

### 11.2 Simulated streaming in Electrical Engineer agent

**File:** `workspace/services/ai-service/app/agents/electrical_engineer/agent.py:163-172`

```python
async def stream(self, input: ChatInput):
    response_text = await self._generate_response(input.message)
    chunk_size = 50
    for i in range(0, len(response_text), chunk_size):
        yield response_text[i:i + chunk_size]
        await asyncio.sleep(0.03)
```

Same pattern — generates the full response first, then chunks it with artificial delays. Defeats the purpose of streaming (no pipelining of generation). **P0**

### 11.3 Hardcoded 15ms delay in streaming manager

**File:** `apps/api/src/modules/ai-runtime/application/services/streaming-response-manager.service.ts:67-73`

```typescript
const words = response.split(' ');
for (const word of words) {
  await this.sendToken(streamId, word + ' ');
  await new Promise(r => setTimeout(r, delayMs));
}
```

The 15ms delay is hardcoded regardless of response length or rate limits. This means a 100-word response always takes exactly 1.5s to stream. **P2**

---

## 12. Network Call Patterns

### 12.1 Missing parallelism in multi-collection retrieval

**File:** `workspace/services/ai-service/app/rag/retriever.py:105-113`

Each collection is searched sequentially. With 3-5 collections common in RAG, this adds serial latency. Should use `asyncio.gather(...)`. **P1**

### 12.2 No circuit breaker or timeout on external calls

**File:** `apps/api/src/modules/engineering/infrastructure/http/engineering-client.service.ts`

External HTTP calls to the Python engineering service have no circuit breaker pattern. A slow or overloaded engineering service would cause API gateway workers to accumulate and exhaust memory/connections. **P2**

### 12.3 Serial billing flow

**File:** `apps/api/src/modules/billing/application/services/billing.service.ts:110-127`

The `requestGatewayPayment` method does:
1. Fetch payment from DB
2. Save payment status update
3. Call external Zarinpal API (network latency)
4. Save payment authority

Steps 1-2 are serial but could be batched. Step 4 could be deferred. **P3**

---

## 13. File I/O Issues

### 13.1 Synchronous file I/O in async context

**File:** `workspace/services/ai-service/app/rag/file_store.py:28-37`

```python
def _load_collection(self, collection: str) -> Dict:
    with open(file_path, 'r') as f:    # ← blocking I/O
        return json.load(f)
def _save_collection(self, collection: str, data: Dict):
    with open(self._get_collection_file(collection), 'w') as f:  # ← blocking I/O
        json.dump(data, f)
```

Called in async functions but uses synchronous `open/read/write`. This blocks the event loop. Should use `aiofiles` for async file I/O. **P1**

### 13.2 File-based vector store loads/saves on every operation

Every `add_documents`, `search`, `delete_documents`, `delete_workspace` call reads the entire JSON file from disk, operates in memory, then writes it back. For any reasonable dataset (>1000 vectors), this is extremely slow. **P1**

---

## 14. Module Loading / Application Startup

### 14.1 Cross-module coupling causing eager loading

**File:** `apps/api/src/modules/engineering/application/services/engineering.service.ts:10`

```typescript
import { SubscriptionService, FEATURE } from '../../../subscription/application/services/subscription.service.js';
```

Deep cross-module import path that forces NestJS to resolve the subscription module before the engineering module can be constructed. With 29 modules, these cross-dependencies can cascade and slow startup. **P2**

### 14.2 Calculation registry imports all calculators at module level

**File:** `apps/api/src/modules/engineering/domain/entities/calculation.entity.ts`

All calculator classes are imported at module level during startup. With 40+ calculator registrations in `main.py`, this slows cold starts. Lazy initialization could help. **P3**

---

## 15. Prompt Template Building

### 15.1 JSON.stringify with pretty-print in prompt templates

**File:** `apps/api/src/modules/ai/application/services/ai.service.ts:169-170`

```typescript
const inputStr = JSON.stringify(inputs, null, 2);
const resultStr = result ? JSON.stringify(result, null, 2) : 'N/A (result not provided)';
```

Pretty-printing adds significant token count. For a calculation with 50 parameters, this can double the token count. With GPT-4o at $0.005/1K input tokens, unnecessary tokens add real cost. **P2**

### 15.2 Prompt template uses string concatenation

**File:** `apps/api/src/modules/ai/application/services/ai.service.ts:172-197`

The entire prompt is built as a single template string with embedded `${}`. For very large prompts with many inputs, consider a template engine or builder pattern that only includes filled sections. **P3**

---

## 16. Large Object / DTO Construction

### 16.1 Full knowledge entity reconstitution in list views

**File:** `apps/api/src/modules/knowledge/application/services/knowledge.service.ts:65-97`

`findPublished` fetches full rows including the `content` JSONB column (potentially 50-500KB per article), then reconstitutes the full `KnowledgeEntity` for every article in a paginated list. List views only need `slug`, `status`, `title`, `published_at`. **P1**

### 16.2 Large DTO construction in dashboard analytics

**File:** `apps/api/src/modules/knowledge/application/services/knowledge.service.ts:496-498`

```typescript
return KnowledgeDashboardStatsDto.fromData({
  totalArticles, totalViews, publishedArticles, draftArticles, mostViewed, viewsByStatus,
});
```

Constructs a full DTO with computed data for every dashboard request. The `mostViewed` computation alone sorts and slices all analytics. **P3**

---

## 17. Miscellaneous

### 17.1 AgentRegistry re-instantiated on every health check

**File:** `workspace/services/ai-service/app/main.py:130-131`

```python
@app.get("/health")
async def health_check():
    registry = AgentRegistry()  # ← created fresh every time
```

`AgentRegistry()` is instantiated on every health check call. It should be stored in `app.state` like the lifespan does. **P2**

### 17.2 Same agent-registry pattern in chat endpoint

**File:** `workspace/services/ai-service/app/main.py:156-158`

```python
@app.post("/api/v1/ai/chat")
async def chat(input: ChatInput):
    registry = AgentRegistry()  # ← created fresh even though app.state.registry exists
```

Creates a new, empty `AgentRegistry` instance instead of using the one from `app.state.registry`. No agents would be found since `register()` calls only happen in lifespan. **P0**

### 17.3 `numpy` seed set on every embedding call

**File:** `workspace/services/ai-service/app/rag/embedding_pipeline.py:46`

```python
np.random.seed(hash(str(dimension)) % 2**32)
```

Called on every `_generate_dummy_embedding` call. Sets the global numpy random seed which can affect other numpy operations. Should use a `RandomState` instance. **P3**

---

## Summary by Severity

| Priority | Count | Key Issues |
|----------|-------|------------|
| **P0** | 4 | No Redis caching at all; fake streaming (2 instances); empty AgentRegistry on every request |
| **P1** | 14 | N+1 queries; `SELECT *` everywhere; manual UPSERT; raw SQL abuse; Qdrant `wait=True`; sequential collection searches; full content loaded in list views; synchronous file I/O; file store loads everything in memory |
| **P2** | 12 | Missing composite indexes; missing column selections; cascade DELETE redundancy; unbounded in-memory cache; in-memory analytics sorting; OpenAPI re-generated on every build; no circuit breaker; cross-module coupling; extra `collection_exists` call |
| **P3** | 8 | Conservative Qdrant limit; UUID allocation; double-encoding in SSE; keyword scanning per message; hardcoded streaming delay |

## Top 5 Quick Wins

1. **Add Redis caching for `getActivePlanSlug`** — saves a DB call on EVERY calculation request
2. **Fix fake streaming in `LlmProvider.chatStream`** — use actual SSE-based streaming from provider APIs
3. **Replace manual UPSERT with Prisma's native `upsert`** — cuts 2 round-trips to 1 across 3+ repositories
4. **Add parallelism to multi-collection retrieval** — use `asyncio.gather` instead of sequential loops
5. **Replace `SELECT *` with explicit column lists** — reduce data transfer in 30+ queries
