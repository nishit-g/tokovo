/**
 * Multi-App Showcase Episode
 * 
 * Demonstrates Tokovo's power by combining multiple apps in one episode:
 * - WhatsApp messaging
 * - Twitter/X timeline
 * - Device notifications
 * - Camera cuts between devices
 * 
 * This showcases a realistic social media workflow.
 */

import { episode } from "../src";

export const multiAppShowcase = episode("multi-app-showcase", ep => {
    ep.config({
        fps: 30,
        title: "Multi-App Social Media Showcase",
    });

    // =========================================================================
    // DEVICE: Main Phone
    // =========================================================================
    ep.device("MainPhone", "iphone16", d => {
        d.owner("Alex");

        // Setup apps
        d.app("app_whatsapp");
        d.app("app_twitter");

        // Setup conversations
        d.conversation("dm_sarah", { name: "Sarah 💫", avatar: "sarah.png" });
        d.conversation("__twitter_timeline__", { name: "Timeline", type: "dm" });

        // =====================================================================
        // SCENE 1: Morning - WhatsApp Messages
        // =====================================================================
        d.beat("morning-whatsapp", b => {
            b.wait("1s");

            // Friend sends message
            b.receive("Sarah 💫", "Hey! Did you see that tweet from Elon? 🚀");
            b.wait("1.5s");

            // User typing and responding
            b.typing("me").for("1.5s");
            b.send("No! What happened?");
            b.wait("1s");

            // Friend responds with excitement
            b.receive("Sarah 💫", "He just announced something massive about AI!");
            b.wait("800ms");
            b.receive("Sarah 💫", "Check Twitter NOW 😱");
        });

        // =====================================================================
        // SCENE 2: Opens Twitter to Check
        // =====================================================================
        d.beat("open-twitter", b => {
            b.wait("1s");
            b.navigate("app_twitter", { screen: "timeline" });
        });

        d.beat("twitter-timeline", b => {
            // See the Elon tweet
            const elonTweet = b.tweetReceived(
                {
                    name: "Elon Musk",
                    handle: "elonmusk",
                    verified: "blue",
                    avatarUrl: "https://pbs.twimg.com/profile_images/elon.jpg"
                },
                "🚀 Announcing: Tesla will now accept Dogecoin for all vehicles. To the moon! 🌙",
                {
                    replyCount: 45000,
                    retweetCount: 125000,
                    likeCount: 890000,
                    viewCount: 45000000,
                    media: [{ url: "https://picsum.photos/800/450?random=1", type: "image" }]
                }
            );
            b.wait("2s");

            // User likes the tweet
            b.likeTweet(elonTweet);
            b.wait("500ms");

            // More tweets load
            b.tweetReceived(
                {
                    name: "CNBC",
                    handle: "CNBC",
                    verified: "gold"
                },
                "BREAKING: Tesla stock surges 15% after Elon Musk announcement",
                {
                    replyCount: 1200,
                    retweetCount: 8500,
                    likeCount: 23000,
                    viewCount: 1200000,
                }
            );
            b.wait("1.5s");

            // User retweets
            b.retweetTweet(elonTweet);
            b.wait("1s");
        });

        // =====================================================================
        // SCENE 3: Post Own Tweet
        // =====================================================================
        d.beat("user-tweets", b => {
            b.postTweet(
                "This is insane! 🚀 Dogecoin about to moon! @elonmusk just changed the game #DOGE #Tesla #Crypto",
                {
                    author: { name: "Alex", handle: "alexdev", verified: "blue" }
                }
            );
            b.wait("2s");
        });

        // =====================================================================
        // SCENE 4: Back to WhatsApp to Share
        // =====================================================================
        d.beat("back-to-whatsapp", b => {
            b.navigate("app_whatsapp", { conversationId: "dm_sarah" });
            b.wait("500ms");
        });

        d.beat("share-news", b => {
            // Tell friend about it
            b.typing("me").for("2s");
            b.send("OMG you were right! 🤯");
            b.wait("800ms");
            b.send("I just retweeted it and posted my own take");
            b.wait("1s");

            // Friend responds
            b.receive("Sarah 💫", "Haha told you! 😂");
            b.wait("500ms");
            b.receive("Sarah 💫", "I'm buying more DOGE right now 🐕");
            b.wait("1s");

            // Send an image
            b.sendImage("https://picsum.photos/600/400?random=2", {
                caption: "My portfolio right now 📈"
            });
            b.wait("1.5s");

            // Friend reacts
            b.receive("Sarah 💫", "NICE! 🔥🔥🔥");
        });

        // =====================================================================
        // SCENE 5: Notification Arrives
        // =====================================================================
        d.beat("twitter-notification", b => {
            b.wait("1s");
            // Twitter notification about likes
            b.notification("app_twitter", {
                title: "Your tweet is getting noticed!",
                body: "25 people liked your tweet about Dogecoin",
                mode: "headsup"
            });
            b.wait("2s");
        });

        // =====================================================================
        // SCENE 6: More WhatsApp Activity
        // =====================================================================
        d.beat("final-messages", b => {
            b.receive("Sarah 💫", "You're going viral! 🎉");
            b.wait("800ms");

            // Voice note
            b.receiveVoice("Sarah 💫", 5);
            b.wait("1s");

            // Final exchange
            b.send("This is the best day ever 🚀🌙");
            b.wait("1s");
        });
    });

    // =========================================================================
    // CAMERA: Cinematic Flow
    // =========================================================================
    ep.camera(c => {
        // Opening shot
        c.at("0s").cut("MainPhone");

        // Zoom in during Twitter reveal
        c.at("10s").zoom(1.2, { duration: "1s" });

        // Shake on notification
        c.at("25s").shake("MainPhone", { intensity: 0.5, duration: "300ms" });
    });
});

export default multiAppShowcase;
