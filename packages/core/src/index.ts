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
// Note: types/index.ts exists but is NOT exported here to avoid duplicate exports.
// types.ts re-exports needed types from types/layout.ts for compatibility.

// =============================================================================
// ENGINE - Replay loop and handlers
// =============================================================================
export * from "./engine";

// =============================================================================
// CAMERA - Re-exports from device-camera (named exports only to avoid conflicts)
// =============================================================================
export {
  cameraReducer,
  cameraV2Lowering,
  CAMERA_EVENT_TYPES,
  processActiveEffects,
  registerCameraProcessor,
  applyEasing,
  easingFunctions,
  lerp,
  seededRandom,
  getPreset,
  getShotPreset,
  composeTimeline,
  getPresetNames,
  registerAnchorProvider,
  getAnchorProvider,
  getAnchorsForApp,
  getAnchorFraming,
  resolveAnchorWithFallback,
  resolveAnchorFully,
} from "@tokovo/device-camera";
export type {
  CameraPreset,
  CameraTarget,
  CameraTimeline,
  TimelineStep,
  ShotPresetId,
} from "@tokovo/device-camera";

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
// DIRECTOR LITE - Automatic camera (from device-camera)
// =============================================================================
export {
  deriveDirectorEffects,
  extractSignals,
  ViralDramaV1,
} from "@tokovo/device-camera";
export type {
  DirectorSignal,
  DirectorSignalType,
  DirectorLayoutModel,
  DirectorOutput,
  DerivedCameraEffect,
  DirectorDebug,
  DeriveContext,
  DirectorStrategy,
  Rule,
} from "@tokovo/device-camera";

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
// CONTEXT - React context and hooks for apps
// =============================================================================
export {
  TokovoProvider,
  TokovoContext,
  useWorld,
  useDevice,
  useAppState,
  useLayout,
  useTime,
  usePlatform,
  useDeviceId,
  useAppId,
  useSafeAreaInsets,
  useConversation,
  useActiveConversation,
} from "./context/TokovoContext";

// =============================================================================
// COMPONENTS
// =============================================================================
export * from "./components/AppSurface";

// =============================================================================
// EPISODE PREPARATION
// =============================================================================
export * from "./prepare";
