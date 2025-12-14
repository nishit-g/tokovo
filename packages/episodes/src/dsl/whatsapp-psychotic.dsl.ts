/**
 * WhatsApp Psychotic Demo
 * 
 * Features demo: missed calls, deleted messages, voice notes,
 * screenshot alerts, edited messages.
 * 
 * DSL version of whatsapp-psychotic-demo.json
 */

import { episode, iPhone } from "@tokovo/dsl";

export const whatsappPsychotic = episode("whatsapp-psychotic")
    .meta({
        title: "WhatsApp Features Demo",
        fps: 30,
    })
    .device("main_phone", {
        profile: iPhone,
        isLocked: false,
        foregroundAppId: "app_whatsapp",
    })
    .app("app_whatsapp", {
        conversationId: "conv_psycho",
        conversationName: "Toxic Ex 🚩",
    })
    .initialMessages("conv_psycho", [
        { from: "Toxic Ex 🚩", type: "call_missed", status: "read" },
        { from: "Toxic Ex 🚩", type: "deleted", status: "read" },
    ])

    // Beat 1: Voice message
    .beat("voice-message", (b) => {
        b.wait("2s");
        b.receiveVoice("Toxic Ex 🚩", { duration: 45 });
    })

    // Beat 2: Screenshot alert
    .beat("screenshot-alert", (b) => {
        b.wait("2s");
        b.receiveSystem("Toxic Ex 🚩", "screenshot_notification");
    })

    // Beat 3: Edited message response
    .beat("edited-response", (b) => {
        b.wait("2s");
        b.send("Why are you doing this?", { edited: true });
    })

    .build();

export default whatsappPsychotic;
