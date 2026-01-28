export type {
  NotificationTokens,
  NotificationTheme,
  NotificationTokensConfig,
  SafeAreaInsets,
  DeviceAwareTokensOptions,
} from "./types";
export { iosNotificationTokens, getIOSNotificationTokens } from "./ios";
export {
  androidNotificationTokens,
  getAndroidNotificationTokens,
} from "./android";

import { getIOSNotificationTokens } from "./ios";
import { getAndroidNotificationTokens } from "./android";
import type {
  NotificationTokens,
  NotificationTheme,
  DeviceAwareTokensOptions,
} from "./types";

export type Platform = "ios" | "android";

export function getNotificationTokens(
  platform: Platform,
  theme: NotificationTheme = "light",
): NotificationTokens {
  return platform === "ios"
    ? getIOSNotificationTokens(theme)
    : getAndroidNotificationTokens(theme);
}

const IOS_DEFAULT_SAFE_AREA_TOP = 52;
const ANDROID_DEFAULT_SAFE_AREA_TOP = 36;

export function createDeviceAwareTokens(
  options: DeviceAwareTokensOptions,
): NotificationTokens {
  const { platform, theme = "light", safeArea } = options;

  const baseTokens = getNotificationTokens(platform, theme);

  if (!safeArea) {
    return baseTokens;
  }

  const defaultTop =
    platform === "ios"
      ? IOS_DEFAULT_SAFE_AREA_TOP
      : ANDROID_DEFAULT_SAFE_AREA_TOP;
  const marginTop = safeArea.top > 0 ? safeArea.top : defaultTop;

  return {
    ...baseTokens,
    banner: {
      ...baseTokens.banner,
      margin: {
        ...baseTokens.banner.margin,
        top: marginTop,
      },
    },
  };
}
