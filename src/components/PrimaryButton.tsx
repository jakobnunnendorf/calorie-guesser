import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'ghost';
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'solid' ? styles.solid : styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View>
        <Text
          style={[
            styles.label,
            variant === 'ghost' && styles.labelGhost,
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: {
    backgroundColor: colors.ink,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },
  disabled: {
    backgroundColor: colors.canvas,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  labelGhost: {
    color: colors.ink,
  },
  labelDisabled: {
    color: colors.muted,
  },
});
