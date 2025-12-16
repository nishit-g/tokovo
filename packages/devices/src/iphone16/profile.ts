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

/**
 * iPhone 16 Device Profile
 * 
 * Resolution: 1290 x 2796 (Super Retina XDR, 460 ppi)
 * Dynamic Island: Centered at top, pill shape
 */
export const iPhone16Profile: DeviceProfile = {
    id: "iphone16",
    platform: "ios",
    dimensions: { width: 1290, height: 2796 },
    statusBarHeight: 110,
    pixelDensity: 3,
    camera: iPhone16Camera,

    // Dynamic Island dimensions (measured from iPhone 16 specs)
    dynamicIsland: {
        centerX: 645,           // 1290 / 2 (centered)
        topY: 36,               // Top padding
        collapsedWidth: 370,    // Pill width
        collapsedHeight: 110,   // Pill height
        expandedWidth: 900,     // Expanded for Now Playing
        expandedHeight: 220,    // Expanded height
        cornerRadius: 55,       // Pill corners
    },
};
