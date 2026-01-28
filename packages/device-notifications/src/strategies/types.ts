import type React from "react";
import type { NotificationInstance } from "@tokovo/core";
import type { NotificationTokens } from "../tokens/types";
import type { AnimationState } from "../runtime/selectors";

export interface NotificationBannerProps {
  notification: NotificationInstance;
  animationState: AnimationState;
  animationProgress: number;
  tokens: NotificationTokens;
  scale: number;
  currentFrame: number;
  fps?: number;
  stackIndex?: number;
  stackOffset?: number;
  stackIndexChangedAtFrame?: number;
  previousStackOffset?: number;
  renderIcon?: (
    notification: NotificationInstance,
    tokens: NotificationTokens,
  ) => React.ReactNode;
  renderActions?: (
    notification: NotificationInstance,
    tokens: NotificationTokens,
  ) => React.ReactNode;
  renderCustomContent?: (
    notification: NotificationInstance,
    tokens: NotificationTokens,
  ) => React.ReactNode;
  onTap?: (notification: NotificationInstance) => void;
  onSwipe?: (
    notification: NotificationInstance,
    direction: "left" | "right",
  ) => void;
  onDismiss?: (notification: NotificationInstance) => void;
}

export interface NotificationLockScreenProps {
  notifications: Array<{
    notification: NotificationInstance;
    animationState: AnimationState;
    animationProgress: number;
  }>;
  tokens: NotificationTokens;
  scale: number;
  currentFrame: number;
  fps?: number;
}

export interface NotificationStrategy<T extends string = string> {
  id: T;
  Banner: React.FC<NotificationBannerProps>;
  LockScreen: React.FC<NotificationLockScreenProps>;
}

export type StrategyRegistry = Map<string, NotificationStrategy>;
