import { xColors, xTypography, xSpacing } from "./tokens";

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

export type XThemeMode = "dark" | "light" | "ghibli";

export interface XTheme {
  mode: XThemeMode;
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

// Studio Ghibli inspired theme - soft, warm, handcrafted feel
export const X_GHIBLI: XTheme = {
  mode: "ghibli",
  colors: {
    // Soft sky blue from Ghibli backgrounds
    background: "#E8F4F8",
    surface: "#FDF8F3",
    surfaceElevated: "#FFFFFF",
    surfaceRaised: "#F5EDE4",
    // Warm earthy text colors
    textPrimary: "#2C3E50",
    textSecondary: "#5D6D7E",
    textMuted: "#839192",
    textFaint: "#B4C6C9",
    // Soft borders like watercolor edges
    border: "#D5C4A1",
    borderStrong: "#C4A77D",
    // Forest green accent (Totoro forest)
    accent: "#4A7C59",
    accentSoft: "rgba(74,124,89,0.15)",
    // Action colors - warm and organic
    replyActive: "#5B8A72",
    repostActive: "#7BA05B",
    likeActive: "#D4726A",
    bookmarkActive: "#B8860B",
    // Status colors - softer, more organic
    success: "#7BA05B",
    danger: "#C75B5B",
    warning: "#DAA520",
    link: "#4A7C59",
    pill: "rgba(44,62,80,0.08)",
  },
  typography: xTypography,
  spacing: xSpacing,
};

export function getXTheme(mode: XThemeMode = "dark"): XTheme {
  switch (mode) {
    case "light":
      return X_LIGHT;
    case "ghibli":
      return X_GHIBLI;
    default:
      return X_DARK;
  }
}
