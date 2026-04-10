import { defineEpisode } from "@tokovo/episodes";
import { episode } from "@tokovo/dsl";
import { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";

export default defineEpisode({
  meta: {
    id: "mega-linkedin",
    title: "Mega LinkedIn",
    description:
      "Full LinkedIn flow: seeded feed, reactions, comments, post detail, profile, notifications, DMs, compose",
    category: "production",
    tags: ["linkedin", "mega", "feed", "comments", "dm", "compose", "anchors"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1800,
    apps: ["app_linkedin"],
  },
  build: () =>
    episode("mega-linkedin", {
      fps: 30,
      duration: "60s",
      title: "Mega LinkedIn",
    })
      .device("phone", "iphone16", {
        app: "app_linkedin",
        os: {
          time: new Date("2025-02-06T09:12:00"),
          battery: 84,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/cafe-lofi.png" })
      .snapshot("app_linkedin", "phone", {
        users: [
          {
            id: "me",
            name: "Nishit",
            handle: "nishit",
            headline: "Building Tokovo | Video DSL + plugins",
            avatarUrl: "/placeholders/app-icon.svg",
            connections: 512,
            followers: 1800,
          },
          {
            id: "u1",
            name: "Ava Patel",
            handle: "ava",
            headline: "Product | Platforms",
            avatarUrl: "/placeholders/app-icon.svg",
            connections: 803,
            followers: 9200,
          },
          {
            id: "u2",
            name: "Kai Chen",
            handle: "kai",
            headline: "Design Systems",
            avatarUrl: "/placeholders/app-icon.svg",
            connections: 1200,
            followers: 11400,
          },
          {
            id: "u3",
            name: "Rin Okada",
            handle: "rin",
            headline: "Cameras + storytelling",
            avatarUrl: "/placeholders/app-icon.svg",
            connections: 344,
            followers: 4200,
          },
          {
            id: "u4",
            name: "Maya Singh",
            handle: "maya",
            headline: "Growth | Content",
            avatarUrl: "/placeholders/app-icon.svg",
            connections: 640,
            followers: 7600,
          },
        ],
        connections: [
          { a: "me", b: "u1" },
          { a: "me", b: "u2" },
          { a: "me", b: "u3" },
        ],
        currentUserId: "me",
        posts: [
          {
            id: "p1",
            authorId: "u2",
            text:
              "A clean feed is a design system problem.\n\nAnchors + tokens make it deterministic.",
            hashtags: ["designsystems", "ui"],
            createdAt: new Date("2025-02-06T08:58:00").getTime(),
            linkPreview: {
              url: "https://example.com/tokens",
              domain: "example.com",
              title: "Tokens: the boring part that wins",
              description: "Make UI predictable. Then make it beautiful.",
            },
          },
          {
            id: "p2",
            authorId: "u3",
            text:
              "Camera tip: focus on semantic regions, not pixels.\n\nYour episodes become resilient.",
            createdAt: new Date("2025-02-06T09:01:00").getTime(),
          },
          {
            id: "p3",
            authorId: "u4",
            text:
              "If your UI demo doesn't tell a story, it won't convert.\n\nSeed the world state like it matters.",
            createdAt: new Date("2025-02-06T09:04:00").getTime(),
          },
          {
            id: "p4",
            authorId: "me",
            text:
              "Shipping a new LinkedIn plugin for Tokovo.\n\nNext: richer comments + faster authoring DSL.",
            createdAt: new Date("2025-02-06T09:07:00").getTime(),
          },
        ],
        notifications: [
          { id: "nt-1", type: "reaction", actorId: "u1", postId: "p4" },
          { id: "nt-2", type: "comment", actorId: "u2", postId: "p4" },
          { id: "nt-3", type: "connection", actorId: "u4" },
        ],
        threads: [{ id: "dm-1", participantIds: ["me", "u2"] }],
        messages: [
          {
            id: "dm-msg-1",
            threadId: "dm-1",
            senderId: "u2",
            text: "This LinkedIn look is clean. Anchors stable?",
            createdAt: new Date("2025-02-06T09:05:00").getTime(),
          },
          {
            id: "dm-msg-2",
            threadId: "dm-1",
            senderId: "me",
            text: "Yep. Semantic regions first, heuristics fallback.",
            createdAt: new Date("2025-02-06T09:06:00").getTime(),
          },
        ],
      })
      .view("app_linkedin", "phone", { screen: "feed" })
      .track(
        "app_linkedin",
        (getOrder) => new LinkedInTrackBuilder(30, "phone", getOrder),
        (li) => {
          // =============================================================================
          // FLOW: engagement -> post detail -> profile -> notifications -> messages -> compose
          // =============================================================================

          // Feed engagement
          li.at("3.0s").react("p1", "me", "insightful");
          li.at("3.6s").react("p2", "me", "like");
          li.at("4.2s").comment({
            id: "c1",
            postId: "p1",
            authorId: "me",
            text: "Strong take. Tokens + anchors are the difference between a demo and a system.",
            typed: true,
            charDelay: 2,
          });

          // Open post detail and add another comment
          li.at("7.0s").navigate("post", { postId: "p1" });
          li.at("9.2s").comment({
            id: "c2",
            postId: "p1",
            authorId: "u1",
            text: "Love this. Determinism makes iteration so much faster.",
          });

          // Jump to profile
          li.at("12.0s").navigate("profile", { userId: "u2" });

          // Notifications
          li.at("16.0s").navigate("notifications");

          // Messages + thread
          li.at("20.0s").navigate("messages");
          li.at("22.0s").navigate("thread", { threadId: "dm-1" });
          li.at("24.6s").sendDM({
            id: "dm-msg-3",
            threadId: "dm-1",
            senderId: "me",
            text: "Next I want comment threads + reactions row parity.",
            typed: true,
            charDelay: 2,
          });
          li.at("28.0s").sendDM({
            id: "dm-msg-4",
            threadId: "dm-1",
            senderId: "u2",
            text: "Do it. Also add a nav bar animation.",
          });

          // Compose a post (typed) then return to feed
          li.at("32.0s").navigate("compose");
          li.at("34.5s").post({
            id: "p5",
            authorId: "me",
            text:
              "LinkedIn plugin progress update:\n\n- tokens + theme\n- semantic anchors\n- lowering with typed keyboard\n- feed/profile/notifs/dms\n\nNext: threaded comments + richer post cards.",
            typed: true,
            charDelay: 2,
          });
          li.at("38.0s").navigate("feed");

          // A little theme flex
          li.at("42.0s").setThemeMode("dark");
          li.at("44.0s").react("p5", "u3", "celebrate");
          li.at("45.0s").addNotification({
            id: "nt-4",
            type: "reaction",
            actorId: "u3",
            postId: "p5",
          });
          li.at("48.0s").navigate("notifications");

          // Back home
          li.at("54.0s").navigate("feed");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("li_header", { scale: 1.05, duration: "0.6s" });
        cam.at("2.5s").focus("li_post_card", { scale: 1.08, duration: "0.7s" });
        cam.at("3.8s").focus("li_reaction_row", { scale: 1.06, duration: "0.6s" });
        cam.at("7.0s").focus("li_post_detail", { scale: 1.04, duration: "0.8s" });
        cam.at("12.0s").focus("li_profile_header", { scale: 1.06, duration: "0.7s" });
        cam.at("16.0s").focus("li_notifications_list", { scale: 1.05, duration: "0.7s" });
        cam.at("22.0s").focus("li_dm_thread", { scale: 1.06, duration: "0.7s" });
        cam.at("32.0s").focus("li_compose_sheet", { scale: 1.05, duration: "0.8s" });
        cam.at("38.0s").focus("li_post_card", { scale: 1.06, duration: "0.7s" });
        cam.at("48.0s").focus("li_notifications_list", { scale: 1.05, duration: "0.7s" });
        cam.at("54.0s").focus("device", { scale: 1, duration: "0.8s" });
      })
      .mark("seed", "0s")
      .mark("engagement", "3s")
      .mark("post_detail", "7s")
      .mark("profile", "12s")
      .mark("notifications", "16s")
      .mark("messages", "20s")
      .mark("compose", "32s")
      .mark("theme", "42s")
      .mark("finale", "54s")
      .section("seed", "0s", "3s")
      .section("engage", "3s", "7s")
      .section("detail", "7s", "12s")
      .section("profile", "12s", "16s")
      .section("notifs", "16s", "20s")
      .section("dms", "20s", "32s")
      .section("compose", "32s", "38s")
      .section("theme-flex", "42s", "54s")
      .section("outro", "54s", "60s")
      .build(),
});
