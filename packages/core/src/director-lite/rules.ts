/**
 * DirectorLite Rules
 *
 * ViralDramaV1 - The only style. Opinionated. Ships.
 * Pre-indexed by signal type for O(1) lookup.
 * 
 * UPDATE: Now uses semantic anchors (FocusAnchor) instead of pixel targets.
 */

import { SignalType, EffectCategory } from "./types";

export interface Rule {
    id: string;
    signal: SignalType;
    /** 
     * Effect type:
     * - FocusAnchor: NEW semantic anchor-based (PREFERRED)
     * - PushIn, ZoomToRect, PullBack: Legacy pixel-based (DEPRECATED)
     * - MicroShake: Camera shake effect
     */
    effect: "FocusAnchor" | "MicroShake" | "PushIn" | "ZoomToRect" | "PullBack";
    category: EffectCategory;
    priority: number;
    cooldownFrames: number;
    durationFrames: number;

    // === NEW: Anchor-based targeting (PREFERRED) ===
    /** Semantic anchor to focus on */
    anchor?: string;  // SemanticAnchorId
    /** Shot preset (matches SHOT_PRESETS in camera/presets.ts) */
    preset?: string;  // ShotPresetId

    // === Legacy ===
    targetType?: "message" | "inputArea" | "lastMessage";  // DEPRECATED
    scale?: number;
    intensity?: number;
}

/**
 * ViralDramaV1 - Baked rules for dramatic chat videos.
 * 
 * NOW USING SEMANTIC ANCHORS!
 */
export const RULES: Rule[] = [
    {
        id: "typing-push",
        signal: "TypingStarted",
        effect: "FocusAnchor",
        category: "framing",
        priority: 10,
        cooldownFrames: 90,
        durationFrames: 45,
        anchor: "inputArea",     // Stable anchor for typing
        preset: "subtle",        // Subtle zoom during anticipation
    },
    {
        id: "message-zoom",
        signal: "NewMessage",
        effect: "FocusAnchor",
        category: "framing",
        priority: 30,
        cooldownFrames: 20,
        durationFrames: 25,
        anchor: "lastMessage",   // Follow the new message
        preset: "message",       // Standard message follow preset
    },
    {
        id: "read-zoom",
        signal: "MessageRead",
        effect: "FocusAnchor",
        category: "framing",
        priority: 40,
        cooldownFrames: 45,
        durationFrames: 18,
        anchor: "lastMessage",   // Focus on read message
        preset: "subtle",        // Subtle acknowledgment
    },
    {
        id: "deleted-shake",
        signal: "MessageDeleted",
        effect: "MicroShake",
        category: "shake",
        priority: 25,
        cooldownFrames: 60,
        durationFrames: 12,
        anchor: "lastMessage",   // Shake near the deleted message
        intensity: 6,
    },
    {
        id: "call-pullback",
        signal: "CallIncoming",
        effect: "FocusAnchor",
        category: "framing",
        priority: 50,
        cooldownFrames: 0,
        durationFrames: 40,
        anchor: "callPoster",    // Focus on incoming call poster
        preset: "dramatic",      // Dramatic for incoming calls
    },
];

/**
 * Pre-indexed rules by signal type for O(1) lookup.
 * Built once at module load.
 */
export const RULES_BY_SIGNAL: Record<SignalType, Rule[]> = RULES.reduce(
    (acc, rule) => {
        if (!acc[rule.signal]) acc[rule.signal] = [];
        acc[rule.signal].push(rule);
        return acc;
    },
    {} as Record<SignalType, Rule[]>
);
