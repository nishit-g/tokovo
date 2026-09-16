/**
 * @tokovo/core - Production Core Package
 *
 * @description Central exports for the Tokovo engine runtime.
 * Domain-organized modules with clean barrel exports.
 */

// =============================================================================
// TYPES - All public runtime type definitions
// =============================================================================
export * from "./types.js";
export type { ViewLayoutMode, PIPPosition } from "./types.js";
export { createAppViewportFrame, resolvePlatformVisuals, measureBodyText } from "@tokovo/visual-system";
// Note: types/index.ts exists but is NOT exported here to avoid duplicate exports.

// =============================================================================
// ENGINE - Replay loop and handlers
// =============================================================================
export {
  createInitialWorld,
  replayIncremental,
  createEventIndex,
  createKeyframedEventIndex,
  createStateCache,
  getCachedStateForFrame,
  cacheStateAtKeyframe,
  invalidateCacheAfter,
  clearStateCache,
  handleAutoSounds,
} from "./engine.js";
export type {
  ReplayContext,
  PluginError,
  DeviceReducer,
  AppReducer,
  FeatureReducer,
  StateCache,
  KeyframedEventIndex,
} from "./engine.js";
export { createReducerRegistry } from "./engine/registry.js";
export type { ReducerRegistryClass } from "./engine/registry.js";
export { EngineConfig } from "./engine/config.js";

export {
  CinematicSubjectRegistryClass,
  createCinematicSubjectRegistry,
  createLayoutCinematicSubjectProvider,
} from "./cinematic-subjects/index.js";

// =============================================================================
// AUDIO - Sound system
// =============================================================================
export * from "./audio/index.js";

// =============================================================================
// REGISTRIES - All registration systems
// Named exports to avoid conflicts with ./plugin
// =============================================================================
export { createRegistry, createSoundRegistry } from "./registries/index.js";
export type { Registry, SoundRegistryAPI } from "./registries/index.js";

// =============================================================================
// PLUGIN - Plugin system
// Named exports to avoid conflicts with ./registries
// =============================================================================
export type {
  TokovoPluginContract,
  PluginReducer,
  PluginViews,
  PluginLayoutStrategy,
  LoweringHandler,
  DslExtension,
  PluginBootstrapContract,
  PluginBootstrapContext,
  PluginBootstrapMigrationResult,
  PluginBootstrapSchemaContext,
  PluginBootstrapSchemaContract,
  PluginBootstrapValidationResult,
  PluginTier,
  PluginLayoutConstants,
  AppEventKindRegistry,
  AppInitialStateRegistry,
  PluginViewProps,
  PluginViewComponent,
  UIComponent,
} from "./types/plugin-contract.js";

/** TokovoPlugin is an alias for TokovoPluginContract<string> for convenience */
export type TokovoPlugin = import("./types/plugin-contract").TokovoPluginContract<string>;

// =============================================================================
// UTILS - Utilities
// =============================================================================
export * from "./utils/index.js";

// =============================================================================
// CONSTANTS
// =============================================================================
export * from "./constants.js";

// =============================================================================
// LOGGER - Structured logging for debugging AI-generated content
// =============================================================================
export {
  getLogger,
  setLogger,
  createLogger,
  configureLoggerFromEnv,
  createScopedLogger,
  createConsoleLogSink,
  LogCollector,
  MemoryLogSink,
  TokovoLogger,
} from "./logger/index.js";
export type {
  LogLevel,
  LogProfile,
  LogComponent,
  LogEntry,
  LogSink,
  LogSubscriber,
  LoggerConfig,
  ScopedLogger,
} from "./logger/index.js";

// =============================================================================
// VALIDATION - Production validation utilities for AI input
// =============================================================================
export {
  validate,
  validateBatch,
  formatValidationIssues,
  formatValidationResult,
  createValidator,
  withGracefulDegradation,
  validateWithPartialSuccess,
  ValidationError,
  assertValid,
} from "./validation/index.js";
export type {
  ValidationSeverity,
  ValidationIssue,
  ValidationResult,
  BatchValidationResult,
  PartialValidationResult,
} from "./validation/index.js";

// =============================================================================
// CONFIG - Centralized configuration
// =============================================================================
export {
  TokovoConfig,
  createConfig,
  getTimingConfig,
  getAnimationConfig,
  getRenderingConfig,
  getAudioConfig,
  isDebugEnabled,
} from "./config/index.js";
export type { TokovoConfigType } from "./config/index.js";

// =============================================================================
// ENGINE FACADE - Unified engine initialization and control
// =============================================================================
export { createEngine, createEngineRegistries } from "./engine/index.js";
export type { EngineRegistries } from "./engine/index.js";
export { registerRuntimeObservability } from "./engine/observability.js";
