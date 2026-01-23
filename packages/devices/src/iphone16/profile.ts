import { DeviceProfile, CameraDeviceConfig } from "../types";

const SCALE = 3;

export const iPhone16Constants = {
  SCALE,
  CORNER_RADIUS: 55 * SCALE,
  BEZEL_WIDTH: 30,
  STATUS_BAR_HEIGHT: 150,
  STATUS_BAR_PADDING_TOP: 40,
  STATUS_BAR_PADDING_X: 60,
  DYNAMIC_ISLAND_TOP: 11 * SCALE,
  DYNAMIC_ISLAND_WIDTH: 126 * SCALE,
  DYNAMIC_ISLAND_HEIGHT: 37 * SCALE,
  DYNAMIC_ISLAND_RADIUS: 20 * SCALE,
  HOME_INDICATOR_BOTTOM: 8 * SCALE,
  HOME_INDICATOR_WIDTH: 135 * SCALE,
  HOME_INDICATOR_HEIGHT: 5 * SCALE,
  HOME_INDICATOR_RADIUS: 9,
} as const;

const iPhone16Camera: CameraDeviceConfig = {
  minZoom: 0.9,
  maxZoom: 1.15,
  panSpeed: "slow",
  followLag: "high",
  snapThreshold: 40,
  safeAreaTop: 110, // Dynamic Island + status bar
  safeAreaBottom: 102, // Home indicator
  followLagFactor: 0.7, // Cinematic lag
  panSpeedMultiplier: 0.6,
};

/**
 * iPhone 16 Device Profile
 *
 * Resolution: 1290 x 2796 (Super Retina XDR, 460 ppi)
 * Dynamic Island: Centered at top, pill shape
 */
export const iPhone16Profile: DeviceProfile = {
  id: "iphone16",
  name: "iPhone 16 Pro Max",
  type: "phone",
  platform: "ios",
  dimensions: { width: 1290, height: 2796 },
  screen: {
    width: 1290,
    height: 2796,
    ppi: 460,
    cornerRadius: 55,
  },
  pixelDensity: 3,
  safeArea: {
    top: 110,
    bottom: 102,
    left: 0,
    right: 0,
  },
  camera: iPhone16Camera,

  // Dynamic Island dimensions (measured from iPhone 16 specs)
  dynamicIsland: {
    centerX: 645, // 1290 / 2 (centered)
    topY: 36, // Top padding
    collapsedWidth: 370, // Pill width
    collapsedHeight: 110, // Pill height
    expandedWidth: 900, // Expanded for Now Playing
    expandedHeight: 220, // Expanded height
    cornerRadius: 55, // Pill corners
  },

  // Device OS sounds
  sounds: {
    "device.notification": "os/ios/notification.wav",
    "device.lock": "os/ios/lock.wav",
    "device.unlock": "os/ios/unlock.wav",
    "device.screenshot": "os/ios/screenshot.wav",
    "device.charging": "os/ios/charging.wav",
    "device.keyboard": "os/ios/keyboard.wav",
  },
};
