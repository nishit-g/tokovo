import type { NotificationInstance, DeviceState } from "@tokovo/core";
import type { NotificationTokens } from "../tokens/types";

const DEFAULT_FPS = 30;

export type AnimationState = "entering" | "visible" | "exiting" | "dismissed";
export type NotificationMode = "headsup" | "lockscreen" | "both";

export interface NotificationAnimationInfo {
  notification: NotificationInstance;
  animationState: AnimationState;
  animationProgress: number;
}

export interface StackedNotificationInfo extends NotificationAnimationInfo {
  stackIndex: number;
  stackOffset: number;
  stackIndexChangedAtFrame: number;
  previousStackOffset: number;
}

interface AnimationConfig {
  enterFrames: number;
  exitFrames: number;
}

interface SelectorConfig {
  modes: NotificationMode[];
  animation: AnimationConfig;
  sortDirection: "asc" | "desc";
}

const animationConfigCache = new WeakMap<
  NotificationTokens,
  Map<number, AnimationConfig>
>();

function animationConfigFromTokens(
  tokens: NotificationTokens,
  fps: number,
): AnimationConfig {
  let fpsMap = animationConfigCache.get(tokens);
  if (!fpsMap) {
    fpsMap = new Map();
    animationConfigCache.set(tokens, fpsMap);
  }

  let config = fpsMap.get(fps);
  if (!config) {
    const scale = fps / DEFAULT_FPS;
    config = {
      enterFrames: Math.round(tokens.animation.enterDuration * scale),
      exitFrames: Math.round(tokens.animation.exitDuration * scale),
    };
    fpsMap.set(fps, config);
  }

  return config;
}

function computeAnimationState(
  notification: NotificationInstance,
  currentFrame: number,
  config: AnimationConfig,
): { state: AnimationState; progress: number } {
  const { shownAtFrame, dismissedAtFrame, expiresAtFrame } = notification;

  if (!shownAtFrame) {
    return { state: "dismissed", progress: 0 };
  }

  const effectiveDismissFrame = dismissedAtFrame ?? expiresAtFrame;

  if (effectiveDismissFrame && currentFrame >= effectiveDismissFrame) {
    const exitProgress = Math.min(
      (currentFrame - effectiveDismissFrame) / config.exitFrames,
      1,
    );
    return exitProgress >= 1
      ? { state: "dismissed", progress: 1 }
      : { state: "exiting", progress: exitProgress };
  }

  const enterEnd = shownAtFrame + config.enterFrames;
  if (currentFrame < enterEnd) {
    const enterProgress = (currentFrame - shownAtFrame) / config.enterFrames;
    return {
      state: "entering",
      progress: Math.max(0, Math.min(1, enterProgress)),
    };
  }

  return { state: "visible", progress: 1 };
}

function createNotificationSelector(defaultConfig: SelectorConfig) {
  let lastNotifications: NotificationInstance[] | null = null;
  let lastFrame = -1;
  let lastResult: NotificationAnimationInfo[] = [];

  return function selectNotifications(
    device: DeviceState,
    currentFrame: number,
    configOverrides?: Partial<SelectorConfig>,
  ): NotificationAnimationInfo[] {
    const notifications = (device.notifications ??
      []) as NotificationInstance[];

    const notificationsChanged = notifications !== lastNotifications;
    const frameChanged = currentFrame !== lastFrame;

    if (!notificationsChanged && !frameChanged) {
      return lastResult;
    }

    lastNotifications = notifications;
    lastFrame = currentFrame;

    const config = configOverrides
      ? { ...defaultConfig, ...configOverrides }
      : defaultConfig;

    const result: NotificationAnimationInfo[] = [];

    for (const n of notifications) {
      if (!config.modes.includes(n.mode as NotificationMode)) {
        continue;
      }

      const { state, progress } = computeAnimationState(
        n,
        currentFrame,
        config.animation,
      );

      if (state === "dismissed") {
        continue;
      }

      result.push({
        notification: n,
        animationState: state,
        animationProgress: progress,
      });
    }

    result.sort((a, b) => {
      const diff =
        (a.notification.shownAtFrame ?? 0) - (b.notification.shownAtFrame ?? 0);
      return config.sortDirection === "asc" ? diff : -diff;
    });

    lastResult = result;
    return result;
  };
}

export function createSelectors(tokens: NotificationTokens) {
  const selectBanner = createNotificationSelector({
    modes: ["headsup", "both"],
    animation: animationConfigFromTokens(tokens, DEFAULT_FPS),
    sortDirection: "desc",
  });

  const selectLockScreen = createNotificationSelector({
    modes: ["lockscreen", "both"],
    animation: animationConfigFromTokens(tokens, DEFAULT_FPS),
    sortDirection: "desc",
  });

  let lastBannerResult: NotificationAnimationInfo[] | null = null;
  let lastStackedResult: StackedNotificationInfo[] = [];
  let stackIndexHistory: Map<string, { index: number; changedAt: number }> =
    new Map();
  const stackSpacing = tokens.animation.stackSpacing;

  return {
    getBannerNotifications(
      device: DeviceState,
      currentFrame: number,
      fps: number = DEFAULT_FPS,
    ): NotificationAnimationInfo[] {
      return selectBanner(device, currentFrame, {
        animation: animationConfigFromTokens(tokens, fps),
      });
    },

    getLockScreenNotifications(
      device: DeviceState,
      currentFrame: number,
      fps: number = DEFAULT_FPS,
    ): NotificationAnimationInfo[] {
      return selectLockScreen(device, currentFrame, {
        animation: animationConfigFromTokens(tokens, fps),
      });
    },

    getStackedBannerNotifications(
      device: DeviceState,
      currentFrame: number,
      fps: number = DEFAULT_FPS,
    ): StackedNotificationInfo[] {
      const visible = this.getBannerNotifications(device, currentFrame, fps);

      if (visible === lastBannerResult) {
        return lastStackedResult;
      }

      lastBannerResult = visible;

      lastStackedResult = visible.map((info, index) => {
        const id = info.notification.id;
        const currentOffset = index * stackSpacing;
        const history = stackIndexHistory.get(id);

        let stackIndexChangedAtFrame = info.notification.shownAtFrame ?? 0;
        let previousStackOffset = 0;

        if (history) {
          if (history.index !== index) {
            previousStackOffset = history.index * stackSpacing;
            stackIndexChangedAtFrame = currentFrame;
            stackIndexHistory.set(id, { index, changedAt: currentFrame });
          } else {
            stackIndexChangedAtFrame = history.changedAt;
            previousStackOffset =
              history.index === index
                ? currentOffset
                : history.index * stackSpacing;
          }
        } else {
          stackIndexHistory.set(id, {
            index,
            changedAt: info.notification.shownAtFrame ?? currentFrame,
          });
        }

        return {
          ...info,
          stackIndex: index,
          stackOffset: currentOffset,
          stackIndexChangedAtFrame,
          previousStackOffset,
        };
      });

      return lastStackedResult;
    },

    getActiveNotification(
      device: DeviceState,
      currentFrame: number,
      fps: number = DEFAULT_FPS,
    ): NotificationAnimationInfo | null {
      const banners = this.getBannerNotifications(device, currentFrame, fps);
      return banners.length > 0 ? banners[0] : null;
    },

    isNotificationVisible(
      device: DeviceState,
      id: string,
      currentFrame: number,
      fps: number = DEFAULT_FPS,
    ): boolean {
      const notification = getNotificationById(device, id);
      if (!notification) return false;
      const { state } = computeAnimationState(
        notification,
        currentFrame,
        animationConfigFromTokens(tokens, fps),
      );
      return state !== "dismissed";
    },

    getAnimationState(
      notification: NotificationInstance,
      currentFrame: number,
      fps: number = DEFAULT_FPS,
    ): { state: AnimationState; progress: number } {
      return computeAnimationState(
        notification,
        currentFrame,
        animationConfigFromTokens(tokens, fps),
      );
    },
  };
}

export function getNotifications(device: DeviceState): NotificationInstance[] {
  return (device.notifications as NotificationInstance[]) ?? [];
}

export function getNotificationById(
  device: DeviceState,
  id: string,
): NotificationInstance | undefined {
  return getNotifications(device).find((n) => n.id === id);
}

export function getGroupedNotifications(
  device: DeviceState,
): Map<string | undefined, NotificationInstance[]> {
  const notifications = getNotifications(device);
  const groups = new Map<string | undefined, NotificationInstance[]>();

  for (const n of notifications) {
    const key = n.ir?.groupKey;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(n);
  }

  return groups;
}

export {
  createNotificationSelector,
  computeAnimationState,
  animationConfigFromTokens,
};
