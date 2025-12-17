/**
 * @tokovo/core - Enterprise Core Package
 * 
 * @description Central exports for the Tokovo engine runtime.
 * Organized by domain with clean barrel exports.
 */

// =============================================================================
// TYPES - All type definitions
// =============================================================================
export * from "./types";

// Legacy types.ts (for backward compatibility during migration)
export * from "./types.ts";

// =============================================================================
// ENGINE - Replay loop and handlers
// =============================================================================
export * from "./engine";

// =============================================================================
// CAMERA - Camera effects and transforms
// =============================================================================
export * from "./camera";

// =============================================================================
// AUDIO - Sound system
// =============================================================================
export * from "./audio";
export * from "./sounds";

// =============================================================================
// REGISTRIES - All registration systems
// =============================================================================
// Note: Don't use export * from registries - it re-exports and causes conflicts
// Export factory only, then individual registries
export { createRegistry } from "./registries/factory";
export type { Registry } from "./registries/factory";

export { AppRegistry } from "./app-registry";
export type { AppViewProps, AppViewComponent } from "./app-registry";
export * from "./sound-registry";
export * from "./widget-registry";
export * from "./behavior-registry";
export * from "./app-metadata";

// =============================================================================
// NOTIFICATIONS - Notification system
// =============================================================================
// Note: Types already exported from ./types, only export logic here
export * from "./notification-adapter";
export * from "./notification-dsl";
export * from "./notification-registry";
export * from "./scheduler/notification-scheduler";

// =============================================================================
// PLUGIN - Plugin system
// =============================================================================
export * from "./plugin";

// =============================================================================
// UTILS - Utilities
// =============================================================================
export * from "./utils/rng";
export * from "./typeGuards";
export * from "./eventUtils";
export * from "./validation";

// =============================================================================
// DIRECTOR LITE - Automatic camera
// =============================================================================
export * from "./director-lite";

// =============================================================================
// ANCHORS - Semantic positioning
// =============================================================================
export * from "./anchors";

// =============================================================================
// CONSTANTS & TOKENS
// =============================================================================
export * from "./constants";
export * from "./tokens";
// Note: apps-config has conflicting getAppConfig with tokens, skip it
// export * from "./apps-config";

// =============================================================================
// TRANSITIONS
// =============================================================================
export * from "./transitions";

// =============================================================================
// COMPONENTS
// =============================================================================
export * from "./components/AppSurface";

// =============================================================================
// EPISODE PREPARATION (V1)
// =============================================================================
export * from "./prepare";

