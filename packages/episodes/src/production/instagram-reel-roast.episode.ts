import { InstagramTrackBuilder } from "@tokovo/apps-instagram";
import { episode } from "@tokovo/dsl";
import { defineEpisode } from "@tokovo/episodes";

export default defineEpisode({
  meta: {
    id: "instagram-reel-roast",
    title: "Instagram Reel Roast",
    description:
      "A creator posts a 'how reels are made' breakdown and the comments immediately turn into a roast thread.",
    category: "production",
    tags: ["instagram", "comments", "creator", "roast", "scroll"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 660,
    apps: ["app_instagram"],
  },
  build: () => {
    const baseTs = new Date("2025-08-03T20:05:00").getTime();

    return episode("instagram-reel-roast", {
      fps: 30,
      duration: "22s",
      title: "Instagram Reel Roast",
    })
      .device("phone", "iphone16", {
        app: "app_instagram",
        installedApps: ["app_instagram"],
        os: {
          time: new Date("2025-08-03T20:08:00"),
          battery: 58,
          network: "5G",
        },
      })
      .snapshot("app_instagram", "phone", {
        currentUserId: "ig_arya",
        users: [
          {
            id: "ig_arya",
            username: "arya.cuts",
            displayName: "Arya Cuts",
            bio: "Edits, BTS chaos, and accidental oversharing.",
            avatarUrl: "/avatars/avatar-alex.jpg",
            followers: 189200,
            following: 511,
            verified: true,
          },
          {
            id: "ig_sam",
            username: "sam.loop",
            displayName: "Sam Loop",
            avatarUrl: "/avatars/avatar-priya.jpg",
            followers: 32100,
            following: 220,
          },
          {
            id: "ig_zoe",
            username: "zoe.render",
            displayName: "Zoe Render",
            avatarUrl: "/avatars/avatar-zoe.jpg",
            followers: 9410,
            following: 402,
          },
          {
            id: "ig_noah",
            username: "noah.offline",
            displayName: "Noah Offline",
            avatarUrl: "/avatars/avatar-ken.jpg",
            followers: 7310,
            following: 610,
          },
          {
            id: "ig_mira",
            username: "mira.story",
            displayName: "Mira Story",
            avatarUrl: "/avatars/avatar-jess.jpg",
            followers: 15200,
            following: 341,
          },
        ],
        follows: [
          { followerId: "ig_arya", followingId: "ig_sam" },
          { followerId: "ig_arya", followingId: "ig_zoe" },
          { followerId: "ig_arya", followingId: "ig_noah" },
          { followerId: "ig_arya", followingId: "ig_mira" },
        ],
        posts: [
          {
            id: "post_top_1",
            authorId: "ig_arya",
            imageUrl: "/media/founder-whiteboard.jpg",
            caption: "Color pass from yesterday. Finally looks expensive.",
            createdAt: baseTs - 220000,
            aspect: "portrait",
            likeCount: 9821,
            commentCount: 3,
          },
          {
            id: "post_top_2",
            authorId: "ig_arya",
            imageUrl: "/placeholders/media.svg",
            caption: "Lighting test before the edit sprint.",
            createdAt: baseTs - 180000,
            aspect: "portrait",
            likeCount: 7450,
            commentCount: 2,
          },
          {
            id: "post_reel_roast",
            authorId: "ig_arya",
            imageUrl: "/media/office-meme.png",
            caption: "How reels are made: tripod, panic, one overworked capcut timeline, done.",
            createdAt: baseTs - 120000,
            aspect: "portrait",
            likeCount: 12440,
            commentCount: 8,
          },
          {
            id: "post_bottom_4",
            authorId: "ig_arya",
            imageUrl: "/placeholders/media.svg",
            caption: "Posting this before I delete it out of fear.",
            createdAt: baseTs - 70000,
            aspect: "square",
            likeCount: 5321,
            commentCount: 1,
          },
        ],
        comments: [
          {
            id: "roast_seed_1",
            postId: "post_reel_roast",
            authorId: "ig_sam",
            text: "So the workflow is basically stress and a ring light?",
            createdAt: baseTs - 110000,
          },
          {
            id: "roast_seed_2",
            postId: "post_reel_roast",
            authorId: "ig_zoe",
            text: "This explains why every creator disappears for six business days.",
            createdAt: baseTs - 108000,
          },
          {
            id: "roast_seed_3",
            postId: "post_reel_roast",
            authorId: "ig_noah",
            text: "CapCut catching strays while carrying the whole industry.",
            createdAt: baseTs - 103000,
          },
          {
            id: "roast_seed_4",
            postId: "post_reel_roast",
            authorId: "ig_mira",
            text: "You forgot the part where the exported audio is wrong on the first try.",
            createdAt: baseTs - 98000,
          },
        ],
      })
      .view("app_instagram", "phone", { screen: "home" })
      .track(
        "app_instagram",
        (getOrder) => new InstagramTrackBuilder(30, "phone", getOrder),
        (ig) => {
          ig.at("1.0s").navigate("home", { postId: "post_top_2" });
          ig.at("2.2s").navigate("home", { postId: "post_reel_roast" });
          ig.at("3.1s").commentOnPost({
            id: "roast_live_1",
            postId: "post_reel_roast",
            authorId: "ig_sam",
            text: "This is less a tutorial and more a cry for help.",
            createdAt: baseTs + 6000,
          });
          ig.at("4.0s").commentOnPost({
            id: "roast_live_2",
            postId: "post_reel_roast",
            authorId: "ig_zoe",
            text: "You made 'behind the scenes' sound like a workplace incident report.",
            createdAt: baseTs + 12000,
          });
          ig.at("5.1s").commentOnPost({
            id: "roast_live_3",
            postId: "post_reel_roast",
            authorId: "ig_noah",
            text: "The tripod being step one is the most emotionally stable part of this reel.",
            createdAt: baseTs + 18000,
          });
          ig.at("6.0s").commentOnPost({
            id: "roast_live_4",
            postId: "post_reel_roast",
            authorId: "ig_mira",
            text: "Please pin this so future generations understand creator burnout.",
            createdAt: baseTs + 24000,
          });
          ig.at("7.6s").likePost("post_reel_roast", "ig_arya");
          ig.at("9.0s").navigate("home", { postId: "post_bottom_4" });
          ig.at("10.2s").navigate("home", { postId: "post_reel_roast" });
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.02, duration: "0.3s" });
        cam.at("2.25s").focus("feed_post_focus", { scale: 1.05, duration: "0.35s" });
        cam.at("3.2s").focus("feed_post_focus_comments", { scale: 1.1, duration: "0.35s" });
        cam.at("5.15s").focus("feed_post_focus_comments", { scale: 1.12, duration: "0.35s" });
        cam.at("9.05s").focus("feed_post_0", { scale: 1.05, duration: "0.35s" });
        cam.at("10.25s").focus("feed_post_focus_comments", { scale: 1.1, duration: "0.35s" });
      })
      .build();
  },
});
