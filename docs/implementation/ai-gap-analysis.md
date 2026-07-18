# AI Subsystem Gap Analysis

**Generated:** 2026-07-02
**Source:** `docs/audit/ai-audit.md`, `docs/audit/performance.md`, `docs/audit/security.md`, `docs/audit/technical-debt.md`, `docs/audit/production-readiness.md`, `docs/audit/code-quality.md`, `docs/audit/architecture-audit.md`, `docs/audit/FULL_RECOVERY_REPORT.md`, `docs/audit/03_KNOWLEDGE_FACTORY_AUDIT.md`

---

## 1. LLM Integration

### Current State

- **NestJS LlmProvider** (`apps/api/src/modules/ai/infrastructure/providers/llm.provider.ts`): Has OpenAI-compatible HTTP client with retry logic, but:
  - `chat()` method uses mock fallback `_smartMock()` when API key is missing — returns hardcoded plausible-sounding but potentially incorrect engineering advice (line 121)
  - `chatStream()` is fake: waits for full response then splits into words with 15ms artificial delay (line 171-176)
  - No abstraction interface — `AiService` depends directly on `LlmProvider` concrete class (infrastructure leak)
  - System prompt is static, no dynamic context injection
- **Python AI Service** (`workspace/services/ai-service/app/core/model_router.py`): Has `ModelRouter` with OpenAI/Anthropic/Google provider detection, but:
  - `ElectricalEngineerAgent._generate_response()` uses hardcoded if/else rules — **never calls any LLM** (`agent.py:44-139`)
  - `ModelRouter.route()` is called by `DocumentAnalystAgent._generate_summary()` for summary only — Electrical Engineer Agent ignores it entirely
  - Provider client creation uses hardcoded SDK detection — no generic OpenAI-compatible fallback for non-GPT models
  - No provider API key validation at startup — `initialize_providers()` may return empty dict silently
- **NestJS Execution Pipeline** (`execution-pipeline.service.ts:71-73`): `llmCall` callback receives messages and returns `last.content` — echoes user input, never calls LLM

### Target State

- Multi-provider OpenAI-compatible LLM integration with fallback chain (Groq → OpenAI → Anthropic → local Ollama)
- Real SSE streaming from provider APIs (not word-splitting simulation)
- `ILlmProvider` interface with implementations for each provider
- Provider health checks, rate-limit handling, retry with exponential backoff
- Dynamic system prompt with RAG context injection, workspace info, user role

### Missing Implementation

| Missing                                                    | File                                         | Effort |
| ---------------------------------------------------------- | -------------------------------------------- | ------ |
| `ILlmProvider` interface                                   | `apps/api/src/modules/ai/domain/interfaces/` | 2h     |
| Provider implementations (Groq, OpenAI, Anthropic, Ollama) | New files in `infrastructure/providers/`     | 8h     |
| Provider fallback chain with circuit breaker               | `llm.provider.ts` rewrite                    | 4h     |
| Real SSE streaming from provider                           | `llm.provider.ts:171-176`                    | 4h     |
| `_generateResponse()` → real LLM call via ModelRouter      | `agent.py:44-139`                            | 8h     |
| Execution pipeline real LLM integration                    | `execution-pipeline.service.ts:71-73`        | 4h     |
| Provider health check + startup validation                 | `model_router.py:115`                        | 2h     |

### Required Libraries

- `openai` (Python) — already in requirements.txt but not installed in venv
- No additional NestJS packages needed (uses fetch directly)

### Estimated Effort: **32h**

### Dependencies

- Phase 0: Fix embedding pipeline (need real embeddings for RAG context)
- Phase 1: Env validation (API keys must be validated at startup)

### Priority: **P0**

---

## 2. Embedding Pipeline

### Current State

- **File:** `workspace/services/ai-service/app/rag/embedding_pipeline.py`
- Model: `text-embedding-3-small` (1536 dims) — hardcoded singleton
- Batch size: 100, rate-limit delay: 0.1s
- **Critical bug:** Fallback mode at line 46 uses `np.random.seed(hash(str(dimension)) % 2**32)` — produces the **same random seed for every call**, meaning all documents get **identical random vectors**. Cosine similarity between identical vectors = 1.0, making retrieval entirely meaningless.
- Fallback uses `print()` instead of logging (line 69)
- No embedding dimension validation — if API model changes dimensions, Qdrant silently rejects vectors
- Single model hardcoded — no domain-specific embedding support (engineering standards need specialized models)

### Target State

- Real embedding generation via API (text-embedding-3-small or text-embedding-ada-002)
- Content-based hash fallback (e.g., `hashlib.sha256(text.encode()).hexdigest()` for unique deterministic fallback vectors)
- Multi-model support with configurable embedding model per collection type
- Embedding dimension validation against Qdrant collection config
- Batch processing with progress tracking and error recovery
- Circuit breaker for API rate limits
- Async embedding with concurrent batch processing

### Missing Implementation

| Missing                           | File                       | Effort |
| --------------------------------- | -------------------------- | ------ |
| Fix seed → content-based hash     | `embedding_pipeline.py:46` | 1h     |
| Replace `print()` with logging    | `embedding_pipeline.py:69` | 0.5h   |
| Add dimension validation          | `embedding_pipeline.py:78` | 1h     |
| Add multi-model routing           | New `embedding_router.py`  | 4h     |
| Add circuit breaker for API calls | `embedding_pipeline.py`    | 2h     |
| Add progress tracking + resume    | `embedding_pipeline.py`    | 4h     |

### Required Libraries

- `numpy` — already installed
- `openai` — already in requirements.txt

### Estimated Effort: **12.5h**

### Dependencies

- None (independent fix)

### Priority: **P0**

---

## 3. Real Vector Search

### Current State

- **File:** `workspace/services/ai-service/app/rag/retriever.py` and `qdrant_store.py`
- Pure vector similarity search (cosine) — no hybrid search (BM25/sparse)
- No re-ranking — results sorted by raw similarity score
- Score threshold defaults to 0.7 — too aggressive for cosine similarity, may miss relevant results
- In-memory cache is unbounded with no TTL (`retriever.py:31,60-78`)
- Sequential multi-collection search — 3 collections × serial = 3x latency
- Qdrant `wait=True` on every upsert blocks until all replicas confirm
- Extra `collection_exists` call on every search (extra round-trip)
- Default limit hardcoded to 5 — too conservative for RAG context building
- File store loads entire collection into RAM for every operation
- No index configuration on Qdrant collection — default HNSW only

### Target State

- Hybrid search: dense vector + BM25 sparse retrieval with Reciprocal Rank Fusion (RRF)
- Cross-encoder re-ranking: top-k results from hybrid search re-ranked with cross-encoder model
- Configurable score threshold per collection type
- Redis-backed cache with TTL and LRU eviction
- Parallel multi-collection search via `asyncio.gather`
- `wait=False` on bulk upserts with periodic ensure
- Remove `collection_exists` check — let search return empty
- Configurable limit per query type
- Qdrant index configuration with payload indexing for workspace_id

### Missing Implementation

| Missing                             | File                      | Effort |
| ----------------------------------- | ------------------------- | ------ |
| Hybrid search (BM25 + RRF)          | `retriever.py:68`         | 8h     |
| Cross-encoder re-ranking            | `retriever.py:156`        | 6h     |
| Cache with TTL + eviction           | `retriever.py:31,60-78`   | 3h     |
| Parallel multi-collection search    | `retriever.py:105-113`    | 1h     |
| Optimize Qdrant upsert (wait=False) | `qdrant_store.py:104-108` | 0.5h   |
| Remove `collection_exists` check    | `qdrant_store.py:120-124` | 0.5h   |
| Configurable limit per query type   | `qdrant_store.py:116`     | 0.5h   |
| Qdrant index configuration          | `qdrant_store.py:73-76`   | 1h     |
| Async file I/O for file store       | `file_store.py:28-37`     | 2h     |

### Required Libraries

- `sentence-transformers` (for cross-encoder) — new dependency
- `rank-bm25` (for BM25) — new dependency
- `aiofiles` (for async file I/O) — new dependency

### Estimated Effort: **22.5h**

### Dependencies

- Gap 2 (Embedding Pipeline) — embeddings must be real for meaningful search

### Priority: **P1**

---

## 4. Citation Verification

### Current State

- **Status:** ❌ NOT IMPLEMENTED — no citation engine exists anywhere in the codebase
- `Source` model exists in `schemas/outputs.py` with fields `type`, `reference`, `section` — but **never populated**
- `ElectricalEngineerAgent` returns `"sources": []` (empty array) in every response
- No code that extracts source references from LLM responses
- No document/page citation tracking
- No standard reference formatting (IEC, IEEE, NEC paragraph references)
- No link generation to source documents in Qdrant

### Target State

- Citation engine that maps every claim in LLM response to source document chunks
- Source extraction from LLM responses via structured output parsing
- Document-level citations with page/section/paragraph references
- Standard citation formatting for IEC, IEEE, NEC, BS, DIN, ISIRI
- Source confidence scoring (how well does a claim match its source)
- Link generation to source documents in knowledge base
- Citation metadata in ExecutionResult for provenance

### Missing Implementation

| Missing                                    | File                            | Effort |
| ------------------------------------------ | ------------------------------- | ------ |
| CitationEngine class                       | New `rag/citation_engine.py`    | 8h     |
| Source extraction from LLM responses       | `citation_engine.py`            | 6h     |
| Standard reference formatter               | New `rag/citation_formatter.py` | 4h     |
| Source → document link resolver            | New `rag/citation_resolver.py`  | 4h     |
| Citation metadata in ExecutionResult       | `execution.types.ts`            | 2h     |
| Populate `Source` model in agent responses | `schemas/outputs.py`            | 2h     |

### Required Libraries

- None beyond existing

### Estimated Effort: **26h**

### Dependencies

- Gap 1 (LLM Integration) — need real LLM responses to cite
- Gap 3 (Vector Search) — need real search results to cite

### Priority: **P1**

---

## 5. Evidence Chain

### Current State

- **Status:** ❌ NOT IMPLEMENTED — no provenance tracking anywhere
- `ExecutionResult.stages` tracks pipeline stage execution but **does not track which documents were retrieved or which tools were invoked** to produce a response
- `ExecutionContext` has no `retrievedDocuments` or `usedSources` fields
- No audit log of which documents/chunks informed which AI response
- No claim verification against source documents
- No traceability from source → chunk → embedding → retrieval → response

### Target State

- Provenance tracking from source document → chunk → embedding → retrieval → LLM response
- `retrievedDocuments` and `usedSources` fields in `ExecutionContext` and `ExecutionResult`
- Claim-source mapping: every factual claim in response linked to its source chunk
- Audit log with full evidence chain per response
- Verification endpoint: given a response, trace which documents informed it
- Chain visualization for admin/audit

### Missing Implementation

| Missing                                        | File                                     | Effort |
| ---------------------------------------------- | ---------------------------------------- | ------ |
| Add `retrievedDocuments` to `ExecutionContext` | `execution.types.ts`                     | 1h     |
| Add `usedSources` to `ExecutionResult`         | `execution.types.ts`                     | 1h     |
| EvidenceChainService class                     | New `rag/evidence_chain.py`              | 8h     |
| Claim-source mapping logic                     | `evidence_chain.py`                      | 6h     |
| Audit log for evidence chain                   | New `services/evidence-audit.service.ts` | 4h     |
| Verification endpoint                          | New controller + route                   | 4h     |
| Chain visualization data                       | `evidence_chain.py`                      | 4h     |

### Required Libraries

- None beyond existing

### Estimated Effort: **28h**

### Dependencies

- Gap 4 (Citation Engine) — citation is prerequisite for evidence tracking
- Gap 3 (Vector Search) — need real retrieval pipeline

### Priority: **P1**

---

## 6. Prompt Execution

### Current State

- **NestJS PromptRegistryService** (`prompt-registry.service.ts`): CRUD for templates — well-designed, but:
  - In-memory store only — templates lost on restart
  - No template version resolution — hardcoded `1.0.0`
  - No template composition (cannot include/reference other templates)
- **NestJS PromptTemplateEngineService** (`prompt-template-engine.service.ts`): Variable interpolation with `{{variable}}` syntax — functional, but:
  - No conditional sections (include/exclude based on variables)
  - No loop/iteration support (cannot iterate over tool results or document chunks)
  - No escaping for `{{` in user content
- **Execution pipeline:** prompt rendering works, but the pipeline returns `last.content` — echoes user input, **never executes the rendered prompt through an LLM**
- **Python side:** No prompt builder at all — system prompts are hardcoded strings

### Target State

- Real prompt rendering → LLM call → response processing pipeline
- Template registry with version pinning and DB persistence
- Template composition (includes, partials, sections)
- Conditional rendering (`{{#if context}}...{{/if}}`)
- Loop/iteration support (`{{#each tools}}...{{/each}}`)
- Proper escaping for user content
- Prompt version migration strategy
- A/B testing capability for prompt variations
- Prompt performance tracking (tokens used, response quality)

### Missing Implementation

| Missing                                 | File                                  | Effort |
| --------------------------------------- | ------------------------------------- | ------ |
| DB-backed prompt template store         | New `prisma-prompt-template.store.ts` | 3h     |
| Conditional section support             | `prompt-template-engine.service.ts`   | 4h     |
| Loop/iteration support                  | `prompt-template-engine.service.ts`   | 3h     |
| Template version resolution             | `prompt-registry.service.ts`          | 3h     |
| Template composition (includes)         | `prompt-registry.service.ts`          | 4h     |
| Real LLM call in execution pipeline     | `execution-pipeline.service.ts:71-73` | 4h     |
| Response processing (structured output) | New `response-processor.service.ts`   | 4h     |
| Prompt performance tracking             | New `prompt-analytics.service.ts`     | 3h     |
| Escape handling (`{{` in user content)  | `prompt-template-engine.service.ts`   | 1h     |

### Required Libraries

- None beyond existing (NestJS)

### Estimated Effort: **29h**

### Dependencies

- Gap 1 (LLM Integration) — need real LLM to execute prompts against
- Phase 1 (env validation) — DB connection for persistent store

### Priority: **P1**

---

## 7. Tool Execution

### Current State

- **NestJS Tool System:** Well-designed with:
  - `tool-registry.service.ts` — registration with parameters, handler dispatch
  - `tool-dispatcher.service.ts` — batch dispatch with validation
  - `tool-input.validator.ts` — type checking
  - Structured `ToolResult` with error handling
  - **Issues:** No tool timeout, no rate limiting per tool, no discovery endpoint, validator is shallow (no min/max/enum/nested validation)
- **Python Tool Implementations:** 10+ tool functions in `electrical_engineer/tools.py` with full PydanticAI `RunContext` annotations — but **never registered or called by any agent** (dead code)
- `CalculationTool` in `calculation_tool.py` bridges to engineering-service HTTP API — but no error mapping, no circuit breaker
- Tools have no permission checking, no audit trail, no timeout

### Target State

- Cross-platform tool system: Python tool definitions consumed by NestJS tool registry
- LLM function-calling integration: tools registered as functions for LLM to call
- Tool execution with timeout, circuit breaker, rate limiting
- Parameter validation with full schema (min, max, enum, nested objects)
- Tool discovery endpoint returns available tools with schemas
- Tool execution audit trail
- Permission-based tool access (RBAC per tool)
- Tool chaining (output of one tool → input of another)

### Missing Implementation

| Missing                                      | File                         | Effort |
| -------------------------------------------- | ---------------------------- | ------ |
| Connect Python tools to LLM function-calling | `agent.py` + `tools.py`      | 8h     |
| Add tool timeout to registry                 | `tool-registry.service.ts`   | 2h     |
| Add per-tool rate limiting                   | `tool-dispatcher.service.ts` | 2h     |
| Deep validator (min/max/enum/nested)         | `tool-input.validator.ts`    | 3h     |
| Tool discovery endpoint                      | New controller               | 2h     |
| Tool audit trail                             | New interceptor              | 2h     |
| Circuit breaker for CalculationTool          | `calculation_tool.py`        | 2h     |
| Error mapping for CalculationTool            | `calculation_tool.py:67-68`  | 1h     |

### Required Libraries

- None beyond existing

### Estimated Effort: **22h**

### Dependencies

- Gap 1 (LLM Integration) — need real LLM to drive function calling

### Priority: **P1**

---

## 8. Streaming

### Current State

- **NestJS LlmProvider.chatStream()** (`llm.provider.ts:171-176`): Fake streaming — calls `await this.chat()` (full response), then splits into words with 15ms delay
- **Python ElectricalEngineerAgent.stream()** (`agent.py:163-171`): Same pattern — generates full response first, chunks into 50-char pieces with 30ms delay
- **NestJS StreamingResponseManager** (`streaming-response-manager.service.ts:64-75`): Split by words, send each with hardcoded 15ms delay
- **SSE handler** (`sse-streaming.handler.ts`): Double-encodes JSON on every chunk — allocation pressure
- **TTFB (time-to-first-token):** Identical to non-streaming in all cases — defeats purpose of streaming
- No backpressure handling — client disconnect causes handler leak (Map grows unbounded)

### Target State

- Real SSE streaming from provider API — tokens arrive as generated
- TTFB < 500ms (first token visible quickly)
- Backpressure handling with proper Node.js stream backpressure
- Client disconnect cleanup: remove handler, free resources
- Streaming metrics: tokens per second, TTFB, total streaming time
- Provider-agnostic streaming adapter (OpenAI SDK, Anthropic SDK, generic SSE)
- Streaming to multiple consumers (web UI, API client, admin dashboard)

### Missing Implementation

| Missing                                   | File                                    | Effort |
| ----------------------------------------- | --------------------------------------- | ------ |
| Real provider SSE streaming               | `llm.provider.ts:171-176`               | 6h     |
| Python real streaming via async generator | `agent.py:163-171`                      | 4h     |
| Backpressure handling                     | `streaming-response-manager.service.ts` | 3h     |
| Client disconnect cleanup                 | `streaming-response-manager.service.ts` | 2h     |
| Streaming metrics collection              | New `streaming-metrics.service.ts`      | 2h     |
| Fix SSE double-encoding                   | `sse-streaming.handler.ts:18-24`        | 1h     |

### Required Libraries

- None beyond existing

### Estimated Effort: **18h**

### Dependencies

- Gap 1 (LLM Integration) — need real LLM streaming API

### Priority: **P0**

---

## 9. Memory

### Current State

- **NestJS MemoryAbstractionService** (`memory-abstraction.service.ts`): In-memory only with CRUD operations for `message`, `summary`, `fact`, `preference` types — but:
  - No conversation summarization: `storeConversationSummary` stores whatever string passed — no automatic compression
  - No memory consolidation: short-term memories (messages) never consolidated into long-term (facts/preferences)
  - No decay/importance scoring: score defaults to 1.0, never adjusted
  - `InMemoryMemoryStore` has no size limit — unbounded growth
- **Python Agent Memory** (`base_agent.py:67`): In-memory dict per agent instance — last 10 messages only
- All memory is ephemeral — lost on restart across both NestJS and Python
- `InMemorySessionStore` — sessions lost on restart
- `InMemoryPromptTemplateStore` — templates lost on restart

### Target State

- Persistent memory via Prisma/PostgreSQL (messages, facts, preferences)
- Automatic conversation summarization — extract key facts from history
- Memory consolidation: messages → facts/preferences via LLM extraction
- Temporal decay: older memories have lower importance scores
- Session awareness: memory per user session, cross-session memory via user identity
- Memory retrieval: recall relevant facts based on current context
- Configurable memory windows: last N messages, summary, facts, preferences
- TTL-based memory pruning

### Missing Implementation

| Missing                                 | File                                  | Effort |
| --------------------------------------- | ------------------------------------- | ------ |
| DB-backed memory store                  | New `prisma-memory.store.ts`          | 4h     |
| DB-backed session store                 | New `prisma-session.store.ts`         | 3h     |
| DB-backed prompt template store         | New `prisma-prompt-template.store.ts` | 3h     |
| Conversation summarization              | `memory-abstraction.service.ts`       | 6h     |
| Memory consolidation (facts extraction) | New `memory-consolidation.service.ts` | 6h     |
| Temporal decay scoring                  | `memory-abstraction.service.ts`       | 3h     |
| Cross-session memory recall             | New `memory-recall.service.ts`        | 4h     |
| Python persistent memory                | New `persistent_memory.py`            | 4h     |

### Required Libraries

- None beyond existing (Prisma)

### Estimated Effort: **33h**

### Dependencies

- Gap 1 (LLM Integration) — consolidation and summarization need LLM
- Phase 1 (env validation, graceful shutdown)

### Priority: **P1**

---

## 10. Reasoning

### Current State

- **Status:** ❌ NOT IMPLEMENTED
- No chain-of-thought (CoT) prompting in any agent
- No multi-step reasoning in Electrical Engineer Agent — hardcoded if/else `current <= 100 → 35mm²` oversimplification
- `_determine_complexity()` and `_determine_task_type()` in `base_agent.py:154-191` are basic keyword-matching, not true reasoning
- No structured reasoning output (thinking traces, step-by-step explanations)
- No validation of reasoning steps (each step independently verifiable)
- No multi-method verification (same calculation via 2 methods to cross-check)

### Target State

- Chain-of-thought prompting for engineering calculations
- Structured reasoning with intermediate steps (step-by-step trace)
- Multi-method verification: compute result via 2 independent methods, flag discrepancy
- Reasoning trace in execution result for audit/transparency
- Step-level confidence scoring
- Self-correction: detect errors in own reasoning and retry
- Domain-specific reasoning patterns (safety-critical electrical engineering)

### Missing Implementation

| Missing                             | File                              | Effort |
| ----------------------------------- | --------------------------------- | ------ |
| CoT prompt templates                | New `prompts/cot-templates.json`  | 4h     |
| Structured reasoning engine         | New `core/reasoning_engine.py`    | 8h     |
| Multi-method verification           | New `core/verification_engine.py` | 6h     |
| Reasoning trace in execution result | `execution.types.ts` + pipeline   | 3h     |
| Self-correction loop                | `reasoning_engine.py`             | 6h     |
| Step-level confidence               | `reasoning_engine.py`             | 3h     |

### Required Libraries

- None beyond existing

### Estimated Effort: **30h**

### Dependencies

- Gap 1 (LLM Integration) — need real LLM for CoT
- Gap 7 (Tool Execution) — verification may call CalculationTool

### Priority: **P2**

---

## 11. Agent Orchestration

### Current State

- **Python Agent Framework:** `BaseAgent` ABC with `process()`, `stream()` abstract methods — good foundation
- **Agent Registry:** Singleton pattern with `register()`/`get()` — solid
- **ElectricalEngineerAgent:** Hardcoded if/else — never calls LLM, never uses tools
- **DocumentAnalystAgent:** Closest to production — calls LLM for summaries, but has duplicate method bug
- 5 of 7 planned agents missing (Solar Consultant, Protection Engineer, Power Quality, Research, Drawing Analysis)
- No multi-agent orchestration/coordination
- No agent planning: agent reacts to single message, no task decomposition
- No agent lifecycle management: init → run → cleanup → shutdown hooks
- No permission checking in agent registry — `REQUIRED_PERMISSION` defined but never enforced
- Python API endpoints create fresh `AgentRegistry` instead of using `app.state` — empty registry on every request (`main.py:156-158`)

### Target State

- Agent with tool selection, planning, and execution loop
- Task decomposition: break complex queries into sub-tasks
- Multi-agent orchestration: supervisor agent delegates to specialist agents
- Agent lifecycle: initialization, execution, cleanup, health check
- Full 7-agent roster: Electrical Engineer, Solar Consultant, Protection Engineer, Power Quality, Research, Drawing Analysis, Document Analyst
- Permission-based agent access
- Agent execution metrics: success rate, response time, tool usage
- Dynamic agent loading (load/unload without restart)

### Missing Implementation

| Missing                              | File                          | Effort |
| ------------------------------------ | ----------------------------- | ------ |
| Planning loop in agent               | New `core/planning_engine.py` | 8h     |
| Multi-agent orchestrator             | New `core/orchestrator.py`    | 12h    |
| 5 missing agents                     | New `agents/*/agent.py`       | 40h    |
| Agent permission enforcement         | `core/agent_registry.py`      | 3h     |
| Agent lifecycle hooks                | `core/base_agent.py`          | 4h     |
| Agent execution metrics              | New `core/agent_metrics.py`   | 3h     |
| Fix AgentRegistry fresh-creation bug | `main.py:156-158`             | 0.5h   |
| Dynamic agent loading                | `core/agent_registry.py`      | 4h     |

### Required Libraries

- None beyond existing

### Estimated Effort: **74.5h**

### Dependencies

- Gap 1 (LLM Integration) — agents must call LLM
- Gap 7 (Tool Execution) — agents must use tools
- Gap 10 (Reasoning) — planning requires reasoning

### Priority: **P2**

---

## 12. Knowledge Synchronization

### Current State

- **NestJS Knowledge Module:** Full CRUD with versioning, taxonomy, workflow, analytics — 14 files, 3,487 LOC
- **Python RAG Pipeline:** Chunker, embedding pipeline, Qdrant store, retriever — all exist but disconnected
- **No bridge:** When knowledge article is created/updated/deleted in NestJS, there is no mechanism to trigger re-embedding or Qdrant update in Python
- Knowledge CRUD events are not published to any message queue
- AI service has no webhook or polling mechanism to detect knowledge changes
- No consistency guarantee between PostgreSQL knowledge data and Qdrant vector index

### Target State

- Automated sync on knowledge CRUD → re-embed → update Qdrant
- Event-driven architecture: knowledge mutations publish events → AI service consumes → updates vector store
- RabbitMQ integration for reliable async communication
- Batch re-indexing on startup for full sync
- Incremental sync for individual article changes
- Sync status tracking per knowledge article (synced/pending/failed)
- Admin UI for sync management and error recovery
- Rollback capability on sync failure

### Missing Implementation

| Missing                               | File                                        | Effort |
| ------------------------------------- | ------------------------------------------- | ------ |
| Knowledge CRUD event publisher        | New `knowledge-event-publisher.service.ts`  | 4h     |
| RabbitMQ event consumer in AI service | New `consumers/knowledge-consumer.py`       | 4h     |
| Sync service in AI service            | New `services/knowledge-sync.service.py`    | 6h     |
| Batch re-indexing script              | New `scripts/reindex-all.py`                | 3h     |
| Sync status tracking                  | New `knowledge_sync_status` model in Prisma | 3h     |
| Admin sync management UI              | New admin endpoints                         | 4h     |
| Webhook-based sync as fallback        | New `knowledge-webhook.service.ts`          | 3h     |

### Required Libraries

- `pika` or `aio-pika` for RabbitMQ — if not already in requirements.txt

### Estimated Effort: **27h**

### Dependencies

- Gap 2 (Embedding Pipeline) — need real embeddings
- Gap 3 (Vector Search) — need Qdrant properly configured
- RabbitMQ must be operational (already in docker-compose)

### Priority: **P2**

---

## Summary

| #   | Subsystem             | Current State                            | Target State                                 | Effort (h) | Priority | Dependencies  |
| --- | --------------------- | ---------------------------------------- | -------------------------------------------- | :--------: | :------: | ------------- |
| 1   | LLM Integration       | Mock/hardcoded responses, fake streaming | Real multi-provider LLM with fallback        |     32     |  **P0**  | Embedding fix |
| 2   | Embedding Pipeline    | Identical random vectors from same seed  | Content-hash fallback, real API embeddings   |    12.5    |  **P0**  | None          |
| 3   | Vector Search         | Fake embeddings, no re-ranking           | Hybrid search with cross-encoder re-ranking  |    22.5    |  **P1**  | Gap 2         |
| 4   | Citation Verification | Missing entirely                         | Claim-to-source mapping, standard references |     26     |  **P1**  | Gap 1, 3      |
| 5   | Evidence Chain        | Missing entirely                         | Full provenance: source → chunk → response   |     28     |  **P1**  | Gap 4, 3      |
| 6   | Prompt Execution      | Pipeline echoes input                    | Real prompt → LLM → response pipeline        |     29     |  **P1**  | Gap 1         |
| 7   | Tool Execution        | Python tools are dead code               | LLM function-calling, tool registry          |     22     |  **P1**  | Gap 1         |
| 8   | Streaming             | Fake word-by-word simulation             | Real SSE token streaming from provider       |     18     |  **P0**  | Gap 1         |
| 9   | Memory                | In-memory, no persistence                | DB-backed, summarization, consolidation      |     33     |  **P1**  | Gap 1         |
| 10  | Reasoning             | No CoT, no multi-step                    | Structured reasoning with verification       |     30     |  **P2**  | Gap 1, 7      |
| 11  | Agent Orchestration   | Hardcoded responses, 5 missing agents    | Planning, multi-agent, full roster           |    74.5    |  **P2**  | Gap 1, 7, 10  |
| 12  | Knowledge Sync        | No bridge between Knowledge + RAG        | Event-driven sync on CRUD → re-embed         |     27     |  **P2**  | Gap 2, 3      |

**Total Estimated Effort: 354.5 hours**

### Priority Breakdown

| Priority | Count | Total Hours | Timeline                                    |
| -------- | :---: | :---------: | ------------------------------------------- |
| **P0**   |   4   |    62.5     | Weeks 1-2 (Phase 0)                         |
| **P1**   |   6   |    160.5    | Weeks 3-5 (Phase 1) + Weeks 15-17 (Phase 5) |
| **P2**   |   2   |    130.5    | Weeks 15-17 (Phase 5)                       |

### Effort Distribution

- NestJS (apps/api): ~120h
- Python AI Service (ai-service): ~180h
- Cross-platform (RabbitMQ/Infra): ~54.5h

### Key Dependencies Chain

```
Gap 2 (Embeddings) ──► Gap 3 (Vector Search) ──► Gap 4 (Citation) ──► Gap 5 (Evidence Chain)
       │
       ▼
Gap 1 (LLM) ──► Gap 6 (Prompt Exec) ──► Gap 7 (Tool Exec) ──► Gap 10 (Reasoning) ──► Gap 11 (Orchestration)
       │              │
       ▼              ▼
Gap 8 (Streaming)  Gap 9 (Memory)
```
