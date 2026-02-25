import type {
  AnchorProvider,
  AnchorProviderContext,
  AnchorSnapshot,
  LayoutRect,
  LayoutState,
  SemanticLayoutState,
  WorldState,
} from "@tokovo/core";
import { TEAMS_APP_ID } from "../constants.js";
import { asTeamsState } from "../types/state.js";

type Viewport = {
  width: number;
  height: number;
  safeTop: number;
  safeBottom: number;
};

function extractSemantic(layout: unknown): SemanticLayoutState | null {
  if (!layout || typeof layout !== "object") return null;
  return (layout as LayoutState).semantic ?? null;
}

function viewport(
  device: WorldState["devices"][string] | undefined,
  context?: AnchorProviderContext,
): Viewport {
  const profile = context?.getDeviceProfile?.(device?.profileId);
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

function aliasAnchor(
  anchors: Record<string, LayoutRect>,
  alias: string,
  source: string,
): void {
  if (!anchors[alias] && anchors[source]) {
    anchors[alias] = anchors[source];
  }
}

function addLastMessageAnchor(anchors: Record<string, LayoutRect>, world: WorldState): void {
  const teamsState = asTeamsState(world.appState);
  if (!teamsState) return;

  const threadId = teamsState.activeThreadId ?? teamsState.activeDmId;
  if (!threadId) return;

  const messages = Object.values(teamsState.messages)
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => a.createdAtFrame - b.createdAtFrame);

  if (messages.length === 0) return;

  const threadRect = anchors.teams_thread ?? anchors.teams_chat_list;
  if (!threadRect) return;

  anchors.lastMessage = {
    x: threadRect.x + threadRect.width * 0.1,
    y: threadRect.y + threadRect.height * 0.72,
    width: threadRect.width * 0.8,
    height: Math.max(64, threadRect.height * 0.16),
  };
}

export const TeamsAnchorProvider: AnchorProvider = {
  appId: TEAMS_APP_ID,
  framing: {
    teams_header: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 24, targetFill: 0.78 },
    teams_chat_list: { anchorPoint: { x: 0.5, y: 0.42 }, paddingPx: 28, targetFill: 0.82 },
    teams_thread: { anchorPoint: { x: 0.52, y: 0.56 }, paddingPx: 24, targetFill: 0.84 },
    teams_thread_panel: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 20, targetFill: 0.82 },
    teams_composer: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 20, targetFill: 0.78 },
    teams_call_status: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 28, targetFill: 0.8 },
    lastMessage: { anchorPoint: { x: 0.58, y: 0.58 }, paddingPx: 20, targetFill: 0.86 },
    teams_unread_marker: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 16, targetFill: 0.68 },
    teams_mention_badge: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 16, targetFill: 0.68 },
  },
  getAnchors(world, layout, deviceId, context): AnchorSnapshot {
    const { width, height, safeTop, safeBottom } = viewport(world.devices[deviceId], context);
    const anchors: Record<string, LayoutRect> = {
      device: { x: 0, y: 0, width, height },
      app: { x: 0, y: 0, width, height },
    };

    const semantic = extractSemantic(layout);
    if (semantic?.regions) {
      for (const region of Object.values(semantic.regions)) {
        anchors[region.id] = region.rect;
      }
    }

    // Semantic aliases for generic camera scripts.
    aliasAnchor(anchors, "header", "teams_header");
    aliasAnchor(anchors, "content", "teams_chat_list");
    aliasAnchor(anchors, "content", "teams_thread");
    aliasAnchor(anchors, "inputArea", "teams_composer");
    aliasAnchor(anchors, "typingIndicator", "teams_composer");

    anchors.teams_header ??= { x: 0, y: 0, width, height: safeTop + 76 };
    anchors.teams_chat_list ??= {
      x: 0,
      y: safeTop + 76,
      width,
      height: Math.max(0, height - (safeTop + 76) - safeBottom),
    };
    anchors.teams_thread ??= {
      x: 0,
      y: safeTop + 72,
      width,
      height: Math.max(0, height - (safeTop + 72) - (safeBottom + 62)),
    };
    anchors.teams_composer ??= {
      x: 0,
      y: height - (safeBottom + 62),
      width,
      height: safeBottom + 62,
    };
    anchors.teams_call_status ??= { x: 0, y: 0, width, height: safeTop + 88 };

    addLastMessageAnchor(anchors, world);

    anchors.teams_unread_marker ??= { x: width - 20, y: safeTop + 92, width: 10, height: 10 };
    anchors.teams_mention_badge ??= { x: width - 30, y: safeTop + 134, width: 14, height: 14 };

    return { anchors, deviceId, appId: TEAMS_APP_ID };
  },
};
