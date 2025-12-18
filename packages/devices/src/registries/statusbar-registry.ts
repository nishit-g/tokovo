/**
 * StatusBar Strategy Registry
 * 
 * Registry for StatusBar visual strategies (iOS, Android, Ghibli, etc.)
 * 
 * @example
 * ```typescript
 * StatusBarStrategyRegistry.register("ghibli", GhibliStatusBarStrategy);
 * const Strategy = StatusBarStrategyRegistry.get("ghibli");
 * ```
 */

import type React from "react";
import type { DeviceOSState } from "@tokovo/core";

// =============================================================================
// TYPES
// =============================================================================

export interface StatusBarNotificationIcon {
    appId: string;
    count: number;
    icon?: string;
}

export interface StatusBarStrategyProps {
    /** Device OS state */
    os?: DeviceOSState;
    /** Manual time override */
    time?: string;
    /** Theme */
    theme?: "light" | "dark";
    /** Battery percentage override */
    batteryPercentage?: number;
    /** Notification icons (Android) */
    notificationIcons?: StatusBarNotificationIcon[];
}

export type StatusBarStrategyComponent = React.FC<StatusBarStrategyProps>;

// =============================================================================
// REGISTRY IMPLEMENTATION
// =============================================================================

class StatusBarStrategyRegistryImpl {
    private strategies = new Map<string, StatusBarStrategyComponent>();

    /**
     * Register a status bar strategy
     * @param variant The variant ID (e.g., "ios", "android", "ghibli")
     * @param component The strategy React component
     */
    register(variant: string, component: StatusBarStrategyComponent): void {
        if (this.strategies.has(variant)) {
            console.warn(`[StatusBarStrategyRegistry] Overwriting strategy: ${variant}`);
        }
        this.strategies.set(variant, component);
        console.log(`[StatusBarStrategyRegistry] Registered: ${variant}`);
    }

    /**
     * Get a strategy by variant
     */
    get(variant: string): StatusBarStrategyComponent | undefined {
        return this.strategies.get(variant);
    }

    /**
     * Get strategy with fallback
     */
    getWithFallback(variant: string, fallback: string = "ios"): StatusBarStrategyComponent | undefined {
        return this.strategies.get(variant) || this.strategies.get(fallback);
    }

    /**
     * Check if a strategy is registered
     */
    has(variant: string): boolean {
        return this.strategies.has(variant);
    }

    /**
     * List all registered variant IDs
     */
    list(): string[] {
        return Array.from(this.strategies.keys());
    }

    /**
     * Clear all strategies (for testing)
     */
    clear(): void {
        this.strategies.clear();
    }
}

export const StatusBarStrategyRegistry = new StatusBarStrategyRegistryImpl();
