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
    DEFAULT_OS_STATE,
    NotificationInstance
} from "./types";
import { CameraController, createActiveEffect } from "./camera";
import { TIMING } from "./constants";
import { AppMetadataRegistry } from "./app-metadata";

export type DeviceReducer = (state: Record<string, DeviceState>, event: TimelineEvent) => Record<string, DeviceState>;
export type AppReducer = (draft: WorldState, event: TimelineEvent) => void;
export type FeatureReducer = (draft: WorldState, event: TimelineEvent, index: number) => void;

/**
 * ReducerRegistry - Manages app and device reducers
 * 
 * This registry allows apps to self-register their event handlers.
 * The engine dispatches events to the appropriate registered reducers.
 */
class ReducerRegistryClass {
    private _deviceReducer: DeviceReducer | null = null;
    private _appReducers = new Map<string, AppReducer>();
    private _featureReducers = new Map<string, FeatureReducer>();

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
     * Register a generic feature reducer (handles specific event kinds like KEYBOARD, AUDIO)
     */
    registerFeatureReducer(kind: string, reducer: FeatureReducer): void {
        this._featureReducers.set(kind, reducer);
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
     * Get a feature reducer by kind
     */
    getFeatureReducer(kind: string): FeatureReducer | undefined {
        return this._featureReducers.get(kind);
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
            draft.camera.baseView = (event as any).view.type;
            draft.camera.appId = (event as any).view.appId;
            break;

        case "CUT":
            // Hard cut - reset all effects
            draft.camera.activeEffects = [];
            draft.camera.transform = { ...DEFAULT_CAMERA_TRANSFORM };

            // Switch to new device if specified
            if ((event as any).toDeviceId) {
                draft.camera.activeDeviceId = (event as any).toDeviceId;
                draft.camera.layout.primaryDeviceId = (event as any).toDeviceId;
            }

            // Update base view if specified
            if ((event as any).toView) {
                draft.camera.baseView = (event as any).toView === "app" ? "APP_VIEW" : "TRANSITION";
            }
            break;

        case "LAYOUT":
            // Change view layout mode
            draft.camera.layout = {
                mode: (event as any).mode,
                primaryDeviceId: (event as any).primaryDeviceId,
                secondaryDeviceId: (event as any).secondaryDeviceId,
                pipPosition: (event as any).pipPosition,
                pipScale: (event as any).pipScale,
            };
            // Update active device to match primary
            draft.camera.activeDeviceId = (event as any).primaryDeviceId;
            break;

        case "ZOOM":
        case "PAN":
        case "SHAKE":
        case "FOCUS":
        case "ANCHOR_FOCUS":
        case "ANCHOR_TRACK":
        case "RESET": {
            // Create active effect and add to list
            const activeEffect = createActiveEffect(event as any, `effect_${eventIndex}_${event.at}`);
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
        draft.audio = {
            activeSounds: {},
            buses: {
                music: { baseGain: 0.5, maxConcurrent: 1 },
                ui: { baseGain: 0.7, maxConcurrent: 5 },
                sfx: { baseGain: 1, maxConcurrent: 8 },
                voice: { baseGain: 1, maxConcurrent: 2 },
            },
        };
    }

    switch (event.type) {
        case "PLAY_SOUND": {
            // Generate instance ID if not provided
            const instanceId = (event as any).instanceId || `sound_${eventIndex}_${event.at}`;

            draft.audio.activeSounds[instanceId] = {
                soundId: (event as any).soundId,
                startFrame: event.at,
                volume: (event as any).volume ?? 1,
                loop: (event as any).loop ?? false,
                deviceId: (event as any).deviceId,
                duration: (event as any).duration,
            };
            break;
        }

        case "STOP_SOUND": {
            delete draft.audio.activeSounds[(event as any).instanceId];
            break;
        }

        case "FADE_VOLUME": {
            const sound = draft.audio.activeSounds[(event as any).instanceId];
            if (sound) {
                // Store target volume - renderer will interpolate
                (sound as any).fadeTarget = (event as any).toVolume;
                (sound as any).fadeDuration = (event as any).duration;
                (sound as any).fadeStartFrame = event.at;
            }
            break;
        }

        case "BACKGROUND_MUSIC": {
            draft.audio.backgroundMusic = {
                soundId: (event as any).soundId,
                volume: (event as any).volume ?? 0.5,
                loop: (event as any).loop ?? true,
                startFrame: event.at,
            };
            break;
        }
    }
}

// Import AutoSound derivation
import { deriveAudioInstructions, AutoSoundRegistry } from "./audio/auto-sound";

/**
 * Handle AutoSound derivation from any event type
 */
export function handleAutoSounds(
    draft: WorldState,
    event: TimelineEvent,
    eventIndex: number
): void {
    // Ensure audio state exists
    if (!draft.audio) {
        draft.audio = {
            activeSounds: {},
            buses: {
                music: { baseGain: 0.5, maxConcurrent: 1 },
                ui: { baseGain: 0.7, maxConcurrent: 5 },
                sfx: { baseGain: 1, maxConcurrent: 8 },
                voice: { baseGain: 1, maxConcurrent: 2 },
            },
        };
    }

    // OPTIMIZATION: Only fetch rules relevant to this event kind
    const rules = AutoSoundRegistry.getRulesForKind(event.kind);
    // Log periodically to debug
    if (Math.random() < 0.001) {
        console.log("[Engine] handleAutoSounds active. Rules count:", rules.length);
    }

    // We pass the rules explicitly to ensure we are using the latest registry state
    const instructions = deriveAudioInstructions(event, rules);

    for (const instruction of instructions) {
        const instanceId = instruction.instanceId || `auto_${eventIndex}_${event.at}`;

        if (instruction.action === "PLAY_ONE_SHOT" || instruction.action === "START_LOOP") {
            if (instruction.cue && instruction.soundId) {
                draft.audio.activeSounds[instanceId] = {
                    soundId: instruction.soundId,
                    startFrame: event.at,
                    volume: instruction.cue.volume,
                    loop: instruction.cue.loop ?? false,
                    deviceId: instruction.cue.deviceId,
                    duration: instruction.cue.duration,
                    bus: instruction.cue.bus as any,
                } as any;
            }
        } else if (instruction.action === "STOP_SOUND") {
            if (instruction.instanceId) {
                delete draft.audio.activeSounds[instruction.instanceId];
            }
        }
    }
}



/**
 * Helper to push input changes to the active app
 */
function injectInputToApp(draft: WorldState, appId: string | undefined, text: string, at: number) {
    if (!appId) return;
    const reducer = ReducerRegistry.getAppReducer(appId);
    if (reducer) {
        reducer(draft, { // Use legacy event format expected by apps
            kind: "APP",
            type: "INPUT_CHANGE",
            appId,
            payload: { text },
            at
        } as any);
    }
}

/**
 * Process OS event and update device OS state
 */
function processOSEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "OS" }
): void {
    // OS events target a specific device or all devices
    const deviceId = (event as any).deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    // Initialize OS state if needed
    if (!device.os) {
        device.os = {
            clock: Date.now(),
            battery: 85,
            charging: false,
            network: "wifi",
            wifiStrength: 3,
            cellStrength: 4,
            dnd: false,
            lowPowerMode: false,
            airplaneMode: false,
            notifications: [],
            notificationHistory: [],
        };
    }

    switch (event.type) {
        case "SET_TIME":
            device.os.clock = event.time ?? Date.now();
            break;

        case "SET_BATTERY":
            device.os.battery = Math.max(0, Math.min(100, event.level ?? 100));
            if ((event as any).charging !== undefined) {
                device.os.charging = (event as any).charging;
            }
            break;

        case "DRAIN_BATTERY":
            // Rate is % per second at 30fps
            const drain = ((event as any).rate ?? 0) / 30;
            device.os.battery = Math.max(0, device.os.battery - drain);
            break;

        case "SET_NETWORK":
            device.os.network = (event.network ?? "wifi") as any;
            if ((event as any).strength !== undefined) {
                if (event.network === "wifi") {
                    device.os.wifiStrength = (event as any).strength;
                } else {
                    device.os.cellStrength = (event as any).strength;
                }
            }
            break;

        case "SET_DND":
            device.os.dnd = event.enabled ?? false;
            break;

        case "SET_LOW_POWER":
            device.os.lowPowerMode = (event as any).enabled ?? false;
            break;

            break;
    }
}

/**
 * Process notification event and update device notifications
 */
function processNotificationEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "DEVICE" },
    t: number
): void {
    const e = event as any;
    const deviceId = e.deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    // Ensure OS/Notification state exists
    if (!device.os) {
        // ... (initialize OS logic from processOSEvent if needed, 
        // but ideally processOSEvent handles initialization. 
        // We'll trust processOSEvent runs or init here defensively)
        device.os = {
            clock: Date.now(), battery: 100, charging: false, network: "wifi",
            wifiStrength: 3, cellStrength: 4, dnd: false, lowPowerMode: false, airplaneMode: false,
            notifications: [], notificationHistory: []
        };
    }
    if (!device.os.notifications) device.os.notifications = [];
    if (!device.os.notificationHistory) device.os.notificationHistory = [];

    switch (event.type) {
        case "SHOW_NOTIFICATION":
            // Resolve Metadata for defaults
            const meta = AppMetadataRegistry.get(e.appId);

            // IR to Instance Transformation
            const instance: import("./types").NotificationInstance = {
                id: e.id,
                ir: {
                    id: e.id,
                    appId: e.appId,
                    title: e.title || meta.displayName || e.appId,
                    body: e.body,
                    icon: e.icon || (meta.icon as string),
                    category: e.category,
                    threadKey: e.threadKey,
                    groupKey: e.groupKey,
                    actions: e.actions,
                    replyable: e.replyable,
                },
                state: "headsUp", // Default state
                createdAtFrame: event.at,
                // Timestamps
                shownAtFrame: event.at,
                // State properties
                deviceId,
                importance: e.priority || "default",
                mode: e.mode || "headsup",
            };

            // Two-Layer Policy Check (Engine Layer)
            if (device.os.dnd && instance.importance !== "critical") {
                instance.state = "queued"; // Or silent
                // But for now we just add it. The Renderer decides visibility based on state.
            }

            device.os.notifications.push(instance);
            break;

        case "DISMISS_NOTIFICATION":
            const notif = device.os.notifications.find(n => n.id === e.notificationId);
            if (notif) {
                notif.state = "dismissed";
                notif.dismissedAtFrame = event.at;

                // Move to history after animation (simplified here)
                // In real engine, we might clean up later.
            }
            break;

        case "TAP_NOTIFICATION":
            // Interaction Logic
            // 1. Mark as clicked
            // 2. Open App (Engine Side Effect)
            const targetNotif = device.os.notifications.find(n => n.id === e.notificationId);
            if (targetNotif) {
                // Open the app associated with the notification
                device.foregroundAppId = targetNotif.ir.appId;

                // If locking logic exists, unlock device
                device.isLocked = false;
            }
            break;

        case "CLEAR_ALL_NOTIFICATIONS":
            device.os.notifications.forEach(n => {
                n.state = "dismissed";
                n.dismissedAtFrame = event.at;
            });
            break;
    }
}

/**
 * Process call event and update device call state
 */
function processCallEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "CALL" }
): void {
    const e = event as any;
    const deviceId = e.deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    switch (event.type) {
        case "INCOMING":
            device.call = {
                status: "incoming",
                callerId: e.callerId,
                callerName: e.callerName,
                callerAvatar: e.callerAvatar,
                isVideo: e.isVideo ?? false,
                callType: e.callType ?? "voice",
                displayMode: e.displayMode ?? "fullscreen",
                callerMetadata: e.callerMetadata,
                startedAt: event.at,
            };
            break;

        case "ANSWER":
            if (device.call) {
                device.call.status = "active";
                device.call.answeredAt = event.at;
            }
            break;

        case "DECLINE":
            if (device.call) {
                device.call.status = "declined";
                device.call.endedAt = event.at;
            }
            break;

        case "END":
            if (device.call) {
                device.call.status = "ended";
                device.call.endedAt = event.at;
            }
            break;

        case "TOGGLE_MUTE":
            if (device.call) {
                device.call.isMuted = !device.call.isMuted;
            }
            break;

        case "TOGGLE_SPEAKER":
            if (device.call) {
                device.call.isSpeakerOn = !device.call.isSpeakerOn;
            }
            break;

        case "TOGGLE_HOLD":
            if (device.call) {
                device.call.isOnHold = !device.call.isOnHold;
            }
            break;
    }
}

/**
 * Process touch event and update world touches state
 */
function processTouchEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "TOUCH" },
    t: number
): void {
    // Initialize touches array if needed
    if (!draft.touches) {
        draft.touches = [];
    }

    // Remove expired touches (older than 15 frames)
    draft.touches = draft.touches.filter(touch => t - touch.startedAt < 15);

    const touchId = `touch_${event.at}_${Math.random().toString(36).slice(2, 6)}`;

    switch (event.type) {
        case "TAP":
            draft.touches.push({
                id: touchId,
                x: event.x ?? 0,
                y: event.y ?? 0,
                startedAt: event.at,
                type: "tap",
            });
            break;

        case "LONG_PRESS":
            draft.touches.push({
                id: touchId,
                x: event.x ?? 0,
                y: event.y ?? 0,
                startedAt: event.at,
                type: "long_press",
            });
            break;

        case "DRAG":
            draft.touches.push({
                id: touchId,
                x: (event as any).startX ?? 0,
                y: (event as any).startY ?? 0,
                startedAt: event.at,
                type: "drag",
                endX: (event as any).endX ?? 0,
                endY: (event as any).endY ?? 0,
            });
            break;
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
        // === V2 NATIVE HANDLERS (@tokovo/ir) ===
        if (event.kind === "MessageReceived") {
            const e = event as import("@tokovo/ir").MessageReceivedOp;
            const reducer = ReducerRegistry.getAppReducer(e.appId);

            // 1. Run App Logic (Update internal state, add message to chat)
            const legacyEvent: any = {
                at: e.at,
                kind: "APP",
                type: "MESSAGE_RECEIVED",
                appId: e.appId,
                conversationId: e.conversationId,
                from: e.message.from,
                text: e.message.text,
                message: e.message
            };
            reducer?.(draft, legacyEvent);

            // 2. Run OS Notification Logic (Implicit Creation)
            // Default to primary device if not specified (IR definition gap, assuming primary for now)
            const deviceId = "primary";
            const device = draft.devices[deviceId] || draft.devices[Object.keys(draft.devices)[0]];

            if (device) {
                // Policy Check: Don't notify if user is IN this app
                const isForeground = device.foregroundAppId === e.appId;

                // Also check DND (OS Level)
                const isDND = device.os?.dnd;

                if (!isForeground && !isDND) {
                    // Create Notification
                    if (!device.os) device.os = { ...DEFAULT_OS_STATE, notifications: [] };
                    if (!device.os.notifications) device.os.notifications = [];

                    // Resolve Metadata for nice Title
                    const meta = AppMetadataRegistry.get(e.appId);

                    // Identify Sender Name
                    // If message is from someone specific (not "me"), use their name.
                    // Otherwise fallback to app name.
                    const fromName = e.message.from === "me" ? null : e.message.from;
                    const title = fromName || meta.displayName || e.appId;

                    const notification: NotificationInstance = {
                        id: `auto_notif_${e.at}_${e.appId}`,
                        ir: {
                            id: `auto_notif_${e.at}_${e.appId}`,
                            appId: e.appId,
                            title: title,
                            body: e.message.text || "New Image",
                            icon: meta.icon as string, // Use app icon (Strategy will upgrade to Avatar if we had a contact registry)
                            category: "message",
                            threadKey: e.conversationId,
                        },
                        state: "headsUp",
                        createdAtFrame: e.at,
                        shownAtFrame: e.at,
                        deviceId: device.id,
                        importance: "default",
                        mode: "headsup"
                    };

                    device.os.notifications.push(notification);
                }
            }
            // return; // AutoSound runs after

        }

        if (event.kind === "MessageSent") {
            const e = event as import("@tokovo/ir").MessageSentOp;
            const reducer = ReducerRegistry.getAppReducer(e.appId);
            const legacyEvent: any = {
                at: e.at,
                kind: "APP",
                type: "MESSAGE_SENT", // CORRECTED: Distinguish Sent from Received
                appId: e.appId,
                conversationId: e.conversationId,
                from: "me",
                text: e.message.text,
                message: { ...e.message, from: "me" }
            };
            reducer?.(draft, legacyEvent);
            // return; // AutoSound runs after

        }

        if (event.kind === "TypingStarted") {
            const e = event as import("@tokovo/ir").TypingStartedOp;
            const reducer = ReducerRegistry.getAppReducer(e.appId);
            const legacyEvent: any = {
                at: e.at,
                kind: "APP",
                type: "TYPING_START",
                appId: e.appId,
                conversationId: e.conversationId,
                from: e.actor
            };
            reducer?.(draft, legacyEvent);
            // return; // AutoSound runs after

        }

        if (event.kind === "TypingEnded") {
            const e = event as import("@tokovo/ir").TypingEndedOp;
            const reducer = ReducerRegistry.getAppReducer(e.appId);
            const legacyEvent: any = {
                at: e.at,
                kind: "APP",
                type: "TYPING_END",
                appId: e.appId,
                conversationId: e.conversationId,
                from: e.actor
            };
            reducer?.(draft, legacyEvent);
            // return; // AutoSound runs after

        }

        // Handle V2 Camera Ops (e.g., CameraZoom, CameraPan)
        if (typeof event.kind === "string" && (event.kind.startsWith("Camera") || event.kind.startsWith("Anchor"))) {
            const type = event.kind.replace("Camera", "").toUpperCase();
            // Handle AnchorFocus -> ANCHOR_FOCUS mapping
            const normalizedType = type === "ANCHORFOCUS" ? "ANCHOR_FOCUS"
                : type === "ANCHORTRACK" ? "ANCHOR_TRACK"
                    : type === "SHAKE" ? "SHAKE"
                        : type;

            const legacyEvent: any = {
                ...event,
                kind: "CAMERA",
                type: normalizedType,
                scale: (event as any).scale,
                originX: (event as any).originX,
                originY: (event as any).originY,
                align: (event as any).align,
                translateX: (event as any).translateX || ((event as any).originX ? ((event as any).originX - 0.5) * 1000 : 0)
            };
            processCameraEvent(draft, legacyEvent, index);
            // return; // AutoSound runs after

        }

        // === V1 LEGACY HANDLERS ===
        switch (event.kind) {
            case "DEVICE":
                if (ReducerRegistry.deviceReducer) {
                    draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
                }
                // Handle Notification Events (which are kind="DEVICE" but typed specifically)
                const type = (event as any).type;
                if (type && (type.includes("NOTIFICATION"))) {
                    processNotificationEvent(draft, event as any, event.at);
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
            case "KEYBOARD": {
                // Use registered plugin reducer
                const reducer = ReducerRegistry.getFeatureReducer("KEYBOARD");
                if (reducer) {
                    reducer(draft, event, index);
                } else {
                    console.warn("[Engine] No KEYBOARD reducer registered. Ensure @tokovo/device-keyboard is imported.");
                }
                break;
            }
            case "OS":
                processOSEvent(draft, event as any);
                break;
            case "TOUCH":
                processTouchEvent(draft, event as any, t);
                break;
            case "CALL":
                processCallEvent(draft, event as any);
                break;
        }

        // === AUTO SOUND DERIVATION ===
        // Process every event for potential audio triggers (Declarative Audio System)
        handleAutoSounds(draft, event, index);
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

