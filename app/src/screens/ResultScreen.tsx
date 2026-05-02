import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AccuracyRing } from '../components/AccuracyRing';
import { Eyebrow } from '../components/Eyebrow';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusNav } from '../components/StatusNav';
import { colors, macroMeta, radii, spacing } from '../theme';
import type { Macro } from '../theme';
import type { RoundOutcome } from '../types';

type Props = {
  outcome: RoundOutcome;
  roundIndex: number;
  totalRounds: number;
  activeMacros: Macro[];
  rollingAvg: number;
  bestStreak: number;
  onContinue: () => void;
};

function accuracyToVerdict(acc: number): 'good' | 'warn' | 'bad' {
  if (acc >= 90) return 'good';
  if (acc >= 75) return 'warn';
  return 'bad';
}

function headlineFor(composite: number): string {
  if (composite >= 90) return 'Pinpoint.';
  if (composite >= 80) return 'Solid read.';
  if (composite >= 65) return 'Decent guess.';
  if (composite >= 50) return 'Worth another look.';
  return 'Off this round.';
}

export function ResultScreen({
  outcome,
  roundIndex,
  totalRounds,
  activeMacros,
  rollingAvg,
  bestStreak,
  onContinue,
}: Props) {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <StatusNav left="9:43" right={`Round ${roundIndex + 1} · result`} />

        <Eyebrow
          eyebrow="Your accuracy"
          title={headlineFor(outcome.composite)}
        />

        <View style={styles.ringWrap}>
          <AccuracyRing value={outcome.composite} />
          <View style={styles.ringMeta}>
            <Text style={styles.ringTitle}>
              {outcome.composite}% match overall.
            </Text>
            <Text style={styles.ringSub}>
              {findHeadlineNote(outcome, activeMacros)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {activeMacros.map((m) => {
            const meta = macroMeta[m];
            const row = outcome.perMacro[m];
            if (!row) return null;
            const accuracy = Math.max(0, 100 - Math.abs(row.deltaPct));
            const verdict = accuracyToVerdict(accuracy);
            return (
              <View key={m} style={styles.row}>
                <View style={styles.left}>
                  <Text style={styles.lbl}>{meta.label}</Text>
                  <Text style={styles.val}>
                    {Math.round(row.you)} {meta.unit}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.actual}>
                    Actual {Math.round(row.actual)} {meta.unit}
                  </Text>
                  <Text style={[styles.delta, deltaStyle[verdict]]}>
                    {accuracy.toFixed(1)}%
                  </Text>
                </View>
              </View>
            );
          })}

          <View style={styles.stats}>
            <Stat label="7-day avg" value={`${Math.round(rollingAvg)}%`} />
            <Stat label="Best streak" value={String(bestStreak)} />
            <Stat
              label="Round"
              value={`${roundIndex + 1} / ${totalRounds}`}
            />
          </View>

          <View style={styles.footer}>
            <PrimaryButton label="Next meal" onPress={onContinue} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLbl}>{label}</Text>
      <Text style={styles.statVal}>{value}</Text>
    </View>
  );
}

// Pick a short coaching line based on which macro was the weakest read.
function findHeadlineNote(outcome: RoundOutcome, activeMacros: Macro[]): string {
  const entries = activeMacros
    .map((m) => {
      const cell = outcome.perMacro[m];
      if (!cell) return null;
      const acc = Math.max(0, 100 - Math.abs(cell.deltaPct));
      return { m, acc };
    })
    .filter((x): x is { m: Macro; acc: number } => x !== null);
  if (entries.length === 0) return '';
  entries.sort((a, b) => a.acc - b.acc); // weakest first
  const worst = entries[0];
  // if even the worst macro is high, celebrate
  if (worst.acc >= 94) {
    return 'Tightly clustered — every macro hit 94%+.';
  }
  const macroLabel = macroMeta[worst.m].label.toLowerCase();
  return `Your ${macroLabel} read was your weakest at ${worst.acc.toFixed(0)}%.`;
}

const deltaStyle = StyleSheet.create({
  good: { color: colors.good },
  warn: { color: colors.warn },
  bad: { color: colors.bad },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: spacing.xxxl },
  ringWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.xxl,
  },
  ringMeta: {
    flex: 1,
  },
  ringTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  ringSub: {
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  body: {
    paddingHorizontal: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg - 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  lbl: {
    fontSize: 13,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  val: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  actual: {
    fontSize: 13,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  delta: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    marginTop: spacing.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: radii.lg,
    padding: spacing.lg - 2,
  },
  statLbl: {
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statVal: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 2,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});
