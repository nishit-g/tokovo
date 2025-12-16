import React from "react";
import { KeyboardProps } from "./registry";

/**
 * Keyboard Provider Interface
 * 
 * Defines the contract for a Keyboard Plugin.
 * A Provider supplies:
 * 1. Visual Component
 * 2. Logical Behavior (Prediction)
 */
export interface KeyboardProvider {
    /** Unique ID (e.g., "ios", "android") */
    id: string;

    /** The React Component to render */
    Component: React.ComponentType<KeyboardProps>;

    /**
     * Pure function to determine suggestions based on input.
     * MUST be deterministic for replayability.
     */
    getSuggestions: (text: string, seed: number) => string[];
}
