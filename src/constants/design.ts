import { ViewStyle } from 'react-native';

// ─── Color Palette (Neo-Brutalism) ───
const neoColors = {
  // Backgrounds - Stark white or off-white for maximum contrast
  bg: '#F4F4F0',
  surface: '#FFFFFF',
  surfaceHigh: '#FFFFFF',

  // Primary Accent (Electric Blue)
  accent: '#0055FF',
  accentDark: '#003399',
  accentSoft: '#B3CCFF',

  // Secondary Accents (High Saturation)
  purple: '#B200FF',
  purpleSoft: '#E5B3FF',
  mint: '#00E054',
  mintSoft: '#B3FFCB',
  coral: '#FF4B00',
  coralSoft: '#FFC8B3',
  amber: '#FFDE00',
  amberSoft: '#FFF6B3',
  pink: '#FF007F',
  pinkSoft: '#FFB3D9',

  // Text
  textPrimary: '#000000',
  textSecondary: '#333333',
  textMuted: '#666666',

  // Semantic
  success: '#10B981',
  danger: '#F43F5E',

  // Utility
  white: '#FFFFFF',
  black: '#000000',

  // Shadows
  shadowColor: '#000000',
  shadowLight: '#000000',

  // Legacy aliases for compatibility
  border: '#000000',
  borderHigh: '#000000',
  yellow: '#EAB308',
  yellowDim: '#CA8A04',
  yellowSoft: '#FEF3C7',
};

export type ThemeColors = typeof neoColors;

export function getColors(): ThemeColors {
  return neoColors;
}

// ─── Spacing ───
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// ─── Radius (Neo-Brutalism = Sharp/Square) ───
export const Radius = {
  sm: 0,
  md: 4,
  lg: 8,
  xl: 12,
  full: 999, // Kept for true circles (like dots/avatars)
};

// ─── Typography (Heavy, Bold) ───
export const Typography = {
  displayLarge: { fontFamily: 'Poppins_900Black', fontSize: 28, letterSpacing: -1 },
  displayMedium: { fontFamily: 'Poppins_900Black', fontSize: 22, letterSpacing: -0.5 },
  titleLarge: { fontFamily: 'Poppins_800ExtraBold', fontSize: 18, letterSpacing: -0.5 },
  titleMedium: { fontFamily: 'Poppins_700Bold', fontSize: 16 },
  body: { fontFamily: 'Poppins_500Medium', fontSize: 14 },
  bodySmall: { fontFamily: 'Poppins_500Medium', fontSize: 12 },
  caption: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, letterSpacing: 0.5 },
  label: { fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' as const },
};

// ─── Category Colors (High Saturation) ───
export const CATEGORY_COLORS: Record<string, string> = {
  Physical: '#FF4B00', // Coral/Orange
  Intelligence: '#0055FF', // Blue
  Creativity: '#FF007F', // Pink
  Discipline: '#FFDE00', // Yellow
  Social: '#B200FF', // Purple
  Productivity: '#00E054', // Mint/Green
};

export const CATEGORY_ICONS: Record<string, string> = {
  Physical: 'Dumbbell',
  Intelligence: 'Brain',
  Creativity: 'Palette',
  Discipline: 'Shield',
  Social: 'Users',
  Productivity: 'Rocket',
};

// ─── Neo-Brutalism Styles ───
// Achieved by solid black borders and thick asymmetric bottom/right borders (simulating hard offset shadow)
export const ClayStyles: Record<string, ViewStyle> = {
  card: {
    backgroundColor: neoColors.surfaceHigh,
    borderRadius: Radius.md,
    padding: Spacing.md,
    
    borderWidth: 2,
    borderColor: '#000000',
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },
  
  cardHover: {
    backgroundColor: neoColors.surfaceHigh,
    borderRadius: Radius.md,
    padding: Spacing.md,
    
    borderWidth: 2,
    borderColor: '#000000',
    borderBottomWidth: 8,
    borderRightWidth: 8,
  },

  button: {
    backgroundColor: neoColors.accent,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: '#000000',
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },

  chip: {
    backgroundColor: neoColors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,

    borderWidth: 2,
    borderColor: '#000000',
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },

  soft: {
    backgroundColor: neoColors.surface,
    borderWidth: 2,
    borderColor: '#000000',
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: Radius.md,
  },

  input: {
    backgroundColor: neoColors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    minHeight: 50,

    borderWidth: 2,
    borderColor: '#000000',
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },

  navBar: {
    backgroundColor: neoColors.surface,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 3,
    borderTopColor: '#000000',
  },

  fab: {
    backgroundColor: neoColors.accent,
    borderRadius: Radius.md, // Square/blocky FAB
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: '#000000',
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },
};

// ─── Gantt Chart Colors ───
export const GanttColors = [
  '#F43F5E', // Vivid Rose
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#D946EF', // Fuchsia
];

export const ClayShadow = ClayStyles;
