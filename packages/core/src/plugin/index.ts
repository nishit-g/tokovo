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

// Plugin Zod schemas for runtime validation
export {
  TokovoPluginContractSchema,
  PluginIdSchema,
  PluginVersionSchema,
  PluginAssetsSchema,
  PluginAutoSoundRuleSchema,
  PluginLayoutStrategySchema,
  PluginAnchorRegistrySchema,
  validatePluginSchema,
  assertPluginSchema,
  type ParsedPluginContract,
  type PluginValidationResult,
} from "./schemas";

export * from "./plugin";
export { PluginRouter, type PluginAccessor } from "./router";
