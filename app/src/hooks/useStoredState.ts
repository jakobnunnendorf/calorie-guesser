import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

/**
 * Like useState, but persisted to AsyncStorage under the given key.
 *
 * - Reads the stored value on mount; until that read completes, the
 *   `hydrated` flag is `false` and the value is the `initial` you passed.
 * - Writes back on every change AFTER hydration so we don't clobber the
 *   stored value with the default during the brief load window.
 * - Catches and ignores errors: if storage is unavailable, the hook
 *   degrades gracefully to in-memory state.
 */
export function useStoredState<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (cancelled.current) return;
        if (raw !== null) {
          try {
            setValue(JSON.parse(raw) as T);
          } catch {
            /* parse error — keep default */
          }
        }
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled.current) setHydrated(true);
      });
    return () => {
      cancelled.current = true;
    };
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
      /* swallow write errors */
    });
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}
