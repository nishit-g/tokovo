import { defineEpisode } from "@tokovo/episodes";
import { episode } from "@tokovo/dsl";
import { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";

export default defineEpisode({
  meta: {
    id: "linkedin-ghibli-studio",
    title: "LinkedIn Ghibli Studio",
    description: "Warm Ghibli-toned LinkedIn showcase with profile, notifications, messages, and creator posting flow.",
    category: "showcase",
    tags: ["linkedin", "ghibli", "profile", "messages", "creator"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1350,
    apps: ["app_linkedin"],
  },
  build: () =>
    episode("linkedin-ghibli-studio", {
      fps: 30,
      duration: "45s",
      title: "LinkedIn Ghibli Studio",
    })
      .device("phone", "iphone16", {
        app: "app_linkedin",
        os: {
          time: new Date("2025-03-11T08:20:00"),
          battery: 88,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/ghibli-forest.png" })
      .snapshot("app_linkedin", "phone", {
        currentUserId: "me",
        users: [
          {
            id: "me",
            name: "Aarav Sen",
            handle: "aaravsen",
            headline: "Creative systems designer building calm, story-first tools",
            avatarUrl: "/placeholders/app-icon.svg",
            company: "Tokovo Studio",
            location: "Bengaluru, India",
            about: "I build product surfaces that feel cinematic without losing system rigor. Currently focused on camera-aware app simulations, authoring DSLs, and interfaces with character.",
            connections: 824,
            followers: 14600,
            profileViews: 428,
            impressionCount: 12400,
          },
          {
            id: "u1",
            name: "Mina Park",
            handle: "minapark",
            headline: "Brand storyteller at Lantern",
            avatarUrl: "/placeholders/app-icon.svg",
            company: "Lantern",
            location: "Seoul",
            connections: 1200,
            followers: 21000,
          },
          {
            id: "u2",
            name: "Riku Sato",
            handle: "rikusato",
            headline: "Illustration lead, soft fantasy worlds",
            avatarUrl: "/placeholders/app-icon.svg",
            company: "Freelance",
            location: "Kyoto",
            connections: 640,
            followers: 9800,
          },
          {
            id: "u3",
            name: "Noor Ahmed",
            handle: "noorahmed",
            headline: "Founder hiring product designers",
            avatarUrl: "/placeholders/app-icon.svg",
            company: "Ashwood",
            location: "Dubai",
            connections: 980,
            followers: 7600,
          },
          {
            id: "u4",
            name: "Elia Morin",
            handle: "eliamorin",
            headline: "Recruiting designer-founder hybrids for tiny product teams",
            avatarUrl: "/placeholders/app-icon.svg",
            company: "Serein",
            location: "Paris",
            connections: 510,
            followers: 4300,
          },
          {
            id: "u5",
            name: "Joon Lee",
            handle: "joonlee",
            headline: "Visual designer obsessed with slower, warmer interfaces",
            avatarUrl: "/placeholders/app-icon.svg",
            company: "Studio Haneul",
            location: "Busan",
            connections: 710,
            followers: 5200,
          },
        ],
        connections: [
          { a: "me", b: "u1" },
          { a: "me", b: "u2" },
          { a: "me", b: "u3" },
        ],
        posts: [
          {
            id: "p1",
            authorId: "u1",
            text: "A good creator brand is not louder. It is more legible. Color, cadence, and point of view should feel inevitable.",
            createdAt: new Date("2025-03-11T08:05:00").getTime(),
          },
          {
            id: "p2",
            authorId: "u2",
            text: "Designing like a storybook means caring about atmosphere, not just alignment. Small moods change everything.",
            createdAt: new Date("2025-03-11T08:09:00").getTime(),
          },
          {
            id: "p3",
            authorId: "me",
            text: "Working on a warmer LinkedIn plugin look today. Less dashboard energy, more editorial calm.",
            createdAt: new Date("2025-03-11T08:13:00").getTime(),
          },
          {
            id: "p4-seed",
            authorId: "u3",
            text: "Professional software can still feel hand-made. Precision and atmosphere should work together, not compete.",
            createdAt: new Date("2025-03-11T08:14:00").getTime(),
          },
        ],
        comments: [
          {
            id: "c1",
            postId: "p3",
            authorId: "u1",
            text: "The tone shift already feels more human.",
            createdAt: new Date("2025-03-11T08:15:00").getTime(),
          },
        ],
        notifications: [
          {
            id: "nt1",
            type: "comment",
            actorId: "u1",
            postId: "p3",
            body: "commented on your post",
            unread: true,
            createdAt: new Date("2025-03-11T08:16:00").getTime(),
          },
        ],
        threads: [
          {
            id: "dm1",
            participantIds: ["me", "u3"],
            title: "Noor Ahmed",
            unreadCount: 2,
            pinned: true,
          },
          {
            id: "dm2",
            participantIds: ["me", "u4"],
            title: "Elia Morin",
            unreadCount: 0,
            pinned: false,
          },
          {
            id: "dm3",
            participantIds: ["me", "u5"],
            title: "Joon Lee",
            unreadCount: 1,
            pinned: false,
            draftText: "Still thinking about the visual system...",
          },
        ],
        messages: [
          {
            id: "m1",
            threadId: "dm1",
            senderId: "u3",
            text: "Your latest post has the exact tone our team wants.",
            createdAt: new Date("2025-03-11T08:17:00").getTime(),
          },
          {
            id: "m2",
            threadId: "dm1",
            senderId: "u3",
            text: "Open to a quick intro call next week?",
            createdAt: new Date("2025-03-11T08:18:00").getTime(),
          },
          {
            id: "m4",
            threadId: "dm2",
            senderId: "u4",
            text: "Your latest mockups feel more editorial than app-like. That is a compliment.",
            createdAt: new Date("2025-03-11T08:12:00").getTime(),
          },
          {
            id: "m5",
            threadId: "dm3",
            senderId: "u5",
            text: "Can you share the palette study when you are ready?",
            createdAt: new Date("2025-03-11T08:19:00").getTime(),
          },
        ],
      })
      .view("app_linkedin", "phone", {
        screen: "feed",
        themeMode: "ghibli",
      })
      .track(
        "app_linkedin",
        (getOrder) => new LinkedInTrackBuilder(30, "phone", getOrder),
        (li) => {
          li.at("1.0s").setThemeMode("ghibli");
          li.at("2.0s").navigate("feed", { postId: "p1" });
          li.at("3.5s").navigate("feed", { postId: "p2" });
          li.at("5.0s").react("p2", "me", "celebrate");
          li.at("6.5s").navigate("feed", { postId: "p3" });
          li.at("8.0s").navigate("feed", { postId: "p4-seed" });
          li.at("10.0s").navigate("profile", { userId: "me" });
          li.at("15.0s").navigate("messages");
          li.at("18.0s").navigate("thread", { threadId: "dm1" });
          li.at("21.0s").sendDM({
            id: "m3",
            threadId: "dm1",
            senderId: "me",
            text: "Yes. I can share a few creator-facing interaction ideas tomorrow.",
            typed: true,
            charDelay: 2,
          });
          li.at("26.0s").navigate("notifications");
          li.at("29.0s").navigate("compose");
          li.at("33.0s").post({
            id: "p5",
            authorId: "me",
            text: "Today’s note: professional apps do not need to feel cold. Warmth, structure, and clarity can coexist.",
            typed: true,
            charDelay: 2,
          });
          li.at("36.5s").navigate("feed", { postId: "p5" });
          li.at("39.0s").addNotification({
            id: "nt2",
            type: "reaction",
            actorId: "u2",
            postId: "p5",
            body: "reacted to your post",
            unread: true,
          });
          li.at("41.0s").navigate("post", { postId: "p5" });
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("li_header", { scale: 1.04, duration: "0.6s" });
        cam.at("2s").focus("li_post_focus", { scale: 1.05, duration: "0.7s" });
        cam.at("3.5s").focus("li_post_focus_comments", { scale: 1.06, duration: "0.7s" });
        cam.at("6.5s").focus("li_post_focus", { scale: 1.05, duration: "0.7s" });
        cam.at("10s").focus("li_profile_header", { scale: 1.06, duration: "0.7s" });
        cam.at("15s").focus("li_messages_list", { scale: 1.05, duration: "0.7s" });
        cam.at("18s").focus("li_dm_thread", { scale: 1.05, duration: "0.7s" });
        cam.at("29s").focus("li_compose_sheet", { scale: 1.05, duration: "0.7s" });
        cam.at("36.5s").focus("li_post_focus", { scale: 1.05, duration: "0.7s" });
        cam.at("41s").focus("li_post_detail_card", { scale: 1.05, duration: "0.7s" });
      })
      .build(),
});
