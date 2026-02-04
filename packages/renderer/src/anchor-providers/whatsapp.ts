/**
 * WhatsApp Anchor Provider
 *
 * Extracts semantic anchors from layout state for camera focus.
 */

import {
  AnchorProvider,
  AnchorSnapshot,
  LayoutRect,
  LayoutState,
  ChatLayoutState,
  SemanticLayoutState,
  AnchorProviderContext,
  WorldState,
} from "@tokovo/core";

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

function extractSemantic(layout: LayoutState | null | undefined): SemanticLayoutState | null {
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
  framing: {
    message: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 40,
      targetFill: 0.6,
    },
    message_me: {
      anchorPoint: { x: 0.6, y: 0.5 },
      paddingPx: 40,
      targetFill: 0.6,
    },
    message_other: {
      anchorPoint: { x: 0.4, y: 0.5 },
      paddingPx: 40,
      targetFill: 0.6,
    },
    lastMessage: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 40,
      targetFill: 0.6,
    },
    typingIndicator: {
      anchorPoint: { x: 0.35, y: 0.5 },
      paddingPx: 30,
      targetFill: 0.3,
    },
    inputArea: {
      anchorPoint: { x: 0.5, y: 0.8 },
      paddingPx: 20,
      targetFill: 0.9,
    },
    header: {
      anchorPoint: { x: 0.5, y: 0.15 },
      paddingPx: 10,
      targetFill: 0.9,
    },
    profile: {
      anchorPoint: { x: 0.2, y: 0.15 },
      paddingPx: 50,
      targetFill: 0.4,
    },
    content: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 20,
      targetFill: 0.8,
    },
    app: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 0,
      targetFill: 1.0,
    },
    device: {
      anchorPoint: { x: 0.5, y: 0.5 },
      paddingPx: 0,
      targetFill: 1.0,
    },
  },

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
