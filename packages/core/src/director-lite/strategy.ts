/**
 * Director Strategy Pattern
 * 
 * Allows swapping the "AI Director" logic.
 * Default implementation: ViralDramaV1
 */

import { SignalType, EffectCategory } from "./types";

export interface Rule {
    id: string;
    signal: SignalType;
    effect: "FocusAnchor" | "MicroShake" | "PushIn" | "ZoomToRect" | "PullBack";
    category: EffectCategory;
    priority: number;
    cooldownFrames: number;
    durationFrames: number;

    // Anchor-based targeting
    anchor?: string;  // SemanticAnchorId
    preset?: string;  // ShotPresetId

    // Legacy
    targetType?: "message" | "inputArea" | "lastMessage";
    scale?: number;
    intensity?: number;
}

/**
 * Strategy interface for the Director
 */
export interface DirectorStrategy {
    /**
     * Get rules triggered by a specific signal type.
     * Should be O(1) or very fast.
     */
    getRules(signal: SignalType): Rule[];
}
