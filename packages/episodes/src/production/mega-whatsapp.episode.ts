import { defineEpisode } from "../types/episode-definition.js";
import { episode, parseTimeToFrames } from "@tokovo/dsl";
import { WhatsAppTrackBuilder, GroupBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin } from "@tokovo/compiler";

type GroupOp = {
  at: number;
  kind: "Custom";
  deviceId: string;
  appId: string;
  eventType: string;
  payload: unknown;
  _declarationOrder?: number;
};

export default defineEpisode({
  meta: {
    id: "mega-whatsapp",
    title: "Mega WhatsApp Showcase",
    description: "Full WhatsApp flow: chat list, DMs, group ops, media, actions, and reactions",
    category: "production",
    tags: ["whatsapp", "mega", "showcase", "group", "media", "chat-list"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1800,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("mega-whatsapp", {
      fps: 30,
      duration: "60s",
      title: "Mega WhatsApp Showcase",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_alex",
            name: "Alex Rivera",
            avatar: "/avatars/avatar-alex.jpg",
            unreadCount: 2,
          },
          {
            id: "dm_mom",
            name: "Mom ❤️",
            avatar: "/avatars/avatar-mom.jpg",
            unreadCount: 1,
          },
          {
            id: "group_design",
            name: "Design Sprint ⚡",
            avatar: "/avatars/group-design.jpg",
            type: "group",
          },
        ],
        os: {
          time: new Date("2025-01-12T19:45:00"),
          battery: 78,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/neon-city.png" })
      .track(
        "app_whatsapp",
        (getOrder) => {
          const builder = new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder);
          (builder as unknown as { _getOrder?: () => number })._getOrder = getOrder;
          return builder;
        },
        (wa) => {
          const fps = 30;
          const getOrder =
            (wa as unknown as { _getOrder?: () => number })._getOrder ??
            (() => 0);
          let groupFrame = 0;
          const group = new GroupBuilder(
            "group_design",
            () => groupFrame,
            (op: GroupOp) => {
              (wa._events as unknown[]).push({
                ...op,
                _declarationOrder: getOrder(),
              });
            },
            { deviceId: "phone", appId: "app_whatsapp" },
          );
          const atGroup = (time: string | number) => {
            groupFrame = parseTimeToFrames(time, fps);
            return group;
          };

          wa.openChatList("0s");

          atGroup("0s").addMember(
            { id: "ava", name: "Ava", avatar: "/avatars/avatar-ava.jpg" },
            "me",
          );
          atGroup("0s").addMember(
            { id: "ken", name: "Ken", avatar: "/avatars/avatar-ken.jpg" },
            "me",
          );
          atGroup("0s").addMember(
            { id: "ria", name: "Ria", avatar: "/avatars/avatar-ria.jpg" },
            "me",
          );

          wa.switchTo("dm_alex", "1.2s");
          wa.at("2s").receive("Alex", "Are we still on for the demo?");
          wa.span("2.3s", "3.3s").typing("me");
          wa.at("3.4s").send("Yep! Shipping the deck now ✅", {
            typed: true,
            charDelay: 3,
          });

          wa.at("4.6s").receiveImage("Alex", "/placeholders/media.svg", {
            caption: "The new hero shot looks clean.",
          });
          wa.at("5.6s").react({ index: -1 }, "🔥");

          wa.at("6.4s").receiveVoice("Alex", 7);
          wa.at("7.6s").sendVoice(5);

          wa.at("8.6s").receiveDocument("Alex", {
            fileName: "Launch_Plan.pdf",
            fileSize: "2.3 MB",
            fileType: "pdf",
          });

          wa.at("9.8s").receiveContact("Alex", {
            contactName: "Priya Shah",
            contactPhone: "+1 555-0188",
            contactAvatarUrl: "/avatars/avatar-priya.jpg",
          });

          wa.at("11s").receiveLocation("Alex", {
            latitude: 37.7749,
            longitude: -122.4194,
            locationName: "Mission District",
            locationAddress: "San Francisco, CA",
            mapThumbnailUrl: "/placeholders/map.svg",
          });
          wa.at("12s").sendLocation({
            latitude: 40.7128,
            longitude: -74.006,
            locationName: "SoHo",
            locationAddress: "New York, NY",
          });

          wa.at("13.2s").receiveGif("Alex", "/placeholders/media.svg");
          wa.at("14s").sendSticker("/placeholders/media.svg");

          wa.at("15.2s").receiveVideo("Alex", "/placeholders/media.svg", {
            duration: 12,
            caption: "Quick walkthrough",
          });

          wa.at("16.6s").send("Typo mesage incoming…");
          wa.at("17.4s").editMessage(-1, "Typo message fixed ✍️");
          wa.at("18.2s").forward(-1, { forwardedFrom: "Design Team" });
          wa.at("19s").deleteMessage(-2);
          wa.at("19.6s").read();

          wa.goBack("20.8s");

          wa.switchTo("group_design", "22s");
          wa.at("22.6s").send("Team, live demo kicks off in 30 mins.");

          atGroup("23s").addMember(
            { id: "leo", name: "Leo", avatar: "/avatars/avatar-leo.jpg" },
            "me",
          );
          atGroup("23.8s").makeAdmin("ava", "me");
          atGroup("24.6s").updateInfo("name", "Design Sprint ⚡ Launch", "ken");

          wa.span("25s", "26.2s").typing("Ava");
          wa.at("26.4s").receive("Ava", "On it. I’ll run the screen share.");
          wa.at("27.2s").receive("Ken", "Posting the checklist now.");
          wa.at("28s").send("Pinned the notes. See you all soon.");
          wa.at("28.8s").react({ index: -1 }, "✅");

          wa.goBack("30.2s");

          wa.switchTo("dm_mom", "31.5s");
          wa.at("32.2s").receive("Mom", "Dinner at 8? 🍜");
          wa.span("32.6s", "33.4s").typing("me");
          wa.at("33.6s").send("Yes! I’ll be home on time.");
          wa.at("34.4s").read();

          wa.goBack("35.6s");
          wa.openChatList("36.4s");
        },
      )
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )
      .build(),
});
