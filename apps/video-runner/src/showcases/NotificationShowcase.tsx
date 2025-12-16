import React, { useMemo } from "react";
import { TokovoRenderer } from "@tokovo/renderer";
import { TimelineEvent, createInitialWorld, replay, createEventIndex, DEFAULT_CAMERA_STATE } from "@tokovo/core";
import { dsl } from "@tokovo/dsl";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { iPhone16Profile } from "@tokovo/devices";

/**
 * Notification Showcase
 * 
 * Demonstrates the "True OS" notification architecture:
 * 1. Heads-up notifications (Dynamic Island style)
 * 2. Interaction (Tap to open)
 * 3. Lockscreen stacking
 * 4. App Branding (from Registry)
 */

const EVENTS: TimelineEvent[] = [
    // 1. Start on Home Screen
    { at: 0, kind: "DEVICE", deviceId: "primary", type: "UNLOCK" },
    { at: 0, kind: "DEVICE", deviceId: "primary", type: "GO_HOME" },

    // 2. Incoming WhatsApp (Heads Up)
    dsl.notification.schedule(30, {
        appId: "app_whatsapp",
        title: "Alice",
        body: "Hey! Are we still on for dinner tonight? 🌮",
        category: "message",
        actions: [{ id: "reply", label: "Reply" }]
    }),

    // 3. User taps notification -> Opens WhatsApp
    dsl.notification.tap(90, "notif_0"),

    // 3a. Message actually appears in app (simulated context)
    // In a full simulation, the app would read from state. 
    // Here we just simulate the notification flow.

    // 4. Go Home & Lock
    dsl.touch.tap(200, 195, 900), // Swipe up gesture simulation
    { at: 200, kind: "DEVICE", deviceId: "primary", type: "GO_HOME" },
    { at: 230, kind: "DEVICE", deviceId: "primary", type: "LOCK" },

    // 5. Stack notifications on Lockscreen
    dsl.notification.schedule(260, {
        id: "insta_1",
        appId: "app_instagram",
        title: "Instagram",
        body: "bob_builder liked your story",
        icon: "❤️"
    }),

    dsl.notification.schedule(270, {
        id: "insta_2",
        appId: "app_instagram",
        title: "Instagram",
        body: "alice_w commented: 'Amazing!'",
    }),

    dsl.notification.schedule(280, {
        id: "mail_1",
        appId: "app_gmail",
        title: "Gmail",
        body: "Security Alert: New sign-in on Mac",
    }),

    // 6. Camera zoom to inspect stack
    dsl.camera.zoom(300, 1.5, 30),
];

export const NotificationShowcase: React.FC = () => {
    const frame = useCurrentFrame();

    // Initial State
    const initialWorld = createInitialWorld({
        devices: {
            primary: {
                id: "primary",
                profileId: "iphone16",
                isLocked: false,
                notifications: [], // Legacy compat
                homeScreen: {
                    wallpaper: "linear-gradient(to bottom, #1c1c1c, #000000)",
                    pages: [
                        {
                            apps: [
                                { appId: "app_whatsapp", label: "WhatsApp", icon: "💬" },
                                { appId: "app_instagram", label: "Instagram", icon: "📸" },
                                { appId: "app_photos", label: "Photos", icon: "🖼️" },
                                { appId: "app_settings", label: "Settings", icon: "⚙️" }
                            ]
                        }
                    ],
                    dock: [
                        { appId: "app_phone", label: "Phone", icon: "📞" },
                        { appId: "app_safari", label: "Safari", icon: "🧭" },
                        { appId: "app_messages", label: "Messages", icon: "💬" },
                        { appId: "app_music", label: "Music", icon: "🎵" }
                    ]
                },
                os: {
                    clock: Date.now(),
                    notifications: [],
                    notificationHistory: [],
                    battery: 100,
                    wifiStrength: 3,
                    cellStrength: 4,
                    network: "wifi",
                    dnd: false,
                    lowPowerMode: false,
                    airplaneMode: false,
                    charging: false
                }
            }
        },
        camera: {
            ...DEFAULT_CAMERA_STATE,
            activeDeviceId: "primary"
        }
    });

    // Event Index (optimization)
    const eventIndex = useMemo(() => createEventIndex(EVENTS), []);

    // Compute State
    const world = replay(initialWorld, EVENTS, frame);

    // Calculate scale to fit device in composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#1a1a2e",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={frame}
                    debug={true}
                    eventIndex={eventIndex}
                    directorEnabled={true} // Enable full cinematic renderer
                />
            </div>
        </AbsoluteFill>
    );
};
