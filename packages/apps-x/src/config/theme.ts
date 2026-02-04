import { xColors, xTypography, xSpacing } from "../components/tokens";

export interface XThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceRaised: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
  link: string;
  pill: string;
}

export interface XTheme {
  mode: "dark" | "light";
  colors: XThemeColors;
  typography: typeof xTypography;
  spacing: typeof xSpacing;
}

export const X_DARK: XTheme = {
  mode: "dark",
  colors: {
    background: xColors.background,
    surface: xColors.surface,
    surfaceElevated: xColors.surfaceElevated,
    surfaceRaised: xColors.surfaceRaised,
    textPrimary: xColors.textPrimary,
    textSecondary: xColors.textSecondary,
    textMuted: xColors.textMuted,
    textFaint: xColors.textFaint,
    border: xColors.border,
    borderStrong: xColors.borderStrong,
    accent: xColors.accent,
    accentSoft: xColors.accentSoft,
    success: xColors.success,
    danger: xColors.danger,
    warning: xColors.warning,
    link: xColors.link,
    pill: xColors.pill,
  },
  typography: xTypography,
  spacing: xSpacing,
};

export const X_LIGHT: XTheme = {
  mode: "light",
  colors: {
    background: "#FFFFFF",
    surface: "#F7F7F7",
    surfaceElevated: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    textPrimary: "#111111",
    textSecondary: "#4B5563",
    textMuted: "#6B7280",
    textFaint: "#94A3B8",
    border: "#E5E7EB",
    borderStrong: "#D1D5DB",
    accent: xColors.accent,
    accentSoft: "rgba(29,155,240,0.12)",
    success: xColors.success,
    danger: "#F91880",
    warning: "#F5A524",
    link: "#2563EB",
    pill: "rgba(0,0,0,0.06)",
  },
  typography: xTypography,
  spacing: xSpacing,
};

export function getXTheme(mode: "dark" | "light" = "dark"): XTheme {
  return mode === "light" ? X_LIGHT : X_DARK;
}
