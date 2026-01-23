/**
 * V2 Track-based IR
 *
 * Primary exports for the V2 track-based intermediate representation.
 * This is the recommended IR for new episodes.
 */

// Payloads
export type {
  EasingType,
  TrackMessageRef,
  CameraPayloads,
  AudioPayloads,
  OSPayloads,
  MarkerPayloads,
  AppPayloadRegistry,
  SystemPayloads,
  AllPayloads,
  SystemTrackId,
  AppId,
  AllTrackId,
} from "./payloads";

// Track Events
export type {
  TrackEventBase,
  AppTrackEventRegistry,
  CameraTrackEvent,
  AudioTrackEvent,
  OSTrackEvent,
  MarkerTrackEvent,
  SystemTrackEvent,
  TrackEvent,
} from "./track-event";

export {
  isCameraEvent,
  isAudioEvent,
  isOSEvent,
  isMarkerEvent,
  isAppEvent,
} from "./track-event";

// Episode IR
export type {
  ConversationConfig,
  OSConfig,
  DeviceConfig,
  Marker,
  Section,
  DirectorStyle,
  TrackEpisodeIR,
  TrackEpisodeConfig,
} from "./episode-ir";

export {
  TrackEpisodeIRSchema,
  DeviceConfigSchema,
  TrackEventSchema,
  validateTrackEpisodeIR,
  safeValidateTrackEpisodeIR,
} from "./schemas";

export type { ValidatedTrackEpisodeIR } from "./schemas";
