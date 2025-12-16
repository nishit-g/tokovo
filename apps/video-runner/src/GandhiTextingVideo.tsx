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
            ownerName: "Mahatma",
            notifications: [],
            keyboard: {
                // timestamp removed

                visible: false,
                layout: "qwerty",
                currentKey: null,
                keyPressedAt: null,
                visibilityChangedAt: 0,
                inputText: "",
                cursorPosition: 0,
                cursorVisible: true
            }
        }
    },
    conversations: {
        chat_gan: {
            id: "chat_gan",
            type: "dm",
            name: "Kasturba ❤️",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Kasturba_Gandhi.jpg",
            messages: [
                { id: "m1", from: "Kasturba ❤️", text: "Fasting again today?", type: "text", status: "read", timestamp: "10:00" }
            ],
            typing: {}
        }
    },
    appState: {
        activeApp: "whatsapp",
        whatsapp: {
            screen: "chat",
            conversationId: "chat_gan"
        }
    },
    camera: {
        ...DEFAULT_CAMERA_STATE,
        baseView: "APP_VIEW",
        activeDeviceId: "phone"
    }
});

const EVENTS: TimelineEvent[] = [
    // Beat 0: Establishing shot
    dsl.camera.zoom(0, 1.0, 0),

    // Beat 1: Read message
    dsl.camera.focus(10, { target: "lastMessage", zoom: 1.2, duration: 30 }),

    // Beat 2: Start typing
    dsl.keyboard.show(60, "phone"),
    ...dsl.keyboard.type(70, "phone", "Not today!", { speed: "fast", variance: 2 }),

    // Beat 3: Add detail
    ...dsl.keyboard.type(110, "phone", " Taco Tuesday. 🌮", { speed: "normal", variance: 3 }),

    // Beat 4: Send
    dsl.messages.send(180, "chat_gan", "Not today! Taco Tuesday. 🌮", "app_whatsapp", "phone"),
    dsl.keyboard.hide(185, "phone"),
    dsl.keyboard.clear(185, "phone"),

    // Beat 5: She replies
    dsl.messages.typingStart(220, "phone", "Kasturba ❤️", "app_whatsapp", "phone"),
    dsl.camera.reset(220), // Reset to see full chat

    dsl.messages.typingEnd(280, "phone", "Kasturba ❤️", "app_whatsapp", "phone"),
    dsl.messages.receive(280, "chat_gan", "Kasturba ❤️", "Spicy or mild?", "app_whatsapp", "phone"),

    // Beat 6: The punchline
    dsl.keyboard.show(310, "phone"),
    ...dsl.keyboard.type(320, "phone", "Non-violent spice pls 🥣", { speed: "fast" }),
    dsl.messages.send(400, "chat_gan", "Non-violent spice pls 🥣", "app_whatsapp", "phone"),

    dsl.camera.zoom(410, 1.4, 30)
];

export const GandhiTextingVideo: React.FC = () => {
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
