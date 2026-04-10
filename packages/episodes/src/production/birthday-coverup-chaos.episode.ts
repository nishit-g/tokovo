import { KeyboardPlugin } from "@tokovo/compiler";
import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "birthday-coverup-chaos",
    title: "Birthday Cover-Up Chaos 🎂",
    description:
      "A surprise-birthday plan collapses in the group while the DM gets more and more personal.",
    category: "production",
    tags: ["whatsapp", "group-chat", "dm", "comedy", "birthday"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1260,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("birthday-coverup-chaos", {
      fps: 30,
      duration: "42s",
      title: "Birthday Cover-Up Chaos 🎂",
      description:
        "One group is trying to save a surprise while the DM gets more suspicious by the second.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp"],
        os: {
          time: new Date("2025-02-22T19:38:00"),
          battery: 58,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_rhea",
            name: "Rhea",
            avatar: "/avatars/avatar-maya.jpg",
            unreadCount: 1,
            isPinned: true,
          },
          {
            id: "group_ops",
            name: "Operation Rhea",
            type: "group",
            unreadCount: 4,
            participants: ["me", "Sid", "Tara", "Neel"],
            description: "Sid, Tara, Neel",
          },
          {
            id: "dm_mom",
            name: "Mom ❤️",
            unreadCount: 1,
            isLocked: true,
            isPinned: true,
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })
      .whatsapp("phone", "group_ops", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("group_ops", "1.8s");
        wa.at("2.6s").receive("Sid", "Situation kharab hai.");
        wa.at("3.8s").receive("Tara", "Rhea thinks everyone forgot.");
        wa.at("5.0s").receive("Neel", "Cake is leaning but emotionally stable.");
        wa.span("6.2s", "7.8s").typing("me");
        wa.at("7.8s").send("Nobody wishes till I say so.", {
          typed: true,
          charDelay: 2,
        });
        wa.at("9.4s").receive("Tara", "Too late. She posted 'another normal day :)'");
        wa.openChatList("11.2s");
        wa.switchTo("dm_rhea", "12.4s");
        wa.at("13.0s").receive("Rhea", "Nice.");
        wa.at("13.8s").receive("Rhea", "Even you forgot.");
        wa.span("15.2s", "17.4s").typing("me");
        wa.at("17.4s").send("Office me atka hu. Give me 20 mins.", {
          typed: true,
          charDelay: 2,
        });
        wa.at("19.6s").receive("Rhea", "Obviously.");
        wa.at("20.4s").receive("Rhea", "You have been 'at office' for 12 hours.");
        wa.openChatList("22.0s");
        wa.switchTo("group_ops", "23.2s");
        wa.at("24.0s").receiveImage("Neel", "/placeholders/media.svg", {
          caption: "Cake update",
        });
        wa.at("25.4s").receive("Sid", "Bakery wrote happy retirement reha.");
        wa.at("26.8s").receive("Tara", "Florist sent condolence bouquet.");
        wa.span("28.2s", "30.4s").typing("me");
        wa.at("30.4s").send("Hide bouquet. Scrape the cake. Neel touches nothing.", {
          typed: true,
          charDelay: 2,
        });
        wa.openChatList("32.4s");
        wa.switchTo("dm_rhea", "33.6s");
        wa.at("34.4s").receive("Rhea", "I booked dinner for one.");
        wa.span("35.8s", "37.8s").typing("me");
        wa.at("37.8s").send("Drama band kar. Wear something nice.", {
          typed: true,
          charDelay: 2,
        });
        wa.at("39.4s").receive("Rhea", "Why?");
        wa.at("40.4s").send("Because I am still not letting this flop.");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.4s" });
        cam.at("2.7s").focus("chat_header", { scale: 1.08, duration: "0.4s" });
        cam.span("6.2s", "8.2s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
        cam.at("13.1s").focus("lastMessage", { scale: 1.14, duration: "0.35s" });
        cam.span("28.2s", "30.5s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.18 });
        cam.at("37.9s").focus("lastMessage", { scale: 1.1, duration: "0.35s" });
      })
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 2,
        }),
      )
      .build(),
});
