import {
  createDeviceRegistry,
  type DeviceRegistryClass,
} from "./device-registry";
import {
  createFrameRegistry,
  type FrameRegistryClass,
} from "./frame-registry";
import {
  createStatusBarStrategyRegistry,
  type StatusBarStrategyRegistryClass,
} from "./statusbar-registry";
import {
  createDeviceShellRegistry,
  type DeviceShellRegistryClass,
} from "../registry";

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
