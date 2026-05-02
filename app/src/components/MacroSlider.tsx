import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, macroMeta, spacing } from '../theme';
import type { Macro } from '../theme';

type Props = {
  macro: Macro;
  value: number;
  onChange: (n: number) => void;
};

// Compact one-row design: a tiny color swatch, the macro name,
// and the live numeric value all on a single line; slider below.
// No scale labels — they take vertical space without earning it.

export function MacroSlider({ macro, value, onChange }: Props) {
  const meta = macroMeta[macro];

  return (
    <View style={styles.field}>
      <View style={styles.row}>
        <View style={[styles.swatch, { backgroundColor: meta.color }]} />
        <Text style={styles.name}>{meta.label}</Text>
        <Text style={styles.value}>
          {Math.round(value)}
          <Text style={styles.unit}> {meta.unit}</Text>
        </Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={meta.max}
        step={meta.step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.ink}
        maximumTrackTintColor={colors.line}
        thumbTintColor={colors.bg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    paddingVertical: 8,
    paddingHorizontal: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  swatch: {
    width: 6,
    height: 22,
    borderRadius: 3,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
  },
  value: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.muted,
  },
  slider: {
    width: '100%',
    height: 28,
    marginTop: 2,
  },
});
