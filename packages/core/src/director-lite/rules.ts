/**
 * DirectorLite Rules
 *
 * ViralDramaV1 - The only style. Opinionated. Ships.
 * Pre-indexed by signal type for O(1) lookup.
 */

import { SignalType, EffectCategory } from "./types";

export interface Rule {
    id: string;
    signal: SignalType;
    effect: "PushIn" | "ZoomToRect" | "PullBack" | "MicroShake";
    category: EffectCategory;
    priority: number;
    cooldownFrames: number;
    durationFrames: number;
    targetType: "message" | "inputArea" | "lastMessage";
    scale?: number;
    intensity?: number;
}

/**
 * ViralDramaV1 - Baked rules for dramatic chat videos.
 */
export const RULES: Rule[] = [
    {
        id: "typing-push",
        signal: "TypingStarted",
        effect: "PushIn",
        category: "framing",
        priority: 10,
        cooldownFrames: 90,
        durationFrames: 45,
        targetType: "inputArea", // Always exists (not typing rect!)
        scale: 1.12,
    },
    {
        id: "message-zoom",
        signal: "NewMessage",
        effect: "ZoomToRect",
        category: "framing",
        priority: 30,
        cooldownFrames: 20,
        durationFrames: 25,
        targetType: "message",
        scale: 1.2,
    },
    {
        id: "read-zoom",
        signal: "MessageRead",
        effect: "ZoomToRect",
        category: "framing",
        priority: 40,
        cooldownFrames: 45,
        durationFrames: 18,
        targetType: "message",
        scale: 1.08,
    },
    {
        id: "deleted-shake",
        signal: "MessageDeleted",
        effect: "MicroShake",
        category: "shake",
        priority: 25,
        cooldownFrames: 60,
        durationFrames: 12,
        targetType: "message",
        intensity: 6,
    },
    {
        id: "call-pullback",
        signal: "CallIncoming",
        effect: "PullBack",
        category: "framing",
        priority: 50,
        cooldownFrames: 0,
        durationFrames: 40,
        targetType: "inputArea",
        scale: 0.88,
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
