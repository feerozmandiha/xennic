# رانتایم دریافت — Ingestion Runtime

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. نمای کلی معماری دریافت — Ingestion Architecture Overview

The Ingestion Runtime governs how documents enter the Xennic knowledge base. Every document — regardless of source — passes through a standardized reception and validation layer before being queued for processing.

### مسیر ورود — Entry Paths

| Channel | Trigger | Protocol | Typical Volume |
|---------|---------|----------|----------------|
| REST API Upload | Application call | HTTPS multipart POST | 1–50 docs/min |
| Batch Import | User uploads archive (ZIP) | HTTPS or CLI tool | 100–10,000 docs/batch |
| Web Crawler | Scheduled / webhook | HTTP(S) fetch | 10–500 docs/hour |
| Manual Upload | Web UI drag-and-drop | Browser HTTPS | 1–10 docs/min |
| Connector Framework | External integration | Via connector SDK | Configurable |

### جریان دریافت عمومی — Common Ingestion Flow

```
Receive → Acknowledge → Validate Format → Queue for Processing
```

| Step | Action | Responsibility |
|------|--------|----------------|
| Receive | Accept the document payload via the ingress channel | API Gateway / Upload Handler |
| Acknowledge | Return a receipt (ingestion_id, status=received) to the caller immediately | API Gateway |
| Validate Format | Check file type, magic bytes, size limits, basic structural integrity | Format Validator |
| Queue for Processing | Enqueue to the appropriate ingestion queue with source metadata | Queue Dispatcher |

### اعتبارسنجی عمومی — Common Validation Rules

| Rule | Description | Failure Action |
|------|-------------|----------------|
| File size | ≤ 100 MB per document | Reject with error |
| File extension | Must match declared MIME type | Reject or flag |
| Magic bytes | Binary header must match extension | Reject |
| Malware scan | Scan for known malicious patterns | Quarantine + alert |
| Duplicate check | SHA-256 hash comparison against ingested documents | Skip or flag as update |

---

## 2. کاتالوگ انواع منابع — Source Type Catalog

### 2.1. PDF Documents

| Property | Detail |
|----------|--------|
| **Formats** | PDF 1.4–2.0, PDF/A (all levels), scanned PDF (image-only) |
| **Parser Strategy** | PDF text extraction via native library; fallback to Vision Service OCR on image-only pages |
| **Metadata Strategy** | Extract from PDF info dictionary (Author, Title, Subject, Keywords), filename heuristic, or sidecar `.meta.json` file |
| **Validation Rules** | Page count > 0, not encrypted/DRM-protected, not corrupt; if image-only → trigger OCR path |
| **Known Limitations** | Complex layouts (multi-column, tables, forms) may lose structure during extraction; embedded fonts may cause character map issues |

### 2.2. DOCX Documents

| Property | Detail |
|----------|--------|
| **Formats** | Office Open XML (.docx), Strict OOXML |
| **Parser Strategy** | `python-docx` or equivalent XML-based parser; extract from `word/document.xml` |
| **Metadata Strategy** | Document properties: author, title, category, comments (from `docProps/core.xml`, `docProps/app.xml`) |
| **Validation Rules** | Valid ZIP container structure; `word/document.xml` must exist and be well-formed XML |
| **Known Limitations** | Embedded images not extracted (stored as references); complex tracked changes, formulas, and active content (macros) may be unsupported |

### 2.3. HTML Documents

| Property | Detail |
|----------|--------|
| **Formats** | HTML4, HTML5, XHTML |
| **Parser Strategy** | HTML parser with readability/content extraction (e.g., Readability algorithm, Boilerpipe); strip navigation, ads, non-content elements |
| **Metadata Strategy** | Extract from `<meta>` tags, Schema.org JSON-LD, Open Graph (`og:*`), Twitter Card, `<title>` |
| **Validation Rules** | Valid HTML parse tree; character encoding auto-detected (BOM, HTTP headers, `<meta charset>`) |
| **Known Limitations** | Dynamic/JavaScript-rendered content not captured without headless browser (not in scope for baseline); SPAs require pre-rendered snapshots |

### 2.4. Markdown Documents

| Property | Detail |
|----------|--------|
| **Formats** | CommonMark, GitHub Flavored Markdown (GFM) |
| **Parser Strategy** | CommonMark-compliant parser with YAML/TOML frontmatter extraction |
| **Metadata Strategy** | YAML or TOML frontmatter block between `---` delimiters; fallback to filename conventions |
| **Validation Rules** | If frontmatter present, must be valid YAML/TOML; no embedded binary content |
| **Known Limitations** | No standard metadata format (frontmatter optional); tables and footnotes vary by implementation |

### 2.5. Scanned Images

| Property | Detail |
|----------|--------|
| **Formats** | TIFF, JPEG, PNG; multi-page TIFF supported (each page treated as separate image) |
| **Parser Strategy** | Vision Service OCR pipeline: Tesseract + layout analysis (page segmentation, column detection) |
| **Metadata Strategy** | EXIF data (creation date, camera/make, orientation); filename conventions for batch identification |
| **Validation Rules** | DPI ≥ 200 (minimum for legible OCR); legibility check via blur/sharpness metric; color depth ≥ 8-bit |
| **Known Limitations** | Handwritten text not reliably recognized; poor-quality scans (low contrast, skewed) degrade accuracy; Persian/Arabic script OCR accuracy ~75–85% depending on quality |

### 2.6. Manufacturer Catalogs

| Property | Detail |
|----------|--------|
| **Characterized by** | Structured tables, product codes, technical specifications, mixed Farsi/English text |
| **Parser Strategy** | Table-aware extraction (detect table boundaries, merge split cells) + entity pattern matching (product code regex, specification-pattern detection) |
| **Special Handling** | Normalize product codes to internal format; extract specification tables as structured key-value pairs |
| **Manufacturer-Specific Recognizers** | Siemens (SINAMICS, SIRIUS patterns), ABB (ACS, MNS series), Schneider (EcoStruxure, TeSys), Prysmian (cable type codes); extensible for additional manufacturers |

### 2.7. IEC Standards

| Property | Detail |
|----------|--------|
| **Characterized by** | Highly structured format: numbered clauses, normative references, definitions, tables, annexes |
| **Parser Strategy** | Clause-aware parser (hierarchical section numbering); reference extractor (normative/ bibliographic); table extractor with cell merging |
| **Special Handling** | Extract IEC number (e.g., IEC 60909), edition year, title in English (bilingual if available); maintain clause hierarchy |
| **Validation** | Edition verification against IEC webstore (automated check via web service) |

### 2.8. IEEE Papers

| Property | Detail |
|----------|--------|
| **Characterized by** | Standard paper structure: Abstract, Introduction, Methodology, Results, Conclusions, References |
| **Parser Strategy** | Section-aware parser (heading detection, section segmentation); reference extractor (IEEE citation format) |
| **Special Handling** | DOI extraction from header/footer; author metadata (name, affiliation, email); citation graph parsing |
| **Validation** | DOI format validation; reference count > 0 |

### 2.9. ISIRI Standards

| Property | Detail |
|----------|--------|
| **Characterized by** | Persian-dominant text with bilingual (FA/EN) headers; Iranian-specific formatting and numbering |
| **Parser Strategy** | Persian-aware text extraction; bidirectional (RTL/LTR) text handling; Persian digit normalization |
| **Special Handling** | Extract ISIRI standard number, Persian title, English title; cross-reference to equivalent IEC standard |
| **Known Limitations** | Mixed RTL/LTR text causes ordering artifacts in extracted text; Arabic-script OCR challenges (Persian-specific characters, joined script) |

### 2.10. Tavanir Regulations

| Property | Detail |
|----------|--------|
| **Characterized by** | Persian text body; numbered articles, clauses, and sub-clauses; official government formatting |
| **Parser Strategy** | Persian text extraction; article/section detection (عدد ماده، بند، تبصره) |
| **Special Handling** | Tavanir document codes (شماره ابلاغ); effective date; jurisdiction scope (national / regional); supersession tracking |
| **Update Monitoring** | Automated check of Tavanir official website quarterly for new or revised regulations |

### 2.11. Regional Distribution Companies

| Property | Detail |
|----------|--------|
| **Characterized by** | Local utility documents (شرکت‌های توزیع برق منطقه‌ای); regional variations of national regulations |
| **Parser Strategy** | Same as Tavanir regulations (article/section detection, Persian text) |
| **Special Handling** | Regional company identification from document header/watermark; regional-specific clauses extracted as exceptions to national rules; company-specific tariff information |

### 2.12. REST APIs

| Property | Detail |
|----------|--------|
| **Connector Type** | HTTP/HTTPS-based ingestion connectors (outbound polling or push) |
| **Authentication** | API key (header/query), OAuth2 client credentials, HTTP Basic Auth |
| **Rate Limiting** | Configurable per source: requests/sec, concurrency, backoff policy |
| **Webhook Support** | Real-time document push via pre-configured webhook endpoints; HMAC signature verification |

### 2.13. Batch Import

| Property | Detail |
|----------|--------|
| **Supported Formats** | ZIP archive of documents; CSV manifest (file list + metadata); JSON manifest |
| **Batch Validation** | All files validated before any document is ingested (transactional: all-or-none at batch level) |
| **Error Handling** | Per-file errors isolated and logged; non-failing files continue processing; batch summary report generated |
| **Manifest Schema** | CSV/JSON supports fields: filename, source, tier, domain, tags, language, custom_metadata |

### 2.14. Manual Upload (Web UI)

| Property | Detail |
|----------|--------|
| **User Interface** | Drag-and-drop zone; file selector dialog (single/multi) |
| **User Metadata** | Required: source, tier. Optional: domain, tags, language, notes |
| **Immediate Validation** | Format check, size check, and basic integrity check performed before upload completes (client-side + server-side) |
| **User Feedback** | Real-time progress bar; per-file status (✓, ✗, ⏳); batch summary after completion |

### 2.15. Future Connectors

| Property | Detail |
|----------|--------|
| **Extensible Framework** | Connector SDK with standard interface (`authenticate`, `fetch`, `transform`, `deliver`) |
| **Connector SDK** | Abstract `BaseConnector` class; implement per-source; versioned and validated |
| **Candidate Sources** | SharePoint, Google Drive, FTP/SFTP, Amazon S3 buckets, email attachments (IMAP/POP3), Confluence, Git repositories |

---

## 3. طراحی صف دریافت — Ingestion Queue Design

### اولویت‌بندی — Priority Levels

| Priority | Assigned To | Processing SLA |
|----------|-------------|----------------|
| **High** | Manual upload (Web UI) | < 30 seconds |
| **Normal** | REST API upload | < 5 minutes |
| **Low** | Batch import, Web crawler | < 1 hour |

### معماری صف — Queue Architecture

| Queue | Source Types | Concurrency | Retry Policy |
|-------|-------------|-------------|--------------|
| `ingestion.pdf` | PDF documents | 10 | 3 retries → DLQ |
| `ingestion.docx` | DOCX documents | 10 | 3 retries → DLQ |
| `ingestion.html` | HTML documents | 5 | 3 retries → DLQ |
| `ingestion.markdown` | Markdown documents | 5 | 3 retries → DLQ |
| `ingestion.image` | Scanned images | 20 | 3 retries → DLQ |
| `ingestion.manufacturer` | Manufacturer catalogs | 5 | 3 retries → DLQ |
| `ingestion.standard` | IEC, IEEE, ISIRI standards | 5 | 3 retries → DLQ |
| `ingestion.regulation` | Tavanir, Regional regulations | 5 | 3 retries → DLQ |
| `ingestion.api` | REST API connectors | Per-source config | 3 retries → DLQ |
| `ingestion.batch` | Batch imports | 2 | 1 retry → manual review |

### مدیریت پیام‌های مسموم — Poison Message Handling

- **Max retries:** 3 per message
- **After exhaustion:** Message moved to Dead Letter Queue (DLQ)
- **DLQ review:** Admin dashboard displays DLQ contents with error details, document preview, retry/delete actions
- **Alerting:** DLQ depth > 10 triggers notification to knowledge engineering team

### کنترل نرخ — Rate Limiting

| Level | Limit | Scope |
|-------|-------|-------|
| Per source | Configurable (default: 10 docs/min) | Source-specific queue |
| Global | 100 docs/min | All queues combined |
| Per user | 20 docs/min | API key / session |
