import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
    replay,
    WorldState,
    TimelineEvent,
    createEventIndex,
} from "@tokovo/core";
import { TokovoRenderer, AudioLayer, TouchOverlay } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer
import "@tokovo/devices";

// Import DSL event factories
import { dsl, generateTyping } from "@tokovo/dsl";

/**
 * Full Reality Showcase
 *
 * Demonstrates ALL the new "Reality Simulation" features:
 * - Device OS layer (clock, battery, network, DND)
 * - Touch gestures (tap circles)
 * - Message lifecycle (tick progression)
 * - Typing with typos
 * - Camera movements
 *
 * This is indistinguishable from a real screen recording.
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const FPS = 30;
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
                // Device OS state
                os: {
                    clock: START_TIME.getTime(),
                    battery: 73,
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
        audio: { activeSounds: {} },
        touches: [],
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

        // User taps notification area (touch feedback)
        dsl.touch.tap(75, 540, 400),

        // === SCENE 2: User types response (2.5-5s) ===
        // Slight pause (reading), then show keyboard
        dsl.keyboard.show(90, DEVICE_ID, "qwerty"),
        dsl.touch.tap(95, 540, 1600), // Tap input field

        // Type with realistic typos
        ...generateTyping(110, DEVICE_ID, "sure! where were you thinkng?", {
            speed: "casual",
            typoPositions: [22], // Typo on "thinking" -> "thinkng"
        }),

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

        // === SCENE 3: Send message (6s) ===
        dsl.touch.tap(280, 1000, 1650), // Tap send button
        dsl.messages.send(285, CONVO_ID, "sure! where were you thinking?"),
        dsl.audio.play(285, "whatsapp_sent", 0.7),
        dsl.keyboard.clear(290, DEVICE_ID),

        // Message lifecycle: sending -> sent -> delivered
        dsl.messages.markSent(295, CONVO_ID, "msg_sent_1"),
        dsl.messages.markDelivered(330, CONVO_ID, "msg_sent_1"), // 1 second later

        // === SCENE 4: Friend reads and types (7-9s) ===
        dsl.messages.markRead(360, CONVO_ID, "msg_sent_1"), // Blue ticks!

        // Battery drains slightly
        dsl.os.setBattery(390, 72, false, DEVICE_ID),

        // Friend typing response
        dsl.messages.typingStart(400, CONVO_ID, FRIEND_NAME),

        // Time advances
        dsl.os.setTime(420, START_TIME.getTime() + 14000, DEVICE_ID),

        // Friend sends response
        dsl.messages.typingEnd(480, CONVO_ID, FRIEND_NAME),
        dsl.messages.receive(480, CONVO_ID, FRIEND_NAME, "that new italian place downtown? mario's i think"),
        dsl.audio.play(480, "whatsapp_received", 0.8),

        // Camera focuses on message
        dsl.camera.zoom(490, 1.15, 20, { originY: 0.7 }),

        // === SCENE 5: User reacts excitedly (10-12s) ===
        dsl.touch.tap(520, 540, 1100), // Tap message

        // Type enthusiastic response
        ...generateTyping(540, DEVICE_ID, "omg yes!!! ive been wanting to try that", {
            speed: "fast",
            typoPositions: [],
        }),

        dsl.touch.tap(650, 1000, 1650), // Send
        dsl.messages.send(655, CONVO_ID, "omg yes!!! ive been wanting to try that"),
        dsl.audio.play(655, "whatsapp_sent", 0.7),
        dsl.keyboard.clear(660, DEVICE_ID),

        // Message status progression
        dsl.messages.markSent(665, CONVO_ID, "msg_sent_2"),
        dsl.messages.markDelivered(700, CONVO_ID, "msg_sent_2"),
        dsl.messages.markRead(730, CONVO_ID, "msg_sent_2"),

        // === SCENE 6: Final exchange (12-14s) ===
        dsl.messages.typingStart(750, CONVO_ID, FRIEND_NAME),

        // Camera resets
        dsl.camera.reset(760, 25),

        dsl.messages.typingEnd(810, CONVO_ID, FRIEND_NAME),
        dsl.messages.receive(810, CONVO_ID, FRIEND_NAME, "perfect! 7pm? 🎉"),
        dsl.audio.play(810, "whatsapp_received", 0.8),

        // Type quick confirmation
        ...generateTyping(840, DEVICE_ID, "see you there! ", { speed: "fast" }),

        dsl.touch.tap(900, 1000, 1650),
        dsl.messages.send(905, CONVO_ID, "see you there! 🙌"),
        dsl.audio.play(905, "whatsapp_sent", 0.7),
        dsl.keyboard.clear(910, DEVICE_ID),
        dsl.keyboard.hide(915, DEVICE_ID),

        // Final message status
        dsl.messages.markSent(920, CONVO_ID, "msg_sent_3"),
        dsl.messages.markDelivered(950, CONVO_ID, "msg_sent_3"),
        dsl.messages.markRead(980, CONVO_ID, "msg_sent_3"),

        // Friend sends reaction
        dsl.messages.receive(1020, CONVO_ID, FRIEND_NAME, "❤️"),
        dsl.audio.play(1020, "whatsapp_received", 0.6),

        // Small camera shake on reaction
        dsl.camera.shake(1025, 3, 15, { frequency: 20, decay: 0.8 }),

        // Battery update
        dsl.os.setBattery(1050, 71, false, DEVICE_ID),

        // Time advances
        dsl.os.setTime(1060, START_TIME.getTime() + 35000, DEVICE_ID),
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
    const world = replay(episode.initialWorld, episode.events, t);

    const scale = Math.min(1080 / iPhone16Profile.dimensions.width, 1920 / iPhone16Profile.dimensions.height);

    // Format clock from device OS state
    const deviceOS = world.devices[DEVICE_ID]?.os;
    const clockTime = deviceOS ? new Date(deviceOS.clock).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
    }) : "14:45";

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
                {/* Touch overlay for tap visualization */}
                {world.touches && world.touches.length > 0 && (
                    <TouchOverlay touches={world.touches} t={t} />
                )}
            </div>
        </AbsoluteFill>
    );
};

export default FullRealityShowcase;
