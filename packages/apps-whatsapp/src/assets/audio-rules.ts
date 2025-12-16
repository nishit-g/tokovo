import { AutoSoundRule } from "@tokovo/core";
import { APP_IDS } from "@tokovo/core";

export const whatsappAudioRules: AutoSoundRule[] = [
    // === V2 EVENTS ===
    {
        match: { kind: "MessageSent", appId: APP_IDS.WHATSAPP },
        action: "PLAY_ONE_SHOT",
        sound: "whatsapp_sent",
        bus: "ui",
        duckMusic: true
    },
    {
        match: { kind: "MessageReceived", appId: APP_IDS.WHATSAPP },
        action: "PLAY_ONE_SHOT",
        sound: "whatsapp_received",
        bus: "ui",
        duckMusic: true
    },
    {
        match: { kind: "TypingStarted", appId: APP_IDS.WHATSAPP },
        action: "START_LOOP",
        sound: "whatsapp_typing",
        bus: "sfx",
        volume: 0.4,
        idTemplate: "typing_{conversationId}_{actor}" // V2 uses "actor" instead of "from"
    },
    {
        match: { kind: "TypingEnded", appId: APP_IDS.WHATSAPP },
        action: "STOP_SOUND",
        stopId: "typing_{conversationId}_{actor}"
    },

    // === LEGACY APP EVENTS ===
    // Send Message -> Play Sent Sound
    {
        match: { kind: "APP", type: "MESSAGE_SENT", appId: APP_IDS.WHATSAPP },
        action: "PLAY_ONE_SHOT",
        sound: "whatsapp_sent",
        bus: "ui",
        duckMusic: true
    },
    // Receive Message -> Play Received Sound
    {
        match: { kind: "APP", type: "MESSAGE_RECEIVED", appId: APP_IDS.WHATSAPP },
        action: "PLAY_ONE_SHOT",
        // Note: Engine already differentiates types, but we can be extra specific if needed
        sound: "whatsapp_received",
        bus: "ui",
        duckMusic: true
    },
    // Typing Start -> Start Loop
    {
        match: { kind: "APP", type: "TYPING_START", appId: APP_IDS.WHATSAPP },
        action: "START_LOOP",
        sound: "whatsapp_typing",
        bus: "sfx",
        volume: 0.4,
        idTemplate: "typing_{conversationId}_{from}" // Legacy uses "from"
    },
    // Typing End -> Stop Loop
    {
        match: { kind: "APP", type: "TYPING_END", appId: APP_IDS.WHATSAPP },
        action: "STOP_SOUND",
        stopId: "typing_{conversationId}_{from}" // Must match ID template above
    }
];
