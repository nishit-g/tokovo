/**
 * Registries Index - Consolidated registry exports
 * 
 * @description Central export for all registries.
 */

// Factory for simple registries
export { createRegistry } from "./factory";
export type { Registry } from "./factory";

// Re-export existing registries from their original locations
// (They will be moved here in future cleanup)
export { AppRegistry } from "../app-registry";
export type { AppViewProps, AppViewComponent } from "../app-registry";

export { SoundRegistry } from "../sound-registry";

export { WidgetRegistry, getDynamicIslandWidget, getNotificationWidgets } from "../widget-registry";

export { BehaviorRegistry } from "../behavior-registry";

export { AppMetadataRegistry } from "../app-metadata";
