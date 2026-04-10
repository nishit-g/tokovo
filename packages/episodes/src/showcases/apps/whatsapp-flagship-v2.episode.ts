import { KeyboardPlugin } from "@tokovo/compiler";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "whatsapp-flagship-v2",
    title: "WhatsApp Flagship V2",
    description:
      "Fresh WhatsApp flagship covering chats, updates, calls, business support, and a launch-night group thread.",
    category: "showcase",
    catalogType: "app_showcase_flagship",
    appId: "app_whatsapp",
    visibility: "public",
    sortOrder: 100,
    tags: ["whatsapp", "flagship", "business", "group", "updates", "calls"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1320,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-flagship-v2", {
      fps: 30,
      duration: "44s",
      title: "WhatsApp Flagship V2",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp"],
        os: {
          time: new Date("2026-04-10T20:15:00"),
          battery: 84,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/soft-gradient.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_studio_ops",
            name: "Studio Ops",
            avatar: "/avatars/avatar-ava.jpg",
            unreadCount: 2,
            isPinned: true,
            messages: [
              {
                id: "seed_ops_1",
                from: "Studio Ops",
                text: "Client approved the quiet cut. We ship in twenty.",
                at: new Date("2026-04-10T20:05:00").getTime(),
              },
            ],
            lastMessageAt: new Date("2026-04-10T20:05:00").getTime(),
          },
          {
            id: "group_launch_bridge",
            name: "Launch Bridge",
            type: "group",
            avatar: "/placeholders/app-icon.svg",
            unreadCount: 5,
            isPinned: true,
            participants: ["me", "Ava", "Noor", "Rhea"],
            messages: [
              {
                id: "seed_group_1",
                from: "Ava",
                text: "If anyone posts the wrong teaser, I'm deleting Slack.",
                at: new Date("2026-04-10T20:07:00").getTime(),
              },
            ],
            lastMessageAt: new Date("2026-04-10T20:07:00").getTime(),
          },
          {
            id: "dm_vendor",
            name: "Parcel Partner",
            avatar: "/placeholders/app-icon.svg",
            unreadCount: 1,
            isVerifiedBusiness: true,
            businessLabel: "Business account",
            messages: [
              {
                id: "seed_vendor_1",
                from: "Parcel Partner",
                text: "Your launch merch pickup window is live.",
                at: new Date("2026-04-10T19:58:00").getTime(),
              },
            ],
            lastMessageAt: new Date("2026-04-10T19:58:00").getTime(),
          },
          {
            id: "dm_mom_v2",
            name: "Mom",
            avatar: "/avatars/avatar-mom.jpg",
            hasStatus: true,
            messages: [
              {
                id: "seed_mom_1",
                from: "Mom",
                text: "Phone charge karo before your dramatic launch.",
                at: new Date("2026-04-10T19:45:00").getTime(),
              },
            ],
            lastMessageAt: new Date("2026-04-10T19:45:00").getTime(),
          },
          {
            id: "channel_motion_daily",
            name: "Motion Daily",
            avatar: "/placeholders/app-icon.svg",
            isChannel: true,
            isFollowed: true,
            channelDescription: "Frame studies, animation notes, and good camera decisions.",
            channelLatestSnippet: "New thread: text-safe focus passes for portrait reels",
            channelFollowersLabel: "142K followers",
            channelCategory: "Design",
            channelUnreadCount: 3,
          },
        ],
      })
      .whatsapp("phone", "group_launch_bridge", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("group_launch_bridge", "2.0s");
        wa.at("3.0s").receive("Noor", "Teaser is in export. Sound mix still rendering.");
        wa.at("4.8s").send("Ship picture first. Audio can trail by a minute.", {
          typed: true,
          charDelay: 2,
        });
        wa.at("7.8s").receive("Rhea", "Need client-facing caption signoff too.");
        wa.openUpdates("10.5s");
        wa.openCalls("14.0s");
        wa.openChatList("17.0s");
        wa.switchTo("dm_vendor", "18.8s");
        wa.at("20.0s").receive("Parcel Partner", "Driver is downstairs with 12 launch kits.");
        wa.at("22.0s").send("Lobby desk has clearance. Send them up.", {
          typed: true,
          charDelay: 2,
        });
        wa.openChatList("25.8s");
        wa.switchTo("dm_studio_ops", "27.5s");
        wa.at("28.8s").receive("Studio Ops", "Post is live. Watching comments.");
        wa.at("30.6s").send("Good. Keep one eye on X and one on invoices.", {
          typed: true,
          charDelay: 2,
        });
        wa.openUpdates("34.8s");
        wa.openCalls("37.0s");
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("2.1s").focus("chat_header", { scale: 1.05, duration: "0.35s" });
        cam.span("3.0s", "8.5s").trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.16 });
        cam.at("10.6s").focus("status_row", { scale: 1.08, duration: "0.35s" });
        cam.at("14.1s").focus("calls_list", { scale: 1.08, duration: "0.35s" });
        cam.at("20.1s").focus("lastMessage", { scale: 1.1, duration: "0.35s" });
        cam.at("28.9s").focus("lastMessage", { scale: 1.1, duration: "0.35s" });
      })
      .use(new KeyboardPlugin())
      .build(),
});
