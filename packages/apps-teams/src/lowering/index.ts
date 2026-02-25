import type { TrackEvent } from "@tokovo/ir";
import { getLoweringScratchpad, planTypedKeyboard, type RuntimeEvent } from "@tokovo/core";
import { TEAMS_APP_ID } from "../constants.js";
import { TeamsLoweringError } from "../errors.js";
import type { TeamsEventType, TeamsTrackEvent } from "../types/index.js";

type TeamsLoweringScratchpad = {
  lastEventAtByThread: Map<string, number>;
};

const ALLOWED_TYPES: readonly TeamsEventType[] = [
  "TEAMS_DM_SEND",
  "TEAMS_DM_RECEIVE",
  "TEAMS_CHANNEL_POST",
  "TEAMS_CHANNEL_REPLY",
  "TEAMS_THREAD_OPEN",
  "TEAMS_THREAD_CLOSE",
  "TEAMS_SET_ACTIVE_CHAT",
  "TEAMS_SET_ACTIVE_CHANNEL",
  "TEAMS_MENTION_ADD",
  "TEAMS_PRESENCE_SET",
  "TEAMS_CALL_START",
  "TEAMS_CALL_END",
  "TEAMS_NOTIFICATION_PUSH",
  "TEAMS_NAVIGATE_SCREEN",
];

function isTeamsTrackEvent(event: TrackEvent): event is TeamsTrackEvent {
  return event.kind === "APP" && event.appId === TEAMS_APP_ID && ALLOWED_TYPES.includes(event.type as TeamsEventType);
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

function maybeExpandTyped(event: TeamsTrackEvent, ctx?: unknown): RuntimeEvent[] {
  if (
    event.type !== "TEAMS_DM_SEND" &&
    event.type !== "TEAMS_CHANNEL_POST" &&
    event.type !== "TEAMS_CHANNEL_REPLY"
  ) {
    return [toRuntime(event)];
  }

  const payload = event.payload;
  if (!payload.typed || !payload.text || payload.text.length === 0) {
    return [toRuntime(event)];
  }

  const scratch = getLoweringScratchpad<TeamsLoweringScratchpad>(
    ctx,
    "app_teams.lowering",
    () => ({ lastEventAtByThread: new Map() }),
  );

  const threadId =
    "threadId" in payload
      ? payload.threadId
      : "dmId" in payload
        ? payload.dmId
        : "global";
  const threadKey = `${event.deviceId}:${threadId}`;
  const prevAt = scratch.lastEventAtByThread.get(threadKey) ?? 0;

  const plan = planTypedKeyboard({
    deviceId: event.deviceId,
    submitAt: event.at,
    text: payload.text,
    requestedCharDelay: payload.charDelay ?? 3,
    notBeforeFrame: prevAt > 0 ? prevAt + 2 : 0,
    keyboardType: "default",
    returnKeyType: "send",
  });

  scratch.lastEventAtByThread.set(threadKey, Math.max(prevAt, event.at));

  if (!plan.ok) {
    return [toRuntime(event)];
  }

  const [showEv, typeEv, pressEv, hideEv] = plan.events;
  return [showEv, typeEv, pressEv, toRuntime(event), hideEv];
}

export const teamsV2Lowering = {
  lower: (event: TrackEvent, ctx?: unknown): RuntimeEvent[] => {
    if (event.kind !== "APP" || event.appId !== TEAMS_APP_ID) return [];

    if (!isTeamsTrackEvent(event)) {
      throw new TeamsLoweringError("[teamsV2Lowering] Unsupported TEAMS event type");
    }

    return maybeExpandTyped(event, ctx);
  },
};
