import { KeyboardPlugin } from "@tokovo/compiler";
import { defineEpisode } from "@tokovo/episodes";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "launch-leak-nightmare",
    title: "Launch Leak Nightmare",
    description:
      "Cinematic crossover: WhatsApp updates, investor panic, then X timeline, notifications, DMs, and apology cleanup.",
    category: "production",
    tags: ["whatsapp", "x", "cinematic", "crossover"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1110,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () => {
    const baseTs = new Date("2025-03-21T22:16:00").getTime();

    return episode("launch-leak-nightmare", {
      fps: 30,
      duration: "37s",
      title: "Launch Leak Nightmare",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp", "app_x"],
        os: {
          time: new Date("2025-03-21T22:18:00"),
          battery: 61,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "group_launch_war_room",
            name: "Launch War Room",
            type: "group",
            participants: ["me", "Founder", "Meme"],
            unreadCount: 7,
            isPinned: true,
          },
          {
            id: "dm_investor",
            name: "Neha Investor",
            unreadCount: 2,
            isLocked: true,
          },
          {
            id: "dm_pressdesk",
            name: "PressDesk PR",
            unreadCount: 1,
            businessLabel: "Business Account",
            isVerifiedBusiness: true,
          },
        ],
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "opsnightshift",
            bio: "Operator cleaning up founder decisions in public.",
            followers: 22600,
            following: 502,
            verified: "blue",
          },
          {
            id: "u_founder",
            name: "Founder",
            handle: "shipfirstbro",
            bio: "Transparency when it helps, chaos when it doesn't.",
            followers: 84200,
            following: 121,
            verified: "gold",
          },
          {
            id: "u_investor",
            name: "Investor",
            handle: "termsheetneha",
            bio: "Early stage capital with late-stage patience issues.",
            followers: 52100,
            following: 290,
            verified: "gold",
          },
          {
            id: "u_meme",
            name: "Meme",
            handle: "startuptea",
            bio: "Archiving startup disasters at 4K resolution.",
            followers: 118000,
            following: 733,
            verified: null,
          },
        ],
        follows: [
          { followerId: "u_me", followingId: "u_founder" },
          { followerId: "u_me", followingId: "u_investor" },
          { followerId: "u_me", followingId: "u_meme" },
        ],
        tweets: [
          {
            id: "tw_leak",
            authorId: "u_founder",
            text: "Dropping our investor memo because transparency > NDAs. thoughts?",
            createdAt: baseTs - 60_000,
            viewCount: 146200,
            shareCount: 1904,
            bookmarkCount: 3500,
            media: {
              type: "image",
              aspect: "wide",
              urls: ["/placeholders/media.svg"],
            },
          },
          {
            id: "tw_receipts",
            authorId: "u_meme",
            text: "Founder leaked the deck and still wrote thoughts? like bro the thought already escaped.",
            createdAt: baseTs - 25_000,
            viewCount: 88200,
            shareCount: 1204,
            bookmarkCount: 2600,
          },
        ],
        notifications: [
          {
            id: "nt_seed_1",
            type: "mention",
            actorId: "u_meme",
            tweetId: "tw_leak",
            isMention: true,
            createdAt: baseTs - 5_000,
          },
        ],
      })
      .view("app_x", "phone", { screen: "timeline" })
      .whatsapp("phone", "group_launch_war_room", (wa) => {
        wa.openChatList("0s");
        wa.switchTo("group_launch_war_room", "1.2s");
        wa.at("2.0s").receive("Founder", "Who posted the investor memo publicly?");
        wa.at("3.0s").receiveDocument("Founder", {
          fileName: "Investor_Update_v14.pdf",
          fileSize: "2.1 MB",
          fileType: "pdf",
        });
        wa.at("4.2s").receive(
          "Meme",
          "Already viral. Top reply says 'series A in vibes' is my fav slide.",
        );
        wa.at("5.6s").send("Moving to X. Nobody touch main.", {
          typed: true,
          charDelay: 2,
        });
        wa.at("6.8s").receiveSticker("Meme", "/placeholders/media.svg");
        wa.openChatList("8.0s");
        wa.switchTo("dm_investor", "8.8s");
        wa.at("9.4s").receive("Neha Investor", "I just saw my thesis in four meme accounts.");
        wa.at("10.4s").receiveLocation("Neha Investor", {
          latitude: 19.0596,
          longitude: 72.8295,
          locationName: "Blue Tokai - Corner Table",
          locationAddress: "Bandra West",
          mapThumbnailUrl: "/placeholders/media.svg",
        });
        wa.at("11.8s").send("12 min. Then coffee. Then audit.", {
          typed: true,
          charDelay: 2,
        });
      })
      .x("phone", (x) => {
        x.at("13.6s").navigate("tweet", { tweetId: "tw_leak" });
        x.at("15.0s").navigate("compose");
        x.at("15.5s").postTweet({
          id: "tw_fatal_quote",
          authorId: "u_me",
          text: "Transparency is great. Accidentally posting the investor memo is not a growth hack.",
          quoteTweetId: "tw_leak",
          typed: true,
          charDelay: 2,
          createdAt: baseTs + 40_000,
        });
        x.at("17.2s").navigate("tweet", { tweetId: "tw_fatal_quote" });
        x.at("18.0s").addNotification({
          id: "nt_burst_1",
          type: "repost",
          actorId: "u_meme",
          tweetId: "tw_fatal_quote",
        });
        x.at("18.3s").addNotification({
          id: "nt_burst_2",
          type: "mention",
          actorId: "u_investor",
          tweetId: "tw_fatal_quote",
          isMention: true,
        });
        x.at("19.2s").navigate("messages");
        x.at("20.0s").createThread(["u_me", "u_founder", "u_investor"], "dm_cleanup");
        x.at("20.4s").sendMessage({
          id: "msg_cleanup_1",
          threadId: "dm_cleanup",
          senderId: "u_founder",
          text: "Tweet deleted.",
          createdAt: baseTs + 70_000,
        });
        x.at("21.2s").sendMessage({
          id: "msg_cleanup_2",
          threadId: "dm_cleanup",
          senderId: "u_investor",
          text: "Screenshots are eternal. Bring coffee and an explanation.",
          createdAt: baseTs + 80_000,
        });
        x.at("22.8s").navigate("thread", { threadId: "dm_cleanup" });
        x.at("24.0s").sendMessage({
          id: "msg_cleanup_3",
          threadId: "dm_cleanup",
          senderId: "u_me",
          text: "On my way with samosa and a lawyer.",
          createdAt: baseTs + 95_000,
          typed: true,
          charDelay: 2,
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("2.05s").focus("lastMessage", { scale: 1.1, duration: "0.35s" });
        cam.at("13.7s").focus("tweet_card", { scale: 1.1, duration: "0.45s" });
        cam.span("15.5s", "17.0s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
        cam.at("19.3s").focus("notification_card", { scale: 1.08, duration: "0.35s" });
        cam.at("22.9s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
      })
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 2,
        }),
      )
      .build();
  },
});
