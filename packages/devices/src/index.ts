/**
 * @tokovo/devices
 *
 * Enterprise device profiles and OS features for Tokovo.
 *
 * @example
 * ```typescript
 * import { DeviceRegistry, DeviceTrackBuilder, StatusBar } from "@tokovo/devices";
 *
 * // Use registered profile
 * const profile = DeviceRegistry.get("iphone16");
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

export * from "./types";
export type { FrameProps, FrameComponent } from "./registries";
export type {
  StatusBarStrategyProps,
  StatusBarStrategyComponent,
  StatusBarNotificationIcon,
} from "./registries";
export type { DeviceTrackEvent, DeviceEventType } from "./ir";

// =============================================================================
// REGISTRIES
// =============================================================================

export {
  DeviceRegistry,
  FrameRegistry,
  StatusBarStrategyRegistry,
} from "./registries";

// =============================================================================
// DSL
// =============================================================================

export { DeviceTrackBuilder, DevicePointBuilder } from "./dsl";

// =============================================================================
// IR
// =============================================================================

export { isDeviceEvent } from "./ir";

// =============================================================================
// LOWERING
// =============================================================================

export { deviceV2Lowering, DEVICE_EVENT_TYPES } from "./lowering";

// =============================================================================
// REDUCER
// =============================================================================

export { deviceReducer } from "./reducer";

// =============================================================================
// VIEWS
// =============================================================================

export { StatusBar, DarkStatusBar, LightStatusBar } from "./StatusBar";

// =============================================================================
// STRATEGIES
// =============================================================================

export { IOSStatusBarStrategy, AndroidStatusBarStrategy } from "./strategies";

// =============================================================================
// DEVICE PROFILES
// =============================================================================

export { iPhone16Profile } from "./iphone16/profile";
export { iPhone16Frame } from "./iphone16/Frame";
export { iPhone16Shell } from "./iphone16/shell";

export { PixelProfile } from "./pixel/profile";
export { PixelFrame } from "./pixel/Frame";

// =============================================================================
// KEYBOARDS (Legacy export)
// =============================================================================

export * from "./keyboards";

// =============================================================================
// PLUGIN
// =============================================================================

export {
  DevicesPlugin,
  registerDevicesPlugin,
  type DevicesPluginContract,
} from "./plugin";

// =============================================================================
// DYNAMIC LOOKUP HELPER
// =============================================================================

import { DeviceRegistry } from "./registries";
import { iPhone16Profile } from "./iphone16/profile";
import type { DeviceProfile } from "./types";

/**
 * Get device profile by ID
 * @param profileId - Device profile ID (e.g., "iphone16", "pixel")
 * @returns DeviceProfile or default iPhone16Profile if not found
 */
export function getDeviceProfile(profileId: string): DeviceProfile {
  return DeviceRegistry.getOrDefault(profileId, "iphone16") || iPhone16Profile;
}
