/**
 * WhatsApp v2 Track Builder - App-specific track for WhatsApp events
 *
 * @description Provides DSL verbs for WhatsApp interactions:
 * - receive() - Incoming message
 * - send() - Outgoing message
 * - typing() - Typing indicator
 * - react() - Emoji reaction
 *
 * @see docs-v2/DSL_REVAMP.md#app-track-plugin-system
 */

import type { TrackMessageRef } from "@tokovo/ir";
import type { WhatsAppTrackEvent, WhatsAppEventType } from "../types/events";
import { parseFileSizeToBytes } from "../utils/file-size";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export interface ReceiveOptions {
  silent?: boolean;
  replyTo?: TrackMessageRef;
}

export interface SendOptions {
  silent?: boolean;
  typed?: boolean;
  charDelay?: number;
}

export interface ImageOptions {
  caption?: string;
  height?: number;
}

export interface CallOptions {
  callType?: "voice" | "video";
  duration?: number;
  missed?: boolean;
  text?: string;
}

export interface TypingOptions {
  actor?: string;
}

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

export class WhatsAppPointBuilder {
  constructor(
    private _frame: number,
    private _fps: number,
    private _deviceId: string,
    private _conversationId: string,
    private _events: WhatsAppTrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) { }

  private _push<T extends WhatsAppEventType>(
    type: T,
    payload: Record<string, unknown>,
  ): void {
    this._events.push({
      at: this._frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type,
      conversationId: this._conversationId,
      payload: { conversationId: this._conversationId, ...payload },
      _declarationOrder: this._getOrder(),
    } as WhatsAppTrackEvent);
  }

  receive(from: string, text: string, options: ReceiveOptions = {}): void {
    this._push("MESSAGE_RECEIVED", {
      from,
      text,
      silent: options.silent,
      replyTo: options.replyTo,
    });
  }

  send(text: string, options: SendOptions = {}): void {
    this._push("MESSAGE_SENT", {
      text,
      silent: options.silent,
      typed: options.typed,
      charDelay: options.charDelay,
    });
  }

  receiveCall(from: string, options: CallOptions = {}): void {
    const messageType = options.missed ? "call_missed" : "call";
    this._push("MESSAGE_RECEIVED", {
      from,
      text: options.text ?? "",
      messageType,
      callType: options.callType ?? "voice",
      callDuration: options.duration,
    });
  }

  sendCall(options: CallOptions = {}): void {
    const messageType = options.missed ? "call_missed" : "call";
    this._push("MESSAGE_SENT", {
      text: options.text ?? "",
      messageType,
      callType: options.callType ?? "voice",
      callDuration: options.duration,
    });
  }

  encryptionNotice(text?: string): void {
    this._push("MESSAGE_RECEIVED", {
      from: "system",
      text: text ?? "",
      messageType: "system",
      systemType: "encryption_notice",
    });
  }

  receiveImage(from: string, url: string, options: ImageOptions = {}): void {
    this._push("IMAGE_RECEIVED", {
      from,
      url,
      caption: options.caption,
      height: options.height,
    });
  }

  sendImage(url: string, options: ImageOptions = {}): void {
    this._push("IMAGE_SENT", {
      url,
      caption: options.caption,
      messageType: "image",
    });
  }

  receiveVideo(
    from: string,
    url: string,
    options: { duration?: number; caption?: string } = {},
  ): void {
    this._push("VIDEO_RECEIVED", {
      from,
      url,
      duration: options.duration ?? 10,
      caption: options.caption,
      messageType: "video",
    });
  }

  sendVideo(
    url: string,
    options: { duration?: number; caption?: string } = {},
  ): void {
    this._push("VIDEO_SENT", {
      url,
      duration: options.duration ?? 10,
      caption: options.caption,
      messageType: "video",
    });
  }

  receiveVoice(from: string, duration: number): void {
    this._push("VOICE_RECEIVED", { from, duration, messageType: "voice" });
  }

  sendVoice(duration: number): void {
    this._push("VOICE_SENT", { duration, messageType: "voice" });
  }

  receiveGif(from: string, url: string): void {
    this._push("GIF_RECEIVED", { from, url, messageType: "gif" });
  }

  sendGif(url: string): void {
    this._push("GIF_SENT", { url, messageType: "gif" });
  }

  react(
    messageRef: TrackMessageRef | { messageIndex: number } | { index: number },
    emoji: string,
  ): void {
    let index: number;
    if ("messageIndex" in messageRef) {
      index = (messageRef as { messageIndex: number }).messageIndex;
    } else if ("index" in messageRef) {
      index = (messageRef as { index: number }).index;
    } else {
      index = 0;
    }
    this._push("REACT", { messageRef: { index }, emoji });
  }

  read(): void {
    this._push("READ", {});
  }

  receiveSticker(from: string, url: string): void {
    this._push("STICKER_RECEIVED", { from, url, messageType: "sticker" });
  }

  sendSticker(url: string): void {
    this._push("STICKER_SENT", { url, messageType: "sticker" });
  }

  receiveDocument(
    from: string,
    options: { fileName: string; fileSize: string; fileType?: string },
  ): void {
    const fileSizeBytes = parseFileSizeToBytes(options.fileSize);
    const fileSize = fileSizeBytes ?? options.fileSize;
    this._push("DOCUMENT_RECEIVED", {
      from,
      fileName: options.fileName,
      fileSize,
      fileType: options.fileType,
      messageType: "document",
    });
  }

  sendDocument(options: {
    fileName: string;
    fileSize: string;
    fileType?: string;
  }): void {
    const fileSizeBytes = parseFileSizeToBytes(options.fileSize);
    const fileSize = fileSizeBytes ?? options.fileSize;
    this._push("DOCUMENT_SENT", {
      fileName: options.fileName,
      fileSize,
      fileType: options.fileType,
      messageType: "document",
    });
  }

  receiveContact(
    from: string,
    options: {
      contactName: string;
      contactPhone?: string;
      contactAvatarUrl?: string;
    },
  ): void {
    this._push("CONTACT_RECEIVED", {
      from,
      contactName: options.contactName,
      contactPhone: options.contactPhone,
      contactAvatar: options.contactAvatarUrl,
      messageType: "contact",
    });
  }

  sendContact(options: {
    contactName: string;
    contactPhone?: string;
    contactAvatarUrl?: string;
  }): void {
    this._push("CONTACT_SENT", {
      contactName: options.contactName,
      contactPhone: options.contactPhone,
      contactAvatar: options.contactAvatarUrl,
      messageType: "contact",
    });
  }

  receiveLocation(
    from: string,
    options: {
      latitude: number;
      longitude: number;
      locationName?: string;
      locationAddress?: string;
      mapThumbnailUrl?: string;
    },
  ): void {
    this._push("LOCATION_RECEIVED", {
      from,
      latitude: options.latitude,
      longitude: options.longitude,
      locationName: options.locationName,
      locationAddress: options.locationAddress,
      mapThumbnailUrl: options.mapThumbnailUrl,
      messageType: "location",
    });
  }

  sendLocation(options: {
    latitude: number;
    longitude: number;
    locationName?: string;
    locationAddress?: string;
    mapThumbnailUrl?: string;
  }): void {
    this._push("LOCATION_SENT", {
      latitude: options.latitude,
      longitude: options.longitude,
      locationName: options.locationName,
      locationAddress: options.locationAddress,
      mapThumbnailUrl: options.mapThumbnailUrl,
      messageType: "location",
    });
  }

  forward(
    messageIndex: number,
    options?: { forwardedFrom?: string; text?: string },
  ): void {
    this._push("MESSAGE_FORWARDED", {
      messageRef: { index: messageIndex },
      forwardedFrom: options?.forwardedFrom,
      text: options?.text,
    });
  }

  deleteMessage(messageIndex: number): void {
    this._push("MESSAGE_DELETED", {
      messageRef: { index: messageIndex },
      deletedForEveryone: true,
    });
  }

  editMessage(messageIndex: number, newText: string): void {
    this._push("MESSAGE_EDITED", {
      messageRef: { index: messageIndex },
      newText,
    });
  }
}

// =============================================================================
// SPAN BUILDER (span)
// =============================================================================

export class WhatsAppSpanBuilder {
  constructor(
    private _startFrame: number,
    private _endFrame: number,
    private _deviceId: string,
    private _conversationId: string,
    private _events: WhatsAppTrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) { }

  /**
   * Show typing indicator for the span duration.
   * NOTE: Use keyboard track for actual key animation.
   */
  typing(actor: string = "them"): void {
    this._events.push(
      {
        at: this._startFrame,
        duration: this._endFrame - this._startFrame,
        deviceId: this._deviceId,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_START",
        conversationId: this._conversationId,
        payload: {
          conversationId: this._conversationId,
          actor,
        },
        _declarationOrder: this._getOrder(),
      },
      {
        at: this._endFrame,
        deviceId: this._deviceId,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_END",
        conversationId: this._conversationId,
        payload: {
          conversationId: this._conversationId,
          actor,
        },
        _declarationOrder: this._getOrder(),
      },
    );
  }
}

// =============================================================================
// WHATSAPP TRACK BUILDER
// =============================================================================

/**
 * Parse time to frames.
 */
function parseTime(time: string | number, fps: number): number {
  if (typeof time === "number") return Math.round(time);
  const trimmed = time.trim();
  if (trimmed.endsWith("ms")) {
    return Math.round((parseFloat(trimmed.slice(0, -2)) / 1000) * fps);
  }
  if (trimmed.endsWith("s")) {
    return Math.round(parseFloat(trimmed.slice(0, -1)) * fps);
  }
  return Math.round(parseFloat(trimmed));
}

export class WhatsAppTrackBuilder {
  _events: WhatsAppTrackEvent[] = [];
  private _currentTime: number = 0;
  private _currentConversation: string | null = null;

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _conversationId: string = "",
    private _getOrder: GetDeclarationOrder,
  ) {
    this._currentConversation = _conversationId || null;
  }

  /**
   * Create a point (instant) operation at a specific time.
   */
  at(time: string | number): WhatsAppPointBuilder {
    const frame = parseTime(time, this._fps);
    this._currentTime = frame;
    const conversationId = this._currentConversation || this._conversationId;
    return new WhatsAppPointBuilder(
      frame,
      this._fps,
      this._deviceId,
      conversationId,
      this._events,
      this._getOrder,
    );
  }

  /**
   * Create a span (duration) operation between two times.
   */
  span(start: string | number, end: string | number): WhatsAppSpanBuilder {
    const startFrame = parseTime(start, this._fps);
    const endFrame = parseTime(end, this._fps);
    const conversationId = this._currentConversation || this._conversationId;
    return new WhatsAppSpanBuilder(
      startFrame,
      endFrame,
      this._deviceId,
      conversationId,
      this._events,
      this._getOrder,
    );
  }

  /**
   * Switch to a different conversation at a specific time.
   * Emits NAVIGATE_SCREEN and CONVERSATION_OPENED events (handled by navigation.ts)
   */
  switchTo(conversationId: string, time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);

    // Navigate to chat screen first
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "NAVIGATE_SCREEN",
      payload: {
        screen: "chat",
      },
      _declarationOrder: this._getOrder(),
    });

    // Then set the active conversation
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "CONVERSATION_OPENED",
      conversationId,
      payload: {
        conversationId,
      },
      _declarationOrder: this._getOrder(),
    });
    this._conversationId = conversationId;
    this._currentConversation = conversationId;
  }

  /**
   * Open the chat list screen at a specific time.
   * Emits core NAVIGATE_SCREEN event (handled by navigation.ts)
   */
  openChatList(time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "NAVIGATE_SCREEN",
      payload: {
        screen: "chats",
      },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Open the status screen at a specific time.
   */
  openStatus(time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "NAVIGATE_SCREEN",
      payload: {
        screen: "status",
      },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Open the calls screen at a specific time.
   */
  openCalls(time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "NAVIGATE_SCREEN",
      payload: {
        screen: "calls",
      },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Open the communities screen at a specific time.
   */
  openCommunities(time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "NAVIGATE_SCREEN",
      payload: {
        screen: "communities",
      },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Open the settings screen at a specific time.
   */
  openSettings(time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "NAVIGATE_SCREEN",
      payload: {
        screen: "settings",
      },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Go back to previous screen. Uses currentTime if no time specified.
   * Emits core GO_BACK event (handled by navigation.ts)
   */
  goBack(time?: string | number): this {
    const frame =
      time !== undefined ? parseTime(time, this._fps) : this._currentTime;
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "GO_BACK",
      payload: {},
      _declarationOrder: this._getOrder(),
    });
    if (time === undefined) {
      this._currentTime = frame + 0.3 * this._fps;
    }
    return this;
  }

  /**
   * Open profile screen at a specific time.
   */
  openProfile(time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "NAVIGATE_SCREEN",
      payload: {
        screen: "profile",
      },
      _declarationOrder: this._getOrder(),
    });
  }

  /**
   * Add a date separator (e.g., "Today", "Yesterday").
   */
  dateSeparator(text: string = "Today"): void {
    const frame = this._currentTime;
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "DATE_SEPARATOR",
      conversationId: this._conversationId,
      payload: {
        conversationId: this._conversationId,
        text,
      },
      _declarationOrder: this._getOrder(),
    });
  }

  private framesToTime(frames: number): number {
    return frames / this._fps;
  }

  receive(from: string, text: string): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_RECEIVED",
      conversationId,
      payload: { conversationId, from, text },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  send(text: string): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_SENT",
      conversationId,
      payload: { conversationId, text },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  receiveCall(
    from: string,
    options: CallOptions = {},
  ): this {
    const conversationId = this._currentConversation || this._conversationId;
    const messageType = options.missed ? "call_missed" : "call";
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_RECEIVED",
      conversationId,
      payload: {
        conversationId,
        from,
        text: options.text ?? "",
        messageType,
        callType: options.callType ?? "voice",
        callDuration: options.duration,
      },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  sendCall(options: CallOptions = {}): this {
    const conversationId = this._currentConversation || this._conversationId;
    const messageType = options.missed ? "call_missed" : "call";
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_SENT",
      conversationId,
      payload: {
        conversationId,
        text: options.text ?? "",
        messageType,
        callType: options.callType ?? "voice",
        callDuration: options.duration,
      },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  encryptionNotice(text?: string): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_RECEIVED",
      conversationId,
      payload: {
        conversationId,
        from: "system",
        text: text ?? "",
        messageType: "system",
        systemType: "encryption_notice",
      },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.4 * this._fps;
    return this;
  }

  receiveImage(
    from: string,
    url: string,
    options?: { caption?: string },
  ): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "IMAGE_RECEIVED",
      conversationId,
      payload: { conversationId, from, url, caption: options?.caption },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  sendImage(url: string, options?: { caption?: string }): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "IMAGE_SENT",
      conversationId,
      payload: { conversationId, url, caption: options?.caption },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  typing(actor: "me" | "them", duration: number = 2): this {
    const conversationId = this._currentConversation || this._conversationId;
    const startFrame = this._currentTime;
    const endFrame = startFrame + duration * this._fps;

    this._events.push({
      at: startFrame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "TYPING_START",
      conversationId,
      payload: { conversationId, actor },
      _declarationOrder: this._getOrder(),
    });

    this._events.push({
      at: endFrame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "TYPING_END",
      conversationId,
      payload: { conversationId, actor },
      _declarationOrder: this._getOrder(),
    });

    this._currentTime = endFrame;
    return this;
  }

  openChat(conversationId: string): this {
    this._conversationId = conversationId;
    this._currentConversation = conversationId;

    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "NAVIGATE_SCREEN",
      payload: { screen: "chat" },
      _declarationOrder: this._getOrder(),
    });

    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "CONVERSATION_OPENED",
      conversationId,
      payload: { conversationId },
      _declarationOrder: this._getOrder(),
    });

    this._currentTime += 0.3 * this._fps;
    return this;
  }

  pause(seconds: number): this {
    this._currentTime += seconds * this._fps;
    return this;
  }

  now(): this {
    return this;
  }

  reply(text: string, typingDuration: number = 2): this {
    const typingStart = this._currentTime;
    const typingEnd = typingStart + typingDuration * this._fps;

    this._events.push({
      at: typingStart,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "TYPING_START",
      conversationId: this._conversationId,
      payload: {
        conversationId: this._conversationId,
        actor: "me",
      },
      _declarationOrder: this._getOrder(),
    });

    this._events.push({
      at: typingEnd,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "TYPING_END",
      conversationId: this._conversationId,
      payload: {
        conversationId: this._conversationId,
        actor: "me",
      },
      _declarationOrder: this._getOrder(),
    });

    this._currentTime = typingEnd;

    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_SENT",
      conversationId: this._conversationId,
      payload: {
        conversationId: this._conversationId,
        text,
      },
      _declarationOrder: this._getOrder(),
    });

    this._currentTime += 0.5 * this._fps;
    return this;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW DX: Additional media/action methods for relative timing
  // ═══════════════════════════════════════════════════════════════════════════

  receiveSticker(from: string, url: string): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "STICKER_RECEIVED",
      conversationId,
      payload: { conversationId, from, url },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  receiveVoice(from: string, duration: number): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "VOICE_RECEIVED",
      conversationId,
      payload: { conversationId, from, duration },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  receiveGif(from: string, url: string): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "GIF_RECEIVED",
      conversationId,
      payload: { conversationId, from, url },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  receiveLocation(
    from: string,
    options: {
      latitude: number;
      longitude: number;
      locationName?: string;
      locationAddress?: string;
      mapThumbnailUrl?: string;
    }
  ): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "LOCATION_RECEIVED",
      conversationId,
      payload: {
        conversationId,
        from,
        latitude: options.latitude,
        longitude: options.longitude,
        locationName: options.locationName,
        locationAddress: options.locationAddress,
        mapThumbnailUrl: options.mapThumbnailUrl,
      },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  receiveDocument(
    from: string,
    options: { fileName: string; fileSize: string; fileType?: string }
  ): this {
    const conversationId = this._currentConversation || this._conversationId;
    const fileSizeBytes = parseFileSizeToBytes(options.fileSize);
    const fileSize = fileSizeBytes ?? options.fileSize;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "DOCUMENT_RECEIVED",
      conversationId,
      payload: {
        conversationId,
        from,
        url: "", // Documents require URL in payload
        fileName: options.fileName,
        fileSize,
        fileType: options.fileType,
      },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  receiveContact(
    from: string,
    options: {
      contactName: string;
      contactPhone?: string;
      contactAvatarUrl?: string;
    }
  ): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "CONTACT_RECEIVED",
      conversationId,
      payload: {
        conversationId,
        from,
        contactName: options.contactName,
        contactPhone: options.contactPhone,
        contactAvatar: options.contactAvatarUrl,
      },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  react(
    messageRef: { conversationId?: string; messageIndex: number } | { index: number },
    emoji: string
  ): this {
    const conversationId = this._currentConversation || this._conversationId;
    let index: number;
    if ("messageIndex" in messageRef) {
      index = messageRef.messageIndex;
    } else if ("index" in messageRef) {
      index = messageRef.index;
    } else {
      index = 0;
    }
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "REACT",
      conversationId,
      payload: { conversationId, messageRef: { index }, emoji },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.3 * this._fps;
    return this;
  }

  read(): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "READ",
      conversationId,
      payload: { conversationId },
      _declarationOrder: this._getOrder(),
    });
    return this;
  }

  forward(messageIndex: number, options?: { forwardedFrom?: string; text?: string }): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_FORWARDED",
      conversationId,
      payload: {
        conversationId,
        messageRef: { index: messageIndex },
        forwardedFrom: options?.forwardedFrom,
        text: options?.text,
      },
      _declarationOrder: this._getOrder(),
    });
    this._currentTime += 0.5 * this._fps;
    return this;
  }

  editMessage(messageIndex: number, newText: string): this {
    const conversationId = this._currentConversation || this._conversationId;
    this._events.push({
      at: this._currentTime,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_EDITED",
      conversationId,
      payload: {
        conversationId,
        messageRef: { index: messageIndex },
        newText,
      },
      _declarationOrder: this._getOrder(),
    });
    return this;
  }
}

/**
 * Create a new WhatsApp track builder factory.
 */
export function createWhatsAppTrackBuilder(
  fps: number,
  deviceId: string,
  conversationId: string,
  getOrder: GetDeclarationOrder,
): WhatsAppTrackBuilder {
  return new WhatsAppTrackBuilder(fps, deviceId, conversationId, getOrder);
}
