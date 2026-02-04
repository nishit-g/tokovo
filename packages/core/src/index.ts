/**
 * @tokovo/core - Enterprise Core Package
 *
 * @description Central exports for the Tokovo engine runtime.
 * Domain-organized modules with clean barrel exports.
 */

// =============================================================================
// TYPES - All type definitions (includes camera types from device-camera)
// =============================================================================
export * from "./types";
export type { ViewLayoutMode, PIPPosition } from "./types";
export type { BaseCameraState as CameraState } from "./types";
export { DEFAULT_BASE_CAMERA_STATE as DEFAULT_CAMERA_STATE } from "./types";
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
} from "./engine";
export type {
  ReplayContext,
  PluginError,
  DeviceReducer,
  AppReducer,
  FeatureReducer,
  StateCache,
  KeyframedEventIndex,
} from "./engine";
export { createReducerRegistry } from "./engine/registry";
export type { ReducerRegistryClass } from "./engine/registry";
export { EngineConfig } from "./engine/config";
export { EngineLogger } from "./engine/logger";

// =============================================================================
// ANCHOR REGISTRY - Anchor registration and resolution
// =============================================================================
export { AnchorRegistryClass, createAnchorRegistry } from "./anchors/registry";

export type {
  AnchorProvider,
  AnchorSnapshot,
  AnchorFraming,
  Rect,
} from "./anchors/registry";

// =============================================================================
// AUDIO - Sound system
// =============================================================================
export * from "./audio";

// =============================================================================
// REGISTRIES - All registration systems
// Named exports to avoid conflicts with ./plugin
// =============================================================================
export {
  createRegistry,
  createSoundRegistry,
  createBehaviorRegistry,
} from "./registries";
export type {
  Registry,
  SoundRegistryAPI,
  CameraIntent,
  AppBehavior,
  BehaviorRegistryAPI,
} from "./registries";

// =============================================================================
// NOTIFICATIONS - Notification system
// =============================================================================
export * from "./notifications";

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
  PluginTier,
  PluginLayoutConstants,
  AppEventKindRegistry,
  AppInitialStateRegistry,
  PluginViewProps,
  PluginViewComponent,
  UIComponent,
} from "./types/plugin-contract";

/** TokovoPlugin is an alias for TokovoPluginContract<string> for convenience */
export type TokovoPlugin = import("./types/plugin-contract").TokovoPluginContract<string>;

// =============================================================================
// UTILS - Utilities
// =============================================================================
export * from "./utils";

// =============================================================================
// ANCHORS - Semantic positioning
// =============================================================================
export * from "./anchors";

// =============================================================================
// CONSTANTS & TOKENS
// Note: constants.ts may export Platform, so be careful
// =============================================================================
export * from "./constants";
export * from "./tokens";

// =============================================================================
// EPISODE PREPARATION
// =============================================================================
export {
  setCompiler,
  deriveInitialWorld,
  prepareEpisode,
  runEpisode,
} from "./prepare";
export type { EpisodeDefinition, RunOptions } from "./prepare";
export type {
  CompiledEpisode,
  PrepareOptions,
  AssetManifest,
} from "./prepare";
export type {
  RuntimeEvent,
  AppRuntimeEvent,
  DeviceRuntimeEvent,
  CameraRuntimeEvent,
  AudioRuntimeEvent,
  KeyboardRuntimeEvent,
} from "./prepare";

// Note: Legacy container removed in favor of engine + plugin scoped registries.

// =============================================================================
// LOGGER - Structured logging for debugging AI-generated content
// =============================================================================
export {
  logger,
  createScopedLogger,
  LogCollector,
  TokovoLogger,
} from "./logger";
export type {
  LogLevel,
  LogComponent,
  LogEntry,
  LogSubscriber,
  LoggerConfig,
} from "./logger";

// =============================================================================
// VALIDATION - Enterprise validation utilities for AI input
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
} from "./validation";
export type {
  ValidationSeverity,
  ValidationIssue,
  ValidationResult,
  BatchValidationResult,
  PartialValidationResult,
} from "./validation";

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
} from "./config";
export type { TokovoConfigType } from "./config";

// =============================================================================
// ENGINE FACADE - Unified engine initialization and control
// =============================================================================
export { createEngine, createEngineRegistries } from "./engine/index";
export type { EngineRegistries } from "./engine/index";
