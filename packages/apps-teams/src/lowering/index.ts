import type { TrackEvent } from "@tokovo/ir";
import { getLoweringScratchpad, planTypedKeyboard, type RuntimeEvent } from "@tokovo/core";
import { TEAMS_APP_ID } from "../constants.js";
import { TeamsLoweringError } from "../errors.js";
import { parseTeamsEvent, type TeamsTrackEvent } from "../schemas/index.js";

type TeamsLoweringScratchpad = {
  lastEventAtByThread: Map<string, number>;
};

function computeNotBeforeFrame(prevAt: number, submitAt: number): number {
  if (prevAt <= 0) return 0;
  return Math.max(0, Math.min(prevAt + 1, submitAt - 1));
}

function toRuntime(event: TeamsTrackEvent): RuntimeEvent {
  return {
    at: event.at,
    kind: "APP",
    appId: TEAMS_APP_ID,
    type: event.type,
    payload: event.payload,
    deviceId: event.deviceId,
    _declarationOrder: event._declarationOrder,
  };
}

function createKeyboardClearEvent(deviceId: string, at: number): RuntimeEvent {
  return {
    at,
    kind: "DEVICE",
    type: "KEYBOARD_CLEAR",
    deviceId,
    payload: {},
  } as RuntimeEvent;
}

function notificationThreadKey(
  event: TeamsTrackEvent,
): string | undefined {
  if (event.type !== "TEAMS_NOTIFICATION_PUSH") return undefined;
  const target = event.payload.target;
  if (!target) return undefined;
  if (target.threadId) {
    return `${target.channelId ?? "channel"}:${target.threadId}`;
  }
  if (target.dmId) {
    return `dm:${target.dmId}`;
  }
  if (target.channelId) {
    return `channel:${target.channelId}`;
  }
  return undefined;
}

function createNotificationRuntimeEvents(event: TeamsTrackEvent): RuntimeEvent[] {
  if (event.type === "TEAMS_NOTIFICATION_PUSH") {
    return [
      toRuntime(event),
      {
        at: event.at,
        kind: "DEVICE",
        type: "SHOW_NOTIFICATION",
        deviceId: event.deviceId,
        payload: {
          kind: "show",
          id: event.payload.id,
          appId: TEAMS_APP_ID,
          title: event.payload.title,
          body: event.payload.text,
          priority: event.payload.kind === "mention" ? "high" : "default",
          mode: "headsup",
          duration: event.payload.ttlFrames,
          threadKey: notificationThreadKey(event),
          metadata: {
            kind: event.payload.kind ?? "message",
          },
        },
      } as unknown as RuntimeEvent,
    ];
  }

  if (event.type === "TEAMS_NOTIFICATION_DISMISS") {
    return [
      toRuntime(event),
      {
        at: event.at,
        kind: "DEVICE",
        type: "DISMISS_NOTIFICATION",
        deviceId: event.deviceId,
        payload: {
          kind: "dismiss",
          id: event.payload.id,
        },
      } as unknown as RuntimeEvent,
    ];
  }

  return [toRuntime(event)];
}

function maybeExpandTyped(event: TeamsTrackEvent, ctx?: unknown): RuntimeEvent[] {
  if (
    event.type !== "TEAMS_MESSAGE_SEND" &&
    event.type !== "TEAMS_MESSAGE_RECEIVE"
  ) {
    return createNotificationRuntimeEvents(event);
  }

  const payload = event.payload;
  if (!payload.typed || !payload.text || payload.text.length === 0) {
    return createNotificationRuntimeEvents(event);
  }

  const scratch = getLoweringScratchpad<TeamsLoweringScratchpad>(
    ctx,
    "app_teams.lowering",
    () => ({ lastEventAtByThread: new Map() }),
  );

  const threadId = payload.target.kind === "dm" ? payload.target.dmId : payload.target.threadId;
  const threadKey = `${event.deviceId}:${threadId}`;
  const prevAt = scratch.lastEventAtByThread.get(threadKey) ?? 0;

  const plan = planTypedKeyboard({
    deviceId: event.deviceId,
    submitAt: event.at,
    text: payload.text,
    requestedCharDelay: payload.charDelay ?? 3,
    notBeforeFrame: computeNotBeforeFrame(prevAt, event.at),
    keyboardType: "default",
    returnKeyType: "send",
  });

  scratch.lastEventAtByThread.set(threadKey, Math.max(prevAt, event.at));

  if (!plan.ok) {
    return createNotificationRuntimeEvents(event);
  }

  const [showEv, typeEv, pressEv, hideEv] = plan.events;
  return [
    showEv,
    typeEv,
    pressEv,
    ...createNotificationRuntimeEvents(event),
    createKeyboardClearEvent(event.deviceId, event.at),
    hideEv,
  ];
}

export const teamsV2Lowering = {
  lower: (event: TrackEvent, ctx?: unknown): RuntimeEvent[] => {
    if (event.kind !== "APP" || event.appId !== TEAMS_APP_ID) return [];

    const parsed = parseTeamsEvent(event);
    if (!parsed) {
      throw new TeamsLoweringError("[teamsV2Lowering] Unsupported TEAMS event type");
    }

    return maybeExpandTyped(parsed, ctx);
  },
};
