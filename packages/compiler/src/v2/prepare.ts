/**
 * Prepare Track Episode - Converts TrackEpisodeIR to engine-ready format
 *
 * @description The glue between v2 DSL and the runtime engine.
 * Takes TrackEpisodeIR from episode().build() and produces
 * a CompiledEpisode ready for runEpisode().
 *
 * @see docs-v2/DSL_REVAMP.md
 */

import type { TrackEpisodeIR } from "@tokovo/ir";
import type { RuntimeEvent, WorldState, TokovoPlugin } from "@tokovo/core";
import { lowerEpisode } from "./lowering";

// =============================================================================
// TYPES
// =============================================================================

export interface PreparedTrackEpisode {
    id: string;
    fps: number;
    durationInFrames: number;
    events: RuntimeEvent[];
    initialWorld: WorldState;
    plugins: TokovoPlugin[];
    metadata: {
        title?: string;
        description?: string;
        markers: Array<{ id: string; frame: number }>;
        sections: Array<{ id: string; start: number; end: number }>;
    };
}

// =============================================================================
// PREPARE FUNCTION
// =============================================================================

/**
 * Prepare a v2 TrackEpisodeIR for the runtime engine.
 * 
 * @param ir - TrackEpisodeIR from episode().build()
 * @param plugins - Array of plugins to use
 * @returns PreparedTrackEpisode ready for runEpisode()
 */
export function prepareTrackEpisode(
    ir: TrackEpisodeIR,
    plugins: TokovoPlugin[]
): PreparedTrackEpisode {
    // Lower TrackEvent[] to RuntimeEvent[] (delegates APP events to plugins)
    const runtimeEvents = lowerEpisode(ir, plugins) as RuntimeEvent[];

    // Build initial world state from device configs
    const initialWorld = buildInitialWorld(ir);

    // Build metadata
    const metadata = {
        title: ir.title,
        description: ir.description,
        markers: ir.markers.map(m => ({ id: m.id, frame: m.frame })),
        sections: ir.sections.map(s => ({
            id: s.id,
            start: s.startFrame,
            end: s.endFrame
        })),
    };

    console.log("[prepareTrackEpisode] Prepared episode:", {
        id: ir.id,
        trackEvents: ir.events.length,
        runtimeEvents: runtimeEvents.length,
        devices: ir.devices.length,
        conversations: ir.devices.flatMap(d => d.conversations || []).length,
    });

    return {
        id: ir.id,
        fps: ir.fps,
        durationInFrames: ir.durationInFrames,
        events: runtimeEvents,
        initialWorld,
        plugins,
        metadata,
    };
}

// =============================================================================
// WORLD BUILDER
// =============================================================================

/**
 * Build initial WorldState from TrackEpisodeIR device configs.
 */
function buildInitialWorld(ir: TrackEpisodeIR): WorldState {
    // Build devices map
    const devices: Record<string, any> = {};
    for (const device of ir.devices) {
        devices[device.id] = {
            id: device.id,
            profileId: device.profile,
            foregroundAppId: device.app,  // CRITICAL: Renderer checks this!
            isLocked: false,              // Device must be unlocked
            platform: device.profile.includes("pixel") ? "android" : "ios",
            // Initialize keyboard state per device
            keyboard: {
                visible: false,
                layout: "qwerty",
                currentKey: null,
                keyPressedAt: null,
                inputText: "",
                cursorPosition: 0,
                cursorVisible: true,
                visibilityChangedAt: -1, // Quiescent: no transition yet
                selectionStart: null,
                selectionEnd: null,
                suggestions: [],
                highlightedSuggestion: null,
                keyPressVisual: null,
                typingSchedule: null, // Enterprise: derived animation
            },
        };
    }

    // Build conversations map
    const conversations: Record<string, any> = {};
    for (const device of ir.devices) {
        for (const conv of device.conversations || []) {
            conversations[conv.id] = {
                id: conv.id,
                name: conv.name,
                avatar: conv.avatar || "",
                type: conv.type || "dm",
                participants: (conv as any).participants || [],
                messages: [],
                typing: null,
                unreadCount: 0,
            };
        }
    }

    // Get OS config from first device (or defaults)
    const firstDevice = ir.devices[0];
    const osConfig = firstDevice?.os || {};

    const os = {
        time: osConfig.time instanceof Date ? osConfig.time : new Date(),
        battery: osConfig.battery ?? 100,
        network: osConfig.network ?? "5G",
        strength: 4,
        dnd: false,
        charging: false,
        lowPowerMode: false,
    };

    // Default camera state
    const camera = {
        scale: 1,
        translateX: 0,
        translateY: 0,
        rotation: 0,
        originX: 0.5,
        originY: 0.5,
        activeEffects: [],
    };

    // Default audio state - MUST match AudioState expected by mixer
    const audio = {
        activeSounds: {},  // Required by computeBusStates
        buses: {
            music: { baseGain: 1.0 },
            ui: { baseGain: 1.0 },
            sfx: { baseGain: 1.0 },
            voice: { baseGain: 1.0 },
            master: { baseGain: 1.0 },
        },
        muted: false,
    };

    // Notifications
    const notifications: any[] = [];

    // Build appState map with viewMode for proper layout resolution
    const appState: Record<string, any> = {};
    for (const device of ir.devices) {
        if (device.app) {
            // Apps with conversations should default to CHAT viewMode
            const hasConversations = device.conversations && device.conversations.length > 0;
            const firstConversation = device.conversations?.[0];

            appState[device.app] = {
                viewMode: hasConversations ? "CHAT" : "FEED",
                conversationId: firstConversation?.id,
            };
        }
    }

    return {
        devices,
        conversations,
        os,
        camera,
        audio,
        notifications,
        apps: {},
        appState,  // CRITICAL: Layout engine reads viewMode from here
    } as unknown as WorldState;
}
