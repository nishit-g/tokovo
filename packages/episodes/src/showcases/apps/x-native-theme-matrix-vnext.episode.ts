import { episode } from "../../code-first-episode.js";
import { defineEpisode } from "../../types/episode-definition.js";
import { xNativeThemeMatrixCamera } from "./x-native-theme-matrix.camera.js";

const baseTime = new Date("2026-07-20T16:10:00.000Z").getTime();

export default defineEpisode({
  meta: {
    id: "x-native-theme-matrix-vnext",
    title: "X Native Theme Matrix VNext",
    description:
      "A native X theme proof across iOS light, Android dim with Arabic RTL, and iOS lights-out with Hindi typography—without runtime theme mutation.",
    category: "showcase",
    catalogType: "app_showcase_theme",
    appId: "app_x",
    themeId: "native-platform-matrix",
    visibility: "public",
    sortOrder: 98,
    tags: ["x", "themes", "light", "dim", "lights-out", "rtl", "hindi", "platforms"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 540,
    apps: ["app_x"],
  },
  build: () =>
    episode("x-native-theme-matrix-vnext", {
      fps: 30,
      duration: "18s",
      title: "X Native Theme Matrix VNext",
    })
      .device("ios_light", "iphone16", {
        app: "app_x",
        appearance: "light",
        installedApps: ["app_x"],
        os: { time: baseTime, battery: 82, network: "5G" },
      })
      .device("android_dim", "pixel", {
        app: "app_x",
        appearance: "dark",
        theme: "x-dim",
        installedApps: ["app_x"],
        os: { time: baseTime, battery: 68, network: "wifi" },
      })
      .device("ios_lights_out_hi", "iphone16", {
        app: "app_x",
        appearance: "dark",
        theme: "x-lights-out",
        installedApps: ["app_x"],
        os: { time: baseTime, battery: 74, network: "5G" },
      })
      .background("studio-quiet-dark")
      .cinematics(xNativeThemeMatrixCamera)
      .snapshot("app_x", "ios_light", {
        schemaVersion: 2,
        locale: "en-US",
        currentUserId: "light_me",
        users: [
          { id: "light_me", name: "Maya Lin", handle: "mayaships", followers: 18_200, following: 404, verified: "blue" },
          { id: "light_author", name: "Release Desk", handle: "releasedesk", followers: 92_400, following: 80, verified: "gold" },
        ],
        tweets: [{
          id: "light_post",
          authorId: "light_author",
          text: "A light theme still needs depth, hierarchy, and calm spacing.",
          createdAt: baseTime - 70_000,
          media: { type: "image", urls: ["/media/launch-board.svg"], aspect: "wide", alt: "A clean product launch board" },
          viewCount: 84_200,
          likeCount: 6_420,
          repostCount: 814,
        }],
        notifications: [{ id: "light_nt", type: "like", actorId: "light_author", tweetId: "light_post", createdAt: baseTime - 18_000 }],
      }, { version: 2 })
      .view("app_x", "ios_light", { schemaVersion: 2, screen: "timeline" }, { version: 2 })
      .snapshot("app_x", "android_dim", {
        schemaVersion: 2,
        locale: "ar-SA",
        currentUserId: "dim_me",
        users: [
          { id: "dim_me", name: "ليان", handle: "layanmakes", followers: 22_800, following: 390, verified: "blue" },
          { id: "dim_author", name: "استوديو المنتج", handle: "productstudioar", followers: 110_200, following: 92, verified: "gold" },
        ],
        tweets: [{
          id: "dim_post",
          authorId: "dim_author",
          text: "الوضع الخافت يحافظ على التباين بدون أن يفقد الواجهة عمقها.",
          createdAt: baseTime - 62_000,
          media: { type: "image", urls: ["/media/founder-whiteboard.jpg"], aspect: "wide", alt: "لوحة تخطيط لإطلاق المنتج" },
          viewCount: 72_100,
          likeCount: 5_310,
          repostCount: 602,
        }],
        notifications: [{ id: "dim_nt", type: "mention", actorId: "dim_author", tweetId: "dim_post", isMention: true, createdAt: baseTime - 14_000 }],
      }, { version: 2 })
      .view("app_x", "android_dim", { schemaVersion: 2, screen: "timeline" }, { version: 2 })
      .snapshot("app_x", "ios_lights_out_hi", {
        schemaVersion: 2,
        locale: "hi-IN",
        currentUserId: "hi_me",
        users: [
          { id: "hi_me", name: "मीरा सेन", handle: "meerabuilds", followers: 26_400, following: 448, verified: "blue" },
          { id: "hi_author", name: "डिज़ाइन कक्ष", handle: "designroomhi", followers: 98_700, following: 101, verified: "gold" },
        ],
        tweets: [{
          id: "hi_post",
          authorId: "hi_author",
          text: "लाइट्स-आउट थीम में देवनागरी स्पष्ट, संतुलित और सहज पढ़ने योग्य होनी चाहिए।",
          createdAt: baseTime - 54_000,
          media: { type: "image", urls: ["/media/office-meme.png"], aspect: "square", alt: "स्टूडियो में एक प्रोडक्ट स्क्रीन" },
          viewCount: 68_300,
          likeCount: 4_820,
          repostCount: 544,
        }],
        notifications: [{ id: "hi_nt", type: "follow", actorId: "hi_author", createdAt: baseTime - 12_000 }],
      }, { version: 2 })
      .view("app_x", "ios_lights_out_hi", { schemaVersion: 2, screen: "timeline" }, { version: 2 })
      .x("ios_light", (x) => {
        x.at("5s").navigate("notifications");
        x.at("10s").navigate("profile", { userId: "light_me" });
      })
      .x("android_dim", (x) => {
        x.at("6s").navigate("notifications");
        x.at("11s").navigate("profile", { userId: "dim_me" });
      })
      .x("ios_lights_out_hi", (x) => {
        x.at("7s").navigate("notifications");
        x.at("12s").navigate("profile", { userId: "hi_me" });
      })
      .build(),
});
