'use client';

const TOKEN_KEY = 'xennic_token';
const WS_KEY    = 'xennic_workspace_id';

/**
 * بعد از login/register موفق:
 * 1. workspace کاربر را پیدا یا می‌سازد
 * 2. وضعیت ادمین را بررسی می‌کند
 */
export async function handlePostLogin(
  setWorkspace: (id: string) => void,
  apiBase: string,
  token: string,
  setIsAdmin?: (v: boolean) => void,
) {
  // ── پاک کردن workspace قبلی ────────────────────────────────────────────
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WS_KEY);
    localStorage.setItem(TOKEN_KEY, token);
  }

  // ── بررسی ادمین بودن ──────────────────────────────────────────────────
  if (setIsAdmin) {
    try {
      const res  = await fetch(`${apiBase}/admin/check`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const json = await res.json();
      setIsAdmin(json?.data?.isAdmin === true || json?.isAdmin === true);
    } catch {
      setIsAdmin(false);
    }
  }

  // ── workspace setup ────────────────────────────────────────────────────
  try {
    const res  = await fetch(`${apiBase}/workspaces?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
    });
    const json = await res.json();

    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      _saveWorkspace(json.data[0].id as string, setWorkspace);
      return;
    }

    // کاربر workspace ندارد — بساز
    const createRes  = await fetch(`${apiBase}/workspaces`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: 'My Workspace' }),
    });
    const createJson = await createRes.json();
    const wsId: string | undefined = createJson?.data?.id ?? createJson?.id;
    if (wsId) _saveWorkspace(wsId, setWorkspace);

  } catch (err) {
    console.error('Post-login workspace setup failed:', err);
  }
}

function _saveWorkspace(wsId: string, setWorkspace: (id: string) => void) {
  setWorkspace(wsId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(WS_KEY, wsId);
  }
}
