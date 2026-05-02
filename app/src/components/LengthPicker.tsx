import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme';
import type { SessionLength } from '../types';

const OPTIONS: SessionLength[] = [5, 10, 15];

type Props = {
  value: SessionLength;
  onChange: (n: SessionLength) => void;
};

export function LengthPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Rounds in next session</Text>
      <View style={styles.segs}>
        {OPTIONS.map((n) => {
          const active = n === value;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              style={({ pressed }) => [
                styles.seg,
                active && styles.segOn,
                pressed && !active && styles.pressed,
              ]}
            >
              <Text style={[styles.segLabel, active && styles.segLabelOn]}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    padding: 12,
    paddingLeft: 16,
    backgroundColor: colors.canvas,
    borderRadius: radii.lg,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
  },
  segs: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    padding: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  seg: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  segOn: {
    backgroundColor: colors.ink,
  },
  pressed: { opacity: 0.6 },
  segLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  segLabelOn: { color: '#fff' },
});
