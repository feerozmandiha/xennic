#!/usr/bin/env python3
"""
Xennic Mock API Server — بدون نیاز به flask
اجرا: python3 xennic-patch/scripts/mock-api.py
"""
import json
import uuid
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# ── In-memory store ──────────────────────────────────────────────────────────
USERS         = {}   # uid → user
TOKENS        = {}   # token → user
WORKSPACES    = {}   # wid → ws
WS_MEMBERS    = {}   # wid → {uid: {role, joinedAt}}
PROJECTS      = {}   # pid → project
CONVERSATIONS = {}   # cid → conv
MESSAGES      = {}   # cid → [msg]

FREE_PLAN = {
    "id": str(uuid.uuid4()), "name": "Free", "slug": "free",
    "monthlyPrice": 0, "yearlyPrice": 0,
    "features": {
        "calculations_month": 100, "ai_requests_month": 10,
        "storage_gb": 1, "workspaces": 1, "projects": 5,
    },
}
AGENTS = [
    {"id": str(uuid.uuid4()), "name": "Electrical Engineer Agent",
     "slug": "electrical-engineer", "version": "1.0.0"},
]

def ok(data):
    return 200, {"success": True, "data": data}

def created(data):
    return 201, {"success": True, "data": data}

def no_content():
    return 204, None

def err(code, msg, status=400):
    return status, {"success": False, "error": {"code": code, "message": msg}}

def get_user(headers):
    auth = headers.get("authorization", headers.get("Authorization", ""))
    if not auth.startswith("Bearer "):
        return None
    return TOKENS.get(auth[7:])

def get_ws_id(headers, params):
    return (headers.get("x-workspace-id") or
            headers.get("X-Workspace-Id") or "")

def _mock_reply(q: str) -> str:
    q_lower = q.lower()
    if "thd" in q_lower or "هارمونیک" in q or "کیفیت توان" in q:
        return ("**THD (Total Harmonic Distortion)** — IEEE 519-2022:\n\n"
                "• حد مجاز THD جریان: ≤ 5%\n"
                "• فرمول: `THD_I = √(ΣIₙ²) / I₁ × 100%`\n\n"
                "**راه‌حل‌های کاهش THD:**\n"
                "1. فیلتر پسیو برای هارمونیک‌های خاص (5th, 7th)\n"
                "2. Active Power Filter (APF) — کنترل دقیق‌تر\n"
                "3. ترانسفورماتور K-Factor\n\n"
                "از ماژول PQ-001 تا PQ-006 در Xennic برای محاسبه دقیق استفاده کنید.")
    if "کابل" in q or "cable" in q_lower:
        return ("**سایزینگ کابل — IEC 60364-5-52:**\n\n"
                "مراحل:\n"
                "1. جریان بار: `I_b = P / (√3 × V × cosφ)`\n"
                "2. ضرایب تصحیح: دما، نصب، گروه‌بندی\n"
                "3. افت ولتاژ: ≤ 4% (IEC)\n\n"
                "ماژول CABLE-001 محاسبه خودکار انجام می‌دهد.")
    if "فیلتر پسیو" in q or "passive filter" in q_lower:
        return ("**طراحی فیلتر پسیو — IEEE 519:**\n\n"
                "برای هارمونیک 5 (250 Hz در 50Hz):\n"
                "`f_r = 1 / (2π√LC)`\n\n"
                "مراحل:\n"
                "1. تعیین توان راکتیو Q (kVAR)\n"
                "2. محاسبه C: `C = Q / (2π × f₁ × V²)`\n"
                "3. محاسبه L: `L = 1 / ((2π × n×f₁)² × C)`\n\n"
                "ماژول PQ-005 در Xennic این محاسبه را انجام می‌دهد.")
    if "ترانس" in q or "transformer" in q_lower:
        return ("**سایزینگ ترانسفورماتور — IEC 60076:**\n\n"
                "`S_tr = P_total / (η × cosφ)`\n\n"
                "• ضریب توسعه آینده: +20-30%\n"
                "• راندمان: η ≈ 0.97-0.99\n"
                "• K-Factor برای بارهای غیرخطی اهمیت دارد\n\n"
                "ماژول TRF-001 در Xennic دقیق‌ترین نتیجه را می‌دهد.")
    return ("سلام! من **Xennic AI** هستم — مشاور تخصصی مهندسی برق.\n\n"
            "موضوعات تخصصی:\n"
            "• محاسبات IEC 60364, 60076\n"
            "• کیفیت توان IEEE 519-2022\n"
            "• حفاظت و رله‌گذاری\n"
            "• سیستم‌های خورشیدی و تجدیدپذیر\n\n"
            "سؤال فنی خود را بپرسید! ⚡")


class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        pass  # quiet mode

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length:
            return json.loads(self.rfile.read(length).decode())
        return {}

    def _send(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization,Content-Type,x-workspace-id")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
        self.end_headers()
        if body is not None:
            self.wfile.write(json.dumps(body, ensure_ascii=False).encode())

    def do_OPTIONS(self):
        self._send(204, None)

    def _route(self, method, path, body, headers):
        p = path.lstrip("/").split("/")
        # strip "api/v1"
        if p[:2] == ["api", "v1"]:
            p = p[2:]

        user    = get_user(headers)
        raw_wid = get_ws_id(headers, {})

        # ── health ──────────────────────────────────────────────────────
        if p == ["health"]:
            return ok({"status": "ok", "version": "1.0.0-mock"})

        # ── auth ─────────────────────────────────────────────────────────
        if p[:1] == ["auth"]:
            sub = p[1] if len(p) > 1 else ""

            if sub == "register" and method == "POST":
                email = body.get("email", "").lower()
                if not email or not body.get("password") or not body.get("firstName"):
                    return err("VALIDATION", "Required fields missing")
                if email in [u["email"] for u in USERS.values()]:
                    return err("CONFLICT", "Email already exists", 409)
                uid = str(uuid.uuid4())
                u = {"id": uid, "email": email,
                     "firstName": body["firstName"], "lastName": body.get("lastName",""),
                     "status": "active"}
                USERS[uid] = u
                tok = str(uuid.uuid4())
                TOKENS[tok] = u
                return created({"accessToken": tok, "refreshToken": str(uuid.uuid4()), "user": u})

            if sub == "login" and method == "POST":
                email = body.get("email","").lower()
                pw    = body.get("password","")
                u     = next((x for x in USERS.values() if x["email"] == email), None)
                if not u or ("@" not in pw):
                    return err("UNAUTHORIZED", "Invalid credentials", 401)
                tok = str(uuid.uuid4())
                TOKENS[tok] = u
                return ok({"accessToken": tok, "refreshToken": str(uuid.uuid4()), "user": u})

            if sub == "me" and method == "GET":
                if not user: return err("UNAUTHORIZED", "Token required", 401)
                return ok(user)

            if sub == "logout" and method == "POST":
                auth = headers.get("authorization","")
                if auth.startswith("Bearer "):
                    TOKENS.pop(auth[7:], None)
                return ok({"message": "Logged out"})

            if sub == "change-password" and method == "PUT":
                if not user: return err("UNAUTHORIZED", "Token required", 401)
                return ok({"message": "Password changed"})

        # ── workspaces ───────────────────────────────────────────────────
        if p[:1] == ["workspaces"]:
            if not user: return err("UNAUTHORIZED", "Token required", 401)

            if len(p) == 1:
                if method == "GET":
                    mine = [ws for ws in WORKSPACES.values()
                            if ws["created_by"] == user["id"]
                            or user["id"] in WS_MEMBERS.get(ws["id"], {})]
                    return ok(mine)
                if method == "POST":
                    name = body.get("name","")
                    if not name: return err("VALIDATION", "Name required")
                    for ws in WORKSPACES.values():
                        if ws["name"].lower() == name.lower():
                            return err("CONFLICT", f'Workspace "{name}" already exists', 409)
                    wid = str(uuid.uuid4())
                    code = name[:8].upper().replace(" ","_") + "_" + wid[:4].upper()
                    ws = {"id": wid, "code": code, "name": name,
                          "created_by": user["id"], "createdBy": user["id"],
                          "createdAt": "2026-06-07T00:00:00Z", "updatedAt": "2026-06-07T00:00:00Z"}
                    WORKSPACES[wid] = ws
                    WS_MEMBERS.setdefault(wid, {})[user["id"]] = {
                        "id": str(uuid.uuid4()), "role": "OWNER",
                        "joinedAt": "2026-06-07T00:00:00Z",
                    }
                    return created(ws)

            wid = p[1]

            # بررسی دسترسی
            ws = WORKSPACES.get(wid)
            if raw_wid and raw_wid != wid:
                ws_check = WORKSPACES.get(raw_wid)
                if not ws_check:
                    return err("FORBIDDEN", "User does not have access to this workspace", 403)
                if ws_check["created_by"] != user["id"] and user["id"] not in WS_MEMBERS.get(raw_wid, {}):
                    return err("FORBIDDEN", "User does not have access to this workspace", 403)

            if len(p) == 2:
                if method == "GET":
                    if not ws: return err("NOT_FOUND", "Workspace not found", 404)
                    return ok(ws)
                if method in ("PUT","PATCH"):
                    if not ws: return err("NOT_FOUND", "Workspace not found", 404)
                    ws["name"] = body.get("name", ws["name"])
                    return ok(ws)

            if len(p) >= 3:
                sub = p[2]
                # members
                if sub == "members":
                    if method == "GET":
                        members = [{"id": info["id"], "userId": uid, "role": info["role"],
                                    "joinedAt": info["joinedAt"], "workspaceId": wid}
                                   for uid, info in WS_MEMBERS.get(wid, {}).items()]
                        return ok(members)
                    if method == "POST":
                        uid2 = body.get("userId")
                        role = body.get("role","MEMBER")
                        if not uid2: return err("VALIDATION","userId required")
                        WS_MEMBERS.setdefault(wid,{})[uid2] = {
                            "id": str(uuid.uuid4()), "role": role,
                            "joinedAt": "2026-06-07T00:00:00Z"}
                        return created({"id": str(uuid.uuid4()), "userId": uid2, "role": role, "workspaceId": wid})
                # invitations
                if sub == "invitations":
                    if method == "GET": return ok([])
                    if method == "POST":
                        inv = {"id": str(uuid.uuid4()), "email": body.get("email"),
                               "role": body.get("role","MEMBER"), "status": "pending",
                               "workspaceId": wid, "expiresAt": "2026-07-07T00:00:00Z"}
                        return created(inv)
                # subscription
                if sub == "subscription":
                    if len(p) == 3 and method == "GET":
                        return ok({"subscription": None, "plan": FREE_PLAN, "isActive": True})
                    if len(p) == 4 and p[3] == "usage":
                        return ok({"planSlug": "free",
                                   "calculations": {"used": 3, "limit": 100},
                                   "aiRequests":   {"used": 1, "limit": 10},
                                   "storage":      {"usedBytes": 0, "limitBytes": 1073741824}})

        # ── subscriptions ─────────────────────────────────────────────────
        if p[:1] == ["subscriptions"]:
            if not user: return err("UNAUTHORIZED","Token required",401)
            if p[1:] == ["plans"]:
                return ok([FREE_PLAN,
                           {**FREE_PLAN, "id": str(uuid.uuid4()), "name":"Pro","slug":"pro","monthlyPrice":490000}])

        # ── projects ──────────────────────────────────────────────────────
        if p[:1] == ["projects"]:
            if not user: return err("UNAUTHORIZED","Token required",401)
            if not raw_wid:
                # auto-detect
                for wid_, ws_ in WORKSPACES.items():
                    if ws_["created_by"] == user["id"]:
                        raw_wid = wid_; break
            if not raw_wid or raw_wid not in WORKSPACES:
                return err("FORBIDDEN","User does not have access to this workspace",403)
            ws_data = WORKSPACES.get(raw_wid,{})
            if ws_data.get("created_by") != user["id"] and user["id"] not in WS_MEMBERS.get(raw_wid,{}):
                return err("FORBIDDEN","User does not have access to this workspace",403)

            if len(p) == 1:
                if method == "GET":
                    prjs = [p_ for p_ in PROJECTS.values()
                            if p_["workspaceId"] == raw_wid and not p_.get("deleted")]
                    return ok(prjs)
                if method == "POST":
                    if not body.get("name"): return err("VALIDATION","Name required")
                    pid = str(uuid.uuid4())
                    prj = {"id": pid, "name": body["name"],
                           "description": body.get("description"),
                           "status": body.get("status","active"),
                           "workspaceId": raw_wid, "createdBy": user["id"],
                           "startDate": None, "endDate": None,
                           "createdAt": "2026-06-07T00:00:00Z", "updatedAt": "2026-06-07T00:00:00Z"}
                    PROJECTS[pid] = prj
                    return created(prj)
            if len(p) >= 2:
                pid = p[1]
                prj = PROJECTS.get(pid)
                if not prj or prj.get("deleted"):
                    return err("NOT_FOUND","Project not found",404)
                if len(p) == 2:
                    if method == "GET":   return ok(prj)
                    if method == "DELETE":
                        PROJECTS[pid]["deleted"] = True
                        return no_content()
                    if method in ("PUT","PATCH"):
                        for k in ("name","description","status"):
                            if k in body: prj[k] = body[k]
                        return ok(prj)
                if len(p) == 3 and p[2] == "notes" and method == "POST":
                    note = {"id": str(uuid.uuid4()), "projectId": pid,
                            "content": body.get("content",""),
                            "createdBy": user["id"], "createdAt": "2026-06-07T00:00:00Z"}
                    return created(note)

        # ── notifications ─────────────────────────────────────────────────
        if p[:1] == ["notifications"]:
            if not user: return err("UNAUTHORIZED","Token required",401)
            if p[1:2] == ["unread-count"]:
                return ok({"unread": 0})
            if method == "GET": return ok([])
            if method == "POST" and p[1:2] == ["read-all"]:
                return ok({"message": "All read"})

        # ── storage ───────────────────────────────────────────────────────
        if p[:1] == ["storage"]:
            if not user: return err("UNAUTHORIZED","Token required",401)
            if not raw_wid:
                for wid_, ws_ in WORKSPACES.items():
                    if ws_["created_by"] == user["id"]:
                        raw_wid = wid_; break
            if not raw_wid or raw_wid not in WORKSPACES:
                return err("FORBIDDEN","Access denied",403)
            if p[1:] == ["stats"]:
                return ok({"totalFiles":0,"totalSizeBytes":0,"totalSizeHuman":"0 B"})
            if p[1:] == ["files"]:
                return ok([])

        # ── ai ────────────────────────────────────────────────────────────
        if p[:1] == ["ai"]:
            if not user: return err("UNAUTHORIZED","Token required",401)
            if not raw_wid:
                for wid_, ws_ in WORKSPACES.items():
                    if ws_["created_by"] == user["id"]:
                        raw_wid = wid_; break
            if not raw_wid or raw_wid not in WORKSPACES:
                return err("FORBIDDEN","Access denied",403)
            ws_data = WORKSPACES.get(raw_wid,{})
            if ws_data.get("created_by") != user["id"] and user["id"] not in WS_MEMBERS.get(raw_wid,{}):
                return err("FORBIDDEN","Access denied",403)

            if p[1:] == ["agents"]:
                return ok(AGENTS)

            if p[1:] == ["usage"]:
                return ok({"totalRequests":2,"totalTokens":260,"totalCost":0.00052})

            if p[1:2] == ["conversations"]:
                if len(p) == 2:
                    if method == "GET":
                        convs = [c for c in CONVERSATIONS.values() if c["workspaceId"] == raw_wid]
                        for c in convs:
                            c["messageCount"] = len([m for m in MESSAGES.get(c["id"],[]) if m["role"]!="system"])
                        return ok(convs)
                    if method == "POST":
                        agent = next((a for a in AGENTS if a["slug"]==body.get("agentSlug")), None)
                        if not agent: return err("NOT_FOUND",f"Agent '{body.get('agentSlug')}' not found",404)
                        cid = str(uuid.uuid4())
                        conv = {"id": cid, "agentId": agent["id"], "workspaceId": raw_wid,
                                "title": body.get("title"), "messages": [],
                                "messageCount": 0,
                                "createdAt": "2026-06-07T00:00:00Z", "updatedAt": "2026-06-07T00:00:00Z"}
                        CONVERSATIONS[cid] = conv
                        MESSAGES[cid] = []
                        return created(conv)

                if len(p) >= 3:
                    cid = p[2]
                    conv = CONVERSATIONS.get(cid)
                    if not conv or conv["workspaceId"] != raw_wid:
                        return err("NOT_FOUND","Conversation not found",404)
                    if len(p) == 3:
                        if method == "GET":
                            msgs = [m for m in MESSAGES.get(cid,[]) if m["role"] != "system"]
                            return ok({**conv, "messages": msgs, "messageCount": len(msgs)})
                        if method == "DELETE":
                            CONVERSATIONS.pop(cid, None)
                            MESSAGES.pop(cid, None)
                            return no_content()
                    if len(p) == 4 and p[3] == "messages" and method == "POST":
                        content = body.get("content","").strip()
                        if not content: return err("VALIDATION","Content required")
                        umid = str(uuid.uuid4())
                        amid = str(uuid.uuid4())
                        MESSAGES.setdefault(cid,[]).append(
                            {"id": umid, "role":"user","content": content, "createdAt":"2026-06-07T00:00:00Z"})
                        reply = _mock_reply(content)
                        MESSAGES[cid].append(
                            {"id": amid, "role":"assistant","content": reply, "createdAt":"2026-06-07T00:00:01Z"})
                        if not conv.get("title"):
                            CONVERSATIONS[cid]["title"] = content[:50]
                        cnt = len([m for m in MESSAGES[cid] if m["role"]!="system"])
                        CONVERSATIONS[cid]["messageCount"] = cnt
                        return ok({"userMessageId":umid,"assistantMessageId":amid,
                                   "reply":reply,"tokens":130})

        # ── rbac ──────────────────────────────────────────────────────────
        if p[:1] == ["roles"]:
            if not user: return err("UNAUTHORIZED","Token required",401)
            return ok([{"id":str(uuid.uuid4()),"name":r,"slug":r}
                        for r in ["OWNER","ADMIN","ENGINEER","MEMBER","VIEWER"]])

        if p[:1] == ["permissions"]:
            if not user: return err("UNAUTHORIZED","Token required",401)
            return ok([{"id":str(uuid.uuid4()),"slug":s,"domain":"engineering"}
                        for s in ["engineering.calculate","ai.chat","files.upload"]])

        # ── engineering stub ──────────────────────────────────────────────
        if p[:1] == ["engineering"]:
            if not user: return err("UNAUTHORIZED","Token required",401)
            if p[1:] == ["health"]:
                return err("SERVICE_UNAVAILABLE","Python service not running",503)
            if p[1:] == ["catalog"]:
                return err("SERVICE_UNAVAILABLE","Python service not running",503)
            if p[1:] == ["calculations"] and method=="POST":
                return err("SERVICE_UNAVAILABLE","Python service not running",503)

        return err("NOT_FOUND", f"Route not found: {method} /{'/'.join(p)}", 404)

    def _handle(self, method):
        parsed = urlparse(self.path)
        body   = self._read_body()
        headers = {k.lower(): v for k, v in self.headers.items()}
        try:
            status, response = self._route(method, parsed.path, body, headers)
            self._send(status, response)
        except Exception as exc:
            self._send(500, {"success": False, "error": {"code": "INTERNAL", "message": str(exc)}})

    def do_GET(self):    self._handle("GET")
    def do_POST(self):   self._handle("POST")
    def do_PUT(self):    self._handle("PUT")
    def do_PATCH(self):  self._handle("PATCH")
    def do_DELETE(self): self._handle("DELETE")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    server = HTTPServer(("localhost", port), Handler)
    print(f"🚀 Xennic Mock API  →  http://localhost:{port}/api/v1")
    print(f"   (بدون Flask — فقط stdlib Python)")
    print(f"   Ctrl+C برای توقف\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n⏹ Mock server stopped.")
