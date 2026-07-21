import type {
  NotificationAppearance,
  NotificationPlatform,
  NotificationThemeId,
  NotificationThemeProjection,
} from "../contract/index.js";

const TYPOGRAPHY: NotificationThemeProjection["typography"] = {
  fontFamily:
    '"Noto Sans Variable", "Noto Sans Arabic Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  appSize: 12,
  titleSize: 15,
  bodySize: 14,
  timestampSize: 11,
};

const THEMES: Readonly<Record<string, NotificationThemeProjection>> = {
  "system:ios:light": {
    id: "system:ios:light",
    platform: "ios",
    appearance: "light",
    colors: {
      banner: "rgba(248, 248, 250, 0.91)",
      card: "rgba(246, 246, 248, 0.88)",
      cardSecondary: "rgba(232, 232, 236, 0.82)",
      centerScrim: "rgba(18, 20, 28, 0.46)",
      text: "#111114",
      secondaryText: "rgba(38, 38, 43, 0.62)",
      border: "rgba(255, 255, 255, 0.58)",
      action: "#007AFF",
      actionDestructive: "#FF3B30",
    },
    geometry: {
      bannerTop: 8,
      bannerHorizontalMargin: 8,
      bannerMinHeight: 88,
      cardRadius: 24,
      cardPadding: 12,
      iconSize: 22,
      lockScreenTop: 300,
      centerTop: 96,
      centerHorizontalMargin: 12,
      stackGap: 10,
      maxLockScreenGroups: 4,
      maxCenterGroups: 6,
    },
    typography: TYPOGRAPHY,
    motion: {
      bannerEnterFramesAt30: 10,
      bannerExitFramesAt30: 8,
      cardEnterFramesAt30: 9,
      centerEnterFramesAt30: 12,
    },
  },
  "system:ios:dark": {
    id: "system:ios:dark",
    platform: "ios",
    appearance: "dark",
    colors: {
      banner: "rgba(37, 37, 40, 0.94)",
      card: "rgba(42, 42, 46, 0.9)",
      cardSecondary: "rgba(57, 57, 62, 0.86)",
      centerScrim: "rgba(0, 0, 0, 0.66)",
      text: "#FFFFFF",
      secondaryText: "rgba(235, 235, 245, 0.64)",
      border: "rgba(255, 255, 255, 0.13)",
      action: "#0A84FF",
      actionDestructive: "#FF453A",
    },
    geometry: {
      bannerTop: 8,
      bannerHorizontalMargin: 8,
      bannerMinHeight: 88,
      cardRadius: 24,
      cardPadding: 12,
      iconSize: 22,
      lockScreenTop: 300,
      centerTop: 96,
      centerHorizontalMargin: 12,
      stackGap: 10,
      maxLockScreenGroups: 4,
      maxCenterGroups: 6,
    },
    typography: TYPOGRAPHY,
    motion: {
      bannerEnterFramesAt30: 10,
      bannerExitFramesAt30: 8,
      cardEnterFramesAt30: 9,
      centerEnterFramesAt30: 12,
    },
  },
  "system:android:light": {
    id: "system:android:light",
    platform: "android",
    appearance: "light",
    colors: {
      banner: "#F7F8FC",
      card: "#F7F8FC",
      cardSecondary: "#E9ECF4",
      centerScrim: "rgba(28, 30, 36, 0.5)",
      text: "#1B1B1F",
      secondaryText: "#5F6368",
      border: "rgba(60, 64, 67, 0.12)",
      action: "#0B57D0",
      actionDestructive: "#B3261E",
    },
    geometry: {
      bannerTop: 8,
      bannerHorizontalMargin: 12,
      bannerMinHeight: 96,
      cardRadius: 18,
      cardPadding: 16,
      iconSize: 40,
      lockScreenTop: 300,
      centerTop: 80,
      centerHorizontalMargin: 12,
      stackGap: 8,
      maxLockScreenGroups: 5,
      maxCenterGroups: 7,
    },
    typography: TYPOGRAPHY,
    motion: {
      bannerEnterFramesAt30: 8,
      bannerExitFramesAt30: 7,
      cardEnterFramesAt30: 8,
      centerEnterFramesAt30: 10,
    },
  },
  "system:android:dark": {
    id: "system:android:dark",
    platform: "android",
    appearance: "dark",
    colors: {
      banner: "#292A2D",
      card: "#292A2D",
      cardSecondary: "#37383C",
      centerScrim: "rgba(0, 0, 0, 0.68)",
      text: "#F1F3F4",
      secondaryText: "#BDC1C6",
      border: "rgba(232, 234, 237, 0.1)",
      action: "#A8C7FA",
      actionDestructive: "#F2B8B5",
    },
    geometry: {
      bannerTop: 8,
      bannerHorizontalMargin: 12,
      bannerMinHeight: 96,
      cardRadius: 18,
      cardPadding: 16,
      iconSize: 40,
      lockScreenTop: 300,
      centerTop: 80,
      centerHorizontalMargin: 12,
      stackGap: 8,
      maxLockScreenGroups: 5,
      maxCenterGroups: 7,
    },
    typography: TYPOGRAPHY,
    motion: {
      bannerEnterFramesAt30: 8,
      bannerExitFramesAt30: 7,
      cardEnterFramesAt30: 8,
      centerEnterFramesAt30: 10,
    },
  },
};

export function getNotificationTheme(
  platform: NotificationPlatform,
  appearance: NotificationAppearance,
  themeId: NotificationThemeId = "system",
): NotificationThemeProjection {
  const theme = THEMES[`${themeId}:${platform}:${appearance}`];
  if (!theme) {
    throw new Error(
      `NOTIFICATION_THEME_UNSUPPORTED: no ${themeId} notification theme exists for ${platform}/${appearance}.`,
    );
  }
  return theme;
}

export const notificationThemes = THEMES;
