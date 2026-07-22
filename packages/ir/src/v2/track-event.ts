/**
 * TrackEvent - Fully typed track event union
 *
 * All tracks compile to TrackEvent with typed payloads.
 * Routing fields (deviceId, appId) at top-level.
 * App-specific data in payload.
 *
 * Apps extend AppTrackEventRegistry via module augmentation:
 *
 * @example
 * ```typescript
 * declare module "@tokovo/ir" {
 *     interface AppTrackEventRegistry {
 *         app_whatsapp: WhatsAppTrackEvent;
 *     }
 * }
 * ```
 */

import type {
  AudioPayloads,
  OSPayloads,
  MarkerPayloads,
  CallPayloads,
  DevicePayloads,
  OverlayPayloads,
  VoicePayloads,
} from "./payloads.js";

// =============================================================================
// TRACK EVENT BASE
// =============================================================================

/**
 * Base fields shared by all track events.
 */
export interface TrackEventBase {
  /** Start frame (required) */
  at: number;

  /** Duration in frames (for spans) */
  duration?: number;

  /** Device routing (optional - some events are device-agnostic) */
  deviceId?: string;

  /** Declaration order for conflict resolution */
  _declarationOrder?: number;
}

// =============================================================================
// MODULE AUGMENTATION INTERFACES
// =============================================================================

/**
 * Registry for app-specific track events.
 * Plugins extend this interface via module augmentation.
 */
export interface AppTrackEventRegistry {
  // Apps add their event types here via module augmentation
}

// =============================================================================
// SYSTEM TRACK EVENTS
// =============================================================================

/**
 * Audio track event
 */
export type AudioTrackEvent = TrackEventBase & {
  kind: "AUDIO";
} & (
    | { type: "BGM_START"; payload: AudioPayloads["BGM_START"] }
    | { type: "BGM_END"; payload: AudioPayloads["BGM_END"] }
    | { type: "PLAY"; payload: AudioPayloads["PLAY"] }
    | { type: "STOP"; payload: AudioPayloads["STOP"] }
    | { type: "CROSSFADE"; payload: AudioPayloads["CROSSFADE"] }
    | { type: "FADE_OUT"; payload: AudioPayloads["FADE_OUT"] }
    | { type: "STOP_ALL"; payload: AudioPayloads["STOP_ALL"] }
  );

/**
 * OS track event
 */
export type OSTrackEvent = TrackEventBase & {
  kind: "OS";
} & (
    | { type: "SET_STATE"; payload: OSPayloads["SET_STATE"] }
    | { type: "SET_TIME"; payload: OSPayloads["SET_TIME"] }
    | { type: "SET_BATTERY"; payload: OSPayloads["SET_BATTERY"] }
    | { type: "SET_NETWORK"; payload: OSPayloads["SET_NETWORK"] }
    | { type: "SET_DND"; payload: OSPayloads["SET_DND"] }
  );

/**
 * Marker track event (debugging/navigation)
 */
export type MarkerTrackEvent = TrackEventBase & {
  kind: "MARKER";
} & (
    | { type: "MARK"; payload: MarkerPayloads["MARK"] }
    | { type: "SECTION_START"; payload: MarkerPayloads["SECTION_START"] }
    | { type: "SECTION_END"; payload: MarkerPayloads["SECTION_END"] }
  );

/**
 * Call track event (phone calls)
 */
export type CallTrackEvent = TrackEventBase & {
  kind: "CALL";
} & (
    | { type: "INCOMING"; payload: CallPayloads["INCOMING"] }
    | { type: "ANSWER"; payload: CallPayloads["ANSWER"] }
    | { type: "DECLINE"; payload: CallPayloads["DECLINE"] }
    | { type: "END"; payload: CallPayloads["END"] }
    | { type: "TOGGLE_MUTE"; payload: CallPayloads["TOGGLE_MUTE"] }
    | { type: "TOGGLE_SPEAKER"; payload: CallPayloads["TOGGLE_SPEAKER"] }
    | { type: "TOGGLE_HOLD"; payload: CallPayloads["TOGGLE_HOLD"] }
  );

/**
 * Device track event (device-level operations)
 */
export type DeviceTrackEvent = TrackEventBase & {
  kind: "DEVICE";
} & (
    | { type: "LOCK"; payload: DevicePayloads["LOCK"] }
    | { type: "UNLOCK"; payload: DevicePayloads["UNLOCK"] }
    | { type: "OPEN_APP"; payload: DevicePayloads["OPEN_APP"] }
    | { type: "CLOSE_APP"; payload: DevicePayloads["CLOSE_APP"] }
    | { type: "GO_HOME"; payload: DevicePayloads["GO_HOME"] }
    | {
        type: "SET_DYNAMIC_ISLAND";
        payload: DevicePayloads["SET_DYNAMIC_ISLAND"];
      }
    | { type: "SET_BADGE"; payload: DevicePayloads["SET_BADGE"] }
    | {
        type: "SET_SCREEN_RECORDING";
        payload: DevicePayloads["SET_SCREEN_RECORDING"];
      }
    | { type: "INCOMING_CALL"; payload: DevicePayloads["INCOMING_CALL"] }
    | { type: "CALL_ANSWERED"; payload: DevicePayloads["CALL_ANSWERED"] }
    | { type: "CALL_ENDED"; payload: DevicePayloads["CALL_ENDED"] }
  );

/**
 * Overlay track event (story layer)
 */
export type OverlayTrackEvent = TrackEventBase & {
  kind: "OVERLAY";
} & (
    | { type: "SHOW"; payload: OverlayPayloads["SHOW"] }
    | { type: "HIDE"; payload: OverlayPayloads["HIDE"] }
    | { type: "CLEAR"; payload: OverlayPayloads["CLEAR"] }
  );

export type VoiceTrackEvent = TrackEventBase & {
  kind: "VOICE";
} & (
    | { type: "PLAY_SEGMENT"; payload: VoicePayloads["PLAY_SEGMENT"] }
    | { type: "STOP_VOICE"; payload: VoicePayloads["STOP_VOICE"] }
  );

// =============================================================================
// SYSTEM TRACK EVENT UNION
// =============================================================================

/**
 * Union of all system track events.
 */
export type SystemTrackEvent =
  | AudioTrackEvent
  | OSTrackEvent
  | MarkerTrackEvent
  | CallTrackEvent
  | DeviceTrackEvent
  | OverlayTrackEvent
  | VoiceTrackEvent;

// =============================================================================
// FULL TRACK EVENT UNION
// =============================================================================

/**
 * TrackEvent - Union of all track events (system + app).
 *
 * This is the canonical event type for the V2 DSL.
 * All tracks compile to TrackEvent[].
 */
export type TrackEvent =
  | SystemTrackEvent
  | AppTrackEventRegistry[keyof AppTrackEventRegistry];

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isAudioEvent(e: TrackEvent): e is AudioTrackEvent {
  return e.kind === "AUDIO";
}

export function isOSEvent(e: TrackEvent): e is OSTrackEvent {
  return e.kind === "OS";
}

export function isMarkerEvent(e: TrackEvent): e is MarkerTrackEvent {
  return e.kind === "MARKER";
}

export function isAppEvent(
  e: TrackEvent,
): e is AppTrackEventRegistry[keyof AppTrackEventRegistry] {
  return (e as { kind: string }).kind === "APP";
}

export function isCallEvent(e: TrackEvent): e is CallTrackEvent {
  return e.kind === "CALL";
}

export function isDeviceEvent(e: TrackEvent): e is DeviceTrackEvent {
  return e.kind === "DEVICE";
}

export function isOverlayEvent(e: TrackEvent): e is OverlayTrackEvent {
  return e.kind === "OVERLAY";
}

export function isVoiceEvent(e: TrackEvent): e is VoiceTrackEvent {
  return e.kind === "VOICE";
}
