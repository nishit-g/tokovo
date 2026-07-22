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

export type EasingType =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "cinematic";

export interface TrackMessageRef {
  id: string;
  deviceId: string;
  appId: string;
  conversationId: string;
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
// VOICE PAYLOADS
// =============================================================================

export interface VoicePayloads {
  PLAY_SEGMENT: {
    segmentId: string;
    audioPath: string;
    startMs: number;
    endMs: number;
    volume?: number;
    speed?: number;
    speaker?: string;
    text?: string;
  };
  STOP_VOICE: Record<string, never>;
}

// =============================================================================
// OS PAYLOADS
// =============================================================================

export interface OSPayloads {
  SET_STATE: {
    locale?: string;
    appearance?: "light" | "dark";
    hourCycle?: "h12" | "h24";
    lockScreenWallpaper?: string;
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

export interface CallPayloads {
  INCOMING: {
    callerId: string;
    callerName?: string;
    callerAvatar?: string;
    isVideo?: boolean;
  };
  ANSWER: Record<string, never>;
  DECLINE: Record<string, never>;
  END: Record<string, never>;
  TOGGLE_MUTE: Record<string, never>;
  TOGGLE_SPEAKER: Record<string, never>;
  TOGGLE_HOLD: Record<string, never>;
}

export interface DevicePayloads {
  LOCK: Record<string, never>;
  UNLOCK: Record<string, never>;
  OPEN_APP: {
    appId: string;
    transition?: {
      durationFrames?: number;
      style?: string;
      originX?: number;
      originY?: number;
    };
  };
  CLOSE_APP: Record<string, never>;
  GO_HOME: {
    transition?: {
      durationFrames?: number;
      style?: string;
      originX?: number;
      originY?: number;
    };
  };
  SET_DYNAMIC_ISLAND: {
    visible: boolean;
    presentation?: "idle" | "minimal" | "compact" | "expanded";
    activity?: "music" | "call" | "timer" | "recording" | "location" | null;
    appId?: string;
    content?: {
      title?: string;
      subtitle?: string;
      icon?: string;
      tint?: string;
      elapsedLabel?: string;
    };
  };
  SET_BADGE: {
    appId: string;
    count: number;
  };
  SET_SCREEN_RECORDING: {
    enabled: boolean;
    presentation?: "compact" | "expanded" | "hidden";
    microphoneEnabled?: boolean;
    countdownFrames?: number;
    feedbackFrames?: number;
  };
  INCOMING_CALL: {
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo?: boolean;
    callType?: string;
    displayMode?: string;
    callerMetadata?: Record<string, unknown>;
  };
  CALL_ANSWERED: Record<string, never>;
  CALL_ENDED: Record<string, never>;
}

// =============================================================================
// OVERLAY PAYLOADS (Story / Captions)
// =============================================================================

export type OverlayVariant =
  | "hook"
  | "caption"
  | "receipt"
  | "reactionGif"
  | "cliffhanger";

export type OverlayPlacementPreset =
  | "top"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "center";

export interface OverlayPayloads {
  SHOW: {
    /** Optional stable id to hide/update later. Auto-generated if missing. */
    id?: string;
    variant: OverlayVariant;
    /** Optional lane for replacement behavior (default = variant). */
    lane?: string;
    text?: string;
    mediaSrc?: string;
    /** How long to keep visible (frames). If omitted, reducer applies variant defaults. */
    durationFrames?: number;
    /** Positioning hint. */
    preset?: OverlayPlacementPreset;
    /** Optional fine positioning (0-1 in composition coords). */
    xPct?: number;
    yPct?: number;
    /** Visual emphasis (0-1). */
    intensity?: number;
  };
  HIDE: {
    id?: string;
    lane?: string;
    variant?: OverlayVariant;
  };
  CLEAR: Record<string, never>;
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
  audio: AudioPayloads;
  os: OSPayloads;
  marker: MarkerPayloads;
  call: CallPayloads;
  device: DevicePayloads;
  overlay: OverlayPayloads;
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
