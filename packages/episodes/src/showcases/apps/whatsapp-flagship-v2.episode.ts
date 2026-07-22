import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";
import { whatsappFlagshipCinematics } from "./whatsapp-flagship-vnext-camera.js";

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
          time: new Date("2026-04-10T20:15:00Z"),
          battery: 84,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/soft-gradient.png" })
      .cinematics(whatsappFlagshipCinematics)
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_studio_ops",
            name: "Studio Ops",
            avatar: "/avatars/avatar-ava.jpg",
            unreadCount: 2,
            isPinned: true,
            contact: {
              phone: "+91 90000 10101",
              about: "Production calm, launch-night speed.",
              lastSeenLabel: "last seen today at 8:12 PM",
            },
            trust: { endToEndEncrypted: true },
            messages: [
              {
                id: "seed_ops_1",
                type: "text",
                from: "Studio Ops",
                text: "Client approved the quiet cut. We ship in twenty.",
                timestamp: new Date("2026-04-10T20:05:00Z").getTime(),
              },
            ],
            lastMessageAt: new Date("2026-04-10T20:05:00Z").getTime(),
          },
          {
            id: "group_launch_bridge",
            name: "Launch Bridge",
            type: "group",
            avatar: "/avatars/group-design.jpg",
            unreadCount: 5,
            isPinned: true,
            members: [
              { id: "me", name: "You" },
              { id: "ava", name: "Ava", avatar: "/avatars/avatar-ava.jpg" },
              { id: "noor", name: "Noor" },
              { id: "rhea", name: "Rhea" },
            ],
            admins: ["me", "ava"],
            description: "Launch decisions, final assets, zero panic.",
            trust: { endToEndEncrypted: true },
            preferences: { disappearingMessages: "7 days" },
            messages: [
              {
                id: "seed_group_1",
                type: "text",
                from: "Ava",
                text: "If anyone posts the wrong teaser, I'm deleting Slack.",
                timestamp: new Date("2026-04-10T20:07:00Z").getTime(),
              },
            ],
            lastMessageAt: new Date("2026-04-10T20:07:00Z").getTime(),
          },
          {
            id: "dm_vendor",
            name: "Parcel Partner",
            avatar: "/avatars/avatar-marcus.jpg",
            unreadCount: 1,
            contact: {
              phone: "+91 90000 22002",
              businessCategory: "Delivery service",
              verifiedBusiness: true,
            },
            trust: {
              endToEndEncrypted: true,
              businessNotice:
                "This business uses a secure service to manage customer conversations.",
            },
            messages: [
              {
                id: "seed_vendor_1",
                type: "text",
                from: "Parcel Partner",
                text: "Your launch merch pickup window is live.",
                timestamp: new Date("2026-04-10T19:58:00Z").getTime(),
              },
            ],
            lastMessageAt: new Date("2026-04-10T19:58:00Z").getTime(),
          },
          {
            id: "dm_mom_v2",
            name: "Mom",
            avatar: "/avatars/avatar-mom.jpg",
            contact: {
              phone: "+91 90000 30303",
              about: "Available after chai.",
            },
            messages: [
              {
                id: "seed_mom_1",
                type: "text",
                from: "Mom",
                text: "Phone charge karo before your dramatic launch.",
                timestamp: new Date("2026-04-10T19:45:00Z").getTime(),
              },
            ],
            lastMessageAt: new Date("2026-04-10T19:45:00Z").getTime(),
          },
        ],
        statuses: [
          {
            id: "status_mom_1",
            authorId: "dm_mom_v2",
            authorName: "Mom",
            avatar: "/avatars/avatar-mom.jpg",
            postedAt: new Date("2026-04-10T18:42:00Z").getTime(),
            viewed: false,
            media: {
              type: "text",
              text: "Charge your phone before launch night.",
              backgroundColor: "#496C5D",
            },
          },
          {
            id: "status_mom_2",
            authorId: "dm_mom_v2",
            authorName: "Mom",
            avatar: "/avatars/avatar-mom.jpg",
            postedAt: new Date("2026-04-10T18:44:00Z").getTime(),
            viewed: true,
            media: { type: "image", src: "/backgrounds/soft-gradient.png" },
          },
          {
            id: "status_ops_1",
            authorId: "dm_studio_ops",
            authorName: "Studio Ops",
            avatar: "/avatars/avatar-ava.jpg",
            postedAt: new Date("2026-04-10T19:52:00Z").getTime(),
            viewed: false,
            media: { type: "image", src: "/backgrounds/soft-gradient.png" },
          },
        ],
        channels: [
          {
            id: "channel_motion_daily",
            name: "Motion Daily",
            avatar: "/avatars/netrunner.jpg",
            description: "Frame studies, animation notes, and calm camera decisions.",
            followersLabel: "142K followers",
            category: "Design",
            verified: true,
            followed: true,
            unreadCount: 3,
            latestUpdate: {
              id: "motion_update_1",
              text: "New study: text-safe focus passes for portrait reels",
              postedAt: new Date("2026-04-10T20:08:00Z").getTime(),
            },
          },
          {
            id: "channel_launch_notes",
            name: "Launch Notes",
            description: "Sharp product launches without the theatre.",
            followersLabel: "28K followers",
            followed: false,
            unreadCount: 0,
            latestUpdate: {
              id: "launch_update_1",
              text: "A calmer checklist for the last thirty minutes",
              postedAt: new Date("2026-04-10T19:40:00Z").getTime(),
            },
          },
        ],
        callLog: [
          {
            id: "call_ava_1",
            conversationId: "group_launch_bridge",
            name: "Ava",
            avatar: "/avatars/avatar-ava.jpg",
            direction: "outgoing",
            mode: "video",
            startedAt: new Date("2026-04-10T19:32:00Z").getTime(),
            durationSeconds: 492,
          },
          {
            id: "call_vendor_1",
            conversationId: "dm_vendor",
            name: "Parcel Partner",
            direction: "missed",
            mode: "voice",
            startedAt: new Date("2026-04-10T18:58:00Z").getTime(),
          },
          {
            id: "call_mom_1",
            conversationId: "dm_mom_v2",
            name: "Mom",
            avatar: "/avatars/avatar-mom.jpg",
            direction: "incoming",
            mode: "voice",
            startedAt: new Date("2026-04-09T21:10:00Z").getTime(),
            durationSeconds: 183,
          },
        ],
        communities: [
          {
            id: "community_launch",
            name: "Creator Launch",
            avatar: "/avatars/group-design.jpg",
            description: "The groups shipping tonight's release",
            announcementConversationId: "group_launch_bridge",
            groupConversationIds: ["group_launch_bridge"],
            memberCount: 18,
            unreadCount: 5,
          },
        ],
        profile: {
          name: "Creator",
          phone: "+91 90000 00000",
          about: "Building phone-native stories.",
        },
        settings: {
          linkedDevicesCount: 3,
          privacy: { lastSeen: "contacts", profilePhoto: "contacts", readReceipts: true },
          chats: {
            theme: "system",
            backupLabel: "Today, 7:40 PM",
            defaultDisappearingMessages: "Off",
          },
          notifications: { messageTone: "Note", groupTone: "Aurora", mutedChats: 2 },
          storage: { usedLabel: "3.8 GB used", autoDownloadLabel: "Wi-Fi only" },
        },
      })
      .whatsapp("phone", "group_launch_bridge", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("group_launch_bridge", "2.0s");
        wa.at("3.0s").receive("Noor", "Teaser is in export. Sound mix still rendering.");
        wa.at("4.8s").send("Ship picture first. Audio can trail by a minute.", {
          input: { duration: "2.6s", style: "fast" },
        });
        wa.at("7.8s").receive("Rhea", "Need client-facing caption signoff too.");
        wa.openUpdates("10.5s");
        wa.openCalls("14.0s");
        wa.openChatList("17.0s");
        wa.switchTo("dm_vendor", "18.8s");
        wa.at("20.0s").receive("Parcel Partner", "Driver is downstairs with 12 launch kits.");
        wa.at("22.0s").send("Lobby desk has clearance. Send them up.", {
          input: { duration: "3s", style: "natural" },
        });
        wa.openChatList("25.8s");
        wa.switchTo("dm_studio_ops", "27.5s");
        wa.at("28.8s").receive("Studio Ops", "Post is live. Watching comments.");
        wa.at("30.6s").send("Good. Keep one eye on X and one on invoices.", {
          input: { duration: "3s", style: "fast" },
        });
        wa.openUpdates("34.8s");
        wa.openCalls("37.0s");
      })
      .build(),
});
