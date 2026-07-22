import { DeviceProfile } from "../types.js";

const SCALE = 3;

export const iPhone16Constants = {
  SCALE,
  BODY_CORNER_RADIUS: 60 * SCALE,
  DISPLAY_CORNER_RADIUS: 50 * SCALE,
  DISPLAY_INSET: 30,
  STATUS_BAR_HEIGHT: 186,
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

/**
 * iPhone 16 Device Profile
 *
 * Resolution: 1320 x 2868 (Super Retina XDR, 460 ppi)
 * Dynamic Island: Centered at top, pill shape
 */
export const iPhone16Profile: DeviceProfile = {
  id: "iphone16",
  name: "iPhone 16 Pro Max",
  type: "phone",
  platform: "ios",
  dimensions: { width: 1380, height: 2928, depth: 8.25 * SCALE },
  display: {
    x: iPhone16Constants.DISPLAY_INSET,
    y: iPhone16Constants.DISPLAY_INSET,
    width: 1320,
    height: 2868,
    ppi: 460,
    cornerRadius: iPhone16Constants.DISPLAY_CORNER_RADIUS,
  },
  pointScale: 3,
  platformProfileId: "ios:liquid-glass@1",
  systemSurfaces: true,
  hardwareRegions: [
    {
      id: "hardware.dynamic-island",
      kind: "sensor-housing",
      rect: { x: 471, y: 33, width: 378, height: 111 },
    },
  ],
  // Dynamic Island dimensions (measured from iPhone 16 specs)
  dynamicIsland: {
    centerX: 660,
    topY: 33,
    collapsedWidth: 378,
    collapsedHeight: 111,
    expandedWidth: 326 * SCALE,
    expandedHeight: 84 * SCALE,
    cornerRadius: 56,
    expandedCornerRadius: 40 * SCALE,
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
