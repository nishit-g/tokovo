import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
    replay,
    WorldState,
    TimelineEvent,
    createEventIndex,
} from "@tokovo/core";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer
import "@tokovo/devices";

/**
 * Keyboard Typing Showcase
 *
 * Demonstrates realistic typing simulation:
 * - Virtual keyboard with key pop-ups
 * - Character-by-character typing
 * - Typo simulation with backspace correction
 * - Keyboard show/hide animations
 * - Auto-scroll of chat when keyboard appears
 */

// =============================================================================
// DSL HELPERS
// =============================================================================

const dsl = {
    // Keyboard events
    showKeyboard: (at: number, deviceId: string, layout: "qwerty" | "numbers" = "qwerty"): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "SHOW",
        deviceId,
        layout,
    } as any),

    hideKeyboard: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "HIDE",
        deviceId,
    } as any),

    typeChar: (at: number, deviceId: string, char: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "TYPE_CHAR",
        deviceId,
        char,
    } as any),

    backspace: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "BACKSPACE",
        deviceId,
    } as any),

    clearKeyboard: (at: number, deviceId: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "CLEAR",
        deviceId,
    } as any),

    // Messages
    receiveMessage: (at: number, convoId: string, from: string, text: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        conversationId: convoId,
        from,
        text,
    } as any),

    sendMessage: (at: number, convoId: string, text: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        conversationId: convoId,
        from: "me",
        text,
    } as any),

    typingStart: (at: number, convoId: string, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_START",
        conversationId: convoId,
        from,
    } as any),

    typingEnd: (at: number, convoId: string, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_END",
        conversationId: convoId,
        from,
    } as any),

    // Audio
    playSound: (at: number, soundId: string, volume = 1.0): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "PLAY_SOUND",
        soundId,
        volume,
    } as any),
};

// =============================================================================
// TYPING HELPERS (Humanizer)
// =============================================================================

const adjacentKeys: Record<string, string[]> = {
    a: ["q", "w", "s", "z"], b: ["v", "g", "h", "n"], c: ["x", "d", "f", "v"],
    d: ["s", "e", "r", "f", "c", "x"], e: ["w", "r", "d", "s"], f: ["d", "r", "t", "g", "v", "c"],
    g: ["f", "t", "y", "h", "b", "v"], h: ["g", "y", "u", "j", "n", "b"], i: ["u", "o", "k", "j"],
    j: ["h", "u", "i", "k", "m", "n"], k: ["j", "i", "o", "l", "m"], l: ["k", "o", "p"],
    m: ["n", "j", "k"], n: ["b", "h", "j", "m"], o: ["i", "p", "l", "k"],
    p: ["o", "l"], q: ["w", "a"], r: ["e", "t", "f", "d"],
    s: ["a", "w", "e", "d", "x", "z"], t: ["r", "y", "g", "f"], u: ["y", "i", "j", "h"],
    v: ["c", "f", "g", "b"], w: ["q", "e", "s", "a"], x: ["z", "s", "d", "c"],
    y: ["t", "u", "h", "g"], z: ["a", "s", "x"],
};

/**
 * Generate typing events with optional typos
 */
function generateTyping(
    startFrame: number,
    deviceId: string,
    text: string,
    options: { framesPerChar?: number; typoPositions?: number[] } = {}
): TimelineEvent[] {
    const { framesPerChar = 6, typoPositions = [] } = options;
    const events: TimelineEvent[] = [];
    let frame = startFrame;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const lowerChar = char.toLowerCase();

        // Check if this position should have a typo
        if (typoPositions.includes(i) && adjacentKeys[lowerChar]) {
            const wrongKey = adjacentKeys[lowerChar][0]; // Deterministic for consistency

            // Type wrong key
            events.push(dsl.typeChar(frame, deviceId, wrongKey));
            frame += framesPerChar;

            // Backspace
            events.push(dsl.backspace(frame, deviceId));
            frame += 3; // Quick backspace
        }

        // Type correct character
        events.push(dsl.typeChar(frame, deviceId, char));
        frame += framesPerChar;
    }

    return events;
}

// =============================================================================
// EPISODE DEFINITION
// =============================================================================

function createKeyboardShowcaseEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const initialWorld: WorldState = {
        devices: {
            phone: {
                id: "phone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
            },
        },
        conversations: {
            dm_friend: {
                id: "dm_friend",
                type: "dm",
                name: "Sarah ✨",
                messages: [
                    // Pre-existing messages for context
                    { id: "msg_0", type: "text", from: "Sarah ✨", text: "Hey! Are you coming to the party tonight?", timestamp: Date.now() - 60000 },
                ],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_friend",
            },
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: "phone",
            layout: { mode: "SINGLE" as const, primaryDeviceId: "phone" },
            activeEffects: [],
            transform: {
                translateX: 0, translateY: 0, scale: 1, rotation: 0,
                originX: 0.5, originY: 0.5, shakeX: 0, shakeY: 0,
            },
            deviceTransforms: {},
        },
        audio: { activeSounds: {} },
    };

    const events: TimelineEvent[] = [
        // =====================================================================
        // ACT 1: INITIAL PAUSE (0-1s)
        // =====================================================================
        // Let user see the existing message

        // =====================================================================
        // ACT 2: KEYBOARD APPEARS (1s)
        // =====================================================================
        dsl.showKeyboard(30, "phone", "qwerty"),

        // =====================================================================
        // ACT 3: TYPE RESPONSE (1-4s)
        // =====================================================================
        // Type "Yeah definitely!" with a typo on "d"
        ...generateTyping(50, "phone", "Yeah definitely!", {
            framesPerChar: 5,
            typoPositions: [5], // Typo on "d" in "definitely"
        }),

        // =====================================================================
        // ACT 4: SEND MESSAGE (4.5s)
        // =====================================================================
        dsl.sendMessage(140, "dm_friend", "Yeah definitely!"),
        dsl.playSound(140, "whatsapp_sent", 0.7),
        dsl.clearKeyboard(145, "phone"),

        // =====================================================================
        // ACT 5: FRIEND TYPING (5-6s)
        // =====================================================================
        dsl.typingStart(170, "dm_friend", "Sarah ✨"),

        // =====================================================================
        // ACT 6: FRIEND REPLIES (6s)
        // =====================================================================
        dsl.typingEnd(200, "dm_friend", "Sarah ✨"),
        dsl.receiveMessage(200, "dm_friend", "Sarah ✨", "Awesome! See you at 8 😊"),
        dsl.playSound(200, "whatsapp_received", 0.8),

        // =====================================================================
        // ACT 7: TYPE SECOND REPLY (6.5-9s)
        // =====================================================================
        // Type "Can't wait! 🎉" with typos
        ...generateTyping(230, "phone", "Can't wait! ", {
            framesPerChar: 5,
            typoPositions: [3, 8], // Typos on "'" and "a"
        }),

        // =====================================================================
        // ACT 8: SEND SECOND MESSAGE (9.5s)
        // =====================================================================
        dsl.sendMessage(320, "dm_friend", "Can't wait! 🎉"),
        dsl.playSound(320, "whatsapp_sent", 0.7),
        dsl.clearKeyboard(325, "phone"),

        // =====================================================================
        // ACT 9: HIDE KEYBOARD (10s)
        // =====================================================================
        dsl.hideKeyboard(330, "phone"),

        // =====================================================================
        // ACT 10: FRIEND REACTS (11s)
        // =====================================================================
        dsl.receiveMessage(370, "dm_friend", "Sarah ✨", "❤️"),
        dsl.playSound(370, "whatsapp_received", 0.6),
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const KeyboardTypingShowcase: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    const episode = useMemo(() => createKeyboardShowcaseEpisode(), []);
    const eventIndex = useMemo(() => createEventIndex(episode.events), [episode.events]);
    const world = replay(episode.initialWorld, episode.events, t);

    const scale = Math.min(1080 / iPhone16Profile.dimensions.width, 1920 / iPhone16Profile.dimensions.height);

    return (
        <AbsoluteFill style={{ backgroundColor: "#0a0a1a", justifyContent: "center", alignItems: "center" }}>
            <AudioLayer world={world} t={t} />
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={false}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={false}
                />
            </div>
        </AbsoluteFill>
    );
};

export default KeyboardTypingShowcase;
