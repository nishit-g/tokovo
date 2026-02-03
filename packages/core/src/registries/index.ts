/**
 * Registries Module - All registration systems
 *
 * @description Consolidated registry pattern.
 */

// Factory for creating type-safe registries
export { createRegistry } from "./factory";
export type { Registry } from "./factory";

// App Registry
export { createAppRegistry } from "./app";
export type { AppViewProps, AppViewComponent, AppRegistryAPI } from "./app";

// Sound Registry
export { createSoundRegistry } from "./sound";
export type { SoundRegistryAPI } from "./sound";

// Widget Registry
export { createWidgetRegistry, getDynamicIslandWidget, getNotificationWidgets } from "./widget";
export type { WidgetRegistryClass } from "./widget";

// Behavior Registry
export { createBehaviorRegistry } from "./behavior";
export type { CameraIntent, AppBehavior, BehaviorRegistryAPI } from "./behavior";

// App Metadata Registry
export { createAppMetadataRegistry } from "./metadata";
export type { AppMetadata, AppMetadataRegistryAPI } from "./metadata";

// Icon Registry
export { createIconRegistry, getAppIcon } from "./icon";
export type {
  IconMetadata,
  IconVariant,
  IconSize,
  IconRegistryAPI,
} from "./icon";

// Layout Registry
export { createLayoutRegistry } from "./layout";
export type { LayoutStrategy, LayoutRegistryClass } from "./layout";
// Note: LayoutContext, LayoutState are exported from ../types/layout (not re-exported here)

// Note: Legacy container/context/unified registries were removed in favor of
// engine + plugin scoped registries.

// Note: AnchorRegistry is exported from ../anchors (not duplicated here)
