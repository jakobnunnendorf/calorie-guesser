import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { LengthPicker } from '../components/LengthPicker';
import { MacroChips } from '../components/MacroChips';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusNav } from '../components/StatusNav';
import type { Meal } from '../data/meals';
import { macroAccuracyAcross, sessionAvg } from '../scoring';
import { colors, macroMeta, radii, spacing } from '../theme';
import type { Macro } from '../theme';
import type { SessionLength, SessionRecord } from '../types';

type Props = {
  sessions: SessionRecord[];
  meals: Meal[];
  activeMacros: Macro[];
  onActiveMacrosChange: (m: Macro[]) => void;
  sessionLength: SessionLength;
  onSessionLengthChange: (n: SessionLength) => void;
  onStart: () => void;
};

export function SessionScreen({
  sessions,
  meals,
  activeMacros,
  onActiveMacrosChange,
  sessionLength,
  onSessionLengthChange,
  onStart,
}: Props) {
  const isEmpty = sessions.length === 0;
  const lastSession = sessions[sessions.length - 1];

  // for populated state: aggregate the last session's outcomes
  const composites = lastSession?.rounds.map((r) => r.outcome.composite) ?? [];
  const sessionScore = sessionAvg(composites);
  const lastSessionMacros = lastSession?.activeMacros ?? activeMacros;

  // chart points: composites of the last 14 sessions
  const last14 = useMemo(
    () =>
      sessions
        .slice(-14)
        .map((s) => sessionAvg(s.rounds.map((r) => r.outcome.composite))),
    [sessions],
  );

  // lifetime aggregates
  const lifetime = useMemo(() => {
    const allRoundOutcomes = sessions.flatMap((s) =>
      s.rounds.map((r) => r.outcome),
    );
    const allComposites = allRoundOutcomes.map((o) => o.composite);
    const lifeAcc =
      allComposites.length === 0
        ? 0
        : Math.round(
            allComposites.reduce((s, n) => s + n, 0) / allComposites.length,
          );
    // strongest / weakest macro across lifetime
    const macroAccs: Array<{ macro: Macro; acc: number }> = [];
    for (const m of activeMacros) {
      const acc = macroAccuracyAcross(allRoundOutcomes, m);
      if (acc > 0 || allRoundOutcomes.some((o) => o.perMacro[m])) {
        macroAccs.push({ macro: m, acc });
      }
    }
    macroAccs.sort((a, b) => b.acc - a.acc);
    return {
      sessionsCount: sessions.length,
      platesCount: allRoundOutcomes.length,
      lifeAcc,
      strongest: macroAccs[0],
      weakest: macroAccs[macroAccs.length - 1],
    };
  }, [sessions, activeMacros]);

  // -------- render -----------------------------------------------------
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <StatusNav
          left="9:41"
          right={
            isEmpty
              ? 'No sessions yet'
              : `Session ${sessions.length} · complete`
          }
        />

        <View style={styles.head}>
          <Text style={styles.eyebrow}>
            {isEmpty ? 'Welcome' : 'Session summary'}
          </Text>
          <Text style={styles.title}>
            {isEmpty
              ? 'Build your macro intuition.'
              : `Nice run. ${sessionScore}% on ${lastSession.rounds.length} plates.`}
          </Text>
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <HeroRing value={isEmpty ? null : sessionScore} />
          <View style={styles.heroStats}>
            {(isEmpty ? activeMacros : lastSessionMacros).map((m) => {
              const meta = macroMeta[m];
              const acc = isEmpty
                ? null
                : macroAccuracyAcross(
                    lastSession.rounds.map((r) => r.outcome),
                    m,
                  );
              return (
                <View key={m} style={styles.heroStat}>
                  <Text style={styles.heroLbl}>{meta.label}</Text>
                  {acc === null ? (
                    <View style={[styles.sk, styles.heroSkBar]} />
                  ) : (
                    <Text
                      style={[styles.heroVal, { color: meta.color }]}
                    >
                      {acc}%
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* MACROS I CARE ABOUT */}
        <Text style={styles.subH}>Macros I care about</Text>
        <MacroChips active={activeMacros} onChange={onActiveMacrosChange} />

        {/* PER-ROUND */}
        <View style={styles.sectionH}>
          <Text style={styles.sectionLbl}>Per round</Text>
          <Text style={styles.sectionRight}>
            {isEmpty
              ? 'no rounds yet'
              : `${lastSession.rounds.length} plates`}
          </Text>
        </View>
        <View style={styles.rounds}>
          {(isEmpty
            ? Array.from({ length: 5 }).map((_, i) => null)
            : lastSession.rounds
          ).map((r, i) => (
            <RoundRow
              key={i}
              index={i}
              record={r}
              meals={meals}
              activeMacros={lastSessionMacros}
            />
          ))}
        </View>

        {isEmpty && (
          <View style={styles.prompt}>
            <Text style={styles.promptTitle}>
              Your first 5 plates will land here.
            </Text>
            <Text style={styles.promptBody}>
              Tap below to start your first session.
            </Text>
          </View>
        )}

        <LengthPicker
          value={sessionLength}
          onChange={onSessionLengthChange}
        />
        <View style={styles.footer}>
          <PrimaryButton
            label={isEmpty ? 'Start your first session' : 'Start next session'}
            onPress={onStart}
          />
        </View>

        {/* CHART */}
        <View style={styles.sectionH}>
          <Text style={styles.sectionLbl}>Last 14 sessions</Text>
          <Text style={[styles.sectionRight, !isEmpty && { color: colors.good }]}>
            {isEmpty ? '—' : '▲ trending'}
          </Text>
        </View>
        <ProgressChart values={last14} />

        {/* LIFETIME */}
        <View style={styles.sectionH}>
          <Text style={styles.sectionLbl}>Lifetime</Text>
          <Text style={styles.sectionRight}>
            {isEmpty ? 'since today' : `${lifetime.sessionsCount} sessions`}
          </Text>
        </View>
        <View style={styles.statsGrid}>
          <Tile label="Sessions" value={isEmpty ? null : String(lifetime.sessionsCount)} />
          <Tile label="Plates guessed" value={isEmpty ? null : String(lifetime.platesCount)} />
          <Tile label="Lifetime accuracy" value={isEmpty ? null : `${lifetime.lifeAcc}%`} />
          <SplitTile
            strongestMacro={isEmpty ? null : lifetime.strongest?.macro ?? null}
            strongestPct={isEmpty ? null : lifetime.strongest?.acc ?? null}
            weakestMacro={isEmpty ? null : lifetime.weakest?.macro ?? null}
            weakestPct={isEmpty ? null : lifetime.weakest?.acc ?? null}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// =====================================================================
// HeroRing
// =====================================================================
function HeroRing({ value }: { value: number | null }) {
  const r = 42;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  const v = value ?? 0;
  const offset = circumference * (1 - v / 100);
  const isEmpty = value === null;
  return (
    <View style={styles.ring}>
      <Svg viewBox="0 0 100 100" width={156} height={156}>
        <Defs>
          <SvgLinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.ringStart} />
            <Stop offset="100%" stopColor={colors.ringEnd} />
          </SvgLinearGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={r} fill="none"
          stroke={colors.skeleton} strokeWidth={10} />
        {!isEmpty && (
          <Circle cx={cx} cy={cy} r={r} fill="none"
            stroke="url(#ring)" strokeWidth={10} strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        )}
        <SvgText x={cx} y={cy + 7} textAnchor="middle"
          fontSize={22} fontWeight="700"
          fill={isEmpty ? colors.mutedSoft : colors.ink}>
          {isEmpty ? '—' : String(value)}
        </SvgText>
      </Svg>
    </View>
  );
}

// =====================================================================
// RoundRow — either a real round or a skeleton
// =====================================================================
function RoundRow({
  index,
  record,
  meals,
  activeMacros,
}: {
  index: number;
  record: { mealId: string; outcome: any } | null;
  meals: Meal[];
  activeMacros: Macro[];
}) {
  const isEmpty = !record;
  const meal = record ? meals.find((m) => m.id === record.mealId) : null;
  const composite = record?.outcome?.composite ?? null;

  const accStyle =
    composite === null
      ? null
      : composite >= 80
        ? styles.accGood
        : composite >= 65
          ? styles.accWarn
          : styles.accBad;

  return (
    <View style={[styles.round, index === 0 && styles.roundFirst]}>
      <Text style={styles.roundNum}>
        {String(index + 1).padStart(2, '0')}
      </Text>
      {isEmpty || !meal ? (
        <View style={[styles.sk, styles.roundPicSk]} />
      ) : (
        <Image
          source={{ uri: meal.photo }}
          style={styles.roundPic}
        />
      )}
      <View style={styles.roundMeta}>
        {isEmpty ? (
          <>
            <View style={[styles.sk, styles.skBarLg, { width: '60%' }]} />
            <View style={[styles.sk, styles.skBarSm, { width: '38%', marginTop: 6 }]} />
          </>
        ) : (
          <>
            <Text style={styles.roundName} numberOfLines={1}>
              {meal!.caption}
            </Text>
            <View style={styles.breakdown}>
              {activeMacros.map((m, i) => {
                const cell = record!.outcome.perMacro[m];
                if (!cell) return null;
                const acc = Math.max(0, 100 - Math.abs(cell.deltaPct));
                const meta = macroMeta[m];
                return (
                  <View key={m} style={[styles.bdItem, i === 0 && { marginLeft: 0 }]}>
                    <View style={[styles.bdDot, { backgroundColor: meta.color }]} />
                    <Text style={styles.bdText}>{Math.round(acc)}%</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>
      {isEmpty ? (
        <View style={[styles.sk, styles.roundAccSk]} />
      ) : (
        <Text style={[styles.roundAcc, accStyle]}>{composite}</Text>
      )}
    </View>
  );
}

// =====================================================================
// ProgressChart — line over up-to-14 sessions, or empty grid
// =====================================================================
function ProgressChart({ values }: { values: number[] }) {
  const W = 380;
  const H = 130;
  const PAD_X = 14;
  const PAD_TOP = 14;
  const PAD_BOT = 32;

  const isEmpty = values.length < 2;

  const points = isEmpty
    ? []
    : values.map((v, i) => {
        const x = PAD_X + (i * (W - 2 * PAD_X)) / (values.length - 1 || 1);
        const y =
          PAD_TOP +
          (1 - Math.max(0, Math.min(100, v)) / 100) * (H - PAD_TOP - PAD_BOT);
        return { x, y };
      });

  const path =
    points
      .map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`))
      .join(' ') || '';
  const area = isEmpty
    ? ''
    : `${path} L${points[points.length - 1].x} ${H - PAD_BOT} L${points[0].x} ${H - PAD_BOT} Z`;

  return (
    <View style={styles.chartWrap}>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={130}>
        {/* gridlines at 50 / 75 / 100 */}
        {[14, 56, 98].map((y, i) => (
          <Line key={y}
            x1={0} y1={y} x2={W} y2={y}
            stroke={colors.line}
            strokeWidth={0.6}
            strokeDasharray="2 3" />
        ))}
        <SvgText x={W - 5} y={13} textAnchor="end" fontSize={9}
          fill={isEmpty ? colors.mutedSoft : colors.muted}>100</SvgText>
        <SvgText x={W - 5} y={55} textAnchor="end" fontSize={9}
          fill={isEmpty ? colors.mutedSoft : colors.muted}>75</SvgText>
        <SvgText x={W - 5} y={97} textAnchor="end" fontSize={9}
          fill={isEmpty ? colors.mutedSoft : colors.muted}>50</SvgText>

        {!isEmpty && (
          <>
            <Defs>
              <SvgLinearGradient id="af" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.good} stopOpacity={0.22} />
                <Stop offset="100%" stopColor={colors.good} stopOpacity={0} />
              </SvgLinearGradient>
            </Defs>
            <Path d={area} fill="url(#af)" />
            <Path d={path} fill="none" stroke={colors.good} strokeWidth={2}
              strokeLinejoin="round" strokeLinecap="round" />
            <Circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={4} fill="#fff" stroke={colors.good} strokeWidth={2.4} />
          </>
        )}
      </Svg>
      {isEmpty && (
        <View style={styles.chartOverlay} pointerEvents="none">
          <View style={styles.chartPill}>
            <Text style={styles.chartPillText}>
              Your trend appears after a few sessions
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// =====================================================================
// Tile / SplitTile
// =====================================================================
function Tile({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLbl}>{label}</Text>
      {value === null ? (
        <View style={[styles.sk, styles.tileSk]} />
      ) : (
        <Text style={styles.tileVal}>{value}</Text>
      )}
    </View>
  );
}

function SplitTile({
  strongestMacro,
  strongestPct,
  weakestMacro,
  weakestPct,
}: {
  strongestMacro: Macro | null;
  strongestPct: number | null;
  weakestMacro: Macro | null;
  weakestPct: number | null;
}) {
  const empty = strongestMacro === null;
  // colour intentionally swapped: orange (cal) is associated with "wrong",
  // so use it on the weakest side regardless of which macro it is.
  return (
    <View style={[styles.tile, styles.split]}>
      <View style={styles.splitHalf}>
        <Text style={styles.tileLbl}>Strongest</Text>
        {empty ? (
          <>
            <View style={[styles.sk, styles.splitSk]} />
            <View style={[styles.sk, styles.splitNameSk]} />
          </>
        ) : (
          <>
            <Text style={[styles.tileVal, { color: colors.pro }]}>
              {strongestPct}%
            </Text>
            <Text style={styles.splitMacro}>
              {macroMeta[strongestMacro!].label}
            </Text>
          </>
        )}
      </View>
      <View style={[styles.splitHalf, styles.splitHalfRight]}>
        <Text style={styles.tileLbl}>Weakest</Text>
        {empty ? (
          <>
            <View style={[styles.sk, styles.splitSk]} />
            <View style={[styles.sk, styles.splitNameSk]} />
          </>
        ) : (
          <>
            <Text style={[styles.tileVal, { color: colors.cal }]}>
              {weakestPct}%
            </Text>
            <Text style={styles.splitMacro}>
              {macroMeta[weakestMacro!].label}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

// =====================================================================
// Styles
// =====================================================================
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: spacing.xxxl },

  head: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  eyebrow: {
    fontSize: 13,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.6,
    lineHeight: 36,
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  ring: { width: 156, height: 156, alignItems: 'center', justifyContent: 'center' },
  heroStats: { flex: 1, gap: 14 },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroLbl: {
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    width: 70,
  },
  heroVal: {
    fontSize: 22,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
  },
  heroSkBar: { height: 22, width: 64 },

  subH: {
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    paddingBottom: 6,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.muted,
  },

  sectionH: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    paddingBottom: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    marginTop: spacing.sm,
  },
  sectionLbl: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.muted,
  },
  sectionRight: {
    marginLeft: 'auto',
    fontSize: 12,
    color: colors.muted,
  },

  rounds: { paddingHorizontal: spacing.xl, paddingBottom: 4 },
  round: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  roundFirst: { borderTopWidth: 0 },
  roundNum: {
    fontSize: 13,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
    width: 24,
  },
  roundPic: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: colors.canvas,
  },
  roundPicSk: { width: 44, height: 44, borderRadius: 10 },
  roundMeta: { flex: 1 },
  roundName: { fontSize: 14, fontWeight: '500', color: colors.ink },
  breakdown: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  bdItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  bdDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  bdText: {
    fontSize: 11, color: colors.muted, fontVariant: ['tabular-nums'],
  },
  roundAcc: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
    minWidth: 30,
    textAlign: 'right',
  },
  roundAccSk: { width: 28, height: 18 },
  accGood: { color: colors.good },
  accWarn: { color: colors.warn },
  accBad: { color: colors.bad },

  prompt: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md + 2,
    backgroundColor: colors.canvas,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 2,
  },
  promptBody: { fontSize: 13, color: colors.muted },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },

  chartWrap: {
    marginHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    position: 'relative',
  },
  chartOverlay: {
    position: 'absolute',
    top: 12, bottom: 8, left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  chartPill: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radii.pill,
  },
  chartPillText: {
    fontSize: 12, color: colors.muted, textAlign: 'center',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingTop: 4,
    paddingBottom: spacing.xl,
  },
  tile: {
    width: '48%',
    backgroundColor: colors.canvas,
    borderRadius: radii.lg,
    padding: 14,
  },
  tileLbl: {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8,
    color: colors.muted,
  },
  tileVal: {
    fontSize: 26, fontWeight: '600', color: colors.ink,
    marginTop: 4, letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  tileSk: { height: 28, width: '60%', marginTop: 6 },

  split: { padding: 0, flexDirection: 'row' },
  splitHalf: { flex: 1, padding: 14 },
  splitHalfRight: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.line },
  splitSk: { height: 26, width: '70%', marginTop: 4 },
  splitNameSk: { height: 10, width: '60%', marginTop: 6 },
  splitMacro: {
    fontSize: 13, fontWeight: '500', color: colors.ink, marginTop: 2,
  },

  // generic skeleton
  sk: {
    backgroundColor: colors.skeleton,
    borderRadius: 6,
  },
  skBarLg: { height: 10 },
  skBarSm: { height: 8 },
});
