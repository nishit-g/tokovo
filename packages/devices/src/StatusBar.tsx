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
import { IOSStatusBarStrategy } from "./strategies/IOSStatusBarStrategy.js";

// =============================================================================
// PROPS
// =============================================================================

interface StatusBarProps {
    /** Device OS state (preferred - reads time, battery, network from here) */
    os?: DeviceOSState;
    /** Fallback: manual time string */
    time?: string;
    /** Fallback: manual battery percentage */
    batteryPercentage?: number;
    /** Theme variant - looks up from the StatusBar strategy registry */
    variant?: string;
    /** Theme */
    theme?: "light" | "dark" | ResolvedStatusBarTheme;
    /** Notification icons (Android left side) */
    notificationIcons?: StatusBarNotificationIcon[];
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
export const StatusBar: React.FC<StatusBarProps> = ({
    variant = "ios",
    ...rest
}) => {
    // ★ REGISTRY LOOKUP - Get strategy from registry with iOS fallback
    const { statusBars } = useDeviceRegistries();
    const Strategy = statusBars.get(variant) || IOSStatusBarStrategy;
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
