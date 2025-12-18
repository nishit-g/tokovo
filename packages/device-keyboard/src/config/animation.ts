/**
 * Keyboard Animation Constants
 * 
 * Timing values for keyboard animations.
 */

// =============================================================================
// ANIMATION CONSTANTS
// =============================================================================

export const KEYBOARD_ANIMATION = {
    /** Slide up/down duration in frames */
    SLIDE_DURATION_FRAMES: 18,

    /** Key press phases in frames */
    KEY_DOWN_DURATION: 2,
    KEY_HOLD_DURATION: 3,
    KEY_UP_DURATION: 2,
    KEY_TOTAL_DURATION: 7,

    /** Popup delay before showing */
    POPUP_DELAY_FRAMES: 0,

    /** Easing bezier curve (iOS spring) */
    EASING: [0.19, 1, 0.22, 1] as const,

    /** Key scale on press */
    KEY_SCALE_PRESSED: 1.15,
    KEY_SCALE_NORMAL: 1.0,
} as const;

// =============================================================================
// LAYOUT ANIMATION
// =============================================================================

export const LAYOUT_SWITCH_ANIMATION = {
    /** Duration for layout switch */
    DURATION_FRAMES: 12,

    /** Fade out duration */
    FADE_OUT_FRAMES: 6,

    /** Fade in duration */
    FADE_IN_FRAMES: 6,
} as const;

// =============================================================================
// CURSOR ANIMATION
// =============================================================================

export const CURSOR_ANIMATION = {
    /** Cursor blink rate in frames */
    BLINK_INTERVAL_FRAMES: 30,

    /** Cursor visible duration in frames */
    VISIBLE_DURATION_FRAMES: 20,
} as const;
