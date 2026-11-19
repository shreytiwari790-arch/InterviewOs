import { useEffect } from 'react';

/** Calls `callback` every `intervalMs` while `isActive` is true. */
export function usePolling(callback, isActive, intervalMs = 2000) {
  useEffect(() => {
    if (!isActive) return undefined;
    const timer = setInterval(callback, intervalMs);
    return () => clearInterval(timer);
  }, [callback, isActive, intervalMs]);
}
