#!/bin/bash
# debug-project.sh — بررسی دقیق مشکل Project 403
# اجرا: bash xennic-patch/scripts/debug-project.sh

BASE="http://localhost:3000/api/v1"
TS=$(date +%s)
EMAIL="debug_${TS}@xennic.com"
PASS="Test@1234"

echo "═══════════════════════════════════════"
echo " Xennic — Project Debug"
echo "═══════════════════════════════════════"
echo ""

# ── Register ─────────────────────────────────────────────────────────────
echo "▶ 1. Register..."
REG=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"firstName\":\"Debug\",\"lastName\":\"User\",\"password\":\"$PASS\"}")
echo "$REG" | jq '{success, email: .data.user.email, token_prefix: (.data.accessToken[:20])}' 2>/dev/null || echo "$REG"
TOKEN=$(echo "$REG" | jq -r '.data.accessToken')

# ── Create Workspace ──────────────────────────────────────────────────────
echo ""
echo "▶ 2. Create Workspace..."
WS=$(curl -s -X POST "$BASE/workspaces" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Debug_${TS}\"}")
echo "$WS" | jq '{success, id: .data.id, name: .data.name, code: .data.code}' 2>/dev/null || echo "$WS"
WS_ID=$(echo "$WS" | jq -r '.data.id')
echo "  WS_ID: $WS_ID"

# ── Check workspace_members ───────────────────────────────────────────────
echo ""
echo "▶ 3. بررسی اعضای workspace..."
MEM=$(curl -s "$BASE/workspaces/$WS_ID/members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-workspace-id: $WS_ID")
echo "$MEM" | jq '{success, members: [.data[] | {userId, role}]}' 2>/dev/null || echo "$MEM"

# ── Try Project Create ────────────────────────────────────────────────────
echo ""
echo "▶ 4. ایجاد Project (با verbose HTTP)..."
PRJ_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$BASE/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-workspace-id: $WS_ID" \
  -d '{"name":"Debug Project","description":"test"}')

HTTP_STATUS=$(echo "$PRJ_RESP" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$PRJ_RESP" | grep -v "HTTP_STATUS:")

echo "  HTTP Status: $HTTP_STATUS"
echo "  Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

# ── Check user_roles ──────────────────────────────────────────────────────
echo ""
echo "▶ 5. بررسی user_roles در دیتابیس..."
echo "   (اگر psql دارید اجرا کنید:)"
USER_ID=$(echo "$REG" | jq -r '.data.user.id')
echo "   USER_ID: $USER_ID"
echo "   WS_ID:   $WS_ID"
echo ""
echo "   SELECT ur.*, r.slug as role_slug"
echo "   FROM user_roles ur"
echo "   JOIN roles r ON r.id = ur.role_id"
echo "   WHERE ur.user_id = '$USER_ID'"
echo "   AND ur.workspace_id = '$WS_ID';"

# ── Check authorization ───────────────────────────────────────────────────
echo ""
echo "▶ 6. بررسی مجوز projects.create..."
echo "   اگر HTTP_STATUS=403 بود:"
echo "   - authorization.service._isWorkspaceOwner fail کرد"
echo "   - یا workspace_members.role='OWNER' نیست"
echo "   - یا user_roles خالی است"
echo ""
echo "   راه‌حل SQL:"
echo "   INSERT INTO user_roles (id, user_id, role_id, workspace_id)"
echo "   SELECT gen_random_uuid(), wm.user_id, r.id, wm.workspace_id"
echo "   FROM workspace_members wm CROSS JOIN roles r"
echo "   WHERE wm.role = 'OWNER' AND r.slug = 'OWNER'"
echo "   ON CONFLICT DO NOTHING;"

echo ""
echo "═══════════════════════════════════════"
echo " نتیجه: HTTP $HTTP_STATUS"
echo "═══════════════════════════════════════"

# ── Engineering Debug ────────────────────────────────────────────────────────
echo ""
echo "▶ 7. Engineering Ohm's Law مستقیم از NestJS..."
CALC=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$BASE/engineering/calculations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-workspace-id: $WS_ID" \
  -d '{"type":"BASIC-001","inputs":{"current_a":10.0,"resistance_ohm":23.0}}')
CALC_HTTP=$(echo "$CALC" | grep "HTTP_STATUS:" | cut -d: -f2)
CALC_BODY=$(echo "$CALC" | grep -v "HTTP_STATUS:")
echo "  HTTP: $CALC_HTTP"
echo "  Response (کامل):"
echo "$CALC_BODY" | jq '.' 2>/dev/null || echo "$CALC_BODY"

echo ""
echo "▶ 8. Keys در .data.result..."
echo "$CALC_BODY" | jq '.data.result | keys' 2>/dev/null
echo ""
echo "▶ 9. Keys در .data.result.results..."
echo "$CALC_BODY" | jq '.data.result.results | keys' 2>/dev/null
