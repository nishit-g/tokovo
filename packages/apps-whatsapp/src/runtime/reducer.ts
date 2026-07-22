import {
  requireAppStateForDevice,
  TimelineEvent,
  WorldState,
} from "@tokovo/core";
import {
  WhatsAppMessage,
  WhatsAppConversation,
  WhatsAppState,
  WhatsAppMediaLifecycle,
} from "../types/index.js";
import { parseWhatsAppEventStrict } from "../schemas/index.js";
import {
  type HandlerContext,
  createWhatsAppHandlers,
} from "../handlers/index.js";

const HANDLERS = createWhatsAppHandlers();

function syncViewMode(state: WhatsAppState): void {
  const requiresConversation =
    state.currentScreen === "chat" || state.currentScreen === "profile";
  if (requiresConversation && !state.conversationId) {
    throw new Error(
      `WhatsApp ${state.currentScreen} screen requires a canonical conversationId`,
    );
  }

  // CHAT is reserved for thread geometry. Profile keeps its explicit
  // conversation context while using the FEED layout family.
  if (state.currentScreen === "chat") {
    state.viewMode = "CHAT";
    return;
  }

  state.viewMode = "FEED";
  if (state.currentScreen !== "profile") {
    state.conversationId = undefined;
  }
}

function getEventConversationId(event: {
  payload: unknown;
}): string | undefined {
  if (!event.payload || typeof event.payload !== "object") return undefined;
  const conversationId = (event.payload as { conversationId?: unknown })
    .conversationId;
  return typeof conversationId === "string" ? conversationId : undefined;
}

function createGlobalHandlerContext(
  draft: WorldState,
  event: ReturnType<typeof parseWhatsAppEventStrict>,
  state: WhatsAppState,
): HandlerContext {
  const fail = (operation: string): never => {
    throw new Error(
      `WhatsApp global event "${event.type}" cannot ${operation} without a conversationId`,
    );
  };
  const context = {
    draft,
    event,
    state,
    conversation: undefined as never,
    addMessage: () => fail("add a message"),
    getMessageById: () => fail("read a message"),
    requireMessageById: () => fail("require a message"),
    generateTimestamp: () => fail("generate a conversation timestamp"),
  } satisfies HandlerContext;

  Object.defineProperty(context, "conversation", {
    configurable: false,
    enumerable: false,
    get: () => fail("access conversation state"),
  });
  return context;
}

function getAppState(draft: WorldState, deviceId: string): WhatsAppState {
  const state = requireAppStateForDevice<WhatsAppState>(
    draft,
    "app_whatsapp",
    deviceId,
  );

  if (
    typeof state.conversations !== "object" ||
    state.conversations === null ||
    Array.isArray(state.conversations)
  ) {
    throw new Error(
      'WhatsApp state field "conversations" must be an object record',
    );
  }
  const requiredArrays = [
    ["statuses", state.statuses],
    ["channels", state.channels],
    ["callLog", state.callLog],
    ["communities", state.communities],
  ] as const;
  for (const [name, value] of requiredArrays) {
    if (!Array.isArray(value)) {
      throw new Error(`WhatsApp state is missing required field "${name}"`);
    }
  }
  if (!Number.isInteger(state.layoutRevision) || state.layoutRevision < 0) {
    throw new Error(
      'WhatsApp state field "layoutRevision" must be a non-negative integer',
    );
  }
  if (
    !["chat", "chats", "updates", "calls", "communities", "settings", "profile"].includes(
      state.currentScreen ?? "",
    ) ||
    !["CHAT", "FEED", "FULLSCREEN", "TRANSITION"].includes(state.viewMode) ||
    !["en-US", "ar"].includes(state.locale) ||
    !["all", "unread", "favorites", "groups", "drafts"].includes(
      state.chatFilter,
    )
  ) {
    throw new Error(
      "WhatsApp state is missing required navigation or locale fields",
    );
  }
  for (const field of [
    "mediaViewer",
    "statusViewer",
    "activeGesture",
    "replyComposer",
    "threadViewport",
  ] as const) {
    if (
      !Object.prototype.hasOwnProperty.call(state, field) ||
      state[field] === undefined
    ) {
      throw new Error(`WhatsApp state is missing required field "${field}"`);
    }
  }
  if (
    typeof state.settings !== "object" ||
    state.settings === null ||
    Array.isArray(state.settings)
  ) {
    throw new Error('WhatsApp state field "settings" must be an object');
  }
  syncViewMode(state);
  return state;
}

function getConversations(
  draft: WorldState,
  deviceId: string,
): Record<string, WhatsAppConversation> {
  const appState = getAppState(draft, deviceId);
  return appState.conversations as Record<string, WhatsAppConversation>;
}

function addMessage(
  conversation: WhatsAppConversation,
  message: WhatsAppMessage,
): void {
  ensureMessageMediaLifecycle(message);
  if (getMessageById(conversation, message.id)) {
    throw new Error(
      `Duplicate WhatsApp message id "${message.id}" in conversation "${conversation.id}"`,
    );
  }
  conversation.messages.push(message);
  const lastMessageAt = message.timestampMs ?? message.at;
  if (typeof lastMessageAt === "number") {
    conversation.lastMessageAt = lastMessageAt;
  }
}

function isLifecycleMedia(message: WhatsAppMessage): boolean {
  return [
    "image",
    "video",
    "voice",
    "gif",
    "sticker",
    "document",
    "location",
  ].includes(message.type);
}

function hasMediaSource(message: WhatsAppMessage): boolean {
  return Boolean(
    message.imageUrl ??
      message.videoUrl ??
      message.thumbnailUrl ??
      message.gifUrl ??
      message.stickerUrl ??
      message.documentUrl ??
      message.mapThumbnailUrl ??
      (message.type === "voice"),
  );
}

function createMediaLifecycle(
  transferState: WhatsAppMediaLifecycle["transferState"],
): WhatsAppMediaLifecycle {
  return {
    transferState,
    transferProgress: transferState === "ready" ? 1 : 0,
    playbackState: "idle",
    playbackProgress: 0,
  };
}

function ensureMessageMediaLifecycle(message: WhatsAppMessage): void {
  if (!isLifecycleMedia(message)) {
    if (message.media !== undefined) {
      throw new Error(
        `WhatsApp message "${message.id}" cannot declare media lifecycle for type "${message.type}"`,
      );
    }
    return;
  }
  message.media ??= createMediaLifecycle(
    hasMediaSource(message) ? "ready" : "remote",
  );
}

function getMessageById(
  conversation: WhatsAppConversation,
  messageId: string,
): WhatsAppMessage | undefined {
  return conversation.messages.find((m) => m.id === messageId);
}

function requireMessageById(
  conversation: WhatsAppConversation,
  messageId: string,
  operation: string,
): WhatsAppMessage {
  const message = getMessageById(conversation, messageId);
  if (!message) {
    throw new Error(
      `Cannot ${operation}: WhatsApp message "${messageId}" does not exist in conversation "${conversation.id}"`,
    );
  }
  return message;
}

function resolveFrameTimestampMs(
  frame: number,
  draft: WorldState,
  deviceId?: string,
): number | undefined {
  const fps = draft.config?.fps ?? 30;
  const clock = deviceId ? draft.devices?.[deviceId]?.os?.clock : undefined;
  if (typeof clock !== "number" || clock <= 0) return undefined;
  return clock + Math.floor((frame / fps) * 1000);
}

function generateTimestamp(
  frame: number,
  draft: WorldState,
  deviceId?: string,
): string {
  const timestampMs = resolveFrameTimestampMs(frame, draft, deviceId);
  if (timestampMs !== undefined) {
    const date = new Date(timestampMs);
    return `${date.getUTCHours().toString().padStart(2, "0")}:${date
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  const fps = draft.config?.fps ?? 30;

  const baseHour = 10;
  const baseMinute = 42;

  const totalSeconds = Math.floor(frame / fps);
  const totalMinutes =
    baseHour * 60 + baseMinute + Math.floor(totalSeconds / 60);
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function addTimestampedMessage(
  conversation: WhatsAppConversation,
  message: WhatsAppMessage,
  draft: WorldState,
  deviceId?: string,
): void {
  if (message.timestampMs === undefined && typeof message.at === "number") {
    message.timestampMs = resolveFrameTimestampMs(message.at, draft, deviceId);
  }
  addMessage(conversation, message);
}

export function whatsappReducer(draft: WorldState, event: TimelineEvent): void {
  const parsed = parseWhatsAppEventStrict(event);

  const handler = HANDLERS[parsed.type];
  if (!handler) {
    throw new Error(`No WhatsApp handler registered for "${parsed.type}"`);
  }

  const conversationId = getEventConversationId(parsed);

  // Global events are valid without conversation state. Their context throws
  // if a handler accidentally reaches for conversation-scoped APIs.
  if (!conversationId) {
    const state = getAppState(draft, parsed.deviceId);
    const ctx = createGlobalHandlerContext(draft, parsed, state);
    handler(ctx, parsed);
    state.layoutRevision += 1;
    syncViewMode(state);
    return;
  }

  const state = getAppState(draft, parsed.deviceId);
  const conversations = getConversations(draft, parsed.deviceId);
  if (!conversations[conversationId]) {
    throw new Error(
      `WhatsApp event references unknown conversation "${conversationId}"`,
    );
  }
  const conversation = conversations[conversationId];
  const previousMessageCount = conversation.messages.length;

  const ctx: HandlerContext = {
    draft,
    event: parsed,
    state,
    conversation,
    addMessage: (msg) =>
      addTimestampedMessage(conversation, msg, draft, parsed.deviceId),
    getMessageById: (id) => getMessageById(conversation, id),
    requireMessageById: (id, operation) =>
      requireMessageById(conversation, id, operation),
    generateTimestamp: (at) => generateTimestamp(at, draft, parsed.deviceId),
  };

  handler(ctx, parsed);
  if (
    conversation.messages.length > previousMessageCount &&
    state.threadViewport?.conversationId === conversationId
  ) {
    state.threadViewport = null;
  }
  state.layoutRevision += 1;
  syncViewMode(state);
}
