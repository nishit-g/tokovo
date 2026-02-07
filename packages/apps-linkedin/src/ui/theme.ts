import {
  liColorsLight,
  liColorsDark,
  liTypography,
  liSpacing,
  liRadius,
  liShadows,
  liAnimation,
} from "./tokens.js";

// =============================================================================
// TYPES
// =============================================================================
export type LIThemeMode = "light" | "dark";

// Use a general color interface so both light and dark colors are assignable
export interface LIColors {
  background: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  borderHover: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  reactionLike: string;
  reactionCelebrate: string;
  reactionLove: string;
  reactionInsightful: string;
  reactionCurious: string;
  reactionSupport: string;
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  online: string;
  badge: string;
  skeleton: string;
}

export type LITypography = typeof liTypography;
export type LISpacing = typeof liSpacing;
export type LIRadius = typeof liRadius;
export type LIShadows = typeof liShadows;
export type LIAnimation = typeof liAnimation;

export interface LITheme {
  mode: LIThemeMode;
  colors: LIColors;
  typography: LITypography;
  spacing: LISpacing;
  radius: LIRadius;
  shadows: LIShadows;
  animation: LIAnimation;
}

// =============================================================================
// THEME INSTANCES
// =============================================================================
export const LI_LIGHT: LITheme = {
  mode: "light",
  colors: liColorsLight,
  typography: liTypography,
  spacing: liSpacing,
  radius: liRadius,
  shadows: liShadows,
  animation: liAnimation,
};

export const LI_DARK: LITheme = {
  mode: "dark",
  colors: liColorsDark,
  typography: liTypography,
  spacing: liSpacing,
  radius: liRadius,
  shadows: liShadows,
  animation: liAnimation,
};

// =============================================================================
// HELPERS
// =============================================================================
export function getLITheme(mode: LIThemeMode = "light"): LITheme {
  return mode === "dark" ? LI_DARK : LI_LIGHT;
}

/**
 * Helper to create text styles from typography tokens
 */
export function textStyle(
  typography: LITypography,
  variant: keyof LITypography
): React.CSSProperties {
  if (variant === "fontFamily") {
    return { fontFamily: typography.fontFamily as string };
  }
  const style = typography[variant] as {
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
  };
  return {
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
  };
}
