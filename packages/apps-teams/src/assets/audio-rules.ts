import type { TokovoPluginContract } from "@tokovo/core";
import { TEAMS_APP_ID } from "../constants.js";

export const teamsAudioRules: NonNullable<TokovoPluginContract["audioRules"]> = [
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_MESSAGE_SEND" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.message_out",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_MESSAGE_RECEIVE" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.message_in",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_NOTIFICATION_PUSH" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.notify",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_CALL_START" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.call_start",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: TEAMS_APP_ID, type: "TEAMS_CALL_END" },
    action: "PLAY_ONE_SHOT",
    sound: "app_teams.call_end",
    bus: "ui",
  },
];
