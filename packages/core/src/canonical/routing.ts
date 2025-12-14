/**
 * Typed Reducer Routing
 *
 * Reducers should only receive events they care about.
 * The engine routes events to typed reducers based on `kind`.
 *
 * This prevents:
 * - Giant switches on irrelevant events
 * - Forgotten type guards
 * - Runtime errors from unexpected event types
 *
 * @module @tokovo/core/canonical/routing
 */

import type { AppRuntimeEvent } from "./events";
import type {
    CanonicalRuntimeEvent,
    DeviceRuntimeEvent,
    OSRuntimeEvent,
    CameraRuntimeEvent,
    AudioRuntimeEvent,
    CallRuntimeEvent,
    TouchRuntimeEvent,
} from "./device-events";
import type { ActorRegistry } from "./identity";

// =============================================================================
// REDUCER CONTEXT
// =============================================================================

/**
 * Context passed to all reducers.
 */
export interface ReducerContext {
    /** Actor registry for resolving ActorId → ActorRef */
    readonly actors: ActorRegistry;
    /** Current frame number */
    readonly frame: number;
    /** Episode ID */
    readonly episodeId: string;
    /** FPS for timing calculations */
    readonly fps: number;
}

// =============================================================================
// WORLD STATE (minimal contract)
// =============================================================================

/**
 * Minimal world state interface.
 *
 * Core only defines the shape. Apps extend with their own state.
 * This is intentionally minimal to avoid app-specific semantics in core.
 */
export interface WorldState {
    /** Device states keyed by deviceId */
    readonly devices: Record<string, DeviceState>;
    /** App states keyed by appId */
    readonly appState: Record<string, unknown>;
    /** Conversation states keyed by conversationId (for messaging apps) */
    readonly conversations?: Record<string, unknown>;
    /** Camera state */
    readonly camera?: CameraState;
    /** Audio state */
    readonly audio?: AudioState;
    /** Active call state */
    readonly call?: unknown;
}

/**
 * Minimal device state.
 */
export interface DeviceState {
    readonly deviceId: string;
    readonly isLocked: boolean;
    readonly activeAppId?: string;
    readonly time?: string | number;
    readonly battery?: number;
    readonly network?: string;
}

/**
 * Camera state for effects.
 */
export interface CameraState {
    readonly scale: number;
    readonly translateX: number;
    readonly translateY: number;
    readonly rotation: number;
    readonly shake?: {
        readonly intensity: number;
        readonly frequency: number;
        readonly seed: number;
    };
    readonly layout: "SINGLE" | "SPLIT" | "PIP";
    readonly primaryDeviceId: string;
    readonly secondaryDeviceId?: string;
}

/**
 * Audio state.
 */
export interface AudioState {
    readonly playing: Record<string, PlayingSound>;
    readonly musicId?: string;
    readonly musicVolume?: number;
}

export interface PlayingSound {
    readonly soundId: string;
    readonly volume: number;
    readonly loop: boolean;
    readonly startFrame: number;
    readonly duration?: number;
}

// =============================================================================
// TYPED REDUCERS
// =============================================================================

/**
 * App reducer - only receives APP events.
 */
export type AppReducer<TAppState = unknown> = (
    world: WorldState,
    event: AppRuntimeEvent,
    ctx: ReducerContext
) => void;

/**
 * Device reducer - only receives DEVICE events.
 */
export type DeviceReducer = (
    world: WorldState,
    event: DeviceRuntimeEvent,
    ctx: ReducerContext
) => void;

/**
 * OS reducer - only receives OS events.
 */
export type OSReducer = (
    world: WorldState,
    event: OSRuntimeEvent,
    ctx: ReducerContext
) => void;

/**
 * Camera reducer - only receives CAMERA events.
 */
export type CameraReducer = (
    world: WorldState,
    event: CameraRuntimeEvent,
    ctx: ReducerContext
) => void;

/**
 * Audio reducer - only receives AUDIO events.
 */
export type AudioReducer = (
    world: WorldState,
    event: AudioRuntimeEvent,
    ctx: ReducerContext
) => void;

/**
 * Call reducer - only receives CALL events.
 */
export type CallReducer = (
    world: WorldState,
    event: CallRuntimeEvent,
    ctx: ReducerContext
) => void;

/**
 * Touch reducer - only receives TOUCH events.
 */
export type TouchReducer = (
    world: WorldState,
    event: TouchRuntimeEvent,
    ctx: ReducerContext
) => void;

// =============================================================================
// REDUCER SET
// =============================================================================

/**
 * Complete set of reducers.
 *
 * Engine uses this to route events to correct handlers.
 */
export interface ReducerSet {
    /** App reducers keyed by appId */
    readonly app?: Record<string, AppReducer>;
    readonly device?: DeviceReducer;
    readonly os?: OSReducer;
    readonly camera?: CameraReducer;
    readonly audio?: AudioReducer;
    readonly call?: CallReducer;
    readonly touch?: TouchReducer;
}

// =============================================================================
// EVENT ROUTING
// =============================================================================

/**
 * Route an event to the correct reducer based on `kind`.
 *
 * TypeScript enforces: each reducer only receives its event type.
 *
 * @example
 * ```ts
 * const reducers: ReducerSet = {
 *   app: {
 *     app_whatsapp: whatsappReducer,
 *     app_instagram: instagramReducer,
 *   },
 *   device: deviceReducer,
 *   camera: cameraReducer,
 * };
 *
 * routeEvent(world, event, reducers, ctx);
 * ```
 */
export function routeEvent(
    world: WorldState,
    event: CanonicalRuntimeEvent,
    reducers: ReducerSet,
    ctx: ReducerContext
): void {
    switch (event.kind) {
        case "APP": {
            const appReducer = reducers.app?.[event.appId];
            if (appReducer) {
                appReducer(world, event, ctx);
            }
            break;
        }

        case "DEVICE":
            reducers.device?.(world, event, ctx);
            break;

        case "OS":
            reducers.os?.(world, event, ctx);
            break;

        case "CAMERA":
            reducers.camera?.(world, event, ctx);
            break;

        case "AUDIO":
            reducers.audio?.(world, event, ctx);
            break;

        case "CALL":
            reducers.call?.(world, event, ctx);
            break;

        case "TOUCH":
            reducers.touch?.(world, event, ctx);
            break;
    }
}

/**
 * Route multiple events (sorted order assumed).
 */
export function routeEvents(
    world: WorldState,
    events: ReadonlyArray<CanonicalRuntimeEvent>,
    reducers: ReducerSet,
    ctx: ReducerContext
): void {
    for (const event of events) {
        if (event.at <= ctx.frame) {
            routeEvent(world, event, reducers, ctx);
        }
    }
}

// =============================================================================
// DEFAULT REDUCERS
// =============================================================================

/**
 * Default device reducer.
 */
export const defaultDeviceReducer: DeviceReducer = (world, event, _ctx) => {
    const device = world.devices[event.deviceId];
    if (!device) return;

    switch (event.type) {
        case "LOCK":
            (device as any).isLocked = true;
            break;
        case "UNLOCK":
            (device as any).isLocked = false;
            break;
        case "OPEN_APP":
            (device as any).activeAppId = event.appId;
            break;
        case "CLOSE_APP":
            (device as any).activeAppId = undefined;
            break;
        case "GO_HOME":
            (device as any).activeAppId = undefined;
            break;
    }
};

/**
 * Default OS reducer.
 */
export const defaultOSReducer: OSReducer = (world, event, _ctx) => {
    const device = world.devices[event.deviceId];
    if (!device) return;

    switch (event.type) {
        case "SET_TIME":
            (device as any).time = event.time;
            break;
        case "SET_BATTERY":
            (device as any).battery = event.level;
            break;
        case "SET_NETWORK":
            (device as any).network = event.network;
            break;
    }
};

/**
 * Default camera reducer.
 */
export const defaultCameraReducer: CameraReducer = (world, event, _ctx) => {
    if (!world.camera) return;

    switch (event.type) {
        case "ZOOM":
            (world.camera as any).scale = event.scale;
            break;
        case "PAN":
            (world.camera as any).translateX = event.translateX;
            (world.camera as any).translateY = event.translateY;
            break;
        case "SHAKE":
            (world.camera as any).shake = {
                intensity: event.intensity,
                frequency: event.frequency,
                seed: event.seed ?? 0,
            };
            break;
        case "RESET":
            (world.camera as any).scale = 1;
            (world.camera as any).translateX = 0;
            (world.camera as any).translateY = 0;
            (world.camera as any).shake = undefined;
            break;
        case "LAYOUT":
            (world.camera as any).layout = event.mode;
            (world.camera as any).primaryDeviceId = event.primaryDeviceId;
            (world.camera as any).secondaryDeviceId = event.secondaryDeviceId;
            break;
    }
};
