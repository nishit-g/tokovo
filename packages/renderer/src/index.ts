/**
 * @tokovo/renderer - Enterprise Renderer Package
 *
 * @description Main exports for the Tokovo rendering system.
 * Organized into domain-specific subdirectories.
 */

// ===========================================================================
// CORE RENDERERS
// ===========================================================================
export { TokovoRenderer } from "./TokovoRenderer";
export type { CameraDebugFrame } from "./TokovoRenderer";
export { DeviceFrame } from "./DeviceFrame";
export { MultiDeviceRenderer } from "./MultiDeviceRenderer";
export { AudioLayer } from "./AudioLayer";

// ===========================================================================
// OVERLAYS
// ===========================================================================
export { NotificationOverlay } from "./overlays";
export { CallOverlay } from "./overlays";
export { TouchOverlay } from "./overlays";

// ===========================================================================
// SCREENS
// ===========================================================================
export { LockscreenView } from "./screens";
export { HomeScreenView } from "./screens";

// ===========================================================================
// OS COMPONENTS
// ===========================================================================
export { DynamicIsland } from "./os";
export { NotificationShade } from "./os";
// HeadsUpNotification is now in @tokovo/device-notifications

// ===========================================================================
// LAYOUT SYSTEM
// ===========================================================================
export { computeLayout } from "./layout";
export type {
  LayoutState,
  ChatLayoutState,
  ChatMessageLayout,
} from "./layout/types";
export * from "./layout";

// ===========================================================================
// UTILITIES
// ===========================================================================
export { NowPlayingBar } from "./NowPlayingBar";
export { VisualDebugger } from "./VisualDebugger";
export { UnlockTransition } from "./AppTransition";
export {
  RendererRegistryProvider,
  useRendererRegistries,
  type RendererRegistries,
} from "./RegistryContext";

// ===========================================================================
// ENGINES
// ===========================================================================
export { useLayoutEngine, useCameraEngine, useAudioEngine } from "./engines";
export { NULL_AUDIO_OUTPUT } from "./engines";
export type {
  LayoutEngineInput,
  LayoutEngineOutput,
  CameraEngineInput,
  CameraEngineOutput,
  AudioEngineInput,
  AudioEngineOutput,
} from "./engines";

// ===========================================================================
// ANCHOR SYSTEM
// ===========================================================================
// Note: getAnchorsForApp is in @tokovo/device-camera now.
// Only export renderer-specific anchors:
export {
  registerBuiltInAnchorProviders,
  getAllAnchors,
} from "./anchor-providers";
