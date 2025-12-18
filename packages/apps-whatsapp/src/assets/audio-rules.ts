import { AutoSoundRule } from "@tokovo/core";
import { APP_IDS } from "@tokovo/core";

export const whatsappAudioRules: AutoSoundRule[] = [
    // === RUNTIME EVENTS (after lowering, kind=APP) ===
    {
        match: { kind: "APP", appId: APP_IDS.WHATSAPP, type: "MESSAGE_SENT" },
        action: "PLAY_ONE_SHOT",
        sound: "app_whatsapp.message_out",
        bus: "ui",
        duckMusic: true
    },
    {
        match: { kind: "APP", appId: APP_IDS.WHATSAPP, type: "MESSAGE_RECEIVED" },
        action: "PLAY_ONE_SHOT",
        sound: "app_whatsapp.message_in",
        bus: "ui",
        duckMusic: true
    },
    {
        match: { kind: "APP", appId: APP_IDS.WHATSAPP, type: "TYPING_START" },
        action: "START_LOOP",
        sound: "app_whatsapp.typing_loop",
        bus: "sfx",
        volume: 0.4,
        idTemplate: "typing_{conversationId}_{from}"
    },
    {
        match: { kind: "APP", appId: APP_IDS.WHATSAPP, type: "TYPING_END" },
        action: "STOP_SOUND",
        stopId: "typing_{conversationId}_{from}"
    },

];
