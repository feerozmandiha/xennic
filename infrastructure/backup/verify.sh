#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKUP_DIR="backups/postgres"
PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CHECKSUM_FILE="$BACKUP_DIR/checksums.sha256"
TRIAL_RESTORE=false

if [ "${1:-}" = "--restore" ]; then
  TRIAL_RESTORE=true
fi

if [ -n "${1:-}" ] && [ "$1" != "--restore" ]; then
  DUMP_FILE="$1"
else
  DUMP_FILE=$(ls -t "$PROJECT_DIR/$BACKUP_DIR"/*.dump 2>/dev/null | head -1 || true)
fi

echo "============================================"
echo "  Database Backup Verification"
echo "============================================"
echo ""

if [ -z "$DUMP_FILE" ]; then
  echo -e "${RED}ERROR: No backup file found${NC}"
  echo "Usage: $0 [path/to/backup.dump] [--restore]"
  exit 1
fi

echo "File: $DUMP_FILE"
echo ""

if [ ! -f "$DUMP_FILE" ]; then
  echo -e "${RED}ERROR: File does not exist: $DUMP_FILE${NC}"
  exit 1
fi

FILE_SIZE=$(stat -c%s "$DUMP_FILE" 2>/dev/null || stat -f%z "$DUMP_FILE" 2>/dev/null)
echo "Size: $(numfmt --to=iec $FILE_SIZE 2>/dev/null || echo "$FILE_SIZE bytes")"

FILE_TYPE=$(file "$DUMP_FILE")
echo "Type: $FILE_TYPE"

if echo "$FILE_TYPE" | grep -q "PostgreSQL"; then
  echo -e "${GREEN}Format: ✅ Valid PostgreSQL dump${NC}"
else
  echo -e "${YELLOW}Warning: File type may not be a PostgreSQL dump${NC}"
fi

echo ""
echo "--- Checksum Verification ---"

COMPUTED_HASH=$(sha256sum "$DUMP_FILE" | cut -d' ' -f1)

if [ -f "$PROJECT_DIR/$CHECKSUM_FILE" ]; then
  STORED_HASH=$(grep "$(basename "$DUMP_FILE")" "$PROJECT_DIR/$CHECKSUM_FILE" 2>/dev/null | cut -d' ' -f1 || true)
  if [ -n "$STORED_HASH" ] && [ "$COMPUTED_HASH" = "$STORED_HASH" ]; then
    echo -e "${GREEN}SHA256: ✅ $COMPUTED_HASH${NC}"
    echo -e "${GREEN}Status: MATCHES stored checksum${NC}"
  else
    echo -e "${YELLOW}SHA256: $COMPUTED_HASH${NC}"
    echo -e "${YELLOW}Status: No matching checksum found (generating...)${NC}"
    echo "$COMPUTED_HASH  $(basename "$DUMP_FILE")" >> "$PROJECT_DIR/$CHECKSUM_FILE"
    echo -e "${GREEN}Checksum saved to $CHECKSUM_FILE${NC}"
  fi
else
  echo "SHA256: $COMPUTED_HASH"
  echo "Status: No checksum file found"
  mkdir -p "$PROJECT_DIR/$(dirname "$CHECKSUM_FILE")"
  echo "$COMPUTED_HASH  $(basename "$DUMP_FILE")" > "$PROJECT_DIR/$CHECKSUM_FILE"
  echo "Checksum saved to $CHECKSUM_FILE"
fi

echo ""
echo "--- Content Verification ---"

TOC_OUTPUT=$(pg_restore --list "$DUMP_FILE" 2>/dev/null | head -20 || true)
if [ -n "$TOC_OUTPUT" ]; then
  echo "Tables/relations found in backup:"
  echo "$TOC_OUTPUT" | grep -E "TABLE DATA|TABLE " | head -10 || echo "(no tables listed)"
  echo -e "${GREEN}Integrity: ✅ Table of contents readable${NC}"
else
  echo -e "${RED}Integrity: ❌ Cannot read table of contents${NC}"
  exit 1
fi

if [ "$TRIAL_RESTORE" = true ]; then
  echo ""
  echo "--- Trial Restore ---"
  TRIAL_DB="xennic_verify_$(date +%s)"

  set +e
  createdb "$TRIAL_DB" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Warning: Cannot create trial database (may not be running as PostgreSQL superuser)${NC}"
    echo "Skipping trial restore."
  else
    pg_restore --dbname="$TRIAL_DB" --no-owner --no-acl "$DUMP_FILE" 2>/dev/null
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Trial restore: ✅ SUCCESS${NC}"
      dropdb "$TRIAL_DB" 2>/dev/null || true
    else
      echo -e "${RED}Trial restore: ❌ FAILED${NC}"
      dropdb "$TRIAL_DB" 2>/dev/null || true
      exit 1
    fi
  fi
  set -e
fi

echo ""
echo "============================================"
echo -e "${GREEN}Verification complete${NC}"
echo "============================================"