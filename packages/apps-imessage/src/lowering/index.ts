import type { TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import type { IMessageTrackEvent, IMessageEventType, IMessageEventPayload } from "../types";

export interface IMessageLoweringHandler {
  lower: (event: TrackEvent) => RuntimeEvent[];
}

function isIMessageTrackEvent(event: TrackEvent): event is IMessageTrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_imessage"
  );
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

export const iMessageV2Lowering: IMessageLoweringHandler = {
  lower: (event: TrackEvent): RuntimeEvent[] => {
    if (!isIMessageTrackEvent(event)) return [];
    const type = event.type as IMessageEventType | undefined;
    if (!type) return [];
    const payload = (event.payload ?? {}) as IMessageEventPayload;

    return [createRuntimeEvent(event, type, payload)];
  },
};
