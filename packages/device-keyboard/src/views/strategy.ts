/**
 * Keyboard UI Strategy Pattern
 * 
 * Allows platform-specific keyboard implementations.
 */

import React from "react";
import type { KeyboardState } from "../types/state";
import type { KeyboardTheme } from "../config/theme";

// =============================================================================
// STRATEGY INTERFACE
// =============================================================================

export interface KeyboardProps {
    keyboard: KeyboardState;
    variant: "light" | "dark";
    t: number;  // Current frame
}

export interface KeyProps {
    label: string;
    isPressed: boolean;
    width?: number;
    isSpecial?: boolean;
    variant: "light" | "dark";
}

export interface KeyPopupProps {
    label: string;
    variant: "light" | "dark";
    keyWidth: number;
}

export interface PredictionBarProps {
    suggestions: string[];
    variant: "light" | "dark";
    highlightedIndex?: number | null;
}

export interface KeyboardUIStrategy {
    /** Main keyboard component */
    Keyboard: React.ComponentType<KeyboardProps>;
    /** Individual key component */
    Key: React.ComponentType<KeyProps>;
    /** Key popup on press */
    KeyPopup: React.ComponentType<KeyPopupProps>;
    /** Prediction/suggestion bar */
    PredictionBar: React.ComponentType<PredictionBarProps>;
    /** Theme tokens */
    theme: KeyboardTheme;
    /** Get suggestions (deterministic) */
    getSuggestions: (text: string, seed: number) => string[];
}

// =============================================================================
// STRATEGY REGISTRY
// =============================================================================

class KeyboardStrategyRegistryClass {
    private strategies = new Map<string, KeyboardUIStrategy>();

    /**
     * Register a platform strategy.
     */
    register(platform: string, strategy: KeyboardUIStrategy): void {
        this.strategies.set(platform, strategy);
    }

    /**
     * Get strategy for platform.
     */
    get(platform: string): KeyboardUIStrategy | undefined {
        return this.strategies.get(platform);
    }

    /**
     * Get strategy with fallback to iOS.
     */
    getOrDefault(platform: string): KeyboardUIStrategy | undefined {
        return this.strategies.get(platform) ?? this.strategies.get("ios");
    }

    /**
     * List registered platforms.
     */
    list(): string[] {
        return Array.from(this.strategies.keys());
    }
}

export const KeyboardStrategyRegistry = new KeyboardStrategyRegistryClass();
