import type { Meal } from './data/meals';
import type { Macro } from './theme';
import type { Guess, RoundOutcome } from './types';

// Composite accuracy: average of per-macro accuracy where
//   accuracy = max(0, 100 - |%error|).
// Simple and forgiving for an MVP — tweak later if the curve feels off.

export function score(
  guess: Guess,
  meal: Meal,
  activeMacros: Macro[],
): RoundOutcome {
  const perMacro: RoundOutcome['perMacro'] = {};
  if (activeMacros.length === 0) {
    return { composite: 0, perMacro };
  }

  let total = 0;
  for (const m of activeMacros) {
    const you = guess[m] ?? 0;
    const actual = meal[m];
    const deltaPct = actual === 0 ? 0 : ((you - actual) / actual) * 100;
    const accuracy = Math.max(0, 100 - Math.abs(deltaPct));
    total += accuracy;
    perMacro[m] = { you, actual, deltaPct };
  }

  return {
    composite: Math.round(total / activeMacros.length),
    perMacro,
  };
}

// helpers used by the SessionScreen ----------------------------------

export function sessionAvg(composites: number[]): number {
  if (composites.length === 0) return 0;
  return Math.round(
    composites.reduce((s, n) => s + n, 0) / composites.length,
  );
}

/**
 * For a list of outcomes, compute the average accuracy per macro across
 * those rounds. Returns 0 for macros that never appeared.
 */
export function macroAccuracyAcross(
  outcomes: RoundOutcome[],
  macro: Macro,
): number {
  let count = 0;
  let total = 0;
  for (const o of outcomes) {
    const m = o.perMacro[macro];
    if (!m) continue;
    const acc = Math.max(0, 100 - Math.abs(m.deltaPct));
    total += acc;
    count += 1;
  }
  if (count === 0) return 0;
  return Math.round(total / count);
}
