import type { ComponentType } from "react";
import type { FrameComponent } from "./registries/frame-registry.js";
import type { StatusBarStrategyComponent } from "./registries/statusbar-registry.js";

/**
 * Dynamic Island configuration (iOS 14+ iPhones)
 */
export interface DynamicIslandConfig {
  /** Center X position in device pixels */
  centerX: number;
  /** Top Y position */
  topY: number;
  /** Collapsed pill width */
  collapsedWidth: number;
  /** Collapsed pill height */
  collapsedHeight: number;
  /** Expanded width */
  expandedWidth: number;
  /** Expanded height */
  expandedHeight: number;
  /** Corner radius for pill shape */
  cornerRadius: number;
  /** Expanded presentation corner radius */
  expandedCornerRadius?: number;
}

/**
 * Status bar widget area (Android)
 */
export interface StatusBarWidgetConfig {
  /** Right edge X position */
  rightX: number;
  /** Top Y position */
  topY: number;
  /** Maximum width for indicators */
  maxWidth: number;
  /** Height of indicator area */
  height: number;
}

/**
 * Device profile defining physical characteristics and camera behavior
 */
export interface DeviceShell {
  /** Unique ID (e.g. "iphone16", "pixel6") */
  id: string;

  /** The outer frame component (bezel + screen container) */
  FrameComponent: FrameComponent;

  /** The System UI (Status Bar) */
  StatusBarComponent: StatusBarStrategyComponent;

  /** The Home Indicator (Bottom bar) */
  HomeIndicatorComponent?: ComponentType<Record<string, unknown>>;

  /** Physical config */
  cornerRadius: number;
  hasDynamicIsland: boolean;
}

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Physical display aperture inside the outer device body. */
export interface DeviceDisplayGeometry {
  /** Display origin in device-body coordinates. */
  x: number;
  y: number;
  /** Native display pixel dimensions used by apps and OS surfaces. */
  width: number;
  height: number;
  ppi: number;
  cornerRadius: number;
}

export interface DeviceProfile {
  id: string;
  name: string;
  type: "phone" | "tablet" | "desktop" | "watch";
  platform: "ios" | "android";
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  /** Display aperture. It must not be conflated with the physical body bounds. */
  display: DeviceDisplayGeometry;
  pixelDensity: number;
  safeArea: SafeAreaInsets;
  /** Dynamic Island configuration (iOS only) */
  dynamicIsland?: DynamicIslandConfig;
  statusBarWidget?: StatusBarWidgetConfig;

  /** Device OS sounds (notification, lock, unlock, etc.) */
  sounds?: Record<string, string>;
}
