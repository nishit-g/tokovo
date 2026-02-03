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
export * from "./engine";

// =============================================================================
// ANCHOR REGISTRY - Anchor registration and resolution
// =============================================================================
export {
  registerAnchorProvider,
  unregisterAnchorProvider,
  getAnchorProvider,
  hasAnchorProvider,
  getAnchorsForApp,
  getAnchorFraming,
  getRegisteredAppIds,
  getProviderCount,
  clearAnchorProviders,
  clearAnchors,
  resolveAnchor,
  hasAnchor,
  AnchorRegistry,
} from "./anchors/registry";

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
  AppRegistry,
  SoundRegistry,
  WidgetRegistry,
  getDynamicIslandWidget,
  getNotificationWidgets,
  BehaviorRegistry,
  AppMetadataRegistry,
  LayoutRegistry,
} from "./registries";
export type {
  Registry,
  AppViewProps,
  AppViewComponent,
  AppMetadata,
  LayoutStrategy,
  CameraIntent,
  AppBehavior,
} from "./registries";

// =============================================================================
// NOTIFICATIONS - Notification system
// =============================================================================
export * from "./notifications";

// =============================================================================
// PLUGIN - Plugin system
// Named exports to avoid conflicts with ./registries
// =============================================================================
export {
  PluginManager,
  PluginManagerClass,
  definePlugin,
  registerPlugins,
} from "./plugin";
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
  TokovoPlugin,
  ScreenComponent,
  WidgetProps,
  WidgetComponent,
} from "./plugin";

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
export * from "./prepare";

// =============================================================================
// CONTAINER - Dependency Injection for testability
// =============================================================================
export {
  createContainer,
  globalContainer,
  resetGlobalContainer,
} from "./container";
export type {
  TokovoContainer,
  SoundRegistryInterface,
  LayoutRegistryInterface,
} from "./container";

// =============================================================================
// COMPOSABLES - Micro-plugin pattern for composable plugin capabilities
// =============================================================================
export {
  defineReducer,
  defineViews,
  defineAnchors,
  defineLayouts,
  defineAudioRules,
  defineNotificationAdapter,
  defineInitialState,
  composePlugin,
  getCapability,
  hasCapability,
} from "./plugin/composables";
export type {
  ReducerCapability,
  ViewsCapability,
  AnchorsCapability,
  LayoutsCapability,
  AudioCapability,
  NotificationsCapability,
  InitialStateCapability,
  PluginCapability,
  ComposedPlugin,
  AnchorFramingConfig,
  PluginLayoutDefinition,
} from "./plugin/composables";

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
  configureEngine,
  getConfig,
  resetConfig,
  getTimingConfig,
  getKeyboardConfig,
  getAnimationConfig,
  getRenderingConfig,
  getAudioConfig,
  getNotificationsConfig,
  getCameraConfig,
  isDebugEnabled,
  enableDebug,
  disableDebug,
} from "./config";
export type { TokovoConfigType } from "./config";

// =============================================================================
// PLUGIN BUILDER - Fluent API for plugin creation
// =============================================================================
export {
  createPluginBuilder,
  definePlugin as createPlugin,
} from "./plugin/builder";
export type { PluginBuilder, PluginBuilderConfig } from "./plugin/builder";

// =============================================================================
// ENGINE FACADE - Unified engine initialization and control
// =============================================================================
export { Engine } from "./engine/index";
