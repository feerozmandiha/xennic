# Electrical Plugin Guide

## Xennic Enterprise Electrical Engineering Library — Sprint C2

A comprehensive, plugin-based electrical engineering calculation platform built on the Xennic Calculation Platform DSL Runtime. 55 calculation plugins spanning 8 categories — Foundation, Cable, Transformer, Short Circuit, Grounding, Protection, Motor, and Power Quality — all backed by IEC, IEEE, NFPA, and NEC standards.

---

## Architecture

The Electrical Engineering Library is **plugin-based**. Each calculation is a `DslDefinition` executed by the **Calculation Platform DSL Runtime**. Plugins are registered at application startup via `ElectricalPluginService.onModuleInit()` and cached in-memory for fast execution.

```
┌─────────────────────────────────────────────────┐
│              ElectricalPluginsController         │
│  GET/POST /api/v1/electrical/*                   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│           ElectricalPluginService                │
│  Plugin cache (Map<string, DslDefinition>)       │
│  execute(), getPlugin(), search(), stats()       │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              DslRuntime Engine                   │
│  Parses DslDefinition → evaluates formulas       │
│  Runs validations, generates certificates       │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│         Electrical Plugin Catalog                │
│  55 factory functions returning DslDefinitions   │
└─────────────────────────────────────────────────┘
```

**Key architectural points:**

- No database dependency for built-in plugins — all definitions are code-based
- The DSL Runtime handles formula evaluation, validation, and output computation
- AI metadata is embedded in each `DslDefinition` for intelligent explanations
- SHA-256 certificates are generated per calculation execution via `CertificateService`
- Plugins can be extended with custom definitions through the admin API

---

## Plugin Structure

Each plugin is a `DslDefinition` created via the static factory `DslDefinition.create({...})`:

| Field         | Type              | Description                                                    |
| ------------- | ----------------- | -------------------------------------------------------------- |
| `id`          | `string`          | Unique plugin identifier (kebab-case)                          |
| `version`     | `string`          | SemVer version                                                 |
| `standard`    | `string`          | Primary engineering standard                                   |
| `inputs`      | `DslInput[]`      | Array of input parameter definitions                           |
| `outputs`     | `DslOutput[]`     | Array of output parameter definitions                          |
| `formulas`    | `DslFormula[]`    | Named formulas with expressions                                |
| `validations` | `DslValidation[]` | Input validation rules                                         |
| `aiReview`    | `boolean`         | Whether AI explanation is available                            |
| `certificate` | `boolean`         | Whether execution generates a certificate                      |
| `metadata`    | `object`          | AI metadata (explanation, assumptions, warnings, optimization) |

### Input/Output Parameters

Each parameter includes:

- `name` — machine-readable identifier
- `label` — human-readable label
- `type` — `number`, `string`, `boolean`, or `enum`
- `unit` — SI or engineering unit
- `required` — whether the parameter is mandatory
- `defaultValue` — optional default
- `min` / `max` — numeric range constraints
- `enumValues` — allowed values for enum type

### Formula Expressions

Formulas are JavaScript expressions evaluated by the DSL Runtime. Examples:

- `V * I` — Ohm's law power calculation
- `sqrt(3) * V_LL * I * cosPhi` — three-phase power
- `kappa * sqrt(2) * I_k` — peak short-circuit current

### Validation Rules

Each validation has a `rule` name, boolean `expression`, `message`, and `severity` (`error` | `warning`). Errors halt execution; warnings are reported alongside results.

---

## How to Execute

### Execute a Single Plugin

```
POST /api/v1/electrical/execute
```

**Request body:**

```json
{
  "pluginId": "ohms-law",
  "inputs": {
    "V": 230,
    "I": 10
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pluginId": "ohms-law",
    "pluginName": "Ohms Law",
    "outputs": {
      "calculated": 23,
      "method": "R=V/I"
    },
    "errors": [],
    "warnings": [],
    "duration": 1
  }
}
```

### Execute Multiple Plugins (Batch)

```
POST /api/v1/electrical/execute-batch
```

**Request body:**

```json
[
  { "pluginId": "ohms-law", "inputs": { "V": 230, "I": 10 } },
  { "pluginId": "power-calculation", "inputs": { "V": 400, "I": 50, "cosPhi": 0.85 } }
]
```

**Response:** Array of execution results, preserving request order.

### Execute via General Calculation API (with authentication)

```
POST /api/v1/calculations/run
```

Requires JWT auth. Supports `validateOnly`, `skipAiReview`, `skipCertificate` options. Generates persistent execution history and SHA-256 certificates.

---

## Plugin Discovery

### List All Plugins

```
GET /api/v1/electrical
```

Optional query parameters:

- `?category=foundation` — filter by category
- `?search=transformer` — search by ID, standard, category, or tags

### Get Categories

```
GET /api/v1/electrical/categories
```

Returns: `["cable", "foundation", "grounding", "motor", "power-quality", "protection", "short-circuit", "transformer"]`

### Get Standards Covered

```
GET /api/v1/electrical/standards
```

Returns all engineering standards referenced across all plugins.

### Get Plugin Details

```
GET /api/v1/electrical/:id
```

Returns full plugin info including the complete `DslDefinition` JSON.

### Get Plugin Formulas

```
GET /api/v1/electrical/:id/formulas
```

Returns the named formulas and their expressions for a specific plugin.

### Get Statistics

```
GET /api/v1/electrical/stats
```

Returns: total plugins, total formulas, categories count, standards count, AI-enabled count, certificate-enabled count.

---

## Admin Operations

All admin endpoints require JWT authentication with admin role.

### Enable / Disable Plugins

```
PATCH /api/v1/admin/calculations/plugins/:id/enable
PATCH /api/v1/admin/calculations/plugins/:id/disable
```

### Version Management

```
POST   /api/v1/admin/calculations/definitions/:id/versions
POST   /api/v1/admin/calculations/definitions/:id/versions/:versionId/publish
POST   /api/v1/admin/calculations/definitions/:id/rollback/:version
GET    /api/v1/admin/calculations/definitions/:id/versions
```

### Custom Plugin Registration

```
POST   /api/v1/admin/calculations/plugins
DELETE /api/v1/admin/calculations/plugins/:id
```

### Import / Export

Custom definitions can be exported as JSON via the GET definition endpoint and re-imported via the admin plugin registration endpoint.

---

## Engineering Standards Coverage

| Standard                    | Category Applied             | Description                                      |
| --------------------------- | ---------------------------- | ------------------------------------------------ |
| IEC 60027                   | Foundation                   | Letter symbols for electrical quantities         |
| IEC 60034-1                 | Motor, Foundation            | Rotating electrical machines                     |
| IEC 60038                   | Power Quality                | Standard voltage levels                          |
| IEC 60076 (all parts)       | Transformer                  | Power transformers                               |
| IEC 60269                   | Protection                   | Low-voltage fuses                                |
| IEC 60287                   | Cable                        | Current-carrying capacity                        |
| IEC 60364 (all parts)       | Cable, Grounding             | Low-voltage electrical installations             |
| IEC 60724                   | Cable                        | Short-circuit temperature limits                 |
| IEC 60831                   | Power Quality                | Shunt power capacitors                           |
| IEC 60898                   | Protection                   | Circuit-breakers for overcurrent protection      |
| IEC 60909                   | Foundation, Short Circuit    | Short-circuit currents in three-phase AC systems |
| IEC 60947 (all parts)       | Protection                   | Low-voltage switchgear and controlgear           |
| IEC 61000                   | Power Quality                | Electromagnetic compatibility                    |
| IEC 61869-2                 | Protection                   | Current transformers                             |
| IEEE 18                     | Power Quality                | Shunt power capacitors                           |
| IEEE 80                     | Grounding                    | Substation grounding                             |
| IEEE 141                    | Foundation, Power Quality    | Electric power distribution                      |
| IEEE 242                    | Protection                   | Protection and coordination                      |
| IEEE 519                    | Power Quality                | Harmonic control                                 |
| IEEE 665                    | Grounding                    | Generating station grounding                     |
| IEEE 835                    | Cable                        | Power cable ampacity tables                      |
| IEEE 1459                   | Foundation, Power Quality    | Power definitions                                |
| IEEE C37                    | Protection                   | Switchgear                                       |
| IEEE C57                    | Transformer                  | Transformer standards                            |
| IEEE 3002.2                 | Motor                        | Motor protection                                 |
| NEMA MG-1                   | Motor                        | Motors and generators                            |
| NEC 2023 (Article 250, 240) | Cable, Grounding, Protection | National Electrical Code                         |

---

## AI Integration

Each plugin embeds AI metadata that is returned with execution results:

### AI Explanation

Brief description of what the calculation does and the engineering principle behind it.

### AI Assumptions

Key assumptions made by the calculation model (e.g., "Balanced three-phase system", "Sinusoidal waveform").

### AI Warnings

Engineering warnings and caveats that the user should be aware of (e.g., "Low PF increases line losses and utility penalties").

### AI Optimization Suggestions

Recommendations for optimizing the engineering design (e.g., "Use IE4/IE5 class motors for best efficiency").

---

## SHA-256 Certificates

Every calculation execution with `certificate: true` generates a SHA-256 certificate via `CertificateService`. Certificates are accessible at:

```
GET /api/v1/calculations/certificate/:id
GET /api/v1/admin/calculations/certificates
```

Each certificate contains:

- Unique certificate ID (`CERT-*`)
- Definition ID and version
- Input parameters and computed outputs
- SHA-256 hash of the execution payload
- Timestamp and workspace information

---

## Plugin Catalog Summary

### Foundation (9 plugins)

`ohms-law`, `power-calculation`, `energy-calculation`, `efficiency`, `power-factor`, `three-phase-power`, `per-unit-conversion`, `symmetrical-components`, `fault-current-base`

### Cable (7 plugins)

`cable-sizing`, `cable-voltage-drop`, `cable-ampacity`, `cable-short-circuit-withstand`, `cable-derating-grouping`, `cable-derating-ambient`, `cable-derating-soil`

### Transformer (8 plugins)

`transformer-sizing`, `transformer-efficiency`, `transformer-losses`, `transformer-regulation`, `transformer-impedance`, `transformer-temperature-rise`, `transformer-loading`, `transformer-parallel-operation`

### Short Circuit (7 plugins)

`sc-three-phase`, `sc-line-line`, `sc-single-line-ground`, `sc-peak-current`, `sc-breaking-current`, `sc-making-current`, `sc-thermal-equivalent`

### Grounding (6 plugins)

`grounding-earth-resistance`, `grounding-grid-resistance`, `grounding-touch-voltage`, `grounding-step-voltage`, `grounding-conductor-sizing`, `grounding-rod-sizing`

### Protection (7 plugins)

`protection-fuse-sizing`, `protection-mcb-selection`, `protection-mccb-selection`, `protection-acb-selection`, `protection-relay-ct-sizing`, `protection-coordination`, `protection-breaking-capacity`

### Motor (6 plugins)

`motor-current`, `motor-starting-current`, `motor-voltage-drop-starting`, `motor-starting-method`, `motor-cable-sizing`, `motor-protection-sizing`

### Power Quality (5 plugins)

`pq-power-factor-correction`, `pq-capacitor-bank`, `pq-reactive-power`, `pq-harmonic-estimation`, `pq-voltage-regulation`

---

## FAQ and Troubleshooting

### How do I add a custom plugin?

Use the admin API: `POST /api/v1/admin/calculations/plugins` with a `RegisterPluginDto` containing the full `DslDefinition` JSON. Alternatively, add a factory function to `electrical-plugin-catalog.ts` and restart the service.

### Why did my calculation return no output?

Check that all required inputs are provided. Validation errors are returned in the `errors` array. If the validation severity is `error`, execution is halted.

### How do I handle unbalanced three-phase loads?

The three-phase calculations assume balanced conditions. Use the `symmetrical-components` plugin to decompose unbalanced currents into sequence components.

### Can I get the full formula expression?

Yes: `GET /api/v1/electrical/:id/formulas` returns all formula names and their expressions.

### What if I need cable sizing for aluminium conductors?

The cable sizing plugins default to copper. For aluminium, increase the recommended cross-section by one standard size as noted in the AI warnings.

### How do I verify a calculation certificate?

Use `GET /api/v1/calculations/certificate/:id` with the certificate ID (format `CERT-*`). The SHA-256 hash verifies the integrity of the execution.

### Which standard should I use for short-circuit studies?

Standard practice is IEC 60909. The short-circuit plugins follow the equivalent voltage source method per IEC 60909 with voltage factors `c_max` and `c_min`.

### What is the accuracy of these calculations?

Plugins use standard industry formulas from the referenced standards. Accuracy depends on input precision. Tolerances are typically ±1-2% for standard conditions. Non-standard conditions (e.g., extreme temperatures, non-sinusoidal waveforms) may introduce additional error.

### How do I get AI recommendations for my calculation?

Each plugin's metadata contains AI-driven fields. When executing via `POST /api/v1/calculations/run`, the response includes AI explanation, assumptions, warnings, and optimization suggestions (unless `skipAiReview: true`).

### What if a plugin is not found?

Verify the plugin ID using `GET /api/v1/electrical`. Plugin IDs are case-sensitive kebab-case (e.g., `transformer-sizing`, not `TransformerSizing`).
