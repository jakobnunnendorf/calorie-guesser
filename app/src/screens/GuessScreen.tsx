import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MacroSlider } from '../components/MacroSlider';
import { MealPhoto } from '../components/MealPhoto';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusNav } from '../components/StatusNav';
import type { Meal } from '../data/meals';
import { colors, spacing } from '../theme';
import type { Macro } from '../theme';
import type { Guess } from '../types';

type Props = {
  meal: Meal;
  roundIndex: number;
  totalRounds: number;
  activeMacros: Macro[];
  onSubmit: (guess: Guess) => void;
};

// Sliders start at 0 so each guess is a deliberate act, not a nudge
// away from a midpoint suggestion that biases the answer.
const SEED: Record<Macro, number> = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

// Photo grows to fill whatever vertical space the active-macro count
// leaves behind. The Submit CTA is pinned to the bottom so the photo
// always feels like the focal point.
const PHOTO_HEIGHT_BY_MACRO_COUNT: Record<number, number> = {
  1: 420,
  2: 360,
  3: 320,
  4: 280,
};

export function GuessScreen({
  meal,
  roundIndex,
  totalRounds,
  activeMacros,
  onSubmit,
}: Props) {
  const initial: Guess = {};
  for (const m of activeMacros) initial[m] = SEED[m];
  const [guess, setGuess] = useState<Guess>(initial);

  const photoHeight =
    PHOTO_HEIGHT_BY_MACRO_COUNT[activeMacros.length] ?? 280;

  return (
    <View style={styles.root}>
      <StatusNav
        left="Estimate the macros"
        right={`Round ${roundIndex + 1} of ${totalRounds}`}
      />

      <MealPhoto uri={meal.photo} height={photoHeight} />

      {activeMacros.map((m) => (
        <MacroSlider
          key={m}
          macro={m}
          value={guess[m] ?? 0}
          onChange={(n) => setGuess((g) => ({ ...g, [m]: n }))}
        />
      ))}

      {/* spacer pushes the footer to the bottom edge */}
      <View style={styles.spacer} />

      <View style={styles.footer}>
        <PrimaryButton
          label="Submit estimate"
          onPress={() => onSubmit(guess)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
