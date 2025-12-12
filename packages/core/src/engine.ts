import { produce } from "immer";
import {
    TimelineEvent,
    WorldState,
    DeviceState,
    CameraState,
    ActiveCameraEffect,
    DEFAULT_CAMERA_STATE,
    DEFAULT_CAMERA_TRANSFORM,
} from "./types";
import { CameraController, createActiveEffect } from "./camera";

export type DeviceReducer = (state: Record<string, DeviceState>, event: TimelineEvent) => Record<string, DeviceState>;
export type AppReducer = (draft: WorldState, event: TimelineEvent) => void;

export const ReducerRegistry = {
    deviceReducer: null as DeviceReducer | null,
    appReducers: {} as Record<string, AppReducer>,

    registerDeviceReducer(reducer: DeviceReducer) {
        this.deviceReducer = reducer;
    },
    registerAppReducer(appId: string, reducer: AppReducer) {
        this.appReducers[appId] = reducer;
    }
};

// Camera controller instance
const cameraController = new CameraController(30);

/**
 * Process camera event and update camera state
 */
function processCameraEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "CAMERA" },
    eventIndex: number
): void {
    // Ensure camera state exists
    if (!draft.camera || !draft.camera.activeEffects) {
        draft.camera = { ...DEFAULT_CAMERA_STATE };
    }

    switch (event.type) {
        case "SET_VIEW":
            // Legacy support - just update base view
            draft.camera.baseView = event.view.type;
            draft.camera.appId = event.view.appId;
            break;

        case "CUT":
            // Hard cut - reset all effects and update view
            draft.camera.activeEffects = [];
            draft.camera.transform = { ...DEFAULT_CAMERA_TRANSFORM };
            if (event.toView) {
                draft.camera.baseView = event.toView === "app" ? "APP_VIEW" : "TRANSITION";
            }
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
 * Replay function - computes WorldState at time t by applying all events
 * 
 * This is called every frame by Remotion. Performance is critical.
 */
export function replay(initial: WorldState, events: TimelineEvent[], t: number): WorldState {
    // Ensure initial state has proper camera state
    const initialWithCamera: WorldState = {
        ...initial,
        camera: initial.camera && 'activeEffects' in initial.camera
            ? initial.camera
            : {
                ...DEFAULT_CAMERA_STATE,
                baseView: (initial.camera as any)?.type || "APP_VIEW",
                appId: (initial.camera as any)?.appId,
            }
    };

    // Filter events up to current time
    const relevant = events.filter(e => e.at <= t);

    // Apply events to build state
    const stateAfterEvents = relevant.reduce((state, event, index) => {
        return produce(state, draft => {
            if (event.kind === "DEVICE") {
                if (ReducerRegistry.deviceReducer) {
                    draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
                }
            }
            if (event.kind === "APP") {
                const reducer = ReducerRegistry.appReducers[event.appId];
                reducer?.(draft, event);
            }
            if (event.kind === "CAMERA") {
                processCameraEvent(draft, event, index);
            }
        });
    }, initialWithCamera);

    // Compute camera transform at current time t
    // This filters active effects and composes them
    return produce(stateAfterEvents, draft => {
        // Clean up expired effects (optimization)
        draft.camera.activeEffects = draft.camera.activeEffects.filter(
            ae => t <= ae.endFrame + 30 // Keep for 1 second after end for smooth transitions
        );

        // Compute final transform
        draft.camera.transform = cameraController.computeTransform(draft.camera, t);
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
        ...partial,
    };
}

