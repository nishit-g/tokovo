/**
 * Auto-Sound Rules - Automatically derive sounds from app/device events
 * 
 * Converts semantic events (MESSAGE_RECEIVED, TYPING_START) into sound cues or actions.
 * This is what makes the audio feel "automatic" and cinematic.
 */

import { TimelineEvent, SoundCue, AudioBus } from "../types";
import { createSoundCue, createUISoundCue } from "./mixer";

// =============================================================================
// TYPES
// =============================================================================

export type AutoSoundAction = "PLAY_ONE_SHOT" | "START_LOOP" | "STOP_SOUND";

export interface AutoSoundRule {
    // Match conditions
    match: {
        kind: string;
        type?: string;
        appId?: string;
        from?: string | "*";  // "*" = any sender
    };

    // Action config
    action: AutoSoundAction;

    // For PLAY/START action
    sound?: string;
    bus?: AudioBus;

    // For STOP action (references the ID created by START_LOOP)
    stopId?: string;

    // Dynamic ID Template (e.g., "typing_{conversationId}_{from}")
    // Useful for linking START and STOP actions
    idTemplate?: string;

    // Optional overrides
    volume?: number;
    loop?: boolean;
    // Dynamic Duration (e.g. for typing loops based on text length)
    durationFrom?: {
        key: string;       // Event property to read (e.g. "text.length")
        factor?: number;   // Multiplier (default 1)
        min?: number;      // Minimum duration
    };
    duration?: number;
    duckMusic?: boolean;
    priority?: number;
}

// =============================================================================
// REGISTRY
// =============================================================================

class AutoSoundRegistryClass {
    // Index by kind for O(1) matching
    private rulesByKind = new Map<string, AutoSoundRule[]>();
    // Keep flat list for legacy `getAll` (though we should deprecate usage)
    private allRules: AutoSoundRule[] = [];

    /**
     * Register new auto-sound rules (used by plugins)
     */
    register(newRules: AutoSoundRule[]) {
        for (const rule of newRules) {
            const kind = rule.match.kind;
            if (!this.rulesByKind.has(kind)) {
                this.rulesByKind.set(kind, []);
            }
            this.rulesByKind.get(kind)!.push(rule);
        }
        this.allRules.push(...newRules);
    }

    /**
     * Get rules for a specific event kind (Optimization)
     */
    getRulesForKind(kind: string): AutoSoundRule[] {
        return this.rulesByKind.get(kind) || [];
    }

    /**
     * Get all registered rules
     */
    getAll(): AutoSoundRule[] {
        return this.allRules;
    }

    /**
     * Clear registry (useful for hot reload/testing)
     */
    clear() {
        this.rulesByKind.clear();
        this.allRules = [];
    }
}

export const AutoSoundRegistry = new AutoSoundRegistryClass();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a rule matches an event
 */
function matchesRule(event: TimelineEvent, rule: AutoSoundRule): boolean {
    // Check kind
    if (event.kind !== rule.match.kind) {
        // console.log("Mismatch kind", event.kind, rule.match.kind);
        return false;
    }

    // Check type
    if (rule.match.type && (event as any).type !== rule.match.type) {
        return false;
    }

    // Check appId
    if (rule.match.appId && (event as any).appId !== rule.match.appId) {
        return false;
    }

    // Check from
    if (rule.match.from) {
        const eventFrom = (event as any).from;
        if (rule.match.from === "*") {
            // Match any sender EXCEPT "me"
            if (eventFrom === "me") return false;
        } else if (eventFrom !== rule.match.from) {
            return false;
        }
    }

    return true;
}

/**
 * Resolve dynamic ID template
 */
function resolveIdTemplate(template: string, event: any): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        return event[key] || "unknown";
    });
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o && typeof o[key] !== 'undefined') ? o[key] : undefined, obj);
}


// =============================================================================
// DERIVATION FUNCTIONS
// =============================================================================

export interface AudioInstruction {
    action: AutoSoundAction;
    soundId?: string;     // The asset ID
    instanceId?: string;  // The runtime ID (for stopping)
    cue?: SoundCue;       // The full cue object (for playing)
}

/**
 * Derive audio instructions from an event
 */
export function deriveAudioInstructions(
    event: TimelineEvent,
    rules: AutoSoundRule[] = AutoSoundRegistry.getAll()
): AudioInstruction[] {
    const instructions: AudioInstruction[] = [];

    // Check SILENT override from DSL
    if ((event as any).silent) {
        return [];
    }



    for (const rule of rules) {
        if (matchesRule(event, rule)) {
            console.log("[AutoSound] Match!", { kind: event.kind, rule });
            // dynamic ID resolution
            const instanceId = rule.idTemplate
                ? resolveIdTemplate(rule.idTemplate, event)
                : rule.stopId // For STOP actions, use the target ID
                    ? resolveIdTemplate(rule.stopId, event)
                    : `auto_${event.at}_${rule.sound}`;

            if (rule.action === "STOP_SOUND") {
                instructions.push({
                    action: "STOP_SOUND",
                    instanceId: instanceId
                });
                continue;
            }

            // For PLAY or START_LOOP
            if (!rule.sound) continue;

            // Calculate Duration
            let duration = rule.duration;
            if (rule.durationFrom) {
                const val = getNestedValue(event, rule.durationFrom.key);
                if (typeof val === "number") {
                    duration = Math.max(
                        rule.durationFrom.min || 0,
                        val * (rule.durationFrom.factor || 1)
                    );
                } else if (typeof val === "string") {
                    duration = Math.max(
                        rule.durationFrom.min || 0,
                        val.length * (rule.durationFrom.factor || 1)
                    );
                }
            }

            const baseCue = rule.duckMusic
                ? createUISoundCue(rule.sound, event.at, {
                    volume: rule.volume,
                    loop: rule.action === "START_LOOP" || rule.loop,
                    duration: duration,
                    priority: rule.priority,
                    deviceId: (event as any).deviceId
                })
                : createSoundCue(rule.sound, event.at, {
                    bus: rule.bus || "sfx",
                    volume: rule.volume,
                    loop: rule.action === "START_LOOP" || rule.loop,
                    duration: duration,
                    priority: rule.priority,
                    deviceId: (event as any).deviceId
                });

            instructions.push({
                action: rule.action,
                soundId: rule.sound,
                instanceId: instanceId,
                cue: baseCue
            });
        }
    }


    return instructions;
}
