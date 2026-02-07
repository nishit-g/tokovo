import { liColors, liTypography, liSpacing } from "./tokens.js";

export type LIThemeMode = "light" | "dark";

export interface LIThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceRaised: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
  pill: string;
}

export interface LITheme {
  mode: LIThemeMode;
  colors: LIThemeColors;
  typography: typeof liTypography;
  spacing: typeof liSpacing;
}

export const LI_LIGHT: LITheme = {
  mode: "light",
  colors: { ...liColors },
  typography: liTypography,
  spacing: liSpacing,
};

export const LI_DARK: LITheme = {
  mode: "dark",
  colors: {
    background: "#0B1117",
    surface: "#0F1720",
    surfaceElevated: "#121E2A",
    surfaceRaised: "#142233",
    textPrimary: "#E6EDF3",
    textSecondary: "#9AA7B2",
    textMuted: "#6B7A87",
    border: "rgba(255,255,255,0.10)",
    borderStrong: "rgba(255,255,255,0.18)",
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.16)",
    success: "#4ADE80",
    danger: "#FB7185",
    warning: "#FBBF24",
    pill: "rgba(59,130,246,0.16)",
  },
  typography: liTypography,
  spacing: liSpacing,
};

export function getLITheme(mode: LIThemeMode = "light"): LITheme {
  return mode === "dark" ? LI_DARK : LI_LIGHT;
}
