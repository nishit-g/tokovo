/**
 * Non-App Canonical Events (DEVICE, OS, CAMERA, AUDIO, CALL)
 *
 * These are universal events that don't belong to any specific app plugin.
 *
 * @module @tokovo/core/canonical/device-events
 */

import type { CanonicalTrace } from "./events";

// =============================================================================
// BASE EVENT
// =============================================================================

interface BaseEvent {
    readonly at: number;
    readonly trace: CanonicalTrace;
}

// =============================================================================
// DEVICE EVENTS
// =============================================================================

/**
 * DEVICE events control the device itself (lock, unlock, open app, etc.)
 */
export type DeviceRuntimeEvent =
    | (BaseEvent & {
        readonly kind: "DEVICE";
        readonly type: "LOCK";
        readonly deviceId: string;
    })
    | (BaseEvent & {
        readonly kind: "DEVICE";
        readonly type: "UNLOCK";
        readonly deviceId: string;
    })
    | (BaseEvent & {
        readonly kind: "DEVICE";
        readonly type: "OPEN_APP";
        readonly deviceId: string;
        readonly appId: string;
    })
    | (BaseEvent & {
        readonly kind: "DEVICE";
        readonly type: "CLOSE_APP";
        readonly deviceId: string;
    })
    | (BaseEvent & {
        readonly kind: "DEVICE";
        readonly type: "GO_HOME";
        readonly deviceId: string;
    })
    | (BaseEvent & {
        readonly kind: "DEVICE";
        readonly type: "NOTIFICATION";
        readonly deviceId: string;
        readonly notification: NotificationData;
    })
    | (BaseEvent & {
        readonly kind: "DEVICE";
        readonly type: "DISMISS_NOTIFICATION";
        readonly deviceId: string;
        readonly notificationId: string;
    });

/**
 * Notification data.
 */
export interface NotificationData {
    readonly id: string;
    readonly appId: string;
    readonly title: string;
    readonly body?: string;
    readonly icon?: string;
    readonly timestamp?: string;
}

// =============================================================================
// OS EVENTS
// =============================================================================

/**
 * Network type for OS events.
 */
export type NetworkType = "wifi" | "cellular" | "none";

/**
 * OS events control system state (time, battery, network).
 */
export type OSRuntimeEvent =
    | (BaseEvent & {
        readonly kind: "OS";
        readonly type: "SET_TIME";
        readonly deviceId: string;
        /** Time in 24h format (e.g., "14:30") or Unix timestamp */
        readonly time: string | number;
    })
    | (BaseEvent & {
        readonly kind: "OS";
        readonly type: "SET_BATTERY";
        readonly deviceId: string;
        /** Battery level 0-100 */
        readonly level: number;
        readonly charging?: boolean;
    })
    | (BaseEvent & {
        readonly kind: "OS";
        readonly type: "SET_NETWORK";
        readonly deviceId: string;
        readonly network: NetworkType;
        /** Signal strength 0-4 */
        readonly strength?: number;
    })
    | (BaseEvent & {
        readonly kind: "OS";
        readonly type: "SET_DND";
        readonly deviceId: string;
        readonly enabled: boolean;
    });

// =============================================================================
// CAMERA EVENTS
// =============================================================================

/**
 * Easing functions for camera animations.
 */
export type EasingType = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring" | "cinematic";

/**
 * CAMERA events control cinematic effects (zoom, pan, shake).
 */
export type CameraRuntimeEvent =
    | (BaseEvent & {
        readonly kind: "CAMERA";
        readonly type: "ZOOM";
        /** Target device (optional, defaults to active) */
        readonly deviceId?: string;
        /** Zoom scale (1.0 = no zoom, 2.0 = 2x) */
        readonly scale: number;
        /** Duration in frames */
        readonly duration: number;
        /** Zoom origin X (0-1, default 0.5) */
        readonly originX?: number;
        /** Zoom origin Y (0-1, default 0.5) */
        readonly originY?: number;
        readonly easing?: EasingType;
    })
    | (BaseEvent & {
        readonly kind: "CAMERA";
        readonly type: "PAN";
        readonly deviceId?: string;
        /** Translate X in pixels */
        readonly translateX: number;
        /** Translate Y in pixels */
        readonly translateY: number;
        readonly duration: number;
        readonly easing?: EasingType;
    })
    | (BaseEvent & {
        readonly kind: "CAMERA";
        readonly type: "SHAKE";
        readonly deviceId?: string;
        /** Shake intensity in pixels */
        readonly intensity: number;
        /** Oscillations per second */
        readonly frequency: number;
        /** Duration in frames */
        readonly duration: number;
        /** Decay rate 0-1 */
        readonly decay?: number;
        /** Random seed for determinism */
        readonly seed?: number;
    })
    | (BaseEvent & {
        readonly kind: "CAMERA";
        readonly type: "RESET";
        readonly deviceId?: string;
        readonly duration: number;
        readonly easing?: EasingType;
    })
    | (BaseEvent & {
        readonly kind: "CAMERA";
        readonly type: "FOCUS";
        readonly deviceId?: string;
        /** Focus point X (0-1) */
        readonly focusX: number;
        /** Focus point Y (0-1) */
        readonly focusY: number;
        readonly duration: number;
    })
    | (BaseEvent & {
        readonly kind: "CAMERA";
        readonly type: "LAYOUT";
        readonly mode: "SINGLE" | "SPLIT" | "PIP";
        readonly primaryDeviceId: string;
        readonly secondaryDeviceId?: string;
    });

// =============================================================================
// AUDIO EVENTS
// =============================================================================

/**
 * AUDIO events control sound effects and music.
 */
export type AudioRuntimeEvent =
    | (BaseEvent & {
        readonly kind: "AUDIO";
        readonly type: "PLAY";
        /** Sound asset ID */
        readonly soundId: string;
        /** Instance ID for stopping/fading specific sounds */
        readonly instanceId: string;
        /** Volume 0-1 */
        readonly volume?: number;
        readonly loop?: boolean;
        /** Duration in frames (for auto-stop) */
        readonly duration?: number;
    })
    | (BaseEvent & {
        readonly kind: "AUDIO";
        readonly type: "STOP";
        readonly instanceId: string;
    })
    | (BaseEvent & {
        readonly kind: "AUDIO";
        readonly type: "FADE";
        readonly instanceId: string;
        readonly toVolume: number;
        /** Duration in frames */
        readonly duration: number;
    })
    | (BaseEvent & {
        readonly kind: "AUDIO";
        readonly type: "MUSIC";
        readonly soundId: string;
        readonly volume?: number;
        readonly loop?: boolean;
        readonly fadeIn?: number;
    })
    | (BaseEvent & {
        readonly kind: "AUDIO";
        readonly type: "STOP_MUSIC";
        readonly fadeOut?: number;
    });

// =============================================================================
// CALL EVENTS
// =============================================================================

/**
 * CALL events control phone/video call overlays.
 */
export type CallRuntimeEvent =
    | (BaseEvent & {
        readonly kind: "CALL";
        readonly type: "INCOMING";
        readonly deviceId: string;
        readonly callerId: string;
        readonly callerName: string;
        readonly callerAvatar?: string;
        readonly isVideo?: boolean;
        readonly displayMode?: "overlay" | "fullscreen";
    })
    | (BaseEvent & {
        readonly kind: "CALL";
        readonly type: "ANSWER";
        readonly deviceId: string;
    })
    | (BaseEvent & {
        readonly kind: "CALL";
        readonly type: "DECLINE";
        readonly deviceId: string;
    })
    | (BaseEvent & {
        readonly kind: "CALL";
        readonly type: "END";
        readonly deviceId: string;
    })
    | (BaseEvent & {
        readonly kind: "CALL";
        readonly type: "ACTIVE";
        readonly deviceId: string;
        /** Call duration display */
        readonly duration?: string;
    });

// =============================================================================
// TOUCH EVENTS
// =============================================================================

/**
 * TOUCH events for simulating user interaction.
 */
export type TouchRuntimeEvent =
    | (BaseEvent & {
        readonly kind: "TOUCH";
        readonly type: "TAP";
        readonly deviceId: string;
        readonly x: number;
        readonly y: number;
    })
    | (BaseEvent & {
        readonly kind: "TOUCH";
        readonly type: "SWIPE";
        readonly deviceId: string;
        readonly startX: number;
        readonly startY: number;
        readonly endX: number;
        readonly endY: number;
        readonly duration: number;
    })
    | (BaseEvent & {
        readonly kind: "TOUCH";
        readonly type: "SCROLL";
        readonly deviceId: string;
        readonly deltaY: number;
        readonly duration: number;
    });

// =============================================================================
// MASTER UNION
// =============================================================================

import type { AppRuntimeEvent } from "./events";

/**
 * Union of ALL canonical runtime events.
 *
 * This is the master type that the engine processes.
 */
export type CanonicalRuntimeEvent =
    | AppRuntimeEvent
    | DeviceRuntimeEvent
    | OSRuntimeEvent
    | CameraRuntimeEvent
    | AudioRuntimeEvent
    | CallRuntimeEvent
    | TouchRuntimeEvent;

/**
 * All event kinds.
 */
export type EventKind = CanonicalRuntimeEvent["kind"];

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isAppEvent(e: CanonicalRuntimeEvent): e is AppRuntimeEvent {
    return e.kind === "APP";
}

export function isDeviceEvent(e: CanonicalRuntimeEvent): e is DeviceRuntimeEvent {
    return e.kind === "DEVICE";
}

export function isOSEvent(e: CanonicalRuntimeEvent): e is OSRuntimeEvent {
    return e.kind === "OS";
}

export function isCameraEvent(e: CanonicalRuntimeEvent): e is CameraRuntimeEvent {
    return e.kind === "CAMERA";
}

export function isAudioEvent(e: CanonicalRuntimeEvent): e is AudioRuntimeEvent {
    return e.kind === "AUDIO";
}

export function isCallEvent(e: CanonicalRuntimeEvent): e is CallRuntimeEvent {
    return e.kind === "CALL";
}

export function isTouchEvent(e: CanonicalRuntimeEvent): e is TouchRuntimeEvent {
    return e.kind === "TOUCH";
}
