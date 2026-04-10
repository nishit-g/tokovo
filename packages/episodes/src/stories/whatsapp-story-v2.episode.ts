import { KeyboardPlugin } from "@tokovo/compiler";
import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "whatsapp-story-v2",
    title: "WhatsApp Story V2",
    description:
      "A new WhatsApp story where a surprise dinner plan collapses across the family group and the secret DM at the same time.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 100,
    tags: ["story", "whatsapp", "family", "dm", "comedy"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1230,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-story-v2", { fps: 30, duration: "41s", title: "WhatsApp Story V2" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp"],
        os: {
          time: new Date("2026-04-10T19:20:00"),
          battery: 62,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_riya_story_v2", name: "Riya", avatar: "/avatars/avatar-ava.jpg", unreadCount: 1, isPinned: true },
          { id: "group_family_story_v2", name: "Family Dinner", type: "group", unreadCount: 5, participants: ["me", "Mom", "Dad", "Riya"] },
        ],
      })
      .whatsapp("phone", "group_family_story_v2", (wa) => {
        wa.switchTo("group_family_story_v2", "1.2s");
        wa.at("2.2s").receive("Mom", "Everyone wear normal clothes. Your chachi is bringing someone.");
        wa.at("4.0s").receive("Dad", "And nobody mention surprise cake yet.");
        wa.at("6.0s").send("Why does this sound like a hostage exchange?", { typed: true, charDelay: 2 });
        wa.openChatList("9.0s");
        wa.switchTo("dm_riya_story_v2", "10.4s");
        wa.at("11.2s").receive("Riya", "That 'someone' is for you, genius.");
        wa.at("13.0s").send("Delete this message from the universe.", { typed: true, charDelay: 2 });
        wa.at("15.4s").receive("Riya", "Too late. Mom asked me which shirt makes you look employable.");
        wa.openChatList("19.2s");
        wa.switchTo("group_family_story_v2", "20.4s");
        wa.at("21.2s").receive("Mom", "Who sent cake emoji in the private chat by mistake?");
        wa.at("23.0s").send("Not me. I am a man of silence and mystery.", { typed: true, charDelay: 2 });
        wa.at("26.0s").receive("Riya", "You literally sent it to the group.");
      })
      .camera((cam) => {
        cam.at("1.3s").focus("chat_header", { scale: 1.05, duration: "0.35s" });
        cam.span("2.2s", "6.8s").trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.18 });
        cam.at("10.5s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.span("11.2s", "16.2s").trackCinematic("lastMessage", { scale: 1.1, smoothing: 0.18 });
        cam.at("20.5s").focus("chat_thread", { scale: 1.08, duration: "0.35s" });
      })
      .use(new KeyboardPlugin())
      .build(),
});
