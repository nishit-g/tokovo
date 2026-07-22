/**
 * @tokovo/renderer - Production Renderer Package
 *
 * @description Main exports for the Tokovo rendering system.
 * Organized into domain-specific subdirectories.
 */

// ===========================================================================
// CORE RENDERERS
// ===========================================================================
export { TokovoRenderer } from "./TokovoRenderer.js";
export {
  CinematicStageRenderer,
  type CinematicStageRendererProps,
  type CinematicCameraDebugFrame,
  type CinematicTextureProjectionFrame,
} from "./CinematicStageRenderer.js";
export type { TokovoRendererProps } from "./TokovoRenderer.js";
export { AudioLayer } from "./AudioLayer.js";
export {
  CameraProjectionSurface,
  createDisplacementMapDataUri,
  matrix3ToCssMatrix,
  projectCinematicFrame,
  type CameraProjectionSurfaceProps,
} from "./camera/index.js";

// ===========================================================================
// OVERLAYS
// ===========================================================================
export { CallOverlay } from "./overlays/index.js";
export { StoryOverlay } from "./overlays/index.js";

// ===========================================================================
// OS COMPONENTS
// ===========================================================================
export { DynamicIsland } from "./os/index.js";

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
export { UnlockTransition } from "./AppTransition.js";
export {
  RendererRegistryProvider,
  useRendererRegistries,
  type RendererRegistries,
} from "./RegistryContext.js";

// ===========================================================================
// ENGINES
// ===========================================================================
export {
  useLayoutEngine,
  computeLayoutEngine,
  createLayoutEngineRuntime,
  useAudioEngine,
} from "./engines/index.js";
export { NULL_AUDIO_OUTPUT } from "./engines/index.js";
export type {
  LayoutEngineInput,
  LayoutEngineOutput,
  LayoutEngineRuntime,
  AudioEngineInput,
  AudioEngineOutput,
} from "./engines/index.js";
