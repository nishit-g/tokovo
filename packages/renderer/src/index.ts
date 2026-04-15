/**
 * @tokovo/renderer - Enterprise Renderer Package
 *
 * @description Main exports for the Tokovo rendering system.
 * Organized into domain-specific subdirectories.
 */

// ===========================================================================
// CORE RENDERERS
// ===========================================================================
export { TokovoRenderer } from "./TokovoRenderer.js";
export type { CameraDebugFrame } from "./TokovoRenderer.js";
export { DeviceFrame } from "./DeviceFrame.js";
export { MultiDeviceRenderer } from "./MultiDeviceRenderer.js";
export { AudioLayer } from "./AudioLayer.js";

// ===========================================================================
// OVERLAYS
// ===========================================================================
export { NotificationOverlay } from "./overlays/index.js";
export { CallOverlay } from "./overlays/index.js";
export { StoryOverlay } from "./overlays/index.js";

// ===========================================================================
// SCREENS
// ===========================================================================
export { LockscreenView } from "./screens/index.js";
export { HomeScreenView } from "./screens/index.js";

// ===========================================================================
// OS COMPONENTS
// ===========================================================================
export { DynamicIsland } from "./os/index.js";
export { NotificationShade } from "./os/index.js";
// HeadsUpNotification is now in @tokovo/device-notifications

// ===========================================================================
// LAYOUT SYSTEM
// ===========================================================================
export { computeLayout } from "./layout/index.js";
export type {
  LayoutState,
  ChatLayoutState,
  ChatMessageLayout,
} from "./layout/types.js";
export * from "./layout/index.js";

// ===========================================================================
// UTILITIES
// ===========================================================================
export { NowPlayingBar } from "./NowPlayingBar.js";
export { VisualDebugger } from "./VisualDebugger.js";
export { UnlockTransition } from "./AppTransition.js";
export {
  RendererRegistryProvider,
  useRendererRegistries,
  type RendererRegistries,
} from "./RegistryContext.js";

// ===========================================================================
// ENGINES
// ===========================================================================
export { useLayoutEngine, useCameraEngine, useAudioEngine } from "./engines/index.js";
export { NULL_AUDIO_OUTPUT } from "./engines/index.js";
export type {
  LayoutEngineInput,
  LayoutEngineOutput,
  CameraEngineInput,
  CameraEngineOutput,
  AudioEngineInput,
  AudioEngineOutput,
} from "./engines/index.js";

// ===========================================================================
// ANCHOR SYSTEM
// ===========================================================================
// Note: getAnchorsForApp is in @tokovo/device-camera now.
// Only export renderer-specific anchors:
export {
  registerBuiltInAnchorProviders,
  registerOSAnchorProviders,
  rendererOsAnchorsRuntimeEntry,
  tokovoRuntimeManifest,
  getAllAnchors,
} from "./anchor-providers/index.js";
