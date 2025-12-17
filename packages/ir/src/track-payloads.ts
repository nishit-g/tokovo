/**
 * Track Payloads - Type-safe payload definitions for all track events
 * 
 * @description Each app/track defines its event types with strongly-typed payloads.
 * This eliminates `Record<string, unknown>` and provides full TypeScript inference.
 * 
 * @see docs-v2/DSL_REVAMP.md#trackevent-schema
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
// WHATSAPP PAYLOADS
// =============================================================================

export interface WhatsAppPayloads {
    MESSAGE_RECEIVED: {
        conversationId: string;
        from: string;
        text: string;
        silent?: boolean;
        replyTo?: TrackMessageRef;
    };
    MESSAGE_SENT: {
        conversationId: string;
        text: string;
        silent?: boolean;
    };
    TYPING_START: {
        conversationId: string;
        actor: string;
    };
    TYPING_END: {
        conversationId: string;
        actor: string;
    };
    IMAGE_RECEIVED: {
        conversationId: string;
        from: string;
        url: string;
        caption?: string;
        height?: number;
    };
    IMAGE_SENT: {
        conversationId: string;
        url: string;
        caption?: string;
    };
    VIDEO_RECEIVED: {
        conversationId: string;
        from: string;
        url: string;
        durationSeconds: number;
        thumbnail?: string;
    };
    VOICE_RECEIVED: {
        conversationId: string;
        from: string;
        durationSeconds: number;
    };
    GIF_RECEIVED: {
        conversationId: string;
        from: string;
        url: string;
    };
    REACT: {
        messageRef: TrackMessageRef;
        emoji: string;
    };
    READ: {
        conversationId: string;
    };
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
// TRACK PAYLOADS MAP
// =============================================================================

/**
 * Master type map for all track payloads.
 * 
 * Usage:
 * ```typescript
 * type MsgPayload = TrackPayloads["app_whatsapp"]["MESSAGE_RECEIVED"];
 * // { conversationId: string; from: string; text: string; silent?: boolean; ... }
 * ```
 */
export interface TrackPayloads {
    app_whatsapp: WhatsAppPayloads;
    app_twitter: {}; // TODO: Define Twitter payloads
    camera: CameraPayloads;
    audio: AudioPayloads;
    os: OSPayloads;
    marker: MarkerPayloads;
}

// =============================================================================
// TYPE HELPERS
// =============================================================================

export type AppId = keyof TrackPayloads;
export type EventType<A extends AppId> = keyof TrackPayloads[A];
export type Payload<A extends AppId, T extends EventType<A>> = TrackPayloads[A][T];
