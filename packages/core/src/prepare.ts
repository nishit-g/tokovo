/**
 * prepareEpisode() - The Single Entry Point
 * 
 * This is the ONLY way to create a CompiledEpisode.
 * It orchestrates: compile → lower → validate → package
 * 
 * @see docs/FUCKING_MESS.md Section 3
 */

import { CompiledEpisode, PrepareOptions, AssetManifest } from "./types/compiled-episode";
import { RuntimeEvent } from "./types/runtime-event";
import { TokovoPluginContract } from "./types/plugin-contract";
import { WorldState, DEFAULT_CAMERA_STATE, DEFAULT_AUDIO_STATE, DEFAULT_OS_STATE } from "./types";

// =============================================================================
// PLUGIN REGISTRY
// =============================================================================

interface PluginRegistry {
    plugins: TokovoPluginContract[];
    byId: Map<string, TokovoPluginContract>;
}

function buildPluginRegistry(plugins: TokovoPluginContract[]): PluginRegistry {
    const byId = new Map<string, TokovoPluginContract>();
    for (const plugin of plugins) {
        byId.set(plugin.id, plugin);
    }
    return { plugins, byId };
}

// =============================================================================
// DERIVE INITIAL WORLD
// =============================================================================

interface DeviceDefinition {
    id: string;
    platform?: "ios" | "android";
    appId?: string;
    profileId?: string;
    conversations?: Array<{
        id: string;
        name?: string;
        type?: "dm" | "group";
        avatar?: string;
    }>;
}

interface SceneIRLike {
    id: string;
    fps?: number;
    durationInFrames?: number;
    devices?: DeviceDefinition[];
}

/**
 * Derive initial world state from scene definition
 */
export function deriveInitialWorld(
    sceneIR: SceneIRLike,
    registry: PluginRegistry
): WorldState {
    // Start with minimal world using existing defaults
    const world: WorldState = {
        devices: {},
        conversations: {},
        appState: {},
        camera: { ...DEFAULT_CAMERA_STATE },
        audio: { ...DEFAULT_AUDIO_STATE },
        touches: [],
    };

    // Add devices from scene
    for (const deviceDef of sceneIR.devices || []) {
        world.devices[deviceDef.id] = {
            id: deviceDef.id,
            profileId: deviceDef.profileId || deviceDef.id,
            isLocked: false,
            foregroundAppId: deviceDef.appId || undefined,
            platform: deviceDef.platform || "ios",
            os: { ...DEFAULT_OS_STATE }
        } as any;

        // Add conversations
        for (const convDef of deviceDef.conversations || []) {
            world.conversations[convDef.id] = {
                id: convDef.id,
                name: convDef.name || convDef.id,
                type: convDef.type || "dm",
                avatar: convDef.avatar,
                messages: [],
                typing: {}
            };
        }

        // Initialize app state per plugin
        for (const plugin of registry.plugins) {
            if (plugin.createInitialState) {
                if (!world.appState[deviceDef.id]) {
                    world.appState[deviceDef.id] = {};
                }
                (world.appState as any)[deviceDef.id][plugin.id] = plugin.createInitialState();
            }
        }
    }

    // Set camera to first device
    const deviceIds = Object.keys(world.devices);
    if (deviceIds.length > 0) {
        world.camera.activeDeviceId = deviceIds[0];
        world.camera.layout = { mode: "SINGLE", primaryDeviceId: deviceIds[0] };
    }

    return world;
}

// =============================================================================
// SORT EVENTS
// =============================================================================

const EVENT_KIND_PRIORITY: Record<string, number> = {
    DEVICE: 1,
    APP: 2,
    CAMERA: 3,
    AUDIO: 4,
    KEYBOARD: 5
};

function sortEvents(events: RuntimeEvent[]): RuntimeEvent[] {
    return [...events].sort((a, b) => {
        // 1. Sort by frame
        if (a.at !== b.at) return a.at - b.at;

        // 2. Sort by kind priority
        const priorityA = EVENT_KIND_PRIORITY[a.kind] || 10;
        const priorityB = EVENT_KIND_PRIORITY[b.kind] || 10;
        return priorityA - priorityB;
    });
}

// =============================================================================
// VALIDATE
// =============================================================================

interface ValidationError {
    type: "error" | "warning";
    message: string;
    eventIndex?: number;
}

function validateEpisode(
    episode: Pick<CompiledEpisode, "events" | "initialWorld">,
    options: PrepareOptions
): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check events are sorted
    for (let i = 1; i < episode.events.length; i++) {
        if (episode.events[i].at < episode.events[i - 1].at) {
            errors.push({
                type: "error",
                message: `Events not sorted: event ${i} at frame ${episode.events[i].at} comes before event ${i - 1} at frame ${episode.events[i - 1].at}`,
                eventIndex: i
            });
        }
    }

    // Check all events have required fields
    for (let i = 0; i < episode.events.length; i++) {
        const e = episode.events[i];
        if (typeof e.at !== "number") {
            errors.push({
                type: "error",
                message: `Event ${i} missing 'at' field`,
                eventIndex: i
            });
        }
        if (!e.kind) {
            errors.push({
                type: "error",
                message: `Event ${i} missing 'kind' field`,
                eventIndex: i
            });
        }
    }

    // In strict mode, throw on errors
    if (options.strict && errors.some(e => e.type === "error")) {
        const errorMessages = errors.filter(e => e.type === "error").map(e => e.message);
        throw new Error(`Episode validation failed:\n${errorMessages.join("\n")}`);
    }

    return errors;
}

// =============================================================================
// COLLECT ASSETS
// =============================================================================

function collectAssets(registry: PluginRegistry): AssetManifest {
    const sounds: Record<string, string> = {};
    const icons: Record<string, string> = {};
    const images: Record<string, string> = {};

    for (const plugin of registry.plugins) {
        if (plugin.assets?.sounds) {
            for (const [id, path] of Object.entries(plugin.assets.sounds)) {
                sounds[`${plugin.id}.${id}`] = path;
            }
        }
        if (plugin.assets?.icons) {
            for (const [id, path] of Object.entries(plugin.assets.icons)) {
                icons[`${plugin.id}.${id}`] = path;
            }
        }
        if (plugin.assets?.images) {
            for (const [id, path] of Object.entries(plugin.assets.images)) {
                images[`${plugin.id}.${id}`] = path;
            }
        }
    }

    return { sounds, icons, images };
}

// =============================================================================
// PREPARE EPISODE
// =============================================================================

export interface EpisodeInput {
    id: string;
    durationInFrames: number;
    fps: number;
    events: RuntimeEvent[];
    sceneIR?: SceneIRLike;
    initialWorld?: WorldState;
    title?: string;
}

/**
 * prepareEpisode - The single entry point for creating a CompiledEpisode
 * 
 * @param input - Episode input (events, scene definition, etc.)
 * @param plugins - Array of plugins to register
 * @param options - Prepare options
 * @returns CompiledEpisode ready for rendering
 */
export function prepareEpisode(
    input: EpisodeInput,
    plugins: TokovoPluginContract[] = [],
    options: PrepareOptions = {}
): CompiledEpisode {
    const { strict = true, mode = "preview", includeDebug = true } = options;
    const effectiveOptions = { ...options, strict, mode };

    // 1. Build plugin registry
    const registry = buildPluginRegistry(plugins);

    // 2. Create or use initial world
    const sceneIR: SceneIRLike = input.sceneIR || { id: input.id };
    const initialWorld = input.initialWorld || deriveInitialWorld(sceneIR, registry);

    // 3. Sort events
    const sortedEvents = sortEvents(input.events);

    // 4. Validate
    validateEpisode({ events: sortedEvents, initialWorld }, effectiveOptions);

    // 5. Collect assets
    const assets = collectAssets(registry);

    // 6. Build compiled episode
    const compiled: CompiledEpisode = {
        id: input.id,
        title: input.title,
        durationInFrames: input.durationInFrames,
        fps: input.fps,
        initialWorld,
        events: sortedEvents,
        assets,
    };

    // 7. Add debug info
    if (includeDebug) {
        compiled.debug = {
            buildTimestamp: Date.now(),
            sourceEpisodeId: input.id,
        };
    }

    return compiled;
}

// =============================================================================
// RUN EPISODE
// =============================================================================

export interface RunOptions {
    mode: "preview" | "render";
    onError?: (error: Error, event: RuntimeEvent) => void;
}

/**
 * run - Apply events up to frame and return world state
 * 
 * @param episode - CompiledEpisode from prepareEpisode()
 * @param frame - Current frame number
 * @param options - Run options
 * @returns WorldState at the given frame
 */
export function runEpisode(
    episode: CompiledEpisode,
    frame: number,
    options: RunOptions = { mode: "preview" }
): WorldState {
    // Import replay from engine (circular dep protection)
    const { replay } = require("./engine");

    // Get events up to current frame
    const eventsToApply = episode.events.filter(e => e.at <= frame);

    // Run replay with mode
    return replay(episode.initialWorld, eventsToApply, frame, {
        mode: options.mode,
        onError: options.onError,
    });
}

// =============================================================================
// RE-EXPORT TYPES
// =============================================================================

export type { CompiledEpisode, PrepareOptions, AssetManifest } from "./types/compiled-episode";
export type { RuntimeEvent, AppRuntimeEvent, DeviceRuntimeEvent, CameraRuntimeEvent, AudioRuntimeEvent, KeyboardRuntimeEvent } from "./types/runtime-event";
