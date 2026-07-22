import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "linkedin-exhaustive-v2",
    title: "LinkedIn Exhaustive V2",
    description:
      "Dense LinkedIn proof spanning scrolling feed, comments, profile sections, notifications, InMail-style messages, and compose.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_linkedin",
    visibility: "public",
    sortOrder: 310,
    tags: [
      "linkedin",
      "exhaustive",
      "feed",
      "messages",
      "compose",
      "notifications",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1620,
    apps: ["app_linkedin"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T10:40:00Z").getTime();

    return episode("linkedin-exhaustive-v2", {
      fps: 30,
      duration: "54s",
      title: "LinkedIn Exhaustive V2",
    })
      .device("phone", "iphone16", {
        app: "app_linkedin",
        os: {
          time: new Date("2026-04-10T10:42:00Z"),
          battery: 82,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/soft-gradient.png" })
      .snapshot("app_linkedin", "phone", {
        currentUserId: "me",
        users: [
          {
            id: "me",
            name: "Aarav Sen",
            handle: "aaravsen",
            headline: "Building product systems that still feel human",
            avatarUrl: "/avatars/avatar-zoe.jpg",
            company: "Tokovo",
            location: "Bengaluru",
            connections: 902,
            followers: 16500,
            profileViews: 520,
            impressionCount: 14800,
          },
          {
            id: "u1",
            name: "Riku Sato",
            handle: "rikusato",
            headline: "Illustration systems lead",
            avatarUrl: "/avatars/avatar-priya.jpg",
            company: "Freelance",
            location: "Kyoto",
            connections: 612,
            followers: 10100,
          },
          {
            id: "u2",
            name: "Noor Ahmed",
            handle: "noorahmed",
            headline: "Founder hiring PMs",
            avatarUrl: "/avatars/avatar-alex.jpg",
            company: "Northline",
            location: "Dubai",
            connections: 1110,
            followers: 24100,
          },
          {
            id: "u3",
            name: "Mina Park",
            handle: "minapark",
            headline: "Launch strategist",
            avatarUrl: "/avatars/avatar-ava.jpg",
            company: "Lantern",
            location: "Seoul",
            connections: 1040,
            followers: 19800,
          },
        ],
        posts: [
          {
            id: "li_ex_1",
            authorId: "u2",
            text: "Hot take: most product launches fail because the team never rehearsed the comment section.",
            createdAt: baseTs - 170000,
            hashtags: ["product", "launch"],
          },
          {
            id: "li_ex_2",
            authorId: "u1",
            text: "We cut three animations today because clarity won. The page instantly felt more confident.",
            createdAt: baseTs - 120000,
            media: {
              type: "image",
              urls: ["/placeholders/media.svg"],
              aspect: "wide",
            },
          },
          {
            id: "li_ex_3",
            authorId: "me",
            text: "If your notification system cannot handle escalation gracefully, your app does not deserve a growth team.",
            createdAt: baseTs - 80000,
            hashtags: ["systems", "productops"],
          },
        ],
        notifications: [
          {
            id: "li_ex_nt_1",
            type: "comment",
            actorId: "u3",
            postId: "li_ex_3",
            unread: true,
            createdAt: baseTs - 24000,
            title: "Mina Park commented on your post",
            body: "This is the most honest sentence in product ops.",
          },
          {
            id: "li_ex_nt_2",
            type: "follow",
            actorId: "u2",
            unread: true,
            createdAt: baseTs - 18000,
            title: "Noor Ahmed started following you",
            body: "Founder hiring PMs",
          },
        ],
        threads: [
          {
            id: "li_ex_dm_1",
            participantIds: ["me", "u2"],
            title: "Noor Ahmed",
            unreadCount: 1,
            pinned: true,
          },
          {
            id: "li_ex_dm_2",
            participantIds: ["me", "u3"],
            title: "Mina Park",
            unreadCount: 0,
            pinned: false,
          },
        ],
        messages: [
          {
            id: "li_ex_msg_1",
            threadId: "li_ex_dm_1",
            senderId: "u2",
            text: "Can you sanity check my hiring brief before I embarrass myself publicly?",
            createdAt: baseTs - 10000,
          },
        ],
      })
      .linkedin("phone", (li) => {
        li.at("1.4s").navigate("feed", { postId: "li_ex_1" });
        li.at("3.0s").navigate("feed", { postId: "li_ex_2" });
        li.at("4.8s").navigate("feed", { postId: "li_ex_3" });
        li.at("7.0s").navigate("post", { postId: "li_ex_3" });
        li.at("9.0s").comment({
          id: "li_ex_comment_1",
          postId: "li_ex_3",
          authorId: "u3",
          text: "Hard agree. Escalation design is what separates a demo from a product.",
          createdAt: baseTs + 8000,
        });
        li.at("12.6s").navigate("profile", { userId: "me" });
        li.at("16.8s").navigate("notifications");
        li.at("20.8s").navigate("messages");
        li.at("22.4s").navigate("thread", { threadId: "li_ex_dm_1" });
        li.at("24.0s").sendDM({
          id: "li_ex_msg_2",
          threadId: "li_ex_dm_1",
          senderId: "me",
          text: "The brief is strong. Replace the vague culture sentence with actual expectations.",
          createdAt: baseTs + 22000,
        });
        li.at("28.0s").navigate("thread", { threadId: "li_ex_dm_2" });
        li.at("29.6s").sendDM({
          id: "li_ex_msg_3",
          threadId: "li_ex_dm_2",
          senderId: "me",
          text: "Your comment line is right. I am stealing 'a demo from a product'.",
          createdAt: baseTs + 29000,
        });
        li.at("33.4s").navigate("compose");
        li.at("34.0s").setComposeDraft(
          "Good product systems remove panic without removing character.",
        );
        li.at("36.2s").post({
          id: "li_ex_post_4",
          authorId: "me",
          text: "Good product systems remove panic without removing character.",
          createdAt: baseTs + 42000,
        });
        li.at("39.0s").navigate("feed", { postId: "li_ex_post_4" });
      })
      .build();
  },
});
