/**
 * Registries - Public exports
 */

export {
  DeviceRegistryClass,
  createDeviceRegistry,
} from "./device-registry";
export type { DeviceRegistries } from "./bundle";
export { createDeviceRegistries } from "./bundle";
export {
  FrameRegistryClass,
  createFrameRegistry,
  type FrameProps,
  type FrameComponent,
} from "./frame-registry";
export {
  StatusBarStrategyRegistryClass,
  createStatusBarStrategyRegistry,
  type StatusBarStrategyProps,
  type StatusBarStrategyComponent,
  type StatusBarNotificationIcon,
} from "./statusbar-registry";
