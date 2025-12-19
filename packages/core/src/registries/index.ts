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
export { WidgetRegistry, getDynamicIslandWidget, getNotificationWidgets } from "./widget";

// Behavior Registry
export { BehaviorRegistry } from "./behavior";

// App Metadata Registry
export { AppMetadataRegistry } from "./metadata";
export type { AppMetadata } from "./metadata";

// Layout Registry
export { LayoutRegistry } from "./layout";
export type { LayoutStrategy } from "./layout";
// Note: LayoutContext, LayoutState are exported from ../types/layout (not re-exported here)

// Note: AnchorRegistry is exported from ../anchors (not duplicated here)
