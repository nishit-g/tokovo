import type { MutableHandlerRegistry } from "./registry.js";
import type {
  MessageReceivedEvent,
  MessageSentEvent,
  MessageReadEvent,
  MessageDeletedEvent,
  MessageEditedEvent,
  MessageForwardedEvent,
} from "../schemas/index.js";
import type { WhatsAppMessage, WhatsAppMessageType } from "../types/index.js";
import type { HandlerContext } from "./registry.js";

function isConversationActive(
  ctx: { draft: unknown; conversation: { id: string } },
): boolean {
  const appState = (
    ctx.draft as {
      appState?: { app_whatsapp?: { currentConversationId?: string } };
    }
  ).appState?.app_whatsapp;
  return !!(
    appState?.currentConversationId &&
    appState.currentConversationId === ctx.conversation.id
  );
}

function bumpUnread(ctx: { draft: unknown; conversation: { id: string; unreadCount?: number } }, from: string): void {
  if (from === "me" || from === "system") return;
  if (isConversationActive(ctx)) {
    return;
  }
  ctx.conversation.unreadCount = (ctx.conversation.unreadCount ?? 0) + 1;
}

type ReplyPayload = {
  messageId?: string;
  id?: string;
  index?: number | "last";
  text?: string;
  from?: string;
  type?: string;
  thumbnailUrl?: string;
};

function resolveReplyTarget(
  ctx: HandlerContext,
  replyTo: ReplyPayload,
): WhatsAppMessage | undefined {
  const messageId = replyTo.messageId ?? replyTo.id;
  if (messageId) {
    return ctx.getMessageById(messageId);
  }

  const indexRef = replyTo.index;
  const messages = ctx.conversation.messages;
  if (indexRef === "last") {
    return messages[messages.length - 1];
  }
  if (typeof indexRef === "number" && indexRef < 0) {
    return messages[messages.length + indexRef];
  }
  if (typeof indexRef === "number") {
    return messages[indexRef];
  }
  return undefined;
}

function getReplyFallbackText(message: WhatsAppMessage | undefined): string | undefined {
  if (!message) return undefined;
  if (message.text) return message.text;
  if (message.caption) return message.caption;
  switch (message.type) {
    case "image":
      return "Photo";
    case "video":
      return "Video";
    case "voice":
      return "Voice message";
    case "gif":
      return "GIF";
    case "sticker":
      return "Sticker";
    case "document":
      return message.fileName ?? "Document";
    case "contact":
      return message.contactName ?? "Contact";
    case "location":
      return message.locationName ?? "Location";
    case "call":
      return message.callType === "video" ? "Video call" : "Voice call";
    case "call_missed":
      return message.callType === "video" ? "Missed video call" : "Missed voice call";
    default:
      return undefined;
  }
}

function getReplyThumbnail(message: WhatsAppMessage | undefined): string | undefined {
  if (!message) return undefined;
  return (
    message.thumbnailUrl ??
    message.imageUrl ??
    message.mapThumbnailUrl ??
    message.contactAvatarUrl
  );
}

function buildReplyPreview(
  ctx: HandlerContext,
  replyTo: ReplyPayload | undefined,
):
  | {
    messageId?: string;
    text?: string;
    from?: string;
    type?: WhatsAppMessageType;
    thumbnailUrl?: string;
  }
  | undefined {
  if (!replyTo) return undefined;

  const target = resolveReplyTarget(ctx, replyTo);
  return {
    messageId: replyTo.messageId ?? replyTo.id ?? target?.id,
    text: replyTo.text ?? getReplyFallbackText(target),
    from: replyTo.from ?? target?.senderName ?? target?.from,
    type: (replyTo.type as WhatsAppMessageType | undefined) ?? target?.type,
    thumbnailUrl: replyTo.thumbnailUrl ?? getReplyThumbnail(target),
  };
}

export function registerMessageHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<MessageReceivedEvent>("MessageReceived", (ctx, e) => {
    const payload = e.payload ?? {};
    const msgPayload = e.message ?? {};

    const fromUser = payload.from ?? e.from ?? "unknown";
    const textContent = payload.text ?? e.text ?? msgPayload.text;
    const msgType = (payload.messageType ??
      msgPayload.type ??
      "text") as WhatsAppMessageType;
    const declarationOrder = (e as { _declarationOrder?: number })
      ._declarationOrder;
    const fallbackIndex = ctx.conversation.messages.length;
    const msgId =
      payload.messageId ??
      msgPayload.id ??
      `msg_${e.at}_${fromUser}_${declarationOrder ?? fallbackIndex}`;

    const newMessage: WhatsAppMessage = {
      id: msgId,
      from: fromUser,
      type: msgType,
      text: textContent,
      at: e.at,
      status: (msgPayload.status as WhatsAppMessage["status"]) ?? "delivered",
      edited: msgPayload.edited,
      timestamp: ctx.generateTimestamp(e.at),
    };

    if (fromUser !== "me") {
      for (let i = ctx.conversation.messages.length - 1; i >= 0; i--) {
        const priorMessage = ctx.conversation.messages[i];
        if (priorMessage.from !== "me") continue;
        if (priorMessage.status === "read") continue;
        priorMessage.status = "read";
        priorMessage.readAt = e.at;
      }
    }

    if (msgType === "image") {
      newMessage.imageUrl = msgPayload.imageUrl;
      newMessage.caption = msgPayload.caption;
    } else if (msgType === "video") {
      newMessage.thumbnailUrl = msgPayload.thumbnailUrl;
      newMessage.videoUrl = msgPayload.videoUrl;
      newMessage.duration = msgPayload.duration ?? 0;
      newMessage.caption = msgPayload.caption;
    } else if (msgType === "gif") {
      newMessage.gifUrl = msgPayload.gifUrl;
    } else if (msgType === "system") {
      newMessage.systemType =
        payload.systemType ??
        (msgPayload as { systemType?: string }).systemType;
    } else if (msgType === "call" || msgType === "call_missed") {
      newMessage.callType = payload.callType as WhatsAppMessage["callType"];
      newMessage.duration =
        (payload.callDuration as number | undefined) ??
        (msgPayload.duration as number | undefined);
    }

    const replyPreview = buildReplyPreview(ctx, payload.replyTo as ReplyPayload | undefined);
    if (replyPreview) {
      newMessage.replyTo = replyPreview;
    }

    const previousUnread = ctx.conversation.unreadCount ?? 0;
    ctx.addMessage(newMessage);
    if (
      fromUser !== "me" &&
      fromUser !== "system" &&
      !isConversationActive(ctx) &&
      previousUnread === 0
    ) {
      ctx.conversation.unreadDividerMessageId = newMessage.id;
    }
    bumpUnread(ctx, fromUser);
  });

  registry.registerHandler<MessageSentEvent>("MessageSent", (ctx, e) => {
    const payload = e.payload ?? {};
    const msgPayload = e.message ?? {};

    const textContent = payload.text ?? e.text ?? msgPayload.text;
    const msgType = (payload.messageType ??
      msgPayload.type ??
      "text") as WhatsAppMessageType;
    const declarationOrder = (e as { _declarationOrder?: number })
      ._declarationOrder;
    const fallbackIndex = ctx.conversation.messages.length;
    const msgId =
      payload.messageId ??
      msgPayload.id ??
      `msg_${e.at}_me_${declarationOrder ?? fallbackIndex}`;

    const newMessage: WhatsAppMessage = {
      id: msgId,
      from: "me",
      type: msgType,
      text: textContent,
      at: e.at,
      status: (msgPayload.status as WhatsAppMessage["status"]) ?? "sent",
      edited: msgPayload.edited,
      timestamp: ctx.generateTimestamp(e.at),
      deliveredAt: e.at + 18,
    };

    if (msgType === "image") {
      newMessage.imageUrl = payload.url ?? msgPayload.imageUrl;
      newMessage.caption = payload.caption ?? msgPayload.caption;
    } else if (msgType === "video") {
      newMessage.thumbnailUrl = msgPayload.thumbnailUrl;
      newMessage.videoUrl = payload.url ?? msgPayload.videoUrl;
      newMessage.duration = payload.durationSeconds ?? msgPayload.duration ?? 0;
      newMessage.caption = payload.caption ?? msgPayload.caption;
    } else if (msgType === "gif") {
      newMessage.gifUrl = payload.url ?? msgPayload.gifUrl;
    } else if (msgType === "system") {
      newMessage.systemType =
        payload.systemType ??
        (msgPayload as { systemType?: string }).systemType;
    } else if (msgType === "call" || msgType === "call_missed") {
      newMessage.callType = payload.callType as WhatsAppMessage["callType"];
      newMessage.duration =
        (payload.callDuration as number | undefined) ??
        (msgPayload.duration as number | undefined);
    }

    const replyPreview = buildReplyPreview(ctx, payload.replyTo as ReplyPayload | undefined);
    if (replyPreview) {
      newMessage.replyTo = replyPreview;
    }

    ctx.addMessage(newMessage);
  });

  registry.registerHandler<MessageReadEvent>("MessageRead", (ctx, e) => {
    const msg = ctx.getMessageById(e.messageId);
    if (msg) {
      msg.status = "read";
      msg.readAt = e.at;
    }
  });

  registry.registerHandler<MessageDeletedEvent>("MessageDeleted", (ctx, e) => {
    const payload = e.payload ?? {};
    const messages = ctx.conversation.messages;

    let targetMsg: WhatsAppMessage | undefined;

    const messageId =
      payload.messageRef?.messageId ??
      payload.messageRef?.id ??
      payload.messageId;
    if (messageId) {
      targetMsg = ctx.getMessageById(messageId);
    }

    const indexRef = payload.messageRef?.index;
    if (!targetMsg && indexRef !== undefined) {
      if (indexRef === "last" || indexRef === -1) {
        targetMsg = messages[messages.length - 1];
      } else if (typeof indexRef === "number" && indexRef < 0) {
        targetMsg = messages[messages.length + indexRef];
      } else if (typeof indexRef === "number") {
        targetMsg = messages[indexRef];
      }
    }

    if (targetMsg) {
      targetMsg.originalType = targetMsg.type;
      targetMsg.originalText = targetMsg.text;
      targetMsg.type = "deleted";
      targetMsg.text = payload.deletedForEveryone
        ? "This message was deleted"
        : "You deleted this message";
      targetMsg.deletedAt = e.at;
      targetMsg.deletedBy = payload.deletedBy ?? "me";
    }
  });

  registry.registerHandler<MessageEditedEvent>("MessageEdited", (ctx, e) => {
    const payload = e.payload;
    if (!payload) return;

    const messages = ctx.conversation.messages;

    let targetMsg: WhatsAppMessage | undefined;

    const messageId =
      payload.messageRef?.messageId ??
      payload.messageRef?.id ??
      payload.messageId;
    if (messageId) {
      targetMsg = ctx.getMessageById(messageId);
    }

    const indexRef = payload.messageRef?.index;
    if (!targetMsg && indexRef !== undefined) {
      if (indexRef === "last" || indexRef === -1) {
        targetMsg = messages[messages.length - 1];
      } else if (typeof indexRef === "number" && indexRef < 0) {
        targetMsg = messages[messages.length + indexRef];
      } else if (typeof indexRef === "number") {
        targetMsg = messages[indexRef];
      }
    }

    if (targetMsg && payload.newText) {
      targetMsg.originalText = targetMsg.text;
      targetMsg.text = payload.newText;
      targetMsg.edited = true;
      targetMsg.editedAt = e.at;
    }
  });

  registry.registerHandler<MessageForwardedEvent>("MessageForwarded", (ctx, e) => {
    const payload = e.payload ?? {};
    const messages = ctx.conversation.messages;

    let sourceMsg: WhatsAppMessage | undefined;
    const indexRef = payload.messageRef?.index;
    if (indexRef !== undefined) {
      if (indexRef === "last" || indexRef === -1) {
        sourceMsg = messages[messages.length - 1];
      } else if (typeof indexRef === "number" && indexRef < 0) {
        sourceMsg = messages[messages.length + indexRef];
      } else if (typeof indexRef === "number") {
        sourceMsg = messages[indexRef];
      }
    }

    const newMessage: WhatsAppMessage = {
      id: payload.messageId ?? `msg_${e.at}_fwd`,
      from: "me",
      type:
        sourceMsg?.type ??
        (payload.messageType as WhatsAppMessageType) ??
        "text",
      text: sourceMsg?.text ?? payload.text,
      at: e.at,
      status: "sent",
      timestamp: ctx.generateTimestamp(e.at),
      isForwarded: true,
      forwardedFrom: payload.forwardedFrom,
    };

    if (sourceMsg?.imageUrl) newMessage.imageUrl = sourceMsg.imageUrl;
    if (sourceMsg?.videoUrl) newMessage.videoUrl = sourceMsg.videoUrl;
    if (sourceMsg?.gifUrl) newMessage.gifUrl = sourceMsg.gifUrl;
    if (payload.imageUrl) newMessage.imageUrl = payload.imageUrl;
    if (payload.videoUrl) newMessage.videoUrl = payload.videoUrl;
    if (payload.gifUrl) newMessage.gifUrl = payload.gifUrl;

    ctx.addMessage(newMessage);
  });
}
