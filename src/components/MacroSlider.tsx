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

      <View style={styles.scale}>
        <Text style={styles.tick}>0</Text>
        <Text style={styles.tick}>{meta.max / 2}</Text>
        <Text style={styles.tick}>{meta.max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  swatch: {
    width: 8,
    height: 28,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
  },
  value: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.muted,
  },
  slider: {
    width: '100%',
    marginTop: spacing.md,
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  tick: {
    fontSize: 11,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
});
