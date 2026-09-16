import { createWhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "notification-evening-plan", title: "A Change of Plans",
    description: "A quiet Lock Screen reply becomes a change of plans in the conversation.",
    category: "showcase", catalogType: "system_showcase", visibility: "public", sortOrder: 112,
    tags: ["notifications", "story", "keyboard", "native"],
  },
  config: { format: "1080x1920", durationInFrames: 600, apps: ["app_whatsapp"] },
  build: () => episode("notification-evening-plan", { fps: 30, duration: "20s" })
    .device("phone", "iphone16", {
      app: "app_whatsapp", locked: true, installedApps: ["app_whatsapp"], notificationUX: "native",
      notificationTokens: { card: "#f2f3f5", text: "#17181c", secondaryText: "#686b73", accent: "#007aff", border: "#d4d6dc", radius: 22, padding: 14 },
      os: { time: new Date("2026-09-08T18:30:00Z"), hourCycle: "h24", battery: 64 },
    })
    .snapshot("app_whatsapp", "phone", { conversations: [{ id: "plans", name: "Weekend plans", unreadCount: 0,
      messages: [
        ["Weekend plans", "Dinner at the usual place?"], ["me", "Yes. Booking for 7."],
        ["Weekend plans", "Window table if they have one."], ["me", "Already asked."],
        ["Weekend plans", "Perfect. I'll leave after work."], ["me", "See you there."],
      ].map(([from, text], index) => ({ id: `history-${index}`, type: "text", from, text, at: 0, timestamp: `18:${20 + index}` })), lastMessageAt: 0,
    }] })
    .input("phone", "notification-reply", { id: "plans-reply", appId: "app_whatsapp", at: "4.5s", until: "8.4s", clearOnSubmit: false,
      keyboard: { returnKey: "send" },
      script: [
        { type: "setSuggestions", suggestions: ["Leaving", "On my way", "Soon"] },
        { type: "type", text: "Leaving now." },
        { type: "setSuggestions", suggestions: ["See", "Meet", "I'll"] },
        { type: "type", text: " See you soon." },
      ], expectedFinalValue: "Leaving now. See you soon.",
    })
    .track("app_whatsapp", (order) => createWhatsAppTrackBuilder(30, "phone", "plans", order), (wa) => {
      wa.switchTo("plans", "0s");
      wa.at("0.8s").receive("Weekend plans", "Are you on your way?", { messageId: "leaving" });
      wa.at("10s").receive("Weekend plans", "Small change. Bring an umbrella.", { messageId: "change" });
      wa.at("15s").receive("Weekend plans", "We're eating on the rooftop. ☔");
      wa.at("18s").send("You booked the weather too?");
    })
    .notificationTrack("phone", (n) => {
      n.at("2s").authenticate();
      n.at("3.6s").expand("leaving");
      n.at("4.5s").beginReply("leaving", "plans-reply");
      n.at("8.4s").reply("leaving", "Leaving now. See you soon.");
      n.at("12.8s").tap("change");
      n.at("12.8s").markRead("change", 0, { type: "CONVERSATION_OPENED", payload: { conversationId: "plans" } });
    }).build(),
});
