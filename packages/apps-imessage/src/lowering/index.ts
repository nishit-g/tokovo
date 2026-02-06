import type { TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import type { IMessageTrackEvent, IMessageEventType, IMessageEventPayload } from "../types/index.js";

export interface IMessageLoweringHandler {
  lower: (event: TrackEvent) => RuntimeEvent[];
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

function expandTypedSend(event: IMessageTrackEvent): RuntimeEvent[] {
  const payload = (event.payload ?? {}) as {
    conversationId?: string;
    text?: string;
    typed?: boolean;
    charDelay?: number;
  };

  const text = payload.text ?? "";
  const charDelay = payload.charDelay ?? 3;
  const deviceId = event.deviceId;
  const sendAt = event.at;
  const conversationId = payload.conversationId;

  if (!text) {
    return [createRuntimeEvent(event, event.type as IMessageEventType, payload as IMessageEventPayload)];
  }

  const typeDuration = text.length * charDelay;
  const keyboardShowAt = clampFrame(sendAt - typeDuration - 20);
  const typeStartAt = clampFrame(sendAt - typeDuration - 5);
  const returnPressAt = clampFrame(sendAt - 3);
  const keyboardHideAt = clampFrame(sendAt + 15);

  const result: RuntimeEvent[] = [];

  result.push({
    at: keyboardShowAt,
    kind: "DEVICE",
    type: "KEYBOARD_SHOW",
    deviceId,
    payload: { returnKeyType: "send" },
  } as unknown as RuntimeEvent);

  // Use charDelay for parity with WhatsApp (keyboard plugin supports it directly).
  result.push({
    at: typeStartAt,
    kind: "DEVICE",
    type: "KEYBOARD_TYPE",
    deviceId,
    payload: { text, charDelay },
  } as unknown as RuntimeEvent);

  result.push({
    at: returnPressAt,
    kind: "DEVICE",
    type: "KEYBOARD_KEY_PRESS",
    deviceId,
    payload: { key: "return", duration: 4 },
  } as unknown as RuntimeEvent);

  result.push(createRuntimeEvent(event, event.type as IMessageEventType, payload as IMessageEventPayload));

  // Keep iMessage draft clean after sending.
  if (conversationId) {
    result.push({
      at: keyboardHideAt,
      kind: "APP",
      appId: "app_imessage",
      type: "IMESSAGE_CLEAR_DRAFT",
      payload: { conversationId, text: "" },
      deviceId,
    } as unknown as RuntimeEvent);
  }

  result.push({
    at: keyboardHideAt,
    kind: "DEVICE",
    type: "KEYBOARD_HIDE",
    deviceId,
    payload: {},
  } as unknown as RuntimeEvent);

  return result;
}

export const iMessageV2Lowering: IMessageLoweringHandler = {
  lower: (event: TrackEvent): RuntimeEvent[] => {
    if (!isIMessageTrackEvent(event)) return [];
    const type = event.type as IMessageEventType | undefined;
    if (!type) return [];
    const payload = (event.payload ?? {}) as IMessageEventPayload;

    if (type === "IMESSAGE_MESSAGE_SEND" && (payload as { typed?: boolean }).typed) {
      return expandTypedSend(event as IMessageTrackEvent);
    }

    return [createRuntimeEvent(event, type, payload)];
  },
};
