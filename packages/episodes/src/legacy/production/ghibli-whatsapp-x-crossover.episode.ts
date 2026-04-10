import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { XTrackBuilder } from "@tokovo/apps-x";

export default defineEpisode({
  meta: {
    id: "ghibli-whatsapp-x-crossover",
    title: "Ghibli WhatsApp to X: Soot Sprite PR Disaster",
    description:
      "A warm Ghibli-themed crossover where a harmless WhatsApp panic turns into a deeply unserious X viral moment.",
    category: "production",
    tags: ["whatsapp", "x", "ghibli", "funny", "crossover"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 780,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () =>
    episode("ghibli-whatsapp-x-crossover", {
      fps: 30,
      duration: "26s",
      title: "Ghibli WhatsApp to X",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        theme: "whatsapp-ghibli",
        os: {
          time: new Date("2025-03-14T18:12:00"),
          battery: 73,
          network: "wifi",
        },
      })
      .background({ type: "image", src: "/backgrounds/ghibli-forest.png" })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_kiki",
            name: "Kiki",
            unreadCount: 3,
            hasStatus: true,
          },
        ],
      })
      .snapshot("app_x", "phone", {
        users: [
          {
            id: "u_me",
            name: "Nishit",
            handle: "nishit",
            bio: "Trying to keep the soot sprites off the internet.",
            followers: 12400,
            following: 410,
            verified: "blue",
          },
          {
            id: "u_kiki",
            name: "Kiki",
            handle: "kiki_delivery",
            bio: "Delivery service, light broom traffic, accidental PR manager.",
            followers: 48600,
            following: 112,
            verified: "gold",
          },
          {
            id: "u_calcifer",
            name: "Calcifer",
            handle: "portable_stove",
            bio: "Mildly cursed flame. Extremely online.",
            followers: 90200,
            following: 7,
            verified: "blue",
          },
          {
            id: "u_soot",
            name: "Soot Sprite Union",
            handle: "coal_dust_local8",
            bio: "Worker-owned stars. Tiny hands. Strong opinions.",
            followers: 30100,
            following: 24,
            verified: null,
          },
        ],
        follows: [
          { followerId: "u_me", followingId: "u_kiki" },
          { followerId: "u_me", followingId: "u_calcifer" },
          { followerId: "u_me", followingId: "u_soot" },
        ],
        currentUserId: "u_me",
        tweets: [
          {
            id: "tw_1",
            authorId: "u_soot",
            text: "BREAKING: the official snack budget has been diverted to tiny hats",
            createdAt: new Date("2025-03-14T18:06:00").getTime(),
            hashtags: ["Bathhouse", "UnionNews"],
            mentions: [],
            viewCount: 38100,
            shareCount: 522,
            bookmarkCount: 906,
          },
          {
            id: "tw_2",
            authorId: "u_calcifer",
            text: "I said 'burn the deck' metaphorically and now legal is involved",
            createdAt: new Date("2025-03-14T18:08:00").getTime(),
            hashtags: ["Ops", "NotAdvice"],
            mentions: [],
            viewCount: 47200,
            shareCount: 770,
            bookmarkCount: 1310,
          },
        ],
        notifications: [
          {
            id: "nt_1",
            type: "mention",
            actorId: "u_kiki",
            tweetId: "tw_1",
            isMention: true,
            createdAt: new Date("2025-03-14T18:10:00").getTime(),
            title: "Kiki mentioned you",
            body: "please contain this immediately",
          },
        ],
      })
      .view("app_x", "phone", {
        screen: "timeline",
        notificationsTab: "all",
        composeDraft: "",
      })
      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_kiki", getOrder),
        (wa) => {
          wa.openChatList("0s");
          wa.switchTo("dm_kiki", "1s");
          wa.at("1.5s").receive("Kiki", "small problem");
          wa.at("2.4s").receive("Kiki", "the soot sprites found the X account");
          wa.at("3.5s").receive("Kiki", "they posted the snack budget with captions");
          wa.span("4.8s", "6s").typing("me");
          wa.at("6.2s").send("How bad is it?");
          wa.at("7.1s").receive("Kiki", "Calcifer quote-tweeted it");
          wa.at("8.1s").receive("Kiki", "please switch apps before the hats trend worldwide");
        },
      )
      .track(
        "app_x",
        (getOrder) => new XTrackBuilder(30, "phone", getOrder),
        (x) => {
          x.at("9.8s").setThemeMode("ghibli");
          x.at("10.2s").navigate("timeline");
          x.at("11.2s").likeTweet("tw_1", "u_me");
          x.at("11.5s").bookmarkTweet("tw_2", "u_me");
          x.at("12.2s").setComposeDraft(
            "Official statement: the tiny hats were morale infrastructure.",
          );
          x.at("12.8s").postTweet({
            id: "tw_3",
            authorId: "u_me",
            text: "Official statement: the tiny hats were morale infrastructure. We stand by the hats.",
            hashtags: ["SootSpritePR", "MoraleInfrastructure"],
            mentions: [],
            createdAt: new Date("2025-03-14T18:12:30").getTime(),
            viewCount: 0,
            shareCount: 0,
            bookmarkCount: 0,
          });
          x.at("14.1s").navigate("tweet", { tweetId: "tw_3" });
          x.at("15.2s").replyTweet({
            id: "tw_4",
            authorId: "u_calcifer",
            replyToId: "tw_3",
            text: "counterpoint: buy me an even smaller hat",
          });
          x.at("16.6s").addNotification({
            id: "nt_2",
            type: "repost",
            actorId: "u_soot",
            tweetId: "tw_3",
            title: "Soot Sprite Union reposted you",
            body: "with the words 'acceptable compromise'",
          });
          x.at("17.4s").navigate("notifications");
          x.at("18.6s").navigate("messages");
          x.at("18.9s").createThread(["u_me", "u_kiki"], "dm_ghibli_ops");
          x.at("19.4s").sendMessage({
            id: "msg_1",
            threadId: "dm_ghibli_ops",
            senderId: "u_kiki",
            text: "good news: the hats are now considered diplomacy",
          });
          x.at("20.2s").sendMessage({
            id: "msg_2",
            threadId: "dm_ghibli_ops",
            senderId: "u_me",
            text: "perfect. expense them under public relations",
          });
          x.at("20.8s").navigate("thread", { threadId: "dm_ghibli_ops" });
          x.at("22.8s").navigate("profile", { userId: "u_soot" });
          x.at("24.2s").navigate("timeline");
        },
      )
      .deviceTrack("phone", (d) => {
        d.at("9.4s").openApp("app_x", {
          transition: { durationFrames: 18, style: "iosZoom" },
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1, duration: "0.4s" });
        cam.span("1.5s", "9s").trackCinematic("lastMessage", { scale: 1.12, smoothing: 0.18 });
        cam.span("4.8s", "6s").trackCinematic("typingIndicator", { scale: 1.08, smoothing: 0.2 });
        cam.at("9.6s").focus("timeline_header", { scale: 1.08, duration: "0.35s" });
        cam.span("10.2s", "16.2s").trackCinematic("tweet_card", { scale: 1.1, smoothing: 0.16 });
        cam.at("17.4s").focus("notifications_list", { scale: 1.08, duration: "0.35s" });
        cam.at("18.9s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("22.8s").focus("profile_header", { scale: 1.05, duration: "0.35s" });
        cam.at("24.2s").focus("timeline_feed", { scale: 1.04, duration: "0.3s" });
      })
      .build(),
});
