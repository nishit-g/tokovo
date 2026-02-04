/**
 * Renderer Engines
 *
 * Split architecture for TokovoRenderer:
 * - Layout Engine: world + t → layout blueprint
 * - Camera Engine: layout + events → camera transform
 * - Audio Engine: world + t → audio state
 * - Renderer: all outputs → JSX pixels
 */

export { useLayoutEngine, type LayoutEngineInput, type LayoutEngineOutput } from "./useLayoutEngine";
export { useCameraEngine, type CameraEngineInput, type CameraEngineOutput } from "./useCameraEngine";
export { useAudioEngine, type AudioEngineInput, type AudioEngineOutput, NULL_AUDIO_OUTPUT } from "./useAudioEngine";
