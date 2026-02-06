export * from "./types.js";

export { NotificationBanner } from "./NotificationBanner.js";
export { NotificationLockScreen } from "./NotificationLockScreen.js";

export { IOSBanner } from "./ios/Banner.js";
export { IOSLockScreen } from "./ios/LockScreen.js";
export { AndroidBanner } from "./android/Banner.js";
export { AndroidLockScreen } from "./android/LockScreen.js";

import type { NotificationStrategy, StrategyRegistry } from "./types.js";
import { NotificationBanner } from "./NotificationBanner.js";
import { NotificationLockScreen } from "./NotificationLockScreen.js";

export const defaultStrategy: NotificationStrategy = {
  id: "default",
  Banner: NotificationBanner,
  LockScreen: NotificationLockScreen,
};

export const strategyRegistry: StrategyRegistry = new Map<
  string,
  NotificationStrategy
>([
  ["default", defaultStrategy],
  ["ios", defaultStrategy],
  ["android", defaultStrategy],
]);

export function getNotificationStrategy(
  _platform: "ios" | "android",
): NotificationStrategy {
  return defaultStrategy;
}
