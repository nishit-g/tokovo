import type { NotificationTokens, NotificationTokensConfig } from "./types.js";

const androidLightTokens: NotificationTokens = {
  platform: "android",

  banner: {
    background: "rgba(255, 255, 255, 0.95)",
    backgroundBlur: "blur(20px)",
    border: "rgba(0, 0, 0, 0.05)",
    borderRadius: 28,
    margin: { top: 36, horizontal: 12 },
    padding: { top: 16, bottom: 16, horizontal: 16 },
    height: 88,
    shadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
    gap: 14,
  },

  lockScreen: {
    background: "rgba(255, 255, 255, 0.9)",
    backgroundBlur: "blur(16px)",
    border: "rgba(0, 0, 0, 0.04)",
    borderRadius: 24,
    margin: { bottom: 6, horizontal: 12 },
    padding: { top: 14, bottom: 14, horizontal: 14 },
    gap: 6,
    maxVisible: 5,
  },

  icon: {
    size: 24,
    borderRadius: 6,
    shadow: "none",
  },

  text: {
    appName: {
      fontSize: 12,
      fontWeight: 500,
      color: "#1F1F1F",
      opacity: 0.6,
    },
    title: {
      fontSize: 14,
      fontWeight: 500,
      color: "#1F1F1F",
    },
    body: {
      fontSize: 14,
      fontWeight: 400,
      color: "#1F1F1F",
      opacity: 0.7,
      maxLines: 1,
    },
    timestamp: {
      fontSize: 11,
      fontWeight: 400,
      color: "#1F1F1F",
      opacity: 0.5,
    },
  },

  animation: {
    enterDuration: 12,
    exitDuration: 10,
    defaultVisibleDuration: 120,
    curve: "cubic-bezier(0.4, 0, 0.2, 1)",
    stackSpacing: 6,
    enterTranslateY: -40,
    exitTranslateY: -25,
    enterScale: 0.96,
    stackScaleDecay: 0.015,
    lockScreenEnterTranslateY: 25,
    lockScreenExitTranslateX: -80,
  },

  typography: {
    fontFamily: "'Roboto', 'Google Sans', system-ui, sans-serif",
  },
};

const androidDarkTokens: NotificationTokens = {
  ...androidLightTokens,

  banner: {
    ...androidLightTokens.banner,
    background: "rgba(30, 30, 30, 0.95)",
    border: "rgba(255, 255, 255, 0.08)",
    shadow: "0 2px 12px rgba(0, 0, 0, 0.4)",
  },

  lockScreen: {
    ...androidLightTokens.lockScreen,
    background: "rgba(30, 30, 30, 0.9)",
    border: "rgba(255, 255, 255, 0.06)",
  },

  text: {
    appName: {
      ...androidLightTokens.text.appName,
      color: "#E3E3E3",
    },
    title: {
      ...androidLightTokens.text.title,
      color: "#E3E3E3",
    },
    body: {
      ...androidLightTokens.text.body,
      color: "#E3E3E3",
    },
    timestamp: {
      ...androidLightTokens.text.timestamp,
      color: "#E3E3E3",
    },
  },
};

export const androidNotificationTokens: NotificationTokensConfig = {
  light: androidLightTokens,
  dark: androidDarkTokens,
};

export function getAndroidNotificationTokens(
  theme: "light" | "dark" = "light",
): NotificationTokens {
  return androidNotificationTokens[theme];
}
