import { defineEpisode } from "../types/episode-definition.js";
import {
  applyStudioStoryKitConfig,
  storyEpisode,
} from "../story-kit/index.js";
import { storyKitCrossoverShowcaseConfig } from "./story-kit-crossover-showcase.story-kit.js";

export default defineEpisode({
  meta: {
    id: "story-kit-crossover-showcase",
    title: "Story Kit Crossover Showcase",
    description:
      "Story-kit authored WhatsApp + X crossover using persona, asset, style, and device casting.",
    category: "production",
    tags: ["story-kit", "whatsapp", "x", "crossover", "camera"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 660,
    apps: ["app_whatsapp", "app_x"],
  },
  build: () => {
    const ep = applyStudioStoryKitConfig(storyEpisode("story-kit-crossover-showcase", {
      fps: 30,
      duration: "22s",
      title: "Story Kit Crossover Showcase",
    }), storyKitCrossoverShowcaseConfig)
      .device("secondary_phone", {
        app: "app_x",
      });

    const kit = ep.kit();

    return ep
      .background(kit.background ?? "ambient-night")
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        theme: kit.device("main_phone").theme ?? kit.style("app_whatsapp").theme,
        installedApps: ["app_whatsapp", "app_x"],
        homeScreen: {
          preset: "ios-default",
          wallpaper: kit.asset("midnight_grid", "wallpapers"),
        },
        os: {
          time: new Date("2025-04-10T21:36:00"),
          battery: 68,
          network: "5G",
        },
        conversations: [
          {
            id: "ops_room",
            name: "Launch Room",
            type: "group",
            participants: [
              kit.actor("me").name,
              kit.actor("founder").name,
              kit.actor("meme").name,
            ],
            avatar: kit.actor("founder").avatar,
            unreadCount: 4,
          },
        ],
      })
      .whatsapp("phone", "ops_room", (wa) => {
        wa.switchTo("ops_room", "0s");
        wa.at("0.4s").receive(
          kit.actor("founder").name,
          "Need viral thread in 10 minutes or we pivot to astrology.",
        );
        wa.at("1.6s").receive(
          kit.actor("meme").name,
          "Already writing: \"10 signs your startup is in emotional debt\"",
        );

        wa.span("2.8s", "3.5s").typing("me");
        wa.at("3.7s").send(
          "Posting from X now. If this flops we all become chai influencers.",
        );
        wa.openChatList("5s");
      })
      .x("phone", (x) => {
        x.seed({
          currentUserId: kit.actor("me").personaId,
          users: [
            {
              id: kit.actor("me").personaId,
              name: kit.actor("me").name,
              handle: kit.actor("me").handle,
              bio: kit.actor("me").bio,
              avatarUrl: kit.actor("me").avatar,
              followers: 21400,
              following: 540,
              verified: "blue",
            },
            {
              id: kit.actor("vc").personaId,
              name: kit.actor("vc").name,
              handle: kit.actor("vc").handle,
              bio: kit.actor("vc").bio,
              avatarUrl: kit.actor("vc").avatar,
              followers: 81200,
              following: 310,
              verified: "gold",
            },
          ],
          tweets: [],
          screen: "timeline",
        }, "5.4s");

        x.at("6.2s").navigate("compose");
        x.at("7.2s").postTweet({
          id: "tw1",
          authorId: kit.actor("me").personaId,
          text: "If your startup has 4 dashboards and 0 revenue, congrats, you built a museum.",
          typed: true,
          charDelay: 1.3,
        });
        x.at("10.2s").addNotification({
          id: "n1",
          type: "mention",
          actorId: kit.actor("vc").personaId,
          tweetId: "tw1",
        });
        x.at("11.2s").navigate("tweet", { tweetId: "tw1" });
      })
      .camera((cam) => {
        cam.at("0s").focus("chat_list", { scale: 1.05, duration: "0.35s" });
        cam.at("2.8s").focus("typingIndicator", { scale: 1.1, duration: "0.35s" });
        cam.at("6.2s").focus("compose_editor", { scale: 1.08, duration: "0.35s" });
        cam.at("10.2s").focus("notifications_row_0_content", {
          scale: 1.1,
          duration: "0.4s",
        });
        cam.at("11.2s").focus("tweet_detail_actions", { scale: 1.07, duration: "0.35s" });
      })
      .build();
  },
});
