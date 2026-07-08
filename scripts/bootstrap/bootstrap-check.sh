#!/usr/bin/env bash
# =============================================================================
# Xennic — Bootstrap Governance Validator
#
# Validates that all required governance artifacts exist and are consistent.
# Exit code: 0 = valid, 1 = invalid
#
# Usage:
#   ./scripts/bootstrap/bootstrap-check.sh
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
}

print_fail() {
    echo -e "  ${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

print_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

echo ""
echo "============================================"
echo " Xennic — Bootstrap Governance Validator"
echo "============================================"
echo ""

# ---------------------------------------------------------------------------
# 1. Mandatory Documents
# ---------------------------------------------------------------------------
echo "--- Mandatory Governance Documents ---"

if [ -f "$ROOT_DIR/docs/PROJECT_BOOTSTRAP.md" ]; then
    print_pass "PROJECT_BOOTSTRAP.md exists"
    BOOTSTRAP_LINES=$(wc -l < "$ROOT_DIR/docs/PROJECT_BOOTSTRAP.md")
    if [ "$BOOTSTRAP_LINES" -ge 1500 ]; then
        print_pass "  → $BOOTSTRAP_LINES lines (≥1500 threshold)"
    else
        print_warn "  → $BOOTSTRAP_LINES lines (<1500 threshold)"
    fi
else
    print_fail "PROJECT_BOOTSTRAP.md MISSING"
fi

if [ -f "$ROOT_DIR/docs/AI_SESSION_CONTRACT.md" ]; then
    print_pass "AI_SESSION_CONTRACT.md exists"
else
    print_fail "AI_SESSION_CONTRACT.md MISSING"
fi

if [ -f "$ROOT_DIR/docs/STATUS_REPORT.md" ]; then
    print_pass "STATUS_REPORT.md exists"
else
    print_fail "STATUS_REPORT.md MISSING"
fi

if [ -f "$ROOT_DIR/docs/critical-path.md" ]; then
    print_pass "critical-path.md exists"
else
    print_fail "critical-path.md MISSING"
fi

if [ -f "$ROOT_DIR/AGENTS.md" ]; then
    print_pass "AGENTS.md exists"
else
    print_fail "AGENTS.md MISSING"
fi

if [ -f "$ROOT_DIR/docs/readiness-score.md" ]; then
    print_pass "readiness-score.md exists"
else
    print_fail "readiness-score.md MISSING"
fi

if [ -f "$ROOT_DIR/docs/technical-debt-report.md" ]; then
    print_pass "technical-debt-report.md exists"
else
    print_fail "technical-debt-report.md MISSING"
fi

echo ""

# ---------------------------------------------------------------------------
# 2. Bootstrap Cross-References
# ---------------------------------------------------------------------------
echo "--- Cross-Reference Validation ---"

# Check AGENTS.md references bootstrap
if grep -q "PROJECT_BOOTSTRAP" "$ROOT_DIR/AGENTS.md" 2>/dev/null; then
    print_pass "AGENTS.md references PROJECT_BOOTSTRAP.md"
else
    print_fail "AGENTS.md does NOT reference PROJECT_BOOTSTRAP.md"
fi

# Check STATUS_REPORT.md references bootstrap
if grep -q "PROJECT_BOOTSTRAP" "$ROOT_DIR/docs/STATUS_REPORT.md" 2>/dev/null; then
    print_pass "STATUS_REPORT.md references PROJECT_BOOTSTRAP.md"
else
    print_fail "STATUS_REPORT.md does NOT reference PROJECT_BOOTSTRAP.md"
fi

# Check critical-path.md references bootstrap
if grep -q "PROJECT_BOOTSTRAP" "$ROOT_DIR/docs/critical-path.md" 2>/dev/null; then
    print_pass "critical-path.md references PROJECT_BOOTSTRAP.md"
else
    print_fail "critical-path.md does NOT reference PROJECT_BOOTSTRAP.md"
fi

# Check AI_SESSION_CONTRACT references bootstrap (if exists)
if [ -f "$ROOT_DIR/docs/AI_SESSION_CONTRACT.md" ]; then
    print_pass "AI_SESSION_CONTRACT.md exists (references checked manually)"
fi

echo ""

# ---------------------------------------------------------------------------
# 3. ADR Index
# ---------------------------------------------------------------------------
echo "--- Architecture Decision Records ---"

ADR_COUNT=$(find "$ROOT_DIR/docs/adr" -name "*.md" 2>/dev/null | wc -l)
if [ "$ADR_COUNT" -ge 9 ]; then
    print_pass "$ADR_COUNT ADR files found (≥9 expected)"
else
    print_warn "$ADR_COUNT ADR files found (<9 expected)"
fi

# Check specific required ADRs
for adr in "ADR-011-knowledge-factory" "ADR-012-knowledge-intelligence-layer" "017-enterprise-intelligence-platform" "018-enterprise-orchestration-platform" "019-bootstrap-enforcement"; do
    if ls "$ROOT_DIR/docs/adr/"*"$adr"*".md" 1>/dev/null 2>&1; then
        print_pass "ADR matching '$adr' found"
    else
        print_fail "ADR matching '$adr' NOT found"
    fi
done

echo ""

# ---------------------------------------------------------------------------
# 4. Bootstrap Script
# ---------------------------------------------------------------------------
echo "--- Bootstrap Validator ---"

if [ -f "$ROOT_DIR/scripts/bootstrap/bootstrap-check.sh" ]; then
    print_pass "bootstrap-check.sh exists"
    if [ -x "$ROOT_DIR/scripts/bootstrap/bootstrap-check.sh" ]; then
        print_pass "bootstrap-check.sh is executable"
    else
        print_warn "bootstrap-check.sh is NOT executable (run: chmod +x)"
    fi
else
    print_fail "bootstrap-check.sh MISSING"
fi

echo ""

# ---------------------------------------------------------------------------
# 5. Bootstrap Version Validation
# ---------------------------------------------------------------------------
echo "--- Bootstrap Version ---"

if grep -q "Bootstrap Version" "$ROOT_DIR/docs/PROJECT_BOOTSTRAP.md" 2>/dev/null; then
    print_pass "Bootstrap Version section found in PROJECT_BOOTSTRAP.md"
else
    print_fail "Bootstrap Version section MISSING from PROJECT_BOOTSTRAP.md"
fi

echo ""

# ---------------------------------------------------------------------------
# 6. Bootstrap Top-Level Sections
# ---------------------------------------------------------------------------
echo "--- Bootstrap Section Completeness ---"

EXPECTED_SECTIONS=(
    "Executive Summary"
    "Architecture Overview"
    "Module Registry"
    "Sprint History"
    "Current Readiness"
    "Critical Technical Debt"
    "Coding Standards"
    "Development Rules"
    "Runtime Topology"
    "Database Overview"
    "Event Topology"
    "AI Infrastructure"
    "Deployment Topology"
    "Roadmap"
    "AI Startup Checklist"
    "Bootstrap Version"
)

for section in "${EXPECTED_SECTIONS[@]}"; do
    if grep -q "## [0-9]*\. $section" "$ROOT_DIR/docs/PROJECT_BOOTSTRAP.md" 2>/dev/null; then
        print_pass "Section '$section' found"
    else
        print_fail "Section '$section' MISSING"
    fi
done

# Count Mermaid diagrams
MERMAID_COUNT=$(grep -c '```mermaid' "$ROOT_DIR/docs/PROJECT_BOOTSTRAP.md" 2>/dev/null || echo 0)
if [ "$MERMAID_COUNT" -ge 10 ]; then
    print_pass "$MERMAID_COUNT Mermaid diagrams found (≥10 threshold)"
else
    print_warn "$MERMAID_COUNT Mermaid diagrams found (<10 threshold)"
fi

echo ""

# ---------------------------------------------------------------------------
# 7. AI Startup Flow Diagram
# ---------------------------------------------------------------------------
echo "--- AI Startup Flow ---"

if grep -q "AI Startup Flow" "$ROOT_DIR/docs/PROJECT_BOOTSTRAP.md" 2>/dev/null; then
    print_pass "AI Startup Flow diagram exists"
else
    print_warn "AI Startup Flow diagram NOT found"
fi

echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo "============================================"
echo " Validation Summary"
echo "============================================"
echo "  Errors:   $ERRORS"
echo "  Warnings: $WARNINGS"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    echo -e "  ${RED}✗ VALIDATION FAILED${NC} — Fix errors before proceeding."
    echo ""
    exit 1
else
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "  ${YELLOW}⚠ VALIDATION PASSED WITH WARNINGS${NC}"
    else
        echo -e "  ${GREEN}✓ VALIDATION PASSED${NC}"
    fi
    echo "  Bootstrap governance artifacts are complete and consistent."
    echo ""
    exit 0
fi
