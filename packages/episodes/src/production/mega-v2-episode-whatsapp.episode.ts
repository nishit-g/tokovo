import { KeyboardPlugin } from "@tokovo/compiler";
import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "mega-v2-episode-whatsapp",
    title: "Mega V2 WhatsApp: Rishta Damage Control",
    description:
      "A guy tries to look classy before meeting Naina's parents while every WhatsApp chat around him collapses in public.",
    category: "production",
    tags: ["whatsapp", "mega", "showcase", "comedy", "group-chat", "camera"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1620,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("mega-v2-episode-whatsapp", {
      fps: 30,
      duration: "54s",
      title: "Mega V2 WhatsApp: Rishta Damage Control",
      description:
        "Full WhatsApp chaos before the first parent meet goes spectacularly off-script.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp"],
        os: {
          time: new Date("2025-03-07T18:42:00"),
          battery: 64,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_naina",
            name: "Naina ✨",
            unreadCount: 2,
            isPinned: true,
            hasStatus: true,
          },
          {
            id: "group_rishta_ops",
            name: "Rishta Damage Control",
            type: "group",
            unreadCount: 14,
            participants: ["me", "Sid", "Tara", "Monty", "Aashi"],
            description: "Sid, Tara, Monty, Aashi",
          },
          {
            id: "dm_bakery",
            name: "Bakery Boss",
            unreadCount: 1,
            businessLabel: "Business account",
            isVerifiedBusiness: true,
          },
          {
            id: "dm_mom",
            name: "Mom ❤️",
            unreadCount: 1,
            isLocked: true,
            isPinned: true,
            hasStatus: true,
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })
      .whatsapp("phone", "group_rishta_ops", (wa) => {
        wa.openStatus("0s");
        wa.openCalls("1.0s");
        wa.openCommunities("2.0s");
        wa.openSettings("3.0s");
        wa.openChatList("4.0s");
        wa.switchTo("group_rishta_ops", "5.2s");
        wa.at("6.0s").receive("Sid", "Catastrophe. Bakery wrote congratulations Neha aunty.");
        wa.at("7.2s").receive("Tara", "And Monty booked family table under Damage Control Squad.");
        wa.at("8.4s").receive("Monty", "Rich people should know confidence.");
        wa.span("9.8s", "11.8s").typing("me");
        wa.at("11.8s").send(
          "Nobody says bro, scene, ya jugaad in front of uncle.",
          { typed: true, charDelay: 2 },
        );
        wa.at("13.0s").receive("Aashi", "Monty already told uncle 'scene set hai'.");
        wa.at("14.4s").receiveImage("Sid", "/placeholders/media.svg", {
          caption: "Meet the cake",
        });
        wa.span("15.6s", "17.2s").typing("me");
        wa.at("17.2s").send("Why does it say Happy 25th Tax Audit?", {
          typed: true,
          charDelay: 2,
        });
        wa.openChatList("18.8s");
        wa.switchTo("dm_naina", "20.0s");
        wa.at("20.8s").receive(
          "Naina",
          "You left me on delivered and mom is iron-proofing your shirt.",
        );
        wa.at("22.0s").receive("Naina", "Good. Papa hates chaos.");
        wa.span("23.4s", "25.0s").typing("me");
        wa.at("25.0s").send("I am calm. Mature. Absolutely under control.", {
          typed: true,
          charDelay: 2,
        });
        wa.read();
        wa.openChatList("26.8s");
        wa.switchTo("dm_bakery", "28.0s");
        wa.at("28.8s").receive(
          "Bakery Boss",
          "Your topper 'Naina ji ke papa please trust me' is ready.",
        );
        wa.at("30.0s").receiveDocument("Bakery Boss", {
          fileName: "Trust_Me_Topper_Final_FINAL.pdf",
          fileSize: "640 KB",
          fileType: "pdf",
        });
        wa.span("31.4s", "33.2s").typing("me");
        wa.at("33.2s").send("Cancel topper. Write simple congratulations.", {
          typed: true,
          charDelay: 2,
        });
        wa.openChatList("34.8s");
        wa.switchTo("dm_mom", "36.0s");
        wa.at("36.8s").receive("Mom ❤️", "Perfume laga ke jaana. Phenyl nahi.");
        wa.at("38.0s").receive("Mom ❤️", "And sit straight. Don't over-smile.");
        wa.span("39.6s", "41.2s").typing("me");
        wa.at("41.2s").send("Maa I am a calm sophisticated man.", {
          typed: true,
          charDelay: 2,
        });
        wa.openChatList("42.8s");
        wa.switchTo("group_rishta_ops", "44.0s");
        wa.at("44.8s").receive("Tara", "Update: uncle asked why cake says tax audit.");
        wa.at("46.0s").receive("Sid", "Need backup plan now.");
        wa.span("47.2s", "49.4s").typing("me");
        wa.at("49.4s").send(
          "New plan. No cake text. No Monty speeches. Everybody smile and lie professionally.",
          { typed: true, charDelay: 2 },
        );
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("6.1s").focus("lastMessage", { scale: 1.1, duration: "0.35s" });
        cam.span("9.8s", "11.9s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
        cam.at("20.9s").focus("chat_header", { scale: 1.08, duration: "0.35s" });
        cam.at("28.9s").focus("document_card", { scale: 1.08, duration: "0.35s" });
        cam.at("44.9s").focus("lastMessage", { scale: 1.08, duration: "0.35s" });
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
