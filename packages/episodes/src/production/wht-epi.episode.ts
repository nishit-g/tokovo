import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "wht-epi",
    title: "WhatsApp Navigation Demo 💬",
    description:
      "Realistic WhatsApp usage: checking messages, reacting, switching conversations",
    category: "production",
    tags: ["whatsapp", "navigation", "chat-list", "messaging", "realistic"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 750,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("wht-epi", {
      fps: 30,
      duration: "25s",
      title: "WhatsApp Navigation Demo",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_jess",
            name: "Jess 🌙",
            avatar: "/avatars/avatar-jess.jpg",
          },
          {
            id: "dm_marcus",
            name: "Marcus",
            avatar: "/avatars/avatar-marcus.jpg",
          },
          {
            id: "group_weekend",
            name: "Weekend Plans 🎉",
            avatar: "/avatars/group-weekend.jpg",
            type: "group",
          },
          {
            id: "dm_mom",
            name: "Mom ❤️",
            avatar: "/avatars/avatar-mom.jpg",
          },
        ],
        os: {
          time: new Date("2024-12-18T19:45:00"),
          battery: 82,
          network: "5G",
        },
      })

      .track(
        "app_whatsapp",
        () => {
          return new WhatsAppTrackBuilder(30, "phone", "dm_jess", getOrder);
        },
        (wa) => {
          wa.openChatList("0s");

          wa.switchTo("dm_jess", "2s");

          wa.at("3s").receive("Jess", "Hey! Did you see the sunset today?");

          wa.span("4s", "5s").typing("me");
          wa.at("5s").send("No! Was it good?");

          wa.at("6s").receiveImage(
            "Jess",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            { caption: "ABSOLUTELY STUNNING 🌅" },
          );

          wa.at("8s").react({ index: 2 }, "❤️");

          wa.at("9s").receive("Jess", "We should go to the beach this weekend");

          wa.span("10s", "11s").typing("me");
          wa.at("11s").send("Yes!! Beach Saturday for sure! 🏖️");

          wa.goBack("12.5s");

          wa.switchTo("dm_marcus", "14s");

          wa.at("15s").receive("Marcus", "Quick question about the deadline");
          wa.at("16s").receive(
            "Marcus",
            "Can we push it to Friday instead of Wednesday?",
          );

          wa.span("17s", "18s").typing("me");
          wa.at("18s").send(
            "Yeah Friday works better. I'll update the team 👌",
          );

          wa.span("19s", "20s").typing("Marcus");
          wa.at("20s").receive("Marcus", "Thanks! Really appreciate it");

          wa.at("20.5s").react({ index: 3 }, "👍");

          wa.goBack("21.5s");

          wa.switchTo("group_weekend", "23s");

          wa.at("24s").send("I'm in for Saturday! 🌊");
        },
      )

      .camera((cam) => {
        cam.at("0s").set({ scale: 1 });

        cam.at("2s").animate({ scale: 1.02, duration: "0.3s" });
        cam.at("2.5s").animate({ scale: 1, duration: "0.3s" });

        cam.at("7.5s").animate({ scale: 1.06, duration: "0.3s" });
        cam.at("8.3s").animate({ scale: 1, duration: "0.4s" });

        cam.at("12.5s").animate({ scale: 0.98, duration: "0.3s" });
        cam.at("13s").animate({ scale: 1, duration: "0.3s" });

        cam.at("14s").animate({ scale: 1.02, duration: "0.3s" });
        cam.at("14.5s").animate({ scale: 1, duration: "0.3s" });

        cam.at("20s").animate({ scale: 1.04, duration: "0.2s" });
        cam.at("20.5s").animate({ scale: 1, duration: "0.3s" });

        cam.at("23s").animate({ scale: 1.03, duration: "0.3s" });
        cam.at("23.5s").animate({ scale: 1, duration: "0.3s" });
      })

      .build(),
});
