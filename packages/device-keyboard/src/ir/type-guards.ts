/**
 * Keyboard Type Guards
 * 
 * Runtime type checking for keyboard events.
 */

import type { KeyboardTrackEvent, KeyboardTypeOp, KeyboardInputOp } from "./track-event";

// =============================================================================
// TRACK EVENT GUARDS
// =============================================================================

export function isKeyboardTrackEvent(e: unknown): e is KeyboardTrackEvent {
    if (typeof e !== "object" || e === null) return false;
    const event = e as Record<string, unknown>;
    return event.kind === "OS" && event.target === "keyboard";
}

export function isKeyboardShowEvent(e: KeyboardTrackEvent): e is KeyboardTrackEvent & { type: "SHOW" } {
    return e.type === "SHOW";
}

export function isKeyboardHideEvent(e: KeyboardTrackEvent): e is KeyboardTrackEvent & { type: "HIDE" } {
    return e.type === "HIDE";
}

export function isKeyboardTypeEvent(e: KeyboardTrackEvent): e is KeyboardTrackEvent & { type: "TYPE" } {
    return e.type === "TYPE";
}

// =============================================================================
// LEGACY EVENT GUARDS
// =============================================================================

export function isKeyboardTypeOp(e: unknown): e is KeyboardTypeOp {
    if (typeof e !== "object" || e === null) return false;
    const event = e as Record<string, unknown>;
    return event.kind === "KeyboardType";
}

export function isKeyboardInputOp(e: unknown): e is KeyboardInputOp {
    if (typeof e !== "object" || e === null) return false;
    const event = e as Record<string, unknown>;
    return event.kind === "KeyboardInput";
}

export function isKeyboardKeyDownOp(e: unknown): e is KeyboardInputOp & { type: "keyDown" } {
    return isKeyboardInputOp(e) && e.type === "keyDown";
}

export function isKeyboardKeyUpOp(e: unknown): e is KeyboardInputOp & { type: "keyUp" } {
    return isKeyboardInputOp(e) && e.type === "keyUp";
}
