/**
 * DirectorLite Rules
 *
 * ViralDramaV1 - The only style. Opinionated. Ships.
 * Pre-indexed by signal type for O(1) lookup.
 * 
 * NOW IMPLEMENTS: DirectorStrategy
 */

import { SignalType } from "./types";
import { DirectorStrategy, Rule } from "./strategy";

// Re-export Rule for backward compatibility if needed, but prefer strategy.ts
export type { Rule } from "./strategy";

/**
 * ViralDramaV1 - Baked rules for dramatic chat videos.
 */
const RULES: Rule[] = [
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
 */
const RULES_BY_SIGNAL: Record<SignalType, Rule[]> = RULES.reduce(
    (acc, rule) => {
        if (!acc[rule.signal]) acc[rule.signal] = [];
        acc[rule.signal].push(rule);
        return acc;
    },
    {} as Record<SignalType, Rule[]>
);

/**
 * The Default Strategy
 */
export const ViralDramaV1: DirectorStrategy = {
    getRules: (signal: SignalType) => RULES_BY_SIGNAL[signal] || []
};

// Legacy Export (Deprecated)
export { RULES, RULES_BY_SIGNAL };
