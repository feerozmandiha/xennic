'use client';

const TOKEN_KEY = 'xennic_token';
const WS_KEY    = 'xennic_workspace_id';

/**
 * بعد از login/register موفق:
 * 1. workspace کاربر را پیدا یا می‌سازد
 * 2. وضعیت ادمین را بررسی می‌کند
 * 3. اگر plan مشخص شده، اشتراک ایجاد می‌کند
 */
export async function handlePostLogin(
  setWorkspace: (id: string) => void,
  apiBase: string,
  token: string,
  setIsAdmin?: (v: boolean) => void,
  plan?: string | null,
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
  let workspaceId: string | null = null;

  try {
    const res  = await fetch(`${apiBase}/workspaces?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
    });
    const json = await res.json();

    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      workspaceId = json.data[0].id as string;
    } else {
      // کاربر workspace ندارد — بساز
      const createRes  = await fetch(`${apiBase}/workspaces`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: 'My Workspace' }),
      });
      const createJson = await createRes.json();
      workspaceId = createJson?.data?.id ?? createJson?.id ?? null;
    }

    if (workspaceId) {
      _saveWorkspace(workspaceId, setWorkspace);

      // ── اگر plan مشخص شده (و رایگان نیست)، اشتراک ایجاد کن ──────────
      if (plan && plan !== 'free') {
        try {
          // دریافت لیست پلن‌ها برای پیدا کردن UUID
          const plansRes  = await fetch(`${apiBase}/subscriptions/plans`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const plansJson = await plansRes.json();
          const plans: any[] = plansJson?.data ?? [];

          const selectedPlan = plans.find((p: any) => p.slug === plan);
          if (selectedPlan) {
            await fetch(`${apiBase}/workspaces/${workspaceId}/subscription`, {
              method:  'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body:    JSON.stringify({ planId: selectedPlan.id }),
            });
          }
        } catch (err) {
          console.error('Post-login subscription creation failed:', err);
        }
      }
    }
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
