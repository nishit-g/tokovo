import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
    replay,
    createEventIndex,
    createInitialWorld,
    DEFAULT_CAMERA_STATE,
    TimelineEvent
} from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { dsl } from "@tokovo/dsl";

// DEFINE EPISODE
const INITIAL_WORLD = createInitialWorld({
    devices: {
        phone: {
            id: "phone",
            profileId: "iphone16",
            isLocked: false,
            foregroundAppId: "app_whatsapp",
            ownerName: "me",
            notifications: [],
            keyboard: {
                visible: false,
                layout: "qwerty",
                currentKey: null,
                keyPressedAt: null,
                inputText: "",
                cursorPosition: 0,
                cursorVisible: true
            }
        }
    },
    conversations: {
        chat_01: {
            id: "chat_01",
            type: "dm",
            name: "Alice 🌸",
            messages: [
                { id: "m1", from: "Alice 🌸", text: "Are you ready?", type: "text", status: "read" }
            ],
            typing: {}
        }
    },
    appState: {
        activeApp: "whatsapp",
        whatsapp: {
            screen: "chat",
            conversationId: "chat_01"
        }
    },
    camera: {
        ...DEFAULT_CAMERA_STATE,
        baseView: "APP_VIEW",
        activeDeviceId: "phone"
    }
});

const EVENTS: TimelineEvent[] = [
    // Beat 0: Initial focus
    dsl.camera.zoom(0, 1.0, 0),

    // Beat 1: Focus on input area (Manual Camera Move)
    dsl.camera.pan(30, 0, 200, 30), // Move down
    dsl.camera.zoom(30, 1.2, 30),

    // Beat 2: Start typing "I was born ready"
    dsl.keyboard.show(60, "phone"),
    ...dsl.keyboard.type(65, "phone", "I was born ready", { speed: "normal" }),

    // Beat 3: Reset Camera (Pull back to see full chat)
    dsl.camera.reset(150),

    // Beat 4: Send the message
    dsl.messages.send(180, "chat_01", "I was born ready", "app_whatsapp"),
    dsl.keyboard.hide(180, "phone"),
    dsl.keyboard.clear(180, "phone"),

    dsl.keyboard.show(220, "phone"),
    // Beat 5: Alice replies
    dsl.messages.typingStart(240, "phone", "Alice 🌸", "app_whatsapp"),

    dsl.messages.typingEnd(280, "phone", "Alice 🌸", "app_whatsapp"),
    dsl.messages.receive(280, "chat_01", "Alice 🌸", "Let's do this! 🚀", "app_whatsapp"),

    // Beat 6: Zoom to show reply
    dsl.camera.zoom(300, 1.5, 30) // Center zoom
];

export const KeyboardVerifyVideo: React.FC = () => {
    const t = useCurrentFrame();

    const eventIndex = useMemo(() => createEventIndex(EVENTS), []);
    const world = useMemo(() => replay(INITIAL_WORLD, EVENTS, t), [t]);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{ transform: "scale(0.8)" }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={true}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                />
            </div>
        </AbsoluteFill>
    );
};
