import type { Platform } from "@tokovo/core";
import type { XCopyKey, XDirection } from "../localization/index.js";
import type { XLocale } from "../runtime/state.js";

export const X_UI_VERSION = "2026.1" as const;

export type XAppearance = "light" | "dark";
export type XThemeId = "default" | "x-dim" | "x-lights-out";

export interface XThemeColors {
  background: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSoft: string;
  reply: string;
  repost: string;
  like: string;
  danger: string;
  incomingBubble: string;
  outgoingBubble: string;
  mediaScrim: string;
  skeleton: string;
}

export interface XExperienceInput {
  platform: Platform;
  appearance: XAppearance;
  themeId?: string;
  locale: XLocale;
  reducedMotion: boolean;
  increasedContrast: boolean;
  textScale: number;
}

export interface XExperience {
  appId: "app_x";
  uiVersion: typeof X_UI_VERSION;
  platform: Platform;
  appearance: XAppearance;
  themeId: XThemeId;
  locale: XLocale;
  direction: XDirection;
  reducedMotion: boolean;
  colors: XThemeColors;
  type: {
    family: string;
    displayFamily: string;
    scale: number;
  };
  metrics: {
    headerHeight: number;
    navHeight: number;
    touchTarget: number;
    pagePadding: number;
    postPaddingY: number;
    avatar: number;
    composerHeight: number;
    radius: number;
  };
  motion: {
    routeFrames: number;
    feedbackFrames: number;
  };
  t: (key: XCopyKey) => string;
}
