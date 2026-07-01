# قراردادهای نام‌گذاری — Naming Conventions

**Version:** 1.0.0 | **Status:** Published | **Last Updated:** Tir 1405

---

## 1. Document File Naming

### Pattern

```
{lang}_{domain}_{doc_type}_{identifier}_{version}.{ext}
```

### Components

| Segment | Description | Values |
|---------|-------------|--------|
| `lang` | Language code (ISO 639-1) | `en`, `fa`, `de`, `fr`, `ar` |
| `domain` | Engineering domain abbreviation | `power`, `prot`, `gnd`, `cbl`, `swg`, `mot`, `trf`, `ren`, `bld`, `ind` |
| `doc_type` | Document type abbreviation | `std`, `trf`, `ctl`, `dsh`, `man`, `art`, `bok`, `reg`, `cas`, `cal`, `dwg`, `rpt` |
| `identifier` | Unique document identifier | Standard number, catalog code, or short name |
| `version` | Version string | Semver or date-based (see §6) |
| `ext` | File extension | `pdf`, `docx`, `html`, `dwg`, `xlsx` |

### Examples

| File Name | Description |
|-----------|-------------|
| `en_power_std_IEC_60038_v1.pdf` | IEC 60038 standard in English |
| `fa_power_reg_Tavanir_1403_v2.pdf` | Tavanir regulation 1403 in Persian |
| `en_cbl_ctl_Prysmian_v1.pdf` | Prysmian cable catalog in English |
| `fa_prot_man_SEL_751_v1.pdf` | SEL 751 relay manual in Persian |
| `de_swg_dsh_Siemens_SIVACON_v2.pdf` | Siemens SIVACON datasheet in German |

---

## 2. Document ID Format

### Pattern

```
XEN-KB-{TYPE}-{YYYY}-{NNNN}
```

### Segments

| Segment | Length | Description |
|---------|--------|-------------|
| `XEN-KB` | Fixed | Xennic Knowledge Base prefix |
| `TYPE` | 3 chars | Document type code (see table) |
| `YYYY` | 4 digits | Year of ingestion |
| `NNNN` | 4 digits | Zero-padded sequential number |

### Type Codes

| Code | Document Type | Example ID |
|------|--------------|------------|
| `STD` | Standard | `XEN-KB-STD-1403-0001` |
| `TRF` | Tariff | `XEN-KB-TRF-1404-0001` |
| `CTL` | Catalog | `XEN-KB-CTL-1403-0042` |
| `DSH` | Datasheet | `XEN-KB-DSH-1404-0017` |
| `MAN` | Manual | `XEN-KB-MAN-1403-0089` |
| `ART` | Article | `XEN-KB-ART-1404-0005` |
| `BOK` | Book | `XEN-KB-BOK-1403-0012` |
| `REG` | Regulation | `XEN-KB-REG-1404-0003` |
| `CAS` | Case Study | `XEN-KB-CAS-1404-0001` |

---

## 3. Chunk ID Format

### Pattern

```
XEN-CHK-{DOC_ID}-{NNNN}
```

### Example

```
XEN-CHK-XEN-KB-STD-1403-0001-0024
```

This is chunk 24 of document `XEN-KB-STD-1403-0001`.

Chunk IDs are auto-generated during the ingestion pipeline and MUST NOT be manually assigned.

---

## 4. Metadata Field Naming

### Storage Convention (snake_case)

Used in database schemas, JSON storage, and internal APIs:

```yaml
# Storage / Database
document_type: standard
voltage_level: MV
confidence_score: 0.92
source_tier: 1
chunk_strategy: semantic
original_source_url: https://webstore.iec.ch/...
```

### API Convention (camelCase)

Used in REST/GraphQL API request and response bodies:

```json
{
  "documentType": "standard",
  "voltageLevel": "MV",
  "confidenceScore": 0.92,
  "sourceTier": 1,
  "chunkStrategy": "semantic",
  "originalSourceUrl": "https://webstore.iec.ch/..."
}
```

### Mapping Rule

Convert via deterministic transformation:
- snake_case → camelCase: remove underscores, capitalize first letter of each word except first
- camelCase → snake_case: insert underscore before each uppercase letter, lowercase

---

## 5. Tag Conventions

### Rules

1. **Lowercase only**: `voltage`, not `Voltage` or `VOLTAGE`
2. **Hyphen-separated**: `short-circuit`, not `short_circuit` or `shortCircuit`
3. **Bilingual where applicable**: Pair FA/EN tags for the same concept
4. **No spaces**: `grounding-system`, not `grounding system`
5. **Max length**: 40 characters per tag
6. **Max tags per document**: 20

### Examples

| FA Tag | EN Tag | Concept |
|--------|--------|---------|
| `ولتاژ` | `voltage` | Voltage |
| `اتصال-کوتاه` | `short-circuit` | Short circuit |
| `حفاظت-رله` | `protection-relay` | Protection relay |
| `ارتینگ` | `grounding` | Grounding |
| `ترانسفورماتور-قدرت` | `power-transformer` | Power transformer |
| `کیفیت-برق` | `power-quality` | Power quality |
| `انرژی-تجدیدپذیر` | `renewable-energy` | Renewable energy |
| `تابلو-برق` | `switchgear` | Switchgear |

---

## 6. Version Conventions

### Governance Documents (semver)

```
MAJOR.MINOR.PATCH
```

| Level | Increment When | Example |
|-------|---------------|---------|
| MAJOR | Breaking structural change | `1.0.0` → `2.0.0` |
| MINOR | New section or field added | `1.0.0` → `1.1.0` |
| PATCH | Corrections, clarifications, formatting | `1.0.0` → `1.0.1` |

### Tariffs & Regulations (date-based)

```
{YYYY}_{MM}
```

| Version | Description |
|---------|-------------|
| `1403` | Year-only for annual tariffs |
| `1404_01` | Monthly revision (first month of 1404) |
| `1404_Q1` | Quarterly revision |

### Standards (edition-based)

```
{YYYY}
```

Following the standard body's own edition numbering (e.g., `IEC 60038:2021` → version `2021`).

---

## 7. Directory & Path Conventions

```
docs/knowledge/
  governance/              ← This directory
  standards/               ← Standards grouped by body
  tariffs/                 ← Tariff documents
  catalogs/                ← Manufacturer catalogs
  manuals/                 ← Equipment manuals
  references/              ← Books, articles, papers
  cases/                   ← Engineering case studies
```

Within each directory, files follow the naming convention from §1.

---

## 8. Enforcement

All naming conventions are enforced at ingestion time by the `knowledge-ingestion` pipeline. Documents that violate naming conventions are rejected with a descriptive error message before any processing occurs.
