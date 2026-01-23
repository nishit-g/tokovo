/**
 * Plugin Module - Plugin system
 *
 * @description Plugin registration and contracts.
 */

// Plugin contract types
export type {
  TokovoPluginContract,
  PluginReducer,
  PluginViews,
  LoweringHandler,
  DslExtension,
  PluginAnchorRegistry,
  PluginNotificationAdapter,
  PluginTier,
  PluginLayoutConstants,
  AppEventKindRegistry,
  AppInitialStateRegistry,
} from "../types/plugin-contract";

export * from "./plugin";
export { PluginRouter, type PluginAccessor } from "./router";
