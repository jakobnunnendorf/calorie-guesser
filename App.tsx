import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { meals } from './src/data/meals';
import { GuessScreen } from './src/screens/GuessScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { score } from './src/scoring';
import { colors } from './src/theme';
import type { Guess, RoundOutcome } from './src/types';

type Phase =
  | { kind: 'guess' }
  | { kind: 'result'; guess: Guess; outcome: RoundOutcome };

export default function App() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>({ kind: 'guess' });
  const [history, setHistory] = useState<number[]>([]); // composite scores

  const meal = meals[roundIndex % meals.length];

  const rollingAvg = useMemo(() => {
    if (history.length === 0) return 0;
    const last = history.slice(-7);
    return last.reduce((s, n) => s + n, 0) / last.length;
  }, [history]);

  const bestStreak = useMemo(() => {
    // longest consecutive run of "good" rounds (>=80%)
    let best = 0;
    let cur = 0;
    for (const s of history) {
      if (s >= 80) {
        cur += 1;
        if (cur > best) best = cur;
      } else {
        cur = 0;
      }
    }
    return best;
  }, [history]);

  function handleSubmit(guess: Guess) {
    const outcome = score(guess, meal);
    setHistory((h) => [...h, outcome.composite]);
    setPhase({ kind: 'result', guess, outcome });
  }

  function handleContinue() {
    setRoundIndex((i) => i + 1);
    setPhase({ kind: 'guess' });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.stage}>
        {phase.kind === 'guess' ? (
          <GuessScreen
            // re-mount on round change so internal slider state resets
            key={`guess-${roundIndex}`}
            meal={meal}
            roundIndex={roundIndex}
            totalRounds={meals.length}
            onSubmit={handleSubmit}
          />
        ) : (
          <ResultScreen
            outcome={phase.outcome}
            roundIndex={roundIndex}
            totalRounds={meals.length}
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
