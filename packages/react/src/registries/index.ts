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
export { createAppRegistry } from "./app.js";
export type { AppRegistryAPI } from "./app.js";

// Widget Registry
export { createWidgetRegistry, getDynamicIslandWidget, getNotificationWidgets } from "./widget.js";
export type { WidgetRegistryClass } from "./widget.js";

// App Metadata Registry
export { createAppMetadataRegistry } from "./metadata.js";
export type { AppMetadata, AppMetadataRegistryAPI } from "./metadata.js";

// Icon Registry
export { createIconRegistry, getAppIcon } from "./icon.js";
export type {
  IconMetadata,
  IconVariant,
  IconSize,
  IconRegistryAPI,
} from "./icon.js";

// Layout Registry
export { createLayoutRegistry } from "./layout.js";
export type { LayoutStrategy, LayoutRegistryClass } from "./layout.js";
// Note: LayoutContext, LayoutState are exported from ../types/layout (not re-exported here)

// Note: Sound/behavior/engine registries remain in @tokovo/core.
