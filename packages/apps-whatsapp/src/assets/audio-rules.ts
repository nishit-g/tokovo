import { AutoSoundRule } from "@tokovo/core";
import { APP_IDS } from "@tokovo/core";

export const whatsappAudioRules: AutoSoundRule[] = [
    // === V2 EVENTS ===
    {
        match: { kind: "MessageSent", appId: APP_IDS.WHATSAPP },
        action: "PLAY_ONE_SHOT",
        sound: "app_whatsapp.message_out",
        bus: "ui",
        duckMusic: true
    },
    {
        match: { kind: "MessageReceived", appId: APP_IDS.WHATSAPP },
        action: "PLAY_ONE_SHOT",
        sound: "app_whatsapp.message_in",
        bus: "ui",
        duckMusic: true
    },
    {
        match: { kind: "TypingStarted", appId: APP_IDS.WHATSAPP },
        action: "START_LOOP",
        sound: "app_whatsapp.typing_loop",
        bus: "sfx",
        volume: 0.4,
        idTemplate: "typing_{conversationId}_{actor}" // V2 uses "actor" instead of "from"
    },
    {
        match: { kind: "TypingEnded", appId: APP_IDS.WHATSAPP },
        action: "STOP_SOUND",
        stopId: "typing_{conversationId}_{actor}"
    },


];
