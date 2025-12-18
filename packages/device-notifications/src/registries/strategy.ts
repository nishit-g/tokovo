/**
 * Notification Strategy Registry
 * 
 * Registry for visual notification styles/strategies.
 * Allows themes like iOS, Android, Ghibli, Pixel, etc.
 * 
 * @example
 * ```typescript
 * // Register a custom strategy
 * NotificationStrategyRegistry.register("ghibli", GhibliNotificationStrategy);
 * 
 * // Get strategy by theme
 * const Strategy = NotificationStrategyRegistry.get("ghibli") || IOSNotificationStrategy;
 * ```
 */

import React from "react";
import type { NotificationInstance } from "../types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Props for notification strategy components
 */
export interface NotificationStrategyProps {
    notification: NotificationInstance;
    /** Additional CSS class names */
    className?: string;
    /** Override styles */
    style?: React.CSSProperties;
}

/**
 * A notification strategy component
 */
export type NotificationStrategyComponent = React.FC<NotificationStrategyProps>;

// =============================================================================
// REGISTRY
// =============================================================================

const strategyMap = new Map<string, NotificationStrategyComponent>();

/**
 * NotificationStrategyRegistry - Manages visual notification styles
 * 
 * Themes can register their own notification appearance:
 * - "ios" - Default iOS style with blur and rounded corners
 * - "android" - Material Design style
 * - "ghibli" - Studio Ghibli inspired whimsical style
 * - "pixel" - Google Pixel specific style
 * - "cyberpunk" - Neon cyberpunk aesthetic
 */
export const NotificationStrategyRegistry = {
    /**
     * Register a notification strategy for a theme
     * @param themeId Unique identifier (e.g., "ios", "ghibli")
     * @param component React component that renders the notification
     */
    register(themeId: string, component: NotificationStrategyComponent): void {
        if (strategyMap.has(themeId)) {
            console.warn(`[NotificationStrategyRegistry] Overwriting strategy: ${themeId}`);
        }
        strategyMap.set(themeId, component);
        console.log(`[NotificationStrategyRegistry] Registered strategy: ${themeId}`);
    },

    /**
     * Get a strategy by theme ID
     * @param themeId The theme identifier
     * @returns The strategy component or undefined
     */
    get(themeId: string): NotificationStrategyComponent | undefined {
        return strategyMap.get(themeId);
    },

    /**
     * Get strategy with fallback
     * @param themeId Primary theme to look up
     * @param fallback Fallback theme if primary not found
     */
    getWithFallback(themeId: string, fallback: string): NotificationStrategyComponent | undefined {
        return strategyMap.get(themeId) || strategyMap.get(fallback);
    },

    /**
     * Check if a strategy is registered
     */
    has(themeId: string): boolean {
        return strategyMap.has(themeId);
    },

    /**
     * Get all registered theme IDs
     */
    getRegisteredThemes(): string[] {
        return Array.from(strategyMap.keys());
    },

    /**
     * Clear all strategies (for testing)
     */
    clear(): void {
        strategyMap.clear();
    },
};

// =============================================================================
// AUTO-REGISTRATION
// =============================================================================

/**
 * Register default strategies on import
 * Lazy loaded to avoid circular dependencies
 */
let defaultsRegistered = false;

export function registerDefaultStrategies(): void {
    if (defaultsRegistered) return;
    defaultsRegistered = true;

    // Dynamically import to avoid circular deps
    Promise.all([
        import("../strategies/IOSNotificationStrategy"),
        import("../strategies/AndroidNotificationStrategy"),
    ]).then(([ios, android]) => {
        NotificationStrategyRegistry.register("ios", ios.IOSNotificationStrategy);
        NotificationStrategyRegistry.register("android", android.AndroidNotificationStrategy);
        console.log("[NotificationStrategyRegistry] Default strategies registered");
    }).catch(err => {
        console.warn("[NotificationStrategyRegistry] Failed to register defaults:", err);
    });
}
