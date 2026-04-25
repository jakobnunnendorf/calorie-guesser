import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { colors } from '../theme';

type Props = {
  /** 0..100 */
  value: number;
  size?: number;
};

export function AccuracyRing({ value, size = 140 }: Props) {
  const r = 42;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r; // ≈ 263.9
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.ringStart} />
            <Stop offset="100%" stopColor={colors.ringEnd} />
          </LinearGradient>
        </Defs>

        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={colors.canvas}
          strokeWidth={10}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          // start the arc at 12 o'clock instead of 3 o'clock
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        <SvgText
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          fontSize={20}
          fontWeight="700"
          fill={colors.ink}
        >
          {Math.round(clamped)}
        </SvgText>
        <SvgText
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fontSize={8}
          fill={colors.muted}
          letterSpacing={1}
        >
          ACCURACY
        </SvgText>
      </Svg>
    </View>
  );
}

// Simple text fallback in case react-native-svg isn't yet linked.
// Keeps the screen from blowing up while the user is still installing.
export function AccuracyRingFallback({ value }: { value: number }) {
  return (
    <View style={fallback.box}>
      <Text style={fallback.value}>{Math.round(value)}</Text>
      <Text style={fallback.label}>ACCURACY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const fallback = StyleSheet.create({
  box: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
  },
  label: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
});
