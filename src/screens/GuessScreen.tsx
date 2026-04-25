import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Eyebrow } from '../components/Eyebrow';
import { MacroSlider } from '../components/MacroSlider';
import { MealPhoto } from '../components/MealPhoto';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusNav } from '../components/StatusNav';
import type { Meal } from '../data/meals';
import { colors, spacing } from '../theme';
import type { Guess } from '../types';

type Props = {
  meal: Meal;
  roundIndex: number;
  totalRounds: number;
  onSubmit: (guess: Guess) => void;
};

const INITIAL_GUESS: Guess = { calories: 450, protein: 22 };

export function GuessScreen({
  meal,
  roundIndex,
  totalRounds,
  onSubmit,
}: Props) {
  const [guess, setGuess] = useState<Guess>(INITIAL_GUESS);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <StatusNav
          left="9:41"
          right={`Round ${roundIndex + 1} of ${totalRounds}`}
        />

        <Eyebrow
          eyebrow="Estimate"
          title="What do you think this meal contains?"
        />

        <MealPhoto uri={meal.photo} />

        <MacroSlider
          macro="calories"
          value={guess.calories}
          onChange={(n) => setGuess((g) => ({ ...g, calories: n }))}
        />
        <MacroSlider
          macro="protein"
          value={guess.protein}
          onChange={(n) => setGuess((g) => ({ ...g, protein: n }))}
        />

        <View style={styles.footer}>
          <PrimaryButton
            label="Submit estimate"
            onPress={() => onSubmit(guess)}
          />
          <Text style={styles.helper}>
            Only the macros you've turned on appear here.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  helper: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
    marginTop: spacing.md,
  },
});
