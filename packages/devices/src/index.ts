/**
 * @tokovo/devices
 *
 * Enterprise device profiles and OS features for Tokovo.
 *
 * @example
 * ```typescript
 * import { createDeviceRegistries, DeviceTrackBuilder, StatusBar } from "@tokovo/devices";
 *
 * // Use registered profile
 * const registries = createDeviceRegistries();
 * const profile = registries.devices.get("iphone16");
 *
 * // Use DSL for OS events
 * const device = new DeviceTrackBuilder(30, "phone", getOrder);
 * device.at("2s").lock();
 * device.at("5s").unlock();
 * device.at("10s").openApp("app_whatsapp");
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export * from "./types.js";
export type { FrameProps, FrameComponent } from "./registries/index.js";
export type {
  StatusBarStrategyProps,
  StatusBarStrategyComponent,
  StatusBarNotificationIcon,
} from "./registries/index.js";
export type { DeviceTrackEvent, DeviceEventType } from "./ir/index.js";

// =============================================================================
// REGISTRIES
// =============================================================================

export {
  createDeviceRegistries,
  createDeviceRegistry,
  createFrameRegistry,
  createStatusBarStrategyRegistry,
  DeviceRegistryClass,
  FrameRegistryClass,
  StatusBarStrategyRegistryClass,
  type DeviceRegistries,
} from "./registries/index.js";

export {
  DeviceRegistryProvider,
  useDeviceRegistries,
} from "./DeviceRegistryContext.js";

export {
  createDeviceShellRegistry,
  DeviceShellRegistryClass,
} from "./registry.js";

// =============================================================================
// DSL
// =============================================================================

export { DeviceTrackBuilder, DevicePointBuilder } from "./dsl/index.js";

// =============================================================================
// IR
// =============================================================================

export { isDeviceEvent } from "./ir/index.js";

// =============================================================================
// LOWERING
// =============================================================================

export { deviceV2Lowering, DEVICE_EVENT_TYPES } from "./lowering/index.js";

// =============================================================================
// REDUCER
// =============================================================================

export { deviceReducer } from "./reducer.js";

// =============================================================================
// VIEWS
// =============================================================================

export { StatusBar, DarkStatusBar, LightStatusBar } from "./StatusBar.js";

// =============================================================================
// STRATEGIES
// =============================================================================

export { IOSStatusBarStrategy, AndroidStatusBarStrategy } from "./strategies/index.js";

// =============================================================================
// DEVICE PROFILES
// =============================================================================

export { iPhone16Profile } from "./iphone16/profile.js";
export { PixelProfile } from "./pixel/profile.js";

// =============================================================================
// KEYBOARDS (Legacy export)
// =============================================================================

export * from "./keyboards/index.js";

// =============================================================================
// PLUGIN
// =============================================================================

export {
  DevicesPlugin,
  registerDevicesPlugin,
  type DevicesPluginContract,
} from "./plugin.js";

// =============================================================================
// DYNAMIC LOOKUP HELPER
// =============================================================================

import type { DeviceRegistries } from "./registries/index.js";
import type { DeviceProfile } from "./types.js";

/**
 * Get device profile by ID
 * @param registries - Scoped device registries
 * @param profileId - Device profile ID (e.g., "iphone16", "pixel")
 * @returns DeviceProfile, falling back to first registered profile
 */
export function getDeviceProfile(
  registries: DeviceRegistries,
  profileId: string,
): DeviceProfile {
  const profile = registries.devices.get(profileId);
  if (profile) return profile;

  if (registries.devices.has("iphone16")) {
    const fallback = registries.devices.get("iphone16");
    if (fallback) return fallback;
  }

  const firstId = registries.devices.list()[0];
  if (firstId) {
    const fallback = registries.devices.get(firstId);
    if (fallback) return fallback;
  }

  throw new Error(
    `Device profile not found: ${profileId}. Register device profiles before rendering.`,
  );
}
