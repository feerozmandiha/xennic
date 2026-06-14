'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY  = 'xennic_guest';
const MAX_GUEST    = 5;

interface GuestState {
  sessionId: string;
  remaining: number;
  used: number;
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function load(): GuestState {
  if (typeof window === 'undefined') {
    return { sessionId: '', remaining: MAX_GUEST, used: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GuestState;
      if (parsed && typeof parsed.remaining === 'number') {
        return parsed;
      }
    }
  } catch { /* ignore */ }

  const state: GuestState = {
    sessionId: generateId(),
    remaining: MAX_GUEST,
    used: 0,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

function save(state: GuestState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function useGuestQuota() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<GuestState>({ sessionId: '', remaining: MAX_GUEST, used: 0 });
  const [showModal, setShowModal] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // hydrate after mount — prevents hydration mismatch with localStorage
  useEffect(() => {
    setState(load());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) save(state);
  }, [state, mounted]);

  /** Synchronously consume one quota. Returns true if quota was available. */
  const consume = useCallback((): boolean => {
    const current = stateRef.current;
    if (current.remaining <= 0) {
      setShowModal(true);
      return false;
    }
    const next: GuestState = {
      ...current,
      remaining: current.remaining - 1,
      used: current.used + 1,
    };
    stateRef.current = next;
    setState(next);
    save(next);

    // بعد از سومین محاسبه (used=3 یعنی remaining=2) مدال نمایش بده
    if (next.used === 3) {
      setTimeout(() => setShowModal(true), 500);
    }
    return true;
  }, []);

  const hasQuota = state.remaining > 0;

  return {
    remaining: state.remaining,
    used: state.used,
    total: MAX_GUEST,
    hasQuota,
    consume,
    showModal,
    setShowModal,
  };
}
