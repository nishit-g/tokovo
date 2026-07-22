import type { MutableHandlerRegistry } from "./registry.js";
import type {
  MessageReceivedEvent,
  MessageSentEvent,
  MessageReadEvent,
  MessageDeletedEvent,
  MessageEditedEvent,
  MessageForwardedEvent,
  MessageDeliveryFailedEvent,
  MessageRetryStartedEvent,
  MessageRetryCompletedEvent,
} from "../schemas/index.js";
import type { WhatsAppMessage, WhatsAppMessageType } from "../types/index.js";
import type { HandlerContext } from "./registry.js";
import { translateWhatsApp } from "../localization/index.js";
import type { WhatsAppLocale } from "../localization/index.js";

function isConversationActive(
  ctx: Pick<HandlerContext, "state" | "conversation">,
): boolean {
  return ctx.state.conversationId === ctx.conversation.id;
}

function bumpUnread(
  ctx: Pick<HandlerContext, "state" | "conversation">,
  from: string,
): void {
  if (from === "me" || from === "system") return;
  if (isConversationActive(ctx)) {
    return;
  }
  ctx.conversation.unreadCount = (ctx.conversation.unreadCount ?? 0) + 1;
}

type ReplyPayload = {
  messageId: string;
  text?: string;
  from?: string;
  type?: string;
  thumbnailUrl?: string;
};

function getReplyFallbackText(
  message: WhatsAppMessage | undefined,
  locale: WhatsAppLocale,
): string | undefined {
  if (!message) return undefined;
  if (message.text) return message.text;
  if (message.caption) return message.caption;
  switch (message.type) {
    case "image":
      return translateWhatsApp(locale, "message.photo");
    case "video":
      return translateWhatsApp(locale, "message.video");
    case "voice":
      return translateWhatsApp(locale, "message.voice");
    case "gif":
      return translateWhatsApp(locale, "message.gif");
    case "sticker":
      return translateWhatsApp(locale, "message.sticker");
    case "document":
      return message.fileName ?? translateWhatsApp(locale, "message.document");
    case "contact":
      return message.contactName ?? translateWhatsApp(locale, "message.contact");
    case "location":
      return message.locationName ?? translateWhatsApp(locale, "message.location");
    case "call":
      return translateWhatsApp(
        locale,
        message.callType === "video" ? "message.videoCall" : "message.voiceCall",
      );
    case "call_missed":
      return translateWhatsApp(
        locale,
        message.callType === "video"
          ? "message.missedVideoCall"
          : "message.missedVoiceCall",
      );
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
    messageId: string;
    text?: string;
    from?: string;
    type?: WhatsAppMessageType;
    thumbnailUrl?: string;
  }
  | undefined {
  if (!replyTo) return undefined;

  const target = ctx.requireMessageById(replyTo.messageId, "reply to message");
  const locale = ctx.state.locale;
  return {
    messageId: replyTo.messageId,
    text: replyTo.text ?? getReplyFallbackText(target, locale),
    from: replyTo.from ?? target?.senderName ?? target?.from,
    type: (replyTo.type as WhatsAppMessageType | undefined) ?? target?.type,
    thumbnailUrl: replyTo.thumbnailUrl ?? getReplyThumbnail(target),
  };
}

export function registerMessageHandlers(
  registry: MutableHandlerRegistry,
): void {
  registry.registerHandler<MessageReceivedEvent>("MESSAGE_RECEIVED", (ctx, e) => {
    const payload = e.payload;

    const fromUser = payload.from;
    const textContent = payload.text;
    const msgType = (payload.messageType ?? "text") as WhatsAppMessageType;
    const declarationOrder = (e as { _declarationOrder?: number })
      ._declarationOrder;
    const fallbackIndex = ctx.conversation.messages.length;
    const msgId =
      payload.messageId ??
      `msg_${e.at}_${fromUser}_${declarationOrder ?? fallbackIndex}`;

    const newMessage: WhatsAppMessage = {
      id: msgId,
      from: fromUser,
      type: msgType,
      text: textContent,
      at: e.at,
      status: "delivered",
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

    if (msgType === "system") {
      newMessage.systemType = payload.systemType;
    } else if (msgType === "call" || msgType === "call_missed") {
      newMessage.callType = payload.callType as WhatsAppMessage["callType"];
      newMessage.duration = payload.callDuration;
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

  registry.registerHandler<MessageSentEvent>("MESSAGE_SENT", (ctx, e) => {
    const payload = e.payload;

    const textContent = payload.text;
    const msgType = (payload.messageType ?? "text") as WhatsAppMessageType;
    const declarationOrder = (e as { _declarationOrder?: number })
      ._declarationOrder;
    const fallbackIndex = ctx.conversation.messages.length;
    const msgId =
      payload.messageId ??
      `msg_${e.at}_me_${declarationOrder ?? fallbackIndex}`;

    const newMessage: WhatsAppMessage = {
      id: msgId,
      from: "me",
      type: msgType,
      text: textContent,
      at: e.at,
      status: "sent",
      timestamp: ctx.generateTimestamp(e.at),
      deliveredAt: e.at + 18,
    };

    if (msgType === "call" || msgType === "call_missed") {
      newMessage.callType = payload.callType as WhatsAppMessage["callType"];
      newMessage.duration = payload.callDuration;
    }

    const replyPreview = buildReplyPreview(ctx, payload.replyTo as ReplyPayload | undefined);
    if (replyPreview) {
      newMessage.replyTo = replyPreview;
    }

    ctx.addMessage(newMessage);
  });

  registry.registerHandler<MessageReadEvent>("MESSAGE_READ", (ctx, e) => {
    const msg = ctx.requireMessageById(
      e.payload.messageId,
      "mark message as read",
    );
    msg.status = "read";
    msg.readAt = e.at;
  });

  registry.registerHandler<MessageDeliveryFailedEvent>(
    "MESSAGE_DELIVERY_FAILED",
    (ctx, e) => {
      const message = ctx.requireMessageById(
        e.payload.messageId,
        "fail message delivery",
      );
      if (message.from !== "me") {
        throw new Error(
          `Cannot fail delivery for incoming WhatsApp message "${message.id}"`,
        );
      }
      message.status = "failed";
      message.failureReason = e.payload.failureReason;
      message.deliveredAt = undefined;
      message.readAt = undefined;
    },
  );

  registry.registerHandler<MessageRetryStartedEvent>(
    "MESSAGE_RETRY_STARTED",
    (ctx, e) => {
      const message = ctx.requireMessageById(
        e.payload.messageId,
        "retry message delivery",
      );
      if (message.from !== "me" || message.status !== "failed") {
        throw new Error(
          `Cannot retry WhatsApp message "${message.id}" unless its outgoing delivery failed`,
        );
      }
      message.status = "sending";
      message.failureReason = undefined;
      message.retryCount = (message.retryCount ?? 0) + 1;
      message.lastRetryAt = e.at;
    },
  );

  registry.registerHandler<MessageRetryCompletedEvent>(
    "MESSAGE_RETRY_COMPLETED",
    (ctx, e) => {
      const message = ctx.requireMessageById(
        e.payload.messageId,
        "complete message retry",
      );
      if (message.from !== "me" || message.status !== "sending") {
        throw new Error(
          `Cannot complete retry for WhatsApp message "${message.id}" unless it is sending`,
        );
      }
      message.status = "sent";
      message.deliveredAt = e.at + 18;
    },
  );

  registry.registerHandler<MessageDeletedEvent>("MESSAGE_DELETED", (ctx, e) => {
    const payload = e.payload;
    const targetMsg = ctx.requireMessageById(payload.messageId, "delete message");
    targetMsg.originalType = targetMsg.type;
    targetMsg.originalText = targetMsg.text;
    targetMsg.type = "deleted";
    targetMsg.text = undefined;
    targetMsg.deletedAt = e.at;
    targetMsg.deletedBy = payload.deletedBy ?? "me";
    targetMsg.deletedForEveryone = payload.deletedForEveryone ?? true;
  });

  registry.registerHandler<MessageEditedEvent>("MESSAGE_EDITED", (ctx, e) => {
    const payload = e.payload;
    const targetMsg = ctx.requireMessageById(payload.messageId, "edit message");
    targetMsg.originalText = targetMsg.text;
    targetMsg.text = payload.newText;
    targetMsg.edited = true;
    targetMsg.editedAt = e.at;
  });

  registry.registerHandler<MessageForwardedEvent>("MESSAGE_FORWARDED", (ctx, e) => {
    const payload = e.payload;
    const sourceMsg = ctx.requireMessageById(
      payload.sourceMessageId,
      "forward message",
    );

    const newMessage: WhatsAppMessage = {
      id: payload.messageId ?? `msg_${e.at}_fwd`,
      from: "me",
      type:
        sourceMsg.type ?? (payload.messageType as WhatsAppMessageType) ?? "text",
      text: sourceMsg.text ?? payload.text,
      at: e.at,
      status: "sent",
      timestamp: ctx.generateTimestamp(e.at),
      isForwarded: true,
      forwardedFrom: payload.forwardedFrom,
    };

    if (sourceMsg.imageUrl) newMessage.imageUrl = sourceMsg.imageUrl;
    if (sourceMsg.videoUrl) newMessage.videoUrl = sourceMsg.videoUrl;
    if (sourceMsg.gifUrl) newMessage.gifUrl = sourceMsg.gifUrl;
    if (payload.imageUrl) newMessage.imageUrl = payload.imageUrl;
    if (payload.videoUrl) newMessage.videoUrl = payload.videoUrl;
    if (payload.gifUrl) newMessage.gifUrl = payload.gifUrl;

    ctx.addMessage(newMessage);
  });
}
