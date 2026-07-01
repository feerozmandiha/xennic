# روابط مهندسی — Engineering Relationship Model

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Purpose

Define the formal relationship types for the engineering knowledge model. Relationships connect entities (defined in engineering-entities.md) and concepts (defined in concept-model.md) to form a complete knowledge graph. Every relationship has direction, type, cardinality, and optional weight.

---

## 2. Relationship Architecture

Every relationship has:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `relationship_id` | UUID | ✅ | Unique identifier: XEN-REL-{TYPE}-{NNNN} |
| `source_id` | UUID | ✅ | UUID of the source entity/concept |
| `target_id` | UUID | ✅ | UUID of the target entity/concept |
| `relationship_type` | Enum | ✅ | One of the defined types (see §3) |
| `direction` | Enum | ✅ | `unidirectional` or `bidirectional` |
| `cardinality` | Enum | ✅ | `one-to-one`, `one-to-many`, `many-to-one`, `many-to-many` |
| `weight` | Float | Optional | Numeric strength (0.0–1.0) |
| `constraints` | JSON | Optional | Conditions on the relationship |
| `metadata` | Object | Optional | Evidential support, source reference, confidence |

---

## 3. Relationship Categories

### 3.1 Hierarchical Relationships

| Type | Source → Target | Cardinality | Description | Example |
|------|----------------|-------------|-------------|---------|
| `belongs_to` | Equipment → Substation | M:1 | Equipment is located in or part of a substation | Transformer `belongs_to` Substation |
| `contains` | Substation → Equipment | 1:M | Substation houses equipment | Substation `contains` Circuit Breaker |
| `part_of` | Component → Assembly | M:1 | Component is part of a larger assembly | Relay `part_of` Protection Scheme |
| `subclass_of` | Specific → General | M:1 | Specialization relationship | Overcurrent Relay `subclass_of` Relay |
| `instance_of` | Instance → Type | M:1 | A specific instance of a type | "Siemens 7SJ64" `instance_of` Relay |

### 3.2 Functional Relationships

| Type | Source → Target | Cardinality | Description | Example |
|------|----------------|-------------|-------------|---------|
| `protects` | Protection Device → Equipment | M:M | A device that provides protection | Circuit Breaker `protects` Transformer |
| `supplies` | Source → Load | M:M | Energy flow from source to load | Generator `supplies` Busbar |
| `connects_to` | Equipment → Equipment | M:M | Physical/electrical connection | Cable `connects_to` Motor |
| `controls` | Controller → Equipment | 1:M | Control relationship | Relay `controls` Circuit Breaker |
| `measured_by` | Parameter → Measurement Device | M:1 | How a parameter is measured | Current `measured_by` CT |

### 3.3 Regulatory Relationships

| Type | Source → Target | Cardinality | Description | Example |
|------|----------------|-------------|-------------|---------|
| `governs` | Standard → Equipment | M:M | Standard applies to equipment type | IEC 60076 `governs` Transformer |
| `regulates` | Regulation → Activity | M:M | Regulation controls an activity | Tavanir Tariff `regulates` Energy Cost |
| `adopts` | Regulation → Standard | M:1 | Regulation adopts a standard | ISIRI `adopts` IEC 60909 |
| `supersedes` | Standard → Standard | 1:1 | New version replaces old | IEC 60909-1 `supersedes` IEC 60909:1988 |
| `referenced_by` | Document → Document | M:M | One document cites another | IEC 60909 `referenced_by` IEEE 80 |

### 3.4 Operational Relationships

| Type | Source → Target | Cardinality | Description | Example |
|------|----------------|-------------|-------------|---------|
| `operates_at` | Equipment → Location | M:1 | Equipment operates at a location | Substation `operates_at` Site |
| `applied_to` | Tariff → Customer | M:M | Tariff applies to customer | Tariff `applied_to` Industrial Customer |
| `scheduled_for` | Activity → Timeline | 1:1 | Activity scheduled on timeline | Maintenance `scheduled_for` 2025-Q3 |
| `owned_by` | Asset → Owner | M:1 | Asset ownership | Substation `owned_by` Utility |

### 3.5 Dependency Relationships

| Type | Source → Target | Cardinality | Description | Example |
|------|----------------|-------------|-------------|---------|
| `depends_on` | Activity → Activity | M:M | One activity depends on another | Protection Study `depends_on` Fault Analysis |
| `requires` | Calculation → Input | M:M | Calculation requires input parameters | Short Circuit `requires` Source Impedance |
| `produces` | Calculation → Output | 1:M | Calculation produces results | Load Flow `produces` Voltage Profile |
| `validates` | Measurement → Calculation | M:1 | Measurement validates calculation | Field Test `validates` Short Circuit Study |
| `constrains` | Constraint → Design | M:M | Constraint limits design options | Right-of-Way `constrains` Cable Route |

---

## 4. Direction Rules

| # | Rule | Description | Example |
|---|------|-------------|---------|
| 1 | **Unidirectional** | MUST be traversed only in the defined direction (→) | `protects` is always Protection Device → Equipment |
| 2 | **Bidirectional** | MAY be traversed in either direction | `connects_to` can be Cable → Equipment or Equipment → Cable |
| 3 | **Inverse pairs** | Explicitly defined opposite-direction pairs | `governs` (Standard → Equipment) ↔ `governed_by` (Equipment → Standard) |
| 4 | **Transitive** | Support path traversal across chain | if A `contains` B and B `contains` C, then A `contains` C |
| 5 | **Symmetric** | No direction; equivalent both ways | `connected_to` is symmetric |

---

## 5. Cardinality Constraints

| Notation | Meaning | Example |
|----------|---------|---------|
| 1:1 | Exactly one to exactly one | Project : Project Manager |
| 1:M | One to many | Substation : Transformer |
| M:1 | Many to one | Equipment : Substation |
| M:M | Many to many | Standard : Equipment |

---

## 6. Graph Edge Mapping

| Architecture Field | Graph Element | Description |
|--------------------|---------------|-------------|
| `relationship_type` | `edge_label` | RDF/OWL object property label |
| `source_id` | `edge_start_node` | Source node URI |
| `target_id` | `edge_end_node` | Target node URI |
| `direction` | `directed` / `undirected` flag | Controls traversal semantics |
| `weight` | `edge_weight` | Property on edge (0.0–1.0) |
| `constraints` | `edge_properties` | JSON-LD annotation block |
| `metadata` | `edge_annotations` | Provenance and confidence metadata |

### Serialization (JSON-LD)

```json
{
  "@context": "https://xennic.io/knowledge/v1/context.jsonld",
  "@type": "Relationship",
  "relationship_id": "XEN-REL-GOV-0001",
  "relationship_type": "governs",
  "direction": "unidirectional",
  "source_id": "XEN-STD-IEC-60909",
  "target_id": "XEN-EQP-CIRCUIT-BREAKER",
  "cardinality": "many-to-many",
  "weight": 1.0,
  "constraints": {
    "applicable_voltage_range": "LV, MV, HV"
  },
  "metadata": {
    "source_tier": 1,
    "confidence": 0.98,
    "provenance": "Extracted from IEC 60909:2016 §1.1"
  }
}
```

### Serialization (RDF/Turtle)

```turtle
@prefix xennic: <https://xennic.io/knowledge/v1/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<XEN-REL-GOV-0001> a xennic:Relationship ;
    xennic:relationshipType "governs" ;
    xennic:direction "unidirectional" ;
    xennic:source <XEN-STD-IEC-60909> ;
    xennic:target <XEN-EQP-CIRCUIT-BREAKER> ;
    xennic:cardinality "many-to-many" ;
    xennic:weight 1.0 ;
    xennic:constraints """{"applicable_voltage_range": "LV, MV, HV"}""" ;
    xennic:metadata """{"source_tier": 1, "confidence": 0.98}""" .
```

---

## 7. Schema Extension Rules

1. New relationship types may be added via governance amendment without breaking existing relationships.
2. UUID format MUST follow `XEN-REL-{3-CHAR TYPE CODE}-{4-DIGIT SEQUENCE}`.
3. Direction defaults to `unidirectional` unless explicitly declared `bidirectional`.
4. Weight is optional; a missing weight is treated as 0.5 (default).
5. Cardinality MUST be validated at graph insertion time; violations MUST be rejected.
