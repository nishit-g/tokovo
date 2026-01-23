import { registerHandler } from "./registry";
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

registerHandler<ImageReceivedEvent>("ImageReceived", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_${payload.from ?? e.from}_img`,
    from: payload.from ?? e.from,
    type: "image",
    imageUrl: payload.url,
    caption: payload.caption,
    timestamp: ctx.generateTimestamp(e.at),
    status: "delivered",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<ImageSentEvent>("ImageSent", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_me_img`,
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

registerHandler<VideoReceivedEvent>("VideoReceived", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_${payload.from ?? e.from}_vid`,
    from: payload.from ?? e.from,
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
});

registerHandler<VideoSentEvent>("VideoSent", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_me_vid`,
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

registerHandler<VoiceReceivedEvent>("VoiceReceived", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_${payload.from ?? e.from}_voice`,
    from: payload.from ?? e.from,
    type: "voice",
    duration: payload.duration ?? 5,
    isPlaying: false,
    playProgress: 0,
    timestamp: ctx.generateTimestamp(e.at),
    status: "delivered",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<VoiceSentEvent>("VoiceSent", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_me_voice`,
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

registerHandler<GifReceivedEvent>("GifReceived", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_${payload.from ?? e.from}_gif`,
    from: payload.from ?? e.from,
    type: "gif",
    gifUrl: payload.url,
    timestamp: ctx.generateTimestamp(e.at),
    status: "delivered",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<GifSentEvent>("GifSent", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_me_gif`,
    from: "me",
    type: "gif",
    gifUrl: payload.url,
    timestamp: ctx.generateTimestamp(e.at),
    status: "sent",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<StickerReceivedEvent>("StickerReceived", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_${payload.from ?? e.from}_sticker`,
    from: payload.from ?? e.from,
    type: "sticker",
    stickerUrl: payload.url,
    timestamp: ctx.generateTimestamp(e.at),
    status: "delivered",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<StickerSentEvent>("StickerSent", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_me_sticker`,
    from: "me",
    type: "sticker",
    stickerUrl: payload.url,
    timestamp: ctx.generateTimestamp(e.at),
    status: "sent",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<DocumentReceivedEvent>("DocumentReceived", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_${payload.from ?? e.from}_doc`,
    from: payload.from ?? e.from,
    type: "document",
    documentUrl: payload.url,
    fileName: payload.fileName ?? "Document",
    fileSize: payload.fileSize,
    fileType: payload.fileType ?? "pdf",
    timestamp: ctx.generateTimestamp(e.at),
    status: "delivered",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<DocumentSentEvent>("DocumentSent", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_me_doc`,
    from: "me",
    type: "document",
    documentUrl: payload.url,
    fileName: payload.fileName ?? "Document",
    fileSize: payload.fileSize,
    fileType: payload.fileType ?? "pdf",
    timestamp: ctx.generateTimestamp(e.at),
    status: "sent",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<ContactReceivedEvent>("ContactReceived", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_${payload.from ?? e.from}_contact`,
    from: payload.from ?? e.from,
    type: "contact",
    contactName: payload.name,
    contactPhone: payload.phone,
    contactAvatarUrl: payload.avatar,
    timestamp: ctx.generateTimestamp(e.at),
    status: "delivered",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<ContactSentEvent>("ContactSent", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_me_contact`,
    from: "me",
    type: "contact",
    contactName: payload.name,
    contactPhone: payload.phone,
    contactAvatarUrl: payload.avatar,
    timestamp: ctx.generateTimestamp(e.at),
    status: "sent",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<LocationReceivedEvent>("LocationReceived", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_${payload.from ?? e.from}_loc`,
    from: payload.from ?? e.from,
    type: "location",
    latitude: payload.lat,
    longitude: payload.lng,
    locationName: payload.name,
    locationAddress: payload.address,
    mapThumbnailUrl: payload.mapThumbnailUrl,
    timestamp: ctx.generateTimestamp(e.at),
    status: "delivered",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<LocationSentEvent>("LocationSent", (ctx, e) => {
  const payload = e.payload ?? {};
  const msg: WhatsAppMessage = {
    id: `msg_${e.at}_me_loc`,
    from: "me",
    type: "location",
    latitude: payload.lat,
    longitude: payload.lng,
    locationName: payload.name,
    locationAddress: payload.address,
    mapThumbnailUrl: payload.mapThumbnailUrl,
    timestamp: ctx.generateTimestamp(e.at),
    status: "sent",
    at: e.at,
  };
  ctx.addMessage(msg);
});

registerHandler<VoicePlayEvent>("VoicePlay", (ctx, e) => {
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

registerHandler<VoicePauseEvent>("VoicePause", (ctx, e) => {
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

registerHandler<VoiceMessageReceivedEvent>("VoiceMessageReceived", (ctx, e) => {
  const msg: WhatsAppMessage = {
    id: `voice_${e.at}_${e.from}`,
    from: e.from,
    type: "voice",
    duration: e.duration,
    at: e.at,
    status: "delivered",
  };
  ctx.addMessage(msg);
});
