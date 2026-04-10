import type { AppBehavior, CameraIntent } from "@tokovo/core";
import { TEAMS_APP_ID } from "../constants.js";

export const TEAMS_INTENT_MAPPINGS: Record<string, CameraIntent> = {
  TEAMS_OPEN_DM: { type: "FOCUS", anchor: "content", preset: "subtle" },
  TEAMS_OPEN_CHANNEL: { type: "FOCUS", anchor: "content", preset: "subtle" },
  TEAMS_OPEN_THREAD: { type: "FOCUS", anchor: "content", preset: "message" },
  TEAMS_MESSAGE_SEND: { type: "FOCUS", anchor: "lastMessage", preset: "message" },
  TEAMS_MESSAGE_RECEIVE: { type: "FOCUS", anchor: "lastMessage", preset: "dramatic" },
  TEAMS_TYPING_START: { type: "FOCUS", anchor: "inputArea", preset: "subtle" },
  TEAMS_NOTIFICATION_PUSH: { type: "FOCUS", anchor: "notification", preset: "snap" },
  TEAMS_CALL_START: { type: "FOCUS", anchor: "content", preset: "dramatic" },
  TEAMS_CALL_END: { type: "RESET", preset: "reset" },
};

export const TeamsBehavior: AppBehavior = {
  appId: TEAMS_APP_ID,
  eventMappings: TEAMS_INTENT_MAPPINGS,
  presetOverrides: {
    dramatic: { scale: 1.22 },
    snap: { scale: 1.14 },
  },
};
