/**
 * Constants - Centralized configuration values
 * 
 * All magic numbers and default values should be defined here.
 * This makes the codebase more maintainable and configurable.
 */

// =============================================================================
// TIMING CONSTANTS
// =============================================================================

export const TIMING = {
    /** Default frames per second */
    FPS_DEFAULT: 30,

    /** Duration of heads-up notification in frames (5 seconds at 30fps) */
    HEADS_UP_DURATION: 150,

    /** Buffer frames to keep effects after they end (for smooth transitions) */
    EFFECT_CLEANUP_BUFFER: 30,

    /** Default typing indicator animation duration in frames */
    TYPING_ANIMATION_DURATION: 90,

    /** Default message appear animation duration in frames */
    MESSAGE_ANIMATION_DURATION: 15,
} as const;

// =============================================================================
// LAYOUT CONSTANTS (in 3x scale for Remotion)
// =============================================================================

export const LAYOUT = {
    /** Chat header height (status bar + nav bar) */
    CHAT_HEADER_HEIGHT: 414,

    /** Chat input area height (input field + home indicator) */
    CHAT_INPUT_HEIGHT: 272,

    /** Status bar height */
    STATUS_BAR_HEIGHT: 144,

    /** Navigation bar height */
    NAV_BAR_HEIGHT: 270,

    /** Home indicator height */
    HOME_INDICATOR_HEIGHT: 102,

    /** Split layout divider width */
    SPLIT_DIVIDER_WIDTH: 2,

    /** Message bubble max width ratio (0-1) */
    MESSAGE_BUBBLE_MAX_WIDTH: 0.75,

    /** Message bubble border radius */
    MESSAGE_BUBBLE_RADIUS: 54,

    /** Message spacing */
    MESSAGE_GAP: 12,
} as const;

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULTS = {
    /** Default audio volume (0-1) */
    VOLUME: 1,

    /** Default background music volume */
    BACKGROUND_MUSIC_VOLUME: 0.5,

    /** Default video background color */
    BACKGROUND_COLOR: "#0a0a1a",

    /** Default split layout divider color */
    SPLIT_LINE_COLOR: "#333333",

    /** Default zoom scale */
    ZOOM_SCALE: 1.3,

    /** Default shake intensity */
    SHAKE_INTENSITY: 10,

    /** Default shake frequency (shakes per second) */
    SHAKE_FREQUENCY: 16,

    /** Default shake decay */
    SHAKE_DECAY: 0.3,

    /** Default camera easing */
    CAMERA_EASING: "ease-out" as const,

    /** Default PIP scale */
    PIP_SCALE: 0.3,

    /** Default PIP position */
    PIP_POSITION: "bottom-right" as const,
} as const;

// =============================================================================
// APP IDENTIFIERS
// =============================================================================

export const APP_IDS = {
    WHATSAPP: "app_whatsapp",
    INSTAGRAM: "app_instagram",
    IMESSAGE: "app_imessage",
    TIKTOK: "app_tiktok",
    TWITTER: "app_twitter",
    PHONE: "app_phone",
} as const;

// =============================================================================
// DEVICE IDENTIFIERS
// =============================================================================

export const DEVICE_PROFILES = {
    IPHONE_16: "iphone16",
    PIXEL: "pixel",
} as const;

// =============================================================================
// EVENT KINDS
// =============================================================================

export const EVENT_KINDS = {
    DEVICE: "DEVICE",
    APP: "APP",
    CAMERA: "CAMERA",
    AUDIO: "AUDIO",
    KEYBOARD: "KEYBOARD",
    OS: "OS",
    TOUCH: "TOUCH",
    CALL: "CALL",
} as const;

// =============================================================================
// SOUND IDENTIFIERS
// =============================================================================

export const SOUND_IDS = {
    WHATSAPP_RECEIVED: "whatsapp_received",
    WHATSAPP_SENT: "whatsapp_sent",
    NOTIFICATION: "notification",
    RINGTONE: "ringtone",
    TYPING: "typing",
    CAMERA_SHUTTER: "camera_shutter",
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert seconds to frames at given FPS
 */
export function secondsToFrames(seconds: number, fps: number = TIMING.FPS_DEFAULT): number {
    return Math.round(seconds * fps);
}

/**
 * Convert frames to seconds at given FPS
 */
export function framesToSeconds(frames: number, fps: number = TIMING.FPS_DEFAULT): number {
    return frames / fps;
}

/**
 * Get timing value in frames for common durations
 */
export const DURATION_FRAMES = {
    /** 0.5 seconds */
    HALF_SECOND: secondsToFrames(0.5),
    /** 1 second */
    ONE_SECOND: secondsToFrames(1),
    /** 2 seconds */
    TWO_SECONDS: secondsToFrames(2),
    /** 3 seconds */
    THREE_SECONDS: secondsToFrames(3),
    /** 5 seconds */
    FIVE_SECONDS: secondsToFrames(5),
    /** 10 seconds */
    TEN_SECONDS: secondsToFrames(10),
} as const;
