/**
 * Episode Generator
 * 
 * Converts DSL Scene IR → Episode JSON (compatible with @tokovo/core)
 */

import {
    SceneIR,
    TimelineIR,
    EpisodeMeta,
    DeviceScene,
    ConversationDef,
} from "@tokovo/ir";
import { compile } from "@tokovo/compiler";
import { adapterRegistry, RuntimeEvent } from "@tokovo/adapters";

/**
 * Episode JSON format (compatible with existing runtime)
 */
export interface EpisodeJSON {
    meta: {
        title: string;
        fps: number;
        durationInFrames: number;
    };
    initialWorld: {
        devices: Record<string, any>;
        conversations: Record<string, any>;
        appState: Record<string, any>;
        camera: any;
        audio: { activeSounds: {} };
    };
    events: RuntimeEvent[];
}

/**
 * Generate Episode JSON from Scene IR
 */
export function generateEpisode(sceneIR: SceneIR): EpisodeJSON {
    // Compile to Timeline IR
    const { timeline, durationInFrames } = compile(sceneIR);

    // Lower to runtime events
    const events = adapterRegistry.lowerAll(timeline);

    // Build initial world
    const initialWorld = buildInitialWorld(sceneIR);

    return {
        meta: {
            title: sceneIR.meta.title ?? sceneIR.episodeId,
            fps: sceneIR.meta.fps,
            durationInFrames,
        },
        initialWorld,
        events,
    };
}

/**
 * Build initial world state from device definitions
 */
function buildInitialWorld(sceneIR: SceneIR) {
    const devices: Record<string, any> = {};
    const conversations: Record<string, any> = {};
    const appState: Record<string, any> = {};

    for (const device of sceneIR.devices) {
        // Device state
        devices[device.deviceId] = {
            id: device.deviceId,
            profileId: device.profileId,
            isLocked: false, // Will be unlocked by events
            foregroundAppId: device.appId,
            notifications: [],
        };

        // Conversations
        for (const convo of device.conversations) {
            conversations[convo.id] = {
                id: convo.id,
                type: convo.type ?? "dm",
                name: convo.name ?? convo.id,
                avatar: convo.avatar,
                messages: [],
                typing: {},
            };
        }

        // App state
        if (device.appId) {
            appState[device.appId] = {
                screen: "chat",
                conversationId: device.conversations[0]?.id,
            };
        }
    }

    // Default camera
    const camera = {
        baseView: "APP_VIEW",
        activeDeviceId: sceneIR.devices[0]?.deviceId ?? "phone",
        layout: {
            mode: "SINGLE",
            primaryDeviceId: sceneIR.devices[0]?.deviceId ?? "phone",
        },
        activeEffects: [],
        transform: {
            translateX: 0,
            translateY: 0,
            scale: 1,
            rotation: 0,
            originX: 0.5,
            originY: 0.5,
            shakeX: 0,
            shakeY: 0,
        },
        deviceTransforms: {},
    };

    return {
        devices,
        conversations,
        appState,
        camera,
        audio: { activeSounds: {} },
    };
}
