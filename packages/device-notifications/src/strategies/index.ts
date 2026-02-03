export * from "./types";

export { NotificationBanner } from "./NotificationBanner";
export { NotificationLockScreen } from "./NotificationLockScreen";

export { IOSBanner } from "./ios/Banner";
export { IOSLockScreen } from "./ios/LockScreen";
export { AndroidBanner } from "./android/Banner";
export { AndroidLockScreen } from "./android/LockScreen";

import type { NotificationStrategy, StrategyRegistry } from "./types";
import { NotificationBanner } from "./NotificationBanner";
import { NotificationLockScreen } from "./NotificationLockScreen";

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
