/**
 * Xennic API Client — v3
 * مستقیم به NestJS وصل می‌شود
 * token و workspace از localStorage می‌خواند
 */

const API_BASE =
  typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
    : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`;

// ── Keys ثابت برای localStorage ───────────────────────────────────────────────
const TOKEN_KEY    = 'xennic_token';
const WS_KEY       = 'xennic_workspace_id';
const ZUSTAND_KEY  = 'xennic-auth';

// ── خواندن token ──────────────────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  // ۱. مستقیم از xennic_token
  const direct = localStorage.getItem(TOKEN_KEY);
  if (direct) return direct;

  // ۲. از Zustand persisted store
  try {
    const raw = localStorage.getItem(ZUSTAND_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const token  = parsed?.state?.token as string | null;
      if (token) {
        // sync back
        localStorage.setItem(TOKEN_KEY, token);
        return token;
      }
    }
  } catch { /* ignore */ }

  return null;
}

// ── خواندن workspaceId ────────────────────────────────────────────────────────
function getWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null;

  // ۱. مستقیم از xennic_workspace_id
  const direct = localStorage.getItem(WS_KEY);
  if (direct) return direct;

  // ۲. از Zustand persisted store
  try {
    const raw = localStorage.getItem(ZUSTAND_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const wsId   = parsed?.state?.workspaceId as string | null;
      if (wsId) {
        // sync back
        localStorage.setItem(WS_KEY, wsId);
        return wsId;
      }
    }
  } catch { /* ignore */ }

  return null;
}

// ── Build headers ─────────────────────────────────────────────────────────────
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const wsId = getWorkspaceId();
  if (wsId) headers['x-workspace-id'] = wsId;

  return headers;
}

// ── Error class ───────────────────────────────────────────────────────────────
class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Request ───────────────────────────────────────────────────────────────────
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: buildHeaders(extraHeaders),
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();

    let json: any;
    try { json = JSON.parse(text); }
    catch { throw new ApiError('PARSE_ERROR', 'Invalid JSON response', res.status); }

    // 401 — پاک کردن auth و redirect
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ZUSTAND_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(WS_KEY);
        const locale = window.location.pathname.split('/')[1] ?? 'fa';
        window.location.href = `/${locale}/login`;
      }
      throw new ApiError('UNAUTHORIZED', 'Session expired', 401);
    }

    if (!res.ok || json.success === false) {
      const err = json.error ?? { code: 'UNKNOWN', message: json.message ?? 'Unknown error' };
      throw new ApiError(err.code, err.message, res.status);
    }

    return json as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const error = err as Error;
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      throw new ApiError('NETWORK_ERROR', 'Cannot connect to server', 0);
    }
    throw err;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export const apiClient = {
  get:    <T>(path: string)                 => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown) => request<T>('POST',   path, body),
  put:    <T>(path: string, body?: unknown) => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body?: unknown) => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                 => request<T>('DELETE', path),
};

export { ApiError, getToken, getWorkspaceId };
