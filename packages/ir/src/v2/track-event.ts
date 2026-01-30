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
  CameraPayloads,
  AudioPayloads,
  OSPayloads,
  MarkerPayloads,
  CallPayloads,
  DevicePayloads,
  VoicePayloads,
} from "./payloads";

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
 * Camera track event
 */
export type CameraTrackEvent = TrackEventBase & {
  kind: "CAMERA";
} & (
    | { type: "SET"; payload: CameraPayloads["SET"] }
    | { type: "ANIMATE_START"; payload: CameraPayloads["ANIMATE_START"] }
    | { type: "ANIMATE_END"; payload: CameraPayloads["ANIMATE_END"] }
    | { type: "FOCUS"; payload: CameraPayloads["FOCUS"] }
    | { type: "TRACK_START"; payload: CameraPayloads["TRACK_START"] }
    | { type: "TRACK_END"; payload: CameraPayloads["TRACK_END"] }
    | { type: "SHAKE_START"; payload: CameraPayloads["SHAKE_START"] }
    | { type: "SHAKE_END"; payload: CameraPayloads["SHAKE_END"] }
    | { type: "RESET"; payload: CameraPayloads["RESET"] }
    | { type: "ZOOM"; payload: CameraPayloads["ZOOM"] }
    | { type: "SHAKE"; payload: CameraPayloads["SHAKE"] }
    | { type: "ANCHOR_FOCUS"; payload: CameraPayloads["ANCHOR_FOCUS"] }
    | { type: "ANCHOR_TRACK"; payload: CameraPayloads["ANCHOR_TRACK"] }
    | { type: "CUT"; payload: CameraPayloads["CUT"] }
    | { type: "PUNCH_ZOOM"; payload: CameraPayloads["PUNCH_ZOOM"] }
    | { type: "DUTCH_TILT"; payload: CameraPayloads["DUTCH_TILT"] }
    | { type: "FLASH"; payload: CameraPayloads["FLASH"] }
    | { type: "WHIP_PAN"; payload: CameraPayloads["WHIP_PAN"] }
  );

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
    | { type: "NOTIFICATION_SHOW"; payload: OSPayloads["NOTIFICATION_SHOW"] }
    | {
        type: "NOTIFICATION_DISMISS";
        payload: OSPayloads["NOTIFICATION_DISMISS"];
      }
    | {
        type: "NOTIFICATION_DISMISS_ALL";
        payload: OSPayloads["NOTIFICATION_DISMISS_ALL"];
      }
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
        type: "NOTIFICATION_SHOW";
        payload: DevicePayloads["NOTIFICATION_SHOW"];
      }
    | {
        type: "NOTIFICATION_DISMISS";
        payload: DevicePayloads["NOTIFICATION_DISMISS"];
      }
    | { type: "NOTIFICATION_TAP"; payload: DevicePayloads["NOTIFICATION_TAP"] }
    | {
        type: "NOTIFICATION_SWIPE";
        payload: DevicePayloads["NOTIFICATION_SWIPE"];
      }
    | {
        type: "NOTIFICATION_REPLY";
        payload: DevicePayloads["NOTIFICATION_REPLY"];
      }
    | {
        type: "NOTIFICATION_DYNAMIC_ISLAND";
        payload: DevicePayloads["NOTIFICATION_DYNAMIC_ISLAND"];
      }
    | {
        type: "NOTIFICATION_OPEN_PANEL";
        payload: DevicePayloads["NOTIFICATION_OPEN_PANEL"];
      }
    | {
        type: "NOTIFICATION_CLOSE_PANEL";
        payload: DevicePayloads["NOTIFICATION_CLOSE_PANEL"];
      }
    | {
        type: "NOTIFICATION_CLEAR_ALL";
        payload: DevicePayloads["NOTIFICATION_CLEAR_ALL"];
      }
    | {
        type: "SET_DYNAMIC_ISLAND";
        payload: DevicePayloads["SET_DYNAMIC_ISLAND"];
      }
    | { type: "SET_BADGE"; payload: DevicePayloads["SET_BADGE"] }
    | { type: "KEYBOARD_SHOW"; payload: DevicePayloads["KEYBOARD_SHOW"] }
    | { type: "KEYBOARD_HIDE"; payload: DevicePayloads["KEYBOARD_HIDE"] }
    | {
        type: "KEYBOARD_KEY_PRESS";
        payload: DevicePayloads["KEYBOARD_KEY_PRESS"];
      }
    | { type: "KEYBOARD_TYPE"; payload: DevicePayloads["KEYBOARD_TYPE"] }
    | { type: "KEYBOARD_CLEAR"; payload: DevicePayloads["KEYBOARD_CLEAR"] }
    | {
        type: "KEYBOARD_SET_SUGGESTIONS";
        payload: DevicePayloads["KEYBOARD_SET_SUGGESTIONS"];
      }
    | {
        type: "KEYBOARD_TAP_SUGGESTION";
        payload: DevicePayloads["KEYBOARD_TAP_SUGGESTION"];
      }
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
  | CameraTrackEvent
  | AudioTrackEvent
  | OSTrackEvent
  | MarkerTrackEvent
  | CallTrackEvent
  | DeviceTrackEvent
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

export function isCameraEvent(e: TrackEvent): e is CameraTrackEvent {
  return e.kind === "CAMERA";
}

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

export function isVoiceEvent(e: TrackEvent): e is VoiceTrackEvent {
  return e.kind === "VOICE";
}
