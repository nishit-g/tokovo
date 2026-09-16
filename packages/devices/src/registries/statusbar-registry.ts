/**
 * StatusBar Strategy Registry
 *
 * Registry for StatusBar visual strategies (iOS, Android, Storybook, etc.)
 *
 * @example
 * ```typescript
 * const registry = createStatusBarStrategyRegistry();
 * registry.register("storybook", StorybookStatusBarStrategy);
 * const Strategy = registry.get("storybook");
 * ```
 */

import type React from "react";
import type { DeviceOSState, ResolvedStatusBarTheme } from "@tokovo/core";
import type { DeviceProfile } from "../types.js";

// =============================================================================
// TYPES
// =============================================================================

export interface StatusBarNotificationIcon {
  appId: string;
  count: number;
  icon?: string;
}

/**
 * Props passed to StatusBar strategy components.
 * Uses ResolvedStatusBarTheme for full color control.
 */
export interface StatusBarStrategyProps {
  /** Native Lock Screen owns the clock; retain only the status indicators. */
  lockScreen?: boolean;
  notificationUX?: "cinematic" | "native";
  /** Device OS state */
  os: DeviceOSState;
  /**
   * Theme - can be:
   * - "light" | "dark" semantic foreground presets
   * - Full ResolvedStatusBarTheme object with colors
   */
  theme: "light" | "dark" | ResolvedStatusBarTheme;
  /** Notification icons (Android) */
  notificationIcons?: readonly StatusBarNotificationIcon[];
  /** Active device profile for device-aware chrome sizing */
  deviceProfile: DeviceProfile;
}

export type StatusBarStrategyComponent = React.FC<StatusBarStrategyProps>;

// =============================================================================
// REGISTRY IMPLEMENTATION
// =============================================================================

export class StatusBarStrategyRegistryClass {
  private strategies = new Map<string, StatusBarStrategyComponent>();

  /**
   * Register a status bar strategy
   * @param variant The variant ID (e.g., "ios", "android", "storybook")
   * @param component The strategy React component
   */
  register(variant: string, component: StatusBarStrategyComponent): void {
    if (this.strategies.has(variant)) {
      throw new Error(`STATUS_BAR_STRATEGY_COLLISION: variant "${variant}" is already registered.`);
    }
    this.strategies.set(variant, component);
  }

  /**
   * Get a strategy by variant
   */
  get(variant: string): StatusBarStrategyComponent | undefined {
    return this.strategies.get(variant);
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

export function createStatusBarStrategyRegistry(): StatusBarStrategyRegistryClass {
  return new StatusBarStrategyRegistryClass();
}
