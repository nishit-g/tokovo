/**
 * Device Registry
 * 
 * Central registry for device profiles.
 * Auto-registers device sounds when profile is registered.
 * 
 * @example
 * ```typescript
 * DeviceRegistry.register("iphone16", iPhone16Profile);
 * const profile = DeviceRegistry.get("iphone16");
 * ```
 */

import { SoundRegistry } from "@tokovo/core";
import type { DeviceProfile } from "../types";

// =============================================================================
// REGISTRY IMPLEMENTATION
// =============================================================================

class DeviceRegistryImpl {
    private profiles = new Map<string, DeviceProfile>();

    /**
     * Register a device profile
     * @param id Profile identifier (e.g., "iphone16", "pixel")
     * @param profile The device profile
     */
    register(id: string, profile: DeviceProfile): void {
        if (this.profiles.has(id)) {
            console.warn(`[DeviceRegistry] Overwriting profile: ${id}`);
        }
        this.profiles.set(id, profile);

        // Auto-register device sounds if provided
        if (profile.sounds) {
            try {
                SoundRegistry.registerMany(profile.sounds);
            } catch {
                // SoundRegistry might not be available in all contexts
            }
        }
    }

    /**
     * Get a device profile by ID
     */
    get(id: string): DeviceProfile | undefined {
        return this.profiles.get(id);
    }

    /**
     * Get a profile with fallback to default
     */
    getOrDefault(id: string, fallbackId: string = "iphone16"): DeviceProfile {
        const profile = this.profiles.get(id) ?? this.profiles.get(fallbackId);
        if (!profile) {
            throw new Error(`Device profile not found: ${id}`);
        }
        return profile;
    }

    /**
     * Check if a profile is registered
     */
    has(id: string): boolean {
        return this.profiles.has(id);
    }

    /**
     * List all registered profile IDs
     */
    list(): string[] {
        return Array.from(this.profiles.keys());
    }

    /**
     * Clear all profiles (for testing)
     */
    clear(): void {
        this.profiles.clear();
    }
}

export const DeviceRegistry = new DeviceRegistryImpl();
