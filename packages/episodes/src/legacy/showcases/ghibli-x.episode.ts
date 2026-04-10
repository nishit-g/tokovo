import { defineEpisode } from "@tokovo/episodes";
import { episode } from "@tokovo/dsl";
import { XTrackBuilder } from "@tokovo/apps-x";

export default defineEpisode({
    meta: {
        id: "ghibli-x",
        title: "Ghibli X",
        description: "X app with Studio Ghibli inspired theme - soft, warm, handcrafted feel",
        category: "showcase",
        tags: ["x", "ghibli", "theme"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 450,
        apps: ["app_x"],
    },
    build: () =>
        episode("ghibli-x", {
            fps: 30,
            duration: "15s",
            title: "Ghibli X",
        })
            .device("phone", "iphone16", {
                app: "app_x",
                os: {
                    time: new Date("2024-08-15T14:30:00"),
                    battery: 89,
                    network: "wifi",
                },
            })
            .snapshot("app_x", "phone", {
                users: [
                    {
                        id: "totoro",
                        name: "Totoro",
                        handle: "totoro",
                        bio: "Guardian of the forest. Found near camphor trees. 🌳",
                        followers: 88400,
                        following: 12,
                        verified: "blue",
                    },
                    {
                        id: "chihiro",
                        name: "Chihiro",
                        handle: "chihiro_spirited",
                        bio: "Working at the bathhouse. Miss my parents. 🐷➡️👨👩",
                        followers: 42300,
                        following: 89,
                        verified: null,
                    },
                    {
                        id: "haku",
                        name: "Haku",
                        handle: "kohaku_river",
                        bio: "Dragon. River spirit. Will remember your name.",
                        followers: 67800,
                        following: 3,
                        verified: "gold",
                    },
                    {
                        id: "kiki",
                        name: "Kiki",
                        handle: "kiki_delivery",
                        bio: "Witch in training. Delivery service now open! 🧹✨",
                        followers: 34500,
                        following: 156,
                        verified: null,
                    },
                ],
                follows: [
                    { followerId: "totoro", followingId: "chihiro" },
                    { followerId: "chihiro", followingId: "haku" },
                    { followerId: "kiki", followingId: "totoro" },
                ],
                currentUserId: "chihiro",
                tweets: [
                    {
                        id: "tw-1",
                        authorId: "totoro",
                        text: "The forest is quiet today. Can hear the acorns growing. 🌰",
                        createdAt: new Date("2024-08-15T14:25:00").getTime(),
                        viewCount: 12400,
                        shareCount: 340,
                        bookmarkCount: 890,
                    },
                    {
                        id: "tw-2",
                        authorId: "haku",
                        text: "Remember: forget your name and you lose yourself forever. Write it down somewhere safe.",
                        createdAt: new Date("2024-08-15T14:20:00").getTime(),
                        viewCount: 8900,
                        shareCount: 567,
                        bookmarkCount: 1200,
                    },
                    {
                        id: "tw-3",
                        authorId: "kiki",
                        text: "First solo delivery complete! Only crashed into the clock tower once 😅",
                        media: { type: "image", aspect: "wide" },
                        createdAt: new Date("2024-08-15T14:15:00").getTime(),
                        viewCount: 5600,
                        shareCount: 123,
                        bookmarkCount: 345,
                    },
                    {
                        id: "tw-4",
                        authorId: "chihiro",
                        text: "Day 3 at the bathhouse. The soot sprites are actually pretty helpful once you get to know them.",
                        createdAt: new Date("2024-08-15T14:10:00").getTime(),
                        viewCount: 3400,
                        shareCount: 89,
                        bookmarkCount: 234,
                    },
                ],
            })
            .view("app_x", "phone", { screen: "timeline" })
            .track(
                "app_x",
                (getOrder) => new XTrackBuilder(30, "phone", getOrder),
                (x) => {
                    // Set Ghibli theme immediately
                    x.at("0s").setThemeMode("ghibli");

                    // Engagement
                    x.at("2s").likeTweet("tw-1", "chihiro");
                    x.at("2.3s").bookmarkTweet("tw-2", "chihiro");

                    // Navigate to tweet detail
                    x.at("4s").navigate("tweet", { tweetId: "tw-1" });

                    // Add notifications
                    x.at("5.5s").addNotification({
                        id: "nt-1",
                        type: "like",
                        actorId: "totoro",
                        tweetId: "tw-4",
                    });
                    x.at("5.7s").addNotification({
                        id: "nt-2",
                        type: "follow",
                        actorId: "haku",
                    });

                    // Navigate to notifications
                    x.at("6.5s").navigate("notifications");

                    // Navigate to profile
                    x.at("8.5s").navigate("profile", { userId: "totoro" });

                    // Back to timeline
                    x.at("11s").navigate("timeline");

                    // Create DM thread
                    x.at("12s").createThread(["chihiro", "haku"], "dm-ghibli");
                    x.at("12.2s").sendMessage({
                        id: "msg-1",
                        threadId: "dm-ghibli",
                        senderId: "haku",
                        text: "Don't forget to eat. Here's your rice ball 🍙",
                    });
                    x.at("12.5s").sendMessage({
                        id: "msg-2",
                        threadId: "dm-ghibli",
                        senderId: "chihiro",
                        text: "Thank you Haku 💚",
                    });

                    // Navigate to messages
                    x.at("13s").navigate("messages");
                    x.at("14s").navigate("thread", { threadId: "dm-ghibli" });
                },
            )
            .camera((cam) => {
                cam.at("0s").focus("device", { scale: 1, duration: "0.5s" });
                cam.at("2s").focus("tweet_card", { scale: 1.08, duration: "0.5s" });
                cam.at("4s").focus("metrics_row", { scale: 1.05, duration: "0.5s" });
                cam.at("6.5s").focus("notifications_list", { scale: 1.03, duration: "0.5s" });
                cam.at("8.5s").focus("profile_header", { scale: 1.05, duration: "0.5s" });
                cam.at("11s").focus("device", { scale: 1, duration: "0.5s" });
                cam.at("13s").focus("dm_thread", { scale: 1.05, duration: "0.5s" });
            })
            .build(),
});
