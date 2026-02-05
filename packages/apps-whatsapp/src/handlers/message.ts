import { registerHandler } from "./registry";
import type {
  MessageReceivedEvent,
  MessageSentEvent,
  MessageReadEvent,
  MessageDeletedEvent,
  MessageEditedEvent,
  MessageForwardedEvent,
} from "../schemas";
import type { WhatsAppMessage, WhatsAppMessageType } from "../types";

let registered = false;

function bumpUnread(ctx: { draft: unknown; conversation: { id: string; unreadCount?: number } }, from: string): void {
  if (from === "me" || from === "system") return;
  const appState = (ctx.draft as { appState?: { app_whatsapp?: { currentConversationId?: string } } })
    .appState?.app_whatsapp;
  if (appState?.currentConversationId && appState.currentConversationId === ctx.conversation.id) {
    return;
  }
  ctx.conversation.unreadCount = (ctx.conversation.unreadCount ?? 0) + 1;
}

export function registerMessageHandlers(): void {
  if (registered) return;
  registered = true;

  registerHandler<MessageReceivedEvent>("MessageReceived", (ctx, e) => {
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

    if (payload.replyTo) {
      newMessage.replyTo = {
        messageId: payload.replyTo.messageId ?? payload.replyTo.id,
        text: payload.replyTo.text,
        from: payload.replyTo.from,
        type: payload.replyTo.type as WhatsAppMessageType,
        thumbnailUrl: payload.replyTo.thumbnailUrl,
      };
    }

    ctx.addMessage(newMessage);
    bumpUnread(ctx, fromUser);
  });

  registerHandler<MessageSentEvent>("MessageSent", (ctx, e) => {
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

    if (payload.replyTo) {
      newMessage.replyTo = {
        messageId: payload.replyTo.messageId ?? payload.replyTo.id,
        text: payload.replyTo.text,
        from: payload.replyTo.from,
        type: payload.replyTo.type as WhatsAppMessageType,
        thumbnailUrl: payload.replyTo.thumbnailUrl,
      };
    }

    ctx.addMessage(newMessage);
  });

  registerHandler<MessageReadEvent>("MessageRead", (ctx, e) => {
    const msg = ctx.getMessageById(e.messageId);
    if (msg) {
      msg.status = "read";
    }
  });

  registerHandler<MessageDeletedEvent>("MessageDeleted", (ctx, e) => {
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

  registerHandler<MessageEditedEvent>("MessageEdited", (ctx, e) => {
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

  registerHandler<MessageForwardedEvent>("MessageForwarded", (ctx, e) => {
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
