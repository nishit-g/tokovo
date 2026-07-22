import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "cinematic-subject-exhaustive",
    title: "Cinematic Subject Exhaustive",
    description:
      "Fresh camera pass proving deterministic subject tracking across list, detail, thread, composer, and notification surfaces.",
    category: "showcase",
    catalogType: "system_showcase",
    visibility: "public",
    sortOrder: 120,
    tags: ["system", "camera", "subjects", "focus", "deterministic"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 960,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("cinematic-subject-exhaustive", {
      fps: 30,
      duration: "32s",
      title: "Cinematic Subject Exhaustive",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2026-04-10T18:20:00Z"),
          battery: 69,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_mina",
            name: "Mina",
            avatar: "/avatars/avatar-maya.jpg",
            unreadCount: 1,
            isPinned: true,
          },
          {
            id: "group_frames",
            name: "Frame Notes",
            type: "group",
            unreadCount: 6,
            members: [
              { id: "me", name: "You" },
              { id: "mina", name: "Mina" },
              { id: "aki", name: "Aki" },
            ],
          },
        ],
      })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "subjectworks",
            followers: 8900,
            following: 280,
            verified: "blue",
          },
          {
            id: "u_cam",
            name: "Cam Nerd",
            handle: "camnerd",
            followers: 34400,
            following: 512,
            verified: null,
          },
        ],
        tweets: [
          {
            id: "tw_subject_1",
            authorId: "u_cam",
            text: "If your app has no subjects your camera is just guessing.",
            createdAt: new Date("2026-04-10T18:10:00Z").getTime(),
            viewCount: 14200,
            shareCount: 220,
            bookmarkCount: 1100,
          },
        ],
      })
      .deviceTrack("phone", (d) => {
        d.at("17.0s").openApp("app_x", {
          transition: { durationFrames: 18, style: "platform-default" },
        });
      })
      .notificationTrack("phone", (notifications) => {
        notifications.at("12.0s").deliver({
          id: "subject_notif",
          appId: "app_whatsapp",
          content: {
            title: "Frame Notes",
            body: "New thread mention from Aki.",
          },
          category: "message",
          interruption: "timeSensitive",
          privacy: "private",
          threadId: "frame-notes",
        });
      })
      .whatsapp("phone", "dm_mina", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("dm_mina", "1.2s");
        wa.at("2.2s").receive("Mina", "Test the list subject first.");
        wa.at("3.6s").send("Now watch it stick to the bubble.", {});
        wa.openChatList("6.0s");
        wa.switchTo("group_frames", "7.2s");
        wa.at("8.4s").receive("Aki", "Thread card should be the next focus target.");
        wa.at("10.0s").send("Then the notification banner.", {});
      })
      .x("phone", (x) => {
        x.at("17.8s").navigate("timeline");
        x.at("19.2s").navigate("tweet", { tweetId: "tw_subject_1" });
        x.at("21.0s").replyTweet({
          id: "tw_subject_reply",
          authorId: "u_me",
          replyToId: "tw_subject_1",
          text: "Good subjects make cameras feel intentional instead of frantic.",
          createdAt: new Date("2026-04-10T18:23:00Z").getTime(),
        });
        x.at("24.2s").navigate("compose");
        x.at("25.0s").setComposeDraft("Subject choreography is part of product quality.");
      })
      .build(),
});
