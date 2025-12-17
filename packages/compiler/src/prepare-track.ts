/**
 * Prepare Track Episode - Converts TrackEpisodeIR to engine-ready format
 * 
 * @description The glue between v2 DSL and the runtime engine.
 * Takes TrackEpisodeIR from episode().build() and produces
 * a CompiledEpisode ready for runEpisode().
 * 
 * @see docs-v2/DSL_REVAMP.md
 */

import type { TrackEpisodeIR, TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent, WorldState, TokovoPlugin } from "@tokovo/core";
import { lowerEpisode } from "./lowering/track-lowering";

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
    // Lower TrackEvent[] to RuntimeEvent[]
    const runtimeEvents = lowerEpisode(ir) as RuntimeEvent[];

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
            profile: device.profile,
            app: device.app,
            platform: "ios", // Default
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
                participants: conv.participants || [],
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

    // Default audio state
    const audio = {
        bgm: null,
        sounds: [],
        muted: false,
    };

    // Default keyboard state
    const keyboard = {
        isVisible: false,
        height: 0,
    };

    // Notifications
    const notifications: any[] = [];

    return {
        devices,
        conversations,
        os,
        camera,
        audio,
        keyboard,
        notifications,
        apps: {},
    } as unknown as WorldState;
}
