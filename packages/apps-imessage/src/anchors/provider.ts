import type {
  AnchorProvider,
  AnchorProviderContext,
  AnchorSnapshot,
  LayoutRect,
  LayoutState,
  SemanticLayoutState,
  WorldState,
} from "@tokovo/core";

import type { IMessageState } from "../types/index.js";
import { IMessageAnchors } from "../runtime/adapters/anchors.js";

const APP_ID = "app_imessage";

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

function aliasAnchor(
  anchors: Record<string, LayoutRect>,
  alias: string,
  source: string,
) {
  if (!anchors[alias] && anchors[source]) {
    anchors[alias] = anchors[source];
  }
}

export const IMessageAnchorProvider: AnchorProvider = {
  appId: APP_ID,
  framing: IMessageAnchors.framing ?? {},

  getAnchors(
    world: WorldState,
    layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
  ): AnchorSnapshot {
    const device = world.devices[deviceId];
    const { width, height } = getViewportDimensions(device, context);
    const state = (world.appState?.[APP_ID] ?? {}) as Partial<IMessageState>;
    const screen = state.currentScreen ?? "list";

    const anchors: Record<string, LayoutRect> = {
      device: { x: 0, y: 0, width, height },
      app: { x: 0, y: 0, width, height },
    };

    // Preferred: semantic anchors from layout.
    const semantic = extractSemantic(layout);
    addSemanticAnchors(anchors, semantic);

    // Fallback: legacy heuristics if layout semantics are unavailable.
    if (screen === "list") {
      anchors.imessage_list_header ??= { x: 0, y: 0, width, height: height * 0.15 };
      anchors.imessage_list ??= { x: 0, y: height * 0.15, width, height: height * 0.85 };
      anchors.imessage_list_row_0 ??= { x: width * 0.04, y: height * 0.17, width: width * 0.92, height: height * 0.09 };
      anchors.imessage_list_row_0_avatar ??= { x: width * 0.04, y: height * 0.18, width: width * 0.11, height: width * 0.11 };
      anchors.imessage_list_row_0_content ??= { x: width * 0.18, y: height * 0.185, width: width * 0.72, height: height * 0.05 };
    }

    if (screen === "chat") {
      anchors.imessage_chat_header ??= { x: 0, y: 0, width, height: height * 0.12 };
      anchors.imessage_thread ??= { x: 0, y: height * 0.12, width, height: height * 0.73 };
      anchors.imessage_composer ??= { x: 0, y: height * 0.85, width, height: height * 0.15 };
      anchors.imessage_input ??= { x: width * 0.11, y: height * 0.865, width: width * 0.78, height: height * 0.045 };
      anchors.imessage_last_message ??= { x: width * 0.08, y: height * 0.72, width: width * 0.84, height: height * 0.08 };
    }

    if (screen === "info") {
      anchors.imessage_fullscreen_header ??= { x: 0, y: 0, width, height: height * 0.12 };
      anchors.imessage_info ??= { x: width * 0.04, y: height * 0.12, width: width * 0.92, height: height * 0.78 };
    }

    if (screen === "media") {
      anchors.imessage_fullscreen_header ??= { x: 0, y: 0, width, height: height * 0.12 };
      anchors.imessage_media ??= { x: 0, y: height * 0.12, width, height: height * 0.78 };
    }

    aliasAnchor(anchors, "header", "imessage_list_header");
    aliasAnchor(anchors, "header", "imessage_chat_header");
    aliasAnchor(anchors, "content", "imessage_list");
    aliasAnchor(anchors, "content", "imessage_thread");
    aliasAnchor(anchors, "inputArea", "imessage_composer");
    aliasAnchor(anchors, "inputArea", "imessage_input");

    return { anchors, deviceId, appId: APP_ID };
  },
};
