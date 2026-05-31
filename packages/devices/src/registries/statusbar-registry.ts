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
import type { DeviceOSState, ResolvedStatusBarTheme, ScreenRecordingState } from "@tokovo/core";
import { createScopedLogger } from "@tokovo/core";
import type { DeviceProfile } from "../types.js";

const log = createScopedLogger("device");

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
  /** Device OS state */
  os?: DeviceOSState;
  /** Manual time override */
  time?: string;
  /**
   * Theme - can be:
   * - "light" | "dark" (legacy presets)
   * - Full ResolvedStatusBarTheme object with colors
   */
  theme?: "light" | "dark" | ResolvedStatusBarTheme;
  /** Battery percentage override */
  batteryPercentage?: number;
  /** Notification icons (Android) */
  notificationIcons?: StatusBarNotificationIcon[];
  /** Device screen recording state */
  screenRecording?: ScreenRecordingState;
  /** Current frame for time-sensitive chrome like recording */
  currentFrame?: number;
  /** Active device profile for device-aware chrome sizing */
  deviceProfile?: DeviceProfile;
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
      log.warn(`Overwriting status bar strategy ${variant}`, {
        event: "device.statusbar.overwrite",
        variant,
      });
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
   * Get strategy with fallback
   */
  getWithFallback(
    variant: string,
    fallback: string = "ios",
  ): StatusBarStrategyComponent | undefined {
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

export function createStatusBarStrategyRegistry(): StatusBarStrategyRegistryClass {
  return new StatusBarStrategyRegistryClass();
}
