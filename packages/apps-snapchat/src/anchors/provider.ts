import type {
    AnchorProvider,
    AnchorProviderContext,
    AnchorSnapshot,
    LayoutRect,
    LayoutState,
    SemanticLayoutState,
    WorldState,
} from "@tokovo/core";

import type { SnapchatState } from "../types/index.js";

const APP_ID = "app_snapchat";

function getViewportDimensions(
    device: WorldState["devices"][string] | undefined,
    context?: AnchorProviderContext,
): { width: number; height: number } {
    const profileId = device?.profileId;
    const profile = context?.getDeviceProfile?.(profileId);
    if (profile) {
        return {
            width: profile.dimensions.width,
            height: profile.dimensions.height,
        };
    }
    if (device?.screenDimensions) {
        return {
            width: device.screenDimensions.width,
            height: device.screenDimensions.height,
        };
    }
    return { width: 430, height: 932 };
}

function extractSemantic(layout: unknown): SemanticLayoutState | null {
    if (!layout || typeof layout !== "object") return null;
    return (layout as LayoutState).semantic ?? null;
}

function addSemanticAnchors(
    anchors: Record<string, LayoutRect>,
    semantic: SemanticLayoutState | null,
) {
    if (!semantic?.regions) return;
    for (const region of Object.values(semantic.regions)) {
        anchors[region.id] = region.rect;
    }
}

export const SnapchatAnchorProvider: AnchorProvider = {
    appId: APP_ID,
    framing: {},

    getAnchors(
        world: WorldState,
        layout: unknown,
        deviceId: string,
        context?: AnchorProviderContext,
    ): AnchorSnapshot {
        const device = world.devices[deviceId];
        const { width, height } = getViewportDimensions(device, context);
        const state = (world.appState?.[APP_ID] ?? {}) as Partial<SnapchatState>;
        const screen = state.currentScreen ?? "chat_list";

        const anchors: Record<string, LayoutRect> = {
            device: { x: 0, y: 0, width, height },
            app: { x: 0, y: 0, width, height },
        };

        // Preferred: semantic anchors from layout.
        const semantic = extractSemantic(layout);
        addSemanticAnchors(anchors, semantic);

        // Fallback: legacy heuristics if layout semantics are unavailable.
        if (screen === "chat_list") {
            anchors.snapchat_header ??= { x: 0, y: 0, width, height: height * 0.12 };
            anchors.snapchat_chat_list ??= { x: 0, y: height * 0.12, width, height: height * 0.88 };
        }

        if (screen === "chat") {
            anchors.snapchat_header ??= { x: 0, y: 0, width, height: height * 0.10 };
            anchors.snapchat_thread ??= { x: 0, y: height * 0.10, width, height: height * 0.75 };
            anchors.snapchat_composer ??= { x: 0, y: height * 0.85, width, height: height * 0.15 };
        }

        if (screen === "snap_view") {
            anchors.snapchat_snap_viewer ??= { x: 0, y: 0, width, height };
        }

        return { anchors, deviceId, appId: APP_ID };
    },
};
