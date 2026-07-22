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
  PluginTier,
  PluginLayoutStrategy,
  PluginLayoutConstants,
  AppEventKindRegistry,
  AppInitialStateRegistry,
} from "@tokovo/core";

// Plugin Zod schemas for runtime validation
export {
  TokovoPluginContractSchema,
  PluginIdSchema,
  PluginVersionSchema,
  PluginAssetsSchema,
  PluginAutoSoundRuleSchema,
  PluginLayoutStrategySchema,
  validatePluginSchema,
  assertPluginSchema,
  type ParsedPluginContract,
  type PluginValidationResult,
} from "./schemas.js";

export * from "./plugin.js";
export {
  PluginRouterClass,
  createPluginRouter,
  type PluginAccessor,
} from "./router.js";
export { createPluginRegistries, type PluginRegistries } from "./registries.js";
