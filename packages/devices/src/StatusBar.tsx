/**
 * StatusBar - Unified status bar using strategy registry
 * 
 * Uses StatusBarStrategyRegistry to render iOS, Android, or custom themes.
 * 
 * @example
 * ```typescript
 * // Register custom strategy
 * StatusBarStrategyRegistry.register("ghibli", GhibliStatusBarStrategy);
 * 
 * // Use it
 * <StatusBar variant="ghibli" os={device.os} />
 * ```
 */

import React from "react";
import type { DeviceOSState } from "@tokovo/core";
import { StatusBarStrategyRegistry, type StatusBarNotificationIcon } from "./registries";
import { IOSStatusBarStrategy } from "./strategies/IOSStatusBarStrategy";

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
    /** Theme variant - looks up from StatusBarStrategyRegistry */
    variant?: string;
    /** Theme */
    theme?: "light" | "dark";
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
 * StatusBarStrategyRegistry.register("ghibli", GhibliStatusBarStrategy);
 * ```
 */
export const StatusBar: React.FC<StatusBarProps> = ({
    variant = "ios",
    ...rest
}) => {
    // ★ REGISTRY LOOKUP - Get strategy from registry with iOS fallback
    const Strategy = StatusBarStrategyRegistry.get(variant) || IOSStatusBarStrategy;
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
