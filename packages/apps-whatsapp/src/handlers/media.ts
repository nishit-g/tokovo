import type { MutableHandlerRegistry } from "./registry";
import type {
  ImageReceivedEvent,
  ImageSentEvent,
  VideoReceivedEvent,
  VideoSentEvent,
  VoiceReceivedEvent,
  VoiceSentEvent,
  GifReceivedEvent,
  GifSentEvent,
  StickerReceivedEvent,
  StickerSentEvent,
  DocumentReceivedEvent,
  DocumentSentEvent,
  ContactReceivedEvent,
  ContactSentEvent,
  LocationReceivedEvent,
  LocationSentEvent,
  VoicePlayEvent,
  VoicePauseEvent,
  VoiceMessageReceivedEvent,
} from "../schemas";
import type { WhatsAppMessage } from "../types";
import type { HandlerContext } from "./registry";
import { formatFileSize } from "../utils/file-size";

function buildMediaMessageId(
  ctx: HandlerContext,
  e: { at: number; _declarationOrder?: number },
  from: string,
  kind: string,
) {
  const declarationOrder = (e as { _declarationOrder?: number })
    ._declarationOrder;
  const fallbackIndex = ctx.conversation.messages.length;
  const orderSuffix = declarationOrder ?? fallbackIndex;
  return `msg_${e.at}_${from}_${kind}_${orderSuffix}`;
}

function bumpUnread(ctx: HandlerContext, from: string): void {
  if (from === "me" || from === "system") return;
  const appState = (ctx.draft as { appState?: { app_whatsapp?: { currentConversationId?: string } } })
    .appState?.app_whatsapp;
  if (appState?.currentConversationId && appState.currentConversationId === ctx.conversation.id) {
    return;
  }
  ctx.conversation.unreadCount = (ctx.conversation.unreadCount ?? 0) + 1;
}

function inferFileType(fileName?: string, fallback?: string): string | undefined {
  if (!fileName) return fallback;
  const match = fileName.match(/\.([a-z0-9]+)$/i);
  return match ? match[1] : fallback;
}

function normalizeContactPayload(payload: {
  contactName?: string;
  contactPhone?: string;
  contactAvatar?: string;
  contactAvatarUrl?: string;
  name?: string;
  phone?: string;
  avatar?: string;
}): {
  contactName: string;
  contactPhone?: string;
  contactAvatarUrl?: string;
} {
  return {
    contactName: payload.contactName ?? payload.name ?? "Unknown Contact",
    contactPhone: payload.contactPhone ?? payload.phone,
    contactAvatarUrl:
      payload.contactAvatar ?? payload.contactAvatarUrl ?? payload.avatar,
  };
}

function normalizeLocationPayload(payload: {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  locationName?: string;
  locationAddress?: string;
  mapThumbnailUrl?: string;
  name?: string;
  label?: string;
  address?: string;
}): {
  latitude: number;
  longitude: number;
  locationName?: string;
  locationAddress?: string;
  mapThumbnailUrl?: string;
} {
  return {
    latitude: payload.latitude ?? payload.lat ?? 0,
    longitude: payload.longitude ?? payload.lng ?? 0,
    locationName: payload.locationName ?? payload.name ?? payload.label,
    locationAddress: payload.locationAddress ?? payload.address,
    mapThumbnailUrl: payload.mapThumbnailUrl,
  };
}

export function registerMediaHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<ImageReceivedEvent>("ImageReceived", (ctx, e) => {
    const payload = e.payload ?? {};
    const from = payload.from ?? e.from ?? "unknown";
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "img"),
      from,
      type: "image",
      imageUrl: payload.url,
      caption: payload.caption,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<ImageSentEvent>("ImageSent", (ctx, e) => {
    const payload = e.payload ?? {};
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "img"),
      from: "me",
      type: "image",
      imageUrl: payload.url,
      caption: payload.caption,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<VideoReceivedEvent>("VideoReceived", (ctx, e) => {
    const payload = e.payload ?? {};
    const from = payload.from ?? e.from ?? "unknown";
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "vid"),
      from,
      type: "video",
      thumbnailUrl: payload.url,
      videoUrl: payload.url,
      duration: payload.duration ?? 10,
      caption: payload.caption,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<VideoSentEvent>("VideoSent", (ctx, e) => {
    const payload = e.payload ?? {};
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "vid"),
      from: "me",
      type: "video",
      thumbnailUrl: payload.url,
      videoUrl: payload.url,
      duration: payload.duration ?? 10,
      caption: payload.caption,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<VoiceReceivedEvent>("VoiceReceived", (ctx, e) => {
    const payload = e.payload ?? {};
    const from = payload.from ?? e.from ?? "unknown";
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "voice"),
      from,
      type: "voice",
      duration: payload.duration ?? 5,
      isPlaying: false,
      playProgress: 0,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<VoiceSentEvent>("VoiceSent", (ctx, e) => {
    const payload = e.payload ?? {};
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "voice"),
      from: "me",
      type: "voice",
      duration: payload.duration ?? 5,
      isPlaying: false,
      playProgress: 0,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<GifReceivedEvent>("GifReceived", (ctx, e) => {
    const payload = e.payload ?? {};
    const from = payload.from ?? e.from ?? "unknown";
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "gif"),
      from,
      type: "gif",
      gifUrl: payload.url,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<GifSentEvent>("GifSent", (ctx, e) => {
    const payload = e.payload ?? {};
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "gif"),
      from: "me",
      type: "gif",
      gifUrl: payload.url,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<StickerReceivedEvent>("StickerReceived", (ctx, e) => {
    const payload = e.payload ?? {};
    const from = payload.from ?? e.from ?? "unknown";
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "sticker"),
      from,
      type: "sticker",
      stickerUrl: payload.url,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<StickerSentEvent>("StickerSent", (ctx, e) => {
    const payload = e.payload ?? {};
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "sticker"),
      from: "me",
      type: "sticker",
      stickerUrl: payload.url,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<DocumentReceivedEvent>(
    "DocumentReceived",
    (ctx, e) => {
    const payload = e.payload ?? {};
    const from = payload.from ?? e.from ?? "unknown";
    const fileSize = formatFileSize(payload.fileSize) ?? "0 KB";
    const fileName = payload.fileName ?? "Document";
    const fileType = payload.fileType ?? inferFileType(fileName, "pdf");
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "doc"),
      from,
      type: "document",
      documentUrl: payload.url,
      fileName,
      fileSize,
      fileType,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<DocumentSentEvent>("DocumentSent", (ctx, e) => {
    const payload = e.payload ?? {};
    const fileSize = formatFileSize(payload.fileSize) ?? "0 KB";
    const fileName = payload.fileName ?? "Document";
    const fileType = payload.fileType ?? inferFileType(fileName, "pdf");
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "doc"),
      from: "me",
      type: "document",
      documentUrl: payload.url,
      fileName,
      fileSize,
      fileType,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<ContactReceivedEvent>("ContactReceived", (ctx, e) => {
    const payload = e.payload ?? {};
    const from = payload.from ?? e.from ?? "unknown";
    const normalized = normalizeContactPayload(payload);
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "contact"),
      from,
      type: "contact",
      contactName: normalized.contactName,
      contactPhone: normalized.contactPhone,
      contactAvatarUrl: normalized.contactAvatarUrl,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<ContactSentEvent>("ContactSent", (ctx, e) => {
    const payload = e.payload ?? {};
    const normalized = normalizeContactPayload(payload);
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "contact"),
      from: "me",
      type: "contact",
      contactName: normalized.contactName,
      contactPhone: normalized.contactPhone,
      contactAvatarUrl: normalized.contactAvatarUrl,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<LocationReceivedEvent>("LocationReceived", (ctx, e) => {
    const payload = e.payload ?? {};
    const from = payload.from ?? e.from ?? "unknown";
    const normalized = normalizeLocationPayload(payload);
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "loc"),
      from,
      type: "location",
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      locationName: normalized.locationName,
      locationAddress: normalized.locationAddress,
      mapThumbnailUrl: normalized.mapThumbnailUrl,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<LocationSentEvent>("LocationSent", (ctx, e) => {
    const payload = e.payload ?? {};
    const normalized = normalizeLocationPayload(payload);
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "loc"),
      from: "me",
      type: "location",
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      locationName: normalized.locationName,
      locationAddress: normalized.locationAddress,
      mapThumbnailUrl: normalized.mapThumbnailUrl,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<VoicePlayEvent>("VoicePlay", (ctx, e) => {
    const payload = e.payload ?? {};

    let targetMsg = payload.messageId
      ? ctx.getMessageById(payload.messageId)
      : undefined;
    if (!targetMsg && payload.messageRef?.index !== undefined) {
      const indexRef = payload.messageRef.index;
      if (indexRef === "last" || indexRef === -1) {
        const voiceMsgs = ctx.conversation.messages.filter(
          (m) => m.type === "voice",
        );
        targetMsg = voiceMsgs[voiceMsgs.length - 1];
      }
    }

    if (targetMsg && targetMsg.type === "voice") {
      targetMsg.isPlaying = true;
      targetMsg.playProgress = payload.startAt ?? 0;
    }
  });

  registry.registerHandler<VoicePauseEvent>("VoicePause", (ctx, e) => {
    const payload = e.payload ?? {};

    let targetMsg = payload.messageId
      ? ctx.getMessageById(payload.messageId)
      : undefined;
    if (!targetMsg) {
      targetMsg = ctx.conversation.messages.find(
        (m) => m.type === "voice" && m.isPlaying,
      );
    }

    if (targetMsg && targetMsg.type === "voice") {
      targetMsg.isPlaying = false;
    }
  });

  registry.registerHandler<VoiceMessageReceivedEvent>(
    "VoiceMessageReceived",
    (ctx, e) => {
      const msg: WhatsAppMessage = {
        id: buildMediaMessageId(ctx, e, e.from ?? "unknown", "voice_msg"),
        from: e.from,
        type: "voice",
        duration: e.duration,
        at: e.at,
        status: "delivered",
      };
      ctx.addMessage(msg);
    },
  );
}
