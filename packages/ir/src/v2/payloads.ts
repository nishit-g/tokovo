/**
 * Track Payloads - Type-safe payload definitions for system tracks
 *
 * System payloads for Camera, Audio, OS, and Markers.
 * App-specific payloads are defined via module augmentation.
 *
 * @example
 * ```typescript
 * // In apps-whatsapp/src/payloads.ts
 * declare module "@tokovo/ir" {
 *     interface AppPayloadRegistry {
 *         app_whatsapp: WhatsAppPayloads;
 *     }
 * }
 * ```
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export type EasingType = "linear" | "easeIn" | "easeOut" | "easeInOut" | "cinematic";

export interface TrackMessageRef {
    id: string;
    deviceId: string;
    appId: string;
    conversationId: string;
}

// =============================================================================
// CAMERA PAYLOADS
// =============================================================================

export interface CameraPayloads {
    SET: {
        x?: number;
        y?: number;
        scale?: number;
        rotation?: number;
        originX?: number;
        originY?: number;
    };
    ANIMATE_START: {
        x?: number;
        y?: number;
        scale?: number;
        rotation?: number;
        originX?: number;
        originY?: number;
        easing: EasingType;
    };
    ANIMATE_END: Record<string, never>;
    FOCUS: {
        anchorId: string;
        scale?: number;
        padding?: number;
        easing?: EasingType;
    };
    TRACK_START: {
        anchorId: string;
        scale?: number;
        lag?: number;
    };
    TRACK_END: Record<string, never>;
    SHAKE_START: {
        intensityX: number;
        intensityY: number;
        frequency?: number;
        decay?: number;
    };
    SHAKE_END: Record<string, never>;
    RESET: {
        easing?: EasingType;
    };
}

// =============================================================================
// AUDIO PAYLOADS
// =============================================================================

export interface AudioPayloads {
    BGM_START: {
        soundId: string;
        volume: number;
        fadeIn?: number;
    };
    BGM_END: {
        fadeOut?: number;
    };
    PLAY: {
        soundId: string;
        volume?: number;
        loop?: boolean;
    };
    STOP: {
        soundId: string;
    };
    CROSSFADE: {
        soundId: string;
        volume: number;
        duration: number;
    };
    FADE_OUT: {
        duration: number;
    };
    STOP_ALL: Record<string, never>;
}

// =============================================================================
// OS PAYLOADS
// =============================================================================

export interface OSPayloads {
    SET_STATE: {
        time?: number;
        battery?: number;
        charging?: boolean;
        network?: "wifi" | "5G" | "4G" | "3G" | "none";
        strength?: number;
        dnd?: boolean;
        lowPowerMode?: boolean;
    };
    SET_TIME: {
        time: number;
    };
    SET_BATTERY: {
        level: number;
        charging?: boolean;
    };
    SET_NETWORK: {
        type: "wifi" | "5G" | "4G" | "3G" | "none";
        strength?: number;
    };
    SET_DND: {
        enabled: boolean;
    };
    NOTIFICATION_SHOW: {
        id: string;
        appId: string;
        title: string;
        body: string;
        icon?: string;
        mode?: "headsup" | "lockscreen" | "both";
    };
    NOTIFICATION_DISMISS: {
        id: string;
    };
    NOTIFICATION_DISMISS_ALL: Record<string, never>;
}

// =============================================================================
// MARKER PAYLOADS
// =============================================================================

export interface MarkerPayloads {
    MARK: {
        id: string;
    };
    SECTION_START: {
        id: string;
    };
    SECTION_END: {
        id: string;
    };
}

// =============================================================================
// APP PAYLOAD REGISTRY (Extensible via Module Augmentation)
// =============================================================================

/**
 * Registry for app-specific payloads.
 * Apps extend this interface via module augmentation.
 *
 * @example
 * ```typescript
 * declare module "@tokovo/ir" {
 *     interface AppPayloadRegistry {
 *         app_whatsapp: WhatsAppPayloads;
 *     }
 * }
 * ```
 */
export interface AppPayloadRegistry {
    // Apps add their payloads here via module augmentation
}

// =============================================================================
// SYSTEM PAYLOADS
// =============================================================================

/**
 * System payloads - always available in IR.
 */
export interface SystemPayloads {
    camera: CameraPayloads;
    audio: AudioPayloads;
    os: OSPayloads;
    marker: MarkerPayloads;
}

// =============================================================================
// COMBINED PAYLOADS
// =============================================================================

/**
 * All payloads - system + app
 */
export type AllPayloads = SystemPayloads & AppPayloadRegistry;

// =============================================================================
// TYPE HELPERS
// =============================================================================

export type SystemTrackId = keyof SystemPayloads;
export type AppId = keyof AppPayloadRegistry;
export type AllTrackId = SystemTrackId | AppId;
