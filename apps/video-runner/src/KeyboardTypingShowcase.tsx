import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
    replay,
    WorldState,
    TimelineEvent,
    createEventIndex,
    DEFAULT_BUS_CONFIG,
} from "@tokovo/core";
import { buildWorld } from "./engine";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer
import "@tokovo/devices";

// Import DSL event factories
import { dsl, generateTyping } from "@tokovo/dsl";

/**
 * Keyboard Typing Showcase
 *
 * Demonstrates realistic typing simulation using centralized DSL events.
 */

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
                    { id: "msg_0", type: "text", from: "Sarah ✨", text: "Hey! Are you coming to the party tonight?", at: Date.now() - 60000 },
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
        audio: { activeSounds: {}, buses: DEFAULT_BUS_CONFIG },
    };

    // Using centralized DSL event factories
    const events: TimelineEvent[] = [
        // ACT 1: KEYBOARD APPEARS (1s)
        dsl.keyboard.show(30, "phone", "qwerty"),

        // ACT 2: TYPE RESPONSE with typos
        ...generateTyping(50, "phone", "Yeah definitely!", {
            speed: "casual",
            typoPositions: [5], // Typo on "d"
        }),

        // ACT 3: SEND MESSAGE (4.5s)
        dsl.messages.send(140, "dm_friend", "Yeah definitely!"),
        dsl.audio.play(140, "whatsapp_sent", 0.7),
        dsl.keyboard.clear(145, "phone"),

        // ACT 4: FRIEND TYPING (5-6s)
        dsl.messages.typingStart(170, "dm_friend", "Sarah ✨"),

        // ACT 5: FRIEND REPLIES (6s)
        dsl.messages.typingEnd(200, "dm_friend", "Sarah ✨"),
        dsl.messages.receive(200, "dm_friend", "Sarah ✨", "Awesome! See you at 8 😊"),
        dsl.audio.play(200, "whatsapp_received", 0.8),

        // ACT 6: TYPE SECOND REPLY
        ...generateTyping(230, "phone", "Can't wait! ", {
            speed: "casual",
            typoPositions: [3, 8],
        }),

        // ACT 7: SEND SECOND MESSAGE (9.5s)
        dsl.messages.send(320, "dm_friend", "Can't wait! 🎉"),
        dsl.audio.play(320, "whatsapp_sent", 0.7),
        dsl.keyboard.clear(325, "phone"),

        // ACT 8: HIDE KEYBOARD (10s)
        dsl.keyboard.hide(330, "phone"),

        // ACT 9: FRIEND REACTS (11s)
        dsl.messages.receive(370, "dm_friend", "Sarah ✨", "❤️"),
        dsl.audio.play(370, "whatsapp_received", 0.6),
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
    const world = buildWorld(episode.initialWorld, episode.events, t);

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
