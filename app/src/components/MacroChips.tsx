import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ALL_MACROS, colors, macroMeta, radii, spacing } from '../theme';
import type { Macro } from '../theme';

type Props = {
  active: Macro[];
  onChange: (next: Macro[]) => void;
};

export function MacroChips({ active, onChange }: Props) {
  const allOn = ALL_MACROS.every((m) => active.includes(m));

  function toggle(m: Macro) {
    if (active.includes(m)) {
      const next = active.filter((x) => x !== m);
      // never allow zero — default back to calories so scoring stays meaningful
      onChange(next.length === 0 ? ['calories'] : next);
    } else {
      onChange([...active, m]);
    }
  }

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(allOn ? ['calories', 'protein'] : [...ALL_MACROS])}
        style={({ pressed }) => [
          styles.chip,
          allOn && styles.chipOn,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.chipLabel, allOn && styles.chipLabelOn]}>All</Text>
      </Pressable>

      {ALL_MACROS.map((m) => {
        const on = active.includes(m);
        const meta = macroMeta[m];
        return (
          <Pressable
            key={m}
            onPress={() => toggle(m)}
            style={({ pressed }) => [
              styles.chip,
              on && styles.chipOn,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: meta.color },
                on && styles.dotOn,
              ]}
            />
            <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  chipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pressed: { opacity: 0.7 },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
  },
  chipLabelOn: { color: '#fff' },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  dotOn: {
    borderWidth: 1,
    borderColor: '#fff',
  },
});
