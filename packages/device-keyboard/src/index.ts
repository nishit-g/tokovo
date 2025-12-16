export * from "./KeyboardSurface";
export * from "./core/registry";
export * from "./components/IOSKeyboard";
export * from "./reducer";

import { ReducerRegistry } from "@tokovo/core";
import { keyboardReducer } from "./reducer";

// Register the keyboard reducer automatically when this package is imported
ReducerRegistry.registerFeatureReducer("KEYBOARD", keyboardReducer);
// Export for direct access if needed, but Surface is preferred
