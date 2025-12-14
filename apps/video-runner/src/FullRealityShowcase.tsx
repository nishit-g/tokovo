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
 * Full Reality Showcase
 *
 * Demonstrates ALL the "Reality Simulation" features:
 * - Device OS layer (clock, battery, network updates)
 * - Message lifecycle
 * - Typing with typos and corrections
 * - Camera movements
 *
 * This is indistinguishable from a real screen recording.
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const DEVICE_ID = "phone";
const CONVO_ID = "dm_alex";
const FRIEND_NAME = "Alex 💎";

// Starting time: 2:45 PM
const START_TIME = new Date();
START_TIME.setHours(14, 45, 0, 0);

// =============================================================================
// EPISODE DEFINITION
// =============================================================================

function createFullRealityEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const initialWorld: WorldState = {
        devices: {
            [DEVICE_ID]: {
                id: DEVICE_ID,
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
                // Device OS state - StatusBar now reads from here!
                os: {
                    clock: START_TIME.getTime(),
                    battery: 87,
                    charging: false,
                    network: "wifi" as const,
                    wifiStrength: 3,
                    cellStrength: 4,
                    dnd: false,
                    lowPowerMode: false,
                    airplaneMode: false,
                },
            },
        },
        conversations: {
            [CONVO_ID]: {
                id: CONVO_ID,
                type: "dm",
                name: FRIEND_NAME,
                messages: [
                    {
                        id: "msg_history_1",
                        type: "text",
                        from: FRIEND_NAME,
                        text: "hey you free tonight?",
                        status: "read",
                    },
                    {
                        id: "msg_history_2",
                        type: "text",
                        from: "me",
                        text: "yeah what's up?",
                        status: "read",
                    },
                ],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: CONVO_ID,
            },
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: DEVICE_ID,
            layout: { mode: "SINGLE" as const, primaryDeviceId: DEVICE_ID },
            activeEffects: [],
            transform: {
                translateX: 0, translateY: 0, scale: 1, rotation: 0,
                originX: 0.5, originY: 0.5, shakeX: 0, shakeY: 0,
            },
            deviceTransforms: {},
        },
        audio: { activeSounds: {}, buses: DEFAULT_BUS_CONFIG },
    };

    const events: TimelineEvent[] = [
        // === SCENE 1: Friend is typing (0-2s) ===
        dsl.messages.typingStart(0, CONVO_ID, FRIEND_NAME),

        // Time advances naturally (1 second = 30 frames)
        dsl.os.setTime(30, START_TIME.getTime() + 1000, DEVICE_ID),

        // Friend sends message
        dsl.messages.typingEnd(60, CONVO_ID, FRIEND_NAME),
        dsl.messages.receive(60, CONVO_ID, FRIEND_NAME, "thinking we could grab dinner? 🍕"),
        dsl.audio.play(60, "whatsapp_received", 0.8),

        // === SCENE 2: User types response (3-6s) ===
        dsl.keyboard.show(90, DEVICE_ID, "qwerty"),

        // Type with realistic typos
        ...generateTyping(110, DEVICE_ID, "sure! where were you thinkng?", {
            speed: "casual",
            typoPositions: [22], // Typo on "thinking" -> "thinkng"
        }),

        // Time advances
        dsl.os.setTime(150, START_TIME.getTime() + 5000, DEVICE_ID),

        // User pauses, notices typo, backspaces
        dsl.keyboard.backspace(220, DEVICE_ID),
        dsl.keyboard.backspace(223, DEVICE_ID),
        dsl.keyboard.backspace(226, DEVICE_ID),
        dsl.keyboard.backspace(229, DEVICE_ID),
        dsl.keyboard.backspace(232, DEVICE_ID),
        dsl.keyboard.backspace(235, DEVICE_ID),
        dsl.keyboard.backspace(238, DEVICE_ID),

        // Retype correctly
        ...generateTyping(245, DEVICE_ID, "thinking?", { speed: "fast" }),

        // === SCENE 3: Send message (8s) ===
        dsl.messages.send(285, CONVO_ID, "sure! where were you thinking?"),
        dsl.audio.play(285, "whatsapp_sent", 0.7),
        dsl.keyboard.clear(290, DEVICE_ID),

        // Time advances
        dsl.os.setTime(300, START_TIME.getTime() + 10000, DEVICE_ID),

        // Battery drains slightly during usage
        dsl.os.setBattery(320, 86, false, DEVICE_ID),

        // === SCENE 4: Friend types and responds (10-16s) ===
        dsl.messages.typingStart(400, CONVO_ID, FRIEND_NAME),

        // Time advances
        dsl.os.setTime(420, START_TIME.getTime() + 14000, DEVICE_ID),

        // Friend sends response
        dsl.messages.typingEnd(480, CONVO_ID, FRIEND_NAME),
        dsl.messages.receive(480, CONVO_ID, FRIEND_NAME, "that new italian place downtown? mario's i think"),
        dsl.audio.play(480, "whatsapp_received", 0.8),

        // Camera focuses on message
        dsl.camera.zoom(490, 1.15, 20, { originY: 0.7 }),

        // === SCENE 5: User reacts excitedly (17-22s) ===
        ...generateTyping(540, DEVICE_ID, "omg yes!!! ive been wanting to try that", {
            speed: "fast",
            typoPositions: [],
        }),

        // Time advances
        dsl.os.setTime(600, START_TIME.getTime() + 20000, DEVICE_ID),

        dsl.messages.send(655, CONVO_ID, "omg yes!!! ive been wanting to try that"),
        dsl.audio.play(655, "whatsapp_sent", 0.7),
        dsl.keyboard.clear(660, DEVICE_ID),

        // Battery drain
        dsl.os.setBattery(680, 85, false, DEVICE_ID),

        // === SCENE 6: Final exchange (23-28s) ===
        dsl.messages.typingStart(750, CONVO_ID, FRIEND_NAME),

        // Camera resets
        dsl.camera.reset(760, 25),

        // Time advances
        dsl.os.setTime(800, START_TIME.getTime() + 27000, DEVICE_ID),

        dsl.messages.typingEnd(810, CONVO_ID, FRIEND_NAME),
        dsl.messages.receive(810, CONVO_ID, FRIEND_NAME, "perfect! 7pm? 🎉"),
        dsl.audio.play(810, "whatsapp_received", 0.8),

        // Type quick confirmation
        ...generateTyping(840, DEVICE_ID, "see you there! ", { speed: "fast" }),

        dsl.messages.send(905, CONVO_ID, "see you there! 🙌"),
        dsl.audio.play(905, "whatsapp_sent", 0.7),
        dsl.keyboard.clear(910, DEVICE_ID),
        dsl.keyboard.hide(915, DEVICE_ID),

        // Time advances to end
        dsl.os.setTime(950, START_TIME.getTime() + 33000, DEVICE_ID),

        // Friend sends reaction
        dsl.messages.receive(1020, CONVO_ID, FRIEND_NAME, "❤️"),
        dsl.audio.play(1020, "whatsapp_received", 0.6),

        // Small camera shake on reaction
        dsl.camera.shake(1025, 3, 15, { frequency: 20, decay: 0.8 }),

        // Final battery/time
        dsl.os.setBattery(1050, 12, false, DEVICE_ID),
        dsl.os.setTime(1060, START_TIME.getTime() + 38000, DEVICE_ID),
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const FullRealityShowcase: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    const episode = useMemo(() => createFullRealityEpisode(), []);
    const eventIndex = useMemo(() => createEventIndex(episode.events), [episode.events]);
    const world = buildWorld(episode.initialWorld, episode.events, t);

    const scale = Math.min(1080 / iPhone16Profile.dimensions.width, 1920 / iPhone16Profile.dimensions.height);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#0a0a1a",
            justifyContent: "center",
            alignItems: "center",
        }}>
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

export default FullRealityShowcase;
