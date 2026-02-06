import {
  createDeviceRegistry,
  type DeviceRegistryClass,
} from "./device-registry.js";
import {
  createFrameRegistry,
  type FrameRegistryClass,
} from "./frame-registry.js";
import {
  createStatusBarStrategyRegistry,
  type StatusBarStrategyRegistryClass,
} from "./statusbar-registry.js";
import {
  createDeviceShellRegistry,
  type DeviceShellRegistryClass,
} from "../registry.js";

export interface DeviceRegistries {
  devices: DeviceRegistryClass;
  frames: FrameRegistryClass;
  statusBars: StatusBarStrategyRegistryClass;
  shells: DeviceShellRegistryClass;
}

export function createDeviceRegistries(
  overrides: Partial<DeviceRegistries> = {},
): DeviceRegistries {
  return {
    devices: overrides.devices ?? createDeviceRegistry(),
    frames: overrides.frames ?? createFrameRegistry(),
    statusBars: overrides.statusBars ?? createStatusBarStrategyRegistry(),
    shells: overrides.shells ?? createDeviceShellRegistry(),
  };
}
