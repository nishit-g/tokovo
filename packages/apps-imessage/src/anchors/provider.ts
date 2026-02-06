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
    }

    if (screen === "chat") {
      anchors.imessage_list_header ??= { x: 0, y: 0, width, height: height * 0.12 };
      anchors.imessage_thread ??= { x: 0, y: height * 0.12, width, height: height * 0.73 };
      anchors.imessage_composer ??= { x: 0, y: height * 0.85, width, height: height * 0.15 };
    }

    if (screen === "info") {
      anchors.imessage_info ??= { x: width * 0.04, y: height * 0.12, width: width * 0.92, height: height * 0.78 };
    }

    if (screen === "media") {
      anchors.imessage_media ??= { x: 0, y: height * 0.12, width, height: height * 0.78 };
    }

    return { anchors, deviceId, appId: APP_ID };
  },
};

