import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { meals } from './src/data/meals';
import { useStoredState } from './src/hooks/useStoredState';
import { GuessScreen } from './src/screens/GuessScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SessionScreen } from './src/screens/SessionScreen';
import { score, sessionAvg } from './src/scoring';
import { colors } from './src/theme';
import type { Macro } from './src/theme';
import type {
  Guess,
  RoundOutcome,
  RoundRecord,
  SessionLength,
  SessionRecord,
} from './src/types';

type Phase =
  | { kind: 'session' } // empty state OR between sessions
  | { kind: 'guess' }
  | { kind: 'result'; guess: Guess; outcome: RoundOutcome };

const STORAGE_KEYS = {
  sessions: 'cl:sessions',
  activeMacros: 'cl:activeMacros',
  sessionLength: 'cl:sessionLength',
} as const;

const DEFAULT_MACROS: Macro[] = ['calories', 'protein', 'carbs', 'fat'];

export default function App() {
  // ---- persisted state ----
  const [sessions, setSessions, sHydrated] = useStoredState<SessionRecord[]>(
    STORAGE_KEYS.sessions,
    [],
  );
  const [activeMacros, setActiveMacros, mHydrated] = useStoredState<Macro[]>(
    STORAGE_KEYS.activeMacros,
    DEFAULT_MACROS,
  );
  const [sessionLength, setSessionLength, lHydrated] =
    useStoredState<SessionLength>(STORAGE_KEYS.sessionLength, 5);

  const ready = sHydrated && mHydrated && lHydrated;

  // ---- in-memory only (per-launch) ----
  const [currentRounds, setCurrentRounds] = useState<RoundRecord[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: 'session' });
  const roundIndex = currentRounds.length;
  const meal = meals[(sessions.length + roundIndex) % meals.length];

  // helper aggregates for the per-round result screen
  const rollingAvg = (() => {
    const last7 = sessions
      .slice(-7)
      .map((s) => sessionAvg(s.rounds.map((r) => r.outcome.composite)));
    if (last7.length === 0) return 0;
    return last7.reduce((s, n) => s + n, 0) / last7.length;
  })();
  const bestStreak = (() => {
    let best = 0;
    let cur = 0;
    for (const s of sessions) {
      if (sessionAvg(s.rounds.map((r) => r.outcome.composite)) >= 80) {
        cur += 1;
        if (cur > best) best = cur;
      } else {
        cur = 0;
      }
    }
    return best;
  })();

  // ---- transitions ----
  function handleStart() {
    setCurrentRounds([]);
    setPhase({ kind: 'guess' });
  }

  function handleSubmit(guess: Guess) {
    const outcome = score(guess, meal, activeMacros);
    setPhase({ kind: 'result', guess, outcome });
  }

  function handleContinue() {
    if (phase.kind !== 'result') return;
    const newRecord: RoundRecord = {
      mealId: meal.id,
      outcome: phase.outcome,
    };
    const nextRounds = [...currentRounds, newRecord];
    if (nextRounds.length >= sessionLength) {
      // session done
      const newSession: SessionRecord = {
        id: `s-${Date.now()}`,
        finishedAt: Date.now(),
        rounds: nextRounds,
        activeMacros: [...activeMacros],
      };
      setSessions((prev) => [...prev, newSession]);
      setCurrentRounds([]);
      setPhase({ kind: 'session' });
    } else {
      // next round
      setCurrentRounds(nextRounds);
      setPhase({ kind: 'guess' });
    }
  }

  // hold the screen blank until storage hydrates so the user never sees
  // a brief flash of "no sessions yet" before their data arrives.
  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.stage}>
        {phase.kind === 'session' && (
          <SessionScreen
            sessions={sessions}
            activeMacros={activeMacros}
            onActiveMacrosChange={setActiveMacros}
            sessionLength={sessionLength}
            onSessionLengthChange={setSessionLength}
            onStart={handleStart}
          />
        )}

        {phase.kind === 'guess' && (
          <GuessScreen
            // re-mount on round change so internal slider state resets
            key={`guess-${sessions.length}-${roundIndex}`}
            meal={meal}
            roundIndex={roundIndex}
            totalRounds={sessionLength}
            activeMacros={activeMacros}
            onSubmit={handleSubmit}
          />
        )}

        {phase.kind === 'result' && (
          <ResultScreen
            outcome={phase.outcome}
            roundIndex={roundIndex}
            totalRounds={sessionLength}
            activeMacros={activeMacros}
            rollingAvg={rollingAvg}
            bestStreak={bestStreak}
            onContinue={handleContinue}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  stage: {
    flex: 1,
  },
});
