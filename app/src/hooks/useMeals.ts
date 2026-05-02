import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { MEALS_CACHE_TTL_MS, MEALS_SHEET_ID } from '../config';
import { meals as bundledMeals } from '../data/meals';
import type { Meal } from '../data/meals';
import { fetchSheetMeals } from '../data/sheetMeals';

const CACHE_KEY = 'cl:meals';

type CachedShape = { meals: Meal[]; fetchedAt: number };
type Source = 'bundled' | 'cache' | 'remote';

/**
 * Resolves the meal pool the app should use. Order of preference:
 *
 *   1. Fresh remote fetch (cached for `MEALS_CACHE_TTL_MS`)
 *   2. Stale cache (used while a refetch is in flight)
 *   3. Bundled defaults from src/data/meals.ts
 *
 * If `MEALS_SHEET_ID` is empty, this hook just returns the bundled
 * meals and never makes a network call.
 */
export function useMeals(): { meals: Meal[]; source: Source } {
  const [meals, setMeals] = useState<Meal[]>(bundledMeals);
  const [source, setSource] = useState<Source>('bundled');

  useEffect(() => {
    if (!MEALS_SHEET_ID) return;

    let cancelled = false;
    (async () => {
      // 1. Hydrate from cache while we kick off a background refresh.
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as CachedShape;
          if (cached?.meals?.length) {
            if (!cancelled) {
              setMeals(cached.meals);
              setSource('cache');
            }
            // skip the network refresh if cache is still fresh
            if (Date.now() - cached.fetchedAt < MEALS_CACHE_TTL_MS) return;
          }
        }
      } catch {
        /* ignore cache read errors */
      }

      // 2. Refetch.
      try {
        const remote = await fetchSheetMeals();
        if (!cancelled && remote && remote.length > 0) {
          setMeals(remote);
          setSource('remote');
          await AsyncStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ meals: remote, fetchedAt: Date.now() }),
          );
        }
      } catch (e) {
        if (__DEV__) console.warn('[useMeals] remote fetch failed:', e);
        // keep whatever value we had — bundled or cached
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { meals, source };
}
