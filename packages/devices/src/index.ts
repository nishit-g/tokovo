export * from "./types";
export * from "./iphone16/profile";
export * from "./iphone16/Frame";
export * from "./pixel/profile";
export * from "./pixel/Frame";
export * from "./reducer";
export * from "./StatusBar";

// Device profile registry for dynamic lookup
import { DeviceProfile } from "./types";
import { iPhone16Profile } from "./iphone16/profile";
import { PixelProfile } from "./pixel/profile";

const deviceProfileRegistry: Record<string, DeviceProfile> = {
    "iphone16": iPhone16Profile,
    "pixel": PixelProfile,
    "pixel9": PixelProfile,
};

/**
 * Get device profile by ID
 * @param profileId - Device profile ID (e.g., "iphone16", "pixel")
 * @returns DeviceProfile or default iPhone16Profile if not found
 */
export function getDeviceProfile(profileId: string): DeviceProfile {
    return deviceProfileRegistry[profileId] || iPhone16Profile;
}
