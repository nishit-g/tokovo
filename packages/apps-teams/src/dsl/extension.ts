import type { DslExtension } from "@tokovo/core";
import { TEAMS_APP_ID, TEAMS_SELF_USER_ID } from "../constants.js";
import type { TeamsMessageTarget } from "../types/index.js";

interface TeamsBeatBuilder {
  ops: Array<Record<string, unknown>>;
  currentTarget?: TeamsMessageTarget;
}

export interface TeamsDslApi {
  openDm(dmId: string): void;
  openThread(channelId: string, threadId: string): void;
  send(text: string, target?: TeamsMessageTarget): void;
  receive(senderId: string, text: string, target?: TeamsMessageTarget): void;
  typing: {
    start(userId: string, target?: TeamsMessageTarget): void;
    end(userId: string, target?: TeamsMessageTarget): void;
  };
  draft(text: string, target?: TeamsMessageTarget): void;
}

function appEvent(
  type: string,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  return {
    kind: "AppEvent",
    appId: TEAMS_APP_ID,
    type,
    payload,
  };
}

export const teamsDsl: DslExtension<TeamsDslApi> = {
  createApi: (builderUnknown: unknown): TeamsDslApi => {
    const builder = builderUnknown as TeamsBeatBuilder;
    const resolveTarget = (target?: TeamsMessageTarget): TeamsMessageTarget => {
      if (target) return target;
      return builder.currentTarget ?? { kind: "dm", dmId: "dm_default" };
    };

    return {
      openDm: (dmId: string) => {
        builder.currentTarget = { kind: "dm", dmId };
        builder.ops.push(appEvent("TEAMS_OPEN_DM", { dmId }));
      },
      openThread: (channelId: string, threadId: string) => {
        builder.currentTarget = { kind: "thread", channelId, threadId };
        builder.ops.push(appEvent("TEAMS_OPEN_THREAD", { channelId, threadId }));
      },
      send: (text: string, target?: TeamsMessageTarget) => {
        builder.ops.push(
          appEvent("TEAMS_MESSAGE_SEND", {
            messageId: `dsl_send_${builder.ops.length}`,
            senderId: TEAMS_SELF_USER_ID,
            text,
            target: resolveTarget(target),
          }),
        );
      },
      receive: (senderId: string, text: string, target?: TeamsMessageTarget) => {
        builder.ops.push(
          appEvent("TEAMS_MESSAGE_RECEIVE", {
            messageId: `dsl_receive_${builder.ops.length}`,
            senderId,
            text,
            target: resolveTarget(target),
          }),
        );
      },
      typing: {
        start: (userId: string, target?: TeamsMessageTarget) => {
          builder.ops.push(
            appEvent("TEAMS_TYPING_START", {
              userId,
              target: resolveTarget(target),
            }),
          );
        },
        end: (userId: string, target?: TeamsMessageTarget) => {
          builder.ops.push(
            appEvent("TEAMS_TYPING_END", {
              userId,
              target: resolveTarget(target),
            }),
          );
        },
      },
      draft: (text: string, target?: TeamsMessageTarget) => {
        builder.ops.push(
          appEvent("TEAMS_DRAFT_SET", {
            text,
            target: resolveTarget(target),
          }),
        );
      },
    };
  },
};
