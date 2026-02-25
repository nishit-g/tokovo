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
  VoicePayloads,
  OSPayloads,
  MarkerPayloads,
  CallPayloads,
  DevicePayloads,
  OverlayPayloads,
  OverlayVariant,
  OverlayPlacementPreset,
  AppPayloadRegistry,
  SystemPayloads,
  AllPayloads,
  SystemTrackId,
  AppId,
  AllTrackId,
} from "./payloads.js";

// Track Events
export type {
  TrackEventBase,
  AppTrackEventRegistry,
  CameraTrackEvent,
  AudioTrackEvent,
  VoiceTrackEvent,
  OSTrackEvent,
  MarkerTrackEvent,
  CallTrackEvent,
  DeviceTrackEvent,
  OverlayTrackEvent,
  SystemTrackEvent,
  TrackEvent,
} from "./track-event.js";

export {
  isCameraEvent,
  isAudioEvent,
  isVoiceEvent,
  isOSEvent,
  isMarkerEvent,
  isAppEvent,
  isCallEvent,
  isDeviceEvent,
  isOverlayEvent,
} from "./track-event.js";

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
  VoiceConfig,
  VoiceSegmentSchedule,
  VoiceScriptSegment,
  VoiceScriptDefinition,
  VoiceScheduleItem,
  BackgroundConfigIR,
} from "./episode-ir.js";

export {
  TrackEpisodeIRSchema,
  DeviceConfigSchema,
  TrackEventSchema,
  VoiceConfigSchema,
  VoiceSegmentScheduleSchema,
  validateTrackEpisodeIR,
  safeValidateTrackEpisodeIR,
} from "./schemas.js";

export type { ValidatedTrackEpisodeIR } from "./schemas.js";

export {
  createCanonicalDeviceConfig,
  createCanonicalTrackEpisodeIR,
} from "./fixtures.js";
export type { CanonicalTrackEpisodeFixtureOptions } from "./fixtures.js";

export {
  normalizeTrackEpisodeIR,
  normalizeZodIssues,
} from "./normalize.js";
