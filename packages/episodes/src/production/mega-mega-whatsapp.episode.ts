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
    id: "mega-mega-whatsapp",
    title: "Mega Mega WhatsApp Tour",
    description:
      "Full WhatsApp tour: status, calls, communities, group + DM, reactions, replies, edits, media, and more",
    category: "production",
    tags: ["whatsapp", "mega", "tour", "status", "calls", "communities", "group"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 3600,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("mega-mega-whatsapp", {
      fps: 30,
      duration: "120s",
      title: "Mega Mega WhatsApp Tour",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_alex",
            name: "Alex Rivera",
            avatar: "/avatars/avatar-alex.jpg",
            unreadCount: 2,
            hasStatus: true,
            initialMessages: [
              {
                from: "system",
                type: "system",
                systemType: "encryption_notice",
                text:
                  "Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them.",
              },
              {
                from: "system",
                type: "system",
                systemType: "date_change",
                text: "Yesterday",
              },
              { from: "Alex", text: "Morning! deck is ready?", timestamp: -86400 },
              { from: "Me", text: "Sending in a bit ✅", timestamp: -86000 },
              {
                from: "system",
                type: "system",
                systemType: "date_change",
                text: "Today",
              },
              {
                from: "Me",
                type: "call",
                callType: "voice",
                duration: 32,
                timestamp: -3600,
              },
              {
                from: "Alex",
                type: "call_missed",
                callType: "voice",
                timestamp: -3500,
              },
            ],
          },
          {
            id: "dm_mom",
            name: "Mom ❤️",
            avatar: "/avatars/avatar-mom.jpg",
            unreadCount: 1,
            hasStatus: true,
            initialMessages: [
              { from: "Mom", text: "Dinner at 8?", timestamp: -3600 },
            ],
          },
          {
            id: "group_design",
            name: "Design Sprint ⚡",
            avatar: "/avatars/group-design.jpg",
            type: "group",
            hasStatus: true,
            initialMessages: [
              { from: "Ava", text: "Agenda is in the doc", timestamp: -8400 },
              { from: "Ken", text: "We go live at 7pm", timestamp: -8300 },
            ],
          },
          {
            id: "group_weekend",
            name: "Weekend Crew",
            avatar: "/avatars/group-weekend.jpg",
            type: "group",
            initialMessages: [
              { from: "Jess", text: "Brunch plan?", timestamp: -5400 },
            ],
          },
        ],
        os: {
          time: new Date("2025-02-01T18:45:00"),
          battery: 82,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/cafe-lofi.png" })
      .track(
        "app_whatsapp",
        (getOrder) => {
          const builder = new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder);
          Object.defineProperty(builder, "_getOrder", {
            value: getOrder,
            configurable: true,
          });
          return builder;
        },
        (wa) => {
          const fps = 30;
          const maybeOrder = Reflect.get(wa, "_getOrder");
          const getOrder =
            typeof maybeOrder === "function" ? (maybeOrder as () => number) : (() => 0);
          let groupFrame = 0;
          const group = new GroupBuilder(
            "group_design",
            () => groupFrame,
            (op: GroupOp) => {
              const rawEvents = Reflect.get(wa, "_events") as unknown;
              if (Array.isArray(rawEvents)) {
                (rawEvents as unknown[]).push({
                ...op,
                _declarationOrder: getOrder(),
                });
              }
            },
            { deviceId: "phone", appId: "app_whatsapp" },
          );
          const atGroup = (time: string | number) => {
            groupFrame = parseTimeToFrames(time, fps);
            return group;
          };

          // Tour the top-level screens
          wa.openStatus("0s");
          wa.openCommunities("4s");
          wa.openCalls("8s");
          wa.openChatList("12s");

          // DM: Alex
          wa.switchTo("dm_alex", "14s");
          wa.at("14.6s").receive("Alex", "Quick check: did we sync the hero?");
          wa.span("15s", "16s").typing("me");
          wa.at("16.2s").send("Yep. Updated hero + CTA.", { typed: true, charDelay: 2 });
          wa.at("17.2s").receiveImage("Alex", "/placeholders/media.svg", {
            caption: "New hero comp",
          });
          wa.at("18s").react({ index: -1 }, "🔥");
          wa.at("18.6s").receiveDocument("Alex", {
            fileName: "Sprint_Deck.pdf",
            fileSize: "3.1 MB",
            fileType: "pdf",
          });
          wa.at("19.4s").send("Looks great. Shipping now.");
          wa.at("20.2s").editMessage(-1, "Looks great. Shipping now ✅");
          wa.at("21s").read();

          // Jump to profile screen for Alex
          wa.openProfile("22.2s");
          wa.openChatList("26s");

          // Group: Design Sprint
          wa.switchTo("group_design", "28s");
          wa.at("28.6s").send("Team, we go live in 30 mins.");
          wa.at("29.4s").receive("Ava", "Screen share ready.");
          wa.at("30s").receive("Ken", "Checklist posted.");
          wa.at("30.6s");
          wa.reply("Awesome. Pinning now.", 1.5);
          wa.at("31.8s").react({ index: -1 }, "✅");
          wa.at("32.6s").receiveVoice("Ava", 6);
          wa.at("33.6s").sendVoice(4);
          wa.at("34.6s").receiveGif("Ken", "/placeholders/media.svg");
          wa.at("35.2s").sendSticker("/placeholders/media.svg");
          wa.at("36s").receiveLocation("Ava", {
            latitude: 37.7749,
            longitude: -122.4194,
            locationName: "Mission District",
            locationAddress: "San Francisco, CA",
            mapThumbnailUrl: "/placeholders/map.svg",
          });
          wa.at("36.8s").sendLocation({
            latitude: 40.7128,
            longitude: -74.006,
            locationName: "SoHo",
            locationAddress: "New York, NY",
          });

          wa.at("37.6s");
          wa.dateSeparator("Friday");
          wa.at("38.2s").receive("Ria", "Can we add the metrics slide?");
          wa.at("39s").send("Adding now.");
          wa.at("39.6s").forward(-1, { forwardedFrom: "Analytics" });

          atGroup("40.2s").addMember(
            { id: "leo", name: "Leo", avatar: "/avatars/avatar-leo.jpg" },
            "me",
          );
          atGroup("41s").makeAdmin("ava", "me");
          atGroup("41.8s").updateInfo("name", "Design Sprint ⚡ Launch", "Ken");

          wa.goBack("44s");

          // DM: Mom
          wa.switchTo("dm_mom", "46s");
          wa.at("46.6s").receive("Mom", "Dinner at 8? 🍜");
          wa.span("47s", "48s").typing("me");
          wa.at("48.2s").send("Yes! On my way.");
          wa.at("49s");
          wa.dateSeparator("Today");
          wa.at("49.6s").receive("Mom", "Call me when you leave.");
          wa.at("50.4s").read();

          wa.goBack("52s");

          // Weekend Crew group
          wa.switchTo("group_weekend", "54s");
          wa.at("54.6s").receive("Jess", "Brunch at 11?");
          wa.at("55.4s").send("Works for me.");
          wa.at("56.2s").receiveVideo("Jess", "/placeholders/media.svg", {
            duration: 8,
            caption: "Venue vibe",
          });
          wa.at("57.4s").react({ index: -1 }, "😍");
          wa.at("58.4s").send("Let’s do it.");
          wa.at("59s").read();

          wa.goBack("60.4s");
          wa.openChatList("62s");

          // Calls screen again
          wa.openCalls("66s");
          wa.openStatus("72s");
          wa.openCommunities("78s");
          wa.openChatList("84s");
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
