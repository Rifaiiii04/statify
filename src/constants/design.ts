import { ViewStyle } from 'react-native';

// ─── Color Palette (True Claymorphism) ───
const clayColors = {
  // Backgrounds - Needs to be slightly off-white for white highlights to show
  bg: '#F0F4F8',
  surface: '#F0F4F8',
  surfaceHigh: '#FFFFFF',

  // Primary Accent (Light Blue - "Biru Muda")
  accent: '#7CB9F9',
  accentDark: '#5A9DE3',
  accentSoft: 'rgba(124, 185, 249, 0.15)',

  // Secondary Accents (Pastel Palette)
  purple: '#A78BFA',
  purpleSoft: 'rgba(167, 139, 250, 0.15)',
  mint: '#6EE7B7',
  mintSoft: 'rgba(110, 231, 183, 0.15)',
  coral: '#FDA4AF',
  coralSoft: 'rgba(253, 164, 175, 0.15)',
  amber: '#FCD34D',
  amberSoft: 'rgba(252, 211, 77, 0.15)',
  pink: '#F9A8D4',
  pinkSoft: 'rgba(249, 168, 212, 0.15)',

  // Text
  textPrimary: '#334155',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Semantic
  success: '#6EE7B7',
  danger: '#FDA4AF',

  // Utility
  white: '#FFFFFF',
  black: '#1E293B',

  // Shadows
  shadowColor: '#B6C4D3',
  shadowLight: '#FFFFFF',

  // Legacy aliases
  border: '#E2E8F0',
  borderHigh: '#CBD5E1',
  yellow: '#7CB9F9',
  yellowDim: '#5A9DE3',
  yellowSoft: 'rgba(124, 185, 249, 0.15)',
};

export type ThemeColors = typeof clayColors;

export function getColors(): ThemeColors {
  return clayColors;
}

// ─── Spacing ───
export const Spacing = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// ─── Radius (Claymorphism = puffy) ───
export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

// ─── Typography (Poppins) ───
export const Typography = {
  displayLarge: { fontFamily: 'Poppins_700Bold', fontSize: 26, letterSpacing: -0.5 },
  displayMedium: { fontFamily: 'Poppins_700Bold', fontSize: 20, letterSpacing: -0.3 },
  titleLarge: { fontFamily: 'Poppins_600SemiBold', fontSize: 17 },
  titleMedium: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  body: { fontFamily: 'Poppins_400Regular', fontSize: 13 },
  bodySmall: { fontFamily: 'Poppins_400Regular', fontSize: 12 },
  caption: { fontFamily: 'Poppins_500Medium', fontSize: 10, letterSpacing: 0.5 },
  label: { fontFamily: 'Poppins_500Medium', fontSize: 11 },
};

// ─── Category Colors (Soft Pastel, harmonious) ───
export const CATEGORY_COLORS: Record<string, string> = {
  Physical: '#FDA4AF',
  Intelligence: '#7CB9F9',
  Creativity: '#A78BFA',
  Discipline: '#FCD34D',
  Social: '#F9A8D4',
  Productivity: '#6EE7B7',
};

export const CATEGORY_ICONS: Record<string, string> = {
  Physical: 'Dumbbell',
  Intelligence: 'Brain',
  Creativity: 'Palette',
  Discipline: 'Shield',
  Social: 'Users',
  Productivity: 'Rocket',
};

// ─── True Claymorphism Styles ───
// Achieved by combining drop shadow + top/left light border + bottom/right dark border
export const ClayStyles: Record<string, ViewStyle> = {
  card: {
    backgroundColor: clayColors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    
    // Light highlight (top-left) to make it look puffy
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.9)',
    
    // Darker inner shadow (bottom-right)
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    borderRightColor: 'rgba(0, 0, 0, 0.04)',

    // Outer Drop Shadow
    shadowColor: clayColors.shadowColor,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  cardHover: {
    backgroundColor: clayColors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.9)',
    
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
    borderRightColor: 'rgba(0, 0, 0, 0.03)',

    shadowColor: clayColors.shadowColor,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  button: {
    backgroundColor: clayColors.accent,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',

    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderRightColor: 'rgba(0, 0, 0, 0.1)',

    shadowColor: clayColors.accent,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  chip: {
    backgroundColor: clayColors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,

    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.9)',
    
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
    borderRightColor: 'rgba(0, 0, 0, 0.03)',

    shadowColor: clayColors.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  soft: {
    backgroundColor: clayColors.surface,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.9)',
    
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
    borderRightColor: 'rgba(0, 0, 0, 0.03)',

    shadowColor: clayColors.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  input: {
    backgroundColor: clayColors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    minHeight: 44,

    // Inputs usually have inset shadows (sunken). 
    // We reverse the borders to make it look debossed (pressed in)
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
    borderLeftColor: 'rgba(0, 0, 0, 0.04)',
    
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.8)',
    borderRightColor: 'rgba(255, 255, 255, 0.8)',

    // No drop shadow for debossed look, or very subtle light shadow
  },

  navBar: {
    backgroundColor: clayColors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.9)',

    borderRightWidth: 1.5,
    borderRightColor: 'rgba(0, 0, 0, 0.04)',

    shadowColor: clayColors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10, // Top shadow for android
  },

  fab: {
    backgroundColor: clayColors.accent,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',

    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    borderRightColor: 'rgba(0, 0, 0, 0.15)',

    shadowColor: clayColors.accent,
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
};

// ─── Gantt Chart Colors ───
export const GanttColors = [
  '#F4A261', // Orange
  '#E76F51', // Coral
  '#2A9D8F', // Teal
  '#E9C46A', // Yellow
  '#264653', // Deep Blue
  '#8AB17D', // Olive
  '#B5838D', // Mauve
];

// Deprecate ClayShadow standalone and alias it to ClayStyles so we don't break existing files that still import ClayShadow
export const ClayShadow = ClayStyles;
