/**
 * Tokovo Engine Factory
 *
 * Creates a self-contained engine instance with DI.
 * No global singletons = testable, multi-composition safe.
 *
 * @module @tokovo/core/canonical/engine
 */

import type { PluginRegistry } from "./plugin-registry";
import type { ActorRegistry } from "./identity";
import { createActorRegistry } from "./identity";
import type { CanonicalRuntimeEvent } from "./device-events";
import type { ReducerSet, ReducerContext, WorldState } from "./routing";
import { routeEvent, defaultDeviceReducer, defaultOSReducer, defaultCameraReducer } from "./routing";
import { sortEventsDeterministic } from "./ordering";

/**
 * Validation mode (defined here to avoid circular dependency with compiler).
 */
export type ValidationMode = "strict" | "compat" | "lenient";

// =============================================================================
// ENGINE CONFIG
// =============================================================================

/**
 * Engine configuration.
 */
export interface EngineConfig {
    /** Plugin registry */
    readonly plugins: PluginRegistry;

    /** Frames per second */
    readonly fps: number;

    /** Validation mode */
    readonly validation?: ValidationMode;

    /** Actor registry (optional, created if not provided) */
    readonly actors?: ActorRegistry;

    /** Episode ID */
    readonly episodeId?: string;
}

// =============================================================================
// ENGINE INTERFACE
// =============================================================================

/**
 * Tokovo engine instance.
 */
export interface TokovoEngine {
    /** Plugin registry */
    readonly plugins: PluginRegistry;

    /** Actor registry */
    readonly actors: ActorRegistry;

    /** FPS */
    readonly fps: number;

    /** Validation mode */
    readonly validation: ValidationMode;

    /** Episode ID */
    readonly episodeId: string;

    /**
     * Build world state at a specific frame.
     */
    buildWorld(
        initial: WorldState,
        events: CanonicalRuntimeEvent[],
        frame: number
    ): WorldState;

    /**
     * Get all events up to a frame (sorted).
     */
    getEventsUpTo(events: CanonicalRuntimeEvent[], frame: number): CanonicalRuntimeEvent[];

    /**
     * Get reducers from plugins.
     */
    getReducers(): ReducerSet;

    /**
     * Create reducer context for a frame.
     */
    createContext(frame: number): ReducerContext;
}

// =============================================================================
// ENGINE FACTORY
// =============================================================================

/**
 * Create a Tokovo engine instance.
 *
 * @example
 * ```ts
 * const plugins = createPluginRegistry();
 * plugins.register(WhatsAppPlugin);
 * plugins.register(InstagramPlugin);
 *
 * const engine = createEngine({
 *   plugins,
 *   fps: 30,
 *   validation: "strict",
 * });
 *
 * const world = engine.buildWorld(initial, events, frame);
 * ```
 */
export function createEngine(config: EngineConfig): TokovoEngine {
    const {
        plugins,
        fps,
        validation = "strict",
        actors = createActorRegistry(),
        episodeId = "default",
    } = config;

    // Build app reducers from plugins
    const getReducers = (): ReducerSet => {
        const appReducers: Record<string, any> = {};
        for (const plugin of plugins.all()) {
            appReducers[plugin.id] = plugin.reducer;
        }

        return {
            app: appReducers,
            device: defaultDeviceReducer,
            os: defaultOSReducer,
            camera: defaultCameraReducer,
        };
    };

    const createContext = (frame: number): ReducerContext => ({
        actors,
        frame,
        episodeId,
        fps,
    });

    const getEventsUpTo = (
        events: CanonicalRuntimeEvent[],
        frame: number
    ): CanonicalRuntimeEvent[] => {
        const sorted = sortEventsDeterministic(events);
        return sorted.filter((e) => e.at <= frame);
    };

    const buildWorld = (
        initial: WorldState,
        events: CanonicalRuntimeEvent[],
        frame: number
    ): WorldState => {
        // Clone initial state
        const world = structuredClone(initial);
        const reducers = getReducers();
        const ctx = createContext(frame);

        // Get and apply events up to frame
        const relevantEvents = getEventsUpTo(events, frame);

        for (const event of relevantEvents) {
            routeEvent(world, event, reducers, ctx);
        }

        return world;
    };

    return {
        plugins,
        actors,
        fps,
        validation,
        episodeId,
        buildWorld,
        getEventsUpTo,
        getReducers,
        createContext,
    };
}

// =============================================================================
// REPLAY CACHE (Performance optimization)
// =============================================================================

/**
 * Checkpoint for replay cache.
 */
export interface Checkpoint {
    readonly frame: number;
    readonly world: WorldState;
}

/**
 * Replay cache for efficient world building.
 */
export interface ReplayCache {
    readonly checkpoints: Map<number, Checkpoint>;
    readonly interval: number;
}

/**
 * Create a replay cache.
 *
 * @param interval - Checkpoint every N frames (default 30)
 */
export function createReplayCache(interval = 30): ReplayCache {
    return {
        checkpoints: new Map(),
        interval,
    };
}

/**
 * Build world at frame using replay cache.
 */
export function buildWorldCached(
    engine: TokovoEngine,
    initial: WorldState,
    events: CanonicalRuntimeEvent[],
    targetFrame: number,
    cache: ReplayCache
): WorldState {
    // Find nearest checkpoint before target
    let startFrame = 0;
    let world = initial;

    for (const [frame, checkpoint] of cache.checkpoints) {
        if (frame <= targetFrame && frame > startFrame) {
            startFrame = frame;
            world = checkpoint.world;
        }
    }

    // Get events between checkpoint and target
    const relevantEvents = events.filter(
        (e) => e.at > startFrame && e.at <= targetFrame
    );

    // Sort deterministically
    const sorted = sortEventsDeterministic(relevantEvents);

    // Replay from checkpoint
    const reducers = engine.getReducers();
    const ctx = engine.createContext(targetFrame);
    const newWorld = structuredClone(world);

    for (const event of sorted) {
        routeEvent(newWorld, event, reducers, ctx);

        // Save checkpoint if at interval
        if (event.at % cache.interval === 0 && !cache.checkpoints.has(event.at)) {
            cache.checkpoints.set(event.at, {
                frame: event.at,
                world: structuredClone(newWorld),
            });
        }
    }

    return newWorld;
}
