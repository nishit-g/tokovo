/**
 * Camera motion speed configuration
 */
export type CameraSpeed = "slow" | "medium" | "fast";

/**
 * Camera follow lag configuration
 * - high: More cinematic, camera lags significantly behind target
 * - medium: Balanced tracking
 * - low: Camera closely follows target (reactive)
 */
export type CameraFollowLag = "high" | "medium" | "low";

/**
 * Camera configuration for a specific device profile.
 *
 * DESIGN PRINCIPLE: Device profiles define camera physics.
 * Apps do NOT override these values. Ever.
 */
export interface CameraDeviceConfig {
  // === Zoom Constraints ===
  /** Minimum zoom level (e.g., 0.9 = slight zoom out allowed) */
  minZoom: number;
  /** Maximum zoom level (e.g., 1.15 = 15% zoom in allowed) */
  maxZoom: number;

  // === Motion Characteristics ===
  /** Pan speed for camera movement */
  panSpeed: CameraSpeed;
  /** Lag when following a target (soft tracking delay) */
  followLag: CameraFollowLag;
  /** Snap threshold in pixels - below this, snap instantly vs animate */
  snapThreshold: number;

  // === Safe Areas for Framing ===
  /** Top safe area in pixels (status bar, notch, etc.) */
  safeAreaTop: number;
  /** Bottom safe area in pixels (home indicator, keyboard, etc.) */
  safeAreaBottom: number;

  // === Follow Easing (numeric values for computation) ===
  /** Follow lag factor: 0.1 (tight) to 0.9 (loose/cinematic) */
  followLagFactor: number;
  /** Pan speed multiplier: 0.5 (slow) to 2.0 (fast) */
  panSpeedMultiplier: number;
}

/**
 * Default camera configuration for devices
 */
export const DEFAULT_CAMERA_CONFIG: CameraDeviceConfig = {
  minZoom: 0.9,
  maxZoom: 1.15,
  panSpeed: "medium",
  followLag: "medium",
  snapThreshold: 50,
  safeAreaTop: 0,
  safeAreaBottom: 0,
  followLagFactor: 0.5,
  panSpeedMultiplier: 1.0,
};

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
  FrameComponent: React.ComponentType<any>;

  /** The System UI (Status Bar) */
  StatusBarComponent: React.ComponentType<any>;

  /** The Home Indicator (Bottom bar) */
  HomeIndicatorComponent?: React.ComponentType<any>;

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
  screen: {
    width: number;
    height: number;
    ppi: number;
    cornerRadius: number;
  };
  pixelDensity: number;
  safeArea: SafeAreaInsets;
  /** Camera behavior configuration (uses defaults if not specified) */
  camera?: CameraDeviceConfig;

  /** Dynamic Island configuration (iOS only) */
  dynamicIsland?: DynamicIslandConfig;
  statusBarWidget?: StatusBarWidgetConfig;

  /** Device OS sounds (notification, lock, unlock, etc.) */
  sounds?: Record<string, string>;
}
