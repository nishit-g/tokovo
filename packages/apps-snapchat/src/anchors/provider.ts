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

type Viewport = {
  width: number;
  height: number;
  safeTop: number;
  safeBottom: number;
};

function getViewportDimensions(
  device: WorldState["devices"][string] | undefined,
  context?: AnchorProviderContext,
): Viewport {
  const profileId = device?.profileId;
  const profile = context?.getDeviceProfile?.(profileId);
  if (profile) {
    return {
      width: profile.dimensions.width,
      height: profile.dimensions.height,
      safeTop: profile.safeArea?.top ?? 0,
      safeBottom: profile.safeArea?.bottom ?? 0,
    };
  }
  if (device?.screenDimensions) {
    return {
      width: device.screenDimensions.width,
      height: device.screenDimensions.height,
      safeTop: device.screenDimensions.safeAreaTop,
      safeBottom: device.screenDimensions.safeAreaBottom,
    };
  }
  return { width: 430, height: 932, safeTop: 0, safeBottom: 0 };
}

function extractSemantic(layout: unknown): SemanticLayoutState | null {
  if (!layout || typeof layout !== "object") return null;
  return (layout as LayoutState).semantic ?? null;
}

function addSemanticAnchors(
  anchors: Record<string, LayoutRect>,
  semantic: SemanticLayoutState | null,
): void {
  if (!semantic?.regions) return;
  for (const region of Object.values(semantic.regions)) {
    anchors[region.id] = region.rect;
  }
}

function aliasAnchor(
  anchors: Record<string, LayoutRect>,
  alias: string,
  source: string,
): void {
  if (!anchors[alias] && anchors[source]) {
    anchors[alias] = anchors[source];
  }
}

function addLastMessageAnchor(anchors: Record<string, LayoutRect>, state: Partial<SnapchatState>): void {
  const activeConversation = state.activeConversationId
    ? state.conversations?.[state.activeConversationId]
    : undefined;

  if (!activeConversation || activeConversation.messages.length === 0) return;

  const threadRect = anchors.snapchat_thread;
  if (!threadRect) return;

  anchors.lastMessage = {
    x: threadRect.x + threadRect.width * 0.08,
    y: threadRect.y + threadRect.height * 0.76,
    width: threadRect.width * 0.84,
    height: Math.max(54, threadRect.height * 0.14),
  };
}

export const SnapchatAnchorProvider: AnchorProvider = {
  appId: APP_ID,
  framing: {
    snapchat_header: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 24, targetFill: 0.82 },
    snapchat_chat_list: { anchorPoint: { x: 0.5, y: 0.42 }, paddingPx: 22, targetFill: 0.86 },
    snapchat_thread: { anchorPoint: { x: 0.52, y: 0.56 }, paddingPx: 20, targetFill: 0.86 },
    snapchat_composer: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 18, targetFill: 0.8 },
    snapchat_snap_viewer: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 12, targetFill: 0.94 },
    lastMessage: { anchorPoint: { x: 0.58, y: 0.58 }, paddingPx: 18, targetFill: 0.9 },
  },

  getAnchors(
    world: WorldState,
    layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
  ): AnchorSnapshot {
    const device = world.devices[deviceId];
    const { width, height, safeTop, safeBottom } = getViewportDimensions(device, context);
    const state = (world.appState?.[APP_ID] ?? {}) as Partial<SnapchatState>;
    const screen = state.currentScreen ?? "chat_list";

    const anchors: Record<string, LayoutRect> = {
      device: { x: 0, y: 0, width, height },
      app: { x: 0, y: 0, width, height },
    };

    // Preferred: semantic anchors from layout.
    const semantic = extractSemantic(layout);
    addSemanticAnchors(anchors, semantic);

    // Fallback: heuristics if layout semantics are unavailable.
    if (screen === "chat_list") {
      anchors.snapchat_header ??= { x: 0, y: 0, width, height: safeTop + 104 };
      anchors.snapchat_chat_list ??= {
        x: 0,
        y: safeTop + 104,
        width,
        height: Math.max(0, height - (safeTop + 104) - safeBottom),
      };
    }

    if (screen === "chat") {
      anchors.snapchat_header ??= { x: 0, y: 0, width, height: safeTop + 92 };
      anchors.snapchat_thread ??= {
        x: 0,
        y: safeTop + 92,
        width,
        height: Math.max(0, height - (safeTop + 92) - (safeBottom + 66)),
      };
      anchors.snapchat_composer ??= {
        x: 0,
        y: height - (safeBottom + 66),
        width,
        height: safeBottom + 66,
      };
    }

    if (screen === "snap_view") {
      anchors.snapchat_snap_viewer ??= { x: 0, y: 0, width, height };
    }

    // Semantic aliases for cross-app camera scripts.
    aliasAnchor(anchors, "header", "snapchat_header");
    aliasAnchor(anchors, "content", "snapchat_chat_list");
    aliasAnchor(anchors, "content", "snapchat_thread");
    aliasAnchor(anchors, "inputArea", "snapchat_composer");

    addLastMessageAnchor(anchors, state);

    return { anchors, deviceId, appId: APP_ID };
  },
};
