import { DeviceProfile } from "../types.js";

/**
 * Pixel 7 Pro Device Profile
 *
 * Resolution: 1080 x 2400 (LTPO AMOLED, 512 ppi)
 * No Dynamic Island - uses status bar indicators
 */
export const PixelProfile: DeviceProfile = {
  id: "pixel",
  name: "Pixel 7 Pro",
  type: "phone",
  platform: "android",
  dimensions: {
    width: 1116,
    height: 2436,
    depth: 24,
  },
  display: {
    x: 18,
    y: 18,
    width: 1080,
    height: 2400,
    ppi: 512,
    cornerRadius: 24,
  },
  safeArea: {
    top: 90,
    bottom: 48,
    left: 0,
    right: 0,
  },
  pixelDensity: 3,

  // Android uses status bar for background app indicators
  statusBarWidget: {
    rightX: 1000, // Near right edge
    topY: 24,
    maxWidth: 200,
    height: 66,
  },

  // Device OS sounds
  sounds: {
    "device.notification": "os/android/notification.wav",
    "device.lock": "os/android/lock.wav",
    "device.unlock": "os/android/unlock.wav",
    "device.keyboard": "os/android/keyboard.wav",
  },
};
