/**
 * WhatsApp Anchor Provider
 *
 * Extracts semantic anchors from layout state for camera focus.
 * Source of truth is the WhatsApp plugin's layout semantic regions.
 */

import type {
  AnchorProvider,
  AnchorProviderContext,
  AnchorSnapshot,
  ChatLayoutState,
  LayoutRect,
  LayoutState,
  SemanticLayoutState,
  WorldState,
} from "@tokovo/core";

import { WhatsAppAnchors } from "../runtime/adapters/anchors";

const APP_ID = "app_whatsapp";

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

function extractSemantic(
  layout: LayoutState | null | undefined,
): SemanticLayoutState | null {
  if (!layout || typeof layout !== "object") return null;
  return (layout as LayoutState).semantic ?? null;
}

function addContentAnchor(
  anchors: Record<string, LayoutRect>,
  layout: LayoutState | null | undefined,
) {
  if (!layout || typeof layout !== "object") return;
  if ((layout as LayoutState).kind !== "CHAT") return;

  const chat = layout as ChatLayoutState;
  const messageLayouts = chat.messageLayouts || {};
  const ids = Object.keys(messageLayouts);
  if (ids.length === 0) return;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const id of ids) {
    const rect = messageLayouts[id]?.rect;
    if (!rect) continue;
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return;
  anchors.content = {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

export const WhatsAppAnchorProvider: AnchorProvider = {
  appId: APP_ID,
  framing: WhatsAppAnchors.framing ?? {},

  getAnchors(
    world: WorldState,
    layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
  ): AnchorSnapshot {
    const anchors: Record<string, LayoutRect> = {};
    const device = world.devices[deviceId];
    const viewport = getViewportDimensions(device, context);

    anchors.device = { x: 0, y: 0, width: viewport.width, height: viewport.height };
    anchors.app = anchors.device;

    const semantic = extractSemantic(layout as LayoutState);
    if (semantic?.regions) {
      for (const region of Object.values(semantic.regions)) {
        anchors[region.id] = region.rect;
      }
    }

    // Aliases for common anchor names.
    if (anchors.input_area && !anchors.inputArea) {
      anchors.inputArea = anchors.input_area;
    }
    if (anchors.typing_indicator && !anchors.typingIndicator) {
      anchors.typingIndicator = anchors.typing_indicator;
    }

    // Map message groups to message-N anchors and lastMessage.
    const messageIds = semantic?.groups?.message ?? [];
    messageIds.forEach((id, index) => {
      const rect = semantic?.regions?.[id]?.rect;
      if (rect) {
        anchors[`message-${index}`] = rect;
      }
    });
    const lastMessageId = messageIds[messageIds.length - 1];
    const lastMessageRect = lastMessageId
      ? semantic?.regions?.[lastMessageId]?.rect
      : undefined;
    if (lastMessageRect) {
      anchors.lastMessage = lastMessageRect;
    }

    addContentAnchor(anchors, layout as LayoutState);

    return {
      anchors,
      deviceId,
      appId: APP_ID,
    };
  },
};

