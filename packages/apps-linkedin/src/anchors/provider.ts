import type {
  AnchorProvider,
  AnchorProviderContext,
  AnchorSnapshot,
  LayoutRect,
  LayoutState,
  SemanticLayoutState,
  WorldState,
} from "@tokovo/core";

import type { LinkedInState } from "../runtime/state.js";
import { linkedInAnchors } from "../runtime/adapters/anchors.js";

const APP_ID = "app_linkedin";

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

export const LinkedInAnchorProvider: AnchorProvider = {
  appId: APP_ID,
  framing: linkedInAnchors.framing ?? {},

  getAnchors(
    world: WorldState,
    layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
  ): AnchorSnapshot {
    const device = world.devices[deviceId];
    const { width, height } = getViewportDimensions(device, context);
    const state = (world.appState?.[APP_ID] ?? {}) as Partial<LinkedInState>;
    const screen = state.currentScreen ?? "feed";

    const anchors: Record<string, LayoutRect> = {
      device: { x: 0, y: 0, width, height },
      app: { x: 0, y: 0, width, height },
    };

    const semantic = extractSemantic(layout);
    addSemanticAnchors(anchors, semantic);

    // Minimal heuristic fallbacks (only if semantic is absent).
    if (!semantic) {
      anchors.li_header ??= { x: 0, y: 0, width, height: height * 0.14 };
      anchors.li_nav_bar ??= { x: 0, y: height * 0.9, width, height: height * 0.1 };
      if (screen === "thread") {
        anchors.li_dm_thread ??= { x: 0, y: height * 0.14, width, height: height * 0.72 };
        anchors.li_dm_composer ??= { x: 0, y: height * 0.86, width, height: height * 0.14 };
      } else if (screen === "compose") {
        anchors.li_compose_sheet ??= { x: width * 0.04, y: height * 0.16, width: width * 0.92, height: height * 0.74 };
      } else if (screen === "notifications") {
        anchors.li_notifications_list ??= { x: 0, y: height * 0.14, width, height: height * 0.76 };
      } else if (screen === "messages") {
        anchors.li_messages_list ??= { x: 0, y: height * 0.14, width, height: height * 0.76 };
      } else if (screen === "profile") {
        anchors.li_profile_header ??= { x: 0, y: 0, width, height: height * 0.28 };
        anchors.li_feed ??= { x: 0, y: height * 0.28, width, height: height * 0.62 };
      } else if (screen === "post") {
        anchors.li_post_detail ??= { x: 0, y: height * 0.14, width, height: height * 0.72 };
        anchors.li_comment_composer ??= { x: 0, y: height * 0.82, width, height: height * 0.08 };
      } else {
        anchors.li_feed ??= { x: 0, y: height * 0.14, width, height: height * 0.76 };
        anchors.li_post_card ??= { x: width * 0.04, y: height * 0.2, width: width * 0.92, height: height * 0.35 };
        anchors.li_reaction_row ??= { x: width * 0.04, y: height * 0.52, width: width * 0.92, height: height * 0.07 };
        anchors.li_compose_fab ??= { x: width * 0.74, y: height * 0.79, width: width * 0.2, height: height * 0.14 };
      }
    }

    return { anchors, deviceId, appId: APP_ID };
  },
};

