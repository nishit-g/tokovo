/**
 * Registries Module - All registration systems
 *
 * @description Consolidated registry pattern.
 */

// Factory for creating type-safe registries
export { createRegistry } from "./factory";
export type { Registry } from "./factory";

// App Registry
export { AppRegistry } from "./app";
export type { AppViewProps, AppViewComponent } from "./app";

// Sound Registry
export { SoundRegistry } from "./sound";

// Widget Registry
export {
  WidgetRegistry,
  getDynamicIslandWidget,
  getNotificationWidgets,
} from "./widget";

// Behavior Registry
export { BehaviorRegistry } from "./behavior";
export type { CameraIntent, AppBehavior } from "./behavior";

// App Metadata Registry
export { AppMetadataRegistry } from "./metadata";
export type { AppMetadata } from "./metadata";

// Icon Registry
export { IconRegistry, getAppIcon } from "./icon";
export type { IconMetadata, IconVariant, IconSize } from "./icon";

// Layout Registry
export { LayoutRegistry } from "./layout";
export type { LayoutStrategy } from "./layout";
// Note: LayoutContext, LayoutState are exported from ../types/layout (not re-exported here)

// Runtime Context (for DI and testing)
export {
  createRuntimeContext,
  getDefaultContext,
  resetDefaultContext,
  type TokovoRuntimeContext,
} from "./context";

// Unified Plugin Registry Facade
export {
  UnifiedPluginRegistry,
  createIsolatedPluginRegistry,
  type UnifiedRegistryState,
} from "./unified";

// Note: AnchorRegistry is exported from ../anchors (not duplicated here)
