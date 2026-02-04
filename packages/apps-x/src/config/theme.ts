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
  // Action states
  replyActive: string;
  repostActive: string;
  likeActive: string;
  bookmarkActive: string;
  // Status
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
    replyActive: xColors.replyActive,
    repostActive: xColors.repostActive,
    likeActive: xColors.likeActive,
    bookmarkActive: xColors.bookmarkActive,
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
    surface: "#F7F9F9",
    surfaceElevated: "#FFFFFF",
    surfaceRaised: "#EFF3F4",
    textPrimary: "#0F1419",
    textSecondary: "#536471",
    textMuted: "#71767B",
    textFaint: "#B4B9BE",
    border: "#EFF3F4",
    borderStrong: "#CFD9DE",
    accent: "#1D9BF0",
    accentSoft: "rgba(29,155,240,0.1)",
    replyActive: "#1D9BF0",
    repostActive: "#00BA7C",
    likeActive: "#F91880",
    bookmarkActive: "#1D9BF0",
    success: "#00BA7C",
    danger: "#F91880",
    warning: "#FFAD1F",
    link: "#1D9BF0",
    pill: "rgba(15,20,25,0.1)",
  },
  typography: xTypography,
  spacing: xSpacing,
};

export function getXTheme(mode: "dark" | "light" = "dark"): XTheme {
  return mode === "light" ? X_LIGHT : X_DARK;
}
