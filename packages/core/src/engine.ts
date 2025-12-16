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
        case "ANCHOR_FOCUS":
        case "ANCHOR_TRACK":
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
 * Process keyboard event and update device keyboard state
 */
function processKeyboardEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "KEYBOARD" },
    eventIndex: number
): void {
    // Keyboard events target a specific device
    const deviceId = event.deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    // Initialize keyboard state if needed
    if (!device.keyboard) {
        device.keyboard = {
            visible: false,
            layout: "qwerty",
            currentKey: null,
            keyPressedAt: null,
            inputText: "",
            cursorPosition: 0,
            cursorVisible: true,
        };
    }

    switch (event.type) {
        case "SHOW":
            device.keyboard.visible = true;
            device.keyboard.layout = event.layout || "qwerty";
            device.keyboard.inputText = "";
            device.keyboard.cursorPosition = 0;
            break;

        case "HIDE":
            device.keyboard.visible = false;
            device.keyboard.currentKey = null;
            break;

        case "KEY_DOWN":
            device.keyboard.currentKey = event.key;
            device.keyboard.keyPressedAt = event.at;
            break;

        case "KEY_UP":
            device.keyboard.currentKey = null;
            device.keyboard.keyPressedAt = null;
            break;

        case "TYPE_CHAR":
            // Add character to input
            const pos = device.keyboard.cursorPosition;
            const text = device.keyboard.inputText;
            device.keyboard.inputText = text.slice(0, pos) + event.char + text.slice(pos);
            device.keyboard.cursorPosition = pos + 1;
            device.keyboard.currentKey = event.char;
            device.keyboard.keyPressedAt = event.at;
            break;

        case "BACKSPACE":
            if (device.keyboard.cursorPosition > 0) {
                const pos = device.keyboard.cursorPosition;
                const text = device.keyboard.inputText;
                device.keyboard.inputText = text.slice(0, pos - 1) + text.slice(pos);
                device.keyboard.cursorPosition = pos - 1;
            }
            device.keyboard.currentKey = "⌫";
            device.keyboard.keyPressedAt = event.at;
            break;

        case "SET_TEXT":
            device.keyboard.inputText = event.text;
            device.keyboard.cursorPosition = event.text.length;
            break;

        case "CLEAR":
            device.keyboard.inputText = "";
            device.keyboard.cursorPosition = 0;
            break;
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
            device.os.clock = event.time;
            break;

        case "SET_BATTERY":
            device.os.battery = Math.max(0, Math.min(100, event.level));
            if ((event as any).charging !== undefined) {
                device.os.charging = (event as any).charging;
            }
            break;

        case "DRAIN_BATTERY":
            // Rate is % per second at 30fps
            const drain = (event as any).rate / 30;
            device.os.battery = Math.max(0, device.os.battery - drain);
            break;

        case "SET_NETWORK":
            device.os.network = event.network;
            if ((event as any).strength !== undefined) {
                if (event.network === "wifi") {
                    device.os.wifiStrength = (event as any).strength;
                } else {
                    device.os.cellStrength = (event as any).strength;
                }
            }
            break;

        case "SET_DND":
            device.os.dnd = event.enabled;
            break;

        case "SET_LOW_POWER":
            device.os.lowPowerMode = (event as any).enabled;
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
            // IR to Instance Transformation
            const instance: import("./types").NotificationInstance = {
                id: e.id,
                ir: {
                    id: e.id,
                    appId: e.appId,
                    title: e.title,
                    body: e.body,
                    icon: e.icon,
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
                x: event.x,
                y: event.y,
                startedAt: event.at,
                type: "tap",
            });
            break;

        case "LONG_PRESS":
            draft.touches.push({
                id: touchId,
                x: event.x,
                y: event.y,
                startedAt: event.at,
                type: "long_press",
            });
            break;

        case "DRAG":
            draft.touches.push({
                id: touchId,
                x: (event as any).startX,
                y: (event as any).startY,
                startedAt: event.at,
                type: "drag",
                endX: (event as any).endX,
                endY: (event as any).endY,
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
                    const title = meta.displayName || e.appId;

                    // Identify Sender Name if possible
                    // (In a real engine, we'd lookup the contact name from the `from` ID)
                    // For now, use the title or a generic fallback
                    const senderName = title;

                    const notification: NotificationInstance = {
                        id: `auto_notif_${e.at}_${e.appId}`,
                        ir: {
                            id: `auto_notif_${e.at}_${e.appId}`,
                            appId: e.appId,
                            title: senderName,
                            body: e.message.text || "New Image",
                            icon: meta.icon as string, // Use app icon or specific sender avatar if available
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
            return;
        }

        if (event.kind === "MessageSent") {
            const e = event as import("@tokovo/ir").MessageSentOp;
            const reducer = ReducerRegistry.getAppReducer(e.appId);
            const legacyEvent: any = {
                at: e.at,
                kind: "APP",
                type: "MESSAGE_RECEIVED", // Sent messages are treated as received from 'me' in current engine
                appId: e.appId,
                conversationId: e.conversationId,
                from: "me",
                text: e.message.text,
                message: { ...e.message, from: "me" }
            };
            reducer?.(draft, legacyEvent);
            return;
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
            return;
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
            return;
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
            return;
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
            case "KEYBOARD":
                processKeyboardEvent(draft, event as any, index);
                break;
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

