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

// Local type for WhatsApp track events
type WhatsAppTrackEvent = {
  at: number;
  duration?: number;
  deviceId: string;
  kind: "APP";
  appId: "app_whatsapp";
  type: string;
  conversationId?: string;
  payload: Record<string, unknown>;
  _declarationOrder: number;
};

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
}

export interface ImageOptions {
  caption?: string;
  height?: number;
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
  ) {}

  private _push(type: string, payload: Record<string, unknown>): void {
    this._events.push({
      at: this._frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type,
      conversationId: this._conversationId,
      payload: { conversationId: this._conversationId, ...payload },
      _declarationOrder: this._getOrder(),
    });
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
    this._push("MESSAGE_SENT", { text, silent: options.silent });
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
    this._push("DOCUMENT_RECEIVED", {
      from,
      fileName: options.fileName,
      fileSize: options.fileSize,
      fileType: options.fileType,
      messageType: "document",
    });
  }

  sendDocument(options: {
    fileName: string;
    fileSize: string;
    fileType?: string;
  }): void {
    this._push("DOCUMENT_SENT", {
      fileName: options.fileName,
      fileSize: options.fileSize,
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
      name: options.contactName,
      phone: options.contactPhone,
      avatar: options.contactAvatarUrl,
      messageType: "contact",
    });
  }

  sendContact(options: {
    contactName: string;
    contactPhone?: string;
    contactAvatarUrl?: string;
  }): void {
    this._push("CONTACT_SENT", {
      name: options.contactName,
      phone: options.contactPhone,
      avatar: options.contactAvatarUrl,
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
      lat: options.latitude,
      lng: options.longitude,
      name: options.locationName,
      address: options.locationAddress,
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
      lat: options.latitude,
      lng: options.longitude,
      name: options.locationName,
      address: options.locationAddress,
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
  ) {}

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

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _conversationId: string,
    private _getOrder: GetDeclarationOrder,
  ) {}

  /**
   * Create a point (instant) operation at a specific time.
   */
  at(time: string | number): WhatsAppPointBuilder {
    const frame = parseTime(time, this._fps);
    return new WhatsAppPointBuilder(
      frame,
      this._fps,
      this._deviceId,
      this._conversationId,
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
    return new WhatsAppSpanBuilder(
      startFrame,
      endFrame,
      this._deviceId, // FIXED: was passing _fps by mistake!
      this._conversationId,
      this._events,
      this._getOrder,
    );
  }

  /**
   * Switch to a different conversation at a specific time.
   * Emits core CONVERSATION_OPENED event (handled by navigation.ts)
   */
  switchTo(conversationId: string, time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);
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
   * Go back to previous screen at a specific time.
   * Emits core GO_BACK event (handled by navigation.ts)
   */
  goBack(time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "GO_BACK",
      payload: {},
      _declarationOrder: this._getOrder(),
    });
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
    const frame = parseTime("0s", this._fps);
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
