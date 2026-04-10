import { instagramColors, instagramSpacing, instagramTypography } from "./tokens.js";

export interface InstagramThemeColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentWarm: string;
  accentCool: string;
  success: string;
  storyRingA: string;
  storyRingB: string;
  storyRingC: string;
}

export interface InstagramTheme {
  mode: "light" | "dark" | "ghibli";
  colors: InstagramThemeColors;
  typography: typeof instagramTypography;
  spacing: typeof instagramSpacing;
}

export const INSTAGRAM_LIGHT_THEME: InstagramTheme = {
  mode: "light",
  colors: { ...instagramColors },
  typography: instagramTypography,
  spacing: instagramSpacing,
};

export const INSTAGRAM_DARK_THEME: InstagramTheme = {
  mode: "dark",
  colors: {
    ...instagramColors,
    background: "#0B0B0D",
    backgroundAlt: "#111114",
    surface: "#121216",
    surfaceRaised: "#1B1B20",
    border: "#2A2A33",
    borderStrong: "#383844",
    textPrimary: "#F5F5F5",
    textSecondary: "#B3B3BD",
    textMuted: "#7B7B88",
    accentSoft: "rgba(225,48,108,0.18)",
  },
  typography: instagramTypography,
  spacing: instagramSpacing,
};

export const INSTAGRAM_GHIBLI_THEME: InstagramTheme = {
  mode: "ghibli",
  colors: {
    ...instagramColors,
    background: "#F9F3E7",
    backgroundAlt: "#F3E7D3",
    surface: "#FFF8ED",
    surfaceRaised: "#F2E7D6",
    border: "#DDCFBB",
    borderStrong: "#CDBBA0",
    textPrimary: "#2D2823",
    textSecondary: "#726555",
    textMuted: "#A3937E",
    accent: "#CB6B4F",
    accentSoft: "rgba(203,107,79,0.16)",
    accentWarm: "#E29C45",
    accentCool: "#729A73",
    success: "#729A73",
    storyRingA: "#E7B65C",
    storyRingB: "#CB6B4F",
    storyRingC: "#729A73",
  },
  typography: instagramTypography,
  spacing: instagramSpacing,
};

export function getInstagramTheme(mode: "light" | "dark" | "ghibli" = "light"): InstagramTheme {
  switch (mode) {
    case "dark":
      return INSTAGRAM_DARK_THEME;
    case "ghibli":
      return INSTAGRAM_GHIBLI_THEME;
    default:
      return INSTAGRAM_LIGHT_THEME;
  }
}
