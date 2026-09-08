/**
 * Devices Plugin - Production Contract
 *
 * Self-contained plugin for device profiles, frames, and OS features.
 *
 * @see docs/PLATFORM_VISUALS.md
 */

// Runtime Layer
import { deviceReducer } from "./reducer.js";

// Local interface for the registries we need (TokovoRegistries is not exported from core)
interface TokovoRegistries {
  engine: {
    reducers: {
      registerDeviceReducer: (reducer: typeof deviceReducer) => void;
    };
  };
}

// Registries
import type { DeviceRegistries } from "./registries/bundle.js";
import {
  createDeviceRegistries,
  createDeviceRegistry,
  createFrameRegistry,
  createStatusBarStrategyRegistry,
  DeviceRegistryClass,
  FrameRegistryClass,
  StatusBarStrategyRegistryClass,
} from "./registries/index.js";
// Views
import { StatusBar } from "./StatusBar.js";

// Strategies
import { IOSStatusBarStrategy, AndroidStatusBarStrategy } from "./strategies/index.js";

// Profiles
import { iPhone16Profile } from "./iphone16/profile.js";
import { iPhone16Frame } from "./iphone16/Frame.js";
import { PixelProfile } from "./pixel/profile.js";
import { PixelFrame } from "./pixel/Frame.js";

// =============================================================================
// PLUGIN CONTRACT
// =============================================================================

export interface DevicesPluginContract {
  id: "devices";
  version: string;
  displayName: string;

  // Runtime
  reducer: typeof deviceReducer;

  // Registries
  createDeviceRegistries: typeof createDeviceRegistries;
  createDeviceRegistry: typeof createDeviceRegistry;
  createFrameRegistry: typeof createFrameRegistry;
  createStatusBarStrategyRegistry: typeof createStatusBarStrategyRegistry;
  DeviceRegistryClass: typeof DeviceRegistryClass;
  FrameRegistryClass: typeof FrameRegistryClass;
  StatusBarStrategyRegistryClass: typeof StatusBarStrategyRegistryClass;

  // Views
  StatusBar: typeof StatusBar;

  // Strategies
  IOSStatusBarStrategy: typeof IOSStatusBarStrategy;
  AndroidStatusBarStrategy: typeof AndroidStatusBarStrategy;
}

export const DevicesPlugin: DevicesPluginContract = {
  // Identity
  id: "devices",
  version: "2.0.0",
  displayName: "Device Profiles & OS Features",

  // Runtime
  reducer: deviceReducer,

  // Registries
  createDeviceRegistries,
  createDeviceRegistry,
  createFrameRegistry,
  createStatusBarStrategyRegistry,
  DeviceRegistryClass,
  FrameRegistryClass,
  StatusBarStrategyRegistryClass,

  // Views
  StatusBar,

  // Strategies
  IOSStatusBarStrategy,
  AndroidStatusBarStrategy,
};

// =============================================================================
// AUTO-REGISTRATION
// =============================================================================

const registeredEngines = new WeakSet<TokovoRegistries["engine"]>();
const registeredDeviceRegistries = new WeakSet<DeviceRegistries>();

export function registerDevicesPlugin(
  tokovoRegistries: TokovoRegistries,
  deviceRegistries: DeviceRegistries,
): void {
  if (!registeredEngines.has(tokovoRegistries.engine)) {
    registeredEngines.add(tokovoRegistries.engine);
    tokovoRegistries.engine.reducers.registerDeviceReducer(deviceReducer);
  }

  if (registeredDeviceRegistries.has(deviceRegistries)) return;
  registeredDeviceRegistries.add(deviceRegistries);

  // Register default device profiles
  if (!deviceRegistries.devices.has("iphone16")) {
    deviceRegistries.devices.register("iphone16", iPhone16Profile);
  }
  if (!deviceRegistries.devices.has("pixel")) {
    deviceRegistries.devices.register("pixel", PixelProfile);
  }
  // Register default frames
  deviceRegistries.frames.register("iphone16", iPhone16Frame);
  deviceRegistries.frames.register("pixel", PixelFrame);

  // Register default StatusBar strategies
  deviceRegistries.statusBars.register("ios", IOSStatusBarStrategy);
  deviceRegistries.statusBars.register("android", AndroidStatusBarStrategy);
}

export const devicesRuntimeEntry = {
  id: "@tokovo/devices",
  scope: "device" as const,
  register(input: {
    tokovoRegistries: TokovoRegistries;
    deviceRegistries: DeviceRegistries;
  }): void {
    registerDevicesPlugin(input.tokovoRegistries, input.deviceRegistries);
  },
};

export const tokovoRuntimeManifest = [devicesRuntimeEntry] as const;

export default DevicesPlugin;
