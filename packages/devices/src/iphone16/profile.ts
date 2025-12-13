import { DeviceProfile, CameraDeviceConfig } from "../types";

/**
 * iPhone 16 camera configuration
 * - Slow pan speed for cinematic feel on mobile
 * - High follow lag for smooth, less reactive tracking
 * - Tighter zoom range for portrait scrolling
 */
const iPhone16Camera: CameraDeviceConfig = {
    minZoom: 0.9,
    maxZoom: 1.15,
    panSpeed: "slow",
    followLag: "high",
    snapThreshold: 40,
    safeAreaTop: 110,      // Dynamic Island + status bar
    safeAreaBottom: 102,   // Home indicator
    followLagFactor: 0.7,  // Cinematic lag
    panSpeedMultiplier: 0.6,
};

export const iPhone16Profile: DeviceProfile = {
    id: "iphone16",
    dimensions: { width: 1290, height: 2796 },
    statusBarHeight: 110,
    camera: iPhone16Camera,
};
