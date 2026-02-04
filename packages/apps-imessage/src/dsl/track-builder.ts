import { parseTimeToFrames } from "@tokovo/dsl";
import { IMESSAGE_APP_ID } from "../constants";
import type {
  IMessageAttachment,
  IMessageBubbleEffect,
  IMessageTapbackType,
  MessageReference,
} from "../types";
import type { IMessageTrackEvent } from "../types";
import type { IMessageConversation, IMessageParticipant } from "../types";

type GetDeclarationOrder = () => number;

type PayloadInput<T> = T | ((order: number) => T);

function resolvePayload<T>(payload: PayloadInput<T>, order: number): T {
  return typeof payload === "function" ? (payload as (o: number) => T)(order) : payload;
}

function createMessageId(frame: number, order: number) {
  return `msg-${frame}-${order}`;
}

function createConversationId(frame: number, order: number) {
  return `conv-${frame}-${order}`;
}

export interface SendMessageInput {
  text?: string;
  attachments?: IMessageAttachment[];
  messageId?: string;
  replyTo?: MessageReference;
  mentions?: string[];
  effect?: IMessageBubbleEffect;
  typed?: boolean;
  charDelay?: number;
}

export interface ReceiveMessageInput {
  from: string;
  text?: string;
  attachments?: IMessageAttachment[];
  messageId?: string;
  replyTo?: MessageReference;
  mentions?: string[];
  silent?: boolean;
}

export interface TapbackInput {
  type: IMessageTapbackType;
  messageId?: string;
  messageRef?: MessageReference;
  fromMe?: boolean;
}

export class IMessagePointBuilder {
  constructor(
    private _frame: number,
    private _deviceId: string,
    private _conversationId: string,
    private _events: IMessageTrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) { }

  private _push<T extends IMessageTrackEvent["type"]>(
    type: T,
    payload: PayloadInput<Extract<IMessageTrackEvent, { type: T }>["payload"]>,
    duration?: number,
  ) {
    const order = this._getOrder();
    const resolvedPayload = resolvePayload(payload, order);
    this._events.push({
      kind: "APP",
      appId: IMESSAGE_APP_ID,
      type,
      payload: resolvedPayload,
      at: this._frame,
      duration: duration ?? 0,
      deviceId: this._deviceId,
      conversationId: this._conversationId,
      _declarationOrder: order,
    } as IMessageTrackEvent);
  }

  createConversation(conversation: Partial<IMessageConversation>) {
    this._push("IMESSAGE_CONVERSATION_CREATE", (order) => ({
      conversation: {
        id: conversation.id ?? createConversationId(this._frame, order),
        title: conversation.title,
        avatar: conversation.avatar,
        transport: conversation.transport ?? "imessage",
        participants: conversation.participants ?? [],
        messages: conversation.messages ?? [],
        typing: conversation.typing ?? {},
        unreadCount: conversation.unreadCount ?? 0,
        isGroup: conversation.isGroup ?? false,
      },
    }));
  }

  updateConversation(conversationId: string, update: Partial<IMessageConversation>) {
    this._push("IMESSAGE_CONVERSATION_UPDATE", {
      conversationId,
      title: update.title,
      avatar: update.avatar,
      transport: update.transport,
    });
  }

  openConversation(conversationId: string) {
    this._push("IMESSAGE_CONVERSATION_OPEN", { conversationId });
  }

  sendMessage(input: SendMessageInput) {
    this._push("IMESSAGE_MESSAGE_SEND", (order) => ({
      conversationId: this._conversationId,
      text: input.text,
      attachments: input.attachments,
      messageId: input.messageId ?? createMessageId(this._frame, order),
      replyTo: input.replyTo,
      mentions: input.mentions,
      effect: input.effect,
      typed: input.typed,
      charDelay: input.charDelay,
    }));
  }

  receiveMessage(input: ReceiveMessageInput) {
    this._push("IMESSAGE_MESSAGE_RECEIVE", (order) => ({
      conversationId: this._conversationId,
      from: input.from,
      text: input.text,
      attachments: input.attachments,
      messageId: input.messageId ?? createMessageId(this._frame, order),
      replyTo: input.replyTo,
      mentions: input.mentions,
      silent: input.silent,
    }));
  }

  send(text: string, options?: Omit<SendMessageInput, "text">) {
    this.sendMessage({ text, ...options });
  }

  receive(
    from: string,
    text: string,
    options?: Omit<ReceiveMessageInput, "from" | "text">,
  ) {
    this.receiveMessage({ from, text, ...options });
  }

  sendMedia(
    attachments: IMessageAttachment[],
    options?: Omit<SendMessageInput, "attachments">,
  ) {
    this.sendMessage({ attachments, ...options });
  }

  receiveMedia(
    from: string,
    attachments: IMessageAttachment[],
    options?: Omit<ReceiveMessageInput, "attachments" | "from">,
  ) {
    this.receiveMessage({ from, attachments, ...options });
  }

  typing(actor: string, isTyping: boolean) {
    if (isTyping) {
      this.typingStart(actor);
    } else {
      this.typingEnd(actor);
    }
  }

  editMessage(messageId: string, newText: string) {
    this._push("IMESSAGE_MESSAGE_EDIT", {
      conversationId: this._conversationId,
      messageId,
      newText,
    });
  }

  deleteMessage(messageId: string, deletedForEveryone = true) {
    this._push("IMESSAGE_MESSAGE_DELETE", {
      conversationId: this._conversationId,
      messageId,
      deletedForEveryone,
    });
  }

  setMessageStatus(messageId: string, status: "sending" | "sent" | "delivered" | "read") {
    this._push("IMESSAGE_MESSAGE_STATUS_SET", {
      conversationId: this._conversationId,
      messageId,
      status,
    });
  }

  tapback(input: TapbackInput) {
    this._push("IMESSAGE_TAPBACK_ADD", {
      conversationId: this._conversationId,
      messageId: input.messageId,
      messageRef: input.messageRef,
      type: input.type,
      fromMe: input.fromMe ?? true,
    });
  }

  removeTapback(input: TapbackInput) {
    this._push("IMESSAGE_TAPBACK_REMOVE", {
      conversationId: this._conversationId,
      messageId: input.messageId,
      messageRef: input.messageRef,
      type: input.type,
      fromMe: input.fromMe ?? true,
    });
  }

  typingStart(actor: string) {
    this._push("IMESSAGE_TYPING_START", {
      conversationId: this._conversationId,
      actor,
    });
  }

  typingEnd(actor: string) {
    this._push("IMESSAGE_TYPING_END", {
      conversationId: this._conversationId,
      actor,
    });
  }

  read(messageId?: string) {
    this._push("IMESSAGE_MESSAGE_READ", {
      conversationId: this._conversationId,
      messageId,
    });
  }

  addGroupMember(member: IMessageParticipant, actor?: string) {
    this._push("IMESSAGE_GROUP_MEMBER_ADD", {
      conversationId: this._conversationId,
      member,
      actor,
    });
  }

  removeGroupMember(memberId: string, memberName?: string, actor?: string) {
    this._push("IMESSAGE_GROUP_MEMBER_REMOVE", {
      conversationId: this._conversationId,
      memberId,
      memberName,
      actor,
    });
  }

  changeGroupName(name: string, actor?: string) {
    this._push("IMESSAGE_GROUP_NAME_CHANGE", {
      conversationId: this._conversationId,
      name,
      actor,
    });
  }

  changeGroupAvatar(avatar: string, actor?: string) {
    this._push("IMESSAGE_GROUP_AVATAR_CHANGE", {
      conversationId: this._conversationId,
      avatar,
      actor,
    });
  }

  setScreen(screen: "list" | "chat" | "info" | "media") {
    this._push("IMESSAGE_SET_SCREEN", {
      screen,
      conversationId: this._conversationId,
    });
  }

  setDraft(text: string) {
    this._push("IMESSAGE_SET_DRAFT", {
      conversationId: this._conversationId,
      text,
    });
  }

  clearDraft() {
    this._push("IMESSAGE_CLEAR_DRAFT", {
      conversationId: this._conversationId,
      text: "",
    });
  }

  setThemeMode(mode: "light" | "dark") {
    this._push("IMESSAGE_SET_THEME_MODE", { mode });
  }
}

export class IMessageTrackBuilder {
  _events: IMessageTrackEvent[] = [];
  private _currentFrame = 0;
  private _conversationId = "";

  constructor(
    private _fps: number,
    private _deviceId: string,
    conversationId: string,
    private _getOrder: GetDeclarationOrder,
  ) {
    this._conversationId = conversationId;
  }

  private _point() {
    return new IMessagePointBuilder(
      this._currentFrame,
      this._deviceId,
      this._conversationId,
      this._events,
      this._getOrder,
    );
  }

  at(time: string | number): IMessagePointBuilder {
    this._currentFrame =
      typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return this._point();
  }

  span(start: string | number, end: string | number): IMessagePointBuilder {
    const startFrame =
      typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
    const endFrame =
      typeof end === "number" ? end : parseTimeToFrames(end, this._fps);
    const _duration = Math.max(0, endFrame - startFrame);
    this._currentFrame = startFrame;
    return new IMessagePointBuilder(
      startFrame,
      this._deviceId,
      this._conversationId,
      this._events,
      this._getOrder,
    );
  }

  openConversation(conversationId: string) {
    this._conversationId = conversationId;
    this._point().openConversation(conversationId);
    return this;
  }

  send(text: string, options?: Omit<SendMessageInput, "text">) {
    this._point().sendMessage({ text, ...options });
    return this;
  }

  receive(from: string, text: string, options?: Omit<ReceiveMessageInput, "from" | "text">) {
    this._point().receiveMessage({ from, text, ...options });
    return this;
  }

  sendMedia(attachments: IMessageAttachment[], options?: Omit<SendMessageInput, "attachments">) {
    this._point().sendMessage({ attachments, ...options });
    return this;
  }

  receiveMedia(from: string, attachments: IMessageAttachment[], options?: Omit<ReceiveMessageInput, "attachments" | "from">) {
    this._point().receiveMessage({ from, attachments, ...options });
    return this;
  }

  typing(actor: string, isTyping: boolean) {
    if (isTyping) {
      this._point().typingStart(actor);
    } else {
      this._point().typingEnd(actor);
    }
    return this;
  }

  tapback(input: TapbackInput) {
    this._point().tapback(input);
    return this;
  }

  read(messageId?: string) {
    this._point().read(messageId);
    return this;
  }

  getEvents() {
    return this._events;
  }
}

export function createIMessageTrackBuilder(
  fps: number,
  deviceId: string,
  getOrder: GetDeclarationOrder,
) {
  return new IMessageTrackBuilder(fps, deviceId, "", getOrder);
}
