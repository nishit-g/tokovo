import type { LayoutCacheStore, LayoutRect } from "@tokovo/core";
import type { WhatsAppConversation, WhatsAppMessage } from "../types";
import {
  DEFAULT_LAYOUT_CONFIG,
  calculateBubbleWidth,
  calculateMessageHeight,
  calculateSmartGap,
  doesMessageBreakGrouping,
  isMessageCentered,
  type MessageLayoutConfig,
  type MessageForGap,
  type MessageForHeight,
  type MessageType,
  type GapContext,
} from "../config";

export interface LayoutCacheConfig {
  maxEntries: number;
  enabled: boolean;
  scopeKey?: string;
}

export interface MessageLayout {
  id: string;
  height: number;
  y: number;
  bubbleWidth: number;
  rect: LayoutRect;
  isMe: boolean;
  isCentered: boolean;
  messageAt: number;
  hasReply: boolean;
  hasReactions: boolean;
  hasLinkPreview: boolean;
  type: MessageType;
  from: string;
}

export interface ConversationLayout {
  totalHeight: number;
  messageLayouts: Map<string, MessageLayout>;
  lastMessageId: string | null;
  messageCount: number;
  viewportWidth: number;
  configSignature: string;
  isGroupChat: boolean;
}

function hashString(hash: number, value: string): number {
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash;
}

function hashNumber(hash: number, value: number): number {
  return hashString(hash, value.toString());
}

function hashBoolean(hash: number, value: boolean): number {
  return hashString(hash, value ? "1" : "0");
}

function hashField(
  hash: number,
  key: string,
  value: string | number | boolean | undefined | null,
): number {
  let next = hashString(hash, key);
  if (value === undefined || value === null) {
    return hashString(next, "<nil>");
  }
  if (typeof value === "string") return hashString(next, value);
  if (typeof value === "number") return hashNumber(next, value);
  if (typeof value === "boolean") return hashBoolean(next, value);
  return next;
}

function hashMaybeString(
  hash: number,
  key: string,
  value?: string | null,
): number {
  return hashField(hash, key, value ?? null);
}

function hashMaybeNumber(
  hash: number,
  key: string,
  value?: number | null,
): number {
  return hashField(hash, key, value ?? null);
}

function hashMaybeBoolean(
  hash: number,
  key: string,
  value?: boolean | null,
): number {
  return hashField(hash, key, value ?? null);
}

const DEFAULT_CONFIG: LayoutCacheConfig = {
  maxEntries: 50,
  enabled: true,
};

const STORE_KEY = "whatsapp:layout-cache";

function computeConfigSignature(
  config: MessageLayoutConfig,
  viewportWidth: number,
  viewportHeight: number,
): string {
  let hash = 2166136261;
  hash = hashString(hash, JSON.stringify(config));
  hash = hashField(hash, "viewportWidth", viewportWidth);
  hash = hashField(hash, "viewportHeight", viewportHeight);
  return (hash >>> 0).toString(16);
}

export function getLayoutCache(
  store?: LayoutCacheStore,
  config: Partial<LayoutCacheConfig> = {},
): LayoutCache | null {
  if (!store) return null;

  const key = `${STORE_KEY}:${store.scopeKey}`;
  const existing = store.get<LayoutCache>(key);
  if (existing) return existing;

  const cache = new LayoutCache({ ...config, scopeKey: store.scopeKey });
  store.set(key, cache);
  return cache;
}

export class LayoutCache {
  private cache: Map<string, ConversationLayout> = new Map();
  private hashCache: WeakMap<WhatsAppConversation, string> = new WeakMap();
  private config: LayoutCacheConfig;
  private scopeKey: string;

  constructor(config: Partial<LayoutCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.scopeKey = this.config.scopeKey || "global";
  }

  private computeLayoutHash(conversation: WhatsAppConversation): string {
    const cached = this.hashCache.get(conversation);
    if (cached) return cached;

    const messages = conversation.messages as WhatsAppMessage[];
    let hash = 2166136261;

    for (const message of messages) {
      hash = hashMaybeString(hash, "id", message.id);
      hash = hashMaybeString(hash, "type", message.type || "text");
      hash = hashMaybeString(hash, "from", message.from);
      hash = hashMaybeString(hash, "senderName", message.senderName);
      hash = hashMaybeString(hash, "timestamp", message.timestamp);
      hash = hashMaybeString(hash, "status", message.status);
      hash = hashMaybeNumber(hash, "at", message.at);
      hash = hashMaybeBoolean(hash, "isForwarded", message.isForwarded);
      hash = hashMaybeString(hash, "forwardedFrom", message.forwardedFrom);
      hash = hashMaybeString(hash, "text", message.text);
      hash = hashMaybeString(hash, "caption", message.caption);
      hash = hashMaybeString(hash, "imageUrl", message.imageUrl);
      hash = hashMaybeString(hash, "voiceUrl", message.voiceUrl);
      hash = hashMaybeString(hash, "audioUrl", message.audioUrl);
      hash = hashMaybeString(hash, "fileUrl", message.fileUrl);
      hash = hashMaybeString(hash, "videoUrl", message.videoUrl);
      hash = hashMaybeString(hash, "gifUrl", message.gifUrl);
      hash = hashMaybeString(hash, "stickerUrl", message.stickerUrl);
      hash = hashMaybeString(hash, "thumbnailUrl", message.thumbnailUrl);
      hash = hashMaybeNumber(hash, "duration", message.duration);
      hash = hashMaybeString(hash, "callType", message.callType);
      hash = hashMaybeBoolean(hash, "isPlaying", message.isPlaying);
      hash = hashMaybeNumber(hash, "playProgress", message.playProgress);
      hash = hashMaybeString(hash, "fileName", message.fileName);
      hash = hashMaybeString(hash, "fileSize", message.fileSize);
      hash = hashMaybeString(hash, "fileType", message.fileType);
      hash = hashMaybeNumber(hash, "pageCount", message.pageCount);
      hash = hashMaybeString(hash, "documentUrl", message.documentUrl);
      hash = hashMaybeString(hash, "contactName", message.contactName);
      hash = hashMaybeString(hash, "contactPhone", message.contactPhone);
      hash = hashMaybeString(hash, "contactAvatarUrl", message.contactAvatarUrl);
      hash = hashMaybeNumber(hash, "latitude", message.latitude);
      hash = hashMaybeNumber(hash, "longitude", message.longitude);
      hash = hashMaybeString(hash, "locationName", message.locationName);
      hash = hashMaybeString(hash, "locationAddress", message.locationAddress);
      hash = hashMaybeString(hash, "mapThumbnailUrl", message.mapThumbnailUrl);
      hash = hashMaybeBoolean(hash, "edited", message.edited);
      hash = hashMaybeNumber(hash, "editedAt", message.editedAt);
      hash = hashMaybeString(hash, "originalText", message.originalText);
      hash = hashMaybeString(hash, "originalType", message.originalType);
      hash = hashMaybeNumber(hash, "deletedAt", message.deletedAt);
      hash = hashMaybeString(hash, "deletedBy", message.deletedBy);
      hash = hashMaybeString(hash, "systemType", message.systemType);
      hash = hashMaybeString(hash, "targetMember", message.targetMember);
      hash = hashMaybeString(hash, "actorName", message.actorName);
      hash = hashMaybeString(hash, "senderName", message.senderName);
      hash = hashMaybeNumber(hash, "readAt", message.readAt);
      hash = hashMaybeNumber(hash, "deliveredAt", message.deliveredAt);

      if (message.replyTo) {
        hash = hashMaybeString(hash, "replyTo.id", message.replyTo.messageId);
        hash = hashMaybeString(hash, "replyTo.text", message.replyTo.text);
        hash = hashMaybeString(hash, "replyTo.from", message.replyTo.from);
        hash = hashMaybeString(hash, "replyTo.type", message.replyTo.type);
        hash = hashMaybeString(
          hash,
          "replyTo.thumb",
          message.replyTo.thumbnailUrl,
        );
      } else {
        hash = hashField(hash, "replyTo", null);
      }

      if (message.reactions) {
        hash = hashField(hash, "reactions.length", message.reactions.length);
        for (const reaction of message.reactions) {
          hash = hashMaybeString(hash, "reaction.emoji", reaction.emoji);
          hash = hashMaybeNumber(hash, "reaction.count", reaction.count);
          hash = hashMaybeBoolean(hash, "reaction.fromMe", reaction.fromMe);
        }
      } else {
        hash = hashField(hash, "reactions.length", 0);
      }

      if (message.linkPreview) {
        hash = hashMaybeString(hash, "link.url", message.linkPreview.url);
        hash = hashMaybeString(hash, "link.title", message.linkPreview.title);
        hash = hashMaybeString(
          hash,
          "link.description",
          message.linkPreview.description,
        );
        hash = hashMaybeString(hash, "link.image", message.linkPreview.image);
        hash = hashMaybeString(
          hash,
          "link.siteName",
          message.linkPreview.siteName,
        );
      } else {
        hash = hashField(hash, "linkPreview", null);
      }
    }

    // Convert to unsigned hex for compactness
    const result = (hash >>> 0).toString(16);
    this.hashCache.set(conversation, result);
    return result;
  }

  private generateCacheKey(
    conversation: WhatsAppConversation,
    configSignature: string,
  ): string {
    const messages = conversation.messages as WhatsAppMessage[];
    const lastMessage = messages[messages.length - 1];
    const layoutHash = this.computeLayoutHash(conversation);
    return `${this.scopeKey}_${conversation.id}_${messages.length}_${lastMessage?.id || "empty"}_${configSignature}_${layoutHash}`;
  }

  get(
    conversation: WhatsAppConversation,
    configSignature: string,
  ): ConversationLayout | null {
    if (!this.config.enabled) return null;
    const key = this.generateCacheKey(conversation, configSignature);
    return this.cache.get(key) || null;
  }

  set(
    conversation: WhatsAppConversation,
    configSignature: string,
    layout: ConversationLayout,
  ): void {
    if (!this.config.enabled) return;

    if (this.cache.size >= this.config.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const key = this.generateCacheKey(conversation, configSignature);
    this.cache.set(key, layout);
  }

  invalidate(conversationId: string): void {
    const prefix = `${this.scopeKey}_${conversationId}_`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.hashCache = new WeakMap();
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  get size(): number {
    return this.cache.size;
  }
}

export interface ConversationLayoutOptions {
  viewportWidth: number;
  viewportHeight: number;
  layoutConfig?: MessageLayoutConfig;
  cache?: LayoutCache | null;
  configSignature?: string;
}

export function computeConversationLayout(
  conversation: WhatsAppConversation,
  options: ConversationLayoutOptions,
): ConversationLayout {
  const config = options.layoutConfig ?? DEFAULT_LAYOUT_CONFIG;
  const configSignature =
    options.configSignature ??
    computeConfigSignature(
      config,
      options.viewportWidth,
      options.viewportHeight,
    );

  const cache = options.cache ?? null;
  const cached = cache?.get(conversation, configSignature);
  if (cached) {
    return cached;
  }

  const messages = conversation.messages as WhatsAppMessage[];
  const messageLayouts = new Map<string, MessageLayout>();
  let currentY = config.spacing.global.topPadding;
  let lastMessageId: string | null = null;

  const uniqueSenders = new Set(messages.map((m) => m.from));
  const isGroupChat = uniqueSenders.size > 2;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i] as WhatsAppMessage;
    const prevMsg = i > 0 ? (messages[i - 1] as WhatsAppMessage) : undefined;
    const msgType = (msg.type || "text") as MessageType;

    if (prevMsg) {
      const prevForGap: MessageForGap = {
        type: prevMsg.type as MessageType,
        from: prevMsg.from,
        at: prevMsg.at,
        hasReply: prevMsg.replyTo !== undefined && prevMsg.replyTo !== null,
        hasReactions: (prevMsg.reactions?.length ?? 0) > 0,
        hasLinkPreview:
          prevMsg.linkPreview !== undefined && prevMsg.linkPreview !== null,
      };
      const nextForGap: MessageForGap = {
        type: msg.type as MessageType,
        from: msg.from,
        at: msg.at,
        hasReply: msg.replyTo !== undefined && msg.replyTo !== null,
        hasReactions: (msg.reactions?.length ?? 0) > 0,
        hasLinkPreview:
          msg.linkPreview !== undefined && msg.linkPreview !== null,
      };

      const gapContext: GapContext = {
        prevMessage: prevForGap,
        nextMessage: nextForGap,
      };

      const gap = calculateSmartGap(gapContext, config);
      currentY += gap;
    }

    const msgForHeight: MessageForHeight = {
      type: msgType,
      text: "text" in msg ? msg.text : undefined,
      caption: "caption" in msg ? msg.caption : undefined,
      from: msg.from,
      prevFrom: (() => {
        const prev = i > 0 ? messages[i - 1] : undefined;
        if (!prev) return undefined;

        const prevType = (prev.type || "text") as MessageType;
        if (doesMessageBreakGrouping(prevType, config)) return "BREAK";

        return prev.from;
      })(),
      isGroupChat,
      reactions: msg.reactions,
      replyTo: msg.replyTo,
      linkPreview: msg.linkPreview,
    };

    const height = calculateMessageHeight(
      msgForHeight,
      options.viewportWidth,
      config,
    );

    const bubbleWidth = calculateBubbleWidth(
      msgForHeight,
      options.viewportWidth,
      config,
    );

    const isMe = msg.from === "me";
    const isCentered = isMessageCentered(msgType, config);

    const rectX = isCentered
      ? (options.viewportWidth - bubbleWidth) / 2
      : isMe
        ? options.viewportWidth -
        config.spacing.global.bubbleMargin -
        bubbleWidth
        : config.spacing.global.bubbleMargin;

    const rect: LayoutRect = {
      x: rectX,
      y: currentY,
      width: bubbleWidth,
      height,
    };

    messageLayouts.set(msg.id, {
      id: msg.id,
      height,
      y: currentY,
      bubbleWidth,
      rect,
      isMe,
      isCentered,
      messageAt: msg.at ?? 0,
      hasReply: Boolean(msg.replyTo),
      hasReactions: Boolean(msg.reactions?.length),
      hasLinkPreview: Boolean(msg.linkPreview),
      type: msgType,
      from: msg.from,
    });

    lastMessageId = msg.id;
    currentY += height;
  }

  const layout: ConversationLayout = {
    totalHeight: currentY + config.spacing.global.bottomPadding,
    messageLayouts,
    lastMessageId,
    messageCount: messages.length,
    viewportWidth: options.viewportWidth,
    configSignature,
    isGroupChat,
  };

  cache?.set(conversation, configSignature, layout);
  return layout;
}

export function getMessageLayout(
  conversation: WhatsAppConversation,
  messageId: string,
  options: ConversationLayoutOptions,
): MessageLayout | null {
  const layout = computeConversationLayout(conversation, options);
  return layout.messageLayouts.get(messageId) || null;
}
