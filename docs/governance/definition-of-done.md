# Definition of Done (DoD) — Xennic Platform

> Every dimension must have **all** criteria met before an item is considered done.

---

## 1. Code

- [ ] All acceptance criteria met
- [ ] Code reviewed by at least 1 peer
- [ ] No commented-out code
- [ ] No debug logging
- [ ] Follows existing patterns (DDD, DI, etc.)
- [ ] No lint errors
- [ ] No TypeScript errors (strict mode)
- [ ] Dead imports removed

## 2. Tests

- [ ] Unit tests for all new code (≥80% coverage for changed lines)
- [ ] Existing tests still pass
- [ ] Edge cases tested (null, empty, error states)
- [ ] Integration tests for critical paths (if applicable)
- [ ] Test setup/teardown properly handles state

## 3. Security

- [ ] No secrets committed
- [ ] Input validation on all new endpoints
- [ ] Auth guards on all new controllers
- [ ] Workspace isolation verified for multi-tenant endpoints
- [ ] No SQL injection (Prisma parameterized queries)
- [ ] No SSRF (URL validation on external calls)
- [ ] No prompt injection (input sanitization for AI prompts)

## 4. Performance

- [ ] No N+1 queries in changed code
- [ ] SELECT \* replaced with selective field selection
- [ ] Pagination on list endpoints
- [ ] No synchronous I/O in async context
- [ ] Caching considered for frequently accessed data

## 5. Documentation

- [ ] OpenAPI spec regenerated (if API changed)
- [ ] JSDoc for public APIs (or Python docstrings)
- [ ] Changelog entry
- [ ] .env.example updated (if new env vars added)
- [ ] ADR updated or created (if architecture changed)

## 6. Architecture

- [ ] DDD layers respected (no infrastructure imports in application)
- [ ] No circular dependencies
- [ ] Interface-based DI for new services
- [ ] Module boundaries respected

## 7. Telemetry

- [ ] Key operations logged (structured Logger, not console.log)
- [ ] Errors logged with context
- [ ] Metrics considered for monitoring

## 8. Observability

- [ ] Health check endpoint updated (if new service dependency)
- [ ] Readiness probe compatible
- [ ] Graceful degradation on upstream failure

## 9. Rollback

- [ ] Rollback strategy documented
- [ ] Migration reversible (if DB change)
- [ ] Feature flag considered for risky changes

---

## 10. DoD Sign-off

```markdown
### DoD Sign-off

| Role      | Name                         | Date         | Signature          |
| --------- | ---------------------------- | ------------ | ------------------ |
| Developer | **\*\*\*\***\_\_**\*\*\*\*** | **\_\_\_\_** | \***\*\_\_\_\*\*** |
| Reviewer  | **\*\*\*\***\_\_**\*\*\*\*** | **\_\_\_\_** | \***\*\_\_\_\*\*** |
| Tech Lead | **\*\*\*\***\_\_**\*\*\*\*** | **\_\_\_\_** | \***\*\_\_\_\*\*** |

> **Tech Lead sign-off required for P0/P1 items only.**
```

---

## DoD Exceptions

### Eligible exceptions

- **Hotfix deployed to production**: DoD must be fully completed within 2 business days post-deploy.
- **Experimental / spike branch**: DoD is waived. The branch must be clearly labelled `spike/` and must never be merged to main without a full DoD.

### Handling incomplete items

1. The item stays in the **In Progress** column — it is _not_ done.
2. The blocker is documented in the gap/ticket with a `dod-blocked` tag.
3. The Tech Lead triages the blocker:
   - If the blocker can be resolved within the current sprint, the item stays.
   - If not, the item is moved back to **Refinement** and re-estimated.
4. Items with unresolved DoD criteria must **never** be deployed to production.

### Partial sign-off

For large items where incremental value is delivered, the Tech Lead may approve a **partial DoD** for a specific deployable slice, provided:

- All **Security** criteria are met.
- All **Rollback** criteria are met.
- Remaining criteria are tracked as child gaps in the next sprint.
- The partial sign-off is explicitly noted in the DoD sign-off block with a justification.
