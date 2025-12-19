/**
 * DirectorLite Strategy
 * 
 * Strategy pattern for swappable camera AI rules.
 * 
 * @module device-camera/director-lite
 */

import type { DirectorSignalType } from "./types";

// =============================================================================
// STRATEGY INTERFACE
// =============================================================================

export interface Rule {
    effect: string;
    targetType?: string;
    anchor?: string;
    preset?: string;
    scale?: number;
    intensity?: number;
    durationFrames: number;
    cooldownFrames: number;
    priority: number;
    category: "framing" | "shake";
}

export interface DirectorStrategy {
    name: string;
    getRules(signalType: DirectorSignalType): Rule[];
}

// =============================================================================
// VIRAL DRAMA V1 (DEFAULT)
// =============================================================================

export const ViralDramaV1: DirectorStrategy = {
    name: "ViralDrama v1",

    getRules(signalType: DirectorSignalType): Rule[] {
        switch (signalType) {
            case "NewMessage":
                return [{
                    effect: "FocusAnchor",
                    anchor: "lastMessage",
                    preset: "message",
                    scale: 1.08,
                    durationFrames: 45,
                    cooldownFrames: 30,
                    priority: 100,
                    category: "framing",
                }];

            case "TypingStarted":
                return [{
                    effect: "FocusAnchor",
                    anchor: "inputArea",
                    preset: "medium",
                    scale: 1.05,
                    durationFrames: 60,
                    cooldownFrames: 15,
                    priority: 80,
                    category: "framing",
                }];

            case "TypingStopped":
                return []; // No effect

            case "MessageRead":
                return [{
                    effect: "FocusAnchor",
                    anchor: "lastMessage",
                    preset: "medium",
                    scale: 1.04,
                    durationFrames: 30,
                    cooldownFrames: 60,
                    priority: 50,
                    category: "framing",
                }];

            case "CallIncoming":
                return [
                    {
                        effect: "FocusAnchor",
                        anchor: "callUI",
                        preset: "impact",
                        scale: 1.15,
                        durationFrames: 45,
                        cooldownFrames: 0,
                        priority: 200,
                        category: "framing",
                    },
                    {
                        effect: "Shake",
                        intensity: 3,
                        durationFrames: 20,
                        cooldownFrames: 0,
                        priority: 150,
                        category: "shake",
                    },
                ];

            case "CallConnected":
                return [{
                    effect: "FocusAnchor",
                    anchor: "callUI",
                    preset: "medium",
                    scale: 1.1,
                    durationFrames: 60,
                    cooldownFrames: 0,
                    priority: 180,
                    category: "framing",
                }];

            case "CallEnded":
                return [{
                    effect: "PullBack",
                    scale: 0.95,
                    durationFrames: 45,
                    cooldownFrames: 0,
                    priority: 160,
                    category: "framing",
                }];

            case "NotificationShown":
                return [{
                    effect: "FocusAnchor",
                    anchor: "notification",
                    preset: "close",
                    scale: 1.2,
                    durationFrames: 30,
                    cooldownFrames: 45,
                    priority: 120,
                    category: "framing",
                }];

            default:
                return [];
        }
    },
};
