import type { Macro } from './theme';

export type Guess = Partial<Record<Macro, number>>;

export type RoundOutcome = {
  composite: number; // 0..100
  perMacro: Partial<Record<Macro, { you: number; actual: number; deltaPct: number }>>;
};

export type RoundRecord = {
  mealId: string;
  outcome: RoundOutcome;
};

export type SessionRecord = {
  id: string;
  finishedAt: number; // epoch ms
  rounds: RoundRecord[];
  activeMacros: Macro[];
};

export type SessionLength = 5 | 10 | 15;
