#!/bin/bash
# ── debug-403.sh — بررسی مشکل 403 Forbidden ──────────────────────────────────
# اجرا: bash xennic-patch/scripts/debug-403.sh <USER_ID> <WORKSPACE_ID>
#
# مثال:
#   bash xennic-patch/scripts/debug-403.sh \
#     "your-user-uuid" \
#     "d4942e70-61bc-4d5c-a63d-3c5fc5d57869"

USER_ID=${1:-""}
WS_ID=${2:-""}

if [ -z "$USER_ID" ] || [ -z "$WS_ID" ]; then
  echo "Usage: $0 <user_id> <workspace_id>"
  echo ""
  echo "به جای این، query های زیر را در psql اجرا کن:"
  echo ""
  echo "-- ۱. بررسی workspace"
  echo "SELECT id, name, created_by, deleted_at FROM workspaces WHERE id = '<WS_ID>';"
  echo ""
  echo "-- ۲. بررسی عضویت"
  echo "SELECT * FROM workspace_members WHERE workspace_id = '<WS_ID>' AND user_id = '<USER_ID>';"
  echo ""
  echo "-- ۳. workspace های این کاربر"
  echo "SELECT DISTINCT w.id, w.name, w.created_by"
  echo "FROM workspaces w"
  echo "LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = '<USER_ID>'"
  echo "WHERE w.deleted_at IS NULL"
  echo "  AND (w.created_by = '<USER_ID>' OR wm.user_id = '<USER_ID>');"
  exit 0
fi

DB_URL="${DATABASE_URL:-postgresql://xennic:xennic@localhost:5432/xennic}"

echo "═══════════════════════════════════════════════════"
echo "Debug 403 — User: $USER_ID | Workspace: $WS_ID"
echo "═══════════════════════════════════════════════════"

echo ""
echo "▶ ۱. بررسی workspace وجود دارد؟"
psql "$DB_URL" -c "SELECT id, name, created_by, deleted_at FROM workspaces WHERE id = '$WS_ID';"

echo ""
echo "▶ ۲. آیا کاربر owner این workspace است؟"
psql "$DB_URL" -c "SELECT id, name FROM workspaces WHERE id = '$WS_ID' AND created_by = '$USER_ID';"

echo ""
echo "▶ ۳. آیا کاربر عضو این workspace است؟"
psql "$DB_URL" -c "SELECT * FROM workspace_members WHERE workspace_id = '$WS_ID' AND user_id = '$USER_ID';"

echo ""
echo "▶ ۴. همه workspace های این کاربر:"
psql "$DB_URL" -c "
SELECT DISTINCT w.id, w.name, w.created_by,
  CASE WHEN w.created_by = '$USER_ID' THEN 'OWNER' ELSE wm.role END as role
FROM workspaces w
LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = '$USER_ID'
WHERE w.deleted_at IS NULL
  AND (w.created_by = '$USER_ID' OR wm.user_id = '$USER_ID');
"

echo ""
echo "▶ ۵. اگر کاربر باید عضو باشد — اضافه کن:"
echo "psql \"\$DATABASE_URL\" -c \\"
echo "  \"INSERT INTO workspace_members (id, workspace_id, user_id, role, joined_at)\""
echo "  \" VALUES (gen_random_uuid(), '$WS_ID', '$USER_ID', 'OWNER', NOW())\""
echo "  \" ON CONFLICT (workspace_id, user_id) DO NOTHING;\""
