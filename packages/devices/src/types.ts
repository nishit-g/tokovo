import type { VisualHardwareProfile } from "@tokovo/visual-system";

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

export interface DeviceProfile extends VisualHardwareProfile {
  /** Dynamic Island configuration (iOS only) */
  dynamicIsland?: DynamicIslandConfig;
  statusBarWidget?: StatusBarWidgetConfig;

  /** Device OS sounds (notification, lock, unlock, etc.) */
  sounds?: Record<string, string>;
}
