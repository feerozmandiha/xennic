# AI Code Audit Report

**Generated:** 2026-07-02  
**Scope:** `apps/api/src/modules/ai/`, `apps/api/src/modules/ai-runtime/`, `workspace/services/ai-service/`  
**Total files audited:** 62  

---

## Table of Contents
1. [RAG Pipeline](#1-rag-pipeline)
2. [Agent Architecture](#2-agent-architecture)
3. [Memory Management](#3-memory-management)
4. [Prompt Builder / Template Engine](#4-prompt-builder--template-engine)
5. [Citation Engine](#5-citation-engine)
6. [Evidence Chain & Provenance](#6-evidence-chain--provenance)
7. [Confidence Engine](#7-confidence-engine)
8. [Tool Execution](#8-tool-execution)
9. [Hallucination Prevention](#9-hallucination-prevention)
10. [Conflict Resolution](#10-conflict-resolution)
11. [Engineering Guardrails](#11-engineering-guardrails)
12. [Critical Issues Summary](#12-critical-issues-summary)
13. [Recommendations](#13-recommendations)

---

## 1. RAG Pipeline

### 1.1 Chunking Strategy

**File:** `workspace/services/ai-service/app/rag/chunker.py`

**Status:** ✅ BASIC — word-based with paragraph awareness

| Aspect | Detail |
|--------|--------|
| Default chunk size | 500 words |
| Default overlap | 50 words (10%) |
| Paragraph respect | ✅ Enabled by default |
| Section-based | ❌ Not implemented |
| Semantic chunking | ❌ Not implemented |
| Character vs word | Word-based (variable token counts) |

**Issues:**
- **No token-aware chunking** (`chunker.py:60`): Uses fixed word count (500), not LLM token limits. For models with 128K context, 500-word chunks are too small; for 8K models they may exceed limits.
- **No hierarchical chunking** (`chunker.py:54-58`): Only two strategies (paragraph or word) — no section-header detection, no table/embedded-object preservation.
- **Overlap is purely word-based** (`chunker.py:64`): `chunk_size - chunk_overlap` stride means last chunks may be tiny.
- **No code/equation awareness** (`chunker.py:50`): Engineering documents have formulas and code blocks that should not be split.

### 1.2 Retrieval Approach

**File:** `workspace/services/ai-service/app/rag/retriever.py`

**Status:** ✅ FUNCTIONAL with basic vector search

| Feature | Status |
|---------|--------|
| Vector similarity search | ✅ Cosine |
| Workspace filtering | ✅ Always applied |
| Multi-collection search | ✅ Implemented |
| Score threshold | ✅ Configurable (default 0.7) |
| Context building | ✅ `retrieve_with_context()` |
| Hybrid search (dense + sparse) | ❌ Not implemented |
| Re-ranking | ❌ Not implemented |

**Issues:**
- **No hybrid search** (`retriever.py:68`): Pure vector search only — no BM25/sparse or reciprocal rank fusion. Engineering standards often need keyword matching for standard numbers ("IEC 60364").
- **No re-ranking** (`retriever.py:156`): Results are sorted by initial similarity score only; no cross-encoder re-ranking.
- **Cache has no TTL** (`retriever.py:61-62`): `_cache` grows unbounded until `clear_cache()` is called. No max-size or expiry.
- **Score threshold defaults too high** (`retriever.py:40`): 0.7 is aggressive for cosine similarity; may miss relevant documents, especially with dummy embeddings.

### 1.3 Embedding Pipeline

**File:** `workspace/services/ai-service/app/rag/embedding_pipeline.py`

**Status:** ⚠️ FUNCTIONAL with critical fallback concern

| Aspect | Detail |
|--------|--------|
| Model | `text-embedding-3-small` (1536 dims) |
| Batch size | 100 |
| Rate-limit delay | 0.1s |
| API key check | ✅ |
| Fallback | Deterministic random (seeded) |

**Critical Issues:**
- **Fallback mode is silent** (`embedding_pipeline.py:69`): Uses `print()` instead of logging. Falls back to **random embeddings** that carry no semantic meaning — making all RAG retrieval meaningless without an API key.
- **Seed-based determinism is broken** (`embedding_pipeline.py:46`): `hash(str(dimension)) % 2**32` produces the same seed every call, meaning **all documents get the same "random" embedding**. Cosine similarity between identical random vectors = 1.0.
- **No embedding dimension validation** (`embedding_pipeline.py:78`): If the API model changes dimensions, the Qdrant collection (created with 1536) will reject vectors silently.
- **Single model hardcoded** (`embedding_pipeline.py:74`): Only `text-embedding-3-small`. No multi-model or domain-specific embedding support.

### 1.4 Vector Store

**Files:** `vector_store.py`, `qdrant_store.py`, `file_store.py`

**Status:** ✅ GOOD architecture with auto-fallback

| Aspect | Status |
|--------|--------|
| Qdrant integration | ✅ Async client |
| File fallback | ✅ JSON-based |
| Collection isolation | ✅ `{workspace_id}_{collection}` |
| Multi-tenancy | ✅ By workspace |

**Issues:**
- **File fallback uses truncated embeddings** (`file_store.py:53`): Only stores first 10 dimensions of the 1536-dim vector. Cosine similarity on 10-D is not representative.
- **No collection cleanup on workspace delete** (`vector_store.py:86`): Qdrant deletion works, but if Qdrant was never initialized, the file store fallback is used.
- **No connection pooling health check in file mode** (`vector_store.py:106-109`): `health_check()` only tests file-system write.
- **No index configuration in Qdrant** (`qdrant_store.py:73-76`): Creates collection with default HNSW. No payload indexing for faster workspace_id filtering.

### 1.5 Document Processing Pipeline

**Files:** `document_parser.py`, `document_analyst/agent.py`, `api/routers/documents.py`

**Status:** ✅ FUNCTIONAL with some gaps

| Feature | Status |
|---------|--------|
| PDF parsing | ✅ PyMuPDF |
| DOCX parsing | ✅ python-docx |
| Image OCR | ✅ Tesseract (eng+fas) |
| Table extraction | ✅ Basic |
| Summary generation | ✅ Via LLM or fallback |
| RAG auto-indexing | ✅ Automatic after analysis |

**Issues:**
- **`analyze_document` method duplicated** (`document_analyst/agent.py:77-172` and `:282-398`): The method is defined **twice** in the same class. The second definition **overrides** the first at runtime. The `stream()` method calls `self.process()` → `self.analyze_document()` (second version), which has minor differences in error handling.
- **No document deduplication**: Same file can be indexed multiple times; no checksum/hash-based dedup.
- **OCR only first attempt for Persian** (`document_parser.py:242`): If `eng+fas` fails, falls back to `eng` only — Persian text is lost silently.
- **No large-document streaming**: Full file is loaded into memory before processing (50MB limit).

---

## 2. Agent Architecture

### 2.1 Base Agent Framework

**File:** `workspace/services/ai-service/app/core/base_agent.py`

**Status:** ⚠️ PARTIAL — good foundation, no real LLM integration

| Aspect | Status |
|--------|--------|
| Abstract base class | ✅ `BaseAgent` ABC |
| System prompt | ✅ `get_system_prompt()` |
| Processing | ✅ `process()` abstract |
| Streaming | ✅ `stream()` abstract |
| Conversation management | ✅ In-memory dict |
| Message history building | ✅ Last 10 messages |
| Model routing | ✅ `ModelRouter` integration |
| **Actual LLM call** | ❌ NOT IMPLEMENTED |

**Critical Issues:**
- **No LLM calls from base agent** (`base_agent.py`): The `process()` and `stream()` methods are abstract — but no concrete implementation in base actually calls an LLM. The `_build_messages()` method builds messages that are **never sent** to any model.
- **Conversations are in-memory only** (`base_agent.py:67`): `self._conversations` is a plain dict — all conversations are lost on restart. No persistence.
- **Conversation management is per-instance** (`base_agent.py:108-133`): Each agent instance has its own conversation store. With `AgentRegistry` as singleton, this means conversations are per-agent-class, not per-user-session.

### 2.2 Electrical Engineer Agent

**File:** `workspace/services/ai-service/app/agents/electrical_engineer/agent.py`

**Status:** ⚠️ FALLBACK-ONLY — no LLM integration

| Aspect | Status |
|--------|--------|
| Agent ID | `electrical_engineer` |
| System prompt | ✅ Engineering-focused |
| Tool calling | ❌ Referenced but not used |
| LLM response generation | ❌ N/A — all responses are hardcoded |

**Critical Issues:**
- **No LLM is ever called** (`agent.py:44-139`): `_generate_response()` uses **hardcoded if/else rules** and regex pattern matching, not an LLM. The agent has never sent a single token to GPT/Claude/Groq.
- **System prompt is misleading** (`agent.py:28-42`): The prompt says "ALWAYS use the CalculationTool" but **no tool calling is implemented**. The agent just returns template strings.
- **`CalculationTool` is imported in `tools.py` but never used by the agent** (`agent.py:8-9`, `tools.py:18`): `tools.py` defines PydanticAI-compatible tool functions, but the agent never invokes them.
- **Streaming is fake** (`agent.py:163-171`): Splits pre-generated text into 50-char chunks with 30ms delay — not actual LLM token streaming.
- **Metadata claims "fallback" incorrectly** (`agent.py:154`): `model_used: "fallback"` suggests graceful degradation, but the agent is **always** in fallback mode. There is no primary mode.

### 2.3 Document Analyst Agent

**File:** `workspace/services/ai-service/app/agents/document_analyst/agent.py`

**Status:** ✅ MOSTLY FUNCTIONAL — nearest to production-ready

| Aspect | Status |
|--------|--------|
| Document parsing | ✅ Full pipeline |
| Embedding + indexing | ✅ Automatic |
| Summary generation | ✅ Via LLM (when key available) |
| Fallback behavior | ✅ Graceful truncation |

**Issues:**
- **Duplicated method** (`agent.py:77` and `agent.py:282`): `analyze_document()` is defined twice. The second overrides the first. The first version has slightly different error handling (missing `indexed`, `chunks_created` fields in error return).
- **Summary generation is hardcoded to OpenAI/Anthropic format** (`agent.py:199-214`): Uses `provider_client.chat.completions.create()` (OpenAI SDK) when model starts with "gpt", `provider_client.messages.create()` (Anthropic SDK) when starts with "claude", but for any other model, silently falls back. No generic OpenAI-compatible fallback.
- **Key findings extraction is simplistic** (`agent.py:222-236`): Uses regex keyword matching on first 20 sentences. Misses domain-specific engineering findings entirely.

### 2.4 Model Router

**File:** `workspace/services/ai-service/app/core/model_router.py`

**Status:** ⚠️ DEFINED — but not connected to actual agent processing

| Aspect | Status |
|--------|--------|
| Task routing | ✅ By type + complexity |
| Cost optimization | ✅ `prefer_cost` flag |
| Capability check | ✅ Basic |
| **Actual routing usage** | ❌ NEVER USED by agents |

**Issues:**
- **Model routing is academic** (`model_router.py`): The `route()` method is called from `DocumentAnalystAgent._generate_summary()` and `BaseAgent._determine_complexity()`/`_determine_task_type()`, but the Electrical Engineer Agent ignores routing entirely.
- **No provider API key validation at startup** (`model_router.py:115`): `initialize_providers()` may return empty dict if no keys configured, but router still returns model names as if providers exist.
- **Anthropic/Google models may not be reachable**: `get_provider_client()` (`model_router.py:176-184`) uses hardcoded SDK detection. If the import or client init fails, returns `None` with no fallback.

### 2.5 Agent Registry

**File:** `workspace/services/ai-service/app/core/agent_registry.py`

**Status:** ✅ SOLID singleton pattern

**Issues:**
- **No agent instance lifecycle** (`agent_registry.py:32`): `register()` stores the instance directly. No initialization hook, no cleanup on shutdown.
- **No permission checking** (`agent_registry.py:37-40`): `REQUIRED_PERMISSION` is defined per agent but never checked in registry or API endpoints.

### 2.6 NestJS AI-Runtime Agent Execution

**Files:** `execution-pipeline.service.ts`, `agent-session-manager.service.ts`, `agent-state-manager.service.ts`

**Status:** ✅ WELL-STRUCTURED but incomplete integration

| Aspect | Status |
|--------|--------|
| Pipeline stages | ✅ Defined |
| Middleware support | ✅ `before`/`after` hooks |
| Session management | ✅ TTL, status transitions |
| State machine | ✅ Validated transitions |
| **LLM integration** | ❌ Mock — pipeline never calls external LLM |

**Issues:**
- **Execution pipeline LLM call is a passthrough mock** (`execution-pipeline.service.ts:71-73`): The `llmCall` callback receives messages and the pipeline returns `last.content` — it simply echoes the last user message back. No actual LLM is invoked.
- **Tool list is empty** (`execution-pipeline.service.ts:42`): `getAvailableTools()` returns whatever is registered, but `toolRegistry` is never populated in the pipeline flow.
- **Controller uses `req.workspaceId` instead of `req.workspaceId`** (`ai-runtime.controller.ts:54`): `req.workspaceId` is undefined (NestJS guard populates `req.workspaceId`), so sessions are created with `workspaceId = undefined`.
- **No database-backed stores**: `InMemorySessionStore`, `InMemoryMemoryStore`, `InMemoryPromptTemplateStore` — all state is lost on restart.

---

## 3. Memory Management

### 3.1 NestJS MemoryAbstractionService

**File:** `apps/api/src/modules/ai-runtime/application/services/memory-abstraction.service.ts`

**Status:** ⚠️ DEFINED but in-memory only

| Aspect | Status |
|--------|--------|
| Memory types | `message`, `summary`, `fact`, `preference` |
| CRUD operations | ✅ `remember`, `recall`, `forget`, `clearSession` |
| Summary store/retrieve | ✅ `getConversationSummary`, `storeConversationSummary` |
| Scoring | ✅ Entries have score |
| Query filtering | ✅ By session, type, minScore |
| **Database backing** | ❌ In-memory only |

**Issues:**
- **No conversation summarization logic** (`memory-abstraction.service.ts:46-60`): `storeConversationSummary` stores whatever string is passed — no automatic compression or summarization.
- **No memory consolidation** (`memory-abstraction.service.ts`): Short-term memories (messages) are never consolidated into long-term memories (facts/preferences). No mechanism to extract facts from conversation history.
- **No decay or importance scoring** (`memory.types.ts:11`): Score defaults to 1.0 and is never adjusted. No temporal decay.
- **InMemoryMemoryStore has no size limit** (`in-memory-memory.store.ts:7`): Array grows unbounded.

### 3.2 Python Agent Memory

**Files:** `base_agent.py`, `electrical_engineer/agent.py`

**Status:** ❌ MINIMAL — per-instance dict only

| Aspect | Status |
|--------|--------|
| Conversation storage | ✅ In-memory dict per agent |
| History window | ✅ Last 10 messages |
| Long-term memory | ❌ Not implemented |
| Fact extraction | ❌ Not implemented |
| Cross-session memory | ❌ Not implemented |

**Issues:**
- **No persistent memory at all** (`base_agent.py:67`): Agent conversations are ephemeral — lost on restart or garbage collection.
- **No short-term vs long-term distinction** (`base_agent.py:37-191`): All messages are treated equally. No summarization, no importance scoring.

---

## 4. Prompt Builder / Template Engine

### 4.1 NestJS PromptRegistryService

**File:** `apps/api/src/modules/ai-runtime/application/services/prompt-registry.service.ts`

**Status:** ✅ WELL-DESIGNED

| Aspect | Status |
|--------|--------|
| CRUD for templates | ✅ `register`, `get`, `getAll`, `remove` |
| Template model | ✅ Sections + variables |
| Tag filtering | ✅ |
| Version tracking | ✅ `version` field (`1.0.0` auto) |

**Issues:**
- **No template version resolution** (`prompt.types.ts:41`): Version is hardcoded to `1.0.0`. No migration, no version pinning.
- **No template composition** (`prompt-registry.service.ts`): Templates cannot reference/include other templates.
- **In-memory store only** (`in-memory-prompt-template.store.ts`): Templates are lost on restart.

### 4.2 PromptTemplateEngineService

**File:** `apps/api/src/modules/ai-runtime/application/services/prompt-template-engine.service.ts`

**Status:** ✅ FUNCTIONAL with validation

| Aspect | Status |
|--------|--------|
| Variable interpolation | ✅ `{{variable}}` syntax |
| Required variable validation | ✅ Throws `PromptRenderingException` |
| Default values | ✅ Via `defaultValue` |
| Raw string rendering | ✅ `renderFromString()` |

**Issues:**
- **No conditional sections** (`prompt-template-engine.service.ts:7-34`): Cannot include/exclude sections based on variables (e.g., include RAG context only if available).
- **No loop/iteration support**: Cannot iterate over lists (tool results, document chunks).
- **No partial escaping**: `{{` in user content cannot be escaped.

### 4.3 Python System Prompts

**File:** `apps/api/src/modules/ai/infrastructure/providers/llm.provider.ts`

**Status:** ✅ Good engineering system prompt

The `SYSTEM_PROMPT` (`llm.provider.ts:63-80`) covers:
- Power systems core domains
- Specific standard references (IEC, IEEE, NEC)
- Bilingual support (Persian/English)
- Module references (BASIC-001, CABLE-001, etc.)

**Issues:**
- **No dynamic context injection**: The system prompt is a static string. No RAG context, workspace info, or user role is injected.
- **Module codes are hardcoded** (`llm.provider.ts:80`): References Xennic modules (BASIC-001, CABLE-001) but these are never resolved or linked to actual functionality.

---

## 5. Citation Engine

**Status:** ❌ NOT IMPLEMENTED

There is **no citation engine** in any part of the codebase:

| Expected Capability | Status |
|---------------------|--------|
| Source tracking in responses | ❌ |
| Reference formatting (IEC, IEEE) | ❌ |
| Document/page citations | ❌ |
| Standard paragraph/section references | ❌ |
| Link generation to source documents | ❌ |

The `Source` model exists in `outputs.py`:
```python
class Source(BaseModel):
    type: str  # "standard", "document", "calculation"
    reference: str
    section: Optional[str] = None
```

But it is **never populated**. The Electrical Engineer agent returns `"sources": []` (`agent.py:152`). There is no code that extracts source references from LLM responses.

---

## 6. Evidence Chain & Provenance

**Status:** ❌ NOT IMPLEMENTED

| Capability | Status |
|------------|--------|
| AI claim → source document tracking | ❌ |
| Provenance metadata on responses | ❌ |
| Traceability through pipeline stages | ✅ Partial (in `ExecutionResult.stages`) |
| Audit log of which documents informed which response | ❌ |
| Claim verification against source | ❌ |

The `execution.types.ts` tracks pipeline stages but **does not track which documents were retrieved or which tools were invoked** to produce a response. The `ExecutionContext` has no `retrievedDocuments` or `usedSources` fields.

---

## 7. Confidence Engine

**Status:** ⚠️ PARTIAL — for validation only

### 7.1 Calculation Validation Confidence

**File:** `apps/api/src/modules/ai/application/services/ai.service.ts:156-229`

The `validateCalculation()` method returns a `confidence` field (`'high' | 'medium' | 'low'`) in the validation response.

**Issues:**
- **Confidence is LLM-reported** (`ai.service.ts:190`): The AI model tells us how confident it is. There is no independent confidence scoring (e.g., logprob analysis, consistency check, source grounding verification).
- **No confidence for general chat responses** (`ai.service.ts:75-152`): The `sendMessage()` method returns tokens but no confidence score.
- **Fallback when JSON parsing fails** (`ai.service.ts:218-228`): Sets `confidence: 'low'` and returns raw content — no structured validation at all.

### 7.2 No RAG Confidence Scoring

There is no confidence scoring on RAG-retrieved documents. The score is raw cosine similarity, not calibrated as a confidence metric.

---

## 8. Tool Execution

### 8.1 NestJS Tool System

**Files:** `tool-registry.service.ts`, `tool-dispatcher.service.ts`, `tool-input.validator.ts`

**Status:** ✅ WELL-DESIGNED with validation

| Aspect | Status |
|--------|--------|
| Tool registration | ✅ With parameters |
| Handler dispatch | ✅ Async handlers |
| Input validation | ✅ Type checking via `ToolInputValidator` |
| Error handling | ✅ Structured `ToolResult` with error |
| Status tracking | ✅ `available` / `disabled` |
| Batch dispatch | ✅ `dispatchBatch()` |

**Issues:**
- **No tool discovery endpoint returns handlers** (`tool-registry.service.ts`): `getAll()` returns definitions but not registered handlers.
- **Validator is shallow** (`tool-input.validator.ts:25-40`): Only checks JS primitive types. No min/max, enum validation, or nested object validation.
- **No rate limiting per tool** (`tool-dispatcher.service.ts`): All tools dispatched at same priority.
- **No tool timeout** (`tool-registry.service.ts:60-81`): `handler()` is awaited without timeout. A slow handler blocks the pipeline.

### 8.2 Python Tool Implementations

**Files:** `electrical_engineer/tools.py`, `calculation_tool.py`

**Status:** ⚠️ DEFINED — but never invoked by agents

| Aspect | Status |
|--------|--------|
| Ohm's Law tool | ✅ `calculate_ohms_law` |
| Power calculations | ✅ Active, Apparent, Reactive, PF |
| Cable sizing | ✅ Sizing, voltage drop, short-circuit |
| Transformer | ✅ Sizing, losses |
| Engineering service bridge | ✅ `CalculationTool` HTTP client |

**Issues:**
- **Tools are dead code** (`tools.py:25-276`): All 10+ tool functions are defined with full PydanticAI `RunContext` annotations but are **never registered or called** by any agent. The `ElectricalEngineerAgent.process()` uses hardcoded if/else, not tool calling.
- **`CalculationTool` has no error mapping** (`calculation_tool.py:67-68`): `response.raise_for_status()` — if engineering service returns 4xx/5xx, the raw exception propagates up.
- **No circuit breaker**: Failing engineering service calls cause cascading failures.
- **Endpoint mapping is hardcoded** (`calculation_tool.py:81-101`): Not configurable; code changes needed to add new calculation endpoints.

---

## 9. Hallucination Prevention

### 9.1 Current State

**Status:** ❌ MINIMAL — no structured guardrails

| Guardrail | Status |
|-----------|--------|
| Source grounding | ❌ Not enforced |
| Fact-checking against knowledge base | ❌ |
| Response validation against sources | ❌ |
| "I don't know" fallback | ❌ |
| Confidence threshold for retrieval | ✅ Partial (score_threshold) |
| Admit uncertainty | ❌ |

### 9.2 Specific Issues

1. **No grounding check in AiService.sendMessage()** (`ai.service.ts:75-152`): The method sends user message + last 20 messages to LLM with system prompt. No RAG context is injected, no source verification.

2. **Electrical Engineer Agent makes up values** (`electrical_engineer/agent.py:53-60`): The hardcoded cable sizing logic (`if current <= 100 → 35mm²`) is an oversimplification that ignores temperature, grouping, installation method — yet presents results with false precision ("Safety Margin: ~20%").

3. **No unanswerable detection** (`agent.py:123-139`): The default response always says "I can help with..." — never admits inability.

4. **Mock responses in LlmProvider** (`llm.provider.ts:181-204`): When API key is missing, returns `_smartMock()` which gives plausible-sounding but potentially incorrect engineering advice (hardcoded THD limits, cable sizes).

### 9.3 Validation Patterns

The `validateCalculation()` method (`ai.service.ts:156-229`) and `_parseValidationResponse()` (`ai.service.ts:205-229`) attempt to structure LLM validation output, but:

- **No consistency check**: The AI is asked to validate a calculation it may have computed incorrectly. No second-opinion or cross-check.
- **No boundary checking**: No verification that the AI's recommended standards actually apply to the given scenario.

---

## 10. Conflict Resolution

**Status:** ❌ NOT IMPLEMENTED

| Capability | Status |
|------------|--------|
| Conflicting source resolution | ❌ |
| Version comparison for standards | ❌ |
| Temporal recency weighting | ❌ |
| Authority/credibility scoring | ❌ |
| Multi-document consensus | ❌ |

There is no code anywhere that handles conflicting sources. The `VectorStore.search()` returns results sorted by similarity — if two documents give conflicting values, there is no mechanism to detect or resolve the conflict.

---

## 11. Engineering Guardrails

### 11.1 Calculation Validation

**File:** `apps/api/src/modules/ai/application/services/ai.service.ts:156-229`

**Status:** ⚠️ BASIC — single-pass LLM validation

| Safety Check | Status |
|--------------|--------|
| Calculation verification | ✅ Via LLM |
| Standards citation | ✅ Requested in prompt |
| Warnings | ✅ Requested |
| Recommendations | ✅ Requested |
| **Independent computation** | ❌ LLM validates without recomputing |
| **Range/sanity checks** | ❌ |
| **Unit consistency checks** | ❌ |
| **Multi-method verification** | ❌ |

### 11.2 Engineer Agent Safety

**File:** `electrical_engineer/agent.py`

| Safety Feature | Status |
|----------------|--------|
| "NEVER calculate yourself" rule | ✅ In system prompt |
| Use CalculationTool | ✅ In system prompt but NOT implemented |
| Standard references | ✅ |
| Responsibility disclaimer | ✅ "Final engineering decisions are your responsibility" |
| **Tool enforcement** | ❌ No mechanism prevents agent from hardcoding calculations |

### 11.3 Agent-Specific Issues

- **No domain boundary enforcement** (`electrical_engineer/agent.py:28-42`): System prompt defines electrical engineering scope, but no code prevents the agent from answering non-engineering questions.
- **No safety-critical output filtering**: No code reviews outputs for dangerous recommendations (e.g., undersized cables, incorrect protection settings).
- **No calculation input validation** (`ai.service.ts:156-170`): User supplies `inputs` as `Record<string, any>` — no schema validation before sending to LLM.

---

## 12. Critical Issues Summary

| # | Severity | Component | Issue | File:Line |
|---|----------|-----------|-------|-----------|
| C1 | 🔴 CRITICAL | Python Agents | **No LLM is ever called** — Electrical Engineer Agent uses hardcoded responses, not AI | `agent.py:44-139` |
| C2 | 🔴 CRITICAL | NestJS Pipeline | **LLM call is a mock echo** — execution pipeline returns last message unchanged | `execution-pipeline.service.ts:71-73` |
| C3 | 🔴 CRITICAL | RAG Embeddings | **Dummy embeddings with same seed** — all documents get identical random vectors; retrieval is meaningless | `embedding_pipeline.py:46` |
| C4 | 🔴 CRITICAL | NestJS Controller | **`req.workspaceId` is undefined** — sessions created with invalid workspace | `ai-runtime.controller.ts:54` |
| C5 | 🔴 CRITICAL | Duplicated Code | **`analyze_document()` defined twice** — second definition silently overrides first | `agent.py:77,282` |
| C6 | 🟠 HIGH | Python Tools | **All 10+ tool functions are dead code** — never registered or invoked by any agent | `tools.py:25-276` |
| C7 | 🟠 HIGH | Hallucination | **No source grounding in chat responses** — LLM responds without RAG context | `ai.service.ts:75-152` |
| C8 | 🟠 HIGH | Memory | **All memory is in-memory** — Python agents and NestJS runtime lose state on restart | Multiple files |
| C9 | 🟠 HIGH | Streaming | **Python streaming is fake** — word-splitting of pre-generated text, not LLM streaming | `agent.py:163-171` |
| C10 | 🟠 HIGH | Engineering Safety | **Mock mode gives plausible but incorrect engineering advice** | `llm.provider.ts:181-204` |

---

## 13. Recommendations

### Immediate (P0)

1. **Connect Python agents to actual LLMs**: Replace `_generate_response()` hardcoded if/else in `electrical_engineer/agent.py` with actual LLM calls via `ModelRouter`. Use OpenAI-compatible API call (works with Groq, Together, Ollama).

2. **Fix embedding fallback**: In `embedding_pipeline.py:46`, replace `hash(str(dimension))` with content-based hash (e.g., `hashlib.sha256(text.encode()).hexdigest()`) so each document gets a unique deterministic embedding in fallback mode.

3. **Fix NestJS controller session bug**: In `ai-runtime.controller.ts:54`, change `req.workspaceId` to use the correct property injected by `WorkspaceGuard`.

4. **Remove duplicate `analyze_document()` method**: Keep the second version (which has better error handling) and remove the first at lines 77-172.

### Short-term (P1)

5. **Implement tool calling in Electrical Engineer Agent**: Connect `tools.py` functions to an actual LLM tool-calling loop. At minimum use OpenAI function calling or ReAct pattern.

6. **Add RAG context to chat responses**: In `ai.service.ts:92-97`, inject retrieved documents from `RAGRetriever` into the context before sending to LLM.

7. **Implement hybrid search**: Add BM25/sparse retrieval and reciprocal rank fusion to `retriever.py:68`.

8. **Add cross-encoder re-ranking**: After initial vector search, re-rank top 20 results with a cross-encoder model.

9. **Implement database-backed stores**: Replace `InMemorySessionStore`, `InMemoryMemoryStore`, `InMemoryPromptTemplateStore` with Prisma-backed implementations.

### Medium-term (P2)

10. **Build Citation Engine**: Implement source tracking in responses — track which document chunks/standards informed each claim.

11. **Build Evidence Chain**: Add `retrievedDocuments` and `usedSources` fields to `ExecutionContext` and `ExecutionResult` for provenance.

12. **Build Confidence Engine**: Move beyond LLM self-reported confidence — use logprob analysis, consistency checks, and source-grounded verification.

13. **Build Conflict Resolution**: Detect when retrieved documents give conflicting values; implement temporal and authority-based resolution.

14. **Add hallucination guardrails**: Implement response grounding check (claim → source document verification), unanswerable detection, and uncertainty communication.

15. **Add proper token-aware chunking**: Replace word-count chunking in `chunker.py` with token-count-based chunking.

16. **Add document deduplication**: Use content hashing before indexing in RAG pipeline.

17. **Build automatic conversation summarization**: Implement memory consolidation that extracts facts and preferences from conversation history.

### Architecture (P3)

18. **Unify agent execution**: The NestJS `ExecutionPipelineService` and Python `BaseAgent.process()` should share a common interface. Consider routing AI-Runtime execution requests to the Python AI Service via HTTP.

19. **Add tool timeout and circuit breakers**: In `tool-registry.service.ts`, add timeout wrapping around handler calls. Add circuit breaker pattern for external service calls.

20. **Add permission checking**: Enforce `REQUIRED_PERMISSION` at the registry and API endpoint level.

21. **Add proper integration tests**: Currently no tests verify that AI agents actually call LLMs or tools correctly.

---

## File Index

| File | Lines | Purpose |
|------|-------|---------|
| `apps/api/src/modules/ai/` | | |
| `ai.module.ts` | 21 | Module wiring |
| `application/services/ai.service.ts` | 236 | Core AI: chat, validate, usage |
| `infrastructure/providers/llm.provider.ts` | 205 | OpenAI-compatible LLM calls |
| `infrastructure/repositories/ai.repository.ts` | 184 | Prisma DB access |
| `domain/entities/conversation.entity.ts` | 76 | Domain entities |
| `domain/interfaces/ai.repository.interface.ts` | 33 | Repository contract |
| `presentation/controllers/ai.controller.ts` | 145 | REST endpoints |
| `presentation/dtos/ai.dto.ts` | 129 | Request/response DTOs |
| `apps/api/src/modules/ai-runtime/` | | |
| `ai-runtime.module.ts` | 74 | Module wiring |
| `application/services/execution-pipeline.service.ts` | 105 | Pipeline with middleware |
| `application/services/memory-abstraction.service.ts` | 61 | Memory CRUD |
| `application/services/prompt-registry.service.ts` | 54 | Template registry |
| `application/services/prompt-template-engine.service.ts` | 46 | Template rendering |
| `application/services/tool-registry.service.ts` | 82 | Tool management + dispatch |
| `application/services/tool-dispatcher.service.ts` | 50 | Tool dispatch + validation |
| `application/services/agent-session-manager.service.ts` | 63 | Session lifecycle |
| `application/services/agent-state-manager.service.ts` | 86 | Agent state machine |
| `application/services/conversation-context-manager.service.ts` | 67 | Context window management |
| `application/services/streaming-response-manager.service.ts` | 76 | SSE streaming |
| `application/validators/tool-input.validator.ts` | 41 | Tool param validation |
| `application/validators/session.validator.ts` | 29 | Session validation |
| `domain/types/*.ts` | ~220 | Type definitions |
| `domain/interfaces/*.ts` | ~60 | Interface contracts |
| `domain/exceptions/*.ts` | ~85 | Exception classes |
| `infrastructure/stores/*.ts` | ~130 | In-memory stores |
| `infrastructure/streaming/sse-streaming.handler.ts` | 55 | SSE protocol |
| `presentation/controllers/ai-runtime.controller.ts` | 114 | REST endpoints |
| `presentation/dtos/*.ts` | ~92 | Request/response DTOs |
| `workspace/services/ai-service/app/` | | |
| `main.py` | 212 | FastAPI entry point |
| `config/settings.py` | 46 | Configuration |
| `config/providers.py` | 39 | LLM provider init |
| `core/base_agent.py` | 191 | Abstract agent framework |
| `core/agent_registry.py` | 57 | Singleton registry |
| `core/model_router.py` | 188 | Task→model routing |
| `agents/electrical_engineer/agent.py` | 172 | Hardcoded engineer agent |
| `agents/electrical_engineer/tools.py` | 276 | Dead tool definitions |
| `agents/document_analyst/agent.py` | 405 | Document analysis agent |
| `rag/chunker.py` | 219 | Document chunking |
| `rag/embedding_pipeline.py` | 127 | Embedding generation |
| `rag/retriever.py` | 213 | RAG retrieval |
| `rag/vector_store.py` | 117 | Auto-detect store |
| `rag/qdrant_store.py` | 208 | Qdrant integration |
| `rag/file_store.py` | 134 | Fallback JSON store |
| `tools/calculation_tool.py` | 115 | Engineering service bridge |
| `tools/document_parser.py` | 271 | PDF/DOCX/OCR parsing |
| `tools/minio_client.py` | 229 | Object storage |
| `api/routers/rag.py` | 240 | RAG API endpoints |
| `api/routers/documents.py` | 197 | Document analysis API |
| `api/routers/agents.py` | 180 | Agent API endpoints |
| `schemas/inputs.py` | 26 | Pydantic input models |
| `schemas/outputs.py` | 35 | Pydantic output models |
| `tests/test_vector_store.py` | 215 | Vector store tests |
| `tests/test_agents.py` | 88 | Agent unit tests |
| `prisma/schema.prisma` | 60 | DB schema (AI models) |
