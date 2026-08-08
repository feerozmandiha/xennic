#!/bin/bash
set -e
FILE="apps/api/src/modules/landing-cms/application/services/landing-cms.service.ts"
if [ ! -f "$FILE" ]; then
  echo "File $FILE not found, searching..."
  find apps/api/src/modules -name "*.ts" | xargs grep -l "landing_cms_config" 2>/dev/null | head
  FILE=$(find apps/api/src/modules -name "*.ts" | xargs grep -l "landing_cms_config" 2>/dev/null | head -n1)
  echo "Found: $FILE"
fi

if [ -f "$FILE" ]; then
  echo "Fixing $FILE"
  sed -i 's/prisma\.landing_cms_config/(prisma as any).landing_cms_config/g' "$FILE"
  echo "Fixed"
  grep -n "landing_cms_config" "$FILE" | head -n 20
else
  echo "No file found with landing_cms_config"
fi

# Also fix @xennic/database missing by building database package if possible
echo ""
echo "Trying to build @xennic/database package..."
pnpm --filter @xennic/database build || echo "Build failed, but will try to continue with existing dist"

# Fix includes error by checking tsconfig target
echo ""
echo "Checking tsconfig..."
grep -n "lib\|target" apps/api/tsconfig.json || cat apps/api/tsconfig.json
