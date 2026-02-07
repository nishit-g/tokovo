import type { TrackEvent } from "@tokovo/ir";
import { getLoweringScratchpad, planTypedKeyboard, type RuntimeEvent } from "@tokovo/core";
import type { IMessageTrackEvent, IMessageEventType, IMessageEventPayload } from "../types/index.js";

export interface IMessageLoweringHandler {
  lower: (event: TrackEvent, ctx?: unknown) => RuntimeEvent[];
}

function isIMessageTrackEvent(event: TrackEvent): event is IMessageTrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_imessage"
  );
}

function clampFrame(frame: number): number {
  return Math.max(0, Math.round(frame));
}

function createRuntimeEvent(
  event: TrackEvent,
  type: IMessageEventType,
  payload: IMessageEventPayload,
): RuntimeEvent {
  return {
    at: event.at,
    kind: "APP",
    appId: "app_imessage",
    type,
    payload,
    deviceId: event.deviceId,
  } as RuntimeEvent;
}

type IMessageLoweringScratchpad = { lastEventAtByConversation: Map<string, number> };

function expandTypedSend(event: IMessageTrackEvent, ctx?: unknown): RuntimeEvent[] {
  const payload = (event.payload ?? {}) as {
    conversationId?: string;
    text?: string;
    typed?: boolean;
    charDelay?: number;
  };

  const text = payload.text ?? "";
  const deviceId = event.deviceId;
  const sendAt = event.at;
  const conversationId = payload.conversationId;

  if (!text) {
    return [createRuntimeEvent(event, event.type as IMessageEventType, payload as IMessageEventPayload)];
  }

  const scratchpad = getLoweringScratchpad<IMessageLoweringScratchpad>(
    ctx,
    "app_imessage.lowering",
    () => ({ lastEventAtByConversation: new Map() }),
  );
  const key = `${deviceId}::${conversationId ?? "unknown"}`;
  const prevAt = scratchpad.lastEventAtByConversation.get(key) ?? 0;
  const notBeforeFrame = prevAt > 0 ? prevAt + 2 : 0;

  const plan = planTypedKeyboard({
    deviceId,
    submitAt: sendAt,
    text,
    requestedCharDelay: payload.charDelay ?? 3,
    notBeforeFrame,
    keyboardType: "default",
    returnKeyType: "send",
  });

  scratchpad.lastEventAtByConversation.set(key, Math.max(prevAt, sendAt));

  const appSendEvent = createRuntimeEvent(
    event,
    event.type as IMessageEventType,
    payload as IMessageEventPayload,
  );

  const clearDraftAt = plan.ok ? (plan.keyboardHideAt ?? sendAt) : sendAt;

  const clearDraftEvent =
    conversationId
      ? ({
          at: clearDraftAt,
          kind: "APP",
          appId: "app_imessage",
          type: "IMESSAGE_CLEAR_DRAFT",
          payload: { conversationId, text: "" },
          deviceId,
        } as unknown as RuntimeEvent)
      : null;

  if (!plan.ok) {
    const out: RuntimeEvent[] = [appSendEvent];
    if (clearDraftEvent) out.push(clearDraftEvent);
    return out;
  }

  const [showEv, typeEv, pressEv, hideEv] = plan.events;
  const out: RuntimeEvent[] = [showEv, typeEv, pressEv, appSendEvent];
  if (clearDraftEvent) out.push(clearDraftEvent);
  out.push(hideEv);
  return out;
}

export const iMessageV2Lowering: IMessageLoweringHandler = {
  lower: (event: TrackEvent, ctx?: unknown): RuntimeEvent[] => {
    if (!isIMessageTrackEvent(event)) return [];
    const type = event.type as IMessageEventType | undefined;
    if (!type) return [];
    const payload = (event.payload ?? {}) as IMessageEventPayload;

    if (type === "IMESSAGE_MESSAGE_SEND" && (payload as { typed?: boolean }).typed) {
      return expandTypedSend(event as IMessageTrackEvent, ctx);
    }

    // Update last-seen timestamp for conversation-scoped timing heuristics.
    const conversationId =
      (payload as { conversationId?: string }).conversationId ??
      (event as { conversationId?: string }).conversationId;
    if (conversationId) {
      const scratchpad = getLoweringScratchpad<IMessageLoweringScratchpad>(
        ctx,
        "app_imessage.lowering",
        () => ({ lastEventAtByConversation: new Map() }),
      );
      const key = `${event.deviceId}::${conversationId}`;
      const prevAt = scratchpad.lastEventAtByConversation.get(key) ?? 0;
      scratchpad.lastEventAtByConversation.set(key, Math.max(prevAt, event.at));
    }

    return [createRuntimeEvent(event, type, payload)];
  },
};
