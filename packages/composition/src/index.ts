export { EpisodeComposition } from "./EpisodeComposition.js";
export {
  CAMERA_TEXTURE_CAPTURE_PREFIX,
  encodeCameraTextureProjectionCapture,
  parseCameraTextureProjectionCapture,
} from "./camera-texture-contract.js";
export {
  DEFAULT_VOICE_DUCKING_CONFIG,
  computeVoiceDuckMultiplierAtFrame,
} from "./voice-ducking.js";
export {
  selectAssetsForPrefetch,
  useEpisodeAssetPrefetch,
} from "./asset-prefetch.js";

export type {
  SerializablePreparedEpisode,
  SerializableEpisodeRenderData,
  EpisodeCompositionRuntime,
  CameraRenderLayer,
  EpisodeCompositionProps,
} from "./types.js";
export type { CameraTextureProjectionCapture } from "./camera-texture-contract.js";
export type {
  VoiceDuckingRange,
  VoiceDuckingConfig,
} from "./voice-ducking.js";
