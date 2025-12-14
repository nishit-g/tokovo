/**
 * ============================================================================
 * MANUAL CAMERA SHOWCASE - Video Runner Component
 * ============================================================================
 * 
 * Demonstrates 100% MANUAL camera via explicit anchor-based DSL.
 * DirectorLite is DISABLED - all camera movement is authored.
 * 
 * FEATURES DEMONSTRATED:
 * - anchorFocus(): one-time focus on anchor
 * - anchorTrack(): continuous tracking with smoothing
 * - punchGlide(): webseries signature combo
 * - hold(): let viewer read
 * 
 * CAMERA PERSONALITY: "A seasoned cinematographer with full creative control."
 */

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex, DEFAULT_AUDIO_STATE } from "@tokovo/core";
import { TokovoRenderer, registerBuiltInAnchorProviders } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

// Register anchor providers for semantic camera system
registerBuiltInAnchorProviders();

// =============================================================================
// DSL HELPERS
// =============================================================================

const dsl = {
    receive: (at: number, from: string, text: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        conversationId: "dm_bff",
        from,
        text,
    } as any),

    send: (at: number, text: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        conversationId: "dm_bff",
        from: "me",
        text,
    } as any),

    typingStart: (at: number, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_START",
        conversationId: "dm_bff",
        from,
    } as any),

    typingEnd: (at: number, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_END",
        conversationId: "dm_bff",
        from,
    } as any),

    // Keyboard events
    keyboardShow: (at: number): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "SHOW",
        deviceId: "phone",
        layout: "qwerty",
    } as any),

    keyboardHide: (at: number): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "HIDE",
        deviceId: "phone",
    } as any),

    keyDown: (at: number, key: string): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "KEY_DOWN",
        deviceId: "phone",
        key,
    } as any),

    keyUp: (at: number): TimelineEvent => ({
        at,
        kind: "KEYBOARD",
        type: "KEY_UP",
        deviceId: "phone",
    } as any),
};

// Camera DSL helpers (v1 locked values)
const camera = {
    anchorFocus: (at: number, anchor: string, preset: string, shake = 0): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "ANCHOR_FOCUS",
        anchor,
        preset,
        duration: getPresetDuration(preset),
        shake,
        easing: getPresetEasing(preset),
    } as any),

    anchorTrack: (at: number, anchor: string, duration: number, smoothing: number, preset?: string): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "ANCHOR_TRACK",
        anchor,
        duration,
        smoothing,
        preset: preset ?? "operatorFollow",
        easing: "ease-out",
    } as any),

    hold: (at: number, duration: number): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "HOLD",
        duration,
    } as any),

    punchGlide: (at: number, anchor: string): TimelineEvent[] => [
        {
            at,
            kind: "CAMERA",
            type: "ANCHOR_FOCUS",
            anchor,
            preset: "impact",
            duration: 14,
            shake: 4,
            easing: "expoOut",
        } as any,
        {
            at: at + 14,
            kind: "CAMERA",
            type: "ANCHOR_TRACK",
            anchor,
            duration: 30,
            smoothing: 0.18,
            preset: "operatorFollow",
            easing: "ease-out",
        } as any,
    ],
};

function getPresetDuration(preset: string): number {
    switch (preset) {
        case "message": return 22;
        case "subtle": return 30;
        case "impact": return 14;
        case "snap": return 8;
        case "operatorFollow": return 40;
        case "establish": return 30;
        case "reset": return 20;
        case "interrupt": return 10;
        default: return 22;
    }
}

function getPresetEasing(preset: string): string {
    switch (preset) {
        case "impact": return "expoOut";
        case "subtle": return "cinematic";
        default: return "ease-out";
    }
}

// =============================================================================
// EPISODE CREATION - 100% MANUAL CAMERA CONTROL
// =============================================================================

function createManualCameraEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
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
            dm_bff: {
                id: "dm_bff",
                type: "dm" as const,
                name: "BFF 💎",
                avatar: undefined,
                messages: [],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_bff",
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
        audio: DEFAULT_AUDIO_STATE,
    };

    // =========================================================================
    // TIMELINE WITH MANUAL CAMERA CONTROL
    // Each camera movement is explicitly authored.
    // =========================================================================
    const events: TimelineEvent[] = [
        // SCENE 1: ESTABLISHING (0s - 5s)
        camera.anchorFocus(0, "device", "establish"),
        camera.hold(30, 60),

        // SCENE 2: CASUAL EXCHANGE (5s - 15s)
        dsl.receive(150, "BFF 💎", "guess what just happened! 🤩"),
        camera.anchorFocus(150, "lastMessage", "message"),

        // User types with keyboard
        dsl.keyboardShow(180),
        dsl.keyDown(183, "w"), dsl.keyUp(185),
        dsl.keyDown(187, "h"), dsl.keyUp(189),
        dsl.keyDown(191, "a"), dsl.keyUp(193),
        dsl.send(195, "what?? tell me everything!!"),
        camera.anchorFocus(195, "lastMessage", "message"),
        dsl.keyboardHide(197),

        dsl.receive(231, "BFF 💎", "remember that guy from the party?"),
        camera.anchorFocus(231, "lastMessage", "message"),

        // User types
        dsl.keyboardShow(245),
        dsl.keyDown(248, "t"), dsl.keyUp(250),
        dsl.keyDown(252, "h"), dsl.keyUp(254),
        dsl.keyDown(256, "e"), dsl.keyUp(258),
        dsl.send(261, "the tall one with the glasses? 👀"),
        camera.anchorFocus(261, "lastMessage", "message"),
        dsl.keyboardHide(263),

        dsl.receive(291, "BFF 💎", "YES!! him!!"),
        camera.anchorFocus(291, "lastMessage", "snap"),  // Quick snap for excitement

        dsl.typingStart(321, "BFF 💎"),
        camera.anchorFocus(321, "inputArea", "subtle"),  // Typing anticipation

        dsl.typingEnd(381, "BFF 💎"),
        dsl.receive(384, "BFF 💎", "he asked for my number!!!"),
        camera.anchorFocus(384, "lastMessage", "message"),
        camera.hold(406, 30),

        // SCENE 3: EXCITEMENT (15s - 25s)
        dsl.keyboardShow(435),
        dsl.keyDown(438, "n"), dsl.keyUp(440),
        dsl.keyDown(442, "o"), dsl.keyUp(444),
        dsl.keyDown(446, "!"), dsl.keyUp(448),
        dsl.send(450, "NO WAY!!! 🎉🎉🎉"),
        camera.anchorFocus(450, "lastMessage", "snap", 2),  // Snap with shake!
        dsl.keyboardHide(452),

        dsl.receive(474, "BFF 💎", "I KNOW RIGHT"),
        camera.anchorFocus(474, "lastMessage", "snap"),

        // More typing
        dsl.keyboardShow(480),
        dsl.keyDown(483, "d"), dsl.keyUp(485),
        dsl.keyDown(487, "i"), dsl.keyUp(489),
        dsl.send(492, "did you give it to him?!"),
        camera.anchorFocus(492, "lastMessage", "message"),
        dsl.keyboardHide(494),

        dsl.typingStart(522, "BFF 💎"),
        camera.anchorFocus(522, "inputArea", "subtle"),  // Dramatic pause

        dsl.typingEnd(597, "BFF 💎"),
        dsl.receive(600, "BFF 💎", "we've been texting all day!! 💕"),
        camera.anchorFocus(600, "lastMessage", "impact", 5),  // THE REVEAL with impact!
        camera.hold(614, 45),

        dsl.keyboardShow(645),
        dsl.keyDown(648, "s"), dsl.keyUp(650),
        dsl.keyDown(652, "c"), dsl.keyUp(654),
        dsl.keyDown(656, "r"), dsl.keyUp(658),
        dsl.send(660, "SCREAMING"),
        camera.anchorFocus(660, "lastMessage", "snap"),

        dsl.keyDown(668, "w"), dsl.keyUp(670),
        dsl.keyDown(672, "h"), dsl.keyUp(674),
        dsl.keyDown(675, "a"), dsl.keyUp(676),
        dsl.send(678, "what did he say??"),
        camera.anchorFocus(678, "lastMessage", "snap"),
        dsl.keyboardHide(680),

        dsl.receive(702, "BFF 💎", "he wants to take me to dinner 🍝"),
        camera.anchorFocus(702, "lastMessage", "impact", 3),

        // SCENE 4: WEBSERIES MOMENT (25s - 35s)
        dsl.keyboardShow(735),
        dsl.keyDown(738, "o"), dsl.keyUp(740),
        dsl.keyDown(742, "m"), dsl.keyUp(744),
        dsl.keyDown(746, "g"), dsl.keyUp(748),
        dsl.send(750, "OMG WHEN??? WHERE???"),
        camera.anchorFocus(750, "lastMessage", "snap", 2),
        dsl.keyboardHide(752),

        dsl.typingStart(780, "BFF 💎"),
        camera.anchorFocus(780, "inputArea", "subtle"),

        dsl.typingEnd(825, "BFF 💎"),
        dsl.receive(828, "BFF 💎", "TOMORROW NIGHT!! at that fancy italian place downtown 🍷✨"),
        // THE BIG MOMENT - PUNCH + GLIDE!
        ...camera.punchGlide(828, "lastMessage"),
        camera.hold(872, 45),

        dsl.keyboardShow(905),
        dsl.keyDown(908, "y"), dsl.keyUp(910),
        dsl.keyDown(912, "o"), dsl.keyUp(914),
        dsl.keyDown(916, "u"), dsl.keyUp(918),
        dsl.send(921, "you're gonna look SO good"),
        camera.anchorFocus(921, "lastMessage", "message"),
        dsl.keyboardHide(923),

        dsl.receive(951, "BFF 💎", "i have nothing to wear 😩"),
        camera.anchorFocus(951, "lastMessage", "message"),

        dsl.keyboardShow(970),
        dsl.keyDown(973, "s"), dsl.keyUp(975),
        dsl.keyDown(977, "h"), dsl.keyUp(979),
        dsl.keyDown(981, "o"), dsl.keyUp(983),
        dsl.keyDown(984, "p"), dsl.keyUp(985),
        dsl.send(987, "shopping spree TONIGHT"),
        camera.anchorFocus(987, "lastMessage", "snap"),

        dsl.keyDown(995, "i"), dsl.keyUp(997),
        dsl.keyDown(1000, "k"), dsl.keyUp(1002),
        dsl.keyDown(1005, "n"), dsl.keyUp(1007),
        dsl.keyDown(1008, "o"), dsl.keyUp(1009),
        dsl.send(1011, "i know the perfect dress for you 💃"),
        camera.anchorTrack(1011, "lastMessage", 40, 0.18, "operatorFollow"),
        dsl.keyboardHide(1013),

        // SCENE 5: RESOLUTION (35s - 45s)
        dsl.receive(1056, "BFF 💎", "you're the best friend ever 😭💕"),
        camera.anchorTrack(1056, "lastMessage", 35, 0.18, "operatorFollow"),

        dsl.keyboardShow(1085),
        dsl.keyDown(1088, "a"), dsl.keyUp(1090),
        dsl.keyDown(1092, "l"), dsl.keyUp(1094),
        dsl.keyDown(1096, "w"), dsl.keyUp(1098),
        dsl.send(1101, "always got your back babe ❤️"),
        camera.anchorFocus(1101, "lastMessage", "message"),
        dsl.keyboardHide(1103),

        dsl.receive(1137, "BFF 💎", "mall at 6?"),
        camera.anchorFocus(1137, "lastMessage", "message"),

        dsl.keyboardShow(1150),
        dsl.keyDown(1153, "s"), dsl.keyUp(1155),
        dsl.keyDown(1157, "e"), dsl.keyUp(1159),
        dsl.keyDown(1161, "e"), dsl.keyUp(1163),
        dsl.send(1167, "see you then! 🛍️"),
        camera.anchorFocus(1167, "lastMessage", "snap"),
        dsl.keyboardHide(1169),

        dsl.receive(1212, "BFF 💎", "love you!!! 💎"),
        camera.anchorFocus(1212, "lastMessage", "message"),

        dsl.keyboardShow(1240),
        dsl.keyDown(1243, "l"), dsl.keyUp(1245),
        dsl.keyDown(1247, "o"), dsl.keyUp(1249),
        dsl.keyDown(1251, "v"), dsl.keyUp(1253),
        dsl.keyDown(1254, "e"), dsl.keyUp(1255),
        dsl.send(1257, "love you more!! 💕💕💕"),
        camera.anchorFocus(1257, "lastMessage", "message"),
        dsl.keyboardHide(1259),
        camera.hold(1279, 45),

        // Final reset
        camera.anchorFocus(1326, "device", "reset"),
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const ManualCameraShowcase: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    const episode = useMemo(() => createManualCameraEpisode(), []);
    const eventIndex = useMemo(() => createEventIndex(episode.events), [episode.events]);
    const world = replay(episode.initialWorld, episode.events, t);

    const scale = Math.min(1080 / iPhone16Profile.dimensions.width, 1920 / iPhone16Profile.dimensions.height);

    // Determine current scene/preset for display
    const getSceneLabel = (t: number): string => {
        if (t < 150) return "SCENE 1: ESTABLISHING";
        if (t < 450) return "SCENE 2: CASUAL EXCHANGE";
        if (t < 750) return "SCENE 3: EXCITEMENT 🎉";
        if (t < 1056) return "SCENE 4: WEBSERIES MOMENT 🎬";
        return "SCENE 5: RESOLUTION 💕";
    };

    const getPresetLabel = (t: number): string => {
        // Find most recent camera event
        const cameraEvents = episode.events.filter(e => (e as any).kind === "CAMERA" && e.at <= t);
        if (cameraEvents.length === 0) return "";

        const lastCamera = cameraEvents[cameraEvents.length - 1] as any;
        const type = lastCamera.type;
        const preset = lastCamera.preset || "";
        const shake = lastCamera.shake ? `, shake: ${lastCamera.shake}` : "";

        if (type === "ANCHOR_FOCUS") return `anchorFocus("${lastCamera.anchor}", "${preset}"${shake})`;
        if (type === "ANCHOR_TRACK") return `anchorTrack("${lastCamera.anchor}", ${lastCamera.duration}f, ${lastCamera.smoothing})`;
        if (type === "HOLD") return `hold(${lastCamera.duration}f)`;
        return type;
    };

    return (
        <AbsoluteFill style={{
            backgroundColor: "#0a0a1a",
            justifyContent: "center",
            alignItems: "center"
        }}>
            {/* Demo label */}
            <div style={{
                position: "absolute",
                top: 40,
                left: 40,
                color: "#ffffff80",
                fontSize: 24,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 500,
                zIndex: 100,
            }}>
                🎬 MANUAL Camera DSL Demo
            </div>

            {/* Scene indicator */}
            <div style={{
                position: "absolute",
                top: 80,
                left: 40,
                color: "#00ff88",
                fontSize: 18,
                fontFamily: "monospace",
                zIndex: 100,
            }}>
                {getSceneLabel(t)}
            </div>

            {/* Preset indicator */}
            <div style={{
                position: "absolute",
                top: 110,
                left: 40,
                color: "#ffaa00",
                fontSize: 14,
                fontFamily: "monospace",
                zIndex: 100,
                maxWidth: 500,
            }}>
                {getPresetLabel(t)}
            </div>

            {/* 100% Manual badge */}
            <div style={{
                position: "absolute",
                top: 40,
                right: 40,
                color: "#ff8800",
                fontSize: 14,
                fontFamily: "monospace",
                backgroundColor: "#ff880020",
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ff880040",
                zIndex: 100,
            }}>
                100% MANUAL CAMERA
            </div>

            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={false}
                    eventIndex={eventIndex}
                    directorEnabled={false}  // 👈 DISABLED! All camera is manual.
                    directorDebug={false}
                />
            </div>
        </AbsoluteFill>
    );
};

export default ManualCameraShowcase;
