/**
 * Registries - Public exports
 */

export {
  DeviceRegistryClass,
  createDeviceRegistry,
} from "./device-registry.js";
export type { DeviceRegistries } from "./bundle.js";
export { createDeviceRegistries } from "./bundle.js";
export {
  FrameRegistryClass,
  createFrameRegistry,
  type FrameProps,
  type FrameComponent,
} from "./frame-registry.js";
export {
  StatusBarStrategyRegistryClass,
  createStatusBarStrategyRegistry,
  type StatusBarStrategyProps,
  type StatusBarStrategyComponent,
  type StatusBarNotificationIcon,
} from "./statusbar-registry.js";
