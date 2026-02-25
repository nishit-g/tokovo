import type { TrackEvent } from "@tokovo/ir";
import { getLoweringScratchpad, planTypedKeyboard, type RuntimeEvent } from "@tokovo/core";
import type { SnapchatEventType, SnapchatTrackEvent } from "../types/index.js";

export interface SnapchatLoweringHandler {
  lower: (event: TrackEvent, ctx?: unknown) => RuntimeEvent[];
}

type SnapchatLoweringScratchpad = {
  lastEventAtByConversation: Map<string, number>;
};

const ALLOWED_TYPES: readonly SnapchatEventType[] = [
  "SNAPCHAT_CONVERSATION_CREATE",
  "SNAPCHAT_CONVERSATION_OPEN",
  "SNAPCHAT_MESSAGE_SEND",
  "SNAPCHAT_MESSAGE_RECEIVE",
  "SNAPCHAT_SNAP_SEND",
  "SNAPCHAT_SNAP_RECEIVE",
  "SNAPCHAT_SNAP_OPEN",
  "SNAPCHAT_TYPING_START",
  "SNAPCHAT_TYPING_END",
  "SNAPCHAT_STREAK_UPDATE",
  "SNAPCHAT_SET_SCREEN",
  "SNAPCHAT_MESSAGE_STATUS_SET",
  "SNAPCHAT_SCREENSHOT",
  "SNAPCHAT_SAVE_MESSAGE",
];

function isSnapchatTrackEvent(event: TrackEvent): event is SnapchatTrackEvent {
  return event.kind === "APP" && event.appId === "app_snapchat" && ALLOWED_TYPES.includes(event.type as SnapchatEventType);
}

function createRuntimeEvent(event: SnapchatTrackEvent): RuntimeEvent {
  return {
    at: event.at,
    kind: "APP",
    appId: "app_snapchat",
    type: event.type,
    payload: event.payload,
    deviceId: event.deviceId,
    _declarationOrder: event._declarationOrder,
  };
}

function expandTypedSend(
  event: Extract<SnapchatTrackEvent, { type: "SNAPCHAT_MESSAGE_SEND" }>,
  ctx?: unknown,
): RuntimeEvent[] {
  const text = event.payload.text ?? "";
  const deviceId = event.deviceId;
  const sendAt = event.at;
  const conversationId = event.payload.conversationId;

  if (!text) {
    return [createRuntimeEvent(event)];
  }

  const scratchpad = getLoweringScratchpad<SnapchatLoweringScratchpad>(
    ctx,
    "app_snapchat.lowering",
    () => ({ lastEventAtByConversation: new Map() }),
  );

  const key = `${deviceId}::${conversationId ?? "unknown"}`;
  const prevAt = scratchpad.lastEventAtByConversation.get(key) ?? 0;
  const notBeforeFrame = prevAt > 0 ? prevAt + 2 : 0;

  const plan = planTypedKeyboard({
    deviceId,
    submitAt: sendAt,
    text,
    requestedCharDelay: event.payload.charDelay ?? 3,
    notBeforeFrame,
    keyboardType: "default",
    returnKeyType: "send",
  });

  scratchpad.lastEventAtByConversation.set(key, Math.max(prevAt, sendAt));

  if (!plan.ok) {
    return [createRuntimeEvent(event)];
  }

  const [showEv, typeEv, pressEv, hideEv] = plan.events;
  return [showEv, typeEv, pressEv, createRuntimeEvent(event), hideEv];
}

export const snapchatV2Lowering: SnapchatLoweringHandler = {
  lower: (event: TrackEvent, ctx?: unknown): RuntimeEvent[] => {
    if (event.kind !== "APP" || event.appId !== "app_snapchat") return [];

    if (!isSnapchatTrackEvent(event)) {
      throw new Error("[snapchatV2Lowering] Unsupported SNAPCHAT event type");
    }

    if (event.type === "SNAPCHAT_MESSAGE_SEND" && event.payload.typed) {
      return expandTypedSend(event, ctx);
    }

    const conversationId =
      "conversationId" in event.payload
        ? event.payload.conversationId
        : event.conversationId;

    if (conversationId) {
      const scratchpad = getLoweringScratchpad<SnapchatLoweringScratchpad>(
        ctx,
        "app_snapchat.lowering",
        () => ({ lastEventAtByConversation: new Map() }),
      );
      const key = `${event.deviceId}::${conversationId}`;
      const prevAt = scratchpad.lastEventAtByConversation.get(key) ?? 0;
      scratchpad.lastEventAtByConversation.set(key, Math.max(prevAt, event.at));
    }

    return [createRuntimeEvent(event)];
  },
};
