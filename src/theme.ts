// Color tokens lifted from the Direction 2 (iOS-style minimal) mock-up.
// Keep this list small on purpose — the design leans on whitespace,
// not chrome.

export const colors = {
  ink: '#1c1c1e',
  muted: '#8e8e93',
  line: '#e5e5ea',
  bg: '#ffffff',
  canvas: '#f2f2f7',

  // semantic feedback
  good: '#34c759',
  warn: '#ff9f0a',
  bad: '#ff3b30',

  // macro accents
  cal: '#ff9500',
  pro: '#007aff',
  car: '#af52de',
  fat: '#ff2d55',

  // ring gradient (used as start/end stops)
  ringStart: '#34c759',
  ringEnd: '#30b0c7',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

// On iOS we lean on the system font (SF Pro). On Android & web, fall
// back to the platform default — they're close enough for an MVP.
export const fontFamily = {
  display: undefined as string | undefined,
  text: undefined as string | undefined,
};

export type Macro = 'calories' | 'protein';

export const macroMeta: Record<
  Macro,
  { label: string; unit: string; max: number; step: number; color: string }
> = {
  calories: {
    label: 'Calories',
    unit: 'kcal',
    max: 1200,
    step: 10,
    color: colors.cal,
  },
  protein: {
    label: 'Protein',
    unit: 'g',
    max: 80,
    step: 1,
    color: colors.pro,
  },
};
