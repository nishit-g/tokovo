/**
 * Auto-Sound Rules - Automatically derive sounds from app/device events
 * 
 * Converts semantic events (MESSAGE_RECEIVED, TYPING_START) into sound cues.
 * This is what makes the audio feel "automatic" and cinematic.
 */

import { TimelineEvent, SoundCue, AudioBus } from "../types";
import { createSoundCue, createUISoundCue } from "./mixer";

// =============================================================================
// TYPES
// =============================================================================

export interface AutoSoundRule {
    // Match conditions
    match: {
        kind: string;
        type?: string;
        appId?: string;
        from?: string | "*";  // "*" = any sender
    };

    // Sound output
    sound: string;
    bus: AudioBus;

    // Optional overrides
    volume?: number;
    loop?: boolean;
    duration?: number;
    duckMusic?: boolean;
    priority?: number;
}

// =============================================================================
// DEFAULT RULES
// =============================================================================

export const AUTO_SOUND_RULES: AutoSoundRule[] = [
    // WhatsApp message sounds
    {
        match: { kind: "APP", type: "MESSAGE_RECEIVED", from: "me" },
        sound: "whatsapp_sent",
        bus: "ui",
        duckMusic: true,
    },
    {
        match: { kind: "APP", type: "MESSAGE_RECEIVED", from: "*" },
        sound: "whatsapp_received",
        bus: "ui",
        duckMusic: true,
    },

    // Typing sounds
    {
        match: { kind: "APP", type: "TYPING_START" },
        sound: "whatsapp_typing",
        bus: "sfx",
        loop: true,
        duration: 90,  // 3 seconds max
        volume: 0.4,
    },

    // Device sounds
    {
        match: { kind: "DEVICE", type: "NOTIFICATION" },
        sound: "notification",
        bus: "ui",
        duckMusic: true,
    },
    {
        match: { kind: "DEVICE", type: "LOCK" },
        sound: "lock",
        bus: "sfx",
    },
    {
        match: { kind: "DEVICE", type: "UNLOCK" },
        sound: "unlock",
        bus: "sfx",
    },

    // Call sounds
    {
        match: { kind: "DEVICE", type: "CALL_INCOMING" },
        sound: "ringtone",
        bus: "ui",
        loop: true,
        priority: 90,
        duckMusic: true,
    },
    {
        match: { kind: "DEVICE", type: "CALL_END" },
        sound: "call_end",
        bus: "ui",
    },
];

// =============================================================================
// MATCHING LOGIC
// =============================================================================

/**
 * Check if a rule matches an event
 */
function matchesRule(event: TimelineEvent, rule: AutoSoundRule): boolean {
    // Check kind
    if (event.kind !== rule.match.kind) {
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
            if (eventFrom === "me") {
                return false;
            }
        } else if (eventFrom !== rule.match.from) {
            return false;
        }
    }

    return true;
}

// =============================================================================
// DERIVATION FUNCTIONS
// =============================================================================

/**
 * Derive audio cue from an event (if any rule matches)
 */
export function deriveAudioFromEvent(
    event: TimelineEvent,
    rules: AutoSoundRule[] = AUTO_SOUND_RULES
): SoundCue | null {
    // Find matching rule
    const rule = rules.find((r) => matchesRule(event, r));
    if (!rule) {
        return null;
    }

    // Create sound cue based on rule
    if (rule.duckMusic) {
        return createUISoundCue(rule.sound, event.at, {
            volume: rule.volume,
            loop: rule.loop,
            duration: rule.duration,
            priority: rule.priority,
            deviceId: (event as any).deviceId,
        });
    }

    return createSoundCue(rule.sound, event.at, {
        bus: rule.bus,
        volume: rule.volume,
        loop: rule.loop,
        duration: rule.duration,
        priority: rule.priority,
        deviceId: (event as any).deviceId,
    });
}

/**
 * Process all events and derive audio cues
 */
export function deriveAllAudio(
    events: TimelineEvent[],
    rules: AutoSoundRule[] = AUTO_SOUND_RULES
): SoundCue[] {
    const cues: SoundCue[] = [];

    for (const event of events) {
        const cue = deriveAudioFromEvent(event, rules);
        if (cue) {
            cues.push(cue);
        }
    }

    return cues;
}

/**
 * Create custom auto-sound rules for a specific app
 */
export function createAppRules(
    appId: string,
    rules: Partial<AutoSoundRule>[]
): AutoSoundRule[] {
    return rules.map((rule) => ({
        match: {
            kind: "APP",
            appId,
            ...rule.match,
        },
        sound: rule.sound || "notification",
        bus: rule.bus || "ui",
        volume: rule.volume,
        loop: rule.loop,
        duration: rule.duration,
        duckMusic: rule.duckMusic,
        priority: rule.priority,
    }));
}
