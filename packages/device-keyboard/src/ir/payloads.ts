/**
 * Keyboard IR Payloads
 * 
 * Strongly-typed payloads for keyboard track events.
 */

import type { KeyboardLayout } from "../types/layouts";
import type { SpeedPreset } from "../config/speeds";

// =============================================================================
// KEYBOARD PAYLOADS
// =============================================================================

export interface KeyboardPayloads {
    /** Show keyboard */
    SHOW: {
        layout?: KeyboardLayout;
        animated?: boolean;
    };

    /** Hide keyboard */
    HIDE: {
        animated?: boolean;
    };

    /** Type text with speed control */
    TYPE: {
        text: string;
        speed?: number | SpeedPreset;
        variation?: boolean;
        mistakes?: boolean;
        autocorrect?: boolean;
    };

    /** Key down event */
    KEY_DOWN: {
        key: string;
    };

    /** Key up event */
    KEY_UP: {
        key: string;
    };

    /** Switch keyboard layout */
    SWITCH_LAYOUT: {
        layout: KeyboardLayout;
    };

    /** Clear input text */
    CLEAR: Record<string, never>;

    /** Set input text directly */
    SET_TEXT: {
        text: string;
    };

    /** Move cursor position */
    CURSOR_MOVE: {
        position: number;
    };

    /** Select text range */
    SELECT_RANGE: {
        start: number;
        end: number;
    };

    /** Accept autocomplete suggestion */
    ACCEPT_SUGGESTION: {
        index: number;
        word?: string;
    };

    /** Paste from clipboard */
    PASTE: {
        text: string;
    };

    /** Backspace (delete) */
    BACKSPACE: {
        count?: number;
    };
}

// =============================================================================
// PAYLOAD TYPE HELPER
// =============================================================================

export type KeyboardPayloadType = keyof KeyboardPayloads;

export type KeyboardPayload<T extends KeyboardPayloadType> = KeyboardPayloads[T];
