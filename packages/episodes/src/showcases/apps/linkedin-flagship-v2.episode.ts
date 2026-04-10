import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";

export default defineEpisode({
  meta: {
    id: "linkedin-flagship-v2",
    title: "LinkedIn Flagship V2",
    description:
      "Fresh LinkedIn flagship covering feed depth, post detail, profile credibility, notifications, and messages.",
    category: "showcase",
    catalogType: "app_showcase_flagship",
    appId: "app_linkedin",
    visibility: "public",
    sortOrder: 300,
    tags: ["linkedin", "flagship", "feed", "profile", "notifications", "messages"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1260,
    apps: ["app_linkedin"],
  },
  build: () => {
    const baseTs = new Date("2026-04-10T09:20:00").getTime();

    return episode("linkedin-flagship-v2", {
      fps: 30,
      duration: "42s",
      title: "LinkedIn Flagship V2",
    })
      .device("phone", "iphone16", {
        app: "app_linkedin",
        os: {
          time: new Date("2026-04-10T09:22:00"),
          battery: 87,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/cafe-lofi.png" })
      .snapshot("app_linkedin", "phone", {
        currentUserId: "me",
        users: [
          { id: "me", name: "Ira Sen", handle: "irasen", headline: "Design systems + story-first products", avatarUrl: "/avatars/avatar-zoe.jpg", company: "Tokovo", location: "Bengaluru", connections: 821, followers: 14200, profileViews: 402, impressionCount: 12900 },
          { id: "u1", name: "Noor Ahmed", handle: "noorahmed", headline: "Founder hiring design leadership", avatarUrl: "/avatars/avatar-alex.jpg", company: "Northline", location: "Dubai", connections: 1100, followers: 22400 },
          { id: "u2", name: "Mina Park", handle: "minapark", headline: "Brand storyteller and launch strategist", avatarUrl: "/avatars/avatar-priya.jpg", company: "Lantern", location: "Seoul", connections: 982, followers: 18700 },
        ],
        posts: [
          { id: "li_flag_1", authorId: "u1", text: "We shipped the quiet version of our homepage and the conversion rate moved before the design Twitter people even noticed.", createdAt: baseTs - 140000, hashtags: ["design", "growth"] },
          { id: "li_flag_2", authorId: "me", text: "Good product cameras are not decoration. They are readability infrastructure.", createdAt: baseTs - 90000, media: { type: "image", urls: ["/placeholders/media.svg"], aspect: "wide" }, hashtags: ["productdesign", "motion"] },
        ],
        notifications: [
          { id: "li_nt_1", type: "like", actorId: "u2", postId: "li_flag_2", unread: true, createdAt: baseTs - 40000, title: "Mina Park liked your post", body: "Good product cameras are not decoration..." },
        ],
        threads: [
          { id: "li_dm_1", participantIds: ["me", "u1"], title: "Noor Ahmed", unreadCount: 1, pinned: true },
        ],
        messages: [
          { id: "li_dm_seed_1", threadId: "li_dm_1", senderId: "u1", text: "Can you review the hiring post before I send it live?", createdAt: baseTs - 20000 },
        ],
      })
      .track("app_linkedin", (getOrder) => new LinkedInTrackBuilder(30, "phone", getOrder), (li) => {
        li.at("1.2s").navigate("feed", { postId: "li_flag_1" });
        li.at("3.0s").navigate("feed", { postId: "li_flag_2" });
        li.at("5.2s").navigate("post", { postId: "li_flag_2" });
        li.at("7.2s").comment({
          id: "li_flag_comment_v2",
          postId: "li_flag_2",
          authorId: "u2",
          text: "Yes. Motion that explains structure is more useful than motion that just says 'premium'.",
          createdAt: baseTs + 12000,
          typed: true,
          charDelay: 2,
        });
        li.at("10.0s").navigate("profile", { userId: "me" });
        li.at("13.6s").navigate("notifications");
        li.at("16.8s").navigate("messages");
        li.at("18.4s").navigate("thread", { threadId: "li_dm_1" });
        li.at("20.0s").sendDM({
          id: "li_dm_2",
          threadId: "li_dm_1",
          senderId: "me",
          text: "Tone is strong. Cut the fake humility and keep the actual hiring criteria.",
          createdAt: baseTs + 24000,
          typed: true,
          charDelay: 2,
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("feed", { scale: 1.02, duration: "0.35s" });
        cam.at("3.1s").focus("post_card", { scale: 1.08, duration: "0.35s" });
        cam.at("5.3s").focus("post_detail", { scale: 1.08, duration: "0.35s" });
        cam.span("7.2s", "9.8s").trackCinematic("keyboard", { scale: 1.1, smoothing: 0.18 });
        cam.at("10.1s").focus("profile_header", { scale: 1.08, duration: "0.35s" });
        cam.at("13.7s").focus("notification_row", { scale: 1.08, duration: "0.35s" });
        cam.at("18.5s").focus("message_thread", { scale: 1.08, duration: "0.35s" });
      })
      .build();
  },
});
