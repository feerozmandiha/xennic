'use client';

import { useEffect } from 'react';

export function useHotkey(
  keys: string[],
  callback: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const metaKey = isMac ? e.metaKey : e.ctrlKey;

      const isMatch = keys.some(key => {
        const parts = key.toLowerCase().split('+');
        const needsMeta = parts.includes('meta') || parts.includes('ctrl');
        const needsShift = parts.includes('shift');
        const keyName = parts[parts.length - 1];

        const metaDown = isMac ? e.metaKey : e.ctrlKey;
        if (needsMeta && !metaDown) return false;
        if (!needsMeta && metaDown) return false;
        if (needsShift && !e.shiftKey) return false;
        if (e.key.toLowerCase() !== keyName) return false;

        return true;
      });

      if (isMatch) {
        e.preventDefault();
        e.stopPropagation();
        callback();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback, enabled]);
}
