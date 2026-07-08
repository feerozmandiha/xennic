# Version Policy

## 1. Semantic Versioning (SemVer)

All Xennic packages follow **Semantic Versioning 2.0.0**: `MAJOR.MINOR.PATCH`

- **MAJOR** — Breaking changes (API, database schema breaking, module removal)
- **MINOR** — New features (non-breaking additions, new modules, new capabilities)
- **PATCH** — Bug fixes (non-breaking corrections, security patches, documentation)

### Pre-release Suffixes

| Suffix | Meaning | Example |
|--------|---------|---------|
| `-alpha.N` | Early development, unstable | `1.0.0-alpha.1` |
| `-beta.N` | Feature-complete, testing | `1.0.0-beta.2` |
| `-rc.N` | Release candidate | `1.0.0-rc.3` |

## 2. ADR Numbering

- Format: `ADR-NNN-title-with-dashes.md`
- Sequential within major version: MAJOR * 1000 + sequential
- Example: `ADR-020-architecture-governance-automation.md` (MAJOR 0, ADR #20)
- New ADRs always get the next available number in the sequence
- Each ADR includes a `Version` field in its metadata table

## 3. Bootstrap Versioning

The project bootstrap version (`PROJECT_BOOTSTRAP.md`) follows:

```
MAJOR.MINOR.PATCH
```

Rules:
- **MAJOR** — Bumped when the bootstrap process is restructured
- **MINOR** — Bumped when new requirements are added to the bootstrap
- **PATCH** — Bumped on corrections, clarifications, or documentation updates

Current: `1.2.0`

## 4. Architecture Validator Versioning

The architecture validator (`tools/architecture/validate.ts`) is versioned
in lockstep with the bootstrap version.

The version is declared in `rules/_meta.yaml` or derived from the bootstrap
version during validation.

Validator version changes:
- **MAJOR** — Breaking rule syntax changes
- **MINOR** — New rule categories, new validation types
- **PATCH** — Rule fixes, exclusion updates, autofix improvements

## 5. Release Numbering

Release numbering follows:

```
v<MAJOR>.<MINOR>.<PATCH>-<BUILD>
```

Where:
- `MAJOR.MINOR.PATCH` matches the bootstrap version
- `BUILD` is the incremental CI build number (GitHub run number)

Each release produces:
- Git tag: `v1.2.0-42`
- Release manifest: `docs/generated/release-manifest.json`
- Build certification: `docs/generated/build-certification.md`

### Sprint Numbering

- Sprints use format `Sprint <Letter><Number>` (e.g., `Sprint I1`, `Sprint K4`, `Sprint G1`)
- Internal phases use format `Phase <Number>` (e.g., `Phase 1` through `Phase 8`)

## 6. Migration Numbering

Database migrations use timestamp-based naming:

```
YYYYMMDDHHMMSS_description
```

Rules:
- Timestamp must be UTC
- Description is kebab-case
- Migrations are applied in chronological order
- No retroactive migration editing after creation

## 7. Compatibility Matrix

| Component | Bootstrap Compat | ADR Compat | Notes |
|-----------|----------------|------------|-------|
| Architecture Validator | Same MAJOR.MINOR | Any | Patch may differ |
| API Module | Same MAJOR | Any | MINOR must be ≥ |
| Python Service | Same MAJOR | Any | Independent version |
| OpenAPI Spec | Same MAJOR | Any | Regenerated on MINOR bump |
| Database Schema | Same MAJOR | Any | Migrations forward-only |

## 8. Version Governance

- Version bumps require ADR documentation for MAJOR changes
- MINOR bumps require STATUS_REPORT.md update
- PATCH bumps only require changelog entry
- Release gate (`.github/workflows/release-gate.yml`) enforces version consistency
- Release validator verifies bootstrap version across all components
