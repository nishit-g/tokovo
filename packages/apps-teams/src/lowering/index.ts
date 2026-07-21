import type { NotificationIntentEmitter, TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import { TEAMS_APP_ID, TEAMS_SELF_USER_ID } from "../constants.js";
import { TeamsLoweringError } from "../errors.js";
import { parseTeamsEvent, type TeamsTrackEvent } from "../schemas/index.js";

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

function emitIncomingMessageNotification(
  event: TeamsTrackEvent,
  ctx: NotificationIntentEmitter,
): void {
  if (event.type !== "TEAMS_MESSAGE_RECEIVE") return;
  const target = event.payload.target;
  const threadId =
    target.kind === "dm"
      ? `dm:${target.dmId}`
      : `${target.channelId}:${target.threadId}`;
  const isMention = event.payload.mentionedUserIds?.includes(TEAMS_SELF_USER_ID) ?? false;
  ctx.emitNotification({
    id: event.payload.messageId,
    deviceId: event.deviceId,
    appId: TEAMS_APP_ID,
    deliverAtFrame: event.at,
    sequence: event._declarationOrder,
    content: {
      title: event.payload.senderName ?? event.payload.senderId,
      body: event.payload.text,
      subtitle: target.kind === "dm" ? undefined : `#${target.channelId}`,
    },
    category: "work",
    threadId,
    groupId: threadId,
    interruption: isMention ? "timeSensitive" : "active",
    privacy: "private",
    metadata: {
      kind: isMention ? "mention" : "message",
      senderName: event.payload.senderName,
      route: target.kind === "dm" ? "dm" : "channel",
    },
    reply:
      target.kind === "dm"
        ? {
            actionId: "reply",
            placeholder: "Reply in Teams",
            textPayloadKey: "text",
            target: {
              appEvent: {
                type: "TEAMS_MESSAGE_SEND",
                payload: {
                  target,
                  senderId: TEAMS_SELF_USER_ID,
                  messageId: `notification-reply:${event.payload.messageId}`,
                },
              },
            },
          }
        : undefined,
  });
}

export const teamsV2Lowering = {
  lower: (event: TrackEvent, ctx: NotificationIntentEmitter): RuntimeEvent[] => {
    if (event.kind !== "APP" || event.appId !== TEAMS_APP_ID) return [];

    const parsed = parseTeamsEvent(event);
    if (!parsed) {
      throw new TeamsLoweringError("[teamsV2Lowering] Unsupported TEAMS event type");
    }

    emitIncomingMessageNotification(parsed, ctx);
    return [toRuntime(parsed)];
  },
};
