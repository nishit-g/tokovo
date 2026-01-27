// =====================================================
// THEME CONFIGURATION - Light/Dark mode support
// =====================================================

import { demoColors, demoTypography, demoSpacing } from "../components/tokens";

export interface DemoThemeColors {
  primary: string;
  background: string;
  text: string;
  noteCard: string;
  border: string;
}

export interface DemoTheme {
  mode: "light" | "dark";
  colors: DemoThemeColors;
  typography: typeof demoTypography;
  spacing: typeof demoSpacing;
}

// Light mode theme
export const DEMO_LIGHT: DemoTheme = {
  mode: "light",
  colors: {
    primary: demoColors.primary,
    background: demoColors.background,
    text: demoColors.textPrimary,
    noteCard: demoColors.noteCardBackground,
    border: demoColors.noteCardBorder,
  },
  typography: demoTypography,
  spacing: demoSpacing,
};

// Dark mode theme
export const DEMO_DARK: DemoTheme = {
  mode: "dark",
  colors: {
    primary: demoColors.primaryLight,
    background: "#1C1C1E",
    text: "#FFFFFF",
    noteCard: "#2C2C2E",
    border: "#3A3A3C",
  },
  typography: demoTypography,
  spacing: demoSpacing,
};

// Theme getter
export function getDemoTheme(mode: "light" | "dark"): DemoTheme {
  return mode === "dark" ? DEMO_DARK : DEMO_LIGHT;
}
