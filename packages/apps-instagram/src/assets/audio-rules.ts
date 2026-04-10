import type { TokovoPluginContract } from "@tokovo/core";
import { INSTAGRAM_APP_ID } from "../constants.js";

export const instagramAudioRules: NonNullable<TokovoPluginContract["audioRules"]> = [
  {
    match: { kind: "APP", appId: INSTAGRAM_APP_ID, type: "INSTAGRAM_LIKE_POST" },
    action: "PLAY_ONE_SHOT",
    sound: "tap",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: INSTAGRAM_APP_ID, type: "INSTAGRAM_ADD_DM_MESSAGE" },
    action: "PLAY_ONE_SHOT",
    sound: "notification_soft",
    bus: "ui",
    duckMusic: true,
  },
];
