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
import { getAppStateForDevice } from "@tokovo/core";
import type { WhatsAppState } from "../types/index.js";

import { WhatsAppAnchorFraming } from "../runtime/adapters/anchors.js";

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
  anchors.chat_content = {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

function addChatThreadAnchor(
  anchors: Record<string, LayoutRect>,
  layout: LayoutState | null | undefined,
  viewport: { width: number; height: number },
): void {
  if (!layout || typeof layout !== "object") return;
  if ((layout as LayoutState).kind !== "CHAT") return;

  const header = anchors.header;
  const input = anchors.input_area;
  const top = header ? header.y + header.height : viewport.height * 0.11;
  const bottom = input ? input.y : viewport.height * 0.86;

  anchors.chat_thread ??= {
    x: 0,
    y: top,
    width: viewport.width,
    height: Math.max(0, bottom - top),
  };
}

export const WhatsAppAnchorProvider: AnchorProvider = {
  appId: APP_ID,
  framing: WhatsAppAnchorFraming,

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

    addChatThreadAnchor(anchors, layout as LayoutState, viewport);

    // Stable direct message IDs are anchors; latest-message selectors are
    // explicit dynamic camera targets for authored conversation beats.
    const messageIds = semantic?.groups?.message ?? [];
    const lastMessageId = messageIds[messageIds.length - 1];
    const lastMessageRect = lastMessageId ? semantic?.regions?.[lastMessageId]?.rect : undefined;
    if (lastMessageRect) {
      anchors.lastMessage = lastMessageRect;
    }

    const mediaIds = semantic?.groups?.media ?? [];
    const lastMediaId = mediaIds[mediaIds.length - 1];
    const lastMediaRect = lastMediaId ? semantic?.regions?.[lastMediaId]?.rect : undefined;
    if (lastMediaRect) {
      anchors.lastMedia = lastMediaRect;
    }

    const replyIds = semantic?.groups?.reply ?? [];
    const lastReplyId = replyIds[replyIds.length - 1];
    const lastReplyRect = lastReplyId ? semantic?.regions?.[lastReplyId]?.rect : undefined;
    if (lastReplyRect) {
      anchors.lastReply = lastReplyRect;
    }

    addContentAnchor(anchors, layout as LayoutState);

    const state = getAppStateForDevice<WhatsAppState>(
      world,
      APP_ID,
      deviceId,
    );
    if (state?.mediaViewer) {
      anchors.media_viewer = anchors.device;
      anchors.media_viewer_header = {
        x: 0,
        y: 0,
        width: viewport.width,
        height: 64,
      };
      anchors.media_viewer_content = {
        x: 0,
        y: 64,
        width: viewport.width,
        height: Math.max(0, viewport.height - 128),
      };
      anchors.media_viewer_caption = {
        x: 0,
        y: Math.max(64, viewport.height - 96),
        width: viewport.width,
        height: 96,
      };
    }

    if (state?.statusViewer) {
      anchors.status_viewer = anchors.device;
      anchors.status_progress = {
        x: 10,
        y: 52,
        width: Math.max(0, viewport.width - 20),
        height: 3,
      };
      anchors.status_content = anchors.device;
      anchors.status_reply = {
        x: 14,
        y: Math.max(0, viewport.height - 72),
        width: Math.max(0, viewport.width - 28),
        height: 54,
      };
    }

    return {
      anchors,
      deviceId,
      appId: APP_ID,
    };
  },
};
