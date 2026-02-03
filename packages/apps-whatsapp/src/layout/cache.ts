import type { WhatsAppConversation, WhatsAppMessage } from "../types";

export interface LayoutCacheConfig {
  maxEntries: number;
  enabled: boolean;
}

export interface MessageLayout {
  height: number;
  y: number;
  hasReply: boolean;
  hasReactions: boolean;
  hasLinkPreview: boolean;
}

export interface ConversationLayout {
  totalHeight: number;
  messages: Map<string, MessageLayout>;
  lastMessageId: string | null;
  messageCount: number;
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

const DEFAULT_CONFIG: LayoutCacheConfig = {
  maxEntries: 50,
  enabled: true,
};

export class LayoutCache {
  private cache: Map<string, ConversationLayout> = new Map();
  private config: LayoutCacheConfig;

  constructor(config: Partial<LayoutCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private computeLayoutHash(conversation: WhatsAppConversation): string {
    const messages = conversation.messages as WhatsAppMessage[];
    let hash = 2166136261;

    for (const message of messages) {
      hash = hashString(hash, message.id);
      hash = hashString(hash, message.type || "text");
      hash = hashNumber(hash, message.text?.length ?? 0);
      hash = hashBoolean(
        hash,
        Boolean(message.imageUrl || message.videoUrl || message.gifUrl),
      );
      hash = hashBoolean(hash, Boolean(message.replyTo));
      hash = hashNumber(hash, message.reactions?.length ?? 0);
      hash = hashBoolean(hash, Boolean(message.linkPreview));
    }

    // Convert to unsigned hex for compactness
    return (hash >>> 0).toString(16);
  }

  private generateCacheKey(conversation: WhatsAppConversation): string {
    const messages = conversation.messages as WhatsAppMessage[];
    const lastMessage = messages[messages.length - 1];
    const layoutHash = this.computeLayoutHash(conversation);
    return `${conversation.id}_${messages.length}_${lastMessage?.id || "empty"}_${layoutHash}`;
  }

  get(conversation: WhatsAppConversation): ConversationLayout | null {
    if (!this.config.enabled) return null;
    const key = this.generateCacheKey(conversation);
    return this.cache.get(key) || null;
  }

  set(conversation: WhatsAppConversation, layout: ConversationLayout): void {
    if (!this.config.enabled) return;

    if (this.cache.size >= this.config.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const key = this.generateCacheKey(conversation);
    this.cache.set(key, layout);
  }

  invalidate(conversationId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(conversationId)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }
}

let globalLayoutCache: LayoutCache | null = null;

export function getLayoutCache(
  config?: Partial<LayoutCacheConfig>,
): LayoutCache {
  if (!globalLayoutCache) {
    globalLayoutCache = new LayoutCache(config);
  }
  return globalLayoutCache;
}

export function resetLayoutCache(): void {
  if (globalLayoutCache) {
    globalLayoutCache.clear();
  }
  globalLayoutCache = null;
}

const BASE_MESSAGE_HEIGHT = 40;
const REPLY_HEIGHT = 50;
const REACTIONS_HEIGHT = 24;
const LINK_PREVIEW_HEIGHT = 80;
const MESSAGE_GAP = 2;

export function estimateMessageHeight(message: WhatsAppMessage): number {
  let height = BASE_MESSAGE_HEIGHT;

  if (message.text) {
    const lineCount = Math.ceil(message.text.length / 40);
    height = Math.max(height, 24 + lineCount * 20);
  }

  if (message.imageUrl || message.videoUrl || message.gifUrl) {
    height = 200;
  }

  if (message.type === "voice") {
    height = 54;
  }

  if (message.type === "document") {
    height = 70;
  }

  if (message.type === "location") {
    height = 180;
  }

  if (message.type === "contact") {
    height = 80;
  }

  if (message.replyTo) {
    height += REPLY_HEIGHT;
  }

  if (message.reactions && message.reactions.length > 0) {
    height += REACTIONS_HEIGHT;
  }

  if (message.linkPreview) {
    height += LINK_PREVIEW_HEIGHT;
  }

  return height;
}

export function computeConversationLayout(
  conversation: WhatsAppConversation,
  cache: LayoutCache = getLayoutCache(),
): ConversationLayout {
  const cached = cache.get(conversation);
  if (cached) {
    return cached;
  }

  const messages = conversation.messages as WhatsAppMessage[];
  const messageLayouts = new Map<string, MessageLayout>();
  let currentY = 0;

  for (const message of messages) {
    const height = estimateMessageHeight(message);

    messageLayouts.set(message.id, {
      height,
      y: currentY,
      hasReply: Boolean(message.replyTo),
      hasReactions: Boolean(message.reactions?.length),
      hasLinkPreview: Boolean(message.linkPreview),
    });

    currentY += height + MESSAGE_GAP;
  }

  const layout: ConversationLayout = {
    totalHeight: currentY,
    messages: messageLayouts,
    lastMessageId: messages[messages.length - 1]?.id || null,
    messageCount: messages.length,
  };

  cache.set(conversation, layout);
  return layout;
}

export function getMessageLayout(
  conversation: WhatsAppConversation,
  messageId: string,
): MessageLayout | null {
  const layout = computeConversationLayout(conversation);
  return layout.messages.get(messageId) || null;
}
