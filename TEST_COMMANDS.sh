#!/bin/bash
# Xennic API — Test Commands
# از ریشه ~/xennic اجرا کنید

BASE="http://localhost:3000/api/v1"

echo "======================================"
echo " STEP 1: Health Check"
echo "======================================"
curl -s $BASE/health | jq
echo ""

echo "======================================"
echo " STEP 2: Register (new user)"
echo "======================================"
curl -s -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -H "user-agent: test" \
  -d '{"email":"ahmad2@xennic.com","firstName":"احمد","lastName":"رضایی","password":"Test@1234"}' | jq
echo ""

echo "======================================"
echo " STEP 3: Login"
echo "======================================"
LOGIN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -H "user-agent: test" \
  -d '{"email":"test@xennic.com","password":"Test@1234"}')
echo $LOGIN | jq
TOKEN=$(echo $LOGIN | jq -r '.data.accessToken')
echo ""
echo "🔑 TOKEN: $TOKEN"
echo ""

echo "======================================"
echo " STEP 4: Get Profile /me"
echo "======================================"
curl -s $BASE/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "======================================"
echo " STEP 5: Create Workspace"
echo "======================================"
WS=$(curl -s -X POST $BASE/workspaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"شرکت مهندسی برق ایران"}')
echo $WS | jq
WS_ID=$(echo $WS | jq -r '.id')
echo ""
echo "🏢 WORKSPACE_ID: $WS_ID"
echo ""

echo "======================================"
echo " STEP 6: List Workspaces"
echo "======================================"
curl -s $BASE/workspaces \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "======================================"
echo " STEP 7: Create Project"
echo "======================================"
PRJ=$(curl -s -X POST $BASE/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-workspace-id: $WS_ID" \
  -d '{"name":"پروژه برق‌رسانی کارخانه","description":"طراحی سیستم برق ۵ مگاوات"}')
echo $PRJ | jq
PRJ_ID=$(echo $PRJ | jq -r '.data.id')
echo ""
echo "📁 PROJECT_ID: $PRJ_ID"
echo ""

echo "======================================"
echo " STEP 8: List Projects"
echo "======================================"
curl -s $BASE/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-workspace-id: $WS_ID" | jq
echo ""

echo "======================================"
echo " STEP 9: Get Roles"
echo "======================================"
curl -s $BASE/roles \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "======================================"
echo " STEP 10: Engineering Health"
echo "======================================"
curl -s $BASE/engineering/health \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-workspace-id: $WS_ID" | jq
echo ""

echo "======================================"
echo " STEP 11: Engineering Calculation (Ohm's Law)"
echo "======================================"
curl -s -X POST $BASE/engineering/calculations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-workspace-id: $WS_ID" \
  -d '{"type":"BASIC-001","inputs":{"current_a":10.0,"resistance_ohm":23.0}}' | jq
echo ""

echo "✅ All tests done!"
