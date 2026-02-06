import type {
  AnchorProvider,
  AnchorProviderContext,
  AnchorSnapshot,
  LayoutRect,
  LayoutState,
  SemanticLayoutState,
  WorldState,
} from "@tokovo/core";

import type { XState } from "../runtime/state.js";
import { xAnchors } from "../runtime/adapters/anchors.js";

const APP_ID = "app_x";

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

export const XAnchorProvider: AnchorProvider = {
  appId: APP_ID,
  framing: xAnchors.framing ?? {},

  getAnchors(
    world: WorldState,
    layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
  ): AnchorSnapshot {
    const device = world.devices[deviceId];
    const { width, height } = getViewportDimensions(device, context);
    const state = (world.appState?.[APP_ID] ?? {}) as Partial<XState>;
    const screen = state.currentScreen ?? "timeline";

    const anchors: Record<string, LayoutRect> = {
      device: { x: 0, y: 0, width, height },
      app: { x: 0, y: 0, width, height },
    };

    // Preferred: layout-driven semantic anchors (deterministic + tokenized).
    const semantic = extractSemantic(layout);
    addSemanticAnchors(anchors, semantic);

    // Fallback: legacy heuristic anchors for safety in dev/migration paths.
    if (!anchors.nav_bar) {
      anchors.nav_bar = { x: 0, y: height * 0.9, width, height: height * 0.1 };
    }

    if (screen === "timeline") {
      anchors.timeline_header ??= { x: 0, y: 0, width, height: height * 0.16 };
      anchors.timeline_feed ??= { x: 0, y: height * 0.16, width, height: height * 0.74 };
      anchors.tweet_card ??= { x: width * 0.04, y: height * 0.2, width: width * 0.92, height: height * 0.27 };
      anchors.metrics_row ??= { x: width * 0.08, y: height * 0.46, width: width * 0.84, height: height * 0.06 };
      anchors.compose_fab ??= { x: width * 0.74, y: height * 0.79, width: width * 0.2, height: height * 0.14 };
    }

    if (screen === "tweet") {
      anchors.tweet_card ??= { x: width * 0.03, y: height * 0.16, width: width * 0.94, height: height * 0.38 };
      anchors.metrics_row ??= { x: width * 0.08, y: height * 0.54, width: width * 0.84, height: height * 0.08 };
      anchors.reply_composer ??= { x: 0, y: height * 0.74, width, height: height * 0.16 };
    }

    if (screen === "compose") {
      anchors.reply_composer ??= { x: 0, y: height * 0.12, width, height: height * 0.78 };
    }

    if (screen === "profile") {
      anchors.profile_header ??= { x: 0, y: 0, width, height: height * 0.33 };
      anchors.timeline_feed ??= { x: 0, y: height * 0.33, width, height: height * 0.57 };
    }

    if (screen === "notifications") {
      anchors.timeline_header ??= { x: 0, y: 0, width, height: height * 0.14 };
      anchors.notifications_list ??= { x: 0, y: height * 0.14, width, height: height * 0.76 };
    }

    if (screen === "messages") {
      anchors.timeline_header ??= { x: 0, y: 0, width, height: height * 0.14 };
      anchors.dm_thread ??= { x: 0, y: height * 0.14, width, height: height * 0.76 };
      anchors.compose_fab ??= { x: width * 0.74, y: height * 0.79, width: width * 0.2, height: height * 0.14 };
    }

    if (screen === "thread") {
      anchors.dm_thread ??= { x: 0, y: height * 0.12, width, height: height * 0.72 };
      anchors.reply_composer ??= { x: 0, y: height * 0.84, width, height: height * 0.1 };
    }

    return { anchors, deviceId, appId: APP_ID };
  },
};

