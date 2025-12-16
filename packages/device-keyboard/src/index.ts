export * from "./KeyboardSurface";
export * from "./core/registry";
import "./assets/sounds"; // Register sounds checked
export * from "./components/IOSKeyboard";
export * from "./reducer";

import { ReducerRegistry } from "@tokovo/core";
import { keyboardReducer } from "./reducer";

import { keyboardAudioRules } from "./assets/audio-rules";
import { AutoSoundRegistry } from "@tokovo/core";

// Register the keyboard reducer automatically when this package is imported
ReducerRegistry.registerFeatureReducer("KEYBOARD", keyboardReducer);

// Register audio rules
AutoSoundRegistry.register(keyboardAudioRules);
