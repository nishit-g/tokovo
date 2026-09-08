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
  // Remote typing indicators are silent. Local key sounds come exclusively
  // from prepared input operations, so pauses and edits cannot leave a loop on.
];
