import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "notification-native-stress", title: "Native Notification Stress Check",
    description: "Large text, long history, rich attachments and interrupted gestures at deterministic frames.",
    category: "showcase", catalogType: "system_showcase", visibility: "public", sortOrder: 113,
    tags: ["notifications", "accessibility", "regression"],
  },
  config: { format: "1080x1920", durationInFrames: 600, apps: ["app_whatsapp"] },
  build: () => episode("notification-native-stress", { fps: 30, duration: "20s" })
    .device("phone", "iphone16", { app: "app_whatsapp", locked: true, installedApps: ["app_whatsapp"], notificationUX: "native",
      os: { time: new Date("2026-09-08T18:30:00Z"), battery: 64, textScale: 1.4 },
      notificationTokens: { card: "#f2f3f5", text: "#17181c", secondaryText: "#686b73", accent: "#007aff", border: "#d4d6dc", radius: 22, padding: 14 },
    })
    .notificationTrack("phone", (n) => {
      for (let index = 0; index < 9; index++) n.at(5 + index * 3).deliver({
        id: `history-${index}`, appId: "app_whatsapp", groupId: `group-${index % 6}`,
        content: { title: `Review ${index + 1}`, body: "The revised schedule is ready. Please check the arrival time and the accessibility notes before confirming your place." },
      });
      n.at("1.3s").deliver({ id: "promotion", appId: "app_whatsapp", groupId: "group-0", content: { title: "Review update", body: "A new message brings this existing group to the front." } });
      n.at("2s").openCenter();
      n.at("3s").displayAs("list");
      n.at("4s").scrollHistory(1);
      n.at("6s").scrollHistory(0);
      n.at("7s").closeCenter();
      n.at("7s").displayAs("stack");
      n.at(240).expandGroup("history-6");
      n.at(243).collapseGroup("history-6");
      n.at(246).expandGroup("history-6");
      n.at(270).swipeLeft("history-6");
      n.at(273).swipeRight("history-6");
      n.at(276).swipeLeft("history-6");
      n.at("10s").dismiss("history-6");
      n.at("11s").clearAll();
      n.at("12s").deliver({ id: "attachment", appId: "app_whatsapp", content: {
        title: "Location preview", body: "A longer caption should wrap without pushing the attachment outside the available screen. Review the whole card before returning to the notification list.",
        media: { kind: "image", src: "/media/founder-whiteboard.jpg", aspectRatio: 1.5, alt: "Neon-lit city scene" },
      } });
      n.at("14s").expand("attachment");
      n.at("17s").collapse("attachment");
    }).build(),
});
