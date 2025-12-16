import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
    replay,
    WorldState,
    TimelineEvent,
    createEventIndex,
    DEFAULT_BUS_CONFIG,
    PluginManagerClass
} from "@tokovo/core";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { WhatsApp } from "@tokovo/apps-whatsapp";
import { Spotify } from "@tokovo/apps-spotify";

// Import device reducer
import "@tokovo/devices";

/**
 * Full Cinematic Showcase - DSL Style
 * 
 * Demonstrates production-grade episode authoring:
 * - DSL helpers abstract away raw event structure
 * - Camera movements synchronized with story beats
 * - Production audio with buses and ducking
 * - Spotify background music (Now Playing widget)
 * - Notification system with grouping
 */

// =============================================================================
// DSL HELPERS
// =============================================================================

const dsl = {
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

    // Camera
    zoom: (at: number, scale: number, duration: number, opts: { originX?: number; originY?: number; easing?: string } = {}): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "ZOOM",
        scale,
        duration,
        originX: opts.originX ?? 0.5,
        originY: opts.originY ?? 0.5,
        easing: opts.easing ?? "ease-out",
    } as any),

    pan: (at: number, x: number, y: number, duration: number, easing = "ease-out"): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "PAN",
        translateX: x,
        translateY: y,
        duration,
        easing,
    } as any),

    shake: (at: number, intensity: number, duration: number, decay = 0.5): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "SHAKE",
        intensity,
        frequency: 18,
        decay,
        duration,
    } as any),

    reset: (at: number, duration: number): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "RESET",
        duration,
        easing: "ease-out",
    } as any),

    // Spotify - Background Music
    spotifyPlay: (at: number, track: { name: string; artist: string; albumArt?: string }): TimelineEvent => ({
        at,
        kind: "APP",
        appId: "app_spotify",
        type: "PLAY_TRACK",
        track,
    } as any),

    spotifyBackground: (at: number, deviceId: string, track: { name: string; artist: string }): TimelineEvent => ({
        at,
        kind: "DEVICE",
        deviceId,
        type: "START_BACKGROUND_APP",
        appId: "app_spotify",
        indicator: "music",
        label: `${track.name} - ${track.artist}`,
    } as any),

    // Notifications
    notification: (at: number, deviceId: string, opts: { appId: string; title: string; body: string; mode?: string; threadId?: string; icon?: string }): TimelineEvent => ({
        at,
        kind: "DEVICE",
        deviceId,
        type: "SHOW_NOTIFICATION",
        appId: opts.appId,
        title: opts.title,
        body: opts.body,
        mode: opts.mode ?? "headsup",
        threadId: opts.threadId,
        icon: opts.icon,
    } as any),

    // Audio
    playSound: (at: number, soundId: string, volume = 1.0, opts: { loop?: boolean; duration?: number; instanceId?: string } = {}): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "PLAY_SOUND",
        soundId,
        volume,
        loop: opts.loop,
        duration: opts.duration,
        instanceId: opts.instanceId,
    } as any),

    stopSound: (at: number, instanceId: string): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "STOP_SOUND",
        instanceId,
    } as any),
};

// =============================================================================
// DEMO TRACK
// =============================================================================

const DEMO_TRACK = {
    name: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    albumArt: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
};

// =============================================================================
// EPISODE DEFINITION
// =============================================================================

function createFullCinematicEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const initialWorld: WorldState = {
        devices: {
            phone: {
                id: "phone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
                backgroundApps: [],
            },
        },
        conversations: {
            dm_ex: {
                id: "dm_ex",
                type: "dm",
                name: "Ex 💔",
                messages: [],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_ex",
            },
            app_spotify: {
                screen: "player",
                isMinimized: true,
            },
        },
        camera: {
            baseView: "APP_VIEW",
            activeDeviceId: "phone",
            layout: { mode: "SINGLE", primaryDeviceId: "phone" },
            activeEffects: [],
            transform: {
                translateX: 0, translateY: 0, scale: 1, rotation: 0,
                originX: 0.5, originY: 0.5, shakeX: 0, shakeY: 0,
            },
            deviceTransforms: {},
        },
        audio: {
            activeSounds: {},
            buses: DEFAULT_BUS_CONFIG,
        },
    };

    // -------------------------------------------------------------------------
    // TIMELINE (DSL STYLE)
    // -------------------------------------------------------------------------
    const events: TimelineEvent[] = [
        // =====================================================================
        // ACT 0: SPOTIFY STARTS (background music)
        // =====================================================================
        dsl.spotifyPlay(0, DEMO_TRACK),
        dsl.spotifyBackground(0, "phone", DEMO_TRACK),

        // =====================================================================
        // ACT 1: ESTABLISHING (0-3s)
        // =====================================================================
        dsl.zoom(0, 1.15, 1, { originY: 1.0 }),
        dsl.pan(1, 0, -150, 75, "ease-in-out"),
        dsl.zoom(30, 1.0, 60, { originY: 0.5 }),

        // =====================================================================
        // ACT 2: FIRST MESSAGE (3s)
        // =====================================================================
        dsl.receiveMessage(90, "dm_ex", "Ex 💔", "We need to talk."),
        dsl.playSound(90, "whatsapp_received", 0.9),
        dsl.pan(90, 0, 50, 45),
        dsl.zoom(100, 1.03, 35, { originY: 0.75 }),

        // =====================================================================
        // ACT 3: INSTAGRAM NOTIFICATION (4s) - demo grouping
        // =====================================================================
        dsl.notification(120, "phone", {
            appId: "app_instagram",
            title: "mike_photos",
            body: "Liked your photo ❤️",
            threadId: "ig_likes",
            icon: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
        }),

        // =====================================================================
        // ACT 4: TYPING ANTICIPATION (5s)
        // =====================================================================
        dsl.typingStart(150, "dm_ex", "Ex 💔"),
        dsl.playSound(150, "whatsapp_typing", 0.4, { loop: true, duration: 90, instanceId: "typing" }),
        dsl.zoom(150, 1.05, 75, { originY: 0.88 }),

        // =====================================================================
        // ACT 5: THE REVEAL (8s)
        // =====================================================================
        dsl.typingEnd(240, "dm_ex", "Ex 💔"),
        dsl.stopSound(240, "typing"),
        dsl.receiveMessage(240, "dm_ex", "Ex 💔", "I've been thinking about us a lot lately... and I don't think this is working anymore."),
        dsl.playSound(240, "whatsapp_received", 1.0),
        dsl.zoom(240, 1.12, 8, { originY: 0.7 }),

        // =====================================================================
        // ACT 6: ANOTHER IG NOTIFICATION (9s) - grouped with previous
        // =====================================================================
        dsl.notification(270, "phone", {
            appId: "app_instagram",
            title: "sarah_travels",
            body: "Also liked your photo ❤️",
            threadId: "ig_likes",
        }),

        // =====================================================================
        // ACT 7: BREATHING ROOM (10s)
        // =====================================================================
        dsl.zoom(300, 0.92, 60),

        // =====================================================================
        // ACT 8: RAPID FIRE (12-16s)
        // =====================================================================
        dsl.receiveMessage(360, "dm_ex", "Ex 💔", "Hello?"),
        dsl.playSound(360, "whatsapp_received", 0.8),
        dsl.zoom(360, 1.06, 8, { originX: 0.35, originY: 0.8 }),

        dsl.sendMessage(385, "dm_ex", "What do you mean?"),
        dsl.playSound(385, "whatsapp_sent", 0.7),
        dsl.zoom(385, 1.09, 8, { originX: 0.65, originY: 0.82 }),

        dsl.receiveMessage(410, "dm_ex", "Ex 💔", "You know exactly what I mean."),
        dsl.playSound(410, "whatsapp_received", 0.9),
        dsl.zoom(410, 1.13, 6, { originX: 0.35 }),

        dsl.sendMessage(430, "dm_ex", "I don't understand..."),
        dsl.playSound(430, "whatsapp_sent", 0.7),
        dsl.zoom(430, 1.16, 6, { originX: 0.65 }),

        // =====================================================================
        // ACT 9: THE BOMB (16s)
        // =====================================================================
        dsl.receiveMessage(480, "dm_ex", "Ex 💔", "It's over."),
        dsl.playSound(480, "notification", 1.0),
        dsl.shake(480, 12, 20, 0.5),
        dsl.zoom(480, 1.25, 12, { originX: 0.4, originY: 0.88 }),

        // =====================================================================
        // ACT 10: AFTERMATH (18-24s)
        // =====================================================================
        dsl.sendMessage(540, "dm_ex", "..."),
        dsl.playSound(540, "whatsapp_sent", 0.5),
        dsl.zoom(540, 1.0, 90),
        dsl.reset(660, 30),
    ];

    return { initialWorld, events };
}

// =============================================================================
// VIDEO COMPONENT
// =============================================================================

import { Instagram } from "@tokovo/apps-instagram";

export const FullCinematicShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Create ISOLATED Engine (PluginManager)
    const pluginManager = useMemo(() => {
        const pm = new PluginManagerClass();
        pm.register(WhatsApp);
        pm.register(Spotify);
        pm.register(Instagram);
        return pm;
    }, []);

    const episode = useMemo(() => createFullCinematicEpisode(), []);
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
                    pluginManager={pluginManager}
                />
            </div>
        </AbsoluteFill>
    );
};
