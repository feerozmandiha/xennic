# Xennic — Sprint Governance Model

> **Effective:** Program start through delivery  
> **Cadence:** 2-week sprints  
> **Status:** Active

---

## 1. Sprint Planning

| Attribute | Detail |
|-----------|--------|
| **When** | Last day of the current sprint (after Sprint Review & Retro) |
| **Duration** | 2 hours maximum |
| **Attendees** | All engineers, Product Manager, Tech Lead |

### Agenda

1. **Review master backlog priority order** — PM presents the prioritised backlog; any reordering is agreed upon as a group.
2. **Definition of Ready (DoR) check** — Each candidate item is verified against the DoR:
   - Acceptance criteria written and reviewed
   - Dependencies identified
   - UI/UX designs approved (if applicable)
   - Estimated at the story level (T-shirt size)
3. **Pull items into sprint** — Items that pass DoR are selected up to the team's historical capacity.
4. **Assign owners** — Every item is assigned a primary owner.
5. **Task breakdown** — Each story is decomposed into tasks of **4–16 hours**.
6. **Estimate sprint capacity** — Compare planned hours against historical velocity; adjust if needed.
7. **Identify dependencies & risks** — Cross-team and intra-sprint dependencies are logged; risks are added to the risk register.

### Outputs

- **Sprint backlog** — updated in the project management tool
- **Sprint goal** — one-sentence objective (see §8 for template)
- **Capacity chart** — planned vs. available hours

---

## 2. Daily Standup

| Attribute | Detail |
|-----------|--------|
| **When** | Every working day, 9:00 AM (local) |
| **Duration** | 15 minutes maximum |
| **Format** | Async option available for remote/distributed team members |

### Standard Format

Each participant answers:

1. **What I did yesterday** (toward sprint goal)
2. **What I'll do today** (next steps)
3. **Blockers** — anything slowing or stopping progress

### Blocker Management

- Every blocker **must** be assigned an owner and an **expected resolution time** during standup.
- If no resolution time can be estimated, the blocker is **immediately escalated**:

```
Blocker → Owner named → ETA set
        ↘ No ETA → Escalate to Tech Lead
                  ↘ Tech Lead cannot resolve → Escalate to PM
                                                  ↘ PM cannot resolve → Escalate to Program Director
```

- All blockers and their resolution status are recorded in the **Blocker Log** (see §8).

---

## 3. Sprint Review

| Attribute | Detail |
|-----------|--------|
| **When** | Last day of the sprint |
| **Duration** | 1 hour maximum |
| **Attendees** | All engineers, PM, Tech Lead; stakeholders optional |

### Agenda

1. **Demo working features** — Owners demonstrate completed items against acceptance criteria.
2. **Definition of Done (DoD) completeness** — Each item is verified:
   - Code reviewed and merged
   - Unit/integration tests passing
   - API docs updated (if applicable)
   - Swagger/OpenAPI regenerated (if applicable)
   - Deployed to staging environment
   - Acceptance criteria satisfied
3. **Update master registry** — The master delivery registry is updated with the current status of every item.
4. **Stakeholder feedback** — Optional: stakeholders share feedback on delivered functionality.

### Outputs

- Verified Done items per sprint
- Updated master delivery registry
- Feedback log (actioned in next sprint planning)

---

## 4. Sprint Retrospective

| Attribute | Detail |
|-----------|--------|
| **When** | Immediately after Sprint Review |
| **Duration** | 1 hour maximum |
| **Format** | Start-Stop-Continue or 4L (Liked, Learned, Lacked, Longed For) |

### Structure

1. **What went well** — celebrate wins, identify patterns to continue
2. **What went wrong** — surface problems without blame
3. **What to improve** — concrete, actionable improvements

### Action Tracking

| ID | Action | Owner | Sprint Created | Target Sprint | Status |
|----|--------|-------|----------------|---------------|--------|
| R-001 | Add linter to CI pipeline | DevOps | S1 | S2 | ✅ Done |
| R-002 | Improve test data fixtures | BE | S1 | S3 | 🔄 In Progress |
| R-003 | Schedule ADR sync session | TL | S2 | S2 | ⏳ Open |

- Action items are reviewed at the start of each retrospective for status updates.
- Incomplete actions are re-prioritised or closed with rationale.

---

## 5. Architecture Review

| Attribute | Detail |
|-----------|--------|
| **When** | Weekly, mid-sprint |
| **Duration** | 30 minutes |
| **Attendees** | Tech Lead, senior/principal engineers |

### Agenda

1. **In-progress implementation review** — Verify alignment with the architecture blueprint and ADRs.
2. **New RFC review** — Technical proposals are reviewed; feedback is consolidated.
3. **ADR status update** — Architecture Decision Records are reviewed and updated if the decision has changed.
4. **Architecture score trend** — Track a simple metric (e.g., 1–5) for overall architecture health.

### Architecture Score Criteria

| Score | Meaning |
|-------|---------|
| 5 | Fully aligned — no deviations |
| 4 | Minor deviations with documented rationale |
| 3 | Significant deviation — mitigation planned |
| 2 | Major deviation — RFC required |
| 1 | Architecture breach — escalation needed |

---

## 6. Risk Review

| Attribute | Detail |
|-----------|--------|
| **When** | Biweekly (every other sprint), 30 minutes |
| **Attendees** | Tech Lead, Product Manager |

### Agenda

1. **Review risk register** — Walk through all open risks.
2. **Update risk status**:
   - **New risks** — add with initial likelihood & impact
   - **Resolved risks** — close with resolution notes
   - **Changing risks** — update likelihood, impact, or mitigation plan
3. **Escalate critical risks** — Any risk with likelihood × impact ≥ 15 (on a 5×5 matrix) is escalated to program management.

### Risk Matrix

| Likelihood ↓ \ Impact → | 1 (Minimal) | 2 (Minor) | 3 (Moderate) | 4 (Significant) | 5 (Severe) |
|--------------------------|-------------|-----------|--------------|------------------|-------------|
| **5 (Almost Certain)**   | 5           | 10        | 15           | 20               | 25          |
| **4 (Likely)**           | 4           | 8         | 12           | 16               | 20          |
| **3 (Possible)**         | 3           | 6         | 9            | 12               | 15          |
| **2 (Unlikely)**         | 2           | 4         | 6            | 8                | 10          |
| **1 (Rare)**             | 1           | 2         | 3            | 4                | 5            |

> **Critical threshold:** ≥ 15 (shaded cells) → escalate to management.

---

## 7. Sprint Cadence Diagram

```
                    SPRINT N (2 WEEKS)
    ┌──────────────────────────────────────────────────────┐
    │                                                      │
    │   Day 1              Days 2–9          Day 10        │
    │   ┌──────┐  ┌──────────────────┐  ┌──────────────┐  │
    │   │Sprint│  │   Development    │  │  Sprint      │  │
    │   │Plan- │  │   ┌──────────┐   │  │  Review      │  │
    │   │ning  │  │   │Daily     │   │  │  + Demo      │  │
    │   │      │  │   │Standup   │   │  │              │  │
    │   │      │  │   │(15 min)  │   │  │  Sprint      │  │
    │   │(2h)  │  │   └──────────┘   │  │  Retro       │  │
    │   │      │  │                  │  │              │  │
    │   │      │  │  ┌────────────┐  │  │  (1h + 1h)   │  │
    │   │      │  │  │Arch Review │  │  │              │  │
    │   │      │  │  │(30 min,    │  │  │  → Sprint    │  │
    │   │      │  │  │ mid-week)  │  │  │    N+1       │  │
    │   │      │  │  └────────────┘  │  │    Planning  │  │
    │   └──────┘  └──────────────────┘  └──────────────┘  │
    │                                                      │
    │  Risk Review (biweekly, 30 min) — alternates sprints │
    │                                                      │
    └──────────────────────────────────────────────────────┘
```

**Weekly ceremonies within the sprint:**
- **Mon–Fri:** Daily Standup (15 min)
- **Mid-sprint (e.g., Wed):** Architecture Review (30 min)
- **Alternating sprints:** Risk Review (30 min)

---

## 8. Artifacts

### Sprint Backlog Template

```
| ID | Story | Owner | Status | Tasks | Est. Hours | Remaining | Dependencies |
|----|-------|-------|--------|-------|------------|-----------|--------------|
|    |       |       |        |       |            |           |              |
```

**Status values:** `🆕 New` → `📋 In Progress` → `🔍 In Review` → `✅ Done` → `🚫 Blocked`

---

### Sprint Goal Template

```
Sprint [N] — Goal: [One-sentence objective]

Key Results:
- [Measurable result 1]
- [Measurable result 2]
- [Measurable result 3]

Scope:
- [Story 1]
- [Story 2]
- [Story 3]

Exclusions (stretch):
- [Nice-to-have items if capacity allows]
```

---

### Risk Register Template

```
| ID | Risk Description | Category | Likelihood (1–5) | Impact (1–5) | Score | Mitigation | Owner | Status | Escalated |
|----|------------------|----------|------------------|--------------|-------|------------|-------|--------|-----------|
|    |                  |          |                  |              |       |            |       |        |           |
```

**Status values:** `🆕 Open` / `📉 Mitigating` / `✅ Resolved` / `📌 Accepted`

---

### Blocker Log Template

```
| ID | Description | Story ID | Reported By | Date | Owner | ETA | Resolution | Status |
|----|-------------|----------|-------------|------|-------|-----|------------|--------|
|    |             |          |             |      |       |     |            |        |
```

**Status values:** `🆕 Open` / `🔄 Escalated` / `✅ Resolved`

---

## 9. Roles & Responsibilities

| Role | Key Responsibilities |
|------|---------------------|
| **Tech Lead** | Architecture decisions, code review standards, technical guidance, ADR authorship, RFC approval, architecture score tracking, risk register maintenance, tech debt prioritisation |
| **Backend Engineer** | Feature implementation (NestJS/Postgres), unit/integration tests, API documentation, code review participation, task breakdown, sprint commitment |
| **AI/ML Engineer** | AI pipeline implementation (ai-service), model evaluation, data pipeline coordination, integration with vision/engineering services |
| **DevOps Engineer** | Infrastructure (Docker/K8s), CI/CD pipeline, monitoring & alerting, secret management, database migrations support, environment management |
| **Product Manager** | Backlog prioritisation, stakeholder communication, acceptance criteria sign-off, DoR/DoD gatekeeping, sprint goal definition, feedback collection, risk escalation |
| **QA Engineer** | Test planning, manual/automated verification, regression testing, non-functional testing (if available), sign-off on DoD |

### RACI Matrix

| Activity | TL | BE | AI | DE | PM | QA |
|----------|----|----|----|----|----|----|
| Sprint Planning | A | R | R | R | R | C |
| Daily Standup | A | R | R | R | C | R |
| Sprint Review | A | R | R | R | R | C |
| Retrospective | A | R | R | R | R | R |
| Architecture Review | R | C | C | C | I | - |
| Risk Review | R | C | C | C | R | - |
| Backlog Refinement | C | C | C | C | R | C |
| Code Review | A | R | R | R | - | - |
| ADR Creation | A | C | C | C | - | - |

**Key:** R = Responsible, A = Accountable, C = Consulted, I = Informed

---

*Document owner: Tech Lead · Review cadence: Every 4 sprints or when process changes*
