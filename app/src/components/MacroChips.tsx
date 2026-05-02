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
      onChange(active.filter((x) => x !== m));
    } else {
      onChange([...active, m]);
    }
  }

  // "All" is a real toggle: deselects everything when all are on,
  // selects everything when not all are on.
  function toggleAll() {
    onChange(allOn ? [] : [...ALL_MACROS]);
  }

  return (
    <View style={styles.row}>
      <Pressable
        onPress={toggleAll}
        style={({ pressed }) => [
          styles.chip,
          allOn && styles.chipOn,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.chipLabel, allOn && styles.chipLabelOn]}>
          All
        </Text>
      </Pressable>

      {ALL_MACROS.map((m) => {
        // when "All" is on, individual pills read as unselected so the
        // selected state is mutually exclusive between "All" and the
        // four individuals.
        const on = !allOn && active.includes(m);
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
    gap: 4,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    fontSize: 12,
    fontWeight: '500',
    color: colors.ink,
  },
  chipLabelOn: { color: '#fff' },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
  dotOn: {
    borderWidth: 1,
    borderColor: '#fff',
  },
});
