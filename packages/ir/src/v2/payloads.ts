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
    preset?: "cinematic" | "drama" | "fast-beat" | "calm";
    scale?: number;
    smoothing?: number;
    deadZonePx?: number;
    maxVelocityPxPerSec?: number;
    predictiveLookaheadFrames?: number;
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
    spring?: string;
  };
  ZOOM: {
    scale: number;
    duration?: number;
    easing?: EasingType;
  };
  SHAKE: {
    intensityX: number;
    intensityY: number;
    duration?: number;
    frequency?: number;
    decay?: number;
  };
  ANCHOR_FOCUS: {
    anchorId: string;
    scale?: number;
    padding?: number;
    easing?: EasingType;
    duration?: number;
  };
  ANCHOR_TRACK: {
    anchorId: string;
    preset?: "cinematic" | "drama" | "fast-beat" | "calm";
    scale?: number;
    smoothing?: number;
    deadZonePx?: number;
    maxVelocityPxPerSec?: number;
    predictiveLookaheadFrames?: number;
    duration?: number;
  };
  CUT: {
    x?: number;
    y?: number;
    scale?: number;
    anchorId?: string;
  };
  PUNCH_ZOOM: {
    intensity: number;
    direction: "in" | "out";
    spring?: string;
  };
  DUTCH_TILT: {
    angle: number;
    spring?: string;
  };
  FLASH: {
    color?: string;
    intensity?: number;
  };
  WHIP_PAN: {
    direction: "left" | "right" | "up" | "down";
    blur?: number;
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
  };
  CLOSE_APP: Record<string, never>;
  GO_HOME: Record<string, never>;
  NOTIFICATION_SHOW: {
    kind?: "show";
    id: string;
    appId: string;
    title: string;
    body: string;
    icon?: string;
    mode?: "headsup" | "lockscreen" | "both";
    priority?:
      | "HIGH"
      | "DEFAULT"
      | "LOW"
      | "high"
      | "default"
      | "low"
      | "critical";
    duration?: number;
    groupKey?: string;
    threadKey?: string;
    actions?: Array<{ id: string; label: string; destructive?: boolean }>;
    replyable?: boolean;
    metadata?: Record<string, unknown>;
  };
  NOTIFICATION_DISMISS: {
    kind?: "dismiss";
    id: string;
  };
  NOTIFICATION_TAP: {
    kind?: "tap";
    id: string;
    actionId?: string;
  };
  NOTIFICATION_SWIPE: {
    kind?: "swipe";
    id: string;
    direction?: "left" | "right";
  };
  NOTIFICATION_REPLY: {
    kind?: "reply";
    id: string;
    text: string;
  };
  NOTIFICATION_DYNAMIC_ISLAND: {
    kind?: "dynamicIsland";
    mode: "idle" | "minimal" | "compact" | "expanded";
  };
  NOTIFICATION_OPEN_PANEL: Record<string, never>;
  NOTIFICATION_CLOSE_PANEL: Record<string, never>;
  NOTIFICATION_CLEAR_ALL: {
    kind?: "clearAll";
  };
  SET_DYNAMIC_ISLAND: {
    visible: boolean;
    mode?: "idle" | "minimal" | "compact" | "expanded";
  };
  SET_BADGE: {
    appId: string;
    count: number;
  };
  KEYBOARD_SHOW: {
    returnKeyType?: "default" | "go" | "search" | "send" | "next" | "done";
  };
  KEYBOARD_HIDE: Record<string, never>;
  KEYBOARD_KEY_PRESS: {
    key: string;
  };
  KEYBOARD_TYPE: {
    text: string;
    speed?: "slow" | "natural" | "fast";
  };
  KEYBOARD_CLEAR: Record<string, never>;
  KEYBOARD_SET_SUGGESTIONS: {
    suggestions: string[];
  };
  KEYBOARD_TAP_SUGGESTION: {
    index: number;
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
  call: CallPayloads;
  device: DevicePayloads;
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
