/**
 * StatusBar - Unified status bar using strategy registry
 *
 * Uses the scoped StatusBar strategy registry to render iOS, Android, or custom themes.
 *
 * @example
 * ```typescript
 * // Register custom strategy
 * registries.statusBars.register("storybook", StorybookStatusBarStrategy);
 *
 * // Use it
 * <StatusBar variant="storybook" os={device.os} />
 * ```
 */

import React from "react";
import type { DeviceOSState, ResolvedStatusBarTheme } from "@tokovo/core";
import { type StatusBarNotificationIcon } from "./registries/index.js";
import { useDeviceRegistries } from "./DeviceRegistryContext.js";

// =============================================================================
// PROPS
// =============================================================================

export interface StatusBarProps {
  /** Complete deterministic device OS state. */
  os: DeviceOSState;
  /** Theme variant - looks up from the StatusBar strategy registry */
  variant: string;
  /** Theme */
  theme: "light" | "dark" | ResolvedStatusBarTheme;
  deviceProfile: import("./types.js").DeviceProfile;
  /** Notification icons (Android left side) */
  notificationIcons?: readonly StatusBarNotificationIcon[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * StatusBar - Uses StatusBarStrategyRegistry for rendering
 *
 * Supports custom themes via registration:
 * ```typescript
 * registries.statusBars.register("storybook", StorybookStatusBarStrategy);
 * ```
 */
export const StatusBar: React.FC<StatusBarProps> = ({ variant, ...rest }) => {
  const { statusBars } = useDeviceRegistries();
  const Strategy = statusBars.get(variant);
  if (!Strategy) {
    throw new Error(`STATUS_BAR_STRATEGY_MISSING: variant "${variant}" is not registered.`);
  }
  return <Strategy {...rest} />;
};

/**
 * iOS Status Bar specifically styled for dark backgrounds
 */
export const DarkStatusBar: React.FC<Omit<StatusBarProps, "theme">> = (props) => (
  <StatusBar {...props} theme="dark" />
);

/**
 * iOS Status Bar specifically styled for light backgrounds
 */
export const LightStatusBar: React.FC<Omit<StatusBarProps, "theme">> = (props) => (
  <StatusBar {...props} theme="light" />
);
