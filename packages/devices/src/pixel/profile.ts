import { DeviceProfile } from "../types.js";

/**
 * Pixel 7 Pro Device Profile
 *
 * Resolution: 1440 x 3120 (LTPO OLED, 512 ppi)
 * No Dynamic Island - uses status bar indicators
 */
export const PixelProfile: DeviceProfile = {
  id: "pixel",
  name: "Pixel 7 Pro",
  type: "phone",
  platform: "android",
  dimensions: {
    width: 1476,
    height: 3156,
    depth: 31,
  },
  display: {
    x: 18,
    y: 18,
    width: 1440,
    height: 3120,
    ppi: 512,
    cornerRadius: 24,
  },
  pointScale: 3.5,
  platformProfileId: "android:material3@1",
  systemSurfaces: true,
  hardwareRegions: [
    {
      id: "hardware.front-camera",
      kind: "camera-cutout",
      rect: { x: 684, y: 26, width: 72, height: 72 },
    },
  ],

  // Android uses status bar for background app indicators
  statusBarWidget: {
    rightX: 1340,
    topY: 28,
    maxWidth: 240,
    height: 70,
  },

  // Device OS sounds
  sounds: {
    "device.notification": "os/android/notification.wav",
    "device.lock": "os/android/lock.wav",
    "device.unlock": "os/android/unlock.wav",
    "device.keyboard": "os/android/keyboard.wav",
  },
};
