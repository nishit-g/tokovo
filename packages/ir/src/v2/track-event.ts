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
        | { type: "NOTIFICATION_DISMISS"; payload: OSPayloads["NOTIFICATION_DISMISS"] }
        | { type: "NOTIFICATION_DISMISS_ALL"; payload: OSPayloads["NOTIFICATION_DISMISS_ALL"] }
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
    | MarkerTrackEvent;

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

export function isAppEvent(e: TrackEvent): e is AppTrackEventRegistry[keyof AppTrackEventRegistry] {
    return (e as { kind: string }).kind === "APP";
}
