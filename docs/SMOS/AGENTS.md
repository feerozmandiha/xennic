# AGENTS.md — SMOS

## What Is This

**SMOS** (Social Media Operating System) is a **documentation-only** sub-project of the [Xennic](../) monorepo. It contains 270 markdown files (~176K lines, ~8MB) defining the complete architecture for an enterprise social media management system. **There is no source code, no build system, no tests, no CI, no `package.json`.**

Location: `xennic/docs/social-media/`

## Key Facts for Agents

- **Language**: Bilingual — Persian body, English headers/identifiers
- **No build/test/lint commands exist** — this is a pure documentation repo
- **SSOT discipline**: Every topic has exactly one authoritative document. Never create duplicate content.
- **All docs are `.md`** — no JSON, no images, no code files inside `docs/`
- **47 sprint reports** (`.txt`) at root are historical; don't modify them

## Directory Structure

```
docs/
├── 00-ARCHITECTURE/     System architecture (14 docs) — START HERE
├── 05-CONSTITUTION/     SMOS Constitution (CON-000)
├── 10-GOVERNANCE/       Standards: naming, versioning, cross-refs, metadata (GOV-001..005)
├── 15-DEPLOY/           Deployment strategy (DEPLOY-001)
├── 20-PLATFORMS/        Platform playbooks (PLAT-000..007) — 7 social platforms
├── 22-BRAND/            Brand identity + voice (BRD-001..002)
├── 24-EDITORIAL/        Content guidelines + taxonomy (EDT-001..002)
├── 30-AUTOMATION/       Automation index (AUT-001)
├── 35-PROMPTS/          Prompt library (117 docs: PRM-101..907)
├── 40-AI-AGENTS/        AI agent specs (15 docs: AI-000..014)
├── 50-AUTOMATION/       Automation architecture (AUT-000)
├── 60-PROMPTS/          Prompt architecture + index (PRM-000..001)
├── 70-KNOWLEDGE/        Knowledge architecture (37 docs: KNW-000..801)
├── 75-EXECUTION/        Execution architecture (38 docs: SMOS-701..738)
├── 80-COMMUNICATION/    Communication architecture (5 docs: COM-001..005)
├── 90-RUNTIME/          Runtime architecture (7 docs: RT-001..007)
├── 90-AUDIT/            Audit reports (2 docs)
└── 95-CONTENT-OPERATIONS/  Operations playbooks (10 docs: OPS-000..018)
```

13 empty placeholder dirs exist for future content (26-ASSETS, 45-KNOWLEDGE, 50-OPERATIONS, etc.)

## Document ID System

Every document has a unique `PREFIX-NUMBER` ID in its metadata header:

| Prefix  | Family             | Count | Mother Doc |
| ------- | ------------------ | ----- | ---------- |
| CON-    | Constitution       | 1     | CON-000    |
| ARCH-   | Architecture       | 14    | ARCH-001   |
| GOV-    | Governance         | 5     | —          |
| DEPLOY- | Deployment         | 1     | DEPLOY-001 |
| PLAT-   | Platform Playbooks | 8     | PLAT-000   |
| BRD-    | Brand              | 2     | BRD-001    |
| EDT-    | Editorial          | 2     | EDT-001    |
| AUT-    | Automation         | 2     | AUT-000    |
| PRM-    | Prompts            | 119   | PRM-000    |
| AI-     | AI Agents          | 15    | AI-000     |
| KNW-    | Knowledge          | 37    | KNW-000    |
| SMOS-   | Execution          | 38    | SMOS-701   |
| COM-    | Communication      | 5     | COM-001    |
| RT-     | Runtime            | 7     | RT-001     |
| OPS-    | Operations         | 10    | OPS-000    |

## Standard Document Header

```markdown
# Title — عنوان

> **شناسه:** PREFIX-NNN
> **وضعیت:** پیش‌نویس / منتشرشده
> **نسخه:** X.Y.Z-draft
> **به‌روزرسانی:** YYYY-MM-DD
> **مسئول:** <Owner Role>
> **وابستگی:** [ID1](path), [ID2](path), ...
> **مخاطب:** human, ai-agent, mcp, workflow-engine
```

## How to Navigate (Read Order)

1. **`docs/00-ARCHITECTURE/01-system-overview.md`** (ARCH-001) — entry point to all of SMOS
2. **`docs/00-ARCHITECTURE/30-governance-architecture.md`** — governance, ownership, RACI
3. **`docs/00-ARCHITECTURE/10-meta-architecture.md`** — layers and hierarchy
4. **`docs/00-ARCHITECTURE/11-object-model.md`** — object model and lifecycles

## Rules

1. **Read ARCH-001 first** before any work — it's the gateway to SMOS
2. **Read `docs/10-GOVERNANCE/`** before creating or editing any document (GOV-001 standards, GOV-002 versioning, GOV-003 naming, GOV-004 cross-refs, GOV-005 metadata)
3. **Never duplicate** — every topic has one SSOT. Cross-reference instead of copying.
4. **Separate strategic (evergreen) from operational (frequently updated) docs**
5. **Before creating AI-NNN**: read `docs/40-AI-AGENTS/00-enterprise-ai-agent-architecture.md` (AI-000)
6. **Before creating PRM-NNN**: read `docs/60-PROMPTS/00-enterprise-prompt-architecture.md` (PRM-000)
7. **Before creating KNW-NNN**: read `docs/70-KNOWLEDGE/00-enterprise-knowledge-architecture.md` (KNW-000)
8. **Machine Readable blocks**: Architecture docs (KNW, AI, AUT, PRM, COM) contain 6 JSON blocks + 3 JSON Schema (Draft-07) — preserve these exactly
9. **Architecture-neutral**: KNW-2xx and RT docs are Platform Neutral, Implementation Free, Vendor Neutral — never add code, APIs, or vendor-specific content

## Master Documents (SSOT for Each Family)

| Document | Path                                                          | Role                                |
| -------- | ------------------------------------------------------------- | ----------------------------------- |
| CON-000  | `docs/05-CONSTITUTION/`                                       | SMOS Constitution (133 principles)  |
| ARCH-001 | `docs/00-ARCHITECTURE/01-system-overview.md`                  | System overview — **read first**    |
| AI-000   | `docs/40-AI-AGENTS/00-enterprise-ai-agent-architecture.md`    | All AI agents derive from this      |
| AUT-000  | `docs/50-AUTOMATION/00-enterprise-automation-architecture.md` | Automation architecture             |
| PRM-000  | `docs/60-PROMPTS/00-enterprise-prompt-architecture.md`        | All prompts derive from this        |
| KNW-000  | `docs/70-KNOWLEDGE/00-enterprise-knowledge-architecture.md`   | Knowledge architecture              |
| PLAT-000 | `docs/20-PLATFORMS/00-platform-playbook-standard.md`          | Template for all platform playbooks |

## Current Status

- **Phase**: P11.S01 (Content Operations Playbooks) — all planned architecture complete
- **Architecture readiness**: 92/100 (per AUDIT-P10-S01)
- **270 docs** across 16 families, 176K lines, ~8MB
- **Next planned**: P10.S02 (Runtime SDK), P10.S03 (Enterprise API), P11.S02 (Ops Refinement)

## Sprint History

47 sprint reports (`P1-S1-REPORT.txt` through `P11-S01-REPORT.txt`) at repo root. Phases P0–P11 covered: Constitution → Vocabulary → Governance → Platforms → Brand → Prompts → Knowledge → Execution → Runtime → Audit → Operations. All sprints complete; none blocked.
