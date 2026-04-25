import type { Meal } from './data/meals';
import type { Macro } from './theme';
import type { Guess, RoundOutcome } from './types';

// Composite accuracy: average of per-macro accuracy where
//   accuracy = max(0, 100 - |%error|).
// Simple and forgiving for an MVP — tweak later if the curve feels off.

const macros: Macro[] = ['calories', 'protein'];

export function score(guess: Guess, meal: Meal): RoundOutcome {
  const perMacro = {} as RoundOutcome['perMacro'];
  let total = 0;

  for (const m of macros) {
    const you = guess[m];
    const actual = meal[m];
    const deltaPct = actual === 0 ? 0 : ((you - actual) / actual) * 100;
    const accuracy = Math.max(0, 100 - Math.abs(deltaPct));
    total += accuracy;
    perMacro[m] = { you, actual, deltaPct };
  }

  return {
    composite: Math.round(total / macros.length),
    perMacro,
  };
}
