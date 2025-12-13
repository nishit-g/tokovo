import { DeviceProfile, CameraDeviceConfig } from "../types";

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
    safeAreaTop: 90,       // Status bar
    safeAreaBottom: 48,    // Navigation bar/gesture area
    followLagFactor: 0.5,  // Balanced lag
    panSpeedMultiplier: 1.0,
};

export const PixelProfile: DeviceProfile = {
    id: "pixel",
    dimensions: {
        width: 1080, // Pixel 7 Pro approx width
        height: 2400, // Pixel 7 Pro approx height
    },
    statusBarHeight: 90, // Approx 30px * 3
    camera: PixelCamera,
};
