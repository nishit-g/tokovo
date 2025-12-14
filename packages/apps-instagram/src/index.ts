/**
 * @tokovo/apps-instagram
 * 
 * Instagram app package with canonical plugin system.
 */

// Plugin (primary export)
export * from "./plugin";

// Runtime and types
export * from "./runtime";
export * from "./ui";
export * from "./types";
export * from "./notification-adapter";
export * from "./schema";

// Legacy compatibility: auto-register on import
import { ReducerRegistry } from "@tokovo/core";
import { instagramRuntime } from "./runtime";
import { INSTAGRAM_APP_ID } from "./plugin";

// NOTE: This side-effect registration will be removed in future.
// Use InstagramPlugin with createPluginRegistry() instead.
ReducerRegistry.registerAppReducer(INSTAGRAM_APP_ID, instagramRuntime);
