/**
 * TrackEvent - Fully typed track event union
 * 
 * @description All tracks compile to TrackEvent with typed payloads.
 * Routing fields (deviceId, appId) at top-level.
 * App-specific data (conversationId, etc.) in payload.
 * 
 * ## Module Augmentation Pattern
 * 
 * Apps should extend the AppTrackEventRegistry interface:
 * 
 * ```typescript
 * // In @tokovo/apps-whatsapp/src/types.ts:
 * declare module "@tokovo/ir" {
 *     interface AppTrackEventRegistry {
 *         app_whatsapp: WhatsAppTrackEvent;
 *     }
 * }
 * ```
 * 
 * @see docs-v2/DSL_REVAMP.md#trackevent-schema
 */

import {
    TrackPayloads,
    WhatsAppPayloads,
    CameraPayloads,
    AudioPayloads,
    OSPayloads,
    MarkerPayloads,
} from "./track-payloads";

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
// MODULE AUGMENTATION INTERFACE
// =============================================================================

/**
 * Registry for app-specific track events.
 * 
 * Plugins extend this interface via module augmentation.
 * This allows type-safe app events without hardcoding in IR.
 */
export interface AppTrackEventRegistry {
    // Plugins add their types here via module augmentation
    // Example: app_whatsapp: WhatsAppTrackEvent;
}

// =============================================================================
// TYPED TRACK EVENTS (System)
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
 * Marker event (debugging/navigation)
 */
export type MarkerTrackEvent = TrackEventBase & {
    kind: "MARKER";
} & (
        | { type: "MARK"; payload: MarkerPayloads["MARK"] }
        | { type: "SECTION_START"; payload: MarkerPayloads["SECTION_START"] }
        | { type: "SECTION_END"; payload: MarkerPayloads["SECTION_END"] }
    );

// =============================================================================
// LEGACY: WhatsApp (for backward compatibility)
// Will be moved to @tokovo/apps-whatsapp in future
// =============================================================================

/**
 * @deprecated Use module augmentation instead. This will be moved to apps-whatsapp.
 */
export type WhatsAppTrackEvent = TrackEventBase & {
    kind: "APP";
    appId: "app_whatsapp";
} & (
        | { type: "MESSAGE_RECEIVED"; payload: WhatsAppPayloads["MESSAGE_RECEIVED"] }
        | { type: "MESSAGE_SENT"; payload: WhatsAppPayloads["MESSAGE_SENT"] }
        | { type: "TYPING_START"; payload: WhatsAppPayloads["TYPING_START"] }
        | { type: "TYPING_END"; payload: WhatsAppPayloads["TYPING_END"] }
        | { type: "IMAGE_RECEIVED"; payload: WhatsAppPayloads["IMAGE_RECEIVED"] }
        | { type: "IMAGE_SENT"; payload: WhatsAppPayloads["IMAGE_SENT"] }
        | { type: "VIDEO_RECEIVED"; payload: WhatsAppPayloads["VIDEO_RECEIVED"] }
        | { type: "VOICE_RECEIVED"; payload: WhatsAppPayloads["VOICE_RECEIVED"] }
        | { type: "GIF_RECEIVED"; payload: WhatsAppPayloads["GIF_RECEIVED"] }
        | { type: "REACT"; payload: WhatsAppPayloads["REACT"] }
        | { type: "READ"; payload: WhatsAppPayloads["READ"] }
    );

// =============================================================================
// UNION TYPE
// =============================================================================

/**
 * TrackEvent - Union of all typed track events.
 * 
 * This is the canonical event type for the v2 DSL.
 * All tracks compile to TrackEvent[].
 * 
 * Includes:
 * - System events (Camera, Audio, OS, Marker)
 * - App events from AppTrackEventRegistry (via module augmentation)
 * - Legacy WhatsAppTrackEvent (deprecated, for backward compatibility)
 */
export type TrackEvent =
    | CameraTrackEvent
    | AudioTrackEvent
    | OSTrackEvent
    | MarkerTrackEvent
    | WhatsAppTrackEvent  // LEGACY - will be removed when apps use augmentation
    | AppTrackEventRegistry[keyof AppTrackEventRegistry];


// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isWhatsAppEvent(e: TrackEvent): e is WhatsAppTrackEvent {
    return e.kind === "APP" && (e as any).appId === "app_whatsapp";
}

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
