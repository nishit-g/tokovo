/**
 * @tokovo/core - Production Core Package
 *
 * @description Central exports for the Tokovo engine runtime.
 * Domain-organized modules with clean barrel exports.
 */

// =============================================================================
// TYPES - All type definitions (includes camera types from device-camera)
// =============================================================================
export * from "./types.js";
export type { ViewLayoutMode, PIPPosition } from "./types.js";
export type { BaseCameraState as CameraState } from "./types.js";
export { DEFAULT_BASE_CAMERA_STATE as DEFAULT_CAMERA_STATE } from "./types.js";
// Note: types/index.ts exists but is NOT exported here to avoid duplicate exports.
// types.ts re-exports needed types from types/layout.ts for compatibility.

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

// =============================================================================
// ANCHOR REGISTRY - Anchor registration and resolution
// =============================================================================
export { AnchorRegistryClass, createAnchorRegistry } from "./anchors/registry.js";

export type { AnchorProvider, AnchorSnapshot, AnchorFraming, Rect } from "./anchors/registry.js";

// =============================================================================
// AUDIO - Sound system
// =============================================================================
export * from "./audio/index.js";

// =============================================================================
// REGISTRIES - All registration systems
// Named exports to avoid conflicts with ./plugin
// =============================================================================
export { createRegistry, createSoundRegistry, createBehaviorRegistry } from "./registries/index.js";
export type {
  Registry,
  SoundRegistryAPI,
  CameraIntent,
  AppBehavior,
  BehaviorRegistryAPI,
} from "./registries/index.js";

// =============================================================================
// NOTIFICATIONS - Notification system
// =============================================================================
export * from "./notifications/index.js";

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
  PluginAnchorRegistry,
  PluginNotificationAdapter,
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
// ANCHORS - Semantic positioning
// =============================================================================
export * from "./anchors/index.js";

// =============================================================================
// CONSTANTS & TOKENS
// Note: constants.ts may export Platform, so be careful
// =============================================================================
export * from "./constants.js";
export * from "./tokens.js";

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
  getKeyboardConfig,
  getAnimationConfig,
  getRenderingConfig,
  getAudioConfig,
  getNotificationsConfig,
  getCameraConfig,
  isDebugEnabled,
} from "./config/index.js";
export type { TokovoConfigType } from "./config/index.js";

// =============================================================================
// ENGINE FACADE - Unified engine initialization and control
// =============================================================================
export { createEngine, createEngineRegistries } from "./engine/index.js";
export type { EngineRegistries } from "./engine/index.js";
export { registerRuntimeObservability } from "./engine/observability.js";
