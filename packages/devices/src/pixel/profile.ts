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

/**
 * Pixel 7 Pro Device Profile
 * 
 * Resolution: 1080 x 2400 (LTPO AMOLED, 512 ppi)
 * No Dynamic Island - uses status bar indicators
 */
export const PixelProfile: DeviceProfile = {
    id: "pixel",
    platform: "android",
    dimensions: {
        width: 1080,
        height: 2400,
    },
    statusBarHeight: 90,
    camera: PixelCamera,

    // Android uses status bar for background app indicators
    statusBarWidget: {
        rightX: 1000,      // Near right edge
        topY: 24,
        maxWidth: 200,
        height: 66,
    },
};
