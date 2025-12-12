import { produce } from "immer";
import {
    TimelineEvent,
    WorldState,
    DeviceState,
    CameraState,
    ActiveCameraEffect,
    DEFAULT_CAMERA_STATE,
    DEFAULT_CAMERA_TRANSFORM,
    DEFAULT_AUDIO_STATE,
} from "./types";
import { CameraController, createActiveEffect } from "./camera";
import { TIMING } from "./constants";

export type DeviceReducer = (state: Record<string, DeviceState>, event: TimelineEvent) => Record<string, DeviceState>;
export type AppReducer = (draft: WorldState, event: TimelineEvent) => void;

/**
 * ReducerRegistry - Manages app and device reducers
 * 
 * This registry allows apps to self-register their event handlers.
 * The engine dispatches events to the appropriate registered reducers.
 */
class ReducerRegistryClass {
    private _deviceReducer: DeviceReducer | null = null;
    private _appReducers = new Map<string, AppReducer>();

    /**
     * Register a device reducer (handles DEVICE events)
     */
    registerDeviceReducer(reducer: DeviceReducer): void {
        this._deviceReducer = reducer;
    }

    /**
     * Register an app reducer (handles APP events for a specific appId)
     */
    registerAppReducer(appId: string, reducer: AppReducer): void {
        if (this._appReducers.has(appId)) {
            console.warn(`[ReducerRegistry] Overwriting reducer for ${appId}`);
        }
        this._appReducers.set(appId, reducer);
    }

    /**
     * Get the device reducer
     */
    get deviceReducer(): DeviceReducer | null {
        return this._deviceReducer;
    }

    /**
     * Get an app reducer by appId
     */
    getAppReducer(appId: string): AppReducer | undefined {
        return this._appReducers.get(appId);
    }

    /**
     * Check if an app reducer is registered
     */
    hasAppReducer(appId: string): boolean {
        return this._appReducers.has(appId);
    }

    /**
     * Get all registered app IDs
     */
    getRegisteredApps(): string[] {
        return Array.from(this._appReducers.keys());
    }

    // Legacy compatibility - access appReducers as object
    get appReducers(): Record<string, AppReducer> {
        return Object.fromEntries(this._appReducers);
    }
}

export const ReducerRegistry = new ReducerRegistryClass();

// Camera controller instance - uses FPS from constants
const cameraController = new CameraController(TIMING.FPS_DEFAULT);

/**
 * Process camera event and update camera state
 */
function processCameraEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "CAMERA" },
    eventIndex: number
): void {
    // Ensure camera state exists with all required properties
    if (!draft.camera || !draft.camera.activeEffects) {
        draft.camera = { ...DEFAULT_CAMERA_STATE };
    }
    // Ensure layout exists
    if (!draft.camera.layout) {
        draft.camera.layout = { mode: "SINGLE", primaryDeviceId: draft.camera.activeDeviceId || Object.keys(draft.devices)[0] || "main_phone" };
    }

    switch (event.type) {
        case "SET_VIEW":
            // Legacy support - just update base view
            draft.camera.baseView = event.view.type;
            draft.camera.appId = event.view.appId;
            break;

        case "CUT":
            // Hard cut - reset all effects
            draft.camera.activeEffects = [];
            draft.camera.transform = { ...DEFAULT_CAMERA_TRANSFORM };

            // Switch to new device if specified
            if (event.toDeviceId) {
                draft.camera.activeDeviceId = event.toDeviceId;
                draft.camera.layout.primaryDeviceId = event.toDeviceId;
            }

            // Update base view if specified
            if (event.toView) {
                draft.camera.baseView = event.toView === "app" ? "APP_VIEW" : "TRANSITION";
            }
            break;

        case "LAYOUT":
            // Change view layout mode
            draft.camera.layout = {
                mode: event.mode,
                primaryDeviceId: event.primaryDeviceId,
                secondaryDeviceId: event.secondaryDeviceId,
                pipPosition: event.pipPosition,
                pipScale: event.pipScale,
            };
            // Update active device to match primary
            draft.camera.activeDeviceId = event.primaryDeviceId;
            break;

        case "ZOOM":
        case "PAN":
        case "SHAKE":
        case "FOCUS":
        case "RESET": {
            // Create active effect and add to list
            const activeEffect = createActiveEffect(event, `effect_${eventIndex}_${event.at}`);
            if (activeEffect) {
                draft.camera.activeEffects.push(activeEffect);
            }
            break;
        }
    }
}

/**
 * Process audio event and update audio state
 */
function processAudioEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "AUDIO" },
    eventIndex: number
): void {
    // Ensure audio state exists
    if (!draft.audio) {
        draft.audio = { activeSounds: {} };
    }

    switch (event.type) {
        case "PLAY_SOUND": {
            // Generate instance ID if not provided
            const instanceId = event.instanceId || `sound_${eventIndex}_${event.at}`;

            draft.audio.activeSounds[instanceId] = {
                soundId: event.soundId,
                startFrame: event.at,
                volume: event.volume ?? 1,
                loop: event.loop ?? false,
                deviceId: event.deviceId,
                duration: event.duration,
            };
            break;
        }

        case "STOP_SOUND": {
            delete draft.audio.activeSounds[event.instanceId];
            break;
        }

        case "FADE_VOLUME": {
            const sound = draft.audio.activeSounds[event.instanceId];
            if (sound) {
                // Store target volume - renderer will interpolate
                (sound as any).fadeTarget = event.toVolume;
                (sound as any).fadeDuration = event.duration;
                (sound as any).fadeStartFrame = event.at;
            }
            break;
        }

        case "BACKGROUND_MUSIC": {
            draft.audio.backgroundMusic = {
                soundId: event.soundId,
                volume: event.volume ?? 0.5,
                loop: event.loop ?? true,
                startFrame: event.at,
            };
            break;
        }
    }
}
/**
 * Replay function - computes WorldState at time t by applying all events
 * 
 * This is called every frame by Remotion. Performance is critical.
 */
export function replay(initial: WorldState, events: TimelineEvent[], t: number): WorldState {
    if (!initial) {
        console.warn("[Engine] Replay called with undefined initial state");
        return {
            devices: {},
            conversations: {},
            appState: {},
            camera: { ...DEFAULT_CAMERA_STATE },
            audio: { ...DEFAULT_AUDIO_STATE }
        };
    }

    // Ensure initial state has proper camera and audio state
    const initialWithCamera: WorldState = {
        ...initial,
        camera: initial.camera && 'activeEffects' in initial.camera
            ? initial.camera
            : {
                ...DEFAULT_CAMERA_STATE,
                baseView: (initial.camera as any)?.type || "APP_VIEW",
                appId: (initial.camera as any)?.appId,
            },
        audio: initial.audio || { ...DEFAULT_AUDIO_STATE },
    };

    // Filter events up to current time
    const relevant = events.filter(e => e.at <= t);

    // Event handlers by kind (Strategy Pattern)
    const handleEvent = (draft: WorldState, event: TimelineEvent, index: number): void => {
        switch (event.kind) {
            case "DEVICE":
                if (ReducerRegistry.deviceReducer) {
                    draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
                }
                break;
            case "APP":
                const reducer = ReducerRegistry.getAppReducer(event.appId);
                reducer?.(draft, event);
                break;
            case "CAMERA":
                processCameraEvent(draft, event, index);
                break;
            case "AUDIO":
                processAudioEvent(draft, event, index);
                break;
        }
    };

    // Apply events to build state
    const stateAfterEvents = relevant.reduce((state, event, index) => {
        return produce(state, draft => {
            handleEvent(draft, event, index);
        });
    }, initialWithCamera);

    // Compute camera transform at current time t
    // This filters active effects and composes them, per-device
    return produce(stateAfterEvents, draft => {
        // Clean up expired effects (optimization) - use constant
        draft.camera.activeEffects = draft.camera.activeEffects.filter(
            ae => t <= ae.endFrame + TIMING.EFFECT_CLEANUP_BUFFER
        );

        // Ensure deviceTransforms exists
        if (!draft.camera.deviceTransforms) {
            draft.camera.deviceTransforms = {};
        }

        // Compute transform for each device
        for (const deviceId of Object.keys(draft.devices)) {
            // Filter effects for this device (global effects + device-specific)
            const deviceEffects = draft.camera.activeEffects.filter(
                ae => !ae.deviceId || ae.deviceId === deviceId
            );

            // Create a temporary camera state with only this device's effects
            const deviceCameraState = {
                ...draft.camera,
                activeEffects: deviceEffects,
            };

            // Compute transform for this device
            draft.camera.deviceTransforms[deviceId] = cameraController.computeTransform(deviceCameraState, t);
        }

        // Primary device transform (for backward compatibility)
        const activeDeviceId = draft.camera.activeDeviceId || Object.keys(draft.devices)[0];
        draft.camera.transform = draft.camera.deviceTransforms[activeDeviceId] || cameraController.computeTransform(draft.camera, t);
    });
}

/**
 * Get default initial world state with camera
 */
export function createInitialWorld(partial: Partial<WorldState> = {}): WorldState {
    return {
        devices: {},
        conversations: {},
        appState: {},
        camera: { ...DEFAULT_CAMERA_STATE },
        audio: { ...DEFAULT_AUDIO_STATE },
        ...partial,
    };
}

