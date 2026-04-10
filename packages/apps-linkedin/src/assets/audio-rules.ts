import type { TokovoPluginContract } from "@tokovo/core";

export const linkedInAudioRules: NonNullable<TokovoPluginContract["audioRules"]> = [
  {
    match: { kind: "APP", appId: "app_linkedin", type: "LINKEDIN_REACT_POST" },
    action: "PLAY_ONE_SHOT",
    sound: "tap",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: "app_linkedin", type: "LINKEDIN_ADD_COMMENT" },
    action: "PLAY_ONE_SHOT",
    sound: "tap",
    bus: "ui",
  },
  {
    match: { kind: "APP", appId: "app_linkedin", type: "LINKEDIN_ADD_DM_MESSAGE" },
    action: "PLAY_ONE_SHOT",
    sound: "notification_soft",
    bus: "ui",
    duckMusic: true,
  },
  {
    match: { kind: "APP", appId: "app_linkedin", type: "LINKEDIN_ADD_NOTIFICATION" },
    action: "PLAY_ONE_SHOT",
    sound: "notification_soft",
    bus: "ui",
    duckMusic: true,
  },
];
