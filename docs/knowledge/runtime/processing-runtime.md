# رانتایم پردازش — Processing Runtime

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. نمای کلی معماری پردازش — Processing Architecture

The Processing Runtime orchestrates a pipeline of sequential and parallel processors that transform a raw ingested document into indexed, semantically enriched knowledge graph content.

### معماری خط لوله — Pipeline Architecture

```
Document Payload → [Processor 1] → [Processor 2] → ... → [Processor N] → Indexed Knowledge
```

| Property | Description |
|----------|-------------|
| **Execution Model** | Directed acyclic graph (DAG) of processors; sequential by default, parallel where specified |
| **Context Passing** | Shared document state object (DocumentState) carries payload, extracted content, metadata across processors |
| **Failure Handling** | Processor failure: retry (max 3) → route to error handler → DLQ for manual review |
| **Observability** | Each processor emits structured logs, metrics (duration, throughput, error rate), and tracing spans |
| **Scalability** | Processors are stateless; horizontal scaling via worker pool (Celery / Bull / similar) |

---

## 2. کاتالوگ پردازشگرها — Processor Catalog

### 2.1. OCR Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Extract machine-readable text from scanned/image-only documents |
| **Integration** | Vision Service — Tesseract OCR engine with layout analysis (page segmentation, column detection) |
| **Input** | Image file (TIFF, JPEG, PNG) or PDF page rendered to image |
| **Output** | Extracted text with per-page layout information: paragraphs, text blocks, reading order |
| **Persian Support** | Tesseract Persian language pack (`fas`); RTL text handling via bidirectional algorithm; Persian digit normalization |
| **Quality Check** | OCR confidence score computed per page (mean character confidence); minimum threshold: **0.7** |
| **Fallback** | Pages with confidence < 0.7 flagged for human review; stored as pending review in database |
| **Performance** | ~2–5 seconds per page (300 DPI); parallelized per page for multi-page documents |

### 2.2. Parser Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Parse structured documents into a normalized document content tree |
| **Input** | Raw document file (PDF, DOCX, HTML, Markdown) or OCR-extracted text |
| **Output** | Document content tree with typed nodes: Section, Paragraph, Table, List, ListItem, Formula, Figure, Caption |
| **Format-Specific Parsers** | PDF (PDF text extraction + layout), DOCX (OOXML parser), HTML (readability + DOM traversal), Markdown (CommonMark AST) |
| **Table Extraction** | Preserve table structure (rows, columns, merged cells) for engineering data; output as structured array of arrays |
| **Formula Extraction** | Detect LaTeX inline/display formulas (`$...$`, `$$...$$`) and MathML `<math>` elements; preserve in canonical LaTeX form |
| **Dependencies** | OCR Processor must have run for scanned documents; direct text documents parse without OCR |

### 2.3. Cleaner Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Clean and normalize extracted text to remove artifacts and standardize formatting |
| **Input** | Raw extracted text from Parser or OCR Processor |
| **Output** | Cleaned, normalized text content |
| **Operations** | |

| Operation | Description |
|-----------|-------------|
| Remove artifacts | Strip headers, footers, page numbers, watermarks, running heads |
| Normalize whitespace | Collapse multiple spaces, trim lines, standardize line endings (`\n`) |
| Fix character encoding | Detect and repair mojibake (e.g., Windows-1256 vs UTF-8 Persian text) |
| Remove non-printable | Strip control characters, null bytes, soft hyphens |
| Normalize line endings | Convert CR, CR+LF to LF |

| **Persian Normalization** | |
| |--|
| Normalize alef variants | `آ`, `أ`, `إ` → `ا` |
| Normalize ye variants | `ي`, `ى` → `ی` |
| Normalize he variants | `ة`, `ه` → `ه` |
| Normalize kaf variants | `ك` → `ک` |
| Bidirectional cleanup | Remove spurious LTR/RTL marks; ensure proper ordering |

| **Dependencies** | Parser Processor complete |
| **Performance** | < 100 ms per 1000 words |

### 2.4. Metadata Builder Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Construct complete metadata record per metadata schema |
| **Input** | Document + cleaned extracted content |
| **Output** | Metadata JSON object with all 5 sections: identification, provenance, classification, content metrics, administrative |
| **Auto-Detection** | |
| Detection | Method |
| Language | FastText / langid model (FA, EN, AR, FR, DE) |
| Document type | Classifier: standard, regulation, catalog, paper, general |
| Domain | Classifier: power, protection, transmission, distribution, renewable, general |
| **Source Tier Assignment** | Based on document type and origin (see Acquisition Policy — Allowed Sources by Tier) |
| **Missing Fields** | Fields not auto-detectable are flagged for human completion; status set to `needs_review` |
| **Dependencies** | Cleaner Processor complete |

### 2.5. Concept Resolver Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Identify and resolve references to Xennic engineering concepts within document content |
| **Reference** | Canonical concepts catalog (12 concepts): short-circuit current, load flow, protection coordination, etc. |
| **Method** | Hybrid: NER model (trained on engineering text) for concept name detection + LLM-based concept extraction for contextual disambiguation |
| **Input** | Cleaned document text + document metadata (domain, type) |
| **Output** | List of resolved concept references: `{concept_id, concept_name, confidence, occurrences[], context_snippets[]}` |
| **AI Integration** | AI Service provides LLM-based extraction endpoint; prompt includes canonical concept definitions for zero-shot matching |
| **Dependencies** | Cleaner Processor complete |
| **Note** | Runs **in parallel** with Ontology Resolver |

### 2.6. Ontology Resolver Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Map extracted concepts and entities to entities defined in the engineering ontology |
| **Reference** | Ontology definition, Engineering entities catalog (20 types) |
| **Method** | Pattern matching (for well-known entity patterns like product codes, standard numbers) + LLM extraction for attribute values |
| **Input** | Cleaned document text + Concept Resolver output |
| **Output** | Entity instances with type, attributes, and inferred relationships |
| **AI Integration** | AI Service LLM endpoint for entity attribute extraction from text spans |
| **Dependencies** | Cleaner Processor complete |
| **Note** | Runs **in parallel** with Concept Resolver |

### 2.7. Vocabulary Resolver Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Normalize detected terminology to canonical engineering vocabulary |
| **Reference** | Engineering vocabulary catalog (canonical terms by domain) |
| **Method** | Term matching against vocabulary index; each detected term mapped to canonical term ID |
| **Input** | Document text + resolved concepts + ontology entities |
| **Output** | Term mappings: `{original_term, canonical_term_id, canonical_label_fa, canonical_label_en, confidence}` |
| **Synonym Resolution** | Defers to Synonym Resolver for non-canonical term variants |
| **Dependencies** | Concept Resolver AND Ontology Resolver complete |

### 2.8. Synonym Resolver Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Resolve variant terms and synonyms to canonical terms |
| **Reference** | Synonym dictionary (term variants → canonical term mappings) |
| **Method** | Dictionary lookup + edit-distance fuzzy matching (threshold: 0.85) for typos and transliteration variants |
| **Input** | Term candidates from Vocabulary Resolver |
| **Output** | Canonical term IDs for all variant terms found in text |
| **Dependencies** | Concept Resolver AND Ontology Resolver complete |

### 2.9. Entity Extractor Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Extract engineering entities from document content |
| **Reference** | Engineering entities catalog (20 entity types): Standard, Equipment, Manufacturer, Measurement, Parameter, Material, Location, Organization, Person, Project, Document, Regulation, Product, Cable, Transformer, Switchgear, Relay, ProtectionScheme, Substation, Circuit |
| **Method** | Pattern-based extraction (regex for product codes, standard numbers) + LLM extraction (contextual entity recognition) |
| **Input** | Document text + vocabulary/synonym resolved terms + concept + ontology data |
| **Output** | List of extracted entity instances with type, attributes, confidence, text spans |
| **Dependencies** | Vocabulary Resolver AND Synonym Resolver complete |

### 2.10. Relationship Extractor Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Extract semantic relationships between extracted entities |
| **Reference** | Engineering relations catalog (5 categories): Composition, Hierarchy, Dependency, Equivalence, Temporal |
| **Method** | Dependency parsing (syntactic) + LLM relationship extraction (semantic) |
| **Input** | Entity instances from Entity Extractor + document text |
| **Output** | List of tuples: `{source_entity_id, relationship_type, target_entity_id, confidence, evidence_snippet}` |
| **Dependencies** | Entity Extractor running |
| **Note** | Runs **in parallel** with Entity Extractor (operates on entities as they are extracted) |

### 2.11. Unit Normalizer Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Normalize all engineering units and measurements to canonical forms |
| **Reference** | Unit normalization catalog (SI base units, derived units, per-unit system) |
| **Operations** | |
| Operation | Example |
| Unit symbol normalization | `kV` → `kV`, `KV` → `kV`, `كيلو ولت` → `kV` |
| Value conversion to SI | `1.5 in` → `0.0381 m`, `100°F` → `37.78°C` |
| Per-unit conversion | Convert to per-unit on defined base MVA/kV base where applicable |
| **Input** | Entity instances with measurement attributes + document text |
| **Output** | Normalized measurements with canonical unit strings and SI-equivalent values |
| **Dependencies** | Entity Extractor AND Relationship Extractor complete |

### 2.12. Chunk Generator Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Split the enriched document into optimal retrieval chunks for vector search |
| **Strategy** | Hybrid: semantic + fixed-size chunking, tuned per document type |
| **Parameters** | |
| Parameter | Value | Notes |
| Chunk size | 500–1000 tokens | Adjustable per document type; standards shorter, catalogs longer |
| Overlap | 10–20% | Ensures context continuity across chunk boundaries |
| Semantic boundaries | Preferred split at section/paragraph boundaries | Falls back to token-count split if boundary exceeds 2× chunk size |
| **Input** | Complete document content tree + all extracted entities, concepts, terms, relationships |
| **Output** | Array of chunks: `{chunk_id, content, metadata{source_document, position_range, section_path, entity_refs[], concept_refs[]}}` |
| **Dependencies** | All extraction processors complete (2.1–2.11) |

### 2.13. Embedding Generator Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Generate vector embeddings for each chunk to enable semantic search |
| **Integration** | AI Service embedding pipeline (GPU-accelerated batch inference) |
| **Model** | `multilingual-e5-large` or equivalent (supports Farsi + English) |
| **Input** | Chunk array from Chunk Generator |
| **Output** | Array of `{chunk_id, embedding_vector (float[1024]), metadata}` |
| **Batch Size** | 64 chunks per inference call (optimal throughput) |
| **Dependencies** | Chunk Generator complete |
| **Note** | Run **per chunk** — all chunks can be embedded in parallel via batch inference |

### 2.14. Vector Publisher Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Publish embedding vectors to vector database for similarity search |
| **Integration** | Qdrant vector database (collection per domain or workspace) |
| **Write Mode** | Upsert: overwrites existing point if same chunk_id exists (idempotent) |
| **Payload** | Each point includes payload: chunk text, document metadata, entity/concept references |
| **Quality Check** | Verify embedding dimension matches collection configuration (dimension mismatch → reject with error) |
| **Dependencies** | Embedding Generator complete |

### 2.15. Graph Publisher Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Publish entities, concepts, terms, and their relationships to the Knowledge Graph |
| **Nodes** | Entity instances → graph nodes (typed: entity, concept, semantic_term) |
| **Edges** | Relationships → graph edges (typed: relates_to, synonym_of, maps_to, etc.) |
| **Write Mode** | Idempotent upsert (MERGE): creates node if not exists, updates attributes if exists |
| **Dependencies** | Vector Publisher complete (ensures all embeddings indexed before graph references) |

### 2.16. Audit Logger Processor

| Property | Detail |
|----------|--------|
| **Purpose** | Log all processing events for compliance and traceability |
| **Events Captured** | Processor start, completion, failure, retry, DLQ routing, human review flags |
| **Storage** | Audit log table in PostgreSQL (append-only) |
| **Retention** | **7 years minimum** (engineering audit and regulatory compliance requirement) |
| **Schema** | `{event_id, timestamp, ingestion_id, document_id, processor_name, event_type, status, duration_ms, error_detail, user_id}` |
| **Dependencies** | All processors — runs throughout the pipeline lifecycle |

---

## 3. ترتیب پردازش و وابستگی‌ها — Processing Sequence and Dependencies

| Order | Processor | Parallel | Depends On |
|-------|-----------|----------|------------|
| 1 | **OCR** | ✅ Yes (per page) | Document type = scanned |
| 2 | **Parser** | ❌ No | OCR complete OR direct text input |
| 3 | **Cleaner** | ❌ No | Parser complete |
| 4 | **Metadata Builder** | ❌ No | Cleaner complete |
| 5 | **Concept Resolver** | ✅ With Ontology Resolver | Cleaner complete |
| 6 | **Ontology Resolver** | ✅ With Concept Resolver | Cleaner complete |
| 7 | **Vocabulary Resolver** | ❌ After 5–6 | Concept + Ontology complete |
| 8 | **Synonym Resolver** | ❌ After 5–6 | Concept + Ontology complete |
| 9 | **Entity Extractor** | ❌ After 7–8 | Vocabulary + Synonym complete |
| 10 | **Relationship Extractor** | ✅ With Entity Extractor | Entity Extractor started |
| 11 | **Unit Normalizer** | ❌ After 9–10 | Entity + Relationship complete |
| 12 | **Chunk Generator** | ❌ No | All extraction complete (5–11) |
| 13 | **Embedding Generator** | ✅ Per chunk (batch) | Chunk Generator complete |
| 14 | **Vector Publisher** | ❌ After 13 | Embedding Generator complete |
| 15 | **Graph Publisher** | ❌ After 14 | Vector Publisher complete |
| 16 | **Audit Logger** | ✅ Throughout | All processors |

### نمودار جریان — Flow Diagram (Conceptual)

```
[Ingestion] → [OCR*] → [Parser] → [Cleaner] → [Metadata Builder]
                                                      │
                    ┌─────────────────────────────────┘
                    │
           ┌────────┴────────┐
           ▼                 ▼
   [Concept Resolver]  [Ontology Resolver]   ← parallel
           │                 │
           └────────┬────────┘
                    ▼
         [Vocabulary Resolver]
                    │
         [Synonym Resolver]
                    │
           ┌────────┴────────┐
           ▼                 ▼
   [Entity Extractor]  [Relationship Extractor]   ← parallel
           │                 │
           └────────┬────────┘
                    ▼
         [Unit Normalizer]
                    │
         [Chunk Generator]
                    │
         [Embedding Generator]   ← per-chunk batch
                    │
         [Vector Publisher]  →  Qdrant
                    │
         [Graph Publisher]   →  Knowledge Graph

[Audit Logger]  ← runs throughout
```
