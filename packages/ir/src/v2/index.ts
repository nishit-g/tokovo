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
  VoiceTrackEvent,
  OSTrackEvent,
  MarkerTrackEvent,
  CallTrackEvent,
  DeviceTrackEvent,
  SystemTrackEvent,
  TrackEvent,
} from "./track-event";

export {
  isCameraEvent,
  isAudioEvent,
  isVoiceEvent,
  isOSEvent,
  isMarkerEvent,
  isAppEvent,
  isCallEvent,
  isDeviceEvent,
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
  VoiceConfig,
  VoiceSegmentSchedule,
  VoiceScriptSegment,
  VoiceScriptDefinition,
  VoiceScheduleItem,
} from "./episode-ir";

export {
  TrackEpisodeIRSchema,
  DeviceConfigSchema,
  TrackEventSchema,
  VoiceConfigSchema,
  VoiceSegmentScheduleSchema,
  validateTrackEpisodeIR,
  safeValidateTrackEpisodeIR,
} from "./schemas";

export type { ValidatedTrackEpisodeIR } from "./schemas";
