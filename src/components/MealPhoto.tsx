import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme';

type Props = {
  uri: string;
  height?: number;
};

export function MealPhoto({ uri, height = 260 }: Props) {
  return (
    <View style={[styles.wrap, { height }]}>
      <Image
        source={{ uri }}
        style={styles.img}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.canvas,
  },
  img: {
    width: '100%',
    height: '100%',
  },
});
