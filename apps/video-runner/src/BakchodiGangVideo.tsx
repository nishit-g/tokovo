import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bakchodiGangEpisode } from "@tokovo/episodes";
import { compile } from "@tokovo/compiler";
import {
    replay,
    createEventIndex,
    WorldState,
    DeviceState,
    ConversationState,
    DEFAULT_CAMERA_STATE,
    DEFAULT_AUDIO_STATE
} from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import "@tokovo/devices";
import { SceneIR } from "@tokovo/ir";

// Helper to construct Initial World from Scene IR
function createInitialWorld(scene: SceneIR): WorldState {
    const devices: Record<string, DeviceState> = {};
    const conversations: Record<string, ConversationState> = {};
    const appStates: Record<string, any> = {};

    for (const dev of scene.devices) {
        // Create device state
        devices[dev.deviceId] = {
            id: dev.deviceId,
            profileId: dev.profileId ?? "iphone16",
            isLocked: false,
            foregroundAppId: dev.appId,
            notifications: [],
        } as any;

        // Create conversations
        for (const conv of dev.conversations) {
            conversations[conv.id] = {
                id: conv.id,
                type: conv.type === "group" ? "group" : "dm",
                name: conv.name,
                avatar: conv.avatar,
                messages: (conv as any).initialMessages?.map((m: any, idx: number) => ({
                    id: `init_${conv.id}_${idx}`,
                    from: m.from,
                    text: m.text,
                    type: "text",
                    timestamp: m.at, // UI uses this string
                    at: 0
                })) || [],
                typing: {}
            };
        }

        // App state
        appStates[dev.appId] = {
            screen: "chat",
            conversationId: dev.conversations[0]?.id
        };
    }

    // Ensure audio state fallback
    const audio = DEFAULT_AUDIO_STATE || { activeSounds: {} };

    return {
        devices,
        conversations,
        appState: appStates,
        camera: { ...DEFAULT_CAMERA_STATE, activeDeviceId: scene.devices[0]?.deviceId ?? "phone" },
        audio
    };
}

export const BakchodiGangVideo: React.FC = () => {
    const frame = useCurrentFrame();

    // Compile the DSL into events on the fly
    const { initialWorld, timelineAndOps } = useMemo(() => {
        const result = compile(bakchodiGangEpisode);
        // ENGINE UPDATE: Native V2 support enabled. No adapter needed.
        const rawOps = result.timeline.ops;

        return {
            initialWorld: createInitialWorld(bakchodiGangEpisode as unknown as SceneIR),
            timelineAndOps: rawOps as any[]
        };
    }, []);

    const eventIndex = useMemo(() => createEventIndex(timelineAndOps), [timelineAndOps]);
    const world = replay(initialWorld, timelineAndOps, frame);

    // Calculate scale to fit device in composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#1a1a2e",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={frame}
                    debug={false}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={false}
                />
            </div>
        </AbsoluteFill>
    );
};
