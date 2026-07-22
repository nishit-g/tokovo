/**
 * Renderer Engines
 *
 * Split architecture for TokovoRenderer:
 * - Layout Engine: world + t → layout blueprint
 * - Camera Engine: layout + events → camera transform
 * - Audio Engine: world + t → audio state
 * - Renderer: all outputs → JSX pixels
 */

export {
  computeLayoutEngine,
  createLayoutEngineRuntime,
  useLayoutEngine,
  type LayoutEngineInput,
  type LayoutEngineOutput,
  type LayoutEngineRuntime,
} from "./useLayoutEngine.js";
export {
  useAudioEngine,
  type AudioEngineInput,
  type AudioEngineOutput,
  NULL_AUDIO_OUTPUT,
} from "./useAudioEngine.js";
