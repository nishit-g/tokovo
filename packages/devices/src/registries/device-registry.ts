/**
 * Device Registry
 *
 * Central registry for device profiles.
 * Auto-registers device sounds when profile is registered.
 *
 * @example
 * ```typescript
 * const registry = createDeviceRegistry();
 * registry.register("iphone16", iPhone16Profile);
 * const profile = registry.get("iphone16");
 * ```
 */

import { registerHardwareVisualIdentity } from "@tokovo/visual-system";
import type { DeviceProfile } from "../types.js";

// =============================================================================
// REGISTRY IMPLEMENTATION
// =============================================================================

export class DeviceRegistryClass {
  private profiles = new Map<string, DeviceProfile>();

  /**
   * Register a device profile
   * @param id Profile identifier (e.g., "iphone16", "pixel")
   * @param profile The device profile
   */
  register(id: string, profile: DeviceProfile): void {
    if (this.profiles.has(id)) {
      throw new Error(`DEVICE_PROFILE_COLLISION: profile "${id}" is already registered.`);
    }
    if (profile.id !== id) {
      throw new Error(
        `DEVICE_PROFILE_ID_MISMATCH: registry key "${id}" does not match profile id "${profile.id}".`,
      );
    }
    registerHardwareVisualIdentity(id, {
      platform: profile.platform,
      platformProfileId: profile.platformProfileId,
      systemSurfaces: profile.systemSurfaces,
    });
    this.profiles.set(id, profile);
  }

  /**
   * Get a device profile by ID
   */
  get(id: string): DeviceProfile | undefined {
    return this.profiles.get(id);
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

export function createDeviceRegistry(): DeviceRegistryClass {
  return new DeviceRegistryClass();
}
