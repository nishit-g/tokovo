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
import { replay, WorldState, TimelineEvent, createEventIndex } from "@tokovo/core";
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
        audio: { activeSounds: {} },
    };

    // =========================================================================
    // TIMELINE - NO CAMERA EVENTS!
    // DirectorLite handles all camera movement based on signals.
    // =========================================================================
    const events: TimelineEvent[] = [
        // ACT 1: THE SETUP (0s - 12s)
        dsl.receive(30, "Drama 👑", "hey girl, you free tonight?"),
        dsl.send(66, "maybe, what's up?"),
        dsl.receive(96, "Drama 👑", "need to talk to you about something 😬"),
        dsl.typingStart(141, "Drama 👑"),
        dsl.typingEnd(165, "Drama 👑"),
        dsl.receive(168, "Drama 👑", "it's about jake..."),
        dsl.typingStart(204, "You"),
        dsl.typingEnd(222, "You"),
        dsl.send(225, "wait what about jake???"),

        // ACT 2: THE BUILDUP (12s - 24s)
        dsl.typingStart(270, "Drama 👑"),
        dsl.typingEnd(360, "Drama 👑"),
        dsl.receive(363, "Drama 👑", "so... remember when i said he was acting weird?"),
        dsl.send(408, "yeah..."),
        dsl.typingStart(432, "Drama 👑"),
        dsl.typingEnd(492, "Drama 👑"),
        dsl.receive(495, "Drama 👑", "i found something on his phone"),
        dsl.send(531, "OMG WHAT"),
        dsl.receive(549, "Drama 👑", "he's been texting someone"),
        dsl.send(573, "WHO???"),
        dsl.typingStart(591, "Drama 👑"),
        dsl.typingEnd(666, "Drama 👑"),

        // ACT 3: THE CLIMAX (24s - 36s)
        dsl.receive(669, "Drama 👑", "IT'S MY BEST FRIEND SARAH!!!! 😭😭😭"),
        dsl.send(729, "NO. WAY."),
        dsl.receive(759, "Drama 👑", "i have screenshots"),
        dsl.send(783, "send them RIGHT NOW"),
        dsl.typingStart(801, "Drama 👑"),
        dsl.typingEnd(846, "Drama 👑"),
        dsl.receive(849, "Drama 👑", "they've been meeting up for 3 MONTHS"),
        dsl.send(894, "omg babe im so sorry 💔"),
        dsl.receive(924, "Drama 👑", "what do i do??? 😭"),
        dsl.send(969, "im coming over"),
        dsl.send(984, "dont do anything yet"),
        dsl.send(999, "we need to talk in person 💕"),

        // ACT 4: THE RESOLUTION (36s - 45s)
        dsl.typingStart(1050, "Drama 👑"),
        dsl.typingEnd(1110, "Drama 👑"),
        dsl.receive(1113, "Drama 👑", "ok... thank you 😢"),
        dsl.send(1158, "always here for you ❤️"),
        dsl.receive(1194, "Drama 👑", "im so lucky to have you as a friend"),
        dsl.send(1239, "that's what besties are for 💕"),
        dsl.receive(1284, "Drama 👑", "see you soon 💛"),
        dsl.send(1314, "be there in 20 🚗"),
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
