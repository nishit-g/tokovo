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
export type LIThemeMode = "light" | "dark" | "ghibli";

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

export const LI_GHIBLI: LITheme = {
  mode: "ghibli",
  colors: {
    ...liColorsLight,
    background: "#F5EBDD",
    surface: "#FFF8EE",
    surfaceHover: "#F3E6D5",
    surfaceActive: "#E9D7C2",
    textPrimary: "#2E2A24",
    textSecondary: "#6F6658",
    textTertiary: "#9F907D",
    border: "rgba(91, 78, 59, 0.12)",
    borderStrong: "rgba(91, 78, 59, 0.18)",
    accent: "#4B8A72",
    accentHover: "#3C705C",
    accentLight: "rgba(75, 138, 114, 0.14)",
    reactionLike: "#5E93D0",
    reactionCelebrate: "#C58F51",
    reactionLove: "#D36E58",
    reactionInsightful: "#9C8A46",
    reactionCurious: "#8B78A6",
    reactionSupport: "#B1736B",
    success: "#5E8B67",
    successLight: "rgba(94, 139, 103, 0.12)",
    warning: "#A57B3F",
    warningLight: "rgba(165, 123, 63, 0.12)",
    online: "#5E8B67",
    badge: "#C46A59",
    skeleton: "rgba(91, 78, 59, 0.09)",
  },
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
  switch (mode) {
    case "dark":
      return LI_DARK;
    case "ghibli":
      return LI_GHIBLI;
    default:
      return LI_LIGHT;
  }
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
