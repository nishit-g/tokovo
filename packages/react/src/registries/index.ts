/**
 * Registries Module - All registration systems
 *
 * @description Consolidated registry pattern.
 */

// Factory for creating type-safe registries (re-exported from core)
export { createRegistry } from "@tokovo/core";
export type { Registry } from "@tokovo/core";

// App Registry
// Note: AppViewProps and AppViewComponent are exported from ../plugin to avoid duplicates
export { createAppRegistry } from "./app";
export type { AppRegistryAPI } from "./app";

// Widget Registry
export { createWidgetRegistry, getDynamicIslandWidget, getNotificationWidgets } from "./widget";
export type { WidgetRegistryClass } from "./widget";

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

// Note: Sound/behavior/engine registries remain in @tokovo/core.
