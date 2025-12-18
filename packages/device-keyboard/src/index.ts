/**
 * @tokovo/device-keyboard
 * 
 * Enterprise virtual keyboard plugin for Tokovo.
 * 
 * @example
 * ```typescript
 * import { KeyboardTrackBuilder } from "@tokovo/device-keyboard";
 * 
 * episode("demo", { fps: 30, duration: "30s" })
 *     .track("keyboard",
 *         () => new KeyboardTrackBuilder(30, "phone", getOrder),
 *         kb => {
 *             kb.at("4s").show();
 *             kb.span("5s", "10s").type("Hello!", { speed: "normal" });
 *             kb.at("12s").hide();
 *         }
 *     )
 * ```
 */

// =============================================================================
// PLUGIN
// =============================================================================

export { KeyboardPlugin, registerKeyboardPlugin, type DeviceKeyboardPlugin } from "./plugin";

// =============================================================================
// TYPES
// =============================================================================

export * from "./types";

// =============================================================================
// CONFIG
// =============================================================================

export * from "./config";

// =============================================================================
// IR
// =============================================================================

export * from "./ir";

// =============================================================================
// DSL
// =============================================================================

export { KeyboardTrackBuilder } from "./dsl/track-builder";
export * from "./dsl/helpers";

// =============================================================================
// RUNTIME
// =============================================================================

export { keyboardReducer } from "./reducer";
export * from "./runtime/selectors";
export { createKeyboardInitialState } from "./runtime/initial-state";

// =============================================================================
// VIEWS
// =============================================================================

export { KeyboardSurface } from "./views/KeyboardSurface";
export { KeyboardStrategyRegistry, type KeyboardUIStrategy } from "./views/strategy";
export * from "./views/ios";

// =============================================================================
// CAMERA
// =============================================================================

export { KeyboardBehavior, getKeyboardIntent } from "./camera/behaviors";
export { KeyboardAnchors, getKeyRect } from "./runtime/adapters/anchors";

// =============================================================================
// LOWERING
// =============================================================================

export { keyboardV2Lowering, lowerKeyboardEvent } from "./lowering";

// =============================================================================
// ASSETS
// =============================================================================

export { keyboardAudioRules } from "./assets/audio-rules";

// =============================================================================
// AUTO-REGISTRATION
// =============================================================================

import { ReducerRegistry, AutoSoundRegistry } from "@tokovo/core";
import { keyboardReducer } from "./reducer";
import { keyboardAudioRules } from "./assets/audio-rules";

// Register on import
ReducerRegistry.registerFeatureReducer("KEYBOARD", keyboardReducer);
AutoSoundRegistry.register(keyboardAudioRules);

// Import components to register strategies
import "./views/ios/IOSKeyboard";
