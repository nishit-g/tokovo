export type TeamsThemeMode = "light" | "dark";
export type TeamsPlatform = "ios" | "android";
export type TeamsThemeId =
  | "teams-default"
  | "teams-ghibli"
  | "teams-summit";

export interface TeamsDesignTokens {
  id: TeamsThemeId;
  mode: TeamsThemeMode;
  platform: TeamsPlatform;
  color: {
    bg: string;
    shellStart: string;
    shellEnd: string;
    shellAurora: string;
    surface: string;
    surfaceElevated: string;
    surfaceOverlay: string;
    surfaceMuted: string;
    border: string;
    borderStrong: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    brand: string;
    brandStrong: string;
    brandSoft: string;
    brandGlow: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    presenceAvailable: string;
    presenceBusy: string;
    presenceAway: string;
    presenceOffline: string;
    hover: string;
    pressed: string;
    focusRing: string;
    selected: string;
    unreadBadge: string;
    mentionBadge: string;
    sentBubble: string;
    sentBubbleBorder: string;
    receivedBubble: string;
    receivedBubbleBorder: string;
    replyPreviewBg: string;
    replyPreviewText: string;
    composeBar: string;
    inputSurface: string;
    inputPlaceholder: string;
    tabBar: string;
    tabBarActive: string;
    tabBarInactive: string;
    callBackdropStart: string;
    callBackdropEnd: string;
    callHero: string;
    callTile: string;
    callTileBorder: string;
    callControl: string;
    callControlBorder: string;
  };
  typography: {
    fontFamily: string;
    fontFamilyMono: string;
    title: number;
    subtitle: number;
    body: number;
    caption: number;
    meta: number;
    badge: number;
    hero: number;
    lineHeightBody: number;
    lineHeightCaption: number;
  };
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    chip: number;
    card: number;
    input: number;
    panel: number;
    callBanner: number;
    avatar: number;
    bubble: number;
    pill: number;
  };
  shadow: {
    card: string;
    panel: string;
    overlay: string;
    bubble: string;
    glow: string;
  };
  motion: {
    fastMs: number;
    normalMs: number;
    slowMs: number;
    easing: string;
  };
  zIndex: {
    base: number;
    sticky: number;
    overlay: number;
    call: number;
  };
}

type ThemeOverride = Partial<{
  color: Partial<TeamsDesignTokens["color"]>;
  typography: Partial<TeamsDesignTokens["typography"]>;
  spacing: Partial<TeamsDesignTokens["spacing"]>;
  radius: Partial<TeamsDesignTokens["radius"]>;
  shadow: Partial<TeamsDesignTokens["shadow"]>;
  motion: Partial<TeamsDesignTokens["motion"]>;
  zIndex: Partial<TeamsDesignTokens["zIndex"]>;
}>;

const baseScales = {
  typography: {
    fontFamily:
      '"Aptos", "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif',
    fontFamilyMono: '"SF Mono", "Roboto Mono", Menlo, monospace',
    title: 20,
    subtitle: 14,
    body: 14,
    caption: 12,
    meta: 11,
    badge: 10,
    hero: 28,
    lineHeightBody: 20,
    lineHeightCaption: 16,
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    chip: 999,
    card: 16,
    input: 12,
    panel: 20,
    callBanner: 24,
    avatar: 999,
    bubble: 16,
    pill: 999,
  },
  shadow: {
    card: "0 4px 14px rgba(22, 35, 58, 0.06)",
    panel: "0 8px 24px rgba(22, 35, 58, 0.08)",
    overlay: "0 18px 36px rgba(15, 18, 30, 0.18)",
    bubble: "0 2px 8px rgba(22, 35, 58, 0.05)",
    glow: "0 0 0 1px rgba(91, 95, 199, 0.16)",
  },
  motion: {
    fastMs: 100,
    normalMs: 200,
    slowMs: 300,
    easing: "cubic-bezier(0.33, 0, 0.67, 1)",
  },
  zIndex: {
    base: 1,
    sticky: 10,
    overlay: 20,
    call: 30,
  },
};

function createTheme(
  platform: TeamsPlatform,
  mode: TeamsThemeMode,
  color: TeamsDesignTokens["color"],
): TeamsDesignTokens {
  return {
    id: "teams-default",
    platform,
    mode,
    color,
    ...baseScales,
  };
}

export const teamsIosLightTheme = createTheme("ios", "light", {
  bg: "#eef1f5",
  shellStart: "#eef1f5",
  shellEnd: "#eef1f5",
  shellAurora: "rgba(85, 88, 175, 0.08)",
  surface: "rgba(255,255,255,0.96)",
  surfaceElevated: "#ffffff",
  surfaceOverlay: "rgba(255,255,255,0.96)",
  surfaceMuted: "#f6f8fb",
  border: "rgba(22, 35, 58, 0.08)",
  borderStrong: "rgba(85, 88, 175, 0.22)",
  textPrimary: "#16233a",
  textSecondary: "rgba(22, 35, 58, 0.74)",
  textMuted: "rgba(22, 35, 58, 0.52)",
  textInverse: "#f9fbff",
  brand: "#5B5FC7",
  brandStrong: "#4b4fae",
  brandSoft: "rgba(91, 95, 199, 0.12)",
  brandGlow: "rgba(91, 95, 199, 0.16)",
  success: "#7fba00",
  warning: "#d18615",
  danger: "#c50e2e",
  info: "#2672db",
  presenceAvailable: "#7fba00",
  presenceBusy: "#c50e2e",
  presenceAway: "#d29d2b",
  presenceOffline: "rgba(22, 35, 58, 0.36)",
  hover: "rgba(22, 35, 58, 0.04)",
  pressed: "rgba(91, 95, 199, 0.08)",
  focusRing: "#5B5FC7",
  selected: "rgba(91, 95, 199, 0.12)",
  unreadBadge: "#c50e2e",
  mentionBadge: "#5B5FC7",
  sentBubble: "linear-gradient(180deg, #5B5FC7 0%, #6A6FD6 100%)",
  sentBubbleBorder: "rgba(91, 95, 199, 0.28)",
  receivedBubble: "#ffffff",
  receivedBubbleBorder: "rgba(22, 35, 58, 0.08)",
  replyPreviewBg: "rgba(85, 88, 175, 0.08)",
  replyPreviewText: "#465062",
  composeBar: "rgba(255,255,255,0.96)",
  inputSurface: "#f6f8fb",
  inputPlaceholder: "rgba(22, 35, 58, 0.46)",
  tabBar: "rgba(255,255,255,0.98)",
  tabBarActive: "#5558af",
  tabBarInactive: "rgba(22, 35, 58, 0.46)",
  callBackdropStart: "rgba(91,95,199,0.26)",
  callBackdropEnd: "#16233a",
  callHero: "rgba(255,255,255,0.08)",
  callTile: "rgba(255,255,255,0.06)",
  callTileBorder: "rgba(255,255,255,0.12)",
  callControl: "rgba(255,255,255,0.12)",
  callControlBorder: "rgba(255,255,255,0.14)",
});

export const teamsAndroidLightTheme: TeamsDesignTokens = {
  ...teamsIosLightTheme,
  platform: "android",
  color: {
    ...teamsIosLightTheme.color,
    shellStart: "#f2f5fc",
    shellEnd: "#e6ebf7",
    tabBar: "rgba(252,253,255,0.92)",
  },
  typography: {
    ...teamsIosLightTheme.typography,
    fontFamily:
      '"Aptos", Roboto, "Noto Sans", "Segoe UI", sans-serif',
  },
};

export const teamsIosDarkTheme = createTheme("ios", "dark", {
  bg: "#1b1b1f",
  shellStart: "#1b1b1f",
  shellEnd: "#17171b",
  shellAurora: "rgba(123, 131, 235, 0.08)",
  surface: "rgba(31,31,36,0.98)",
  surfaceElevated: "#292930",
  surfaceOverlay: "rgba(31,31,36,0.96)",
  surfaceMuted: "#32323a",
  border: "rgba(255, 255, 255, 0.1)",
  borderStrong: "rgba(123, 131, 235, 0.24)",
  textPrimary: "#ffffff",
  textSecondary: "rgba(255,255,255,0.74)",
  textMuted: "rgba(255,255,255,0.52)",
  textInverse: "#111826",
  brand: "#7B83EB",
  brandStrong: "#bac0ff",
  brandSoft: "rgba(123, 131, 235, 0.16)",
  brandGlow: "rgba(123, 131, 235, 0.14)",
  success: "#88bc2b",
  warning: "#f2a443",
  danger: "#ed1b3e",
  info: "#68a7ff",
  presenceAvailable: "#88bc2b",
  presenceBusy: "#ed1b3e",
  presenceAway: "#f2a443",
  presenceOffline: "rgba(255,255,255,0.36)",
  hover: "rgba(255,255,255,0.04)",
  pressed: "rgba(123, 131, 235, 0.12)",
  focusRing: "#7B83EB",
  selected: "rgba(123, 131, 235, 0.16)",
  unreadBadge: "#ed1b3e",
  mentionBadge: "#7B83EB",
  sentBubble: "linear-gradient(180deg, #5B5FC7 0%, #7077E6 100%)",
  sentBubbleBorder: "rgba(123, 131, 235, 0.26)",
  receivedBubble: "#34343a",
  receivedBubbleBorder: "rgba(255,255,255,0.08)",
  replyPreviewBg: "rgba(123, 131, 235, 0.14)",
  replyPreviewText: "#d1d8f3",
  composeBar: "rgba(34,34,38,0.98)",
  inputSurface: "#3a3a42",
  inputPlaceholder: "rgba(255,255,255,0.46)",
  tabBar: "rgba(34,34,38,0.98)",
  tabBarActive: "#7B83EB",
  tabBarInactive: "rgba(255,255,255,0.46)",
  callBackdropStart: "rgba(123,131,235,0.24)",
  callBackdropEnd: "#11131a",
  callHero: "rgba(255,255,255,0.08)",
  callTile: "rgba(255,255,255,0.08)",
  callTileBorder: "rgba(255,255,255,0.12)",
  callControl: "rgba(255,255,255,0.12)",
  callControlBorder: "rgba(255,255,255,0.14)",
});

export const teamsAndroidDarkTheme: TeamsDesignTokens = {
  ...teamsIosDarkTheme,
  platform: "android",
  typography: {
    ...teamsIosDarkTheme.typography,
    fontFamily:
      '"Aptos", Roboto, "Noto Sans", "Segoe UI", sans-serif',
  },
};

export const TEAMS_THEME_PRESETS: Record<TeamsThemeMode, TeamsDesignTokens> = {
  light: teamsIosLightTheme,
  dark: teamsIosDarkTheme,
};

const GHIBLI_OVERRIDES: ThemeOverride = {
  color: {
    bg: "#f3ede0",
    shellStart: "#f7f1e7",
    shellEnd: "#e7ddcd",
    shellAurora: "rgba(107, 154, 127, 0.2)",
    surface: "rgba(255,250,242,0.86)",
    surfaceElevated: "rgba(255,252,246,0.94)",
    surfaceOverlay: "rgba(255,250,242,0.74)",
    surfaceMuted: "rgba(245, 236, 222, 0.9)",
    border: "rgba(149, 130, 103, 0.16)",
    borderStrong: "rgba(107, 154, 127, 0.26)",
    textPrimary: "#2f342a",
    textSecondary: "#6f725f",
    textMuted: "#968b77",
    textInverse: "#fffef8",
    brand: "#6ba07f",
    brandStrong: "#5a8c6e",
    brandSoft: "rgba(107, 160, 127, 0.12)",
    brandGlow: "rgba(107, 160, 127, 0.24)",
    success: "#6ba07f",
    warning: "#cb9248",
    danger: "#d06f65",
    info: "#517aa6",
    presenceAvailable: "#6ba07f",
    presenceBusy: "#d06f65",
    presenceAway: "#d6a257",
    presenceOffline: "#ad9f88",
    selected: "rgba(107, 160, 127, 0.14)",
    unreadBadge: "#6ba07f",
    mentionBadge: "#517aa6",
    sentBubble: "linear-gradient(135deg, #97c2a3 0%, #c9dfca 100%)",
    sentBubbleBorder: "rgba(107, 160, 127, 0.24)",
    receivedBubble:
      "linear-gradient(180deg, rgba(255,253,247,0.98) 0%, rgba(247,240,226,0.92) 100%)",
    receivedBubbleBorder: "rgba(176, 159, 134, 0.18)",
    replyPreviewBg: "rgba(107, 160, 127, 0.1)",
    replyPreviewText: "#5b5e4d",
    composeBar: "rgba(255,250,242,0.88)",
    inputSurface:
      "linear-gradient(180deg, rgba(249,244,236,1) 0%, rgba(255,252,246,1) 100%)",
    inputPlaceholder: "#958c7a",
    tabBar: "rgba(255,250,242,0.92)",
    tabBarActive: "#6ba07f",
    tabBarInactive: "#8c826f",
    callBackdropStart: "rgba(149, 194, 163, 0.42)",
    callBackdropEnd: "#3e4136",
  },
  shadow: {
    card: "0 12px 28px rgba(101, 86, 63, 0.1)",
    panel: "0 18px 40px rgba(101, 86, 63, 0.14)",
    bubble: "0 10px 20px rgba(101, 86, 63, 0.08)",
  },
};

const SUMMIT_OVERRIDES: ThemeOverride = {
  color: {
    bg: "#eef4fb",
    shellStart: "#f6faff",
    shellEnd: "#dde8f5",
    shellAurora: "rgba(28, 101, 170, 0.18)",
    surface: "rgba(255,255,255,0.84)",
    surfaceElevated: "rgba(255,255,255,0.94)",
    surfaceOverlay: "rgba(246,250,255,0.74)",
    surfaceMuted: "rgba(237,245,255,0.9)",
    border: "rgba(43, 93, 145, 0.12)",
    borderStrong: "rgba(28, 101, 170, 0.24)",
    textPrimary: "#10233b",
    textSecondary: "#47627e",
    textMuted: "#7890a8",
    textInverse: "#f9fcff",
    brand: "#1c65aa",
    brandStrong: "#174f85",
    brandSoft: "rgba(28, 101, 170, 0.1)",
    brandGlow: "rgba(28, 101, 170, 0.24)",
    unreadBadge: "#174f85",
    mentionBadge: "#1c65aa",
    sentBubble: "linear-gradient(135deg, #1c65aa 0%, #2d8be1 100%)",
    sentBubbleBorder: "rgba(28, 101, 170, 0.34)",
    replyPreviewBg: "rgba(28, 101, 170, 0.1)",
    replyPreviewText: "#284867",
    inputPlaceholder: "#6c86a0",
    tabBarActive: "#1c65aa",
    callBackdropStart: "rgba(45, 139, 225, 0.4)",
    callBackdropEnd: "#08111b",
  },
};

function mergeTheme(
  base: TeamsDesignTokens,
  id: TeamsThemeId,
  overrides: ThemeOverride,
): TeamsDesignTokens {
  return {
    ...base,
    id,
    color: { ...base.color, ...overrides.color },
    typography: { ...base.typography, ...overrides.typography },
    spacing: { ...base.spacing, ...overrides.spacing },
    radius: { ...base.radius, ...overrides.radius },
    shadow: { ...base.shadow, ...overrides.shadow },
    motion: { ...base.motion, ...overrides.motion },
    zIndex: { ...base.zIndex, ...overrides.zIndex },
  };
}

function normalizeThemeId(themeId?: string): TeamsThemeId | null {
  if (!themeId) return null;
  const normalized = themeId.toLowerCase();
  if (normalized === "teams-default" || normalized === "default") {
    return "teams-default";
  }
  if (normalized === "teams-ghibli" || normalized === "ghibli") {
    return "teams-ghibli";
  }
  if (normalized === "teams-summit" || normalized === "summit") {
    return "teams-summit";
  }
  return null;
}

export function getTheme(
  platform: TeamsPlatform,
  darkMode = false,
  themeId?: string,
): TeamsDesignTokens {
  const base =
    platform === "android"
      ? darkMode
        ? teamsAndroidDarkTheme
        : teamsAndroidLightTheme
      : darkMode
        ? teamsIosDarkTheme
        : teamsIosLightTheme;

  const normalized = normalizeThemeId(themeId);
  if (normalized === "teams-ghibli") {
    return mergeTheme(base, normalized, GHIBLI_OVERRIDES);
  }
  if (normalized === "teams-summit") {
    return mergeTheme(base, normalized, SUMMIT_OVERRIDES);
  }
  return { ...base, id: "teams-default" };
}

export function getThemeForDevice(
  deviceId: string,
  darkMode = false,
  themeId?: string,
): TeamsDesignTokens {
  const normalized = deviceId.toLowerCase();
  const platform =
    normalized.includes("android") ||
    normalized.includes("pixel") ||
    normalized.includes("galaxy") ||
    normalized.includes("samsung")
      ? "android"
      : "ios";
  return getTheme(platform, darkMode, themeId);
}
