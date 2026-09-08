/**
 * WhatsApp v2 Track Builder - App-specific track for WhatsApp events
 *
 * @description Provides DSL verbs for WhatsApp interactions:
 * - receive() - Incoming message
 * - send() - Outgoing message
 * - typing() - Typing indicator
 * - react() - Emoji reaction
 *
 * @see docs/WHATSAPP.md
 */

import type {
  InputCadenceIR,
  InputDirectionIR,
  InputKeyboardIR,
  InputSourceIR,
} from "@tokovo/ir";
import type { WhatsAppTrackEvent, WhatsAppEventType } from "../types/events.js";
import type { WhatsAppLocale } from "../localization/index.js";
import type { WhatsAppMessageGesture } from "../types/interactions.js";
import { parseFileSizeToBytes } from "../utils/file-size.js";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;
export type MessageReference = { messageId: string };

export interface ReceiveOptions {
  messageId?: string;
  silent?: boolean;
  replyTo?: MessageReference;
}

export interface SendOptions {
  messageId?: string;
  silent?: boolean;
  replyTo?: MessageReference;
  input?: WhatsAppSendInputOptions;
}

export interface WhatsAppSendInputOptions {
  /** Exact authored typing window. Omit to use deterministic natural cadence. */
  duration?: string | number;
  style?: InputCadenceIR["style"];
  id?: string;
  locale?: string;
  direction?: InputDirectionIR;
  source?: InputSourceIR;
  seed?: string | number;
  cadence?: InputCadenceIR;
  keyboard?: InputKeyboardIR;
  correction?: {
    typed: string;
    replace: string;
    with: string;
    pauseFrames?: number;
  };
}

export interface WhatsAppSendInputIntent {
  deviceId: string;
  conversationId: string;
  fieldId: "composer";
  sendFrame: number;
  text: string;
  input: WhatsAppSendInputOptions;
}

export type AddWhatsAppSendInputIntent = (
  intent: WhatsAppSendInputIntent,
) => void;

export interface ImageOptions {
  messageId?: string;
  caption?: string;
}

export interface CallOptions {
  callType?: "voice" | "video";
  duration?: number;
  missed?: boolean;
  text?: string;
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
    private _addInputIntent?: AddWhatsAppSendInputIntent,
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
      payload: { conversationId: this._conversationId, ...payload },
      _declarationOrder: this._getOrder(),
    } as WhatsAppTrackEvent);
  }

  private _pushGlobal<T extends WhatsAppEventType>(
    type: T,
    payload: Record<string, unknown>,
  ): void {
    this._events.push({
      at: this._frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type,
      payload,
      _declarationOrder: this._getOrder(),
    } as WhatsAppTrackEvent);
  }

  receive(from: string, text: string, options: ReceiveOptions = {}): void {
    this._push("MESSAGE_RECEIVED", {
      from,
      text,
      messageId: options.messageId,
      silent: options.silent,
      replyTo: options.replyTo,
    });
  }

  send(text: string, options: SendOptions = {}): void {
    if (options.input) {
      if (!this._addInputIntent) {
        throw new Error(
          "WHATSAPP_INPUT_INTEGRATION_MISSING: structured input requires the canonical code-first episode builder.",
        );
      }
      this._addInputIntent({
        deviceId: this._deviceId,
        conversationId: this._conversationId,
        fieldId: "composer",
        sendFrame: this._frame,
        text,
        input: options.input,
      });
    }
    this._push("MESSAGE_SENT", {
      text,
      messageId: options.messageId,
      silent: options.silent,
      replyTo: options.replyTo,
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
      messageId: options.messageId,
    });
  }

  sendImage(url: string, options: ImageOptions = {}): void {
    this._push("IMAGE_SENT", {
      url,
      caption: options.caption,
      messageId: options.messageId,
    });
  }

  receiveVideo(
    from: string,
    url: string,
    options: { duration?: number; caption?: string; messageId?: string } = {},
  ): void {
    this._push("VIDEO_RECEIVED", {
      from,
      url,
      duration: options.duration ?? 10,
      caption: options.caption,
      messageId: options.messageId,
    });
  }

  sendVideo(
    url: string,
    options: { duration?: number; caption?: string; messageId?: string } = {},
  ): void {
    this._push("VIDEO_SENT", {
      url,
      duration: options.duration ?? 10,
      caption: options.caption,
      messageId: options.messageId,
    });
  }

  receiveVoice(from: string, duration: number, options: { messageId?: string } = {}): void {
    this._push("VOICE_RECEIVED", {
      from,
      duration,
      messageId: options.messageId,
    });
  }

  sendVoice(duration: number, options: { messageId?: string } = {}): void {
    this._push("VOICE_SENT", {
      duration,
      messageId: options.messageId,
    });
  }

  receiveGif(from: string, url: string, options: { messageId?: string } = {}): void {
    this._push("GIF_RECEIVED", {
      from,
      url,
      messageId: options.messageId,
    });
  }

  sendGif(url: string, options: { messageId?: string } = {}): void {
    this._push("GIF_SENT", {
      url,
      messageId: options.messageId,
    });
  }

  react(messageId: string, emoji: string): void {
    this._push("REACTION_ADDED", { messageId, emoji, fromMe: true });
  }

  read(): void {
    this._push("READ", {});
  }

  markMessageRead(messageId: string): void {
    this._push("MESSAGE_READ", { messageId });
  }

  failMessageDelivery(messageId: string, failureReason: string): void {
    this._push("MESSAGE_DELIVERY_FAILED", { messageId, failureReason });
  }

  startMessageRetry(messageId: string): void {
    this._push("MESSAGE_RETRY_STARTED", { messageId });
  }

  completeMessageRetry(messageId: string): void {
    this._push("MESSAGE_RETRY_COMPLETED", { messageId });
  }

  addReaction(messageId: string, emoji: string, fromMe: boolean = false): void {
    this._push("REACTION_ADDED", { messageId, emoji, fromMe });
  }

  startMediaDownload(messageId: string, progress: number = 0): void {
    this._push("MEDIA_DOWNLOAD_STARTED", { messageId, progress });
  }

  updateMediaDownload(messageId: string, progress: number): void {
    this._push("MEDIA_DOWNLOAD_PROGRESS", { messageId, progress });
  }

  completeMediaDownload(messageId: string): void {
    this._push("MEDIA_DOWNLOAD_COMPLETED", { messageId });
  }

  failMediaDownload(messageId: string, failureReason: string): void {
    this._push("MEDIA_DOWNLOAD_FAILED", { messageId, failureReason });
  }

  startMediaPlayback(messageId: string, progress: number = 0): void {
    this._push("MEDIA_PLAYBACK_STARTED", { messageId, progress });
  }

  updateMediaPlayback(messageId: string, progress: number): void {
    this._push("MEDIA_PLAYBACK_PROGRESS", { messageId, progress });
  }

  pauseMediaPlayback(messageId: string, progress?: number): void {
    this._push("MEDIA_PLAYBACK_PAUSED", { messageId, progress });
  }

  completeMediaPlayback(messageId: string): void {
    this._push("MEDIA_PLAYBACK_COMPLETED", { messageId });
  }

  openMediaViewer(messageId: string): void {
    this._push("MEDIA_VIEWER_OPENED", { messageId });
  }

  closeMediaViewer(): void {
    this._pushGlobal("MEDIA_VIEWER_CLOSED", {});
  }

  showStatusViewer(statusId: string): void {
    this._pushGlobal("STATUS_VIEWER_OPENED", { statusId });
  }

  advanceStatusViewer(direction: "next" | "previous" = "next"): void {
    this._pushGlobal("STATUS_VIEWER_ADVANCED", { direction });
  }

  closeStatusViewer(): void {
    this._pushGlobal("STATUS_VIEWER_CLOSED", {});
  }

  startGesture(messageId: string, gesture: WhatsAppMessageGesture): void {
    this._push("GESTURE_STARTED", { messageId, gesture });
  }

  updateGesture(messageId: string, progress: number): void {
    this._push("GESTURE_UPDATED", { messageId, progress });
  }

  completeGesture(messageId: string): void {
    this._push("GESTURE_COMPLETED", { messageId });
  }

  cancelGesture(messageId: string): void {
    this._push("GESTURE_CANCELLED", { messageId });
  }

  dismissReplyComposer(): void {
    this._push("REPLY_COMPOSER_DISMISSED", {});
  }

  setLocale(locale: WhatsAppLocale): void {
    this._pushGlobal("SET_LOCALE", { locale });
  }

  /** Scroll a tab's content in logical points; its position survives navigation. */
  scrollScreen(screen: "chats" | "calls" | "updates" | "communities" | "settings", offset: number, duration: string | number = "0.3s"): void {
    this._pushGlobal("NAVIGATE_SCREEN", { screen, scroll: { offset, durationFrames: parseTime(duration, this._fps) } });
  }

  receiveSticker(from: string, url: string, options: { messageId?: string } = {}): void {
    this._push("STICKER_RECEIVED", {
      from,
      url,
      messageId: options.messageId,
    });
  }

  sendSticker(url: string, options: { messageId?: string } = {}): void {
    this._push("STICKER_SENT", {
      url,
      messageId: options.messageId,
    });
  }

  receiveDocument(
    from: string,
    options: { fileName: string; fileSize: string; fileType?: string; messageId?: string; url?: string },
  ): void {
    const fileSizeBytes = parseFileSizeToBytes(options.fileSize);
    const fileSize = fileSizeBytes ?? options.fileSize;
    this._push("DOCUMENT_RECEIVED", {
      from,
      fileName: options.fileName,
      fileSize,
      fileType: options.fileType,
      messageId: options.messageId,
      url: options.url,
    });
  }

  sendDocument(options: {
    fileName: string;
    fileSize: string;
    fileType?: string;
    messageId?: string;
    url?: string;
  }): void {
    const fileSizeBytes = parseFileSizeToBytes(options.fileSize);
    const fileSize = fileSizeBytes ?? options.fileSize;
    this._push("DOCUMENT_SENT", {
      fileName: options.fileName,
      fileSize,
      fileType: options.fileType,
      messageId: options.messageId,
      url: options.url,
    });
  }

  receiveContact(
    from: string,
    options: {
      contactName: string;
      contactPhone?: string;
      contactAvatarUrl?: string;
      messageId?: string;
    },
  ): void {
    this._push("CONTACT_RECEIVED", {
      from,
      contactName: options.contactName,
      contactPhone: options.contactPhone,
      contactAvatarUrl: options.contactAvatarUrl,
      messageId: options.messageId,
    });
  }

  sendContact(options: {
    contactName: string;
    contactPhone?: string;
    contactAvatarUrl?: string;
    messageId?: string;
  }): void {
    this._push("CONTACT_SENT", {
      contactName: options.contactName,
      contactPhone: options.contactPhone,
      contactAvatarUrl: options.contactAvatarUrl,
      messageId: options.messageId,
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
      messageId?: string;
    },
  ): void {
    this._push("LOCATION_RECEIVED", {
      from,
      latitude: options.latitude,
      longitude: options.longitude,
      locationName: options.locationName,
      locationAddress: options.locationAddress,
      mapThumbnailUrl: options.mapThumbnailUrl,
      messageId: options.messageId,
    });
  }

  sendLocation(options: {
    latitude: number;
    longitude: number;
    locationName?: string;
    locationAddress?: string;
    mapThumbnailUrl?: string;
    messageId?: string;
  }): void {
    this._push("LOCATION_SENT", {
      latitude: options.latitude,
      longitude: options.longitude,
      locationName: options.locationName,
      locationAddress: options.locationAddress,
      mapThumbnailUrl: options.mapThumbnailUrl,
      messageId: options.messageId,
    });
  }

  forward(
    sourceMessageId: string,
    options?: { messageId?: string; forwardedFrom?: string; text?: string },
  ): void {
    this._push("MESSAGE_FORWARDED", {
      sourceMessageId,
      messageId: options?.messageId,
      forwardedFrom: options?.forwardedFrom,
      text: options?.text,
    });
  }

  deleteMessage(
    messageId: string,
    options: { deletedForEveryone?: boolean; deletedBy?: string } = {},
  ): void {
    this._push("MESSAGE_DELETED", {
      messageId,
      deletedForEveryone: options.deletedForEveryone ?? true,
      deletedBy: options.deletedBy,
    });
  }

  editMessage(messageId: string, newText: string): void {
    this._push("MESSAGE_EDITED", {
      messageId,
      newText,
    });
  }

  addGroupMember(
    memberId: string,
    memberName: string,
    addedBy: string = "me",
  ): void {
    this._push("GROUP_MEMBER_ADDED", { memberId, memberName, addedBy });
  }

  removeGroupMember(
    memberId: string,
    memberName: string,
    removedBy: string = "me",
  ): void {
    this._push("GROUP_MEMBER_REMOVED", { memberId, memberName, removedBy });
  }

  changeGroupAdmin(
    memberId: string,
    action: "promote" | "demote",
    options: { memberName?: string; changedBy?: string } = {},
  ): void {
    this._push("GROUP_ADMIN_CHANGED", {
      memberId,
      memberName: options.memberName,
      action,
      changedBy: options.changedBy ?? "me",
    });
  }

  updateGroupInfo(
    field: "name" | "avatar" | "description",
    newValue: string,
    changedBy: string = "me",
  ): void {
    this._push("GROUP_INFO_UPDATED", { field, newValue, changedBy });
  }

  pinConversation(): void {
    this._push("PIN_CONVERSATION", {});
  }

  unpinConversation(): void {
    this._push("UNPIN_CONVERSATION", {});
  }

  muteConversation(until?: string): void {
    this._push("MUTE_CONVERSATION", { until });
  }

  unmuteConversation(): void {
    this._push("UNMUTE_CONVERSATION", {});
  }

  archiveConversation(): void {
    this._push("ARCHIVE_CONVERSATION", {});
  }

  unarchiveConversation(): void {
    this._push("UNARCHIVE_CONVERSATION", {});
  }

  setDraft(text: string): void {
    this._push("SET_DRAFT", { text });
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
  typing(actor: string): void {
    this._events.push(
      {
        at: this._startFrame,
        duration: this._endFrame - this._startFrame,
        deviceId: this._deviceId,
        kind: "APP",
        appId: "app_whatsapp",
        type: "TYPING_START",
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
  private _currentConversation: string | null = null;

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _conversationId: string = "",
    private _getOrder: GetDeclarationOrder,
    private _addInputIntent?: AddWhatsAppSendInputIntent,
  ) {
    this._currentConversation = _conversationId || null;
  }

  /**
   * Create a point (instant) operation at a specific time.
   */
  at(time: string | number): WhatsAppPointBuilder {
    const frame = parseTime(time, this._fps);
    const conversationId = this._currentConversation || this._conversationId;
    return new WhatsAppPointBuilder(
      frame,
      this._fps,
      this._deviceId,
      conversationId,
      this._events,
      this._getOrder,
      this._addInputIntent,
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
   * Emits the canonical conversation-opened event.
   */
  switchTo(conversationId: string, time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);

    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "CONVERSATION_OPENED",
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
   * Open the updates screen at a specific time.
   */
  openUpdates(time: string | number = "0s"): void {
    const frame = parseTime(time, this._fps);
    this._events.push({
      at: frame,
      deviceId: this._deviceId,
      kind: "APP",
      appId: "app_whatsapp",
      type: "NAVIGATE_SCREEN",
      payload: {
        screen: "updates",
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
        conversationId: this._conversationId,
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
  addInputIntent?: AddWhatsAppSendInputIntent,
): WhatsAppTrackBuilder {
  return new WhatsAppTrackBuilder(
    fps,
    deviceId,
    conversationId,
    getOrder,
    addInputIntent,
  );
}
