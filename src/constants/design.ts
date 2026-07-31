export type ThemeMode = 'dark' | 'light';

const darkColors = {
  bg: '#0A0A0A',
  surface: '#111111',
  surfaceHigh: '#1A1A1A',
  border: '#222222',
  borderHigh: '#2E2E2E',
  yellow: '#FBBF24',
  yellowDim: '#78350F',
  yellowSoft: 'rgba(251, 191, 36, 0.1)',
  textPrimary: '#F5F5F5',
  textSecondary: '#71717A',
  textMuted: '#3F3F46',
  success: '#22C55E',
  danger: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
};

const lightColors = {
  bg: '#F8F8F8',
  surface: '#FFFFFF',
  surfaceHigh: '#F0F0F0',
  border: '#E2E2E2',
  borderHigh: '#D4D4D4',
  yellow: '#D97706',
  yellowDim: '#FEF3C7',
  yellowSoft: 'rgba(217, 119, 6, 0.08)',
  textPrimary: '#18181B',
  textSecondary: '#71717A',
  textMuted: '#A1A1AA',
  success: '#16A34A',
  danger: '#DC2626',
  white: '#FFFFFF',
  black: '#000000',
};

export type ThemeColors = typeof darkColors;

export function getColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Typography = {
  displayLarge: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  displayMedium: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  titleLarge: { fontSize: 20, fontWeight: '600' as const },
  titleMedium: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5 },
  label: { fontSize: 13, fontWeight: '500' as const },
};

export const CATEGORY_COLORS: Record<string, string> = {
  Physical: '#EF4444',
  Intelligence: '#3B82F6',
  Creativity: '#A855F7',
  Discipline: '#F97316',
  Social: '#EC4899',
  Productivity: '#22C55E',
};

export const CATEGORY_ICONS: Record<string, string> = {
  Physical: 'Dumbbell',
  Intelligence: 'Brain',
  Creativity: 'Palette',
  Discipline: 'Shield',
  Social: 'Users',
  Productivity: 'Rocket',
};
