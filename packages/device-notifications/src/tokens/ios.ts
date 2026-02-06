import type { NotificationTokens, NotificationTokensConfig } from "./types.js";

const iosLightTokens: NotificationTokens = {
  platform: "ios",

  banner: {
    background: "rgba(255, 255, 255, 0.85)",
    backgroundBlur: "blur(40px) saturate(180%)",
    border: "rgba(0, 0, 0, 0.08)",
    borderRadius: 20,
    margin: { top: 52, horizontal: 8 },
    padding: { top: 14, bottom: 14, horizontal: 16 },
    height: 90,
    shadow: "0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)",
    gap: 12,
  },

  lockScreen: {
    background: "rgba(255, 255, 255, 0.7)",
    backgroundBlur: "blur(30px) saturate(150%)",
    border: "rgba(0, 0, 0, 0.06)",
    borderRadius: 16,
    margin: { bottom: 8, horizontal: 16 },
    padding: { top: 12, bottom: 12, horizontal: 14 },
    gap: 8,
    maxVisible: 4,
  },

  icon: {
    size: 44,
    borderRadius: 10,
    shadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  text: {
    appName: {
      fontSize: 13,
      fontWeight: 600,
      color: "#000000",
      opacity: 0.5,
    },
    title: {
      fontSize: 15,
      fontWeight: 600,
      color: "#000000",
    },
    body: {
      fontSize: 15,
      fontWeight: 400,
      color: "#000000",
      opacity: 0.7,
      maxLines: 2,
    },
    timestamp: {
      fontSize: 12,
      fontWeight: 400,
      color: "#000000",
      opacity: 0.4,
    },
  },

  animation: {
    enterDuration: 15,
    exitDuration: 15,
    defaultVisibleDuration: 150,
    curve: "cubic-bezier(0.2, 0, 0, 1)",
    stackSpacing: 8,
    enterTranslateY: -50,
    exitTranslateY: -30,
    enterScale: 0.95,
    stackScaleDecay: 0.02,
    lockScreenEnterTranslateY: 30,
    lockScreenExitTranslateX: -100,
  },

  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif",
  },
};

const iosDarkTokens: NotificationTokens = {
  ...iosLightTokens,

  banner: {
    ...iosLightTokens.banner,
    background: "rgba(44, 44, 46, 0.85)",
    border: "rgba(255, 255, 255, 0.1)",
    shadow: "0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)",
  },

  lockScreen: {
    ...iosLightTokens.lockScreen,
    background: "rgba(44, 44, 46, 0.75)",
    border: "rgba(255, 255, 255, 0.08)",
  },

  text: {
    appName: {
      ...iosLightTokens.text.appName,
      color: "#FFFFFF",
    },
    title: {
      ...iosLightTokens.text.title,
      color: "#FFFFFF",
    },
    body: {
      ...iosLightTokens.text.body,
      color: "#FFFFFF",
    },
    timestamp: {
      ...iosLightTokens.text.timestamp,
      color: "#FFFFFF",
    },
  },
};

export const iosNotificationTokens: NotificationTokensConfig = {
  light: iosLightTokens,
  dark: iosDarkTokens,
};

export function getIOSNotificationTokens(
  theme: "light" | "dark" = "light",
): NotificationTokens {
  return iosNotificationTokens[theme];
}
