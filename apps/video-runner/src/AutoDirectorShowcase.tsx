/**
 * ============================================================================
 * AUTO DIRECTOR SHOWCASE - Video Runner Component
 * ============================================================================
 * 
 * Demonstrates 100% AUTOMATIC camera via DirectorLite.
 * No manual camera DSL - all camera movement is reactive to signals.
 * 
 * CAMERA PERSONALITY: "A careful human operator who reacts, but does not anticipate."
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
        conversationId: "dm_viral",
        from,
        text,
    } as any),

    send: (at: number, text: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        conversationId: "dm_viral",
        from: "me",
        text,
    } as any),

    typingStart: (at: number, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_START",
        conversationId: "dm_viral",
        from,
    } as any),

    typingEnd: (at: number, from: string): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_END",
        conversationId: "dm_viral",
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

// =============================================================================
// EPISODE CREATION - 100% AUTOMATIC DIRECTORLITE CAMERA
// =============================================================================

function createAutoDirectorEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
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
            dm_viral: {
                id: "dm_viral",
                type: "dm" as const,
                name: "Drama 👑",
                avatar: undefined,
                messages: [],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_viral",
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
    // TIMELINE - NO CAMERA EVENTS!
    // DirectorLite handles all camera movement based on signals.
    // =========================================================================
    const events: TimelineEvent[] = [
        // ACT 1: THE SETUP (0s - 12s)
        dsl.receive(30, "Drama 👑", "hey girl, you free tonight?"),

        // User types reply - show keyboard
        dsl.keyboardShow(50),
        dsl.keyDown(52, "m"), dsl.keyUp(54),
        dsl.keyDown(57, "a"), dsl.keyUp(59),
        dsl.keyDown(62, "y"), dsl.keyUp(64),
        dsl.send(66, "maybe, what's up?"),
        dsl.keyboardHide(68),

        dsl.receive(96, "Drama 👑", "need to talk to you about something 😬"),
        dsl.typingStart(141, "Drama 👑"),
        dsl.typingEnd(165, "Drama 👑"),
        dsl.receive(168, "Drama 👑", "it's about jake..."),

        // User types shocked reply
        dsl.keyboardShow(200),
        dsl.typingStart(204, "You"),
        dsl.keyDown(206, "w"), dsl.keyUp(208),
        dsl.keyDown(210, "a"), dsl.keyUp(212),
        dsl.keyDown(214, "i"), dsl.keyUp(216),
        dsl.keyDown(218, "t"), dsl.keyUp(220),
        dsl.typingEnd(222, "You"),
        dsl.send(225, "wait what about jake???"),
        dsl.keyboardHide(227),

        // ACT 2: THE BUILDUP (12s - 24s)
        dsl.typingStart(270, "Drama 👑"),
        dsl.typingEnd(360, "Drama 👑"),
        dsl.receive(363, "Drama 👑", "so... remember when i said he was acting weird?"),

        // Quick reply
        dsl.keyboardShow(395),
        dsl.keyDown(398, "y"), dsl.keyUp(400),
        dsl.keyDown(403, "e"), dsl.keyUp(405),
        dsl.send(408, "yeah..."),
        dsl.keyboardHide(410),

        dsl.typingStart(432, "Drama 👑"),
        dsl.typingEnd(492, "Drama 👑"),
        dsl.receive(495, "Drama 👑", "i found something on his phone"),

        // Shocked reaction
        dsl.keyboardShow(515),
        dsl.keyDown(518, "o"), dsl.keyUp(520),
        dsl.keyDown(523, "m"), dsl.keyUp(525),
        dsl.keyDown(527, "g"), dsl.keyUp(529),
        dsl.send(531, "OMG WHAT"),
        dsl.keyboardHide(533),

        dsl.receive(549, "Drama 👑", "he's been texting someone"),

        // Frantic typing
        dsl.keyboardShow(560),
        dsl.keyDown(563, "w"), dsl.keyUp(565),
        dsl.keyDown(567, "h"), dsl.keyUp(569),
        dsl.keyDown(570, "o"), dsl.keyUp(571),
        dsl.send(573, "WHO???"),
        dsl.keyboardHide(575),

        dsl.typingStart(591, "Drama 👑"),
        dsl.typingEnd(666, "Drama 👑"),

        // ACT 3: THE CLIMAX (24s - 36s)
        dsl.receive(669, "Drama 👑", "IT'S MY BEST FRIEND SARAH!!!! 😭😭😭"),

        // Shocked reaction
        dsl.keyboardShow(715),
        dsl.keyDown(718, "n"), dsl.keyUp(720),
        dsl.keyDown(722, "o"), dsl.keyUp(724),
        dsl.send(729, "NO. WAY."),
        dsl.keyboardHide(731),

        dsl.receive(759, "Drama 👑", "i have screenshots"),

        // Demanding
        dsl.keyboardShow(770),
        dsl.keyDown(773, "s"), dsl.keyUp(775),
        dsl.keyDown(777, "e"), dsl.keyUp(779),
        dsl.keyDown(780, "n"), dsl.keyUp(781),
        dsl.send(783, "send them RIGHT NOW"),
        dsl.keyboardHide(785),

        dsl.typingStart(801, "Drama 👑"),
        dsl.typingEnd(846, "Drama 👑"),
        dsl.receive(849, "Drama 👑", "they've been meeting up for 3 MONTHS"),

        // Supportive message
        dsl.keyboardShow(880),
        dsl.keyDown(883, "o"), dsl.keyUp(885),
        dsl.keyDown(887, "m"), dsl.keyUp(889),
        dsl.keyDown(890, "g"), dsl.keyUp(891),
        dsl.send(894, "omg babe im so sorry 💔"),
        dsl.keyboardHide(896),

        dsl.receive(924, "Drama 👑", "what do i do??? 😭"),

        // Rapid fire supportive messages
        dsl.keyboardShow(955),
        dsl.keyDown(958, "i"), dsl.keyUp(960),
        dsl.keyDown(962, "m"), dsl.keyUp(964),
        dsl.send(969, "im coming over"),
        dsl.keyDown(975, "d"), dsl.keyUp(977),
        dsl.keyDown(979, "o"), dsl.keyUp(981),
        dsl.send(984, "dont do anything yet"),
        dsl.keyDown(990, "w"), dsl.keyUp(992),
        dsl.keyDown(994, "e"), dsl.keyUp(996),
        dsl.send(999, "we need to talk in person 💕"),
        dsl.keyboardHide(1001),

        // ACT 4: THE RESOLUTION (36s - 45s)
        dsl.typingStart(1050, "Drama 👑"),
        dsl.typingEnd(1110, "Drama 👑"),
        dsl.receive(1113, "Drama 👑", "ok... thank you 😢"),

        // Sweet reply
        dsl.keyboardShow(1140),
        dsl.keyDown(1143, "a"), dsl.keyUp(1145),
        dsl.keyDown(1148, "l"), dsl.keyUp(1150),
        dsl.keyDown(1152, "w"), dsl.keyUp(1154),
        dsl.send(1158, "always here for you ❤️"),
        dsl.keyboardHide(1160),

        dsl.receive(1194, "Drama 👑", "im so lucky to have you as a friend"),

        // Final supportive message
        dsl.keyboardShow(1225),
        dsl.keyDown(1228, "t"), dsl.keyUp(1230),
        dsl.keyDown(1232, "h"), dsl.keyUp(1234),
        dsl.keyDown(1235, "a"), dsl.keyUp(1236),
        dsl.send(1239, "that's what besties are for 💕"),
        dsl.keyboardHide(1241),

        dsl.receive(1284, "Drama 👑", "see you soon 💛"),

        // Last message
        dsl.keyboardShow(1300),
        dsl.keyDown(1303, "b"), dsl.keyUp(1305),
        dsl.keyDown(1307, "e"), dsl.keyUp(1309),
        dsl.send(1314, "be there in 20 🚗"),
        dsl.keyboardHide(1316),
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

export const AutoDirectorShowcase: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    const episode = useMemo(() => createAutoDirectorEpisode(), []);
    const eventIndex = useMemo(() => createEventIndex(episode.events), [episode.events]);
    const world = replay(episode.initialWorld, episode.events, t);

    const scale = Math.min(1080 / iPhone16Profile.dimensions.width, 1920 / iPhone16Profile.dimensions.height);

    // Determine current act for display
    const getActLabel = (t: number): string => {
        if (t < 270) return "ACT 1: THE SETUP";
        if (t < 669) return "ACT 2: THE BUILDUP";
        if (t < 1050) return "ACT 3: THE CLIMAX 🔥";
        return "ACT 4: RESOLUTION";
    };

    const getSignalLabel = (t: number): string => {
        // Check recent events to determine signal
        const recentEvents = episode.events.filter(e => e.at <= t && e.at > t - 30);
        for (const e of recentEvents.reverse()) {
            if ((e as any).type === "TYPING_START") return "Signal: TypingStarted → subtle";
            if ((e as any).type === "MESSAGE_RECEIVED") {
                if ((e as any).from === "me") return "Signal: NewMessage → message";
                return "Signal: NewMessage → punchGlide";
            }
        }
        return "Director: Reactive";
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
                🎬 AUTOMATIC DirectorLite Demo
            </div>

            {/* Act indicator */}
            <div style={{
                position: "absolute",
                top: 80,
                left: 40,
                color: "#00ff88",
                fontSize: 18,
                fontFamily: "monospace",
                zIndex: 100,
            }}>
                {getActLabel(t)}
            </div>

            {/* Signal indicator */}
            <div style={{
                position: "absolute",
                top: 110,
                left: 40,
                color: "#ffaa00",
                fontSize: 14,
                fontFamily: "monospace",
                zIndex: 100,
            }}>
                {getSignalLabel(t)}
            </div>

            {/* 100% Automatic badge */}
            <div style={{
                position: "absolute",
                top: 40,
                right: 40,
                color: "#00ff88",
                fontSize: 14,
                fontFamily: "monospace",
                backgroundColor: "#00ff8820",
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #00ff8840",
                zIndex: 100,
            }}>
                100% AUTOMATIC CAMERA
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
                    directorEnabled={true}   // 👈 ENABLED!
                    directorDebug={false}
                />
            </div>
        </AbsoluteFill>
    );
};

export default AutoDirectorShowcase;
