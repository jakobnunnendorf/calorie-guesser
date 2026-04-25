import type { Macro } from './theme';

export type Guess = Record<Macro, number>;

export type RoundOutcome = {
  composite: number; // 0..100
  perMacro: Record<Macro, { you: number; actual: number; deltaPct: number }>;
};
