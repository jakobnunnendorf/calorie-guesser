import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type Props = {
  left: string;
  right: string;
};

export function StatusNav({ left, right }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{left}</Text>
      <Text style={[styles.text, styles.right]}>{right}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: 4,
  },
  text: {
    fontSize: 13,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  right: {
    marginLeft: 'auto',
  },
});
