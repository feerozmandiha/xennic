# ADR-020: Architecture Governance Automation

**Status:** Accepted
**Date:** 2026-07-06
**Deciders:** Chief Enterprise Architect
**Tags:** governance, architecture-validation, ddd, automation, ci

---

## Context

The Xennic codebase has grown to:

- 41+ NestJS modules across 10+ architectural domains
- 795+ TypeScript source files in `apps/api/src`
- 87 architecture rules across 11 categories (DDD, repository, entity, value-object, aggregate, module-boundary, import, dependency, naming, folder-structure, layer)
- 3 Python microservices in `workspace/services/`

Despite ADR-019 (Bootstrap Enforcement Layer) ensuring agents read governance documents before coding, there was **no automated enforcement** of architecture rules. Violations were caught only during code review or when compilation/runtime errors occurred.

### Problems

1. **No automatic DDD layer boundary checks** — domain layer importing infrastructure concerns went undetected
2. **No import convention enforcement** — `.js` extension violations caused ESM resolution failures at runtime
3. **No naming convention checks** — inconsistent file and class naming eroded codebase consistency
4. **No circular dependency detection** — module coupling could grow undetected
5. **No governance score** — no way to measure architecture health over time
6. **Manual code review only** — every violation required human detection

## Decision

Implement an **Architecture Governance Automation Layer** — a machine-readable rule engine, automated validator, dependency graph generator, and git hook integration that enforces architecture rules programmatically.

### Components

| Component             | Description                                                   | Location                                    |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| **Rule Definitions**  | Machine-readable YAML rule files (11 categories, 87 rules)    | `tools/architecture/rules/*.yaml`           |
| **Validator**         | TypeScript engine that scans source files against all rules   | `tools/architecture/validate.ts`            |
| **Dependency Graph**  | Auto-generated module dependency graph (Markdown + Mermaid)   | `docs/generated/module-dependency-graph.md` |
| **Governance Report** | Auto-generated architecture health score and violation report | `docs/generated/governance-report.md`       |
| **Pre-Commit Hook**   | Light validation on staged files (critical violations only)   | `.husky/pre-commit`                         |
| **Pre-Push Hook**     | Full validation (critical + high violations block push)       | `.husky/pre-push`                           |
| **npm Script**        | `pnpm validate:arch` — run validator on demand                | `package.json`                              |

### Rule Categories

| Category                 | Rules | Focus                                                                     |
| ------------------------ | ----- | ------------------------------------------------------------------------- |
| `ddd-rules`              | 10    | DDD layer isolation, entity/value-object placement, framework-free domain |
| `repository-rules`       | 8     | Interface/impl pairing, Prisma restriction, workspace filtering           |
| `entity-rules`           | 8     | UUID identity, soft-delete, behavior methods, BaseEntity extension        |
| `value-object-rules`     | 5     | Immutability, equals(), JSON serialization                                |
| `aggregate-rules`        | 6     | Aggregate root, one repository per aggregate, domain events               |
| `module-boundary-rules`  | 7     | Cross-module access, @Global() restriction, directory structure           |
| `import-rules`           | 6     | .js extension, no barrel exports, max 3-level relative paths              |
| `dependency-rules`       | 8     | Layer dependency direction, no circular deps, circuit breaker             |
| `naming-rules`           | 12    | kebab-case files, PascalCase classes, I-prefix interfaces                 |
| `folder-structure-rules` | 7     | Standard DDD directories, co-located tests                                |
| `layer-rules`            | 10    | Strict layer direction, infrastructure implements domain interfaces       |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  tools/architecture/rules/*.yaml (87 machine-readable rules)│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  tools/architecture/validate.ts                             │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐  │
│  │YAML Loader │ │File Scanner ││Rule Engine │ │Reporter  │  │
│  └───────────┘ └──────────┘ └────────────┘ └───────────┘  │
│     ● import-check    ● content-check  ● regex-check       │
│     ● file-location   ● file-exists    ● implements-check  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ .husky/      │ │ docs/    │ │ Console      │
│ pre-commit   │ │ generated│ │ Output       │
│ pre-push     │ │ *.md,mmd │ │ + Exit Code  │
└──────────────┘ └──────────┘ └──────────────┘
```

### Enforcement Gates

| Gate           | Trigger              | Scope                     | Fail On                    | Report Generated |
| -------------- | -------------------- | ------------------------- | -------------------------- | ---------------- |
| **Pre-commit** | `git commit`         | Changed/staged files only | Critical violations        | No               |
| **Pre-push**   | `git push`           | Full codebase             | Critical + High violations | Yes              |
| **Manual**     | `pnpm validate:arch` | Full codebase             | Critical + High violations | Yes              |

### Validation Types

Each YAML rule specifies one of six validation types:

| Type               | Description                               | Example Rule                                           |
| ------------------ | ----------------------------------------- | ------------------------------------------------------ |
| `import-check`     | Checks imports against forbidden patterns | DDD-001: domain must not import infrastructure         |
| `file-location`    | Verifies files are in correct directories | DDD-004: entities must be in domain/entities/          |
| `content-check`    | Verifies files contain required patterns  | DDD-008: entities must have UUID identity field        |
| `regex-check`      | Validates import statements against regex | IMP-001: imports must end with .js                     |
| `file-exists`      | Checks for forbidden files                | IMP-002: no index.ts barrel exports                    |
| `implements-check` | Verifies classes implement interfaces     | DDD-003: repositories must implement domain interfaces |

## Consequences

### Positive

- **Immediate feedback** — violations caught at commit/push time, not during review
- **Measurable architecture health** — governance score tracks improvement/regression over time
- **Tool-independent** — rules are machine-readable YAML, validator is standalone TypeScript
- **CI-ready** — exit codes 0/1 integrate with any CI pipeline
- **Self-documenting** — dependency graph and governance report auto-generated on each run
- **Gradual adoption** — light mode (pre-commit) allows warnings without blocking; pre-push enforces

### Negative

- **Initial noise** — 38 critical violations found on first run (primarily test files importing in-memory stores)
- **Maintenance burden** — rules must be updated when new modules or patterns are introduced
- **Pre-commit latency** — ~1s added to commit time for light validation

### Mitigations

- Test infrastructure imports have been flagged as known tech debt (see technical-debt-report.md)
- Rules are YAML — non-developers can add/modify rules without touching TypeScript
- Light mode (`--light --changed`) only checks staged files and critical violations, keeping latency ~200ms

## Alternatives Considered

| Alternative                              | Reason for Rejection                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| **ESLint plugin**                        | Cannot express DDD layer rules, directory structure, or file existence checks             |
| **Python script**                        | Would require separate toolchain; TypeScript validator reuses existing tsx infrastructure |
| **Shell script**                         | Too limited for complex import analysis and dependency graph generation                   |
| **Third-party tool (e.g., Structurizr)** | External dependency; cannot enforce custom DDD rules specific to Xennic                   |
| **In-code annotations**                  | Requires modifying every source file; YAML rules are independent of source code           |

## Migration

1. **Install** — `js-yaml` and `@types/js-yaml` added as root dev dependencies
2. **First run** — `pnpm validate:arch` generates baseline report; 38 critical violations expected (all test-related)
3. **Tech debt resolution** — Test infrastructure imports should be refactored to use dependency injection instead of direct imports
4. **Rule updates** — Add new YAML files in `tools/architecture/rules/` as architecture evolves
5. **Hook activation** — Existing `.husky/pre-commit` updated; `.husky/pre-push` created

## References

- `tools/architecture/rules/*.yaml` — 87 machine-readable architecture rules
- `tools/architecture/validate.ts` — TypeScript validator engine
- `docs/generated/governance-report.md` — Auto-generated governance score
- `docs/generated/module-dependency-graph.md` — Auto-generated dependency graph
- `.husky/pre-commit` — Light validation hook
- `.husky/pre-push` — Full validation hook
- `package.json` — `pnpm validate:arch` script
- `ADR-019-bootstrap-enforcement.md` — Prior bootstrap enforcement layer
- `docs/PROJECT_BOOTSTRAP.md` — Bootstrap document (updated to include validator)
- `docs/technical-debt-report.md` — Known tech debt (including test infra imports)

---

_ADR-020 accepted: 2026-07-06_
_Enforced by: Architecture Governance Automation Layer_
