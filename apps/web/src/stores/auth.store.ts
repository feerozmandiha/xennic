import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Key ها ثابت — باید با apiClient.ts یکسان باشند ────────────────────────────
const TOKEN_KEY   = 'xennic_token';
const WS_KEY      = 'xennic_workspace_id';
const ZUSTAND_KEY = 'xennic-auth';

interface User {
  id:        string;
  email:     string;
  firstName: string;
  lastName:  string;
  status:    string;
  isAdmin?:  boolean;   // ✅ فلگ ادمین
}

interface AuthState {
  token:           string | null;
  refreshToken:    string | null;
  user:            User | null;
  workspaceId:     string | null;
  isAuthenticated: boolean;
  isAdmin:         boolean;      // ✅ cache شده برای سریع‌ترین دسترسی

  setAuth:      (token: string, refreshToken: string, user: User) => void;
  setWorkspace: (workspaceId: string) => void;
  setIsAdmin:   (isAdmin: boolean) => void;   // ✅ جدید
  clearAuth:    () => void;
  updateUser:   (user: Partial<User>) => void;
}

function safeSetItem(key: string, value: string) {
  try { if (typeof window !== 'undefined') localStorage.setItem(key, value); }
  catch { /* ignore */ }
}

function safeRemoveItem(key: string) {
  try { if (typeof window !== 'undefined') localStorage.removeItem(key); }
  catch { /* ignore */ }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:           null,
      refreshToken:    null,
      user:            null,
      workspaceId:     null,
      isAuthenticated: false,
      isAdmin:         false,

      setAuth: (token, refreshToken, user) => {
        safeSetItem(TOKEN_KEY, token);
        set({ token, refreshToken, user, isAuthenticated: true });
      },

      setWorkspace: (workspaceId) => {
        safeSetItem(WS_KEY, workspaceId);
        set({ workspaceId });
      },

      setIsAdmin: (isAdmin) => {
        set({ isAdmin });
      },

      clearAuth: () => {
        safeRemoveItem(TOKEN_KEY);
        safeRemoveItem(WS_KEY);
        set({
          token:           null,
          refreshToken:    null,
          user:            null,
          workspaceId:     null,
          isAuthenticated: false,
          isAdmin:         false,
        });
      },

      updateUser: (partial) =>
        set(state => ({
          user:    state.user ? { ...state.user, ...partial } : null,
          isAdmin: partial.isAdmin ?? state.isAdmin,
        })),
    }),
    {
      name:    ZUSTAND_KEY,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem:    () => null,
          setItem:    () => {},
          removeItem: () => {},
        }
      ),
      // onRehydrateStorage — بعد از hydrate، key های مستقیم را هم sync کن
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.token)       safeSetItem(TOKEN_KEY, state.token);
        if (state.workspaceId) safeSetItem(WS_KEY,    state.workspaceId);
      },
      partialize: (state) => ({
        token:           state.token,
        refreshToken:    state.refreshToken,
        user:            state.user,
        workspaceId:     state.workspaceId,
        isAuthenticated: state.isAuthenticated,
        isAdmin:         state.isAdmin,
      }),
    },
  ),
);
