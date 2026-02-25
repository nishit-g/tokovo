import type { RuntimeEvent } from "@tokovo/core";

export type RuntimeValidationSeverity = "error" | "warning";

export interface RuntimeValidationIssue {
  severity: RuntimeValidationSeverity;
  message: string;
  at?: number;
  appId?: string;
  type?: string;
}

type AnyRuntimeEvent = RuntimeEvent & {
  appId?: string;
  type?: string;
  payload?: unknown;
};

function isAppEvent(e: AnyRuntimeEvent): e is AnyRuntimeEvent & { kind: "APP" } {
  return (e as { kind?: string }).kind === "APP";
}

function getPayloadScreen(e: AnyRuntimeEvent): string | undefined {
  const payload = (e as { payload?: unknown }).payload;
  if (payload && typeof payload === "object") {
    const screen = (payload as { screen?: unknown }).screen;
    if (typeof screen === "string") return screen;
  }
  const screen = (e as { screen?: unknown }).screen;
  return typeof screen === "string" ? screen : undefined;
}

function hasWhatsAppChatNavigationBefore(
  events: AnyRuntimeEvent[],
  firstChatFrame: number,
): boolean {
  return events.some((e) => {
    if (!isAppEvent(e)) return false;
    if (e.appId !== "app_whatsapp") return false;
    if (typeof e.at !== "number" || e.at > firstChatFrame) return false;

    if (e.type === "CONVERSATION_OPENED") return true;
    if (e.type === "NAVIGATE_SCREEN") {
      return getPayloadScreen(e) === "chat";
    }
    return false;
  });
}

function hasIMessageChatNavigationBefore(
  events: AnyRuntimeEvent[],
  firstChatFrame: number,
): boolean {
  return events.some((e) => {
    if (!isAppEvent(e)) return false;
    if (e.appId !== "app_imessage") return false;
    if (typeof e.at !== "number" || e.at > firstChatFrame) return false;

    // iMessage can be entered either by setting screen, or by explicit open.
    if (e.type === "IMESSAGE_CONVERSATION_OPEN") return true;
    if (e.type === "IMESSAGE_SET_SCREEN") {
      return getPayloadScreen(e) === "chat";
    }
    return false;
  });
}

function hasXThreadNavigationBefore(
  events: AnyRuntimeEvent[],
  firstChatFrame: number,
): boolean {
  return events.some((e) => {
    if (!isAppEvent(e)) return false;
    if (e.appId !== "app_x") return false;
    if (typeof e.at !== "number" || e.at > firstChatFrame) return false;

    // X treats DM threads as CHAT viewMode in our v1 mapping. Entering it should
    // set screen=thread and/or set active thread id.
    if (e.type === "SET_ACTIVE_THREAD") return true;
    if (e.type === "SET_SCREEN") {
      return getPayloadScreen(e) === "thread";
    }
    return false;
  });
}

/**
 * V1 runtime authoring validation.
 *
 * Goal: fail fast on episodes that emit chat events without ever opening the
 * corresponding chat screen/thread. This prevents "messages render in the
 * chat list" regressions.
 */
export function validateV1RuntimeEpisode(
  events: RuntimeEvent[],
): RuntimeValidationIssue[] {
  const issues: RuntimeValidationIssue[] = [];
  const evs = events as AnyRuntimeEvent[];

  // WhatsApp: if it emits chat messages, it must navigate to chat first.
  const waChatEventTypes = new Set([
    "MESSAGE_RECEIVED",
    "MESSAGE_SENT",
    "IMAGE_RECEIVED",
    "IMAGE_SENT",
    "VIDEO_RECEIVED",
    "VIDEO_SENT",
    "VOICE_RECEIVED",
    "VOICE_SENT",
    "GIF_RECEIVED",
    "GIF_SENT",
    "STICKER_RECEIVED",
    "STICKER_SENT",
    "DOCUMENT_RECEIVED",
    "DOCUMENT_SENT",
    "CONTACT_RECEIVED",
    "CONTACT_SENT",
    "LOCATION_RECEIVED",
    "LOCATION_SENT",
    "TYPING_START",
    "TYPING_END",
    "REACT",
    "READ",
    "READ_MESSAGES",
    "MESSAGE_DELETED",
    "MESSAGE_EDITED",
    "MESSAGE_FORWARDED",
    "VOICE_MESSAGE_RECEIVED",
  ]);

  const firstWaChat = evs
    .filter((e) => isAppEvent(e) && e.appId === "app_whatsapp")
    .filter((e) => typeof e.at === "number")
    .filter((e) => e.type && waChatEventTypes.has(e.type))
    .sort((a, b) => (a.at as number) - (b.at as number))[0];

  if (firstWaChat) {
    const firstFrame = firstWaChat.at as number;
    if (!hasWhatsAppChatNavigationBefore(evs, firstFrame)) {
      issues.push({
        severity: "error",
        appId: "app_whatsapp",
        type: firstWaChat.type,
        at: firstFrame,
        message:
          `WhatsApp emits chat events but never opens a conversation before frame ${firstFrame}. ` +
          `Fix: add 'wa.switchTo(<conversationId>, \"0s\")' (or 'wa.openChat(...)') before the first message.`,
      });
    }
  }

  // iMessage: if it emits chat messages, it must navigate to chat first.
  const iMessageChatTypes = new Set([
    "IMESSAGE_MESSAGE_SEND",
    "IMESSAGE_MESSAGE_RECEIVE",
    "IMESSAGE_TYPING_START",
    "IMESSAGE_TYPING_END",
    "IMESSAGE_TAPBACK_ADD",
    "IMESSAGE_TAPBACK_REMOVE",
    "IMESSAGE_MESSAGE_READ",
  ]);

  const firstIMsgChat = evs
    .filter((e) => isAppEvent(e) && e.appId === "app_imessage")
    .filter((e) => typeof e.at === "number")
    .filter((e) => e.type && iMessageChatTypes.has(e.type))
    .sort((a, b) => (a.at as number) - (b.at as number))[0];

  if (firstIMsgChat) {
    const firstFrame = firstIMsgChat.at as number;
    if (!hasIMessageChatNavigationBefore(evs, firstFrame)) {
      issues.push({
        severity: "error",
        appId: "app_imessage",
        type: firstIMsgChat.type,
        at: firstFrame,
        message:
          `iMessage emits chat events but never opens a conversation before frame ${firstFrame}. ` +
          `Fix: ensure your episode sets screen=chat and opens the active conversation before sending/receiving messages.`,
      });
    }
  }

  // X: DM messages should typically correspond to being in a thread; warn if not.
  const firstXDM = evs
    .filter((e) => isAppEvent(e) && e.appId === "app_x")
    .filter((e) => typeof e.at === "number")
    .filter((e) => e.type === "ADD_DM_MESSAGE")
    .sort((a, b) => (a.at as number) - (b.at as number))[0];

  if (firstXDM) {
    const firstFrame = firstXDM.at as number;
    if (!hasXThreadNavigationBefore(evs, firstFrame)) {
      issues.push({
        severity: "warning",
        appId: "app_x",
        type: firstXDM.type,
        at: firstFrame,
        message:
          `X emits DM messages before entering a thread by frame ${firstFrame}. ` +
          `This may be intentional (background DM arrival), but if camera/anchors target DM thread, ` +
          `ensure you set screen=thread and activeThreadId before focusing.`,
      });
    }
  }

  return issues;
}
