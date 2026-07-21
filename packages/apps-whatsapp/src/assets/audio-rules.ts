import { AutoSoundRule } from "@tokovo/core";
import { WHATSAPP_APP_ID } from "../constants.js";

export const whatsappAudioRules: AutoSoundRule[] = [
  {
    match: { kind: "APP", appId: WHATSAPP_APP_ID, type: "MESSAGE_SENT" },
    action: "PLAY_ONE_SHOT",
    sound: "app_whatsapp.message_out",
    bus: "ui",
    duckMusic: true,
  },
  {
    match: { kind: "APP", appId: WHATSAPP_APP_ID, type: "TYPING_START" },
    action: "START_LOOP",
    sound: "app_whatsapp.typing_loop",
    bus: "sfx",
    volume: 0.4,
    idTemplate: "typing_{conversationId}_{actor}",
  },
  {
    match: { kind: "APP", appId: WHATSAPP_APP_ID, type: "TYPING_END" },
    action: "STOP_SOUND",
    stopId: "typing_{conversationId}_{actor}",
  },
];
