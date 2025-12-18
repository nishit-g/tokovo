/**
 * Device Keyboard Plugin - Enterprise Contract
 * 
 * Self-contained device plugin for virtual keyboard functionality.
 * 
 * @see docs/ARCHITECTURE.md
 */

import { ReducerRegistry, AutoSoundRegistry } from "@tokovo/core";

// Runtime Layer
import { keyboardReducer } from "./reducer";
import { createKeyboardInitialState } from "./runtime/initial-state";

// Views Layer
import { KeyboardSurface } from "./views/KeyboardSurface";

// Lowering Layer
import { keyboardV2Lowering } from "./lowering";

// Camera Layer
import { KeyboardBehavior } from "./camera/behaviors";
import { KeyboardAnchors } from "./runtime/adapters/anchors";

// Assets
import { keyboardAudioRules } from "./assets/audio-rules";

// DSL
import { KeyboardTrackBuilder } from "./dsl/track-builder";

// =============================================================================
// PLUGIN CONTRACT
// =============================================================================

export interface DeviceKeyboardPlugin {
    id: "keyboard";
    version: string;
    displayName: string;

    // Runtime
    reducer: typeof keyboardReducer;
    createInitialState: typeof createKeyboardInitialState;

    // Views
    Surface: typeof KeyboardSurface;

    // Lowering
    v2Lowering: typeof keyboardV2Lowering;

    // Camera
    behaviors: typeof KeyboardBehavior;
    anchors: typeof KeyboardAnchors;

    // DSL
    TrackBuilder: typeof KeyboardTrackBuilder;
}

export const KeyboardPlugin: DeviceKeyboardPlugin = {
    // Identity
    id: "keyboard",
    version: "2.0.0",
    displayName: "Virtual Keyboard",

    // Runtime
    reducer: keyboardReducer,
    createInitialState: createKeyboardInitialState,

    // Views
    Surface: KeyboardSurface,

    // Lowering
    v2Lowering: keyboardV2Lowering,

    // Camera
    behaviors: KeyboardBehavior,
    anchors: KeyboardAnchors,

    // DSL
    TrackBuilder: KeyboardTrackBuilder,
};

// =============================================================================
// AUTO-REGISTRATION
// =============================================================================

export function registerKeyboardPlugin(): void {
    ReducerRegistry.registerFeatureReducer("KEYBOARD", keyboardReducer);
    ReducerRegistry.registerAppReducer("keyboard", keyboardReducer);
    AutoSoundRegistry.register(keyboardAudioRules);
}

export default KeyboardPlugin;
