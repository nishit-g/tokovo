import { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";
import { KeyboardPlugin } from "@tokovo/compiler";
import { defineEpisode } from "@tokovo/episodes";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "entity-command-center",
    title: "Entity Command Center",
    description:
      "Code-first flagship episode: the same launch narrative moves through WhatsApp urgency, X spin, and LinkedIn polish across two devices.",
    category: "production",
    tags: ["whatsapp", "x", "linkedin", "crossover", "code-first"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 840,
    apps: ["app_whatsapp", "app_x", "app_linkedin"],
  },
  build: () => {
    let order = 0;
    const getOrder = () => order++;
    const baseTs = new Date("2025-04-10T22:02:00").getTime();

    return episode("entity-command-center", {
      fps: 30,
      duration: "28s",
      title: "Entity Command Center",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp", "app_x"],
        os: {
          time: new Date("2025-04-10T22:04:00"),
          battery: 64,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "launch_room",
            name: "Launch Room",
            type: "group",
            participants: ["me", "Founder", "Meme"],
          },
        ],
      })
      .device("career", "iphone16", {
        app: "app_linkedin",
        installedApps: ["app_linkedin", "app_x"],
        os: {
          time: new Date("2025-04-10T22:04:00"),
          battery: 58,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .snapshot("app_x", "phone", {
        currentUserId: "u_me",
        users: [
          {
            id: "u_me",
            name: "Me",
            handle: "opsnightshift",
            bio: "Operator turning creator ideas into shippable stories.",
            followers: 24100,
            following: 602,
            verified: "blue",
          },
          {
            id: "u_founder",
            name: "Founder",
            handle: "launchfaster",
            bio: "Founder. Launching fast, revising later.",
            followers: 88900,
            following: 121,
            verified: "gold",
          },
          {
            id: "u_meme",
            name: "Meme",
            handle: "recieptsnarrative",
            bio: "Internal leaks, external engagement.",
            followers: 132000,
            following: 740,
            verified: null,
          },
          {
            id: "u_vc",
            name: "VC",
            handle: "captabletheory",
            bio: "Investor with a screenshot folder and opinions.",
            followers: 31800,
            following: 228,
            verified: "gold",
          },
        ],
        follows: [
          { followerId: "u_me", followingId: "u_founder" },
          { followerId: "u_me", followingId: "u_meme" },
          { followerId: "u_me", followingId: "u_vc" },
        ],
        tweets: [
          {
            id: "tw_seed_founder",
            authorId: "u_founder",
            text: "Shipping a multi-surface story system tonight. Narrative now has infrastructure.",
            createdAt: baseTs - 120_000,
            viewCount: 14400,
            shareCount: 140,
            bookmarkCount: 560,
          },
        ],
        threads: [
          {
            id: "dm_launch",
            participantIds: ["u_me", "u_founder", "u_vc"],
          },
        ],
        messages: [
          {
            id: "dm_launch_1",
            threadId: "dm_launch",
            senderId: "u_vc",
            text: "If this lands, post the polished operator angle on LinkedIn too.",
            createdAt: baseTs - 40_000,
          },
        ],
      })
      .view("app_x", "phone", { screen: "timeline" })
      .snapshot("app_linkedin", "career", {
        currentUserId: "li_me",
        users: [
          {
            id: "li_me",
            name: "Me",
            handle: "me",
            headline: "Operator, Tokovo",
            connections: 920,
            followers: 2800,
          },
          {
            id: "li_founder",
            name: "Founder",
            handle: "founder",
            headline: "Founder building internet-native story systems",
            connections: 4100,
            followers: 18400,
          },
          {
            id: "li_vc",
            name: "VC",
            handle: "vc",
            headline: "Partner investing in consumer software",
            connections: 5300,
            followers: 22100,
          },
        ],
        connections: [
          { a: "li_me", b: "li_founder" },
          { a: "li_me", b: "li_vc" },
        ],
        posts: [
          {
            id: "li_seed_founder",
            authorId: "li_founder",
            text: "We rebuilt authoring around plain code instead of generated data models. It made every downstream workflow cleaner.",
            createdAt: baseTs - 50_000,
          },
        ],
        notifications: [
          {
            id: "li_nt_1",
            type: "reaction",
            actorId: "li_vc",
            postId: "li_seed_founder",
          },
        ],
      })
      .view("app_linkedin", "career", { screen: "feed" })
      .whatsapp("phone", "launch_room", (wa) => {
        wa.switchTo("launch_room", "0s");
        wa.at("0.8s").receive(
          "Founder",
          "Need one launch story that works in consumer and investor circles.",
        );
        wa.at("1.9s").receive("Meme", "I can do chaos. I cannot do tasteful.");
        wa.span("2.8s", "3.8s").typing("me");
        wa.at("3.9s").send(
          "We do both. Main phone handles urgency, second phone handles credibility.",
          { typed: true, charDelay: 2 },
        );
        wa.at("5.1s").receive(
          "Founder",
          "Good. Spin up X first, then LinkedIn with the cleaned-up version.",
        );
        wa.openChatList("6.4s");
      })
      .x("phone", (x) => {
        x.at("8.4s").navigate("compose");
        x.at("9.1s").postTweet({
          id: "tw_main",
          authorId: "u_me",
          text: "The best launch systems let one identity travel cleanly across every app surface.",
          typed: true,
          charDelay: 2,
          createdAt: baseTs + 30_000,
          hashtags: ["buildinpublic", "creatorops"],
        });
        x.at("11.7s").navigate("tweet", { tweetId: "tw_main" });
        x.at("12.8s").addNotification({
          id: "nt_1",
          type: "repost",
          actorId: "u_founder",
          tweetId: "tw_main",
        });
        x.at("13.2s").addNotification({
          id: "nt_2",
          type: "mention",
          actorId: "u_vc",
          tweetId: "tw_main",
          isMention: true,
        });
        x.at("14.1s").navigate("messages");
      })
      .track(
        "app_linkedin",
        (getTrackOrder) => new LinkedInTrackBuilder(30, "career", getTrackOrder),
        (li) => {
          li.at("17.2s").react("li_seed_founder", "li_me", "insightful");
          li.at("18.1s").comment({
            id: "li_comment_1",
            postId: "li_seed_founder",
            authorId: "li_me",
            text: "The real win is operational: one story, many projections, zero CMS glue.",
            typed: true,
            charDelay: 2,
          });
          li.at("20.4s").navigate("compose");
          li.at("21.1s").post({
            id: "li_post_main",
            authorId: "li_me",
            text: "Tonight's shipping note:\n\n- author in code\n- keep app state plugin-owned\n- render directly from the registry\n\nThat split finally made the system feel real.",
            typed: true,
            charDelay: 2,
            createdAt: baseTs + 90_000,
            media: {
              type: "image",
              aspect: "wide",
              urls: ["/placeholders/media.svg"],
            },
          });
          li.at("24.8s").navigate("notifications");
          li.at("25.8s").addNotification({
            id: "li_nt_2",
            type: "comment",
            actorId: "li_vc",
            postId: "li_post_main",
          });
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.35s" });
        cam.at("9.2s").focus("keyboard", { scale: 1.1, duration: "0.35s" });
        cam.at("15.4s").focus("career", { scale: 1.02, duration: "0.35s" });
        cam.span("18.1s", "19.8s").trackCinematic("keyboard", { scale: 1.12, smoothing: 0.16 });
        cam.at("24.9s").focus("notification_card", { scale: 1.08, duration: "0.35s" });
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
