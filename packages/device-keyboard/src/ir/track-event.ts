/**
 * Keyboard Track Event Types
 * 
 * IR event types for keyboard interactions.
 */

import type { TrackEventBase } from "@tokovo/ir";
import type { KeyboardPayloads } from "./payloads";

// =============================================================================
// KEYBOARD TRACK EVENT
// =============================================================================

export type KeyboardTrackEvent = TrackEventBase & {
    kind: "APP";
    appId: "keyboard";
    deviceId: string;
} & (
        | { type: "SHOW"; payload: KeyboardPayloads["SHOW"] }
        | { type: "HIDE"; payload: KeyboardPayloads["HIDE"] }
        | { type: "TYPE"; payload: KeyboardPayloads["TYPE"] }
        | { type: "KEY_DOWN"; payload: KeyboardPayloads["KEY_DOWN"] }
        | { type: "KEY_UP"; payload: KeyboardPayloads["KEY_UP"] }
        | { type: "SWITCH_LAYOUT"; payload: KeyboardPayloads["SWITCH_LAYOUT"] }
        | { type: "CLEAR"; payload: KeyboardPayloads["CLEAR"] }
        | { type: "SET_TEXT"; payload: KeyboardPayloads["SET_TEXT"] }
        | { type: "CURSOR_MOVE"; payload: KeyboardPayloads["CURSOR_MOVE"] }
        | { type: "SELECT_RANGE"; payload: KeyboardPayloads["SELECT_RANGE"] }
        | { type: "ACCEPT_SUGGESTION"; payload: KeyboardPayloads["ACCEPT_SUGGESTION"] }
        | { type: "PASTE"; payload: KeyboardPayloads["PASTE"] }
        | { type: "BACKSPACE"; payload: KeyboardPayloads["BACKSPACE"] }
    );

// =============================================================================
// MODULE AUGMENTATION
// =============================================================================

declare module "@tokovo/ir" {
    interface AppPayloadRegistry {
        keyboard: KeyboardPayloads;
    }

    interface AppTrackEventRegistry {
        keyboard: KeyboardTrackEvent;
    }
}

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * Legacy KeyboardType event (V2 IR)
 */
export interface KeyboardTypeOp {
    kind: "KeyboardType";
    at: number;
    deviceId: string;
    text: string;
    speed?: number;
}

/**
 * Legacy KeyboardInput event (V2 IR)
 */
export interface KeyboardInputOp {
    kind: "KeyboardInput";
    at: number;
    deviceId: string;
    type: "keyDown" | "keyUp";
    key: string;
}
