# Git History Purge — Secret Removal Procedure

**Version**: 1.0.0 | **Date**: Tir 1405 (2026-06)

---

## Overview

This document records the git filter-repo operation performed in Sprint A2.5 to purge hardcoded credentials from the repository's git history.

**DO NOT re-execute unless new secrets have been committed.**

---

## Secrets Purged

| Secret | Original Value | Replacement |
|--------|---------------|-------------|
| Postgres password | `xennic123` | `*_FROM_ENV` |
| Admin password | `Admin@12345` | `*_FROM_ENV` |
| MinIO credentials | `minioadmin` | `*_FROM_ENV` |
| Groq API key 1 | `gsk_V8fE...` | `*_FROM_ENV` |
| Groq API key 2 | `gsk_kT9S...` | `*_FROM_ENV` |
| Zarinpal merchant ID | `901cb7...` | `*_FROM_ENV` |
| Database URLs | `postgresql://xennic:xennic123@...` | `*_FROM_ENV` |

---

## Procedure Used

### Prerequisites

```bash
# Install git-filter-repo
pip install git-filter-repo

# Ensure clean working tree
git status  # should show nothing
```

### Step 1: Create replace-text file

Create `/tmp/secret-map.txt`:
```
xennic123==>*_FROM_ENV
Admin@12345==>*_FROM_ENV
minioadmin==>*_FROM_ENV
gsk_V8fE==>*_FROM_ENV
gsk_kT9S==>*_FROM_ENV
901cb7==>*_FROM_ENV
```

### Step 2: Execute filter-repo

```bash
git filter-repo --force --replace-text /tmp/secret-map.txt
```

This rewrites every commit in every branch, replacing all occurrences of the listed strings.

### Step 3: Verify no secrets remain

```bash
# Check for any remaining secrets in history
git log --all --oneline | head -20
git show --all | grep -i 'xennic123\|Admin@12345\|minioadmin\|gsk_' || echo "CLEAN"
```

### Step 4: Re-add remote and force push

```bash
git remote add origin git@github.com:ahmadkhalili-hub/xennic.git
git push origin --force --all
git push origin --force --tags
```

---

## Rotation Procedure

After purging secrets from git, ALL secrets must be rotated because they are now compromised:

1. **Database passwords**: Update `POSTGRES_PASSWORD` in `infrastructure/docker/.env` and re-deploy
2. **API keys**: Regenerate Groq, Zarinpal, and any other API keys at their respective providers
3. **JWT keys**: Generate new RSA key pair: `openssl genrsa -out jwt-private.key 2048`
4. **Redis password**: Generate new: `openssl rand -base64 18`
5. **MinIO credentials**: Update in `infrastructure/docker/.env` and re-deploy

Full details: `docs/operations/SECRETS_ROTATION.md`

---

## Repository Cleanup

After force push:

1. **All collaborators**: Rebase any work-in-progress branches on top of the cleaned history
2. **Clone fresh**: All developers should delete their local clones and re-clone
3. **CI/CD cache**: Clear GitHub Actions cache to prevent access to old commits
4. **GitHub**: Remove any cached artifacts that may contain secrets

```bash
# Collaborator recovery
git fetch origin
git checkout master
git rebase origin/master
# If rebase fails: git reset --hard origin/master
```

---

## Force Push Procedure

```bash
# After filter-repo completes:
git remote add origin <repository-url>
git push origin --force --all
git push origin --force --tags

# Verify on remote:
# - Check that commit count matches expected
# - Verify no old commits remain visible
```

---

## Collaborator Recovery

For developers who had the repository before the purge:

```bash
# Option 1: Fresh clone (recommended)
cd /tmp
git clone <repository-url> xennic-clean
cp -r xennic-clean ~/xennic

# Option 2: Rebase
cd ~/xennic
git fetch origin
git checkout master
git rebase origin/master
```

---

## Prevention

To prevent future credential leaks:

1. **Pre-commit hook**: `.git/hooks/pre-commit` scans for patterns like `password=`, `key=`, `secret=`
2. **GitHub secret scanning**: Enable in repository Settings → Security → Secret scanning
3. **`.env` files**: Already in `.gitignore`
4. **Docker Secrets**: All production secrets use `/run/secrets/` paths
5. **CI validation**: GitHub Actions workflow runs secret scan on PRs

---

## Related Documents

| Document | Path |
|----------|------|
| Secrets Rotation | `docs/operations/SECRETS_ROTATION.md` |
| Secret Remediation | `docs/security/SECRET_REMEDIATION_REPORT.md` |
| Secrets Management | `docs/security/Secrets.md` |
| Production Audit | `docs/project/PRODUCTION_READINESS_AUDIT.md` |
