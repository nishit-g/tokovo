/**
 * Keyboard State Selectors
 * 
 * Pure functions for querying keyboard state.
 */

import type { WorldState } from "@tokovo/core";
import type { KeyboardState } from "../types/state";
import { DEFAULT_KEYBOARD_STATE } from "../types/state";

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Get keyboard state for a device.
 */
export function selectKeyboard(
    world: WorldState,
    deviceId?: string
): KeyboardState {
    const id = deviceId ?? Object.keys(world.devices)[0];
    return world.devices[id]?.keyboard ?? DEFAULT_KEYBOARD_STATE;
}

/**
 * Check if keyboard is visible.
 */
export function selectKeyboardVisible(
    world: WorldState,
    deviceId?: string
): boolean {
    return selectKeyboard(world, deviceId).visible;
}

/**
 * Get current keyboard layout.
 */
export function selectKeyboardLayout(
    world: WorldState,
    deviceId?: string
): string {
    return selectKeyboard(world, deviceId).layout;
}

/**
 * Get current input text.
 */
export function selectInputText(
    world: WorldState,
    deviceId?: string
): string {
    return selectKeyboard(world, deviceId).inputText;
}

/**
 * Get cursor position.
 */
export function selectCursorPosition(
    world: WorldState,
    deviceId?: string
): number {
    return selectKeyboard(world, deviceId).cursorPosition;
}

/**
 * Get current key being pressed.
 */
export function selectCurrentKey(
    world: WorldState,
    deviceId?: string
): string | null {
    return selectKeyboard(world, deviceId).currentKey;
}

/**
 * Get autocomplete suggestions.
 */
export function selectSuggestions(
    world: WorldState,
    deviceId?: string
): string[] {
    return selectKeyboard(world, deviceId).suggestions;
}

/**
 * Check if text is selected.
 */
export function selectHasSelection(
    world: WorldState,
    deviceId?: string
): boolean {
    const kb = selectKeyboard(world, deviceId);
    return kb.selectionStart !== null && kb.selectionEnd !== null;
}

/**
 * Get selected text range.
 */
export function selectSelection(
    world: WorldState,
    deviceId?: string
): { start: number; end: number } | null {
    const kb = selectKeyboard(world, deviceId);
    if (kb.selectionStart === null || kb.selectionEnd === null) {
        return null;
    }
    return { start: kb.selectionStart, end: kb.selectionEnd };
}
