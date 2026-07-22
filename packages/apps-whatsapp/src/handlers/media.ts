import type { MutableHandlerRegistry } from "./registry.js";
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
  MediaDownloadStartedEvent,
  MediaDownloadProgressEvent,
  MediaDownloadCompletedEvent,
  MediaDownloadFailedEvent,
  MediaPlaybackStartedEvent,
  MediaPlaybackProgressEvent,
  MediaPlaybackPausedEvent,
  MediaPlaybackCompletedEvent,
  MediaViewerOpenedEvent,
  MediaViewerClosedEvent,
} from "../schemas/index.js";
import type {
  WhatsAppMediaLifecycle,
  WhatsAppMessage,
  WhatsAppState,
} from "../types/index.js";
import type { HandlerContext } from "./registry.js";
import { formatFileSize } from "../utils/file-size.js";

function buildMediaMessageId(
  ctx: HandlerContext,
  e: { at: number; _declarationOrder?: number },
  from: string,
  kind: string,
  explicitMessageId?: string,
) {
  if (explicitMessageId) return explicitMessageId;
  const declarationOrder = (e as { _declarationOrder?: number })
    ._declarationOrder;
  const fallbackIndex = ctx.conversation.messages.length;
  const orderSuffix = declarationOrder ?? fallbackIndex;
  return `msg_${e.at}_${from}_${kind}_${orderSuffix}`;
}

function bumpUnread(ctx: HandlerContext, from: string): void {
  if (from === "me" || from === "system") return;
  if (ctx.state.conversationId === ctx.conversation.id) {
    return;
  }
  ctx.conversation.unreadCount = (ctx.conversation.unreadCount ?? 0) + 1;
}

function markUnreadBoundary(
  ctx: HandlerContext,
  from: string,
  messageId: string,
): void {
  if (from === "me" || from === "system") return;
  if (ctx.state.conversationId === ctx.conversation.id) {
    return;
  }
  if ((ctx.conversation.unreadCount ?? 0) === 0) {
    ctx.conversation.unreadDividerMessageId = messageId;
  }
}

function inferFileType(fileName?: string, fallback?: string): string | undefined {
  if (!fileName) return fallback;
  const match = fileName.match(/\.([a-z0-9]+)$/i);
  return match ? match[1] : fallback;
}

const MEDIA_TYPES = new Set<WhatsAppMessage["type"]>([
  "image",
  "video",
  "voice",
  "gif",
  "sticker",
  "document",
  "location",
]);

const PLAYABLE_MEDIA_TYPES = new Set<WhatsAppMessage["type"]>([
  "video",
  "voice",
  "gif",
]);

const VIEWABLE_MEDIA_TYPES = new Set<WhatsAppMessage["type"]>([
  "image",
  "video",
  "gif",
  "sticker",
  "document",
  "location",
]);

function requireMediaMessage(
  ctx: HandlerContext,
  messageId: string,
  operation: string,
): WhatsAppMessage & { media: WhatsAppMediaLifecycle } {
  const message = ctx.requireMessageById(messageId, operation);
  if (!MEDIA_TYPES.has(message.type) || !message.media) {
    throw new Error(
      `Cannot ${operation}: WhatsApp message "${messageId}" has non-media type "${message.type}"`,
    );
  }
  return message as WhatsAppMessage & { media: WhatsAppMediaLifecycle };
}

function getWhatsAppState(ctx: HandlerContext): WhatsAppState {
  return ctx.state;
}

export function registerMediaHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<ImageReceivedEvent>("IMAGE_RECEIVED", (ctx, e) => {
    const payload = e.payload;
    const from = payload.from;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "img", payload.messageId),
      from,
      type: "image",
      imageUrl: payload.url,
      caption: payload.caption,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    markUnreadBoundary(ctx, from, msg.id);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<ImageSentEvent>("IMAGE_SENT", (ctx, e) => {
    const payload = e.payload;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "img", payload.messageId),
      from: "me",
      type: "image",
      imageUrl: payload.url,
      caption: payload.caption,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
      deliveredAt: e.at + 18,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<VideoReceivedEvent>("VIDEO_RECEIVED", (ctx, e) => {
    const payload = e.payload;
    const from = payload.from;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "vid", payload.messageId),
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
    markUnreadBoundary(ctx, from, msg.id);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<VideoSentEvent>("VIDEO_SENT", (ctx, e) => {
    const payload = e.payload;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "vid", payload.messageId),
      from: "me",
      type: "video",
      thumbnailUrl: payload.url,
      videoUrl: payload.url,
      duration: payload.duration ?? 10,
      caption: payload.caption,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
      deliveredAt: e.at + 18,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<VoiceReceivedEvent>("VOICE_RECEIVED", (ctx, e) => {
    const payload = e.payload;
    const from = payload.from;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "voice", payload.messageId),
      from,
      type: "voice",
      duration: payload.duration ?? 5,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    markUnreadBoundary(ctx, from, msg.id);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<VoiceSentEvent>("VOICE_SENT", (ctx, e) => {
    const payload = e.payload;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "voice", payload.messageId),
      from: "me",
      type: "voice",
      duration: payload.duration ?? 5,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
      deliveredAt: e.at + 18,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<GifReceivedEvent>("GIF_RECEIVED", (ctx, e) => {
    const payload = e.payload;
    const from = payload.from;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "gif", payload.messageId),
      from,
      type: "gif",
      gifUrl: payload.url,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    markUnreadBoundary(ctx, from, msg.id);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<GifSentEvent>("GIF_SENT", (ctx, e) => {
    const payload = e.payload;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "gif", payload.messageId),
      from: "me",
      type: "gif",
      gifUrl: payload.url,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
      deliveredAt: e.at + 18,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<StickerReceivedEvent>("STICKER_RECEIVED", (ctx, e) => {
    const payload = e.payload;
    const from = payload.from;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "sticker", payload.messageId),
      from,
      type: "sticker",
      stickerUrl: payload.url,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    markUnreadBoundary(ctx, from, msg.id);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<StickerSentEvent>("STICKER_SENT", (ctx, e) => {
    const payload = e.payload;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "sticker", payload.messageId),
      from: "me",
      type: "sticker",
      stickerUrl: payload.url,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
      deliveredAt: e.at + 18,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<DocumentReceivedEvent>(
    "DOCUMENT_RECEIVED",
    (ctx, e) => {
    const payload = e.payload;
    const from = payload.from;
    const fileSize = formatFileSize(payload.fileSize) ?? "0 KB";
    const fileName = payload.fileName ?? "Document";
    const fileType = payload.fileType ?? inferFileType(fileName, "pdf");
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "doc", payload.messageId),
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
    markUnreadBoundary(ctx, from, msg.id);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<DocumentSentEvent>("DOCUMENT_SENT", (ctx, e) => {
    const payload = e.payload;
    const fileSize = formatFileSize(payload.fileSize) ?? "0 KB";
    const fileName = payload.fileName ?? "Document";
    const fileType = payload.fileType ?? inferFileType(fileName, "pdf");
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "doc", payload.messageId),
      from: "me",
      type: "document",
      documentUrl: payload.url,
      fileName,
      fileSize,
      fileType,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
      deliveredAt: e.at + 18,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<ContactReceivedEvent>("CONTACT_RECEIVED", (ctx, e) => {
    const payload = e.payload;
    const from = payload.from;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "contact", payload.messageId),
      from,
      type: "contact",
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      contactAvatarUrl: payload.contactAvatarUrl,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    markUnreadBoundary(ctx, from, msg.id);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<ContactSentEvent>("CONTACT_SENT", (ctx, e) => {
    const payload = e.payload;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "contact", payload.messageId),
      from: "me",
      type: "contact",
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      contactAvatarUrl: payload.contactAvatarUrl,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
      deliveredAt: e.at + 18,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<LocationReceivedEvent>("LOCATION_RECEIVED", (ctx, e) => {
    const payload = e.payload;
    const from = payload.from;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, from, "loc", payload.messageId),
      from,
      type: "location",
      latitude: payload.latitude,
      longitude: payload.longitude,
      locationName: payload.locationName,
      locationAddress: payload.locationAddress,
      mapThumbnailUrl: payload.mapThumbnailUrl,
      timestamp: ctx.generateTimestamp(e.at),
      status: "delivered",
      at: e.at,
    };
    ctx.addMessage(msg);
    markUnreadBoundary(ctx, from, msg.id);
    bumpUnread(ctx, from);
  });

  registry.registerHandler<LocationSentEvent>("LOCATION_SENT", (ctx, e) => {
    const payload = e.payload;
    const msg: WhatsAppMessage = {
      id: buildMediaMessageId(ctx, e, "me", "loc", payload.messageId),
      from: "me",
      type: "location",
      latitude: payload.latitude,
      longitude: payload.longitude,
      locationName: payload.locationName,
      locationAddress: payload.locationAddress,
      mapThumbnailUrl: payload.mapThumbnailUrl,
      timestamp: ctx.generateTimestamp(e.at),
      status: "sent",
      at: e.at,
      deliveredAt: e.at + 18,
    };
    ctx.addMessage(msg);
  });

  registry.registerHandler<MediaDownloadStartedEvent>(
    "MEDIA_DOWNLOAD_STARTED",
    (ctx, e) => {
      const message = requireMediaMessage(
        ctx,
        e.payload.messageId,
        "start media download",
      );
      if (!new Set(["remote", "failed"]).has(message.media.transferState)) {
        throw new Error(
          `Cannot start media download for "${message.id}" from state "${message.media.transferState}"`,
        );
      }
      message.media.transferState = "downloading";
      message.media.transferProgress = e.payload.progress ?? 0;
      message.media.failureReason = undefined;
    },
  );

  registry.registerHandler<MediaDownloadProgressEvent>(
    "MEDIA_DOWNLOAD_PROGRESS",
    (ctx, e) => {
      const message = requireMediaMessage(
        ctx,
        e.payload.messageId,
        "update media download",
      );
      if (message.media.transferState !== "downloading") {
        throw new Error(
          `Cannot update media download for "${message.id}" from state "${message.media.transferState}"`,
        );
      }
      if (e.payload.progress === undefined) {
        throw new Error("MediaDownloadProgress requires progress");
      }
      message.media.transferProgress = e.payload.progress;
    },
  );

  registry.registerHandler<MediaDownloadCompletedEvent>(
    "MEDIA_DOWNLOAD_COMPLETED",
    (ctx, e) => {
      const message = requireMediaMessage(
        ctx,
        e.payload.messageId,
        "complete media download",
      );
      if (message.media.transferState !== "downloading") {
        throw new Error(
          `Cannot complete media download for "${message.id}" from state "${message.media.transferState}"`,
        );
      }
      message.media.transferState = "ready";
      message.media.transferProgress = 1;
      message.media.failureReason = undefined;
    },
  );

  registry.registerHandler<MediaDownloadFailedEvent>(
    "MEDIA_DOWNLOAD_FAILED",
    (ctx, e) => {
      const message = requireMediaMessage(
        ctx,
        e.payload.messageId,
        "fail media download",
      );
      if (message.media.transferState !== "downloading") {
        throw new Error(
          `Cannot fail media download for "${message.id}" from state "${message.media.transferState}"`,
        );
      }
      message.media.transferState = "failed";
      message.media.failureReason = e.payload.failureReason ?? "download_failed";
    },
  );

  registry.registerHandler<MediaPlaybackStartedEvent>(
    "MEDIA_PLAYBACK_STARTED",
    (ctx, e) => {
      const message = requireMediaMessage(
        ctx,
        e.payload.messageId,
        "start media playback",
      );
      if (!PLAYABLE_MEDIA_TYPES.has(message.type)) {
        throw new Error(`WhatsApp media type "${message.type}" is not playable`);
      }
      if (message.media.transferState !== "ready") {
        throw new Error(`Cannot play media "${message.id}" before it is ready`);
      }
      message.media.playbackState = "playing";
      message.media.playbackProgress = e.payload.progress ?? 0;
    },
  );

  registry.registerHandler<MediaPlaybackProgressEvent>(
    "MEDIA_PLAYBACK_PROGRESS",
    (ctx, e) => {
      const message = requireMediaMessage(
        ctx,
        e.payload.messageId,
        "update media playback",
      );
      if (message.media.playbackState !== "playing") {
        throw new Error(
          `Cannot update media playback for "${message.id}" from state "${message.media.playbackState}"`,
        );
      }
      if (e.payload.progress === undefined) {
        throw new Error("MediaPlaybackProgress requires progress");
      }
      message.media.playbackProgress = e.payload.progress;
    },
  );

  registry.registerHandler<MediaPlaybackPausedEvent>(
    "MEDIA_PLAYBACK_PAUSED",
    (ctx, e) => {
      const message = requireMediaMessage(
        ctx,
        e.payload.messageId,
        "pause media playback",
      );
      if (message.media.playbackState !== "playing") {
        throw new Error(
          `Cannot pause media playback for "${message.id}" from state "${message.media.playbackState}"`,
        );
      }
      message.media.playbackState = "paused";
      if (e.payload.progress !== undefined) {
        message.media.playbackProgress = e.payload.progress;
      }
    },
  );

  registry.registerHandler<MediaPlaybackCompletedEvent>(
    "MEDIA_PLAYBACK_COMPLETED",
    (ctx, e) => {
      const message = requireMediaMessage(
        ctx,
        e.payload.messageId,
        "complete media playback",
      );
      if (!new Set(["playing", "paused"]).has(message.media.playbackState)) {
        throw new Error(
          `Cannot complete media playback for "${message.id}" from state "${message.media.playbackState}"`,
        );
      }
      message.media.playbackState = "complete";
      message.media.playbackProgress = 1;
    },
  );

  registry.registerHandler<MediaViewerOpenedEvent>(
    "MEDIA_VIEWER_OPENED",
    (ctx, e) => {
      const message = requireMediaMessage(
        ctx,
        e.payload.messageId,
        "open media viewer",
      );
      if (!VIEWABLE_MEDIA_TYPES.has(message.type)) {
        throw new Error(`WhatsApp media type "${message.type}" cannot open in viewer`);
      }
      if (message.media.transferState !== "ready") {
        throw new Error(`Cannot open media "${message.id}" before it is ready`);
      }
      getWhatsAppState(ctx).mediaViewer = {
        conversationId: e.payload.conversationId,
        messageId: e.payload.messageId,
        openedAt: e.at,
      };
    },
  );

  registry.registerHandler<MediaViewerClosedEvent>(
    "MEDIA_VIEWER_CLOSED",
    (ctx) => {
      const state = getWhatsAppState(ctx);
      if (!state.mediaViewer) {
        throw new Error("Cannot close WhatsApp media viewer when it is not open");
      }
      state.mediaViewer = null;
    },
  );

}
