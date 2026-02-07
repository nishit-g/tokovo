import { DeviceProfile, CameraDeviceConfig } from "../types.js";

/**
 * Pixel camera configuration
 * - Medium pan speed for balanced feel
 * - Medium follow lag for responsive tracking
 * - Slightly wider zoom range for Android
 */
const PixelCamera: CameraDeviceConfig = {
  minZoom: 0.85,
  maxZoom: 1.2,
  panSpeed: "medium",
  followLag: "medium",
  snapThreshold: 45,
  safeAreaTop: 90, // Status bar
  safeAreaBottom: 48, // Navigation bar/gesture area
  followLagFactor: 0.5, // Balanced lag
  panSpeedMultiplier: 1.0,
};

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
    width: 1080,
    height: 2400,
  },
  screen: {
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
  camera: PixelCamera,
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
